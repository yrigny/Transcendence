
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
			fillData();
			buttonController();
		})
		.catch(error => {
			console.error('Failed to fetch dashboard.html:', error);
		});
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

async function fillProfile(username) {
	try {
		const user = await fetch(`/users/${username}`, {
			method: 'GET',
			credentials: 'include'
		})
		const userData = await user.json()
		if (userData) {
			const name = document.getElementById('username-display');
			const email = document.getElementById('email-display');
			const avatar = document.getElementById('avatar-display');
			const twoFA = document.getElementById('twofa-display');
			const twoFASwitch = document.getElementById('twofa-switch');
			name.textContent = userData.name;
			email.textContent = userData.email;
			avatar.src = `/uploads/${userData.avatar}`;
			twoFA.textContent = userData.two_fa_enabled ? 'Enabled' : 'Disabled';
			twoFASwitch.checked = userData.two_fa_enabled;
		}
	} catch (error) {
		console.error('Login check failed:', error)
	}
}

async function fillStatsAndHistory(username) {
	try {
		const totalGamePlayed = document.getElementById('total-game');
		const totalWin = document.getElementById('total-win');
		const totalLoss = document.getElementById('total-loss');
		const winningPercentage = document.getElementById('winning-percentage');
		const matchHistory = document.getElementById('match-history');
		const res = await fetch('/matches', {
			method: 'GET',
			credentials: 'include'
		})
		const data = await res.json()
		if (!data || !Array.isArray(data)) return
		let winCount = 0
		let lossCount = 0
		let totalCount = 0
		matchHistory.innerHTML = ''
		// Loop through the matches and count wins/losses, and display them
		data.forEach(match => {
			console.log(match)
			const { player1, player2, player1_score, player2_score, game_end_time } = match
			const isPlayer1 = player1 === username
			const isPlayer2 = player2 === username
			if (isPlayer1)
				if (player1_score > player2_score) winCount++
				else lossCount++
			if (isPlayer2)
				if (player2_score > player1_score) winCount++
				else lossCount++
			const winner = player1_score > player2_score ? player1 : player2
			const row = document.createElement('tr');
			row.className = 'hover:bg-gray-100';
			row.innerHTML = `
				<td class="p-3 text-indigo-600 border-b">${winner} 🏆</td>
				<td class="p-3 text-indigo-600 border-b">${player1} - ${player2}</td>
				<td class="p-3 text-indigo-600 border-b">${player1_score} - ${player2_score}</td>
				<td class="p-3 text-indigo-600 border-b">${new Date(game_end_time).toLocaleString()}</td>
			`;
			matchHistory.appendChild(row);
		})
		totalCount = winCount + lossCount
		totalGamePlayed.textContent = totalCount.toString()
		totalWin.textContent = winCount.toString()
		totalLoss.textContent = lossCount.toString()
		winningPercentage.textContent = totalCount === 0 ? 'N/A' : Math.round((winCount / totalGamePlayed.textContent) * 100) + '%'
	} catch (error) {
		console.error('Error fetching match history:', error)
	}
}

async function fillData() {
	console.log('Filling data...');
	const username = await getUsername();
	fillProfile(username);
	fillStatsAndHistory(username);
}

async function buttonController() {
	const infoDivs = document.querySelectorAll('.email-info, .password-info, .avatar-info');
	
	infoDivs.forEach(infoDiv => {
		const fieldType = infoDiv.querySelector('dt').textContent.trim().toLowerCase();
		const valueElement = infoDiv.querySelector(fieldType === 'avatar' ? 'img' : 'dd');
		const inputField = infoDiv.querySelector('input');
		const editButton = document.getElementById(fieldType + '-edit');
		const saveButton = document.getElementById(fieldType + '-save');
		const cancelButton = document.getElementById(fieldType + '-cancel');

		editButton.addEventListener("click", () => {
			console.log('Edit button clicked:', fieldType);
			editButton.classList.add('hidden');
			saveButton.classList.remove('hidden');
			cancelButton.classList.remove('hidden');
			valueElement.classList.add('hidden');
			inputField.classList.remove('hidden');
		})

		cancelButton.addEventListener("click", () => {
			console.log('Cancel button clicked:', fieldType);
			editButton.classList.remove('hidden');
			saveButton.classList.add('hidden');
			cancelButton.classList.add('hidden');
			valueElement.classList.remove('hidden');
			inputField.classList.add('hidden');
			inputField.value = '';
			return
		})

		saveButton.addEventListener("click", async () => {
			console.log('Save button clicked:', fieldType);
			editButton.classList.remove('hidden');
			saveButton.classList.add('hidden');
			cancelButton.classList.add('hidden');
			valueElement.classList.remove('hidden');
			inputField.classList.add('hidden');

			let newValue;
			let formData = null;
			if (fieldType === 'avatar') {
				if (inputField.files.length === 0) {
					alert('Please select an image');
				}
				else {
					formData = new FormData();
					formData.append('avatar', inputField.files[0]);
					newValue = URL.createObjectURL(inputField.files[0]); // Temporary preview
				}
			} else { // text fields
				newValue = inputField.value.trim();
				if (newValue === '') {
					alert(`${fieldType} cannot be empty`);
				}
				else if (fieldType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
					alert('Please enter a valid email address');
				}
				else if (fieldType === 'password' && newValue.length < 6) {
					alert('Password must be at least 6 characters long');
				}
				else { // input valid
					formData = new FormData();
					formData.append(fieldType, newValue);
				}
			}
			if (formData) {
				try {
					const username = await getUsername();
					const res = await fetch(`/users/${username}`, {
						method: 'POST',
						body: formData,
					});
					const result = await res.json();
					alert(result.message);
					fillProfile(username);
				} catch (error) {
					alert('Error updating profile:' + error.message);
				}
			}
		})
	})

	const twoFASwitch = document.getElementById('twofa-switch');
	twoFASwitch.addEventListener('change', async () => {
		let isEnabled = twoFASwitch.checked;
		const endpoint = isEnabled ? '/auth/2fa/enable' : '/auth/2fa/disable';
		try {
			const res = await fetch(endpoint, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: await getUsername() })
			});
			const data = await res.json();
			if (res.status === 200) {
				alert(`2FA ${isEnabled ? 'enabled' : 'disabled'} successfully`);
			} else {
				alert(data.error || 'Failed to update 2FA status');
			}
		} catch (error) {
			console.error('Error toggling 2FA:', error);
			alert('Something went wrong');
		}
	})
}

export default displayDashboard