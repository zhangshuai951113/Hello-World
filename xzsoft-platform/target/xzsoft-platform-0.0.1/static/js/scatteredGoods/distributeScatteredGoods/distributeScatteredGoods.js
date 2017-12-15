var sign="";
$(function(){
	$("#startAddress").lineSelect();
	$("#endAddress").lineSelect();
	
	SeList(1);
	//全选/全不选
	$("body").on("click",".all_distributeScatteredGoods_check",function(){
		if($(".all_distributeScatteredGoods_check").is(":checked")){
			//全选时
			$(".sub_distributeScatteredGoods_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_distributeScatteredGoods_check").each(function(){
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
    
   //允许 表格拖着
    $("#tableDrag").colResizable({
      liveDrag: true,
      gripInnerHtml: "<div class='grip'></div>",
      draggingClass: "dragging"
    });
});

//零散货物全查
function SeList(number){
	
	//禁止多次追加
	$("#distributeScatteredGoodsPageTtableList").html("");
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
			"addOrUpdate":1
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
				//司机名称
				if(ele.driverName==null){
					ele.driverName='';
				}
				if(ele.endPointsStr==null){
					ele.endPointsStr="";
				}
				if(ele.units==null){
					ele.units="";
				}
			var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_distributeScatteredGoods_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="<td>"+ele.entrustName+"</td>";
				tr+="<td>"+ele.shipperName+"</td>";
				tr+="<td>"+ele.driverName+"</td>";
				tr+="<td>"+ele.currentTransportPrice+"</td>";
				tr+="<td>"+ele.scatteredGoods+"</td>";
				tr+="<td>"+ele.lineInfoName+"</td>";
				tr+="<td>"+ele.endPointsStr+"</td>";
				tr+="<td>"+ele.forwardingUnit+"</td>";
				tr+="<td>"+ele.consignee+"</td>";
				tr+="<td>"+ele.planTransportDateStartStr+"</td>";
				tr+="<td>"+ele.units+"</td>";
				tr+="<td>"+ele.planTransportAmount+"</td>";
				tr+="<td style='color:red'>"+waybillStatus+"</td>";
				tr+="<td>"+ele.createTimeStr+"</td>";
				tr+="</tr>";
				//将tr追加
				$("#distributeScatteredGoodsPageTtableList").append(tr);
			});
		}
	});
	
	//查询零散货物最大的记录数
	$.ajax({
		url:basePath+"/scatteredGoods/getDistributeScatteredGoodsAllCount",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			 parent.getTotalRecordsPlanInfo=resp;
			 pagination.setTotalItems(resp);
			 $("#scattered-goods-num").text("搜索结果共"+resp+"条");
		}
	});
}

//分页
var pagination = $("#scatteredGoods-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  SeList(current);
	  }
	});

	
	function jumpSGoodsPage(e) {
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
	  SeList(1);
  },100)
}

//关闭模态框
function closeButton(){
	$("#add_distributeScatteredGoods_plan").html("");
	$("#update_distributeScatteredGoods_info").html("");
}

function closeEButton(){
	$("#find_entrust_info_model").html("");
}

function closeCButton(){
	$("#find_car_source_model").html("");
}

function closePButton(){
	$("#find_partner_info_temp_model").html("");
}

function closeDButton(){
	$("#find_internal_driver_model").html("");
}

//点击零散货物新增按钮
function addDistributeScatteredGoodsPage(){
	var url=basePath+"/scatteredGoods/addScatteredGoodsModel";
	$("#add_distributeScatteredGoods_plan").load(url,function(){
		  $("#addLineData").lineSelect();
		  $("#endLineData").lineSelect();
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
	    initIsCombine();
	  
	  //点击添加时判断登录用户角色，（个体货主隐藏选择委托方选择框）
		$.ajax({
			url:basePath+"/scatteredGoods/judgeLoginUserRole",
			data:"",
			dataType:"JSON",
			type:"POST",
			async:false,
			success:function(resp){
				if(resp){
					//个体货主角色
					if(resp.userRole==3){
						document.getElementById("checkedEntrustBox").style.display='none';
						document.getElementById("ownDriver").style.display='none';
						$("#Eentrust").val(resp.id);
					}
				}else{
					xjValidate.showPopup("系统异常,请稍后再试!","提示",true);
					return false;
				}
			}
		});
	});
	
}

