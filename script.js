"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   SCRIPT.JS — FINAL A-Z VERSION
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

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
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

        reviewCount:
            Number(
                product.reviewCount || 0
            ),

        newArrival:
            Boolean(
                product.newArrival
            ),

        bestSeller:
            Boolean(
                product.bestSeller
            ),

        offer:
            Boolean(
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

    if (products.length) {
        return products;
    }

    return await fetchProducts();
}


async function ensureCategoriesLoaded() {

    if (categories.length) {
        return categories;
    }

    return await fetchCategories();
}


/* ==========================================================
   WISHLIST
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
                    .filter(Number.isFinite)
                : [];

    }
    catch {

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

    id =
        Number(id);

    if (
        !Number.isFinite(id)
    ) {
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

    updateWishlistCounter();

    $$(".wishlist-btn")
        .forEach(button => {

            updateWishlistButton(
                button,
                button.dataset.id
            );

        });

    if (
        $("#wishlistProducts")
    ) {

        renderWishlistPage();

    }

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

    if (
        Array.isArray(product.images)
    ) {

        gallery.push(
            ...product.images
        );

    }

    if (
        Array.isArray(product.gallery)
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
   CATEGORY HELPERS
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
   URL PRODUCT ID
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
   PRODUCT DETAIL PAGE
   IMPORTANT:
   এখানে HTML-এর ভেতরের Product JSON দেখানো হবে না।
   JavaScript নিজেই পুরো Details UI তৈরি করবে।
========================================================== */

async function loadProductDetails() {

    const container =
        $("#productDetails");

    if (!container) {
        return;
    }

    try {

        const productId =
            getProductId();

        if (
            !productId ||
            productId <= 0
        ) {

            showProductNotFound(
                container,
                "সঠিক Product ID পাওয়া যায়নি।"
            );

            return;

        }

        await ensureProductsLoaded();

        currentProduct =
            products.find(
                product =>
                    Number(product.id) ===
                    Number(productId)
            );

        if (!currentProduct) {

            showProductNotFound(
                container,
                "এই পণ্যটি পাওয়া যায়নি।"
            );

            return;

        }

        renderCompleteProductDetails(
            container,
            currentProduct
        );

        console.log(
            "✅ Product Details Loaded:",
            currentProduct
        );

    }
    catch (error) {

        console.error(
            "Product Details Error:",
            error
        );

        showProductError(
            container,
            error
        );

    }

}


/* ==========================================================
   COMPLETE PRODUCT DETAILS UI
========================================================== */

