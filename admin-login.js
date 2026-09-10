/* =========================================
   DJ BOOKING PRO
   ADMIN LOGIN
   USERNAME/PASSWORD + GOOGLE LOGIN
========================================= */


/* =========================================
   GOOGLE CLIENT ID
========================================= */

const GOOGLE_CLIENT_ID =
    "200354296304-egs3jslf6h5jpjcr4if4p8r2l05c3lqk.apps.googleusercontent.com";


/* =========================================
   BACKEND URL
========================================= */

const BACKEND_URL =
    "http://localhost:3000";


/* =========================================
   ELEMENTS
========================================= */

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


const loginButton =
    document.getElementById(
        "loginButton"
    );


const loginStatus =
    document.getElementById(
        "loginStatus"
    );


const loginError =
    document.getElementById(
        "loginError"
    );


const googleButton =
    document.getElementById(
        "googleButton"
    );


/* =========================================
   CHECK EXISTING ADMIN LOGIN
========================================= */

const existingToken =
    sessionStorage.getItem(
        "djAdminToken"
    );


if (existingToken) {

    window.location.href =
        "admin.html";

}


/* =========================================
   CLEAR MESSAGES
========================================= */

function clearMessages() {

    if (loginError) {

        loginError.textContent =
            "";

    }

    if (loginStatus) {

        loginStatus.textContent =
            "";

        loginStatus.className =
            "login-status";

    }

}


/* =========================================
   STATUS
========================================= */

function showStatus(
    message,
    type = ""
) {

    if (!loginStatus) {

        return;

    }

    loginStatus.textContent =
        message;

    loginStatus.className =
        "login-status show";

    if (type) {

        loginStatus.classList.add(
            type
        );

    }

}


/* =========================================
   ERROR
========================================= */

function showError(
    message
) {

    if (!loginError) {

        return;

    }

    loginError.textContent =
        message;

}


/* =========================================
   USERNAME + PASSWORD LOGIN
========================================= */

async function handleAdminLogin(
    event
) {

    event.preventDefault();


    try {

        clearMessages();


        const username =
            document.getElementById(
                "username"
            ).value.trim();


        const password =
            document.getElementById(
                "password"
            ).value;


        if (!username || !password) {

            showError(
                "Username और Password दोनों भरें."
            );

            return;

        }


        if (loginButton) {

            loginButton.disabled =
                true;

        }


        showStatus(
            "Admin login verify ho raha hai..."
        );


        const response =
            await fetch(

                BACKEND_URL +
                "/api/admin/login",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            username:
                                username,

                            password:
                                password

                        })

                }

            );


        const responseText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            throw new Error(
                "Server returned an invalid response."
            );

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(

                data.message ||
                "Admin login failed."

            );

        }


        if (!data.token) {

            throw new Error(
                "Server did not return admin token."
            );

        }


        /* ==============================
           SAVE ADMIN TOKEN
        ============================== */

        sessionStorage.setItem(

            "djAdminToken",

            data.token

        );


        /* ==============================
           SAVE ADMIN USER
        ============================== */

        if (data.user) {

            sessionStorage.setItem(

                "djAdminUser",

                JSON.stringify(
                    data.user
                )

            );

        }


        showStatus(

            "Admin Login successful. Opening Admin Panel...",

            "success"

        );


        setTimeout(

            function () {

                window.location.href =
                    "admin.html";

            },

            500

        );


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        sessionStorage.removeItem(
            "djAdminToken"
        );

        sessionStorage.removeItem(
            "djAdminUser"
        );


        if (
            error.message ===
            "Failed to fetch"
        ) {

            showError(

                "Backend connection failed. Please make sure Node.js server is running on http://localhost:3000"

            );

        } else {

            showError(

                error.message ||
                "Admin login failed. Please try again."

            );

        }


    } finally {

        if (loginButton) {

            loginButton.disabled =
                false;

        }

    }

}


/* =========================================
   GOOGLE ADMIN LOGIN
========================================= */

