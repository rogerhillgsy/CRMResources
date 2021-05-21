// Watch for the custom control dialog iframe being added.
var observer = new MutationObserver( function(mutations, me ) {
    // InlineDialog1_Iframe
    var iframe = mutations.find((a) => a.addedNodes.length > 0 && a.addedNodes[0].name === "InlineDialog1_Iframe")
    if (!!iframe ) {
        iframe=iframe.addedNodes[0];
        iframe.onload = function(e) {
            // When the custom control iframe is added, located the textarea field and tweak to accept more than 100 chars, and be resizable.
            var textarea = iframe.contentDocument.getElementById("txtAreaStaticValue");
            if (!!textarea) {
                textarea.removeAttribute("maxlength");
                style = textarea.getAttribute("style");
                textarea.setAttribute("style", style + "resize: both;") 
            }
        
        }
    }
  }   
);

observer.observe(document.body, {childList : true, subtree:true});