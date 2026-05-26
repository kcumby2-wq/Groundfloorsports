(function () {
  function applyStaticPreviewRouteMap(routeMap) {
    if (window.location.protocol !== "file:") return;

    document.querySelectorAll('a[href^="/"]').forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var mapped = routeMap[href];
      if (mapped) {
        link.setAttribute("href", mapped);
      }
    });
  }

  function debounce(fn, waitMs) {
    var delay = typeof waitMs === "number" ? waitMs : 250;
    var timer = null;
    var lastArgs = null;
    var lastThis = null;

    function run() {
      timer = null;
      fn.apply(lastThis, lastArgs || []);
      lastArgs = null;
      lastThis = null;
    }

    function debounced() {
      lastArgs = Array.prototype.slice.call(arguments);
      lastThis = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, delay);
    }

    debounced.cancel = function () {
      if (timer) clearTimeout(timer);
      timer = null;
      lastArgs = null;
      lastThis = null;
    };

    debounced.flush = function () {
      if (!timer) return;
      clearTimeout(timer);
      run();
    };

    return debounced;
  }

  window.SubjectreportUtils = window.SubjectreportUtils || {};
  window.SubjectreportUtils.applyStaticPreviewRouteMap = applyStaticPreviewRouteMap;
  window.SubjectreportUtils.debounce = debounce;
})();
