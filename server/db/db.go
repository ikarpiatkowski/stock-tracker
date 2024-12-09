package db

import (
	"context"
	"fmt"
	"log"
	"server/models"

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
        date TIMESTAMPTZ NOT NULL,
        price TEXT NOT NULL,
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
        if stock.Time == "" {
            log.Printf("Warning: stock %s has empty time, skipping", stock.Symbol)
            continue // Skip this stock entry
        }
        parsedTime, err := models.ParseTime(stock.Time)
        if err != nil {
            log.Printf("Error parsing time for stock %s: %v", stock.Symbol, err)
            continue // Skip this stock entry
        }
        batch.Queue(
            `INSERT INTO stocks (ticker, date, price, volume, name, currency) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            stock.Symbol,
            parsedTime,
            stock.Price, // Treat price as string
            0,
            "",
            "PLN",
        )
    }

    br := tx.SendBatch(ctx, batch)
    defer br.Close()
    if err := br.Close(); err != nil {
        return fmt.Errorf("failed to execute batch: %v", err)
    }

    return tx.Commit(ctx)
}

// In server/db/db.go

// client/src/db/db.go

func GetAllStocks(ctx context.Context) ([]models.Stock, error) {
    rows, err := Pool.Query(ctx, `
        SELECT 
            id,
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
        if err := rows.Scan(&s.ID, &s.Symbol, &s.Time, &s.Price); err != nil {
            return nil, fmt.Errorf("scan error: %v", err)
        }
        stocks = append(stocks, s)
    }

    return stocks, rows.Err()
}