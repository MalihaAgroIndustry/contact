"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL A-Z VERSION
   PART 1/8

   CORE CONFIG
   DOM HELPERS
   GLOBAL STATE
   BASIC UTILITIES
========================================================== */


/* ==========================================================
   SITE CONFIG
========================================================== */

const SITE_CONFIG = {

    name: "Maliha Agro Industry",

    shortName: "MAI",

    brandName: "মালিহা এগ্রো ইন্ডাস্ট্রি",

    productBrand: "মালিহা জৈব সার",

    office:
        "ইসলামপুর, কানসাট, শিবগঞ্জ, চাঁপাইনবাবগঞ্জ",

    phone:
        "01303 679189",

    phone2:
        "01752 125439",

    whatsapp:
        "8801303679189",

    currency:
        "৳",

    currencyName:
        "টাকা",

    defaultImage:
        "assets/images/product-placeholder.png",

    productsFile:
        "data/products.json",

    categoriesFile:
        "data/categories.json"

};


/* ==========================================================
   GLOBAL STATE
========================================================== */

let products = [];

let categories = [];

let wishlist = [];

let currentProduct = null;

let sliderTimers = [];

let productsLoaded = false;

let categoriesLoaded = false;


/* ==========================================================
   DOM SHORTCUT
========================================================== */

function $(selector, parent = document) {

    if (!selector) {

        return null;

    }

    return parent.querySelector(selector);

}


/* ==========================================================
   DOM SHORTCUT — ALL
========================================================== */

function $$(selector, parent = document) {

    if (!selector) {

        return [];

    }

    return Array.from(
        parent.querySelectorAll(selector)
    );

}


/* ==========================================================
   SAFE NUMBER
========================================================== */

function toNumber(value, fallback = 0) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


/* ==========================================================
   SAFE STRING
========================================================== */

