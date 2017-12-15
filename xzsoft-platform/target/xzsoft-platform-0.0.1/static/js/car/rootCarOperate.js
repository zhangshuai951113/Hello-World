/**
 * 
 * @author luojuan 2017年5月23日
 */
$(function(){
	
	//上传图片初始化
	$('.upload_img').each(function(){
		uploadLoadFile($(this));
	})
	
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
    },500)
});
	/**
	 * 绑定上传事件的dom对象
	 * @author luojuan 2017年5月24日
	 */
	function uploadLoadFile(btn) {
		new AjaxUpload(btn,{
	   		action: basePath + '/upload/imageUpload',
	   		name: 'myfile',
			dataType: 'json',
	   		onSubmit : function(file , ext){
	   			//文件上传格式校验
	   			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))){
	   				xjValidate.showPopup("请上传格式为 jpg|png|bmp 的图片","提示",true);
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
						btn.attr("src",fastdfsServer+"/"+uploadUrl);
						$("#"+imgType).val(uploadUrl);
	   				}else{
	   					xjValidate.showPopup(resultJson.errorMsg,"提示",true);
	   	   				return;
	   				}
	   			}else{
	   				xjValidate.showPopup("服务器异常，请稍后重试","提示",true);
	   				return;
	   			}

			}
		});
	}
	
/**
 * 提交完善信息
 *  @author luojuan 2017年5月26日
 */
