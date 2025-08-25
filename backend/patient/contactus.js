    document.querySelectorAll('input, textarea').forEach(input => {
            const label = input.nextElementSibling;
            
            if (input.value) {
                label.classList.add('active');
            }
            
            input.addEventListener('focus', function() {
                label.classList.add('active');
                this.parentElement.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    label.classList.remove('active');
                }
                this.parentElement.style.transform = 'scale(1)';
            });
            
            input.addEventListener('input', function() {
                if (this.value) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });
        });