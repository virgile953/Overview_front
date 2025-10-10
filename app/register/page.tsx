"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    await authClient.signUp.email({
      email: email,
      password: password,
      name: `${firstName} ${lastName.toUpperCase()}`,
      callbackURL: `${window.location.origin}/dashboard`
    },
      {
        onRequest: () => {
          setError(null);
          setSuccess(null);
          setIsSubmitting(true);
        },
        onSuccess: () => {
          setIsSubmitting(false);
          router.push("/dashboard")

        },
        onError: (err) => {
          console.error("Registration error:", err);
          setError(err.error.message || "Registration failed. Please try again.");
          setIsSubmitting(false);
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-background">
      {/* Left panel with diagonal cut - hidden on mobile, shown on large screens */}
      <div className="hidden lg:flex relative lg:w-1/2 items-center justify-center overflow-hidden">
        <Image
          src="/loginPageImage2.jpg"
          alt="Background Image"
          fill
          className="absolute inset-0 object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/30"
          style={{
            clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-emerald-800/10"
          style={{
            clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
          }}
        />
        <div className="relative z-10 text-center text-white px-12">
          <h1 className="text-6xl font-extrabold mb-6 drop-shadow-2xl">Overview</h1>
          <p className="text-2xl font-light drop-shadow-lg">Join us today</p>
        </div>
      </div>

      {/* Mobile header - only shown on small screens */}
      <div className="lg:hidden text-center py-8 px-4 ">
        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">Overview</h1>
        <p className="text-lg text-muted-foreground">Join us today</p>
      </div>

      {/* Right panel with registration form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center bg-background px-4 py-8 lg:py-0">
        <div className="flex flex-col gap-4 md:gap-6 w-full max-w-sm md:max-w-lg p-6 md:p-10 rounded-xl
        shadow-2xl bg-sidebar-accent border border-sidebar-accent">
          <h1 className="text-2xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2 font-mono">Create an account</h1>
          <h2 className="flex flex-col sm:flex-row sm:gap-2 text-sm md:text-base font-light text-muted-foreground mb-2 md:mb-4">
            <span>Already have an account?</span>
            <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">Log in</Link>
          </h2>

          <form className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full p-3 bg-primary-foreground border-border border dark:border-none rounded focus:outline-none
                focus:ring-1 focus:ring-emerald-400 text-sm md:text-base"
                required
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full p-3 bg-primary-foreground border-border border dark:border-none rounded focus:outline-none
                focus:ring-1 focus:ring-emerald-400 text-sm md:text-base"
                required
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="p-3 bg-primary-foreground border-border border dark:border-none rounded focus:outline-none
              focus:ring-1 focus:ring-emerald-400 text-sm md:text-base"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-3 bg-primary-foreground border-border border dark:border-none rounded focus:outline-none
              focus:ring-1 focus:ring-emerald-400 text-sm md:text-base"
              required
            />
            <button
              onClick={handleRegister}
              className="bg-emerald-500 text-white py-3 rounded 
              font-semibold hover:bg-emerald-700 transition mb-2 text-sm md:text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
            {error && (
              <div className="text-red-400 text-sm mt-2">{error}</div>
            )}
            {success && (
              <div className="text-green-400 text-sm mt-2">{success}</div>
            )}
          </form>
          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-700 flex-1" />
            <span className="text-muted-foreground text-xs md:text-sm">Or register with</span>
            <div className="h-px bg-gray-700 flex-1" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-2">
            <button
              onClick={() => { alert("Google OAuth registration not yet implemented."); }}
              className="flex justify-center gap-2 w-full border border-gray-700 
              hover:border-gray-500 px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-primary-foreground
              dark:hover:bg-gray-700 transition"
            >
              <Image
                src="/google.svg"
                alt="Google logo"
                width={18}
                height={18}
                className="md:w-5 md:h-5" />
              <span className="text-muted-foreground text-sm md:text-base">Google</span>
            </button>
            <button
              onClick={() => { alert("GitHub OAuth registration not yet implemented."); }}
              className="flex justify-center gap-2 w-full border border-gray-700 
              hover:border-gray-500 px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-primary-foreground
              dark:hover:bg-gray-700 transition"
            >
              <Image
                src="/github.svg"
                alt="GitHub logo"
                width={18}
                height={18}
                className="md:w-5 md:h-5 invert dark:invert-0" />
              <span className="text-muted-foreground text-sm md:text-base">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}