const storage = typeof window !== "undefined" ? window.localStorage : null;

const today = new Date();
const toDateInput = (date) => date.toISOString().slice(0, 10);
const toDateTimeInput = (date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};
const addDays = (days, hour = 9, minute = 0) => {
  const date = new Date(today);
  date.setDate(today.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const createId = (prefix) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });

const getInitials = (name) =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CL";

const parsePercent = (value) => {
  const parsed = Number.parseFloat(String(value).replace("%", ""));
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 100) : 0;
};

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
};

const formatDate = (value) => {
  if (!value) return "No date";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const createStore = (key, defaults, normalize) => ({
  getAll() {
    if (!storage) return defaults.map(normalize);

    try {
      const storedValue = storage.getItem(key);
      if (storedValue === null) return defaults.map(normalize);

      const storedItems = JSON.parse(storedValue);
      if (!Array.isArray(storedItems)) return defaults.map(normalize);
      return storedItems.map(normalize);
    } catch {
      return defaults.map(normalize);
    }
  },
  saveAll(items) {
    if (!storage) return;
    storage.setItem(key, JSON.stringify(items.map(normalize)));
  },
  create(items, item) {
    const nextItem = normalize({ ...item, id: item.id || createId(key) });
    const nextItems = [nextItem, ...items];
    this.saveAll(nextItems);
    return { item: nextItem, items: nextItems };
  },
  update(items, id, updates) {
    const nextItems = items.map((item) => (item.id === id ? normalize({ ...item, ...updates, id }) : item));
    this.saveAll(nextItems);
    return nextItems;
  },
  delete(items, id) {
    const nextItems = items.filter((item) => item.id !== id);
    this.saveAll(nextItems);
    return nextItems;
  }
});

const defaultClients = [
  {
    id: "client-maya",
    name: "Maya Chen",
    level: "Intermediate",
    goal: "Build lower-body strength while maintaining weekly conditioning.",
    progress: "72%",
    attendance: "94%",
    status: "Ready",
    note: "Knee feels stable. Increase goblet squat volume before moving back to heavy front squats."
  },
  {
    id: "client-jon",
    name: "Jon Bell",
    level: "Beginner",
    goal: "Lose 8 kg and build a consistent training rhythm.",
    progress: "48%",
    attendance: "81%",
    status: "Review",
    note: "Energy dipped after late shifts. Keep plan simple this week and prioritize sleep consistency."
  },
  {
    id: "client-sofia",
    name: "Sofia Cruz",
    level: "Advanced",
    goal: "Improve squat and deadlift performance before the autumn meet.",
    progress: "86%",
    attendance: "97%",
    status: "PR day",
    note: "Bar speed looks strong. Test squat single only if warm-up sets stay crisp."
  },
  {
    id: "client-andre",
    name: "Andre Ramos",
    level: "Intermediate",
    goal: "Rebuild shoulder confidence and return to full upper-body training.",
    progress: "61%",
    attendance: "88%",
    status: "Active",
    note: "Avoid overhead pressing this block. Landmine press and tempo rows are moving well."
  }
];

const defaultWorkouts = [
  {
    id: "workout-lower-strength",
    name: "Lower Strength A",
    focus: "Squat and hinge strength with controlled unilateral volume.",
    clientIds: ["client-maya", "client-sofia"],
    exercises: [
      { id: "ex-trap", name: "Trap Bar Deadlift", sets: "4 sets", reps: "5 reps", notes: "150 sec rest" },
      { id: "ex-split", name: "Bulgarian Split Squat", sets: "3 sets", reps: "8 each", notes: "90 sec rest" },
      { id: "ex-hip", name: "Hip Thrust", sets: "3 sets", reps: "10 reps", notes: "75 sec rest" }
    ]
  },
  {
    id: "workout-engine",
    name: "Engine Builder",
    focus: "Conditioning intervals with posterior-chain accessories.",
    clientIds: ["client-jon"],
    exercises: [
      { id: "ex-bike", name: "Bike Intervals", sets: "8 rounds", reps: "40 sec hard", notes: "80 sec easy" },
      { id: "ex-swing", name: "Kettlebell Swing", sets: "4 sets", reps: "15 reps", notes: "Smooth tempo" }
    ]
  },
  {
    id: "workout-upper-rebuild",
    name: "Upper Rebuild",
    focus: "Shoulder-friendly pressing and pulling volume.",
    clientIds: ["client-andre"],
    exercises: [
      { id: "ex-landmine", name: "Landmine Press", sets: "3 sets", reps: "8 each", notes: "Pain-free range" },
      { id: "ex-row", name: "Tempo Cable Row", sets: "4 sets", reps: "10 reps", notes: "3 sec eccentric" }
    ]
  }
];

const defaultSessions = [
  {
    id: "session-maya",
    clientId: "client-maya",
    startsAt: toDateTimeInput(addDays(0, 8, 0)),
    type: "Lower Strength A",
    notes: "Review deadlift bar speed before adding load.",
    status: "scheduled"
  },
  {
    id: "session-jon",
    clientId: "client-jon",
    startsAt: toDateTimeInput(addDays(0, 11, 30)),
    type: "Mobility + deload",
    notes: "Keep intensity low after late shifts.",
    status: "scheduled"
  },
  {
    id: "session-sofia",
    clientId: "client-sofia",
    startsAt: toDateTimeInput(addDays(1, 17, 0)),
    type: "Squat PR testing",
    notes: "Only test if warm-up sets stay crisp.",
    status: "scheduled"
  },
  {
    id: "session-andre",
    clientId: "client-andre",
    startsAt: toDateTimeInput(addDays(-2, 9, 0)),
    type: "Upper rebuild",
    notes: "Completed pain-free rows and carries.",
    status: "completed"
  }
];

const defaultProgress = [
  {
    id: "progress-maya-1",
    clientId: "client-maya",
    date: toDateInput(addDays(-21)),
    progress: 58,
    weight: "",
    measurement: "Goblet squat 24 kg",
    note: "Volume tolerance improving."
  },
  {
    id: "progress-maya-2",
    clientId: "client-maya",
    date: toDateInput(addDays(-7)),
    progress: 72,
    weight: "",
    measurement: "Trap bar 95 kg",
    note: "Knee feels stable."
  },
  {
    id: "progress-jon-1",
    clientId: "client-jon",
    date: toDateInput(addDays(-14)),
    progress: 38,
    weight: "91 kg",
    measurement: "2 workouts completed",
    note: "Sleep disrupted."
  },
  {
    id: "progress-jon-2",
    clientId: "client-jon",
    date: toDateInput(addDays(-3)),
    progress: 48,
    weight: "90 kg",
    measurement: "3 walks completed",
    note: "Consistency returning."
  }
];

const defaultCheckins = [
  {
    id: "checkin-jon",
    clientId: "client-jon",
    createdAt: toDateTimeInput(addDays(-1, 18, 15)),
    message: "Sleep was rough, but completed two workouts.",
    reply: "",
    status: "open"
  },
  {
    id: "checkin-maya",
    clientId: "client-maya",
    createdAt: toDateTimeInput(addDays(-2, 10, 20)),
    message: "Meals and training felt consistent this week.",
    reply: "Good trend. Keep hydration high before Friday.",
    status: "resolved"
  },
  {
    id: "checkin-andre",
    clientId: "client-andre",
    createdAt: toDateTimeInput(addDays(0, 7, 45)),
    message: "Shoulder feels good after rows. Can we add pressing soon?",
    reply: "",
    status: "open"
  }
];

const normalizeClient = (client) => {
  const name = String(client.name || "Unnamed Client").trim() || "Unnamed Client";
  return {
    id: client.id || createId("client"),
    initials: client.initials || getInitials(name),
    name,
    level: String(client.level || "Beginner"),
    goal: String(client.goal || "No goal set yet."),
    progress: `${parsePercent(client.progress)}%`,
    attendance: String(client.attendance || "New"),
    status: String(client.status || "Active"),
    note: String(client.note || "No coaching note yet.")
  };
};

const normalizeWorkout = (workout) => ({
  id: workout.id || createId("workout"),
  name: String(workout.name || "Untitled Plan").trim() || "Untitled Plan",
  focus: String(workout.focus || "No plan focus yet."),
  clientIds: Array.isArray(workout.clientIds) ? workout.clientIds : [],
  exercises: Array.isArray(workout.exercises)
    ? workout.exercises.map((exercise) => ({
        id: exercise.id || createId("exercise"),
        name: String(exercise.name || "Exercise").trim() || "Exercise",
        sets: String(exercise.sets || ""),
        reps: String(exercise.reps || ""),
        notes: String(exercise.notes || "")
      }))
    : []
});

const normalizeSession = (session) => ({
  id: session.id || createId("session"),
  clientId: String(session.clientId || ""),
  startsAt: String(session.startsAt || toDateTimeInput(new Date())),
  type: String(session.type || "Training session"),
  notes: String(session.notes || ""),
  status: ["scheduled", "completed", "cancelled"].includes(session.status) ? session.status : "scheduled"
});

const normalizeProgress = (entry) => ({
  id: entry.id || createId("progress"),
  clientId: String(entry.clientId || ""),
  date: String(entry.date || toDateInput(new Date())),
  progress: parsePercent(entry.progress),
  weight: String(entry.weight || ""),
  measurement: String(entry.measurement || ""),
  note: String(entry.note || "")
});

const normalizeCheckin = (checkin) => ({
  id: checkin.id || createId("checkin"),
  clientId: String(checkin.clientId || ""),
  createdAt: String(checkin.createdAt || toDateTimeInput(new Date())),
  message: String(checkin.message || ""),
  reply: String(checkin.reply || ""),
  status: checkin.status === "resolved" ? "resolved" : "open"
});

const stores = {
  clients: createStore("trainly.clients.v1", defaultClients, normalizeClient),
  workouts: createStore("trainly.workouts.v1", defaultWorkouts, normalizeWorkout),
  sessions: createStore("trainly.sessions.v1", defaultSessions, normalizeSession),
  progress: createStore("trainly.progress.v1", defaultProgress, normalizeProgress),
  checkins: createStore("trainly.checkins.v1", defaultCheckins, normalizeCheckin)
};

let clients = stores.clients.getAll();
let workouts = stores.workouts.getAll();
let sessions = stores.sessions.getAll();
let progressEntries = stores.progress.getAll();
let checkins = stores.checkins.getAll();
let activeClientId = clients[0]?.id ?? null;
let activeWorkoutId = workouts[0]?.id ?? null;
let progressClientId = clients[0]?.id ?? "";
let currentView = "dashboard";
let sessionFilter = "upcoming";
let checkinFilter = "open";
let drawerContext = null;

const canonicalClientNames = {
  "client-maya": "Maya Chen",
  "client-jon": "Jon Bell",
  "client-sofia": "Sofia Cruz",
  "client-andre": "Andre Ramos"
};

const reconcileClientReferences = () => {
  const clientIds = new Set(clients.map((client) => client.id));
  const clientByName = new Map(clients.map((client) => [client.name.toLowerCase(), client.id]));
  const resolveClientId = (clientId) => {
    if (clientIds.has(clientId)) return clientId;
    const canonicalName = canonicalClientNames[clientId];
    return canonicalName ? clientByName.get(canonicalName.toLowerCase()) || clientId : clientId;
  };

  sessions = sessions.map((session) => ({ ...session, clientId: resolveClientId(session.clientId) }));
  progressEntries = progressEntries.map((entry) => ({ ...entry, clientId: resolveClientId(entry.clientId) }));
  checkins = checkins.map((checkin) => ({ ...checkin, clientId: resolveClientId(checkin.clientId) }));
  workouts = workouts.map((workout) => ({
    ...workout,
    clientIds: workout.clientIds.map(resolveClientId)
  }));

  stores.sessions.saveAll(sessions);
  stores.progress.saveAll(progressEntries);
  stores.checkins.saveAll(checkins);
  stores.workouts.saveAll(workouts);
};

reconcileClientReferences();

const elements = {
  sidebar: document.querySelector("[data-sidebar]"),
  search: document.querySelector("[data-search]"),
  quickAdd: document.querySelector("[data-quick-add]"),
  drawer: document.querySelector("[data-drawer]"),
  drawerTitle: document.querySelector("[data-drawer-title]"),
  drawerForm: document.querySelector("[data-drawer-form]"),
  clientList: document.querySelector("[data-client-list]"),
  clientProfile: document.querySelector("[data-client-profile]"),
  workoutList: document.querySelector("[data-workout-list]"),
  workoutDetail: document.querySelector("[data-workout-detail]"),
  sessionGrid: document.querySelector("[data-session-grid]"),
  progressClient: document.querySelector("[data-progress-client]"),
  progressChart: document.querySelector("[data-progress-chart]"),
  progressChartTitle: document.querySelector("[data-progress-chart-title]"),
  progressChartMeta: document.querySelector("[data-progress-chart-meta]"),
  progressList: document.querySelector("[data-progress-list]"),
  checkinGrid: document.querySelector("[data-checkin-grid]"),
  dashboardFocus: document.querySelector("[data-dashboard-focus]"),
  dashboardSpotlight: document.querySelector("[data-dashboard-spotlight]"),
  dashboardCheckins: document.querySelector("[data-dashboard-checkins]"),
  dashboardOpenCount: document.querySelector("[data-dashboard-open-count]"),
  dashboardReadiness: document.querySelector("[data-dashboard-readiness]"),
  dashboardReadinessMeter: document.querySelector("[data-dashboard-readiness-meter]"),
  focusCount: document.querySelector("[data-focus-count]"),
  coachCount: document.querySelector("[data-coach-count]"),
  activeClients: document.querySelector("[data-active-clients]"),
  clientMetricDetail: document.querySelector("[data-client-metric-detail]"),
  upcomingSessions: document.querySelector("[data-upcoming-sessions]"),
  averageProgress: document.querySelector("[data-average-progress]"),
  openCheckins: document.querySelector("[data-open-checkins]")
};

const views = Array.from(document.querySelectorAll("[data-view]"));
const viewNames = new Set(views.map((view) => view.dataset.view));
const viewLinks = Array.from(document.querySelectorAll("[data-nav-link], [data-view-link]"));

const getClient = (id) => clients.find((client) => client.id === id) || null;
const getClientName = (id) => getClient(id)?.name || "Unassigned client";
const getQuery = () => elements.search.value.trim().toLowerCase();
const textIncludesQuery = (...values) => values.join(" ").toLowerCase().includes(getQuery());
const getStatusTone = (status) => {
  const normalizedStatus = String(status).toLowerCase();
  if (normalizedStatus.includes("cancel") || normalizedStatus.includes("open") || normalizedStatus.includes("new")) return "coral";
  if (normalizedStatus.includes("review") || normalizedStatus.includes("pending") || normalizedStatus.includes("scheduled")) return "amber";
  if (normalizedStatus.includes("pr") || normalizedStatus.includes("focus")) return "blue";
  return "green";
};

const getUpcomingSessions = (days = 7) => {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(now.getDate() + days);
  return sessions
    .filter((session) => {
      const date = new Date(session.startsAt);
      return session.status === "scheduled" && date >= now && date <= horizon;
    })
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
};

const getNextSession = (clientId) => {
  const now = new Date();
  return sessions
    .filter((session) => session.clientId === clientId && session.status === "scheduled" && new Date(session.startsAt) >= now)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0];
};

