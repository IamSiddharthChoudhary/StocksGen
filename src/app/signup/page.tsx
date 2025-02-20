"use client";

import { redirect, useRouter } from "next/navigation";
import { useState, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseClient } from "@/lib/supaBaseClient";
import Loading from "@/components/fancy-dark-loading";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [signUpAvailability, setSignUpAvailability] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (pass: string) => pass.length >= 8;

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsValidPassword(validatePassword(newPassword));
  };

  useEffect(() => {
    setSignUpAvailability(
      validateEmail(email) &&
        validatePassword(password) &&
        firstName.trim() !== "" &&
        lastName.trim() !== ""
    );
  }, [email, password, firstName, lastName]);

  const handleSignUp = async () => {
    if (signUpAvailability) {
      setIsLoading(true);
      const client = createSupabaseClient();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) {
        alert(error.message);
        setIsLoading(false);
      } else {
        router.push(`/users/${email.slice(email.indexOf("@"))}`);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="login_back flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg text-white space-y-5 border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center sm:text-3xl">
            Sign Up
          </CardTitle>
          <CardDescription className="text-center text-gray-200 text-sm sm:text-base">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="first-name"
                  className="text-gray-200 text-sm sm:text-base"
                >
                  First name
                </Label>
                <Input
                  id="first-name"
                  placeholder="John"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white bg-opacity-20 border-gray-300 text-white placeholder:text-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="last-name"
                  className="text-gray-200 text-sm sm:text-base"
                >
                  Last name
                </Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white bg-opacity-20 border-gray-300 text-white placeholder:text-gray-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-200 text-sm sm:text-base"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                onChange={handleEmailChange}
                required
                className="bg-opacity-20 border-gray-300 text-white placeholder:text-gray-300"
              />
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
                  required
                  onChange={handlePasswordChange}
                  className="bg-opacity-20 border-gray-300 text-white placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {password && !isValidPassword && (
                <p className="text-red-500 text-xs mt-1">
                  Password must be at least 8 characters long.
                </p>
              )}
            </div>

            <Button
              type="button"
              className="w-full bg-white text-purple-700 hover:bg-gray-100 text-sm sm:text-base py-2 sm:py-3"
              disabled={!signUpAvailability}
              onClick={handleSignUp}
            >
              Sign Up
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
