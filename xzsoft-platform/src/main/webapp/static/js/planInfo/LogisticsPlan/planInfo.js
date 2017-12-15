var sign="";
$(function(){
	list(1);
	
	//全选/全不选
	$("body").on("click",".all_user_check",function(){
		if($(".all_user_check").is(":checked")){
			//全选时
			$(".sub_user_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_user_check").each(function(){
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
    
    //允许表格拖着
    $("#tableDrag").colResizable({
      liveDrag: true,
      gripInnerHtml: "<div class='grip'></div>",
      draggingClass: "dragging"
    });

    //数据较多，增加滑动
    $(".iscroll").css("min-height", "55px");
    $(".iscroll").mCustomScrollbar({
      theme: "minimal-dark"
    });
});

//调用时间
function Time(time){
	var da = new Date(time);
    var year = da.getFullYear();
    var month = da.getMonth()+1;
    var date = da.getDate();
    var hour=da.getHours();
    var minute = da.getMinutes();
    if(hour==0 && minute==0){
    var Datetime=year+"-"+month+"-"+date;
    return Datetime;
    }
    var Datetime=year+"-"+month+"-"+date+" "+hour+":"+minute;
    return Datetime;
}

//页面全查
function list(number){
	
	var planName=$.trim($("#planName").val());
	var goodsInfoId=$.trim($("#goodsInfoId").val());
	var entrust=$.trim($("#entrust").val());
	var shipper=$.trim($("#shipper").val());
	var forwardingUnit=$.trim($("#forwardingUnit").val());
	var consignee=$.trim($("#consignee").val());
	var planStatus=$.trim($("#planStatus").val());
	var lineInfoId=$.trim($("#lineInfoId").val());
	var cooperateStatus=$.trim($("#cooperateStatus").val());
	var startDate=$.trim($("#startDate").val());
	var endDate=$.trim($("#endDate").val());
    var data={
    		planName:planName,
    		goodsInfoId:goodsInfoId,
    		lineInfoId:lineInfoId,
    		entrust:entrust,
    		shipper:shipper,
    		forwardingUnit:forwardingUnit,
    		consignee:consignee,
    		planStatus:planStatus,
    		startDate:startDate,
    		endDate:endDate,
    		cooperateStatus:cooperateStatus,
    		"page":number-1,
    		"rows":10
    }
	//禁止多次追加
	$("#planInfoTtableList").html("");
	$.ajax({
		url:basePath+"/planInfo/findPlanInfoAll",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){

			var objs=eval(resp);
			$.each(objs,function(index,ele){
				
				if(ele.userRole==1){
					$(".operation-button").show();
				}
				
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
				
				//协同状态
				var cooperateStatus="上下游协同";
				if(ele.cooperateStatus==2){
					cooperateStatus="下游不协同";
				}else if(ele.cooperateStatus==3){
					cooperateStatus="上游不协同";
				}
				
				if(ele.entrustName==undefined){
					ele.entrustName="";
				}
				
				if(ele.lineName==undefined){
					ele.lineName="";
				}
			var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_user_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td>"+ele.planName+"</td>";
				tr+="		<td>"+ele.lineName+"</td>";
				tr+="		<td>"+ele.goodsName+"</td>";
				tr+="		<td>"+ele.forwardingUnit+"</td>";
				tr+="		<td>"+ele.consignee+"</td>";
				tr+="		<td>"+ele.distance+"</td>";
				tr+="		<td>"+ele.planSum+"</td>";
				tr+="		<td>"+ele.splitSum+"</td>";
				tr+="		<td>"+ele.remainingSum+"</td>";
				tr+="		<td>"+ele.entrustName+"</td>";
				tr+="		<td>"+ele.shipperName+"</td>";
				tr+="		<td>"+Time(ele.startDate)+"</td>";
				tr+="		<td>"+Time(ele.endDate)+"</td>";
				tr+="		<td>"+ele.userName+"</td>";
				tr+="		<td>"+Time(ele.createTime)+"</td>";
				tr+="		<td>"+cooperateStatus+"</td>";
				tr+="		<td><div class='view-operation operation-m'  onclick='findAllLogMation("+ele.id+")'><div class='view-icon'></div><div class='text'>查看</div></div></td>";
				tr+="		<td><div class='view-operation operation-m'  onclick='findAllWayibbyMation("+ele.id+")'><div class='view-icon'></div><div class='text'>查看</div></div></td>";
				tr+="		<td style='color:red'>"+planStatus+"</td>";
				tr+="</tr>";
				
				//将tr追加
				$("#planInfoTtableList").append(tr);
				
			});
		}
	});
	//获取最大数据记录数
	$.ajax({
		 url:basePath+"/planInfo/getPlanInfoCount",
		 type:"post",
		 data:data,
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 parent.getTotalRecordsPlanInfo=resp;
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
}


//分页
var pagination = $(".plan_info_all_mation").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
	      list(current);
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
 * 绑定上传事件的dom对象
 * @author chengzhihuan 2017年5月18日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn,{
   		action: basePath + '/upload/imageUpload',
   		name: 'myfile',
		dataType: 'json',
   		onSubmit : function(file , ext){
   			// 文件上传格式校验
			if (!(ext && /^(jpg|png|bmp|docx|doc|pdf|xls|xlsx)$/.test(ext.toLowerCase()))) {
				xjValidate.showPopup( "请上传格式为 jpg|png|bmp|docx|doc|pdf|xls|xlsx 的文件","提示",true);
				return;
			}
   		},
   		//服务器响应成功时的处理函数
   		onComplete :function(file, resultJson){
   			if(resultJson){
   				resultJson = $.parseJSON(resultJson);
   				//是否成功
   				var isSuccess = resultJson.isSuccess;
   				//上传图片URL
   				var uploadUrl = resultJson.uploadUrl;
   				if(isSuccess=="true"){
   					//图片类型
   					var imgType = btn.attr("img-type");
   					var imgText = btn.attr("img-text");
					btn.attr("src",fastdfsServer+"/"+uploadUrl);
					$("#"+imgType).val(uploadUrl);
					$("#"+imgText).text(file);
   				}else{
   					$.alert(resultJson.errorMsg);
   	   				return;
   				}
   			}else{
   				$.alert("服务器异常，请稍后重试");
   				return;
   			}
		}
	});
}

//重置按钮
$("#Reset").click(function(){
	$("#planName").val("");
	$("#goodsInfoId").val("");
	$("#entrust").val("");
	$("#shipper").val("");
	$("#forwardingUnit").val("");
	$("#consignee").val("");
	$("#planStatus").val("");
	$("#lineInfoId").val("");
	$("#startDate").val("");
	$("#endDate").val("");
	$("#cooperateStatus").val("");
	list(1);
});

//添加计划信息
function addPlanInfoPage(){
	
	//加载模态框
	var url=basePath+"/planInfo/addPlanInfoModel";
	$("#add_plan_info").load(url,function(){
		//上传图片初始化
		$('.upload_img').each(function(){
			uploadLoadFile($(this));
		}),
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
}

//关闭模态框
function closeButton(){
	$("#add_plan_info").html("");
	$("#update_plan_info").html("");
}

//进入选择合同信息模态框
function addCMationModel(){
	var url=basePath+"/planInfo/goContractInfoPage";
	$("#find_contract_info_model").load(url);
}

//关闭合同信息模态框
function closeCButton(){
	$("#find_contract_info_model").html("");
}

//获取添加状态
function addPlanInfoBtn(){
	sign=1;
	addOrUpdatePlanInfoMationBtn(sign);
}

//添加/修改计划信息
function addOrUpdatePlanInfoMationBtn(sign){
	
	//验证
	//计划名称
	var planName=$.trim($("#PplanName").val());
	if(planName==undefined || planName==""){
		xjValidate.showTip("计划名称不能为空!");
		return false;
	}
	
	if(planName.length>200){
		xjValidate.showTip("计划名称的长度不能超过100个字符!");
		return false;
	}
	
	//计划总量
	var planSum=$.trim($("#planSum").val());
	if(planSum==undefined || planSum==""){
		xjValidate.showTip("计划总量不能为空!");
		return false;
	}
	
	var regax=/^\d+(\.\d+)?$/;
	if(!regax.test(planSum)){
		xjValidate.showTip("计划总量的正确格式应为0.00!");
		return false;
	}

	//整型数字加.00
	var regax1=/^[0-9]*/;
	if(regax1.test(planSum)){
		var planSum1=planSum+=".00";
		 planSum=planSum1;
	}
	
	//起始日期
	var startDate=$.trim($("#PstartDate").val());
	if(startDate==undefined ||startDate==""){
		xjValidate.showTip("起始日期不能为空!");
		return false;
	}
	
	str = startDate.replace(/-/g,'/'); 
	var date = new Date(str);
	var startTime = date.getTime();

	//结束日期
	var endDate=$.trim($("#PendDate").val());
	if(endDate==undefined ||endDate==""){
		xjValidate.showTip("结束日期不能为空!");
		return false;
	}
	
	str = endDate.replace(/-/g,'/'); 
	var date = new Date(str);
	var endTime = date.getTime();

	if(startTime>=endTime){
		xjValidate.showTip("请输入正确的结束时间!");
		return false;
	}
	
	//合同信息
	var PcontractName=$.trim($("#PcontractName").val());
	if(PcontractName==undefined || PcontractName==""){
		xjValidate.showTip("合同信息不能为空!");
		return false;
	}
	
	//附件
	/*var planImg=$.trim($("#plan_img").val());
	if(planImg==undefined || planImg==""){
		xjValidate.showTip("附件不能为空!");
		return false;
	}*/
	
	//备注
	var remarks=$.trim($("#Premarks").val());
	if(remarks.length>200){
		xjValidate.showTip("备注的长度不能超过100个字符!");
		return false;
	}
	
	var data=$("#sub_plan_info_form").serialize();
	data+="&sign="+sign+"";

	//验证通过
	$.ajax({
		url:basePath+"/planInfo/addOrUpdatePlanInfoMation",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					$("#add_plan_info").html("");
					$("#update_plan_info").html("");
					xjValidate.showPopup(resp.msg,"提示",true);
					list(1);
				}else{
					xjValidate.showPopup(resp.msg,"提示",true);
				}
			}else{
				xjValidate.showPopup("添加异常!","提示",true);
			}
		}
	});
}


//获取全选/单选ID (计划ID，逗号分隔)
function ChoicePlanInfoMation(number,id){

	var planInfoIds = new Array();
	$(".sub_user_check").each(function(){
		if($(this).is(":checked")){
			planInfoIds.push($(this).attr("data-id"))
		}
	});
	
	var planInfoIdLength=planInfoIds.length;
	
	    //删除按钮
	if(number==2){
		deletePlanInfoMationById(planInfoIds.join(","),planInfoIdLength);
	}else 
		//修改按钮
		if(number==1){
		updatePlanInfoMationById(planInfoIds.join(","),planInfoIdLength);
	}else
		//提交按钮
		if(number==3){
		submitPlanInfoMationById(planInfoIds.join(","),planInfoIdLength);
	}else 
		//审核按钮
		if(number==4){
		auditPlanInfoMationById(planInfoIds.join(","),planInfoIdLength);
	}else 
		//派发按钮
		if(number==5){
			distributePlanInfoById(planInfoIds.join(","),planInfoIdLength);
		}else
		//撤回按钮
		if(number==6){
			withdrawPlanInfoMationById(planInfoIds.join(","),planInfoIdLength);
		}else 
		//计划跟踪	
		if(number==7){
			planTrackingById(planInfoIds.join(","),planInfoIdLength,id);
		}
	
	
}

//删除计划
function deletePlanInfoMationById(planInfoIds,planInfoIdLength){
	
	//判断选择条数
	if(planInfoIdLength<1){
		xjValidate.showPopup("请选择一条记录!","提示",true);
	}else if(planInfoIdLength>1){
		xjValidate.showPopup("请选择一条记录!","提示",true);
	}else if(planInfoIdLength=1){
		$.confirm({
		      title: '提示',
		      content: '您确定要删除吗？',
		      buttons: {
		          '确定': function () {
		        	  
		        	  //删除计划
		        	$.ajax({
		        		url:basePath+"/planInfo/delPlanInfoMation",
		        		data:{planInfoIds:planInfoIds},
		        		dataType:"json",
                        type:"post",
                        async:false,
                        success:function(resp){
                        	if(resp.success){
                        		xjValidate.showPopup(resp.msg,"提示",true);
                        		list(1);
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


//修改
function updatePlanInfoMationById(planInfoIds,planInfoIdLength){
	
	//判断选择数据长度
	if(planInfoIdLength>1){
		xjValidate.showPopup("请选择一条记录!","提示",true);
	}else if(planInfoIdLength<1){
		xjValidate.showPopup("请选择一条记录!","提示",true);
	}else if(planInfoIdLength=1){
		
		//根据ID判断计划状态
		$.ajax({
			url:basePath+"/planInfo/findPlanInfoStatus",
			data:{planInfoIds:planInfoIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				if(resp.planStatus==1 || resp.planStatus==4 || resp.planStatus==6){
					
					//加载模态框
					var url=basePath+"/planInfo/updatePlanInfoModel";
					$("#update_plan_info").load(url,function(){
						//上传图片初始化
						$('.upload_img').each(function(){
							uploadLoadFile($(this));
						}),
						//回显数据信息
						$.ajax({
							url:basePath+"/planInfo/echoPlanInfoMation",
							data:{planInfoIds:planInfoIds},
							dataType:"json",
							type:"post",
							async:false,
							success:function(resp){
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
							    $("#Pid").val(resp.id);
								$("#PplanName").val(resp.planName);
								$("#planSum").val(resp.planSum);
								$("#PstartDate").val(resp.sdate);
								$("#PendDate").val(resp.edate);
								$("#PcontractName").val(resp.contractName);
								$("#PcontractDetailInfoId").val(resp.contractDetailInfoId);
								$("#plan_img").val(resp.planImg);
								if(resp.planImg){
									$("#planImg").attr("src",fastdfsServer+'/'+resp.planImg);
								}
								$("#Premarks").val(resp.remarks);
							}
						});
					})
					
					
				}else {
					xjValidate.showPopup("计划已提交审核,无法修改!","提示",true);
				}
			}
		});
	}
}

//获取修改状态
function UpdatePlanInfoBtn(){
	sign=2;
	addOrUpdatePlanInfoMationBtn(sign);
}


/**
 * 计划跟踪查看
 */
/*
function planTrackingById(planInfoIds,planInfoIdLength,id){

	var planId='';
	if(planInfoIds!=undefined && planInfoIds!=''){
		planId=planInfoIds;
	}else{
		planId=id;
	}

	$("#plan_info_id").val(planId);
	$("#plan_look_form").attr("action",
			basePath + "/planInfo/planTrackingPage");
	$("#plan_look_form").submit();
	
}*/

//提交计划
function submitPlanInfoMationById(planInfoIds,planInfoIdLength){

	//判断选择数据长度
	if(planInfoIdLength>1){
		xjValidate.showPopup("请选择一条记录!","提示",true);
	}else if(planInfoIdLength<1){
		xjValidate.showTip("请选择一条记录!","提示",true);
	}else if(planInfoIdLength=1){
		
		//根据ID查询计划状态
		$.ajax({
			url:basePath+"/planInfo/findPlanInfoStatus",
			data:{planInfoIds:planInfoIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				if(resp.planStatus==1 || resp.planStatus==4 || resp.planStatus==6){
					
					$.confirm({
					      title: '提示',
					      content: '您确定要提交审核吗？',
					      buttons: {
					          '确定': function () {
					        	  
					        	  
					        	  //提交审核
					        	  $.ajax({
					        		  url:basePath+"/planInfo/submitAduitPlanById",
					        		  data:{planInfoIds:planInfoIds},
					        		  dataType:"json",
					        		  type:"post",
					        		  async:false,
					        		  success:function(resp){
					        			  if(resp){
					        				  if(resp.success){
					        					  xjValidate.showPopup(resp.msg,"提示",true);
					        					  list(1);
					        				  }else{
					        					  xjValidate.showPopup(resp.msg,"提示",true);
					        				  }
					        			  }else{
					        				      xjValidate.showPopup("计划提交异常!","提示",true);
					        			  }
					        		  }
					        	  });
					          },
					          '取消': function () {
					          }
					      }
					  });
					
				}else {
					xjValidate.showPopup("计划已提交审核!","提示",true);
				}
			}
		});
		
	}
}

//审核计划
function auditPlanInfoMationById(planInfoIds,planInfoIdLength){
	
	//判断选择数据长度
	if(planInfoIdLength>1){
		xjValidate.showPopup("请选择一条记录!","提示",true);
	}else if(planInfoIdLength<1){
		xjValidate.showTip("请选择一条记录!","提示",true);
	}else if(planInfoIdLength=1){
		
		//根据ID查询计划状态
		$.ajax({
			url:basePath+"/planInfo/findPlanInfoStatus",
			data:{planInfoIds:planInfoIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				if(resp.planStatus==2){

					//计划审核模态框
					$.confirm({
						title : '请您填写审核意见:',
						content : ''
								+ '<form action="" class="formName">'
								+ '<div class="form-group">'
								+ '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px" />'
								+ '</div>' + '</form>',
						buttons : {
							formSubmit : {
								text : '审核通过',
								btnClass : 'btn-blue',
								action : function() {
									var auditOption=this.$content.find('#auditOpinion').val();
									if(!auditOption){
										xjValidate.showTip( "审核意见不能为空！");
										return false;
									}
									
									//提交审核通过信息
									$.ajax({
										url:basePath+"/planInfo/aduitPlanInfoById",
										data:{'auditOption':auditOption,'planInfoIds':planInfoIds,"sign":1,"signs":2,"planType":1},
										dataType:"json",
										type:"post",
										async:false,
										success:function(resp){
											if(resp){
												if(resp.success){
													xjValidate.showPopup(resp.msg,"提示",true);
													list(1);
												}else{
													xjValidate.showPopup(resp.msg,"提示",true);
													return;
												}
											}else{
												xjValidate.showPopup("保存计划审核意见服务异常繁忙，请稍后重试","提示",true);
										        return;
											}
										}
									});
								}
							},
							formSubmit1 : {
								text : '审核驳回',
								btnClass : 'btn-red',
								action : function() {
									
									var auditOption=this.$content.find('#auditOpinion').val();
									if(!auditOption){
										xjValidate.showTip("审核意见不能为空!");
										return false;
									}
									//提交审核未通过信息
									$.ajax({
										url:basePath+"/planInfo/aduitPlanInfoById",
										data:{'auditOption':auditOption,'planInfoIds':planInfoIds,"sign":2,"signs":3,"planType":1},
										dataType:"json",
										type:"post",
										async:false,
										success:function(resp){
											if(resp){
												if(resp.success){
													xjValidate.showPopup(resp.msg,"提示",true);
													list(1);
												}else{
													xjValidate.showPopup(resp.msg,"提示",true);
													return;
												}
											}else{
												xjValidate.showPopup("保存计划审核意见服务异常繁忙，请稍后重试","提示",true);
										        return;
											}
										}
									});
								}
							},
							'取消' : function() {
								
							}
						}
					
					});
					
				}else {
					xjValidate.showPopup("计划已审核！","提示",true);
				}
			}
		});
	}
}

//撤回计划
function withdrawPlanInfoMationById(planInfoIds,planInfoIdLength){

	
	//判断选择数据长度
	if(planInfoIdLength>1){
		xjValidate.showPopup("请选择一条记录!","提示",true);
	}else if(planInfoIdLength<1){
		xjValidate.showPopup("请选择一条记录!","提示",true);
	}else if(planInfoIdLength=1){
		
		//根据ID查询计划状态
		$.ajax({
			url:basePath+"/planInfo/findPlanInfoStatus",
			data:{planInfoIds:planInfoIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				
				//计划已派发状态
				if(resp.planStatus==5 && resp.isSplitPlan==0){
					
					$.confirm({
					      title: '提示',
					      content: '您确定要撤回该条计划信息吗？',
					      buttons: {
					          '确定': function () {
					        	  
					        	//撤回计划
									$.ajax({
										url:basePath+"/planInfo/withdrawPlanInfoMationById",
										data:{planInfoIds:planInfoIds},
										dataType:"json",
										type:"post",
										async:false,
										success:function(resp){
											if(resp){
												
												if(resp.success){
													
													xjValidate.showPopup(resp.msg,"提示",true);
													list(1);
													
												}else{
													xjValidate.showPopup(resp.msg,"提示",true);
												}
												
											}else{
												xjValidate.showPopup("撤回计划信息异常!","提示",true);
											}
										}
									});
					        	  
					          },
					          '取消': function () {
					          }
					      }
					  });
					
				}else {
					xjValidate.showPopup("计划未派发或已被拆分！","提示",true);
				}
			}
		});
		
	}
	
}

//派发计划

function distributePlanInfoById(planInfoIds,planInfoIdLength){

	//判断选择数据长度
	if(planInfoIdLength>1){
		xjValidate.showPopup("请选择一条记录!","提示",true);
	}else if(planInfoIdLength<1){
		xjValidate.showPopup("请选择一条记录!","提示",true);
	}else if(planInfoIdLength=1){
		
		//根据ID查询计划状态
		$.ajax({
			url:basePath+"/planInfo/findPlanInfoStatus",
			data:{planInfoIds:planInfoIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				//计划已撤回状态
				
				if(resp.planStatus==6){
					
					$.confirm({
					      title: '提示',
					      content: '您确定要派发该条计划信息吗？',
					      buttons: {
					          '确定': function () {
					        	  
					        	  //派发计划
					        	  $.ajax({
					        		  url:basePath+"/planInfo/distributePlanInfoById",
					        		  data:{planInfoIds:planInfoIds},
					        		  dataType:"json",
					        		  type:"post",
					        		  async:false,
					        		  success:function(resp){
					        			  if(resp){
					        				  if(resp.success){
					        					  xjValidate.showPopup(resp.msg,"提示",true); 
					        					  list(1);
					        				  }
					        			  }else{
					        				  xjValidate.showPopup("计划派发异常！","提示",true); 
					        			  }
					        		  }
					        	  });
					        	  
					          },
					          '取消': function () {
					          }
					      }
					  });
					
				}else {
					xjValidate.showPopup("计划已派发或未审核！","提示",true);
				}
			}
		});
	}
}

//计划生成运单跟踪
function findAllWayibbyMation(id){
	var url=basePath+"/planInfo/findAllWayibbyMationPage";
	$("#find_plan_waybill_info").load(url,function(){
		$("#planInfoId").val(id);
	});
}