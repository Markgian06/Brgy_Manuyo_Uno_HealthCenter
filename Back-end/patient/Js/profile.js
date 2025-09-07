// /Back-end/patient/Js/profile.js - Simple working version
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    
    // Get DOM elements
    const patientName = document.getElementById('patientName');
    const patientId = document.getElementById('patientId');
    const patientAge = document.getElementById('patientAge');
    const patientGender = document.getElementById('patientGender');
    const emailPhoneInput = document.getElementById('email_phone');
    const updateEmailPhoneBtn = document.getElementById('updateEmailPhone');
    const requestRecordBtn = document.getElementById('requestRecordBtn');

    // Load profile when page loads
    loadProfile();

    async function loadProfile() {
        try {
            console.log('Fetching profile...');
            
            const response = await fetch('/profile', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Profile data:', data);

            if (data.success) {
                // Populate the profile
                if (patientName) patientName.textContent = data.data.fullName;
                if (patientId) patientId.textContent = data.data.patientID;
                if (patientAge) patientAge.textContent = data.data.age;
                if (patientGender) patientGender.textContent = data.data.gender;
                if (emailPhoneInput) emailPhoneInput.value = data.data.email || data.data.contactNum || '';
                
                console.log('Profile populated successfully');
            } else {
                console.error('API error:', data.message);
                showError('Failed to load profile: ' + data.message);
            }

        } catch (error) {
            console.error('Network error:', error);
            showError('Cannot connect to server: ' + error.message);
        }
    }

    // Update email/phone button
    if (updateEmailPhoneBtn) {
        updateEmailPhoneBtn.addEventListener('click', async function() {
            const newContact = emailPhoneInput.value.trim();
            if (!newContact) {
                alert('Please enter email or phone number');
                return;
            }

            try {
                const isEmail = newContact.includes('@');
                const updateData = isEmail ? { email: newContact } : { contactNum: newContact };

                const response = await fetch('/api/patient/profile/contact', {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                const data = await response.json();
                if (data.success) {
                    alert('Contact updated successfully!');
                } else {
                    alert('Update failed: ' + data.message);
                }
            } catch (error) {
                alert('Update failed: ' + error.message);
            }
        });
    }

    // Request medical record button
    if (requestRecordBtn) {
        requestRecordBtn.addEventListener('click', async function() {
            if (!confirm('Request your medical records?')) return;

            try {
                const response = await fetch('/api/patient/profile/request-medical-record', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (data.success) {
                    alert('Medical record request submitted!');
                    requestRecordBtn.textContent = 'Request Sent';
                    requestRecordBtn.disabled = true;
                } else {
                    alert('Request failed: ' + data.message);
                }
            } catch (error) {
                alert('Request failed: ' + error.message);
            }
        });
    }

    function showError(message) {
        // Show error in the name field temporarily
        if (patientName) {
            patientName.textContent = message;
            patientName.style.color = 'red';
        }
        
        // Also show alert
        alert(message);
    }
});