function initReleaseMode(e){
	var releaseMode=e;
	if(releaseMode==2 || releaseMode==3 || releaseMode==4){
		$("#cautionMoneyDiv").hide();
		$("#advanceChargeDiv").hide();
		$("#offerEndDate").hide();
		$("#shipperName").show();
	}else {
		$("#cautionMoneyDiv").show();
		$("#advanceChargeDiv").show();
		$("#offerEndDate").show();
		$("#shipperName").hide();
	}
}

//初始化发布平台信息
function initIsCombine(){
	//取出是否发布平台字段
	var releaseMode = $("#releaseMode").val();
	//若是发布平台则显示保证金金额，预付款金额
	if(releaseMode==1){
		$("#cautionMoneyDiv").show();
		$("#advanceChargeDiv").show();
		$("#shipperName").show();
		$("#offerEndDate").show();
	}
	//若不是发布平台则隐藏保证金金额，预付款金额
	else{
		$("#cautionMoneyDiv").hide();
		$("#advanceChargeDiv").hide();
		$("#shipperName").hide();
		$("#offerEndDate").hide();
	}
}

//初始化发布平台信息
function changeReleaseMode(){
	//取出是否发布平台字段
	var releaseMode = $("#releaseMode").val();
	//若是发布平台则显示保证金金额，预付款金额
	if(releaseMode==1){
		$("#cautionMoneyDiv").show();
		$("#advanceChargeDiv").show();
		$("#offerEndDate").show();
		$("#shipperName").hide();
	}
	//若不是发布平台则隐藏保证金金额，预付款金额
	else{
		$("#cautionMoneyDiv").hide();
		$("#advanceChargeDiv").hide();
		$("#offerEndDate").hide();
		$("#shipperName").show();
		$("#shipperName input").attr("data-id",releaseMode);
		$("#cautionMoney").val("");
		$("#advanceCharge").val("");
		$("#SofferEndDate").val("");
		$("#CshipperName").val("");
	}
}

//进入查询委托方列表
function addEntrustMationModel(){
	var url=basePath+"/scatteredGoods/goFindEntrustPage";
	$("#find_entrust_info_model").load(url);
}


/**
 * @param id(发布方式)
 * 判断发布方式
 */
function addShipperModel (e) {
	var id = $(e).attr("data-id");
	//匹配车源
	if(id==2){
		
			var url=basePath+"/scatteredGoods/goCarSourcePage";
			$("#find_car_source_model").load(url);

	}else 
		//合作伙伴
		if(id==3){
		
				var url=basePath+"/scatteredGoods/goPartnerInfoTempPage";
				$("#find_partner_info_temp_model").load(url);
			
	}else 
		//内部司机
		if(id==4){
		
				var url=basePath+"/scatteredGoods/goInternalDriverPage";
				$("#find_internal_driver_model").load(url);
			
	}
}

//点击保存按钮
function addDistributeScatteredGoodsBtn(){
	sign=1;
	addOrUpdateDistributeScatteredGoodsBtn(sign);
}

