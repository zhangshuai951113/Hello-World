//调用全查
$(function(){
	list(1);
	
	//全选/全不选
	$("body").on("click",".all_coupon_check",function(){
		if($(".all_coupon_check").is(":checked")){
			//全选时
			$(".sub_coupon_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_coupon_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	
	//关闭组织弹框
	$("body").on("click",".org-opt-close",function(){
		$("#show-org-data-info").empty();
	});
	
	//关闭有价券结算弹框
	$("body").on("click",".settlement-opt-close",function(){
		$("#show-settlement-data-info").empty();
	});
	
	//允许表格拖着
	$("#tableDrag").colResizable({
	  liveDrag:true, 
	  gripInnerHtml:"<div class='grip'></div>", 
	  draggingClass:"dragging",
	  resizeMode: 'overflow'
	});
	
	//数据较多，增加滑动
	$.mCustomScrollbar.defaults.scrollButtons.enable = true; 
  	$.mCustomScrollbar.defaults.axis = "yx"; 
  	$(".iscroll").css("min-height","55px");
  	$(".iscroll").mCustomScrollbar({
    	theme: "minimal-dark"
  	});
  	console.log($(".loadExcel"))
  	uploadLoadFile($(".loadExcel"));
  	
  //时间调用插件
    setTimeout(function () {
      $(".date-time").datetimepicker({
        format: "YYYY-MM-DD",
        autoclose: true,
        todayBtn: true,
        todayHighlight: true,
        showMeridian: true,
        pickTime: false
      });
    }, 500)
});


/**
 * 绑定上传事件的dom对象
 * @author luojuan 2017年6月5日
 */
function uploadLoadFile() {
	new AjaxUpload($(".loadExcels"),{
   		action:  basePath + "/couponInfo/loadTemplate",
   		name: 'myfile',
		dataType: 'json',
   		onSubmit : function(file , ext){
   		//文件上传格式校验
   			if (!(ext && /^(xls|xlsx)$/.test(ext.toLowerCase()))){
   				xjValidate.showPopup("请上传格式为 xls|xlsx 的文件","提示",true);
   				return;
   			}
   		},
   		//服务器响应成功时的处理函数
   		onComplete :function(file, resultJson){
   			if(resultJson){
   				xjValidate.showPopup("Excel导入成功","提示",true);
   			}else{
   				xjValidate.showPopup("服务器异常，请稍后重试","提示",true);
   				return;
   			}
		}
	});
}

/**
 * 初始化手工录入新增
 * 
 * @author luojuan 2017年6月13日
 */
function initEntryType(){
	//取出手工录入类型
	var entryType = $("#entry_type").val();
	//若是单号录入就隐藏起始卡号、结束卡号和数量
	if(entryType && entryType==1){
		$("#card_code_start_div").hide();
		$("#card_code_end_div").hide();
		$("#card_code_num_div").hide();
	}else{
		$("#card_code_div").hide();
		$("#card_code_start_div").show();
		$("#card_code_end_div").show();
		$("#card_code_num_div").show();
	}
}

/**
 * 下列选择切换手工录入新增
 * 
 * @author luojuan 2017年6月13日
 */
function changeEntryType(){
	//取出手工录入类型
	var entryType = $("#entry_type").val();
	//若是连号录入就隐藏卡号
	if(entryType && entryType==2){
		$("#card_code_div").hide();
		$("#card_code_start_div").show();
		$("#card_code_end_div").show();
		$("#card_code_num_div").show();
	}else{
		//若是单号录入就隐藏起始卡号、结束卡号和数量
		$("#card_code_div").show();
		$("#card_code_start_div").hide();
		$("#card_code_end_div").hide();
		$("#card_code_num_div").hide();
	}
}


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

/**
 * 页面跳转
 */
  function jumpPage(e) {
    var value = $(e).prev().find('input').val();
    pagination.setCurrentPage(value);
  }
  

/**
 * 进入页面查询有价券
 * @author luojuan 2017年6月7日
 * 
 */
function list(number){
	$("#tableList").html("");
	var cardCode=$("#cardCode").val();
	var couponType=$("#couponType").val();
	var supplierCode=$("#supplierCode").val();
	var couponStatus=$("#couponStatus").val();
	var cardType=$("#cardType").val();
	var couponName=$("#couponName").val();
	var amountStart=$("#amountStart").val();
	var amountEnd=$("#amountEnd").val();
	var balanceStart=$("#balanceStart").val();
	var balanceEnd=$("#balanceEnd").val();
	var orgName = $.trim($("#orgName").val());
	var parentOrgName = $.trim($("#parentOrgName").val());
	var createUser = $.trim($("#createUser").val());
	var rCreateStartTime = $("#rCreateStartTime").val();
	var rCreateEndTime = $("#rCreateEndTime").val();
	$.ajax({
		url:"getCouponInfoByOrgInfoRootId",
		data:{cardCode:cardCode,couponType:couponType,
			supplierCode:supplierCode,couponStatus:couponStatus,
			cardType:cardType,couponName:couponName,
			amountStart:amountStart,amountEnd:amountEnd,
			balanceStart:balanceStart,balanceEnd:balanceEnd,
			orgName:orgName,parentOrgName:parentOrgName,
			createUser:createUser,rCreateStartTime:rCreateStartTime,
			rCreateEndTime:rCreateEndTime,
			"page":number-1,"rows":10},
		type:"post",
		async:false,
		dataType:"json",
		success:function(responseText){
			var objs=eval(responseText);
			$.each(objs,function(index,ele){
				var cardTypeName = "";
				if(ele.cardType == 1){
					cardTypeName = "定额卡";
				}
				var couponStatusName = "";
				if(ele.couponStatus == 1){
					couponStatusName = "登记";
				}else if(ele.couponStatus == 2){
					couponStatusName = "审核不通过";
				}else if(ele.couponStatus == 3){
					couponStatusName = "审核通过";
				}else{
					couponStatusName = "未知状态";
				}
				
				var tr = " <tr class='table-body azure'>";
					tr+="		<td><label class='i-checks'><input name='all' type='checkbox' class='sub_coupon_check' data-id=\""+ele.id+"\" ><i></i></label></td>";
					//tr+="		<td>"+ele.id+"</td>";
					if(ele.couponStatus==3){
						tr+="		<td class='operation'>";
						tr+="           <div class='receive-operation operation-m' onclick='couponUseInfoOrCouponRebackInfoPage(\""+ele.id+"\",1)'><div class='receive-icon'></div><div class='text'>领用</div></div>";
						tr+="           <div class='modify-operation operation-m' onclick='updateCouponInfo(\""+ele.id+"\",\""+ele.couponStatus+"\")'><div class='modify-icon'></div><div class='text'>修改</div></div>";
						tr+="           <div class='withdraw-operation operation-m' onclick='couponUseInfoOrCouponRebackInfoPage(\""+ele.id+"\",2)'><div class='withdraw-icon'></div><div class='text'>退还</div></div>";
						tr+="		</td>";
						//tr+="</tr>";
					}else{
						tr+="		<td class='operation'>";
						tr+="           <div class='modify-operation operation-m' onclick='updateCouponInfo(\""+ele.id+"\",\""+ele.couponStatus+"\")'><div class='modify-icon'></div><div class='text'>修改</div></div>";
						tr+="           <div class='delete-operation operation-m' onclick='deleteCouponInfo(\""+ele.id+"\")'><div class='delete-icon'></div><div class='text'>删除</div></div>";
						tr+="		</td>";
						//tr+="</tr>";
					}
					tr+="		<td>"+ele.cardCode+"</td>";
					tr+="		<td>"+ele.orgInfoName+"</td>";
					tr+="		<td>"+toChar(ele.parentOrgName)+"</td>";
					tr+="		<td>"+ele.couponTypeName+"</td>";
					tr+="		<td>"+ele.supplierName+"</td>";
					tr+="		<td>"+toChar(ele.settlementIdStr)+"</td>";
					tr+="		<td>"+toChar(ele.useUser)+"</td>";
					tr+="		<td>"+cardTypeName+"</td>";
					tr+="		<td>"+ele.couponName+"</td>";
//					tr+="		<td>"+ele.cardNum+"</td>";
					tr+="		<td>"+ele.units+"</td>";
					tr+="		<td>"+ele.amount+"</td>";
					tr+="		<td>"+ele.purchase+"</td>";
					tr+="		<td>"+ele.purchaseTimeStr+"</td>";
					tr+="		<td>"+ele.createUserStr+"</td>";
					tr+="		<td>"+ele.createTimeStr+"</td>";
					tr+="		<td onclick='openCouponUseInfo(\""+ele.id+"\")'><a>领用情况</a></td>";
					tr+="		<td onclick='openCouponRebackInfo(\""+ele.id+"\")'><a>退还情况</a></td>";
//					tr+="		<td>变更记录</td>";
					tr+="		<td>结算记录</td>";
					tr+="		<td>"+couponStatusName+"</td>";
					tr+="		<td>"+ele.remarks+"</td>";
					tr+="</tr>";
					
				//将tr追加到
				$("#tableList").append(tr);
			});
		}
	});
	
	//模糊查询
	$("#searchCouponInfo").click(function(){
		list(1);
	});
	
	//获取最大数据记录数
	$.ajax({
		 url:"getCount",
		 type:"post",
		 data:{cardCode:cardCode,couponType:couponType,
			 supplierCode:supplierCode,couponStatus:couponStatus,
			 cardType:cardType,couponName:couponName,
			 amountStart:amountStart,amountEnd:amountEnd,
			 balanceStart:balanceStart,balanceEnd:balanceEnd,
			 orgName:orgName,parentOrgName:parentOrgName,
			 createUser:createUser,rCreateStartTime:rCreateStartTime,
			 rCreateEndTime:rCreateEndTime,
			 "page":number-1,"rows":2},
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
}

/**
 * 领用初始化页面
 * 
 * @author luojuan 2017年6月8日
 *
 */
function openCouponUseInfo(id){
	$("#couponInfoId").val(id);
	$("#coupon_use_form").attr("action", basePath + "/couponInfo/couponUseInfoList");
	$("#coupon_use_form").submit();
}

/**
 * 停用初始化页面
 * 
 * @author luojuan 2017年6月9日
 *
 */
function openCouponRebackInfo(id){
	$("#couponId").val(id);
	$("#coupon_reback_form").attr("action", basePath + "/couponInfo/couponRebackInfoList");
	$("#coupon_reback_form").submit();
	
}

//下载模板
function downExample(){
    var url = basePath + "/couponInfo/downTemplate";
    $('#downExampleTemplate').attr('action', url);
    $('#downExampleTemplate').submit();
}

/**
 * 新增/编辑有价券初始化页
 * 
 * @author luojuan 2017年6月12日
 * @param rootOrgInfoId 主机构ID
 */
function addOrEditCouponInfoPage(id,couponStatus){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(id!=undefined && id!=""){
		operateType = 2;
	}else{
		operateType = 1;
	}
	//请求地址
	var url = basePath + "/couponInfo/initCouponPage  #coupon-data-info";
	$("#show_coupon_info").load(url,{"id":id,"operateType":operateType},function(){
		initEntryType();
		//调用时间插件
		setTimeout(function () {
	      $(".date-time").datetimepicker({
	        format: "YYYY-MM-DD",
	        autoclose: true,
	        todayBtn: true,
	        todayHighlight: true,
	        showMeridian: true,
	        pickTime: false
	      });
	    }, 500)
	})
	
	//关闭弹框
	$("body").on("click",".coupon-opt-close",function(){
		$("#show_coupon_info").empty();
	});
	
}

/**
 * 新增/编辑有价券信息
 * 
 * @author luojuan 2017年6月13日
 */
function saveCouponInfo(){
	
	var entryType = $("#entry_type").val();
	
	if(entryType==1){
		//单号录入则卡号校验
		var cardCode = $("#card_code").val();
		if(cardCode==undefined || cardCode==""){
			xjValidate.showTip("卡号不能为空");
			return;
		}
		
		if(cardCode.length>20){
			xjValidate.showTip("卡号不能超过20个数字");
			return;
		}
		var cardCodeStart =$("#card_code_start").val(0);
		var cardCodeEnd = $("#card_code_end").val(0);
	}else{
		//连号录入则起始卡号、结束卡号、数量校验
		var cardCodeStart =$("#card_code_start").val();
		if(cardCodeStart==undefined || cardCodeStart==""){
			xjValidate.showTip("起始卡号不能为空");
			return;
		}
		
		var cardCodeStartreg = /^\+?[1-9][0-9]*$/;
		if(!cardCodeStartreg.test(cardCodeStart)){
			xjValidate.showTip("起始卡号需为正整数");
			return;
		}
		
		if(cardCodeStart.length>20){
			xjValidate.showTip("起始卡号不能超过20个数字");
			return;
		}
		
		var cardCodeEnd = $("#card_code_end").val();
		if(cardCodeEnd==undefined || cardCodeEnd==""){
			xjValidate.showTip("结束卡号不能为空");
			return;
		}
		
		var cardCodeEndreg = /^\+?[1-9][0-9]*$/;
		if(!cardCodeEndreg.test(cardCodeEnd)){
			xjValidate.showTip("结束卡号需为正整数");
			return;
		}
		
		if(cardCodeEnd.length>20){
			xjValidate.showTip("结束卡号不能超过20个数字");
			return;
		}
		
		if(cardCodeEnd<cardCodeStart){
			xjValidate.showTip("结束卡号不能小于起始卡号");
			return;
		}
		
		var cardCodeNum = $("#card_code_num").val();
		if(cardCodeNum==undefined || cardCodeNum==""){
			xjValidate.showTip("卡号数量不能为空");
			return;
		}
		
		var cardCodeNumreg = /^\+?[1-9][0-9]*$/;
		if(!cardCodeNumreg.test(cardCodeNum)){
			xjValidate.showTip("卡号数量需为正整数");
			return;
		}
		
		if(cardCodeNum>100){
			xjValidate.showTip("卡号数量不能超过100张");
			return;
		}
	}
	
	//有价券名称校验
	var couponName = $.trim($("#coupon_name").val());
	if(couponName.length>200){
		xjValidate.showTip("有价券名称不能超过100个汉字");
		return;
	}
	
	//所属机构校验
	var orgInfoId = $("#org_info_id").val();
	if(orgInfoId==undefined || orgInfoId==""){
		xjValidate.showTip("请选择所属机构");
		return;
	}
	
	//供应商校验
	var supplierCode = $("#supplier_code").val();
	if(supplierCode==undefined || supplierCode==""){
		xjValidate.showTip("请选择供应商");
		return;
	}
	
	//有价券类型校验
	var couponType = $("#coupon_type").val();
	if(couponType==undefined || couponType==""){
		xjValidate.showTip("请选择有价券类型");
		return;
	}
	
	//卡片类型校验
	var cardType = $("#card_type").val();
	if(cardType==undefined || cardType==""){
		xjValidate.showTip("请选择卡片类型");
		return;
	}
	
	//采购人校验
	var purchase = $("#purchase").val();
	if(purchase==undefined || purchase==""){
		xjValidate.showTip("采购人不能为空");
		return;
	}
	
	if(purchase.length>100){
		xjValidate.showTip("采购人不能超过50个汉字");
		return;
	}
	
	//采购时间校验
	var purchaseTime = $("#purchase_time").val();
	if(purchaseTime==undefined || purchaseTime==""){
		xjValidate.showTip("采购时间不能为空");
		return;
	}
	
	//面值(总额)校验
	var amount = $("#amount").val();
	if(amount==undefined || amount==""){
		xjValidate.showTip("面值不能为空");
		return;
	}
	
	//计量单位校验
	var units = $("#units").val();
	if(units==undefined || units==""){
		xjValidate.showTip("请选择计量单位");
		return;
	}
	
	//备注校验
	var remarks= $.trim($("#remarks").text());
	if(remarks!=undefined && remarks!="" && remarks.length>200){
		xjValidate.showTip("备注信息不能超过100个汉字");
		return;
	}
	
	//保存信息
	$.ajax({
		url : basePath + "/couponInfo/addOrUpdateCoupon",
		asyn : false,
		type : "POST",
		data : $('#coupon_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					xjValidate.showPopup("保存成功","提示",true);
					//关闭弹框
					$("#show_coupon_info").empty();
					//刷新页面
					window.location.href = basePath+"/couponInfo/rootCouponInfoInitPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存有价券信息异常，请稍后重试","提示",true);
				return;
			}
		}
	});
}
//TODO
/**
 * 有价券退还
 */
function returnCoupon(){
	var couponIds = findAllCheckCouponIds();
	//判断选择的有价券信息是否已经被使用
	$.ajax({
		url:basePath+"/couponInfo/findCouponMationByIds",
		data:{"ids":couponIds},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					
					var url=basePath+"/couponInfo/returnCouponPage";
					$("#back_coupon_page").load(url,{"ids":couponIds},function(){
						 setTimeout(function () {
						      $(".date-time").datetimepicker({
						        format: "YYYY-MM-DD",
						        autoclose: true,
						        todayBtn: true,
						        todayHighlight: true,
						        showMeridian: true,
						        pickTime: false
						      });
						    }, 500)
					});
				}else{
					if(resp.type==1){
						$.alert(resp.msg);
					}else if(resp.type==2){
						
						$.confirm({
							title: "提示",
							content: "您选择的有价券有已经被使用过的，是否继续退还？",
							buttons: {
						    	'确认': function () {
						    		
						    		var url=basePath+"/couponInfo/returnCouponPage";
									$("#back_coupon_page").load(url,{"ids":couponIds},function(){
										 setTimeout(function () {
										      $(".date-time").datetimepicker({
										        format: "YYYY-MM-DD",
										        autoclose: true,
										        todayBtn: true,
										        todayHighlight: true,
										        showMeridian: true,
										        pickTime: false
										      });
										    }, 500)
									});
						    	},
						        '取消': function () {
						        	
						        }
						    }
						});
						
					}
				}
			}else{
				$.alert("系统异常,请稍后再试!");
			}
		}
	});
	
}

function closeBackCoupon(){
	$("#back_coupon_page").html("");
}

/**
 * 有价券退卡
 */
function backCoupon(){

	$.ajax({
		url:basePath+"/couponInfo/returnCouponMation",
		data:{
			"couponIds":$("#couponIds").val(),
			"orgInfoId":$("#orgInfoId").val(),
			"parentOrgInfoId":$("#parentOrgInfoId").val(),
			"backUser":$("#backUser").val(),
			"backTime":$("#backTime").val()
			},
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					$("#back_coupon_page").html("");
					$.alert(resp.msg);
					list(1);
				}else{
					$.alert(resp.msg);
					$("#back_coupon_page").html("");
					list(1);
				}
			}else{
				$.alert("系统异常!");
			}
		}
	});
	
}

