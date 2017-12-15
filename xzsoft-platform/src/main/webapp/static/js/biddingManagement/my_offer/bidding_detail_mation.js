var sign="";
$(function(){
	biddingDetailMationList(1);
	//全选/全不选
	$("body").on("click",".all_bidding_detail_info_check",function(){
		if($(".all_bidding_detail_info_check").is(":checked")){
			//全选时
			$(".sub_bidding_detail_info_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_bidding_detail_info_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	setTimeout(function(){
		// 允许表格拖着
		$("#tableDrag").colResizable({
			liveDrag : true,
			gripInnerHtml : "<div class='grip'></div>",
			draggingClass : "dragging",
			ifDel: 'tableDrag'
		});
	},1000);
});

//招标明细信息查询
function biddingDetailMationList(number){
	//禁止多次追加
	$("#biddingDetailTtableList").html("");
	
	var goodsName=$.trim($("#goodsName").val());
	var lineName=$.trim($("#lineName").val());
	//调用ajax查询
	$.ajax({
		url:basePath+"/myOffer/findBiddingDetailMationByBiddingInfoId",
		data:{"biddingInfoId":$("#hidden-bidding-detail-id").val(),"goodsName":goodsName,"lineName":lineName,"page":number-1,"rows":10},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				if(ele.remark==null){
					ele.remark="";
				}
				if(ele.transportPrice==null){
					ele.transportPrice="";
				}
				if(ele.lossRatio==null){
					ele.lossRatio="";
				}
				if(ele.lossMoney==null){
					ele.lossMoney="";
				}
				if(ele.offerPrice==null){
					ele.offerPrice="";
				}
				var tr = " <tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_bidding_detail_info_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td class='editbox'>"+ele.goodsName+"</td>";
				tr+="		<td>"+ele.lineName+"</td>";
				tr+="		<td>"+ele.distance+"</td>";
				tr+="		<td>"+ele.quantity+"</td>";
				tr+="		<td>"+ele.units+"</td>";
				tr+="		<td>"+ele.forwardingUnit+"</td>";
				tr+="		<td>"+ele.consignee+"</td>";
				tr+="		<td>"+ele.startDateStr+"</td>";
				tr+="		<td>"+ele.endDateStr+"</td>";
				tr+="		<td>"+ele.remark+"</td>";
				tr+="		<td>"+ele.transportPrice+"</td>";
				tr+="		<td>"+ele.lossRatio+"</td>";
				tr+="		<td>"+ele.lossMoney+"</td>";
				tr+="		<td>"+ele.offerPrice+"</td>";
				tr+="</tr>";
			//将tr追加到
			$("#biddingDetailTtableList").append(tr);
			});
		}
	});
	//调用ajax查询招标明细总数
	$.ajax({
		url:basePath+"/myOffer/getBiddingDetailMationCountByBiddingInfoId",
		data:{"biddingInfoId":$("#hidden-bidding-detail-id").val(),"goodsName":goodsName,"lineName":lineName},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			 parent.getBiddingDetailTotalRecords=resp;
			 biddingDetailMethod.setTotalItems(resp);
			 $("#bidding-detail-num").text("搜索结果共"+resp+"条");
		}
	});
}

//分页
var biddingDetailMethod = $("#bidding-detail-list").operationList({
  "current":1,    //当前目标
  "maxSize":4,  //前后最大列表
  "itemPage":10,  //每页显示多少条
  "totalItems":0,  //总条数
  "chagePage":function(current){
    //调用ajax请求拿最新数据
	  biddingDetailMationList(current);
  }
});

function jumpbiddingDetailPage(e) {
	
	      var totalPage=Math.floor((parent.getBiddingDetailTotalRecords+9)/10);
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
		   biddingDetailMethod.setCurrentPage(value);
		}

//重置模糊查询条件
function resetBiddingDetail(){
	setTimeout(function(){
		 biddingDetailMationList(1);
	},100);
}

