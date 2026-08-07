"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL A-Z VERSION
   PART 1/8
========================================================== */


/* ==========================================================
   GLOBAL STATE
========================================================== */

let products = [];
let categories = [];
let wishlist = [];

let currentProduct = null;

let detailSliderIndex = 0;

let sliderTimers = [];


/* ==========================================================
   SHORTCUTS
========================================================== */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    document.querySelectorAll(selector);


/* ==========================================================
   SITE CONFIG
========================================================== */

const SITE_CONFIG = {

    companyName:
        "Maliha Agro Industry",

    whatsapp:
        "8801303679189",

    productsURL:
        "data/products.json",

    categoriesURL:
        "data/categories.json"

};


/* ==========================================================
   IMAGE PATH
========================================================== */

function imagePath(path) {

    if (!path) {
        return "";
    }

    let src =
        String(path)
            .trim()
            .replace(/\\/g, "/");


    /* External image */

    if (
        /^https?:\/\//i.test(src) ||
        src.startsWith("data:")
    ) {

        return src;

    }


    /* Remove unnecessary relative paths */

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


    /* Root images path */

    if (
        src.startsWith("/images/")
    ) {

        return src.substring(1);

    }


    /* Already correct */

    if (
        src.startsWith("images/")
    ) {

        return src;

    }


    /* Filename only */

    if (
        !src.includes("/")
    ) {

        return "images/" + src;

    }


    return src;

}


/* ==========================================================
   PRICE FORMAT
========================================================== */

function formatPrice(price) {

    const amount =
        Number(price || 0);

    return (
        "৳" +
        amount.toLocaleString("en-BD")
    );

}


/* ==========================================================
   CATEGORY NORMALIZE
========================================================== */

function normalizeCategory(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

}


/* ==========================================================
   PRODUCT NORMALIZE
========================================================== */

function normalizeProduct(product) {

    if (
        !product ||
        typeof product !== "object"
    ) {

        return null;

    }


    return {

        ...product,

        id:
            Number(product.id),

        category:
            normalizeCategory(
                product.category
            ),

        subCategory:
            normalizeCategory(
                product.subCategory ||
                product.subcategory ||
                ""
            ),

        price:
            Number(
                product.price || 0
            ),

        oldPrice:
            Number(
                product.oldPrice || 0
            ),

        rating:
            Number(
                product.rating || 0
            ),

        reviewCount:
            Number(
                product.reviewCount || 0
            ),

        newArrival:
            Boolean(
                product.newArrival
            ),

        bestSeller:
            Boolean(
                product.bestSeller
            ),

        offer:
            Boolean(
                product.offer
            )

    };

}


/* ==========================================================
   LOAD PRODUCTS
========================================================== */

async function fetchProducts() {

    const response =
        await fetch(
            SITE_CONFIG.productsURL,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            "products.json load failed: " +
            response.status
        );

    }


    const data =
        await response.json();


    if (
        !Array.isArray(data)
    ) {

        throw new Error(
            "products.json অবশ্যই Array হতে হবে।"
        );

    }


    products =
        data
            .map(normalizeProduct)
            .filter(
                product =>
                    product &&
                    Number.isFinite(
                        product.id
                    )
            );


    return products;

}


/* ==========================================================
   LOAD CATEGORIES
========================================================== */

async function fetchCategories() {

    try {

        const response =
            await fetch(
                SITE_CONFIG.categoriesURL,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            return [];

        }


        const data =
            await response.json();


        categories =
            Array.isArray(data)
                ? data.filter(Boolean)
                : [];


        return categories;

    }
    catch (error) {

        console.warn(
            "Categories could not be loaded:",
            error
        );


        categories = [];

        return [];

    }

}


/* ==========================================================
   ENSURE DATA
========================================================== */

async function ensureProductsLoaded() {

    if (
        products.length
    ) {

        return products;

    }


    return await fetchProducts();

}


async function ensureCategoriesLoaded() {

    if (
        categories.length
    ) {

        return categories;

    }


    return await fetchCategories();

}


/* ==========================================================
   WISHLIST STORAGE
========================================================== */

function loadWishlistStorage() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "wishlist"
                ) || "[]"
            );


        wishlist =
            Array.isArray(saved)
                ? saved
                    .map(Number)
                    .filter(
                        Number.isFinite
                    )
                : [];

    }
    catch {

        wishlist = [];

    }

}


/* ==========================================================
   SAVE WISHLIST
========================================================== */

function saveWishlistStorage() {

    try {

        localStorage.setItem(
            "wishlist",
            JSON.stringify(
                wishlist
            )
        );

    }
    catch (error) {

        console.error(
            "Wishlist Save Error:",
            error
        );

    }

}


