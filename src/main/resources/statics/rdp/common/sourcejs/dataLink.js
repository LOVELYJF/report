var dataLinkLayero,parmstr="",filestr="",datalinkparmData={};function addLink(){var t=hot.Methods.getSelected();if(t){var a=t[0],d=hot.Methods.getCellMeta(a[0],a[1]),e=hot.Methods.getDataAtCell(a[0],a[1]);if(!e)return layer.msg("当前单元格未配置字段"),!1;var c=e.substring(1,e.length).split(".");layer.open({type:1,area:["600px","480px"],title:"配置超链接",content:$("#dataLink"),cancel:function(){},success:function(i,t){datalinkparmData={},(dataLinkLayero=i).find("#temlist").empty(),i.find("#plist").empty(),i.find("#myconfig").val(""),i.find("#temlist").append("<option value='' >请选择</option>");var l="";filestr="";var a=d.link;if(a){i.find("#myconfig").val(a);for(var e=a.split(","),n=0;n<e.length;n++){var o=e[n].split(":");"url"==o[0]?l=o[1].replace("show/",""):o[1]&&-1<o[1].indexOf("(#=")?datalinkparmData[o[0]]=o[1].replace("(#=","").replace("#)",""):datalinkparmData[o[0]]=o[1]}}""!=l&&$.rdp.ajax({url:"../../rdp/selectAllParmsByUUID",type:"post",data:{uuid:l},async:!1,success:function(t){var a=t.list;for(var e in parmstr="",a)parmstr+="<option value="+e+">"+e+"</option>"}});var s=$.fn.zTree.getZTreeObj("dataSets"),r=s.getNodeByParam("dataSetName",c[0],null),p=s.getNodeByParam("type","field",r).children;$.each(p,function(t,a){filestr+="<option value="+c[0]+"."+a.columnName+">"+c[0]+"."+(a.columnComments?a.columnComments:a.columnName)+"</option>"}),$.each(datalinkparmData,function(t,a){"url"!=t&&"reporttype"!=t&&"parms"!=t&&addp(a,t)}),$.rdp.ajax({url:"../../rdp/selectAllReportFile?kw=",type:"post",success:function(t){var a=t.list;for(var e in a){var n="";l==a[e].uuid&&(n=" selected = 'selected'"),i.find("#temlist").append("<option value='"+a[e].uuid+"' "+n+">"+a[e].name+"</option>")}$("#padd").show()}}),i.find("#temlist").bind("change",function(){var t=this.value.split(",")[0];i.find("#plist").empty(),$.rdp.ajax({url:"../../rdp/selectAllParmsByUUID",type:"post",data:{uuid:t},success:function(t){var a=t.list;for(var e in parmstr="",a)parmstr+="<option value="+e+">"+e+"</option>"}})})},end:function(){dataLinkLayero=null,console.log("销毁layer")},btn:["保存","取消"],yes:function(t,a){var e=hot.Methods.getSelected();if(e){var n=e[0];hot.Methods.getCellMeta(n[0],n[1]);hot.Methods.setCellMeta(n[0],n[1],"link",dataLinkLayero.find("#myconfig").val())}console.log("保存"),layer.close(t)},btn2:function(t,a){layer.close(t)}})}}function createlink(){var e="url:show/"+dataLinkLayero.find("#temlist").val()+",";dataLinkLayero.find("#plist").find(".top").each(function(){var t=$(this).find(".filelist")[0].value,a=$(this).find(".parmlist")[0].value;e+=a+":(#="+t+"#),"}),dataLinkLayero.find("#myconfig").val(e.substring(0,e.length-1))}function addp(t,a){var e=(new Date).getTime(),n='<div class="top"><span><select name="parmlist" class="parmlist" id="parmlist'+e+'"><option value="">请选择参数</option>'+parmstr+'</select></span><span>=</span><span><select name="filelist" class="filelist" id="filelist'+e+'"><option value="">请选择字段</option>'+filestr+'</select></span><span><input type="button" class="pdel" value="删除" onclick="$(this).parent().parent(\'div\').remove();" /></span></div>';dataLinkLayero.find("#plist").append(n),dataLinkLayero.find("#filelist"+e).val(t),dataLinkLayero.find("#parmlist"+e).val(a)}function removeLink(){var t=hot.Methods.getSelected();if(t){var a=t[0],e=hot.Methods.getCellMeta(a[0],a[1]);e.link="",delete e.link}}