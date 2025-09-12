let pendingEmail = '';
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
document.addEventListener("DOMContentLoaded", () => {
  const gmailForm = document.getElementById("gmail-form");
  const otpForm = document.getElementById("otp-form");
  let currentUserId = "";

  // Setup OTP inputs
  setupOTPInputs();

  // Get userId - adjust this based on how you store user info
  currentUserId = localStorage.getItem('userId');

  // Close message box
  document.getElementById('close-message').addEventListener('click', function () {
    document.getElementById('message-box').classList.add('hidden');
  });

  // Step 1: Send OTP to new email
  gmailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const newEmail = document.getElementById("newGmail").value.trim();
    const button = gmailForm.querySelector('.submit-btn');

    if (!newEmail) {
      showMessage('Error', 'Please enter your new email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showMessage('Error', 'Please enter a valid email address.');
      return;
    }

    pendingEmail = newEmail;

    button.textContent = 'Sending...';
    button.disabled = true;
    button.classList.add('loading');

    try {
      const response = await fetch("/sendUpdateGmailOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          newEmail,
          userId: currentUserId
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showMessage('OTP Sent!', 'A verification code has been sent to your new email address.');

        // Switch to OTP form
        gmailForm.classList.add('hidden');
        otpForm.classList.remove('hidden');
        
        startOtpTimer(120); // 2 minutes timer

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

  // Step 2: Verify OTP and update email
  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
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
      const response = await fetch("/updateGmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          otp,
          newEmail: pendingEmail,
          userId: currentUserId
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showMessage('Success!', 'Your email has been updated successfully.');
        
        // Redirect after closing message
        document.getElementById("close-message").addEventListener("click", () => {
          window.location.href = "/frontend/patient/html/profile.html";
        }, { once: true });
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
      button.textContent = 'Verify & Update';
      button.disabled = false;
      button.classList.remove('loading');
    }
  });
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