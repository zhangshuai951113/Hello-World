$(function(){
	myOfferList(1);
	//时间调用插件
    setTimeout(function() {
	       $(".date-time-ss").datetimepicker({
	          format: "YYYY-MM-DD HH:mm:ss",
	          autoclose: true,
	          todayBtn: true,
	          todayHighlight: true,
	          showMeridian: true,
	          pickerPosition: "bottom-left",
	          startView: 2,//月视图
	          minView: 2//日期时间选择器所能够提供的最精确的时间选择视图
	        }); 
	    },500);
	  //全选/全不选
		$("body").on("click",".all_bidding_info_check",function(){
			if($(".all_bidding_info_check").is(":checked")){
				//全选时
				$(".sub_bidding_info_check").each(function(){
					$(this).prop("checked",true);
				});
			}else{
				//全不选时
				$(".sub_bidding_info_check").each(function(){
					$(this).prop("checked",false);
				});
			}
		});
		setTimeout(function(){
			// 允许表格拖着
			$("#tableDrag").colResizable({
				liveDrag : true,
				gripInnerHtml : "<div class='grip'></div>",
				draggingClass : "dragging",
				ifDel: 'tableDrag'
			});
		},1000);
	})

//全查方法
function myOfferList(number){
	
	//禁止多次追加
	$("#biddingTtableList").html("");
	var biddingCode=$.trim($("#biddingCode").val());
	var biddingName=$.trim($("#biddingName").val());
	var createUserName=$.trim($("#createUserName").val());
	var biddingOrg=$.trim($("#biddingOrg").val());
	var makeStartTime=$.trim($("#makeStartTime").val());
	var makeEndTime=$.trim($("#makeEndTime").val());
	
	var data={
			"biddingCode":biddingCode,
			"biddingName":biddingName,
			"createUserName":createUserName,
			"biddingOrg":biddingOrg,
			"makeStartTime":makeStartTime,
			"makeEndTime":makeEndTime,
			"page":number-1,
			"rows":10
	};
	
	//调用ajax进行全查方法
	$.ajax({
		url:basePath+"/myOffer/findMyOfferMationByPartner",
		data:data,
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				if(ele.paymentMethod==null){
					ele.paymentMethod="";
				}
				if(ele.biddingStatus==4){
					ele.biddingStatus="审核通过";
				}else if(ele.biddingStatus==6){
					ele.biddingStatus="二次挂网";
				}else if(ele.biddingStatus==5){
					ele.biddingStatus="已回收报价";
				}else if(ele.biddingStatus==9){
					ele.biddingStatus="已中标";
				}
				if(ele.biddingCodeCopy==null){
					ele.biddingCodeCopy="";
				}
				var tr = " <tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_bidding_info_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td style='color:red'>"+ele.biddingStatus+"</td>";
				tr+="		<td>"+ele.biddingCode+"</td>";
				tr+="		<td>"+ele.biddingCodeCopy+"</td>";
				tr+="		<td>"+ele.orgName+"</td>";
				tr+="		<td>"+ele.biddingName+"</td>";
				tr+="		<td>"+ele.quotationDeadlineStr+"</td>";
				tr+="		<td>"+ele.paymentMethod+"</td>";
				tr+="		<td>"+ele.createTimeStr+"</td>";
				tr+="		<td>"+ele.createUserStr+"</td>";
				tr+="</tr>";
			//将tr追加到
			$("#biddingTtableList").append(tr);
			});
		}
	});
	//调用ajax查询总量
	$.ajax({
		url:basePath+"/myOffer/getMyOfferMationCountByPartner",
		data:data,
		dataType:"JSON",
		type:"POST",
		async:false,
		success:function(resp){
			parent.getBiddingInfoTotalRecords=resp;
			biddingInfoMethod.setTotalItems(resp);
			$("#offer-num").text("搜索结果共"+resp+"条");
		}
	});
	
}

//分页
var biddingInfoMethod = $("#offer-list").operationList({
  "current":1,    //当前目标
  "maxSize":4,  //前后最大列表
  "itemPage":10,  //每页显示多少条
  "totalItems":0,  //总条数
  "chagePage":function(current){
    //调用ajax请求拿最新数据
	  myOfferList(current);
  }
});

function jumpOfferPage(e) {

      var totalPage=Math.floor((parent.getBiddingInfoTotalRecords+9)/10);
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
	   biddingInfoMethod.setCurrentPage(value);
	}

//重置查询条件
function resetOffer(){
	setTimeout(function(){
		myOfferList(1);
	},100);
}

//判断点击按钮
function ChoiceOfferMation(){
	
	/**
	 * 拼接选择ID,用","隔开
	 * */
	var biddingInfoIds=new Array();
	$(".sub_bidding_info_check").each(function(){
		if($(this).is(":checked")){
			biddingInfoIds.push($(this).attr("data-id"));
		}
	});
	
	var biddingInfoIdsLength=biddingInfoIds.length;
	
	seeBiddingDetailMation(biddingInfoIds.join(","),biddingInfoIdsLength);
	
}

//参与报价
function seeBiddingDetailMation(biddingInfoIds,biddingInfoIdsLength){


	if(biddingInfoIdsLength>1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(biddingInfoIdsLength<1){
		xjValidate.showPopup("请选择一条数据!","提示",true);
	}else if(biddingInfoIdsLength=1){
		//提交form表单
		$("#hidden_bidding_id").val(biddingInfoIds);
		$("#form_bidding_detail_mation").attr("action",basePath + "/myOffer/goBiddingDetailMationPageByBiddingInfoId");
		$("#form_bidding_detail_mation").submit();
	}
}



