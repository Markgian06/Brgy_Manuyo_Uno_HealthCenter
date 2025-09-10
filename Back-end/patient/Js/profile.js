// Clean version without console logs
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const patientName = document.getElementById('patientName');
    const patientId = document.getElementById('patientId');
    const patientAge = document.getElementById('patientAge');
    const patientGender = document.getElementById('patientGender');
    const emailPhoneInput = document.getElementById('email_phone');
    const passwordInput = document.getElementById('password');
    const updateEmailPhoneBtn = document.getElementById('updateEmailPhone');
    const updatePasswordBtn = document.getElementById('updatePassword');
    const requestRecordBtn = document.getElementById('requestRecordBtn');

    // Make email and password fields read-only
    if (emailPhoneInput) {
        emailPhoneInput.readOnly = true;
        emailPhoneInput.style.backgroundColor = '#f3f4f6';
        emailPhoneInput.style.cursor = 'not-allowed';
    }
    
    if (passwordInput) {
        passwordInput.readOnly = true;
        passwordInput.style.backgroundColor = '#f3f4f6';
        passwordInput.style.cursor = 'not-allowed';
        passwordInput.placeholder = '••••••••••';
    }

    if (updateEmailPhoneBtn) {
        updateEmailPhoneBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.setItem('updateType', 'email');
            window.location.href = '/frontend/patient/html/updateGmail.html';
        });
    }
    
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.setItem('updateType', 'password');
            window.location.href = '/frontend/patient/html/forgetpassword.html';
        });
    }

    // Load profile when page loads
    loadProfile();

    async function loadProfile() {
        try {
            let userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
            let response;
            
            if (userId) {
                response = await fetch(`/profile/${userId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                response = await fetch('/profile', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                // Populate all the profile fields
                if (patientName) patientName.textContent = data.data.fullName || 'N/A';
                if (patientId) patientId.textContent = data.data.patientID || 'N/A';
                if (patientAge) patientAge.textContent = data.data.age || 'N/A';
                if (patientGender) patientGender.textContent = data.data.gender || 'N/A';
                
                // Show email in the read-only field
                if (emailPhoneInput) {
                    emailPhoneInput.value = data.data.email || data.data.contactNum || 'Not provided';
                }
                
                // Store userId for future requests if we didn't have it
                if (!userId && data.data.userId) {
                    localStorage.setItem('userId', data.data.userId);
                }
                
            } else {
                showError('Failed to load profile: ' + data.message);
            }

        } catch (error) {
            showError('Cannot connect to server. Please try again.');
        }
    }

    // Request medical record button (keep this functionality)
    if (requestRecordBtn) {
        requestRecordBtn.addEventListener('click', async function() {
            if (!confirm('Request your medical records?')) return;

            try {
                const response = await fetch('/api/patient/profile/request-medical-record', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (data.success) {
                    alert('Medical record request submitted!');
                    requestRecordBtn.textContent = 'Request Sent';
                    requestRecordBtn.disabled = true;
                } else {
                    alert('Request failed: ' + data.message);
                }
            } catch (error) {
                alert('Request failed. Please try again.');
            }
        });
    }

    function showError(message) {
        if (patientName) {
            patientName.textContent = message;
            patientName.style.color = 'red';
        }
        alert(message);
    }
});



document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault(); // Prevent default button behavior
            
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Include authorization header if you're using tokens
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}` 
                    },
                    credentials: 'include' // Include cookies if using session-based auth
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data.message); // Should log "Logged Out"
                    
                    // Clear any stored tokens
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    sessionStorage.removeItem('userId');

                    // Show success alert using your existing alert.js
                    showAlert('Successfully logged out! Redirecting...', 'success', 'formAlert');
                    
                    // Redirect to login page after showing the alert (2 second delay)
                    setTimeout(() => {
                        window.location.href = '/frontend/patient/html/login.html';
                    }, 2000);
                    
                } else {
                    throw new Error('Logout failed');
                }
            } catch (error) {
                console.error('Logout error:', error);
                // Use your alert.js instead of browser alert
                showAlert('Logout failed. Please try again.', 'error', 'formAlert');
            }
        });
    }
});