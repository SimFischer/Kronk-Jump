/* Kronk springt! Kein Framework, kein Server, keine externen Dienste. */
"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $("canvas"), ctx = canvas.getContext("2d");
  const W = 600, H = 720, GAP = 165, GRAVITY = 600, JUMP = 620, SPEED = 340;
  const images = {};
  let mode = "loading", questions = [], index = 0, score = 0, camera = 0;
  let row, oldRows = [], player, last = 0, accumulator = 0, hold = 0, apexUsed = false, thinking = 2;
  let failText = "", facing = 1, celebration = 0;
  const keys = new Set(), pointers = new Map();
  const shuffle = list => {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  function validate(data) {
    if (!data || !Array.isArray(data.fragen) || !data.fragen.length) throw Error("Bitte mindestens eine Frage in aufgaben.js eintragen.");
    data.fragen.forEach((q, i) => {
      if (typeof q.frage !== "string" || !q.frage.trim() || !Array.isArray(q.antworten) || q.antworten.length < 2 || q.antworten.length > 4 ||
          q.antworten.some(a => typeof a.text !== "string" || !a.text.trim() || typeof a.richtig !== "boolean") || !q.antworten.some(a => a.richtig)) {
        throw Error(`Frage ${i + 1}: Fragetext, 2–4 Antworten und mindestens einmal richtig: true erforderlich.`);
      }
    });
  }
  function makeRow(y) {
    const q = questions[index];
    const answers = shuffle(q.antworten);
    const gap = 14, margin = 20, width = (W - margin * 2 - gap * (answers.length - 1)) / answers.length;
    return { y, q, platforms: answers.map((a, i) => ({...a, x: margin + i * (width + gap), width, broken: false})) };
  }
  function clearInput() {
    keys.clear(); pointers.clear();
    $("left").classList.remove("held"); $("right").classList.remove("held");
  }
  function showPanel(title, text, button, settings = false) {
    $("panel-title").textContent = title; $("panel-text").textContent = text;
    $("start").textContent = button; $("time-label").hidden = !settings;
    $("overlay").hidden = false; clearInput();
  }
  function setQuestion() {
    $("question").textContent = row.q.frage;
    $("score").textContent = `${score} Punkte`;
    $("status").textContent = `Aufgabe ${index + 1} von ${questions.length} · Füße auf die richtige Plattform!`;
  }
  function start() {
    questions = window.KRONK_INHALTE.mischen ? shuffle(window.KRONK_INHALTE.fragen) : window.KRONK_INHALTE.fragen.slice();
    thinking = Number($("thinking").value); index = 0; score = 0; camera = 0; oldRows = [];
    row = makeRow(440); player = { x: W / 2, y: 640, vy: -JUMP };
    hold = 0; apexUsed = false; failText = ""; celebration = 0; accumulator = 0;
    mode = "playing"; clearInput(); $("overlay").hidden = true;
    $("pause").disabled = false; $("pause").textContent = "Pause"; setQuestion();
  }
  function pause() {
    if (mode === "playing") {
      mode = "paused"; $("pause").textContent = "Weiter";
      showPanel("Kurze Pause", "Kronk wartet auf dich. Dein Spielstand bleibt erhalten.", "Weiterspielen");
    } else if (mode === "paused") {
      mode = "playing"; $("pause").textContent = "Pause"; $("overlay").hidden = true; accumulator = 0;
    }
  }
  function finish(won) {
    mode = won ? "won" : "lost"; $("pause").disabled = true;
    showPanel(won ? "Ganz oben angekommen!" : "Noch ein Sprung?", won ? `Kronk hat alle ${questions.length} Aufgaben geschafft. ${score} Punkte!` : `${score} Punkte. ${failText || "Du hast die Plattform verfehlt."} ${row.q.erklaerung || "Richtig: " + row.q.antworten.filter(a => a.richtig).map(a => a.text).join(", ")}`, "Noch einmal spielen", true);
    $("status").textContent = won ? "Alle Aufgaben geschafft!" : "Lies die Lösung und versuche es noch einmal.";
  }
  function step(dt) {
    if (mode !== "playing") return;
    const left = keys.has("ArrowLeft") || [...pointers.values()].includes(-1);
    const right = keys.has("ArrowRight") || [...pointers.values()].includes(1);
    const direction = Number(right) - Number(left);
    if (direction) facing = direction;
    player.x = Math.max(28, Math.min(W - 28, player.x + direction * SPEED * dt));
    const previousY = player.y;
    if (hold > 0) {
      hold = Math.max(0, hold - dt);
      $("status").textContent = `Denkpause · ${Math.ceil(hold)} s · Kronk lässt sich weiter steuern`;
      if (!hold) $("status").textContent = "Jetzt auf der richtigen Antwort landen!";
    } else {
      player.vy += GRAVITY * dt;
      if (!apexUsed && player.vy >= 0) { apexUsed = true; hold = thinking; player.vy = 0; }
      player.y += player.vy * dt;
    }
    celebration = Math.max(0, celebration - dt);
    if (!failText && player.vy > 0 && previousY <= row.y && player.y >= row.y) {
      // Nur die schmale Fußposition zählt, nicht Kronks langer Schnabel.
      const hit = row.platforms.find(p => !p.broken && player.x >= p.x && player.x <= p.x + p.width);
      if (hit) {
        if (hit.richtig) {
          score += 100; $("score").textContent = `${score} Punkte`;
          player.y = row.y; player.vy = -JUMP; hold = 0; apexUsed = false; celebration = .5;
          oldRows.push(row); oldRows = oldRows.slice(-4); index++;
          if (index === questions.length) { finish(true); return; }
          row = makeRow(row.y - GAP); setQuestion();
        } else {
          hit.broken = true; failText = `„${hit.text}“ war hier nicht richtig.`;
          $("status").textContent = "Diese Plattform bricht weg …";
        }
      }
    }
    const target = row.y - 440;
    camera += (target - camera) * Math.min(1, dt * 5);
    if (player.y - camera > H + 110) finish(false);
  }
  function wrapped(text, x, y, maxWidth) {
    // Zeichenweises Umbrechen funktioniert auch bei langen deutschen Wörtern.
    const lines = []; let line = "";
    for (const word of text.split(/\s+/)) {
      let next = line ? line + " " + word : word;
      if (ctx.measureText(next).width <= maxWidth) { line = next; continue; }
      if (line) lines.push(line);
      line = "";
      for (const char of word) {
        if (ctx.measureText(line + char).width > maxWidth && line) { lines.push(line); line = ""; }
        line += char;
      }
    }
    if (line) lines.push(line);
    // Plattformetikett wächst nach unten; Text wird weder gekürzt noch überlagert.
    const height = Math.max(46, lines.length * 23 + 16);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(x - maxWidth / 2 - 8, y, maxWidth + 16, height);
    ctx.fillStyle = "#102743";
    lines.forEach((s, i) => ctx.fillText(s, x, y + 29 + i * 23));
  }
  function drawRow(r, old = false) {
    const y = r.y - camera;
    if (y < -200 || y > H + 100) return;
    ctx.globalAlpha = old ? .22 : 1;
    for (const p of r.platforms) {
      ctx.fillStyle = p.broken ? "#e94232" : "#102743";
      if (p.broken) {
        ctx.save(); ctx.translate(p.x + p.width / 2, y + 15); ctx.rotate(.2); ctx.fillRect(-p.width / 2, 0, p.width * .45, 10); ctx.rotate(-.4); ctx.fillRect(0, 0, p.width * .45, 10); ctx.restore();
      } else { ctx.fillRect(p.x, y, p.width, 10); }
      ctx.textAlign = "center"; ctx.font = "600 20px system-ui";
      wrapped(p.text, p.x + p.width / 2, y + 12, p.width - 16);
    }
    ctx.globalAlpha = 1;
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#d8f0fb"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#bddfeF"; ctx.lineWidth = 1;
    for (let y = ((-camera * .3) % 60) - 60; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    if (!player) return;
    oldRows.forEach(r => drawRow(r, true)); drawRow(row);
    const img = celebration > 0 || mode === "won" ? images.jubel : player.vy < 0 ? images.sprung : images.normal;
    if (img) {
      const height = 95, width = height * img.naturalWidth / img.naturalHeight;
      ctx.save(); ctx.translate(player.x, player.y - camera); ctx.scale(facing, 1);
      ctx.drawImage(img, -width / 2, -height, width, height); ctx.restore();
      // Kleiner Fußmarker macht die Landeposition eindeutig.
      ctx.fillStyle = "#e94232"; ctx.fillRect(player.x - 7, player.y - camera - 3, 14, 3);
    }
  }
  function frame(time) {
    const dt = Math.min((time - last) / 1000 || 0, .05); last = time;
    if (mode === "playing") { accumulator += dt; while (accumulator >= 1 / 120) { step(1 / 120); accumulator -= 1 / 120; } } else accumulator = 0;
    draw(); requestAnimationFrame(frame);
  }
  for (const [id, direction] of [["left", -1], ["right", 1]]) {
    const button = $(id);
    button.addEventListener("pointerdown", e => { e.preventDefault(); if (mode !== "playing") return; button.setPointerCapture(e.pointerId); pointers.set(e.pointerId, direction); button.classList.add("held"); });
    const release = e => { pointers.delete(e.pointerId); if (![...pointers.values()].includes(direction)) button.classList.remove("held"); };
    button.addEventListener("pointerup", release); button.addEventListener("pointercancel", release); button.addEventListener("lostpointercapture", release);
    button.addEventListener("contextmenu", e => e.preventDefault());
  }
  window.addEventListener("keydown", e => {
    if (e.target.tagName === "SELECT") return;
    if (["ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault(); if (mode === "playing") keys.add(e.key); }
    if (e.key.toLowerCase() === "p" && !e.repeat) pause();
  });
  window.addEventListener("keyup", e => keys.delete(e.key));
  window.addEventListener("blur", () => { clearInput(); if (mode === "playing") pause(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && mode === "playing") pause(); });
  $("pause").addEventListener("click", pause);
  $("start").addEventListener("click", () => mode === "paused" ? pause() : start());
  async function init() {
    try {
      validate(window.KRONK_INHALTE);
      $("set-title").textContent = window.KRONK_INHALTE.titel || "Lernspiel";
      await Promise.all(["normal", "jubel", "sprung"].map(name => new Promise((resolve, reject) => {
        const img = new Image(); img.onload = () => { images[name] = img; resolve(); };
        img.onerror = () => reject(Error(`Kronk-Bild fehlt: assets/kronk-${name}.png`)); img.src = `assets/kronk-${name}.png`;
      })));
      mode = "ready"; $("start").disabled = false; $("start").textContent = "Los geht’s!";
    } catch (e) { mode = "error"; showPanel("Dateien prüfen", e.message, "Bitte Dateien korrigieren"); $("start").disabled = true; }
    requestAnimationFrame(frame);
  }
  init();
})();
