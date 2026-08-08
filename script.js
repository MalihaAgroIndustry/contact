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

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL VERSION
   PART 2/8

   PRODUCT DATA
   CATEGORY DATA
   JSON LOADER
   DATA NORMALIZATION
========================================================== */


/* ==========================================================
   FETCH JSON HELPER
========================================================== */

async function fetchJSON(
    url
) {

    const response =
        await fetch(
            url,
            {
                cache: "no-store"
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `HTTP ${response.status} — ${url}`
        );

    }


    const data =
        await response.json();


    return data;

}


/* ==========================================================
   NORMALIZE PRODUCT
========================================================== */

function normalizeProduct(
    product,
    index = 0
) {

    if (
        !product ||
        typeof product !== "object"
    ) {

        return null;

    }


    const id =
        Number(
            product.id
        );


    const safeId =
        Number.isFinite(id) &&
        id > 0

            ? id

            : index + 1;


    const category =
        normalizeCategory(
            product.category ||
            product.categoryId ||
            ""
        );


    const subCategory =
        normalizeCategory(
            product.subCategory ||
            product.subcategory ||
            product.subCategoryId ||
            ""
        );


    const images =
        getGallery(
            product
        );


    const normalized = {

        ...product,

        id:
            safeId,


        name:
            toText(
                product.name ||
                product.title ||
                "পণ্য"
            ).trim(),


        category:
            category,


        subCategory:
            subCategory,


        categoryName:
            toText(
                product.categoryName ||
                product.categoryTitle ||
                ""
            ).trim(),


        subCategoryName:
            toText(
                product.subCategoryName ||
                product.subcategoryName ||
                ""
            ).trim(),


        description:
            toText(
                product.description ||
                ""
            ).trim(),


        shortDescription:
            toText(
                product.shortDescription ||
                product.short_description ||
                product.description ||
                ""
            ).trim(),


        brand:
            toText(
                product.brand ||
                SITE_CONFIG.productBrand
            ).trim(),


        sku:
            toText(
                product.sku ||
                ""
            ).trim(),


        type:
            toText(
                product.type ||
                ""
            ).trim(),


        price:
            toNumber(
                product.price,
                0
            ),


        oldPrice:
            toNumber(
                product.oldPrice ||
                product.old_price,
                0
            ),


        rating:
            Math.max(
                0,
                Math.min(
                    5,
                    toNumber(
                        product.rating,
                        0
                    )
                )
            ),


        reviewCount:
            Math.max(
                0,
                toNumber(
                    product.reviewCount ||
                    product.review_count,
                    0
                )
            ),


        stock:
            toText(
                product.stock ||
                "স্টকে আছে"
            ).trim(),


        offer:
            Boolean(
                product.offer
            ),


        newArrival:
            Boolean(
                product.newArrival ||
                product.new_arrival
            ),


        bestSeller:
            Boolean(
                product.bestSeller ||
                product.best_seller
            ),


        images:
            images

    };


    /*
       প্রথম image আলাদা property
       হিসেবেও রাখা হচ্ছে।
    */

    normalized.image =
        images[0] ||
        toText(
            product.image ||
            ""
        ).trim();


    return normalized;

}


/* ==========================================================
   NORMALIZE PRODUCT DATA
========================================================== */

function normalizeProductData(
    data
) {

    let list = [];


    /*
       JSON যদি সরাসরি Array হয়
    */

    if (
        Array.isArray(data)
    ) {

        list =
            data;

    }


    /*
       JSON যদি { products: [] } হয়
    */

    else if (
        Array.isArray(
            data?.products
        )
    ) {

        list =
            data.products;

    }


    /*
       JSON যদি { data: [] } হয়
    */

    else if (
        Array.isArray(
            data?.data
        )
    ) {

        list =
            data.data;

    }


    if (
        !Array.isArray(list)
    ) {

        return [];

    }


    return list
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
        .filter(
            Boolean
        );

}


/* ==========================================================
   NORMALIZE CATEGORY
========================================================== */

function normalizeCategoryObject(
    category,
    index = 0
) {

    if (
        !category ||
        typeof category !== "object"
    ) {

        return null;

    }


    const rawId =
        category.id ||
        category.slug ||
        category.name ||
        category.title ||
        `category-${index + 1}`;


    const id =
        normalizeCategory(
            rawId
        );


    if (!id) {

        return null;

    }


    let subCategories =
        category.subCategories;


    if (
        !Array.isArray(
            subCategories
        )
    ) {

        subCategories =
            category.subcategories;

    }


    if (
        !Array.isArray(
            subCategories
        )
    ) {

        subCategories =
            [];

    }


    subCategories =
        subCategories
            .map(
                (
                    item,
                    subIndex
                ) => {

                    if (
                        typeof item ===
                        "string"
                    ) {

                        const subId =
                            normalizeCategory(
                                item
                            );


                        if (!subId) {

                            return null;

                        }


                        return {

                            id:
                                subId,

                            name:
                                item

                        };

                    }


                    if (
                        !item ||
                        typeof item !==
                        "object"
                    ) {

                        return null;

                    }


                    const subRawId =
                        item.id ||
                        item.slug ||
                        item.name ||
                        item.title ||
                        `subcategory-${subIndex + 1}`;


                    const subId =
                        normalizeCategory(
                            subRawId
                        );


                    if (!subId) {

                        return null;

                    }


                    return {

                        ...item,

                        id:
                            subId,

                        name:
                            toText(
                                item.name ||
                                item.title ||
                                item.id ||
                                "অন্যান্য"
                            ).trim()

                    };

                }
            )
            .filter(
                Boolean
            );


    return {

        ...category,

        id:
            id,

        name:
            toText(
                category.name ||
                category.title ||
                category.id ||
                "অন্যান্য"
            ).trim(),

        subCategories:
            subCategories

    };

}


