(function ($) {
	$.fn.fixedHead = function(options){
		var $this = $(this);
		var index = $this.index();
		var width = $this.outerWidth();
		var top = $this.offset().top;
		var left = $this.offset().left;
		var thead =  $this.find("thead").prop("outerHTML");
		var $table = $('<table class="fixedHead-'+index+'"></table>');
		$table.append(thead);
	 	$table.width(width);
	 	$table.css({"position":"fixed","top":top,"left":left});
	 	$this.after($table);
	 	$(window).resize(function() {
			var margintop = $this.offset().top;
			var marginleft = $this.offset().left;
			var left = $(document).scrollLeft();
			$table.css({"top":margintop,"left":(marginleft-left)});
		});
		$(window).scroll(function() {
			var margintop = $this.offset().top;
			var marginleft = $this.offset().left;
			var left = $(document).scrollLeft();
			$table.css({"top":margintop,"left":(marginleft-left)});
		}); 
	};
	
	$.fn.fixedCol = function(options){
		if(options!=undefined){
			var $this = $(this);
			var index = $this.index();
			var cols = options.cols;
			var headtop = $this.find("thead").offset().top;
			var tbodytop = $this.find("tbody").offset().top;
			var left = $this.find("thead tr td").eq(cols[0]).offset().left;
			var $table_thead = $('<table class="fixedCol-'+index+'"><thead></thead></table>');
			var $table = $('<table class="fixedCol-'+index+'"><tbody></tbody></table>');
			$this.find("thead tr").each(function(trIndex,trObj){
				var $tr = $('<tr></tr>');
				$.each(cols,function(i){
					var $td = $(trObj).find("td").eq(i);
					$tr.append($td.prop("outerHTML"));
					$tr.find("td").eq(i).width($td.width());
				});
				$table_thead.find("thead").append($tr);
			});
			$table_thead.css({"position":"fixed","top":headtop,"left":left,"z-index":1});
			
			var maxCol = $this.find("tbody tr")[0].cells.length;
			var rows = $this[0].rows.length ;
			var colrow = new Array(new Array(maxCol));
			for(var i =0 ;i<rows;i++){
				colrow[i] = new Array(maxCol); 
			}
			$this.find("tbody tr").each(function(trIndex,trObj){
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
			$this.find("tbody tr").each(function(trIndex,trObj){
				var $tr = $('<tr></tr>');
				$.each(cols,function(i){
					if(colrow[trIndex][i]==1){
						var $td = $(trObj).find("td").eq(i);
						$tr.append($td.prop("outerHTML"));
						$tr.find("td").eq(i).width($td.width());
					}
				});
				$table.find("tbody").append($tr);
			});
		 	$table.css({"position":"fixed","top":tbodytop,"left":left});
			$this.after($table_thead);
			$this.after($table);
			$(window).resize(function() {
				$this.find("thead tr").each(function(trIndex,trObj){
					$.each(cols,function(i){
						var $td = $(trObj).find("td").eq(i);
						$table_thead.find("tr").eq(trIndex).find("td").eq(i).width($td.width());
					});
				});
				var margintop = $this.find("tbody").offset().top;
				var top = $(document).scrollTop();
				var left = $this.find("thead tr td").eq(cols[0]).offset().left;
				$table.css({"top":margintop-top,"left":left});
				$table_thead.css({"left":left});
			});
			$(window).scroll(function() {
				var margintop = $this.find("tbody").offset().top;
				var left = $this.find("thead tr td").eq(cols[0]).offset().left;
				var top = $(document).scrollTop();
				$table.css({"top":margintop-top,"left":left});
				$table_thead.css({"left":left});
			}); 
		}
	};
	
	$.fn.sortTable = function(){
		var $this = $(this);
		$this.find("tr td").each(function(){
			$(this).data("text",$(this).html());
		});
		$this.find("tr td").bind("click", function(i,obj) {
	 		var sortObj = {sortField:"",sortType:""};
	 		sortObj = {sortField:$(this).data("name")};
	 		$(this).siblings('td').removeClass("desc").removeClass("asc").each(function(){
	 			if($(this).data("sorttype")==0||$(this).data("sorttype")==1){
	 				$(this).html($(this).data("text")+'<i class="fa fa-exchange fa-rotate-90"></i>');
	 			}else{
	 				$(this).html($(this).data("text"));
	 			}
	 		});
	 		if($(this).hasClass("desc")){
	 			$(this).html($(this).data("text")+'<i class="fa fa-long-arrow-up"></i>');
	 			$(this).removeClass("desc").addClass("asc");
	 			sortObj.sortType="ASC";
	 		}else{
	 			$(this).html($(this).data("text")+'<i class="fa fa-long-arrow-down"></i>');
	 			$(this).removeClass("asc").addClass("desc");
	 			sortObj.sortType="DESC";
	 		}
	 		sortArr = [];
	 		sortArr.push(sortObj);
	 		$("#tableSortVal").val(JSON.stringify(sortArr));
	 		sortTable($this,i,"string");
	 	});
	};
	//高亮
	$.fn.highlight = function(options){
		if(options!=undefined){
			var $this = $(this);
			var cols = options.cols;
			var start = options.start;
			var end = options.end;
			var innum = options.innum;
			$this.find("tbody tr").each(function(trIndex,trObj){
				var $thisTr = $(trObj);
				var highlightFlag = false;
				var highlightFlag1 = false;
				$.each(cols,function(colsIndex,i){
					var $td = $thisTr.find("td").eq(i);
					var text = $td.text();
					if(start!=undefined&&end!=undefined){
						if(start<text&&text<=end){
							highlightFlag = true;
						}else{
							highlightFlag = false;
						}
					}
					if(innum!=undefined&&innum!=null&&innum!=""){
						$.each(innum,function(index,rowNum){
							if(rowNum==text){
								highlightFlag1 = true;
							}
						});
					}
				});
				if(highlightFlag||highlightFlag1){
					$thisTr.css({"background-color":"beige"});
					$thisTr.find("td").each(function(i,tdobj){
						$(tdobj).css({"cssText":"border-bottom:1px solid white !important;"});
					});
					$.each(cols,function(colsIndex,i){
						var $td = $thisTr.find("td").eq(i);
						$td.css({"font-weight":"bold"});
					});
				}
			});
		}
	};
})(jQuery);


//排序函数产生器，iCol表示列索引，sDataType表示该列的数据类型
function generateCompareTRs(iCol, sDataType) {
	return function compareTRs(oTR1, oTR2) {
		var val1 = "";
		var val2 = "";
		var vValue1,vValue2;
		if(oTR1.cells[iCol].firstChild!=null){
			val1 = oTR1.cells[iCol].firstChild.nodeValue;
			if(oTR1.cells[iCol].firstChild.localName=="a"){
				val1 = oTR1.cells[iCol].firstChild.firstChild.nodeValue;
			}
		}
		if(oTR2.cells[iCol].firstChild!=null){
			val2 = oTR2.cells[iCol].firstChild.nodeValue;
			if(oTR2.cells[iCol].firstChild.localName=="a"){
				val2 = oTR2.cells[iCol].firstChild.firstChild.nodeValue;
			}
		}
		if(isNumber(val1)&&isNumber(val2)){
			vValue1 = convert(toThousands(val1), "float");
			vValue2 = convert(toThousands(val2), "float");
			if (vValue1 < vValue2) {
				return -1;
			} else if (vValue1 > vValue2) {
				return 1;
			} else {
				return 0;
			}
		}else if(isDate(val1)&&isDate(val2)){
			vValue1 = convert(toThousands(val1), "date");
			vValue2 = convert(toThousands(val2), "date");
			if (vValue1 < vValue2) {
				return -1;
			} else if (vValue1 > vValue2) {
				return 1;
			} else {
				return 0;
			}
		}else if(isChineseChar(val1)||isChineseChar(val2)){
			if(isChineseChar(val1)){
				vValue1 = makePy(val1)[0];
			}else{
				vValue1 = val1;
			}
			if(isChineseChar(val2)){
				vValue2 = makePy(val2)[0];
			}else{
				vValue2 = val2;
			}
			vValue1=vValue1.substring(1,0);
			vValue2=vValue2.substring(1,0);
			var str = vValue1.localeCompare(vValue2);
			return str;
		}else{
			vValue1 = convert(toThousands(val1), sDataType);
			vValue2 = convert(toThousands(val2), sDataType);
			var str = vValue1.localeCompare(vValue2);
			return str;
		}
	};
}

//排序方法
function sortTable(sTableID, iCol, sDataType) {
	var oTable = $(sTableID)[0];
	var oTBody = oTable.tBodies[0];
	var colDataRows = oTBody.rows;
	var aTRs = new Array;

	// 将所有列放入数组
	for (var i = 0; i < colDataRows.length; i++) {
		aTRs[i] = colDataRows[i];
	}

	// 判断最后一次排序的列是否与现在要进行排序的列相同，是的话，直接使用reverse()逆序
	if (oTable.sortCol === iCol) {
		aTRs.reverse();
	} else {
		// 使用数组的sort方法，传进排序函数
		aTRs.sort(generateCompareTRs(iCol, sDataType));
	}

	var oFragment = document.createDocumentFragment();
	for (var i = 0; i < aTRs.length; i++) {
		oFragment.appendChild(aTRs[i]);
	}

	oTBody.appendChild(oFragment);
	// 记录最后一次排序的列索引
	oTable.sortCol = iCol;
}

/*var $dynamic = $(".dynamic");
		var width = $dynamic.outerWidth();
		var top = $dynamic.offset().top;
		var left = parseInt($dynamic.css('marginLeft'));
	 	var tr =  $dynamic.find("thead tr").prop("outerHTML");
	 	var table = $("<table><thead></thead></table>");
	 	table.find("thead").append(tr);
	 	table.width(width);
	 	table.css({"position":"fixed","top":top,"left":left});
	 	table.click(function(){
	 		var left = $dynamic.css('marginLeft');
	 	});
	 	$dynamic.after(table);
	 	
	 	$(window).resize(function() {
			var margintop = $dynamic.offset().top;
			var marginleft = parseInt($dynamic.css('marginLeft'));
			//var top = $(document).scrollTop();
			var left = $(document).scrollLeft();
	 		table.css({"top":margintop,"left":(marginleft-left)});
		});
		
		$(window).scroll(function() {
			var margintop = $dynamic.offset().top;
			var marginleft = parseInt($dynamic.css('marginLeft'));
			//var top = $(document).scrollTop();
			var left = $(document).scrollLeft();
	 		table.css({"top":margintop,"left":(marginleft-left)});
		}); */