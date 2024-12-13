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
        ticker VARCHAR(10) NOT NULL UNIQUE,
        date TIMESTAMPTZ NOT NULL,
        price DECIMAL(10,4) NOT NULL,
        shares DECIMAL(10,4) NOT NULL DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'PLN'
    );`

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
        parsedTime, err := models.ParseTime(stock.Time)
        if err != nil {
            log.Printf("Error parsing time for stock %s: %v", stock.Symbol, err)
            continue
        }

        batch.Queue(`
            INSERT INTO stocks (ticker, date, price, shares, currency)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (ticker) DO UPDATE 
            SET 
                price = (stocks.price * stocks.shares + EXCLUDED.price * EXCLUDED.shares) / 
                       NULLIF(stocks.shares + EXCLUDED.shares, 0),
                shares = stocks.shares + EXCLUDED.shares,
                date = GREATEST(stocks.date, EXCLUDED.date)
            WHERE stocks.ticker = EXCLUDED.ticker
        `, stock.Symbol, parsedTime, stock.Price, stock.Shares, "PLN")
    }

    br := tx.SendBatch(ctx, batch)
    defer br.Close()

    if err := br.Close(); err != nil {
        return fmt.Errorf("failed to execute batch: %v", err)
    }

    return tx.Commit(ctx)
}

func GetAllStocks(ctx context.Context) ([]models.Stock, error) {
    rows, err := Pool.Query(ctx, `
        SELECT 
            id,
            ticker,
            TO_CHAR(date, 'YYYY-MM-DD HH24:MI:SS') as formatted_date,
            price,
            shares
        FROM stocks 
        ORDER BY date DESC`)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var stocks []models.Stock
    for rows.Next() {
        var s models.Stock
        if err := rows.Scan(&s.ID, &s.Symbol, &s.Time, &s.Price, &s.Shares); err != nil {
            return nil, fmt.Errorf("scan error: %v", err)
        }
        stocks = append(stocks, s)
    }

    return stocks, rows.Err()
}