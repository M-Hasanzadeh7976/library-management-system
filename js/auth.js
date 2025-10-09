redirectLoggedInAwayFromLogin();

var form = document.querySelector("#loginForm") || document.querySelector("form");
var emailInput = document.querySelector("#email") || document.querySelector('input[type="email"]') || document.querySelector('input[name="email"]');
var passInput = document.querySelector("#password") || document.querySelector('input[type="password"]') || document.querySelector('input[name="password"]');
var btn = document.querySelector("#loginBtn") || (form ? form.querySelector('button[type="submit"]') : null);
var errorBox = document.querySelector("#loginError") || document.querySelector(".login-error");

function showError(msg) {
  if (errorBox) { errorBox.innerText = msg; errorBox.style.display = "block"; }
  else { alert(msg); }
}

function doLogin(evt) {
  if (evt && evt.preventDefault) evt.preventDefault();
  var email = emailInput ? (emailInput.value || "").trim() : "";
  var password = passInput ? (passInput.value || "").trim() : "";
  if (!email || !password) {
    showError("ایمیل و رمز عبور را وارد کنید.");
    return false;
  }
  if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
    showError("ایمیل نامعتبر است.");
    return false;
  }
  if (password.length < 4) {
    showError("رمز عبور حداقل ۴ کاراکتر باشد.");
    return false;
  }
  if (password.length < 4) {
    showError("رمز عبور حداقل ۴ کاراکتر باشد.");
    return false;
  }

  if (btn) { try { btn.disabled = true; btn.dataset._oldText = btn.innerText; btn.innerText = "در حال ورود..."; } catch(e) {} }
  // درخواست ورود: POST /auth/login (بدون نیاز به توکن)
  apiRequest("POST", "/auth/login", { email: email, password: password }, false, function (json) {
    var token = json.token || (json.data && json.data.token) || json.accessToken || json.jwt;
    if (!token) {
      showError("ورود ناموفق. پاسخ نامعتبر از سرور.");
      return;
    }
    setCookie(TOKEN_COOKIE, token, 60 * 24 * 3);
    location.href = "dashboard.html";
  }, function (err, xhr) {
    var msg = (err && (err.message || err.error || err.msg)) ? (err.message || err.error || err.msg) : "ورود ناموفق.";
    showError(msg);
    if (btn) { try { btn.disabled = false; btn.innerText = (btn.dataset._oldText || "ورود"); } catch(e) {} }
  });
  return false;
}

if (form) { form.addEventListener("submit", doLogin); }
if (btn) { btn.addEventListener("click", doLogin); }
