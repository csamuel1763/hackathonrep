"""
Prompt templates for OpenRouter resume parsing.

Specifies the precise structured JSON format for OpenRouter's response, matching
the updated flat Pydantic schemas.
"""

# Allowed skill categories for cybersecurity mapping
CYBERSECURITY_CATEGORIES = [
    "Network Security",
    "SIEM & Log Analysis",
    "Threat Intelligence",
    "Incident Response",
    "Penetration Testing",
    "Vulnerability Management",
    "Cloud Security",
    "Identity & Access Management",
    "Cryptography",
    "Compliance & GRC",
    "Malware Analysis",
    "Digital Forensics",
    "Operating Systems",
    "Programming Languages",
    "Scripting & Automation",
    "Other",
]

_RESUME_PARSE_TEMPLATE = """
You are an expert resume parser specializing in cybersecurity professionals.
Your task is to analyze the resume text below and extract structured information.

Return a single JSON object that exactly matches the following schema — no extra keys, no markdown wrapper, no conversational explanation:

{{
  "name": "Candidate's full name or empty string if not found",
  "email": "Candidate's email address or empty string if not found",
  "phone": "Candidate's phone number or empty string if not found",
  "summary": "Professional summary or profile overview or empty string if not found",
  "skills": [
    {{
      "name": "Normalised name of the skill",
      "category": "One of the allowed categories listed below",
      "confidence": 1.0
    }}
  ],
  "experience": [
    {{
      "title": "Job title or role",
      "company": "Company name",
      "duration": "Duration of employment (e.g., 'Jan 2021 - Dec 2023')",
      "description": "Concise overview of duties and achievements"
    }}
  ],
  "education": [
    {{
      "degree": "Degree name or qualification",
      "institution": "School or university name",
      "year": "Graduation year or duration (e.g., '2020')"
    }}
  ],
  "certifications": [
    {{
      "name": "Full name of the certification, e.g., 'Certified Information Systems Security Professional'",
      "issuer": "Issuing organization or authority, e.g., 'ISC2'"
    }}
  ]
}}

Allowed skill categories (map each skill to the most appropriate one):
{categories}

Rules:
1. Extract all technical and domain skills mentioned.
2. If a skill does not fit any specific cybersecurity category, classify it as "Other".
3. Use empty strings for any text field you cannot determine — do not guess or hallucinate.
4. Ensure the output is strictly valid JSON conforming to the schema.

RESUME TEXT:
---
{raw_text}
---
""".strip()


def build_resume_parse_prompt(raw_text: str) -> str:
    """Build the OpenRouter prompt for structured resume parsing.

    Args:
        raw_text: Plain text extracted from the resume file.

    Returns:
        The formatted prompt string.
    """
    categories_block = "\n".join(f"- {c}" for c in CYBERSECURITY_CATEGORIES)
    return _RESUME_PARSE_TEMPLATE.format(
        categories=categories_block,
        raw_text=raw_text,
    )
