"use strict";

/* ==========================================================
   Maliha Agro Industry
   JavaScript v4 FINAL CLEAN
========================================================== */


/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let wishlist =
    JSON.parse(localStorage.getItem("wishlist")) || [];

let deferredPrompt = null;

let products = [];

let currentProduct = null;

let productSliderTimer = null;


/* ==========================================================
   SHORTCUTS
========================================================== */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    document.querySelectorAll(selector);


/* ==========================================================
   ERROR HANDLER
========================================================== */

window.onerror =
function(message, file, line, column, error){

    console.error("ERROR :", message);
    console.error("FILE  :", file);
    console.error("LINE  :", line);

};


/* ==========================================================
   HELPER FUNCTIONS
========================================================== */

function formatPrice(price){

    return "৳" +
        Number(price || 0)
        .toLocaleString("en-BD");

}


function getProductId(){

    return Number(
        new URLSearchParams(
            window.location.search
        ).get("id")
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

    btn.addEventListener(
        "click",
        async function(e){

            e.preventDefault();

            const shareData = {

                title:
                    "Maliha Agro Industry",

                text:
                    "Maliha Agro Industry - Digital Business Card",

                url:
                    window.location.href

            };


            if(navigator.share){

                try{

                    await navigator.share(
                        shareData
                    );

                }catch(err){

                    if(err.name !== "AbortError"){

                        console.error(err);

                    }

                }

            }else{

                try{

                    await navigator.clipboard
                        .writeText(
                            window.location.href
                        );

                    alert(
                        "✅ লিংক কপি হয়েছে"
                    );

                }catch(err){

                    console.error(err);

                    alert(
                        "❌ লিংক কপি করা যায়নি"
                    );

                }

            }

        }
    );

}


/* ==========================
   SAVE CONTACT
========================== */

function initSaveContact(){

    const btn = $("#saveContact");

    if(!btn) return;

    btn.addEventListener(
        "click",
        function(e){

            e.preventDefault();

            window.location.href =
                "contact.vcf";

        }
    );

}


/* ==========================
   PWA INSTALL
========================== */

function initPWA(){

    const installBtn =
        $("#installApp");

    if(!installBtn) return;

    installBtn.style.display =
        "none";


    window.addEventListener(
        "beforeinstallprompt",
        function(e){

            e.preventDefault();

            deferredPrompt = e;

            installBtn.style.display =
                "flex";

        }
    );


    installBtn.addEventListener(
        "click",
        async function(){

            if(!deferredPrompt){

                return;

            }

            deferredPrompt.prompt();

            try{

                await deferredPrompt
                    .userChoice;

            }catch(err){

                console.error(err);

            }

            deferredPrompt = null;

            installBtn.style.display =
                "none";

        }
    );


    window.addEventListener(
        "appinstalled",
        function(){

            deferredPrompt = null;

            installBtn.style.display =
                "none";

        }
    );

}


/* ==========================
   ACTIVE BOTTOM NAVIGATION
========================== */

function initBottomNavigation(){

    const currentPage =
        window.location.pathname
        .split("/")
        .pop() || "index.html";


    $$(".bottom-nav a")
        .forEach(function(link){

            link.classList.remove(
                "active"
            );

            const href =
                link.getAttribute("href");

            if(!href) return;

            const cleanHref =
                href.split("?")[0]
                    .split("#")[0];


            if(
                cleanHref === currentPage ||
                (
                    currentPage === "" &&
                    cleanHref === "index.html"
                )
            ){

                link.classList.add(
                    "active"
                );

            }

        });

}


/* ==========================================================
   SECTION 03
   PRODUCTS
   LOAD + SEARCH + CATEGORY + SORT
========================================================== */


/* ==========================
   LOAD PRODUCTS
========================== */

async function loadProducts(
    category = "all"
){

    const productList =
        $("#productList");

    if(!productList) return;


    try{

        const response =
            await fetch(
                "data/products.json"
            );


        if(!response.ok){

            throw new Error(
                "products.json load failed"
            );

        }


        products =
            await response.json();


        const searchInput =
            $("#searchProduct");


        const keyword =
            searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


        let filtered =
            products.filter(
                function(product){

                    const productName =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const productType =
                        String(
                            product.type || ""
                        ).toLowerCase();


                    const productDescription =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    const matchCategory =
                        category === "all" ||
                        product.category === category;


                    const matchSearch =
                        productName.includes(
                            keyword
                        ) ||

                        productType.includes(
                            keyword
                        ) ||

                        productDescription.includes(
                            keyword
                        );


                    return (
                        matchCategory &&
                        matchSearch
                    );

                }
            );


        /* ==========================
           SORT
        ========================== */

        const sortSelect =
            $("#sortProducts");


        const sort =
            sortSelect
            ? sortSelect.value
            : "default";


        switch(sort){

            case "low-high":

                filtered.sort(
                    (a,b) =>
                        Number(a.price || 0) -
                        Number(b.price || 0)
                );

                break;


            case "high-low":

                filtered.sort(
                    (a,b) =>
                        Number(b.price || 0) -
                        Number(a.price || 0)
                );

                break;


            case "new":

                filtered.sort(
                    (a,b) =>
                        Number(b.newArrival || 0) -
                        Number(a.newArrival || 0)
                );

                break;


            case "best":

                filtered.sort(
                    (a,b) =>
                        Number(b.bestSeller || 0) -
                        Number(a.bestSeller || 0)
                );

                break;


            default:

                filtered.sort(
                    (a,b) =>
                        Number(a.id || 0) -
                        Number(b.id || 0)
                );

        }


        productList.innerHTML = "";


        /* ==========================
           NO RESULT
        ========================== */

        if(filtered.length === 0){

            productList.innerHTML = `

<div class="card">

<h2>
🔍 কোনো পণ্য পাওয়া যায়নি
</h2>

<p>
অন্য কোনো নাম বা ক্যাটাগরি দিয়ে চেষ্টা করুন।
</p>

</div>

`;

            return;

        }


        /* ==========================
           PRODUCT CARDS
        ========================== */

        filtered.forEach(
            function(product){

                const gallery =
                    Array.isArray(
                        product.gallery
                    )
                    ? product.gallery
                    : [];


                productList.innerHTML += `

<div class="product-card">

${
    product.offer
    ? '<span class="offer-badge">🔥 Offer</span>'
    : ""
}

<button
    class="wishlist-btn"
    data-id="${product.id}"
    type="button"
    aria-label="Wishlist">

🤍

</button>


<div class="slider">

${
    gallery.map(
        function(img,index){

            return `

<img
    src="${img}"
    class="product-img ${
        index === 0 ? "active" : ""
    }"
    alt="${product.name}"
    loading="lazy">

`;

        }
    ).join("")
}


</div>


<h3>
${product.name}
</h3>


<p class="rating">
⭐⭐⭐⭐⭐ (${product.rating || 0})
</p>


${
    Number(product.oldPrice || 0) > 0
    ? `
<p class="old-price">
${formatPrice(product.oldPrice)}
</p>
`
    : ""
}


<p class="price">
${formatPrice(product.price)}
</p>


<span class="stock">
🟢 ${product.stock || "স্টকে আছে"}
</span>


<p>
${product.description || ""}
</p>


<a
    href="product.html?id=${product.id}"
    class="btn">

📖 বিস্তারিত দেখুন

</a>

</div>

`;

            }
        );


        initWishlist();

        startHomeSlider();

    }
    catch(error){

        console.error(
            "Product Load Error:",
            error
        );


        productList.innerHTML = `

<div class="card">

<h2>
❌ Product Load Failed
</h2>

<p>
পণ্য লোড করতে সমস্যা হয়েছে।
</p>

</div>

`;

    }

}


