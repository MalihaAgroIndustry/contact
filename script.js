"use strict";

/* ==========================================================
   Maliha Agro Industry
   JavaScript v4
========================================================== */

/* ==========================
   GLOBAL VARIABLES
========================== */

let wishlist =
JSON.parse(localStorage.getItem("wishlist")) || [];

let deferredPrompt = null;

let products = [];

let currentProduct = null;

/* ==========================
   SHORTCUTS
========================== */

const $ = selector => document.querySelector(selector);

const $$ = selector => document.querySelectorAll(selector);

/* ==========================
   ERROR HANDLER
========================== */

window.onerror = function(message,file,line,column,error){

    console.error("ERROR :",message);

    console.error("FILE :",file);

    console.error("LINE :",line);

};

/* ==========================
   DOM READY
========================== */

document.addEventListener("DOMContentLoaded",()=>{

    console.log("✅ JavaScript v4 Loaded");

    updateWishlistCounter();

    initShareCard();

    initSaveContact();

    initPWA();

});

/* ==========================
   HELPER FUNCTIONS
========================== */

function formatPrice(price){

    return "৳" + Number(price).toLocaleString("en-BD");

}

function getProductId(){

    return Number(

        new URLSearchParams(window.location.search).get("id")

    );

}

/* ==========================================================
   SECTION 02
   SHARE + SAVE CONTACT + PWA + NAVIGATION
========================================================== */

/* ==========================
   SHARE CARD
========================== */

function initShareCard(){

    const btn = $("#shareCard");

    if(!btn) return;

    btn.addEventListener("click",async(e)=>{

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

            alert("✅ লিংক কপি হয়েছে");

        }

    });

}

/* ==========================
   SAVE CONTACT
========================== */

function initSaveContact(){

    const btn = $("#saveContact");

    if(!btn) return;

    btn.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href="contact.vcf";

    });

}

/* ==========================
   PWA INSTALL
========================== */

function initPWA(){

    const installBtn=$("#installApp");

    if(!installBtn) return;

    installBtn.style.display="none";

    window.addEventListener("beforeinstallprompt",(e)=>{

        e.preventDefault();

        deferredPrompt=e;

        installBtn.style.display="flex";

    });

    installBtn.addEventListener("click",async()=>{

        if(!deferredPrompt) return;

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt=null;

        installBtn.style.display="none";

    });

    window.addEventListener("appinstalled",()=>{

        installBtn.style.display="none";

    });

}

/* ==========================
   ACTIVE MENU
========================== */

function initBottomNavigation(){

    const page=window.location.pathname.split("/").pop();

    $$(".bottom-nav a").forEach(link=>{

        link.classList.remove("active");

        const href=link.getAttribute("href");

        if(href===page){

            link.classList.add("active");

        }

    });

}

initBottomNavigation();

/* ==========================================================
   SECTION 03
   LOAD PRODUCTS + SEARCH + CATEGORY + SORT
========================================================== */

/* ==========================
   LOAD PRODUCTS
========================== */

