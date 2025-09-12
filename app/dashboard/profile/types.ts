export interface User {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  phone: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  mfa: boolean;
  status: boolean;
  registration: string;
  passwordUpdate: string;
  accessedAt: string;
  labels: string[];
  prefs: Record<string, string>;
  targets: Array<{
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    userId: string;
    providerId: string | null;
    providerType: string;
    identifier: string;
    expired: boolean;
  }>;
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
