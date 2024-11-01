<?php


class veiligvertoonAdminProductDetailExtension
{
    static function initAdminProductDetailExtension()
    {
        //add a custom product detail settings tab and populate it with content
        add_filter('woocommerce_product_data_tabs', array(self::class, 'createCustomProductDetailSettingsTab'));
        add_action('woocommerce_product_data_panels', array(self::class, 'renderVeiligvertoonCustomPageContent'));


        //register the custom extension styles / scripts / actions
        self::registerExtensionScripts();
        self::registerExtensionStyles();
    }

    /**
     * Register all the custom/ dependant scripts for the extension
     */
    static function registerExtensionScripts()
    {
        wp_enqueue_script(
            'dynamicElementRenderer',
            plugins_url('js/adminProductDetailExtension/dynamicElementRenderer.js', __FILE__),
            array('jquery'),
            NULL,
            false
        );

        wp_enqueue_script(
            'adminProductDetailExtension',
            plugins_url('js/adminProductDetailExtension/adminProductDetailExtension.js', __FILE__),
            array('jquery'),
            NULL,
            false
        );

        //custom tooltips for the extension
        wp_enqueue_script(
            'custom',
            plugins_url('js/customTooltips.js', __FILE__),
            array('jquery'),
            NULL,
            false
        );
    }

    static function registerExtensionStyles()
    {
        wp_enqueue_style(
            'adminProductDetailExtension',
            plugins_url('css/productDetail.css', __FILE__)
        );
    }

    /**
     * Adds a custom veiligvertoon settings tab to the admin product details page
     * @param $tabs , the current tabs
     * @return mixed
     */
    static function createCustomProductDetailSettingsTab($tabs)
    {
        $tabs['veiligvertoon'] = array(
            'label' => __('Veiligvertoon', 'tpwcp'), // The name of your panel
            'target' => 'veiligvertoon_panel',
            'class' => array('show_if_simple', 'show_if_variable', 'veiligvertoon_tab'),
            'priority' => 10000,
        );
        return $tabs;
    }

    /**
     * Render the content for the custom veiligvertoon page
     */
    static function renderVeiligvertoonCustomPageContent()
    {
?>
        <script>
            localStorage.setItem('veiligvertoonLanguage', '<?php echo esc_js(get_option("veiligvertoonLanguage")) ?>');
        </script>
        <?php
        $product = self::get_current_product();
        ?>
        
        <div id='veiligvertoon_panel' class='panel woocommerce_options_panel hidden'>
            <input type="hidden" id="product_id" name="WooCommerceProductId" value="<?php echo esc_attr(get_the_ID()) ?>">

            <div id="veiligvertoon-tabs">
                <button type="button" class="btn-save-tabs button-primary">
                    <i class="far fa-save"></i><?php _e("Save", "veiligvertoon")?>
                </button>
                <ul id="veiligvertoon-tab-list">
                    <li>
                        <a href="#veiligvertoon-tab-1" id="veiligvertoon-tab-1-label" class="veiligvertoon-tab-anchor">
                            <span class="tab-product-name"><?php echo esc_html($product->name); ?></span>
                        </a>
                        <span class="ui-icon ui-icon-close" role="presentation">Remove Tab</span>
                    </li>
                    <li id="add-tab" class="disable-sort"><a href="#tabs-add" id="add-vv-tab">+</a></li>
                </ul>
                <div id="veiligvertoon-tab-1" class="veiligvertoon-tab" data-product-name="<?php echo esc_attr($product->name) ?>">
                </div>
            </div>
        </div>
<?php
    }

    /**
     * Fetches the product associated with the post id of the current page.
     * @return mixed
     */
    static function get_current_product()
    {
        return wc_get_product(get_the_ID());
    }
}
