"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

const placeholders = [
  {
    name: "%device_name%",
    description: "The name of the device",
    example: "Office Printer 01",
  },
  {
    name: "%device_mac%",
    description: "The MAC address of the device",
    example: "00:1A:2B:3C:4D:5E",
  },
  {
    name: "%device_ip%",
    description: "The IP address of the device",
    example: "192.168.1.100",
  },
  {
    name: "%device_status%",
    description: "The current status of the device",
    example: "offline",
  },
  {
    name: "%last_seen%",
    description: "When the device was last seen online",
    example: "01/02/2025, 14:30:00",
  },
  {
    name: "%device_location%",
    description: "The physical location of the device",
    example: "Building A - Floor 2",
  },
];

export default function PlaceholdersDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-auto" variant="ghost">
          <Info className="mr-2 h-4 w-4" />
          Placeholders
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-lg md:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Available Placeholders</DialogTitle>
          <DialogDescription>
            Use these placeholders in your email template. They will be replaced with actual device
            data when the email is sent.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {placeholders.map((placeholder) => (
            <div
              key={placeholder.name}
              className="p-4 border rounded-lg bg-accent/50 space-y-2"
            >
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-muted rounded text-sm font-mono font-semibold">
                  {placeholder.name}
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                {placeholder.description}
              </p>
              <div className="text-xs">
                <span className="text-muted-foreground">Example: </span>
                <span className="font-mono">{placeholder.example}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-card border border-blue-200 dark:border-blue-900 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Usage Tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Simply copy and paste these placeholders into your HTML content. They will be
            automatically replaced with real device data when the email is sent. You can use the
            preview feature to test how they look with actual device data.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
