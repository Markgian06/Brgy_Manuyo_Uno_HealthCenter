let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let selectedTime = null;
let userIsVerified = false; // Track user verification status

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
];

let unavailableSlots = {};

// Check user verification status on page load
document.addEventListener('DOMContentLoaded', async function() {
    await checkUserVerificationStatus();
    
    const prevBtn = document.getElementById('prevMonth');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar(currentMonth, currentYear);
        });
    }

    const nextBtn = document.getElementById('nextMonth');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generateCalendar(currentMonth, currentYear);
        });
    }
    
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitAppointment();
        });
    }
    generateCalendar(currentMonth, currentYear);
});

// Function to check user verification status
async function checkUserVerificationStatus() {
    try {
        const response = await fetch('/profile', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                userIsVerified = data.data.isAccountVerified || false;
                
                // If not verified, show warning message and disable form
                if (!userIsVerified) {
                    displayVerificationWarning();
                    disableAppointmentForm();
                }
            }
        }
    } catch (error) {
        console.error('Error checking verification status:', error);
    }
}

// Function to display verification warning
function displayVerificationWarning() {
    const formContainer = document.querySelector('.appointment-form-container') || document.querySelector('form').parentElement;
    
    if (formContainer) {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'verificationWarning';
        warningDiv.innerHTML = `
            <div style="background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 20px;">⚠️</span>
                    <strong style="font-size: 18px;">Account Verification Required</strong>
                </div>
                <p style="margin: 8px 0; font-size: 16px;">
                    You need to verify your account before booking an appointment.
                </p>
                <a href="/frontend/patient/html/accVerification.html" 
                   style="display: inline-block; background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">
                    📧 Verify Account Now
                </a>
            </div>
        `;
        
        formContainer.insertBefore(warningDiv, formContainer.firstChild);
    }
}

