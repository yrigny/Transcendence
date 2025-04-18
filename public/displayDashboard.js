
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
			document.addEventListener('DOMContentLoaded', fillData());
		})
		.catch(error => {
			console.error('Failed to fetch dashboard.html:', error);
		});
}

async function fillUserData() {
	try {
		const res = await fetch('/auth/status', {
			method: 'GET',
			credentials: 'include'
		})
		const data = await res.json()
		if (data.loggedIn === true) {
			// search for the user in the database
			const user = await fetch(`/users/${data.username}`, {
				method: 'GET',
				credentials: 'include'
			})
			const userData = await user.json()
			if (userData) {
				const name = document.getElementById('username-display');
				const email = document.getElementById('email-display');
				const avatar = document.getElementById('avatar-display');
				name.textContent = userData.name;
				// email.textContent = userData.email;
				avatar.src = `/uploads/${userData.avatar}`;
			}

		}
	} catch (error) {
		console.error('Login check failed:', error)
	}
}

async function fillData() {
	console.log('Filling data...');
	fillUserData();
	const editButtons = document.querySelectorAll('.px-4.py-1 button');

	// Add click event listeners to each edit button
	editButtons.forEach(button => {
		button.addEventListener('click', function() {
			const infoDiv = this.parentElement.parentElement;
			const fieldType = infoDiv.querySelector('dt').textContent.trim().toLowerCase();
			const valueElement = infoDiv.querySelector(fieldType === 'avatar' ? 'img' : 'dd');
			const inputField = valueElement.parentElement.querySelector('input');
			const saveButton = document.getElementById(fieldType + '-save');
			const cancelButton = document.getElementById(fieldType + '-cancel');

			this.classList.add('hidden');
			saveButton.classList.remove('hidden');
			cancelButton.classList.remove('hidden');
			valueElement.classList.add('hidden');
			inputField.classList.remove('hidden');

			cancelButton.addEventListener('click', function() {
				inputField.value = '';
				inputField.classList.add('hidden');
				valueElement.classList.remove('hidden');
				saveButton.classList.add('hidden');
				cancelButton.classList.add('hidden');
				button.classList.remove('hidden');
			})

			saveButton.addEventListener('click', async function() {
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
				} else {
					newValue = inputField.value.trim();
					if (newValue === '') {
						alert(`${fieldType} cannot be empty`);
					}
					else {
						formData = new FormData();
						formData.append(fieldType, newValue);
					}
				}
				// try {
				// 	const response = await fetch('/updateProfile', {
				// 		method: 'POST',
				// 		body: formData
				// 	});
				// 	if (!response.ok) {
				// 		throw new Error('Network response was not ok');
				// 	}
				// 	const result = await response.json();
				// 	console.log(result);
				// } catch (error) {
				// 	console.error('Error updating profile:', error);
				// }

				inputField.classList.add('hidden');
				valueElement.classList.remove('hidden');
				saveButton.classList.add('hidden');
				cancelButton.classList.add('hidden');
				button.classList.remove('hidden');
			});
		})
	})
}

export default displayDashboard