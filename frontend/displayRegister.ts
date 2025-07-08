
function displayRegister() {
	const targetDiv = document.getElementById('register-inject');
	if (!targetDiv) {
		console.error('Target div not found');
		return;
	}
	targetDiv.innerHTML = `
		<div class="bg-gray-800 p-12 rounded-lg shadow-lg w-full max-w-md text-center">

			<h2 class="text-2xl font-semibold mb-4">Register</h2>
			<form class="flex flex-col space-y-5" id="register-form" enctype="multipart/form-data">
				<input id="username" type="text" name="username" placeholder="Username" required 
						class="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
				<input id="email" type="email" name="email" placeholder="Email" required class="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
				<input id="password" type="password" name="password" placeholder="Password" required 
						class="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
				<input id="confirm-password" type="password" name="confirmPassword" placeholder="Confirm Password" required 
						class="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
				<label for="avatar" class="text-white text-base text-sm">Upload Your Avatar</label>
				<input id="avatar" type="file" name="avatar" accept="image/*"
						class="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm">
				<button id="submit-register-form" type="submit"
						class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded transition duration-200">
					Register
				</button>
			</form>

			<div id="error-message" class="text-red-400 text-sm mt-2"></div>

			<p class="mt-3 text-base">Already have an account? 
				<a href="login" class="text-blue-300 hover:underline">Login here</a>
			</p>
		</div>
	`;
	checkInputFields();
	registerHandler();
}

function checkInputFields(): void {
	const usernameInput = document.getElementById('username') as HTMLInputElement | null;
	const passwordInput = document.getElementById('password') as HTMLInputElement | null;
	const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement | null;
	const errorMessage = document.getElementById('error-message') as HTMLElement | null;

	if (!usernameInput || !passwordInput || !confirmPasswordInput || !errorMessage) return;

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

async function registerHandler(): Promise<void> {
	const form = document.getElementById('register-form') as HTMLFormElement | null;
	if (!form) return;

	form.addEventListener('submit', async (event: Event) => {
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