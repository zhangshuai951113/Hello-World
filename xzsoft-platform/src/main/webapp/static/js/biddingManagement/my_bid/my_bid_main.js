$(function(){
	findMyBidMationList(1);
	//时间调用插件
    setTimeout(function() {
	       $(".date-time-ss").datetimepicker({
	          format: "YYYY-MM-DD HH:mm:ss",
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
	$("body").on("click",".all_my_bid_check",function(){
		if($(".all_my_bid_check").is(":checked")){
			//全选时
			$(".sub_my_bid_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_my_bid_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	/*setTimeout(function(){
		// 允许表格拖着
		$("#tableDrag").colResizable({
			liveDrag : true,
			gripInnerHtml : "<div class='grip'></div>",
			draggingClass : "dragging",
			ifDel: 'tableDrag'
		});
	},1000);*/
});

//查询我的所有中标信息
function findMyBidMationList(number){
	//禁止多次追加
	$("#myBidTtableList").html("");
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
			"rows":10
	}
	$.ajax({
		url:basePath+"/myBidInfo/findMyBidInfoMationAll",
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
				if(ele.paymentMethod==null){
					ele.paymentMethod="";
				}
				if(ele.biddingCodeCopy==null){
					ele.biddingCodeCopy="";
				}
				var tr = " <tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_my_bid_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td style='color:red'>"+ele.isBidStatus+"</td>";
				tr+="		<td>"+ele.biddingCode+"</td>";
				tr+="		<td>"+ele.biddingCodeCopy+"</td>";
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
				$("#myBidTtableList").append(tr);
			});
		}
	});
	//查询我的中标信息总数
	$.ajax({
		url:basePath+"/myBidInfo/getMyBidInfoMationAllCount",
		data:data,
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			parent.getMyBidTotalRecords=resp;
			myBidMethod.setTotalItems(resp);
			$("#bid-num").text("搜索结果共"+resp+"条");
		}
	});
}

//分页
var myBidMethod = $("#my-bid-list").operationList({
  "current":1,    //当前目标
  "maxSize":4,  //前后最大列表
  "itemPage":10,  //每页显示多少条
  "totalItems":0,  //总条数
  "chagePage":function(current){
    //调用ajax请求拿最新数据
	  findMyBidMationList(current);
  }
});

function jumpmyBidPage(e) {

      var totalPage=Math.floor((parent.getMyBidTotalRecords+9)/10);
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
	   myBidMethod.setCurrentPage(value);
	}

//重置按钮
function resetMyBidMation(){
	setTimeout(function(){
		findMyBidMationList(1);
	},500);
}

//判断点击按钮信息
function ChoiceBidMation(number){
	
	var myBidIds=new Array();
	$(".sub_my_bid_check").each(function(){
		if($(this).is(":checked")){
			myBidIds.push($(this).attr("data-id"));
		}
	});
	
	var myBidIdsLength=myBidIds.length;
	//确认
	if(number==1){
		confirmationOfWinningBidInformation(myBidIds.join(","),myBidIdsLength);
	}else 
		//拒绝
		if(number==2){
		rejectBidInformation(myBidIds.join(","),myBidIdsLength);
	}
}

//确认中标信息
function confirmationOfWinningBidInformation(myBidIds,myBidIdsLength){
	if(myBidIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(myBidIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(myBidIdsLength=1){
		
		//在确认接单前首先查询是否接标状态
		$.ajax({
			url:basePath+"/myBidInfo/findMyBidStatus",
			data:{"myBidIds":myBidIds},
			dataType:"JSON",
			type:"POST",
			async:false,
			success:function(resp){
				if(resp){
					if(resp==1){
						xjValidate.showPopup("请不要重复确认!","提示",true);
					}else if(resp==0){
						xjValidate.showPopup("您已经拒绝,不能进行确认操作!","提示",true);
					}else if(resp==2){
						$.confirm({
						      title: '提示',
						      content: '您确定要接受吗？',
						      buttons: {
						          '确定': function () {
						        	//根据我的中标ID修改状态
										$.ajax({
											url:basePath+"/myBidInfo/updateMyBidStatus",
											data:{"myBidIds":myBidIds,"status":0},
											dataType:"JSON",
											type:"POST",
											async:false,
											success:function(resp){
												if(resp.success){
													xjValidate.showPopup(resp.msg,"提示",true);
													findMyBidMationList(1);
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
					}
					
				}else{
					xjValidate.showPopup("系统异常,请稍后再试!","提示",true);
				}
			}
		});
	}
}

//拒绝中标信息
function rejectBidInformation(myBidIds,myBidIdsLength){
	
	if(myBidIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(myBidIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(myBidIdsLength=1){
		
		//在确认接单前首先查询是否接标状态
		$.ajax({
			url:basePath+"/myBidInfo/findMyBidStatus",
			data:{"myBidIds":myBidIds},
			dataType:"JSON",
			type:"POST",
			async:false,
			success:function(resp){
				if(resp){
					
					if(resp==1){
						xjValidate.showPopup("已确认,无法拒绝!","提示",true);
					}else if(resp==0){
						xjValidate.showPopup("您已经拒绝!","提示",true);
					}else if(resp==2){
						$.confirm({
						      title: '提示',
						      content: '您确定要拒绝吗？',
						      buttons: {
						          '确定': function () {
						        	//根据我的中标ID修改状态
										$.ajax({
											url:basePath+"/myBidInfo/updateMyBidStatus",
											data:{"myBidIds":myBidIds,"status":1},
											dataType:"JSON",
											type:"POST",
											async:false,
											success:function(resp){
												if(resp.success){
													xjValidate.showPopup(resp.msg,"提示",true);
													findMyBidMationList(1);
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
					}
					
				}else{
					xjValidate.showPopup("系统异常,请稍后再试!","提示",true);
				}
			}
		});
	}
}