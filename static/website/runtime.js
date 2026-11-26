window.zlNote=function(kind){let n=document.getElementById('zl-booking-note');if(!n){n=document.createElement('div');n.id='zl-booking-note';n.setAttribute('role','status');n.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483000;max-width:min(560px,calc(100vw - 32px));padding:16px 24px;background:#30373f;color:#fff;border:1px solid rgba(195,143,65,.6);border-radius:40px;font:14px/1.45 Montserrat-Medium,sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.35)';document.body.append(n);}n.innerHTML=location.pathname.includes('/en/')?(kind==='form'?'Message us on <a href="https://t.me/zoloticahotel" target="_blank" rel="noopener" style="color:#c38f41">Telegram @zoloticahotel</a> or call <a href="tel:+79210854655" style="color:#c38f41">+7&nbsp;(921)&nbsp;085-46-55</a> – we will reply with dates and prices.':'To book, call <a href="tel:+79210854655" style="color:#c38f41">+7&nbsp;(921)&nbsp;085-46-55</a> or message us on <a href="https://t.me/zoloticahotel" target="_blank" rel="noopener" style="color:#c38f41">Telegram</a>'):(kind==='form'?'Напишите нам в&nbsp;<a href="https://t.me/zoloticahotel" target="_blank" rel="noopener" style="color:#c38f41">Telegram @zoloticahotel</a> или позвоните <a href="tel:+79210854655" style="color:#c38f41">+7&nbsp;(921)&nbsp;085-46-55</a> – ответим с&nbsp;датами и&nbsp;ценами.':'Забронировать: <a href="tel:+79210854655" style="color:#c38f41">+7&nbsp;(921)&nbsp;085-46-55</a> или в&nbsp;<a href="https://t.me/zoloticahotel" target="_blank" rel="noopener" style="color:#c38f41">Telegram</a>');n.hidden=false;clearTimeout(n._t);n._t=setTimeout(()=>{n.hidden=true},10000);};

/* Public static preview has no active booking service. */
document.addEventListener('click',function(e){const a=e.target.closest('a[href]');if(!a)return;const href=a.getAttribute('href')||'';if(href.includes('tl-booking-open')||href.includes('#block-search')){e.preventDefault();e.stopImmediatePropagation();window.zlNote();}},true);
/* Local backend only. Historic WordPress writes stay disabled. */
document.addEventListener('submit', async event => {
  const form = event.target;
  if (!form.matches('[data-backend-form]')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  /* Static preview: no backend, nothing leaves the browser. */
  if (location.hostname.endsWith('github.io') || !document.querySelector('meta[name="csrf-token"]')) {
    if (window.zlNote) window.zlNote('form');
    return;
  }
  if (form.dataset.sending === 'true') return;
  form.dataset.sending = 'true';
  const values = {};
  for (const [name, value] of new FormData(form)) if (typeof value === 'string') values[name] = value;
  const status = form.querySelector('[data-backend-status]') || document.createElement('p');
  status.dataset.backendStatus = 'true';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.append(status);
  form.dataset.idempotencyKey ||= crypto.randomUUID();
  try {
    const response = await fetch('/api/submissions/', {
      method: 'POST', credentials: 'same-origin',
      headers: {'Content-Type': 'application/json', 'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content},
      body: JSON.stringify({form_id: form.dataset.backendForm, page_path: form.dataset.pagePath,
        idempotency_key: form.dataset.idempotencyKey, fields: values})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Не удалось сохранить заявку.');
    status.textContent = 'Заявка сохранена. Номер: ' + result.id + '. Это не подтверждение бронирования или доставки письма.';
  } catch (error) {
    status.textContent = error.message || 'Сервис временно недоступен. Попробуйте позже.';
  } finally {
    form.dataset.sending = 'false';
  }
}, true);


// Keep the mobile menu usable even if the archived theme script fails to load.
document.addEventListener('click', event => {
  const trigger = event.target.closest('.mob-menu-btn');
  const menu = document.querySelector('.mobile-menu');
  if (!menu) return;
  const close = event.target.closest('.mobile-menu .rpopup_close');
  const overlay = event.target.closest('.overlay');
  if (!trigger && !close && !(overlay && menu.classList.contains('active'))) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const open = Boolean(trigger) && !menu.classList.contains('active');
  menu.classList.toggle('active', open);
  document.body.classList.toggle('popup-open', open);
}, true);

document.addEventListener('DOMContentLoaded', () => {
  const notice = document.querySelector('#cookie-notice');
  if (!notice) return;
  if (location.pathname.includes('/en/')) {
    const message = notice.querySelector('#cn-notice-text');
    const button = notice.querySelector('#cn-accept-cookie');
    const close = notice.querySelector('#cn-close-notice');
    if (message) message.textContent = 'This website uses cookies.';
    if (button) { button.textContent = 'OK'; button.setAttribute('aria-label', 'OK'); }
    if (close) close.setAttribute('title', 'Close');
  }
  let stored;
  try {stored = localStorage.getItem('zolotitsa-cookie-choice');} catch (_) {}
  if (stored) notice.style.display = 'none';
  else {notice.classList.remove('cookie-notice-hidden'); notice.classList.add('cookie-notice-visible'); notice.style.display = 'block';}
  for (const button of notice.querySelectorAll('#cn-accept-cookie, #cn-close-notice, .cn-close-icon')) {
    button.addEventListener('click', event => {
      event.preventDefault();
      try {localStorage.setItem('zolotitsa-cookie-choice', button.id === 'cn-accept-cookie' ? 'accepted' : 'dismissed');} catch (_) {}
      notice.style.display = 'none';
    });
  }
  // Analytics and chat integrations are not enabled by this compatibility code.
});

document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.rmain-slider:has(.zolotitsa-hero-video)');
  const search = section?.querySelector('#block-search');
  if (!section || !search) return;
  const measure = () => section.style.setProperty('--hero-search-height', `${Math.ceil(search.getBoundingClientRect().height)}px`);
  measure();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measure).observe(search);
  window.addEventListener('resize', measure);
});

document.addEventListener('DOMContentLoaded', () => {
  const videos = [...document.querySelectorAll('.zolotitsa-hero-video')];
  if (!videos.length) return;
  const narrow = matchMedia('(max-width: 767px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function updateHero() {
    for (const video of videos) {
      const selected = video.classList.contains(narrow.matches ? 'hero-9x16' : 'hero-16x9');
      if (!selected || reduced.matches || navigator.connection?.saveData || !video.canPlayType('video/mp4; codecs="avc1.42E01E"')) {
        video.pause();
        if (video.hasAttribute('src')) { video.removeAttribute('src'); video.load(); }
        continue;
      }
      if (!video.getAttribute('src') && video.dataset.src) video.src = video.dataset.src;
      video.muted = true;
      video.play().catch(() => {});
    }
  }
  narrow.addEventListener('change', updateHero);
  reduced.addEventListener('change', updateHero);
  updateHero();
});

/* Prices (open) and presentations (after contacts) — #zl-docs. Booking buttons — phone/Telegram note (#zl-book). */
(function(){
  const EN = location.pathname.includes('/en/');
  const D = '/zolotitsa-preview/media/docs/';
  const T = EN ? {
    ttl:'Prices and presentations', prices:'Prices 2027 (PDF, in Russian)', pres:'Lodge presentations (PDF, in Russian)',
    lead:'Leave your contact details and the presentations will open right away.', name:'Your name *', phone:'Phone *', email:'Email',
    agree:'I agree to the processing of my personal data and accept the <a href="/zolotitsa-preview/en/privacy-policy/" target="_blank" rel="noopener">privacy policy</a>',
    btn:'Get presentations', err:'Please fill in your name, phone and tick the consent box.', done:'Thank you! The presentations are ready to download:', close:'Close',
    p:[['price-2027-accommodation-services.pdf','Accommodation, meals and additional services','1.8 MB']],
    r:[['presentation-general.pdf','About the lodge','10 MB'],['presentation-rooms.pdf','Rooms and facilities','9 MB']]
  } : {
    ttl:'Цены и презентации', prices:'Цены 2027 (PDF)', pres:'Презентации лоджа (PDF)',
    lead:'Оставьте контакты – и презентации откроются сразу.', name:'Ваше имя *', phone:'Телефон *', email:'Email',
    agree:'Даю <a href="/zolotitsa-preview/politika-konfidenczialnosti/#soglasie" target="_blank" rel="noopener">согласие</a> на обработку персональных данных и принимаю <a href="/zolotitsa-preview/politika-konfidenczialnosti/" target="_blank" rel="noopener">политику</a>',
    btn:'Получить презентации', err:'Заполните имя, телефон и отметьте согласие.', done:'Спасибо! Презентации готовы к скачиванию:', close:'Закрыть',
    p:[['price-2027-accommodation-services.pdf','Проживание, питание и дополнительные услуги','1,8 МБ']],
    r:[['presentation-general.pdf','О лодже','10 МБ'],['presentation-rooms.pdf','Номера и инфраструктура','9 МБ']]
  };
  const list = a => '<ul class="zl-docs__list">' + a.map(([f,t,s]) => `<li><a href="${D}${f}" target="_blank" rel="noopener">${t}</a><span>${s}</span></li>`).join('') + '</ul>';
  let box;
  function open(){
    if (!box) {
      box = document.createElement('div');
      box.className = 'zl-docs'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label',T.ttl);
      box.innerHTML = `<div class="zl-docs__panel"><button type="button" class="zl-docs__x" aria-label="${T.close}">×</button>
        <div class="zl-docs__ttl">${T.ttl}</div>
        <div class="zl-docs__h">${T.prices}</div>${list(T.p)}
        <div class="zl-docs__h">${T.pres}</div>
        <form class="zl-docs__form" novalidate><p>${T.lead}</p>
          <input name="your-name" autocomplete="name" placeholder="${T.name}" required>
          <input name="tel" type="tel" autocomplete="tel" placeholder="${T.phone}" required>
          <input name="your-email" type="email" autocomplete="email" placeholder="${T.email}">
          <label class="zl-docs__agree"><input type="checkbox" name="acceptance" required> <span>${T.agree}</span></label>
          <p class="zl-docs__err" role="alert" hidden>${T.err}</p>
          <button type="submit" class="zl-book-cta__btn">${T.btn}</button></form>
        <div class="zl-docs__ok" hidden><p>${T.done}</p>${list(T.r)}</div></div>`;
      document.body.append(box);
      box.addEventListener('click', e => { if (e.target === box || e.target.closest('.zl-docs__x')) close(); });
      const form = box.querySelector('form');
      form.addEventListener('submit', async e => {
        e.preventDefault(); e.stopImmediatePropagation();
        const v = Object.fromEntries(new FormData(form));
        const ok = (v['your-name']||'').trim() && (v.tel||'').replace(/\D/g,'').length >= 7 && v.acceptance;
        form.querySelector('.zl-docs__err').hidden = !!ok;
        if (!ok) return;
        const csrf = document.querySelector('meta[name="csrf-token"]');
        if (!location.hostname.endsWith('github.io') && csrf) {
          try { await fetch('/api/submissions/', {method:'POST', credentials:'same-origin',
            headers:{'Content-Type':'application/json','X-CSRFToken':csrf.content},
            body: JSON.stringify({form_id:'presentation-request', page_path: location.pathname, idempotency_key: crypto.randomUUID(), fields: v})}); } catch (_) {}
        }
        form.hidden = true; box.querySelector('.zl-docs__ok').hidden = false;
      }, true);
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('is-open')) close(); });
    }
    box.classList.add('is-open'); document.body.classList.add('zl-docs-open');
    box.querySelector('.zl-docs__x').focus();
  }
  function close(){ box.classList.remove('is-open'); document.body.classList.remove('zl-docs-open'); }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href$="#zl-docs"],a[href$="#zl-prices"],a[href$="#zl-book"]');
    if (!a) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (a.getAttribute('href').endsWith('#zl-book')) { if (window.zlNote) window.zlNote(); } else open();
  }, true);
})();

/* Room categories slider: arrows scroll the track by one card. */
document.addEventListener('DOMContentLoaded', () => {
  for (const box of document.querySelectorAll('.zl-place')) {
    const track = box.querySelector('.zl-place__track');
    const [prev, next] = box.querySelectorAll('.zl-place__btn');
    const step = () => { const c = track.children[0]; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(c).marginLeft) * 2 : track.clientWidth; };
    const update = () => { prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2; };
    prev.addEventListener('click', () => track.scrollBy({left: -step(), behavior: 'smooth'}));
    next.addEventListener('click', () => track.scrollBy({left: step(), behavior: 'smooth'}));
    track.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    update();
  }
});