//保存/修改零散货物
function addOrUpdateDistributeScatteredGoodsBtn(sign){
	var regax=/^\d+(\.\d+)?$/;
	//验证参数
	
	//零散货物名称
	var scatteredGoods=$.trim($("#SscatteredGoods").val());
	if(scatteredGoods==undefined || scatteredGoods==''){
		 xjValidate.showTip("零散货物名称不能为空!");
		 return false;
	}
	
	if(scatteredGoods.length>100){
		 xjValidate.showTip("零散货物名称的长度不能超过50个字符!");
		 return false;
	}
	
	//运距
	var distance=$.trim($("#distance").val());
	if(!regax.test(distance)){
		xjValidate.showTip("请输入正确的运距!");
		return false;
	}
	var distance= parseFloat(distance).toFixed(2);
	//$("#distance").val(distance);
	
	//计划拉运量
	var planTransportAmount=$.trim($("#planTransportAmount").val());
	if(!regax.test(planTransportAmount)){
		xjValidate.showTip("请输入正确的计划拉运量!");
		return false;
	}
	var planTransportAmount= parseFloat(planTransportAmount);
	var planTransportAmount=planTransportAmount.toFixed(2);
	//$("#planTransportAmount").val(planTransportAmount);
	
	//当前运价
	var currentTransportPrice=$.trim($("#currentTransportPrice").val());
	if(!regax.test(currentTransportPrice)){
		xjValidate.showTip("请输入正确的运价!");
		return false;
	}
	var currentTransportPrice= parseFloat(currentTransportPrice);
	var currentTransportPrice=currentTransportPrice.toFixed(4);
	//$("#currentTransportPrice").val(currentTransportPrice);
	
	//合理损耗比例(%)
	var reasonableLossRatio=$.trim($("#reasonableLossRatio").val());
	if(!regax.test(reasonableLossRatio)){
		xjValidate.showTip("请输入正确的合理损耗比例(%)!");
		return false;
	}
	var reasonableLossRatio= parseFloat(reasonableLossRatio);
	var reasonableLossRatio=reasonableLossRatio.toFixed(4);
	//$("#reasonableLossRatio").val(reasonableLossRatio);
	
	//合理损耗吨位(吨)
	var reasonableLossTonnage=$.trim($("#reasonableLossTonnage").val());
	if(!regax.test(reasonableLossTonnage)){
		xjValidate.showTip("请输入正确的合理损耗吨位(吨)!");
		return false;
	}
	var reasonableLossTonnage= parseFloat(reasonableLossTonnage);
	var reasonableLossTonnage=reasonableLossTonnage.toFixed(4);
	//$("#reasonableLossTonnage").val(reasonableLossTonnage);
	
	//损耗扣款价格(元)
	var lossDeductionPrice=$.trim($("#lossDeductionPrice").val());
	if(!regax.test(lossDeductionPrice)){
		xjValidate.showTip("请输入正确的损耗扣款价格(元)!");
		return false;
	}
	var lossDeductionPrice= parseFloat(lossDeductionPrice);
	var lossDeductionPrice=lossDeductionPrice.toFixed(4);
	//$("#lossDeductionPrice").val(lossDeductionPrice);
	
	//发货单位
	var forwardingUnit=$.trim($("#SforwardingUnit").val());
	if(forwardingUnit==undefined || forwardingUnit==''){
		xjValidate.showTip("请输入发货单位!");
		return false;
	}
	if(forwardingUnit.length>100){
		xjValidate.showTip("发货单位的长度不能超过50个字符!");
		return false;
	}
	
	//到货单位
	var consignee=$.trim($("#Sconsignee").val());
	if(consignee==undefined || consignee==''){
		xjValidate.showTip("请输入到货单位!");
		return false;
	}
	if(consignee.length>100){
		xjValidate.showTip("到货单位的长度不能超过50个字符!");
		return false;
	}
	
	//计划拉运日期
	var planTransportDate=$.trim($("#planTransportDate").val());
	if(planTransportDate==undefined || planTransportDate==''){
		xjValidate.showTip("请输入计划拉运日期!");
		return false;
	}

	//计量单位
	var units=$.trim($("#units").val());
	if(units==undefined || units==''){
		xjValidate.showTip("请选择计量单位!");
		return false;
	}
	
	//计算方式
	var computeMode=$.trim($("#computeMode").val());
	if(computeMode==undefined || computeMode==''){
		xjValidate.showTip("请选择计算方式!");
		return false;
	}
	
	//定损方式
	var deductionMode=$.trim($("#deductionMode").val());
	if(deductionMode==undefined || deductionMode==''){
		xjValidate.showTip("请选择定损方式!");
		return false;
	}
	
	//发布方式
	var releaseMode=$.trim($("#releaseMode").val());
	if(releaseMode==undefined || releaseMode==''){
		xjValidate.showTip("请选择发布方式!");
		return false;
	}
	
	//是否倒扣
	var isInvert=$.trim($("#isInvert").val());
	if(isInvert==undefined || isInvert==''){
		xjValidate.showTip("请选择是否倒扣!");
		return false;
	}
	
	//委托方
	var Eentrust=$.trim($("#Eentrust").val());
	if(Eentrust==undefined || Eentrust==''){
		xjValidate.showTip("请选择委托方!");
		return false;
	}
	
	//线路起点
	var LineInfoId=$.trim($("#LineInfoId").val());
	if(LineInfoId==undefined || LineInfoId==''){
		xjValidate.showTip("请选择线路起点!");
		return false;
	}
	//线路终点
	var endPoints=$.trim($("#endPoints").val());
	if(endPoints==undefined || endPoints==''){
		xjValidate.showTip("请选择线路终点!");
		return false;
	}
	//如果发布方式为发布平台
	if(releaseMode==1){
		
		//保证金金额(元)
		var cautionMoney=$.trim($("#cautionMoney").val());
		if(!regax.test(cautionMoney)){
			xjValidate.showTip("请输入正确的保证金金额(元)!");
			return false;
		}
		var cautionMoney= parseFloat(cautionMoney);
		var cautionMoney=cautionMoney.toFixed(2);
		//$("#cautionMoney").val(cautionMoney);
		
		//预付款金额(元)
		var advanceCharge=$.trim($("#advanceCharge").val());
		if(!regax.test(advanceCharge)){
			xjValidate.showTip("请输入正确的预付款金额(元)!");
			return false;
		}
		var advanceCharge= parseFloat(advanceCharge);
		var advanceCharge=advanceCharge.toFixed(2);
		//$("#advanceCharge").val(advanceCharge);

		//报价截止日期
		var offerEndDate=$.trim($("#SofferEndDate").val());
		if(offerEndDate==undefined || offerEndDate==''){
			xjValidate.showTip("请输入报价截止日期!");
			return false;
		}
		
		var now = new Date();
		var sevenDaysBeforeNow = now.getTime() + 7*24*60*60*1000;
		if(new Date(offerEndDate).getTime()>sevenDaysBeforeNow){
			xjValidate.showTip("报价截止日期不能超过系统当前日期七天!");
			return false;
		}
	
		if(new Date(offerEndDate).getTime()<(now.getTime()-1*10*60*60*1000)){
			xjValidate.showTip("请输入正确的报价截止日期!");
			return false;
		}
		//判断计划拉运日期是否超过报价截止日期
		if(new Date(planTransportDate).getTime()<new Date(offerEndDate).getTime()){
			xjValidate.showTip("计划拉运日期必须大于报价截止日期!");
			return false;
		}
		
	}else{
		
		//承运方
		/*var Cshipper=$.trim($("#Cshipper").val());
		if(Cshipper==undefined || Cshipper==''){
			xjValidate.showTip("请选择承运方!");
			return false;
		}*/
	}
	var data=$("#sub_scattered_goods_form").serialize();
	data+="&sign="+sign+"";
	//验证通过
	$.ajax({
		url:basePath+"/scatteredGoods/addOrUpdateDistributeScatteredGoods",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			if(resp){
				
				if(resp.success){
					xjValidate.showTip(resp.msg);
					$("#add_distributeScatteredGoods_plan").html("");
					$("#update_distributeScatteredGoods_info").html("");
					SeList(1);
					pagination.setCurrentPage(1);
				} else {
					 xjValidate.showPopup(resp.msg,"提示",true);
				}
				
			}else{
				xjValidate.showPopup("信息异常!","提示",true);
			}
		}
	});
}

