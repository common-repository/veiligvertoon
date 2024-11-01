<?php


class veiligvertoonProductDetailExtension
{
    //constants
    const LONG_DESCRIPTION_HOOK = "the_content";
    const PRODUCT_DETAIL_TABS_HOOK = "woocommerce_product_tabs";
    const SHORT_DESCRIPTION_HOOK = "woocommerce_short_description";

    static function initProductDetailExtension()
    {
        $safetyInformationDisplayLocation = get_option("veiligvertoonSafetyInformationDisplayLocation");

        switch ($safetyInformationDisplayLocation) {
            case "longDescription":
                add_filter(self::LONG_DESCRIPTION_HOOK, array(self::class, 'renderSafetyInformation'));
                break;
            case "shortDescription":
                add_filter(self::SHORT_DESCRIPTION_HOOK, array(self::class, 'renderSafetyInformation'));
                break;
            case "customLocation":
                break;
            case "customTab":
            default:
                add_filter(self::PRODUCT_DETAIL_TABS_HOOK, array(self::class, 'addCustomProductTab'));
                break;
        }
    }

    /**
     * Validate if the product has safety information
     * @param $wooCommerceProductId
     * @return string
     */
    static function hasSafetyInformation($wooCommerceProductId)
    {
        $safetyInformationStatusData = get_post_meta($wooCommerceProductId, 'veiligvertoon_safety_information_status_data', true);

        if (!$safetyInformationStatusData)
            return false;

        // deserialize the json string containing the status data
        $parsedStatusData = json_decode($safetyInformationStatusData);
        $activeRecords = $parsedStatusData->active ?? 0;

        return $activeRecords > 0;
    }

    /**
     * Render the safety information iframe
     * @param $data
     * @return string
     */
    static function renderSafetyInformation($data, $displayLocation = 2)
    {
        try {
            $wooCommerceProductId = get_the_ID();

            if (!self::hasSafetyInformation($wooCommerceProductId))
                return $data;

            $fontFamily = esc_attr(get_option("veiligvertoonFontFamily"));
            $renderBorder = get_option("veiligvertoonRenderIFrameBorder") == "on" ? "true" : "false";

            # get the font/ background colors, remove the first character (#) before sending it to the server.
            $fontColor = substr(esc_attr(get_option("veiligvertoonFontColor")), 1);
            $backgroundColor = substr(esc_attr(get_option("veiligvertoonBackgroundColor")), 1);

            // if the display location is 2 (aka long description) and the display style is open just communicate to
            // the server we want to render the iframe in the tab format (aka display location 1) which is always open
            $displayStyle = esc_attr(get_option("veiligvertoonDisplayStyle"));
            if ($displayLocation === 2 && $displayStyle === "open")
                $displayLocation = 1;

            $userId = esc_attr(get_option("veiligvertoonUserId"));

            $languageCode = 1;        
            switch(get_option("veiligvertoonLanguage")){
                case "nl":
                    $languageCode = 1;
                    break;
                case "en":
                    $languageCode = 2;
                    break;
                case "de":
                    $languageCode = 3;
                    break;
            }

            return $data . "<iframe id=\"vvframe\" style=\"border: 0px!important; display:none\" height=\"100%\" width=\"100%\" allowtransparency=\"true\" src=\"\" data-source-url=\"" . FRONT_END_BASE_URL . "/safetyinformation/iframe/{$wooCommerceProductId}/{$userId}?displayLocation={$displayLocation}&fontFamily={$fontFamily}&fontColor={$fontColor}&backgroundColor={$backgroundColor}&language={$languageCode}&renderBorder={$renderBorder}\"></iframe>";
        } catch (\Exception $e) {
            return $data;
        } catch (\Error $e) {
            return $data;
        } catch (\Throwable $e) {
            return $data;
        }
    }

    /**
     * Add a new custom WooCommerce product tab on the public product detail page
     * @param $tabs
     * @return mixed
     */
    static function addCustomProductTab($tabs)
    {
        try {

            $wooCommerceProductId = get_the_ID();

            if (!self::hasSafetyInformation($wooCommerceProductId))
                return $tabs;

            $tabTitle = "";
            switch(get_option("veiligvertoonLanguage")){
                case "nl":
                    $tabTitle = "Veiligheidsinformatie";
                    break;
                case "en":
                    $tabTitle = "Safety information";
                    break;
                case "de":
                    $tabTitle = "Sicherheitsinformationen";
                    break;
            }

            // Adds the new tab
            $tabs['desc_tab'] = array(
                'title'     => __($tabTitle, 'woocommerce'),
                'priority'  => 50,
                'callback'  => array(self::class, 'renderCustomProductTabContent')
            );
        } catch (\Exception $e) {
        } catch (\Error $e) {
        } catch (\Throwable $e) {
        }

        return $tabs;
    }

    /**
     * Render the safety information in the custom product tab
     */
    static function renderCustomProductTabContent()
    {
        // The new tab content
        echo wp_kses(self::renderSafetyInformation('', 1), [
            "iframe" => [
                "id" => [],
                "width" => [],
                "height" => [],
                "allowtransparency" => [],
                "src" => [],
                "style" => [],
                "data-source-url" => [],
            ]
        ]);
    }
}
