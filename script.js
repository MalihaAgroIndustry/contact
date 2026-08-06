"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   PRODUCTS SYSTEM
   Clean + Fixed Version
========================================================== */


/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let wishlist = JSON.parse(
    localStorage.getItem("wishlist") || "[]"
)
.map(Number)
.filter(Number.isFinite);

let products = [];
let categories = [];
let currentProduct = null;

let detailSliderIndex = 0;
let homeSliderTimers = [];


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

    companyName: "Maliha Agro Industry",

    whatsapp: "8801303679189",

    productAPI: "data/products.json",

    categoryAPI: "data/categories.json"

};


/* ==========================================================
   PRICE FORMAT
========================================================== */

function formatPrice(price) {

    const amount = Number(price || 0);

    return "৳" + amount.toLocaleString("en-BD");

}


/* ==========================================================
   PRODUCT ID
========================================================== */

function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return Number(params.get("id"));

}


/* ==========================================================
   IMAGE PATH
========================================================== */

function imagePath(path) {

    if (!path) {
        return "";
    }

    let src = String(path)
        .trim()
        .replace(/\\/g, "/");


    /* External URL */

    if (
        /^https?:\/\//i.test(src) ||
        src.startsWith("data:")
    ) {
        return src;
    }


    src = src.replace(
        /^(\.\.\/)+images\//i,
        "images/"
    );

    src = src.replace(
        /^\.\/images\//i,
        "images/"
    );


    if (src.startsWith("/images/")) {
        return src.substring(1);
    }


    if (src.startsWith("images/")) {
        return src;
    }


    if (!src.includes("/")) {
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

        id: Number(product.id),

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
            Number(product.price || 0),

        oldPrice:
            Number(product.oldPrice || 0),

        rating:
            Number(product.rating || 0),

        newArrival:
            Number(product.newArrival || 0),

        bestSeller:
            Number(product.bestSeller || 0),

        offer:
            Boolean(product.offer)

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


    if (!Array.isArray(data)) {

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


    if (!Array.isArray(data)) {

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

    if (products.length) {
        return products;
    }

    return await fetchProducts();

}


/* ==========================================================
   ENSURE CATEGORIES LOADED
========================================================== */

async function ensureCategoriesLoaded() {

    if (categories.length) {
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

function getCategoryName(categoryId) {

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

    const sub =
        findSubCategory(
            categoryId,
            subCategoryId
        );


    if (
        sub &&
        sub.name
    ) {
        return sub.name;
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
   CATEGORY PRODUCT COUNT
========================================================== */

function getCategoryProductCount(
    categoryId
) {

    const id =
        normalizeCategory(
            categoryId
        );


    if (id === "all") {
        return products.length;
    }


    return products.filter(
        product =>
            normalizeCategory(
                product.category
            ) === id
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
        product =>
            normalizeCategory(
                product.category
            ) === category &&
            normalizeCategory(
                product.subCategory
            ) === subCategory
    ).length;

}


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


        /* ALL */

        const allButton =
            document.createElement("button");


        allButton.type = "button";

        allButton.className =
            "filter-btn active";

        allButton.dataset.category =
            "all";

        allButton.dataset.subcategory =
            "all";

        allButton.textContent =
            "🛍️ সব পণ্য";


        wrapper.appendChild(
            allButton
        );


        /* MAIN CATEGORIES */

        categories.forEach(
            category => {

                const button =
                    document.createElement(
                        "button"
                    );


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
                    Number(a.sortOrder || 0) -
                    Number(b.sortOrder || 0)
            )
        :
        [];


    if (!subCategories.length) {

        area.classList.remove(
            "show"
        );

        updateCategoryInfo(
            categoryId,
            "all"
        );

        return;

    }


    area.classList.add(
        "show"
    );


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "sub-category-title";


    title.innerHTML = `

        <span>📁</span>

        <span>
            ${category.name || "ক্যাটাগরি"} এর পণ্য
        </span>

    `;


    wrapper.appendChild(
        title
    );


    const buttons =
        document.createElement(
            "div"
        );


    buttons.className =
        "subcategory-buttons";


    const allSubButton =
        document.createElement(
            "button"
        );


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

    allSubButton.textContent =
        "📦 সব";


    buttons.appendChild(
        allSubButton
    );


    subCategories.forEach(
        sub => {

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


    buttons
        .querySelectorAll(
            ".sub-filter-btn"
        )
        .forEach(
            button => {

                button.onclick =
                    function() {

                        buttons
                            .querySelectorAll(
                                ".sub-filter-btn"
                            )
                            .forEach(
                                btn =>
                                    btn.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        const category =
                            button.dataset.category ||
                            "all";


                        const subCategory =
                            button.dataset.subcategory ||
                            "all";


                        updateCategoryInfo(
                            category,
                            subCategory
                        );


                        loadProducts(
                            category,
                            subCategory
                        );

                    };

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


    if (categoryId === "all") {

        info.innerHTML = `

            🛍️

            <strong>সব পণ্য</strong>

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


    const categoryName =
        getCategoryName(
            categoryId
        );


    let count =
        getCategoryProductCount(
            categoryId
        );


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
        button => {

            button.onclick =
                function() {

                    buttons.forEach(
                        btn =>
                            btn.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    const category =
                        button.dataset.category ||
                        "all";


                    renderSubCategories(
                        category
                    );


                    loadProducts(
                        category,
                        "all"
                    );

                };

        }
    );

}


/* ==========================================================
   ACTIVE CATEGORY
========================================================== */

function getActiveCategory() {

    const active =
        $(".filter-btn.active");


    return (
        active?.dataset.category ||
        "all"
    );

}


/* ==========================================================
   ACTIVE SUB CATEGORY
========================================================== */

function getActiveSubCategory() {

    const active =
        $(".sub-filter-btn.active");


    return (
        active?.dataset.subcategory ||
        "all"
    );

}


/* ==========================================================
   RESET FILTER
========================================================== */

function resetCategoryFilters() {

    $$(".filter-btn")
        .forEach(
            button =>
                button.classList.remove(
                    "active"
                )
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

        await ensureProductsLoaded();


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


        category =
            normalizeCategory(
                category || "all"
            );


        subCategory =
            normalizeCategory(
                subCategory || "all"
            );


        let filtered =
            products.filter(
                product => {

                    const productName =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const productType =
                        String(
                            product.type || ""
                        ).toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    const categoryName =
                        String(
                            product.categoryName || ""
                        ).toLowerCase();


                    const subCategoryName =
                        String(
                            product.subCategoryName || ""
                        ).toLowerCase();


                    const brand =
                        String(
                            product.brand || ""
                        ).toLowerCase();


                    const sku =
                        String(
                            product.sku || ""
                        ).toLowerCase();


                    const matchCategory =
                        category === "all" ||
                        normalizeCategory(
                            product.category
                        ) === category;


                    const matchSubCategory =
                        subCategory === "all" ||
                        normalizeCategory(
                            product.subCategory
                        ) === subCategory;


                    const matchSearch =
                        !keyword ||
                        productName.includes(keyword) ||
                        productType.includes(keyword) ||
                        description.includes(keyword) ||
                        categoryName.includes(keyword) ||
                        subCategoryName.includes(keyword) ||
                        brand.includes(keyword) ||
                        sku.includes(keyword);


                    return (
                        matchCategory &&
                        matchSubCategory &&
                        matchSearch
                    );

                }
            );


        const sortSelect =
            $("#sortProducts");


        const sort =
            sortSelect?.value ||
            "default";


        switch(sort) {

            case "low-high":

                filtered.sort(
                    (a, b) =>
                        Number(a.price || 0) -
                        Number(b.price || 0)
                );

                break;


            case "high-low":

                filtered.sort(
                    (a, b) =>
                        Number(b.price || 0) -
                        Number(a.price || 0)
                );

                break;


            case "new":

                filtered.sort(
                    (a, b) =>
                        Number(b.newArrival || 0) -
                        Number(a.newArrival || 0)
                );

                break;


            case "best":

                filtered.sort(
                    (a, b) =>
                        Number(b.bestSeller || 0) -
                        Number(a.bestSeller || 0)
                );

                break;


            default:

                filtered.sort(
                    (a, b) =>
                        Number(a.id || 0) -
                        Number(b.id || 0)
                );

                break;

        }


        productList.innerHTML = "";


        if (!filtered.length) {

            productList.innerHTML = `

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
                            searchInput.value = "";
                        }


                        if (sortSelect) {
                            sortSelect.value = "default";
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


        const countInfo =
            document.createElement(
                "div"
            );


        countInfo.className =
            "product-result-count";


        countInfo.style.cssText = `

            grid-column:1/-1;
            width:100%;
            padding:5px 2px 0;
            color:#666;
            font-size:13px;

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


        filtered.forEach(
            product => {

                const card =
                    createProductCard(
                        product
                    );


                productList.appendChild(
                    card
                );

            }
        );


        updateCategoryInfo(
            category,
            subCategory
        );


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
                    grid-column:1/-1;
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
   CREATE PRODUCT CARD
========================================================== */

function createProductCard(product) {

    const gallery =
        getGallery(product);


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    card.dataset.productId =
        product.id;


    /* OFFER */

    if (product.offer) {

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


    /* WISHLIST */

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


    const isWishlisted =
        wishlist.includes(
            Number(product.id)
        );


    wishlistButton.textContent =
        isWishlisted
            ? "❤️"
            : "🤍";


    wishlistButton.classList.toggle(
        "active",
        isWishlisted
    );


    wishlistButton.onclick =
        function(event) {

            event.stopPropagation();

            toggleWishlist(
                Number(product.id)
            );

        };


    card.appendChild(
        wishlistButton
    );


    /* IMAGE SLIDER */

    const slider =
        document.createElement(
            "div"
        );


    slider.className =
        "slider";


    if (gallery.length) {

        gallery.forEach(
            (image, index) => {

                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    image;


                img.className =
                    "product-img";


                if (index === 0) {

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


    /* CATEGORY */

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


    /* NAME */

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


    /* SUB CATEGORY */

    if (product.subCategoryName) {

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


    /* RATING */

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
            5 - roundedRating
        ) +
        ` (${ratingValue})`;


    card.appendChild(
        rating
    );


    /* PRICE */

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


    /* STOCK */

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


    /* DESCRIPTION */

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


    /* DETAILS */

    const detailsButton =
        document.createElement(
            "a"
        );


    detailsButton.href =
        `product.html?id=${product.id}`;


    detailsButton.className =
        "btn";


    detailsButton.textContent =
        "📖 বিস্তারিত দেখুন";


    card.appendChild(
        detailsButton
    );


    return card;

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

            loadProducts(
                getActiveCategory(),
                getActiveSubCategory()
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

            loadProducts(
                getActiveCategory(),
                getActiveSubCategory()
            );

        }
    );

}


/* ==========================================================
   WISHLIST
========================================================== */

function saveWishlist() {

    localStorage.setItem(
        "wishlist",
        JSON.stringify(
            wishlist
        )
    );

}


/* ==========================================================
   TOGGLE WISHLIST
========================================================== */

function toggleWishlist(id) {

    id = Number(id);


    if (!Number.isFinite(id)) {
        return;
    }


    const index =
        wishlist.indexOf(id);


    if (index >= 0) {

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

    updateWishlistButtons(
        id
    );

}


/* ==========================================================
   UPDATE WISHLIST BUTTONS
========================================================== */

function updateWishlistButtons(
    id
) {

    const active =
        wishlist.includes(
            Number(id)
        );


    $$(
        `.wishlist-btn[data-id="${id}"]`
    )
    .forEach(
        button => {

            button.textContent =
                active
                    ? "❤️"
                    : "🤍";


            button.classList.toggle(
                "active",
                active
            );

        }
    );


    if (
        currentProduct &&
        Number(currentProduct.id) ===
        Number(id)
    ) {

        [
            $("#wishlistBtn"),
            $("#wishlistProduct")
        ]
        .forEach(
            button => {

                if (!button) {
                    return;
                }


                button.textContent =
                    active
                        ? "❤️ Wishlist"
                        : "🤍 Wishlist";


                button.classList.toggle(
                    "active",
                    active
                );

            }
        );

    }

}


/* ==========================================================
   INIT WISHLIST
========================================================== */

function initWishlist() {

    $$(".wishlist-btn")
        .forEach(
            button => {

                const id =
                    Number(
                        button.dataset.id
                    );


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

            }
        );

}


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

        const id =
            getProductId();


        if (
            !Number.isFinite(id) ||
            id <= 0
        ) {

            showProductNotFound();

            return;

        }


        await ensureProductsLoaded();


        currentProduct =
            products.find(
                product =>
                    Number(product.id) === id
            );


        if (!currentProduct) {

            showProductNotFound();

            return;

        }


        setProductText(
            "#productName",
            currentProduct.name ||
            "পণ্য"
        );


        setProductText(
            "#productBrand",
            currentProduct.brand ||
            SITE_CONFIG.companyName
        );


        setProductText(
            "#productBrandInfo",
            currentProduct.brand ||
            SITE_CONFIG.companyName
        );


        setProductText(
            "#productRating",
            `(${currentProduct.rating || 0})`
        );


        setProductText(
            "#productStockInfo",
            currentProduct.stock ||
            "স্টকে আছে"
        );


        setProductText(
            "#productStock",
            "🟢 " +
            (
                currentProduct.stock ||
                "স্টকে আছে"
            )
        );


        setProductText(
            "#productCategory",
            currentProduct.categoryName ||
            getCategoryName(
                currentProduct.category
            ) ||
            "-"
        );


        setProductText(
            "#productSubCategory",
            currentProduct.subCategoryName ||
            getSubCategoryName(
                currentProduct.category,
                currentProduct.subCategory
            ) ||
            "-"
        );


        setProductText(
            "#productType",
            currentProduct.type ||
            "-"
        );


        setProductText(
            "#productSku",
            currentProduct.sku ||
            "-"
        );


        setProductText(
            "#productWeight",
            currentProduct.weight ||
            "-"
        );


        setProductText(
            "#productDescription",
            currentProduct.description ||
            "এই পণ্যের বিস্তারিত তথ্য বর্তমানে পাওয়া যাচ্ছে না।"
        );


        /* PRICE */

        const price =
            Number(
                currentProduct.price || 0
            );


        const oldPrice =
            Number(
                currentProduct.oldPrice || 0
            );


        setProductText(
            "#productPrice",
            formatPrice(price)
        );


        const oldPriceElement =
            $("#productOldPrice");


        if (oldPriceElement) {

            if (
                oldPrice > price &&
                price > 0
            ) {

                oldPriceElement.textContent =
                    formatPrice(oldPrice);

                oldPriceElement.style.display =
                    "inline";

            }
            else {

                oldPriceElement.style.display =
                    "none";

            }

        }


        const discountElement =
            $("#productDiscount");


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
                    discount + "% OFF";


                discountElement.style.display =
                    "inline-block";

            }
            else {

                discountElement.style.display =
                    "none";

            }

        }


        setProductText(
            "#productReview",
            `(${currentProduct.rating || 0} Reviews)`
        );


        renderProductGallery();

        initDetailGallery();

        initQuantity();

        initOrderButton();

        initShareProductButtons();

        initProductWishlist();

        loadRelatedProducts();

    }
    catch(error) {

        console.error(
            "Product Details Error:",
            error
        );

        showProductNotFound();

    }

}


/* ==========================================================
   SET PRODUCT TEXT
========================================================== */

function setProductText(
    selector,
    text
) {

    const element =
        $(selector);


    if (element) {

        element.textContent =
            text;

    }

}


/* ==========================================================
   PRODUCT NOT FOUND
========================================================== */

function showProductNotFound() {

    const gallery =
        $(".product-gallery");


    if (!gallery) {
        return;
    }


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


    gallery.forEach(
        (src, index) => {

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


            if (index === 0) {

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


    const previous =
        $("#prevImage");


    const next =
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


    function showImage(index) {

        if (index < 0) {
            index =
                images.length - 1;
        }


        if (index >= images.length) {
            index = 0;
        }


        images.forEach(
            image =>
                image.classList.remove(
                    "active"
                )
        );


        images[index].classList.add(
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
            function() {

                showImage(
                    detailSliderIndex - 1
                );

            };

    }


    if (next) {

        next.onclick =
            function() {

                showImage(
                    detailSliderIndex + 1
                );

            };

    }


    images.forEach(
        image => {

            image.onclick =
                function() {

                    openImageModal(
                        image.src
                    );

                };

        }
    );


    showImage(0);

}


/* ==========================================================
   QUANTITY
========================================================== */

function initQuantity() {

    const quantityInput =
        $("#qty");


    const totalPrice =
        $("#totalPrice");


    const plus =
        $("#plusQty");


    const minus =
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


    quantity =
        Math.max(
            1,
            Math.floor(quantity)
        );


    function updateQuantity() {

        quantityInput.value =
            quantity;


        const total =
            Number(
                currentProduct.price || 0
            ) *
            quantity;


        totalPrice.textContent =
            formatPrice(total);


        updateOrderLink(
            quantity
        );

    }


    if (plus) {

        plus.onclick =
            function() {

                quantity++;

                updateQuantity();

            };

    }


    if (minus) {

        minus.onclick =
            function() {

                if (quantity > 1) {

                    quantity--;

                    updateQuantity();

                }

            };

    }


    quantityInput.oninput =
        function() {

            quantity =
                parseInt(
                    quantityInput.value,
                    10
                ) || 1;


            quantity =
                Math.max(
                    1,
                    quantity
                );


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
   WHATSAPP ORDER
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
        button => {

            if (!button) {
                return;
            }


            button.onclick =
                async function(event) {

                    event.preventDefault();


                    if (!currentProduct) {
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


                    try {

                        if (
                            navigator.clipboard
                        ) {

                            await navigator.clipboard
                                .writeText(
                                    window.location.href
                                );

                            alert(
                                "✅ পণ্যের লিংক কপি হয়েছে।"
                            );

                        }
                        else {

                            prompt(
                                "পণ্যের লিংক কপি করুন:",
                                window.location.href
                            );

                        }

                    }
                    catch(error) {

                        console.error(
                            "Share Error:",
                            error
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

    if (!currentProduct) {
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
        button => {

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


    let related =
        products.filter(
            product => {

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


    const sameSub =
        related.filter(
            product =>
                normalizeCategory(
                    product.subCategory
                ) ===
                normalizeCategory(
                    currentProduct.subCategory
                )
        );


    const other =
        related.filter(
            product =>
                !sameSub.includes(
                    product
                )
        );


    related =
        [
            ...sameSub,
            ...other
        ]
        .slice(0, 4);


    container.innerHTML = "";


    if (!related.length) {

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
                    📦 এই ক্যাটাগরিতে বর্তমানে
                    অন্য কোনো পণ্য নেই।
                </p>

            </div>

        `;

        return;

    }


    related.forEach(
        product => {

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


            const category =
                document.createElement(
                    "span"
                );


            category.className =
                "product-category";


            category.textContent =
                product.subCategoryName ||
                product.categoryName ||
                getCategoryName(
                    product.category
                ) ||
                "পণ্য";


            card.appendChild(
                category
            );


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

function openImageModal(src) {

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
   IMAGE PREVIEW
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


    const close =
        modal.querySelector(
            ".close-modal"
        );


    if (close) {

        close.onclick =
            function() {

                modal.style.display =
                    "none";

                modalImage.src =
                    "";

            };

    }


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

}


/* ==========================================================
   HOME PRODUCT IMAGE SLIDER
========================================================== */

function startHomeSlider() {

    /* Stop previous timers */

    homeSliderTimers.forEach(
        timer =>
            clearInterval(timer)
    );


    homeSliderTimers = [];


    $$(".product-card .slider")
        .forEach(
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
                        function() {

                            images[index]
                                .classList.remove(
                                    "active"
                                );


                            index =
                                (
                                    index + 1
                                ) %
                                images.length;


                            images[index]
                                .classList.add(
                                    "active"
                                );

                        },
                        3500
                    );


                homeSliderTimers.push(
                    timer
                );

            }
        );

}


/* ==========================================================
   PAGE INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        try {

            /* Load data */

            await ensureProductsLoaded();


            /* Categories only where needed */

            if (
                $("#mainCategoryButtons")
            ) {

                await ensureCategoriesLoaded();

                await renderCategoryButtons();

                renderSubCategories(
                    "all"
                );

            }


            /* Products page */

            if (
                $("#productList")
            ) {

                await loadProducts(
                    getActiveCategory(),
                    getActiveSubCategory()
                );

            }


            /* Search */

            initSearch();


            /* Sort */

            initSort();


            /* Product details */

            if (
                $("#productSlider")
            ) {

                await loadProductDetails();

            }


            /* Image preview */

            initImagePreview();

        }
        catch(error) {

            console.error(
                "Initialization Error:",
                error
            );

        }

    }
);
