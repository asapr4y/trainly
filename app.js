const defaultClients = [
  {
    initials: "MC",
    name: "Maya Chen",
    level: "Intermediate",
    goal: "Build lower-body strength while maintaining weekly conditioning.",
    progress: "72%",
    attendance: "94%",
    nextSession: "Today, 8:00 AM",
    status: "Ready",
    note: "Knee feels stable. Increase goblet squat volume before moving back to heavy front squats."
  },
  {
    initials: "JB",
    name: "Jon Bell",
    level: "Beginner",
    goal: "Lose 8 kg and build a consistent training rhythm.",
    progress: "48%",
    attendance: "81%",
    nextSession: "Today, 11:30 AM",
    status: "Review",
    note: "Energy dipped after late shifts. Keep plan simple this week and prioritize sleep consistency."
  },
  {
    initials: "SC",
    name: "Sofia Cruz",
    level: "Advanced",
    goal: "Improve squat and deadlift performance before the autumn meet.",
    progress: "86%",
    attendance: "97%",
    nextSession: "Today, 5:00 PM",
    status: "PR day",
    note: "Bar speed looks strong. Test squat single only if warm-up sets stay crisp."
  },
  {
    initials: "AR",
    name: "Andre Ramos",
    level: "Intermediate",
    goal: "Rebuild shoulder confidence and return to full upper-body training.",
    progress: "61%",
    attendance: "88%",
    nextSession: "Tomorrow, 9:00 AM",
    status: "Active",
    note: "Avoid overhead pressing this block. Landmine press and tempo rows are moving well."
  }
];

const storageKey = "trainly.clients.v1";
const storage = typeof window !== "undefined" ? window.localStorage : null;

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });

const withClientDefaults = (client) => {
  const name = String(client.name || "Unnamed Client").trim() || "Unnamed Client";

  return {
    id: client.id || createId(),
    initials: client.initials || getInitials(name),
    name,
    level: String(client.level || "Beginner"),
    goal: String(client.goal || "No goal set yet."),
    progress: String(client.progress || "0%"),
    attendance: String(client.attendance || "New"),
    nextSession: String(client.nextSession || "Not scheduled"),
    status: String(client.status || "Active"),
    note: String(client.note || "No coaching note yet.")
  };
};

const loadClients = () => {
  if (!storage) return defaultClients.map(withClientDefaults);

  try {
    const storedValue = storage.getItem(storageKey);
    if (storedValue === null) {
      return defaultClients.map(withClientDefaults);
    }

    const storedClients = JSON.parse(storedValue);
    if (!Array.isArray(storedClients)) return defaultClients.map(withClientDefaults);

    return storedClients.map(withClientDefaults);
  } catch {
    return defaultClients.map(withClientDefaults);
  }
};

const saveClients = () => {
  if (!storage) return;
  storage.setItem(storageKey, JSON.stringify(clients));
};

let clients = loadClients();
let activeClientId = clients[0]?.id ?? null;
let editingClientId = null;

const workouts = {
  Strength: {
    title: "Lower Strength A",
    duration: "58 min",
    exercises: [
      ["Trap Bar Deadlift", "4 sets", "5 reps", "150 sec rest"],
      ["Bulgarian Split Squat", "3 sets", "8 each", "90 sec rest"],
      ["Hip Thrust", "3 sets", "10 reps", "75 sec rest"],
      ["Pallof Press", "3 sets", "12 each", "45 sec rest"]
    ]
  },
  Conditioning: {
    title: "Engine Builder",
    duration: "34 min",
    exercises: [
      ["Bike Intervals", "8 rounds", "40 sec hard", "80 sec easy"],
      ["Kettlebell Swing", "4 sets", "15 reps", "60 sec rest"],
      ["Sled Push", "6 rounds", "20 meters", "Walk back"],
      ["Breathing Reset", "1 set", "4 min", "Nasal only"]
    ]
  },
  Mobility: {
    title: "Hips and T-Spine",
    duration: "24 min",
    exercises: [
      ["90/90 Hip Switch", "3 sets", "8 each", "Controlled"],
      ["Couch Stretch", "2 sets", "60 sec", "Each side"],
      ["Open Book Rotation", "2 sets", "10 each", "Slow"],
      ["Bear Plank Shoulder Tap", "3 sets", "12 total", "Stable hips"]
    ]
  }
};

