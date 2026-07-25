export interface RequiredSkill {
  name: string;
  category: string;
  importance: string;
}

export interface CybersecurityRole {
  id: string;
  name: string;
  description: string;
  required_skills: RequiredSkill[];
  categories: string[];
  prerequisites: string[];
}
