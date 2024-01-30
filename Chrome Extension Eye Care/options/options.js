const timeOption = document.getElementById('time-option')
timeOption.addEventListener("change", (event) => {
    const val = event.target.value
    console.log(val)
    if (val < 1 || val > 60) {
        timeOption.value = 20
    }
})

const saveBtn = document.getElementById('save-btn')
saveBtn.addEventListener('click', () => {
    const timeOptionValue = parseInt(timeOption.value);
    chrome.storage.local.set({
        timer: 0,
        timeOption: timeOptionValue,
        isRunning: false,
    })
})

chrome.storage.local.get(['timeOption'], (res) => {
    timeOption.value = res.timeOption
})