const library = [
  ["Goblet Squat", "Lower body", "Dumbbell"],
  ["Romanian Deadlift", "Lower body", "Barbell"],
  ["Incline Press", "Upper body", "Dumbbell"],
  ["Cable Row", "Upper body", "Cable"],
  ["Dead Bug", "Core", "Bodyweight"],
  ["Farmer Carry", "Core", "Kettlebell"]
];

const sessions = [
  ["Maya Chen", "Today, 8:00 AM", "Lower Strength A", "scheduled", "green"],
  ["Jon Bell", "Today, 11:30 AM", "Mobility + deload", "needs notes", "amber"],
  ["Sofia Cruz", "Today, 5:00 PM", "Squat PR testing", "high focus", "blue"],
  ["Andre Ramos", "Tomorrow, 9:00 AM", "Upper rebuild", "scheduled", "green"],
  ["Lina Torres", "Tomorrow, 1:30 PM", "Full body technique", "pending", "amber"],
  ["Chris Park", "Friday, 6:00 PM", "Conditioning", "scheduled", "green"]
];

const checkins = [
  ["Jon Bell", "Sleep was rough, but completed two workouts.", "Energy 5/10", "Review"],
  ["Lina Torres", "Soreness is high after leg day.", "Soreness 8/10", "Reply"],
  ["Maya Chen", "Meals and training felt consistent this week.", "Mood 8/10", "Done"]
];

const clientList = document.querySelector("[data-client-list]");
const searchInput = document.querySelector("[data-search]");
const clientForm = document.querySelector("[data-client-form]");
const drawer = document.querySelector("[data-drawer]");
const drawerTitle = document.querySelector("[data-drawer-title]");
const clientSubmit = document.querySelector("[data-client-submit]");
const editClientButton = document.querySelector("[data-edit-client]");
const deleteClientButton = document.querySelector("[data-delete-client]");
const profile = {
  avatar: document.querySelector("[data-profile-avatar]"),
  name: document.querySelector("[data-profile-name]"),
  level: document.querySelector("[data-profile-level]"),
  goal: document.querySelector("[data-profile-goal]"),
  progress: document.querySelector("[data-profile-progress]"),
  attendance: document.querySelector("[data-profile-attendance]"),
  session: document.querySelector("[data-profile-session]"),
  note: document.querySelector("[data-profile-note]")
};
const metrics = {
  activeClients: document.querySelector("[data-active-clients]"),
  coachCount: document.querySelector("[data-coach-count]")
};
const views = Array.from(document.querySelectorAll("[data-view]"));
const viewNames = new Set(views.map((view) => view.dataset.view));
const viewLinks = Array.from(document.querySelectorAll("[data-nav-link], [data-view-link]"));

const getViewFromHash = () => {
  const viewName = window.location.hash.replace("#", "") || "dashboard";
  return viewNames.has(viewName) ? viewName : "dashboard";
};

const setActiveView = (viewName, options = {}) => {
  const nextView = viewNames.has(viewName) ? viewName : "dashboard";

  views.forEach((view) => {
    view.hidden = view.dataset.view !== nextView;
  });

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${nextView}`);
  });

  if (options.updateHash && window.location.hash !== `#${nextView}`) {
    window.history.pushState(null, "", `#${nextView}`);
  }

  document.querySelector(".sidebar").classList.remove("open");
  window.scrollTo(0, 0);
};

const getStatusTone = (status) => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("review") || normalizedStatus.includes("pending")) return "amber";
  if (normalizedStatus.includes("pr") || normalizedStatus.includes("focus")) return "blue";
  if (normalizedStatus.includes("new")) return "coral";
  return "green";
};

const getActiveClient = () => clients.find((client) => client.id === activeClientId) || clients[0] || null;

const updateClientMetrics = () => {
  const count = clients.length;
  metrics.activeClients.textContent = count;
  metrics.coachCount.textContent = count;
};

const renderClients = () => {
  const query = searchInput.value.trim().toLowerCase();
  const visibleClients = clients.filter((client) =>
    [client.name, client.goal, client.level, client.status].join(" ").toLowerCase().includes(query)
  );

  clientList.innerHTML = "";

  if (visibleClients.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = clients.length === 0 ? "No clients yet. Add your first client." : "No clients match that search.";
    clientList.append(emptyState);
    return;
  }

  visibleClients.forEach((client) => {
    const button = document.createElement("button");
    button.className = `client-button${client.id === activeClientId ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span class="avatar">${escapeHtml(client.initials)}</span>
      <span><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.goal)}</small></span>
      <span class="pill ${getStatusTone(client.status)}">${escapeHtml(client.status)}</span>
    `;
    button.addEventListener("click", () => selectClient(client.id));
    clientList.append(button);
  });
};

