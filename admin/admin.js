/* ==========================================================
   MALIHA AGRO MARKET
   ADMIN AUTHENTICATION
   admin.js
========================================================== */


/* ==========================================================
   SUPABASE CONFIG
========================================================== */

const SUPABASE_URL =
    "https://iixebrufiilooytrbymp.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_0ew_b8PD7l3CCdjGBVMgFA_jjARr1y4";


/* ==========================================================
   SUPABASE CLIENT
========================================================== */

if (!window.supabase) {

    console.error(
        "❌ Supabase CDN load হয়নি।"
    );

} else {

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


    /* ------------------------------------------------------
       GLOBAL SUPABASE CLIENT
    ------------------------------------------------------ */

    window.supabaseClient =
        supabaseClient;


    /* ======================================================
       ADMIN LOGIN
    ====================================================== */

    async function adminLogin(
        email,
        password
    ) {

        if (
            !email ||
            !password
        ) {

            throw new Error(
                "Email এবং Password দিতে হবে।"
            );

        }


        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email:
                        email.trim(),

                    password:
                        password

                });


        if (error) {

            throw new Error(
                error.message
            );

        }


        if (!data.user) {

            throw new Error(
                "Login failed."
            );

        }


        return data.user;

    }


    /* ======================================================
       GITHUB LOGIN
    ====================================================== */

    async function githubLogin() {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithOAuth({

                    provider:
                        "github",

                    options: {

                        redirectTo:
                            "https://malihaagroindustry.github.io/contact/admin/admin.html"

                    }

                });


        if (error) {

            throw new Error(
                error.message
            );

        }


        return data;

    }


    /* ======================================================
       GET CURRENT SESSION USER
    ====================================================== */

    async function getCurrentAdmin() {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            return null;

        }


        return (
            data.session?.user ||
            null
        );

    }


    /* ======================================================
       ADMIN LOGOUT
    ====================================================== */

    async function adminLogout() {

        const {
            error
        } =
            await supabaseClient.auth
                .signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

            throw error;

        }


        window.location.href =
            "admin.html";

    }


    /* ======================================================
       PROTECT ADMIN PAGE
    ====================================================== */

    async function protectAdminPage() {

        const user =
            await getCurrentAdmin();


        if (!user) {

            window.location.href =
                "admin.html";

            return null;

        }


        return user;

    }


    /* ======================================================
       AUTH STATE LISTENER
    ====================================================== */

    supabaseClient.auth
        .onAuthStateChange(

            (
                event,
                session
            ) => {

                console.log(
                    "Auth event:",
                    event
                );


                if (
                    event ===
                    "SIGNED_OUT"
                ) {

                    if (
                        !window.location.pathname
                            .endsWith(
                                "admin.html"
                            )
                    ) {

                        window.location.href =
                            "admin.html";

                    }

                }

            }

        );


    /* ======================================================
       GLOBAL ADMIN API
    ====================================================== */

    window.MalihaAdmin = {

        login:
            adminLogin,

        githubLogin:
            githubLogin,

        logout:
            adminLogout,

        getCurrentAdmin:
            getCurrentAdmin,

        protect:
            protectAdminPage

    };


    /* ======================================================
       READY
    ====================================================== */

    console.log(
        "🔐 Maliha Agro Market — Admin Auth Loaded."
    );

}
