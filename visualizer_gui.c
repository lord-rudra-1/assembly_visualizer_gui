#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <SDL2/SDL.h>
#include <SDL2/SDL_ttf.h>
#include "machine.h"
#include "parse.h"
#include "code.h"

// Constants for the GUI
#define WINDOW_WIDTH 1300
#define WINDOW_HEIGHT 800
#define FONT_SIZE 14
#define REGISTER_WIDTH 180
#define LINE_HEIGHT 20
#define PADDING 10
#define MAX_CODE_LINES 500
#define CODE_AREA_WIDTH 450
#define REGISTER_AREA_WIDTH 300
#define MEMORY_AREA_WIDTH 300
#define INPUT_AREA_WIDTH 200
#define BUTTON_WIDTH 120
#define BUTTON_HEIGHT 40
#define MAX_INPUT_LENGTH 20

// Input handling
typedef struct {
    char text[MAX_INPUT_LENGTH];
    int cursor;
    bool active;
    bool visible;
    SDL_Rect rect;
    char label[32];
    int targetRegister;
} InputField;

// Global variables
SDL_Window* window = NULL;
SDL_Renderer* renderer = NULL;
TTF_Font* font = NULL;
TTF_Font* boldFont = NULL;
bool running = true;
bool initialized = false;
int currentLine = 0;
char* loadedFile = NULL;
uint64_t sp_start = 0xFF00;
uint64_t pc_start = 0;
uint64_t pc_end = 0;
char code_filepath[256] = "";
InputField registerInput = {"", 0, false, false, {0, 0, 0, 0}, "Register", -1};
InputField memoryInput = {"", 0, false, false, {0, 0, 0, 0}, "Memory Address", -1};
InputField valueInput = {"", 0, false, false, {0, 0, 0, 0}, "Value", 0};
InputField* activeInput = NULL;

// UI Elements
SDL_Rect codeArea = {PADDING, PADDING, CODE_AREA_WIDTH, WINDOW_HEIGHT - 2*PADDING - BUTTON_HEIGHT - PADDING};
SDL_Rect registerArea = {PADDING + CODE_AREA_WIDTH + PADDING, PADDING, REGISTER_AREA_WIDTH, WINDOW_HEIGHT - 2*PADDING - BUTTON_HEIGHT - PADDING};
SDL_Rect memoryArea = {PADDING + CODE_AREA_WIDTH + PADDING + REGISTER_AREA_WIDTH + PADDING, PADDING, MEMORY_AREA_WIDTH, WINDOW_HEIGHT - 2*PADDING - BUTTON_HEIGHT - PADDING};
SDL_Rect inputArea = {PADDING + CODE_AREA_WIDTH + PADDING + REGISTER_AREA_WIDTH + PADDING + MEMORY_AREA_WIDTH + PADDING, PADDING, INPUT_AREA_WIDTH, WINDOW_HEIGHT - 2*PADDING - BUTTON_HEIGHT - PADDING};
SDL_Rect stepButton = {PADDING, WINDOW_HEIGHT - PADDING - BUTTON_HEIGHT, BUTTON_WIDTH, BUTTON_HEIGHT};
SDL_Rect resetButton = {PADDING + BUTTON_WIDTH + PADDING, WINDOW_HEIGHT - PADDING - BUTTON_HEIGHT, BUTTON_WIDTH, BUTTON_HEIGHT};
SDL_Rect loadButton = {PADDING + 2 * (BUTTON_WIDTH + PADDING), WINDOW_HEIGHT - PADDING - BUTTON_HEIGHT, BUTTON_WIDTH, BUTTON_HEIGHT};
SDL_Rect setRegButton = {PADDING + 3 * (BUTTON_WIDTH + PADDING), WINDOW_HEIGHT - PADDING - BUTTON_HEIGHT, BUTTON_WIDTH, BUTTON_HEIGHT};

