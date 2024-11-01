<?php

class veiligvertoonTour
{
    static function init() {
        // Add plugin action link
        add_filter('plugin_action_links', array(self::class, 'registerTourPluginActionLink'), 10, 2);

        // Add the tour styles & scripts
        self::registerPluginScripts();
        self::registerPluginStyles();
    }

    static function registerTourPluginActionLink($links, $file) {
        if (is_array($links) && 'veiligvertoon/veiligvertoon.php' === $file) {
            $links['_tour'] = '<a href="'.admin_url('edit.php').'?post_type=product" class="js-veiligvertoon-tour">'.__("Start Tour", "veiligvertoon").'</a>';
        }
        return $links;
    }

    /**
     * Register all the tour related custom scripts
     */
    static function registerPluginScripts()
    {
        // Dropzone
        wp_enqueue_script(
            'vv-custom-tour', plugins_url('tour.js', __FILE__), array('jquery'), NULL, false
        );
    }

    /**
     * Register all the tour related custom styles
     */
    static function registerPluginStyles()
    {
        // Shepherd

        wp_enqueue_style('vv-custom-tour', plugins_url('tour.css', __FILE__));
    }
}