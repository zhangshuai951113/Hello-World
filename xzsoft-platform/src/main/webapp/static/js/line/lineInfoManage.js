$(function(){
	//搜索
	searchLineInfo(1);
	
	//关闭弹框
	$("body").on("click",".line-opt-close",function(){
		$("#show_line_info").empty();
	});
	
	//编辑线路
	$("body").on("click",".modify-operation",function(){
		//线路ID
		var lineInfoId = $(this).parent().attr("line-info-id");
		if(lineInfoId && lineInfoId!=""){
			addOrEditLineInfoPage(lineInfoId);
		}
	});
	
	//删除线路
	$("body").on("click",".delete-operation",function(){
		//线路ID
		var lineInfoId = $(this).parent().attr("line-info-id");
		if(lineInfoId && lineInfoId!=""){
			deleteLineInfoPage(lineInfoId);
		}
	});
	
	//启用线路
	$("body").on("click",".enabled-operation",function(){
		//线路ID
		var lineInfoId = $(this).parent().attr("line-info-id");
		operateLine(lineInfoId,0);
	});
	
	//停用线路
	$("body").on("click",".disable-operation",function(){
		//线路ID
		var lineInfoId = $(this).parent().attr("line-info-id");
		operateLine(lineInfoId,1);
	});
	
	//全选/全不选
	$("body").on("click",".all_line_check",function(){
		if($(".all_line_check").is(":checked")){
			//全选时
			$(".sub_line_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_line_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});


/**
 * 分页查询
 * @author luojaun 2017年6月22日
 * @param number 页数
 */
function pagerGoto(number) {
	searchLineInfo(number);
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
	
	searchLineInfo(goPage);
}

/**
*分页查询线路管理页面
*
*@author luojuan 2017年6月16日
*@param number 页数
*/
function searchLineInfo(number){
	//线路名称
	var lineName = $.trim($("#lineName").val());
	//起点
	var startPoints = $.trim($("#startPoints").val());
	//终点
	var endPoints = $.trim($("#endPoints").val());
	//运距(公里)起始
	var distanceStart = $.trim($("#distanceStart").val());
	//运距(公里)终点
	var distanceEnd = $.trim($("#distanceEnd").val());
	//线路状态
	var lineStatus = $("#lineStatus").val();
	
	$('#search-line-info').empty();
	//请求地址
	var url = basePath + "/line/showLineInfolistPage #line-info-data";
	$("#search-line-info").load(url,
		{"page":number,"rows":10,"lineStatus":lineStatus,"lineName":lineName,"startPoints":startPoints,"endPoints":endPoints,
		"distanceStart":distanceStart,"distanceEnd":distanceEnd},
		function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
			  liveDrag:true, 
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging",
			  resizeMode: 'overflow',
			 ifDel: 'tableDrag'
			});
		})
}

/**
 * 新增/编辑线路信息初始页
 * @param lineInfoId 线路ID
 * @author luojuan 2017年6月17日
 */
function addOrEditLineInfoPage(lineInfoId){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(lineInfoId!=undefined && lineInfoId!=""){
		operateType = 2;
	}else{
		operateType = 1;
	}
	
	//请求地址
	var url = basePath + "/line/initLinePage #line-data-info";
	$("#show_line_info").load(url,{"lineInfoId":lineInfoId,"operateType":operateType},function(){
	})
}

/**
 * 新增/编辑线路信息
 * @author luojuan 2017年6月17日
 */
function addOrUpdateLineInfo(){
	//线路名称
	var lineName = $.trim($("#line_name").val());
	if(lineName==undefined || lineName==""){
		xjValidate.showTip("线路名称不能为空");
		return;
	}
	
	if(lineName.length>200){
		xjValidate.showTip("线路名称不能超过100个汉字");
		return;
	}
	
	//起点
	var locationLongitudeStart = $.trim($("#locationLongitudeStart").val());
	if(locationLongitudeStart == null){
		var startPoints = $.trim($("#start_points").val());
		if(startPoints==undefined || startPoints==""){
			xjValidate.showTip("起点不能为空");
			return;
		}
		
		if(startPoints.length>50){
			xjValidate.showTip("起点不能超过25个汉字");
			return;
		}
	}
	
	//终点
	var locationLongitudeEnd = $.trim($("#locationLongitudeEnd").val());
	if(locationLongitudeEnd == null){
		var endPoints = $.trim($("#end_points").val());
		if(endPoints==undefined || endPoints==""){
			xjValidate.showTip("终点不能为空");
			return;
		}
		
		if(endPoints.length>50){
			xjValidate.showTip("终点不能超过25个汉字");
			return;
		}
	}
	
	//运距(公里)
	var distance = $.trim($("#distance").val());
	if(distance==undefined || distance==""){
		xjValidate.showTip("运距(公里)不能为空");
		return;
	}
	
	if(distance.length>20){
		xjValidate.showTip("运距(公里)不能超过10个汉字");
		return;
	}
	
	//在途天数
	var days = $.trim($("#days").val());
	if(days==undefined || days==""){
		xjValidate.showTip("在途天数不能为空");
		return;
	}
	
	if(days.length>20){
		xjValidate.showTip("在途天数不能超过10个汉字");
		return;
	}
	
	$('#startCityName').val($('#startLine').text());
	$('#endCityName').val($('#endLine').text());
	//新增/编辑线路信息
	$.ajax({
		url : basePath + "/line/addOrUpdateLine",
		asyn : false,
		type : "POST",
		data : $('#line_info_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#show_line_info").empty();
					//刷新页面
					window.location.href = basePath + "/line/rootLineInfolistPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存线路信息服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
}

/**
 * 删除勾选的线路信息
 * 
 * @author luojuan 2017年6月19日
 * @param lineInfoIds 线路ID，逗号分隔
 */
function deleteCheckedLineInfo(){
	//所有选中线路ID
	var lineInfoIds = findAllCheckLineIds();
	if(lineInfoIds==undefined || lineInfoIds==""){
		xjValidate.showPopup("请选择需要操作的线路","提示",true);
		return;
	}
	
	//根据线路ID删除线路
	deleteLineInfoPage(lineInfoIds);
}

/**
 * 删除线路信息
 * 
 * @author luojuan 2017年6月18日
 * @param lineInfoId 线路ID，逗号分隔
 */
function deleteLineInfoPage(lineInfoIds){
	//校验线路ID不能为空
	if (lineInfoIds == null) {
		xjValidate.showPopup( "所选线路信息不能为空！","提示",true);
		return;
	}
	
	$.confirm({
		title: "提示",
		content: "是否要删除该数据？",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/line/deleteLineInfo",
	    			asyn : false,
	    			type : "POST",
	    			data : {"lineInfoIds":lineInfoIds},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						xjValidate.showPopup("删除成功","提示",true);
	    						//刷新页面
	    						window.location.href = basePath+"/line/rootLineInfolistPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup("删除线路信息异常，请稍后重试","提示",true);
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
 * 启用/停用/注销勾选线路
 * @param operateType 操作类型 0:启用 1:停用
 */
function operateCheckedLine(operateType){
	//所有选中线路ID
	var lineInfoIds = findAllCheckLineIds();
	if(lineInfoIds==undefined || lineInfoIds==""){
		xjValidate.showPopup("请选择需要操作的线路","提示",true);
		return;
	}
	
	//根据线路ID启用/停用/注销用户
	operateLine(lineInfoIds,operateType);
}

/**
 * 根据线路ID启用/停用线路
 * 
 * @author luojuan 2017年6月18日
 */
function operateLine(lineInfoIds,operateType){
	//操作名称
	var operateName;
	if(operateType==0){
		operateName="启用";
	}else if(operateType==1){
		operateName="停用";
	}
	
	//根据线路ID启用/停用线路
	$.confirm({
		title: "提示",
		content: "是否确认"+operateName+"所选线路",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/line/operateLine",
	    			asyn : false,
	    			type : "POST",
	    			data : {"lineInfoIds":lineInfoIds,"operateType":operateType},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						window.location.href = basePath + "/line/rootLineInfolistPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup(operateName+"线路服务异常忙，请稍后重试","提示",true);
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
 * 获取所有选中的线路ID
 * 
 * @author luojuan 2017年6月18日
 * @returns 线路ID，逗号分隔
 */
function findAllCheckLineIds(){
	//所有选中线路ID
	var lineInfoIds = new Array();
	$(".sub_line_check").each(function(){
		if($(this).is(":checked")){
			lineInfoIds.push($(this).attr("data-id"))
		}
	});
	
	return lineInfoIds.join(",");
}

/**
 * TODO 起点和终点的地点查询
 */
function searchLocation(){
	var startPoints = $.trim($("#start_points").val());
	//查询省名
	$.ajax({
		url : basePath + "/locationInfo/findLocationProvince",//由省查到市	findLocationCityByProvince  //根据市名查询区   findLocationCountyByCity
		asyn : false,
		type : "POST",
		data : {"startPoints":startPoints},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存线路信息服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
	
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
