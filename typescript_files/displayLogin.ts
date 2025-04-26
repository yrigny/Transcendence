
function displayLogin(): void {
	const targetDiv = document.getElementById('login-inject');
	if (!targetDiv) {
		console.error("Target div not found");
		return;
	}
	targetDiv.innerHTML = `
		<div class="bg-gray-800 p-12 rounded-lg shadow-lg w-96 text-center">
			<h2 class="text-2xl font-semibold mb-4">Login</h2>
			
			<!-- Login form -->
			<form id="login-form" class="flex flex-col">
				<input type="text" id="username-input" name="username" placeholder="Username" required
					class="w-full p-3 mb-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
				<input type="password" id="password-input" name="password" placeholder="Password" required
					class="w-full p-3 mb-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
				<button id="submit-login-form" type="submit"
					class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded transition duration-200">
					Login
				</button>
			</form>

			<!-- 2FA form -->
			<form id="2fa-form" class="hidden flex flex-col mt-4">
				<p class="text-white mb-2">Enter the 6-digit code sent to your email</p>
				<input type="text" id="code-input" maxlength="6" placeholder="2FA Code" required
					class="w-full p-3 mb-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
				<button id="verify-2fa-button"
					class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 rounded transition duration-200">
					Verify
				</button>
			</form>

			<div id="error-message" class="text-red-400 mt-3"></div>

			<p class="mt-4 text-sm">
				Don't have an account? <a href="register" class="text-blue-300 hover:underline">Register here</a>
			</p>
		</div>
	`;
	checkLogin();
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