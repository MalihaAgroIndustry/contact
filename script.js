"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   MAIN SCRIPT.JS — COMPLETE FIXED VERSION
   Products + Categories + Search + Wishlist +
   Product Details + Gallery + WhatsApp Order + Share
========================================================== */


/* ==========================================================
   GLOBAL STATE
========================================================== */

let products = [];
let categories = [];
let wishlist = [];

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
   LOAD WISHLIST
========================================================== */

function loadWishlistStorage() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem("wishlist") || "[]"
            );

        wishlist =
            Array.isArray(saved)
                ? saved
                    .map(Number)
                    .filter(Number.isFinite)
                : [];

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

function saveWishlistStorage() {

    try {

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
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


    /* Normalize image paths */

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

    if (!product) {

        return [];

    }


    let gallery = [];


    /* Main image */

    if (
        product.image
    ) {

        gallery.push(
            product.image
        );

    }


    /* imageUrl */

    if (
        product.imageUrl
    ) {

        gallery.push(
            product.imageUrl
        );

    }


    /* images array */

    if (
        Array.isArray(product.images)
    ) {

        gallery.push(
            ...product.images
        );

    }


    /* gallery array */

    if (
        Array.isArray(product.gallery)
    ) {

        gallery.push(
            ...product.gallery
        );

    }


    /* Remove duplicates */

    return [
        ...new Set(
            gallery
                .map(imagePath)
                .filter(Boolean)
        )
    ];

}


/* ==========================================================
   NORMALIZE CATEGORY
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
   NORMALIZE PRODUCT
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

    const url =
        new URL(
            "data/products.json",
            window.location.href
        ).href;

    console.log("📦 Products URL:", url);

    const response =
        await fetch(
            url,
            {
                cache: "no-store"
            }
        );

    console.log(
        "📦 Products Status:",
        response.status,
        response.statusText
    );

    if (!response.ok) {

        throw new Error(
            `Products Load Failed: ${response.status} ${response.statusText}`
        );

    }

    const data =
        await response.json();

    console.log(
        "📦 Products Data:",
        data
    );

    if (!Array.isArray(data)) {

        throw new Error(
            "products.json must contain an array"
        );

    }

    products =
        data
            .map(normalizeProduct)
            .filter(
                product =>
                    product &&
                    Number.isFinite(product.id)
            );

    console.log(
        "✅ Products Loaded:",
        products.length
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
            "Categories API failed: " +
            response.status
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
        Array.isArray(products) &&
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
        Array.isArray(categories) &&
        categories.length
    ) {

        return categories;

    }


    return await fetchCategories();

}


/* ==========================================================
   PRODUCT ID FROM URL
========================================================== */

function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        Number(
            params.get("id")
        );


    return id;

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
    ) || null;

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


    const id =
        normalizeCategory(
            subCategoryId
        );


    return category.subCategories.find(
        sub =>
            normalizeCategory(
                sub.id
            ) === id
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


    if (
        id === "all"
    ) {

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
   INITIAL WISHLIST
========================================================== */

loadWishlistStorage();

/* ==========================================================
   RENDER MAIN CATEGORIES
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


        /* --------------------------------------------------
           ALL PRODUCTS BUTTON
        -------------------------------------------------- */

        const allButton =
            document.createElement(
                "button"
            );


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


        /* --------------------------------------------------
           MAIN CATEGORIES
        -------------------------------------------------- */

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
    catch (error) {

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
                    Number(
                        a.sortOrder || 0
                    ) -
                    Number(
                        b.sortOrder || 0
                    )
            )
        :
        [];


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


    /* --------------------------------------------------
       ALL SUB CATEGORY
    -------------------------------------------------- */

    const allSub =
        document.createElement(
            "button"
        );


    allSub.type =
        "button";

    allSub.className =
        "sub-filter-btn active";

    allSub.dataset.category =
        normalizeCategory(
            category.id
        );

    allSub.dataset.subcategory =
        "all";

    allSub.innerHTML =
        "📦 সব";


    buttons.appendChild(
        allSub
    );


    /* --------------------------------------------------
       SUB CATEGORIES
    -------------------------------------------------- */

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


    /* --------------------------------------------------
       SUB CATEGORY CLICK
    -------------------------------------------------- */

    buttons
        .querySelectorAll(
            ".sub-filter-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
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
   RESET CATEGORY FILTERS
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
   WISHLIST BUTTON UI
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
        wishlist.indexOf(
            id
        );


    if (
        index === -1
    ) {

        wishlist.push(
            id
        );

    }
    else {

        wishlist.splice(
            index,
            1
        );

    }


    saveWishlistStorage();


    updateAllWishlistButtons();


    renderWishlistPage();

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


    if (
        currentProduct
    ) {

        initProductWishlist();

    }

}


/* ==========================================================
   INIT WISHLIST
========================================================== */

function initWishlist() {

    updateAllWishlistButtons();

}

/* ==========================================================
   CREATE PRODUCT CARD
========================================================== */

function createProductCard(product) {

    const card =
        document.createElement("article");


    card.className =
        "product-card";


    card.dataset.productId =
        product.id;


    /* ------------------------------------------------------
       OFFER BADGE
    ------------------------------------------------------ */

    if (product.offer) {

        const offer =
            document.createElement("span");


        offer.className =
            "offer-badge";


        offer.textContent =
            "🔥 অফার";


        card.appendChild(
            offer
        );

    }


    /* ------------------------------------------------------
       WISHLIST BUTTON
    ------------------------------------------------------ */

    const wishlistButton =
        document.createElement("button");


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


    updateWishlistButton(
        wishlistButton,
        product.id
    );


    wishlistButton.onclick =
        function(event) {

            event.preventDefault();

            event.stopPropagation();


            toggleWishlist(
                Number(product.id)
            );

        };


    card.appendChild(
        wishlistButton
    );


    /* ------------------------------------------------------
       PRODUCT IMAGE SLIDER
    ------------------------------------------------------ */

    const slider =
        document.createElement("div");


    slider.className =
        "slider";


    const gallery =
        getGallery(product);


    if (gallery.length) {

        gallery.forEach(
            (src, index) => {

                const img =
                    document.createElement("img");


                img.src =
                    src;


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

        slider.innerHTML = `

            <div
                class="no-product-image"
                style="
                    width:100%;
                    height:100%;
                    min-height:220px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:55px;
                    color:#1F8F4D;
                    background:#f5f8f5;
                "
            >
                🌱
            </div>

        `;

    }


    card.appendChild(
        slider
    );


    /* ------------------------------------------------------
       CATEGORY
    ------------------------------------------------------ */

    const categoryBadge =
        document.createElement("span");


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


    /* ------------------------------------------------------
       PRODUCT NAME
    ------------------------------------------------------ */

    const title =
        document.createElement("h3");


    title.textContent =
        product.name ||
        "পণ্য";


    card.appendChild(
        title
    );


    /* ------------------------------------------------------
       SUB CATEGORY
    ------------------------------------------------------ */

    const subName =

        product.subCategoryName ||

        getSubCategoryName(
            product.category,
            product.subCategory
        );


    if (
        product.subCategory ||
        product.subCategoryName
    ) {

        const sub =
            document.createElement("small");


        sub.style.cssText = `

            display:block;
            color:#777;
            font-size:12px;
            margin-bottom:7px;

        `;


        sub.textContent =
            "📁 " +
            subName;


        card.appendChild(
            sub
        );

    }


    /* ------------------------------------------------------
       RATING
    ------------------------------------------------------ */

    const rating =
        document.createElement("p");


    rating.className =
        "rating";


    const ratingValue =
        Number(
            product.rating || 0
        );


    const rounded =
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
            rounded
        ) +

        "☆".repeat(
            5 - rounded
        ) +

        ` (${ratingValue})`;


    card.appendChild(
        rating
    );


    /* ------------------------------------------------------
       PRICE
    ------------------------------------------------------ */

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
            document.createElement("p");


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
        document.createElement("p");


    priceElement.className =
        "price";


    priceElement.textContent =
        formatPrice(
            price
        );


    card.appendChild(
        priceElement
    );


    /* ------------------------------------------------------
       STOCK
    ------------------------------------------------------ */

    const stock =
        document.createElement("span");


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


    /* ------------------------------------------------------
       DESCRIPTION
    ------------------------------------------------------ */

    const description =
        document.createElement("p");


    description.textContent =
        product.description ||
        "এই পণ্যের বিস্তারিত তথ্য জানতে বিস্তারিত দেখুন।";


    card.appendChild(
        description
    );


    /* ------------------------------------------------------
       DETAILS BUTTON
    ------------------------------------------------------ */

    const button =
        document.createElement("a");


    button.href =
        `product.html?id=${encodeURIComponent(product.id)}`;


    button.className =
        "btn";


    button.textContent =
        "📖 বিস্তারিত দেখুন";


    card.appendChild(
        button
    );


    return card;

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
            ?
            String(
                searchInput.value || ""
            )
                .trim()
                .toLowerCase()
            :
            "";


        category =
            normalizeCategory(
                category || "all"
            );


        subCategory =
            normalizeCategory(
                subCategory || "all"
            );


        /* --------------------------------------------------
           FILTER PRODUCTS
        -------------------------------------------------- */

        let filtered =
            products.filter(
                product => {

                    const name =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const type =
                        String(
                            product.type || ""
                        ).toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    const brand =
                        String(
                            product.brand || ""
                        ).toLowerCase();


                    const sku =
                        String(
                            product.sku || ""
                        ).toLowerCase();


                    const categoryName =
                        String(
                            product.categoryName || ""
                        ).toLowerCase();


                    const subCategoryName =
                        String(
                            product.subCategoryName || ""
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

                        name.includes(
                            keyword
                        ) ||

                        type.includes(
                            keyword
                        ) ||

                        description.includes(
                            keyword
                        ) ||

                        brand.includes(
                            keyword
                        ) ||

                        sku.includes(
                            keyword
                        ) ||

                        categoryName.includes(
                            keyword
                        ) ||

                        subCategoryName.includes(
                            keyword
                        );


                    return (
                        matchCategory &&
                        matchSubCategory &&
                        matchSearch
                    );

                }
            );


        /* --------------------------------------------------
           SORT PRODUCTS
        -------------------------------------------------- */

        const sortSelect =
            $("#sortProducts");


        const sort =
            sortSelect?.value ||
            "default";


        if (
            sort === "low-high"
        ) {

            filtered.sort(
                (a, b) =>
                    a.price - b.price
            );

        }
        else if (
            sort === "high-low"
        ) {

            filtered.sort(
                (a, b) =>
                    b.price - a.price
            );

        }
        else if (
            sort === "new"
        ) {

            filtered.sort(
                (a, b) =>
                    b.newArrival -
                    a.newArrival
            );

        }
        else if (
            sort === "best"
        ) {

            filtered.sort(
                (a, b) =>
                    b.bestSeller -
                    a.bestSeller
            );

        }
        else {

            filtered.sort(
                (a, b) =>
                    a.id - b.id
            );

        }


        /* --------------------------------------------------
           CLEAR PRODUCT LIST
        -------------------------------------------------- */

        productList.innerHTML = "";


        /* --------------------------------------------------
           NO PRODUCT
        -------------------------------------------------- */

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

                            searchInput.value =
                                "";

                        }


                        if (sortSelect) {

                            sortSelect.value =
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


        /* --------------------------------------------------
           RESULT COUNT
        -------------------------------------------------- */

        const count =
            document.createElement("div");


        count.className =
            "product-result-count";


        count.style.cssText = `

            grid-column:1/-1;
            width:100%;
            padding:5px 2px 0;
            color:#666;
            font-size:13px;

        `;


        count.innerHTML = `

            📦 মোট

            <strong>
                ${filtered.length}
            </strong>

            টি পণ্য পাওয়া গেছে

        `;


        productList.appendChild(
            count
        );


        /* --------------------------------------------------
           CREATE PRODUCT CARDS
        -------------------------------------------------- */

        filtered.forEach(
            product => {

                productList.appendChild(
                    createProductCard(
                        product
                    )
                );

            }
        );


        updateCategoryInfo(
            category,
            subCategory
        );


        initImagePreview();


        startHomeSlider();

    }
    catch (error) {

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
   SEARCH
========================================================== */

function initSearch() {

    const input =
        $("#searchProduct");


    if (!input) {

        return;

    }


    if (
        input.dataset.searchBound
    ) {

        return;

    }


    input.dataset.searchBound =
        "true";


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


    if (
        select.dataset.sortBound
    ) {

        return;

    }


    select.dataset.sortBound =
        "true";


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
   PRODUCT DETAILS
========================================================== */

async function loadProductDetails() {

    const slider = $("#productSlider");

    if (!slider) {
        return;
    }

    try {

        const productId = getProductId();

        if (
            !Number.isFinite(productId) ||
            productId <= 0
        ) {
            showProductNotFound();
            return;
        }

        await ensureProductsLoaded();

        currentProduct = products.find(
            product =>
                Number(product.id) === Number(productId)
        );

        if (!currentProduct) {
            showProductNotFound();
            return;
        }


        /* ==================================================
           BASIC INFORMATION
        ================================================== */

        const productName = $("#productName");
        const productBrand = $("#productBrand");
        const productBrandInfo = $("#productBrandInfo");
        const productRating = $("#productRating");
        const productStockInfo = $("#productStockInfo");
        const productStock = $("#productStock");
        const productCategory = $("#productCategory");
        const productSubCategory = $("#productSubCategory");
        const productType = $("#productType");
        const productSku = $("#productSku");
        const productWeight = $("#productWeight");
        const productDescription = $("#productDescription");


        if (productName) {
            productName.textContent =
                currentProduct.name || "পণ্য";
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

        if (productStock) {
            productStock.textContent =
                "🟢 " +
                (
                    currentProduct.stock ||
                    "স্টকে আছে"
                );
        }

        if (productCategory) {
            productCategory.textContent =
                currentProduct.categoryName ||
                getCategoryName(
                    currentProduct.category
                ) ||
                currentProduct.category ||
                "-";
        }

        if (productSubCategory) {
            productSubCategory.textContent =
                currentProduct.subCategoryName ||
                getSubCategoryName(
                    currentProduct.category,
                    currentProduct.subCategory
                ) ||
                currentProduct.subCategory ||
                "-";
        }

        if (productType) {
            productType.textContent =
                currentProduct.type || "-";
        }

        if (productSku) {
            productSku.textContent =
                currentProduct.sku || "-";
        }

        if (productWeight) {
            productWeight.textContent =
                currentProduct.weight || "-";
        }

        if (productDescription) {
            productDescription.textContent =
                currentProduct.description ||
                "এই পণ্যের বিস্তারিত তথ্য বর্তমানে পাওয়া যাচ্ছে না।";
        }


        /* ==================================================
           PRICE
        ================================================== */

        const price =
            Number(currentProduct.price || 0);

        const oldPrice =
            Number(currentProduct.oldPrice || 0);

        const priceElement = $("#productPrice");
        const oldPriceElement = $("#productOldPrice");
        const discountElement = $("#productDiscount");
        const reviewElement = $("#productReview");


        if (priceElement) {
            priceElement.textContent =
                formatPrice(price);
        }


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


        if (discountElement) {

            if (
                oldPrice > price &&
                price > 0
            ) {

                const discount =
                    Math.round(
                        (
                            (oldPrice - price) /
                            oldPrice
                        ) * 100
                    );

                discountElement.textContent =
                    `${discount}% OFF`;

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
           DETAIL FEATURES
        ================================================== */

        initDetailGallery();

        initQuantity();

        initOrderButton();

        initShareProductButtons();

        initProductWishlist();

        loadRelatedProducts();


        /* ==================================================
           REMOVE LOADING
        ================================================== */

        const loading =
            $("#productLoading");

        if (loading) {
            loading.style.display =
                "none";
        }


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


        const loading =
            $("#productLoading");

        if (loading) {

            loading.innerHTML = `

                <div
                    style="
                        text-align:center;
                        padding:35px 15px;
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

                    <h3>
                        পণ্যের তথ্য লোড করা যায়নি
                    </h3>

                    <p>
                        products.json অথবা
                        script.js সঠিকভাবে
                        লোড হচ্ছে কিনা দেখুন।
                    </p>

                    <button
                        type="button"
                        class="btn"
                        onclick="location.reload()"
                        style="
                            border:none;
                            cursor:pointer;
                            margin-top:10px;
                        "
                    >
                        🔄 আবার চেষ্টা করুন
                    </button>

                </div>

            `;

            loading.style.display =
                "block";

        }

    }

}


/* ==========================================================
   PRODUCT NOT FOUND
========================================================== */

function showProductNotFound() {

    const gallery =
        $(".product-gallery");

    const loading =
        $("#productLoading");


    if (loading) {
        loading.style.display =
            "none";
    }


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


    if (
        !slider ||
        !currentProduct
    ) {
        return;
    }


    const gallery =
        getGallery(currentProduct);


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
                document.createElement("img");


            image.src =
                src;

            image.alt =
                currentProduct.name ||
                SITE_CONFIG.companyName;

            image.className =
                "product-img";


            if (index === 0) {
                image.classList.add("active");
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
   DETAIL GALLERY CONTROLS
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
            function(event) {

                event.preventDefault();

                showImage(
                    detailSliderIndex - 1
                );

            };

    }


    if (next) {

        next.onclick =
            function(event) {

                event.preventDefault();

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

    const input =
        $("#qty");

    const total =
        $("#totalPrice");

    const plus =
        $("#plusQty");

    const minus =
        $("#minusQty");


    if (
        !input ||
        !total ||
        !currentProduct
    ) {
        return;
    }


    let quantity =
        Number(input.value) || 1;


    quantity =
        Math.max(
            1,
            Math.floor(quantity)
        );


    function updateQuantity() {

        input.value =
            quantity;


        total.textContent =
            formatPrice(
                Number(
                    currentProduct.price || 0
                ) * quantity
            );


        updateOrderLink(quantity);

    }


    if (plus) {

        plus.onclick =
            function(event) {

                event.preventDefault();

                quantity++;

                updateQuantity();

            };

    }


    if (minus) {

        minus.onclick =
            function(event) {

                event.preventDefault();

                if (quantity > 1) {

                    quantity--;

                    updateQuantity();

                }

            };

    }


    input.oninput =
        function() {

            quantity =
                parseInt(
                    input.value,
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

📂 প্রধান ক্যাটাগরি:
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
        encodeURIComponent(message);


    button.target =
        "_blank";


    button.rel =
        "noopener noreferrer";

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
        products.filter(product =>

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


    /* ------------------------------------------------------
       SAME SUB CATEGORY FIRST
    ------------------------------------------------------ */

    const sameSub =
        related.filter(product =>

            normalizeCategory(
                product.subCategory
            ) ===
            normalizeCategory(
                currentProduct.subCategory
            )

        );


    /* ------------------------------------------------------
       OTHER PRODUCTS
    ------------------------------------------------------ */

    const other =
        related.filter(product =>

            !sameSub.includes(product)

        );


    related = [

        ...sameSub,

        ...other

    ].slice(0, 4);


    container.innerHTML = "";


    /* ------------------------------------------------------
       NO RELATED PRODUCT
    ------------------------------------------------------ */

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


    /* ------------------------------------------------------
       RENDER RELATED PRODUCTS
    ------------------------------------------------------ */

    related.forEach(product => {

        const card =
            createProductCard(product);

        container.appendChild(card);

    });


    /* ------------------------------------------------------
       RELATED PRODUCT SLIDER
    ------------------------------------------------------ */

    startHomeSlider();

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


    modalImage.src = src;

    modal.style.display = "flex";

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


    /* ------------------------------------------------------
       CLOSE BUTTON
    ------------------------------------------------------ */

    if (
        close &&
        !close.dataset.bound
    ) {

        close.dataset.bound = "true";


        close.onclick =
            function () {

                modal.style.display =
                    "none";

                modalImage.src = "";

            };

    }


    /* ------------------------------------------------------
       CLICK OUTSIDE
    ------------------------------------------------------ */

    if (
        !modal.dataset.bound
    ) {

        modal.dataset.bound = "true";


        modal.onclick =
            function (event) {

                if (
                    event.target === modal
                ) {

                    modal.style.display =
                        "none";

                    modalImage.src = "";

                }

            };

    }

}


/* ==========================================================
   WISHLIST PAGE
========================================================== */

async function renderWishlistPage() {

    const container =
        $("#wishlistProducts");


    if (!container) {
        return;
    }


    try {

        await ensureProductsLoaded();


        const wishlistProducts =
            products.filter(product =>

                wishlist.includes(
                    Number(product.id)
                )

            );


        container.innerHTML = "";


        /* --------------------------------------------------
           EMPTY WISHLIST
        -------------------------------------------------- */

        if (
            !wishlistProducts.length
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
                            margin-bottom:15px;
                        "
                    >
                        🤍
                    </div>

                    <h2>
                        আপনার Wishlist খালি
                    </h2>

                    <p>
                        পছন্দের পণ্যগুলো এখানে
                        সংরক্ষণ করতে পারবেন।
                    </p>

                    <a
                        href="products.html"
                        class="btn"
                        style="
                            display:inline-flex;
                            margin-top:15px;
                        "
                    >
                        🛍️ পণ্য দেখুন
                    </a>

                </div>

            `;

            return;

        }


        /* --------------------------------------------------
           RENDER WISHLIST PRODUCTS
        -------------------------------------------------- */

        wishlistProducts.forEach(product => {

            container.appendChild(
                createProductCard(product)
            );

        });


        startHomeSlider();

    }
    catch (error) {

        console.error(
            "Wishlist Error:",
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
                        font-size:45px;
                    "
                >
                    ❌
                </div>

                <h3>
                    Wishlist লোড করা যায়নি
                </h3>

                <button
                    type="button"
                    class="btn"
                    onclick="location.reload()"
                    style="
                        border:none;
                        cursor:pointer;
                        margin-top:15px;
                    "
                >
                    🔄 আবার চেষ্টা করুন
                </button>

            </div>

        `;

    }

}


/* ==========================================================
   HOME / PRODUCT CARD SLIDER
========================================================== */

function stopHomeSlider() {

    homeSliderTimers.forEach(
        timer => {

            clearInterval(timer);

        }
    );


    homeSliderTimers = [];

}


/* ==========================================================
   START HOME SLIDER
========================================================== */

function startHomeSlider() {

    stopHomeSlider();


    $$(".slider").forEach(slider => {

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
                function () {

                    if (!images[index]) {
                        return;
                    }


                    images[index]
                        .classList.remove(
                            "active"
                        );


                    index =
                        (
                            index + 1
                        ) %
                        images.length;


                    if (images[index]) {

                        images[index]
                            .classList.add(
                                "active"
                            );

                    }

                },
                3000
            );


        homeSliderTimers.push(timer);

    });

}


/* ==========================================================
   GLOBAL PRODUCT DETAIL FALLBACK
========================================================== */

function productDetailError(message) {

    const loading =
        $("#productLoading");


    if (!loading) {
        return;
    }


    loading.style.display = "block";


    loading.innerHTML = `

        <div
            style="
                text-align:center;
                padding:35px 15px;
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

            <h3>
                ${message ||
                "পণ্যের তথ্য লোড করা যায়নি।"}
            </h3>

            <p>
                অনুগ্রহ করে কিছুক্ষণ পরে
                আবার চেষ্টা করুন।
            </p>

            <button
                type="button"
                class="btn"
                onclick="location.reload()"
                style="
                    border:none;
                    cursor:pointer;
                    margin-top:12px;
                "
            >
                🔄 আবার চেষ্টা করুন
            </button>

        </div>

    `;

}

/* ==========================================================
   INITIALIZE APP
========================================================== */

async function initializeApp() {

    try {

        /* --------------------------------------------------
           LOAD PRODUCTS + CATEGORIES
        -------------------------------------------------- */

        await Promise.allSettled([

            ensureProductsLoaded(),

            ensureCategoriesLoaded()

        ]);


        /* --------------------------------------------------
           CATEGORY BUTTONS
        -------------------------------------------------- */

        await renderCategoryButtons();


        /* --------------------------------------------------
           SEARCH + SORT
        -------------------------------------------------- */

        initSearch();

        initSort();


        /* --------------------------------------------------
           PRODUCTS PAGE
        -------------------------------------------------- */

        if (
            $("#productList")
        ) {

            await loadProducts(
                getActiveCategory(),
                getActiveSubCategory()
            );

        }


        /* --------------------------------------------------
           PRODUCT DETAILS PAGE
        -------------------------------------------------- */

        if (
            $("#productSlider")
        ) {

            await loadProductDetails();

        }


        /* --------------------------------------------------
           WISHLIST PAGE
        -------------------------------------------------- */

        if (
            $("#wishlistProducts")
        ) {

            await renderWishlistPage();

        }


        /* --------------------------------------------------
           IMAGE MODAL
        -------------------------------------------------- */

        initImagePreview();


        /* --------------------------------------------------
           WISHLIST UI
        -------------------------------------------------- */

        initWishlist();


        console.log(
            "✅ Maliha Agro Industry system initialized successfully."
        );

    }
    catch (error) {

        console.error(
            "❌ App Initialization Error:",
            error
        );

    }

}


/* ==========================================================
   DOM READY
========================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

}
else {

    initializeApp();

}
