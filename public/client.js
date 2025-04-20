import displayHome from "./displayHome.js";
import displayGame from "./displayGame.js";
import displayLogin from "./displayLogin.js";
import displayRegister from "./displayRegister.js";
import displayDashboard from "./displayDashboard.js";
import displayFriends from "./displayFriends.js";

const render = () => {
	switch (window.location.pathname) {
		case "/":
			displayHome();
			break;
		case "/home":
			displayHome();
			break;
		case "/game":
			displayGame();
			break;
		case "/login":
			displayLogin();
			break;
		case "/register":
			displayRegister();
			break;
		case "/dashboard":
			displayDashboard();
			break;
		case "/friends":
			displayFriends();
			break;
		default:
			displayHome();
			break;
	}
}

const updateAuthUI = async () => {
	let isLoggedIn = false
	let username = ''
	try {
		const res = await fetch('/auth/status', {
			method: 'GET',
			credentials: 'include'
		})
		if (res.ok) {
			const data = await res.json()
			isLoggedIn = data.loggedIn === true
			username = data.username + " 🟢 " || ''
		}
	} catch (error) {
		console.error('Login check failed:', error)
	}
	console.log('User logged in:', isLoggedIn, 'Username:', username)
	document.getElementById('logged-in-user').textContent = username
	document.getElementById('auth-buttons').style.display = isLoggedIn ? 'none' : 'block';
	document.getElementById('logout-section').style.display = isLoggedIn ? 'block' : 'none';
}

updateAuthUI();
render();

  