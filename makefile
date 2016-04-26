SRC_FILES = $(wildcard src/*.js)
LIB_FILES = $(patsubst src/%.js, lib/%.js, $(SRC_FILES))

BABEL = node_modules/.bin/babel

all: $(LIB_FILES)

lib/%.js: src/%.js lib
	$(BABEL) $(BABEL_OPTS) $< -o $@

lib:
	mkdir -p lib
