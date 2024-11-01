//disable the autodiscover from dropzone globaly
window.Dropzone.autoDiscover = false;

// extension function to add seconds to a given date
Date.prototype.addSeconds = function(seconds){
    this.setSeconds(this.getSeconds()+seconds);
    return this;
}

// function to convert rgb to hexcodes
function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
}

// function to convert rgb(a) to hexcode
function rgba2hex(rgba) {
    let rgb = rgba.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
        alpha = (rgb && rgb[4] || "").trim(),
        hex = rgb ?
            (rgb[1] | 256).toString(16).slice(1) +
            (rgb[2] | 256).toString(16).slice(1) +
            (rgb[3] | 256).toString(16).slice(1) : rgba;

    // multiply before convert to HEX
    hex = `#${hex}`;
    if (alpha) hex += ((alpha * 255) | 1 << 8).toString(16).slice(1);

    return hex;
}

function getTranslation(key) {
    const currentLanguage = getCookie('veiligvertoon-wp-lang')  == "nl_NL" ? "NL" : "EN";
    return VEILIGVERTOON_TRANSLATIONS[currentLanguage][key];
}