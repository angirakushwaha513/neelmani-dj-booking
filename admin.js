/* =========================================
   DJ BOOKING PRO
   ADMIN DASHBOARD
   FIXED BOOKING API
========================================= */


/* =========================================
   BACKEND URL
========================================= */

const BACKEND_URL =
    "https://neelmani-dj-booking.onrender.com";


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
