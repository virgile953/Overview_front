"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  weeklyPrice: string;
  monthlyPrice: string;
  features: PricingFeature[];
  button: {
    text: string;
    url: string;
  };
}

interface PricingProps {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
}

const Pricing = ({
  heading = "Pricing",
  description = "Check out our affordable pricing plans",
  plans = [
    {
      id: "free",
      name: "Free",
      description: "For testing",
      weeklyPrice: "€0",
      monthlyPrice: "€0",
      features: [
        { text: "Limited to 1 alerted user" },
        { text: "No support" },
        { text: "Logs keps for a week" },
      ],
      button: {
        text: "Register",
        url: "/register",
      },
    },
    {
      id: "plus",
      name: "Plus",
      description: "For a single user",
      weeklyPrice: "€25",
      monthlyPrice: "€100",
      features: [
        { text: "Up to 5 team members" },
        { text: "Up to 2 groups" },
        { text: "Basic support" },
        { text: "Logs keps for two weeks" },
      ],
      button: {
        text: "Purchase",
        url: "/register",
      },
    },
    {
      id: "pro",
      name: "Pro",
      description: "For organizations",
      weeklyPrice: "€50",
      monthlyPrice: "€200",
      features: [
        { text: "Unlimited team members" },
        { text: "Unlimited groups" },
        { text: "Priority support" },
        { text: "Unlimited logs" },
        { text: "Data exports" },
      ],
      button: {
        text: "Purchase",
        url: "/register",
      },
    },
  ],
}: PricingProps) => {
  const [isMonthly, setIsMonthly] = useState(false);
  return (
    <section className="py-32" id="pricing">
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h2 className="text-pretty text-4xl font-semibold lg:text-6xl">
            {heading}
          </h2>
          <p className="text-muted-foreground lg:text-xl">{description}</p>
          <div className="flex items-center gap-3 text-lg">
            Weekly
            <Switch
              checked={isMonthly}
              onCheckedChange={() => setIsMonthly(!isMonthly)}
            />
            Monthly
          </div>
          <div className="flex flex-col items-stretch gap-6 md:flex-row">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="flex w-80 flex-col justify-between text-left"
              >
                <CardHeader>
                  <CardTitle>
                    <p>{plan.name}</p>
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {plan.description}
                  </p>
                  <div className="flex items-end">
                    <span className="text-4xl font-semibold">
                      {isMonthly ? plan.monthlyPrice : plan.weeklyPrice}
                    </span>
                    <span className="text-muted-foreground text-2xl font-semibold">
                      {plan.weeklyPrice !== "€0" ? (isMonthly ? "/mo" : "/wk") : ""}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-6" />
                  {plan.id === "pro" && (
                    <p className="mb-3 font-semibold">
                      Everything in Plus, and:
                    </p>
                  )}
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CircleCheck className="size-4" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <a href={plan.button.url} target="_blank">
                      {plan.button.text}
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Pricing };
