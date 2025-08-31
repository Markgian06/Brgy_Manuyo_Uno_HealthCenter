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

// Simulated unavailable time slots (you can modify this based on your backend data)
const unavailableSlots = {
    '2025-09-01': ['9:00 AM', '2:00 PM', '3:30 PM'],
    '2025-09-02': ['10:00 AM', '11:30 AM'],
    '2025-09-03': ['8:30 AM', '1:00 PM', '4:00 PM'],
    '2025-09-05': ['9:30 AM', '11:00 AM', '2:30 PM'],
    '2025-09-10': ['8:00 AM', '1:30 PM', '4:30 PM']
};

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

// Select Time Function
function selectTime(time, element) {

    document.querySelectorAll('.time-slot.selected').forEach(el => {
        el.classList.remove('selected');
        el.style.background = 'white';
        el.style.color = '#333';
        el.style.borderColor = '#e1e5e9';
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
    
    console.log('Selected Time:', selectedTime);
    console.log('Full Appointment:', selectedDate.toDateString(), 'at', selectedTime);
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
    

    generateCalendar(currentMonth, currentYear);
});

function validateDateSelection() {
    if (!selectedDate) {
        const dateAlert = document.querySelector('#selectedDate').parentNode.querySelector('#showAlert');
        if (dateAlert) {
            dateAlert.textContent = 'Please select an appointment date';
            dateAlert.style.color = '#e74c3c';
            dateAlert.style.display = 'block';
        }
        return false;
    }
    return true;
}

function validateTimeSelection() {
    if (!selectedTime) {
        const timeAlert = document.querySelector('#timeSlots').parentNode.querySelector('#showAlert');
        if (timeAlert) {
            timeAlert.textContent = 'Please select an appointment time';
            timeAlert.style.color = '#e74c3c';
            timeAlert.style.display = 'block';
        }
        return false;
    }
    return true;
}

function getSelectedAppointment() {
    return {
        date: selectedDate,
        time: selectedTime,
        dateString: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
        formattedDate: selectedDate ? selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : null
    };
}

function resetSelections() {
    selectedDate = null;
    selectedTime = null;
    
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
        el.style.background = 'white';
        el.style.color = '#333';
        el.style.transform = 'scale(1)';
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
    
    document.getElementById('timeSlots').innerHTML = '';
    document.getElementById('selectedDate').value = '';
}

// Example usage in form validation
function validateAppointmentForm() {
    let isValid = true;
    
    if (!validateDateSelection()) {
        isValid = false;
    }
    
    if (!validateTimeSelection()) {
        isValid = false;
    }
    
    if (isValid) {
        const appointment = getSelectedAppointment();
        console.log('Valid appointment:', appointment);
    }
    
    return isValid;
}