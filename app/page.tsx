import { Hero } from "@/components/ui/mainpage/hero";
import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
// import { useTheme } from "next-themes";

export default function Home() {
  return (
    <>
      <Navbar01 signInHref="login" ctaHref="register" />

      <main className="max-w-7xl mx-auto p-4">
        <Hero
          badge=""
          buttons={{
            primary: {
              text: "Get Started",
              url: "/register",
            },
            secondary: {
              text: "Learn More",
              url: "/about",
            }
          }}
          heading={"Overview"}
          description={"The simple and easy to deploy status manager for temporary installs"}
          image={{
            src: "/logo/noBgColor.png",
            alt: "logo"
          }} />
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <p>Welcome to the Device Cache Management System</p>
        </div>
      </main>
    </>
  );
}
