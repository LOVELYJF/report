function fill_insert(obj) {
	$(obj).parent().parent().after(function() {
		var str = $(obj).parent().parent().clone();
		if (foreignArr.length > 0) {
			$(str).find('input').each(function() {
				if (foreignArr.indexOf($(this).attr('name')) == -1 && $(this).attr('type') != 'button') {
					$(this).val('');
				}
			});
		}
		return str;
	});
}
function fill_delete(obj) {
	$(obj).parent().parent().detach();
}
function fill_save() {
	if ($('#rdp_fill_form').valid()) {
		$.ajax({
			type : 'post',
			url : fillUrl,
			data : $('#rdp_fill_form').serialize(),
			success : function(data) {
				if (data.code == 0) {
					alert('保存成功');
				} else {
					alert(data.msg)
				}
			},
			error : function() {
				alert('请求失败')
			}
		})
	}
}
$(function() {
	$('#rdp_fill_form').validate({
		errorLabelContainer : $('#rdp_fill_form div.error')
	});
});