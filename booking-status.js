/* =========================================================
   DJ BOOKING PRO
   BOOKING STATUS JAVASCRIPT
========================================================= */


/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = "http://localhost:3000";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const bookingNumberInput =
    document.getElementById("bookingNumber");

const checkButton =
    document.getElementById("checkButton");

const refreshButton =
    document.getElementById("refreshButton");

const searchError =
    document.getElementById("searchError");

const statusResult =
    document.getElementById("statusResult");

const statusBanner =
    document.getElementById("statusBanner");

const statusIcon =
    document.getElementById("statusIcon");

const statusTitle =
    document.getElementById("statusTitle");

const statusMessage =
    document.getElementById("statusMessage");


/* =========================================================
   HELPER FUNCTIONS
========================================================= */


/*
    Safely parse JSON.

    Backend database fields are stored as JSON strings:
    customer_data
    event_data
    package_data
    confirmation_data
    payment_data
*/

function parseJSON(value) {

    if (!value) {
        return {};
    }

    if (typeof value === "object") {
        return value;
    }

    try {
        return JSON.parse(value);
    }

    catch (error) {

        console.error(
            "JSON parse error:",
            error,
            value
        );

        return {};
    }
}


/*
    Get value safely.
*/

function safeValue(value, defaultValue = "-") {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return defaultValue;
    }

    return String(value);
}


/*
    Format money.
*/

function formatMoney(value) {

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "₹0";
    }

    return "₹" + number.toLocaleString("en-IN");
}


/*
    Format date.

    Input:
    2026-09-04

    Output:
    04/09/2026
*/

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const parts = String(dateValue).split("-");

    if (parts.length === 3) {

        return (
            parts[2] +
            "/" +
            parts[1] +
            "/" +
            parts[0]
        );
    }

    return String(dateValue);
}


/*
    Format date + time.
*/

function formatDateTime(value) {

    if (!value) {
        return "-";
    }

    try {

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    }

    catch (error) {

        return String(value);

    }
}


/*
    Show error.
*/

function showError(message) {

    searchError.textContent = message;

    searchError.classList.remove("hidden");

}


/*
    Hide error.
*/

function hideError() {

    searchError.textContent = "";

    searchError.classList.add("hidden");

}


/*
    Show result.
*/

function showResult() {

    statusResult.classList.remove("hidden");

}


/*
    Hide result.
*/

function hideResult() {

    statusResult.classList.add("hidden");

}


/* =========================================================
   STATUS UI
========================================================= */

function updateStatusUI(
    bookingStatus,
    paymentStatus
) {

    const booking =
        String(
            bookingStatus || "Pending"
        ).toLowerCase();


    const payment =
        String(
            paymentStatus || "Pending"
        ).toLowerCase();


    /* Remove old classes */

    statusBanner.classList.remove(
        "cancelled",
        "pending"
    );


    /* ================================================
       CANCELLED
    ================================================= */

    if (booking === "cancelled") {

        statusBanner.classList.add(
            "cancelled"
        );

        statusIcon.textContent = "✕";

        statusTitle.textContent =
            "Booking Cancelled";

        statusMessage.textContent =
            "Your booking has been cancelled by the administrator.";

        return;
    }


    /* ================================================
       PENDING
    ================================================= */

    if (booking === "pending") {

        statusBanner.classList.add(
            "pending"
        );

        statusIcon.textContent = "⌛";

        statusTitle.textContent =
            "Booking Pending";

        statusMessage.textContent =
            "Your booking is waiting for confirmation.";

        return;
    }


    /* ================================================
       CONFIRMED
    ================================================= */

    if (booking === "confirmed") {

        statusIcon.textContent = "✓";

        statusTitle.textContent =
            "Booking Confirmed";

        if (payment === "paid") {

            statusMessage.textContent =
                "Your booking is confirmed and payment has been received.";

        }

        else {

            statusMessage.textContent =
                "Your booking is confirmed.";

        }

        return;
    }


    /* ================================================
       OTHER STATUS
    ================================================= */

    statusIcon.textContent = "ℹ";

    statusTitle.textContent =
        safeValue(bookingStatus);

    statusMessage.textContent =
        "Your latest booking status is shown below.";

}


/* =========================================================
   DISPLAY EXTRA EQUIPMENT
========================================================= */

function displayExtras(extras) {

    const extrasContainer =
        document.getElementById("resultExtras");


    extrasContainer.innerHTML = "";


    if (
        !Array.isArray(extras) ||
        extras.length === 0
    ) {

        extrasContainer.textContent =
            "No extra equipment selected.";

        return;
    }


    extras.forEach(function(extra) {

        const item =
            document.createElement("span");

        item.className =
            "extra-item";


        const name =
            safeValue(
                extra.name,
                "Extra Equipment"
            );


        const price =
            formatMoney(
                extra.price || 0
            );


        item.textContent =
            name + " - " + price;


        extrasContainer.appendChild(item);

    });

}


/* =========================================================
   DISPLAY BOOKING
========================================================= */

