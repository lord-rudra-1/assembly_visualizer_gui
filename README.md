# ARM Assembly Visualizer

This is a simulator for visualizing ARM assembly code execution with both CLI and web GUI interfaces.

## Project Structure

The project is organized as follows:

```
.
├── include/                # Header files
│   ├── instructions.h      # Instruction definitions
│   ├── machine.h           # Machine state and code loading definitions 
│   └── parse.h             # Parsing utilities
├── public/                 # Web interface files
│   └── index.html          # GUI interface
├── src/                    # Source code
│   ├── core/               # Core functionality
│   │   ├── machine.c       # Machine state and code loading implementation
│   │   └── parse.c         # Parsing implementation
│   ├── instructions/       # Instruction implementations
│   │   └── instructions.c
│   └── simulator.c         # Main CLI application
├── tests/                  # Test files
│   ├── test_functions.c    # Tests for function instructions
│   ├── test_instructions.c # Tests for basic instructions
│   └── test_parse.c        # Tests for parsing
├── server.js               # Web server for GUI interface
├── simulator_bridge.js     # Bridge between C simulator and web interface
└── package.json            # Node.js dependencies
```

## Building the Project

To build the project, simply run:

```
make
```

This will build the simulator executable and the test programs.

## Running the CLI Simulator

To run the simulator from the command line:

```
./simulator CODE SP PC PC_END
```

Where:
- CODE is the path to the code file
- SP is the initial stack pointer value
- PC is the initial program counter value
- PC_END is the program counter value to stop at

## Running the GUI Interface

To run the web-based GUI, you need Node.js installed. Then run:

```
./run.sh
```

Or manually:

```
# Build the C simulator
make

# Install Node.js dependencies
npm install

# Start the web server
node server.js
```

Then open your browser to http://localhost:3000

The GUI provides:
- Visual representation of register values
- Stack visualization
- Step-by-step execution tracking
- Highlighting of register changes
- ARM assembly code execution visualization

## Running Tests

The project includes three test programs:

```
./test_parse        # Tests the instruction parsing
./test_instructions # Tests basic instructions
./test_functions    # Tests function call instructions
``` 