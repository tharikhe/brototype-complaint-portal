// Mock Data Store - Simulates Supabase Database with LocalStorage persistence
import { Profile, Ticket, TicketStatus, CreateTicketForm, TicketComment } from './types';
import { v4 as uuidv4 } from 'uuid';

// Storage keys
const STORAGE_TICKETS_KEY = 'brototype_tickets';
const STORAGE_COMMENTS_KEY = 'brototype_comments';

// Mock Profiles
export const mockProfiles: Profile[] = [
    {
        id: 'student-1',
        email: 'arjun@brototype.com',
        full_name: 'Arjun Kumar',
        role: 'student',
        batch_id: 'Brototype-KK-12',
        avatar_url: undefined,
        admission_number: 'KK-2025-101',
        phone: '+91 98765 43210',
        domain: 'MERN Stack',
        joining_date: '2025-01-15',
    },
    {
        id: 'student-2',
        email: 'priya@brototype.com',
        full_name: 'Priya Sharma',
        role: 'student',
        batch_id: 'Brototype-KK-12',
        avatar_url: undefined,
        admission_number: 'KK-2025-102',
        phone: '+91 98765 12345',
        domain: 'Python Django',
        joining_date: '2025-02-01',
    },
    {
        id: 'admin-1',
        email: 'staff@brototype.com',
        full_name: 'Staff Admin',
        role: 'admin',
    },
];

// Helper to generate unique ticket codes (e.g., TKT-8X29A)
const generateTicketId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TKT-${code}`;
};

// Default tickets (used if localStorage is empty)
const defaultTickets: Ticket[] = [];

// Default comments
const defaultComments: TicketComment[] = [];

// Load from localStorage or use defaults
const loadTickets = (): Ticket[] => {
    if (typeof window === 'undefined') return defaultTickets;
    try {
        const stored = localStorage.getItem(STORAGE_TICKETS_KEY);
        return stored ? JSON.parse(stored) : defaultTickets;
    } catch (e) {
        console.error('Failed to load tickets:', e);
        return defaultTickets;
    }
};

const loadComments = (): TicketComment[] => {
    if (typeof window === 'undefined') return defaultComments;
    try {
        const stored = localStorage.getItem(STORAGE_COMMENTS_KEY);
        return stored ? JSON.parse(stored) : defaultComments;
    } catch (e) {
        console.error('Failed to load comments:', e);
        return defaultComments;
    }
};

// Save to localStorage
const saveTickets = (tickets: Ticket[]) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(tickets));
        } catch (e) {
            console.error('Failed to save tickets:', e);
        }
    }
};

const saveComments = (comments: TicketComment[]) => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
        } catch (e) {
            console.error('Failed to save comments:', e);
        }
    }
};

// Mock Tickets - Initialize from storage
export let mockTickets: Ticket[] = loadTickets();

// Mock Comments - Initialize from storage
export let mockComments: TicketComment[] = loadComments();

// Helper Functions

/**
 * Get all tickets
 */
export const getAllTickets = (): Ticket[] => {
    return [...mockTickets].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
};

/**
 * Get tickets by user ID
 */
export const getTicketsByUser = (userId: string): Ticket[] => {
    return mockTickets
        .filter(ticket => ticket.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

/**
 * Get profile by ID
 */
export const getProfileById = (id: string): Profile | undefined => {
    return mockProfiles.find(profile => profile.id === id);
};

/**
 * Create a new ticket
 */
export const createTicket = (userId: string, form: CreateTicketForm): Ticket => {
    // Simulate file upload by creating a fake URL if a file is present
    let attachmentUrl: string | undefined;
    if (form.attachment) {
        // In a real app, we would upload to Supabase Storage here
        // For mock, we'll use URL.createObjectURL to simulate the uploaded image
        attachmentUrl = URL.createObjectURL(form.attachment);
    }

    const newTicket: Ticket = {
        id: generateTicketId(),
        created_at: new Date().toISOString(),
        user_id: userId,
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        status: 'open',
        assigned_to: undefined,
        attachment_url: attachmentUrl,
    };

    mockTickets.push(newTicket);
    saveTickets(mockTickets); // Persist to localStorage
    return newTicket;
};

/**
 * Update ticket status
 */
export const updateTicketStatus = (ticketId: string, status: TicketStatus): Ticket | null => {
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
        ticket.status = status;
        saveTickets(mockTickets); // Persist to localStorage
        return ticket;
    }
    return null;
};

/**
 * Update user profile
 */
export const updateProfile = (userId: string, updates: Partial<Profile>): Profile | null => {
    const profile = mockProfiles.find(p => p.id === userId);
    if (profile) {
        Object.assign(profile, updates);
        return profile;
    }
    return null;
};

/**
 * Get ticket statistics
 */
export const getTicketStats = () => {
    return {
        total: mockTickets.length,
        open: mockTickets.filter(t => t.status === 'open').length,
        inProgress: mockTickets.filter(t => t.status === 'in_progress').length,
        resolved: mockTickets.filter(t => t.status === 'resolved').length,
    };
};

/**
 * Get comments by ticket ID
 */
export const getCommentsByTicketId = (ticketId: string): TicketComment[] => {
    return mockComments
        .filter(c => c.ticket_id === ticketId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

/**
 * Add a new comment
 */
export const addComment = (comment: Omit<TicketComment, 'id' | 'created_at'>): TicketComment => {
    const newComment: TicketComment = {
        ...comment,
        id: `comment-${Date.now()}`,
        created_at: new Date().toISOString(),
    };
    mockComments.push(newComment);
    saveComments(mockComments); // Persist to localStorage
    return newComment;
};
