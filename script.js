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