function toText(value, fallback = "") {

    if (
        value === null ||
        value === undefined
    ) {

        return fallback;

    }

    return String(value);

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHTML(value) {

    return toText(value)

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

function normalizeText(value) {

    return toText(value)

        .trim()

        .toLowerCase();

}


/* ==========================================================
   NORMALIZE CATEGORY
========================================================== */

function normalizeCategory(value) {

    return toText(value)

        .trim()

        .toLowerCase()

        .replace(
            /\s+/g,
            "-"
        )

        .replace(
            /[^a-z0-9\u0980-\u09ff-]/g,
            ""
        );

}


/* ==========================================================
   FORMAT PRICE
========================================================== */

function formatPrice(value) {

    const price =
        toNumber(
            value,
            0
        );


    try {

        return (
            price.toLocaleString(
                "bn-BD"
            ) +
            " " +
            SITE_CONFIG.currency
        );

    }
    catch (error) {

        return (
            price.toLocaleString() +
            " " +
            SITE_CONFIG.currency
        );

    }

}


/* ==========================================================
   FORMAT NUMBER
========================================================== */

function formatNumber(value) {

    const number =
        toNumber(
            value,
            0
        );


    try {

        return number.toLocaleString(
            "bn-BD"
        );

    }
    catch (error) {

        return number.toLocaleString();

    }

}


/* ==========================================================
   GET PRODUCT ID
========================================================== */

function getProductId(product) {

    if (!product) {

        return 0;

    }


    return toNumber(
        product.id,
        0
    );

}


/* ==========================================================
   FIND PRODUCT
========================================================== */

function findProduct(productId) {

    const id =
        toNumber(
            productId,
            0
        );


    if (!id) {

        return null;

    }


    return (
        products.find(
            product =>
                getProductId(
                    product
                ) === id
        ) ||
        null
    );

}


/* ==========================================================
   FIND CATEGORY
========================================================== */

function findCategory(categoryId) {

    const normalized =
        normalizeCategory(
            categoryId
        );


    if (!normalized) {

        return null;

    }


    return (
        categories.find(
            category => {

                const id =
                    normalizeCategory(
                        category.id ||
                        category.slug ||
                        category.name
                    );


                return id === normalized;

            }
        ) ||
        null
    );

}


/* ==========================================================
   GET CATEGORY NAME
========================================================== */

function getCategoryName(categoryId) {

    const category =
        findCategory(
            categoryId
        );


    if (category) {

        return (
            category.name ||
            category.title ||
            category.id ||
            "অন্যান্য"
        );

    }


    return (
        toText(
            categoryId
        ) ||
        "অন্যান্য"
    );

}


/* ==========================================================
   GET SUB CATEGORY NAME
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
        !category ||
        !Array.isArray(
            category.subCategories
        )
    ) {

        return (
            toText(
                subCategoryId
            ) ||
            ""
        );

    }


    const normalized =
        normalizeCategory(
            subCategoryId
        );


    const subCategory =
        category.subCategories.find(
            item =>
                normalizeCategory(
                    item.id ||
                    item.slug ||
                    item.name
                ) === normalized
        );


    return subCategory
        ? (
            subCategory.name ||
            subCategory.title ||
            subCategory.id ||
            ""
        )
        : (
            toText(
                subCategoryId
            ) ||
            ""
        );

}


/* ==========================================================
   GET PRODUCT GALLERY
========================================================== */

function getGallery(product) {

    if (!product) {

        return [];

    }


    let gallery = [];


    if (
        Array.isArray(
            product.images
        )
    ) {

        gallery =
            product.images;

    }
    else if (
        Array.isArray(
            product.gallery
        )
    ) {

        gallery =
            product.gallery;

    }
    else if (
        Array.isArray(
            product.photos
        )
    ) {

        gallery =
            product.photos;

    }


    if (
        !gallery.length &&
        product.image
    ) {

        gallery = [
            product.image
        ];

    }


    return gallery

        .filter(Boolean)

        .map(
            image =>
                toText(
                    image
                ).trim()
        )

        .filter(Boolean);

}


/* ==========================================================
   LOCAL STORAGE — WISHLIST LOAD
========================================================== */

function loadWishlist() {

    try {

        const saved =
            localStorage.getItem(
                "malihaWishlist"
            );


        if (!saved) {

            wishlist = [];

            return;

        }


        const parsed =
            JSON.parse(
                saved
            );


        if (
            Array.isArray(parsed)
        ) {

            wishlist =
                parsed

                    .map(
                        Number
                    )

                    .filter(
                        id =>
                            Number.isFinite(
                                id
                            ) &&
                            id > 0
                    );

        }
        else {

            wishlist = [];

        }

    }
    catch (error) {

        console.error(
            "Wishlist Load Error:",
            error
        );


        wishlist = [];

    }

}


/* ==========================================================
   LOCAL STORAGE — WISHLIST SAVE
========================================================== */

function saveWishlist() {

    try {

        localStorage.setItem(
            "malihaWishlist",
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
   UPDATE WISHLIST COUNTER
========================================================== */

function updateWishlistCounter() {

    const counters = [

        $("#wishlistCount"),

        $("#wishlistCounter"),

        $("[data-wishlist-count]")

    ];


    counters.forEach(
        counter => {

            if (!counter) {

                return;

            }


            counter.textContent =
                formatNumber(
                    wishlist.length
                );

        }
    );

}


/* ==========================================================
   INITIAL STATE
========================================================== */

loadWishlist();

updateWishlistCounter();


/* ==========================================================
   PART 1 COMPLETE
========================================================== */

console.log(
    "🌱 Maliha Agro Industry — Script Part 1/8 Loaded."
);

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL VERSION
   PART 2/8

   PRODUCT DATA
   CATEGORY DATA
   DATA LOADING
   CATEGORY HELPERS
========================================================== */


/* ==========================================================
   PRODUCT DATA STATE
========================================================== */

let products = [];

let categories = [];

let currentProduct = null;

let productsLoaded = false;

let categoriesLoaded = false;

let productsLoadingPromise = null;

let categoriesLoadingPromise = null;


/* ==========================================================
   WISHLIST STATE
========================================================== */

let wishlist = [];


/* ==========================================================
   SLIDER STATE
========================================================== */

let sliderTimers = [];


/* ==========================================================
   LOAD WISHLIST FROM LOCAL STORAGE
========================================================== */

function loadWishlist() {

    try {

        const saved =
            localStorage.getItem(
                "malihaWishlist"
            );


        if (!saved) {

            wishlist = [];

            return;

        }


        const parsed =
            JSON.parse(
                saved
            );


        if (
            Array.isArray(parsed)
        ) {

            wishlist =
                parsed
                    .map(
                        Number
                    )
                    .filter(
                        id =>
                            Number.isFinite(id) &&
                            id > 0
                    );

        }
        else {

            wishlist = [];

        }

    }
    catch (error) {

        console.error(
            "Wishlist Load Error:",
            error
        );


        wishlist = [];

    }

}


/* ==========================================================
   SAVE WISHLIST
========================================================== */

function saveWishlist() {

    try {

        localStorage.setItem(
            "malihaWishlist",
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
   NORMALIZE CATEGORY
========================================================== */

function normalizeCategory(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /[_\s]+/g,
            "-"
        )
        .replace(
            /[^a-z0-9\u0980-\u09ff-]/g,
            ""
        )
        .replace(
            /-+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            ""
        );

}


/* ==========================================================
   GET CATEGORY NAME
========================================================== */

function getCategoryName(
    categoryId
) {

    const normalized =
        normalizeCategory(
            categoryId
        );


    if (!normalized) {

        return "";

    }


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
        ""
    );

}


/* ==========================================================
   GET SUB-CATEGORY NAME
========================================================== */

function getSubCategoryName(
    categoryId,
    subCategoryId
) {

    const normalizedCategory =
        normalizeCategory(
            categoryId
        );


    const normalizedSubCategory =
        normalizeCategory(
            subCategoryId
        );


    if (
        !normalizedCategory ||
        !normalizedSubCategory
    ) {

        return "";

    }


    const category =
        categories.find(
            item =>
                normalizeCategory(
                    item?.id ||
                    item?.slug ||
                    item?.name
                ) === normalizedCategory
        );


    if (
        !category ||
        !Array.isArray(
            category.subCategories
        )
    ) {

        return "";

    }


    const subCategory =
        category.subCategories.find(
            item =>
                normalizeCategory(
                    item?.id ||
                    item?.slug ||
                    item?.name
                ) === normalizedSubCategory
        );


    return (
        subCategory?.name ||
        subCategory?.title ||
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


    if (!normalized) {

        return null;

    }


    return (
        categories.find(
            category =>
                normalizeCategory(
                    category?.id ||
                    category?.slug ||
                    category?.name
                ) === normalized
        ) ||
        null
    );

}


/* ==========================================================
   NORMALIZE PRODUCT
========================================================== */

function normalizeProduct(
    product,
    index = 0
) {

    if (!product) {

        return null;

    }


    const id =
        Number(
            product.id
        );


    return {

        ...product,


        id:
            Number.isFinite(id) &&
            id > 0
                ? id
                : index + 1,


        name:
            String(
                product.name ||
                product.title ||
                "পণ্য"
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


        category:
            product.category ||
            "",


        subCategory:
            product.subCategory ||
            "",


        categoryName:
            product.categoryName ||
            "",


        subCategoryName:
            product.subCategoryName ||
            "",


        brand:
            product.brand ||
            "",


        sku:
            product.sku ||
            "",


        type:
            product.type ||
            "",


        stock:
            product.stock ||
            "স্টকে আছে",


        description:
            product.description ||
            "",


        shortDescription:
            product.shortDescription ||
            "",


        offer:
            Boolean(
                product.offer
            ),


        newArrival:
            Boolean(
                product.newArrival
            ),


        bestSeller:
            Boolean(
                product.bestSeller
            )

    };

}


/* ==========================================================
   GET PRODUCT GALLERY
========================================================== */

function getGallery(
    product
) {

    if (!product) {

        return [];

    }


    const gallery = [];


    /* ------------------------------------------
       gallery array
    ------------------------------------------ */

    if (
        Array.isArray(
            product.gallery
        )
    ) {

        product.gallery.forEach(
            image => {

                if (
                    typeof image ===
                    "string" &&
                    image.trim()
                ) {

                    gallery.push(
                        image.trim()
                    );

                }

            }
        );

    }


    /* ------------------------------------------
       images array
    ------------------------------------------ */

    if (
        Array.isArray(
            product.images
        )
    ) {

        product.images.forEach(
            image => {

                if (
                    typeof image ===
                    "string" &&
                    image.trim()
                ) {

                    gallery.push(
                        image.trim()
                    );

                }

            }
        );

    }


    /* ------------------------------------------
       image
    ------------------------------------------ */

    if (
        typeof product.image ===
        "string" &&
        product.image.trim()
    ) {

        gallery.push(
            product.image.trim()
        );

    }


    /* ------------------------------------------
       image1 → image5
    ------------------------------------------ */

    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        const key =
            `image${i}`;


        if (
            typeof product[key] ===
            "string" &&
            product[key].trim()
        ) {

            gallery.push(
                product[key].trim()
            );

        }

    }


    /* ------------------------------------------
       Remove duplicates
    ------------------------------------------ */

    return [
        ...new Set(
            gallery
                .filter(Boolean)
        )
    ];

}


/* ==========================================================
   FETCH PRODUCTS
========================================================== */

async function fetchProducts() {

    const response =
        await fetch(
            "data/products.json",
            {
                cache:
                    "no-store"
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Products HTTP Error: ${response.status}`
        );

    }


    const data =
        await response.json();


    if (
        !Array.isArray(data)
    ) {

        throw new Error(
            "products.json must contain an array."
        );

    }


    return data
        .map(
            (
                product,
                index
            ) =>
                normalizeProduct(
                    product,
                    index
                )
        )
        .filter(Boolean);

}


/* ==========================================================
   ENSURE PRODUCTS LOADED
========================================================== */

async function ensureProductsLoaded() {

    if (
        productsLoaded
    ) {

        return products;

    }


    if (
        productsLoadingPromise
    ) {

        return productsLoadingPromise;

    }


    productsLoadingPromise =
        fetchProducts()
            .then(
                data => {

                    products =
                        data;

                    productsLoaded =
                        true;


                    return products;

                }
            )
            .catch(
                error => {

                    productsLoadingPromise =
                        null;

                    throw error;

                }
            );


    return productsLoadingPromise;

}


/* ==========================================================
   FETCH CATEGORIES
========================================================== */

async function fetchCategories() {

    const response =
        await fetch(
            "data/categories.json",
            {
                cache:
                    "no-store"
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Categories HTTP Error: ${response.status}`
        );

    }


    const data =
        await response.json();


    if (
        !Array.isArray(data)
    ) {

        throw new Error(
            "categories.json must contain an array."
        );

    }


    return data;

}


/* ==========================================================
   ENSURE CATEGORIES LOADED
========================================================== */

async function ensureCategoriesLoaded() {

    if (
        categoriesLoaded
    ) {

        return categories;

    }


    if (
        categoriesLoadingPromise
    ) {

        return categoriesLoadingPromise;

    }


    categoriesLoadingPromise =
        fetchCategories()
            .then(
                data => {

                    categories =
                        data
                            .filter(Boolean);


                    categoriesLoaded =
                        true;


                    return categories;

                }
            )
            .catch(
                error => {

                    /*
                       categories.json না থাকলে
                       products.json থেকে পরে
                       category তৈরি করা যাবে।
                    */

                    console.warn(
                        "Categories file unavailable:",
                        error
                    );


                    categories =
                        [];


                    categoriesLoaded =
                        true;


                    return categories;

                }
            );


    return categoriesLoadingPromise;

}


/* ==========================================================
   FIND PRODUCT BY ID
========================================================== */

function findProduct(
    productId
) {

    const id =
        Number(
            productId
        );


    if (
        !Number.isFinite(id)
    ) {

        return null;

    }


    return (
        products.find(
            product =>
                Number(
                    product.id
                ) === id
        ) ||
        null
    );

}


/* ==========================================================
   PRODUCT URL ID
========================================================== */

function getProductIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        Number(
            params.get(
                "id"
            )
        );


    if (
        !Number.isFinite(id) ||
        id <= 0
    ) {

        return null;

    }


    return id;

}


/* ==========================================================
   INITIALIZE DATA
========================================================== */

async function initializeProductData() {

    loadWishlist();


    try {

        await ensureProductsLoaded();

    }
    catch (error) {

        console.error(
            "Product Data Initialization Error:",
            error
        );

    }


    try {

        await ensureCategoriesLoaded();

    }
    catch (error) {

        console.error(
            "Category Data Initialization Error:",
            error
        );

    }


    return {

        products,

        categories,

        wishlist

    };

}


/* ==========================================================
   PART 2 COMPLETE
========================================================== */

console.log(
    "🌱 Part 2/8 — Product & Category Data System Loaded."
);

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL VERSION
   PART 3/8
   PRODUCT DATA + CATEGORY DATA
========================================================== */


/* ==========================================================
   PRODUCT DATA STATE
========================================================== */

let products = [];

let categories = [];

let currentProduct = null;

let wishlist = [];

let sliderTimers = [];


/* ==========================================================
   WISHLIST STORAGE KEY
========================================================== */

const WISHLIST_KEY =
    "maliha_agro_wishlist";


/* ==========================================================
   LOAD WISHLIST FROM LOCAL STORAGE
========================================================== */

function loadWishlist() {

    try {

        const saved =
            localStorage.getItem(
                WISHLIST_KEY
            );


        if (!saved) {

            wishlist = [];

            return;

        }


        const parsed =
            JSON.parse(
                saved
            );


        if (
            Array.isArray(parsed)
        ) {

            wishlist =
                parsed
                    .map(
                        id => Number(id)
                    )
                    .filter(
                        id =>
                            Number.isFinite(id) &&
                            id > 0
                    );

        }
        else {

            wishlist = [];

        }

    }
    catch (error) {

        console.error(
            "Wishlist Load Error:",
            error
        );


        wishlist = [];

    }

}


/* ==========================================================
   SAVE WISHLIST
========================================================== */

function saveWishlist() {

    try {

        localStorage.setItem(
            WISHLIST_KEY,
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

    const counters =
        [

            $("#wishlistCount"),

            $("#wishlistCounter"),

            $("#wishlistBadge"),

            $(".wishlist-count")

        ];


    counters.forEach(
        counter => {

            if (!counter) {

                return;

            }


            counter.textContent =
                String(
                    wishlist.length
                );


            counter.style.display =
                wishlist.length
                    ? ""
                    : "";

        }
    );

}


/* ==========================================================
   UPDATE WISHLIST BUTTON
========================================================== */

function updateWishlistButton(
    button,
    productId
) {

    if (!button) {

        return;

    }


    const id =
        Number(productId);


    const active =
        wishlist.includes(
            id
        );


    button.textContent =
        active
            ? "❤️"
            : "🤍";


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


    button.setAttribute(
        "aria-label",
        active
            ? "Wishlist থেকে বাদ দিন"
            : "Wishlist-এ রাখুন"
    );

}


/* ==========================================================
   TOGGLE WISHLIST
========================================================== */

function toggleWishlist(
    productId
) {

    const id =
        Number(productId);


    if (
        !Number.isFinite(id) ||
        id <= 0
    ) {

        return false;

    }


    const index =
        wishlist.indexOf(
            id
        );


    if (
        index >= 0
    ) {

        wishlist.splice(
            index,
            1
        );

    }
    else {

        wishlist.push(
            id
        );

    }


    saveWishlist();

    updateWishlistCounter();


    /* Update every visible wishlist button */

    $$(
        ".wishlist-btn"
    ).forEach(
        button => {

            if (
                Number(
                    button.dataset.id
                ) === id
            ) {

                updateWishlistButton(
                    button,
                    id
                );

            }

        }
    );


    /* Refresh wishlist page if currently open */

    if (
        $("#wishlistProducts")
    ) {

        renderWishlistPage();

    }


    return (
        index < 0
    );

}


/* ==========================================================
   GET GALLERY
========================================================== */

function getGallery(
    product
) {

    if (!product) {

        return [];

    }


    let gallery = [];


    /* gallery array */

    if (
        Array.isArray(
            product.gallery
        )
    ) {

        gallery =
            product.gallery;

    }


    /* images array */

    else if (
        Array.isArray(
            product.images
        )
    ) {

        gallery =
            product.images;

    }


    /* image string */

    else if (
        typeof product.image ===
        "string"
    ) {

        gallery =
            [
                product.image
            ];

    }


    /* image URL variants */

    else {

        gallery =
            [

                product.image1,

                product.image2,

                product.image3,

                product.image4,

                product.image5

            ];

    }


    return gallery
        .filter(
            image =>
                typeof image ===
                    "string" &&
                image.trim()
        )
        .map(
            image =>
                image.trim()
        );

}


/* ==========================================================
   FIND PRODUCT
========================================================== */

function findProduct(
    productId
) {

    const id =
        Number(productId);


    if (
        !Number.isFinite(id)
    ) {

        return null;

    }


    return (
        products.find(
            product =>
                Number(
                    product.id
                ) === id
        ) ||
        null
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


    if (!normalized) {

        return null;

    }


    return (
        categories.find(
            category => {

                return (
                    normalizeCategory(
                        category.id ||
                        category.slug ||
                        category.name
                    ) === normalized
                );

            }
        ) ||
        null
    );

}


/* ==========================================================
   GET CATEGORY NAME
========================================================== */

function getCategoryName(
    categoryId
) {

    const category =
        findCategory(
            categoryId
        );


    if (category) {

        return (
            category.name ||
            category.title ||
            category.id ||
            ""
        );

    }


    const product =
        products.find(
            item =>
                normalizeCategory(
                    item.category
                ) ===
                normalizeCategory(
                    categoryId
                )
        );


    return (
        product?.categoryName ||
        product?.category ||
        ""
    );

}


/* ==========================================================
   GET SUB CATEGORY NAME
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
        !category ||
        !Array.isArray(
            category.subCategories
        )
    ) {

        return "";

    }


    const normalized =
        normalizeCategory(
            subCategoryId
        );


    const subCategory =
        category.subCategories.find(
            item => {

                return (
                    normalizeCategory(
                        item.id ||
                        item.slug ||
                        item.name
                    ) === normalized
                );

            }
        );


    return (
        subCategory?.name ||
        subCategory?.title ||
        subCategory?.id ||
        ""
    );

}


/* ==========================================================
   FETCH PRODUCTS
========================================================== */

async function fetchProducts() {

    const response =
        await fetch(
            "data/products.json",
            {
                cache: "no-cache"
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Products HTTP Error: ${response.status}`
        );

    }


    const data =
        await response.json();


    if (
        Array.isArray(data)
    ) {

        return data;

    }


    if (
        Array.isArray(
            data.products
        )
    ) {

        return data.products;

    }


    return [];

}


/* ==========================================================
   FETCH CATEGORIES
========================================================== */

async function fetchCategories() {

    const response =
        await fetch(
            "data/categories.json",
            {
                cache: "no-cache"
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Categories HTTP Error: ${response.status}`
        );

    }


    const data =
        await response.json();


    if (
        Array.isArray(data)
    ) {

        return data;

    }


    if (
        Array.isArray(
            data.categories
        )
    ) {

        return data.categories;

    }


    return [];

}


/* ==========================================================
   ENSURE PRODUCTS LOADED
========================================================== */

let productsLoadingPromise =
    null;


async function ensureProductsLoaded() {

    if (
        Array.isArray(
            products
        ) &&
        products.length
    ) {

        return products;

    }


    if (
        productsLoadingPromise
    ) {

        return productsLoadingPromise;

    }


    productsLoadingPromise =
        fetchProducts()
            .then(
                data => {

                    products =
                        Array.isArray(data)
                            ? data
                            : [];


                    return products;

                }
            )
            .catch(
                error => {

                    products =
                        [];


                    throw error;

                }
            )
            .finally(
                () => {

                    productsLoadingPromise =
                        null;

                }
            );


    return productsLoadingPromise;

}


/* ==========================================================
   ENSURE CATEGORIES LOADED
========================================================== */

let categoriesLoadingPromise =
    null;


async function ensureCategoriesLoaded() {

    if (
        Array.isArray(
            categories
        ) &&
        categories.length
    ) {

        return categories;

    }


    if (
        categoriesLoadingPromise
    ) {

        return categoriesLoadingPromise;

    }


    categoriesLoadingPromise =
        fetchCategories()
            .then(
                data => {

                    categories =
                        Array.isArray(data)
                            ? data
                            : [];


                    return categories;

                }
            )
            .catch(
                error => {

                    /*
                       categories.json না থাকলেও
                       পরে products.json থেকে
                       category তৈরি করা যাবে।
                    */

                    categories =
                        [];


                    console.warn(
                        "Categories could not be loaded:",
                        error
                    );


                    return categories;

                }
            )
            .finally(
                () => {

                    categoriesLoadingPromise =
                        null;

                }
            );


    return categoriesLoadingPromise;

}


/* ==========================================================
   LOAD PRODUCT FROM URL
========================================================== */

async function loadProductFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get(
            "id"
        );


    if (!productId) {

        return null;

    }


    await ensureProductsLoaded();


    currentProduct =
        findProduct(
            productId
        );


    return currentProduct;

}


/* ==========================================================
   FORMAT PRICE
========================================================== */

function formatPrice(
    price
) {

    const amount =
        Number(
            price || 0
        );


    if (
        !Number.isFinite(
            amount
        )
    ) {

        return "৳0";

    }


    try {

        return (
            "৳" +
            new Intl.NumberFormat(
                "bn-BD"
            ).format(
                amount
            )
        );

    }
    catch (error) {

        return (
            "৳" +
            amount.toLocaleString(
                "bn-BD"
            )
        );

    }

}


/* ==========================================================
   PRODUCT STOCK STATUS
========================================================== */

function getStockStatus(
    product
) {

    if (!product) {

        return "স্টক তথ্য নেই";

    }


    if (
        typeof product.stock ===
        "string"
    ) {

        return product.stock;

    }


    const quantity =
        Number(
            product.stockQuantity
        );


    if (
        Number.isFinite(
            quantity
        )
    ) {

        if (
            quantity <= 0
        ) {

            return "স্টক শেষ";

        }


        return `স্টকে আছে — ${quantity} টি`;

    }


    return "স্টকে আছে";

}


/* ==========================================================
   PART 3 COMPLETE
========================================================== */

console.log(
    "📦 Part 3/8 — Product Data & Wishlist System Loaded."
);

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL VERSION
   PART 4/8

   PRODUCT CARD
   PRODUCT IMAGE SLIDER
   WISHLIST BUTTON
========================================================== */


/* ==========================================================
   CREATE PRODUCT CARD
========================================================== */

function createProductCard(product) {

    if (!product) {

        return null;

    }


    const productId =
        Number(
            product.id
        );


    if (
        !Number.isFinite(
            productId
        ) ||
        productId <= 0
    ) {

        return null;

    }


    const gallery =
        getGallery(
            product
        );


    const images =
        gallery.length
            ? gallery
            : [
                SITE_CONFIG.defaultImage
            ];


    const price =
        Number(
            product.price || 0
        );


    const oldPrice =
        Number(
            product.oldPrice || 0
        );


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


    const categoryName =
        product.categoryName ||
        getCategoryName(
            product.category
        ) ||
        "অন্যান্য";


    const subCategoryName =
        product.subCategoryName ||
        getSubCategoryName(
            product.category,
            product.subCategory
        );


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    card.dataset.id =
        String(
            productId
        );


    card.dataset.category =
        normalizeCategory(
            product.category
        );


    card.dataset.subcategory =
        normalizeCategory(
            product.subCategory
        );


    card.innerHTML = `

        <div
            class="product-card-image"
            style="
                position:relative;
            "
        >

            ${
                product.offer
                    ? `
                        <span
                            class="product-offer-badge"
                            style="
                                position:absolute;
                                top:10px;
                                left:10px;
                                z-index:10;
                                background:#e53935;
                                color:#fff;
                                padding:5px 9px;
                                border-radius:6px;
                                font-size:11px;
                                font-weight:700;
                            "
                        >
                            🔥 অফার
                        </span>
                    `
                    : ""
            }


            ${
                product.newArrival
                    ? `
                        <span
                            class="product-new-badge"
                            style="
                                position:absolute;
                                top:10px;
                                left:10px;
                                z-index:9;
                                background:#1F8F4D;
                                color:#fff;
                                padding:5px 9px;
                                border-radius:6px;
                                font-size:11px;
                                font-weight:700;
                            "
                        >
                            🆕 নতুন
                        </span>
                    `
                    : ""
            }


            ${
                discount > 0
                    ? `
                        <span
                            class="product-discount-badge"
                            style="
                                position:absolute;
                                top:10px;
                                right:10px;
                                z-index:10;
                                background:#1F8F4D;
                                color:#fff;
                                padding:5px 8px;
                                border-radius:6px;
                                font-size:11px;
                                font-weight:700;
                            "
                        >
                            ${discount}% OFF
                        </span>
                    `
                    : ""
            }


            <button
                type="button"
                class="wishlist-btn"
                data-id="${productId}"
                aria-label="Wishlist"
                aria-pressed="false"
                style="
                    position:absolute;
                    right:10px;
                    bottom:10px;
                    z-index:20;
                    width:40px;
                    height:40px;
                    border:0;
                    border-radius:50%;
                    background:#fff;
                    box-shadow:
                        0 2px 10px
                        rgba(0,0,0,.15);
                    cursor:pointer;
                    font-size:19px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                "
            >
                🤍
            </button>


            <div
                class="slider"
                data-product-id="${productId}"
                style="
                    position:relative;
                    width:100%;
                    overflow:hidden;
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

        </div>


        <div
            class="product-card-content"
        >

            <div
                class="product-category"
                style="
                    color:#1F8F4D;
                    font-size:12px;
                    font-weight:600;
                    margin-bottom:5px;
                "
            >

                ${escapeHTML(
                    categoryName
                )}

                ${
                    subCategoryName
                        ? `
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
                        : ""
                }

            </div>


            <h3
                class="product-title"
                style="
                    margin:5px 0;
                    line-height:1.45;
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


            ${
                product.brand
                    ? `
                        <div
                            style="
                                color:#777;
                                font-size:11px;
                                margin:4px 0;
                            "
                        >
                            প্রস্তুতকারক:
                            ${escapeHTML(
                                product.brand
                            )}
                        </div>
                    `
                    : ""
            }


            <div
                class="product-rating"
                style="
                    color:#e5a000;
                    font-size:13px;
                    margin:6px 0;
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
                        font-size:11px;
                        margin-left:3px;
                    "
                >
                    (${formatNumber(
                        reviewCount
                    )})
                </span>

            </div>


            <div
                class="product-price"
                style="
                    margin:8px 0;
                "
            >

                <strong
                    style="
                        color:#1F8F4D;
                        font-size:20px;
                        font-weight:800;
                    "
                >

                    ${formatPrice(
                        price
                    )}

                </strong>


                ${
                    oldPrice > price
                        ? `
                            <span
                                style="
                                    color:#999;
                                    text-decoration:
                                        line-through;
                                    font-size:13px;
                                    margin-left:6px;
                                "
                            >
                                ${formatPrice(
                                    oldPrice
                                )}
                            </span>
                        `
                        : ""
                }

            </div>


            <div
                class="product-stock"
                style="
                    color:#198754;
                    font-size:12px;
                    margin-bottom:7px;
                "
            >

                🟢 ${escapeHTML(
                    getStockStatus(
                        product
                    )
                )}

            </div>


            ${
                product.shortDescription ||
                product.description
                    ? `
                        <p
                            style="
                                color:#666;
                                font-size:13px;
                                line-height:1.6;
                                margin:5px 0 10px;
                            "
                        >
                            ${escapeHTML(
                                product.shortDescription ||
                                product.description
                            )}
                        </p>
                    `
                    : ""
            }


            <div
                class="product-card-actions"
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
                        padding:8px 5px;
                        text-align:center;
                        font-size:12px;
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
                        padding:8px 5px;
                        text-align:center;
                        font-size:12px;
                        background:#25D366;
                        color:#fff;
                    "
                >
                    WhatsApp অর্ডার
                </a>

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


    updateWishlistButton(
        wishlistButton,
        productId
    );


    if (wishlistButton) {

        wishlistButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                toggleWishlist(
                    productId
                );

            }
        );

    }


    /* ======================================================
       WHATSAPP ORDER
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


                openWhatsAppOrder(
                    product
                );

            }
        );

    }


    return card;

}


/* ==========================================================
   WHATSAPP ORDER
========================================================== */

function openWhatsAppOrder(
    product
) {

    if (!product) {

        return;

    }


    const productName =
        product.name ||
        "পণ্য";


    const price =
        formatPrice(
            product.price
        );


    const message =
        [
            "🌱 মালিহা এগ্রো ইন্ডাস্ট্রি",
            "",
            "🛍️ পণ্যের অর্ডার করতে চাই",
            "",
            `পণ্য: ${productName}`,
            `মূল্য: ${price}`,
            `Product ID: ${product.id}`,
            "",
            "অনুগ্রহ করে অর্ডারটি গ্রহণ করুন।"
        ]
        .join(
            "\n"
        );


    const phone =
        String(
            SITE_CONFIG.whatsapp ||
            ""
        )
        .replace(
            /\D/g,
            ""
        );


    if (!phone) {

        return;

    }


    const url =
        "https://wa.me/" +
        phone +
        "?text=" +
        encodeURIComponent(
            message
        );


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* ==========================================================
   STOP SLIDERS
========================================================== */

function stopSliders() {

    sliderTimers.forEach(
        timer => {

            clearInterval(
                timer
            );

        }
    );


    sliderTimers = [];

}


/* ==========================================================
   START PRODUCT IMAGE SLIDERS
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


            const timer =
                setInterval(
                    () => {

                        if (
                            document.hidden
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

                    },
                    3000
                );


            sliderTimers.push(
                timer
            );

        }
    );

}


/* ==========================================================
   REFRESH SLIDERS
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
   PART 4 COMPLETE
========================================================== */

console.log(
    "🛍️ Part 4/8 — Product Card & Image Slider Loaded."
);

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL VERSION
   PART 5/8

   PRODUCT LIST
   SEARCH
   SORT
   RESULT COUNT
========================================================== */


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


    /* Clear old products */

    container.innerHTML = "";


    /* Empty result */

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
                        margin-top:8px;
                        line-height:1.7;
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
                        cursor:pointer;
                        width:auto;
                        margin:15px auto 0;
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


        updateProductResultCount(
            0
        );


        return;

    }


    /* ======================================================
       DOCUMENT FRAGMENT
    ====================================================== */

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


    /* ======================================================
       UPDATE WISHLIST BUTTONS
    ====================================================== */

    $$(".wishlist-btn")
        .forEach(
            button => {

                const id =
                    Number(
                        button.dataset.id
                    );


                if (
                    Number.isFinite(id)
                ) {

                    updateWishlistButton(
                        button,
                        id
                    );

                }

            }
        );


    /* ======================================================
       START SLIDERS
    ====================================================== */

    startSliders();


    /* ======================================================
       UPDATE WISHLIST COUNTER
    ====================================================== */

    updateWishlistCounter();

}


/* ==========================================================
   FILTER PRODUCTS
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

            if (!product) {

                return false;

            }


            /* ==================================================
               CATEGORY
            ================================================== */

            if (
                normalizedCategory &&
                normalizeCategory(
                    product.category
                ) !==
                normalizedCategory
            ) {

                return false;

            }


            /* ==================================================
               SUB CATEGORY
            ================================================== */

            if (
                normalizedSubCategory &&
                normalizeCategory(
                    product.subCategory
                ) !==
                normalizedSubCategory
            ) {

                return false;

            }


            /* ==================================================
               SEARCH
            ================================================== */

            if (search) {

                const searchableText = [

                    product.name,

                    product.description,

                    product.shortDescription,

                    product.brand,

                    product.sku,

                    product.type,

                    product.category,

                    product.categoryName,

                    product.subCategory,

                    product.subCategoryName

                ]
                .filter(
                    Boolean
                )
                .join(
                    " "
                )
                .toLowerCase();


                if (
                    !searchableText.includes(
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
   SORT PRODUCTS
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


    const result =
        [...list];


    const sort =
        String(
            sortValue || "default"
        )
        .trim()
        .toLowerCase();


    switch (
        sort
    ) {


        /* ==================================================
           PRICE LOW → HIGH
        ================================================== */

        case "price-low":
        case "price-low-high":
        case "low-high":

            result.sort(
                (
                    a,
                    b
                ) =>

                    Number(
                        a.price || 0
                    )

                    -

                    Number(
                        b.price || 0
                    )
            );

            break;


        /* ==================================================
           PRICE HIGH → LOW
        ================================================== */

        case "price-high":
        case "price-high-low":
        case "high-low":

            result.sort(
                (
                    a,
                    b
                ) =>

                    Number(
                        b.price || 0
                    )

                    -

                    Number(
                        a.price || 0
                    )
            );

            break;


        /* ==================================================
           RATING
        ================================================== */

        case "rating":
        case "top-rated":

            result.sort(
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
                        ratingA !==
                        ratingB
                    ) {

                        return (
                            ratingB -
                            ratingA
                        );

                    }


                    return (

                        Number(
                            b.reviewCount || 0
                        )

                        -

                        Number(
                            a.reviewCount || 0
                        )

                    );

                }
            );

            break;


        /* ==================================================
           NEWEST
        ================================================== */

        case "newest":
        case "new":
        case "latest":

            result.sort(
                (
                    a,
                    b
                ) => {

                    const idA =
                        Number(
                            a.id || 0
                        );


                    const idB =
                        Number(
                            b.id || 0
                        );


                    /*
                       createdAt থাকলে date অনুযায়ী,
                       না থাকলে ID অনুযায়ী।
                    */

                    const dateA =
                        a.createdAt ||
                        a.date;


                    const dateB =
                        b.createdAt ||
                        b.date;


                    if (
                        dateA &&
                        dateB
                    ) {

                        const timeA =
                            new Date(
                                dateA
                            ).getTime();


                        const timeB =
                            new Date(
                                dateB
                            ).getTime();


                        if (
                            Number.isFinite(
                                timeA
                            ) &&
                            Number.isFinite(
                                timeB
                            )
                        ) {

                            return (
                                timeB -
                                timeA
                            );

                        }

                    }


                    return (
                        idB -
                        idA
                    );

                }
            );

            break;


        /* ==================================================
           NAME A-Z
        ================================================== */

        case "name":
        case "name-az":
        case "a-z":

            result.sort(
                (
                    a,
                    b
                ) =>

                    String(
                        a.name || ""
                    )
                    .localeCompare(
                        String(
                            b.name || ""
                        ),
                        "bn"
                    )
            );

            break;


        /* ==================================================
           DEFAULT
        ================================================== */

        default:

            break;

    }


    return result;

}


/* ==========================================================
   UPDATE PRODUCT RESULT COUNT
========================================================== */

function updateProductResultCount(
    count
) {

    const total =
        Number(
            count || 0
        );


    const text =
        `${formatNumber(
            total
        )} টি পণ্য পাওয়া গেছে`;


    const elements = [

        $("#productResultCount"),

        $("#productCount"),

        $("#resultCount"),

        $("#productsCount"),

        $("#searchResultCount")

    ];


    elements.forEach(
        element => {

            if (!element) {

                return;

            }


            element.textContent =
                text;

        }
    );

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


    let searchTimer =
        null;


    input.addEventListener(
        "input",
        () => {

            clearTimeout(
                searchTimer
            );


            searchTimer =
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
   RESET PRODUCT SEARCH
========================================================== */

function resetProductSearch() {

    const searchInput =
        $("#searchProduct");


    if (searchInput) {

        searchInput.value =
            "";

    }


    const sortSelect =
        $("#sortProducts");


    if (sortSelect) {

        sortSelect.value =
            "default";

    }


    loadProducts(
        getActiveCategory(),
        getActiveSubCategory()
    );

}


/* ==========================================================
   PART 5 COMPLETE
========================================================== */

console.log(
    "🔎 Part 5/8 — Product List, Search & Sort Loaded."
);

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL VERSION
   PART 6/8

   PRODUCT LIST
   SEARCH
   FILTER
   SORT
   RESULT COUNT
========================================================== */


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


    container.innerHTML = "";


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
                        margin-top:8px;
                        line-height:1.7;
                    "
                >
                    আপনার অনুসন্ধান বা নির্বাচিত
                    ক্যাটাগরির সাথে মিল থাকা
                    কোনো পণ্য নেই।
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

    refreshSliders();

}


/* ==========================================================
   GET ACTIVE CATEGORY
========================================================== */

function getActiveCategory() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const categoryFromURL =
        params.get(
            "category"
        );


    if (categoryFromURL) {

        return normalizeCategory(
            categoryFromURL
        );

    }


    const active =
        document.querySelector(
            ".category-btn.active"
        );


    if (!active) {

        return "";

    }


    return normalizeCategory(
        active.dataset.category ||
        active.dataset.id ||
        ""
    );

}


/* ==========================================================
   GET ACTIVE SUB CATEGORY
========================================================== */

function getActiveSubCategory() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const subCategoryFromURL =
        params.get(
            "subcategory"
        ) ||
        params.get(
            "subCategory"
        );


    if (subCategoryFromURL) {

        return normalizeCategory(
            subCategoryFromURL
        );

    }


    const active =
        document.querySelector(
            ".subcategory-btn.active"
        );


    if (!active) {

        return "";

    }


    return normalizeCategory(
        active.dataset.subcategory ||
        active.dataset.id ||
        ""
    );

}


/* ==========================================================
   FILTER PRODUCTS
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

            if (!product) {

                return false;

            }


            /* ------------------------------------------
               CATEGORY
            ------------------------------------------ */

            if (
                normalizedCategory &&
                normalizeCategory(
                    product.category
                ) !==
                normalizedCategory
            ) {

                return false;

            }


            /* ------------------------------------------
               SUB CATEGORY
            ------------------------------------------ */

            if (
                normalizedSubCategory &&
                normalizeCategory(
                    product.subCategory
                ) !==
                normalizedSubCategory
            ) {

                return false;

            }


            /* ------------------------------------------
               SEARCH
            ------------------------------------------ */

            if (search) {

                const searchableText = [

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
                    !searchableText.includes(
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
   SORT PRODUCTS
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


        /* ------------------------------------------
           PRICE LOW → HIGH
        ------------------------------------------ */

        case "price-low":
        case "price-low-high":
        case "low-high":

            sorted.sort(
                (
                    a,
                    b
                ) => {

                    return (
                        Number(
                            a.price || 0
                        ) -
                        Number(
                            b.price || 0
                        )
                    );

                }
            );

            break;


        /* ------------------------------------------
           PRICE HIGH → LOW
        ------------------------------------------ */

        case "price-high":
        case "price-high-low":
        case "high-low":

            sorted.sort(
                (
                    a,
                    b
                ) => {

                    return (
                        Number(
                            b.price || 0
                        ) -
                        Number(
                            a.price || 0
                        )
                    );

                }
            );

            break;


        /* ------------------------------------------
           RATING
        ------------------------------------------ */

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
                        ratingA !==
                        ratingB
                    ) {

                        return (
                            ratingB -
                            ratingA
                        );

                    }


                    return (
                        Number(
                            b.reviewCount || 0
                        ) -
                        Number(
                            a.reviewCount || 0
                        )
                    );

                }
            );

            break;


        /* ------------------------------------------
           NEWEST
        ------------------------------------------ */

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


                    /*
                       তারিখ না থাকলে ID দিয়ে
                       fallback sorting
                    */

                    if (
                        Number.isNaN(dateA) ||
                        Number.isNaN(dateB)
                    ) {

                        return (
                            Number(
                                b.id || 0
                            ) -
                            Number(
                                a.id || 0
                            )
                        );

                    }


                    return (
                        dateB -
                        dateA
                    );

                }
            );

            break;


        /* ------------------------------------------
           NAME A → Z
        ------------------------------------------ */

        case "name":
        case "name-az":
        case "a-z":

            sorted.sort(
                (
                    a,
                    b
                ) => {

                    return String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        ),
                        "bn"
                    );

                }
            );

            break;


        /* ------------------------------------------
           DEFAULT
        ------------------------------------------ */

        default:

            break;

    }


    return sorted;

}