/**
 * 有价券审核
 * 
 * @author luojuan 2017年6月14日
 */
function operationCoupon(){
	var couponIds = findAllCheckCouponIds();
	
	//是否选择了审核记录
	if(couponIds==undefined||couponIds==""){
		xjValidate.showPopup("请选择需要审核的记录","提示",true);
		return;
	}
	$.confirm({
		title : '有价券信息审核:',
		content : '',
		buttons : {
			formSubmit : {
				text : '审核通过',
				btnClass : 'btn-blue',
				action : function() {
					//有价券信息审核
					$.ajax({
						url : basePath + "/couponInfo/auditCoupon",
						asyn : false,
						type : "POST",
						data : {"couponStatus":3, "couponIds":couponIds},
						dataType : "json" ,
						success : function(dataStr) {
							if(dataStr){
								if(dataStr.success){
									//关闭弹框
									$('#disableModal').modal('hide');
									//刷新页面
									window.location.href = basePath+"/couponInfo/rootCouponInfoInitPage";
								}else{
									xjValidate.showPopup(dataStr.msg,"提示",true);
									return;
								}
							}else{
								xjValidate.showPopup("有价券服务异常忙，请稍后重试","提示",true);
								return;
							}
						}
					});
				}
			},
			formSubmit1 : {
				text : '审核不通过',
				btnClass : 'btn-red',
				action : function() {
					//有价券信息审核
					$.ajax({
						url : basePath + "/couponInfo/auditCoupon",
						asyn : false,
						type : "POST",
						data : {"couponStatus":2, "couponIds":couponIds},
						dataType : "json" ,
						success : function(dataStr) {
							if(dataStr){
								if(dataStr.success){
									//关闭弹框
									$('#disableModal').modal('hide');
									//刷新页面
									window.location.href = basePath+"/couponInfo/rootCouponInfoInitPage";
								}else{
									xjValidate.showPopup(dataStr.msg,"提示",true);
									return;
								}
							}else{
								xjValidate.showPopup("有价券服务异常忙，请稍后重试","提示",true);
								return;
							}
						}
					});
				}
			},
			'取消' : function() {
				// close
			}
		},
	})

}
/**
 * 获取选中的有价券ID
 * 
 * @author luojuan 2017年6月14日
 */
