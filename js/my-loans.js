// js/my-loans.js (مختص my-loans.html)
requireAuthOrRedirect();

var listEl = document.querySelector("#loansList") || document.querySelector(".loans-list") || document.querySelector("ul#loans");
var statEl = document.querySelector("#loansCount") || document.querySelector(".loans-count");
var loadingEl = document.querySelector("#loansLoading") || document.querySelector(".loading");
var errEl = document.querySelector("#loansError") || document.querySelector(".error");

function renderLoans(loans) {
  if (statEl) statEl.innerText = (loans && loans.length ? loans.length : 0) + "";
  if (!listEl) return;
  var html = "";
  var i = 0;
  if (!loans || !loans.length) {
    html = "<li>امانتی‌ای ندارید.</li>";
  } else {
    while (i < loans.length) {
      var l = loans[i];
      var loanId = l && (l.id != null ? l.id : l._id);
      var book = l && l.book;
      var title = book && (book.title || "");
      var author = book && (book.author || "");
      var date = l && (l.loanDate || l.createdAt || "");
      html += '<li class="loan-item" data-id="' + loanId + '">'
           +   '<div class="info">'
           +     '<div class="t">' + title + '</div>'
           +     '<div class="m">نویسنده: ' + author + '</div>'
           +     '<div class="m">تاریخ امانت: ' + date + '</div>'
           +   '</div>'
           +   '<div class="actions">'
           +     '<button class="returnBtn">بازگرداندن</button>'
           +   '</div>'
           + '</li>';
      i++;
    }
  }
  listEl.innerHTML = html;
}

function loadLoans() {
  if (loadingEl) { loadingEl.style.display = "block"; try { if (!loadingEl.innerText) loadingEl.innerText = "در حال بارگذاری..."; } catch(e) {} }
  apiRequest("GET", "/loans/my-loans", null, true, function (loans) {
    if (errEl) { try { errEl.style.display = "none"; errEl.innerText = ""; } catch(e) {} }
    renderLoans(loans);
    if (loadingEl) loadingEl.style.display = "none";
  }, function () {
    if (errEl) { errEl.innerText = "خطا در دریافت امانت‌ها."; try { errEl.style.display = "block"; } catch(e) {} }
    if (loadingEl) loadingEl.style.display = "none";
  });
}

function returnLoan(loanId, btnEl) {
  if (!loanId) return;
  apiRequest("POST", "/loans/" + loanId + "/return", {}, true, function (res) {
    // حذف آیتم از UI
    var li = btnEl;
    // یافتن li
    if (li) {
      // اگر btnEl دکمه است، والد li را پیدا کنیم
      var p = li.parentNode;
      while (p && p.tagName && p.tagName.toLowerCase() !== "li") { p = p.parentNode; }
      li = p;
    }
    if (li && li.parentNode) {
      li.parentNode.removeChild(li);
    }
    alert("کتاب بازگردانده شد.");
    // شمارنده را به‌روز کنیم
    var items = listEl ? listEl.children.length : 0;
    if (statEl) statEl.innerText = items + "";
  }, function () {
    alert("بازگرداندن ناموفق.");
  });
}

if (listEl) {
  listEl.addEventListener("click", function (e) {
    var t = e.target || e.srcElement;
    if (t && t.className && t.className.indexOf("returnBtn") !== -1) {
      var li = t.closest ? t.closest("li") : null;
      if (!li) {
        var p = t.parentNode;
        while (p && p.tagName && p.tagName.toLowerCase() !== "li") { p = p.parentNode; }
        li = p;
      }
      var id = li && li.getAttribute("data-id");
      returnLoan(id, t);
    }
  });
}

loadLoans();
setupLogout("#logoutBtn");
