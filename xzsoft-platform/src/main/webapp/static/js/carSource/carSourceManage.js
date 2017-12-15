$(function(){
	searchCarSourceInfo(1);
	
	//关闭弹框
	$("body").on("click",".car-source-opt-close",function(){
		$("#show_car_source_info").empty();
	});
	
	//修改车源信息
	$("body").on("click",".modify-operation",function(){
		//车源信息ID
		var carSourceInfoId = $(this).parent().attr("car-source-info-id");
		addOrEditCarSourceInfoPage(carSourceInfoId);
	});
	
	//发布车源信息
	$("body").on("click",".release-operation",function(){
		//车源信息ID
		var carSourceInfoId = $(this).parent().attr("car-source-info-id");
		operateCarSource(carSourceInfoId,1);
	});
	
	//撤回车源信息
	$("body").on("click",".withdraw-operation",function(){
		//车源信息ID
		var carSourceInfoId = $(this).parent().attr("car-source-info-id");
		operateCarSource(carSourceInfoId,2);
	});
	
	//删除车源信息
	$("body").on("click",".delete-operation",function(){
		//车源信息ID
		var carSourceInfoId = $(this).parent().attr("car-source-info-id");
		deleteCarSource(carSourceInfoId);
	});
	
	//全选/全不选
	$("body").on("click",".all_car_source_check",function(){
		if($(".all_car_source_check").is(":checked")){
			//全选时
			$(".sub_car_source_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_car_source_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	
});

/**
 * 发布方初始化
 * 
 * @author luojuan 2017年7月20日
 */
function initReleasePerson(){
	var userRole = $("#userRole").val();
	if(userRole == 2){
		$("#driver_div").hide();
		$("#org_div").show();
	}else if(userRole == 4){
		$("#org_div").hide();
		$("#driver_div").show();
	}
}

/**
 * 绑定上传事件的dom对象
 * @author luojuan 2017年6月5日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn,{
   		action: basePath + '/upload/imageUpload',
   		name: 'myfile',
		dataType: 'json',
   		onSubmit : function(file , ext){
   			//文件上传格式校验
   			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))){
   				xjValidate.showTip("请上传格式为 jpg|png|bmp 的图片");
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
 * 分页查询
 * @author luojaun 2017年6月22日
 * @param number 页数
 */
function pagerGoto(number) {
	searchCarSourceInfo(number);
}

/**
 * 跳转到某页
 * @author luojaun 2017年6月22日
 */
function btnPagerGoto() {
	//取出跳转页码
	var goPage = parseInt($.trim($(".goPage").val()));
	//取出最大页数
	var maxpage = parseInt($(".panel-num").attr("maxpage"));
	//数字正则
	var re = /^[0-9]+.?[0-9]*$/;
	if (!re.test(goPage)) {
		xjValidate.showPopup("请输出正确的数字","提示",true);
		return;
	}
	
	//跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	
	searchCarSourceInfo(goPage);
}

/**
 * 车源信息查询(分页)
 * 
 * @author luojaun 2017年6月20日
 * @param number 页数
 */
function searchCarSourceInfo(number){
	//车牌号码
	var carCode = $.trim($("#s_car_code").val());
	
	//发布方
	var releasePerson = $.trim($("#s_release_person").val());
	
	//车辆类型
	var carType = $("#s_car_type").val();
	
	//发布日期Start
	var releaseTimeStart = $.trim($("#release_time_start").val());
	
	//发布日期End
	var releaseTimeEnd = $.trim($("#release_time_end").val());

	//车源状态（1：已发布 2：已撤回）
	var carSourceStatus = $("#car_source_status").val();
	
	//请求地址
	var url = basePath + "/carSource/showCarSourceInfolistPage #car-source-info-data";
	$("#search-car-source-info").load(url,
		{"page":number,"rows":10,"carCode":carCode,"carSourceStatus":carSourceStatus,"releasePerson":releasePerson,"carType":carType,"releaseTimeStart":releaseTimeStart,"releaseTimeEnd":releaseTimeEnd},
		function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
			  liveDrag:true, 
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging"
			});
			
			//据较多，增加滑动
		    $(".iscroll").css("min-height", "55px");
		    $(".iscroll").mCustomScrollbar({
		      theme: "minimal-dark"
		    });
		})
}

/**
 * 新增/编辑车源信息初始页
 * 
 * @author luojuan 2017年6月20日
 * @param carSourceInfoId 车源信息ID
 */
function addOrEditCarSourceInfoPage(carSourceInfoId){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(carSourceInfoId!=undefined && carSourceInfoId!=""){
		operateType = 2;
	}else{
		operateType = 1;
	}
	//请求地址
	var url = basePath + "/carSource/initCarSourcePage #car-source-data-info";
	$("#show_car_source_info").load(url,{"carSourceInfoId":carSourceInfoId,"operateType":operateType},function(data){
		initReleasePerson();
		//上传图片初始化
		$('.upload_img').each(function(){
			uploadLoadFile($(this));
		})
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
	    if(data==1) {
			$.alert("车源已发布，不可修改！","提示");
		}
	})
}

/**
 * 新增/编辑车源信息
 * 
 * @author luojuan 2017年6月20日
 * @param carSourceInfoId 车源信息ID
 */
function addOrUpdateCarSourceInfo(){
	
	//车牌号码
	var carCode = $.trim($("#car_code").val());
	if(carCode==undefined || carCode==""){
		xjValidate.showTip("车牌号码不能为空");
		return;
	}
	
	if(carCode.length>40){
		xjValidate.showTip("车牌号码不能超过20个汉字");
		return;
	}
	
	//车辆类型
	var carType = $.trim($("#car_type").val());
	if(carType==undefined || carType==""){
		xjValidate.showTip("车牌类型不能为空");
		return;
	}
	
	//车辆图片
	var carImage = $.trim($("#car_image").val());
	if(carImage==undefined || carImage==""){
		xjValidate.showTip("车牌图片不能为空");
		return;
	}
	
	if(carImage.length>600){
		xjValidate.showTip("车辆图片不能超过300个汉字");
		return;
	}
	
	//载重量（吨）
	var loads = $.trim($("#loads").val());
	if(loads==undefined || loads==""){
		xjValidate.showTip("载重量不能为空");
		return;
	}
	
	if(loads.length>30){
		xjValidate.showTip("载重量不能超过30个字符");
		return;
	}
	
	//外廓尺寸（米）
	var gabarite = $.trim($("#gabarite").val());
	if(gabarite==undefined || gabarite==""){
		xjValidate.showTip("外廓尺寸不能为空");
		return;
	}
	
	if(gabarite.length>100){
		xjValidate.showTip("外廓尺寸不能超过100个字符");
		return;
	}
	
	//车辆当前所在地
	var carLocation = $.trim($("#car_location").val());
	if(carLocation==undefined || carLocation==""){
		xjValidate.showTip("车辆当前所在地不能为空");
		return;
	}
	
	if(carLocation.length>100){
		xjValidate.showTip("车辆当前所在地不能超过50个汉字");
		return;
	}
	
	//发布方主机构
	if(userRole == 2){
		var rootReleasePerson = $.trim($("#root_release_person").val());
		alert(rootReleasePerson);
		if(rootReleasePerson==undefined || rootReleasePerson==""){
			xjValidate.showTip("发布方主机构不能为空");
			return;
		}
	}
	
	var userRole = $("#userRole").val();
	if(userRole == 2){
		//发布方
		var releasePerson = $("#release_person").val();
		if(releasePerson==undefined || releasePerson==""){
			xjValidate.showTip("发布方不能为空");
			return;
		}
	}else if(userRole == 4){
		var releasePersonName = $("#release_person_driver").val();
		if(releasePersonName==undefined || releasePersonName==""){
			xjValidate.showTip("发布方不能为空");
			return;
		}
	}
	
	
	
	//联系人
	var contactName = $.trim($("#contact_name").val());
	if(contactName==undefined || contactName==""){
		xjValidate.showTip("联系人姓名不能为空");
		return;
	}
	
	if(contactName.length>100){
		xjValidate.showTip("联系人姓名不能超过50个汉字");
		return;
	}
	
	//联系方式
	var mobilePhone = $.trim($("#mobile_phone").val());
	if(mobilePhone==undefined || mobilePhone==""){
		xjValidate.showTip("移动电话不能为空");
		return;
	}
	
	var myreg = /^1[34578]\d{9}$/; 
	if(!myreg.test(mobilePhone)){
		xjValidate.showTip("请输入有效的手机号");
		return;
	}
	
	//截止日期
	var endEime = $.trim($("#end_time").val());
	if(endEime==undefined || endEime==""){
		xjValidate.showTip("截止日期不能为空");
		return;
	}
	
	//发布内容
	var releaseContent = $.trim($("#release_content").val());
	if(releaseContent==undefined || releaseContent==""){
		xjValidate.showTip("发布内容不能为空");
		return;
	}
	
	if(releaseContent.length>200){
		xjValidate.showTip("发布内容不能超过100个汉字");
		return;
	}
	
	//新增/编辑车源信息
	$.ajax({
		url : basePath + "/carSource/addOrUpdateCarSourceInfo",
		asyn : false,
		type : "POST",
		data : $('#car_source_info_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#show_car_source_info").empty();
					//刷新页面
					window.location.href = basePath + "/carSource/rootCarSourceInfolistPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存车源信息服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
}

/**
 * 发布/撤回勾选的车源信息
 * 
 * @author luojuan 2017年6月22日
 * @returns 车源信息ID，逗号分隔
 */
function operateCheckedCarSource(operateType){
	var carSourceInfoIds = findAllCheckCarSourceIds();
	if(carSourceInfoIds==undefined || carSourceInfoIds==""){
		xjValidate.showPopup("请选择需要操作的车源信息","提示",true);
		return;
	}
	
	//根据车源ID启用/停用车源信息
	operateCarSource(carSourceInfoIds,operateType);
}

/**
 *发布/撤回车源信息
 * 
 * @author luojuan 2017年6月21日
 * @returns 车源信息ID，逗号分隔
 */
function operateCarSource(carSourceInfoIds,operateType){
	
	//操作名称
	var operateName;
	if(operateType==1){
		operateName="发布";
	}else if(operateType==2){
		operateName="撤回";
	}
	//发布/撤回车源信息
	$.confirm({
		title: "提示",
		content: "是否确认"+operateName+"所选车源",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/carSource/operateCarSource",
	    			asyn : false,
	    			type : "POST",
	    			data : {"carSourceInfoIds":carSourceInfoIds,"operateType":operateType},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						window.location.href = basePath + "/carSource/rootCarSourceInfolistPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup("操作车源信息服务异常忙，请稍后重试","提示",true);
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
 * 删除勾选的车源信息
 * 
 * @author luojuan 2017年6月22日
 * @returns 车源信息ID，逗号分隔
 */
function deleteCheckedCarSource(){
	var carSourceInfoIds = findAllCheckCarSourceIds();
	if(carSourceInfoIds==undefined || carSourceInfoIds==""){
		xjValidate.showPopup("请选择需要删除的车源信息","提示",true);
		return;
	}
	
	//根据车源ID删除车源信息
	deleteCarSource(carSourceInfoIds);
}

/**
 * 删除车源信息
 * 
 * @author luojuan 2017年6月22日
 * @returns 车源信息ID，逗号分隔
 */
function deleteCarSource(carSourceInfoIds){
	
	$.confirm({
		title: "提示",
		content: "是否删除所选车源",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/carSource/deleteCarSourceInfo",
	    			asyn : false,
	    			type : "POST",
	    			data : {"carSourceInfoIds":carSourceInfoIds},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						window.location.href = basePath + "/carSource/rootCarSourceInfolistPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup("删除车源信息服务异常忙，请稍后重试","提示",true);
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
 * 获取所有选中的车源信息ID
 * 
 * @author luojuan 2017年6月21日
 * @returns 车源信息ID，逗号分隔
 */
function findAllCheckCarSourceIds(){
	//所有选中车源信息ID
	var carSourceInfoIds = new Array();
	$(".sub_car_source_check").each(function(){
		if($(this).is(":checked")){
			carSourceInfoIds.push($(this).attr("data-id"))
		}
	});
	
	return carSourceInfoIds.join(",");
}

/**
 * 搜索车辆信息
 * 
 * @author luojuan 2017年6月23日
 */
function searchCarInfo(){
	//请求地址
	var url = basePath + "/carSource/searchCarInfoListPage #listInfo";
	$("#show_car_info").load(url,{},function(){
		
		// 绑定项目输入框
		$("body").on("click", ".car-opt-close", function() {
			$("#show_car_info").empty();
		});
		
		carList(1);
		
		// 绑定委托方输入框
		$("body").on("click", ".sub_car_check", function() {
			var isChecked = $(this).is(":checked");
			$(".sub_car_check").prop("checked", false);
			if (isChecked) {
				$(this).prop("checked", isChecked);
			} else {
				$(this).prop("checked", isChecked);
			}
		});
		
	})
}
//车辆信息选择确认

function carSelect() {
	$(".sub_car_check").each(function() {
		if ($(this).is(":checked")) {
			$("#car_code").val($(this).attr("carCodeName"));
			$("#car_code_id").val($(this).attr("carInfoId"));
			$("#car_type").val($(this).attr("carType"));
			$("#car_type_name").val($(this).attr("carTypeName"));
			$("#loads").val($(this).attr("loads"));
			$("#gabarite").val($(this).attr("gabarite"));
			//alert($(this).attr("carTypeName"));
			return false;
		}
	});
	$("#show_car_info").empty();
}

/*--------线路选择-----------*/
//初始化默认值
var defaultProvinceId =65;
var defaultProvinceName ="新疆维吾尔自治区";
var defaultCityId = 6501;
var defaultCityName = "乌鲁木齐市";
var selectElement = null;

/**
* 调用省函数，显示弹出框
*/
function addLineData(e) {
	  getProvince();
	  selectElement = e;
	  $(e).next(".address-box").show();
	  $(e).next(".address-box").unbind().bind("mouseleave",function() {
		  $(this).hide();
	  })
}

/**
* 获取省信息
*/
function getProvince () {
//查询所有的省
	$.ajax({
		url : basePath + "/locationInfo/findLocationProvince", 
		asyn : false,
		type : "POST",
		dataType : "json" ,
		success : function(data) {
			 var html ="";
		      for (var i=0; i<data.length; i++) {
		         html += '<div class="name" onclick="getCity(\''+data[i].provinceId+'\',\''+data[i].province+'\')">'+data[i].province+'</div>';
		      }
		      $(selectElement).next(".address-box").find(".address-content").html(html);
		      $(selectElement).next(".address-box").find(".tab-list").removeClass('active');
		      $(selectElement).next(".address-box").find(".tab-list").eq(0).addClass('active');
		}
	});
  
}

/**
* 获取市信息,传省的id和省的名称
*/
function getCity(id,name) {
 if(!id) {
   id = defaultProvinceId;
 } else {
 	defaultProvinceId = id;
 }
 if(name) {
 	defaultProvinceName = name;
 	$(selectElement).text(defaultProvinceName);
 }
 
 //查询所有的市
	$.ajax({
		url : basePath + "/locationInfo/findLocationCityByProvince", 
		asyn : false,
		type : "POST",
		data:{
		  startPoints:id
		},
		dataType : "json" ,
		success : function(data) {
		  	var html ="";
		    for (var i=0; i<data.length; i++) {
		        html += '<div class="name" onclick="getArea(\''+data[i].cityId+'\',\''+data[i].city+'\')">'+data[i].city+'</div>';
		    }
		    $(selectElement).next(".address-box").find(".address-content").html(html);
		    $(selectElement).next(".address-box").find(".tab-list").removeClass('active');
		    $(selectElement).next(".address-box").find(".tab-list").eq(1).addClass('active');
		    
		}
	});

}

/**
* 获取区域信息,传市的id和市的名称
*/
function getArea (id,name) {
	  
  if(!id) {
   id = defaultCityId;
 } else {
 	defaultCityId = id;
 }
  
 if(name) {
 	defaultCityName = name;
 	 $(selectElement).text(defaultProvinceName+"/"+defaultCityName);
 }

  //查询所有的区
	$.ajax({
		url : basePath + "/locationInfo/findLocationCountyByCity", 
		asyn : false,
		type : "POST",
		data:{
		  startPoints:id
		},
		dataType : "json" ,
		success : function(data) {
		 	var html ="";
		    for (var i=0; i<data.length; i++) {
		       html += '<div class="name" onclick="selectAddress(\''+data[i].id+'\',\''+data[i].county+'\')">'+data[i].county+'</div>';
		    }
		    $(selectElement).next(".address-box").find(".address-content").html(html);
		    $(selectElement).next(".address-box").find(".tab-list").removeClass('active');
		    $(selectElement).next(".address-box").find(".tab-list").eq(2).addClass('active');
		}
	});
}

/**
* 获取区信息,当前数据的id值和区域名称
*/
function selectAddress(id,name) {
	  $(selectElement).siblings("input").val(id);
	  $(selectElement).text(defaultProvinceName+"/"+defaultCityName+"/"+name);
	  $(selectElement).next(".address-box").hide();
}