document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const contacts = document.getElementById("contacts").value;
    const message = document.getElementById("message").value;

  // --- Name Validation ---
    if (!name) {
        showAlert("⚠️ Name is required", "warning");
        return;
    }
    if (name.length < 3) {
        showAlert("⚠️ Name must be at least 3 characters", "warning");
        return;
    }

    // --- Contact Validation ---
    if (!contacts) {
        showAlert("⚠️ Contact is required", "warning");
        return;
    }

    // Simple email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(contacts)) {
        showAlert("⚠️ Enter a valid email", "warning");
        return;
    }

    // --- Message Validation ---
    if (!message) {
        showAlert("⚠️ Message is required", "warning");
        return;
    }
    if (message.length < 10) {
        showAlert("⚠️ Message must be at least 10 characters", "warning");
        return;
    }


    try { 
        const res = await fetch("http://localhost:5000/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, contacts, message })
        });
        showAlert("  Your message has been sent. Thank you!", "success");
        document.getElementById("contactForm").reset();
    } catch (err) {
        console.error("Error:", err.message);
        showAlert("  Something went wrong. Please try again.", "error");
    }
});

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


