// 1. Unified Preloader & Reveal Logic
const preloader = document.getElementById("preloader");
const loaderLogo = document.querySelector(".loader-logo");
const loaderProgress = document.querySelector(".loader-progress");

let isPageLoaded = false;
let isLoaderAnimFinished = false;

window.addEventListener('load', () => {
    isPageLoaded = true;
    checkPreloaderExit();
}, { once: true });

function checkPreloaderExit() {
    if (isPageLoaded && isLoaderAnimFinished) {
        hidePreloader();
    }
}

function hidePreloader() {
    if (!preloader || preloader.style.display === "none") return;

    // Immediately disable pointer events to let user interact with background if reveal is fast
    preloader.style.pointerEvents = "none";

    gsap.to(preloader, {
        opacity: 0,
        duration: 1.2,
        ease: "power2.inOut",
        onStart: () => {
            // Start revealing hero content as soon as preloader begins to fade
            if (typeof revealHeroContent === "function") revealHeroContent();
        },
        onComplete: () => {
            preloader.style.display = "none";
        }
    });
}

function revealHeroContent() {
    gsap.to('#hero .reveal, #hero .fade-in, #hero .hero-content > div', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        clearProps: "all"
    });
}

// Initial preloader animation timeline
if (preloader && loaderLogo && loaderProgress) {
    gsap.set(loaderLogo, { opacity: 0, y: 20 });
    gsap.set('#hero .reveal, #hero .fade-in', { opacity: 0, y: 30 }); // Ensure initial hidden state

    const tl = gsap.timeline({
        onComplete: () => {
            isLoaderAnimFinished = true;
            checkPreloaderExit();
        }
    });

    tl.to(loaderLogo, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
    })
        .to(loaderProgress, {
            width: "100%",
            duration: 1.2,
            ease: "power2.inOut"
        }, "-=0.2");

    // Safety fallback: Force hide after 4 seconds regardless of load status
    setTimeout(() => {
        isPageLoaded = true;
        isLoaderAnimFinished = true;
        checkPreloaderExit();
    }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Plugins & Smooth Scroll Integration
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
        duration: 1.2,
        smooth: true,
        smoothWheel: true,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
    });

    // Clean sync: use GSAP ticker to drive Lenis
    function update(time) {
        lenis.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);


    // 3. Robust Hero Slider
    function initHeroSlider() {
        const slides = gsap.utils.toArray('.hero-slide');
        if (slides.length < 2) return;

        let currentIndex = 0;
        const duration = 1.5;
        const stayTime = 6;

        // Initialize slides state
        gsap.set(slides, { xPercent: 100, zIndex: 1, scale: 1, opacity: 1 });
        gsap.set(slides[0], { xPercent: 0, zIndex: 2 });

        // First slide scale animation
        gsap.to(slides[0], {
            scale: 1.2,
            duration: stayTime + duration,
            ease: "none"
        });

        function showNextSlide() {
            const current = slides[currentIndex];
            const nextIndex = (currentIndex + 1) % slides.length;
            const next = slides[nextIndex];

            // Setup next
            gsap.set(next, { xPercent: 100, zIndex: 3, scale: 1 });
            gsap.set(current, { zIndex: 2 });

            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.set(current, { xPercent: -100, zIndex: 1 });
                    currentIndex = nextIndex;
                    gsap.delayedCall(stayTime, showNextSlide);
                }
            });

            tl.to(next, {
                xPercent: 0,
                duration: duration,
                ease: "power3.inOut"
            })
                .to(current, {
                    xPercent: -30,
                    duration: duration,
                    ease: "power3.inOut"
                }, 0);

            // Staggered zoom for the new slide
            gsap.to(next, {
                scale: 1.2,
                duration: stayTime + duration,
                ease: "none"
            });
        }

        gsap.delayedCall(stayTime, showNextSlide);
    }

    initHeroSlider();

    // 4. Other Section Animations (Clean Implementation)
    const fadeSections = gsap.utils.toArray('section:not(#hero)');
    fadeSections.forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            duration: 1.5,
            ease: "power2.out",
            clearProps: "all"
        });
    });

    // 5. About Section Specifics (Badges & Circle)
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
        const aboutTL = gsap.timeline({
            scrollTrigger: {
                trigger: aboutSection,
                start: "top 70%"
            }
        });

        aboutTL.from('.about-img-wrap', { opacity: 0, x: -50, duration: 1 })
            .from('.rating-badge, .experience-badge', { opacity: 0, scale: 0, stagger: 0.2, ease: "back.out" }, "-=0.5")
            .from('.eb-circle-svg circle:last-child', { strokeDashoffset: 301, duration: 1.5, ease: "power2.inOut" }, "-=0.8");
    }

    // 6. Testimonial Slider
    const track = document.querySelector('.slider-track');
    const nextBtn = document.querySelector('.slider-next');
    const prevBtn = document.querySelector('.slider-prev');
    if (track && nextBtn && prevBtn) {
        let currentPos = 0;
        const cardWidth = 430;
        nextBtn.addEventListener('click', () => {
            currentPos = Math.min(currentPos + cardWidth, track.scrollWidth - track.parentElement.offsetWidth);
            gsap.to(track, { x: -currentPos, duration: 0.8, ease: "power2.out" });
        });
        prevBtn.addEventListener('click', () => {
            currentPos = Math.max(currentPos - cardWidth, 0);
            gsap.to(track, { x: -currentPos, duration: 0.8, ease: "power2.out" });
        });
    }

    // 7. Calculator Logic
    const wealthSlider = document.getElementById('wealth-slider');
    const investmentVal = document.getElementById('investment-val');
    const returnVal = document.getElementById('return-val');

    if (wealthSlider && investmentVal && returnVal) {
        wealthSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            investmentVal.textContent = `$${val.toLocaleString()}`;
            returnVal.textContent = `$${Math.round(val * 2.5).toLocaleString()}`;
        });
    }

    // 8. Mobile Menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // 8.1 Mobile Dropdown Toggles
    const dropdownLinks = document.querySelectorAll('.has-dropdown > a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = link.parentElement;

                // Close other dropdowns
                document.querySelectorAll('.has-dropdown').forEach(item => {
                    if (item !== parent) {
                        item.classList.remove('mobile-open');
                    }
                });

                parent.classList.toggle('mobile-open');
            }
        });
    });

    // 9. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target.offsetTop - 80);
            }
        });
    });

    // Refresh ScrollTrigger at end
    ScrollTrigger.refresh();
});
