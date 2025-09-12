document.addEventListener('DOMContentLoaded', async function() {
    const emailDisplay = document.getElementById('emailDisplay');
    const otpInputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.getElementById('verifyBtn');
    const resendBtn = document.getElementById('resendBtn');
    const timerElement = document.getElementById('timer');
    const statusMessage = document.getElementById('statusMessage');

    let userId = null;
    let userEmail = '';
    let timerInterval;
    let timeLeft = 120;
    function maskEmail(email) {
        if (!email || !email.includes('@')) return email;
        const [local, domain] = email.split('@');
        const maskedLocal = local.length > 2 
            ? local.substring(0, 2) + '*'.repeat(local.length - 2) 
            : local[0] + '*';
        const [domainName, tld] = domain.split('.');
        const maskedDomain = domainName[0] + '*'.repeat(Math.max(domainName.length - 1, 1));
        return `${maskedLocal}@${maskedDomain}.${tld}`;
    }
    // ✅ Move this OUTSIDE init
    function showStatus(message, type = "info") {
        if (!statusMessage) return;
    
        statusMessage.textContent = message;
        statusMessage.style.color =
            type === "error" ? "red" : type === "success" ? "green" : "black";
    
        // Auto-clear after 3s
        setTimeout(() => {
            statusMessage.textContent = "";
        }, 3000);
    }

    function startTimer() {
        clearInterval(timerInterval); // reset if already running
        timeLeft = 120;
        timerElement.textContent = formatTime(timeLeft);
        timerElement.style.color = "red";
    
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = formatTime(timeLeft);
    
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showStatus("OTP expired. Please resend.", "error");
            }
        }, 1000);
    }
    
    function formatTime(seconds) {
        const min = String(Math.floor(seconds / 60)).padStart(2, "0");
        const sec = String(seconds % 60).padStart(2, "0");
        return `${min}:${sec}`;
    }
    
    function setupOTPInputs() {
        otpInputs.forEach((input, index) => {
            input.addEventListener("input", () => {
                if (input.value.length === 1 && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus(); // move to next
                }
            });
    
            input.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && index > 0 && input.value === "") {
                    otpInputs[index - 1].focus(); // move back
                }
            });
        });
    }    

    // 🔹 Instead of using localStorage, check session via backend
    async function init() {
        try {
            const res = await fetch('/check-auth', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();

            if (!data.loggedIn) {
                showStatus('Session expired. Please log in again.', 'error');
                setTimeout(() => {
                    window.location.href = '/frontend/patient/html/login.html';
                }, 2000);
                return;
            }
            
            userId = data.user._id;   // always reliable
            userEmail = data.user.email;

            emailDisplay.textContent = maskEmail(userEmail);

            if (data.user.isAccountVerified) {
                showStatus('Your account is already verified! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/frontend/patient/html/profile.html';
                }, 2000);
                return;
            }

            // Auto-send OTP
            await sendOTP();
            setupOTPInputs();

        } catch (err) {
            console.error('Init error:', err);
            showStatus('Unable to verify session. Please log in again.', 'error');
            setTimeout(() => {
                window.location.href = '/frontend/patient/html/login.html';
            }, 2000);
        }
    }

    async function sendOTP() {
        try {
            const response = await fetch('/sendVerifyOtp', {
                method: 'POST',
                credentials: 'include',   // 🔹 cookie carries userId
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})   // 🔹 no need to send userId
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            showStatus('Verification code sent to your email.', 'success');
            startTimer();

        } catch (err) {
            console.error('Send OTP error:', err);
            showStatus(err.message || 'Failed to send OTP.', 'error');
        }
    }

    async function verifyOTP() {
        const otp = Array.from(otpInputs).map(inp => inp.value).join('');
        if (otp.length !== 6) {
            showStatus('Please enter the 6-digit code.', 'error');
            return;
        }

        try {
            const response = await fetch('/verifyEmail', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp }) // 🔹 no userId needed
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            showStatus('Account verified successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/frontend/patient/html/profile.html';
            }, 2000);

        } catch (err) {
            console.error('Verify OTP error:', err);
            showStatus(err.message || 'Verification failed.', 'error');
        }
    }

    // Keep your setupOTPInputs, startTimer, maskEmail, showStatus functions...

if (verifyBtn) {
    verifyBtn.addEventListener('click', verifyOTP);
}
if (resendBtn) {
    resendBtn.addEventListener('click', sendOTP);
}

    init(); // 🔹 start here
});
