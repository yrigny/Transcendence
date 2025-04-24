var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        if (targetDiv) {
            targetDiv.innerHTML = html;
        }
        else {
            console.error("Element with id 'friends-inject' not found.");
        }
        addFriendHandler();
        fillFriendsTable();
    })
        .catch(err => console.error('Failed to fetch friends.html:', err));
}
function addFriendHandler() {
    return __awaiter(this, void 0, void 0, function* () {
        const addFriendButton = document.getElementById('add-friend-button');
        if (!addFriendButton) {
            console.error("Element with id 'add-friend-button' not found.");
            return;
        }
        addFriendButton.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const userName = yield getUsername();
            const addFriendInput = document.getElementById('add-friend-input');
            if (!addFriendInput) {
                console.error("Element with id 'add-friend-input' not found.");
                return;
            }
            const friendName = addFriendInput.value.trim();
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
                }).then((res) => __awaiter(this, void 0, void 0, function* () {
                    if (res.status !== 200) {
                        const data = yield res.json();
                        alert(data.error || 'Failed to add friend');
                    }
                    else {
                        alert('Friend added successfully');
                        const addFriendInputElement = document.getElementById('add-friend-input');
                        if (addFriendInputElement) {
                            addFriendInputElement.value = '';
                        }
                        fillFriendsTable();
                    }
                })).catch(err => {
                    console.error('Failed to add friend:', err);
                    alert('Failed to add friend');
                });
            }
            else {
                alert('Please enter a username');
            }
        }));
    });
}
function fillFriendsTable() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Filling friends table');
        const userName = yield getUsername();
        fetch(`/users/${userName}/friends`, {
            method: 'GET'
        }).then((res) => __awaiter(this, void 0, void 0, function* () {
            if (res.status === 200) {
                const friends = yield res.json();
                console.log('Fetched friends:', friends);
                const tableBody = document.getElementById('friend-list');
                if (tableBody) {
                    tableBody.innerHTML = '';
                }
                else {
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
                    avatarImg.className = "h-10 w-10 rounded-full border-4 border-gray-200 bg-gray-300 mx-auto";
                    const avatarCell = document.createElement('td');
                    avatarCell.className = "px-4 py-1 text-indigo-600 border-b text-center";
                    const usernameCell = document.createElement('td');
                    usernameCell.className = "px-3 py-1 text-indigo-600 border-b text-center";
                    const statusCell = document.createElement('td');
                    statusCell.className = "px-3 py-1 text-indigo-600 border-b text-center";
                    // Set the avatar image source and text content
                    avatarImg.src = yield getUserAvatarPath(username);
                    usernameCell.textContent = username;
                    statusCell.textContent = yield getUserStatus(username);
                    avatarCell.appendChild(avatarImg);
                    row.appendChild(avatarCell);
                    row.appendChild(usernameCell);
                    row.appendChild(statusCell);
                    tableBody.appendChild(row);
                }
            }
        })).catch(err => {
            console.error('Failed to fetch friends:', err);
            alert('Failed to fetch friends');
        });
    });
}
function getUsername() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch('/auth/status', {
                method: 'GET',
                credentials: 'include'
            });
            const data = yield res.json();
            if (data.loggedIn === true) {
                return data.username;
            }
        }
        catch (error) {
            console.error('Login check failed:', error);
        }
        return null;
    });
}
function getUserAvatarPath(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(`/users/${username}/avatar`);
            if (res.ok) {
                const data = yield res.json();
                return data.avatar;
            }
            else {
                console.error('Failed to fetch user avatar:', res.status);
                return '/default-avatar.png';
            }
        }
        catch (error) {
            console.error('Error fetching user avatar:', error);
            return '/default-avatar.png';
        }
    });
}
function getUserStatus(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const statusResponse = yield fetch(`/users/${username}/status`);
        const status = yield statusResponse.json();
        let statusText = '';
        if (status.isOnline)
            statusText = `Online since ${new Date(status.since).toLocaleString()}`;
        else
            statusText = 'Offline';
        return statusText;
    });
}
export default displayFriends;
