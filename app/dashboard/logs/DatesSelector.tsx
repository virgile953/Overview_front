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
import { useLogsContext } from "./LogsClientWrapper"

export default function DatesSelector() {
const {dateRange, setDateRange} = useLogsContext();
  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!dateRange}
          className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal w-fit"
        >
          <CalendarIcon />
          {dateRange && dateRange.from && dateRange.to ? 
          dateRange.from.toLocaleDateString("fr-FR") + " -> " + dateRange.to.toLocaleDateString("fr-FR")
          
          : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-lg">
        <Calendar className="rounded-lg bg-popover" classNames={{weekday: "p-1"}} mode="range" selected={dateRange} onSelect={setDateRange} />
      </PopoverContent>
    </Popover>
  )
}