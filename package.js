/* =========================================
   DJ BOOKING PRO
   STEP 3 - PACKAGE SELECTION
========================================= */


/* =========================================
   CHECK PREVIOUS STEPS
========================================= */

const savedCustomer =
    localStorage.getItem("djCustomerData");

const savedEvent =
    localStorage.getItem("djEventData");


/*
   Customer data नहीं है
   तो Step 1 पर भेजें।
*/

if (!savedCustomer) {

    alert(
        "Please complete Customer Registration first."
    );

    window.location.href = "index.html";

}


/*
   Event data नहीं है
   तो Step 2 पर भेजें।
*/

else if (!savedEvent) {

    alert(
        "Please complete Event Details first."
    );

    window.location.href = "event.html";

}


/* =========================================
   ELEMENTS
========================================= */

const packageInputs =
    document.querySelectorAll(
        'input[name="package"]'
    );


const extraInputs =
    document.querySelectorAll(
        ".extra-item"
    );


const packageError =
    document.getElementById(
        "packageError"
    );


const summaryPackage =
    document.getElementById(
        "summaryPackage"
    );


const packageAmount =
    document.getElementById(
        "packageAmount"
    );


const extraAmount =
    document.getElementById(
        "extraAmount"
    );


const totalAmount =
    document.getElementById(
        "totalAmount"
    );


const advanceAmount =
    document.getElementById(
        "advanceAmount"
    );


const advanceRule =
    document.getElementById(
        "advanceRule"
    );


const advanceError =
    document.getElementById(
        "advanceError"
    );


const remainingAmount =
    document.getElementById(
        "remainingAmount"
    );


const continueButton =
    document.getElementById(
        "continueButton"
    );


const backButton =
    document.getElementById(
        "backButton"
    );


/* =========================================
   FORMAT CURRENCY
========================================= */

function formatCurrency(amount) {

    return "₹" +
        Number(amount).toLocaleString(
            "en-IN"
        );

}


/* =========================================
   GET SELECTED PACKAGE
========================================= */

function getSelectedPackage() {

    return document.querySelector(
        'input[name="package"]:checked'
    );

}


/* =========================================
   GET PACKAGE PRICE
========================================= */

function getPackagePrice() {

    const selectedPackage =
        getSelectedPackage();


    if (!selectedPackage) {

        return 0;

    }


    return Number(
        selectedPackage.dataset.price
    ) || 0;

}


/* =========================================
   GET EXTRA EQUIPMENT
========================================= */

function getSelectedExtras() {

    const extras = [];


    extraInputs.forEach(
        function (input) {

            if (input.checked) {

                extras.push({

                    name: input.value,

                    price:
                        Number(
                            input.dataset.price
                        ) || 0

                });

            }

        }
    );


    return extras;

}


/* =========================================
   GET EXTRA TOTAL
========================================= */

function getExtraTotal() {

    const extras =
        getSelectedExtras();


    return extras.reduce(
        function (total, extra) {

            return total +
                extra.price;

        },
        0
    );

}


/* =========================================
   GET TOTAL
========================================= */

function getTotalAmount() {

    const packagePrice =
        getPackagePrice();


    const extrasPrice =
        getExtraTotal();


    return packagePrice +
        extrasPrice;

}


/* =========================================
   ADVANCE RULE
========================================= */

function getMinimumAdvance(total) {

    /*
       Rule:

       Total < ₹2500
       => minimum ₹500

       Total >= ₹2500
       => minimum 30%

       Minimum advance कभी ₹500
       से कम नहीं होगा।
    */

    if (total <= 0) {

        return 0;

    }


    if (total < 2500) {

        return 500;

    }


    const thirtyPercent =
        total * 0.30;


    return Math.max(
        500,
        Math.ceil(thirtyPercent)
    );

}


/* =========================================
   UPDATE ADVANCE RULE TEXT
========================================= */

