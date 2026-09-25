/**
 * Glassmorphism Hello World Experience — JavaScript Logic (index.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const glassCard = document.getElementById('main-glass-card');
    const cursorGlow = document.getElementById('cursor-glow');
    const greetingText = document.getElementById('greeting-text');
    const greetingSub = document.getElementById('greeting-sub');
    const langChips = document.querySelectorAll('.lang-chip');
    const helloBtn = document.getElementById('hello-btn');
    const clickCounter = document.getElementById('click-counter');
    const blurSlider = document.getElementById('blur-slider');
    const opacitySlider = document.getElementById('opacity-slider');
    const blurVal = document.getElementById('blur-val');
    const opacityVal = document.getElementById('opacity-val');
    const themeDots = document.querySelectorAll('.theme-dot');
    const liveClock = document.getElementById('live-clock');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const particleCanvas = document.getElementById('particle-canvas');
    const ctx = particleCanvas.getContext('2d');

    // State Variables
    let clickCount = 0;
    let isSoundEnabled = true;
    let audioCtx = null;
    let particles = [];

    /* ==========================================================================
       1. Ambient & Cursor Light Glow Follower
       ========================================================================== */
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        cursorGlow.style.left = `${glowX}px`;
        cursorGlow.style.top = `${glowY}px`;
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    /* ==========================================================================
       2. 3D Glass Card Tilt Effect
       ========================================================================== */
    if (glassCard) {
        glassCard.addEventListener('mousemove', (e) => {
            const rect = glassCard.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = (-y / (rect.height / 2)) * 6; // Max 6 deg tilt
            const rotateY = (x / (rect.width / 2)) * 6;

            glassCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        });

        glassCard.addEventListener('mouseleave', () => {
            glassCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    }

    /* ==========================================================================
       3. Dynamic Language & Greeting Switcher
       ========================================================================== */
    langChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Active chip toggle
            langChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const newGreeting = chip.dataset.greeting;
            const newSub = chip.dataset.sub;
            const isCode = chip.dataset.lang === 'code';

            playGlassChime(600);

            // Animate Out
            greetingText.style.opacity = '0';
            greetingText.style.transform = 'translateY(-10px)';
            greetingSub.style.opacity = '0';

            setTimeout(() => {
                // Update Content
                if (isCode) {
                    greetingText.classList.add('code-mode');
                    greetingText.innerHTML = `<span class="gradient-text">${escapeHtml(newGreeting)}</span>`;
                } else {
                    greetingText.classList.remove('code-mode');
                    greetingText.innerHTML = `<span class="gradient-text">${newGreeting}</span>`;
                }

                greetingSub.textContent = newSub;

                // Animate In
                greetingText.style.opacity = '1';
                greetingText.style.transform = 'translateY(0)';
                greetingSub.style.opacity = '1';
            }, 200);
        });
    });

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* ==========================================================================
       4. Interactive Button & Particle Explosion
       ========================================================================== */
    helloBtn.addEventListener('click', (e) => {
        clickCount++;
        clickCounter.textContent = `${clickCount} ${clickCount === 1 ? 'Hello' : 'Hellos'} Sent`;

        playGlassChime(800 + (clickCount * 20 % 400));
        
        // Trigger particle burst at button location
        const rect = helloBtn.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;
        spawnParticles(originX, originY);

        // Button press pulse feedback
        helloBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            helloBtn.style.transform = '';
        }, 150);

        // Trigger alert to display number of hellos sent
        setTimeout(() => {
            alert(`Hellos sent: ${clickCount}`);
        }, 50);
    });

    /* ==========================================================================
       5. Live Glass Customizers (Sliders)
       ========================================================================== */
    blurSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        document.documentElement.style.setProperty('--glass-blur', `${val}px`);
        blurVal.textContent = `${val}px`;
    });

    opacitySlider.addEventListener('input', (e) => {
        const val = e.target.value;
        const decimalOpacity = (val / 100).toFixed(2);
        document.documentElement.style.setProperty('--glass-opacity', decimalOpacity);
        opacityVal.textContent = `${val}%`;
    });

    /* ==========================================================================
       6. Theme Switcher
       ========================================================================== */
    themeDots.forEach(dot => {
        dot.addEventListener('click', () => {
            themeDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');

            const theme = dot.dataset.theme;
            document.body.className = theme;
            playGlassChime(520);
        });
    });

    /* ==========================================================================
       7. Web Audio UI Sound Synthesizer
       ========================================================================== */
    soundToggleBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        soundToggleBtn.innerHTML = isSoundEnabled ? 
            '<i class="fa-solid fa-volume-high"></i>' : 
            '<i class="fa-solid fa-volume-xmark"></i>';
        soundToggleBtn.style.opacity = isSoundEnabled ? '1' : '0.5';
    });

    function playGlassChime(freq = 600) {
        if (!isSoundEnabled) return;

        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
        } catch (e) {
            // Audio context not allowed or failed silently
        }
    }

    /* ==========================================================================
       8. HTML5 Canvas Glass Particle System
       ========================================================================== */
    function resizeCanvas() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 1.5;
            this.size = Math.random() * 8 + 4;
            this.opacity = 1;
            this.decay = Math.random() * 0.02 + 0.015;
            this.rotation = Math.random() * Math.PI;
            this.rotSpeed = (Math.random() - 0.5) * 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.08; // gravity
            this.opacity -= this.decay;
            this.rotation += this.rotSpeed;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, this.opacity * 0.7)})`;
            ctx.strokeStyle = `rgba(0, 242, 254, ${Math.max(0, this.opacity)})`;
            ctx.lineWidth = 1;
            
            // Draw small glass polygon shard
            ctx.beginPath();
            ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    function spawnParticles(x, y) {
        for (let i = 0; i < 28; i++) {
            particles.push(new Particle(x, y));
        }
    }

    function renderParticles() {
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].opacity <= 0) {
                particles.splice(i, 1);
            }
        }
        requestAnimationFrame(renderParticles);
    }
    renderParticles();

    /* ==========================================================================
       9. Real-Time Clock
       ========================================================================== */
    function updateClock() {
        if (!liveClock) return;
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        liveClock.innerHTML = `<i class="fa-regular fa-clock"></i> ${hrs}:${mins}:${secs}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
});
