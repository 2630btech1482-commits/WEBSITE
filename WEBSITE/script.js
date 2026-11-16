
// ==========================================
// STUDYSPACE 2.0 - COMPLETE JAVASCRIPT
// ==========================================


// 1. BASIC SETTINGS

const $ = id => document.getElementById(id);

const today = () => {
    const d = new Date();
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
};

$("today").textContent = new Date().toDateString();


// 2. SAVE AND LOAD USER DATA

const defaultData = {
    tasks: [],
    xp: 0,
    sessions: 0,
    monster: "🐉",
    monsterName: "Stardust",
    activeDays: [],
    bonusDays: [],
    rewards: []
};

let data;

try {
    data = {
        ...defaultData,
        ...JSON.parse(localStorage.getItem("studySpaceData") || "{}")
    };
} catch {
    data = { ...defaultData };
}

if (!Array.isArray(data.tasks)) data.tasks = [];
if (!Array.isArray(data.activeDays)) data.activeDays = [];
if (!Array.isArray(data.bonusDays)) data.bonusDays = [];
if (!Array.isArray(data.rewards)) data.rewards = [];

function saveData() {
    localStorage.setItem("studySpaceData", JSON.stringify(data));
}


// 3. TOAST MESSAGES

function toast(message) {
    const box = $("toast");
    box.textContent = message;
    box.classList.add("show");

    setTimeout(() => {
        box.classList.remove("show");
    }, 3000);
}


// 4. MOTIVATIONAL MESSAGES

const messages = [
    "Oh, look who's becoming irresistible through discipline. 💜",
    "Your future self called. They're impressed.",
    "One more task, superstar. Show me what you've got.",
    "Brains, ambition and consistency? Quite a combination.",
    "I would applaud you, but you still have one task left. 😉",
    "Your dreams look good on you. Keep going.",
    "A little effort today, a lot of confidence tomorrow.",
    "Don't give up now. I happen to believe in you.",
    "You're not procrastinating today. Who is this icon?",
    "Even your monster thinks you're amazing!"
];

function newMotivation() {
    $("motivation").textContent =
        messages[Math.floor(Math.random() * messages.length)];
}

$("newMotivation").addEventListener("click", newMotivation);


// 5. MONSTER PROFILE

function renderMonster() {
    $("monsterImage").textContent = data.monster;
    $("monsterName").textContent = data.monsterName;
    $("buddyInput").value = data.monsterName;

    document.querySelectorAll(".monster-choice").forEach(button => {
        button.classList.toggle(
            "selected",
            button.dataset.monster === data.monster
        );
    });

    const level = Math.floor(data.xp / 100) + 1;
    const progress = data.xp % 100;

    $("level").textContent = "LEVEL " + level;
    $("xpFill").style.width = progress + "%";
    $("xpText").textContent = progress + " / 100 XP";

    $("monsterMood").textContent =
        level >= 5 ? "A legendary little creature! ✨" :
        level >= 3 ? "Growing stronger every day!" :
        "Ready to conquer the universe!";
}

document.querySelectorAll(".monster-choice").forEach(button => {
    button.addEventListener("click", () => {
        data.monster = button.dataset.monster;
        saveData();
        renderMonster();
        toast("Your new companion has arrived! 💜");
    });
});

$("saveBuddy").addEventListener("click", () => {
    const name = $("buddyInput").value.trim();

    if (!name) {
        toast("Please give your buddy a name!");
        return;
    }

    data.monsterName = name;
    saveData();
    renderMonster();
    toast("Your buddy loves its new name! ✨");
});


// 6. STREAK SYSTEM

