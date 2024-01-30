let timer = 0;

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.timer) {
        timer = changes.timer.newValue;
    }
});

chrome.alarms.onAlarm.addListener((alarm) =>{
    if (alarm.name === "20-20-20 Timer") {
        chrome.storage.local.get(["isRunning","timeOption"], (res) => {
            if (res.isRunning) {
                let isRunning = true
                let timerInterval = setInterval(() => {
                    timer += 1
                    if (timer === 60 * res.timeOption){
                        this.registration.showNotification("20-20-20 Timer",{
                            body: "Time to take a break!",
                            body: `${res.timeOption} minutes have passed!`,
                            icon: "icon.png",
                        })
                        timer = 0
                        isRunning = false
                        clearInterval(timerInterval)
                    }
                    chrome.storage.local.set({
                        timer,
                        isRunning
                    })
                }, 1000)
            }
        })
    }
})

let timerInterval;

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.isRunning) {
        if (changes.isRunning.newValue) {
            startTimer();
        } else {
            stopTimer();
        }
    }
});

function startTimer() {
    chrome.storage.local.get(["timer", "timeOption"], (res) => {
        let timer = res.timer || 0;
        let timeOption = res.timeOption || 20;
        timerInterval = setInterval(() => {
            timer += 1;
            if (timer >= timeOption * 60) {
                timer = 0;
                chrome.storage.local.set({
                    timer,
                    isRunning: false
                });
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon.png',
                    title: '20-20-20 Timer',
                    message: 'Time to take a break!'
                });
                clearInterval(timerInterval);
                startTimer()
            } else {
                chrome.storage.local.set({
                    timer
                });
            }
        }, 1000);
    });
}

function stopTimer() {
    clearInterval(timerInterval);
}

chrome.storage.local.get(["isRunning"], (res) => {
    if (res.isRunning) {
        startTimer();
    }
});

chrome.storage.local.get(["timer", "isRunning","timeOption"], (res) => {
    chrome.storage.local.set({
        timer: "timer" in res ? res.timer : 0,
        timeOption: "timeOption" in res ? res.timeOption : 20,
        isRunning: "isRunning" in res ? res.isRunning : false,
    })
})