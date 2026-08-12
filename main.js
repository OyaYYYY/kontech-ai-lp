(() => {
  const config = document.getElementById("config");
  const LINE_URL = (config && config.dataset.lineUrl) || "#line";

  document.querySelectorAll(".line-link").forEach((el) => {
    el.setAttribute("href", LINE_URL);
    if (LINE_URL.startsWith("http")) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });

  const targets = document.querySelectorAll(".reveal-on-scroll");
  if (!("IntersectionObserver" in window) || !targets.length) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  targets.forEach((el) => observer.observe(el));
})();
