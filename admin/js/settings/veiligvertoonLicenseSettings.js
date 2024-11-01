window.addEventListener("load", async function() {
    // clear the license related cookies in case the license data is updated
    jQuery('#settingsForm').on('submit', function() {
        deleteCookie("vvRefreshToken");
        deleteCookie("vvLastAccessToken");
    })
});
