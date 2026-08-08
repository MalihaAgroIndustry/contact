"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL CLEAN VERSION
   PART 1/8

   Core
   Helpers
   Product Data
   Category Data
========================================================== */


/* ==========================================================
   GLOBAL STATE
========================================================== */

let wishlist = JSON.parse(
    localStorage.getItem("wishlist") || "[]"
)
    .map(Number)
    .filter(Number.isFinite);

let products = [];
let categories = [];

let currentProduct = null;

let deferredPrompt = null;

let productSliderTimer = null;

let sliderTimers = [];

let homeSliderTimers = [];


/* ==========================================================
   DOM HELPERS
========================================================== */

const $ = selector =>
    document.querySelector(selector);


const $$ = selector =>
    document.querySelectorAll(selector);


/* ==========================================================
   SITE CONFIG
========================================================== */

const SITE_CONFIG = {

    name: "Maliha Agro Industry",

    whatsapp:
        "8801303679189",

    phone:
        "01303679189",

    email:
        "",

    website:
        window.location.origin

};


/* ==========================================================
   PRICE FORMAT
========================================================== */

function formatPrice(price) {

    const value =
        Number(price || 0);

    return (
        "৳" +
        value.toLocaleString(
            "bn-BD"
        )
    );

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==========================================================
   NORMALIZE TEXT
========================================================== */

function normalizeCategory(value) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

}


/* ==========================================================
   PRODUCT ID
========================================================== */

function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return Number(
        params.get("id")
    );

}


/* ==========================================================
   IMAGE PATH FIX
========================================================== */

function imagePath(path) {

    if (!path) {

        return "";

    }


    let src =
        String(path)
            .trim()
            .replace(
                /\\/g,
                "/"
            );


    /*
       ../images/file.jpg
       ../../images/file.jpg
       ./images/file.jpg

       সবকে:

       images/file.jpg

       করা হবে।
    */

    src =
        src.replace(
            /^(\.\.\/)+images\//i,
            "images/"
        );


    src =
        src.replace(
            /^\.\/images\//i,
            "images/"
        );


    /*
       External URL
    */

    if (
        /^https?:\/\//i.test(src) ||
        src.startsWith("data:")
    ) {

        return src;

    }


    /*
       যদি images/ দিয়ে শুরু না হয়
    */

    if (
        !src.startsWith("images/") &&
        !src.startsWith("/") &&
        !src.startsWith("../")
    ) {

        /*
           filename.jpg
        */

        if (
            !src.includes("/")
        ) {

            return (
                "images/" +
                src
            );

        }

    }


    return src;

}


/* ==========================================================
   PRODUCT GALLERY
========================================================== */

function getGallery(product) {

    if (
        !product ||
        !Array.isArray(
            product.gallery
        )
    ) {

        return [];

    }


    return product.gallery
        .map(imagePath)
        .filter(Boolean);

}


/* ==========================================================
   CATEGORY NAME
========================================================== */

function getCategoryName(
    categoryId
) {

    const normalized =
        normalizeCategory(
            categoryId
        );


    const category =
        categories.find(
            item =>
                normalizeCategory(
                    item?.id ||
                    item?.slug ||
                    item?.name
                ) === normalized
        );


    return (
        category?.name ||
        category?.title ||
        categoryId ||
        "অন্যান্য"
    );

}


/* ==========================================================
   SUB CATEGORY NAME
========================================================== */

function getSubCategoryName(
    categoryId,
    subCategoryId
) {

    const category =
        categories.find(
            item =>
                normalizeCategory(
                    item?.id ||
                    item?.slug ||
                    item?.name
                ) ===
                normalizeCategory(
                    categoryId
                )
        );


    if (
        !category ||
        !Array.isArray(
            category.subCategories
        )
    ) {

        return (
            subCategoryId ||
            ""
        );

    }


    const sub =
        category.subCategories.find(
            item =>
                normalizeCategory(
                    item?.id ||
                    item?.slug ||
                    item?.name
                ) ===
                normalizeCategory(
                    subCategoryId
                )
        );


    return (
        sub?.name ||
        sub?.title ||
        subCategoryId ||
        ""
    );

}


/* ==========================================================
   FIND CATEGORY
========================================================== */

function findCategory(
    categoryId
) {

    const normalized =
        normalizeCategory(
            categoryId
        );


    return categories.find(
        category =>
            normalizeCategory(
                category?.id ||
                category?.slug ||
                category?.name
            ) === normalized
    ) || null;

}


/* ==========================================================
   FETCH PRODUCTS
========================================================== */

async function fetchProducts() {

    const response =
        await fetch(
            "data/products.json",
            {
                cache: "no-store"
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "data/products.json load failed"
        );

    }


    const data =
        await response.json();


    if (
        !Array.isArray(data)
    ) {

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

async function ensureProductsLoaded() {

    if (
        products.length
    ) {

        return products;

    }


    return await fetchProducts();

}


/* ==========================================================
   FETCH CATEGORIES
========================================================== */

async function fetchCategories() {

    try {

        const response =
            await fetch(
                "data/categories.json",
                {
                    cache: "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "categories.json not found"
            );

        }


        const data =
            await response.json();


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "categories.json must contain an array"
            );

        }


        categories =
            data;


        return categories;

    }
    catch (error) {

        console.warn(
            "Categories JSON unavailable. Building categories from products."
        );


        categories = [];

        return [];

    }

}


/* ==========================================================
   BUILD CATEGORY DATA FROM PRODUCTS
========================================================== */

function buildCategoriesFromProducts() {

    if (
        categories.length ||
        !products.length
    ) {

        return;

    }


    const map =
        new Map();


    products.forEach(
        product => {

            const categoryId =
                normalizeCategory(
                    product.category
                );


            if (
                !categoryId
            ) {

                return;

            }


            if (
                !map.has(
                    categoryId
                )
            ) {

                map.set(
                    categoryId,
                    {

                        id:
                            categoryId,

                        name:
                            product.categoryName ||
                            product.category ||
                            "অন্যান্য",

                        subCategories:
                            []

                    }
                );

            }


            const category =
                map.get(
                    categoryId
                );


            const subId =
                normalizeCategory(
                    product.subCategory
                );


            if (
                subId &&
                !category.subCategories.some(
                    item =>
                        normalizeCategory(
                            item.id
                        ) === subId
                )
            ) {

                category.subCategories.push({

                    id:
                        subId,

                    name:
                        product.subCategoryName ||
                        product.subCategory ||
                        "অন্যান্য"

                });

            }

        }
    );


    categories =
        Array.from(
            map.values()
        );

}


/* ==========================================================
   ENSURE CATEGORIES LOADED
========================================================== */

async function ensureCategoriesLoaded() {

    if (
        categories.length
    ) {

        return categories;

    }


    await fetchCategories();


    /*
       categories.json না থাকলে
       products.json থেকে তৈরি হবে।
    */

    if (
        !categories.length
    ) {

        buildCategoriesFromProducts();

    }


    return categories;

}


/* ==========================================================
   RESET PRODUCT DATA
========================================================== */

function resetProductData() {

    products = [];

    categories = [];

    currentProduct = null;

}


/* ==========================================================
   SHARE CARD
========================================================== */

function initShareCard() {

    const button =
        $("#shareCard");


    if (
        !button ||
        button.dataset.bound
    ) {

        return;

    }


    button.dataset.bound =
        "true";


    button.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            const data = {

                title:
                    "Maliha Agro Industry",

                text:
                    "Maliha Agro Industry — Digital Business Card",

                url:
                    window.location.href

            };


            if (
                navigator.share
            ) {

                try {

                    await navigator.share(
                        data
                    );

                }
                catch (error) {

                    if (
                        error.name !==
                        "AbortError"
                    ) {

                        console.error(
                            "Share Error:",
                            error
                        );

                    }

                }

                return;

            }


            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );


                alert(
                    "✅ লিংক কপি হয়েছে"
                );

            }
            catch (error) {

                console.error(
                    "Clipboard Error:",
                    error
                );


                alert(
                    "❌ লিংক কপি করা যায়নি"
                );

            }

        }
    );

}


/* ==========================================================
   SAVE CONTACT
========================================================== */

function initSaveContact() {

    const button =
        $("#saveContact");


    if (
        !button ||
        button.dataset.bound
    ) {

        return;

    }


    button.dataset.bound =
        "true";


    button.addEventListener(
        "click",
        event => {

            event.preventDefault();


            window.location.href =
                "contact.vcf";

        }
    );

}


/* ==========================================================
   PWA INSTALL
========================================================== */

