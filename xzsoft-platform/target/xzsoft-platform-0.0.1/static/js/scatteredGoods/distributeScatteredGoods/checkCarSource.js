$(function(){
	Clist(1);
	//全选/全不选
	$("body").on("click",".all_car_source_check",function(){
		if($(".all_car_source_check").is(":checked")){
			//全选时
			$(".sub_car_source_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_car_source_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
});

//车源全查
function Clist(number){
	
$("#carSourceTBody").html("");
	
$.ajax({
	url:basePath+"/scatteredGoods/findCarSourceMation",
	data:{"page":number-1,"rows":10},
	dataType:"json",
	type:"post",
	asnyc:false,
	success:function(resp){
		var objs=eval(resp);
		$.each(objs,function(index,ele){
			
			var role="物流公司";
			if(ele.releasePersonRole==2){
				role="司机";
			}
			if(ele.rootReleasePersonStr==null){
				ele.rootReleasePersonStr="";
			}
			if(ele.releasePersonName==null){
				ele.releasePersonName="";
			}
			var tr ="<tr class='table-body'>";
			tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_car_source_check' data-id=\""+ele.id+"\" ></label></td>";
			tr+="		<td>"+ele.id+"</td>";	
			tr+="		<td>"+ele.rootReleasePersonStr+"</td>";
			tr+="		<td>"+ele.releasePersonName+"</td>";
			tr+="		<td>"+ele.carCode+"</td>";
			tr+="		<td>"+role+"</td>";
			tr+="</tr>";
			
			//将tr追加
			$("#carSourceTBody").append(tr);
		});
	}
	});
		//获取最大数据记录数
		$.ajax({
			 url:basePath+"/scatteredGoods/getCarSourceCount",
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
};

//分页
var pagination = $("#carSource-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":5,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
		  Clist(current);
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
	
	//获取全选/单选ID (车源ID，逗号分隔)
	function submitCMation(){
		var Cids = new Array();
		$(".sub_car_source_check").each(function(){
			if($(this).is(":checked")){
				Cids.push($(this).attr("data-id"))
			}
		});
		var CidsLength=Cids.length;
		submitCarSourceMation(Cids.join(","),CidsLength);
	}

	//确认按钮
	function submitCarSourceMation(Cids,CidsLength){
		//判断选择条数
		if(CidsLength>1){
			xjValidate.showTip("最多选择一条数据!");
		}else if(CidsLength<1){
			xjValidate.showTip("请至少选择一条数据!");
		}else if(CidsLength=1){
			
			$.confirm({
			      title: '提示',
			      content: '您确定要选择该条记录吗？',
			      buttons: {
			          '确定': function () {
			        	  
			        	  //根据选择ID查询车源表对应车源发布方名称
			        	  $.ajax({
			        		  url:basePath+"/scatteredGoods/findReleasePersonNameById",
			        		  data:{Cids:Cids},
			        		  dataType:"json",
			        		  type:"post",
			        		  async:false,
			        		  success:function(resp){
			        			  $("#CshipperName").val("");//发布方名称
		        				  $("#Cshipper").val("");//发布方
		        				  $("#shipperOrgRoot").val("");//发布方主机构
		        				  $("#userInfoId").val("");//发布方
			        			 $("#find_car_source_model").html("");
			        			 //当角色为物流公司
			        			 if(resp.releasePersonRole==1){
			        				 $("#role").val(2);
			        				 $("#CshipperName").val(resp.releasePersonName);//发布方名称
			        				 $("#Cshipper").val(resp.releasePerson);//发布方
			        				 $("#shipperOrgRoot").val(resp.rootReleasePerson);//发布方主机构
			        			 }else 
			        				 //当角色为司机
			        				 if(resp.releasePersonRole==2){
			        				$("#role").val(4);
			        				$("#CshipperName").val(resp.releasePersonName);//发布方名称
			        				$("#userInfoId").val(resp.releasePerson);//发布方
			        				$("#shipperOrgRoot").val(resp.releasePerson);//发布方主机构
			        			 }
			        			 if(resp.carCode!=null){
			        				 $("#carCode").val(resp.carCode);//车牌号
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