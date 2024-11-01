// add an event listener to intercept incoming messages from the safety information iframe environment
// to be able to dynamically update the dimensions of the iframe based its content.
window.addEventListener('message', event => {
    if (event.origin.startsWith(FRONT_END_BASE_URL)) {
        const eventData = event.data;

        if (eventData.name === "resizeIframe") {
            const iframeElement = document.getElementById("vvframe");
            iframeElement.style.height = eventData.frameHeight;
        }
    }
});

// after the page is done loading initilize the iframe source, 
// this to effectively render the iframe async so the user does not have to wait on it
window.addEventListener("load", function(event){
    const iframe = jQuery("#vvframe")

    // Check if iframe is found
    if (iframe.length === 0)
        return;

    // the timout of 0 seconds prevents the browser from thinking the page is still loading
    setTimeout(function () {
        // move the source url from the data attribute to the src to initialize the iframe
        iframe.attr('src', iframe.data("sourceUrl"));
        iframe.show();
      }, 0);   
  });