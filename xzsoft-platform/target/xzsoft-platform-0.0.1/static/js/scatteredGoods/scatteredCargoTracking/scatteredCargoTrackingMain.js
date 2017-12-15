$(function(){
	$("#startAddress").lineSelect();
	$("#endAddress").lineSelect();
	//模态框
	STList(1);
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
    
	  //全选/全不选
		$("body").on("click",".all_scatteredCargoTracking_check",function(){
			if($(".all_scatteredCargoTracking_check").is(":checked")){
				//全选时
				$(".sub_scatteredCargoTracking_check").each(function(){
					$(this).prop("checked",true);
				});
			}else{
				//全不选时
				$(".sub_scatteredCargoTracking_check").each(function(){
					$(this).prop("checked",false);
				});
			}
		});
		 //运单零散货物数据较多，增加滑动
	    $(".iscroll").css("min-height", "55px");
	    $(".iscroll").mCustomScrollbar({
	      theme: "minimal-dark"
	    });
});

//全查
function STList(number){
	
	$("#sTTtableList").html("");
	
	var scatteredGoods=$.trim($("#scatteredGoods").val());
	var entrust=$.trim($("#entrust").val());
	var shipper=$.trim($("#shipper").val());
	var forwardingUnit=$.trim($("#forwardingUnit").val());
	var consignee=$.trim($("#consignee").val());
	var waybillStatus=$.trim($("#waybillStatus").val());
	var cooperateStatus=$.trim($("#cooperateStatus").val());
	var startAddress=$.trim($("#SstartAddress").val());
	var endAddress=$.trim($("#EendAddress").val());
	var planTransportDateStart=$.trim($("#planTransportDateStart").val());
	var planTransportDateEnd=$.trim($("#planTransportDateEnd").val());
	
	if(new Date(planTransportDateStart).getTime()>new Date(planTransportDateEnd).getTime()){
		 xjValidate.showTip("请输入正确的结束时间!");
		 return false;
	}
	
	var data={
			scatteredGoods:scatteredGoods,
			entrust:entrust,
			shipper:shipper,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			waybillStatus:waybillStatus,
			startAddress:startAddress,
			endAddress:endAddress,
			cooperateStatus:cooperateStatus,
			planTransportDateStart:planTransportDateStart,
			planTransportDateEnd:planTransportDateEnd,
			"page":number,
			"rows":10
	}
	
	$.ajax({
		url:basePath+"/scatteredGoods/findScatteredCargoTrackingAllMation",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				
				//判断显示条件
				//运单状态
				var waybillStatus="新建";
				if(ele.waybillStatus==2){
					waybillStatus="已派发";
				}else if(ele.waybillStatus==3){
					waybillStatus="已撤回";
				}else if(ele.waybillStatus==4){
					waybillStatus="已拒绝";
				}else if(ele.waybillStatus==5){
					waybillStatus="已接单";
				}else if(ele.waybillStatus==6){
					waybillStatus="已装货";
				}else if(ele.waybillStatus==7){
					waybillStatus="在途";
				}else if(ele.waybillStatus==8){
					waybillStatus="已卸货";
				}else if(ele.waybillStatus==9){
					waybillStatus="已挂账";
				}else if(ele.waybillStatus==10){
					waybillStatus="已发布";
				}else if(ele.waybillStatus==11){
					waybillStatus="已回收报价";
				}
				
				//定损方式
				var deductionMode="比例";
				if(ele.deductionMode==2){
					deductionMode="吨位";
				}
				
				var shipperName=ele.shipperName;
				if(ele.shipperName==null || ele.shipperName==''){
					shipperName='';
				}
				if(ele.driverName==null){
					ele.driverName="";
				}
				if(ele.endPointsStr==null){
					ele.endPointsStr="";
				}
			var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_scatteredCargoTracking_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="<td style='color:red'>"+waybillStatus+"</td>";
				tr+="<td>"+ele.entrustName+"</td>";
				tr+="<td>"+shipperName+"</td>";
				tr+="<td>"+ele.driverName+"</td>";
				tr+="<td>"+ele.currentTransportPrice+"</td>";
				tr+="<td>"+ele.scatteredGoods+"</td>";
				tr+="<td>"+ele.lineInfoName+"</td>";
				tr+="<td>"+ele.endPointsStr+"</td>";
				tr+="<td>"+ele.units+"</td>";
				tr+="<td>"+deductionMode+"</td>";
				tr+="<td>"+ele.reasonableLossRatio+"</td>";
				tr+="<td>"+ele.reasonableLossTonnage+"</td>";
				tr+="<td>"+ele.forwardingUnit+"</td>";
				tr+="<td>"+ele.consignee+"</td>";
				tr+="<td>"+ele.planTransportDateEndStr+"</td>";
				tr+="<td>"+ele.planTransportAmount+"</td>";
				tr+="</tr>";
				$("#sTTtableList").append(tr);
			});
		}
	});
	//查询总数
	$.ajax({
		url:basePath+"/scatteredGoods/getScatteredCargoTrackingCount",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			 parent.getTotalRecordsPlanInfo=resp;
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
		  STList(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getTotalRecordsPlanInfo+9)/10);
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

	/**
	 * 重置搜索栏
	 * 
	 * @author liumin
	 */
	function resetEmpty() {
	  //清除重置线路
	  $(".select-address").empty();
	  $(".address-input input").val('');
	  setTimeout(function() {
		  STList(1);
	  },100)
	}
	
/**
* 查看运单详情
*/


//查看明细按钮
function ChoiceSeeMation(){
	var STIds=new Array();
	$(".sub_scatteredCargoTracking_check").each(function(){
		if($(this).is(":checked")){
			STIds.push($(this).attr("data-id"));
		}
	});
	
	var STIdsLength=STIds.length;
	
	trackingDetailsScatteredGoods(STIds.join(","),STIdsLength);
}

function trackingDetailsScatteredGoods(STIds,STIdsLength){
	
	if(STIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(STIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(STIdsLength=1){
		var url=basePath+"/scatteredGoods/gofindScatteredCargoTrackingPage";
		$("#find_scattered_cargo_tracking").load(url,function(){
			$("#FSCTId").val(STIds);
		});
	}
}
