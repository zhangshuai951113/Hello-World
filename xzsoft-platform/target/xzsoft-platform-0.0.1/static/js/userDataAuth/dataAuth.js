
$(function(){
	//搜索
	searchDataAuthList(1);
	
	// 授权
	$("body").on("click",".authorization-operation",function(){
		var id = $(this).parent().attr("data-auth-id");
		temp_data_auth_id = id;
		//主键ID存在则进行编辑
		if(id != null && id!=""){
			userSelect();
		}
	});
	// 修改
	$("body").on("click",".modify-operation",function(){
		var id = $(this).parent().attr("data-auth-id");
		//主键ID存在则进行编辑
		if(id != null && id!=""){
			showEditView(id);
		}
	});
	// 删除
	$("body").on("click",".delete-operation",function(){
		var ids = $(this).parent().attr("data-auth-id");
		
		//主键ID存在则进行编辑
		if(ids != null && ids!=""){
			deleteDataAuth(ids);
		}
	});
	 //运单零散货物数据较多，增加滑动
    $(".iscroll").css("min-height", "55px");
    $(".iscroll").mCustomScrollbar({
      theme: "minimal-dark"
    });
});

/**
 * 根据页数查询机构
 * @param number 页数
 */
function searchDataAuthList(number){
	//客户
	var customerName = $.trim($("#customerName").val());
	//货物
	var goodsName = $.trim($("#goodsName").val());
	//线路
	var lineName = $.trim($("#lineName").val());
	
	//请求地址
	var url = basePath + "/dataAuth/listDataAuth #data_auth";
	var params = {"page":number,"rows":10,"customerName":customerName,"goodsName":goodsName,"lineName":lineName};
	$("#search_data_auth").load(url, params,function(){
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

//数据权限模糊查询重置
function resetDataAuth(){
	setTimeout(function(){
		searchDataAuthList(1);
	});
}

/**
 * 分页查询
 * @author luojaun 2017年6月22日
 * @param number 页数
 */
function pagerGoto(number) {
	searchDataAuthList(number);
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
		commonUtil.showPopup("提示","请输出正确的数字");
		return;
	}
	
	//跳转页码不可大于最大页数
	if (goPage > maxpage) {
		goPage = maxpage;
	}
	
	searchDataAuthList(goPage);
}