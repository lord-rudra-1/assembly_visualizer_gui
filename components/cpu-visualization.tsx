"use client"

import { useState } from "react"
import type { CpuState } from "@/lib/assembler"
import { ArrowRight } from "lucide-react"

interface CpuVisualizationProps {
  cpuState: CpuState
  currentInstruction: string | null
  executionHistory: any[]
}

export default function CpuVisualization({ cpuState, currentInstruction, executionHistory }: CpuVisualizationProps) {
  const [highlightedReg, setHighlightedReg] = useState<string | null>(null)

  // Get the last executed instruction's affected registers
  const lastExecution = executionHistory[executionHistory.length - 1]
  const affectedRegisters = lastExecution
    ? Object.keys(lastExecution.state.registers).filter((reg) => {
        if (executionHistory.length < 2) return false
        const prevExecution = executionHistory[executionHistory.length - 2]
        return prevExecution && lastExecution.state.registers[reg] !== prevExecution.state.registers[reg]
      })
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md bg-background border-2 border-primary rounded-lg p-4 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background px-2 text-primary font-bold">
            CPU
          </div>

          <div className="text-center mb-4">
            {currentInstruction ? (
              <div className="font-mono bg-muted p-2 rounded-md inline-block">{currentInstruction}</div>
            ) : (
              <div className="text-muted-foreground italic">No instruction</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Instruction Pointer</h3>
              <div className="font-mono bg-muted p-2 rounded-md text-center">{cpuState.ip}</div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Flags</h3>
              <div className="font-mono bg-muted p-2 rounded-md text-center">
                Z: {cpuState.flags.zero ? "1" : "0"} | N: {cpuState.flags.negative ? "1" : "0"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Registers</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(cpuState.registers).map(([reg, value]) => (
            <div
              key={reg}
              className={`p-3 rounded-md border-2 transition-colors ${
                affectedRegisters.includes(reg)
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                  : highlightedReg === reg
                    ? "border-primary/50 bg-primary/5"
                    : "border-border"
              }`}
              onMouseEnter={() => setHighlightedReg(reg)}
              onMouseLeave={() => setHighlightedReg(null)}
            >
              <div className="text-xs text-muted-foreground">Register {reg}</div>
              <div className="font-mono text-lg text-center">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Data Flow</h3>
        {lastExecution ? (
          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono">{lastExecution.instruction}</span>
              <ArrowRight className="h-4 w-4 text-primary" />
              <span>{lastExecution.description}</span>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground italic">No data flow yet</div>
        )}
      </div>
    </div>
  )
}