function findAllCheckCouponIds(){
	//所有选中有价券ID
	var couponIds = new Array();
	$(".sub_coupon_check").each(function(){
		if($(this).is(":checked")){
			couponIds.push($(this).attr("data-id"))
		}
	});
	return couponIds.join(",");
}

/**
 * 删除勾选的有价券信息
 * 
 * @author luojuan 2017年6月19日
 */
function deleteCheckedCouponInfo(){
	//获取勾选的有价券信息
	var couponIds = findAllCheckCouponIds();
	if (couponIds == null) {
		xjValidate.showPopup("所选有价券信息不能为空！","提示",true);
		return;
	}	
	deleteCouponInfo(couponIds);
}

/**
 * 删除有价券信息
 * 
 * @author luojuan 2017年6月15日
 */
function deleteCouponInfo(couponIds){
	//校验有价券信息ID不能为空
	if (couponIds == null) {
		xjValidate.showPopup("所选有价券信息不能为空！","提示",true);
		return;
	}	
	
	$.confirm({
		title: "提示",
		content: "是否要删除该数据？",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/couponInfo/deleteCouponInfo",
	    			asyn : false,
	    			type : "POST",
	    			data : {"couponIds":couponIds},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						xjValidate.showPopup("删除成功","提示",true);
	    						//刷新页面
	    						window.location.href = basePath+"/couponInfo/rootCouponInfoInitPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup("删除有价券信息异常，请稍后重试","提示",true);
	    					return;
	    				}
	    			}
	    		});
	    	},
	        '取消': function () {
	        	
	        }
	    }
	});
}

