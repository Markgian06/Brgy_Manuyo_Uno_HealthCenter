// LOGIN FORM HANDLER
document.getElementById('signin-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    console.log("LOGIN");

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loginIdentifier: formData.get('loginIdentifier'),
                password: formData.get('password')
            })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = '/';
        } else {
            alert(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});

// SIGNUP FORM HANDLER - THIS WAS MISSING!
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup') || document.getElementById('signup-form');
    
    if (signupForm) {
        console.log("Signup form found, adding event listener");
        
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // PREVENT traditional form submission
            console.log("Signup form submitted - preventing default");

            const formData = new FormData(signupForm);
            
            // Log form data for debugging
            console.log("Signup form data:");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            try {
                console.log("Sending signup request...");
                const response = await fetch('/signup', {
                    method: 'POST',
                    body: formData // Keep as FormData for file uploads
                });

                console.log("Signup response status:", response.status);
                const result = await response.json();
                console.log("Signup result:", result);

                if (response.ok && result.success) {
                    alert(result.message || "Successfully Registered");
                    
                    // DON'T redirect immediately - just switch to login section
                    if (typeof showSection === 'function') {
                        showSection('signinSection'); // Switch back to login
                    } else {
                        // If no section switching, redirect to login page
                        window.location.href = "/frontend/patient/html/login.html";
                    }
                } else {
                    alert(result.message || "Failed to register");
                }
            } catch (error) {
                console.error("Signup error:", error);
                alert("Network error. Please try again later.");
            }
        });
    } else {
        console.log("No signup form found on this page");
    }
});

// SECTION SWITCHING
function showSection(sectionId) {
    document.querySelectorAll(".auth-container section").forEach(sec => {
        sec.classList.remove("active");
    });
    document.getElementById(sectionId).classList.add("active");
}

// FILE PREVIEW FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('ID_image');
    const filePreview = document.getElementById('filePreview');
    const fileInfo = document.querySelector('.file-info');
    
    if (!fileInput) return; // Exit if no file input found
    
    let selectedFiles = [];
    
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        // Add new files to existing selection (up to 2 total)
        files.forEach((file) => {
            if (file.type.startsWith('image/') && selectedFiles.length < 2) {
                selectedFiles.push(file);
            }
        });
        
        // If more than 2 files, keep only the first 2
        if (selectedFiles.length > 2) {
            selectedFiles = selectedFiles.slice(0, 2);
        }
        
        // Refresh preview display
        refreshPreview();
        updateFileCount();
        updateFileInput();
    });
    
    function createPreview(file, index) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.dataset.index = index;
            
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="ID Preview" class="preview-image">
                <div class="preview-label">${index === 0 ? 'Front' : index === 1 ? 'Back' : `Image ${index + 1}`}</div>
                <button type="button" class="remove-btn" onclick="removeFile(${index})">&times;</button>
            `;
            
            if (filePreview) {
                filePreview.appendChild(previewItem);
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    function updateFileCount() {
        if (!fileInfo) return;
        
        const count = selectedFiles.length;
        let countElement = document.querySelector('.file-count');
        
        if (!countElement) {
            countElement = document.createElement('div');
            countElement.className = 'file-count';
            fileInfo.appendChild(countElement);
        }
        
        if (count === 0) {
            countElement.textContent = 'No files selected';
            countElement.className = 'file-count';
        } else if (count === 2) {
            countElement.textContent = `✓ ${count} files selected (Perfect!)`;
            countElement.className = 'file-count success';
        } else if (count < 2) {
            countElement.textContent = `${count} file selected (Need ${2 - count} more)`;
            countElement.className = 'file-count error';
        } else {
            countElement.textContent = `${count} files selected (Too many - remove ${count - 2})`;
            countElement.className = 'file-count error';
        }
    }
    
    // Global function to remove files
    window.removeFile = function(index) {
        selectedFiles.splice(index, 1);
        refreshPreview();
        updateFileCount();
        updateFileInput();
    };
    
    function refreshPreview() {
        if (!filePreview) return;
        
        filePreview.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            createPreview(file, index);
        });
    }
    
    function updateFileInput() {
        // Update the actual file input to match our selected files
        const dt = new DataTransfer();
        selectedFiles.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
    }
    
    // Initialize count display
    updateFileCount();
});

// URL PARAMETER HANDLING
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("error") === "notAuthorized") {
    alert("⚠️ Please login first");
}