function displayBooking(booking) {

    console.log(
        "Booking received:",
        booking
    );


    /*
        IMPORTANT:

        Backend returns:

        customer_data
        event_data
        package_data
        confirmation_data
        payment_data

        These are JSON strings.

        We parse them here.
    */


    const customer =
        parseJSON(
            booking.customer_data
        );


    const event =
        parseJSON(
            booking.event_data
        );


    const packageData =
        parseJSON(
            booking.package_data
        );


    const confirmation =
        parseJSON(
            booking.confirmation_data
        );


    const payment =
        parseJSON(
            booking.payment_data
        );


    /*
        Sometimes confirmation_data also contains
        customer/event/package/payment details.

        If direct database fields are missing,
        use confirmation data as fallback.
    */


    const finalCustomer =
        Object.keys(customer).length
            ? customer
            : parseJSON(
                confirmation.customer
            );


    const finalEvent =
        Object.keys(event).length
            ? event
            : parseJSON(
                confirmation.event
            );


    const finalPackage =
        Object.keys(packageData).length
            ? packageData
            : parseJSON(
                confirmation.package
            );


    const finalPayment =
        Object.keys(payment).length
            ? payment
            : confirmation;


    /* =====================================================
       BOOKING NUMBER
    ====================================================== */

    document.getElementById(
        "resultBookingNumber"
    ).textContent =
        safeValue(
            booking.booking_number ||
            confirmation.bookingNumber
        );


    /* =====================================================
       CUSTOMER
    ====================================================== */

    document.getElementById(
        "resultCustomer"
    ).textContent =
        safeValue(
            finalCustomer.name
        );


    document.getElementById(
        "resultMobile"
    ).textContent =
        safeValue(
            finalCustomer.mobile
        );


    document.getElementById(
        "resultAddress"
    ).textContent =
        safeValue(
            finalCustomer.address
        );


    /* =====================================================
       EVENT
    ====================================================== */

    let eventType =
        finalEvent.eventType;


    if (
        eventType === "Other" &&
        finalEvent.otherEvent
    ) {

        eventType =
            finalEvent.otherEvent;
    }


    document.getElementById(
        "resultEvent"
    ).textContent =
        safeValue(
            eventType
        );


    document.getElementById(
        "resultDate"
    ).textContent =
        formatDate(
            finalEvent.eventDate
        );


    document.getElementById(
        "resultTime"
    ).textContent =
        safeValue(
            finalEvent.eventTime
        );


    document.getElementById(
        "resultLocation"
    ).textContent =
        safeValue(
            finalEvent.eventLocation
        );


    document.getElementById(
        "resultDistrict"
    ).textContent =
        safeValue(
            finalEvent.district
        );


    document.getElementById(
        "resultTehsil"
    ).textContent =
        safeValue(
            finalEvent.tehsil
        );


    document.getElementById(
        "resultVillage"
    ).textContent =
        safeValue(
            finalEvent.village
        );


    document.getElementById(
        "resultVenueAddress"
    ).textContent =
        safeValue(
            finalEvent.venueAddress
        );


    document.getElementById(
        "resultEventNote"
    ).textContent =
        safeValue(
            finalEvent.eventNote
        );


    /* =====================================================
       PACKAGE
    ====================================================== */

    document.getElementById(
        "resultPackage"
    ).textContent =
        safeValue(
            finalPackage.packageName
        );


    document.getElementById(
        "resultPackagePrice"
    ).textContent =
        formatMoney(
            finalPackage.packagePrice
        );


    displayExtras(
        finalPackage.extras
    );


    document.getElementById(
        "resultExtraAmount"
    ).textContent =
        formatMoney(
            finalPackage.extraAmount
        );


    document.getElementById(
        "resultTotal"
    ).textContent =
        formatMoney(
            finalPackage.totalAmount
        );


    document.getElementById(
        "resultMinimumAdvance"
    ).textContent =
        formatMoney(
            finalPackage.minimumAdvance
        );


    document.getElementById(
        "resultAdvance"
    ).textContent =
        formatMoney(
            finalPackage.advanceAmount
        );


    document.getElementById(
        "resultRemaining"
    ).textContent =
        formatMoney(
            finalPackage.remainingAmount
        );


    /* =====================================================
       PAYMENT
    ====================================================== */

    const paymentStatus =
        booking.payment_status ||
        finalPayment.paymentStatus ||
        confirmation.paymentStatus;


    const bookingStatus =
        booking.booking_status ||
        confirmation.bookingStatus;


    document.getElementById(
        "resultPayment"
    ).textContent =
        safeValue(
            paymentStatus
        );


    document.getElementById(
        "resultPaymentMethod"
    ).textContent =
        safeValue(
            finalPayment.paymentMethod ||
            confirmation.paymentMethod
        );


    document.getElementById(
        "resultPaymentAmount"
    ).textContent =
        formatMoney(
            finalPayment.amount ||
            finalPayment.paymentAmount ||
            confirmation.paymentAmount
        );


    document.getElementById(
        "resultPaymentMode"
    ).textContent =
        safeValue(
            finalPayment.paymentMode ||
            confirmation.paymentMode
        );


    document.getElementById(
        "resultTransaction"
    ).textContent =
        safeValue(
            finalPayment.transactionId ||
            confirmation.transactionId
        );


    document.getElementById(
        "resultVerification"
    ).textContent =
        safeValue(
            finalPayment.verificationStatus ||
            confirmation.verificationStatus
        );


    /* =====================================================
       FINAL STATUS
    ====================================================== */

    document.getElementById(
        "resultStatus"
    ).textContent =
        safeValue(
            bookingStatus
        );


    document.getElementById(
        "resultPaymentBottom"
    ).textContent =
        safeValue(
            paymentStatus
        );


    document.getElementById(
        "resultCreatedAt"
    ).textContent =
        formatDateTime(
            booking.created_at
        );


    document.getElementById(
        "resultVerifiedAt"
    ).textContent =
        formatDateTime(
            booking.verified_at
        );


    /* =====================================================
       PAYMENT STATUS CSS
    ====================================================== */

    const paymentElement =
        document.getElementById(
            "resultPayment"
        );


    paymentElement.classList.remove(
        "unpaid",
        "cancelled"
    );


    if (
        String(paymentStatus)
            .toLowerCase() === "cancelled"
    ) {

        paymentElement.classList.add(
            "cancelled"
        );

    }

    else if (
        String(paymentStatus)
            .toLowerCase() !== "paid"
    ) {

        paymentElement.classList.add(
            "unpaid"
        );

    }


    /* =====================================================
       STATUS UI
    ====================================================== */

    updateStatusUI(
        bookingStatus,
        paymentStatus
    );


    /* Show result */

    showResult();

}