// Function prototypes
bool init_sdl();
void cleanup();
void render_text(const char* text, int x, int y, SDL_Color color, bool bold);
void render_button(SDL_Rect button, const char* text);
bool button_clicked(SDL_Rect button, int mouseX, int mouseY);
void render_code();
void render_registers();
void render_memory();
void render_input_area();
void render_input_field(InputField* field);
void step_execution();
void reset_execution();
void load_file();
void set_register_value();
void handle_text_input(const char* text);
void handle_keydown(SDL_KeyboardEvent* key);
void render();
void handle_events();
void activate_input_field(InputField* field);
void export_to_web();

int main(int argc, char **argv) {
    if (argc > 1) {
        strncpy(code_filepath, argv[1], sizeof(code_filepath) - 1);
    }
    
    if (!init_sdl()) {
        return 1;
    }
    
    // Initialize input fields
    registerInput.rect = (SDL_Rect){inputArea.x + 10, inputArea.y + 40, 180, 30};
    memoryInput.rect = (SDL_Rect){inputArea.x + 10, inputArea.y + 110, 180, 30};
    valueInput.rect = (SDL_Rect){inputArea.x + 10, inputArea.y + 180, 180, 30};
    
    // Main loop
    while (running) {
        handle_events();
        render();
        SDL_Delay(16); // 60 FPS
    }
    
    cleanup();
    return 0;
}

bool init_sdl() {
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        printf("SDL could not initialize! SDL_Error: %s\n", SDL_GetError());
        return false;
    }
    
    if (TTF_Init() < 0) {
        printf("SDL_ttf could not initialize! TTF_Error: %s\n", TTF_GetError());
        return false;
    }
    
    window = SDL_CreateWindow("Assembly Visualizer", 
                              SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, 
                              WINDOW_WIDTH, WINDOW_HEIGHT, 
                              SDL_WINDOW_SHOWN);
    if (window == NULL) {
        printf("Window could not be created! SDL_Error: %s\n", SDL_GetError());
        return false;
    }
    
    renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);
    if (renderer == NULL) {
        printf("Renderer could not be created! SDL_Error: %s\n", SDL_GetError());
        return false;
    }
    
    // Load font
    font = TTF_OpenFont("DejaVuSansMono.ttf", FONT_SIZE);
    boldFont = TTF_OpenFont("DejaVuSansMono-Bold.ttf", FONT_SIZE);
    if (font == NULL || boldFont == NULL) {
        printf("Failed to load font! TTF_Error: %s\n", TTF_GetError());
        // Try a system font as fallback
        font = TTF_OpenFont("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", FONT_SIZE);
        boldFont = TTF_OpenFont("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", FONT_SIZE);
        
        if (font == NULL || boldFont == NULL) {
            printf("Failed to load fallback font! TTF_Error: %s\n", TTF_GetError());
            return false;
        }
    }
    
    // If a file was provided on command line, load it
    if (strlen(code_filepath) > 0) {
        loadedFile = code_filepath;
        pc_start = 0x4000;
        pc_end = 0x7FFF; // Some arbitrary high address
        sp_start = 0xFF00;
        init_machine(sp_start, pc_start, loadedFile);
        initialized = true;
    }
    
    // Enable text input
    SDL_StartTextInput();
    
    return true;
}

void cleanup() {
    SDL_StopTextInput();
    TTF_CloseFont(font);
    TTF_CloseFont(boldFont);
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    TTF_Quit();
    SDL_Quit();
}

void render_text(const char* text, int x, int y, SDL_Color color, bool bold) {
    TTF_Font* currentFont = bold ? boldFont : font;
    SDL_Surface* surface = TTF_RenderText_Solid(currentFont, text, color);
    SDL_Texture* texture = SDL_CreateTextureFromSurface(renderer, surface);
    
    SDL_Rect rect = {x, y, surface->w, surface->h};
    SDL_RenderCopy(renderer, texture, NULL, &rect);
    
    SDL_FreeSurface(surface);
    SDL_DestroyTexture(texture);
}

