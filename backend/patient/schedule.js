  class Calendar {
            constructor() {
                this.currentDate = new Date();
                this.selectedDate = null;
                this.selectedTimeSlot = null;
                
                this.monthNames = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];
                
                this.timeSlots = [
                    { time: '8:00 AM', available: true },
                    { time: '9:00 AM', available: true },
                    { time: '10:00 AM', available: true },
                    { time: '11:00 AM', available: true },
                    { time: '12:00 PM', available: false, isBreak: true },
                    { time: '1:00 PM', available: true },
                    { time: '2:00 PM', available: true },
                    { time: '3:00 PM', available: true },
                    { time: '4:00 PM', available: true },
                    { time: '5:00 PM', available: true }
                ];
                
                this.init();
            }
            
            init() {
                this.renderCalendar();
                this.bindEvents();
            }
            
            bindEvents() {
                document.getElementById('prevBtn').addEventListener('click', () => this.prevMonth());
                document.getElementById('nextBtn').addEventListener('click', () => this.nextMonth());
                document.getElementById('exitBtn').addEventListener('click', () => this.hideTimeSlots());
                
                document.getElementById('daysGrid').addEventListener('click', (e) => {
                    if (e.target.classList.contains('day') && 
                        !e.target.classList.contains('other-month') && 
                        !e.target.classList.contains('previous')) {
                        this.selectDate(e.target);
                    }
                });
                
                document.getElementById('timeSlots').addEventListener('click', (e) => {
                    const timeSlot = e.target.closest('.time-slot');
                    if (timeSlot && !timeSlot.classList.contains('break')) {
                        this.selectTimeSlot(timeSlot);
                    }
                });
            }
            
            renderCalendar() {
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                
                document.getElementById('monthYear').textContent = 
                    `${this.monthNames[month]} ${year}`;
                
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const daysInPrevMonth = new Date(year, month, 0).getDate();
                
                const daysGrid = document.getElementById('daysGrid');
                daysGrid.innerHTML = '';
                
                const today = new Date();
                const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
                const todayDate = today.getDate();
                
                for (let i = firstDay - 1; i >= 0; i--) {
                    const day = document.createElement('div');
                    day.className = 'day other-month';
                    day.textContent = daysInPrevMonth - i;
                    daysGrid.appendChild(day);
                }
                
                for (let day = 1; day <= daysInMonth; day++) {
                    const dayElement = document.createElement('div');
                    dayElement.className = 'day';
                    dayElement.textContent = day;

                    
                    
                    if (isCurrentMonth && day === todayDate) {
                        dayElement.classList.add('today');
                    }
                    
                    if (isCurrentMonth && day < todayDate) {
                        dayElement.classList.add('previous');
                    }
                    
                     const checkDay = new Date(year, month, day).getDay();
                     if (checkDay === 0 || checkDay === 6) {
                     dayElement.classList.add('disabled');
                     }
                    
                    if (this.selectedDate && 
                        this.selectedDate.getFullYear() === year &&
                        this.selectedDate.getMonth() === month &&
                        this.selectedDate.getDate() === day) {
                        dayElement.classList.add('selected');
                    }
                    
                    daysGrid.appendChild(dayElement);
                }
                
                const totalCells = daysGrid.children.length;
                const remainingCells = 42 - totalCells; 
                for (let day = 1; day <= remainingCells; day++) {
                    const dayElement = document.createElement('div');
                    dayElement.className = 'day other-month';
                    dayElement.textContent = day;
                    daysGrid.appendChild(dayElement);
                }
            }
            
            prevMonth() {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            }
            
            nextMonth() {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            }
            
            selectDate(dayElement) {
                document.querySelectorAll('.day.selected').forEach(day => {
                    day.classList.remove('selected');
                });
                
                dayElement.classList.add('selected');
                
                const day = parseInt(dayElement.textContent);
                this.selectedDate = new Date(
                    this.currentDate.getFullYear(),
                    this.currentDate.getMonth(),
                    day
                );
                
                this.showTimeSlots();
            }
            
            showTimeSlots() {
                const container = document.getElementById('timeSlotsContainer');
                const selectedDateElement = document.getElementById('selectedDate');
                                
                const options = { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                };
                selectedDateElement.textContent = this.selectedDate.toLocaleDateString('en-US', options);
                
                this.renderTimeSlots();
                
                container.classList.add('show');
            }
            
            hideTimeSlots() {
                const container = document.getElementById('timeSlotsContainer');
                
                container.classList.remove('show');
                
                document.querySelectorAll('.day.selected').forEach(day => {
                    day.classList.remove('selected');
                });
                
                this.selectedDate = null;
                this.selectedTimeSlot = null;
            }
            
            renderTimeSlots() {
                const timeSlotsContainer = document.getElementById('timeSlots');
                timeSlotsContainer.innerHTML = '';
                
                this.timeSlots.forEach((slot, index) => {
                    const timeSlotElement = document.createElement('div');
                    timeSlotElement.className = 'time-slot';
                    
                    if (slot.isBreak) {
                        timeSlotElement.classList.add('break');
                    }
                    
                    timeSlotElement.innerHTML = `
                        <div class="time-text">${slot.time}</div>
                        <div class="status ${slot.isBreak ? 'break' : ''}">${slot.isBreak ? 'Break' : 'Open'}</div>
                    `;
                    
                    timeSlotElement.setAttribute('data-index', index);
                    timeSlotsContainer.appendChild(timeSlotElement);
                });
            }
            
            selectTimeSlot(timeSlotElement) {
                document.querySelectorAll('.time-slot.selected').forEach(slot => {
                    slot.classList.remove('selected');
                });
                
                timeSlotElement.classList.add('selected');
                
                const index = parseInt(timeSlotElement.getAttribute('data-index'));
                this.selectedTimeSlot = this.timeSlots[index];
                
                console.log('Selected:', this.selectedDate, this.selectedTimeSlot.time);
            }
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            new Calendar();
        });