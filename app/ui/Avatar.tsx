"use client";
import { useState, useEffect, useMemo } from 'react';
import { Md5 } from 'ts-md5';
import Image from 'next/image';

interface AvatarProps {
  email?: string;
  name?: string;
  size?: string;
  textSize?: string;
  className?: string;
  // Optional props to pass pre-fetched Gravatar data
  gravatarUrl?: string | null;
  gravatarExists?: boolean;
  gravatarLoading?: boolean;
}

export default function Avatar({
  email,
  name,
  size = "w-8 h-8",
  textSize = "text-sm",
  className = "",
  gravatarUrl: passedGravatarUrl,
  gravatarExists: passedGravatarExists,
  gravatarLoading: passedGravatarLoading
}: AvatarProps) {
  const [gravatarUrl, setGravatarUrl] = useState<string | null>(passedGravatarUrl || null);
  const [gravatarExists, setGravatarExists] = useState<boolean>(passedGravatarExists || false);
  const [gravatarLoading, setGravatarLoading] = useState<boolean>(passedGravatarLoading || false);

  // Use passed data if available, otherwise fetch
  const shouldFetch = !passedGravatarUrl && !passedGravatarLoading && email;

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  const checkGravatarExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Update state when passed props change
    if (passedGravatarUrl !== undefined) {
      setGravatarUrl(passedGravatarUrl);
    }
    if (passedGravatarExists !== undefined) {
      setGravatarExists(passedGravatarExists);
    }
    if (passedGravatarLoading !== undefined) {
      setGravatarLoading(passedGravatarLoading);
    }
  }, [passedGravatarUrl, passedGravatarExists, passedGravatarLoading]);

  useEffect(() => {
    if (shouldFetch) {
      setGravatarLoading(true);
      const emailHash = Md5.hashStr(email!.trim().toLowerCase());
      const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=404&s=200`;

      setGravatarUrl(gravatarUrl);

      // Check if Gravatar exists
      checkGravatarExists(gravatarUrl).then(exists => {
        setGravatarExists(exists);
        setGravatarLoading(false);
      });
    }
  }, [shouldFetch, email]);

  const handleGravatarError = () => {
    setGravatarExists(false);
  };

  if (gravatarLoading) {
    return (
      <div className={`${size} bg-gray-400 rounded-full flex items-center justify-center animate-pulse ${className}`}>
        <span className={`text-gray-300 ${textSize} font-medium`}>...</span>
      </div>
    );
  }

  if (gravatarExists && gravatarUrl) {
    return (
      <div className={`${size} rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center ${className}`}>
        <Image
          src={gravatarUrl}
          alt="Profile"
          width={size === "w-12 h-12" ? 48 : 32}
          height={size === "w-12 h-12" ? 48 : 32}
          className="w-full h-full object-cover"
          onError={handleGravatarError}
        />
      </div>
    );
  }

  return (
    <div className={`${size} bg-emerald-500 rounded-full flex items-center justify-center ${className}`}>
      <span className={`text-white ${textSize} font-medium`}>
        {name ? getInitials(name) : 'U'}
      </span>
    </div>
  );
}