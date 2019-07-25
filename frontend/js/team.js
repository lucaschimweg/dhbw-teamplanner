// FIXING Firefox's broken anchor tag usage...
window.onload = function() {
    if (location.hash) {
        //remove # from the string
        var elId = location.hash.replace('#','');
        //locate the anchored element on the page by its ID property
        var scrollToEl = document.getElementById(elId);
        //scroll to the anchored element
        scrollToEl.scrollIntoView(true);
    }
    var atts = document.getElementsByTagName("html")[0].attributes;
    if ("data-errorMessage" in atts) {
        var val = atts["data-errorMessage"].value;
        if (val !== "") alert(val);
    }
};
