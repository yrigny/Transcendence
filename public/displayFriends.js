
function displayFriends() {
	fetch('friends.html')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(html => {
			const targetDiv = document.getElementById('friends-inject');
			targetDiv.innerHTML = html;
			addFriendHandler();
			fillFriendsTable();
		})
		.catch(err => console.error('Failed to fetch friends.html:', err));
}

async function addFriendHandler() {

}

async function fillFriendsTable() {
	
}

export default displayFriends;
