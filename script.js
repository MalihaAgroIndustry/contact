window.onerror = function(message, source, line) {
    alert("ERROR: " + message + " | Line: " + line);
};
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

async function loadProducts() {

    const productList = document.getElementById("productList");

    if (!productList) return;

    try {

        const response = await fetch("data/products.json");

        if (!response.ok) {
            throw new Error("Products JSON Load Failed");
        }

        const products = await response.json();

        productList.innerHTML = "";

        products.forEach(product => {

            let images = "";

            if (product.gallery && product.gallery.length > 0) {

                product.gallery.forEach((img, index) => {

                    images += `
                        <img src="${img}"
                             class="product-img ${index === 0 ? "active" : ""}"
                             alt="${product.name}">
                    `;

                });

            }

            productList.innerHTML += `
            <div class="product-card">

                ${product.offer ? '<span class="offer-badge">🔥 Offer</span>' : ""}

                <div class="slider">
                    ${images}
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

    } catch (err) {

        console.error(err);

        productList.innerHTML = "<h3>❌ Product Load Failed</h3>";

    }

}

loadProducts();

const searchInput = document.getElementById("searchProduct");

if (searchInput) {

    searchInput.addEventListener("input", () => {

        loadProducts();

    });

}

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        filterButtons.forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        loadProducts(btn.dataset.category);

    });

});

const detailsContainer = document.getElementById("productDetails");

if (detailsContainer) {

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    fetch("data/products.json")
.then(res => {
    if (!res.ok) {
        throw new Error("JSON Load Failed");
    }
    return res.json();
})
    .then(products => {
console.log(products);

        const product = products.find(p => p.id === id);

        if (!product) {

            detailsContainer.innerHTML = "<h2>Product Not Found</h2>";

            return;
        }

console.log(product.gallery);

        detailsContainer.innerHTML = `

<div class="product-details">

<div class="slider">

${(product.gallery || []).map((img,index)=>`
<img src="${img}"
class="product-img ${index===0 ? 'active' : ''}"
alt="${product.name}">
`).join("")}

</div>

<div class="slider-dots">

${(product.gallery || []).map((_,index)=>`
<span class="dot ${index===0 ? 'active' : ''}"></span>
`).join("")}

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

<p><b>Product Type:</b> ${product.type}</p>

<p><b>SKU:</b> ${product.sku}</p>

<p><b>Category:</b> ${product.category}</p>

<p><b>Weight:</b> ${product.weight}</p>

<p><b>Stock:</b> ${product.stock}</p>

<p>${product.description}</p>

<a href="https://wa.me/8801303679189?text=${encodeURIComponent(
`আসসালামু আলাইকুম,

আমি নিচের প্রোডাক্টটি অর্ডার করতে চাই।

🛍️ প্রোডাক্ট: ${product.name}
📦 ধরন: ${product.type}
💰 মূল্য: ৳${product.price}
⚖️ ওজন: ${product.weight}
🏷️ SKU: ${product.sku}

🔗 লিংক:
${window.location.href}

ধন্যবাদ।`
)}" class="btn">
🛒 Order Now
</a>

<button class="btn share-btn" id="shareProduct">
📤 Share Product
</button>

</div>

        `;

const slider = document.querySelector(".slider");

if (slider) {

    const images = slider.querySelectorAll(".product-img");
    const dots = document.querySelectorAll(".slider-dots .dot");

    let index = 0;

    function showSlide(i){

        images.forEach(img=>img.classList.remove("active"));
        dots.forEach(dot=>dot.classList.remove("active"));

        images[i].classList.add("active");
        dots[i].classList.add("active");

    }

    showSlide(0);

    setInterval(()=>{

        index++;

        if(index>=images.length){
            index=0;
        }

        showSlide(index);

    },3000);

}

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

// ==========================
// Related Products
// ==========================

const relatedContainer = document.getElementById("relatedProducts");

if (relatedContainer) {

    const relatedProducts = products
        .filter(item => item.id !== product.id)
        .slice(0,3);

    relatedContainer.innerHTML = "";

    relatedProducts.forEach(item=>{

        relatedContainer.innerHTML += `

        <div class="product-card">

            <div class="slider">

                <img src="${item.image}" class="product-img active" alt="${item.name}">

            </div>

            <h3>${item.name}</h3>

            <p class="price">৳${item.price}</p>

            <a href="product.html?id=${item.id}" class="btn">
                📖 বিস্তারিত দেখুন
            </a>

        </div>

        `;

    });

}

})
    .catch(err => {
        console.error(err);
        detailsContainer.innerHTML = "<h2>❌ Product Load Failed</h2>";
    });

}