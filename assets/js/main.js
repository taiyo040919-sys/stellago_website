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

  // 試合情報(今後の予定 / 結果)
  const matchContainers = document.querySelectorAll("[data-match-list]");
  if (matchContainers.length) {
    fetch("assets/data/matches.json")
      .then((res) => res.json())
      .then((data) => {
        matchContainers.forEach((container) => {
          const kind = container.dataset.matchList; // "upcoming" or "results"
          let items = (data[kind] || []).slice();

          // upcoming: 日付が近い順(昇順) / results: 新しい順(降順)
          items.sort((a, b) => (kind === "upcoming" ? (a.date > b.date ? 1 : -1) : (a.date < b.date ? 1 : -1)));

          const limitAttr = container.dataset.matchLimit;
          const limit = !limitAttr || limitAttr === "all" ? items.length : parseInt(limitAttr, 10);
          items = items.slice(0, limit);

          if (!items.length) {
            container.innerHTML = `<p class="small-note">現在、${kind === "upcoming" ? "予定されている試合" : "掲載できる試合結果"}はありません。</p>`;
            return;
          }

          container.innerHTML = items
            .map((m) => {
              const dateLabel = m.date.replace(/-/g, ".");
              if (kind === "upcoming") {
                return `
            <div class="match-item">
              <time datetime="${m.date}">${dateLabel}</time>
              <div class="match-body">
                <span class="tag-label">${m.competition}</span>
                <h3>vs ${m.opponent}</h3>
                <p class="match-meta">${m.venue}${m.kickoff ? " ／ " + m.kickoff : ""}</p>
                ${m.note ? `<p class="match-note">${m.note}</p>` : ""}
              </div>
            </div>`;
              }
              const resultClass = m.result === "WIN" ? "win" : m.result === "LOSE" ? "lose" : "draw";
              const resultLabel = m.result === "WIN" ? "勝" : m.result === "LOSE" ? "敗" : "分";
              return `
            <div class="match-item">
              <time datetime="${m.date}">${dateLabel}</time>
              <div class="match-body">
                <span class="tag-label">${m.competition}</span>
                <span class="result-badge ${resultClass}">${resultLabel}</span>
                <h3>vs ${m.opponent}</h3>
                <p class="match-meta">${m.venue}</p>
              </div>
              <div class="match-score">${m.scoreFor} - ${m.scoreAgainst}</div>
            </div>`;
            })
            .join("");
        });
      })
      .catch(() => {
        matchContainers.forEach((c) => {
          c.innerHTML = '<p class="small-note">試合情報を読み込めませんでした。</p>';
        });
      });
  }
});
