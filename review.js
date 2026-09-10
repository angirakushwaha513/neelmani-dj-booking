/* =========================================
   DJ BOOKING PRO
   STEP 4 - REVIEW
   COMPLETE FIXED VERSION
========================================= */


/* =========================================
   LOCAL STORAGE KEYS
========================================= */

const CUSTOMER_KEY =
    "djCustomerData";

const EVENT_KEY =
    "djEventData";

const PACKAGE_KEY =
    "djPackageData";

const CONFIRMATION_KEY =
    "djBookingConfirmation";


/* =========================================
   GET DATA
========================================= */

let customerData = {};
let eventData = {};
let packageData = {};
let confirmationData = {};


/* =========================================
   SAFE JSON READ
========================================= */

function getLocalData(key) {

    const raw =
        localStorage.getItem(key);


    if (!raw) {

        return {};

    }


    try {

        const data =
            JSON.parse(raw);


        if (
            data &&
            typeof data === "object"
        ) {

            return data;

        }


        return {};

    } catch (error) {

        console.error(
            "Invalid localStorage data:",
            key,
            error
        );

        return {};

    }

}


/* =========================================
   LOAD ALL DATA
========================================= */

customerData =
    getLocalData(
        CUSTOMER_KEY
    );


eventData =
    getLocalData(
        EVENT_KEY
    );


packageData =
    getLocalData(
        PACKAGE_KEY
    );


confirmationData =
    getLocalData(
        CONFIRMATION_KEY
    );


/* =========================================
   ELEMENT HELPER
========================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================
   SET TEXT
========================================= */

function setText(
    id,
    value,
    fallback = "-"
) {

    const element =
        getElement(id);


    if (!element) {

        return;

    }


    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {

        element.textContent =
            fallback;

    } else {

        element.textContent =
            String(value);

    }

}


/* =========================================
   MONEY FORMAT
========================================= */

function formatMoney(amount) {

    const number =
        Number(amount) || 0;


    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(number);

}


/* =========================================
   FIND FIRST VALUE
   Different files may use different
   property names.
========================================= */

function firstValue(
    object,
    keys,
    fallback = ""
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return fallback;

    }


    for (
        const key of keys
    ) {

        const value =
            object[key];


        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return value;

        }

    }


    return fallback;

}


/* =========================================
   CUSTOMER DATA
========================================= */

function displayCustomerData() {

    const name =
        firstValue(
            customerData,
            [
                "name",
                "fullName",
                "customerName"
            ]
        );


    const mobile =
        firstValue(
            customerData,
            [
                "mobile",
                "mobileNumber",
                "phone",
                "phoneNumber",
                "contactNumber"
            ]
        );


    const address =
        firstValue(
            customerData,
            [
                "address",
                "customerAddress",
                "fullAddress"
            ]
        );


    setText(
        "customerName",
        name
    );


    setText(
        "customerMobile",
        mobile
    );


    setText(
        "customerAddress",
        address
    );

}


/* =========================================
   EVENT DATA
========================================= */

function displayEventData() {

    const eventType =
        firstValue(
            eventData,
            [
                "eventType",
                "type",
                "event",
                "eventName",
                "occasion"
            ]
        );


    const eventDate =
        firstValue(
            eventData,
            [
                "eventDate",
                "date",
                "bookingDate"
            ]
        );


    const eventTime =
        firstValue(
            eventData,
            [
                "eventTime",
                "time",
                "bookingTime"
            ]
        );


    const district =
        firstValue(
            eventData,
            [
                "district",
                "districtName"
            ]
        );


    const tehsil =
        firstValue(
            eventData,
            [
                "tehsil",
                "tehsilName"
            ]
        );


    const villageCity =
        firstValue(
            eventData,
            [
                "villageCity",
                "village",
                "city",
                "villageName",
                "cityName"
            ]
        );


    const eventAddress =
        firstValue(
            eventData,
            [
                "eventAddress",
                "address",
                "eventLocation",
                "location"
            ]
        );


    setText(
        "eventType",
        eventType
    );


    setText(
        "eventDate",
        eventDate
    );


    setText(
        "eventTime",
        eventTime
    );


    setText(
        "district",
        district
    );


    setText(
        "tehsil",
        tehsil
    );


    setText(
        "villageCity",
        villageCity
    );


    setText(
        "eventAddress",
        eventAddress
    );

}


/* =========================================
   PACKAGE DATA
========================================= */

