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

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — PART 3/8

   PRODUCT DATA
   CATEGORY DATA
   DATA LOADING SYSTEM
   ========================================================== */


/* ==========================================================
   PRODUCT & CATEGORY DATA
========================================================== */

let products = [];

let categories = [];

let currentProduct = null;


/* ==========================================================
   DATA LOADING STATE
========================================================== */

let productsLoaded = false;

let categoriesLoaded = false;

let productsLoadingPromise = null;

let categoriesLoadingPromise = null;


/* ==========================================================
   DATA FILE PATH
========================================================== */

const PRODUCT_DATA_URL =
    "data/products.json";

const CATEGORY_DATA_URL =
    "data/categories.json";


/* ==========================================================
   FETCH PRODUCTS
========================================================== */

async function fetchProducts() {

    try {

        const response =
            await fetch(
                PRODUCT_DATA_URL,
                {
                    cache: "no-store"
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


        /*
           যদি JSON-এর মধ্যে products
           নামে array থাকে
        */

        if (
            data &&
            Array.isArray(
                data.products
            )
        ) {

            return data.products;

        }


        return [];

    }
    catch (error) {

        console.error(
            "❌ Fetch Products Error:",
            error
        );


        throw error;

    }

}


/* ==========================================================
   FETCH CATEGORIES
========================================================== */

async function fetchCategories() {

    try {

        const response =
            await fetch(
                CATEGORY_DATA_URL,
                {
                    cache: "no-store"
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


        /*
           যদি JSON-এর মধ্যে categories
           নামে array থাকে
        */

        if (
            data &&
            Array.isArray(
                data.categories
            )
        ) {

            return data.categories;

        }


        return [];

    }
    catch (error) {

        console.error(
            "❌ Fetch Categories Error:",
            error
        );


        throw error;

    }

}


/* ==========================================================
   NORMALIZE PRODUCT
========================================================== */

function normalizeProduct(
    product
) {

    if (
        !product ||
        typeof product !== "object"
    ) {

        return null;

    }


    const normalized =
        {
            ...product
        };


    /*
       Product ID
    */

    normalized.id =
        Number(
            product.id
        );


    /*
       Basic Text
    */

    normalized.name =
        String(
            product.name ||
            "পণ্য"
        ).trim();


    normalized.description =
        String(
            product.description ||
            ""
        ).trim();


    normalized.shortDescription =
        String(
            product.shortDescription ||
            ""
        ).trim();


    normalized.brand =
        String(
            product.brand ||
            ""
        ).trim();


    normalized.sku =
        String(
            product.sku ||
            ""
        ).trim();


    normalized.type =
        String(
            product.type ||
            ""
        ).trim();


    /*
       Category
    */

    normalized.category =
        String(
            product.category ||
            ""
        ).trim();


    normalized.subCategory =
        String(
            product.subCategory ||
            ""
        ).trim();


    normalized.categoryName =
        String(
            product.categoryName ||
            ""
        ).trim();


    normalized.subCategoryName =
        String(
            product.subCategoryName ||
            ""
        ).trim();


    /*
       Price
    */

    normalized.price =
        Number(
            product.price || 0
        );


    normalized.oldPrice =
        Number(
            product.oldPrice || 0
        );


    /*
       Rating
    */

    normalized.rating =
        Math.max(
            0,
            Math.min(
                5,
                Number(
                    product.rating || 0
                )
            )
        );


    normalized.reviewCount =
        Number(
            product.reviewCount || 0
        );


    /*
       Stock
    */

    normalized.stock =
        String(
            product.stock ||
            "স্টকে আছে"
        ).trim();


    /*
       Boolean Values
    */

    normalized.offer =
        Boolean(
            product.offer
        );


    normalized.newArrival =
        Boolean(
            product.newArrival
        );


    normalized.bestSeller =
        Boolean(
            product.bestSeller
        );


    /*
       Gallery
    */

    if (
        Array.isArray(
            product.images
        )
    ) {

        normalized.images =
            product.images
                .filter(Boolean)
                .map(
                    image =>
                        String(
                            image
                        ).trim()
                );

    }
    else {

        normalized.images =
            [];

    }


    return normalized;

}


/* ==========================================================
   NORMALIZE CATEGORY
========================================================== */

function normalizeCategoryData(
    category
) {

    if (
        !category ||
        typeof category !== "object"
    ) {

        return null;

    }


    const normalized =
        {
            ...category
        };


    normalized.id =
        String(
            category.id ||
            category.slug ||
            category.name ||
            ""
        ).trim();


    normalized.name =
        String(
            category.name ||
            category.title ||
            category.id ||
            "অন্যান্য"
        ).trim();


    /*
       Sub Categories
    */

    if (
        Array.isArray(
            category.subCategories
        )
    ) {

        normalized.subCategories =
            category.subCategories
                .filter(Boolean)
                .map(
                    subCategory => {

                        if (
                            typeof subCategory ===
                            "string"
                        ) {

                            return {

                                id:
                                    subCategory,

                                name:
                                    subCategory

                            };

                        }


                        return {

                            ...subCategory,

                            id:
                                String(
                                    subCategory.id ||
                                    subCategory.slug ||
                                    subCategory.name ||
                                    ""
                                ).trim(),

                            name:
                                String(
                                    subCategory.name ||
                                    subCategory.title ||
                                    subCategory.id ||
                                    "অন্যান্য"
                                ).trim()

                        };

                    }
                );

    }
    else {

        normalized.subCategories =
            [];

    }


    return normalized;

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
                        data
                            .map(
                                normalizeProduct
                            )
                            .filter(
                                Boolean
                            );


                    productsLoaded =
                        true;


                    console.log(
                        "✅ Products Loaded:",
                        products.length
                    );


                    return products;

                }
            )
            .catch(
                error => {

                    productsLoaded =
                        false;


                    products =
                        [];


                    console.error(
                        "❌ Products Loading Failed:",
                        error
                    );


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
                            .map(
                                normalizeCategoryData
                            )
                            .filter(
                                Boolean
                            );


                    categoriesLoaded =
                        true;


                    console.log(
                        "✅ Categories Loaded:",
                        categories.length
                    );


                    return categories;

                }
            )
            .catch(
                error => {

                    categoriesLoaded =
                        false;


                    categories =
                        [];


                    console.warn(
                        "⚠️ Categories JSON পাওয়া যায়নি। Product data থেকে category তৈরি করা যাবে।"
                    );


                    return [];

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
   FIND PRODUCT
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
   FIND CATEGORY
========================================================== */

function findCategory(
    categoryId
) {

    const target =
        normalizeCategory(
            categoryId
        );


    if (!target) {

        return null;

    }


    return (
        categories.find(
            category => {

                return (
                    normalizeCategory(
                        category.id
                    ) === target
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


    if (
        category
    ) {

        return (
            category.name ||
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
        String(
            categoryId ||
            "অন্যান্য"
        )
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
        category &&
        Array.isArray(
            category.subCategories
        )
    ) {

        const target =
            normalizeCategory(
                subCategoryId
            );


        const subCategory =
            category.subCategories.find(
                item =>
                    normalizeCategory(
                        item.id
                    ) === target
            );


        if (
            subCategory
        ) {

            return (
                subCategory.name ||
                "অন্যান্য"
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
                )

                &&

                normalizeCategory(
                    item.subCategory
                ) ===
                normalizeCategory(
                    subCategoryId
                )
        );


    return (
        product?.subCategoryName ||
        String(
            subCategoryId ||
            ""
        )
    );

}


/* ==========================================================
   GET PRODUCT GALLERY
========================================================== */

function getGallery(
    product
) {

    if (
        !product
    ) {

        return [];

    }


    /*
       images array
    */

    if (
        Array.isArray(
            product.images
        )
    ) {

        const gallery =
            product.images
                .filter(Boolean)
                .map(
                    image =>
                        String(
                            image
                        ).trim()
                )
                .filter(Boolean);


        if (
            gallery.length
        ) {

            return gallery;

        }

    }


    /*
       gallery array
    */

    if (
        Array.isArray(
            product.gallery
        )
    ) {

        return product.gallery
            .filter(Boolean)
            .map(
                image =>
                    String(
                        image
                    ).trim()
            )
            .filter(Boolean);

    }


    /*
       single image
    */

    if (
        product.image
    ) {

        return [
            String(
                product.image
            ).trim()
        ];

    }


    return [];

}


/* ==========================================================
   PRODUCT DATA READY
========================================================== */

console.log(
    "📦 Part 3/8 — Product & Category Data System Loaded."
);

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — PART 4/8

   PRODUCT CARD
   PRODUCT LIST RENDER
   PRODUCT FILTER
   PRODUCT SORT
   ========================================================== */


/* ==========================================================
   CREATE PRODUCT CARD
========================================================== */

function createProductCard(product) {

    if (!product) {

        return null;

    }


    const id =
        Number(
            product.id
        );


    if (
        !Number.isFinite(id)
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
            : [""];


    const price =
        Number(
            product.price || 0
        );


    const oldPrice =
        Number(
            product.oldPrice || 0
        );


    /* ======================================================
       DISCOUNT
    ====================================================== */

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
       CARD
    ====================================================== */

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    card.dataset.id =
        String(id);


    card.dataset.category =
        normalizeCategory(
            product.category
        );


    card.dataset.subcategory =
        normalizeCategory(
            product.subCategory
        );


    /* ======================================================
       CARD HTML
    ====================================================== */

    card.innerHTML = `

        <div
            class="product-card-inner"
        >

            <!-- ==========================================
                 IMAGE AREA
            =========================================== -->

            <div
                class="product-card-image"
            >

                <!-- OFFER -->

                ${
                    product.offer
                        ?

                    `
                        <span
                            class="product-badge offer-badge"
                        >
                            🔥 অফার
                        </span>
                    `

                        :

                    ""
                }


                <!-- NEW ARRIVAL -->

                ${
                    product.newArrival
                        ?

                    `
                        <span
                            class="product-badge new-badge"
                        >
                            🆕 নতুন
                        </span>
                    `

                        :

                    ""
                }


                <!-- BEST SELLER -->

                ${
                    product.bestSeller
                        ?

                    `
                        <span
                            class="product-badge best-badge"
                        >
                            ⭐ বেস্ট সেলার
                        </span>
                    `

                        :

                    ""
                }


                <!-- DISCOUNT -->

                ${
                    discount > 0
                        ?

                    `
                        <span
                            class="product-badge discount-badge"
                        >
                            ${discount}% OFF
                        </span>
                    `

                        :

                    ""
                }


                <!-- WISHLIST -->

                <button
                    type="button"
                    class="wishlist-btn"
                    data-id="${id}"
                    aria-label="Wishlist"
                    aria-pressed="false"
                >
                    🤍
                </button>


                <!-- IMAGE SLIDER -->

                <div
                    class="slider"
                    data-product-id="${id}"
                >

                    ${
                        images
                            .map(
                                (
                                    src,
                                    index
                                ) => `

                                    <img
                                        src="${escapeHTML(
                                            src
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


            <!-- ==========================================
                 PRODUCT CONTENT
            =========================================== -->

            <div
                class="product-card-content"
            >

                <!-- CATEGORY -->

                <div
                    class="product-category"
                >

                    ${escapeHTML(
                        categoryName ||
                        "অন্যান্য"
                    )}

                    ${
                        subCategoryName
                            ?

                        `
                            <span>
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
                    class="product-title"
                >

                    <a
                        href="product.html?id=${encodeURIComponent(
                            id
                        )}"
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
                            class="product-brand"
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
                    class="product-rating"
                >

                    <span>
                        ${
                            "⭐".repeat(
                                rating
                            )
                        }${
                            "☆".repeat(
                                5 - rating
                            )
                        }
                    </span>

                    <small>
                        (${reviewCount})
                    </small>

                </div>


                <!-- SHORT DESCRIPTION -->

                ${
                    product.shortDescription
                        ?

                    `
                        <p
                            class="product-short-description"
                        >
                            ${escapeHTML(
                                product.shortDescription
                            )}
                        </p>
                    `

                        :

                    ""
                }


                <!-- PRICE -->

                <div
                    class="product-price-area"
                >

                    <strong
                        class="product-price"
                    >
                        ${formatPrice(
                            price
                        )}
                    </strong>


                    ${
                        oldPrice > price
                            ?

                        `
                            <span
                                class="product-old-price"
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
                    class="product-stock"
                >

                    🟢 ${escapeHTML(
                        product.stock ||
                        "স্টকে আছে"
                    )}

                </div>


                <!-- ACTION BUTTONS -->

                <div
                    class="product-actions"
                >

                    <a
                        href="product.html?id=${encodeURIComponent(
                            id
                        )}"
                        class="btn product-details-btn"
                    >
                        👁️ বিস্তারিত
                    </a>


                    <a
                        href="#"
                        class="btn product-whatsapp-btn"
                        data-id="${id}"
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


    if (
        wishlistButton
    ) {

        updateWishlistButton(
            wishlistButton,
            id
        );


        wishlistButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                toggleWishlist(
                    id
                );


                updateWishlistButton(
                    wishlistButton,
                    id
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


    if (
        whatsappButton
    ) {

        whatsappButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                const productId =
                    Number(
                        whatsappButton.dataset.id
                    );


                const selectedProduct =
                    findProduct(
                        productId
                    );


                if (
                    selectedProduct
                ) {

                    openWhatsAppOrder(
                        selectedProduct
                    );

                }

            }
        );

    }


    return card;

}


/* ==========================================================
   RENDER PRODUCT LIST
========================================================== */

function renderProducts(
    list,
    container
) {

    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    /* ======================================================
       EMPTY RESULT
    ====================================================== */

    if (
        !Array.isArray(list) ||
        !list.length
    ) {

        container.innerHTML = `

            <div
                class="card product-empty-state"
            >

                <div
                    class="empty-icon"
                >
                    🌱
                </div>


                <h2>
                    কোনো পণ্য পাওয়া যায়নি
                </h2>


                <p>
                    আপনার অনুসন্ধান বা
                    নির্বাচিত ক্যাটাগরির সাথে
                    মিল থাকা কোনো পণ্য নেই।
                </p>


                <button
                    type="button"
                    id="resetProductSearchBtn"
                    class="btn"
                >
                    🔄 ফিল্টার রিসেট করুন
                </button>

            </div>

        `;


        const resetButton =
            $(
                "#resetProductSearchBtn"
            );


        resetButton
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


            if (
                card
            ) {

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
       WISHLIST
    ====================================================== */

    updateWishlistCounter();


    /* ======================================================
       SLIDERS
    ====================================================== */

    startSliders();

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

            if (
                !product
            ) {

                return false;

            }


            /* ==========================================
               CATEGORY
            =========================================== */

            if (
                normalizedCategory &&
                normalizeCategory(
                    product.category
                ) !==
                normalizedCategory
            ) {

                return false;

            }


            /* ==========================================
               SUB CATEGORY
            =========================================== */

            if (
                normalizedSubCategory &&
                normalizeCategory(
                    product.subCategory
                ) !==
                normalizedSubCategory
            ) {

                return false;

            }


            /* ==========================================
               SEARCH
            =========================================== */

            if (
                search
            ) {

                const searchableText =
                    [

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
    sortType = "default"
) {

    if (
        !Array.isArray(list)
    ) {

        return [];

    }


    const result =
        [...list];


    switch (
        String(
            sortType || "default"
        )
            .trim()
            .toLowerCase()
    ) {


        /* ==========================================
           PRICE LOW → HIGH
        =========================================== */

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
                    ) -

                    Number(
                        b.price || 0
                    )
            );

            break;


        /* ==========================================
           PRICE HIGH → LOW
        =========================================== */

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
                    ) -

                    Number(
                        a.price || 0
                    )
            );

            break;


        /* ==========================================
           RATING
        =========================================== */

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


        /* ==========================================
           NEWEST
        =========================================== */

        case "newest":

        case "new":

        case "latest":

            result.sort(
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
                       যদি date না থাকে,
                       ID দিয়ে fallback
                    */

                    if (
                        dateA ===
                        dateB
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


        /* ==========================================
           NAME A-Z
        =========================================== */

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
                    ).localeCompare(
                        String(
                            b.name || ""
                        ),
                        "bn"
                    )
            );

            break;


        /* ==========================================
           DEFAULT
        =========================================== */

        default:

            break;

    }


    return result;

}


/* ==========================================================
   PRODUCT RESULT COUNT
========================================================== */

function updateProductResultCount(
    count
) {

    const value =
        Number(
            count
        ) || 0;


    const elements =
        [

            $("#productResultCount"),

            $("#productCount"),

            $("#resultCount"),

            $("#productsCount"),

            $("#searchResultCount")

        ];


    elements.forEach(
        element => {

            if (
                !element
            ) {

                return;

            }


            element.textContent =
                `${value} টি পণ্য`;

        }
    );

}


/* ==========================================================
   PART 4 COMPLETE
========================================================== */

console.log(
    "🛍️ Part 4/8 — Product Card & Product Rendering System Loaded."
);

