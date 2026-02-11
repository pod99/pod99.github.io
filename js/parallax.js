// Parallax + logo assembly on scroll
(function () {
  const logo = document.getElementById("parallax-logo");
  if (!logo) return;

  const icons = Array.from(logo.querySelectorAll(".parallax-icon"));
  const basePositions = icons.map((icon, index) => {
    const angle = (index / icons.length) * Math.PI * 2;
    const radius = 10;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  });

  function updateParallax(event) {
    const rect = logo.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const relX = (event.clientX - centerX) / rect.width;
    const relY = (event.clientY - centerY) / rect.height;

    icons.forEach((icon, index) => {
      const depth = parseFloat(icon.dataset.parallaxDepth || "0.3");
      const offsetX = -relX * 12 * depth;
      const offsetY = -relY * 12 * depth;
      const base = basePositions[index];
      icon.style.transform = `translate(calc(-50% + ${base.x + offsetX}px), calc(-50% + ${
        base.y + offsetY
      }px)) scale(1)`;
      icon.style.opacity = "0.9";
    });
  }

  function assembleLogo(scrollY) {
    const max = window.innerHeight * 0.8;
    const t = Math.min(scrollY / max, 1);
    const tighten = 1 - t;

    icons.forEach((icon) => {
      const depth = parseFloat(icon.dataset.parallaxDepth || "0.3");
      const radius = 14 * tighten * depth;
      const angle = depth * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      icon.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${0.9 + 0.15 * t})`;
      icon.style.opacity = `${0.55 + 0.4 * t}`;
    });
  }

  window.addEventListener("mousemove", updateParallax);
  window.addEventListener("scroll", () => {
    assembleLogo(window.scrollY || window.pageYOffset);
  });

  // Initial state
  assembleLogo(0);
})();

