'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getAllTickets, getTicketStats, updateTicketStatus, getProfileById, getCommentsByTicketId, addComment } from '@/lib/mock-data';
import { Ticket, TicketStatus, TicketPriority, TicketCategory, TicketComment, Profile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Clock, Loader2, Search, ArrowUpDown, Download, User, Phone, Hash, Calendar, BookOpen, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LogoutButton } from '@/components/logout-button';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import PacManLoader from '@/components/pac-man-loader';
import AnalyticsCharts from '@/components/analytics-charts';
import { supabase } from '@/lib/supabase/client';

export default function AdminDashboard() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const { toast } = useToast();
    const [tickets, setTickets] = useState<Ticket[]>(getAllTickets());
    const [stats, setStats] = useState(getTicketStats());

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'all'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // User profiles loaded from Supabase
    const [userProfiles, setUserProfiles] = useState<Map<string, Profile>>(new Map());

    // Selected Ticket for Modal
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<TicketComment[]>([]);
    const [newComment, setNewComment] = useState('');

    // Check authentication and role
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        } else if (profile && profile.role !== 'admin') {
            // Redirect non-admin users
            router.push('/student');
        } else if (profile && profile.role === 'admin') {
            // Reload tickets and stats when admin is authenticated
            setTickets(getAllTickets());
            setStats(getTicketStats());
            // Load user profiles from Supabase
            loadUserProfiles();
        }
    }, [user, profile, loading, router]);

    // Load comments when a ticket is selected
    useEffect(() => {
        if (selectedTicket) {
            setComments(getCommentsByTicketId(selectedTicket.id));
        } else {
            setComments([]);
            setNewComment('');
        }
    }, [selectedTicket]);

    // Load user profiles from Supabase
    const loadUserProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            if (error) {
                console.error('Error loading profiles:', error);
                return;
            }

            if (data) {
                const profileMap = new Map<string, Profile>();
                data.forEach((profile: Profile) => {
                    profileMap.set(profile.id, profile);
                });
                setUserProfiles(profileMap);
            }
        } catch (err) {
            console.error('Unexpected error loading profiles:', err);
        }
    };

    // Helper to get profile by ID (checks Supabase profiles first, then mock profiles)
    const getUserProfile = (userId: string): Profile | undefined => {
        // Check Supabase profiles first
        const supabaseProfile = userProfiles.get(userId);
        if (supabaseProfile) return supabaseProfile;
        // Fall back to mock profiles
        return getProfileById(userId);
    };

    const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
        updateTicketStatus(ticketId, newStatus);
        setTickets(getAllTickets()); // Refresh tickets to get latest state
        setStats(getTicketStats());

        // Update selected ticket if it's open
        if (selectedTicket && selectedTicket.id === ticketId) {
            setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
        }

        // Show success toast
        toast({
            title: "Status Updated",
            description: `Ticket status changed to ${newStatus.replace('_', ' ')}`,
        });
    };

    const handleSendComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTicket || !user || !profile) return;

        const comment = addComment({
            ticket_id: selectedTicket.id,
            user_id: user.id,
            user_name: profile.full_name,
            role: 'admin',
            content: newComment,
            is_internal: false,
        });

        setComments([...comments, comment]);
        setNewComment('');
    };

    const exportToCSV = () => {
        try {
            // CSV headers
            const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Created At', 'Student Name'];

            // Convert tickets to CSV rows
            const rows = filteredTickets.map(ticket => {
                const student = getUserProfile(ticket.user_id);
                return [
                    ticket.id,
                    `"${ticket.title.replace(/"/g, '""')}"`, // Escape quotes
                    `"${ticket.description.replace(/"/g, '""')}"`,
                    ticket.status,
                    ticket.priority,
                    ticket.category,
                    new Date(ticket.created_at).toLocaleString(),
                    student?.full_name || 'Unknown'
                ];
            });

            // Combine headers and rows
            const csvContent = [headers, ...rows]
                .map(row => row.join(','))
                .join('\n');

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Export Successful",
                description: `Exported ${filteredTickets.length} tickets to CSV`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: "Failed to export tickets. Please try again.",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge variant="destructive" className="bg-red-900 text-red-200 hover:bg-red-900/80">Open</Badge>;
            case 'in_progress':
                return <Badge className="bg-yellow-600 text-white hover:bg-yellow-600/80">In Progress</Badge>;
            case 'resolved':
                return <Badge className="bg-green-700 text-white hover:bg-green-700/80">Resolved</Badge>;
            default:
                return <Badge className="bg-zinc-700">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge variant="destructive" className="bg-red-600">High</Badge>;
            case 'medium':
                return <Badge className="bg-yellow-600">Medium</Badge>;
            case 'low':
                return <Badge variant="outline" className="border-zinc-600 text-zinc-400">Low</Badge>;
            default:
                return <Badge>{priority}</Badge>;
        }
    };

    // Filtered and Sorted Tickets
    const filteredTickets = useMemo(() => {
        let result = [...tickets];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query)
            );
        }

        // Filters
        if (statusFilter !== 'all') {
            result = result.filter(t => t.status === statusFilter);
        }
        if (priorityFilter !== 'all') {
            result = result.filter(t => t.priority === priorityFilter);
        }
        if (categoryFilter !== 'all') {
            result = result.filter(t => t.category === categoryFilter);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (sortBy === 'priority') {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                const weightA = priorityWeight[a.priority];
                const weightB = priorityWeight[b.priority];
                return sortOrder === 'asc' ? weightA - weightB : weightB - weightA;
            }
            return 0;
        });

        return result;
    }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy, sortOrder]);

    const toggleSort = (field: 'date' | 'priority') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    // Show Pac-Man loader if loading
    if (loading) {
        return <PacManLoader />;
    }

    // Don't render if not authenticated or not admin
    if (!user || !profile || profile.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-black text-white">
            {/* Header with Export and Logout */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-2">
                    <Button
                        variant="gradient"
                        onClick={() => window.open('mailto:support@brototype.com')}
                    >
                        Contact Support
                    </Button>
                    <Button variant="gradient" onClick={exportToCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export to CSV
                    </Button>
                    <LogoutButton />
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">{stats.total}</p>
                                <p className="text-sm text-zinc-400 mt-1">Total Tickets</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-red-400">{stats.open}</p>
                                <p className="text-sm text-zinc-400 mt-1">Open</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-yellow-400">{stats.inProgress}</p>
                                <p className="text-sm text-zinc-400 mt-1">In Progress</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
                                <p className="text-sm text-zinc-400 mt-1">Resolved</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Analytics Charts */}
                <AnalyticsCharts tickets={tickets} />

                {/* Filters & Search */}
                <Card className="bg-zinc-900 border-zinc-800 mb-6">
                    <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                            <Input
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-black border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                                <SelectTrigger className="w-[140px] bg-black border-zinc-700 text-white">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
                                <SelectTrigger className="w-[140px] bg-black border-zinc-700 text-white">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                                <SelectTrigger className="w-[140px] bg-black border-zinc-700 text-white">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="all">All Category</SelectItem>
                                    <SelectItem value="curriculum">Curriculum</SelectItem>
                                    <SelectItem value="facility">Facility</SelectItem>
                                    <SelectItem value="placement">Placement</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tickets Table */}
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-zinc-950">
                                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                    <TableHead className="text-zinc-400">ID</TableHead>
                                    <TableHead className="text-zinc-400">Title</TableHead>
                                    <TableHead className="text-zinc-400">Student</TableHead>
                                    <TableHead className="text-zinc-400 cursor-pointer hover:text-white" onClick={() => toggleSort('date')}>
                                        <div className="flex items-center gap-1">
                                            Date
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-zinc-400">Status</TableHead>
                                    <TableHead className="text-zinc-400 cursor-pointer hover:text-white" onClick={() => toggleSort('priority')}>
                                        <div className="flex items-center gap-1">
                                            Priority
                                            <ArrowUpDown className="h-3 w-3" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-zinc-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTickets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                                            No tickets found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTickets.map((ticket) => {
                                        const student = getUserProfile(ticket.user_id);
                                        return (
                                            <TableRow key={ticket.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                                <TableCell className="font-mono text-xs text-zinc-500">
                                                    {ticket.id.slice(0, 8)}...
                                                </TableCell>
                                                <TableCell className="font-medium text-white">
                                                    <div className="max-w-[200px] truncate" title={ticket.title}>
                                                        {ticket.title}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-zinc-300">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                                                            {student?.full_name?.[0] || '?'}
                                                        </div>
                                                        {student?.full_name || 'Unknown'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-zinc-400 text-sm">
                                                    {new Date(ticket.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        defaultValue={ticket.status}
                                                        onValueChange={(value) => handleStatusChange(ticket.id, value as TicketStatus)}
                                                    >
                                                        <SelectTrigger className="h-8 w-[130px] bg-transparent border-zinc-700 text-white">
                                                            <SelectValue>
                                                                {getStatusBadge(ticket.status)}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                            <SelectItem value="open">Open</SelectItem>
                                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                                            <SelectItem value="resolved">Resolved</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                        onClick={() => setSelectedTicket(ticket)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card >
            </div >

            {/* Ticket Details Modal */}
            <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {selectedTicket?.title}
                            <Badge variant="outline" className="ml-2 border-zinc-600 text-zinc-400 font-normal">
                                {selectedTicket?.category}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Ticket ID: {selectedTicket?.id} • Created on {selectedTicket && new Date(selectedTicket.created_at).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-zinc-300">Description</h4>
                            <div className="p-4 bg-black rounded-lg border border-zinc-800 text-zinc-300 text-sm leading-relaxed">
                                {selectedTicket?.description}
                            </div>
                        </div>

                        {selectedTicket?.attachment_url && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-zinc-300">Attachment</h4>
                                <div className="relative w-full overflow-hidden rounded-lg border border-zinc-800 bg-black group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={selectedTicket.attachment_url}
                                        alt="Attachment"
                                        className="w-full h-auto max-h-[400px] object-contain mx-auto"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="pointer-events-auto"
                                            onClick={() => window.open(selectedTicket.attachment_url, '_blank')}
                                        >
                                            View Full Size
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-zinc-300">Status</h4>
                                <Select
                                    value={selectedTicket?.status}
                                    onValueChange={(value) => selectedTicket && handleStatusChange(selectedTicket.id, value as TicketStatus)}
                                >
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-zinc-300">Priority</h4>
                                <div className="pt-2">
                                    {selectedTicket && getPriorityBadge(selectedTicket.priority)}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-zinc-300">Student Details</h4>
                            <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-lg">
                                        {getUserProfile(selectedTicket?.user_id || '')?.full_name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-white">
                                            {getUserProfile(selectedTicket?.user_id || '')?.full_name || 'Unknown Student'}
                                        </p>
                                        <p className="text-sm text-zinc-500">
                                            {getUserProfile(selectedTicket?.user_id || '')?.email || 'No email'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Hash className="w-4 h-4 text-zinc-500" />
                                        <span>Adm No: <span className="text-zinc-200">{getUserProfile(selectedTicket?.user_id || '')?.admission_number || 'N/A'}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Phone className="w-4 h-4 text-zinc-500" />
                                        <span>Phone: <span className="text-zinc-200">{getUserProfile(selectedTicket?.user_id || '')?.phone || 'N/A'}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <BookOpen className="w-4 h-4 text-zinc-500" />
                                        <span>Domain: <span className="text-zinc-200">{getUserProfile(selectedTicket?.user_id || '')?.domain || 'N/A'}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Calendar className="w-4 h-4 text-zinc-500" />
                                        <span>Batch: <span className="text-zinc-200">{getUserProfile(selectedTicket?.user_id || '')?.batch_id || 'N/A'}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-3 pt-4 border-t border-zinc-800">
                            <h4 className="text-sm font-medium text-zinc-300">Comments & Timeline</h4>
                            <div className="space-y-4">
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {comments.length === 0 ? (
                                        <p className="text-sm text-zinc-500 text-center py-4">No comments yet.</p>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment.id} className={`flex gap-3 ${comment.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${comment.role === 'admin' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300'
                                                    }`}>
                                                    {comment.user_name[0]}
                                                </div>
                                                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${comment.role === 'admin' ? 'bg-zinc-800 text-white' : 'bg-zinc-950 border border-zinc-800 text-zinc-300'
                                                    }`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-xs">{comment.user_name}</span>
                                                        <span className="text-[10px] text-zinc-500">
                                                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p>{comment.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={handleSendComment} className="flex gap-2">
                                    <Input
                                        placeholder="Type a reply..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 text-white"
                                    />
                                    <Button type="submit" size="icon" className="bg-white text-black hover:bg-zinc-200">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >
        </div >
    );
}
