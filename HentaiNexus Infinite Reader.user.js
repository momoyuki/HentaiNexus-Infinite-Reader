// ==UserScript==
// @name         HentaiNexus Infinite Reader
// @version      1.9
// @author       Roxy (for megumin)
// @match        https://hentainexus.com/read/*
// @run-at       document-idle
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
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
    let readerContainer = null;
    let downloading = false;

    const waitForData = setInterval(() => {
        if (initialized) return;

        let data = window.pageData;
        let source = 'pageData';
        if (!Array.isArray(data) || data.length === 0) {
            if (Array.isArray(window.readerData) && window.readerData.length > 0) {
                data = window.readerData;
                source = 'readerData';
            } else if (Array.isArray(window._pageData) && window._pageData.length > 0) {
                data = window._pageData;
                source = '_pageData';
            }
        }

        if (!Array.isArray(data) || data.length === 0) return;

        clearInterval(waitForData);
        initialized = true;

        console.log(`✅ Roxy Reader: พบ ${data.length} หน้า (source: ${source})`);
        showStartButton(data);
    }, 250);

    function showStartButton(data) {
        const btn = document.createElement('button');
        btn.id = 'reader-start-btn';
        btn.textContent = '▶ Start Reader';
        Object.assign(btn.style, {
            position: 'fixed', top: '15px', right: '15px', zIndex: '99999',
            background: 'rgba(0,0,0,0.9)', padding: '12px 20px', borderRadius: '12px',
            color: 'white', fontFamily: 'sans-serif', fontSize: '15px', fontWeight: 'bold',
            border: 'none', cursor: 'pointer', boxShadow: '0 5px 25px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)'
        });
        btn.onclick = () => startReader(data);
        document.body.appendChild(btn);
    }

    function startReader(data) {
        document.getElementById('reader-start-btn')?.remove();
        createControlPanel(data);
        createProgressBar();
        buildReader(data);
        setupKeyboardNavigation(data);
    }

    function getImageUrls(page) {
        return [page.image_avif, page.image_fallback, page.image].filter(Boolean);
    }

    function makeMissingPlaceholder(index) {
        const placeholder = document.createElement('div');
        placeholder.textContent = `ไม่พบภาพหน้า ${index + 1}`;
        placeholder.style.cssText = 'width:100%; padding:40px 0; text-align:center; color:red; font-family:sans-serif;';
        return placeholder;
    }

    function createControlPanel(data) {
        const bookId = window.location.pathname.split('/').pop();
        const galleryUrl = `https://hentainexus.com/view/${bookId}`;
        const panel = document.createElement('div');
        panel.id = 'reader-controls';
        Object.assign(panel.style, {
            position: 'fixed', top: '15px', right: '15px', zIndex: '99999',
            background: 'rgba(0,0,0,0.9)', padding: '12px 15px', borderRadius: '12px',
            color: 'white', fontFamily: 'sans-serif', boxShadow: '0 5px 25px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '10px'
        });
        panel.innerHTML = `
            <a href="${galleryUrl}" style="background:#c62828;padding:8px 14px;border-radius:6px;color:white;text-decoration:none;">🔙 Gallery</a>
            <input id="zoom-slider" type="range" min="30" max="300" step="5" value="100" style="width:100px;">
            <span id="zoom-val" style="min-width:55px;text-align:center;font-weight:bold;">100%</span>
            <button id="zoom-reset" style="background:#444;padding:7px 10px;border:none;border-radius:6px;color:white;font-size:12px;">Reset</button>
            <button id="download-zip" style="background:#2e7d32;padding:7px 13px;border:none;border-radius:6px;color:white;">📦 Download</button>
        `;
        document.body.appendChild(panel);

        const slider = document.getElementById('zoom-slider');
        const applyZoom = () => {
            document.getElementById('zoom-val').textContent = currentZoom + '%';
            const container = document.getElementById('infinite-reader-container');
            if (container) container.style.width = currentZoom + '%';
        };
        slider.oninput = () => { currentZoom = Number(slider.value); applyZoom(); };
        document.getElementById('zoom-reset').onclick = () => { currentZoom = 100; slider.value = 100; applyZoom(); };
        document.getElementById('download-zip').onclick = () => downloadArchive(data, bookId, galleryUrl);
    }

    function createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.id = 'reader-progress-bar';
        Object.assign(progressBar.style, {
            position: 'fixed', top: '0', left: '0', height: '4px', width: '0%',
            background: 'linear-gradient(to right, #ff4081, #c62828)', zIndex: '100000',
            transition: 'width 0.15s ease-out', boxShadow: '0 1px 10px rgba(255, 64, 129, 0.5)'
        });
        document.body.appendChild(progressBar);
    }

    function sanitizeFilename(name) {
        return name.replace(/[\\/:*?"<>|]/g, '_').trim();
    }

    function extractExtension(url) {
        const match = url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
        return match ? match[1] : 'jpg';
    }

    async function convertAvifBlobToPng(blob) {
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext('2d').drawImage(bitmap, 0, 0);
        bitmap.close();
        return await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    }

    async function resolveTitleAndArtist(galleryUrl) {
        try {
            const res = await fetch(galleryUrl);
            if (res.ok) {
                const html = await res.text();
                const match = html.match(/<meta property="og:title" content="([^"]*)"/);
                if (match) {
                    const content = match[1];
                    const sepIndex = content.indexOf(' by ');
                    if (sepIndex >= 0) {
                        return { title: content.slice(0, sepIndex), artist: content.slice(sepIndex + 4) };
                    }
                    return { title: content, artist: '' };
                }
            }
        } catch (e) {
            console.warn('Roxy Reader: ดึงชื่อเรื่อง/ศิลปินจาก gallery page ไม่สำเร็จ', e);
        }
        return { title: document.title.replace(/\s*::\s*HentaiNexus\s*$/, ''), artist: '' };
    }

    async function downloadArchive(data, bookId, galleryUrl) {
        if (downloading) return;
        downloading = true;

        const btn = document.getElementById('download-zip');
        const setLabel = (text) => { if (btn) btn.textContent = text; };

        try {
            const { title, artist } = await resolveTitleAndArtist(galleryUrl);
            const zip = new JSZip();
            const padWidth = String(data.length).length;

            for (let i = 0; i < data.length; i++) {
                const urls = getImageUrls(data[i]);
                let blob = null;
                let sourceUrl = null;

                for (const url of urls) {
                    try {
                        const res = await fetch(url);
                        if (res.ok) {
                            blob = await res.blob();
                            sourceUrl = url;
                            break;
                        }
                    } catch (e) {
                        // ลองต่อ URL ถัดไป
                    }
                }

                if (blob) {
                    let ext = extractExtension(sourceUrl);
                    if (ext.toLowerCase() === 'avif' || blob.type === 'image/avif') {
                        try {
                            blob = await convertAvifBlobToPng(blob);
                            ext = 'png';
                        } catch (e) {
                            console.warn(`Roxy Reader: แปลง avif เป็น png หน้า ${i + 1} ไม่สำเร็จ ใช้ไฟล์เดิม`, e);
                        }
                    }
                    const name = String(i + 1).padStart(padWidth, '0') + '.' + ext;
                    zip.file(name, blob);
                } else {
                    console.warn(`Roxy Reader: โหลดภาพหน้า ${i + 1} ไม่สำเร็จ ข้ามหน้านี้`);
                }

                setLabel(`${i + 1}/${data.length}`);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
            const filename = sanitizeFilename(`${artist ? artist + ' - ' : ''}${title} [${bookId}].zip`);

            const objectUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(objectUrl);

            setLabel('📦 Download');
        } catch (e) {
            console.error('Roxy Reader: สร้างไฟล์ zip ไม่สำเร็จ', e);
            setLabel('❌ Error');
            setTimeout(() => setLabel('📦 Download'), 2000);
        } finally {
            downloading = false;
        }
    }

    function buildReader(data) {
        const old = document.getElementById('reader_section');
        if (old) old.style.display = 'none';

        const container = document.createElement('div');
        container.id = 'infinite-reader-container';
        Object.assign(container.style, {
            width: '100%', maxWidth: '100%', margin: '30px auto', paddingBottom: '150px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
            transition: 'width 0.3s ease'
        });
        document.body.appendChild(container);
        readerContainer = container;

        const wrappers = [];

        data.forEach((page, index) => {
            const wrapper = document.createElement('div');
            wrapper.dataset.index = index;
            wrapper.style.width = '100%';
            wrapper.style.display = 'flex';
            wrapper.style.justifyContent = 'center';

            const urls = getImageUrls(page);

            if (urls.length > 0) {
                const img = document.createElement('img');
                img.style.cssText = 'width:100%; max-width:100%; height:auto; display:block; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
                img.loading = 'lazy';  // ใช้ native lazy loading
                let urlIndex = 0;
                img.onerror = () => {
                    urlIndex++;
                    if (urlIndex < urls.length) {
                        img.src = urls[urlIndex];
                    } else {
                        wrapper.replaceChild(makeMissingPlaceholder(index), img);
                    }
                };
                img.src = urls[urlIndex];
                wrapper.appendChild(img);
            } else {
                wrapper.appendChild(makeMissingPlaceholder(index));
            }

            wrappers.push(wrapper);
            container.appendChild(wrapper);
        });

        setupScrollTracking(wrappers, data);

        setTimeout(() => {
            const start = getStartIndex(data);
            const target = container.querySelector(`[data-index="${start}"]`);
            if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
        }, 300);
    }

    function getStartIndex(data) {
        const hash = decodeURIComponent(location.hash.replace('#', ''));
        if (!hash) return 0;
        if (hash === 'end') return data.length - 1;
        const idx = data.findIndex(p => (p.url_label || p.label) === hash);
        if (idx < 0) console.warn(`Roxy Reader: ไม่พบหน้า label "${hash}", เริ่มที่หน้าแรก`);
        return idx >= 0 ? idx : 0;
    }

    function setupScrollTracking(wrappers, data) {
        const progressBar = document.getElementById('reader-progress-bar');
        let ticking = false;

        const update = () => {
            ticking = false;
            const center = window.innerHeight / 2;
            let closest = null, minDist = Infinity;

            wrappers.forEach(w => {
                const rect = w.getBoundingClientRect();
                const dist = Math.abs(center - (rect.top + rect.height / 2));
                if (dist < minDist) {
                    minDist = dist;
                    closest = w;
                }
            });

            if (closest) {
                const index = parseInt(closest.dataset.index);
                currentActiveIndex = index;
                const label = data[index]?.url_label || data[index]?.label;
                if (label && currentHash !== label) {
                    currentHash = label;
                    history.replaceState(null, '', '#' + label);
                }
            }

            if (progressBar) {
                const total = document.documentElement.scrollHeight - window.innerHeight;
                if (total > 0) progressBar.style.width = `${(window.pageYOffset / total) * 100}%`;
            }
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        });
    }

    function setupKeyboardNavigation(data) {
        window.addEventListener('keydown', (e) => {
            if (['INPUT','TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;
            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'j') {
                e.preventDefault();
                scrollToPage(currentActiveIndex + 1, data);
            } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'k') {
                e.preventDefault();
                scrollToPage(currentActiveIndex - 1, data);
            }
        });
    }

    function scrollToPage(index, data) {
        if (index < 0 || index >= data.length) return;
        const target = readerContainer?.querySelector(`[data-index="${index}"]`);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
})();