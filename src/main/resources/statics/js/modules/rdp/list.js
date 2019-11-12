$(function () {
	$("#jqGrid").jqGrid({
		url: baseURL + 'rdp/selectAllReportFile?kw=',
		datatype: "json",
		colModel: [{
				label: 'UUID',
				name: 'uuid',
				index: 'uuid',
				search: true,
				formatter: function (value, options, row) {
					return '<a href="../../rdppage/main/'+value+'" target="view_window">'+value+'</a>';
				}
			},
			{
				label: '报表名称',
				name: 'name',
				index: 'name',
				search: true
			},
			{
				label: '报表类型',
				name: 'reportStyle',
				index: 'reportStyle',
				width: 80
			},
			{
				label: '版本号',
				name: 'version',
				index: 'version',
				align: "center",
				width: 40
			},
			{
				label: '操作',
				name: '',
				width: 100,
				formatter: function (value, options, row) {
					var btns = [{
						"lable": "修改",
						"fun": "updateReport('" + row.uuid + "')"
					}, {
						"lable": "删除",
						"fun": "deleteReport('" + row.uuid + "')"
					}];
					return formatterBtn(btns);
				}
			}
		],
		viewrecords: true,
		height: window.innerHeight - $(".grid-btn").outerHeight(true) - 100,
		rowNum: 10,
		rowList: [10, 30, 50],
		rownumbers: true,
		rownumWidth: 25,
		autowidth: true,
		loadonce: true,
		multiselect: false,
		pager: "#jqGridPager",
		jsonReader: {
			root: "list"
		},
		gridComplete: function () {
			//隐藏grid底部滚动条
			$("#jqGrid").closest(".ui-jqgrid-bdiv").css({
				"overflow-x": "hidden"
			});
		}
	});
});

var vm = new Vue({
	el: '#rrapp',
	data: {
		q: {
			name: null
		},
		showList: true,
		title: null,
		dict: {}
	},
	methods: {
		query: function () {
			vm.reload();
		},
		reload: function (event) {
			vm.showList = true;
			jQuery("#jqGrid").jqGrid('setGridParam', {
				datatype: 'json',
				page: 1
			}).jqGrid('setGridParam', {
				url: baseURL + 'rdp/selectAllReportFile?kw=' + (vm.q.key?vm.q.key:""),
				page: 1
			}).trigger("reloadGrid");
		},
		add:function(){
			window.open("rdpDesign.html","_blank");    
		},
		refresh:function(){
            vm.showList = true;
            jQuery("#jqGrid").jqGrid('setGridParam', {
                datatype: 'json',
                page: 1
            }).jqGrid('setGridParam', {
                url: baseURL + 'rdp/selectAllReportFile?kw=' + (vm.q.key?vm.q.key:""),
                page: 1
            }).trigger("reloadGrid");
		}
	}
});


function updateReport(uuid) {
	window.open('rdpDesign.html?uuid=' + uuid, 'left=0,top=0,width=' + (screen.availWidth - 10) + ',height=' + (screen.availHeight - 50) + ',toolbar=no, menubar=no, scrollbars=no, resizable=yes,location=no, status=no');
}

function deleteReport(uuid) {
	console.log("111");
	confirm('确定要删除选中的记录？', function (sts,index) {
		$.ajax({
			type: "get",
			url: baseURL + "rdp/deleteReport",
			contentType: "application/json",
			data: {
				uuid: uuid
			},
			success: function (r) {
				if (r.code == 0) {
					closeLayer(index);
					jQuery("#jqGrid").jqGrid('setGridParam', {
						datatype: 'json',
						page: 1
					}).jqGrid('setGridParam', {
						url: baseURL + 'rdp/selectAllReportFile?kw=',
						page: 1
					}).trigger("reloadGrid");
				} else {
					alert(r.msg);
				}
			}
		});
	});
}