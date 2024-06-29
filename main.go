package main

import (
    "database/sql"
    "log"
    "net/http"
    "github.com/gin-gonic/gin"
    _ "github.com/lib/pq"
    "fmt"
    "github.com/gin-contrib/cors"
)

const (
    host     = "209.38.230.157"
    port     = 5432
    user     = "baranovskiy"
    password = "honda"
    dbname   = "agriculture"
)

type WeatherStation struct {
    ID        int     `json:"id"`
    Latitude  float64 `json:"latitude"`
    Longitude float64 `json:"longitude"`
    StationName      string  `json:"name"`
}

type SoilProfile struct {
    SoilID    int     `json:"soil_id"`
    Region    string  `json:"region"`
    Latitude  float64 `json:"latitude"`
    Longitude float64 `json:"longitude"`
}

func getWeatherStations(c *gin.Context) {
    psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname)

    db, err := sql.Open("postgres", psqlInfo)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    rows, err := db.Query("SELECT id, latitude, longitude, station_name FROM WeatherStations")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()

    var weatherStations []WeatherStation
    for rows.Next() {
        var ws WeatherStation
        if err := rows.Scan(&ws.ID, &ws.Latitude, &ws.Longitude, &ws.StationName); err != nil {
            log.Fatal(err)
        }
        weatherStations = append(weatherStations, ws)
    }

    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }

    c.JSON(http.StatusOK, weatherStations)
}

func getSoilProfiles(c *gin.Context) {
    psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname)

    db, err := sql.Open("postgres", psqlInfo)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    rows, err := db.Query("SELECT DISTINCT soil_id, rureg, lat, long FROM soildata")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()

    var soilProfiles []SoilProfile
    for rows.Next() {
        var sp SoilProfile
        if err := rows.Scan(&sp.SoilID, &sp.Region, &sp.Latitude, &sp.Longitude); err != nil {
            log.Fatal(err)
        }
        soilProfiles = append(soilProfiles, sp)
    }

    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }

    c.JSON(http.StatusOK, soilProfiles)
}

func main() {
    router := gin.Default()

    // Настройка CORS
    router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:5173"},
        AllowMethods:     []string{"GET"},
        AllowHeaders:     []string{"Origin", "Content-Type"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))

    router.GET("/api/weatherstations", getWeatherStations)
    router.GET("/api/soilprofiles", getSoilProfiles)
    router.Run(":8080")
}
