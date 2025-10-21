import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
// export interface Navbar01Props extends React.HTMLAttributes<HTMLElement> {
//   logo?: React.ReactNode;
//   logoHref?: string;
//   navigationLinks?: Navbar01NavLink[];
//   signInText?: string;
//   signInHref?: string;
//   ctaText?: string;
//   ctaHref?: string;
//   onSignInClick?: () => void;
//   onCtaClick?: () => void;
// }

export default function Home() {
  return (
    <>
      <Navbar01 signInHref="login" ctaHref="register" />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <p>Welcome to the Device Cache Management System</p>
        </div>
      </main>
    </>
  );
}
