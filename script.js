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
   BOOLEAN NORMALIZE
========================================================== */

function normalizeBoolean(value) {

    if (
        value === true ||
        value === 1
    ) {

        return true;

    }

    if (
        typeof value === "string"
    ) {

        return [
            "true",
            "1",
            "yes",
            "on"
        ].includes(
            value.trim().toLowerCase()
        );

    }

    return false;

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
            normalizeBoolean(
                product.newArrival
            ),

        bestSeller:
            normalizeBoolean(
                product.bestSeller
            ),

        offer:
            normalizeBoolean(
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
   PRODUCT DETAILS — FIXED
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
           HIDE LOADING
        ------------------------------------------ */

        if (loading) {

            loading.style.display =
                "none";

        }


        /* ------------------------------------------
           SHOW DETAILS
        ------------------------------------------ */

        details.style.display =
            "block";


        /* ------------------------------------------
           PRODUCT CONTROLS
        ------------------------------------------ */

        initProductDetailControls();


        /* ------------------------------------------
           RELATED PRODUCTS
        ------------------------------------------ */

        loadRelatedProducts();


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
   PART 1 END
========================================================== */

