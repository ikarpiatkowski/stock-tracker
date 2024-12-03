package models

type StockData struct {
    Date          string  `json:"date"`
    Price         float64 `json:"price"`
    Change        float64 `json:"change"`
    ChangePercent float64 `json:"changePercent"`
    IsIncrease    bool    `json:"isIncrease"`
}

type Stock struct {
    Symbol string `json:"symbol"`
    Time   string `json:"time"`
    Price  string `json:"price"`
}