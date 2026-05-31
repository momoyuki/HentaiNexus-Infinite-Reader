// ==UserScript==
// @name         HentaiNexus Infinite Reader
// @version      1.6
// @author       Roxy (for megumin)
// @match        https://hentainexus.com/read/*
// @run-at       document-idle
// @grant        none
// @homepage     https://github.com/momoyuki/HentaiNexus-Infinite-Reader
// @updateURL    https://raw.githubusercontent.com/momoyuki/HentaiNexus-Infinite-Reader/main/HentaiNexus%20Infinite%20Reader.user.js
// @downloadURL  https://raw.githubusercontent.com/momoyuki/HentaiNexus-Infinite-Reader/main/HentaiNexus%20Infinite%20Reader.user.js
// ==/UserScript==

(function () {
    'use strict';

    let initialized = false;
    let currentHash = null;
    let currentZoom = 100;
    let currentActiveIndex = 0;

    const wait = setInterval(() => {
        if (initialized || !window.pageData || window.pageData.length === 0) return;

        clearInterval(wait);
        initialized = true;
        console.log(`✅ Roxy Reader: พบ ${window.pageData.length} หน้า`);
        createControlPanel();
        createProgressBar();
        buildReader(window.pageData);
        setupKeyboardNavigation(window.pageData);
    }, 200);

    function createControlPanel() {
        const bookId = window.location.pathname.split('/').pop();
        const galleryUrl = `https://hentainexus.com/view/${bookId}`;

        const panel = document.createElement('div');
        panel.id = 'reader-controls';
        Object.assign(panel.style, {
            position: 'fixed',
            top: '15px',
            right: '15px',
            zIndex: '99999',
            background: 'rgba(0,0,0,0.9)',
            padding: '12px 15px',
            borderRadius: '12px',
            color: 'white',
            fontFamily: 'sans-serif',
            boxShadow: '0 5px 25px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        });

        panel.innerHTML = `
            <a href="${galleryUrl}" style="background:#c62828;padding:8px 14px;border-radius:6px;color:white;text-decoration:none;">🔙 Galley</a>
            <button id="zoom-out" style="background:#555;padding:7px 13px;border:none;border-radius:6px;color:white;">−</button>
            <span id="zoom-val" style="min-width:55px;text-align:center;font-weight:bold;">100%</span>
            <button id="zoom-in" style="background:#555;padding:7px 13px;border:none;border-radius:6px;color:white;">+</button>
            <button id="zoom-reset" style="background:#444;padding:7px 10px;border:none;border-radius:6px;color:white;font-size:12px;">Reset</button>
        `;

        document.body.appendChild(panel);

        const updateZoom = (delta) => {
            currentZoom = Math.max(30, Math.min(300, currentZoom + delta));
            document.getElementById('zoom-val').textContent = currentZoom + '%';
            const container = document.getElementById('infinite-reader-container');
            if (container) container.style.width = currentZoom + '%';
        };

        document.getElementById('zoom-in').onclick = () => updateZoom(15);
        document.getElementById('zoom-out').onclick = () => updateZoom(-15);
        document.getElementById('zoom-reset').onclick = () => { currentZoom = 100; updateZoom(0); };
    }

    function createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.id = 'reader-progress-bar';
        Object.assign(progressBar.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            height: '4px',
            width: '0%',
            background: 'linear-gradient(to right, #ff4081, #c62828)',
            zIndex: '100000',
            transition: 'width 0.1s ease',
            boxShadow: '0 1px 10px rgba(255, 64, 129, 0.5)'
        });
        document.body.appendChild(progressBar);
    }

    function getStartIndex(data) {
        const hash = location.hash.replace('#', '');
        if (!hash) return 0;
        if (hash === 'end') return data.length - 1;
        const idx = data.findIndex(p => p.url_label === hash);
        return idx >= 0 ? idx : 0;
    }

    function buildReader(data) {
        // ลบระบบอ่านเดิมของเว็บ
        const old = document.getElementById('reader_section');
        if (old) old.style.display = 'none';

        const container = document.createElement('div');
        container.id = 'infinite-reader-container';
        Object.assign(container.style, {
            width: '100%',
            maxWidth: '100%',
            margin: '20px auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            transition: 'width 0.3s ease'
        });

        document.body.appendChild(container);

        data.forEach((page, index) => {
            const wrapper = document.createElement('div');
            wrapper.dataset.index = index;
            wrapper.style.width = '100%';
            wrapper.style.display = 'flex';
            wrapper.style.justifyContent = 'center';

            const img = document.createElement('img');
            img.dataset.src = page.image;
            img.style.cssText = 'width:100%; max-width:100%; height:auto; opacity:0; transition:opacity 0.4s; display:block;';

            wrapper.appendChild(img);
            container.appendChild(wrapper);
        });

        setupObserver(container, data);
        setupScrollTracking(container, data);

        // ไปที่หน้าที่กำหนดจาก hash
        setTimeout(() => {
            const start = getStartIndex(data);
            const target = container.querySelector(`[data-index="${start}"]`);
            if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
        }, 150);
    }

    function setupObserver(container, data) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const img = entry.target.querySelector('img');
                if (!img) return;
                if (entry.isIntersecting) {
                    if (!img.src) img.src = img.dataset.src;
                    img.style.opacity = '1';
                }
            });
        }, { rootMargin: '800px' });

        container.querySelectorAll('div[data-index]').forEach(el => observer.observe(el));
    }

    function setupScrollTracking(container, data) {
        window.addEventListener('scroll', () => {
            const wrappers = container.querySelectorAll('[data-index]');
            const center = window.innerHeight / 2;
            let closest = null, minDist = Infinity;

            wrappers.forEach(w => {
                const rect = w.getBoundingClientRect();
                const dist = Math.abs(center - (rect.top + rect.height/2));
                if (dist < minDist) {
                    minDist = dist;
                    closest = w;
                }
            });

            if (closest) {
                const index = parseInt(closest.dataset.index);
                currentActiveIndex = index;
                const label = data[index]?.url_label;
                if (label && currentHash !== label) {
                    currentHash = label;
                    history.replaceState(null, '', '#' + label);
                }
            }

            // Update Progress Bar
            const progressBar = document.getElementById('reader-progress-bar');
            if (progressBar) {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                if (totalHeight > 0) {
                    const progress = (window.pageYOffset / totalHeight) * 100;
                    progressBar.style.width = `${progress}%`;
                }
            }
        });
    }

    function scrollToPage(index, data) {
        if (index < 0 || index >= data.length) return;
        const target = document.querySelector(`[data-index="${index}"]`);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function setupKeyboardNavigation(data) {
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            const key = e.key.toLowerCase();
            if (key === 'arrowright' || key === 'j') {
                e.preventDefault();
                scrollToPage(currentActiveIndex + 1, data);
            } else if (key === 'arrowleft' || key === 'k') {
                e.preventDefault();
                scrollToPage(currentActiveIndex - 1, data);
            }
        });
    }
})();