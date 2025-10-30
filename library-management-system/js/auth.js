const form = document.querySelector('#loginForm');
const emailInput = document.querySelector('#email');
const passInput = document.querySelector('#password');
const errorBox = document.querySelector('#loginError');

function showError(msg) {
	if (errorBox) {
		errorBox.innerText = msg;
		errorBox.style.display = 'block';
	} else {
		alert(msg);
	}
}

form.addEventListener('submit', async (e) => {
	e.preventDefault();

	const email = emailInput.value.trim();
	const password = passInput.value.trim();

	if (!email || !password) return showError('ایمیل و رمز عبور را وارد کنید.');
	if (!email.includes('@') || !email.includes('.'))
		return showError('ایمیل نامعتبر است.');
	if (password.length < 4) return showError('رمز عبور حداقل ۴ کاراکتر باشد.');

	try {
		const btn = form.querySelector('button[type="submit"]');
		btn.disabled = true;
		btn.innerText = 'در حال ورود...';

		const res = await fetch(
			'https://karyar-library-management-system.liara.run/api/auth/login',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			}
		);

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.message || data.error || 'ورود ناموفق بود.');
		}

		const token = data.token || data.accessToken || data.jwt;
		if (!token) throw new Error('توکن از سرور دریافت نشد.');

		// ذخیره توکن در localStorage
		localStorage.setItem('auth_token', token);

		// انتقال به داشبورد
		window.location.href = 'dashboard.html';
	} catch (err) {
		showError(err.message);
	} finally {
		const btn = form.querySelector('button[type="submit"]');
		btn.disabled = false;
		btn.innerText = 'ورود';
	}
});
