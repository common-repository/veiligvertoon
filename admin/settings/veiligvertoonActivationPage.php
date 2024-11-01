<?php
class veiligvertoonActivationPage
{
    public static function initActivationPage() {
        add_action('admin_init', function() {
            //add a new custom sections
            add_settings_section("veiligvertoonSectionActivation", __("Activate your account", "veiligvertoon"), null, "veiligvertoonActivation");

            add_settings_field(
                    "activationCode", self::renderLabelWithTooltip(__("Activation code", "veiligvertoon"), __("Enter your activation code here. You can find it under the \"Account\" section in your veiligvertoon dashboard at www.veiligvertoon.nl.", "veiligvertoon")),
                    array(self::class, "renderActivationCodeInput"), "veiligvertoonActivation", "veiligvertoonSectionActivation"
            );
        });
    }

    static function renderActivationCodeInput() {
        ?>
        <input type="text" id="activationCode" name="activationCode"
               placeholder="<?php _e("Enter your activation code", "veiligvertoon") ?>" style="width: 450px!important;"/>

        <?php
    }

    /**
     * Renders the veiligvertoon settings into the admin page
     */
    static function renderVeiligvertoonActivationPageContent() {
        if (get_option("veiligvertoonIsDemoUser")) {
            ?>
            <div class="wrap">
                <h1 style="display:block!important"><?php _e("Veiligvertoon settings", "veiligvertoon") ?></h1>
    
                <form id="vv-activationForm" style="width: 800px; display: inline-block">
                    <?php
                    //Output nonce, action, and option_page fields for a settings page.
                    settings_fields("veiligvertoonActivation");
    
                    //Prints out all settings sections added to a particular settings page
                    do_settings_sections("veiligvertoonActivation");
    
                    // Creates the 'save changes' button
                    submit_button(__("Activate Veiligvertoon", "veiligvertoon"));
                    ?>
                </form>
            </div>
            <?php
        } else {
            ?>
            <div class="wrap">
                <h1><?php _e("Veiligvertoon settings" , "veiligvertoon") ?></h1>
                <p><?php _e("You have already activated your account.", "veiligvertoon") ?></p>
            </div>
            <?php
        }
    }

    /**
     * Renders a settings field label with a horizontally centered tooltip
     */
    static function renderLabelWithTooltip($labelText, $tooltipContent){
        return "
        <div style='display: flex;'>
            <div style='width:90%;display: inline-block;'>{$labelText}</div>
            <div style='width:10%;display: inline-block;align-self: center;'>
                <i class='fas fa-question-circle help-icon' data-tippy-content='{$tooltipContent}' style='display: inline-block;'></i></div>
        </div>
        ";
    }
}
