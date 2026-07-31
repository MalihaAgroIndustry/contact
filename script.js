"use strict";

/* ==========================================================
   Maliha Agro Industry
   JavaScript v4
========================================================== */

/* ==========================
   GLOBAL VARIABLES
========================== */

let wishlist =
JSON.parse(localStorage.getItem("wishlist")) || [];

let deferredPrompt = null;

let products = [];

let currentProduct = null;

/* ==========================
   SHORTCUTS
========================== */

const $ = selector => document.querySelector(selector);

const $$ = selector => document.querySelectorAll(selector);

/* ==========================
   ERROR HANDLER
========================== */

window.onerror = function(message,file,line,column,error){

    console.error("ERROR :",message);

    console.error("FILE :",file);

    console.error("LINE :",line);

};

/* ==========================
   DOM READY
========================== */

document.addEventListener("DOMContentLoaded",()=>{

    console.log("✅ JavaScript v4 Loaded");

    updateWishlistCounter();

    initShareCard();

    initSaveContact();

    initPWA();

});

/* ==========================
   HELPER FUNCTIONS
========================== */

function formatPrice(price){

    return "৳" + Number(price).toLocaleString("en-BD");

}

function getProductId(){

    return Number(

        new URLSearchParams(window.location.search).get("id")

    );

}

/* ==========================================================
   SECTION 02
   SHARE + SAVE CONTACT + PWA + NAVIGATION
========================================================== */

/* ==========================
   SHARE CARD
========================== */

function initShareCard(){

    const btn = $("#shareCard");

    if(!btn) return;

    btn.addEventListener("click",async(e)=>{

        e.preventDefault();

        if(navigator.share){

            try{

                await navigator.share({

                    title:"Maliha Agro Industry",

                    text:"Digital Business Card",

                    url:window.location.href

                });

            }catch(err){

                console.log(err);

            }

        }else{

            navigator.clipboard.writeText(window.location.href);

            alert("✅ লিংক কপি হয়েছে");

        }

    });

}

/* ==========================
   SAVE CONTACT
========================== */

function initSaveContact(){

    const btn = $("#saveContact");

    if(!btn) return;

    btn.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href="contact.vcf";

    });

}

/* ==========================
   PWA INSTALL
========================== */

function initPWA(){

    const installBtn=$("#installApp");

    if(!installBtn) return;

    installBtn.style.display="none";

    window.addEventListener("beforeinstallprompt",(e)=>{

        e.preventDefault();

        deferredPrompt=e;

        installBtn.style.display="flex";

    });

    installBtn.addEventListener("click",async()=>{

        if(!deferredPrompt) return;

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt=null;

        installBtn.style.display="none";

    });

    window.addEventListener("appinstalled",()=>{

        installBtn.style.display="none";

    });

}

/* ==========================
   ACTIVE MENU
========================== */

function initBottomNavigation(){

    const page=window.location.pathname.split("/").pop();

    $$(".bottom-nav a").forEach(link=>{

        link.classList.remove("active");

        const href=link.getAttribute("href");

        if(href===page){

            link.classList.add("active");

        }

    });

}

initBottomNavigation();