function updateStreak() {
    const days = [...new Set(data.activeDays)].sort().reverse();

    if (days.length === 0) return 0;

    const now = new Date();
    const currentDay = new Date(
        now.getFullYear(), now.getMonth(), now.getDate()
    );

    const [y, m, d] = days[0].split("-").map(Number);
    const recentDate = new Date(y, m - 1, d);

    const difference = Math.round(
        (currentDay - recentDate) / 86400000
    );

    if (difference > 1 || difference < 0) return 0;

    let streak = 0;

    for (let i = 0; i < days.length; i++) {
        const [yy, mm, dd] = days[i].split("-").map(Number);

        const expected = new Date(currentDay);
        expected.setDate(currentDay.getDate() - difference - i);

        if (
            yy === expected.getFullYear() &&
            mm - 1 === expected.getMonth() &&
            dd === expected.getDate()
        ) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function recordActivity() {
    const day = today();

    if (!data.activeDays.includes(day)) {
        data.activeDays.push(day);
    }

    if (updateStreak() >= 7) {
        unlockReward(
            "reward4",
            "Seven-day streak! You're unstoppable! 🔥"
        );
    }

    saveData();
}


// 7. XP AND LEVEL SYSTEM

function addXP(amount) {
    const oldLevel = Math.floor(data.xp / 100) + 1;

    data.xp += amount;

    const newLevel = Math.floor(data.xp / 100) + 1;

    saveData();

    renderMonster();
    renderStats();
    renderRewards();

    toast("+" + amount + " XP earned! ⭐");

    if (newLevel > oldLevel) {
        setTimeout(() => {
            toast("LEVEL UP! Your buddy is growing! 🎉");
        }, 500);
    }
}


// 8. REWARDS AND ACHIEVEMENTS

function unlockReward(id, message) {
    if (data.rewards.includes(id)) return;

    data.rewards.push(id);

    saveData();
    renderRewards();

    toast("Achievement unlocked! " + message);
}

function renderRewards() {
    const checks = [
        ["reward1", data.xp >= 25],
        ["reward2", data.xp >= 100],
        ["reward3", data.xp >= 250],
        ["reward4", updateStreak() >= 7]
    ];

    checks.forEach(([id, earned]) => {
        if (earned) {
            if (!data.rewards.includes(id)) {
                data.rewards.push(id);
            }

            $(id).classList.add("unlocked");
        } else {
            $(id).classList.remove("unlocked");
        }
    });

    saveData();
}


// 9. STATISTICS

function renderStats() {
    $("totalXP").textContent = data.xp;
    $("streak").textContent = updateStreak();
    $("sessions").textContent = data.sessions;

    $("completed").textContent =
        data.tasks.filter(task => task.done).length;
}


// 10. TASK MANAGER

let currentFilter = "all";

function renderTasks() {
    $("taskList").innerHTML = "";

    const visible = data.tasks.filter(task => {
        if (currentFilter === "pending") return !task.done;
        if (currentFilter === "completed") return task.done;
        return true;
    });

    if (visible.length === 0) {
        $("taskList").innerHTML =
            '<p class="empty">Nothing here right now. ✨</p>';
    }

    visible.forEach(task => {
        const item = document.createElement("div");

        item.className =
            "task-item" + (task.done ? " done" : "");

        const details = document.createElement("div");
        details.className = "task-details";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;

        checkbox.addEventListener("change", () => {
            if (checkbox.checked && !task.done) {
                task.done = true;
                task.rewarded = true;
                task.completedOn = today();

                addXP(5);
                recordActivity();

                const completedToday = data.tasks.filter(
                    t => t.done && t.completedOn === today()
                ).length;

                if (
                    completedToday >= 3 &&
                    !data.bonusDays.includes(today())
                ) {
                    data.bonusDays.push(today());
                    addXP(10);
                    toast("Daily task bonus! +10 XP 🎁");
                }
            } else if (!checkbox.checked && task.done) {
                task.done = false;
            }

            saveData();
            renderTasks();
            renderStats();
        });

        const info = document.createElement("div");

        const title = document.createElement("span");
        title.textContent = task.name;

        const date = document.createElement("small");
        date.textContent = task.date
            ? "Due: " + task.date
            : "No deadline";

        info.append(title, date);
        details.append(checkbox, info);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            data.tasks = data.tasks.filter(t => t.id !== task.id);

            saveData();
            renderTasks();
            renderStats();
        });

        actions.append(deleteButton);
        item.append(details, actions);

        $("taskList").appendChild(item);
    });

    renderStats();
}

function addTask() {
    const name = $("taskInput").value.trim();

    if (!name) {
        toast("Write a task first!");
        return;
    }

    data.tasks.push({
        id: Date.now(),
        name: name,
        date: $("taskDate").value,
        done: false,
        rewarded: false
    });

    $("taskInput").value = "";
    $("taskDate").value = "";

    saveData();
    renderTasks();

    toast("New task added! Let's go! 💜");
}

$("addTask").addEventListener("click", addTask);

$("taskInput").addEventListener("keydown", event => {
    if (event.key === "Enter") addTask();
});

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();
    });
});


// 11. FOCUS TIMER

