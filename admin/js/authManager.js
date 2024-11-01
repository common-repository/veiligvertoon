const ACCESS_TOKEN_EXPIRY_MARGIN_SECONDS = 60;
const ACCESS_TOKEN_COOKIE_KEY = "vvAccessToken";
const ACCESS_TOKEN_EXPIRY_TIME_COOKIE_KEY = "vvAccessTokenExpiryTime";
const LAST_ACCESS_TOKEN_COOKIE_KEY = "vvLastAccessToken";
const REFRESH_TOKEN_COOKIE_KEY = "vvRefreshToken";

// extension function to add seconds to a given date
Date.prototype.addSeconds = function(seconds){
    this.setSeconds(this.getSeconds()+seconds);
    return this;
}

async function startAuthHandler() {
    // Get the expiry time of the access token from the cookies
    let tokenExpiryTimeStamp = getCookie(ACCESS_TOKEN_EXPIRY_TIME_COOKIE_KEY)

    // If no expiryTime is set in the cookies then we need to authenticate
    if (!tokenExpiryTimeStamp) {
        await authenticate();
        tokenExpiryTimeStamp = getCookie(ACCESS_TOKEN_EXPIRY_TIME_COOKIE_KEY);
    }

    // calculate the refresh interval using the expiration date of the received access token
    const now = new Date().getTime();
    const refreshInterval = tokenExpiryTimeStamp - now;

    // call the authHandler again using recursion after the refreshInterval expires
    setTimeout(() => {
        startAuthHandler();
    }, refreshInterval)
}

/**
 * Fetches the clientId & clientSecret from the databaase
 *
 * @returns {promise} The clientId & clientSecret
 */
async function getClientCredentials() {
    const response = await jQuery.post(ajaxurl, {'action': 'veiligvertoon_get_credentials'}, (response) => response);
    return JSON.parse(response);
}

/**
 * Authenticate with the server and obtain the accessToken
 *
 * @returns {promise} The accessToken
 */
async function authenticate() {
    let accessToken = getCookie(ACCESS_TOKEN_COOKIE_KEY);
    const refreshToken = getCookie(REFRESH_TOKEN_COOKIE_KEY);
    const lastAccessToken = getCookie(LAST_ACCESS_TOKEN_COOKIE_KEY);

    // if a cookie exist with an access token just use this for authentication
    if (accessToken)
        return accessToken

    let response;

    // in case we dont have an active access token but we have a refresh token use this to obtain a new
    // active access token
    if (refreshToken && lastAccessToken) {
        // use the refresh endpoint to obtain a new access token
        response = await jQuery.ajax({
            url: `${API_BASE_URL}/api/auth/refresh`,
            type: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                RefreshToken: refreshToken,
                AccessToken: lastAccessToken,
            })
        }).catch(error => null)
    }

    // in case we couldn't fetch a new access token using the refresh token we need to use the client credentials instead
    if(!response) {
        // obtain the configured client credentials from the user and use them to obtain an new access token
        const {clientId, clientSecret} = await getClientCredentials();
        response = await jQuery.ajax({
            url: `${API_BASE_URL}/api/auth/authenticate`,
            type: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                clientId,
                clientSecret
            })
        })
    }

    // Extract the access token from the response
    accessToken = response["access_token"]

    // Calculate the time at which the token expires
    const expiryDuration = response["expires_in"] - ACCESS_TOKEN_EXPIRY_MARGIN_SECONDS;

    const tokenExpiryTimeStamp = new Date().addSeconds(expiryDuration).getTime();
    const cookieExpiryTime = new Date().addSeconds(expiryDuration);

    // Store the new access token data in the cookies
    setCookie(
        ACCESS_TOKEN_COOKIE_KEY,
        accessToken,
        cookieExpiryTime
    )
    setCookie(
        ACCESS_TOKEN_EXPIRY_TIME_COOKIE_KEY,
        tokenExpiryTimeStamp,
        cookieExpiryTime
    )
    setCookie(
        LAST_ACCESS_TOKEN_COOKIE_KEY,
        accessToken
    )
    setCookie(
        REFRESH_TOKEN_COOKIE_KEY,
        response["refresh_token"],
    )

    return accessToken;
}

/**
 * Removes all the authentication cookies
 */
function deleteAuthCookies() {
    deleteCookie(ACCESS_TOKEN_COOKIE_KEY);
    deleteCookie(ACCESS_TOKEN_EXPIRY_TIME_COOKIE_KEY);
    deleteCookie(LAST_ACCESS_TOKEN_COOKIE_KEY);
    deleteCookie(REFRESH_TOKEN_COOKIE_KEY);
}
