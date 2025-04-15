
function displayGame() {
	fetch('game.html')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(html => {
			const targetDiv = document.getElementById('game-inject');
			targetDiv.innerHTML = html;
		})
		.catch(err => console.error('Failed to fetch game.html:', err));
}

export default displayGame;