/* ==========================================================
   WISHLIST COUNTER
========================================================== */

function updateWishlistCounter() {

    const counter =
        $("#wishlistCounter");


    if (!counter) {

        return;

    }


    counter.textContent =
        wishlist.length
            ? `Wishlist (${wishlist.length})`
            : "Wishlist";

}


/* ==========================================================
   WISHLIST BUTTON
========================================================== */

function updateWishlistButton(
    button,
    id
) {

    if (!button) {

        return;

    }


    const active =
        wishlist.includes(
            Number(id)
        );


    button.textContent =
        active
            ? "❤️"
            : "🤍";


    button.classList.toggle(
        "active",
        active
    );

}


/* ==========================================================
   TOGGLE WISHLIST
========================================================== */

function toggleWishlist(id) {

    id =
        Number(id);


    if (
        !Number.isFinite(id)
    ) {

        return;

    }


    const index =
        wishlist.indexOf(id);


    if (
        index === -1
    ) {

        wishlist.push(id);

    }
    else {

        wishlist.splice(
            index,
            1
        );

    }


    saveWishlistStorage();

    updateWishlistCounter();


    $$(".wishlist-btn")
        .forEach(
            button => {

                updateWishlistButton(
                    button,
                    button.dataset.id
                );

            }
        );


    if (
        $("#wishlistProducts")
    ) {

        renderWishlistPage();

    }

}


/* ==========================================================
   PRODUCT GALLERY DATA
========================================================== */

function getGallery(product) {

    if (!product) {

        return [];

    }


    let gallery = [];


    if (product.image) {

        gallery.push(
            product.image
        );

    }


    if (product.imageUrl) {

        gallery.push(
            product.imageUrl
        );

    }


    if (
        Array.isArray(
            product.images
        )
    ) {

        gallery.push(
            ...product.images
        );

    }


    if (
        Array.isArray(
            product.gallery
        )
    ) {

        gallery.push(
            ...product.gallery
        );

    }


    return [
        ...new Set(
            gallery
                .map(imagePath)
                .filter(Boolean)
        )
    ];

}


/* ==========================================================
   FIND CATEGORY
========================================================== */

function findCategory(id) {

    const target =
        normalizeCategory(id);


    return categories.find(
        category =>
            normalizeCategory(
                category.id
            ) === target
    ) || null;

}


/* ==========================================================
   CATEGORY NAME
========================================================== */

function getCategoryName(id) {

    const category =
        findCategory(id);


    if (
        category &&
        category.name
    ) {

        return category.name;

    }


    const product =
        products.find(
            item =>
                normalizeCategory(
                    item.category
                ) ===
                normalizeCategory(id)
        );


    return (
        product?.categoryName ||
        id ||
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
        findCategory(
            categoryId
        );


    if (
        category &&
        Array.isArray(
            category.subCategories
        )
    ) {

        const sub =
            category.subCategories.find(
                item =>
                    normalizeCategory(
                        item.id
                    ) ===
                    normalizeCategory(
                        subCategoryId
                    )
            );


        if (
            sub &&
            sub.name
        ) {

            return sub.name;

        }

    }


    const product =
        products.find(
            item =>
                normalizeCategory(
                    item.category
                ) ===
                normalizeCategory(
                    categoryId
                ) &&
                normalizeCategory(
                    item.subCategory
                ) ===
                normalizeCategory(
                    subCategoryId
                )
        );


    return (
        product?.subCategoryName ||
        subCategoryId ||
        "অন্যান্য"
    );

}


/* ==========================================================
   PRODUCT ID FROM URL
========================================================== */

function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const raw =
        params.get("id");


    if (!raw) {

        return null;

    }


    const id =
        Number(raw);


    return Number.isFinite(id)
        ? id
        : null;

}

/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================================
   PRODUCT NOT FOUND
========================================================== */

function showProductNotFound(
    container,
    message
) {

    if (!container) {
        return;
    }

    container.innerHTML = `

        <div
            class="card"
            style="
                text-align:center;
                padding:45px 20px;
                margin:30px 0;
            "
        >

            <div
                style="
                    font-size:55px;
                    margin-bottom:12px;
                "
            >
                🔍
            </div>

            <h2>
                পণ্য পাওয়া যায়নি
            </h2>

            <p
                style="
                    color:#777;
                    margin-top:7px;
                "
            >
                ${escapeHTML(
                    message ||
                    "এই পণ্যটি বর্তমানে পাওয়া যাচ্ছে না।"
                )}
            </p>

            <a
                href="products.html"
                class="btn"
                style="
                    display:inline-flex;
                    width:auto;
                    margin-top:15px;
                "
            >
                🛍️ সকল পণ্য দেখুন
            </a>

        </div>

    `;

}


