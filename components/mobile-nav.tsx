"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Menu, User, Mail, LogOut } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

interface MobileNavProps {
    onProfileClick?: () => void
    onSupportClick?: () => void
}

export function MobileNav({ onProfileClick, onSupportClick }: MobileNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                    <Menu className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white">
                {onProfileClick && (
                    <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    onClick={onSupportClick || (() => window.open('mailto:support@brototype.com'))}
                    className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                >
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Contact Support</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 mt-2 border-t border-zinc-800 pt-2">
                    <LogoutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
