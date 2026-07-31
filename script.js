"use strict";

/*=====================================
MAI Product System V2
Maliha Agro Industry
=====================================*/

/*==============================
GLOBAL
==============================*/

let wishlist =
JSON.parse(localStorage.getItem("wishlist")) || [];

let deferredPrompt = null;


/*==============================
ERROR HANDLER
==============================*/

window.onerror=function(msg,file,line){

console.error(msg);
console.error(file);
console.error(line);

};


/*==============================
DOM READY
==============================*/

document.addEventListener("DOMContentLoaded",()=>{

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


/*==============================
SHARE CARD
==============================*/

function initShareCard(){

const btn=document.getElementById("shareCard");

if(!btn) return;

btn.onclick=async(e)=>{

e.preventDefault();

if(navigator.share){

await navigator.share({

title:"Maliha Agro Industry",

text:"Digital Business Card",

url:location.href

});

}else{

navigator.clipboard.writeText(location.href);

alert("লিংক কপি হয়েছে");

}

};

}


/*==============================
SAVE CONTACT
==============================*/

function initSaveContact(){

const btn=document.getElementById("saveContact");

if(!btn) return;

btn.onclick=(e)=>{

e.preventDefault();

location.href="contact.vcf";

};

}


/*==============================
PWA
==============================*/

function initPWA(){

const installBtn=document.getElementById("installApp");

if(!installBtn) return;

installBtn.style.display="none";

window.addEventListener("beforeinstallprompt",(e)=>{

e.preventDefault();

deferredPrompt=e;

installBtn.style.display="flex";

});

installBtn.onclick=async()=>{

if(!deferredPrompt) return;

deferredPrompt.prompt();

await deferredPrompt.userChoice;

installBtn.style.display="none";

};

}


/*==============================
WISHLIST COUNTER
==============================*/

function updateWishlistCounter(){

const counter=document.getElementById("wishlistCounter");

if(counter){

counter.innerHTML=
`❤️ Wishlist (${wishlist.length})`;

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
            details.innerHTML = "<h2>❌ Product Not Found</h2>";
            return;
        }

        details.innerHTML = `

<div class="product-details">

    <div class="product-slider">

        ${product.gallery.map((img,index)=>`

        <img
        src="${img}"
        class="product-img ${index===0?"active":""}"
        alt="${product.name}">

        `).join("")}

    </div>

    <div
    id="thumbnailGallery"
    class="thumbnail-gallery">
    </div>

    <div class="slider-dots">

        ${product.gallery.map((_,index)=>`

        <span
        class="dot ${index===0?"active":""}">
        </span>

        `).join("")}

    </div>

    <h1>${product.name}</h1>

    <p class="rating">
    ⭐⭐⭐⭐⭐ ${product.rating}
    </p>

    <div class="price-box">

        <p class="old-price">
        ৳${product.oldPrice}
        </p>

        <p class="price">
        ৳${product.price}
        </p>

        <span class="discount">
        🔥 ${Math.round((1-product.price/product.oldPrice)*100)}% OFF
        </span>

    </div>

    <div class="stock-box">
    🟢 ${product.stock}
    </div>

    <div class="quantity-box">

        <h3>পরিমাণ</h3>

        <div class="qty-control">

            <button id="minusQty">−</button>

            <input
            id="qty"
            type="text"
            value="1"
            readonly>

            <button id="plusQty">+</button>

        </div>

        <p class="total-price">

            মোট মূল্য :
            <span id="totalPrice">
            ৳${product.price}
            </span>

        </p>

    </div>

    <p><b>Brand :</b> ${product.brand}</p>

    <p><b>Type :</b> ${product.type}</p>

    <p><b>SKU :</b> ${product.sku}</p>

    <p><b>Weight :</b> ${product.weight}</p>

    <p>${product.description}</p>

    <a
    class="btn"
    href="https://wa.me/8801303679189?text=${encodeURIComponent(
`আমি ${product.name} অর্ডার করতে চাই।

মূল্য: ৳${product.price}

${window.location.href}`
)}">

🛒 Order Now

</a>

<button
id="shareProduct"
class="btn">

📤 Share Product

</button>

</div>

`;
        // ==========================
// Thumbnail Gallery
// ==========================

const slider = details.querySelector(".product-slider");

const images = slider.querySelectorAll(".product-img");

const thumbnailGallery = document.getElementById("thumbnailGallery");

const dots = details.querySelectorAll(".dot");

let currentIndex = 0;

// Thumbnail তৈরি

thumbnailGallery.innerHTML = "";

product.gallery.forEach((img, index) => {

    thumbnailGallery.innerHTML += `
        <img
            src="${img}"
            class="${index === 0 ? "active" : ""}"
            data-index="${index}">
    `;

});

const thumbs = thumbnailGallery.querySelectorAll("img");

// ==========================
// Change Image
// ==========================

function showImage(index){

    images.forEach(img=>img.classList.remove("active"));

    thumbs.forEach(img=>img.classList.remove("active"));

    dots.forEach(dot=>dot.classList.remove("active"));

    images[index].classList.add("active");

    thumbs[index].classList.add("active");

    dots[index].classList.add("active");

    currentIndex = index;

}

// Thumbnail Click

thumbs.forEach((thumb,index)=>{

    thumb.addEventListener("click",()=>{

        showImage(index);

    });

});

// ==========================
// Auto Slider
// ==========================

if(images.length>1){

    setInterval(()=>{

        currentIndex++;

        if(currentIndex>=images.length){

            currentIndex=0;

        }

        showImage(currentIndex);

    },3000);

}
        // ==========================
// Quantity
// ==========================

let qty = 1;

const qtyInput = document.getElementById("qty");
const totalPrice = document.getElementById("totalPrice");

function updateTotal(){

    qtyInput.value = qty;

    totalPrice.innerHTML = "৳" + (product.price * qty);

}

document.getElementById("plusQty").addEventListener("click",()=>{

    qty++;

    updateTotal();

});

document.getElementById("minusQty").addEventListener("click",()=>{

    if(qty>1){

        qty--;

        updateTotal();

    }

});

updateTotal();


// ==========================
// Share Product
// ==========================

document.getElementById("shareProduct").addEventListener("click",async()=>{

    if(navigator.share){

        await navigator.share({

            title:product.name,

            text:product.description,

            url:window.location.href

        });

    }else{

        await navigator.clipboard.writeText(window.location.href);

        alert("লিংক কপি হয়েছে ✅");

    }

});


// ==========================
// Related Products
// ==========================

const related = document.getElementById("relatedProducts");

if(related){

    related.innerHTML = "";

    products

    .filter(p=>p.id!==product.id)

    .slice(0,3)

    .forEach(item=>{

        related.innerHTML += `

<div class="product-card">

<div class="slider">

<img
src="${item.gallery[0]}"
class="related-img"
alt="${item.name}">

</div>

<h3>${item.name}</h3>

<p class="price">

৳${item.price}

</p>

<a
href="product.html?id=${item.id}"
class="btn">

📖 বিস্তারিত দেখুন

</a>

</div>

`;

    });

}


// ==========================
// Image Preview
// ==========================

const modal = document.getElementById("imageModal");

const modalImg = document.getElementById("modalImage");

const closeModal = document.querySelector(".close-modal");

images.forEach(img=>{

    img.addEventListener("click",()=>{

        modal.style.display="flex";

        modalImg.src = img.src;

    });

});

closeModal.onclick=()=>{

    modal.style.display="none";

};

modal.onclick=(e)=>{

    if(e.target===modal){

        modal.style.display="none";

    }

};
     }catch(err){

        console.error(err);

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

if(wishlistContainer){

    fetch("data/products.json")

    .then(res=>res.json())

    .then(products=>{

        const wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

        const wishlistItems = products.filter(product=>

            wishlist.includes(product.id)

        );

        if(wishlistItems.length===0){

            wishlistContainer.innerHTML = `

<h2>❤️ Wishlist খালি</h2>

<a href="products.html" class="btn">

📦 প্রোডাক্ট দেখুন

</a>

`;

            return;

        }

        wishlistContainer.innerHTML = "";

        wishlistItems.forEach(product=>{

            wishlistContainer.innerHTML += `

<div class="product-card">

<img
src="${product.gallery[0]}"
class="product-img"
alt="${product.name}">

<h3>${product.name}</h3>

<p class="price">

৳${product.price}

</p>

<a
href="product.html?id=${product.id}"
class="btn">

📖 বিস্তারিত দেখুন

</a>

</div>

`;

        });

    });

}


// ==========================
// Change Image
// ==========================

function changeImage(index){

    const images =
    document.querySelectorAll(".product-slider .product-img");

    const thumbs =
    document.querySelectorAll("#thumbnailGallery img");

    const dots =
    document.querySelectorAll(".slider-dots .dot");

    images.forEach(img=>img.classList.remove("active"));

    thumbs.forEach(img=>img.classList.remove("active"));

    dots.forEach(dot=>dot.classList.remove("active"));

    images[index].classList.add("active");

    thumbs[index].classList.add("active");

    dots[index].classList.add("active");

}