const getAssignedWorkouts = (clientId) => workouts.filter((workout) => workout.clientIds.includes(clientId));

const getLatestProgress = (clientId) =>
  progressEntries
    .filter((entry) => entry.clientId === clientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

const syncClientProgress = (clientId) => {
  const latestProgress = getLatestProgress(clientId);
  if (!latestProgress) return;
  clients = stores.clients.update(clients, clientId, { progress: `${latestProgress.progress}%` });
};

const emptyState = (message, actionLabel, action) => {
  const button = actionLabel ? `<button class="mini-button" type="button" data-action="${action}">${escapeHtml(actionLabel)}</button>` : "";
  return `<article class="empty-state"><strong>${escapeHtml(message)}</strong>${button}</article>`;
};

const clientOptions = (selectedId = "") =>
  clients
    .map((client) => `<option value="${escapeHtml(client.id)}"${client.id === selectedId ? " selected" : ""}>${escapeHtml(client.name)}</option>`)
    .join("");

const clientCheckboxes = (selectedIds = []) =>
  clients
    .map(
      (client) => `
        <label class="check-row">
          <input type="checkbox" name="clientIds" value="${escapeHtml(client.id)}"${selectedIds.includes(client.id) ? " checked" : ""} />
          <span>${escapeHtml(client.name)}</span>
        </label>
      `
    )
    .join("");

const exercisesToText = (exercises) =>
  exercises.map((exercise) => [exercise.name, exercise.sets, exercise.reps, exercise.notes].join(" | ")).join("\n");

const parseExercises = (value) =>
  String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, sets = "", reps = "", notes = ""] = line.split("|").map((part) => part.trim());
      return { id: createId("exercise"), name, sets, reps, notes };
    });