void render_button(SDL_Rect button, const char* text) {
    // Button background
    SDL_SetRenderDrawColor(renderer, 100, 100, 100, 255);
    SDL_RenderFillRect(renderer, &button);
    
    // Button border
    SDL_SetRenderDrawColor(renderer, 200, 200, 200, 255);
    SDL_RenderDrawRect(renderer, &button);
    
    // Button text
    SDL_Color textColor = {255, 255, 255, 255};
    int textX = button.x + (button.w - strlen(text) * 8) / 2;
    int textY = button.y + (button.h - FONT_SIZE) / 2;
    render_text(text, textX, textY, textColor, true);
}

bool button_clicked(SDL_Rect button, int mouseX, int mouseY) {
    return (mouseX >= button.x && mouseX <= button.x + button.w &&
            mouseY >= button.y && mouseY <= button.y + button.h);
}

void render_input_field(InputField* field) {
    if (!field->visible) return;
    
    // Field background
    SDL_SetRenderDrawColor(renderer, field->active ? 50 : 30, 50, 50, 255);
    SDL_RenderFillRect(renderer, &field->rect);
    
    // Field border
    SDL_SetRenderDrawColor(renderer, field->active ? 200 : 120, 120, 120, 255);
    SDL_RenderDrawRect(renderer, &field->rect);
    
    // Label
    SDL_Color labelColor = {180, 180, 180, 255};
    render_text(field->label, field->rect.x, field->rect.y - 20, labelColor, true);
    
    // Text
    SDL_Color textColor = {255, 255, 255, 255};
    render_text(field->text, field->rect.x + 5, field->rect.y + 5, textColor, false);
    
    // Cursor
    if (field->active) {
        int cursorX = field->rect.x + 5 + field->cursor * 8;
        SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
        SDL_RenderDrawLine(renderer, cursorX, field->rect.y + 5, cursorX, field->rect.y + field->rect.h - 5);
    }
}

void render_code() {
    SDL_SetRenderDrawColor(renderer, 30, 30, 30, 255);
    SDL_RenderFillRect(renderer, &codeArea);
    
    SDL_SetRenderDrawColor(renderer, 80, 80, 80, 255);
    SDL_RenderDrawRect(renderer, &codeArea);
    
    SDL_Color textColor = {220, 220, 220, 255};
    SDL_Color highlightColor = {255, 255, 0, 255};
    
    render_text("Code:", codeArea.x + 10, codeArea.y + 10, textColor, true);
    
    if (initialized) {
        int offset = (machine.registers[pc] - machine.code_start) / 4;
        int startLine = (offset > 5) ? offset - 5 : 0;
        
        for (int i = 0; i < 20 && startLine + i < MAX_CODE_LINES; i++) {
            if (machine.code[startLine + i] == NULL) break;
            
            char line[256];
            snprintf(line, sizeof(line), "%04X: %s", 
                     (unsigned int)(machine.code_start + (startLine + i) * 4),
                     machine.code[startLine + i]);
            
            SDL_Color color = (startLine + i == offset - 1) ? highlightColor : textColor;
            bool isBold = (startLine + i == offset - 1);
            
            render_text(line, codeArea.x + 10, codeArea.y + 40 + i * LINE_HEIGHT, color, isBold);
        }
    } else {
        render_text("No code loaded", codeArea.x + 10, codeArea.y + 40, textColor, false);
    }
}

void render_registers() {
    SDL_SetRenderDrawColor(renderer, 30, 30, 30, 255);
    SDL_RenderFillRect(renderer, &registerArea);
    
    SDL_SetRenderDrawColor(renderer, 80, 80, 80, 255);
    SDL_RenderDrawRect(renderer, &registerArea);
    
    SDL_Color textColor = {220, 220, 220, 255};
    SDL_Color usedColor = {100, 255, 100, 255};
    
    render_text("Registers:", registerArea.x + 10, registerArea.y + 10, textColor, true);
    
    if (initialized) {
        int col = 0;
        int row = 1;
        
        for (int i = 0; i < 33; i++) {
            char reg[64];
            char regName[4] = "";
            
            if (i == 31) {
                strcpy(regName, "sp");
            } else if (i == 32) {
                strcpy(regName, "pc");
            } else {
                snprintf(regName, sizeof(regName), "x%d", i);
            }
            
            snprintf(reg, sizeof(reg), "%s: 0x%lx", regName, machine.registers[i]);
            
            SDL_Color color = machine.used[i] ? usedColor : textColor;
            
            render_text(reg, 
                       registerArea.x + 10 + col * 150, 
                       registerArea.y + 40 + row * LINE_HEIGHT, 
                       color, false);
            
            col++;
            if (col > 1) {
                col = 0;
                row++;
            }
        }
    } else {
        render_text("Not initialized", registerArea.x + 10, registerArea.y + 40, textColor, false);
    }
}

