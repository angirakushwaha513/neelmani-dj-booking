/* =========================================
   DJ BOOKING PRO
   STEP 5 - PAYMENT
   BACKEND + SQLITE CONNECTED
========================================= */


/* =========================================
   BACKEND URL
========================================= */

const BACKEND_URL =
    "http://localhost:3000";


/* =========================================
   GET SAVED DATA
========================================= */

const customerDataRaw =
    localStorage.getItem("djCustomerData");

const eventDataRaw =
    localStorage.getItem("djEventData");

const packageDataRaw =
    localStorage.getItem("djPackageData");

const confirmationDataRaw =
    localStorage.getItem("djBookingConfirmation");


/* =========================================
   ELEMENTS
========================================= */

const customerName =
    document.getElementById(
        "customerName"
    );


const customerMobile =
    document.getElementById(
        "customerMobile"
    );


const totalAmount =
    document.getElementById(
        "totalAmount"
    );


const advanceAmount =
    document.getElementById(
        "advanceAmount"
    );


const remainingAmount =
    document.getElementById(
        "remainingAmount"
    );


const methodOptions =
    document.querySelectorAll(
        'input[name="paymentMethod"]'
    );


const methodError =
    document.getElementById(
        "methodError"
    );


const upiBox =
    document.getElementById(
        "upiBox"
    );


const cashBox =
    document.getElementById(
        "cashBox"
    );


const paymentStatus =
    document.getElementById(
        "paymentStatus"
    );


const payButton =
    document.getElementById(
        "payButton"
    );


const backButton =
    document.getElementById(
        "backButton"
    );


/* =========================================
   DATA VARIABLES
========================================= */

let customerData = null;

let eventData = null;

let packageData = null;

let confirmationData = {};


/* =========================================
   LOAD BOOKING DATA
========================================= */

function loadBookingData() {

    if (!customerDataRaw) {

        alert(
            "Customer information is missing."
        );

        window.location.href =
            "index.html";

        return false;

    }


    if (!eventDataRaw) {

        alert(
            "Event information is missing."
        );

        window.location.href =
            "event.html";

        return false;

    }


    if (!packageDataRaw) {

        alert(
            "Package information is missing."
        );

        window.location.href =
            "package.html";

        return false;

    }


    try {

        customerData =
            JSON.parse(
                customerDataRaw
            );


        eventData =
            JSON.parse(
                eventDataRaw
            );


        packageData =
            JSON.parse(
                packageDataRaw
            );


        if (confirmationDataRaw) {

            confirmationData =
                JSON.parse(
                    confirmationDataRaw
                );

        }


        return true;


    } catch (error) {

        console.error(
            "Booking data error:",
            error
        );


        alert(
            "Booking data is invalid. Please start again."
        );


        window.location.href =
            "index.html";


        return false;

    }

}


/* =========================================
   FORMAT MONEY
========================================= */

function formatMoney(amount) {

    return new Intl.NumberFormat(

        "en-IN",

        {

            style: "currency",

            currency: "INR",

            maximumFractionDigits: 0

        }

    ).format(
        Number(amount) || 0
    );

}


/* =========================================
   DISPLAY CUSTOMER
========================================= */

function displayCustomer() {

    customerName.textContent =

        customerData.name ||

        customerData.fullName ||

        customerData.customerName ||

        "-";


    customerMobile.textContent =

        customerData.mobile ||

        customerData.mobileNumber ||

        customerData.phone ||

        "-";

}


/* =========================================
   GET PAYMENT AMOUNTS
========================================= */

function getPaymentAmounts() {

    const total =
        Number(
            packageData.totalAmount
        ) || 0;


    const advance =
        Number(
            packageData.advanceAmount
        ) || 0;


    let remaining =
        Number(
            packageData.remainingAmount
        );


    if (
        !Number.isFinite(
            remaining
        )
    ) {

        remaining =
            Math.max(
                total - advance,
                0
            );

    }


    return {

        total:
            total,

        advance:
            advance,

        remaining:
            remaining

    };

}


/* =========================================
   DISPLAY AMOUNTS
========================================= */

function displayAmounts() {

    const amounts =
        getPaymentAmounts();


    totalAmount.textContent =
        formatMoney(
            amounts.total
        );


    advanceAmount.textContent =
        formatMoney(
            amounts.advance
        );


    remainingAmount.textContent =
        formatMoney(
            amounts.remaining
        );


    return amounts;

}


/* =========================================
   SHOW STATUS
========================================= */

function showStatus(
    message,
    type
) {

    paymentStatus.textContent =
        message;


    paymentStatus.className =
        "payment-status show " +
        type;

}


/* =========================================
   HIDE STATUS
========================================= */

function hideStatus() {

    paymentStatus.textContent =
        "";


    paymentStatus.className =
        "payment-status";

}


/* =========================================
   PAYMENT METHOD
========================================= */

