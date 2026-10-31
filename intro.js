(() => {
  const story = document.querySelector(".intro-story");
  const stage = document.querySelector(".intro-stage");

  if (!story || !stage) return;

  const header = document.querySelector("#site-header");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const feed = stage.querySelector(".intro-feed-scene");
  const company = stage.querySelector(".intro-company");
  const title = stage.querySelector(".intro-title-scene");
  const mountain = stage.querySelector(".intro-mountain");
  const clouds = {
    far: stage.querySelector(".intro-cloud-far"),
    side: stage.querySelector(".intro-cloud-side"),
    low: stage.querySelector(".intro-cloud-low"),
    near: stage.querySelector(".intro-cloud-near")
  };
  const wipe = stage.querySelector(".intro-wipe");
  const wipeClouds = [...stage.querySelectorAll(".wipe-cloud")];
  const scrollHint = stage.querySelector(".intro-scroll-hint");
  const progressLabel = stage.querySelector(".intro-progress span");
  const cutWords = [...stage.querySelectorAll(".cut-word")];
  const feedWords = [...stage.querySelectorAll(".intro-feed-title span")];

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, amount) => from + (to - from) * amount;
  const smooth = (value, start, end) => {
    const amount = clamp((value - start) / (end - start));
    return amount * amount * (3 - 2 * amount);
  };
  const fade = (value, inStart, inEnd, outStart, outEnd) => {
    return smooth(value, inStart, inEnd) * (1 - smooth(value, outStart, outEnd));
  };

  let pointerX = 0;
  let pointerY = 0;
  let rafId = 0;

  function setOpacity(element, value) {
    element.style.opacity = String(clamp(value));
  }

  function queueRender() {
    if (!rafId) rafId = requestAnimationFrame(render);
  }

  function render() {
    rafId = 0;
    const bounds = story.getBoundingClientRect();
    const scrollable = Math.max(story.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-bounds.top / scrollable);
    const pointerDepth = reduceMotion ? 0 : 1;
    const sceneX = pointerX * pointerDepth;
    const sceneY = pointerY * pointerDepth;
    const float = Math.sin(progress * Math.PI * 3) * 6;

    header.classList.toggle("intro-header", progress < .94);
    stage.dataset.phase = progress < .3 ? "company" : progress < .6 ? "feed" : progress < .88 ? "title" : "wipe";

    if (reduceMotion) {
      setOpacity(feed, 0);
      setOpacity(company, 1);
      setOpacity(title, 0);
      setOpacity(wipe, 0);
      setOpacity(mountain, .84);
      mountain.style.transform = "translate3d(-50%, 0, 0) scale(1.06)";
      scrollHint.style.opacity = "0";
      return;
    }

    const mountainFade = .38 + smooth(progress, .12, .28) * .17 + smooth(progress, .62, .79) * .25;
    setOpacity(mountain, mountainFade * (1 - smooth(progress, .93, .99)));
    mountain.style.transform = "translate3d(calc(-50% + " + (sceneX * 20) + "px), " + (lerp(18, -29, progress) + sceneY * 9) + "px, 0) scale(" + lerp(1.02, 1.23, smooth(progress, .58, .9)) + ")";

    const farOpacity = .46 * (1 - smooth(progress, .9, .99));
    setOpacity(clouds.far, farOpacity);
    clouds.far.style.transform = "translate3d(" + (lerp(-24, 87, progress) + sceneX * 13) + "px, " + (float + sceneY * 7) + "px, 0) scale(" + lerp(.95, 1.12, progress) + ")";

    const sideOpacity = .74 * (1 - smooth(progress, .89, .99));
    setOpacity(clouds.side, sideOpacity);
    clouds.side.style.transform = "translate3d(" + (lerp(16, -114, progress) + sceneX * 20) + "px, " + (lerp(-4, 46, progress) + sceneY * 12) + "px, 0) scale(" + lerp(.92, 1.18, smooth(progress, .46, .88)) + ")";

    const lowOpacity = .75 * (1 - smooth(progress, .88, .99));
    setOpacity(clouds.low, lowOpacity);
    clouds.low.style.transform = "translate3d(" + (lerp(-10, 134, progress) + sceneX * 29) + "px, " + (lerp(16, -60, progress) + sceneY * 16) + "px, 0) scale(" + lerp(.91, 1.21, smooth(progress, .5, .88)) + ")";

    const nearOpacity = .8 * (1 - smooth(progress, .87, .99));
    setOpacity(clouds.near, nearOpacity);
    clouds.near.style.transform = "translate3d(" + (lerp(12, -166, progress) + sceneX * 35) + "px, " + (lerp(13, -75, progress) + sceneY * 20) + "px, 0) scale(" + lerp(.9, 1.32, smooth(progress, .56, .9)) + ")";

    const feedOpacity = fade(progress, .29, .39, .51, .6);
    setOpacity(feed, feedOpacity);
    feed.style.transform = "translate3d(-50%, -50%, 0) translate3d(" + (sceneX * 6) + "px, " + (lerp(49, -53, smooth(progress, .31, .6)) + sceneY * 4) + "px, 0) scale(" + lerp(.8, 1.02, smooth(progress, .3, .47)) + ")";
    feedWords.forEach((word) => word.style.setProperty("--feed-x", (sceneX * 20 + progress * 66) + "px"));

    const companyOpacity = 1 - smooth(progress, .25, .34);
    setOpacity(company, companyOpacity);
    company.style.transform = "translate3d(-50%, -50%, 0) translate3d(" + (sceneX * 8) + "px, " + (lerp(22, -47, smooth(progress, 0, .34)) + sceneY * 4) + "px, 0) scale(" + lerp(.98, 1.02, smooth(progress, 0, .18)) + ")";

    const titleOpacity = fade(progress, .64, .71, .9, .95);
    setOpacity(title, titleOpacity);
    title.style.transform = "translate3d(-50%, -50%, 0) translate3d(0, " + lerp(56, -49, smooth(progress, .64, .95)) + "px, 0) scale(" + lerp(.82, 1.06, smooth(progress, .64, .82)) + ")";
    cutWords.forEach((word, index) => {
      const offset = index * .04;
      const outlineDraw = smooth(progress, .64 + offset, .755 + offset);
      const fillIn = smooth(progress, .735 + offset, .855 + offset);
      const outlineOut = smooth(progress, .845 + offset, .915 + offset);
      word.style.setProperty("--title-x", (progress * 108) + "px");
      word.style.setProperty("--title-y", (progress * 28) + "px");
      word.style.setProperty("--outline-edge", Math.round(outlineDraw * 100) + "%");
      word.style.setProperty("--outline-opacity", titleOpacity * (1 - outlineOut));
      word.style.setProperty("--fill-opacity", titleOpacity * fillIn);
      word.style.setProperty("--outline-x", "0px");
      word.style.setProperty("--outline-y", "0px");
      word.style.setProperty("--outline-scale", lerp(1.025, 1, smooth(progress, .64 + offset, .84 + offset)));
      word.style.setProperty("--fill-scale", lerp(.965, 1, fillIn));
    });

    const wipeProgress = smooth(progress, .85, .99);
    setOpacity(wipe, wipeProgress);
    wipe.style.transform = "scale(" + lerp(.64, 1.18, wipeProgress) + ")";
    wipeClouds[0].style.transform = "translate3d(" + lerp(-114, 94, wipeProgress) + "px, " + lerp(94, -26, wipeProgress) + "px, 0) scale(" + lerp(.78, 1.35, wipeProgress) + ")";
    wipeClouds[1].style.transform = "translate3d(" + lerp(128, -112, wipeProgress) + "px, " + lerp(84, -4, wipeProgress) + "px, 0) scale(" + lerp(.74, 1.4, wipeProgress) + ")";
    wipeClouds[2].style.transform = "translate3d(0, " + lerp(155, -95, wipeProgress) + "px, 0) scale(" + lerp(.72, 1.32, wipeProgress) + ")";

    scrollHint.style.opacity = String(1 - smooth(progress, .055, .15));
    progressLabel.textContent = "0" + Math.min(4, Math.max(1, Math.floor(progress * 4) + 1));
  }

  story.addEventListener("pointermove", (event) => {
    const bounds = stage.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width - .5;
    pointerY = (event.clientY - bounds.top) / bounds.height - .5;
    queueRender();
  });

  story.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
    queueRender();
  });

  window.addEventListener("scroll", queueRender, { passive: true });
  window.addEventListener("resize", queueRender);
  queueRender();
})();
