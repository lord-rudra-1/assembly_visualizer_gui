"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface MemoryVisualizationProps {
  memory: Record<number, number>
}

export default function MemoryVisualization({ memory }: MemoryVisualizationProps) {
  const [searchAddress, setSearchAddress] = useState("")
  const [viewMode, setViewMode] = useState<"used" | "all">("used")
  const [highlightedAddress, setHighlightedAddress] = useState<number | null>(null)

  // Get memory addresses that have been written to
  const usedAddresses = Object.keys(memory)
    .map(Number)
    .sort((a, b) => a - b)

  // Generate a range of addresses to display
  const displayAddresses =
    viewMode === "used"
      ? usedAddresses.length > 0
        ? usedAddresses
        : Array.from({ length: 10 }, (_, i) => i)
      : Array.from({ length: 256 }, (_, i) => i)

  // Filter addresses based on search
  const filteredAddresses = searchAddress
    ? displayAddresses.filter(
        (addr) =>
          addr.toString().includes(searchAddress) ||
          (memory[addr] !== undefined && memory[addr].toString().includes(searchAddress)),
      )
    : displayAddresses

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search address or value..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={viewMode === "used" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("used")}
            className="rounded-none"
          >
            Used
          </Button>
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("all")}
            className="rounded-none"
          >
            All
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="grid grid-cols-2 bg-muted p-2 border-b">
          <div className="font-semibold text-sm">Address</div>
          <div className="font-semibold text-sm">Value</div>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {filteredAddresses.length > 0 ? (
            filteredAddresses.map((address) => {
              const hasValue = memory[address] !== undefined
              return (
                <div
                  key={address}
                  className={`grid grid-cols-2 p-2 text-sm border-b last:border-0 ${
                    hasValue ? "bg-primary/10" : ""
                  } ${highlightedAddress === address ? "bg-green-100 dark:bg-green-900/30" : ""}`}
                  onMouseEnter={() => setHighlightedAddress(address)}
                  onMouseLeave={() => setHighlightedAddress(null)}
                >
                  <div className="font-mono">{address}</div>
                  <div className="font-mono">
                    {hasValue ? (
                      <span className="font-bold text-primary">{memory[address]}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-4 text-center text-muted-foreground">No memory addresses match your search</div>
          )}
        </div>
      </div>

      <div className="p-3 bg-muted/50 rounded-md">
        <h3 className="text-sm font-semibold mb-2">Memory Visualization</h3>
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: Math.min(64, Math.max(16, usedAddresses.length)) }, (_, i) => {
            const address = i
            const hasValue = memory[address] !== undefined
            return (
              <div
                key={address}
                className={`aspect-square flex items-center justify-center text-xs border rounded-sm ${
                  hasValue ? "bg-primary text-primary-foreground" : "bg-muted border-muted-foreground/20"
                }`}
                title={`Address: ${address}, Value: ${hasValue ? memory[address] : 0}`}
              >
                {hasValue ? memory[address] : ""}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
