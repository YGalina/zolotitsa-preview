window.zlNote=function(kind){let n=document.getElementById('zl-booking-note');if(!n){n=document.createElement('div');n.id='zl-booking-note';n.setAttribute('role','status');n.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483000;max-width:min(560px,calc(100vw - 32px));padding:16px 24px;background:#30373f;color:#fff;border:1px solid rgba(195,143,65,.6);border-radius:40px;font:14px/1.45 Montserrat-Medium,sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.35)';document.body.append(n);}n.innerHTML=location.pathname.includes('/en/')?(kind==='form'?'Online requests will open soon. Please call ':'Online booking will be available after the booking system is connected. Call ')+'<a href="tel:+79210854655" style="color:#c38f41">+7&nbsp;(921)&nbsp;085-46-55</a>':(kind==='form'?'Отправка заявок с сайта появится скоро. Пока – по&nbsp;телефону ':'Онлайн-бронирование появится после подключения системы. Пока – по&nbsp;телефону ')+'<a href="tel:+79210854655" style="color:#c38f41">+7&nbsp;(921)&nbsp;085-46-55</a>';n.hidden=false;clearTimeout(n._t);n._t=setTimeout(()=>{n.hidden=true},6000);};

/* Public static preview has no active booking service. */
document.addEventListener('click',function(e){const a=e.target.closest('a[href]');if(!a)return;const href=a.getAttribute('href')||'';if(href.includes('tl-booking-open')||href.includes('#block-search')){e.preventDefault();e.stopImmediatePropagation();window.zlNote();}},true);
/* Local backend only. Historic WordPress writes stay disabled. */
document.addEventListener('submit', async event => {
  const form = event.target;
  if (!form.matches('[data-backend-form]')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
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
