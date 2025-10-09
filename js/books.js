// js/books.js (مختص books.html)
requireAuthOrRedirect();

var listEl = document.querySelector("#booksList") || document.querySelector(".books-list") || document.querySelector("ul#books");
var loadingEl = document.querySelector("#booksLoading") || document.querySelector(".loading");
var errEl = document.querySelector("#booksError") || document.querySelector(".error");
var TTL_MS = 5 * 60 * 1000; // 5 دقیقه
var CACHE_KEY = "books_cache_v1";

function renderBooks(books) {
  if (!listEl) return;
  var html = "";
  var i = 0;
  if (!books || !books.length) {
    html = '<li>کتابی یافت نشد.</li>';
  } else {
    while (i < books.length) {
      var b = books[i];
      var id = b && (b.id != null ? b.id : b._id);
      var title = (b && (b.title || ""));
      var author = (b && (b.author || ""));
      var isbn = (b && (b.isbn || ""));
      var category = (b && (b.category || b.categoryName || ""));
      var count = (b && (b.availableCount != null ? b.availableCount : b.count));
      var disabled = !count || count <= 0;
      html += '<li class="book-item" data-id="' + id + '">'
           +  '<div class="info">'
           +    '<div class="t">' + title + '</div>'
           +    '<div class="m">نویسنده: ' + author + '</div>'
           +    '<div class="m">ISBN: ' + isbn + '</div>'
           +    '<div class="m">دسته: ' + category + '</div>'
           +    '<div class="m">موجودی: ' + (count != null ? count : "-") + '</div>'
           +  '</div>'
           +  '<div class="actions">'
           +    '<button class="borrowBtn" ' + (disabled ? 'disabled' : '') + '>امانت گرفتن</button>'
           +  '</div>'
           + '</li>';
      i++;
    }
  }
  listEl.innerHTML = html;
}

function loadBooksFromAPI(callback) {
  if (loadingEl) { loadingEl.style.display = "block"; try { if (!loadingEl.innerText) loadingEl.innerText = "در حال بارگذاری..."; } catch(e) {} }
  apiRequest("GET", "/books", null, true, function (books) {
    if (errEl) { try { errEl.style.display = "none"; errEl.innerText = ""; } catch(e) {} }
    cacheSet(CACHE_KEY, books);
    renderBooks(books);
    if (loadingEl) loadingEl.style.display = "none";
    if (callback) callback(books);
  }, function (err) {
    if (errEl) { errEl.innerText = "خطا در دریافت کتاب‌ها."; try { errEl.style.display = "block"; } catch(e) {} }
    if (loadingEl) loadingEl.style.display = "none";
  });
}

function initBooks() {
  var cached = cacheGetValid(CACHE_KEY, TTL_MS);
  if (cached) {
    renderBooks(cached);
    // در پس‌زمینه می‌توان تازه‌سازی کرد؛ اما برای سادگی دانشجویی، همین بس است.
  } else {
    loadBooksFromAPI();
  }
}

function borrowBook(bookId, btnEl) {
  if (!bookId) return;
  // POST /loans  با { bookId }
  apiRequest("POST", "/loans", { bookId: bookId }, true, function (res) {
    // موفق: دکمه را غیرفعال و موجودی را کم کنیم
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerText = "گرفته شد";
    }
    // کش را باطل کنیم تا بعداً تازه شود
    cacheInvalidate(CACHE_KEY);
    alert("کتاب ثبت شد. موفق باشید!");
  }, function (err) {
    alert("امانت گرفتن ناموفق.");
  });
}

// رویداد تفویضی برای دکمه‌های امانت
if (listEl) {
  listEl.addEventListener("click", function (e) {
    var t = e.target || e.srcElement;
    if (t && t.className && t.className.indexOf("borrowBtn") !== -1) {
      var li = t.closest ? t.closest("li") : null;
      if (!li) {
        // fallback: دستی والد را بیابیم
        var p = t.parentNode;
        while (p && p.tagName && p.tagName.toLowerCase() !== "li") { p = p.parentNode; }
        li = p;
      }
      var bookId = li && li.getAttribute("data-id");
      borrowBook(bookId, t);
    }
  });
}

initBooks();
setupLogout("#logoutBtn");
