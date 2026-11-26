(() => {
  const dialog = document.querySelector('#lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const links = [...document.querySelectorAll('[data-viewer]')];
  const large = document.querySelector('#lightbox-image');
  const caption = document.querySelector('#lightbox-caption');
  const close = dialog.querySelector('[data-close]');
  let index = 0;
  let source = null;

  function showImage(at) {
    index = (at + links.length) % links.length;
    const link = links[index];
    const thumbnail = link.querySelector('img');
    large.src = link.href;
    large.alt = thumbnail.alt;
    caption.textContent = link.closest('figure').querySelector('figcaption').innerText;
  }

  links.forEach((link, at) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    source = link;
    showImage(at);
    dialog.showModal();
    document.body.classList.add('is-viewing');
    close.focus();
  }));
  close.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-prev]').addEventListener('click', () => showImage(index - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => showImage(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showImage(index + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('is-viewing');
    if (source) source.focus({preventScroll: true});
  });
})();
