function createParmHtml(jsonarr) {
	var dataTags = [];
	var multSelectTags = [];
	var dateRender = [];
	
	var pevent = function(data){
		var events = "";
		$.each(data,function(key,val){
			if(val!==undefined&&val!=null&&val!=""){
				events+=' on'+key+'="'+val+'" ';
			}
		});
		return events;
	};
	if(flag){
		$.each(jsonarr, function(index, node) {
			if(node.custom!=1){
				return false;
			}
			var boxCss = {"top":node.y+"px",
					  "left":node.x+"px",
					  "width":node.width+"px",
				      "height":node.height+"px",
				      "line-height":node.height+"px"};
			var lableCss = {"width":node.widthL+"%"};
			var fidldCss = {"width":node.widthR+"%"};
			var html = $('<div class="form-group"></div>');
			var label = $('<label class="form-label"></label>');
			if (node.cname) {
				label.text(node.cname);
			} else {
				label.text(node.key);
			}
			if(node.selRange==0||node.selRange==1){
				html.append(label);
			}
			if ("dynamic" == node.ptype) {
				html.hide();
	        }
			label.css(lableCss);
			html.css(boxCss);
			if (node.showtype && (node.showtype == "select"||node.showtype=="multiple")) {
				var select = $('<select name="' + node.key + '" id="' + node.key +'" class="form-select" '+pevent(node.event)+'></select>');
				if (!node.keylist || node.keylist.indexOf(":") == -1) {
					if(check.isNotNull(node.fieldSize)&&window[node.fieldSize]){
						var keyList = "";
						if(typeof window[node.fieldSize]  === "function"){
							keyList = window[node.fieldSize].call(this);
						}else{
							keyList = window[node.fieldSize];
						}
						popupSelection.createOption(select,keyList);
					}else{
						select.append("<option value=''></option>");
						select.append("<option value='" + node.value + "'>" + node.value + "</option>");
					}
				} else {
					popupSelection.createOption(select,node.keylist);
				}
				select.css(fidldCss);
				if(node.selRange==0||node.selRange==2){
					html.append(select);
				}
	            if (node.showtype=="multiple") {
	               select.css("display","none");
	               multSelectTags.push(node);
	            }
			} else if (node.showtype && (node.showtype == "date" || node.showtype == "year" || node.showtype == "month" || 
					node.showtype == "time" || node.showtype == "datetime")) {
				var input = $('<input name="' + node.key + '" id="' + node.key + '" value="' + node.value +'" class="form-input" autocomplete="off" type="text" '+pevent(node.event)+'/>');
				input.css(fidldCss);
				if(node.selRange==0||node.selRange==2)
				html.append(input);
				dataTags.push(node);
			} else if(node.showtype=="radio"){ 
				var value = encodeURIComponent(node.value);
				var span = $('<span class="form-input"></span>');
				node.keylist = window[node.fieldSize];
				if (node.keylist&& node.keylist.indexOf(":") == 1) {
					if (node.keylist.indexOf(",") != -1) {
						var keys = node.keylist.split(",");
						for (var i = 0; i < keys.length; i++) {
							span.append('<lable class="radio_text">'+keys[i].split(":")[0]+'</lable>');
							var input = $('<input name="' + node.key + '" value="' +keys[i].split(":")[1] +'" type="radio" class="radio_text"'+pevent(node.event)+'/>');
							input.find("input").css(fidldCss);
							span.append(input);
						}
					}
				}
				span.css(fidldCss);
				//html.append(span);
			} else if(node.showtype=="checkbox"){
				var value = encodeURIComponent(node.value);
				var input = $('<input name="' + node.key + '" id="' + node.key + '" value="' +value +'" class="form-input" type="text" '+pevent(node.event)+'/>');
				input.css(fidldCss);
				//html.append(input);
			} else if(node.showtype=="render"){ 
				var value = encodeURIComponent(node.value);
				var input = $('<input name="' + node.key + '" id="' + node.key + '" value="' +value +'" class="form-input" type="text" '+pevent(node.event)+'/>');
				input.css(fidldCss);
				html.append(input);
				dateRender.push(node);
			} else if(node.showtype == "radio-pop"){
				var select = $('<select name="' + node.key + '" id="' + node.key +'" class="form-select" '+pevent(node.event)+'></select>');
				if (!node.value || node.value.indexOf(":") == -1) {
					select.append("<option value=''></option>");
					select.append("<option value='" + node.value + "'>" + node.value + "</option>");
				} else {
					popupSelection.createOption(select,node.value);
				}
				select.css(fidldCss);
				html.append(select);
				popupSelection.checkInit(select,node.cname);
			}else if(node.showtype == "checkbox-pop"){
				var select = $('<select name="' + node.key + '" id="' + node.key +'" class="form-select" '+pevent(node.event)+'></select>');
				if (!node.value || node.value.indexOf(":") == -1) {
					select.append("<option value=''></option>");
					select.append("<option value='" + node.value + "'>" + node.value + "</option>");
				} else {
					popupSelection.createOption(select,node.value);
				}
				select.css(fidldCss);
				html.append(select);
				popupSelection.checkInit(select,node.cname,true);
			}else if(node.showtype == "radio-pop-tree"){
				var value = encodeURIComponent(node.value);
				var input = $('<input name="' + node.key + '" id="' + node.key + '" value="' +value +'" class="form-input" type="text" '+pevent(node.event)+'/>');
				html.append(input);
				popupSelection.treeInit(input,node.cname,false,node.fieldSize);
			}else if(node.showtype == "checkbox-pop-tree"){
				var value = encodeURIComponent(node.value);
				var input = $('<input name="' + node.key + '" id="' + node.key + '" value="' +value +'" class="form-input" type="text" '+pevent(node.event)+'/>');
				html.append(input);
				popupSelection.treeInit(input,node.cname,true,node.fieldSize);
			}else {
				var value = encodeURIComponent(node.value);
				var input = $('<input name="' + node.key + '" id="' + node.key + '" value="' + value + '" class="form-input" type="text" '+pevent(node.event)+'/>');
				input.css(fidldCss);
				if(node.selRange==0||node.selRange==2)
				html.append(input);
			}
			if($('#'+node.key).attr('type')!='hidden'){
				html.appendTo($("#searchaddition"));
			}
		});
	}else{
		$.each(jsonarr, function(index, node) {
			if (node.showtype && (node.showtype == "select"||node.showtype=="multiple")) {
				if($('#'+node.key)){
					$('#'+node.key).empty();
					var select = '';
					if (!node.keylist || node.keylist.indexOf(":") == -1) {
						select+="<option value=''></option>";
						select+="<option value='" + node.value + "'>" + node.value + "</option>";
					} else {
						popupSelection.createOption(select,node.keylist);
					}
					$('#'+node.key).append(select);
		            if (node.showtype=="multiple") {
		                multSelectTags.push(node);
		            }
	            }
			}
		});
	}
	for (var i = 0; i < dataTags.length; i++) {
		var format = dataTags[i].format ? dataTags[i].format : "yyyy-MM-dd";
		laydate.render({
			elem : '#' + dataTags[i].key,
			format : format,
			type : dataTags[i].showtype
		});
	}
	for (var i = 0; i < dateRender.length; i++) {
		var node = dateRender[i];
		var format = node.format ? node.format : "yyyy-MM-dd";
		laydate.render({
		  elem: '#'+node.key,
		  range: true,
		  done: function(value, date, endDate){
			  var endnode = $("#"+node.fieldStyle);
			  if(endnode.length>0){
				  var dates = value.split(" - ");
				  setTimeout(function(){
					  $('#'+node.key).val(dates[0]);
				  }, 1);
				  endnode.val(dates[1]);
			  }
		  }
		});
	}
	for (var i = 0; i < multSelectTags.length; i++) {
        $('#'+multSelectTags[i].key).popupSelection({
			searchOn: true, //启用搜索
			inline: true, //弹出层
			multiple: true, //多选
			title:multSelectTags[i].cname,
			cellCount: 4, //每行选项个数
			labelShow:true //是否在选择区域显示label标签
		});
	}
}

