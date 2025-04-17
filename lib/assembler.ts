// Define the CPU state interface
export interface CpuState {
  registers: Record<string, number>
  memory: Record<number, number>
  ip: number
  flags: {
    zero: boolean
    negative: boolean
  }
}

// Initial CPU state
export const initialCpuState: CpuState = {
  registers: {
    R1: 0,
    R2: 0,
    R3: 0,
    R4: 0,
    R5: 0,
    R6: 0,
    R7: 0,
    R8: 0,
  },
  memory: {},
  ip: 0,
  flags: {
    zero: false,
    negative: false,
  },
}

// Regular expressions for parsing assembly code
const regexes = {
  mov: /^MOV\s+([R[0-9\]]+),\s+([R[0-9\]]+)$/i,
  add: /^ADD\s+([R[0-9\]]+),\s+([R[0-9\]]+),\s+([R[0-9\]]+)$/i,
  sub: /^SUB\s+([R[0-9\]]+),\s+([R[0-9\]]+),\s+([R[0-9\]]+)$/i,
  mul: /^MUL\s+([R[0-9\]]+),\s+([R[0-9\]]+),\s+([R[0-9\]]+)$/i,
  div: /^DIV\s+([R[0-9\]]+),\s+([R[0-9\]]+),\s+([R[0-9\]]+)$/i,
  cmp: /^CMP\s+([R[0-9\]]+),\s+([R[0-9\]]+)$/i,
  jmp: /^JMP\s+([0-9]+)$/i,
  jz: /^JZ\s+([0-9]+)$/i,
  jnz: /^JNZ\s+([0-9]+)$/i,
}

// Parse a register or immediate value
function parseOperand(operand: string): { type: "register" | "immediate" | "memory"; value: string } {
  if (operand.startsWith("R")) {
    return { type: "register", value: operand }
  } else if (operand.startsWith("[") && operand.endsWith("]")) {
    return { type: "memory", value: operand.slice(1, -1) }
  } else {
    return { type: "immediate", value: operand }
  }
}

// Assemble the code into machine code
export function assembleCode(code: string) {
  const lines = code.split("\n").filter((line) => line.trim() !== "")
  const machineCode: string[] = []
  const labels: Record<string, number> = {}

  // First pass: collect labels
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    if (trimmedLine.endsWith(":")) {
      const label = trimmedLine.slice(0, -1)
      labels[label] = index
    }
  })

  // Second pass: generate machine code
  lines.forEach((line) => {
    const trimmedLine = line.trim()

    // Skip labels in second pass
    if (trimmedLine.endsWith(":")) {
      return
    }

    // MOV instruction
    if (regexes.mov.test(trimmedLine)) {
      const match = trimmedLine.match(regexes.mov)!
      const dest = parseOperand(match[1])
      const src = parseOperand(match[2])

      if (dest.type === "register" && src.type === "immediate") {
        machineCode.push(`MOV ${dest.value}, ${src.value}`)
      } else if (dest.type === "register" && src.type === "register") {
        machineCode.push(`MOV ${dest.value}, ${src.value}`)
      } else if (dest.type === "memory" && src.type === "register") {
        machineCode.push(`MOV [${dest.value}], ${src.value}`)
      } else if (dest.type === "register" && src.type === "memory") {
        machineCode.push(`MOV ${dest.value}, [${src.value}]`)
      }
    }

    // ADD instruction
    else if (regexes.add.test(trimmedLine)) {
      const match = trimmedLine.match(regexes.add)!
      const dest = parseOperand(match[1])
      const src1 = parseOperand(match[2])
      const src2 = parseOperand(match[3])

      machineCode.push(`ADD ${dest.value}, ${src1.value}, ${src2.value}`)
    }

    // SUB instruction
    else if (regexes.sub.test(trimmedLine)) {
      const match = trimmedLine.match(regexes.sub)!
      const dest = parseOperand(match[1])
      const src1 = parseOperand(match[2])
      const src2 = parseOperand(match[3])

      machineCode.push(`SUB ${dest.value}, ${src1.value}, ${src2.value}`)
    }

    // MUL instruction
    else if (regexes.mul.test(trimmedLine)) {
      const match = trimmedLine.match(regexes.mul)!
      const dest = parseOperand(match[1])
      const src1 = parseOperand(match[2])
      const src2 = parseOperand(match[3])

      machineCode.push(`MUL ${dest.value}, ${src1.value}, ${src2.value}`)
    }

    // DIV instruction
    else if (regexes.div.test(trimmedLine)) {
      const match = trimmedLine.match(regexes.div)!
      const dest = parseOperand(match[1])
      const src1 = parseOperand(match[2])
      const src2 = parseOperand(match[3])

      machineCode.push(`DIV ${dest.value}, ${src1.value}, ${src2.value}`)
    }

    // CMP instruction
    else if (regexes.cmp.test(trimmedLine)) {
      const match = trimmedLine.match(regexes.cmp)!
      const op1 = parseOperand(match[1])
      const op2 = parseOperand(match[2])

      machineCode.push(`CMP ${op1.value}, ${op2.value}`)
    }

    // JMP instruction
    else if (regexes.jmp.test(trimmedLine)) {
      const match = trimmedLine.match(regexes.jmp)!
      machineCode.push(`JMP ${match[1]}`)
    }

    // JZ instruction
    else if (regexes.jz.test(trimmedLine)) {
      const match = trimmedLine.match(regexes.jz)!
      machineCode.push(`JZ ${match[1]}`)
    }

    // JNZ instruction
    else if (regexes.jnz.test(trimmedLine)) {
      const match = trimmedLine.match(regexes.jnz)!
      machineCode.push(`JNZ ${match[1]}`)
    }

    // Unknown instruction
    else {
      machineCode.push(`UNKNOWN: ${trimmedLine}`)
    }
  })

  return { machineCode, labels }
}

