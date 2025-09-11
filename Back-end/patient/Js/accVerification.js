// Enhanced accVerification.js with better error handling and user experience
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const emailDisplay = document.getElementById('emailDisplay');
    const otpInputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.getElementById('verifyBtn');
    const resendBtn = document.getElementById('resendBtn');
    const timerElement = document.getElementById('timer');
    const statusMessage = document.getElementById('statusMessage');

    // Variables
    let userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    let userEmail = '';
    let timerInterval;
    let timeLeft = 120; // 2 minutes in seconds
    let otpAttempts = 0;
    const maxOtpAttempts = 3;
    let resendAttempts = 0;
    const maxResendAttempts = 5;

    // Initialize page
    init();

    async function init() {
        if (!userId) {
            showStatus('Please log in to verify your account.', 'error');
            setTimeout(() => {
                window.location.href = '/frontend/patient/html/login.html';
            }, 2000);
            return;
        }

        await loadUserData();
        setupOTPInputs();
    }

    async function loadUserData() {
        try {
            showStatus('Loading account information...', 'info');
            
            const response = await fetch(`/profile/${userId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load user data: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.data.email) {
                userEmail = data.data.email;
                emailDisplay.textContent = maskEmail(userEmail);
                
                // Check if already verified
                if (data.data.isAccountVerified) {
                    showStatus('Your account is already verified! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = '/frontend/patient/html/profile.html';
                    }, 2000);
                    return;
                }
                
                // Auto-send OTP when page loads
                await sendOTP();
            } else {
                throw new Error(data.message || 'Email not found');
            }
        } catch (error) {
            console.error('Load user data error:', error);
            showStatus('Failed to load user information. Please try logging in again.', 'error');
            setTimeout(() => {
                window.location.href = '/frontend/patient/html/login.html';
            }, 3000);
        }
    }

    function maskEmail(email) {
        const [username, domain] = email.split('@');
        if (username.length <= 2) {
            return `${username}@${domain}`;
        }
        const maskedUsername = username.substring(0, 2) + '*'.repeat(Math.min(username.length - 2, 6));
        return `${maskedUsername}@${domain}`;
    }

    function setupOTPInputs() {
        otpInputs.forEach((input, index) => {
            // Input event handler
            input.addEventListener('input', function(e) {
                const value = e.target.value;
                
                // Only allow numbers
                if (!/^\d$/.test(value) && value !== '') {
                    e.target.value = '';
                    return;
                }

                // Add visual feedback
                if (value) {
                    e.target.classList.add('filled');
                    // Move to next input
                    if (index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                } else {
                    e.target.classList.remove('filled');
                }

                // Enable/disable verify button based on all inputs filled
                updateVerifyButtonState();
            });

            // Keydown event handler
            input.addEventListener('keydown', function(e) {
                // Handle backspace
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    otpInputs[index - 1].focus();
                    otpInputs[index - 1].value = '';
                    otpInputs[index - 1].classList.remove('filled');
                    updateVerifyButtonState();
                }

                // Handle Enter key
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!verifyBtn.disabled) {
                        verifyOTP();
                    }
                }
            });

            // Paste event handler
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const numbers = paste.replace(/\D/g, '').slice(0, 6);
                
                // Clear all inputs first
                otpInputs.forEach(inp => {
                    inp.value = '';
                    inp.classList.remove('filled');
                });
                
                // Fill inputs with pasted numbers
                for (let i = 0; i < numbers.length && i < otpInputs.length; i++) {
                    otpInputs[i].value = numbers[i];
                    otpInputs[i].classList.add('filled');
                }
                
                // Focus on next empty input or last input
                const nextEmptyIndex = Math.min(numbers.length, otpInputs.length - 1);
                otpInputs[nextEmptyIndex].focus();
                
                updateVerifyButtonState();
            });

            // Focus event handler
            input.addEventListener('focus', function() {
                // Select all text on focus for easier replacement
                this.select();
            });
        });
    }

    function updateVerifyButtonState() {
        const allFilled = Array.from(otpInputs).every(inp => inp.value.length === 1);
        verifyBtn.disabled = !allFilled || timeLeft < 0;
    }

    function startTimer() {
        timeLeft = 120; // Reset to 2 minutes
        resendBtn.disabled = true;
        
        // Clear existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        timerInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Add warning class when less than 30 seconds
            if (timeLeft <= 30) {
                timerElement.classList.add('warning');
            } else {
                timerElement.classList.remove('warning');
            }
            
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(timerInterval);
                timerElement.textContent = 'Expired';
                timerElement.classList.add('warning');
                resendBtn.disabled = false;
                verifyBtn.disabled = true;
                showStatus('OTP has expired. Please request a new code.', 'error');
                
                // Clear inputs when expired
                clearOTPInputs();
            }
        }, 1000);
    }

    async function sendOTP() {
        try {
            // Check resend attempts limit
            if (resendAttempts >= maxResendAttempts) {
                showStatus('Too many resend attempts. Please try again later.', 'error');
                return;
            }

            showStatus('Sending verification code...', 'info');
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sending...';
            
            const response = await fetch('/sendVerifyOtp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ userId: userId })
            });

            const data = await response.json();
            
            if (data.success) {
                resendAttempts++;
                showStatus(`Verification code sent to your email! (Attempt ${resendAttempts}/${maxResendAttempts})`, 'success');
                startTimer();
                
                // Clear previous OTP inputs
                clearOTPInputs();
                
                // Reset verification attempts
                otpAttempts = 0;
                
                // Focus first input
                otpInputs[0].focus();
                
                resendBtn.textContent = 'Resend Code';
            } else {
                throw new Error(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            showStatus(error.message || 'Failed to send verification code. Please check your connection.', 'error');
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Code';
        }
    }

    async function verifyOTP() {
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otp.length !== 6) {
            showStatus('Please enter the complete 6-digit code.', 'error');
            return;
        }

        // Check attempt limits
        if (otpAttempts >= maxOtpAttempts) {
            showStatus('Too many failed attempts. Please request a new code.', 'error');
            clearOTPInputs();
            resendBtn.disabled = false;
            return;
        }

        try {
            otpAttempts++;
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<span class="loading-spinner"></span> Verifying...';
            
            const response = await fetch('/verifyEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    userId: userId,
                    otp: otp 
                })
            });

            const data = await response.json();
            
            if (data.success) {
                clearInterval(timerInterval);
                showStatus('Account verified successfully! Redirecting to your profile...', 'success');
                
                verifyBtn.innerHTML = '<span class="success-icon">✓</span> Verified';
                verifyBtn.style.backgroundColor = '#10b981';
                verifyBtn.style.borderColor = '#10b981';
                
                // Show success alert if available
                if (typeof showAlert === 'function') {
                    showAlert('Account verified successfully!', 'success', 'formAlert');
                }
                
                // Add success class to inputs
                otpInputs.forEach(input => input.classList.add('success'));
                
                setTimeout(() => {
                    window.location.href = '/frontend/patient/html/profile.html';
                }, 2000);
            } else {
                throw new Error(data.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            const attemptsLeft = maxOtpAttempts - otpAttempts;
            
            if (attemptsLeft > 0) {
                showStatus(`${error.message} (${attemptsLeft} attempts remaining)`, 'error');
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Verify Account';
                
                // Add error animation to inputs
                otpInputs.forEach(input => {
                    input.classList.add('error');
                    setTimeout(() => input.classList.remove('error'), 600);
                });
                
                // Clear inputs and focus first one
                clearOTPInputs();
                otpInputs[0].focus();
            } else {
                showStatus('Maximum attempts reached. Please request a new code.', 'error');
                clearOTPInputs();
                resendBtn.disabled = false;
                verifyBtn.textContent = 'Verify Account';
            }
        }
    }

    function clearOTPInputs() {
        otpInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled', 'error', 'success');
        });
        updateVerifyButtonState();
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message status-${type}`;
        statusMessage.style.display = 'block';
        
        // Auto-hide success and info messages after 5 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (statusMessage.textContent === message) {
                    statusMessage.style.display = 'none';
                }
            }, 5000);
        }
    }

    // Event listeners
    verifyBtn.addEventListener('click', verifyOTP);
    
    resendBtn.addEventListener('click', async function() {
        clearInterval(timerInterval);
        await sendOTP();
    });

    // Global keyboard handler
    document.addEventListener('keydown', function(e) {
        // Handle Escape key to go back
        if (e.key === 'Escape') {
            if (confirm('Are you sure you want to go back to your profile?')) {
                window.location.href = '/frontend/patient/html/profile.html';
            }
        }
    });

    // Prevent page refresh/close during verification
    window.addEventListener('beforeunload', function(e) {
        if (timeLeft > 0 && timeLeft < 120) {
            e.preventDefault();
            e.returnValue = 'You have an active verification session. Are you sure you want to leave?';
            return e.returnValue;
        }
    });

    // Cleanup on page unload
    window.addEventListener('unload', function() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    });
});