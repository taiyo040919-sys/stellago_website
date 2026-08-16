document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  // 2027年度 入団申込フォームの公開ゲート(2026-09-01以降に表示)
  const applyOpenDate = new Date("2026-09-01T00:00:00+09:00");
  const applyPending = document.querySelector("[data-apply-pending]");
  const applyOpen = document.querySelector("[data-apply-open]");
  if (applyPending && applyOpen) {
    if (new Date() >= applyOpenDate) {
      applyPending.style.display = "none";
      applyOpen.style.display = "";
      // TODO: フォームURL発行後、recruit.html内の [data-apply-form-link] のhref="#" を実際のURLに差し替えること
    } else {
      applyPending.style.display = "";
      applyOpen.style.display = "none";
    }
  }

  const newsContainers = document.querySelectorAll("[data-news-list]");
  if (newsContainers.length) {
    fetch("assets/data/news.json")
      .then((res) => res.json())
      .then((items) => {
        items.sort((a, b) => (a.date < b.date ? 1 : -1));
        newsContainers.forEach((container) => {
          const limit = container.dataset.newsList === "home" ? 3 : items.length;
          const list = items.slice(0, limit);
          container.innerHTML = list
            .map(
              (item) => `
            <div class="news-item">
              <time datetime="${item.date}">${item.date.replace(/-/g, ".")}</time>
              <div>
                <span class="tag-label">${item.tag}</span>
                <h3>${item.title}</h3>
                <p>${item.body}</p>
              </div>
            </div>`
            )
            .join("");
        });
      })
      .catch(() => {
        newsContainers.forEach((c) => {
          c.innerHTML = '<p class="small-note">お知らせを読み込めませんでした。</p>';
        });
      });
  }
});
