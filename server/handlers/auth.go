package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"server/auth"
	"server/db"
	"server/models"
)

func HandleRegister(w http.ResponseWriter, r *http.Request) {
    var creds models.Credentials
    if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    if creds.Email == "" || creds.Password == "" {
        http.Error(w, "Email and password required", http.StatusBadRequest)
        return
    }

    hashedPassword, err := auth.GenerateHash(creds.Password, auth.DefaultParams)
    if err != nil {
        log.Printf("Error hashing password: %v", err)
        http.Error(w, "Server error", http.StatusInternalServerError)
        return
    }

    user := models.User{
        Email:    creds.Email,
        Password: []byte(hashedPassword),
    }

    if err := db.CreateUser(r.Context(), &user); err != nil {
        log.Printf("Error creating user: %v", err)
        switch err {
        case db.ErrDuplicateEmail:
            http.Error(w, "Email already exists", http.StatusConflict)
        default:
            http.Error(w, "Failed to create user", http.StatusInternalServerError)
        }
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{
        "message": "User created successfully",
    })
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
    var creds models.Credentials
    if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    user, err := db.GetUserByEmail(r.Context(), creds.Email)
    if err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    match, err := auth.ComparePasswordAndHash(creds.Password, string(user.Password))
    if err != nil || !match {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    token, err := auth.GenerateToken(user.ID)
    if err != nil {
        http.Error(w, "Server error", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]string{
        "token": token,
    })
}