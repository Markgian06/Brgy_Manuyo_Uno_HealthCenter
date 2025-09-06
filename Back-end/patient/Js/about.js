        document.addEventListener('DOMContentLoaded', function() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.loading, .section-title, .image-container, .paragraph').forEach(el => {
                observer.observe(el);
            });


            document.querySelectorAll('.interactive-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = x + 'px';
                    ripple.style.top = y + 'px';
                    ripple.style.position = 'absolute';
                    ripple.style.background = 'rgba(255,255,255,0.5)';
                    ripple.style.borderRadius = '50%';
                    ripple.style.transform = 'scale(0)';
                    ripple.style.animation = 'ripple 0.6s linear';
                    ripple.style.pointerEvents = 'none';
                    
                    this.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                });
            });

            const style = document.createElement('style');
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);

            document.querySelectorAll('.mission-card, .vision-card, .value-card, .feature-item, .benefit-item, .plan-item').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = this.style.transform.includes('translateY') ? 
                        this.style.transform.replace(/translateY\([^)]*\)/, 'translateY(-10px)') : 
                        'translateY(-10px)';
                });

                card.addEventListener('mouseleave', function() {
                    this.style.transform = this.style.transform.replace(/translateY\([^)]*\)/, 'translateY(0)');
                });

                card.addEventListener('mousedown', function() {
                    this.style.transform = this.style.transform.includes('scale') ? 
                        this.style.transform : 
                        this.style.transform + ' scale(0.98)';
                });

                card.addEventListener('mouseup', function() {
                    this.style.transform = this.style.transform.replace(/scale\([^)]*\)/, '');
                });
            });

            function staggerAnimation(selector, delay = 100) {
                document.querySelectorAll(selector).forEach((el, index) => {
                    el.style.animationDelay = `${index * delay}ms`;
                });
            }

            staggerAnimation('.value-card');
            staggerAnimation('.feature-item');
            staggerAnimation('.benefit-item');
            staggerAnimation('.plan-item');

            const heroTitle = document.querySelector('.hero .title');
            const originalText = heroTitle.textContent;
            heroTitle.textContent = '';
            
            let i = 0;
            function typeWriter() {
                if (i < originalText.length) {
                    heroTitle.textContent += originalText.charAt(i);
                    i++;
                    setTimeout(typeWriter, 50);
                }
            }
            
            setTimeout(typeWriter, 1000);

            function createParticle() {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = Math.random() * 4 + 1 + 'px';
                particle.style.height = particle.style.width;
                particle.style.background = 'rgba(52, 152, 219, 0.3)';
                particle.style.borderRadius = '50%';
                particle.style.left = Math.random() * window.innerWidth + 'px';
                particle.style.top = window.innerHeight + 'px';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '1';
                
                document.querySelector('.hero').appendChild(particle);
                
                const duration = Math.random() * 3000 + 2000;
                const animation = particle.animate([
                    { transform: 'translateY(0px)', opacity: 0 },
                    { transform: 'translateY(-100px)', opacity: 1, offset: 0.1 },
                    { transform: `translateY(-${window.innerHeight + 100}px)`, opacity: 0 }
                ], {
                    duration: duration,
                    easing: 'linear'
                });
                
                animation.onfinish = () => particle.remove();
            }

            setInterval(createParticle, 2000);

            document.querySelectorAll('.highlight').forEach(highlight => {
                highlight.addEventListener('click', function() {
                    this.style.animation = 'none';
                    setTimeout(() => {
                        this.style.animation = 'pulse 0.6s ease';
                    }, 10);
                });
            });

            window.addEventListener('scroll', function() {
                const scrollPercent = (window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100;
                const opacity = Math.min(scrollPercent / 100, 0.1);
                document.body.style.background = `linear-gradient(135deg, 
                    rgba(255,255,255,1) 0%, 
                    rgba(248,249,250,${1 - opacity}) 100%)`;
            });

            document.querySelectorAll('section').forEach(section => {
                section.addEventListener('mouseenter', function() {
                    this.style.transition = 'all 0.3s ease';
                    if (!this.classList.contains('hero') && !this.classList.contains('cta-section')) {
                        this.style.background = this.style.background || '#fafbfc';
                    }
                });
            });


            document.querySelectorAll('.interactive-btn, .mission-card, .vision-card, .value-card, .feature-item, .benefit-item, .plan-item').forEach(el => {
                el.addEventListener('click', function(e) {
                    createVisualFeedback(this);
                });
            });

            function revealText(element) {
                const text = element.textContent;
                element.textContent = '';
                element.style.borderRight = '2px solid #3498db';
                
                let i = 0;
                function reveal() {
                    if (i < text.length) {
                        element.textContent += text.charAt(i);
                        i++;
                        setTimeout(reveal, 30);
                    } else {
                        element.style.borderRight = 'none';
                    }
                }
                reveal();
            }

            const titleObserver = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.revealed) {
                        setTimeout(() => revealText(entry.target), 300);
                        entry.target.dataset.revealed = 'true';
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('.section-title').forEach(title => {
                titleObserver.observe(title);
            });


            document.querySelectorAll('.interactive-btn, .mission-card, .vision-card, .value-card, .feature-item, .benefit-item, .plan-item').forEach(el => {
                el.addEventListener('mouseenter', function() {
                    const cursor = document.querySelector('.cursor');
                    if (cursor) {
                        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                        cursor.style.background = 'rgba(231, 76, 60, 0.3)';
                    }
                });

                el.addEventListener('mouseleave', function() {
                    const cursor = document.querySelector('.cursor');
                    if (cursor) {
                        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                        cursor.style.background = 'rgba(52, 152, 219, 0.3)';
                    }
                });
            });

            setTimeout(() => {
                document.querySelectorAll('.loading').forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('animate');
                    }, index * 100);
                });
            }, 500);

            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });

            function simulateContentLoad() {
                const sections = document.querySelectorAll('.section');
                sections.forEach((section, index) => {
                    setTimeout(() => {
                        section.style.opacity = '0';
                        section.style.transform = 'translateY(20px)';
                        section.style.transition = 'all 0.6s ease';
                        
                        setTimeout(() => {
                            section.style.opacity = '1';
                            section.style.transform = 'translateY(0)';
                        }, 100);
                    }, index * 200);
                });
            }

            setTimeout(simulateContentLoad, 2000);
            document.querySelectorAll('.interactive-btn, .mission-card, .vision-card, .value-card, .feature-item, .benefit-item, .plan-item').forEach(el => {
                el.setAttribute('tabindex', '0');
                el.setAttribute('role', 'button');
                
                el.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });

                el.addEventListener('focus', function() {
                    this.style.outline = '3px solid #3498db';
                    this.style.outlineOffset = '2px';
                });

                el.addEventListener('blur', function() {
                    this.style.outline = 'none';
                });
            });
            window.addEventListener('scroll', updateOnScroll);
        });