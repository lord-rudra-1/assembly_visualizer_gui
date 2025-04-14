/**
 * ARM Assembly Simulator Bridge
 * 
 * This module provides a bridge between the Node.js server and the C simulator.
 */

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to the simulator executable
const SIMULATOR_PATH = path.join(__dirname, 'simulator');

// Temporary file for assembly code
const TEMP_DIR = path.join(os.tmpdir(), 'arm_simulator');
const TEMP_FILE = path.join(TEMP_DIR, 'temp_code.s');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Check if the simulator executable exists
 * @returns {boolean} Whether the simulator exists
 */
function checkSimulatorExists() {
    return fs.existsSync(SIMULATOR_PATH);
}

/**
 * Preprocess ARM assembly code into a format the simulator can understand
 * @param {string} code - Raw assembly code from the user
 * @param {string} baseAddress - Base address to start at (in hex without 0x prefix)
 * @returns {string} Processed code ready for the simulator
 */
function preprocessCode(code, baseAddress = '400000') {
    // Parse the base address
    let currentAddress = parseInt(baseAddress, 16);
    const INSTRUCTION_SIZE = 4; // 4 bytes per ARM instruction
    
    // Split the code into lines
    const lines = code.split('\n');
    const processedLines = [];
    
    // First pass: collect labels and remove directives
    const labels = {};
    lines.forEach(line => {
        // Remove comments (both // and /* */ style)
        const commentFreeLine = line.replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
        
        // Skip empty lines or directive lines (starting with .)
        if (!commentFreeLine || commentFreeLine.startsWith('.')) {
            return;
        }
        
        // Check if this line contains a label
        if (commentFreeLine.includes(':')) {
            const labelParts = commentFreeLine.split(':');
            const labelName = labelParts[0].trim();
            
            // Store label address
            labels[labelName] = `0x${currentAddress.toString(16)}`;
            
            // If there's no instruction after the label, skip to next line
            if (labelParts[1].trim() === '') {
                return;
            }
        }
        
        // For actual instruction lines, increment the address
        currentAddress += INSTRUCTION_SIZE;
    });
    
    // Reset address for second pass
    currentAddress = parseInt(baseAddress, 16);
    
    // Second pass: process instructions
    lines.forEach(line => {
        // Remove comments
        const commentFreeLine = line.replace(/\/\/.*$|\/\*[\s\S]*?\*\//g, '').trim();
        
        // Skip empty lines or directive lines
        if (!commentFreeLine || commentFreeLine.startsWith('.')) {
            return;
        }
        
        let instructionLine = commentFreeLine;
        
        // Check if this line contains a label
        if (commentFreeLine.includes(':')) {
            const labelParts = commentFreeLine.split(':');
            instructionLine = labelParts[1].trim();
            
            // If there's no instruction after the label, skip to next line
            if (instructionLine === '') {
                return;
            }
        }
        
        // Format the instruction line
        const addressHex = currentAddress.toString(16).padStart(6, '0');
        
        // Normalize case and spacing
        let normalizedInstruction = instructionLine.trim()
            .replace(/\s+/g, ' ')
            .replace(/,\s*/g, ',')
            .toLowerCase();
        
        // Replace register references (R0-R15 to x0-x15)
        normalizedInstruction = normalizedInstruction.replace(/\br(\d+)/gi, (match, regNum) => {
            const num = parseInt(regNum);
            return `x${num}`;
        });
        
        // Special case for SWI - convert to appropriate instruction for simulator
        if (normalizedInstruction.startsWith('swi')) {
            normalizedInstruction = 'nop'; // Replace with NOP as simulator may not support SWI
        }
        
        // Special case for MOV - convert to appropriate format
        if (normalizedInstruction.startsWith('mov')) {
            // Replace MOV Rd, #imm with suitable simulator instruction
            normalizedInstruction = normalizedInstruction.replace(
                /mov\s+([^\s,]+),\s+#(\d+)/i,
                'add $1,xzr,#$2'
            );
        }
        
        // Generate a dummy machine code (not real)
        const dummyMachineCode = '00000000';
        
        processedLines.push(`${addressHex}: ${dummyMachineCode}   ${normalizedInstruction}`);
        
        // Increment address for next instruction
        currentAddress += INSTRUCTION_SIZE;
    });
    
    return processedLines.join('\n');
}

/**
 * Parse simulator output into a structured format
 * @param {string} output - Raw output from the simulator
 * @returns {Object} Structured simulator results
 */
function parseSimulatorOutput(output) {
    const result = {
        registers: {},
        stack: [],
        steps: []
    };

    let currentStep = null;
    let inRegisters = false;
    let inStack = false;
    
    const lines = output.split('\n');
    let address = '';
    let instruction = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect the start of a new instruction execution
        if (line.match(/^0x[0-9a-f]+ /)) {
            // If we have a previous step, add it to steps
            if (currentStep) {
                result.steps.push(currentStep);
            }
            
            // Extract address and instruction
            const parts = line.split(' ');
            address = parts[0];
            instruction = parts.slice(1).join(' ');
            
            // Create a new step
            currentStep = {
                address,
                instruction,
                registers: { ...result.registers },
                stack: [...result.stack]
            };
            
            inRegisters = false;
            inStack = false;
            continue;
        }
        
        // Parse register values
        if (line === 'Registers:') {
            inRegisters = true;
            inStack = false;
            continue;
        }
        
        if (inRegisters) {
            const regMatch = line.match(/\s*(x\d+|sp|pc)\s*=\s*(0x[0-9a-f]+)/i);
            if (regMatch) {
                const [_, register, value] = regMatch;
                result.registers[register] = value;
            } else if (line === 'Stack:') {
                inRegisters = false;
                inStack = true;
            }
            continue;
        }
        
        // Parse stack values
        if (inStack) {
            const stackMatch = line.match(/0x[0-9a-f]+ \| ([0-9A-F ]+) \|/i);
            if (stackMatch) {
                const bytes = stackMatch[1].trim().split(' ');
                result.stack.push(bytes.join(' '));
            }
        }
    }
    
    // Add the last step
    if (currentStep) {
        result.steps.push(currentStep);
    }
    
    return result;
}