void render_memory() {
    SDL_SetRenderDrawColor(renderer, 30, 30, 30, 255);
    SDL_RenderFillRect(renderer, &memoryArea);
    
    SDL_SetRenderDrawColor(renderer, 80, 80, 80, 255);
    SDL_RenderDrawRect(renderer, &memoryArea);
    
    SDL_Color textColor = {220, 220, 220, 255};
    
    render_text("Memory (Stack):", memoryArea.x + 10, memoryArea.y + 10, textColor, true);
    
    if (initialized && machine.stack != NULL) {
        uint64_t* stack = (uint64_t*)machine.stack;
        uint64_t stackSize = (machine.stack_top - machine.stack_bot) / 8;
        
        int maxItems = 20; // Show at most 20 items from the stack
        int startItem = stackSize > maxItems ? stackSize - maxItems : 0;
        
        for (int i = 0; i < maxItems && startItem + i < stackSize; i++) {
            char memory[128];
            snprintf(memory, sizeof(memory), "0x%lx: 0x%lx", 
                    machine.stack_bot + (startItem + i) * 8,
                    stack[startItem + i]);
            
            render_text(memory, memoryArea.x + 10, memoryArea.y + 40 + i * LINE_HEIGHT, textColor, false);
        }
    } else {
        render_text("No memory to display", memoryArea.x + 10, memoryArea.y + 40, textColor, false);
    }
}

void render_input_area() {
    SDL_SetRenderDrawColor(renderer, 30, 30, 30, 255);
    SDL_RenderFillRect(renderer, &inputArea);
    
    SDL_SetRenderDrawColor(renderer, 80, 80, 80, 255);
    SDL_RenderDrawRect(renderer, &inputArea);
    
    SDL_Color textColor = {220, 220, 220, 255};
    
    render_text("User Input:", inputArea.x + 10, inputArea.y + 10, textColor, true);
    
    // Render input fields
    registerInput.visible = true;
    memoryInput.visible = true;
    valueInput.visible = true;
    
    render_input_field(&registerInput);
    render_input_field(&memoryInput);
    render_input_field(&valueInput);
    
    // Instructions
    render_text("Enter register number (0-32)", inputArea.x + 10, inputArea.y + 220, textColor, false);
    render_text("or memory address (hex)", inputArea.x + 10, inputArea.y + 240, textColor, false);
    render_text("and value to set.", inputArea.x + 10, inputArea.y + 260, textColor, false);
    
    // Button for setting values
    SDL_Rect setButton = {inputArea.x + 10, inputArea.y + 290, 180, 30};
    render_button(setButton, "Set Value");
}

void step_execution() {
    if (!initialized || machine.registers[pc] == pc_end) return;
    
    printf("0x%lx ", machine.registers[pc]);
    int offset = (machine.registers[pc] - machine.code_start) / 4;
    char* instruction = machine.code[offset];
    machine.registers[pc] += 4;
    execute(parse_instruction(instruction));
}

void reset_execution() {
    if (loadedFile != NULL) {
        init_machine(sp_start, pc_start, loadedFile);
        initialized = true;
    }
}

