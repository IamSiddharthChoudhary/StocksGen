"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supaBaseClient";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Home() {
  const [stockName, setStockName] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleStockNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    setStockName(e.target.value);
  };

  const handlePasswordInput = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage(""); // Reset the message

    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (password !== adminPassword) {
      setMessage("Invalid password. Please try again.");
      setPassword("");
      setIsLoading(false);
      setTimeout(() => {
        setMessage("");
      }, 3000);

      return;
    }

    const supabase = createSupabaseClient();
    try {
      const { data, error } = await supabase
        .from("company")
        .delete()
        .eq("ticker", stockName);

      if (error) {
        console.error("Delete error:", error.message);
        setMessage("An error occurred. Please try again.");
      } else {
        setMessage("Stock data deleted successfully.");
        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Caught error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gradient-bg relative min-h-screen">
      <div className="absolute inset-0 flex flex-col items-center justify-between text-white z-10">
        <header className="w-full bg-black bg-opacity-20 shadow-lg">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <h1 className="text-4xl font-bold tracking-tight">StockGen</h1>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center flex-grow w-full px-4">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Wipe data
              <br />
              with a Single Click
            </h2>
          </div>

          <div className="flex flex-col space-y-4 w-full max-w-md">
            <input
              type="text"
              onChange={handleStockNameInput}
              value={stockName}
              className="p-3 text-black rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Enter Ticker name"
            />
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password types
                onChange={handlePasswordInput}
                value={password}
                className="p-3 text-black rounded-lg shadow-md w-full focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Enter password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-4 w-8 px-1 py-5 hover:bg-black hover:bg-opacity-10"
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
            <button
              onClick={handleSubmit}
              disabled={isLoading || !stockName || !password}
              className={`px-6 py-3 ${
                isLoading || !stockName || !password
                  ? "bg-slate-600"
                  : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              } rounded-lg text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300`}
            >
              {isLoading ? "Processing..." : "Delete Stock Data"}
            </button>
          </div>

          {message && (
            <p className="mt-4 text-center text-lg font-semibold">{message}</p>
          )}
        </main>

        <footer className="w-full bg-black bg-opacity-20 backdrop-blur-sm py-4">
          <div className="container mx-auto px-4 text-center text-sm">
            © 2025 StockGen. All rights reserved.
          </div>
        </footer>
      </div>

      <div className="g1"></div>
      <div className="g2"></div>
      <div className="g3"></div>
      <div className="g4"></div>
      <div className="g5"></div>
    </div>
  );
}
