
$(function(){
	list(1);
	//上传图片初始化
	$('.upload_img').each(function(){
		uploadLoadFile($(this));
	})
	
	
	//全选/全不选
	$("body").on("click",".all_user_check",function(){
		if($(".all_user_check").is(":checked")){
			//全选时
			$(".sub_user_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_user_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	
	 //允许表格拖着
	  $("#tableDrag").colResizable({
	    liveDrag: true,
	    gripInnerHtml: "<div class='grip'></div>",
	    draggingClass: "dragging"
	  });
	
	
});

/**
 * 绑定上传事件的dom对象
 * @author chengzhihuan 2017年5月18日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn,{
   		action: basePath + '/upload/imageUpload',
   		name: 'myfile',
		dataType: 'json',
   		onSubmit : function(file , ext){
   			//文件上传格式校验
   			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))){
   				$.alert("请上传格式为 jpg|png|bmp 的图片!");
   				return;
   			}
   		},
   		//服务器响应成功时的处理函数
   		onComplete :function(file, resultJson){
   			if(resultJson){
   				resultJson = $.parseJSON(resultJson);
   				//是否成功
   				var isSuccess = resultJson.isSuccess;
   				//上传图片URL
   				var uploadUrl = resultJson.uploadUrl;
   				if(isSuccess=="true"){
   					//图片类型
   					var imgType = btn.attr("img-type");
					btn.attr("src",fastdfsServer+"/"+uploadUrl);
					$("#"+imgType).val(uploadUrl);
   				}else{
   					$.alert(resultJson.errorMsg);
   	   				return;
   				}
   			}else{
   				$.alert("服务器异常，请稍后重试");
   				return;
   			}
		}
	});
}

//添加模态框
function addCoustomerMation(){
	var url=basePath+"/customer/addCoustomerMation";
	$("#show_coustomer_info").load(url,function(){
		//上传图片初始化
		$('.upload_img').each(function(){
			uploadLoadFile($(this));
		})
		initIsCombine();

		$.ajax({
			url:basePath+"/customer/findLoginUserRole",
			data:"",
			dataType:"JSON",
			type:"POST",
			async:false,
			success:function(resp){
				if(resp==1){
					//隐藏客户角色选择框
					$("#user_role_form_box").hide();
				}
			}
		});
	});
}


//页面全查
function list(number){
	
	$("#tableList").html("");
	var data=$("#find_customer_info").serialize();
	data+="&page="+(number-1)+"&rows="+10+"&sign="+1+"";
	//查询组织机构明细
	$.ajax({
		url:basePath+"/customer/findCoustomerInfoAll",
		data:data,
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){

			var objs=eval(resp);
			$.each(objs,function(index,ele){
				
				var isCombine="否";
				if(isCombine==1){
					isCombine="是";
				}
				var coustomerRole="企业货主";
				if(ele.userRole==2){
					coustomerRole="物流公司";
				}
				//追加数据
				var tr="";
				tr+="<tr class='table-body'>";
				tr+="<td><label class='i-checks'><input name='cId' id='id' type='checkbox' class='sub_user_check' data-id=\""+ele.id+"\" ></label></td>";
				tr+="<td>"+ele.orgName+"</td>";
				/*tr+="<td>"+ele.registerAddress+"</td>";
				tr+="<td>"+ele.contactAddress+"</td>";
				tr+="<td>"+ele.postcode+"</td>";*/
				tr+="<td>"+ele.contactName+"</td>";
				tr+="<td>"+ele.mobilePhone+"</td>";
				tr+="<td>"+ele.telephone+"</td>";
				tr+="<td>"+coustomerRole+"</td>";
				tr+="<td>"+ele.createUserStr+"</td>";
				tr+="<td>"+ele.createTimeStr+"</td>";
				/*tr+="<td>"+ele.legalPersonName+"</td>";
				tr+="<td>"+ele.idCard+"</td>";
				tr+="<td>"+isCombine+"</td>";
				tr+="<td>"+ele.creditCode+"</td>";
				tr+="<td>"+ele.licenseNum+"</td>";
				tr+="<td>"+ele.taxNum+"</td>";
				tr+="<td>"+ele.orgNum+"</td>";
				tr+="<td>"+ele.fax+"</td>";
				tr+="<td>"+ele.email+"</td>";
				tr+="<td>"+ele.bankName+"</td>";
				tr+="<td>"+ele.accountName+"</td>";
				tr+="<td>"+ele.bankAccount+"</td>";
				tr+="<td>"+ele.roadTransportPermitNum+"</td>";
				if(ele.isCombine==1){
					if(ele.licenseImg!=null){
						tr+="<td>";
						tr+="<img title='点击查看图片' src='"+fastdfsServer+'/'+ele.licenseImg+"'>";
						tr+="</td>";
					}else{
						tr+="<td>暂无附件</td>";
					}
					tr+="<td>详情请见营业执照附件</td>";
					tr+="<td>详情请见营业执照附件</td>";
					if(ele.creditImg!=null){
						tr+="<td>";
						tr+="<img title='点击查看图片' src='"+fastdfsServer+'/'+ele.creditImg+"'>";
						tr+="</td>";
					}else{
						tr+="<td>暂无附件</td>";
					}
				}else if(ele.isCombine==0){
					if(ele.licenseImg!=null){
						tr+="<td>";
						tr+="<img title='点击查看图片' src='"+fastdfsServer+'/'+ele.licenseImg+"'>";
						tr+="</td>";
					}else{
						tr+="<td>暂无附件</td>";
					}
					
					if(ele.taxImg!=null){
						tr+="<td>";
						tr+="<img title='点击查看图片' src='"+fastdfsServer+'/'+ele.taxImg+"'>";
						tr+="</td>";
					}else{
						tr+="<td>暂无附件</td>";
					}
					
					if(ele.orgImg!=null){
						tr+="<td>";
						tr+="<img title='点击查看图片' src='"+fastdfsServer+'/'+ele.orgImg+"'>";
						tr+="</td>";
					}else{
						tr+="<td>暂无附件</td>";
					}
					
					if(ele.creditImg!=null){
						tr+="<td>";
						tr+="<img title='点击查看图片' src='"+fastdfsServer+'/'+ele.creditImg+"'>";
						tr+="</td>";
					}else{
						tr+="<td>暂无附件</td>";
					}
				}
				tr+="<td>"+ele.remarks+"</td>";*/
				tr+="</tr>";
				//将tr追加
				$("#tableList").append(tr);
				//图片预览
				$('td img').viewer({
					title:false
				});
			});
			
		}
	});
	
	//查询最大记录数
	$.ajax({
		 url:basePath+"/customer/getCount",
		 type:"post",
		 data:data,
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 parent.getTotalRecords=resp;
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
	
}

//分页
var pagination = $(".pagination-list").operationList({
	  "current":1,    //当前目标
	  "maxSize":4,  //前后最大列表
	  "itemPage":10,  //每页显示多少条
	  "totalItems":0,  //总条数
	  "chagePage":function(current){
	    //调用ajax请求拿最新数据
	      list(current);
	  }
	});

	
	function jumpPage(e) {
      var totalPage= parseInt((parent.getTotalRecords+9)/10);
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

//模糊查询
$("#searchCustomer").click(function(){
	list(1);
});

//重置按钮
$("#Reset").click(function(){
	$("#orgName").val("");
	$("#mobilePhone").val("");
	$("#contactName").val("");
	list(1);
});

//关闭模态框
function closeButton(){
	$("#show_coustomer_info").html("");
}

/**
 * 初始化三证合一显示
 * @author chengzhihuan 2017年5月18日
 */
function initIsCombine(){
	//取出是否三证合一字段
	var isCombine = $("#is_combine").val();
	//若是三证合一则隐藏税务登记证与组织机构代码证
	if(isCombine && isCombine==1){
		$("#is_combine_div").hide();
		$("#tax_img_div").hide();
		$("#org_img_div").hide();
	}else if(isCombine && isCombine==0){
		$("#is_combine_div").show();
		$("#tax_img_div").show();
		$("#org_img_div").show();
	}
}

//切换三证合一
function changeIsCombine(){
	//取出是否三证合一字段
	var isCombine = $("#is_combine").val();
	//若是三证合一则隐藏税务登记证与组织机构代码证
	if(isCombine==1){
		$("#is_combine_div").hide();
		$("#tax_img_div").hide();
		$("#org_img_div").hide();
		$("#orgNum").val("");
		$("#CorgNum").val("");
		$("#CtaxNum").val("");
		$("#taxNum").val("");
		$("#org_img").val("");
		$("#tax_img").val("");
	}
	//若不是三证合一则显示税务登记证与组织机构代码证
	else{
		$("#is_combine_div").show();
		$("#tax_img_div").show();
		$("#org_img_div").show();
	}
}

function initIsCombineMation(isCombine){
	//取出是否三证合一字段
	var isCombine = isCombine;
	//若是三证合一则隐藏税务登记证与组织机构代码证
	if(isCombine && isCombine==1){
		$("#is_combine_div").hide();
		$("#tax_img_div").hide();
		$("#org_img_div").hide();
	}else if(isCombine && isCombine==0){
		$("#is_combine_div").show();
		$("#tax_img_div").show();
		$("#org_img_div").show();
	}
}

//添加客户信息
function addCoustomerMationBtn(){
	
	//1、组织名称校验
	var orgName = $.trim($("#orgNames").val());
	if(orgName==undefined || orgName==""){
		xjValidate.showTip("组织名称不能为空");
		return;
	}
	
	if(orgName.length>70){
		xjValidate.showTip("组织名称不能超过35个汉字");
		return;
	}
	
	//营业执照号
	var licenseNum = $.trim($("#licenseNum").val());
	
	//2、通讯地址校验
	var contactAddress = $.trim($("#contactAddress").val());
	if(contactAddress.length>120){
		xjValidate.showTip("通讯地址不能超过60个汉字");
		return;
	}
	
	//3、注册地址校验
	var registerAddress = $.trim($("#registerAddress").val());
	if(registerAddress==undefined || registerAddress==""){
		xjValidate.showTip("注册地址不能为空");
		return;
	}
	
	if(registerAddress.length>120){
		xjValidate.showTip("注册地址不能超过60个汉字");
		return;
	}
	
	//4、联系人姓名校验
	var contactName = $.trim($("#contactNames").val());
	if(contactName!=undefined && contactName!="" && contactName.length>40){
		xjValidate.showTip("联系人姓名不能超过20个汉字");
		return;
	}
	
	//5、移动电话校验
	var mobilePhone = $.trim($("#mobilePhones").val());
	if(mobilePhone==undefined || mobilePhone=="" ){
		xjValidate.showTip("请输入移动电话!");
		return;
	}
	
	var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/; 
	if(mobilePhone!=undefined && mobilePhone!="" && !myreg.test(mobilePhone)){
		xjValidate.showTip("请输入有效的移动电话!");
		return;
	}
	
	//6、法定代表人校验
	var legalPersonName = $.trim($("#legalPersonName").val());
	if(legalPersonName==undefined || legalPersonName==""){
		xjValidate.showTip("法定代表人不能为空");
		return;
	}
	
	if(legalPersonName.length>40){
		xjValidate.showTip("法定代表人不能超过20个汉字");
		return;
	}
	
	//7、固定电话校验校验
	var telephone = $.trim($("#telephone").val());
	if(telephone==undefined && telephone=="" ){
		xjValidate.showTip("请输入固定电话");
		return;
	}else 
	var telereg = /^((0\d{2,3})-)(\d{7,8})$/;
	if(!telereg.test(telephone)){
		xjValidate.showTip("请输入有效的固定电话");
		return;
	}
	
	//8、法人身份证号校验
	var idCard = $.trim($("#idCard").val());
	var cardreg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
	if(idCard!=null && idCard!='' && !cardreg.test(idCard)){
		xjValidate.showTip("请输入有效的法人身份证号");
		return;
	}
	
	//9、统一社会信用代码校验
	var creditCode = $.trim($("#creditCode").val());
	if(creditCode.length>200){
		xjValidate.showTip("统一社会信用代码的长度不能超过100个字符!");
		return;
	}
	
	//10、统一社会信用代码证附件校验
	var creditImg = $.trim($("#credit_img").val());
	if(creditImg==undefined || creditImg==""){
		xjValidate.showTip("统一社会信用代码证附件不能为空");
		return;
	}
	
	//组织机构代码证
	var orgNum = $.trim($("#orgNum").val());
	//税务登记号
	var taxNum = $.trim($("#taxNum").val());
	
	//11、邮编校验
	var postcode = $.trim($("#postcode").val());
	var postreg =  /^[0-9][0-9]{5}$/;
	if(postcode!=undefined && postcode!='' && !postreg.test(postcode)){
		xjValidate.showTip("请输入有效的邮编");
		return;
	}
	
	//12、传真校验
	var fax = $.trim($("#fax").val());
	var faxreg = /^(\d{3,4}-)?\d{7,8}$/;
	if(fax!=undefined && fax!='' && !faxreg.test(fax)){
		xjValidate.showTip("传真格式为:XXX-12345678或XXXX-1234567或XXXX-12345678");
		return;
	}
	
	//13、电子邮箱校验
	var email = $.trim($("#email").val());
	var emailreg = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g;
	if(email!=undefined && email!='' && !emailreg.test(email)){
		xjValidate.showTip("请输入有效的邮箱地址");
		return;
	}
	
	//14、开户行校验
	if(bankName.length>70){
		xjValidate.showTip("开户行不能超过35个汉字");
		return;
	}
	
	//15、开户名校验
	if(accountName.length>40){
		xjValidate.showTip("开户名不能超过20个汉字");
		return;
	}
	
	//16、银行账号校验
	var bankAccount = $.trim($("#bankAccount").val());
	if(bankAccount.length>40){
		xjValidate.showTip("银行账号的长度不能超过20个字符!");
		return;
	}
	
	//17、道路运输许可证号校验
	var roadTransportPermitNum = $.trim($("#roadTransportPermitNum").val());
	if(roadTransportPermitNum.length>30){
		xjValidate.showTip("道路运输许可证号的长度不能超过15个字符!");
		return;
	}
	
	//18、备注校验
	var remarks= $.trim($("#remarks").val());
	if(remarks!=undefined && remarks!="" && remarks.length>160){
		xjValidate.showTip("备注信息不能超过80个汉字");
		return;
	}
	
	//19、三证信息校验
	var isCombine = $("#is_combine").val();
	if(isCombine==undefined || isCombine==""){
		xjValidate.showTip("请选择是否三证合一");
		return;
	}
	
	//20、客户角色
	var userRole=$.trim($("#user_role").val());
	if(userRole==undefined || userRole==''){
		xjValidate.showTip("请选择客户角色!");
		return;
	}
	
	//营业执照附件
	var licenseImg = $.trim($("#license_img").val());
	//税务登记证附件
	var taxImg = $.trim($("#tax_img").val());
	//组织机构代码证附件
	var orgImg = $.trim($("#org_img").val());
	if(isCombine==1){
		
		if(licenseImg==undefined || licenseImg==''){
			xjValidate.showTip("请上传三证相关信息!");
			return;
		}
		
	}else{
		
		if(orgNum==undefined || orgNum==""){
			xjValidate.showTip("组织机构代码证不能为空!");
			return;
		}
		
		if(taxNum==undefined || taxNum==""){
			xjValidate.showTip("税务登记号不能为空!");
			return;
		}
		
		if(licenseImg==undefined || licenseImg==null){
			xjValidate.showTip("请上传营业执照附件!");
			return;
		}
		if(taxImg==undefined || taxImg==null){
			xjValidate.showTip("请上传税务登记证附件!");
			return;
		}
		if(orgImg==undefined || orgImg==null){
			xjValidate.showTip("请上传组织机构代码证附件!");
			return;
		}
	}
	
	//验证通过
	$.ajax({
		url:basePath+"/customer/addCoustomerInfo",
		data:$("#sub_constomer_info_form").serialize(),
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
				$("#show_coustomer_info").html("");
				xjValidate.showPopup(resp.msg,"提示",true);
				list(1);
				}else{
				xjValidate.showTip(resp.msg);
				}
			}else{
				xjValidate.showTip(resp.msg);
				$("#show_coustomer_info").html("");
			}
		}
	});
}

