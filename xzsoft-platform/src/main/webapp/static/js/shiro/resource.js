$(function() {
	$.ajax({
		type : "GET",
		url : basePath+"/resource/findResource",
		contentType : "application/json; charset=utf-8",
		dataType : "json",
		success : onSuccess,
		failure : function(response) {
			alert(response);
		}
	});
});

function onSuccess(data) {
	var resource = data;
	var source = {
		dataType : "json",
		dataFields : [ {
			name : "id",
			type : "string"
		}, {
			name : "name",
			type : "string"
		}, {
			name : "type",
			type : "string"
		}, {
			name : "url",
			type : "string"
		}, {
			name : "parentId",
			type : "string"
		}, {
			name : "parentIds",
			type : "string"
		},{
			name : "permission",
			type : "string"
		}, {
			name : "available",
			type : "string"
		}, {
			name : "className",
			type : "string"
		}],
		hierarchy : {
			keyDataField : {
				name : 'id'
			},
			parentDataField : {
				name : 'parentId'
			}
		},
		id : 'id',
		localData : resource
	};

	var dataAdapter = new $.jqx.dataAdapter(source);

	$("#treeGrid").jqxTreeGrid({
		width : 1190,
		height : 480,
		theme : 'bootstrap',
		sortable : true,
		//pageable : true,
		//pageSize : 15,
		source : dataAdapter,
		ready : function() {
			$("#treeGrid").jqxTreeGrid('collapseAll');
			$('#treeGrid').jqxTreeGrid({
				width : "100%"
			});
		},
		columns : [ {
			text : '菜单名称',
			dataField : "name",
			align : 'center',
			width : '25%'
		}, {
			text : '菜单类型',
			dataField : "type",
			align : 'center',
			cellsAlign: 'center',
			width : '10%',
			cellsRenderer : function(row, column, value, rowData) {
				if (row == 1) {
					return "";
				}
				if (value == 'menu') {
					return "菜单";
				} else if (value == 'button') {
					return "按钮";
				} else {
					return "查看";
				}
			}
		}, {
			text : '访问路径',
			dataField : "url",
			align : 'center',
			width : '35%'
		}, {
			text : '权限标识',
			dataField : "permission",
			align : 'center',
			width : '20%'
		}, {
			text : '菜单图标',
			dataField : "className",
			align : 'center',
			width : '10%'
		} ]
	});
	$('#treeGrid').jqxTreeGrid({width:"100%"});
}

function showAddResource(){
	$("input[name=name]").val("");
	$("input[name=url]").val("");
	$("input[name=permission]").val("");
	$("input[name=className]").val("");
	var selection = $("#treeGrid").jqxTreeGrid('getSelection');
	if(selection.length > 1){
		commonUtil.showPopup("提示","请选择一个菜单或不选!");
		$("#treeGrid").jqxTreeGrid('clearSelection');
	}else if(selection.length == 1){
		if(selection[0].type == 'button'){
			commonUtil.showPopup("提示","请选择一个菜单或不选!");
			$("#treeGrid").jqxTreeGrid('clearSelection');
		}else{
			$("#a_parentName").val(selection[0].name);
			$("#addResourceModal").modal("show");
		}
	}else{
		$("#addResourceModal").modal("show");
	}
}

function createResource(){
	var selection = $("#treeGrid").jqxTreeGrid('getSelection');
	var name = $.trim($("#a_name").val());
	var url = $.trim($("#a_url").val());
	var permission = $.trim($("#a_permission").val());
	var type = $.trim($("#a_type").val());
	var className = $.trim($("#a_className").val());
	if(selection.length == 1){
		$("#a_parentId").val(selection[0].id);
	}else{
		$("#a_parentId").val('1');
	}
	if(name==undefined || name==""){
		commonUtil.showPopup("提示","资源名称不能为空!");
		return;
	}
	if(name.length>12){
		commonUtil.showPopup("提示","资源名称不能超过6个汉字!");
		return;
	}
	if(permission==undefined || permission==""){
		commonUtil.showPopup("提示","权限标识不能为空!");
		return;
	}
	
	$.ajax({
		url : basePath+"/resource/addResource",
		asyn : false,
		type : "POST",
		data : $('#addResource_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					$("#addResourceModal").modal("hide");
					commonUtil.showPopup("提示","添加成功!");
					$.ajax({
						type : "GET",
						url : basePath+"/resource/findResource",
						contentType : "application/json; charset=utf-8",
						dataType : "json",
						success : onSuccess,
						failure : function(response) {
							alert(response);
						}
					});
				}else{
					xjValidate.showTip(dataStr.msg);
				}
			}else{
				commonUtil.showPopup("提示","服务异常忙，请稍后重试!");
				return;
			}
		}
	});
}

