/* =========================================
   DJ BOOKING PRO
   INDEX PAGE JAVASCRIPT
========================================= */


/* =========================================
   LIVE DATE & TIME
========================================= */

function updateLiveDateTime() {

    const liveDate =
        document.getElementById("liveDate");

    const liveTime =
        document.getElementById("liveTime");


    const now = new Date();


    /* =================================
       LIVE DATE
    ================================= */

    if (liveDate) {

        const dateOptions = {
            day: "2-digit",
            month: "short",
            year: "numeric"
        };

        liveDate.textContent =
            now.toLocaleDateString(
                "en-IN",
                dateOptions
            );

    }


    /* =================================
       LIVE TIME
    ================================= */

    if (liveTime) {

        const timeOptions = {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        };

        liveTime.textContent =
            now.toLocaleTimeString(
                "en-IN",
                timeOptions
            );

    }

}


/* =================================
   START LIVE DATE & TIME
================================= */

updateLiveDateTime();


/* =================================
   UPDATE EVERY SECOND
================================= */

setInterval(
    updateLiveDateTime,
    1000
);



/* =========================================
   FOOTER YEAR
========================================= */

function updateFooterYear() {

    const footerYear =
        document.getElementById(
            "footerYear"
        );


    if (footerYear) {

        footerYear.textContent =
            new Date().getFullYear();

    }

}


updateFooterYear();



/* =========================================
   LOAD BOOKING STATISTICS
========================================= */

async function loadBookingStatistics() {

    const eventsCount =
        document.getElementById(
            "eventsCount"
        );

    const clientsCount =
        document.getElementById(
            "clientsCount"
        );

    const upcomingCount =
        document.getElementById(
            "upcomingCount"
        );


    /* =================================
       DEFAULT VALUE = 150+
    ================================= */

    if (eventsCount) {

        eventsCount.textContent =
            "150+";

    }


    if (clientsCount) {

        clientsCount.textContent =
            "150+";

    }


    if (upcomingCount) {

        upcomingCount.textContent =
            "150+";

    }


    try {

        const response =
            await fetch(
                "http://localhost:3000/api/bookings"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load bookings"
            );

        }


        const data =
            await response.json();


        let bookings = [];


        /* =================================
           GET BOOKINGS ARRAY
        ================================= */

        if (
            Array.isArray(data)
        ) {

            bookings = data;

        }
        else if (
            Array.isArray(
                data.bookings
            )
        ) {

            bookings =
                data.bookings;

        }



        /* =================================
           EVENTS DONE
        ================================= */

        const completedBookings =
            bookings.filter(
                function (booking) {

                    const status =
                        String(
                            booking.booking_status ||
                            booking.bookingStatus ||
                            ""
                        ).toLowerCase();


                    return (
                        status === "confirmed" ||
                        status === "completed"
                    );

                }
            );


        if (eventsCount) {

            eventsCount.textContent =
                Math.max(
                    150,
                    completedBookings.length
                ) + "+";

        }



        /* =================================
           HAPPY CLIENTS
        ================================= */

        const uniqueCustomers =
            new Set();


        bookings.forEach(
            function (booking) {

                let customer =
                    booking.customer_data ||
                    booking.customerData;


                /* =========================
                   JSON STRING → OBJECT
                ========================= */

                if (
                    typeof customer ===
                    "string"
                ) {

                    try {

                        customer =
                            JSON.parse(
                                customer
                            );

                    }
                    catch (error) {

                        customer =
                            null;

                    }

                }


                /* =========================
                   CUSTOMER IDENTIFIER
                ========================= */

                if (
                    customer &&
                    (
                        customer.mobile ||
                        customer.phone ||
                        customer.email
                    )
                ) {

                    const customerId =
                        customer.mobile ||
                        customer.phone ||
                        customer.email;


                    uniqueCustomers.add(
                        customerId
                    );

                }

            }
        );


        if (clientsCount) {

            clientsCount.textContent =
                Math.max(
                    150,
                    uniqueCustomers.size
                ) + "+";

        }



        /* =================================
           UPCOMING EVENTS
        ================================= */

        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        let upcomingEvents = 0;


        bookings.forEach(
            function (booking) {

                let eventData =
                    booking.event_data ||
                    booking.eventData;


                /* =========================
                   JSON STRING → OBJECT
                ========================= */

                if (
                    typeof eventData ===
                    "string"
                ) {

                    try {

                        eventData =
                            JSON.parse(
                                eventData
                            );

                    }
                    catch (error) {

                        eventData =
                            null;

                    }

                }


                if (
                    !eventData ||
                    !eventData.eventDate
                ) {

                    return;

                }


                const eventDate =
                    new Date(
                        eventData.eventDate
                    );


                eventDate.setHours(
                    0,
                    0,
                    0,
                    0
                );


                const status =
                    String(
                        booking.booking_status ||
                        booking.bookingStatus ||
                        ""
                    ).toLowerCase();


                if (
                    eventDate >= today &&
                    status !== "cancelled"
                ) {

                    upcomingEvents++;

                }

            }
        );


        if (upcomingCount) {

            upcomingCount.textContent =
                Math.max(
                    150,
                    upcomingEvents
                ) + "+";

        }

    }
    catch (error) {

        console.error(
            "Booking statistics error:",
            error
        );


        /* =================================
           BACKEND ERROR
           KEEP 150+
        ================================= */

        if (eventsCount) {

            eventsCount.textContent =
                "150+";

        }


        if (clientsCount) {

            clientsCount.textContent =
                "150+";

        }


        if (upcomingCount) {

            upcomingCount.textContent =
                "150+";

        }

    }

}


/* =========================================
   LOAD STATISTICS
========================================= */

loadBookingStatistics();



/* =========================================
   OPTION CARD NAVIGATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const optionCards =
            document.querySelectorAll(
                ".option-card"
            );


        optionCards.forEach(
            function (card) {

                const link =
                    card.querySelector(
                        "a"
                    );


                if (!link) {

                    return;

                }


                card.addEventListener(
                    "click",
                    function (event) {

                        /*
                           अगर सीधे button/link
                           पर click है तो browser
                           की normal navigation चलेगी।
                        */

                        if (
                            event.target.closest(
                                "a"
                            )
                        ) {

                            return;

                        }


                        window.location.href =
                            link.href;

                    }
                );

            }
        );

    }
);



/* =========================================
   CONSOLE MESSAGE
========================================= */

console.log(
    "========================================="
);

console.log(
    "🎧 DJ BOOKING PRO INDEX PAGE"
);

console.log(
    "✅ Live Date & Time Enabled"
);

console.log(
    "✅ Events Done = 150+ Minimum"
);

console.log(
    "✅ Happy Clients = 150+ Minimum"
);

console.log(
    "✅ Upcoming Events = 150+ Minimum"
);

console.log(
    "✅ Footer Year Enabled"
);

console.log(
    "✅ Card Navigation Enabled"
);

console.log(
    "========================================="
);