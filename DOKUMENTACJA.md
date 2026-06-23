# Dokumentacja Projektu — Osobisty Asystent Finansowy

**Przedmiot:** Architektura i komunikacja Mobilnych Systemów i Baz Danych  
**Zespół:** Mateusz Kwiatkowski (52730), Dawid Ladra (54159)

---

## 1. Ogólne założenia projektu

### 1.1 Opis systemu

Osobisty Asystent Finansowy to aplikacja webowa typu Full-Stack umożliwiająca użytkownikom monitorowanie budżetu osobistego — śledzenie przychodów i wydatków, kategoryzowanie transakcji oraz przeglądanie salda konta w czasie rzeczywistym.

Aplikacja działa jako Progressive Web App (PWA), co oznacza, że użytkownik może z niej korzystać również w trybie offline. Transakcje dodane bez połączenia z Internetem są kolejkowane lokalnie i automatycznie synchronizowane z serwerem po przywróceniu łączności.

System korzysta z publicznego API Narodowego Banku Polskiego (NBP) do pobierania aktualnych kursów walut i automatycznego przeliczania kwot w USD i EUR na PLN.

### 1.2 Główne funkcjonalności

- Rejestracja i logowanie użytkowników z uwierzytelnianiem JWT
- Dodawanie, edycja, usuwanie i przeglądanie transakcji (CRUD)
- Kategoryzowanie transakcji (Jedzenie, Praca, Rozrywka, Inne)
- Obsługa wielu walut (PLN, USD, EUR) z automatycznym przeliczaniem na PLN
- Wyszukiwanie i filtrowanie transakcji po nazwie i kategorii
- Podsumowanie finansowe: przychody, wydatki, stan konta
- Tryb offline z automatyczną synchronizacją
- Tryb ciemny / jasny z zapamiętywaniem preferencji
- Responsywny interfejs (desktop, tablet, mobile)

---

## 2. Zastosowane technologie

| Warstwa | Technologia | Wersja |
|---------|-------------|--------|
| Frontend | React | 19.x |
| State management | Redux Toolkit | 2.x |
| Build tool | Vite | 8.x |
| PWA | vite-plugin-pwa (Workbox) | 1.x |
| Backend | Django | 4.2 |
| REST API | Django REST Framework | — |
| Autentykacja | djangorestframework-simplejwt (JWT) | — |
| Baza danych (serwer) | PostgreSQL | 15 |
| Lokalna baza danych (frontend) | IndexedDB (`FinansowyAsystentDB`) | — |
| Konteneryzacja | Docker + Docker Compose | — |
| Język backendu | Python | 3.11 |
| Publiczne API | API NBP (kursy walut) | — |

---

## 3. Podział zadań w zespole

| Obszar | Odpowiedzialny | Zakres |
|--------|---------------|--------|
| Backend — serwer, API, modele | Mateusz Kwiatkowski (52730) | Konfiguracja Django, modele danych, endpointy REST, serializery, uwierzytelnianie JWT, obsługa błędów, Docker |
| Frontend — UI, logika klienta | Dawid Ladra (54159) | Komponenty React, Redux store, integracja z API, tryb offline/sync, PWA, integracja NBP, UI/UX, responsywność |
| Wspólne | Obaj | Dokumentacja, testowanie, Git, prezentacja |

System kontroli wersji: **Git** (repozytorium GitHub).

---

## 4. Architektura systemu

```
┌─────────────────────────────────────────────────────────┐
│                      Użytkownik                         │
│                    (Przeglądarka)                        │
└──────────────┬──────────────────────────┬───────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐    ┌──────────────────────────┐
│   Frontend (React)   │    │   API NBP (kursy walut)  │
│   - Redux Store      │    │   api.nbp.pl             │
│   - Service Worker   │    └──────────────────────────┘
│   - localStorage     │
└──────────┬───────────┘
           │ HTTP (REST)
           ▼
┌──────────────────────┐
│  Backend (Django)    │
│  - REST API (DRF)   │
│  - JWT Auth          │
│  - Walidacja         │
└──────────┬───────────┘
           │ SQL
           ▼
┌──────────────────────┐
│  PostgreSQL 15       │
│  - User (wbudowany)  │
│  - Transaction       │
└──────────────────────┘
```

