// ===== MAI Digital Business Card =====

// Welcome Message
window.addEventListener("load", () => {
    console.log("Welcome to Maliha Agro Industry");
});

// Smooth Button Animation
const buttons = document.querySelectorAll(".btn");

buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        btn.style.transform = "scale(0.96)";
        setTimeout(() => {
            btn.style.transform = "scale(1)";
        }, 150);
    });
});

// Floating Effect
const card = document.querySelector(".card");

let move = 0;

setInterval(() => {
    move = move === 0 ? 8 : 0;
    card.style.transform = `translateY(${move}px)`;
}, 1800);

// Greeting
const hour = new Date().getHours();

if(hour < 12){
    console.log("Good Morning");
}else if(hour < 18){
    console.log("Good Afternoon");
}else{
    console.log("Good Evening");
}