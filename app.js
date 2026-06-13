/**
 * Swell Clean - Global Application Script
 * Manages Before/After Slider, Nautical Map Canvas, Pressure Washing Video Canvas,
 * FAQ Accordion, Mobile Navbar, Calculator, Parallax Scroll, and Sea Breeze Particles.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initHeroParticles();
    initBeforeAfterSlider();
    initFAQAccordion();
    initNauticalMap();
    initMockVideoPlayer();
    initQuoteCalculator();
    initDuneScrollParallax();
    initServiceModals();
    initTrustModals();
});

/* ==========================================================================
   HEADER & NAVIGATION SCROLL EFFECT
   ========================================================================== */
function initHeaderScroll() {
    const header = document.getElementById('header');
    const scrollFill = document.getElementById('tide-scroll-fill');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Calculate page scroll percentage and update the tide bar
        if (scrollFill) {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollableDistance = documentHeight - windowHeight;
            
            if (scrollableDistance > 0) {
                const scrolledPercent = (window.scrollY / scrollableDistance) * 100;
                scrollFill.style.width = `${scrolledPercent}%`;
            }
        }
    });
}

function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link-item');

    toggleBtn.addEventListener('click', () => {
        toggleBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/* ==========================================================================
   HERO FLOATING SEA BREEZE PARTICLES
   ========================================================================== */
function initHeroParticles() {
    const container = document.getElementById('sea-breeze-particles');
    if (!container) return;

    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('sea-breeze-particle');
    
    // Random sizes, speeds, and vertical placements
    const size = 4 + Math.random() * 8;
    const startY = Math.random() * 100;
    const duration = 15 + Math.random() * 20;
    const delay = Math.random() * -30; // Negative delay so they start scattered

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.top = `${startY}%`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    
    // Wave motion wobble
    const wobbleHeight = 20 + Math.random() * 40;
    particle.style.setProperty('--wobble-y', `${wobbleHeight}px`);

    container.appendChild(particle);
}

/* ==========================================================================
   BEFORE & AFTER DRAG SLIDER
   ========================================================================== */
function initBeforeAfterSlider() {
    const container = document.getElementById('ba-slider-container');
    const slider = document.getElementById('ba-slider');
    const handle = document.getElementById('ba-slider-handle');
    const clipDiv = document.getElementById('after-img-clip-div');
    const afterImg = document.getElementById('img-after');

    if (!container || !slider || !handle || !clipDiv || !afterImg) return;

    let active = false;

    // Set static width of afterImg on load/resize to match container max width
    function setImgWidth() {
        const sliderWidth = slider.offsetWidth;
        afterImg.style.width = `${sliderWidth}px`;
    }
    window.addEventListener('resize', setImgWidth);
    setImgWidth();

    function slideMove(xPos) {
        const rect = slider.getBoundingClientRect();
        let position = ((xPos - rect.left) / rect.width) * 100;
        
        // Bounds checking
        if (position < 0) position = 0;
        if (position > 100) position = 100;

        handle.style.left = `${position}%`;
        clipDiv.style.width = `${position}%`;
    }

    // Mouse Events
    slider.addEventListener('mousedown', (e) => {
        active = true;
        slideMove(e.clientX);
    });

    window.addEventListener('mouseup', () => {
        active = false;
    });

    slider.addEventListener('mousemove', (e) => {
        if (!active) return;
        slideMove(e.clientX);
    });

    // Touch Events for Mobile
    slider.addEventListener('touchstart', (e) => {
        active = true;
        slideMove(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => {
        active = false;
    });

    slider.addEventListener('touchmove', (e) => {
        if (!active) return;
        slideMove(e.touches[0].clientX);
    });
}

/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */
function initFAQAccordion() {
    const items = document.querySelectorAll('.faq-item');

    items.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const container = item.querySelector('.faq-answer-container');

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            items.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
                i.querySelector('.faq-answer-container').style.maxHeight = '0';
                i.querySelector('.faq-answer-container').setAttribute('hidden', '');
            });

            // Toggle clicked item
            if (!isActive) {
                item.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
                container.removeAttribute('hidden');
                container.style.maxHeight = `${container.scrollHeight}px`;
            }
        });
    });
}

/* ==========================================================================
   INTERACTIVE NAUTICAL MAP
   ========================================================================== */
