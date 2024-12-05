package db

import (
	"context"
	"fmt"
	"server/models"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
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

func SaveStocks(ctx context.Context, stocks []models.Stock) error {
    tx, err := Pool.Begin(ctx)
    if err != nil {
        return fmt.Errorf("begin transaction: %v", err)
    }
    defer tx.Rollback(ctx)

    batch := &pgx.Batch{}

    for _, stock := range stocks {
        timestamp, err := stock.ParseTime()
        if err != nil {
            return fmt.Errorf("failed to parse time %s: %v", stock.Time, err)
        }

        price, err := extractPrice(stock.Price)
        if err != nil {
            return fmt.Errorf("failed to parse price %s: %v", stock.Price, err)
        }

        batch.Queue(
            `INSERT INTO stocks (ticker, date, price, volume, name, currency) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            stock.Symbol,
            timestamp,
            price,
            0,
            "",
            "PLN",
        )
    }

    // Send batch and get results
    br := tx.SendBatch(ctx, batch)
    defer br.Close()

    // Process all results at once
    if err := br.Close(); err != nil {
        return fmt.Errorf("failed to execute batch: %v", err)
    }

    // Commit transaction after batch is closed
    if err := tx.Commit(ctx); err != nil {
        return fmt.Errorf("failed to commit transaction: %v", err)
    }

    return nil
}

func GetAllStocks(ctx context.Context) ([]models.Stock, error) {
    rows, err := Pool.Query(ctx, `
        SELECT ticker, date, price    -- Changed 'time' to 'date', 'symbol' to 'ticker'
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
            return nil, err
        }
        stocks = append(stocks, s)
    }

    return stocks, rows.Err()
}

// Add this helper function to extract price
func extractPrice(priceStr string) (float64, error) {
    // Split by @ and take the last part
    parts := strings.Split(priceStr, "@")
    if len(parts) > 1 {
        // Take the last part and trim spaces
        priceStr = strings.TrimSpace(parts[len(parts)-1])
    }
    
    // Try to parse the cleaned price string
    return strconv.ParseFloat(priceStr, 64)
}

