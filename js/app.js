/* ============================================================
   FLOATING HEARTS BACKGROUND (canvas 2D, used across all screens)
   ============================================================ */
const heartsCanvas = document.getElementById('hearts-canvas');
const hctx = heartsCanvas.getContext('2d');
let hw, hh;
function resizeHearts(){
  hw = heartsCanvas.width = window.innerWidth;
  hh = heartsCanvas.height = window.innerHeight;
}
resizeHearts();
window.addEventListener('resize', resizeHearts);

function drawHeart(ctx,x,y,size,alpha,color){
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x,y);
  ctx.scale(size/20,size/20);
  ctx.beginPath();
  ctx.moveTo(0,4);
  ctx.bezierCurveTo(0,-2,-10,-2,-10,5);
  ctx.bezierCurveTo(-10,12,0,16,0,22);
  ctx.bezierCurveTo(0,16,10,12,10,5);
  ctx.bezierCurveTo(10,-2,0,-2,0,4);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.restore();
}

const heartParticles = [];
const HEART_COUNT = window.innerWidth < 640 ? 36 : 60;
function makeHeart(){
  const sizeClass = Math.random();
  return {
    x: Math.random()*hw,
    y: hh + Math.random()*hh,
    size: sizeClass < 0.5 ? 8+Math.random()*8 : sizeClass < 0.85 ? 16+Math.random()*10 : 26+Math.random()*16,
    speed: 0.25 + Math.random()*0.6,
    drift: (Math.random()-0.5)*0.4,
    alpha: 0.25 + Math.random()*0.55,
    color: Math.random() < 0.55 ? '#ff69b4' : '#8a2be2',
    sway: Math.random()*Math.PI*2
  };
}
for(let i=0;i<HEART_COUNT;i++) heartParticles.push(makeHeart());

function animateHearts(){
  hctx.clearRect(0,0,hw,hh);
  for(const h of heartParticles){
    h.y -= h.speed;
    h.sway += 0.01;
    h.x += Math.sin(h.sway)*h.drift;
    if(h.y < -40){
      Object.assign(h, makeHeart());
      h.y = hh + 20;
    }
    drawHeart(hctx, h.x, h.y, h.size, h.alpha, h.color);
  }
  requestAnimationFrame(animateHearts);
}
animateHearts();

/* ============================================================
   LOGIN LOGIC
   ============================================================ */
const VALID_USER = "HafidzAndCahaya";
const VALID_PASS = "13042026";

const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');
const loginCard = document.querySelector('.login-card');
const loginError = document.getElementById('login-error');
const cinematic = document.getElementById('cinematic');
const cinematicText = document.getElementById('cinematic-text');
const openerScreen = document.getElementById('opener-screen');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('user').value.trim();
  const p = document.getElementById('pass').value.trim();
  if(u === VALID_USER && p === VALID_PASS){
    loginError.classList.remove('show');
    runCinematicTransition();
  } else {
    loginError.classList.add('show');
    loginCard.classList.remove('shake');
    void loginCard.offsetWidth;
    loginCard.classList.add('shake');
  }
});

function runCinematicTransition(){
  cinematic.style.pointerEvents = 'auto';
  gsap.to(cinematic, { opacity:1, duration:0.6, onComplete:() => {
    gsap.to(cinematicText, { opacity:1, duration:0.8, delay:0.1 });
  }});
  setTimeout(() => {
    gsap.to(cinematic, { opacity:0, duration:0.8, onComplete:() => {
      cinematic.style.pointerEvents = 'none';
      loginScreen.classList.add('hidden');
      openerScreen.classList.remove('hidden');
      startTypewriter();
    }});
  }, 2000);
}

/* ============================================================
   TYPEWRITER OPENER
   ============================================================ */
const openerMessage = `Haloo Cahaya Prihatin ❤️

Selamat atas kelulusanmu.

Hari ini bukan hanya tentang berakhirnya masa sekolahmu, tetapi juga tentang awal dari perjalanan yang lebih besar dan lebih indah.

Aku tahu tidak semua langkah yang kamu lalui mudah. Ada lelah, ada tekanan, ada banyak hal yang mungkin tidak pernah orang lain lihat. Tetapi kamu berhasil melewati semuanya dengan kuat.

Aku bangga melihat sejauh ini kamu sudah berjalan.

Terima kasih karena sudah menjadi seseorang yang selalu berusaha, selalu bertahan, dan selalu memberikan warna dalam hidupku.

Semoga setiap mimpi yang kamu simpan perlahan menjadi kenyataan, semoga setiap langkahmu selalu dipenuhi kebahagiaan, dan semoga masa depanmu jauh lebih indah daripada yang bisa kamu bayangkan saat ini.

Selamat atas kelulusanmu, Cahaya.

Aku akan selalu mendukungmu di setiap langkahmu.

❤️`;

