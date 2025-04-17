
function displayDashboard() {
    fetch('dashboard.html')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(html => {
			const targetDiv = document.getElementById('dashboard-inject');
			targetDiv.innerHTML = html;
		})
		.catch(error => {
			console.error('Failed to fetch dashboard.html:', error);
		});
}

export default displayDashboard