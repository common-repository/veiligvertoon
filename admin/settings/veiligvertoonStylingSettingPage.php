<?php
class veiligvertoonStylingSettingPage
{
    public static function initStylingSettingPage()
    {
        add_action('admin_init', function () {
            //add a new custom sections
            add_settings_section("veiligvertoonSectionStyling", "Weergave instellingen", null, "veiligvertoonStyling");

            //add fields to the new custom section
            add_settings_field(
                "safetyInformationLocationRadio",
                self::renderLabelWithTooltip(__('Display location', 'veiligvertoon'), __('The location on the product page where the safety information is displayed.', 'veiligvertoon')),
                array(self::class, "renderCustomRadioList"),
                "veiligvertoonStyling",
                "veiligvertoonSectionStyling"
            );

            // add the checkbox for enabling/disabling the IFrame border
            add_settings_field(
                "IFrameBorderEnabledCheckbox",
                self::renderLabelWithTooltip(__('Display safety information with borders.', 'veiligvertoon'), __('Configure whether the safety information should be displayed with or without borders.', 'veiligvertoon')),
                array(self::class, "renderIFrameBorderCheckbox"),
                "veiligvertoonStyling",
                "veiligvertoonSectionStyling"
            );

            add_settings_field(
                "safetyInformationFontDropdown",
                self::renderLabelWithTooltip(__("Font", "veiligvertoon"), __("The font in which the safety information is displayed.", "veiligvertoon")),
                array(self::class, "renderFontsDropdown"),
                "veiligvertoonStyling",
                "veiligvertoonSectionStyling"
            );

            add_settings_field(
                "displayStyle",
                self::renderLabelWithTooltip(__("Display style", "veiligvertoon"), __("Configure whether the safety information should be displayed open or closed by default.", "veiligvertoon")),
                array(self::class, "renderDisplayStyle"),
                "veiligvertoonStyling",
                "veiligvertoonSectionStyling"
            );

            add_settings_field(
                "colorThemeSelector",
                self::renderLabelWithTooltip(__("Color theme", "veiligvertoon"), __("Configure a theme for the display of the safety information.", "veiligvertoon")),
                array(self::class, "renderColorThemeSelector"),
                "veiligvertoonStyling",
                "veiligvertoonSectionStyling"
            );

            add_settings_field(
                "backgroundColor",
                self::renderLabelWithTooltip(__("Background color", "veiligvertoon"), __("The background color of the safety information.", "veiligvertoon")),
                array(self::class, "renderBackgroundColorPicker"),
                "veiligvertoonStyling",
                "veiligvertoonSectionStyling"
            );

            add_settings_field(
                "fontColor",
                self::renderLabelWithTooltip(__("Font color", "veiligvertoon"), __("The color of the text and the borders of the safety information.", "veiligvertoon")),
                array(self::class, "renderFontColorPicker"),
                "veiligvertoonStyling",
                "veiligvertoonSectionStyling"
            );

            add_settings_field(
                "safetyInformationLanguage",
                self::renderLabelWithTooltip(__("Safety information language", "veiligvertoon"), __("The language in which the safety information is displayed. Note that switching between languages does not automatically translate self-filled text fields.", "veiligvertoon")),
                array(self::class, "renderSafetyInformationLanguageSelector"),
                "veiligvertoonStyling",
                "veiligvertoonSectionStyling"
            );
        });

    }

    /**
     * Render the radio button list for the safetyInformationDisplayLocation config
     */
    static function renderCustomRadioList()
    {
    ?>
        <input class="displayLocationRadio" type="radio" id="longDescription" name="veiligvertoonSafetyInformationDisplayLocation" value="longDescription" <?php checked("longDescription", get_option('veiligvertoonSafetyInformationDisplayLocation'), true); ?>>
        <label for="longDescription"><?php _e("Long description", "veiligvertoon"); ?></label><br>
        
        <input class="displayLocationRadio" type="radio" id="shortDescription" name="veiligvertoonSafetyInformationDisplayLocation" value="shortDescription" <?php checked("shortDescription", get_option('veiligvertoonSafetyInformationDisplayLocation'), true); ?>>
        <label for="shortDescription"><?php _e("Short description", "veiligvertoon"); ?></label><br>

        <input class="displayLocationRadio" type="radio" id="customTab" name="veiligvertoonSafetyInformationDisplayLocation" value="customTab" <?php checked("customTab", get_option('veiligvertoonSafetyInformationDisplayLocation'), true); ?>>
        <label for="customTab"><?php _e("Tab", "veiligvertoon"); ?></label><br>
            
        <input class="displayLocationRadio" type="radio" id="customLocation" name="veiligvertoonSafetyInformationDisplayLocation" value="customLocation" <?php checked("customLocation", get_option('veiligvertoonSafetyInformationDisplayLocation'), true); ?>>
        <label for="customLocation"><?php _e("Custom (advanced)", "veiligvertoon"); ?></label>
        <i class='fas fa-question-circle help-icon' data-tippy-content='<?php _e("Note: This feature is intended for custom work and requires changes in the code of your webshop. Use this feature only if you are aware of the required changes. For questions, contact support@veiligvertoon.nl.", "veiligvertoon"); ?>' style='display: inline-block;'></i></div>

    <?php
    }


