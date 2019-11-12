var editor,globalDtId;
$(function () {
	$("#goBack").bind("click", function () {
		location.href = "dataConfig.html";
	});
	$("#dsc-tabs").tabs();
	ace.require("ace/ext/error_marker");
	ace.require("ace/ext/spellcheck");
	ace.require("ace/ext/options");
	editor = ace.edit("editor");
	ace.require('ace/ext/settings_menu').init(editor);
	editor.session.setMode("ace/mode/sql");
	editor.setOptions({
		spellcheck: true,
		fontSize: 20
	});
	editor.commands.addCommands([{
		name: "showSettingsMenu",
		bindKey: {
			win: "Ctrl-q",
			mac: "Ctrl-q"
		},
		exec: function (editor) {
			editor.showSettingsMenu();
		},
		readOnly: true
	}]);
	editor.commands.addCommand({
		name: "showKeyboardShortcuts",
		bindKey: {
			win: "Ctrl-Alt-h",
			mac: "Command-Alt-h"
		},
		exec: function (editor) {
			ace.config.loadModule("ace/ext/keybinding_menu", function (module) {
				module.init(editor);
				editor.showKeyboardShortcuts();
			})
		}
	});
	reqServerController("ex/ser/datasource/getList", {}, function (res) {
		// console.log(res);
		var list = res.list;
		$("#dataSourcesList").select2({
			placeholder: '请选择数据源',
			allowClear: true,
			data: list.map(function (obj) {
				obj.text = obj.name;
				return obj;
			})
		}).val(null).trigger('change').on('select2:select', function (e) {
			var data = e.params.data;
			createDataSourcesTree(data);

		});
		initDataSets();
	});


	$("#saveDateSetsBtn").bind("click", function () {
		var name = $("#dataSetsName").val();
		if (name) {
			var selectData = $('#dataSourcesList').select2('data');
			var dsId = selectData[0].id;
			var type = selectData[0].type;
			var dataSetEntity = {
				dtName: name,
				dsId: dsId,
				type: type,
				dataType: "sql",
				sql: editor.getValue(),
				sts: 1
			};

			layer.msg('保存中', {
				icon: 16,
				shade: 0.01
			});
			if (globalDtId) {
				dataSetEntity.dtId = globalDtId;
				reqServerController("ex/ser/dataset/update", dataSetEntity, function (res) {
					console.log(res);
					layer.closeAll('loading');
					if (res.code == 0) {
						layer.msg('保存成功');
					}
				});
			} else {
				reqServerController("ex/ser/dataset/save", dataSetEntity, function (res) {
					console.log(res);
					layer.closeAll('loading');
					if (res.code == 0) {
						layer.msg('保存成功');
					}
				});
			}

		} else {
			layer.tips('请先填写数据集名称', '#dataSetsName', {
				tips: 3
			});
		}

	});
	$("#viewDataSetsBtn").bind("click", function () {
		viewTable();
	});
	//editor.session.setValue("the new text here");
});

function initDataSets() {
	globalDtId = GetQueryString("dtId");
	if (globalDtId) {
		reqServerControllerParms("ex/ser/dataset/info/" + globalDtId, {}, function (res) {
			if (res.code == 0) {
				console.log(res.dataSet);
				var dataSet = res.dataSet;
				editor.setValue(dataSet.sql);
				$('#dataSourcesList').val(dataSet.dsId).trigger('change');
				createDataSourcesTree({id:dataSet.dsId});
				$("#dataSetsName").val(dataSet.dtName)
			}
		});
	}
}

function createDataSourcesTree(data) {
	reqServerController("ex/ser/datasource/getTableList/" + data.id, {}, function (res) {
		console.log(res);
		var list = res.tableList;
		var zNodes = list.map(function (obj) {
			obj.id = obj.tableName;
			if (obj.tableComments) {
				obj.name = obj.tableComments + "(" + obj.tableName + ")";
			} else {
				obj.name = obj.tableName;
			}
			return obj;
		});
		var setting = {
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onDblClick: zTreeOnDblClick
			}
		};
		$.fn.zTree.init($("#dsl-tables"), setting, zNodes);

		//$.fn.ztree
	});
}

function zTreeOnDblClick(event, treeId, treeNode) {
	var tableName = treeNode.tableName;
	var sqlStr = "select * from " + tableName;
	editor.setValue(sqlStr);
};

function viewTable() {
	//var sqlStr = encodeURI(editor.getValue());
	var sqlStr = editor.getValue();
	var selectData = $('#dataSourcesList').select2('data');
	var dsId = selectData[0].id;
	reqServerControllerParms("ex/ser/dataset/sqlresult", {
		sql: sqlStr,
		dsId: dsId
	}, function (res) {
		if (res.code == 0) {
			var table = document.querySelector('table[grid-manager="dataSetsViewTable"]');
			var tableData = tableValsToNodeData(res.data);
			var responseData = {
				"data": tableData,
				"totals": tableData.length
			}
			var columnData = res.data.columns.map(function (obj) {
				obj.key = obj.columnName;
				if (obj.columnComments) {
					obj.text = obj.columnComments;
				} else {
					obj.text = obj.columnName;
				}
				return obj;
			});

			table.GM({
				ajax_data: responseData,
				supportAutoOrder: false,
				supportDrag: false,
				supportCheckbox: false,
				columnData: columnData,
				height: "100%"
			})
		} else {
			layer.msg("SQL执行错误");
		}

	});


}