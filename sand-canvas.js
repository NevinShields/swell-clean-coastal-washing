/**
 * Swell Clean - Interactive Sand Canvas Script
 * Creates a premium beach sand simulation with displacement, footprints, ripples,
 * hidden treasure discovery, and wave-washing reset mechanics.
 */

class SandSimulation {
    constructor(canvasId, containerId, beneathLayerId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById(containerId);
        this.beneathLayer = document.getElementById(beneathLayerId);
        this.waveOverlay = document.getElementById('wave-sweep-overlay');
        this.waveBtn = document.getElementById('btn-trigger-wave');

        // State variables
        this.width = 0;
        this.height = 0;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.lastFootprintX = 0;
        this.lastFootprintY = 0;
        this.footprintDistanceThreshold = 75; // Pixels between steps
        this.footprintToggle = true; // true = Left, false = Right
        this.lastMoveTime = Date.now();
        this.isWaveSweeping = false;

        // Sand Mask Canvas (Offscreen canvas to track brushed transparency)
        this.maskCanvas = document.createElement('canvas');
        this.maskCtx = this.maskCanvas.getContext('2d');

        // Sparkle Particles array
        this.particles = [];
        
        // Concentric Click Ripples array
        this.ripples = [];

        // Seashells data
        this.shells = [
            { x: 0.2, y: 0.3, type: 'starfish', discovered: false, angle: 0.2, scale: 0.8 },
            { x: 0.7, y: 0.25, type: 'conch', discovered: false, angle: -0.5, scale: 0.9 },
            { x: 0.45, y: 0.75, type: 'scallop', discovered: false, angle: 0.1, scale: 0.75 },
            { x: 0.85, y: 0.65, type: 'starfish', discovered: false, angle: 1.2, scale: 0.7 }
        ];

        // Bind events
        window.addEventListener('resize', () => this.resize());
        this.initEvents();
        this.resize();

        // Start render loop
        this.animate();

        // Auto wave wipe every 35 seconds to keep the beach clean
        this.autoWaveTimer = setInterval(() => {
            if (!this.isDrawing && Date.now() - this.lastMoveTime > 15000) {
                this.triggerWaveSweep();
            }
        }, 35000);
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.container.getBoundingClientRect();
        
        this.width = rect.width;
        this.height = rect.height;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);

        // Resize offscreen mask canvas
        const prevMask = document.createElement('canvas');
        prevMask.width = this.maskCanvas.width;
        prevMask.height = this.maskCanvas.height;
        const prevMaskCtx = prevMask.getContext('2d');
        if (this.maskCanvas.width > 0) {
            prevMaskCtx.drawImage(this.maskCanvas, 0, 0);
        }

        this.maskCanvas.width = this.width;
        this.maskCanvas.height = this.height;

        // Initialize mask canvas to solid white (fully covered sand)
        this.maskCtx.fillStyle = '#FFFFFF';
        this.maskCtx.fillRect(0, 0, this.width, this.height);

        // Copy back previous mask data if resized
        if (prevMask.width > 0) {
            this.maskCtx.drawImage(prevMask, 0, 0, this.width, this.height);
        }

