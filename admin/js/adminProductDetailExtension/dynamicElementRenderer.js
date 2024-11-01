// function to render the dynamic statement texts including the placeholder inputs
const veiligvertoonRenderStatementText = (statementText, statementCode, placeholderValues) => {
    const pattern = /\${(.*?)}/g;

    const matches = statementText.matchAll(pattern);

    // Remove + from the string since this conflicts when using a jQuery selector
    const escapedStatementCode = statementCode.replaceAll("+", "-");

    // Generate the table entry for the current statement.
    let result = `<tr id='${escapedStatementCode}'>
      <td style='vertical-align: top; white-space: nowrap;'>${statementCode} - </td>
      <td>${statementText}</td>
      <td><i class='fas fa-times ${escapedStatementCode}-tooltip btn-remove-statement' style='opacity: 0.7; 
        cursor: pointer;' data-statement-code='${statementCode}' data-tippy-content='${statementCode}'></td>
    </tr>`;

    // Replace the placeholders with input fields
    let index = 0;

    for (const match of matches) {
        const placeholderValue = placeholderValues[index] || "";
        const placeholderText = match[1];
        result = result.replace(
            match[0],
            `<div class='placeholder-input-container' id='${escapedStatementCode}'>
                <i class='fas fa-question-circle help-icon ${escapedStatementCode}-tooltip' 
                    data-tippy-content='${placeholderText}'></i>
                <input placeholder='...' value='${placeholderValue}' />
            </div>`
        );
        index++;
    }

    // Return the result
    return result;
};

