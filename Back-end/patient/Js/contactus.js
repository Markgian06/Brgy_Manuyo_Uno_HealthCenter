document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const contacts = document.getElementById("contacts").value;
    const message = document.getElementById("message").value;


    if (!name) {
        showAlert("   Name is required", "error");
        return;
    }
    if (!contacts) {
        showAlert("  Contacts are required", "error");
        return;
    }
    if (!message) {
        showAlert("  Message is required", "error");
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


