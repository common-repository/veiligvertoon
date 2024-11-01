<?php


class veiligvertoonAjaxActionManager
{
    static function initVeiligvertoonAjaxActions()
    {
        // Register all the ajax calls
        add_action('wp_ajax_veiligvertoon_get_credentials', array(self::class, 'getClientCredentials'));
        add_action('wp_ajax_veiligvertoon_upgrade_demo_user', array(self::class, 'upgradeDemoUser'));
        add_action('wp_ajax_save_safety_information_status_data', array(self::class, 'saveSafetyInformationStatusData'));
    }

    /**
     * Function to retrieve the authenticated admin users vv credentials from the database
     */
    static function getClientCredentials()
    {
        // validate if the user is allowed to access the credentials
        if (!VeiligvertoonPageUtil::isAdmin()) {
            echo "unauthorized";
            wp_die();
        }

        // Fetch the clientId & clientSecret from the database
        $clientId = get_option('veiligvertoonClientId');
        $clientSecret = get_option('veiligvertoonClientSecret');

        // clientId or clientSecret has not been set
        if (!$clientId || !$clientSecret) wp_die();

        // echo the credentials and die wp to prevent the default wordpress response of 0
        echo json_encode(["clientId" => $clientId, "clientSecret" => $clientSecret]);
        wp_die();
    }

    /**
     * Function to upgrade the demo user to a full user
     */
    static function upgradeDemoUser()
    {
        update_option("veiligvertoonIsDemoUser", 0);
        update_option("veiligvertoonUserId", sanitize_text_field($_POST['userId']));
    }

    /**
     * Saves the safety information status data associated with a specific safety info record to the db
     * @param $statusData, A json string representing the safety information status data
     */
    static function saveSafetyInformationStatusData()
    {
        update_post_meta(
            sanitize_text_field($_POST['wooCommerceProductId']), 
            "veiligvertoon_safety_information_status_data", 
            sanitize_text_field($_POST['statusData'])
        );
        update_post_meta(
            sanitize_text_field($_POST['wooCommerceProductId']), 
            "veiligvertoon_last_updated", 
            sanitize_text_field($_POST['lastUpdated'])
        );
    }
}