const getViewFromHash = () => {
  const viewName = window.location.hash.replace("#", "") || "dashboard";
  return viewNames.has(viewName) ? viewName : "dashboard";
};

const setActiveView = (viewName, options = {}) => {
  currentView = viewNames.has(viewName) ? viewName : "dashboard";

  views.forEach((view) => {
    view.hidden = view.dataset.view !== currentView;
  });

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentView}`);
  });

  if (options.updateHash && window.location.hash !== `#${currentView}`) {
    window.history.pushState(null, "", `#${currentView}`);
  }

  elements.quickAdd.textContent =
    currentView === "workouts"
      ? "New Plan"
      : currentView === "sessions"
        ? "New Session"
        : currentView === "progress"
          ? "New Entry"
          : currentView === "checkins"
            ? "New Check-in"
            : "New Client";

  elements.sidebar.classList.remove("open");
  window.scrollTo(0, 0);
  renderAll();
};

const showError = (message) => {
  const error = elements.drawerForm.querySelector("[data-form-error]");
  if (error) error.textContent = message;
};

const validateDrawerForm = () => {
  const requiredFields = Array.from(elements.drawerForm.querySelectorAll("[required]"));
  const invalidField = requiredFields.find((field) => !String(field.value).trim());
  elements.drawerForm.querySelectorAll(".invalid").forEach((field) => field.classList.remove("invalid"));

  if (invalidField) {
    invalidField.classList.add("invalid");
    invalidField.focus();
    showError("Fill out the required fields before saving.");
    return false;
  }

  showError("");
  return true;
};

