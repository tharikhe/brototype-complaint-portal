// Data Entity Types for Student Complaint Portal

export type UserRole = 'student' | 'admin';

export type TicketCategory = 'curriculum' | 'facility' | 'placement' | 'other';

export type TicketPriority = 'low' | 'medium' | 'high';

export type TicketStatus = 'open' | 'in_progress' | 'resolved';

/**
 * Profile Entity - Extends Supabase Auth
 * Stores user details linked to auth.users
 */
export interface Profile {
  id: string; // UUID - Primary Key, References auth.users.id
  email: string;
  full_name: string;
  role: UserRole;
  batch_id?: string; // e.g., "Brototype-KK-12"
  avatar_url?: string;
  admission_number?: string; // e.g., "KK-2025-001"
  phone?: string;
  domain?: string; // e.g., "MERN Stack"
  joining_date?: string;
}

/**
 * Ticket Entity - The Core Complaint
 * Represents an issue being reported by a student
 */
export interface Ticket {
  id: string; // UUID - Primary Key
  created_at: string; // ISO Date String
  user_id: string; // Foreign Key -> profiles.id
  title: string; // Max 100 chars
  description: string; // Rich text or Markdown
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to?: string; // Optional, Foreign Key -> profiles.id (Admin)
  attachment_url?: string; // Optional URL to uploaded image
}

/**
 * TicketComment Entity - The Conversation Thread
 * For Staff to ask questions or Students to provide updates
 */
export interface TicketComment {
  id: string; // UUID - Primary Key
  ticket_id: string; // Foreign Key -> tickets.id
  user_id: string; // Foreign Key -> profiles.id (Author)
  user_name: string; // Denormalized for easier display
  role: UserRole; // To distinguish between student and admin comments
  content: string;
  created_at: string; // ISO Date String
  is_internal: boolean; // If true, only Staff can see
}

/**
 * Form types for creating new tickets
 */
export interface CreateTicketForm {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  attachment?: File; // Optional file upload
}
