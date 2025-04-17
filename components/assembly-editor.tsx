"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"

interface AssemblyEditorProps {
  code: string
  onChange: (code: string) => void
}

export default function AssemblyEditor({ code, onChange }: AssemblyEditorProps) {
  const [value, setValue] = useState(code)

  useEffect(() => {
    setValue(code)
  }, [code])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange(newValue)
  }

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      className="font-mono text-sm h-40 resize-none"
      placeholder="Enter assembly code here..."
    />
  )
}
