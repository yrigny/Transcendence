
function displayTournament() {
	fetch('tournament.html')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(html => {
			const targetDiv = document.getElementById('tournament-inject');
			targetDiv.innerHTML = html;
		})
		.catch(error => {
			console.error('Failed to fetch tournament.html:', error);
		});
}

export default displayTournament;