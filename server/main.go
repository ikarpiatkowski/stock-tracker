package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"server/auth"
	"server/handlers"
	"server/middleware"

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

    if err := auth.InitJWT(); err != nil {
        log.Fatalf("Failed to initialize JWT: %v", err)
    }

    // Public endpoints
    http.HandleFunc("/api/register", handlers.HandleRegister)
    http.HandleFunc("/api/login", handlers.HandleLogin)

    // Protected endpoints
    http.HandleFunc("/api/stock", middleware.AuthMiddleware(handlers.HandleStockPrice))
    http.HandleFunc("/api/stocks", middleware.AuthMiddleware(handlers.HandleStocksXLSX))
    http.HandleFunc("/api/quote", middleware.AuthMiddleware(handlers.HandleCurrentPrice))


    fmt.Println("Server running on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}