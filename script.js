(() => {
  const dialog = document.querySelector('.lightbox');
  const links = [...document.querySelectorAll('.photo-open')];
  if (!dialog || !links.length) return;
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  let current = 0;
  let opener;
  function show(index) {
    current = (index + links.length) % links.length;
    const source = links[current].querySelector('img');
    image.src = links[current].href;
    image.alt = source.alt;
    caption.textContent = `${source.alt} · ${current + 1} / ${links.length}`;
  }
  links.forEach((link, i) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    show(i);
    dialog.showModal();
    dialog.querySelector('.lightbox-close').focus();
  }));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); show(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('close', () => opener?.focus());
})();
