<?php
/*
Plugin Name: Veiligvertoon | Safety information management for WooCommerce
Description: Veiligvertoon plugin.
Version: 1.2.0
Author: VeiligVertoon
Author URI: https://veiligvertoon.nl
License: GPLv2 or later
Text Domain: veiligvertoon
Domain Path: /languages

*/
defined('ABSPATH') or die('Not allowed');

include(plugin_dir_path(__FILE__) . 'admin/veiligvertoonAdminProductTableExtension.php');
include(plugin_dir_path(__FILE__) . 'admin/settings/adminVeiligvertoonSettings.php');
include(plugin_dir_path(__FILE__) . 'admin/veiligvertoonAdminProductDetailExtension.php');
include(plugin_dir_path(__FILE__) . 'admin/veiligvertoon-tour/veiligvertoonTour.php');
include(plugin_dir_path(__FILE__) . 'public/veiligvertoonProductDetailExtension.php');
include(plugin_dir_path(__FILE__) . 'shared/manager/VeiligvertoonAjaxActionManager.php');
include(plugin_dir_path(__FILE__) . 'shared/enums/VeiligvertoonPageType.php');
include(plugin_dir_path(__FILE__) . 'shared/util/veiligvertoonPageUtil.php');
include(plugin_dir_path(__FILE__) . 'constants.php');
include(plugin_dir_path(__FILE__) . 'api/veiligvertoon-api.php');

if (!function_exists('get_plugin_data')) {
    require_once(ABSPATH . 'wp-admin/includes/plugin.php');
}

function show_fatal_error_notice()
{
?>
    <div class="error notice">
        <p><?php _e('An unexpected error occured within the Veiligvertoon plugin.</br></br>Please contact "support@veiligvertoon.nl" and try to update the plugin to the latest version.'); ?></p>
    </div>
    <?php
}

function get_plugin_version()
{
    $plugin_data = get_plugin_data(plugin_dir_path(__FILE__) . "/veiligvertoon.php");
    $plugin_version = $plugin_data['Version'];

    return $plugin_version; // This will output your plugin version
}

define('PLUGIN_VERSION', get_plugin_version());

