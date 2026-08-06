"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   COMPLETE FIXED SCRIPT.JS
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

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);


/* ==========================================================
   SITE CONFIG
========================================================== */

const SITE_CONFIG = {

    companyName: "Maliha Agro Industry",

    whatsapp: "8801303679189",

    /*
       IMPORTANT:
       তোমার GitHub structure:

       contact/
       ├── script.js
       ├── products.html
       ├── product.html
       └── data/
           ├── products.json
           └── categories.json
    */

    productAPI: "data/products.json",
    categoryAPI: "data/categories.json"

};


/* ==========================================================
   SAFE URL
========================================================== */

function getDataURL(path) {

    try {

        return new URL(
            path,
            document.baseURI
        ).href;

    }
    catch (error) {

        console.error(
            "URL Error:",
            error
        );

        return path;

    }

}


/* ==========================================================
   WISHLIST STORAGE
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


loadWishlistStorage();


/* ==========================================================
   PRICE
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


    if (
        /^https?:\/\//i.test(src) ||
        src.startsWith("data:")
    ) {

        return src;

    }


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


    if (product.image) {
        gallery.push(product.image);
    }


    if (product.imageUrl) {
        gallery.push(product.imageUrl);
    }


    if (Array.isArray(product.images)) {
        gallery.push(...product.images);
    }


    if (Array.isArray(product.gallery)) {
        gallery.push(...product.gallery);
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
   NORMALIZE
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


function normalizeProduct(product) {

    if (
        !product ||
        typeof product !== "object"
    ) {

        return null;

    }


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
            Boolean(product.newArrival),

        bestSeller:
            Boolean(product.bestSeller),

        offer:
            Boolean(product.offer)

    };

}


/* ==========================================================
   FETCH PRODUCTS
========================================================== */

async function fetchProducts() {

    const url =
        getDataURL(
            SITE_CONFIG.productAPI
        ) +
        "?v=" +
        Date.now();


    console.log(
        "📦 Loading products:",
        url
    );


    const response =
        await fetch(
            url,
            {
                method: "GET",
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `products.json load failed: ${response.status}`
        );

    }


    const data =
        await response.json();


    if (
        !Array.isArray(data)
    ) {

        throw new Error(
            "products.json অবশ্যই Array হতে হবে"
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
        `✅ ${products.length} টি পণ্য লোড হয়েছে`
    );


    return products;

}


/* ==========================================================
   FETCH CATEGORIES
========================================================== */

async function fetchCategories() {

    const url =
        getDataURL(
            SITE_CONFIG.categoryAPI
        ) +
        "?v=" +
        Date.now();


    console.log(
        "📂 Loading categories:",
        url
    );


    const response =
        await fetch(
            url,
            {
                method: "GET",
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `categories.json load failed: ${response.status}`
        );

    }


    const data =
        await response.json();


    if (
        !Array.isArray(data)
    ) {

        throw new Error(
            "categories.json অবশ্যই Array হতে হবে"
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


    console.log(
        `✅ ${categories.length} টি category লোড হয়েছে`
    );


    return categories;

}


/* ==========================================================
   ENSURE
========================================================== */

async function ensureProductsLoaded() {

    if (
        Array.isArray(products) &&
        products.length
    ) {

        return products;

    }


    return fetchProducts();

}


async function ensureCategoriesLoaded() {

    if (
        Array.isArray(categories) &&
        categories.length
    ) {

        return categories;

    }


    return fetchCategories();

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
   CATEGORY FIND
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


function findSubCategory(
    categoryId,
    subCategoryId
) {

    const category =
        findCategory(categoryId);


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
            normalizeCategory(sub.id) === id
    ) || null;

}


/* ==========================================================
   CATEGORY NAME
========================================================== */

function getCategoryName(categoryId) {

    const category =
        findCategory(categoryId);


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
        subCategoryId ||
        "অন্যান্য"
    );

}


/* ==========================================================
   COUNTS
========================================================== */

function getCategoryProductCount(categoryId) {

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
            )

            &&

            normalizeCategory(
                product.subCategory
            ) ===
            normalizeCategory(
                subCategoryId
            )

    ).length;

}


