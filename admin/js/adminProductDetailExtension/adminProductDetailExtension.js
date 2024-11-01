const NEW_TAB_LABEL_TEXT = "Nieuw product";
const PAGE_SIZE = 20;

const veiligvertoonLanguage = localStorage.getItem("veiligvertoonLanguage") || "nl";
const SignalWord = {
    WARNING: veiligvertoonLanguage == "nl" ? "Waarschuwing" : (veiligvertoonLanguage == "en" ? "Warning" : "Achtung"),
    DANGER: veiligvertoonLanguage == "nl" ? "Gevaar" : (veiligvertoonLanguage == "en" ? "Danger" : "Gefahr"),
}

const CustomStatementType = {
    1: "H",
    2: "P",
}

const VeiligvertoonLanguageType = {
    NL: 1,
    EN: 2,
    DE: 3
}

// the safety information statuses
const SAFETY_INFORMATION_STATUS_ACTIVE = 1;
const SAFETY_INFORMATION_STATUS_PAUSED = 2;

window.addEventListener("load", async function () {
    // start the auth handler, make sure to await it
    try {
        await startAuthHandler();
    } catch (error) {
        console.log(error);
    }

    const veiligvertoonLanguage = localStorage.getItem("veiligvertoonLanguage") || "nl";
    var veiligvertoonLanguageCode = 1;
    switch (veiligvertoonLanguage) {
        case "nl":
            veiligvertoonLanguageCode = VeiligvertoonLanguageType.NL;
            break;
        case "en":
            veiligvertoonLanguageCode = VeiligvertoonLanguageType.EN;
            break;
        case "de":
            veiligvertoonLanguageCode = VeiligvertoonLanguageType.DE;
            break;
    }

    const firstTabContainer = jQuery("#veiligvertoon-tab-1")
    safetyInformationTabData = veiligvertoonRenderSafetyInformationForm(
        "veiligvertoon-tab-1",
        firstTabContainer.data("productName"),
        veiligvertoonLanguage
    )

    // Add the safetyInformationTabData to the first tab container
    firstTabContainer.append(safetyInformationTabData);

    initializeForm = async function (containerSelector) {
        jQuery(containerSelector).find('.selectWoo').selectWoo({
            placeholder: getTranslation("productDetail-selectSignalword"),
            containerCssClass: 'veiligvertoon-select',
            width: 'resolve',
        });

        // HAZARD STATEMENTS
        // Initialize select2 on the H-Statement select
        hStatementSelectWoo = jQuery(containerSelector).find('.select-h-statement').selectWoo({
            placeholder: getTranslation("productDetail-selectHStatement"),
            containerCssClass: 'veiligvertoon-select',
            width: 'resolve',
            ajax: {
                headers: {
                    "Content-Type": "application/json",
                },
                url: `${API_BASE_URL}/api/hazardStatement/getAll`,
                delay: 1000,
                data: function (params) {
                    var query = {
                        search: params.term,
                        page: params.page || 1,
                        pageSize: PAGE_SIZE,
                        language: veiligvertoonLanguageCode
                    }

                    // Query parameters will be ?search=[term]&page=[page]
                    return query;
                },
                beforeSend: function (request, options) {
                    request.setRequestHeader("Authorization", `Bearer ${getCookie(ACCESS_TOKEN_COOKIE_KEY)}`);
                }
            },
            // Custom tag content only displaying the H-code
            templateSelection: (item) => item.id
        }).on('select2:select', async function (e) {
            // Get the data attributes from the selected element
            const hStatement = e.params.data;

            // Render the h-statement
            const hStatementElement = veiligvertoonRenderStatementText(
                hStatement.rawStatement,
                hStatement.id,
                hStatement.placeholderValues || []
            );

            jQuery(this).parents('.veiligvertoon_container')
                .find('.h-statements-table')
                .append(hStatementElement);
            initializeTooltips(`.${hStatement.id}-tooltip`);

            // Select the container holding the GHS labels
            const ghsLabelContainer = jQuery(this).parents('.veiligvertoon_container')
                .find(".ghs-labels-container");

            // Add the GHS Labels related to the H-Statement
            hStatement.ghsLabels.forEach(ghsLabelUrl => {
                // Check if the ghsLabel hasn't been selected yet
                if (!ghsLabelContainer.find(`img[src="${ghsLabelUrl}"]`).length) {
                    // Add the GHS Label
                    ghsLabelContainer.append(`<img src=${ghsLabelUrl} />`)
                }
            });

            // Hide the placeholder for the placeholder
            if (ghsLabelContainer.find("img").length) {
                ghsLabelContainer.find(".ghs-labels-placeholder").hide();
            }

            const veiligvertoonContainer = jQuery(this).parents('.veiligvertoon_container');
            const signalWordSelect = veiligvertoonContainer.find(`[name="SignalWord"]`);
            // Determine the signal word
            const signalWords = jQuery(this).selectWoo("data").map(hStatement => hStatement.signalWord);

            // If there are no signalWords linked to one of the selected statements (or there are none selected).
            // then we will clear the signalword
            if (!signalWords) signalWordSelect.val(null).trigger("change");

            // If the array of signal words contains DANGER then the signal word will be set to danger. Since this is
            // the 'highest' prio signalword
            else if (signalWords.includes("DANGER"))
                signalWordSelect.val(SignalWord.DANGER).trigger("change");

            // Only statements with signalword WARNING have been selected. Select this signalword
            else
                signalWordSelect.val(SignalWord.WARNING).trigger("change");

            // When autoSelectPStatements is set to false we won't automatically fill the p statements related to the
            // H statement
            if (e.params.autoSelectPStatements === false) return

            // Get the P-Statements which are currently selected
            const pStatementsSelect = veiligvertoonContainer.find(".select-p-statement");

            const selectedPStatements = pStatementsSelect.val();

            // Check which P-Statements linked to the H-Statement have not been selected yet
            let difference = hStatement.precautionaryStatements.filter(x => !selectedPStatements.includes(x));

            // Add the related P-Statements to the select since the options are not yet present in the select because
            // of the ajax datasource
            jQuery.ajax({
                url: `${API_BASE_URL}/api/precautionaryStatement`,
                type: "GET",
                headers: {
                    "Authorization": `Bearer ${getCookie(ACCESS_TOKEN_COOKIE_KEY)}`,
                    "Content-Type": "application/json",
                },
                data: {
                    code: difference,
                    language: veiligvertoonLanguageCode
                },
                traditional: true
            }).then(function (pStatements) {
                // Obtain the select2 dataAdapter with which we can create and add options to the select2 element
                const dataAdapter = pStatementsSelect.data("select2").dataAdapter;

                // Add all the related pStatements
                pStatements.forEach((pStatement) => {
                    // Create the option and append to Select2 in case the option does not yet exist (ajax datasource)
                    if (!pStatementsSelect.selectWoo("data").find(option => option.id === pStatement.id)) {
                        dataAdapter.addOptions(dataAdapter.convertToOptions([pStatement]));
                    }

                    // Add the option to the selected items & trigger the 'select' event, if it hasn't been selected yet
                    if (!pStatementsSelect.val().includes(pStatement.id)) {
                        pStatementsSelect.val([...pStatementsSelect.val(), pStatement.id]).trigger("change");

                        // manually trigger the `select2:select` event
                        pStatementsSelect.trigger({
                            type: 'select2:select',
                            params: {
                                data: pStatement
                            }
                        });
                    }
                })
            })

            pStatementsSelect.val([...selectedPStatements, ...difference]).trigger("change");

            // Trigger a select action on the p-statements select element. This will add the related p-statements
            // to the table
            pStatementsSelect.selectWoo('data').forEach(pStatement => {
                if (!difference.includes(pStatement.id)) return;

                jQuery(".select-p-statement").trigger({
                    type: "select2:select",
                    params: {
                        data: pStatement
                    }
                })
            });
        }).on('select2:unselect', function (e) {
            // Get the data attributes from the unselected element
            const data = e.params.data;

            // Remove the deselected H-Statement from the table
            jQuery(this).parents('.veiligvertoon_container').find(`.h-statements-table #${data.id.replaceAll("+", "-")}`).remove();

            // Obtain the h-statements that are still selected
            let selectedHStatements = jQuery(this).selectWoo('data');

            // Loop over the currently selected H-Statements & obtain the GHS labels related to them.
            const requiredGHSLabels = []
            selectedHStatements.forEach(selectedHStatement => requiredGHSLabels.push(...selectedHStatement.ghsLabels))

            // Select the container holding the GHS labels
            const ghsLabelContainer = jQuery(this).parents('.veiligvertoon_container')
                .find(".ghs-labels-container");

            // Loop over the ghs labels associated with the removed h-statement and validate if it should be deleted
            data.ghsLabels.forEach(ghsLabelUrl => {
                if (!requiredGHSLabels.includes(ghsLabelUrl))
                    ghsLabelContainer.find(`img[src="${ghsLabelUrl}"]`).remove();
            });

            if (!ghsLabelContainer.find("img").length) {
                ghsLabelContainer.find(".ghs-labels-placeholder").show();
            }
        }).on('change.select2', function (e) {
            // Trigger input event so parsley updates validation
            jQuery(this).trigger('input');

            // Reinitailize the validation
            jQuery(this).parsley().validate();

            // Get the pStatement Select element and the associated clear button
            const pStatementSelectContainer = jQuery(this).parents('.veiligvertoon_container')
                .find(".h-statements-select-container");
            const pStatementSelect = pStatementSelectContainer.find(".select-h-statement");
            const clearButton = pStatementSelectContainer.find(".btn-clear-items");

            // Show the clear button if values are selected
            if (pStatementSelect.val().length) clearButton.show()
            // Hide the clear button
            else clearButton.hide()
        });

        // PRECAUTIONARY STATEMENTS
        // Initialize select2 on the H-Statement select
        pStatementSelectWoo = jQuery(containerSelector).find('.select-p-statement').selectWoo({
            placeholder: getTranslation("productDetail-selectPStatement"),
            containerCssClass: 'veiligvertoon-select',
            width: 'resolve',
            ajax: {
                headers: {
                    "Content-Type": "application/json",
                },
                url: `${API_BASE_URL}/api/precautionaryStatement/getAll`,
                data: function (params) {
                    var query = {
                        search: params.term,
                        page: params.page || 1,
                        pageSize: PAGE_SIZE,
                        language: veiligvertoonLanguageCode
                    }

                    // Query parameters will be ?search=[term]&page=[page]
                    return query;
                },
                beforeSend: function (request) {
                    // Dynamically adds the Authorization header
                    request.setRequestHeader("Authorization", `Bearer ${getCookie(ACCESS_TOKEN_COOKIE_KEY)}`);
                }
            },
            templateSelection: (item) => item.id
        }).on('select2:select', function (e) {
            // Get the data attributes from the selected element
            const statement = e.params.data;

            // Render the p-statement
            const pStatementElement = veiligvertoonRenderStatementText(
                statement.rawStatement,
                statement.id,
                statement.placeholderValues || []
            );

            jQuery(this).parents('.veiligvertoon_container')
                .find('.p-statements-table')
                .append(pStatementElement);
            initializeTooltips(`.${statement.id}-tooltip`);
        }).on('select2:unselect', function (e) {
            // Get the data attributes from the unselected element
            const data = e.params.data;

            // Remove + from the statementCode so we can use it as a selector
            const escapedStatementCode = data.id.replaceAll("+", "-");

            // Remove the deselected P-Statement from the table
            jQuery(this).parents('.veiligvertoon_container').find(`.p-statements-table #${escapedStatementCode}`).remove();

        }).on('change.select2', function (e) {
            // Get the pStatement Select element and the associated clear button
            const pStatementSelectContainer = jQuery(this).parents('.veiligvertoon_container')
                .find(".p-statements-select-container");
            const pStatementSelect = pStatementSelectContainer.find(".select-p-statement");
            const clearButton = pStatementSelectContainer.find(".btn-clear-items");

            // Show the clear button if values are selected
            if (pStatementSelect.val().length) clearButton.show()
            // Hide the clear button
            else clearButton.hide()
        });

        jQuery(containerSelector).find('.selectWoo-no-search').selectWoo({
            placeholder: getTranslation("productDetail-signalWord"),
            containerCssClass: 'veiligvertoon-select',
            minimumResultsForSearch: -1
        });

        // Save the dropzone instance under the tab to which it is related
        if (!window.vvDropzones) window.vvDropzones = {}

        window.vvDropzones[containerSelector] = new Dropzone(`${containerSelector} .dropzone`, {
            url: "#",
            autoProcessQueue: false,
            acceptedFiles: ".pdf",
            addRemoveLinks: true,
            init: function () {
                this.on("addedfile", function () {
                    // Removes previous uploaded files so only one file gets uploaded
                    if (this.files[1] != null) {
                        this.removeFile(this.files[0]);
                    }

                    const downloadFileNameElement = jQuery(jQuery(this)[0].previewsContainer)
                        .parents(".veiligvertoon_container")
                        .find("[name='SafetyInformationDocumentDownloadFileName']");

                    // We will only update the download file name if no value has been entered yet
                    if (!downloadFileNameElement.val()) {
                        downloadFileNameElement.val(
                            this.files[0].name
                        )
                    }

                    // Show a success animation on the uploaded file
                    this.files[0].previewElement.classList.add("dz-success");
                });
            }
        })

        autosize(jQuery(containerSelector).find('.autoscale-textarea'));
    }

    initializeForm("#veiligvertoon-tab-1");

    // JQuery tabs
    tabs = jQuery("#veiligvertoon-tabs").tabs()
    tabs.find(".ui-tabs-nav").sortable({
        items: "li:not(.disable-sort)",
        stop: function () {
            tabs.tabs("refresh");
        },
        start: function (event, ui) {
            // Increase the width of the tab when it's being dragged, this prevents the close icon to go to a new line
            ui.item.width(ui.item.width() + 2);

            // Unset the height of the tab to remove the new line
            ui.item.css("height", "unset");

            // Unset the height on the hidden tab so the tab container doesn't increase in size
            ui.placeholder.css("height", "unset");
        }
    });

    // Automatically open the first tab
    jQuery("#veiligvertoon-tabs").tabs(
        "option", "active", 0
    );

    // Close icon: removing the tab on click
    tabs.on("click", "span.ui-icon-close", function () {
        var panelId = jQuery(this).closest("li").remove().attr("aria-controls");
        jQuery("#" + panelId).remove();
        tabs.tabs("refresh");
    });

    // Counter which is used to keep track of how much tabs there are
    let tabCounter = 2;

    // The template of the tab list item #{xxx} will be replaced by the related value
    let tabTemplate = "<li><a href='#{href}' id='#{id}' class='veiligvertoon-tab-anchor'><span class='tab-product-name'>#{label}</span></a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";


    async function addTab(autoOpen = true) {
        var id = "veiligvertoon-tab-" + tabCounter,
            li = jQuery(tabTemplate.replaceAll(/#\{href\}/g, "#" + id)
                .replaceAll(/#\{label\}/g, NEW_TAB_LABEL_TEXT)
                .replaceAll(/#\{id\}/g, `${id}-label`));

        tabCounter++;

        safetyInformationTabData = veiligvertoonRenderSafetyInformationForm(
            id,
            "",
            veiligvertoonLanguage
        )

        // Add the tab to the list
        tabs.find(".ui-tabs-nav .ui-tabs-tab:last").before(li);

        // Add th content of the tab
        tabs.append(`<div id='${id}' class='veiligvertoon-tab'>${safetyInformationTabData}</div>`);

        // Initialize the form fields for the new tab
        initializeForm(`#${id}`);

        // Refresh the tab so it becomes visible
        tabs.tabs("refresh");

        if (!autoOpen) return

        // Automatically open the new tab
        jQuery("#veiligvertoon-tabs").tabs(
            "option", "active", jQuery(".ui-tabs-nav:not(#add-tab)").find("li:not(#add-tab)").length - 1
        );

        // initialize the tippy tooltips on the new tab
        jQuery(`#${id}`).find('[data-tippy-content]').each(function () {
            initializeTooltips(this);
        });
    }

    // If the user presses the + icon then a new tab will be added
    jQuery(document).on("click", "#add-tab", function () {
        addTab()
    })

    updateTabLabel = function (tabName) {
        // Get the product name from the input field
        const productName = document.getElementById(`${tabName}-product-name`).value;

        // Change the
        jQuery(`#${tabName}-label .tab-product-name`)[0].innerText = productName || NEW_TAB_LABEL_TEXT;
    }

    // On click event for the buttons to remove the associated statement
    jQuery(document).on("click", ".btn-remove-statement", function () {
        //obtain the statement code from the clicked element
        const statementCode = jQuery(this).data("statementCode")

        const veiligvertoonContainer = jQuery(this).parents(".veiligvertoon_container")

        //determine whether we are dealing with a p or h statement and select the associated select2 accordingly
        const select = statementCode[0] === "P" ? veiligvertoonContainer.find(".select-p-statement") :
            veiligvertoonContainer.find(".select-h-statement");

        const selectedStatementElement = select.selectWoo("data").filter(statement => statement.id === statementCode)[0];

        // Get the current selected statements
        const selectedStatements = select.val()

        // Remove the statement from the selectedStatements
        selectedStatements.splice(selectedStatements.indexOf(statementCode), 1)

        // Trigger change so the select gets updated
        select.val(selectedStatements).trigger("change");

        select.trigger({
            type: "select2:unselect",
            params: {
                data: selectedStatementElement
            }
        })
    })

    // On click event for the buttons to clear the selected statements
    jQuery(document).on("click", ".btn-clear-items", function () {
        // obtain the related select2 element
        const select = jQuery(this).parent().find("select")

        jQuery.confirm({
            title: getTranslation("productDetail-areYouSure"),
            content: getTranslation("productDetail-areYouSureText"),
            theme: 'material',
            useBootstrap: false,
            draggable: false,
            scrollToPreviousElement: false,
            scrollToPreviousElementAnimate: false,
            boxWidth: "360px",
            buttons: {
                customCancel: {
                    text: getTranslation("productDetail-cancel"),
                    action: null,
                },
                customConfirm: {
                    text: getTranslation("productDetail-confirm"),
                    btnClass: 'btn-blue',
                    action: () => {
                        // obtain the currently selected statements
                        const selectedStatements = select.selectWoo("data");

                        // clear the selected data from the select2 element itself.
                        select.val([]).trigger("change");

                        // and finally trigger the unselect event associated with the select2 element for each of
                        // the currently selected elements
                        selectedStatements.forEach(statement => {
                            select.trigger({
                                type: "select2:unselect",
                                params: {
                                    data: statement
                                }
                            })
                        })
                    }
                },
            }
        });
    })

    jQuery(document).on("click", ".scan-button", async function () {
        // fetch the dropzone associated with the clicked button from the global initialized dropzone dictionary
        const dropzoneId = `#${jQuery(this).parents(".veiligvertoon-tab")[0].id}`;
        const dropzone = window.vvDropzones[dropzoneId];

        // Get the uploaded file
        const uploadedFile = dropzone.getQueuedFiles();

        // Validate if a file has been uploaded
        if (!uploadedFile.length)
            toastr.error(getTranslation("productDetail-noDocumentUploadedError"));

        // Create the formdata containing the safetyinformation document
        const formData = new FormData();
        formData.append('document', uploadedFile[0]);

        const veiligvertoonLanguage = localStorage.getItem("veiligvertoonLanguage") || "nl";
        var veiligvertoonLanguageCode = 1;
        switch (veiligvertoonLanguage) {
            case "nl":
                veiligvertoonLanguageCode = VeiligvertoonLanguageType.NL;
                break;
            case "en":
                veiligvertoonLanguageCode = VeiligvertoonLanguageType.EN;
                break;
            case "de":
                veiligvertoonLanguageCode = VeiligvertoonLanguageType.DE;
                break;
        }

        // Scan the safety document
        const response = await jQuery.ajax({
            url: `${API_BASE_URL}/api/SafetyInformation/scan?language=${veiligvertoonLanguageCode}`,
            type: "POST",
            headers: {
                "Authorization": `Bearer ${getCookie(ACCESS_TOKEN_COOKIE_KEY)}`,
            },
            data: formData,
            contentType: false, // Required to make the multipart/form-data work
            processData: false, // Required to make the multipart/form-data work
        })
            .catch(err => {
                toastr.error(err.responseText);
            });

        const veiligvertoonContainer = jQuery(this).parents('.veiligvertoon_container');

        loadScanResults(veiligvertoonContainer, response);
    });

    /**
     * Handle click on the save button
     */
    jQuery('.btn-save-tabs').click(async function () {
        // perform validation on all the tabs
        const tabsValid = validateTabs();

        if (!tabsValid) return

        // Get the formData for all the tabs
        let { tabData, safetyInformationDocuments, wooCommerceProductId, safetyInformationStatusData } = serializeTabs();

        // Create FormData which we can send as multipart/form-data content and add all the required data
        const formData = new FormData();

        formData.append('wooCommerceProductId', wooCommerceProductId)

        formData.append('safetyInformationRecords', tabData);

        // Add the files to the FormData
        safetyInformationDocuments.forEach((safetyInformationDocument) => {
            formData.append('safetyInformationDocuments', safetyInformationDocument)
        })

        // Perform the post request
        jQuery.ajax({
            url: `${API_BASE_URL}/api/SafetyInformation`,
            type: "POST",
            headers: {
                "Authorization": `Bearer ${getCookie(ACCESS_TOKEN_COOKIE_KEY)}`,
            },
            data: formData,
            contentType: false, // Required to make the multipart/form-data work
            processData: false, // Required to make the multipart/form-data work
        }).then(_ => {
            // hide the limit exceeded error and inform the user that the safety information has been saved
            toastr.success(getTranslation("productDetail-saveSuccess"))
            jQuery('.vv-product-limit-error-container').hide();
        }).catch(error => {
            if (error.responseJSON.reason == "BalanceExceeded") {
                // show the limit exceeded error and inform the user that something went wrong
                toastr.warning(getTranslation("productDetail-limitReached"));
                jQuery('.vv-product-limit-error-container').show();

                // Set the safetyinformation status to paused
                jQuery('[name="Status"]').each(function () {
                    jQuery(this).val(2).trigger("change")
                })
                safetyInformationStatusData.active = 0;
            } else {
                toastr.error(getTranslation("productDetail-saveError"));
                safetyInformationStatusData = null;
            }
        }).always(() => {
            if (!safetyInformationStatusData) return;

            // make an async post to the backend to save the safety information status data to the wp db
            const date = new Date();
            const lastUpdated = `${date.getDate()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
            jQuery.ajax({
                url: ajaxurl,
                data: {
                    'action': 'save_safety_information_status_data',
                    'statusData': JSON.stringify(safetyInformationStatusData),
                    wooCommerceProductId,
                    lastUpdated
                },
                method: 'POST'
            })
        })
    })

    function loadScanResults(veiligvertoonContainer, scanResult) {
        // Fetch the select2 element for P & H Statements
        const pStatementsSelect = veiligvertoonContainer.find(".select-p-statement");
        const hStatementsSelect = veiligvertoonContainer.find(".select-h-statement");

        // Obtain the select2 dataAdapter with which we can create and add options to the select2 element
        const hStatementDataAdapter = hStatementsSelect.data("select2").dataAdapter;

        // Get the selected hStatements
        const hStatements = hStatementsSelect.selectWoo("data");

        // clear the selected data from the select2 element itself.
        hStatementsSelect.val([]).trigger("change");
        hStatements.forEach(statement => {
            hStatementsSelect.trigger({
                type: "select2:unselect",
                params: {
                    data: statement
                }
            })
        })

        scanResult["hazardStatementData"].forEach((hStatement) => {
            // Create the option and append to Select2
            hStatementDataAdapter.addOptions(hStatementDataAdapter.convertToOptions([hStatement]));

            // Add the option to the selected items & trigger the 'select' event
            hStatementsSelect.val([...hStatementsSelect.val(), hStatement.id]).trigger("change");

            // manually trigger the `select2:select` event
            hStatementsSelect.trigger({
                type: 'select2:select',
                params: {
                    data: hStatement,
                    autoSelectPStatements: false,
                }
            });
        })

        // Obtain the select2 dataAdapter with which we can create and add options to the select2 element
        const pStatementDataAdapter = pStatementsSelect.data("select2").dataAdapter;

        // Get the selected pStatements
        const pStatements = pStatementsSelect.selectWoo("data");

        // clear the selected data from the select2 element itself.
        pStatementsSelect.val([]).trigger("change");

        // and finally trigger the unselect event associated with the select2 element for each of
        // the currently selected elements
        pStatements.forEach(statement => {
            pStatementsSelect.trigger({
                type: "select2:unselect",
                params: {
                    data: statement
                }
            })
        })

        scanResult["precautionaryStatementData"].forEach((pStatement) => {
            // Create the option and append to Select2
            pStatementDataAdapter.addOptions(pStatementDataAdapter.convertToOptions([pStatement]));

            // Add the option to the selected items & trigger the 'select' event
            pStatementsSelect.val([...pStatementsSelect.val(), pStatement.id]).trigger("change");

            // manually trigger the `select2:select` event
            pStatementsSelect.trigger({
                type: 'select2:select',
                params: {
                    data: pStatement,
                }
            });
        })

    }


    /**
     * Function to validate if all the veiligvertoon tabs are filled properly
     */
    function validateTabs() {
        let isValid = true
        jQuery('.veiligvertoon-tab').each(function (i) {
            let tabIsValid = true;

            // Validate all the fields using parsley
            jQuery(this).find(':input:not(:button)').each(function () {
                let validationResult;

                // Check if the field is valid
                const formItem = jQuery(this).parsley();

                // Validate the formItem. If the form already has been validated once, then we just want back if the
                // field is valid or not. If we would validate again then we will get stack overflow when listening
                // for the event.
                if (formItem.element.getAttribute("data-parsley-id")) {
                    validationResult = formItem.isValid();
                } else {
                    validationResult = formItem.validate();
                    // When a formItem becomes valid then we want to recheck if the tab should still have the error mark
                    formItem.on("field:success", () => validateTabs());
                    formItem.on("field:error", () => validateTabs());
                }

                // If the validationResult isn't true then we want to change the tabValidity to false
                tabIsValid = tabIsValid && validationResult === true;
            });

            // Validate the custom statements
            const customStatementTables = [
                "custom-h-statements-table",
                "custom-p-statements-table"
            ]

            customStatementTables.forEach(customStatementTable => {
                jQuery(this).find(`.${customStatementTable}`)
                    .children().each(function () {
                        const customStatementCode = jQuery(this).find(".custom-statement-code").val();
                        const customStatementDescription = jQuery(this).find(".custom-statement-description").val();

                        // Check if a user has entered a value for the input fields. For the statement code we check
                        // if the user has entered something besides the default prefix (P or H) so length > 1
                        if (customStatementCode.length < 2 && !customStatementDescription.length) {
                            tabIsValid = false;
                            jQuery(this).parents(".custom-statements-container")
                                .find(".custom-statements-error").text(getTranslation("productDetail-fillAllFields"))
                        } else {
                            // reset the error message
                            jQuery(this).parents(".custom-statements-container")
                                .find(".custom-statements-error").text("")
                        }
                    }).toArray();
            })

            // Select the tab which is currently being validated
            const tabId = jQuery(this)[0].id;
            const tabElement = jQuery(`#${tabId}-label[href="#${tabId}"]`);

            if (!tabIsValid) {
                // Mark that the form is invalid
                isValid = false;

                // If the tab already contains an error then we won't add it again
                if (tabElement.find(`#${tabId}-error`).length) return;

                // Change the color of the tab text to red
                tabElement.addClass("danger");

                // Add 'change required' & the warning icon
                tabElement.prepend(`<span id="${tabId}-error"><i class="fas fa-exclamation-circle error-icon">
                </i>[${getTranslation('productDetail-changesRequired')}]</error>`)

                return
            }

            // If the tab contains an error then it needs to be removed since the tab is valid now
            const errorElement = tabElement.find(`#${tabId}-error`);
            tabElement.removeClass("danger");
            if (errorElement.length) errorElement.remove();
        })

        return isValid;
    }


    /**
     * Function to serialize all the veiligvertoon tabs into the format required by the server
     */
    function serializeTabs() {
        // Simple form fields for which no data formatting is required
        const simpleFormItems = [
            'Title', 'SignalWord', 'Ingredients', 'AdditionComment', 'SafetyInformationDocumentDownloadFileName'
        ];

        // Complexer form fields which require additional parsing
        const complexFormItems = ['HStatements', 'PStatements']

        // Keys:    The className of the tables containing the custom statements
        // Values:  The Type of the customStatement
        const customStatementTables = {
            'custom-h-statements-table': 1,
            'custom-p-statements-table': 2
        }

        const wooCommerceProductId = jQuery(`[name="WooCommerceProductId"]`).val()

        // Array which will hold all the safety information documents
        const safetyInformationDocuments = []

        // keep track of the active and total amount of safety information records
        const safetyInformationStatusData = {
            active: 0,
            total: 0
        }


        const tabs = jQuery('#veiligvertoon-tabs ul[role="tablist"] li[aria-controls*="veiligvertoon-tab"]');

        // Get the form data from all the tabs
        const result = tabs.map(function (i) {
            const tabIdentifier = jQuery(this).attr("aria-controls");

            //obtain the actual tab content associated with the tab header
            const currentTab = jQuery(`#veiligvertoon-tabs #${tabIdentifier}`);

            // Get the serverId from the SafetyInformation (if there is one)
            const safetyInformationId = currentTab.find(`[name="SafetyInformationId"]`).val()

            // Get the value of the 'isDocumentDownloadable' checkbox
            const isDocumentDownloadable = currentTab.find(`[name="IsDocumentDownloadable"]`).prop("checked")

            const status = parseInt(currentTab.find('[name="Status"]').val())

            // count the active and total amount of safety information records
            if (status === SAFETY_INFORMATION_STATUS_ACTIVE) safetyInformationStatusData.active++;
            safetyInformationStatusData.total++;

            const tabResult = {
                "Status": status || -1,
                "Order": i,
                "SafetyInformationId": safetyInformationId,
                "IsDocumentDownloadable": isDocumentDownloadable
            }

            // Obtain the dropzone element from the tab and fetch the uploaded safty information document file
            const dropzoneId = `#${currentTab[0].id}`;
            const dropzoneElement = window.vvDropzones[dropzoneId];
            const safetyInformationDocumentFile = dropzoneElement.getQueuedFiles()[0]

            // If a file has been uploaded then we get name of the file
            let safetyInformationDocumentFileName = safetyInformationDocumentFile?.name || dropzoneElement.files[0]?.name;

            if (safetyInformationDocumentFile) {
                // Add the file to the file list
                safetyInformationDocuments.push(safetyInformationDocumentFile)

                // Since we are going save a file to the server, we will mark that there is a file on the server
                dropzoneElement.hasFileOnServer = true
            } else if (dropzoneElement.hasFileOnServer && !dropzoneElement.files) {
                // User has deleted the file, so we mark that the file needs to be deleted on the server
                safetyInformationDocumentFileName = "delete";

                // Since we are going to remove the file, we will remove the mark that there is a file on the server
                dropzoneElement.hasFileOnServer = false
            }

            tabResult["SafetyInformationDocumentFileName"] = safetyInformationDocumentFileName

            // Get the simple form data
            simpleFormItems.forEach(formItem => tabResult[formItem] = currentTab.find(`[name="${formItem}"]`).val())

            // Get the complex form data & parse it to the right format
            complexFormItems.forEach(formItem => {
                tabResult[formItem] = currentTab.find(`[name=${formItem}]`).val().map(code => {
                    const placeholderValues = currentTab.find(`.placeholder-input-container#${code.replaceAll("+", "-")}`).map(function (i) {
                        return ({
                            "Index": i,
                            "Value": jQuery(this).find("input").val()
                        });
                    }
                    ).toArray();

                    return {
                        "Code": code,
                        "PlaceholderValues": placeholderValues
                    }
                })
            })

            tabResult["CustomStatements"] = []
            Object.keys(customStatementTables).forEach(customStatementTable => {
                const customStatements = currentTab.find(`.${customStatementTable}`)
                    .children().map(function () {
                        return ({
                            "Type": customStatementTables[customStatementTable],
                            "StatementCode": jQuery(this).find(".custom-statement-code").val(),
                            "Description": jQuery(this).find(".custom-statement-description").val(),
                        });
                    }
                    ).toArray();

                tabResult["CustomStatements"] = [...tabResult["CustomStatements"], ...customStatements]
            })

            return tabResult;
        })

        return {
            "tabData": JSON.stringify(result.toArray(), replacer),
            "safetyInformationDocuments": safetyInformationDocuments,
            "wooCommerceProductId": wooCommerceProductId,
            safetyInformationStatusData
        }
    }

    /**
     * Can be used to replace undefined with null in json.stringify.
     * When this is not used, the elements with value 'undefined' will be removed, which is not desired.
     */
    const replacer = (key, value) =>
        typeof value === 'undefined' ? null : value;


    /**
     * Loads the saved product from the server.
     */
    async function loadProduct() {
        const currentProductId = jQuery("#product_id").val()

        // Try to fetch the product from the server
        jQuery.ajax({
            url: `${API_BASE_URL}/api/SafetyInformation/${currentProductId}?languageId=${veiligvertoonLanguageCode}`,
            type: "GET",
            headers: {
                "Authorization": `Bearer ${getCookie(ACCESS_TOKEN_COOKIE_KEY)}`,
                "Content-Type": "application/json",
            },
            traditional: true
        }).then(res => {
            // Loop over all the safety information tabs
            res.forEach(async (safetyInformation, index) => {
                // By default we only have the first tab rendered. So after rendering the first tabb then we need to
                // add a new tab
                if (index > 0) await addTab(false);

                // Generate the identifier of the tab
                const tabIdentifier = `veiligvertoon-tab-${index + 1}`;

                // Extract the input field values from the retrieved safetyInformation
                const {
                    id, title, ingredients, additionalComment, status,
                    signalWord, safetyInformationDocumentFileName, safetyInformationDocumentDownloadUrl,
                    safetyInformationDocumentSizeKb, isDocumentDownloadable, customStatements,
                    safetyInformationDocumentDownloadFileName
                } = safetyInformation;

                // Render the values into the input fields
                const safetyInformationTab = jQuery(`#${tabIdentifier}`);
                safetyInformationTab.find(`#${tabIdentifier}-safety-information-id`).val(id);
                safetyInformationTab.find(`#${tabIdentifier}-status`).val(status.toString())
                    .trigger("change");
                safetyInformationTab.find(`#${tabIdentifier}-product-name`).val(title);
                safetyInformationTab.find(`#${tabIdentifier}-ingredients`).val(ingredients);
                safetyInformationTab.find(`#${tabIdentifier}-additional-comment`).val(additionalComment);
                safetyInformationTab.find(`#${tabIdentifier}-signal-word`)
                    .val(SignalWord[signalWord]).trigger("change");
                safetyInformationTab.find(`#${tabIdentifier}-is-document-downloadable`).prop(
                    "checked",
                    isDocumentDownloadable
                ).trigger("change");

                safetyInformationTab.find(`#${tabIdentifier}-download-name`).val(
                    safetyInformationDocumentDownloadFileName
                );


                // render the safety information document into dropzone
                const dropzoneElement = window.vvDropzones[`#${tabIdentifier}`]

                if (safetyInformationDocumentFileName) {
                    const safetyInformationDocument = {
                        name: safetyInformationDocumentFileName,
                        url: `${API_BASE_URL}/api${safetyInformationDocumentDownloadUrl}`,
                        size: safetyInformationDocumentSizeKb,
                        type: "application/pdf",
                        serverID: 0,
                        accepted: true
                    };

                    dropzoneElement.files.push(safetyInformationDocument);
                    dropzoneElement.emit("addedfile", safetyInformationDocument);
                    dropzoneElement.emit("success", safetyInformationDocument);
                    dropzoneElement.emit("complete", safetyInformationDocument);

                    // Indicates that a file from the server has been loaded. If the user removes the file. Then
                    // we want to pass deleted as the file name so it deletes the file on server.
                    dropzoneElement.hasFileOnServer = true
                }

                // Change the title of the tab to the productTitle
                updateTabLabel(tabIdentifier);

                // Render the H & P Statements
                const veiligvertoonContainer = safetyInformationTab.find(".veiligvertoon_container");
                loadScanResults(veiligvertoonContainer, safetyInformation);

                // Render the custom statements
                if (customStatements) {
                    customStatements.forEach(customStatement => {
                        // Convert the statementType to either P or H
                        const statementType = CustomStatementType[customStatement.type];

                        // Fetch the customStatementTable based on the current statement Type
                        const customStatementTable = safetyInformationTab.find(
                            `.custom-${statementType.toLowerCase()}-statements-table`
                        );

                        // Add the customStatement to the table
                        addCustomStatement(
                            customStatementTable,
                            customStatement.statementCode,
                            customStatement.description
                        );
                    })
                }
            })

        }).catch(e => {
            // check if the server is unavailable based on the error
            if (e.status === 0) {
                toastr.error(getTranslation("productDetail-connectionError"));
            } else {
                toastr.error(getTranslation("productDetail-fetchingError"));
            }
        })
    }

    loadProduct();

    /**
     * Handles click on a file which has been uploaded to dropzone. Once the user clicks then a preview of the file
     * will be showed in a new window.
     */
    function handleFileClick(file) {
        const fileUrl = file.url;

        if (fileUrl) {
            window.open(fileUrl);
            return
        }

        // Read the file
        var reader = new FileReader();
        reader.readAsDataURL(file);

        // When the file has been read we
        reader.onload = function () {
            // Open an empty window
            let pdfWindow = window.open("")

            // Add an iframe to the window containing the uploaded pdf
            pdfWindow.document.write(
                `<style>body {margin: 0!important; overflow: hidden;} iframe {border-width: 0px}</style>` +
                `<iframe width='100%' height='100%' border='0' src='${reader.result}'></iframe>`
            )

            // Change the title of the tab to the name of the file
            pdfWindow.document.title = file.name;
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    function addCustomStatement(customStatementTable, statementCode, statementDescription = "") {
        // Add a new empty p-statement to the custom table
        customStatementTable.append(`<tr>
            <td style='vertical-align: top; white-space: nowrap;'>
                <input class="custom-statement-code" value="${statementCode}"
                       style="width: 100%;" data-statement-type="${statementCode[0]}">
            </td>
            <td>
                <textarea rows="1" class="vv-textarea custom-statement-description" style="height: 21px;"
                        placeholder="${getTranslation("productDetail-ownStatement-1")} ${statementCode[0]}-${getTranslation("productDetail-ownStatement-2")}">${statementDescription}</textarea>
            </td>
            <td>
                <i class='fas fa-times btn-remove-custom-statement'
                   style='opacity: 0.7; cursor: pointer; float: right;'>
            </td>
        </tr>`);

        // By default the custom Statement container is hidden. After a statement gets added we will show it again
        customStatementTable.parents(".custom-statements-container").show();
    }


    // Initialize a listener which will listen to clicks on a dropzone file
    jQuery(document).on("click", ".dz-preview", function () {
        // Get the dropzone element from the tab
        const dropzoneElement = jQuery(this).parents(".dropzone")[0].dropzone;

        // Obtain the uploaded file
        const file = dropzoneElement.files[0]

        // Show a preview of the file in a new tab
        handleFileClick(file)
    })

    /**
     * Adds a new custom statement either to the custom H or P statement table,
     * depending on which button the user clicks
     */
    jQuery(document).on("click", ".add-custom-statement", function () {
        const statementType = jQuery(this).data("statementType")

        // Get the custom p-statement table
        const customStatementTable = jQuery(this)
            .parents(".veiligvertoon_container")
            .find(`.custom-${statementType.toLowerCase()}-statements-table`)


        // Add the custom statement to the table
        addCustomStatement(customStatementTable, statementType)
    })

    /**
     * Makes sure the user can't remove the H before the custom H statement
     */
    jQuery(document).on("keyup", ".custom-statement-code", function () {
        const statementType = jQuery(this).data("statement-type");
        if (this.value[0] !== statementType) this.value = `${statementType}${this.value}`;
    })

    /**
     * Removes the custom statement from the list
     */
    jQuery(document).on("click", ".btn-remove-custom-statement", function () {
        // Get the body of the table related to the current element.
        const table = jQuery(this).parents("table")

        // Remove the current element from the list
        jQuery(this).parents("tr").remove();

        // If there are no custom statements in the body anymore then we will hide the table.
        if (!table.children().length)
            table.parents(".custom-statements-container").hide()
    })

    /**
     * OnChange event on the download safety document checkbox to conditionally render the custom filename input
     */
    jQuery(document).on("change", "[name='IsDocumentDownloadable']", function () {
        const documentNameContainerElement = jQuery(this).parents(".veiligvertoon_container").find(".download-name-input");
        const documentNameInput = documentNameContainerElement.find("[name='SafetyInformationDocumentDownloadFileName']");

        if (jQuery(this).is(':checked')) {
            documentNameContainerElement.show();
            documentNameInput.attr('data-parsley-required', 'true')
        } else {
            documentNameContainerElement.hide();
            documentNameInput.removeAttr('data-parsley-required')
        }
    });
})