methodOptions.forEach(

    function (option) {

        option.addEventListener(

            "change",

            function () {

                methodError.textContent =
                    "";


                hideStatus();


                /*
                   Hide UPI
                */

                upiBox.classList.remove(
                    "show"
                );


                /*
                   Hide Cash
                */

                cashBox.classList.remove(
                    "show"
                );


                /*
                   UPI
                */

                if (
                    this.value === "UPI"
                ) {

                    upiBox.classList.add(
                        "show"
                    );

                }


                /*
                   CASH
                */

                if (
                    this.value === "Cash"
                ) {

                    cashBox.classList.add(
                        "show"
                    );

                }

            }

        );

    }

);


/* =========================================
   CREATE CONFIRMATION
========================================= */

function createConfirmation() {

    const amounts =
        getPaymentAmounts();


    return {

        ...confirmationData,


        customer:
            customerData,


        event:
            eventData,


        package:
            packageData,


        totalAmount:
            amounts.total,


        advanceAmount:
            amounts.advance,


        remainingAmount:
            amounts.remaining,


        bookingStatus:
            "Confirmed",


        paymentStatus:
            "Paid"

    };

}


/* =========================================
   SEND PAYMENT TO BACKEND
========================================= */

async function sendPaymentToBackend(
    selectedMethod
) {

    const amounts =
        getPaymentAmounts();


    /*
       Backend data
    */

    const requestData = {

        customer:
            customerData,


        event:
            eventData,


        package:
            packageData,


        confirmation:
            confirmationData,


        paymentMethod:
            selectedMethod

    };


    /*
       =====================================
       GOOGLE SESSION TOKEN
       =====================================
       
       Google login ke time backend se
       mila server session token
       localStorage me save hua hai.
    */

    const googleToken =
        localStorage.getItem(
            "customerGoogleToken"
        );


    const googleCredential =
        localStorage.getItem(
            "customerGoogleCredential"
        );


    console.log(
        "Google session token available:",
        !!googleToken
    );


    console.log(
        "Sending booking to backend..."
    );


    console.log(
        "Request:",
        requestData
    );


    /*
       Send request
    */

    const response =
        await fetch(

            BACKEND_URL +
            "/api/payments/demo-verify",

            {

                method:
                    "POST",


                headers: {

                    "Content-Type":
                        "application/json",


                    /*
                       Google verification token
                    */

                    "x-customer-google-token":
                        googleToken || "",


                    "x-customer-google-credential":
                        googleCredential || ""

                },


                body:
                    JSON.stringify(
                        requestData
                    )

            }

        );


    /*
       Read response
    */

    const responseText =
        await response.text();


    console.log(
        "Backend Status:",
        response.status
    );


    console.log(
        "Backend Response:",
        responseText
    );


    /*
       Empty response
    */

    if (
        !responseText.trim()
    ) {

        throw new Error(
            "Server returned an empty response."
        );

    }


    /*
       Convert response to JSON
    */

    let data;


    try {

        data =
            JSON.parse(
                responseText
            );

    } catch (error) {

        console.error(
            "Invalid JSON from server:",
            responseText
        );


        throw new Error(
            "Server returned an invalid response."
        );

    }


    /*
       HTTP error
    */

    if (
        !response.ok
    ) {

        throw new Error(

            data.message ||

            "Server rejected the booking."

        );

    }


    /*
       Backend success check
    */

    if (
        !data.success
    ) {

        throw new Error(

            data.message ||

            "Booking could not be confirmed."

        );

    }


    /*
       Booking number check
    */

    if (
        !data.bookingNumber
    ) {

        throw new Error(
            "Server did not return a booking number."
        );

    }


    return data;

}


/* =========================================
   SAVE SUCCESSFUL PAYMENT DATA
========================================= */

