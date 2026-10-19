document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. EXHIBITS.HTML LOGIC (Exhibit Passport + Magnifier + Related Exhibits)
    // ==========================================
    const exhibitsMain = document.getElementById('exhibits-main-content');
    if (exhibitsMain) {
        
        const exhibitsDatabase = [
            {
                id: 1,
                title: '"Aisha" (first edition)',
                type: 'Book',
                year: '1927',
                code: 'INV-1027',
                img: 'book aisha.jpg',
                desc: 'A novel by Saken Seifullin, one of the first Kazakh works about the life and social rights of Kazakh women.',
                importance: 'Key manuscript demonstrating Saken Seifullin\'s advocacy for women\'s equality during early 20th-century cultural reforms.',
                origin: 'Kazakh State Publishing House Archive',
                condition: 'Original Hardcover (Preserved)'
            },
            {
                id: 2,
                title: 'Death Certificate of S. Seifullin’s son, Ayan',
                type: 'Document',
                year: '1917',
                code: 'INV-1917-A',
                img: '2nd card.png',
                desc: 'Official archival certificate confirming the tragic death of Saken Seifullin’s son, Ayan.',
                importance: 'A deeply personal historical record illustrating the personal family tragedies Seifullin endured during turbulent socio-political eras.',
                origin: 'Seifullin Family Personal Archive',
                condition: 'Archival Paper Document'
            },
            {
                id: 3,
                title: 'Letter from the editorial office of “Qazaq Ädebieti”',
                type: 'Document',
                year: '1934',
                code: 'INV-1934-Q',
                img: '3rd card.jpg',
                desc: 'Official correspondence from the editorial team regarding Seifullin’s literary manuscripts and union updates.',
                importance: 'Provides researchers direct evidence of Seifullin’s leadership role in Soviet-era Kazakh literary organizations.',
                origin: 'Writers’ Union Union Archive',
                condition: 'Typed Document with Stamp'
            },
            {
                id: 4,
                title: 'Petition by Gulbakhram Seifullina',
                type: 'Document',
                year: '1936',
                code: 'INV-1936-G',
                img: '4th card.png',
                desc: 'Official appeal written by Gulbakhram Seifullina defending her husband’s reputation and civic rights.',
                importance: 'Crucial primary source reflecting the courage of Saken’s spouse during political repressions in the 1930s.',
                origin: 'State Historical Archive',
                condition: 'Handwritten Petition Copy'
            },
            {
                id: 5,
                title: 'Painting “Saken on the Path to Freedom”',
                type: 'Painting',
                year: '1980',
                code: 'INV-1980-P',
                img: '5th card.jpg',
                desc: 'Artistic canvas portraying Saken Seifullin’s revolutionary path and commitment to national enlightenment.',
                importance: 'Demonstrates how Saken’s legacy continued to inspire Kazakh fine art and visual culture decades later.',
                origin: 'State Art Gallery Donation',
                condition: 'Oil on Canvas (Restored)'
            },
            {
                id: 6,
                title: 'Manuscript of a poem',
                type: 'Manuscript',
                year: '1922',
                code: 'INV-1922-M',
                img: '6th card.png',
                desc: 'Authentic handwritten draft of one of Saken Seifullin’s famous lyric poems.',
                importance: 'Offers rare insights into Seifullin’s creative writing process, handwriting style, and poetic meters.',
                origin: 'Personal Manuscripts Deposit',
                condition: 'Ink on Vintage Paper'
            },
            {
                id: 7,
                title: 'Photograph of Saken Seifullin',
                type: 'Photograph',
                year: '1910s',
                code: 'INV-1910-PH',
                img: '7th card.png',
                desc: 'Rare early portrait photograph of young Saken Seifullin during his teaching and early socio-political career.',
                importance: 'One of the few surviving high-authenticity visual records showing Seifullin in his formative intellectual years.',
                origin: 'Akmola Regional History Museum',
                condition: 'Black & White Silver Print'
            },
            {
                id: 8,
                title: 'Personal document (membership card)',
                type: 'Document',
                year: '1929',
                code: 'INV-1929-MC',
                img: '8th card.png',
                desc: 'Official Writers’ Union of the USSR membership credential issued to Saken Seifullin.',
                importance: 'Formal institutional document proving Seifullin’s status as a pioneer and recognized figure in national literature.',
                origin: 'Union Central Archive',
                condition: 'Leatherette Booklet'
            }
        ];

        const sortSelect = document.getElementById('sort-exhibits');
        const tableBody = document.querySelector('#exhibits-table tbody');

        if (sortSelect && tableBody) {
            sortSelect.addEventListener('change', (e) => {
                const rows = Array.from(tableBody.querySelectorAll('tr'));
                const option = e.target.value;

                if (option === 'default') return;

                rows.sort((a, b) => {
                    const titleA = a.children[0].textContent.trim();
                    const yearA = parseInt(a.children[2].textContent.trim()) || 0;

                    const titleB = b.children[0].textContent.trim();
                    const yearB = parseInt(b.children[2].textContent.trim()) || 0;

                    if (option === 'year-asc') return yearA - yearB;
                    if (option === 'year-desc') return yearB - yearA;
                    if (option === 'title-asc') return titleA.localeCompare(titleB);
                    return 0;
                });

                rows.forEach(row => tableBody.appendChild(row));
            });
        }

        let currentZoom = 1;
        const modalImg = document.getElementById('modal-exhibit-img');
        const btnZoomIn = document.getElementById('btn-zoom-in');
        const btnZoomOut = document.getElementById('btn-zoom-out');
        const btnZoomReset = document.getElementById('btn-zoom-reset');

        const applyZoom = (zoomLevel) => {
            currentZoom = Math.max(1, Math.min(zoomLevel, 2.5));
            if (modalImg) {
                modalImg.style.transform = `scale(${currentZoom})`;
            }
            if (btnZoomReset) {
                btnZoomReset.textContent = `${Math.round(currentZoom * 100)}%`;
            }
        };

        btnZoomIn?.addEventListener('click', () => applyZoom(currentZoom + 0.3));
        btnZoomOut?.addEventListener('click', () => applyZoom(currentZoom - 0.3));
        btnZoomReset?.addEventListener('click', () => applyZoom(1));

        const modalElement = document.getElementById('exhibitModal');
        if (modalElement && typeof bootstrap !== 'undefined') {
            const modal = new bootstrap.Modal(modalElement);

            const openExhibitPassport = (exhibitId) => {
                const data = exhibitsDatabase.find(item => item.id === parseInt(exhibitId));
                if (!data) return;

                applyZoom(1);

                document.getElementById('modal-exhibit-title').textContent = data.title;
                document.getElementById('modal-exhibit-type').textContent = data.type;
                document.getElementById('modal-exhibit-year').textContent = data.year;
                document.getElementById('modal-exhibit-code').textContent = data.code;
                document.getElementById('modal-exhibit-desc').textContent = data.desc;
                document.getElementById('modal-exhibit-importance').textContent = data.importance;
                document.getElementById('modal-exhibit-origin').textContent = data.origin;
                document.getElementById('modal-exhibit-condition').textContent = data.condition;
                document.getElementById('modal-exhibit-img').src = data.img;

                const relatedContainer = document.getElementById('related-exhibits-container');
                if (relatedContainer) {
                    relatedContainer.innerHTML = '';
                    
                    const relatedItems = exhibitsDatabase
                        .filter(item => item.id !== data.id)
                        .slice(0, 3);

                    relatedItems.forEach(rel => {
                        const col = document.createElement('div');
                        col.className = 'col-12 col-md-4';
                        col.innerHTML = `
                            <div class="card h-100 shadow-sm border p-2 bg-white" style="cursor: pointer;" data-related-id="${rel.id}">
                              <div class="d-flex align-items-center gap-2">
                                <img src="${rel.img}" class="rounded object-fit-cover" style="width: 45px; height: 45px;" alt="${rel.title}">
                                <div class="overflow-hidden">
                                  <h6 class="card-title text-truncate small fw-bold mb-0 text-success">${rel.title}</h6>
                                  <small class="text-muted d-block" style="font-size: 0.75rem;">${rel.type} • ${rel.year}</small>
                                </div>
                              </div>
                            </div>
                        `;

                        col.querySelector('.card').addEventListener('click', (e) => {
                            const relId = e.currentTarget.getAttribute('data-related-id');
                            openExhibitPassport(relId);
                        });

                        relatedContainer.appendChild(col);
                    });
                }

                modal.show();
            };

            document.querySelectorAll('#exhibits-table tbody tr').forEach(row => {
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => {
                    const exhibitId = row.getAttribute('data-id');
                    openExhibitPassport(exhibitId);
                });
            });

            document.querySelectorAll('#exhibits-cards-grid .card').forEach(card => {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    const parentCol = card.closest('[data-id]');
                    if (parentCol) {
                        const exhibitId = parentCol.getAttribute('data-id');
                        openExhibitPassport(exhibitId);
                    }
                });
            });
        }
    }

    // ==========================================
    // 2. FEEDBACK.HTML LOGIC (Smart Calendar + Breakdown + Smart Validation + Booking Preview)
    // ==========================================
    const feedbackMain = document.getElementById('feedback-main-content');
    if (feedbackMain) {
        const radioIndividual = document.getElementById('type-individual');
        const radioGroup = document.getElementById('type-group');
        const calcIndividual = document.getElementById('calculator-individual');
        const calcGroup = document.getElementById('calculator-group');
        const orgBlock = document.getElementById('group-org-block');

        const visitDateInput = document.getElementById('visit-date');
        const visitTimeSelect = document.getElementById('visit-time');
        const dateValMsg = document.getElementById('date-validation-msg');

        // Минимальная дата в календаре — завтрашний день
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (visitDateInput) {
            visitDateInput.min = tomorrow.toISOString().split('T')[0];
        }

        // Smart Visit Calendar: Настройка слотов времени в зависимости от дня недели
        visitDateInput?.addEventListener('change', () => {
            const selectedDate = new Date(visitDateInput.value);
            const dayOfWeek = selectedDate.getDay(); // 0 = Вс, 1 = Пн, 6 = Сб

            visitTimeSelect.innerHTML = '<option value="" disabled selected>Select time...</option>';

            if (dayOfWeek === 1) { // Понедельник — ВЫХОДНОЙ
                visitDateInput.classList.add('is-invalid');
                if (dateValMsg) dateValMsg.textContent = "Museum is closed on Mondays. Please choose another date.";
                return;
            } else {
                visitDateInput.classList.remove('is-invalid');
            }

            // Формируем допустимые часы
            let availableSlots = [];
            if (dayOfWeek >= 2 && dayOfWeek <= 5) {
                // Вт - Пт: 10:00 - 18:00
                availableSlots = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM'];
            } else {
                // Сб - Вс: 10:00 - 17:00 (слоты только до 16:00)
                availableSlots = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM'];
            }

            availableSlots.forEach(slot => {
                const opt = document.createElement('option');
                opt.value = slot;
                opt.textContent = slot;
                visitTimeSelect.appendChild(opt);
            });
        });

        // Smart Group Booking + Detailed Price Breakdown
        const calculateTotal = () => {
            let total = 0;
            let breakdownItems = [];
            const isGroupMode = radioGroup && radioGroup.checked;

            // Автоматическое предложение группового тарифа при сумме человек >= 10
            const qtyAdult = parseInt(document.getElementById('qty-adult')?.value) || 0;
            const qtyStudent = parseInt(document.getElementById('qty-student')?.value) || 0;
            const qtySenior = parseInt(document.getElementById('qty-senior')?.value) || 0;
            const totalIndividualCount = qtyAdult + qtyStudent + qtySenior;

            if (!isGroupMode && totalIndividualCount >= 10) {
                radioGroup.checked = true;
                toggleVisitType();
                return calculateTotal();
            }

            if (isGroupMode) {
                const groupCount = parseInt(document.getElementById('qty-group-people')?.value) || 10;
                const groupSubtotal = groupCount * 600;
                total += groupSubtotal;
                breakdownItems.push(`Group Tickets (${groupCount} visitors @ 600 ₸) = <strong>${groupSubtotal.toLocaleString()} ₸</strong> <span class="badge bg-success ms-1">40% OFF</span>`);
            } else {
                if (qtyAdult > 0) {
                    const price = qtyAdult * 1000;
                    total += price;
                    breakdownItems.push(`Adult Tickets (${qtyAdult} × 1,000 ₸) = ${price.toLocaleString()} ₸`);
                }
                if (qtyStudent > 0) {
                    const price = qtyStudent * 500;
                    total += price;
                    breakdownItems.push(`Student Tickets (${qtyStudent} × 500 ₸) = ${price.toLocaleString()} ₸`);
                }
                if (qtySenior > 0) {
                    const price = qtySenior * 300;
                    total += price;
                    breakdownItems.push(`Child/Senior Tickets (${qtySenior} × 300 ₸) = ${price.toLocaleString()} ₸`);
                }
            }

            // Дополнительные услуги
            const addGuide = document.getElementById('add-guide');
            const addPhoto = document.getElementById('add-photo');

            if (addGuide && addGuide.checked) {
                const val = parseInt(addGuide.value);
                total += val;
                breakdownItems.push(`Personal Tour Guide = +${val.toLocaleString()} ₸`);
            }
            if (addPhoto && addPhoto.checked) {
                const val = parseInt(addPhoto.value);
                total += val;
                breakdownItems.push(`Photo Pass = +${val.toLocaleString()} ₸`);
            }

            // Отображение детализации
            const breakdownEl = document.getElementById('price-breakdown-list');
            if (breakdownEl) {
                breakdownEl.innerHTML = breakdownItems.length > 0 
                    ? breakdownItems.map(item => `<div class="d-flex justify-content-between mb-1"><span>${item.split('=')[0]}</span><span>${item.split('=')[1]}</span></div>`).join('')
                    : '<span class="text-muted">No tickets selected</span>';
            }

            const displayEl = document.getElementById('total-price-display');
            if (displayEl) {
                displayEl.textContent = `${total.toLocaleString()} ₸`;
            }
            return { total, isGroupMode, breakdownItems };
        };

        const toggleVisitType = () => {
            if (radioGroup && radioGroup.checked) {
                calcIndividual?.classList.add('d-none');
                calcGroup?.classList.remove('d-none');
                orgBlock?.classList.remove('d-none');
            } else {
                calcIndividual?.classList.remove('d-none');
                calcGroup?.classList.add('d-none');
                orgBlock?.classList.add('d-none');
            }
            calculateTotal();
        };

        radioIndividual?.addEventListener('change', toggleVisitType);
        radioGroup?.addEventListener('change', toggleVisitType);

        calculateTotal();

        document.querySelectorAll('.ticket-qty, .extra-service, #qty-group-people').forEach(element => {
            element.addEventListener('input', calculateTotal);
            element.addEventListener('change', calculateTotal);
        });

        // Booking Preview Modal
        const excursionForm = document.getElementById('excursion-form');
        const previewModalEl = document.getElementById('bookingPreviewModal');

        if (excursionForm && previewModalEl && typeof bootstrap !== 'undefined') {
            const previewModal = new bootstrap.Modal(previewModalEl);

            excursionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Smart Form Validation
                let isValid = true;
                const nameInput = document.getElementById('visitor-name');
                const emailInput = document.getElementById('visitor-email');

                if (!nameInput.value.trim()) {
                    nameInput.classList.add('is-invalid');
                    isValid = false;
                } else nameInput.classList.remove('is-invalid');

                if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
                    emailInput.classList.add('is-invalid');
                    isValid = false;
                } else emailInput.classList.remove('is-invalid');

                if (!visitDateInput.value || visitDateInput.classList.contains('is-invalid')) {
                    visitDateInput.classList.add('is-invalid');
                    isValid = false;
                } else visitDateInput.classList.remove('is-invalid');

                if (!visitTimeSelect.value) {
                    visitTimeSelect.classList.add('is-invalid');
                    isValid = false;
                } else visitTimeSelect.classList.remove('is-invalid');

                if (!isValid) return;

                // Заполняем модальное окно предпросмотра
                const { total, isGroupMode, breakdownItems } = calculateTotal();
                
                document.getElementById('prev-name').textContent = nameInput.value;
                document.getElementById('prev-email').textContent = emailInput.value;
                document.getElementById('prev-datetime').textContent = `${visitDateInput.value} at ${visitTimeSelect.value}`;
                document.getElementById('prev-type').textContent = isGroupMode ? 'Group Visit (10+)' : 'Individual Visit';
                document.getElementById('prev-total').textContent = `${total.toLocaleString()} ₸`;

                const prevBreakdownEl = document.getElementById('prev-breakdown');
                if (prevBreakdownEl) {
                    prevBreakdownEl.innerHTML = breakdownItems.map(item => `<div class="d-flex justify-content-between mb-1"><span>${item.split('=')[0]}</span><span>${item.split('=')[1]}</span></div>`).join('');
                }

                previewModal.show();
            });

            // Кнопка подлинной симуляции отправки заявки
            document.getElementById('btn-confirm-demo-submit')?.addEventListener('click', () => {
                previewModal.hide();
                alert('✓ Demo Request Submitted! (In real application, this data is sent to museum backend).');
                excursionForm.reset();
                setTimeout(toggleVisitType, 50);
            });
        }

        // Review Categories + Feedback Logic
        const catButtons = document.querySelectorAll('#review-categories button');
        let selectedCategory = 'Exhibits';

        catButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                catButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedCategory = btn.getAttribute('data-cat');
            });
        });

        const stars = document.querySelectorAll('#rating-container span');
        let selectedRating = 5;

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                stars.forEach((s, idx) => {
                    s.style.opacity = idx < selectedRating ? '1' : '0.3';
                });
            });
        });

        const feedbackText = document.getElementById('feedback-text');
        const charCounter = document.getElementById('char-counter');

        if (feedbackText && charCounter) {
            feedbackText.addEventListener('input', () => {
                const len = feedbackText.value.length;
                charCounter.textContent = `${len} / 500`;
            });
        }

        const feedbackForm = document.getElementById('feedback-form');
        const feedbackResponse = document.getElementById('feedback-response-area');

        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!feedbackText.value.trim()) {
                    feedbackText.classList.add('is-invalid');
                    return;
                } else {
                    feedbackText.classList.remove('is-invalid');
                }

                feedbackResponse.className = 'mt-3 p-3 rounded alert alert-info d-block';
                feedbackResponse.innerHTML = `Thank you for reviewing <strong>${selectedCategory}</strong> with <strong>${selectedRating} stars</strong>!`;

                feedbackForm.reset();
                if (charCounter) charCounter.textContent = '0 / 500';
                stars.forEach(s => s.style.opacity = '1');
            });
        }
    }

    // ==========================================
    // 3. GALLERY.HTML LOGIC
    // ==========================================
    const galleryMain = document.getElementById('gallery-main-content');
    if (galleryMain) {
        const galleryDatabase = [
            {
                title: "Museum Inner View",
                tag: "Interior",
                img: "Museum inner view.jpeg",
                desc: "Traditional wooden hall architecture recreating the literary atmosphere of early 20th-century Kazakh intelligentsia.",
                hotspots: [
                    { x: "32%", y: "45%", name: "Wooden Showcase", text: "Original late 19th-century glass showcase containing archival documents and books." },
                    { x: "68%", y: "52%", name: "Memorial Stand", text: "Exhibition stand highlighting Seifullin's pedagogical career in Akmola." }
                ]
            },
            {
                title: "Personal Belongings Showcase",
                tag: "Personal Items",
                img: "Personal belongings.jpg",
                desc: "Authentic personal objects used by Saken Seifullin during his creative and public service years.",
                hotspots: [
                    { x: "53%", y: "48%", name: "Personal Clock", text: "Mechanical desk clock preserved in functioning condition from Seifullin's study room." },
                    { x: "78%", y: "65%", name: "White Porcelain Glass", text: "Porcelain tea glass gifted to Saken by fellow writers." }
                ]
            },
            {
                title: "Authentic Suit",
                tag: "Attire",
                img: "Saken s suit.png",
                desc: "Preserved two-piece suit reflecting early 20th-century urban Kazakh intelligentsia fashion.",
                hotspots: [
                    { x: "50%", y: "30%", name: "Suit Jacket", text: "Authentic wool jacket reflecting classic European-Kazakh formal tailoring." },
                    { x: "25%", y: "60%", name: "Wooden Walking Cane", text: "Handcrafted wooden cane carried by Seifullin during municipal assemblies." }
                ]
            }
        ];

        const themeBtn = document.getElementById('btn-toggle-theme');
        let isDarkMode = false;

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                isDarkMode = !isDarkMode;
                const controls = document.getElementById('gallery-controls');
                const cards = document.querySelectorAll('.gallery-card');

                if (isDarkMode) {
                    document.body.style.backgroundColor = '#121212';
                    document.body.style.color = '#e0e0e0';
                    controls?.classList.replace('bg-light', 'bg-dark');
                    controls?.classList.add('border-secondary');
                    themeBtn.textContent = '☀️ Light Mode';
                    themeBtn.classList.replace('btn-outline-dark', 'btn-outline-light');

                    cards.forEach(c => c.classList.add('bg-dark', 'text-white', 'border-secondary'));
                } else {
                    document.body.style.backgroundColor = '';
                    document.body.style.color = '';
                    controls?.classList.replace('bg-dark', 'bg-light');
                    controls?.classList.remove('border-secondary');
                    themeBtn.textContent = '🌙 Dark Mode';
                    themeBtn.classList.replace('btn-outline-light', 'btn-outline-dark');

                    cards.forEach(c => c.classList.remove('bg-dark', 'text-white', 'border-secondary'));
                }
            });
        }

        let currentFontSize = 100;
        const fontInc = document.getElementById('btn-font-increase');
        const fontDec = document.getElementById('btn-font-decrease');
        const fontReset = document.getElementById('btn-font-reset');

        fontInc?.addEventListener('click', () => {
            if (currentFontSize < 130) {
                currentFontSize += 10;
                galleryMain.style.fontSize = `${currentFontSize}%`;
            }
        });

        fontDec?.addEventListener('click', () => {
            if (currentFontSize > 80) {
                currentFontSize -= 10;
                galleryMain.style.fontSize = `${currentFontSize}%`;
            }
        });

        fontReset?.addEventListener('click', () => {
            currentFontSize = 100;
            galleryMain.style.fontSize = '100%';
        });

        const factBtn = document.getElementById('btn-fact-of-day');
        const factContainer = document.getElementById('fact-container');
        const facts = [
            "Saken Seifullin was one of the pioneers of modern Kazakh literature.",
            "The museum building was constructed in the late 19th century and is an architectural heritage site.",
            "The museum holds over 5,000 unique personal documents, original manuscripts, and historical photographs."
        ];

        if (factBtn && factContainer) {
            factBtn.addEventListener('click', () => {
                if (factContainer.classList.contains('d-none')) {
                    const randomFact = facts[Math.floor(Math.random() * facts.length)];
                    factContainer.textContent = `💡 Fact: ${randomFact}`;
                    factContainer.classList.remove('d-none');
                } else {
                    factContainer.classList.add('d-none');
                }
            });
        }

        const carouselEl = document.getElementById('museumCarousel');
        const photoCounter = document.getElementById('photo-counter');

        if (carouselEl && photoCounter) {
            carouselEl.addEventListener('slide.bs.carousel', (event) => {
                const slideIndex = event.to + 1;
                const totalSlides = carouselEl.querySelectorAll('.carousel-item').length;
                photoCounter.textContent = `Photo ${slideIndex} of ${totalSlides}`;
            });
        }

        const lightboxModalEl = document.getElementById('lightboxModal');
        if (lightboxModalEl && typeof bootstrap !== 'undefined') {
            const lightboxModal = new bootstrap.Modal(lightboxModalEl);
            let currentIndex = 0;
            let galleryZoom = 1;

            const wrapperEl = document.getElementById('lightbox-img-wrapper');
            const imgEl = document.getElementById('lightbox-img');
            const hotspotsContainer = document.getElementById('hotspots-container');

            const titleEl = document.getElementById('lightbox-card-title');
            const tagEl = document.getElementById('lightbox-tag');
            const descEl = document.getElementById('lightbox-desc');
            const focusTitleEl = document.getElementById('hotspot-focus-title');
            const focusDescEl = document.getElementById('hotspot-focus-desc');

            const applyGalleryZoom = (zoomLevel) => {
                galleryZoom = Math.max(1, Math.min(zoomLevel, 2.2));
                if (wrapperEl) {
                    wrapperEl.style.transform = `scale(${galleryZoom})`;
                }
                const btnReset = document.getElementById('btn-gallery-zoom-reset');
                if (btnReset) {
                    btnReset.textContent = `${Math.round(galleryZoom * 100)}%`;
                }
            };

            document.getElementById('btn-gallery-zoom-in')?.addEventListener('click', () => applyGalleryZoom(galleryZoom + 0.3));
            document.getElementById('btn-gallery-zoom-out')?.addEventListener('click', () => applyGalleryZoom(galleryZoom - 0.3));
            document.getElementById('btn-gallery-zoom-reset')?.addEventListener('click', () => applyGalleryZoom(1));

            const updateLightboxContent = (index) => {
                currentIndex = index;
                const data = galleryDatabase[currentIndex];
                if (!data) return;

                applyGalleryZoom(1);

                if (titleEl) titleEl.textContent = data.title;
                if (tagEl) tagEl.textContent = data.tag;
                if (descEl) descEl.textContent = data.desc;
                if (imgEl) imgEl.src = data.img;

                if (focusTitleEl) focusTitleEl.textContent = "📍 Interactive Hotspots";
                if (focusDescEl) focusDescEl.textContent = "Hover or click on any pulsing gold marker on the photograph to inspect highlighted artifacts.";

                if (hotspotsContainer) {
                    hotspotsContainer.innerHTML = '';
                    
                    data.hotspots.forEach((hs) => {
                        const spot = document.createElement('div');
                        spot.className = 'hotspot';
                        spot.style.left = hs.x;
                        spot.style.top = hs.y;
                        spot.title = hs.name;

                        spot.addEventListener('mouseenter', () => {
                            if (focusTitleEl) focusTitleEl.textContent = `🔎 ${hs.name}`;
                            if (focusDescEl) focusDescEl.textContent = hs.text;
                        });

                        spot.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (focusTitleEl) focusTitleEl.textContent = `🔎 ${hs.name}`;
                            if (focusDescEl) focusDescEl.textContent = hs.text;
                        });

                        hotspotsContainer.appendChild(spot);
                    });
                }
            };

            document.querySelectorAll('#gallery-cards-grid .gallery-card-col').forEach((col) => {
                const idx = parseInt(col.getAttribute('data-index')) || 0;
                col.addEventListener('click', () => {
                    updateLightboxContent(idx);
                    lightboxModal.show();
                });
            });

            document.getElementById('btn-lightbox-prev')?.addEventListener('click', () => {
                const nextIdx = (currentIndex - 1 + galleryDatabase.length) % galleryDatabase.length;
                updateLightboxContent(nextIdx);
            });

            document.getElementById('btn-lightbox-next')?.addEventListener('click', () => {
                const nextIdx = (currentIndex + 1) % galleryDatabase.length;
                updateLightboxContent(nextIdx);
            });
        }
    }
});