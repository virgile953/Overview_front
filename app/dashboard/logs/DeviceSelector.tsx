"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLogsContext } from "./LogsClientWrapper";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DeviceSelector() {
  const { initialDevices, devices, setDevices } = useLogsContext();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full lg:w-fit justify-between"
        >
          {devices && devices.length > 0 ?
            devices.length + " selected"
            : "Select devices..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search devices..." />
          <CommandList>
            <CommandEmpty>No devices found.</CommandEmpty>
            <CommandGroup>
              {initialDevices && initialDevices.map((device) => (
                <CommandItem
                  key={device.id}
                  value={device.id}
                  onSelect={() => {
                    if (!device.id) return;
                    
                    if (devices && devices.some(d => d.id === device.id)) {
                      setDevices(devices.filter(d => d.id !== device.id));
                    } else {
                      setDevices([...(devices || []), {...device, id: device.id!}]);
                    }

                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      devices && devices.some(d => d.id === device.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {device.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}