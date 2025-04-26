
function displayDashboard() {
	const targetDiv = document.getElementById('dashboard-inject');
	if (!targetDiv) {
		console.error('Target div not found');
		return;
	}
	targetDiv.innerHTML = `
		<div class="flex-1 flex flex-col">
			<main class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
				<!-- Profile -->
				<div class="bg-white px-6 py-4 rounded-lg shadow-md border-l-4 border-purple-500">
					<h3 class="text-2xl py-2 font-semibold text-indigo-700">Profile</h3>
					<!-- Username -->
					<div class="px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-2 sm:px-0 items-center">
						<dt class="text-base font-medium text-gray-900">Username</dt>
						<dd id="username-display" class="mt-1 text-base text-gray-700 sm:col-span-1 sm:mt-0"></dd>
					</div>
					<!-- Email -->
					<div class="email-info px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-2 sm:px-0 items-center">
						<dt class="text-base font-medium text-gray-900">Email</dt>
						<dd id="email-display" class="mt-1 text-base text-gray-700 sm:col-span-1 sm:mt-0"></dd>
						<input type="email" id="email-input" class="rounded bg-gray-300 text-black px-2 w-40 hidden" />
						<div class="flex items-center justify-center sm:mt-0 mt-2">
							<button id="email-edit" class="text-sm/6 text-indigo-600 hover:underline">Edit</button>
							<button id="email-save" class="hidden text-sm/6 ml-2 px-1 bg-purple-500 text-white rounded hover:bg-purple-600">Save</button>
							<button id="email-cancel" class="hidden text-sm/6 ml-2 px-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancel</button>
						</div>
					</div>
					<!-- Password -->
					<div class="password-info px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-2 sm:px-0 items-center">
						<dt class="text-base font-medium text-gray-900">Password</dt>
						<dd id="password-display" class="mt-1 text-base text-gray-700 sm:col-span-1 sm:mt-0">••••••</dd>
						<input type="password" id="password-input" class="rounded bg-gray-300 text-black px-2 w-34 hidden" />
						<div class="flex items-center justify-center sm:mt-0 mt-2">
							<button id="password-edit" class="text-sm/6 text-indigo-600 hover:underline">Edit</button>
							<button id="password-save" class="hidden text-sm/6 ml-2 px-1 bg-purple-500 text-white rounded hover:bg-purple-600">Save</button>
							<button id="password-cancel" class="hidden text-sm/6 ml-2 px-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancel</button>
						</div>
					</div>
					<!-- Avatar -->
					<div class="avatar-info px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-2 sm:px-0 items-center">
						<dt class="text-base font-medium text-gray-900">Avatar</dt>
						<img id="avatar-display" src="" class="h-10 w-10 rounded-full border-4 border-gray-200 bg-gray-300"/>
						<input type="file" id="avatar-input" accept="image/*" class="rounded bg-gray-300 text-sm font-medium text-gray-700 px-2 h-10 w-34 hidden" />
						<div class="flex items-center justify-center sm:mt-0 mt-2">
							<button id="avatar-edit" class="text-sm/6 text-indigo-600 hover:underline">Edit</button>
							<button id="avatar-save" class="hidden text-sm/6 ml-2 px-1 bg-purple-500 text-white rounded hover:bg-purple-600">Save</button>
							<button id="avatar-cancel" class="hidden text-sm/6 ml-2 px-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancel</button>
						</div>
					</div>
					<!-- 2FA Toggle -->
					<div class="twofa-toggle px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-2 sm:px-0 items-center">
						<dt class="text-base font-medium text-gray-900">2FA</dt>
						<dd id="twofa-display" class="mt-1 text-base text-gray-700 sm:col-span-1 sm:mt-0">Off</dd>
						<div class="flex items-center justify-center sm:mt-0 mt-2">
							<label class="inline-flex relative items-center cursor-pointer">
								<input type="checkbox" id="twofa-switch" class="sr-only peer">
								<div
									class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 after:content-[''] after:absolute after:left-[4px] after:top-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white">
								</div>
							</label>
						</div>
					</div>
				</div>
				<!-- Stats Overview -->
				<div class="bg-white px-6 py-4 rounded-lg shadow-md border-l-4 border-purple-500">
					<h3 class="text-2xl py-2 font-semibold text-indigo-700">Stats</h3>
					<div class="px-4 py-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
					<dt class="text-base font-medium text-gray-900">Total Game Played</dt>
					<dd id="total-game" class="mt-1 text-base text-gray-700 sm:col-span-1 sm:mt-0 text-center">5</dd>
					</div>
					<div class="px-4 py-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
					<dt class="text-base font-medium text-gray-900">Total Win</dt>
					<dd id="total-win" class="mt-1 text-base text-gray-700 sm:col-span-1 sm:mt-0 text-center">3</dd>
					</div>
					<div class="px-4 py-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
					<dt class="text-base font-medium text-gray-900">Total Loss</dt>
					<dd id="total-loss" class="mt-1 text-base text-gray-700 sm:col-span-1 sm:mt-0 text-center">2</dd>
					</div>
					<div class="px-4 py-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
					<dt class="text-base font-medium text-gray-900">Winning Percentage</dt>
					<dd id="winning-percentage" class="mt-1 text-base text-gray-700 sm:col-span-1 sm:mt-0 text-center">60%</dd>
					</div>
				</div>
			</main>

			<!-- Match Records Table -->
			<section class="p-4">
				<h2 class="text-white text-2xl font-semibold mb-2">Match History</h2>
				<div class="bg-white rounded-lg shadow-md p-6 overflow-x-auto overflow-y-auto max-h-[500px] min-w-[600px]">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="bg-indigo-600 text-white">
								<th class="p-3 border-b">Winner</th>
								<th class="p-3 border-b">Players</th>
								<th class="p-3 border-b">Score</th>
								<th class="p-3 border-b">Date</th>
							</tr>
						</thead>
						<tbody id="match-history">
							<!-- dynamic statics here -->
						</tbody>
					</table>
				</div>
			</section>
		</div>
	`;
	fillData();
	buttonController();
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

async function fillProfile(username : string) {
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
			if (name) name.textContent = userData.name;
			if (email) email.textContent = userData.email;
			if (avatar instanceof HTMLImageElement) avatar.src = `/uploads/${userData.avatar}`;
			if (twoFA) twoFA.textContent = userData.two_fa_enabled ? 'Enabled' : 'Disabled';
			if (twoFASwitch instanceof HTMLInputElement) twoFASwitch.checked = userData.two_fa_enabled;
		}
	} catch (error) {
		console.error('Login check failed:', error)
	}
}