/* ==========================================================
   PRODUCT ERROR
========================================================== */

function showProductError(
    container,
    error
) {

    if (!container) {
        return;
    }

    console.error(
        "Product Error:",
        error
    );

    container.innerHTML = `

        <div
            class="card"
            style="
                text-align:center;
                padding:40px 20px;
                margin:30px 0;
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
                পণ্যের তথ্য লোড করা যায়নি
            </h2>

            <p
                style="
                    color:#777;
                    margin:8px 0;
                    line-height:1.7;
                "
            >
                পণ্যের তথ্য বর্তমানে লোড করা সম্ভব হচ্ছে না।
                <br>
                অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
            </p>

            <button
                type="button"
                class="btn"
                id="reloadProductPage"
                style="
                    border:0;
                    max-width:200px;
                    margin:15px auto 0;
                    cursor:pointer;
                "
            >
                🔄 আবার চেষ্টা করুন
            </button>

        </div>

    `;


    $("#reloadProductPage")
        ?.addEventListener(
            "click",
            () => {
                window.location.reload();
            }
        );

}


/* ==========================================================
   LOAD PRODUCT DETAILS
========================================================== */

async function loadProductDetails() {

    const loading =
        $("#productLoading");

    const details =
        $("#productDetails");


    if (!details) {

        return;

    }


    try {

        /* ------------------------------------------
           PRODUCT ID
        ------------------------------------------ */

        const productId =
            getProductId();


        if (
            !Number.isFinite(
                productId
            ) ||
            productId <= 0
        ) {

            if (loading) {

                loading.style.display =
                    "none";

            }


            showProductNotFound(
                details,
                "সঠিক Product ID পাওয়া যায়নি।"
            );

            return;

        }


        /* ------------------------------------------
           LOAD PRODUCTS
        ------------------------------------------ */

        await ensureProductsLoaded();


        /* ------------------------------------------
           FIND PRODUCT
        ------------------------------------------ */

        currentProduct =
            products.find(
                product =>
                    Number(
                        product.id
                    ) ===
                    Number(
                        productId
                    )
            );


        if (!currentProduct) {

            if (loading) {

                loading.style.display =
                    "none";

            }


            showProductNotFound(
                details,
                "এই পণ্যটি পাওয়া যায়নি।"
            );

            return;

        }


        /* ------------------------------------------
           RENDER PRODUCT
        ------------------------------------------ */

        renderCompleteProductDetails(
            details,
            currentProduct
        );


        /* ------------------------------------------
           LOADING HIDE
        ------------------------------------------ */

        if (loading) {

            loading.style.display =
                "none";

        }


        /* ------------------------------------------
           DETAILS SHOW
        ------------------------------------------ */

        details.style.display =
            "block";


        console.log(
            "✅ Product Details Loaded:",
            currentProduct
        );

    }
    catch (error) {

        console.error(
            "❌ Product Details Error:",
            error
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        showProductError(
            details,
            error
        );

    }

}


/* ==========================================================
   PRODUCT DETAILS RENDER
========================================================== */

function renderCompleteProductDetails(
    container,
    product
) {

    if (
        !container ||
        !product
    ) {

        return;

    }


    const gallery =
        getGallery(product);


    const price =
        Number(
            product.price || 0
        );


    const oldPrice =
        Number(
            product.oldPrice || 0
        );


    /* ------------------------------------------
       DISCOUNT
    ------------------------------------------ */

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
                        product.rating || 0
                    )
                )
            )
        );


    /* ------------------------------------------
       CATEGORY
    ------------------------------------------ */

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


    /* ------------------------------------------
       RENDER
    ------------------------------------------ */

    container.innerHTML = `

        <div
            class="product-details"
            style="
                padding:15px 0 35px;
            "
        >

            <!-- BACK BUTTON -->

            <div
                style="
                    margin-bottom:15px;
                "
            >

                <a
                    href="products.html"
                    class="btn"
                    style="
                        display:inline-flex;
                        width:auto;
                        padding:8px 14px;
                        margin:0;
                    "
                >
                    ← সকল পণ্যে ফিরে যান
                </a>

            </div>


            <!-- PRODUCT LAYOUT -->

            <div
                class="product-details-layout"
            >


                <!-- =================================
                     GALLERY
                ================================= -->

                <div
                    class="product-gallery"
                    style="
                        position:relative;
                    "
                >

                    <div
                        id="productSlider"
                    >

                        ${
                            gallery.length
                            ?

                            gallery
                                .map(
                                    (
                                        src,
                                        index
                                    ) => `

                                        <img
                                            src="${escapeHTML(src)}"
                                            class="product-img ${
                                                index === 0
                                                    ? "active"
                                                    : ""
                                            }"
                                            alt="${escapeHTML(
                                                product.name ||
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
                                    style="
                                        width:100%;
                                        min-height:320px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        flex-direction:column;
                                        background:#f5f8f5;
                                        border-radius:15px;
                                        color:#1F8F4D;
                                    "
                                >

                                    <div
                                        style="
                                            font-size:60px;
                                        "
                                    >
                                        🌱
                                    </div>

                                    <p>
                                        পণ্যের ছবি পাওয়া যায়নি।
                                    </p>

                                </div>

                            `
                        }

                    </div>


                    ${
                        gallery.length > 1
                        ?

                        `

                            <button
                                type="button"
                                id="prevImage"
                                class="gallery-control"
                                aria-label="Previous image"
                                style="
                                    left:10px;
                                "
                            >
                                ❮
                            </button>


                            <button
                                type="button"
                                id="nextImage"
                                class="gallery-control"
                                aria-label="Next image"
                                style="
                                    right:10px;
                                "
                            >
                                ❯
                            </button>


                            <div
                                id="sliderCounter"
                                style="
                                    position:absolute;
                                    left:50%;
                                    bottom:10px;
                                    transform:translateX(-50%);
                                    z-index:5;
                                    background:rgba(0,0,0,.55);
                                    color:#fff;
                                    padding:4px 10px;
                                    border-radius:20px;
                                    font-size:12px;
                                "
                            >
                                1 / ${gallery.length}
                            </div>

                        `

                        :

                        ""

                    }

                </div>


                <!-- =================================
                     PRODUCT INFO
                ================================= -->

                <div
                    class="product-info"
                >


                    ${
                        product.offer
                        ?

                        `

                            <span
                                style="
                                    display:inline-block;
                                    background:#e53935;
                                    color:#fff;
                                    padding:5px 10px;
                                    border-radius:7px;
                                    font-size:11px;
                                    font-weight:700;
                                    margin-bottom:8px;
                                "
                            >
                                🔥 অফার
                            </span>

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
                            margin-bottom:5px;
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

                                → ${escapeHTML(
                                    subCategoryName
                                )}

                            `

                            :

                            ""

                        }

                    </div>


                    <!-- PRODUCT NAME -->

                    <h1>
                        ${escapeHTML(
                            product.name ||
                            "পণ্য"
                        )}
                    </h1>


                    <!-- BRAND -->

                    <p
                        style="
                            color:#666;
                            margin-bottom:8px;
                        "
                    >

                        প্রস্তুতকারক:

                        <strong>
                            ${escapeHTML(
                                product.brand ||
                                SITE_CONFIG.companyName
                            )}
                        </strong>

                    </p>


                    <!-- RATING -->

                    <div
                        style="
                            color:#e5a000;
                            margin:7px 0;
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
                                font-size:13px;
                            "
                        >

                            (${Number(
                                product.reviewCount ||
                                0
                            )} Reviews)

                        </span>

                    </div>


                    <!-- PRICE -->

                    <div
                        style="
                            margin:10px 0;
                        "
                    >

                        <span
                            style="
                                color:#1F8F4D;
                                font-size:30px;
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
                                        text-decoration:line-through;
                                        margin-left:8px;
                                    "
                                >
                                    ${formatPrice(
                                        oldPrice
                                    )}
                                </span>


                                <span
                                    style="
                                        display:inline-block;
                                        background:#e53935;
                                        color:white;
                                        padding:3px 7px;
                                        border-radius:5px;
                                        font-size:11px;
                                        margin-left:6px;
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
                        style="
                            color:#198754;
                            background:#eef9f1;
                            display:inline-block;
                            padding:5px 9px;
                            border-radius:7px;
                            font-size:13px;
                            margin-bottom:12px;
                        "
                    >

                        🟢 ${escapeHTML(
                            product.stock ||
                            "স্টকে আছে"
                        )}

                    </div>


                    <!-- DESCRIPTION -->

                    <p
                        style="
                            color:#555;
                            margin:8px 0 15px;
                            line-height:1.7;
                        "
                    >

                        ${escapeHTML(
                            product.description ||
                            product.shortDescription ||
                            "এই পণ্যের বিস্তারিত তথ্য বর্তমানে পাওয়া যাচ্ছে না।"
                        )}

                    </p>


                    <!-- BASIC INFORMATION -->

                    <div
                        style="
                            border-top:1px solid #eee;
                            border-bottom:1px solid #eee;
                            padding:12px 0;
                            margin-bottom:15px;
                        "
                    >

                        <p>
                            <strong>
                                📂 ক্যাটাগরি:
                            </strong>

                            ${escapeHTML(
                                categoryName ||
                                "-"
                            )}
                        </p>


                        <p>
                            <strong>
                                📁 সাব-ক্যাটাগরি:
                            </strong>

                            ${escapeHTML(
                                subCategoryName ||
                                "-"
                            )}
                        </p>


                        <p>
                            <strong>
                                🏷️ ধরন:
                            </strong>

                            ${escapeHTML(
                                product.type ||
                                "-"
                            )}
                        </p>


                        <p>
                            <strong>
                                🔖 SKU:
                            </strong>

                            ${escapeHTML(
                                product.sku ||
                                "-"
                            )}
                        </p>


                        <p>
                            <strong>
                                ⚖️ ওজন:
                            </strong>

                            ${escapeHTML(
                                product.weight ||
                                "-"
                            )}
                        </p>

                    </div>


                    <!-- FEATURES -->

                    ${
                        Array.isArray(
                            product.features
                        ) &&
                        product.features.length

                        ?

                        `

                            <div
                                style="
                                    margin-bottom:15px;
                                "
                            >

                                <h3
                                    style="
                                        color:#1F8F4D;
                                        margin-bottom:8px;
                                    "
                                >
                                    ✅ পণ্যের বৈশিষ্ট্য
                                </h3>


                                <ul
                                    style="
                                        padding-left:20px;
                                    "
                                >

                                    ${
                                        product.features
                                            .map(
                                                feature =>
                                                    `

                                                        <li
                                                            style="
                                                                margin-bottom:5px;
                                                            "
                                                        >
                                                            ${escapeHTML(
                                                                feature
                                                            )}
                                                        </li>

                                                    `
                                            )
                                            .join("")
                                    }

                                </ul>

                            </div>

                        `

                        :

                        ""

                    }


                    <!-- QUANTITY -->

                    <div
                        style="
                            margin-top:12px;
                        "
                    >

                        <strong>
                            পরিমাণ:
                        </strong>


                        <div
                            style="
                                display:flex;
                                align-items:center;
                                width:max-content;
                                border:1px solid #ddd;
                                border-radius:9px;
                                overflow:hidden;
                                margin-top:7px;
                            "
                        >

                            <button
                                type="button"
                                id="minusQty"
                                style="
                                    width:40px;
                                    height:40px;
                                    border:0;
                                    background:#f1f4f2;
                                    cursor:pointer;
                                    font-size:18px;
                                "
                            >
                                −
                            </button>


                            <input
                                id="qty"
                                type="number"
                                min="1"
                                value="1"
                                inputmode="numeric"
                                style="
                                    width:55px;
                                    height:40px;
                                    border:0;
                                    outline:0;
                                    text-align:center;
                                "
                            >


                            <button
                                type="button"
                                id="plusQty"
                                style="
                                    width:40px;
                                    height:40px;
                                    border:0;
                                    background:#f1f4f2;
                                    cursor:pointer;
                                    font-size:18px;
                                "
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <!-- TOTAL PRICE -->

                    <p
                        style="
                            margin-top:12px;
                            font-weight:700;
                        "
                    >

                        মোট মূল্য:

                        <span
                            id="totalPrice"
                            style="
                                color:#1F8F4D;
                                font-size:20px;
                            "
                        >
                            ${formatPrice(
                                price
                            )}
                        </span>

                    </p>


                    <!-- WHATSAPP ORDER -->

                    <a
                        id="orderNow"
                        href="#"
                        class="btn"
                        style="
                            margin-top:12px;
                        "
                    >

                        <i
                            class="fa-brands fa-whatsapp"
                            style="
                                margin-right:7px;
                            "
                        ></i>

                        WhatsApp-এ অর্ডার করুন

                    </a>


                    <!-- SHARE -->

                    <button
                        type="button"
                        id="shareProduct"
                        class="btn"
                        style="
                            background:#555;
                            margin-top:8px;
                        "
                    >
                        🔗 পণ্য শেয়ার করুন
                    </button>


                    <!-- WISHLIST -->

                    <button
                        type="button"
                        id="detailWishlist"
                        class="btn"
                        style="
                            background:#fff;
                            color:#1F8F4D;
                            border:1px solid #1F8F4D;
                            margin-top:8px;
                        "
                    >
                        🤍 Wishlist-এ রাখুন
                    </button>


                </div>

            </div>


            <!-- =================================
                 RELATED PRODUCTS
            ================================= -->

            <section
                style="
                    margin-top:30px;
                "
            >

                <h2
                    style="
                        color:#1F8F4D;
                        margin-bottom:12px;
                    "
                >
                    🛍️ সম্পর্কিত পণ্য
                </h2>


                <div
                    id="relatedProducts"
                    class="product-grid"
                ></div>

            </section>


        </div>

    `;

}

