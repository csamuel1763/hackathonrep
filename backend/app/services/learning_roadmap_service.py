"""
Personalized Learning Roadmap Service.

Generates a deterministic dependency-based learning path for a candidate
targeting a specific cybersecurity role, resolving missing skills and prerequisites.
"""

import math
import logging

from app.services.skill_gap_service import compute_skill_gap
from app.utils.taxonomy_loader import load_roles_taxonomy
from app.utils.exceptions import NotFoundError
from app.schemas.learning_roadmap import LearningRoadmapResponse, RoadmapStep

logger = logging.getLogger(__name__)

# Standardized prerequisite maps for taxonomy role prerequisites
PREREQ_TOPIC_MAPS = {
    "linux": "Linux Fundamentals",
    "networking": "Networking Basics",
    "security": "Security Fundamentals",
    "windows": "Windows Operating System Basics",
}

# Skill dependency sequence mappings for all taxonomy skills
SKILL_DEPENDENCY_SEQUENCES = {
    "splunk": ["Linux Fundamentals", "Networking Basics", "TCP/IP", "Log Analysis", "SIEM Fundamentals", "Splunk"],
    "wireshark": ["Networking Basics", "TCP/IP", "Packet Analysis", "Wireshark"],
    "log analysis": ["Linux Fundamentals", "Log Generation", "Log Analysis Tools", "Log Analysis"],
    "siem integration": ["Networking Basics", "SIEM Fundamentals", "SIEM Architecture", "SIEM Integration"],
    "tcp/ip networking": ["Networking Basics", "TCP/IP Protocol Suite", "Routing & Switching", "TCP/IP Networking"],
    "metasploit": ["Networking Basics", "Linux Fundamentals", "Exploitation Concepts", "Metasploit Framework", "Metasploit"],
    "burp suite": ["Web Technologies (HTTP/HTML)", "OWASP Top 10", "Web Proxy Fundamentals", "Burp Suite"],
    "nmap": ["Networking Basics", "Ports & Protocols", "Host Discovery & Port Scanning", "Nmap"],
    "vulnerability scanning": ["Networking Basics", "Vulnerability Assessment Fundamentals", "Vulnerability Scanning Tools", "Vulnerability Scanning"],
    "web application security": ["Web Proxy Fundamentals", "OWASP Top 10", "Web Application Penetration Testing", "Web Application Security"],
    "incident response": ["Networking Basics", "Incident Response Lifecycle", "Containment & Remediation", "Incident Response"],
    "forensic image analysis": ["File System Architectures", "Forensic Imaging Techniques", "Image Analysis Tools", "Forensic Image Analysis"],
    "intrusion detection": ["Networking Basics", "IDS/IPS Concepts", "Signature Writing", "Intrusion Detection"],
    "threat hunting": ["Threat Intelligence Lifecycle", "IOC Identification", "Threat Hunting Techniques", "Threat Hunting"],
    "malware analysis": ["Assembly Language Basics", "Reverse Engineering Concepts", "Static & Dynamic Analysis", "Malware Analysis"],
    "python": ["Programming Logic", "Data Structures", "Python Basics", "Python Scripting", "Python"],
    "aws security": ["Cloud Computing Basics", "AWS Fundamentals", "IAM in AWS", "AWS Security Best Practices", "AWS Security"],
    "iam policies": ["Identity & Access Management Fundamentals", "Access Control Models", "IAM Policy Writing", "IAM Policies"],
    "cryptography": ["Math & Modular Arithmetic", "Symmetric & Asymmetric Encryption", "PKI & Digital Certificates", "Cryptography"],
    "compliance": ["Information Security Governance", "Risk Management Frameworks", "Regulatory Compliance (GDPR/HIPAA/PCI)", "Compliance"],
    "firewall configuration": ["Networking Basics", "TCP/IP", "Firewall Basics", "Firewall Configuration"],
    "firewall": ["Networking Basics", "TCP/IP", "Firewall Basics", "Firewall Configuration"],
}

# General fallback dependency sequence mapping based on skill category
CATEGORY_DEPENDENCY_FALLBACKS = {
    "network security": ["Networking Basics", "TCP/IP", "Network Security Fundamentals"],
    "siem & log analysis": ["Linux Fundamentals", "Log Analysis", "SIEM Fundamentals"],
    "penetration testing": ["Networking Basics", "Exploitation Concepts", "Security Auditing"],
    "identity & access management": ["Access Control Models", "Identity Management Basics"],
    "compliance & grc": ["Risk Management", "Compliance Basics"],
}