const typewriterWrap = document.getElementById('typewriter-wrap');
const journeyBtn = document.getElementById('start-journey-btn');

function startTypewriter(){
  let i = 0;
  const speed = 18;
  const cursorSpan = document.createElement('span');
  cursorSpan.id = 'cursor';
  function type(){
    if(i <= openerMessage.length){
      typewriterWrap.textContent = openerMessage.slice(0, i);
      typewriterWrap.appendChild(cursorSpan);
      i++;
      setTimeout(type, speed);
    } else {
      gsap.to(journeyBtn, { opacity:1, duration:1 });
    }
  }
  type();
}

const uploadScreen = document.getElementById('upload-screen');
journeyBtn.addEventListener('click', () => {
  gsap.to(openerScreen, { opacity:0, duration:0.7, onComplete:() => {
    openerScreen.classList.add('hidden');
    openerScreen.style.opacity = 1;
    uploadScreen.classList.remove('hidden');
    initUploadSlots();
  }});
});

/* ============================================================
   PHOTO UPLOAD (5 photos, used across album + galaxy)
   ============================================================ */
const PLACEHOLDER_COLORS = ['#ff69b4','#8a2be2','#ff9bd2','#3a0ca3','#ff69b4'];
const uploadedPhotos = [null,null,null,null,null];

function placeholderDataURL(color){
  const c = document.createElement('canvas');
  c.width = 300; c.height = 300;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0,0,300,300);
  grad.addColorStop(0, '#0a0512');
  grad.addColorStop(1, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,300,300);
  ctx.font = '120px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('❤', 150, 160);
  return c.toDataURL();
}

function initUploadSlots(){
  const slotsEl = document.getElementById('slots');
  slotsEl.innerHTML = '';
  for(let i=0;i<5;i++){
    const slot = document.createElement('label');
    slot.className = 'slot';
    slot.innerHTML = `<span>＋</span><input type="file" accept="image/*" data-idx="${i}">`;
    slotsEl.appendChild(slot);
    const input = slot.querySelector('input');
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        uploadedPhotos[i] = ev.target.result;
        slot.innerHTML = `<img src="${ev.target.result}" alt="foto ${i+1}"><input type="file" accept="image/*" data-idx="${i}">`;
        slot.querySelector('input').addEventListener('change', input.onchange);
      };
      reader.readAsDataURL(file);
    });
  }
}

document.getElementById('continue-btn').addEventListener('click', () => {
  // fill missing slots with soft placeholder hearts so the experience always works
  for(let i=0;i<5;i++){
    if(!uploadedPhotos[i]) uploadedPhotos[i] = placeholderDataURL(PLACEHOLDER_COLORS[i]);
  }
  document.getElementById('memimg-1').src = uploadedPhotos[0];
  document.getElementById('memimg-2').src = uploadedPhotos[1];
  document.getElementById('memimg-3').src = uploadedPhotos[2];

  gsap.to(uploadScreen, { opacity:0, duration:0.6, onComplete:() => {
    uploadScreen.classList.add('hidden');
    uploadScreen.style.opacity = 1;
    document.getElementById('memory-sections').classList.remove('hidden');
    initScrollAnimations();
    initGalaxy();
  }});
});

/* ============================================================
   GSAP SCROLLTRIGGER — photo sections (parallax / scale / fade)
   ============================================================ */
function initScrollAnimations(){
  gsap.registerPlugin(ScrollTrigger);
  ['#section-photo-1','#section-photo-2','#section-photo-3'].forEach((sel, idx) => {
    const frame = document.querySelector(sel + ' .photo-frame');
    const caption = document.querySelector(sel + ' .photo-caption');
    gsap.fromTo(frame,
      { opacity:0, y:80, scale:0.85 },
      {
        opacity:1, y:0, scale:1, duration:1,
        scrollTrigger:{ trigger:sel, start:'top 80%', toggleActions:'play none none reverse' }
      });
    gsap.fromTo(caption,
      { opacity:0, y:30 },
      {
        opacity:1, y:0, duration:1, delay:0.2,
        scrollTrigger:{ trigger:sel, start:'top 70%', toggleActions:'play none none reverse' }
      });
    gsap.to(frame, {
      yPercent: -8 * (idx+1),
      ease:'none',
      scrollTrigger:{ trigger:sel, start:'top bottom', end:'bottom top', scrub:true }
    });
  });

  gsap.fromTo('#galaxy-transition p',
    { opacity:0, scale:0.9 },
    { opacity:1, scale:1, duration:1.2,
      scrollTrigger:{ trigger:'#galaxy-transition', start:'top 75%', toggleActions:'play none none reverse' } });
}

/* ============================================================
   THREE.JS GALAXY OF MEMORIES
   ============================================================ */
