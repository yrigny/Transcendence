
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
		fetch('/auth/login', {
			method: 'POST',
			body: JSON.stringify({
				username: document.getElementById('username-input').value,
				password: document.getElementById('password-input').value
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(async res => {
			if (res.status !== 200) {
				const data = await res.json();
				alert(data.error || 'Login failed');
			}
			else
				window.location.href = '/home';
		}).catch(err => {
			console.error('Error during login:', err);
			alert('Login failed. Please try again.');
		})
	})
}

export default displayLogin;