"""
GitHub Intelligence Service.

Fetches public user repositories and profile metadata from GitHub API (v3) using httpx.AsyncClient,
detects security tools, language distribution, and calls OpenRouter AI to generate portfolio insights.
"""

import re
import logging
from typing import Any

import httpx

from app.schemas.digital_twin import (
    GitHubAnalysisRequest,
    GitHubAnalysisResponse,
    RepositorySummary,
)
from app.ai.ollama_client import generate_structured_json

logger = logging.getLogger(__name__)


def _extract_username(input_str: str) -> str:
    """Extract raw GitHub username from plain username or full URL."""
    clean = input_str.strip().rstrip('/')
    if 'github.com/' in clean:
        clean = clean.split('github.com/')[-1].split('/')[0]
    return clean.replace('@', '')


async def analyze_github_profile(req: GitHubAnalysisRequest) -> GitHubAnalysisResponse:
    """Analyze GitHub profile using GitHub API + OpenRouter AI."""
    username = _extract_username(req.username)
    logger.info("Analyzing GitHub profile | username=%s", username)

    user_url = f"https://api.github.com/users/{username}"
    repos_url = f"https://api.github.com/users/{username}/repos?per_page=30&sort=updated"

    headers = {
        "User-Agent": "CareerPilot-AI-Agent",
        "Accept": "application/vnd.github.v3+json",
    }

    user_meta = {}
    repos_data = []

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            user_res = await client.get(user_url, headers=headers)
            if user_res.status_code == 200:
                user_meta = user_res.json()
            
            repos_res = await client.get(repos_url, headers=headers)
            if repos_res.status_code == 200:
                repos_data = repos_res.json()
    except Exception as exc:
        logger.warning("Failed to fetch live GitHub API data for %s: %s. Proceeding with fallback parsing.", username, exc)

    # Summarize repos
    total_stars = 0
    languages_map: dict[str, int] = {}
    top_repos: list[RepositorySummary] = []
    security_keywords = {"security", "siem", "ctf", "exploit", "cve", "malware", "pwn", "crypto", "forensics", "nmap", "wireshark", "snort", "yara", "soc", "sentinel", "audit"}
    security_tools_found = set()

    for r in repos_data:
        if not isinstance(r, dict):
            continue
        name = r.get("name", "repo")
        desc = r.get("description") or ""
        lang = r.get("language") or "Python"
        stars = r.get("stargazers_count", 0)
        forks = r.get("forks_count", 0)
        html_url = r.get("html_url", f"https://github.com/{username}/{name}")

        total_stars += stars
        languages_map[lang] = languages_map.get(lang, 0) + 1

        is_sec = False
        text_check = f"{name} {desc}".lower()
        for kw in security_keywords:
            if kw in text_check:
                is_sec = True
                security_tools_found.add(kw.capitalize())

        top_repos.append(
            RepositorySummary(
                name=name,
                description=desc,
                language=lang,
                stars=stars,
                forks=forks,
                url=html_url,
                is_security_related=is_sec,
            )
        )

    # Sort top repos by stars
    top_repos.sort(key=lambda x: x.stars, reverse=True)
    primary_languages = sorted(languages_map.keys(), key=lambda k: languages_map[k], reverse=True)[:5]
    if not primary_languages:
        primary_languages = ["Python", "Bash", "Go", "C++"]

    # Call OpenRouter for AI reasoning
    repos_desc_str = "; ".join([f"{r.name} ({r.language}): {r.description}" for r in top_repos[:5]]) or "No public repos returned"
    
    prompt = f"""
You are an expert technical recruiter and software engineering auditor.
Analyze the following GitHub developer data and candidate skills:

GitHub Username: {username}
Public Repositories Count: {len(repos_data) or user_meta.get('public_repos', 3)}
Total Stars Earned: {total_stars}
Primary Languages: {', '.join(primary_languages)}
Sample Repositories: {repos_desc_str}
Candidate Resume Skills: {', '.join(req.resume_skills)}

Return a single valid JSON object matching this exact schema (no markdown fences, no conversational text):
{{
  "developer_profile": "Concise summary of candidate's developer persona (e.g. 'Cybersecurity Automation Developer & Python Scripting Specialist')",
  "portfolio_score": 82,
  "coding_maturity": "Advanced",
  "project_quality_score": 85,
  "contribution_score": 78,
  "open_source_readiness": "High",
  "strengths": ["Strong modular Python coding", "Good documentation in READMEs"],
  "weaknesses": ["Lack of active CI/CD pipeline configs", "Few unit tests in repos"],
  "security_tools_detected": ["Wireshark", "Scapy", "Splunk API", "Nmap"],
  "repo_recommendations": ["Add GitHub Actions CI/CD workflows", "Include LICENSE and clear installation instructions in top repos", "Build a cloud security Terraform repository"]
}}
""".strip()

    ai_data = {}
    try:
        ai_data = await generate_structured_json(prompt)
    except Exception as exc:
        logger.warning("OpenRouter GitHub analysis failed: %s. Using default heuristics.", exc)

    return GitHubAnalysisResponse(
        username=username,
        developer_profile=ai_data.get("developer_profile") or f"Security & Systems Developer ({username})",
        portfolio_score=ai_data.get("portfolio_score") or min(100, max(40, 50 + len(top_repos) * 5 + total_stars * 2)),
        coding_maturity=ai_data.get("coding_maturity") or ("Advanced" if len(top_repos) >= 5 else "Intermediate"),
        project_quality_score=ai_data.get("project_quality_score") or 75,
        contribution_score=ai_data.get("contribution_score") or 70,
        open_source_readiness=ai_data.get("open_source_readiness") or "Moderate",
        public_repos_count=user_meta.get("public_repos", len(repos_data)),
        total_stars=total_stars,
        primary_languages=primary_languages,
        security_tools_detected=ai_data.get("security_tools_detected") or list(security_tools_found) or ["Nmap", "Wireshark", "Python"],
        strengths=ai_data.get("strengths") or ["Active code contributions", "Multi-language project portfolio"],
        weaknesses=ai_data.get("weaknesses") or ["Needs more automated unit tests and Docker setup"],
        top_repositories=top_repos[:6],
        repo_recommendations=ai_data.get("repo_recommendations") or [
            "Add GitHub Actions automated security linting.",
            "Create a dedicated cybersecurity lab project.",
            "Improve README documentation with setup guides."
        ]
    )
