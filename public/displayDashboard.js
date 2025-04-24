var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        if (!targetDiv) {
            console.error("Failed to get element with ID 'dashboard-inject'");
            return;
        }
        targetDiv.innerHTML = html;
        fillData();
        buttonController();
    })
        .catch(error => {
        console.error('Failed to fetch dashboard.html:', error);
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
function fillProfile(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield fetch(`/users/${username}`, {
                method: 'GET',
                credentials: 'include'
            });
            const userData = yield user.json();
            if (userData) {
                const name = document.getElementById('username-display');
                const email = document.getElementById('email-display');
                const avatar = document.getElementById('avatar-display');
                const twoFA = document.getElementById('twofa-display');
                const twoFASwitch = document.getElementById('twofa-switch');
                if (name)
                    name.textContent = userData.name;
                if (email)
                    email.textContent = userData.email;
                if (avatar instanceof HTMLImageElement)
                    avatar.src = `/uploads/${userData.avatar}`;
                if (twoFA)
                    twoFA.textContent = userData.two_fa_enabled ? 'Enabled' : 'Disabled';
                if (twoFASwitch instanceof HTMLInputElement)
                    twoFASwitch.checked = userData.two_fa_enabled;
            }
        }
        catch (error) {
            console.error('Login check failed:', error);
        }
    });
}
function fillStatsAndHistory(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const totalGamePlayed = document.getElementById('total-game');
            const totalWin = document.getElementById('total-win');
            const totalLoss = document.getElementById('total-loss');
            const winningPercentage = document.getElementById('winning-percentage');
            const matchHistory = document.getElementById('match-history');
            const res = yield fetch('/matches', {
                method: 'GET',
                credentials: 'include'
            });
            const data = yield res.json();
            if (!data || !Array.isArray(data))
                return;
            let winCount = 0;
            let lossCount = 0;
            let totalCount = 0;
            if (!matchHistory) {
                console.error("Failed to find the match history element in the DOM.");
                return;
            }
            matchHistory.innerHTML = '';
            // Loop through the matches and count wins/losses, and display them
            data.forEach(match => {
                console.log(match);
                const { player1, player2, player1_score, player2_score, game_end_time } = match;
                const isPlayer1 = player1 === username;
                const isPlayer2 = player2 === username;
                if (isPlayer1)
                    if (player1_score > player2_score)
                        winCount++;
                    else
                        lossCount++;
                if (isPlayer2)
                    if (player2_score > player1_score)
                        winCount++;
                    else
                        lossCount++;
                const winner = player1_score > player2_score ? player1 : player2;
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-100';
                row.innerHTML = `
				<td class="p-3 text-indigo-600 border-b">${winner} 🏆</td>
				<td class="p-3 text-indigo-600 border-b">${player1} - ${player2}</td>
				<td class="p-3 text-indigo-600 border-b">${player1_score} - ${player2_score}</td>
				<td class="p-3 text-indigo-600 border-b">${new Date(game_end_time).toLocaleString()}</td>
			`;
                matchHistory.appendChild(row);
            });
            totalCount = winCount + lossCount;
            if (totalGamePlayed)
                totalGamePlayed.textContent = totalCount.toString();
            if (totalWin)
                totalWin.textContent = winCount.toString();
            if (totalLoss)
                totalLoss.textContent = lossCount.toString();
            if (winningPercentage) {
                winningPercentage.textContent = totalCount === 0 ? 'N/A' : Math.round((winCount / totalCount) * 100) + '%';
            }
        }
        catch (error) {
            console.error('Error fetching match history:', error);
        }
    });
}
function fillData() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Filling data...');
        const username = yield getUsername();
        fillProfile(username);
        fillStatsAndHistory(username);
    });
}
function buttonController() {
    return __awaiter(this, void 0, void 0, function* () {
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
                });
                cancelButton.addEventListener("click", () => {
                    console.log('Cancel button clicked:', fieldType);
                    editButton.classList.remove('hidden');
                    saveButton.classList.add('hidden');
                    cancelButton.classList.add('hidden');
                    valueElement.classList.remove('hidden');
                    inputField.classList.add('hidden');
                    if ('value' in inputField)
                        inputField.value = '';
                    return;
                });
                saveButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
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
                    }
                    else { // text fields
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
                            const username = yield getUsername();
                            const res = yield fetch(`/users/${username}`, {
                                method: 'POST',
                                body: formData,
                            });
                            const result = yield res.json();
                            alert(result.message);
                            fillProfile(username);
                        }
                        catch (error) {
                            const errorMsg = (error instanceof Error) ? error.message : String(error);
                            alert('Error updating profile:' + errorMsg);
                        }
                    }
                }));
            }
        });
        const twoFASwitch = document.getElementById('twofa-switch');
        if (twoFASwitch) {
            twoFASwitch.addEventListener('change', () => __awaiter(this, void 0, void 0, function* () {
                let isEnabled = twoFASwitch.checked;
                const endpoint = isEnabled ? '/auth/2fa/enable' : '/auth/2fa/disable';
                try {
                    const res = yield fetch(endpoint, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: yield getUsername() })
                    });
                    const data = yield res.json();
                    if (res.status === 200) {
                        alert(`2FA ${isEnabled ? 'enabled' : 'disabled'} successfully`);
                    }
                    else {
                        alert(data.error || 'Failed to update 2FA status');
                    }
                }
                catch (error) {
                    console.error('Error toggling 2FA:', error);
                    alert('Something went wrong');
                }
            }));
        }
        else {
            console.error("Failed to find the 2FA switch element in the DOM.");
        }
    });
}
export default displayDashboard;