const openDrawer = ({ title, submitLabel, mode, item = null, body }) => {
  drawerContext = { mode, item };
  elements.drawerTitle.textContent = title;
  elements.drawerForm.innerHTML = `
    ${body}
    <p class="form-error" data-form-error aria-live="polite"></p>
    <div class="drawer-actions">
      <button class="secondary-action" type="button" data-cancel-drawer>Cancel</button>
      <button class="primary-action" type="submit">${escapeHtml(submitLabel)}</button>
    </div>
  `;
  elements.drawer.hidden = false;
  elements.drawer.setAttribute("aria-hidden", "false");
  elements.drawerForm.querySelector("input, select, textarea")?.focus();
};

const closeDrawer = () => {
  elements.drawer.hidden = true;
  elements.drawer.setAttribute("aria-hidden", "true");
  elements.drawerForm.innerHTML = "";
  drawerContext = null;
};

const renderDashboard = () => {
  const upcoming = getUpcomingSessions(7);
  const average = clients.length
    ? Math.round(clients.reduce((total, client) => total + parsePercent(client.progress), 0) / clients.length)
    : 0;
  const openCheckins = checkins
    .filter((checkin) => checkin.status === "open")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const openCount = openCheckins.length;
  const readiness = Math.round((average + Math.max(0, 100 - openCount * 12) + Math.min(upcoming.length * 18, 100)) / 3);

  elements.coachCount.textContent = clients.length;
  elements.activeClients.textContent = clients.length;
  elements.clientMetricDetail.textContent = clients.length === 1 ? "1 stored client" : `${clients.length} stored clients`;
  elements.upcomingSessions.textContent = upcoming.length;
  elements.averageProgress.textContent = `${average}%`;
  elements.openCheckins.textContent = openCount;
  elements.focusCount.textContent = upcoming.length === 1 ? "1 session" : `${upcoming.length} sessions`;
  elements.dashboardOpenCount.textContent = openCount === 1 ? "1 open" : `${openCount} open`;
  elements.dashboardReadiness.textContent = `${readiness}%`;
  elements.dashboardReadinessMeter.value = readiness;
  elements.dashboardReadinessMeter.textContent = `${readiness}%`;

  const nextSession = upcoming[0];
  elements.dashboardSpotlight.innerHTML = nextSession
    ? `
      <div class="spotlight-client">
        <span class="avatar">${escapeHtml(getInitials(getClientName(nextSession.clientId)))}</span>
        <div>
          <strong>${escapeHtml(getClientName(nextSession.clientId))}</strong>
          <small>${escapeHtml(formatDateTime(nextSession.startsAt))}</small>
        </div>
      </div>
      <p>${escapeHtml(nextSession.type)}</p>
      ${nextSession.notes ? `<p class="muted-copy">${escapeHtml(nextSession.notes)}</p>` : ""}
      <div class="spotlight-actions">
        <button class="mini-button" type="button" data-action="session:complete" data-id="${escapeHtml(nextSession.id)}">Mark Complete</button>
        <button class="mini-button" type="button" data-action="session:edit" data-id="${escapeHtml(nextSession.id)}">Adjust</button>
      </div>
    `
    : `
      <div class="spotlight-empty">
        <strong>No sessions queued</strong>
        <p class="muted-copy">Schedule the next client session to build out the coaching queue.</p>
        <button class="mini-button" type="button" data-action="session:new">Schedule session</button>
      </div>
    `;

  elements.dashboardFocus.innerHTML = upcoming.length
    ? upcoming
        .slice(0, 5)
        .map(
          (session) => `
            <article>
              <span class="time">${escapeHtml(formatDateTime(session.startsAt).split(",").slice(-1).join(",").trim())}</span>
              <div>
                <strong>${escapeHtml(getClientName(session.clientId))}</strong>
                <small>${escapeHtml(session.type)} - ${escapeHtml(formatDateTime(session.startsAt))}</small>
              </div>
              <span class="pill ${getStatusTone(session.status)}">${escapeHtml(session.status)}</span>
            </article>
          `
        )
        .join("")
    : emptyState("No upcoming sessions in the next week.", "Schedule one", "session:new");

  elements.dashboardCheckins.innerHTML = openCheckins.length
    ? openCheckins
        .slice(0, 4)
        .map(
          (checkin) => `
            <article>
              <div>
                <strong>${escapeHtml(getClientName(checkin.clientId))}</strong>
                <small>${escapeHtml(formatDateTime(checkin.createdAt))}</small>
              </div>
              <p>${escapeHtml(checkin.message)}</p>
              <button class="mini-button" type="button" data-action="checkin:reply" data-id="${escapeHtml(checkin.id)}">Reply</button>
            </article>
          `
        )
        .join("")
    : emptyState("No open check-ins. Client communication is clear.", "Create check-in", "checkin:new");
};