async function loadProducts(category="all"){

    const productList=$("#productList");

    if(!productList) return;

    try{

        const res=await fetch("data/products.json");

        products=await res.json();

        const keyword=$("#searchProduct")
        ? $("#searchProduct").value.toLowerCase()
        : "";

        let filtered=products.filter(product=>{

            const matchCategory=
            category==="all" ||
            product.category===category;

            const matchSearch=

            product.name.toLowerCase().includes(keyword) ||

            product.type.toLowerCase().includes(keyword) ||

            product.description.toLowerCase().includes(keyword);

            return matchCategory && matchSearch;

        });

        const sort=$("#sortProducts")
        ? $("#sortProducts").value
        : "default";

        switch(sort){

            case "low-high":

                filtered.sort((a,b)=>a.price-b.price);

                break;

            case "high-low":

                filtered.sort((a,b)=>b.price-a.price);

                break;

            case "new":

                filtered.sort((a,b)=>
                    Number(b.newArrival)-Number(a.newArrival));

                break;

            case "best":

                filtered.sort((a,b)=>
                    Number(b.bestSeller)-Number(a.bestSeller));

                break;

            default:

                filtered.sort((a,b)=>a.id-b.id);

        }

        productList.innerHTML="";

        filtered.forEach(product=>{

            productList.innerHTML+=`

<div class="product-card">

${product.offer ? '<span class="offer-badge">🔥 Offer</span>' : ""}

<button class="wishlist-btn"
data-id="${product.id}">
🤍
</button>

<div class="slider">

${product.gallery.map((img,index)=>`

<img src="${img}"

class="product-img ${index===0?"active":""}"

alt="${product.name}">

`).join("")}

</div>

<h3>${product.name}</h3>

<p class="rating">

⭐⭐⭐⭐⭐ (${product.rating})

</p>

<p class="old-price">

${formatPrice(product.oldPrice)}

</p>

<p class="price">

${formatPrice(product.price)}

</p>

<span class="stock">

🟢 ${product.stock}

</span>

<p>

${product.description}

</p>

<a href="product.html?id=${product.id}"

class="btn">

📖 বিস্তারিত দেখুন

</a>

</div>

`;

        });

        initWishlist();

        startHomeSlider();

    }

    catch(err){

        console.error(err);

        productList.innerHTML=`

<h2>

❌ Product Load Failed

</h2>

`;

    }

}

/* ==========================
   SEARCH
========================== */

function initSearch(){

    const input=$("#searchProduct");

    if(!input) return;

    input.addEventListener("input",()=>{

        const active=

        $(".filter-btn.active");

        loadProducts(

            active
            ? active.dataset.category
            : "all"

        );

    });

}

/* ==========================
   CATEGORY
========================== */

function initCategoryFilter(){

    $$(".filter-btn").forEach(btn=>{

        btn.addEventListener("click",()=>{

            $$(".filter-btn").forEach(b=>

                b.classList.remove("active")

            );

            btn.classList.add("active");

            loadProducts(btn.dataset.category);

        });

    });

}

/* ==========================
   SORT
========================== */

function initSort(){

    const select=$("#sortProducts");

    if(!select) return;

    select.addEventListener("change",()=>{

        const active=$(".filter-btn.active");

        loadProducts(

            active
            ? active.dataset.category
            : "all"

        );

    });

}

/* ==========================================================
   SECTION 04
   PRODUCT DETAILS
========================================================== */

async function loadProductDetails(){

    const details=$("#productDetails");

    if(!details) return;

    try{

        const id=getProductId();

        if(products.length===0){

            const res=await fetch("data/products.json");

            products=await res.json();

        }

        currentProduct=

        products.find(p=>p.id===id);

        if(!currentProduct){

            details.innerHTML="<h2>❌ Product Not Found</h2>";

            return;

        }

        details.innerHTML=`

<div class="product-details">

<div class="slider">

${currentProduct.gallery.map((img,index)=>`

<img src="${img}"

class="product-img ${index===0?"active":""}"

alt="${currentProduct.name}">

`).join("")}

</div>

<div class="slider-dots">

${currentProduct.gallery.map((_,index)=>`

<span class="dot ${index===0?"active":""}"></span>

`).join("")}

</div>

<h1>${currentProduct.name}</h1>

<p class="rating">

⭐⭐⭐⭐⭐ ${currentProduct.rating}

</p>

<div class="price-box">

<p class="old-price">

${formatPrice(currentProduct.oldPrice)}

</p>

<p class="price">

${formatPrice(currentProduct.price)}

</p>

</div>

<div class="stock-box">

🟢 ${currentProduct.stock}

</div>

<p><b>Brand :</b> ${currentProduct.brand}</p>

<p><b>Type :</b> ${currentProduct.type}</p>

<p><b>SKU :</b> ${currentProduct.sku}</p>

<p><b>Weight :</b> ${currentProduct.weight}</p>

<p>

${currentProduct.description}

</p>

<div class="quantity-box">

<h3>পরিমাণ</h3>

<div class="qty-control">

<button id="minusQty">−</button>

<input id="qty"

type="text"

value="1"

readonly>

<button id="plusQty">+</button>

</div>

<p class="total-price">

মোট মূল্য :

<span id="totalPrice">

${formatPrice(currentProduct.price)}

</span>

</p>

</div>

<a

class="btn"

href="https://wa.me/8801303679189?text=${encodeURIComponent(

`আমি ${currentProduct.name} অর্ডার করতে চাই।

মূল্য : ${currentProduct.price}

${window.location.href}`

)}">

🛒 Order Now

</a>

<button

class="btn"

id="shareProduct">

📤 Share Product

</button>

</div>

`;

        startProductSlider();

        initQuantity();

        initShareProduct();

        loadRelatedProducts();

    }

    catch(err){

        console.error(err);

        details.innerHTML="<h2>❌ Product Load Failed</h2>";

    }

}

