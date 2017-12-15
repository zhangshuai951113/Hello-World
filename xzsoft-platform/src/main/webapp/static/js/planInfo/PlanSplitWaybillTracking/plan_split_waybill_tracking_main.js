$(function(){
	
	//数据较多，增加滑动
    $(".iscroll").css("min-height", "55px");
    $(".iscroll").mCustomScrollbar({
      theme: "minimal-dark"
    });
    planSplitWaybillTracKingList(1);
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

//全查信息
function planSplitWaybillTracKingList(number){
	//禁止多次追加
	$("#planInfoTtableList").html("");
	
	var planName=$.trim($("#planName").val());
	var entrust=$.trim($("#entrust").val());
	var shipper=$.trim($("#shipper").val());
	var planStatus=$.trim($("#planStatus").val());
	var cooperateStatus=$.trim($("#cooperateStatus").val());
	var planCreateTimeStart=$.trim($("#planCreateTimeStart").val());
	var planCreateTimeEnd=$.trim($("#planCreateTimeEnd").val());
	$.ajax({
		url:basePath+"/planInfo/findPlanSplitWaybillMation",
		data:{
			"page":number-1,
			"rows":10,
			"planName":planName,
			"entrust":entrust,
			"shipper":shipper,
			"planStatus":planStatus,
			"cooperateStatus":cooperateStatus,
			"planCreateTimeStart":planCreateTimeStart,
			"planCreateTimeEnd":planCreateTimeEnd
			},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				//判断显示条件(计划状态)
				var planStatus="新建";
				if(ele.planStatus==2){
					planStatus="审核中";
				}else if(ele.planStatus==3){
					planStatus="审核通过";
				}else if(ele.planStatus==4){
					planStatus="审核驳回";
				}else if(ele.planStatus==5){
					planStatus="已派发";
				}else if(ele.planStatus==6){
					planStatus="已撤回";
				}
				if(ele.shipperName==null){
					ele.shipperName="";
				}
				//协同状态
				if(ele.cooperateStatus==1){
					ele.cooperateStatus="上下游协同";
				}else if(ele.cooperateStatus==2){
					ele.cooperateStatus="下游不协同";
				}else if(ele.cooperateStatus==3){
					ele.cooperateStatus="上游不协同";
				}else{
					ele.cooperateStatus="";
				}
				if(ele.planType==1){
					ele.planType="物流计划";
				}else if(ele.planType==2){
					ele.planType="自营计划";
				}
				if(ele.isSplitPlan==0){
					ele.isSplitPlan="未拆分";
				}else if(ele.isSplitPlan==1){
					ele.isSplitPlan="已拆分";
				}else{
					ele.isSplitPlan="";
				}
				if(ele.planChaiFenDate==null){
					ele.planChaiFenDate="";
				}
			var tr ="<tr class='table-body'>";
				tr+="		<td><div class='view-operation operation-m'  onclick='findAllWayibbyMation("+ele.id+")'><div class='view-icon'></div><div class='text'>查看</div></div></td>";
				tr+="		<td style='color:red'>"+ele.isSplitPlan+"</td>";
				tr+="		<td style='color:red'>"+ele.planType+"</td>";
				tr+="		<td>"+ele.planChaiFenDate+"</td>";
				tr+="		<td>"+ele.planName+"</td>";
				tr+="		<td>"+ele.entrustName+"</td>";
				tr+="		<td>"+ele.shipperName+"</td>";
				tr+="		<td>"+ele.goodsName+"</td>";
				tr+="		<td>"+ele.lineName+"</td>";
				tr+="		<td>"+ele.distance+"</td>";
				tr+="		<td>"+ele.planSum+"</td>";
				tr+="		<td>"+ele.forwardingUnit+"</td>";
				tr+="		<td>"+ele.consignee+"</td>";
				tr+="		<td>"+ele.startDateStr+"</td>";
				tr+="		<td>"+ele.endDateStr+"</td>";
				tr+="		<td>"+ele.userName+"</td>";
				tr+="		<td>"+ele.createTimeStr+"</td>";
				tr+="		<td style='color:red'>"+planStatus+"</td>";
				tr+="		<td>"+ele.cooperateStatus+"</td>";
				tr+="</tr>";
				
				//将tr追加
				$("#planInfoTtableList").append(tr);
		});
	}
	});
	//数量全查
	$.ajax({
		url:basePath+"/planInfo/getPlanSplitWaybillMationCount",
		data:{
			"planName":planName,
			"entrust":entrust,
			"shipper":shipper,
			"planStatus":planStatus,
			"cooperateStatus":cooperateStatus,
			"planCreateTimeStart":planCreateTimeStart,
			"planCreateTimeEnd":planCreateTimeEnd
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			 parent.getTotalRecordsPlanInfoWay=resp;
			 paginationWay.setTotalItems(resp);
			 $("#panelWay-num").text("搜索结果共"+resp+"条");
		}
	});
};

//重置按钮
function planWaybillReset(){
	$("#planName").val("");
	$("#entrust").val("");
	$("#shipper").val("");
	$("#planStatus").val("");
	$("#cooperateStatus").val("");
	$("#planCreateTimeStart").val("");
	$("#planCreateTimeEnd").val("");
	planSplitWaybillTracKingList(1);
}
//分页
var paginationWay = $(".plan_info_all_mation").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  planSplitWaybillTracKingList(current);
	  }
	});

	
	function jumpWayPage(e) {
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
	   paginationWay.setCurrentPage(value);
	}
	
//计划生成运单跟踪
function findAllWayibbyMation(id){
	var url=basePath+"/planInfo/findAllWayibbyMationPage";
	$("#find_plan_waybill_info").load(url,function(){
	$("#planInfoId").val(id);
	});
}