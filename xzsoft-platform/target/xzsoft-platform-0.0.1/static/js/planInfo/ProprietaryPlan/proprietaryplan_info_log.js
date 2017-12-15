//日志操作查看
function findProprietaryPlanLog(id){
	$("#proprietaryPlanInfoLogModel").modal("show");
	proprietaryPlanInfoLogList(1,id);
}

//查询计划日志信息
function proprietaryPlanInfoLogList(number,id){
	
	//禁止多次追加
	$("#proprietaryPlanlogTBody").html("");
	
	$.ajax({
		url:basePath+"/planInfo/findProprietaryPlanInfoLogAllMation",
		data:{"id":id,"page":number-1,"rows":10},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs, function(index, ele) {
				// 追加数据
				var tr = "";
				var opinion =ele.opinion;
				if( opinion==undefined || opinion ==null){
					opinion ='';
				}
				tr += "<tr class='table-body' align='center'>";
				tr += "<td>" + ele.person + "</td>";
				tr += "<td >" + new Date(ele.time).format("yyyy-MM-dd hh:mm:ss") + "</td>";
				tr += "<td>" + ele.operate + "</td>";
				tr += "<td>" + opinion + "</td>";

				// 将tr追加
				$("#proprietaryPlanlogTBody").append(tr);
			});
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url : basePath+"/planInfo/getProprietaryPlanInfoLogAllMationCount",
		type : "post",
		data : {"id":id},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			proprietaryPlanInfoLogPagination.setTotalItems(resp);
			$("#proprietaryPlanlogNum").text(resp);
		}
	});
}
//分页
var proprietaryPlanInfoLogPagination = $(".proprietaryPlan-info-log").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		proprietaryPlanInfoLogList(current);
	}
});

function jumpPPageNum(e) {
	var totalPage = parseInt((parent.getTotalRecords + 9) / 10);
	var myreg = /^[0-9]+.?[0-9]*$/;
	var re = new RegExp(myreg);
	var number = $(e).prev().find('input').val();
	if (!re.test(number)) {
		commonUtil.showPopup("请输入正确的数字!","提示", true);
		$(e).prev().find('input').val("");
		return false;
	}
	var value = parseInt(number);
	if (value < 1) {
		$(e).prev().find('input').val("1")
		value = 1;
	}
	if (value >= totalPage) {
		$(e).prev().find('input').val(totalPage);
		value = totalPage;
	}
	logPagination.setCurrentPage(value);
}
//日期格式转化
Date.prototype.format = function(fmt) { 
    var o = { 
       "M+" : this.getMonth()+1,                 //月份 
       "d+" : this.getDate(),                    //日 
       "h+" : this.getHours(),                   //小时 
       "m+" : this.getMinutes(),                 //分 
       "s+" : this.getSeconds(),                 //秒 
       "q+" : Math.floor((this.getMonth()+3)/3), //季度 
       "S"  : this.getMilliseconds()             //毫秒 
   }; 
   if(/(y+)/.test(fmt)) {
           fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
   }
    for(var k in o) {
       if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
   return fmt; 
} 