const galleryLightbox = document.querySelector("#gallery-lightbox");
const galleryLightboxImage = document.querySelector("#gallery-lightbox-image");
const galleryLightboxCaption = document.querySelector("#gallery-lightbox-caption");
const galleryLightboxCount = document.querySelector("#gallery-lightbox-count");
const galleryLightboxClose = galleryLightbox.querySelector(".gallery-lightbox-close");
const galleryLightboxPrevious = galleryLightbox.querySelector(".gallery-lightbox-prev");
const galleryLightboxNext = galleryLightbox.querySelector(".gallery-lightbox-next");
const galleryButtons = [...document.querySelectorAll(".gallery-open")];
let activeGalleryIndex = 0;
let lastGalleryTrigger = null;

function showGalleryImage(index) {
  activeGalleryIndex = (index + galleryButtons.length) % galleryButtons.length;
  const button = galleryButtons[activeGalleryIndex];
  const figure = button.closest(".gallery-item");
  const image = button.querySelector("img");
  const label = figure.querySelector("figcaption span")?.textContent.trim();
  const description = figure.querySelector("figcaption p")?.textContent.trim() || image.alt;

  galleryLightboxImage.src = image.currentSrc || image.src;
  galleryLightboxImage.alt = image.alt;
  galleryLightboxCaption.textContent = label ? `${label} — ${description}` : description;
  galleryLightboxCount.textContent = `${activeGalleryIndex + 1} / ${galleryButtons.length}`;
}

function openGalleryImage(index, trigger) {
  lastGalleryTrigger = trigger;
  showGalleryImage(index);
  galleryLightbox.showModal();
  document.body.classList.add("modal-open");
  galleryLightboxClose.focus();
}

function closeGalleryImage(restoreFocus = true) {
  if (!galleryLightbox.open) return;
  galleryLightbox.close();
  document.body.classList.remove("modal-open");
  if (restoreFocus) lastGalleryTrigger?.focus();
  lastGalleryTrigger = null;
}

galleryButtons.forEach((button, index) => {
  button.addEventListener("click", () => openGalleryImage(index, button));
});
galleryLightboxClose.addEventListener("click", () => closeGalleryImage());
galleryLightboxPrevious.addEventListener("click", () => showGalleryImage(activeGalleryIndex - 1));
galleryLightboxNext.addEventListener("click", () => showGalleryImage(activeGalleryIndex + 1));
galleryLightbox.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) closeGalleryImage();
});
galleryLightbox.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeGalleryImage();
});
galleryLightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showGalleryImage(activeGalleryIndex - 1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showGalleryImage(activeGalleryIndex + 1);
  }
});
