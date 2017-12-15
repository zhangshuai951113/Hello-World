$(function(){
	contractAddBiddingDetailMationList(1);
	 //全选/全不选
	$("body").on("click",".contract_my_bid_check",function(){
		if($(".contract_my_bid_check").is(":checked")){
			//全选时
			$(".sub_contract_my_bid_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_contract_my_bid_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	
});

function contractAddBiddingDetailMationList(number){
	
	//禁止多次追加
	$("#contractBidInfoTBody").html("");
	var biddingCode=$.trim($("#biddingCode").val());//招标编号
	var biddingName=$.trim($("#biddingName").val());//招标名称
	var createUserName=$.trim($("#createUserName").val());//制单人
	var biddingOrg=$.trim($("#biddingOrg").val());//招标单位
	var goodsName=$.trim($("#goodsName").val());//货物名称
	var lineName=$.trim($("#lineName").val());//线路名称
	var makeStartTime=$.trim($("#makeStartTime").val());//制单时间开始
	var makeEndTime=$.trim($("#makeEndTime").val());//制单时间结束
	var data={
			"biddingCode":biddingCode,
			"biddingName":biddingName,
			"createUserName":createUserName,
			"biddingOrg":biddingOrg,
			"goodsName":goodsName,
			"lineName":lineName,
			"makeStartTime":makeStartTime,
			"makeEndTime":makeEndTime,
			"page":number-1,
			"status":1,
			"rows":10
	}
	$.ajax({
		url:basePath+"/contractInfo/contractAddBiddingDetailMationList",
		data:data,
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				if(ele.isBidStatus==0){
					ele.isBidStatus="已拒绝";
				}else if(ele.isBidStatus==1){
					ele.isBidStatus="已确认";
				}else if(ele.isBidStatus==2){
					ele.isBidStatus="待确认";
				}else{
					ele.isBidStatus="未知状态";
				}
				if(ele.paymentMethod==1){
					ele.paymentMethod="100%货到付款";
				}else if(ele.paymentMethod==2){
					ele.paymentMethod="预付款100%";
				}else if(ele.paymentMethod==3){
					ele.paymentMethod="预付10%,货到验收合格后付款80%,质保金10%";
				}else if(ele.paymentMethod==4){
					ele.paymentMethod="预付10%,货到验收合格后付款90%";
				}
				var tr = " <tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_contract_my_bid_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td style='color:red'>"+ele.isBidStatus+"</td>";
				tr+="		<td>"+ele.biddingCode+"</td>";
				tr+="		<td>"+ele.biddingOrgStr+"</td>";
				tr+="		<td>"+ele.biddingName+"</td>";
				tr+="		<td>"+ele.quotationDeadlineStr+"</td>";
				tr+="		<td>"+ele.paymentMethod+"</td>";
				tr+="		<td>"+ele.createTimeStr+"</td>";
				tr+="		<td>"+ele.createUserStr+"</td>";
				tr+="		<td>"+ele.goodsName+"</td>";
				tr+="		<td>"+ele.lineName+"</td>";
				tr+="		<td>"+ele.forwardingUnit+"</td>";
				tr+="		<td>"+ele.consignee+"</td>";
				tr+="		<td>"+ele.bidderStr+"</td>";
				tr+="		<td>"+ele.quantity+"</td>";
				tr+="		<td>"+ele.distance+"</td>";
				tr+="		<td>"+ele.transportPrice+"</td>";
				tr+="		<td>"+ele.reasonableLossRatio+"</td>";
				tr+="		<td>"+ele.lossDeductionPrice+"</td>";
				tr+="		<td>"+ele.totalQuotedPrice+"</td>";
				tr+="		<td>"+ele.totalQuotedPrice+"</td>";
				tr+="		<tr>";
				$("#contractBidInfoTBody").append(tr);
			});
		}
	});
	//查询我的中标信息总数
	$.ajax({
		url:basePath+"/contractInfo/getContractAddBiddingDetailMationListCount",
		data:data,
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			parent.getConBidTotalRecords=resp;
			conBidList.setTotalItems(resp);
			$("#conBid-num").text("搜索结果共"+resp+"条");
		}
	});
}

//分页
var conBidList = $("#conBid-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  contractAddBiddingDetailMationList(current);
	  }
	});

	
function jumpConBidPage(e) {
	var totalPage=Math.floor((parent.getConBidTotalRecords+9)/10);
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
	conBidList.setCurrentPage(value);
}

//重置
function resetConBidInfo(){
	setTimeout(function(){
		contractAddBiddingDetailMationList(1);
	},100);
}

//关闭模态框
function closeConBidutton(){
	$("#add_bidding_detail_info_mation").html("");
}


//获取操作的ID
function submitConBidMation(){
	var bidIds=new Array();
	$(".sub_contract_my_bid_check").each(function(){
		if($(this).is(":checked")){
			bidIds.push($(this).attr("data-id"));
		}
	});
	
	checkBid(bidIds.join(","),bidIds.length);
	
}

//选择中标信息信息
function checkBid(bidIds,bidIdsLength){
	
	if(bidIdsLength>1){
		commonUtil.showPopup("提示", "请选择一条数据!");
		return false;
	}else if(bidIdsLength<1){
		commonUtil.showPopup("提示", "请选择一条数据!");
		return false;
	}else if(bidIdsLength=1){
		
		$.confirm({
		      title: '提示',
		      content: '您确定要选择这条记录吗？',
		      buttons: {
		    	  '确定': function () {
		    		  
		    		  $.ajax({
		    			  url:basePath+"/contractDetailInfo/addBiddingDetailToContractDetailInfo",
		    			  data:{"myBidId":bidIds,"contractId":$("#contractInfoId").val()},
		    			  dataType:"JSON",
		    			  type:"POST",
		    			  async:false,
		    			  success:function(resp){
		    				  if(resp){
		    					  if(resp.success){
			    					  commonUtil.showPopup("提示", resp.msg);
			    					  $("#add_bidding_detail_info_mation").html("");
			    					  searchContractDetailInfo(1);
		    					  }else{
		    						  commonUtil.showPopup("提示", resp.msg);
		    						  return false;
		    					  }
		    				  }else{
		    					  commonUtil.showPopup("提示", "系统异常，请稍后再试!");
		    						return false;
		    				  }
		    			  }
		    		  });
		    		  
		    	  },
		    	  '取消': function () {
		      }
		      }
		});
		
	}
	
}
