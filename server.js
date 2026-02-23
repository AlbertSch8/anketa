const express = require("express");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
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
      maxAge: 1000 * 60 * 60 * 24 * 365
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
</head>
<body>
<h1>${title}</h1>
${body}
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
    <p>${data.question}</p>
    <form method="POST" action="/vote">
      ${optionsHtml}
      <button type="submit" ${already ? "disabled" : ""}>Hlasovat</button>
    </form>
    <p><a href="/results">Výsledky</a></p>
    <p><a href="/reset">Reset</a></p>
    <p>${already ? "Už jsi hlasoval." : "Můžeš hlasovat jen jednou."}</p>
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

  const rows = data.options.map((opt, i) =>
    `<li>${opt}: ${data.votes[i]} hlasů</li>`
  ).join("");

  res.send(page("Výsledky", `<ul>${rows}</ul><a href="/">Zpět</a>`));
});

app.get("/reset", (req, res) => {
  res.send(page("Reset", `
    <form method="POST" action="/reset">
      <input type="text" name="token" placeholder="Token"/>
      <button type="submit">Reset</button>
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