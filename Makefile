CC = gcc
CFLAGS = -Wall -Wextra -g
LDFLAGS = 

# Detect operating system
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
    LDFLAGS += -lSDL2 -lSDL2_ttf -lm
endif
ifeq ($(UNAME_S),Darwin)
    LDFLAGS += -lSDL2 -lSDL2_ttf
endif
ifeq ($(OS),Windows_NT)
    LDFLAGS += -lmingw32 -lSDL2main -lSDL2 -lSDL2_ttf
endif

# Source files
SRC = visualizer_gui.c machine.c instructions.c parse.c code.c
OBJ = $(SRC:.c=.o)
DEPS = machine.h instructions.h parse.h code.h

# Targets
all: assembly_visualizer_gui

assembly_visualizer_gui: $(OBJ)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.c $(DEPS)
	$(CC) $(CFLAGS) -c $< -o $@

.PHONY: clean

clean:
	rm -f assembly_visualizer_gui $(OBJ)

# Install SDL2 dependencies based on OS
install-deps:
ifeq ($(UNAME_S),Linux)
	sudo apt-get update && sudo apt-get install -y libsdl2-dev libsdl2-ttf-dev
endif
ifeq ($(UNAME_S),Darwin)
	brew install sdl2 sdl2_ttf
endif
ifeq ($(OS),Windows_NT)
	@echo "On Windows, please install MinGW and SDL2/SDL2_ttf development libraries manually"
endif 