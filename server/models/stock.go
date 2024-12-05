package models

import "time"

type StockData struct {
    Date          string  `json:"date"`
    Price         float64 `json:"price"`
    Volume        int     `json:"volume"`
    Change        float64 `json:"change"`
    ChangePercent float64 `json:"changePercent"`
    IsIncrease    bool    `json:"isIncrease"`
}

type Stock struct {
    Symbol string `json:"symbol"`
    Time   string `json:"time"`
    Price  string `json:"price"`
}

func (s *Stock) ParseTime() (time.Time, error) {
    // Try different date formats
    formats := []string{
        "02/01/2006 15:04:05",  // DD/MM/YYYY
        "01/02/2006 15:04:05",  // MM/DD/YYYY
        "2006-01-02 15:04:05",  // YYYY-MM-DD
    }

    var parseError error
    for _, format := range formats {
        if t, err := time.Parse(format, s.Time); err == nil {
            return t, nil
        } else {
            parseError = err
        }
    }
    return time.Time{}, parseError
}