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

    // Account verification button event listener
    if (verifyAccountBtn) {
        verifyAccountBtn.addEventListener('click', function(e) {
            e.preventDefault();
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
        
        const benefitsDiv = document.getElementById('verificationBenefits');
        
        if (isVerified) {
            verificationStatusDiv.innerHTML = `
                <div class="verification-status verified" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    background: #dcfce7;
                    border: 1px solid #22c55e;
                    color: #15803d;
                ">
                    <span style="font-size: 20px; font-weight: bold;">✓</span>
                    <span style="font-weight: 600; font-size: 1rem;">Account Verified</span>
                </div>
            `;
            
            // Hide verify button and benefits if account is verified
            if (verifyAccountBtn) {
                verifyAccountBtn.style.display = 'none';
            }
            if (benefitsDiv) {
                benefitsDiv.style.display = 'none';
            }
        } else {
            verificationStatusDiv.innerHTML = `
                <div class="verification-status unverified" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    background: #fef3c7;
                    border: 1px solid #f59e0b;
                    color: #92400e;
                ">
                    <span style="font-size: 20px; font-weight: bold;">⚠</span>
                    <div>
                        <span style="font-weight: 600; font-size: 1rem;">Account Not Verified</span>
                        <small style="display: block; font-size: 0.875rem; margin-top: 4px; opacity: 0.8;">
                            Please verify your email to access all features
                        </small>
                    </div>
                </div>
            `;
            
            // Show verify button and benefits if account is not verified
            if (verifyAccountBtn) {
                verifyAccountBtn.style.display = 'inline-flex';
            }
            if (benefitsDiv) {
                benefitsDiv.style.display = 'block';
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