function renderCompleteProductDetails(
    container,
    product
) {

    const gallery =
        getGallery(product);

    const price =
        Number(product.price || 0);

    const oldPrice =
        Number(product.oldPrice || 0);

    let discount = 0;

    if (
        oldPrice > price &&
        price > 0
    ) {

        discount =
            Math.round(
                (
                    (oldPrice - price) /
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

    container.innerHTML = `

        <div
            class="product-details"
            style="
                padding:15px 0 35px;
            "
        >

            <div
                style="
                    margin-bottom:15px;
                "
            >

                <a
                    href="products.html"
                    class="btn"
                    style="
                        display:inline-flex;
                        width:auto;
                        padding:8px 14px;
                        margin:0;
                    "
                >
                    ← সকল পণ্যে ফিরে যান
                </a>

            </div>


            <div
                class="product-details-layout"
            >

                <!-- ====================================
                     PRODUCT GALLERY
                ==================================== -->

                <div
                    class="product-gallery"
                >

                    <div
                        id="productSlider"
                    >

                        ${
                            gallery.length
                            ?
                            gallery.map(
                                (src, index) => `
                                    <img
                                        src="${src}"
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
                            ).join("")
                            :
                            `
                                <div
                                    style="
                                        width:100%;
                                        height:320px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        flex-direction:column;
                                        background:#f5f8f5;
                                        border-radius:15px;
                                        color:#1F8F4D;
                                    "
                                >

                                    <div
                                        style="font-size:60px;"
                                    >
                                        🌱
                                    </div>

                                    <p>
                                        পণ্যের ছবি পাওয়া যায়নি।
                                    </p>

                                </div>
                            `
                        }

                    </div>


                    ${
                        gallery.length > 1
                        ?
                        `
                            <button
                                type="button"
                                id="prevImage"
                                class="gallery-control"
                                style="
                                    left:10px;
                                "
                            >
                                ❮
                            </button>

                            <button
                                type="button"
                                id="nextImage"
                                class="gallery-control"
                                style="
                                    right:10px;
                                "
                            >
                                ❯
                            </button>

                            <div
                                id="sliderCounter"
                                style="
                                    position:absolute;
                                    left:50%;
                                    bottom:10px;
                                    transform:translateX(-50%);
                                    z-index:5;
                                    background:rgba(0,0,0,.55);
                                    color:#fff;
                                    padding:4px 10px;
                                    border-radius:20px;
                                    font-size:12px;
                                "
                            >
                                1 / ${gallery.length}
                            </div>
                        `
                        :
                        ""
                    }

                </div>


                <!-- ====================================
                     PRODUCT INFORMATION
                ==================================== -->

                <div
                    class="product-info"
                >

                    ${
                        product.offer
                        ?
                        `
                            <span
                                style="
                                    display:inline-block;
                                    background:#e53935;
                                    color:#fff;
                                    padding:5px 10px;
                                    border-radius:7px;
                                    font-size:11px;
                                    font-weight:700;
                                    margin-bottom:8px;
                                "
                            >
                                🔥 অফার
                            </span>
                        `
                        :
                        ""
                    }


                    <div
                        style="
                            color:#1F8F4D;
                            font-size:13px;
                            font-weight:600;
                            margin-bottom:5px;
                        "
                    >
                        ${escapeHTML(categoryName)}
                        ${
                            subCategoryName
                            ?
                            ` → ${escapeHTML(
                                subCategoryName
                            )}`
                            :
                            ""
                        }
                    </div>


                    <h1>
                        ${escapeHTML(
                            product.name ||
                            "পণ্য"
                        )}
                    </h1>


                    <p
                        style="
                            color:#666;
                            margin-bottom:8px;
                        "
                    >
                        প্রস্তুতকারক:
                        <strong>
                            ${escapeHTML(
                                product.brand ||
                                SITE_CONFIG.companyName
                            )}
                        </strong>
                    </p>


                    <!-- RATING -->

                    <div
                        style="
                            color:#e5a000;
                            margin:7px 0;
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
                                font-size:13px;
                            "
                        >
                            (${Number(
                                product.reviewCount || 0
                            )} Reviews)
                        </span>

                    </div>


                    <!-- PRICE -->

                    <div
                        style="
                            margin:10px 0;
                        "
                    >

                        <span
                            style="
                                color:#1F8F4D;
                                font-size:30px;
                                font-weight:800;
                            "
                        >
                            ${formatPrice(price)}
                        </span>


                        ${
                            oldPrice > price
                            ?
                            `
                                <span
                                    style="
                                        color:#999;
                                        text-decoration:line-through;
                                        margin-left:8px;
                                    "
                                >
                                    ${formatPrice(
                                        oldPrice
                                    )}
                                </span>

                                <span
                                    style="
                                        display:inline-block;
                                        background:#e53935;
                                        color:white;
                                        padding:3px 7px;
                                        border-radius:5px;
                                        font-size:11px;
                                        margin-left:6px;
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
                            background:#eef9f1;
                            display:inline-block;
                            padding:5px 9px;
                            border-radius:7px;
                            font-size:13px;
                            margin-bottom:12px;
                        "
                    >
                        🟢 ${escapeHTML(
                            product.stock ||
                            "স্টকে আছে"
                        )}
                    </div>


                    <!-- DESCRIPTION -->

                    <p
                        style="
                            color:#555;
                            margin:8px 0 15px;
                        "
                    >
                        ${escapeHTML(
                            product.description ||
                            product.shortDescription ||
                            "এই পণ্যের বিস্তারিত তথ্য বর্তমানে পাওয়া যাচ্ছে না।"
                        )}
                    </p>


                    <!-- BASIC INFO -->

                    <div
                        style="
                            border-top:1px solid #eee;
                            border-bottom:1px solid #eee;
                            padding:12px 0;
                            margin-bottom:15px;
                        "
                    >

                        <p>
                            <strong>📂 ক্যাটাগরি:</strong>
                            ${escapeHTML(
                                categoryName || "-"
                            )}
                        </p>

                        <p>
                            <strong>📁 সাব-ক্যাটাগরি:</strong>
                            ${escapeHTML(
                                subCategoryName || "-"
                            )}
                        </p>

                        <p>
                            <strong>🏷️ ধরন:</strong>
                            ${escapeHTML(
                                product.type || "-"
                            )}
                        </p>

                        <p>
                            <strong>🔖 SKU:</strong>
                            ${escapeHTML(
                                product.sku || "-"
                            )}
                        </p>

                        <p>
                            <strong>⚖️ ওজন:</strong>
                            ${escapeHTML(
                                product.weight || "-"
                            )}
                        </p>

                    </div>


                    <!-- FEATURES -->

                    ${
                        Array.isArray(
                            product.features
                        ) &&
                        product.features.length
                        ?
                        `
                            <div
                                style="
                                    margin-bottom:15px;
                                "
                            >

                                <h3
                                    style="
                                        color:#1F8F4D;
                                        margin-bottom:8px;
                                    "
                                >
                                    ✅ পণ্যের বৈশিষ্ট্য
                                </h3>

                                <ul
                                    style="
                                        padding-left:20px;
                                    "
                                >

                                    ${product.features
                                        .map(
                                            feature =>
                                                `
                                                    <li
                                                        style="
                                                            margin-bottom:5px;
                                                        "
                                                    >
                                                        ${escapeHTML(
                                                            feature
                                                        )}
                                                    </li>
                                                `
                                        )
                                        .join("")
                                    }

                                </ul>

                            </div>
                        `
                        :
                        ""
                    }


                    <!-- QUANTITY -->

                    <div
                        style="
                            margin-top:12px;
                        "
                    >

                        <strong>
                            পরিমাণ:
                        </strong>


                        <div
                            style="
                                display:flex;
                                align-items:center;
                                width:max-content;
                                border:1px solid #ddd;
                                border-radius:9px;
                                overflow:hidden;
                                margin-top:7px;
                            "
                        >

                            <button
                                type="button"
                                id="minusQty"
                                style="
                                    width:40px;
                                    height:40px;
                                    border:0;
                                    background:#f1f4f2;
                                    cursor:pointer;
                                    font-size:18px;
                                "
                            >
                                −
                            </button>


                            <input
                                id="qty"
                                type="number"
                                min="1"
                                value="1"
                                style="
                                    width:55px;
                                    height:40px;
                                    border:0;
                                    outline:0;
                                    text-align:center;
                                "
                            >


                            <button
                                type="button"
                                id="plusQty"
                                style="
                                    width:40px;
                                    height:40px;
                                    border:0;
                                    background:#f1f4f2;
                                    cursor:pointer;
                                    font-size:18px;
                                "
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <!-- TOTAL -->

                    <p
                        style="
                            margin-top:12px;
                            font-weight:700;
                        "
                    >

                        মোট মূল্য:

                        <span
                            id="totalPrice"
                            style="
                                color:#1F8F4D;
                                font-size:20px;
                            "
                        >
                            ${formatPrice(price)}
                        </span>

                    </p>


                    <!-- ORDER -->

                    <a
                        id="orderNow"
                        href="#"
                        class="btn"
                        style="
                            margin-top:12px;
                        "
                    >
                        <i
                            class="fa-brands fa-whatsapp"
                            style="margin-right:7px;"
                        ></i>

                        WhatsApp-এ অর্ডার করুন

                    </a>


                    <!-- SHARE -->

                    <button
                        type="button"
                        id="shareProduct"
                        class="btn"
                        style="
                            background:#555;
                            margin-top:8px;
                        "
                    >
                        🔗 পণ্য শেয়ার করুন
                    </button>


                    <!-- WISHLIST -->

                    <button
                        type="button"
                        id="detailWishlist"
                        class="btn"
                        style="
                            background:#fff;
                            color:#1F8F4D;
                            border:1px solid #1F8F4D;
                            margin-top:8px;
                        "
                    >
                        🤍 Wishlist-এ রাখুন
                    </button>

                </div>

            </div>


            <!-- ====================================
                 RELATED PRODUCTS
            ==================================== -->

            <section
                style="
                    margin-top:30px;
                "
            >

                <h2
                    style="
                        color:#1F8F4D;
                        margin-bottom:12px;
                    "
                >
                    🛍️ সম্পর্কিত পণ্য
                </h2>


                <div
                    id="relatedProducts"
                    class="product-grid"
                >
                </div>

            </section>

        </div>

    `;


    initDetailGallery();

    initQuantity();

    initOrderButton();

    initShareProduct();

    initDetailWishlist();

    loadRelatedProducts();

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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
   PRODUCT NOT FOUND
========================================================== */

function showProductNotFound(
    container,
    message
) {

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
                "
            >
                products.json অথবা
                JavaScript ফাইলটি সঠিকভাবে
                লোড হচ্ছে কিনা দেখুন।
            </p>

            <button
                type="button"
                class="btn"
                onclick="location.reload()"
                style="
                    border:0;
                    max-width:200px;
                    margin:15px auto 0;
                "
            >
                🔄 আবার চেষ্টা করুন
            </button>

        </div>

    `;

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


    function showImage(index) {

        if (index < 0) {
            index =
                images.length - 1;
        }

        if (
            index >= images.length
        ) {

            index = 0;

        }

        images.forEach(
            image =>
                image.classList.remove(
                    "active"
                )
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


    images.forEach(
        image => {

            image.onerror =
                function() {

                    this.style.display =
                        "none";

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


    function update() {

        let quantity =
            parseInt(
                input.value,
                10
            ) || 1;

        quantity =
            Math.max(
                1,
                quantity
            );

        input.value =
            quantity;


        const price =
            Number(
                currentProduct.price || 0
            );


        if (total) {

            total.textContent =
                formatPrice(
                    price * quantity
                );

        }


        updateOrderLink(
            quantity
        );

    }


    if (plus) {

        plus.onclick =
            () => {

                input.value =
                    (
                        Number(
                            input.value
                        ) || 1
                    ) + 1;

                update();

            };

    }


    if (minus) {

        minus.onclick =
            () => {

                const value =
                    Number(
                        input.value
                    ) || 1;

                if (value > 1) {

                    input.value =
                        value - 1;

                    update();

                }

            };

    }


    input.addEventListener(
        "input",
        update
    );


    update();

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
        );


    const subCategoryName =
        currentProduct.subCategoryName ||
        getSubCategoryName(
            currentProduct.category,
            currentProduct.subCategory
        );


    const message =

`🌿 ${SITE_CONFIG.companyName}

আমি নিচের পণ্যটি অর্ডার করতে চাই।

━━━━━━━━━━━━━━━━━━

📦 পণ্যের নাম:
${currentProduct.name || "-"}

📂 ক্যাটাগরি:
${categoryName || "-"}

📁 সাব-ক্যাটাগরি:
${subCategoryName || "-"}

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
   ORDER BUTTON
========================================================== */

function initOrderButton() {

    const input =
        $("#qty");

    updateOrderLink(
        Number(
            input?.value || 1
        )
    );

}


/* ==========================================================
   SHARE
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


    button.onclick =
        async function() {

            const shareData = {

                title:
                    currentProduct.name ||
                    SITE_CONFIG.companyName,

                text:
                    currentProduct.shortDescription ||
                    currentProduct.description ||
                    "Maliha Agro Industry",

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
                        "✅ পণ্যের লিংক কপি হয়েছে।"
                    );

                }

            }
            catch (error) {

                console.log(
                    "Share cancelled:",
                    error
                );

            }

        };

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


    function update() {

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

    }


    button.onclick =
        () => {

            toggleWishlist(
                currentProduct.id
            );

            update();

        };


    update();

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


    if (product.offer) {

        const badge =
            document.createElement(
                "span"
            );

        badge.className =
            "offer-badge";

        badge.textContent =
            "🔥 অফার";

        card.appendChild(
            badge
        );

    }


    const wish =
        document.createElement(
            "button"
        );

    wish.type =
        "button";

    wish.className =
        "wishlist-btn";

    wish.dataset.id =
        product.id;

    wish.setAttribute(
        "aria-label",
        "Wishlist"
    );

    updateWishlistButton(
        wish,
        product.id
    );

    wish.onclick =
        event => {

            event.preventDefault();

            event.stopPropagation();

            toggleWishlist(
                product.id
            );

        };

    card.appendChild(
        wish
    );


    /* IMAGE */

    const slider =
        document.createElement(
            "div"
        );

    slider.className =
        "slider";


    const gallery =
        getGallery(product);


    if (gallery.length) {

        gallery.forEach(
            (src, index) => {

                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    src;

                image.alt =
                    product.name ||
                    "Maliha Agro Industry";

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
    else {

        slider.innerHTML = `

            <div
                style="
                    width:100%;
                    height:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:55px;
                    background:#f5f8f5;
                    color:#1F8F4D;
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

    if (
        product.subCategory ||
        product.subCategoryName
    ) {

        const sub =
            document.createElement(
                "small"
            );

        sub.style.cssText = `
            display:block;
            color:#777;
            font-size:11px;
            margin-bottom:5px;
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
        document.createElement(
            "p"
        );

    rating.className =
        "rating";

    const ratingValue =
        Number(
            product.rating || 0
        );

    const stars =
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
        "⭐".repeat(stars) +
        "☆".repeat(5 - stars) +
        ` (${ratingValue})`;

    card.appendChild(
        rating
    );


    /* OLD PRICE */

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
            document.createElement(
                "p"
            );

        old.className =
            "old-price";

        old.textContent =
            formatPrice(
                oldPrice
            );

        card.appendChild(
            old
        );

    }


    /* PRICE */

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


    /* SHORT DESCRIPTION */

    const description =
        document.createElement(
            "p"
        );

    description.textContent =
        product.shortDescription ||
        product.description ||
        "";

    card.appendChild(
        description
    );


    /* DETAILS BUTTON */

    const details =
        document.createElement(
            "a"
        );

    details.href =
        "product.html?id=" +
        encodeURIComponent(
            product.id
        );

    details.className =
        "btn";

    details.textContent =
        "📖 বিস্তারিত দেখুন";

    card.appendChild(
        details
    );


    return card;

}


/* ==========================================================
   LOAD PRODUCTS PAGE
========================================================== */

async function loadProducts(
    category = "all",
    subCategory = "all"
) {

    const container =
        $("#productList");

    if (!container) {
        return;
    }


    try {

        await ensureProductsLoaded();


        const search =
            $("#searchProduct");

        const keyword =
            String(
                search?.value || ""
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

                    const matchCategory =
                        category === "all" ||
                        normalizeCategory(
                            product.category
                        ) === category;


                    const matchSub =
                        subCategory === "all" ||
                        normalizeCategory(
                            product.subCategory
                        ) === subCategory;


                    const text =
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


                    const matchSearch =
                        !keyword ||
                        text.includes(
                            keyword
                        );


                    return (
                        matchCategory &&
                        matchSub &&
                        matchSearch
                    );

                }
            );


        /* SORT */

        const sort =
            $("#sortProducts")?.value ||
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
                    Number(b.newArrival) -
                    Number(a.newArrival)
            );

        }
        else if (
            sort === "best"
        ) {

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


        container.innerHTML =
            "";


        if (
            !filtered.length
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
                        style="font-size:50px;"
                    >
                        🔍
                    </div>

                    <h2>
                        কোনো পণ্য পাওয়া যায়নি
                    </h2>

                    <p>
                        অন্য কোনো নাম বা ক্যাটাগরি দিয়ে চেষ্টা করুন।
                    </p>

                    <button
                        type="button"
                        id="resetProductFilter"
                        class="btn"
                        style="
                            max-width:220px;
                            margin:15px auto 0;
                            border:0;
                        "
                    >
                        🔄 সব পণ্য দেখুন
                    </button>

                </div>

            `;


            $("#resetProductFilter")
                ?.addEventListener(
                    "click",
                    () => {

                        if (search) {
                            search.value = "";
                        }

                        if (
                            $("#sortProducts")
                        ) {

                            $("#sortProducts")
                                .value =
                                "default";

                        }

                        loadProducts(
                            "all",
                            "all"
                        );

                    }
                );


            return;

        }


        const count =
            document.createElement(
                "div"
            );

        count.className =
            "product-result-count";

        count.style.cssText = `
            grid-column:1/-1;
            padding:5px 2px;
        `;

        count.innerHTML = `
            📦 মোট
            <strong>
                ${filtered.length}
            </strong>
            টি পণ্য পাওয়া গেছে
        `;

        container.appendChild(
            count
        );


        filtered.forEach(
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
    catch (error) {

        console.error(
            "Products Error:",
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
                    style="font-size:45px;"
                >
                    ❌
                </div>

                <h2>
                    পণ্য লোড করা যায়নি
                </h2>

                <p>
                    data/products.json ফাইলটি পরীক্ষা করুন।
                </p>

                <button
                    type="button"
                    class="btn"
                    onclick="location.reload()"
                    style="
                        max-width:200px;
                        margin:15px auto 0;
                        border:0;
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
        input.dataset.bound
    ) {
        return;
    }

    input.dataset.bound =
        "true";


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
   CATEGORY
========================================================== */

function renderCategoryButtons() {

    const wrapper =
        $("#mainCategoryButtons");

    if (!wrapper) {
        return;
    }

    wrapper.innerHTML = "";


    const all =
        document.createElement(
            "button"
        );

    all.type =
        "button";

    all.className =
        "filter-btn active";

    all.dataset.category =
        "all";

    all.textContent =
        "🛍️ সব পণ্য";

    wrapper.appendChild(
        all
    );


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "filter-btn";

            button.dataset.category =
                normalizeCategory(
                    category.id
                );

            button.textContent =
                (
                    category.icon ||
                    "📂"
                ) +
                " " +
                (
                    category.name ||
                    "ক্যাটাগরি"
                );

            wrapper.appendChild(
                button
            );

        }
    );


    initCategoryFilter();

}


function initCategoryFilter() {

    $$(".filter-btn")
        .forEach(button => {

            button.onclick =
                () => {

                    $$(".filter-btn")
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


                    renderSubCategories(
                        category
                    );


                    loadProducts(
                        category,
                        "all"
                    );

                };

        });

}


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
        )
    ) {

        area.classList.remove(
            "show"
        );

        return;

    }


    const subs =
        category.subCategories
            .filter(
                sub =>
                    sub &&
                    sub.status !== "inactive"
            );


    if (!subs.length) {

        area.classList.remove(
            "show"
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

    title.textContent =
        `📁 ${category.name || "ক্যাটাগরি"} এর পণ্য`;

    wrapper.appendChild(
        title
    );


    const buttons =
        document.createElement(
            "div"
        );

    buttons.className =
        "subcategory-buttons";


    const all =
        document.createElement(
            "button"
        );

    all.type =
        "button";

    all.className =
        "sub-filter-btn active";

    all.dataset.category =
        normalizeCategory(
            category.id
        );

    all.dataset.subcategory =
        "all";

    all.textContent =
        "📦 সব";

    buttons.appendChild(
        all
    );


    subs.forEach(
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

            button.textContent =
                (
                    sub.icon ||
                    "📦"
                ) +
                " " +
                (
                    sub.name ||
                    "সাব-ক্যাটাগরি"
                );

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


                        loadProducts(
                            button.dataset.category,
                            button.dataset.subcategory
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


    related =
        related.slice(
            0,
            4
        );


    container.innerHTML =
        "";


    if (!related.length) {

        container.innerHTML = `

            <div
                class="card"
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:25px;
                "
            >
                এই ক্যাটাগরিতে বর্তমানে
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


    startSliders();

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


        const items =
            products.filter(
                product =>
                    wishlist.includes(
                        Number(
                            product.id
                        )
                    )
            );


        const summary =
            $("#wishlistSummary");

        if (summary) {

            summary.textContent =
                `❤️ আপনার Wishlist-এ ${items.length} টি পণ্য আছে।`;

        }


        container.innerHTML =
            "";


        if (!items.length) {

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
                        পছন্দের পণ্যের ❤️ বাটনে ক্লিক করলে
                        এখানে দেখা যাবে।
                    </p>

                    <a
                        href="products.html"
                        class="btn"
                        style="
                            max-width:200px;
                            margin:15px auto 0;
                        "
                    >
                        🛍️ পণ্য দেখুন
                    </a>

                </div>

            `;

            return;

        }


        items.forEach(
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
    catch (error) {

        console.error(
            "Wishlist Error:",
            error
        );

    }

}


/* ==========================================================
   IMAGE MODAL
========================================================== */

function openImageModal(src) {

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

    modal.style.display =
        "flex";

}


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

        close.onclick =
            () => {

                modal.style.display =
                    "none";

                const image =
                    $("#modalImage");

                if (image) {
                    image.src = "";
                }

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

                    const image =
                        $("#modalImage");

                    if (image) {
                        image.src = "";
                    }

                }

            };

    }

}


/* ==========================================================
   SLIDERS
========================================================== */

function stopSliders() {

    sliderTimers.forEach(
        timer =>
            clearInterval(
                timer
            )
    );

    sliderTimers = [];

}


function startSliders() {

    stopSliders();


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

                        },
                        3000
                    );


                sliderTimers.push(
                    timer
                );

            }
        );

}


/* ==========================================================
   INITIALIZE
========================================================== */

async function initializeApp() {

    try {

        loadWishlistStorage();

        updateWishlistCounter();

        await Promise.allSettled([

            ensureProductsLoaded(),

            ensureCategoriesLoaded()

        ]);


        /* ==================================================
           PRODUCT DETAILS PAGE
        ================================================== */

        if (
            $("#productDetails")
        ) {

            await loadProductDetails();

        }


        /* ==================================================
           PRODUCTS PAGE
        ================================================== */

        if (
            $("#productList")
        ) {

            renderCategoryButtons();

            initSearch();

            initSort();

            await loadProducts(
                getActiveCategory(),
                getActiveSubCategory()
            );

        }


        /* ==================================================
           WISHLIST PAGE
        ================================================== */

        if (
            $("#wishlistProducts")
        ) {

            await renderWishlistPage();

        }


        /* ==================================================
           IMAGE MODAL
        ================================================== */

        initImagePreview();


        updateWishlistCounter();


        console.log(
            "✅ Maliha Agro Industry — App Initialized Successfully"
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
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

}
else {

    initializeApp();

}
