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
    <div className="min-h-screen flex font-sans bg-gray-950">
      {/* Left panel with diagonal cut */}
      <div className="relative w-1/2 flex items-center justify-center overflow-hidden">
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
      {/* Right panel with login form */}
      <div className="w-1/2 flex items-center justify-center bg-gray-950">
        <div className="flex flex-col gap-6 w-full max-w-lg p-10 rounded-xl shadow-2xl bg-gray-900 border border-gray-800">
          <h1 className="text-4xl font-bold text-emerald-400 mb-2 font-mono">Login</h1>
          <h2 className="flex gap-2 text-base font-light text-gray-300 mb-4">
            Don&apos;t have an account?
            <Link href="/register" className="text-emerald-400 hover:underline">Register</Link>
          </h2>
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="p-3 bg-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-3 bg-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
              required
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white py-3 rounded font-semibold hover:bg-emerald-700 transition mb-2"
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
            <span className="text-gray-400 text-sm">Or login with</span>
            <div className="h-px bg-gray-700 flex-1" />
          </div>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => { alert("Google OAuth login not yet implemented."); }}
              className="flex justify-center gap-2 w-full border border-gray-700 hover:border-gray-500 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <Image src="/google.svg" alt="Google logo" width={20} height={20} />
              <span className="text-gray-300">Google</span>
            </button>
            <button
              onClick={() => { alert("GitHub OAuth login not yet implemented."); }}
              className="flex justify-center gap-2 w-full border border-gray-700 hover:border-gray-500 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <Image src="/github.svg" alt="GitHub logo" width={20} height={20} />
              <span className="text-gray-300">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}