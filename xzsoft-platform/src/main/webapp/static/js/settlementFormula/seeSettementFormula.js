$(function(){
	SFDlIST(1);
});

//全查
function SFDlIST(number){
	
	$("#SFDTBody").html("");
	
	$.ajax({
		url:basePath+"/settlementFormula/findSettlementFormulaMation",
		data:{"sIds":$("#SFDIds").val(),"page":number-1,"rows":5},
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				var tr ="<tr class='table-body'>";
				tr+="<td>"+ele.id+"</td>";
				tr+="<td>"+ele.accountingEntityStr+"</td>";
				tr+="<td>"+ele.createTimeStr+"</td>";
				tr+="</tr>";
				$("#SFDTBody").append(tr);
			});
		}
	});
	//获取最大数据记录数
	$.ajax({
		 url:basePath+"/settlementFormula/getSettlementFormulaDetailMaxCount",
		 type:"post",
		 data:{"sIds":$("#SFDIds").val()},
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 parent.getTotalRecordsPlanInfo=resp;
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
}

//分页
var pagination = $(".pagination-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":5,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  SFDlIST(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getTotalRecordsPlanInfo+4)/5);
	  var myreg=/^[0-9]+.?[0-9]*$/;
	  var re = new RegExp(myreg);
	  var number=$(e).prev().find('input').val();
	  if(!re.test(number)){
		  xjValidate.showTip("请输入正确的数字!");
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
	
//关闭模态框
	function closeCButton(){
		$("#see_settlement_formula_detail_page").html("");
		list(1);
	}