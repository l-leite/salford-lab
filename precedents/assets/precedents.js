/* Filter the retained image index. No storage, dependencies or build step. */
(() => {
  const form = document.querySelector('#filters');
  if (!form) return;
  const projects = JSON.parse(document.querySelector('#project-data').textContent);
  const fields = Object.fromEntries(['q', 'mode', 'token', 'lens'].map(key => [key, form.elements[key]]));
  const cards = [...document.querySelectorAll('.project-card')];
  const count = document.querySelector('#count');
  function tokenOptions(selected = '') {
    fields.token.replaceChildren(new Option('All keywords', ''));
    for (const mode of ['think', 'make', 'show']) {
      if (fields.mode.value && fields.mode.value !== mode) continue;
      const group = document.createElement('optgroup');
      group.label = mode.toUpperCase();
      const tokens = [...new Set(projects.flatMap(p => p.tokens[mode] || []))].sort();
      tokens.forEach(token => group.append(new Option(token, `${mode}:${token}`)));
      fields.token.append(group);
    }
    if ([...fields.token.options].some(option => option.value === selected)) fields.token.value = selected;
  }
  function render() {
    const query = fields.q.value.trim().toLowerCase();
    const [tokenMode, token] = fields.token.value.split(':');
    const visible = projects.map(project => {
      const text = JSON.stringify(project).toLowerCase();
      return (!query || text.includes(query)) && (!fields.mode.value || !!project.tokens[fields.mode.value]?.length) &&
        (!token || (project.tokens[tokenMode] || []).includes(token)) && (!fields.lens.value || project.lenses.includes(fields.lens.value));
    });
    cards.forEach((card, i) => { card.hidden = !visible[i]; });
    const total = visible.filter(Boolean).length;
    count.textContent = `${total} of ${projects.length} projects`;
    document.querySelector('#empty').hidden = total !== 0;
    const url = new URL(location.href);
    url.search = '';
    for (const [key, field] of Object.entries(fields)) if (field.value) url.searchParams.set(key, field.value);
    // file:// previews can disallow history changes. Filtering still works there.
    try { history.replaceState(null, '', url); } catch { /* Local file preview. */ }
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    fields.q.value = params.get('q') || '';
    fields.mode.value = params.get('mode') || '';
    fields.lens.value = params.get('lens') || '';
    tokenOptions(params.get('token') || '');
    render();
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', event => {
    if (event.target === fields.mode) tokenOptions(fields.token.value);
    render();
  });
  form.addEventListener('reset', () => {
    // The reset event precedes the browser restoring native defaults.
    setTimeout(() => { tokenOptions(); render(); fields.q.focus(); }, 0);
  });
  window.addEventListener('popstate', restore);
  restore();
  form.hidden = false;
})();
