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

"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL A-Z VERSION
   PART 2/8
   PRODUCT LISTING SYSTEM
========================================================== */


/* ==========================================================
   ACTIVE CATEGORY
========================================================== */

function getActiveCategory() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const category =
        params.get("category");

    return normalizeCategory(
        category || ""
    );

}


/* ==========================================================
   ACTIVE SUB CATEGORY
========================================================== */

function getActiveSubCategory() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const subCategory =
        params.get("subcategory") ||
        params.get("subCategory");

    return normalizeCategory(
        subCategory || ""
    );

}


/* ==========================================================
   SET URL FILTER
========================================================== */

function setProductFilter(
    category = "",
    subCategory = ""
) {

    const url =
        new URL(
            window.location.href
        );


    category =
        normalizeCategory(
            category
        );


    subCategory =
        normalizeCategory(
            subCategory
        );


    if (category) {

        url.searchParams.set(
            "category",
            category
        );

    }
    else {

        url.searchParams.delete(
            "category"
        );

    }


    if (subCategory) {

        url.searchParams.set(
            "subcategory",
            subCategory
        );

    }
    else {

        url.searchParams.delete(
            "subcategory"
        );

    }


    window.history.pushState(
        {},
        "",
        url
    );

}


/* ==========================================================
   CATEGORY BUTTONS
========================================================== */

