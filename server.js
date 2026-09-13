/* =========================================
   DJ BOOKING PRO
   COMPLETE BACKEND
   SQLITE DATABASE
   SERVER SIDE CUSTOMER OTP
   GOOGLE SIGN-IN
   DEMO PAYMENT
   ADMIN DASHBOARD
   CUSTOMER BOOKING STATUS
========================================= */

const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();


/* =========================================
   EXPRESS APP
========================================= */

const app = express();

const PORT =
    process.env.PORT || 3000;


/* =========================================
   ADMIN LOGIN
   GOOGLE + USERNAME/PASSWORD
========================================= */

const ADMIN_USERNAME =
    process.env.ADMIN_USERNAME || "admin";

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD || "admin123";

const ADMIN_GOOGLE_EMAIL =
    process.env.ADMIN_GOOGLE_EMAIL ||
    "angirakushwaha513@gmail.com";

const adminTokens =
    new Set();


/* =========================================
   GOOGLE SIGN-IN
========================================= */

const GOOGLE_CLIENT_ID =
    process.env.GOOGLE_CLIENT_ID ||
    "200354296304-egs3jslf6h5jpjcr4if4p8r2l05c3lqk.apps.googleusercontent.com";

const googleClient =
    new OAuth2Client(GOOGLE_CLIENT_ID);

const googleCustomerSessions =
    new Map();

const GOOGLE_SESSION_EXPIRY_MS =
    60 * 60 * 1000;


/* =========================================
   MIDDLEWARE
========================================= */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(
    express.json({
        limit: "1mb"
    })
);


/* =========================================
   DATABASE
========================================= */

const db =
    new Database("dj_booking.db");

db.pragma(
    "journal_mode = WAL"
);

console.log(
    "SQLite database connected ✅"
);


/* =========================================
   CREATE BOOKINGS TABLE
========================================= */

db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        booking_number TEXT UNIQUE NOT NULL,

        customer_data TEXT,

        event_data TEXT,

        package_data TEXT,

        confirmation_data TEXT,

        payment_data TEXT,

        booking_status TEXT DEFAULT 'Pending',

        payment_status TEXT DEFAULT 'Pending',

        created_at TEXT,

        verified_at TEXT
    )
