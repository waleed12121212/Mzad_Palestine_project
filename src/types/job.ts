export interface JobCategory {
  id?: number;
  name: string;
  description?: string;
  imageUrl?: string;
  jobsCount?: number;
}

export interface Job {
  id?: number;
  jobCategoryId?: number;
  title: string;
  description: string;
  companyName: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salary: number;
  requirements: string;
  benefits: string;
  contactInfo: string;
  createdAt?: string;
  applicationDeadline?: string;
  status?: string;
  userId?: string;
  userName?: string | null;
}

export interface JobCategoryResponse {
  data: JobCategory[];
  success: boolean;
  message: string;
}

export interface JobResponse {
  data: Job[];
  success: boolean;
  message: string;
} 