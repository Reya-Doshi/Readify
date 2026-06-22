export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  theme: 'dark' | 'light';
  created_at: string;
}

export interface ReadmeProject {
  id: string;
  project_name: string;
  description: string | null;
  tech_stack: string[] | null;
  features: string[] | null;
  generated_readme: string | null;
  created_at: string;
}
