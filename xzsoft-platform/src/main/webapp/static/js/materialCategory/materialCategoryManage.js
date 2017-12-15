$(function(){
	searchMaterialCategory(1);
	
	//关闭弹框
	$("body").on("click",".material-category-opt-close",function(){
		$("#show_material_category").empty();
	});
	
	//新增子物资分类
	$("body").on("click",".add-operation",function(){
		//物资分类ID
		var materialCategoryId = $(this).parent().data("id");
		var parentMaterialCategoryId = $(this).parent().data("parentid");
		if(materialCategoryId && materialCategoryId!=""){
			addOrEditMaterialCategoryPage(materialCategoryId,parentMaterialCategoryId);
		}
	});
	
	//修改
	$("body").on("click",".modify-operation",function(){
		//物资分类ID
		var materialCategoryId = $(this).parent().data("id");
		if(materialCategoryId && materialCategoryId!=""){
			addOrEditMaterialCategoryPage(materialCategoryId,null);
		}
	});
	
	//删除
	$("body").on("click",".delete-operation",function(){
		//物资分类ID
		var materialCategoryId = $(this).parent().data("id");
		if(materialCategoryId && materialCategoryId!=""){
			deleteMaterialCategoryPage(materialCategoryId);
		}
	});
})

/**
 * 分页查询
 * @author luojaun 2017年6月22日
 * @param number 页数
 */
function pagerGoto(number) {
	searchMaterialCategory(number);
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
	
	searchMaterialCategory(goPage);
}


/**
*分页查询物资类别页面
*
*@author luojuan 2017年7月6日
*@param number 页数
*/
function searchMaterialCategory(number){
	//物资类别
	var materialType = $.trim($("#s_material_type").val());
	
	//请求地址
	var url = basePath + "/materialCategory/showMaterialCategorylistPage #material-category-data";
	$("#search-material-category").load(url,
		{"page":number,"rows":10,"materialType":materialType},
		function(){
			//允许表格拖着
			$("#tableDrag").colResizable({
			  liveDrag:true, 
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging"
			});
		})
}

/**
 * 新增/编辑物资类别初始页
 * @param materialCategoryId 物资类别ID
 * @author luojuan 2017年7月6日
 */
function addOrEditMaterialCategoryPage(materialCategoryId,parentMaterialCategoryId){
	//定义封装操作类型 1:新增物资类别 2:新增物资类别(第二级) 3:编辑
	var operateType;
	if(materialCategoryId!=undefined && materialCategoryId!=""&&parentMaterialCategoryId!=undefined){
		operateType = 2;
	}else if(materialCategoryId!=undefined && materialCategoryId!=""){
		operateType = 3;
	}else{
		operateType = 1;
	}
	
	//请求地址
	var url = basePath + "/materialCategory/initMaterialCategoryPage #material-category-data";
	$("#show_material_category").load(url,{"materialCategoryId":materialCategoryId,"parentMaterialCategoryId":parentMaterialCategoryId,"operateType":operateType},function(){
	})
}

/**
 * 新增/编辑物资类别
 * 
 * @author luojuan 2017年7月6日
 * 
 */
