"use strict";

// ==========================
// Global Variables
// ==========================

let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let deferredPrompt = null;

// ==========================
// Error Handler
// ==========================

window.onerror = function(message, source, line, col, error){

    console.error("ERROR:", message);
    console.error("FILE:", source);
    console.error("LINE:", line);

};

// ==========================
// DOM Ready
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    initShareCard();
    initSaveContact();
    initPWA();
    initWishlist();
    initImagePreview();
    initSearchFilter();

    if(document.getElementById("productList")){
        loadProducts("all");
    }

    if(document.getElementById("productDetails")){
        loadProductDetails();
    }

});

// ==========================
// Share Card
// ==========================

function initShareCard(){

    const btn = document.getElementById("shareCard");

    if(!btn) return;

    btn.addEventListener("click", async(e)=>{

        e.preventDefault();

        if(navigator.share){

            try{

                await navigator.share({

                    title:"Maliha Agro Industry",

                    text:"Digital Business Card",

                    url:window.location.href

                });

            }catch(err){

                console.log(err);

            }

        }else{

            navigator.clipboard.writeText(window.location.href);

            alert("লিংক কপি হয়েছে");

        }

    });

}

// ==========================
// Save Contact
// ==========================

function initSaveContact(){

    const btn = document.getElementById("saveContact");

    if(!btn) return;

    btn.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href = "contact.vcf";

    });

}

// ==========================
// PWA Install
// ==========================

function initPWA(){

    const installBtn = document.getElementById("installApp");

    if(!installBtn) return;

    installBtn.style.display = "none";

    window.addEventListener("beforeinstallprompt",(e)=>{

        e.preventDefault();

        deferredPrompt = e;

        installBtn.style.display = "flex";

    });

    installBtn.addEventListener("click",async()=>{

        if(!deferredPrompt) return;

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt = null;

        installBtn.style.display = "none";

    });

    window.addEventListener("appinstalled",()=>{

        installBtn.style.display = "none";

    });

}

// ==========================
// Wishlist Counter
// ==========================

function updateWishlistCounter(){

    const counter = document.getElementById("wishlistCounter");

    if(counter){

        counter.innerHTML = `❤️ Wishlist (${wishlist.length})`;

    }

}

// ==========================
// Wishlist
// ==========================

function initWishlist(){

    document.querySelectorAll(".wishlist-btn").forEach(btn=>{

        const id = Number(btn.dataset.id);

        if(wishlist.includes(id)){

            btn.classList.add("active");
            btn.innerHTML = "❤️";

        }else{

            btn.classList.remove("active");
            btn.innerHTML = "🤍";

        }

        btn.onclick = ()=>{

            if(wishlist.includes(id)){

                wishlist = wishlist.filter(item=>item!==id);

            }else{

                wishlist.push(id);

            }

            localStorage.setItem(
                "wishlist",
                JSON.stringify(wishlist)
            );

            updateWishlistCounter();

            initWishlist();

        };

    });

    updateWishlistCounter();

}

// ==========================
// Full Screen Image Preview
// ==========================

function initImagePreview(){

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".close-modal");

    if(!modal || !modalImg || !closeBtn) return;

    document.addEventListener("click",(e)=>{

        if(e.target.classList.contains("product-img")){

            modal.style.display = "flex";
            modalImg.src = e.target.src;

        }

    });

    closeBtn.onclick = ()=>{

        modal.style.display = "none";

    };

    modal.onclick = (e)=>{

        if(e.target===modal){

            modal.style.display = "none";

        }

    };

}

// ==========================
// Search + Filter
// ==========================