if (!class_exists('VeiligVertoon_Plugin')) {
    class VeiligVertoon_Plugin
    {
        function __construct()
        {
            // start the tour the first time after the plugin has been activated
            if (get_option('veiligvertoon_plugin_activated')) {
                delete_option('veiligvertoon_plugin_activated');

    ?>
                <script>
                    localStorage.setItem('veiligvertoonTourIsActive', true);
                    window.location.replace("<?php echo esc_url(admin_url('edit.php') . '?post_type=product') ?>")
                    
                </script>
<?php
            }

            // create a cookie with the current wp language so we can access this client-side
            $currentWpLanguage = get_option('WPLANG');
            setcookie("veiligvertoon-wp-lang", $currentWpLanguage == "" ? "en_US" : $currentWpLanguage, 0, "/");

            // if no credentials are present in the db yet make sure to create a new demo user
            if (!get_option("veiligvertoonClientId") && !get_option("veiligvertoonClientSecret")) {
                $this->registerDemoUser();
            }

            // register plugin hooks
            register_activation_hook(__FILE__, array($this, 'initPluginActivation'));

            // obtain the current page
            $currentPageIndicator = VeiligvertoonPageUtil::retrieveCurrentPage();

            // initialize the ajax actions and the ajax manager
            // authorization is handled in the registered actions themself
            veiligvertoonAjaxActionManager::initVeiligvertoonAjaxActions();

            // initalize the localization configuration
            add_action('plugins_loaded', array($this, 'veiligvertoon_load_textdomain'));

            $isPublicPage = false;
            // register the page specific dependencies
            switch ($currentPageIndicator) {
                case VeiligvertoonPageType::ADMIN_PRODUCT_DETAIL:
                    veiligvertoonAdminProductDetailExtension::initAdminProductDetailExtension();
                    break;
                case VeiligvertoonPageType::ADMIN_PRODUCT_TABLE:
                    veiligvertoonAdminProductTableExtension::initTableExtension();
                    break;
                case VeiligvertoonPageType::ADMIN_VEILIGVERTOON_SETTINGS:
                    adminVeiligvertoonSettings::initVeiligvertoonSettings();
                    break;
                case VeiligvertoonPageType::PUBLIC_PAGE:
                    veiligvertoonProductDetailExtension::initProductDetailExtension();
                    $isPublicPage = true;
                    break;
                case VeiligvertoonPageType::UNKNOWN:
                default:
                    // do nothing
                    break;
            }

            // make sure to whitelist all required database options so they can be interacted with
            $this->whitelistDatabaseOptions();

            if (!$isPublicPage) {
                // in case the user downgraded his plan make sure to schedule a 
                // product statusses sync (since this might have turned off some of his products)
                $this->scheduleProductStatussesSyncOnDowngrade();

                // register the custom menu items
                adminVeiligvertoonSettings::registerVeiligvertoonMenuItem();

                //register the custom plugin styles/ scripts
                $this->registerPluginStyle();
                $this->registerPluginScripts();

                // register/ initialize the admin page specific dependencies
                if (VeiligvertoonPageUtil::isAdmin()) {
                    // initialize the tour
                    veiligvertoonTour::init();
                }
            } else {
                // custom js
                wp_enqueue_script(
                    'veiligvertoon',
                    plugins_url('public/js/veiligvertoonPublic.js', __FILE__),
                    array('jquery'),
                    PLUGIN_VERSION,
                    false
                );
                // constants
                wp_enqueue_script(
                    'vv-constants',
                    plugins_url('shared/js/constants.js', __FILE__),
                    array(),
                    PLUGIN_VERSION,
                    false
                );
            }
        }

        /**
         * Authenticates the user and returns an accessToken
         */
        static function authenticate()
        {
            // Create the body containing the clientId & clientSecret
            $body = array(
                "ClientId" => get_option("veiligvertoonClientId"),
                "ClientSecret" => get_option("veiligvertoonClientSecret")
            );

            $args = array(
                'body'        => json_encode($body),
                'timeout'     => '5',
                'redirection' => '5',
                'httpversion' => '1.0',
                'blocking'    => true,
                'headers'     => [
                    'Content-Type' => 'application/json'
                ],
                'cookies'     => array(),
            );

            $response = wp_remote_post(API_BASE_URL . "/api/auth/authenticate", $args);

            // Check if the server responded with an OK status code
            if (wp_remote_retrieve_response_code($response) != 200) {
                return;
            }

            // Extract the accessToken from the response body
            $accessToken = json_decode($response["body"])->access_token;

            return $accessToken;
        }

        /**
         * Whitelist the required custom database options so they can be added and interacted with in the db
         */
        function whitelistDatabaseOptions()
        {
            add_action('admin_init', function () {
                //register the setting (option) records in the database
                register_setting("veiligvertoonLicense", "veiligvertoonClientId");
                register_setting("veiligvertoonLicense", "veiligvertoonClientSecret");
                register_setting("veiligvertoonLicense", "veiligvertoonUserId");
                register_setting("veiligvertoonLicense", "veiligvertoonIsDemoUser", ["default" => 1]);
                register_setting("veiligvertoonStyling", "veiligvertoonFontFamily", ["default" => "Lato"]);
                register_setting("veiligvertoonStyling", "veiligvertoonDisplayStyle", ["default" => "closed"]);
                register_setting("veiligvertoonStyling", "veiligvertoonBackgroundColor", ["default" => "#FFFFFF"]);
                register_setting("veiligvertoonStyling", "veiligvertoonFontColor", ["default" => "#000000"]);
                register_setting("veiligvertoonStyling", "veiligvertoonSafetyInformationColorTheme", ["default" => "lightTheme"]);
                register_setting("veiligvertoonStyling", "veiligvertoonSafetyInformationDisplayLocation", ["default" => "customTab"]);
                register_setting("veiligvertoonStyling", "veiligvertoonRenderIFrameBorder", ["default" => "off"]);
                register_setting("veiligvertoonStyling", "veiligvertoonLanguage", ["default" => "nl"]);
            });
        }

        /**
         * Add the attribute data-auto-replace-svg to the font-awesome script tag. By adding this the svg is being
         * loaded inside the i tag instead of replaced. This makes it dynamically compatible with JQuery.
         * See: https://fontawesome.com/v5.15/how-to-use/on-the-web/using-with/jquery
         *
         * @param $tag      The script tag
         * @param $handle   Name of the script which is being imported
         */
        function addFontAwesomeDataAttribute($tag, $handle)
        {
            if ('vv-font-awesome' !== $handle)
                return $tag;

            return str_replace(' src', ' data-auto-replace-svg="nest" src', $tag);
        }

        /**
         * Register a new demo user in the back-end and save the clientId & clientSecret to the database
         */
        function registerDemoUser()
        {
            $response = wp_remote_post(API_BASE_URL . "/api/user/registerDemoUser");

            // Check if the server responded with an OK status code
            if (wp_remote_retrieve_response_code($response) != 200) {
                return;
            }

            $demoUserCredentials = json_decode($response["body"], true);

            update_option("veiligvertoonClientId", $demoUserCredentials["clientId"]);
            update_option("veiligvertoonClientSecret", $demoUserCredentials["clientSecret"]);
            update_option("veiligvertoonUserId", $demoUserCredentials["userId"]);
        }

        /**
         * Register a new demo user in the back-end and save the clientId & clientSecret to the database
         */
        static function unregisterDemoUser()
        {
            $args = array(
                "timeout"     => "5",
                "redirection" => "5",
                "httpversion" => "1.0",
                "blocking"    => true,
                "headers"     => [
                    "Content-Type" => "application/json",
                    "Authorization" => "Bearer " . self::authenticate()
                ],
                "cookies"     => array(),
            );

            $response = wp_remote_post(API_BASE_URL . "/api/user/unregisterDemoUser", $args);

            delete_option("veiligvertoonClientId");
            delete_option("veiligvertoonClientSecret");
        }

        /**
         * initialize/ configure everything required for the plugin
         */
        function initPluginActivation()
        {
            // Enable the tour by setting a marker in the localStorage
            add_option('veiligvertoon_plugin_activated', 'true');
        }

        /**
         * Handles the deactivation of the plugin.
         *  1. Unregister the demo user
         *  2. Remove the VV settings from the database
         */
        static function handlePluginUninstall()
        {
            self::unregisterDemoUser();

            // unregister the vv settings from the database
            unregister_setting("veiligvertoonLicense", "veiligvertoonClientId");
            unregister_setting("veiligvertoonLicense", "veiligvertoonClientSecret");
            unregister_setting("veiligvertoonLicense", "veiligvertoonUserId");
            unregister_setting("veiligvertoonLicense", "veiligvertoonIsDemoUser");
            unregister_setting("veiligvertoonStyling", "veiligvertoonFontFamily");
            unregister_setting("veiligvertoonStyling", "veiligvertoonDisplayStyle");
            unregister_setting("veiligvertoonStyling", "veiligvertoonBackgroundColor");
            unregister_setting("veiligvertoonStyling", "veiligvertoonFontColor");
            unregister_setting("veiligvertoonStyling", "veiligvertoonSafetyInformationColorTheme");
            unregister_setting("veiligvertoonStyling", "veiligvertoonSafetyInformationDisplayLocation");
            unregister_setting("veiligvertoonStyling", "veiligvertoonRenderIFrameBorder");
            unregister_setting("veiligvertoonStyling", "veiligvertoonLanguage");

            // remove the vv settings from the database
            delete_option("veiligvertoonClientId");
            delete_option("veiligvertoonClientSecret");
            delete_option("veiligvertoonUserId");
            delete_option("veiligvertoonIsDemoUser");
            delete_option("veiligvertoonFontFamily");
            delete_option("veiligvertoonDisplayStyle");
            delete_option("veiligvertoonBackgroundColor");
            delete_option("veiligvertoonFontColor");
            delete_option("veiligvertoonSafetyInformationColorTheme");
            delete_option("veiligvertoonSafetyInformationDisplayLocation");
            delete_option("veiligvertoonRenderIFrameBorder");
            delete_option("veiligvertoonLanguage");

            // delete all the vv related post meta data from the database
            delete_post_meta_by_key('veiligvertoon_safety_information_status_data');
            delete_post_meta_by_key('veiligvertoon_last_updated');
        }

        /**
         * Registers all custom/ dependant plugin styles
         */
        function registerPluginStyle()
        {
            //font-awesome
            wp_enqueue_script('vv-font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/js/all.min.js', array(), PLUGIN_VERSION);
            wp_enqueue_style('vv-font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css', array(), PLUGIN_VERSION);

            //dropzone
            wp_enqueue_style('vv-dropzone', plugins_url('shared/lib/dropzone/dist/dropzone.css', __FILE__), array(), PLUGIN_VERSION);

            //tippyToolTips - animations
            wp_enqueue_style('vv-tippy-animations', plugins_url('shared/lib/tippy/scale.css',  __FILE__), array(), PLUGIN_VERSION);

            // JQueryUI
            wp_enqueue_style('jquery-ui-tabs', null, array(), PLUGIN_VERSION);

            // toastr
            wp_enqueue_style('vv-toastr', plugins_url('shared/lib/toastr/toastr.min.css', __FILE__), array(), PLUGIN_VERSION);

            // JQuery Confirm
            wp_enqueue_style('vv-jquery-confirm', plugins_url('shared/lib/jquery-confirm/jquery-confirm.min.css', __FILE__), array(), PLUGIN_VERSION);

            // Parsley
            wp_enqueue_style('vv-parsley', plugins_url('shared/lib/parsley/parsley.css', __FILE__), array(), PLUGIN_VERSION);

            // Shepherd
            wp_enqueue_style('vv-shepherd', plugins_url('shared/lib/shepherd-js/shepherd.css', __FILE__), array(), PLUGIN_VERSION);

            //custom css
            wp_register_style('veiligvertoon', plugins_url('admin/css/veiligvertoon.css', __FILE__), array(), PLUGIN_VERSION);
            wp_enqueue_style('veiligvertoon');
        }


        /**
         * Register all the custom/ dependant plugin scripts
         */
        function registerPluginScripts()
        {
            wp_enqueue_script(
                'vv-constants',
                plugins_url('shared/js/constants.js', __FILE__),
                array(),
                PLUGIN_VERSION,
                false
            );

            //tippy.js
            wp_enqueue_script('vv-tippytools', plugins_url('shared/lib/tippy/popper.min.js', __FILE__), array(), PLUGIN_VERSION);
            wp_enqueue_script('vv-tippy', plugins_url('shared/lib/tippy/tippy-bundle.umd.js', __FILE__), array(), PLUGIN_VERSION);

            //dropzone
            wp_enqueue_script(
                'vv-dropzone',
                plugins_url('shared/lib/dropzone/dist/dropzone.js', __FILE__),
                array('jquery'),
                PLUGIN_VERSION,
                false
            );

            //autosize.js
            wp_enqueue_script('vv-autosize', plugins_url('shared/lib/autosize/dist/autosize.js', __FILE__), array(), PLUGIN_VERSION);

            // JQueryUI
            wp_enqueue_script('jquery-ui-tabs', null, array('jquery-ui-core', 'jquery'), PLUGIN_VERSION, false);

            // toastr
            wp_enqueue_script(
                'vv-toastr',
                plugins_url('shared/lib/toastr/toastr.min.js', __FILE__),
                array('jquery'),
                PLUGIN_VERSION,
                false
            );

            // JQuery Confirm
            wp_enqueue_script(
                'vv-jquery-confirm',
                plugins_url('shared/lib/jquery-confirm/jquery-confirm.min.js', __FILE__),
                array('jquery'),
                PLUGIN_VERSION,
                false
            );

            // Parsley
            wp_enqueue_script(
                'vv-parsley',
                plugins_url('shared/lib/parsley/parsley.min.js', __FILE__),
                array('jquery'),
                PLUGIN_VERSION,
                false
            );

            // custom js
            wp_enqueue_script(
                'veiligvertoon',
                plugins_url('shared/js/veiligvertoon.js', __FILE__),
                array('jquery', 'vv-dropzone'),
                PLUGIN_VERSION,
                false
            );

            // cookie utils
            wp_enqueue_script(
                'cookie-util',
                plugins_url('shared/js/util/cookieUtil.js', __FILE__),
                array('jquery'),
                PLUGIN_VERSION,
                false
            );

            wp_enqueue_script(
                'vv-shepherd',
                plugins_url('shared/lib/shepherd-js/shepherd.min.js', __FILE__),
                array('jquery'),
                PLUGIN_VERSION,
                false
            );

            add_filter('script_loader_tag', array($this, 'addFontAwesomeDataAttribute'), 10, 2);

            $variable_to_js = [
                'ajax_url' => admin_url('shared/manager/veiligvertoonServerManager.php')
            ];
            wp_localize_script('veiligvertoon', 'Theme_Variables', $variable_to_js);

            //register the global admin scripts
            if (VeiligvertoonPageUtil::isAdmin()) {
                wp_enqueue_script(
                    'vv-auth',
                    plugins_url('admin/js/authManager.js', __FILE__),
                    array('jquery', 'veiligvertoon'),
                    PLUGIN_VERSION,
                    false
                );
            }
        }

        /**
         * Schedules a product status sync in case the user has downgraded his plan
         */
        function scheduleProductStatussesSyncOnDowngrade()
        {
            $response = wp_remote_get(
                API_BASE_URL . "/api/user/productBalance",
                array(
                    'headers' => array(
                        "Authorization" => "Bearer " . self::authenticate()
                    )
                )
            )["body"];

            $newProductBalance = intval($response);
            $currentProductBalance = intval(get_option('veiligvertoon_product_balance', 0));

            update_option('veiligvertoon_product_balance', $newProductBalance);

            add_action('veiligvertoon_sync_product_statusses', array($this, 'syncProductStatusses'));

            // check if the user downgraded
            if ($newProductBalance < $currentProductBalance) {
                //Remove existing cron event for this post if one exists and scheduele a new one
                wp_clear_scheduled_hook('veiligvertoon_sync_product_statusses');
                wp_schedule_single_event(time(), 'veiligvertoon_sync_product_statusses');
            }
        }

        /**
         * Performs the product status sync
         */
        function syncProductStatusses()
        {
            $response = wp_remote_get(
                API_BASE_URL . "/api/SafetyInformation/productStatusInfo",
                array(
                    'headers' => array(
                        'Content-Type' => 'application/json; charset=utf-8',
                        'Authorization' => "Bearer " . self::authenticate()
                    )
                )
            )["body"];

            // Convert the response string to an array
            $response = json_decode($response, true);

            foreach ($response as $statusInfo) {
                $wooCommerceProductId = $statusInfo['wooProductId'];

                update_post_meta($wooCommerceProductId, "veiligvertoon_safety_information_status_data", json_encode(array(
                    "active" => $statusInfo['active'],
                    "total" => $statusInfo['total'],
                )));
            }
        }

        // load the text domain (translation files) for localization
        function veiligvertoon_load_textdomain() {
            load_plugin_textdomain('veiligvertoon', false, dirname(plugin_basename(__FILE__)) . '/languages/');
        }
    }
}

if (class_exists('VeiligVertoon_Plugin')) {
    try {
        $veiligvertoon = new VeiligVertoon_Plugin();
    } catch (\Exception $e) {
        add_action('admin_notices', 'show_fatal_error_notice');
    } catch (\Error $e) {
        add_action('admin_notices', 'show_fatal_error_notice');
    } catch (\Throwable $e) {
        add_action('admin_notices', 'show_fatal_error_notice');
    }
}