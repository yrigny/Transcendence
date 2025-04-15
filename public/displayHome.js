
function displayHome() {
    fetch('home.html')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(html => {
			const targetDiv = document.getElementById('home-inject');
			targetDiv.innerHTML = html;
		})
		.catch(error => {
			console.error('Failed to fetch home.html:', error);
		});
}

export default displayHome;