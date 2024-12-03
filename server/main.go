package main

import (
	"fmt"
	"log"
	"net/http"

	"server/handlers"
)

func main() {
    http.HandleFunc("/api/stock", handlers.HandleStockPrice)
    http.HandleFunc("/api/stocks", handlers.HandleStocksXLSX)

    fmt.Println("Server running on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}