#!/bin/bash

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}ARM Assembly Visualizer${NC}"
echo "========================================"

# Check if clang is installed
if ! command -v clang &> /dev/null; then
    echo -e "${RED}Error: clang compiler not found${NC}"
    echo "Please install clang to build the C simulator"
    exit 1
fi

# Build the C simulator
echo -e "${YELLOW}Building the C simulator...${NC}"
make clean && make

# Check if simulator built successfully
if [ ! -f "./simulator" ]; then
    echo -e "${RED}Error: Failed to build simulator${NC}"
    echo "Please check the build errors above and fix them"
    exit 1
else 
    echo -e "${GREEN}Simulator built successfully!${NC}"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js to run the web interface"
    exit 1
fi

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install express
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install Node.js dependencies${NC}"
        exit 1
    else
        echo -e "${GREEN}Dependencies installed successfully!${NC}"
    fi
fi

# Make sure execute permissions are set for the simulator
chmod +x ./simulator

# Start the web server
echo -e "${GREEN}Starting the ARM Assembly Visualizer...${NC}"
echo -e "${GREEN}Open http://localhost:3000 in your browser${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
node server.js 