let lang = localStorage.getItem("dcc-lang") || "en";
let theme = localStorage.getItem("dcc-theme") || "dark";
function applyLang(l){
  lang = l; localStorage.setItem("dcc-lang", l);
  document.documentElement.lang = l;
  document.querySelectorAll("[data-pl]").forEach(el=>{ el.textContent = l==="pl"?el.dataset.pl:el.dataset.en; });
  btnPL.classList.toggle("active", l==="pl"); btnEN.classList.toggle("active", l==="en");
}
function applyTheme(t){
  theme = t; localStorage.setItem("dcc-theme", t);
  document.documentElement.setAttribute("data-theme", t);
}
btnPL.onclick = ()=>applyLang("pl"); btnEN.onclick = ()=>applyLang("en");
themeBtn.onclick = ()=>applyTheme(theme==="dark"?"light":"dark");

// reveal
const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); setTimeout(()=>e.target.classList.remove("d1","d2","d3","d4"),900); } }),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

// progress
addEventListener("scroll", ()=>{
  const h = document.documentElement;
  progress.style.width = (h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+"%";
},{passive:true});

// cursor glow follows mouse
const glow = document.getElementById("glow");
let gx=innerWidth/2, gy=200, tx=gx, ty=gy;
addEventListener("mousemove", e=>{ tx=e.clientX; ty=e.clientY; });
(function loop(){ gx+=(tx-gx)*.08; gy+=(ty-gy)*.08; glow.style.left=gx+"px"; glow.style.top=gy+"px"; requestAnimationFrame(loop); })();

// magnetic buttons (tylko myszka — na dotyku tap przyklejał transform)
const canHover = matchMedia("(hover:hover) and (pointer:fine)").matches;
if(canHover) document.querySelectorAll(".magnet").forEach(b=>{
  b.addEventListener("mousemove", e=>{
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.14}px,${(e.clientY-r.top-r.height/2)*.2}px)`;
  });
  b.addEventListener("mouseleave", ()=>b.style.transform="");
});

// spotlight cards
if(canHover) document.querySelectorAll(".spot").forEach(c=>{
  c.addEventListener("mousemove", e=>{
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", (e.clientX-r.left)+"px");
    c.style.setProperty("--my", (e.clientY-r.top)+"px");
  });
});

// *** TYLKO okno launchera — jeden bok ucieka od kursora, drugi się przybliża ***
const launcher = document.getElementById("clientCard");
const LMAX = 8;
let lraf = null, lx = innerWidth/2, ly = innerHeight/2;
if(canHover) addEventListener("mousemove", e=>{ lx=e.clientX; ly=e.clientY; if(!lraf) lraf=requestAnimationFrame(tiltLauncher); }, {passive:true});
function tiltLauncher(){
  lraf = null;
  if(!launcher) return;
  const r = launcher.getBoundingClientRect();
  const px = (lx-(r.left+r.width/2))/Math.max(1,r.width/2);   // -1..1
  const py = (ly-(r.top+r.height/2))/Math.max(1,r.height/2);
  const c = v=>Math.max(-1,Math.min(1,v));
  // bok po stronie kursora oddala się, przeciwny przybliża
  launcher.style.transform = `rotateX(${(-c(py)*LMAX).toFixed(2)}deg) rotateY(${(c(px)*LMAX).toFixed(2)}deg)`;
}
document.documentElement.addEventListener("mouseleave", ()=>{ if(launcher) launcher.style.transform=""; });

// versions: klikany wybór — aktywny kafelek cały na zielono
document.querySelectorAll(".timeline .t").forEach(t=>{
  t.addEventListener("click", ()=>{
    document.querySelectorAll(".timeline .t").forEach(x=>x.classList.remove("on"));
    t.classList.add("on");
  });
});

// mobile: zamiast pobierania info o braku wersji na telefony
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints>1 && Math.min(screen.width,screen.height)<820);
if(isMobile){
  document.getElementById("dlCta").hidden = true;
  document.getElementById("dlNote").hidden = true;
  document.getElementById("mobileNote").hidden = false;
}

// more dropdown (dotyk)
const moreMenu = document.getElementById("moreMenu");
if(moreMenu){
  document.getElementById("moreBtn").addEventListener("click", e=>{ e.stopPropagation(); moreMenu.classList.toggle("open"); });
  document.addEventListener("click", ()=>moreMenu.classList.remove("open"));
}

// downloads
(function(){
  const c = window.SITE_CONFIG||{};
  const rl = document.getElementById("repoLink");
  if(c.GITHUB_REPO && rl) rl.href = c.GITHUB_REPO;
  let ok=false;
  if(c.DOWNLOAD_EXE_URL){ dlExe.href=c.DOWNLOAD_EXE_URL; dlExe.onclick=null; ok=true; }
  if(c.DOWNLOAD_MSI_URL){ dlMsi.href=c.DOWNLOAD_MSI_URL; dlMsi.onclick=null; ok=true; }
  if(ok){ dlNote.classList.add("ready"); dlNote.textContent = lang==="pl"?"Gotowy do pobrania ✓":"Ready to download ✓"; }
})();
function missing(){
  const c = window.SITE_CONFIG||{};
  if(!c.DOWNLOAD_EXE_URL && !c.DOWNLOAD_MSI_URL){ dlNote.style.color="#f87171"; setTimeout(()=>dlNote.style.color="",1200); return false; }
  return true;
}
applyLang(lang); applyTheme(theme);