function initSearchFilter(){

    const search = document.getElementById("searchProduct");

    if(search){

        search.addEventListener("input",()=>{

            const active =
            document.querySelector(".filter-btn.active");

            loadProducts(
                active ? active.dataset.category : "all"
            );

        });

    }

    const sort = document.getElementById("sortProducts");

    if(sort){

        sort.addEventListener("change",()=>{

            const active =
            document.querySelector(".filter-btn.active");

            loadProducts(
                active ? active.dataset.category : "all"
            );

        });

    }

    document.querySelectorAll(".filter-btn").forEach(btn=>{

        btn.addEventListener("click",()=>{

            document.querySelectorAll(".filter-btn")
            .forEach(b=>b.classList.remove("active"));

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

    try {

        const res = await fetch("data/products.json");
        const products = await res.json();

        const keyword =
            document.getElementById("searchProduct")?.value.toLowerCase() || "";

        let filtered = products.filter(product => {

            const matchCategory =
                category === "all" || product.category === category;

            const matchSearch =
                product.name.toLowerCase().includes(keyword) ||
                product.type.toLowerCase().includes(keyword) ||
                product.description.toLowerCase().includes(keyword);

            return matchCategory && matchSearch;

        });

        const sort =
            document.getElementById("sortProducts")?.value || "default";

        switch (sort) {

            case "low-high":
                filtered.sort((a, b) => a.price - b.price);
                break;

            case "high-low":
                filtered.sort((a, b) => b.price - a.price);
                break;

            case "new":
                filtered.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
                break;

            case "best":
                filtered.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
                break;

            default:
                filtered.sort((a, b) => a.id - b.id);

        }

        productList.innerHTML = "";
        filtered.forEach(product => {

            productList.innerHTML += `

<div class="product-card">

${product.offer ? '<span class="offer-badge">🔥 Offer</span>' : ""}

<div class="slider">

<button class="wishlist-btn" data-id="${product.id}">🤍</button>

${product.gallery.map((img,index)=>`
<img src="${img}"
class="product-img ${index===0?"active":""}"
alt="${product.name}">
`).join("")}

</div>

<h3>${product.name}</h3>

<p class="rating">⭐⭐⭐⭐⭐ (${product.rating})</p>

<p class="old-price">৳${product.oldPrice}</p>

<p class="price">৳${product.price}</p>

<span class="stock">🟢 ${product.stock}</span>

<p>${product.description}</p>

<a href="product.html?id=${product.id}" class="btn">

📖 বিস্তারিত দেখুন

</a>

</div>

`;

        });

        initWishlist();

        initImagePreview();

    } catch(err){

        console.error(err);

        productList.innerHTML =
        "<h2>❌ Product Load Failed</h2>";

    }

}
// ==========================
// Product Details
// ==========================

async function loadProductDetails() {

    const details = document.getElementById("productDetails");

    if (!details) return;

    try {

        const id = Number(
            new URLSearchParams(window.location.search).get("id")
        );

        const res = await fetch("data/products.json");
        const products = await res.json();

        const product = products.find(p => p.id === id);

        if (!product) {

            details.innerHTML =
                "<h2>❌ Product Not Found</h2>";

            return;

        }

        details.innerHTML = `

<div class="product-details">

    <div class="product-slider">

        ${product.gallery.map((img,index)=>`

        <img src="${img}"
        class="product-img ${index===0?"active":""}"
        alt="${product.name}">

        `).join("")}

    </div>

    <div class="thumbnail-gallery" id="thumbnailGallery"></div>

    <div class="price-box">

        <p class="old-price">৳${product.oldPrice}</p>

        <p class="price">৳${product.price}</p>

        <span class="discount">
            🔥 ${Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
        </span>

    </div>

    <div class="stock-box">
        🟢 ${product.stock}
    </div>

    <div class="slider-dots">

        ${product.gallery.map((_,index)=>`

        <span class="dot ${index===0?"active":""}"></span>

        `).join("")}

    </div>

    <h1>${product.name}</h1>

    <p class="rating">⭐⭐⭐⭐⭐ ${product.rating}</p>

    <p><b>Brand:</b> ${product.brand}</p>

    <p><b>Type:</b> ${product.type}</p>

    <p><b>SKU:</b> ${product.sku}</p>

    <p><b>Weight:</b> ${product.weight}</p>

    <p><b>Stock:</b> ${product.stock}</p>

    <p>${product.description}</p>

    <a class="btn"
    href="https://wa.me/8801303679189?text=${encodeURIComponent(
`আমি ${product.name} অর্ডার করতে চাই।
মূল্য: ৳${product.price}

${window.location.href}`
)}">
        🛒 Order Now
    </a>

    <button id="shareProduct" class="btn">
        📤 Share Product
    </button>

    <div class="quantity-box">

    <h3>পরিমাণ</h3>

    <div class="qty-control">

        <button id="minusQty">−</button>

        <input type="text" id="qty" value="1" readonly>

        <button id="plusQty">+</button>

    </div>

    <p class="total-price">
        মোট মূল্য:
        <span id="totalPrice">৳${product.price}</span>
    </p>

</div>

</div>

`;
        let qty = 1;

const qtyInput = document.getElementById("qty");
const totalPrice = document.getElementById("totalPrice");

function updateTotal(){

    qtyInput.value = qty;
    totalPrice.innerText = "৳" + (product.price * qty);

}

document.getElementById("plusQty").onclick = ()=>{

    qty++;
    updateTotal();

};

document.getElementById("minusQty").onclick = ()=>{

    if(qty>1){

        qty--;

        updateTotal();

    }

};

updateTotal();

        // ==========================
// Product Slider
// ==========================

const images = details.querySelectorAll(".product-slider .product-img");
const dots = details.querySelectorAll(".dot");

// Thumbnail Gallery

const thumbnailGallery = document.getElementById("thumbnailGallery");

if (thumbnailGallery) {

    thumbnailGallery.innerHTML = "";

    product.gallery.forEach((img, index) => {

        thumbnailGallery.innerHTML += `
<img src="${img}"
class="${index===0?"active":""}"
onclick="changeImage(${index})">
`;

    });

}

if (images.length > 1 && dots.length > 0) {

    let currentIndex = 0;

    setInterval(() => {

        images[currentIndex].classList.remove("active");
        dots[currentIndex].classList.remove("active");

        currentIndex = (currentIndex + 1) % images.length;

        images[currentIndex].classList.add("active");
        dots[currentIndex].classList.add("active");

    }, 3000);

}

// Share Product

        document.getElementById("shareProduct")?.addEventListener("click", async () => {

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

        });

        // Related Products

        const related = document.getElementById("relatedProducts");

if (related) {

    related.innerHTML = "";

    products
        .filter(p => p.id !== product.id)
        .slice(0,3)
        .forEach(item=>{

            related.innerHTML += `

<div class="product-card">

    <img src="${item.gallery[0]}"
         class="related-img"
         alt="${item.name}">

    <h3>${item.name}</h3>

    <p class="price">৳${item.price}</p>

    <a href="product.html?id=${item.id}" class="btn">
        📖 বিস্তারিত দেখুন
    </a>

</div>

`;

        });

}

    } catch (err) {

    console.error(err);

    alert(err.message);

    details.innerHTML = `
        <h2>❌ Product Load Failed</h2>
    `;

}

}
loadProductDetails();

// ==========================
// Wishlist Page
// ==========================

const wishlistContainer = document.getElementById("wishlistProducts");

if (wishlistContainer) {

    fetch("data/products.json")
        .then(res => res.json())
        .then(products => {

            const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

            const wishlistItems = products.filter(product =>
                wishlist.includes(product.id)
            );

            if (wishlistItems.length === 0) {

                wishlistContainer.innerHTML = `
                    <h2>❤️ Wishlist খালি</h2>
                    <a href="products.html" class="btn">
                        📦 প্রোডাক্ট দেখুন
                    </a>
                `;

                return;
            }

            wishlistContainer.innerHTML = "";

            wishlistItems.forEach(product => {

                wishlistContainer.innerHTML += `
<div class="product-card">

    <img src="${product.gallery[0]}" class="product-img active">

    <h3>${product.name}</h3>

    <p class="price">৳${product.price}</p>

    <a href="product.html?id=${product.id}" class="btn">
        📖 বিস্তারিত দেখুন
    </a>

</div>
`;

            });

        });

}

function changeImage(index){

    const images = document.querySelectorAll(".product-slider .product-img");
    const thumbs = document.querySelectorAll("#thumbnailGallery img");
    const dots = document.querySelectorAll(".slider-dots .dot");

    images.forEach((img,i)=>{
        img.classList.toggle("active", i===index);
    });

    thumbs.forEach((img,i)=>{
        img.classList.toggle("active", i===index);
    });

    dots.forEach((dot,i)=>{
        dot.classList.toggle("active", i===index);
    });

}
