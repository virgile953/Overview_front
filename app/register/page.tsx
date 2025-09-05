"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Example handler (replace with your registration logic)
  const handleRegister = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // You can now use firstName, lastName, email, password for registration
    // Example: call Appwrite or your API here
    console.log({ firstName, lastName, email, password });
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
      {/* Right panel with registration form */}
      <div className="w-1/2 flex items-center justify-center bg-gray-950">
        <div className="flex flex-col gap-6 w-full max-w-lg p-10 rounded-xl shadow-2xl bg-gray-900 border border-gray-800">
          <h1 className="text-4xl font-bold text-emerald-400 mb-2 font-mono">Create an account</h1>
          <h2 className="flex gap-2 text-base font-light text-gray-300 mb-4">
            Already have an account?
            <Link href="/login" className="text-emerald-400 hover:underline">Log in</Link>
          </h2>
          <div className="flex flex-row gap-4">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="p-3 bg-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-3 bg-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <button
            onClick={handleRegister}
            className="bg-emerald-600 text-white py-3 rounded font-semibold hover:bg-emerald-700 transition mb-2"
          >
            Create account
          </button>
          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-700 flex-1" />
            <span className="text-gray-400 text-sm">Or register with</span>
            <div className="h-px bg-gray-700 flex-1" />
          </div>
          <div className="flex gap-4 mt-2">
            <button className="flex justify-center gap-2 w-full border border-gray-700 hover:border-gray-500 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
              <Image src="/google.svg" alt="Google logo" width={20} height={20} />
              <span className="text-gray-300">Google</span>
            </button>
            <button className="flex justify-center gap-2 w-full border border-gray-700 hover:border-gray-500 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
              <Image src="/github.svg" alt="GitHub logo" width={20} height={20} />
              <span className="text-gray-300">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}