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

      // ---------- Fit Check v2: Extract keywords from JD, then compare to resume ----------

// Stopwords to remove (common filler words)
const STOPWORDS = new Set([
  "a","an","and","are","as","at","be","but","by","for","from","has","have","in","into",
  "is","it","its","of","on","or","our","out","such","that","the","their","them","then",
  "there","these","they","this","to","we","will","with","you","your",
  "ability","able","including","required","preferred","responsibilities","requirements",
  "experience","knowledge","skills","work","working","role","job","position","team",
  "must","may","can","ensure","support","maintain","perform","provide"
]);

// Phrases we want to preserve as single concepts
// You can expand this list over time
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

// Aliases for common acronyms and variants
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

// Extract 1 to 4-gram phrases from JD and rank by frequency
function extractKeywordsFromJD(jdText) {
  let jd = expandAliases(normalize(jdText));

  // Lock in whitelist phrases so they do not get split
  for (const phrase of PHRASE_WHITELIST) {
    const p = normalize(phrase);
    if (jd.includes(p)) {
      jd = jd.replaceAll(p, p.replace(/\s+/g, "_"));
    }
  }

  const words = jd.split(" ").map(w => w.replace(/_/g, "_")).filter(Boolean);

  // Build n-grams
  const counts = new Map();

  function addGram(g) {
    const cleaned = g.trim();
    if (!cleaned) return;

    // restore spaces for whitelisted phrases
    const restored = cleaned.replace(/_/g, " ");

    // filter grams where most tokens are stopwords
    const tokens = restored.split(" ").filter(Boolean);
    const goodTokens = tokens.filter(t => tokenFilter(t));
    if (goodTokens.length === 0) return;

    // reject grams that are mostly stopwords
    if (goodTokens.length / tokens.length < 0.6) return;

    counts.set(restored, (counts.get(restored) || 0) + 1);
  }

  for (let i = 0; i < words.length; i++) {
    const w1 = words[i].replace(/_/g, " ");
    if (tokenFilter(w1)) addGram(w1);

    const g2 = words.slice(i, i + 2).join(" ");
    const g3 = words.slice(i, i + 3).join(" ");
    const g4 = words.slice(i, i + 4).join(" ");

    addGram(g2);
    addGram(g3);
    addGram(g4);
  }

  // Rank: prefer longer phrases, then frequency
  const ranked = Array.from(counts.entries())
    .map(([term, freq]) => ({ term, freq, len: term.split(" ").length }))
    .filter(x => x.term.length >= 3)
    .sort((a, b) => (b.len - a.len) || (b.freq - a.freq) || (a.term > b.term ? 1 : -1));

  // De-duplicate nested phrases:
  // if "electrical schematics" exists, drop "schematics" if it is fully covered
  const selected = [];
  for (const item of ranked) {
    const t = item.term;
    const covered = selected.some(s => s.includes(t) || t.includes(s));
    if (!covered) selected.push(t);
    if (selected.length >= 40) break;
  }

  return selected;
}

