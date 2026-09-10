/* =========================================
   DJ BOOKING PRO
   STEP 2 - EVENT DETAILS
========================================= */


/* =========================================
   CUSTOMER CHECK
========================================= */

const customerData =
    localStorage.getItem("djCustomerData");


if (!customerData) {

    window.location.href =
        "index.html";

}



/* =========================================
   ELEMENTS
========================================= */

const eventForm =
    document.getElementById("eventForm");


const eventType =
    document.getElementById("eventType");


const otherEventGroup =
    document.getElementById("otherEventGroup");


const otherEvent =
    document.getElementById("otherEvent");


const eventDate =
    document.getElementById("eventDate");


const eventTime =
    document.getElementById("eventTime");


const eventLocation =
    document.getElementById("eventLocation");


const district =
    document.getElementById("district");


const tehsil =
    document.getElementById("tehsil");


const village =
    document.getElementById("village");


const venueAddress =
    document.getElementById("venueAddress");


const eventNote =
    document.getElementById("eventNote");


const backBtn =
    document.getElementById("backBtn");



/* =========================================
   TEHSIL DATA
========================================= */

const tehsilData = {

    Mauganj: [

        "Mauganj",
        "Hanumana",
        "Naigarhi"

    ],


    Rewa: [

        "Huzur",
        "Jawa",
        "Teonthar",
        "Raipur Karchuliyan",
        "Gurh",
        "Sirmour",
        "Semaria",
        "Mangawan"

    ],


    Bhopal: [

        "Huzur",
        "Berasia",
        "Kolar"

    ]

};



/* =========================================
   VILLAGE DATA
========================================= */

/*
   IMPORTANT:

   Village names should be loaded from
   the separate location-data.js file.

   This keeps event.js small and fast.
*/


const villageData =
    window.villageData || {};



/* =========================================
   MINIMUM DATE
========================================= */

const today =
    new Date();


const year =
    today.getFullYear();


const month =
    String(
        today.getMonth() + 1
    ).padStart(2, "0");


const day =
    String(
        today.getDate()
    ).padStart(2, "0");


eventDate.min =
    `${year}-${month}-${day}`;



/* =========================================
   EVENT TYPE
========================================= */

eventType.addEventListener(
    "change",
    function () {

        if (
            eventType.value ===
            "Other"
        ) {

            otherEventGroup.classList
                .remove("hidden");

            otherEvent.required =
                true;

        }

        else {

            otherEventGroup.classList
                .add("hidden");

            otherEvent.required =
                false;

            otherEvent.value =
                "";

        }

    }
);



/* =========================================
   DISTRICT → TEHSIL
========================================= */

district.addEventListener(
    "change",
    function () {

        const selectedDistrict =
            district.value;


        /* RESET TEHSIL */

        tehsil.innerHTML =
            `
            <option value="">
                Select Tehsil
            </option>
            `;


        /* RESET VILLAGE */

        village.innerHTML =
            `
            <option value="">
                First Select Tehsil
            </option>
            `;


        village.disabled =
            true;


        if (
            !selectedDistrict ||
            !tehsilData[selectedDistrict]
        ) {

            tehsil.disabled =
                true;

            return;

        }


        tehsil.disabled =
            false;


        tehsilData[selectedDistrict]
            .forEach(
                function (name) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        name;


                    option.textContent =
                        name;


                    tehsil.appendChild(
                        option
                    );

                }
            );

    }
);



/* =========================================
   TEHSIL → VILLAGE
========================================= */