//判断选择按钮
function ChoiceOfferMation(number){

	var offerIds=new Array();
	$(".sub_bidding_detail_info_check").each(function(){
		if($(this).is(":checked")){
			offerIds.push($(this).attr("data-id"));
		}
	});
	var offerIdsLength=offerIds.length;
	//参与报价
	if(number==1){
		participatingQuotation(offerIds.join(","),offerIdsLength);
	}else 
		//修改报价
		if(number==2){
		updateMyOffer(offerIds.join(","),offerIdsLength);
	}
}

//参与报价
function participatingQuotation(offerIds,offerIdsLength){
	//判断选择长度
	if(offerIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(offerIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(offerIdsLength=1){
		
		//根据选择的招标明细ID查询招标主信息判断当前时间是否超过报价截止日期
		$.ajax({
			url:basePath+"/myOffer/findBiddingInfoMationByBiddingDetailId",
			data:{"biddingDetailId":offerIds},
			dataType:"JSON",
			type:"POST",
			async:false,
			success:function(resp){
				if(resp){
					if(resp.success){
						//判断账户可用余额是否可以参与报价
						$.ajax({
							url:basePath+"/myOffer/findAvailableBalanceOfMyAccount",
							data:{"biddingDetailId":offerIds},
							dataType:"JSON",
							type:"POST",
							async:false,
							success:function(obj){
								if(obj){
									if(obj.success){
										//判断是否异常参与报价
										$.ajax({
											url:basePath+"/myOffer/findMyOfferDetailMationCountByBiddingDetailId",
											data:{"biddingDetailId":offerIds},
											dataType:"JSON",
											type:"POST",
											async:false,
											success:function(params){
												if(params>=1){
													xjValidate.showPopup("请不要重复参与报价!","提示",true);
												}else if(params<1){
													//弹出报价模态框,完善报价信息
													var url=basePath+"/myOffer/go_participating_quotation";
													$("#user_participating_quotation").load(url,function(){
														$("#bidding-detail-id").val(offerIds);
														$("#bidding-detail-sum").val(resp.msg);
													});
												}
											}
										});
									}else{
										$.alert(obj.msg);
									}
								}else{
									$.alert("系统异常，请稍后再试!");
								}
							}
						});
						
					}else{
						$.alert(resp.msg);
					}
				}else{
					xjValidate.showPopup("系统异常,请稍后再试!","提示",true);
				}
			}
		});
	}
}

//关闭报价信息模态框
function closeMyOfferInfo(){
	$("#user_participating_quotation").html("");
	$("#update_user_participating_quotation").html("");
}

//键盘抬起计算报价总额
function offerSum(){
	$("#totalQuotedPrice").val("");
	var transportPrice=$.trim($("#transportPrice").val());//运价
	var transportPriceNum=parseFloat(transportPrice);
	var biddingDetailSum=$.trim($("#bidding-detail-sum").val());//招标明细总量
	var biddingDetailSumNum=parseFloat(biddingDetailSum);
	var sum=(transportPrice*biddingDetailSumNum).toFixed(4); 
	var regax=/^\d+(\.\d+)?$/;
	if(!regax.test(transportPrice) ){
		return false;
	}
	$("#totalQuotedPrice").val(sum);
}

//添加报价按钮
function addMyOfferInfo(){
	sign=1;
	addOrUpdateMyOfferInfo(sign);
}

//添加/修改报价信息
function addOrUpdateMyOfferInfo(sign){
	var transportPrice=$.trim($("#transportPrice").val());
	if(transportPrice==undefined || transportPrice==''){
		xjValidate.showTip("请输入运价!");
		return false;
	}
	var reasonableLossRatio=$.trim($("#reasonableLossRatio").val());
	if(reasonableLossRatio==undefined || reasonableLossRatio==''){
		xjValidate.showTip("请输入损耗比例!");
		return false;
	}
	var lossDeductionPrice=$.trim($("#lossDeductionPrice").val());
	if(lossDeductionPrice==undefined || lossDeductionPrice==''){
		xjValidate.showTip("请输入损耗金额!");
		return false;
	}
	
	var biddingDetailSum=$.trim($("#bidding-detail-sum").val());
	var biddingDetailId=$.trim($("#bidding-detail-id").val());
	
	var quotationDescription=$.trim($("#quotationDescription").val());
	if(quotationDescription.length>200){
		xjValidate.showTip("报价说明的长度不能超过100个字符!");
		return false;
	}
	
	var myOfferDetailId=$.trim($("#myOffer-detail-id").val());
	
	var data={
			"transportPrice":transportPrice,
			"reasonableLossRatio":reasonableLossRatio,
			"lossDeductionPrice":lossDeductionPrice,
			"quotationDescription":quotationDescription,
			"sign":sign,
			"biddingDetailSum":biddingDetailSum,
			"biddingDetailId":biddingDetailId,
			"myOfferDetailId":myOfferDetailId
	};
	
	//全部验证通过
	$.ajax({
		url:basePath+"/myOffer/addOrUpdateMyOfferInfo",
		data:data,
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					$("#user_participating_quotation").html("");
					$("#update_user_participating_quotation").html("");
					biddingDetailMationList(1);
					xjValidate.showPopup(resp.msg,"提示",true);
				}else{
					xjValidate.showPopup(resp.msg,"提示",true);
				}
			}else{
				xjValidate.showTip("系统异常,请稍后再试!");
			}
		}
	});
}


