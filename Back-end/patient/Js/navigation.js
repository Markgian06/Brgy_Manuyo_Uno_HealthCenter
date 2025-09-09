 document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          
          if (href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
              e.preventDefault();
              targetElement.scrollIntoView({ behavior: 'smooth' });
              
              document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
              this.classList.add('active');
            }
          }
          else if (href.endsWith('.html')) {
            console.log('Navigating to:', href);
          }
        });
      });

      const hamburger = document.getElementById('hamburger');
      const navMenu = document.getElementById('navMenu');

      hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
      });

      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          hamburger.classList.remove('active');
        });
      });

      document.addEventListener("DOMContentLoaded", async () => {
        try {
          const res = await fetch("/check-auth", {
            credentials: "include" // make sure cookies are sent
          });
          const data = await res.json();
      
          if (data.loggedIn) {
            // Change Login → Profile
            const authLink = document.getElementById("authLink");
            authLink.innerHTML = `<a href="/frontend/patient/html/profile.html" class="nav-link">Profile</a>`;
      
            // Change Schedule → Appointment
            const scheduleItem = document.getElementById("scheduleOrAppointment");
            scheduleItem.innerHTML = `<a href="/frontend/patient/html/appointment.html" class="nav-link">Appointment</a>`;
          }
        } catch (err) {
          console.error("Auth check failed:", err);
        }
      });