const renderClients = () => {
  const visibleClients = clients.filter((client) => textIncludesQuery(client.name, client.goal, client.level, client.status));

  elements.clientList.innerHTML = visibleClients.length
    ? visibleClients
        .map(
          (client) => `
            <button class="client-button${client.id === activeClientId ? " active" : ""}" type="button" data-client-id="${escapeHtml(client.id)}">
              <span class="avatar">${escapeHtml(client.initials)}</span>
              <span><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.goal)}</small></span>
              <span class="pill ${getStatusTone(client.status)}">${escapeHtml(client.status)}</span>
            </button>
          `
        )
        .join("")
    : emptyState(clients.length ? "No clients match that search." : "No clients yet. Add one to start coaching.", "Add client", "client:new");

  const client = getClient(activeClientId) || clients[0] || null;
  if (client && activeClientId !== client.id) activeClientId = client.id;

  if (!client) {
    elements.clientProfile.innerHTML = `
      <div class="profile-top">
        <span class="avatar">--</span>
        <div>
          <p class="eyebrow">Client management</p>
          <h3>No client selected</h3>
          <p>Add a client to start tracking goals, attendance, sessions, plans, progress, and notes.</p>
        </div>
      </div>
    `;
    return;
  }

  const nextSession = getNextSession(client.id);
  const assignedPlans = getAssignedWorkouts(client.id);
  const latestProgress = getLatestProgress(client.id);

  elements.clientProfile.innerHTML = `
    <div class="profile-top">
      <span class="avatar">${escapeHtml(client.initials)}</span>
      <div>
        <p class="eyebrow">${escapeHtml(client.level)}</p>
        <h3>${escapeHtml(client.name)}</h3>
        <p>${escapeHtml(client.goal)}</p>
      </div>
    </div>

    <dl class="profile-stats">
      <div><dt>Goal Progress</dt><dd>${escapeHtml(client.progress)}</dd></div>
      <div><dt>Attendance</dt><dd>${escapeHtml(client.attendance)}</dd></div>
      <div><dt>Next Session</dt><dd>${escapeHtml(nextSession ? formatDateTime(nextSession.startsAt) : "Not scheduled")}</dd></div>
    </dl>

    <div class="mini-grid">
      <article class="note-box">
        <strong>Assigned plans</strong>
        ${
          assignedPlans.length
            ? `<ul class="plain-list">${assignedPlans.map((plan) => `<li>${escapeHtml(plan.name)}</li>`).join("")}</ul>`
            : `<p>No assigned plans yet.</p>`
        }
      </article>
      <article class="note-box">
        <strong>Latest progress</strong>
        <p>${latestProgress ? `${escapeHtml(latestProgress.progress)}% on ${escapeHtml(formatDate(latestProgress.date))}` : "No progress entries yet."}</p>
      </article>
    </div>

    <div class="note-box">
      <strong>Coach note</strong>
      <p>${escapeHtml(client.note)}</p>
    </div>

    <div class="profile-actions">
      <button class="secondary-action" type="button" data-action="client:edit" data-id="${escapeHtml(client.id)}">Edit Client</button>
      <button class="danger-action" type="button" data-action="client:delete" data-id="${escapeHtml(client.id)}">Delete Client</button>
    </div>
  `;
};

const renderWorkouts = () => {
  const visibleWorkouts = workouts.filter((workout) =>
    textIncludesQuery(workout.name, workout.focus, workout.exercises.map((exercise) => exercise.name).join(" "))
  );
  const activeWorkout = workouts.find((workout) => workout.id === activeWorkoutId) || workouts[0] || null;
  if (activeWorkout && activeWorkoutId !== activeWorkout.id) activeWorkoutId = activeWorkout.id;

  elements.workoutList.innerHTML = visibleWorkouts.length
    ? visibleWorkouts
        .map(
          (workout) => `
            <button class="list-button${workout.id === activeWorkoutId ? " active" : ""}" type="button" data-workout-id="${escapeHtml(workout.id)}">
              <strong>${escapeHtml(workout.name)}</strong>
              <small>${escapeHtml(workout.focus)}</small>
              <span>${workout.exercises.length} exercises - ${workout.clientIds.length} clients</span>
            </button>
          `
        )
        .join("")
    : emptyState(workouts.length ? "No workout plans match that search." : "No workout plans yet. Build one for a client.", "Create plan", "workout:new");

  if (!activeWorkout) {
    elements.workoutDetail.innerHTML = emptyState("No workout selected.", "Create plan", "workout:new");
    return;
  }

  elements.workoutDetail.innerHTML = `
    <div class="panel-header">
      <span>${escapeHtml(activeWorkout.name)}</span>
      <strong>${activeWorkout.exercises.length} moves</strong>
    </div>
    <p class="muted-copy">${escapeHtml(activeWorkout.focus)}</p>
    <div class="assignment-row">
      ${activeWorkout.clientIds.length ? activeWorkout.clientIds.map((id) => `<span class="pill green">${escapeHtml(getClientName(id))}</span>`).join("") : `<span class="pill amber">Unassigned</span>`}
    </div>
    <div class="exercise-stack">
      ${
        activeWorkout.exercises.length
          ? activeWorkout.exercises
              .map(
                (exercise, index) => `
                  <article class="exercise-card">
                    <span class="sequence-mark">${index + 1}</span>
                    <div>
                      <strong>${escapeHtml(exercise.name)}</strong>
                      <div class="exercise-meta">
                        <span>${escapeHtml(exercise.sets || "Sets open")}</span>
                        <span>${escapeHtml(exercise.reps || "Reps open")}</span>
                        ${exercise.notes ? `<span>${escapeHtml(exercise.notes)}</span>` : ""}
                      </div>
                    </div>
                  </article>
                `
              )
              .join("")
          : emptyState("No exercises yet. Edit the plan to add movement details.")
      }
    </div>
    <div class="profile-actions">
      <button class="secondary-action" type="button" data-action="workout:edit" data-id="${escapeHtml(activeWorkout.id)}">Edit Plan</button>
      <button class="danger-action" type="button" data-action="workout:delete" data-id="${escapeHtml(activeWorkout.id)}">Delete Plan</button>
    </div>
  `;
};

const renderSessions = () => {
  const now = new Date();
  let visibleSessions = [...sessions].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  if (sessionFilter === "upcoming") visibleSessions = visibleSessions.filter((session) => new Date(session.startsAt) >= now);
  if (sessionFilter === "past") visibleSessions = visibleSessions.filter((session) => new Date(session.startsAt) < now);
  visibleSessions = visibleSessions.filter((session) => textIncludesQuery(getClientName(session.clientId), session.type, session.notes, session.status));

  elements.sessionGrid.innerHTML = visibleSessions.length
    ? visibleSessions
        .map(
          (session) => `
            <article class="session-card">
              <header>
                <div><strong>${escapeHtml(getClientName(session.clientId))}</strong><small>${escapeHtml(formatDateTime(session.startsAt))}</small></div>
                <span class="pill ${getStatusTone(session.status)}">${escapeHtml(session.status)}</span>
              </header>
              <p>${escapeHtml(session.type)}</p>
              ${session.notes ? `<p class="muted-copy">${escapeHtml(session.notes)}</p>` : ""}
              <footer>
                <button class="mini-button" type="button" data-action="session:complete" data-id="${escapeHtml(session.id)}"${
                  session.status === "completed" ? " disabled" : ""
                }>Complete</button>
                <button class="mini-button" type="button" data-action="session:edit" data-id="${escapeHtml(session.id)}">Edit</button>
                <button class="mini-button danger-mini" type="button" data-action="session:delete" data-id="${escapeHtml(session.id)}">Delete</button>
              </footer>
            </article>
          `
        )
        .join("")
    : emptyState(sessions.length ? "No sessions match this view." : "No sessions yet. Schedule one for a client.", "Schedule session", "session:new");
};