/**
 *修改有价券信息
 *
 *@author luojuan 2017年6月15日
 */
function updateCouponInfo(id,couponStatus){
	addOrEditCouponInfoPage(id,couponStatus);
}

/**
 * 有价券审核通过则卡号、所属机构、总额不允许修改
 * 
 * @author luojuan 2017年6月15日
 */
function couponStatusDisabled(couponStatus){
	var couponStatus = couponStatus;
	if(couponStatus==3){
		 $("#card_code").attr("disabled",true);
		 $("#org_info_id").attr("disabled",true);
		 $("#amount").attr("disabled",true);
	}
}

/**
 * 领用或退还有价券初始化界面
 * @param id
 * @param number
 * @returns
 */
function couponUseInfoOrCouponRebackInfoPage(id,number){

	//定义封装操作类型 1:领用 2:退还
	var operateType = number;
	//请求地址
	var url = basePath + "/couponInfo/initCouponUsePage  #coupon-use-data-info";
	$("#show_coupon_use_info").load(url,{"id":id,"operateType":operateType},function(){
		initUseOrRebackPage(operateType);
		// 时间调用插件（精确到时分秒）
		setTimeout(function() {
			$(".date-time-ss").datetimepicker({
				format : "YYYY-MM-DD HH:mm:ss",
				autoclose : true,
				todayBtn : true,
				todayHighlight : true,
				showMeridian : true,
				useSeconds : true
			});
		}, 500);
	});
	
	//关闭弹框
	$("body").on("click",".coupon-opt-close",function(){
		$("#show_coupon_use_info").empty();
	});
}

