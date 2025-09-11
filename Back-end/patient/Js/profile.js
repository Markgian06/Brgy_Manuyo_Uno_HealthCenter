// Enhanced Profile.js with Account Verification
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
    
    // Account verification elements
    const verificationStatusDiv = document.getElementById('verificationStatus');
    const verifyAccountBtn = document.getElementById('verifyAccountBtn');

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

    // Event listeners for update buttons
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

    if (verifyAccountBtn) {
        verifyAccountBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Debug: Check if userId exists before navigating
            const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
            console.log('UserId before navigation:', userId);
            
            if (!userId) {
                alert('Session expired. Please log in again.');
                window.location.href = '/frontend/patient/html/login.html';
                return;
            }
            
            window.location.href = '/frontend/patient/html/accVerification.html';
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
                
                // Update verification status
                updateVerificationStatus(data.data.isAccountVerified);
                
                // Store userId for future requests if we didn't have it
                if (!userId && data.data.userId) {
                    localStorage.setItem('userId', data.data.userId);
                }
                
            } else {
                showError('Failed to load profile: ' + data.message);
            }

        } catch (error) {
            console.error('Profile load error:', error);
            showError('Cannot connect to server. Please try again.');
        }
    }

    function updateVerificationStatus(isVerified) {
        if (!verificationStatusDiv) return;
        
        if (isVerified) {
            verificationStatusDiv.innerHTML = `
                <div class="verification-status verified">
                    <span class="status-icon">✓</span>
                    <span class="status-text">Account Verified</span>
                </div>
            `;
            
            // Hide verify button if account is verified
            if (verifyAccountBtn) {
                verifyAccountBtn.style.display = 'none';
            }
        } else {
            verificationStatusDiv.innerHTML = `
                <div class="verification-status unverified">
                    <span class="status-icon">⚠</span>
                    <span class="status-text">Account Not Verified</span>
                    <small class="status-note">Please verify your email to access all features</small>
                </div>
            `;
            
            // Show verify button if account is not verified
            if (verifyAccountBtn) {
                verifyAccountBtn.style.display = 'inline-block';
                verifyAccountBtn.innerHTML = `
                    <span class="btn-icon">📧</span>
                    Verify Account
                `;
            }
        }
    }

    // Request medical record button
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
                    showAlert('Medical record request submitted!', 'success', 'formAlert');
                    requestRecordBtn.textContent = 'Request Sent';
                    requestRecordBtn.disabled = true;
                } else {
                    showAlert('Request failed: ' + data.message, 'error', 'formAlert');
                }
            } catch (error) {
                console.error('Request error:', error);
                showAlert('Request failed. Please try again.', 'error', 'formAlert');
            }
        });
    }

    function showError(message) {
        if (patientName) {
            patientName.textContent = message;
            patientName.style.color = 'red';
        }
        if (typeof showAlert === 'function') {
            showAlert(message, 'error', 'formAlert');
        } else {
            alert(message);
        }
    }
});

// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}` 
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data.message);
                    
                    // Clear stored data
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    sessionStorage.removeItem('userId');
                    localStorage.removeItem('updateType');

                    // Show success alert
                    if (typeof showAlert === 'function') {
                        showAlert('Successfully logged out! Redirecting...', 'success', 'formAlert');
                    }
                    
                    setTimeout(() => {
                        window.location.href = '/frontend/patient/html/login.html';
                    }, 2000);
                    
                } else {
                    throw new Error('Logout failed');
                }
            } catch (error) {
                console.error('Logout error:', error);
                if (typeof showAlert === 'function') {
                    showAlert('Logout failed. Please try again.', 'error', 'formAlert');
                } else {
                    alert('Logout failed. Please try again.');
                }
            }
        });
    }
});