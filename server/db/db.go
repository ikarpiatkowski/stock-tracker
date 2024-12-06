package db

import (
	"context"
	"fmt"
	"server/models"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func InitDB(databaseURL string) error {
    var err error
    Pool, err = pgxpool.New(context.Background(), databaseURL)
    if err != nil {
        return fmt.Errorf("unable to create connection pool: %v", err)
    }

    if err := createTables(); err != nil {
        return fmt.Errorf("failed to create tables: %v", err)
    }

    return nil
}

func createTables() error {
    query := `
    CREATE TABLE IF NOT EXISTS stocks (
        id SERIAL PRIMARY KEY,
        ticker VARCHAR(10) NOT NULL,
        date TIMESTAMPTZ NOT NULL,      -- Changed from 'time' to 'date'
        price NUMERIC(10, 2) NOT NULL,
        volume BIGINT DEFAULT 0,
        name TEXT DEFAULT '',
        currency VARCHAR(3) DEFAULT 'PLN'
    )`

    _, err := Pool.Exec(context.Background(), query)
    return err
}

// server/db/db.go - update batch processing

func SaveStocks(ctx context.Context, stocks []models.Stock) error {
    tx, err := Pool.Begin(ctx)
    if err != nil {
        return fmt.Errorf("begin transaction: %v", err)
    }
    defer tx.Rollback(ctx)

    for _, stock := range stocks {
        timestamp, err := stock.ParseTime()
        if err != nil {
            return fmt.Errorf("failed to parse time %s: %v", stock.Time, err)
        }

        price, err := extractPrice(stock.Price)
        if err != nil {
            return fmt.Errorf("failed to parse price %s: %v", stock.Price, err)
        }

        _, err = tx.Exec(ctx,
            `INSERT INTO stocks (ticker, date, price, volume, name, currency) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            stock.Symbol,
            timestamp,
            price,
            0,
            "",
            "PLN",
        )
        if err != nil {
            return fmt.Errorf("failed to insert stock: %v", err)
        }
    }

    if err := tx.Commit(ctx); err != nil {
        return fmt.Errorf("failed to commit transaction: %v", err)
    }

    return nil
}

// In server/db/db.go

func GetAllStocks(ctx context.Context) ([]models.Stock, error) {
    rows, err := Pool.Query(ctx, `
        SELECT 
            ticker,
            TO_CHAR(date, 'YYYY-MM-DD HH24:MI:SS') as formatted_date,
            price    
        FROM stocks 
        ORDER BY date DESC`)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var stocks []models.Stock
    for rows.Next() {
        var s models.Stock
        if err := rows.Scan(&s.Symbol, &s.Time, &s.Price); err != nil {
            return nil, fmt.Errorf("scan error: %v", err)
        }
        stocks = append(stocks, s)
    }

    return stocks, rows.Err()
}

// In server/db/db.go
func extractPrice(priceStr string) (float64, error) {
    // Split into fields and look for numeric value
    fields := strings.Fields(priceStr)
    
    for _, field := range fields {
        // Clean up the field
        field = strings.TrimSuffix(field, "/")
        field = strings.TrimSuffix(field, "SHR")
        field = strings.TrimPrefix(field, "PLN")
        field = strings.Trim(field, " ")
        
        // Try to parse any number we find
        if price, err := strconv.ParseFloat(field, 64); err == nil {
            return price, nil
        }
    }

    // If no number found in original string, try last resort cleanup
    cleaned := strings.Map(func(r rune) rune {
        switch {
        case r >= '0' && r <= '9':
            return r
        case r == '.':
            return r
        default:
            return -1
        }
    }, priceStr)
    
    if cleaned != "" {
        return strconv.ParseFloat(cleaned, 64)
    }

    return 0, fmt.Errorf("no valid price found in string: %s", priceStr)
}