    static function renderIFrameBorderCheckbox()
    {
    ?>
        <input type="checkbox" id="renderIFrameBorderCheckbox" name="veiligvertoonRenderIFrameBorder" <?php echo get_option('veiligvertoonRenderIFrameBorder') == 'on' ? "checked" : "" ?> />
    <?php
    }

    static function renderFontsDropdown()
    {
    ?>
        <div id="select-font-container" style="width: fit-content;">
            <select class="select-font" name="veiligvertoonFontFamily" id="fontFamily" data-selected-font-family="<?php echo esc_attr(get_option('veiligvertoonFontFamily')) ?>" required=""></select>
        </div>
    <?php
    }

    static function renderColorThemeSelector()
    {
    ?>
        <div class="themeSelectorPreviewContainer">

            <div class="singleThemeOptionContainer">
                <label for="lightTheme" id="lightThemeLabel">
                    Aa
                </label>
                <span style="position:relative">Light</span>
                <input class="colorThemeRadio" type="radio" id="lightTheme" name="veiligvertoonSafetyInformationColorTheme" value="lightTheme" <?php checked("lightTheme", get_option('veiligvertoonSafetyInformationColorTheme'), true); ?>>
            </div>

            <div class="singleThemeOptionContainer">
                <label for="darkTheme" id="darkThemeLabel">
                    Aa
                </label>
                <span style="position:relative">Dark</span>
                <input class="colorThemeRadio" type="radio" id="darkTheme" name="veiligvertoonSafetyInformationColorTheme" value="darkTheme" <?php checked("darkTheme", get_option('veiligvertoonSafetyInformationColorTheme'), true); ?>>
            </div>

            <div class="singleThemeOptionContainer">
                <label for="customTheme" id="customThemeLabel">
                    Aa
                </label>
                <span style="position:relative">Custom</span>
                <input class="colorThemeRadio" type="radio" id="customTheme" name="veiligvertoonSafetyInformationColorTheme" value="customTheme" <?php checked("customTheme", get_option('veiligvertoonSafetyInformationColorTheme'), true); ?>>
            </div>

        </div>
    <?php
    }

    static function renderBackgroundColorPicker()
    {
    ?>
        <input id="backgroundColorPicker" name="veiligvertoonBackgroundColor" value="<?php echo esc_attr(get_option('veiligvertoonBackgroundColor')) ?>" type="text" data-coloris />
    <?php
    }

    static function renderFontColorPicker()
    {
    ?>
        <input id="fontColorPicker" name="veiligvertoonFontColor" value="<?php echo esc_attr(get_option('veiligvertoonFontColor')) ?>" type="text" data-coloris />
    <?php
    }

    static function renderDisplayStyle()
    {
    ?>
        <div id="displayStyleConfigContainer">
            <input type="radio" id="open" name="veiligvertoonDisplayStyle" value="open" <?php checked("open", get_option('veiligvertoonDisplayStyle'), true); ?>>
            <label for="open"><?php _e("Open", "veiligvertoon") ?></label><br>
            <input type="radio" id="closed" name="veiligvertoonDisplayStyle" value="closed" <?php checked("closed", get_option('veiligvertoonDisplayStyle'), true); ?>>
            <label for="closed"><?php _e("Closed", "veiligvertoon") ?></label>
        </div>
    <?php
    }

    static function renderSafetyInformationLanguageSelector()
    {
    ?>
        <div>
            <input type="radio" id="nl" name="veiligvertoonLanguage" value="nl" <?php checked("nl", get_option('veiligvertoonLanguage'), true); ?>>
            <label for="nl">Nederlands</label><br>
            <input type="radio" id="en" name="veiligvertoonLanguage" value="en" <?php checked("en", get_option('veiligvertoonLanguage'), true); ?>>
            <label for="en">English</label><br>
            <input type="radio" id="de" name="veiligvertoonLanguage" value="de" <?php checked("de", get_option('veiligvertoonLanguage'), true); ?>>
            <label for="de">Deutsch</label>
        </div>
    <?php
    }

    /**
     * Renders the veiligvertoon settings into the admin page
     */
    static function renderVeiligvertoonStylingPageContent()
    {
    ?>
        <div class="wrap">
            <h1 style="display:block!important"><?php _e("Veiligvertoon settings", "veiligvertoon") ?></h1>

            <form id="settingsForm" method="post" action="options.php" style="width: 49%; display: inline-block">
                <?php
                //Output nonce, action, and option_page fields for a settings page.
                settings_fields("veiligvertoonStyling");

                //Prints out all settings sections added to a particular settings page
                do_settings_sections("veiligvertoonStyling");

                // Creates the 'save changes' button
                submit_button();
                ?>
            </form>
        </div>
<?php
    }

    /**
     * Renders a settings field label with a horizontally centered tooltip
     */
    static function renderLabelWithTooltip($labelText, $tooltipContent)
    {
        return "
        <div style='display: flex;'>
            <div style='width:90%;display: inline-block;'>{$labelText}</div>
            <div style='width:10%;display: inline-block;align-self: center;'>
                <i class='fas fa-question-circle help-icon' data-tippy-content='{$tooltipContent}' style='display: inline-block;'></i></div>
        </div>
        ";
    }
}