function showEditResource(){
	var selection = $("#treeGrid").jqxTreeGrid('getSelection');
	if(selection.length == 1){
		$.ajax({
			url : basePath+"/resource/findParentName",
			asyn : false,
			type : "POST",
			data : {parentId:selection[0].parentId},
			dataType : "json" ,
			success : function(dataStr) {
				if(dataStr){
					if(dataStr.success){
						$("#e_parentName").val(dataStr.pname);
						$("input[name=name]").val(selection[0].name);
						$("input[name=url]").val(selection[0].url);
						$("input[name=permission]").val(selection[0].permission);
						$("#e_type").val(selection[0].type);
						$("input[name=id]").val(selection[0].id);
						$("input[name=className]").val(selection[0].className);
						if(selection[0].type == 'button'){
							$("#e_url_div")["0"].hidden=true;
						}else{
							$("#e_url_div")["0"].hidden=false;
						}
						$("#editResourceModal").modal("show");
					}else{
						commonUtil.showPopup("提示","编辑失败!");
						return;
					}
				}else{
					commonUtil.showPopup("提示","服务异常忙，请稍后重试!");
					return;
				}
			}
		});
	}else{
		commonUtil.showPopup("提示","请选择一条数据!");
	}
}

function updateResource(){
	var name = $.trim($("#e_name").val());
	var permission = $.trim($("#e_permission").val());
	if(name==undefined || name==""){
		commonUtil.showPopup("提示","资源名称不能为空!");
		return;
	}
	if(name.length>12){
		commonUtil.showPopup("提示","资源名称不能超过6个汉字!");
		return;
	}
	if(permission==undefined || permission==""){
		commonUtil.showPopup("提示","权限标识不能为空!");
		return;
	}
	
	$.ajax({
		url : basePath+"/resource/editeResource",
		asyn : false,
		type : "POST",
		data : $('#editResource_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					$("#editResourceModal").modal("hide");
					commonUtil.showPopup("提示","编辑成功!");
					$.ajax({
						type : "GET",
						url : basePath+"/resource/findResource",
						contentType : "application/json; charset=utf-8",
						dataType : "json",
						success : onSuccess,
						failure : function(response) {
							alert(response);
						}
					});
				}else{
					xjValidate.showTip(dataStr.msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","服务异常忙，请稍后重试!");
				return;
			}
		}
	});
}

function showDeleteResource(){
	var selection = $("#treeGrid").jqxTreeGrid('getSelection');
	if(selection.length == 1){
		$.ajax({
			type: "POST",
	        url: basePath+"/resource/hasRoleResource",
	        dataType: "json",
	        data: {resourceId:selection[0].id},
	        success: function(dataStr){
	        	if(dataStr){
	        		if(dataStr.hasRole){
	        			$.confirm({
	        				title: "提示",
	        				content: "该资源已关联角色，您确定要删除吗？",
	        				buttons: {
	        			    	'确认': function () {
	        			    		deleteResource();
	        			    	},
	        			        '取消': function () {
	        			        }
	        			    }
	        			});
	        		}else{
	        			$.confirm({
	        				title: "提示",
	        				content: "您确定要删除该资源吗？",
	        				buttons: {
	        			    	'确认': function () {
	        			    		deleteResource();
	        			    	},
	        			        '取消': function () {
	        			        }
	        			    }
	        			});
	        		}
	        	}else{
	        		commonUtil.showPopup("提示","服务异常忙，请稍后重试!");
					return;
				}
	        }
		});
	}else{
		commonUtil.showPopup("提示","请选择一条数据!");
	}
}


function deleteResource(){
	var selection = $("#treeGrid").jqxTreeGrid('getSelection');
	$.ajax({
        type: "POST",
        url: basePath+"/resource/removeResource",
        dataType: "json",
        data: {resourceId:selection[0].id},
        success: function(dataStr){
        	if(dataStr){
        		if(dataStr.success){
	        		commonUtil.showPopup("提示","删除成功!");
	        		$("#treeGrid").jqxTreeGrid('deleteRow', selection[0].id);
	        	}else{
	        		commonUtil.showPopup("提示",dataStr.msg);
	        	}
        	}else{
        		commonUtil.showPopup("提示","服务异常忙，请稍后重试!");
				return;
			}
        }
    });
}