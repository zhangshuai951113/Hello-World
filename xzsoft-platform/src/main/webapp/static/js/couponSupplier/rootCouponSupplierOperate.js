//调用全查
$(function(){
	list(1);
	
	//停用弹窗初始化
	$("body").on("click",".disable-operation",function(){
		//初始化模板描述
		$("#myModalLabel").html("有价券供应商停用");
		$("#modal_opearate_title").html("停用原因:");
		$("#modal_opearate_reason").val("");
		$("#modal_opearate_reason").attr("placeholder","请输入停用原因");
		$("#modal_coupon_supplier_id").attr("operate-type",0);
		
		var couponSupplierId = c_id;
		//主键ID存在则进行编辑
		if(couponSupplierId){
			$("#modal_coupon_supplier_id").val(couponSupplierId);
		}
	});
	
	//启用弹窗初始化
	$("body").on("click",".enabled-operation",function(){
		//初始化模板描述
		$("#myOptModalLabel").html("有价券供应商启用");
		$("#modal_opearate_title").html("启用原因:");
		$("#modal_opearate_reason").val("");
		$("#modal_opearate_reason").attr("placeholder","请输入启用原因");
		$("#modal_coupon_supplier_id").attr("operate-type",1);
		
		var couponSupplierId = c_id;
		//主键ID存在则进行编辑
		if(couponSupplierId){
			$("#modal_coupon_supplier_id").val(couponSupplierId);
		}
	});
	
	//全选/全不选
	$("body").on("click",".all_coupon_supplier_check",function(){
		if($(".all_coupon_supplier_check").is(":checked")){
			//全选时
			$(".sub_coupon_supplier_check").each(function(){
				$(this).prop("checked",true);
			});
		}else{
			//全不选时
			$(".sub_coupon_supplier_check").each(function(){
				$(this).prop("checked",false);
			});
		}
	});
	
	//允许表格拖着
	$("#tableDrag").colResizable({
	  liveDrag:true, 
	  gripInnerHtml:"<div class='grip'></div>", 
	  draggingClass:"dragging"
	});
	
});

/**
 * 绑定上传事件的dom对象
 * @author luojuan 2017年6月5日
 */
function uploadLoadFile(btn) {
	new AjaxUpload(btn,{
   		action: basePath + '/upload/imageUpload',
   		name: 'myfile',
		dataType: 'json',
   		onSubmit : function(file , ext){
   			//文件上传格式校验
   			if (!(ext && /^(jpg|png|bmp)$/.test(ext.toLowerCase()))){
   				xjValidate.showPopup("请上传格式为 jpg|png|bmp 的图片","提示",true);
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
   					xjValidate.showPopup(resultJson.errorMsg,"提示",true);
   	   				return;
   				}
   			}else{
   				xjValidate.showPopup("服务器异常，请稍后重试","提示",true);
   				return;
   			}

		}
	});
}

/**
 * 初始化三证合一显示
 * @author luojuan 2017年6月2日
 */
function initIsCombine(){
	//取出是否三证合一字段
	var isCombine = $("#is_combine").val();
	//若是三证合一则隐藏税务登记证与组织机构代码证
	if(isCombine && isCombine==1){
		$("#tax_num_div").hide();
		$("#org_num_div").hide();
		$("#tax_img_div").hide();
		$("#org_img_div").hide();
	}
}

/**
 * 下列选择切换是否三证合一
 * @author luojuan 2017年6月2日
 */
function changeIsCombine(){
	//取出是否三证合一字段
	var isCombine = $("#is_combine").val();
	//若是三证合一则隐藏税务登记证与组织机构代码证
	if(isCombine && isCombine==1){
		$("#tax_num_div").hide();
		$("#org_num_div").hide();
		$("#tax_img_div").hide();
		$("#org_img_div").hide();
	}
	//若不是三证合一则显示税务登记证与组织机构代码证
	else{
		$("#tax_num_div").show();
		$("#org_num_div").show();
		$("#tax_img_div").show();
		$("#org_img_div").show();
	}
}

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

