function showMessage(title, message) {
    const msgBox = document.getElementById('message-box');
    document.getElementById('message-title').textContent = title;
    document.getElementById('message-text').textContent = message;
    msgBox.classList.remove('hidden');
}

document.addEventListener("DOMContentLoaded", async () => {
    const backLink = document.querySelector(".backtologin a");
    try {
      const res = await fetch("/is-logged", {
        method: "POST",
        credentials: "include"   // important to send cookie
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
  });
document.getElementById('close-message').addEventListener('click', function() {
    document.getElementById('message-box').classList.add('hidden');
});

const otpForm = document.getElementById('otp-form');
const resetForm = document.getElementById('reset-form');

// Form for requesting OTP
otpForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const identifier = document.getElementById('identifier-otp').value;
    const button = otpForm.querySelector('.submit-btn');

    button.textContent = 'Sending...';
    button.disabled = true;

    try {
        const response = await fetch('/sendResetOtp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
        });

        const result = await response.json();

        if (response.ok) {
            // The message now indicates the OTP is sent to their associated email
            showMessage('OTP Sent!', 'A one-time password has been sent to your registered email address. Please enter it below to reset your password.');

            otpForm.classList.add('hidden');
            resetForm.classList.remove('hidden');
            document.getElementById('identifier-reset').value = identifier;
        } else {
            showMessage('Error', result.message || 'Failed to send OTP. Please try again.');
        }
    } catch (error) {
        console.error('Network error:', error);
        showMessage('Network Error', 'Could not connect to the server. Please check your connection.');
    } finally {
        button.textContent = 'SEND OTP';
        button.disabled = false;
    }
});

// Form for resetting password
resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const identifier = document.getElementById('identifier-reset').value;
    const otp = document.getElementById('otp').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    const button = resetForm.querySelector('.submit-btn');
    button.textContent = 'Resetting...';
    button.disabled = true;

    // Client-side validation to check if passwords match
    if (newPassword !== confirmNewPassword) {
        showMessage('Error', 'New password and confirm new password do not match.');
        button.textContent = 'CONFIRM';
        button.disabled = false;
        return;
    }

    try {
        const response = await fetch('/resetPassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, otp, newPassword, confirmNewPassword })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Success!', 'Your password has been reset successfully. You can now log in with your new password.');
            document.getElementById("close-message").addEventListener("click", () => {
                location.reload(); // or redirect to login/profile
            }, { once: true });
        } else {
            showMessage('Error', result.message || 'Failed to reset password. Please check your OTP and try again.');
        }
    } catch (error) {
        console.error('Network error:', error);
        showMessage('Network Error', 'Could not connect to the server. Please try again later.');
    } finally {
        button.textContent = 'CONFIRM';
        button.disabled = false;
    }
});