/* ==========================================================
   NORMALIZE CATEGORY DATA
========================================================== */

function normalizeCategoryData(
    data
) {

    let list = [];


    /*
       JSON যদি Array হয়
    */

    if (
        Array.isArray(data)
    ) {

        list =
            data;

    }


    /*
       JSON যদি { categories: [] } হয়
    */

    else if (
        Array.isArray(
            data?.categories
        )
    ) {

        list =
            data.categories;

    }


    /*
       JSON যদি { data: [] } হয়
    */

    else if (
        Array.isArray(
            data?.data
        )
    ) {

        list =
            data.data;

    }


    if (
        !Array.isArray(list)
    ) {

        return [];

    }


    return list
        .map(
            (
                category,
                index
            ) =>
                normalizeCategoryObject(
                    category,
                    index
                )
        )
        .filter(
            Boolean
        );

}


/* ==========================================================
   FETCH PRODUCTS
========================================================== */

async function fetchProducts() {

    try {

        const data =
            await fetchJSON(
                SITE_CONFIG.productsFile
            );


        const normalized =
            normalizeProductData(
                data
            );


        products =
            normalized;


        productsLoaded =
            true;


        console.log(
            "✅ Products Loaded:",
            products.length
        );


        return products;

    }
    catch (error) {

        productsLoaded =
            false;


        console.error(
            "❌ Products JSON Error:",
            error
        );


        products =
            [];


        throw error;

    }

}


/* ==========================================================
   FETCH CATEGORIES
========================================================== */

async function fetchCategories() {

    try {

        const data =
            await fetchJSON(
                SITE_CONFIG.categoriesFile
            );


        const normalized =
            normalizeCategoryData(
                data
            );


        categories =
            normalized;


        categoriesLoaded =
            true;


        console.log(
            "✅ Categories Loaded:",
            categories.length
        );


        return categories;

    }
    catch (error) {

        categoriesLoaded =
            false;


        console.warn(
            "⚠️ Categories JSON পাওয়া যায়নি:",
            error
        );


        categories =
            [];


        /*
           Category JSON না থাকলেও
           Product data থেকে পরে
           category তৈরি করা যাবে।
        */

        return categories;

    }

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


    return await fetchProducts();

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


    return await fetchCategories();

}


/* ==========================================================
   BUILD CATEGORIES FROM PRODUCTS
========================================================== */

function buildCategoriesFromProducts() {

    if (
        !Array.isArray(products) ||
        !products.length
    ) {

        return [];

    }


    const categoryMap =
        new Map();


    products.forEach(
        product => {

            if (!product) {

                return;

            }


            const categoryId =
                normalizeCategory(
                    product.category
                );


            if (!categoryId) {

                return;

            }


            if (
                !categoryMap.has(
                    categoryId
                )
            ) {

                categoryMap.set(
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
                categoryMap.get(
                    categoryId
                );


            const subCategoryId =
                normalizeCategory(
                    product.subCategory
                );


            if (
                !subCategoryId
            ) {

                return;

            }


            const exists =
                category.subCategories
                    .some(
                        item =>
                            normalizeCategory(
                                item.id
                            ) ===
                            subCategoryId
                    );


            if (
                !exists
            ) {

                category.subCategories.push({

                    id:
                        subCategoryId,

                    name:
                        product.subCategoryName ||
                        product.subCategory ||
                        "অন্যান্য"

                });

            }

        }
    );


    return Array.from(
        categoryMap.values()
    );

}


/* ==========================================================
   ENSURE COMPLETE CATEGORY SYSTEM
========================================================== */

async function ensureCategorySystem() {

    await ensureProductsLoaded();

    await ensureCategoriesLoaded();


    /*
       categories.json না থাকলে
       products.json থেকে তৈরি হবে।
    */

    if (
        !categories.length
    ) {

        categories =
            buildCategoriesFromProducts();

    }


    return categories;

}


/* ==========================================================
   PART 2 COMPLETE
========================================================== */

console.log(
    "📦 Maliha Agro Industry — script.js Part 2/8 Ready"
);

