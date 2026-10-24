'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // 1. Scroll to Top
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.innerHTML = '↑';
  scrollTopBtn.id = 'scrollTopBtn';
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
  scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: #198754;
    color: white;
    border: none;
    font-size: 20px;
    cursor: pointer;
    display: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    z-index: 1000;
    transition: all 0.3s ease;
  `;
  document.body.appendChild(scrollTopBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.style.display = 'block';
    } else {
      scrollTopBtn.style.display = 'none';
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 2. Museum History Interactive Timeline Logic
  const timelineData = {
    "1984": {
      subtitle: "Official Opening",
      title: "Establishment of the State Museum",
      desc: "On July 9, 1984, the museum officially opened its doors in a historical wooden merchant house built in the late 19th century in Akmolinsk."
    },
    "1998": {
      subtitle: "Capital Relocation",
      title: "Historical Restoration & Status Growth",
      desc: "When Astana became the new capital of Kazakhstan, the museum underwent major architectural restoration and expanded its collection with rare personal manuscripts."
    },
    "2014": {
      subtitle: "30th Anniversary",
      title: "Collection Expansion & International Recognition",
      desc: "The museum celebrated 30 years of operation, hosting international literary conferences and opening new halls dedicated to Saken Seifullin's contemporaries."
    },
    "2024": {
      subtitle: "Digital Epoch",
      title: "Modern Interactive Exhibits & Digitalization",
      desc: "Full digitalization of archive documents, introduction of interactive multimedia guides, and restoration of authentic personal items."
    }
  };

  const timelineBtns = document.querySelectorAll('.timeline-year-btn');
  if (timelineBtns.length > 0) {
    timelineBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timelineBtns.forEach(b => {
          b.classList.remove('btn-success', 'active');
          b.classList.add('btn-outline-success');
        });
        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'active');

        const year = btn.getAttribute('data-year');
        const data = timelineData[year];
        if (data) {
          document.getElementById('timeline-badge').innerText = year;
          document.getElementById('timeline-subtitle').innerText = data.subtitle;
          document.getElementById('timeline-title').innerText = data.title;
          document.getElementById('timeline-desc').innerText = data.desc;
        }
      });
    });
  }

  // 3. Poetry Wall & Interactive Modal Logic
  const poemTriggers = document.querySelectorAll('.poem-modal-trigger');
  if (poemTriggers.length > 0) {
    let currentModalText = '';
    let currentLang = 'eng';

    poemTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const title = trigger.getAttribute('data-title') || '';
        const meta = trigger.getAttribute('data-meta') || '';
        const badge = trigger.getAttribute('data-badge') || '';
        const eng = trigger.getAttribute('data-eng') || '';
        const kaz = trigger.getAttribute('data-kaz') || '';
        const desc = trigger.getAttribute('data-desc') || '';

        document.getElementById('poemModalLabel').innerText = title;
        document.getElementById('modal-poem-meta').innerText = meta;
        document.getElementById('modal-poem-badge').innerText = badge;
        document.getElementById('modal-poem-quote').innerHTML = currentLang === 'kaz' ? kaz : eng;
        document.getElementById('modal-poem-kaz').innerHTML = kaz;
        document.getElementById('modal-poem-desc').innerText = desc;

        currentModalText = `${currentLang === 'kaz' ? kaz : eng} — Saken Seifullin (${title})`;
      });
    });

    const modalAudioBtn = document.getElementById('modal-audio-btn');
    if (modalAudioBtn) {
      modalAudioBtn.addEventListener('click', () => {
        const quoteToSpeak = document.getElementById('modal-poem-quote').innerText;
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(quoteToSpeak);
          utterance.lang = currentLang === 'kaz' ? 'kk-KZ' : 'en-US';
          window.speechSynthesis.speak(utterance);
          showToast('🔊 Reading quote aloud...');
        }
      });
    }

    const modalCopyBtn = document.getElementById('modal-copy-btn');
    if (modalCopyBtn) {
      modalCopyBtn.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(currentModalText).then(() => {
            showToast('Poem copied to clipboard!');
          });
        }
      });
    }

    const filterBtns = document.querySelectorAll('.filter-btn');
    const poemCols = document.querySelectorAll('.poem-card-col');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('btn-success', 'active');
          b.classList.add('btn-outline-success');
        });
        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'active');

        const cat = btn.getAttribute('data-category');
        poemCols.forEach(col => {
          col.style.display = (cat === 'all' || col.getAttribute('data-category') === cat) ? 'block' : 'none';
        });
      });
    });

    const searchInput = document.getElementById('poetry-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        poemCols.forEach(col => {
          const text = col.innerText.toLowerCase();
          col.style.display = text.includes(val) ? 'block' : 'none';
        });
      });
    }

    const btnEng = document.getElementById('lang-eng');
    const btnKaz = document.getElementById('lang-kaz');

    if (btnEng && btnKaz) {
      btnEng.addEventListener('click', () => {
        currentLang = 'eng';
        btnEng.className = 'btn btn-success btn-sm rounded-pill px-3 active';
        btnKaz.className = 'btn btn-outline-success btn-sm rounded-pill px-3 border-0';
        updatePoetryLanguage('eng');
      });

      btnKaz.addEventListener('click', () => {
        currentLang = 'kaz';
        btnKaz.className = 'btn btn-success btn-sm rounded-pill px-3 active';
        btnEng.className = 'btn btn-outline-success btn-sm rounded-pill px-3 border-0';
        updatePoetryLanguage('kaz');
      });
    }

    function updatePoetryLanguage(lang) {
      document.querySelectorAll('.poem-modal-trigger').forEach(card => {
        const p = card.querySelector('.poem-text');
        const val = card.getAttribute(`data-${lang}`);
        if (p && val) p.innerHTML = val;
      });
    }
  }

  // 4. Exhibits Search & Filter & Modal
  const exhibitTriggers = document.querySelectorAll('.exhibit-modal-trigger');
  if (exhibitTriggers.length > 0) {
    exhibitTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        document.getElementById('exhibitModalTitle').innerText = trigger.getAttribute('data-title') || '';
        document.getElementById('exhibitModalInv').innerText = trigger.getAttribute('data-inv') || '';
        document.getElementById('exhibitModalYear').innerText = `Year: ${trigger.getAttribute('data-year') || ''}`;
        document.getElementById('exhibitModalDesc').innerText = trigger.getAttribute('data-desc') || '';
      });
    });

    const exFilterBtns = document.querySelectorAll('.filter-exhibit-btn');
    const exCols = document.querySelectorAll('.exhibit-card-col');

    exFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        exFilterBtns.forEach(b => {
          b.classList.remove('btn-success', 'active');
          b.classList.add('btn-outline-success');
        });
        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'active');

        const cat = btn.getAttribute('data-category');
        exCols.forEach(col => {
          col.style.display = (cat === 'all' || col.getAttribute('data-category') === cat) ? 'block' : 'none';
        });
      });
    });

    const exSearchInput = document.getElementById('exhibit-search');
    if (exSearchInput) {
      exSearchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        exCols.forEach(col => {
          col.style.display = col.innerText.toLowerCase().includes(val) ? 'block' : 'none';
        });
      });
    }
  }

  // 5. Gallery Filter & Lightbox
  const galleryTriggers = document.querySelectorAll('.gallery-lightbox-trigger');
  if (galleryTriggers.length > 0) {
    galleryTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        document.getElementById('lightbox-img').src = trigger.getAttribute('data-img') || '';
        document.getElementById('lightbox-caption').innerText = trigger.getAttribute('data-caption') || '';
      });
    });

    const gFilterBtns = document.querySelectorAll('.filter-gallery-btn');
    const gCols = document.querySelectorAll('.gallery-card-col');

    gFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        gFilterBtns.forEach(b => {
          b.classList.remove('btn-success', 'active');
          b.classList.add('btn-outline-success');
        });
        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'active');

        const cat = btn.getAttribute('data-category');
        gCols.forEach(col => {
          col.style.display = (cat === 'all' || col.getAttribute('data-category') === cat) ? 'block' : 'none';
        });
      });
    });
  }

  // 6. Feedback Page Ticket Calculator & Booking & Reviews
  const adultInput = document.getElementById('adult-tickets');
  const studentInput = document.getElementById('student-tickets');
  const totalPriceDisplay = document.getElementById('total-price-display');

  if (adultInput && studentInput && totalPriceDisplay) {
    const calculateTotal = () => {
      const adults = parseInt(adultInput.value) || 0;
      const students = parseInt(studentInput.value) || 0;
      const total = (adults * 1000) + (students * 500);
      totalPriceDisplay.innerText = `${total} KZT`;
    };

    adultInput.addEventListener('input', calculateTotal);
    studentInput.addEventListener('input', calculateTotal);
  }

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('✅ Tour reservation successfully booked!');
      bookingForm.reset();
    });
  }

  const reviewForm = document.getElementById('review-form');
  const reviewsFeed = document.getElementById('reviews-feed');

  if (reviewForm && reviewsFeed) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('review-name').value.trim();
      const rating = document.getElementById('review-rating').value;
      const text = document.getElementById('review-text').value.trim();

      const stars = '⭐'.repeat(parseInt(rating));

      const reviewCard = document.createElement('div');
      reviewCard.className = 'card border-0 shadow-sm p-3 bg-white';
      reviewCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="text-dark">${name}</strong>
          <span class="text-warning small">${stars}</span>
        </div>
        <p class="text-secondary small mb-0">"${text}"</p>
      `;

      reviewsFeed.prepend(reviewCard);
      showToast('Thank you! Review published.');
      reviewForm.reset();
    });
  }

  // 7. Museum History (Анимация чисел)
  const animatedElements = document.querySelectorAll('.display-6');
  if (animatedElements.length > 0) {
    const startCounter = (el) => {
      const targetText = el.innerText.trim();
      const hasPlus = targetText.includes('+');
      const targetNum = parseInt(targetText, 10);
      if (isNaN(targetNum)) return;

      let startNum = targetNum > 1000 ? targetNum - 40 : 0;
      const duration = 1200;
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = (targetNum - startNum) / steps;
      let current = startNum;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetNum) {
          el.innerText = targetNum + (hasPlus ? '+' : '');
          clearInterval(timer);
        } else {
          el.innerText = Math.floor(current) + (hasPlus ? '+' : '');
        }
      }, stepTime);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    animatedElements.forEach(el => observer.observe(el));
  }

  // 8. Contacts Status Badge
  const statusBadge = document.getElementById('museum-status-badge');
  if (statusBadge) {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    if (day === 1) {
      statusBadge.className = 'badge bg-danger px-3 py-2 fs-6';
      statusBadge.innerText = '🔴 Closed (Monday Day-off)';
    } else if (hour >= 10 && hour < 18) {
      statusBadge.className = 'badge bg-success px-3 py-2 fs-6';
      statusBadge.innerText = '🟢 Open Now (until 18:00)';
    } else {
      statusBadge.className = 'badge bg-warning text-dark px-3 py-2 fs-6';
      statusBadge.innerText = '🟡 Closed Now (Opens at 10:00)';
    }
  }

  document.querySelectorAll('.copy-contact').forEach(link => {
    link.addEventListener('click', () => {
      const copyVal = link.getAttribute('data-copy') || link.innerText.trim();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(copyVal).then(() => {
          showToast(`Copied to clipboard: ${copyVal}`);
        });
      }
    });
  });

});

// Toast Notification
function showToast(message) {
  let toast = document.getElementById('custom-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #198754;
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
      font-weight: 500;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2500);
}