        // Draw static noise texture for dry sand on offscreen canvas
        this.generateSandTexture();
    }

    generateSandTexture() {
        this.sandTextureCanvas = document.createElement('canvas');
        this.sandTextureCanvas.width = 300;
        this.sandTextureCanvas.height = 300;
        const sCtx = this.sandTextureCanvas.getContext('2d');

        sCtx.fillStyle = '#F5E6C8'; // Soft Sand Base
        sCtx.fillRect(0, 0, 300, 300);

        // Add subtle grainy sand noise
        const imgData = sCtx.getImageData(0, 0, 300, 300);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 16;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise - 2)); // slightly warmer
            data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise - 8));
        }
        sCtx.putImageData(imgData, 0, 0);
    }

    initEvents() {
        const startDraw = (e) => {
            this.isDrawing = true;
            const pos = this.getMousePos(e);
            this.lastX = pos.x;
            this.lastY = pos.y;
            this.lastFootprintX = pos.x;
            this.lastFootprintY = pos.y;
            this.lastMoveTime = Date.now();
            this.brush(pos.x, pos.y, 45); // Initial press brush
            this.createRipple(pos.x, pos.y); // Click ripples
        };

        const draw = (e) => {
            if (!this.isDrawing) return;
            const pos = this.getMousePos(e);
            this.brush(pos.x, pos.y, 40);
            this.checkFootprints(pos.x, pos.y);
            this.lastX = pos.x;
            this.lastY = pos.y;
            this.lastMoveTime = Date.now();
        };

        const stopDraw = () => {
            this.isDrawing = false;
        };

        // Mouse Events
        this.canvas.addEventListener('mousedown', startDraw);
        this.canvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', stopDraw);

        // Touch Events (Mobile friendly)
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startDraw(e.touches[0]);
            }
        });
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                draw(e.touches[0]);
            }
        });
        this.canvas.addEventListener('touchend', stopDraw);

        // Wave Sweeper Button
        if (this.waveBtn) {
            this.waveBtn.addEventListener('click', () => {
                this.triggerWaveSweep();
            });
        }
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    brush(x, y, radius) {
        // Cut out the sand mask to reveal beneath layer
        this.maskCtx.save();
        this.maskCtx.globalCompositeOperation = 'destination-out';
        
        // Soft radial brush gradient
        const grad = this.maskCtx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
        grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.6)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

        this.maskCtx.fillStyle = grad;
        this.maskCtx.beginPath();
        this.maskCtx.arc(x, y, radius, 0, Math.PI * 2);
        this.maskCtx.fill();
        this.maskCtx.restore();

        // Check if we uncovered a seashell
        this.checkShellDiscoveries(x, y);
    }

    checkFootprints(x, y) {
        const dx = x - this.lastFootprintX;
        const dy = y - this.lastFootprintY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= this.footprintDistanceThreshold) {
            // Calculate angle of motion
            const angle = Math.atan2(dy, dx);
            
            // Calculate offsets for left/right stepping side offset
            const offsetDist = 18; // distance to side of line
            const offsetAngle = angle + (this.footprintToggle ? Math.PI / 2 : -Math.PI / 2);
            
            const fpX = x + Math.cos(offsetAngle) * offsetDist;
            const fpY = y + Math.sin(offsetAngle) * offsetDist;

            // Draw footprint on mask
            this.drawFootprintMask(fpX, fpY, angle, this.footprintToggle);

            // Toggle for next foot
            this.footprintToggle = !this.footprintToggle;

            this.lastFootprintX = x;
            this.lastFootprintY = y;
        }
    }

    drawFootprintMask(x, y, angle, isLeft) {
        this.maskCtx.save();
        this.maskCtx.globalCompositeOperation = 'destination-out';
        this.maskCtx.translate(x, y);
        this.maskCtx.rotate(angle + Math.PI / 2); // Align footprint to path direction

        this.maskCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';

        // Draw heel
        this.maskCtx.beginPath();
        this.maskCtx.ellipse(0, 15, 8, 11, 0, 0, Math.PI * 2);
        this.maskCtx.fill();

        // Draw sole
        this.maskCtx.beginPath();
        // Shift slightly left or right depending on which foot it is
        const shiftX = isLeft ? -2 : 2;
        this.maskCtx.ellipse(shiftX, -5, 12, 17, 0, 0, Math.PI * 2);
        this.maskCtx.fill();

        // Draw toes
        const toeRadius = 2.5;
        const yOffset = -25;
        const toePositions = isLeft 
            ? [-8, -4, 0, 4, 8] // Left toes
            : [8, 4, 0, -4, -8]; // Right toes

        for (let i = 0; i < 5; i++) {
            const r = toeRadius * (1 - i * 0.12);
            this.maskCtx.beginPath();
            this.maskCtx.arc(toePositions[i], yOffset + (Math.abs(toePositions[i]) * 0.4), r, 0, Math.PI * 2);
            this.maskCtx.fill();
        }

        this.maskCtx.restore();
    }

    createRipple(x, y) {
        this.ripples.push({
            x: x,
            y: y,
            radius: 5,
            maxRadius: 150,
            alpha: 0.8,
            speed: 3
        });
    }

    checkShellDiscoveries(x, y) {
        this.shells.forEach(shell => {
            if (shell.discovered) return;

            const shellPixelX = shell.x * this.width;
            const shellPixelY = shell.y * this.height;

            const dx = x - shellPixelX;
            const dy = y - shellPixelY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // If user brushes within 35px of the shell
            if (dist < 45) {
                // Check if mask at shell coordinates is actually cleared (alpha is low)
                // We sample a 10x10 block around shell center
                const sampleSize = 10;
                const imgData = this.maskCtx.getImageData(
                    Math.max(0, shellPixelX - sampleSize/2), 
                    Math.max(0, shellPixelY - sampleSize/2), 
                    sampleSize, 
                    sampleSize
                );
                
                let sumAlpha = 0;
                const pixels = imgData.data;
                for (let i = 3; i < pixels.length; i += 4) {
                    sumAlpha += pixels[i];
                }
                const averageAlpha = sumAlpha / (pixels.length / 4);

                // If averageAlpha is low, sand has been brushed away!
                if (averageAlpha < 80) {
                    shell.discovered = true;
                    this.triggerSparkles(shellPixelX, shellPixelY);
                }
            }
        });
    }

    triggerSparkles(x, y) {
        // Generate 15-20 sparkling particles
        const count = 18;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5, // slight upward float
                size: 2 + Math.random() * 3,
                alpha: 1.0,
                color: Math.random() > 0.4 ? '#FFF' : '#FFD700', // Gold/White sparkles
                life: 30 + Math.random() * 30
            });
        }
    }

    triggerWaveSweep() {
        if (this.isWaveSweeping) return;
        this.isWaveSweeping = true;

        // Trigger CSS animation overlay
        this.waveOverlay.classList.add('sweeping');

        // Start progressive mask restore sync with wave sweep
        const sweepDuration = 2500; // Match CSS wave duration (2.5s)
        const startTime = Date.now();
        const wavePhysicsLoop = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / sweepDuration;

            if (progress < 1) {
                // Wave sweeps from left to right.
                // We fill the mask with white trailing the wave.
                const waveFrontX = progress * (this.width * 1.5) - (this.width * 0.25);
                
                this.maskCtx.save();
                this.maskCtx.fillStyle = '#FFFFFF';
                // Paint solid white to the left of the wavefront
                this.maskCtx.fillRect(0, 0, waveFrontX, this.height);
                this.maskCtx.restore();

                requestAnimationFrame(wavePhysicsLoop);
            } else {
                // Completely restore
                this.maskCtx.fillStyle = '#FFFFFF';
                this.maskCtx.fillRect(0, 0, this.width, this.height);
                
                // Reset shells discoveries
                this.shells.forEach(s => s.discovered = false);

                // Stop sweeping state
                this.isWaveSweeping = false;
                this.waveOverlay.classList.remove('sweeping');
            }
        };

        requestAnimationFrame(wavePhysicsLoop);
    }

    drawShellProcedural(ctx, x, y, type, angle, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(scale, scale);

        if (type === 'starfish') {
            // Draw 5-point Starfish
            ctx.fillStyle = '#FF7B54'; // Coral Accent
            ctx.strokeStyle = '#D64E2A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const points = 5;
            const outerRadius = 25;
            const innerRadius = 9;
            let rot = Math.PI / 2 * 3;
            const step = Math.PI / points;

            ctx.moveTo(0, -outerRadius);
            for (let i = 0; i < points; i++) {
                ctx.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
                rot += step;
                ctx.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
                rot += step;
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Starfish bumps details
            ctx.fillStyle = '#FFAF96';
            for (let i = 0; i < 5; i++) {
                const a = (i * Math.PI * 2 / 5) - Math.PI/2;
                ctx.beginPath();
                ctx.arc(Math.cos(a)*14, Math.sin(a)*14, 2, 0, Math.PI*2);
                ctx.arc(Math.cos(a)*8, Math.sin(a)*8, 1.5, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI*2);
            ctx.fill();

        } else if (type === 'scallop') {
            // Draw Scallop Sea Shell
            ctx.fillStyle = '#FFF8E7';
            ctx.strokeStyle = '#D8C7B0';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            
            // Draw shell base shape
            ctx.moveTo(-5, 15);
            ctx.bezierCurveTo(-25, 10, -30, -15, 0, -20);
            ctx.bezierCurveTo(30, -15, 25, 10, 5, 15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Draw radial ridges lines
            ctx.beginPath();
            const lines = 7;
            for (let i = 0; i < lines; i++) {
                const pct = i / (lines - 1);
                const endX = -22 + pct * 44;
                const endY = -12 + (0.5 - Math.abs(pct - 0.5)) * 10;
                ctx.moveTo(0, 15);
                ctx.lineTo(endX, endY);
            }
            ctx.stroke();

            // Hinge base
            ctx.fillStyle = '#E8DBCE';
            ctx.beginPath();
            ctx.rect(-8, 12, 16, 4);
            ctx.fill();
            ctx.stroke();

        } else if (type === 'conch') {
            // Draw Spiral Conch Shell
            ctx.fillStyle = '#F5D3C8';
            ctx.strokeStyle = '#C99E90';
            ctx.lineWidth = 2;
            
            // Draw main conch body (pointed oval structure)
            ctx.beginPath();
            ctx.moveTo(0, -22);
            ctx.bezierCurveTo(18, -12, 22, 10, 5, 22);
            ctx.bezierCurveTo(-5, 12, -22, -2, 0, -22);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Draw spiral chambers
            ctx.fillStyle = '#FFF1EB';
            ctx.beginPath();
            ctx.ellipse(3, -5, 12, 8, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.ellipse(5, 5, 8, 5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.ellipse(3, 14, 5, 3, Math.PI / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    animate() {
        // 1. Clear Canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 2. Draw revealed shells in the background layer of the canvas
        // (They are rendered here so they show through the transparent brushed holes)
        this.shells.forEach(shell => {
            const px = shell.x * this.width;
            const py = shell.y * this.height;
            this.drawShellProcedural(this.ctx, px, py, shell.type, shell.angle, shell.scale);
        });

        // 3. Render Sand Canvas Texture
        // We draw the sand texture on a temp canvas buffer or draw it repeating
        const sandPattern = this.ctx.createPattern(this.sandTextureCanvas, 'repeat');

        // Draw Sand on Screen (Only inside the opaque white mask area)
        this.ctx.save();
        this.ctx.fillStyle = sandPattern;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();

        // 4. Apply Offscreen Mask via Destination-In composite operation
        // This cuts holes in the sand texture we just drew where maskCtx is transparent
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-in';
        this.ctx.drawImage(this.maskCanvas, 0, 0);
        this.ctx.restore();

        // 5. Draw Ripple Vectors (Above the sand texture as lighting displacement highlights)
        this.ctx.save();
        this.ripples.forEach((ripple, rIdx) => {
            ripple.radius += ripple.speed;
            ripple.alpha = 1.0 - (ripple.radius / ripple.maxRadius);

            if (ripple.alpha <= 0) {
                this.ripples.splice(rIdx, 1);
                return;
            }

            // Draw concentric sand wave circles
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha * 0.35})`;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Inner shadowed ring
            this.ctx.strokeStyle = `rgba(74, 60, 49, ${ripple.alpha * 0.18})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(ripple.x, ripple.y, ripple.radius - 3, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        this.ctx.restore();

        // 6. Animate Sparkle Particles (Draw on top of everything)
        this.ctx.save();
        this.particles.forEach((p, pIdx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = p.life / 60;
            p.life--;

            if (p.life <= 0) {
                this.particles.splice(pIdx, 1);
                return;
            }

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            
            // Draw sparkle star/cross
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y - p.size);
            this.ctx.lineTo(p.x + p.size * 0.3, p.y - p.size * 0.3);
            this.ctx.lineTo(p.x + p.size, p.y);
            this.ctx.lineTo(p.x + p.size * 0.3, p.y + p.size * 0.3);
            this.ctx.lineTo(p.x, p.y + p.size);
            this.ctx.lineTo(p.x - p.size * 0.3, p.y + p.size * 0.3);
            this.ctx.lineTo(p.x - p.size, p.y);
            this.ctx.lineTo(p.x - p.size * 0.3, p.y - p.size * 0.3);
            this.ctx.closePath();
            this.ctx.fill();
        });
        this.ctx.restore();

        // 7. Wind Refill Sand Effect (Slowly restore sand density mask if user is idle)
        const idleTime = Date.now() - this.lastMoveTime;
        if (idleTime > 6000 && !this.isDrawing && !this.isWaveSweeping) {
            this.maskCtx.save();
            // Paint very low opacity white to fade transparent areas back to solid white
            this.maskCtx.fillStyle = 'rgba(255, 255, 255, 0.0035)'; // extremely slow organic fill
            this.maskCtx.fillRect(0, 0, this.width, this.height);
            this.maskCtx.restore();
        }

        // Loop animation
        requestAnimationFrame(() => this.animate());
    }
}

// Instantiate simulation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const sandSim = new SandSimulation('sand-canvas', 'sand-experience', 'hidden-message-layer');
    window.sandSimulation = sandSim; // Expose globally for app sync
});
