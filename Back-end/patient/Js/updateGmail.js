document.addEventListener("DOMContentLoaded", () => {
    const gmailForm = document.getElementById("gmail-form");
    const otpForm = document.getElementById("otp-form");
  
    // Step 1: Send OTP to new email
    gmailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newEmail = document.getElementById("newGmail").value; // still your input field
  
      const res = await fetch("/sendUpdateGmailOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newEmail }), // match backend
      });
  
      const data = await res.json();
      alert(data.message);
  
      if (data.success) {
        gmailForm.classList.add("hidden");
        otpForm.classList.remove("hidden");
      }
    });
  
    // Step 2: Verify OTP
    otpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const otp = document.getElementById("otp").value;
  
      const res = await fetch("/updateGmailsendUpdateGmailOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp }),
      });
  
      const data = await res.json();
      alert(data.message);
  
      if (data.success) {
        window.location.href = "/frontend/patient/html/profile.html";
      }
    });
  });