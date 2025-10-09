// js/utils.js
// تنظیمات پایه
var API_BASE = "https://karyar-library-management-system.liara.run/api";
var TOKEN_COOKIE = "jwt_token";

// --- کوکی ساده ---
function setCookie(name, value, minutes) {
  var expires = "";
  if (minutes) {
    var d = new Date();
    d.setTime(d.getTime() + minutes * 60 * 1000);
    expires = "; expires=" + d.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}
function getCookie(name) {
  var cname = name + "=";
  var parts = document.cookie.split(";");
  for (var i = 0; i < parts.length; i++) {
    var c = parts[i].trim();
    if (c.indexOf(cname) === 0) return decodeURIComponent(c.substring(cname.length));
  }
  return "";
}
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

// --- درخواست HTTP با XMLHttpRequest (ساده) ---
function apiRequest(method, path, data, needAuth, onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, API_BASE + path, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  if (needAuth) {
    var token = getCookie(TOKEN_COOKIE);
    if (!token) {
      // اگر توکن نداریم و در صفحه لاگین نیستیم، هدایت شویم
      if (location.pathname.indexOf("login.html") === -1) {
        alert("برای ادامه باید وارد شوید.");
        location.href = "login.html";
      }
      return;
    }
    // هدر طبق توضیحات پروژه: Bearer <token>
    xhr.setRequestHeader("Authorization", "Bearer " + token);
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      var text = xhr.responseText || "{}";
      var json;
      try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onSuccess) onSuccess(json, xhr);
      } else {
        if (onError) onError(json, xhr);
      }
    }
  };
  xhr.onerror = function () {
    if (onError) onError({ message: "network error" }, xhr);
  };
  xhr.send(data ? JSON.stringify(data) : null);
}

// --- محافظت صفحات ---
function requireAuthOrRedirect() {
  if (!getCookie(TOKEN_COOKIE)) {
    alert("برای مشاهده این صفحه ابتدا وارد شوید.");
    location.href = "login.html";
  }
}
function redirectLoggedInAwayFromLogin() {
  if (getCookie(TOKEN_COOKIE)) {
    location.href = "dashboard.html";
  }
}

// --- خروج ---
function setupLogout(btnSelector) {
  var btn = document.querySelector(btnSelector);
  if (!btn) return;
  btn.addEventListener("click", function () {
    if (confirm("از حساب کاربری خارج می‌شوید؟")) {
      deleteCookie(TOKEN_COOKIE);
      location.href = "login.html";
    }
  });
}

// --- ابزارهای رابط کاربری ساده ---
function show(el) { if (el) el.style.display = ""; }
function hide(el) { if (el) el.style.display = "none"; }
function setText(el, text) { if (el) el.innerText = text; }

// --- کش ساده با localStorage ---
function cacheSet(key, value) {
  try {
    var data = { ts: Date.now(), value: value };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}
function cacheGetValid(key, ttlMs) {
  try {
    var raw = localStorage.getItem(key);
    if (!raw) return null;
    var obj = JSON.parse(raw);
    if (!obj || !obj.ts) return null;
    if (Date.now() - obj.ts > ttlMs) return null;
    return obj.value;
  } catch (e) { return null; }
}
function cacheInvalidate(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}
