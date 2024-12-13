package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"server/handlers"

	"server/db"

	"github.com/joho/godotenv"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Printf("Warning: .env file not found: %v", err)
    }

    databaseURL := os.Getenv("DATABASE_URL")
    if databaseURL == "" {
        log.Fatal("DATABASE_URL environment variable is not set")
    }

    if err := db.InitDB(databaseURL); err != nil {
        log.Fatalf("Failed to initialize database: %v", err)
    }
    defer db.Pool.Close()

    http.HandleFunc("/api/stock", handlers.HandleStockPrice)
    http.HandleFunc("/api/stocks", handlers.HandleStocksXLSX)
    http.HandleFunc("/api/quote", handlers.HandleCurrentPrice) // Add new endpoint


    fmt.Println("Server running on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}