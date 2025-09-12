let currentIdentifier = '';
let verifiedOTP = '';
let otpTimerInterval;

// Start OTP timer (5 minutes default)
function startOtpTimer(duration = 300) { // duration in seconds
  const otpForm = document.getElementById('otp-form');
  let timerDisplay = document.getElementById('otp-timer');

  if (!timerDisplay) {
    // create timer element if not already there
    timerDisplay = document.createElement('div');
    timerDisplay.id = 'otp-timer';
    timerDisplay.style.marginTop = "10px";
    timerDisplay.style.color = "#555";
    otpForm.appendChild(timerDisplay);
  }

  let remaining = duration;

  clearInterval(otpTimerInterval);
  otpTimerInterval = setInterval(() => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    timerDisplay.textContent = `⏳ OTP will expire in ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    if (--remaining < 0) {
      clearInterval(otpTimerInterval);
      timerDisplay.textContent = "⚠️ OTP expired. Please request a new one.";
      document.querySelector("#otp-form .submit-btn").disabled = true;
    }
  }, 1000);
}
// Utility function to show messages
function showMessage(title, message) {
  const msgBox = document.getElementById('message-box');
  document.getElementById('message-title').textContent = title;
  document.getElementById('message-text').textContent = message;
  msgBox.classList.remove('hidden');
}

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  const backLink = document.querySelector(".backtologin a");
  try {
    const res = await fetch("/is-logged", {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      backLink.textContent = "Back to Profile";
      backLink.href = "/frontend/patient/html/profile.html";
    } else {
      backLink.textContent = "Back to Login";
      backLink.href = "/frontend/patient/html/login.html";
    }
  } catch (err) {
    console.error("is-logged check failed:", err);
    backLink.textContent = "Back to Login";
    backLink.href = "/frontend/patient/html/login.html";
  }
  
  // Setup OTP inputs
  setupOTPInputs();
});

// Close message box
document.getElementById('close-message').addEventListener('click', function () {
  document.getElementById('message-box').classList.add('hidden');
});

// Form references
const emailForm = document.getElementById('email-form');
const otpForm = document.getElementById('otp-form');
const resetForm = document.getElementById('reset-form');

// Step 1: Request OTP
emailForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const identifier = document.getElementById('identifier-email').value.trim();
  const button = emailForm.querySelector('.submit-btn');

  if (!identifier) {
    showMessage('Error', 'Please enter your email or contact number.');
    return;
  }

  button.textContent = 'Sending...';
  button.disabled = true;
  button.classList.add('loading');

  try {
    const response = await fetch('/sendResetOtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      currentIdentifier = identifier;
      showMessage('OTP Sent!', 'A verification code has been sent to your registered email address.');

      // Switch to OTP form
      emailForm.classList.add('hidden');
      otpForm.classList.remove('hidden');
      document.getElementById('identifier-otp-hidden').value = identifier;
      
      startOtpTimer(120);

      // Focus first OTP input
      document.querySelector('.otp-input').focus();
    } else {
      showMessage('Error', result.message || 'Failed to send OTP. Please try again.');
    }
  } catch (error) {
    console.error('Network error:', error);
    showMessage('Network Error', 'Could not connect to the server. Please check your connection.');
  } finally {
    button.textContent = 'Send OTP';
    button.disabled = false;
    button.classList.remove('loading');
  }
});

// Step 2: Verify OTP
otpForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const identifier = currentIdentifier || document.getElementById('identifier-otp-hidden').value;
  const otpInputs = document.querySelectorAll('.otp-input');
  let otp = '';
  otpInputs.forEach(inp => otp += inp.value);

  if (otp.length !== 6) {
    showMessage('Error', 'Please enter the complete 6-digit OTP code.');
    return;
  }

  const button = otpForm.querySelector('.submit-btn');
  button.textContent = 'Verifying...';
  button.disabled = true;
  button.classList.add('loading');

  try {
    const response = await fetch('/verifyResetOtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      verifiedOTP = otp;
      showMessage('OTP Verified!', 'Verification successful. You can now reset your password.');

      // Switch to reset form
      otpForm.classList.add('hidden');
      resetForm.classList.remove('hidden');
      document.getElementById('identifier-reset').value = identifier;
      document.getElementById('verified-otp').value = otp;
    } else {
      showMessage('Error', result.message || 'Invalid or expired OTP. Please try again.');
      // Clear OTP inputs
      otpInputs.forEach(inp => inp.value = '');
      otpInputs[0].focus();
    }
  } catch (error) {
    console.error('Network error:', error);
    showMessage('Network Error', 'Could not connect to the server. Please try again later.');
  } finally {
    button.textContent = 'Verify OTP';
    button.disabled = false;
    button.classList.remove('loading');
  }
});

// Step 3: Reset Password
resetForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const identifier = currentIdentifier || document.getElementById('identifier-reset').value;
  const otp = verifiedOTP || document.getElementById('verified-otp').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  const button = resetForm.querySelector('.submit-btn');

  // Client-side validation
  if (newPassword !== confirmNewPassword) {
    showMessage('Error', 'Passwords do not match. Please try again.');
    return;
  }

  if (newPassword.length < 8) {
    showMessage('Error', 'Password must be at least 8 characters long.');
    return;
  }

  if (!/[A-Z]/.test(newPassword)) {
    showMessage('Error', 'Password must contain at least one uppercase letter.');
    return;
  }

  if (!/[!@#$%^&*()\-+_=<>?]/.test(newPassword)) {
    showMessage('Error', 'Password must contain at least one special character.');
    return;
  }

  button.textContent = 'Resetting...';
  button.disabled = true;
  button.classList.add('loading');

  try {
    const response = await fetch('/resetPassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identifier, 
        otp,
        newPassword, 
        confirmNewPassword 
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
        showMessage('Success!', 'Your password has been reset successfully.');
      
        // Redirect after closing message
        document.getElementById("close-message").addEventListener("click", async () => {
          try {
            // Check if user is logged in
            const authRes = await fetch("/is-logged", {
              method: "POST",
              credentials: "include"
            });
            const authData = await authRes.json();
      
            if (authData.success) {
              // Logged in → go to profile
              window.location.href = "/frontend/patient/html/profile.html";
            } else {
              // Not logged in → go to login
              window.location.href = "/frontend/patient/html/login.html";
            }
          } catch (err) {
            console.error("Auth check failed:", err);
            // fallback to login
            window.location.href = "/frontend/patient/html/login.html";
          }
        }, { once: true });
      } else {
      showMessage('Error', result.message || 'Failed to reset password. Please try again.');
    }
  } catch (error) {
    console.error('Network error:', error);
    showMessage('Network Error', 'Could not connect to the server. Please try again later.');
  } finally {
    button.textContent = 'Reset Password';
    button.disabled = false;
    button.classList.remove('loading');
  }
});

// OTP input auto-focus and navigation
function setupOTPInputs() {
  const otpInputs = document.querySelectorAll('.otp-input');
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      // Only allow digits
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      
      if (e.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
    
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && index > 0 && input.value === "") {
        otpInputs[index - 1].focus();
      }
      
      // Allow navigation with arrow keys
      if (e.key === "ArrowLeft" && index > 0) {
        otpInputs[index - 1].focus();
      }
      if (e.key === "ArrowRight" && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
    
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text');
      const digits = paste.replace(/[^0-9]/g, '').slice(0, 6);
      
      digits.split('').forEach((digit, i) => {
        if (otpInputs[i]) {
          otpInputs[i].value = digit;
        }
      });
      
      // Focus next empty input or last input
      const nextEmptyIndex = digits.length < otpInputs.length ? digits.length : otpInputs.length - 1;
      otpInputs[nextEmptyIndex].focus();
    });
  });
}