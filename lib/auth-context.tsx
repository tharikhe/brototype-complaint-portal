'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase/client';
import { Profile } from './types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string, role: 'student' | 'admin') => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadProfile = async (userId: string) => {
        try {
            // Use maybeSingle() to avoid error if row doesn't exist
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error loading profile:', error);
                setProfile(null);
                setLoading(false);
                return;
            }

            if (data) {
                setProfile(data);
                setLoading(false);
            } else {
                // Profile doesn't exist yet, the Supabase trigger might still be creating it
                // Wait a bit and retry once
                console.log('Profile not found, waiting for trigger...');
                await new Promise(resolve => setTimeout(resolve, 1000));

                const { data: retryData, error: retryError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();

                if (retryData) {
                    setProfile(retryData);
                } else if (retryError) {
                    console.error('Profile creation error on retry:', retryError);
                    setProfile(null);
                } else {
                    console.warn('Profile still not found after retry');
                    setProfile(null);
                }
                setLoading(false);
            }
        } catch (err) {
            console.error('Unexpected error loading profile:', err);
            setProfile(null);
            setLoading(false);
        }
    };

    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        role: 'student' | 'admin'
    ) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
            },
        });

        // Note: We DON'T manually insert the profile here
        // The Supabase trigger (handle_new_user) will create it automatically
        // loadProfile will wait for it if needed

        return { error };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { error };
    };

    const signOut = async () => {
        try {
            console.log('Signing out...');
            await supabase.auth.signOut();
            console.log('Sign out successful');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setUser(null);
            setProfile(null);
            setSession(null);
            router.push('/');
            router.refresh();
        }
    };

    const value = {
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
