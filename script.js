(() => {
    const scrollBg = document.getElementById("scrollBg");
    const phoneStage = document.getElementById("phoneStage");
    const phoneCard = document.getElementById("phoneCard");
    const orbitRotators = document.querySelectorAll(".orbit-spinner");
    const reveals = document.querySelectorAll(".reveal");
    const heroBgWord = document.querySelector(".hero-bg-word");
    const heroRight = document.querySelector(".hero-right");
    const projectsCarousel = document.querySelector(".projects-grid");
    const projectCards = projectsCarousel ? Array.from(projectsCarousel.querySelectorAll(".project-card")) : [];
    const projectCarouselCurrent = document.getElementById("projectCarouselCurrent");
    const serviceCards = Array.from(document.querySelectorAll(".service-card"));
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ORBIT_ROTATION_DEGREES = 180;

    let latestScrollY = window.scrollY;
    let scrollFrame = null;
    let isMobileViewport = mobileQuery.matches;
    let reduceMotion = reduceMotionQuery.matches;
    let orbitGeometry = { start: 0, distance: 1 };
    let marqueeGeometry = { start: 0, distance: 1, maxTravel: 0 };
    let projectScrollFrame = null;

    function animateBackground(y) {
      const x1 = 14 + Math.sin(y * 0.0022) * 10;
      const y1 = 18 + Math.cos(y * 0.0022) * 8;
      const x2 = 82 + Math.cos(y * 0.0017) * 12;
      const y2 = 16 + Math.sin(y * 0.0017) * 10;
      const x3 = 52 + Math.sin(y * 0.0012) * 8;
      const y3 = 42 + Math.cos(y * 0.0012) * 8;
      const x4 = 78 + Math.cos(y * 0.0015) * 14;
      const y4 = 22 + Math.sin(y * 0.0015) * 12;
      const x5 = 28 + Math.sin(y * 0.0014) * 16;
      const y5 = 78 + Math.cos(y * 0.0014) * 14;

      if (scrollBg) {
        scrollBg.style.background = `
          radial-gradient(circle at ${x1}% ${y1}%, rgba(255, 255, 255, 0.72), transparent 18%),
          radial-gradient(circle at ${x2}% ${y2}%, rgba(255, 255, 255, 0.52), transparent 22%),
          radial-gradient(circle at ${x3}% ${y3}%, rgba(255, 255, 255, 0.26), transparent 28%),
          radial-gradient(circle at ${x4}% ${y4}%, rgba(47, 79, 54, 0.42), transparent 28%),
          radial-gradient(circle at ${x5}% ${y5}%, rgba(95, 127, 98, 0.36), transparent 32%),
          radial-gradient(circle at 72% 70%, rgba(122, 156, 126, 0.28), transparent 24%),
          radial-gradient(circle at 50% 52%, rgba(62, 95, 68, 0.18), transparent 36%),
          linear-gradient(to bottom, #edf6ea 0%, #d8e8d4 30%, #bfd5bc 68%, #dbe8d8 100%)
        `;
      }
    }

    function cacheScrollGeometry() {
      isMobileViewport = mobileQuery.matches;
      reduceMotion = reduceMotionQuery.matches;

      if (heroRight) {
        const rect = heroRight.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionHeight = rect.height;
        orbitGeometry = {
          start: sectionTop - window.innerHeight,
          distance: Math.max(1, sectionHeight + window.innerHeight)
        };
      }

      if (heroBgWord) {
        const start = heroBgWord.offsetTop - window.innerHeight * 0.85;
        const end = heroBgWord.offsetTop + heroBgWord.offsetHeight - window.innerHeight * 0.15;
        marqueeGeometry = {
          start,
          distance: Math.max(1, end - start),
          maxTravel: Math.max(0, heroBgWord.scrollWidth - window.innerWidth + 32)
        };
      }

      syncServiceAccordion();
      requestScrollUpdate();
    }

    function setServiceCardState(card, isOpen) {
      const button = card.querySelector(".service-toggle");
      const panel = card.querySelector(".service-panel");

      card.classList.toggle("is-open", isOpen);

      if (button) {
        button.setAttribute("aria-expanded", String(isOpen));
      }

      if (panel) {
        panel.setAttribute("aria-hidden", String(!isOpen));
      }
    }

    function openServiceCard(selectedCard) {
      serviceCards.forEach((card) => {
        setServiceCardState(card, card === selectedCard);
      });
    }

    function syncServiceAccordion() {
      if (serviceCards.length === 0) {
        return;
      }

      if (!isMobileViewport) {
        serviceCards.forEach((card) => {
          setServiceCardState(card, true);
        });
        return;
      }

      const openCard = serviceCards.find((card) => card.classList.contains("is-open")) || serviceCards[0];
      openServiceCard(openCard);
    }

    function updateProjectIndicator() {
      projectScrollFrame = null;

      if (!projectsCarousel || !projectCarouselCurrent || projectCards.length === 0) {
        return;
      }

      const carouselLeft = projectsCarousel.getBoundingClientRect().left;
      let activeIndex = 0;
      let closestDistance = Infinity;

      projectCards.forEach((card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - carouselLeft);

        if (distance < closestDistance) {
          closestDistance = distance;
          activeIndex = index;
        }
      });

      projectCarouselCurrent.textContent = String(activeIndex + 1);
    }

    function requestProjectIndicatorUpdate() {
      if (projectScrollFrame === null) {
        projectScrollFrame = window.requestAnimationFrame(updateProjectIndicator);
      }
    }

    function animateOnScroll(y) {
      const orbitProgress = Math.min(1, Math.max(0, (y - orbitGeometry.start) / orbitGeometry.distance));
      const orbitRotation = reduceMotion ? 0 : orbitProgress * ORBIT_ROTATION_DEGREES;

      if (phoneStage && isMobileViewport) {
        phoneStage.style.transform = "translate3d(-50%, -50%, 0)";
      }

      orbitRotators.forEach((rotator) => {
        rotator.style.setProperty("--orbit-rotation", `${orbitRotation}deg`);
        rotator.style.transform = `translateZ(0) rotate(${orbitRotation}deg)`;
      });

      if (heroBgWord) {
        if (isMobileViewport) {
          const marqueeProgress = Math.min(1, Math.max(0, (y - marqueeGeometry.start) / marqueeGeometry.distance));
          const wordOffset = reduceMotion ? 0 : marqueeProgress * -marqueeGeometry.maxTravel;
          heroBgWord.style.setProperty("--word-offset", `${wordOffset}px`);
        } else {
          heroBgWord.style.setProperty("--word-offset", `${y * 2}px`);
        }
      }
    }

    function revealOnScroll() {
      const trigger = window.innerHeight * 0.88;

      reveals.forEach((item) => {
        const rect = item.getBoundingClientRect();

        if (rect.top < trigger) {
          item.classList.add("visible");
        }
      });
    }

    function updateScrollFrame() {
      scrollFrame = null;
      animateOnScroll(latestScrollY);
      revealOnScroll();
      animateBackground(latestScrollY);
    }

    function requestScrollUpdate() {
      if (scrollFrame === null) {
        scrollFrame = window.requestAnimationFrame(updateScrollFrame);
      }
    }

    function handleScroll() {
      latestScrollY = window.scrollY;
      requestScrollUpdate();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("load", () => {
      latestScrollY = window.scrollY;
      cacheScrollGeometry();
    });
    window.addEventListener("resize", cacheScrollGeometry);
    window.addEventListener("orientationchange", cacheScrollGeometry);
    reduceMotionQuery.addEventListener("change", cacheScrollGeometry);

    if (projectsCarousel) {
      projectsCarousel.addEventListener("scroll", requestProjectIndicatorUpdate, { passive: true });
      window.addEventListener("load", requestProjectIndicatorUpdate);
      window.addEventListener("resize", requestProjectIndicatorUpdate);
    }

    serviceCards.forEach((card) => {
      const button = card.querySelector(".service-toggle");

      if (!button) {
        return;
      }

      button.addEventListener("click", () => {
        if (!isMobileViewport) {
          return;
        }

        openServiceCard(card);
      });
    });

    if (phoneStage && phoneCard) {
      phoneStage.addEventListener("mousemove", (event) => {
        if (!isMobileViewport) {
          phoneCard.style.transform = "translateY(-4px)";
          return;
        }

        const rect = phoneStage.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 8;
        const rotateX = ((centerY - y) / centerY) * 8;

        phoneCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      phoneStage.addEventListener("mouseleave", () => {
        phoneCard.style.transform = isMobileViewport
          ? "rotateX(0deg) rotateY(0deg) translateY(0px)"
          : "translateY(0px)";
      });
    }


  /* ==============================
     Contact form behavior
     ============================== */
  const contactForm = document.getElementById("contactForm");
  const formResponse = document.getElementById("formResponse");
  const phoneInput = document.getElementById("phone-number");

  function formatPhoneNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    const len = digits.length;

    if (len === 0) return "";
    if (len < 4) return `(${digits}`;
    if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", (event) => {
      event.target.value = formatPhoneNumber(event.target.value);
    });
  }

  if (contactForm && formResponse) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      formResponse.textContent = "Submitting your inquiry...";
      formResponse.style.color = "var(--green-dark)";

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(contactForm)).toString()
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Form submission failed");
          }

          formResponse.textContent = "Your inquiry has been submitted. MK Media Management will be in contact with you soon.";
          formResponse.style.color = "var(--green-dark)";
          contactForm.reset();
        })
        .catch(() => {
          formResponse.textContent = "Something went wrong. Please try again, or email MK Media Management directly at mkmediamanagementllc@gmail.com.";
          formResponse.style.color = "#c0392b";
        });
    });
  }
})();
