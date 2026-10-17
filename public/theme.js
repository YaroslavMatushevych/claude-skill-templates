// Applies the saved theme before the page paints, so there is no flash. "system" means: follow the computer.
(function () {
  try {
    var t = localStorage.getItem("jig-theme");
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  } catch (e) { /* storage may be blocked */ }
})();
