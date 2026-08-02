"use strict";

/* ==========================================================
   Maliha Agro Industry
   JavaScript FINAL COMPLETE VERSION
========================================================== */


/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let wishlist =
    JSON.parse(
        localStorage.getItem("wishlist") || "[]"
    )
    .map(Number)
    .filter(Number.isFinite);

let deferredPrompt = null;

let products = [];

let currentProduct = null;

let productSliderTimer = null;

let homeSliderTimers = [];

let detailSliderIndex = 0;


/* ==========================================================
   SHORTCUTS
========================================================== */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    document.querySelectorAll(selector);


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
   IMAGE PATH FIX
========================================================== */

function imagePath(path){

    if(!path) return "";

    let src =
        String(path)
        .trim()
        .replace(/\\/g,"/");


    /*
       ../images/product1.jpg
       ↓
       images/product1.jpg
    */

    src =
        src.replace(
            /^(\.\.\/)+images\//i,
            "images/"
        );


    /*
       ./images/product1.jpg
       ↓
       images/product1.jpg
    */

    src =
        src.replace(
            /^\.\/images\//i,
            "images/"
        );


    /*
       External image
    */

    if(
        /^https?:\/\//i.test(src) ||
        src.startsWith("data:")
    ){

        return src;

    }


    /*
       images/product1.jpg
    */

    if(
        src.startsWith("images/")
    ){

        return src;

    }


    /*
       /images/product1.jpg
    */

    if(
        src.startsWith("/images/")
    ){

        return src.substring(1);

    }


    /*
       শুধু product1.jpg
    */

    if(
        !src.includes("/")
    ){

        return "images/" + src;

    }


    return src;

}


/* ==========================================================
   PRODUCT GALLERY
========================================================== */

function getGallery(product){

    if(
        !product ||
        !Array.isArray(product.gallery)
    ){

        return [];

    }


    return product.gallery
        .map(imagePath)
        .filter(Boolean);

}


/* ==========================================================
   ERROR HANDLER
========================================================== */

window.onerror =
function(
    message,
    file,
    line,
    column,
    error
){

    console.error(
        "ERROR:",
        message
    );

    console.error(
        "FILE:",
        file
    );

    console.error(
        "LINE:",
        line
    );

};


/* ==========================================================
   SHARE BUSINESS CARD
========================================================== */

function initShareCard(){

    const btn =
        $("#shareCard");

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

                }
                catch(err){

                    if(
                        err.name !==
                        "AbortError"
                    ){

                        console.error(err);

                    }

                }

            }
            else{

                try{

                    await navigator.clipboard
                        .writeText(
                            window.location.href
                        );

                    alert(
                        "✅ লিংক কপি হয়েছে"
                    );

                }
                catch(err){

                    console.error(err);

                    alert(
                        "❌ লিংক কপি করা যায়নি"
                    );

                }

            }

        }
    );

}


/* ==========================================================
   SAVE CONTACT
========================================================== */

function initSaveContact(){

    const btn =
        $("#saveContact");

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


/* ==========================================================
   PWA
========================================================== */

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

            deferredPrompt =
                e;

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

            }
            catch(error){

                console.error(error);

            }


            deferredPrompt =
                null;

            installBtn.style.display =
                "none";

        }
    );


    window.addEventListener(
        "appinstalled",
        function(){

            deferredPrompt =
                null;

            installBtn.style.display =
                "none";

        }
    );

}


/* ==========================================================
   BOTTOM NAVIGATION
========================================================== */

