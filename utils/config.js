if (typeof window === "undefined") {
    /**
     * Settings exposed to the server.
     */
    module.exports = {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        MONGODB_URI: process.env.MONGODB_URI,
    };
} else {
    /**
     * Settings exposed to the client.
     */
    module.exports = {};
}