// Function to disable the appointment form
function disableAppointmentForm() {
    const form = document.querySelector('#appointmentForm');
    if (form) {
        // Disable all form inputs
        const inputs = form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            input.disabled = true;
            input.style.opacity = '0.5';
            input.style.cursor = 'not-allowed';
        });
        
        // Add overlay to form
        form.style.position = 'relative';
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.7);
            z-index: 10;
            cursor: not-allowed;
        `;
        form.appendChild(overlay);
    }
    
    // Disable calendar interactions
    const calendar = document.getElementById('calendar');
    if (calendar) {
        calendar.style.opacity = '0.5';
        calendar.style.pointerEvents = 'none';
    }
    
    // Disable time slots
    const timeSlots = document.getElementById('timeSlots');
    if (timeSlots) {
        timeSlots.style.opacity = '0.5';
        timeSlots.style.pointerEvents = 'none';
    }
}

function generateCalendar(month, year) {
  const calendar = document.getElementById('calendar');
  const calendarTitle = document.getElementById('calendarTitle');
  if (!calendar || !calendarTitle) return;

  calendar.innerHTML = '';
  calendarTitle.textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.textContent = day;
    dayHeader.className = "calendar-header";
    calendar.appendChild(dayHeader);
  });

  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day disabled';
    calendar.appendChild(emptyDay);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;

    const currentDate = new Date(year, month, day);
    currentDate.setHours(0, 0, 0, 0);
    const dayOfWeek = currentDate.getDay();

    if (currentDate < today || dayOfWeek === 0 || dayOfWeek === 6) {
      dayElement.classList.add('disabled');
    } else if (userIsVerified) { // Only allow selection if verified
      dayElement.addEventListener('click', () => selectDate(day, month, year, dayElement));
    }

    calendar.appendChild(dayElement);
  }
}

function selectDate(day, month, year, element) {
  // Check verification status before allowing selection
  if (!userIsVerified) {
    showAlert("Please verify your account before booking an appointment.", "error");
    return;
  }

  document.querySelectorAll('.calendar-day.selected').forEach(el => {
    el.classList.remove('selected');
    const checkmark = el.querySelector('.checkmark');
    if (checkmark) checkmark.remove();
  });

  element.classList.add('selected');
  const checkmark = document.createElement('span');
  checkmark.className = 'checkmark';
  checkmark.textContent = '';
  element.appendChild(checkmark);

  selectedDate = new Date(year, month, day);
  document.getElementById('selectedDate').value = selectedDate.toISOString().split('T')[0];

  generateTimeSlots();
}

async function generateTimeSlots() {
  const container = document.getElementById('timeSlots');
  if (!container || !selectedDate) return;

  // Check verification status before generating time slots
  if (!userIsVerified) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #dc2626;">
        <p>Please verify your account to view available time slots.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  const dateString = selectedDate.toISOString().split('T')[0];
  const existingAppointments = await fetchExistingAppointments(dateString);
  const bookedTimes = existingAppointments.map(a => convertTo12Hour(a.selectedTime));

  const manualUnavailable = unavailableSlots[dateString] || [];
  const allUnavailable = [...new Set([...manualUnavailable, ...bookedTimes])];

  timeSlots.forEach(time => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.textContent = time;

    if (allUnavailable.includes(time)) {
      slot.classList.add('unavailable');
      slot.textContent += " (Booked)";
    } else {
      slot.addEventListener('click', () => selectTime(time, slot));
    }

    container.appendChild(slot);
  });
}

function selectTime(time, element) {
  // Check verification status before allowing selection
  if (!userIsVerified) {
    showAlert("Please verify your account before selecting a time slot.", "error");
    return;
  }

  document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');

  selectedTime = time;
  document.getElementById('selectedTime').value = time;
}

function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
        hours = '00';
    }
    
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

async function fetchExistingAppointments(dateString, timeString) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/appointments/${encodeURIComponent(dateString)}/${encodeURIComponent(timeString)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            return data.appointments || [];
        } else {
            console.error('Failed to fetch appointments:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
}

function convertTo12Hour(time24) {
    try {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
        console.error('Error converting time:', error);
        return time24;
    }
}

async function submitAppointment() {
    // First check if user is verified
    if (!userIsVerified) {
        showAlert("You must verify your account before booking an appointment. Please check your email and verify your account.", "error");
        return;
    }

    try {   
        const firstName = document.getElementById('firstName')?.value;
        const lastName = document.getElementById('lastName')?.value;
        const middleName = document.getElementById('middleName')?.value;
        const gender = document.getElementById('gender')?.value;
        const email = document.getElementById('email')?.value;
        const contactNumber = document.getElementById('contactNumber')?.value;
        const reason = document.getElementById('reason')?.value;
        const selectedDate = document.getElementById('selectedDate')?.value;
        const selectedTime = document.getElementById('selectedTime')?.value;

        if (!firstName || firstName.length < 2) {
            showAlert("First name is required", "error", "firstNameAlert");
            return;
        } 

        if (!lastName || lastName.length < 2) {
            showAlert("Last name is required", "error", "lastNameAlert");
            return; 
        }

        if (!gender){
            showAlert("Please select your gender", "error","genderAlert");
            return;
        }  

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showAlert("Please enter a valid email address", "error", "emailAlert");
            return; 
        }

        const contactRegex = /^[0-9]{11}$/; 
        if (!contactNumber || !contactRegex.test(contactNumber)) {
            showAlert("Please enter a valid 11-digit contact number", "error", "contactNumberAlert");
            return; 
        }

        if (!reason){
            showAlert("Reason for appointment is required", "error", "reasonAlert");
            return; 
        } 
        if (!selectedDate){
            showAlert("Please select a date", "error","calendarAlert");
            return; 
        }

        if (!selectedTime) {
            showAlert("Please select a time", "error", "timeSlotsAlert");
            return;
        }

        if (typeof convertTo24Hour !== 'function') {
            showAlert('Error: convertTo24Hour function is not defined.',"error");
            return;
        }
    
        const formData = {
            firstName,
            lastName,
            middleName,
            gender,
            email,
            contactNumber,
            reason,
            selectedDate,  
            selectedTime: convertTo24Hour(selectedTime), 
            appointmentNumber: 'APP' + Date.now()
        };

        const response = await fetch('http://localhost:5000/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();

        if (data.success) {
            showAlert('Appointment booked successfully!',"success");
            document.querySelector('form')?.reset();
            document.getElementById('selectedDate').value = '';
            document.getElementById('selectedTime').value = '';

            document.querySelectorAll('.calendar-day.selected').forEach(el => {
                el.classList.remove('selected');
                el.style.background = 'white';
                el.style.color = '#333';
                const checkmark = el.querySelector('.checkmark');
                if (checkmark) checkmark.remove();
            });

            document.querySelectorAll('.time-slot.selected').forEach(el => {
                el.classList.remove('selected');
                el.style.background = 'white';
                el.style.color = '#333';
                el.style.borderColor = '#e1e5e9';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
            });

            if (selectedDate) {
                generateTimeSlots();
            }

        } else {
            showAlert(data.message,"error");
        }
        
    } catch (error) {
        showAlert('Failed to book appointment: ' + error.message, "error");
    } 
}