async function handleGoogleAdminLogin(
    googleResponse
) {

    try {

        clearMessages();


        if (
            !googleResponse ||
            !googleResponse.credential
        ) {

            throw new Error(
                "Google login credential was not received."
            );

        }


        showStatus(
            "Google account verify ho raha hai..."
        );


        const response =
            await fetch(

                BACKEND_URL +
                "/api/admin/google-login",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            credential:
                                googleResponse.credential

                        })

                }

            );


        const responseText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            throw new Error(
                "Server returned an invalid response."
            );

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(

                data.message ||
                "Google Admin Login failed."

            );

        }


        if (!data.token) {

            throw new Error(
                "Server did not return admin token."
            );

        }


        /* ==============================
           SAVE ADMIN TOKEN
        ============================== */

        sessionStorage.setItem(

            "djAdminToken",

            data.token

        );


        /* ==============================
           SAVE ADMIN USER
        ============================== */

        if (data.user) {

            sessionStorage.setItem(

                "djAdminUser",

                JSON.stringify(
                    data.user
                )

            );

        }


        console.log(
            "Google Admin Login successful ✅"
        );


        console.log(
            "Admin user:",
            data.user
        );


        showStatus(

            "Google Admin Login successful. Opening Admin Panel...",

            "success"

        );


        setTimeout(

            function () {

                window.location.href =
                    "admin.html";

            },

            500

        );


    } catch (error) {

        console.error(
            "Google Admin login error:",
            error
        );


        sessionStorage.removeItem(
            "djAdminToken"
        );

        sessionStorage.removeItem(
            "djAdminUser"
        );


        if (
            error.message ===
            "Failed to fetch"
        ) {

            showError(

                "Backend connection failed. Please make sure Node.js server is running on http://localhost:3000"

            );

        } else {

            showError(

                error.message ||
                "Google Admin Login failed. Please try again."

            );

        }

    }

}


/* =========================================
   WAIT FOR GOOGLE
========================================= */

function waitForGoogle() {

    return new Promise(

        function (resolve) {

            let attempts =
                0;

            const maxAttempts =
                40;


            const timer =
                setInterval(

                    function () {

                        attempts++;


                        if (

                            window.google &&
                            window.google.accounts &&
                            window.google.accounts.id

                        ) {

                            clearInterval(
                                timer
                            );

                            resolve(
                                true
                            );

                            return;

                        }


                        if (
                            attempts >=
                            maxAttempts
                        ) {

                            clearInterval(
                                timer
                            );

                            resolve(
                                false
                            );

                        }

                    },

                    250

                );

        }

    );

}


/* =========================================
   INITIALIZE GOOGLE LOGIN
========================================= */

async function initializeGoogleAdminLogin() {

    try {

        console.log(
            "Admin Google Login initializing..."
        );


        console.log(
            "Frontend origin:",
            window.location.origin
        );


        const googleReady =
            await waitForGoogle();


        if (!googleReady) {

            throw new Error(

                "Google Sign-In load nahi ho paya. Page refresh karein."

            );

        }


        google.accounts.id.initialize({

            client_id:
                GOOGLE_CLIENT_ID,

            callback:
                handleGoogleAdminLogin,

            ux_mode:
                "popup",

            auto_select:
                false,

            cancel_on_tap_outside:
                true

        });


        google.accounts.id.renderButton(

            googleButton,

            {

                type:
                    "standard",

                theme:
                    "outline",

                size:
                    "large",

                text:
                    "signin_with",

                shape:
                    "rectangular",

                logo_alignment:
                    "left",

                width:
                    280

            }

        );


        console.log(
            "Google Admin Login initialized successfully ✅"
        );


        showStatus(
            "Username/Password या Authorized Google Gmail से Login करें."
        );


    } catch (error) {

        console.error(
            "Google Admin initialization error:",
            error
        );


        showError(

            error.message ||
            "Google Admin Login initialize nahi ho paya."

        );

    }

}


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {


        /* ==============================
           USERNAME PASSWORD LOGIN
        ============================== */

        if (adminLoginForm) {

            adminLoginForm.addEventListener(

                "submit",

                handleAdminLogin

            );

        }


        /* ==============================
           GOOGLE LOGIN
        ============================== */

        initializeGoogleAdminLogin();

    }

);