void load_file() {
    // This is a simple file dialog
    // In a real application, you'd use a proper file dialog
    char filepath[256];
    printf("Enter assembly file path: ");
    if (scanf("%255s", filepath) == 1) {
        strncpy(code_filepath, filepath, sizeof(code_filepath) - 1);
        loadedFile = code_filepath;
        
        printf("Enter starting PC (hex, e.g. 0x4000): ");
        if (scanf("%lx", &pc_start) != 1) {
            pc_start = 0x4000; // Default
        }
        
        printf("Enter ending PC (hex, e.g. 0x7FFF): ");
        if (scanf("%lx", &pc_end) != 1) {
            pc_end = 0x7FFF; // Default
        }
        
        printf("Enter starting SP (hex, e.g. 0xFF00): ");
        if (scanf("%lx", &sp_start) != 1) {
            sp_start = 0xFF00; // Default
        }
        
        init_machine(sp_start, pc_start, loadedFile);
        initialized = true;
    }
}

void set_register_value() {
    if (!initialized) return;
    
    // For register input
    if (strlen(registerInput.text) > 0) {
        int regNum = atoi(registerInput.text);
        if (regNum >= 0 && regNum <= 32 && strlen(valueInput.text) > 0) {
            uint64_t value = strtoull(valueInput.text, NULL, 0);
            machine.registers[regNum] = value;
            machine.used[regNum] = 1;
            printf("Set register x%d to 0x%lx\n", regNum, value);
        }
    }
    
    // For memory input
    if (strlen(memoryInput.text) > 0 && strlen(valueInput.text) > 0) {
        uint64_t address = strtoull(memoryInput.text, NULL, 0);
        uint64_t value = strtoull(valueInput.text, NULL, 0);
        
        // Check if address is in stack range
        if (address >= machine.stack_bot && address < machine.stack_top) {
            uint64_t offset = (address - machine.stack_bot) / 8;
            uint64_t* stack = (uint64_t*)machine.stack;
            stack[offset] = value;
            printf("Set memory at 0x%lx to 0x%lx\n", address, value);
        }
    }
    
    // Clear input fields
    registerInput.text[0] = '\0';
    registerInput.cursor = 0;
    memoryInput.text[0] = '\0';
    memoryInput.cursor = 0;
    valueInput.text[0] = '\0';
    valueInput.cursor = 0;
    activeInput = NULL;
}

void handle_text_input(const char* text) {
    if (activeInput == NULL) return;
    
    int len = strlen(activeInput->text);
    if (len < MAX_INPUT_LENGTH - 1) {
        // Insert text at cursor position
        memmove(activeInput->text + activeInput->cursor + 1, 
                activeInput->text + activeInput->cursor, 
                len - activeInput->cursor + 1);
        activeInput->text[activeInput->cursor] = text[0];
        activeInput->cursor++;
    }
}

void handle_keydown(SDL_KeyboardEvent* key) {
    if (activeInput == NULL) return;
    
    switch (key->keysym.sym) {
        case SDLK_BACKSPACE:
            if (activeInput->cursor > 0) {
                // Remove character at cursor position - 1
                memmove(activeInput->text + activeInput->cursor - 1, 
                        activeInput->text + activeInput->cursor, 
                        strlen(activeInput->text) - activeInput->cursor + 1);
                activeInput->cursor--;
            }
            break;
        case SDLK_DELETE:
            if (activeInput->cursor < strlen(activeInput->text)) {
                // Remove character at cursor position
                memmove(activeInput->text + activeInput->cursor, 
                        activeInput->text + activeInput->cursor + 1, 
                        strlen(activeInput->text) - activeInput->cursor);
            }
            break;
        case SDLK_LEFT:
            if (activeInput->cursor > 0) {
                activeInput->cursor--;
            }
            break;
        case SDLK_RIGHT:
            if (activeInput->cursor < strlen(activeInput->text)) {
                activeInput->cursor++;
            }
            break;
        case SDLK_HOME:
            activeInput->cursor = 0;
            break;
        case SDLK_END:
            activeInput->cursor = strlen(activeInput->text);
            break;
        case SDLK_TAB:
            // Cycle through input fields
            if (activeInput == &registerInput) {
                activate_input_field(&memoryInput);
            } else if (activeInput == &memoryInput) {
                activate_input_field(&valueInput);
            } else {
                activate_input_field(&registerInput);
            }
            break;
        case SDLK_RETURN:
            set_register_value();
            break;
    }
}

