let minutes = 0;
let seconds = 0;
let timer = setInterval(function() {
    seconds++;
    if(seconds == 60) {
        minutes++;
        seconds = 0;
    }
    let secondStr
    let minuteStr
    if(seconds < 10) {
        secondStr = '0' + seconds
    }
    else {
        secondStr = seconds
    }

    if(minutes < 10) {
        minuteStr = '0' + minutes;
    }
    else {
        minuteStr = minutes;
    }
    let time = (minuteStr + ':' + secondStr)
    let el = document.getElementById("timer")
    el.innerHTML = time;
}, 1000)