function initSearchParm(uuid,autosub) {
    var surl = contextPath+'/rdppub/showparam';
    var loadpage = function(qa){
    	if(!qa){return;}
    	if(qa.css){loadStyle(Base64Util.decode64(qa.css));}
    	if(qa.js){loadScript(Base64Util.decode64(qa.js));}
    	if(qa.height){$(".rt-parmlist").height(parseInt(qa.height)+10);}
    }
    var sdata = {uuid: uuid};
    $.ajax({
        url: surl,
        cache: false,
        data: sdata,
        type: "post",
        success: function (res) {
            var data= res.data;
            if (data.searchParmJson.length <= 0) {
                $("#parmlist").hide();
            } else {
            	loadpage(data.queryArea);
                createParmHtml(data.searchParmJson);
                $("#searchaddition").append('<input type="submit" onclick="test()" value="查询" id="searchlist" />')
            }
            if(autosub==1){
            	$("#searchaddition").submit();
            }
        }
    });
}
var setting = {
	data: {
		simpleData: {
			enable: true
		}
	}
};
var check ={
		isNotNull:function(val){
		if(val!==undefined&&val!=null&&val!=""){
			return true;
		}else{
			return false;
		}
	}	
};

var popupSelection = {
		checkInit:function(obj,title,flag){
			$(obj).popupSelection({
				searchOn: true, //启用搜索
				inline: false, //弹出层
				multiple: flag, //多选
				title:"选择"+title,
				changeCallback:function(d){
				},
				cellCount: 4, //每行选项个数
				labelShow:true//是否在选择区域显示label标签
			});
		},treeInit:function(obj,title,flag,key){
			$(obj).popupSelection({
				searchOn: true, //启用搜索
				multiple: flag, //单选
				title: title,
				items:popupSelection.getItems(key),
				ztree: true
				,changeCallback:function(d){
				},
				ztreeSetting: setting,
				changeCallback:function(elem){
				}
			});
		},getItems:function(key){
			var items = [];
			if(window[key]!==undefined){
				items = window[key];
			}else{
				 $.ajax({
			        url: contextPath+'/rdpparm/parm/'+key,
			        cache: false,
			        async:false,
			        type: "post",
			        success: function (res) {
			        	items = res.data;
			        }
			    });
			}
			return items;
		},createOption:function(select,keyList){
			if (keyList.indexOf(",") != -1) {
				var keys = keyList.split(",");
				select.append("<option value=''></option>");
				for (var i = 0; i < keys.length; i++) {
					select.append("<option value='" + keys[i].split(":")[1] + "'>" + keys[i].split(":")[0] + "</option>");
				}
			} else {
				select.append("<option value='" + keylist.split(":")[1] + "'>" + keylist.split(":")[0] + "</option>");
			}
		}
};
function loadScript(jsContent, callback) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	if (typeof (jsContent) != "undefined") {
		if (script.readyState) {
			script.onreadystatechange = function() {
				if (script.readyState == "loaded"
						|| script.readyState == "complete") {
					script.onreadystatechange = null;
					callback();
				}
			};
		} else {
			script.onload = function() {
				callback();
			};
		}
	}
	script.appendChild(document.createTextNode("\n" + jsContent + "\n"));
	document.head.appendChild(script);
}

