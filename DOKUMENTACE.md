# Dokumentace projektu
## Webová aplikace – Anketa (Node.js + Express)

---

## 1. Úvod

Tato aplikace je jednoduchá webová anketa umožňující uživatelům hlasovat o jedné otázce s více možnostmi odpovědí.

Aplikace splňuje požadavky zadání:
- obsahuje jednu otázku
- minimálně tři možnosti odpovědi
- výsledky lze zobrazit bez hlasování
- hlasování nelze provést vícekrát
- reset hlasování je chráněn serverovým tokenem
- data jsou sdílena mezi všemi uživateli

---

## 2. Použité technologie

- Node.js
- Express.js
- Ukládání dat do souboru JSON
- Hosting: Render.com

---

## 3. Architektura aplikace

Aplikace funguje jako serverová webová aplikace.

Uživatel (webový prohlížeč) odesílá HTTP požadavky na server.
Server zpracovává logiku hlasování a ukládá data do sdíleného JSON souboru.

Tok komunikace:

Uživatel → HTTP požadavek → Node.js server → práce se souborem data.json → odpověď uživateli

---

## 4. Struktura projektu


anketa/
│

├── server.js

├── package.json

├── data/
│ └── data.json

└── DOKUMENTACE.md


### server.js
Obsahuje:
- definici Express serveru
- routování
- logiku hlasování
- ochranu proti vícenásobnému hlasování
- reset hlasování

### package.json
Obsahuje:
- seznam závislostí
- startovací příkaz aplikace

### data/data.json
Obsahuje:
- otázku
- možnosti odpovědí
- počty hlasů
- seznam hlasujících uživatelů

---

## 5. Popis endpointů

### GET /
Zobrazí otázku a možnosti odpovědí.
Pokud uživatel již hlasoval, hlasovací formulář je deaktivován.

---

### POST /vote
Zpracuje hlas uživatele.

Postup:
1. Server zkontroluje cookie `voter_id`
2. Ověří, zda již tento uživatel nehlasoval
3. Pokud nehlasoval:
   - uloží hlas
   - přidá uživatele do seznamu hlasujících
4. Přesměruje na `/results`
5. Pokud už hlasoval → hlas je zamítnut

---

### GET /results
Zobrazí aktuální výsledky hlasování.
Je dostupný i bez předchozího hlasování.

---

### GET /reset
Zobrazí formulář pro zadání reset tokenu.

---

### POST /reset
1. Server ověří správnost reset tokenu.
2. Pokud je token správný:
   - vynuluje všechny hlasy
   - smaže seznam hlasujících
3. Pokud token není správný:
   - reset se neprovede

---

## 6. Ochrana proti vícenásobnému hlasování

Ochrana je implementována na serveru.

Mechanismus:
- Server nastaví uživateli unikátní cookie `voter_id`
- Tento identifikátor je uložen v seznamu hlasujících (`voters`)
- Při každém hlasování server kontroluje, zda již `voter_id` existuje
- Pokud existuje → hlasování je odmítnuto

Důležité:
- Evidence hlasujících není ukládána do localStorage
- Není uložena pouze v paměti
- Je zapsána do souboru `data/data.json`
- Tím je zajištěno sdílení mezi všemi uživateli

---

## 7. Reset token

Reset hlasování je chráněn tokenem uloženým na serveru.

Token:
- je uložen v environment proměnné `RESET_TOKEN`
- nebo je definován jako fallback přímo v serverovém kódu

Bez správného tokenu není možné hlasy resetovat.

---

## 8. Ukládání dat

Data jsou ukládána do souboru:


data/data.json


Příklad struktury:

```json
{
  "question": "Otázka",
  "options": ["A", "B", "C"],
  "votes": {
    "A": 0,
    "B": 0,
    "C": 0
  },
  "voters": []
}

Tento soubor je sdílený mezi všemi uživateli aplikace.

9. Nasazení aplikace

Aplikace je nasazena na platformě Render.

Veřejná URL:
https://anketa-odz6.onrender.com

Build command:
npm install

Start command:
npm start

10. Testovací scénář

Uživatel otevře hlavní stránku.

Hlasuje pro jednu možnost.

Je přesměrován na výsledky.

Pokusí se hlasovat znovu → hlas je odmítnut.

Jiný uživatel může hlasovat.

Admin zadá správný reset token → hlasy se vynulují.

11. Závěr

Aplikace splňuje všechny požadavky zadání:

webová aplikace

serverová logika

sdílená data

ochrana proti vícenásobnému hlasování

reset chráněný tokenem

veřejné nasazení