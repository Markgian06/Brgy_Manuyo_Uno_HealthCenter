document.addEventListener("DOMContentLoaded", () => {
  const gmailForm = document.getElementById("gmail-form");
  const otpForm = document.getElementById("otp-form");
  let pendingEmail = "";
  let currentUserId = ""; // Store the userId

  // You need to get the userId somehow - from localStorage, sessionStorage, or an API call
  // For example:
  currentUserId = localStorage.getItem('userId'); // Adjust this based on how you store user info
  
  // If you don't have userId stored, you might need to get it from an API call
  // or pass it from the previous page

  gmailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newEmail = document.getElementById("newGmail").value;
    pendingEmail = newEmail;

    const res = await fetch("/sendUpdateGmailOtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ 
          newEmail,
          userId: currentUserId // Send userId if your sendUpdateGmailOtp needs it
      }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      gmailForm.classList.add("hidden");
      otpForm.classList.remove("hidden");
    }
  });

  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otp").value;

    const res = await fetch("/updateGmail", { // Make sure this matches your route
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        otp,
        newEmail: pendingEmail,
        userId: currentUserId // Send the userId
      }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      window.location.href = "/frontend/patient/html/profile.html";
    }
  });
});