/* =========================================================
   CHECK BOOKING
========================================================= */

async function checkBooking() {

    hideError();

    hideResult();


    let bookingNumber =
        bookingNumberInput.value.trim();


    /* ================================================
       VALIDATION
    ================================================= */

    if (!bookingNumber) {

        showError(
            "Please enter your booking number."
        );

        bookingNumberInput.focus();

        return;
    }


    /*
        Convert to uppercase.
        Example:

        dj-2026-00016

        becomes:

        DJ-2026-00016
    */

    bookingNumber =
        bookingNumber.toUpperCase();


    bookingNumberInput.value =
        bookingNumber;


    /* Disable button */

    checkButton.disabled = true;

    checkButton.textContent =
        "Checking...";


    try {

        /*
            IMPORTANT API:

            http://localhost:3000/api/booking-status/DJ-2026-00016
        */

        const url =
            API_BASE_URL +
            "/api/booking-status/" +
            encodeURIComponent(
                bookingNumber
            );


        console.log(
            "Checking URL:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        console.log(
            "HTTP Status:",
            response.status
        );


        /*
            Read response as text first.

            This prevents JSON parsing errors
            if server sends an HTML error page.
        */

        const responseText =
            await response.text();


        console.log(
            "Server response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                "Server returned HTTP " +
                response.status
            );

        }


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }

        catch (jsonError) {

            console.error(
                "Invalid JSON:",
                jsonError
            );

            throw new Error(
                "Server returned invalid JSON."
            );

        }


        /* ==========================================
           API SUCCESS CHECK
        =========================================== */

        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data && data.message
                    ? data.message
                    : "Booking not found."
            );

        }


        /* ==========================================
           BOOKING CHECK
        =========================================== */

        if (!data.booking) {

            throw new Error(
                "Booking details were not returned by the server."
            );

        }


        /*
            Display complete booking.
        */

        displayBooking(
            data.booking
        );

    }

    catch (error) {

        console.error(
            "Booking status error:",
            error
        );


        showError(
            error.message ||
            "Unable to check booking. Please try again."
        );

    }

    finally {

        checkButton.disabled = false;

        checkButton.textContent =
            "🔍 Check Booking";

    }

}


/* =========================================================
   REFRESH CURRENT BOOKING
========================================================= */

function refreshBooking() {

    const bookingNumber =
        bookingNumberInput.value.trim();


    if (!bookingNumber) {

        showError(
            "Please enter a booking number."
        );

        return;
    }


    checkBooking();

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

checkButton.addEventListener(
    "click",
    checkBooking
);


refreshButton.addEventListener(
    "click",
    refreshBooking
);


/* =========================================================
   ENTER KEY
========================================================= */

bookingNumberInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            checkBooking();

        }

    }
);


/* =========================================================
   AUTO UPPERCASE
========================================================= */

bookingNumberInput.addEventListener(
    "input",
    function() {

        this.value =
            this.value.toUpperCase();

    }
);


/* =========================================================
   AUTO CHECK FROM URL
=========================================================

   Example:

   booking-status.html?booking=DJ-2026-00016

========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const bookingFromURL =
            params.get("booking");


        if (bookingFromURL) {

            bookingNumberInput.value =
                bookingFromURL.toUpperCase();

            checkBooking();

        }

    }
);