/* ==========================================================
   SECTION 05
   SLIDER + QUANTITY + SHARE + RELATED PRODUCTS
========================================================== */

/* ==========================
   PRODUCT SLIDER
========================== */

function startProductSlider(){

    const images=$$("#productDetails .slider .product-img");

    const dots=$$("#productDetails .dot");

    if(images.length<=1) return;

    let current=0;

    setInterval(()=>{

        images[current].classList.remove("active");
        dots[current].classList.remove("active");

        current++;

        if(current>=images.length){

            current=0;

        }

        images[current].classList.add("active");
        dots[current].classList.add("active");

    },3000);

}

/* ==========================
   HOME PAGE SLIDER
========================== */

function startHomeSlider(){

    document.querySelectorAll(".product-card .slider").forEach(slider=>{

        const images=slider.querySelectorAll(".product-img");

        if(images.length<=1) return;

        let current=0;

        setInterval(()=>{

            images[current].classList.remove("active");

            current++;

            if(current>=images.length){

                current=0;

            }

            images[current].classList.add("active");

        },3000);

    });

}

/* ==========================
   QUANTITY
========================== */

function initQuantity(){

    let qty=1;

    const qtyInput=$("#qty");

    const total=$("#totalPrice");

    const plus=$("#plusQty");

    const minus=$("#minusQty");

    if(!qtyInput) return;

    function update(){

        qtyInput.value=qty;

        total.innerHTML=

        formatPrice(currentProduct.price*qty);

    }

    plus.onclick=()=>{

        qty++;

        update();

    };

    minus.onclick=()=>{

        if(qty>1){

            qty--;

            update();

        }

    };

    update();

}

/* ==========================
   SHARE PRODUCT
========================== */

function initShareProduct(){

    const btn=$("#shareProduct");

    if(!btn) return;

    btn.onclick=async()=>{

        if(navigator.share){

            try{

                await navigator.share({

                    title:currentProduct.name,

                    text:currentProduct.description,

                    url:window.location.href

                });

            }catch(err){

                console.log(err);

            }

        }else{

            navigator.clipboard.writeText(

                window.location.href

            );

            alert("✅ লিংক কপি হয়েছে");

        }

    };

}

/* ==========================
   RELATED PRODUCTS
========================== */