/* ==========================================================
   DETAIL GALLERY
========================================================== */

function initDetailGallery() {

    const slider =
        $("#productSlider");

    if (!slider) {
        return;
    }


    const images =
        slider.querySelectorAll(
            ".product-img"
        );


    if (!images.length) {
        return;
    }


    const previous =
        $("#prevImage");

    const next =
        $("#nextImage");

    const counter =
        $("#sliderCounter");


    function showImage(index) {

        if (
            index < 0
        ) {

            index =
                images.length - 1;

        }


        if (
            index >= images.length
        ) {

            index = 0;

        }


        images.forEach(
            image => {

                image.classList.remove(
                    "active"
                );

            }
        );


        images[index]
            ?.classList.add(
                "active"
            );


        detailSliderIndex =
            index;


        if (counter) {

            counter.textContent =
                `${index + 1} / ${images.length}`;

        }

    }


    detailSliderIndex = 0;


    if (previous) {

        previous.onclick =
            event => {

                event.preventDefault();

                showImage(
                    detailSliderIndex - 1
                );

            };

    }


    if (next) {

        next.onclick =
            event => {

                event.preventDefault();

                showImage(
                    detailSliderIndex + 1
                );

            };

    }


    images.forEach(
        image => {

            image.onclick =
                () => {

                    openImageModal(
                        image.src
                    );

                };


            image.onerror =
                function() {

                    this.style.display =
                        "none";

                };

        }
    );


    showImage(0);

}


