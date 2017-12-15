$(function(){
	PList(1);
	//全选/全不选
	$("body").on("click",".all_partner_info_temp_check",function(){
		if($(".all_partner_info_temp_check").is(":checked")){
			//全选时
			$(".sub_partner_info_temp_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_partner_info_temp_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});


//合作伙伴全查
function PList(number){
	
	$("#partnerInfoTempPageTBody").html("");
	
	$.ajax({
		url:basePath+"/scatteredGoods/findPartnerInfoTempMation",
		dataType:"json",
		type:"post",
		data:{"page":number-1,"rows":10},
		async:false,
		success:function(resp){
			var objs=eval(resp);
			$.each(objs,function(index,ele){
				var objs=eval(resp);
				var partnerRole="物流公司";
				if(ele.partnerRole==1){
					partnerRole="企业货主";
				}else if(ele.partnerRole==3){
					partnerRole="个体货主";
				}else if(ele.partnerRole==4){
					partnerRole="司机";
				}
				var tr ="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_partner_info_temp_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="		<td>"+ele.partnerTeamCode+"</td>";	
				tr+="		<td>"+ele.partnerCode+"</td>";
				tr+="		<td>"+ele.partnerName+"</td>";
				tr+="		<td>"+partnerRole+"</td>";
				tr+="</tr>";
				
				//将tr追加
				$("#partnerInfoTempPageTBody").append(tr);
			});
		}
	});
	//查询最大记录数
	$.ajax({
		 url:basePath+"/scatteredGoods/getPartnerInfoTempCount",
		 type:"post",
		 data:"",
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
var pagination = $("#partnerInfoTemp-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":5,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  PList(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage=Math.floor((parent.getTotalRecordsPlanInfo+9)/10);
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
	
	//获取全选/单选ID (合作伙伴ID，逗号分隔)
	function submitPMation(){
		var Pids = new Array();
		$(".sub_partner_info_temp_check").each(function(){
			if($(this).is(":checked")){
				Pids.push($(this).attr("data-id"))
			}
		});
		var PidsLength=Pids.length;
		submitPartnerInfoTempMation(Pids.join(","),PidsLength);
	}
	
	$("body").on("click", ".sub_partner_info_temp_check", function() {
		var isChecked = $(this).is(":checked");
		$(".sub_entrust_check").prop("checked", false);
		if (isChecked) {
			$(this).prop("checked", isChecked);
		} else {
			$(this).prop("checked", isChecked);
		}
	});
	
//确认按钮
function submitPartnerInfoTempMation(Pids,PidsLength){
	
	
	//判断选择条数
	if(PidsLength>1){
		xjValidate.showTip("最多选择一条数据!");
	}else if(PidsLength<1){
		xjValidate.showTip("请至少选择一条数据!");
	}else if(PidsLength=1){
		
		$.confirm({
		      title: '提示',
		      content: '您确定要选择该条记录吗？',
		      buttons: {
		          '确定': function () {
		        	  
		        	  //根据选择ID查询合作伙伴管理表对应合作伙伴名称
		        	  $.ajax({
		        		  url:basePath+"/scatteredGoods/findPartnerInfoTempById",
		        		  data:{Pids:Pids},
		        		  dataType:"json",
		        		  type:"post",
		        		  async:false,
		        		  success:function(resp){
		        			  $("#CshipperName").val("");//发布方名称
	        				  $("#Cshipper").val("");//发布方
	        				  $("#shipperOrgRoot").val("");//发布方主机构
	        				  $("#userInfoId").val("");//发布方
		        			  $("#find_partner_info_temp_model").html("");
		        			  //角色物流公司
		        			  if(resp.partnerRole==2){
		        				  $("#role").val(2);
		        				  $("#Cshipper").val(resp.partnerCode);//合作伙伴编号
		        				  $("#CshipperName").val(resp.partnerName);//合作伙伴名称
		        				  $("#shipperOrgRoot").val(resp.partnerTeamCode);//受理方主机构
		        			  }else 
		        				  //角色司机
		        				  if(resp.partnerRole==4){
		        					  $("#role").val(4);
		        					  $("#userInfoId").val(resp.partnerCode);//合作伙伴编号
			        				  $("#CshipperName").val(resp.partnerName);//合作伙伴名称
			        				  $("#shipperOrgRoot").val(resp.partnerTeamCode);//受理方主机构
		        			  }
		        		  }
		        	  });
		          },
		          '取消': function () {
		        	  
		          }
		      }
		  });
	}
}