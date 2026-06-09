/* KOMBEL PAUD Karamen Simaeruk — app.js v2 */

const ORDER = ['cover','deskripsi','visi-misi'];
let current = 'cover';
let busy = false;

/* ── NAVIGATION ── */
function goTo(id){
  if(busy || id === current) return;
  busy = true;

  const oldIdx = ORDER.indexOf(current);
  const newIdx = ORDER.indexOf(id);
  const dir    = newIdx > oldIdx ? 1 : -1;

  const oldPg = document.getElementById('page-' + current);
  const newPg = document.getElementById('page-' + id);

  window.scrollTo({top:0,behavior:'smooth'});

  // Fade out old
  oldPg.style.cssText = `
    display:block;
    opacity:0;
    transform:translateX(${dir < 0 ? 50 : -50}px);
    transition:opacity .32s ease, transform .32s ease;
    pointer-events:none;
  `;

  setTimeout(()=>{
    oldPg.classList.remove('active');
    oldPg.style.cssText = '';
    oldPg.style.display = 'none';

    // Slide in new
    newPg.style.cssText = `
      display:block;
      opacity:0;
      transform:translateX(${dir > 0 ? 60 : -60}px);
      transition:none;
    `;
    newPg.classList.add('active');
    void newPg.offsetWidth; // reflow

    newPg.style.transition = 'opacity .42s ease, transform .42s ease';
    newPg.style.opacity    = '1';
    newPg.style.transform  = 'translateX(0)';

    setTimeout(()=>{
      newPg.style.cssText = '';
      current = id;
      busy = false;
      updateNav(id);
      scheduleReveal();
    }, 430);

  }, 330);

  updateNav(id);
}

/* ── NAV ACTIVE ── */
function updateNav(id){
  document.querySelectorAll('.nav-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.p === id);
  });
}

/* ── DRAWER ── */
function openDrawer(){
  document.getElementById('drawer').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeDrawer(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

document.getElementById('hamburger').addEventListener('click', ()=>{
  const d = document.getElementById('drawer');
  d.classList.contains('open') ? closeDrawer() : openDrawer();
});

/* ── REVEAL ON SCROLL ── */
let revealObs;
function scheduleReveal(){
  if(revealObs) revealObs.disconnect();
  revealObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('vis');
        revealObs.unobserve(e.target);
      }
    });
  },{threshold:0.08,rootMargin:'0px 0px -30px 0px'});

  document.querySelectorAll('#page-' + current + ' .r').forEach(el=>{
    el.classList.remove('vis');
    revealObs.observe(el);
  });
}

/* ── SPARKLE CANVAS on cover ── */
function initSparkle(){
  const pg = document.getElementById('page-cover');
  const canvas = document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:2;opacity:.35';
  pg.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W,H,pts=[];

  function resize(){
    W = canvas.width  = pg.offsetWidth;
    H = canvas.height = pg.offsetHeight;
  }

  function mkPt(){
    return{
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*2+.5,
      dx:(Math.random()-.5)*.35,
      dy:-Math.random()*.7-.15,
      a:Math.random()*.8+.1,
      c:['#F4A825','#FFD700','#fff','#F4D060'][Math.random()*4|0]
    };
  }

  function init(){resize();pts=Array.from({length:70},mkPt);window.addEventListener('resize',resize)}

  function tick(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      ctx.save();ctx.globalAlpha=p.a;ctx.fillStyle=p.c;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();
      p.x+=p.dx;p.y+=p.dy;p.a-=.0025;
      if(p.a<=0||p.y<-8) Object.assign(p,mkPt(),{y:H+5,a:Math.random()*.5+.15});
    });
    requestAnimationFrame(tick);
  }
  init();tick();
}

/* ── CARD HOVER 3D ── */
function init3D(){
  document.querySelectorAll('.fk,.vp,.mp,.cap-item').forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const rc=el.getBoundingClientRect();
      const x=(e.clientX-rc.left)/rc.width-.5;
      const y=(e.clientY-rc.top)/rc.height-.5;
      el.style.transform=`translateY(-5px) rotateX(${-y*5}deg) rotateY(${x*5}deg)`;
    });
    el.addEventListener('mouseleave',()=>{el.style.transform=''});
  });
}

/* ── KEYBOARD ── */
document.addEventListener('keydown',e=>{
  const i=ORDER.indexOf(current);
  if(e.key==='ArrowRight'&&i<ORDER.length-1) goTo(ORDER[i+1]);
  if(e.key==='ArrowLeft' &&i>0)              goTo(ORDER[i-1]);
});

/* ── CHIP RIPPLE ── */
function initRipple(){
  document.querySelectorAll('.chip,.activity-pill').forEach(el=>{
    el.addEventListener('click',()=>{
      const s=document.createElement('span');
      s.style.cssText='position:absolute;border-radius:50%;background:rgba(255,255,255,.35);width:6px;height:6px;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);animation:rp .5s ease-out forwards;pointer-events:none';
      el.style.position='relative';el.style.overflow='hidden';
      el.appendChild(s);setTimeout(()=>s.remove(),550);
    });
  });
}
const rpStyle=document.createElement('style');
rpStyle.textContent='@keyframes rp{to{transform:translate(-50%,-50%) scale(18);opacity:0}}';
document.head.appendChild(rpStyle);

/* ── NAVBAR SCROLL SHRINK ── */
window.addEventListener('scroll',()=>{
  const nav=document.getElementById('navbar');
  nav.style.boxShadow=window.scrollY>60?'0 4px 24px rgba(0,0,0,.4)':'';
});

/* ── INIT ── */
document.addEventListener('DOMContentLoaded',()=>{
  // Boot first page
  const fp=document.getElementById('page-cover');
  fp.classList.add('active');
  fp.style.display='block';

  // Prevent # links default
  document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));

  initSparkle();
  setTimeout(init3D,200);
  setTimeout(initRipple,300);
  scheduleReveal();
});