// function to render the dynamic safetyinformation form for each tab
const veiligvertoonRenderSafetyInformationForm = (tabName, productName, language) => {
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

    return `
    <div class="options_group veiligvertoon_container">
        <!-- safetyInformationId from the server -->
        <input hidden id="${tabName}-safety-information-id" name="SafetyInformationId" value="" />

        <!-- An error container informing the user that his product limit has been exceeded -->
        <div class="vv-product-limit-error-container" hidden>
            <p class="vv-product-limit-error-message">
                <i class="fas fa-exclamation-circle"></i>
                ${getTranslation("dynamicElementRender-limitReaced")} <a href="${FRONT_END_BASE_URL}/dashboard" target="_blank">${getTranslation("dynamicElementRender-vvDashboard")}.</a>
            </p>
        </div>

        <!-- Product Name -->
        <p class="form-field product-name-input">
            <label for="product-name-input">${getTranslation('dynamicElementRender-title')}<span class="required-red">*</span></label>
            <span class="wrap">
                <input placeholder="${getTranslation('dynamicElementRender-titlePlaceholder')}" class="short" data-parsley-required onInput="updateTabLabel('${tabName}');" type="text" name="Title" id="${tabName}-product-name" value="${productName || ''}" data-parsley-errors-container="#${tabName}-product-name-parsley-container" />
            </span>
            <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-titleTooltip')}"></i>
            <span id="${tabName}-product-name-parsley-container"></span>
        </p>

        <!-- Status -->
        <p class="form-field signal-word-input">
            <label for="status-input">Status</label>
            <span class="wrap select-wrapper">
                <select id="${tabName}-status" class="selectWoo-no-search" name="Status">
                    <option value="1">${getTranslation('dynamicElementRender-statusActive')}</option>
                    <option value="2">${getTranslation('dynamicElementRender-statusPaused')}</option>
                </select>
            </span>
            <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-statusTooltip')}"></i>
        </p>

        <!-- Safety information document dropzone -->
        <div class="form-field veiligvertoon-form-container">
        <label for="product-name-input">${getTranslation('dynamicElementRender-msds')}</label>
        <span class="wrap">
            <div class="dropzone short veiligvertoon-dropzone" style="float:left;">
                <div class="dz-message needsclick">
                    <button type="button" class="dz-button"><strong>${getTranslation('dynamicElementRender-msds-placeholder')}</strong></button>
                    <br />
                    <span class="note needsclick">(${getTranslation('dynamicElementRender-placeholder2')})</span>
                </div>
            </div>
        </span>
        <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-tooltip')}"></i>
    </div>

    <!-- Safety information document download name -->
    <p class="form-field download-name-input">
        <label for="download-name-input">${getTranslation('dynamicElementRender-downloadName')}<span class="required-red">*</span></label>
        <span class="wrap">
            <input placeholder="${getTranslation('dynamicElementRender-downloadName-placeholder')}" class="short" type="text" name="SafetyInformationDocumentDownloadFileName" id="${tabName}-download-name" data-parsley-errors-container="#${tabName}-download-name-parsley-container" />
        </span>
        <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-downloadName-tooltip')}"></i>
        <span id="${tabName}-download-name-parsley-container"></span>
    </p>

    <div class="form-field product-name-input" style="padding: 5px 20px 5px 162px!important; display:flow-root">
        <span class="wrap">
            <div class="custom-row-container short" style="float:left">
                <div class="checkbox-wrapper">
                    <input type="checkbox" name="IsDocumentDownloadable" value="show" style="display: inline-block" id="${tabName}-is-document-downloadable">
                    <span style="position:relative;top: 1.5px;">
                        ${getTranslation('dynamicElementRender-downloadCheckbox')}
                        <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-downloadCheckbox-tooltip')}" style="margin-left:0px!important"></i>
                    </span>
                </div>

                <div class="scan-button-wrapper">
                    <button type="button" class="scan-button">${getTranslation('dynamicElementRender-scanMsds')}</button>
                    <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-scanMsds-tooltip')}" style="margin-left:0px!important"></i>
                </div>
            </div>
        </span>
    </div>

    <hr />
    <div class="vv-manual-section">
        <h2 style="display:inline-block"><strong>${getTranslation('dynamicElementRender-manualConfigSection')}</strong></h2>

        <!-- H Statements -->
        <p class="form-field h-statements-select-container">
            <label for="h-statements-select">${getTranslation('dynamicElementRender-h-sentences')}</label>
            <span class="wrap select-wrapper">
                <select class="select-h-statement" multiple="multiple" name="HStatements" data-parsley-errors-container="#${tabName}-h-statements-parsley-container"></select>
            </span>
            <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-h-sentences-tootltip')}"></i>
            <i class="fas fa-times-circle btn-clear-items" data-tippy-content="${getTranslation('dynamicElementRender-h-sentences-clearBtn')}"></i>
            <span id="${tabName}-h-statements-parsley-container"></span>
        </p>

        <table class="h-statements-table short">

        </table>

        <div class="custom-statements-container">
            <b class="custom-statement-header">${getTranslation('dynamicElementRender-custom-h-sentences')}</b>
            <table class="custom-h-statements-table short"></table>
            <span class="custom-statements-error danger"></span>
        </div>

        <!-- Add custom p-statement -->
        <div class="add-custom-statement" data-statement-type="H">
            <i class="fas fa-plus"></i>
            <span>${getTranslation('dynamicElementRender-add-custom-h-sentence')}</span>
        </div>

        <div class="form-field veiligvertoon-form-container ghs-labels-form-item">
            <label>${getTranslation('dynamicElementRender-GHS-labels')}</label>
            <span class="wrap short">
                <div class="short ghs-labels-container">
                    <i class="ghs-labels-placeholder">${getTranslation('dynamicElementRender-GHS-labels-tootltip')}</i>
                </div>
            </span>
        </div>

        <!-- P Statements -->
        <p class="form-field p-statements-select-container">
            <label for="p-statements-select">${getTranslation('dynamicElementRender-p-sentences')}</label>
            <span class="wrap select-wrapper">
                <select class="select-p-statement" multiple="multiple" name="PStatements"></select>
            </span>
            <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-p-sentences-tooltip')}"></i>
            <i class="fas fa-times-circle btn-clear-items" data-tippy-content="${getTranslation('dynamicElementRender-p-sentences-clearBtn')}"></i>
        </p>

        <table class="p-statements-table short">
        </table>

        <div class="custom-statements-container">
            <b class="custom-statement-header">${getTranslation('dynamicElementRender-custom-p-sentences')}</b>
            <table class="custom-p-statements-table short"></table>
            <span class="custom-statements-error danger"></span>
        </div>

        <!-- Add custom p-statement -->
        <div class="add-custom-statement" data-statement-type="P">
            <i class="fas fa-plus"></i>
            <span>${getTranslation('dynamicElementRender-add-custom-p-sentence')}</span>
        </div>

        <!-- Signal word -->
        <p class="form-field signal-word-input">
            <label for="signal-word-input">${getTranslation('dynamicElementRender-signalWord')}</label>
            <span class="wrap select-wrapper">
                <select id="${tabName}-signal-word" class="selectWoo-no-search" name="SignalWord" disabled>
                    <option></option>
                    <option>Waarschuwing</option>
                    <option>Gevaar</option>
                    <option>Warning</option>
                    <option>Danger</option>
                    <option>Achtung</option>
                    <option>Gefahr</option>
                </select>
            </span>
            <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-signalWord-tootltip')}"></i>
        </p>

        <!-- Product ingredients -->
        <p class="form-field ingredients-input">
            <label for="ingredients-input">${getTranslation('dynamicElementRender-contains')}</label>
            <span class="wrap">
                <textarea placeholder="${getTranslation('dynamicElementRender-contains-placeholder')}" class="short autoscale-textarea" type="text" name="Ingredients" id="${tabName}-ingredients"></textarea>
            </span>
            <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-contains-tooltip')}"></i>
        </p>

        <!-- Additional comment -->
        <p class="form-field additional-comment-input">
            <label for="additional-comment-input">${getTranslation('dynamicElementRender-extra-info')}</label>
            <span class="wrap">
                <textarea placeholder="${getTranslation('dynamicElementRender-extra-info-placeholder')}" class="short autoscale-textarea" type="text" name="AdditionComment" id="${tabName}-additional-comment"></textarea>
            </span>
            <i class="fas fa-question-circle help-icon" data-tippy-content="${getTranslation('dynamicElementRender-extra-info-tooltip')}"></i>
        </p>
    </div>

</div>`;
}