//获取全选/单选ID (计划ID，逗号分隔)
function ChoicePlanInfoMation(number){

	var dGIds = new Array();
	$(".sub_distributeScatteredGoods_check").each(function(){
		if($(this).is(":checked")){
			dGIds.push($(this).attr("data-id"))
		}
	});
	
	var dGIdsLength=dGIds.length;
	
	    //删除按钮
	if(number==2){
		deleteDistributeScatteredGoodsById(dGIds.join(","),dGIdsLength);
	}else 
		//修改按钮
		if(number==1){
		updateDistributeScatteredGoodsById(dGIds.join(","),dGIdsLength);
	}else
		//撤回按钮
		if(number==3){
			withdrawDistributeScatteredGoodsByIds(dGIds.join(","),dGIdsLength);
	}
}

//删除零散货物
function deleteDistributeScatteredGoodsById(dGIds,dGIdsLength){
	
	//判断选择条数
	if(dGIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength=1){
		
		//根据ID查询零散货物运单状态是否为已撤回，已拒绝
		$.ajax({
			url:basePath+"/scatteredGoods/findDistributeScatteredGoodsWaybillStatus",
			data:{dGIds:dGIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				
				//判断零散货物运单状态是否为已撤回，已拒绝
			    if(resp==3 || resp==4){
			    	
			    	//判断子运单状态
			    	$.ajax({
			    		url:basePath+"/scatteredGoods/findSunWaybillMation",
			    		data:{dGIds:dGIds},
			    		dataType:"json",
			    		type:"post",
			    		async:false,
			    		success:function(resp){
			    			if(resp!=0){
			    				if(resp==3 || resp==4){
			    					$.confirm({
			  					      title: '提示',
			  					      content: '您确定要删除吗？',
			  					      buttons: {
			  					          '确定': function () {
			  					        	  
			  					        	  //删除零散货物信息
			  					        	$.ajax({
			  					        		url:basePath+"/scatteredGoods/deleteDistributeScatteredGoodsById",
			  					        		data:{dGIds:dGIds},
			  					        		dataType:"json",
			  			                        type:"post",
			  			                        async:false,
			  			                        success:function(resp){
			  			                        	if(resp.success){
			  			                        		xjValidate.showPopup(resp.msg,"提示",true);
			  			                        		SeList(1);
			  			                        		pagination.setCurrentPage(1);
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
			    					xjValidate.showPopup("运单已派发！","提示",resp);
			    				}
			    			}else{
			    				$.confirm({
			  					      title: '提示',
			  					      content: '您确定要删除吗？',
			  					      buttons: {
			  					          '确定': function () {
			  					        	  
			  					        	  //删除零散货物信息
			  					        	$.ajax({
			  					        		url:basePath+"/scatteredGoods/deleteDistributeScatteredGoodsById",
			  					        		data:{dGIds:dGIds},
			  					        		dataType:"json",
			  			                        type:"post",
			  			                        async:false,
			  			                        success:function(resp){
			  			                        	if(resp.success){
			  			                        		xjValidate.showPopup(resp.msg,"提示",true);
			  			                        		SeList(1);
			  			                        		pagination.setCurrentPage(1);
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
			    	xjValidate.showPopup("运单已派发！","提示",true);
			    }
			}
		});
	}
}

//撤回零散货物信息
function withdrawDistributeScatteredGoodsByIds(dGIds,dGIdsLength){
	
	//判断选择条数
	if(dGIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength=1){
		
		//根据ID查询零散货物运单状态是否为已派发
		$.ajax({
			url:basePath+"/scatteredGoods/findDistributeScatteredGoodsWaybillStatus",
			data:{dGIds:dGIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				
				//判断零散货物运单状态是否为已派发
			    if(resp==2){
			    	
			    	/*//判断零散货物数据是否存在多条
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
			    			      	  
			    			      	  //撤回零散货物信息
			    			      	$.ajax({
			    			      		url:basePath+"/scatteredGoods/withdrawDistributeScatteredGoods",
			    			      		data:{dGIds:dGIds},
			    			      		dataType:"json",
			    			              type:"post",
			    			              async:false,
			    			              success:function(resp){
			    			              	if(resp.success){
			    			              		xjValidate.showPopup(resp.msg,"提示",true);
			    			              		SeList(1);
			    			              		pagination.setCurrentPage(1);
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
			    	});*/
			    	
			    	//判断子运单状态
			    	$.ajax({
			    		url:basePath+"/scatteredGoods/findSunWaybillMation",
			    		data:{dGIds:dGIds},
			    		dataType:"json",
			    		type:"post",
			    		async:false,
			    		success:function(resp){
			    			if(resp!=0){
			    				if(resp==1){
			    					$.confirm({
					    			    title: '提示',
					    			    content: '您确定要撤回零散货物信息吗？',
					    			    buttons: {
					    			        '确定': function () {
					    			      	  
					    			      	  //撤回零散货物信息
					    			      	$.ajax({
					    			      		url:basePath+"/scatteredGoods/withdrawDistributeScatteredGoods",
					    			      		data:{dGIds:dGIds},
					    			      		dataType:"json",
					    			              type:"post",
					    			              async:false,
					    			              success:function(resp){
					    			              	if(resp.success){
					    			              		xjValidate.showPopup(resp.msg,"提示",true);
					    			              		SeList(1);
					    			              		pagination.setCurrentPage(1);
					    			              		return false;
					    			              	}else{
					    			              		xjValidate.showPopup(resp.msg,"提示",true);
					    			              		return false;
					    			              	}
					    			              }
					    			      	});
					    			        },
					    			        '取消': function () {
					    			      	  
					    			        }
					    			    }
					    			}); 
			    				}else{
			    					xjValidate.showPopup("运单已撤回或已装货！","提示",resp);
			    				}
			    			}else{
			    				$.confirm({
				    			    title: '提示',
				    			    content: '您确定要撤回零散货物信息吗？',
				    			    buttons: {
				    			        '确定': function () {
				    			      	  
				    			      	//撤回零散货物信息
				    			      	$.ajax({
				    			      		url:basePath+"/scatteredGoods/withdrawDistributeScatteredGoods",
				    			      		data:{dGIds:dGIds},
				    			      		dataType:"json",
				    			              type:"post",
				    			              async:false,
				    			              success:function(resp){
				    			              	if(resp.success){
				    			              		xjValidate.showPopup(resp.msg,"提示",true);
				    			              		SeList(1);
				    			              		pagination.setCurrentPage(1);
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
			    	xjValidate.showPopup("运单已撤回或已装货！","提示",resp);
			    }
			}
		});
	}
	
}

//修改零散货物信息
function updateDistributeScatteredGoodsById(dGIds,dGIdsLength){
	
	//判断选择条数
	if(dGIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(dGIdsLength=1){
		
		//根据ID查询零散货物运单状态是否为已撤回，已拒绝
		$.ajax({
			url:basePath+"/scatteredGoods/findDistributeScatteredGoodsWaybillStatus",
			data:{dGIds:dGIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				console.log("1");
				if(resp==4 || resp==3){
					//子运单状态
					$.ajax({
						url:basePath+"/scatteredGoods/findDistributeScatteredGoodsWaybillStatus",
						data:{dGIds:dGIds},
						dataType:"json",
						type:"post",
						async:false,
						success:function(resp){
							if(resp!=0){
								if(resp==3 || resp==4){
									//加载修改模态框
									var url=basePath+"/scatteredGoods/updateDistributeScatteredGoodsPage";
									$("#update_distributeScatteredGoods_info").load(url,function(){
										  $("#addLineData").lineSelect();
										  $("#endLineData").lineSelect();
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
									  
									    //判断用户角色
									  //点击添加时判断登录用户角色，（个体货主隐藏选择委托方选择框）
										$.ajax({
											url:basePath+"/scatteredGoods/judgeLoginUserRole",
											data:"",
											dataType:"JSON",
											type:"POST",
											async:false,
											success:function(resp){
												if(resp){
													//个体货主角色
													if(resp.userRole==3){
														document.getElementById("checkedEntrustBox").style.display='none';
														$("#Eentrust").val(resp.id);
													}else{
														
													}
												}else{
													xjValidate.showPopup("系统异常,请稍后再试!","提示",true);
													return false;
												}
											}
										});
										$.ajax({
											url:basePath+"/scatteredGoods/findDistributeScatteredGoodsWayById",
											data:{dGIds:dGIds},
											dataType:"json",
											type:"post",
											async:false,
											success:function(resp){
												if(resp){
													initReleaseMode(resp.releaseMode);
													$("#SscatteredGoods").val(resp.scatteredGoods);//零散货物
													$("#distance").val(resp.distance);//运距
													$("#planTransportAmount").val(resp.planTransportAmount);//计划拉运量
													$("#currentTransportPrice").val(resp.currentTransportPrice);//当前运价
													$("#reasonableLossRatio").val(resp.reasonableLossRatio);//合理损耗比例
													$("#reasonableLossTonnage").val(resp.reasonableLossTonnage);//合理损耗吨位
													$("#lossDeductionPrice").val(resp.lossDeductionPrice);//合理损耗价格
													$("#SforwardingUnit").val(resp.forwardingUnit);//发货单位
													$("#Sconsignee").val(resp.consignee);//到货单位
													if(resp.cautionMoney==0){
														$("#cautionMoney").val("");//保证金金额
													}else{
														$("#cautionMoney").val(resp.cautionMoney);//保证金金额
													}
													if(resp.advanceCharge==0){
														$("#advanceCharge").val("");//预付款金额
													}else{
														$("#advanceCharge").val(resp.advanceCharge);//预付款金额
													}
													
													$("#SofferEndDate").val(resp.offerEndDateStr);//报价截止日期
													$("#planTransportDate").val(resp.planTransportDateStartStr);//计划拉运日期
													$("#units").val(resp.unitsCode);//计量单位
													$("#computeMode").val(resp.computeMode);//计算方式
													$("#deductionMode").val(resp.deductionMode);//定损方式
													$("#releaseMode").val(resp.releaseMode);//发布方式
													$("#isInvert").val(resp.isInvert);//是否倒扣
													if(resp.userInfoId!=null){
														$("#CshipperName").val(resp.driverName);//司机名称
														$("#userInfoId").val(resp.userInfoId);//承运方
														$("#role").val(4);
													}else{
														$("#CshipperName").val(resp.shipperName);//承运方名称
														$("#Cshipper").val(resp.shipper);//承运方
														$("#role").val(2);
													}
													//$("#Cshipper").val(resp.shipper);//承运方
													$("#Entrust").val(resp.entrustName);//委托方名称
													$("#Eentrust").val(resp.entrust);//委托方
													$("#addLineData").html(resp.lineInfoName);//线路名称
													$("#LineInfoId").val(resp.lineInfoId);//线路ID
													$("#endLineData").html(resp.endPointsStr);//线路终点名称
													$("#endPoints").val(resp.endPoints);//线路终点ID
													$("#shipperName input").attr("data-id",resp.releaseMode);
													$("#sIds").val(resp.id);
													$("#rootIds").val(resp.rootWaybillInfoId);
												}else{
													xjValidate.showPopup("查询零散货物信息异常!","提示",true);
												}
											}
										});
									});
								}
							}else{
								xjValidate.showPopup("系统异常!","提示",true);
							}
						}
					});
				}else{
					xjValidate.showPopup("运单已派发!","提示",true);
				}
			}
		});
	}
}

//点击修改零散货物按钮
function updateDistributeScatteredGoodsBtn(){
	sign=2;
	addOrUpdateDistributeScatteredGoodsBtn(sign);
}