function initPWA() {

    const button =
        $("#installApp");


    if (
        !button ||
        button.dataset.bound
    ) {

        return;

    }


    button.dataset.bound =
        "true";


    button.style.display =
        "none";


    window.addEventListener(
        "beforeinstallprompt",
        event => {

            event.preventDefault();


            deferredPrompt =
                event;


            button.style.display =
                "flex";

        }
    );


    button.addEventListener(
        "click",
        async () => {

            if (
                !deferredPrompt
            ) {

                return;

            }


            deferredPrompt.prompt();


            try {

                await deferredPrompt.userChoice;

            }
            catch (error) {

                console.error(
                    "PWA Install Error:",
                    error
                );

            }


            deferredPrompt =
                null;


            button.style.display =
                "none";

        }
    );


    window.addEventListener(
        "appinstalled",
        () => {

            deferredPrompt =
                null;


            button.style.display =
                "none";

        }
    );

}


/* ==========================================================
   BOTTOM NAVIGATION
========================================================== */

function initBottomNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() ||
        "index.html";


    $$(".bottom-nav a")
        .forEach(
            link => {

                link.classList.remove(
                    "active"
                );


                const href =
                    link.getAttribute(
                        "href"
                    );


                if (
                    !href
                ) {

                    return;

                }


                const clean =
                    href
                        .split("?")[0]
                        .split("#")[0];


                if (
                    clean ===
                    currentPage ||

                    (
                        currentPage ===
                        "" &&
                        clean ===
                        "index.html"
                    )
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

}


/* ==========================================================
   BACK TO TOP
========================================================== */

function initBackToTop() {

    const button =
        $("#backToTop");


    if (
        !button ||
        button.dataset.bound
    ) {

        return;

    }


    button.dataset.bound =
        "true";


    const update =
        () => {

            button.classList.toggle(
                "show",
                window.scrollY >
                350
            );

        };


    window.addEventListener(
        "scroll",
        update,
        {
            passive: true
        }
    );


    button.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior:
                    "smooth"

            });

        }
    );


    update();

}


/* ==========================================================
   PART 1 COMPLETE
========================================================== */

console.log(
    "🌱 Part 1/8 — Core, Helpers & Data System Loaded."
);

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL CLEAN VERSION
   PART 2/8

   Product Search
   Category Filter
   Sort
   Product Card Slider
   Product Details
========================================================== */


/* ==========================================================
   PRODUCT SEARCH
========================================================== */

function initSearch() {

    const input =
        $("#searchProduct");


    if (
        !input ||
        input.dataset.bound
    ) {

        return;

    }


    input.dataset.bound =
        "true";


    let timer = null;


    input.addEventListener(
        "input",
        () => {

            clearTimeout(
                timer
            );


            timer =
                setTimeout(
                    () => {

                        const active =
                            $(".filter-btn.active");


                        loadProducts(
                            active?.dataset.category ||
                            "all"
                        );

                    },
                    250
                );

        }
    );

}


/* ==========================================================
   CATEGORY FILTER
========================================================== */

function initCategoryFilter() {

    $$(".filter-btn")
        .forEach(
            button => {

                if (
                    button.dataset.bound
                ) {

                    return;

                }


                button.dataset.bound =
                    "true";


                button.addEventListener(
                    "click",
                    () => {

                        $$(".filter-btn")
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        loadProducts(
                            button.dataset.category ||
                            "all"
                        );

                    }
                );

            }
        );

}


/* ==========================================================
   SORT
========================================================== */

function initSort() {

    const select =
        $("#sortProducts");


    if (
        !select ||
        select.dataset.bound
    ) {

        return;

    }


    select.dataset.bound =
        "true";


    select.addEventListener(
        "change",
        () => {

            const active =
                $(".filter-btn.active");


            loadProducts(
                active?.dataset.category ||
                "all"
            );

        }
    );

}


/* ==========================================================
   PRODUCT CARD SLIDER
========================================================== */

