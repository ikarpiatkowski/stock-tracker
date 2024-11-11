package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
)

type Book struct {
    ID     string  `json:"id"`
    Title  string  `json:"title"`
    Author string  `json:"author"`
    Price  float64 `json:"price"`
}

var books = []Book{
    {ID: "1", Title: "The Go Programming Language", Author: "Alan A. A. Donovan", Price: 29.99},
    {ID: "2", Title: "Clean Code", Author: "Robert C. Martin", Price: 39.99},
}

func getBooks(w http.ResponseWriter) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(books)
}

func getBook(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    // Extract ID from path
    path := strings.TrimSpace(r.URL.Path)
    pathParts := strings.Split(path, "/")
    if len(pathParts) != 3 {
        http.Error(w, "Invalid path", http.StatusBadRequest)
        return
    }

    id := pathParts[2]
    for _, book := range books {
        if book.ID == id {
            json.NewEncoder(w).Encode(book)
            return
        }
    }
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(map[string]string{"error": "Book not found"})
}

func handleRequests(w http.ResponseWriter, r *http.Request) {
    switch {
    case r.Method == "GET" && r.URL.Path == "/books":
        getBooks(w)
    case r.Method == "GET" && strings.HasPrefix(r.URL.Path, "/book/"):
        getBook(w, r)
    default:
        http.Error(w, "404 not found", http.StatusNotFound)
    }
}

func main() {
    http.HandleFunc("/", handleRequests)

    fmt.Println("Server is running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}