function loadRelatedProducts(){

    const related=$("#relatedProducts");

    if(!related) return;

    related.innerHTML="";

    products

    .filter(p=>p.id!==currentProduct.id)

    .slice(0,4)

    .forEach(item=>{

        related.innerHTML+=`

<div class="product-card">

<div class="slider">

<img

src="${item.gallery[0]}"

class="product-img active"

alt="${item.name}">

</div>

<h3>${item.name}</h3>

<p class="price">

${formatPrice(item.price)}

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

/* ==========================================================
   SECTION 06
   WISHLIST SYSTEM
========================================================== */

/* ==========================
   UPDATE WISHLIST COUNTER
========================== */

function updateWishlistCounter(){

    const counter=$("#wishlistCounter");

    if(!counter) return;

    counter.innerHTML=`❤️ Wishlist (${wishlist.length})`;

}

/* ==========================
   INIT WISHLIST
========================== */

function initWishlist(){

    $$(".wishlist-btn").forEach(btn=>{

        const id=Number(btn.dataset.id);

        if(wishlist.includes(id)){

            btn.innerHTML="❤️";

            btn.classList.add("active");

        }else{

            btn.innerHTML="🤍";

            btn.classList.remove("active");

        }

        btn.onclick=()=>{

            toggleWishlist(id);

        };

    });

    updateWishlistCounter();

}

/* ==========================
   TOGGLE WISHLIST
========================== */

function toggleWishlist(id){

    if(wishlist.includes(id)){

        wishlist=wishlist.filter(item=>item!==id);

    }else{

        wishlist.push(id);

    }

    localStorage.setItem(

        "wishlist",

        JSON.stringify(wishlist)

    );

    initWishlist();

}

/* ==========================
   LOAD WISHLIST PAGE
========================== */

function loadWishlistPage(){

    const container=$("#wishlistProducts");

    if(!container) return;

    container.innerHTML="";

    const items=products.filter(product=>

        wishlist.includes(product.id)

    );

    if(items.length===0){

        container.innerHTML=`

<h2>❤️ Wishlist খালি</h2>

<a href="products.html"

class="btn">

📦 প্রোডাক্ট দেখুন

</a>

`;

        return;

    }

    items.forEach(product=>{

        container.innerHTML+=`

<div class="product-card">

<div class="slider">

<img

src="${product.gallery[0]}"

class="product-img active"

alt="${product.name}">

</div>

<h3>${product.name}</h3>

<p class="price">

${formatPrice(product.price)}

</p>

<a

href="product.html?id=${product.id}"

class="btn">

📖 বিস্তারিত দেখুন

</a>

<button

class="btn removeWishlist"

data-id="${product.id}">

🗑 Remove

</button>

</div>

`;

    });

    document

    .querySelectorAll(".removeWishlist")

    .forEach(btn=>{

        btn.onclick=()=>{

            toggleWishlist(

                Number(btn.dataset.id)

            );

            loadWishlistPage();

        };

    });

}

/* ==========================================================
   SECTION 07
   IMAGE PREVIEW + FINAL INITIALIZATION
========================================================== */

/* ==========================
   IMAGE PREVIEW
========================== */

function initImagePreview(){

    const modal=$("#imageModal");
    const modalImg=$("#modalImage");
    const close=$(".close-modal");

    if(!modal || !modalImg || !close) return;

    document.addEventListener("click",(e)=>{

        if(e.target.classList.contains("product-img")){

            modal.style.display="flex";

            modalImg.src=e.target.src;

        }

    });

    close.onclick=()=>{

        modal.style.display="none";

    };

    modal.onclick=(e)=>{

        if(e.target===modal){

            modal.style.display="none";

        }

    };

}

/* ==========================
   CHANGE IMAGE
========================== */

function changeImage(index){

    const images=$$("#productDetails .slider .product-img");

    const dots=$$("#productDetails .dot");

    images.forEach(img=>img.classList.remove("active"));

    dots.forEach(dot=>dot.classList.remove("active"));

    images[index].classList.add("active");

    dots[index].classList.add("active");

}

/* ==========================
   FINAL INITIALIZATION
========================== */

document.addEventListener("DOMContentLoaded",async()=>{

    initShareCard();

    initSaveContact();

    initPWA();

    initImagePreview();

    updateWishlistCounter();

    if($("#productList")){

        initSearch();

        initSort();

        initCategoryFilter();

        await loadProducts("all");

    }

    if($("#productDetails")){

        await loadProductDetails();

    }

    if($("#wishlistProducts")){

        if(products.length===0){

            const res=await fetch("data/products.json");

            products=await res.json();

        }

        loadWishlistPage();

    }

});

/* ==========================================================
   SECTION 08
   CONTACT PAGE
   FORM + WHATSAPP + BACK TO TOP
   Maliha Agro Industry
========================================================== */


/* ==========================================================
   CONTACT FORM
========================================================== */

function initContactForm(){

    const form = $("#contactForm");

    if(!form) return;

    const status = $("#contactFormStatus");

    form.addEventListener("submit",(e)=>{

        e.preventDefault();

        const name =
            $("#contactName")?.value.trim() || "";

        const phone =
            $("#contactPhone")?.value.trim() || "";

        const email =
            $("#contactEmail")?.value.trim() || "";

        const subject =
            $("#contactSubject")?.value.trim() || "";

        const message =
            $("#contactMessage")?.value.trim() || "";


        /* ==========================
           VALIDATION
        ========================== */

        if(!name){

            showContactStatus(
                "❌ আপনার নাম লিখুন।",
                "error"
            );

            $("#contactName")?.focus();

            return;

        }


        if(!phone){

            showContactStatus(
                "❌ আপনার মোবাইল নম্বর লিখুন।",
                "error"
            );

            $("#contactPhone")?.focus();

            return;

        }


        if(!subject){

            showContactStatus(
                "❌ বিষয় নির্বাচন করুন।",
                "error"
            );

            $("#contactSubject")?.focus();

            return;

        }


        if(!message){

            showContactStatus(
                "❌ আপনার মেসেজ লিখুন।",
                "error"
            );

            $("#contactMessage")?.focus();

            return;

        }


        /* ==========================
           SUBJECT TEXT
        ========================== */

        const subjectText = {

            product:"পণ্য সম্পর্কে জানতে চাই",

            price:"মূল্য জানতে চাই",

            wholesale:"পাইকারি অর্ডার",

            dealer:"ডিলারশিপ",

            other:"অন্যান্য"

        };


        const selectedSubject =
            subjectText[subject] || subject;


        /* ==========================
           WHATSAPP MESSAGE
        ========================== */

        const whatsappMessage =

`🌿 Maliha Agro Industry

📩 নতুন Contact Message

👤 নাম:
${name}

📱 মোবাইল:
${phone}

📧 ই-মেইল:
${email || "দেওয়া হয়নি"}

📌 বিষয়:
${selectedSubject}

💬 মেসেজ:
${message}

━━━━━━━━━━━━━━
Maliha Agro Industry`;


        const whatsappURL =

        "https://wa.me/8801303679189?text=" +

        encodeURIComponent(whatsappMessage);


        /* ==========================
           STATUS
        ========================== */

        showContactStatus(
            "✅ WhatsApp-এ পাঠানোর জন্য প্রস্তুত...",
            "success"
        );


        /* ==========================
           OPEN WHATSAPP
        ========================== */

        setTimeout(()=>{

            window.open(
                whatsappURL,
                "_blank",
                "noopener"
            );

        },500);

    });

}


/* ==========================================================
   CONTACT FORM STATUS
========================================================== */

function showContactStatus(message,type="success"){

    const status = $("#contactFormStatus");

    if(!status) return;

    status.textContent = message;

    status.style.marginTop = "12px";

    status.style.padding = "10px";

    status.style.borderRadius = "10px";

    if(type==="error"){

        status.style.color = "#b71c1c";

        status.style.background = "#ffebee";

    }else{

        status.style.color = "#166C39";

        status.style.background = "#e9f8ef";

    }

}


/* ==========================================================
   BACK TO TOP
========================================================== */

function initBackToTop(){

    const btn = $("#backToTop");

    if(!btn) return;


    window.addEventListener("scroll",()=>{

        if(window.scrollY > 350){

            btn.classList.add("show");

        }else{

            btn.classList.remove("show");

        }

    });


    btn.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

}


/* ==========================================================
   CONTACT PAGE INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        initContactForm();

        initBackToTop();

    }
);

