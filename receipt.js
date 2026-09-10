/* =========================================
   DJ BOOKING PRO
   RECEIPT
========================================= */


/* =========================================
   GET RECEIPT DATA
========================================= */

const receiptRaw =
    localStorage.getItem(
        "djReceiptData"
    );


if (!receiptRaw) {

    alert(
        "Receipt data not found."
    );

    window.location.href =
        "index.html";

}


/* =========================================
   PARSE
========================================= */

let receipt;


try {

    receipt =
        JSON.parse(
            receiptRaw
        );

} catch (error) {

    alert(
        "Receipt data is invalid."
    );

    window.location.href =
        "index.html";

}


/* =========================================
   SAFE VALUE
========================================= */

function safeValue(value) {

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
   MONEY
========================================= */

function formatMoney(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style:
                "currency",

            currency:
                "INR",

            maximumFractionDigits:
                0
        }
    ).format(
        Number(amount) || 0
    );

}


/* =========================================
   DATA
========================================= */

const customer =
    receipt.customer || {};

const event =
    receipt.event || {};

const packageData =
    receipt.package || {};

const payment =
    receipt.payment || {};


/* =========================================
   BOOKING
========================================= */

document.getElementById(
    "bookingNumber"
).textContent =
    safeValue(
        receipt.bookingNumber
    );


/* =========================================
   CUSTOMER
========================================= */

document.getElementById(
    "customerName"
).textContent =
    safeValue(
        customer.name
    );


document.getElementById(
    "customerMobile"
).textContent =
    safeValue(
        customer.mobile ||
        customer.mobileNumber
    );


document.getElementById(
    "customerAddress"
).textContent =
    safeValue(
        customer.address
    );


/* =========================================
   EVENT
========================================= */

document.getElementById(
    "eventType"
).textContent =
    safeValue(
        event.eventType
    );


document.getElementById(
    "eventDate"
).textContent =
    safeValue(
        event.eventDate
    );


document.getElementById(
    "eventTime"
).textContent =
    safeValue(
        event.eventTime
    );


document.getElementById(
    "district"
).textContent =
    safeValue(
        event.district
    );


document.getElementById(
    "tehsil"
).textContent =
    safeValue(
        event.tehsil
    );


document.getElementById(
    "village"
).textContent =
    safeValue(
        event.village
    );


document.getElementById(
    "eventLocation"
).textContent =
    safeValue(
        event.eventLocation ||
        event.address ||
        event.location
    );


/* =========================================
   PACKAGE
========================================= */

document.getElementById(
    "packageName"
).textContent =
    safeValue(
        packageData.packageName
    );


document.getElementById(
    "packagePrice"
).textContent =
    formatMoney(
        packageData.packagePrice
    );


/* =========================================
   EXTRAS
========================================= */

const extraList =
    document.getElementById(
        "extraList"
    );


extraList.innerHTML =
    "";


if (
    Array.isArray(
        packageData.extras
    ) &&
    packageData.extras.length > 0
) {

    packageData.extras.forEach(
        function (extra) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "extra-item";


            const name =
                document.createElement(
                    "span"
                );


            name.textContent =
                safeValue(
                    extra.name
                );


            const price =
                document.createElement(
                    "strong"
                );


            price.textContent =
                "+" +
                formatMoney(
                    extra.price
                );


            row.appendChild(
                name
            );


            row.appendChild(
                price
            );


            extraList.appendChild(
                row
            );

        }
    );

} else {

    const text =
        document.createElement(
            "p"
        );


    text.textContent =
        "No extra equipment selected.";


    extraList.appendChild(
        text
    );

}


/* =========================================
   AMOUNT
========================================= */

document.getElementById(
    "totalAmount"
).textContent =
    formatMoney(
        receipt.totalAmount
    );


document.getElementById(
    "advanceAmount"
).textContent =
    formatMoney(
        receipt.advanceAmount
    );


document.getElementById(
    "remainingAmount"
).textContent =
    formatMoney(
        receipt.remainingAmount
    );


/* =========================================
   PAYMENT
========================================= */

document.getElementById(
    "paymentMethod"
).textContent =
    safeValue(
        payment.paymentMethod
    );


document.getElementById(
    "transactionId"
).textContent =
    safeValue(
        payment.transactionId
    );


document.getElementById(
    "paymentStatus"
).textContent =
    safeValue(
        payment.paymentStatus
    );


document.getElementById(
    "verificationStatus"
).textContent =
    safeValue(
        payment.verificationStatus
    );


/* =========================================
   PRINT
========================================= */

document.getElementById(
    "printButton"
).addEventListener(
    "click",
    function () {

        window.print();

    }
);


/* =========================================
   NEW BOOKING
========================================= */

document.getElementById(
    "newBookingButton"
).addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "djCustomerData"
        );

        localStorage.removeItem(
            "djEventData"
        );

        localStorage.removeItem(
            "djPackageData"
        );

        localStorage.removeItem(
            "djBookingConfirmation"
        );

        localStorage.removeItem(
            "djPaymentData"
        );

        localStorage.removeItem(
            "djReceiptData"
        );


        window.location.href =
            "index.html";

    }
);
