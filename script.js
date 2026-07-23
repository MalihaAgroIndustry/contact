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

// ==========================
// Dynamic Products V2
// ==========================

async function loadProducts() {

alert("loadProducts চলছে");

    const productList = document.getElementById("productList");

    if (!productList) return;

    const response = await fetch("data/products.json");

    const products = await response.json();

    productList.innerHTML = "";

    products.forEach(product => {

        productList.innerHTML += `

        <div class="product-card">

            ${product.offer ? '<span class="offer-badge">🔥 Offer</span>' : ''}

            <div class="slider">

                ${product.gallery.map((img,index)=>`

                    <img src="${img}"
                    class="product-img ${index===0?'active':''}"
                    alt="${product.name}">

                `).join("")}

            </div>

            <h3>${product.name}</h3>

            <p class="rating">
                ⭐⭐⭐⭐⭐ (${product.rating})
            </p>

            <p class="old-price">
                ৳${product.oldPrice}
            </p>

            <p class="price">
                ৳${product.price}
            </p>

            <span class="stock">
                🟢 ${product.stock}
            </span>

            <p>${product.description}</p>

            <a href="product.html?id=${product.id}" class="btn">
                📖 বিস্তারিত দেখুন
            </a>

        </div>

        `;

    });

}

loadProducts();

const detailsContainer = document.getElementById("productDetails");

if (detailsContainer) {

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    fetch("data/products.json")
    .then(res => res.json())
    .then(products => {

        const product = products.find(p => p.id === id);

        if (!product) {

            detailsContainer.innerHTML = "<h2>Product Not Found</h2>";

            return;

        }

        detailsContainer.innerHTML = `

<div class="product-details">

<div class="gallery">

<img src="${product.gallery[0]}" class="main-image" id="mainImage">

<div class="thumbnail-gallery">

${product.gallery.map(img => `
<img src="${img}" class="thumb">
`).join("")}

</div>

</div>

<h1>${product.name}</h1>

<p class="rating">
⭐⭐⭐⭐⭐ ${product.rating}
</p>

<p class="old-price">
৳${product.oldPrice}
</p>

<p class="price">
৳${product.price}
</p>

<p><b>Brand:</b> ${product.brand}</p>

<p><b>SKU:</b> ${product.sku}</p>

<p><b>Category:</b> ${product.category}</p>

<p><b>Weight:</b> ${product.weight}</p>

<p><b>Stock:</b> ${product.stock}</p>

<p>${product.description}</p>

<a href="https://wa.me/8801303679189?text=আমি ${product.name} অর্ডার করতে চাই" class="btn">
🛒 Order Now
</a>

<button class="btn" id="shareProduct">
📤 Share Product
</button>

</div>

        `;

setTimeout(() => {

    const mainImage = document.getElementById("mainImage");

    const thumbs = document.querySelectorAll(".thumb");

    thumbs.forEach(thumb => {

        thumb.addEventListener("click", () => {

            mainImage.src = thumb.src;

            thumbs.forEach(t => t.classList.remove("active"));

            thumb.classList.add("active");

        });

    });

const firstThumb = document.querySelector(".thumb");

if (firstThumb) {
    firstThumb.classList.add("active");
}

}, 100);

const shareBtn = document.getElementById("shareProduct");

if (shareBtn) {

    shareBtn.addEventListener("click", async () => {

        try {

            if (navigator.share) {

                await navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href
                });

            } else {

                await navigator.clipboard.writeText(window.location.href);

                alert("লিংক কপি হয়েছে ✅");

            }

        } catch (err) {
            console.log(err);
        }

    });

}
    });

}