function initNauticalMap() {
    const canvas = document.getElementById('nautical-map-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = document.getElementById('nautical-map-box');

    let width = 0;
    let height = 0;
    
    // Map ports coordinates (normalized 0-1)
    const ports = [
        { name: "Malibu Cove", x: 0.25, y: 0.45, phone: "(310) 555-9274", active: true, radius: 6 },
        { name: "Pacific Palisades", x: 0.45, y: 0.38, phone: "(310) 555-9274", active: true, radius: 6 },
        { name: "Marina Del Rey", x: 0.62, y: 0.55, phone: "(310) 555-9274", active: true, radius: 6 },
        { name: "Laguna Bluffs", x: 0.82, y: 0.75, phone: "(949) 555-1212", active: true, radius: 6 }
    ];

    let hoveredPort = null;
    let waveOffset = 0;

    function resize() {
        width = container.offsetWidth;
        height = container.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking for tooltip
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mX = e.clientX - rect.left;
        const mY = e.clientY - rect.top;

        hoveredPort = null;
        ports.forEach(port => {
            const px = port.x * width;
            const py = port.y * height;
            const dist = Math.sqrt((mX - px) ** 2 + (mY - py) ** 2);
            if (dist < 15) {
                hoveredPort = port;
            }
        });
    });

    function drawMap() {
        ctx.clearRect(0, 0, width, height);

        // 1. Draw parchment texture background (parchment yellow)
        ctx.fillStyle = '#F7EBD4';
        ctx.fillRect(0, 0, width, height);

        // 2. Draw Nautical Lat/Long lines grid
        ctx.strokeStyle = 'rgba(74, 60, 49, 0.06)';
        ctx.lineWidth = 1;
        const gridSize = 60;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // 3. Draw Coastal Shore Outline procedurally
        ctx.strokeStyle = 'rgba(2, 62, 138, 0.15)';
        ctx.fillStyle = '#FAEED6'; // Slightly lighter land mass
        ctx.lineWidth = 2.5;

        // Draw Land Mass curve
        ctx.beginPath();
        ctx.moveTo(0, height * 0.1);
        ctx.bezierCurveTo(width * 0.3, height * 0.25, width * 0.5, height * 0.2, width * 0.7, height * 0.6);
        ctx.bezierCurveTo(width * 0.8, height * 0.8, width * 0.9, height * 0.7, width, height * 0.9);
        ctx.lineTo(width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 4. Draw Coastal wave rings (depth contours)
        ctx.strokeStyle = 'rgba(0, 119, 182, 0.06)';
        for (let offset = 8; offset <= 24; offset += 8) {
            ctx.beginPath();
            ctx.moveTo(0, height * 0.1 + offset);
            ctx.bezierCurveTo(width * 0.3, height * 0.25 + offset, width * 0.5, height * 0.2 + offset, width * 0.7, height * 0.6 + offset);
            ctx.bezierCurveTo(width * 0.8, height * 0.8 + offset, width * 0.9, height * 0.7 + offset, width, height * 0.9 + offset);
            ctx.stroke();
        }

        // 5. Draw ocean compass coordinates indicators
        ctx.fillStyle = 'rgba(74, 60, 49, 0.3)';
        ctx.font = '9px var(--font-mono)';
        ctx.fillText('34°01\'N', 20, 20);
        ctx.fillText('118°48\'W', 20, 35);
        ctx.fillText('PACIFIC OCEAN', width * 0.15, height * 0.75);

        // 6. Draw Sailing Boat shape representation
        drawLittleBoat(ctx, width * 0.2, height * 0.6, waveOffset);

        // 7. Draw Ports
        waveOffset += 0.05;
        ports.forEach(port => {
            const px = port.x * width;
            const py = port.y * height;

            // Pulsing marker rings
            const pulseRadius = port.radius + Math.sin(waveOffset * 1.5) * 4;
            ctx.strokeStyle = port === hoveredPort ? 'var(--coral-accent)' : 'rgba(2, 62, 138, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Port solid dot
            ctx.fillStyle = port === hoveredPort ? 'var(--coral-accent)' : 'var(--deep-water)';
            ctx.beginPath();
            ctx.arc(px, py, port.radius, 0, Math.PI * 2);
            ctx.fill();

            // Port Name Label
            ctx.font = 'bold 12px var(--font-body)';
            ctx.fillStyle = 'var(--dark-wood)';
            ctx.textAlign = 'left';
            ctx.fillText(port.name, px + 12, py + 4);
        });

        // 8. Draw Hovered Tooltip Card
        if (hoveredPort) {
            const px = hoveredPort.x * width;
            const py = hoveredPort.y * height;
            
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.strokeStyle = 'var(--driftwood)';
            ctx.lineWidth = 1;
            
            const tooltipW = 160;
            const tooltipH = 75;
            
            // Adjust tooltip coordinates to stay inside canvas bounds
            let tx = px + 15;
            let ty = py - 85;
            if (tx + tooltipW > width) tx = px - tooltipW - 15;
            if (ty < 0) ty = py + 15;

            // Draw card shadow and body
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(tx, ty, tooltipW, tooltipH, 4);
            ctx.fill();
            ctx.shadowColor = 'transparent'; // Reset shadow
            ctx.stroke();

            // Text
            ctx.fillStyle = 'var(--deep-water)';
            ctx.font = 'bold 11px var(--font-body)';
            ctx.fillText(hoveredPort.name, tx + 12, ty + 20);
            
            ctx.fillStyle = 'var(--palm-green)';
            ctx.font = '9px var(--font-mono)';
            ctx.fillText('● RESORT PORT ACTIVE', tx + 12, ty + 38);

            ctx.fillStyle = '#555';
            ctx.font = '10px var(--font-body)';
            ctx.fillText(`Care Line: ${hoveredPort.phone}`, tx + 12, ty + 56);
            ctx.restore();
        }

        requestAnimationFrame(drawMap);
    }

    function drawLittleBoat(ctx, x, y, wobble) {
        ctx.save();
        ctx.translate(x, y + Math.sin(wobble) * 2);
        ctx.rotate(Math.sin(wobble * 0.8) * 0.04);
        ctx.fillStyle = 'rgba(74, 60, 49, 0.4)';
        ctx.strokeStyle = 'rgba(74, 60, 49, 0.5)';
        ctx.lineWidth = 1;

        // Hull
        ctx.beginPath();
        ctx.moveTo(-10, 2);
        ctx.lineTo(8, 2);
        ctx.lineTo(12, -2);
        ctx.lineTo(-12, -2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Mast
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(0, -18);
        ctx.stroke();

        // Sails
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.quadraticCurveTo(5, -10, 0, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }

    drawMap();
}

/* ==========================================================================
   CINEMATIC VIDEO PROCEDURAL SIMULATOR
   ========================================================================== */
function initMockVideoPlayer() {
    const playOverlay = document.getElementById('video-play-overlay');
    const playBtn = document.getElementById('video-play-btn');
    const playerContainer = document.getElementById('mock-video-player');
    const closeBtn = document.getElementById('btn-close-video');
    const canvas = document.getElementById('video-animation-canvas');

    if (!playOverlay || !playBtn || !playerContainer || !closeBtn || !canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Player controls
    const playPauseBtn = document.getElementById('vid-play-pause');
    const progressFill = document.getElementById('vid-progress');
    const timeDisplay = document.getElementById('vid-time');

    let animationId = null;
    let isPlaying = false;
    let videoTime = 0; // Current timestamp in frames
    const durationFrames = 900; // 15 seconds at 60fps
    
    // Procedural deck states
    let deckWidth = 800;
    let deckHeight = 450;
    let dirtyMask = []; // 2D grid representing deck moss density

    // Spray nozzle position
    let nozzleX = 100;
    let nozzleY = 100;
    let nozzleTargetX = 100;
    let nozzleTargetY = 100;

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        deckWidth = canvas.width;
        deckHeight = canvas.height;
        initDirtyMask();
    }

    function initDirtyMask() {
        dirtyMask = [];
        const rows = 30;
        const cols = 50;
        for (let r = 0; r < rows; r++) {
            dirtyMask[r] = [];
            for (let c = 0; c < cols; c++) {
                // Initialize dirt density: more dirty in patches
                const baseDirt = 0.5 + Math.sin(r/4) * 0.2 + Math.cos(c/4) * 0.3;
                dirtyMask[r][c] = Math.min(1.0, Math.max(0, baseDirt));
            }
        }
    }

    playBtn.addEventListener('click', startVideo);
    playOverlay.addEventListener('click', startVideo);

    closeBtn.addEventListener('click', stopVideo);

    playPauseBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playPauseBtn.innerHTML = isPlaying 
            ? '<i class="fa-solid fa-pause"></i>' 
            : '<i class="fa-solid fa-play"></i>';
    });

    function startVideo() {
        playOverlay.style.display = 'none';
        playerContainer.style.display = 'flex';
        resizeCanvas();
        isPlaying = true;
        videoTime = 0;
        animationId = requestAnimationFrame(videoLoop);
    }

    function stopVideo() {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        playerContainer.style.display = 'none';
        playOverlay.style.display = 'flex';
    }

    function videoLoop() {
        if (!isPlaying) {
            animationId = requestAnimationFrame(videoLoop);
            return;
        }

        // 1. Draw Wood Deck Planks
        ctx.fillStyle = '#A0522D'; // Sienna base wood color
        ctx.fillRect(0, 0, deckWidth, deckHeight);
        
        const plankCount = 8;
        const plankH = deckHeight / plankCount;
        ctx.strokeStyle = '#5C2D16';
        ctx.lineWidth = 3;
        for (let i = 1; i < plankCount; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * plankH);
            ctx.lineTo(deckWidth, i * plankH);
            ctx.stroke();
        }

        // 2. Draw Dirty Moss layer overlay
        const cellW = deckWidth / 50;
        const cellH = deckHeight / 30;
        for (let r = 0; r < 30; r++) {
            for (let c = 0; c < 50; c++) {
                const dirt = dirtyMask[r][c];
                if (dirt > 0.05) {
                    ctx.fillStyle = `rgba(30, 60, 20, ${dirt * 0.85})`; // Dark moss green
                    ctx.fillRect(c * cellW, r * cellH, cellW + 1, cellH + 1);
                }
            }
        }

        // 3. Move simulated pressure wand nozzle in sweeping paths
        // Sine wave sweeping path
        const timeRad = (videoTime / durationFrames) * Math.PI * 2 * 10; // 10 sweeps
        nozzleTargetX = ((videoTime / durationFrames) * deckWidth * 1.1) - (deckWidth * 0.05);
        nozzleTargetY = (deckHeight * 0.5) + Math.sin(timeRad) * (deckHeight * 0.4);

        // Smooth spray node positioning
        nozzleX += (nozzleTargetX - nozzleX) * 0.2;
        nozzleY += (nozzleTargetY - nozzleY) * 0.2;

        // Clean dirt mask where nozzle sprays
        const cleanRadius = 45;
        const cleanCellRadiusC = Math.ceil(cleanRadius / cellW);
        const cleanCellRadiusR = Math.ceil(cleanRadius / cellH);
        
        const nozzleCellC = Math.floor(nozzleX / cellW);
        const nozzleCellR = Math.floor(nozzleY / cellH);

        for (let dr = -cleanCellRadiusR; dr <= cleanCellRadiusR; dr++) {
            for (let dc = -cleanCellRadiusC; dc <= cleanCellRadiusC; dc++) {
                const r = nozzleCellR + dr;
                const c = nozzleCellC + dc;
                if (r >= 0 && r < 30 && c >= 0 && c < 50) {
                    const cx = c * cellW + cellW/2;
                    const cy = r * cellH + cellH/2;
                    const dist = Math.sqrt((cx - nozzleX) ** 2 + (cy - nozzleY) ** 2);
                    if (dist < cleanRadius) {
                        const falloff = dist / cleanRadius;
                        dirtyMask[r][c] = Math.min(dirtyMask[r][c], falloff * 0.3);
                    }
                }
            }
        }

        // 4. Draw high-pressure water spray & mist
        // Spray Fan
        const grad = ctx.createRadialGradient(nozzleX, nozzleY, 5, nozzleX, nozzleY, 40);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.3, 'rgba(144, 224, 239, 0.6)');
        grad.addColorStop(1, 'rgba(250, 250, 250, 0.0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nozzleX, nozzleY, 40, 0, Math.PI * 2);
        ctx.fill();

        // Spray nozzle wand representation
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(nozzleX - 80, nozzleY - 120);
        ctx.lineTo(nozzleX, nozzleY);
        ctx.stroke();

        // 5. Update timeline progress bar
        videoTime++;
        if (videoTime > durationFrames) {
            // Restart video
            videoTime = 0;
            initDirtyMask();
        }

        const pct = (videoTime / durationFrames) * 100;
        progressFill.style.width = `${pct}%`;

        // Time calculations
        const currentSec = Math.floor(videoTime / 60);
        const totalSec = Math.floor(durationFrames / 60);
        timeDisplay.innerText = `0:${currentSec.toString().padStart(2, '0')} / 0:${totalSec}`;

        animationId = requestAnimationFrame(videoLoop);
    }
}