/* ==========================
   SEARCH
========================== */

function initSearch(){

    const input =
        $("#searchProduct");

    if(!input) return;


    input.addEventListener(
        "input",
        function(){

            const active =
                $(".filter-btn.active");


            loadProducts(
                active
                ? active.dataset.category
                : "all"
            );

        }
    );

}


/* ==========================
   CATEGORY FILTER
========================== */

function initCategoryFilter(){

    $$(".filter-btn")
        .forEach(
            function(btn){

                btn.addEventListener(
                    "click",
                    function(){

                        $$(".filter-btn")
                            .forEach(
                                function(b){

                                    b.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        btn.classList.add(
                            "active"
                        );


                        loadProducts(
                            btn.dataset.category
                        );

                    }
                );

            }
        );

}


/* ==========================
   SORT
========================== */

function initSort(){

    const select =
        $("#sortProducts");

    if(!select) return;


    select.addEventListener(
        "change",
        function(){

            const active =
                $(".filter-btn.active");


            loadProducts(
                active
                ? active.dataset.category
                : "all"
            );

        }
    );

}


/* ==========================================================
   SECTION 04
   PRODUCT DETAILS
========================================================== */

async function loadProductDetails(){

    const details =
        $("#productDetails");

    if(!details) return;


    try{

        const id =
            getProductId();


        if(products.length === 0){

            const response =
                await fetch(
                    "data/products.json"
                );


            if(!response.ok){

                throw new Error(
                    "products.json load failed"
                );

            }


            products =
                await response.json();

        }


        currentProduct =
            products.find(
                function(product){

                    return Number(product.id) === id;

                }
            );


        if(!currentProduct){

            details.innerHTML = `

<div class="card">

<h2>
❌ Product Not Found
</h2>

<a
    href="products.html"
    class="btn">

📦 প্রোডাক্ট দেখুন

</a>

</div>

`;

            return;

        }


        const gallery =
            Array.isArray(
                currentProduct.gallery
            )
            ? currentProduct.gallery
            : [];


        details.innerHTML = `

<div class="product-details">


<div class="product-slider">

${
    gallery.map(
        function(img,index){

            return `

<img
    src="${img}"
    class="product-img ${
        index === 0 ? "active" : ""
    }"
    alt="${currentProduct.name}">

`;

        }
    ).join("")
}

</div>


<div class="slider-dots">

${
    gallery.map(
        function(_,index){

            return `

<button
    type="button"
    class="dot ${
        index === 0 ? "active" : ""
    }"
    data-index="${index}"
    aria-label="ছবি ${index + 1}">

</button>

`;

        }
    ).join("")
}

</div>


<h1>
${currentProduct.name}
</h1>


<p class="rating">
⭐⭐⭐⭐⭐ ${currentProduct.rating || 0}
</p>


<div class="price-box">

${
    Number(currentProduct.oldPrice || 0) > 0
    ? `
<p class="old-price">
${formatPrice(currentProduct.oldPrice)}
</p>
`
    : ""
}


<p class="price">
${formatPrice(currentProduct.price)}
</p>

</div>


<div class="stock-box">

🟢 ${currentProduct.stock || "স্টকে আছে"}

</div>


<p>
<b>Brand :</b>
${currentProduct.brand || "Maliha Agro Industry"}
</p>


<p>
<b>Type :</b>
${currentProduct.type || ""}
</p>


<p>
<b>SKU :</b>
${currentProduct.sku || ""}
</p>


<p>
<b>Weight :</b>
${currentProduct.weight || ""}
</p>


<p>
${currentProduct.description || ""}
</p>


<div class="quantity-box">

<h3>
পরিমাণ
</h3>


<div class="qty-control">

<button
    id="minusQty"
    type="button">

−

</button>


<input
    id="qty"
    type="text"
    value="1"
    readonly
    aria-label="পরিমাণ">


<button
    id="plusQty"
    type="button">

+

</button>

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
    target="_blank"
    rel="noopener"
    href="https://wa.me/8801303679189?text=${
        encodeURIComponent(

`আমি ${currentProduct.name} অর্ডার করতে চাই।

মূল্য : ${formatPrice(currentProduct.price)}

${window.location.href}`

        )
    }">

🛒 Order Now

</a>


<button
    class="btn"
    id="shareProduct"
    type="button">

📤 Share Product

</button>


</div>

`;


        startProductSlider();

        initProductDots();

        initQuantity();

        initShareProduct();

        loadRelatedProducts();

    }
    catch(error){

        console.error(
            "Product Details Error:",
            error
        );


        details.innerHTML = `

<div class="card">

<h2>
❌ Product Load Failed
</h2>

</div>

`;

    }

}