/* ==========================================================
   CATEGORY BUTTONS
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


        const allButton =
            document.createElement("button");


        allButton.type = "button";

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


        categories.forEach(
            category => {

                const button =
                    document.createElement("button");


                button.type = "button";

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
            "Category Error:",
            error
        );

    }

}


/* ==========================================================
   SUB CATEGORY
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

        area.classList.remove("show");

        updateCategoryInfo(
            "all",
            "all"
        );

        return;

    }


    const category =
        findCategory(categoryId);


    if (!category) {

        area.classList.remove("show");

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

        area.classList.remove("show");

        updateCategoryInfo(
            categoryId,
            "all"
        );

        return;

    }


    area.classList.add("show");


    const title =
        document.createElement("div");


    title.className =
        "sub-category-title";


    title.innerHTML = `

        <span>📁</span>

        <span>
            ${category.name || "ক্যাটাগরি"} এর পণ্য
        </span>

    `;


    wrapper.appendChild(title);


    const buttons =
        document.createElement("div");


    buttons.className =
        "subcategory-buttons";


    const allSub =
        document.createElement("button");


    allSub.type = "button";

    allSub.className =
        "sub-filter-btn active";

    allSub.dataset.category =
        normalizeCategory(
            category.id
        );

    allSub.dataset.subcategory =
        "all";

    allSub.textContent =
        "📦 সব";


    buttons.appendChild(
        allSub
    );


    subCategories.forEach(
        sub => {

            const button =
                document.createElement("button");


            button.type = "button";

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

                button.addEventListener(
                    "click",
                    () => {

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
   CATEGORY INFO
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

            🛍️ <strong>সব পণ্য</strong>

            — মোট

            <strong>
                ${products.length}
            </strong>

            টি পণ্য

        `;

        info.classList.add("show");

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


    info.classList.add("show");

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


function getActiveCategory() {

    return (
        $(".filter-btn.active")
            ?.dataset.category ||
        "all"
    );

}


function getActiveSubCategory() {

    return (
        $(".sub-filter-btn.active")
            ?.dataset.subcategory ||
        "all"
    );

}


/* ==========================================================
   RESET
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
        all.classList.add("active");
    }


    renderSubCategories("all");

    updateCategoryInfo(
        "all",
        "all"
    );

}


/* ==========================================================
   WISHLIST
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


function toggleWishlist(id) {

    id = Number(id);


    if (!Number.isFinite(id)) {
        return;
    }


    const index =
        wishlist.indexOf(id);


    if (index === -1) {

        wishlist.push(id);

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
   PRODUCT CARD
========================================================== */

