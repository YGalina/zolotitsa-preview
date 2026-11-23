document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.rfilter_form');
  const loop = document.querySelector('.rprograms_loop');
  if (!form || !loop) return;
  const names = ['sezon', 'vidi_otdiha', 'geografiya', 'chto_posmotret', 'kategoriya'];
  const inputs = [...form.querySelectorAll('input[type="checkbox"]')];
  let controller;
  const panel = document.querySelector('.rfilter');
  const parent = panel?.parentNode;
  const next = panel?.nextSibling;
  function close() {
    document.body.classList.remove('popup-open'); panel?.classList.remove('active', 'rpopup');
    if (panel && parent && panel.parentNode !== parent) parent.insertBefore(panel, next?.parentNode === parent ? next : null);
  }
  async function render(updateURL) {
    controller?.abort(); controller = new AbortController();
    const url = new URL(location.href);
    if (updateURL) {
      for (const name of names) {
        const values = inputs.filter(i => i.name === name && i.checked).map(i => i.value);
        if (values.length) url.searchParams.set(name, values.join(',')); else url.searchParams.delete(name);
      }
      url.searchParams.delete('page');
      url.pathname = url.pathname.replace(/\/page\/\d+\/$/, '/');
      history.pushState(null, '', url);
    }
    for (const input of inputs) input.closest('label')?.classList.toggle('active', input.checked);
    const params = new URLSearchParams(url.search);
    const category = url.pathname.match(/\/kategoriya\/([^/]+)/)?.[1];
    if (category) params.set('category', category);
    if (url.pathname.startsWith('/en/')) params.set('lang', 'en');
    try {
      const response = await fetch('/api/programs/?' + params, {signal: controller.signal});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      loop.innerHTML = result.html;
      let pager = document.querySelector('.rprograms_pg');
      if (!pager) {pager = document.createElement('div'); pager.className = 'rprograms_pg'; loop.after(pager);}
      pager.innerHTML = result.pagination;
      window.lazySizes?.loader?.checkElems();
      window.__backendFiltersReady = true;
    } catch (error) { if (error.name !== 'AbortError') console.error(error); }
  }
  function readURL() {
    const params = new URLSearchParams(location.search);
    for (const input of inputs) input.checked = (params.get(input.name) || '').split(',').includes(input.value);
    render(false);
  }
  for (const input of inputs) input.addEventListener('change', () => render(true));
  for (const button of document.querySelectorAll('.clear-filter')) button.addEventListener('click', event => {
    event.preventDefault(); for (const input of inputs) input.checked = false; render(true); close();
  });
  for (const button of document.querySelectorAll('.open-filter')) button.addEventListener('click', event => {
    event.preventDefault();
    if (panel) {document.body.append(panel); document.body.classList.add('popup-open'); panel.classList.add('active', 'rpopup');}
  });
  for (const button of document.querySelectorAll('.apply-filter, .rfilter_close, .overlay')) button.addEventListener('click', close);
  window.addEventListener('popstate', readURL);
  readURL();
});