/**
 * 领用或退还有价券新增初始化界面
 * 
 * @author luojuan 2017年6月15日
 */
function initUseOrRebackPage(operateType){
	if(operateType==2){
		$("#use_money_div").hide();
		$("#use_remarks_div").hide();
		$("#reback_money_div").show();
		$("#reback_remarks_div").show();
		$("#card_code_div").hide();
		$("#card_code_reback_div").show();
	}else{
		$("#reback_money_div").hide();
		$("#reback_remarks_div").hide();
		$("#use_money_div").show();
		$("#use_remarks_div").show();
		$("#card_code_div").show();
		$("#card_code_reback_div").hide();
	}
}

/**
 * 领用有价券保存页面
 * 
 * @author luojuan 2017年6月15日
 */
function saveCouponUseInfo(){
	var operateType = $("#operateType").val();
	if(operateType==1){
		//领用金额不能为空 
		var money = $.trim($("#use_money").val());
		if(money==undefined || money==""){
			xjValidate.showTip("领用金额不能为空");
			return;
		}
	}else{
		//退还金额
		var money = $.trim($("#reback_money").val());
		if(money==undefined || money==""){
			xjValidate.showTip("退还金额不能为空");
			return;
		}
	}
	//console.log($('#coupon_use_form').serialize());
	//保存信息
	$.ajax({
		url : basePath + "/couponInfo/addOrUpdateCouponUse",
		asyn : false,
		type : "POST",
		data : $('#coupon_use_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					xjValidate.showPopup("保存成功","提示",true);
					//关闭弹框
					$("#show_coupon_info").empty();
					//刷新页面
					window.location.href = basePath+"/couponInfo/rootCouponInfoInitPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存有价券领用信息异常，请稍后重试","提示",true);
				return;
			}
		}
	});
}