const renderProgress = () => {
  if (!clients.some((client) => client.id === progressClientId)) progressClientId = clients[0]?.id ?? "";

  elements.progressClient.innerHTML = clients.length
    ? clients.map((client) => `<option value="${escapeHtml(client.id)}"${client.id === progressClientId ? " selected" : ""}>${escapeHtml(client.name)}</option>`).join("")
    : `<option value="">No clients</option>`;

  const visibleEntries = progressEntries
    .filter((entry) => (!progressClientId || entry.clientId === progressClientId) && textIncludesQuery(getClientName(entry.clientId), entry.measurement, entry.note, entry.progress))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const chartEntries = [...visibleEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

  elements.progressChartTitle.textContent = progressClientId ? `${getClientName(progressClientId)} goal progress` : "Goal Progress";
  elements.progressChartMeta.textContent = visibleEntries.length === 1 ? "1 entry" : `${visibleEntries.length} entries`;
  elements.progressChart.innerHTML = renderProgressChart(chartEntries);

  elements.progressList.innerHTML = visibleEntries.length
    ? visibleEntries
        .map(
          (entry) => `
            <article class="data-card">
              <header>
                <div><strong>${entry.progress}%</strong><small>${escapeHtml(formatDate(entry.date))} - ${escapeHtml(getClientName(entry.clientId))}</small></div>
                <span class="pill blue">progress</span>
              </header>
              ${entry.measurement ? `<p>${escapeHtml(entry.measurement)}</p>` : ""}
              ${entry.weight ? `<small>Weight: ${escapeHtml(entry.weight)}</small>` : ""}
              ${entry.note ? `<p class="muted-copy">${escapeHtml(entry.note)}</p>` : ""}
              <footer>
                <button class="mini-button" type="button" data-action="progress:edit" data-id="${escapeHtml(entry.id)}">Edit</button>
                <button class="mini-button danger-mini" type="button" data-action="progress:delete" data-id="${escapeHtml(entry.id)}">Delete</button>
              </footer>
            </article>
          `
        )
        .join("")
    : emptyState(progressEntries.length ? "No progress entries match this view." : "No progress entries yet. Log a client signal.", "Add entry", "progress:new");
};

const renderProgressChart = (entries) => {
  if (entries.length === 0) return `<div class="chart-empty">Add progress entries to draw a trend.</div>`;
  if (entries.length === 1) {
    return `<div class="solo-progress"><strong>${entries[0].progress}%</strong><span>${escapeHtml(formatDate(entries[0].date))}</span></div>`;
  }

  const width = 640;
  const height = 240;
  const padding = 28;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const points = entries.map((entry, index) => {
    const x = padding + (index / (entries.length - 1)) * usableWidth;
    const y = padding + (1 - entry.progress / 100) * usableHeight;
    return { x, y, entry };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Goal progress line chart">
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-axis" />
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="chart-axis" />
      <path d="${path}" class="chart-line" />
      ${points
        .map(
          (point) => `
            <g>
              <circle cx="${point.x}" cy="${point.y}" r="5" class="chart-dot" />
              <text x="${point.x}" y="${point.y - 12}" text-anchor="middle">${point.entry.progress}%</text>
            </g>
          `
        )
        .join("")}
    </svg>
  `;
};

const renderCheckins = () => {
  let visibleCheckins = [...checkins].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (checkinFilter !== "all") visibleCheckins = visibleCheckins.filter((checkin) => checkin.status === checkinFilter);
  visibleCheckins = visibleCheckins.filter((checkin) => textIncludesQuery(getClientName(checkin.clientId), checkin.message, checkin.reply, checkin.status));

  elements.checkinGrid.innerHTML = visibleCheckins.length
    ? visibleCheckins
        .map(
          (checkin) => `
            <article class="checkin-card">
              <header>
                <div><strong>${escapeHtml(getClientName(checkin.clientId))}</strong><small>${escapeHtml(formatDateTime(checkin.createdAt))}</small></div>
                <span class="pill ${checkin.status === "open" ? "coral" : "green"}">${escapeHtml(checkin.status)}</span>
              </header>
              <p>${escapeHtml(checkin.message)}</p>
              ${checkin.reply ? `<div class="reply-box"><strong>Coach reply</strong><p>${escapeHtml(checkin.reply)}</p></div>` : ""}
              <footer>
                <button class="mini-button" type="button" data-action="checkin:reply" data-id="${escapeHtml(checkin.id)}">${checkin.reply ? "Edit Reply" : "Reply"}</button>
                <button class="mini-button" type="button" data-action="checkin:toggle" data-id="${escapeHtml(checkin.id)}">${
                  checkin.status === "open" ? "Resolve" : "Reopen"
                }</button>
                <button class="mini-button danger-mini" type="button" data-action="checkin:delete" data-id="${escapeHtml(checkin.id)}">Delete</button>
              </footer>
            </article>
          `
        )
        .join("")
    : emptyState(checkins.length ? "No check-ins match this view." : "No check-ins yet. Ask a client how recovery is going.", "Create check-in", "checkin:new");
};

const renderAll = () => {
  renderDashboard();
  renderClients();
  renderWorkouts();
  renderSessions();
  renderProgress();
  renderCheckins();
};

const clientForm = (client = {}) => `
  <label>Full name<input name="name" required value="${escapeHtml(client.name || "")}" placeholder="e.g. Niko Santos" /></label>
  <label>Main goal<input name="goal" required value="${escapeHtml(client.goal || "")}" placeholder="Improve strength and consistency" /></label>
  <label>Training level
    <select name="level">
      ${["Beginner", "Intermediate", "Advanced"].map((level) => `<option${client.level === level ? " selected" : ""}>${level}</option>`).join("")}
    </select>
  </label>
  <label>Goal progress<input name="progress" type="number" min="0" max="100" value="${parsePercent(client.progress || 0)}" /></label>
  <label>Attendance<input name="attendance" value="${escapeHtml(client.attendance || "New")}" placeholder="e.g. 94%" /></label>
  <label>Status<input name="status" value="${escapeHtml(client.status || "Active")}" placeholder="e.g. Ready" /></label>
  <label>Coach note<textarea name="note" rows="4" placeholder="Add coaching context">${escapeHtml(client.note || "")}</textarea></label>
`;

const workoutForm = (workout = {}) => `
  <label>Plan name<input name="name" required value="${escapeHtml(workout.name || "")}" placeholder="e.g. Lower Strength A" /></label>
  <label>Plan focus<textarea name="focus" required rows="3" placeholder="What this plan is built to accomplish">${escapeHtml(workout.focus || "")}</textarea></label>
  <fieldset>
    <legend>Assigned clients</legend>
    <div class="check-grid">${clientCheckboxes(workout.clientIds || []) || "<p class='muted-copy'>Add clients before assigning plans.</p>"}</div>
  </fieldset>
  <label>Exercises
    <textarea name="exercises" required rows="8" placeholder="Exercise | sets | reps | notes">${escapeHtml(exercisesToText(workout.exercises || []))}</textarea>
    <small>Use one line per exercise. Example: Goblet Squat | 3 sets | 10 reps | Slow eccentric</small>
  </label>
`;

const sessionForm = (session = {}) => `
  <label>Client<select name="clientId" required>${clientOptions(session.clientId)}</select></label>
  <label>Date and time<input name="startsAt" required type="datetime-local" value="${escapeHtml(session.startsAt || toDateTimeInput(new Date()))}" /></label>
  <label>Session type<input name="type" required value="${escapeHtml(session.type || "")}" placeholder="e.g. Lower Strength A" /></label>
  <label>Status
    <select name="status">
      ${["scheduled", "completed", "cancelled"].map((status) => `<option${session.status === status ? " selected" : ""}>${status}</option>`).join("")}
    </select>
  </label>
  <label>Notes<textarea name="notes" rows="4" placeholder="Session context">${escapeHtml(session.notes || "")}</textarea></label>
`;

const progressForm = (entry = {}) => `
  <label>Client<select name="clientId" required>${clientOptions(entry.clientId || progressClientId)}</select></label>
  <label>Date<input name="date" required type="date" value="${escapeHtml(entry.date || toDateInput(new Date()))}" /></label>
  <label>Goal progress %<input name="progress" required type="number" min="0" max="100" value="${escapeHtml(entry.progress ?? "")}" /></label>
  <label>Weight<input name="weight" value="${escapeHtml(entry.weight || "")}" placeholder="e.g. 82 kg" /></label>
  <label>Measurement<input name="measurement" value="${escapeHtml(entry.measurement || "")}" placeholder="e.g. Squat 100 kg" /></label>
  <label>Note<textarea name="note" rows="4" placeholder="What changed?">${escapeHtml(entry.note || "")}</textarea></label>
`;

const checkinForm = (checkin = {}) => `
  <label>Client<select name="clientId" required>${clientOptions(checkin.clientId)}</select></label>
  <label>Message/question<textarea name="message" required rows="4" placeholder="Client check-in message">${escapeHtml(checkin.message || "")}</textarea></label>
  <label>Coach reply<textarea name="reply" rows="4" placeholder="Optional reply">${escapeHtml(checkin.reply || "")}</textarea></label>
  <label>Status
    <select name="status">
      ${["open", "resolved"].map((status) => `<option${checkin.status === status ? " selected" : ""}>${status}</option>`).join("")}
    </select>
  </label>
`;

const openClientDrawer = (client = null) =>
  openDrawer({
    title: client ? "Edit Client" : "New Client",
    submitLabel: client ? "Save Client" : "Add Client",
    mode: client ? "client:edit" : "client:new",
    item: client,
    body: clientForm(client || {})
  });

const openWorkoutDrawer = (workout = null) =>
  openDrawer({
    title: workout ? "Edit Workout Plan" : "New Workout Plan",
    submitLabel: workout ? "Save Plan" : "Create Plan",
    mode: workout ? "workout:edit" : "workout:new",
    item: workout,
    body: workoutForm(workout || {})
  });

const openSessionDrawer = (session = null) =>
  openDrawer({
    title: session ? "Edit Session" : "New Session",
    submitLabel: session ? "Save Session" : "Schedule Session",
    mode: session ? "session:edit" : "session:new",
    item: session,
    body: sessionForm(session || { clientId: activeClientId })
  });

const openProgressDrawer = (entry = null) =>
  openDrawer({
    title: entry ? "Edit Progress Entry" : "New Progress Entry",
    submitLabel: entry ? "Save Entry" : "Add Entry",
    mode: entry ? "progress:edit" : "progress:new",
    item: entry,
    body: progressForm(entry || { clientId: progressClientId })
  });

const openCheckinDrawer = (checkin = null) =>
  openDrawer({
    title: checkin ? "Update Check-in" : "New Check-in",
    submitLabel: checkin ? "Save Check-in" : "Create Check-in",
    mode: checkin ? "checkin:edit" : "checkin:new",
    item: checkin,
    body: checkinForm(checkin || { clientId: activeClientId, status: "open" })
  });

const handleDrawerSubmit = () => {
  if (!validateDrawerForm()) return;
  const form = new FormData(elements.drawerForm);
  const mode = drawerContext?.mode;
  const item = drawerContext?.item;

  if (mode?.startsWith("client")) {
    const values = normalizeClient({
      name: form.get("name"),
      goal: form.get("goal"),
      level: form.get("level"),
      progress: form.get("progress"),
      attendance: form.get("attendance"),
      status: form.get("status"),
      note: form.get("note")
    });
    if (mode === "client:edit") {
      clients = stores.clients.update(clients, item.id, values);
      activeClientId = item.id;
    } else {
      const created = stores.clients.create(clients, values);
      clients = created.items;
      activeClientId = created.item.id;
      if (!progressClientId) progressClientId = created.item.id;
    }
  }

  if (mode?.startsWith("workout")) {
    const values = normalizeWorkout({
      name: form.get("name"),
      focus: form.get("focus"),
      clientIds: form.getAll("clientIds"),
      exercises: parseExercises(form.get("exercises"))
    });
    if (values.exercises.length === 0) {
      showError("Add at least one exercise line before saving the plan.");
      return;
    }
    if (mode === "workout:edit") {
      workouts = stores.workouts.update(workouts, item.id, values);
      activeWorkoutId = item.id;
    } else {
      const created = stores.workouts.create(workouts, values);
      workouts = created.items;
      activeWorkoutId = created.item.id;
    }
  }

  if (mode?.startsWith("session")) {
    const values = normalizeSession({
      clientId: form.get("clientId"),
      startsAt: form.get("startsAt"),
      type: form.get("type"),
      status: form.get("status"),
      notes: form.get("notes")
    });
    if (mode === "session:edit") {
      sessions = stores.sessions.update(sessions, item.id, values);
    } else {
      sessions = stores.sessions.create(sessions, values).items;
    }
  }

  if (mode?.startsWith("progress")) {
    const values = normalizeProgress({
      clientId: form.get("clientId"),
      date: form.get("date"),
      progress: form.get("progress"),
      weight: form.get("weight"),
      measurement: form.get("measurement"),
      note: form.get("note")
    });
    progressClientId = values.clientId;
    if (mode === "progress:edit") {
      progressEntries = stores.progress.update(progressEntries, item.id, values);
    } else {
      progressEntries = stores.progress.create(progressEntries, values).items;
    }
    syncClientProgress(values.clientId);
  }

  if (mode?.startsWith("checkin")) {
    const values = normalizeCheckin({
      clientId: form.get("clientId"),
      createdAt: item?.createdAt || toDateTimeInput(new Date()),
      message: form.get("message"),
      reply: form.get("reply"),
      status: form.get("status")
    });
    if (mode === "checkin:edit") {
      checkins = stores.checkins.update(checkins, item.id, values);
    } else {
      checkins = stores.checkins.create(checkins, values).items;
    }
  }

  closeDrawer();
  renderAll();
};

const deleteItem = (domain, id) => {
  if (domain === "client") {
    const client = getClient(id);
    if (!client || !window.confirm(`Delete ${client.name}? Related records will become unassigned.`)) return;
    clients = stores.clients.delete(clients, id);
    activeClientId = clients[0]?.id ?? null;
    progressClientId = clients[0]?.id ?? "";
  }
  if (domain === "workout") {
    workouts = stores.workouts.delete(workouts, id);
    activeWorkoutId = workouts[0]?.id ?? null;
  }
  if (domain === "session") sessions = stores.sessions.delete(sessions, id);
  if (domain === "progress") {
    const entry = progressEntries.find((item) => item.id === id);
    progressEntries = stores.progress.delete(progressEntries, id);
    if (entry) syncClientProgress(entry.clientId);
  }
  if (domain === "checkin") checkins = stores.checkins.delete(checkins, id);
  renderAll();
};

const handleAction = (action, id) => {
  if (!action) return;
  if (action === "client:new") openClientDrawer();
  if (action === "client:edit") openClientDrawer(getClient(id));
  if (action === "client:delete") deleteItem("client", id);
  if (action === "workout:new") openWorkoutDrawer();
  if (action === "workout:edit") openWorkoutDrawer(workouts.find((workout) => workout.id === id));
  if (action === "workout:delete") deleteItem("workout", id);
  if (action === "session:new") openSessionDrawer();
  if (action === "session:edit") openSessionDrawer(sessions.find((session) => session.id === id));
  if (action === "session:delete") deleteItem("session", id);
  if (action === "session:complete") {
    sessions = stores.sessions.update(sessions, id, { status: "completed" });
    renderAll();
  }
  if (action === "progress:new") openProgressDrawer();
  if (action === "progress:edit") openProgressDrawer(progressEntries.find((entry) => entry.id === id));
  if (action === "progress:delete") deleteItem("progress", id);
  if (action === "checkin:new") openCheckinDrawer();
  if (action === "checkin:reply" || action === "checkin:edit") openCheckinDrawer(checkins.find((checkin) => checkin.id === id));
  if (action === "checkin:delete") deleteItem("checkin", id);
  if (action === "checkin:toggle") {
    const checkin = checkins.find((item) => item.id === id);
    if (!checkin) return;
    checkins = stores.checkins.update(checkins, id, { status: checkin.status === "open" ? "resolved" : "open" });
    renderAll();
  }
};

viewLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const viewName = link.getAttribute("href")?.replace("#", "");
    if (!viewName || !viewNames.has(viewName)) return;
    event.preventDefault();
    setActiveView(viewName, { updateHash: true });
  });
});

document.querySelector("[data-menu-button]").addEventListener("click", () => {
  elements.sidebar.classList.toggle("open");
});

document.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (actionTarget) {
    handleAction(actionTarget.dataset.action, actionTarget.dataset.id);
    return;
  }

  const clientButton = event.target.closest("[data-client-id]");
  if (clientButton) {
    activeClientId = clientButton.dataset.clientId;
    renderClients();
    return;
  }

  const workoutButton = event.target.closest("[data-workout-id]");
  if (workoutButton) {
    activeWorkoutId = workoutButton.dataset.workoutId;
    renderWorkouts();
  }
});

elements.quickAdd.addEventListener("click", () => {
  const actions = {
    dashboard: "client:new",
    clients: "client:new",
    workouts: "workout:new",
    sessions: "session:new",
    progress: "progress:new",
    checkins: "checkin:new"
  };
  handleAction(actions[currentView]);
});

elements.search.addEventListener("input", renderAll);

document.querySelectorAll("[data-session-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-session-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    sessionFilter = button.dataset.sessionFilter;
    renderSessions();
  });
});

document.querySelectorAll("[data-checkin-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-checkin-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    checkinFilter = button.dataset.checkinFilter;
    renderCheckins();
  });
});

elements.progressClient.addEventListener("change", (event) => {
  progressClientId = event.target.value;
  renderProgress();
});

elements.drawerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleDrawerSubmit();
});

elements.drawer.addEventListener("click", (event) => {
  if (event.target === elements.drawer) closeDrawer();
  if (event.target.closest("[data-cancel-drawer]")) closeDrawer();
});

document.querySelector("[data-close-drawer]").addEventListener("click", closeDrawer);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.drawer.hidden) closeDrawer();
});

window.addEventListener("hashchange", () => {
  setActiveView(getViewFromHash());
});

window.addEventListener("popstate", () => {
  setActiveView(getViewFromHash());
});

setActiveView(getViewFromHash());
