
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
	const addFriendButton = document.getElementById('add-friend-button');
	addFriendButton.addEventListener('click', async (event) => {
		event.preventDefault();
		const userName = await getUsername();
		const friendName = document.getElementById('add-friend-input').value.trim();
		if (userName === friendName) {
			alert('You cannot add yourself as a friend');
			return;
		}
		if (userName && friendName) {
			fetch('/users/:name/friend', {
				method: 'POST',
				body: JSON.stringify({ userName, friendName }),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(async res => {
				if (res.status !== 200) {
					const data = await res.json();
					alert(data.error || 'Failed to add friend');
				} else {
					alert('Friend added successfully');
					document.getElementById('add-friend-input').value = '';
					fillFriendsTable();
				}
			}).catch(err => {
				console.error('Failed to add friend:', err);
				alert('Failed to add friend');
			})
		} else {
			alert('Please enter a username');
		}
	});
}

async function fillFriendsTable() {
	console.log('Filling friends table');
	const userName = await getUsername();
	fetch(`/users/${userName}/friends`, {
		method: 'GET'
	}).then(async res => {
		if (res.status === 200) {
			const friends = await res.json();
			console.log('Fetched friends:', friends);
			const tableBody = document.getElementById('friend-list');
			tableBody.innerHTML = '';
			for (const friend of friends) {
				console.log('Listing friend:', friend.friend_name);
				const username = friend.friend_name;
				// Create a new row for each friend
				const row = document.createElement('tr');
				row.className = "hover:bg-gray-100 p-2";
				const avatarImg = document.createElement('img');
				avatarImg.className ="h-10 w-10 rounded-full border-4 border-gray-200 bg-gray-300 mx-auto";
				const avatarCell = document.createElement('td');
				avatarCell.className = "px-4 py-1 text-indigo-600 border-b text-center";
				const usernameCell = document.createElement('td');
				usernameCell.className = "px-3 py-1 text-indigo-600 border-b text-center";
				const statusCell = document.createElement('td');
				statusCell.className = "px-3 py-1 text-indigo-600 border-b text-center";
				// Set the avatar image source and text content
				avatarImg.src = await getUserAvatarPath(username);
				usernameCell.textContent = username;
				statusCell.textContent = await getUserStatus(username);
				avatarCell.appendChild(avatarImg);
				row.appendChild(avatarCell);
				row.appendChild(usernameCell);
				row.appendChild(statusCell);
				tableBody.appendChild(row);
			}
		}
	}).catch(err => {
		console.error('Failed to fetch friends:', err);
		alert('Failed to fetch friends');
	})
}

async function getUsername() {
	try {
		const res = await fetch('/auth/status', {
			method: 'GET',
			credentials: 'include'
		})
		const data = await res.json()
		if (data.loggedIn === true) {
			return data.username
		}
	} catch (error) {
		console.error('Login check failed:', error)
	}
	return null
}

async function getUserAvatarPath(username) {
    try {
        const res = await fetch(`/users/${username}/avatar`);
        if (res.ok) {
            const data = await res.json();
            return data.avatar;
        } else {
            console.error('Failed to fetch user avatar:', res.status);
            return '/default-avatar.png';
        }
    } catch (error) {
        console.error('Error fetching user avatar:', error);
        return '/default-avatar.png';
    }
}

async function getUserStatus(username) {
	const statusResponse = await fetch(`/users/${username}/status`);
	const status = await statusResponse.json();
	let statusText = '';
	if (status.isOnline)
		statusText = `Online since ${new Date(status.since).toLocaleString()}`;
	else
		statusText = 'Offline';
	return statusText;
}

export default displayFriends;
