// =====================
// 저장 키
// =====================

document.addEventListener("DOMContentLoaded", () => {

const GALLERY_KEY = "malangcong_gallery_v1";
const GUEST_KEY = "malangcong_guestbook_v1";

// =====================
// 유틸
// =====================
function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// =====================
// 1) 갤러리
// =====================
const galleryInput = document.getElementById("galleryInput");
const galleryGrid = document.getElementById("galleryGrid");
const clearGalleryBtn = document.getElementById("clearGalleryBtn");

function renderGallery() {
  if (!galleryGrid) return;
  const items = loadJSON(GALLERY_KEY, []);
  galleryGrid.innerHTML = "";

  if (items.length === 0) {
    galleryGrid.innerHTML = `<div class="small-muted">아직 사진이 없어요. 위에서 업로드 해줘 😄</div>`;
    return;
  }

  items.forEach((src, idx) => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.innerHTML = `
      <img src="${src}" alt="gallery-${idx}" />
      <button type="button" aria-label="delete">삭제</button>
    `;
    div.querySelector("button").addEventListener("click", () => {
      const next = loadJSON(GALLERY_KEY, []).filter((_, i) => i !== idx);
      saveJSON(GALLERY_KEY, next);
      renderGallery();
    });
    galleryGrid.appendChild(div);
  });
}

galleryInput?.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  // ⚠️ 로컬스토리지는 용량이 작아서, 너무 많은/큰 사진은 에러날 수 있어.
  // 필요하면 나중에 "이미지 압축" 기능도 붙여줄게.
  const existing = loadJSON(GALLERY_KEY, []);

  for (const file of files) {
    const dataUrl = await readFileAsDataURL(file);
    existing.unshift(dataUrl);
  }

  saveJSON(GALLERY_KEY, existing);
  galleryInput.value = "";
  renderGallery();
});

clearGalleryBtn?.addEventListener("click", () => {
  if (!confirm("갤러리를 비울까?")) return;
  localStorage.removeItem(GALLERY_KEY);
  renderGallery();
});

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

renderGallery();

// =====================
// 슬라이더 갤러리 (관리자는 폴더에 사진 넣기)
// =====================
const slides = [
  { src: "images/gallery/01.jpg", cap: "베트남 콩떡 ✨" },
  { src: "images/gallery/02.jpg", cap: "이불 속 말랑콩떡" },
  { src: "images/gallery/03.jpg", cap: "바보같은 콩떡 모먼트" },
];

let cur = 0;
const slideImg = document.getElementById("slideImg");
const slideCap = document.getElementById("slideCap");
const dotsWrap = document.getElementById("dots");

function renderSlide(i){
  if (!slideImg) return;
  cur = (i + slides.length) % slides.length;
  slideImg.src = slides[cur].src;
  slideCap.textContent = slides[cur].cap || "";
  renderDots();
}

function renderDots(){
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";
  slides.forEach((_, idx) => {
    const b = document.createElement("button");
    b.className = "dot" + (idx === cur ? " active" : "");
    b.type = "button";
    b.addEventListener("click", () => renderSlide(idx));
    dotsWrap.appendChild(b);
  });
}

document.querySelector(".nav.prev")?.addEventListener("click", () => renderSlide(cur - 1));
document.querySelector(".nav.next")?.addEventListener("click", () => renderSlide(cur + 1));

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") renderSlide(cur - 1);
  if (e.key === "ArrowRight") renderSlide(cur + 1);
});

if (slides.length > 0) renderSlide(0);
});
