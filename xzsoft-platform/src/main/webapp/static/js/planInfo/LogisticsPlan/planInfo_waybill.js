$(function(){
	findPlanInfoWaybillList(1);
	//时间调用插件
    setTimeout(function() {
       $(".date-time").datetimepicker({
          format: "YYYY-MM-DD",
          autoclose: true,
          todayBtn: true,
          todayHighlight: true,
          showMeridian: true,
          pickerPosition: "bottom-left",
          startView: 2,//月视图
          minView: 2//日期时间选择器所能够提供的最精确的时间选择视图
        }); 
    },500);
});

function findPlanInfoWaybillList(number){
	$("#planInfoWaybillTBody").html("");
	
	var wayId=$.trim($("#wayId").val());
	var wayStatus=$.trim($("#wayStatus").val());
	var planTransportDateStart=$.trim($("#planTransportDateStart").val());
	var planTransportDateEnd=$.trim($("#planTransportDateEnd").val());
	
	$.ajax({
		url:basePath+"/planInfo/findPlanWaybillMation",
		data:{
			"planInfoId":$("#planInfoId").val(),
			"page":number-1,
			"rows":10,
			"wayId":wayId,
			"wayStatus":wayStatus,
			"planTransportDateStart":planTransportDateStart,
			"planTransportDateEnd":planTransportDateEnd
			},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				if(ele.waybillStatus==1){
					ele.waybillStatus="新建";
				}else if(ele.waybillStatus==2){
					ele.waybillStatus="派发";
				}else if(ele.waybillStatus==3){
					ele.waybillStatus="已撤回";
				}else if(ele.waybillStatus==4){
					ele.waybillStatus="已拒绝";
				}else if(ele.waybillStatus==5){
					ele.waybillStatus="已接单";
				}else if(ele.waybillStatus==6){
					ele.waybillStatus="已装货";
				}else if(ele.waybillStatus==7){
					ele.waybillStatus="在途";
				}else if(ele.waybillStatus==8){
					ele.waybillStatus="已卸货";
				}else if(ele.waybillStatus==9){
					ele.waybillStatus="已挂账";
				}else if(ele.waybillStatus==10){
					ele.waybillStatus="已发布";
				}else if(ele.waybillStatus==11){
					ele.waybillStatus="已回收报价";
				}
				if(ele.planPaiFaDateStr==null){
					ele.planPaiFaDateStr="";
				}
				if(ele.driverName==null){
					ele.driverName="";
				}
				if(ele.carCode==null){
					ele.carCode="";
				}
				if(ele.distributeTimeStr==null){
					ele.distributeTimeStr="";
				}
				if(ele.driverReceiveTimeStr==null){
					ele.driverReceiveTimeStr="";
				}
				
				if(ele.waybillType==1){
					ele.waybillType="物流运单";
				}else if(ele.waybillType==2){
					ele.waybillType="自营运单";
				}else if(ele.waybillType==3){
					ele.waybillType="代理运单";
				}else if(ele.waybillType==4){
					ele.waybillType="转包运单";
				}
				
				var tr ="<tr class='table-body'>";
				tr+="		<td>"+ele.id+"</td>";
				tr+="		<td>"+ele.waybillId+"</td>";
				tr+="		<td>"+ele.planTransportDateEndStr+"</td>";
				tr+="		<td>"+ele.planTransportAmount+"</td>";
				tr+="		<td>"+ele.waybillStatus+"</td>";
				tr+="		<td>"+ele.waybillType+"</td>";
				tr+="		<td>"+ele.entrustName+"</td>";
				tr+="		<td>"+ele.shipperName+"</td>";
				tr+="		<td>"+ele.driverName+"</td>";
				tr+="		<td>"+ele.carCode+"</td>";
				tr+="		<td>"+ele.currentTransportPrice+"</td>";
				tr+="		<td>"+ele.goodsName+"</td>";
				tr+="		<td>"+ele.lineName+"</td>";
				tr+="		<td>"+ele.forwardingUnit+"</td>";
				tr+="		<td>"+ele.consignee+"</td>";
				tr+="		<td>"+ele.distributeTimeStr+"</td>";
				tr+="		<td>"+ele.driverReceiveTimeStr+"</td>";
				tr+="		<td>"+"物流运单"+"</td>";
				tr+="		</tr>";
				$("#planInfoWaybillTBody").append(tr);
			});
		}
	});
	//查询总量
	$.ajax({
		url:basePath+"/planInfo/getPlanWaybillMationCount",
		data:{
			"planInfoId":$("#planInfoId").val(),
			"wayId":wayId,
			"wayStatus":wayStatus,
			"planTransportDateStart":planTransportDateStart,
			"planTransportDateEnd":planTransportDateEnd
			},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			 parent.getTotalRecordsPlanInfoWay=resp;
			 wayPagination.setTotalItems(resp);
			 $("#planInfoWaybill-num").text("搜索结果共"+resp+"条");
		}
	});
}

//分页
var wayPagination = $("#planInfoWaybill-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  findPlanInfoWaybillList(current);
	  }
	});

//重置按钮
function findPlanWaybillReset(){
	$("#wayId").val("");
	$("#wayStatus").val("");
	$("#planTransportDateStart").val("");
	$("#planTransportDateEnd").val("");
	findPlanInfoWaybillList("1");
}
	
	function jumpPlanWaybillPage(e) {
      var totalPage=Math.floor((parent.getTotalRecordsPlanInfoWay+9)/10);
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
	   wayPagination.setCurrentPage(value);
	}

function closeCButton(){
	$("#find_plan_waybill_info").html("");
}