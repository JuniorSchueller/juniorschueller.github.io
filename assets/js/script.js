// Junior Schueller Portfolio — JS
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// Mobile menu
const menuBtn = $('#menuBtn');
const navLinks = $('#navLinks');
menuBtn?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
});
$$('.nav-links a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuBtn.classList.remove('open');
}));

// Navbar — no-op kept for future

// Scroll spy
const sections = $$('section[id]');
const navAnchors = $$('.nav-links a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, {rootMargin:'-50% 0px -50% 0px'});
sections.forEach(s => spy.observe(s));

// Typing effect
const phrases = [
  'Full-Stack Developer',
  'APIs & Integrações',
  'Discord Bots • Eris',
  'Automações com IA'
];
const typedEl = $('#typed');
let pi = 0, ci = 0, deleting = false;
function typeLoop(){
  if(!typedEl) return;
  const full = phrases[pi];
  if(!deleting){
    typedEl.textContent = full.slice(0, ci+1);
    ci++;
    if(ci === full.length){
      deleting = true;
      return setTimeout(typeLoop, 1600);
    }
    setTimeout(typeLoop, 75);
  } else {
    typedEl.textContent = full.slice(0, ci-1);
    ci--;
    if(ci === 0){
      deleting = false;
      pi = (pi+1)%phrases.length;
      setTimeout(typeLoop, 300);
    } else setTimeout(typeLoop, 38);
  }
}
typeLoop();

// Stats counter
const counters = $$('[data-count]');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      const el = e.target;
      const target = +el.dataset.count;
      let cur = 0;
      const step = () => {
        cur += target/30;
        if(cur < target){ el.textContent = Math.ceil(cur); requestAnimationFrame(step); }
        else el.textContent = target;
      };
      requestAnimationFrame(step);
      counterObs.unobserve(el);
    }
  });
}, {threshold:.6});
counters.forEach(c => counterObs.observe(c));

// Proficiency bars
const bars = $$('.fill');
const barObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.style.width = e.target.dataset.width;
      barObs.unobserve(e.target);
    }
  });
},{threshold:.5});
bars.forEach(b=>barObs.observe(b));

// Reveal on scroll
$$('.section, .tl-item, .course, .skill-group, .prof').forEach(el=>el.classList.add('reveal'));
const revealObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); revealObs.unobserve(e.target);} });
},{threshold:.12});
$$('.reveal').forEach(el=>revealObs.observe(el));

// Toast
const toast = $('#toast');
let toastTimer;
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove('show'), 2500);
}

// Copy discord
const discordCard = $('#discordCard');
discordCard?.addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText('juniorschueller'); showToast('Discord copiado: juniorschueller ✓'); }
  catch{ showToast('Discord: juniorschueller'); }
});
discordCard?.addEventListener('keydown', e=>{
  if(e.key==='Enter' || e.key===' '){ e.preventDefault(); discordCard.click(); }
});

// CV button - generate placeholder toast if no file
$('#cvBtn')?.addEventListener('click', e=>{
  // if file doesn't exist, the browser will 404; show toast anyway for UX
  setTimeout(()=>{
    // don't prevent default; let download attempt happen
  },0);
});

// Contact form
const form = $('#contactForm');
const feedback = $('#formFeedback');
form?.addEventListener('submit', e=>{
  e.preventDefault();
  const data = new FormData(form);
  const name = data.get('name')?.trim();
  const email = data.get('email')?.trim();
  const subject = data.get('subject')?.trim();
  const message = data.get('message')?.trim();

  if(!name || !email || !subject || !message){
    feedback.textContent = 'Preencha todos os campos.';
    feedback.className = 'form-feedback show error';
    return;
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    feedback.textContent = 'Informe um e-mail válido.';
    feedback.className = 'form-feedback show error';
    return;
  }
  // Build mailto as fallback (no backend)
  const body = `Nome: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`;
  const mailto = `mailto:junior@schuellertech.com.br?subject=${encodeURIComponent(subject)}&body=${body}`;
  window.location.href = mailto;

  feedback.textContent = 'Abrindo seu e-mail para enviar a mensagem — obrigado pelo contato! ✨';
  feedback.className = 'form-feedback show success';
  form.reset();
  showToast('Redirecionando para o e-mail ✉️');
});

// Smooth anchor offset already handled by scroll-padding-top