/**
 * 导入Excel
 * 
 * @author luojuan 2017年6月29日
 */
function loadExample(){
	uploadLoadFile($("#loadExcel")[0]);
}

/**
 * 自动计算卡号数量
 * 
 * @author luojuan 2017年7月18日
 */
function cardNumFun(){
	
	//验证结束卡号-开始卡号
	var cardCodeStart =$("#card_code_start").val();
	var cardCodeEnd = $("#card_code_end").val();
	
	$.ajax({
		url:basePath+"/couponInfo/calculationNumber",
		data:{
			"cardCodeStart":cardCodeStart,
			"cardCodeEnd":cardCodeEnd
		},
	dataType:"JSON",
	type:"POST",
	async:false,
	success:function(resp){
		$("#card_code_num").val(resp+1);
	}
	});
	
}


//合计金额
function totalAmountgtgt(){
	var entryType=$.trim($("#entry_type").val());
	var amount=$.trim($("#amount").val());
	var cardCodeNum=$.trim($("#card_code_num").val());
	//单张录入(面值)
	if(entryType==1){
		$("#totalAmount").val(parseInt(amount));
	}else 
		//连号录入(面值*数量)
		if(entryType==2){
		$("#totalAmount").val(parseInt(amount)*parseInt(cardCodeNum));
	}else{
		$.alert("系统异常!");
	}
}

/**
 * 组织信息初始页
 * @param userInfoId 用户ID
 * @author jiangweiwei 2017年10月9日
 */