`);


/* =========================================
   OLD DATABASE COMPATIBILITY
========================================= */

try {

    db.exec(`
        ALTER TABLE bookings
        ADD COLUMN event_data TEXT
    `);

} catch (error) {
}


/* =========================================
   VERIFIED AT COMPATIBILITY
========================================= */

try {

    db.exec(`
        ALTER TABLE bookings
        ADD COLUMN verified_at TEXT
    `);

} catch (error) {
}


/* =========================================
   HOME TEST
========================================= */

app.get(
    "/",
    (req, res) => {

        return res.json({

            success: true,

            message:
                "DJ Booking Pro Backend is running successfully 🎧",

            database:
                "SQLite Connected",

            admin:
                "Admin Google Login Ready",

            otp:
                "Server Side OTP Enabled",

            google:
                "Google Sign-In Enabled",

            bookingStatus:
                "Customer Booking Status Enabled"

        });

    }
);


/* =========================================
   ADMIN USERNAME/PASSWORD LOGIN
========================================= */

app.post(
    "/api/admin/login",
    (req, res) => {

        try {

            const {
                username,
                password
            } = req.body;

            if (!username || !password) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username and password are required."

                });

            }

            if (
                username !== ADMIN_USERNAME ||
                password !== ADMIN_PASSWORD
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username or password."

                });

            }

            const token =
                crypto
                    .randomBytes(32)
                    .toString("hex");

            adminTokens.add(token);

            console.log(
                "Admin Username/Password login successful ✅"
            );

            return res.json({

                success: true,

                message:
                    "Admin login successful.",

                token,

                user: {

                    id:
                        "admin",

                    name:
                        "Administrator",

                    username:
                        ADMIN_USERNAME,

                    loginType:
                        "password"

                }

            });

        } catch (error) {

            console.error(
                "Admin Login Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Admin login failed."

            });

        }

    }
);


/* =========================================
   ADMIN AUTH
========================================= */

function adminAuth(
    req,
    res,
    next
) {

    const authHeader =
        req.headers.authorization;


    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {

        return res.status(401).json({

            success: false,

            message:
                "Admin login required."

        });

    }


    const token =
        authHeader.substring(7);


    if (
        !adminTokens.has(token)
    ) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired admin session."

        });

    }


    next();

}


/* =========================================
   ADMIN LOGOUT
========================================= */

app.post(
    "/api/admin/logout",
    adminAuth,
    (req, res) => {

        const token =
            req.headers.authorization
                .substring(7);


        adminTokens.delete(token);


        return res.json({

            success: true,

            message:
                "Admin logged out successfully."

        });

    }
);


/* =========================================
   GOOGLE TOKEN VERIFY HELPER
========================================= */

async function verifyGoogleCredential(
    credential
) {

    const cleanCredential =
        String(
            credential || ""
        ).trim();


    if (!cleanCredential) {

        return null;

    }


    const ticket =
        await googleClient.verifyIdToken({

            idToken:
                cleanCredential,

            audience:
                GOOGLE_CLIENT_ID

        });


    const payload =
        ticket.getPayload();


    if (
        !payload ||
        !payload.sub
    ) {

        return null;

    }


    return payload;

}


/* =========================================
   ADMIN GOOGLE LOGIN
========================================= */

app.post(
    "/api/admin/google-login",
    async (req, res) => {

        try {

            const credential =
                String(
                    req.body.credential || ""
                ).trim();


            if (!credential) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Google credential is required."

                });

            }


            const payload =
                await verifyGoogleCredential(
                    credential
                );


            if (!payload) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid Google account token."

                });

            }


            const email =
                String(
                    payload.email || ""
                )
                .trim()
                .toLowerCase();


            const authorizedEmail =
                String(
                    ADMIN_GOOGLE_EMAIL
                )
                .trim()
                .toLowerCase();


            if (!email) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Google account email was not received."

                });

            }


            if (
                payload.email_verified !== true
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Google email is not verified."

                });

            }


            if (
                email !==
                authorizedEmail
            ) {

                console.log(
                    "Unauthorized Admin Google Login Attempt:",
                    email
                );


                return res.status(403).json({

                    success: false,

                    message:
                        "This Google account is not authorized as Admin."

                });

            }


            const token =
                crypto
                    .randomBytes(32)
                    .toString("hex");


            adminTokens.add(
                token
            );


            console.log(
                "Admin Google login successful ✅:",
                email
            );


            return res.json({

                success: true,

                message:
                    "Admin Google login successful.",

                token,

                user: {

                    id:
                        payload.sub,

                    name:
                        payload.name || "",

                    email:
                        payload.email || "",

                    picture:
                        payload.picture || ""

                }

            });


        } catch (error) {

            console.error(
                "Admin Google Login Error:",
                error.message
            );


            return res.status(401).json({

                success: false,

                message:
                    "Admin Google Login verification failed."

            });

        }

    }
);


/* =========================================
   CREATE GOOGLE CUSTOMER SESSION
========================================= */

function createGoogleCustomerSession(
    payload
) {

    const sessionToken =
        crypto
            .randomBytes(32)
            .toString("hex");


    const createdAt =
        Date.now();


    const session = {

        googleId:
            payload.sub,

        name:
            payload.name || "",

        email:
            payload.email || "",

        picture:
            payload.picture || "",

        createdAt,

        expiresAt:
            createdAt +
            GOOGLE_SESSION_EXPIRY_MS

    };


    googleCustomerSessions.set(
        sessionToken,
        session
    );


    return {
        sessionToken,
        session
    };

}


/* =========================================
   GOOGLE SIGN-IN VERIFY
========================================= */

app.post(
    "/api/auth/google",
    async (req, res) => {

        try {

            const credential =
                String(
                    req.body.credential || ""
                ).trim();


            if (!credential) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Google credential is required."

                });

            }


            const payload =
                await verifyGoogleCredential(
                    credential
                );


            if (
                !payload
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid Google account token."

                });

            }


            const {
                sessionToken,
                session
            } =
                createGoogleCustomerSession(
                    payload
                );


            console.log(
                "Google customer signed in ✅:",
                payload.email || payload.sub
            );


            return res.json({

                success: true,

                message:
                    "Google Sign-In successful.",

                token:
                    sessionToken,

                user: {

                    id:
                        payload.sub,

                    name:
                        payload.name || "",

                    email:
                        payload.email || "",

                    picture:
                        payload.picture || ""

                },

                expiresIn:
                    GOOGLE_SESSION_EXPIRY_MS /
                    1000

            });


        } catch (error) {

            console.error(
                "Google Sign-In Error:",
                error.message
            );


            return res.status(401).json({

                success: false,

                message:
                    "Google Sign-In verification failed."

            });

        }

    }
);


/* =========================================
   GOOGLE CUSTOMER AUTH
   SESSION + CREDENTIAL FALLBACK
========================================= */

async function googleCustomerAuth(
    req,
    res,
    next
) {

    try {

        const googleToken =
            String(
                req.headers[
                    "x-customer-google-token"
                ] || ""
            ).trim();


        /* -----------------------------------------
           OPTION 1:
           EXISTING GOOGLE SESSION
        ----------------------------------------- */

        if (googleToken) {

            const googleSession =
                googleCustomerSessions.get(
                    googleToken
                );


            if (googleSession) {

                if (
                    Date.now() <=
                    googleSession.expiresAt
                ) {

                    req.googleCustomer =
                        googleSession;

                    req.googleSessionToken =
                        googleToken;

                    return next();

                }


                googleCustomerSessions.delete(
                    googleToken
                );

            }

        }


        /* -----------------------------------------
           OPTION 2:
           GOOGLE CREDENTIAL FALLBACK

           Useful after Node.js restart.
        ----------------------------------------- */

        const credential =
            String(
                req.headers[
                    "x-customer-google-credential"
                ] || ""
            ).trim();


        if (credential) {

            const payload =
                await verifyGoogleCredential(
                    credential
                );


            if (!payload) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Google credential is invalid or expired."

                });

            }


            const {
                sessionToken,
                session
            } =
                createGoogleCustomerSession(
                    payload
                );


            req.googleCustomer =
                session;

            req.googleSessionToken =
                sessionToken;


            return next();

        }


        return res.status(401).json({

            success: false,

            message:
                "Google Sign-In required."

        });


    } catch (error) {

        console.error(
            "Google Customer Auth Error:",
            error.message
        );


        return res.status(401).json({

            success: false,

            message:
                "Google authentication failed."

        });

    }

}


/* =========================================
   GOOGLE CUSTOMER SESSION CHECK
========================================= */

app.get(
    "/api/customer/google-session",
    googleCustomerAuth,
    (req, res) => {

        return res.json({

            success: true,

            authenticated: true,

            user: {

                id:
                    req.googleCustomer.googleId,

                name:
                    req.googleCustomer.name,

                email:
                    req.googleCustomer.email,

                picture:
                    req.googleCustomer.picture

            },

            message:
                "Google customer session is valid."

        });

    }
);


/* =========================================
   GOOGLE CUSTOMER LOGOUT
========================================= */

app.post(
    "/api/customer/google-logout",
    googleCustomerAuth,
    (req, res) => {

        if (
            req.googleSessionToken
        ) {

            googleCustomerSessions.delete(
                req.googleSessionToken
            );

        }


        return res.json({

            success: true,

            message:
                "Google customer signed out successfully."

        });

    }
);


/* =========================================
   BOOKING NUMBER
========================================= */

function generateBookingNumber() {

    const year =
        new Date().getFullYear();


    const lastBooking =
        db.prepare(`
            SELECT id
            FROM bookings
            ORDER BY id DESC
            LIMIT 1
        `).get();


    const nextId =
        lastBooking
            ? lastBooking.id + 1
            : 1;


    return (
        "DJ-" +
        year +
        "-" +
        String(nextId).padStart(5, "0")
    );

}


/* =========================================
   TRANSACTION ID
========================================= */

function generateTransactionId() {

    const random =
        crypto
            .randomBytes(6)
            .toString("hex")
            .toUpperCase();


    return (
        "TXN-" +
        Date.now() +
        "-" +
        random
    );

}


/* =========================================
   NUMBER VALUE
========================================= */

function numberValue(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return 0;

    }


    return number;

}


/* =========================================
   CUSTOMER OTP SYSTEM
========================================= */

const otpStore =
    new Map();


const OTP_EXPIRY_MS =
    5 * 60 * 1000;


const OTP_RESEND_COOLDOWN_MS =
    30 * 1000;


const OTP_MAX_ATTEMPTS =
    5;


const CUSTOMER_TOKEN_EXPIRY_MS =
    30 * 60 * 1000;


/* =========================================
   NORMALIZE MOBILE
========================================= */

function normalizeMobile(value) {

    return String(value || "")
        .replace(/\D/g, "")
        .slice(-10);

}


/* =========================================
   GENERATE 6 DIGIT OTP
========================================= */

function generateCustomerOtp() {

    return String(
        crypto.randomInt(
            100000,
            1000000
        )
    );

}


/* =========================================
   HASH OTP
========================================= */

function hashCustomerOtp(
    mobile,
    otp
) {

    return crypto
        .createHash("sha256")
        .update(
            `${mobile}:${otp}`
        )
        .digest("hex");

}


/* =========================================
   CREATE CUSTOMER TOKEN
========================================= */

function createCustomerVerificationToken() {

    return crypto
        .randomBytes(32)
        .toString("hex");

}


/* =========================================
   SEND OTP BY SMS
   DEMO MODE
========================================= */

async function sendOtpBySms(
    mobile,
    otp
) {

    console.log(
        "========================================"
    );

    console.log(
        "📱 CUSTOMER OTP"
    );

    console.log(
        "Mobile:",
        mobile
    );

    console.log(
        "OTP:",
        otp
    );

    console.log(
        "Valid For: 5 Minutes"
    );

    console.log(
        "========================================"
    );


    return true;

}

/* =========================================
   SEND CUSTOMER OTP
========================================= */

app.post(
    "/api/customer/send-otp",
    async (req, res) => {

        try {

            const mobile =
                normalizeMobile(
                    req.body.mobile
                );


            if (
                !/^\d{10}$/.test(mobile)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid 10 digit mobile number."

                });

            }


            const existing =
                otpStore.get(mobile);


            if (
                existing &&
                Date.now() -
                    existing.createdAt
                    <
                    OTP_RESEND_COOLDOWN_MS
            ) {

                const remaining =
                    Math.ceil(
                        (
                            OTP_RESEND_COOLDOWN_MS -
                            (
                                Date.now() -
                                existing.createdAt
                            )
                        ) / 1000
                    );


                return res.status(429).json({

                    success: false,

                    message:
                        `Please wait ${remaining} seconds before requesting another OTP.`

                });

            }


            const otp =
                generateCustomerOtp();


            const otpHash =
                hashCustomerOtp(
                    mobile,
                    otp
                );


            const createdAt =
                Date.now();


            otpStore.set(
                mobile,
                {

                    otpHash,

                    createdAt,

                    expiresAt:
                        createdAt +
                        OTP_EXPIRY_MS,

                    attempts:
                        0,

                    verified:
                        false,

                    verificationToken:
                        null,

                    tokenExpiresAt:
                        null

                }
            );


            await sendOtpBySms(
                mobile,
                otp
            );


            return res.json({

                success: true,

                message:
                    "OTP generated successfully.",

                mobile:
                    mobile.slice(0, 2) +
                    "******" +
                    mobile.slice(-2),

                expiresIn:
                    300,

                resendAfter:
                    30,

                demo:
                    true

            });


        } catch (error) {

            console.error(
                "Send OTP Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to send OTP."

            });

        }

    }
);


/* =========================================
   VERIFY CUSTOMER OTP
========================================= */

app.post(
    "/api/customer/verify-otp",
    (req, res) => {

        try {

            const mobile =
                normalizeMobile(
                    req.body.mobile
                );


            const otp =
                String(
                    req.body.otp || ""
                ).trim();


            if (
                !/^\d{10}$/.test(mobile)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid mobile number."

                });

            }


            if (
                !/^\d{6}$/.test(otp)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "OTP must contain exactly 6 digits."

                });

            }


            const record =
                otpStore.get(mobile);


            if (!record) {

                return res.status(400).json({

                    success: false,

                    message:
                        "OTP not found. Please request a new OTP."

                });

            }


            if (
                Date.now() >
                record.expiresAt
            ) {

                otpStore.delete(
                    mobile
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "OTP has expired. Please request a new OTP."

                });

            }


            if (
                record.attempts >=
                OTP_MAX_ATTEMPTS
            ) {

                otpStore.delete(
                    mobile
                );


                return res.status(429).json({

                    success: false,

                    message:
                        "Maximum OTP attempts exceeded. Please request a new OTP."

                });

            }


            record.attempts += 1;


            const enteredOtpHash =
                hashCustomerOtp(
                    mobile,
                    otp
                );


            if (
                enteredOtpHash !==
                record.otpHash
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Incorrect OTP.",

                    attemptsRemaining:
                        Math.max(
                            OTP_MAX_ATTEMPTS -
                            record.attempts,
                            0
                        )

                });

            }


            const verificationToken =
                createCustomerVerificationToken();


            record.verified =
                true;


            record.verificationToken =
                verificationToken;


            record.tokenExpiresAt =
                Date.now() +
                CUSTOMER_TOKEN_EXPIRY_MS;


            otpStore.set(
                mobile,
                record
            );


            console.log(
                "Customer mobile verified ✅:",
                mobile
            );


            return res.json({

                success: true,

                message:
                    "Mobile number verified successfully.",

                verified:
                    true,

                mobile,

                verificationToken,

                tokenExpiresIn:
                    CUSTOMER_TOKEN_EXPIRY_MS /
                    1000

            });

        } catch (error) {

            console.error(
                "Verify OTP Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "OTP verification failed."

            });

        }

    }
);


/* =========================================
   CUSTOMER VERIFICATION AUTH
   GOOGLE + OTP
========================================= */

async function customerVerificationAuth(
    req,
    res,
    next
) {

    try {

        /* -----------------------------------------
           OPTION 1:
           GOOGLE SESSION / CREDENTIAL
        ----------------------------------------- */

        const googleToken =
            String(
                req.headers[
                    "x-customer-google-token"
                ] || ""
            ).trim();


        const googleCredential =
            String(
                req.headers[
                    "x-customer-google-credential"
                ] || ""
            ).trim();


        if (
            googleToken ||
            googleCredential
        ) {

            let googleSession = null;
            let sessionToken = "";


            /* -------------------------------------
               FIRST TRY EXISTING SESSION
            ------------------------------------- */

            if (googleToken) {

                googleSession =
                    googleCustomerSessions.get(
                        googleToken
                    );


                if (
                    googleSession &&
                    Date.now() >
                    googleSession.expiresAt
                ) {

                    googleCustomerSessions.delete(
                        googleToken
                    );

                    googleSession =
                        null;

                }


                if (
                    googleSession
                ) {

                    sessionToken =
                        googleToken;

                }

            }


            /* -------------------------------------
               FALLBACK:
               VERIFY GOOGLE CREDENTIAL
            ------------------------------------- */

            if (
                !googleSession &&
                googleCredential
            ) {

                const payload =
                    await verifyGoogleCredential(
                        googleCredential
                    );


                if (!payload) {

                    return res.status(401).json({

                        success: false,

                        message:
                            "Google credential is invalid or expired."

                    });

                }


                const created =
                    createGoogleCustomerSession(
                        payload
                    );


                googleSession =
                    created.session;

                sessionToken =
                    created.sessionToken;

            }


            if (
                !googleSession
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Google session not found or expired. Please sign in again."

                });

            }


            const bodyMobile =
                req.body &&
                req.body.customer
                    ? req.body.customer.mobile
                    : "";


            const headerMobile =
                req.headers[
                    "x-customer-mobile"
                ];


            const mobile =
                normalizeMobile(
                    bodyMobile ||
                    headerMobile
                );


            if (
                !/^\d{10}$/.test(mobile)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "A valid 10 digit mobile number is required."

                });

            }


            req.customerMobile =
                mobile;


            req.googleCustomer =
                googleSession;


            req.googleSessionToken =
                sessionToken;


            req.customerAuthType =
                "google";


            return next();

        }


        /* -----------------------------------------
           OPTION 2:
           EXISTING OTP VERIFICATION
        ----------------------------------------- */

        const token =
            req.headers[
                "x-customer-verification-token"
            ];


        const mobile =
            normalizeMobile(
                req.headers[
                    "x-customer-mobile"
                ]
            );


        if (
            !token ||
            !mobile
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Google Sign-In or mobile verification required."

            });

        }


        const record =
            otpStore.get(
                mobile
            );


        if (!record) {

            return res.status(401).json({

                success: false,

                message:
                    "Verification session not found."

            });

        }


        if (!record.verified) {

            return res.status(401).json({

                success: false,

                message:
                    "Mobile number is not verified."

            });

        }


        if (
            record.verificationToken !==
            token
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid verification token."

            });

        }


        if (
            Date.now() >
            record.tokenExpiresAt
        ) {

            otpStore.delete(
                mobile
            );


            return res.status(401).json({

                success: false,

                message:
                    "Verification session expired."

            });

        }


        req.customerMobile =
            mobile;


        req.customerAuthType =
            "otp";


        next();


    } catch (error) {

        console.error(
            "Customer Verification Auth Error:",
            error.message
        );


        return res.status(401).json({

            success: false,

            message:
                "Customer authentication failed."

        });

    }

}


/* =========================================
   CHECK CUSTOMER VERIFICATION
========================================= */

app.get(
    "/api/customer/verification-check",
    customerVerificationAuth,
    (req, res) => {

        return res.json({

            success: true,

            verified: true,

            mobile:
                req.customerMobile,

            authentication:
                req.customerAuthType,

            googleVerified:
                req.customerAuthType === "google",

            message:
                "Customer authentication is valid."

        });

    }
);


/* =========================================
   DEMO PAYMENT
========================================= */

app.post(
    "/api/payments/demo-verify",
    customerVerificationAuth,
    (req, res) => {

        try {

            const {
                customer,
                event,
                package: packageData,
                confirmation,
                paymentMethod
            } = req.body;


            if (
                !customer ||
                !event ||
                !packageData
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Booking information is incomplete."

                });

            }


            if (
                !paymentMethod
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment method is required."

                });

            }


            const packagePrice =
                numberValue(
                    packageData.packagePrice
                );


            const extraTotal =
                numberValue(
                    packageData.extraAmount ??
                    packageData.extraTotal
                );


            let totalAmount =
                numberValue(
                    packageData.totalAmount
                );


            if (
                totalAmount <= 0
            ) {

                totalAmount =
                    packagePrice +
                    extraTotal;

            }


            const advanceAmount =
                numberValue(
                    packageData.advanceAmount
                );


            const remainingAmount =
                Math.max(
                    totalAmount -
                    advanceAmount,
                    0
                );


            if (
                totalAmount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid total booking amount."

                });

            }


            if (
                advanceAmount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid advance payment amount."

                });

            }


            if (
                advanceAmount >
                totalAmount
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Advance cannot be greater than total amount."

                });

            }


            /*
               ADVANCE PAYMENT RULE

               Total <= 2500
               Minimum advance = 500

               Total > 2500
               Advance = 30%

               Advance can never be below 500
            */

            const requiredAdvance =
                totalAmount <= 2500
                    ? 500
                    : Math.max(
                        totalAmount * 0.30,
                        500
                    );


            if (
                advanceAmount <
                requiredAdvance
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Minimum advance required is ₹${requiredAdvance}.`,

                    requiredAdvance,

                    totalAmount,

                    advanceAmount

                });

            }


            const bookingNumber =
                generateBookingNumber();


            const transactionId =
                generateTransactionId();


            const verifiedAt =
                new Date().toISOString();


            /* =================================
               PAYMENT DATA
            ================================= */

            const paymentData = {

                transactionId,

                paymentMethod,

                amount:
                    advanceAmount,

                totalAmount,

                remainingAmount,

                currency:
                    "INR",

                paymentStatus:
                    "Paid",

                verificationStatus:
                    "Verified",

                paymentMode:
                    "Demo",

                paidAt:
                    verifiedAt,

                verifiedAt

            };


            /* =================================
               CONFIRMATION DATA
            ================================= */

            const confirmationDataFinal = {

                ...(confirmation || {}),

                confirmed:
                    true,

                paymentStatus:
                    "Paid",

                bookingStatus:
                    "Confirmed",

                verificationStatus:
                    "Verified",

                bookingNumber,

                transactionId,

                paymentMethod,

                paymentAmount:
                    advanceAmount,

                totalAmount,

                remainingAmount,

                paymentCompletedAt:
                    verifiedAt

            };


            /* =================================
               CUSTOMER MOBILE
            ================================= */

            const finalCustomer = {

                ...(customer || {}),

                mobile:
                    req.customerMobile,

                mobileVerified:
                    req.customerAuthType === "otp",

                googleVerified:
                    req.customerAuthType === "google",

                googleId:
                    req.googleCustomer
                        ? req.googleCustomer.googleId
                        : undefined,

                googleEmail:
                    req.googleCustomer
                        ? req.googleCustomer.email
                        : undefined

            };


            /* =================================
               INSERT BOOKING
            ================================= */

            const statement =
                db.prepare(`
                    INSERT INTO bookings (

                        booking_number,

                        customer_data,

                        event_data,

                        package_data,

                        confirmation_data,

                        payment_data,

                        booking_status,

                        payment_status,

                        created_at,

                        verified_at

                    )

                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                `);


            const result =
                statement.run(

                    bookingNumber,

                    JSON.stringify(
                        finalCustomer
                    ),

                    JSON.stringify(
                        event
                    ),

                    JSON.stringify(
                        packageData
                    ),

                    JSON.stringify(
                        confirmationDataFinal
                    ),

                    JSON.stringify(
                        paymentData
                    ),

                    "Confirmed",

                    "Paid",

                    verifiedAt,

                    verifiedAt

                );


            console.log(
                "========================================"
            );


            console.log(
                "🎧 NEW DJ BOOKING SAVED"
            );


            console.log(
                "Booking Number:",
                bookingNumber
            );


            console.log(
                "Database ID:",
                result.lastInsertRowid
            );


            console.log(
                "Transaction ID:",
                transactionId
            );


            console.log(
                "Payment Status:",
                "Paid"
            );


            console.log(
                "Booking Status:",
                "Confirmed"
            );


            console.log(
                "Authentication:",
                req.customerAuthType
            );


            console.log(
                "========================================"
            );


            return res.status(201).json({

                success: true,

                message:
                    "Payment verified and booking confirmed.",

                bookingNumber,

                transactionId,

                databaseId:
                    result.lastInsertRowid,

                paymentStatus:
                    "Paid",

                verificationStatus:
                    "Verified",

                bookingStatus:
                    "Confirmed",

                authentication:
                    req.customerAuthType,

                totalAmount,

                advanceAmount,

                remainingAmount,

                verifiedAt,

                payment:
                    paymentData

            });


        } catch (error) {

            console.error(
                "Payment Verification Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Payment verification failed.",

                error:
                    error.message

            });

        }

    }
);

