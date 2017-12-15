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

	function onSuccess(data) {
		var resource = data;
		var source = {
			dataType : "json",
			dataFields : [ {
				name : "name",
				type : "string"
			}, {
				name : "type",
				type : "string"
			}, {
				name : "id",
				type : "string"
			}, {
				name : "parentId",
				type : "string"
			}

			],
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
			width : 1000,
			height : 430,
			checkboxes : true,
			theme : 'bootstrap',
			sortable : true,
			// pageable : true,
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
				width : '50%'
			}, {
				text : '菜单类型',
				dataField : "type",
				align : 'center',
				cellsAlign: 'center',
				width : '50%',
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
			} ]
		});
		$('#treeGrid').jqxTreeGrid({width:"100%"});
	}
	
	$("#roleTab").bootstrapTable().on("check.bs.table",
			function(e,row,$element){
			$.ajax({
				type : "POST",
				url : basePath+"/role/findResourceIds",
				dataType : "json",
				data : {
					roleId : row.id
				},
				success : function(res) {
					$("#treeGrid").jqxTreeGrid('clearSelection');
					var rootRows = $("#treeGrid").jqxTreeGrid('source');
					var childRows = rootRows.loadedData;
					$.each(childRows, function(i, e) {
						$("#treeGrid").jqxTreeGrid('uncheckRow', e.id);
					});
					$.each(res,function(i,e){
						$("#treeGrid").jqxTreeGrid('checkRow', e);
					});
					$("#treeGrid").jqxTreeGrid('collapseAll');
					var checkedRows = $("#treeGrid").jqxTreeGrid('getCheckedRows');
					var rootIds = [];
					var checkedRootIds = [];
					var uniqueIds=[], hash = {};
					$.each(checkedRows,function(i,e){
						if(e.parent == null){
							checkedRootIds.push(e.id);
						}else{
							rootIds.push(e.parentId);
							if(e.parent.parent != null){
								rootIds.push(e.parent.parentId);
							}
						}
					});
					for (var i = 0, elem; (elem = rootIds[i]) != null; i++) {
						if (!hash[elem]) {
					    	uniqueIds.push(elem);
					    	hash[elem] = true;
					    }
					}
					$.each(checkedRootIds,function(i,e){
						uniqueIds.remove(e);
					});
					$.each(uniqueIds,function(i,e){
						$("#treeGrid").jqxTreeGrid('expandRow', e);
					});
				}
			});
	});
});

$('#treeGrid').on('rowCheck', function (event){
    var row = args.row;
    if(row.records != null){
    	$.each(row.records,function(i,e){
    		if(e.checked == false){
    			$("#treeGrid").jqxTreeGrid('checkRow', e.id);
    		}
    	});
    }
    if(row.parentId != 1){
    	if(row.parent != null){
    		if(row.parent.checked == false){
    			if(row.parent.records["0"].checked == false){
    				$("#treeGrid").jqxTreeGrid('checkRow', row.parent.records["0"].id);
    			}
    		}
    		if(row.parent.parent != null){
    	    	if(row.parent.parent.checked == false){
    	    		if(row.parent.parent.records["0"].checked == false){
    	        		$("#treeGrid").jqxTreeGrid('checkRow', row.parent.parent.records["0"].id);
    	        	}
    	    	}
    			
    		}
    	}
    	/*else if(row.parentId != null){
    		alert("!23");
    		var firstLevelRows = $("#treeGrid").jqxTreeGrid('getRows');
    		$.each(firstLevelRows,function(i,e){
    			if(e.type == 'view' && e.checked == false && e.parentId == row.parentId){
    				alert(e.parentId);
    			}
    		});
    		$.ajax({
    	        type: "POST",
    	        url: basePath+"/resource/findViewIds",
    	        dataType: "json",
    	        data: {resourceId:row.id},
    	        success: function(res){
    	        	$.each(res,function(i,e){
    	        		$("#treeGrid").jqxTreeGrid('checkRow', e);
    	        	});
    	        }
    	    });
    	}*/
    }
});

$('#treeGrid').on('rowUncheck', function (event){
    var row = args.row;
    if(row.records != null){
    	$.each(row.records,function(i,e){
    		if(e.checked == true){
    			$("#treeGrid").jqxTreeGrid('uncheckRow', e.id);
    		}
    	});
    }
    if(row.parent != null && row.parent.checked == true){
    	$("#treeGrid").jqxTreeGrid('uncheckRow', row.parent.id);
    	$.each(row.parent.records,function(i,e){
    		if(e.id != row.id){
    			$("#treeGrid").jqxTreeGrid('checkRow', e.id);
    		}
    	});
    }
});


Array.prototype.indexOf = function(val) {  
	for (var i = 0; i < this.length; i++) {  
		if (this[i] == val) return i;  
	}  
	return -1;  
};  

Array.prototype.remove = function(val) {  
	var index = this.indexOf(val);  
	if (index > -1) {  
		this.splice(index, 1);  
	}  
};

function showAddRole(){
	$("input[name=role]").val("");
	$("input[name=description]").val("");
	$("#addRoleModal").modal("show");
	if("2" == $("#a_roleId").val()){
		$("#a_type_div")["0"].hidden=false;
	}else{
		$("#a_type_div")["0"].hidden=true;
	}
}

