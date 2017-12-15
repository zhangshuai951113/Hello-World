var isOper = false;

//调用全查
$(function(){
	$.ajax({
		 url:"findIsSuper",
		type:"post",
		data:"",
		 async:false,
		 dataType:"json",
		 success:function(resp){
			if(resp.success){
				isOper = true;
				list(1);
				$("#addCarType").css("display","block");
			}else{
				list(1);
			}
		 }
	});
});

//进入页面查询车辆类型
function list(number){
	$("#tableList").html("");
	var carTypeId=$("#carTypeId").val();
	var carTypeName=$("#carTypeName").val();
	$.ajax({
		url:"findAllCarType",
		data:{carTypeId:carTypeId,carTypeName:carTypeName,"page":number-1,"rows":10},
		type:"post",
		async:false,
		dataType:"json",
		success:function(responseText){
			var objs=eval(responseText);
			$.each(objs,function(index,ele){
				if(ele.remark==null){
					ele.remark="";
				}
				var tr = " <tr class='table-body'>";
					tr+="		<td>"+ele.carTypeId+"</td>";
					tr+="		<td>"+ele.carTypeName+"</td>";
					tr+="		<td>"+ele.remark+"</td>";
					tr+="		<td class='operation'>";
					tr+="           <div class='modify-operation operation-m'  onclick='updateCarType(\""+ele.id+"\")'><div class='modify-icon'></div><div class='text'>修改</div></div>";
					tr+="			<div class='delete-operation operation-m'><div class='delete-icon'></div><div class='text' onclick='delCarType(\""+ele.id+"\")'>删除</div></div>";
					tr+="		</td>";
					tr+="</tr>";
				//将tr追加到
				$("#tableList").append(tr);
			});
			if(isOper) {
				$(".operation").show();
			}
		}
	});
	
	//获取最大数据记录数
	$.ajax({
		 url:"getCount",
		 type:"post",
		 data:{carTypeId:carTypeId,carTypeName:carTypeName,"page":number-1,"rows":10},
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 parent.getCarTotalRecords=resp;
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
	
}

//分页
var pagination = $(".pagination-list").operationList({
  "current":1,    //当前目标
  "maxSize":4,  //前后最大列表
  "itemPage":10,  //每页显示多少条
  "totalItems":0,  //总条数
  "chagePage":function(current){
    //调用ajax请求拿最新数据
      list(current);
  }
});

function jumpCarTypePage(e) {
	
	      var totalPage=Math.floor((parent.getCarTotalRecords+9)/10);
		  var myreg=/^[0-9]+.?[0-9]*$/;
		  var re = new RegExp(myreg);
		  var number=$(e).prev().find('input').val();
		  if(!re.test(number)){
			  xjValidate.showPopup("请输入正确的数字!","提示",true);
			  $(e).prev().find('input').val("");
			  return false;
		  }
		   var value = parseInt(number);
		   if(value<1){
			   $(e).prev().find('input').val("1")
			   value=1;
		   }
		   if(value>=totalPage){
			   $(e).prev().find('input').val(totalPage);
			   value=totalPage;
		   }
		  pagination.setCurrentPage(value);
		}

//模糊查询
$("#searchCarType").click(function(){
	list(1);
	
});

//重置按钮
$("#Reset").click(function(){
	$("#carTypeId").val("");
	$("#carTypeName").val("");
	list(1);
	 pagination.setCurrentPage(1);
});

//添加车辆信息
$("#addCarType").click(function(){
	
	$.ajax({
		 url:"findIsSuper",
		type:"get",
		data:"",
		 async:false,
		 dataType:"json",
		 success:function(resp){
			if(resp.success){
				//请求地址
				var url = basePath + "/carInfo/initCarTypePage";
				//加载模态框地址
				$("#show_department_info").load(url);
			}else{
				$("#addCarType").css("display","none");
			}
		 }
	});
		
});

//关闭模态框
function cancel(){
	$("#show_department_info").html("");
}

//点击x号关闭模态框
function x_close(){
	$("#show_department_info").html("");
}

//点击保存提交表单
function preservation(){
	//车辆类型编号
	var carTypeId=$.trim($("#carTypeIds").val());
	
	if(carTypeId==undefined || carTypeId==''){
		xjValidate.showTip("请输入车辆类型编号!");
		return false;
	}
	//车辆类型描述
	var carTypeName=$.trim($("#carTypeNames").val());
	if(carTypeName==undefined || carTypeName==''){
		xjValidate.showTip("请输入车辆类型描述!");
		return false;
	}
	//备注
	var remark=$.trim($("#remarks").val());
	if(remark.lenght>100){
		xjValidate.showTip("备注信息长度不能超过100个字符!");
		return false;
	}
	$.ajax({
		type:"post",
		url:"findCarTypeByUserInfoId",
		data:$("#department_form").serialize(),
		dataType:"json",
		async:false,
		success:function(resp){
			if(resp.success==true){
				//关闭模态框
				$("#show_department_info").html("");
				 xjValidate.showPopup(resp.msg,"提示",true);
				//刷新表格
				list(1);
				pagination.setCurrentPage(1);
			}else{
				 xjValidate.showPopup(resp.msg,"提示",true);
			}
		}
	});
}

//删除车辆
function delCarType(id){
	
	$.ajax({
		 url:"findIsSuper",
		type:"get",
		data:"",
		 async:false,
		 dataType:"json",
		 success:function(resp){
			if(resp.success){
				$.confirm({
				      title: '删除记录',
				      content: '您确定要删除该条记录吗？',
				      buttons: {
				          '确定': function () {
				        	  $.ajax({
				      			url:"delCarTypeInformation",
				      			data:{"id":id},
				      			type:"get",
				      			async:false,
				      			dataType:"json",
				      			success:function(resp){
				      				if(resp.success==true){
				      					//刷新表格
				      					list(1);
				      					pagination.setCurrentPage(1);
				      					 xjValidate.showPopup(resp.msg,"提示",true);
				      				}else{
				      					 xjValidate.showPopup(resp.msg,"提示",true);
				      				}
				      			}
				      		});
				          },
				          '取消': function () {
				          }
				      }
				  });
			}else{
				xjValidate.showPopup("您不是平台管理员,无权删除车辆类型信息!","提示",true);
			}
		 }
	});
	
}

//点击修改按钮模态框
function updateCarType(id){
	$.ajax({
		 url:"findIsSuper",
		type:"get",
		data:"",
		 async:false,
		 dataType:"json",
		 success:function(resp){
			if(resp.success){
				 parent.UpdateId=id;
					//请求地址
					var url = basePath + "/carInfo/updateCarTypePage";
					//加载模态框地址
					$("#show_department_info").load(url,function(){
						//请求ajax数据回显
						$.ajax({
							url:"findCarTypeInformation",
							data:{"id":id},
							type:"post",
							dataType:"json",
							async:false,
							success:function(resp){
								$.ajax({
									url:"findCar",
									data:{"id":id},
									dataType:"json",
									type:"post",
									async:false,
									success:function(responseText){
										var objs=eval(responseText);
										if(objs.success){
											var obj=eval(resp);
											$("#updateCarTypeIds").val(obj.carTypeId);
											$("#updateCarTypeNames").val(obj.carTypeName);
											$("#updateCRemarks").text(obj.remark);
											 document.getElementById("updateCarTypeIds").readOnly=true;
											 document.getElementById("updateCarTypeNames").readOnly=true;
											 document.getElementById("updateCRemarks").readOnly=true;
											 $("#myModalLabel span").text("(该车辆类型已有车辆关联，无法修改，仅供展示)");
											 document.getElementById('update-button').style.display="none";
										}else{
										var obj=eval(resp);
										$("#updateCarTypeIds").val(obj.carTypeId);
										$("#updateCarTypeNames").val(obj.carTypeName);
										$("#updateCRemarks").text(obj.remark);
										}
									}
								});
							}
						});
					});
			}else{
				xjValidate.showPopup("您不是平台管理员,无权删除车辆类型信息!","提示",true);
			}
		 }
	});
	
}

//获取参数修改车辆类型
function updatePreservation(){
	
	var aid=parent.UpdateId;
	//车辆类型编号
	var updateCarTypeId=$.trim($("#updateCarTypeIds").val());
	if(updateCarTypeId==undefined || updateCarTypeId==''){
		xjValidate.showTip("请输入车辆类型编号!");
		return false;
	}
	//车辆类型描述
	var updateCarTypeName=$.trim($("#updateCarTypeNames").val());
	if(updateCarTypeName==undefined || updateCarTypeName==''){
		xjValidate.showTip("请输入车辆类型描述!");
		return false;
	}
	//备注
	var updateCRemark=$.trim($("#updateCRemarks").val());
	if(updateCRemark.lenght>100){
		xjValidate.showTip("备注信息长度不能超过100个字符!");
		return false;
	}
	$.ajax({
	    url:"updateCarType",	
	    data:{"id":aid,updateCarTypeId:updateCarTypeId,updateCarTypeName:updateCarTypeName,remark:updateCRemark},
	    type:"post",
	    dataType:"json",
	    async:false,
	    success:function(resp){
	    	if(resp.success){
	    		$("#show_department_info").html("");
	    		xjValidate.showPopup(resp.msg,"提示",true);
	    		list(1);
	    		pagination.setCurrentPage(1);
	    	}else{
	    		xjValidate.showPopup(resp.msg,"提示",true);
	    	}
	    }
	});
	
}