/* ==========================================================================
   RESORT WASH CALCULATOR FORM
   ========================================================================== */
function initQuoteCalculator() {
    const form = document.getElementById('estimator-form');
    const sizeSelect = document.getElementById('property-size');
    const serviceSelect = document.getElementById('wash-service');
    const priceDisplay = document.getElementById('calc-price-display');
    const successMsg = document.getElementById('form-success');

    if (!form || !sizeSelect || !serviceSelect || !priceDisplay || !successMsg) return;

    function calculatePrice() {
        const sqft = parseInt(sizeSelect.value);
        const service = serviceSelect.value;

        // Base price scale by sizing cottage -> compound
        let base = 250;
        if (sqft === 2500) base = 480;
        if (sqft === 4500) base = 850;
        if (sqft === 6000) base = 1350;

        // Service modifier scale
        let modifier = 1.0;
        if (service === 'house') modifier = 1.0;
        if (service === 'roof') modifier = 1.3;
        if (service === 'concrete') modifier = 0.8;
        if (service === 'gutter') modifier = 0.5;
        if (service === 'deck') modifier = 0.9;
        if (service === 'commercial') modifier = 2.5;
        if (service === 'full') modifier = 1.6;

        const calculated = Math.round(base * modifier);
        // Display range
        const low = Math.round(calculated * 0.9);
        const high = Math.round(calculated * 1.15);

        priceDisplay.innerText = `$${low} - $${high}`;
    }

    sizeSelect.addEventListener('change', calculatePrice);
    serviceSelect.addEventListener('change', calculatePrice);

    // Form submit booking animation
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Disable submit button and animate submitting state
        const submitBtn = document.getElementById('btn-submit-estimate');
        submitBtn.innerHTML = '<i class="fa-solid fa-water-ladder animate-spin"></i> Booking Shore Time...';
        submitBtn.disabled = true;

        setTimeout(() => {
            // Transition form out and success text card in
            form.style.transition = 'opacity 0.4s ease';
            form.style.opacity = '0';
            
            setTimeout(() => {
                form.style.display = 'none';
                successMsg.style.display = 'block';
                successMsg.style.opacity = '0';
                successMsg.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    successMsg.style.opacity = '1';
                }, 50);
            }, 400);
        }, 1800);
    });

    calculatePrice(); // Run initial pricing load
}