function displayPackageData() {

    const packageName =
        firstValue(
            packageData,
            [
                "packageName",
                "selectedPackage",
                "package",
                "name"
            ]
        );


    const packageAmount =
        Number(
            firstValue(
                packageData,
                [
                    "packageAmount",
                    "baseAmount",
                    "price",
                    "packagePrice",
                    "amount"
                ],
                0
            )
        ) || 0;


    const extraEquipment =
        firstValue(
            packageData,
            [
                "extraEquipment",
                "extras",
                "extra",
                "selectedExtras"
            ],
            "None"
        );


    const extraEquipmentAmount =
        Number(
            firstValue(
                packageData,
                [
                    "extraEquipmentAmount",
                    "extraAmount",
                    "extrasAmount"
                ],
                0
            )
        ) || 0;


    let totalAmount =
        Number(
            packageData.totalAmount
        ) || 0;


    /*
       अगर totalAmount packageData में
       नहीं है तो calculation करें।
    */

    if (totalAmount <= 0) {

        totalAmount =
            packageAmount +
            extraEquipmentAmount;

    }


    let advanceAmount =
        Number(
            packageData.advanceAmount
        ) || 0;


    /*
       Advance rule:

       Total <= 2500
       → minimum ₹500

       Total >= 2500
       → 30%

       Advance कभी ₹500 से कम नहीं
    */

    if (advanceAmount <= 0) {

        if (
            totalAmount <= 2500
        ) {

            advanceAmount = 500;

        } else {

            advanceAmount =
                Math.ceil(
                    totalAmount * 0.30
                );

        }

    }


    if (
        advanceAmount < 500 &&
        totalAmount > 0
    ) {

        advanceAmount = 500;

    }


    if (
        advanceAmount > totalAmount &&
        totalAmount > 0
    ) {

        advanceAmount =
            totalAmount;

    }


    const remainingAmount =
        Math.max(
            totalAmount -
            advanceAmount,
            0
        );


    setText(
        "packageName",
        packageName
    );


    setText(
        "packageAmount",
        formatMoney(
            packageAmount
        )
    );


    setText(
        "extraEquipment",
        extraEquipment,
        "None"
    );


    setText(
        "extraEquipmentAmount",
        formatMoney(
            extraEquipmentAmount
        )
    );


    setText(
        "totalAmount",
        formatMoney(
            totalAmount
        )
    );


    setText(
        "advanceAmount",
        formatMoney(
            advanceAmount
        )
    );


    setText(
        "remainingAmount",
        formatMoney(
            remainingAmount
        )
    );


    /*
       Correct calculated values वापस
       packageData में save करें।
    */

    packageData.packageAmount =
        packageAmount;


    packageData.extraEquipmentAmount =
        extraEquipmentAmount;


    packageData.totalAmount =
        totalAmount;


    packageData.advanceAmount =
        advanceAmount;


    packageData.remainingAmount =
        remainingAmount;


    localStorage.setItem(
        PACKAGE_KEY,
        JSON.stringify(
            packageData
        )
    );


    return {

        packageName:
            packageName,

        packageAmount:
            packageAmount,

        extraEquipment:
            extraEquipment,

        extraEquipmentAmount:
            extraEquipmentAmount,

        totalAmount:
            totalAmount,

        advanceAmount:
            advanceAmount,

        remainingAmount:
            remainingAmount

    };

}


/* =========================================
   CREATE CONFIRMATION DATA
========================================= */

function saveConfirmation() {

    const packageSummary =
        displayPackageData();


    confirmationData =
        {

            ...confirmationData,

            customer:
                customerData,

            event:
                eventData,

            package:
                packageData,

            totalAmount:
                packageSummary.totalAmount,

            advanceAmount:
                packageSummary.advanceAmount,

            remainingAmount:
                packageSummary.remainingAmount,

            bookingStatus:
                "Pending",

            paymentStatus:
                "Pending"

        };


    localStorage.setItem(

        CONFIRMATION_KEY,

        JSON.stringify(
            confirmationData
        )

    );

}


/* =========================================
   EDIT CUSTOMER
========================================= */

const editCustomerButton =
    getElement(
        "editCustomerButton"
    );


if (editCustomerButton) {

    editCustomerButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );

}


/* =========================================
   EDIT EVENT
========================================= */

const editEventButton =
    getElement(
        "editEventButton"
    );


if (editEventButton) {

    editEventButton.addEventListener(
        "click",
        function () {

            /*
               Event page पर जाते समय
               current data localStorage में
               पहले से मौजूद है।

               इसलिए event.js को उसी data को
               form में load करना चाहिए।
            */

            window.location.href =
                "event.html";

        }
    );

}


/* =========================================
   EDIT PACKAGE
========================================= */

const editPackageButton =
    getElement(
        "editPackageButton"
    );


if (editPackageButton) {

    editPackageButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "package.html";

        }
    );

}


/* =========================================
   BACK BUTTON
========================================= */

const backButton =
    getElement(
        "backButton"
    );


if (backButton) {

    backButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "package.html";

        }
    );

}


/* =========================================
   CONTINUE TO PAYMENT
========================================= */

const continueButton =
    getElement(
        "continueButton"
    );


if (continueButton) {

    continueButton.addEventListener(
        "click",
        function () {

            const errorBox =
                getElement(
                    "reviewError"
                );


            if (errorBox) {

                errorBox.textContent =
                    "";

            }


            /*
               Required data check
            */

            if (
                !customerData ||
                Object.keys(customerData).length === 0
            ) {

                if (errorBox) {

                    errorBox.textContent =
                        "Customer information is missing.";

                }

                return;

            }


            if (
                !eventData ||
                Object.keys(eventData).length === 0
            ) {

                if (errorBox) {

                    errorBox.textContent =
                        "Event information is missing. Please complete the event details.";

                }

                return;

            }


            if (
                !packageData ||
                Object.keys(packageData).length === 0
            ) {

                if (errorBox) {

                    errorBox.textContent =
                        "Package information is missing.";

                }

                return;

            }


            /*
               Save final Review data
            */

            saveConfirmation();


            /*
               Payment page
            */

            window.location.href =
                "payment.html";

        }
    );

}


/* =========================================
   INITIAL DISPLAY
========================================= */

displayCustomerData();

displayEventData();

displayPackageData();

saveConfirmation();


/* =========================================
   DEBUG
========================================= */

console.log(
    "================================="
);

console.log(
    "DJ BOOKING PRO - REVIEW"
);

console.log(
    "Customer Data:",
    customerData
);

console.log(
    "Event Data:",
    eventData
);

console.log(
    "Package Data:",
    packageData
);

console.log(
    "Confirmation Data:",
    confirmationData
);

console.log(
    "================================="
);