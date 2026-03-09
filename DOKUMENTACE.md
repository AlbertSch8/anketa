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

Aplikace dále obsahuje:
- moderní tmavý vzhled s CSS stylingem
- navigační hlavičku s odkazy na všechny stránky
- vizualizaci výsledků formou sloupcového grafu s procenty
- stránku „O ankete" s popisem a statistikami
- fixní patičku s odkazem na GitHub Issues pro nahlášení problémů
- bezpečnostní hlavičky (HSTS, CSP, Secure cookie flag)

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
Zobrazí aktuální výsledky hlasování formou sloupcového grafu s procenty a počty hlasů.
Je dostupný i bez předchozího hlasování.

---

### GET /about
Zobrazí stránku s informacemi o ankete – popis, aktuální statistiky (počet hlasů, počet možností) a seznam všech možností.

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

## 8. Bezpečnost

### HSTS (HTTP Strict Transport Security)
Aplikace odesílá hlavičku:
```
Strict-Transport-Security: max-age=300; includeSubDomains
```
Chrání před downgrade útoky z HTTPS na HTTP.

### Content-Security-Policy (CSP)
Aplikace odesílá hlavičku:
```
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'
```
Chrání před XSS útoky a načítáním škodlivého obsahu.

### Secure cookie flag
Cookie `voter_id` má v produkčním prostředí nastaven flag `Secure`:
```js
secure: process.env.NODE_ENV === "production"
```
Cookie je přenášena pouze přes HTTPS, lokálně funguje přes HTTP.

---

## 9. Ukládání dat

Data jsou ukládána do souboru `data/data.json`.

Příklad struktury:

```json
{
  "question": "Otázka",
  "options": ["A", "B", "C"],
  "votes": [0, 0, 0],
  "voters": {}
}
```

Tento soubor je sdílený mezi všemi uživateli aplikace.

---

## 10. Uživatelské rozhraní

### Navigační hlavička
Fixní horní lišta zobrazená na všech stránkách. Obsahuje:
- název aplikace (logo) odkazující na hlavní stránku
- navigační odkazy: Hlasovat, Výsledky, O ankete
- aktivní stránka je zvýrazněna červeně

### Patička
Fixní spodní lišta zobrazená na všech stránkách. Obsahuje odkaz „Nahlásit problém" odkazující na GitHub Issues projektu:
https://github.com/AlbertSch8/anketa/issues

### Hlavní stránka (/)
- zobrazuje otázku a možnosti hlasování
- po hlasování jsou možnosti deaktivovány
- informuje uživatele o stavu hlasování

### Výsledky (/results)
- horizontální sloupcový graf s animací
- procentuální podíl každé možnosti
- počet hlasů u každé možnosti
- celkový počet hlasů

### O ankete (/about)
- popis účelu ankety
- statistiky (počet hlasů, počet možností)
- seznam všech možností
- tlačítka pro přechod na hlasování a výsledky

---

## 11. Nasazení aplikace

Aplikace je nasazena na platformě Render.

**Veřejná URL:** https://anketa-odz6.onrender.com

**Build command:** `npm install`

**Start command:** `npm start`

**Environment proměnné:**
- `RESET_TOKEN` – token pro reset hlasování
- `NODE_ENV=production` – aktivuje Secure flag u cookies

---

## 12. Testovací scénář

1. Uživatel otevře hlavní stránku.
2. Hlasuje pro jednu možnost.
3. Je přesměrován na výsledky – zobrazí se graf s procenty.
4. Pokusí se hlasovat znovu → hlas je odmítnut.
5. Jiný uživatel (jiný prohlížeč/zařízení) může hlasovat.
6. Admin zadá správný reset token → hlasy se vynulují.

---

## 13. Závěr

Aplikace splňuje všechny požadavky zadání:

- webová aplikace s serverovou logikou
- sdílená data mezi všemi uživateli
- ochrana proti vícenásobnému hlasování
- reset chráněný tokenem
- veřejné nasazení na Render.com
- moderní responzivní UI s navigací a grafem výsledků
- bezpečnostní hlavičky (HSTS, CSP, Secure cookie)
- GitHub Issues tlačítko pro zpětnou vazbu