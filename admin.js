/* =========================================
   DJ BOOKING PRO
   ADMIN DASHBOARD
   FIXED BOOKING API
========================================= */


/* =========================================
   BACKEND URL
========================================= */

const BACKEND_URL =
    "http://localhost:3000";


/* =========================================
   ADMIN TOKEN
========================================= */

const adminToken =
    sessionStorage.getItem(
        "djAdminToken"
    );


if (!adminToken) {

    window.location.href =
        "admin-login.html";

}


/* =========================================
   ELEMENTS
========================================= */

const bookingsContainer =
    document.getElementById(
        "bookingsContainer"
    );


const emptyState =
    document.getElementById(
        "emptyState"
    );


const bookingCount =
    document.getElementById(
        "bookingCount"
    );


const totalBookings =
    document.getElementById(
        "totalBookings"
    );


const pendingBookings =
    document.getElementById(
        "pendingBookings"
    );


const confirmedBookings =
    document.getElementById(
        "confirmedBookings"
    );


const paidBookings =
    document.getElementById(
        "paidBookings"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const statusFilter =
    document.getElementById(
        "statusFilter"
    );


const paymentFilter =
    document.getElementById(
        "paymentFilter"
    );


const refreshButton =
    document.getElementById(
        "refreshButton"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const adminStatus =
    document.getElementById(
        "adminStatus"
    );


const lastUpdated =
    document.getElementById(
        "lastUpdated"
    );


const bookingModal =
    document.getElementById(
        "bookingModal"
    );


const closeModalButton =
    document.getElementById(
        "closeModalButton"
    );


const bookingDetails =
    document.getElementById(
        "bookingDetails"
    );


const modalBookingNumber =
    document.getElementById(
        "modalBookingNumber"
    );


const modalConfirmButton =
    document.getElementById(
        "modalConfirmButton"
    );


const modalCancelButton =
    document.getElementById(
        "modalCancelButton"
    );


/* =========================================
   DATA
========================================= */

let allBookings = [];

let currentBookingId = null;


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
   SAFE VALUE
========================================= */

function safe(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "-";

    }

    return String(value);

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================
   AUTH HEADERS
========================================= */

function authHeaders() {

    return {

        "Accept":
            "application/json",

        "Authorization":
            "Bearer " +
            adminToken

    };

}


/* =========================================
   PARSE JSON
========================================= */

function parseJSON(value) {

    if (!value) {

        return {};

    }


    if (
        typeof value === "object"
    ) {

        return value;

    }


    try {

        return JSON.parse(
            value
        );

    } catch (error) {

        console.error(
            "JSON Parse Error:",
            error
        );

        return {};

    }

}


/* =========================================
   LOAD BOOKINGS
========================================= */

async function loadBookings() {

    if (!adminToken) {

        window.location.href =
            "admin-login.html";

        return;

    }


    refreshButton.disabled =
        true;


    refreshButton.textContent =
        "⏳ Loading...";


    showStatus(
        "Bookings load हो रही हैं...",
        "success"
    );


    try {

        console.log(
            "================================="
        );


        console.log(
            "LOADING BOOKINGS"
        );


        console.log(
            "Backend:",
            BACKEND_URL
        );


        console.log(
            "API:",
            BACKEND_URL +
            "/api/bookings"
        );


        /* =================================
           IMPORTANT:
           Server में यही API है:
           GET /api/bookings
        ================================= */

        const response =
            await fetch(

                BACKEND_URL +
                "/api/bookings",

                {

                    method: "GET",

                    headers:
                        authHeaders()

                }

            );


        console.log(
            "Response Status:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "Server Response:",
            responseText
        );


        /* =================================
           AUTH ERROR
        ================================= */

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            sessionStorage.removeItem(
                "djAdminToken"
            );


            window.location.href =
                "admin-login.html";


            return;

        }


        /* =================================
           JSON
        ================================= */

        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            throw new Error(
                "Server returned invalid JSON."
            );

        }


        /* =================================
           SERVER ERROR
        ================================= */

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(

                data.message ||

                "Could not load bookings."

            );

        }
        /* =================================
   SAVE BOOKINGS
   SERVER RESPONSE COMPATIBILITY
================================= */

if (
    Array.isArray(
        data.bookings
    )
) {

    allBookings =
        data.bookings.map(
            function (booking) {

                return {

                    ...booking,

                    booking_number:
                        booking.bookingNumber,

                    booking_status:
                        booking.bookingStatus,

                    payment_status:
                        booking.paymentStatus,

                    created_at:
                        booking.createdAt,

                    verified_at:
                        booking.verifiedAt,

                    customer_data:
                        booking.customer,

                    event_data:
                        booking.event,

                    package_data:
                        booking.package,

                    confirmation_data:
                        booking.confirmation,

                    payment_data:
                        booking.payment

                };

            }
        );

} else {

    allBookings = [];

}


        
        /* =================================
           UPDATE DASHBOARD
        ================================= */

        updateStatistics();

        applyFilters();


        /* =================================
           LAST UPDATED
        ================================= */

        if (lastUpdated) {

            lastUpdated.textContent =
                "Last updated: " +
                new Date().toLocaleString(
                    "en-IN"
                );

        }


        if (
            allBookings.length > 0
        ) {

            showStatus(

                allBookings.length +
                " booking(s) loaded successfully.",

                "success"

            );

        } else {

            showStatus(

                "Database में अभी कोई booking नहीं मिली।",

                "error"

            );

        }


    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );


        showStatus(

            error.message ||
            "Bookings load नहीं हो सकीं।",

            "error"

        );


        bookingsContainer.innerHTML = "";


        emptyState.style.display =
            "block";


        bookingCount.textContent =
            "0 bookings";


    } finally {

        refreshButton.disabled =
            false;


        refreshButton.textContent =
            "🔄 Refresh";

    }

}