/**
 * 页面跳转
 */
  function jumpPage(e) {
    var value = $(e).prev().find('input').val();
    pagination.setCurrentPage(value);
  }
  

/**
 * 进入页面查询有价券供应商
 * @author luojuan 2017年6月1日
 * 
 */
function list(number){
	$("#tableList").html("");
	var supplierName=$("#supplierName").val();
	var isAvailable=$("#isAvailable").val();
	$.ajax({
		url:"getCouponSupplierInfoById",
		data:{supplierName:supplierName,isAvailable:isAvailable,"page":number-1,"rows":10},
		type:"post",
		async:false,
		dataType:"json",
		success:function(responseText){
			var objs=eval(responseText);
			$.each(objs,function(index,ele){
				var tr = " <tr class='table-body azure'>";
					tr+="		<td><label class='i-checks'><input name='all' type='checkbox' class='sub_coupon_supplier_check' data-id=\""+ele.id+"\"><i></i></label></td>";
				//	tr+="		<td>"+ele.id+"</td>";
					tr+="		<td>"+ele.supplierName+"</td>";
					tr+="		<td>"+ele.supplierScopeDesc+"</td>";
					tr+="		<td>"+ele.contactName+"</td>";
					tr+="		<td>"+ele.mobilePhone+"</td>";
					tr+="		<td>"+ele.telephone+"</td>";
					tr+="		<td>"+ele.fax+"</td>";
					tr+="		<td>"+ele.createUserStr+"</td>";
					tr+="		<td>"+ele.createTimeStr+"</td>";
					tr+="		<td>"+ele.isAvailableStatus+"</td>";
					if(ele.isAvailable==1){
						tr+="		<td class='operation'>";
						tr+="           <div class='disable-operation operation-m' onclick='operateCouponSupplier(\""+ele.id+"\")'><div class='disable-icon'></div><div class='text'>停用</div></div>";
						tr+="           <div class='modify-operation operation-m' onclick='updateCouponSupplierInfo(\""+ele.id+"\")'><div class='modify-icon'></div><div class='text'>修改</div></div>";
						tr+="           <div class='delete-operation operation-m' onclick='deleteCouponSupplierInfo(\""+ele.id+"\")'><div class='delete-icon'></div><div class='text'>删除</div></div>";
						tr+="		</td>";
						tr+="</tr>";
					}else{
						tr+="		<td class='operation'>";
						tr+="           <div class='enabled-operation operation-m' onclick='operateCouponSupplier(\""+ele.id+"\")'><div class='enabled-icon'></div><div class='text'>启用</div></div>";
						tr+="           <div class='modify-operation operation-m' onclick='updateCouponSupplierInfo(\""+ele.id+"\")'><div class='modify-icon'></div><div class='text'>修改</div></div>";
						tr+="           <div class='delete-operation operation-m' onclick='deleteCouponSupplierInfo(\""+ele.id+"\")'><div class='delete-icon'></div><div class='text'>删除</div></div>";
						tr+="		</td>";
						tr+="</tr>";
					}
					
				//将tr追加到
				$("#tableList").append(tr);
			});
		}
	});
	
	//模糊查询
	$("#searchCouponSupplierInfo").click(function(){
		list(1);
	});
	
	//获取最大数据记录数
	$.ajax({
		 url:"getCount",
		 type:"post",
		 data:{supplierName:supplierName,isAvailable:isAvailable,"page":number-1,"rows":2},
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 pagination.setTotalItems(resp);
			 $("#panel-num").text("搜索结果共"+resp+"条");
		 }
	});
}



/**
 * 新增/编辑有价券供应商初始化页
 * @param orgInfoRootId 主机构ID
 * @author luojuan 2017年6月1日
 */