function commitRootCarInfo(){
	//1、车牌号码校验
	var carCode = $.trim($("#carCode").val());
	if(carCode==undefined || carCode==""){
		xjValidate.showPopup("车牌号码不能为空","提示",true);
		return;
	}
	
	if(carCode.length>8){
		xjValidate.showPopup("车牌号码以汉字开头，后面可录入六个字符","提示",true);
		return;
	}
	var mycarCode = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/; 
	if(!mycarCode.test(carCode)){
		xjValidate.showPopup("请输入有效的车牌号码","提示",true);
		return;
	}
	//2、营运证号校验
	var operationCertCode = $.trim($("#operationCertCode").val());
	if(operationCertCode==undefined || operationCertCode==""){
		xjValidate.showPopup("营运证号不能为空","提示",true);
		return;
	}
	
	if(operationCertCode.length>100){
		xjValidate.showPopup("营运证号不能超过50个汉字","提示",true);
		return;
	}
	//3、行驶证校验
	var drivingLicense = $.trim($("#drivingLicense").val());
	if(drivingLicense==undefined || drivingLicense==""){
		xjValidate.showPopup("行驶证不能为空","提示",true);
		return;
	}
	
	if(drivingLicense.length>100){
		xjValidate.showPopup("行驶证不能超过50个汉字","提示",true);
		return;
	}
	//4、登记机关校验
	var registerOrg = $.trim($("#registerOrg").val());
	if(registerOrg.length>100){
		xjValidate.showPopup("登记机关不能超过50个汉字","提示",true);
		return;
	}
	//5、发证机关校验
	var sendCertOrg = $.trim($("#sendCertOrg").val());
	if(sendCertOrg.length>100){
		xjValidate.showPopup("发证机关不能超过50个汉字","提示",true);
		return;
	}
	//6、机动车登记证书编号校验
	var carRegisterCode = $.trim($("#carRegisterCode").val());
	if(carRegisterCode.length>100){
		xjValidate.showPopup("机动车登记证书编号不能超过50个汉字","提示",true);
		return;
	}
	//7、发证机关校验
	var sendCertOrg = $.trim($("#sendCertOrg").val());
	if(sendCertOrg.length>100){
		xjValidate.showPopup("发证机关不能超过50个汉字","提示",true);
		return;
	}
	//8、车辆获得方式校验
	var acquireWay = $.trim($("#acquireWay").val());
	if(acquireWay.length>100){
		xjValidate.showPopup("车辆获得方式不能超过50个汉字","提示",true);
		return;
	}
	//9、购买金额校验
	var amount = $.trim($("#amount").val());
	if(amount.length>14){
		xjValidate.showPopup("购买金额不能超过14位数","提示",true);
		return;
	}
	//10、车辆品牌校验
	var brandName = $.trim($("#brandName").val());
	if(brandName.length>100){
		xjValidate.showPopup("车辆品牌不能超过50个汉字","提示",true);
		return;
	}
	//11、车身颜色校验
	var color = $.trim($("#color").val());
	if(color.length>40){
		xjValidate.showPopup("车身颜色不能超过20个汉字","提示",true);
		return;
	}
	//12、车辆型号校验
	var carModel = $.trim($("#carModel").val());
	if(carModel.length>100){
		xjValidate.showPopup("车辆型号不能超过50个汉字","提示",true);
		return;
	}
	//13、发动机号校验
	var engineNum = $.trim($("#engineNum").val());
	if(engineNum.length>100){
		xjValidate.showPopup("发动机号不能超过50个汉字","提示",true);
		return;
	}
	//14、车架号校验
	var chassisNum = $.trim($("#chassisNum").val());
	if(chassisNum.length>100){
		xjValidate.showPopup("车架号不能超过50个汉字","提示",true);
		return;
	}
	//15、发动机型号校验
	var engineType = $.trim($("#engineType").val());
	if(engineType.length>100){
		xjValidate.showPopup("发动机型号不能超过50个汉字","提示",true);
		return;
	}
	//16、燃料种类校验
	var fuelType = $.trim($("#fuelType").val());
	if(fuelType.length>11){
		xjValidate.showPopup("燃料种类不能超过11位数字","提示",true);
		return;
	}
	//17、排量校验
	var displacement = $.trim($("#displacement").val());
	if(displacement.length>20){
		xjValidate.showPopup("排量不能超过10个汉字","提示",true);
		return;
	}
	//18、功率校验
	var power = $.trim($("#power").val());
	if(power.length>20){
		xjValidate.showPopup("功率不能超过10个汉字","提示",true);
		return;
	}
	//19、制造厂名称校验
	var manufactoryName = $.trim($("#manufactoryName").val());
	if(manufactoryName.length>100){
		xjValidate.showPopup("制造厂名称不能超过50个汉字","提示",true);
		return;
	}
	//20、转向形式校验
	var steeringType = $.trim($("#steeringType").val());
	if(steeringType.length>100){
		xjValidate.showPopup("转向形式不能超过50个汉字","提示",true);
		return;
	}
	//21、轮距（前）校验
	var wheelBaseBefore = $.trim($("#wheelBaseBefore").val());
	if(wheelBaseBefore.length>20){
		xjValidate.showPopup("轮距（前）不能超过10个汉字","提示",true);
		return;
	}
	//22、轮距（后）校验
	var wheelBaseAfter = $.trim($("#wheelBaseAfter").val());
	if(wheelBaseAfter.length>20){
		xjValidate.showPopup("轮距（后）不能超过10个汉字","提示",true);
		return;
	}
	//23、轮胎数校验
	var wheelNum = $.trim($("#wheelNum").val());
	if(wheelNum.length>20){
		xjValidate.showPopup("轮胎数不能超过10个汉字","提示",true);
		return;
	}
	//24、轮胎规格校验
	var wheelNorms = $.trim($("#wheelNorms").val());
	if(wheelNorms.length>60){
		xjValidate.showPopup("轮胎规格不能超过30个汉字","提示",true);
		return;
	}
	//25、钢板弹簧片数（前）校验
	var sheetNumBefore = $.trim($("#sheetNumBefore").val());
	if(sheetNumBefore.length>20){
		xjValidate.showPopup("钢板弹簧片数（前）不能超过10个汉字","提示",true);
		return;
	}
	//26、钢板弹簧片数（后）校验
	var sheetNumAfter = $.trim($("#sheetNumAfter").val());
	if(sheetNumAfter.length>20){
		xjValidate.showPopup("钢板弹簧片数（后）不能超过10个汉字","提示",true);
		return;
	}
	//27、轴距校验
	var axleDistance = $.trim($("#axleDistance").val());
	if(axleDistance.length>30){
		xjValidate.showPopup("轴距不能超过15个汉字","提示",true);
		return;
	}
	//28、轴数校验
	var axleNum = $.trim($("#axleNum").val());
	if(axleNum.length>30){
		xjValidate.showPopup("轴数不能超过15个汉字","提示",true);
		return;
	}
	//29、外廓尺寸 (长*宽*高)校验
	var gabarite = $.trim($("#gabarite").val());
	if(gabarite==undefined || gabarite==""){
		xjValidate.showPopup("外廓尺寸 (长*宽*高)不能为空","提示",true);
		return;
	}
	if(gabarite.length>100){
		xjValidate.showPopup("外廓尺寸 (长*宽*高)不能超过50个汉字","提示",true);
		return;
	}
	//30、核定载重量校验
	var checkLoad = $.trim($("#checkLoad").val());
	if(checkLoad==undefined || checkLoad==""){
		xjValidate.showPopup("核定载重量不能为空","提示",true);
		return;
	}
	if(checkLoad.length>30){
		xjValidate.showPopup("核定载重量不能超过15个汉字","提示",true);
		return;
	}
	//31、准牵引总质量校验
	var tractionMass = $.trim($("#tractionMass").val());
	if(tractionMass.length>30){
		xjValidate.showPopup("准牵引总质量不能超过15个汉字","提示",true);
		return;
	}
	//32、货箱内部尺寸 (长*宽*高)校验
	var containerSize = $.trim($("#containerSize").val());
	if(containerSize.length>100){
		xjValidate.showPopup("货箱内部尺寸 (长*宽*高)不能超过50个汉字");
		return;
	}
	//33、整备质量校验
	var curbWeight = $.trim($("#curbWeight").val());
	if(curbWeight.length>30){
		xjValidate.showPopup("整备质量不能超过15个汉字","提示",true);
		return;
	}
	//34、使用性质校验
	var useNature = $.trim($("#useNature").val());
	if(useNature.length>100){
		xjValidate.showPopup("使用性质不能超过50个汉字","提示",true);
		return;
	}
	//35、核定油耗校验
	var checkLoad = $.trim($("#checkLoad").val());
	if(checkLoad.length>30){
		xjValidate.showPopup("核定载重量不能超过15个汉字","提示",true);
		return;
	}
	//36、核定载重量校验
	var checkFuel = $.trim($("#checkFuel").val());
	if(checkFuel.length>30){
		xjValidate.showPopup("核定油耗不能超过15个汉字","提示",true);
		return;
	}
	//37、核定载重量校验
	var checkLoad = $.trim($("#checkLoad").val());
	if(checkLoad.length>30){
		xjValidate.showPopup("核定载重量不能超过15个汉字","提示",true);
		return;
	}
	//38、核定载客人数校验
	var checkNum = $.trim($("#checkNum").val());
	if(checkNum.length>10){
		xjValidate.showPopup("核定载客人数不能超过5个汉字","提示",true);
		return;
	}
	//39、驾驶室载客人数校验
	var cabPassengers = $.trim($("#cabPassengers").val());
	if(cabPassengers.length>10){
		xjValidate.showPopup("驾驶室载客人数不能超过5个汉字","提示",true);
		return;
	}
	//40、备注校验
	var remarks= $.trim($("#remarks").text());
	if(remarks!=undefined && remarks!="" && remarks.length>200){
		xjValidate.showPopup("备注信息不能超过100个汉字","提示",true);
		return;
	}
	//同意电子协议
	if(!$("#isCheck").is(":checked")){
		alert("请同意电子协议");
		return;
	}

	$.ajax({
		url : basePath + "/carInfo/addRootCarInfo",
		asyn : false,
		type : "POST",
		data : $('#root_car_info_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					xjValidate.showPopup("保存成功","提示",true);
					window.location.href = basePath+"/carInfo/rootCarInfoInitPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存车辆信息服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
}
