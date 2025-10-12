CC=gcc
CFLAGS=-g -Wall -Werror -fsanitize=address -std=c99
LDFLAGS=

all: hashTable

hashTable: hashTable.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS)

clean:
	rm -f hashTable