//获取全选/单选ID (用户ID，逗号分隔)
function deleteCoustomerMation(){ 
	var userIds = new Array();
	$(".sub_user_check").each(function(){
		if($(this).is(":checked")){
			userIds.push($(this).attr("data-id"))
		}
	});
	var userIdsLength=userIds.length;
	deleteCoustomer(userIds.join(","),userIdsLength);
}

//删除客户信息
function deleteCoustomer(userIds,userIdsLength){

	//判断全选/单选
	if(userIdsLength>=1){
		 $.confirm({
		      title: '删除记录',
		      content: '您确定要删除该条记录吗？',
		      buttons: {
		          '确定': function () {
		        	$.ajax({
		        		url:basePath+"/customer/deleteCustomerMation",
		        		data:{"userIds":userIds},
		        		dataType:"json",
		        		type:"post",
		        		async:false,
		        		success:function(resp){
		        			if(resp.success){
		        				 xjValidate.showPopup(resp.msg,"提示",true);
		        				list(1);
		        			}else{
		        				 xjValidate.showPopup(resp.msg,"提示",true);
		        			}
		        		}
		        	});
		          },
		          '取消': function () {
		        	  
		          }
		      }
		  });
	}else if(userIdsLength<1){
		xjValidate.showPopup("请至少选择一条数据!","提示",true);
	}
}

