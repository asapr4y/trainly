const clients = [
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

const renderClients = () => {
  clientList.innerHTML = "";
  clients.forEach((client, index) => {
    const button = document.createElement("button");
    button.className = `client-button${index === 0 ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span class="avatar">${client.initials}</span>
      <span><strong>${client.name}</strong><small>${client.goal}</small></span>
      <span class="pill ${index === 1 ? "amber" : index === 2 ? "blue" : "green"}">${client.status}</span>
    `;
    button.addEventListener("click", () => selectClient(index));
    clientList.append(button);
  });
};

const selectClient = (index) => {
  const client = clients[index];
  document.querySelectorAll(".client-button").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === index);
  });
  profile.avatar.textContent = client.initials;
  profile.name.textContent = client.name;
  profile.level.textContent = client.level;
  profile.goal.textContent = client.goal;
  profile.progress.textContent = client.progress;
  profile.attendance.textContent = client.attendance;
  profile.session.textContent = client.nextSession;
  profile.note.textContent = client.note;
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
        <strong>${name}</strong>
        <div class="exercise-meta">
          <span>${sets}</span>
          <span>${reps}</span>
          <span>${rest}</span>
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
      item.innerHTML = `<strong>${name}</strong><small>${group} - ${equipment}</small>`;
      list.append(item);
    });
};

const renderSessions = () => {
  const grid = document.querySelector("[data-session-grid]");
  sessions.forEach(([name, time, workout, status, color]) => {
    const card = document.createElement("article");
    card.className = "session-card";
    card.innerHTML = `
      <header>
        <div><strong>${name}</strong><small>${time}</small></div>
        <span class="pill ${color}">${status}</span>
      </header>
      <p>${workout}</p>
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
  checkins.forEach(([name, update, signal, status], index) => {
    const card = document.createElement("article");
    card.className = "checkin-card";
    card.innerHTML = `
      <header>
        <div><strong>${name}</strong><small>${signal}</small></div>
        <span class="pill ${index === 2 ? "green" : "coral"}">${status}</span>
      </header>
      <p>${update}</p>
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

document.querySelectorAll("[data-nav-link]").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll("[data-nav-link]").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    document.querySelector(".sidebar").classList.remove("open");
  });
});

document.querySelector("[data-search]").addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase();
  document.querySelectorAll(".client-button").forEach((button) => {
    button.hidden = !button.textContent.toLowerCase().includes(query);
  });
});

const drawer = document.querySelector("[data-drawer]");
const openDrawer = () => {
  drawer.hidden = false;
  drawer.setAttribute("aria-hidden", "false");
  drawer.querySelector("input").focus();
};
const closeDrawer = () => {
  drawer.hidden = true;
  drawer.setAttribute("aria-hidden", "true");
};

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

document.querySelector("[data-client-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name"));
  clients.unshift({
    initials: name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    name,
    level: String(form.get("level")),
    goal: String(form.get("goal")),
    progress: "0%",
    attendance: "New",
    nextSession: "Not scheduled",
    status: "New",
    note: "New client added. Schedule onboarding and baseline assessment."
  });
  renderClients();
  selectClient(0);
  event.currentTarget.reset();
  closeDrawer();
});

renderClients();
renderWorkout();
renderLibrary();
renderSessions();
renderCheckins();
renderBars();
