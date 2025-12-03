import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Globe, Sparkles, Mail, Lock, User, CheckCircle2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchInstance } from "@/api/fetchInstance";
import { toast } from "sonner";
// name change
function SignUp() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        otp: "",
    });
    const [strength, setStrength] = useState(0);

    // Generate strong password
    const generateStrongPassword = (length = 12) => {
        const fullName = form.fullName || "";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        const allChars = lower + upper + numbers + symbols;

        let randomString = "";
        for (let i = 0; i < length; i++) {
            randomString += allChars[Math.floor(Math.random() * allChars.length)];
        }

        const generatedPassword = fullName + "-" + randomString;
        setForm({ ...form, password: generatedPassword });
        setStrength(getPasswordStrength(generatedPassword));
    };

    const handleSubmit = async () => {

        try {

            if(!form?.fullName || !form?.email || !form?.password) {
                return toast.error("All fileds are required!")
            }

            const response = await fetchInstance({
                url: "/user/register",
                method: "POST",
                data: form,
            })

            if (response?.success) {
                toast.success(response?.message)
                localStorage.setItem('token', response?.data?.token)
                navigate('/chat/new', {replace: true})
            } 
        } catch (error) {
            toast.error(error?.message)
        }
    }

    // Evaluate password strength
    const getPasswordStrength = (password) => {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 6) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        return score;
    };

    // Update strength on manual typing
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setForm({ ...form, password: value });
        setStrength(getPasswordStrength(value));
    };

    useEffect(() => {
        if (form.fullName !== "") {
            generateStrongPassword(12);
        }
    }, [form.fullName]);

    const strengthColor = strength <= 1 ? "bg-red-500" : strength === 2 ? "bg-orange-400" : "bg-green-500";

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-slate-900/20" />
                    <div className="relative z-10 max-w-lg text-center">
                        <div className="flex justify-center mb-6 lg:mb-8">
                            <div className="bg-white/10 backdrop-blur-xl rounded-full p-4 lg:p-6 border border-white/20">
                                <Sparkles className="w-12 h-12 lg:w-16 lg:h-16 text-teal-300" />
                            </div>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">PixelForge AI</h2>
                        <p className="text-sm sm:text-base lg:text-xl text-white/80 mb-8 lg:mb-12">
                            Transform your imagination into stunning visuals with the power of AI
                        </p>
                        <div className="space-y-4 lg:space-y-6 text-left">
                            {[
                                { title: "Generate Images", desc: "Create high-quality images from simple text descriptions" },
                                { title: "Video Creation", desc: "Turn your ideas into engaging video content instantly" },
                                { title: "AI-Powered", desc: "Advanced algorithms ensure stunning results every time" }
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-2 sm:gap-4">
                                    <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-teal-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">{item.title}</h3>
                                        <p className="text-white/60 text-xs sm:text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
                    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
                        {/* Mobile Header */}
                        <div className="lg:hidden text-center mb-6 sm:mb-8">
                            <div className="flex justify-center mb-2 sm:mb-4">
                                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-teal-300" />
                            </div>
                            <h1 className="text-white text-2xl sm:text-3xl font-bold">PixelForge AI</h1>
                        </div>

                        {/* Sign Up Card */}
                        <Card className="rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
                            <CardHeader className="pb-2 sm:pb-4">
                                <CardTitle className="text-white text-2xl sm:text-3xl font-bold">Create Account</CardTitle>
                                <p className="text-white/70 text-xs sm:text-sm mt-1 sm:mt-2">Join thousands of creators using AI</p>
                            </CardHeader>

                            <CardContent className="space-y-3 sm:space-y-3">
                                {/* Full Name */}
                                <div className="space-y-1">
                                    <Label className="text-white/90 text-xs sm:text-sm font-medium">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-white/50" />
                                        <Input
                                            type="text"
                                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                            placeholder="Enter your full name"
                                            className="pl-8 sm:pl-10 bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-1 sm:focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 h-10 sm:h-12 text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <Label className="text-white/90 text-xs sm:text-sm font-medium">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-white/50" />
                                        <Input
                                            type="email"
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="you@example.com"
                                            className="pl-8 sm:pl-10 bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-1 sm:focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 h-10 sm:h-12 text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1 relative">
                                    <Label className="text-white/90 text-xs sm:text-sm font-medium">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-white/50" />
                                        <Input
                                            value={form.password}
                                            type={showPassword ? "text" : "password"}
                                            onChange={(e) => handlePasswordChange(e)}
                                            placeholder="Create a strong password"
                                            className="pl-8 sm:pl-10 pr-20 bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-1 sm:focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 h-10 sm:h-12 text-xs sm:text-sm"
                                        />
                                        {/* Eye icon */}
                                        <div
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-8 sm:right-10 top-1/2 transform -translate-y-1/2 cursor-pointer text-white/50"
                                        >
                                            {showPassword ? <EyeOff className="w-4 sm:w-5 h-4 sm:h-5" /> : <Eye className="w-4 sm:w-5 h-4 sm:h-5" />}
                                        </div>
                                        {/* Refresh icon */}
                                        <div
                                            onClick={() => generateStrongPassword(12)}
                                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white/50"
                                        >
                                            <RefreshCw className="w-4 sm:w-5 h-4 sm:h-5" />
                                        </div>
                                        {/* Password strength bar */}
                                        {form.password && (
                                            <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20 mt-1 rounded">
                                                <div className={`h-1 rounded ${strengthColor}`} style={{ width: `${(strength / 4) * 100}%` }} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sign Up Button */}
                                <Button onClick={handleSubmit} className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10 sm:h-12 text-sm sm:text-base font-semibold mt-4 sm:mt-6">
                                    Create Account
                                </Button>

                                {/* Divider */}
                                <div className="flex items-center gap-2 sm:gap-3 py-2">
                                    <div className="flex-1 h-px bg-white/20" />
                                    <span className="text-white/50 text-[8px] sm:text-xs uppercase tracking-wider">or continue with</span>
                                    <div className="flex-1 h-px bg-white/20" />
                                </div>

                                {/* Google Sign In */}
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center gap-2 sm:gap-3 justify-center bg-white/5 border-white/20 text-white hover:bg-white/10 h-10 sm:h-12 text-xs sm:text-sm"
                                >
                                    <Globe className="w-4 sm:w-5 h-4 sm:h-5" />
                                    <span className="font-medium">Google</span>
                                </Button>

                                {/* Sign In Link */}
                                <p className="text-center text-white/60 text-xs sm:text-sm mt-2 sm:mt-4">
                                    Already have an account?{" "}
                                    <a onClick={() => { navigate('/') }} className="text-teal-400 hover:text-teal-300 cursor-pointer font-medium">
                                        Sign In
                                    </a>
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
