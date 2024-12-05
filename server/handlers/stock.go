package handlers

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"server/models"
	"server/utils"
	"strconv"
)

func HandleStockPrice(w http.ResponseWriter, r *http.Request) {
    symbol := r.URL.Query().Get("symbol")
    if symbol == "" {
        http.Error(w, "Symbol is required", http.StatusBadRequest)
        return
    }

    resp, err := http.Get(fmt.Sprintf("https://stooq.pl/q/d/l/?s=%s&i=d", symbol))
    if err != nil {
        log.Printf("Failed to fetch stock data: %v", err)
        http.Error(w, "Failed to fetch stock data", http.StatusInternalServerError)
        return
    }
    defer resp.Body.Close()

    reader := csv.NewReader(resp.Body)
    var data []models.StockData

    _, err = reader.Read() // Skip header
    if err != nil {
        log.Printf("Failed to parse CSV: %v", err)
        http.Error(w, "Failed to parse CSV", http.StatusInternalServerError)
        return
    }

    records := make([][]string, 0)
    for {
        record, err := reader.Read()
        if err == io.EOF {
            break
        }
        if err != nil {
            continue
        }
        records = append(records, record)
    }

    if len(records) > 180 {
        records = records[len(records)-180:]
    }

    for i := len(records) - 1; i >= 0; i-- {
        price, err := strconv.ParseFloat(records[i][4], 64)
        if err != nil {
            continue
        }
        volume, err := strconv.ParseFloat(records[i][5], 64)
    if err != nil {
        // Set default volume or log error
        volume = 0
        log.Printf("Failed to parse volume for date %s: %v", records[i][0], err)
    }

    stockData := models.StockData{
        Date:          records[i][0],
        Price:         utils.RoundToTwo(price),
        Volume:        int(volume),
        Change:        0.0,
        ChangePercent: 0.0,
        IsIncrease:    false,
    }
    
        if i > 0 {
            nextPrice, err := strconv.ParseFloat(records[i-1][4], 64)
            if err == nil {
                // Calculate change from previous day to current day
                change := price - nextPrice
                // Calculate percentage change
                changePercent := (change / nextPrice) * 100
                
                stockData.Change = utils.RoundToTwo(change)
                stockData.ChangePercent = utils.RoundToTwo(changePercent)
                stockData.IsIncrease = change > 0
            }
        }
        data = append(data, stockData)
    }
    

    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    json.NewEncoder(w).Encode(data)
}