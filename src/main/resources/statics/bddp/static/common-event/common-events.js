function showOtherBddp(options) {
    options = options || {};
    //  console.log(window.event);
    // console.log(event);
    var e = event || window.event;
    var selectorName = "#" + e.target.id + "-iframe";
    var iframe;
    if ($(selectorName).length == 0) {
        iframe = $('<iframe src="" frameborder="0" id="'+e.target.id + "-iframe"+'" style=" position:absolute;width:' + options.width + 'px;height:' + options.height + 'px;z-index: -1;"></iframe>');
        iframe.appendTo("body");
        iframe.attr("src", (options.url||"../../modules/bddpdemo/demo2.html"));
    } else {
        iframe = $(selectorName);
    }
    var tween1 = KUTE.fromTo(
        selectorName, // element
        {
            translateX: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            width: 0,
            height: 0,
            top: options.fromTop,
            left: options.fromLeft
        }, // from values
        {
            translateX: (options.translateX || 20),
            translateY: (options.translateX || -80),
            translateZ: (options.translateX || -120),
            rotateX: (options.rotateX || 360),
            rotateY: (options.rotateY || 18),
            rotateZ: (options.rotateZ || 0),
            width: (options.toWidth || options.width),
            height: (options.toHeight || options.height),
            top: options.toTop,
            left: options.toLeft
        }, // to values
        {
            parentPerspective: 2000,
            parentPerspectiveOrigin: "center top"
        } // transform options
    );
    iframe.show().css({
        "z-index": 2,
        "box-shadow": "rgb(204, 204, 204) 0px 0px 20px 2px"
    });
    $("#content").addClass("filterBlur");
    !tween1.playing && tween1.start();

}

function hideOtherBddp(options) {
    var e = event || window.event;
    var selectorName = "#" + e.target.id + "-iframe";
    var tween2 = KUTE.fromTo(
        selectorName, // element
        {
            translateX: (options.translateX || 20),
            translateY: (options.translateX || -80),
            translateZ: (options.translateX || -120),
            rotateX: (options.rotateX || 360),
            rotateY: (options.rotateY || 18),
            rotateZ: (options.rotateZ || 0),
            width: (options.toWidth || options.width),
            height: (options.toHeight || options.height),
            top: options.toTop,
            left: options.toLeft
        }, // to values
        {
            translateX: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            width: 0,
            height: 0,
            rotateY: 0,
            top: options.fromTop,
            left: options.fromLeft
        }, // from values
        {
            parentPerspective: 2000,
            parentPerspectiveOrigin: "center top"
        } // transform options
    );
    !tween2.playing && tween2.start();
    $("#content").removeClass("filterBlur");
}