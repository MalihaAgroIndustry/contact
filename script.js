"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   PRODUCTS SYSTEM — PART 1
   Dynamic Category + Product Foundation
========================================================== */


/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let wishlist =
    JSON.parse(
        localStorage.getItem("wishlist") || "[]"
    )
    .map(Number)
    .filter(Number.isFinite);

let products = [];

let categories = [];

let currentProduct = null;

let deferredPrompt = null;

let homeSliderTimers = [];

let detailSliderIndex = 0;


/* ==========================================================
   SHORTCUTS
========================================================== */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    document.querySelectorAll(selector);


/* ==========================================================
   SITE CONFIGURATION
========================================================== */

const SITE_CONFIG = {

    companyName:
        "Maliha Agro Industry",

    whatsapp:
        "8801303679189",

    productAPI:
        "data/products.json",

    categoryAPI:
        "data/categories.json"

};


/* ==========================================================
   PRICE FORMAT
========================================================== */

function formatPrice(price) {

    const amount =
        Number(price || 0);

    return "৳" +
        amount.toLocaleString("en-BD");

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


    /* Normalize images folder */

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


    if (
        src.startsWith("/images/")
    ) {

        return src.substring(1);

    }


    if (
        src.startsWith("images/")
    ) {

        return src;

    }


    if (
        !src.includes("/")
    ) {

        return "images/" + src;

    }


    return src;

}


/* ==========================================================
   PRODUCT GALLERY
========================================================== */

function getGallery(product) {

    if (
        !product ||
        !Array.isArray(product.gallery)
    ) {

        return [];

    }


    return product.gallery
        .map(imagePath)
        .filter(Boolean);

}


/* ==========================================================
   NORMALIZE CATEGORY
========================================================== */

function normalizeCategory(category) {

    if (!category) {

        return "";

    }

    return String(category)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

}


/* ==========================================================
   NORMALIZE PRODUCT
========================================================== */

function normalizeProduct(product) {

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

        newArrival:
            Number(
                product.newArrival || 0
            ),

        bestSeller:
            Number(
                product.bestSeller || 0
            ),

        offer:
            Boolean(
                product.offer
            )

    };

}


/* ==========================================================
   FETCH PRODUCTS
========================================================== */

