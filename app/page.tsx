import { Features } from "@/components/ui/mainpage/features";
import { Hero } from "@/components/ui/mainpage/hero";
import { Pricing } from "@/components/ui/mainpage/pricing";
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
          }}
          imageDark={{
            src: "/logo/noBgWhite.png",
            alt: "logo"
          }}
          imageLight={{
            src: "/logo/noBgBlack.png",
            alt: "logo"
          }} />
        <Features />
        <Pricing />
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <p>Welcome to the Device Cache Management System</p>
        </div>
      </main>
    </>
  );
}
