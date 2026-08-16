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


// ============================================
// WIN95 WINDOWS — drag, bring-to-front, minimize, close
// ============================================

let topZ = 100;

document.querySelectorAll(".win95-window").forEach((win) => {
    const titlebar = win.querySelector(".win95-titlebar");
    if (!titlebar) return;

    const bringToFront = () => {
        topZ += 1;
        win.style.zIndex = topZ;
    };

    // windows marked non-draggable (like the instructions box) skip drag/minimize/close wiring
    if (win.dataset.draggable === "false") {
        return;
    }

    bringToFront();

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const startDrag = (clientX, clientY) => {
        dragging = true;
        win.classList.add("dragging");
        bringToFront();
        const rect = win.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
    };

    const moveDrag = (clientX, clientY) => {
        if (!dragging) return;
        const parentRect = win.offsetParent.getBoundingClientRect();
        let newLeft = clientX - parentRect.left - offsetX;
        let newTop = clientY - parentRect.top - offsetY;

        // keep the titlebar from being dragged fully off the top/left edge
        newLeft = Math.max(-win.offsetWidth + 60, newLeft);
        newTop = Math.max(0, newTop);

        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
    };

    const endDrag = () => {
        dragging = false;
        win.classList.remove("dragging");
    };

    // Mouse events
    titlebar.addEventListener("mousedown", (e) => {
        if (e.target.closest(".win95-btn")) return;
        startDrag(e.clientX, e.clientY);
        e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener("mouseup", endDrag);

    // Touch events
    titlebar.addEventListener("touchstart", (e) => {
        if (e.target.closest(".win95-btn")) return;
        const t = e.touches[0];
        startDrag(t.clientX, t.clientY);
    }, { passive: true });
    window.addEventListener("touchmove", (e) => {
        if (!dragging) return;
        const t = e.touches[0];
        moveDrag(t.clientX, t.clientY);
    }, { passive: true });
    window.addEventListener("touchend", endDrag);

    // Bring to front on any click inside the window
    win.addEventListener("mousedown", bringToFront);

    // Double-click titlebar to minimize/restore
    titlebar.addEventListener("dblclick", (e) => {
        if (e.target.closest(".win95-btn")) return;
        win.classList.toggle("minimized");
    });

    // Titlebar buttons
    const minimizeBtn = win.querySelector(".win95-minimize");
    const closeBtn = win.querySelector(".win95-close");

    if (minimizeBtn) {
        minimizeBtn.addEventListener("click", () => {
            win.classList.toggle("minimized");
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            win.classList.add("closed");
        });
    }
});


// ============================================
// TASKBAR — live clock + start menu
// ============================================

function updateTaskbarClock() {
    const el = document.getElementById("taskbar-clock");
    if (!el) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    el.textContent = `${hours}:${minutes} ${ampm}`;
}

updateTaskbarClock();
setInterval(updateTaskbarClock, 15000);

const startBtn = document.querySelector(".start-btn");
const startMenu = document.getElementById("start-menu");

if (startBtn && startMenu) {
    startBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        startMenu.classList.toggle("open");
        startBtn.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
        if (!startMenu.contains(e.target) && e.target !== startBtn) {
            startMenu.classList.remove("open");
            startBtn.classList.remove("active");
        }
    });
}

const shutdownItem = document.getElementById("shutdown-item");
if (shutdownItem) {
    shutdownItem.addEventListener("click", () => {
        document.body.classList.add("shutting-down");
    });
}


// ============================================
// RANDOMIZE WIN95 WINDOW POSITIONS (perucica gallery)
// ============================================

(function randomizeWindowPositions() {
    const desktop = document.querySelector(".win95-desktop");
    if (!desktop) return;

    const windows = desktop.querySelectorAll(".win95-window:not([data-draggable='false'])");
    if (windows.length === 0) return;

    const winWidth = 300;
    const winHeightEstimate = 300; // rough estimate, titlebar + image + statusbar
    const topPadding = 100; // stay clear of the instructions window / navbar
    const sidePadding = 30;
    const bottomPadding = 50;

    const containerWidth = Math.max(desktop.clientWidth, 1000);
    const containerHeight = Math.max(desktop.clientHeight, 850);

    const usableWidth = Math.max(containerWidth - winWidth - sidePadding * 2, 100);
    const usableHeight = Math.max(containerHeight - winHeightEstimate - topPadding - bottomPadding, 100);

    windows.forEach((win) => {
        const left = sidePadding + Math.random() * usableWidth;
        const top = topPadding + Math.random() * usableHeight;
        win.style.left = `${Math.round(left)}px`;
        win.style.top = `${Math.round(top)}px`;
    });
})();


// ============================================
// LIGHTBOX — click a photo to open a rolling fullscreen gallery
// ============================================

(function setupLightbox() {
    const thumbs = Array.from(document.querySelectorAll(".win95-content img"));
    if (thumbs.length === 0) return;

    let currentIndex = 0;

    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML = `
        <div class="lightbox-window">
            <div class="win95-titlebar">
                <span class="win95-titlebar-label" id="lightbox-label">photo_viewer.exe</span>
                <div class="win95-titlebar-buttons">
                    <div class="win95-btn lightbox-close" title="close">✕</div>
                </div>
            </div>
            <div class="lightbox-body">
                <div class="lightbox-nav lightbox-prev" title="previous">‹</div>
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-nav lightbox-next" title="next">›</div>
            </div>
            <div class="win95-statusbar lightbox-status">
                <span id="lightbox-counter">1 / 1</span>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const imgEl = overlay.querySelector(".lightbox-image");
    const counterEl = overlay.querySelector("#lightbox-counter");
    const labelEl = overlay.querySelector("#lightbox-label");

    function show(index) {
        currentIndex = (index + thumbs.length) % thumbs.length;
        const src = thumbs[currentIndex].getAttribute("src");
        const alt = thumbs[currentIndex].getAttribute("alt") || "photo";
        imgEl.src = src;
        imgEl.alt = alt;
        counterEl.textContent = `${currentIndex + 1} / ${thumbs.length}`;
        labelEl.textContent = alt;
    }

    function open(index) {
        show(index);
        overlay.classList.add("open");
        document.body.classList.add("lightbox-open");
    }

    function close() {
        overlay.classList.remove("open");
        document.body.classList.remove("lightbox-open");
    }

    thumbs.forEach((thumb, i) => {
        thumb.setAttribute("draggable", "false");
        thumb.addEventListener("click", () => open(i));
    });

    overlay.querySelector(".lightbox-close").addEventListener("click", close);
    overlay.querySelector(".lightbox-prev").addEventListener("click", () => show(currentIndex - 1));
    overlay.querySelector(".lightbox-next").addEventListener("click", () => show(currentIndex + 1));

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });

    document.addEventListener("keydown", (e) => {
        if (!overlay.classList.contains("open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") show(currentIndex - 1);
        if (e.key === "ArrowRight") show(currentIndex + 1);
    });
})();