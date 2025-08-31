  const isLoggedIn = false; // Change to false to simulate logged-out state

  window.addEventListener("DOMContentLoaded", () => {
    const scheduleOrAppointment = document.getElementById("scheduleOrAppointment");
    const authLink = document.getElementById("authLink");

     if (isLoggedIn) {
        scheduleOrAppointment.innerHTML = `<a href="frontend/patient/html/appoinment.html" class="nav-link">Appointment</a>`;
        authLink.innerHTML = `<a href="frontend/patient/html/profile.html" class="nav-link">Profile</a>`;
      } else {
        scheduleOrAppointment.innerHTML = `<a href="/frontend/patient/html/schedule.html" class="nav-link">Schedule</a>`;
        authLink.innerHTML = `<a href="frontend/patient/html/login.html" class="nav-link">Login</a>`;
      }
    });