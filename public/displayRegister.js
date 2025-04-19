function displayRegister() {
	fetch('register.html')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(html => {
			const targetDiv = document.getElementById('register-inject');
			targetDiv.innerHTML = html;
			checkInputFields();
			registerHandler();
		})
		.catch(err => console.error('Failed to fetch register.html:', err));
}

function checkInputFields() {
	const usernameInput = document.getElementById('username');
	const passwordInput = document.getElementById('password');
	const confirmPasswordInput = document.getElementById('confirm-password');
	const errorMessage = document.getElementById('error-message');

	usernameInput.addEventListener('blur', () => {
		console.log('Username input:', usernameInput.value);
		if (usernameInput.value.length < 3) {
			errorMessage.textContent = 'Username must be at least 3 characters long.';
		} else {
			errorMessage.textContent = '';
		}
	});
	passwordInput.addEventListener('blur', () => {
		if (passwordInput.value.length < 6) {
			errorMessage.textContent = 'Password must be at least 6 characters long.';
		} else {
			errorMessage.textContent = '';
		}
	});
	confirmPasswordInput.addEventListener('blur', () => {
		if (passwordInput.value !== confirmPasswordInput.value) {
			errorMessage.textContent = 'Passwords do not match.';
		} else {
			errorMessage.textContent = '';
		}
	})
}

async function registerHandler() {
	const form = document.getElementById('register-form');
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const formData = new FormData(form);
		fetch('/auth/register', {
			method: 'POST',
			body: formData
		}).then(async res => {
			if (res.status !== 200) {
				const data = await res.json();
				alert(data.error || 'Registration failed');
			}
			else
				window.location.href = '/home';
		}).catch(err => {
			console.error('Error during registration:', err);
			alert('Registration failed. Please try again.');
		})
	})
}

export default displayRegister;