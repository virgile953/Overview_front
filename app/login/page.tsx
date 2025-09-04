"use client";

import Image from "next/image";

export default function Login() {
  return (
    <div className="min-h-screen flex font-sans">
      {/* Left panel with diagonal cut */}

      <div className="w-2/3 relative flex items-center justify-center overflow-clip">
        <Image
          src="/loginPageImage2.jpg"
          alt="Background Image"
          fill
          objectFit="cover"
          className="absolute inset-0 opacity-50 object-left"
        />
        <div className="relative z-10 h-full flex flex-col place-content-between text-center text-white p-24">
          <h1 className="text-7xl font-bold mb-4">Overview</h1>
          <p className="text-2xl">Welcome back</p>
        </div>
      </div>
      {/* Right panel with login form */}
      <div className="w-1/2 flex items-center justify-center bg-black">
        <form className="flex flex-col gap-6 w-full max-w-md p-8 rounded-lg shadow-lg bg-black">
          <h1 className="text-2xl font-bold text-shadow-emerald-400 mb-2">Login</h1>
          <input
            type="text"
            placeholder="Username"
            className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}