async function fetchProducts() {

    const response =
        await fetch(
            SITE_CONFIG.productAPI,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            "Products API failed"
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
        data.map(
            normalizeProduct
        );


    return products;

}


/* ==========================================================
   FETCH CATEGORIES
========================================================== */

async function fetchCategories() {

    const response =
        await fetch(
            SITE_CONFIG.categoryAPI,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            "categories.json failed to load"
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
        data
            .filter(
                category =>
                    category &&
                    category.status !== "inactive"
            )
            .sort(
                (a, b) =>
                    Number(a.sortOrder || 0) -
                    Number(b.sortOrder || 0)
            );


    return categories;

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
   ENSURE CATEGORIES LOADED
========================================================== */

async function ensureCategoriesLoaded() {

    if (
        categories.length
    ) {

        return categories;

    }


    return await fetchCategories();

}


/* ==========================================================
   FIND CATEGORY
========================================================== */

function findCategory(id) {

    const normalizedId =
        normalizeCategory(id);


    return categories.find(
        category =>
            normalizeCategory(
                category.id
            ) === normalizedId
    );

}


/* ==========================================================
   FIND SUB CATEGORY
========================================================== */

function findSubCategory(
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

        return null;

    }


    const normalizedId =
        normalizeCategory(
            subCategoryId
        );


    return category.subCategories.find(
        sub =>
            normalizeCategory(
                sub.id
            ) === normalizedId
    ) || null;

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


    return category
        ? category.name
        : categoryId || "";

}


/* ==========================================================
   SUB CATEGORY NAME
========================================================== */

function getSubCategoryName(
    categoryId,
    subCategoryId
) {

    const sub =
        findSubCategory(
            categoryId,
            subCategoryId
        );


    return sub
        ? sub.name
        : subCategoryId || "";

}


/* ==========================================================
   CATEGORY PRODUCTS COUNT
========================================================== */

function getCategoryProductCount(
    categoryId
) {

    return products.filter(
        product =>
            normalizeCategory(
                product.category
            ) ===
            normalizeCategory(
                categoryId
            )
    ).length;

}


/* ==========================================================
   SUB CATEGORY PRODUCTS COUNT
========================================================== */

function getSubCategoryProductCount(
    categoryId,
    subCategoryId
) {

    return products.filter(
        product =>
            normalizeCategory(
                product.category
            ) ===
            normalizeCategory(
                categoryId
            ) &&
            normalizeCategory(
                product.subCategory
            ) ===
            normalizeCategory(
                subCategoryId
            )
    ).length;

}

/* ==========================================================
   MALIHA AGRO INDUSTRY
   PRODUCTS SYSTEM — PART 2
   Dynamic Main Category + Sub Category
========================================================== */


/* ==========================================================
   RENDER MAIN CATEGORY BUTTONS
========================================================== */

async function renderCategoryButtons() {

    const wrapper =
        $("#mainCategoryButtons");

    if (!wrapper) {

        return;

    }


    try {

        await ensureCategoriesLoaded();


        wrapper.innerHTML = "";


        /* ==================================================
           ALL PRODUCTS BUTTON
        ================================================== */

        const allButton =
            document.createElement("button");


        allButton.type =
            "button";

        allButton.className =
            "filter-btn active";

        allButton.dataset.category =
            "all";

        allButton.dataset.subcategory =
            "all";

        allButton.innerHTML =
            "🛍️ সব পণ্য";


        wrapper.appendChild(
            allButton
        );


        /* ==================================================
           DYNAMIC MAIN CATEGORIES
        ================================================== */

        categories.forEach(
            function(category) {

                const button =
                    document.createElement("button");


                button.type =
                    "button";

                button.className =
                    "filter-btn main-category-btn";

                button.dataset.category =
                    normalizeCategory(
                        category.id
                    );

                button.dataset.subcategory =
                    "all";


                button.innerHTML = `

                    ${category.icon || "📂"}

                    ${category.name || "ক্যাটাগরি"}

                `;


                wrapper.appendChild(
                    button
                );

            }
        );


        initCategoryFilter();

    }
    catch(error) {

        console.error(
            "Category Render Error:",
            error
        );


        wrapper.innerHTML = `

            <button
                type="button"
                class="filter-btn active"
                data-category="all"
                data-subcategory="all"
            >
                🛍️ সব পণ্য
            </button>

        `;

    }

}


/* ==========================================================
   RENDER SUB CATEGORIES
========================================================== */

function renderSubCategories(
    categoryId
) {

    const area =
        $("#subCategoryArea");

    const wrapper =
        $("#subCategoryButtons");


    if (
        !area ||
        !wrapper
    ) {

        return;

    }


    wrapper.innerHTML = "";


    /* ==================================================
       ALL CATEGORY
    ================================================== */

    if (
        !categoryId ||
        categoryId === "all"
    ) {

        area.classList.remove(
            "show"
        );

        updateCategoryInfo(
            "all",
            "all"
        );

        return;

    }


    const category =
        findCategory(
            categoryId
        );


    /* ==================================================
       CATEGORY NOT FOUND
    ================================================== */

    if (!category) {

        area.classList.remove(
            "show"
        );

        updateCategoryInfo(
            categoryId,
            "all"
        );

        return;

    }


    /* ==================================================
       SUB CATEGORY LIST
    ================================================== */

    const subCategories =
        Array.isArray(
            category.subCategories
        )
        ?
        category.subCategories
            .filter(
                sub =>
                    sub &&
                    sub.status !== "inactive"
            )
            .sort(
                (a, b) =>
                    Number(
                        a.sortOrder || 0
                    ) -
                    Number(
                        b.sortOrder || 0
                    )
            )
        :
        [];


    /* ==================================================
       NO SUB CATEGORY
    ================================================== */

    if (
        !subCategories.length
    ) {

        area.classList.remove(
            "show"
        );

        updateCategoryInfo(
            categoryId,
            "all"
        );

        return;

    }


    /* ==================================================
       SHOW SUB CATEGORY AREA
    ================================================== */

    area.classList.add(
        "show"
    );


    /* ==================================================
       SUB CATEGORY TITLE
    ================================================== */

    const title =
        document.createElement("div");


    title.className =
        "sub-category-title";


    title.innerHTML = `

        <span>
            📁
        </span>

        <span>
            ${category.name || "ক্যাটাগরি"} এর পণ্য
        </span>

    `;


    wrapper.appendChild(
        title
    );


    /* ==================================================
       SUB CATEGORY BUTTON CONTAINER
    ================================================== */

    const buttons =
        document.createElement("div");


    buttons.className =
        "subcategory-buttons";


    /* ==================================================
       ALL SUB CATEGORY
    ================================================== */

    const allSubButton =
        document.createElement("button");


    allSubButton.type =
        "button";

    allSubButton.className =
        "sub-filter-btn active";

    allSubButton.dataset.category =
        normalizeCategory(
            category.id
        );

    allSubButton.dataset.subcategory =
        "all";

    allSubButton.innerHTML =
        "📦 সব";


    buttons.appendChild(
        allSubButton
    );


    /* ==================================================
       DYNAMIC SUB CATEGORIES
    ================================================== */

    subCategories.forEach(
        function(sub) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";

            button.className =
                "sub-filter-btn";


            button.dataset.category =
                normalizeCategory(
                    category.id
                );


            button.dataset.subcategory =
                normalizeCategory(
                    sub.id
                );


            const count =
                getSubCategoryProductCount(
                    category.id,
                    sub.id
                );


            button.innerHTML = `

                ${sub.icon || "📦"}

                ${sub.name || "সাব-ক্যাটাগরি"}

                <small>
                    (${count})
                </small>

            `;


            buttons.appendChild(
                button
            );

        }
    );


    wrapper.appendChild(
        buttons
    );


    /* ==================================================
       SUB CATEGORY CLICK
    ================================================== */

    buttons
        .querySelectorAll(
            ".sub-filter-btn"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        buttons
                            .querySelectorAll(
                                ".sub-filter-btn"
                            )
                            .forEach(
                                function(btn) {

                                    btn.classList
                                        .remove(
                                            "active"
                                        );

                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        const selectedCategory =
                            button.dataset.category ||
                            "all";


                        const selectedSubCategory =
                            button.dataset.subcategory ||
                            "all";


                        updateCategoryInfo(
                            selectedCategory,
                            selectedSubCategory
                        );


                        loadProducts(
                            selectedCategory,
                            selectedSubCategory
                        );

                    }
                );

            }
        );


    updateCategoryInfo(
        categoryId,
        "all"
    );

}


/* ==========================================================
   CATEGORY INFORMATION
========================================================== */

function updateCategoryInfo(
    categoryId = "all",
    subCategoryId = "all"
) {

    const info =
        $("#categoryInfo");


    if (!info) {

        return;

    }


    /* ==================================================
       ALL PRODUCTS
    ================================================== */

    if (
        categoryId === "all"
    ) {

        info.innerHTML = `

            🛍️

            <strong>
                সব পণ্য
            </strong>

            — মোট

            <strong>
                ${products.length}
            </strong>

            টি পণ্য

        `;


        info.classList.add(
            "show"
        );


        return;

    }


    /* ==================================================
       CATEGORY
    ================================================== */

    const categoryName =
        getCategoryName(
            categoryId
        );


    let count =
        getCategoryProductCount(
            categoryId
        );


    /* ==================================================
       SUB CATEGORY
    ================================================== */

    if (
        subCategoryId &&
        subCategoryId !== "all"
    ) {

        const subName =
            getSubCategoryName(
                categoryId,
                subCategoryId
            );


        count =
            getSubCategoryProductCount(
                categoryId,
                subCategoryId
            );


        info.innerHTML = `

            📁

            <strong>
                ${categoryName}
            </strong>

            →

            <strong>
                ${subName}
            </strong>

            — মোট

            <strong>
                ${count}
            </strong>

            টি পণ্য

        `;

    }
    else {

        info.innerHTML = `

            📂

            <strong>
                ${categoryName}
            </strong>

            — মোট

            <strong>
                ${count}
            </strong>

            টি পণ্য

        `;

    }


    info.classList.add(
        "show"
    );

}


