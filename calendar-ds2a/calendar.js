/* Progressive enhancement: dates and notes remain readable without JavaScript. */
(() => {
  'use strict';
  const DAY = 86400000;
  const ukDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit'
  });

  function dateKey(now) {
    const parts = Object.fromEntries(ukDate.formatToParts(now).map(p => [p.type, p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function deadlineState(date, cutoff, now) {
    const today = dateKey(now);
    const days = Math.round((Date.parse(date) - Date.parse(today)) / DAY);
    if (cutoff && now.getTime() >= Date.parse(cutoff)) {
      return { past: true, label: 'Deadline passed' };
    }
    if (days < 0) return { past: true, label: 'Date passed' };
    if (days === 0) return { past: false, label: cutoff ? 'Due today · by 16:00' : 'Due today' };
    return { past: false, label: `${days} ${days === 1 ? 'day' : 'days'} left` };
  }

  const weeks = [...document.querySelectorAll('.week')];
  const hidePast = document.querySelector('#hide-past');
  const jump = document.querySelector('#jump-current');
  const status = document.querySelector('#term-status');
  const todayLabel = document.querySelector('#today');
  let previousToday = '';
  let previousDeadlineState = '';

  // Keep the editable HTML simple; add disclosure controls as an enhancement.
  weeks.forEach(week => {
    const focus = week.querySelector('.week-focus');
    const heading = focus.querySelector('h3');
    const notes = week.querySelector('.commentary');
    const details = document.createElement('div');
    details.id = `${week.id}-details`;
    details.className = 'week-details';
    [...focus.children].filter(child => child !== heading).forEach(child => details.append(child));
    notes.id = `${week.id}-notes`;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'week-toggle';
    toggle.hidden = true;
    toggle.setAttribute('aria-controls', `${details.id} ${notes.id}`);
    toggle.setAttribute('aria-label', `Details for ${week.querySelector('.week-number').textContent}: ${heading.textContent}`);
    focus.append(toggle, details);
    toggle.addEventListener('click', () => setExpanded(week, toggle.getAttribute('aria-expanded') !== 'true'));
  });

  function setExpanded(week, expanded) {
    const toggle = week.querySelector('.week-toggle');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? '− details' : '+ details';
    week.classList.toggle('is-collapsed', !expanded);
    week.querySelector('.week-details').hidden = !expanded;
    week.querySelector('.commentary').hidden = !expanded;
  }

  function applyFilter() {
    weeks.forEach(week => { week.hidden = hidePast.checked && week.classList.contains('is-past'); });
  }

  function refresh() {
    const now = new Date();
    const today = dateKey(now);
    if (today !== previousToday) {
      let current = null;
      weeks.forEach(week => {
        const past = today >= week.dataset.end;
        const active = today >= week.dataset.start && today < week.dataset.end;
        const wasPast = week.classList.contains('is-past');
        week.classList.toggle('is-past', past);
        week.classList.toggle('is-current', active);
        week.querySelector('.week-toggle').hidden = !past;
        if (!past) setExpanded(week, true);
        else if (!wasPast) setExpanded(week, false);
        week.querySelector('.week-status').textContent = active ? 'This week' : past ? 'Past week' : '';
        if (active) { week.setAttribute('aria-current', 'date'); current = week; }
        else week.removeAttribute('aria-current');
      });
      const formatted = new Intl.DateTimeFormat('en-GB', {
        timeZone:'Europe/London', weekday:'long', day:'numeric', month:'long', year:'numeric'
      }).format(now);
      todayLabel.textContent = `Today · ${formatted}${current ? ` · ${current.querySelector('.week-number').textContent}` : ''}`;
      jump.hidden = !current;
      if (current) jump.href = `#${current.id}`;
      status.hidden = !!current;
      status.textContent = today < weeks[0].dataset.start ? 'The studio calendar starts on Monday 14 September 2026.' : 'This studio calendar has ended. You can still browse every week and submission date.';
      previousToday = today;
      applyFilter();
    }
    // Include the exact final cutoff, so a tab left open updates at 16:00.
    const deadlineSignature = today + (now.getTime() >= Date.parse('2026-12-09T16:00:00Z'));
    if (deadlineSignature !== previousDeadlineState) {
      document.querySelectorAll('.deadline').forEach(card => {
        const state = deadlineState(card.dataset.date, card.dataset.cutoff, now);
        card.classList.toggle('is-past', state.past);
        card.querySelector('.countdown').textContent = state.label;
      });
      previousDeadlineState = deadlineSignature;
    }
  }

  document.querySelector('.toolbar').hidden = false;
  hidePast.addEventListener('change', applyFilter);
  jump.addEventListener('click', () => {
    const current = weeks.find(week => week.classList.contains('is-current'));
    if (current) current.focus();
  });
  refresh();
  setInterval(refresh, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
