# Assembly Visualizer GUI

A graphical user interface for the assembly code visualizer. This tool allows you to step through assembly code and visualize the state of registers and memory.

## Features

- Load and visualize assembly code files
- Step through code execution one instruction at a time
- View register values with highlighting for used registers
- View memory/stack contents
- Accept user input to modify register and memory values
- Cross-platform support (Linux, macOS, Windows)
- Web interface for browser-based visualization

## Requirements

For the desktop application:
- SDL2 and SDL2_ttf libraries
- C compiler (GCC recommended)
- Make build system

For the web interface:
- Any modern web browser

## Installation

### Desktop Application

#### Dependencies

##### macOS
```
brew install sdl2 sdl2_ttf
```

##### Ubuntu/Debian
```
sudo apt-get update && sudo apt-get install -y libsdl2-dev libsdl2-ttf-dev
```

##### Windows
Install MinGW and the SDL2/SDL2_ttf development libraries. You can use MSYS2 to simplify installation:
```
pacman -S mingw-w64-x86_64-gcc mingw-w64-x86_64-SDL2 mingw-w64-x86_64-SDL2_ttf make
```

#### Building

You can use the provided Makefile to build the project:

```
make
```

Or use the target to install dependencies and build:

```
make install-deps
make
```

### Web Interface

No installation required! Simply open the `index.html` file in any modern web browser.

## Usage

### Desktop Application

Run the visualizer with an optional assembly file:

```
./assembly_visualizer_gui [assembly_file]
```

If you don't provide a file at startup, you can load one using the "Load File" button.

#### Controls

- **Step Button** or **Space Bar**: Execute the next instruction
- **Reset Button** or **R key**: Reset execution to the beginning
- **Load File Button** or **L key**: Load a new assembly file
- **Export to Web Button**: Generate a web page version of current state
- **ESC key**: Exit the program

#### User Input

The desktop application now includes input fields for:
- Setting register values directly
- Modifying memory/stack contents
- All inputs are applied immediately to the simulation state

### Web Interface

1. Open `index.html` in your web browser
2. Load an assembly program by:
   - Dragging and dropping an assembly file
   - Clicking the upload area to select a file
   - Using the included sample program
3. Set initial PC and SP values
4. Click "Initialize Program" to begin
5. Use the control buttons to step through execution or run the entire program

#### Controls

- **Step**: Execute one instruction
- **Reset**: Reset the program to initial state
- **Run All**: Automatically execute the entire program
- **Stop**: Pause automatic execution

#### User Input

The web interface allows you to:
- Modify register values by entering register number and value
- Modify memory by entering address and value
- All changes are applied immediately to the simulation

## Example Assembly Files

The visualizer expects assembly files in the format that your existing simulator supports. Make sure your assembly files are properly formatted.

## Font Requirements (Desktop Only)

The desktop visualizer requires DejaVuSansMono.ttf and DejaVuSansMono-Bold.ttf fonts. These fonts are commonly available on most systems. If the program can't find them, it will attempt to use system fonts as a fallback.

## License

This project is open-source software. 