//修改客户数据(获得ID)
function updateCoustomerMation(){
	var userIds = new Array();
	$(".sub_user_check").each(function(){
		if($(this).is(":checked")){
			userIds.push($(this).attr("data-id"))
		}
	});
	var userIdsLength=userIds.length;
	updateCoustomer(userIds.join(","),userIdsLength);
}

//修改客户数据
function updateCoustomer(userIds,userIdsLength){
	
	//判断是否选中一条数据
	if(userIdsLength>1){
		xjValidate.showPopup("最多选择一条数据!","提示",true);
		return false;
	}else if(userIdsLength<1){
		xjValidate.showPopup("请至少选择一条数据!","提示",true);
		return false;
	}else if(userIdsLength==1){
		
		//判断客户是否与合同是否有业务关系
		$.ajax({
			url:basePath+"/customer/findContractInfoByCustomerOrgRootId",
			data:{"userIds":userIds},
			dataType:"json",
			type:"post",
			async:false,
			success:function(resp){
				if(resp){
					if(resp.success){
						
						//弹出修改模态框
						var url=basePath+"/customer/updateCoustomerPage";
						$("#show_coustomer_info").load(url,function(){
							//上传图片初始化
							$('.upload_img').each(function(){
								uploadLoadFile($(this));
							}),
							//回显客户数据
							$.ajax({
								url:basePath+"/customer/findCostOmerMationById",
								data:{"userIds":userIds},
								dataType:"json",
								type:"post",
								async:false,
								success:function(resp){
									//判断登录用户信息
									$.ajax({
										url:basePath+"/customer/findLoginUserRole",
										data:"",
										dataType:"JSON",
										type:"POST",
										async:false,
										success:function(resp){
											if(resp==1){
												//隐藏客户角色选择框
												$("#user_role_form_box").hide();
											}
										}
									});
									
									initIsCombineMation(resp.isCombine);
									$("#user_role").val(resp.userRole);
									$("#orgId").val(resp.id);
									$("#CorgName").val(resp.orgName);
									$("#ClicenseNum").val(resp.licenseNum);
									$("#CcontactAddress").val(resp.contactAddress);
									$("#CregisterAddress").val(resp.registerAddress);
									$("#CcontactNames").val(resp.contactName);
									$("#CmobilePhones").val(resp.mobilePhone);
									$("#ClegalPersonName").val(resp.legalPersonName);
									$("#Ctelephone").val(resp.telephone);
									$("#CidCard").val(resp.idCard);
									$("#CcreditCode").val(resp.creditCode);
									$("#CorgNum").val(resp.orgNum);
									$("#CtaxNum").val(resp.taxNum);
									$("#Cpostcode").val(resp.postcode);
									$("#Cfax").val(resp.fax);
									$("#Cemail").val(resp.email);
									$("#CbankName").val(resp.bankName);
									$("#CaccountName").val(resp.accountName);
									$("#CbankAccount").val(resp.bankAccount);
									$("#CroadTransportPermitNum").val(resp.roadTransportPermitNum);
									$("#is_combine").val(resp.isCombine);
									$("#license_img").val(resp.licenseImg);
									$("#org_img").val(resp.orgImg);
									$("#tax_img").val(resp.taxImg);
									$("#credit_img").val(resp.creditImg);
									$("#Cremarks").text(resp.remarks);
									if(resp.licenseImg){
										$("#licenseImg").attr("src",fastdfsServer+'/'+resp.licenseImg);
									}
									if(resp.orgImg){
										$("#orgImg").attr("src",fastdfsServer+'/'+resp.orgImg);
									}
									if(resp.taxImg){
										$("#taxImg").attr("src",fastdfsServer+'/'+resp.taxImg);
									}
									if(resp.creditImg){
										$("#creditImg").attr("src",fastdfsServer+'/'+resp.creditImg);
									}
								}
							});
						});
						
						
						
					}else{
						xjValidate.showPopup(resp.msg,"提示",true);
					}
				}else{
					xjValidate.showPopup("异常繁忙,请稍后再试!","提示",true);
				}
			}
		});
	}
}