function showOrgInfoPage(number){
	var orgInfoId = $("#orgInfoId").val();
	var orgInfoName = $("#orgInfoName").val();
	//请求地址
	var url = basePath + "/user/showOrgInfoPage #org-data-info";
	$("#show-org-data-info").load(url,{
		"page" : number,
		"rows" : 10,
		"orgInfoId" : orgInfoId,
		"orgInfoName" : orgInfoName
		},function(){
			$("#orgInfoName").val(orgInfoName);
			//允许表格拖着
			$("#tableDrag").colResizable({
				  liveDrag:true, 
				  partialRefresh:true,
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  resizeMode: 'overflow'
			});
		})
}

/**
 * 选择组织信息
 * @author jiangweiwei 2017年10月9日
 */
function submitSelectOrgInfo(){
		var selectlist = findAllCheck(".sub_org_info_check");
		/*if(selectlist.length==0 || selectlist.length>1) {
	   $.alert("请选择一条数据");
	   //return;
	}*/
//		$("#enterprise_user_org_info_id").val($(this).attr("data-id"));
//		$("#orgName").val($(this).attr("data-name"));
//		$("#orgParentId").val($(this).attr("data-parent-id"));
//		$("#orgParentName").val($(this).attr("data-parent-name"));
		$("#org_info_id").val(selectlist[0].enterpriseUserOrgInfoId);
		$("#orgName").val(selectlist[0].orgName);
		$("#orgParentId").val(selectlist[0].orgParentId);
		$("#orgParentName").val(selectlist[0].orgParentName);
		$("#org-data-info").empty();

}

/**
 * 查找选择
 */
function findAllCheck(element) {
	var checkList = new Array();
	$(element).each(function() {
		if ($(this).is(":checked")) {
			var params = {
				"enterpriseUserOrgInfoId" : $(this).attr("data-id"),
				"orgName" : $(this).attr("data-name"),
				"orgParentId" : $(this).attr("data-parent-id"),
				"orgParentName" : $(this).attr("data-parent-name")
			}
			checkList.push(params);
		}
	});
	return checkList;
}

/**
* 分页查询
* @author jiangww 2017年10月9日
* @param number 页数
*/
function pagerGoto(number) {
	showOrgInfoPage(number);
}

/**
 * 跳转到某页
 * @author jiangww 2017年10月9日
 */
function btnPagerGoto() {
	//取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	//取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	//数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		commonUtil.showPopup("提示","请输出正确的数字");
		return;
	}
	
	//跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	showOrgInfoPage(goPage);
}

function toChar(data) {
	if (data == null) {
		data = "";
	}
	return data;
}

/**
 * 批量领用有价券初始化界面
 * @param id
 * @param number
 * @returns
 */
function batchCouponUseInfoPage(){

	//请求地址
	var url = basePath + "/couponInfo/batchCouponUseInfoPage  #batch-coupon-use-data-info";
	$("#show_batch_coupon_use_info").load(url,{},function(){
		// 时间调用插件（精确到时分秒）
		setTimeout(function() {
			$(".date-time-ss").datetimepicker({
				format : "YYYY-MM-DD HH:mm:ss",
				autoclose : true,
				todayBtn : true,
				todayHighlight : true,
				showMeridian : true,
				useSeconds : true
			});
		}, 500);
	})
	
	//关闭弹框
	$("body").on("click",".coupon-opt-close",function(){
		$("#show_batch_coupon_use_info").empty();
	});
}

/**
 * 根据开始卡号和结束卡号获取有价券领用总额和卡数
 * @author jiangweiwei 2017年10月14日
 */
function searchCouponCard(){
	var cardCodeStart = $("#cardCodeStart").val();
	var cardCodeEnd = $("#cardCodeEnd").val();
	$.ajax({
		type : "POST",
		url	: basePath+"/couponInfo/searchCouponCard",
		data : {"cardCodeStart":cardCodeStart,"cardCodeEnd":cardCodeEnd},
		success	: function(data){
			if(data){
				$("#quantity").val(data.cardNum);
				$("#useMoney").val(data.useMoney);
			}
		}
	});
}

/**
 * 批量领用有价券保存页面
 * @author jiangweiwei 2017年10月16日
 */
