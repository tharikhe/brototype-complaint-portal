'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Filter, Clock, CheckCircle, AlertCircle, Loader2, User, Mail, Phone, Hash, BookOpen, Calendar, Camera, Send, FileText, Trash2 } from 'lucide-react';
import { getTicketsByUser, createTicket, updateProfile, getCommentsByTicketId, addComment } from '@/lib/mock-data';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, TicketComment } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LogoutButton } from '@/components/logout-button';
import { useToast } from '@/hooks/use-toast';
import PacManLoader from '@/components/pac-man-loader';
import { MobileNav } from '@/components/mobile-nav';

export default function StudentDashboard() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const { toast } = useToast();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        category: TicketCategory;
        priority: TicketPriority;
        attachment?: File;
    }>({
        title: '',
        description: '',
        category: 'curriculum',
        priority: 'medium',
        attachment: undefined,
    });

    // Profile Settings State
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({
        admission_number: '',
        phone: '',
        domain: '',
        batch_id: '',
        avatar_url: ''
    });

    // Selected Ticket for Modal
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<TicketComment[]>([]);
    const [newComment, setNewComment] = useState('');

    // Check authentication
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        } else if (user && profile) {
            // Load tickets for this user
            setTickets(getTicketsByUser(user.id));
            // Initialize profile form
            setProfileForm({
                admission_number: profile.admission_number || '',
                phone: profile.phone || '',
                domain: profile.domain || '',
                batch_id: profile.batch_id || '',
                avatar_url: profile.avatar_url || ''
            });
        }
    }, [user, profile, loading, router]);

    // Load draft from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('complaintDraft');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setFormData(prev => ({ ...prev, ...parsed }));
                toast({
                    description: "Draft restored from previous session",
                });
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, []);

    // Save draft to localStorage on change
    useEffect(() => {
        const draft = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority
        };
        // Only save if there's actual content
        if (draft.title || draft.description) {
            localStorage.setItem('complaintDraft', JSON.stringify(draft));
        }
    }, [formData.title, formData.description, formData.category, formData.priority]);

    // Load comments when a ticket is selected
    useEffect(() => {
        if (selectedTicket) {
            setComments(getCommentsByTicketId(selectedTicket.id));
        } else {
            setComments([]);
            setNewComment('');
        }
    }, [selectedTicket]);

    // Filter tickets based on search and status
    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tickets, searchQuery, statusFilter]);

    // Calculate stats
    const stats = useMemo(() => ({
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    }), [tickets]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.description.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please fill in all fields",
            });
            return;
        }

        if (user) {
            // Create new ticket with authenticated user ID
            createTicket(user.id, formData);
            setTickets(getTicketsByUser(user.id));

            // Reset form
            // Reset form
            setFormData({
                title: '',
                description: '',
                category: 'curriculum',
                priority: 'medium',
                attachment: undefined,
            });
            localStorage.removeItem('complaintDraft');

            setDialogOpen(false);

            // Show success toast
            toast({
                title: "Success!",
                description: "Your complaint has been submitted successfully.",
            });
        }
    };

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (user && profile) {
            updateProfile(user.id, profileForm);
            setProfileDialogOpen(false);
            toast({
                title: "Profile Updated",
                description: "Your profile details have been saved successfully.",
            });
        }
    };

    const handleSendComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTicket || !user || !profile) return;

        const comment = addComment({
            ticket_id: selectedTicket.id,
            user_id: user.id,
            user_name: profile.full_name,
            role: 'student',
            content: newComment,
            is_internal: false,
        });

        setComments([...comments, comment]);
        setNewComment('');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge variant="destructive" className="bg-red-900 text-red-200">Open</Badge>;
            case 'in_progress':
                return <Badge className="bg-yellow-600 text-white">In Progress</Badge>;
            case 'resolved':
                return <Badge className="bg-green-700 text-white">Resolved</Badge>;
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

    // Show Pac-Man loader if loading
    if (loading) {
        return <PacManLoader />;
    }

    // Don't render if not authenticated
    if (!user || !profile) {
        return null;
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-black text-white overflow-x-hidden">
            {/* Header with Logout */}
            <div className="flex justify-between md:justify-end items-center mb-4 gap-2">
                <div className="md:hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brototype-logo.png" alt="Brototype" className="h-8 w-auto" />
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-2">
                    <Button
                        variant="gradient"
                        onClick={() => setProfileDialogOpen(true)}
                    >
                        <User className="mr-2 h-4 w-4" />
                        Profile Settings
                    </Button>
                    <Button
                        variant="gradient"
                        onClick={() => window.open('mailto:support@brototype.com')}
                    >
                        Contact Support
                    </Button>
                    <LogoutButton />
                </div>

                {/* Mobile Nav */}
                <MobileNav
                    onProfileClick={() => setProfileDialogOpen(true)}
                />
            </div>

            <div className="max-w-6xl mx-auto w-full">
                {/* Header Card */}
                <Card className="bg-zinc-900 border-zinc-800 mb-8 shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div>
                                <CardTitle className="text-3xl text-white">
                                    Welcome, {profile.full_name || 'Student'}
                                </CardTitle>
                                <CardDescription className="text-zinc-400 text-lg mt-1">
                                    Submit and track your complaints here.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">{stats.total}</p>
                                <p className="text-sm text-zinc-400 mt-1">Total</p>
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

                {/* Raise Complaint Button */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="lg"
                            className="w-full md:w-auto mb-6 bg-white text-black hover:bg-zinc-200 shadow-lg text-lg py-6 px-8 font-semibold"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Raise New Complaint
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800 text-white sm:max-w-[600px] shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Plus className="w-6 h-6 text-zinc-400" />
                                Submit a New Complaint
                            </DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Help us understand your issue better by providing details below.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-6 py-4">
                                {/* Title */}
                                <div className="grid gap-2">
                                    <Label htmlFor="title" className="text-zinc-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Title
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Brief description (max 100 chars)"
                                        maxLength={100}
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all"
                                    />
                                    <div className="flex justify-end">
                                        <span className={`text-xs ${formData.title.length >= 90 ? 'text-red-400' : 'text-zinc-500'}`}>
                                            {formData.title.length}/100 characters
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Category */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="category" className="text-zinc-300 flex items-center gap-2">
                                            <Filter className="w-4 h-4" />
                                            Category
                                        </Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value as TicketCategory })}
                                        >
                                            <SelectTrigger className="bg-black/50 border-zinc-700 text-white focus:ring-white/20">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                <SelectItem value="curriculum">Curriculum</SelectItem>
                                                <SelectItem value="facility">Facility</SelectItem>
                                                <SelectItem value="placement">Placement</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Priority */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="priority" className="text-zinc-300 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Priority
                                        </Label>
                                        <Select
                                            value={formData.priority}
                                            onValueChange={(value) => setFormData({ ...formData, priority: value as TicketPriority })}
                                        >
                                            <SelectTrigger className="bg-black/50 border-zinc-700 text-white focus:ring-white/20">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                <SelectItem value="low">Low (Minor Issue)</SelectItem>
                                                <SelectItem value="medium">Medium (Standard)</SelectItem>
                                                <SelectItem value="high">High (Urgent)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="grid gap-2">
                                    <Label htmlFor="description" className="text-zinc-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Provide detailed information about your complaint..."
                                        rows={5}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all resize-none"
                                    />
                                </div>

                                {/* Attachment (Drag & Drop Style) */}
                                <div className="grid gap-2">
                                    <Label className="text-zinc-300 flex items-center gap-2">
                                        <Camera className="w-4 h-4" />
                                        Attachment (Optional)
                                    </Label>
                                    <div className="relative group">
                                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${formData.attachment ? 'border-green-500/50 bg-green-500/10' : 'border-zinc-700 bg-black/30 hover:border-zinc-500 hover:bg-black/50'}`}>
                                            <Input
                                                id="attachment"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    setFormData({ ...formData, attachment: file });
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                {formData.attachment ? (
                                                    <>
                                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                                        <p className="text-sm text-green-400 font-medium truncate max-w-[200px]">
                                                            {formData.attachment.name}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">Click to change file</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                                                            <Plus className="w-5 h-5 text-zinc-400" />
                                                        </div>
                                                        <p className="text-sm text-zinc-300 font-medium">Click or drag to upload</p>
                                                        <p className="text-xs text-zinc-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setFormData({
                                            title: '',
                                            description: '',
                                            category: 'curriculum',
                                            priority: 'medium',
                                            attachment: undefined,
                                        });
                                        localStorage.removeItem('complaintDraft');
                                        toast({ description: "Draft cleared" });
                                    }}
                                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                                >
                                    Clear Draft
                                </Button>
                                <Button type="submit" className="bg-white text-black hover:bg-zinc-200 font-semibold shadow-lg transition-transform active:scale-95">
                                    Submit Complaint
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Profile Settings Modal */}
                <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Profile Settings</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Update your personal details. These will be visible to the administration.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleProfileUpdate}>
                            <div className="grid gap-4 py-4">
                                <div className="flex justify-center mb-4">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-2xl font-bold border-2 border-zinc-700 overflow-hidden">
                                            {profile?.avatar_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                profile?.full_name?.[0] || 'U'
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                        {/* Simulated File Input */}
                                        <Input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    // Simulate upload by setting a fake URL
                                                    setProfileForm({ ...profileForm, avatar_url: 'https://placehold.co/200x200/1a1a1a/ffffff?text=Avatar' });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="fullName" className="text-zinc-400">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={profile?.full_name || ''}
                                        disabled
                                        className="bg-zinc-950 border-zinc-800 text-zinc-500 cursor-not-allowed"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="admissionNumber" className="text-zinc-400">Admission No</Label>
                                        <Input
                                            id="admissionNumber"
                                            placeholder="e.g. KK-2025-001"
                                            value={profileForm.admission_number || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, admission_number: e.target.value })}
                                            className="bg-zinc-950 border-zinc-800 text-white"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone" className="text-zinc-400">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            placeholder="+91 98765 43210"
                                            value={profileForm.phone || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            className="bg-zinc-950 border-zinc-800 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="domain" className="text-zinc-400">Domain</Label>
                                        <Select
                                            value={profileForm.domain}
                                            onValueChange={(value) => setProfileForm({ ...profileForm, domain: value })}
                                        >
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                                                <SelectValue placeholder="Select Domain" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                <SelectItem value="MERN Stack">MERN Stack</SelectItem>
                                                <SelectItem value="Python Django">Python Django</SelectItem>
                                                <SelectItem value="Flutter">Flutter</SelectItem>
                                                <SelectItem value="Go Lang">Go Lang</SelectItem>
                                                <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="batchId" className="text-zinc-400">Batch ID</Label>
                                        <Input
                                            id="batchId"
                                            placeholder="e.g. Brototype-KK-12"
                                            value={profileForm.batch_id || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, batch_id: e.target.value })}
                                            className="bg-zinc-950 border-zinc-800 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-white text-black hover:bg-zinc-200 font-semibold">
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Tickets List */}
                <div>
                    {/* Search and Filter Bar */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                            <Input
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as 'all' | 'open' | 'in_progress' | 'resolved')}
                        >
                            <SelectTrigger className="w-full md:w-[200px] bg-zinc-900 border-zinc-800 text-white">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <SelectValue placeholder="Filter by status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4">
                        {filteredTickets.length === 0 ? (
                            <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
                                <p className="text-zinc-400">No tickets found.</p>
                            </Card>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <Card
                                    key={ticket.id}
                                    className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4 gap-2">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-xl font-semibold text-white mb-2 break-words">{ticket.title}</h3>
                                                <div className="flex gap-2 mb-3 flex-wrap">
                                                    {getStatusBadge(ticket.status)}
                                                    {getPriorityBadge(ticket.priority)}
                                                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                                        {ticket.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <span className="text-sm text-zinc-500 shrink-0">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-zinc-400 line-clamp-2 break-words">{ticket.description}</p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Ticket Details Modal (View Only + Comments) */}
                <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                    <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800 text-white sm:max-w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {selectedTicket?.title}
                                <span className="text-sm font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                                    #{selectedTicket?.id}
                                </span>
                            </DialogTitle>
                            <DialogDescription className="text-zinc-400 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                Created on {selectedTicket && new Date(selectedTicket.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Status Bar */}
                            <div className="flex flex-wrap gap-3 p-4 bg-black/40 rounded-lg border border-zinc-800/50">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Status</span>
                                    {selectedTicket && getStatusBadge(selectedTicket.status)}
                                </div>
                                <div className="w-px bg-zinc-800 h-10 mx-2 hidden sm:block"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Priority</span>
                                    {selectedTicket && getPriorityBadge(selectedTicket.priority)}
                                </div>
                                <div className="w-px bg-zinc-800 h-10 mx-2 hidden sm:block"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Category</span>
                                    <Badge variant="outline" className="border-zinc-700 text-zinc-300 bg-zinc-900/50 h-6">
                                        {selectedTicket?.category}
                                    </Badge>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Description
                                </h4>
                                <div className="p-4 bg-black/50 rounded-lg border border-zinc-800 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {selectedTicket?.description}
                                </div>
                            </div>

                            {/* Attachment */}
                            {selectedTicket?.attachment_url && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        <Camera className="w-4 h-4" />
                                        Attachment
                                    </h4>
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

                            {/* Comments Section */}
                            <div className="space-y-4 pt-6 border-t border-zinc-800">
                                <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    Comments & Timeline
                                </h4>
                                <div className="bg-black/30 rounded-xl border border-zinc-800/50 p-4">
                                    <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 mb-4 custom-scrollbar">
                                        {comments.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-3">
                                                    <Send className="w-5 h-5 text-zinc-600" />
                                                </div>
                                                <p className="text-sm text-zinc-500">No comments yet. Start a conversation!</p>
                                            </div>
                                        ) : (
                                            comments.map((comment) => (
                                                <div key={comment.id} className={`flex gap-3 ${comment.role === 'student' ? 'flex-row-reverse' : ''}`}>
                                                    <Avatar className="w-8 h-8 border border-zinc-700">
                                                        <AvatarFallback className={comment.role === 'student' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300'}>
                                                            {comment.user_name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${comment.role === 'student'
                                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                                        : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                                                        }`}>
                                                        <div className="flex items-center gap-2 mb-1 opacity-80">
                                                            <span className="font-semibold text-xs">{comment.user_name}</span>
                                                            <span className="text-[10px]">
                                                                {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="leading-relaxed">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <form onSubmit={handleSendComment} className="flex gap-2 items-center bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                                        <Input
                                            placeholder="Type a reply..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-zinc-600"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            className="bg-white text-black hover:bg-zinc-200 shrink-0 rounded-full w-8 h-8"
                                            disabled={!newComment.trim()}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
