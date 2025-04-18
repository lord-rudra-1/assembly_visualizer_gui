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
        <div className="w-full max-w-md bg-background border-2 border-primary/70 rounded-lg p-4 relative shadow-md">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background px-3 py-1 text-primary font-bold rounded-full shadow-sm border border-primary/30">
            CPU
          </div>

          <div className="text-center mb-4">
            {currentInstruction ? (
              <div className="font-mono bg-muted p-2 rounded-md inline-block border border-primary/20 shadow-sm">{currentInstruction}</div>
            ) : (
              <div className="text-muted-foreground italic flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                No instruction
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Instruction Pointer</h3>
              <div className="font-mono bg-muted p-2 rounded-md text-center border border-primary/20 shadow-sm">{cpuState.ip}</div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Flags</h3>
              <div className="font-mono bg-muted p-2 rounded-md text-center border border-primary/20 shadow-sm">
                <span className={`${cpuState.flags.zero ? "text-green-600 font-bold" : ""}`}>Z: {cpuState.flags.zero ? "1" : "0"}</span> | 
                <span className={`${cpuState.flags.negative ? "text-amber-600 font-bold" : ""}`}>N: {cpuState.flags.negative ? "1" : "0"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M6 9h4" /><path d="M14 9h4" /><path d="M6 13h4" /><path d="M14 13h4" /></svg>
          Registers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(cpuState.registers).map(([reg, value]) => (
            <div
              key={reg}
              className={`p-3 rounded-md border-2 transition-colors shadow-sm ${
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
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
          Data Flow
        </h3>
        {lastExecution ? (
          <div className="bg-muted p-3 rounded-md border border-primary/20 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-medium bg-background px-2 py-1 rounded border border-primary/20">{lastExecution.instruction}</span>
              <ArrowRight className="h-5 w-5 text-primary" />
              <span className="text-primary/90">{lastExecution.description}</span>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground italic flex items-center justify-center p-4 gap-2 border border-dashed rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            No data flow yet
          </div>
        )}
      </div>
    </div>
  )
}
