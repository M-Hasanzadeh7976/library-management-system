const token = localStorage.getItem('auth_token');
if (!token) {
	window.location.href = 'login.html';
}

async function authFetch(url, options = {}) {
	const headers = options.headers ? { ...options.headers } : {};
	headers['Authorization'] = `Bearer ${token}`;
	headers['Content-Type'] = 'application/json';

	const res = await fetch(
		`https://karyar-library-management-system.liara.run/api${url}`,
		{
			...options,
			headers,
		}
	);

	if (res.status === 401 || res.status === 403) {
		localStorage.removeItem('auth_token');
		window.location.href = 'login.html';
		throw new Error('Unauthorized');
	}

	return res;
}

const nameEl =
	document.querySelector('#studentName') ||
	document.querySelector('.student-name');
const userNameEl = document.querySelector('#userName');
const avatarEl = document.querySelector('#userAvatar');
const statLoansEl =
	document.querySelector('#activeLoans') ||
	document.querySelector('.stat-active-loans');
const statAvailEl =
	document.querySelector('#availableBooks') ||
	document.querySelector('.stat-available-books');
const loadingEl =
	document.querySelector('#dashLoading') || document.querySelector('.loading');

async function loadDashboard() {
	try {
		if (loadingEl) {
			loadingEl.style.display = 'block';
			loadingEl.innerText = 'در حال بارگذاری...';
		}

		const meRes = await authFetch('/auth/me');
		const meData = await meRes.json();

		console.log(meData);

		const user = meData.data.user || meData;

		if (user && user.firstName) {
			const fullName = `${user.firstName} ${user.lastName || ''}`.trim();

			if (nameEl) nameEl.innerText = fullName;
			if (userNameEl) userNameEl.innerText = fullName;
			if (avatarEl) avatarEl.innerText = user.firstName.charAt(0).toUpperCase();
		} else {
			if (nameEl) nameEl.innerText = 'کاربر ناشناس';
		}

		const loansRes = await authFetch('/loans/my-loans');
		const loansData = await loansRes.json();
		if (Array.isArray(loansData)) {
			if (statLoansEl) statLoansEl.innerText = loansData.length;
		}

		const booksRes = await authFetch('/books');
		const booksData = await booksRes.json();
		if (Array.isArray(booksData)) {
			const availableCount = booksData.filter(
				(b) => b.availableCount > 0 || b.count > 0
			).length;
			if (statAvailEl) statAvailEl.innerText = availableCount;
		}
	} catch (err) {
		console.error('Dashboard load error:', err);
		if (nameEl) nameEl.innerText = 'خطا در دریافت اطلاعات';
	} finally {
		if (loadingEl) loadingEl.style.display = 'none';
	}
}

function setupLogout(selector) {
	const logoutBtn = document.querySelector(selector);
	if (logoutBtn) {
		logoutBtn.addEventListener('click', (e) => {
			e.preventDefault();
			localStorage.removeItem('auth_token');
			window.location.href = 'login.html';
		});
	}
}

loadDashboard();
setupLogout('a[href="login.html"]');