function createProductCard(product) {

    const card =
        document.createElement("article");


    card.className =
        "product-card";


    card.dataset.productId =
        product.id;


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


    const wishlistButton =
        document.createElement("button");


    wishlistButton.type =
        "button";


    wishlistButton.className =
        "wishlist-btn";


    wishlistButton.dataset.id =
        product.id;


    updateWishlistButton(
        wishlistButton,
        product.id
    );


    wishlistButton.onclick =
        event => {

            event.preventDefault();

            event.stopPropagation();

            toggleWishlist(
                product.id
            );

        };


    card.appendChild(
        wishlistButton
    );


    /* IMAGE */

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


                img.src = src;

                img.className =
                    "product-img";


                if (index === 0) {
                    img.classList.add("active");
                }


                img.alt =
                    product.name ||
                    "Maliha Agro Industry";


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
                    height:220px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:55px;
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


    /* CATEGORY */

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


    /* NAME */

    const title =
        document.createElement("h3");


    title.textContent =
        product.name ||
        "পণ্য";


    card.appendChild(
        title
    );


    /* SUB CATEGORY */

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
            (
                product.subCategoryName ||
                getSubCategoryName(
                    product.category,
                    product.subCategory
                )
            );


        card.appendChild(
            sub
        );

    }


    /* RATING */

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
        "⭐".repeat(rounded) +
        "☆".repeat(5 - rounded) +
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

        const old =
            document.createElement("p");


        old.className =
            "old-price";


        old.textContent =
            formatPrice(oldPrice);


        card.appendChild(
            old
        );

    }


    const priceElement =
        document.createElement("p");


    priceElement.className =
        "price";


    priceElement.textContent =
        formatPrice(price);


    card.appendChild(
        priceElement
    );


    /* STOCK */

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


    /* DESCRIPTION */

    const description =
        document.createElement("p");


    description.textContent =
        product.shortDescription ||
        product.description ||
        "এই পণ্যের বিস্তারিত তথ্য জানতে বিস্তারিত দেখুন।";


    card.appendChild(
        description
    );


    /* BUTTON */

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
            String(
                searchInput?.value || ""
            )
                .trim()
                .toLowerCase();


        category =
            normalizeCategory(
                category
            );


        subCategory =
            normalizeCategory(
                subCategory
            );


        let filtered =
            products.filter(
                product => {

                    const searchable =
                        [

                            product.name,

                            product.type,

                            product.description,

                            product.shortDescription,

                            product.brand,

                            product.sku,

                            product.categoryName,

                            product.subCategoryName

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


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
                        searchable.includes(
                            keyword
                        );


                    return (
                        matchCategory &&
                        matchSubCategory &&
                        matchSearch
                    );

                }
            );


        /* SORT */

        const sortSelect =
            $("#sortProducts");


        const sort =
            sortSelect?.value ||
            "default";


        if (sort === "low-high") {

            filtered.sort(
                (a, b) =>
                    a.price - b.price
            );

        }


        else if (sort === "high-low") {

            filtered.sort(
                (a, b) =>
                    b.price - a.price
            );

        }


        else if (sort === "new") {

            filtered.sort(
                (a, b) =>
                    Number(b.newArrival) -
                    Number(a.newArrival)
            );

        }


        else if (sort === "best") {

            filtered.sort(
                (a, b) =>
                    Number(b.bestSeller) -
                    Number(a.bestSeller)
            );

        }


        else {

            filtered.sort(
                (a, b) =>
                    a.id - b.id
            );

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
                            margin-top:15px;
                        "
                    >
                        🔄 সব পণ্য দেখুন
                    </button>

                </div>

            `;


            $("#resetProductFilter")?.addEventListener(
                "click",
                () => {

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

                }
            );


            updateCategoryInfo(
                category,
                subCategory
            );


            return;

        }


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
            "❌ Product Load Error:",
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
                        font-size:50px;
                    "
                >
                    ❌
                </div>

                <h2>
                    পণ্যের তথ্য লোড করা যায়নি
                </h2>

                <p>
                    products.json ফাইলটি
                    সঠিকভাবে পাওয়া যাচ্ছে না।
                </p>

                <p
                    style="
                        color:#777;
                        font-size:13px;
                        word-break:break-all;
                    "
                >
                    ${getDataURL(
                        SITE_CONFIG.productAPI
                    )}
                </p>

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
   SEARCH
========================================================== */

function initSearch() {

    const input =
        $("#searchProduct");


    if (!input) {
        return;
    }


    if (input.dataset.bound) {
        return;
    }


    input.dataset.bound = "true";


    input.addEventListener(
        "input",
        () => {

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


    if (select.dataset.bound) {
        return;
    }


    select.dataset.bound = "true";


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
   PRODUCT DETAILS
========================================================== */

async function loadProductDetails() {

    const slider =
        $("#productSlider");


    if (!slider) {
        return;
    }


    try {

        const productId =
            getProductId();


        if (
            !Number.isFinite(productId) ||
            productId <= 0
        ) {

            showProductNotFound();

            return;

        }


        await ensureProductsLoaded();


        currentProduct =
            products.find(
                product =>
                    Number(product.id) ===
                    productId
            );


        if (!currentProduct) {

            showProductNotFound();

            return;

        }


        $("#productName").textContent =
            currentProduct.name || "পণ্য";


        $("#productBrand").textContent =
            currentProduct.brand ||
            SITE_CONFIG.companyName;


        if ($("#productBrandInfo")) {

            $("#productBrandInfo").textContent =
                currentProduct.brand ||
                SITE_CONFIG.companyName;

        }


        if ($("#productRating")) {

            $("#productRating").textContent =
                `(${currentProduct.rating || 0})`;

        }


        if ($("#productStockInfo")) {

            $("#productStockInfo").textContent =
                currentProduct.stock ||
                "স্টকে আছে";

        }


        if ($("#productStock")) {

            $("#productStock").textContent =
                "🟢 " +
                (
                    currentProduct.stock ||
                    "স্টকে আছে"
                );

        }


        if ($("#productCategory")) {

            $("#productCategory").textContent =
                currentProduct.categoryName ||
                getCategoryName(
                    currentProduct.category
                ) ||
                "-";

        }


        if ($("#productSubCategory")) {

            $("#productSubCategory").textContent =
                currentProduct.subCategoryName ||
                getSubCategoryName(
                    currentProduct.category,
                    currentProduct.subCategory
                ) ||
                "-";

        }


        if ($("#productType")) {

            $("#productType").textContent =
                currentProduct.type || "-";

        }


        if ($("#productSku")) {

            $("#productSku").textContent =
                currentProduct.sku || "-";

        }


        if ($("#productWeight")) {

            $("#productWeight").textContent =
                currentProduct.weight || "-";

        }


        if ($("#productDescription")) {

            $("#productDescription").textContent =
                currentProduct.description ||
                currentProduct.shortDescription ||
                "তথ্য নেই";

        }


        /* PRICE */

        const price =
            Number(
                currentProduct.price || 0
            );


        const oldPrice =
            Number(
                currentProduct.oldPrice || 0
            );


        if ($("#productPrice")) {

            $("#productPrice").textContent =
                formatPrice(price);

        }


        if ($("#productOldPrice")) {

            if (
                oldPrice > price &&
                price > 0
            ) {

                $("#productOldPrice").textContent =
                    formatPrice(oldPrice);

                $("#productOldPrice").style.display =
                    "inline";

            }
            else {

                $("#productOldPrice").style.display =
                    "none";

            }

        }


        if ($("#productDiscount")) {

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


                $("#productDiscount").textContent =
                    `${discount}% OFF`;


                $("#productDiscount").style.display =
                    "inline-block";

            }
            else {

                $("#productDiscount").style.display =
                    "none";

            }

        }


        if ($("#productReview")) {

            $("#productReview").textContent =
                `(${currentProduct.rating || 0} Reviews)`;

        }


        renderProductGallery();

        initDetailGallery();

        initQuantity();

        initOrderButton();

        initProductWishlist();

        loadRelatedProducts();


        if ($("#productLoading")) {

            $("#productLoading").style.display =
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


        productDetailError(
            "পণ্যের তথ্য লোড করা যায়নি।"
        );

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
        loading.style.display = "none";
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
            >
                📦 সকল পণ্য দেখুন
            </a>

        </div>

    `;

}


/* ==========================================================
   PRODUCT GALLERY
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
        getGallery(
            currentProduct
        );


    slider.innerHTML = "";


    if (!gallery.length) {

        slider.innerHTML = `

            <div
                style="
                    width:100%;
                    min-height:300px;
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    background:#f5f8f5;
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

                image.classList.add(
                    "active"
                );

            }


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
   DETAIL SLIDER
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
            counter.textContent = "0 / 0";
        }

        return;

    }


    function showImage(index) {

        if (index < 0) {
            index = images.length - 1;
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


    if (previous) {

        previous.onclick =
            event => {

                event.preventDefault();

                showImage(
                    detailSliderIndex - 1
                );

            };

    }


    if (next) {

        next.onclick =
            event => {

                event.preventDefault();

                showImage(
                    detailSliderIndex + 1
                );

            };

    }


    images.forEach(
        image => {

            image.onclick =
                () => {

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
        Math.max(
            1,
            parseInt(
                input.value,
                10
            ) || 1
        );


    function updateQuantity() {

        input.value =
            quantity;


        total.textContent =
            formatPrice(
                Number(
                    currentProduct.price || 0
                ) *
                quantity
            );


        updateOrderLink(
            quantity
        );

    }


    if (plus) {

        plus.onclick =
            event => {

                event.preventDefault();

                quantity++;

                updateQuantity();

            };

    }


    if (minus) {

        minus.onclick =
            event => {

                event.preventDefault();

                if (quantity > 1) {

                    quantity--;

                    updateQuantity();

                }

            };

    }


    input.oninput =
        () => {

            quantity =
                Math.max(
                    1,
                    parseInt(
                        input.value,
                        10
                    ) || 1
                );


            updateQuantity();

        };


    updateQuantity();

}


/* ==========================================================
   WHATSAPP ORDER
========================================================== */

function initOrderButton() {

    if (!$("#orderNow")) {
        return;
    }


    updateOrderLink(1);

}


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
        encodeURIComponent(
            message
        );


    button.target =
        "_blank";


    button.rel =
        "noopener noreferrer";

}


