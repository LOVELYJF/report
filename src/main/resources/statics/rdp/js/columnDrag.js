var time = null;
function sortTable(table, idx) {
	$(".checkul").remove();
	var otable = document.getElementById(table), otody = otable.tBodies[0], otr = otody.rows, tarr = [];
	var theadtd = otable.getElementsByTagName("thead")[0].getElementsByTagName("td")[idx];
	var sortFlag = theadtd.getAttribute("sort");
	var width = theadtd.style.width;
	theadtd.style.setProperty('background-position-x', width);
	if(sortFlag=="desc"){
		theadtd.setAttribute("sort","asc");
		theadtd.setAttribute("class","sort_asc");
	}else if(sortFlag=="asc"){
		theadtd.setAttribute("sort","desc");
		theadtd.setAttribute("class","sort_desc");
	}else{
		theadtd.setAttribute("sort","asc");
		theadtd.setAttribute("class","sort_asc");
	}
	for ( var i = 0; i < otr.length; i++) {
		tarr[i - 0] = otr[i];
	}
	if (otody.sortCol == idx) {
		tarr.reverse();
	} else {
		tarr.sort(function(tr1, tr2) {
			var value1 = tr1.cells[idx].innerHTML;
			var value2 = tr2.cells[idx].innerHTML;
			if (!isNaN(value1) && !isNaN(value2)) {
				return value1 - value2;
			} else {
				return value1.localeCompare(value2);
			}
		});
	}
	var fragment = document.createDocumentFragment();
	for ( var i = 0; i < tarr.length; i++) {
		fragment.appendChild(tarr[i]);
	}
	otody.appendChild(fragment);
	otody.sortCol = idx;
}
// 拖动
function Drag(table) {
	var ochek = document.getElementById("page1"), 
	otable = document.getElementById(table), 
	otody = otable.tBodies[0], 
	oth = otable.getElementsByTagName("thead")[0].getElementsByTagName("td"),
	otd = otody.getElementsByTagName("td"),
	box = document.getElementById("box"),
	tempBox = $('<div style="display:none"></div>'),
	oth_length = oth.length,
	arrn = [];
	
	var e_onmousedown = function(obj){
		obj.onmousedown = function(e) {
			$(".checkul").remove();
			var e = e || window.event, target = e.target || e.srcElement, thW = target.offsetWidth, maxl = ochek.offsetWidth
					- thW, rows = otable.rows, ckL = ochek.offsetLeft, disX = target.offsetLeft, _this = this, cdisX = e.clientX
					- ckL - disX;
			for ( var i = 0; i < rows.length; i++) {
				var op = document.createElement("p");
				op.innerHTML = rows[i].cells[this.cellIndex].innerHTML;
				var height = $(rows[i].cells[this.cellIndex]).outerHeight(true);
				var width = $(rows[i].cells[this.cellIndex]).outerWidth(true);
				op.style.width = width+"px";
				op.style.height = height+"px";
				op.style.padding = 0+"px";
				op.style.margin = 0+"px";
				var backgroundColor = $(rows[i].cells[this.cellIndex]).css('background-color');
				var color = $(rows[i].cells[this.cellIndex]).css('color');
				var fontSize = $(rows[i].cells[this.cellIndex]).css('font-size');
				var fontWeight = $(rows[i].cells[this.cellIndex]).css('font-weight');
				if("rgba(0, 0, 0, 0)"==backgroundColor){
					backgroundColor = $(rows[i].cells[this.cellIndex]).parents("tr").css('background-color');
				}
				op.style.backgroundColor = backgroundColor;
				op.style.fontSize = fontSize;
				op.style.fontWeight = fontWeight;
				op.style.color = color;
				tempBox.append($(rows[i].cells[this.cellIndex]).prop("outerHTML"));
				box.appendChild(op);
			}
			for ( var i = 0; i < oth.length; i++) {
				arrn.push(oth[i].offsetLeft);
			}
			box.style.display = "block";
			box.style.width = thW + "px";
			box.style.left = disX+otable.offsetLeft + "px";
			box.style.top =  otable.offsetTop+"px";
			// 未完成 还有事件没写。
			document.onmousemove = function(e) {
				var e = e || window.event, target = e.target || e.srcElement, thW = target.offsetWidth;
				box.style.top = otable.offsetTop+"px";
				box.style.left = e.clientX+otable.offsetLeft - ckL - cdisX + "px";
				if (box.offsetLeft > maxl) {
					box.style.left = maxl + "px";
				} else if (box.offsetLeft < 0) {
					box.style.left = 0;
				}
				document.onselectstart = function() {
					return false;
				};
				window.getSelection ? window.getSelection().removeAllRanges()
						: doc.selection.empty();
			}
			document.onmouseup = function(e) {
				var e = e || window.event, opr = box.getElementsByTagName("p"), oboxl = box.offsetLeft
						+ cdisX;
				var index = 0;
				for ( var i = 0; i < arrn.length; i++) {
					if (arrn[i] < oboxl) { 
						index = i;
					}
				}
				;
				var thisIndex = _this.cellIndex;
				for ( var i = 0; i < rows.length; i++) {
					var trHtml = $("<tr></tr>");
					for ( var j = 0; j< oth_length; j++){
						if(thisIndex==j||index==j){
							if(thisIndex>=index){
								if(index==j){
									trHtml.append($(tempBox).find("td").eq(i).prop("outerHTML"));
								}else{
									trHtml.append($(rows[i].cells[index]).prop("outerHTML"));
								}
							}else{
								if(thisIndex==j){
									trHtml.append($(rows[i].cells[index]).prop("outerHTML"));
								}else{
									trHtml.append($(tempBox).find("td").eq(i).prop("outerHTML"));
								}
							}
						}else{
							trHtml.append($(rows[i].cells[j]).prop("outerHTML"));
						}
					}
					rows[i].innerHTML = trHtml.html();
					if(i!=0){
						for ( var k = 0; k < rows[i].cells.length; k++) {
							e_onmousedown(rows[i].cells[k]);
						}
					}else{
						for ( var k = 0; k < rows[i].cells.length; k++) {
							$(rows[i].cells[k]).unbind().bind("click",function(){
								var thisIndex = $(this).index();
								clearTimeout(time);
							    //执行延时
							    time = setTimeout(function(){
							    	sortTable('tableSort',thisIndex);
							    },300);
							});
						}
						changethead("tableSort");
					}
				}
				box.innerHTML = "";
				tempBox.html("");
				arrn.splice(0, arrn.length);
				box.style.display = "none";
				document.onmousemove = null;
				document.onmouseup = null;
				document.onselectstart = function() {
					return false;
				};
			}
		}
	}
	for ( var i = 0; i < otd.length; i++) {
		e_onmousedown(otd[i]);
	}
}
function changethead(tableId){
	$('#'+tableId).find("thead tr td").unbind("dblclick").bind("dblclick",function(e){
		clearTimeout(time);
		var mousePos = getMousePos(e);
		var $ul = $(".checkul");
		if($ul.length){
			$ul.css({"top":mousePos.y,"left":mousePos.x});
		}else{
			$ul = $('<ul class="checkul" style=" display: block;position: fixed;width: 85px;min-height: 30px;border: 1px solid;padding-left: 5px;background: white; border-radius: 2px; border: 1px solid #E6E5E5;-moz-box-shadow:0px 1px 7px #333333; -webkit-box-shadow:0px 1px 7px #333333; box-shadow:0px 1px 7px #333333;"></ul>');
			$ul.css({"top":mousePos.y,"left":mousePos.x});
			var $theadTd = $(this);
			$theadTd.parent("tr").find("td").each(function(index,o){
				var $li = $('<li style="text-align: left;"></li>');
				var check = $(this).attr("check")===undefined||$(this).attr("check")=="true"?true:false;
				$li.append('<input type="checkbox" value="'+index+'"/>'+$(this).text());
				$li.find("input[type='checkbox']").prop("checked",check);
				$ul.append($li);
			});
			$ul.append('<li><input type="button" value="提交" style="height: 20px;background: #00A3FF;border-radius: 2px;font-size: 12px;color: #FFF;cursor: pointer;border: none;padding: 1px 8px;"/></li>');
			$ul.find("input[type='button']").bind("click",function(){
				var arr = new Array();
				var count = 0;
				$(this).parents("ul").find("input[type='checkbox']").each(function(i,o){
					var val = $(this).val();
					if($(this).prop("checked")){
						$theadTd.parent("tr").find("td").eq(val).attr("check",true);
						count++;
						arr[i]=true;
					}else{
						$theadTd.parent("tr").find("td").eq(val).attr("check",false);
						arr[i]=false;
					}
				});
				if(count==0){
					alert("未选择任何列！");
				}else{
					hidenTd(tableId,arr);
					$ul.remove();
				}
			});
			$("body").append($ul);
		}
	});
}
function hidenTd(table,arr){
	var colrow = getMerg(table);
	var $table = $("#"+table);
	$table.find("tr").each(function(trindex,tro){
		$(this).find("td").each(function(tdindex,tdo){
			if(colrow[trindex][tdindex]==1){
				if(arr[tdindex]){
					$(this).show();
				}else{
					$(this).hide();
				}
			}
		});
	});
}
function getMousePos(event) {  
    var e = event || window.event;  
    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;  
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;  
    var x = e.pageX || e.clientX + scrollX;  
    var y = e.pageY || e.clientY + scrollY;  
    return { 'x': x, 'y': y };  
}  