function updateAdvanceRule(total) {

    if (total <= 0) {

        advanceRule.textContent =
            "पहले package select करें।";

        return;

    }


    const minimumAdvance =
        getMinimumAdvance(total);


    if (total < 2500) {

        advanceRule.textContent =
            `Total ${formatCurrency(total)} है। Minimum advance ${formatCurrency(minimumAdvance)} होना चाहिए।`;

    } else {

        advanceRule.textContent =
            `Total ${formatCurrency(total)} है। Minimum advance total amount का 30% यानी ${formatCurrency(minimumAdvance)} होना चाहिए।`;

    }

}


/* =========================================
   UPDATE SUMMARY
========================================= */

function updateSummary() {

    const selectedPackage =
        getSelectedPackage();


    const packagePrice =
        getPackagePrice();


    const extras =
        getSelectedExtras();


    const extrasPrice =
        getExtraTotal();


    const total =
        packagePrice +
        extrasPrice;


    /* PACKAGE */

    if (selectedPackage) {

        summaryPackage.textContent =
            selectedPackage.value;

    } else {

        summaryPackage.textContent =
            "Not Selected";

    }


    /* PACKAGE PRICE */

    packageAmount.textContent =
        formatCurrency(
            packagePrice
        );


    /* EXTRA PRICE */

    extraAmount.textContent =
        formatCurrency(
            extrasPrice
        );


    /* TOTAL */

    totalAmount.textContent =
        formatCurrency(
            total
        );


    /* ADVANCE RULE */

    updateAdvanceRule(
        total
    );


    /* UPDATE REMAINING */

    updateRemaining();


    /*
       अगर package select हो गया
       तो package error remove करें।
    */

    if (selectedPackage) {

        packageError.textContent = "";

    }

}


/* =========================================
   UPDATE REMAINING
========================================= */

function updateRemaining() {

    const total =
        getTotalAmount();


    const advance =
        Number(
            advanceAmount.value
        ) || 0;


    let remaining =
        total - advance;


    /*
       Negative remaining नहीं दिखाएँ।
    */

    if (remaining < 0) {

        remaining = 0;

    }


    remainingAmount.textContent =
        formatCurrency(
            remaining
        );

}


/* =========================================
   VALIDATE ADVANCE
========================================= */

function validateAdvance() {

    const total =
        getTotalAmount();


    const advance =
        Number(
            advanceAmount.value
        );


    advanceError.textContent = "";


    /*
       Package select नहीं है
    */

    if (total <= 0) {

        advanceError.textContent =
            "Please select a package first.";

        return false;

    }


    /*
       Empty advance
    */

    if (
        advanceAmount.value.trim() === ""
    ) {

        advanceError.textContent =
            "Please enter advance amount.";

        return false;

    }


    /*
       Invalid number
    */

    if (
        !Number.isFinite(advance)
        ||
        advance < 0
    ) {

        advanceError.textContent =
            "Please enter a valid advance amount.";

        return false;

    }


    /*
       Decimal advance को रोकना
    */

    if (
        !Number.isInteger(advance)
    ) {

        advanceError.textContent =
            "Advance amount must be a whole number.";

        return false;

    }


    /*
       Minimum advance
    */

    const minimumAdvance =
        getMinimumAdvance(total);


    if (
        advance < minimumAdvance
    ) {

        if (total < 2500) {

            advanceError.textContent =
                `Minimum advance is ${formatCurrency(minimumAdvance)}.`;

        } else {

            advanceError.textContent =
                `Minimum advance is 30% = ${formatCurrency(minimumAdvance)}.`;

        }

        return false;

    }


    /*
       Advance total amount से
       ज्यादा नहीं होना चाहिए।
    */

    if (
        advance > total
    ) {

        advanceError.textContent =
            "Advance amount cannot be greater than total amount.";

        return false;

    }


    return true;

}


/* =========================================
   PACKAGE CHANGE
========================================= */

packageInputs.forEach(
    function (input) {

        input.addEventListener(
            "change",
            function () {

                updateSummary();

                /*
                   Package बदलने पर
                   advance को दोबारा validate करें।
                */

                if (
                    advanceAmount.value !== ""
                ) {

                    validateAdvance();

                }

            }
        );

    }
);


/* =========================================
   EXTRA CHANGE
========================================= */

