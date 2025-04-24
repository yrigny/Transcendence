function displayTournament(): void {
	fetch('tournament.html')
		.then((response: Response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then((html: string) => {
			const targetDiv = document.getElementById('tournament-inject');
			if (targetDiv) {
				targetDiv.innerHTML = html;
			} else {
				console.error('Element with ID "tournament-inject" not found.');
			}
		})
		.catch((error: unknown) => {
			console.error('Failed to fetch tournament.html:', error);
		});
}

export default displayTournament;