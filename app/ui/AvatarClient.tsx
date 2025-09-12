"use client";
import { useState, useEffect } from 'react';
import { Md5 } from 'ts-md5';
import Image from 'next/image';

interface AvatarClientProps {
  email?: string;
  name?: string;
  size?: string;
  textSize?: string;
  className?: string;
}

async function checkGravatarExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AvatarClient({
  email,
  name,
  size = "w-8 h-8",
  textSize = "text-sm",
  className = ""
}: AvatarClientProps) {
  const [gravatarUrl, setGravatarUrl] = useState<string | null>(null);
  const [gravatarExists, setGravatarExists] = useState<boolean>(false);
  const [gravatarLoading, setGravatarLoading] = useState<boolean>(false);

  const sizeMap: Record<string, number> = {
    "w-8 h-8": 32,
    "w-12 h-12": 48,
    "w-16 h-16": 64,
    "w-20 h-20": 80
  };
  
  const imageSize = sizeMap[size] || 32;

  useEffect(() => {
    if (email) {
      setGravatarLoading(true);
      const emailHash = Md5.hashStr(email.trim().toLowerCase());
      const url = `https://www.gravatar.com/avatar/${emailHash}?d=404&s=200`;
      
      setGravatarUrl(url);

      checkGravatarExists(url).then(exists => {
        setGravatarExists(exists);
        setGravatarLoading(false);
      }).catch(() => {
        setGravatarExists(false);
        setGravatarLoading(false);
      });
    }
  }, [email]);

  if (gravatarLoading) {
    return (
      <div className={`${size} bg-muted rounded-full flex items-center justify-center animate-pulse ${className}`}>
        <span className={`text-muted-foreground ${textSize} font-medium`}>...</span>
      </div>
    );
  }

  if (gravatarExists && gravatarUrl) {
    return (
      <div className={`${size} rounded-full overflow-hidden bg-primary flex items-center justify-center ${className}`}>
        <Image
          src={gravatarUrl}
          alt={`${name || 'User'} profile picture`}
          width={imageSize}
          height={imageSize}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${size} bg-primary rounded-full flex items-center justify-center ${className}`}>
      <span className={`text-primary-foreground ${textSize} font-medium`}>
        {name ? getInitials(name) : 'U'}
      </span>
    </div>
  );
}
