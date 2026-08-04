"use strict";

/* ==========================================================
   MALIHA AGRO INDUSTRY
   DYNAMIC PRODUCT SYSTEM
   ==========================================================

   Features:
   ✅ Dynamic Main Category
   ✅ Dynamic Sub Category
   ✅ Admin/API Ready
   ✅ Product Search
   ✅ Product Sort
   ✅ Wishlist
   ✅ Product Gallery
   ✅ Product Details
   ✅ WhatsApp Order
   ✅ Related Products
   ✅ Dynamic Category Name
   ✅ Future Admin Panel Ready
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

let deferredPrompt = null;
let homeSliderTimers = [];
let detailSliderIndex = 0;


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

    companyName: "Maliha Agro Industry",

    whatsapp: "8801303679189",

    productAPI: "data/products.json",

    categoryAPI: "data/categories.json"

};


/* ==========================================================
   PRICE FORMAT
========================================================== */

function formatPrice(price) {

    return "৳" +
        Number(price || 0)
            .toLocaleString("en-BD");

}


/* ==========================================================
   PRODUCT ID
========================================================== */

function getProductId() {

    return Number(
        new URLSearchParams(
            window.location.search
        ).get("id")
    );

}


/* ==========================================================
   IMAGE PATH
========================================================== */

function imagePath(path) {

    if (!path) return "";

    let src = String(path)
        .trim()
        .replace(/\\/g, "/");

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
   NORMALIZE TEXT / CATEGORY ID
========================================================== */

function normalizeCategory(value) {

    if (!value) return "";

    return String(value)
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
   NORMALIZE CATEGORY DATA
========================================================== */

function normalizeCategoryData(category) {

    if (!category) return null;

    const mainId =
        normalizeCategory(
            category.id ||
            category.slug ||
            category.name
        );

    const subCategories =
        Array.isArray(
            category.subCategories
        )
            ? category.subCategories
            : Array.isArray(
                category.subcategories
            )
                ? category.subcategories
                : [];

    return {

        ...category,

        id: mainId,

        name:
            category.name ||
            mainId,

        icon:
            category.icon ||
            "📂",

        subCategories:
            subCategories
                .map(function (sub) {

                    return {

                        ...sub,

                        id:
                            normalizeCategory(
                                sub.id ||
                                sub.slug ||
                                sub.name
                            ),

                        name:
                            sub.name ||
                            sub.id ||
                            "সাব-ক্যাটাগরি",

                        icon:
                            sub.icon ||
                            "📦"

                    };

                })
                .filter(Boolean)

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
        data
            .map(normalizeProduct)
            .filter(
                product =>
                    Number.isFinite(
                        product.id
                    )
            );

    return products;

}


/* ==========================================================
   FETCH CATEGORIES
========================================================== */

async function fetchCategories() {

    try {

        const response =
            await fetch(
                SITE_CONFIG.categoryAPI,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Category API failed"
            );

        }

        const data =
            await response.json();

        if (Array.isArray(data)) {

            categories =
                data
                    .map(
                        normalizeCategoryData
                    )
                    .filter(Boolean);

        }
        else {

            categories = [];

        }

    }
    catch (error) {

        console.warn(
            "categories.json পাওয়া যায়নি। Product data থেকে category তৈরি করা হবে।"
        );

        categories = [];

    }

    return categories;

}


/* ==========================================================
   ENSURE PRODUCTS
========================================================== */

async function ensureProductsLoaded() {

    if (products.length) {

        return products;

    }

    return await fetchProducts();

}


/* ==========================================================
   BUILD CATEGORY FROM PRODUCT DATA
   FALLBACK ONLY
========================================================== */

function buildCategoriesFromProducts() {

    const map = {};

    products.forEach(
        function (product) {

            const main =
                normalizeCategory(
                    product.category
                ) || "other";

            if (!map[main]) {

                map[main] = {

                    id: main,

                    name:
                        product.categoryName ||
                        main,

                    icon:
                        product.categoryIcon ||
                        "📂",

                    subCategories: []

                };

            }

            const sub =
                normalizeCategory(
                    product.subCategory
                );

            if (
                sub &&
                !map[main]
                    .subCategories
                    .some(
                        item =>
                            item.id === sub
                    )
            ) {

                map[main]
                    .subCategories
                    .push({

                        id: sub,

                        name:
                            product.subCategoryName ||
                            sub,

                        icon:
                            product.subCategoryIcon ||
                            "📦"

                    });

            }

        }
    );

    categories =
        Object.values(map);

}


/* ==========================================================
   ENSURE CATEGORIES
========================================================== */

async function ensureCategoriesLoaded() {

    if (categories.length) {

        return categories;

    }

    await ensureProductsLoaded();

    await fetchCategories();

    if (!categories.length) {

        buildCategoriesFromProducts();

    }

    return categories;

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
        findCategory(categoryId);

    if (
        !category ||
        !Array.isArray(
            category.subCategories
        )
    ) {

        return null;

    }

    return category.subCategories.find(
        sub =>
            normalizeCategory(
                sub.id
            ) ===
            normalizeCategory(
                subCategoryId
            )
    ) || null;

}


/* ==========================================================
   CATEGORY INFO
========================================================== */

function updateCategoryInfo(
    categoryId,
    subCategoryId = "all"
) {

    const info =
        $("#categoryInfo");

    if (!info) return;

    if (
        !categoryId ||
        categoryId === "all"
    ) {

        info.textContent = "";

        info.classList.remove(
            "show"
        );

        return;

    }

    const category =
        findCategory(categoryId);

    if (!category) {

        info.textContent = "";

        info.classList.remove(
            "show"
        );

        return;

    }

    if (
        subCategoryId &&
        subCategoryId !== "all"
    ) {

        const sub =
            findSubCategory(
                categoryId,
                subCategoryId
            );

        info.textContent =
            `📂 ${category.name} → ${sub?.name || subCategoryId}`;

    }
    else {

        info.textContent =
            `📂 নির্বাচিত ক্যাটাগরি: ${category.name}`;

    }

    info.classList.add(
        "show"
    );

}


/* ==========================================================
   RENDER MAIN CATEGORIES
========================================================== */

async function renderCategoryButtons() {

    const wrapper =
        $("#mainCategoryButtons") ||
        $(".products-category-buttons");

    if (!wrapper) return;

    await ensureCategoriesLoaded();

    wrapper.innerHTML = "";

    /* ALL PRODUCTS */

    const allButton =
        document.createElement(
            "button"
        );

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


    /* DYNAMIC CATEGORIES */

    categories.forEach(
        function (category) {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "filter-btn main-category-btn";

            button.dataset.category =
                category.id;

            button.dataset.subcategory =
                "all";

            button.textContent =
                `${category.icon || "📂"} ${category.name}`;

            wrapper.appendChild(
                button
            );

        }
    );

    initCategoryFilter();

}


/* ==========================================================
   RENDER SUB CATEGORY
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

    area.classList.remove(
        "show"
    );

    if (
        !categoryId ||
        categoryId === "all"
    ) {

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

    if (
        !category ||
        !Array.isArray(
            category.subCategories
        ) ||
        !category.subCategories.length
    ) {

        updateCategoryInfo(
            categoryId,
            "all"
        );

        return;

    }


    area.classList.add(
        "show"
    );


    wrapper.innerHTML = `

<div class="subcategory-title">
    📦 ${escapeHTML(category.name)}-এর পণ্য
</div>

<div class="subcategory-buttons">

    <button
        type="button"
        class="sub-filter-btn active"
        data-category="${escapeAttribute(category.id)}"
        data-subcategory="all"
    >
        সব
    </button>

    ${
        category.subCategories
            .map(
                function (sub) {

                    return `

<button
    type="button"
    class="sub-filter-btn"
    data-category="${escapeAttribute(category.id)}"
    data-subcategory="${escapeAttribute(sub.id)}"
>

    ${sub.icon || "📦"}
    ${escapeHTML(sub.name)}

</button>

`;

                }
            )
            .join("")
    }

</div>

`;


    wrapper
        .querySelectorAll(
            ".sub-filter-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        wrapper
                            .querySelectorAll(
                                ".sub-filter-btn"
                            )
                            .forEach(
                                btn =>
                                    btn.classList
                                        .remove(
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
   ESCAPE ATTRIBUTE
========================================================== */

function escapeAttribute(value) {

    return escapeHTML(
        value
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

    if (!productList) return;

    try {

        await ensureProductsLoaded();


        const searchInput =
            $("#searchProduct");

        const keyword =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        let filtered =
            products.filter(
                function (product) {

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
                        ) ===
                        normalizeCategory(
                            category
                        );


                    const matchSubCategory =
                        subCategory === "all" ||
                        normalizeCategory(
                            product.subCategory
                        ) ===
                        normalizeCategory(
                            subCategory
                        );


                    const matchSearch =
                        !keyword ||
                        name.includes(keyword) ||
                        type.includes(keyword) ||
                        description.includes(keyword) ||
                        categoryName.includes(keyword) ||
                        subCategoryName.includes(keyword);


                    return (
                        matchCategory &&
                        matchSubCategory &&
                        matchSearch
                    );

                }
            );


        /* ==================================================
           SORT
        ================================================== */

        const sortSelect =
            $("#sortProducts");

        const sort =
            sortSelect
                ? sortSelect.value
                : "default";


        switch (sort) {

            case "low-high":

                filtered.sort(
                    (a, b) =>
                        a.price - b.price
                );

                break;


            case "high-low":

                filtered.sort(
                    (a, b) =>
                        b.price - a.price
                );

                break;


            case "new":

                filtered.sort(
                    (a, b) =>
                        b.newArrival -
                        a.newArrival
                );

                break;


            case "best":

                filtered.sort(
                    (a, b) =>
                        b.bestSeller -
                        a.bestSeller
                );

                break;


            default:

                filtered.sort(
                    (a, b) =>
                        a.id - b.id
                );

        }


        productList.innerHTML = "";


        /* ==================================================
           NO PRODUCT
        ================================================== */

        if (!filtered.length) {

            productList.innerHTML = `

<div class="card">

    <h2>
        🔍 কোনো পণ্য পাওয়া যায়নি
    </h2>

    <p>
        অন্য কোনো নাম বা ক্যাটাগরি দিয়ে চেষ্টা করুন।
    </p>

</div>

`;

            updateCategoryInfo(
                category,
                subCategory
            );

            return;

        }


        /* ==================================================
           PRODUCT CARDS
        ================================================== */

        filtered.forEach(
            function (product) {

                const gallery =
                    getGallery(
                        product
                    );


                productList.innerHTML += `

<article
    class="product-card"
    data-product-id="${product.id}"
>

${
    product.offer
        ? `
<span class="offer-badge">
    🔥 অফার
</span>
`
        : ""
}


<button
    class="wishlist-btn"
    data-id="${product.id}"
    type="button"
    aria-label="Wishlist"
>

    🤍

</button>


<div class="slider">

${
    gallery.length
        ? gallery
            .map(
                function (img, index) {

                    return `

<img
    src="${escapeAttribute(img)}"
    class="product-img ${
        index === 0
            ? "active"
            : ""
    }"
    alt="${escapeAttribute(product.name || "পণ্য")}"
    loading="${
        index === 0
            ? "eager"
            : "lazy"
    }"
    onerror="this.style.display='none';"
>

`;

                }
            )
            .join("")
        : `

<div class="no-product-image">
    🌱
</div>

`
}

</div>


<h3>
    ${escapeHTML(
        product.name || "পণ্য"
    )}
</h3>


${
    product.categoryName
        ? `
<span class="product-category">
    📂 ${escapeHTML(
        product.categoryName
    )}
</span>
`
        : ""
}


${
    product.subCategoryName
        ? `
<span class="product-category">
    📁 ${escapeHTML(
        product.subCategoryName
    )}
</span>
`
        : ""
}


<p class="rating">

    ⭐⭐⭐⭐⭐
    (${product.rating || 0})

</p>


${
    product.oldPrice > product.price
        ? `
<p class="old-price">
    ${formatPrice(
        product.oldPrice
    )}
</p>
`
        : ""
}


<p class="price">

    ${formatPrice(
        product.price
    )}

</p>


<span class="stock">

    🟢 ${escapeHTML(
        product.stock ||
        "স্টকে আছে"
    )}

</span>


<p>

    ${escapeHTML(
        product.description || ""
    )}

</p>


<a
    href="product.html?id=${encodeURIComponent(product.id)}"
    class="btn"
>

    📖 বিস্তারিত দেখুন

</a>

</article>

`;

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
    catch (error) {

        console.error(
            "Product Load Error:",
            error
        );


        productList.innerHTML = `

<div class="card">

    <h2>
        ❌ পণ্য লোড করা যায়নি
    </h2>

    <p>
        কিছুক্ষণ পরে আবার চেষ্টা করুন।
    </p>

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

    if (!input) return;

    input.addEventListener(
        "input",
        function () {

            const active =
                $(".filter-btn.active");

            const category =
                active
                    ? active.dataset.category
                    : "all";

            const sub =
                $(".sub-filter-btn.active")
                    ?.dataset.subcategory ||
                "all";

            loadProducts(
                category,
                sub
            );

        }
    );

}


/* ==========================================================
   CATEGORY FILTER
========================================================== */

function initCategoryFilter() {

    $$(".filter-btn")
        .forEach(
            function (button) {

                button.onclick =
                    function () {

                        $$(".filter-btn")
                            .forEach(
                                btn =>
                                    btn.classList
                                        .remove(
                                            "active"
                                        )
                            );

                        button.classList.add(
                            "active"
                        );


                        const category =
                            button.dataset.category;


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
   SORT
========================================================== */

function initSort() {

    const select =
        $("#sortProducts");

    if (!select) return;

    select.addEventListener(
        "change",
        function () {

            const active =
                $(".filter-btn.active");

            const category =
                active
                    ? active.dataset.category
                    : "all";

            const sub =
                $(".sub-filter-btn.active")
                    ?.dataset.subcategory ||
                "all";

            loadProducts(
                category,
                sub
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

    if (!slider) return;

    try {

        const id =
            getProductId();

        await ensureProductsLoaded();

        currentProduct =
            products.find(
                product =>
                    Number(product.id) === id
            );


        if (!currentProduct) {

            const gallery =
                $(".product-gallery");

            if (gallery) {

                gallery.innerHTML = `

<div class="card">

    <h2>
        ❌ পণ্য পাওয়া যায়নি
    </h2>

    <a
        href="products.html"
        class="btn"
    >
        📦 সকল পণ্য দেখুন
    </a>

</div>

`;

            }

            return;

        }


        /* ==================================================
           PRODUCT INFO
        ================================================== */

        const fields = {

            "#productName":
                currentProduct.name || "",

            "#productBrand":
                currentProduct.brand ||
                SITE_CONFIG.companyName,

            "#productBrandInfo":
                currentProduct.brand ||
                SITE_CONFIG.companyName,

            "#productRating":
                `(${currentProduct.rating || 0})`,

            "#productStockInfo":
                currentProduct.stock ||
                "স্টকে আছে",

            "#productCategory":
                currentProduct.categoryName ||
                currentProduct.category ||
                "-",

            "#productType":
                currentProduct.type ||
                "-",

            "#productSku":
                currentProduct.sku ||
                "-",

            "#productWeight":
                currentProduct.weight ||
                "-",

            "#productDescription":
                currentProduct.description ||
                ""

        };


        Object.entries(fields)
            .forEach(
                function ([selector, value]) {

                    const element =
                        $(selector);

                    if (element) {

                        element.textContent =
                            value;

                    }

                }
            );


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
            currentProduct.price;

        const oldPrice =
            currentProduct.oldPrice;

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
                formatPrice(price);

        }


        if (oldPriceElement) {

            if (oldPrice > price) {

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


        if (reviewElement) {

            reviewElement.textContent =
                `(${currentProduct.rating || 0} Reviews)`;

        }


        /* ==================================================
           GALLERY
        ================================================== */

        const gallery =
            getGallery(
                currentProduct
            );

        slider.innerHTML = "";


        if (!gallery.length) {

            slider.innerHTML = `

<div class="no-image">

    🌱

    <p>
        এই পণ্যের ছবি পাওয়া যায়নি।
    </p>

</div>

`;

        }
        else {

            gallery.forEach(
                function (src, index) {

                    const img =
                        document.createElement(
                            "img"
                        );

                    img.src =
                        src;

                    img.alt =
                        currentProduct.name ||
                        SITE_CONFIG.companyName;

                    img.className =
                        "product-img" +
                        (
                            index === 0
                                ? " active"
                                : ""
                        );

                    img.loading =
                        index === 0
                            ? "eager"
                            : "lazy";

                    img.onerror =
                        function () {

                            this.style.display =
                                "none";

                        };

                    slider.appendChild(
                        img
                    );

                }
            );

        }


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

    }

}


/* ==========================================================
   DETAIL GALLERY
========================================================== */

function initDetailGallery() {

    const slider =
        $("#productSlider");

    if (!slider) return;


    const images =
        slider.querySelectorAll(
            ".product-img"
        );

    const prev =
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

        if (
            index >=
            images.length
        ) {

            index = 0;

        }


        images.forEach(
            img =>
                img.classList
                    .remove(
                        "active"
                    )
        );


        images[index]
            .classList
            .add(
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


    if (prev) {

        prev.onclick =
            () =>
                showImage(
                    detailSliderIndex - 1
                );

    }


    if (next) {

        next.onclick =
            () =>
                showImage(
                    detailSliderIndex + 1
                );

    }


    images.forEach(
        function (img) {

            img.onclick =
                function () {

                    const modal =
                        $("#imageModal");

                    const modalImage =
                        $("#modalImage");

                    if (
                        modal &&
                        modalImage
                    ) {

                        modalImage.src =
                            img.src;

                        modal.style.display =
                            "flex";

                    }

                };

        }
    );


    showImage(0);

}


/* ==========================================================
   QUANTITY
========================================================== */

function initQuantity() {

    const qtyInput =
        $("#qty");

    const total =
        $("#totalPrice");

    const plus =
        $("#plusQty");

    const minus =
        $("#minusQty");


    if (
        !qtyInput ||
        !total ||
        !plus ||
        !minus ||
        !currentProduct
    ) {

        return;

    }


    let qty =
        Number(
            qtyInput.value
        ) || 1;


    if (qty < 1) {

        qty = 1;

    }


    function update() {

        qtyInput.value =
            qty;

        total.textContent =
            formatPrice(
                currentProduct.price *
                qty
            );

        updateOrderLink(
            qty
        );

    }


    plus.onclick =
        function () {

            qty++;

            update();

        };


    minus.onclick =
        function () {

            if (qty > 1) {

                qty--;

                update();

            }

        };


    qtyInput.oninput =
        function () {

            qty =
                Number(
                    qtyInput.value
                ) || 1;

            if (qty < 1) {

                qty = 1;

            }

            update();

        };


    update();

}


/* ==========================================================
   ORDER BUTTON
========================================================== */

function initOrderButton() {

    if (!currentProduct) return;

    const button =
        $("#orderNow");

    if (!button) return;

    updateOrderLink(1);

}


/* ==========================================================
   UPDATE WHATSAPP ORDER
========================================================== */

function updateOrderLink(qty) {

    const button =
        $("#orderNow");

    if (
        !button ||
        !currentProduct
    ) {

        return;

    }


    const price =
        Number(
            currentProduct.price || 0
        );

    const total =
        price * qty;


    const message =

`🌿 ${SITE_CONFIG.companyName}

আমি নিচের পণ্যটি অর্ডার করতে চাই।

📦 পণ্য:
${currentProduct.name}

💰 একক মূল্য:
${formatPrice(price)}

🔢 পরিমাণ:
${qty}

💵 মোট মূল্য:
${formatPrice(total)}

📂 ক্যাটাগরি:
${currentProduct.categoryName || currentProduct.category || "-"}

📁 সাব-ক্যাটাগরি:
${currentProduct.subCategoryName || currentProduct.subCategory || "-"}

🔗 পণ্যের লিংক:
${window.location.href}`;


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

    [
        $("#shareProduct"),
        $("#shareProductBtn")
    ]
        .forEach(
            function (button) {

                if (!button) return;

                button.onclick =
                    async function () {

                        if (!currentProduct)
                            return;

                        const shareData = {

                            title:
                                currentProduct.name,

                            text:
                                currentProduct.description ||
                                SITE_CONFIG.companyName,

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

                            }
                            catch (error) {

                                if (
                                    error.name !==
                                    "AbortError"
                                ) {

                                    console.error(
                                        error
                                    );

                                }

                            }

                        }
                        else {

                            try {

                                await navigator.clipboard
                                    .writeText(
                                        window.location.href
                                    );

                                alert(
                                    "✅ লিংক কপি হয়েছে"
                                );

                            }
                            catch (error) {

                                alert(
                                    "❌ লিংক কপি করা যায়নি"
                                );

                            }

                        }

                    };

            }
        );

}


/* ==========================================================
   WISHLIST COUNTER
========================================================== */

function updateWishlistCounter() {

    const counter =
        $("#wishlistCounter");

    if (!counter) return;

    counter.textContent =
        `❤️ Wishlist (${wishlist.length})`;

}


/* ==========================================================
   INIT WISHLIST
========================================================== */

function initWishlist() {

    $$(".wishlist-btn")
        .forEach(
            function (button) {

                const id =
                    Number(
                        button.dataset.id
                    );

                const active =
                    wishlist.includes(id);


                button.textContent =
                    active
                        ? "❤️"
                        : "🤍";


                button.classList.toggle(
                    "active",
                    active
                );


                button.onclick =
                    function () {

                        toggleWishlist(
                            id
                        );

                    };

            }
        );


    updateWishlistCounter();

}


/* ==========================================================
   TOGGLE WISHLIST
========================================================== */

function toggleWishlist(id) {

    id =
        Number(id);


    if (
        wishlist.includes(id)
    ) {

        wishlist =
            wishlist.filter(
                item =>
                    item !== id
            );

    }
    else {

        wishlist.push(id);

    }


    localStorage.setItem(
        "wishlist",
        JSON.stringify(
            wishlist
        )
    );


    initWishlist();

    initProductWishlist();

    updateWishlistCounter();

}


/* ==========================================================
   DETAIL WISHLIST
========================================================== */

function initProductWishlist() {

    if (!currentProduct)
        return;


    const id =
        Number(
            currentProduct.id
        );


    [
        $("#wishlistBtn"),
        $("#wishlistProduct")
    ]
        .forEach(
            function (button) {

                if (!button) return;


                const active =
                    wishlist.includes(id);


                button.textContent =
                    active
                        ? "❤️ Wishlist"
                        : "🤍 Wishlist";


                button.classList.toggle(
                    "active",
                    active
                );


                button.onclick =
                    function () {

                        toggleWishlist(
                            id
                        );

                    };

            }
        );

}


/* ==========================================================
   WISHLIST PAGE
========================================================== */

async function loadWishlistPage() {

    const container =
        $("#wishlistProducts");

    if (!container) return;


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


        container.innerHTML = "";


        if (!items.length) {

            container.innerHTML = `

<div class="card">

    <h2>
        ❤️ Wishlist খালি
    </h2>

    <p>
        আপনার পছন্দের পণ্য এখানে সংরক্ষণ করতে পারেন।
    </p>

    <a
        href="products.html"
        class="btn"
    >
        📦 পণ্য দেখুন
    </a>

</div>

`;

            return;

        }


        items.forEach(
            function (product) {

                const gallery =
                    getGallery(
                        product
                    );

                const image =
                    gallery[0] || "";


                container.innerHTML += `

<div
    class="product-card"
>

    <div class="slider">

        ${
            image
                ? `
<img
    src="${escapeAttribute(image)}"
    class="product-img active"
    alt="${escapeAttribute(product.name)}"
    loading="lazy"
>
`
                : `
<div class="no-product-image">
    🌱
</div>
`
        }

    </div>


    <h3>
        ${escapeHTML(
            product.name
        )}
    </h3>


    ${
        product.categoryName
            ? `
<span class="product-category">
    📂 ${escapeHTML(
        product.categoryName
    )}
</span>
`
            : ""
    }


    <p class="price">
        ${formatPrice(
            product.price
        )}
    </p>


    <a
        href="product.html?id=${encodeURIComponent(product.id)}"
        class="btn"
    >
        📖 বিস্তারিত দেখুন
    </a>


    <button
        type="button"
        class="btn removeWishlist"
        data-id="${product.id}"
    >
        🗑 Wishlist থেকে বাদ দিন
    </button>

</div>

`;

            }
        );


        $$(".removeWishlist")
            .forEach(
                function (button) {

                    button.onclick =
                        function () {

                            toggleWishlist(
                                Number(
                                    button.dataset.id
                                )
                            );

                            loadWishlistPage();

                        };

                }
            );


        updateWishlistCounter();

    }
    catch (error) {

        console.error(
            "Wishlist Error:",
            error
        );

    }

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
            function (product) {

                if (
                    Number(product.id) ===
                    Number(currentProduct.id)
                ) {

                    return false;

                }

                return (
                    product.category ===
                    currentProduct.category
                );

            }
        );


    /* If same category products
       are not enough, use all products */

    if (related.length < 4) {

        const additional =
            products.filter(
                product =>
                    Number(product.id) !==
                    Number(currentProduct.id) &&
                    !related.some(
                        item =>
                            Number(item.id) ===
                            Number(product.id)
                    )
            );

        related =
            related.concat(
                additional
            );

    }


    related =
        related.slice(
            0,
            4
        );


    container.innerHTML = "";


    related.forEach(
        function (product) {

            const gallery =
                getGallery(
                    product
                );

            const image =
                gallery[0] || "";


            container.innerHTML += `

<div class="product-card">

    <div class="slider">

        ${
            image
                ? `
<img
    src="${escapeAttribute(image)}"
    class="product-img active"
    alt="${escapeAttribute(product.name)}"
    loading="lazy"
>
`
                : `
<div class="no-product-image">
    🌱
</div>
`
        }

    </div>


    <h3>
        ${escapeHTML(
            product.name
        )}
    </h3>


    ${
        product.categoryName
            ? `
<span class="product-category">
    📂 ${escapeHTML(
        product.categoryName
    )}
</span>
`
            : ""
    }


    <p class="price">
        ${formatPrice(
            product.price
        )}
    </p>


    <a
        href="product.html?id=${encodeURIComponent(product.id)}"
        class="btn"
    >
        📖 বিস্তারিত দেখুন
    </a>

</div>

`;

        }
    );

}


/* ==========================================================
   HOME PRODUCT SLIDER
========================================================== */

function startHomeSlider() {

    homeSliderTimers.forEach(
        timer =>
            clearInterval(timer)
    );

    homeSliderTimers = [];


    document
        .querySelectorAll(
            ".product-card .slider"
        )
        .forEach(
            function (slider) {

                const images =
                    slider.querySelectorAll(
                        ".product-img"
                    );


                if (
                    images.length <= 1
                ) {

                    return;

                }


                let current = 0;


                const timer =
                    setInterval(
                        function () {

                            if (
                                !images[current]
                            ) {
                                return;
                            }

                            images[current]
                                .classList
                                .remove(
                                    "active"
                                );


                            current++;


                            if (
                                current >=
                                images.length
                            ) {

                                current = 0;

                            }


                            if (
                                images[current]
                            ) {

                                images[current]
                                    .classList
                                    .add(
                                        "active"
                                    );

                            }

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
            function () {

                modal.style.display =
                    "none";

            };

    }


    modal.onclick =
        function (e) {

            if (
                e.target === modal
            ) {

                modal.style.display =
                    "none";

            }

        };


    document.addEventListener(
        "click",
        function (e) {

            const image =
                e.target;


            if (
                !image.classList ||
                !image.classList.contains(
                    "product-img"
                )
            ) {

                return;

            }


            if (
                image.closest(
                    "#productSlider"
                )
            ) {

                return;

            }


            modalImage.src =
                image.src;


            modal.style.display =
                "flex";

        }
    );

}


/* ==========================================================
   SHARE BUSINESS CARD
========================================================== */

function initShareCard() {

    const button =
        $("#shareCard");

    if (!button) return;


    button.onclick =
        async function (e) {

            e.preventDefault();


            const data = {

                title:
                    SITE_CONFIG.companyName,

                text:
                    SITE_CONFIG.companyName +
                    " - Digital Business Card",

                url:
                    window.location.href

            };


            if (
                navigator.share
            ) {

                try {

                    await navigator.share(
                        data
                    );

                }
                catch (error) {

                    if (
                        error.name !==
                        "AbortError"
                    ) {

                        console.error(
                            error
                        );

                    }

                }

            }
            else {

                try {

                    await navigator.clipboard
                        .writeText(
                            window.location.href
                        );

                    alert(
                        "✅ লিংক কপি হয়েছে"
                    );

                }
                catch (error) {

                    alert(
                        "❌ লিংক কপি করা যায়নি"
                    );

                }

            }

        };

}


/* ==========================================================
   SAVE CONTACT
========================================================== */

function initSaveContact() {

    const button =
        $("#saveContact");

    if (!button) return;


    button.onclick =
        function (e) {

            e.preventDefault();

            window.location.href =
                "contact.vcf";

        };

}


/* ==========================================================
   PWA
========================================================== */

function initPWA() {

    const installBtn =
        $("#installApp");

    if (!installBtn) return;


    installBtn.style.display =
        "none";


    window.addEventListener(
        "beforeinstallprompt",
        function (e) {

            e.preventDefault();

            deferredPrompt =
                e;

            installBtn.style.display =
                "flex";

        }
    );


    installBtn.onclick =
        async function () {

            if (
                !deferredPrompt
            ) {

                return;

            }


            deferredPrompt.prompt();


            try {

                await deferredPrompt
                    .userChoice;

            }
            catch (error) {

                console.error(
                    error
                );

            }


            deferredPrompt =
                null;

            installBtn.style.display =
                "none";

        };


    window.addEventListener(
        "appinstalled",
        function () {

            deferredPrompt =
                null;

            installBtn.style.display =
                "none";

        }
    );

}


/* ==========================================================
   BOTTOM NAVIGATION
========================================================== */

function initBottomNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() ||
        "index.html";


    $$(".bottom-nav a")
        .forEach(
            function (link) {

                link.classList.remove(
                    "active"
                );


                const href =
                    link.getAttribute(
                        "href"
                    );


                if (!href) return;


                const cleanHref =
                    href
                        .split("?")[0]
                        .split("#")[0];


                if (
                    cleanHref ===
                    currentPage
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

}


/* ==========================================================
   CONTACT FORM
========================================================== */

function initContactForm() {

    const form =
        $("#contactForm");

    if (!form) return;


    form.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const name =
                $("#contactName")
                    ?.value
                    .trim() || "";


            const phone =
                $("#contactPhone")
                    ?.value
                    .trim() || "";


            const email =
                $("#contactEmail")
                    ?.value
                    .trim() || "";


            const subject =
                $("#contactSubject")
                    ?.value
                    .trim() || "";


            const message =
                $("#contactMessage")
                    ?.value
                    .trim() || "";


            if (!name) {

                showContactStatus(
                    "❌ আপনার নাম লিখুন।",
                    "error"
                );

                return;

            }


            if (!phone) {

                showContactStatus(
                    "❌ আপনার মোবাইল নম্বর লিখুন।",
                    "error"
                );

                return;

            }


            if (!subject) {

                showContactStatus(
                    "❌ বিষয় নির্বাচন করুন।",
                    "error"
                );

                return;

            }


            if (!message) {

                showContactStatus(
                    "❌ আপনার মেসেজ লিখুন।",
                    "error"
                );

                return;

            }


            const subjectText = {

                product:
                    "পণ্য সম্পর্কে জানতে চাই",

                price:
                    "মূল্য জানতে চাই",

                wholesale:
                    "পাইকারি অর্ডার",

                dealer:
                    "ডিলারশিপ",

                other:
                    "অন্যান্য"

            };


            const whatsappMessage =

`🌿 ${SITE_CONFIG.companyName}

📩 নতুন Contact Message

👤 নাম:
${name}

📱 মোবাইল:
${phone}

📧 ই-মেইল:
${email || "দেওয়া হয়নি"}

📌 বিষয়:
${subjectText[subject] || subject}

💬 মেসেজ:
${message}`;


            const url =
                "https://wa.me/" +
                SITE_CONFIG.whatsapp +
                "?text=" +
                encodeURIComponent(
                    whatsappMessage
                );


            showContactStatus(
                "✅ WhatsApp-এ পাঠানো হচ্ছে...",
                "success"
            );


            setTimeout(
                () =>
                    window.open(
                        url,
                        "_blank",
                        "noopener"
                    ),
                400
            );

        }
    );

}


/* ==========================================================
   CONTACT STATUS
========================================================== */

function showContactStatus(
    message,
    type = "success"
) {

    const status =
        $("#contactFormStatus");

    if (!status) return;


    status.textContent =
        message;

    status.style.marginTop =
        "12px";

    status.style.padding =
        "10px";

    status.style.borderRadius =
        "10px";


    if (
        type === "error"
    ) {

        status.style.color =
            "#b71c1c";

        status.style.background =
            "#ffebee";

    }
    else {

        status.style.color =
            "#166C39";

        status.style.background =
            "#e9f8ef";

    }

}


/* ==========================================================
   BACK TO TOP
========================================================== */

function initBackToTop() {

    const button =
        $("#backToTop");

    if (!button) return;


    window.addEventListener(
        "scroll",
        function () {

            button.classList.toggle(
                "show",
                window.scrollY > 350
            );

        }
    );


    button.onclick =
        function () {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        };

}


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "✅ Maliha Agro Industry — Dynamic Product System Loaded"
        );


        /* ==================================================
           GLOBAL
        ================================================== */

        updateWishlistCounter();

        initShareCard();

        initSaveContact();

        initPWA();

        initBottomNavigation();

        initImagePreview();

        initContactForm();

        initBackToTop();


        /* ==================================================
           PRODUCTS PAGE
        ================================================== */

        if (
            $("#productList")
        ) {

            initSearch();

            initSort();


            /*
                প্রথমে Product + Category
            */

            await ensureProductsLoaded();

            await ensureCategoriesLoaded();


            /*
                Dynamic Main Category
            */

            await renderCategoryButtons();


            /*
                Default:
                সব পণ্য
            */

            await loadProducts(
                "all",
                "all"
            );

        }


        /* ==================================================
           PRODUCT DETAILS
        ================================================== */

        if (
            $("#productSlider")
        ) {

            await loadProductDetails();

        }


        /* ==================================================
           WISHLIST
        ================================================== */

        if (
            $("#wishlistProducts")
        ) {

            await loadWishlistPage();

        }

    }
);
