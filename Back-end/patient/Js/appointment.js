let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let selectedTime = null;

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
        dayHeader.style.cssText = `
            background: #f8f9fa;
            font-weight: bold;
            color: #666;
            padding: 12px;
            text-align: center;
            font-size: 14px;
            border-bottom: 1px solid #e1e5e9;
        `;
        calendar.appendChild(dayHeader);
    });
    
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day disabled';
        emptyDay.style.cssText = `
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            color: #ccc;
            cursor: not-allowed;
        `;
        calendar.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);
        
        dayElement.style.cssText = `
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            position: relative;
            border: 1px solid #f0f0f0;
        `;
        
        if (currentDate < today || currentDate.getDay() === 0) {
            dayElement.className += ' disabled';
            dayElement.style.cssText += `
                background: #f8f9fa;
                color: #ccc;
                cursor: not-allowed;
            `;
        } else {
            dayElement.addEventListener('click', () => selectDate(day, month, year, dayElement));
            
            dayElement.addEventListener('mouseenter', () => {
                if (!dayElement.classList.contains('selected')) {
                    dayElement.style.background = '#e8f5e8';
                    dayElement.style.transform = 'scale(1.05)';
                }
            });
            
            dayElement.addEventListener('mouseleave', () => {
                if (!dayElement.classList.contains('selected')) {
                    dayElement.style.background = 'white';
                    dayElement.style.transform = 'scale(1)';
                }
            });
        }
        
        calendar.appendChild(dayElement);
    }
}

function selectDate(day, month, year, element) {
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
        el.style.background = 'white';
        el.style.color = '#333';
        const checkmark = el.querySelector('.checkmark');
        if (checkmark) checkmark.remove();
    });
    
    element.classList.add('selected');
    element.style.cssText += `
        background: #4CAF50 !important;
        color: white !important;
        font-weight: bold;
        transform: scale(1.1);
    `;
    
    if (!element.querySelector('.checkmark')) {
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        checkmark.textContent = '✓';
        checkmark.style.cssText = `
            position: absolute;
            top: 2px;
            right: 2px;
            font-size: 10px;
        `;
        element.appendChild(checkmark);
    }
    
    selectedDate = new Date(year, month, day);
    document.getElementById('selectedDate').value = selectedDate.toISOString().split('T')[0];
    
    const dateAlert = document.querySelector('#selectedDate').parentNode.querySelector('#showAlert');
    if (dateAlert) {
        dateAlert.textContent = '';
        dateAlert.style.display = 'none';
    }
    
    generateTimeSlots();
}

function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    if (!timeSlotsContainer || !selectedDate) return;
    
    timeSlotsContainer.innerHTML = '';
    
    const dateString = selectedDate.toISOString().split('T')[0];
    const unavailable = unavailableSlots[dateString] || [];
    
    timeSlots.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = time;
        
        timeSlot.style.cssText = `
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;
            font-weight: 500;
            position: relative;
            margin: 5px;
        `;
        
        if (unavailable.includes(time)) {
            timeSlot.className += ' unavailable';
            timeSlot.style.cssText += `
                background: #f8f9fa;
                color: #999;
                cursor: not-allowed;
                text-decoration: line-through;
            `;
            
            const indicator = document.createElement('span');
            indicator.textContent = '✕';
            indicator.style.cssText = `
                position: absolute;
                top: 2px;
                right: 5px;
                color: #e74c3c;
                font-size: 12px;
            `;
            timeSlot.appendChild(indicator);
            
        } else {
            const indicator = document.createElement('span');
            indicator.textContent = '●';
            indicator.style.cssText = `
                position: absolute;
                top: 2px;
                right: 5px;
                color: #4CAF50;
                font-size: 12px;
            `;
            timeSlot.appendChild(indicator);
            
            timeSlot.addEventListener('click', () => selectTime(time, timeSlot));
            
            timeSlot.addEventListener('mouseenter', () => {
                if (!timeSlot.classList.contains('selected')) {
                    timeSlot.style.borderColor = '#4CAF50';
                    timeSlot.style.transform = 'translateY(-2px)';
                    timeSlot.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.2)';
                }
            });
            
            timeSlot.addEventListener('mouseleave', () => {
                if (!timeSlot.classList.contains('selected')) {
                    timeSlot.style.borderColor = '#e1e5e9';
                    timeSlot.style.transform = 'translateY(0)';
                    timeSlot.style.boxShadow = 'none';
                }
            });
        }
        
        timeSlotsContainer.appendChild(timeSlot);
    });
}

function selectTime(time, element) {
    document.querySelectorAll('.time-slot.selected').forEach(el => {
        el.classList.remove('selected');
        el.style.background = 'white';
        el.style.color = '#333';
        el.style.borderColor = '#e1e5e9';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
    });

    element.classList.add('selected');
    element.style.cssText += `
        background: #4CAF50 !important;
        color: white !important;
        border-color: #4CAF50 !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    `;
    
    selectedTime = time;
    
    const timeAlert = document.querySelector('#timeSlots').parentNode.querySelector('#showAlert');
    if (timeAlert) {
        timeAlert.textContent = '';
        timeAlert.style.display = 'none';
    }
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

document.addEventListener('DOMContentLoaded', function() {
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


















async function submitAppointment() {
    
    try {
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.textContent = 'Waiting For Admin Response...';
        submitBtn.disabled = true;
        
        const firstName = document.getElementById('firstName')?.value || '';
        const lastName = document.getElementById('lastName')?.value || '';
        const middleName = document.getElementById('middleName')?.value || '';
        const gender = document.getElementById('gender')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const contactNumber = document.getElementById('contactNumber')?.value || '';
        const reason = document.getElementById('reason')?.value || '';
        const selectedDate = document.getElementById('selectedDate')?.value || '';
        const selectedTime = document.getElementById('selectedTime')?.value || '';
        
        
        if (!firstName) {
           showAlert("First name is required", "error");
           return
        } 

        if (!lastName){
            showAlert("Last name is required", "error");
            return 
        }

        if (!gender){
            showAlert("Please select your gender", "error");
            return
        }  

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showAlert("Please enter a valid email address", "error");
            return 
        }

        const contactRegex = /^[0-9]{11}$/; 
        if (!contactNumber || !contactRegex.test(contactNumber)) {
            showAlert("Please enter a valid 11-digit contact number", "error");
            return 
        }

        if (!reason){
            showAlert("Reason for appointment is required", "error");
            return 
        } 
        if (!selectedDate){
            showAlert("Please select a date", "error");
            return 
        }

        if (!selectedTime) {
            showAlert("Please select a time", "error");
         return;
         }


        if (typeof selectedDate === 'undefined') {
            showAlert('Error: selectedDate is not defined. Please select a date first.', "error");
            return;
        }
        
        if (typeof selectedTime === 'undefined') {
            showAlert('Error: selectedTime is not defined. Please select a time first.', "error");
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
        } else {
            showAlert('Error: ' + data.message,"error");
        }
        
    } catch (error) {
        showAlert('Failed to book appointment: ' + error.message, "error");
    } 
}
