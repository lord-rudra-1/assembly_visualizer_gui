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
  const [binaryCode, setBinaryCode] = useState<string[]>([])
  const [cpuState, setCpuState] = useState(initialCpuState)
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentStep, setCurrentStep] = useState(-1)
  const [executionHistory, setExecutionHistory] = useState<any[]>([])
  const animationRef = useRef<number | null>(null)

  // Assemble the code when it changes
  useEffect(() => {
    try {
      const { machineCode: mc, binaryCode: bc } = assembleCode(assemblyCode)
      setMachineCode(mc)
      setBinaryCode(bc)
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

  // Run the simulation one step at a time (controlled execution)
  const runSimulation = () => {
    if (currentStep < machineCode.length - 1) {
      // Just advance one step at a time
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
      <div className="flex items-center justify-between mb-6 bg-card p-4 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Cpu className="h-8 w-8 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">CPU Simulator & Visualizer</span>
        </h1>
        <div className="flex items-center gap-2">
          
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Assembly Code
            </h2>
            <AssemblyEditor code={assemblyCode} onChange={setAssemblyCode} />
          </div>

          <div className="border rounded-lg p-4 bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><path d="M2 13a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5a5 5 0 0 0-5-5H7" /><path d="M9 6V4" /><path d="M4 7v2" /><path d="M14 6v2" /><path d="M19 7V5" /></svg>
              Machine Code
            </h2>
            <div className="bg-muted p-3 rounded-md font-mono text-sm h-40 overflow-y-auto">
              {machineCode.map((instruction, index) => (
                <div 
                  key={index} 
                  className={`py-1 ${currentStep === index ? "bg-primary/20 rounded px-1 -mx-1 font-medium" : ""}`}
                  ref={currentStep === index ? (el) => {
                    // Only scroll within the container, not the whole page
                    if (el) {
                      const container = el.closest('.overflow-y-auto') as HTMLElement;
                      if (container) {
                        // Smooth scrolling with animation to create a step-by-step visual
                        const elem = el as HTMLElement;
                        let targetScrollTop;
                        if (index === 0 || index === 1) {
                          targetScrollTop = 0;
                        } else {
                          targetScrollTop = elem.offsetTop - (container.offsetHeight / 2) + (elem.offsetHeight / 2);
                        }
                        
                        // Get current scroll position
                        const startScrollTop = container.scrollTop;
                        const distance = targetScrollTop - startScrollTop;
                        
                        // Use requestAnimationFrame for smooth animation
                        const duration = 300; // ms
                        const startTime = performance.now();
                        
                        const animateScroll = (currentTime: number) => {
                          const elapsedTime = currentTime - startTime;
                          const progress = Math.min(elapsedTime / duration, 1);
                          
                          container.scrollTop = startScrollTop + distance * progress;
                          
                          if (progress < 1) {
                            requestAnimationFrame(animateScroll);
                          }
                        };
                        
                        requestAnimationFrame(animateScroll);
                      }
                    }
                  } : undefined}
                >
                  {`${index.toString().padStart(2, "0")}: ${instruction}`}
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" /><path d="M6 18h12" /><path d="M6 14h12" /><path d="M6 10h12" /></svg>
              Binary Machine Code (16-bit)
            </h2>
            <div className="bg-muted p-3 rounded-md font-mono text-sm h-40 overflow-y-auto">
              {binaryCode.map((binary, index) => (
                <div 
                  key={index} 
                  className={`py-1 ${currentStep === index ? "bg-primary/20 rounded px-1 -mx-1 font-medium" : ""}`}
                  ref={currentStep === index ? (el) => {
                    // Only scroll within the container, not the whole page
                    if (el) {
                      const container = el.closest('.overflow-y-auto') as HTMLElement;
                      if (container) {
                        // Smooth scrolling with animation to create a step-by-step visual
                        const elem = el as HTMLElement;
                        let targetScrollTop;
                        if (index === 0 || index === 1) {
                          targetScrollTop = 0;
                        } else {
                          targetScrollTop = elem.offsetTop - (container.offsetHeight / 2) + (elem.offsetHeight / 2);
                        }
                        
                        // Get current scroll position
                        const startScrollTop = container.scrollTop;
                        const distance = targetScrollTop - startScrollTop;
                        
                        // Use requestAnimationFrame for smooth animation
                        const duration = 300; // ms
                        const startTime = performance.now();
                        
                        const animateScroll = (currentTime: number) => {
                          const elapsedTime = currentTime - startTime;
                          const progress = Math.min(elapsedTime / duration, 1);
                          
                          container.scrollTop = startScrollTop + distance * progress;
                          
                          if (progress < 1) {
                            requestAnimationFrame(animateScroll);
                          }
                        };
                        
                        requestAnimationFrame(animateScroll);
                      }
                    }
                  } : undefined}
                >
                  <span className="inline-block w-8 text-muted-foreground">{`${index.toString().padStart(2, "0")}:`}</span>
                  <span className="text-primary font-medium">{binary.substring(0, 4)}</span>
                  <span className="text-green-600">{binary.substring(4, 8)}</span>
                  <span className="text-amber-600">{binary.substring(8, 12)}</span>
                  <span className="text-blue-600">{binary.substring(12, 16)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-card rounded-lg border shadow-sm">
            <Button variant="outline" onClick={resetSimulation} className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={stepExecution}
              disabled={isRunning || currentStep >= machineCode.length - 1}
              className="flex items-center gap-1 bg-primary/90 hover:bg-primary transition-colors"
            >
              <SkipForward className="h-4 w-4" />
              Step
            </Button>
            {isRunning ? (
              <Button onClick={pauseSimulation} variant="secondary" className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200 transition-colors">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={runSimulation}
                disabled={currentStep >= machineCode.length - 1}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Play className="h-4 w-4" />
                Run
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="cpu">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="cpu">CPU & Registers</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
            </TabsList>
            <TabsContent value="cpu" className="border rounded-lg p-4 min-h-[400px] bg-card shadow-sm">
              <CpuVisualization
                cpuState={cpuState}
                currentInstruction={currentStep >= 0 ? machineCode[currentStep] : null}
                executionHistory={executionHistory}
              />
            </TabsContent>
            <TabsContent value="memory" className="border rounded-lg p-4 min-h-[400px] bg-card shadow-sm">
              <MemoryVisualization memory={cpuState.memory} />
            </TabsContent>
          </Tabs>

          <div className="border rounded-lg p-4 bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><path d="M12 2v4" /><path d="M12 18v4" /><path d="m4.93 5.93 2.83 2.83" /><path d="m16.24 16.24 2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="m5.93 18.07 2.83-2.83" /><path d="m15.24 8.76 2.83-2.83" /></svg>
              Execution Log
            </h2>
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
                <div className="text-muted-foreground italic flex items-center justify-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                No instructions executed yet
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
