// Enhanced Profile.js with Dynamic Appointment History and CRUD Operations
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const patientName = document.getElementById('patientName');
    const patientId = document.getElementById('patientId');
    const patientAge = document.getElementById('patientAge');
    const patientGender = document.getElementById('patientGender');
    const emailPhoneInput = document.getElementById('email_phone');
    const passwordInput = document.getElementById('password');
    const updateEmailPhoneBtn = document.getElementById('updateEmailPhone');
    const updatePasswordBtn = document.getElementById('updatePassword');
    const requestRecordBtn = document.getElementById('requestRecordBtn');

    // Verification UI
    const verificationStatusDiv = document.getElementById('verificationStatus');
    const verifyAccountBtn = document.getElementById('verifyAccountBtn');

    // Appointment History Elements
    const appointmentHistoryList = document.querySelector('.record-list ul');

    // Store user verification status
    let userIsVerified = false;

    // Time slots for appointment updates
    const timeSlots = [
        '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
        '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
    ];

    // Lock email & password fields
    if (emailPhoneInput) {
        emailPhoneInput.readOnly = true;
        emailPhoneInput.style.backgroundColor = '#f3f4f6';
        emailPhoneInput.style.cursor = 'not-allowed';
    }
    if (passwordInput) {
        passwordInput.readOnly = true;
        passwordInput.style.backgroundColor = '#f3f4f6';
        passwordInput.style.cursor = 'not-allowed';
        passwordInput.placeholder = '••••••••••';
    }

    // Event listeners for update buttons
    if (updateEmailPhoneBtn) {
        updateEmailPhoneBtn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.setItem('updateType', 'email');
            window.location.href = '/frontend/patient/html/updateGmail.html';
        });
    }
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.setItem('updateType', 'password');
            window.location.href = '/frontend/patient/html/forgetpassword.html';
        });
    }

    // Verify account navigation
    if (verifyAccountBtn) {
        verifyAccountBtn.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = '/frontend/patient/html/accVerification.html';
        });
    }

    // Load profile first, then appointment history based on verification status
    loadProfile();

    async function loadProfile() {
        try {
            // Rely only on cookie for authentication
            const response = await fetch('/profile', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Store verification status
                userIsVerified = data.data.isAccountVerified || false;

                // Populate profile fields
                if (patientName) patientName.textContent = data.data.fullName || 'N/A';
                if (patientId) patientId.textContent = data.data.patientID || 'N/A';
                if (patientAge) patientAge.textContent = data.data.age || 'N/A';
                if (patientGender) patientGender.textContent = data.data.gender || 'N/A';

                if (emailPhoneInput) {
                    emailPhoneInput.value = data.data.email || data.data.contactNum || 'Not provided';

                    if (data.data.isAccountVerified) {
                        patientName.innerHTML += ` 
                            <span style="color:#1DA1F2; font-size:16px; margin-left:6px;" title="Verified">
                                ☑️
                            </span>`;
                    }
                }

                // Update verification status
                updateVerificationStatus(data.data.isAccountVerified);
                
                // Load appointment history based on verification status
                if (userIsVerified) {
                    loadAppointmentHistory();
                } else {
                    displayVerificationRequiredMessage();
                }
            } else {
                showError('Failed to load profile: ' + data.message);
            }
        } catch (err) {
            console.error('Profile load error:', err);
            showError('Session expired. Please log in again.');
            setTimeout(() => {
                window.location.href = '/frontend/patient/html/login.html';
            }, 2000);
        }
    }

    function displayVerificationRequiredMessage() {
        if (appointmentHistoryList) {
            appointmentHistoryList.innerHTML = `
                <li class="record-item verification-required">
                    <p style="font-weight: 500; color: #dc2626; text-align: center; font-style: italic;">
                        Please verify account to make an appointment
                    </p>
                    <p style="font-size: 0.875rem; color: #6b7280; text-align: center; margin-top: 8px;">
                        <a href="/frontend/patient/html/accVerification.html" 
                           style="color: #2563eb; text-decoration: none;">
                            Verify your account here
                        </a>
                    </p>
                </li>
            `;
        }
    }

    async function loadAppointmentHistory() {
        try {
            showAppointmentLoading();

            // Fetch appointments for the current user
            const response = await fetch('/api/patient/appointments', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success && data.appointments) {
                displayAppointmentHistory(data.appointments);
            } else {
                displayNoAppointments(data.message || 'No appointments found');
            }
        } catch (err) {
            console.error('Appointment history load error:', err);
            displayAppointmentError('Failed to load appointment history');
        }
    }

    function showAppointmentLoading() {
        if (appointmentHistoryList) {
            appointmentHistoryList.innerHTML = `
                <li class="record-item loading">
                    <p style="font-weight: 500; color: #6b7280; text-align: center;">
                        Loading appointment history...
                    </p>
                </li>
            `;
        }
    }

    function displayAppointmentHistory(appointments) {
        if (!appointmentHistoryList) return;

        if (appointments.length === 0) {
            displayNoAppointments('No appointments scheduled yet');
            return;
        }

        // Sort appointments by date (most recent first)
        const sortedAppointments = appointments.sort((a, b) => {
            const dateA = new Date(a.selectedDate + ' ' + a.selectedTime);
            const dateB = new Date(b.selectedDate + ' ' + b.selectedTime);
            return dateB - dateA;
        });

        // Generate HTML for appointments with CRUD options
        const appointmentHTML = sortedAppointments.map(appointment => {
            const appointmentDate = formatAppointmentDate(appointment.selectedDate);
            const appointmentTime = formatAppointmentTime(appointment.selectedTime);
            const status = getAppointmentStatus(appointment);
            const statusColor = getStatusColor(status);
            const canEdit = canEditAppointment(appointment);
            const canDelete = canDeleteAppointment(appointment);

            return `
                <li class="record-item" data-appointment-id="${appointment._id}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <p style="font-weight: 500; color: #4b5563; margin: 0;">
                            ${appointmentDate} - ${appointment.reason || 'General Consultation'}
                        </p>
                        <span style="background: ${statusColor.bg}; color: ${statusColor.text}; 
                                   padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; 
                                   font-weight: 500; white-space: nowrap;">
                            ${status}
                        </span>
                    </div>
                    <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">
                        ${appointmentTime} • Appointment #${appointment.appointmentNumber || 'N/A'}
                    </p>
                    ${appointment.doctorName ? 
                        `<p style="font-size: 0.875rem; color: #6b7280; margin: 4px 0 0 0;">
                            ${appointment.doctorName}
                         </p>` : ''
                    }
                    <div class="appointment-actions" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                        ${canEdit ? `
                            <button class="edit-appointment-btn" 
                                    onclick="openEditModal('${appointment._id}', '${appointment.selectedDate}', '${appointment.selectedTime}', '${appointment.reason}')"
                                    style="background: #3b82f6; color: white; border: none; padding: 6px 12px; 
                                           border-radius: 4px; font-size: 0.75rem; cursor: pointer;">
                                Edit
                            </button>
                        ` : ''}
                        ${canDelete ? `
                            <button class="delete-appointment-btn" 
                                    onclick="deleteAppointment('${appointment._id}')"
                                    style="background: #ef4444; color: white; border: none; padding: 6px 12px; 
                                           border-radius: 4px; font-size: 0.75rem; cursor: pointer;">
                                Cancel Appointment
                            </button>
                        ` : ''}
                        <button class="view-appointment-btn" 
                                onclick="viewAppointmentDetails('${appointment._id}')"
                                style="background: #6b7280; color: white; border: none; padding: 6px 12px; 
                                       border-radius: 4px; font-size: 0.75rem; cursor: pointer;">
                            View Details
                        </button>
                    </div>
                </li>
            `;
        }).join('');

        appointmentHistoryList.innerHTML = appointmentHTML;
    }

    function canEditAppointment(appointment) {
        const now = new Date();
        const status = (appointment.status || 'PENDING').toUpperCase();
    
        try {
            // Get only the YYYY-MM-DD from ISO date
            const datePart = appointment.selectedDate.split("T")[0]; // e.g. "2025-09-24"
    
            // Combine into valid ISO datetime (24-hour time expected here)
            const appointmentDateTime = new Date(`${datePart}T${appointment.selectedTime}:00`);
    
            console.log("Selected:", appointment.selectedDate, appointment.selectedTime);
            console.log("Parsed DateTime:", appointmentDateTime);
    
            return appointmentDateTime > now && !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(status);
        } catch (err) {
            console.error("Date parse error:", err);
            return false;
        }
    }

    function canDeleteAppointment(appointment) {
        const status = appointment.status || 'PENDING';
        
        // Can delete if not completed
        return !['COMPLETED'].includes(status.toUpperCase());
    }

    // CRUD Operations

    // Edit Appointment Modal
    window.openEditModal = function(appointmentId, currentDate, currentTime, currentReason) {
        const modal = createEditModal(appointmentId, currentDate, currentTime, currentReason);
        document.body.appendChild(modal);
    };

    function createEditModal(appointmentId, currentDate, currentTime, currentReason) {
        const modal = document.createElement('div');
        modal.id = 'editAppointmentModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
            align-items: center; justify-content: center;
        `;

        const formattedDate = new Date(currentDate).toISOString().split('T')[0];
        const formattedTime = formatTimeTo12Hour(currentTime);

        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; color: #374151;">Edit Appointment</h3>
                
                <form id="editAppointmentForm">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Date:</label>
                        <input type="date" id="editDate" value="${formattedDate}" 
                               style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;"
                               min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Time:</label>
                        <select id="editTime" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                            ${timeSlots.map(time => 
                                `<option value="${time}" ${time === formattedTime ? 'selected' : ''}>${time}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 4px; fonupdatet-weight: 500; color: #374151;">Reason:</label>
                        <textarea id="editReason" rows="3" 
                                  style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; resize: vertical;"
                                  placeholder="Reason for appointment">${currentReason}</textarea>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="closeEditModal()" 
                                style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                            Cancel
                        </button>
                        <button type="submit" 
                                style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                            Update Appointment
                        </button>
                    </div>
                </form>
            </div>
        `;

        const form = modal.querySelector('#editAppointmentForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            updateAppointment(appointmentId);
        });

        return modal;
    }

    window.closeEditModal = function() {
        const modal = document.getElementById('editAppointmentModal');
        if (modal) {
            modal.remove();
        }
    };

    async function updateAppointment(appointmentId) {
        const newDate = document.getElementById('editDate').value;
        const newTime = document.getElementById('editTime').value;
        const newReason = document.getElementById('editReason').value;

        if (!newDate || !newTime || !newReason.trim()) {
            alert('Please fill in all fields');
            return;
        }

        // Check if the selected date is not in the past
        const selectedDate = new Date(newDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert('Cannot select a past date');
            return;
        }

        // Check if the selected date is not a weekend
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            alert('Appointments are only available on weekdays');
            return;
        }

        try {
            const response = await fetch(`/api/patient/appointments/${appointmentId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedDate: newDate,
                    selectedTime: convertTo24Hour(newTime),
                    reason: newReason
                })
            });

            const data = await response.json();

            if (data.success) {
                closeEditModal();
                loadAppointmentHistory(); // Refresh the list
                showAlert('Appointment updated successfully!', 'success');
            } else {
                alert('Failed to update appointment: ' + data.message);
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update appointment. Please try again.');
        }
    }

    // Delete Appointment
    window.deleteAppointment = async function(appointmentId) {
        if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/patient/appointments/${appointmentId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                loadAppointmentHistory(); // Refresh the list
                showAlert('Appointment deleted successfully!', 'success');
            } else {
                alert('Failed to delete appointment: ' + data.message);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete appointment. Please try again.');
        }
    };

    // View Appointment Details
    window.viewAppointmentDetails = async function(appointmentId) {
        try {
            const response = await fetch(`/api/patient/appointments/${appointmentId}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                showAppointmentDetailsModal(data.appointment);
            } else {
                alert('Failed to load appointment details: ' + data.message);
            }
        } catch (error) {
            console.error('View details error:', error);
            alert('Failed to load appointment details. Please try again.');
        }
    };

    function showAppointmentDetailsModal(appointment) {
        const modal = document.createElement('div');
        modal.id = 'appointmentDetailsModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
            align-items: center; justify-content: center;
        `;

        const appointmentDate = formatAppointmentDate(appointment.selectedDate);
        const appointmentTime = formatAppointmentTime(appointment.selectedTime);
        const status = getAppointmentStatus(appointment);

        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; color: #374151;">Appointment Details</h3>
                
                <div style="margin-bottom: 16px;">
                    <strong style="color: #374151;">Appointment Number:</strong> ${appointment.appointmentNumber || 'N/A'}
                </div>
                <div style="margin-bottom: 16px;">
                    <strong style="color: #374151;">Date:</strong> ${appointmentDate}
                </div>
                <div style="margin-bottom: 16px;">
                    <strong style="color: #374151;">Time:</strong> ${appointmentTime}
                </div>
                <div style="margin-bottom: 16px;">
                    <strong style="color: #374151;">Status:</strong> 
                    <span style="background: ${getStatusColor(status).bg}; color: ${getStatusColor(status).text}; 
                               padding: 2px 8px; border-radius: 12px; font-size: 0.875rem; margin-left: 8px;">
                        ${status}
                    </span>
                </div>
                <div style="margin-bottom: 16px;">
                    <strong style="color: #374151;">Reason:</strong> ${appointment.reason || 'N/A'}
                </div>
                ${appointment.doctorName ? `
                    <div style="margin-bottom: 16px;">
                        <strong style="color: #374151;">Doctor:</strong> ${appointment.doctorName}
                    </div>
                ` : ''}
                ${appointment.notes ? `
                    <div style="margin-bottom: 16px;">
                        <strong style="color: #374151;">Notes:</strong> ${appointment.notes}
                    </div>
                ` : ''}
                <div style="margin-bottom: 20px;">
                    <strong style="color: #374151;">Created:</strong> ${new Date(appointment.createdAt).toLocaleString()}
                </div>
                
                <div style="text-align: right;">
                    <button onclick="closeAppointmentDetailsModal()" 
                            style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    window.closeAppointmentDetailsModal = function() {
        const modal = document.getElementById('appointmentDetailsModal');
        if (modal) {
            modal.remove();
        }
    };

    // Utility Functions
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

    function formatTimeTo12Hour(time24) {
        try {
            const [hours, minutes] = time24.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch (error) {
            return time24;
        }
    }

    function displayNoAppointments(message) {
        if (appointmentHistoryList) {
            appointmentHistoryList.innerHTML = `
                <li class="record-item no-appointments">
                    <p style="font-weight: 500; color: #6b7280; text-align: center; font-style: italic;">
                        ${message}
                    </p>
                    <p style="font-size: 0.875rem; color: #9ca3af; text-align: center; margin-top: 8px;">
                        <a href="/frontend/patient/html/appointment.html" 
                           style="color: #2563eb; text-decoration: none;">
                            Book your first appointment here
                        </a>
                    </p>
                </li>
            `;
        }
    }

    function displayAppointmentError(message) {
        if (appointmentHistoryList) {
            appointmentHistoryList.innerHTML = `
                <li class="record-item error">
                    <p style="font-weight: 500; color: #dc2626; text-align: center;">
                        ${message}
                    </p>
                    <p style="font-size: 0.875rem; color: #6b7280; text-align: center; margin-top: 8px;">
                        <button onclick="loadAppointmentHistory()" 
                                style="background: none; border: none; color: #2563eb; 
                                       text-decoration: underline; cursor: pointer;">
                            Try again
                        </button>
                    </p>
                </li>
            `;
        }
    }

    function formatAppointmentDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    function formatAppointmentTime(timeString) {
        try {
            // Convert 24-hour format to 12-hour format if needed
            if (timeString.includes(':') && !timeString.includes('AM') && !timeString.includes('PM')) {
                const [hours, minutes] = timeString.split(':');
                const hour = parseInt(hours, 10);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                return `${displayHour}:${minutes} ${ampm}`;
            }
            return timeString;
        } catch (error) {
            return timeString;
        }
    }

    function getAppointmentStatus(appointment) {
        const now = new Date();
        const appointmentDateTime = new Date(appointment.selectedDate + ' ' + appointment.selectedTime);
        
        // If appointment has a specific status, use it
        if (appointment.status) {
            return appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
        }
        
        // Otherwise, determine status based on date/time
        if (appointmentDateTime < now) {
            return 'Completed';
        } else if (appointmentDateTime.toDateString() === now.toDateString()) {
            return 'Today';
        } else {
            return 'Scheduled';
        }
    }

    function getStatusColor(status) {
        const statusColors = {
            'Completed': { bg: '#dcfce7', text: '#166534' },
            'Today': { bg: '#fef3c7', text: '#92400e' },
            'Scheduled': { bg: '#dbeafe', text: '#1e40af' },
            'Cancelled': { bg: '#fee2e2', text: '#dc2626' },
            'Pending': { bg: '#f3e8ff', text: '#7c3aed' }
        };
        
        return statusColors[status] || { bg: '#f3f4f6', text: '#6b7280' };
    }

    function updateVerificationStatus(isVerified) {
        if (!verificationStatusDiv) return;

        if (isVerified) {
            verificationStatusDiv.innerHTML = `
                <div class="verification-status verified" style="color:green; font-weight:bold;">
                    <span class="status-icon">✅</span>
                    <span class="status-text">Account Verified</span>
                </div>
            `;
            if (verifyAccountBtn) verifyAccountBtn.style.display = 'none';
        } else {
            verificationStatusDiv.innerHTML = `
                <div class="verification-status unverified" style="color:red;">
                    <span class="status-icon">⚠</span>
                    <span class="status-text">Account Not Verified</span>
                    <small class="status-note">Please verify your email to access all features</small>
                </div>
            `;
            if (verifyAccountBtn) {
                verifyAccountBtn.style.display = 'inline-block';
                verifyAccountBtn.innerHTML = `<span class="btn-icon">📧</span> Verify Account`;
            }
        }
    }

    // Request medical record
    if (requestRecordBtn) {
        requestRecordBtn.addEventListener('click', async function() {
            if (!confirm('Request your medical records?')) return;
            try {
                const response = await fetch('/api/patient/profile/request-medical-record', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (data.success) {
                    showAlert('Medical record request submitted!', 'success', 'formAlert');
                    requestRecordBtn.textContent = 'Request Sent';
                    requestRecordBtn.disabled = true;
                } else {
                    showAlert('Request failed: ' + data.message, 'error', 'formAlert');
                }
            } catch (err) {
                console.error('Request error:', err);
                showAlert('Request failed. Please try again.', 'error', 'formAlert');
            }
        });
    }

    function showError(message) {
        if (patientName) {
            patientName.textContent = message;
            patientName.style.color = 'red';
        }
        if (typeof showAlert === 'function') {
            showAlert(message, 'error', 'formAlert');
        } else {
            alert(message);
        }
    }

    // Modified loadAppointmentHistory to check verification status
    window.loadAppointmentHistory = function() {
        if (userIsVerified) {
            loadAppointmentHistory();
        } else {
            displayVerificationRequiredMessage();
        }
    };
});

// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    localStorage.clear();
                    sessionStorage.clear();
                    if (typeof showAlert === 'function') {
                        showAlert('Successfully logged out! Redirecting...', 'success', 'formAlert');
                    }
                    setTimeout(() => {
                        window.location.href = '/frontend/patient/html/login.html';
                    }, 2000);
                } else {
                    throw new Error('Logout failed');
                }
            } catch (err) {
                console.error('Logout error:', err);
                alert('Logout failed. Please try again.');
            }
        });
    }
});