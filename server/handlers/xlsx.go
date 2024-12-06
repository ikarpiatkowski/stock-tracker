package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"server/db"
	"server/models"

	"github.com/xuri/excelize/v2"
)

func HandleStocksXLSX(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    switch r.Method {
    case "POST":
        // Parse the xlsx file
        stocks, err := ParseXLSX("./plike.xlsx") 
        if err != nil {
            log.Printf("Error parsing XLSX: %v", err)
            http.Error(w, "Failed to parse XLSX file", http.StatusInternalServerError)
            return
        }

        // Save to database
        if err := db.SaveStocks(r.Context(), stocks); err != nil {
            log.Printf("Error saving stocks: %v", err)
            http.Error(w, "Failed to save stocks", http.StatusInternalServerError)
            return
        }

        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(map[string]string{
            "message": "Stocks saved successfully",
        })

    case "GET":
        // Retrieve stocks from database
        stocks, err := db.GetAllStocks(r.Context())
        if err != nil {
            log.Printf("Error retrieving stocks: %v", err)
            http.Error(w, "Failed to retrieve stocks", http.StatusInternalServerError)
            return
        }

        json.NewEncoder(w).Encode(stocks)

    default:
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
    }
}

func ParseXLSX(filepath string) ([]models.Stock, error) {
    f, err := excelize.OpenFile(filepath)
    if err != nil {
        return nil, fmt.Errorf("failed to open file %s: %v", filepath, err)
    }
    defer f.Close()

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

    var stocks []models.Stock
    for i, row := range rows[1:] {
        if len(row) < 6 {
            log.Printf("Warning: row %d has insufficient columns, skipping", i+6)
            continue
        }

        symbol := row[5]
        time := row[3]
        price := row[4]

        if symbol == "" || time == "" || price == "" {
            log.Printf("Warning: row %d has empty fields, skipping", i+6)
            continue
        }

        stocks = append(stocks, models.Stock{
            Symbol: symbol,
            Time:   time,
            Price:  price,
        })
    }

    if len(stocks) == 0 {
        return nil, fmt.Errorf("no valid stock data found in file")
    }

    return stocks, nil
}