function initBottomNavigation(){

    const currentPage =
        window.location.pathname
        .split("/")
        .pop() ||
        "index.html";


    $$(".bottom-nav a")
        .forEach(
            function(link){

                link.classList.remove(
                    "active"
                );


                const href =
                    link.getAttribute(
                        "href"
                    );


                if(!href) return;


                const cleanHref =
                    href
                    .split("?")[0]
                    .split("#")[0];


                if(
                    cleanHref ===
                    currentPage
                ){

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

}


/* ==========================================================
   FETCH PRODUCTS
========================================================== */

async function fetchProducts(){

    const response =
        await fetch(
            "data/products.json",
            {
                cache:
                    "no-store"
            }
        );


    if(!response.ok){

        throw new Error(
            "data/products.json load failed"
        );

    }


    const data =
        await response.json();


    if(!Array.isArray(data)){

        throw new Error(
            "products.json must contain an array"
        );

    }


    products =
        data;


    return products;

}


/* ==========================================================
   ENSURE PRODUCTS LOADED
========================================================== */

async function ensureProductsLoaded(){

    if(products.length){

        return products;

    }


    return await fetchProducts();

}


/* ==========================================================
   PRODUCTS PAGE
========================================================== */

async function loadProducts(
    category = "all"
){

    const productList =
        $("#productList");

    if(!productList) return;


    try{

        await ensureProductsLoaded();


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

                    const name =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const type =
                        String(
                            product.type || ""
                        ).toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    const matchCategory =
                        category === "all" ||
                        product.category ===
                            category;


                    const matchSearch =
                        name.includes(keyword) ||
                        type.includes(keyword) ||
                        description.includes(keyword);


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
                    getGallery(product);


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
        index === 0
        ? "active"
        : ""
    }"
    alt="${product.name}"
    loading="lazy"
    onerror="this.style.display='none';">

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


/* ==========================================================
   SEARCH
========================================================== */

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


/* ==========================================================
   CATEGORY FILTER
========================================================== */

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


/* ==========================================================
   SORT
========================================================== */

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
   PRODUCT DETAILS PAGE
========================================================== */

async function loadProductDetails(){

    const slider =
        $("#productSlider");

    if(!slider) return;


    try{

        const id =
            getProductId();


        await ensureProductsLoaded();


        currentProduct =
            products.find(
                function(product){

                    return Number(product.id) ===
                        id;

                }
            );


        if(!currentProduct){

            const card =
                document.querySelector(
                    ".product-gallery"
                );


            if(card){

                card.innerHTML = `

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

            }

            return;

        }


        /* ==========================
           PRODUCT INFO
        ========================== */

        const name =
            $("#productName");

        const brand =
            $("#productBrand");

        const brandInfo =
            $("#productBrandInfo");

        const rating =
            $("#productRating");

        const stock =
            $("#productStock");

        const stockInfo =
            $("#productStockInfo");

        const category =
            $("#productCategory");

        const type =
            $("#productType");

        const sku =
            $("#productSku");

        const weight =
            $("#productWeight");

        const description =
            $("#productDescription");


        if(name){

            name.textContent =
                currentProduct.name || "";

        }


        if(brand){

            brand.textContent =
                currentProduct.brand ||
                "Maliha Agro Industry";

        }


        if(brandInfo){

            brandInfo.textContent =
                currentProduct.brand ||
                "Maliha Agro Industry";

        }


        if(rating){

            rating.textContent =
                `(${currentProduct.rating || 0})`;

        }


        if(stock){

            stock.textContent =
                "🟢 " +
                (
                    currentProduct.stock ||
                    "স্টকে আছে"
                );

        }


        if(stockInfo){

            stockInfo.textContent =
                currentProduct.stock ||
                "স্টকে আছে";

        }


        if(category){

            category.textContent =
                currentProduct.category ||
                "-";

        }


        if(type){

            type.textContent =
                currentProduct.type ||
                "-";

        }


        if(sku){

            sku.textContent =
                currentProduct.sku ||
                "-";

        }


        if(weight){

            weight.textContent =
                currentProduct.weight ||
                "-";

        }


        if(description){

            description.textContent =
                currentProduct.description ||
                "";

        }


        /* ==========================
           PRICE
        ========================== */

        const price =
            Number(
                currentProduct.price || 0
            );


        const oldPrice =
            Number(
                currentProduct.oldPrice || 0
            );


        const priceElement =
            $("#productPrice");

        const oldPriceElement =
            $("#productOldPrice");

        const discountElement =
            $("#productDiscount");

        const reviewElement =
            $("#productReview");


        if(priceElement){

            priceElement.textContent =
                formatPrice(price);

        }


        if(oldPriceElement){

            if(oldPrice > 0){

                oldPriceElement.textContent =
                    formatPrice(oldPrice);

                oldPriceElement.style.display =
                    "inline";

            }else{

                oldPriceElement.style.display =
                    "none";

            }

        }


        if(discountElement){

            if(
                oldPrice > price &&
                price > 0
            ){

                const discount =
                    Math.round(
                        (
                            (oldPrice - price) /
                            oldPrice
                        ) * 100
                    );


                discountElement.textContent =
                    discount + "% OFF";

                discountElement.style.display =
                    "inline-block";

            }else{

                discountElement.style.display =
                    "none";

            }

        }


        if(reviewElement){

            reviewElement.textContent =
                `(${currentProduct.rating || 0} Reviews)`;

        }


        /* ==========================
           PRODUCT GALLERY
        ========================== */

        const gallery =
            getGallery(
                currentProduct
            );


        slider.innerHTML = "";


        if(gallery.length === 0){

            slider.innerHTML = `

<div class="no-image">

<p>
❌ এই পণ্যের কোনো ছবি পাওয়া যায়নি।
</p>

</div>

`;

        }
        else{

            gallery.forEach(
                function(src,index){

                    const img =
                        document.createElement(
                            "img"
                        );


                    img.src =
                        src;


                    img.alt =
                        currentProduct.name ||
                        "Maliha Agro Industry";


                    img.className =
                        "product-img" +
                        (
                            index === 0
                            ? " active"
                            : ""
                        );


                    img.loading =
                        index === 0
                        ? "eager"
                        : "lazy";


                    img.onerror =
                        function(){

                            console.error(
                                "Image Load Failed:",
                                src
                            );

                            this.style.display =
                                "none";

                        };


                    slider.appendChild(
                        img
                    );

                }
            );

        }


        /* ==========================
           DETAIL SLIDER
        ========================== */

        initDetailGallery();


        /* ==========================
           QUANTITY
        ========================== */

        initQuantity();


        /* ==========================
           ORDER
        ========================== */

        initOrderButton();


        /* ==========================
           SHARE
        ========================== */

        initShareProductButtons();


        /* ==========================
           WISHLIST
        ========================== */

        initProductWishlist();


        /* ==========================
           RELATED PRODUCTS
        ========================== */

        loadRelatedProducts();

    }
    catch(error){

        console.error(
            "Product Details Error:",
            error
        );


        slider.innerHTML = `

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


/* ==========================================================
   DETAIL PRODUCT GALLERY
========================================================== */

function initDetailGallery(){

    const slider =
        $("#productSlider");

    if(!slider) return;


    const images =
        slider.querySelectorAll(
            ".product-img"
        );


    const prev =
        $("#prevImage");

    const next =
        $("#nextImage");

    const counter =
        $("#sliderCounter");


    if(!images.length){

        if(counter){

            counter.textContent =
                "0 / 0";

        }

        return;

    }


    detailSliderIndex = 0;


    function showImage(index){

        if(index < 0){

            index =
                images.length - 1;

        }


        if(index >= images.length){

            index = 0;

        }


        images.forEach(
            function(img){

                img.classList.remove(
                    "active"
                );

            }
        );


        images[index]
            .classList.add(
                "active"
            );


        detailSliderIndex =
            index;


        if(counter){

            counter.textContent =
                `${index + 1} / ${images.length}`;

        }

    }


    if(prev){

        prev.onclick =
            function(){

                showImage(
                    detailSliderIndex - 1
                );

            };

    }


    if(next){

        next.onclick =
            function(){

                showImage(
                    detailSliderIndex + 1
                );

            };

    }


    images.forEach(
        function(img){

            img.addEventListener(
                "click",
                function(){

                    const modal =
                        $("#imageModal");

                    const modalImage =
                        $("#modalImage");


                    if(
                        modal &&
                        modalImage
                    ){

                        modalImage.src =
                            img.src;

                        modal.style.display =
                            "flex";

                    }

                }
            );

        }
    );


    showImage(0);

}


/* ==========================================================
   ORDER BUTTON
========================================================== */

function initOrderButton(){

    const orderNow =
        $("#orderNow");

    if(
        !orderNow ||
        !currentProduct
    ){

        return;

    }


    const price =
        Number(
            currentProduct.price || 0
        );


    const message =

`🌿 Maliha Agro Industry

আমি ${currentProduct.name} অর্ডার করতে চাই।

💰 মূল্য: ${formatPrice(price)}

📦 পরিমাণ: 1

🔗 ${window.location.href}`;


    orderNow.href =
        "https://wa.me/8801303679189?text=" +
        encodeURIComponent(
            message
        );


    orderNow.target =
        "_blank";

    orderNow.rel =
        "noopener noreferrer";

}


/* ==========================================================
   QUANTITY
========================================================== */

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
                    currentProduct.price || 0
                ) * qty
            );


        updateOrderLink(
            qty
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


/* ==========================================================
   UPDATE ORDER LINK
========================================================== */

function updateOrderLink(qty){

    const orderNow =
        $("#orderNow");

    if(
        !orderNow ||
        !currentProduct
    ){

        return;

    }


    const price =
        Number(
            currentProduct.price || 0
        );


    const total =
        price * qty;


    const message =

`🌿 Maliha Agro Industry

আমি ${currentProduct.name} অর্ডার করতে চাই।

💰 একক মূল্য: ${formatPrice(price)}

📦 পরিমাণ: ${qty}

💵 মোট মূল্য: ${formatPrice(total)}

🔗 ${window.location.href}`;


    orderNow.href =
        "https://wa.me/8801303679189?text=" +
        encodeURIComponent(
            message
        );

}


/* ==========================================================
   SHARE PRODUCT
========================================================== */

function initShareProductButtons(){

    const buttons = [

        $("#shareProduct"),
        $("#shareProductBtn")

    ];


    buttons.forEach(
        function(btn){

            if(!btn) return;


            btn.onclick =
                async function(){

                    if(!currentProduct)
                        return;


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

                        }
                        catch(error){

                            if(
                                error.name !==
                                "AbortError"
                            ){

                                console.error(
                                    error
                                );

                            }

                        }

                    }
                    else{

                        try{

                            await navigator.clipboard
                                .writeText(
                                    window.location.href
                                );


                            alert(
                                "✅ Product link copied"
                            );

                        }
                        catch(error){

                            alert(
                                "❌ Link copy failed"
                            );

                        }

                    }

                };

        }
    );

}


/* ==========================================================
   WISHLIST COUNTER
========================================================== */

function updateWishlistCounter(){

    const counter =
        $("#wishlistCounter");

    if(!counter) return;


    counter.textContent =
        `❤️ Wishlist (${wishlist.length})`;

}


/* ==========================================================
   WISHLIST INIT
========================================================== */

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

                }
                else{

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


/* ==========================================================
   TOGGLE WISHLIST
========================================================== */

function toggleWishlist(id){

    id =
        Number(id);


    if(
        wishlist.includes(id)
    ){

        wishlist =
            wishlist.filter(
                function(item){

                    return item !== id;

                }
            );

    }
    else{

        wishlist.push(id);

    }


    localStorage.setItem(
        "wishlist",
        JSON.stringify(
            wishlist
        )
    );


    initWishlist();

}


/* ==========================================================
   PRODUCT PAGE WISHLIST
========================================================== */

function initProductWishlist(){

    if(!currentProduct)
        return;


    const id =
        Number(
            currentProduct.id
        );


    const buttons = [

        $("#wishlistBtn"),
        $("#wishlistProduct")

    ];


    buttons.forEach(
        function(btn){

            if(!btn) return;


            function update(){

                if(
                    wishlist.includes(id)
                ){

                    btn.textContent =
                        "❤️ Wishlist";

                    btn.classList.add(
                        "active"
                    );

                }
                else{

                    btn.textContent =
                        "🤍 Wishlist";

                    btn.classList.remove(
                        "active"
                    );

                }

            }


            btn.onclick =
                function(){

                    toggleWishlist(id);

                    updateWishlistCounter();

                    update();

                };


            update();

        }
    );

}


/* ==========================================================
   WISHLIST PAGE
========================================================== */

async function loadWishlistPage(){

    const container =
        $("#wishlistProducts");

    if(!container) return;


    try{

        await ensureProductsLoaded();

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

                const gallery =
                    getGallery(product);


                const image =
                    gallery.length
                    ? gallery[0]
                    : "";


                container.innerHTML += `

<div class="product-card">

<div class="slider">

<img
src="${image}"
class="product-img active"
alt="${product.name}"
loading="lazy"
onerror="this.style.display='none';">

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


        updateWishlistCounter();

    }
    catch(error){

        console.error(
            "Wishlist Error:",
            error
        );

    }

}


/* ==========================================================
   RELATED PRODUCTS
========================================================== */

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

                const gallery =
                    getGallery(item);


                const image =
                    gallery.length
                    ? gallery[0]
                    : "";


                related.innerHTML += `

<div class="product-card">

<div class="slider">

<img
src="${image}"
class="product-img active"
alt="${item.name}"
loading="lazy"
onerror="this.style.display='none';">

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
   HOME PRODUCT SLIDER
========================================================== */

function startHomeSlider(){

    homeSliderTimers.forEach(
        function(timer){

            clearInterval(timer);

        }
    );


    homeSliderTimers = [];


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


                const timer =
                    setInterval(
                        function(){

                            images[current]
                                .classList
                                .remove(
                                    "active"
                                );


                            current++;


                            if(
                                current >=
                                images.length
                            ){

                                current = 0;

                            }


                            images[current]
                                .classList
                                .add(
                                    "active"
                                );

                        },
                        3000
                    );


                homeSliderTimers.push(
                    timer
                );

            }
        );

}


/* ==========================================================
   IMAGE PREVIEW
========================================================== */

function initImagePreview(){

    const modal =
        $("#imageModal");

    const modalImg =
        $("#modalImage");


    if(
        !modal ||
        !modalImg
    ){

        return;

    }


    document.addEventListener(
        "click",
        function(e){

            if(
                e.target.classList &&
                e.target.classList.contains(
                    "product-img"
                )
            ){

                /*
                   Product detail gallery-তে
                   click already handled হয়েছে।
                */

                if(
                    e.target.closest(
                        "#productSlider"
                    )
                ){

                    return;

                }


                modal.style.display =
                    "flex";


                modalImg.src =
                    e.target.src;

            }

        }
    );


    const close =
        modal.querySelector(
            ".close-modal"
        );


    if(close){

        close.onclick =
            function(){

                modal.style.display =
                    "none";

            };

    }


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
   CONTACT FORM
========================================================== */

function initContactForm(){

    const form =
        $("#contactForm");

    if(!form) return;


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


/* ==========================================================
   CONTACT STATUS
========================================================== */

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

    }
    else{

        status.style.color =
            "#166C39";

        status.style.background =
            "#e9f8ef";

    }

}


/* ==========================================================
   BACK TO TOP
========================================================== */

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

            }
            else{

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

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/* ==========================================================
   FINAL INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function(){

        console.log(
            "✅ Maliha Agro Industry JS FINAL Loaded"
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

        if($("#productSlider")){

            await loadProductDetails();

        }


        /* ==========================
           WISHLIST PAGE
        ========================== */

        if($("#wishlistProducts")){

            await loadWishlistPage();

        }

    }
);
