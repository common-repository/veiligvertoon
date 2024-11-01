<?php

include(plugin_dir_path(__FILE__) . '/veiligvertoonStylingSettingPage.php');
include(plugin_dir_path(__FILE__) . '/veiligvertoonActivationPage.php');

class adminVeiligvertoonSettings
{
    public static function initVeiligvertoonSettings()
    {
        self::registerExtensionScripts();
        self::registerPluginStyle();
        veiligvertoonStylingSettingPage::initStylingSettingPage();
        veiligvertoonActivationPage::initActivationPage();
    }

    static function registerVeiligvertoonMenuItem()
    {
        //adds a custom menu item
        add_action('admin_menu', array(self::class, 'veiligVertoonAdminMenuOption'));
    }

    /**
     * Register all the custom/ dependant scripts for the extension
     */
    static function registerExtensionScripts()
    {
        // load the required js files based on the current settings page
        switch ($_GET['page']){
            case "veiligvertoon-admin-menu-styling":
                // veiligvertoon settings page js
                wp_enqueue_script(
                    'vv-settings',
                    plugins_url('../js/settings/veiligvertoonStylingSettings.js', __FILE__),
                    array('jquery'),
                    NULL,
                    false
                );
                break;
            case "veiligvertoon-admin-menu-license":
                // veiligvertoon settings page js
                wp_enqueue_script(
                    'vv-settings',
                    plugins_url('../js/settings/veiligvertoonLicenseSettings.js', __FILE__),
                    array('jquery'),
                    NULL,
                    false
                );
                break;
            case "veiligvertoon-admin-menu-activation":
                // veiligvertoon settings page js
                wp_enqueue_script(
                    'vv-settings',
                    plugins_url('../js/settings/veiligvertoonActivationSettings.js', __FILE__),
                    array('jquery'),
                    NULL,
                    false
                );
                break;
            default:
                break;
        }

        wp_enqueue_script(
            'vv-select2',
            plugins_url('../../shared/lib/select2/select2.min.js', __FILE__),
            array('jquery'),
            NULL,
            false
        );

        wp_enqueue_script(
            'vv-colorpicker',
            plugins_url('../../shared/lib/coloris-colorpicker/coloris.min.js', __FILE__),
            array('jquery'),
            NULL,
            false
        );
        // tippy tooltips
        wp_enqueue_script(
            'custom',
            plugins_url('../js/customTooltips.js', __FILE__),
            array( 'jquery' ),
            NULL,
            false
        );
    }

    static function registerPluginStyle()
    {
        wp_enqueue_style('vv-select-2', plugins_url('../../shared/lib/select2/select2.min.css', __FILE__));
        wp_enqueue_style('vv-settings', plugins_url('../css/veiligvertoonSettings.css', __FILE__));
        wp_enqueue_style('vv-colorpicker', plugins_url('../../shared/lib/coloris-colorpicker/coloris.min.css', __FILE__));
    }

    /**
     * Adds a custom menu option to the wordpress admin navigation menu
     */
    static function veiligVertoonAdminMenuOption()
    {
        // add the parent menu
        add_menu_page(
            'Veiligvertoon', 'Veiligvertoon', 'manage_options',
            'veiligvertoon-admin-menu', array(veiligvertoonStylingSettingPage::class, 'renderVeiligvertoonStylingPageContent'),
            'dashicons-yes-alt', 70
        );

        // add the sub menu items
        add_submenu_page('veiligvertoon-admin-menu', 'Veiligvertoon styling', 'Styling', 'manage_options',
            'veiligvertoon-admin-menu-styling', array(veiligvertoonStylingSettingPage::class, 'renderVeiligvertoonStylingPageContent'), 1);

        add_submenu_page('veiligvertoon-admin-menu', __('Veiligvertoon Activation', 'veiligvertoon'), __('Activation', 'veiligvertoon'), 'manage_options',
            'veiligvertoon-admin-menu-activation', array(veiligvertoonActivationPage::class, 'renderVeiligvertoonActivationPageContent'), 2);

        // the parent is also automatically added to the sub menu, we dont want this so remove it
        remove_submenu_page('veiligvertoon-admin-menu', 'veiligvertoon-admin-menu');
    }
}
