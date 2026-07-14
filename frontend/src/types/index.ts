export interface User {
  id: string;
  email: string;
  name: string;
  role: "superadmin" | "editor" | "contributor";
  created_at: string;
}

export interface Content {
  id: string;
  pillar: "quran" | "hadith" | "tafsir" | "sirah";
  category?: string;
  title: string;
  slug: string;
  html_body: string;
  tags: string[];
  cover_image?: string;
  status: "draft" | "published";
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentSummary extends Omit<Content, "html_body"> {}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
