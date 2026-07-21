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

// Full Screen Image Preview

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".close-modal");

    if (!modal || !modalImg || !closeBtn) return;

    document.querySelectorAll(".product-img").forEach(img => {

        img.addEventListener("click", () => {
            modal.style.display = "flex";
            modalImg.src = img.src;
        });

    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

});
// ==========================
// Install PWA App
// ==========================

let deferredPrompt;

const installBtn = document.getElementById("installApp");

if (installBtn) {
    installBtn.style.display = "none";

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();

        deferredPrompt = e;

        installBtn.style.display = "flex";
    });

    installBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt = null;

        installBtn.style.display = "none";
    });

    window.addEventListener("appinstalled", () => {
        installBtn.style.display = "none";
    });
}

// ==========================
// Product Search
// ==========================

const searchInput = document.getElementById("searchProduct");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        document.querySelectorAll(".product-card").forEach((card) => {

            const name = card.querySelector("h3").textContent.toLowerCase();

            if (name.includes(value)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }

        });

    });

}

// Animated Counter

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    const update = () => {

        const target = +counter.getAttribute("data-target");
        const count = +counter.innerText;

        const speed = target / 80;

        if(count < target){

            counter.innerText = Math.ceil(count + speed);

            setTimeout(update,20);

        }else{

            counter.innerText = target + "+";

        }

    };

    update();

});