'use client';

import { useAuth } from '@/lib/auth-context';

import { cn } from "@/lib/utils"

interface LogoutButtonProps {
    className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
    const { signOut } = useAuth();

    return (
        <button
            onClick={signOut}
            className={cn(
                "group relative flex items-center gap-1 px-6 py-2 border-2 border-transparent font-medium text-sm bg-transparent rounded-full cursor-pointer overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_0_0_2px_white] text-white hover:shadow-[0_0_0_12px_transparent] hover:text-black hover:rounded-xl active:scale-95 active:shadow-[0_0_0_4px_white]",
                className
            )}
        >
            {/* Arrow 1 - Slides in from left */}
            <svg
                viewBox="0 0 24 24"
                className="absolute w-5 fill-white z-10 -left-1/4 transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:left-3 group-hover:fill-black"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
            </svg>

            {/* Text */}
            <span className="relative z-[1] -translate-x-2 transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-2">
                Logout
            </span>

            {/* Expanding Circle */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-[180px] group-hover:h-[180px] group-hover:opacity-100" />

            {/* Arrow 2 - Slides out to right */}
            <svg
                viewBox="0 0 24 24"
                className="absolute w-5 fill-white z-10 right-3 transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-right-1/4 group-hover:fill-black"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
            </svg>
        </button>
    );
}