/* =========================================
   STATISTICS
========================================= */

function updateStatistics() {

    const total =
        allBookings.length;


    const pending =
        allBookings.filter(
            function (booking) {

                return (

                    safe(
                        booking.booking_status
                    )
                        .toLowerCase()

                    ===

                    "pending"

                );

            }
        ).length;


    const confirmed =
        allBookings.filter(
            function (booking) {

                return (

                    safe(
                        booking.booking_status
                    )
                        .toLowerCase()

                    ===

                    "confirmed"

                );

            }
        ).length;


    const paid =
        allBookings.filter(
            function (booking) {

                return (

                    safe(
                        booking.payment_status
                    )
                        .toLowerCase()

                    ===

                    "paid"

                );

            }
        ).length;


    if (totalBookings) {

        totalBookings.textContent =
            total;

    }


    if (pendingBookings) {

        pendingBookings.textContent =
            pending;

    }


    if (confirmedBookings) {

        confirmedBookings.textContent =
            confirmed;

    }


    if (paidBookings) {

        paidBookings.textContent =
            paid;

    }

}


/* =========================================
   APPLY FILTERS
========================================= */

function applyFilters() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "all";


    const payment =
        paymentFilter
            ? paymentFilter.value
            : "all";


    const filtered =
        allBookings.filter(
            function (booking) {

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


                const paymentData =
                    parseJSON(
                        booking.payment_data
                    );


                const searchText = [

                    booking.booking_number,

                    customer.name,

                    customer.fullName,

                    customer.customerName,

                    customer.mobile,

                    customer.mobileNumber,

                    customer.phone,

                    event.eventType,

                    event.event,

                    event.eventDate,

                    packageData.packageName,

                    paymentData.transactionId

                ]

                    .map(safe)

                    .join(" ")

                    .toLowerCase();


                const matchesSearch =
                    !search ||

                    searchText.includes(
                        search
                    );


                const matchesStatus =
                    status === "all" ||

                    safe(
                        booking.booking_status
                    )
                    ===
                    status;


                const matchesPayment =
                    payment === "all" ||

                    safe(
                        booking.payment_status
                    )
                    ===
                    payment;


                return (

                    matchesSearch &&

                    matchesStatus &&

                    matchesPayment

                );

            }
        );


    renderBookings(
        filtered
    );

}


/* =========================================
   RENDER BOOKINGS
========================================= */

