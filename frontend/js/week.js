window.addEventListener('load', updateTimeIndicator, false );

var lastMin = -1;

function updateTimeIndicator() {
    let ind = document.getElementById("currentTimeIndicator");
    if (!ind) return;
    setTimeout(updateTimeIndicator, 5000); // run every 5s

    var d = new Date();
    var x = new Date(d.getTime() - d.getTimezoneOffset()*60*1000);

    var currentMinutes = x.getUTCHours()*60 + x.getUTCMinutes();
    if (currentMinutes < lastMin) {
        location.reload(); // reloading when we get to next day
        return;
    }
    lastMin = currentMinutes;

    var perc = currentMinutes / (24*60) * 100;
    ind.style.setProperty("top", perc + "%");
}
