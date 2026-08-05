(() => {
  const shareButton = document.querySelector("[data-share-profile]");
  if (!shareButton) return;

  const originalLabel = shareButton.textContent;
  const confirmCopy = () => {
    shareButton.textContent = "Odkaz zkopírován";
    window.setTimeout(() => {
      shareButton.textContent = originalLabel;
    }, 2200);
  };

  const copyFallback = () => {
    const field = document.createElement("textarea");
    field.value = window.location.href;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
    confirmCopy();
  };

  shareButton.addEventListener("click", async () => {
    const payload = {
      title: document.title,
      text: shareButton.dataset.shareText,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        confirmCopy();
        return;
      } catch {
        copyFallback();
        return;
      }
    }
    copyFallback();
  });
})();
