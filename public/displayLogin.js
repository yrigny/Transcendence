
function displayLogin() {
	fetch('login.html')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(html => {
			const targetDiv = document.getElementById('login-inject');
			targetDiv.innerHTML = html;
			checkLogin();
		})
		.catch(err => console.error('Failed to fetch login.html:', err));
}

async function checkLogin() {
	const submitButton = document.getElementById('submit-login-form');
	submitButton.addEventListener('click', async (event) => {
		event.preventDefault();
		const username = document.getElementById('username-input').value;
		const password = document.getElementById('password-input').value;
		fetch('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ username, password }),
			headers: { 'Content-Type': 'application/json' }
		}).then(async res => {
			const data = await res.json();
			if (res.status === 200)
				window.location.href = '/home';
			else if (res.status === 206)
				checkTwoFA(username);
			else
				alert(data.error || 'Login failed');
		}).catch(err => {
			console.error('Error during login:', err);
			alert('Login failed. Please try again.');
		})
	})
}

async function checkTwoFA(username) {
	document.getElementById('login-form').classList.add('hidden');
	document.getElementById('2fa-form').classList.remove('hidden');
	const submitButton = document.getElementById('verify-2fa-button');
	submitButton.addEventListener('click', async (event) => {
		event.preventDefault();
		const code = document.getElementById('code-input').value;
		fetch('/auth/verify-login', {
			method: 'POST',
			body: JSON.stringify({ username, code }),
			headers: { 'Content-Type': 'application/json' }
		}).then(async res => {
			const data = await res.json();
			if (res.status === 200)
				window.location.href = '/home'
			else
				alert(data.error || 'Invalid 2FA code');
		}).catch(err => {
			console.error('Error during 2FA verification:', err);
			alert('2FA verification failed. Please try again.');
		})
	})
}

export default displayLogin;