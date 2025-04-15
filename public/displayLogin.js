
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
		})
		.catch(err => console.error('Failed to fetch login.html:', err));
}

export default displayLogin;