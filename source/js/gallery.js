(() => {
  // Forward native button keyboard activation to Butterfly's image lightbox.
  document.querySelectorAll('.gallery-open').forEach(button => {
    const image = button.querySelector('img');
    button.addEventListener('click', event => {
      if (event.target === button) image.click();
    });
    image.addEventListener('medium-zoom:closed', () => button.focus({ preventScroll: true }));
  });
})();
