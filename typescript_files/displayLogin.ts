
function displayLogin(): void {
	fetch('login.html')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(html => {
			const targetDiv = document.getElementById('login-inject');
			if (targetDiv) {
                targetDiv.innerHTML = html;
            } else {
                console.error("Element with id 'login-inject' not found.");
            }
			checkLogin();
		})
		.catch(err => console.error('Failed to fetch login.html:', err));
}

async function checkLogin(): Promise<void> {
	const submitButton = document.getElementById('submit-login-form') as HTMLButtonElement | null;
	if (!submitButton) {
		console.error("Submit button not found");
		return;
	}

	submitButton.addEventListener('click', async (event: MouseEvent): Promise<void> => {
		event.preventDefault();

		const usernameInput = document.getElementById('username-input') as HTMLInputElement | null;
		const passwordInput = document.getElementById('password-input') as HTMLInputElement | null;
		if (!usernameInput || !passwordInput) {
			console.error("Username or password input not found");
			return;
		}

		const username = usernameInput.value;
		const password = passwordInput.value;

		try {
			const res = await fetch('/auth/login', {
				method: 'POST',
				body: JSON.stringify({ username, password }),
				headers: { 'Content-Type': 'application/json' }
			});
			const data = await res.json();
			if (res.status === 200) {
				window.location.href = '/home';
			} else if (res.status === 206) {
				sendTwoFACode(username);
				checkTwoFA(username);
			} else {
				alert(data.error || 'Login failed');
			}
		} catch (err) {
			console.error('Error during login:', err);
			alert('Login failed. Please try again.');
		}
	});
}

async function sendTwoFACode(username: string): Promise<void> {
	fetch('/auth/2fa/send-code', {
		method: 'POST',
		body: JSON.stringify({ username }),
		headers: { 'Content-Type': 'application/json' }
	}).then(async res => {
		const data = await res.json();
		if (res.status === 200)
			alert('2FA code sent to your email');
		else
			alert(data.error || 'Failed to send 2FA code');
	}).catch(err => {
		console.error('Error sending 2FA code:', err);
		alert('Failed to send 2FA code. Please try again.');
	})
}

async function checkTwoFA(username: string): Promise<void> {
	const loginForm = document.getElementById('login-form');
	const twoFAForm = document.getElementById('2fa-form');
	const submitButton = document.getElementById('verify-2fa-button') as HTMLButtonElement | null;
	const codeInput = document.getElementById('code-input') as HTMLInputElement | null;

	if (!loginForm || !twoFAForm || !submitButton || !codeInput) {
		console.error("2FA elements not found");
		return;
	}

	loginForm.classList.add('hidden');
	twoFAForm.classList.remove('hidden');

	submitButton.addEventListener('click', async (event: MouseEvent): Promise<void> => {
		event.preventDefault();
		const code = codeInput.value;

		try {
			const res = await fetch('/auth/2fa/verify', {
				method: 'POST',
				body: JSON.stringify({ username, code }),
				headers: { 'Content-Type': 'application/json' }
			});
			const data = await res.json();
			if (res.status === 200) {
				window.location.href = '/home';
			} else {
				alert(data.error || 'Invalid 2FA code');
			}
		} catch (err) {
			console.error('Error during 2FA verification:', err);
			alert('2FA verification failed. Please try again.');
		}
	});
}

export default displayLogin;