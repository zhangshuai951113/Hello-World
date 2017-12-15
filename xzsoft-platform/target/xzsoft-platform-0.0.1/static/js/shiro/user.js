$(function(){
	$("#userTab").bootstrapTable().on("check.bs.table",
			function(e,row,$element){
			$.ajax({
		        type: "POST",
		        url: basePath+"/role/findOne",
		        dataType: "json",
		        data: {username:row.userName},
		        success: function(res){
		        	$("#roleTab").bootstrapTable('uncheckAll');
		        	var a = $("#roleTab").bootstrapTable('getData');
	        		$.each(a,function(i2,e2){
	        			if(e2.id==res.id) $("#roleTab").bootstrapTable('check',i2);
	        		});
		        },
		        error:function(){
		        	$("#roleTab").bootstrapTable('uncheckAll');  
				}
		    });
	});
});



function save(){
	var userRow = $("#userTab").bootstrapTable('getSelections');
	var roleRow = $("#roleTab").bootstrapTable('getSelections');
	var roleId=[];
	var roleType=[];
	$.each(roleRow,function(i,e){
		roleId.push(e.id);
		roleType.push(e.roleType);
	});
	if(userRow.length == 1){
		$.ajax({
			type:"POST",
			url:basePath+"/user/saveUserRole",
			data: "userId="+userRow[0].id+"&roleId="+(roleId.length==0?"":roleId)+"&roleType="+(roleType.length==0?"":roleType),
			dataType : "json",
			success: function(dataStr){
				if(dataStr){
					if(dataStr.success){
						commonUtil.showPopup("提示","分配成功!");
					}else{
						commonUtil.showPopup("提示",dataStr.msg);
						return;
					}
				}else{
					commonUtil.showPopup("提示","服务异常忙，请稍后重试!");
					return;
				}
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