let galaxyInitialized = false;
let scene, camera, renderer, galaxyGroup, coreGroup, starField;
let scrollProgress = 0; // 0 -> 1 drives camera through the galaxy
const galaxySection = document.getElementById('galaxy-section');
const endingOverlay = document.getElementById('ending-overlay');
const galaxyHint = document.getElementById('galaxy-hint');

function makeCircleTexture(dataURL){
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const ctx = c.getContext('2d');
      ctx.save();
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI*2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, size, size);
      ctx.restore();
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'rgba(255,105,180,0.9)';
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI*2);
      ctx.stroke();
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.src = dataURL;
  });
}

async function initGalaxy(){
  if(galaxyInitialized) return;
  galaxyInitialized = true;

  const canvas = document.getElementById('galaxy-canvas');
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05010a, 0.012);

  camera = new THREE.PerspectiveCamera(60, galaxySection.clientWidth/galaxySection.clientHeight, 0.1, 2000);
  camera.position.set(0,0,260);

  renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(galaxySection.clientWidth, galaxySection.clientHeight);

  // ambient nebula light
  scene.add(new THREE.AmbientLight(0x8a2be2, 0.6));
  const pinkLight = new THREE.PointLight(0xff69b4, 1.4, 800);
  pinkLight.position.set(0,0,0);
  scene.add(pinkLight);

  // starfield
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2200;
  const starPos = new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){
    const r = 400 + Math.random()*900;
    const theta = Math.random()*Math.PI*2;
    const phi = Math.acos((Math.random()*2)-1);
    starPos[i*3] = r*Math.sin(phi)*Math.cos(theta);
    starPos[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
    starPos[i*3+2] = r*Math.cos(phi);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
  const starMat = new THREE.PointsMaterial({ color:0xffffff, size:1.6, transparent:true, opacity:0.85 });
  starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // nebula sprites (soft glow blobs)
  function nebulaTexture(color){
    const c = document.createElement('canvas'); c.width=c.height=256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128,128,0,128,128,128);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,256,256);
    return new THREE.CanvasTexture(c);
  }
  const nebColors = ['rgba(255,105,180,0.5)','rgba(138,43,226,0.5)'];
  for(let i=0;i<14;i++){
    const tex = nebulaTexture(nebColors[i%2]);
    const mat = new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending });
    const sprite = new THREE.Sprite(mat);
    const r = 300 + Math.random()*500;
    const theta = Math.random()*Math.PI*2;
    sprite.position.set(Math.cos(theta)*r, (Math.random()-0.5)*300, Math.sin(theta)*r - 400);
    const s = 250 + Math.random()*300;
    sprite.scale.set(s,s,1);
    scene.add(sprite);
  }

  // load circular textures of the 5 uploaded photos
  const textures = await Promise.all(uploadedPhotos.map(makeCircleTexture));

  // orbiting clone field — hundreds of photo sprites
  galaxyGroup = new THREE.Group();
  scene.add(galaxyGroup);
  const CLONE_COUNT = window.innerWidth < 640 ? 160 : 280;
  const orbitData = [];
  for(let i=0;i<CLONE_COUNT;i++){
    const tex = textures[i % textures.length];
    const mat = new THREE.SpriteMaterial({ map:tex, transparent:true });
    const sprite = new THREE.Sprite(mat);
    const radius = 60 + Math.random()*260;
    const angle = Math.random()*Math.PI*2;
    const tilt = (Math.random()-0.5)*1.4;
    const size = 6 + Math.random()*10;
    sprite.scale.set(size,size,1);
    orbitData.push({ sprite, radius, angle, tilt, speed:(0.05+Math.random()*0.12) * (Math.random()<0.5?1:-1), depth:(Math.random()-0.5)*200 });
    galaxyGroup.add(sprite);
  }

  // glowing core ring — main photos
  coreGroup = new THREE.Group();
  scene.add(coreGroup);
  const coreData = [];
  const CORE_COUNT = 8;
  for(let i=0;i<CORE_COUNT;i++){
    const tex = textures[i % textures.length];
    const mat = new THREE.SpriteMaterial({ map:tex, transparent:true });
    const sprite = new THREE.Sprite(mat);
    const angle = (i/CORE_COUNT)*Math.PI*2;
    sprite.scale.set(34,34,1);
    coreData.push({ sprite, angle, radius:46 });
    coreGroup.add(sprite);
  }
  // central glow sprite behind core
  const coreGlowTex = nebulaTexture('rgba(255,105,180,0.9)');
  const coreGlowMat = new THREE.SpriteMaterial({ map:coreGlowTex, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false });
  const coreGlow = new THREE.Sprite(coreGlowMat);
  coreGlow.scale.set(180,180,1);
  coreGlow.position.set(0,0,-650);
  scene.add(coreGlow);
  coreGroup.position.set(0,0,-650);

  let clock = new THREE.Clock();

  function animateGalaxy(){
    const t = clock.getElapsedTime();
    for(const o of orbitData){
      o.angle += o.speed * 0.01;
      const x = Math.cos(o.angle)*o.radius;
      const y = Math.sin(o.angle)*o.radius*Math.sin(o.tilt);
      const z = Math.sin(o.angle)*o.radius*Math.cos(o.tilt) + o.depth - 200;
      o.sprite.position.set(x,y,z);
    }
    for(const c of coreData){
      c.angle += 0.003;
      c.sprite.position.set(Math.cos(c.angle)*c.radius, Math.sin(c.angle)*c.radius*0.4, Math.sin(c.angle*0.7)*10);
    }
    coreGroup.rotation.y = t*0.05;
    starField.rotation.y = t*0.003;

    // camera flies forward through the galaxy based on scrollProgress (0..1)
    const z = 260 - scrollProgress * 900;
    camera.position.z = z;
    camera.position.x = Math.sin(t*0.05) * 6;
    camera.lookAt(0,0, z-200);

    if(scrollProgress >= 1){
      endingOverlay.classList.add('show');
      galaxyHint.style.opacity = 0;
    } else {
      endingOverlay.classList.remove('show');
      galaxyHint.style.opacity = 1;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animateGalaxy);
  }
  animateGalaxy();
}

