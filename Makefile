.PHONY: clean
CC=clang
CFLAGS=-I./include -g -Wall --std=gnu11 -fpic
SRC_DIR=src
CORE_DIR=$(SRC_DIR)/core
INSTR_DIR=$(SRC_DIR)/instructions
UTILS_DIR=$(SRC_DIR)/utils
TEST_DIR=tests
BUILD_DIR=build
SRCS=$(CORE_DIR)/machine.c $(CORE_DIR)/parse.c $(INSTR_DIR)/instructions.c
OBJS=$(patsubst %.c,%.o,$(SRCS))
PROGRAM=simulator
TESTS=test_parse test_instructions test_functions

all: dirs $(PROGRAM) $(TESTS) 

dirs:
	mkdir -p $(BUILD_DIR)

$(PROGRAM): $(OBJS) $(SRC_DIR)/simulator.o
	$(CC) -o $@ $^ $(LDFLAGS)

test_%: $(OBJS) $(TEST_DIR)/test_%.o
	$(CC) -o $@ $^ $(LDFLAGS)

clean:
	rm -f $(SRC_DIR)/*.o $(CORE_DIR)/*.o $(INSTR_DIR)/*.o $(UTILS_DIR)/*.o $(TEST_DIR)/*.o $(PROGRAM) $(TESTS)

%.o: %.c
	$(CC) -c -o $@ $< $(CFLAGS)

lib%.so: $(OBJS)
	$(CC) -shared -o $@ $^ $(LDFLAGS)
