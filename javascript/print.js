let circles = document.getElementById("circles");

let currentleft = 55;
let currenttop = 55;
const margin = 55;

for (let i = 1; i < 43; i++) {
    if((i-1)%6 == 0) {
        currentleft += margin;
        currenttop = 0; 
    }
    currenttop += margin;

    let circle = document.createElement("span");
    circle.classList.add("circle");
    circle.id = i;
    circle.style.left = currentleft + 'px';
    circle.style.top = currenttop + 'px';
    circles.appendChild(circle);
}