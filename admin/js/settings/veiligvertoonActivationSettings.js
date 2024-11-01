window.addEventListener("load", async function() {
    // clear the license related cookies in case the license data is updated
    jQuery('#vv-activationForm').on('submit', async function(e) {
        e.preventDefault();

        // Get the authentication code of the authenticated demoUser
        try {
            var accessToken = await authenticate();
        } catch (e) {
            toastr.error(getTranslation('activation-settings-server-connection-error'));
            return;
        }

        // Serialize the formData and extract the activationCode
        const serializedFormData = jQuery("#vv-activationForm").serializeArray();
        const activationCode = serializedFormData.find(item => item.name === "activationCode").value;

        // Create FormData which we can send as multipart/form-data content and add all the required data
        const formData = new FormData();

        formData.append('activationCode', activationCode)

        // Activate the account in the back-end
        const userId = await jQuery.ajax({
            url: `${API_BASE_URL}/api/user/activate`,
            type: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            data: formData,
            contentType: false, // Required to make the multipart/form-data work
            processData: false, // Required to make the multipart/form-data work
        }).then(response => {
            // If the activation was successful, we can upgrade the demo user to an active user
            return response.userId
        })
        .catch(error => {
            if (error.status === 400) {
                toastr.error(getTranslation('activation-settings-invalid-activation-code-error'))
            } else {
                toastr.error(getTranslation('activation-settings-activation-error'))
            }

            // Mark that the activation has failed
            return ""
        })
                
        // Activation failed we return
        if (!userId) return

        // We remove the current authentication cookies so they will be regenerated based on the new 'finalUser'
        deleteAuthCookies();
        
        // upgrade the demo user to an activeted user in the wp database
        await upgradeDemoUserToActiveUser(userId);

        // Show a success message to the user
        toastr.success(getTranslation('activation-settings-activation-success'))
    })
});

/**
 * Flags the user as an active user in the database instead of a demo user
 */
 async function upgradeDemoUserToActiveUser(userId) {
    const response = await jQuery.post(ajaxurl, {'action': 'veiligvertoon_upgrade_demo_user', 'userId': userId}, (response) => response);
    return JSON.parse(response);
}