---

## 5. Schemat bazy danych

### 5.1 Tabela `auth_user` (wbudowana Django)

| Kolumna | Typ | Opis |
|---------|-----|------|
| `id` | INTEGER (PK) | Identyfikator użytkownika |
| `username` | VARCHAR(150) | Unikalna nazwa użytkownika |
| `email` | VARCHAR(254) | Adres e-mail |
| `password` | VARCHAR(128) | Hasło (hash — PBKDF2+SHA256) |
| `is_active` | BOOLEAN | Czy konto jest aktywne |
| `date_joined` | TIMESTAMP | Data rejestracji |

### 5.2 Tabela `api_transaction`

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|-------------|------|
| `id` | BIGINT (PK) | AUTO INCREMENT | Identyfikator transakcji |
| `user_id` | INTEGER (FK) | REFERENCES auth_user(id), ON DELETE CASCADE, NULL | Właściciel transakcji |
| `title` | VARCHAR(255) | NOT NULL, min. 2 znaki | Nazwa transakcji |
| `amount` | DECIMAL(10,2) | NOT NULL, > 0 | Kwota |
| `type` | VARCHAR(10) | NOT NULL, IN ('income', 'expense') | Typ: przychód lub wydatek |
| `category` | VARCHAR(100) | NOT NULL, IN ('Jedzenie', 'Praca', 'Rozrywka', 'Inne') | Kategoria |
| `currency` | VARCHAR(3) | DEFAULT 'PLN', IN ('PLN', 'USD', 'EUR') | Waluta |
| `date` | DATE | NOT NULL | Data transakcji |
| `created_at` | TIMESTAMP | AUTO (auto_now_add) | Data utworzenia rekordu |

### 5.3 Diagram relacji (ERD)

```
┌──────────────────┐         ┌──────────────────────────┐
│    auth_user     │         │    api_transaction       │
├──────────────────┤         ├──────────────────────────┤
│ PK  id           │◄───┐    │ PK  id                   │
│     username     │    │    │ FK  user_id ──────────────┘
│     email        │    │    │     title                │
│     password     │    │    │     amount               │
│     is_active    │    │    │     type                  │
│     date_joined  │    │    │     category              │
└──────────────────┘    │    │     currency              │
                        │    │     date                  │
                        │    │     created_at            │
                        │    └──────────────────────────┘
                        │
                   1 : N (jeden użytkownik — wiele transakcji)
```

---

## 6. Dokumentacja API

**Bazowy URL:** `http://localhost:8000/api/`

Wszystkie endpointy (poza rejestracją i tokenami) wymagają nagłówka autoryzacji:
```
Authorization: Bearer <access_token>
```

### 6.1 Rejestracja użytkownika

```
POST /api/register/
```

**Uprawnienia:** Publiczny (bez autoryzacji)

**Ciało zapytania (JSON):**
```json
{
  "username": "jan_kowalski",
  "email": "jan@example.pl",
  "password": "MojeSilneHaslo123"
}
```

**Odpowiedź sukces (201 Created):**
```json
{
  "success": true,
  "message": "Konto zostało utworzone pomyślnie.",
  "user": {
    "username": "jan_kowalski",
    "email": "jan@example.pl"
  }
}
```

**Odpowiedź błąd — nazwa zajęta (400 Bad Request):**
```json
{
  "success": false,
  "status_code": 400,
  "error": "Błąd walidacji danych.",
  "details": {
    "username": ["Ta nazwa użytkownika jest już zajęta."]
  }
}
```

**Odpowiedź błąd — za krótkie hasło (400 Bad Request):**
```json
{
  "success": false,
  "status_code": 400,
  "error": "Błąd walidacji danych.",
  "details": {
    "password": ["This password is too short. It must contain at least 8 characters."]
  }
}
```