function renderCategoryButtons() {

    const container =
        $("#categoryButtons");


    if (!container) {

        return;

    }


    const activeCategory =
        getActiveCategory();


    const activeSubCategory =
        getActiveSubCategory();


    container.innerHTML = "";


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


    allButton.textContent =
        "🌿 সকল পণ্য";


    if (!activeCategory) {

        allButton.classList.add(
            "active"
        );

    }


    allButton.addEventListener(
        "click",
        () => {

            setProductFilter(
                "",
                ""
            );


            renderCategoryButtons();


            renderSubCategoryButtons(
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

            if (
                !category ||
                !category.id
            ) {

                return;

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
                normalizeCategory(
                    category.id
                );


            button.textContent =
                category.name ||
                category.title ||
                category.id;


            if (
                normalizeCategory(
                    category.id
                ) === activeCategory
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.addEventListener(
                "click",
                () => {

                    const categoryId =
                        normalizeCategory(
                            category.id
                        );


                    setProductFilter(
                        categoryId,
                        ""
                    );


                    renderCategoryButtons();


                    renderSubCategoryButtons(
                        categoryId
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

    renderSubCategoryButtons(
        activeCategory,
        activeSubCategory
    );

}


/* ==========================================================
   SUB CATEGORY BUTTONS
========================================================== */

function renderSubCategoryButtons(
    categoryId = "",
    activeSubCategory = ""
) {

    const container =
        $("#subCategoryButtons");


    if (!container) {

        return;

    }


    container.innerHTML = "";


    categoryId =
        normalizeCategory(
            categoryId
        );


    activeSubCategory =
        normalizeCategory(
            activeSubCategory
        );


    if (!categoryId) {

        return;

    }


    const category =
        findCategory(
            categoryId
        );


    if (
        !category ||
        !Array.isArray(
            category.subCategories
        ) ||
        !category.subCategories.length
    ) {

        return;

    }


    /* ==========================================
       ALL SUB CATEGORY
    ========================================== */

    const allButton =
        document.createElement(
            "button"
        );


    allButton.type =
        "button";


    allButton.className =
        "subcategory-btn";


    allButton.textContent =
        "সব";


    if (!activeSubCategory) {

        allButton.classList.add(
            "active"
        );

    }


    allButton.addEventListener(
        "click",
        () => {

            setProductFilter(
                categoryId,
                ""
            );


            renderSubCategoryButtons(
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
        allButton
    );


    /* ==========================================
       SUB CATEGORY LIST
    ========================================== */

    category.subCategories.forEach(
        subCategory => {

            if (
                !subCategory ||
                !subCategory.id
            ) {

                return;

            }


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "subcategory-btn";


            const subId =
                normalizeCategory(
                    subCategory.id
                );


            button.dataset.subcategory =
                subId;


            button.textContent =
                subCategory.name ||
                subCategory.title ||
                subCategory.id;


            if (
                subId ===
                activeSubCategory
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.addEventListener(
                "click",
                () => {

                    setProductFilter(
                        categoryId,
                        subId
                    );


                    renderSubCategoryButtons(
                        categoryId,
                        subId
                    );


                    loadProducts(
                        categoryId,
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
   PRODUCT SEARCH
========================================================== */

function initSearch() {

    const input =
        $("#searchProduct");


    if (!input) {

        return;

    }


    if (
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


    /* ==========================================
       SEARCH CLEAR BUTTON
    ========================================== */

    const clearButton =
        $("#clearSearch");


    if (
        clearButton &&
        !clearButton.dataset.bound
    ) {

        clearButton.dataset.bound =
            "true";


        clearButton.addEventListener(
            "click",
            () => {

                input.value =
                    "";


                loadProducts(
                    getActiveCategory(),
                    getActiveSubCategory()
                );


                input.focus();

            }
        );

    }

}


/* ==========================================================
   PRODUCT SORT
========================================================== */

function initSort() {

    const select =
        $("#sortProducts");


    if (!select) {

        return;

    }


    if (
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
   FILTER PRODUCTS
========================================================== */

function filterProducts(
    list,
    category = "",
    subCategory = "",
    search = ""
) {

    if (
        !Array.isArray(list)
    ) {

        return [];

    }


    category =
        normalizeCategory(
            category
        );


    subCategory =
        normalizeCategory(
            subCategory
        );


    search =
        String(
            search || ""
        )
            .trim()
            .toLowerCase();


    return list.filter(
        product => {

            if (!product) {

                return false;

            }


            /* ==================================
               CATEGORY FILTER
            ================================== */

            if (
                category &&
                normalizeCategory(
                    product.category
                ) !== category
            ) {

                return false;

            }


            /* ==================================
               SUB CATEGORY FILTER
            ================================== */

            if (
                subCategory &&
                normalizeCategory(
                    product.subCategory
                ) !== subCategory
            ) {

                return false;

            }


            /* ==================================
               SEARCH FILTER
            ================================== */

            if (search) {

                const searchableText = [

                    product.name,

                    product.brand,

                    product.description,

                    product.shortDescription,

                    product.sku,

                    product.type,

                    product.categoryName,

                    product.subCategoryName,

                    getCategoryName(
                        product.category
                    ),

                    getSubCategoryName(
                        product.category,
                        product.subCategory
                    )

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
    sortValue
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
            sortValue || "default"
        )
    ) {


        /* ==================================
           PRICE LOW TO HIGH
        ================================== */

        case "price-low":

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


        /* ==================================
           PRICE HIGH TO LOW
        ================================== */

        case "price-high":

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


        /* ==================================
           RATING
        ================================== */

        case "rating":

            result.sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        b.rating || 0
                    ) -
                    Number(
                        a.rating || 0
                    )
            );

            break;


        /* ==================================
           NEWEST
        ================================== */

        case "newest":

            result.sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        b.id || 0
                    ) -
                    Number(
                        a.id || 0
                    )
            );

            break;


        /* ==================================
           NAME A-Z
        ================================== */

        case "name-asc":

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


        /* ==================================
           DEFAULT
        ================================== */

        default:

            result.sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        a.id || 0
                    ) -
                    Number(
                        b.id || 0
                    )
            );

            break;

    }


    return result;

}


/* ==========================================================
   PRODUCT CARD
========================================================== */

function createProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    if (!product) {

        return card;

    }


    const gallery =
        getGallery(product);


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


    const isWishlisted =
        wishlist.includes(
            Number(
                product.id
            )
        );


    card.innerHTML = `

        <div
            class="product-image-wrap"
            style="
                position:relative;
            "
        >

            ${
                product.offer
                    ? `
                        <span
                            style="
                                position:absolute;
                                top:8px;
                                left:8px;
                                z-index:4;
                                background:#e53935;
                                color:#fff;
                                padding:4px 8px;
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
                discount > 0
                    ? `
                        <span
                            style="
                                position:absolute;
                                top:8px;
                                right:8px;
                                z-index:4;
                                background:#1F8F4D;
                                color:#fff;
                                padding:4px 7px;
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
                class="wishlist-btn ${
                    isWishlisted
                        ? "active"
                        : ""
                }"
                data-id="${escapeHTML(
                    product.id
                )}"
                aria-label="Wishlist"
                style="
                    position:absolute;
                    right:8px;
                    bottom:8px;
                    z-index:5;
                    width:38px;
                    height:38px;
                    border-radius:50%;
                    border:0;
                    background:#fff;
                    box-shadow:0 2px 8px rgba(0,0,0,.15);
                    cursor:pointer;
                    font-size:19px;
                "
            >
                ${
                    isWishlisted
                        ? "❤️"
                        : "🤍"
                }
            </button>


            <div
                class="slider"
                data-product-id="${escapeHTML(
                    product.id
                )}"
                style="
                    position:relative;
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
                }

            </div>

        </div>


        <div
            class="product-card-body"
            style="
                padding:12px;
            "
        >

            <div
                style="
                    color:#1F8F4D;
                    font-size:12px;
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
                        ? `
                            → ${escapeHTML(
                                subCategoryName
                            )}
                        `
                        : ""
                }
            </div>


            <h3
                style="
                    margin:5px 0;
                "
            >

                <a
                    href="product.html?id=${encodeURIComponent(
                        product.id
                    )}"
                    style="
                        text-decoration:none;
                        color:inherit;
                    "
                >
                    ${escapeHTML(
                        product.name ||
                        "পণ্য"
                    )}
                </a>

            </h3>


            <div
                style="
                    color:#e5a000;
                    font-size:13px;
                    margin:5px 0;
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
                    "
                >
                    (${Number(
                        product.reviewCount ||
                        0
                    )})
                </span>

            </div>


            <div
                style="
                    margin:7px 0;
                "
            >

                <strong
                    style="
                        color:#1F8F4D;
                        font-size:20px;
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
                                    text-decoration:line-through;
                                    font-size:12px;
                                    margin-left:5px;
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
                style="
                    color:#198754;
                    font-size:12px;
                    margin-bottom:9px;
                "
            >
                🟢 ${escapeHTML(
                    product.stock ||
                    "স্টকে আছে"
                )}
            </div>


            <a
                href="product.html?id=${encodeURIComponent(
                    product.id
                )}"
                class="btn"
                style="
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    text-decoration:none;
                "
            >
                👁️ বিস্তারিত দেখুন
            </a>

        </div>

    `;


    /* ==========================================
       WISHLIST EVENT
    ========================================== */

    const wishlistButton =
        card.querySelector(
            ".wishlist-btn"
        );


    if (wishlistButton) {

        wishlistButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                toggleWishlist(
                    product.id
                );

            }
        );

    }


    /* ==========================================
       IMAGE ERROR
    ========================================== */

    card.querySelectorAll(
        "img"
    ).forEach(
        image => {

            image.addEventListener(
                "error",
                () => {

                    image.classList.add(
                        "image-load-error"
                    );

                }
            );

        }
    );


    return card;

}


/* ==========================================================
   RENDER PRODUCT LIST
========================================================== */

function renderProductList(
    list
) {

    const container =
        $("#productList");


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
                    🔍
                </div>


                <h2>
                    কোনো পণ্য পাওয়া যায়নি
                </h2>


                <p
                    style="
                        color:#777;
                        margin-top:8px;
                    "
                >
                    আপনার অনুসন্ধান বা
                    নির্বাচিত ক্যাটাগরিতে
                    কোনো পণ্য পাওয়া যায়নি।
                </p>


                <button
                    type="button"
                    id="resetProducts"
                    class="btn"
                    style="
                        max-width:200px;
                        margin:15px auto 0;
                        border:0;
                        cursor:pointer;
                    "
                >
                    🔄 সব পণ্য দেখুন
                </button>

            </div>

        `;


        $("#resetProducts")
            ?.addEventListener(
                "click",
                () => {

                    resetProductSearch();

                }
            );


        return;

    }


    list.forEach(
        product => {

            container.appendChild(
                createProductCard(
                    product
                )
            );

        }
    );


    startSliders();

}


/* ==========================================================
   PRODUCT SUMMARY
========================================================== */

function updateProductSummary(
    count
) {

    const summary =
        $("#productSummary");


    if (!summary) {

        return;

    }


    summary.textContent =
        `মোট ${Number(
            count || 0
        )} টি পণ্য পাওয়া গেছে।`;

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


    try {

        /* ==========================================
           LOADING
        ========================================== */

        container.innerHTML = `

            <div
                class="card"
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:40px 20px;
                "
            >

                <div
                    style="
                        font-size:40px;
                        margin-bottom:10px;
                    "
                >
                    🌱
                </div>

                <p>
                    পণ্য লোড হচ্ছে...
                </p>

            </div>

        `;


        /* ==========================================
           LOAD DATA
        ========================================== */

        await ensureProductsLoaded();


        /* ==========================================
           FILTER VALUES
        ========================================== */

        category =
            normalizeCategory(
                category ||
                getActiveCategory()
            );


        subCategory =
            normalizeCategory(
                subCategory ||
                getActiveSubCategory()
            );


        const searchInput =
            $("#searchProduct");


        const search =
            searchInput?.value ||
            "";


        /* ==========================================
           FILTER
        ========================================== */

        let filtered =
            filterProducts(
                products,
                category,
                subCategory,
                search
            );


        /* ==========================================
           SORT
        ========================================== */

        const sortSelect =
            $("#sortProducts");


        filtered =
            sortProducts(
                filtered,
                sortSelect?.value ||
                "default"
            );


        /* ==========================================
           RENDER
        ========================================== */

        renderProductList(
            filtered
        );


        updateProductSummary(
            filtered.length
        );


        /* ==========================================
           ACTIVE CATEGORY UI
        ========================================== */

        $$(".category-btn")
            .forEach(
                button => {

                    const id =
                        normalizeCategory(
                            button.dataset.category ||
                            ""
                        );


                    button.classList.toggle(
                        "active",
                        id === category ||
                        (
                            !category &&
                            !id
                        )
                    );

                }
            );


        /* ==========================================
           ACTIVE SUB CATEGORY UI
        ========================================== */

        $$(".subcategory-btn")
            .forEach(
                button => {

                    const id =
                        normalizeCategory(
                            button.dataset.subcategory ||
                            ""
                        );


                    button.classList.toggle(
                        "active",
                        id === subCategory ||
                        (
                            !subCategory &&
                            !id
                        )
                    );

                }
            );


        console.log(
            "✅ Products Rendered:",
            filtered.length
        );

    }
    catch (error) {

        console.error(
            "❌ Product List Error:",
            error
        );


        container.innerHTML = `

            <div
                class="card"
                style="
                    grid-column:1/-1;
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
                    পণ্য লোড করা যায়নি
                </h2>


                <p
                    style="
                        color:#777;
                        line-height:1.7;
                        margin-top:8px;
                    "
                >
                    পণ্যের তথ্য লোড করতে
                    সমস্যা হয়েছে।
                    <br>
                    কিছুক্ষণ পর আবার চেষ্টা করুন।
                </p>


                <button
                    type="button"
                    id="retryProducts"
                    class="btn"
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


        $("#retryProducts")
            ?.addEventListener(
                "click",
                () => {

                    loadProducts(
                        getActiveCategory(),
                        getActiveSubCategory()
                    );

                }
            );

    }

}


/* ==========================================================
   PART 2 COMPLETE
========================================================== */

console.log(
    "📦 Part 2/8 — Product Listing System Loaded."
);

