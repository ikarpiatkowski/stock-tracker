package models

import "time"

type User struct {
    ID        int       `json:"id"`
    Email     string    `json:"email"`
    Password  []byte    `json:"-"` // Never send to client
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type Credentials struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}