//修改我的报价信息
function updateMyOffer(offerIds,offerIdsLength){

	//判断选择长度
	if(offerIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(offerIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(offerIdsLength=1){
		
		//根据选择的招标明细ID查询招标主信息判断当前时间是否超过报价截止日期
		$.ajax({
			url:basePath+"/myOffer/findBiddingInfoMationByBiddingDetailId",
			data:{"biddingDetailId":offerIds},
			dataType:"JSON",
			type:"POST",
			async:false,
			success:function(resp){
				if(resp){
					if(resp.success){
						//判断是否已经参与过报价
						$.ajax({
							url:basePath+"/myOffer/findMyOfferDetailMationCountByBiddingDetailId",
							data:{"biddingDetailId":offerIds},
							dataType:"JSON",
							type:"POST",
							async:false,
							success:function(params){
								if(params>=1){
									//弹出报价模态框,修改报价信息
									var url=basePath+"/myOffer/go_update_participating_quotation";
									$("#update_user_participating_quotation").load(url,function(){
										$("#bidding-detail-id").val(offerIds);
										$("#bidding-detail-sum").val(resp.msg);
										//回显我的报价信息
										$.ajax({
											url:basePath+"/myOffer/findOfferdetailMationById",
											data:{"biddingDetailId":offerIds},
											dataType:"JSON",
											type:"POST",
											async:false,
											success:function(resp){
												$("#myOffer-detail-id").val(resp.id);//报价明细ID
												$("#transportPrice").val(resp.transportPrice);//运价
												$("#reasonableLossRatio").val(resp.reasonableLossRatio);//损耗比例
												$("#lossDeductionPrice").val(resp.lossDeductionPrice);//损耗金额
												$("#totalQuotedPrice").val(resp.totalQuotedPrice);//报价金额
												$("#quotationDescription").val(resp.quotationDescription);//报价说明
											}
										});
									});
								}else if(params<1){
									xjValidate.showPopup("请先参与报价!","提示",true);
								}
							}
						});
					}else{
						$.alert(resp.msg);
					}
				}else{
					xjValidate.showPopup("系统异常,请稍后再试!","提示",true);
				}
			}
		});
	}
}

//修改报价信息
function updateMyOfferInfo(){
	sign=2;
	addOrUpdateMyOfferInfo(sign);
}