/* ==========================================================
   LOAD PRODUCTS
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


        /* ------------------------------------------
           SEARCH
        ------------------------------------------ */

        const searchInput =
            $("#searchProduct");


        const searchTerm =
            searchInput?.value ||
            "";


        /* ------------------------------------------
           SORT
        ------------------------------------------ */

        const sortSelect =
            $("#sortProducts");


        const sortValue =
            sortSelect?.value ||
            "default";


        /* ------------------------------------------
           FILTER
        ------------------------------------------ */

        let filtered =
            filterProducts(
                products,
                category,
                subCategory,
                searchTerm
            );


        /* ------------------------------------------
           SORT
        ------------------------------------------ */

        filtered =
            sortProducts(
                filtered,
                sortValue
            );


        /* ------------------------------------------
           RENDER
        ------------------------------------------ */

        renderProductList(
            filtered,
            container
        );


        /* ------------------------------------------
           RESULT COUNT
        ------------------------------------------ */

        updateProductResultCount(
            filtered.length
        );


        console.log(
            "✅ Products Loaded:",
            filtered.length
        );

    }
    catch (error) {

        console.error(
            "❌ Load Products Error:",
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

                <div
                    style="
                        font-size:45px;
                        margin-bottom:10px;
                    "
                >
                    ❌
                </div>


                <h2>
                    পণ্য লোড করা যায়নি
                </h2>


                <p
                    style="
                        color:#777;
                        margin-top:8px;
                        line-height:1.7;
                    "
                >
                    পণ্যের তথ্য বর্তমানে লোড করা সম্ভব হচ্ছে না।
                    <br>
                    কিছুক্ষণ পর আবার চেষ্টা করুন।
                </p>


                <button
                    type="button"
                    id="reloadProducts"
                    class="btn"
                    style="
                        border:0;
                        cursor:pointer;
                        max-width:200px;
                        margin:15px auto 0;
                    "
                >
                    🔄 আবার চেষ্টা করুন
                </button>

            </div>

        `;


        $("#reloadProducts")
            ?.addEventListener(
                "click",
                () => {

                    loadProducts(
                        category,
                        subCategory
                    );

                }
            );

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

    const elements = [

        $("#productResultCount"),

        $("#productCount"),

        $("#resultCount"),

        $("#productsCount"),

        $("#searchResultCount")

    ];


    elements.forEach(
        element => {

            if (!element) {

                return;

            }


            element.textContent =
                `${Number(count) || 0} টি পণ্য`;

        }
    );

}


/* ==========================================================
   RESET PRODUCT SEARCH
========================================================== */

function resetProductSearch() {

    const search =
        $("#searchProduct");


    if (search) {

        search.value =
            "";

    }


    const sort =
        $("#sortProducts");


    if (sort) {

        sort.value =
            "default";

    }


    loadProducts(
        getActiveCategory(),
        getActiveSubCategory()
    );

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
   PART 6 COMPLETE
========================================================== */

console.log(
    "🔎 Part 6/8 — Product List, Search, Filter & Sort Loaded."
);

