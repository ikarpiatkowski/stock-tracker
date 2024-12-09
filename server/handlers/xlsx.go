package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"server/db"
	"server/models"

	"github.com/xuri/excelize/v2"
)

func HandleStocksXLSX(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

    if r.Method == "OPTIONS" {
        return
    }

    switch r.Method {
    case "POST":
        // Parse multipart form
        err := r.ParseMultipartForm(10 << 20) // 10 MB max
        if err != nil {
            log.Printf("Error parsing form: %v", err)
            http.Error(w, "Failed to parse form", http.StatusBadRequest)
            return
        }

        // Get file from form
        file, _, err := r.FormFile("file")
        if err != nil {
            log.Printf("Error getting file: %v", err)
            http.Error(w, "Failed to get file", http.StatusBadRequest)
            return
        }
        defer file.Close()

        // Open Excel file
        f, err := excelize.OpenReader(file)
        if err != nil {
            log.Printf("Error opening excel file: %v", err)
            http.Error(w, "Failed to process file", http.StatusInternalServerError)
            return
        }
        defer f.Close()

        // Parse XLSX
        stocks, err := ParseXLSXFile(f)
        if err != nil {
            log.Printf("Error parsing XLSX: %v", err)
            http.Error(w, fmt.Sprintf("Failed to parse XLSX file: %v", err), http.StatusInternalServerError)
            return
        }

        // Save to database
        if len(stocks) > 0 {
            if err := db.SaveStocks(r.Context(), stocks); err != nil {
                log.Printf("Error saving stocks: %v", err)
                http.Error(w, "Failed to save stocks", http.StatusInternalServerError)
                return
            }
        }

        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(map[string]interface{}{
            "message": "File uploaded successfully",
            "stocks": stocks,
        })

    case "GET":
        // Get stocks from database
        stocks, err := db.GetAllStocks(r.Context())
        if err != nil {
            log.Printf("Error retrieving stocks: %v", err)
            http.Error(w, "Failed to retrieve stocks", http.StatusInternalServerError)
            return
        }

        if err := json.NewEncoder(w).Encode(stocks); err != nil {
            log.Printf("Error encoding response: %v", err)
            http.Error(w, "Internal server error", http.StatusInternalServerError)
        }

    default:
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
    }
}

func ParseXLSXFile(f *excelize.File) ([]models.Stock, error) {
    sheetName := f.GetSheetName(3)
    if sheetName == "" {
        return nil, fmt.Errorf("no sheet found at index 3")
    }

    rows, err := f.GetRows(sheetName)
    if err != nil {
        return nil, fmt.Errorf("failed to read rows: %v", err)
    }

    if len(rows) < 12 {
        return nil, fmt.Errorf("file contains no data rows")
    }

    var stocks []models.Stock
    for i, row := range rows[11:] {
        if len(row) < 6 {
            log.Printf("Warning: row %d has insufficient columns, skipping", i+12)
            continue
        }

        symbol := row[5]
        time := row[3]
        priceStr := row[4]

        // Skip records with "WHT" or "SHT" in the price
        if strings.Contains(strings.ToUpper(priceStr), "WHT") || strings.Contains(strings.ToUpper(priceStr), "SHT") {
            log.Printf("Skipping row %d with price containing 'WHT' or 'SHT'", i+12)
            continue
        }


        if symbol == "" || time == "" {
            log.Printf("Warning: row %d has empty symbol or time, skipping", i+12)
            continue
        }

        stocks = append(stocks, models.Stock{
            Symbol: symbol,
            Time:   time,
            Price:  priceStr,
        })
    }

    if len(stocks) == 0 {
        return nil, fmt.Errorf("no valid stock data found in file")
    }

    return stocks, nil
}