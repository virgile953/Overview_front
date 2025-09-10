"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { handleLogin } from "./actions";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await handleLogin(formData);

      if (result?.success) {
        router.push("/dashboard");
      } else {
        setError(result?.error || "Login failed");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-gray-950">
      {/* Left panel with diagonal cut - hidden on mobile, shown on large screens */}
      <div className="hidden lg:flex relative lg:w-1/2 items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-900"
          style={{
            clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)",
            opacity: 0.85,
          }}
        />
        <Image
          src="/loginPageImage2.jpg"
          alt="Background Image"
          fill
          className="absolute inset-0 object-cover opacity-40"
        />
        <div className="relative z-10 text-center text-white px-12">
          <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg">Overview</h1>
          <p className="text-2xl font-light">Welcome back</p>
        </div>
      </div>

      {/* Mobile header - only shown on small screens */}
      <div className="lg:hidden text-center py-8 px-4 ">
        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2">Overview</h1>
        <p className="text-lg text-gray-300">Welcome back</p>
      </div>

      {/* Right panel with login form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center bg-gray-950 px-4 py-8 lg:py-0">
        <div className="flex flex-col gap-4 md:gap-6 w-full max-w-sm md:max-w-lg p-6 md:p-10 rounded-xl shadow-2xl bg-gray-900 border border-gray-800">
          <h1 className="text-2xl md:text-4xl font-bold text-emerald-400 mb-2 font-mono">Login</h1>
          <h2 className="flex flex-col sm:flex-row sm:gap-2 text-sm md:text-base font-light text-gray-300 mb-2 md:mb-4">
            <span>Don&apos;t have an account?</span>
            <Link href="/register" className="text-emerald-400 hover:underline">Register</Link>
          </h2>

          <form onSubmit={onSubmit} className="flex flex-col gap-4 md:gap-6">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="p-3 bg-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400 text-sm md:text-base"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-3 bg-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400 text-sm md:text-base"
              required
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white py-3 rounded font-semibold hover:bg-emerald-700 transition mb-2 text-sm md:text-base"
              disabled={isPending}
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
            {error && (
              <div className="text-red-400 text-sm mt-2">{error}</div>
            )}
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-700 flex-1" />
            <span className="text-gray-400 text-xs md:text-sm">Or login with</span>
            <div className="h-px bg-gray-700 flex-1" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-2">
            <button
              onClick={() => { alert("Google OAuth login not yet implemented."); }}
              className="flex justify-center gap-2 w-full border border-gray-700 hover:border-gray-500 px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <Image src="/google.svg" alt="Google logo" width={18} height={18} className="md:w-5 md:h-5" />
              <span className="text-gray-300 text-sm md:text-base">Google</span>
            </button>
            <button
              onClick={() => { alert("GitHub OAuth login not yet implemented."); }}
              className="flex justify-center gap-2 w-full border border-gray-700 hover:border-gray-500 px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <Image src="/github.svg" alt="GitHub logo" width={18} height={18} className="md:w-5 md:h-5" />
              <span className="text-gray-300 text-sm md:text-base">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}