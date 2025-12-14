"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  error?: boolean
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  className,
  error,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !date && "text-muted-foreground",
            error && "border-destructive",
            className
          )}
        >
          {date ? date.toLocaleDateString() : placeholder}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(date) => {
            onDateChange(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateTimePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  error?: boolean
  disabled?: boolean
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  className,
  error,
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [time, setTime] = React.useState(
    date ? date.toTimeString().slice(0, 5) : "09:00"
  )

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = time.split(":").map(Number)
      const newDate = new Date(selectedDate)
      newDate.setHours(hours, minutes, 0, 0)
      onDateChange(newDate)
      setOpen(false)
    } else {
      onDateChange(undefined)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      onDateChange(newDate)
    }
  }

  return (
    <div
    className={cn(
      // 1. Create a unified container that looks like a standard input
      "flex items-center rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring",
      // 2. Handle error states on the container level
      error && "border-destructive focus-within:ring-destructive",
      className
    )}
  >
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost" // Change to ghost so it blends in
          disabled={disabled}
          className={cn(
            "flex-1 justify-start px-3 text-left font-normal hover:bg-transparent", // Remove hover bg to keep "input" feel
            !date && "text-muted-foreground"
          )}
        >
          {/* Icon first often looks better in unified inputs, but optional */}
          {date ? date.toLocaleDateString() : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>

    {/* Vertical Separator (Optional, adds polish) */}
    <div className="h-4 w-[1px] bg-border" />

    <input
      type="time"
      value={time}
      onChange={handleTimeChange}
      disabled={disabled}
      className={cn(
        // Remove separate borders and styling so it blends into the container
        "w-[90px] bg-transparent p-2 text-sm outline-none focus:ring-0",
        "appearance-none [&::-webkit-calendar-picker-indicator]:hidden",
        disabled && "cursor-not-allowed opacity-50"
      )}
    />
    
    {/* Icon at the far right indicates it's a dropdown */}
    <ChevronDownIcon className="mr-3 h-4 w-4 opacity-50" />
  </div>
  )
}
