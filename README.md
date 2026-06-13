# AiKMSiBD_52730_54159

# Osobisty Asystent Finansowy

Projekt laboratoryjny realizowany w ramach przedmiotu **AiKMSiBD** przez zespół w składzie:
* Mateusz Kwiatkowski: 52730
* Dawid Ladra: 54159

## Opis projektu
Osobisty Asystent Finansowy to aplikacja typu Full-Stack umożliwiająca monitorowanie budżetu osobistego. Aplikacja wspiera pracę w trybie offline (PWA), automatycznie synchronizując dane z serwerem po przywróceniu połączenia. Wykorzystuje zewnętrzne API Narodowego Banku Polskiego (NBP) do przeliczania kursów walut w czasie rzeczywistym.

## Technologie
* **Frontend:** React, Redux Toolkit, Vite, PWA (Service Worker)
* **Backend:** Django REST Framework, JWT (autentykacja)
* **Baza danych:** PostgreSQL
* **Infrastruktura:** Docker & Docker Compose

## Funkcjonalności
* **Autoryzacja JWT:** Bezpieczne logowanie i izolacja danych między użytkownikami.
* **CRUD Transakcji:** Dodawanie, edycja i usuwanie wpisów (przychody/wydatki).
* **Integracja NBP:** Automatyczne przeliczanie kwot (USD/EUR) na PLN według kursów średnich.
* **Tryb Offline:** Możliwość dodawania transakcji bez dostępu do Internetu oraz ich synchronizacja po powrocie do sieci.

## Uruchomienie projektu

### Wymagania wstępne
* Zainstalowany [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Zainstalowany [Node.js](https://nodejs.org/) (wersja LTS)

### Krok 1: Uruchomienie serwera Backend (Django + PostgreSQL)
1. Otwórz terminal i przejdź do katalogu backendu:
   ```bash
   cd backend
   ```
2. Zbuduj i uruchom kontenery w tle:
   ```bash
   docker-compose up --build
   ```
3. Wykonaj migracje bazy danych (aby utworzyć tabele dla transakcji i użytkowników):
   ```bash
   docker-compose run --rm web python manage.py migrate
   ```

### Krok 2: Uruchomienie aplikacji Frontend (React + PWA)
1. Otwórz nowy terminal i przejdź do katalogu frontendu:
   ```bash
   cd frontend
   ```
2. Zainstaluj niezbędne pakiety `npm`:
   ```bash
   npm install
   ```
3. Zbuduj aplikację do wersji produkcyjnej (wymagane, aby Service Worker zadziałał w pełni):
   ```bash
   npm run build
   ```
4. Uruchom serwer podglądu wersji zoptymalizowanej:
   ```bash
   npm run preview
   ```
5. Otwórz przeglądarkę pod adresem podanym w terminalu (domyślnie `http://localhost:4173/`).


## 🧪 Scenariusz testowy: Tryb Offline i Synchronizacja
Aby przetestować odporność aplikacji na brak Internetu:
1. Zaloguj się do aplikacji i upewnij się, że pobrała się historia Twoich transakcji.
2. Otwórz narzędzia deweloperskie przeglądarki (F12) -> zakładka **Network** (Sieć) -> zmień "No throttling" na **Offline**.
3. Odśwież stronę (F5). Aplikacja załaduje się normalnie dzięki PWA, a wpisy zostaną wczytane z kopii zapasowej.
4. Dodaj nowy wydatek. Pojawi się na liście ze statusem: `⏳ (oczekuje na synchr.)`.
5. Zmień status w narzędziach deweloperskich z powrotem na **Online** (lub "No throttling").
6. Obserwuj listę: znacznik `⏳` zniknie w ułamku sekundy, co oznacza, że aplikacja automatycznie wypchnęła zakolejkowane dane do bazy PostgreSQL i pobrała je z powrotem z przypisanym stałym ID z serwera.