"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EyeIcon, EyeOffIcon, CheckCircle, XCircle } from "lucide-react";
import { createSupabaseClient } from "@/lib/supaBaseClient";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
  };

  const login = async () => {
    const client = createSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      alert(`Problem in login: ${error.message}`);
    } else {
      router.push(`/users/${email.slice(email.indexOf("@"))}`);
    }
  };

  const resetPassword = async () => {
    if (!validateEmail(resetEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    const client = createSupabaseClient();
    const { data, error } = await client.auth.resetPasswordForEmail(resetEmail);

    if (error) {
      alert(`Problem in resetting password: ${error.message}`);
    } else {
      setResetEmailSent(true);
    }
  };

  return (
    <div className="login_back flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg text-white space-y-5 border-0 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center sm:text-3xl">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-gray-200 text-sm sm:text-base">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-gray-200 text-sm sm:text-base"
            >
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="m@example.com"
                className="bg-white bg-opacity-20 border-gray-300 text-white placeholder:text-gray-300 pr-10"
              />
              {email && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isValidEmail ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {email && !isValidEmail && (
              <p className="text-red-400 text-xs mt-1">
                Please enter a valid email address.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-gray-200 text-sm sm:text-base"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                className="bg-white bg-opacity-20 border-gray-300 text-white placeholder:text-gray-300 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white hover:bg-opacity-10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-gray-300" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-300" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="link"
                className="text-gray-300 hover:text-white p-0 h-auto"
              >
                Forgot password?
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white bg-opacity-10 backdrop-blur-lg text-white">
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription className="text-gray-200">
                  Enter your email address to receive a password reset link.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-gray-200">
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="m@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="bg-white bg-opacity-20 border-gray-300 text-white placeholder:text-gray-300"
                  />
                </div>
                {resetEmailSent && (
                  <p className="text-green-400 text-sm">
                    Password reset link sent to email. Please check your inbox.
                  </p>
                )}
                <Button
                  onClick={resetPassword}
                  className="w-full bg-white text-purple-700 hover:bg-gray-100"
                >
                  Send Reset Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-white text-purple-700 hover:bg-gray-100 text-sm sm:text-base py-2 sm:py-3"
            disabled={!isValidEmail}
            onClick={login}
          >
            Log In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
