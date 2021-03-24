package main

import (
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"flag"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Page struct {
	gorm.Model

	Shasum  string `gorm:"index"`
	Content string
}

func (p *Page) String() string {
	return p.Content
}

// Flags
var (
	Address    *string = flag.String("address", "127.0.0.1:3000", "Address to listen on.")
	SqliteFile *string = flag.String("database", "db/database.db", "Database file to use.")
)

// The database
var DB *gorm.DB

type SPAHandler struct {
	staticPath string
	indexPath  string
}

func (h SPAHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	path = filepath.Join(h.staticPath, path)

	// Check if the requested file exists.
	_, err = os.Stat(path)
	if os.IsNotExist(err) {

		// File does not exist, so serve the index path.
		w.Header().Set("Access-Control-Allow-Headers", "user-agent")
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	} else if err != nil {

		// File has an error.
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Serve up files in the directory.
	w.Header().Set("Access-Control-Allow-Headers", "user-agent")
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}

type saveConfigRequest struct {
	Content string
}

// API handlers

// Create a new page.
//
// Route: POST /api/v1/page
func CreateHandler(w http.ResponseWriter, r *http.Request) {

	var req saveConfigRequest

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Create a sum of the json string as an index
	hash := sha512.Sum512([]byte(req.Content))

	page := &Page{
		Content: req.Content,
		Shasum:  hex.EncodeToString(hash[:]),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(page)
	DB.Create(&page)
}

func PageHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	var page Page
	DB.Where("shasum", vars["sha"]).First(&page)

	w.Header().Set("Content-Type", "application/json")

	w.Write([]byte(page.Content))
}

func RSSHandler(w http.ResponseWriter, r *http.Request) {
	resp, err := http.Get(r.URL.Query().Get("url"))

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	mime := resp.Header.Get("Content-Type")
	if strings.HasPrefix(mime, "text/xml") || strings.HasPrefix(mime, "application/rss+xml") {
		w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
		io.Copy(w, resp.Body)
		return
	}
	log.Printf("Refused to respond to query with mime type: %v\n", resp.Header.Get("Content-Type"))
	w.WriteHeader(http.StatusBadRequest)
}

func main() {
	flag.Parse()

	var err error
	// Open a new database.
	DB, err = gorm.Open(sqlite.Open(*SqliteFile), &gorm.Config{})

	DB.AutoMigrate(&Page{})

	if err != nil {
		log.Fatalf("Cannot open database: %v\n", err)
	}

	r := mux.NewRouter()

	// Create a new page
	r.HandleFunc("/api/v1/page", CreateHandler).
		Methods("POST")
	r.HandleFunc("/api/v1/page/{sha:[a-zA-Z0-9]+}.json", PageHandler)
	r.HandleFunc("/api/v1/rss", RSSHandler)

	// Healthcheck
	r.HandleFunc("/api/v1/healthcheck", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]bool{"ok": true})
	})

	// Serve the SPA.
	r.PathPrefix("/").Handler(SPAHandler{"build", "index.html"})

	srv := &http.Server{
		Handler:      r,
		Addr:         *Address,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Println("Listening")
	log.Fatal(srv.ListenAndServe())
}
