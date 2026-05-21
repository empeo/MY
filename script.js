// ========== PORTFOLIO SLIDESHOW ENGINE ==========
(function () {
    'use strict';

    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let isAnimating = false;
    const ANIMATION_DURATION = 700;

    // --- Build Navigation Dots ---
    const dotsContainer = document.getElementById('slideDots');
    const dotLabels = ['Welcome', 'About', 'Education', 'Tech Skills', 'Soft Skills', 'Languages', 'Contact'];
    dotLabels.forEach((label, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.dataset.slide = i;
        dot.innerHTML = `<span class="dot-label">${label}</span>`;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    // --- Skill bars data-level -> CSS var ---
    document.querySelectorAll('.skill-bar__fill').forEach(bar => {
        bar.style.setProperty('--fill-width', bar.dataset.level + '%');
    });

    // --- Navigation Functions ---
    function goToSlide(index) {
        if (isAnimating || index === currentSlide || index < 0 || index >= totalSlides) return;
        isAnimating = true;

        const goingForward = index > currentSlide;
        const oldSlide = slides[currentSlide];
        const newSlide = slides[index];
        const exitClass = goingForward ? 'exit-up' : 'exit-down';

        // Exit old slide
        oldSlide.classList.remove('active');
        oldSlide.classList.add(exitClass);

        // Reset animate-items on the new slide so transitions re-trigger
        const animItems = newSlide.querySelectorAll('.animate-item');
        animItems.forEach(item => {
            item.style.transition = 'none';
            item.style.opacity = '0';
            item.style.transform = goingForward ? 'translateY(30px)' : 'translateY(-30px)';
        });

        // Force reflow so the reset styles are applied before re-enabling transitions
        void newSlide.offsetHeight;

        // Remove inline overrides and let CSS transitions take over
        animItems.forEach(item => {
            item.style.transition = '';
            item.style.opacity = '';
            item.style.transform = '';
        });

        // Enter new slide
        newSlide.classList.add('active');

        // Update state
        currentSlide = index;
        updateUI();

        setTimeout(() => {
            oldSlide.classList.remove(exitClass);
            isAnimating = false;
        }, ANIMATION_DURATION);
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    function updateUI() {
        // Dots
        dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === currentSlide);
        });

        // Progress bar
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        document.getElementById('progressBar').style.width = progress + '%';

        // Counter
        const curr = String(currentSlide + 1).padStart(2, '0');
        const total = String(totalSlides).padStart(2, '0');
        document.getElementById('slideCounter').textContent = `${curr} / ${total}`;

        // Arrows
        document.getElementById('prevBtn').disabled = currentSlide === 0;
        document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
    }

    // --- Event Listeners ---
    document.getElementById('prevBtn').addEventListener('click', prevSlide);
    document.getElementById('nextBtn').addEventListener('click', nextSlide);

    // CTA button
    const ctaBtn = document.getElementById('ctaBtn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
        });
    }

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
    });

    // Mouse wheel / Trackpad
    let wheelTimeout;
    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (e.deltaY > 30) nextSlide();
            else if (e.deltaY < -30) prevSlide();
        }, 50);
    }, { passive: false });

    // Touch swipe
    let touchStartY = 0;
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const dy = touchStartY - e.changedTouches[0].clientY;
        const dx = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 50) {
            if (dy > 0) nextSlide();
            else prevSlide();
        } else if (Math.abs(dx) > 50) {
            if (dx > 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });

    // Hide keyboard hint after first navigation
    let hintShown = true;
    function hideHint() {
        if (hintShown) {
            document.getElementById('keyboardHint').classList.add('hidden');
            hintShown = false;
        }
    }
    document.addEventListener('keydown', hideHint);
    document.addEventListener('wheel', hideHint);

    // Auto-hide hint after 5s
    setTimeout(() => {
        hideHint();
    }, 5000);

    // --- Init ---
    updateUI();

})();
