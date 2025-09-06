function showAlert(message, type = "success") {
            const existing = document.querySelector('.alert');
            if (existing) existing.remove();

            const alertBox = document.createElement('div');
            alertBox.className = `alert ${type}`;

            let icon;
            switch(type) {
                case 'success': icon = '✓'; break;
                case 'error': icon = '✕'; break;
                case 'info': icon = 'ⓘ'; break;
                case 'warning': icon = '⚠'; break;
                default: icon = 'ⓘ';
            }

            alertBox.innerHTML = `
                <div class="alert-content">
                    <span class="alert-text">${message}</span>
                    <button class="alert-close" onclick="closeAlert()">&times;</button>
                </div>
                ${(type === "success" || type === "info") ? '<div class="alert-progress"></div>' : ''}
            `;

            document.body.appendChild(alertBox);

            requestAnimationFrame(() => {
                alertBox.classList.add('show');
            });

            if (type === "success" || type === "info") {
                setTimeout(() => closeAlert(), 4000);
            }
        }

        function closeAlert() {
            const alertBox = document.querySelector('.alert');
            const backdrop = document.querySelector('.alert-backdrop');
            
            if (alertBox) {
                alertBox.classList.remove('show');
                alertBox.style.transform = 'translate(-50%, -50%) scale(0.8) rotateY(-90deg)';
                alertBox.style.opacity = '0';
                
                if (backdrop) {
                    backdrop.classList.remove('show');
                }
                
                setTimeout(() => {
                    if (alertBox.parentNode) alertBox.remove();
                    if (backdrop && backdrop.parentNode) backdrop.remove();
                }, 600);
            }
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAlert();
            }
        });

        document.addEventListener('click', function(e) {
            const alertBox = document.querySelector('.alert');
            const backdrop = document.querySelector('.alert-backdrop');
            if (backdrop && e.target === backdrop) {
                closeAlert();
            }
        });