function getMerg(table){
	var $table = $("#"+table);
	var maxCol = $table.find("tbody tr")[0].cells.length;
	var rows = $table[0].rows.length ;
	var colrow = new Array(new Array(maxCol));
	for(var i =0 ;i<rows;i++){
		colrow[i] = new Array(maxCol); 
	}
	$table.find("tr").each(function(trIndex,trObj){
		for(var i=0; i<maxCol;i++){
			if(colrow[trIndex][i]==0){
				continue;
			}else{
				var maxtd =  $(trObj).find("td").size();
				var rowspan = $(trObj).find("td").eq(i).attr("rowspan")==undefined?1:$(trObj).find("td").eq(i).attr("rowspan");
				var colspan = $(trObj).find("td").eq(i).attr("colspan")==undefined?1:$(trObj).find("td").eq(i).attr("colspan");
				if(maxtd>=i){
					for(var k=0;k<rowspan;k++){
						for(var p=0;p<colspan;p++){
							if(k==0&&p==0){
								colrow[trIndex+k][i+p]= 1;
							}else if(colrow[trIndex+k][i+p]!=1){
								colrow[trIndex+k][i+p]= 0;
							}
						}
					}
				}
			}
		}
	});
	return colrow;
}
function initcol(tableId){
	if($(".sort_content").length>0){
		$(".sort_content").find(".col_div").find("input[type='button']").click();
		return;
	}
	var $sort_seach = $('<div class="sort_seach" style="text-align: left;padding: 5px 5px 5px 20px;margin: 5px;border: 1px solid #a0a2a5;border-radius: 2px;color: #323437;background-color: #fff;-webkit-box-shadow: 0 1px 5px rgba(0,0,0,.2);box-shadow: 0 1px 5px rgba(0,0,0,.2);"></div>');
	var $div = $('<div class="sort_content" style="position:  fixed;width: 100%;top: 0px;z-index: 1;background-color: white;"></div>');
	$div.append($sort_seach);
	$("#datalist").before($div);
	$sort_seach.append('<div class="btn"><input type="button" value="自定义列" style="user-select: none;outline: 0;margin-bottom: 5px;width: 80px;height: 25px;line-height: 25px;border: 1px solid #d9dbdc;border-radius: 2px;color: #1276e5;background-color: #fff;cursor: pointer;font-size: 12px;"/></div>');
	var $seachDiv = $('<div class="col_div" style="display:none;"></div>');
	$sort_seach.append($seachDiv);
	$sort_seach.find(".btn").find("input[type='button']").bind("click",function(){
		$(".col_div").toggle(300,function(){
			$("#datalist").css({"top":$(".sort_content").outerHeight(true)});
		});
	});
	$("#page1").find("table thead tr td").each(function(index,o){
		var $span = $('<span class="checkbox_item"><input type="checkbox" value="'+index+'"/><label class="check_label on"><i class="checkbox_icon "></i><em class="checkbox_text">'+$(this).text()+'</em></label></span>');
		$span.find("input[type='checkbox']").prop("checked",true);
		$seachDiv.append($span);
	});
	$seachDiv.find(".check_label").checkbox();
	$seachDiv.append('<div><input type="button" value="确定" style="margin-top: 5px;display: inline-block;zoom: 1;padding: 4px 12px;border: 1px solid #d9dbdc;border-radius: 2px;text-align: center;line-height: 1;color: #0063d0;border-color: #d9dbdc;background-color: white;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;"/></div>');
	
	$("#datalist").css({"top":$(".sort_content").outerHeight(true),"position":"relative"});
	$sort_seach.find("input[type='button']").bind("click",function(){
		var arr = new Array();
		var count = 0;
		var $thisbutton = $(this);
		$thisbutton.parents(".sort_seach").find(".col_div").find("input[type='checkbox']").each(function(i,o){
			var val = $(this).val();
			if($(this).prop("checked")){
				count++;
				arr[i]=true;
			}else{
				arr[i]=false;
			}
		});
		if(count==0){
			alert("未选择任何列！");
		}else{
			hidenTd(tableId,arr);
		}
	});
}
$(function(){
	function createStyleSheet() {
		var head = document.head || document.getElementsByTagName('head')[0];
		var style = document.createElement('style');
		style.type = 'text/css';
		head.appendChild(style);
		var code = '.sort_asc{background:#ececec url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAV0lEQVQ4T2NkIBMw4tL3////AyA5RkZGB2xqRjUOqcDRZ2BguMDAwHCRkZGxADk+CcWjPUgTAwODAyMj4wdSNApg0wROUXiS3AQGBoYGdJtg6nFqJJT2AWw4Ng+GpYxlAAAAAElFTkSuQmCC) no-repeat 14px 13px;}';
		code += '  .sort_desc{background:#ececec url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAYElEQVQ4T+3SwQmAQAxE0T8d2IFbglaoJdiRlmQHIzksyLroehTMOY9hQsTD2O4k7eWa7lwgYJU0NsOMgEHSJaCaeEaR9AYukQQkoG+GuY/tGZh+WPmEbx0nHiBJ2somBwrcOA8tqIZuAAAAAElFTkSuQmCC) no-repeat 14px 13px;}';
		try{
	        style.appendChild(document.createTextNode(code));
	    }catch(ex){
	        style.styleSheet.cssText = code;
	    }
	 }
	createStyleSheet();
	
	$.fn.extend({
		checkbox : function(){
			return this.each(function(){
				var $this = $(this);
				if($this.hasClass("on")){
    				$this.siblings("input").prop("checked","checked");
    			}else{
    				$this.siblings("input").removeAttr("checked");
    			}
    			$this.on("click",function(){
					if($this.hasClass("on")){
						$this.siblings("input").removeAttr("checked");
						$this.removeClass("on");
					}else{
						$this.siblings("input").prop("checked","checked");
						$this.addClass("on");
					}
				});	
			});
		}});
});
