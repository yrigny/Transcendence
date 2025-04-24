
function displayHome(): void {
    fetch('home.html')
		.then((response: Response): Promise<string> => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then((html: string): void => {
			const targetDiv = document.getElementById('home-inject');
			if (targetDiv) {
                targetDiv.innerHTML = html;
            } else {
                console.error("Element with id 'home-inject' not found.");
            }
		})
		.catch((error: Error): void => {
			console.error('Failed to fetch home.html:', error);
		});
}

export default displayHome;