function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdate) {
    let expires = "";

    // Only set an expiration time to the cookie if one has been provided
    if (exdate) {
        expires = `expires=${exdate.toUTCString()};`;
    }

    document.cookie = cname + "=" + cvalue + ";" + expires + "path=/";
}

function deleteCookie(cname){
    document.cookie = cname +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
