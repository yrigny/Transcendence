
function displayFriends() {

	const targetDiv = document.getElementById('friends-inject');
	if (!targetDiv) {
		console.error('Target div not found');
		return;
	}
	targetDiv.innerHTML = `
		<div class="p-10">
			<h2 class="text-2xl font-bold text-white mb-6">My Friends</h2>

			<!-- add friends -->
			<form class="mb-6">
				<input 
					type="text" 
					id="add-friend-input" 
					placeholder="Enter username to add" 
					class="p-3 w-full max-w-xs rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					required
				/>
				<button 
					id="add-friend-button" 
					class="mt-3 p-3 w-full max-w-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none"
				>
					Add Friend
				</button>
			</form>

			<!-- friends list -->
			<div class="bg-white rounded-lg shadow-md p-6 min-h-[600px] min-w-[600px]">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="bg-indigo-600 text-white">
							<th class="p-3 border-b text-center">Avatar</th>
							<th class="p-3 border-b text-center">Username</th>
							<th class="p-3 border-b text-center">Status</th>
						</tr>
					</thead>
					<tbody id="friend-list">
						<!-- Friends will be dynamically injected here -->
					</tbody>
				</table>
			</div>
		</div>
	`;
	addFriendHandler();
	fillFriendsTable();
}

async function addFriendHandler() {
	const addFriendButton = document.getElementById('add-friend-button');
	if (!addFriendButton) {
		console.error("Element with id 'add-friend-button' not found.");
		return;
	}
	addFriendButton.addEventListener('click', async (event) => {
		event.preventDefault();
		const userName = await getUsername();
		const addFriendInput = document.getElementById('add-friend-input');
		if (!addFriendInput) {
			console.error("Element with id 'add-friend-input' not found.");
			return;
		}
		const friendName = (addFriendInput as HTMLInputElement).value.trim();
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
					const addFriendInputElement = document.getElementById('add-friend-input') as HTMLInputElement;
					if (addFriendInputElement) {
						addFriendInputElement.value = '';
					}
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
			if (tableBody) {
				tableBody.innerHTML = '';
			} else {
				console.error("Element with id 'friend-list' not found.");
				return;
			}
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

async function getUserAvatarPath(username : string) {
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

async function getUserStatus(username : string) {
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
