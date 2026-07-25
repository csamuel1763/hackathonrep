import time
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def run_tests():
    print("==================================================")
    print("  CareerPilot AI - Direct Access E2E Verification")
    print("==================================================")
    
    results = []

    # 1. Health Check
    t0 = time.time()
    r = requests.get(f"{BASE_URL}/resume/health")
    dt = time.time() - t0
    results.append(("GET /resume/health", r.status_code, f"{dt:.3f}s", r.json()))

    # 2. Get Roles
    t0 = time.time()
    r = requests.get(f"{BASE_URL}/roles")
    dt = time.time() - t0
    roles_count = len(r.json()) if r.status_code == 200 else 0
    results.append(("GET /roles", r.status_code, f"{dt:.3f}s", f"Found {roles_count} roles"))

    # 3. AI Mentor Chat (Prompts Test)
    mentor_prompts = [
        "How do I become a SOC Analyst?",
        "Explain Zero Trust."
    ]
    for prompt in mentor_prompts:
        t0 = time.time()
        m_payload = {
            "message": prompt,
            "role_id": "security-analyst",
            "skills": ["SIEM", "Python", "Splunk"],
            "name": "Samuel Godson"
        }
        r = requests.post(f"{BASE_URL}/mentor/chat", json=m_payload)
        dt = time.time() - t0
        res_json = r.json() if r.status_code == 200 else {}
        answer_len = len(res_json.get("answer", ""))
        results.append((f"POST /mentor/chat ('{prompt[:22]}...')", r.status_code, f"{dt:.3f}s", f"Success: {res_json.get('success', True)}, Reply Length: {answer_len} chars"))

    # 4. Resume Parse (OpenRouter AI call)
    t0 = time.time()
    with open("test_resume.pdf", "rb") as f:
        r = requests.post(f"{BASE_URL}/resume/parse", files={"file": ("test_resume.pdf", f, "application/pdf")})
    dt = time.time() - t0
    parsed_data = r.json() if r.status_code == 200 else {}
    results.append(("POST /resume/parse (OpenRouter)", r.status_code, f"{dt:.3f}s", f"Candidate: {parsed_data.get('name')}, Skills: {len(parsed_data.get('skills', []))}"))

    # 5. Job Description Matcher
    t0 = time.time()
    jd_payload = {
        "job_description": "We are seeking a SOC Analyst skilled in SIEM, Splunk, Python, and Incident Response.",
        "name": "Samuel Godson",
        "skills": ["Network Security", "SIEM", "Splunk", "Python"]
    }
    r = requests.post(f"{BASE_URL}/job-match/analyze", json=jd_payload)
    dt = time.time() - t0
    results.append(("POST /job-match/analyze", r.status_code, f"{dt:.3f}s", f"Match: {r.json().get('overall_score')}% ({r.json().get('match_level')})"))

    # 6. Digital Twin Profile Generation
    t0 = time.time()
    twin_payload = {
        "name": "Samuel Godson",
        "email": "samuel@example.com",
        "skills": ["Network Security", "SIEM", "Splunk", "Python", "Wireshark"],
        "exp_titles": ["Cybersecurity Specialist"],
        "cert_names": ["CompTIA Security+"],
        "github_username": "torvalds",
        "linkedin_url": "linkedin.com/in/samuelgodson"
    }
    r = requests.post(f"{BASE_URL}/digital-twin/generate", json=twin_payload)
    dt = time.time() - t0
    tw_res = r.json() if r.status_code == 200 else {}
    results.append(("POST /digital-twin/generate", r.status_code, f"{dt:.3f}s", f"Persona: {tw_res.get('career_persona')}, Ranked Roles: {len(tw_res.get('career_rankings', []))}"))

    # 7. GitHub Profile Intelligence Analysis
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/github/analyze", json={"username": "torvalds", "resume_skills": ["C", "Linux", "Git"]})
    dt = time.time() - t0
    gh_res = r.json() if r.status_code == 200 else {}
    results.append(("POST /github/analyze", r.status_code, f"{dt:.3f}s", f"Portfolio Score: {gh_res.get('portfolio_score')}/100, Repos: {len(gh_res.get('top_repositories', []))}"))

    # 8. LinkedIn Profile Intelligence Analysis
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/linkedin/analyze", json={"linkedin_url": "linkedin.com/in/samuelgodson", "resume_skills": ["SIEM", "Python"]})
    dt = time.time() - t0
    li_res = r.json() if r.status_code == 200 else {}
    results.append(("POST /linkedin/analyze", r.status_code, f"{dt:.3f}s", f"Branding Score: {li_res.get('branding_score')}/100"))

    # 9. Cross Profile Consistency Validation
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/cross-profile/validate", json={"github_username": "torvalds", "linkedin_url": "linkedin.com/in/samuelgodson"})
    dt = time.time() - t0
    cp_res = r.json() if r.status_code == 200 else {}
    results.append(("POST /cross-profile/validate", r.status_code, f"{dt:.3f}s", f"Consistency Score: {cp_res.get('consistency_score')}%"))

    # 10. Career Marketplace Search & Live Job Match
    t0 = time.time()
    mkt_payload = {
        "candidate_skills": ["Network Security", "SIEM", "Splunk", "Python", "Wireshark"],
        "candidate_certs": ["CompTIA Security+"],
        "work_type_filter": "All"
    }
    r = requests.post(f"{BASE_URL}/marketplace/search", json=mkt_payload)
    dt = time.time() - t0
    mkt_res = r.json() if r.status_code == 200 else {}
    results.append(("POST /marketplace/search", r.status_code, f"{dt:.3f}s", f"Matched Jobs: {mkt_res.get('total_jobs')}, Heatmap Skills: {len(mkt_res.get('skill_demand_heatmap', []))}"))

    # 11. Mission Control Briefing & Strategic Dashboard
    t0 = time.time()
    mc_payload = {
        "candidate_name": "Samuel Godson",
        "skills": ["Network Security", "SIEM", "Splunk", "Python", "Wireshark"],
        "certifications": ["CompTIA Security+"],
        "github_username": "torvalds",
        "linkedin_url": "linkedin.com/in/samuelgodson"
    }
    r = requests.post(f"{BASE_URL}/mission-control/briefing", json=mc_payload)
    dt = time.time() - t0
    mc_res = r.json() if r.status_code == 200 else {}
    results.append(("POST /mission-control/briefing", r.status_code, f"{dt:.3f}s", f"Health: {mc_res.get('career_health_score')}/100, Recruiter Vis: {mc_res.get('recruiter_visibility_score')}/100, Tasks: {len(mc_res.get('mission_tasks', []))}"))

    # 12. AI Career Copilot State & Notifications
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/copilot/state", json={"candidate_name": "Samuel Godson", "skills": ["SIEM", "Python"]})
    dt = time.time() - t0
    cop_res = r.json() if r.status_code == 200 else {}
    results.append(("POST /copilot/state", r.status_code, f"{dt:.3f}s", f"Notifs: {len(cop_res.get('notifications', []))}, Daily Missions: {len(cop_res.get('daily_top_missions', []))}"))

    # 13. What-If Scenario Simulation
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/copilot/what-if", json={"action_type": "learn_skill", "action_value": "Kubernetes"})
    dt = time.time() - t0
    wif_res = r.json() if r.status_code == 200 else {}
    results.append(("POST /copilot/what-if", r.status_code, f"{dt:.3f}s", f"Target: {wif_res.get('action_value')}, Health Boost: +{wif_res.get('health_delta')}%, Salary Boost: +${wif_res.get('salary_delta')}"))

    print("\n--- RESULTS ---")
    all_passed = True
    for endpoint, status, latency, info in results:
        passed = status in (200, 201)
        if not passed:
            all_passed = False
        mark = "PASS" if passed else "FAIL"
        print(f"[{mark:<4}] {endpoint:<45} | Status: {status} | Latency: {latency:<7} | Details: {info}")

    print("\nOverall Status:", "SUCCESS (All Endpoints Passed)" if all_passed else "FAILURE (Some Endpoints Failed)")

if __name__ == "__main__":
    run_tests()
