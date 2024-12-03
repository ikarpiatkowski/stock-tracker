package utils

import "math"

func RoundToTwo(num float64) float64 {
    return math.Round(num*100) / 100
}