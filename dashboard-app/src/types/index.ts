import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  directory: z.string(),
  readmePath: z.string(),
  mainCodePath: z.string(),
  techStack: z.array(z.string()),
  // Optional fields for compatibility with generated data
  readme: z.string().optional(),
  codes: z.record(z.string(), z.string()).optional(),
  assets: z.array(z.string()).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export interface FileContent {
  name: string;
  content: string;
  language: string;
}

export interface ProjectState {
  selectedProjectId: string | null;
  projects: Project[];
}
