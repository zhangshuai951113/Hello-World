$(function(){
	searchSupplyOfGoods(1);
	
	//关闭弹框
	$("body").on("click",".offer-opt-close",function(){
		$("#show_supply_of_goods").empty();
	});
	
	//修改货源报价信息
	$("body").on("click",".modify-operation",function(){
		//车源信息ID
		var waybillSourceInfoId = $(this).parent().attr("waybill-source-info-id");
		
		addOrEditOfferInfo(waybillSourceInfoId);
	});
	
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
	  }, 500);
});

/**
 * 重置搜索栏
 * 
 * @author liumin
 */
function resetEmpty() {
  //清除重置线路
  $(".select-address").empty();
  $(".select-address").siblings("input").val("");
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
   					// 图片类型
					var imgType = btn.attr("img-type");
					var imgText = btn.attr("img-text");
					btn.attr("src", fastdfsServer + "/" + uploadUrl);
					$("#" + imgType).val(uploadUrl);
					$("#" + imgText).text(file);
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
 * 报价方初始化
 * 
 * @author luojuan 2017年8月8日
 */
function initOfferParty(){
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
 * 分页查询
 * @author luojaun 2017年6月26日
 * @param number 页数
 */
function pagerGoto(number) {
	searchSupplyOfGoods(number);
}

/**
 * 跳转到某页
 * @author luojaun 2017年6月26日
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
	searchSupplyOfGoods(goPage);
}

/**
 * 货源信息查询(分页)
 * 
 * @author luojaun 2017年6月24日
 * @param number 页数
 */
function searchSupplyOfGoods(number){
	
	//货物
	var goodsName = $.trim($("#s_goods_info_id").val());
	
	//委托方
	var entrust = $.trim($("#s_entrust").val());
	
	//发货单位
	var forwardingUnit = $.trim($("#s_forwarding_unit").val());
	
	//到货单位
	var consignee = $.trim($("#s_consignee").val());
	
	//计划拉运日期Start
	var planTransportDateStart = $.trim($("#plan_transport_date_start").val());
	
	//计划拉运日期End
	var planTransportDateEnd = $.trim($("#plan_transport_date_end").val());
	
	//线路Start
	var lineStartPoint = $("#line_start_point").val();
	
	//线路End
	var lineEndPoint = $.trim($("#line_end_point").val());
	
	//请求地址
	var url = basePath + "/supplyOfGoods/showSupplyOfGoodslistPage #supply-of-goods-data";
	var params = {
		"page":number,
		"rows":10,
		"goodsName":goodsName,
		"entrust":entrust,
		"forwardingUnit":forwardingUnit,
		"consignee":consignee,
		"planTransportDateStart":planTransportDateStart,
		"planTransportDateEnd":planTransportDateEnd,
		"lineStartPoint":lineStartPoint,
		"lineEndPoint":lineEndPoint
	};
	$("#search-supply-of-goods").load(url,params,function(){
		//允许表格拖着
		setTimeout(function(){
			$("#tableDrag").colResizable({
				liveDrag:true,
				gripInnerHtml:"<div class='grip'></div>", 
				draggingClass:"dragging",
				resizeMode: 'overflow',
				  ifDel: 'tableDrag'

			});
		},500);
	});
}

/**
 * 货源信息参与报价初始化页面
 * 
 * @author luojaun 2017年6月26日
 * @param waybillSourceInfoId 货源信息ID
 */
function addOrEditOfferInfo(waybillSourceInfoId){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(waybillSourceInfoId==undefined && waybillSourceInfoId==""){
		return;
	}
	//请求地址
	var url = basePath + "/supplyOfGoods/initWaybillSourcePage #supply-of-goods-data-info";
	$("#show_supply_of_goods").load(url,{"waybillSourceInfoId":waybillSourceInfoId,"operateType":operateType},function(data){
		initOfferParty();
		//上传图片初始化
		$('.upload_img').each(function(){
			uploadLoadFile($(this));
		})
		if(data==1) {
			//关闭弹框
			$("#show_waybill_source_info").empty();
			xjValidate.showPopup("本机构运单不可参与报价！","提示",true);
		}
	})
	
}


/**
 * 货源信息参与报价
 */
function addOrUpdateOfferInfo(){
	
	//运单主键ID
	var waybillInfoId = $("#hidden_waybill_info_id").val();
	
	var userRole = $("#userRole").val();
	
	if(userRole == 2){
		//报价方
		var offerParty =$("#offer_party").val();
		if(offerParty==undefined || offerParty==""){
			xjValidate.showTip("报价方不能为空");
			return;
		}
	}else if(userRole == 4){
		var offerParty =$("#offer_party_driver").val();
		if(offerParty==undefined || offerParty==""){
			xjValidate.showTip("报价方不能为空");
			return;
		}
	}
	
	//报价
	var offerPrice =$("#offer_price").val();
	if(offerPrice==undefined || offerPrice==""){
		xjValidate.showTip("报价不能为空");
		return;
	}
	
	var offerPricereg = /^[1-9]\d*(\.\d+)?$/;
	if(!offerPricereg.test(offerPrice)){
		xjValidate.showTip("报价不能小于0");
		return;
	}
	
	//新增/编辑货源信息
	$.ajax({
		url : basePath + "/supplyOfGoods/addOrUpdateOfferInfo",
		asyn : false,
		type : "POST",
		data : $('#offer_info_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#show_waybill_source_info").empty();
					//刷新页面
					window.location.href = basePath + "/supplyOfGoods/rootSupplyOfGoodsListPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存货源报价信息服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
	
}

/**
 * 搜索报价方
 * 
 * @author luojuan 2017年6月27日
 */
function searchOfferInfo(){
	//请求地址
	var url = basePath + "/supplyOfGoods/searchOfferPartyListPage #listInfo";
	$("#show_offer_party_info").load(url,{},function(){
		// 绑定项目输入框
		$("body").on("click", ".offer-party-opt-close", function() {
			$("#show_offer_party_info").empty();
		});
		
		offerPartyList(1);
		
		// 绑定委托方输入框
		$("body").on("click", ".sub_offer_party_check", function() {
			var isChecked = $(this).is(":checked");
			$(".sub_offer_party_check").prop("checked", false);
			if (isChecked) {
				$(this).prop("checked", isChecked);
			} else {
				$(this).prop("checked", isChecked);
			}
		});
	})
}

/**
 * 报价方信息选择确认
 * 
 * @author luojuan 2017年6月27日
 */
function offerPartySelect() {
	$(".sub_offer_party_check").each(function() {
		if ($(this).is(":checked")) {
			$("#offer_party").val($(this).attr("orgInfoId"));
			$("#offer_party_name").val($(this).attr("orgName"));
			//alert($(this).attr("orgInfoId"));
			return false;
		}
	});
	$("#show_offer_party_info").empty();
}