/* ==========================================================================
   SAND DUNES SCROLL PARALLAX EFFECT
   ========================================================================== */
function initDuneScrollParallax() {
    const cards = document.querySelectorAll('.feature-card-dune');
    if (cards.length === 0) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        cards.forEach((card, idx) => {
            const rect = card.getBoundingClientRect();
            // If card is visible on screen
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                // Apply slight vertical translation offset by scrolling speed
                const speed = 0.05 * (idx + 1);
                const offset = (window.innerHeight - rect.top) * speed - 20;
                
                // Keep dune displacement bounded and natural
                card.style.transform = `translateY(${Math.min(20, Math.max(-25, offset))}px)`;
            }
        });
    });
}

/* ==========================================================================
   INTERACTIVE SERVICE DETAILS MODAL
   ========================================================================== */
const serviceDetails = {
    house: {
        title: "Coastal House Soft Washing",
        icon: "assets/icon-house.png",
        frequency: "Every 6 - 12 Months",
        duration: "2 - 4 Hours",
        guarantee: "100% Organic Growth Neutralization",
        desc: "Salt spray, high humidity, and coastal heat create a breeding ground for algae and mold on beach houses. Our low-pressure soft wash process utilizes biodegradable cleansers to clean and sanitize your home's siding without causing damage to delicate stucco, siding, or seals.",
        features: [
            "Stucco, Wood & HardiePlank Safe",
            "Low-Pressure (under 300 PSI) soft washing",
            "Full organic algae and salt crystal elimination",
            "Cleans window trim, frames, and siding fascia"
        ],
        modifier: 1.0
    },
    roof: {
        title: "Tile & Roof Restoration",
        icon: "assets/icon-roof.png",
        frequency: "Every 2 - 3 Years",
        duration: "3 - 6 Hours",
        guarantee: "3-Year Spot-Free Shoreline Guarantee",
        desc: "Seaside roofs are highly vulnerable to black mold streaks and moss growth, which absorbs heat and damages shingle integrity. We apply our eco-friendly, low-pressure soft solution that dissolves buildup instantly and prevents organic growth from returning.",
        features: [
            "Clay, slate & asphalt shingle safe",
            "Eco-friendly, chemical-soft solution spray",
            "Deep black streak and mold neutralization",
            "Improves roofing heat-reflection properties"
        ],
        modifier: 1.3
    },
    concrete: {
        title: "Driveway & Concrete Clean",
        icon: "assets/icon-concrete.png",
        frequency: "Every 6 Months",
        duration: "1.5 - 3 Hours",
        guarantee: "Deep Stain & Slip Protection",
        desc: "Foot traffic, coastal sand, tire marks, and ocean humidity leave concrete driveways dark and slippery. Using high-efficiency rotary pressure washers, we scour away embedded grime, rust, and salt stains, reviving concrete and improving slip resistance.",
        features: [
            "High-PSI rotary surface cleaning",
            "Rust, tire, and oil stain treatments",
            "Pool decks, walkways, and patios cleared",
            "Optional post-wash sealant protective barrier"
        ],
        modifier: 0.8
    },
    gutter: {
        title: "Resort Gutter Cleansing",
        icon: "assets/icon-gutter.png",
        frequency: "Every 6 Months",
        duration: "1 - 2 Hours",
        guarantee: "Perfect Flow & Brightness Guarantee",
        desc: "Clogged gutters lead to water overflow, which can erode coastal foundations and damage your fascia boards. We clear out all debris, test downspout drainage to ensure smooth water flow, and gently wash the exterior faces of your gutters to restore their resort appearance.",
        features: [
            "Inside out gutter debris extraction",
            "Downspout flush and flow inspection",
            "Bracket and joint structural check",
            "Exterior face whitening (tiger stripe removal)"
        ],
        modifier: 0.5
    },
    deck: {
        title: "Boardwalk & Deck Washing",
        icon: "assets/icon-deck.png",
        frequency: "Every 6 - 12 Months",
        duration: "2 - 4 Hours",
        guarantee: "Splinter-Free Soft Scour",
        desc: "Whether you have natural Brazilian Ipe, tropical teak, or modern composite decking, our specialized soft washing keeps beach boardwalks and sun decks splinter-free, non-slippery, and gorgeous. We remove slippery black algae and gray wood oxidation safely.",
        features: [
            "Teak, Ipe & Redwood specialty soft wash",
            "Composite deck (Trex) color brightening",
            "Slippery algae and spore removal",
            "Prep for staining, sealing, or oil treatments"
        ],
        modifier: 0.9
    },
    commercial: {
        title: "Commercial & Resort Clean",
        icon: "assets/icon-commercial.png",
        frequency: "Quarterly or Monthly Contracts",
        duration: "Varies (Off-hours available)",
        guarantee: "Commercial Resort Standard Assurance",
        desc: "We understand that hospitality and commercial property appearances directly impact the guest experience. Our crews work during off-hours to wash beach clubs, hotels, and retail centers quietly and efficiently, complying with local water runoff regulations.",
        features: [
            "Flexible off-hours & night shifts scheduled",
            "High-capacity building siding & parking lot wash",
            "Reclaim water systems and compliance checked",
            "Detailed multi-unit scheduling & reporting"
        ],
        modifier: 2.5
    }
};

