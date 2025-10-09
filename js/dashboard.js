// js/dashboard.js (مختص dashboard.html)
requireAuthOrRedirect();

var nameEl = document.querySelector("#studentName") || document.querySelector(".student-name");
var statLoansEl = document.querySelector("#statActiveLoans") || document.querySelector(".stat-active-loans");
var statAvailEl = document.querySelector("#statAvailableBooks") || document.querySelector(".stat-available-books");
var loadingEl = document.querySelector("#dashLoading") || document.querySelector(".loading");

function loadProfileAndStats() {
  if (loadingEl) { loadingEl.style.display = "block"; try { if (!loadingEl.innerText) loadingEl.innerText = "در حال بارگذاری..."; } catch(e) {} }

  // 1) اطلاعات کاربر
  apiRequest("GET", "/auth/me", null, true, function (me) {
    var fullName = (me && (me.name || me.fullName || (me.user && me.user.name))) || "دانشجو";
    if (nameEl) nameEl.innerText = fullName;

    // 2) تعداد امانت‌های فعال
    apiRequest("GET", "/loans/my-loans", null, true, function (loans) {
      var count = 0;
      if (loans && loans.length) count = loans.length;
      if (statLoansEl) statLoansEl.innerText = count + "";
    }, function () {
      if (statLoansEl) statLoansEl.innerText = "-";
    });

    // 3) تعداد کتاب‌های موجود
    apiRequest("GET", "/books", null, true, function (books) {
      var available = 0;
      var i = 0;
      if (books && books.length) {
        while (i < books.length) {
          var b = books[i];
          var c = (b && (b.availableCount != null ? b.availableCount : b.count));
          if (typeof c === "number" && c > 0) { available += 1; }
          i++;
        }
      }
      if (statAvailEl) statAvailEl.innerText = available + "";
      if (loadingEl) loadingEl.style.display = "none";
    }, function () {
      if (statAvailEl) statAvailEl.innerText = "-";
      if (loadingEl) loadingEl.style.display = "none";
    });
  }, function () {
    if (nameEl) nameEl.innerText = "دانشجو";
    if (loadingEl) loadingEl.style.display = "none";
  });
}

loadProfileAndStats();
setupLogout("#logoutBtn");
