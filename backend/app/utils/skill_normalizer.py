"""
Skill normalization utility.

Standardizes skill names by converting to lowercase, removing punctuation,
collapsing extra whitespace, and mapping common aliases to canonical forms.
The mapping configuration is initialized passively and can be customized.
"""

import re
import logging

logger = logging.getLogger(__name__)

# Default alias mapping for standardization
DEFAULT_ALIAS_MAPPING: dict[str, str] = {
    "python programming": "python",
    "py": "python",
    "amazon web services": "aws",
    "splunk enterprise": "splunk",
    "wireshark tool": "wireshark",
    "wireshark network analyzer": "wireshark",
    "burp suite professional": "burp suite",
    "metasploit framework": "metasploit",
    "kubernetes security": "k8s security",
    "firewall configuration": "firewall",
    "endpoint protection edr": "edr",
}


class SkillNormalizer:
    """Utility to normalize and canonicalize skill names."""

    def __init__(self, alias_mapping: dict[str, str] | None = None) -> None:
        """Initialize the normalizer with an optional custom alias mapping.

        Args:
            alias_mapping: Dict mapping alias strings to canonical skill names.
                           Defaults to DEFAULT_ALIAS_MAPPING.
        """
        self.alias_mapping = alias_mapping if alias_mapping is not None else DEFAULT_ALIAS_MAPPING

    def normalize(self, skill_name: str) -> str:
        """Normalize a skill name into a standardized canonical string.

        Converts to lowercase, removes punctuation (except + and # for names
        like C++ or C#), collapses whitespace, and resolves aliases.

        Args:
            skill_name: The raw skill name.

        Returns:
            The normalized canonical skill name.
        """
        if not skill_name:
            return ""

        # Convert to lowercase
        normalized = skill_name.lower().strip()

        # Remove punctuation where appropriate (keep +, #, -, and / for technology names)
        # e.g., "wireshark-tool" -> "wireshark tool", "splunk!" -> "splunk"
        normalized = re.sub(r"[^\w\s\+#\-\/]", " ", normalized)

        # Collapse duplicate spaces
        normalized = " ".join(normalized.split())

        # Map to canonical representation if alias exists
        canonical = self.alias_mapping.get(normalized, normalized)

        if canonical != skill_name:
            logger.debug("Normalized skill name | raw=%r | canonical=%r", skill_name, canonical)

        return canonical


# Global singleton instance for common usage
_normalizer = SkillNormalizer()


def normalize_skill(skill_name: str) -> str:
    """Helper function to normalize a skill name using the default normalizer instance.

    Args:
        skill_name: The raw skill name.

    Returns:
        The normalized canonical skill name.
    """
    return _normalizer.normalize(skill_name)
