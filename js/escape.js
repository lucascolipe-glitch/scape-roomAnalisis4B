/* ==========================================================
   Escape Room - Analisis Matematico 4B Vespertino
   Archivo: js/escape.js
   Funciones: temporizador, progreso, validacion de codigos,
   pistas, reinicio y pagina docente.
   ========================================================== */

const ESCAPE = {
  storagePrefix: "escape-analisis-4b-",
  codes: {
    estacion1: "0206",
    estacion2: "2431",
    estacion3: "2124",
    estacion4: "0204",
    estacion5: "2330",
    final: "6823"
  },
  words: {
    estacion1: "LINEAL",
    estacion2: "CUADRÁTICA",
    estacion3: "RACIONAL",
    estacion4: "EXPONENCIAL",
    estacion5: "LOGARÍTMICA"
  },
  next: {
    estacion1: "estacion2.html",
    estacion2: "estacion3.html",
    estacion3: "estacion4.html",
    estacion4: "estacion5.html",
    estacion5: "final.html",
    final: "index.html"
  }
};

function key(name){
  return ESCAPE.storagePrefix + name;
}

function getCompleted(){
  return JSON.parse(localStorage.getItem(key("completed")) || "[]");
}

function setCompleted(station){
  const completed = new Set(getCompleted());
  completed.add(station);
  localStorage.setItem(key("completed"), JSON.stringify([...completed]));
}

function isCompleted(station){
  return getCompleted().includes(station);
}

function startTimer(){
  if(!localStorage.getItem(key("startTime"))){
    localStorage.setItem(key("startTime"), Date.now().toString());
  }
  updateTimer();
  setInterval(updateTimer, 1000);
}

function updateTimer(){
  const timer = document.querySelector("[data-timer]");
  if(!timer) return;
  const start = Number(localStorage.getItem(key("startTime")) || Date.now());
  const elapsed = Math.floor((Date.now() - start)/1000);
  const min = String(Math.floor(elapsed/60)).padStart(2,"0");
  const sec = String(elapsed%60).padStart(2,"0");
  timer.textContent = `${min}:${sec}`;
}

function renderProgress(current){
  const progress = document.querySelector("[data-progress]");
  if(!progress) return;
  const stations = ["estacion1","estacion2","estacion3","estacion4","estacion5","final"];
  const labels = ["Lineal","Cuadrática","Racional","Exponencial","Logarítmica","Final"];
  progress.innerHTML = stations.map((st, i) => {
    const cls = isCompleted(st) ? "completo" : (st === current ? "actual" : "");
    return `<div class="paso ${cls}">${i+1}. ${labels[i]}</div>`;
  }).join("");
}

function normalizeCode(value){
  return String(value || "").trim().replace(/\s+/g, "").toUpperCase();
}

function showMessage(id, type, text){
  const box = document.getElementById(id);
  if(!box) return;
  box.className = `mensaje ${type}`;
  box.innerHTML = text;
}

function validateStation(station){
  const input = document.getElementById("codigo");
  const code = normalizeCode(input?.value);
  const expected = ESCAPE.codes[station];
  const word = ESCAPE.words[station];
  const next = ESCAPE.next[station];

  if(code === expected){
    setCompleted(station);
    renderProgress(station);
    const wordHtml = word ? `<div class="palabra">${word}</div>` : "";
    showMessage("resultado", "ok", `
      <p>✅ Código correcto. Abran el candado físico con <span class="codigo">${expected}</span>.</p>
      ${wordHtml}
      <p>Registren la palabra y continúen con la siguiente estación.</p>
      <p><a class="boton verde" href="${next}">Continuar</a></p>
    `);
  }else{
    showMessage("resultado", "error", "❌ El código no abre el sistema. Revisen el análisis y vuelvan a intentar.");
  }
}

function validateFinal(){
  const input = document.getElementById("codigo");
  const code = normalizeCode(input?.value);
  if(code === ESCAPE.codes.final){
    setCompleted("final");
    renderProgress("final");
    showMessage("resultado", "ok", `
      <p>✅ Cofre final desbloqueado.</p>
      <h2>¡Sistema reactivado!</h2>
      <p>El grupo logró analizar funciones lineales, cuadráticas, racionales, exponenciales y logarítmicas, reconociendo dominio, raíces, signos, crecimiento, decrecimiento y asíntotas.</p>
    `);
  }else{
    showMessage("resultado", "error", "❌ El cofre final sigue bloqueado. Revisen las palabras y los datos del recorrido.");
  }
}

function toggleHint(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.toggle("visible");
  const hints = Number(localStorage.getItem(key("hints")) || 0) + 1;
  localStorage.setItem(key("hints"), String(hints));
}

function resetEscape(){
  if(confirm("¿Querés reiniciar el progreso del escape room en este dispositivo?")){
    Object.keys(localStorage)
      .filter(k => k.startsWith(ESCAPE.storagePrefix))
      .forEach(k => localStorage.removeItem(k));
    location.href = "index.html";
  }
}

function teacherLogin(){
  const pass = normalizeCode(document.getElementById("claveDocente")?.value);
  const panel = document.getElementById("panelDocente");
  const msg = document.getElementById("mensajeDocente");
  if(pass === "FUNCIONES"){
    panel?.classList.remove("oculto");
    if(msg) msg.textContent = "";
  }else if(msg){
    msg.textContent = "Clave incorrecta.";
  }
}

function unlockAll(){
  ["estacion1","estacion2","estacion3","estacion4","estacion5","final"].forEach(setCompleted);
  renderProgress("final");
  showMessage("docenteOk", "ok", "Todas las estaciones quedaron marcadas como completas en este dispositivo.");
}

function initEscape(current){
  startTimer();
  renderProgress(current);
}

window.ESCAPE = ESCAPE;
window.initEscape = initEscape;
window.validateStation = validateStation;
window.validateFinal = validateFinal;
window.toggleHint = toggleHint;
window.resetEscape = resetEscape;
window.teacherLogin = teacherLogin;
window.unlockAll = unlockAll;
