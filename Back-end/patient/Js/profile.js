// Enhanced Profile.js with Account Verification (cookie/session-based only)
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const patientName = document.getElementById('patientName');
    const patientId = document.getElementById('patientId');
    const patientAge = document.getElementById('patientAge');
    const patientGender = document.getElementById('patientGender');
    const emailPhoneInput = document.getElementById('email_phone');
    const passwordInput = document.getElementById('password');
    const updateEmailPhoneBtn = document.getElementById('updateEmailPhone');
    const updatePasswordBtn = document.getElementById('updatePassword');
    const requestRecordBtn = document.getElementById('requestRecordBtn');

    // Verification UI
    const verificationStatusDiv = document.getElementById('verificationStatus');
    const verifyAccountBtn = document.getElementById('verifyAccountBtn');

    // Lock email & password fields
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
        updateEmailPhoneBtn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.setItem('updateType', 'email');
            window.location.href = '/frontend/patient/html/updateGmail.html';
        });
    }
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.setItem('updateType', 'password');
            window.location.href = '/frontend/patient/html/forgetpassword.html';
        });
    }

    // Verify account navigation
    if (verifyAccountBtn) {
        verifyAccountBtn.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = '/frontend/patient/html/accVerification.html';
        });
    }

    // Load profile immediately
    loadProfile();

    async function loadProfile() {
        try {
            // ✅ No localStorage.userId — rely only on cookie
            const response = await fetch('/profile', {
                method: 'GET',
                credentials: 'include', // important: send cookie!
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Populate profile fields
                if (patientName) patientName.textContent = data.data.fullName || 'N/A';
                if (patientId) patientId.textContent = data.data.patientID || 'N/A';
                if (patientAge) patientAge.textContent = data.data.age || 'N/A';
                if (patientGender) patientGender.textContent = data.data.gender || 'N/A';

                if (emailPhoneInput) {
                    emailPhoneInput.value = data.data.email || data.data.contactNum || 'Not provided';

                    if (data.data.isAccountVerified) {
                        patientName.innerHTML += ` 
                            <span style="color:#1DA1F2; font-size:16px; margin-left:6px;" title="Verified">
                                ☑️
                            </span>`;
                    }
                }

                // Update verification status
                updateVerificationStatus(data.data.isAccountVerified);
            } else {
                showError('Failed to load profile: ' + data.message);
            }
        } catch (err) {
            console.error('Profile load error:', err);
            showError('Session expired. Please log in again.');
            setTimeout(() => {
                window.location.href = '/frontend/patient/html/login.html';
            }, 2000);
        }
    }

    function updateVerificationStatus(isVerified) {
        if (!verificationStatusDiv) return;

  if (isVerified) {
        verificationStatusDiv.innerHTML = `
            <div class="verification-status verified" style="color:green; font-weight:bold;">
                <span class="status-icon">✅</span>
                <span class="status-text">Account Verified</span>
            </div>
        `;
        if (verifyAccountBtn) verifyAccountBtn.style.display = 'none';
    } else {
        verificationStatusDiv.innerHTML = `
            <div class="verification-status unverified" style="color:red;">
                <span class="status-icon">⚠</span>
                <span class="status-text">Account Not Verified</span>
                <small class="status-note">Please verify your email to access all features</small>
            </div>
        `;
        if (verifyAccountBtn) {
            verifyAccountBtn.style.display = 'inline-block';
            verifyAccountBtn.innerHTML = `<span class="btn-icon">📧</span> Verify Account`;
        }
    }
    }

    // Request medical record
    if (requestRecordBtn) {
        requestRecordBtn.addEventListener('click', async function() {
            if (!confirm('Request your medical records?')) return;
            try {
                const response = await fetch('/api/patient/profile/request-medical-record', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (data.success) {
                    showAlert('Medical record request submitted!', 'success', 'formAlert');
                    requestRecordBtn.textContent = 'Request Sent';
                    requestRecordBtn.disabled = true;
                } else {
                    showAlert('Request failed: ' + data.message, 'error', 'formAlert');
                }
            } catch (err) {
                console.error('Request error:', err);
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

// Logout
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    localStorage.clear();
                    sessionStorage.clear();
                    if (typeof showAlert === 'function') {
                        showAlert('Successfully logged out! Redirecting...', 'success', 'formAlert');
                    }
                    setTimeout(() => {
                        window.location.href = '/frontend/patient/html/login.html';
                    }, 2000);
                } else {
                    throw new Error('Logout failed');
                }
            } catch (err) {
                console.error('Logout error:', err);
                alert('Logout failed. Please try again.');
            }
        });
    }
});