/* ==========================================================
   QUANTITY SYSTEM
========================================================== */

function initQuantity() {

    const input =
        $("#qty");

    const plus =
        $("#plusQty");

    const minus =
        $("#minusQty");

    const total =
        $("#totalPrice");


    if (
        !input ||
        !currentProduct
    ) {

        return;

    }


    function updateQuantity() {

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


        input.value =
            quantity;


        const price =
            Number(
                currentProduct.price || 0
            );


        const totalPrice =
            price * quantity;


        if (total) {

            total.textContent =
                formatPrice(
                    totalPrice
                );

        }


        updateOrderLink(
            quantity
        );

    }


    if (
        plus &&
        !plus.dataset.bound
    ) {

        plus.dataset.bound =
            "true";


        plus.addEventListener(
            "click",
            () => {

                const current =
                    Number(
                        input.value
                    ) || 1;


                input.value =
                    current + 1;


                updateQuantity();

            }
        );

    }


    if (
        minus &&
        !minus.dataset.bound
    ) {

        minus.dataset.bound =
            "true";


        minus.addEventListener(
            "click",
            () => {

                const current =
                    Number(
                        input.value
                    ) || 1;


                if (
                    current > 1
                ) {

                    input.value =
                        current - 1;

                }


                updateQuantity();

            }
        );

    }


    if (
        !input.dataset.bound
    ) {

        input.dataset.bound =
            "true";


        input.addEventListener(
            "input",
            updateQuantity
        );

    }


    updateQuantity();

}


