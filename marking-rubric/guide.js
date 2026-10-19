/* All assessment content is available without JavaScript. */
(() => {
  const filter = document.querySelector('#band-filter');
  document.querySelector('.band-control').hidden = false;
  filter.addEventListener('change', () => {
    document.querySelector('.official-rubric').classList.toggle('filtered', filter.value !== 'all');
    document.querySelectorAll('[data-band]').forEach(cell => {
      cell.hidden = filter.value !== 'all' && cell.dataset.band !== filter.value;
    });
  });

  let closedBeforePrint = [];
  window.addEventListener('beforeprint', () => {
    closedBeforePrint = [...document.querySelectorAll('details:not([open])')];
    closedBeforePrint.forEach(details => { details.open = true; });
  });
  window.addEventListener('afterprint', () => {
    closedBeforePrint.forEach(details => { details.open = false; });
  });

  const links = [...document.querySelectorAll('.index-nav li a')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-10% 0px -65% 0px' });
  document.querySelectorAll('[data-section]').forEach(section => observer.observe(section));
})();
