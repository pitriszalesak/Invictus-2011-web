(() => {
  const liveHost = "pitriszalesak.github.io";
  const livePath = "/Invictus-2011-web/";
  const apiRoot = "https://api.counterapi.dev/v1";
  const namespace = "invictus-2011-web-traffic-v1-20260727";
  const sessionKey = "invictus-traffic-session-v1";
  const numberFormatter = new Intl.NumberFormat("cs-CZ");
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFormatter = new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague",
    hour: "2-digit",
    minute: "2-digit",
  });

  const dashboard = document.querySelector("[data-traffic-dashboard]");
  const isLiveWebsite = window.location.hostname === liveHost
    && window.location.pathname.startsWith(livePath);

  function counterUrl(name, action = "") {
    return `${apiRoot}/${namespace}/${encodeURIComponent(name)}/${action}`;
  }

  async function incrementCounter(name) {
    const response = await fetch(counterUrl(name, "up"), {
      cache: "no-store",
      keepalive: true,
    });
    if (!response.ok) throw new Error(`Counter update failed: ${response.status}`);
    return response.json();
  }

  async function readCounter(name) {
    const response = await fetch(counterUrl(name), { cache: "no-store" });
    if (!response.ok) throw new Error(`Counter read failed: ${response.status}`);
    const data = await response.json();
    const value = Number(data.count);
    if (!Number.isFinite(value)) throw new Error("Counter returned an invalid value");
    return value;
  }

  function isNewVisit() {
    try {
      if (window.sessionStorage.getItem(sessionKey)) return false;
      window.sessionStorage.setItem(sessionKey, "1");
      return true;
    } catch {
      return true;
    }
  }

  function setDashboardStatus(message, state) {
    if (!dashboard) return;
    dashboard.dataset.trafficState = state;
    const status = dashboard.querySelector("[data-traffic-status]");
    if (status) status.textContent = message;
  }

  function showDashboardValues(values) {
    if (!dashboard) return;
    Object.entries(values).forEach(([key, value]) => {
      const target = dashboard.querySelector(`[data-traffic-value="${key}"]`);
      if (target) target.textContent = numberFormatter.format(value);
    });

    const updated = dashboard.querySelector("[data-traffic-updated]");
    if (updated) {
      const now = new Date();
      updated.dateTime = now.toISOString();
      updated.textContent = `Aktualizováno v ${timeFormatter.format(now)}`;
    }
    dashboard.setAttribute("aria-busy", "false");
    setDashboardStatus("Měření je online", "ready");
  }

  async function refreshDashboard(counterNames) {
    if (!dashboard) return;
    try {
      const [today, month, total, pageviews] = await Promise.all([
        readCounter(counterNames.dayVisits),
        readCounter(counterNames.monthVisits),
        readCounter(counterNames.totalVisits),
        readCounter(counterNames.totalPageviews),
      ]);
      showDashboardValues({ today, month, total, pageviews });
    } catch {
      dashboard.setAttribute("aria-busy", "false");
      setDashboardStatus("Údaje jsou dočasně nedostupné", "error");
    }
  }

  if (!isLiveWebsite) {
    if (dashboard) {
      dashboard.setAttribute("aria-busy", "false");
      setDashboardStatus("Měření se spustí na živém webu", "preview");
    }
    return;
  }

  const today = dateFormatter.format(new Date());
  const month = today.slice(0, 7);
  const counterNames = {
    dayVisits: `visits-day-${today}`,
    monthVisits: `visits-month-${month}`,
    totalVisits: "visits-total",
    totalPageviews: "pageviews-total",
  };

  const updates = [incrementCounter(counterNames.totalPageviews)];
  if (isNewVisit()) {
    updates.push(
      incrementCounter(counterNames.dayVisits),
      incrementCounter(counterNames.monthVisits),
      incrementCounter(counterNames.totalVisits),
    );
  }

  Promise.allSettled(updates).then(() => refreshDashboard(counterNames));

  if (dashboard) {
    window.setInterval(() => {
      if (!document.hidden) refreshDashboard(counterNames);
    }, 30000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refreshDashboard(counterNames);
    });
  }
})();