function renderBookings(
    bookings
) {

    bookingsContainer.innerHTML =
        "";


    bookingCount.textContent =

        bookings.length +

        (
            bookings.length === 1
                ? " booking"
                : " bookings"
        );


    if (
        bookings.length === 0
    ) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    bookings.forEach(
        function (booking) {

            const card =
                createBookingCard(
                    booking
                );


            bookingsContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================
   CREATE BOOKING CARD
========================================= */

function createBookingCard(
    booking
) {

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


    /* =================================
       OLD DATA COMPATIBILITY
    ================================= */

    const finalEvent =

        Object.keys(event).length

            ? event

            : (
                confirmation.event ||
                {}
            );


    const finalPackage =

        Object.keys(packageData).length

            ? packageData

            : (
                confirmation.package ||
                {}
            );


    /* =================================
       AMOUNTS
    ================================= */

    const total =

        Number(
            finalPackage.totalAmount
        )

        ||

        Number(
            confirmation.totalAmount
        )

        ||

        0;


    const advance =

        Number(
            finalPackage.advanceAmount
        )

        ||

        Number(
            payment.amount
        )

        ||

        Number(
            confirmation.advanceAmount
        )

        ||

        0;


    const bookingStatus =
        safe(
            booking.booking_status
        );


    const paymentStatus =
        safe(
            booking.payment_status
        );


    /* =================================
       CARD
    ================================= */

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "booking-card";


    card.innerHTML = `

        <div class="booking-top">

            <div>

                <div class="booking-number">

                    ${escapeHtml(
                        safe(
                            booking.booking_number
                        )
                    )}

                </div>

                <div class="booking-date">

                    ${escapeHtml(
                        formatDate(
                            booking.created_at
                        )
                    )}

                </div>

            </div>


            <div>

                ${statusBadge(
                    bookingStatus
                )}

                ${paymentBadge(
                    paymentStatus
                )}

            </div>

        </div>


        <div class="booking-grid">


            <div class="booking-item">

                <small>
                    Customer
                </small>

                <strong>

                    ${escapeHtml(

                        safe(

                            customer.name ||

                            customer.fullName ||

                            customer.customerName

                        )

                    )}

                </strong>

            </div>


            <div class="booking-item">

                <small>
                    Mobile
                </small>

                <strong>

                    ${escapeHtml(

                        safe(

                            customer.mobile ||

                            customer.mobileNumber ||

                            customer.phone

                        )

                    )}

                </strong>

            </div>


            <div class="booking-item">

                <small>
                    Event
                </small>

                <strong>

                    ${escapeHtml(

                        safe(

                            finalEvent.eventType ||

                            finalEvent.event

                        )

                    )}

                </strong>

            </div>


            <div class="booking-item">

                <small>
                    Event Date
                </small>

                <strong>

                    ${escapeHtml(

                        safe(

                            finalEvent.eventDate ||

                            finalEvent.date

                        )

                    )}

                </strong>

            </div>


            <div class="booking-item">

                <small>
                    Total
                </small>

                <strong>

                    ${escapeHtml(

                        formatMoney(
                            total
                        )

                    )}

                </strong>

            </div>


            <div class="booking-item">

                <small>
                    Advance
                </small>

                <strong>

                    ${escapeHtml(

                        formatMoney(
                            advance
                        )

                    )}

                </strong>

            </div>


        </div>


        <div class="booking-actions">

            <button

                type="button"

                class="view-button"

            >

                👁 View Details

            </button>

        </div>

    `;


    const viewButton =
        card.querySelector(
            ".view-button"
        );


    viewButton.addEventListener(
        "click",
        function () {

            openBooking(
                booking.id
            );

        }
    );


    return card;

}


/* =========================================
   STATUS BADGE
========================================= */

function statusBadge(
    status
) {

    const lower =
        safe(status)
            .toLowerCase();


    let className =
        "badge-pending";


    if (
        lower === "confirmed"
    ) {

        className =
            "badge-confirmed";

    }


    if (
        lower === "cancelled"
    ) {

        className =
            "badge-cancelled";

    }


    return `

        <span class="badge ${className}">

            ${escapeHtml(
                safe(status)
            )}

        </span>

    `;

}


/* =========================================
   PAYMENT BADGE
========================================= */

function paymentBadge(
    status
) {

    const lower =
        safe(status)
            .toLowerCase();


    const className =

        lower === "paid"

            ? "badge-paid"

            : "badge-unpaid";


    return `

        <span class="badge ${className}">

            Payment:
            ${escapeHtml(
                safe(status)
            )}

        </span>

    `;

}


/* =========================================
   OPEN BOOKING
========================================= */

function openBooking(
    id
) {

    const booking =
        allBookings.find(
            function (item) {

                return (

                    Number(item.id)

                    ===

                    Number(id)

                );

            }
        );


    if (!booking) {

        showStatus(
            "Booking not found.",
            "error"
        );

        return;

    }


    currentBookingId =
        booking.id;


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


    const finalEvent =

        Object.keys(event).length

            ? event

            : (
                confirmation.event ||
                {}
            );


    const finalPackage =

        Object.keys(packageData).length

            ? packageData

            : (
                confirmation.package ||
                {}
            );


    modalBookingNumber.textContent =
        safe(
            booking.booking_number
        );


    bookingDetails.innerHTML = `


        <!-- CUSTOMER -->

        <div class="detail-section">

            <h3>
                👤 Customer Information
            </h3>


            ${detailRow(
                "Name",
                customer.name ||
                customer.fullName ||
                customer.customerName
            )}


            ${detailRow(
                "Mobile",
                customer.mobile ||
                customer.mobileNumber ||
                customer.phone
            )}


            ${detailRow(
                "Email",
                customer.email
            )}


            ${detailRow(
                "Address",
                customer.address
            )}

        </div>



        <!-- EVENT -->

        <div class="detail-section">

            <h3>
                🎉 Event Information
            </h3>


            ${detailRow(
                "Event Type",
                finalEvent.eventType ||
                finalEvent.event
            )}


            ${detailRow(
                "Event Date",
                finalEvent.eventDate ||
                finalEvent.date
            )}


            ${detailRow(
                "Event Time",
                finalEvent.eventTime ||
                finalEvent.time
            )}


            ${detailRow(
                "District",
                finalEvent.district
            )}


            ${detailRow(
                "Tehsil",
                finalEvent.tehsil
            )}


            ${detailRow(
                "Village / City",
                finalEvent.village ||
                finalEvent.city ||
                finalEvent.villageCity
            )}


            ${detailRow(
                "Event Address",
                finalEvent.eventAddress ||
                finalEvent.address
            )}

        </div>



        <!-- PACKAGE -->

        <div class="detail-section">

            <h3>
                🎧 DJ Package
            </h3>


            ${detailRow(
                "Package",
                finalPackage.packageName
            )}


            ${detailRow(
                "Package Amount",
                formatMoney(
                    finalPackage.packagePrice
                )
            )}


            ${detailRow(
                "Extra Equipment",
                formatExtras(
                    finalPackage.extras
                )
            )}


            ${detailRow(
                "Extra Amount",
                formatMoney(
                    finalPackage.extraAmount
                )
            )}


            ${detailRow(
                "Total Amount",
                formatMoney(
                    finalPackage.totalAmount
                )
            )}


            ${detailRow(
                "Minimum Advance",
                formatMoney(
                    finalPackage.minimumAdvance
                )
            )}


            ${detailRow(
                "Advance",
                formatMoney(
                    finalPackage.advanceAmount
                )
            )}


            ${detailRow(
                "Remaining",
                formatMoney(
                    finalPackage.remainingAmount
                )
            )}

        </div>



        <!-- PAYMENT -->

        <div class="detail-section">

            <h3>
                💳 Payment Information
            </h3>


            ${detailRow(
                "Payment Status",
                booking.payment_status
            )}


            ${detailRow(
                "Payment Method",
                payment.paymentMethod ||
                confirmation.paymentMethod
            )}


            ${detailRow(
                "Transaction ID",
                payment.transactionId ||
                confirmation.transactionId
            )}


            ${detailRow(
                "Payment Amount",
                formatMoney(
                    payment.amount ||
                    confirmation.paymentAmount
                )
            )}


            ${detailRow(
                "Currency",
                payment.currency
            )}


            ${detailRow(
                "Payment Mode",
                payment.paymentMode
            )}


            ${detailRow(
                "Verification",
                payment.verificationStatus ||
                confirmation.verificationStatus
            )}


            ${detailRow(
                "Paid At",
                formatDate(
                    payment.paidAt
                )
            )}

        </div>



        <!-- BOOKING -->

        <div class="detail-section">

            <h3>
                📌 Booking Information
            </h3>


            ${detailRow(
                "Booking Number",
                booking.booking_number
            )}


            ${detailRow(
                "Booking Status",
                booking.booking_status
            )}


            ${detailRow(
                "Created At",
                formatDate(
                    booking.created_at
                )
            )}


            ${detailRow(
                "Verified At",
                formatDate(
                    booking.verified_at
                )
            )}

        </div>

    `;


    /* =================================
       BUTTONS
    ================================= */

    if (
        modalConfirmButton
    ) {

        modalConfirmButton.style.display =

            booking.booking_status ===
            "Cancelled"

                ? "none"

                : "block";

    }


    if (
        modalCancelButton
    ) {

        modalCancelButton.style.display =

            booking.booking_status ===
            "Cancelled"

                ? "none"

                : "block";

    }


    bookingModal.classList.add(
        "show"
    );

}


/* =========================================
   DETAIL ROW
========================================= */

function detailRow(
    label,
    value
) {

    return `

        <div class="detail-row">

            <span>

                ${escapeHtml(
                    label
                )}

            </span>


            <span>

                ${escapeHtml(
                    safe(value)
                )}

            </span>

        </div>

    `;

}


/* =========================================
   FORMAT EXTRAS
========================================= */

function formatExtras(
    extras
) {

    if (
        !Array.isArray(extras) ||
        extras.length === 0
    ) {

        return "None";

    }


    return extras

        .map(
            function (extra) {

                return (

                    safe(
                        extra.name
                    )

                    +

                    " ("

                    +

                    formatMoney(
                        extra.price
                    )

                    +

                    ")"

                );

            }
        )

        .join(", ");

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return safe(value);

    }


    return date.toLocaleString(
        "en-IN"
    );

}


/* =========================================
   UPDATE BOOKING STATUS
========================================= */

async function updateBookingStatus(
    id,
    status
) {

    try {

        /*
           आपका वर्तमान server.js
           अभी status update API नहीं देता।

           इसलिए पहले check करते हैं।
        */

        const response =
            await fetch(

                BACKEND_URL +
                `/api/admin/bookings/${id}/status`,

                {

                    method: "PATCH",

                    headers: {

                        ...authHeaders(),

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            status:
                                status

                        })

                }

            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logout();

            return;

        }


        const text =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    text
                );

        } catch (error) {

            throw new Error(
                "Status update API is not available in server.js."
            );

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(

                data.message ||

                "Status update failed."

            );

        }


        showStatus(
            "Booking status updated successfully.",
            "success"
        );


        closeModal();


        await loadBookings();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        showStatus(

            error.message ||

            "Booking status update failed.",

            "error"

        );

    }

}


