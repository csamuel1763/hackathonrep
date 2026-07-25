"""
Centralized Skill Matcher.

Compares candidate and required skills using case-insensitive normalization,
an alias concept lookup dictionary, exact matching, and word boundary substring matching.
"""

import re

# Centralized alias mapping dictionary.
# Keys are canonical terms, values are lists of accepted alias strings.
ALIAS_MAP = {
    "tcp/ip networking": [
        "network security",
        "tcp ip",
        "tcp/ip",
        "networking",
    ],
    "siem integration": [
        "siem",
        "security incident event management",
        "security information and event management",
        "security information event management",
    ],
    "endpoint protection (edr)": [
        "edr",
        "endpoint detection and response",
    ],
    "iam policies": [
        "iam",
        "identity access management",
        "identity and access management",
    ],
    "tenable nessus": [
        "nessus",
    ],
    "digital forensics (dfir)": [
        "dfir",
        "digital forensics",
        "digital forensics and incident response",
    ],
    "incident response": [
        "incident handling",
    ],
    "ethical hacking": [
        "penetration testing",
        "pen testing",
        "pentesting",
    ],
}


def normalize_for_match(text: str) -> str:
    """Normalize skill text to standard comparison format.

    - Convert to lowercase
    - Replace hyphens with spaces (e.g., tcp-ip -> tcp ip)
    - Remove punctuation
    - Collapse extra whitespaces
    """
    if not text:
        return ""
    text = text.lower().strip()
    text = text.replace("-", " ")
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# Build bidirectional lookup index mapping every normalized alias to its canonical concept key.
def _build_lookup_index() -> dict[str, str]:
    lookup: dict[str, str] = {}
    for canonical, aliases in ALIAS_MAP.items():
        norm_canonical = normalize_for_match(canonical)
        lookup[norm_canonical] = norm_canonical
        for alias in aliases:
            norm_alias = normalize_for_match(alias)
            lookup[norm_alias] = norm_canonical
    return lookup


_LOOKUP_INDEX = _build_lookup_index()


def is_skill_match(candidate_skill: str, required_skill: str) -> bool:
    """Determine if a candidate skill matches a required skill.

    Comparison workflow:
    1. Normalize both strings.
    2. Check exact match.
    3. Check alias lookup mapping.
    4. Check substring boundary match (using word boundary \b to prevent false positives).
    5. Return deterministic results.
    """
    # 1. Normalize both strings
    norm_candidate = normalize_for_match(candidate_skill)
    norm_required = normalize_for_match(required_skill)

    if not norm_candidate or not norm_required:
        return False

    # 2. Check exact match
    if norm_candidate == norm_required:
        return True

    # 3. Check alias mapping
    cand_canonical = _LOOKUP_INDEX.get(norm_candidate)
    req_canonical = _LOOKUP_INDEX.get(norm_required)
    if cand_canonical and req_canonical and cand_canonical == req_canonical:
        return True

    # 4. Check substring match only when safe (using word boundaries)
    cand_escaped = re.escape(norm_candidate)
    req_escaped = re.escape(norm_required)
    if re.search(rf"\b{cand_escaped}\b", norm_required) or re.search(rf"\b{req_escaped}\b", norm_candidate):
        return True

    return False
