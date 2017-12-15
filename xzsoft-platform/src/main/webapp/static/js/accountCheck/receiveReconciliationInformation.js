$(function(){
	findAccountMationList(1);
	$("body").on("click",".all_Acc_info_check",function(){
		if($(".all_Acc_info_check").is(":checked")){
			//全选时
			$(".sub_Acc_info_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_Acc_info_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
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
    
    // 表格拖拽
    $("#receiveAccountTable").colResizable({
		liveDrag:true, 
		gripInnerHtml:"<div class='grip'></div>", 
		draggingClass:"dragging",
		resizeMode: 'overflow'
	});	
});

function findAccountMationList(number){
	var accountCheckId=$("#accountCheckId").val();
	var accountCheckStatusA=$.trim($("#accountCheckStatus").val());
	var makeTimeStart=$.trim($("#makeTimeStart").val());
	var makeTimeEnd=$.trim($("#makeTimeEnd").val());
	//禁止多次追加
	$("#AccTtableList").html("");
	
	//调用ajax全查
	$.ajax({
		url:basePath+"/accountCheckInfo/findAccountMationList",
		data:{
			"accountCheckId":accountCheckId,
			"accountCheckStatus":accountCheckStatusA,
			"makeTimeStart":makeTimeStart,
			"makeTimeEnd":makeTimeEnd,
			"page":number-1,
			"rows":10,
			"confirmPrice":$("#confirmPrice").val(),
			"confirmForwardingTonnage":$("#confirmForwardingTonnage").val(),
			"confirmArriveTonnage":$("#confirmArriveTonnage").val(),
			"confirmLossTonnage":$("#confirmLossTonnage").val(),
			"confirmOutCar":$("#confirmOutCar").val(),
			"lossDifference":$("#lossDifference").val(),
			"otherDifference":$("#otherDifference").val(),
			"differenceIncome":$("#differenceIncome").val(),
			"confirmUser":$("#confirmUser").val(),
			"confiirmTimeStart":$("#confiirmTimeStart").val(),
			"confiirmTimeEnd":$("#confiirmTimeEnd").val()
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var obj = eval(resp);
			$.each(obj,function(index,ele){
				//对账单状态
				if(ele.accountCheckStatus==1){
					accountCheckStatus="起草";
				}else if(ele.accountCheckStatus==2){
					accountCheckStatus="待审核";
				}else if(ele.accountCheckStatus==3){
					accountCheckStatus="审核通过";
				}else if(ele.accountCheckStatus==4){
					accountCheckStatus="驳回";
				}else if(ele.accountCheckStatus==5){
					accountCheckStatus="待确认";
				}else if(ele.accountCheckStatus==6){
					accountCheckStatus="已确认";
				}
				var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='accId' id='id' type='checkbox' class='sub_Acc_info_check' data-id=\""+ele.id+"\" ></label></td>";
				if(ele.accountCheckStatus==5){
					tr+="		<td class='operation'>";
					tr+="           <div class='view-operation operation-m'  onclick='seeAccount(\""+ele.id+"\")'><div class='view-icon'></div><div class='text'>查看</div></div>";
					tr+="			<div class='delete-operation operation-m'><div class='waybill-confirm-icon'></div><div class='text' onclick='confirmOrRefuseAcc(\""+ele.id+"\")'>确认</div></div>";
					tr+="		</td>";
				}else if(ele.accountCheckStatus==6){
					tr+="		<td class='operation'>";
					tr+="           <div class='view-operation operation-m'  onclick='seeAccount(\""+ele.id+"\")'><div class='view-icon'></div><div class='text'>查看</div></div>";
					tr+="		</td>";
				}
				
				tr+="		<td style='color:red'>"+ele.accountCheckId+"</td>";	
				tr+="		<td style='color:red'>"+accountCheckStatus+"</td>";
				tr+="		<td>"+ele.confirmPrice+"</td>";
				tr+="		<td>"+ele.confirmArriveTonnage+"</td>";
				tr+="		<td>"+ele.confirmLossTonnage+"</td>";
				tr+="		<td>"+ele.confirmOutCar+"</td>";
				tr+="		<td>"+ele.confirmForwardingTonnage+"</td>";
				tr+="		<td>"+ele.lossDifference+"</td>";
				tr+="		<td>"+ele.otherDifference+"</td>";
				tr+="		<td>"+ele.incomeTaxRate+"</td>";
				tr+="		<td>"+ele.differenceIncome+"</td>";
				tr+="		<td>"+ele.receivableTotal+"</td>";
				tr+="		<td>"+ele.payableTotal+"</td>";
				tr+="		<td>"+ele.proxyInvoiceTotal+"</td>";
				tr+="		<td>"+ele.outCar+"</td>";
				tr+="		<td>"+ele.documentsTotal+"</td>";
				tr+="		<td>"+ele.makeUserName+"</td>";
				tr+="		<td>"+ele.makeTimeStr+"</td>";
				tr+="</tr>";
				//数据追加
				$("#AccTtableList").append(tr);
			});
		}
	});
	//调用ajax查询总数
	$.ajax({
		url:basePath+"/accountCheckInfo/getAccountMationListCount",
		data:{
			"accountCheckId":accountCheckId,
			"accountCheckStatus":accountCheckStatusA,
			"makeTimeStart":makeTimeStart,
			"makeTimeEnd":makeTimeEnd,
			"confirmPrice":$("#confirmPrice").val(),
			"confirmForwardingTonnage":$("#confirmForwardingTonnage").val(),
			"confirmArriveTonnage":$("#confirmArriveTonnage").val(),
			"confirmLossTonnage":$("#confirmLossTonnage").val(),
			"confirmOutCar":$("#confirmOutCar").val(),
			"lossDifference":$("#lossDifference").val(),
			"otherDifference":$("#otherDifference").val(),
			"differenceIncome":$("#differenceIncome").val(),
			"confirmUser":$("#confirmUser").val(),
			"confiirmTimeStart":$("#confiirmTimeStart").val(),
			"confiirmTimeEnd":$("#confiirmTimeEnd").val()
		},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			 parent.getTotalRecordsAcc=resp;
			 pagination.setTotalItems(resp);
			 $("#acc-num").text("搜索结果共"+resp+"条");
		}
	});
}

//分页
var pagination = $("#acc-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":5,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  findAccountMationList(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getTotalRecordsAcc+9)/10);
	  var myreg=/^[0-9]+.?[0-9]*$/;
	  var re = new RegExp(myreg);
	  var number=$(e).prev().find('input').val();
	  if(!re.test(number)){
		  xjValidate.showTip("请输入正确的数字!");
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

	
//重置按钮
function resetAcc(){
	setTimeout(function(){
		findAccountMationList(1);
	},100);
}

//获取选择的ID
function accountMation(number){
	
	//获取选中的ID值
	var accIds=new Array();
	$(".sub_Acc_info_check").each(function(){
		if($(this).is(":checked")){
			accIds.push($(this).attr("data-id"));
		}
	});
	var accIdsLength=accIds.length;
		confirmOrRefuseAcc(accIds.join(","),accIdsLength);
}

//确认 or 拒绝
function confirmOrRefuseAcc(accIds){
	
		//调用ajax进行确认
		$.ajax({
			url:basePath+"/accountCheckInfo/updateAccountMationStatus",
			data:{"accIds":accIds},
			dataType:"JSON",
			type:"POST",
			async:false,
			success:function(resp){
				if(resp){
					if(resp.success){
						commonUtil.showPopup("提示", resp.msg);
						findAccountMationList(1);
					}else{
						commonUtil.showPopup("提示", resp.msg);
						findAccountMationList(1);
					}
				}else{
					commonUtil.showPopup("提示", "系统异常，请稍后再试！");
				}
			}
		});
}

//查看
function seeAccount(id){
	    
		$("#myDetailModal").modal("show");
		seeAccountList(id,1);
}

function seeAccountList(id,number){
	
	//禁止多次追加
	$("#seeAccountListTBody").html("");
	
	//调用ajax查询对账明细信息
	$.ajax({
		url:basePath+"/accountCheckInfo/findSettAndWayMationByAccId",
		data:{"accId":id,"page":number,"rows":10},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				if(ele.goodsName==null){
					ele.goodsName='';
				}
				if(ele.carCode==null){
					ele.carCode='';
				}
				if(ele.entrustName==null){
					ele.entrustName='';
				}
				if(ele.shipperName==null){
					ele.shipperName='';
				}
				if(ele.scatteredGoods==null){
					ele.scatteredGoods='';
				}
				if(ele.lineStartStr==null){
					ele.lineStartStr='';
				}
				if(ele.lineEndStr==null){
					ele.lineEndStr='';
				}
				if(ele.forwardingUnit==null){
					ele.forwardingUnit='';
				}
				if(ele.consignee==null){
					ele.consignee='';
				}
				if(ele.customerPrice==null){
					ele.customerPrice='';
				}
				if(ele.payablePrice==null){
					ele.payablePrice='';
				}
				if(ele.proxyInvoiceTotal==null){
					ele.proxyInvoiceTotal='';
				}
				if(ele.waybillId==null){
					ele.waybillId='';
				}
				// 追加数据
				var tr = "";
				tr += "<tr class='table-body' align='center'>";
				tr += "<td>" + ele.waybillId  + "</td>";
				tr += "<td>" + ele.carCode  + "</td>";
				tr += "<td>" + ele.entrustName + "</td>";
				tr += "<td>" + ele.shipperName + "</td>";
				tr += "<td>" + ele.goodsName + "</td>";
				tr += "<td>" + ele.scatteredGoods + "</td>";
				tr += "<td>" + ele.lineStartStr + "</td>";
				tr += "<td>" + ele.lineEndStr + "</td>";
				tr += "<td>" + ele.forwardingUnit + "</td>";
				tr += "<td>" + ele.consignee + "</td>";
				tr += "<td>" + ele.customerPrice + "</td>";
				tr += "<td>" + ele.payablePrice + "</td>";
				tr += "<td>" + ele.proxyInvoiceTotal + "</td>";
				// 将tr追加
				$("#seeAccountListTBody").append(tr);
			});
		}
		
	});
	//查询数量
	$.ajax({
		url:basePath+"/accountCheckInfo/getSettAndWayMationByAccIdCount",
		data:{"accId":id},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			// parent.getAccRecordsAcc=resp;
			// aaaaList.setTotalItems(resp);
			// $("#acc-num").text("搜索结果共"+resp+"条");
		}
	});
}