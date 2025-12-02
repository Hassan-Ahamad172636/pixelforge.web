import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Globe, Sparkles, Mail, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function Login() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token')
  const baseUrl = import.meta.env.VITE_APP_BASE_URL
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in both fields");
      toast.error("Please fill in both fields")
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${baseUrl}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",  // YEHHH!!! ZAROORI HAI
          // Authentication header mat daalo login pe (token toh abhi nahi hai na!)
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Login failed");
      }

      const data = await response.json();

      // Ab data structure match karo tumhare backend se
      const token = data.data.token;
      const user = data.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/chat/new", { replace: true });

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">
              PixelForge AI
            </h2>

            <p className="text-sm sm:text-base lg:text-xl text-white/80 mb-8 lg:mb-12">
              Generate stunning visuals with the power of AI
            </p>

            <div className="space-y-4 lg:space-y-6 text-left">
              {[
                { title: "Generate Images", desc: "Create high-quality images from text" },
                { title: "Powered by FLUX.1", desc: "Lightning-fast, high-quality AI model" },
                { title: "Unlimited Access", desc: "No limits. Generate as much as you want" }
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

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">

            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-2 sm:mb-4">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-teal-300" />
              </div>
              <h1 className="text-white text-2xl sm:text-3xl font-bold">PixelForge AI</h1>
            </div>

            {/* Login Card */}
            <Card className="rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-white text-2xl sm:text-3xl font-bold">
                  Welcome Back
                </CardTitle>
                <p className="text-white/70 text-xs sm:text-sm mt-1 sm:mt-2">
                  Login to start generating beautiful AI images
                </p>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Email */}
                  <div className="space-y-1">
                    <Label className="text-white/90 text-xs sm:text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 h-12"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <Label className="text-white/90 text-xs sm:text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 h-12"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white h-12 text-base font-bold mt-6 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-white/20" />
                  <span className="text-white/50 text-xs uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-white/20" />
                </div>

                {/* Google Login (Coming Soon) */}
                <Button
                  variant="outline"
                  disabled
                  className="w-full flex items-center gap-3 justify-center bg-white/5 border-white/20 text-white/70 h-12"
                >
                  <Globe className="w-5 h-5" />
                  <span>Continue with Google (Soon)</span>
                </Button>

                {/* Sign Up Link */}
                <p className="text-center text-white/60 text-sm mt-6">
                  Don't have an account?{" "}
                  <span
                    onClick={() => navigate('/sign-up')}
                    className="text-teal-400 hover:text-teal-300 cursor-pointer font-bold underline-offset-2 hover:underline"
                  >
                    Sign Up Free
                  </span>
                </p>

              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;