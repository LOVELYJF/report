function importData(e) {
    getAjaxData("../../bddp/getJSONFoldersContent", {path: e}, function (e) {
        if (0 == e.code) {
            emptyContent();
            var a = JSON.parse(e.res), t = a.content, o = a.boxs, n = a.ruler;
            setContentData(t), setBoxsData(o), setRulers(n), $(".file-content").fadeOut(function () {
                resizeContent()
            }), $(".box").removeClass("box-selected"), stack.commands = [], stack.savePosition = -1, stack.stackPosition = -1, undoData = $.extend(!0, {}, a), undoRecord(a), currBox = null
        }
    })
}

function importDataId(e) {
    getAjaxData("../../bddp/getJSONFoldersContentById", {id: e}, function (e) {
        if (1 == e.code){
            console.log("未查询到，跳转新建");
            createbd();
        }
        if (0 == e.code) {
            emptyContent();
            var a = JSON.parse(e.res), t = a.content, o = a.boxs, n = a.ruler;
            setContentData(t), setBoxsData(o), setRulers(n), $(".file-content").fadeOut(function () {
                resizeContent()
            }), $(".box").removeClass("box-selected"), stack.commands = [], stack.savePosition = -1, stack.stackPosition = -1, undoData = $.extend(!0, {}, a), undoRecord(a), currBox = null
        }
    })
}

function copyData(e, a) {
    getAjaxData("../../bddp/getJSONFoldersContentForCopy", {
        path: e,
        sourceId: a,
        id: $("#content").data("id")
    }, function (e) {
        0 == e.code && (setCopyBoxsData(JSON.parse(e.res).boxs), $(".file-content").fadeOut(function () {
            resizeContent()
        }), $(".box").removeClass("box-selected"), stack.commands = [], stack.savePosition = -1, stack.stackPosition = -1, currBox = null)
    })
}

function importDataOld(e) {
    getAjaxData("../../bddp/getJSONFileContent", {path: e}, function (e) {
        if (0 == e.code) {
            var a = JSON.parse(e.res), t = a.content, o = a.boxs, n = a.ruler;
            setContentData(t), setBoxsData(o), setRulers(n), $(".file-content").fadeOut(function () {
                resizeContent()
            }), $(".box").removeClass("box-selected"), stack.commands = [], stack.savePosition = -1, stack.stackPosition = -1, undoData = $.extend(!0, {}, a), undoRecord(a), currBox = null
        }
    })
}

function importDataForUndo(e) {
    if (e) {
        var a = e.content, t = e.boxs, o = e.ruler;
        setContentData(a), setBoxsData(t), setRulers(o), currBox = null, $(".box").removeClass("box-selected")
    }
}

function emptyContent() {
    var e = $("#content");
    e.empty(), e.append('<div id="contentHandle"></div>'), e.append('<div id="guide-h" class="guide"></div>'), e.append('<div id="guide-v" class="guide"></div>'), $("#sceneW").val(1920), $("#sceneH").val(1080), $("#scenebgcolor").spectrum("set", ""), $("#sceneName").val(""), $("#sitemap").empty(), e.css({
        width: "1920px",
        height: "1080px",
        "background-color": "",
        "background-image": ""
    }), e.data("width", 1920), e.data("height", 1080), e.data("backgroundColor", ""), e.data("backgroundImage", ""), e.data("sceneName", ""), e.data("dataFrom", ""), e.attr("data-id", guid()), e.data("id", guid()), $(".zxxRefLine_v").remove(), $(".zxxRefLine_h").remove(), e.data("url", ""), e.data("data", ""), globalDataBase = null, globalChartTheme = "default", resizeContent()
}

function setContentData(e) {
    var a = $("#content");
    a.empty(), a.append('<div id="contentHandle"></div>'), a.append('<div id="guide-h" class="guide"></div>'), a.append('<div id="guide-v" class="guide"></div>'), $("#sceneW").val(e.width), $("#sceneH").val(e.height), $("#scenebgcolor").spectrum("set", e.backgroundColor), $("#sceneName").val(e.sceneName), $("#bdbgPath").val(e.backgroundImage), $("#globalDataUrl").val(e.url), $(".database-content").find("input[type=radio]").removeProp("checked"), $("#globalDataFrom-" + e.dataFrom).prop("checked", !0), $(".database-content").find("input[type=radio]").checkboxradio({icon: !1}), $(".globalDataFromDiv").hide(), $("#globalDataFromDiv-" + e.dataFrom).show(), e.dataFrom, $("#globalDataFromDiv-1").show();
    var t = e.backgroundImage;
    t ? -1 < t.indexOf("url(") || (t = "url('" + (t = t.replace(/\\/g, "/")) + "')") : t = "", a.css({
        width: e.width + "px",
        height: e.height + "px",
        "background-color": e.backgroundColor,
        "background-image": t
    }), a.data("width", e.width), a.data("height", e.height), a.data("backgroundColor", e.backgroundColor), a.data("backgroundImage", e.backgroundImage || !1), a.data("sceneName", e.sceneName), a.data("url", e.url), a.data("globalChartTheme", e.globalChartTheme), a.data("dataFrom", e.dataFrom), e.id || (e.id = guid()), a.data("id", e.id), e.url ? (layx.load("initGlobalData-layx", "数据正在加载中，请稍后"), $.ajax({
        url: e.url,
        type: "get",
        dataType: "json",
        timeout: 2e3,
        success: function (e, a) {
            $("#globalJSONShow").JSONView(e, {collapsed: !0}), globalDataBase = e, $("#content").data("data", e)
        },
        complete: function (e, a) {
            layx.destroy("initGlobalData-layx"), console.log(e)
        },
        error: function (e, a, t) {
            layx.msg("全局数据加载失败", {dialogIcon: "error"})
        }
    })) : (globalDataBase = null, $("#globalJSONShow").JSONView({}, {collapsed: !0})), e.globalChartTheme ? globalChartTheme = "default" : globalChartTheme = e.globalChartTheme
}

function setBoxsData(e) {
    var t = 50, o = 50;
    $.each(e, function (e, a) {
        createTagsBox(a), o = a.rectP.zIndex > o ? a.rectP.zIndex : o, t = a.rectP.zIndex < t ? a.rectP.zIndex : t
    }), zIndexProp = {max: o, min: t}
}

function restBoxUUID() {
    $("#content").children(".box").each(function () {
        var e = $(this).data("prop");
        e.id = guid(), "swiper" == e.type && $(this).find(".box").each(function () {
            $(this).data("prop").id = guid()
        })
    })
}

function setCopyBoxsData(e) {
    var t = 50, o = 50;
    $.each(e, function (e, a) {
        a.id = guid(), createTagsBox(a), o = a.rectP.zIndex > o ? a.rectP.zIndex : o, t = a.rectP.zIndex < t ? a.rectP.zIndex : t
    }), zIndexProp = {max: o, min: t}
}

function setRulers(e) {
    $.pageRuler(e), $.pageRulerHide()
}