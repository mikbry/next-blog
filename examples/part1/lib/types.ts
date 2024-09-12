import { Author } from "next/dist/lib/metadata/types/metadata-types";

export type Configuration = {
  title: string;
  locale: string;
  author: Author;
  email: string;
  description: string;
  base_url: string;
  url: string;
  social_links: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  },
  permalink?: string;
  nav_pages: string[];
}