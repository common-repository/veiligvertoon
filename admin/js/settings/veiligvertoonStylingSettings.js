//add the custom tooltips on window load
window.addEventListener("load", async function() {
    initForm()
});

function initForm(){
    initFontSelect2();
    initThemeSelector();

    // event that is triggered upon display location change that conditionally shows
    // the display style based on the selected display location
    jQuery(".displayLocationRadio").on("click", function(){
        // in case the display location is long description the display style options should show
        if (jQuery(this)[0].id === "customTab")
            jQuery('#displayStyleConfigContainer').parents("tr").hide();
        else
            jQuery('#displayStyleConfigContainer').parents("tr").show();
    });

    // determine if the displayStyle config section should be shown on init based on the selected display location val
    const selectedSafetyInformationLocation = jQuery(".displayLocationRadio:checked").val()
    if (selectedSafetyInformationLocation === "customTab") {
        jQuery('#displayStyleConfigContainer').parents("tr").hide();
    }
}

/**
 * builds the content of the select2 options using a template in which the with the
 * item associated font style is used for the select2 option.
 */
function buildSelectFontOption(option){
    let $option = jQuery(
        `<span style="font-family: ${option.text}">${option.text}</span> - <span style="font-family: ${option.text}; font-weight: bold;">${option.text}</span>`
    );
    return $option;
}

function initThemeSelector(){
    // this prevents the coloris.js onclick event to be performed which effectively disables the color picker element
    jQuery('.clr-field').on('click', function(e) {
        const selectedTheme = jQuery(".colorThemeRadio:checked").val()

        // in case the custom theme is not selected make sure to stop te propagation to the next event which
        // will cancel out the Coloris.js event that opens the ColorPicker. This effectively disables element
        if (selectedTheme !== "customTheme") e.stopPropagation();
    })

    // onclick event on the theme radio buttons to change the active theme
    jQuery('.colorThemeRadio').on('click', function() {
        const selectedTheme = jQuery(this).val();
        const backgroundColorInput = jQuery('#backgroundColorPicker');
        const fontColorInput = jQuery('#fontColorPicker');

        // enable/ disable the color picker input element based on the selected theme
        const isCustomTheme = selectedTheme === "customTheme";
        backgroundColorInput.prop( "readonly", !isCustomTheme )
        fontColorInput.prop( "readonly", !isCustomTheme )

        // in case the selected theme is not custom the coloris.js color picker values should be set
        // to the color scheme associated with the selected theme
        if(!isCustomTheme) {
            // select the color preview element associated with the selected theme option
            const colorPreviewElement = jQuery("label[for='" + jQuery(this).attr('id') + "']")
            // obtain the background and font color associated with the selected theme
            const previewBackgroundColor = rgba2hex(colorPreviewElement.css( "background-color" ))
            const previewFontColor = rgba2hex(colorPreviewElement.css( "color" ))

            // programmatically update the colors of the font/ background color picker inputs
            backgroundColorInput.val(previewBackgroundColor);
            backgroundColorInput.parents('.clr-field').css('color', previewBackgroundColor);
            fontColorInput.val(previewFontColor);
            fontColorInput.parents('.clr-field').css('color', previewFontColor);
        }
    });

    // on init, trigger a click event on the currently selected theme to run the logic responsible for setting the color
    // values of the inputs to the color scheme associated with the selected theme and to disable the color pickers
    jQuery(".colorThemeRadio:checked").click();
}



function initFontSelect2(){
    // initialize the font select2 element
    const selectFont = jQuery('.select-font')
    selectFont.select2({
        placeholder: getTranslation('styling-settings-select-font'),
        containerCssClass: 'veiligvertoon-select',
        width: '250px',
        templateResult: buildSelectFontOption,
        data: [
            {
                "id": "Lato",
                "text": "Lato",
            },
            {
                "id": "Open Sans",
                "text": "Open Sans"
            },
            {
                "id": "Montserrat",
                "text": "Montserrat"
            },
            {
                "id": "Roboto",
                "text": "Roboto"
            },
            {
                "id": "Poppins",
                "text": "Poppins"
            },
            {
                "id": "Roboto Condensed",
                "text": "Roboto Condensed"
            },
            {
                "id": "Source Sans Pro",
                "text": "Source Sans Pro"
            },
            {
                "id": "Oswald",
                "text": "Oswald"
            },
            {
                "id": "Roboto Mono",
                "text": "Roboto Mono"
            },
            {
                "id": "Crimson Text",
                "text": "Crimson Text"
            },
            {
                "id": "Raleway",
                "text": "Raleway"
            },
            {
                "id": "Roboto Slab",
                "text": "Roboto Slab"
            },
            {
                "id": "Overlock",
                "text": "Overlock"
            },
            {
                "id": "Nunito",
                "text": "Nunito"
            },
            {
                "id": "Playfair Display",
                "text": "Playfair Display"
            },
            {
                "id": "Source Sans Pro",
                "text": "Source Sans Pro"
            },
            {
                "id": "Source Code Pro",
                "text": "Source Code Pro"
            }
        ]
    }).on('change', function (e) {
        // change the font family of the selected preview based on the selected option
        jQuery('#select-font-container').find('.select2-selection__rendered')
            .css("font-family", jQuery(this).select2('data')[0].text)
    }).val(selectFont.data("selected-font-family")).trigger("change");
}

