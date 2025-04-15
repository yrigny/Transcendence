
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
		})
		.catch(err => console.error('Failed to fetch register.html:', err));
}

export default displayRegister;