function termInText(term, text) {
  const nt = normalize(term);
  if (!nt) return false;

  // phrases: substring match
  if (nt.includes(" ")) return text.includes(nt);

  // single tokens: word boundary match
  return new RegExp(`\\b${nt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text);
}

function scoreFitV2(resumeText, jdText) {
  let resume = expandAliases(normalize(resumeText));
  let jd = expandAliases(normalize(jdText));

  const jdTerms = extractKeywordsFromJD(jdText);

  const matches = [];
  const gaps = [];

  jdTerms.forEach(term => {
    if (termInText(term, resume)) matches.push(term);
    else gaps.push(term);
  });

  const denom = jdTerms.length || 1;
  const percent = Math.round((matches.length / denom) * 100);

  return {
    percent,
    matches: uniq(matches).slice(0, 14),
    gaps: uniq(gaps).slice(0, 14),
    extractedCount: jdTerms.length
  };
}
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
const KEYWORDS = [
  // Org and environment
  "Amazon",
  "Operations",
  "Reliability Maintenance & Engineering",
  "RME",
  "maintenance",
  "continuous improvement",
  "customer obsession",
  "high-performance manufacturing systems",
  "process efficiency",
  "equipment availability",
  "uptime",
  "uptime-critical",
  "automated packaging",
  "distribution equipment",
  "automated packaging and distribution equipment",
  "automation",
  "high automation",
  "robotics",
  "material handling equipment",
  "MHE",
  "material handling",
  "conveyance",
  "conveyance equipment",
  "conveyor",
  "automated conveyor systems",
  "conveyor systems and controls",
  "robotic work cells",
  "robot cells",
  "robotic operation",
  "robotic maintenance",
  "pneumatic systems",
  "pneumatics",
  "critical assets",

  // Core duties verbs
  "analyze",
  "troubleshoot",
  "troubleshooting",
  "diagnose",
  "diagnostics",
  "repair",
  "installation",
  "install",
  "maintain",
  "maintenance and repair",
  "preventative maintenance",
  "preventive maintenance",
  "predictive maintenance",
  "preventative/predictive maintenance",
  "job plans",
  "procedures",
  "manuals",
  "technical documents",
  "instructions",
  "basic troubleshooting",
  "electrical diagnostics",
  "mechanical diagnostics",

  // Electrical and controls language
  "electrical",
  "mechanical",
  "electronic",
  "electrical and electronic principles",
  "electrical principles",
  "electronic principles",
  "control skills",
  "control components",
  "controls",
  "relay logic",
  "ladder diagrams",
  "ladder logic",
  "blueprints",
  "electrical schematics",
  "schematics",
  "wiring diagrams",
  "control panels",
  "PLC",
  "programmable logic controller",
  "PLC based controls systems",
  "input and output",
  "I/O",
  "basic input and output function",

  // Common components called out in postings
  "belts",
  "motors",
  "motor starters",
  "photo eyes",
  "photo-eye",
  "photo-eyes",
  "relays",
  "proximity sensors",
  "proximity sensor",
  "solenoids",
  "tachs",
  "tachometers",
  "limit switches",
  "limit switch",
  "switches",

  // Safety and physical requirements
  "safe working environment",
  "safe work practices",
  "safety procedures",
  "safety standards",
  "implementing safety standards",
  "PPE",
  "personal protective equipment",
  "climb ladders",
  "ladders",
  "gangways",
  "stand and walk",
  "12 hours",
  "bending",
  "lifting",
  "stretching",
  "reaching",
  "49lbs",
  "49 lbs",
  "move up to 49lbs",

  // Documentation and CMMS
  "documentation",
  "proper documentation",
  "work orders",
  "create and close out work orders",
  "labor hours",
  "parts used",
  "job plans for emergency repair",
  "CMMS",
  "computerized maintenance management system",

  // Team and communication
  "effective communicator",
  "work well in a team",
  "self-motivated",
  "collaboratively",
  "coordinate",
  "upstream",
  "downstream",
  "operations partners",
  "positive working relationship",
  "mentored",
  "mentor",
  "mentoring",
  "train",
  "training",
  "train and mentor",
  "junior technicians",
  "service technicians",
  "contract technicians",
  "vendors",
  "stakeholders",
  "Safety",
  "project management",
  "manage projects",
  "designing solutions",

  // Senior specific adds
  "Fire Life Safety",
  "FLS",
  "facility equipment",
  "shift lead",
  "lead a team",
  "lead service technicians",
  "develop training plans",
  "planned repairs",
  "emergency repairs",
  "emergency repair",

  // Qualifications terms used in postings
  "high school diploma",
  "GED",
  "associate degree",
  "associate's degree",
  "Associate of Science",
  "military experience",
  "Microsoft Word",
  "Microsoft Excel",
  "Microsoft Outlook",
  "Microsoft Office",
  "PC software",
  "math",
  "mathematics",
  "measurement reading",
  "interpretation",
  "mechanical aptitude test",
  "flexible schedule",
  "weekends",
  "nights",
  "holidays",
  "apprenticeship",
  "Mechatronics and Robotics Apprenticeship Program",
  "MRA",
  "OJL",
  "on-the-job learning",
  "relocate",
  "flexible to relocate"
];
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

function scoreFit(resumeText, jdText) {
  let resume = normalize(resumeText);
  let jd = normalize(jdText);

  resume = expandAliases(resume);
  jd = expandAliases(jd);

  const jdKeywords = [];
  const matched = [];
  const gaps = [];

  KEYWORDS.forEach((k) => {
    const nk = normalize(k);
    if (!nk) return;

    const isPhrase = nk.includes(" ");
    const inJD = isPhrase
      ? jd.includes(nk)
      : new RegExp(`\\b${nk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(jd);

    if (!inJD) return;

    jdKeywords.push(k);

    const inResume = isPhrase
      ? resume.includes(nk)
      : new RegExp(`\\b${nk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(resume);

    if (inResume) matched.push(k);
    else gaps.push(k);
  });

  const uniqueMatched = uniq(matched);
  const uniqueGaps = uniq(gaps);
  const denom = jdKeywords.length;

  const percent = denom ? Math.round((uniqueMatched.length / denom) * 100) : 0;

  return {
    percent,
    matches: uniqueMatched.slice(0, 14),
    gaps: uniqueGaps.slice(0, 12)
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