// Execute a single instruction
export function executeInstruction(state: CpuState, instruction: string): { newState: CpuState; description: string } {
  const newState = JSON.parse(JSON.stringify(state)) as CpuState
  newState.ip += 1

  let description = ""

  // MOV register, immediate
  if (/^MOV R\d+, \d+$/.test(instruction)) {
    const [_, dest, value] = instruction.match(/^MOV (R\d+), (\d+)$/)!
    newState.registers[dest] = Number.parseInt(value)
    description = `Moved value ${value} into register ${dest}`
  }

  // MOV register, register
  else if (/^MOV R\d+, R\d+$/.test(instruction)) {
    const [_, dest, src] = instruction.match(/^MOV (R\d+), (R\d+)$/)!
    newState.registers[dest] = newState.registers[src]
    description = `Copied value from register ${src} (${newState.registers[src]}) to register ${dest}`
  }

  // MOV memory, register
  else if (/^MOV \[\d+\], R\d+$/.test(instruction)) {
    const [_, address, src] = instruction.match(/^MOV \[(\d+)\], (R\d+)$/)!
    const memoryAddress = Number.parseInt(address)
    newState.memory[memoryAddress] = newState.registers[src]
    description = `Stored value from register ${src} (${newState.registers[src]}) to memory address ${memoryAddress}`

    // Ensure memory is properly updated
    console.log(`Memory updated: Address ${memoryAddress} = ${newState.memory[memoryAddress]}`)
  }

  // MOV register, memory
  else if (/^MOV R\d+, \[\d+\]$/.test(instruction)) {
    const [_, dest, address] = instruction.match(/^MOV (R\d+), \[(\d+)\]$/)!
    const memoryAddress = Number.parseInt(address)
    newState.registers[dest] = newState.memory[memoryAddress] || 0
    description = `Loaded value from memory address ${memoryAddress} (${newState.memory[memoryAddress] || 0}) to register ${dest}`
  }

  // ADD instruction
  else if (/^ADD R\d+, R\d+, R\d+$/.test(instruction)) {
    const [_, dest, src1, src2] = instruction.match(/^ADD (R\d+), (R\d+), (R\d+)$/)!
    const result = newState.registers[src1] + newState.registers[src2]
    newState.registers[dest] = result
    newState.flags.zero = result === 0
    newState.flags.negative = result < 0
    description = `Added ${src1} (${newState.registers[src1]}) and ${src2} (${newState.registers[src2]}), stored result ${result} in ${dest}`
  }

  // SUB instruction
  else if (/^SUB R\d+, R\d+, R\d+$/.test(instruction)) {
    const [_, dest, src1, src2] = instruction.match(/^SUB (R\d+), (R\d+), (R\d+)$/)!
    const result = newState.registers[src1] - newState.registers[src2]
    newState.registers[dest] = result
    newState.flags.zero = result === 0
    newState.flags.negative = result < 0
    description = `Subtracted ${src2} (${newState.registers[src2]}) from ${src1} (${newState.registers[src1]}), stored result ${result} in ${dest}`
  }

  // MUL instruction
  else if (/^MUL R\d+, R\d+, R\d+$/.test(instruction)) {
    const [_, dest, src1, src2] = instruction.match(/^MUL (R\d+), (R\d+), (R\d+)$/)!
    const result = newState.registers[src1] * newState.registers[src2]
    newState.registers[dest] = result
    newState.flags.zero = result === 0
    newState.flags.negative = result < 0
    description = `Multiplied ${src1} (${newState.registers[src1]}) by ${src2} (${newState.registers[src2]}), stored result ${result} in ${dest}`
  }

  // DIV instruction
  else if (/^DIV R\d+, R\d+, R\d+$/.test(instruction)) {
    const [_, dest, src1, src2] = instruction.match(/^DIV (R\d+), (R\d+), (R\d+)$/)!
    if (newState.registers[src2] === 0) {
      description = `Division by zero error: cannot divide ${src1} (${newState.registers[src1]}) by ${src2} (0)`
    } else {
      const result = Math.floor(newState.registers[src1] / newState.registers[src2])
      newState.registers[dest] = result
      newState.flags.zero = result === 0
      newState.flags.negative = result < 0
      description = `Divided ${src1} (${newState.registers[src1]}) by ${src2} (${newState.registers[src2]}), stored result ${result} in ${dest}`
    }
  }

  // CMP instruction
  else if (/^CMP R\d+, R\d+$/.test(instruction)) {
    const [_, reg1, reg2] = instruction.match(/^CMP (R\d+), (R\d+)$/)!
    const result = newState.registers[reg1] - newState.registers[reg2]
    newState.flags.zero = result === 0
    newState.flags.negative = result < 0
    description = `Compared ${reg1} (${newState.registers[reg1]}) with ${reg2} (${newState.registers[reg2]}), set flags: Z=${newState.flags.zero ? 1 : 0}, N=${newState.flags.negative ? 1 : 0}`
  }

  // JMP instruction
  else if (/^JMP \d+$/.test(instruction)) {
    const [_, address] = instruction.match(/^JMP (\d+)$/)!
    newState.ip = Number.parseInt(address)
    description = `Jumped to instruction at address ${address}`
  }

  // JZ instruction
  else if (/^JZ \d+$/.test(instruction)) {
    const [_, address] = instruction.match(/^JZ (\d+)$/)!
    if (newState.flags.zero) {
      newState.ip = Number.parseInt(address)
      description = `Zero flag was set, jumped to instruction at address ${address}`
    } else {
      description = `Zero flag was not set, continued execution`
    }
  }

  // JNZ instruction
  else if (/^JNZ \d+$/.test(instruction)) {
    const [_, address] = instruction.match(/^JNZ (\d+)$/)!
    if (!newState.flags.zero) {
      newState.ip = Number.parseInt(address)
      description = `Zero flag was not set, jumped to instruction at address ${address}`
    } else {
      description = `Zero flag was set, continued execution`
    }
  }

  // Unknown instruction
  else {
    description = `Unknown instruction: ${instruction}`
  }

  return { newState, description }
}
