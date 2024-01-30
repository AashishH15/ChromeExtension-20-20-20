let tasks = []

function updateTime(){
    chrome.storage.local.get(["timer", "timeOption"], (res) => {
        const time = document.querySelector('#time')
        let minutes, seconds;
        if (res.timer === 0) {
            minutes = `${res.timeOption}`.padStart(2, "0");
            seconds = "00";
        } else {
            minutes = `${res.timeOption - Math.ceil(res.timer / 60)}`.padStart(2, "0");
            if (res.timer % 60 !== 0) {
                seconds = `${60 - res.timer % 60}`.padStart(2, "0");
            } else {
                seconds = "00";
            }
        }
        time.textContent = `${minutes}:${seconds}`;

        const circle = document.querySelector('.progress-ring__circle');
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;

        const offset = ((res.timer / (res.timeOption * 60)) * circumference);
        circle.style.strokeDashoffset = offset;
    })
}

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.timer) {
        updateTime();
    }
});

document.addEventListener('DOMContentLoaded', (event) => {
    updateTime();
});

// Remove the following line
// setInterval(updateTime, 1000)


let timerInterval;

const startTimerBtn = document.getElementById('start-timer-btn')
startTimerBtn.addEventListener('click', () => {
    chrome.storage.local.get(["isRunning", "timeOption", "timer"], (res) => {
        let isRunning = res.isRunning || false;
        let timer = res.timer || 0;
        chrome.storage.local.set({
            isRunning: !res.isRunning,
        }, () => {
            startTimerBtn.textContent = !res.isRunning ? "Pause Timer" : "Start Timer"
            if (!res.isRunning) {
                timerInterval = setInterval(() => {
                    timer += 1
                    chrome.storage.local.set({
                        timer
                    })
                    updateTime();
                }, 1000); // Start the timer interval when the timer starts
            } else {
                clearInterval(timerInterval); // Clear the timer interval when the timer is paused
            }
        })
    })
})

const resetTimerBtn = document.getElementById('reset-timer-btn')
resetTimerBtn.addEventListener('click', () => {
    clearInterval(timerInterval); // Clear the timer interval when the timer is reset
    chrome.storage.local.set({
        timer: 0,
        isRunning: false,
    }, () => {
        startTimerBtn.textContent = "Start Timer"
    })
})

const addTaskBtn = document.getElementById('add-task-btn')
addTaskBtn.addEventListener('click', () => addTask())


chrome.storage.sync.get(['tasks'], (res) => {
    tasks = res.tasks ? res.tasks : []
    renderTasks()
})

function saveTasks() {
    chrome.storage.sync.set({
        tasks,
    })
}

function renderTask(tasksNum) {
    const taskRow = document.createElement('div')

    const text = document.createElement('input')
    text.type = 'text'
    text.placeholder = 'Enter task...'
    text.value = tasks[tasksNum]
    text.addEventListener("change", () => {
        tasks[tasksNum] = text.value
        saveTasks()
    })

    const deleteBtn = document.createElement('input')
    deleteBtn.type = 'button'
    deleteBtn.value = 'X'
    deleteBtn.addEventListener('click', () => {
        deleteTask(tasksNum)
    })

    taskRow.appendChild(text)
    taskRow.appendChild(deleteBtn)

    const taskContainer = document.getElementById('task-container')
    taskContainer.appendChild(taskRow)

}

function addTask() {
    if (tasks.length < 6) {
        const tasksNum = tasks.length;
        tasks.push("");
        renderTask(tasksNum);
        saveTasks();
    } else {
        console.log("Cannot add more than 6 tasks.");
    }
}

function deleteTask(tasksNum) {
    tasks.splice(tasksNum, 1)
    renderTasks()
    saveTasks()
}

function renderTasks() {
    const taskContainer = document.getElementById('task-container')
    taskContainer.textContent = ""
    tasks.forEach((taskText, tasksNum) => {
        renderTask(tasksNum)
    })

}

const optionsBtn = document.getElementById('options-btn')
optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});