/* ==========================================================
   SECTION 05
   SLIDER + QUANTITY + SHARE + RELATED
========================================================== */


/* ==========================
   PRODUCT DETAILS SLIDER
========================== */

function startProductSlider(){

    const images =
        $$("#productDetails .product-slider .product-img");

    if(images.length <= 1){

        return;

    }


    if(productSliderTimer){

        clearInterval(
            productSliderTimer
        );

    }


    let current = 0;


    productSliderTimer =
        setInterval(
            function(){

                images[current]
                    .classList
                    .remove("active");


                current++;


                if(
                    current >=
                    images.length
                ){

                    current = 0;

                }


                images[current]
                    .classList
                    .add("active");


                updateProductDots(
                    current
                );

            },
            3000
        );

}


/* ==========================
   PRODUCT DOTS
========================== */

function initProductDots(){

    const dots =
        $$("#productDetails .dot");

    if(!dots.length) return;


    dots.forEach(
        function(dot){

            dot.addEventListener(
                "click",
                function(){

                    changeImage(
                        Number(
                            dot.dataset.index
                        )
                    );

                }
            );

        }
    );

}


/* ==========================
   CHANGE PRODUCT IMAGE
========================== */

function changeImage(index){

    const images =
        $$("#productDetails .product-slider .product-img");

    const dots =
        $$("#productDetails .dot");


    if(
        index < 0 ||
        index >= images.length
    ){

        return;

    }


    images.forEach(
        function(img){

            img.classList.remove(
                "active"
            );

        }
    );


    dots.forEach(
        function(dot){

            dot.classList.remove(
                "active"
            );

        }
    );


    images[index]
        ?.classList
        .add("active");


    dots[index]
        ?.classList
        .add("active");

}


