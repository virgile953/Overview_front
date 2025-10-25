import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function EmailsPage() {

  const session = auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Email Templates</h1>
      <p>Manage your email templates here.</p>
    </div>
  );
}