#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

#define RESTOCK "RESTOCK"
#define SHOW_STOCK "SHOW_STOCK"
#define SALE "SALE"

// Separate chaining hash table for record store inventory
// Author: @nate-blum (completed implementation)

typedef struct HashNode {
    int count;
    char *album_name;
    struct HashNode *next;
} HashNode;

static HashNode **table = NULL;
static int table_fullness = 0;   // number of distinct albums (nodes)
static int table_size = 4;       // number of buckets

static char *string_duplicate(const char *src) {
    size_t len = strlen(src) + 1;
    char *copy = (char *)malloc(len);
    if (copy == NULL) {
        return NULL;
    }
    memcpy(copy, src, len);
    return copy;
}

static void rstrip_whitespace(char *s) {
    size_t len = strlen(s);
    while (len > 0) {
        char c = s[len - 1];
        if (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
            s[len - 1] = '\0';
            len--;
        } else {
            break;
        }
    }
}

int hash(char *str) {
    // Polynomial rolling hash (base 131), reduce at the end
    uint64_t h = 0;
    const unsigned char *p = (const unsigned char *)str;
    while (*p) {
        h = h * 131u + (uint64_t)(*p);
        p++;
    }
    return (int)(h % (uint64_t)table_size);
}

void pretty_print_table() {
    // Prints final inventory in required format, order does not matter
    printf("-------- FINAL COUNTS --------\n");
    for (int i = 0; i < table_size; i++) {
        HashNode *curr = table[i];
        while (curr != NULL) {
            printf("%s: %d\n", curr->album_name, curr->count);
            curr = curr->next;
        }
    }
    printf("------------------------------\n");
}

void resize() {
    int old_size = table_size;
    HashNode **old_table = table;

    table_size = old_size * 2;
    table = (HashNode **)calloc((size_t)table_size, sizeof(HashNode *));
    if (table == NULL) {
        // On allocation failure, revert and continue without resizing (best-effort)
        table = old_table;
        table_size = old_size;
        return;
    }

    // Rehash all nodes into the new table
    int old_fullness = table_fullness; // number of nodes to keep
    table_fullness = 0; // will recount as we insert into new table

    for (int i = 0; i < old_size; i++) {
        HashNode *curr = old_table[i];
        while (curr != NULL) {
            HashNode *next_node = curr->next;
            int new_index = hash(curr->album_name);
            curr->next = table[new_index];
            table[new_index] = curr;
            table_fullness++;
            curr = next_node;
        }
    }

    // Free only the old bucket array; nodes are kept and relinked above
    free(old_table);

    // Sanity: keep table_fullness equal to previous number of nodes if something went odd
    if (table_fullness != old_fullness) {
        table_fullness = old_fullness;
    }
}

void update(char *album, int k, char *command) {
    int index = hash(album);
    HashNode *curr = table[index];
    while (curr != NULL && strcmp(curr->album_name, album) != 0) {
        curr = curr->next;
    }

    if (strcmp(command, RESTOCK) == 0) {
        if (curr == NULL) {
            HashNode *new_node = (HashNode *)malloc(sizeof(HashNode));
            if (new_node == NULL) {
                return; // Out of memory; gracefully do nothing
            }
            char *name_copy = string_duplicate(album);
            if (name_copy == NULL) {
                free(new_node);
                return;
            }
            new_node->count = k;
            new_node->album_name = name_copy;
            new_node->next = table[index];
            table[index] = new_node;
            table_fullness++;

            // Resize when load factor >= 0.5
            if (table_fullness * 2 >= table_size) {
                resize();
            }
        } else {
            // Album already exists; increase stock
            curr->count += k;
        }
    } else if (strcmp(command, SALE) == 0) {
        if (curr == NULL) {
            printf("No stock of %s\n", album);
            return;
        }
        if (curr->count == 0) {
            printf("No stock of %s\n", album);
            return;
        }
        if (curr->count < k) {
            printf("Not enough stock of %s\n", album);
            return;
        }
        // Enough stock
        curr->count -= k;
    }
}

int retrieve(char *album_name) {
    int index = hash(album_name);
    HashNode *curr = table[index];
    while (curr != NULL) {
        if (strcmp(curr->album_name, album_name) == 0) {
            return curr->count;
        }
        curr = curr->next;
    }
    return -1;
}

void free_table() {
    if (table == NULL) {
        return;
    }
    for (int i = 0; i < table_size; i++) {
        HashNode *curr = table[i];
        while (curr != NULL) {
            HashNode *next_node = curr->next;
            free(curr->album_name);
            free(curr);
            curr = next_node;
        }
    }
    free(table);
    table = NULL;
    table_fullness = 0;
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        // No extraneous stdout; print minimal error to stderr and exit
        fprintf(stderr, "Usage: %s <test_case_path>\n", argv[0]);
        return EXIT_FAILURE;
    }

    FILE *fp = fopen(argv[1], "r");
    if (fp == NULL) {
        perror("fopen failed");
        return EXIT_FAILURE;
    }

    // Read initial table size (first line)
    char line[1024];
    if (fgets(line, sizeof(line), fp) == NULL) {
        fclose(fp);
        return EXIT_FAILURE;
    }
    if (sscanf(line, "%d", &table_size) != 1 || table_size <= 0) {
        fclose(fp);
        return EXIT_FAILURE;
    }

    table = (HashNode **)calloc((size_t)table_size, sizeof(HashNode *));
    if (table == NULL) {
        fclose(fp);
        return EXIT_FAILURE;
    }

    // Process operations line by line
    while (fgets(line, sizeof(line), fp) != NULL) {
        // Skip empty lines
        char *p = line;
        while (*p == ' ' || *p == '\t') p++;
        if (*p == '\0' || *p == '\n') continue;

        char command[32];
        int count = 0;
        char album[512];
        album[0] = '\0';

        int matched = sscanf(p, "%31s %d %[\x20-\x7E]", command, &count, album);
        // The last scanset reads printable ASCII including spaces until end-of-line
        if (matched < 2) {
            continue; // malformed line; ignore
        }

        // Trim trailing whitespace from album name if captured
        if (matched == 3) {
            rstrip_whitespace(album);
        } else {
            album[0] = '\0';
        }

        if (strcmp(command, SALE) == 0) {
            update(album, count, SALE);
        } else if (strcmp(command, RESTOCK) == 0) {
            update(album, count, RESTOCK);
        } else if (strcmp(command, SHOW_STOCK) == 0) {
            int stock = retrieve(album);
            if (stock == -1) {
                printf("No stock of %s\n", album);
            } else {
                printf("Current stock of %s: %d\n", album, stock);
            }
        } else {
            // Unknown command: ignore
        }
    }

    pretty_print_table();
    free_table();
    fclose(fp);

    return EXIT_SUCCESS;
}