# Complexity difficulty mapping for chronological sequence sorting (Levels 1 to 5)
LEVEL_MAP = {
    # Level 1: Core Fundamentals
    "linux basics": 1,
    "linux fundamentals": 1,
    "networking basics": 1,
    "web technologies (http/html)": 1,
    "programming logic": 1,
    "cloud computing basics": 1,
    "identity & access management fundamentals": 1,
    "math & modular arithmetic": 1,
    "information security governance": 1,
    "security fundamentals": 1,
    "windows operating system basics": 1,
    # Level 2: Concept Foundations
    "tcp/ip": 2,
    "tcp/ip protocol suite": 2,
    "log generation": 2,
    "owasp top 10": 2,
    "vulnerability assessment fundamentals": 2,
    "ids/ips concepts": 2,
    "threat intelligence lifecycle": 2,
    "assembly language basics": 2,
    "aws fundamentals": 2,
    "access control models": 2,
    "symmetric & asymmetric encryption": 2,
    "risk management frameworks": 2,
    "file system architectures": 2,
    "firewall basics": 2,
    "risk management": 2,
    "compliance basics": 2,
    # Level 3: Intermediate Methods
    "log analysis tools": 3,
    "routing & switching": 3,
    "exploitation concepts": 3,
    "web proxy fundamentals": 3,
    "ports & protocols": 3,
    "vulnerability scanning tools": 3,
    "incident response lifecycle": 3,
    "forensic imaging techniques": 3,
    "signature writing": 3,
    "ioc identification": 3,
    "reverse engineering concepts": 3,
    "python basics": 3,
    "iam in aws": 3,
    "iam policy writing": 3,
    "pki & digital certificates": 3,
    "regulatory compliance (gdpr/hipaa/pci)": 3,
    "firewalls": 3,
    "network security fundamentals": 3,
    "identity management basics": 3,
    "security auditing": 3,
    # Level 4: Advanced Systems & Tools
    "siem fundamentals": 4,
    "siem architecture": 4,
    "metasploit framework": 4,
    "web application penetration testing": 4,
    "host discovery & port scanning": 4,
    "containment & remediation": 4,
    "image analysis tools": 4,
    "threat hunting techniques": 4,
    "static & dynamic analysis": 4,
    "python scripting": 4,
    "aws security best practices": 4,
}


def _get_topic_level(topic: str) -> int:
    """Return the complexity difficulty score level for sorting."""
    return LEVEL_MAP.get(topic.lower().strip(), 5)


def generate_roadmap(detected_skills: list[str], role_id: str) -> LearningRoadmapResponse:
    """Generate a learning path for missing target role skills.

    Args:
        detected_skills: Candidate's current skills.
        role_id: Target role identifier.

    Returns:
        LearningRoadmapResponse containing total steps, weeks, and timeline details.
    """
    logger.info("Generating learning roadmap | role_id=%s", role_id)

    # 1. Load taxonomy roles list
    raw_roles = load_roles_taxonomy()
    target_role = None
    for role in raw_roles:
        if role.get("id") == role_id:
            target_role = role
            break

    if not target_role:
        logger.warning("Target role not found for roadmap generation | id=%s", role_id)
        raise NotFoundError(f"Cybersecurity role with ID '{role_id}' was not found in the database.")

    # 2. Get missing skills using Skill Gap Analysis
    skill_gap = compute_skill_gap(detected_skills, role_id)
    missing_skills = skill_gap.missing_skills

    # 3. Process taxonomy prerequisites
    prereq_topics = set()
    raw_prereqs = target_role.get("prerequisites", [])
    for prereq in raw_prereqs:
        prereq_lower = prereq.lower()
        matched_mapped = False
        for keyword, clean_topic in PREREQ_TOPIC_MAPS.items():
            if keyword in prereq_lower:
                prereq_topics.add(clean_topic)
                matched_mapped = True
        if not matched_mapped and prereq.strip():
            # Fall back to using the raw prerequisite string if not matching mapping keywords
            prereq_topics.add(prereq.strip())

    # 4. Process missing skills dependencies
    roadmap_topics = set(prereq_topics)
    required_skills_list = target_role.get("required_skills", [])

    for missing in missing_skills:
        missing_lower = missing.lower().strip()

        # Check if missing skill has mapped sequence
        if missing_lower in SKILL_DEPENDENCY_SEQUENCES:
            roadmap_topics.update(SKILL_DEPENDENCY_SEQUENCES[missing_lower])
        else:
            # Find category of required skill for custom fallback
            category = ""
            for req in required_skills_list:
                if req.get("name", "").strip().lower() == missing_lower:
                    category = req.get("category", "").strip().lower()
                    break

            fallback = CATEGORY_DEPENDENCY_FALLBACKS.get(category, ["Security Fundamentals"])
            roadmap_topics.update(fallback)
            roadmap_topics.add(missing)

    # 5. Sort topics by complexity levels first, and alphabetically second
    sorted_topics = sorted(list(roadmap_topics), key=lambda x: (_get_topic_level(x), x.lower()))

    total_steps = len(sorted_topics)

    # 6. Distribute topics to weeks chronologically (2 topics per week)
    topics_per_week = 2
    roadmap_steps = []
    estimated_duration_weeks = max(1, math.ceil(total_steps / topics_per_week))

    for w in range(1, estimated_duration_weeks + 1):
        start_idx = (w - 1) * topics_per_week
        end_idx = min(start_idx + topics_per_week, total_steps)
        if start_idx < total_steps:
            roadmap_steps.append(
                RoadmapStep(
                    week=w,
                    topics=sorted_topics[start_idx:end_idx]
                )
            )

    # In case there are no missing skills or prerequisites, generate a default success roadmap step
    if not roadmap_steps:
        roadmap_steps.append(
            RoadmapStep(
                week=1,
                topics=["Ready for Role (No missing skills)"]
            )
        )
        estimated_duration_weeks = 1
        total_steps = 1

    logger.info(
        "Roadmap generated | steps=%d | weeks=%d",
        total_steps,
        estimated_duration_weeks,
    )

    return LearningRoadmapResponse(
        estimated_duration_weeks=estimated_duration_weeks,
        total_steps=total_steps,
        roadmap=roadmap_steps,
    )