const clearProfile = () => {
  profile.avatar.textContent = "--";
  profile.name.textContent = "No client selected";
  profile.level.textContent = "Client management";
  profile.goal.textContent = "Add a client to start tracking goals, attendance, sessions, and coaching notes.";
  profile.progress.textContent = "--";
  profile.attendance.textContent = "--";
  profile.session.textContent = "--";
  profile.note.textContent = "No coaching note yet.";
  editClientButton.disabled = true;
  deleteClientButton.disabled = true;
};

const selectClient = (clientId = activeClientId) => {
  const client = clients.find((item) => item.id === clientId) || clients[0];

  if (!client) {
    activeClientId = null;
    clearProfile();
    renderClients();
    return;
  }

  activeClientId = client.id;
  document.querySelectorAll(".client-button").forEach((button) => {
    button.classList.toggle("active", button.textContent.includes(client.name));
  });

  profile.avatar.textContent = client.initials;
  profile.name.textContent = client.name;
  profile.level.textContent = client.level;
  profile.goal.textContent = client.goal;
  profile.progress.textContent = client.progress;
  profile.attendance.textContent = client.attendance;
  profile.session.textContent = client.nextSession;
  profile.note.textContent = client.note;
  editClientButton.disabled = false;
  deleteClientButton.disabled = false;
  renderClients();
};

const renderWorkout = (type = "Strength") => {
  const plan = workouts[type];
  document.querySelector("[data-plan-title]").textContent = plan.title;
  document.querySelector("[data-plan-duration]").textContent = plan.duration;
  const stack = document.querySelector("[data-exercise-stack]");
  stack.innerHTML = "";
  plan.exercises.forEach(([name, sets, reps, rest]) => {
    const card = document.createElement("article");
    card.className = "exercise-card";
    card.innerHTML = `
      <div>
        <strong>${escapeHtml(name)}</strong>
        <div class="exercise-meta">
          <span>${escapeHtml(sets)}</span>
          <span>${escapeHtml(reps)}</span>
          <span>${escapeHtml(rest)}</span>
        </div>
      </div>
      <button class="mini-button" type="button">Edit</button>
    `;
    stack.append(card);
  });
};

const renderLibrary = (filter = "All muscle groups") => {
  const list = document.querySelector("[data-library-list]");
  list.innerHTML = "";
  library
    .filter((item) => filter === "All muscle groups" || item[1] === filter)
    .forEach(([name, group, equipment]) => {
      const item = document.createElement("article");
      item.className = "library-item";
      item.innerHTML = `<strong>${escapeHtml(name)}</strong><small>${escapeHtml(group)} - ${escapeHtml(equipment)}</small>`;
      list.append(item);
    });
};

const renderSessions = () => {
  const grid = document.querySelector("[data-session-grid]");
  grid.innerHTML = "";
  sessions.forEach(([name, time, workout, status, color]) => {
    const card = document.createElement("article");
    card.className = "session-card";
    card.innerHTML = `
      <header>
        <div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(time)}</small></div>
        <span class="pill ${escapeHtml(color)}">${escapeHtml(status)}</span>
      </header>
      <p>${escapeHtml(workout)}</p>
      <footer>
        <button class="mini-button" type="button">Complete</button>
        <button class="mini-button" type="button">Notes</button>
      </footer>
    `;
    grid.append(card);
  });
};

const renderCheckins = () => {
  const grid = document.querySelector("[data-checkin-grid]");
  grid.innerHTML = "";
  checkins.forEach(([name, update, signal, status], index) => {
    const card = document.createElement("article");
    card.className = "checkin-card";
    card.innerHTML = `
      <header>
        <div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(signal)}</small></div>
        <span class="pill ${index === 2 ? "green" : "coral"}">${escapeHtml(status)}</span>
      </header>
      <p>${escapeHtml(update)}</p>
      <footer>
        <button class="mini-button" type="button">Reply</button>
        <button class="mini-button" type="button">Open Profile</button>
      </footer>
    `;
    grid.append(card);
  });
};

