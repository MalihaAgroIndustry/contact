/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL VERSION
   PART 1/8

   CORE CONFIG
   DOM HELPERS
   GLOBAL STATE
   STORAGE
   BASIC UTILITIES
========================================================== */

"use strict";


/* ==========================================================
   SITE CONFIG
========================================================== */

const SITE_CONFIG = {

    name: "Maliha Agro Industry",

    shortName: "Maliha Agro",

    brand: "মালিহা এগ্রো ইন্ডাস্ট্রি",

    productBrand: "মালিহা জৈব সার",

    phone: "01303 679189",

    whatsapp: "8801303679189",

    secondaryPhone: "01752 125439",

    address:
        "ইসলামপুর, কানসাট, শিবগঞ্জ, চাঁপাইনবাবগঞ্জ",

    currency: "৳",

    currencyCode: "BDT",

    defaultImage:
        "assets/images/product-placeholder.jpg",

    productsFile:
        "products.json",

    categoriesFile:
        "categories.json"

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
   DOM SHORTCUTS
========================================================== */

function $(selector) {

    return document.querySelector(
        selector
    );

}


function $$(selector) {

    return Array.from(
        document.querySelectorAll(
            selector
        )
    );

}


/* ==========================================================
   SAFE NUMBER
========================================================== */

function toNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : fallback;

}


/* ==========================================================
   SAFE STRING
========================================================== */

function toText(
    value,
    fallback = ""
) {

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

function escapeHTML(
    value
) {

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

function normalizeText(
    value
) {

    return toText(value)
        .trim()
        .toLowerCase();

}


/* ==========================================================
   NORMALIZE CATEGORY
========================================================== */

function normalizeCategory(
    value
) {

    return normalizeText(
        value
    )
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /_/g,
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
   FORMAT PRICE
========================================================== */

function formatPrice(
    value
) {

    const price =
        toNumber(
            value,
            0
        );


    try {

        return (
            SITE_CONFIG.currency +
            " " +
            new Intl.NumberFormat(
                "bn-BD"
            ).format(
                price
            )
        );

    }
    catch (error) {

        return (
            SITE_CONFIG.currency +
            " " +
            price.toLocaleString()
        );

    }

}


/* ==========================================================
   FORMAT NUMBER
========================================================== */

function formatNumber(
    value
) {

    const number =
        toNumber(
            value,
            0
        );


    try {

        return new Intl.NumberFormat(
            "bn-BD"
        ).format(
            number
        );

    }
    catch (error) {

        return number.toLocaleString();

    }

}


/* ==========================================================
   LOCAL STORAGE — WISHLIST LOAD
========================================================== */

function loadWishlist() {

    try {

        const saved =
            localStorage.getItem(
                "malihaAgroWishlist"
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
                        item =>
                            Number(item)
                    )
                    .filter(
                        item =>
                            Number.isFinite(
                                item
                            )
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
            "malihaAgroWishlist",
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

    const counters = [

        $("#wishlistCount"),

        $("#wishlistCounter"),

        $(".wishlist-count")

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


            counter.classList.toggle(
                "has-items",
                wishlist.length > 0
            );

        }
    );

}


/* ==========================================================
   WISHLIST CHECK
========================================================== */

function isInWishlist(
    productId
) {

    const id =
        Number(productId);


    return (
        Number.isFinite(id) &&
        wishlist.includes(id)
    );

}


/* ==========================================================
   WISHLIST TOGGLE
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

    return (
        wishlist.includes(id)
    );

}


/* ==========================================================
   WISHLIST BUTTON UPDATE
========================================================== */

function updateWishlistButton(
    button,
    productId
) {

    if (!button) {

        return;

    }


    const active =
        isInWishlist(
            productId
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
        "title",
        active
            ? "Wishlist থেকে বাদ দিন"
            : "Wishlist-এ রাখুন"
    );

}


/* ==========================================================
   UPDATE ALL WISHLIST BUTTONS
========================================================== */

function updateAllWishlistButtons() {

    $$(".wishlist-btn")
        .forEach(
            button => {

                updateWishlistButton(
                    button,
                    button.dataset.id
                );

            }
        );

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
    else {

        const possibleImages = [

            product.image,

            product.image1,

            product.image2,

            product.image3,

            product.image4,

            product.image5

        ];


        gallery =
            possibleImages;

    }


    return gallery
        .filter(
            image =>
                typeof image === "string" &&
                image.trim() !== ""
        )
        .map(
            image =>
                image.trim()
        );

}


/* ==========================================================
   GET PRODUCT BY ID
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
   GET CATEGORY BY ID
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
   CATEGORY NAME
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
            "অন্যান্য"
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
        "অন্যান্য"
    );

}


/* ==========================================================
   SUB-CATEGORY NAME
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

        const subCategory =
            category.subCategories.find(
                item => {

                    const id =
                        normalizeCategory(
                            item.id ||
                            item.slug ||
                            item.name
                        );


                    return (
                        id ===
                        normalizeCategory(
                            subCategoryId
                        )
                    );

                }
            );


        if (subCategory) {

            return (
                subCategory.name ||
                subCategory.title ||
                subCategory.id ||
                ""
            );

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
        product?.subCategory ||
        ""
    );

}


/* ==========================================================
   INITIALIZE CORE STATE
========================================================== */

function initializeCoreState() {

    loadWishlist();

    updateWishlistCounter();

}


/* ==========================================================
   CORE INITIALIZATION
========================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCoreState,
        {
            once: true
        }
    );

}
else {

    initializeCoreState();

}


/* ==========================================================
   PART 1 COMPLETE
========================================================== */

console.log(
    "🌱 Maliha Agro Industry — script.js Part 1/8 Ready"
);