/**
 * Execute assembly code with the simulator
 * @param {string} code - Assembly code to execute
 * @param {string} sp - Initial stack pointer value
 * @param {string} pc - Initial program counter value
 * @param {string} pcEnd - Program counter value to stop at
 * @param {boolean} preprocess - Whether to preprocess the code
 * @returns {Promise<Object>} Simulation results
 */
async function executeSimulation(code, sp, pc, pcEnd, preprocess = false) {
    return new Promise((resolve, reject) => {
        // Check if simulator exists
        if (!checkSimulatorExists()) {
            return reject(new Error(
                "Simulator executable not found. Please build the simulator first by running 'make'."
            ));
        }

        // Preprocess the code if needed
        if (preprocess) {
            // Extract base address from PC
            const baseAddress = pc.startsWith('0x') ? pc.substring(2) : pc;
            code = preprocessCode(code, baseAddress);
        }

        // Write the assembly code to a temporary file
        fs.writeFileSync(TEMP_FILE, code);
        
        // Execute the simulator with the given parameters
        execFile(SIMULATOR_PATH, [TEMP_FILE, sp, pc, pcEnd], (error, stdout, stderr) => {
            if (error) {
                return reject(new Error(`Simulator execution failed: ${error.message}`));
            }
            
            if (stderr) {
                console.warn(`Simulator stderr: ${stderr}`);
            }
            
            try {
                const result = parseSimulatorOutput(stdout);
                resolve(result);
            } catch (parseError) {
                reject(new Error(`Failed to parse simulator output: ${parseError.message}`));
            }
        });
    });
}

module.exports = {
    executeSimulation,
    checkSimulatorExists,
    preprocessCode
}; 