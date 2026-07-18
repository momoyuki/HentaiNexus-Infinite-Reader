# HentaiNexus Infinite Reader

A userscript for [hentainexus.com](https://hentainexus.com) that turns the page-by-page reader into a **continuous infinite-scroll experience**, with zoom controls, a progress bar, keyboard navigation, and a one-click "download the whole book as a ZIP" button.

Userscript สำหรับ [hentainexus.com](https://hentainexus.com) ที่เปลี่ยนหน้าอ่านแบบทีละหน้าให้เป็น **โหมดเลื่อนอ่านต่อเนื่อง (infinite scroll)** พร้อมปุ่มซูม แถบความคืบหน้า การเลื่อนด้วยคีย์บอร์ด และปุ่มดาวน์โหลดทั้งเล่มเป็นไฟล์ ZIP ในคลิกเดียว

> Current version / เวอร์ชันปัจจุบัน: **1.9**

---

## ✨ Features / ฟีเจอร์

| Feature | English | ไทย |
| --- | --- | --- |
| 📜 Infinite scroll | All pages on one page — read straight through, no clicking between pages | รวมทุกหน้าไว้ในหน้าเดียว เลื่อนอ่านรวดเดียวจบ ไม่ต้องคลิกเปลี่ยนหน้า |
| 🔍 Zoom | Slider adjusts image width from 30% to 300%, with a Reset button | สไลเดอร์ปรับความกว้างภาพ 30%–300% พร้อมปุ่ม Reset กลับ 100% |
| 📊 Progress bar | Top-of-screen bar shows how far you've read | แถบด้านบนสุดบอกว่าอ่านไปถึงไหนแล้ว |
| ⌨️ Keyboard nav | `→` / `J` next page, `←` / `K` previous page | `→` / `J` ไปหน้าถัดไป, `←` / `K` กลับหน้าก่อนหน้า |
| 🔗 URL sync | The URL hash updates to the current page, so you can share a link that opens on a specific page (`#end` jumps to the last page) | อัปเดต hash ของ URL ตามหน้าที่อ่าน แชร์ลิงก์เปิดตรงหน้าได้ (`#end` ไปหน้าสุดท้าย) |
| 📦 ZIP download | Downloads every page as a single ZIP, auto-named from title and artist | โหลดทุกหน้าเป็นไฟล์ ZIP เดียว ตั้งชื่อไฟล์อัตโนมัติจากชื่อเรื่องและศิลปิน |
| 🖼️ Smart image source | Picks AVIF / fallback / normal automatically, converts AVIF to PNG on download | เลือกใช้ AVIF / fallback / ภาพปกติตามที่มี และแปลง AVIF เป็น PNG ตอนดาวน์โหลด |
| 🔙 Back to Gallery | One-click return to the book's detail page | กลับไปหน้ารายละเอียดเล่มได้ในคลิกเดียว |

---

## 📥 Installation / การติดตั้ง

**English**

1. Install a userscript manager for your browser:
   - [Tampermonkey](https://www.tampermonkey.net/) (recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)
2. Open the install link below and confirm the installation in your userscript manager:

   👉 [**Install HentaiNexus Infinite Reader**](https://raw.githubusercontent.com/momoyuki/HentaiNexus-Infinite-Reader/main/HentaiNexus%20Infinite%20Reader.user.js)

3. Open any reader page on hentainexus.com (URL matches `https://hentainexus.com/read/*`).

> The script supports auto-update via `@updateURL` — Tampermonkey will fetch new versions automatically.

**ไทย**

1. ติดตั้งส่วนขยายสำหรับรัน userscript ในเบราว์เซอร์ เช่น
   - [Tampermonkey](https://www.tampermonkey.net/) (แนะนำ)
   - [Violentmonkey](https://violentmonkey.github.io/)
2. เปิดลิงก์ติดตั้งด้านบน แล้วกดยืนยันการติดตั้งในส่วนขยาย
3. เปิดหน้าอ่านของ hentainexus.com (URL รูปแบบ `https://hentainexus.com/read/*`) ได้เลย

> สคริปต์รองรับการอัปเดตอัตโนมัติผ่าน `@updateURL` — Tampermonkey จะดึงเวอร์ชันใหม่ให้เอง

---

## 🚀 Usage / วิธีใช้

**English**

1. Go to the reader page of the book you want (`https://hentainexus.com/read/...`).
2. Wait a moment for the **▶ Start Reader** button to appear at the top-right, then click it to enter infinite-scroll mode.
3. Use the control panel at the top-right to control the reader.

**ไทย**

1. เข้าหน้าอ่านของเล่มที่ต้องการ (`https://hentainexus.com/read/...`)
2. รอสักครู่จนปุ่ม **▶ Start Reader** ปรากฏที่มุมขวาบน แล้วกดเพื่อเข้าโหมดเลื่อนอ่านต่อเนื่อง
3. ใช้แผงควบคุมมุมขวาบนควบคุมการอ่าน

### Control panel / แผงควบคุม

| Control | English | ไทย |
| --- | --- | --- |
| 🔙 Gallery | Back to the book's detail page | กลับไปหน้ารายละเอียดเล่ม |
| Zoom slider | Adjust image width (30%–300%) | ปรับความกว้างภาพ (30%–300%) |
| Reset | Reset zoom to 100% | รีเซ็ตซูมกลับเป็น 100% |
| 📦 Download | Download the whole book as a ZIP | ดาวน์โหลดทั้งเล่มเป็นไฟล์ ZIP |

### Keyboard shortcuts / ปุ่มลัดคีย์บอร์ด

| Key / ปุ่ม | English | ไทย |
| --- | --- | --- |
| `→` or `J` | Next page | ไปหน้าถัดไป |
| `←` or `K` | Previous page | กลับหน้าก่อนหน้า |

---

## ⚙️ How it works / การทำงานเบื้องหลัง

**English**

- The script waits for page data from in-page variables (`window.pageData`, `window.readerData`, or `window._pageData`) before starting.
- The **Download** button uses [JSZip](https://stuk.github.io/jszip/) (loaded via `@require`) to build the ZIP without compression (`STORE`) for speed, and reads the title/artist from the gallery page's `og:title` meta tag to name the file.
- AVIF images are converted to PNG via a `<canvas>` before being added to the ZIP.

**ไทย**

- สคริปต์จะรอข้อมูลหน้าจากตัวแปรในเพจ (`window.pageData`, `window.readerData` หรือ `window._pageData`) ก่อนเริ่มทำงาน
- ปุ่ม **Download** ใช้ [JSZip](https://stuk.github.io/jszip/) (โหลดผ่าน `@require`) สร้างไฟล์ ZIP โดยไม่บีบอัด (`STORE`) เพื่อความเร็ว และดึงชื่อเรื่อง/ศิลปินจาก meta tag `og:title` ของหน้า gallery มาตั้งชื่อไฟล์
- ภาพ AVIF จะถูกแปลงเป็น PNG ผ่าน `<canvas>` ก่อนใส่ลงไฟล์ ZIP

---

## 📄 Script info / ข้อมูลสคริปต์

| Item / รายการ | Value / ค่า |
| --- | --- |
| Name / ชื่อ | HentaiNexus Infinite Reader |
| Version / เวอร์ชัน | 1.9 |
| Author / ผู้เขียน | Roxy (for megumin) |
| Match | `https://hentainexus.com/read/*` |
| Dependency | JSZip 3.10.1 |

---

## ⚠️ Notes / หมายเหตุ

**English**

- The script only runs on `read/*` pages of hentainexus.com.
- Its features depend on the site's data structure; if the site changes, the script may need updating.
- Please use it in accordance with the target website's terms.

**ไทย**

- สคริปต์นี้ทำงานเฉพาะบนหน้า `read/*` ของ hentainexus.com เท่านั้น
- ฟีเจอร์ต่าง ๆ ขึ้นอยู่กับโครงสร้างข้อมูลของเว็บไซต์ หากเว็บมีการเปลี่ยนแปลง อาจต้องอัปเดตสคริปต์ตาม
- โปรดใช้งานให้เป็นไปตามข้อกำหนดของเว็บไซต์ปลายทาง

---

## 📜 License

This project is published for personal use. If no license file is provided, all rights belong to the original author.

โปรเจกต์นี้เผยแพร่เพื่อการใช้งานส่วนตัว หากไม่มีไฟล์ระบุ License ให้ถือว่าเป็นสิทธิ์ของผู้เขียนต้นฉบับ
