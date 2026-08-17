document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => nav.classList.remove("open"));
    });
  }

  // ヘッダー: スクロールで軽いシャドウを付与
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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

  // トップページ hero: 写真スライドショー(assets/data/hero-photos.jsonを編集するだけで写真を追加・入替可能)
  const heroSlides = document.querySelector("[data-hero-slides]");
  if (heroSlides) {
    fetch("assets/data/hero-photos.json")
      .then((res) => res.json())
      .then((photos) => {
        if (!Array.isArray(photos) || !photos.length) return;
        photos.forEach((photo, i) => {
          const slide = document.createElement("div");
          slide.className = "hero-slide" + (i === 0 ? " is-active" : "");
          slide.style.backgroundImage = `url('${photo.src}')`;
          slide.setAttribute("role", "img");
          slide.setAttribute("aria-label", photo.alt || "");
          heroSlides.appendChild(slide);
        });
        const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (photos.length > 1 && !reduceMotion) {
          const slideEls = heroSlides.querySelectorAll(".hero-slide");
          let current = 0;
          setInterval(() => {
            slideEls[current].classList.remove("is-active");
            current = (current + 1) % slideEls.length;
            slideEls[current].classList.add("is-active");
          }, 5000);
        }
      })
      .catch(() => {
        heroSlides.style.backgroundImage = "url('assets/img/photo-dribble.jpg')";
        heroSlides.style.backgroundSize = "cover";
        heroSlides.style.backgroundPosition = "center";
      });
  }

  // お知らせ(カード形式)
  const newsContainers = document.querySelectorAll("[data-news-list]");
  if (newsContainers.length) {
    fetch("assets/data/news.json")
      .then((res) => res.json())
      .then((items) => {
        items.sort((a, b) => (a.date < b.date ? 1 : -1));
        newsContainers.forEach((container) => {
          const limit = container.dataset.newsList === "home" ? 3 : items.length;
          const list = items.slice(0, limit);
          if (!list.length) {
            container.innerHTML = '<p class="small-note">現在お知らせはありません。</p>';
            return;
          }
          container.innerHTML = list
            .map(
              (item) => `
            <article class="news-card" data-reveal>
              <div class="news-card-top">
                <span class="tag-label">${item.tag}</span>
                <time datetime="${item.date}">${item.date.replace(/-/g, ".")}</time>
              </div>
              <h3>${item.title}</h3>
              <p>${item.body}</p>
            </article>`
            )
            .join("");
          initReveal(container.querySelectorAll("[data-reveal]"));
        });
      })
      .catch(() => {
        newsContainers.forEach((c) => {
          c.innerHTML = '<p class="small-note">お知らせを読み込めませんでした。</p>';
        });
      });
  }

  // 試合情報(今後の予定 / 結果) — 一覧ページ用のカード表示
  const matchContainers = document.querySelectorAll("[data-match-list]");
  const tickerContainer = document.querySelector("[data-match-ticker]");
  if (matchContainers.length || tickerContainer) {
    fetch("assets/data/matches.json")
      .then((res) => res.json())
      .then((data) => {
        matchContainers.forEach((container) => {
          const kind = container.dataset.matchList; // "upcoming" or "results"
          let items = (data[kind] || []).slice();
          items.sort((a, b) => (kind === "upcoming" ? (a.date > b.date ? 1 : -1) : (a.date < b.date ? 1 : -1)));

          const limitAttr = container.dataset.matchLimit;
          const limit = !limitAttr || limitAttr === "all" ? items.length : parseInt(limitAttr, 10);
          items = items.slice(0, limit);

          if (!items.length) {
            container.innerHTML = `<p class="small-note">現在、${kind === "upcoming" ? "予定されている試合" : "掲載できる試合結果"}はありません。</p>`;
            return;
          }

          container.innerHTML = items.map((m) => matchItemHtml(m, kind)).join("");
        });

        // トップページ: NEXT MATCH / RESULT ミニチケット
        if (tickerContainer) {
          const upcoming = (data.upcoming || []).slice().sort((a, b) => (a.date > b.date ? 1 : -1));
          const results = (data.results || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
          const cards = [];
          if (upcoming[0]) cards.push(tickerCardHtml(upcoming[0], "upcoming", "NEXT MATCH"));
          if (upcoming[1]) cards.push(tickerCardHtml(upcoming[1], "upcoming", "NEXT MATCH"));
          if (results[0]) cards.push(tickerCardHtml(results[0], "result", "RESULT"));
          tickerContainer.innerHTML = cards.length
            ? cards.join("")
            : '<p class="small-note" style="color:rgba(255,255,255,0.6);">現在、表示できる試合情報はありません。</p>';
        }
      })
      .catch(() => {
        matchContainers.forEach((c) => {
          c.innerHTML = '<p class="small-note">試合情報を読み込めませんでした。</p>';
        });
        if (tickerContainer) {
          tickerContainer.innerHTML = '<p class="small-note" style="color:rgba(255,255,255,0.6);">試合情報を読み込めませんでした。</p>';
        }
      });
  }

  function matchItemHtml(m, kind) {
    const dateLabel = m.date.replace(/-/g, ".");
    if (kind === "upcoming") {
      return `
        <div class="match-item" data-reveal>
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
      <div class="match-item" data-reveal>
        <time datetime="${m.date}">${dateLabel}</time>
        <div class="match-body">
          <span class="tag-label">${m.competition}</span>
          <span class="result-badge ${resultClass}">${resultLabel}</span>
          <h3>vs ${m.opponent}</h3>
          <p class="match-meta">${m.venue}</p>
        </div>
        <div class="match-score">${m.scoreFor} - ${m.scoreAgainst}</div>
      </div>`;
  }

  function tickerCardHtml(m, kind, kicker) {
    const dateLabel = m.date.replace(/-/g, ".");
    if (kind === "upcoming") {
      return `
        <div class="ticker-card" data-reveal>
          <span class="ticker-kicker">${kicker}</span>
          <span class="ticker-date">${dateLabel}｜${m.competition}</span>
          <span class="ticker-opponent">vs ${m.opponent}</span>
          <span class="ticker-meta">${m.venue}${m.kickoff ? " ／ " + m.kickoff : ""}</span>
        </div>`;
    }
    const resultClass = m.result === "WIN" ? "win" : m.result === "LOSE" ? "lose" : "draw";
    const resultLabel = m.result === "WIN" ? "WIN" : m.result === "LOSE" ? "LOSE" : "DRAW";
    return `
      <div class="ticker-card" data-reveal>
        <span class="ticker-kicker">${kicker}</span>
        <span class="ticker-date">${dateLabel}｜${m.competition}</span>
        <span class="ticker-opponent">vs ${m.opponent}</span>
        <span class="ticker-score">${m.scoreFor} - ${m.scoreAgainst}</span>
        <span class="ticker-result ${resultClass}">${resultLabel}</span>
      </div>`;
  }

  // パートナー(未登録の場合は正直な募集中表示に切り替え)
  const partnerContainer = document.querySelector("[data-partner-list]");
  if (partnerContainer) {
    fetch("assets/data/partners.json")
      .then((res) => res.json())
      .then((partners) => {
        if (!Array.isArray(partners) || !partners.length) {
          partnerContainer.innerHTML = `
            <div class="partner-empty">
              <p>現在、STELLAGO ABOSHI SC U-15を応援いただけるパートナー企業様を募集しています。<br>掲載をご希望の企業様はお気軽にお問い合わせください。</p>
              <a href="contact.html" class="btn btn-dark btn-sm">お問い合わせページへ</a>
            </div>`;
          return;
        }
        partnerContainer.innerHTML = `
          <div class="partner-grid">
            ${partners
              .map(
                (p) => `<a href="${p.url || "#"}" target="_blank" rel="noopener"><img src="${p.logo}" alt="${p.name}"></a>`
              )
              .join("")}
          </div>`;
      })
      .catch(() => {
        partnerContainer.innerHTML = `
          <div class="partner-empty">
            <p>現在、STELLAGO ABOSHI SC U-15を応援いただけるパートナー企業様を募集しています。<br>掲載をご希望の企業様はお気軽にお問い合わせください。</p>
            <a href="contact.html" class="btn btn-dark btn-sm">お問い合わせページへ</a>
          </div>`;
      });
  }

  // スクロールで要素をふわっと表示(シンプルな演出)
  function initReveal(elements) {
    const els = elements || document.querySelectorAll("[data-reveal]:not(.is-visible)");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }
  initReveal(document.querySelectorAll("[data-reveal]"));
});