/* ==========================================================
   WHATSAPP ORDER LINK
========================================================== */

function updateOrderLink(
    quantity = 1
) {

    const button =
        $("#orderNow");


    if (
        !button ||
        !currentProduct
    ) {

        return;

    }


    quantity =
        Math.max(
            1,
            Number(quantity) || 1
        );


    const price =
        Number(
            currentProduct.price || 0
        );


    const total =
        price * quantity;


    const categoryName =
        currentProduct.categoryName ||
        getCategoryName(
            currentProduct.category
        );


    const subCategoryName =
        currentProduct.subCategoryName ||
        getSubCategoryName(
            currentProduct.category,
            currentProduct.subCategory
        );


    const productName =
        currentProduct.name ||
        "পণ্য";


    const sku =
        currentProduct.sku ||
        "-";


    const message =

`🌿 ${SITE_CONFIG.companyName}

আমি নিচের পণ্যটি অর্ডার করতে চাই।

━━━━━━━━━━━━━━━━━━

📦 পণ্যের নাম:
${productName}

📂 ক্যাটাগরি:
${categoryName || "-"}

📁 সাব-ক্যাটাগরি:
${subCategoryName || "-"}

🔖 SKU:
${sku}

💰 একক মূল্য:
${formatPrice(price)}

🔢 পরিমাণ:
${quantity}

💵 মোট মূল্য:
${formatPrice(total)}

━━━━━━━━━━━━━━━━━━

🔗 পণ্যের লিংক:
${window.location.href}

দয়া করে অর্ডারটি গ্রহণ করার জন্য যোগাযোগ করুন।`;


    button.href =
        "https://wa.me/" +
        SITE_CONFIG.whatsapp +
        "?text=" +
        encodeURIComponent(
            message
        );


    button.target =
        "_blank";


    button.rel =
        "noopener noreferrer";

}


