const boxes = document.querySelectorAll(".box");

// Fade in effect
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, {
  threshold: 0.2
});

boxes.forEach(el => observer.observe(el));


//3D tilt effect
const outers = document.querySelectorAll(".outer");

outers.forEach(outer => {
  const inner = outer.querySelector(".inner");

  outer.addEventListener("mousemove", (e) => {
    const rect = outer.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 9;
    const rotateY = (x - centerX) / 9;

    inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  outer.addEventListener("mouseleave", () => {
    inner.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
});