function addOrEditCouponSupplierInfoPage(id){
	//定义封装操作类型 1:新增 2:编辑
	var operateType;
	if(id!=undefined && id!=""){
		operateType = 2;
	}else{
		operateType = 1;
	}
	//请求地址
	var url = basePath + "/couponSupplierInfo/initCouponSupplierPage #coupon-supplier-data-info";
	$("#show_coupon_supplier_info").load(url,{"id":id,"operateType":operateType},function(){
		initIsCombine();
		//上传图片初始化
		$('.upload_img').each(function(){
			uploadLoadFile($(this));
		})
	})
	
	//关闭弹框
	$("body").on("click",".coupon-supplier-opt-close",function(){
		$("#show_coupon_supplier_info").empty();
	});
}



/**
 * 新增有价券供应商
 * @author luojuan 2017年6月2日
 */
function saveCouponSupplierInfo(){
	//1、供应商名称校验
	var supplierName = $.trim($("#c_supplierName").val());
	if(supplierName==undefined || supplierName==""){
		xjValidate.showTip("供应商名称不能为空");
		return;
	}
	
	//供货范围校验
	var supplierScopeDesc = $.trim($("#c_supplier_scope_desc").val());
	if(supplierScopeDesc.length>100){
		xjValidate.showTip("供货范围不能超过50个汉字");
		return;
	}
	
	//注册地址校验
	var registerAddress = $.trim($("#c_register_address").val());
	if(registerAddress.length>100){
		xjValidate.showTip("注册地址不能超过50个汉字");
		return;
	}
	
	//通讯地址校验
	var contactAddress = $.trim($("#c_contact_address").val());
	if(contactAddress.length>100){
		xjValidate.showTip("通讯地址不能超过50个汉字");
		return;
	}
	
	
	//11、邮编校验
	var postcode = $.trim($("#c_postcode").val());
	var postreg =  /^[0-9][0-9]{5}$/;
	if(postcode!=undefined && postcode!="" && !postreg.test(postcode)){
		xjValidate.showTip("请输入有效的邮编");
		return;
	}
	
	//法人姓名校验
	var legalPersonName = $.trim($("#c_legal_person_name").val());
	if(legalPersonName.length>100){
		xjValidate.showTip("法人姓名不能超过50个汉字");
		return;
	}
	
	//法人身份证号校验
	var legalPersonCardCode = $.trim($("#c_legal_person_card_code").val());
	if(legalPersonCardCode.length>100){
		xjValidate.showTip("法人身份证号不能超过50个汉字");
		return;
	}
	var cardreg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
	if(!cardreg.test(legalPersonCardCode)){
		xjValidate.showTip("请输入有效的法人身份证号");
		return;
	}
	
	//4、联系人姓名校验
	var contactName = $.trim($("#c_contact_name").val());
	if(contactName.length>100){
		xjValidate.showTip("联系人姓名不能超过50个汉字");
		return;
	}
	
	//5、移动电话校验
	var mobilePhone = $.trim($("#c_mobile_phone").val());
	var myreg = /^1[34578]\d{9}$/; 
	if(!myreg.test(mobilePhone)){
		xjValidate.showTip("请输入有效的手机号");
		return;
	}
	
	//7、固定电话校验
	var telephone = $.trim($("#c_telephone").val());
	var telereg = /^((0\d{2,3})-)(\d{7,8})$/;
	if(!telereg.test(telephone)){
		xjValidate.showTip("请输入有效的固定电话");
		return;
	}
	
	//9、统一社会信用代码校验
	var creditCode = $.trim($("#c_credit_code").val());
	if(creditCode.length>100){
		xjValidate.showTip("统一社会信用代码不能超过50个汉字");
		return;
	}
	
	//12、传真校验
	var fax = $.trim($("#c_fax").val());
	var faxreg = /^(\d{3,4}-)?\d{7,8}$/;
	if(fax!=undefined && fax!="" && !faxreg.test(fax)){
		xjValidate.showTip("传真格式为:XXX-12345678或XXXX-1234567或XXXX-12345678");
		return;
	}
	
	//13、电子邮箱校验
	var email = $.trim($("#c_email").val());
	var emailreg = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g;
	if(email!=undefined && email!=""&& !emailreg.test(email)){
		xjValidate.showTip("请输入有效的邮箱地址");
		return;
	}
	
	//14、开户行校验
	var bankName= $.trim($("#c_bank_name").val());
	if(bankName.length>60){
		xjValidate.showTip("开户行不能超过30个汉字");
		return;
	}
	
	//15、开户名校验
	var accountName = $.trim($("#c_account_name").val());
	if(accountName.length>100){
		xjValidate.showTip("开户名不能超过50个汉字");
		return;
	}
	
	//16、银行账号校验
	var bankAccount = $.trim($("#c_bank_account").val());
	if(accountName.length>40){
		xjValidate.showTip("银行账号不能超过40个数字");
		return;
	}
	
	//18、备注校验
	var remarks= $.trim($("#c_remarks").text());
	if(remarks!=undefined && remarks!="" && remarks.length>200){
		xjValidate.showTip("备注信息不能超过100个汉字");
		return;
	}
	
	//19、三证信息校验
	console.log($('#is_combine'));
	var isCombine = $("#is_combine").val();
	
	if(isCombine==undefined || isCombine==""){
		xjValidate.showTip("请选择是否三证合一");
		return;
	}
	
	//营业执照号
	var licenseNum = $.trim($("#c_license_num").val());
	//组织机构代码证
	var orgNum = $.trim($("#c_org_num").val());
	//税务登记号
	var taxNum = $.trim($("#c_tax_num").val());
	//营业执照附件
	var licenseImg = $.trim($("#license_img").val());
	//税务登记证附件
	var taxImg = $.trim($("#tax_img").val());
	//组织机构代码证附件
	var orgImg = $.trim($("#org_img").val());
	if(isCombine==1){
		var checkIsCombine = licenseNum!=undefined && licenseNum!="" && licenseImg!=undefined && licenseImg!="";
		if(!checkIsCombine){
			xjValidate.showTip("请填写三证相关信息");
			return;
		}
	}else{
		var checkIsCombine = licenseNum!=undefined && licenseNum!="" && licenseImg!=undefined && licenseImg!=""
						   	&&orgNum!=undefined && orgNum!="" && orgImg!=undefined && orgImg!=""
							&&taxNum!=undefined && taxNum!="" && taxImg!=undefined && taxImg!="";
		if(!checkIsCombine){
			xjValidate.showTip("请填写三证相关信息");
			return;
		}
	}
	
	//保存信息
	$.ajax({
		url : basePath + "/couponSupplierInfo/addOrUpdateCouponSupplier",
		asyn : false,
		type : "POST",
		data : $('#coupon_supplier_form').serialize(),
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					xjValidate.showPopup("保存成功","提示",true);
					//关闭弹框
					$("#show_coupon_supplier_info").empty();
					//刷新页面
					window.location.href = basePath+"/couponSupplierInfo/rootCouponSupplierInfoInitPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup("保存有价券供应商信息异常，请稍后重试","提示",true);
				return;
			}
		}
	});

}

