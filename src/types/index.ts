export interface Experience {
  id: string
  job: string
  company: string
  activity: string | null
  from_date: string
  to_date: string
  location: string | null
  created_at: string
}

export interface LanguageType {
  id: string
  language: string
  level: string
  issued_by: string
  created_at: string
}

export interface Skill {
  id: string
  name: string
  level: number
  created_at: string
}

export interface Education {
  id: string
  field: string
  edu_place: string
  from_date: string
  to_date: string
  what_learnt: string
  certification: string | null
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  technologies: string | null
  cover_image: string | null
  url: string | null
  created_at: string
}

export interface PublicProfile {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  job_title: string | null
  summary: string | null
  address: string | null
  phone_number: string | null
  linkedin_url: string | null
  profile_photo: string | null
  profile_thumbnail: string | null
  experiences: Experience[]
  languages: LanguageType[]
  skills: Skill[]
  educations: Education[]
  projects: Project[]
}

export interface ProjectWithOwner extends Project {
  owner: {
    id: string
    username: string
    first_name: string
    last_name: string
    job_title: string | null
    profile_thumbnail: string | null
  }
}

export interface SearchUser {
  id: string
  username: string
  first_name: string
  last_name: string
  job_title: string | null
  summary: string | null
  profile_photo: string | null
  profile_thumbnail: string | null
  address: string | null
  matched_skills: { id: string; name: string; level: number }[]
}

export interface SearchProject {
  id: string
  name: string
  description: string | null
  technologies: string | null
  cover_image: string | null
  url: string | null
  created_at: string
  owner: {
    id: string
    username: string
    first_name: string
    last_name: string
    profile_photo: string | null
    profile_thumbnail: string | null
  }
}