<?php
// This magic file is automatically called when the user uninstalls the plugin

// import veiligvertoon.php
include(plugin_dir_path(__FILE__) . 'veiligvertoon.php');
try {
    // call the uninstall function
    VeiligVertoon_Plugin::handlePluginUninstall();
} catch (Exception $e) {
    
}
?>