/* ==========================================================
   PRODUCT WISHLIST
========================================================== */

function initProductWishlist() {

    const button =
        $("#productWishlist");


    if (
        !button ||
        !currentProduct
    ) {
        return;
    }


    updateWishlistButton(
        button,
        currentProduct.id
    );


    if (button.dataset.bound) {
        return;
    }


    button.dataset.bound = "true";


    button.onclick =
        event => {

            event.preventDefault();

            toggleWishlist(
                currentProduct.id
            );

        };

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
            product =>

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
        ].slice(0, 4);


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

                📦 এই ক্যাটাগরিতে
                অন্য কোনো পণ্য নেই।

            </div>

        `;

        return;

    }


    related.forEach(
        product => {

            container.appendChild(
                createProductCard(
                    product
                )
            );

        }
    );


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


    modalImage.src =
        src;


    modal.style.display =
        "flex";

}


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


    if (
        close &&
        !close.dataset.bound
    ) {

        close.dataset.bound =
            "true";


        close.onclick =
            () => {

                modal.style.display =
                    "none";


                modalImage.src =
                    "";

            };

    }


    if (
        !modal.dataset.bound
    ) {

        modal.dataset.bound =
            "true";


        modal.onclick =
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    modal.style.display =
                        "none";


                    modalImage.src =
                        "";

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
            products.filter(
                product =>
                    wishlist.includes(
                        Number(product.id)
                    )
            );


        container.innerHTML = "";


        if (!wishlistProducts.length) {

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
                    >
                        🛍️ পণ্য দেখুন
                    </a>

                </div>

            `;

            return;

        }


        wishlistProducts.forEach(
            product => {

                container.appendChild(
                    createProductCard(
                        product
                    )
                );

            }
        );


        startHomeSlider();

    }
    catch (error) {

        console.error(
            "Wishlist Error:",
            error
        );

    }

}


