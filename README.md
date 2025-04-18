# Assembly Visualizer GUI

A web-based educational tool for visualizing the execution of assembly code and understanding CPU operations. This project simulates the fetch-decode-execute cycle, showing how assembly instructions interact with registers and memory in a simple CPU model.

## Introduction

**Assembly Visualizer GUI** is an interactive web application designed to demystify the inner workings of a CPU through hands-on assembly programming and real-time visualization. Ideal for students, teachers, and enthusiasts, it bridges the gap between theory and practical understanding of computer architecture.

## Key Features

- **Interactive CPU Visualization:** Watch how the ALU, registers, control unit, and memory interact as you step through assembly instructions.
- **Step-by-Step Execution:** Control program flow with Run, Step, and Reset buttons. See each instruction’s effect in real time.
- **Memory & Register Inspection:** Instantly view and track changes in all registers and memory locations as your code executes.
- **Rich Assembly Language Support:** Supports MOV, ADD, SUB, MUL, DIV, CMP, JMP, JZ, JNZ and memory/register operations.
- **Execution Log:** Detailed log shows each instruction, state changes, and memory updates for learning and debugging.
- **Modern UI/UX:** Clean, responsive interface with dark/light mode, code highlighting, and accessible controls.
- **Educational Focus:** Designed for clarity and teaching, with tooltips, code samples, and error feedback.

## Tech Stack

- **Next.js 14** – Modern React framework for fast, scalable web apps
- **TypeScript** – Type-safe JavaScript for robust development
- **Tailwind CSS** – Utility-first styling for rapid UI design
- **shadcn/ui** – Beautiful, accessible UI components

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

   If you don't have `pnpm` installed or it doesn't work, you can use `npm` instead:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   pnpm dev
   ```

   Or with npm:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/components` – All React components for UI and visualization:
  - `assembly-editor.tsx`: Editor for writing and editing assembly code.
  - `cpu-visualization.tsx`: Dynamic visualization of CPU internals (registers, ALU, control unit).
  - `memory-visualization.tsx`: Grid/table display of memory contents.
  - `ui/`: Shared UI primitives (buttons, tabs, sliders, etc.).
- `/lib` – Core simulation logic and utilities:
  - `assembler.ts`: Parses and executes assembly code, manages CPU state, simulates instruction cycles.
  - `utils.ts`: Helper functions for the simulator.
- `/app` – Next.js app router and pages. Main entry point for the UI.
- `/styles` – Tailwind CSS and global style configuration.
- `/hooks` – Custom React hooks.
- `/public` – Static assets (e.g., favicon).

The project is modular and extensible—add new instructions, UI panels, or visualizations with ease.

## Sample Code & Syntax

Assembly programs are written one instruction per line. Use registers (R1–R8), immediate values, and memory addresses (in square brackets). Comments start with `;`.

**General Syntax:**

```assembly
INSTRUCTION DEST, SRC1, SRC2
INSTRUCTION DEST, SRC
; This is a comment
```

**Sample Program:**

```assembly
MOV R1, 10
MOV R2, 5
ADD R3, R1, R2
SUB R4, R1, R2
MUL R5, R1, R2
DIV R6, R1, R2
MOV [100], R3
MOV R7, [100]
CMP R1, R2
JZ 12
JMP 0
```

- Use `MOV` to transfer data between registers and memory.
- Arithmetic instructions (`ADD`, `SUB`, `MUL`, `DIV`) operate on registers only.
- Jumps (`JMP`, `JZ`, `JNZ`) control program flow.

**Tip:** Try modifying the sample code and observe how the visualizer responds in real time!

## Usage Guide

1. **Write Assembly:** Enter your code in the editor. Use registers (R1–R8), memory addresses, and supported instructions. Comments (lines starting with `;`) are ignored.
2. **Run/Step:** Use **Run** to execute the whole program, or **Step** to execute one instruction at a time. **Reset** clears the simulation.
3. **Inspect State:** Switch between **CPU & Registers** and **Memory** tabs to view the current state of the system.
4. **Analyze Execution Log:** The log panel shows each instruction, its effect, and memory/register changes for easy debugging and learning.
5. **Experiment:** Try different programs, change values, and see how the CPU responds. Great for learning and experimentation!

## Architecture Overview

- **Assembly Editor:** Feature-rich code editor with syntax highlighting, error reporting, and instant feedback.
- **CPU Visualization:** Graphically displays the state of all registers, the ALU, and the control unit. Animates instruction execution for clarity.
- **Memory Visualization:** Shows a grid/table of memory addresses and their contents, updating in real time as your program runs.
- **Assembler Logic:** (in `/lib/assembler.ts`) Handles parsing, assembling, and simulating all supported instructions. Modular and easy to extend for new instructions.
- **UI/UX:** Built with Next.js and Tailwind CSS for a modern, responsive, and accessible interface. Designed for both desktop and mobile devices.

The architecture is modular—new features, instructions, or visualizations can be added with minimal changes to the codebase.

## Assembly Reference

| Instruction | Syntax                  | Description                                                                 | Example                         |
|-------------|-------------------------|-----------------------------------------------------------------------------|---------------------------------|
| MOV         | MOV DEST, SRC           | Copy SRC to DEST (register, memory, or immediate value)                     | MOV R1, 10; MOV [100], R1       |
| ADD         | ADD DEST, SRC1, SRC2    | Add SRC1 and SRC2, store in DEST (registers only)                           | ADD R3, R1, R2                  |
| SUB         | SUB DEST, SRC1, SRC2    | Subtract SRC2 from SRC1, store in DEST (registers only)                     | SUB R4, R1, R2                  |
| MUL         | MUL DEST, SRC1, SRC2    | Multiply SRC1 and SRC2, store in DEST (registers only)                      | MUL R5, R1, R2                  |
| DIV         | DIV DEST, SRC1, SRC2    | Divide SRC1 by SRC2, store in DEST (registers only)                         | DIV R6, R1, R2                  |
| CMP         | CMP REG1, REG2          | Compare REG1 and REG2, set flags for conditional jumps                      | CMP R1, R2                      |
| JMP         | JMP ADDRESS             | Unconditional jump to instruction at ADDRESS (line number)                  | JMP 0                           |
| JZ          | JZ ADDRESS              | Jump to ADDRESS if zero flag is set (after CMP)                             | JZ 12                           |
| JNZ         | JNZ ADDRESS             | Jump to ADDRESS if zero flag is NOT set                                     | JNZ 5                           |

## FAQ / Troubleshooting

- **Why isn't my code assembling?**
  - Check for syntax errors, typos, or unsupported instructions. Only one instruction per line is supported.
- **How do I reset the simulation?**
  - Click the **Reset** button to clear registers, memory, and execution state.
- **Where can I see memory changes?**
  - Switch to the **Memory** tab for current memory state and updates. Memory writes also appear in the execution log.
- **What happens if I divide by zero?**
  - The simulator halts and displays an error if division by zero is attempted.
- **Where is the assembler source code?**
  - See `/lib/assembler.ts` for implementation details. You can extend or modify the instruction set there.
- **Can I add my own instructions?**
  - Yes! The assembler and CPU logic are modular. Add new regex patterns and handlers in `/lib/assembler.ts`.