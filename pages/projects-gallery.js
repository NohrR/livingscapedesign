(() => {
  const list = document.getElementById("project-list");
  const title = document.getElementById("project-title");
  const copy = document.getElementById("project-copy");
  const preview = document.getElementById("project-preview");
  const dots = document.getElementById("project-dots");
  const prev = document.querySelector(".projects-carousel-prev");
  const next = document.querySelector(".projects-carousel-next");

  if (!list || !title || !copy || !preview || !dots || !prev || !next) return;

  const entries = Array.from(list.querySelectorAll(".projects-simple-entry"));

  const content = {
    "Interlock Cleaning": {
      images: ["../customer-photos/interlockclean_1.JPG", "../customer-photos/interlockclean_2.JPEG"],
      text: "Balanced front-of-house planting with a crisp architectural feel.",
    },
    "Garden Atmosphere": {
      images: ["../housebackdrop.jpg", "../icons/livingscapetitle.png", "../icons/livingscape.png"],
      text: "Layered greenery and tone-matched textures built for depth.",
    },
    "Signature Detail": {
      images: ["../housebackdrop.jpg", "../icons/livingscapetitle.png", "../icons/livingscape.png"],
      text: "Brand-forward presentation used to anchor the visual identity.",
    },
    "Presentation Mark": {
      images: ["../housebackdrop.jpg", "../icons/livingscapetitle.png", "../icons/livingscape.png"],
      text: "Refined title treatment with a soft, polished visual cadence.",
    },
  };

  let activePhotoIndex = 0;
  let activeTitle = entries[0]?.dataset.title || "Interlock Cleaning";

  const renderDots = () => {
    const selected = content[activeTitle];
    dots.innerHTML = "";
    selected.images.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `projects-dot${index === activePhotoIndex ? " is-active" : ""}`;
      dot.setAttribute("aria-label", `Go to photo ${index + 1}`);
      dot.addEventListener("click", () => {
        activePhotoIndex = index;
        renderCarousel();
      });
      dots.appendChild(dot);
    });
  };

  const renderCarousel = () => {
    const selected = content[activeTitle];
    const image = selected.images[activePhotoIndex];
    preview.src = image;
    preview.alt = `${activeTitle} preview ${activePhotoIndex + 1}`;
    copy.textContent = selected.text;
    title.textContent = activeTitle;
    renderDots();
  };

  const setActive = (button) => {
    activeTitle = button.dataset.title;
    activePhotoIndex = 0;
    renderCarousel();

    entries.forEach((entry) => {
      entry.classList.toggle("is-active", entry === button);
    });
  };

  list.addEventListener("click", (event) => {
    const button = event.target.closest(".projects-simple-entry");
    if (!button) return;
    setActive(button);
  });

  prev.addEventListener("click", () => {
    const selected = content[activeTitle];
    activePhotoIndex = (activePhotoIndex - 1 + selected.images.length) % selected.images.length;
    renderCarousel();
  });

  next.addEventListener("click", () => {
    const selected = content[activeTitle];
    activePhotoIndex = (activePhotoIndex + 1) % selected.images.length;
    renderCarousel();
  });

  if (entries[0]) {
    setActive(entries[0]);
  }
})();
