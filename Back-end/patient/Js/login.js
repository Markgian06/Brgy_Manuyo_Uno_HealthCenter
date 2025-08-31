document.getElementById('signin-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    console.log("LOGIN");

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loginIdentifier: formData.get('loginIdentifier'),
                password: formData.get('password')
            })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = './forgetpassword.html';
        } else {
            alert(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});