function batchCouponUseInfo(){
	//校验开始卡号是否为空
	var cardCodeStart = $.trim($("#cardCodeStart").val());
	if(cardCodeStart==undefined || cardCodeStart==""){
		 xjValidate.showTip("开始卡号不能为空!");
		return false;
	}
	//校验结束卡号是否为空
	var cardCodeEnd = $.trim($("#cardCodeEnd").val());
	if(cardCodeEnd==undefined || cardCodeEnd==""){
		 xjValidate.showTip("结束卡号不能为空!");
		return false;
	}
	//校验张数是否为空
	var quantity = $("#quantity").val();
	if(quantity==undefined || quantity==""){
		 xjValidate.showTip("张数不能为空!");
		return false;
	}
	//校验组织机构ID是否为空
	var orgInfoId = $("#org_info_id").val();
	if(orgInfoId==undefined || orgInfoId==""){
		 xjValidate.showTip("组织机构不能为空!");
		return false;
	}
	//校验上级组织机构ID是否为空
	var orgParentId = $("#orgParentId").val();
	if(orgParentId==undefined || orgParentId==""){
		 xjValidate.showTip("上级组织机构不能为空!");
		return false;
	}
	//校验领用人是否为空
	var useUser = $.trim($("#useUser").val());
	if(useUser==undefined || useUser==""){
		 xjValidate.showTip("领用人不能为空!");
		return false;
	}
	//校验领用时间是否为空
	var useTime = $("#useTime").val();
	if(useTime==undefined || useTime==""){
		xjValidate.showTip("领用时间不能为空!");
		return false;
	}
	//保存信息
	$.ajax({
		url : basePath + "/couponInfo/batchCouponUseInfo",
		asyn : false,
		type : "POST",
		data : {"cardCodeStart":cardCodeStart,"cardCodeEnd":cardCodeEnd},
		dataType : "json" ,
		success : function(dataStr) {
			var success = dataStr.success;
			var msg = dataStr.msg;
			if(success){
				$.confirm({
					title : "提示",
					content : msg,
					buttons : {
						'是' : function() {
							batchAddCouponUseInfo(cardCodeStart,cardCodeEnd,orgInfoId,orgParentId,useUser,useTime);
						},
						'否' : function() {
							
						}
					}
				});
			}else{
				commonUtil.showPopup("提示",msg);
				return;
			}
		}
	});
}

function batchAddCouponUseInfo(cardCodeStart,cardCodeEnd,orgInfoId,orgParentId,useUser,useTime){
	$.ajax({
		url : basePath + "/couponInfo/batchAddCouponUseInfo",
		asyn : false,
		type : "POST",
		data : {"cardCodeStart":cardCodeStart,"cardCodeEnd":cardCodeEnd,"orgInfoId":orgInfoId,"orgParentId":orgParentId,"useUser":useUser,"useTime":useTime},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				var success = dataStr.success;
				var msg = dataStr.msg;
				if(success){
					//关闭批量领用页面
					$("#show_batch_coupon_use_info").empty();
					//刷新页面
					window.location.href = basePath+"/couponInfo/rootCouponInfoInitPage";
					
				}else{
					commonUtil.showPopup("提示",msg);
					return;
				}
			}else{
				commonUtil.showPopup("提示","领用有价券服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

/**
 * 有价券结算单查询初始页
 * @author jiangweiwei 2017年10月23日
 * @returns
 */
function initCouponSettlementInfoPage(){
	var coupons = findCouponCheck(".sub_coupon_check");
	if(coupons.length == 0 || coupons.length > 1 ){
		 xjValidate.showPopup("请选择一条记录!","提示");
		 return;
	}
	var couponInfoId = coupons[0].id;
	//请求地址
	var url = basePath + "/couponInfo/initCouponSettlementInfoPage  #settlement-data-info";
	$("#show-settlement-data-info").load(url,{"couponInfoId":couponInfoId},function(){
		searchCouponSettlementInfoPage(1);
	})
}

/**
 * 根据结算单号和分页查询结算信息
 * @author jiangweiwei 2017年10月23日
 * @param number 页数
 */
function searchCouponSettlementInfoPage(number){
	//结算单号
	var settlementId = $.trim($("#settlementId").val());
	//有价券编号
	var couponInfoId = $("#couponInfoId").val();
	// 请求地址
	var url = basePath
			+ "/couponInfo/listCouponSettlementInfo #settlement-info-data";
	$("#search_settlement_info").load(url, {
		"page" : number,
		"rows" : 10,
		"settlementId" : settlementId,
		"couponInfoId" : couponInfoId
	}, function() {
		//允许表格拖着
			$("#tableDrag").colResizable({
				  liveDrag:true, 
				  partialRefresh:true,
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  resizeMode: 'overflow'
			});
		    //结算数据较多，增加滑动
		    $(".iscroll").css("min-height", "55px");
		    $(".iscroll").mCustomScrollbar({
		      theme: "minimal-dark"
		    });
	})
}

/**
 * 查找选择
 * @author jiangweiwei 2017年10月23日
 */
function findCouponCheck(element){
  var checkList = new Array();
  $(element).each(function(){
    if($(this).is(":checked")){
      var params = {
        "id":$(this).attr("data-id")
      }
      checkList.push(params);
    }
  });
  return checkList;
}


