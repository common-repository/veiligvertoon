<?php

class VeiligvertoonPageUtil
{
    /**
     * Function responsible for retrieving the current page that is being requested
     * @return int
     */
    static function retrieveCurrentPage(): int
    {
        global $pagenow;
        $post_type = array_key_exists("post_type", $_GET) ? sanitize_text_field($_GET["post_type"]) : null;
        $result = VeiligvertoonPageType::UNKNOWN;

        switch ($pagenow) {
            case "post.php":
                // in case we are on a post page and the post type is "product" we are on a
                // woo commerce product detail page.
                if (get_post_type($_GET['post']) === "product")
                    $result = VeiligvertoonPageType::ADMIN_PRODUCT_DETAIL;
                break;
            case "admin.php":
                // in case we are on the veiligvertoon_settings page in the admin environment
                if (!is_null($_GET['page']) && strpos($_GET['page'], "veiligvertoon-admin-menu") !== false)
                    $result = VeiligvertoonPageType::ADMIN_VEILIGVERTOON_SETTINGS;
                break;
            case "edit.php":
                // in case we are on an edit.php page and the post_type is product we are on the wooCommerce
                // product overview page (with the product datatable)
                if ($post_type === "product")
                    $result = VeiligvertoonPageType::ADMIN_PRODUCT_TABLE;
                break;
            case "index.php":
                $result = VeiligvertoonPageType::PUBLIC_PAGE;
            default:
                // do nothing, leave page type unknown
                break;
        }

        return $result;
    }

    /**
     * Checks if the user is on an admin page
     */
    static function isAdmin() {
        // sometimes the pluggable.php is not loaded at this time, it is a dependency so make sure to load it in this case
        if(!function_exists('wp_get_current_user'))  include(ABSPATH . "wp-includes/pluggable.php");

        // validate if the user is a admin
        return current_user_can('administrator') || current_user_can('manage_options') ||
            current_user_can('edit_posts');
    }
}