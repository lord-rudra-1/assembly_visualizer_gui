# ARM Assembly Visualizer

This is a simulator for visualizing ARM assembly code execution.

## Project Structure

The project is organized as follows:

```
.
├── include/             # Header files
│   ├── instructions.h   # Instruction definitions
│   ├── machine.h        # Machine state and code loading definitions 
│   └── parse.h          # Parsing utilities
├── src/                 # Source code
│   ├── core/            # Core functionality
│   │   ├── machine.c    # Machine state and code loading implementation
│   │   └── parse.c      # Parsing implementation
│   ├── instructions/    # Instruction implementations
│   │   └── instructions.c
│   └── simulator.c      # Main application
└── tests/               # Test files
    ├── test_functions.c # Tests for function instructions
    ├── test_instructions.c # Tests for basic instructions
    └── test_parse.c     # Tests for parsing
```

## Building the Project

To build the project, simply run:

```
make
```

This will build the simulator executable and the test programs.

## Running the Simulator

To run the simulator:

```
./simulator CODE SP PC PC_END
```

Where:
- CODE is the path to the code file
- SP is the initial stack pointer value
- PC is the initial program counter value
- PC_END is the program counter value to stop at

## Running Tests

The project includes three test programs:

```
./test_parse        # Tests the instruction parsing
./test_instructions # Tests basic instructions
./test_functions    # Tests function call instructions
``` 