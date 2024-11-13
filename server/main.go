// main.go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/xuri/excelize/v2"
)

type Stock struct {
    Symbol string `json:"symbol"`
    Time   string `json:"time"`
    Price  string `json:"price"`
}

func parseXLSX(filepath string) ([]Stock, error) {
    f, err := excelize.OpenFile(filepath)
    if err != nil {
        return nil, fmt.Errorf("failed to open file %s: %v", filepath, err)
    }
    defer f.Close()

    // Get the sheet name for the 4th sheet (index 3)
    sheetName := f.GetSheetName(3)
    if sheetName == "" {
        return nil, fmt.Errorf("no sheet found at index 3")
    }

    rows, err := f.GetRows(sheetName)
    if err != nil {
        return nil, fmt.Errorf("failed to read rows: %v", err)
    }

    if len(rows) < 6 {
        return nil, fmt.Errorf("file contains no data rows")
    }

    var stocks []Stock
    for i, row := range rows[1:] { // Skip the first 5 rows
        if len(row) < 6 {
            log.Printf("Warning: row %d has insufficient columns, skipping", i+6)
            continue
        }

        symbol := row[5]
        time := row[3]
        price := row[4]

        // Validate that symbol, time, and price are not empty
        if symbol == "" || time == "" || price == "" {
            log.Printf("Warning: row %d has empty fields, skipping", i+6)
            continue
        }

        stock := Stock{
            Symbol: symbol,
            Time:   time,
            Price:  price,
        }
        stocks = append(stocks, stock)
    }

    if len(stocks) == 0 {
        return nil, fmt.Errorf("no valid stock data found in file")
    }

    return stocks, nil
}

func getStocks(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*")

    stocks, err := parseXLSX("./eu.xlsx")
    if err != nil {
        log.Printf("Error parsing XLSX: %v", err)
        http.Error(w, fmt.Sprintf("Failed to parse XLSX file: %v", err), http.StatusInternalServerError)
        return
    }

    // Skip the first entry
    if len(stocks) > 0 {
        stocks = stocks[5:]
    }

    if err := json.NewEncoder(w).Encode(stocks); err != nil {
        log.Printf("Error encoding response: %v", err)
        http.Error(w, "Internal server error", http.StatusInternalServerError)
    }
}

func main() {
    http.HandleFunc("/api/stocks", getStocks)

    fmt.Println("Server is running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}