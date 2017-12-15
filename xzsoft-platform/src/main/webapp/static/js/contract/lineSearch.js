// 分页
var linePagination = $("#pagination-list-line").operationList({
	"current" : 1, // 当前目标
	"maxSize" : 4, // 前后最大列表
	"itemPage" : 10, // 每页显示多少条
	"totalItems" : 0, // 总条数
	"chagePage" : function(current) {
		// 调用ajax请求拿最新数据
		lineList(current);
	}
});

(function($) {
	lineList(1);
})(jQuery);
//线路信息查询
var flag1 = "";//判断用于查询或是输入
function lineList(number) {
	$("#lineTBody").html("");
	$.ajax({
		url : basePath+"/line/getLineData",
		data : {
			'lineName' : $("#lineNameQuery").val(),
			'startPoints' : $("#startPointQuery").val(),
			'endPoints' : $("#endPointQuery").val(),
			'page' : number,
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
				tr += "<tr class='table-body' align='center'>";
				tr+="<td><input type='checkbox' class='sub_line_check' lineInfoId="+ele.id+" lineName="+ele.lineName+" distance="+ele.distance+"></td>";
				tr += "<td>" + ele.id + "</td>";
				tr += "<td>" + ele.lineName + "</td>";
				tr += "<td>" + ele.startPoints + "</td>";
				tr += "<td>" + ele.endPoints + "</td>";
				tr += "<td>" + ele.distance + "</td>";

				// 将tr追加
				$("#lineTBody").append(tr);

			});
			/*//允许表格拖着
			$("#lineTableDrag").colResizable({
				  liveDrag:true, 
				  partialRefresh:true,
				  gripInnerHtml:"<div class='grip'></div>", 
				  draggingClass:"dragging",
				  resizeMode: 'overflow'
			});
		    //结算数据较多，增加滑动
		    $(".iscroll").css("min-height", "55px");
		    $(".iscroll").mCustomScrollbar({
		      theme: "minimal-dark"
		    });*/
		}
	});
	// 获取最大数据记录数
	$.ajax({
		url : basePath+"/line/getLineCount",
		type : "post",
		data : {'lineName' : $("#lineNameQuery").val(),
				'startPoints' : $("#startPointQuery").val(),
				'endPoints' : $("#endPointQuery").val()},
		dataType : "json",
		async : false,
		success : function(resp) {
			parent.getTotalRecords = resp;
			linePagination.setTotalItems(resp);
			$("#panel-num-line").text("搜索结果共" + resp + "条");
		}
	});
	setTimeout(function(){
		$("#lineTableDrag").colResizable({
	      liveDrag:true, 
	      gripInnerHtml:"<div class='grip'></div>", 
	      draggingClass:"dragging",
	      ifDel: 'lineTableDrag'
	    });
	},1000)
	$(".iscroll").css("min-height", "55px");
    $(".iscroll").mCustomScrollbar({
      theme: "minimal-dark"
    });
}



function lineJumpPage(e) {
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
	linePagination.setCurrentPage(value);
}


//绑定线路输入框
$("body").on("click", "#line_name", function() {
	flag1 = "0";
	$("#lineNameQuery").val(null);
	$("#lineSelectModal").modal("show");
		lineList(1);
});

//绑定线路查询输入框
$("body").on("click", "#lineInfoQuery", function() {
	flag1 = "1";//判断用于查询或是输入
	$("#lineNameQuery").val(null);
	$("#lineSelectModal").modal("show");
		lineList(1);
});

//线路列表选择
$("body").on("click", ".sub_line_check", function() {
	var isChecked = $(this).is(":checked");
	$(".sub_line_check").prop("checked", false);
	if (isChecked) {
		$(this).prop("checked", isChecked);
	} else {
		$(this).prop("checked", isChecked);
	}
});

// 线路选择确认
function lineSelect() {
	$(".sub_line_check").each(function() {
		if ($(this).is(":checked")) {
			if(flag1 =="1"){
				$("#lineInfoQuery").val($(this).attr("lineName"));
				$("#lineInfoIdQuery").val($(this).attr("lineInfoId"));
				return false;
			}else{
				$("#line_name").val($(this).attr("lineName"));
				$("#line_info_id").val($(this).attr("lineInfoId"));
				$("#distance").val($(this).attr("distance"));
				return false;
			}
		}
	});
	$("#lineSelectModal").modal("hide");
}

function resetLine(){
	$("#lineNameQuery").val("");
	$("#startPointQuery").val("");
	$("#endPointQuery").val("");
	$("#dsfdsfd").text("");
	$("#endLifdsfdsfneData").text("");
	setTimeout(function(){
		lineList(1);
	},500);
}