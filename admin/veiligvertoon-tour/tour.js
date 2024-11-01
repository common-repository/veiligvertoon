window.addEventListener("load", async function () {
    
    let LOCALIZAED_BASE_URL = getTranslation("languageCode") == "NL" 
        ? FRONT_END_BASE_URL
        : `${FRONT_END_BASE_URL}/en`


    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        classPrefix: 'vv',
        defaultStepOptions: {
            classes: 'veiligvertoon-tour-step'
        }
    });

    function cancelTour() {
        localStorage.setItem('veiligvertoonTourIsActive', false);
        tour.cancel();
    }

    // step 1A - Woocommerce product overview
    tour.addStep({
        id: 'tour-step-1-A',
        title: getTranslation('tour-step-1A-title'),
        text: getTranslation('tour-step-1A-text'),
        classes: 'example-step-extra-class',
        buttons: [
            {
                text: getTranslation('tour-step-1A-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-step-1A-start'),
                action: tour.next
            }
        ]
    });

    // step 1B - Woocommerce product overview
    tour.addStep({
        id: 'tour-step-1-B',
        title: getTranslation('tour-step-1B-title'),
        text: `${getTranslation('tour-step-1B-text')}
        </br></br><b class="center-example-text">${getTranslation('tour-step-1B-text-activeProduct')}:</b></br><div class="${getTranslation('tour-step-1B-image-active')} center-example-image"></div>
        </br></br><b class="center-example-text">${getTranslation('tour-step-1B-text-pausedProduct')}:</b></br><div class="${getTranslation('tour-step-1B-image-paused')} center-example-image"></div></br>`,
        classes: 'example-step-extra-class',
        attachTo: {
            element: 'th#veiligvertoon',
            on: 'left',
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-step-1B-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-step-1B-next'),
                action: tour.next
            }
        ],
        scrollTo: { behavior: 'smooth', block: 'center' }
    });

    // step 1C - Woocommerce product overview
    tour.addStep({
        id: 'tour-step-1-C',
        title: getTranslation('tour-step-1C-title'),
        text: getTranslation('tour-step-1C-text'),
        classes: '',
        modalOverlayOpeningPadding: 10000,
        attachTo: {
            element: '#name',
            on: 'top',
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        buttons: [],
        cancelIcon: {
            enabled: true
        },
        scrollTo: { behavior: 'smooth', block: 'center' }
    });

    // Step 2A - Edit product information
    tour.addStep({
        id: 'tour-step-2-A',
        title: getTranslation('tour-2A-title'),
        text: getTranslation('tour-2A-text'),
        attachTo: {
            element: '.veiligvertoon_options ',
            on: 'top'
        },
        classes: 'example-step-extra-class',
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-2A-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-2A-next'),
                action: function () {
                    jQuery(".veiligvertoon_options a").click();
                    tour.next();
                }
            }
        ],
        advanceOn: { selector: '.veiligvertoon_options a', event: 'click' },
        scrollTo: { behavior: 'smooth', block: 'center' }
    });

    // Step 2B - Edit product information
    tour.addStep({
        id: 'tour-step-2-B',
        title: getTranslation('tour-2B-title'),
        text: getTranslation('tour-2B-text'),
        attachTo: {
            element: '#veiligvertoon_panel',
            on: 'left'
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-next'),
                action: tour.next
            }
        ],
        scrollTo: { behavior: 'smooth', block: 'center' }
    });

    // Step 2C - Edit product information
    tour.addStep({
        id: 'tour-step-2-C',
        title: getTranslation('tour-2C-title'),
        text: getTranslation('tour-2C-text'),
        attachTo: {
            element: '#veiligvertoon_panel .veiligvertoon-dropzone',
            on: 'right'
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-next'),
                action: tour.next
            }
        ],
        scrollTo: { behavior: 'smooth', block: 'center' }
    });

    // Step 2D - Edit product information
    tour.addStep({
        id: 'tour-step-2-D',
        title: getTranslation('tour-2D-title"'),
        text: getTranslation('tour-2D-text'),
        attachTo: {
            element: '#veiligvertoon_panel .vv-manual-section',
            on: 'left'
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-next'),
                action: tour.next
            }
        ],
        scrollTo: { behavior: 'smooth', block: 'center' }
    });

    // Step 2E - Edit product information
    tour.addStep({
        id: 'tour-step-2-E',
        title: getTranslation('tour-2E-title'),
        text: getTranslation('tour-2E-text'),
        attachTo: {
            element: '#veiligvertoon_panel #add-tab',
            on: 'bottom'
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-next'),
                action: tour.next
            }
        ],
        canClickTarget: false,
        scrollTo: { behavior: 'smooth', block: 'center' }
    });

    // Step 2F - Edit product information
    tour.addStep({
        id: 'tour-step-2-F',
        title: getTranslation('tour-2F-title'),
        text: getTranslation('tour-2F-text'),
        attachTo: {
            element: '#veiligvertoon_panel .btn-save-tabs',
            on: 'left'
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-next'),
                action: tour.next
            }
        ],
        canClickTarget: false,
        scrollTo: { behavior: 'smooth', block: 'center' }
    });

    // Step 2G - Edit product information
    tour.addStep({
        id: 'tour-step-2-G',
        title: getTranslation('tour-2G-title'),
        text: getTranslation('tour-2G-text'),
        attachTo: {
            element: '.toplevel_page_veiligvertoon-admin-menu',
            on: 'right'
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-2G-btn-manageStyling'),

                action: function () {
                    jQuery(".toplevel_page_veiligvertoon-admin-menu .wp-first-item a")[0].click()
                }
            }
        ],
        scrollTo: { behavior: 'smooth', block: 'center' },
    });

    // Step 3A - Styling
    tour.addStep({
        id: 'tour-step-3-A',
        title: getTranslation('tour-3A-title'),
        text: getTranslation('tour-3A-text'),
        attachTo: {
            element: '#settingsForm',
            on: 'right'
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, -350] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-next'),
                action: tour.next
            }
        ],
        scrollTo: { behavior: 'smooth', block: 'center' },
        advanceOn: { selector: '.toplevel_page_veiligvertoon-admin-menu', event: 'click' },
        modalOverlayOpeningPadding: 10000
    });

    // TODO: Uncomment if a solution / replacement for the iframe has been found
    // // Step 3B - Styling
    // tour.addStep({
    //     id: 'tour-step-3-B',
    //     title: 'Het stylen van je veiligheidsinformatie',
    //     text: 'Hier zie je direct de resultaten van de geconfigureerde styling.',
    //     attachTo: {
    //         element: '#vvframe',
    //         on: 'right'
    //     },
    //     popperOptions: {
    //         modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
    //     },
    //     buttons: [
    //         {
    //             text: getTranslation('tour-cancel'),
    //             action: cancelTour
    //         },
    //         {
    //             text: getTranslation('tour-next'),
    //             action: tour.next
    //         }
    //     ],
    //     scrollTo: { behavior: 'smooth', block: 'center' },
    //     advanceOn: { selector: '.toplevel_page_veiligvertoon-admin-menu', event: 'click' },
    //     modalOverlayOpeningPadding: 10000
    // });

    // Step 3c - Open activation
    tour.addStep({
        id: 'tour-step-3-C',
        title: getTranslation('tour-3C-title'),
        text: getTranslation('tour-3C-text'),
        attachTo: {
            element: '.toplevel_page_veiligvertoon-admin-menu li:nth-child(3)',
            on: 'right'
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-next'),
                action: function () {
                    jQuery(".toplevel_page_veiligvertoon-admin-menu li:nth-child(3) a")[0].click()
                }
            }
        ],
        scrollTo: { behavior: 'smooth', block: 'center' },
    });

    // Step 4a - Activeer account
    tour.addStep({
        id: 'tour-step-4-A',
        title: getTranslation('tour-4A-title"'),
        text: `${getTranslation('tour-4A-text')}
        <br/><br/>
        ${getTranslation('tour-4A-text-2')} <a href="${LOCALIZAED_BASE_URL}/dashboard/account" target="_blank">${getTranslation('tour-4A-text-3')}</a> ${getTranslation('tour-4A-text-4')}.
        <br/><br/>
        ${getTranslation('tour-4A-text-5')} <a href="${LOCALIZAED_BASE_URL}/registration" target="_blank">${getTranslation('tour-4A-text-6')}</a>
        <br/>
        `,
        attachTo: {
            element: '#vv-activationForm',
            on: 'right'
        },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 15] } }]
        },
        buttons: [
            {
                text: getTranslation('tour-4A-cancel'),
                action: cancelTour
            },
            {
                text: getTranslation('tour-4A-createAccount'),
                action: function () {
                    window.open(`${LOCALIZAED_BASE_URL}/registration`);
                }
            }
        ],
        scrollTo: { behavior: 'smooth', block: 'center' },
        modalOverlayOpeningPadding: 5
    });

    jQuery('.js-veiligvertoon-tour').click(function (e) {
        // prevent the default redirect from the <a> tag
        e.preventDefault();

        // start the veiligvertoon tour by setting the tour status in the local storage to active
        localStorage.setItem('veiligvertoonTourIsActive', true);

        // redirect to the first tour page configured on the start tour element
        window.location.replace(jQuery(this).attr("href"));
    })

    // only actually start the tour if the tour is active
    if (localStorage.getItem('veiligvertoonTourIsActive') === 'true') {
        const parameters = new URLSearchParams(window.location.search);

        if (parameters.get("post_type") === "product") {
            tour.start();
            tour.show(0);
        }
        if (parameters.get("post_type") === "post") {
            tour.start();
            tour.show(0);
        } else if (parameters.get("post") && parameters.get("action") === "edit") {
            tour.show(3);
        } else if (parameters.get("page") === "veiligvertoon-admin-menu-styling") {
            tour.show(10);
        } else if (parameters.get("page") === "veiligvertoon-admin-menu-activation") {
            tour.show(12);
        }
    }

    // make sure to cancel the tour if the last step of the tour has been completed
    jQuery(document).on('click', '#vv-activationForm #submit', function () {
        cancelTour();
    })
});