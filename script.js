"use strict";

// ==========================
// Error Handler
// ==========================
window.onerror = function (message, source, line) {
    console.error(message, source, line);
};

// ==========================
// Global Variables
// ==========================
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let deferredPrompt = null;

// ==========================
// DOM Ready
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    initShareCard();
    initSaveContact();
    initPWA();
    initWishlist();

    initImagePreview();

    initSearchAndFilter();

    if (document.getElementById("productList")) {
        loadProducts("all");
    }

    if (document.getElementById("productDetails")) {
        loadProductDetails();
    }

});

// ==========================
// Share Digital Card
// ==========================
function initShareCard() {

    const btn = document.getElementById("shareCard");

    if (!btn) return;

    btn.addEventListener("click", async (e) => {

        e.preventDefault();

        if (navigator.share) {

            try {

                await navigator.share({
                    title: "Maliha Agro Industry",
                    text: "Maliha Agro Industry - Digital Business Card",
                    url: window.location.href
                });

            } catch (err) {
                console.log(err);
            }

        } else {

            navigator.clipboard.writeText(window.location.href);

            alert("লিংক কপি হয়েছে");

        }

    });

}

// ==========================
// Save Contact
// ==========================
function initSaveContact() {

    const btn = document.getElementById("saveContact");

    if (!btn) return;

    btn.addEventListener("click", (e) => {

        e.preventDefault();

        window.location.href = "contact.vcf";

    });

}

// ==========================
// PWA Install
// ==========================
function initPWA() {

    const installBtn = document.getElementById("installApp");

    if (!installBtn) return;

    installBtn.style.display = "none";

    window.addEventListener("beforeinstallprompt", (e) => {

        e.preventDefault();

        deferredPrompt = e;

        installBtn.style.display = "flex";

    });

    installBtn.addEventListener("click", async () => {

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
// Wishlist
// ==========================

function updateWishlistCounter() {

    const counter = document.getElementById("wishlistCounter");

    if (counter) {
        counter.innerHTML = `❤️ Wishlist (${wishlist.length})`;
    }

}

function initWishlist() {

    document.querySelectorAll(".wishlist-btn").forEach(btn => {

        const id = Number(btn.dataset.id);

        if (wishlist.includes(id)) {
            btn.classList.add("active");
            btn.innerHTML = "❤️";
        } else {
            btn.classList.remove("active");
            btn.innerHTML = "🤍";
        }

        btn.onclick = () => {

            if (wishlist.includes(id)) {

                wishlist = wishlist.filter(item => item !== id);

            } else {

                wishlist.push(id);

            }

            localStorage.setItem("wishlist", JSON.stringify(wishlist));

            initWishlist();

            updateWishlistCounter();

        };

    });

    updateWishlistCounter();

}

// ==========================
// Full Screen Image Preview
// ==========================

function initImagePreview() {

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".close-modal");

    if (!modal || !modalImg || !closeBtn) return;

    document.addEventListener("click", (e) => {

        if (e.target.classList.contains("product-img")) {

            modal.style.display = "flex";
            modalImg.src = e.target.src;

        }

    });

    closeBtn.onclick = () => {

        modal.style.display = "none";

    };

    modal.onclick = (e) => {

        if (e.target === modal) {

            modal.style.display = "none";

        }

    };

}

// ==========================
// Search + Filter
// ==========================

function initSearchAndFilter() {

    const searchInput = document.getElementById("searchProduct");

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const active =
                document.querySelector(".filter-btn.active");

            loadProducts(
                active ? active.dataset.category : "all"
            );

        });

    }

    const sort = document.getElementById("sortProducts");

    if (sort) {

        sort.addEventListener("change", () => {

            const active =
                document.querySelector(".filter-btn.active");

            loadProducts(
                active ? active.dataset.category : "all"
            );

        });

    }

    document.querySelectorAll(".filter-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            document.querySelectorAll(".filter-btn")
                .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            loadProducts(btn.dataset.category);

        });

    });

}
// ==========================
// Load Products
// ==========================
async function loadProducts(category = "all") {

    const productList = document.getElementById("productList");
    if (!productList) return;

    const res = await fetch("data/products.json");
    const products = await res.json();

    productList.innerHTML = "";

    products
        .filter(p => category === "all" || p.category === category)
        .forEach(product => {

            productList.innerHTML += `
<div class="product-card">

<div class="slider">

<button class="wishlist-btn" data-id="${product.id}">🤍</button>

<img src="${product.gallery[0]}" class="product-img active">

</div>

<h3>${product.name}</h3>

<p class="price">৳${product.price}</p>

<a href="product.html?id=${product.id}" class="btn">
📖 বিস্তারিত দেখুন
</a>

</div>
`;

        });

    initWishlist();

}

// ==========================
// Product Details Page
// ==========================

const detailsContainer = document.getElementById("productDetails");

if (detailsContainer) {

    const id = Number(new URLSearchParams(window.location.search).get("id"));

    fetch("data/products.json")
        .then(res => res.json())
        .then(products => {

            const product = products.find(p => p.id === id);

            if (!product) {
                detailsContainer.innerHTML = "<h2>❌ Product Not Found</h2>";
                return;
            }

            detailsContainer.innerHTML = `

<div class="product-details">

<div class="slider">

${product.gallery.map((img,index)=>`
<img src="${img}" class="product-img ${index===0?"active":""}" alt="${product.name}">
`).join("")}

</div>

<div class="slider-dots">

${product.gallery.map((_,index)=>`
<span class="dot ${index===0?"active":""}"></span>
`).join("")}

</div>

<h1>${product.name}</h1>

<p class="rating">⭐⭐⭐⭐⭐ ${product.rating}</p>

<p class="old-price">৳${product.oldPrice}</p>

<p class="price">৳${product.price}</p>

<p><b>Brand:</b> ${product.brand}</p>
<p><b>Product Type:</b> ${product.type}</p>
<p><b>SKU:</b> ${product.sku}</p>
<p><b>Category:</b> ${product.category}</p>
<p><b>Weight:</b> ${product.weight}</p>
<p><b>Stock:</b> ${product.stock}</p>

<p>${product.description}</p>

<a class="btn"
href="https://wa.me/8801303679189?text=${encodeURIComponent(
`আসসালামু আলাইকুম,

আমি ${product.name} অর্ডার করতে চাই।

মূল্য: ৳${product.price}

লিংক:
${window.location.href}`
)}">

🛒 Order Now

</a>

<button id="shareProduct" class="btn">
📤 Share Product
</button>

</div>

<div id="relatedProducts"></div>

`;
                        // ==========================
            // Product Slider
            // ==========================

            const images = detailsContainer.querySelectorAll(".product-img");
            const dots = detailsContainer.querySelectorAll(".dot");

            if (images.length > 1) {

                let index = 0;

                setInterval(() => {

                    images[index].classList.remove("active");
                    dots[index].classList.remove("active");

                    index = (index + 1) % images.length;

                    images[index].classList.add("active");
                    dots[index].classList.add("active");

                }, 3000);

            }

            // ==========================
            // Share Product
            // ==========================

            document.getElementById("shareProduct")?.addEventListener("click", async () => {

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

            // ==========================
            // Related Products
            // ==========================

            const related = document.getElementById("relatedProducts");

            if (related) {

                related.innerHTML = "<h2>Related Products</h2>";

                products
                    .filter(item => item.id !== product.id)
                    .slice(0, 3)
                    .forEach(item => {

                        related.innerHTML += `

<div class="product-card">

    <div class="slider">

        <img src="${item.gallery[0]}"
             class="product-img active"
             alt="${item.name}">

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
