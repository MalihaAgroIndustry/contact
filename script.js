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

