document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const alertBox = document.getElementById('alert-box');
    alertBox.classList.add('d-none');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    if (res && res.ok) {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.href = '/dashboard';
    } else {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = (res && res.data.error) ? res.data.error : 'Login failed';
        alertBox.classList.remove('d-none');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const alertBox = document.getElementById('alert-box');
    alertBox.classList.add('d-none');

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });

    if (res && res.ok) {
        alertBox.className = 'alert alert-success';
        alertBox.textContent = 'Account created successfully! Redirecting to login...';
        alertBox.classList.remove('d-none');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
    } else {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = (res && res.data.error) ? res.data.error : 'Registration failed';
        alertBox.classList.remove('d-none');
    }
}