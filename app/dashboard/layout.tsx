import DashboardLayout from "../ui/Layout/DashboardLayout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side authentication check
 

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}