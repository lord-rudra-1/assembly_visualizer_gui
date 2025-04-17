"use client"

import { useState, useEffect, useRef } from "react"
import { Cpu, Play, Pause, SkipForward, RotateCcw, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import AssemblyEditor from "@/components/assembly-editor"
import CpuVisualization from "@/components/cpu-visualization"
import MemoryVisualization from "@/components/memory-visualization"
import { assembleCode, executeInstruction, initialCpuState } from "@/lib/assembler"

export default function CpuSimulator() {
  const [assemblyCode, setAssemblyCode] = useState(
    "MOV R1, 10\nMOV R2, 5\nADD R3, R1, R2\nSUB R4, R1, R2\nMUL R5, R1, R2\nMOV [100], R3\nMOV [101], R5\nMOV R6, [100]",
  )
  const [machineCode, setMachineCode] = useState<string[]>([])
  const [cpuState, setCpuState] = useState(initialCpuState)
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentStep, setCurrentStep] = useState(-1)
  const [executionHistory, setExecutionHistory] = useState<any[]>([])
  const animationRef = useRef<number | null>(null)

  // Assemble the code when it changes
  useEffect(() => {
    try {
      const { machineCode: mc } = assembleCode(assemblyCode)
      setMachineCode(mc)
    } catch (error) {
      console.error("Assembly error:", error)
    }
  }, [assemblyCode])

  // Reset the CPU state
  const resetSimulation = () => {
    setIsRunning(false)
    setCpuState(initialCpuState)
    setCurrentStep(-1)
    setExecutionHistory([])
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  // Step through one instruction
  const stepExecution = () => {
    if (currentStep < machineCode.length - 1) {
      const nextStep = currentStep + 1
      const instruction = machineCode[nextStep]
      const { newState, description } = executeInstruction(cpuState, instruction)

      // Update state
      setCpuState(newState)
      setCurrentStep(nextStep)

      // Add to execution history
      const newHistoryEntry = {
        step: nextStep,
        instruction,
        state: { ...newState },
        description,
      }

      setExecutionHistory((prev) => [...prev, newHistoryEntry])
    } else {
      setIsRunning(false)
    }
  }

  // Run the simulation continuously
  const runSimulation = () => {
    if (currentStep < machineCode.length - 1) {
      stepExecution()
      setIsRunning(false) // Pause after one step
    } else {
      setIsRunning(false)
    }
  }

  // Pause the simulation
  const pauseSimulation = () => {
    setIsRunning(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Cpu className="h-8 w-8" />
          CPU Simulator & Visualizer
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Speed:</span>
          <Slider
            className="w-32"
            value={[speed]}
            min={0.5}
            max={5}
            step={0.5}
            onValueChange={(value) => setSpeed(value[0])}
          />
          <span className="text-sm w-8">{speed}x</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Code className="h-5 w-5" />
              Assembly Code
            </h2>
            <AssemblyEditor code={assemblyCode} onChange={setAssemblyCode} />
          </div>

          <div className="border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-semibold mb-2">Machine Code</h2>
            <div className="bg-muted p-3 rounded-md font-mono text-sm h-40 overflow-y-auto">
              {machineCode.map((instruction, index) => (
                <div key={index} className={`py-1 ${currentStep === index ? "bg-primary/20 rounded px-1 -mx-1" : ""}`}>
                  {`${index.toString().padStart(2, "0")}: ${instruction}`}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" onClick={resetSimulation} className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={stepExecution}
              disabled={isRunning || currentStep >= machineCode.length - 1}
              className="flex items-center gap-1"
            >
              <SkipForward className="h-4 w-4" />
              Step
            </Button>
            {isRunning ? (
              <Button onClick={pauseSimulation} variant="secondary" className="flex items-center gap-1">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={runSimulation}
                disabled={currentStep >= machineCode.length - 1}
                className="flex items-center gap-1"
              >
                <Play className="h-4 w-4" />
                Run
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="cpu">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="cpu">CPU & Registers</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
            </TabsList>
            <TabsContent value="cpu" className="border rounded-lg p-4 min-h-[400px] bg-card">
              <CpuVisualization
                cpuState={cpuState}
                currentInstruction={currentStep >= 0 ? machineCode[currentStep] : null}
                executionHistory={executionHistory}
              />
            </TabsContent>
            <TabsContent value="memory" className="border rounded-lg p-4 min-h-[400px] bg-card">
              <MemoryVisualization memory={cpuState.memory} />
            </TabsContent>
          </Tabs>

          <div className="border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-semibold mb-2">Execution Log</h2>
            <div className="bg-muted p-3 rounded-md font-mono text-sm h-40 overflow-y-auto">
              {executionHistory.length > 0 ? (
                executionHistory.map((entry, index) => (
                  <div key={index} className="py-1 border-b border-border/30 last:border-0">
                    <span className="font-semibold text-primary">Step {entry.step}:</span> {entry.description}
                    {entry.state && entry.state.memory && Object.keys(entry.state.memory).length > 0 && (
                      <div className="ml-4 text-xs text-muted-foreground">
                        Memory updates:{" "}
                        {Object.entries(entry.state.memory)
                          .map(([addr, val]) => `[${addr}]=${val}`)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground italic">No instructions executed yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
