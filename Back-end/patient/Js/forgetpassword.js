function showMessage(title, message) {
    const msgBox = document.getElementById('message-box');
    document.getElementById('message-title').textContent = title;
    document.getElementById('message-text').textContent = message;
    msgBox.classList.remove('hidden');
}

document.getElementById('close-message').addEventListener('click', function() {
    document.getElementById('message-box').classList.add('hidden');
});

const otpForm = document.getElementById('otp-form');
const resetForm = document.getElementById('reset-form');

otpForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email-otp').value;
    const button = otpForm.querySelector('.submit-btn');
    button.textContent = 'Sending...';
    button.disabled = true;

    try {
        const response = await fetch('/sendResetOtp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('OTP Sent!', 'A one-time password has been sent to your email. Please enter it below to reset your password.');
            
            otpForm.classList.add('hidden');
            resetForm.classList.remove('hidden');
            document.getElementById('email-reset').value = email; 
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

resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email-reset').value;
    const newPassword = document.getElementById('newPassword').value;
    const otp = document.getElementById('otp').value;

    const button = resetForm.querySelector('.submit-btn');
    button.textContent = 'Resetting...';
    button.disabled = true;

    try {
        const response = await fetch('/resetPassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword, otp })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Success!', 'Your password has been reset successfully. You can now log in with your new password.');
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