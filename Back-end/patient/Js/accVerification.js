// Debug version of accVerification.js
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const emailDisplay = document.getElementById('emailDisplay');
    const otpInputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.getElementById('verifyBtn');
    const resendBtn = document.getElementById('resendBtn');
    const timerElement = document.getElementById('timer');
    const statusMessage = document.getElementById('statusMessage');

    // Variables with debugging
    let userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    // DEBUG: Log userId information
    console.log('=== DEBUG INFO ===');
    console.log('localStorage userId:', localStorage.getItem('userId'));
    console.log('sessionStorage userId:', sessionStorage.getItem('userId'));
    console.log('Final userId:', userId);
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('All sessionStorage keys:', Object.keys(sessionStorage));
    console.log('==================');
    
    let userEmail = '';
    let timerInterval;
    let timeLeft = 120;
    let otpAttempts = 0;
    const maxOtpAttempts = 3;
    let resendAttempts = 0;
    const maxResendAttempts = 5;

    // Initialize page
    init();

    async function init() {
        // DEBUG: More detailed userId checking
        if (!userId) {
            console.log('ERROR: No userId found');
            console.log('Checking alternative storage keys...');
            
            // Check for alternative key names that might be used
            const possibleKeys = ['user_id', 'patient_id', 'id', 'userId', 'patientId'];
            let foundUserId = null;
            
            possibleKeys.forEach(key => {
                const localValue = localStorage.getItem(key);
                const sessionValue = sessionStorage.getItem(key);
                console.log(`${key}: localStorage=${localValue}, sessionStorage=${sessionValue}`);
                
                if (localValue && !foundUserId) foundUserId = localValue;
                if (sessionValue && !foundUserId) foundUserId = sessionValue;
            });
            
            if (foundUserId) {
                console.log('Found userId with alternative key:', foundUserId);
                userId = foundUserId;
            } else {
                showStatus('Please log in to verify your account. Redirecting in 5 seconds...', 'error');
                console.log('No userId found anywhere, redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/frontend/patient/html/login.html';
                }, 5000); // Increased to 5 seconds for debugging
                return;
            }
        }

        console.log('Using userId:', userId);
        await loadUserData();
        setupOTPInputs();
    }

    async function loadUserData() {
        try {
            showStatus('Loading account information...', 'info');
            console.log('Fetching profile for userId:', userId);
            
            const response = await fetch(`/profile/${userId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`  
                }
            });

            console.log('Profile response status:', response.status);
            console.log('Profile response headers:', [...response.headers.entries()]);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Profile response error:', errorText);
                throw new Error(`Failed to load user data: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Profile response data:', data);
            
            if (data.success && data.data.email) {
                userEmail = data.data.email;
                emailDisplay.textContent = maskEmail(userEmail);
                console.log('User email loaded:', userEmail);
                console.log('Account verification status:', data.data.isAccountVerified);
                
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
                console.log('Invalid response data:', data);
                throw new Error(data.message || 'Email not found');
            }
        } catch (error) {
            console.error('Load user data error:', error);
            showStatus(`Failed to load user information: ${error.message}. Redirecting to login in 5 seconds...`, 'error');
            setTimeout(() => {
                window.location.href = '/frontend/patient/html/login.html';
            }, 5000);
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
            input.addEventListener('input', function(e) {
                const value = e.target.value;
                
                if (!/^\d$/.test(value) && value !== '') {
                    e.target.value = '';
                    return;
                }

                if (value) {
                    e.target.classList.add('filled');
                    if (index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                } else {
                    e.target.classList.remove('filled');
                }

                updateVerifyButtonState();
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    otpInputs[index - 1].focus();
                    otpInputs[index - 1].value = '';
                    otpInputs[index - 1].classList.remove('filled');
                    updateVerifyButtonState();
                }

                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!verifyBtn.disabled) {
                        verifyOTP();
                    }
                }
            });

            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const numbers = paste.replace(/\D/g, '').slice(0, 6);
                
                otpInputs.forEach(inp => {
                    inp.value = '';
                    inp.classList.remove('filled');
                });
                
                for (let i = 0; i < numbers.length && i < otpInputs.length; i++) {
                    otpInputs[i].value = numbers[i];
                    otpInputs[i].classList.add('filled');
                }
                
                const nextEmptyIndex = Math.min(numbers.length, otpInputs.length - 1);
                otpInputs[nextEmptyIndex].focus();
                
                updateVerifyButtonState();
            });

            input.addEventListener('focus', function() {
                this.select();
            });
        });
    }

    function updateVerifyButtonState() {
        const allFilled = Array.from(otpInputs).every(inp => inp.value.length === 1);
        verifyBtn.disabled = !allFilled || timeLeft < 0;
    }

    function startTimer() {
        timeLeft = 120;
        resendBtn.disabled = true;
        
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        timerInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
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
                clearOTPInputs();
            }
        }, 1000);
    }

    async function sendOTP() {
        try {
            if (resendAttempts >= maxResendAttempts) {
                showStatus('Too many resend attempts. Please try again later.', 'error');
                return;
            }

            showStatus('Sending verification code...', 'info');
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sending...';
            
            console.log('Sending OTP for userId:', userId);
            
            const response = await fetch('/send-verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`  
                },
                credentials: 'include',
                body: JSON.stringify({ userId: userId })
            });

            console.log('Send OTP response status:', response.status);
            const data = await response.json();
            console.log('Send OTP response data:', data);
            
            if (data.success) {
                resendAttempts++;
                showStatus(`Verification code sent to your email! (Attempt ${resendAttempts}/${maxResendAttempts})`, 'success');
                startTimer();
                clearOTPInputs();
                otpAttempts = 0;
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
            
            console.log('Verifying OTP:', otp, 'for userId:', userId);
            
            const response = await fetch('/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`  
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    userId: userId,
                    otp: otp 
                })
            });

            console.log('Verify OTP response status:', response.status);
            const data = await response.json();
            console.log('Verify OTP response data:', data);
            
            if (data.success) {
                clearInterval(timerInterval);
                showStatus('Account verified successfully! Redirecting to your profile...', 'success');
                
                verifyBtn.innerHTML = '<span class="success-icon">✓</span> Verified';
                verifyBtn.style.backgroundColor = '#10b981';
                verifyBtn.style.borderColor = '#10b981';
                
                if (typeof showAlert === 'function') {
                    showAlert('Account verified successfully!', 'success', 'formAlert');
                }
                
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
                
                otpInputs.forEach(input => {
                    input.classList.add('error');
                    setTimeout(() => input.classList.remove('error'), 600);
                });
                
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

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (confirm('Are you sure you want to go back to your profile?')) {
                window.location.href = '/frontend/patient/html/profile.html';
            }s
        }
    });

    window.addEventListener('beforeunload', function(e) {
        if (timeLeft > 0 && timeLeft < 120) {
            e.preventDefault();
            e.returnValue = 'You have an active verification session. Are you sure you want to leave?';
            return e.returnValue;
        }
    });

    window.addEventListener('unload', function() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    });
});