/* ==========================================================
   ORDER BUTTON INITIALIZATION
========================================================== */

function initOrderButton() {

    const input =
        $("#qty");


    updateOrderLink(
        Number(
            input?.value || 1
        )
    );

}


/* ==========================================================
   PRODUCT SHARE
========================================================== */

function initShareProduct() {

    const button =
        $("#shareProduct");


    if (
        !button ||
        !currentProduct
    ) {

        return;

    }


    if (
        button.dataset.bound
    ) {

        return;

    }


    button.dataset.bound =
        "true";


    button.addEventListener(
        "click",
        async () => {

            const shareData = {

                title:
                    currentProduct.name ||
                    SITE_CONFIG.companyName,


                text:
                    currentProduct.shortDescription ||
                    currentProduct.description ||
                    "Maliha Agro Industry",


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

                }
                else if (
                    navigator.clipboard
                ) {

                    await navigator.clipboard.writeText(
                        window.location.href
                    );


                    alert(
                        "✅ পণ্যের লিংক কপি হয়েছে।"
                    );

                }
                else {

                    alert(
                        "🔗 এই লিংকটি শেয়ার করুন:\n\n" +
                        window.location.href
                    );

                }

            }
            catch (error) {

                console.log(
                    "Share cancelled:",
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
        !currentProduct
    ) {

        return;

    }


    if (
        button.dataset.bound
    ) {

        return;

    }


    button.dataset.bound =
        "true";


    function updateButton() {

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

    }


    button.addEventListener(
        "click",
        () => {

            toggleWishlist(
                currentProduct.id
            );


            updateButton();

        }
    );


    updateButton();

}

/* ==========================================================
   RELATED PRODUCTS
========================================================== */

function loadRelatedProducts() {

    const container =
        $("#relatedProducts");

    if (
        !container ||
        !currentProduct
    ) {
        return;
    }

    const currentCategory =
        normalizeCategory(
            currentProduct.category
        );

    let related =
        products.filter(
            product =>
                Number(product.id) !==
                    Number(currentProduct.id) &&
                normalizeCategory(
                    product.category
                ) === currentCategory
        );

    related =
        related.slice(0, 4);

    container.innerHTML = "";

    if (!related.length) {

        container.innerHTML = `
            <div
                class="card"
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:25px;
                "
            >
                এই ক্যাটাগরিতে বর্তমানে
                অন্য কোনো পণ্য নেই।
            </div>
        `;

        return;
    }

    related.forEach(product => {

        container.appendChild(
            createProductCard(product)
        );

    });

    startSliders();

}


/* ==========================================================
   WISHLIST PAGE
========================================================== */

async function renderWishlistPage() {

    const container =
        $("#wishlistProducts");

    if (!container) {
        return;
    }

    try {

        await ensureProductsLoaded();

        const items =
            products.filter(
                product =>
                    wishlist.includes(
                        Number(product.id)
                    )
            );

        const summary =
            $("#wishlistSummary");

        if (summary) {

            summary.textContent =
                `❤️ আপনার Wishlist-এ ${items.length} টি পণ্য আছে।`;

        }

        container.innerHTML = "";

        if (!items.length) {

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
                        "
                    >
                        🤍
                    </div>

                    <h2>
                        আপনার Wishlist খালি
                    </h2>

                    <p>
                        পছন্দের পণ্যের ❤️ বাটনে ক্লিক করলে
                        এখানে দেখা যাবে।
                    </p>

                    <a
                        href="products.html"
                        class="btn"
                        style="
                            max-width:200px;
                            margin:15px auto 0;
                        "
                    >
                        🛍️ পণ্য দেখুন
                    </a>

                </div>
            `;

            return;
        }

        items.forEach(product => {

            container.appendChild(
                createProductCard(product)
            );

        });

        startSliders();

    }
    catch (error) {

        console.error(
            "Wishlist Error:",
            error
        );

        container.innerHTML = `
            <div
                class="card"
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:30px;
                "
            >
                ❌ Wishlist লোড করা যায়নি।
            </div>
        `;

    }

}


/* ==========================================================
   IMAGE MODAL
========================================================== */

function openImageModal(src) {

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

    image.src = src;

    modal.style.display = "flex";

}


function closeImageModal() {

    const modal =
        $("#imageModal");

    const image =
        $("#modalImage");

    if (modal) {

        modal.style.display =
            "none";

    }

    if (image) {

        image.src = "";

    }

}


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
            closeImageModal
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
   PRODUCT CARD SLIDER
========================================================== */

function stopSliders() {

    sliderTimers.forEach(
        timer =>
            clearInterval(timer)
    );

    sliderTimers = [];

}


function startSliders() {

    stopSliders();

    $$(".slider").forEach(
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

            sliderTimers.push(timer);

        }
    );

}


/* ==========================================================
   GLOBAL CLICK HELPERS
========================================================== */

document.addEventListener(
    "click",
    event => {

        const image =
            event.target.closest(
                ".product-card .product-img"
            );

        if (
            image &&
            image.src
        ) {

            openImageModal(
                image.src
            );

        }

    }
);


/* ==========================================================
   INITIALIZE APP
========================================================== */

async function initializeApp() {

    try {

        loadWishlistStorage();

        updateWishlistCounter();


        /* ==============================================
           LOAD ALL DATA
        ============================================== */

        await Promise.allSettled([

            ensureProductsLoaded(),

            ensureCategoriesLoaded()

        ]);


        /* ==============================================
           PRODUCT DETAIL PAGE
        ============================================== */

        if (
            $("#productDetails")
        ) {

            await loadProductDetails();

        }


        /* ==============================================
           PRODUCTS PAGE
        ============================================== */

        if (
            $("#productList")
        ) {

            renderCategoryButtons();

            initSearch();

            initSort();

            await loadProducts(
                getActiveCategory(),
                getActiveSubCategory()
            );

        }


        /* ==============================================
           WISHLIST PAGE
        ============================================== */

        if (
            $("#wishlistProducts")
        ) {

            await renderWishlistPage();

        }


        /* ==============================================
           IMAGE PREVIEW
        ============================================== */

        initImagePreview();

        updateWishlistCounter();


        console.log(
            "✅ Maliha Agro Industry — App Initialized Successfully"
        );

    }
    catch (error) {

        console.error(
            "❌ App Initialization Error:",
            error
        );

    }

}


/* ==========================================================
   DOM READY
========================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

}
else {

    initializeApp();

}

/* ==========================================================
   FINAL SAFETY & GLOBAL UTILITIES
========================================================== */

/*
   Product ID দিয়ে সরাসরি Product Details page খুলতে
   চাইলে এই function ব্যবহার করা যাবে।
*/
function openProduct(productId) {

    const id =
        Number(productId);

    if (
        !Number.isFinite(id) ||
        id <= 0
    ) {
        return;
    }

    window.location.href =
        "product.html?id=" +
        encodeURIComponent(id);

}


/* ==========================================================
   PRODUCT SEARCH RESET
========================================================== */

function resetProductSearch() {

    const search =
        $("#searchProduct");

    if (search) {

        search.value = "";

    }

    const sort =
        $("#sortProducts");

    if (sort) {

        sort.value = "default";

    }

    loadProducts(
        getActiveCategory(),
        getActiveSubCategory()
    );

}


/* ==========================================================
   ESC KEY — CLOSE IMAGE MODAL
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
   PREVENT BROKEN IMAGE ICON
========================================================== */

document.addEventListener(
    "error",
    event => {

        const target =
            event.target;

        if (
            target &&
            target.tagName ===
            "IMG"
        ) {

            target.classList.add(
                "image-load-error"
            );

        }

    },
    true
);


/* ==========================================================
   FINAL GLOBAL STATE CHECK
========================================================== */

window.MalihaAgro =
    {

        config:
            SITE_CONFIG,

        getProducts:
            () =>
                products,

        getCategories:
            () =>
                categories,

        getWishlist:
            () =>
                wishlist,

        openProduct:

            productId =>
                openProduct(
                    productId
                ),

        resetSearch:
            () =>
                resetProductSearch()

    };


/* ==========================================================
   FINAL MESSAGE
========================================================== */

console.log(
    "🌱 Maliha Agro Industry"
);

console.log(
    "✅ script.js loaded successfully."
);

console.log(
    "📦 Products:",
    products.length
);

console.log(
    "📂 Categories:",
    categories.length
);