/* =========================================
   CONFIRM BUTTON
========================================= */

if (
    modalConfirmButton
) {

    modalConfirmButton.addEventListener(
        "click",
        function () {

            if (
                !currentBookingId
            ) {

                return;

            }


            updateBookingStatus(

                currentBookingId,

                "Confirmed"

            );

        }
    );

}


/* =========================================
   CANCEL BUTTON
========================================= */

if (
    modalCancelButton
) {

    modalCancelButton.addEventListener(
        "click",
        function () {

            if (
                !currentBookingId
            ) {

                return;

            }


            const yes =
                confirm(
                    "क्या आप इस booking को Cancel करना चाहते हैं?"
                );


            if (!yes) {

                return;

            }


            updateBookingStatus(

                currentBookingId,

                "Cancelled"

            );

        }
    );

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal() {

    if (
        bookingModal
    ) {

        bookingModal.classList.remove(
            "show"
        );

    }


    currentBookingId =
        null;

}


if (
    closeModalButton
) {

    closeModalButton.addEventListener(
        "click",
        closeModal
    );

}


if (
    bookingModal
) {

    bookingModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                bookingModal
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================
   SEARCH
========================================= */

if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


/* =========================================
   STATUS FILTER
========================================= */

if (
    statusFilter
) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================
   PAYMENT FILTER
========================================= */

if (
    paymentFilter
) {

    paymentFilter.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================
   REFRESH
========================================= */

if (
    refreshButton
) {

    refreshButton.addEventListener(
        "click",
        loadBookings
    );

}


/* =========================================
   LOGOUT
========================================= */

if (
    logoutButton
) {

    logoutButton.addEventListener(
        "click",
        function () {

            logout();

        }
    );

}


function logout() {

    /*
       Backend logout optional है।
       Local token पहले remove करेंगे।
    */

    sessionStorage.removeItem(
        "djAdminToken"
    );


    window.location.href =
        "admin-login.html";

}


/* =========================================
   STATUS MESSAGE
========================================= */

function showStatus(
    message,
    type
) {

    if (
        !adminStatus
    ) {

        return;

    }


    adminStatus.textContent =
        message;


    adminStatus.className =
        "admin-status show " +
        type;


    setTimeout(
        function () {

            adminStatus.className =
                "admin-status";

        },
        4000
    );

}


/* =========================================
   AUTO REFRESH
========================================= */

setInterval(
    function () {

        /*
           केवल तभी refresh करें
           जब token मौजूद हो।
        */

        if (
            sessionStorage.getItem(
                "djAdminToken"
            )
        ) {

            loadBookings();

        }

    },
    30000
);


/* =========================================
   INITIAL LOAD
========================================= */

loadBookings();
