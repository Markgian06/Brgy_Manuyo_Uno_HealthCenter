document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup");
    
    // Function to use your custom alert system
    function showCustomAlert(message, type = 'success') {
        const alertDiv = document.getElementById("formAlert");
        if (alertDiv) {
            alertDiv.textContent = message;
            alertDiv.className = `alert alert-${type}`;
            alertDiv.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                alertDiv.style.display = 'none';
            }, 5000);
        }
    }
  
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent form submission
  
        const formData = new FormData(signupForm);
  
        try {
            const response = await fetch("/signup", {
                method: "POST",
                body: formData
            });
  
            const result = await response.json();
  
            if (response.ok && result.success) {
                showCustomAlert(result.message || "Successfully Registered", 'success');
                // Delay redirect to show the alert
                setTimeout(() => {
                    window.location.href = "/frontend/patient/html/login.html";
                }, 2000);
            } else {
                showCustomAlert(result.message || "Failed to register", 'error');
            }
        } catch (error) {
            console.error("Signup error:", error);
            showCustomAlert("Network error. Please try again later.", 'error');
        }
    });
});