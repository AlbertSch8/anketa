const express = require("express");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=300; includeSubDomains");
  res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'");
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const RESET_TOKEN = process.env.RESET_TOKEN || "TAJNY_TOKEN_123";
const DATA_PATH = path.join(__dirname, "data", "data.json");

function loadData() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}
function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function ensureVoterCookie(req, res) {
  let voterId = req.cookies.voter_id;
  if (!voterId) {
    voterId = uuidv4();
    res.cookie("voter_id", voterId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === "production"
    });
  }
  return voterId;
}

function page(title, body) {
  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #e0e0e0;
  }
  .card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 40px 48px;
    max-width: 520px;
    width: 100%;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #e94560;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
  }
  .question {
    font-size: 1.1rem;
    color: #ccc;
    margin-bottom: 24px;
    line-height: 1.5;
  }
  label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
    transition: background 0.2s;
  }
  label:hover { background: rgba(233,69,96,0.15); }
  input[type="radio"] { accent-color: #e94560; width: 18px; height: 18px; }
  input[type="text"] {
    width: 100%;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.08);
    color: #e0e0e0;
    font-size: 1rem;
    margin-bottom: 14px;
    outline: none;
    transition: border 0.2s;
  }
  input[type="text"]:focus { border-color: #e94560; }
  .btn {
    display: inline-block;
    padding: 11px 26px;
    border-radius: 8px;
    border: none;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.2s, transform 0.1s;
  }
  .btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }
  .btn-primary { background: #e94560; color: #fff; }
  .btn-secondary { background: rgba(255,255,255,0.12); color: #e0e0e0; }
  .btn-github {
    background: #24292f;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.15);
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; align-items: center; }
  .notice {
    margin-top: 18px;
    font-size: 0.88rem;
    color: #aaa;
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
    padding: 10px 14px;
  }
  ul { list-style: none; padding: 0; margin-bottom: 20px; }
  ul li {
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 8px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    font-size: 1rem;
  }
  .github-icon { width: 18px; height: 18px; fill: #fff; flex-shrink: 0; }
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    padding: 12px 20px;
    background: rgba(10,10,20,0.75);
    backdrop-filter: blur(8px);
    border-top: 1px solid rgba(255,255,255,0.07);
    z-index: 100;
  }
  .footer a {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #aaa;
    text-decoration: none;
    font-size: 0.85rem;
    transition: color 0.2s;
  }
  .footer a:hover { color: #e0e0e0; }
  .footer svg { width: 15px; height: 15px; fill: #aaa; flex-shrink: 0; }
  .footer a:hover svg { fill: #e0e0e0; }
  body { padding-bottom: 60px; padding-top: 70px; }
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 56px;
    background: rgba(10,10,20,0.85);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    z-index: 100;
  }
  .nav-brand {
    font-size: 1rem;
    font-weight: 700;
    color: #e94560;
    text-decoration: none;
    letter-spacing: 0.5px;
  }
  .nav-links { display: flex; gap: 6px; }
  .nav-links a {
    color: #aaa;
    text-decoration: none;
    font-size: 0.88rem;
    padding: 6px 14px;
    border-radius: 6px;
    transition: background 0.2s, color 0.2s;
  }
  .nav-links a:hover { background: rgba(255,255,255,0.08); color: #e0e0e0; }
  .nav-links a.active { background: rgba(233,69,96,0.15); color: #e94560; }
</style>
</head>
<body>
<nav>
  <a class="nav-brand" href="/">📊 Anketa</a>
  <div class="nav-links">
    <a href="/" class="${title === 'Anketa' ? 'active' : ''}">Hlasovat</a>
    <a href="/results" class="${title === 'Výsledky' ? 'active' : ''}">Výsledky</a>
  </div>
</nav>
<div class="card">
<h1>${title}</h1>
${body}
</div>
<footer class="footer">
  <a href="https://github.com/AlbertSch8/anketa/issues" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
    Nahlásit problém
  </a>
</footer>
</body>
</html>`;
}

app.get("/", (req, res) => {
  const voterId = ensureVoterCookie(req, res);
  const data = loadData();
  const already = !!data.voters?.[voterId];

  const optionsHtml = data.options.map((opt, i) => `
    <label>
      <input type="radio" name="option" value="${i}" ${i === 0 ? "checked" : ""} ${already ? "disabled" : ""}/>
      ${opt}
    </label><br>
  `).join("");

  res.send(page("Anketa", `
    <p class="question">${data.question}</p>
    <form method="POST" action="/vote">
      ${optionsHtml}
      <div class="links">
        <button class="btn btn-primary" type="submit" ${already ? "disabled" : ""}>Hlasovat</button>
        <a class="btn btn-secondary" href="/results">Výsledky</a>
      </div>
    </form>
    <p class="notice">${already ? "✔ Už jsi hlasoval." : "ℹ Můžeš hlasovat jen jednou."}</p>
  `));
});

app.post("/vote", (req, res) => {
  const voterId = ensureVoterCookie(req, res);
  const data = loadData();

  const optionIndex = Number(req.body.option);

  if (data.voters?.[voterId]) {
    return res.send("Už jsi hlasoval.");
  }

  data.votes[optionIndex] += 1;
  data.voters[voterId] = true;
  saveData(data);

  res.redirect("/results");
});

app.get("/results", (req, res) => {
  const data = loadData();

  const total = data.votes.reduce((a, b) => a + b, 0);

  const colors = ["#e94560", "#0f3460", "#533483", "#e94560cc", "#16213e"];

  const bars = data.options.map((opt, i) => {
    const votes = data.votes[i];
    const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
    const color = colors[i % colors.length];
    return `
      <div class="bar-row">
        <div class="bar-label">${opt}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="bar-info">${votes} hlasů &nbsp;<span class="bar-pct">${pct}%</span></div>
      </div>`;
  }).join("");

  res.send(page("Výsledky", `
    <style>
      .bar-row { margin-bottom: 18px; }
      .bar-label { font-size: 0.9rem; color: #ccc; margin-bottom: 5px; }
      .bar-track {
        background: rgba(255,255,255,0.08);
        border-radius: 8px;
        height: 28px;
        overflow: hidden;
        width: 100%;
      }
      .bar-fill {
        height: 100%;
        border-radius: 8px;
        transition: width 0.8s ease;
        min-width: ${total > 0 ? "2px" : "0"};
      }
      .bar-info { font-size: 0.88rem; color: #aaa; margin-top: 4px; }
      .bar-pct { color: #e94560; font-weight: 600; }
      .total-info { font-size: 0.85rem; color: #888; margin-bottom: 20px; }
    </style>
    <p class="total-info">Celkem hlasů: <strong style="color:#e0e0e0">${total}</strong></p>
    <div class="chart">${bars}</div>
    <div class="links" style="margin-top:24px">
      <a class="btn btn-secondary" href="/">Zpět na anketu</a>
    </div>
  `));
});

app.get("/reset", (req, res) => {
  res.send(page("Reset", `
    <form method="POST" action="/reset">
      <input type="text" name="token" placeholder="Token"/>
      <button class="btn btn-primary" type="submit">Reset</button>
    </form>
  `));
});

app.post("/reset", (req, res) => {
  if (req.body.token !== RESET_TOKEN) {
    return res.send("Špatný token.");
  }

  const data = loadData();
  data.votes = data.votes.map(() => 0);
  data.voters = {};
  saveData(data);

  res.send("Reset proběhl.");
});

app.listen(PORT, () => console.log("Server běží"));