tehsil.addEventListener(
    "change",
    function () {

        const selectedDistrict =
            district.value;


        const selectedTehsil =
            tehsil.value;


        village.innerHTML =
            `
            <option value="">
                Select Village / Gram
            </option>
            `;


        if (
            !selectedDistrict ||
            !selectedTehsil
        ) {

            village.disabled =
                true;

            return;

        }


        const villages =
            villageData?.[
                selectedDistrict
            ]?.[
                selectedTehsil
            ] || [];


        /*
           अगर village data उपलब्ध है
        */

        if (
            villages.length > 0
        ) {

            village.disabled =
                false;


            villages.forEach(
                function (item) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    /*
                       Support:

                       "Village Name"

                       OR

                       {
                           name: "..."
                       }
                    */

                    if (
                        typeof item ===
                        "string"
                    ) {

                        option.value =
                            item;

                        option.textContent =
                            item;

                    }

                    else {

                        option.value =
                            item.name;

                        option.textContent =
                            item.name;

                    }


                    village.appendChild(
                        option
                    );

                }
            );

        }

        else {

            village.disabled =
                false;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "Other";


            option.textContent =
                "Other / Enter Village Manually";


            village.appendChild(
                option
            );

        }

    }
);



/* =========================================
   CLEAR ERRORS
========================================= */

function clearErrors() {

    document
        .querySelectorAll(".error")
        .forEach(
            function (element) {

                element.textContent =
                    "";

            }
        );

}



/* =========================================
   SHOW ERROR
========================================= */

function showError(
    id,
    message
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            message;

    }

}



/* =========================================
   FORM SUBMIT
========================================= */

eventForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        clearErrors();


        let valid =
            true;



        /* =================================
           EVENT TYPE
        ================================= */

        if (!eventType.value) {

            showError(
                "eventTypeError",
                "Please select event type."
            );

            valid =
                false;

        }



        /* =================================
           OTHER EVENT
        ================================= */

        if (
            eventType.value ===
            "Other" &&
            otherEvent.value
                .trim()
                .length < 2
        ) {

            showError(
                "otherEventError",
                "Please enter event name."
            );

            valid =
                false;

        }



        /* =================================
           DATE
        ================================= */

        if (!eventDate.value) {

            showError(
                "eventDateError",
                "Please select event date."
            );

            valid =
                false;

        }



        /* =================================
           TIME
        ================================= */

        if (!eventTime.value) {

            showError(
                "eventTimeError",
                "Please select event time."
            );

            valid =
                false;

        }



        /* =================================
           LOCATION
        ================================= */

        if (
            eventLocation.value
                .trim()
                .length < 2
        ) {

            showError(
                "eventLocationError",
                "Please enter event location."
            );

            valid =
                false;

        }



        /* =================================
           DISTRICT
        ================================= */

        if (!district.value) {

            showError(
                "districtError",
                "Please select district."
            );

            valid =
                false;

        }



        /* =================================
           TEHSIL
        ================================= */

        if (!tehsil.value) {

            showError(
                "tehsilError",
                "Please select tehsil."
            );

            valid =
                false;

        }



        /* =================================
           VILLAGE
        ================================= */

        if (!village.value) {

            showError(
                "villageError",
                "Please select village."
            );

            valid =
                false;

        }



        /* =================================
           VENUE ADDRESS
        ================================= */

        if (
            venueAddress.value
                .trim()
                .length < 5
        ) {

            showError(
                "venueAddressError",
                "Please enter complete venue address."
            );

            valid =
                false;

        }



        /* =================================
           STOP
        ================================= */

        if (!valid) {

            return;

        }



        /* =================================
           SAVE EVENT DATA
        ================================= */

        const eventData = {

            eventType:
                eventType.value,

            otherEvent:
                otherEvent.value.trim(),

            eventDate:
                eventDate.value,

            eventTime:
                eventTime.value,

            eventLocation:
                eventLocation.value.trim(),

            district:
                district.value,

            tehsil:
                tehsil.value,

            village:
                village.value,

            venueAddress:
                venueAddress.value.trim(),

            eventNote:
                eventNote.value.trim(),

            createdAt:
                new Date().toISOString()

        };



        localStorage.setItem(
            "djEventData",
            JSON.stringify(
                eventData
            )
        );



        /* =================================
           NEXT STEP
        ================================= */

        window.location.href =
            "package.html";

    }
);



/* =========================================
   BACK BUTTON
========================================= */

backBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "index.html";

    }
);