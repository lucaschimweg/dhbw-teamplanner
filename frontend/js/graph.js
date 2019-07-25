window.addEventListener('load', function() {
    document.getElementById("rightTabRadio").addEventListener('change', updateSvgSize);
    updateSvgSize();
}, false );

function updateSvgSize() {
    var svg = document.getElementById("svgGraph");
    var bbox = svg.getBBox();
    svg.setAttribute("width", bbox.x + bbox.width + "px");
    svg.setAttribute("height", bbox.y + bbox.height + 58 + "px");
}
