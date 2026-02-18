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

function normalizeText(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9+./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function scoreFit(jdText) {
  const jd = normalizeText(jdText);

  // Skills derived from your resume language.
  // Keep these broad and stable so it works for many roles.
  const keywords = [
    "electromechanical",
    "industrial automation",
    "automation",
    "maintenance",
    "preventive maintenance",
    "corrective maintenance",
    "troubleshooting",
    "diagnostics",
    "root cause",
    "reliability",
    "safety",
    "loto",
    "lockout tagout",
    "nfpa 70e",
    "qualified electrical worker",
    "cmms",
    "work orders",
    "motors",
    "motor controls",
    "variable frequency drive",
    "vfd",
    "powerflex",
    "allen bradley",
    "plc",
    "programmable logic controller",
    "sensors",
    "control panels",
    "control devices",
    "conveyor",
    "sortation",
    "material handling",
    "rotating equipment",
    "mechanical drives",
    "fluid power",
    "schematics",
    "test instruments",
    "downtime",
    "handoff"
  ];

  const hits = [];
  const misses = [];

  // Match logic:
  // - Exact substring match for multi-word phrases
  // - Word boundary-ish match for single tokens (best effort)
  keywords.forEach((k) => {
    const nk = normalizeText(k);
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

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  setupTimelineToggles();
  setupFitCheck();
});
