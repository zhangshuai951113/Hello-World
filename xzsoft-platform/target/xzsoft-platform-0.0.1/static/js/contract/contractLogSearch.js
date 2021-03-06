//合同日志查询
var contractInfoIdForLog ="";
function logList(number) {
	$("#logTBody").html("");
	$.ajax({
		url : "getContractLogData",
		data : {
			'page' : number,
			'contractInfoId' : contractInfoIdForLog,
			'rows' : 10
		},
		dataType : "json",
		type : "post",
		async : false,
		success : function(resp) {
			var objs = eval(resp);
			$.each(objs, function(index, ele) {
				// 追加数据
				var tr = "";
				var opinion =ele.opinion;
				if( opinion==undefined || opinion ==null){
					opinion ="无";
				}
				tr += "<tr class='table-body' align='center'>";
				tr += "<td>" + ele.person + "</td>";
				tr += "<td >" + new Date(ele.time).format("yyyy-MM-dd hh:mm:ss") + "</td>";
				tr += "<td>" + ele.operate + "</td>";
				tr += "<td>" + opinion + "</td>";

				// 将tr追加
				$("#logTBody").append(tr);

			});
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url : "getContractLogCount",
		type : "post",
		data : {"contractInfoId":contractInfoIdForLog},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			logPagination.setTotalItems(resp);
			$("#logNum").text(resp);
		}
	});

}

// 分页
var logPagination = $(".log-pagination-list").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		logList(current);
	}
});

function logJumpPage(e) {
	var totalPage = parseInt((parent.getTotalRecords + 9) / 10);
	var myreg = /^[0-9]+.?[0-9]*$/;
	var re = new RegExp(myreg);
	var number = $(e).prev().find('input').val();
	if (!re.test(number)) {
		commonUtil.showPopup("提示", "请输入正确的数字!");
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
//日志查看框
function logWinShow(contractInfoId) {
	$("#logModal").modal("show");
	contractInfoIdForLog = contractInfoId;
	logList(1);
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