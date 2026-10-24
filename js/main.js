/* ==========================================================================
   main.js — Saken Seifullin Museum (Collection, Gallery & Visit/Feedback)
   ========================================================================== */
(() => {
  'use strict';

  // Вспомогательные селекторы
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const pad = n => String(n).padStart(2, '0');
  const fmt = n => `${n.toLocaleString('en-US')} ₸`;
  const localISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const el = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(`museum:${key}`)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(`museum:${key}`, JSON.stringify(value)); } catch { /* ignore */ }
    }
  };

  function setActive(buttons, active) {
    buttons.forEach(btn => {
      const on = btn === active;
      btn.classList.toggle('btn-success', on);
      btn.classList.toggle('btn-outline-success', !on);
      btn.classList.toggle('active', on);
    });
  }

  function check(input, ok, message) {
    if (!input) return ok;
    input.classList.toggle('is-invalid', !ok);
    input.classList.toggle('is-valid', ok && input.value.trim() !== '');
    const feedback = input.parentElement?.querySelector('.invalid-feedback');
    if (!ok && feedback && message) feedback.textContent = message;
    return ok;
  }

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const HOURS = { 0: [10, 17], 1: null, 2: [10, 18], 3: [10, 18], 4: [10, 18], 5: [10, 18], 6: [10, 17] };

  function museumStatus(now = new Date()) {
    const today = HOURS[now.getDay()];
    const hour = now.getHours();
    if (today && hour >= today[0] && hour < today[1]) {
      return { cls: 'bg-success', text: `🟢 Open now (until ${pad(today[1])}:00)` };
    }
    if (today && hour < today[0]) {
      return { cls: 'bg-warning text-dark', text: `🟡 Closed now (opens at ${pad(today[0])}:00)` };
    }
    for (let i = 1; i <= 7; i++) {
      const day = (now.getDay() + i) % 7;
      if (HOURS[day]) {
        const when = i === 1 ? 'tomorrow' : DAYS[day];
        return { cls: 'bg-danger', text: `🔴 Closed${today ? '' : ' (day off)'}, opens ${when} at ${pad(HOURS[day][0])}:00` };
      }
    }
  }

  /* ==========================================================================
     1. Глобальный UI (Toast, Scroll, Размер текста)
     ========================================================================== */
  function showToast(message) {
    let toast = $('#custom-toast');
    if (!toast) {
      toast = el('div', 'museum-toast');
      toast.id = 'custom-toast';
      toast.setAttribute('role', 'status');
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
  }
  window.showToast = showToast;

  function initTextSize() {
    let size = store.get('font', 100);
    const apply = () => { document.documentElement.style.fontSize = `${size}%`; };
    
    $('#btn-font-decrease')?.addEventListener('click', () => {
      size = Math.max(87.5, size - 12.5);
      store.set('font', size);
      apply();
      showToast(`Text size: ${Math.round(size)}%`);
    });
    $('#btn-font-increase')?.addEventListener('click', () => {
      size = Math.min(125, size + 12.5);
      store.set('font', size);
      apply();
      showToast(`Text size: ${Math.round(size)}%`);
    });
    $('#btn-font-reset')?.addEventListener('click', () => {
      size = 100;
      store.set('font', size);
      apply();
      showToast('Text size: 100%');
    });
    apply();
  }

  function initScrollUI() {
    const topBtn = $('#scrollTopBtn');
    if (!topBtn) return;

    window.addEventListener('scroll', () => {
      topBtn.classList.toggle('show', window.scrollY > 300);
    }, { passive: true });

    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     2. Страница Коллекции (exhibits.html)
     ========================================================================== */
  function initCollection() {
    const root = $('#exhibits-main-content');
    if (!root) return;

    const tbody = $('tbody', root);
    const grid = $('#exhibits-cards-grid');
    const searchInput = $('#collection-search');
    const sortSelect = $('#sort-exhibits');
    const chipButtons = $$('#collection-chips [data-type]');
    const countDisplay = $('#collection-count');
    const emptyState = $('#collection-empty');
    const clearBtn = $('#collection-clear');

    if (!tbody) return;

    const items = $$('tr', tbody).map(row => {
      const title = row.cells[0]?.textContent.trim() || '';
      const id = row.dataset.id;
      const card = $(`#exhibit-card-${id}`);
      return {
        id,
        row,
        card,
        title,
        sortTitle: title.replace(/^[^\p{L}\p{N}]+/u, ''),
        type: row.cells[1]?.textContent.trim().toLowerCase() || '',
        year: parseInt(row.cells[2]?.textContent, 10) || 0,
        text: row.textContent.toLowerCase(),
        imgSrc: $('img', card)?.getAttribute('src') || '',
        desc: $('.card-text', card)?.textContent.trim() || ''
      };
    });

    const state = { query: '', type: 'all', sort: 'default' };

    const sorters = {
      default: () => 0,
      'year-asc': (a, b) => a.year - b.year,
      'year-desc': (a, b) => b.year - a.year,
      'title-asc': (a, b) => a.sortTitle.localeCompare(b.sortTitle)
    };

    function render() {
      const q = state.query.toLowerCase().trim();
      let shown = 0;

      [...items].sort(sorters[state.sort]).forEach(item => {
        const visible = (state.type === 'all' || item.type === state.type) && item.text.includes(q);

        if (tbody && item.row) tbody.append(item.row);
        if (grid && item.card) grid.append(item.card);

        if (item.row) item.row.hidden = !visible;
        if (item.card) item.card.hidden = !visible;

        if (visible) shown++;
      });

      if (countDisplay) {
        countDisplay.textContent = `Showing ${shown} of ${items.length} exhibits`;
      }
      if (emptyState) {
        emptyState.hidden = shown > 0;
      }
    }

    searchInput?.addEventListener('input', e => {
      state.query = e.target.value;
      render();
    });

    sortSelect?.addEventListener('change', e => {
      state.sort = e.target.value;
      render();
    });

    chipButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setActive(chipButtons, btn);
        state.type = btn.dataset.type || 'all';
        render();
      });
    });

    clearBtn?.addEventListener('click', () => {
      state.query = '';
      state.type = 'all';
      state.sort = 'default';

      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'default';

      if (chipButtons.length) setActive(chipButtons, chipButtons[0]);
      render();
    });

    // --- НАПОЛНЕНИЕ ПРЕМИУМ-МОДАЛКИ ПРИ ОТКРЫТИИ ---
    const modalEl = $('#exhibitModal');
    if (modalEl) {
      $$('tbody tr, #exhibits-cards-grid .card', root).forEach(trigger => {
        trigger.tabIndex = 0;
        trigger.setAttribute('role', 'button');
        trigger.dataset.bsToggle = 'modal';
        trigger.dataset.bsTarget = '#exhibitModal';

        trigger.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger.click();
          }
        });
      });

      modalEl.addEventListener('show.bs.modal', e => {
        const trigger = e.relatedTarget?.closest('[data-id]') || e.relatedTarget;
        const id = trigger?.dataset?.id || '1';
        const card = $(`#exhibit-card-${id}`);
        if (!card) return;

        const title = $('.card-title', card)?.textContent.trim() || '';
        const img = $('img', card);
        const badges = $$('.badge', card);
        const typeText = badges[0]?.textContent.trim() || 'Artifact';
        const yearText = badges[1]?.textContent.trim() || 'Historical Era';
        const desc = $('.card-text', card)?.textContent.trim() || '';

        const modalTitle = $('#exhibitModalLabel');
        const modalImg = $('#modal-exhibit-img');
        const modalMeta = $('#modal-exhibit-meta');
        const modalDesc = $('#modal-exhibit-desc');
        const modalInv = $('#modal-exhibit-inv');

        if (modalTitle) modalTitle.textContent = title;
        if (modalImg && img) {
          modalImg.src = img.getAttribute('src');
          modalImg.alt = title;
        }
        if (modalInv) modalInv.textContent = `INV-1927/0${id}`;
        if (modalMeta) {
          modalMeta.innerHTML = `
            <span class="badge bg-primary fs-6">${typeText}</span>
            <span class="badge bg-light text-dark border fs-6">${yearText}</span>
            <span class="badge bg-success-subtle text-success border border-success fs-6">🟢 Original Artifact</span>
          `;
        }
        if (modalDesc) modalDesc.textContent = desc;

        // По умолчанию активируем первую вкладку Overview
        const firstTab = $('#overview-tab');
        if (firstTab && window.bootstrap) {
          bootstrap.Tab.getOrCreateInstance(firstTab).show();
        }
      });

      // Обработка кнопок аудио и зума
      $('#btn-modal-audio')?.addEventListener('click', () => {
        showToast('🎧 Playing audio guide overview...');
      });
      $('#btn-modal-zoom')?.addEventListener('click', () => {
        showToast('🔍 HD Image preview ready.');
      });
    }

    render();
  }

  /* ==========================================================================
     3. Страница Галереи (gallery.html)
     ========================================================================== */
  const HOTSPOTS = [
    [
      { x: 28, y: 62, title: 'Traditional furniture', text: 'Wooden furniture arranged to recreate the atmosphere of the writer\'s era.' },
      { x: 62, y: 48, title: 'Period interior', text: 'The room is furnished to show how people lived and worked in the early 20th century.' }
    ],
    [
      { x: 30, y: 40, title: 'Clock', text: 'A historical clock preserved in the showcase with other everyday objects.' },
      { x: 55, y: 62, title: 'Dishes', text: 'Household dishes that belonged to the period and are kept behind glass.' },
      { x: 78, y: 45, title: 'Personal items', text: 'Rare personal items that help visitors imagine the writer\'s daily life.' }
    ],
    [
      { x: 50, y: 40, title: 'Authentic suit', text: 'A suit reflecting early 20th-century fashion, displayed in a glass showcase.' },
      { x: 50, y: 80, title: 'Glass showcase', text: 'A protective display that preserves the fabric and stitching.' }
    ]
  ];

  const FACTS = [
    'Saken Seifullin is regarded as one of the founders of modern Kazakh literature.',
    'Seifullin was a poet, a prose writer and a public figure at the same time.',
    'His autobiographical novel "Thorny Path" is one of his best-known prose works.',
    '"Asau Tulpar" ("The Wild Steed") is one of his famous collections of poetry.',
    'This museum keeps a manuscript of one of his poems dated 1922.',
    'The collection includes a 1936 petition written by his wife, Gulbakhram Seifullina, in support of her husband.',
    'After the repressions of the 1930s, Seifullin was rehabilitated posthumously in the 1950s.'
  ];

  function initGallery() {
    const galleryRoot = $('#gallery-main-content');
    if (!galleryRoot) return;

    const factBtn = $('#btn-fact-of-day');
    const factBox = $('#fact-container');
    let factIndex = 0;

    if (factBtn && factBox) {
      factBtn.addEventListener('click', () => {
        factBox.classList.remove('d-none');
        factBox.hidden = false;
        factBox.textContent = '';
        
        const strong = document.createElement('strong');
        strong.textContent = '💡 Fact of the Day: ';
        factBox.append(strong, document.createTextNode(FACTS[factIndex]));

        factIndex = (factIndex + 1) % FACTS.length;
        factBtn.textContent = '💡 Another fact';
      });
    }

    const carousel = $('#museumCarousel');
    if (carousel) {
      carousel.addEventListener('slid.bs.carousel', e => {
        const counter = $('#photo-counter');
        if (counter) counter.textContent = `Photo ${e.to + 1} of 3`;
      });
    }

    const modalEl = $('#lightboxModal');
    if (!modalEl) return;

    const cards = $$('.gallery-card-col');
    const photos = cards.map(card => ({
      src: $('img', card)?.getAttribute('src') || '',
      title: $('.card-title', card)?.textContent.trim() || '',
      desc: $('.card-text', card)?.textContent.trim() || '',
      tag: $('.badge', card)?.textContent.trim() || 'Interior'
    }));

    const wrap = $('#lightbox-img-wrapper');
    const img = $('#lightbox-img');
    const spots = $('#hotspots-container');
    const focusTitle = $('#hotspot-focus-title');
    const focusDesc = $('#hotspot-focus-desc');
    const defaults = { 
      title: focusTitle?.textContent || '📍 Interactive Hotspots', 
      desc: focusDesc?.textContent.trim() || 'Hover or click on any pulsing gold marker on the photograph to inspect highlighted artifacts.' 
    };

    const found = photos.map(() => new Set());
    let index = 0;
    let zoom = 1;
    let pan = { x: 0, y: 0 };

    function renderZoom() {
      if (!wrap) return;
      const limitX = (wrap.offsetWidth * (zoom - 1)) / 2;
      const limitY = (wrap.offsetHeight * (zoom - 1)) / 2;
      pan.x = Math.max(-limitX, Math.min(limitX, pan.x));
      pan.y = Math.max(-limitY, Math.min(limitY, pan.y));
      wrap.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
      wrap.classList.toggle('zoomed', zoom > 1);
      const zoomResetBtn = $('#btn-gallery-zoom-reset');
      if (zoomResetBtn) zoomResetBtn.textContent = `${Math.round(zoom * 100)}%`;
    }

    function setZoom(value) {
      zoom = Math.min(3, Math.max(1, value));
      if (zoom === 1) pan = { x: 0, y: 0 };
      renderZoom();
    }

    function inspect(hotspot, n, button) {
      if (spots) $$('.hotspot', spots).forEach(b => b.classList.toggle('active', b === button));
      const isNew = !found[index].has(n);
      found[index].add(n);
      const total = (HOTSPOTS[index] || []).length;
      if (focusTitle) focusTitle.textContent = `📍 ${hotspot.title}`;
      if (focusDesc) focusDesc.textContent = `${hotspot.text} (${found[index].size}/${total} details found)`;
      if (isNew && found[index].size === total) showToast('🔎 You found every detail in this photo!');
    }

    function show(i) {
      index = (i + photos.length) % photos.length;
      const photo = photos[index] || photos[0];
      if (img) {
        img.src = photo.src;
        img.alt = photo.title;
      }
      
      const cardTitle = $('#lightbox-card-title');
      const descEl = $('#lightbox-desc');
      const tagEl = $('#lightbox-tag');

      if (cardTitle) cardTitle.textContent = photo.title;
      if (descEl) descEl.textContent = photo.desc;
      if (tagEl) tagEl.textContent = photo.tag;
      if (focusTitle) focusTitle.textContent = defaults.title;
      if (focusDesc) focusDesc.textContent = defaults.desc;
      setZoom(1);

      if (spots) {
        spots.replaceChildren(...(HOTSPOTS[index] || []).map((hotspot, n) => {
          const button = el('button', 'hotspot');
          button.type = 'button';
          button.style.left = `${hotspot.x}%`;
          button.style.top = `${hotspot.y}%`;
          button.setAttribute('aria-label', hotspot.title);
          ['mouseenter', 'focus', 'click'].forEach(type => button.addEventListener(type, () => inspect(hotspot, n, button)));
          return button;
        }));
      }
    }

    const openModal = i => {
      show(i);
      if (window.bootstrap && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      }
    };

    $$('#museumCarousel .carousel-item').forEach((slide, idx) => {
      slide.style.cursor = 'pointer';
      slide.addEventListener('click', () => openModal(idx));
    });

    cards.forEach((card, idx) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => openModal(idx));
    });

    $('#btn-lightbox-prev')?.addEventListener('click', () => show(index - 1));
    $('#btn-lightbox-next')?.addEventListener('click', () => show(index + 1));
    $('#btn-gallery-zoom-in')?.addEventListener('click', () => setZoom(zoom + 0.5));
    $('#btn-gallery-zoom-out')?.addEventListener('click', () => setZoom(zoom - 0.5));
    $('#btn-gallery-zoom-reset')?.addEventListener('click', () => setZoom(1));
    modalEl.addEventListener('hidden.bs.modal', () => setZoom(1));
  }

  /* ==========================================================================
     4. Страница Посещения и Отзывов (feedback.html)
     ========================================================================== */
  function initVisit() {
    const form = $('#excursion-form');
    if (!form) return;

    const PRICES = { adult: 1000, student: 500, senior: 300, group: 600 };
    const NAME_RE = /^\p{L}[\p{L}'’.-]*(\s+\p{L}[\p{L}'’.-]*)+$/u;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const isGroup = () => $('#type-group')?.checked || false;
    const qty = selector => Math.max(0, parseInt($(selector)?.value, 10) || 0);
    const dateInput = $('#visit-date');
    const timeSelect = $('#visit-time');
    if (dateInput) dateInput.min = localISO(new Date());

    function syncVisitType() {
      $('#calculator-individual')?.classList.toggle('d-none', isGroup());
      $('#calculator-group')?.classList.toggle('d-none', !isGroup());
      $('#group-org-block')?.classList.toggle('d-none', !isGroup());
    }

    function fillSlots() {
      if (!dateInput || !timeSelect) return;
      const value = dateInput.value;
      const hours = value ? HOURS[new Date(`${value}T00:00`).getDay()] : undefined;
      const now = new Date();
      const slots = [];
      if (hours) {
        for (let h = hours[0]; h < hours[1]; h++) {
          if (value === localISO(now) && h <= now.getHours()) continue;
          slots.push(new Option(`${pad(h)}:00 – ${pad(h + 1)}:00`, `${pad(h)}:00`));
        }
      }
      const placeholder = !value ? 'Select date first...' : !hours ? 'Museum is closed this day' : slots.length ? 'Select a time slot...' : 'No slots left today';
      timeSelect.replaceChildren(new Option(placeholder, '', true, true), ...slots);
      timeSelect.options[0].disabled = true;
      timeSelect.classList.remove('is-valid', 'is-invalid');
    }

    function getOrder() {
      const lines = [];
      let people = 0;
      let saved = 0;
      if (isGroup()) {
        people = qty('#qty-group-people');
        lines.push([`Group tariff × ${people}`, people * PRICES.group]);
        saved = people * (PRICES.adult - PRICES.group);
      } else {
        [['adult', 'Adult'], ['student', 'Student'], ['senior', 'Child / Senior']].forEach(([key, label]) => {
          const n = qty(`#qty-${key}`);
          people += n;
          if (n) lines.push([`${label} × ${n}`, n * PRICES[key]]);
        });
      }
      $$('.extra-service:checked').forEach(box => {
        lines.push([box.nextElementSibling.textContent.replace(/\s*\(.*\)/, ''), Number(box.value)]);
      });
      return { lines, people, saved, total: lines.reduce((sum, line) => sum + line[1], 0) };
    }

    function renderReceipt(box, order) {
      if (!box) return;
      const rows = order.lines.map(([label, sum]) => {
        const row = el('div', 'receipt-row');
        row.append(el('span', '', label), el('span', '', fmt(sum)));
        return row;
      });
      box.replaceChildren(...rows);
      if (!order.people) box.append(el('div', 'text-danger', 'Add at least one ticket to continue.'));
      if (order.saved) box.append(el('div', 'receipt-saved', `You save ${fmt(order.saved)} compared with adult tickets.`));
    }

    function renderOrder() {
      const order = getOrder();
      renderReceipt($('#price-breakdown-list'), order);
      const totalDisplay = $('#total-price-display');
      if (totalDisplay) totalDisplay.textContent = fmt(order.total);
      return order;
    }

    const rules = {
      'visitor-name': v => NAME_RE.test(v.trim()) || 'Please enter your first and last name.',
      'visitor-email': v => EMAIL_RE.test(v.trim()) || 'Please provide a valid email, e.g. name@example.com.',
      'org-name': v => !isGroup() || v.trim().length >= 2 || 'Please enter the name of your organization.',
      'qty-group-people': v => !isGroup() || parseInt(v, 10) >= 10 || 'The large group tariff starts from 10 people.',
      'visit-time': v => Boolean(v) || 'Please select a time slot.',
      'visit-date': v => {
        if (!v) return 'Please choose a date.';
        if (v < dateInput.min) return 'The date cannot be in the past.';
        return HOURS[new Date(`${v}T00:00`).getDay()] ? true : 'The museum is closed on Mondays. Please choose Tue–Sun.';
      }
    };

    const validate = input => {
      if (!input || !rules[input.id]) return true;
      const result = rules[input.id](input.value);
      return check(input, result === true, result);
    };

    form.addEventListener('input', e => {
      const target = e.target;
      if (target.name === 'visitType') syncVisitType();
      if (target === dateInput) { fillSlots(); validate(dateInput); }
      else if (rules[target.id] && (target.classList.contains('is-valid') || target.classList.contains('is-invalid'))) validate(target);
      renderOrder();
    });

    form.addEventListener('change', e => {
      if (e.target === timeSelect || e.target === dateInput) validate(e.target);
    });

    form.addEventListener('reset', () => setTimeout(() => {
      $$('.is-valid, .is-invalid', form).forEach(node => node.classList.remove('is-valid', 'is-invalid'));
      syncVisitType();
      fillSlots();
      renderOrder();
    }, 0));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const ids = ['visitor-name', 'visitor-email', 'visit-date', 'visit-time'];
      if (isGroup()) ids.push('org-name', 'qty-group-people');
      const invalid = ids.map(id => $(`#${id}`)).filter(input => !validate(input));
      const order = renderOrder();

      if (invalid.length) {
        invalid[0].focus();
        showToast('Please fix the highlighted fields.');
        return;
      }
      if (!order.people) {
        $('#qty-adult')?.focus();
        showToast('Please add at least one ticket.');
        return;
      }

      const modalEl = $('#bookingPreviewModal');
      if (modalEl && window.bootstrap) {
        const prettyDate = new Date(`${dateInput.value}T00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        $('#prev-name').textContent = $('#visitor-name')?.value.trim() || '';
        $('#prev-email').textContent = $('#visitor-email')?.value.trim() || '';
        $('#prev-datetime').textContent = `${prettyDate}, ${timeSelect.selectedOptions[0]?.text || ''}`;
        $('#prev-type').textContent = isGroup() ? `Large group, ${$('#org-name')?.value.trim() || ''}` : 'Individual / small group';
        renderReceipt($('#prev-breakdown'), order);
        $('#prev-total').textContent = fmt(order.total);
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      }
    });

    $('#btn-confirm-demo-submit')?.addEventListener('click', () => {
      const modalEl = $('#bookingPreviewModal');
      if (modalEl && window.bootstrap) {
        bootstrap.Modal.getInstance(modalEl)?.hide();
      }
      form.reset();
      showToast('✅ Excursion request successfully submitted!');
    });

    syncVisitType();
    fillSlots();
    renderOrder();
  }

  function initReview() {
    const form = $('#feedback-form');
    if (!form) return;

    const stars = $$('#rating-container span');
    const text = $('#feedback-text');
    const counter = $('#char-counter');
    const labels = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
    const categories = $$('#review-categories button');
    let rating = 0;
    let category = $('#review-categories .active')?.dataset.cat || 'Exhibits';

    const paint = n => {
      stars.forEach((star, i) => {
        star.classList.toggle('on', i < n);
        star.classList.toggle('off', i >= n);
      });
      const lbl = $('#rating-label');
      if (lbl) lbl.textContent = n ? `${n}/5 — ${labels[n - 1]}` : 'Click a star to rate';
    };

    stars.forEach((star, i) => {
      star.tabIndex = 0;
      star.setAttribute('role', 'button');
      star.addEventListener('mouseenter', () => paint(i + 1));
      star.addEventListener('click', () => {
        rating = i + 1;
        const err = $('#rating-error');
        if (err) err.textContent = '';
        paint(rating);
      });
    });

    $('#rating-container')?.addEventListener('mouseleave', () => paint(rating));
    paint(0);

    categories.forEach(btn => btn.addEventListener('click', () => {
      category = btn.dataset.cat;
      setActive(categories, btn);
    }));

    text?.addEventListener('input', () => {
      if (counter && text) {
        counter.textContent = `${text.value.length} / ${text.maxLength}`;
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const val = text ? text.value.trim() : '';

      if (!rating) {
        const err = $('#rating-error');
        if (err) err.textContent = 'Please choose a rating from 1 to 5 stars.';
        return;
      }
      if (val.length < 10) {
        text?.classList.add('is-invalid');
        return;
      }

      text?.classList.remove('is-invalid');
      const area = $('#feedback-response-area');
      if (area) {
        area.className = 'mt-3 p-3 rounded alert alert-success';
        area.textContent = `🙏 Thank you! Your ${rating}/5 review about "${category}" was submitted.`;
      }

      form.reset();
      rating = 0;
      paint(0);
      if (counter && text) counter.textContent = `0 / ${text.maxLength}`;
    });
  }

  function initContacts() {
    const badge = $('#museum-status-badge');
    if (badge) {
      const status = museumStatus();
      badge.className = `badge ${status.cls} px-3 py-2 fs-6`;
      badge.textContent = status.text;
    }
  }

  /* ==========================================================================
     Запуск всех модулей
     ========================================================================== */
  function init() {
    initTextSize();
    initScrollUI();
    initCollection();
    initGallery();
    initVisit();
    initReview();
    initContacts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();