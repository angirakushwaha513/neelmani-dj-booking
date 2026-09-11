/* =========================================
   DJ BOOKING PRO
   GOOGLE LOGIN
   ========================================= */

const GOOGLE_CLIENT_ID =
    "200354296304-egs3jslf6h5jpjcr4if4p8r2l05c3lqk.apps.googleusercontent.com";


/* =========================================
   BACKEND
   ========================================= */

const BACKEND_URL =
    "http://localhost:3000";


/* =========================================
   HTML ELEMENTS
   ========================================= */

const googleButton =
    document.getElementById("google-button");


const loginMessage =
    document.getElementById("login-message");


/* =========================================
   SHOW MESSAGE
   ========================================= */

function showMessage(
    message,
    type = ""
) {

    if (!loginMessage) {
        return;
    }


    loginMessage.textContent =
        message;


    loginMessage.className =
        "login-message";


    if (type) {

        loginMessage.classList.add(
            type
        );

    }

}


/* =========================================
   CLEAR OLD GOOGLE SESSION
========================================= */

function clearGoogleSession() {

    localStorage.removeItem(
        "customerGoogleToken"
    );


    localStorage.removeItem(
        "customerGoogleUser"
    );


    localStorage.removeItem(
        "customerGoogleCredential"
    );


    /*
       Current browser tab/session ka
       verification flag bhi clear karein.
    */

    sessionStorage.removeItem(
        "googleVerifiedThisVisit"
    );

}


/* =========================================
   SAVE GOOGLE SESSION
========================================= */

function saveGoogleSession(data) {

    if (
        !data ||
        !data.token
    ) {

        throw new Error(
            "Google session token was not received."
        );

    }


    localStorage.setItem(
        "customerGoogleToken",
        data.token
    );


    if (data.user) {

        localStorage.setItem(

            "customerGoogleUser",

            JSON.stringify(
                data.user
            )

        );

    }

}


/* =========================================
   GOOGLE LOGIN CALLBACK
========================================= */

async function handleGoogleLogin(
    googleResponse
) {

    try {

        console.log(
            "Google callback received."
        );


        if (
            !googleResponse ||
            !googleResponse.credential
        ) {

            throw new Error(
                "Google login credential was not received."
            );

        }


        showMessage(
            "Google account verify ho raha hai..."
        );


        const response =
            await fetch(

                BACKEND_URL +
                "/api/auth/google",

                {

                    method:
                        "POST",


                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify({

                            credential:
                                googleResponse.credential

                        })

                }

            );


        let data;


        try {

            data =
                await response.json();

        } catch (error) {

            throw new Error(
                "Backend ne valid response nahi diya."
            );

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(

                data.message ||

                "Google login failed."

            );

        }


        /* =====================================
           SAVE GOOGLE SESSION
        ===================================== */

        saveGoogleSession(
            data
        );


        /* =====================================
           SAVE GOOGLE CREDENTIAL
        ===================================== */

        localStorage.setItem(

            "customerGoogleCredential",

            googleResponse.credential

        );


        /* =====================================
           GOOGLE VERIFIED FOR THIS VISIT
        ===================================== */

        sessionStorage.setItem(

            "googleVerifiedThisVisit",

            "true"

        );


        showMessage(
            "Google login successful.",
            "success"
        );


        console.log(
            "Google user:",
            data.user
        );


        /* =====================================
           OPEN INDEX ONLY AFTER VERIFICATION
        ===================================== */

        const indexURL =
            window.location.origin +
            "/neelmani-dj-booking/index.html";


        console.log(
            "Opening:",
            indexURL
        );


        setTimeout(

            function () {

                window.location.replace(
                    indexURL
                );

            },

            500

        );


    } catch (error) {

        console.error(
            "Google Login Error:",
            error
        );


        clearGoogleSession();


        showMessage(

            error.message ||

            "Google login failed. Please try again.",

            "error"

        );

    }

}


/* =========================================
   WAIT FOR GOOGLE GIS
========================================= */

function waitForGoogle() {

    return new Promise(

        function (resolve) {

            let attempts = 0;


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

async function initializeGoogleLogin() {

    try {

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
                handleGoogleLogin,


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
                    320

            }

        );


        console.log(
            "Google Sign-In initialized successfully."
        );


        showMessage(
            "Google account se sign in karein."
        );


    } catch (error) {

        console.error(

            "Google initialization error:",

            error

        );


        showMessage(

            error.message ||

            "Google Sign-In initialize nahi ho paya.",

            "error"

        );

    }

}


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        /*
         * Google Login page khulne par
         * purana verification hata dein.
         */

        clearGoogleSession();


        initializeGoogleLogin();

    }

);