function initServiceModals() {
    const modal = document.getElementById('service-detail-modal');
    const cards = document.querySelectorAll('.cabana-card');
    const closeBtn = document.getElementById('modal-close-btn');
    const overlay = document.getElementById('modal-overlay-btn');
    
    if (!modal || !closeBtn || !overlay) return;
    
    // Modal Element references
    const modalIcon = document.getElementById('modal-service-icon');
    const modalDuration = document.getElementById('modal-duration');
    const modalFrequency = document.getElementById('modal-frequency');
    const modalGuarantee = document.getElementById('modal-guarantee');
    const modalTitle = document.getElementById('modal-service-title');
    const modalDesc = document.getElementById('modal-service-desc');
    const modalFeaturesList = document.getElementById('modal-features-list');
    const modalSqftSlider = document.getElementById('modal-sqft-slider');
    const modalSqftDisplay = document.getElementById('modal-slider-sqft-display');
    const modalEstimatedPrice = document.getElementById('modal-estimated-price');
    const modalBookBtn = document.getElementById('modal-book-btn');
    
    let currentServiceKey = null;
    
    function openModal(serviceKey) {
        const details = serviceDetails[serviceKey];
        if (!details) return;
        
        currentServiceKey = serviceKey;
        
        // Populate modal data
        modalIcon.src = details.icon;
        modalIcon.alt = details.title;
        modalDuration.innerText = details.duration;
        modalFrequency.innerText = details.frequency;
        modalGuarantee.innerText = details.guarantee;
        modalTitle.innerText = details.title;
        modalDesc.innerText = details.desc;
        
        // Populate features list
        modalFeaturesList.innerHTML = '';
        details.features.forEach(feat => {
            const li = document.createElement('li');
            li.innerText = feat;
            modalFeaturesList.appendChild(li);
        });
        
        // Reset slider and run initial calculation
        modalSqftSlider.value = 2500;
        updateSliderEstimate();
        
        // Open modal
        modal.classList.add('modal-active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock page scroll
    }
    
    function closeModal() {
        modal.classList.remove('modal-active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore page scroll
    }
    
    function updateSliderEstimate() {
        if (!currentServiceKey) return;
        const details = serviceDetails[currentServiceKey];
        const sqft = parseInt(modalSqftSlider.value);
        
        // Update slider value label
        modalSqftDisplay.innerText = sqft.toLocaleString() + ' sq ft';
        
        // Base price scale by sizing cottage (1000 sq ft) to compound (6000 sq ft)
        let base = 250;
        if (sqft <= 1500) {
            base = 250 + (sqft - 1000) * (230 / 500); // interpolates between 250 and 480
        } else if (sqft <= 2500) {
            base = 480 + (sqft - 1500) * (120 / 1000); // 480 to 600
        } else if (sqft <= 4500) {
            base = 600 + (sqft - 2500) * (350 / 2000); // 600 to 950
        } else {
            base = 950 + (sqft - 4500) * (550 / 1500); // 950 to 1500
        }
        
        const calculated = Math.round(base * details.modifier);
        const low = Math.round(calculated * 0.9);
        const high = Math.round(calculated * 1.15);
        
        modalEstimatedPrice.innerText = `$${low} - $${high}`;
    }
    
    // Attach click event to cards
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const serviceKey = card.getAttribute('data-service');
            if (serviceKey) {
                openModal(serviceKey);
            }
        });
        
        // Keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const serviceKey = card.getAttribute('data-service');
                if (serviceKey) {
                    openModal(serviceKey);
                }
            }
        });
    });
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('modal-active')) {
            closeModal();
        }
    });
    
    // Update estimate when slider moves
    modalSqftSlider.addEventListener('input', updateSliderEstimate);
    
    // Modal Book Button connects to main quote form
    modalBookBtn.addEventListener('click', () => {
        closeModal();
        
        // 1. Find service selector in main form
        const serviceSelect = document.getElementById('wash-service');
        const sizeSelect = document.getElementById('property-size');
        
        if (serviceSelect) {
            serviceSelect.value = currentServiceKey;
            const event = new Event('change');
            serviceSelect.dispatchEvent(event);
        }
        
        // 2. Select matching size in main form
        if (sizeSelect) {
            const sqft = parseInt(modalSqftSlider.value);
            if (sqft < 1800) {
                sizeSelect.value = "1500";
            } else if (sqft < 3500) {
                sizeSelect.value = "2500";
            } else if (sqft < 5000) {
                sizeSelect.value = "4500";
            } else {
                sizeSelect.value = "6000";
            }
            const event = new Event('change');
            sizeSelect.dispatchEvent(event);
        }
        
        // 3. Scroll to cta/estimator section
        const estimatorSection = document.getElementById('cta');
        if (estimatorSection) {
            estimatorSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

/* ==========================================================================
   INTERACTIVE TRUST SIGN MODALS
   ========================================================================== */
const trustDetails = {
    star: {
        title: "5-Star Guest Service Experience",
        iconHtml: `
            <svg viewBox="0 0 100 100" class="starfish-icon">
                <path d="M50,5 L58,35 L88,35 L64,53 L73,83 L50,65 L27,83 L36,53 L12,35 L42,35 Z" fill="url(#starfish-grad-modal)" stroke="#E05B35" stroke-width="2.5" />
                <circle cx="50" cy="20" r="1.5" fill="#FFF" opacity="0.8" />
                <circle cx="50" cy="30" r="1.5" fill="#FFF" opacity="0.8" />
                <circle cx="50" cy="40" r="2" fill="#FFF" opacity="0.8" />
                <circle cx="50" cy="50" r="2.5" fill="#FFF" opacity="0.8" />
                <circle cx="40" cy="38" r="1.5" fill="#FFF" opacity="0.8" />
                <circle cx="60" cy="38" r="1.5" fill="#FFF" opacity="0.8" />
                <circle cx="32" cy="48" r="1.5" fill="#FFF" opacity="0.8" />
                <circle cx="68" cy="48" r="1.5" fill="#FFF" opacity="0.8" />
                <circle cx="38" cy="62" r="1.5" fill="#FFF" opacity="0.8" />
                <circle cx="62" cy="62" r="1.5" fill="#FFF" opacity="0.8" />
                <circle cx="28" cy="74" r="1.5" fill="#FFF" opacity="0.8" />
                <circle cx="72" cy="74" r="1.5" fill="#FFF" opacity="0.8" />
                <defs>
                    <linearGradient id="starfish-grad-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FF9F68" />
                        <stop offset="100%" stop-color="#FF5E36" />
                    </linearGradient>
                </defs>
            </svg>
        `,
        desc: "We treat your coastal property like a five-star luxury resort. Our trained, uniformed wash technicians provide white-glove property protection (covering all outdoor outlets, lights, keyholes, and delicate tropical plants), polite updates, and a rigorous 24-point clean-shore inspection. We guarantee the most professional and refreshing service experience on the Malibu coast."
    },
    shield: {
        title: "Fully Insured & Certified Care",
        iconHtml: `
            <svg viewBox="0 0 100 100" class="shield-icon">
                <path d="M50,10 L82,20 L82,50 C82,72 50,90 50,90 C50,90 18,72 18,50 L18,20 Z" fill="url(#shield-grad-modal)" stroke="#2C7DA0" stroke-width="2.5" />
                <path d="M50,16 L76,24 L76,48 C76,66 50,81 50,81 C50,81 24,66 24,48 L24,24 Z" fill="none" stroke="#A9D6E5" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.7" />
                <path d="M50,32 C43,32 37,38 37,45 C37,55 50,68 50,68 C50,68 63,55 63,45 C63,38 57,32 50,32 Z" fill="#FFF" opacity="0.95" />
                <path d="M50,32 L50,68" stroke="#89C2D9" stroke-width="1.5" />
                <path d="M50,32 C47,38 46,48 50,68" stroke="#89C2D9" stroke-width="1.2" fill="none" />
                <path d="M50,32 C53,38 54,48 50,68" stroke="#89C2D9" stroke-width="1.2" fill="none" />
                <defs>
                    <linearGradient id="shield-grad-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#89C2D9" />
                        <stop offset="100%" stop-color="#2A6F97" />
                    </linearGradient>
                </defs>
            </svg>
        `,
        desc: "Your multi-million dollar beachfront property is protected by the gold standard of care. We carry a comprehensive $2,000,000 general liability policy, full workers' compensation coverage, and specialized marine-safe certifications. We are certified SoftWash Systems technicians, ensuring we clean your roof, siding, and decks safely without using damaging high pressure."
    },
    hut: {
        title: "Family Owned & Locally Grown",
        iconHtml: `
            <svg viewBox="0 0 100 100" class="hut-icon">
                <path d="M20,85 L80,85" stroke="#3A5A40" stroke-width="3" stroke-linecap="round" />
                <rect x="30" y="55" width="6" height="30" fill="#588157" rx="2" />
                <rect x="64" y="55" width="6" height="30" fill="#588157" rx="2" />
                <rect x="47" y="55" width="6" height="30" fill="#344E41" rx="2" />
                <path d="M25,55 L75,55 L70,85 L30,85 Z" fill="#588157" stroke="#3A5A40" stroke-width="2" />
                <path d="M43,85 L43,65 A7,7 0 0,1 57,65 L57,85" fill="#344E41" stroke="#3A5A40" stroke-width="2" />
                <path d="M50,15 L85,55 L15,55 Z" fill="url(#roof-grad-modal)" stroke="#3A5A40" stroke-width="2.5" />
                <path d="M50,15 L50,55" stroke="#344E41" stroke-width="1.5" />
                <path d="M50,15 L32,55" stroke="#344E41" stroke-width="1.5" />
                <path d="M50,15 L68,55" stroke="#344E41" stroke-width="1.5" />
                <path d="M38,40 L62,40" stroke="#344E41" stroke-width="1.5" />
                <path d="M26,48 L74,48" stroke="#344E41" stroke-width="1.5" />
                <circle cx="50" cy="15" r="4" fill="#3A5A40" />
                <defs>
                    <linearGradient id="roof-grad-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#A3B18A" />
                        <stop offset="100%" stop-color="#3A5A40" />
                    </linearGradient>
                </defs>
            </svg>
        `,
        desc: "We are local shoreline residents who cherish our beautiful coast. We live in the community, employ local technicians, and are dedicated to preserving our beaches. That's why we use 100% biodegradable, eco-friendly, and marine-safe cleaning solutions that protect ocean life, pets, and your family's beach house."
    },
    guarantee: {
        title: "100% Resort Satisfaction Guarantee",
        iconHtml: `
            <svg viewBox="0 0 100 100" class="check-shell-icon">
                <path d="M55,30 C30,30 20,45 20,60 C20,75 35,85 55,85 C75,85 85,72 85,60 C85,45 75,30 55,30 Z" fill="url(#shell-orange-grad-modal)" stroke="#D06A3F" stroke-width="2.5" />
                <path d="M55,30 C43,38 40,50 42,65" fill="none" stroke="#F4A261" stroke-width="2" />
                <path d="M62,33 C52,43 50,55 52,72" fill="none" stroke="#F4A261" stroke-width="2" />
                <path d="M70,38 C60,48 58,60 62,78" fill="none" stroke="#F4A261" stroke-width="2" />
                <circle cx="35" cy="40" r="16" fill="#4AD66D" stroke="#2D6A4F" stroke-width="2.5" />
                <path d="M28,40 L33,45 L43,35" fill="none" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <defs>
                    <linearGradient id="shell-orange-grad-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FFCDA3" />
                        <stop offset="100%" stop-color="#E76F51" />
                    </linearGradient>
                </defs>
            </svg>
        `,
        desc: "Our Shoreline Promise: If you aren't completely thrilled with the brightness, cleanliness, and freshness of your property's exterior, notify us within 30 days and we will return to re-wash it immediately at no cost. If you are still not absolutely satisfied, we will refund your entire payment in full. Simple, honest, and resort-standard."
    }
};

function initTrustModals() {
    const modal = document.getElementById('trust-detail-modal');
    const closeBtn = document.getElementById('trust-close-btn');
    const overlay = document.getElementById('trust-overlay-btn');
    const okBtn = document.getElementById('trust-modal-ok-btn');
    
    if (!modal || !closeBtn || !overlay || !okBtn) return;
    
    const iconContainer = document.getElementById('trust-modal-icon-container');
    const titleEl = document.getElementById('trust-modal-title');
    const descEl = document.getElementById('trust-modal-desc');
    
    function openTrustModal(key) {
        const details = trustDetails[key];
        if (!details) return;
        
        iconContainer.innerHTML = details.iconHtml;
        titleEl.innerText = details.title;
        descEl.innerText = details.desc;
        
        modal.classList.add('modal-active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    
    function closeTrustModal() {
        modal.classList.remove('modal-active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    const boards = document.querySelectorAll('.trust-wooden-board');
    boards.forEach(board => {
        board.addEventListener('click', () => {
            const key = board.id.replace('trust-board-', '');
            openTrustModal(key);
        });
        board.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const key = board.id.replace('trust-board-', '');
                openTrustModal(key);
            }
        });
    });
    
    const log = document.getElementById('trust-board-guarantee');
    if (log) {
        log.addEventListener('click', () => {
            openTrustModal('guarantee');
        });
        log.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openTrustModal('guarantee');
            }
        });
    }
    
    closeBtn.addEventListener('click', closeTrustModal);
    overlay.addEventListener('click', closeTrustModal);
    okBtn.addEventListener('click', closeTrustModal);
    
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('modal-active')) {
            closeTrustModal();
        }
    });
}
