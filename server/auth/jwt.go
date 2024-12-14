package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"
)

const (
    TokenExpiry    = 24 * time.Hour
    SigningKeySize = 32
)

var (
    ErrInvalidToken = errors.New("invalid token")
    ErrExpiredToken = errors.New("token has expired")
    signingKey      []byte
)

func InitJWT() error {
    key := make([]byte, SigningKeySize)
    if _, err := rand.Read(key); err != nil {
        return fmt.Errorf("failed to generate signing key: %w", err)
    }
    signingKey = key
    return nil
}

type Claims struct {
    UserID    int       `json:"uid"`
    ExpiresAt time.Time `json:"exp"`
}

func GenerateToken(userID int) (string, error) {
    claims := Claims{
        UserID:    userID,
        ExpiresAt: time.Now().Add(TokenExpiry),
    }

    token, err := encodeToken(claims)
    if err != nil {
        return "", fmt.Errorf("failed to generate token: %w", err)
    }

    return token, nil
}

func ValidateToken(token string) (*Claims, error) {
    claims, err := decodeToken(token)
    if err != nil {
        return nil, err
    }

    if time.Now().After(claims.ExpiresAt) {
        return nil, ErrExpiredToken
    }

    return claims, nil
}

func encodeToken(claims Claims) (string, error) {
    timestamp := claims.ExpiresAt.Unix()
    data := fmt.Sprintf("%d:%d", claims.UserID, timestamp)
    return base64.URLEncoding.EncodeToString([]byte(data)), nil
}

func decodeToken(token string) (*Claims, error) {
    data, err := base64.URLEncoding.DecodeString(token)
    if err != nil {
        return nil, ErrInvalidToken
    }

    var userID int64
    var timestamp int64
    
    _, err = fmt.Sscanf(string(data), "%d:%d", &userID, &timestamp)
    if err != nil {
        return nil, ErrInvalidToken
    }

    return &Claims{
        UserID:    int(userID),
        ExpiresAt: time.Unix(timestamp, 0),
    }, nil
}