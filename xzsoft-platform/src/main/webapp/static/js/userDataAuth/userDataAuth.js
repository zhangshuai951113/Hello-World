
$(function(){
	//搜索
	searchUserDataAuthList(1);
	
	// 取消授权
	$("body").on("click",".cancel-auth-operation",function(){
		var id = $(this).parent().attr("data-id");
		//主键ID存在则进行编辑
		if(id != null && id!=""){
			cancelAuthUserDataAuth(id);
		}
	});

});

/**
 * 根据页数查询机构
 * @param number 页数
 */
function searchUserDataAuthList(number){
	//授权用户
	var authUser = $.trim($("#authUser").val());
	//请求地址
	var url = basePath + "/dataAuth/listUserDataAuth #user_data_auth";
	var params = {"page":number,"rows":10,"authUser":authUser};
	$("#search_user_data_auth").load(url, params,function(){
		//允许表格拖着
		$("#tableDrag").colResizable({
			  liveDrag:true, 
			  partialRefresh:true,
			  gripInnerHtml:"<div class='grip'></div>", 
			  draggingClass:"dragging",
			  resizeMode: 'overflow'
		});
	})
	$.ajax({
		url:basePath + "/dataAuth/listUserDataAuthCount",
		data:{"authUser":authUser},
		dataType:"JSON",
		type:"POST",
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
		  searchUserDataAuthList(current);
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
 * 分页查询
 * @author luojaun 2017年6月22日
 * @param number 页数
 */
function pagerGoto(number) {
	searchUserDataAuthList(number);
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
	searchUserDataAuthList(goPage);
}

