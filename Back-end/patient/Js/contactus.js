document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const contacts = document.getElementById("contacts").value;
    const message = document.getElementById("message").value;


    if (!name || !contacts || !message) {
        alert("All fields are required");
        return;
    }

    try { 
        const res = await fetch("http://localhost:5000/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, contacts, message })
        });
        alert("Your message has been sent. Thank you!");
        document.getElementById("contactForm").reset();
    } catch (err) {
        console.error("Error:", err.message);
        alert("Something went wrong. Please try again.");
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


