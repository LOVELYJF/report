function editEvent(eventValue, callback) {
    layx.html('eventEdit', 'js编辑器', layx.multiLine(function () {
        /*
                     
        <style type="text/css">
            #eventEditor {
            margin: 0;
            position: absolute;
            top: 0;
            bottom: 40px;
            left: 0;
            right: 180px;
            font-size:16px;
        }
        #eventParams{
             margin: 0;
            position: absolute;
            top: 0;
            bottom: 40px;
            right: 0;
            width: 180px;
            border-left: 1px solid #495057;
            background-color:rgb(0, 34, 64);
        }
        #eventCtrl{
             margin: 0;
            position: absolute;
            height:40px;
            bottom: 0;
            right: 0;
            left:0;
            text-align:center;
            background-color:rgb(0, 34, 64);
        }
        #saveEventBtn{
            border: 1px solid #495057;
            width: 80px;
            font-size: 12px;
            border-radius: 5px;
            background-color: #263954;
        }
        #commonEvents{

        }
        #commonEvents li{
            font-size: 12px;
            border-radius: 10px;
            border: 1px solid;
            margin: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 10px;
            cursor: pointer;
        }
        #commonEvents li:hover{
            background-color: #6c757d;
            color: #fff;
        }
        </style>

        <pre id="eventEditor"></pre>
        <div id="eventParams">
            <ul id="commonEvents"><ul>
            <ul id="eventsBoxs"><ul>
        </div>
        <div id="eventCtrl">
            <button type="button" id="saveEventBtn">保存</button>
        </div>
        */
    }), {
        skin: "asphalt",
        storeStatus: false,
        shadable: true,
        width: 705,
        height: 805,
        minMenu: false,
        maxMenu: false,
        event: {
            onload: {
                // 加载之前，return false 不执行
                before: function (layxWindow, winform) {

                },
                // 加载之后
                after: function (layxWindow, winform) {
                    var eventEditor = ace.edit($(layxWindow).find("#eventEditor")[0]);
                    eventEditor.setTheme("ace/theme/cobalt");
                    eventEditor.session.setMode("ace/mode/javascript");
                    if (eventValue) {
                        eventEditor.setValue(eventValue);
                    }

                    $(layxWindow).find("#saveEventBtn").bind("click", function () {
                        eventEditor.setTheme("ace/theme/cobalt");
                        if (callback) {
                            callback.call(this, eventEditor.getValue());
                        }
                        layx.destroy(winform.id);
                    });
                    $.getJSON("../../statics/bddp/static/common-event/common.json", {},
                        function (data, textStatus, jqXHR) {
                            console.log(data)
                            var commonEvents = $(layxWindow).find("#commonEvents");
                            $.each(data.events, function (i, event) {
                                var li = $('<li title="' + event.desc + '">' + event.name + '</li>');
                                li.data(event);
                                $(commonEvents).append(li);
                                li.bind("click", function () {
                                    eventEditor.navigateFileEnd();
                                    eventEditor.insert("\n//"+$(this).data("desc")+"\n"+$(this).data("fun")+";");
                                })
                            });
                        }
                    );


                }
            }
        }
    });
}   