/* =========================================
   ADMIN BOOKINGS API
========================================= */

app.get(
    "/api/admin/bookings",
    adminAuth,
    (req, res) => {

        try {

            const rows =
                db.prepare(`
                    SELECT *
                    FROM bookings
                    ORDER BY id DESC
                `).all();


            const bookings =
                rows.map((row) => {

                    let customer = {};
                    let event = {};
                    let packageData = {};
                    let confirmation = {};
                    let payment = {};


                    try {
                        customer =
                            JSON.parse(
                                row.customer_data || "{}"
                            );
                    } catch (error) {}


                    try {
                        event =
                            JSON.parse(
                                row.event_data || "{}"
                            );
                    } catch (error) {}


                    try {
                        packageData =
                            JSON.parse(
                                row.package_data || "{}"
                            );
                    } catch (error) {}


                    try {
                        confirmation =
                            JSON.parse(
                                row.confirmation_data || "{}"
                            );
                    } catch (error) {}


                    try {
                        payment =
                            JSON.parse(
                                row.payment_data || "{}"
                            );
                    } catch (error) {}


                    return {

                        id:
                            row.id,

                        bookingNumber:
                            row.booking_number,

                        customer,

                        event,

                        package:
                            packageData,

                        confirmation,

                        payment,

                        bookingStatus:
                            row.booking_status,

                        paymentStatus:
                            row.payment_status,

                        createdAt:
                            row.created_at,

                        verifiedAt:
                            row.verified_at

                    };

                });


            return res.json({

                success: true,

                count:
                    bookings.length,

                bookings

            });


        } catch (error) {

            console.error(
                "Admin Bookings API Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load bookings.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================
   ADMIN SINGLE BOOKING
========================================= */

app.get(
    "/api/admin/bookings/:id",
    adminAuth,
    (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid booking ID."

                });

            }


            const row =
                db.prepare(`
                    SELECT *
                    FROM bookings
                    WHERE id = ?
                `).get(id);


            if (!row) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found."

                });

            }


            let customer = {};
            let event = {};
            let packageData = {};
            let confirmation = {};
            let payment = {};


            try {
                customer =
                    JSON.parse(
                        row.customer_data || "{}"
                    );
            } catch (error) {}


            try {
                event =
                    JSON.parse(
                        row.event_data || "{}"
                    );
            } catch (error) {}


            try {
                packageData =
                    JSON.parse(
                        row.package_data || "{}"
                    );
            } catch (error) {}


            try {
                confirmation =
                    JSON.parse(
                        row.confirmation_data || "{}"
                    );
            } catch (error) {}


            try {
                payment =
                    JSON.parse(
                        row.payment_data || "{}"
                    );
            } catch (error) {}


            return res.json({

                success: true,

                booking: {

                    id:
                        row.id,

                    bookingNumber:
                        row.booking_number,

                    customer,

                    event,

                    package:
                        packageData,

                    confirmation,

                    payment,

                    bookingStatus:
                        row.booking_status,

                    paymentStatus:
                        row.payment_status,

                    createdAt:
                        row.created_at,

                    verifiedAt:
                        row.verified_at

                }

            });


        } catch (error) {

            console.error(
                "Admin Single Booking Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load booking.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================
   ADMIN CONFIRM / CANCEL BOOKING
========================================= */

app.patch(
    "/api/admin/bookings/:id/status",
    adminAuth,
    (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            const requestedStatus =
                String(
                    req.body.status || ""
                ).trim();


            if (
                !Number.isInteger(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid booking ID."

                });

            }


            const allowedStatuses =
                [
                    "Confirmed",
                    "Cancelled",
                    "Pending"
                ];


            if (
                !allowedStatuses.includes(
                    requestedStatus
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid booking status."

                });

            }


            const existing =
                db.prepare(`
                    SELECT *
                    FROM bookings
                    WHERE id = ?
                `).get(id);


            if (!existing) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found."

                });

            }


            const now =
                new Date().toISOString();


            let confirmation =
                {};


            try {

                confirmation =
                    JSON.parse(
                        existing.confirmation_data ||
                        "{}"
                    );

            } catch (error) {}


            confirmation.bookingStatus =
                requestedStatus;


            confirmation.statusUpdatedAt =
                now;


            if (
                requestedStatus ===
                "Confirmed"
            ) {

                confirmation.confirmed =
                    true;

            }


            if (
                requestedStatus ===
                "Cancelled"
            ) {

                confirmation.confirmed =
                    false;

            }


            db.prepare(`
                UPDATE bookings

                SET
                    booking_status = ?,
                    confirmation_data = ?

                WHERE id = ?
            `).run(

                requestedStatus,

                JSON.stringify(
                    confirmation
                ),

                id

            );


            console.log(
                "Admin booking status updated:",
                existing.booking_number,
                "→",
                requestedStatus
            );


            return res.json({

                success: true,

                message:
                    `Booking ${requestedStatus.toLowerCase()} successfully.`,

                bookingNumber:
                    existing.booking_number,

                bookingStatus:
                    requestedStatus,

                updatedAt:
                    now

            });


        } catch (error) {

            console.error(
                "Admin Status Update Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update booking status.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================
   OLD BOOKING API
   COMPATIBILITY
========================================= */

app.get(
    "/api/bookings",
    (req, res) => {

        try {

            const rows =
                db.prepare(`
                    SELECT *
                    FROM bookings
                    ORDER BY id DESC
                `).all();


            const bookings =
                rows.map((row) => {

                    let customer = {};
                    let event = {};
                    let packageData = {};
                    let confirmation = {};
                    let payment = {};


                    try {
                        customer =
                            JSON.parse(
                                row.customer_data || "{}"
                            );
                    } catch (error) {}


                    try {
                        event =
                            JSON.parse(
                                row.event_data || "{}"
                            );
                    } catch (error) {}


                    try {
                        packageData =
                            JSON.parse(
                                row.package_data || "{}"
                            );
                    } catch (error) {}


                    try {
                        confirmation =
                            JSON.parse(
                                row.confirmation_data || "{}"
                            );
                    } catch (error) {}


                    try {
                        payment =
                            JSON.parse(
                                row.payment_data || "{}"
                            );
                    } catch (error) {}


                    return {

                        id:
                            row.id,

                        bookingNumber:
                            row.booking_number,

                        customer,

                        event,

                        package:
                            packageData,

                        confirmation,

                        payment,

                        bookingStatus:
                            row.booking_status,

                        paymentStatus:
                            row.payment_status,

                        createdAt:
                            row.created_at,

                        verifiedAt:
                            row.verified_at

                    };

                });


            return res.json({

                success: true,

                count:
                    bookings.length,

                bookings

            });


        } catch (error) {

            console.error(
                "Bookings API Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load bookings.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================
   OLD SINGLE BOOKING API
   COMPATIBILITY
========================================= */

app.get(
    "/api/bookings/:id",
    (req, res) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid booking ID."

                });

            }


            const row =
                db.prepare(`
                    SELECT *
                    FROM bookings
                    WHERE id = ?
                `).get(id);


            if (!row) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found."

                });

            }


            let customer = {};
            let event = {};
            let packageData = {};
            let confirmation = {};
            let payment = {};


            try {
                customer =
                    JSON.parse(
                        row.customer_data || "{}"
                    );
            } catch (error) {}


            try {
                event =
                    JSON.parse(
                        row.event_data || "{}"
                    );
            } catch (error) {}


            try {
                packageData =
                    JSON.parse(
                        row.package_data || "{}"
                    );
            } catch (error) {}


            try {
                confirmation =
                    JSON.parse(
                        row.confirmation_data || "{}"
                    );
            } catch (error) {}


            try {
                payment =
                    JSON.parse(
                        row.payment_data || "{}"
                    );
            } catch (error) {}


            return res.json({

                success: true,

                booking: {

                    id:
                        row.id,

                    bookingNumber:
                        row.booking_number,

                    customer,

                    event,

                    package:
                        packageData,

                    confirmation,

                    payment,

                    bookingStatus:
                        row.booking_status,

                    paymentStatus:
                        row.payment_status,

                    createdAt:
                        row.created_at,

                    verifiedAt:
                        row.verified_at

                }

            });


        } catch (error) {

            console.error(
                "Single Booking API Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load booking.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================
   CUSTOMER BOOKING STATUS
========================================= */

app.get(
    "/api/booking-status/:bookingNumber",
    (req, res) => {

        try {

            const bookingNumber =
                String(
                    req.params.bookingNumber ||
                    ""
                ).trim();


            if (!bookingNumber) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Booking number is required."

                });

            }


            const row =
                db.prepare(`
                    SELECT
                        id,
                        booking_number,
                        booking_status,
                        payment_status,
                        created_at,
                        verified_at
                    FROM bookings
                    WHERE booking_number = ?
                `).get(
                    bookingNumber
                );


            if (!row) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found."

                });

            }


            return res.json({

                success: true,

                booking: {

                    id:
                        row.id,

                    bookingNumber:
                        row.booking_number,

                    bookingStatus:
                        row.booking_status,

                    paymentStatus:
                        row.payment_status,

                    createdAt:
                        row.created_at,

                    verifiedAt:
                        row.verified_at

                }

            });


        } catch (error) {

            console.error(
                "Booking Status Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to check booking status.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================
   BOOKING STATUS COMPATIBILITY
========================================= */

app.get(
    "/api/bookings/status/:bookingNumber",
    (req, res) => {

        try {

            const bookingNumber =
                String(
                    req.params.bookingNumber ||
                    ""
                ).trim();


            if (!bookingNumber) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Booking number is required."

                });

            }


            const row =
                db.prepare(`
                    SELECT
                        id,
                        booking_number,
                        booking_status,
                        payment_status,
                        created_at,
                        verified_at
                    FROM bookings
                    WHERE booking_number = ?
                `).get(
                    bookingNumber
                );


            if (!row) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found."

                });

            }


            return res.json({

                success: true,

                booking: {

                    id:
                        row.id,

                    bookingNumber:
                        row.booking_number,

                    bookingStatus:
                        row.booking_status,

                    paymentStatus:
                        row.payment_status,

                    createdAt:
                        row.created_at,

                    verifiedAt:
                        row.verified_at

                }

            });


        } catch (error) {

            console.error(
                "Compatibility Booking Status Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to check booking status.",

                error:
                    error.message

            });

        }

    }
);
/* =========================================
   TEST BOOKINGS API
========================================= */

