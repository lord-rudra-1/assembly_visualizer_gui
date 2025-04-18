"use client";

import React, { useState } from "react";

const sections = [
  { id: "introduction", label: "Introduction" },
  { id: "features", label: "Features" },
  { id: "tech-stack", label: "Tech Stack" },
  { id: "getting-started", label: "Getting Started" },
  { id: "project-structure", label: "Project Structure" },
  { id: "sample-code", label: "Sample Code & Syntax" },
  { id: "usage-guide", label: "Usage Guide" },
  { id: "architecture", label: "Architecture Overview" },
  { id: "assembly-reference", label: "Assembly Reference" },
  { id: "faq", label: "FAQ / Troubleshooting" },
];

function SectionHeading({ children, id, first = false }) {
  return (
    <h2
      id={id}
      className={
        `text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 ${first ? 'mt-3 md:mt-4' : 'mt-8'} scroll-mt-24 md:scroll-mt-32 text-primary drop-shadow-sm border-b border-primary/20 pb-2`
      }
    >
      {children}
    </h2>
  );
}

function SubHeading({ children }) {
  return <h3 className="text-xl sm:text-2xl font-bold mt-8 mb-2 text-primary/80">{children}</h3>;
}

export default function DocumentationPage() {
  // Responsive sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground flex-col md:flex-row">
      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-14 bg-background/95 border-b border-primary/10 z-40 flex items-center px-4 shadow-sm">
        <button
          className="text-primary bg-primary/10 p-2 rounded-full mr-3 focus:outline-none focus:ring-2 focus:ring-primary/60"
          aria-label="Open documentation menu"
          onClick={() => setSidebarOpen(true)}
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span className="text-lg font-bold text-primary">Documentation</span>
      </div>
      

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 flex-shrink-0 border-r bg-card/90 p-6 md:sticky md:top-0 md:h-screen shadow-lg z-30 transition-transform duration-300 md:translate-x-0 fixed top-0 left-0 h-full md:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:shadow-lg`}
        style={{ maxWidth: '80vw' }}
      >
        {/* Close button for mobile */}
        <button
          className="md:hidden absolute top-4 right-4 text-primary bg-background p-2 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Close documentation menu"
          onClick={() => setSidebarOpen(false)}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <nav className="space-y-2">
          <h2 className="text-xl font-extrabold mb-6 tracking-wide text-primary">Documentation</h2>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block px-3 py-2 rounded-lg hover:bg-primary/10 font-medium transition-colors text-base text-primary/90 hover:text-primary"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full pt-16 md:pt-12 lg:pt-20">

        {/* Introduction */}
        <section id="introduction" className="mb-16">
          <SectionHeading id="introduction" first>Assembly & CPU Visualizer</SectionHeading>
          <p className="text-lg mb-4 leading-relaxed">
            <b>Assembly & CPU Visualizer</b> is an educational, interactive web application designed to demystify the inner workings of a Central Processing Unit (CPU) through hands-on assembly programming and real-time visualization. Built for students, teachers, and enthusiasts, it bridges the gap between theoretical computer architecture and practical understanding.
          </p>
          <ul className="list-disc ml-4 sm:ml-8 text-base text-muted-foreground mb-4">
            <li>Learn fundamental CPU operations: fetch, decode, execute cycles</li>
            <li>Experiment with your own assembly code and see its effects instantly</li>
            <li>Visualize memory, registers, and instruction flow step-by-step</li>
            <li>Perfect for coursework, demonstrations, and self-paced learning</li>
          </ul>
          <p className="text-base text-muted-foreground">
            <b>Try it live:</b> Use the button below to access the deployed visualizer and start exploring CPU architecture interactively!
          </p>
        </section>

        {/* Features */}
        <section id="features" className="mb-16">
          <SectionHeading id="features">Key Features</SectionHeading>
          <ul className="list-disc ml-4 sm:ml-8 space-y-3 text-base sm:text-lg">
            <li><b>Interactive CPU Visualization:</b> Watch how the ALU, registers, control unit, and memory interact as you step through assembly instructions.</li>
            <li><b>Step-by-Step Execution:</b> Control program flow with Run, Step, and Reset buttons. See each instruction’s effect in real time.</li>
            <li><b>Memory & Register Inspection:</b> Instantly view and track changes in all registers and memory locations as your code executes.</li>
            <li><b>Rich Assembly Language Support:</b> Supports MOV, ADD, SUB, MUL, DIV, CMP, JMP, JZ, JNZ and memory/register operations for practical experimentation.</li>
            <li><b>Execution Log:</b> Detailed log shows each instruction, state changes, and memory updates for learning and debugging.</li>
            <li><b>Modern UI/UX:</b> Clean, responsive interface with dark/light mode support, code highlighting, and accessible controls.</li>
            <li><b>Educational Focus:</b> Designed for clarity and teaching, with tooltips, code samples, and error feedback.</li>
          </ul>
        </section>

        {/* Tech Stack */}
        <section id="tech-stack" className="mb-16">
          <SectionHeading id="tech-stack">Tech Stack</SectionHeading>
          <ul className="list-disc ml-4 sm:ml-8 space-y-2 text-base sm:text-lg">
            <li><b>Next.js 14</b> – Modern React framework for fast, scalable web apps</li>
            <li><b>TypeScript</b> – Type-safe JavaScript for robust development</li>
            <li><b>Tailwind CSS</b> – Utility-first styling for rapid UI design</li>
            <li><b>shadcn/ui</b> – Beautiful, accessible UI components</li>
          </ul>
        </section>

        {/* Access Visualizer Button */}
        <div className="flex justify-center mb-12 mt-2">
          <a
            href="https://assembly-visualizer-gui.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary to-blue-600 text-white text-lg sm:text-xl font-bold rounded-lg shadow-lg hover:scale-105 hover:from-blue-700 hover:to-primary transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            🚀 Access the Assembly Visualizer
          </a>
        </div>

        {/* Project Structure */}
        <section id="project-structure" className="mb-16">
          <SectionHeading id="project-structure">Project Structure</SectionHeading>
          <ul className="list-disc ml-4 sm:ml-8 space-y-4 text-base sm:text-lg">
            <li><code className="bg-muted px-2 py-1 rounded">/components</code> – Contains all React components used for the UI and visualization, including:
              <ul className="list-disc ml-4 sm:ml-8 mt-2 text-sm sm:text-base">
                <li><b>assembly-editor.tsx</b>: The code editor for writing and editing assembly code.</li>
                <li><b>cpu-visualization.tsx</b>: Dynamic visualization of CPU internals (registers, ALU, control unit).</li>
                <li><b>memory-visualization.tsx</b>: Grid/table display of memory contents.</li>
                <li><b>ui/</b>: Shared UI primitives (buttons, tabs, sliders, etc.) for consistent design.</li>
              </ul>
            </li>
            <li><code className="bg-muted px-2 py-1 rounded">/lib</code> – Core simulation logic and utilities, including:
              <ul className="list-disc ml-4 sm:ml-8 mt-2 text-sm sm:text-base">
                <li><b>assembler.ts</b>: Parses and executes assembly code, manages CPU state, and simulates instruction cycles.</li>
                <li><b>utils.ts</b>: Helper functions for the simulator.</li>
              </ul>
            </li>
            <li><code className="bg-muted px-2 py-1 rounded">/app</code> – Next.js app router and pages. Main entry point for the UI.</li>
            <li><code className="bg-muted px-2 py-1 rounded">/styles</code> – Tailwind CSS and global style configuration for a modern look.</li>
          </ul>
          <p className="text-base text-muted-foreground mt-4">The project is modular and extensible—add new instructions, UI panels, or visualizations with ease.</p>
        </section>

        {/* Sample Code & Syntax */}
        <section id="sample-code" className="mb-16">
          <SectionHeading id="sample-code">Sample Code &amp; Syntax</SectionHeading>
          <p className="mb-4 text-base sm:text-lg">
            Assembly programs for this simulator are written one instruction per line. You can use registers (R1–R8), immediate values, and memory addresses (in square brackets). Comments can be added with <code className="bg-muted px-2 py-1 rounded font-mono">;</code> at the start of a line.
          </p>
          <SubHeading>General Syntax</SubHeading>
          <pre className="bg-muted rounded-lg p-3 sm:p-4 text-sm sm:text-base font-mono text-primary shadow-inner mb-6 overflow-x-auto max-w-full whitespace-pre-wrap">
{`INSTRUCTION DEST, SRC1, SRC2
INSTRUCTION DEST, SRC
; This is a comment`}
          </pre>
          <SubHeading>Sample Program</SubHeading>
          <pre className="bg-muted rounded-lg p-3 sm:p-4 text-sm sm:text-base font-mono text-primary shadow-inner mb-6 overflow-x-auto max-w-full whitespace-pre-wrap">
{`MOV R1, 10
MOV R2, 5
ADD R3, R1, R2
SUB R4, R1, R2
MUL R5, R1, R2
DIV R6, R1, R2
MOV [100], R3
MOV R7, [100]
CMP R1, R2
JZ 12
JMP 0`}
          </pre>
          <ul className="list-disc ml-4 sm:ml-8 text-sm sm:text-base text-muted-foreground mb-2">
            <li>Use <code className="bg-muted px-2 py-1 rounded font-mono">MOV</code> to transfer data between registers and memory.</li>
            <li>Arithmetic instructions (<code className="bg-muted px-2 py-1 rounded font-mono">ADD</code>, <code className="bg-muted px-2 py-1 rounded font-mono">SUB</code>, <code className="bg-muted px-2 py-1 rounded font-mono">MUL</code>, <code className="bg-muted px-2 py-1 rounded font-mono">DIV</code>) operate on registers only.</li>
            <li>Conditional and unconditional jumps (<code className="bg-muted px-2 py-1 rounded font-mono">JMP</code>, <code className="bg-muted px-2 py-1 rounded font-mono">JZ</code>, <code className="bg-muted px-2 py-1 rounded font-mono">JNZ</code>) control program flow.</li>
          </ul>
          <p className="text-base text-muted-foreground">
            <b>Tip:</b> Try modifying the sample code and observe how the visualizer responds in real time!
          </p>
        </section>

        {/* Usage Guide */}
        <section id="usage-guide" className="mb-16">
          <SectionHeading id="usage-guide">Usage Guide</SectionHeading>
          <ol className="list-decimal ml-4 sm:ml-8 space-y-4 text-base sm:text-lg">
            <li><b>Write Assembly:</b> Enter your code in the editor. Use registers (R1–R8), memory addresses, and supported instructions. Comments (lines starting with <code className="bg-muted px-2 py-1 rounded font-mono">;</code>) are ignored.</li>
            {/* <li><b>Assemble:</b> Click <b>Assemble</b> to parse and translate your code. Errors will be shown if syntax is invalid.</li> */}
            <li><b>Run/Step:</b> Use <b>Run</b> to execute the whole program, or <b>Step</b> to execute one instruction at a time. <b>Reset</b> clears the simulation.</li>
            <li><b>Inspect State:</b> Switch between <b>CPU &amp; Registers</b> and <b>Memory</b> tabs to view the current state of the system.</li>
            <li><b>Analyze Execution Log:</b> The log panel shows each instruction, its effect, and memory/register changes for easy debugging and learning.</li>
            <li><b>Experiment:</b> Try different programs, change values, and see how the CPU responds. Great for learning and experimentation!</li>
          </ol>
        </section>

        {/* Architecture Overview */}
        <section id="architecture" className="mb-16">
          <SectionHeading id="architecture">Architecture Overview</SectionHeading>
          <ul className="list-disc ml-4 sm:ml-8 space-y-4 text-base sm:text-lg">
            <li><b>Assembly Editor:</b> Feature-rich code editor with syntax highlighting, error reporting, and instant feedback.</li>
            <li><b>CPU Visualization:</b> Graphically displays the state of all registers, the ALU, and the control unit. Animates instruction execution for clarity.</li>
            <li><b>Memory Visualization:</b> Shows a grid/table of memory addresses and their contents, updating in real time as your program runs.</li>
            <li><b>Assembler Logic:</b> (in <code className="bg-muted px-2 py-1 rounded font-mono">/lib/assembler.ts</code>) Handles parsing, assembling, and simulating all supported instructions. Modular and easy to extend for new instructions.</li>
            <li><b>UI/UX:</b> Built with Next.js and Tailwind CSS for a modern, responsive, and accessible interface. Designed for both desktop and mobile devices.</li>
          </ul>
          <p className="text-base text-muted-foreground mt-4">The architecture is modular—new features, instructions, or visualizations can be added with minimal changes to the codebase.</p>
        </section>

        {/* Assembly Reference */}
        <section id="assembly-reference" className="mb-16">
          <SectionHeading id="assembly-reference">Assembly Reference</SectionHeading>
          <p className="mb-4 text-base sm:text-lg">Below are the supported instructions. Each entry includes syntax, a plain-English description, and an example. See the source code for more advanced usage.</p>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full bg-card rounded-lg shadow border border-primary/10 text-xs sm:text-base">
              <thead className="bg-primary/10">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left font-bold">Instruction</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-bold">Syntax</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-bold">Description</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-bold">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                <tr className="hover:bg-primary/5">
                  <td className="px-2 sm:px-4 py-2 font-mono">MOV</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">MOV DEST, SRC</td>
                  <td className="px-2 sm:px-4 py-2">Copy a value from SRC to DEST. SRC or DEST can be a register, memory address, or immediate value.</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">MOV R1, 10<br/>MOV R2, R1<br/>MOV [100], R1<br/>MOV R3, [100]</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="px-2 sm:px-4 py-2 font-mono">ADD</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">ADD DEST, SRC1, SRC2</td>
                  <td className="px-2 sm:px-4 py-2">Add SRC1 and SRC2, store result in DEST (all must be registers).</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">ADD R3, R1, R2</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="px-2 sm:px-4 py-2 font-mono">SUB</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">SUB DEST, SRC1, SRC2</td>
                  <td className="px-2 sm:px-4 py-2">Subtract SRC2 from SRC1, store result in DEST (registers only).</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">SUB R4, R1, R2</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="px-2 sm:px-4 py-2 font-mono">MUL</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">MUL DEST, SRC1, SRC2</td>
                  <td className="px-2 sm:px-4 py-2">Multiply SRC1 and SRC2, store result in DEST (registers only).</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">MUL R5, R1, R2</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="px-2 sm:px-4 py-2 font-mono">DIV</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">DIV DEST, SRC1, SRC2</td>
                  <td className="px-2 sm:px-4 py-2">Divide SRC1 by SRC2, store result in DEST (registers only).</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">DIV R6, R1, R2</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="px-2 sm:px-4 py-2 font-mono">CMP</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">CMP REG1, REG2</td>
                  <td className="px-2 sm:px-4 py-2">Compare REG1 and REG2, set zero/negative flags for conditional jumps.</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">CMP R1, R2</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="px-2 sm:px-4 py-2 font-mono">JMP</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">JMP ADDRESS</td>
                  <td className="px-2 sm:px-4 py-2">Unconditional jump to instruction at ADDRESS (line number).</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">JMP 0</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="px-2 sm:px-4 py-2 font-mono">JZ</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">JZ ADDRESS</td>
                  <td className="px-2 sm:px-4 py-2">Jump to ADDRESS if the zero flag is set (after CMP).</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">JZ 12</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="px-2 sm:px-4 py-2 font-mono">JNZ</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">JNZ ADDRESS</td>
                  <td className="px-2 sm:px-4 py-2">Jump to ADDRESS if the zero flag is NOT set.</td>
                  <td className="px-2 sm:px-4 py-2 font-mono">JNZ 5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ / Troubleshooting */}
        <section id="faq" className="mb-24">
          <SectionHeading id="faq">FAQ / Troubleshooting</SectionHeading>
          <ul className="list-disc ml-4 sm:ml-8 space-y-6 text-base sm:text-lg">
            <li>
              <b>Why isn't my code assembling?</b><br />
              <span className="text-muted-foreground">Check for syntax errors, typos, or unsupported instructions. Refer to the sample code and reference table above. The simulator expects one instruction per line and only supports the instructions listed above.</span>
            </li>
            <li>
              <b>How do I reset the simulation?</b><br />
              <span className="text-muted-foreground">Click the <b>Reset</b> button on the main page to clear registers, memory, and execution state. This is useful for starting a new program or debugging.</span>
            </li>
            <li>
              <b>Where can I see memory changes?</b><br />
              <span className="text-muted-foreground">Switch to the <b>Memory</b> tab to view current memory state and updates. Memory writes are also shown in the execution log for clarity.</span>
            </li>
            <li>
              <b>What happens if I divide by zero?</b><br />
              <span className="text-muted-foreground">The simulator will halt execution and display an error message if a division by zero is attempted.</span>
            </li>
            <li>
              <b>Where is the source code for the assembler?</b><br />
              <span className="text-muted-foreground">See <code className="bg-muted px-2 py-1 rounded font-mono">/lib/assembler.ts</code> for implementation details. You can extend the instruction set or modify CPU behavior here.</span>
            </li>
            <li>
              <b>Can I add my own instructions?</b><br />
              <span className="text-muted-foreground">Yes! The assembler and CPU logic are modular. Add new regex patterns and handlers in <code className="bg-muted px-2 py-1 rounded font-mono">/lib/assembler.ts</code> to support new instructions.</span>
            </li>
          </ul>
          <p className="text-base text-muted-foreground mt-8">For more help, see the project README or open an issue on the <a href="https://github.com/lord-rudra-1/assembly_visualizer_gui" className="text-primary underline">GitHub repository</a>.</p>
        </section>
      </main>
    </div>
  );
}
