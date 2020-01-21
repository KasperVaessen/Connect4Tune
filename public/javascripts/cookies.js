let TimesAccessed = 0;
let cookieList = document.cookie.split('; ');
let cookies = [];

for (let i = 0; i < cookieList.length; i++) {
    let cookie = cookieList[i].split("=");
    if (cookie[0] === "TimesAccessed") {
        TimesAccessed = parseInt(cookie[1]);
        break;
    }
}
TimesAccessed++;
document.cookie = "TimesAccessed=" + TimesAccessed + "; expires=Mon, 11-Sep-2020 08:46:40 EST";
document.getElementById("visits").innerHTML = "Times you visited: " + TimesAccessed;