app.post(
    "/api/test-bookings",
    (req, res) => {

        try {

            const bookingNumber =
                generateBookingNumber();

            const now =
                new Date().toISOString();

            const customer = {

                name:
                    req.body.name ||
                    "Test Customer",

                fatherName:
                    req.body.fatherName ||
                    "Test Father",

                mobile:
                    req.body.mobile ||
                    "9999999999",

                address:
                    req.body.address ||
                    "Test Address"

            };


            const event = {

                eventType:
                    req.body.eventType ||
                    "Birthday",

                eventDate:
                    req.body.eventDate ||
                    now.split("T")[0],

                eventTime:
                    req.body.eventTime ||
                    "18:00",

                venue:
                    req.body.venue ||
                    "Test Venue",

                city:
                    req.body.city ||
                    "Test City"

            };


            const packageData = {

                packageName:
                    req.body.packageName ||
                    "Basic",

                packagePrice:
                    numberValue(
                        req.body.packagePrice ||
                        2000
                    ),

                totalAmount:
                    numberValue(
                        req.body.totalAmount ||
                        2000
                    ),

                advanceAmount:
                    numberValue(
                        req.body.advanceAmount ||
                        500
                    )

            };


            const transactionId =
                generateTransactionId();


            const paymentData = {

                transactionId,

                paymentMethod:
                    req.body.paymentMethod ||
                    "UPI",

                amount:
                    packageData.advanceAmount,

                totalAmount:
                    packageData.totalAmount,

                remainingAmount:
                    Math.max(
                        packageData.totalAmount -
                        packageData.advanceAmount,
                        0
                    ),

                currency:
                    "INR",

                paymentStatus:
                    "Paid",

                verificationStatus:
                    "Verified",

                paymentMode:
                    "Demo",

                paidAt:
                    now,

                verifiedAt:
                    now

            };


            const confirmationData = {

                confirmed:
                    true,

                paymentStatus:
                    "Paid",

                bookingStatus:
                    "Confirmed",

                verificationStatus:
                    "Verified",

                bookingNumber,

                transactionId,

                paymentMethod:
                    paymentData.paymentMethod,

                paymentAmount:
                    paymentData.amount,

                totalAmount:
                    paymentData.totalAmount,

                remainingAmount:
                    paymentData.remainingAmount,

                paymentCompletedAt:
                    now

            };


            const statement =
                db.prepare(`
                    INSERT INTO bookings (

                        booking_number,

                        customer_data,

                        event_data,

                        package_data,

                        confirmation_data,

                        payment_data,

                        booking_status,

                        payment_status,

                        created_at,

                        verified_at

                    )

                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                `);


            const result =
                statement.run(

                    bookingNumber,

                    JSON.stringify(
                        customer
                    ),

                    JSON.stringify(
                        event
                    ),

                    JSON.stringify(
                        packageData
                    ),

                    JSON.stringify(
                        confirmationData
                    ),

                    JSON.stringify(
                        paymentData
                    ),

                    "Confirmed",

                    "Paid",

                    now,

                    now

                );


            return res.status(201).json({

                success: true,

                message:
                    "Test booking created successfully.",

                bookingNumber,

                transactionId,

                databaseId:
                    result.lastInsertRowid,

                bookingStatus:
                    "Confirmed",

                paymentStatus:
                    "Paid"

            });


        } catch (error) {

            console.error(
                "Test Booking Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to create test booking.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================
   CLEAN EXPIRED OTP RECORDS
========================================= */

setInterval(
    () => {

        const now =
            Date.now();


        for (
            const [mobile, record]
            of otpStore.entries()
        ) {

            if (
                now >
                record.expiresAt
            ) {

                otpStore.delete(
                    mobile
                );

            }

        }

    },
    60 * 1000
);


/* =========================================
   CLEAN EXPIRED GOOGLE SESSIONS
========================================= */

setInterval(
    () => {

        const now =
            Date.now();


        for (
            const [
                token,
                session
            ]
            of googleCustomerSessions.entries()
        ) {

            if (
                now >
                session.expiresAt
            ) {

                googleCustomerSessions.delete(
                    token
                );

            }

        }

    },
    60 * 1000
);


/* =========================================
   SERVER START
========================================= */

app.listen(
    PORT,
    () => {

        console.log(
            "----------------------------------------"
        );

        console.log(
            "🎧 DJ BOOKING PRO BACKEND"
        );

        console.log(
            "----------------------------------------"
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log(
            "SQLite: Connected ✅"
        );

        console.log(
            "Payment Verification: Demo ✅"
        );

        console.log(
            "Admin Login: Enabled ✅"
        );

        console.log(
            "Admin Bookings API: Enabled ✅"
        );

        console.log(
            "Admin Confirm/Cancel API: Enabled ✅"
        );

        console.log(
            "Customer OTP: Server Side ✅"
        );

        console.log(
            "Google Sign-In: Enabled ✅"
        );

        console.log(
            "Google Credential Fallback: Enabled ✅"
        );

        console.log(
            "Customer Booking Status: Enabled ✅"
        );

        console.log(
            "Admin Username/Password Login: Enabled ✅"
        );

        console.log(
            "Admin Google Login: Enabled ✅"
        );

        console.log(
            "----------------------------------------"
        );

    }
);