async function fillStatsAndHistory(username : string) {
	try {
		const totalGamePlayed = document.getElementById('total-game');
		const totalWin = document.getElementById('total-win');
		const totalLoss = document.getElementById('total-loss');
		const winningPercentage = document.getElementById('winning-percentage');
		const matchHistory = document.getElementById('match-history');
		const res = await fetch('/api/matches', {
			method: 'GET',
			credentials: 'include'
		})
		const data = await res.json()
		if (!data || !Array.isArray(data)) return
		let winCount = 0
		let lossCount = 0
		let totalCount = 0
		if (!matchHistory) {
			console.error("Failed to find the match history element in the DOM.");
			return ;
		}
		matchHistory.innerHTML = ''
		// Loop through the matches and count wins/losses, and display them
		data.forEach(match => {
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
		if (totalGamePlayed) totalGamePlayed.textContent = totalCount.toString();
		if (totalWin) totalWin.textContent = winCount.toString();
		if (totalLoss) totalLoss.textContent = lossCount.toString();
		if (winningPercentage) {
			winningPercentage.textContent = totalCount === 0 ? 'N/A' : Math.round((winCount / totalCount) * 100) + '%';
		}
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
		const dtElement = infoDiv.querySelector('dt');
		if (!dtElement || !dtElement.textContent) {
			console.error("Missing <dt> element or textContent in infoDiv:", infoDiv);
			return;
		}
		const fieldType = dtElement.textContent.trim().toLowerCase();
		const valueElement = infoDiv.querySelector(fieldType === 'avatar' ? 'img' : 'dd');
		const inputField = infoDiv.querySelector('input');
		const editButton = document.getElementById(fieldType + '-edit');
		const saveButton = document.getElementById(fieldType + '-save');
		const cancelButton = document.getElementById(fieldType + '-cancel');

		if (editButton && saveButton && cancelButton && valueElement && inputField) {
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
				if ('value' in inputField) inputField.value = '';
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
					if ('files' in inputField && inputField.files && inputField.files.length === 0) {
						alert('Please select an image');
					}
					else if ('files' in inputField && inputField.files && inputField.files.length > 0) {
						formData = new FormData();
						formData.append('avatar', inputField.files[0]);
						newValue = URL.createObjectURL(inputField.files[0]); // Temporary preview
					}
				} else { // text fields
					if ('value' in inputField) {
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
						const errorMsg = (error instanceof Error) ? error.message : String(error);
						alert('Error updating profile:' + errorMsg);
					}
				}
			})
		}
	})

	const twoFASwitch = document.getElementById('twofa-switch') as HTMLInputElement | null;
	if (twoFASwitch) {
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
		});
	} else {
		console.error("Failed to find the 2FA switch element in the DOM.");
	}
}

export default displayDashboard