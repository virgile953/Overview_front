"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRange } from "react-day-picker"

export default function DatesSelector() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    })(),
    to: new Date(),
  })
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!dateRange}
          className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal"
        >
          <CalendarIcon />
          {dateRange && dateRange.from && dateRange.to ? 
          dateRange.from.toLocaleDateString("fr-FR") + " -> " + dateRange.from.toLocaleDateString("fr-FR")
          
          : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar classNames={{weekday: "p-2"}} mode="range" selected={dateRange} onSelect={setDateRange} />
      </PopoverContent>
    </Popover>
  )
}