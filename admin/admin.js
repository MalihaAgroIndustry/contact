/* ==========================================================
   MALIHA AGRO MARKET
   ADMIN AUTHENTICATION + PERMISSION SYSTEM
   admin.js
========================================================== */

const SUPABASE_URL =
    "https://iixebrufiilooytrbymp.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_0ew_b8PD7l3CCdjGBVMgFA_jjARr1y4";


/* ==========================================================
   SUPABASE CLIENT
========================================================== */

const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* ==========================================================
   ADMIN LOGIN
========================================================== */

async function adminLogin(email, password) {

    if (!email || !password) {
        throw new Error(
            "Email এবং Password দিতে হবে।"
        );
    }

    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({

        email: email.trim(),

        password: password

    });

    if (error) {
        throw new Error(error.message);
    }

    if (!data.user) {
        throw new Error("Login failed.");
    }

    return data.user;
}


/* ==========================================================
   GITHUB LOGIN
========================================================== */

async function githubLogin() {

    const {
        data,
        error
    } = await supabaseClient.auth.signInWithOAuth({

        provider: "github",

        options: {
            redirectTo:
                "https://malihaagroindustry.github.io/contact/admin/admin.html"
        }

    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}


/* ==========================================================
   CURRENT AUTH USER
========================================================== */

async function getCurrentAdmin() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();

    if (error) {

        console.error(
            "Session error:",
            error
        );

        return null;
    }

    return data.session?.user || null;
}


/* ==========================================================
   GET ADMIN PROFILE
========================================================== */

async function getAdminProfile() {

    const authUser =
        await getCurrentAdmin();

    if (!authUser) {
        return null;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("admin_users")
        .select(`
            id,
            user_id,
            email,
            full_name,
            role_id,
            is_active
        `)
        .eq("user_id", authUser.id)
        .maybeSingle();

    if (error) {

        console.error(
            "Admin profile error:",
            error
        );

        return null;
    }

    if (!data) {
        return null;
    }

    return data;
}


/* ==========================================================
   GET ADMIN SECTOR
========================================================== */

async function getAdminSector() {

    const profile =
        await getAdminProfile();

    if (!profile) {
        return null;
    }


    /* ------------------------------------------------------
       DIRECTOR
    ------------------------------------------------------ */

    if (Number(profile.role_id) === 2) {

        const {
            data,
            error
        } = await supabaseClient
            .from("admin_directors")
            .select(`
                user_id,
                sector_id
            `)
            .eq("user_id", profile.user_id)
            .maybeSingle();

        if (error) {

            console.error(
                "Director sector error:",
                error
            );

            return null;
        }

        return data?.sector_id || null;
    }


    /* ------------------------------------------------------
       SECTOR USER
    ------------------------------------------------------ */

    const {
        data,
        error
    } = await supabaseClient
        .from("admin_sector_users")
        .select(`
            user_id,
            sector_id
        `)
        .eq("user_id", profile.user_id)
        .maybeSingle();

    if (error) {

        console.error(
            "Sector user error:",
            error
        );

        return null;
    }

    return data?.sector_id || null;
}


/* ==========================================================
   GET PERMISSION
   ----------------------------------------------------------
   Priority:

   1. User-specific permission
   2. Role-level permission
   3. No permission = false
========================================================== */

async function getAdminPermission(controlId) {

    const profile =
        await getAdminProfile();

    if (!profile) {

        throw new Error(
            "Admin profile পাওয়া যায়নি।"
        );
    }


    const numericControlId =
        Number(controlId);


    if (
        !Number.isInteger(
            numericControlId
        )
    ) {

        throw new Error(
            "Invalid control ID."
        );
    }


    /* ======================================================
       1. USER-SPECIFIC PERMISSION
    ====================================================== */

    const {
        data: userPermission,
        error: userPermissionError
    } = await supabaseClient
        .from("admin_control_permissions")
        .select(`
            id,
            role_id,
            control_id,
            user_id,
            can_view,
            can_create,
            can_edit,
            can_delete,
            can_correct,
            assigned_by,
            created_at
        `)
        .eq("user_id", profile.user_id)
        .eq("control_id", numericControlId)
        .maybeSingle();


    if (userPermissionError) {

        console.error(
            "User permission error:",
            userPermissionError
        );

        throw userPermissionError;
    }


    if (userPermission) {

        return userPermission;
    }


    /* ======================================================
       2. ROLE-LEVEL PERMISSION
       user_id IS NULL
    ====================================================== */

    const {
        data: rolePermission,
        error: rolePermissionError
    } = await supabaseClient
        .from("admin_control_permissions")
        .select(`
            id,
            role_id,
            control_id,
            user_id,
            can_view,
            can_create,
            can_edit,
            can_delete,
            can_correct,
            assigned_by,
            created_at
        `)
        .eq("role_id", profile.role_id)
        .eq("control_id", numericControlId)
        .is("user_id", null)
        .maybeSingle();


    if (rolePermissionError) {

        console.error(
            "Role permission error:",
            rolePermissionError
        );

        throw rolePermissionError;
    }


    /* ======================================================
       3. NO PERMISSION
    ====================================================== */

    if (!rolePermission) {

        return {

            role_id:
                profile.role_id,

            control_id:
                numericControlId,

            user_id:
                profile.user_id,

            can_view: false,

            can_create: false,

            can_edit: false,

            can_delete: false,

            can_correct: false

        };
    }


    return rolePermission;
}


/* ==========================================================
   CHECK ONE PERMISSION
========================================================== */

async function hasAdminPermission(
    controlId,
    action
) {

    const permission =
        await getAdminPermission(
            controlId
        );

    const allowedActions = [
        "can_view",
        "can_create",
        "can_edit",
        "can_delete",
        "can_correct"
    ];

    if (
        !allowedActions.includes(
            action
        )
    ) {

        throw new Error(
            "Invalid permission action."
        );
    }

    return (
        permission[action] === true
    );
}


/* ==========================================================
   REQUIRE PERMISSION
   ----------------------------------------------------------
   Permission না থাকলে operation বন্ধ হবে।
========================================================== */

async function requireAdminPermission(
    controlId,
    action
) {

    const allowed =
        await hasAdminPermission(
            controlId,
            action
        );

    if (!allowed) {

        throw new Error(
            "এই কাজটি করার অনুমতি আপনার নেই।"
        );
    }

    return true;
}


/* ==========================================================
   GET ALL PERMISSIONS
========================================================== */

async function getAllAdminPermissions() {

    const profile =
        await getAdminProfile();

    if (!profile) {
        return [];
    }


    const {
        data: userPermissions,
        error: userError
    } = await supabaseClient
        .from("admin_control_permissions")
        .select(`
            id,
            role_id,
            control_id,
            user_id,
            can_view,
            can_create,
            can_edit,
            can_delete,
            can_correct,
            assigned_by,
            created_at
        `)
        .eq("user_id", profile.user_id);


    if (userError) {
        throw userError;
    }


    const {
        data: rolePermissions,
        error: roleError
    } = await supabaseClient
        .from("admin_control_permissions")
        .select(`
            id,
            role_id,
            control_id,
            user_id,
            can_view,
            can_create,
            can_edit,
            can_delete,
            can_correct,
            assigned_by,
            created_at
        `)
        .eq("role_id", profile.role_id)
        .is("user_id", null);


    if (roleError) {
        throw roleError;
    }


    const permissionMap =
        new Map();


    /* Role defaults first */

    (rolePermissions || []).forEach(
        permission => {

            permissionMap.set(
                Number(
                    permission.control_id
                ),
                permission
            );

        }
    );


    /* User-specific overrides */

    (userPermissions || []).forEach(
        permission => {

            permissionMap.set(
                Number(
                    permission.control_id
                ),
                permission
            );

        }
    );


    return Array.from(
        permissionMap.values()
    );
}


/* ==========================================================
   ADMIN LOGOUT
========================================================== */

async function adminLogout() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();

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


/* ==========================================================
   PROTECT ADMIN PAGE
========================================================== */

async function protectAdminPage() {

    const user =
        await getCurrentAdmin();

    if (!user) {

        window.location.href =
            "admin.html";

        return null;
    }


    const profile =
        await getAdminProfile();

    if (
        !profile ||
        profile.is_active === false
    ) {

        await adminLogout();

        return null;
    }


    return profile;
}


/* ==========================================================
   AUTH STATE LISTENER
========================================================== */

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


/* ==========================================================
   EXPORT
========================================================== */

window.MalihaAdmin = {

    login:
        adminLogin,

    githubLogin:
        githubLogin,

    logout:
        adminLogout,

    getCurrentAdmin:
        getCurrentAdmin,

    getAdminProfile:
        getAdminProfile,

    getAdminSector:
        getAdminSector,

    getPermission:
        getAdminPermission,

    hasPermission:
        hasAdminPermission,

    requirePermission:
        requireAdminPermission,

    getAllPermissions:
        getAllAdminPermissions,

    protect:
        protectAdminPage
};


window.supabaseClient =
    supabaseClient;


/* ==========================================================
   READY
========================================================== */

console.log(
    "🔐 Maliha Agro Market — Admin Auth + Permission System Loaded."
);