function startHomeSlider() {

    homeSliderTimers
        .forEach(
            timer => {

                clearInterval(
                    timer
                );

            }
        );


    homeSliderTimers =
        [];


    $$(".product-card .slider")
        .forEach(
            slider => {

                const images =
                    slider.querySelectorAll(
                        ".product-img"
                    );


                if (
                    images.length <= 1
                ) {

                    return;

                }


                let index = 0;


                const timer =
                    setInterval(
                        () => {

                            images[index]
                                ?.classList.remove(
                                    "active"
                                );


                            index =
                                (
                                    index + 1
                                ) %
                                images.length;


                            images[index]
                                ?.classList.add(
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
   STOP HOME SLIDER
========================================================== */

function stopHomeSlider() {

    homeSliderTimers
        .forEach(
            timer => {

                clearInterval(
                    timer
                );

            }
        );


    homeSliderTimers =
        [];

}


/* ==========================================================
   PRODUCT DETAILS
========================================================== */

async function loadProductDetails() {

    const details =
        $("#productDetails");


    if (!details) {

        return;

    }


    try {

        await ensureProductsLoaded();


        const id =
            getProductId();


        currentProduct =
            products.find(
                product =>
                    Number(
                        product.id
                    ) === id
            );


        /* ------------------------------------------
           PRODUCT NOT FOUND
        ------------------------------------------ */

        if (
            !currentProduct
        ) {

            details.innerHTML = `

                <div
                    class="card"
                    style="
                        text-align:center;
                        padding:40px 20px;
                    "
                >

                    <div
                        style="
                            font-size:50px;
                            margin-bottom:10px;
                        "
                    >
                        ❌
                    </div>


                    <h2>
                        পণ্য পাওয়া যায়নি
                    </h2>


                    <p
                        style="
                            color:#777;
                            margin:8px 0 15px;
                        "
                    >
                        এই পণ্যটি আর পাওয়া যাচ্ছে না।
                    </p>


                    <a
                        href="products.html"
                        class="btn"
                    >
                        🛍️ সকল পণ্য দেখুন
                    </a>

                </div>

            `;


            return;

        }


        /* ------------------------------------------
           GALLERY
        ------------------------------------------ */

        const gallery =
            getGallery(
                currentProduct
            );


        const images =
            gallery.length

                ?

                gallery
                    .map(
                        (
                            image,
                            index
                        ) => `

                            <img
                                src="${escapeHTML(
                                    image
                                )}"
                                class="
                                    product-img
                                    ${
                                        index === 0
                                            ? "active"
                                            : ""
                                    }
                                "
                                alt="${escapeHTML(
                                    currentProduct.name ||
                                    "Product"
                                )}"
                                ${
                                    index === 0
                                        ? ""
                                        : 'loading="lazy"'
                                }
                            >

                        `
                    )
                    .join("")

                :

                `

                    <div
                        class="product-image-empty"
                    >
                        🖼️ ছবি পাওয়া যায়নি
                    </div>

                `;


        /* ------------------------------------------
           IMAGE DOTS
        ------------------------------------------ */

        const dots =
            gallery.length > 1

                ?

                gallery
                    .map(
                        (
                            image,
                            index
                        ) => `

                            <button
                                type="button"
                                class="
                                    dot
                                    ${
                                        index === 0
                                            ? "active"
                                            : ""
                                    }
                                "
                                data-index="${index}"
                                aria-label="ছবি ${
                                    index + 1
                                }"
                            ></button>

                        `
                    )
                    .join("")

                :

                "";


        /* ------------------------------------------
           PRICE
        ------------------------------------------ */

        const price =
            Number(
                currentProduct.price || 0
            );


        const oldPrice =
            Number(
                currentProduct.oldPrice || 0
            );


        let discount = 0;


        if (
            oldPrice > price &&
            price > 0
        ) {

            discount =
                Math.round(
                    (
                        (
                            oldPrice -
                            price
                        ) /
                        oldPrice
                    ) * 100
                );

        }


        /* ------------------------------------------
           RATING
        ------------------------------------------ */

        const rating =
            Math.max(
                0,
                Math.min(
                    5,
                    Math.round(
                        Number(
                            currentProduct.rating ||
                            0
                        )
                    )
                )
            );


        const reviewCount =
            Number(
                currentProduct.reviewCount ||
                0
            );


        /* ------------------------------------------
           DETAILS HTML
        ------------------------------------------ */

        details.innerHTML = `

            <div
                class="product-details"
            >

                <!-- IMAGE -->

                <div
                    class="product-slider"
                    id="productSlider"
                >

                    ${images}

                </div>


                <!-- DOTS -->

                ${
                    dots

                    ?

                    `
                        <div
                            class="slider-dots"
                        >
                            ${dots}
                        </div>
                    `

                    :

                    ""
                }


                <!-- CATEGORY -->

                <div
                    style="
                        color:#1F8F4D;
                        font-size:13px;
                        font-weight:600;
                        margin-top:12px;
                    "
                >

                    ${escapeHTML(
                        currentProduct.categoryName ||
                        getCategoryName(
                            currentProduct.category
                        ) ||
                        "অন্যান্য"
                    )}

                </div>


                <!-- PRODUCT NAME -->

                <h1>

                    ${escapeHTML(
                        currentProduct.name ||
                        "পণ্য"
                    )}

                </h1>


                <!-- RATING -->

                <p
                    class="rating"
                    style="
                        color:#e5a000;
                    "
                >

                    ${
                        "⭐".repeat(
                            rating
                        )
                    }${
                        "☆".repeat(
                            5 - rating
                        )
                    }

                    <span
                        style="
                            color:#777;
                            font-size:12px;
                        "
                    >
                        (${reviewCount})
                    </span>

                </p>


                <!-- PRICE -->

                <div
                    class="price-box"
                >

                    ${
                        oldPrice > price

                        ?

                        `
                            <p
                                class="old-price"
                            >
                                ${formatPrice(
                                    oldPrice
                                )}
                            </p>
                        `

                        :

                        ""
                    }


                    <p
                        class="price"
                    >
                        ${formatPrice(
                            price
                        )}
                    </p>


                    ${
                        discount > 0

                        ?

                        `
                            <span
                                style="
                                    background:#e53935;
                                    color:#fff;
                                    padding:4px 7px;
                                    border-radius:5px;
                                    font-size:11px;
                                    font-weight:700;
                                "
                            >
                                ${discount}% OFF
                            </span>
                        `

                        :

                        ""
                    }

                </div>


                <!-- STOCK -->

                <div
                    class="stock-box"
                >

                    🟢 ${escapeHTML(
                        currentProduct.stock ||
                        "স্টকে আছে"
                    )}

                </div>


                <!-- PRODUCT INFO -->

                ${
                    currentProduct.brand

                    ?

                    `
                        <p>
                            <b>প্রস্তুতকারক:</b>
                            ${escapeHTML(
                                currentProduct.brand
                            )}
                        </p>
                    `

                    :

                    ""
                }


                ${
                    currentProduct.type

                    ?

                    `
                        <p>
                            <b>ধরন:</b>
                            ${escapeHTML(
                                currentProduct.type
                            )}
                        </p>
                    `

                    :

                    ""
                }


                ${
                    currentProduct.sku

                    ?

                    `
                        <p>
                            <b>SKU:</b>
                            ${escapeHTML(
                                currentProduct.sku
                            )}
                        </p>
                    `

                    :

                    ""
                }


                ${
                    currentProduct.weight

                    ?

                    `
                        <p>
                            <b>ওজন:</b>
                            ${escapeHTML(
                                currentProduct.weight
                            )}
                        </p>
                    `

                    :

                    ""
                }


                <!-- DESCRIPTION -->

                <div
                    class="product-description"
                >

                    ${escapeHTML(
                        currentProduct.description ||
                        currentProduct.shortDescription ||
                        ""
                    )}

                </div>


                <!-- QUANTITY -->

                <div
                    class="quantity-box"
                >

                    <h3>
                        পরিমাণ
                    </h3>


                    <div
                        class="qty-control"
                    >

                        <button
                            id="minusQty"
                            type="button"
                            aria-label="কম পরিমাণ"
                        >
                            −
                        </button>


                        <input
                            id="qty"
                            type="text"
                            value="1"
                            readonly
                            aria-label="পরিমাণ"
                        >


                        <button
                            id="plusQty"
                            type="button"
                            aria-label="বেশি পরিমাণ"
                        >
                            +
                        </button>

                    </div>


                    <p
                        class="total-price"
                    >

                        মোট মূল্য :

                        <span
                            id="totalPrice"
                        >
                            ${formatPrice(
                                price
                            )}
                        </span>

                    </p>

                </div>


                <!-- ORDER -->

                <a
                    id="productOrderButton"
                    class="btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="#"
                >
                    🛒 WhatsApp-এ অর্ডার করুন
                </a>


                <!-- SHARE -->

                <button
                    class="btn"
                    id="shareProduct"
                    type="button"
                >
                    📤 পণ্য শেয়ার করুন
                </button>

            </div>

        `;


        /* ------------------------------------------
           INITIALIZE DETAIL CONTROLS
        ------------------------------------------ */

        initProductDots();

        initQuantity();

        initShareProduct();

        startProductSlider();

        updateOrderLink(
            1
        );


        if (
            typeof loadRelatedProducts ===
            "function"
        ) {

            loadRelatedProducts();

        }


    }
    catch (error) {

        console.error(
            "Product Details Error:",
            error
        );


        details.innerHTML = `

            <div
                class="card"
                style="
                    text-align:center;
                    padding:35px 20px;
                "
            >

                <h2>
                    ❌ পণ্য লোড করা যায়নি
                </h2>


                <p
                    style="
                        color:#777;
                    "
                >
                    data/products.json
                    লোড করতে সমস্যা হয়েছে।
                </p>

            </div>

        `;

    }

}


/* ==========================================================
   PRODUCT DETAIL SLIDER
========================================================== */

function startProductSlider() {

    const images =
        $$("#productDetails .product-slider .product-img");


    if (
        productSliderTimer
    ) {

        clearInterval(
            productSliderTimer
        );


        productSliderTimer =
            null;

    }


    if (
        images.length <= 1
    ) {

        return;

    }


    let current =
        0;


    productSliderTimer =
        setInterval(
            () => {

                current =
                    (
                        current + 1
                    ) %
                    images.length;


                changeImage(
                    current
                );

            },
            3000
        );

}


/* ==========================================================
   PRODUCT DETAIL DOTS
========================================================== */

function initProductDots() {

    $$("#productDetails .dot")
        .forEach(
            dot => {

                if (
                    dot.dataset.bound
                ) {

                    return;

                }


                dot.dataset.bound =
                    "true";


                dot.addEventListener(
                    "click",
                    () => {

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


/* ==========================================================
   CHANGE PRODUCT IMAGE
========================================================== */

function changeImage(
    index
) {

    const images =
        $$("#productDetails .product-slider .product-img");


    const dots =
        $$("#productDetails .slider-dots .dot");


    if (
        index < 0 ||
        index >= images.length
    ) {

        return;

    }


    images.forEach(
        image => {

            image.classList.remove(
                "active"
            );

        }
    );


    dots.forEach(
        dot => {

            dot.classList.remove(
                "active"
            );

        }
    );


    images[index]
        ?.classList.add(
            "active"
        );


    dots[index]
        ?.classList.add(
            "active"
        );

}


/* ==========================================================
   QUANTITY
========================================================== */

function initQuantity() {

    const input =
        $("#qty");


    const total =
        $("#totalPrice");


    const plus =
        $("#plusQty");


    const minus =
        $("#minusQty");


    if (
        !input ||
        !total ||
        !plus ||
        !minus ||
        !currentProduct
    ) {

        return;

    }


    if (
        input.dataset.bound
    ) {

        return;

    }


    input.dataset.bound =
        "true";


    let qty = 1;


    const update =
        () => {

            input.value =
                qty;


            total.textContent =
                formatPrice(
                    Number(
                        currentProduct.price ||
                        0
                    ) *
                    qty
                );


            updateOrderLink(
                qty
            );

        };


    plus.addEventListener(
        "click",
        () => {

            qty++;


            update();

        }
    );


    minus.addEventListener(
        "click",
        () => {

            if (
                qty > 1
            ) {

                qty--;

            }


            update();

        }
    );


    update();

}


/* ==========================================================
   WHATSAPP ORDER LINK
========================================================== */

function updateOrderLink(
    quantity = 1
) {

    const button =
        $("#productOrderButton");


    if (
        !button ||
        !currentProduct
    ) {

        return;

    }


    const qty =
        Math.max(
            1,
            Number(
                quantity
            ) || 1
        );


    const price =
        Number(
            currentProduct.price ||
            0
        );


    const total =
        price *
        qty;


    const message =
        `আমি ${currentProduct.name || "পণ্য"} অর্ডার করতে চাই।

পরিমাণ: ${qty}

একক মূল্য: ${formatPrice(price)}

মোট মূল্য: ${formatPrice(total)}

পণ্য লিংক:
${window.location.href}`;


    button.href =
        "https://wa.me/" +
        SITE_CONFIG.whatsapp +
        "?text=" +
        encodeURIComponent(
            message
        );

}


/* ==========================================================
   SHARE PRODUCT
========================================================== */

function initShareProduct() {

    const button =
        $("#shareProduct");


    if (
        !button ||
        !currentProduct ||
        button.dataset.bound
    ) {

        return;

    }


    button.dataset.bound =
        "true";


    button.addEventListener(
        "click",
        async () => {

            const data = {

                title:
                    currentProduct.name ||
                    "Maliha Agro Industry",

                text:
                    currentProduct.description ||
                    "Maliha Agro Industry Product",

                url:
                    window.location.href

            };


            if (
                navigator.share
            ) {

                try {

                    await navigator.share(
                        data
                    );

                }
                catch (error) {

                    if (
                        error.name !==
                        "AbortError"
                    ) {

                        console.error(
                            "Share Error:",
                            error
                        );

                    }

                }

                return;

            }


            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );


                alert(
                    "✅ পণ্যের লিংক কপি হয়েছে"
                );

            }
            catch (error) {

                console.error(
                    "Clipboard Error:",
                    error
                );


                alert(
                    "❌ লিংক কপি করা যায়নি"
                );

            }

        }
    );

}


/* ==========================================================
   PART 2 COMPLETE
========================================================== */

console.log(
    "🛍️ Part 2/8 — Search, Slider & Product Details Loaded."
);

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL A-Z VERSION
   PART 3/8

   PRODUCT DETAIL
   GALLERY
   QUANTITY
   WHATSAPP ORDER
   SHARE
   WISHLIST
========================================================== */


/* ==========================================================
   PRODUCT DETAIL — GALLERY
========================================================== */

function initDetailGallery() {

    const slider =
        $("#productSlider");

    if (
        !slider ||
        slider.dataset.galleryBound
    ) {
        return;
    }

    slider.dataset.galleryBound =
        "true";


    const images =
        slider.querySelectorAll(
            ".product-img"
        );

    if (!images.length) {
        return;
    }


    let currentIndex = 0;


    function showImage(index) {

        if (!images.length) {
            return;
        }


        currentIndex =
            (
                index +
                images.length
            ) %
            images.length;


        images.forEach(
            (image, i) => {

                image.classList.toggle(
                    "active",
                    i === currentIndex
                );

            }
        );


        const counter =
            $("#imageCounter");

        if (counter) {

            counter.textContent =
                `${currentIndex + 1} / ${images.length}`;

        }

    }


    $("#prevImage")
        ?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                showImage(
                    currentIndex - 1
                );

            }
        );


    $("#nextImage")
        ?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                showImage(
                    currentIndex + 1
                );

            }
        );


    images.forEach(
        (image, index) => {

            image.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openImageModal(
                        image.src
                    );

                }
            );

        }
    );


    showImage(0);

}


/* ==========================================================
   QUANTITY CONTROL
========================================================== */

function initQuantity() {

    const input =
        $("#qty");


    if (
        !input ||
        input.dataset.quantityBound
    ) {

        return;

    }


    input.dataset.quantityBound =
        "true";


    function normalizeQuantity() {

        let quantity =
            parseInt(
                input.value,
                10
            );


        if (
            !Number.isFinite(
                quantity
            ) ||
            quantity < 1
        ) {

            quantity = 1;

        }


        const max =
            parseInt(
                input.max,
                10
            );


        if (
            Number.isFinite(max) &&
            max > 0 &&
            quantity > max
        ) {

            quantity = max;

        }


        input.value =
            String(quantity);


        updateOrderLink(
            quantity
        );

    }


    input.addEventListener(
        "input",
        normalizeQuantity
    );


    input.addEventListener(
        "change",
        normalizeQuantity
    );


    $("#qtyMinus")
        ?.addEventListener(
            "click",
            event => {

                event.preventDefault();


                let quantity =
                    parseInt(
                        input.value,
                        10
                    ) || 1;


                quantity =
                    Math.max(
                        1,
                        quantity - 1
                    );


                input.value =
                    String(quantity);


                updateOrderLink(
                    quantity
                );

            }
        );


    $("#qtyPlus")
        ?.addEventListener(
            "click",
            event => {

                event.preventDefault();


                let quantity =
                    parseInt(
                        input.value,
                        10
                    ) || 1;


                const max =
                    parseInt(
                        input.max,
                        10
                    );


                quantity++;


                if (
                    Number.isFinite(max) &&
                    max > 0
                ) {

                    quantity =
                        Math.min(
                            quantity,
                            max
                        );

                }


                input.value =
                    String(quantity);


                updateOrderLink(
                    quantity
                );

            }
        );


    normalizeQuantity();

}


/* ==========================================================
   WHATSAPP ORDER LINK
========================================================== */

function updateOrderLink(
    quantity = 1
) {

    const button =
        $("#orderWhatsApp");


    if (!button) {
        return;
    }


    if (!currentProduct) {

        button.href =
            "#";

        return;

    }


    let qty =
        parseInt(
            quantity,
            10
        );


    if (
        !Number.isFinite(qty) ||
        qty < 1
    ) {

        qty = 1;

    }


    const productName =
        currentProduct.name ||
        "পণ্য";


    const productPrice =
        Number(
            currentProduct.price || 0
        );


    const total =
        productPrice *
        qty;


    const productUrl =
        window.location.href;


    const message =
        [
            "🌱 *মালিহা এগ্রো ইন্ডাস্ট্রি*",
            "",
            "🛍️ *পণ্য অর্ডার*",
            "",
            `📦 পণ্য: ${productName}`,
            `🔢 পরিমাণ: ${qty}`,
            `💰 একক মূল্য: ${formatPrice(productPrice)}`,
            `💵 মোট মূল্য: ${formatPrice(total)}`,
            "",
            `🔗 পণ্য লিংক: ${productUrl}`,
            "",
            "আমি এই পণ্যটি অর্ডার করতে চাই।"
        ]
            .join("\n");


    const whatsappNumber =
        String(
            SITE_CONFIG?.whatsapp ||
            SITE_CONFIG?.phone ||
            "8801303679189"
        )
            .replace(
                /[^0-9]/g,
                ""
            );


    button.href =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            message
        )}`;


    button.target =
        "_blank";


    button.rel =
        "noopener noreferrer";


    button.dataset.orderReady =
        "true";

}


/* ==========================================================
   ORDER BUTTON
========================================================== */

function initOrderButton() {

    const button =
        $("#orderWhatsApp");


    if (
        !button ||
        button.dataset.bound
    ) {

        return;

    }


    button.dataset.bound =
        "true";


    button.addEventListener(
        "click",
        event => {

            if (
                !currentProduct
            ) {

                event.preventDefault();

                return;

            }


            const quantity =
                parseInt(
                    $("#qty")?.value ||
                    1,
                    10
                );


            updateOrderLink(
                quantity
            );

        }
    );


    updateOrderLink(
        Number(
            $("#qty")?.value ||
            1
        )
    );

}


/* ==========================================================
   SHARE PRODUCT
========================================================== */

function initShareProduct() {

    const button =
        $("#shareProduct");


    if (
        !button ||
        button.dataset.bound
    ) {

        return;

    }


    button.dataset.bound =
        "true";


    button.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            if (
                !currentProduct
            ) {

                return;

            }


            const shareData =
                {

                    title:
                        currentProduct.name ||
                        "Maliha Agro Industry",

                    text:
                        currentProduct.name ||
                        "Maliha Agro Industry Product",

                    url:
                        window.location.href

                };


            try {

                if (
                    navigator.share
                ) {

                    await navigator.share(
                        shareData
                    );

                    return;

                }


                if (
                    navigator.clipboard
                ) {

                    await navigator.clipboard.writeText(
                        window.location.href
                    );


                    button.textContent =
                        "✅ লিংক কপি হয়েছে";


                    setTimeout(
                        () => {

                            button.textContent =
                                "🔗 শেয়ার করুন";

                        },
                        2000
                    );

                    return;

                }


                window.prompt(
                    "পণ্য লিংক কপি করুন:",
                    window.location.href
                );

            }
            catch (error) {

                if (
                    error?.name ===
                    "AbortError"
                ) {

                    return;

                }


                console.error(
                    "Share Error:",
                    error
                );

            }

        }
    );

}


/* ==========================================================
   DETAIL WISHLIST
========================================================== */

function initDetailWishlist() {

    const button =
        $("#detailWishlist");


    if (
        !button ||
        button.dataset.bound
    ) {

        return;

    }


    button.dataset.bound =
        "true";


    function updateButton() {

        if (
            !currentProduct
        ) {

            return;

        }


        const active =
            wishlist.includes(
                Number(
                    currentProduct.id
                )
            );


        button.textContent =
            active
                ? "❤️ Wishlist থেকে বাদ দিন"
                : "🤍 Wishlist-এ রাখুন";


        button.classList.toggle(
            "active",
            active
        );


        button.setAttribute(
            "aria-pressed",
            active
                ? "true"
                : "false"
        );

    }


    button.addEventListener(
        "click",
        event => {

            event.preventDefault();


            if (
                !currentProduct
            ) {

                return;

            }


            toggleWishlist(
                currentProduct.id
            );


            updateButton();

        }
    );


    updateButton();

}


/* ==========================================================
   IMAGE MODAL
========================================================== */

function openImageModal(
    src
) {

    const modal =
        $("#imageModal");


    const image =
        $("#modalImage");


    if (
        !modal ||
        !image ||
        !src
    ) {

        return;

    }


    image.src =
        src;


    image.alt =
        currentProduct?.name ||
        "Product Image";


    modal.style.display =
        "flex";


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* ==========================================================
   CLOSE IMAGE MODAL
========================================================== */

function closeImageModal() {

    const modal =
        $("#imageModal");


    const image =
        $("#modalImage");


    if (modal) {

        modal.style.display =
            "none";


        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if (image) {

        image.src =
            "";

    }


    document.body.classList.remove(
        "modal-open"
    );

}


/* ==========================================================
   IMAGE PREVIEW INITIALIZATION
========================================================== */

function initImagePreview() {

    const modal =
        $("#imageModal");


    if (!modal) {

        return;

    }


    const close =
        modal.querySelector(
            ".close-modal"
        );


    if (
        close &&
        !close.dataset.bound
    ) {

        close.dataset.bound =
            "true";


        close.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closeImageModal();

            }
        );

    }


    if (
        !modal.dataset.bound
    ) {

        modal.dataset.bound =
            "true";


        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    closeImageModal();

                }

            }
        );

    }

}


/* ==========================================================
   ESCAPE KEY
========================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeImageModal();

        }

    }
);


/* ==========================================================
   TOUCH / SWIPE SUPPORT
========================================================== */

function initDetailGallerySwipe() {

    const slider =
        $("#productSlider");


    if (
        !slider ||
        slider.dataset.swipeBound
    ) {

        return;

    }


    const images =
        slider.querySelectorAll(
            ".product-img"
        );


    if (
        images.length <= 1
    ) {

        return;

    }


    slider.dataset.swipeBound =
        "true";


    let startX =
        0;


    let endX =
        0;


    slider.addEventListener(
        "touchstart",
        event => {

            startX =
                event.touches[0]?.clientX ||
                0;

        },
        {
            passive: true
        }
    );


    slider.addEventListener(
        "touchend",
        event => {

            endX =
                event.changedTouches[0]?.clientX ||
                0;


            const distance =
                endX - startX;


            if (
                Math.abs(distance) <
                50
            ) {

                return;

            }


            if (
                distance < 0
            ) {

                $("#nextImage")
                    ?.click();

            }
            else {

                $("#prevImage")
                    ?.click();

            }

        },
        {
            passive: true
        }
    );

}


/* ==========================================================
   DETAIL CONTROL PATCH
========================================================== */

function initProductDetailFinalPatch() {

    if (
        !currentProduct
    ) {

        return;

    }


    initDetailGallerySwipe();


    updateOrderLink(
        Number(
            $("#qty")?.value ||
            1
        )
    );


    updateWishlistCounter();

}


/* ==========================================================
   PART 3 COMPLETE
========================================================== */

console.log(
    "🛍️ Part 3/8 — Product Detail Controls Loaded."
);

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL A-Z VERSION
   PART 4/8

   PRODUCT CARD
   PRODUCT LIST
   SEARCH
   SORT
   FILTER
========================================================== */


/* ==========================================================
   PRODUCT CARD
========================================================== */

function createProductCard(product) {

    if (!product) {

        return document.createDocumentFragment();

    }


    const card =
        document.createElement("article");


    card.className =
        "product-card";


    const productId =
        Number(product.id);


    if (
        !Number.isFinite(productId)
    ) {

        return document.createDocumentFragment();

    }


    card.dataset.id =
        String(productId);


    card.dataset.category =
        normalizeCategory(
            product.category
        );


    card.dataset.subCategory =
        normalizeCategory(
            product.subCategory
        );


    /* ======================================================
       GALLERY
    ====================================================== */

    const gallery =
        getGallery(product);


    const images =
        gallery.length
            ? gallery
            : [""];


    /* ======================================================
       PRICE
    ====================================================== */

    const price =
        Number(
            product.price || 0
        );


    const oldPrice =
        Number(
            product.oldPrice || 0
        );


    let discount =
        0;


    if (
        oldPrice > price &&
        price > 0
    ) {

        discount =
            Math.round(
                (
                    (
                        oldPrice -
                        price
                    ) /
                    oldPrice
                ) * 100
            );

    }


    /* ======================================================
       RATING
    ====================================================== */

    const rating =
        Math.max(
            0,
            Math.min(
                5,
                Math.round(
                    Number(
                        product.rating || 0
                    )
                )
            )
        );


    const reviewCount =
        Number(
            product.reviewCount || 0
        );


    /* ======================================================
       CATEGORY
    ====================================================== */

    const categoryName =
        product.categoryName ||
        getCategoryName(
            product.category
        );


    const subCategoryName =
        product.subCategoryName ||
        getSubCategoryName(
            product.category,
            product.subCategory
        );


    /* ======================================================
       CARD HTML
    ====================================================== */

    card.innerHTML = `

        <div
            class="product-card-inner"
            style="
                position:relative;
                height:100%;
                display:flex;
                flex-direction:column;
            "
        >

            <!-- ==========================================
                 BADGES
            =========================================== -->

            <div
                style="
                    position:absolute;
                    top:10px;
                    left:10px;
                    z-index:10;
                    display:flex;
                    flex-wrap:wrap;
                    gap:5px;
                "
            >

                ${
                    product.offer
                    ?

                    `
                        <span
                            style="
                                background:#e53935;
                                color:#fff;
                                padding:4px 8px;
                                border-radius:6px;
                                font-size:10px;
                                font-weight:700;
                            "
                        >
                            🔥 অফার
                        </span>
                    `

                    :

                    ""
                }


                ${
                    product.newArrival
                    ?

                    `
                        <span
                            style="
                                background:#1F8F4D;
                                color:#fff;
                                padding:4px 8px;
                                border-radius:6px;
                                font-size:10px;
                                font-weight:700;
                            "
                        >
                            🆕 নতুন
                        </span>
                    `

                    :

                    ""
                }


                ${
                    product.bestSeller
                    ?

                    `
                        <span
                            style="
                                background:#e5a000;
                                color:#fff;
                                padding:4px 8px;
                                border-radius:6px;
                                font-size:10px;
                                font-weight:700;
                            "
                        >
                            ⭐ বেস্ট সেলার
                        </span>
                    `

                    :

                    ""
                }

            </div>


            <!-- ==========================================
                 DISCOUNT
            =========================================== -->

            ${
                discount > 0
                ?

                `
                    <span
                        style="
                            position:absolute;
                            top:10px;
                            right:10px;
                            z-index:11;
                            background:#1F8F4D;
                            color:#fff;
                            padding:4px 7px;
                            border-radius:5px;
                            font-size:10px;
                            font-weight:700;
                        "
                    >
                        ${discount}% OFF
                    </span>
                `

                :

                ""
            }


            <!-- ==========================================
                 WISHLIST
            =========================================== -->

            <button
                type="button"
                class="wishlist-btn"
                data-id="${productId}"
                aria-label="Wishlist"
                aria-pressed="false"
                style="
                    position:absolute;
                    top:10px;
                    right:${
                        discount > 0
                            ? "65px"
                            : "10px"
                    };
                    z-index:20;
                    width:36px;
                    height:36px;
                    border-radius:50%;
                    border:1px solid #ddd;
                    background:#fff;
                    cursor:pointer;
                    font-size:18px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    box-shadow:0 2px 8px rgba(0,0,0,.08);
                "
            >
                🤍
            </button>


            <!-- ==========================================
                 IMAGE SLIDER
            =========================================== -->

            <div
                class="slider"
                data-product-id="${productId}"
                style="
                    position:relative;
                    width:100%;
                    overflow:hidden;
                    border-radius:12px 12px 0 0;
                    background:#f5f8f5;
                "
            >

                ${
                    images
                        .map(
                            (
                                image,
                                index
                            ) => `

                                <img
                                    src="${escapeHTML(
                                        image
                                    )}"
                                    class="product-img ${
                                        index === 0
                                            ? "active"
                                            : ""
                                    }"
                                    alt="${escapeHTML(
                                        product.name ||
                                        "Maliha Agro Industry Product"
                                    )}"
                                    ${
                                        index === 0
                                            ? ""
                                            : 'loading="lazy"'
                                    }
                                >

                            `
                        )
                        .join("")
                }

            </div>


            <!-- ==========================================
                 PRODUCT CONTENT
            =========================================== -->

            <div
                class="product-card-content"
                style="
                    padding:14px;
                    display:flex;
                    flex-direction:column;
                    flex:1;
                "
            >

                <!-- CATEGORY -->

                <div
                    style="
                        font-size:11px;
                        color:#1F8F4D;
                        font-weight:600;
                        margin-bottom:4px;
                    "
                >

                    ${escapeHTML(
                        categoryName ||
                        "অন্যান্য"
                    )}

                    ${
                        subCategoryName
                        ?

                        `
                            <span
                                style="
                                    color:#777;
                                    font-weight:400;
                                "
                            >
                                → ${escapeHTML(
                                    subCategoryName
                                )}
                            </span>
                        `

                        :

                        ""
                    }

                </div>


                <!-- PRODUCT NAME -->

                <h3
                    style="
                        margin:4px 0 7px;
                        line-height:1.4;
                    "
                >

                    <a
                        href="product.html?id=${encodeURIComponent(
                            productId
                        )}"
                        style="
                            color:inherit;
                            text-decoration:none;
                        "
                    >

                        ${escapeHTML(
                            product.name ||
                            "পণ্য"
                        )}

                    </a>

                </h3>


                <!-- BRAND -->

                ${
                    product.brand
                    ?

                    `
                        <div
                            style="
                                font-size:11px;
                                color:#777;
                                margin-bottom:5px;
                            "
                        >
                            প্রস্তুতকারক:
                            ${escapeHTML(
                                product.brand
                            )}
                        </div>
                    `

                    :

                    ""
                }


                <!-- RATING -->

                <div
                    style="
                        font-size:12px;
                        margin:4px 0 7px;
                        color:#e5a000;
                    "
                >

                    ${
                        "⭐".repeat(
                            rating
                        )
                    }${
                        "☆".repeat(
                            5 - rating
                        )
                    }

                    <span
                        style="
                            color:#777;
                            margin-left:3px;
                        "
                    >
                        (${reviewCount})
                    </span>

                </div>


                <!-- PRICE -->

                <div
                    style="
                        margin-top:auto;
                        padding-top:5px;
                    "
                >

                    <span
                        style="
                            color:#1F8F4D;
                            font-size:20px;
                            font-weight:800;
                        "
                    >
                        ${formatPrice(
                            price
                        )}
                    </span>


                    ${
                        oldPrice > price
                        ?

                        `
                            <span
                                style="
                                    color:#999;
                                    font-size:12px;
                                    text-decoration:line-through;
                                    margin-left:5px;
                                "
                            >
                                ${formatPrice(
                                    oldPrice
                                )}
                            </span>
                        `

                        :

                        ""
                    }

                </div>


                <!-- STOCK -->

                <div
                    style="
                        color:#198754;
                        font-size:11px;
                        margin-top:5px;
                    "
                >
                    🟢 ${escapeHTML(
                        product.stock ||
                        "স্টকে আছে"
                    )}
                </div>


                <!-- SHORT DESCRIPTION -->

                ${
                    product.shortDescription ||
                    product.description
                    ?

                    `
                        <p
                            style="
                                color:#666;
                                font-size:12px;
                                line-height:1.6;
                                margin:7px 0;
                            "
                        >
                            ${escapeHTML(
                                product.shortDescription ||
                                product.description ||
                                ""
                            )}
                        </p>
                    `

                    :

                    ""
                }


                <!-- ACTIONS -->

                <div
                    style="
                        display:grid;
                        grid-template-columns:1fr 1fr;
                        gap:7px;
                        margin-top:10px;
                    "
                >

                    <a
                        href="product.html?id=${encodeURIComponent(
                            productId
                        )}"
                        class="btn"
                        style="
                            width:100%;
                            margin:0;
                            padding:8px 6px;
                            font-size:12px;
                            text-align:center;
                        "
                    >
                        👁️ বিস্তারিত
                    </a>


                    <a
                        href="#"
                        class="btn product-whatsapp-btn"
                        data-id="${productId}"
                        style="
                            width:100%;
                            margin:0;
                            padding:8px 6px;
                            font-size:12px;
                            text-align:center;
                            background:#25D366;
                            color:#fff;
                        "
                    >
                        <i
                            class="fa-brands fa-whatsapp"
                        ></i>
                        অর্ডার
                    </a>

                </div>

            </div>

        </div>

    `;


    /* ======================================================
       WISHLIST BUTTON
    ====================================================== */

    const wishlistButton =
        card.querySelector(
            ".wishlist-btn"
        );


    if (wishlistButton) {

        updateWishlistButton(
            wishlistButton,
            productId
        );


        wishlistButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                toggleWishlist(
                    productId
                );


                updateWishlistButton(
                    wishlistButton,
                    productId
                );


                updateWishlistCounter();

            }
        );

    }


    /* ======================================================
       WHATSAPP ORDER BUTTON
    ====================================================== */

    const whatsappButton =
        card.querySelector(
            ".product-whatsapp-btn"
        );


    if (whatsappButton) {

        whatsappButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                const productName =
                    product.name ||
                    "পণ্য";


                const productPrice =
                    Number(
                        product.price || 0
                    );


                const phone =
                    String(
                        SITE_CONFIG?.whatsapp ||
                        SITE_CONFIG?.phone ||
                        "8801303679189"
                    )
                        .replace(
                            /[^0-9]/g,
                            ""
                        );


                const message =
                    [
                        "🌱 *মালিহা এগ্রো ইন্ডাস্ট্রি*",
                        "",
                        "🛍️ *পণ্য অর্ডার করতে চাই*",
                        "",
                        `📦 পণ্য: ${productName}`,
                        `💰 মূল্য: ${formatPrice(productPrice)}`,
                        `🔢 পরিমাণ: 1`,
                        "",
                        `🔗 ${window.location.origin}/product.html?id=${encodeURIComponent(
                            productId
                        )}`
                    ]
                        .join("\n");


                const url =
                    `https://wa.me/${phone}?text=${encodeURIComponent(
                        message
                    )}`;


                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );

            }
        );

    }


    return card;

}


/* ==========================================================
   RENDER PRODUCT LIST
========================================================== */

function renderProductList(
    list,
    container
) {

    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(list) ||
        !list.length
    ) {

        container.innerHTML = `

            <div
                class="card"
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:45px 20px;
                "
            >

                <div
                    style="
                        font-size:50px;
                        margin-bottom:10px;
                    "
                >
                    🌱
                </div>

                <h2>
                    কোনো পণ্য পাওয়া যায়নি
                </h2>

                <p
                    style="
                        color:#777;
                        margin-top:7px;
                    "
                >
                    আপনার অনুসন্ধান বা
                    নির্বাচিত ক্যাটাগরির সাথে
                    মিল থাকা কোনো পণ্য নেই।
                </p>

                <button
                    type="button"
                    id="resetProductFilters"
                    class="btn"
                    style="
                        border:0;
                        width:auto;
                        margin:15px auto 0;
                        cursor:pointer;
                    "
                >
                    🔄 ফিল্টার রিসেট করুন
                </button>

            </div>

        `;


        $("#resetProductFilters")
            ?.addEventListener(
                "click",
                resetProductSearch
            );


        return;

    }


    const fragment =
        document.createDocumentFragment();


    list.forEach(
        product => {

            const card =
                createProductCard(
                    product
                );


            if (card) {

                fragment.appendChild(
                    card
                );

            }

        }
    );


    container.appendChild(
        fragment
    );


    updateWishlistCounter();


    startSliders();

}


/* ==========================================================
   ACTIVE CATEGORY
========================================================== */

function getActiveCategory() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlCategory =
        params.get(
            "category"
        );


    if (urlCategory) {

        return normalizeCategory(
            urlCategory
        );

    }


    const active =
        document.querySelector(
            ".category-btn.active"
        );


    return active
        ? normalizeCategory(
            active.dataset.category
        )
        : "";

}


/* ==========================================================
   ACTIVE SUB CATEGORY
========================================================== */

function getActiveSubCategory() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlSubCategory =
        params.get(
            "subcategory"
        ) ||
        params.get(
            "subCategory"
        );


    if (urlSubCategory) {

        return normalizeCategory(
            urlSubCategory
        );

    }


    const active =
        document.querySelector(
            ".subcategory-btn.active"
        );


    return active
        ? normalizeCategory(
            active.dataset.subcategory
        )
        : "";

}


/* ==========================================================
   PRODUCT FILTER
========================================================== */

function filterProducts(
    list,
    category = "",
    subCategory = "",
    searchTerm = ""
) {

    if (
        !Array.isArray(list)
    ) {

        return [];

    }


    const normalizedCategory =
        normalizeCategory(
            category
        );


    const normalizedSubCategory =
        normalizeCategory(
            subCategory
        );


    const search =
        String(
            searchTerm || ""
        )
            .trim()
            .toLowerCase();


    return list.filter(
        product => {

            if (
                !product
            ) {

                return false;

            }


            /* CATEGORY */

            if (
                normalizedCategory &&
                normalizeCategory(
                    product.category
                ) !==
                normalizedCategory
            ) {

                return false;

            }


            /* SUB CATEGORY */

            if (
                normalizedSubCategory &&
                normalizeCategory(
                    product.subCategory
                ) !==
                normalizedSubCategory
            ) {

                return false;

            }


            /* SEARCH */

            if (search) {

                const searchable = [

                    product.name,

                    product.description,

                    product.shortDescription,

                    product.brand,

                    product.sku,

                    product.type,

                    product.categoryName,

                    product.subCategoryName

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                if (
                    !searchable.includes(
                        search
                    )
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}


/* ==========================================================
   PRODUCT SORT
========================================================== */

function sortProducts(
    list,
    sortValue = "default"
) {

    if (
        !Array.isArray(list)
    ) {

        return [];

    }


    const sorted =
        [...list];


    switch (
        String(
            sortValue || "default"
        )
            .trim()
            .toLowerCase()
    ) {

        case "price-low":
        case "price-low-high":
        case "low-high":

            sorted.sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        a.price || 0
                    ) -
                    Number(
                        b.price || 0
                    )
            );

            break;


        case "price-high":
        case "price-high-low":
        case "high-low":

            sorted.sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        b.price || 0
                    ) -
                    Number(
                        a.price || 0
                    )
            );

            break;


        case "rating":
        case "top-rated":

            sorted.sort(
                (
                    a,
                    b
                ) => {

                    const ratingA =
                        Number(
                            a.rating || 0
                        );


                    const ratingB =
                        Number(
                            b.rating || 0
                        );


                    if (
                        ratingB !==
                        ratingA
                    ) {

                        return (
                            ratingB -
                            ratingA
                        );

                    }


                    return (
                        Number(
                            b.reviewCount ||
                            0
                        ) -
                        Number(
                            a.reviewCount ||
                            0
                        )
                    );

                }
            );

            break;


        case "newest":
        case "new":
        case "latest":

            sorted.sort(
                (
                    a,
                    b
                ) => {

                    const dateA =
                        new Date(
                            a.createdAt ||
                            a.date ||
                            0
                        ).getTime();


                    const dateB =
                        new Date(
                            b.createdAt ||
                            b.date ||
                            0
                        ).getTime();


                    if (
                        Number.isFinite(dateA) &&
                        Number.isFinite(dateB) &&
                        dateA !== dateB
                    ) {

                        return (
                            dateB -
                            dateA
                        );

                    }


                    return (
                        Number(
                            b.id || 0
                        ) -
                        Number(
                            a.id || 0
                        )
                    );

                }
            );

            break;


        case "name":
        case "name-az":
        case "a-z":

            sorted.sort(
                (
                    a,
                    b
                ) =>
                    String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        ),
                        "bn"
                    )
            );

            break;


        default:

            break;

    }


    return sorted;

}


/* ==========================================================
   PRODUCT LIST LOADER
========================================================== */

async function loadProducts(
    category = "",
    subCategory = ""
) {

    const container =
        $("#productList");


    if (!container) {

        return;

    }


    const loading =
        $("#productsLoading");


    if (loading) {

        loading.style.display =
            "block";

    }


    try {

        await ensureProductsLoaded();


        const searchInput =
            $("#searchProduct");


        const sortSelect =
            $("#sortProducts");


        const searchTerm =
            searchInput?.value ||
            "";


        const sortValue =
            sortSelect?.value ||
            "default";


        let filtered =
            filterProducts(
                products,
                category,
                subCategory,
                searchTerm
            );


        filtered =
            sortProducts(
                filtered,
                sortValue
            );


        renderProductList(
            filtered,
            container
        );


        updateProductResultCount(
            filtered.length
        );

    }
    catch (error) {

        console.error(
            "Load Products Error:",
            error
        );


        container.innerHTML = `

            <div
                class="card"
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:35px 20px;
                "
            >

                ❌ পণ্য লোড করা যায়নি।
                <br>
                অনুগ্রহ করে আবার চেষ্টা করুন।

            </div>

        `;

    }
    finally {

        if (loading) {

            loading.style.display =
                "none";

        }

    }

}


/* ==========================================================
   PRODUCT RESULT COUNT
========================================================== */

function updateProductResultCount(
    count
) {

    const element =
        $("#productResultCount");


    if (!element) {

        return;

    }


    element.textContent =
        `${Number(count) || 0} টি পণ্য পাওয়া গেছে`;

}


/* ==========================================================
   SEARCH INITIALIZATION
========================================================== */

function initSearch() {

    const input =
        $("#searchProduct");


    if (
        !input ||
        input.dataset.bound
    ) {

        return;

    }


    input.dataset.bound =
        "true";


    let timer =
        null;


    input.addEventListener(
        "input",
        () => {

            clearTimeout(
                timer
            );


            timer =
                setTimeout(
                    () => {

                        loadProducts(
                            getActiveCategory(),
                            getActiveSubCategory()
                        );

                    },
                    250
                );

        }
    );

}


/* ==========================================================
   SORT INITIALIZATION
========================================================== */

function initSort() {

    const select =
        $("#sortProducts");


    if (
        !select ||
        select.dataset.bound
    ) {

        return;

    }


    select.dataset.bound =
        "true";


    select.addEventListener(
        "change",
        () => {

            loadProducts(
                getActiveCategory(),
                getActiveSubCategory()
            );

        }
    );

}


/* ==========================================================
   PART 4 COMPLETE
========================================================== */

console.log(
    "🛍️ Part 4/8 — Product Card, Search, Filter & Sort Loaded."
);

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL A-Z VERSION
   PART 5/8

   CATEGORY SYSTEM
   SUB-CATEGORY SYSTEM
   CATEGORY BUTTONS
   URL FILTER
   PRODUCT CARD SLIDER
========================================================== */


/* ==========================================================
   CATEGORY BUTTON CONTAINER
========================================================== */

function getCategoryButtonContainer() {

    return (
        $("#categoryButtons") ||
        $("#categories") ||
        $(".category-buttons")
    );

}


/* ==========================================================
   CREATE CATEGORY BUTTON
========================================================== */

function createCategoryButton(
    category,
    activeCategory = "",
    activeSubCategory = ""
) {

    if (!category) {

        return null;

    }


    const categoryId =
        normalizeCategory(
            category.id ||
            category.slug ||
            category.name
        );


    if (!categoryId) {

        return null;

    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "category-btn";


    button.dataset.category =
        categoryId;


    const isActive =
        normalizeCategory(
            activeCategory
        ) === categoryId &&
        !activeSubCategory;


    if (isActive) {

        button.classList.add(
            "active"
        );

    }


    button.textContent =
        category.name ||
        category.title ||
        "অন্যান্য";


    return button;

}


/* ==========================================================
   CREATE SUB-CATEGORY BUTTON
========================================================== */

function createSubCategoryButton(
    category,
    subCategory,
    activeCategory = "",
    activeSubCategory = ""
) {

    if (
        !category ||
        !subCategory
    ) {

        return null;

    }


    const categoryId =
        normalizeCategory(
            category.id ||
            category.slug ||
            category.name
        );


    const subCategoryId =
        normalizeCategory(
            subCategory.id ||
            subCategory.slug ||
            subCategory.name
        );


    if (
        !categoryId ||
        !subCategoryId
    ) {

        return null;

    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "subcategory-btn";


    button.dataset.category =
        categoryId;


    button.dataset.subcategory =
        subCategoryId;


    if (
        normalizeCategory(
            activeCategory
        ) === categoryId &&
        normalizeCategory(
            activeSubCategory
        ) === subCategoryId
    ) {

        button.classList.add(
            "active"
        );

    }


    button.textContent =
        subCategory.name ||
        subCategory.title ||
        "অন্যান্য";


    return button;

}


/* ==========================================================
   CATEGORY URL
========================================================== */

function updateCategoryURL(
    category = "",
    subCategory = ""
) {

    const url =
        new URL(
            window.location.href
        );


    const normalizedCategory =
        normalizeCategory(
            category
        );


    const normalizedSubCategory =
        normalizeCategory(
            subCategory
        );


    if (normalizedCategory) {

        url.searchParams.set(
            "category",
            normalizedCategory
        );

    }
    else {

        url.searchParams.delete(
            "category"
        );

    }


    if (normalizedSubCategory) {

        url.searchParams.set(
            "subcategory",
            normalizedSubCategory
        );

    }
    else {

        url.searchParams.delete(
            "subcategory"
        );

    }


    /*
       Product ID থাকলে সেটি পরিবর্তন হবে না।
    */

    window.history.replaceState(
        {},
        "",
        url.toString()
    );

}


/* ==========================================================
   SET ACTIVE CATEGORY BUTTON
========================================================== */

function setActiveCategoryButton(
    category = "",
    subCategory = ""
) {

    const normalizedCategory =
        normalizeCategory(
            category
        );


    const normalizedSubCategory =
        normalizeCategory(
            subCategory
        );


    $$(".category-btn")
        .forEach(
            button => {

                const buttonCategory =
                    normalizeCategory(
                        button.dataset.category
                    );


                button.classList.toggle(
                    "active",
                    Boolean(
                        normalizedCategory &&
                        buttonCategory ===
                        normalizedCategory &&
                        !normalizedSubCategory
                    )
                );

            }
        );


    /*
       সকল পণ্য Button
    */

    $$(".category-btn")
        .forEach(
            button => {

                if (
                    !normalizedCategory &&
                    !normalizedSubCategory &&
                    !button.dataset.category
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


    $$(".subcategory-btn")
        .forEach(
            button => {

                const buttonCategory =
                    normalizeCategory(
                        button.dataset.category
                    );


                const buttonSubCategory =
                    normalizeCategory(
                        button.dataset.subcategory
                    );


                button.classList.toggle(
                    "active",
                    Boolean(
                        normalizedCategory &&
                        normalizedSubCategory &&
                        buttonCategory ===
                        normalizedCategory &&
                        buttonSubCategory ===
                        normalizedSubCategory
                    )
                );

            }
        );

}


/* ==========================================================
   SHOW SUB-CATEGORIES
========================================================== */

function renderSubCategories(
    categoryId,
    activeSubCategory = ""
) {

    const container =
        $("#subCategoryButtons") ||
        $("#subcategoryButtons");


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const normalizedCategory =
        normalizeCategory(
            categoryId
        );


    const category =
        findCategory(
            normalizedCategory
        );


    if (
        !category ||
        !Array.isArray(
            category.subCategories
        ) ||
        !category.subCategories.length
    ) {

        container.style.display =
            "none";


        return;

    }


    container.style.display =
        "flex";


    category.subCategories
        .forEach(
            subCategory => {

                const button =
                    createSubCategoryButton(
                        category,
                        subCategory,
                        normalizedCategory,
                        activeSubCategory
                    );


                if (!button) {

                    return;

                }


                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        const subId =
                            normalizeCategory(
                                button.dataset.subcategory
                            );


                        setActiveCategoryButton(
                            normalizedCategory,
                            subId
                        );


                        updateCategoryURL(
                            normalizedCategory,
                            subId
                        );


                        renderSubCategories(
                            normalizedCategory,
                            subId
                        );


                        loadProducts(
                            normalizedCategory,
                            subId
                        );

                    }
                );


                container.appendChild(
                    button
                );

            }
        );

}


/* ==========================================================
   RENDER CATEGORY BUTTONS
========================================================== */

async function renderCategoryButtons() {

    const container =
        getCategoryButtonContainer();


    if (!container) {

        return;

    }


    try {

        await ensureCategoriesLoaded();


        /*
           categories.json না থাকলে
           products থেকে category তৈরি
        */

        if (
            !categories.length &&
            Array.isArray(products) &&
            products.length
        ) {

            buildCategoriesFromProducts();

        }


        const activeCategory =
            getActiveCategory();


        const activeSubCategory =
            getActiveSubCategory();


        container.innerHTML =
            "";


        /* ==========================================
           ALL PRODUCTS BUTTON
        ========================================== */

        const allButton =
            document.createElement(
                "button"
            );


        allButton.type =
            "button";


        allButton.className =
            "category-btn";


        allButton.dataset.category =
            "";


        allButton.textContent =
            "🛍️ সকল পণ্য";


        if (
            !activeCategory &&
            !activeSubCategory
        ) {

            allButton.classList.add(
                "active"
            );

        }


        allButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                setActiveCategoryButton(
                    "",
                    ""
                );


                updateCategoryURL(
                    "",
                    ""
                );


                renderSubCategories(
                    ""
                );


                loadProducts(
                    "",
                    ""
                );

            }
        );


        container.appendChild(
            allButton
        );


        /* ==========================================
           CATEGORY LIST
        ========================================== */

        categories.forEach(
            category => {

                const button =
                    createCategoryButton(
                        category,
                        activeCategory,
                        activeSubCategory
                    );


                if (!button) {

                    return;

                }


                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        const categoryId =
                            normalizeCategory(
                                button.dataset.category
                            );


                        setActiveCategoryButton(
                            categoryId,
                            ""
                        );


                        updateCategoryURL(
                            categoryId,
                            ""
                        );


                        renderSubCategories(
                            categoryId,
                            ""
                        );


                        loadProducts(
                            categoryId,
                            ""
                        );

                    }
                );


                container.appendChild(
                    button
                );

            }
        );


        /* ==========================================
           SUB CATEGORY
        ========================================== */

        if (
            activeCategory
        ) {

            renderSubCategories(
                activeCategory,
                activeSubCategory
            );

        }
        else {

            renderSubCategories(
                ""
            );

        }

    }
    catch (error) {

        console.error(
            "Category Render Error:",
            error
        );

    }

}


/* ==========================================================
   CATEGORY FROM PRODUCT DATA
========================================================== */

function buildCategoriesFromProducts() {

    if (
        !Array.isArray(products) ||
        !products.length
    ) {

        return;

    }


    /*
       Existing categories থাকলে
       নতুন করে overwrite করবো না।
    */

    if (
        Array.isArray(categories) &&
        categories.length
    ) {

        return;

    }


    const map =
        new Map();


    products.forEach(
        product => {

            if (!product) {

                return;

            }


            const id =
                normalizeCategory(
                    product.category
                );


            if (!id) {

                return;

            }


            if (
                !map.has(id)
            ) {

                map.set(
                    id,
                    {
                        id,
                        name:
                            product.categoryName ||
                            product.category ||
                            "অন্যান্য",
                        subCategories:[]
                    }
                );

            }


            const category =
                map.get(id);


            const subId =
                normalizeCategory(
                    product.subCategory
                );


            if (
                subId &&
                !category.subCategories.some(
                    item =>
                        normalizeCategory(
                            item.id
                        ) === subId
                )
            ) {

                category.subCategories.push({

                    id:
                        subId,

                    name:
                        product.subCategoryName ||
                        product.subCategory ||
                        "অন্যান্য"

                });

            }

        }
    );


    categories =
        Array.from(
            map.values()
        );

}


/* ==========================================================
   CATEGORY FALLBACK
========================================================== */

async function ensureCategorySystem() {

    await ensureProductsLoaded();


    /*
       categories.json load করার চেষ্টা থাকবে।
    */

    try {

        await ensureCategoriesLoaded();

    }
    catch (error) {

        console.warn(
            "Categories Load Warning:",
            error
        );

    }


    /*
       categories.json না থাকলে
       products.json থেকে category তৈরি হবে।
    */

    if (
        !Array.isArray(categories) ||
        !categories.length
    ) {

        buildCategoriesFromProducts();

    }

}


/* ==========================================================
   CATEGORY INITIALIZATION
========================================================== */

async function initCategorySystem() {

    try {

        await ensureCategorySystem();


        await renderCategoryButtons();

    }
    catch (error) {

        console.error(
            "Category System Error:",
            error
        );

    }

}


/* ==========================================================
   PRODUCT CARD SLIDER — STOP
========================================================== */

function stopSliders() {

    if (
        !Array.isArray(sliderTimers)
    ) {

        sliderTimers =
            [];

        return;

    }


    sliderTimers.forEach(
        timer => {

            clearInterval(
                timer
            );

        }
    );


    sliderTimers =
        [];

}


/* ==========================================================
   PRODUCT CARD SLIDER — START
========================================================== */

function startSliders() {

    stopSliders();


    const sliders =
        $$(".slider");


    sliders.forEach(
        slider => {

            const images =
                slider.querySelectorAll(
                    ".product-img"
                );


            if (
                images.length <= 1
            ) {

                return;

            }


            let index = 0;


            const showNext =
                () => {

                    if (
                        slider.dataset.paused ===
                        "true"
                    ) {

                        return;

                    }


                    images[index]
                        ?.classList.remove(
                            "active"
                        );


                    index =
                        (
                            index + 1
                        ) %
                        images.length;


                    images[index]
                        ?.classList.add(
                            "active"
                        );

                };


            const timer =
                setInterval(
                    showNext,
                    3000
                );


            sliderTimers.push(
                timer
            );


            /* ==================================
               PAUSE ON HOVER
            ================================== */

            if (
                !slider.dataset.hoverBound
            ) {

                slider.dataset.hoverBound =
                    "true";


                slider.addEventListener(
                    "mouseenter",
                    () => {

                        slider.dataset.paused =
                            "true";

                    }
                );


                slider.addEventListener(
                    "mouseleave",
                    () => {

                        slider.dataset.paused =
                            "false";

                    }
                );

            }

        }
    );

}


/* ==========================================================
   SLIDER VISIBILITY PATCH
========================================================== */

function refreshSliders() {

    stopSliders();


    requestAnimationFrame(
        () => {

            startSliders();

        }
    );

}


/* ==========================================================
   PRODUCT IMAGE MODAL CLICK
========================================================== */

document.addEventListener(
    "click",
    event => {

        const image =
            event.target.closest(
                ".product-card .product-img"
            );


        if (
            !image ||
            !image.src
        ) {

            return;

        }


        /*
           broken image হলে modal খুলবে না
        */

        if (
            image.classList.contains(
                "image-load-error"
            )
        ) {

            return;

        }


        event.preventDefault();


        openImageModal(
            image.src
        );

    }
);


/* ==========================================================
   PRODUCT CARD LINK PROTECTION
========================================================== */

document.addEventListener(
    "click",
    event => {

        const link =
            event.target.closest(
                ".product-card a"
            );


        if (!link) {

            return;

        }


        /*
           Wishlist / WhatsApp button
           product page-এ redirect করবে না।
        */

        if (
            event.target.closest(
                ".wishlist-btn"
            ) ||
            event.target.closest(
                ".product-whatsapp-btn"
            )
        ) {

            event.preventDefault();

            event.stopPropagation();

        }

    }
);


/* ==========================================================
   BROWSER BACK / FORWARD
========================================================== */

window.addEventListener(
    "popstate",
    async () => {

        const category =
            getActiveCategory();


        const subCategory =
            getActiveSubCategory();


        setActiveCategoryButton(
            category,
            subCategory
        );


        if (
            category
        ) {

            renderSubCategories(
                category,
                subCategory
            );

        }
        else {

            renderSubCategories(
                ""
            );

        }


        if (
            $("#productList")
        ) {

            await loadProducts(
                category,
                subCategory
            );

        }

    }
);


/* ==========================================================
   PART 5 COMPLETE
========================================================== */

console.log(
    "📂 Part 5/8 — Category & Product Slider System Loaded."
);

