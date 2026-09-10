/* =========================================
   DJ BOOKING PRO
   CUSTOMER REGISTRATION
   NO OTP SYSTEM
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const customerForm =
    document.getElementById("customerForm");

const customerName =
    document.getElementById("customerName");

const customerMobile =
    document.getElementById("customerMobile");

const customerAddress =
    document.getElementById("customerAddress");

const agreeTerms =
    document.getElementById("agreeTerms");

const nameError =
    document.getElementById("nameError");

const mobileError =
    document.getElementById("mobileError");

const addressError =
    document.getElementById("addressError");

const termsError =
    document.getElementById("termsError");

const formMessage =
    document.getElementById("formMessage");

const sendOtpBtn =
    document.getElementById("sendOtpBtn");

const sendOtpBtnText =
    document.getElementById("sendOtpBtnText");


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
           Customer page हमेशा fresh खुलेगा।
           पुराने customer details automatically
           form में नहीं आएंगे।
        */

        customerName.value = "";

        customerMobile.value = "";

        customerAddress.value = "";

        agreeTerms.checked = false;

        formMessage.textContent = "";

        clearAllErrors();


        /*
           OTP related old data clear
        */

        localStorage.removeItem(
            "djCustomerVerification"
        );


        /*
           Button text
        */

        if (sendOtpBtnText) {

            sendOtpBtnText.textContent =
                "Continue →";

        }


        console.log(
            "✅ Customer Registration started"
        );

    }
);


/* =========================================
   MOBILE INPUT
========================================= */

customerMobile.addEventListener(
    "input",
    () => {

        let value =
            customerMobile.value
                .replace(/\D/g, "")
                .slice(0, 10);


        customerMobile.value =
            value;


        clearError(
            mobileError
        );

    }
);


/* =========================================
   NAME INPUT
========================================= */

customerName.addEventListener(
    "input",
    () => {

        clearError(
            nameError
        );

    }
);


/* =========================================
   ADDRESS INPUT
========================================= */

customerAddress.addEventListener(
    "input",
    () => {

        clearError(
            addressError
        );

    }
);


/* =========================================
   TERMS
========================================= */

agreeTerms.addEventListener(
    "change",
    () => {

        clearError(
            termsError
        );

    }
);


/* =========================================
   CUSTOMER FORM
========================================= */

customerForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        clearAllErrors();


        /* =============================
           GET DATA
        ============================= */

        const name =
            customerName.value.trim();


        const mobile =
            customerMobile.value.trim();


        const address =
            customerAddress.value.trim();


        const termsAccepted =
            agreeTerms.checked;


        /* =============================
           NAME VALIDATION
        ============================= */

        if (
            name.length < 2
        ) {

            showError(
                nameError,
                "Please enter your full name."
            );

            customerName.focus();

            return;

        }


        /* =============================
           MOBILE VALIDATION
        ============================= */

        if (
            !/^\d{10}$/.test(
                mobile
            )
        ) {

            showError(
                mobileError,
                "Please enter a valid 10 digit mobile number."
            );

            customerMobile.focus();

            return;

        }


        /* =============================
           ADDRESS VALIDATION
        ============================= */

        if (
            address.length < 5
        ) {

            showError(
                addressError,
                "Please enter your complete address."
            );

            customerAddress.focus();

            return;

        }


        /* =============================
           TERMS VALIDATION
        ============================= */

        if (
            !termsAccepted
        ) {

            showError(
                termsError,
                "Please accept the terms before continuing."
            );

            return;

        }


        /* =============================
           CUSTOMER DATA
        ============================= */

        const customerData = {

            name: name,

            mobile: mobile,

            address: address

        };


        /* =============================
           SAVE CUSTOMER DATA
        ============================= */

        localStorage.setItem(
            "djCustomerData",
            JSON.stringify(
                customerData
            )
        );


        localStorage.setItem(
            "customerData",
            JSON.stringify(
                customerData
            )
        );


        console.log(
            "✅ Customer details saved:",
            customerData
        );


        /* =============================
           BUTTON LOADING
        ============================= */

        sendOtpBtn.disabled =
            true;


        if (sendOtpBtnText) {

            sendOtpBtnText.textContent =
                "Please wait...";

        }


        /* =============================
           GO TO EVENT PAGE
        ============================= */

        setTimeout(
            () => {

                window.location.replace(
                    "event.html"
                );

            },
            300
        );

    }
);


/* =========================================
   SHOW ERROR
========================================= */

function showError(
    element,
    message
) {

    if (element) {

        element.textContent =
            message;

    }

}


/* =========================================
   CLEAR ERROR
========================================= */

function clearError(
    element
) {

    if (element) {

        element.textContent =
            "";

    }

}


/* =========================================
   CLEAR ALL ERRORS
========================================= */

function clearAllErrors() {

    clearError(
        nameError
    );

    clearError(
        mobileError
    );

    clearError(
        addressError
    );

    clearError(
        termsError
    );

    if (formMessage) {

        formMessage.textContent =
            "";

    }

}