/**
 * 修改有价券供应商
 * @author luojuan 2017年6月5日
 */
function updateCouponSupplierInfo(id){
	addOrEditCouponSupplierInfoPage(id);
}

/**
 * 删除勾选有价券供应商
 */
function deleteCheckdCouponSupplierInfo(){
	var couponSupplierInfoIds = findAllCheckCouponSupplierIds();
	
	if(couponSupplierInfoIds==undefined || couponSupplierInfoIds==""){
		xjValidate.showPopup("请选择需要删除的有价券供应商","提示",true);
		return;
	}
	
	//根据有价券供应商ID删除有价券供应商
	deleteCouponSupplierInfo(couponSupplierInfoIds);
}

/**
 * 删除有价券供应商
 * @author luojuan 2017年6月5日
 */
function deleteCouponSupplierInfo(couponSupplierInfoIds){
	//有价券供应商ID不能为空
	if(couponSupplierInfoIds==undefined || couponSupplierInfoIds==""){
		xjValidate.showPopup("请选择需要删除的有价券供应商","提示",true);
		return;
	}
	
	$.confirm({
		title: "提示",
		content: "是否要删除该数据？",
		buttons: {
	    	'确认': function () {
	    		$.ajax({
	    			url : basePath + "/couponSupplierInfo/deleteCouponSupplier",
	    			asyn : false,
	    			type : "POST",
	    			data : {"couponSupplierInfoIds":couponSupplierInfoIds},
	    			dataType : "json" ,
	    			success : function(dataStr) {
	    				if(dataStr){
	    					if(dataStr.success){
	    						xjValidate.showPopup("删除成功","提示",true);
	    						//刷新页面
	    						window.location.href = basePath+"/couponSupplierInfo/rootCouponSupplierInfoInitPage";
	    					}else{
	    						xjValidate.showPopup(dataStr.msg,"提示",true);
	    						return;
	    					}
	    				}else{
	    					xjValidate.showPopup("删除有价券供应商信息异常，请稍后重试","提示",true);
	    					return;
	    				}
	    			}
	    		});
	    	},
	        '取消': function () {
	        	
	        }
	    }
	});
}

