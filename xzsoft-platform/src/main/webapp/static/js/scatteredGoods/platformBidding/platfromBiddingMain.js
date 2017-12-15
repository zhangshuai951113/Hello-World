$(function(){
	$("#startAddress").lineSelect();
	$("#endAddress").lineSelect();
	PBList(1);
	//全选/全不选
	$("body").on("click",".all_platfromBiddingMain_check",function(){
		if($(".all_platfromBiddingMain_check").is(":checked")){
			//全选时
			$(".sub_platfromBiddingMain_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_platfromBiddingMain_check").each(function(){
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
  //允许零散货物表格拖着
    $("#tableDrag").colResizable({
      liveDrag: true,
      gripInnerHtml: "<div class='grip'></div>",
      draggingClass: "dragging"
    });

    //运单零散货物数据较多，增加滑动
    $(".iscroll").css("min-height", "55px");
    $(".iscroll").mCustomScrollbar({
      theme: "minimal-dark"
    });
});

//页面全查
function PBList(number){
	
	$("#platfromBiddingMainTtableList").html("");
	
	var scatteredGoods=$.trim($("#scatteredGoods").val());
	var entrust=$.trim($("#entrust").val());
	var shipper=$.trim($("#shipper").val());
	var forwardingUnit=$.trim($("#forwardingUnit").val());
	var consignee=$.trim($("#consignee").val());
	var waybillStatus=$.trim($("#waybillStatus").val());
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
			"page":number,
			"rows":10,
			planTransportDateStart:planTransportDateStart,
			planTransportDateEnd:planTransportDateEnd,
			"addOrUpdate":2
	};
	
	$.ajax({
		url:basePath+"/scatteredGoods/findDistributeScatteredGoodsAllMation",
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
				
				//承运方
				if(ele.shipperName==null || ele.shipperName==''){
					ele.shipperName='';
				}
				if(ele.driverName==null){
					ele.driverName="";
				}
			var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_platfromBiddingMain_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="<td style='color:red'>"+waybillStatus+"</td>";
				tr+="<td>"+ele.entrustName+"</td>";
				tr+="<td>"+ele.shipperName+"</td>";
				tr+="<td>"+ele.driverName+"</td>";
				tr+="<td>"+ele.currentTransportPrice+"</td>";
				tr+="<td>"+ele.scatteredGoods+"</td>";
				tr+="<td>"+ele.lineInfoName+"</td>";
				tr+="<td>"+ele.endPointsStr+"</td>";
				tr+="<td>"+ele.forwardingUnit+"</td>";
				tr+="<td>"+ele.consignee+"</td>";
				tr+="<td>"+ele.units+"</td>";
				tr+="<td>"+ele.planTransportAmount+"</td>";
				tr+="<td>"+ele.createTimeStr+"</td>";
				tr+="<td>"+ele.offerEndDateStr+"</td>";
				tr+="<td>"+ele.numberOfQuotations+"</td>";
				tr+="</tr>";
				//将tr追加
				$("#platfromBiddingMainTtableList").append(tr);
			});
		}
	});
	//查询最大的记录数
	$.ajax({
		url:basePath+"/scatteredGoods/getDistributeScatteredGoodsAllCount",
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
		  PBList(current);
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
		  PBList(1);
	  },100)
	}
	

//获取全选/单选ID (ID，逗号分隔)
function ChoicePlatformBiddingMation(number){

	var dGIds = new Array();
	$(".sub_platfromBiddingMain_check").each(function(){
		if($(this).is(":checked")){
			dGIds.push($(this).attr("data-id"))
		}
	});
	
	var dGIdsLength=dGIds.length;
	
	    //选择中标方按钮
	if(number==2){
		selectTheWinningBidderById(dGIds.join(","),dGIdsLength);
	}else 
		//重新挂网按钮
		if(number==1){
			hangUpTheNetAgainById(dGIds.join(","),dGIdsLength);
	}else
		//撤回按钮
		if(number==3){
			withdrawByIds(dGIds.join(","),dGIdsLength);
	}else
		//回收报价按钮
		if(number==4){
			recoveryQuotationByIds(dGIds.join(","),dGIdsLength);
	}
}

//回收报价
function recoveryQuotationByIds(dGIds,dGIdsLength){
	
	if(dGIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength=1){
		
		//根据ID查询零散货物运单状态
		$.ajax({
			url:basePath+"/scatteredGoods/findDistributeScatteredGoodsWaybillStatus",
			data:{dGIds:dGIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
			
				//判断零散货物运单状态是否为已发布
			    if(resp==10){
			    	$.confirm({
					      title: '提示',
					      content: '您确定要回收报价吗？',
					      buttons: {
					          '确定': function () {
					        	  
					        	  //修改运单状态为已回收报价
					        	  $.ajax({
					        		  url:basePath+"/scatteredGoods/recoveryQuotationByIds",
					        		  data:{dGIds:dGIds},
					        		  dataType:"json",
					        		  type:"post",
					        		  async:false,
					        		  success:function(resp){
					        			  if(resp){
					        				  
					        				  if(resp.success){
					        					  xjValidate.showPopup(resp.msg,"提示",true);
					        					  PBList(1);
					        				  }else{
					        					  xjValidate.showPopup(resp.msg,"提示",true);
					        				  }
					        				  	  
					        			  }else{
					        				  xjValidate.showPopup("回收报价异常！","提示",true);
					        			  }
					        		  }
					        	  });
					        	  
					          },
					          '取消': function () {
					        	  
					          }
					      }
					  });
			    }else{
			    	xjValidate.showPopup("运单已派发或已回收报价！","提示",true);
			    }
			}
		});
	}
}

//重新挂网
function hangUpTheNetAgainById(dGIds,dGIdsLength){
	
	if(dGIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength=1){
		
		//根据ID查询零散货物运单状态
		$.ajax({
			url:basePath+"/scatteredGoods/findDistributeScatteredGoodsWaybillStatus",
			data:{dGIds:dGIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				
				//判断零散货物运单状态是否为已回收报价
			    if(resp==11){
			    	$.confirm({
					      title: '提示',
					      content: '您确定要重新挂网吗？',
					      buttons: {
					          '确定': function () {
					        	  
					        	  //修改运单状态为已发布
					        	  $.ajax({
					        		  url:basePath+"/scatteredGoods/hangUpTheNetAgainById",
					        		  data:{dGIds:dGIds},
					        		  dataType:"json",
					        		  type:"post",
					        		  async:false,
					        		  success:function(resp){
					        			  if(resp){
					        				  
					        				  if(resp.success){
					        					  xjValidate.showPopup(resp.msg,"提示",true); 
					        					  PBList(1);
					        				  }else{
					        					  xjValidate.showPopup(resp.msg,"提示",true); 
					        				  }
					        				  
					        			  }else{
					        				  xjValidate.showPopup("重新挂网异常!","提示",true);
					        			  }
					        		  }
					        	  });
					        	  
					          },
					          '取消': function () {
					        	  
					          }
					      }
					  });
			    }else{
			    	xjValidate.showPopup("运单已发布！","提示",true);
			    }
			}
		});
	}
}

//撤回
function withdrawByIds(dGIds,dGIdsLength){
	
	if(dGIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength=1){
		
		//根据ID查询零散货物运单状态
		$.ajax({
			url:basePath+"/scatteredGoods/findDistributeScatteredGoodsWaybillStatus",
			data:{dGIds:dGIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				//判断零散货物运单状态是否为已派发
			    if(resp==2){
			    	
			    	//判断零散货物数据是否存在多条
			    	$.ajax({
			    		url:basePath+"/scatteredGoods/findDistributeScatteredGoodsMany",
			    		data:{dGIds:dGIds},
			    		dataType:"json",
			    		type:"post",
			    		async:false,
			    		success:function(resp){
			    			if(resp.success){
			    				xjValidate.showPopup("下游运单已撤回或已派发！","提示",true);
			    			}else{
			    				$.confirm({
			    			    title: '提示',
			    			    content: '您确定要撤回零散货物信息吗？',
			    			    buttons: {
			    			        '确定': function () {
			    			      	  
			    			      	  //撤回
			    			      	$.ajax({
			    			      		url:basePath+"/scatteredGoods/withdrawDistributeScatteredGoods",
			    			      		data:{dGIds:dGIds},
			    			      		dataType:"json",
			    			              type:"post",
			    			              async:false,
			    			              success:function(resp){
			    			              	if(resp.success){
			    			              		xjValidate.showPopup(resp.msg,"提示",true);
			    			              		PBList(1);
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
			    		}
			    	});
			    }else{
			    	xjValidate.showPopup("运单已撤回或已装货！","提示",true);
			    }
			}
		});
	}
}

//选择中标方
function selectTheWinningBidderById(dGIds,dGIdsLength){
	
	if(dGIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength=1){
		
		//根据ID查询零散货物运单状态
		$.ajax({
			url:basePath+"/scatteredGoods/findDistributeScatteredGoodsWaybillStatus",
			data:{dGIds:dGIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				
				//判断零散货物运单状态是否为已撤回，已拒绝，已回收报价
			    if(resp==3 || resp==4 || resp==11){
			    	
			    	//加载报价方信息
			    	var url=basePath+"/scatteredGoods/goPlatformBiddingModel";
			    	$("#platformBiddingModel").load(url,function(){
			    		$("#PBid").val(dGIds);
			    	});
			    	
			    }else{
			    	xjValidate.showPopup("运单已派发或已发布！","提示",true);
			    }
			}
		});
	}
}

//关闭选择报价方模态框
function closePBButton(){
	$("#platformBiddingModel").html("");
}