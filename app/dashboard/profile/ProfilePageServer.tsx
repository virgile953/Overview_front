import { getLoggedInUser } from "@/models/server/auth";
import { redirect } from "next/navigation";
import PersonalInformation from "./components/PersonalInformation";
import SecurityVerification from "./components/SecurityVerification";
import AccountTimeline from "./components/AccountTimeline";
import UserPreferences from "./components/UserPreferences";
import AuthenticationTargets from "./components/AuthenticationTargets";
import AccountLabels from "./components/AccountLabels";
import { User } from "./types";

export default async function ProfilePage() {
  const user = await getLoggedInUser();
  
  if (!user) {
    redirect('/login');
  }

  const userData = user as User;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account information and settings</p>
      </div>

      <div className="space-y-6">
        <PersonalInformation user={userData} />
        <SecurityVerification user={userData} />
        <AccountTimeline user={userData} />
        <UserPreferences user={userData} />
        <AuthenticationTargets user={userData} />
        <AccountLabels user={userData} />
      </div>
    </div>
  );
}
