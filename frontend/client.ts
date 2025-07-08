// client.js
import displayHome from "./displayHome.js";
import displayGame from "./displayGame.js";
import displayLogin from "./displayLogin.js";
import displayRegister from "./displayRegister.js";
import displayDashboard from "./displayDashboard.js";
import displayFriends from "./displayFriends.js";
import displayTournament from "./displayTournament.js";

function clearAllInjects(): void {
	const injectIds = [
		'home-inject',
		'game-inject',
		'tournament-inject',
		'dashboard-inject',
		'friends-inject',
		'login-inject',
		'register-inject',
	];
	injectIds.forEach(id => {
		const elem = document.getElementById(id);
		if (elem) elem.innerHTML = '';
	});
}

async function render(): Promise<void> {
	clearAllInjects();

	const protectedRoutes = ['/game', '/dashboard', '/friends'];
	const currentPath = window.location.pathname;
	let isLoggedIn = false;
	try {
		const res = await fetch('/auth/status', 
			{ method: 'GET', credentials: 'include' });
		if (res.ok) {
			const data = await res.json();
			isLoggedIn = data.loggedIn === true;
		}
	} catch (error) {
		console.error('Failed to fetch auth status:', error);
	}
	// Redirect if trying to access protected route without login
	if (protectedRoutes.indexOf(currentPath) !== -1 && !isLoggedIn) {
		window.history.pushState({}, '', '/login');
		displayLogin();
		return;
	}
	switch (currentPath) {
		case "/":
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

async function updateAuthUI(): Promise<void> {
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
	
	const userElem = document.getElementById('logged-in-user');
	if (userElem) userElem.textContent = username;

	const authButtons = document.getElementById('auth-buttons');
	if (authButtons) authButtons.style.display = isLoggedIn ? 'none' : 'block';

	const logoutSection = document.getElementById('logout-section');
	if (logoutSection) logoutSection.style.display = isLoggedIn ? 'block' : 'none';
}

//avoid full page reload
function setupSpaNavigation(): void {
	const links = document.querySelectorAll<HTMLAnchorElement>('[data-link]'); //<a>
	links.forEach((link: HTMLAnchorElement) => {
		link.addEventListener('click', (event: MouseEvent) => {
			event.preventDefault();
			const href = link.getAttribute('href');
			if (href) {
				history.pushState(null, '', href);
				render();
			}
		});
	});
}
// Handle back/forward button navigation
window.addEventListener('popstate', () => {
	render();
});

updateAuthUI();
render();
setupSpaNavigation();
