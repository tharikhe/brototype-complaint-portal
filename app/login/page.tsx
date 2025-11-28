"use client"

import { useState } from "react"
import { FestiveTree } from "@/components/festive-tree"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // TODO: Implement actual Supabase login here
            // For now, just simulate a delay and redirect
            await new Promise(resolve => setTimeout(resolve, 1500))

            // toast({
            //   title: "Login successful",
            //   description: "Welcome back!",
            // })
            // router.push("/student") // or /admin based on role

            // Since we don't have the full auth logic connected in this file yet (it's in auth-context or similar),
            // we'll just show a toast for now.
            toast({
                title: "Login functionality not fully connected",
                description: "This is a UI demo for the festive animation.",
            })

        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#151522] text-white overflow-hidden">
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 z-10 relative">
                <div className="w-full max-w-md space-y-8 bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-400 to-green-400 bg-clip-text text-transparent font-mountains">
                            Welcome Back
                        </h1>
                        <p className="text-gray-400">Sign in to the Student Complaint Portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-300">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                                placeholder="student@brototype.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500 pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg shadow-lg shadow-red-900/20 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-red-400 hover:text-red-300 font-medium hover:underline transition-colors">
                            Sign up
                        </Link>
                    </div>
                </div>

                {/* Mobile Footer/Credit */}
                <div className="mt-8 lg:hidden text-center text-xs text-gray-600">
                    <p>Festive Login &copy; 2025</p>
                </div>
            </div>

            {/* Right Side - Festive Animation */}
            <div className="hidden lg:flex w-1/2 bg-[#081029] relative items-center justify-center overflow-hidden border-l border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#081029] to-[#081029]" />
                <div className="w-full h-full scale-90">
                    <FestiveTree />
                </div>
            </div>

            {/* Mobile Background Animation (Optional - simplified or same) */}
            {/* We can show the tree in the background on mobile with low opacity */}
            <div className="lg:hidden absolute inset-0 z-0 opacity-20 pointer-events-none">
                <FestiveTree />
            </div>
        </div>
    )
}