/* ==========================================================
   CATEGORY FILTER
========================================================== */

function initCategoryFilter() {

    const buttons =
        $$(".filter-btn");


    buttons.forEach(
        function(button) {

            button.onclick =
                function() {


                    /* ======================================
                       REMOVE ACTIVE FROM MAIN CATEGORY
                    ====================================== */

                    buttons.forEach(
                        function(btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    /* ======================================
                       SELECT CATEGORY
                    ====================================== */

                    const category =
                        button.dataset.category ||
                        "all";


                    /* ======================================
                       RESET SUB CATEGORY
                    ====================================== */

                    renderSubCategories(
                        category
                    );


                    /* ======================================
                       LOAD PRODUCTS
                    ====================================== */

                    loadProducts(
                        category,
                        "all"
                    );

                };

        }
    );

}


/* ==========================================================
   GET ACTIVE MAIN CATEGORY
========================================================== */

function getActiveCategory() {

    const active =
        $(".filter-btn.active");


    if (!active) {

        return "all";

    }


    return (
        active.dataset.category ||
        "all"
    );

}


/* ==========================================================
   GET ACTIVE SUB CATEGORY
========================================================== */

function getActiveSubCategory() {

    const active =
        $(".sub-filter-btn.active");


    if (!active) {

        return "all";

    }


    return (
        active.dataset.subcategory ||
        "all"
    );

}


/* ==========================================================
   CATEGORY FILTER STATE RESET
========================================================== */

function resetCategoryFilters() {

    $$(".filter-btn")
        .forEach(
            function(button) {

                button.classList.remove(
                    "active"
                );

            }
        );


    const all =
        $(
            '.filter-btn[data-category="all"]'
        );


    if (all) {

        all.classList.add(
            "active"
        );

    }


    renderSubCategories(
        "all"
    );


    updateCategoryInfo(
        "all",
        "all"
    );

}

/* ==========================================================
   MALIHA AGRO INDUSTRY
   PRODUCTS SYSTEM — PART 3

   Product Loading
   Category Filter
   Sub Category Filter
   Search
   Sort
========================================================== */


/* ==========================================================
   LOAD PRODUCTS
========================================================== */

async function loadProducts(
    category = "all",
    subCategory = "all"
) {

    const productList =
        $("#productList");


    if (!productList) {

        return;

    }


    try {

        /* ==================================================
           LOAD PRODUCT DATA
        ================================================== */

        await ensureProductsLoaded();


        /* ==================================================
           SEARCH KEYWORD
        ================================================== */

        const searchInput =
            $("#searchProduct");


        const keyword =
            searchInput
            ? String(
                searchInput.value || ""
            )
                .trim()
                .toLowerCase()
            : "";


        /* ==================================================
           NORMALIZE FILTER
        ================================================== */

        category =
            normalizeCategory(
                category || "all"
            );


        subCategory =
            normalizeCategory(
                subCategory || "all"
            );


        /* ==================================================
           FILTER PRODUCTS
        ================================================== */

        let filtered =
            products.filter(
                function(product) {


                    /* ======================================
                       PRODUCT INFORMATION
                    ====================================== */

                    const productName =
                        String(
                            product.name || ""
                        )
                            .toLowerCase();


                    const productType =
                        String(
                            product.type || ""
                        )
                            .toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        )
                            .toLowerCase();


                    const categoryName =
                        String(
                            product.categoryName || ""
                        )
                            .toLowerCase();


                    const subCategoryName =
                        String(
                            product.subCategoryName || ""
                        )
                            .toLowerCase();


                    const brand =
                        String(
                            product.brand || ""
                        )
                            .toLowerCase();


                    const sku =
                        String(
                            product.sku || ""
                        )
                            .toLowerCase();


                    /* ======================================
                       CATEGORY MATCH
                    ====================================== */

                    const matchCategory =
                        category === "all" ||
                        normalizeCategory(
                            product.category
                        ) === category;


                    /* ======================================
                       SUB CATEGORY MATCH
                    ====================================== */

                    const matchSubCategory =
                        subCategory === "all" ||
                        normalizeCategory(
                            product.subCategory
                        ) === subCategory;


                    /* ======================================
                       SEARCH MATCH
                    ====================================== */

                    const matchSearch =
                        !keyword ||

                        productName.includes(
                            keyword
                        ) ||

                        productType.includes(
                            keyword
                        ) ||

                        description.includes(
                            keyword
                        ) ||

                        categoryName.includes(
                            keyword
                        ) ||

                        subCategoryName.includes(
                            keyword
                        ) ||

                        brand.includes(
                            keyword
                        ) ||

                        sku.includes(
                            keyword
                        );


                    return (
                        matchCategory &&
                        matchSubCategory &&
                        matchSearch
                    );

                }
            );


        /* ==================================================
           SORT PRODUCTS
        ================================================== */

        const sortSelect =
            $("#sortProducts");


        const sort =
            sortSelect
            ? sortSelect.value
            : "default";


        switch (sort) {


            /* ============================================
               PRICE LOW → HIGH
            ============================================ */

            case "low-high":

                filtered.sort(
                    function(a, b) {

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


            /* ============================================
               PRICE HIGH → LOW
            ============================================ */

            case "high-low":

                filtered.sort(
                    function(a, b) {

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


            /* ============================================
               NEW PRODUCTS
            ============================================ */

            case "new":

                filtered.sort(
                    function(a, b) {

                        return (
                            Number(
                                b.newArrival || 0
                            ) -
                            Number(
                                a.newArrival || 0
                            )
                        );

                    }
                );

                break;


            /* ============================================
               BEST SELLER
            ============================================ */

            case "best":

                filtered.sort(
                    function(a, b) {

                        return (
                            Number(
                                b.bestSeller || 0
                            ) -
                            Number(
                                a.bestSeller || 0
                            )
                        );

                    }
                );

                break;


            /* ============================================
               DEFAULT
            ============================================ */

            default:

                filtered.sort(
                    function(a, b) {

                        return (
                            Number(
                                a.id || 0
                            ) -
                            Number(
                                b.id || 0
                            )
                        );

                    }
                );

                break;

        }


        /* ==================================================
           CLEAR PRODUCT LIST
        ================================================== */

        productList.innerHTML = "";


        /* ==================================================
           NO PRODUCT FOUND
        ================================================== */

        if (
            filtered.length === 0
        ) {

            productList.innerHTML = `

                <div
                    class="card"
                    style="
                        grid-column: 1 / -1;
                        text-align:center;
                        padding:45px 20px;
                    "
                >

                    <div
                        style="
                            font-size:50px;
                            margin-bottom:15px;
                        "
                    >
                        🔍
                    </div>


                    <h2>
                        কোনো পণ্য পাওয়া যায়নি
                    </h2>


                    <p>
                        অন্য কোনো পণ্যের নাম,
                        ক্যাটাগরি অথবা
                        সাব-ক্যাটাগরি দিয়ে চেষ্টা করুন।
                    </p>


                    <button
                        type="button"
                        class="btn"
                        id="resetProductFilter"
                        style="
                            border:none;
                            cursor:pointer;
                            max-width:220px;
                            margin:15px auto 0;
                        "
                    >
                        🔄 সব পণ্য দেখুন
                    </button>

                </div>

            `;


            const resetButton =
                $("#resetProductFilter");


            if (resetButton) {

                resetButton.onclick =
                    function() {

                        if (searchInput) {

                            searchInput.value =
                                "";

                        }


                        const sortElement =
                            $("#sortProducts");


                        if (sortElement) {

                            sortElement.value =
                                "default";

                        }


                        resetCategoryFilters();


                        loadProducts(
                            "all",
                            "all"
                        );

                    };

            }


            updateCategoryInfo(
                category,
                subCategory
            );


            return;

        }


        /* ==================================================
           PRODUCT COUNT
        ================================================== */

        const countInfo =
            document.createElement(
                "div"
            );


        countInfo.className =
            "product-result-count";


        countInfo.style.cssText = `

            grid-column: 1 / -1;

            width: 100%;

            padding: 5px 2px 0;

            color: #666;

            font-size: 13px;

        `;


        countInfo.innerHTML = `

            📦 মোট

            <strong>
                ${filtered.length}
            </strong>

            টি পণ্য পাওয়া গেছে

        `;


        productList.appendChild(
            countInfo
        );


        /* ==================================================
           CREATE PRODUCT CARDS
        ================================================== */

        filtered.forEach(
            function(product) {


                const gallery =
                    getGallery(
                        product
                    );


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "product-card";


                card.dataset.productId =
                    product.id;


                /* ==========================================
                   OFFER BADGE
                ========================================== */

                if (
                    product.offer
                ) {

                    const offer =
                        document.createElement(
                            "span"
                        );


                    offer.className =
                        "offer-badge";


                    offer.textContent =
                        "🔥 অফার";


                    card.appendChild(
                        offer
                    );

                }


                /* ==========================================
                   WISHLIST BUTTON
                ========================================== */

                const wishlistButton =
                    document.createElement(
                        "button"
                    );


                wishlistButton.type =
                    "button";


                wishlistButton.className =
                    "wishlist-btn";


                wishlistButton.dataset.id =
                    product.id;


                wishlistButton.setAttribute(
                    "aria-label",
                    "Wishlist"
                );


                wishlistButton.textContent =
                    wishlist.includes(
                        Number(product.id)
                    )
                    ? "❤️"
                    : "🤍";


                if (
                    wishlist.includes(
                        Number(product.id)
                    )
                ) {

                    wishlistButton.classList.add(
                        "active"
                    );

                }


                wishlistButton.onclick =
                    function() {

                        toggleWishlist(
                            Number(
                                product.id
                            )
                        );

                    };


                card.appendChild(
                    wishlistButton
                );


                /* ==========================================
                   IMAGE SLIDER
                ========================================== */

                const slider =
                    document.createElement(
                        "div"
                    );


                slider.className =
                    "slider";


                if (
                    gallery.length
                ) {

                    gallery.forEach(
                        function(
                            image,
                            index
                        ) {

                            const img =
                                document.createElement(
                                    "img"
                                );


                            img.src =
                                image;


                            img.className =
                                "product-img";


                            if (
                                index === 0
                            ) {

                                img.classList.add(
                                    "active"
                                );

                            }


                            img.alt =
                                product.name ||
                                "Maliha Agro Industry Product";


                            img.loading =
                                index === 0
                                ? "eager"
                                : "lazy";


                            img.onerror =
                                function() {

                                    this.style.display =
                                        "none";

                                };


                            slider.appendChild(
                                img
                            );

                        }
                    );

                }
                else {

                    const noImage =
                        document.createElement(
                            "div"
                        );


                    noImage.className =
                        "no-product-image";


                    noImage.style.cssText = `

                        width:100%;

                        height:100%;

                        display:flex;

                        align-items:center;

                        justify-content:center;

                        font-size:55px;

                        color:#1F8F4D;

                        background:#f5f8f5;

                    `;


                    noImage.textContent =
                        "🌱";


                    slider.appendChild(
                        noImage
                    );

                }


                card.appendChild(
                    slider
                );


                /* ==========================================
                   PRODUCT CATEGORY BADGE
                ========================================== */

                const categoryBadge =
                    document.createElement(
                        "span"
                    );


                categoryBadge.className =
                    "product-category";


                categoryBadge.textContent =

                    product.categoryName ||

                    getCategoryName(
                        product.category
                    ) ||

                    "অন্যান্য";


                card.appendChild(
                    categoryBadge
                );


                /* ==========================================
                   PRODUCT NAME
                ========================================== */

                const title =
                    document.createElement(
                        "h3"
                    );


                title.textContent =
                    product.name ||
                    "পণ্য";


                card.appendChild(
                    title
                );


                /* ==========================================
                   SUB CATEGORY
                ========================================== */

                if (
                    product.subCategoryName
                ) {

                    const sub =
                        document.createElement(
                            "small"
                        );


                    sub.style.cssText = `

                        display:block;

                        color:#777;

                        font-size:12px;

                        margin-bottom:7px;

                    `;


                    sub.textContent =

                        "📁 " +
                        product.subCategoryName;


                    card.appendChild(
                        sub
                    );

                }


                /* ==========================================
                   RATING
                ========================================== */

                const rating =
                    document.createElement(
                        "p"
                    );


                rating.className =
                    "rating";


                const ratingValue =
                    Number(
                        product.rating || 0
                    );


                const roundedRating =
                    Math.max(
                        0,
                        Math.min(
                            5,
                            Math.round(
                                ratingValue
                            )
                        )
                    );


                rating.textContent =

                    "⭐".repeat(
                        roundedRating
                    ) +

                    "☆".repeat(
                        5 -
                        roundedRating
                    ) +

                    ` (${ratingValue})`;


                card.appendChild(
                    rating
                );


                /* ==========================================
                   OLD PRICE
                ========================================== */

                const oldPrice =
                    Number(
                        product.oldPrice || 0
                    );


                const price =
                    Number(
                        product.price || 0
                    );


                if (
                    oldPrice > price &&
                    price > 0
                ) {

                    const oldPriceElement =
                        document.createElement(
                            "p"
                        );


                    oldPriceElement.className =
                        "old-price";


                    oldPriceElement.textContent =
                        formatPrice(
                            oldPrice
                        );


                    card.appendChild(
                        oldPriceElement
                    );

                }


                /* ==========================================
                   CURRENT PRICE
                ========================================== */

                const priceElement =
                    document.createElement(
                        "p"
                    );


                priceElement.className =
                    "price";


                priceElement.textContent =
                    formatPrice(
                        price
                    );


                card.appendChild(
                    priceElement
                );


                /* ==========================================
                   STOCK
                ========================================== */

                const stock =
                    document.createElement(
                        "span"
                    );


                stock.className =
                    "stock";


                stock.textContent =

                    "🟢 " +

                    (
                        product.stock ||
                        "স্টকে আছে"
                    );


                card.appendChild(
                    stock
                );


                /* ==========================================
                   DESCRIPTION
                ========================================== */

                const description =
                    document.createElement(
                        "p"
                    );


                description.textContent =
                    product.description ||
                    "এই পণ্যের বিস্তারিত তথ্য জানতে বিস্তারিত দেখুন।";


                card.appendChild(
                    description
                );


                /* ==========================================
                   DETAILS BUTTON
                ========================================== */

                const detailsButton =
                    document.createElement(
                        "a"
                    );


                detailsButton.href =
                    `product.html?id=${product.id}`;


                detailsButton.className =
                    "btn";


                detailsButton.innerHTML =
                    "📖 বিস্তারিত দেখুন";


                card.appendChild(
                    detailsButton
                );


                productList.appendChild(
                    card
                );

            }
        );


        /* ==================================================
           UPDATE CATEGORY INFO
        ================================================== */

        updateCategoryInfo(
            category,
            subCategory
        );


        /* ==================================================
           INITIALIZE PRODUCT FEATURES
        ================================================== */

        initWishlist();

        startHomeSlider();

        initImagePreview();


    }
    catch(error) {

        console.error(
            "Product Load Error:",
            error
        );


        productList.innerHTML = `

            <div
                class="card"
                style="
                    grid-column:1 / -1;
                    text-align:center;
                    padding:40px 20px;
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


                <p>
                    কিছুক্ষণ পরে আবার চেষ্টা করুন।
                </p>


                <button
                    type="button"
                    class="btn"
                    onclick="location.reload()"
                    style="
                        border:none;
                        cursor:pointer;
                        max-width:200px;
                        margin:15px auto 0;
                    "
                >
                    🔄 আবার চেষ্টা করুন
                </button>

            </div>

        `;

    }

}


/* ==========================================================
   SEARCH
========================================================== */

function initSearch() {

    const input =
        $("#searchProduct");


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function() {

            const category =
                getActiveCategory();


            const subCategory =
                getActiveSubCategory();


            loadProducts(
                category,
                subCategory
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


    if (!select) {

        return;

    }


    select.addEventListener(
        "change",
        function() {

            const category =
                getActiveCategory();


            const subCategory =
                getActiveSubCategory();


            loadProducts(
                category,
                subCategory
            );

        }
    );

}


/* ==========================================================
   CATEGORY PRODUCT COUNT
========================================================== */

function getCategoryProductCount(
    categoryId
) {

    const id =
        normalizeCategory(
            categoryId
        );


    if (
        id === "all"
    ) {

        return products.length;

    }


    return products.filter(
        function(product) {

            return (
                normalizeCategory(
                    product.category
                ) === id
            );

        }
    ).length;

}


/* ==========================================================
   SUB CATEGORY PRODUCT COUNT
========================================================== */

function getSubCategoryProductCount(
    categoryId,
    subCategoryId
) {

    const category =
        normalizeCategory(
            categoryId
        );


    const subCategory =
        normalizeCategory(
            subCategoryId
        );


    return products.filter(
        function(product) {

            return (

                normalizeCategory(
                    product.category
                ) === category

                &&

                normalizeCategory(
                    product.subCategory
                ) === subCategory

            );

        }
    ).length;

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


    if (
        category &&
        category.name
    ) {

        return category.name;

    }


    const product =
        products.find(
            function(item) {

                return (
                    normalizeCategory(
                        item.category
                    ) ===
                    normalizeCategory(
                        categoryId
                    )
                );

            }
        );


    return (
        product?.categoryName ||
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
                function(item) {

                    return (
                        normalizeCategory(
                            item.id
                        ) ===
                        normalizeCategory(
                            subCategoryId
                        )
                    );

                }
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
            function(item) {

                return (

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

            }
        );


    return (
        product?.subCategoryName ||
        subCategoryId ||
        "অন্যান্য"
    );

}

/* ==========================================================
   MALIHA AGRO INDUSTRY
   PRODUCTS SYSTEM — PART 4

   Product Details
   Product Gallery
   Quantity
   WhatsApp Order
   Product Share
   Wishlist
   Related Products
========================================================== */


/* ==========================================================
   PRODUCT DETAILS
========================================================== */

async function loadProductDetails() {

    const slider =
        $("#productSlider");


    if (!slider) {

        return;

    }


    try {

        /* ==================================================
           PRODUCT ID
        ================================================== */

        const id =
            getProductId();


        if (
            !Number.isFinite(id) ||
            id <= 0
        ) {

            showProductNotFound();

            return;

        }


        /* ==================================================
           LOAD PRODUCTS
        ================================================== */

        await ensureProductsLoaded();


        /* ==================================================
           FIND PRODUCT
        ================================================== */

        currentProduct =
            products.find(
                function(product) {

                    return (
                        Number(product.id) ===
                        id
                    );

                }
            );


        if (!currentProduct) {

            showProductNotFound();

            return;

        }


        /* ==================================================
           PRODUCT BASIC INFORMATION
        ================================================== */

        const productName =
            $("#productName");


        const productBrand =
            $("#productBrand");


        const productBrandInfo =
            $("#productBrandInfo");


        const productRating =
            $("#productRating");


        const productStockInfo =
            $("#productStockInfo");


        const productCategory =
            $("#productCategory");


        const productType =
            $("#productType");


        const productSku =
            $("#productSku");


        const productWeight =
            $("#productWeight");


        const productDescription =
            $("#productDescription");


        if (productName) {

            productName.textContent =
                currentProduct.name ||
                "পণ্য";

        }


        if (productBrand) {

            productBrand.textContent =
                currentProduct.brand ||
                SITE_CONFIG.companyName;

        }


        if (productBrandInfo) {

            productBrandInfo.textContent =
                currentProduct.brand ||
                SITE_CONFIG.companyName;

        }


        if (productRating) {

            productRating.textContent =
                `(${currentProduct.rating || 0})`;

        }


        if (productStockInfo) {

            productStockInfo.textContent =
                currentProduct.stock ||
                "স্টকে আছে";

        }


        if (productCategory) {

            productCategory.textContent =

                currentProduct.categoryName ||

                getCategoryName(
                    currentProduct.category
                ) ||

                "-";

        }


        if (productType) {

            productType.textContent =
                currentProduct.type ||
                "-";

        }


        if (productSku) {

            productSku.textContent =
                currentProduct.sku ||
                "-";

        }


        if (productWeight) {

            productWeight.textContent =
                currentProduct.weight ||
                "-";

        }


        if (productDescription) {

            productDescription.textContent =
                currentProduct.description ||
                "এই পণ্যের বিস্তারিত তথ্য বর্তমানে পাওয়া যাচ্ছে না।";

        }


        /* ==================================================
           STOCK
        ================================================== */

        const stock =
            $("#productStock");


        if (stock) {

            stock.textContent =

                "🟢 " +

                (
                    currentProduct.stock ||
                    "স্টকে আছে"
                );

        }


        /* ==================================================
           PRICE
        ================================================== */

        const price =
            Number(
                currentProduct.price || 0
            );


        const oldPrice =
            Number(
                currentProduct.oldPrice || 0
            );


        const priceElement =
            $("#productPrice");


        const oldPriceElement =
            $("#productOldPrice");


        const discountElement =
            $("#productDiscount");


        const reviewElement =
            $("#productReview");


        if (priceElement) {

            priceElement.textContent =
                formatPrice(
                    price
                );

        }


        if (oldPriceElement) {

            if (
                oldPrice > price &&
                price > 0
            ) {

                oldPriceElement.textContent =
                    formatPrice(
                        oldPrice
                    );


                oldPriceElement.style.display =
                    "inline";

            }
            else {

                oldPriceElement.style.display =
                    "none";

            }

        }


        if (discountElement) {

            if (
                oldPrice > price &&
                price > 0
            ) {

                const discount =
                    Math.round(
                        (
                            (
                                oldPrice -
                                price
                            ) /
                            oldPrice
                        ) * 100
                    );


                discountElement.textContent =
                    discount +
                    "% OFF";


                discountElement.style.display =
                    "inline-block";

            }
            else {

                discountElement.style.display =
                    "none";

            }

        }


        if (reviewElement) {

            reviewElement.textContent =
                `(${currentProduct.rating || 0} Reviews)`;

        }


        /* ==================================================
           PRODUCT GALLERY
        ================================================== */

        renderProductGallery();


        /* ==================================================
           INITIALIZE DETAILS FEATURES
        ================================================== */

        initDetailGallery();

        initQuantity();

        initOrderButton();

        initShareProductButtons();

        initProductWishlist();

        loadRelatedProducts();

    }
    catch (error) {

        console.error(
            "Product Details Error:",
            error
        );


        showProductNotFound();

    }

}


/* ==========================================================
   PRODUCT NOT FOUND
========================================================== */

function showProductNotFound() {

    const gallery =
        $(".product-gallery");


    if (gallery) {

        gallery.innerHTML = `

            <div
                class="card"
                style="
                    text-align:center;
                    padding:40px 20px;
                "
            >

                <div
                    style="
                        font-size:55px;
                        margin-bottom:15px;
                    "
                >
                    🔍
                </div>


                <h2>
                    ❌ পণ্য পাওয়া যায়নি
                </h2>


                <p>
                    আপনি যে পণ্যটি খুঁজছেন
                    সেটি বর্তমানে পাওয়া যাচ্ছে না।
                </p>


                <a
                    href="products.html"
                    class="btn"
                    style="
                        display:inline-flex;
                        max-width:220px;
                        margin-top:15px;
                    "
                >

                    📦 সকল পণ্য দেখুন

                </a>

            </div>

        `;

    }

}


/* ==========================================================
   RENDER PRODUCT GALLERY
========================================================== */

function renderProductGallery() {

    const slider =
        $("#productSlider");


    if (!slider) {

        return;

    }


    const gallery =
        getGallery(
            currentProduct
        );


    slider.innerHTML = "";


    /* ==================================================
       NO IMAGE
    ================================================== */

    if (!gallery.length) {

        slider.innerHTML = `

            <div
                class="no-image"
                style="
                    width:100%;
                    height:100%;
                    min-height:300px;
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
                    color:#1F8F4D;
                    background:#f5f8f5;
                    border-radius:15px;
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
                    এই পণ্যের ছবি পাওয়া যায়নি।
                </p>

            </div>

        `;


        return;

    }


    /* ==================================================
       ADD IMAGES
    ================================================== */

    gallery.forEach(
        function(src, index) {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                src;


            image.alt =
                currentProduct.name ||
                SITE_CONFIG.companyName;


            image.className =
                "product-img";


            if (
                index === 0
            ) {

                image.classList.add(
                    "active"
                );

            }


            image.loading =
                index === 0
                ? "eager"
                : "lazy";


            image.onerror =
                function() {

                    this.style.display =
                        "none";

                };


            slider.appendChild(
                image
            );

        }
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


    const previousButton =
        $("#prevImage");


    const nextButton =
        $("#nextImage");


    const counter =
        $("#sliderCounter");


    if (!images.length) {

        if (counter) {

            counter.textContent =
                "0 / 0";

        }


        return;

    }


    /* ==================================================
       SHOW IMAGE
    ================================================== */

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
            function(image) {

                image.classList.remove(
                    "active"
                );

            }
        );


        images[index]
            .classList.add(
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


    /* ==================================================
       PREVIOUS
    ================================================== */

    if (previousButton) {

        previousButton.onclick =
            function() {

                showImage(
                    detailSliderIndex - 1
                );

            };

    }


    /* ==================================================
       NEXT
    ================================================== */

    if (nextButton) {

        nextButton.onclick =
            function() {

                showImage(
                    detailSliderIndex + 1
                );

            };

    }


    /* ==================================================
       IMAGE CLICK → MODAL
    ================================================== */

    images.forEach(
        function(image) {

            image.onclick =
                function() {

                    openImageModal(
                        image.src
                    );

                };

        }
    );


    /* ==================================================
       INITIAL IMAGE
    ================================================== */

    showImage(0);

}


/* ==========================================================
   IMAGE MODAL OPEN
========================================================== */

function openImageModal(
    src
) {

    const modal =
        $("#imageModal");


    const modalImage =
        $("#modalImage");


    if (
        !modal ||
        !modalImage ||
        !src
    ) {

        return;

    }


    modalImage.src =
        src;


    modal.style.display =
        "flex";

}


/* ==========================================================
   QUANTITY SYSTEM
========================================================== */

function initQuantity() {

    const quantityInput =
        $("#qty");


    const totalPrice =
        $("#totalPrice");


    const plusButton =
        $("#plusQty");


    const minusButton =
        $("#minusQty");


    if (
        !quantityInput ||
        !totalPrice ||
        !currentProduct
    ) {

        return;

    }


    let quantity =
        Number(
            quantityInput.value
        ) || 1;


    if (
        quantity < 1
    ) {

        quantity = 1;

    }


    /* ==================================================
       UPDATE QUANTITY
    ================================================== */

    function updateQuantity() {

        quantityInput.value =
            quantity;


        const total =
            Number(
                currentProduct.price || 0
            ) *
            quantity;


        totalPrice.textContent =
            formatPrice(
                total
            );


        updateOrderLink(
            quantity
        );

    }


    /* ==================================================
       PLUS
    ================================================== */

    if (plusButton) {

        plusButton.onclick =
            function() {

                quantity++;

                updateQuantity();

            };

    }


    /* ==================================================
       MINUS
    ================================================== */

    if (minusButton) {

        minusButton.onclick =
            function() {

                if (
                    quantity > 1
                ) {

                    quantity--;

                    updateQuantity();

                }

            };

    }


    /* ==================================================
       MANUAL INPUT
    ================================================== */

    quantityInput.oninput =
        function() {

            quantity =
                parseInt(
                    quantityInput.value,
                    10
                ) || 1;


            if (
                quantity < 1
            ) {

                quantity = 1;

            }


            updateQuantity();

        };


    updateQuantity();

}


/* ==========================================================
   ORDER BUTTON
========================================================== */

function initOrderButton() {

    const button =
        $("#orderNow");


    if (
        !button ||
        !currentProduct
    ) {

        return;

    }


    updateOrderLink(1);

}


/* ==========================================================
   UPDATE WHATSAPP ORDER LINK
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
        price *
        quantity;


    const categoryName =

        currentProduct.categoryName ||

        getCategoryName(
            currentProduct.category
        ) ||

        "-";


    const subCategoryName =

        currentProduct.subCategoryName ||

        getSubCategoryName(
            currentProduct.category,
            currentProduct.subCategory
        ) ||

        "-";


    const message =

`🌿 ${SITE_CONFIG.companyName}

আমি নিচের পণ্যটি অর্ডার করতে চাই।

━━━━━━━━━━━━━━━━━━

📦 পণ্যের নাম:
${currentProduct.name || "-"}

📂 ক্যাটাগরি:
${categoryName}

📁 সাব-ক্যাটাগরি:
${subCategoryName}

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
   SHARE PRODUCT
========================================================== */

function initShareProductButtons() {

    const buttons = [

        $("#shareProduct"),

        $("#shareProductBtn")

    ];


    buttons.forEach(
        function(button) {

            if (!button) {

                return;

            }


            button.onclick =
                async function(event) {

                    event.preventDefault();


                    if (
                        !currentProduct
                    ) {

                        return;

                    }


                    const shareData = {

                        title:
                            currentProduct.name ||
                            SITE_CONFIG.companyName,

                        text:
                            currentProduct.description ||
                            `${currentProduct.name} — ${SITE_CONFIG.companyName}`,

                        url:
                            window.location.href

                    };


                    /* ======================================
                       NATIVE SHARE
                    ====================================== */

                    if (
                        navigator.share
                    ) {

                        try {

                            await navigator.share(
                                shareData
                            );

                            return;

                        }
                        catch(error) {

                            if (
                                error.name ===
                                "AbortError"
                            ) {

                                return;

                            }

                        }

                    }


                    /* ======================================
                       COPY LINK FALLBACK
                    ====================================== */

                    try {

                        await navigator.clipboard
                            .writeText(
                                window.location.href
                            );


                        alert(
                            "✅ পণ্যের লিংক কপি হয়েছে।"
                        );

                    }
                    catch(error) {

                        alert(
                            "❌ পণ্যের লিংক কপি করা যায়নি।"
                        );

                    }

                };

        }
    );

}


/* ==========================================================
   PRODUCT WISHLIST
========================================================== */

function initProductWishlist() {

    if (
        !currentProduct
    ) {

        return;

    }


    const id =
        Number(
            currentProduct.id
        );


    const buttons = [

        $("#wishlistBtn"),

        $("#wishlistProduct")

    ];


    buttons.forEach(
        function(button) {

            if (!button) {

                return;

            }


            const active =
                wishlist.includes(
                    id
                );


            button.textContent =
                active
                ? "❤️ Wishlist"
                : "🤍 Wishlist";


            button.classList.toggle(
                "active",
                active
            );


            button.onclick =
                function() {

                    toggleWishlist(
                        id
                    );

                };

        }
    );

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


    /* ==================================================
       SAME CATEGORY PRODUCTS
    ================================================== */

    let related =
        products.filter(
            function(product) {

                return (

                    Number(product.id) !==
                    Number(currentProduct.id)

                    &&

                    normalizeCategory(
                        product.category
                    ) ===
                    normalizeCategory(
                        currentProduct.category
                    )

                );

            }
        );


    /* ==================================================
       SAME SUB CATEGORY FIRST
    ================================================== */

    if (
        currentProduct.subCategory
    ) {

        const sameSub =
            related.filter(
                function(product) {

                    return (

                        normalizeCategory(
                            product.subCategory
                        ) ===
                        normalizeCategory(
                            currentProduct.subCategory
                        )

                    );

                }
            );


        if (
            sameSub.length
        ) {

            related = [
                ...sameSub,
                ...related.filter(
                    function(product) {

                        return !sameSub.includes(
                            product
                        );

                    }
                )
            ];

        }

    }


    related =
        related.slice(
            0,
            4
        );


    container.innerHTML = "";


    /* ==================================================
       NO RELATED PRODUCT
    ================================================== */

    if (
        !related.length
    ) {

        container.innerHTML = `

            <div
                class="card"
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:30px;
                "
            >

                <p>
                    📦 এই ক্যাটাগরিতে
                    বর্তমানে অন্য কোনো পণ্য নেই।
                </p>

            </div>

        `;


        return;

    }


    /* ==================================================
       RELATED CARDS
    ================================================== */

    related.forEach(
        function(product) {

            const gallery =
                getGallery(
                    product
                );


            const image =
                gallery[0] || "";


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "product-card";


            /* ==========================================
               IMAGE
            ========================================== */

            const slider =
                document.createElement(
                    "div"
                );


            slider.className =
                "slider";


            if (image) {

                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    image;


                img.className =
                    "product-img active";


                img.alt =
                    product.name ||
                    "Product";


                img.loading =
                    "lazy";


                img.onerror =
                    function() {

                        this.style.display =
                            "none";

                    };


                slider.appendChild(
                    img
                );

            }
            else {

                slider.innerHTML = `

                    <div
                        class="no-product-image"
                        style="
                            width:100%;
                            height:100%;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:50px;
                        "
                    >
                        🌱
                    </div>

                `;

            }


            card.appendChild(
                slider
            );


            /* ==========================================
               CATEGORY
            ========================================== */

            const category =
                document.createElement(
                    "span"
                );


            category.className =
                "product-category";


            category.textContent =

                product.categoryName ||

                getCategoryName(
                    product.category
                ) ||

                "অন্যান্য";


            card.appendChild(
                category
            );


            /* ==========================================
               NAME
            ========================================== */

            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                product.name ||
                "পণ্য";


            card.appendChild(
                title
            );


            /* ==========================================
               PRICE
            ========================================== */

            const price =
                document.createElement(
                    "p"
                );


            price.className =
                "price";


            price.textContent =
                formatPrice(
                    product.price
                );


            card.appendChild(
                price
            );


            /* ==========================================
               DETAILS
            ========================================== */

            const button =
                document.createElement(
                    "a"
                );


            button.href =
                `product.html?id=${product.id}`;


            button.className =
                "btn";


            button.textContent =
                "📖 বিস্তারিত দেখুন";


            card.appendChild(
                button
            );


            container.appendChild(
                card
            );

        }
    );

}


/* ==========================================================
   IMAGE MODAL
========================================================== */

function initImagePreview() {

    const modal =
        $("#imageModal");


    const modalImage =
        $("#modalImage");


    if (
        !modal ||
        !modalImage
    ) {

        return;

    }


    const closeButton =
        modal.querySelector(
            ".close-modal"
        );


    /* ==================================================
       CLOSE BUTTON
    ================================================== */

    if (closeButton) {

        closeButton.onclick =
            function() {

                modal.style.display =
                    "none";


                modalImage.src =
                    "";

            };

    }


    /* ==================================================
       CLICK OUTSIDE
    ================================================== */

    modal.onclick =
        function(event) {

            if (
                event.target === modal
            ) {

                modal.style.display =
                    "none";


                modalImage.src =
                    "";

            }

        };


    /* ==================================================
       ESC KEY
    ================================================== */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Escape"
            ) {

                modal.style.display =
                    "none";


                modalImage.src =
                    "";

            }

        }
    );

}

