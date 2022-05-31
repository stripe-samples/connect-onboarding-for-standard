package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/account"
	"github.com/stripe/stripe-go/v72/accountlink"
)

// Set this to a random string that is kept secure
var store = sessions.NewCookieStore([]byte("secret-session"))

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// For sample support and debugging, not required for production:
	stripe.SetAppInfo(&stripe.AppInfo{
		Name:    "stripe-samples/connect-onboarding-for-standard",
		Version: "0.0.1",
		URL:     "https://github.com/stripe-samples",
	})

	http.Handle("/", http.FileServer(http.Dir(os.Getenv("STATIC_DIR"))))
	http.HandleFunc("/onboard-user", handleOnboardUser)
	http.HandleFunc("/onboard-user/refresh", handleOnboardUserRefresh)

	log.Println("server running at 0.0.0.0:4242")
	http.ListenAndServe("0.0.0.0:4242", nil)
}

func handleOnboardUser(w http.ResponseWriter, r *http.Request) {
	// Create account
	accountParams := &stripe.AccountParams{
		Type: stripe.String(string(stripe.AccountTypeStandard)),
	}
	accountDetails, _ := account.New(accountParams)
	accountID := accountDetails.ID

	// Store the accountID in the session
	session, _ := store.Get(r, "account-link-session")
	session.Values["accountID"] = accountID
	err := session.Save(r, w)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	origin := r.Header.Get("Origin")
	refreshURL := origin + "/onboard-user/refresh"
	returnURL := origin + "/success.html"

	// Create account link
	accountLinkParams := &stripe.AccountLinkParams{
		Account:    stripe.String(string(accountID)),
		RefreshURL: stripe.String(refreshURL),
		ReturnURL:  stripe.String(returnURL),
		Type:       stripe.String("account_onboarding"),
	}
	result, err := accountlink.New(accountLinkParams)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, result.URL, 303)
	return
}

func handleOnboardUserRefresh(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "account-link-session")
	var origin string

	if r.TLS == nil {
		origin = "http://" + r.Host
	} else {
		origin = "https://" + r.Host
	}

	refreshURL := origin + "/onboard-user/refresh"
	returnURL := origin + "/success.html"

	if session.Values["accountID"] != nil {
		accountLinkParams := &stripe.AccountLinkParams{
			Account:    stripe.String(session.Values["accountID"].(string)),
			RefreshURL: stripe.String(refreshURL),
			ReturnURL:  stripe.String(returnURL),
			Type:       stripe.String("account_onboarding"),
		}
		result, err := accountlink.New(accountLinkParams)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		http.Redirect(w, r, result.URL, 303)
		return
	}

	http.Redirect(w, r, "/", 303)
	return
}