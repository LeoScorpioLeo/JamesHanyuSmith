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

// ---------- Fit Check v2: Extract keywords from JD, then compare to resume ----------

const STOPWORDS = new Set([
  "a","an","and","are","as","at","be","but","by","for","from","has","have","in","into",
  "is","it","its","of","on","or","our","out","such","that","the","their","them","then",
  "there","these","they","this","to","we","will","with","you","your",
  "ability","able","including","required","preferred","responsibilities","requirements",
  "experience","knowledge","skills","work","working","role","job","position","team",
  "must","ensure","support","maintain","perform","provide"
]);

const PHRASE_WHITELIST = [
  "preventive maintenance",
  "preventative maintenance",
  "predictive maintenance",
  "electrical schematics",
  "wiring diagrams",
  "motor control",
  "material handling equipment",
  "conveyor systems",
  "automated conveyor systems",
  "robotic work cells",
  "pneumatic systems",
  "computerized maintenance management system",
  "lockout tagout",
  "fire life safety",
  "root cause analysis",
  "power distribution",
  "variable frequency drive"
];

const ALIASES = [
  ["preventative maintenance", "preventive maintenance"],
  ["photo eyes", "photo-eyes"],
  ["photo eye", "photo-eye"],
  ["programmable logic controller", "plc"],
  ["computerized maintenance management system", "cmms"],
  ["material handling equipment", "mhe"],
  ["variable frequency drive", "vfd"],
  ["lockout tagout", "loto"],
  ["fire life safety", "fls"]
];

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/\u2011|\u2012|\u2013|\u2014/g, "-")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandAliases(text) {
  let t = text;
  for (const [a, b] of ALIASES) {
    const na = normalize(a);
    const nb = normalize(b);
    const hasA = t.includes(na);
    const hasB = t.includes(nb);
    if (hasA && !hasB) t += " " + nb;
    if (hasB && !hasA) t += " " + na;
  }
  return t;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function tokenFilter(token) {
  if (!token) return false;
  if (token.length < 3) return false;
  if (STOPWORDS.has(token)) return false;
  if (/^\d+$/.test(token)) return false;
  return true;
}

function extractKeywordsFromJD(jdText) {
  let jd = expandAliases(normalize(jdText));
  const words = jd.split(" ").filter(Boolean);
  const counts = new Map();

  // 1. Identify phrases and weight them
  PHRASE_WHITELIST.forEach(phrase => {
    const p = normalize(phrase);
    if (jd.includes(p)) {
      // Whitelist phrases get a "Weight Bonus"
      counts.set(phrase, (counts.get(phrase) || 0) + 5);
    }
  });

  // 2. Count N-grams (1 to 3 words)
  for (let i = 0; i < words.length; i++) {
    [1, 2, 3].forEach(n => {
      const gram = words.slice(i, i + n).join(" ");
      if (gram && gram.length > 3) {
        const tokens = gram.split(" ");
        if (tokens.every(tokenFilter)) {
          counts.set(gram, (counts.get(gram) || 0) + 1);
        }
      }
    });
  }

  // 3. Rank by Weight
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1]) 
    .slice(0, 30)
    .map(entry => ({ term: entry[0], weight: entry[1] }));
}

function scoreFitV2(resumeText, jdText) {
  const resume = expandAliases(normalize(resumeText));
  const jdKeywords = extractKeywordsFromJD(jdText);

  let earnedPoints = 0;
  let totalPossiblePoints = 0;
  const matches = [];
  const gaps = [];

  jdKeywords.forEach(({ term, weight }) => {
    totalPossiblePoints += weight;
    if (termInText(term, resume)) {
      earnedPoints += weight;
      matches.push(term);
    } else {
      gaps.push(term);
    }
  });

  const percent = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;

  return {
    percent,
    matches: matches.slice(0, 15),
    gaps: gaps.slice(0, 15),
    weightedScore: earnedPoints,
    extractedCount: jdKeywords.length
  };
}

  jdKeywords.forEach(({ term, weight }) => {
    totalPossiblePoints += weight;
    if (termInText(term, resume)) {
      earnedPoints += weight;
      matches.push(term);
    } else {
      gaps.push(term);
    }
  });

  const percent = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;

  return {
    percent,
    matches: matches.slice(0, 15),
    gaps: gaps.slice(0, 15),
    weightedScore: earnedPoints
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

  document.getElementById("fitBar").style.width = res.percent + "%";
    const jdText = jd.value || "";

    const resumeSections = Array.from(document.querySelectorAll("main section"))
      .filter((s) => s.id !== "fit");

    const resumeText = resumeSections.map((s) => s.innerText).join(" ");

    const res = scoreFitV2(resumeText, jdText);

    score.textContent = `Fit score: ${res.percent}% (from ${res.extractedCount} JD terms)`;
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
