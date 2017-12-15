$(function() {
	//时间调用插件
    setTimeout(function() {
       $(".date-time").datetimepicker({
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
	// 搜索
	searchCarInfo(1);
	var carStatus = $("#carStatus").val();
	var isCarCodeReadonly = $("#isCarCodeReadonly").val();
	if (carStatus == 2 || isCarCodeReadonly ==1) {
		$("#carCode").attr("readOnly", true).css("background", "#eee");
	}
	
	//关闭企业临时司机弹框
	$("body").on("click",".temp-driver-opt-close",function(){
		$("#show-temp-driver-data-info").empty();
	});
});

/**
 * 根据ID删除自有车辆信息
 * @param carInfoId 车辆ID
 * @author zhangya 2017年6月1日
 */
$("body").on("click", ".delete-operation", function() {
	var carInfoId = $(this).parent().attr("car-info-id");
	// 企业内部车辆
	var carPart = 2;
	// 主键ID存在则进行审核
	if (carInfoId) {
		$.confirm({
			title : "提示",
			content : "是否确认删除所选车辆信息？",
			buttons : {
				'确认' : function() {
					$.ajax({
						url : basePath + "/carInfo/deleteCarInfoById",
						asyn : false,
						type : "POST",
						data : {"carInfoId" : carInfoId,"carPart" : carPart},
						dataType : "json",
						success : function(dataStr) {
							if (dataStr) {
								if (dataStr.success) {
									commonUtil.showPopup("提示", dataStr.msg);
									searchCarInfo(1);
								} else {
									commonUtil.showPopup("提示", dataStr.msg);
									return;
								}
							} else {
								commonUtil.showPopup("提示", "删除异常，请稍后重试");
								return;
							}
						}
					});
				},
				'取消' : function() {

				}
			}
		});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/**
 * 根据ID将自有车辆营运状态变更为营运
 * @param carInfoId 车辆ID
 * @author zhangya 2017年6月5日
 */
$("body").on("click", ".operation-operation", function() {
	var carInfoId = $(this).parent().attr("car-info-id");
	// 企业临时车辆
	var carPart = 2;
	// 1营运 ，3停运
	var operationStatus = 1;
	// 主键ID存在则进行审核
	if (carInfoId) {
		$.confirm({
			title : "提示",
			content : "是否确认变更所选车辆营运状态？",
			buttons : {
				'确认' : function() {
					$.ajax({
						url : basePath + "/carInfo/changeOperationStatus",
						asyn : false,
						type : "POST",
						data : {"carInfoId" : carInfoId,"carPart" : carPart,"operationStatus" : operationStatus},
						dataType : "json",
						success : function(dataStr) {
							if (dataStr) {
								if (dataStr.success) {
									commonUtil.showPopup("提示", dataStr.msg);
									searchCarInfo(1);
								} else {
									commonUtil.showPopup("提示", dataStr.msg);
									return;
								}
							} else {
								commonUtil.showPopup("提示", "变更异常，请稍后重试");
								return;
							}
						}
					});
				},
				'取消' : function() {
				}
			}
		});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/**
 * 根据ID将自有车辆营运状态变更为停运
 * @param carInfoId 车辆ID
 * @author zhangya 2017年6月5日
 */
$("body").on("click", ".outage-operation", function() {
	var carInfoId = $(this).parent().attr("car-info-id");
	// 企业临时车辆
	var carPart = 2;
	// 1营运 ，3停运
	var operationStatus = 3;
	// 主键ID存在则进行审核
	if (carInfoId) {
		$.confirm({
			title : "提示",
			content : "是否确认变更所选车辆营运状态？",
			buttons : {
				'确认' : function() {
					$.ajax({
						url : basePath + "/carInfo/changeOperationStatus",
						asyn : false,
						type : "POST",
						data : {"carInfoId" : carInfoId,"carPart" : carPart,"operationStatus" : operationStatus},
						dataType : "json",
						success : function(dataStr) {
							if (dataStr) {
								if (dataStr.success) {
									commonUtil.showPopup("提示", dataStr.msg);
									searchCarInfo(1);
								} else {
									commonUtil.showPopup("提示", dataStr.msg);
									return;
								}
							} else {
								commonUtil.showPopup("提示", "变更异常，请稍后重试");
								return;
							}
						}
					});
				},
				'取消' : function() {
				}
			}
		});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/*
 * 企业临时车辆信息查看
 */
$("body").on("click", ".view-operation", function() {
	var carInfoId = $(this).parent().attr("car-info-id");
	$("#car_info_id").val(carInfoId);
	$("#edit_form").attr("action", basePath + "/carInfo/viewCarInfoPage");
	$("#edit_form").submit();
});

/*
 *  全选/全不选
 */
$("body").on("click", ".all_check", function() {
	var delBtnDisabled = false;
	var delBtnStyle = "operation-button operation-blue";
	if ($(".all_check").is(":checked")) {
		// 全选时
		$(".sub_check").each(function() {
			$(this).prop("checked", true);
			if ($(this).attr("data-status") != 1) {
				auditBtnDisabled = true;
				auditBtnStyle = "operation-button operation-grey";
				if ($(this).attr("data-status") == 2) {
					delBtnDisabled = true;
					delBtnStyle = "operation-button operation-grey";
				}
			}
		});
	} else {
		// 全不选时
		$(".sub_check").each(function() {
			$(this).prop("checked", false);
		});
	}
	$("#delBtn").attr("disabled", delBtnDisabled);
	$("#delBtn").attr("class", delBtnStyle);
});

/*
 * 部分选择判断
 */
$("body").on("click", ".sub_check", function() {
	var isAll = true;
	var delBtnDisabled = false;
	var delBtnStyle = "operation-button operation-blue";
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			$(this).prop("checked", true);
			if ($(this).attr("data-status") == '2') {
				delBtnDisabled = true;
				delBtnStyle = "operation-button operation-grey";
			}
		} else {
			$(this).prop("checked", false);
		}
		if (!$(this).prop("checked")) {
			isAll = false;
		}
	});
	$("#delBtn").attr("disabled", delBtnDisabled);
	$("#delBtn").attr("class", delBtnStyle);
	$(".all_check").prop("checked", isAll);
});



$("#carCode").blur(function(){
	checkVehicleInformation();
	});


/**
 * 批量操作前校验 0 : 删除勾选的自有车辆信息 1 : 审核勾选的自有车辆信息
 */
function checkBeforeOperate(operate) {
	if (operate == undefined || operate == "") {
		commonUtil.showPopup("提示", "操作无效！");
		return;
	}
	// 获取选中的操作记录
	var carInfoIds = findAllCheckCarIds();
	if (carInfoIds == undefined || carInfoIds == "") {
		var operStr = "";
		if (operate == 1) {
			operStr = "删除"
		} else if (operate == 2) {
			operStr = "审核"
		}
		commonUtil.showPopup("提示", "请选择要" + operStr + "的临时车辆");
		return;
	}
	// 删除操作
	if (operate == 1) {
		batchDelete(carInfoIds);
	} else if (operate == 2) {
		// 审核操作按钮校验
		$.ajax({
			url : basePath + "/carInfo/batchCheckBeforeOperateCarInfo",
			asyn : false,
			type : "POST",
			data : {"carInfoIds" : carInfoIds,"carPart" : 2},
			dataType : "json",
			success : function(dataStr) {
				if (dataStr) {
					if (dataStr.success) {
						batchAudit(carInfoIds);
					} else {
						commonUtil.showPopup("提示", dataStr.msg);
						return;
					}
				} else {
					commonUtil.showPopup("提示", "保存车辆信息服务异常忙，请稍后重试");
					return;
				}
			}
		});
	}
}

/**
 * 获取所有选中的企业临时车辆ID
 * @author zhangya 2017年5月26日
 * @returns 用户ID，逗号分隔
 */
function findAllCheckCarIds() {
	// 所有选中临时车辆ID
	var carIds = new Array();
	$(".sub_check").each(function() {
		if ($(this).is(":checked")) {
			carIds.push($(this).attr("data-id"))
		}
	});
	return carIds.join(",");
}

/**
 * 分页查询
 * @param number  页数
 */
function pagerGoto(number) {
	var tempDriver = $("#tempDriver").val();
	if(tempDriver != null && tempDriver != "" && tempDriver == "2"){
		searchTempDriver(number);
	}else{
		searchCarInfo(number);
	}
}

/**
 * 跳转到某页
 */
function btnPagerGoto() {
	// 取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	// 取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	// 数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		alert("请输出正确的数字");
		return;
	}
	// 跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	var tempDriver = $("#tempDriver").val();
	if(tempDriver != null && tempDriver != "" && tempDriver == "2"){
		searchTempDriver(goPage);
	}else{
		searchCarInfo(goPage);
	}
}

/**
 * 根据页数查询车辆
 * @param number
 */
function searchCarInfo(number) {
	// 司机姓名
	var driverName = $.trim($("#driverName").val());
	// 车牌号码
	var carCode = $("#carCode").val();
	// 车辆类型
	var carType = $.trim($("#carType").val());
	// 车辆所有人
	var carPartPerson = $("#carPartPerson").val();
	// 营运状态
	var operationStatus = $.trim($("#operationStatus").val());

	// 请求地址
	var url = basePath + "/carInfo/listTempCarInfoData #temp_car_info";
	$("#search_car_info").load(url, {
		"page" : number,
		"rows" : 10,
		"driverName" : driverName,
		"carType" : carType,
		"carPartPerson" : carPartPerson,
		"carCode" : carCode,
		"operationStatus" : operationStatus
	}, function() {
		//允许表格拖着
		$("#tableDrag").colResizable({
		  liveDrag:true, 
		  gripInnerHtml:"<div class='grip'></div>", 
		  draggingClass:"dragging"
		});
	})
}

/**
 * 新增企业临时车辆信息初始页
 * @param carInfoId 车辆ID
 * @author zhangya 2017年6月1日
 */
function addCarInfoPage() {
	// 请求地址
	window.location.href = basePath + "/carInfo/addOrEditTempCarInfoPage";
}

/*
 * 编辑临时车辆信息初始页
 */
$("body").on("click",".modify-operation",function() {
	var carInfoId = $(this).parent().attr("car-info-id");
	// 主键ID存在则进行权限校验
	if (carInfoId) {
		$.ajax({url : basePath + "/carInfo/checkBeforeOperateCarInfo",
				asyn : false,
				type : "POST",
				data : {"carInfoId" : carInfoId,"carPart" : 2},
				dataType : "json",
				success : function(dataStr) {
					if (dataStr) {
						if (dataStr.success) {
							if (carInfoId != undefined && carInfoId != "") {
								$("#car_info_id").val(carInfoId);
								$("#edit_form").attr("action",basePath + "/carInfo/addOrEditTempCarInfoPage");
								$("#edit_form").submit();
							} else {
								commonUtil.showPopup("提示","操作的数据无效！");
							}
						} else {
							commonUtil.showPopup("提示",dataStr.msg);
							return;
						}
					} else {
						commonUtil.showPopup("提示","保存车辆信息服务异常忙，请稍后重试");
						return;
					}
				}
		});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
});

/**
 * @author zhangya 2017年6月1日
 */
$(function() {
	// 上传图片初始化
	$('.upload_img').each(function() {
		uploadLoadFile($(this));
	})
});
/**
 * 绑定上传事件的dom对象
 * @author zhangya 2017年6月1日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn, {
		action : basePath + '/upload/imageUpload',
		name : 'myfile',
		dataType : 'json',
		onSubmit : function(file, ext) {
			// 文件上传格式校验
			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))) {
				commonUtil.showPopup("提示", "请上传格式为 jpg|png|bmp 的图片");
				return;
			}
		},
		// 服务器响应成功时的处理函数
		onComplete : function(file, resultJson) {
			if (resultJson) {
				resultJson = $.parseJSON(resultJson);
				// 是否成功
				var isSuccess = resultJson.isSuccess;
				// 上传图片URL
				var uploadUrl = resultJson.uploadUrl;
				if (isSuccess == "true") {
					// 图片类型
					var imgType = btn.attr("img-type");
					btn.attr("src", fastdfsServer + "/" + uploadUrl);
					$("#" + imgType).val(uploadUrl);
				} else {
					commonUtil.showPopup("提示", resultJson.errorMsg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "服务器异常，请稍后重试");
				return;
			}

		}
	});
}

/**
 * 提交车辆信息
 * @author zhangya 2017年6月1日
 */
function saveTempCarInfo() {
	// 1、车牌号码校验
	var carCode = $.trim($("#carCode").val());
	if (carCode == undefined || carCode == "") {
		commonUtil.showPopup("提示", "车牌号码不能为空");
		return;
	}

	if (carCode.length > 8) {
		commonUtil.showPopup("提示", "车牌号码以汉字开头，后面可录入六个字符");
		return;
	}
	var mycarCode = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
	if (!mycarCode.test(carCode)) {
		commonUtil.showPopup("提示", "请输入有效的车牌号码");
		return;
	}
	// 2、营运证号校验
	var operationCertCode = $.trim($("#operationCertCode").val());
//	if (operationCertCode == undefined || operationCertCode == "") {
//		commonUtil.showPopup("提示", "营运证号不能为空");
//		return;
//	}
	
	var carPartPerson=$.trim($("#carPartPerson").val());
	if (carPartPerson == undefined || carPartPerson == "") {
		commonUtil.showPopup("提示", "车辆所有人不能为空");
		return;
	}
	
	var carPartPersonPhone=$.trim($("#carPartPersonPhone").val());
	if (carPartPersonPhone == undefined || carPartPersonPhone == "") {
		commonUtil.showPopup("提示", "车辆所有人电话不能为空");
		return;
	}
	
	if (operationCertCode.length > 100) {
		commonUtil.showPopup("提示", "营运证号不能超过50个汉字");
		return;
	}
	// 3、行驶证校验
	var drivingLicense = $.trim($("#drivingLicense").val());
	/*if (drivingLicense == undefined || drivingLicense == "") {
		commonUtil.showPopup("提示", "行驶证不能为空");
		return;
	}*/

	if (drivingLicense.length > 100) {
		commonUtil.showPopup("提示", "行驶证不能超过50个汉字");
		return;
	}
	// 4、登记机关校验
	var registerOrg = $.trim($("#registerOrg").val());
	if (registerOrg.length > 100) {
		commonUtil.showPopup("提示", "登记机关不能超过50个汉字");
		return;
	}
	// 5、发证机关校验
	var sendCertOrg = $.trim($("#sendCertOrg").val());
	if (sendCertOrg.length > 100) {
		commonUtil.showPopup("提示", "发证机关不能超过50个汉字");
		return;
	}
	// 6、机动车登记证书编号校验
	var carRegisterCode = $.trim($("#carRegisterCode").val());
	if (carRegisterCode.length > 100) {
		commonUtil.showPopup("提示", "机动车登记证书编号不能超过50个汉字");
		return;
	}
	// 7、发证机关校验
	var sendCertOrg = $.trim($("#sendCertOrg").val());
	if (sendCertOrg.length > 100) {
		commonUtil.showPopup("提示", "发证机关不能超过50个汉字");
		return;
	}
	// 8、车辆获得方式校验
	var acquireWay = $.trim($("#acquireWay").val());
	if (acquireWay.length > 100) {
		commonUtil.showPopup("提示", "车辆获得方式不能超过50个汉字");
		return;
	}
	// 9、购买金额校验
	var amount = $.trim($("#amount").val());
	if (amount.length > 14) {
		commonUtil.showPopup("提示", "购买金额不能超过14位数");
		return;
	}
	// 10、车辆品牌校验
	var brandName = $.trim($("#brandName").val());
	if (brandName.length > 100) {
		commonUtil.showPopup("提示", "车辆品牌不能超过50个汉字");
		return;
	}
	// 11、车身颜色校验
	var color = $.trim($("#color").val());
	if (color.length > 40) {
		commonUtil.showPopup("提示", "车身颜色不能超过20个汉字");
		return;
	}
	// 12、车辆型号校验
	var carModel = $.trim($("#carModel").val());
	if (carModel.length > 100) {
		commonUtil.showPopup("提示", "车辆型号不能超过50个汉字");
		return;
	}
	// 13、发动机号校验
	var engineNum = $.trim($("#engineNum").val());
	if (engineNum.length > 100) {
		commonUtil.showPopup("提示", "发动机号不能超过50个汉字");
		return;
	}
	// 14、车架号校验
	var chassisNum = $.trim($("#chassisNum").val());
	if (chassisNum.length > 100) {
		commonUtil.showPopup("提示", "车架号不能超过50个汉字");
		return;
	}
	// 15、发动机型号校验
	var engineType = $.trim($("#engineType").val());
	if (engineType.length > 100) {
		commonUtil.showPopup("提示", "发动机型号不能超过50个汉字");
		return;
	}
	// 16、燃料种类校验
	var fuelType = $.trim($("#fuelType").val());
	if (fuelType.length > 11) {
		commonUtil.showPopup("提示", "燃料种类不能超过11位数字");
		return;
	}
	// 17、排量校验
	var displacement = $.trim($("#displacement").val());
	if (displacement.length > 20) {
		commonUtil.showPopup("提示", "排量不能超过10个汉字");
		return;
	}
	// 18、功率校验
	var power = $.trim($("#power").val());
	if (power.length > 20) {
		commonUtil.showPopup("提示", "功率不能超过10个汉字");
		return;
	}
	// 19、制造厂名称校验
	var manufactoryName = $.trim($("#manufactoryName").val());
	if (manufactoryName.length > 100) {
		commonUtil.showPopup("提示", "制造厂名称不能超过50个汉字");
		return;
	}
	// 20、转向形式校验
	var steeringType = $.trim($("#steeringType").val());
	if (steeringType.length > 100) {
		commonUtil.showPopup("提示", "转向形式不能超过50个汉字");
		return;
	}
	// 21、轮距（前）校验
	var wheelBaseBefore = $.trim($("#wheelBaseBefore").val());
	if (wheelBaseBefore.length > 20) {
		commonUtil.showPopup("提示", "轮距（前）不能超过10个汉字");
		return;
	}
	// 22、轮距（后）校验
	var wheelBaseAfter = $.trim($("#wheelBaseAfter").val());
	if (wheelBaseAfter.length > 20) {
		commonUtil.showPopup("提示", "轮距（后）不能超过10个汉字");
		return;
	}
	// 23、轮胎数校验
	var wheelNum = $.trim($("#wheelNum").val());
	if (wheelNum.length > 20) {
		commonUtil.showPopup("提示", "轮胎数不能超过10个汉字");
		return;
	}
	// 24、轮胎规格校验
	var wheelNorms = $.trim($("#wheelNorms").val());
	if (wheelNorms.length > 60) {
		commonUtil.showPopup("提示", "轮胎规格不能超过30个汉字");
		return;
	}
	// 25、钢板弹簧片数（前）校验
	var sheetNumBefore = $.trim($("#sheetNumBefore").val());
	if (sheetNumBefore.length > 20) {
		commonUtil.showPopup("提示", "钢板弹簧片数（前）不能超过10个汉字");
		return;
	}
	// 26、钢板弹簧片数（后）校验
	var sheetNumAfter = $.trim($("#sheetNumAfter").val());
	if (sheetNumAfter.length > 20) {
		commonUtil.showPopup("提示", "钢板弹簧片数（后）不能超过10个汉字");
		return;
	}
	// 27、轴距校验
	var axleDistance = $.trim($("#axleDistance").val());
	if (axleDistance.length > 30) {
		commonUtil.showPopup("提示", "轴距不能超过15个汉字");
		return;
	}
	// 28、轴数校验
	var axleNum = $.trim($("#axleNum").val());
	if (axleNum.length > 30) {
		commonUtil.showPopup("提示", "轴数不能超过15个汉字");
		return;
	}
	// 29、外廓尺寸 (长*宽*高)校验
	var gabarite = $.trim($("#gabarite").val());
	if (gabarite.length > 100) {
		commonUtil.showPopup("提示", "外廓尺寸 (长*宽*高)不能超过50个汉字");
		return;
	}
	// 30、核定载重量校验
	var checkLoad = $.trim($("#checkLoad").val());
	if (checkLoad.length > 30) {
		commonUtil.showPopup("提示", "核定载重量不能超过15个汉字");
		return;
	}
	// 31、准牵引总质量校验
	var tractionMass = $.trim($("#tractionMass").val());
	if (tractionMass.length > 30) {
		commonUtil.showPopup("提示", "准牵引总质量不能超过15个汉字");
		return;
	}
	// 32、货箱内部尺寸 (长*宽*高)校验
	var containerSize = $.trim($("#containerSize").val());
	if (containerSize.length > 100) {
		commonUtil.showPopup("提示", "货箱内部尺寸 (长*宽*高)不能超过50个汉字");
		return;
	}
	// 33、整备质量校验
	var curbWeight = $.trim($("#curbWeight").val());
	if (curbWeight.length > 30) {
		commonUtil.showPopup("提示", "整备质量不能超过15个汉字");
		return;
	}
	// 34、使用性质校验
	var useNature = $.trim($("#useNature").val());
	if (useNature.length > 100) {
		commonUtil.showPopup("提示", "使用性质不能超过50个汉字");
		return;
	}
	// 35、核定油耗校验
	var checkLoad = $.trim($("#checkLoad").val());
	if (checkLoad.length > 30) {
		commonUtil.showPopup("提示", "核定载重量不能超过15个汉字");
		return;
	}
	// 36、核定载重量校验
	var checkFuel = $.trim($("#checkFuel").val());
	if (checkFuel.length > 30) {
		commonUtil.showPopup("提示", "核定油耗不能超过15个汉字");
		return;
	}
	// 37、核定载重量校验
	var checkLoad = $.trim($("#checkLoad").val());
	if (checkLoad.length > 30) {
		commonUtil.showPopup("提示", "核定载重量不能超过15个汉字");
		return;
	}
	// 38、核定载客人数校验
	var checkNum = $.trim($("#checkNum").val());
	if (checkNum.length > 10) {
		commonUtil.showPopup("提示", "核定载客人数不能超过5个汉字");
		return;
	}
	// 39、驾驶室载客人数校验
	var cabPassengers = $.trim($("#cabPassengers").val());
	if (cabPassengers.length > 10) {
		commonUtil.showPopup("提示", "驾驶室载客人数不能超过5个汉字");
		return;
	}
	// 40、备注校验
	var remarks = $.trim($("#remarks").val());
	if (remarks != undefined && remarks != "" && remarks.length > 200) {
		commonUtil.showPopup("提示", "备注信息不能超过100个汉字");
		return;
	}
	/*// 41、营运证附件备注校验
	var operationCertImg = $.trim($("#operation_cert_img").val());
	if (operationCertImg == undefined || operationCertImg == "") {
		commonUtil.showPopup("提示", "营运证附件不能为空！");
		return;
	}*/
	// 42、司机行驶证附件(正本)校验
	var driverLicenseImg = $.trim($("#driver_license_img").val());
//	if (driverLicenseImg == undefined || driverLicenseImg == "") {
//		commonUtil.showPopup("提示", "司机行驶证附件(正本)不能为空！");
//		return;
//	}
	// 42、司机行驶证附件(副本)校验
	var driverLicenseImgCopy = $.trim($("#driver_license_img_copy").val());
//	if (driverLicenseImgCopy == undefined || driverLicenseImgCopy == "") {
//		commonUtil.showPopup("提示", "司机行驶证附件(副本)不能为空！");
//		return;
//	}
	// 同意电子协议
	if (!$("#isCheck").is(":checked")) {
		alert("请同意电子协议");
		return;
	}
	$.ajax({
		url : basePath + "/carInfo/addOrUpdateTempCarInfo",
		asyn : false,	
		type : "POST",
		data : $('#car_info_form').serialize(),
		dataType : "json",
		success : function(dataStr) {
			if (dataStr) {
				if (dataStr.success) {
					commonUtil.showPopup("提示", "保存成功");
					$.confirm({
						title : "提示",
						content : "是否返回结算信息？",
						buttons : {
							'是' : function() {
								window.history.back();
							},
							'否' : function() {
								window.location.href = basePath
								+ "/carInfo/initTempCarInfoPage";	
							}
						}
					});
				} else {
					commonUtil.showPopup("提示", dataStr.msg);
					return;
				}
			} else {
				commonUtil.showPopup("提示", "保存车辆信息服务异常忙，请稍后重试");
				return;
			}
		}
	});
}

function batchDelete(carInfoIds) {
	// 标识企业临时车
	var carPart = 2;
	if (carInfoIds) {
		$.confirm({
			title : "提示",
			content : "是否确认删除所选车辆信息？",
			buttons : {
				'确认' : function() {
					$.ajax({
						url : basePath + "/carInfo/batchDeleteCarInfoByIds",
						asyn : false,
						type : "POST",
						data : {"carInfoIds" : carInfoIds,"carPart" : carPart},
						dataType : "json",
						success : function(dataStr) {
							if (dataStr) {
								if (dataStr.success) {
									commonUtil.showPopup("提示", dataStr.msg);
									searchCarInfo(1);
								} else {
									commonUtil.showPopup("提示", dataStr.msg);
									return;
								}
							} else {
								commonUtil.showPopup("提示", "删除异常，请稍后重试");
								return;
							}
						}
					});
				},
				'取消' : function() {

				}
			}
		});
	} else {
		commonUtil.showPopup("提示", "操作的数据无效！");
		return;
	}
}

/**
 * jiangweiwei 2017-10-13 根据分页查询企业临时司机
 * @param number
 */
function searchTempDriver(number){
	var driverName = $("#driverName").val();
	var url = basePath+ "/carInfo/showTempDriverInfoPage #temp-driver-data-info";
	$("#show-temp-driver-data-info").load(url, {
	"page" : number,
	"rows" : 10,
	"driverName" : driverName
	}, function() {
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
 * jiangweiwei 2017-10-13 选择企业临时司机
 */
function submitSelectTempDriver(){
	var selectlist = findTempDriverAllCheck(".sub_temp_driver_info_check");
	if(selectlist.length==0){
		 $.alert("请选择一条数据");
		 return;
	}
	$("#tempDriverName").val(selectlist[0].tempDriverName);
	$("#driverInfoId").val(selectlist[0].driverInfoId);
	$("#temp-driver-data-info").empty();
}

/**
 * 查找选择
 */
function findTempDriverAllCheck(element) {
	var checkList = new Array();
	$(element).each(function() {
		if ($(this).is(":checked")) {
			var params = {
				"driverInfoId" : $(this).attr("data-id"),
				"tempDriverName" : $(this).attr("data-temp-driver-name")
			}
			checkList.push(params);
		}
	});
	return checkList;
}



//根据车牌号验证车辆入网信息及车辆信息（营运证等）
function checkVehicleInformation(){
	$(".panel").showLoading();
    var carCode=$("#carCode").val();
    
	if ($("#carCode").val()==""){
		commonUtil.showPopup("提示","请输入车牌号码！");
		return false;
	}
	var re = /^[\u4E00-\u9FA5][\dA-Z]{6}$/;
	if (!re.test($("#carCode").val())){
		commonUtil.showPopup("提示","车牌号码格式错误！");
		return false;
	}
	
	//$("#menudiv2").showLoading();
 	$.ajax({
	      type: 'post',
		  url:basePath+"/carInfo/checkVehicleInformation",
		  data: {"carCode":carCode},
		 datatype:'json',			  
		  success:function(dat){
			  $(".panel").hideLoading();
				//var dat = eval('(' + data + ')');
				//$("#menudiv2").hideLoading();
				if (dat.success){
					//返回数据
//					if(dat.enable =="1"){
//						$("#periodEndDate").css({"color":"green"})
//					}
//					else{
//						 $("#periodEndDate").css({"color":"red"})
//					}
					$("#operationCertCode").val(dat.RoadTransportCertificateNumber); //道路运输证编号
					$("#operationEndTime").val(dat.PeriodEndDate+" 00:00:00");//道路运输证日期
//					$("#license_number").val(dat.certificateNumber);//道路运输证
//				
//					$("#vehicleClassification").html(dat.vehicleClassification);//车辆类型
				}else{
					commonUtil.showPopup("提示",dat.msg);
				}
				//$("#check_status").val("1");//检测后车辆检车状态更改
		  },
		  error: function(){
				$(".panel").hideLoading();
		     alert("系统出现故障，车辆校验异常！");
		  }	   
	   }); 
	
}