const renderBars = () => {
  const chart = document.querySelector("[data-bar-chart]");
  const values = [54, 58, 63, 61, 68, 72, 75, 79, 82, 85, 88, 91];
  chart.innerHTML = "";
  values.forEach((value, index) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${value}%`;
    bar.textContent = index % 2 === 0 ? value : "";
    chart.append(bar);
  });
};

const fillClientForm = (client) => {
  clientForm.elements.name.value = client.name;
  clientForm.elements.goal.value = client.goal;
  clientForm.elements.level.value = client.level;
  clientForm.elements.progress.value = client.progress;
  clientForm.elements.attendance.value = client.attendance;
  clientForm.elements.nextSession.value = client.nextSession;
  clientForm.elements.status.value = client.status;
  clientForm.elements.note.value = client.note;
};

const openDrawer = (client = null) => {
  editingClientId = client?.id ?? null;
  clientForm.reset();

  if (client) {
    drawerTitle.textContent = "Edit Client";
    clientSubmit.textContent = "Save Client";
    fillClientForm(client);
  } else {
    drawerTitle.textContent = "New Client";
    clientSubmit.textContent = "Add Client";
    clientForm.elements.progress.value = "0%";
    clientForm.elements.attendance.value = "New";
    clientForm.elements.nextSession.value = "Not scheduled";
    clientForm.elements.status.value = "New";
  }

  drawer.hidden = false;
  drawer.setAttribute("aria-hidden", "false");
  drawer.querySelector("input").focus();
};

const closeDrawer = () => {
  drawer.hidden = true;
  drawer.setAttribute("aria-hidden", "true");
  editingClientId = null;
};

document.querySelectorAll("[data-workout-day]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-workout-day]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderWorkout(button.dataset.workoutDay);
  });
});

document.querySelector("[data-library-filter]").addEventListener("change", (event) => {
  renderLibrary(event.target.value);
});

document.querySelector("[data-refresh-progress]").addEventListener("click", renderBars);

document.querySelector("[data-menu-button]").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});

viewLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const viewName = link.getAttribute("href")?.replace("#", "");
    if (!viewName || !viewNames.has(viewName)) return;

    event.preventDefault();
    setActiveView(viewName, { updateHash: true });
  });
});

window.addEventListener("hashchange", () => {
  setActiveView(getViewFromHash());
});

window.addEventListener("popstate", () => {
  setActiveView(getViewFromHash());
});

searchInput.addEventListener("input", renderClients);

document.querySelector("[data-open-client]").addEventListener("click", () => {
  openDrawer();
});

document.querySelector("[data-close-client]").addEventListener("click", () => {
  closeDrawer();
});

drawer.addEventListener("click", (event) => {
  if (event.target === drawer) closeDrawer();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !drawer.hidden) closeDrawer();
});

editClientButton.addEventListener("click", () => {
  const client = getActiveClient();
  if (client) openDrawer(client);
});

deleteClientButton.addEventListener("click", () => {
  const client = getActiveClient();
  if (!client) return;

  const shouldDelete = window.confirm(`Delete ${client.name}? This cannot be undone.`);
  if (!shouldDelete) return;

  clients = clients.filter((item) => item.id !== client.id);
  activeClientId = clients[0]?.id ?? null;
  saveClients();
  updateClientMetrics();
  renderClients();
  selectClient(activeClientId);
});

clientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name")).trim();
  const clientValues = {
    name,
    initials: getInitials(name),
    level: String(form.get("level")),
    goal: String(form.get("goal")).trim(),
    progress: String(form.get("progress")).trim() || "0%",
    attendance: String(form.get("attendance")).trim() || "New",
    nextSession: String(form.get("nextSession")).trim() || "Not scheduled",
    status: String(form.get("status")).trim() || "Active",
    note: String(form.get("note")).trim() || "No coaching note yet."
  };

  if (editingClientId) {
    const clientIndex = clients.findIndex((client) => client.id === editingClientId);
    if (clientIndex !== -1) {
      clients[clientIndex] = withClientDefaults({
        ...clients[clientIndex],
        ...clientValues,
        id: editingClientId
      });
      activeClientId = editingClientId;
    }
  } else {
    const client = withClientDefaults({
      ...clientValues,
      id: createId()
    });
    clients.unshift(client);
    activeClientId = client.id;
  }

  saveClients();
  updateClientMetrics();
  renderClients();
  selectClient(activeClientId);
  event.currentTarget.reset();
  closeDrawer();
});

updateClientMetrics();
setActiveView(getViewFromHash());
renderClients();
selectClient(activeClientId);
renderWorkout();
renderLibrary();
renderSessions();
renderCheckins();
renderBars();
