/* Restore menu behavior where a legacy theme callback aborts on absent nodes.
   Existing markup, classes, content, and styles remain the source of the UI. */
document.addEventListener('DOMContentLoaded', () => {
  const bookingLayout = document.querySelector('[data-booking-appearance]')
    ? fetch('/__recovery/booking/layout.json').then(response => response.json()) : null;
  for (const widget of document.querySelectorAll('[data-booking-appearance]')) {
    const frame = widget.querySelector('iframe');
    async function resize() {
      const layout = await bookingLayout;
      const doc = frame.contentDocument;
      const root = doc?.getElementById('search-form-container');
      if (!root) return;
      const width = frame.getBoundingClientRect().width;
      let state = layout.initial_class;
      for (const mode of layout.thresholds) if (width >= mode.minimum_width) state = mode.class_name;
      for (const name of [...doc.body.classList]) if (name.startsWith('sf-state-')) doc.body.classList.remove(name);
      doc.body.classList.add(state);
      await doc.fonts.ready;
      frame.style.height = Math.ceil(root.getBoundingClientRect().height) + 'px';
    }
    resize();
    frame.addEventListener('load', resize);
    window.addEventListener('resize', resize);
    widget.addEventListener('click', () => {
      window.alert(widget.dataset.bookingAppearance === 'en'
        ? 'Online booking is not connected in this local copy.'
        : 'Онлайн-бронирование в локальной копии пока не подключено.');
    });
  }
  function closeMenu() {
    document.body.classList.remove('popup-open');
    for (const panel of document.querySelectorAll('.rpopup')) panel.classList.remove('active');
  }
  for (const button of document.querySelectorAll('.mob-menu-btn')) {
    button.addEventListener('click', () => queueMicrotask(() => {
      document.body.classList.add('popup-open');
      for (const panel of document.querySelectorAll('.rpopup')) panel.classList.add('active');
    }));
  }
  for (const button of document.querySelectorAll('.rpopup_close, .overlay')) {
    button.addEventListener('click', () => queueMicrotask(closeMenu));
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
});
