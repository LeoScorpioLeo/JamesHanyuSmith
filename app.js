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


 // Amazon RME Mechatronics keyword library
// Built from MRA Apprentice, M&R Tech, Senior M&R Tech postings you pasted

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

// Optional: synonym aliases to reduce false gaps.
// Use this if your scoring checks exact strings.
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
    .replace(/\u2011|\u2012|\u2013|\u2014/g, "-")   // normalize hyphen variants
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

  // Match logic:
  // - Exact substring match for multi-word phrases
  // - Word boundary-ish match for single tokens (best effort)
  keywords.forEach((k) => {
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

  const rawScore = uniqueHits.length / keywords.length;
  const percent = Math.round(rawScore * 100);

  // Show top misses that are most worth addressing in a resume/cover letter
  // Keep list short and readable.
  const gapShortlist = uniqueMisses
    .filter((k) =>
      [
        "hvac",
        "chillers",
        "generators",
        "ups",
        "switchgear",
        "bms",
        "building management system"
      ].every((x) => normalizeText(k) !== x)
    )
    .slice(0, 10);

  return {
    percent,
    matches: uniqueHits.slice(0, 14),
    gaps: gapShortlist
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



document.addEventListener("DOMContentLoaded", () => {
  setYear();
  setupTimelineToggles();
  setupFitCheck();
});