let selectedMinutes = 25;
let timeLeft = 25 * 60;
let timerInterval = null;
let running = false;

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const display =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    $("timer").textContent = display;
    $("lockTimer").textContent = display;
}

document.querySelectorAll(".duration").forEach(button => {
    button.addEventListener("click", () => {
        if (running) return;

        selectedMinutes = Number(button.dataset.minutes);
        timeLeft = selectedMinutes * 60;

        document.querySelectorAll(".duration").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        updateTimer();
    });
});

function enterFocusMode() {
    $("focusOverlay").classList.remove("hidden");

    $("lockMessage").textContent =
        data.monsterName + " believes in you! " + data.monster;
}

function exitFocusMode() {
    $("focusOverlay").classList.add("hidden");
}

function pauseFocus() {
    clearInterval(timerInterval);
    timerInterval = null;
    running = false;

    $("timerMessage").textContent = "Focus paused.";
    $("lockMessage").textContent = "Paused. Ready when you are!";
    $("startTimer").textContent = "Resume Focus";

    $("pauseLock").textContent = "Resume Timer";
}

function startFocus() {
    if (running) return;

    if (timeLeft <= 0) {
        timeLeft = selectedMinutes * 60;
    }

    running = true;

    enterFocusMode();

    $("timerMessage").textContent = "You're doing amazing!";
    $("startTimer").textContent = "Resume Focus";

    let pauseButton = $("pauseLock");

    if (!pauseButton) {
        pauseButton = document.createElement("button");
        pauseButton.id = "pauseLock";

        $("endFocus").before(pauseButton);

        pauseButton.addEventListener("click", () => {
            if (running) {
                pauseFocus();
            } else {
                startFocus();
            }
        });
    }

    pauseButton.textContent = "Pause Timer";

    if ("Notification" in window &&
        Notification.permission === "default") {
        Notification.requestPermission();
    }

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();

        if (timeLeft <= 0) {
            completeFocus();
        }
    }, 1000);
}

function stopFocus() {
    pauseFocus();
    exitFocusMode();

    timeLeft = selectedMinutes * 60;

    updateTimer();

    $("timerMessage").textContent = "Session ended. Try again!";
    $("startTimer").textContent = "Start Focus";
}

function completeFocus() {
    clearInterval(timerInterval);
    timerInterval = null;
    running = false;

    timeLeft = 0;
    updateTimer();

    exitFocusMode();

    data.sessions++;
    saveData();

    recordActivity();
    addXP(25);

    $("timerMessage").textContent =
        "You did it! Your buddy is SO proud of you! 🎉";

    $("startTimer").textContent = "Start Focus";

    playAlarm();
    sendNotification();

    renderStats();

    toast("FOCUS COMPLETE! +25 XP. You're amazing! 🏆");
}

$("startTimer").addEventListener("click", startFocus);

$("pauseTimer").addEventListener("click", pauseFocus);

$("resetTimer").addEventListener("click", () => {
    pauseFocus();

    timeLeft = selectedMinutes * 60;

    updateTimer();

    $("startTimer").textContent = "Start Focus";
    $("timerMessage").textContent = "Fresh start, superstar!";
});

$("endFocus").addEventListener("click", () => {
    stopFocus();

    toast("Focus session ended early. No reward this time.");
});


// 12. ALARM SOUND

function playAlarm() {
    if (!$("alarmEnabled").checked) return;

    try {
        const AudioClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioClass) return;

        const audio = new AudioClass();

        [0, 0.3, 0.6].forEach(delay => {
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = 880;

            gain.gain.setValueAtTime(
                0.2,
                audio.currentTime + delay
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audio.currentTime + delay + 0.2
            );

            oscillator.connect(gain);
            gain.connect(audio.destination);

            oscillator.start(audio.currentTime + delay);
            oscillator.stop(audio.currentTime + delay + 0.2);
        });

    } catch (error) {
        console.log("Alarm unavailable:", error);
    }
}


// 13. BROWSER NOTIFICATIONS

function sendNotification() {
    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        new Notification("StudySpace ✨", {
            body: "Focus session completed! You earned 25 XP!"
        });
    }
}


// 14. START EVERYTHING

function initialise() {
    renderMonster();
    renderTasks();
    renderStats();
    renderRewards();
    updateTimer();
    newMotivation();
}

initialise();


// ==========================================
// END OF STUDYSPACE JAVASCRIPT
// ==========================================
