"use client";
import { account } from "@/models/client/config";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function VerifyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Verifying your email...</h1>
      <p className="text-lg">Please wait while we verify your email address.</p>
      <EmailVerification />
    </div>
  );
}


function EmailVerification() {
  const searchParams = useSearchParams();

  const secret = searchParams.get('secret');
  const userId = searchParams.get('userId');

  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!secret || !userId) {
      setStatus("error");
      setErrorMessage("Missing secret or userId in URL parameters");
      return;
    }
    account.updateVerification(userId, secret)
      .then(() => {
        setStatus("success");
      })
      .catch((error: unknown) => {
        setStatus("error");
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unknown error");
        }
      });
  }, [secret, userId]);

  if (status === "pending") {
    return (
      <div className="mt-6 p-4 bg-gray-800 rounded">
        <h2 className="text-2xl font-semibold mb-2">Verifying...</h2>
        <p className="text-lg">Please wait while we verify your email address.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mt-6 p-4 bg-green-800 rounded">
        <h2 className="text-2xl font-semibold mb-2">Email Verified Successfully!</h2>
        <p className="text-lg">Thank you for verifying your email. You can now log in to your account.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-red-800 rounded">
      <h2 className="text-2xl font-semibold mb-2">Email Verification Failed</h2>
      <p className="text-lg">There was an error verifying your email: {errorMessage}</p>
    </div>
  );
}