**Walidacja pól:**
- `username` — min. 3 znaki, unikalne
- `email` — wymagany, poprawny format, unikalny
- `password` — min. 8 znaków, walidatory Django (złożoność, popularność)

---

### 6.2 Logowanie (pobranie tokenu JWT)

```
POST /api/token/
```

**Uprawnienia:** Publiczny

**Ciało zapytania:**
```json
{
  "username": "jan_kowalski",
  "password": "MojeSilneHaslo123"
}
```

**Odpowiedź sukces (200 OK):**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Odpowiedź błąd (401 Unauthorized):**
```json
{
  "success": false,
  "status_code": 401,
  "error": "No active account found with the given credentials"
}
```

**Czas życia tokenów:**
- Access token: 1 dzień
- Refresh token: 7 dni

---

### 6.3 Odświeżanie tokenu

```
POST /api/token/refresh/
```

**Uprawnienia:** Publiczny

**Ciało zapytania:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Odpowiedź sukces (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 6.4 Transakcje — Lista (GET)

```
GET /api/transactions/
```

**Uprawnienia:** Wymagany JWT (IsAuthenticated)

**Nagłówki:**
```
Authorization: Bearer <access_token>
```

**Odpowiedź sukces (200 OK):**
```json
[
  {
    "id": 1,
    "user": 1,
    "title": "Wynagrodzenie",
    "amount": "5000.00",
    "type": "income",
    "category": "Praca",
    "currency": "PLN",
    "date": "2026-06-01",
    "created_at": "2026-06-01T10:30:00Z"
  },
  {
    "id": 2,
    "user": 1,
    "title": "Zakupy spożywcze",
    "amount": "150.50",
    "type": "expense",
    "category": "Jedzenie",
    "currency": "PLN",
    "date": "2026-06-02",
    "created_at": "2026-06-02T14:20:00Z"
  }
]
```

**Odpowiedź bez autoryzacji (401 Unauthorized):**
```json
{
  "success": false,
  "status_code": 401,
  "error": "Authentication credentials were not provided."
}
```

Wyniki są posortowane malejąco po dacie transakcji (`-date`, `-created_at`) i filtrowane — użytkownik widzi tylko swoje transakcje.

---

### 6.5 Transakcje — Tworzenie (POST)

```
POST /api/transactions/
```

**Uprawnienia:** Wymagany JWT

**Ciało zapytania:**
```json
{
  "title": "Obiad w restauracji",
  "amount": 45.00,
  "type": "expense",
  "category": "Jedzenie",
  "currency": "PLN",
  "date": "2026-06-15"
}
```

**Odpowiedź sukces (201 Created):**
```json
{
  "id": 3,
  "user": 1,
  "title": "Obiad w restauracji",
  "amount": "45.00",
  "type": "expense",
  "category": "Jedzenie",
  "currency": "PLN",
  "date": "2026-06-15",
  "created_at": "2026-06-15T12:00:00Z"
}
```

**Odpowiedź błąd walidacji (400 Bad Request):**
```json
{
  "success": false,
  "status_code": 400,
  "error": "Błąd walidacji danych.",
  "details": {
    "amount": ["Kwota musi być większa od zera."],
    "currency": ["Nieobsługiwana waluta. Dozwolone: PLN, USD, EUR."]
  }
}
```

**Walidacja pól:**
| Pole | Reguły |
|------|--------|
| `title` | Wymagane, min. 2 znaki |
| `amount` | Wymagane, > 0, maks. 99 999 999,99 |
| `type` | Wymagane, wartości: `income`, `expense` |
| `category` | Wymagane, wartości: `Jedzenie`, `Praca`, `Rozrywka`, `Inne` |
| `currency` | Opcjonalne (domyślnie PLN), wartości: `PLN`, `USD`, `EUR` |
| `date` | Wymagane, format: `YYYY-MM-DD` |

Pole `user` jest ustawiane automatycznie na podstawie tokenu JWT.

---

### 6.6 Transakcje — Szczegóły (GET)

```
GET /api/transactions/{id}/
```

**Uprawnienia:** Wymagany JWT (tylko własne transakcje)

**Odpowiedź sukces (200 OK):**
```json
{
  "id": 3,
  "user": 1,
  "title": "Obiad w restauracji",
  "amount": "45.00",
  "type": "expense",
  "category": "Jedzenie",
  "currency": "PLN",
  "date": "2026-06-15",
  "created_at": "2026-06-15T12:00:00Z"
}
```

**Odpowiedź błąd (404 Not Found):**
```json
{
  "success": false,
  "status_code": 404,
  "error": "Not found."
}
```

---

### 6.7 Transakcje — Aktualizacja (PUT / PATCH)

```
PUT  /api/transactions/{id}/    (pełna aktualizacja — wszystkie pola wymagane)
PATCH /api/transactions/{id}/   (częściowa aktualizacja — tylko zmieniane pola)
```

**Uprawnienia:** Wymagany JWT

**Przykład PATCH — zmiana kwoty:**
```json
{
  "amount": 55.00
}
```

**Odpowiedź sukces (200 OK):**
```json
{
  "id": 3,
  "user": 1,
  "title": "Obiad w restauracji",
  "amount": "55.00",
  "type": "expense",
  "category": "Jedzenie",
  "currency": "PLN",
  "date": "2026-06-15",
  "created_at": "2026-06-15T12:00:00Z"
}
```

---

### 6.8 Transakcje — Usuwanie (DELETE)

```
DELETE /api/transactions/{id}/
```

**Uprawnienia:** Wymagany JWT

**Odpowiedź sukces (200 OK):**
```json
{
  "success": true,
  "message": "Transakcja została usunięta."
}
```

**Odpowiedź błąd (404 Not Found):**
```json
{
  "success": false,
  "error": "Transakcja nie została znaleziona."
}
```

---

### 6.9 Podsumowanie endpointów

| Metoda | Endpoint | Opis | Autoryzacja |
|--------|----------|------|-------------|
| POST | `/api/register/` | Rejestracja nowego użytkownika | Brak |
| POST | `/api/token/` | Logowanie — pobranie tokenów JWT | Brak |
| POST | `/api/token/refresh/` | Odświeżanie access tokenu | Brak |
| GET | `/api/transactions/` | Lista transakcji użytkownika | JWT |
| POST | `/api/transactions/` | Dodanie nowej transakcji | JWT |
| GET | `/api/transactions/{id}/` | Szczegóły transakcji | JWT |
| PUT | `/api/transactions/{id}/` | Pełna aktualizacja transakcji | JWT |
| PATCH | `/api/transactions/{id}/` | Częściowa aktualizacja transakcji | JWT |
| DELETE | `/api/transactions/{id}/` | Usunięcie transakcji | JWT |

---

## 7. Obsługa błędów

### 7.1 Globalny format odpowiedzi błędu

Wszystkie błędy API są zwracane w ujednoliconym formacie JSON:

```json
{
  "success": false,
  "status_code": 400,
  "error": "Opis błędu.",
  "details": { }
}
```

### 7.2 Kody błędów HTTP

| Kod | Znaczenie | Kiedy występuje |
|-----|-----------|-----------------|
| 400 | Bad Request | Błąd walidacji danych wejściowych |
| 401 | Unauthorized | Brak lub nieważny token JWT |
| 403 | Forbidden | Brak uprawnień do zasobu |
| 404 | Not Found | Transakcja nie istnieje lub nie należy do użytkownika |
| 500 | Internal Server Error | Nieoczekiwany błąd serwera |

### 7.3 Logowanie błędów

Serwer zapisuje logi błędów do pliku `api_errors.log` oraz wyświetla je w konsoli. Każdy wpis zawiera: datę, poziom, ścieżkę żądania, metodę HTTP, użytkownika i stack trace.

### 7.4 Obsługa błędów po stronie frontendu

- Błędy logowania/rejestracji wyświetlane jako komunikaty w formularzu
- Błędy sieciowe obsługiwane przez try/catch z fallback na tryb offline
- Stan offline wykrywany automatycznie (`navigator.onLine` + event listeners)
- Transakcje offline kolejkowane i synchronizowane po powrocie do sieci

---

## 8. Integracja z publicznym API

### API Narodowego Banku Polskiego (NBP)

**Endpoint:** `http://api.nbp.pl/api/exchangerates/tables/A/?format=json`  
**Metoda:** GET  
**Opis:** Pobieranie aktualnych średnich kursów walut (tabela A)

**Wykorzystanie w aplikacji:**
- Automatyczne pobieranie kursu USD i EUR przy załadowaniu dashboardu
- Przeliczanie kwot transakcji w obcych walutach na PLN
- Wyświetlanie przeliczonej wartości pod oryginalną kwotą
- Fallback na domyślne kursy (USD: 4.0, EUR: 4.3) w przypadku błędu API

---

## 9. Tryb offline i synchronizacja

### 9.1 Lokalna baza danych — IndexedDB

Aplikacja korzysta z **IndexedDB** (`FinansowyAsystentDB`) jako lokalnej bazy danych w przeglądarce. Baza zawiera dwa object store'y:

| Object Store | Key Path | Opis |
|-------------|----------|------|
| `transactions` | `id` | Cache transakcji pobranych z serwera — wyświetlane w trybie offline |
| `offlineQueue` | `id` | Kolejka transakcji dodanych offline, oczekujących na synchronizację |

**Moduł dostępowy:** `frontend/src/db.js` — wrapper na IndexedDB API z funkcjami:
- `getAllFromStore(storeName)` — pobranie wszystkich rekordów
- `putAllToStore(storeName, items)` — nadpisanie całego store'a
- `addToStore(storeName, item)` — dodanie/aktualizacja rekordu
- `deleteFromStore(storeName, id)` — usunięcie rekordu
- `clearStore(storeName)` — wyczyszczenie store'a

### 9.2 Mechanizm offline

1. **Service Worker (PWA):** Cache'uje zasoby aplikacji (HTML, JS, CSS) — aplikacja ładuje się nawet bez internetu
2. **IndexedDB — store `transactions`:** Kopia ostatnio pobranych transakcji z serwera — wyświetlana w trybie offline
3. **IndexedDB — store `offlineQueue`:** Kolejka transakcji dodanych offline, oczekujących na synchronizację

### 9.3 Proces synchronizacji

1. Przy starcie aplikacji dane ładowane są z IndexedDB (`initFromDB`)
2. Użytkownik dodaje transakcję w trybie offline
3. Transakcja otrzymuje tymczasowe ID (`temp-{timestamp}`) i trafia do `offlineQueue` w Redux + IndexedDB
4. Na liście pojawia się badge „oczekuje na sync"
5. Po wykryciu powrotu do sieci (event `online`) Redux dispatch `syncOfflineTransactions()`
6. Każda transakcja z kolejki jest wysyłana POST do `/api/transactions/`
7. Po sukcesie store `offlineQueue` w IndexedDB jest czyszczony, a transakcje pobierane na nowo z serwera i zapisywane do store'a `transactions`

---

## 10. Uruchomienie projektu

### Wymagania wstępne
- Docker Desktop
- Node.js (wersja LTS)

### Backend
```bash
cd backend
docker-compose up --build
docker-compose run --rm web python manage.py migrate
```
Serwer dostępny pod `http://localhost:8000/`.

### Frontend
```bash
cd frontend
npm install
npm run build
npm run preview
```
Aplikacja dostępna pod `http://localhost:4173/`.

Dla trybu deweloperskiego (bez PWA):
```bash
npm run dev
```
Aplikacja dostępna pod `http://localhost:5173/`.
