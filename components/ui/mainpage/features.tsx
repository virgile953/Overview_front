import {
  BatteryCharging,
  GitPullRequest,
  Layers,
  RadioTower,
  SquareKanban,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface Feature {
  heading: string;
  description: string;
  icon: React.ReactNode;
}

interface FeaturesProps {
  title?: string;
  features?: Feature[];
  buttonText?: string;
  buttonUrl?: string;
}

const Features = ({
  title = "Complete Device Monitoring & Management Platform",
  features = [
    {
      heading: "Real-time Monitoring",
      description:
        "Monitor all your devices in real-time with automatic status updates. Track online/offline status, last seen timestamps, and receive instant notifications when device states change.",
      icon: <RadioTower className="size-6" />,
    },
    {
      heading: "Multi-Organization Support",
      description:
        "Seamlessly manage multiple organizations with isolated device inventories. Switch between organizations instantly and maintain separate device collections for each team or client.",
      icon: <Layers className="size-6" />,
    },
    {
      heading: "Smart Device Cache",
      description:
        "Intelligent caching system that tracks devices before they're stored in the database. Configure automatic purging of inactive cache-only devices with customizable time thresholds.",
      icon: <BatteryCharging className="size-6" />,
    },
    {
      heading: "Live Updates",
      description:
        "WebSocket-powered live updates ensure you always see the latest device status without refreshing. Get instant notifications when devices come online, go offline, or are removed.",
      icon: <WandSparkles className="size-6" />,
    },
    {
      heading: "Comprehensive Analytics",
      description:
        "Detailed statistics showing total devices, online/offline counts, database-linked devices, and cache-only devices. Track device activity patterns and optimize your infrastructure.",
      icon: <SquareKanban className="size-6" />,
    },
    {
      heading: "Flexible Configuration",
      description:
        "Customize offline thresholds, cache purge intervals, and monitoring settings on the fly. Adjust parameters per organization to match your specific monitoring requirements.",
      icon: <GitPullRequest className="size-6" />,
    },
  ],
  buttonText = "Get Started",
  buttonUrl = "/dashboard",
}: FeaturesProps) => {
  return (
    <section className="py-32" id="features">
      <div className="container">
        {title && (
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-pretty text-4xl font-medium lg:text-5xl">
              {title}
            </h2>
          </div>
        )}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col">
              <div className="bg-accent mb-5 flex size-16 items-center justify-center rounded-full">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.heading}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        {buttonUrl && (
          <div className="mt-16 flex justify-center">
            <Button size="lg" asChild>
              <a href={buttonUrl}>{buttonText}</a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export { Features };
