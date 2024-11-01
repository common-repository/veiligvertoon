<?php

/*
*  This function will validate if the current post has safety information
*
*  @return  (bool)
*/
function veiligvertoon_has_safetyinformation() {
    $safetyInformationDisplayLocation = get_option("veiligvertoonSafetyInformationDisplayLocation");

    if ($safetyInformationDisplayLocation != "customLocation")
        return false;
    
    // filter post_id
	$wooCommerceProductId = get_the_ID();

    $safetyInformationStatusData = get_post_meta($wooCommerceProductId, 'veiligvertoon_safety_information_status_data', true);

    if (!$safetyInformationStatusData)
        return false;
            
    // deserialize the json string containing the status data
    $parsedStatusData = json_decode($safetyInformationStatusData);
    $activeRecords = $parsedStatusData->active ?? 0;

    return $activeRecords > 0;
}

/*
*  This function will render the safety information
*
*  @return  (mixed)
*/
function veiligvertoon_render_safety_information( $displayLocation = 2) {
    try {
        $wooCommerceProductId = get_the_ID();

        if (!veiligvertoon_has_safetyinformation())
            return null;

        $fontFamily = esc_attr(get_option("veiligvertoonFontFamily"));
        $renderBorder = get_option("veiligvertoonRenderIFrameBorder") == "on" ? "true" : "false";

        # get the font/ background colors, remove the first character (#) before sending it to the server.
        $fontColor = substr(esc_attr(get_option("veiligvertoonFontColor")), 1);
        $backgroundColor = substr(esc_attr(get_option("veiligvertoonBackgroundColor")), 1);

        // if the display location is 2 (aka long description) and the display style is open just communicate to
        // the server we want to render the iframe in the tab format (aka display location 1) which is always open
        $displayStyle = esc_attr(get_option("veiligvertoonDisplayStyle"));
        if ($displayStyle === "open")
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
    
        $iframeElement = "<iframe id=\"vvframe\" style=\"border: 0px!important; display:none\" height=\"100%\" width=\"100%\" allowtransparency=\"true\" src=\"\" data-source-url=\"" . FRONT_END_BASE_URL . "/safetyinformation/iframe/{$wooCommerceProductId}/{$userId}?displayLocation={$displayLocation}&fontFamily={$fontFamily}&fontColor={$fontColor}&backgroundColor={$backgroundColor}&language={$languageCode}&renderBorder={$renderBorder}\"></iframe>";

        return $iframeElement;
    } catch (\Exception $e) {
        return null;
    } catch (\Error $e) {
        return null;
    } catch (\Throwable $e) {
        return null;
    }
}