extraInputs.forEach(
    function (input) {

        input.addEventListener(
            "change",
            function () {

                updateSummary();


                /*
                   Extra बदलने के बाद
                   advance rule भी बदल सकता है।
                */

                if (
                    advanceAmount.value !== ""
                ) {

                    validateAdvance();

                }

            }
        );

    }
);


/* =========================================
   ADVANCE INPUT
========================================= */

advanceAmount.addEventListener(
    "input",
    function () {

        /*
           केवल positive whole number
           रखने की कोशिश।
        */

        if (
            this.value !== ""
            &&
            Number(this.value) < 0
        ) {

            this.value = "0";

        }


        updateRemaining();


        /*
           User typing करते समय
           error को तुरंत clear कर सकते हैं
           अगर amount valid हो।
        */

        if (
            this.value !== ""
        ) {

            validateAdvance();

        } else {

            advanceError.textContent = "";

        }

    }
);


/* =========================================
   BACK BUTTON
========================================= */

backButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "event.html";

    }
);


/* =========================================
   CONTINUE TO REVIEW
========================================= */

continueButton.addEventListener(
    "click",
    function () {

        let valid = true;


        /* ==============================
           PACKAGE VALIDATION
        ============================== */

        const selectedPackage =
            getSelectedPackage();


        if (!selectedPackage) {

            packageError.textContent =
                "Please select a DJ package.";

            valid = false;

        } else {

            packageError.textContent = "";

        }


        /* ==============================
           ADVANCE VALIDATION
        ============================== */

        const advanceValid =
            validateAdvance();


        if (!advanceValid) {

            valid = false;

        }


        /* ==============================
           STOP IF INVALID
        ============================== */

        if (!valid) {

            return;

        }


        /* ==============================
           COLLECT DATA
        ============================== */

        const packagePrice =
            getPackagePrice();


        const extras =
            getSelectedExtras();


        const extrasPrice =
            getExtraTotal();


        const total =
            packagePrice +
            extrasPrice;


        const advance =
            Number(
                advanceAmount.value
            );


        const remaining =
            total - advance;


        /* ==============================
           PACKAGE DATA
        ============================== */

        const packageData = {

            packageName:
                selectedPackage.value,

            packagePrice:
                packagePrice,

            extras:
                extras,

            extraAmount:
                extrasPrice,

            totalAmount:
                total,

            minimumAdvance:
                getMinimumAdvance(total),

            advanceAmount:
                advance,

            remainingAmount:
                remaining

        };


        /* ==============================
           SAVE PACKAGE DATA
        ============================== */

        localStorage.setItem(

            "djPackageData",

            JSON.stringify(
                packageData
            )

        );


        /* ==============================
           GO TO REVIEW
        ============================== */

        window.location.href =
            "review.html";

    }
);


/* =========================================
   LOAD PREVIOUS PACKAGE DATA
========================================= */

function loadSavedPackage() {

    const savedPackage =
        localStorage.getItem(
            "djPackageData"
        );


    if (!savedPackage) {

        updateSummary();

        return;

    }


    try {

        const packageData =
            JSON.parse(
                savedPackage
            );


        /*
           Previous package select करें
        */

        if (
            packageData.packageName
        ) {

            packageInputs.forEach(
                function (input) {

                    input.checked =
                        input.value ===
                        packageData.packageName;

                }
            );

        }


        /*
           Previous extras select करें
        */

        if (
            Array.isArray(
                packageData.extras
            )
        ) {

            extraInputs.forEach(
                function (input) {

                    const exists =
                        packageData.extras.some(
                            function (extra) {

                                return (
                                    extra.name ===
                                    input.value
                                );

                            }
                        );


                    input.checked =
                        exists;

                }
            );

        }


        /*
           Previous advance
        */

        if (
            packageData.advanceAmount !==
            undefined
        ) {

            advanceAmount.value =
                packageData.advanceAmount;

        }


    } catch (error) {

        console.error(
            "Package data could not be loaded:",
            error
        );

        localStorage.removeItem(
            "djPackageData"
        );

    }


    updateSummary();

}


/* =========================================
   INITIAL LOAD
========================================= */

loadSavedPackage();