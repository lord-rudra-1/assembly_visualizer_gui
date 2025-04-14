const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const { executeSimulation, checkSimulatorExists, preprocessCode } = require('./simulator_bridge');

// Serve static files from the public directory
app.use(express.static('public'));
app.use(express.json());

// Temporary file for assembly code
const TEMP_FILE = path.join(__dirname, 'temp_code.s');

// Helper to detect if code needs preprocessing
function needsPreprocessing(code) {
    // Look for indicators of standard assembly format:
    // 1. Contains directives (lines starting with .)
    // 2. Contains labels (lines ending with :)
    // 3. Contains register names in R format (R0-R15)
    // 4. Does not contain lines with address prefixes (400000:)
    
    if (code.includes('.global') || 
        code.includes('.text') || 
        /\b[a-zA-Z_]\w*\s*:/.test(code) || // label pattern
        /\bR\d+\b/i.test(code)) {  // R0-R15 pattern
        return true;
    }
    
    // Check if code already has address prefixes
    const addressPattern = /^[0-9a-fA-F]+:/m;
    return !addressPattern.test(code);
}

// Serve the main page
app.get('/', (req, res) => {
    // Check if simulator exists
    const simulatorExists = checkSimulatorExists();
    
    // Add a query parameter to inform the frontend
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Preprocess assembly code
app.post('/preprocess', (req, res) => {
    const { code, baseAddress } = req.body;
    try {
        const processed = preprocessCode(code, baseAddress || '400000');
        res.json({ processed });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check if the simulator exists
app.get('/check-simulator', (req, res) => {
    const simulatorExists = checkSimulatorExists();
    res.json({ 
        exists: simulatorExists,
        message: simulatorExists 
            ? "Simulator is ready" 
            : "Simulator not found. Please build it by running 'make' first."
    });
});

// Handle assembly code execution
app.post('/execute', async (req, res) => {
    const { code, sp, pc, pcEnd } = req.body;
    
    // Check if simulator exists
    if (!checkSimulatorExists()) {
        return res.status(500).json({ 
            error: "Simulator not found. Please build it by running 'make' first.",
            buildRequired: true
        });
    }
    
    // Determine if we need to preprocess the code
    const shouldPreprocess = needsPreprocessing(code);
    
    try {
        const result = await executeSimulation(code, sp, pc, pcEnd, shouldPreprocess);
        res.json(result);
    } catch (error) {
        console.error(`Error executing simulation: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    const simulatorExists = checkSimulatorExists();
    console.log(`Server running at http://localhost:${port}`);
    
    if (!simulatorExists) {
        console.log("\x1b[33m%s\x1b[0m", "WARNING: Simulator executable not found!");
        console.log("\x1b[33m%s\x1b[0m", "Please build the simulator by running 'make' first.");
    }
}); 