function createRole(){
	var role = $.trim($("#a_role").val());
	var description = $.trim($("#a_description").val());
	if(role==undefined || role==""){
		commonUtil.showPopup("提示","角色名称不能为空!");
		return;
	}
	if(role.length>16){
		commonUtil.showPopup("提示","角色名称不能超过8个汉字!");
		return;
	}
	if(description==undefined || description==""){
		commonUtil.showPopup("提示","角色描述不能为空!");
		return;
	}
	if(description.length>16){
		commonUtil.showPopup("提示","角色描述不能超过8个汉字!");
		return;
	}
	
	$.ajax({
		url : basePath+"/role/addRole",
		asyn : false,
		type : "POST",
		data : $('#addRole_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					$("#addRoleModal").modal("hide");
					commonUtil.showPopup("提示","添加成功!");
					$("#roleTab").bootstrapTable('refresh',{silent: true});
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

function showEditRole(){
	var selection =$('#roleTab').bootstrapTable('getSelections');
	if(selection.length == 1){
		$("input[name=role]").val(selection[0].role);
		$("input[name=description]").val(selection[0].description);
		$("input[name=id]").val(selection[0].id);
		$("#editRoleModal").modal("show");
	}else{
		commonUtil.showPopup("提示","请选择一条数据!");
	}
}

function updateRole(){
	var role = $.trim($("#e_role").val());
	var description = $.trim($("#e_description").val());
	if(role==undefined || role==""){
		commonUtil.showPopup("提示","角色名称不能为空!");
		return;
	}
	if(role.length>16){
		commonUtil.showPopup("提示","角色名称不能超过8个汉字!");
		return;
	}
	if(description==undefined || description==""){
		commonUtil.showPopup("提示","角色描述不能为空!");
		return;
	}
	if(description.length>16){
		commonUtil.showPopup("提示","角色描述不能超过8个汉字!");
		return;
	}
	
	$.ajax({
		url : basePath+"/role/editRole",
		asyn : false,
		type : "POST",
		data : $('#editRole_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					$("#editRoleModal").modal("hide");
					commonUtil.showPopup("提示","编辑成功!");
					$("#roleTab").bootstrapTable('refresh',{silent: true});
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

function showDeleteRole(){
	var selection =$('#roleTab').bootstrapTable('getSelections');
	if(selection.length == 1){
		$.ajax({
			type: "POST",
	        url: basePath+"/role/hasUserRole",
	        dataType: "json",
	        data: {roleId:selection[0].id},
	        success: function(dataStr){
	        	if(dataStr){
	        		if(dataStr.hasUser){
	        			$.confirm({
	        				title: "提示",
	        				content: "该角色已关联用户，您确定要删除吗？",
	        				buttons: {
	        			    	'确认': function () {
	        			    		deleteRole();
	        			    	},
	        			        '取消': function () {
	        			        }
	        			    }
	        			});
	        		}else{
	        			$.confirm({
	        				title: "提示",
	        				content: "您确定要删除该角色吗？",
	        				buttons: {
	        			    	'确认': function () {
	        			    		deleteRole();
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

function deleteRole(){
	var selection =$('#roleTab').bootstrapTable('getSelections');
	$.ajax({
        type: "POST",
        url: basePath+"/role/removeRole",
        dataType: "json",
        data: {roleId:selection[0].id},
        success: function(dataStr){
        	if(dataStr){
        		if(dataStr.success){
	        		commonUtil.showPopup("提示","删除成功!");
	        		$('#roleTab').bootstrapTable('refresh',{silent: true});
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

function save(){
	var selectRow = $("#roleTab").bootstrapTable('getSelections');
	var rootRows = $("#treeGrid").jqxTreeGrid('source');
	var childRows = rootRows.loadedData;
	var checkedRows  =$('#treeGrid').jqxTreeGrid('getCheckedRows');
	var checkedIds=[];
	var uniqueIds=[], hash = {};
	$.each(checkedRows,function(i,e){
		checkedIds.push(e.id);
		$.each(childRows,function(i2,e2){
			if (e.id == e2.parentId && e.id!=e2.id) {
				checkedIds.push(e2.id);
			}
		});
	});
	for (var i = 0, elem; (elem = checkedIds[i]) != null; i++) {
		if (!hash[elem]) {
	    	uniqueIds.push(elem);
	    	hash[elem] = true;
	    }
	}
	
	if(selectRow.length == 1){
		$.ajax({
			type: "POST",
			url:basePath+"/role/saveRoleResource",
			data: "roleId="+selectRow[0].id+"&resourceIds="+(uniqueIds.length==0?"":uniqueIds),
			dataType : "json",
			success: function(dataStr){
				if(dataStr){
					if(dataStr.success){
						commonUtil.showPopup("提示","授权成功!");
					}else{
						commonUtil.showPopup("提示","授权失败!");
						return;
					}
				}else{
					commonUtil.showPopup("提示","服务异常忙，请稍后重试!");
					return;
				}
			},
			error:function(){
				commonUtil.showPopup("提示","授权失败!");
			}
		});
	}else{
		commonUtil.showPopup("提示","请选择一个角色!");
	}
	
}

function typeFormatter(value, row){
	if("1"==value){
		return "企业货主";
	}else if("2"==value){
		return "物流公司";
	}else if("3"==value){
		return "个体货主";
	}else if("4"==value){
		return "司机";
	}else if("5"==value){
		return "平台管理员";
	}else{
		return "超级管理员";
	}
}