/* ==========================
   UPDATE DOT
========================== */

function updateProductDots(index){

    const dots =
        $$("#productDetails .dot");


    dots.forEach(
        function(dot){

            dot.classList.remove(
                "active"
            );

        }
    );


    dots[index]
        ?.classList
        .add("active");

}


/* ==========================
   HOME PRODUCT SLIDER
========================== */

function startHomeSlider(){

    document
        .querySelectorAll(
            ".product-card .slider"
        )
        .forEach(
            function(slider){

                const images =
                    slider.querySelectorAll(
                        ".product-img"
                    );


                if(images.length <= 1){

                    return;

                }


                let current = 0;


                setInterval(
                    function(){

                        images[current]
                            .classList
                            .remove("active");


                        current++;


                        if(
                            current >=
                            images.length
                        ){

                            current = 0;

                        }


                        images[current]
                            .classList
                            .add("active");

                    },
                    3000
                );

            }
        );

}


/* ==========================
   QUANTITY
========================== */

function initQuantity(){

    const qtyInput =
        $("#qty");

    const total =
        $("#totalPrice");

    const plus =
        $("#plusQty");

    const minus =
        $("#minusQty");


    if(
        !qtyInput ||
        !total ||
        !plus ||
        !minus ||
        !currentProduct
    ){

        return;

    }


    let qty = 1;


    function update(){

        qtyInput.value =
            qty;


        total.textContent =
            formatPrice(
                Number(
                    currentProduct.price
                ) * qty
            );

    }


    plus.onclick =
        function(){

            qty++;

            update();

        };


    minus.onclick =
        function(){

            if(qty > 1){

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

    const btn =
        $("#shareProduct");

    if(!btn || !currentProduct){

        return;

    }


    btn.addEventListener(
        "click",
        async function(){

            const shareData = {

                title:
                    currentProduct.name,

                text:
                    currentProduct.description ||
                    "Maliha Agro Industry Product",

                url:
                    window.location.href

            };


            if(navigator.share){

                try{

                    await navigator.share(
                        shareData
                    );

                }catch(err){

                    if(
                        err.name !==
                        "AbortError"
                    ){

                        console.error(err);

                    }

                }

            }else{

                try{

                    await navigator.clipboard
                        .writeText(
                            window.location.href
                        );

                    alert(
                        "✅ Product link copied"
                    );

                }catch(err){

                    console.error(err);

                    alert(
                        "❌ Link copy failed"
                    );

                }

            }

        }
    );

}


/* ==========================
   RELATED PRODUCTS
========================== */

function loadRelatedProducts(){

    const related =
        $("#relatedProducts");

    if(
        !related ||
        !currentProduct
    ){

        return;

    }


    related.innerHTML = "";


    products

        .filter(
            function(product){

                return Number(product.id) !==
                    Number(currentProduct.id);

            }
        )

        .slice(0,4)

        .forEach(
            function(item){

                const image =
                    Array.isArray(item.gallery) &&
                    item.gallery.length
                    ? item.gallery[0]
                    : "";


                related.innerHTML += `

<div class="product-card">


<div class="slider">

<img
    src="${image}"
    class="product-img active"
    alt="${item.name}"
    loading="lazy">

</div>


<h3>
${item.name}
</h3>


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

            }
        );

}


/* ==========================================================
   SECTION 06
   WISHLIST SYSTEM
========================================================== */


/* ==========================
   UPDATE WISHLIST COUNTER
========================== */

function updateWishlistCounter(){

    const counter =
        $("#wishlistCounter");

    if(!counter) return;


    counter.textContent =
        `❤️ Wishlist (${wishlist.length})`;

}


/* ==========================
   INIT WISHLIST
========================== */

function initWishlist(){

    $$(".wishlist-btn")
        .forEach(
            function(btn){

                const id =
                    Number(
                        btn.dataset.id
                    );


                if(
                    wishlist.includes(id)
                ){

                    btn.textContent =
                        "❤️";

                    btn.classList.add(
                        "active"
                    );

                }else{

                    btn.textContent =
                        "🤍";

                    btn.classList.remove(
                        "active"
                    );

                }


                btn.onclick =
                    function(){

                        toggleWishlist(
                            id
                        );

                    };

            }
        );


    updateWishlistCounter();

}


/* ==========================
   TOGGLE WISHLIST
========================== */

function toggleWishlist(id){

    if(
        wishlist.includes(id)
    ){

        wishlist =
            wishlist.filter(
                function(item){

                    return item !== id;

                }
            );

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

    const container =
        $("#wishlistProducts");

    if(!container) return;


    container.innerHTML = "";


    const items =
        products.filter(
            function(product){

                return wishlist.includes(
                    Number(product.id)
                );

            }
        );


    if(items.length === 0){

        container.innerHTML = `

<div class="card">

<h2>
❤️ Wishlist খালি
</h2>

<a
    href="products.html"
    class="btn">

📦 প্রোডাক্ট দেখুন

</a>

</div>

`;

        return;

    }


    items.forEach(
        function(product){

            const image =
                Array.isArray(product.gallery) &&
                product.gallery.length
                ? product.gallery[0]
                : "";


            container.innerHTML += `

<div class="product-card">


<div class="slider">

<img
    src="${image}"
    class="product-img active"
    alt="${product.name}"
    loading="lazy">

</div>


<h3>
${product.name}
</h3>


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
    data-id="${product.id}"
    type="button">

🗑 Remove

</button>


</div>

`;

        }
    );


    $$(".removeWishlist")
        .forEach(
            function(btn){

                btn.onclick =
                    function(){

                        toggleWishlist(
                            Number(
                                btn.dataset.id
                            )
                        );


                        loadWishlistPage();

                    };

            }
        );

}


/* ==========================================================
   SECTION 07
   IMAGE PREVIEW + CONTACT + FINAL INITIALIZATION
========================================================== */


/* ==========================
   IMAGE PREVIEW
========================== */

function initImagePreview(){

    const modal =
        $("#imageModal");

    const modalImg =
        $("#modalImage");

    const close =
        $(".close-modal");


    if(
        !modal ||
        !modalImg ||
        !close
    ){

        return;

    }


    document.addEventListener(
        "click",
        function(e){

            if(
                e.target.classList
                    .contains("product-img")
            ){

                modal.style.display =
                    "flex";

                modalImg.src =
                    e.target.src;

            }

        }
    );


    close.onclick =
        function(){

            modal.style.display =
                "none";

        };


    modal.onclick =
        function(e){

            if(
                e.target === modal
            ){

                modal.style.display =
                    "none";

            }

        };

}


/* ==========================================================
   SECTION 08
   CONTACT PAGE
   FORM + WHATSAPP + BACK TO TOP
========================================================== */


/* ==========================
   CONTACT FORM
========================== */

function initContactForm(){

    const form =
        $("#contactForm");

    if(!form) return;


    const status =
        $("#contactFormStatus");


    form.addEventListener(
        "submit",
        function(e){

            e.preventDefault();


            const name =
                $("#contactName")
                ?.value
                .trim() || "";


            const phone =
                $("#contactPhone")
                ?.value
                .trim() || "";


            const email =
                $("#contactEmail")
                ?.value
                .trim() || "";


            const subject =
                $("#contactSubject")
                ?.value
                .trim() || "";


            const message =
                $("#contactMessage")
                ?.value
                .trim() || "";


            if(!name){

                showContactStatus(
                    "❌ আপনার নাম লিখুন।",
                    "error"
                );

                $("#contactName")
                    ?.focus();

                return;

            }


            if(!phone){

                showContactStatus(
                    "❌ আপনার মোবাইল নম্বর লিখুন।",
                    "error"
                );

                $("#contactPhone")
                    ?.focus();

                return;

            }


            if(!subject){

                showContactStatus(
                    "❌ বিষয় নির্বাচন করুন।",
                    "error"
                );

                $("#contactSubject")
                    ?.focus();

                return;

            }


            if(!message){

                showContactStatus(
                    "❌ আপনার মেসেজ লিখুন।",
                    "error"
                );

                $("#contactMessage")
                    ?.focus();

                return;

            }


            const subjectText = {

                product:
                    "পণ্য সম্পর্কে জানতে চাই",

                price:
                    "মূল্য জানতে চাই",

                wholesale:
                    "পাইকারি অর্ডার",

                dealer:
                    "ডিলারশিপ",

                other:
                    "অন্যান্য"

            };


            const selectedSubject =
                subjectText[subject] ||
                subject;


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
                encodeURIComponent(
                    whatsappMessage
                );


            showContactStatus(
                "✅ WhatsApp-এ পাঠানো হচ্ছে...",
                "success"
            );


            setTimeout(
                function(){

                    window.open(
                        whatsappURL,
                        "_blank",
                        "noopener"
                    );

                },
                400
            );

        }
    );

}


/* ==========================
   CONTACT STATUS
========================== */

function showContactStatus(
    message,
    type = "success"
){

    const status =
        $("#contactFormStatus");

    if(!status) return;


    status.textContent =
        message;


    status.style.marginTop =
        "12px";


    status.style.padding =
        "10px";


    status.style.borderRadius =
        "10px";


    if(type === "error"){

        status.style.color =
            "#b71c1c";

        status.style.background =
            "#ffebee";

    }else{

        status.style.color =
            "#166C39";

        status.style.background =
            "#e9f8ef";

    }

}


/* ==========================
   BACK TO TOP
========================== */

function initBackToTop(){

    const btn =
        $("#backToTop");

    if(!btn) return;


    window.addEventListener(
        "scroll",
        function(){

            if(
                window.scrollY > 350
            ){

                btn.classList.add(
                    "show"
                );

            }else{

                btn.classList.remove(
                    "show"
                );

            }

        }
    );


    btn.addEventListener(
        "click",
        function(){

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        }
    );

}


/* ==========================================================
   FINAL INITIALIZATION
   ONLY ONE DOMContentLoaded
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function(){

        console.log(
            "✅ Maliha Agro Industry JS v4 FINAL Loaded"
        );


        /* ==========================
           GLOBAL
        ========================== */

        updateWishlistCounter();

        initShareCard();

        initSaveContact();

        initPWA();

        initBottomNavigation();

        initImagePreview();

        initContactForm();

        initBackToTop();


        /* ==========================
           PRODUCTS PAGE
        ========================== */

        if($("#productList")){

            initSearch();

            initSort();

            initCategoryFilter();

            await loadProducts(
                "all"
            );

        }


        /* ==========================
           PRODUCT DETAILS PAGE
        ========================== */

        if($("#productDetails")){

            await loadProductDetails();

        }


        /* ==========================
           WISHLIST PAGE
        ========================== */

        if($("#wishlistProducts")){

            if(products.length === 0){

                try{

                    const response =
                        await fetch(
                            "data/products.json"
                        );


                    if(!response.ok){

                        throw new Error(
                            "products.json load failed"
                        );

                    }


                    products =
                        await response.json();

                }catch(error){

                    console.error(
                        error
                    );

                }

            }


            loadWishlistPage();

        }

    }
);