function saveSuccessfulBooking(
    serverData,
    selectedMethod
) {

    const amounts =
        getPaymentAmounts();


    /*
       Payment data
    */

    const paymentData = {

        transactionId:
            serverData.transactionId,


        bookingNumber:
            serverData.bookingNumber,


        paymentMethod:
            selectedMethod,


        amount:
            amounts.advance,


        currency:
            "INR",


        paymentStatus:
            serverData.paymentStatus ||
            "Paid",


        verificationStatus:
            serverData.verificationStatus ||
            "Verified",


        paymentMode:
            "Demo",


        paidAt:
            serverData.verifiedAt ||
            new Date().toISOString(),


        bookingStatus:
            serverData.bookingStatus ||
            "Confirmed"

    };


    /*
       Confirmation
    */

    const updatedConfirmation = {

        ...createConfirmation(),


        bookingNumber:
            serverData.bookingNumber,


        transactionId:
            serverData.transactionId,


        paymentMethod:
            selectedMethod,


        paymentAmount:
            amounts.advance,


        paymentCompletedAt:
            serverData.verifiedAt ||
            new Date().toISOString(),


        paymentMode:
            "Demo",


        paymentStatus:
            "Paid",


        bookingStatus:
            "Confirmed",


        verificationStatus:
            "Verified"

    };


    /*
       Receipt
    */

    const receiptData = {

        bookingNumber:
            serverData.bookingNumber,


        databaseId:
            serverData.databaseId,


        customer:
            customerData,


        event:
            eventData,


        package:
            packageData,


        payment:
            paymentData,


        confirmation:
            updatedConfirmation,


        totalAmount:
            amounts.total,


        advanceAmount:
            amounts.advance,


        remainingAmount:
            amounts.remaining

    };


    /*
       Save payment
    */

    localStorage.setItem(

        "djPaymentData",

        JSON.stringify(
            paymentData
        )

    );


    /*
       Save confirmation
    */

    localStorage.setItem(

        "djBookingConfirmation",

        JSON.stringify(
            updatedConfirmation
        )

    );


    /*
       Save receipt
    */

    localStorage.setItem(

        "djReceiptData",

        JSON.stringify(
            receiptData
        )

    );


    /*
       Also save booking number separately
    */

    localStorage.setItem(

        "djBookingNumber",

        serverData.bookingNumber

    );


    console.log(
        "Booking saved successfully ✅"
    );


    console.log(
        "Booking Number:",
        serverData.bookingNumber
    );


    console.log(
        "Transaction ID:",
        serverData.transactionId
    );


    console.log(
        "Database ID:",
        serverData.databaseId
    );


    return {

        paymentData,

        confirmation:
            updatedConfirmation,

        receiptData

    };

}


/* =========================================
   PAYMENT BUTTON
========================================= */

payButton.addEventListener(

    "click",

    async function () {


        /* =================================
           PAYMENT METHOD
        ================================= */

        const selectedMethod =
            document.querySelector(

                'input[name="paymentMethod"]:checked'

            );


        methodError.textContent =
            "";


        hideStatus();


        if (
            !selectedMethod
        ) {

            methodError.textContent =
                "Please select a payment method.";


            return;

        }


        /* =================================
           PAYMENT AMOUNTS
        ================================= */

        const amounts =
            getPaymentAmounts();


        /*
           Total validation
        */

        if (
            amounts.total <= 0
        ) {

            showStatus(

                "Invalid total booking amount.",

                "error"

            );


            return;

        }


        /*
           Advance validation
        */

        if (
            amounts.advance <= 0
        ) {

            showStatus(

                "Invalid advance payment amount.",

                "error"

            );


            return;

        }


        /*
           Advance > Total
        */

        if (
            amounts.advance >
            amounts.total
        ) {

            showStatus(

                "Advance cannot be greater than total amount.",

                "error"

            );


            return;

        }


        /* =================================
           BUTTON DISABLE
        ================================= */

        payButton.disabled =
            true;


        payButton.innerHTML =
            "<span>⏳</span><span>Processing...</span>";


        showStatus(

            "Connecting to booking server...",

            "success"

        );


        try {


            /* =================================
               SEND TO BACKEND
            ================================= */

            showStatus(

                "Verifying payment with server...",

                "success"

            );


            const serverData =
                await sendPaymentToBackend(

                    selectedMethod.value

                );


            /* =================================
               SAVE DATA
            ================================= */

            saveSuccessfulBooking(

                serverData,

                selectedMethod.value

            );


            /* =================================
               SUCCESS
            ================================= */

            showStatus(

                "Payment Successful ✓ Booking Confirmed!",

                "success"

            );


            payButton.innerHTML =
                "<span>✓</span><span>Payment Successful</span>";


            /*
               Open receipt
            */

            setTimeout(

                function () {

                    window.location.href =
                        "receipt.html";

                },

                1000

            );


        } catch (error) {


            console.error(
                "Payment / Booking Error:",
                error
            );


            /*
               Network error
            */

            if (
                error instanceof
                TypeError
            ) {

                showStatus(

                    "Backend connection failed. Make sure Node server is running on http://localhost:3000.",

                    "error"

                );

            } else {

                showStatus(

                    error.message ||

                    "Payment processing failed.",

                    "error"

                );

            }


            /*
               Enable button again
            */

            payButton.disabled =
                false;


            payButton.innerHTML =
                "<span>💳</span><span>Continue to Payment</span>";

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
            "review.html";

    }

);


/* =========================================
   INITIALIZE
========================================= */

if (
    loadBookingData()
) {


    displayCustomer();


    const amounts =
        displayAmounts();


    console.log(
        "================================="
    );


    console.log(
        "DJ BOOKING PRO - PAYMENT"
    );


    console.log(
        "================================="
    );


    console.log(
        "Customer:",
        customerData
    );


    console.log(
        "Event:",
        eventData
    );


    console.log(
        "Package:",
        packageData
    );


    console.log(
        "Total:",
        amounts.total
    );


    console.log(
        "Advance:",
        amounts.advance
    );


    console.log(
        "Remaining:",
        amounts.remaining
    );


    console.log(
        "Backend:",
        BACKEND_URL
    );


    console.log(
        "================================="
    );

}