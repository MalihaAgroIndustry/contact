// Share Button
const shareBtn = document.getElementById("shareCard");

if (shareBtn) {
  shareBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Maliha Agro Industry",
          text: "Maliha Agro Industry - Digital Business Card",
          url: window.location.href
        });
      } catch (err) {}
    } else {
      alert("আপনার ব্রাউজারে Share সাপোর্ট করে না।");
    }
  });
}

// Save Contact Button
const saveBtn = document.getElementById("saveContact");

if (saveBtn) {
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "contact.vcf";
  });
}
document.querySelectorAll(".slider").forEach(slider => {

    const images = slider.querySelectorAll(".product-img");
    const dots = slider.parentElement.querySelectorAll(".dot");

    let index = 0;

    setInterval(() => {

        images[index].classList.remove("active");

        if(dots.length){
            dots[index].classList.remove("active");
        }

        index = (index + 1) % images.length;

        images[index].classList.add("active");

        if(dots.length){
            dots[index].classList.add("active");
        }

    }, 3000);

});