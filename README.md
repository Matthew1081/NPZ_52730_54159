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

### Krok 1: Backend (Docker)
1. Przejdź do folderu `backend`: