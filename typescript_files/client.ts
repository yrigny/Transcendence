import displayHome from "./displayHome";
// import displayGame from "./displayGame";
import displayLogin from "./displayLogin";
import displayRegister from "./displayRegister";
// import displayDashboard from "./displayDashboard";
// import displayFriends from "./displayFriends";
// import displayTournament from "./displayTournament";

const render = (): void => {
	switch (window.location.pathname) {
		case "/":
			displayHome();
			break;
		case "/home":
			displayHome();
			break;
		// case "/game":
		// 	displayGame();
		// 	break;
		case "/login":
			displayLogin();
			break;
		case "/register":
			displayRegister();
			break;
		// case "/dashboard":
		// 	displayDashboard();
		// 	break;
		// case "/friends":
		// 	displayFriends();
		// 	break;
		// case "/tournament":
		// 	displayTournament();
		// 	break;
		default:
			displayHome();
			break;
	}
}

const updateAuthUI = async (): Promise<void> => {
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
	console.log('User logged in:', isLoggedIn, 'Username:', username);

	console.log('User logged in:', isLoggedIn, 'Username:', username)
	
	const userElem = document.getElementById('logged-in-user');
	if (userElem) userElem.textContent = username;

	const authButtons = document.getElementById('auth-buttons');
	if (authButtons) authButtons.style.display = isLoggedIn ? 'none' : 'block';

	const logoutSection = document.getElementById('logout-section');
	if (logoutSection) logoutSection.style.display = isLoggedIn ? 'block' : 'none';
}

updateAuthUI();
render();

  