function addOrUpdateMaterialCategory(){
	//校验物资类别
	var materialType = $.trim($("#material_type").val());
	if(materialType==undefined || materialType==""){
		xjValidate.showTip("物资类别不能为空");
		return;
	}
	
	if(materialType.length>60){
		xjValidate.showTip("物资类别不能超过30个汉字");
		return;
	}
	//新增/编辑物资类别
	$.ajax({
		url : basePath + "/materialCategory/addOrUpdateMaterialCategory",
		asyn : false,
		type : "POST",
		data : $('#material_category_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//关闭弹框
					$("#show_material_category").empty();
					//刷新页面
					window.location.href = basePath + "/materialCategory/rootMaterialCategorylistPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存物资类别服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
}
/**
 * 删除勾选的物资类别
 * 
 * @author luojuan 2017年7月7日
 */
function deleteCheckedMaterialCategory(){
	//所有选中物资类别ID
	var materialCategoryIds = findAllCheckMaterialCategoryIds();
	if(materialCategoryIds==undefined || materialCategoryIds==""){
		xjValidate.showPopup("请选择需要操作的物资类别","提示",true);
		return;
	}
	//根据物资类别ID删除物资类别信息
	deleteMaterialCategoryPage(materialCategoryIds);
}

/**
 * 删除物资类别
 * 
 * @author luojuan 2017年7月7日
 */
function deleteMaterialCategoryPage(materialCategoryIds){

	//校验物资类别ID不能为空
	if (materialCategoryIds == null) {
		xjValidate.showPopup("所选物资类别信息不能为空！","提示",true);
		return;
	}
	
	$.confirm({
		title: "提示",
		content: "是否要删除该数据？",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/materialCategory/deleteMaterialCategory",
	    			asyn : false,
	    			type : "POST",
	    			data : {"materialCategoryIds":materialCategoryIds},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						xjValidate.showPopup("删除成功","提示",true);
	    						//刷新页面
	    						window.location.href = basePath+"/materialCategory/rootMaterialCategorylistPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup("删除物资类别信息异常，请稍后重试","提示",true);
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
 * 获取所有选中的物资类别ID
 * 
 * @author luojuan 2017年7月7日
 * @param materialCategoryIds 物资类别ID，逗号分隔
 */
function findAllCheckMaterialCategoryIds(){
	//所有选中物资类别ID
	var materialCategoryIds = new Array();
	$(".sub_materialCategory_check").each(function(){
		if($(this).is(":checked")){
			materialCategoryIds.push($(this).attr("data-id"))
		}
	});
	
	return materialCategoryIds.join(",");
}

/**
 * 获取所有选中的货物信息ID
 * 
 * @author luojuan 2017年7月7日
 * @param goodsInfoIds 货物信息ID，逗号分隔
 */
function findAllCheckGoodsInfoIds(){
	//所有选中货物信息ID
	var goodsInfoIds = new Array();
	$(".sub_goods_check").each(function(){
		if($(this).is(":checked")){
			goodsInfoIds.push($(this).attr("goodsInfoId"))
		}
	});
	
	return goodsInfoIds.join(",");
}

/**
 * 维护货物类别
 * 
 * @author luojuan 2017年7月7日
 * @returns 物资类别ID，逗号分隔
 */
function maintenanceOfGoods(){
	//所有选中物资类别ID
	var materialCategoryIds = findAllCheckMaterialCategoryIds();
	if(materialCategoryIds==undefined || materialCategoryIds==""){
		xjValidate.showPopup("请选择需要操作的物资类别","提示",true);
		return;
	}
	
	//请求地址
	var url = basePath + "/materialCategory/searchGoodsInfoListPage #listInfo";
	$("#show_maintenance_of_goods").load(url,{},function(){
		// 关闭弹框
		$("body").on("click", ".goods-opt-close", function() {
			$("#show_maintenance_of_goods").empty();
		});
		
		goodsList(1);
	})
}

/**
 * 货物信息选择确认
 */
function goodsSelect(){
	var goodsInfoIds = findAllCheckGoodsInfoIds();
	//所有选中物资类别ID
	var materialCategoryIds = findAllCheckMaterialCategoryIds();
	$.ajax({
		url : basePath + "/materialCategory/updateMaintenanceOfGoods",
		asyn : false,
		type : "POST",
		data : {"goodsInfoIds":goodsInfoIds,"materialCategoryIds":materialCategoryIds},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					xjValidate.showPopup("货物维护物资类别成功","提示",true);
					//刷新页面
					window.location.href = basePath+"/materialCategory/rootMaterialCategorylistPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("货物维护物资类别信息异常，请稍后重试","提示",true);
				return;
			}
		}
	});
	$("#show_maintenance_of_goods").empty();
}