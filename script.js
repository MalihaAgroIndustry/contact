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

"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL A-Z VERSION
   PART 3/8

   PRODUCT DETAIL CONTROLS
   GALLERY
   QUANTITY
   WHATSAPP ORDER
   SHARE
   DETAIL WISHLIST
========================================================== */


/* ==========================================================
   PRODUCT DETAIL CONTROLS
========================================================== */

function initProductDetailControls() {

    if (!currentProduct) {
        return;
    }


    /* ==========================================
       RESET DETAIL SLIDER
    ========================================== */

    detailSliderIndex = 0;


    /* ==========================================
       GALLERY
    ========================================== */

    initDetailGallery();


    /* ==========================================
       QUANTITY
    ========================================== */

    initQuantity();


    /* ==========================================
       ORDER BUTTON
    ========================================== */

    initOrderButton();


    /* ==========================================
       SHARE
    ========================================== */

    initShareProduct();


    /* ==========================================
       WISHLIST
    ========================================== */

    initDetailWishlist();


    /* ==========================================
       IMAGE PREVIEW
    ========================================== */

    initImagePreview();


    console.log(
        "✅ Product detail controls initialized."
    );

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


    /* ==========================================
       SHOW IMAGE
    ========================================== */

    function showImage(index) {

        if (!images.length) {
            return;
        }


        if (index < 0) {

            index =
                images.length - 1;

        }


        if (
            index >=
            images.length
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


    /* ==========================================
       PREVIOUS
    ========================================== */

    if (
        previous &&
        !previous.dataset.bound
    ) {

        previous.dataset.bound =
            "true";


        previous.addEventListener(
            "click",
            event => {

                event.preventDefault();


                showImage(
                    detailSliderIndex - 1
                );

            }
        );

    }


    /* ==========================================
       NEXT
    ========================================== */

    if (
        next &&
        !next.dataset.bound
    ) {

        next.dataset.bound =
            "true";


        next.addEventListener(
            "click",
            event => {

                event.preventDefault();


                showImage(
                    detailSliderIndex + 1
                );

            }
        );

    }


    /* ==========================================
       IMAGE CLICK
    ========================================== */

    images.forEach(
        image => {

            if (
                !image.dataset.modalBound
            ) {

                image.dataset.modalBound =
                    "true";


                image.addEventListener(
                    "click",
                    () => {

                        if (
                            image.src
                        ) {

                            openImageModal(
                                image.src
                            );

                        }

                    }
                );

            }


            /* ==================================
               IMAGE ERROR
            ================================== */

            if (
                !image.dataset.errorBound
            ) {

                image.dataset.errorBound =
                    "true";


                image.addEventListener(
                    "error",
                    () => {

                        image.style.display =
                            "none";

                    }
                );

            }

        }
    );


    /* ==========================================
       INITIAL IMAGE
    ========================================== */

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


    /* ==========================================
       UPDATE QUANTITY
    ========================================== */

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
                currentProduct.price ||
                0
            );


        const totalPrice =
            price *
            quantity;


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


    /* ==========================================
       PLUS
    ========================================== */

    if (
        plus &&
        !plus.dataset.bound
    ) {

        plus.dataset.bound =
            "true";


        plus.addEventListener(
            "click",
            event => {

                event.preventDefault();


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


    /* ==========================================
       MINUS
    ========================================== */

    if (
        minus &&
        !minus.dataset.bound
    ) {

        minus.dataset.bound =
            "true";


        minus.addEventListener(
            "click",
            event => {

                event.preventDefault();


                let current =
                    Number(
                        input.value
                    ) || 1;


                if (
                    current > 1
                ) {

                    current -= 1;

                }


                input.value =
                    current;


                updateQuantity();

            }
        );

    }


    /* ==========================================
       MANUAL INPUT
    ========================================== */

    if (
        !input.dataset.bound
    ) {

        input.dataset.bound =
            "true";


        input.addEventListener(
            "input",
            updateQuantity
        );


        input.addEventListener(
            "change",
            updateQuantity
        );

    }


    /* ==========================================
       INITIAL VALUE
    ========================================== */

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
            parseInt(
                quantity,
                10
            ) || 1
        );


    const price =
        Number(
            currentProduct.price ||
            0
        );


    const total =
        price *
        quantity;


    /* ==========================================
       CATEGORY
    ========================================== */

    const categoryName =
        currentProduct.categoryName ||
        getCategoryName(
            currentProduct.category
        );


    /* ==========================================
       SUB CATEGORY
    ========================================== */

    const subCategoryName =
        currentProduct.subCategoryName ||
        getSubCategoryName(
            currentProduct.category,
            currentProduct.subCategory
        );


    /* ==========================================
       PRODUCT DATA
    ========================================== */

    const productName =
        currentProduct.name ||
        "পণ্য";


    const sku =
        currentProduct.sku ||
        "-";


    const weight =
        currentProduct.weight ||
        "-";


    /* ==========================================
       WHATSAPP MESSAGE
    ========================================== */

    const message =

`🌿 ${SITE_CONFIG.companyName}

আসসালামু আলাইকুম।
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

⚖️ ওজন:
${weight}

💰 একক মূল্য:
${formatPrice(price)}

🔢 পরিমাণ:
${quantity}

💵 মোট মূল্য:
${formatPrice(total)}

━━━━━━━━━━━━━━━━━━

🔗 পণ্যের লিংক:
${window.location.href}

দয়া করে অর্ডারটি গ্রহণ করার জন্য আমার সাথে যোগাযোগ করুন।

ধন্যবাদ।
🌱 ${SITE_CONFIG.companyName}`;


    /* ==========================================
       CREATE LINK
    ========================================== */

    const whatsappURL =
        "https://wa.me/" +
        SITE_CONFIG.whatsapp +
        "?text=" +
        encodeURIComponent(
            message
        );


    button.href =
        whatsappURL;


    button.target =
        "_blank";


    button.rel =
        "noopener noreferrer";


    /* ==========================================
       STORE MESSAGE
    ========================================== */

    button.dataset.orderMessage =
        message;

}


/* ==========================================================
   ORDER BUTTON INITIALIZATION
========================================================== */

function initOrderButton() {

    const button =
        $("#orderNow");


    const input =
        $("#qty");


    if (
        !button ||
        !currentProduct
    ) {

        return;

    }


    updateOrderLink(
        Number(
            input?.value ||
            1
        )
    );


    /* ==========================================
       PREVENT EMPTY LINK
    ========================================== */

    if (
        !button.dataset.clickBound
    ) {

        button.dataset.clickBound =
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
                    Number(
                        input?.value ||
                        1
                    );


                updateOrderLink(
                    quantity
                );

            }
        );

    }

}


/* ==========================================================
   SHARE PRODUCT
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

            const productName =
                currentProduct.name ||
                "পণ্য";


            const shareData = {

                title:
                    productName +
                    " | " +
                    SITE_CONFIG.companyName,


                text:
                    currentProduct.shortDescription ||
                    currentProduct.description ||
                    (
                        "🌱 " +
                        SITE_CONFIG.companyName +
                        " — " +
                        productName
                    ),


                url:
                    window.location.href

            };


            try {

                /* ==================================
                   NATIVE SHARE
                ================================== */

                if (
                    typeof navigator.share ===
                    "function"
                ) {

                    await navigator.share(
                        shareData
                    );


                    return;

                }


                /* ==================================
                   CLIPBOARD
                ================================== */

                if (
                    navigator.clipboard &&
                    typeof navigator.clipboard.writeText ===
                    "function"
                ) {

                    await navigator.clipboard.writeText(
                        window.location.href
                    );


                    showTemporaryMessage(
                        "✅ পণ্যের লিংক কপি হয়েছে।"
                    );


                    return;

                }


                /* ==================================
                   FALLBACK
                ================================== */

                window.prompt(
                    "🔗 পণ্যের লিংক কপি করুন:",
                    window.location.href
                );

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
   TEMPORARY MESSAGE
========================================================== */

function showTemporaryMessage(
    message,
    duration = 2500
) {

    const existing =
        $("#temporaryMessage");


    if (existing) {

        existing.remove();

    }


    const element =
        document.createElement(
            "div"
        );


    element.id =
        "temporaryMessage";


    element.textContent =
        message;


    element.style.cssText = `

        position:fixed;

        left:50%;

        bottom:25px;

        transform:translateX(-50%);

        z-index:99999;

        background:#1F8F4D;

        color:#fff;

        padding:10px 18px;

        border-radius:30px;

        box-shadow:
            0 5px 20px
            rgba(0,0,0,.20);

        font-size:14px;

        font-weight:600;

        max-width:90%;

        text-align:center;

    `;


    document.body.appendChild(
        element
    );


    setTimeout(
        () => {

            element.remove();

        },
        duration
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


    /* ==========================================
       UPDATE BUTTON
    ========================================== */

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


        button.setAttribute(
            "aria-pressed",
            active
                ? "true"
                : "false"
        );

    }


    /* ==========================================
       CLICK
    ========================================== */

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();


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


    let startX = 0;

    let endX = 0;


    slider.addEventListener(
        "touchstart",
        event => {

            startX =
                event.touches[0]?.clientX ||
                0;

        },
        {
            passive:true
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
            passive:true
        }
    );

}


/* ==========================================================
   DETAIL CONTROL PATCH
========================================================== */

function initProductDetailFinalPatch() {

    if (!currentProduct) {

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


    const gallery =
        getGallery(product);


    const images =
        gallery.length
            ? gallery
            : [""];


    const price =
        Number(product.price || 0);


    const oldPrice =
        Number(product.oldPrice || 0);


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
                 WISHLIST
            =========================================== -->

            <button
                type="button"
                class="wishlist-btn"
                data-id="${productId}"
                aria-label="Wishlist"
                style="
                    position:absolute;
                    top:10px;
                    right:10px;
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
                ${
                    wishlist.includes(productId)
                        ? "❤️"
                        : "🤍"
                }
            </button>


            <!-- ==========================================
                 IMAGE SLIDER
            =========================================== -->

            <div
                class="slider"
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

                            <span
                                style="
                                    background:#e53935;
                                    color:#fff;
                                    padding:2px 5px;
                                    border-radius:4px;
                                    font-size:9px;
                                    margin-left:4px;
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
                        font-size:11px;
                        margin-top:5px;
                    "
                >
                    🟢 ${escapeHTML(
                        product.stock ||
                        "স্টকে আছে"
                    )}
                </div>


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

            }
        );

    }


    /* ======================================================
       WHATSAPP BUTTON
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


                const message =

`🌿 ${SITE_CONFIG.companyName}

আমি নিচের পণ্যটি অর্ডার করতে চাই।

━━━━━━━━━━━━━━━━━━

📦 পণ্যের নাম:
${product.name || "পণ্য"}

📂 ক্যাটাগরি:
${categoryName || "-"}

📁 সাব-ক্যাটাগরি:
${subCategoryName || "-"}

🔖 SKU:
${product.sku || "-"}

💰 মূল্য:
${formatPrice(price)}

🔢 পরিমাণ:
1

━━━━━━━━━━━━━━━━━━

🔗 পণ্যের লিংক:
${window.location.origin +
    window.location.pathname.replace(
        /[^/]*$/,
        ""
    ) +
    "product.html?id=" +
    encodeURIComponent(productId)}

দয়া করে অর্ডারটি গ্রহণ করার জন্য যোগাযোগ করুন।`;


                const url =
                    "https://wa.me/" +
                    SITE_CONFIG.whatsapp +
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
        );

    }


    /* ======================================================
       PRODUCT IMAGE ERROR
    ====================================================== */

    card
        .querySelectorAll("img")
        .forEach(
            image => {

                image.addEventListener(
                    "error",
                    function() {

                        this.classList.add(
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

            fragment.appendChild(
                createProductCard(
                    product
                )
            );

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


    const category =
        params.get(
            "category"
        );


    if (category) {

        return normalizeCategory(
            category
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


    const subCategory =
        params.get(
            "subcategory"
        ) ||
        params.get(
            "subCategory"
        );


    if (subCategory) {

        return normalizeCategory(
            subCategory
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
    sortValue
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
    ) {


        case "price-low":

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

            sorted.sort(
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


        case "newest":

            sorted.sort(
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


        case "name":

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
            searchInput?.value || "";


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
   END OF PART 4
========================================================== */

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL A-Z VERSION
   PART 5/8

   CATEGORY SYSTEM
   SUB-CATEGORY SYSTEM
   CATEGORY BUTTONS
   URL FILTER
   PRODUCT SLIDER
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


    if (category) {

        url.searchParams.set(
            "category",
            normalizeCategory(
                category
            )
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
            normalizeCategory(
                subCategory
            )
        );

    }
    else {

        url.searchParams.delete(
            "subcategory"
        );

    }


    /*
       Product ID থাকলে সেটি পরিবর্তন
       করা হবে না।
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
                        categoryId,
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
                            categoryId,
                            subId
                        );


                        updateCategoryURL(
                            categoryId,
                            subId
                        );


                        renderSubCategories(
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
            !activeCategory
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
        categories.length ||
        !products.length
    ) {

        return;

    }


    const map =
        new Map();


    products.forEach(
        product => {

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


    await ensureCategoriesLoaded();


    /*
       categories.json না থাকলেও
       products.json থেকে category তৈরি হবে।
    */

    if (
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


        renderCategoryButtons();

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
           Wishlist / WhatsApp / image click
           যেন product page-এ redirect না করে।
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
   CATEGORY SYSTEM AUTO PATCH
========================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initCategorySystem();

        }
    );

}
else {

    initCategorySystem();

}


/* ==========================================================
   PART 5 COMPLETE
========================================================== */

console.log(
    "📂 Part 5/8 — Category & Product Slider System Loaded."
);
