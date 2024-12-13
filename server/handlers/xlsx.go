package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"server/db"
	"server/models"
	"server/utils"

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

    stockMap := make(map[string]*models.Stock)
    
    for i, row := range rows[11:] {
        if len(row) < 6 {
            continue
        }

        symbol := row[5]
        time := row[3]
        priceStr := row[4]

        if !strings.Contains(strings.ToUpper(priceStr), "OPEN BUY") {
            continue
        }

        parts := strings.Split(strings.TrimPrefix(priceStr, "OPEN BUY "), " @ ")
        if len(parts) != 2 {
            log.Printf("Warning: invalid price format in row %d", i+12)
            continue
        }

        shares, err := strconv.ParseFloat(strings.TrimSpace(parts[0]), 64)
        if err != nil {
            log.Printf("Warning: invalid shares number in row %d: %v", i+12, err)
            continue
        }

        price, err := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)
        if err != nil {
            log.Printf("Warning: invalid price in row %d: %v", i+12, err)
            continue
        }

        if existing, exists := stockMap[symbol]; exists {
            totalShares := existing.Shares + shares
            existing.Price = ((existing.Price * existing.Shares) + 
                            (price * shares)) / totalShares
            existing.Shares = totalShares
        } else {
            stockMap[symbol] = &models.Stock{
                Symbol: symbol,
                Time:   time,
                Price:  utils.RoundToTwo(price),
                Shares: shares,
            }
        }
    }

    stocks := make([]models.Stock, 0, len(stockMap))
    for _, stock := range stockMap {
        stocks = append(stocks, *stock)
    }
    
    return stocks, nil
}