function loadStyle(cssString) {
	var style = document.createElement("style");
	style.setAttribute("type", "text/css");
	if (style.styleSheet) {// IE
		style.styleSheet.cssText = cssString;
	} else {// w3c
		var cssText = document.createTextNode("\n" + cssString + "\n");
		style.appendChild(cssText);
	}
	var heads = document.getElementsByTagName("head");
	if (heads.length) {
		heads[0].appendChild(style);
	} else {
		doc.documentElement.appendChild(style);
	}
}
var flag = true;// 重复执行标志
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

//获取查询条件
function initParm(autosub) {
	if(flag){
        if(autosub==0){
       		flag=false;
        }else{
    		initSearchParm(uuid,autosub);
        }
    }
}
$(function () {
	var actionurl = contextPath+'/rdppage/show/'+uuid;
    $('#btnSearch').attr('action',actionurl);
    initParm(1);
    $(".rt-swicth").bind("click", function () {
        if ($(".rt-parmlist").hasClass("on")) {
            $(".rt-parmlist").removeClass("on").css("margin-top", -$(".rt-parmlist").height());
            $("body").css("overflow","hidden");
        } else {
            $(".rt-parmlist").addClass("on").css("margin-top", 0);
            $("body").css("overflow","auto");
        }
    });
    $("body").css("overflow","auto");
})