void activate_input_field(InputField* field) {
    if (activeInput != NULL) {
        activeInput->active = false;
    }
    activeInput = field;
    if (activeInput != NULL) {
        activeInput->active = true;
    }
}

void export_to_web() {
    FILE* f = fopen("web_export.html", "w");
    if (!f) return;
    
    // Write HTML header
    fprintf(f, "<!DOCTYPE html>\n<html>\n<head>\n");
    fprintf(f, "  <title>Assembly Visualizer</title>\n");
    fprintf(f, "  <style>\n");
    fprintf(f, "    body { font-family: monospace; background-color: #222; color: #ddd; }\n");
    fprintf(f, "    .container { display: flex; }\n");
    fprintf(f, "    .panel { margin: 10px; padding: 10px; background-color: #333; border: 1px solid #555; }\n");
    fprintf(f, "    .highlight { color: yellow; font-weight: bold; }\n");
    fprintf(f, "    .used { color: #6f6; }\n");
    fprintf(f, "    button { background-color: #444; color: white; border: 1px solid #666; padding: 5px 10px; }\n");
    fprintf(f, "    input { background-color: #444; color: white; border: 1px solid #666; padding: 5px; }\n");
    fprintf(f, "  </style>\n");
    fprintf(f, "</head>\n<body>\n");
    
    // Main container
    fprintf(f, "  <div class='container'>\n");
    
    // Code panel
    fprintf(f, "    <div class='panel' id='code-panel'>\n");
    fprintf(f, "      <h3>Code</h3>\n");
    fprintf(f, "      <pre id='code-display'>");
    
    if (initialized) {
        int offset = (machine.registers[pc] - machine.code_start) / 4;
        
        for (int i = 0; i < MAX_CODE_LINES; i++) {
            if (machine.code[i] == NULL) break;
            
            fprintf(f, "%s%04X: %s%s\n", 
                   (i == offset - 1) ? "<span class='highlight'>" : "",
                   (unsigned int)(machine.code_start + i * 4),
                   machine.code[i],
                   (i == offset - 1) ? "</span>" : "");
        }
    } else {
        fprintf(f, "No code loaded");
    }
    
    fprintf(f, "</pre>\n    </div>\n");
    
    // Register panel
    fprintf(f, "    <div class='panel'>\n");
    fprintf(f, "      <h3>Registers</h3>\n");
    fprintf(f, "      <div id='register-display'>\n");
    
    if (initialized) {
        for (int i = 0; i < 33; i++) {
            char regName[4] = "";
            
            if (i == 31) {
                strcpy(regName, "sp");
            } else if (i == 32) {
                strcpy(regName, "pc");
            } else {
                snprintf(regName, sizeof(regName), "x%d", i);
            }
            
            fprintf(f, "        <div %s>%s: 0x%lx</div>\n", 
                   machine.used[i] ? "class='used'" : "",
                   regName, machine.registers[i]);
        }
    } else {
        fprintf(f, "        <div>Not initialized</div>\n");
    }
    
    fprintf(f, "      </div>\n    </div>\n");
    
    // Memory panel
    fprintf(f, "    <div class='panel'>\n");
    fprintf(f, "      <h3>Memory (Stack)</h3>\n");
    fprintf(f, "      <div id='memory-display'>\n");
    
    if (initialized && machine.stack != NULL) {
        uint64_t* stack = (uint64_t*)machine.stack;
        uint64_t stackSize = (machine.stack_top - machine.stack_bot) / 8;
        
        int maxItems = 20;
        int startItem = stackSize > maxItems ? stackSize - maxItems : 0;
        
        for (int i = 0; i < maxItems && startItem + i < stackSize; i++) {
            fprintf(f, "        <div>0x%lx: 0x%lx</div>\n", 
                   machine.stack_bot + (startItem + i) * 8,
                   stack[startItem + i]);
        }
    } else {
        fprintf(f, "        <div>No memory to display</div>\n");
    }
    
    fprintf(f, "      </div>\n    </div>\n");
    
    // Input panel
    fprintf(f, "    <div class='panel'>\n");
    fprintf(f, "      <h3>User Input</h3>\n");
    fprintf(f, "      <div>\n");
    fprintf(f, "        <label for='reg-input'>Register:</label><br>\n");
    fprintf(f, "        <input type='text' id='reg-input' placeholder='0-32'><br><br>\n");
    fprintf(f, "        <label for='mem-input'>Memory Address:</label><br>\n");
    fprintf(f, "        <input type='text' id='mem-input' placeholder='0xAddress'><br><br>\n");
    fprintf(f, "        <label for='val-input'>Value:</label><br>\n");
    fprintf(f, "        <input type='text' id='val-input' placeholder='Value'><br><br>\n");
    fprintf(f, "        <button id='set-button'>Set Value</button>\n");
    fprintf(f, "      </div>\n    </div>\n");
    
    fprintf(f, "  </div>\n");
    
    // Control buttons
    fprintf(f, "  <div>\n");
    fprintf(f, "    <button id='step-button'>Step</button>\n");
    fprintf(f, "    <button id='reset-button'>Reset</button>\n");
    fprintf(f, "    <button id='load-button'>Load File</button>\n");
    fprintf(f, "  </div>\n");
    
    // Add note about being a static export
    fprintf(f, "  <p><i>Note: This is a static HTML export. For full functionality, use the desktop application.</i></p>\n");
    
    // Close HTML
    fprintf(f, "</body>\n</html>\n");
    
    fclose(f);
    printf("Exported to web_export.html\n");
}

