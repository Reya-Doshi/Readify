export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  theme: 'dark' | 'light';
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  project_name: string;
  description: string;
  tech_stack: string[]; // Stored as JSON array
  features: string[]; // Stored as JSON array
  readme_content: string;
  template_style: 'minimal' | 'open-source' | 'professional' | 'startup' | 'enterprise';
  is_favorite: boolean;
  installation?: string;
  usage?: string;
  advanced_options?: {
    includeBadges: boolean;
    includeInstallation: boolean;
    includeApiDocs: boolean;
    includeArchitecture: boolean;
    includeContribution: boolean;
    includeLicense: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  settings: {
    style: Project['template_style'];
    techStack: string[];
    features: string[];
    advanced: Project['advanced_options'];
  };
  created_at: string;
}