var c_id = "";
/**
 * 显示启用/停用有价券供应商
 * @author luojuan 2017年6月6日
 */
function operateCouponSupplier(id,isAvailable){
	c_id = id;
	c_isAvailables = isAvailable;
	$("#disableModal").modal("show");
}

/**
 * 启用/停用有价券供应商
 * @author luojuan 2017年6月6日
 *
 */
function operateSubCouponSupplier(){
	
	//操作类型
	var operateType = $("#modal_coupon_supplier_id").attr("operate-type");
	if(operateType==undefined || operateType==""){
		xjValidate.showPopup("操作类型不能为空","提示",true);
		return;
	}
	
	//操作名称
	var operateName;
	if(operateType == 1){
		operateName = "停用";
	}else if(operateType == 0){
		operateName = "启用";
	}else{
		xjValidate.showPopup("未知操作","提示",true);
		return;
	}
	
	//操作有价券供应商
	var couponSupplierId = c_id;
	if(couponSupplierId==undefined || couponSupplierId==""){
		xjValidate.showPopup("有价券供应商不能为空","提示",true);
		return;
	}
	
	//操作原因
	var remarks = $.trim($("#modal_opearate_reason").val());
	if(remarks==undefined || remarks==""){
		xjValidate.showPopup("有价券供应商"+operateName+"原因不能为空","提示",true);
		return;
	}
	
	if(remarks.length>200){
		xjValidate.showPopup("有价券供应商"+operateName+"原因不能超过100个汉字","提示",true);
		return;
	}
	//保存有价券供应商启用/停用
	$.ajax({
		url : basePath + "/couponSupplierInfo/operateSubCouponSupplierInfo",
		asyn : false,
		type : "POST",
		data : {"couponSupplierId":couponSupplierId, "operateType":operateType, "remarks":remarks},
		dataType : "json" ,
		success : function(dataStr) {
			if(dataStr){
				if(dataStr.success){
					//commonUtil.showPopup("提示",operateName+"成功");
					//关闭弹框
					$('#disableModal').modal('hide');
					//刷新页面
					window.location.href = basePath+"/couponSupplierInfo/rootCouponSupplierInfoInitPage";
				}else{
					xjValidate.showPopup(dataStr.msg,"提示",true);
					return;
				}
			}else{
				xjValidate.showPopup(operateName+"有价券供应商服务异常忙，请稍后重试","提示",true);
				return;
			}
		}
	});
}

//下载模板
function downExample(){
    var url = basePath + "/couponSupplierInfo/downTemplate";
    $('#downExampleTemplate').attr('action', url);
    $('#downExampleTemplate').submit();
}

/**
 * 获取所有选中的有价券供应商ID
 * 
 * @author luojuan 2017年6月18日
 * @returns 有价券供应商ID，逗号分隔
 */
function findAllCheckCouponSupplierIds(){
	//所有选中有价券ID
	var couponSupplierInfoIds = new Array();
	$(".sub_coupon_supplier_check").each(function(){
		if($(this).is(":checked")){
			couponSupplierInfoIds.push($(this).attr("data-id"))
		}
	});
	
	return couponSupplierInfoIds.join(",");
}