void render() {
    // Clear screen
    SDL_SetRenderDrawColor(renderer, 20, 20, 20, 255);
    SDL_RenderClear(renderer);
    
    // Render UI components
    render_code();
    render_registers();
    render_memory();
    render_input_area();
    
    // Render buttons
    render_button(stepButton, "Step");
    render_button(resetButton, "Reset");
    render_button(loadButton, "Load File");
    render_button(setRegButton, "Export to Web");
    
    // Update screen
    SDL_RenderPresent(renderer);
}

void handle_events() {
    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        switch (event.type) {
            case SDL_QUIT:
                running = false;
                break;
            case SDL_MOUSEBUTTONDOWN:
                if (event.button.button == SDL_BUTTON_LEFT) {
                    int mouseX = event.button.x;
                    int mouseY = event.button.y;
                    
                    if (button_clicked(stepButton, mouseX, mouseY)) {
                        step_execution();
                    } else if (button_clicked(resetButton, mouseX, mouseY)) {
                        reset_execution();
                    } else if (button_clicked(loadButton, mouseX, mouseY)) {
                        load_file();
                    } else if (button_clicked(setRegButton, mouseX, mouseY)) {
                        export_to_web();
                    } else if (button_clicked(registerInput.rect, mouseX, mouseY)) {
                        activate_input_field(&registerInput);
                    } else if (button_clicked(memoryInput.rect, mouseX, mouseY)) {
                        activate_input_field(&memoryInput);
                    } else if (button_clicked(valueInput.rect, mouseX, mouseY)) {
                        activate_input_field(&valueInput);
                    } else {
                        SDL_Rect setButton = {inputArea.x + 10, inputArea.y + 290, 180, 30};
                        if (button_clicked(setButton, mouseX, mouseY)) {
                            set_register_value();
                        } else {
                            // Clicked outside of any input field
                            if (activeInput != NULL) {
                                activeInput->active = false;
                                activeInput = NULL;
                            }
                        }
                    }
                }
                break;
            case SDL_TEXTINPUT:
                handle_text_input(event.text.text);
                break;
            case SDL_KEYDOWN:
                handle_keydown(&event.key);
                
                // Global key shortcuts
                if (!activeInput) {
                    if (event.key.keysym.sym == SDLK_SPACE) {
                        step_execution();
                    } else if (event.key.keysym.sym == SDLK_r) {
                        reset_execution();
                    } else if (event.key.keysym.sym == SDLK_l) {
                        load_file();
                    } else if (event.key.keysym.sym == SDLK_ESCAPE) {
                        running = false;
                    }
                }
                break;
        }
    }
} 