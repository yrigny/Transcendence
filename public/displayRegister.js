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

export default displayRegister;