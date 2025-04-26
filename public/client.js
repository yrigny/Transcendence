import displayHome from "./displayHome.js";
import displayGame from "./displayGame.js";
import displayLogin from "./displayLogin.js";
import displayRegister from "./displayRegister.js";
import displayDashboard from "./displayDashboard.js";
import displayFriends from "./displayFriends.js";
import displayTournament from "./displayTournament.js";


const clearAllInjects = () => {
	const injectIds = [
		'home-inject',
		'game-inject',
		'tournament-inject',
		'dashboard-inject',
		'friends-inject',
		'login-inject',
		'register-inject',
	];
	injectIds.forEach(injectId => {
		document.getElementById(injectId).innerHTML = '';
	});
}

const render = async () => {
	clearAllInjects();

	const protectedRoutes = ['/game', '/dashboard', '/friends'];
    const currentPath = window.location.pathname;
    let isLoggedIn = false;
	try {
		const res = await fetch('http://localhost:6789/auth/status', 
			{ method: 'GET', credentials: 'include' });
		if (res.ok) {
			const data = await res.json();
			isLoggedIn = data.loggedIn === true;
		}
	} catch (error) {
		console.error('Failed to fetch auth status:', error);
	}

    // Redirect if trying to access protected route without login
    if (protectedRoutes.includes(currentPath) && !isLoggedIn) {
        window.history.pushState({}, '', '/login');
        displayLogin();
        return;
    }

	switch (currentPath) {
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
		case "/tournament":
			displayTournament();
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

function setupSpaNavigation() {
	const links = document.querySelectorAll('a[data-link]');
	links.forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			const targetPath = event.target.getAttribute('href');
			window.history.pushState({}, '', targetPath);
			render();
		});
	});
}

window.addEventListener('popstate', render);

updateAuthUI();
render();
setupSpaNavigation();
