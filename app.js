// app.js

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

function setupTimelineToggles() {
  const toggles = document.querySelectorAll(".toggle");
  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const content = btn.closest(".tl-content");
      if (!content) return;

      const body = content.querySelector(".tl-body");
      if (!body) return;

      const isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isOpen));
      btn.textContent = isOpen ? "Details" : "Hide";
      body.hidden = isOpen;
    });
  });

  const expandAll = document.querySelector('[data-action="expand-all"]');
  if (expandAll) {
    expandAll.addEventListener("click", () => {
      const buttons = document.querySelectorAll(".toggle");
      const anyClosed = Array.from(buttons).some(
        (b) => b.getAttribute("aria-expanded") !== "true"
      );

      buttons.forEach((b) => {
        const content = b.closest(".tl-content");
        if (!content) return;
        const body = content.querySelector(".tl-body");
        if (!body) return;

        b.setAttribute("aria-expanded", String(anyClosed));
        b.textContent = anyClosed ? "Hide" : "Details";
        body.hidden = !anyClosed;
      });

      expandAll.textContent = anyClosed ? "Collapse all" : "Expand all";
    });
  }
}

// Amazon RME Mechatronics keyword library
const KEYWORDS = [ /* your full list */ ];

const ALIASES = [
  ["preventative maintenance", "preventive maintenance"],
  ["photo eyes", "photo-eyes"],
  ["photo eye", "photo-eye"],
  ["programmable logic controller", "PLC"],
  ["computerized maintenance management system", "CMMS"],
  ["material handling equipment", "MHE"],
  ["fire life safety", "FLS"],
  ["I/O", "input and output"]
];

function normalize(text){
  return (text || "")
    .toLowerCase()
    .replace(/\u2011|\u2012|\u2013|\u2014/g, "-")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

function expandAliases(text){
  let t = text;
  for (const [a, b] of ALIASES){
    if (t.includes(a.toLowerCase()) && !t.includes(b.toLowerCase())){
      t += " " + b.toLowerCase();
    }
    if (t.includes(b.toLowerCase()) && !t.includes(a.toLowerCase())){
      t += " " + a.toLowerCase();
    }
  }
  return t;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function scoreFit(jdText) {
  let jd = normalize(jdText);
  jd = expandAliases(jd);

  const hits = [];
  const misses = [];

  KEYWORDS.forEach((k) => {
    const nk = normalize(k);
    if (!nk) return;

    const isPhrase = nk.includes(" ");
    const found = isPhrase
      ? jd.includes(nk)
      : new RegExp(`\\b${nk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(jd);

    if (found) hits.push(k);
    else misses.push(k);
  });

  const uniqueHits = uniq(hits);
  const uniqueMisses = uniq(misses);

  const rawScore = uniqueHits.length / KEYWORDS.length;
  const percent = Math.round(rawScore * 100);

  return {
    percent,
    matches: uniqueHits.slice(0, 14),
    gaps: uniqueMisses.slice(0, 10)
  };
}

function setupFitCheck() {
  const jd = document.getElementById("jd");
  const run = document.getElementById("runFit");
  const clear = document.getElementById("clearFit");
  const results = document.getElementById("fitResults");
  const score = document.getElementById("fitScore");
  const matches = document.getElementById("fitMatches");
  const gaps = document.getElementById("fitGaps");

  if (!jd || !run || !clear || !results || !score || !matches || !gaps) return;

  run.addEventListener("click", () => {
    const text = jd.value || "";
    const res = scoreFit(text);

    score.textContent = `Fit score: ${res.percent}%`;
    matches.innerHTML = "";
    gaps.innerHTML = "";

    res.matches.forEach((m) => {
      const li = document.createElement("li");
      li.textContent = m;
      matches.appendChild(li);
    });

    res.gaps.forEach((g) => {
      const li = document.createElement("li");
      li.textContent = g;
      gaps.appendChild(li);
    });

    results.hidden = false;
  });

  clear.addEventListener("click", () => {
    jd.value = "";
    results.hidden = true;
    matches.innerHTML = "";
    gaps.innerHTML = "";
    score.textContent = "";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  setupTimelineToggles();
  setupFitCheck();
});