//修改数据
function updateCoustomerMationBtn(){
	
	//1、组织名称校验
	var orgName = $.trim($("#CorgName").val());
	if(orgName==undefined || orgName==""){
		xjValidate.showTip("组织名称不能为空");
		return;
	}
	
	if(orgName.length>70){
		xjValidate.showTip("组织名称不能超过35个汉字");
		return;
	}
	
	//营业执照号
	var licenseNum = $.trim($("#ClicenseNum").val());
	
	//2、通讯地址校验
	var contactAddress = $.trim($("#CcontactAddress").val());
	if(contactAddress.length>120){
		xjValidate.showTip("通讯地址不能超过60个汉字");
		return;
	}
	
	//3、注册地址校验
	var registerAddress = $.trim($("#CregisterAddress").val());
	if(registerAddress==undefined || registerAddress==""){
		xjValidate.showTip("注册地址不能为空");
		return;
	}
	
	if(registerAddress.length>120){
		xjValidate.showTip("注册地址不能超过60个汉字");
		return;
	}
	
	//4、联系人姓名校验
	var contactName = $.trim($("#CcontactNames").val());
	if(contactName==undefined && contactName==""){
		xjValidate.showTip("联系人姓名不能为空!");
		return;
	}
	if(contactName.length>40){
		xjValidate.showTip("联系人姓名不能超过20个汉字");
		return;
	}
	
	//5、移动电话校验
	var mobilePhone = $.trim($("#CmobilePhones").val());
	var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/; 
	if(mobilePhone!=undefined && mobilePhone!="" && !myreg.test(mobilePhone)){
		xjValidate.showTip("请输入移动电话!");
		return;
	}
	
	//6、法定代表人校验
	var legalPersonName = $.trim($("#ClegalPersonName").val());
	if(legalPersonName==undefined || legalPersonName==""){
		xjValidate.showTip("法定代表人不能为空");
		return;
	}
	
	if(legalPersonName.length>40){
		xjValidate.showTip("法定代表人不能超过20个汉字");
		return;
	}
	
	//7、固定电话校验校验
	var telephone = $.trim($("#Ctelephone").val());
	var telereg = /^((0\d{2,3})-)(\d{7,8})$/;
	if(telephone!=undefined && telephone!="" && !telereg.test(telephone)){
		xjValidate.showTip("请输入有效的固定电话");
		return;
	}
	
	//8、法人身份证号校验
	var idCard = $.trim($("#CidCard").val());
	var cardreg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
	if(idCard!=undefined && idCard!='' && !cardreg.test(idCard)){
		xjValidate.showTip("请输入有效的法人身份证号");
		return;
	}
	
	//9、统一社会信用代码校验
	var creditCode = $.trim($("#CcreditCode").val());
	/*if(creditCode==undefined || creditCode==""){
		xjValidate.showTip("统一社会信用代码不能为空");
		return;
	}*/
	
	if(creditCode.length>50){
		xjValidate.showTip("统一社会信用代码的长度不能超过50个字符!");
		return;
	}
	
	//10、统一社会信用代码证附件校验
	var creditImg = $.trim($("#credit_img").val());
	if(creditImg==undefined || creditImg==""){
		xjValidate.showTip("统一社会信用代码证附件不能为空");
		return;
	}
	
	//20、客户角色
	var userRole=$.trim($("#user_role").val());
	if(userRole==undefined || userRole==''){
		xjValidate.showTip("请选择客户角色!");
		return;
	}
	
	//组织机构代码证
	var orgNum = $.trim($("#CorgNum").val());
	//税务登记号
	var taxNum = $.trim($("#CtaxNum").val());
	
	//11、邮编校验
	var postcode = $.trim($("#Cpostcode").val());
	var postreg =  /^[0-9][0-9]{5}$/;
	if(postcode!=undefined && postcode!='' && !postreg.test(postcode)){
		xjValidate.showTip("请输入有效的邮编");
		return;
	}
	
	//12、传真校验
	var fax = $.trim($("#Cfax").val());
	var faxreg = /^(\d{3,4}-)?\d{7,8}$/;
	if(fax!=undefined && fax!='' && !faxreg.test(fax)){
		xjValidate.showTip("传真格式为:XXX-12345678或XXXX-1234567或XXXX-12345678");
		return;
	}
	
	//13、电子邮箱校验
	var email = $.trim($("#Cemail").val());
	var emailreg = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g;
	if(email!=undefined && email!='' && !emailreg.test(email)){
		xjValidate.showTip("请输入有效的邮箱地址");
		return;
	}
	
	//14、开户行校验
	var bankName= $.trim($("#CbankName").val());
	/*if(bankName==undefined || bankName==""){
		xjValidate.showTip("开户行不能为空");
		return;
	}*/
	
	if(bankName.length>70){
		xjValidate.showTip("开户行不能超过35个汉字");
		return;
	}
	
	//15、开户名校验
	var accountName = $.trim($("#CaccountName").val());
	/*if(accountName==undefined || accountName==""){
		xjValidate.showTip("开户名不能为空");
		return;
	}*/
	
	if(accountName.length>40){
		xjValidate.showTip("开户名不能超过20个汉字");
		return;
	}
	
	//16、银行账号校验
	var bankAccount = $.trim($("#CbankAccount").val());
	/*if(bankAccount==undefined || bankAccount==""){
		xjValidate.showTip("银行账号不能为空");
		return;
	}
	*/
	//17、道路运输许可证号校验
	var roadTransportPermitNum = $.trim($("#CroadTransportPermitNum").val());
	/*if(roadTransportPermitNum==undefined || roadTransportPermitNum==""){
		xjValidate.showTip("道路运输许可证号不能为空");
		return;
	}*/
	
	if(roadTransportPermitNum.length>30){
		xjValidate.showTip("道路运输许可证号的长度不能超过15个字符!");
		return;
	}
	
	//18、备注校验
	var remarks= $.trim($("#Cremarks").val());
	if(remarks!=undefined && remarks!="" && remarks.length>160){
		xjValidate.showTip("备注信息不能超过80个汉字");
		return;
	}
	
	//19、三证信息校验
	var isCombine = $("#is_combine").val();
	if(isCombine==undefined || isCombine==""){
		xjValidate.showTip("请选择是否三证合一");
		return;
	}
	
	//营业执照附件
	var licenseImg = $.trim($("#license_img").val());
	//税务登记证附件
	var taxImg = $.trim($("#tax_img").val());
	//组织机构代码证附件
	var orgImg = $.trim($("#org_img").val());
	if(isCombine==1){
		
		if(licenseImg==undefined || licenseImg==null){
			xjValidate.showTip("请上传三证相关信息!");
			return;
		}
		
	}else{
		
		if(orgNum==undefined || orgNum==""){
			xjValidate.showTip("组织机构代码证不能为空!");
			return;
		}
		
		if(taxNum==undefined || taxNum==""){
			xjValidate.showTip("税务登记号不能为空!");
			return;
		}
		
		if(licenseImg==undefined || licenseImg==null){
			xjValidate.showTip("请上传营业执照附件!");
			return;
		}
		if(taxImg==undefined || taxImg==null){
			xjValidate.showTip("请上传税务登记证附件!");
			return;
		}
		if(orgImg==undefined || orgImg==null){
			xjValidate.showTip("请上传组织机构代码证附件!");
			return;
		}
	}
	
	$.ajax({
		url:"updateCMation",
		data:$("#update_constomer_info_form").serialize(),
		dataType:"json",
		type:"post",
		async:false,
		success:function(resp){
			if(resp){
				if(resp.success){
					$("#show_coustomer_info").html("");
					xjValidate.showPopup(resp.msg,"提示",true);
					list(1);
				}else{
					xjValidate.showTip(resp.msg);
				}
			}else{
				xjValidate.showPopup("异常繁忙,请稍后再试!","提示",true);
			}
		}
	});
	
}