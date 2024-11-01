<?php
include(plugin_dir_path(__FILE__) . '../shared/enums/SafetyInformationStatus.php');

class veiligvertoonAdminProductTableExtension
{
    public static function initTableExtension()
    {
        //add the custom table column to the product admin table
        add_filter('manage_edit-product_columns', array(self::class, 'addCustomProductColumn'), 11);
        //populate the column data in the product rows
        add_action('manage_product_posts_custom_column', array(self::class, 'customProductColumnContent'), 10, 2);
        //renders the custom filter input
        add_action('restrict_manage_posts', array(self::class, 'renderCustomProductFilter'));
        //this handles the actual filtering using the custom filter input field
        add_action('pre_get_posts', array(self::class, 'applyCustomProductFilter'));

        //add a custom css class
        add_filter('wc_product_table_custom_class', array(self::class, 'addCustomProductCssClass'), 10, 2);
    }

    /**
     * Adds the custom column to the admin product table
     * @param $columns, the collection of the current columns in the table
     * @return mixed
     */
    static function addCustomProductColumn($columns)
    {
        //add columns
        $columns['veiligvertoon'] = __('Safety Information', 'veiligvertoon');
        return $columns;
    }

    /**
     * Adds custom css classes to the wooCommerce product table.
     * @param $class, the current classes
     * @param $product_table, the table
     * @return string
     */
    static function addCustomProductCssClass($class, $product_table)
    {
        return "table-layout-auto";
    }

    /**
     * Populates the custom column data for all product rows.
     * @param $column
     * @param $product_id
     */
    static function customProductColumnContent($column, $product_id)
    {
        switch ($column) {
            case 'veiligvertoon':
                // define the icon paths
                $logo_path = plugin_dir_url(__FILE__) . '../shared/images/vv_checkmark.svg';
                $pause_icon_path = plugin_dir_url(__FILE__) . '../shared/images/custom-pause.svg';

                // obtain the safety information status data associated with the product
                $safety_information_status_data = get_post_meta($product_id, 'veiligvertoon_safety_information_status_data', true);
                $last_updated = get_post_meta($product_id, 'veiligvertoon_last_updated', true);

                // in case no safety information data is associated with the product just populate the column with "-"
                if (!$safety_information_status_data) {
                    echo "-";
                    break;
                }

                // deserialize the json string containing the status data
                $parsed_status_data = json_decode($safety_information_status_data);
                $active_records = $parsed_status_data->active;
                $total_records = $parsed_status_data->total;

                // determine the desired icon and the active status count based on the active records data
                $icon_path = $active_records > 0 ? $logo_path : $pause_icon_path;
                $active_status_count = $active_records > 0 ? $active_records : $total_records;

                //create and return the html content
                $lastChangedString = __("Last edited", "veiligvertoon");
                $column_content = "<img src='{$icon_path}' style='width: 16px; margin: 0 auto;'>
                              <span class='display-block' style='display:block'>{$active_status_count}/{$total_records}</span>
                              <span class='display-block' style='display:block; margin-top:10px; font-size: 0.85em;'>{$lastChangedString}</span>
                              <span class='display-block' style='display:block; font-size: 0.85em;'>{$last_updated}</span>
                              ";

                echo wp_kses($column_content, [
                    'span' => [
                        'style' => [],
                        'class' => []
                    ],
                    'img' => [
                        'style' => [],
                        'src' => []
                    ]
                ]);
                break;
        }
    }

    /**
     * Makes our custom columns sortable
     * @param $columns
     * @return mixed
     */
    static function makeColumnSortable($columns)
    {
        $columns['veiligvertoon'] = 'veiligvertoon';
        return $columns;
    }

    /**
     * Renders the veiligvertoont custom filter input
     * @param $post_type
     */
    static function renderCustomProductFilter($post_type)
    {
        $value1 = '';
        $value2 = '';

        // Check if filter has been applied already so we can adjust the input element accordingly
        if (isset($_GET['veiligvertoont_filter'])) {
            switch ($_GET['veiligvertoont_filter']) {
                // We will add the "selected" attribute to the appropriate <option> if the filter has already been applied
                case 'ingevuld':
                    $value1 = ' selected';
                    break;

                case 'niet_ingevuld':
                    $value2 = ' selected';
                    break;
            }
        }

        // Check this is the products screen
        if ($post_type == 'product') {
            // Add the veiligvertoont filter input
    ?>
            <select name="veiligvertoont_filter" class="fa-font">
                <option value><?php _e("Show all", "veiligvertoon"); ?></option>
                <option value="ingevuld" <?php echo esc_attr($value1); ?> style="color: green;">
                    &#xf058; <?php _e("Filled", "veiligvertoon"); ?>
                </option>
                <option value="niet_ingevuld" <?php echo esc_attr($value2); ?> style="color: darkred;">
                    &#xf057; <?php _e("Not filled", "veiligvertoon"); ?>
                </option>
            </select>

    <?php
        }
    }


    /**
     * Applies the selected filters and ads them to the query to fetch the post data
     * @param $query
     */
    static function applyCustomProductFilter($query)
    {
        global $pagenow;

        // Ensure it is an edit.php admin page, the filter exists and has a value, and that it's the products page
        if ($query->is_admin && $pagenow == 'edit.php' && isset($_GET['veiligvertoont_filter']) && $_GET['veiligvertoont_filter'] != '' && $_GET['post_type'] == 'product') {
            // Create meta query array and add to WP_Query
            $meta_key_query = array(
                'relation' => 'OR',
                array(
                    'key'     => '_veiligvertoont',
                    'compare' => $_GET['veiligvertoont_filter'] == "ingevuld" ? 'EXISTS' : 'NOT EXISTS',
                    'value'   => ''
                ),
                array(
                    'key'     => '_veiligvertoont',
                    'value'   =>  $_GET['veiligvertoont_filter'] == "ingevuld" ? 1 : 0
                )
            );

            $query->set('meta_query', $meta_key_query);
        }
    }
}