/* scroll-to-explore-galaxy: capture wheel while the galaxy section is in view */
let galaxyInView = false;
const galaxyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { galaxyInView = entry.isIntersecting; });
}, { threshold:0.6 });
galaxyObserver.observe(galaxySection);

window.addEventListener('wheel', (e) => {
  if(!galaxyInView || !galaxyInitialized) return;
  // once fully in view, treat wheel as galaxy depth control rather than page scroll
  if(scrollProgress > 0 || (scrollProgress === 0 && e.deltaY > 0)){
    e.preventDefault();
    scrollProgress += e.deltaY * 0.00045;
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));
  }
}, { passive:false });

// Touch handling for mobile / touch devices: convert vertical swipes into galaxy depth
let touchStartY = null;
let lastTouchY = null;

window.addEventListener('touchstart', (e) => {
  if(!galaxyInView || !galaxyInitialized) return;
  if(!e.touches || e.touches.length === 0) return;
  touchStartY = e.touches[0].clientY;
  lastTouchY = touchStartY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if(!galaxyInView || !galaxyInitialized) return;
  if(touchStartY === null) return;
  const curY = e.touches[0].clientY;
  const deltaY = lastTouchY - curY; // positive when swiping up (want to advance)
  lastTouchY = curY;

  // Only intercept when the user intends to move into the galaxy (swipe up)
  if(scrollProgress > 0 || (scrollProgress === 0 && deltaY > 0)){
    e.preventDefault();
    // scale touch sensitivity — tuned for reasonable feel on Android
    scrollProgress += deltaY * 0.0025;
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));
  }
}, { passive: false });

window.addEventListener('touchend', () => {
  touchStartY = null;
  lastTouchY = null;
});

document.getElementById('replay-btn').addEventListener('click', () => {
  scrollProgress = 0;
  endingOverlay.classList.remove('show');
  window.scrollTo({ top:0, behavior:'smooth' });
});

window.addEventListener('resize', () => {
  if(!galaxyInitialized) return;
  camera.aspect = galaxySection.clientWidth/galaxySection.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(galaxySection.clientWidth, galaxySection.clientHeight);
});

/* ============================================================
   BACKGROUND MUSIC: autoplay attempt and fallback controls
   ============================================================ */
(function(){
  const audio = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');
  if(!audio || !toggle) return;
  audio.volume = 0.85;
  function setPlayingUI(playing){
    toggle.classList.toggle('playing', playing);
    toggle.textContent = playing ? '⏸' : '▶';
  }
  // try autoplay on load
  window.addEventListener('load', () => {
    const p = audio.play();
    if(p !== undefined){
      p.then(()=> setPlayingUI(!audio.paused)).catch(()=> {
        // autoplay blocked; wait for first user interaction
        setPlayingUI(false);
      });
    }
  });
  // click toggle
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if(audio.paused){ audio.play().then(()=> setPlayingUI(true)).catch(()=>{}); }
    else { audio.pause(); setPlayingUI(false); }
  });
  // also try to play once after first user gesture
  function onFirstGesture(){
    if(audio.paused){ audio.play().then(()=> setPlayingUI(true)).catch(()=>{}); }
    window.removeEventListener('click', onFirstGesture);
    window.removeEventListener('touchstart', onFirstGesture);
  }
  window.addEventListener('click', onFirstGesture);
  window.addEventListener('touchstart', onFirstGesture);
})();