/* ==========================================================
   HOME SLIDER
========================================================== */

function stopHomeSlider() {

    homeSliderTimers.forEach(
        timer =>
            clearInterval(timer)
    );


    homeSliderTimers = [];

}


function startHomeSlider() {

    stopHomeSlider();


    $$(".slider")
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
                        () => {

                            images[index]
                                ?.classList
                                .remove(
                                    "active"
                                );


                            index =
                                (
                                    index + 1
                                ) %
                                images.length;


                            images[index]
                                ?.classList
                                .add(
                                    "active"
                                );

                        },
                        3000
                    );


                homeSliderTimers.push(
                    timer
                );

            }
        );

}


/* ==========================================================
   SHARE
========================================================== */

function initShareProductButtons() {

    const buttons =
        $$(
            "[data-share-product], #shareProduct"
        );


    buttons.forEach(
        button => {

            if (button.dataset.bound) {
                return;
            }


            button.dataset.bound =
                "true";


            button.onclick =
                async event => {

                    event.preventDefault();


                    const shareData = {

                        title:
                            currentProduct?.name ||
                            SITE_CONFIG.companyName,

                        text:
                            currentProduct?.shortDescription ||
                            currentProduct?.description ||
                            "",

                        url:
                            window.location.href

                    };


                    try {

                        if (
                            navigator.share
                        ) {

                            await navigator.share(
                                shareData
                            );

                        }
                        else {

                            await navigator.clipboard.writeText(
                                window.location.href
                            );


                            alert(
                                "🔗 পণ্যের লিংক কপি হয়েছে।"
                            );

                        }

                    }
                    catch (error) {

                        console.log(
                            "Share cancelled"
                        );

                    }

                };

        }
    );

}


/* ==========================================================
   ERROR
========================================================== */

function productDetailError(
    message
) {

    const loading =
        $("#productLoading");


    if (!loading) {
        return;
    }


    loading.style.display =
        "block";


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
   INITIALIZE
========================================================== */

async function initializeApp() {

    console.log(
        "🚀 Maliha Agro Industry initializing..."
    );


    try {

        /*
           Products MUST load.
           Categories fail করলে products বন্ধ হবে না।
        */

        try {

            await ensureProductsLoaded();

        }
        catch (error) {

            console.error(
                "❌ Products failed:",
                error
            );

        }


        try {

            await ensureCategoriesLoaded();

        }
        catch (error) {

            console.error(
                "⚠️ Categories failed:",
                error
            );

        }


        /* CATEGORY */

        await renderCategoryButtons();


        /* SEARCH */

        initSearch();


        /* SORT */

        initSort();


        /* PRODUCTS PAGE */

        if (
            $("#productList")
        ) {

            await loadProducts(
                getActiveCategory(),
                getActiveSubCategory()
            );

        }


        /* PRODUCT DETAILS */

        if (
            $("#productSlider")
        ) {

            await loadProductDetails();

        }


        /* WISHLIST */

        if (
            $("#wishlistProducts")
        ) {

            await renderWishlistPage();

        }


        /* MODAL */

        initImagePreview();


        /* SHARE */

        initShareProductButtons();


        console.log(
            "✅ Maliha Agro Industry initialized."
        );

    }
    catch (error) {

        console.error(
            "❌ Initialization Error:",
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
