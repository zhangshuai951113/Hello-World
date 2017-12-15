
function toChar(data) {
	if (data == null) {
		data = "";
	}
	return data;
}
  var couponarray = [];
  var waybillPage = null;
  var formulaPage = null;
  var waybillPage = null;
  var computerData = "";   //计算所用参数
  (function ($) {
	  judgeValue();
	  $("#lookAttachment").hide();
   // uploadLoadFile($(".file-btn"));
    //时间调用插件（精确到时分秒）
    setTimeout(function () {
      $(".date-time-ss").datetimepicker({
        format: "YYYY-MM-DD HH:mm:ss",
        autoclose: true,
        todayBtn: true,
        todayHighlight: true,
        showMeridian: true,
        useSeconds: true
      });
    }, 500)
    
     //时间调用插件
    setTimeout(function () {
      $(".date-time").datetimepicker({
        format: "YYYY-MM-DD",
        autoclose: true,
        todayBtn: true,
        todayHighlight: true,
        showMeridian: true,
        pickTime: false
      });
    }, 500)
    
    //初始有价卷列表page页面
    couponPage = $("#couponPage").operationList({
    "current":1,    //当前目标
    "maxSize":4,  //前后最大列表
    "itemPage":10,  //每页显示多少条
    "totalItems":0,  //总条数
    "chagePage":function(current){
      //调用ajax请求拿最新数据
    	couponSelect(current);
    }
    });
    
    /**
     *有价卷page页跳转
     */
     function couponPageSlect(e) {
       var value = $(e).prev().find('input').val();
       couponPage.setCurrentPage(value);
     }

     
     //初始运单编号列表page页面
     waybillPage = $("#waybillPage").operationList({
     "current":1,    //当前目标
     "maxSize":4,  //前后最大列表
     "itemPage":10,  //每页显示多少条
     "totalItems":0,  //总条数
     "chagePage":function(current){
       //调用ajax请求拿最新数据
    	 waybillSelect(current); 
     }
     });
     
     /**
      *运单编号page页跳转
      */
      function waybillPageSlect(e) {
        var value = $(e).prev().find('input').val();
        waybillPage.setCurrentPage(value);
      }
      
      
      //初始结算公式列表page页面
   /*   formulaPage = $("#formulaPage").operationList({
      "current":1,    //当前目标
      "maxSize":4,  //前后最大列表
      "itemPage":10,  //每页显示多少条
      "totalItems":0,  //总条数
      "chagePage":function(current){
        //调用ajax请求拿最新数据
    	  formulaSelect(current)
      }
      });*/
      
      /**
       *结算公式page页跳转
       */
     /*  function formulaPageSlect(e) {
         var value = $(e).prev().find('input').val();
         formulaPage.setCurrentPage(value);
       }*/
      
		//运单数据较多，增加滑动
		
  	$(".iscroll-waybill").mCustomScrollbar({
  		theme: "minimal-dark",
  		setLeft:"0px"
  		});
    
  }(jQuery))
  
  //带模糊条件的模糊查询
  $("#selectCounponInfo").click(function(){
	  couponSelect(1);
  });
  
  /**
  * 查询有价券
  */
  function couponSelect(pageNo) {
		$("#couponTbody").empty();
		$("#couponTbody").html("");
		var cardCode = $("#mhcardCode").val();
	  var pageSizeStr = '10';
	  var entrust =  $("#entrust").val(); 
	  if(!entrust){
		  xjValidate.showPopup('请先选择运单！',"提示");
		  return;
	  }
	  var selectData = {
				curPage : pageNo,
				pageSizeStr : pageSizeStr,
				cardCode:cardCode,
				couponOrgInfoId:entrust
	  					}
	  $.ajax({
	    	url:basePath+"/settlementInfo/findCUInfoByOInfoId",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:selectData,
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	var jsonAll = data;
	        	var jsonList = jsonAll.cList;
	        	var sInfoTotalCount = jsonAll.totalCount;
	        	var flag = $("#flag").val();
	        	$("#couponNum").text("搜索结果共"+sInfoTotalCount);
	        	couponPage.setTotalItems(sInfoTotalCount);
	        	$.each(jsonList,function(i, val) {
	        		if(flag == '1'){//新增
	        			val.userPrice = 0;
	        	                   }
	    			$("#couponTbody").append("<tr class='table-body'><td><label class='i-checks'>" +
	    					"<input data-id='1' data-name='00000001' class='coupon-check' name = 'couponRadioName' id = 'couponCheckbox' type='checkbox'></label></td>" +
	    					"<td>"+toChar(val.id)+"</td>" +
	    					"<td style>"+toChar(val.cardCode)+"</td>" +
	    					"<td>"+toChar(val.couponName)+"</td>" +
	    					"<td><input id='userMoney'oninput='computeBalance(this)' style='border: none;color: #e41717;height: 25px;text-align: center;' value='"+setZero(val.userPrice)+"'  /></td>" +
	    					"<td><input id='balance' readonly = 'readonly' style='border: none;height: 25px;text-align: center;' value='"+toChar(val.balance)+"'/></td>" +
	    					"<td>"+toChar(val.money)+"</td>" +
	    					"<td>"+toChar(val.couponType)+"</td>" +
	    					"<td>"+toChar(val.taxRate)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.couponTypeInfoId)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.balance+val.userPrice)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.couponInfoId)+"</td>" +
	    					"</tr>");
	    		})
	    		$("#couponSelectModal").modal('show');
	        	
	        	/*setTimeout(function(){
	    			$("#couponTable").colResizable({
	    		      liveDrag:true, 
	    		      gripInnerHtml:"<div class='grip'></div>", 
	    		      draggingClass:"dragging",
	    		      ifDel: 'wlTable'
	    		    });
	    		},1000)*/
	        }
	    })
  }
  /**
   * 实时修改余额
   * */
  function computeBalance(obj){
	  var userMoney = $(obj).val();
	  var ftd = $(obj).parents("td");
	  var money = ftd.next().next().html();
	  var balance = ftd.next().children().eq(0).val();
	  var defaultBalance = ftd.next().next().next().next().next().next().html();
	  if(eval(userMoney)>eval(defaultBalance)){//假如使用金额大于余额
		  xjValidate.showTip("使用金额不能大于余额");
		  $(obj).val(0);
		  ftd.next().children().eq(0).val(defaultBalance);
		  return;
	  }
	  ftd.next().children().eq(0).val(defaultBalance-userMoney);
  }
 
  
  //是否报销监听事件
  function selectExpense(){
		var isExpense = $("#isExpense").val();
		//如是否报销为否则清空报销字段数据和展示有价券信息
		if(isExpense == 0){
			$("#expensePrice").val(0);
			$("#expenseType").val(0);
			$("#couponMoney").val("");
			$("#couponInfoDiv").show();
			$("#expensePriceDiv").hide();
			$("#expenseTypeDiv").hide();
		}else{
			 $("#couponMoney").val(0);
			 $("#taxRate").val(0);
			//如是否报销为是则清空有价券字段数据和展示报销信息
			$("#expenseType").val(1);
			$("#expensePrice").val("");
			$("#couponInfoDiv").hide();
			$("#expensePriceDiv").show();
			$("#expenseTypeDiv").show();
		}
	}
  
  //修改时页面加载
  function loadExpense(){
		var isExpense = $("#isExpense").val();
		//如是否报销为否则清空报销字段数据和展示有价券信息
		if(isExpense == 0){
			$("#couponInfoDiv").show();
			$("#expensePriceDiv").hide();
			$("#expenseTypeDiv").hide();
		}else{
			$("#couponInfoDiv").hide();
			$("#expensePriceDiv").show();
			$("#expenseTypeDiv").show();
		}
	}
  /**
   *选择并保存有价券
   */
  function submitSelectCoupon() {
  var selectlist = findAllCheck(".coupon-check");
  if (selectlist.length == 0) {
    xjValidate.showTip("请选择要使用的有价券");
    return;
  }
  var userMoneys = 0;
  var taxRate;
  var cardCodeStr = "";
	    $("#couponCheckbox:checked").each(function() {
	    	var couponUserId = $(this).parents("tr").children().eq(1).html();
	    	var cardCode = $(this).parents("tr").children().eq(2).html();
	    	var couponTypeInfoId = $(this).parents("tr").children().eq(9).html();
	    	taxRate = $(this).parents("tr").children().eq(8).html();
	    	var userMoney = $(this).parents("tr").children().eq(4).children().eq(0).val();
	    	var balance = $(this).parents("tr").children().eq(5).children().eq(0).val();
	    	var couponInfoId =$(this).parents("tr").children().eq(11).html();
	    	cardCodeStr +=cardCode +",";
	    	userMoneys = eval(userMoneys)+eval(userMoney);
	    	var json = {"couponUseInfoId":couponUserId,"couponInfoId":couponInfoId,"couponTypeInfoId":couponTypeInfoId,"usePrice":userMoney,"balance":balance}
	    	couponarray.push(json);
	    })
	    $("#cardCode").html(cardCodeStr);
	    $("#couponSelectModal").modal('hide');
	    $("#couponMoney").val(userMoneys);
	    $("#couponMoney").attr("readonly","readonly");
	    $("#taxRate").val(taxRate);
	    
  }
 /* function submitSelectCoupon() {
    var selectlist = findAllCheck(".coupon-check");
    if(selectlist.length==0 || selectlist.length>1) {
      xjValidate.showPopup("请选择一条数据！","提示");
      return;
    }
    var ftr = $("#couponRadio:checked").parents("tr");
    var couponId = ftr.children().eq(1).html();    //领用单号
    var couponInfoId = ftr.children().eq(2).html();  //有价券编号
    var couponName = ftr.children().eq(3).html();    //有价券名称
    var money = ftr.children().eq(4).html();  //领用金额 --有价券金额
    var couponType = ftr.children().eq(5).html();  //有价券类型
    var taxRate = ftr.children().eq(6).html();  //进项税税率
    
    $("#couponMoney").val(money);
    $("#couponInfoId").val(couponInfoId);
    $("#couponId").val(couponId);
    $("#couponType").val(couponType);
    $("#taxRate").val(taxRate);
    $("#couponInfoId").attr("readonly","readonly");//设为只读
    $("#selectCoupon").val(selectlist[0].name);
    $("#selectCoupon").next("input").val(selectlist[0].id);
    $("#couponSelectModal").modal('hide');
  }*/


  /**
  * 查询结算公式
  */
/*  function formulaSelect(pageNo) {
	  var Waybill = $("#selectWaybill").val();
	  if(Waybill == null || Waybill == ""){
		  xjValidate.showPopup("请先选择运单！","提示");
		  return;
	  }
	  $("#formulaTbody").html("");
	  $("#formulaTbody").empty();
	  var entrustOrgId = $("#entrustOrgRoot").val();
	  var entrust = $("#entrust").val();
	  var waybillInfoId = $("#waybillInfoId").val();
	  var pageSizeStr = '10';
	  $.ajax({
	    	url:basePath+"/settlementInfo/findSettlementforBill",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{curPage:pageNo,
				pageSizeStr:pageSizeStr,
				entrust:entrust,
				entrustOrgId:entrustOrgId,
				waybillInfoId:waybillInfoId},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	var jsonAll = data;
	        	var jsonList = jsonAll.sfList;
	        	var sInfoTotalCount = jsonAll.totalCount;
	        	$("#formulaNum").text("搜索结果共"+sInfoTotalCount);
	        	formulaPage.setTotalItems(sInfoTotalCount);
	        	$.each(jsonList,function(i, val) {
	    			$("#formulaTbody").append("<tr class='table-body'><td><label class='i-checks'>" +
	    					"<input data-id='1' data-name='00000001' class='formula-check' name = 'formulaName' id = 'formulaRadio' type='radio'></label></td>" +
	    					"<td>"+toChar(val.id)+"</td>" +
	    					"<td>"+toChar(val.accountingEntityName)+"</td>" +
	    					"<td>"+toChar(val.overallTaxRate)+"</td>" +
	    					"<td>"+toChar(val.withholdingTaxRate)+"</td>" +
	    					"<td>"+toChar(val.incomeTaxRate)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.accountingEntity)+"</td>" +
	    					"</tr>");
	    		})
	    		$("#formulaSelectModal").modal('show');
	        }
	    })
   
  }*/

  /**
   *结算公式卷选择
   */
  /*function submitSelectFormula() {
    var selectlist = findAllCheck(".formula-check");
    if(selectlist.length==0 || selectlist.length>1) {
     // xjValidate.showTip("请选择一条数据",'#formulaSelectModal .modal-dialog');
        xjValidate.showPopup('请选择一条数据！',"提示");
      return;
    }
    var ftr = $("#formulaRadio:checked").parents("tr");
    var formulaId = ftr.children().eq(1).html();    //结算公式编号
    var accountingEntityName = ftr.children().eq(2).html();    //核算主体名称
    var overallTaxRate = ftr.children().eq(3).html();    //综合税率
    var withholdingTaxRate = ftr.children().eq(4).html();    //企业代扣税税率
    var incomeTaxRate = ftr.children().eq(5).html();    //司机运费进项税税率
    var accountingEntity = ftr.children().eq(6).html();    //核算主体
    $("#selectFormula").val(formulaId);
    $("#selectFormula").attr("readonly","readonly");//设为只读
    $("#accountingEntityName").val(accountingEntityName);
    $("#overallTaxRate").val(overallTaxRate);
    $("#withholdingTaxRate").val(withholdingTaxRate);
    $("#incomeTaxRate").val(incomeTaxRate);
    $("#accountingEntity").val(accountingEntity);
    $("#formulaSelectModal").modal('hide');
  }*/

  //模糊查询运单信息
$("#serachWaybillInfo").click(function(){
	waybillSelect(1);
})
  /**
  * 查询运单信息
  */
  function waybillSelect(pageNo) {
	  $("#wayBillTable").empty();
		$("#wayBillTable").html("");
	  var waybillId =$("#mhwaybillId").val();
	  $("#waybillSelectModal").modal('show');
	  
	  var entrustName = $("#mhentrustName").val();
	  var shipperName = $("#mhshipperName").val();
	  var goodsName = $("#mhgoodsName").val();
	  var scatteredGoods = $("#mhscatteredGoods").val();
	  var carCode =  $("#mhcarCode").val();
	  var forwardingUnit =  $("#mhforwardingUnit").val();
	  var consignee = $("#mhconsignee").val();
	  var createTime = $("#mhcreateTime").val();
	  var createTime1 =  $("#mhcreateTime1").val();
	  var forwardingTime =  $("#mhforwardingTime").val();
	  var arriveTime =  $("#mharriveTime").val();
	  var pageSizeStr = '10';
	  var selectData = {
				curPage:pageNo,
				pageSizeStr:pageSizeStr,
				entrustName:entrustName,
				shipperName:shipperName,
				goodsName:goodsName,
				scatteredGoods:scatteredGoods,
				carCode:carCode,
				forwardingUnit:forwardingUnit,
				consignee:consignee,
				createTimeStr:createTime,
				createTime1Str:createTime1,
				forwardingTimeStr:forwardingTime,
				arriveTimeStr:arriveTime
	  }
	  $.ajax({
	    	url:basePath+"/settlementInfo/findtWaybillInfo",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:selectData,
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	var jsonAll = data;
	        	var jsonList = jsonAll.waybillList;
	        	var sInfoTotalCount = jsonAll.totalCount;
	        	$("#waybillNum").text("搜索结果共"+sInfoTotalCount);
	        	waybillPage.setTotalItems(sInfoTotalCount);
	        	$.each(jsonList,function(i, val) {
	        		if(val.computeMode == '1'){
	        			val.computeMode = '发货吨位';
	        		}
	        		if(val.computeMode == '2'){
	        			val.computeMode = '到货吨位';
	        		}
	        		if(val.computeMode == '3'){
	        			val.computeMode = '最小吨位';
	        		}
	        		if(val.driverUserRole == '1'){
	        			val.driverUserRole = '内部司机';
	        		}
	        		if(val.driverUserRole == '2'){
	        			val.driverUserRole = '外协司机';
	        		}
	        		if(val.driverUserRole == '3'){
	        			val.driverUserRole = '临时司机';
	        		}
	        		if(val.deductionMode == '1'){
	        			val.deductionMode = '比例';
	        		}
	        		if(val.deductionMode == '2'){
	        			val.deductionMode = '吨位';
	        		}
	        		if(val.isInvert == '1'){
	        			val.isInvert = '是';
	        		}
	        		if(val.isInvert == '0'){
	        			val.isInvert = '否';
	        		}
	        		if(val.isProxyMode == '1'){
	        			val.isProxyMode = '是';
	        		}
	        		if(val.isProxyMode == '0'){
	        			val.isProxyMode = '否';
	        		}
	        		if(val.waybillClassify == '1'){
	        			val.waybillClassify = '大宗货物运单';
	        		}
	        		if(val.waybillClassify == '2'){
	        			val.waybillClassify = '零散货物运单';
	        		}
	        		if(val.waybillType == '1'){
	        			val.waybillType = '物流运单';
	        		}
	        		if(val.waybillType == '2'){
	        			val.waybillType = '自营运单';
	        		}
	        		if(val.waybillType == '3'){
	        			val.waybillType = '代理运单';
	        		}
	        		if(val.waybillType == '4'){
	        			val.waybillType = '转包运单';
	        		}
	        		if(val.releaseMode == '1'){
	        			val.releaseMode = '发布平台';
	        		}
	        		if(val.releaseMode == '2'){
	        			val.releaseMode = '匹配车源';
	        		}
	        		if(val.releaseMode == '3'){
	        			val.releaseMode = '派发合作伙伴';
	        		}
	        		if(val.releaseMode == '4'){
	        			val.releaseMode = '派发内部司机';
	        		}
	    			$("#wayBillTable").append("<tr class='table-body'><td><label class='i-checks'>" +
	    					"<input data-id='1' data-name='00000001' class='waybill-check' type='radio' name = 'waybillname' id = 'waybillCheck'></label></td>" +
	    					"<td>"+toChar(val.waybillId)+"</td>" +
	    					"<td>"+toChar(val.parentWaybillInfoNo)+"</td>" +
	    					"<td>"+toChar(val.rootWayblillInfoNo)+"</td>" +
	    					"<td>"+toChar(val.carCode)+"</td>" +
	    					"<td>"+toChar(val.entrustName)+"</td>" +
	    					"<td>"+toChar(val.shipperName)+"</td>" +
	    					"<td>"+toChar(val.driverName)+"</td>" +
	    					"<td>"+toChar(val.forwardingTonnage)+"</td>" +
	    					"<td>"+toChar(val.arriveTonnage)+"</td>" +
	    					"<td>"+format(new Date(val.forwardingTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"<td>"+format(new Date(val.arriveTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"<td style='display:none'>"+toChar(val.driverUserRole)+"</td>" +
	    					"<td>"+toChar(val.goodsName)+"</td>" +
	    					"<td>"+toChar(val.scatteredGoods)+"</td>" +
	    					"<td>"+toChar(val.lineName)+"</td>" +
	    					"<td>"+toChar(val.forwardingUnit)+"</td>" +
	    					"<td>"+toChar(val.consignee)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.projectName)+"</td>" +
	    					"<td>"+toChar(val.advanceCharge)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.computeMode)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.deductionMode)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.reasonableLossRatio)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.isInvert)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.reasonableLossTonnage)+"</td>" +
	    					"<td>"+toChar(val.lossDeductionPrice)+"</td>" +
	    					"<td>"+toChar(val.currentTransportPrice)+"</td>" +
	    					"<td>"+toChar(val.winningBidderPrice)+"</td>" +
	    					"<td>"+toChar(val.isProxyMode)+"</td>" +
	    					"<td>"+toChar(val.waybillClassify)+"</td>" +
	    					"<td>"+toChar(val.waybillType)+"</td>" +
	    					"<td>"+toChar(val.releaseMode)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.rootWaybillInfoId)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.parentWaybillInfoId)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.entrust)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.shipper)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.userInfoId)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.goodsInfoId)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.lineInfoId)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.entrustProject)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.entrustOrgRoot)+"</td>" +
	    					"<td style='display:none'>"+toChar(val.id)+"</td>" +
	    					"<td style='display:none'>"+format(new Date(val.planTransportDate).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"<td style='display:none'>"+val.waybillStatus+"</td>" +
	    					"<td style='display:none'>"+val.endPoints+"</td>" +
	    					"<td style='display:none'>"+val.cooperateStatus+"</td>" +
	    					"</tr>");
	    		})
	    		$('#mCSB_1_container').css('left','0');
	    		setTimeout(function(){
	    			$("#waybillTable").colResizable({
	    		      liveDrag:true, 
	    		      gripInnerHtml:"<div class='grip'></div>", 
	    		      draggingClass:"dragging",
	    		      ifDel: 'wlTable'
	    		    });
	    		},1000)
	        }
	    })
  }


  /**
   *选择运单
   */
  function submitSelectWaybill() {
    var selectlist = findAllCheck(".waybill-check");
    if(selectlist.length==0 || selectlist.length>1) {
      xjValidate.showPopup("请选择一条数据","提示");
      return;
    }
    
    var ftr = $("#waybillCheck:checked").parents("tr");
    var waybillId = ftr.children().eq(1).html();   
    var carCode = ftr.children().eq(4).html(); 
    var entrustName = ftr.children().eq(5).html(); 
    var shipperName = ftr.children().eq(6).html(); 
    var driverName = ftr.children().eq(7).html(); 
    var forwardingTonnage = ftr.children().eq(8).html(); 
    var arriveTonnage = ftr.children().eq(9).html(); 
    var forwardingTime = ftr.children().eq(10).html(); 
    var arriveTime = ftr.children().eq(11).html(); 
    var driverUserRole = ftr.children().eq(12).html(); 
    var goodsName = ftr.children().eq(13).html(); 
    var scatteredGoods = ftr.children().eq(14).html(); 
    var lineName = ftr.children().eq(15).html(); 
    var forwardingUnit = ftr.children().eq(16).html(); 
    var consignee = ftr.children().eq(17).html(); 
    var projectName = ftr.children().eq(18).html(); 
    var advanceCharge = ftr.children().eq(19).html(); 
    var computeMode = ftr.children().eq(20).html(); 
    var deductionMode = ftr.children().eq(21).html(); 
    var reasonableLossRatio = ftr.children().eq(22).html(); 
    var isInvert = ftr.children().eq(23).html(); 
    var reasonableLossTonnage = ftr.children().eq(24).html(); 
    var lossDeductionPrice = ftr.children().eq(25).html(); 
    var currentTransportPrice = ftr.children().eq(26).html(); 
    var winningBidderPrice = ftr.children().eq(27).html(); 
    var isProxyMode = ftr.children().eq(28).html(); 
    var waybillClassify = ftr.children().eq(29).html(); 
    var waybillType = ftr.children().eq(30).html(); 
    var releaseMode = ftr.children().eq(31).html(); 
    var rootWaybillInfoId = ftr.children().eq(32).html(); 
    var parentWaybillInfoId = ftr.children().eq(33).html(); 
    var entrust = ftr.children().eq(34).html(); 
    var shipper = ftr.children().eq(35).html(); 
    var userInfoId = ftr.children().eq(36).html(); 
    var goodsInfoId = ftr.children().eq(37).html(); 
    var lineInfoId = ftr.children().eq(38).html(); 
    var entrustProject = ftr.children().eq(39).html(); 
    var entrustOrgRoot = ftr.children().eq(40).html(); 
    var id = ftr.children().eq(41).html(); 
    var planTransportDate = ftr.children().eq(42).html(); 
    var waybillStatus = ftr.children().eq(43).html(); 
    var endPoints = ftr.children().eq(44).html(); 
    var cooperateStatus = ftr.children().eq(45).html(); 
    if(cooperateStatus == null || cooperateStatus == "null" || cooperateStatus == ""){
    	cooperateStatus = 0;
    }
    if(driverUserRole == '内部司机'){
    	$("#driverUserRole").val(1);
	}
	if(driverUserRole == '外协司机'){
		$("#driverUserRole").val(3);
	}
	if(driverUserRole == '临时司机'){
		$("#driverUserRole").val(2);
	}
    //假如该运单是派发给司机，并且运单状态为6：已装货 7：在途 8：已卸货 的运单
    if(userInfoId != null && userInfoId != '' && (waybillStatus == '6' || waybillStatus == '7' || waybillStatus == '8')){
    	$("#lookAttachment").show();
    }else{
    	$("#lookAttachment").hide();
    }
    if(computeMode == '发货吨位'){
		computeMode = '1';
	}
	if(computeMode == '到货吨位'){
		computeMode = '2';
	}
	if(computeMode == '最小吨位'){
		computeMode = '3';
	}
	if(driverUserRole == '内部司机'){
		driverUserRole = '1';
	}
	if(driverUserRole == '外协司机'){
		driverUserRole = '2';
	}
	if(driverUserRole == '临时司机'){
		driverUserRole = '3';
	}
	if(deductionMode == '比例'){
		deductionMode = '1';
	}
	if(deductionMode == '吨位'){
		deductionMode = '2';
	}
	if(isInvert == '是'){
		isInvert = '1';
	}
	if(isInvert == '否'){
		isInvert = '0';
	}
	if(isProxyMode == '是'){
		isProxyMode = '1';
	}
	if(isProxyMode == '否'){
		isProxyMode = '0';
	}
	if(waybillClassify == '大宗货物运单'){
		waybillClassify = '1';
	}
	if(waybillClassify == '零散货物运单'){
		waybillClassify = '2';
	}
	if(waybillType == '物流运单'){
		waybillType = '1';
	}
	if(waybillType == '自营运单'){
		waybillType = '2';
	}
	if(waybillType == '代理运单'){
		waybillType = '3';
	}
	if(waybillType == '转包运单'){
		waybillType = '4';
	}
	if(releaseMode == '发布平台'){
		releaseMode = '1';
	}
	if(releaseMode == '匹配车源'){
		releaseMode = '2';
	}
	if(releaseMode == '派发合作伙伴'){
		releaseMode = '3';
	}
	if(releaseMode == '派发内部司机'){
		releaseMode = '4';
	}
    //alert(lineInfoId);
    var isChartered = $("#isChartered").val();    //是否包车
    computerData = {
    		isChartered:isChartered,
    		isProxyMode:isProxyMode,
    		id:id,
    		carCode:carCode,
    		entrustName:entrustName,
    		shipperName:shipperName,
    		driverName:driverName,
    		driverUserRole:driverUserRole,
    		goodsName:goodsName,
    		scatteredGoods:scatteredGoods,
    		lineName:lineName,
    		forwardingUnit:forwardingUnit,
    		consignee:consignee,
    		projectName:projectName,
    		advanceCharge:advanceCharge,
    		computeMode:computeMode,
    		deductionMode:deductionMode,
    		reasonableLossRatio:reasonableLossRatio,
    		isInvert:isInvert,
    		reasonableLossTonnage:reasonableLossTonnage,
    		lossDeductionPrice:lossDeductionPrice,
    		currentTransportPrice:currentTransportPrice,
    		winningBidderPrice:winningBidderPrice,
    		isProxyMode:isProxyMode,
    		waybillClassify:waybillClassify,
    		waybillType:waybillType,
    		releaseMode:releaseMode,
    		rootWaybillInfoId:rootWaybillInfoId,
    		parentWaybillInfoId:parentWaybillInfoId,
    		entrust:entrust,
    		shipper:shipper,
    		userInfoId:userInfoId,
    		goodsInfoId:goodsInfoId,
    		lineInfoId:lineInfoId,
    		entrustProject:entrustProject,
    		waybillId:waybillId
    };
  //把结算公式的相关字段置空
    /*$("#selectFormula").val("");
    $("#selectFormula").removeAttr("readonly");//取消只读
    $("#accountingEntityName").val("");
    $("#overallTaxRate").val("");
    $("#withholdingTaxRate").val("");
    $("#incomeTaxRate").val("");
    $("#accountingEntity").val("");*/
    
  //把计算相关字段置空
    $("#lossTonnage").val("");  //扣损吨位
    $("#deductionTonnage").val("");  //扣损吨位
    $("#deductionUnitPrice").val("");  //扣款吨位
    $("#deductionPrice").val("");  //扣损金额
    $("#currentTransportPrice").val("");  //当前运价
    $("#shipperPrice").val("");  //承运方运费
    $("#payablePrice").val("");  //应付运费
    $("#proxyInvoiceTotal").val("");  //代开总额
    $("#otherTaxPrice").val("");  //其他税费
    $("#transportPriceIncomeTax").val("");  //运费进项税
    $("#incomeTax").val("");  //进项税
    $("#transportPriceCost").val("");  //运费成本
    $("#thisPayPrice").val("");  //本次付费
    $("#proxyName").val("");  //代理方名称
    $("#proxy").val("");  //代理方
    $("#actualPaymentPrice").val("");  //实付金额
  //  
    //赋值
    if(waybillClassify == '2'){ //零散货物
    	if(lineInfoId == null || lineInfoId == "null" || lineInfoId ==""){
    		lineInfoId = 0;
    	}
    	if(endPoints == null || endPoints == "null" || endPoints ==""){
    		endPoints = 0;
    	}
    //根据线路编号查询地点表主键
    	$.ajax({
	    	url:basePath+"/settlementInfo/selectLocationInfo",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{"startPoints":lineInfoId,"endPoints":endPoints},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	if(null != data){
	        		lineName = data.startPointName+"到"+data.endPointName;
	        	}
	        	}
	        });
    	
    	$("#scatteredGoodsdiv").show();//零散货物
    	$("#advancePrice").val(advanceCharge); //预付款
    	$("#isProxyMode").val(0); //是否代理设为不可用
    	$("#advancePrice").attr("readonly","readonly");//设为只读
    	$("#isProxyModediv").hide(); //是否代理隐藏
    	$("#proxyNamediv").hide(); //承运商隐藏
    	$("#proxyInvoiceTotaldiv").hide(); //承运商金额隐藏
    	$("#charteredPricediv").hide();//包车运费
    }
    
    else {
    	$("#isProxyModediv").show();
    	$("#isProxyMode").val(isProxyMode); //是否代理赋值
    	$("#scatteredGoodsdiv").hide();//零散货物
    	if(isProxyMode == '0'){//非代理模式
    		$("#proxyNamediv").hide(); //承运商隐藏
        	$("#proxyInvoiceTotaldiv").hide(); //承运商金额隐藏
        	$("#charteredPricediv").hide();//包车运费
    	}
    	if(isProxyMode == '1'){//代理模式
    		$("#proxyNamediv").show(); //承运商
        	$("#proxyInvoiceTotaldiv").show(); //承运商金额
        	$("#charteredPricediv").hide();//包车运费
    	}
    }
    if(isChartered == '0'){ //不是包车模式
    	$("#charteredPricediv").hide();//包车运费
    	$("#charteredPrice").val(0); //包车运费
    	$("#charteredPrice").attr("readonly","readonly");//设为只读
    	$("#customerPrice").attr("readonly","readonly");//设为只读
    }
    if(isChartered == '1'){ //是包车模式
    	$("#charteredPricediv").show();//包车运费
    	$("#customerPrice").removeAttr("readonly");
    }
    $("#selectWaybill").val(waybillId);               //运单号
    $("#carCode").val(carCode);               //车牌号码
    $("#waybillInfoId").val(id);               //运单编号
    $("#selectWaybill").attr("readonly","readonly");//设为只读
    $("#goodsName").val(goodsName);               //货物名称
    $("#goodsInfoId").val(goodsInfoId);               //货物
    $("#lineInfoId").val(lineInfoId);               //线路
    $("#endPoints").val(endPoints);//零散货物终点
    $("#lineName").val(lineName);               //线路名称
    $("#scatteredGoods").val(scatteredGoods);         //零散货物
    $("#forwardingUnit").val(forwardingUnit);         //发货单位
    $("#consignee").val(consignee);         //到货单位
    $("#projectName").val(projectName);         //组织部门
    $("#entrustProject").val(entrustProject);         //组织部门
    $("#entrustName").val(entrustName);         //委托方
    $("#entrust").val(entrust);         //委托方
    $("#entrustOrgRoot").val(entrustOrgRoot);         //委托方主机构
    $("#shipperName").val(shipperName);         //承运方
    $("#shipper").val(shipper);         //承运方
    $("#rootWaybillInfoId").val(rootWaybillInfoId);  //主运单编号
	$("#parentWaybillInfoId").val(parentWaybillInfoId);  //父运单编号
	$("#lineInfoId").val(lineInfoId);  //线路
	$("#userInfoId").val(userInfoId);  //司机编号
	$("#driverName").val(driverName);  //司机名称
	$("#planTransportDate").val(planTransportDate);  //计划拉运日期
	$("#cooperateStatus").val(cooperateStatus);  //运单协同状态
    $("#forwardingTonnage").val(forwardingTonnage);//发货吨位
    $("#arriveTonnage").val(arriveTonnage);//发货吨位
    $("#forwardingTime").val(forwardingTime);//发货吨位
    $("#arriveTime").val(arriveTime);//发货吨位
    $("#waybillSelectModal").modal('hide');
	    
	    //查询选择的运单是否已挂账
	/*	$.ajax({
	    	url:basePath+"/settlementInfo/findISBill",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{"id":id},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	if(data == 0){
	        		xjValidate.showPopup('该运单已挂账！',"提示");
	        		return;
	        	}
	        	if(data == 1){
	        		$("#waybillSelectModal").modal('hide');
	        	}
	        	}
	        });*/
    //查询客户运费和收、发货时间
	/*$.ajax({
    	url:basePath+"/settlementInfo/findCustomerCost",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:computerData,
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	var jsonAll = data;
        	if(null != jsonAll && jsonAll !=""){
        	var jsonStr = data.custermCost;
        	var jsonObj = data.driverWaybillMaintainPo;
          //alert(data);       
        	if(jsonStr == "-1"){
        		$("#customerPrice").val("");
        	}else{
        		$("#customerPrice").val(jsonStr);
        		$("#customerPrice").attr("readonly","readonly");//设为只读
        	}
        	if( null !=jsonObj && jsonObj != ""){
        	if(null == jsonObj.loadingDate){
        		$("#forwardingTime").val("");
        	}else{
            	$("#forwardingTime").val(format(new Date(jsonObj.loadingDate).toString(),'yyyy-MM-dd HH:mm:ss'));

        	}
        	if(null == jsonObj.unloadingDate){
        		$("#arriveTime").val("");
        	}else{
        		$("#arriveTime").val(format(new Date(jsonObj.unloadingDate).toString(),'yyyy-MM-dd HH:mm:ss'));
        	}
        }
        }
        }
    })*/
      //var entrustOrgId = $("#entrustOrgRoot").val();
	 // var entrust = $("#entrust").val();
	  var waybillInfoId = $("#waybillInfoId").val();
    //选择结算公式
/*    $.ajax({
    	url:basePath+"/settlementInfo/findSettlementforBill",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{
        	"entrustOrgId":entrustOrgId,
			"entrust":entrust
        	},
        dataType:'json',//数据传输格式：json
        success:function(data){
        	var jsonAll = data;
        	if(null != jsonAll && jsonAll != ""){
        	   $("#selectFormula").val(jsonAll.id);
        	    $("#selectFormula").attr("readonly","readonly");//设为只读
        	    $("#accountingEntityName").val(jsonAll.accountingEntityName);
        	    $("#overallTaxRate").val(jsonAll.overallTaxRate);
        	    $("#withholdingTaxRate").val(jsonAll.withholdingTaxRate);
        	    $("#incomeTaxRate").val(jsonAll.incomeTaxRate);
        	    $("#accountingEntity").val(jsonAll.accountingEntity);
        	    $("#individualIncomeTax").val(jsonAll.individualIncomeTax);
        	}
        }
    })*/

  }

  /**
   * 查找选择
   */
  function findAllCheck(element) {
    var checkList = new Array();
    $(element).each(function () {
      if ($(this).is(":checked")) {
        var params = {
          "id": $(this).attr("data-id"),
          "name": $(this).attr("data-name")
        }
        checkList.push(params);
      }
    });
    return checkList;
  }

    /**
   * 绑定上传事件的dom对象
   * @author liumin
   */
/*  function uploadLoadFile(btn) {
    //NOTE 部署环境删除地址
    new AjaxUpload(btn,{
        action: basePath + '/upload/imageUpload',
        name: 'myfile',
        dataType: 'json',
        onSubmit : function(file , ext){
          // 文件上传格式校验
          if (!(ext && /^(jpg|png|bmp|docx|doc|pdf|xls|xlsx)$/.test(ext.toLowerCase()))) {
            commonUtil.showPopup("提示", "请上传格式为 jpg|png|bmp|docx|doc|pdf|xls|xlsx 的文件");
            return;
          }
        },
        //服务器响应成功时的处理函数
        onComplete : function(file, resultJson) {
          if (resultJson) {
            resultJson = $.parseJSON(resultJson);
            // 是否成功
            var isSuccess = resultJson.isSuccess;
            // 上传附件URL
            var uploadUrl = resultJson.uploadUrl;
            if (isSuccess == "true") {
              // 附件类型
              var fileType = btn.attr("file-type");
              var fileText = btn.attr("file-text");
              $("#" + fileType).val(uploadUrl);
              $("#" + fileText).val(file);
            } else {
              commonUtil.showPopup("提示", resultJson.errorMsg);
              return;
            }
          } else {
            commonUtil.showPopup("提示", "服务器异常，请稍后重试");
            return;
          }
       }
    });
  }*/

  //计算并保存
function computeButton(){
	//$("#isCompute").val("");   //若触发了计算按钮就给该标识赋值为空
	var couponUseInfoId = $("#couponInfoId").val();   //有价券编号
	var waybillInfoId = $("#selectWaybill").val();   //运单编号
	//var settlementFormulaDetailId = $("#selectFormula").val();   //结算公式编号
	//var settlementImg = $("#fileType").val();   //附件
	var forwardingTime = $("#forwardingTime").val();   //发货日期
	var arriveTime = $("#arriveTime").val();   //到货日期
	/*if(null ==couponUseInfoId || "" == couponUseInfoId){
		xjValidate.showPopup("请选择有价券","提示");
		return;
	}
	if(null ==settlementFormulaDetailId || "" == settlementFormulaDetailId){
		xjValidate.showPopup("请选择结算公式信息","提示");
		return;
	}*/
	if(null ==waybillInfoId || "" == waybillInfoId){
		xjValidate.showPopup("请选择运单","提示");
		return;
	}
	/*if(null ==settlementImg || "" == settlementImg){
		xjValidate.showPopup("请上传附件","提示");
		return;
	}*/
	if(null == forwardingTime || "" == forwardingTime){
		xjValidate.showPopup("请输入发货日期","提示");
		return;
	}
	if(null == arriveTime || "" == arriveTime){
		xjValidate.showPopup("请输入到货日期","提示");
		return;
	}
	if(forwardingTime > arriveTime){
		xjValidate.showPopup("发货日期不能大于到货日期","提示");
		return;
	}
	var check = xjValidate.checkForm();
	if(check == false){
		xjValidate.showPopup("输入的数据不符合规范","警告")
		return;
	}
   var forwardingTonnage = $("#forwardingTonnage").val();    //发货吨位
   var arriveTonnage = $("#arriveTonnage").val();    //到货吨位
   var charteredPrice = $("#charteredPrice").val();    //包车运费
   var settlementTonnage = $("#settlementTonnage").val();    //结算吨位
   var isExpense = $("#isExpense").val();  //是否报销
   var expenseType = $("#expenseType").val();  //报销类型
   if(isExpense == '1' && expenseType == '1'){//假如是报销模式并且报销类型是燃油
	   var taxRate = "";
	   var type = 1;
	   $.ajax({
	    	url:basePath+"/settlementInfo/findTaxRateByCouponType",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{"type":type},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	taxRate = data;
	        	}
	        });
   }
   if(isExpense == '1' && expenseType == '2'){//假如是报销模式并且报销类型是燃气
	   var type = 2;
	   $.ajax({
	    	url:basePath+"/settlementInfo/findTaxRateByCouponType",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:{"type":type},
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup('请求失败！',"提示");
	        },
	        success:function(data){
	        	taxRate = data;
	        	}
	        });
   }
   if(isExpense == '1'){//假如是报销模式
	   var money =  $("#expensePrice").val(); //报销金额改为有价券金额
   }else{
	   var money = $("#couponMoney").val();   //有价券使用金额
	   var taxRate =$("#taxRate").val();      //有价券进项税税率
   }
   var otherPrice =$("#otherPrice").val();      //其他扣款
   var advancePrice =$("#advancePrice").val();      //预付款
   var costPrice =$("#costPrice").val();      //工本费
   //var overallTaxRate = $("#overallTaxRate").val();  //综合税率
  // var withholdingTaxRate = $("#withholdingTaxRate").val();  //企业代扣税税率
   //var planTransportDate = new Date($("#planTransportDate").val());  //计划拉运日期
  // var incomeTaxRate = $("#incomeTaxRate").val();  //司机运费进项税税率
   var isChartered = $("#isChartered").val();  //是否包车
   var customerPrice = $("#customerPrice").val();
   
 //  var individualIncomeTax = $("#individualIncomeTax").val(); //个人所地税
   var id =  $("#waybillInfoId").val();  //运单表主键
   var highwayToll = $("#highwayToll").val();
   var superHighwayToll = $("#superHighwayToll").val();
   var otherToll = $("#otherToll").val();
   var highwayInputTax = $("#highwayInputTax").val();
   var superHighwayInputTax = $("#superHighwayInputTax").val();
  // var computerDataStr = JSON.stringify(computerData);  //将json对象转化为json字符串
   //var newstr=computerDataStr.substring(0,computerDataStr.length-1); //去掉右括号
   //newstr += ',\"money\"'+':\"'+money+'\",\"planTransportDate\"'+':\"'+planTransportDate+'\",\"forwardingTonnage\"'+':\"'+forwardingTonnage+'\",\"arriveTonnage\"'+':\"'+arriveTonnage+'\",\"charteredPrice\"'+':\"'+charteredPrice+'\",\"settlementTonnage\"'+':\"'+settlementTonnage+'\",\"taxRate\"'+':\"'+taxRate+'\",\"otherPrice\"'+':\"'+otherPrice+'\","advancePrice\"'+':\"'+advancePrice+'\","costPrice\"'+':\"'+costPrice+'\","withholdingTaxRate\"'+':\"'+withholdingTaxRate+'\","incomeTaxRate\"'+':\"'+incomeTaxRate+'\"}';
  // var selectData = jQuery.parseJSON(newstr); //可以将json字符串转换成json对象 
   var comData = {
		   highwayToll:setZero(highwayToll),
			superHighwayToll:setZero(superHighwayToll),
			otherToll:setZero(otherToll),
			highwayInputTax:setZero(highwayInputTax),
			superHighwayInputTax:setZero(superHighwayInputTax),
		   forwardingTonnage:setZero(forwardingTonnage),
		   customerPrice:setZero(customerPrice),
		   arriveTonnage:setZero(arriveTonnage),
		   charteredPrice:setZero(charteredPrice),
		   settlementTonnage:setZero(settlementTonnage),
		   money:setZero(money),
		   taxRate:setZero(taxRate),
		   isExpense:isExpense,
		   otherPrice:setZero(otherPrice),
		   advancePrice:setZero(advancePrice),
		   costPrice:setZero(costPrice),
		   isChartered:isChartered,
		   forwardingTime:new Date(forwardingTime),
		   id:id
   }
   //计算
	$.ajax({
    	url:basePath+"/settlementInfo/saveWaybillInfo",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:comData,
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
         $("#waybillSelectModal").modal('hide');
        // $("#accountingEntity").val(data.accountingEntity);  //核算主体
        /* if(data.message == "已挂账"){
        	 xjValidate.showPopup("该运单已挂账","提示");
        	 return;
         }*/
         
         $("#outputTax").val(data.outputTax);              //销项税
         $("#couponIncomeTax").val(data.couponIncomeTax);  //有价券进项税
         $("#lossTonnage").val(data.lossTonnage);  //扣损吨位
         $("#deductionTonnage").val(data.deductionTonnage);  //扣损吨位
         $("#deductionUnitPrice").val(data.deductionUnitPrice);  //扣款吨位
         $("#deductionPrice").val(data.deductionPrice);  //扣损金额
         $("#currentTransportPrice").val(data.currentTransportPrice);  //当前运价
         $("#shipperPrice").val(data.shipperPrice);  //承运方运费
         $("#payablePrice").val(data.payablePrice);  //应付运费
         $("#proxyInvoiceTotal").val(data.proxyInvoiceTotal);  //代开总额
         $("#otherTaxPrice").val(data.otherTaxPrice);  //其他税费
         $("#transportPriceIncomeTax").val(data.transportPriceIncomeTax);  //运费进项税
         $("#incomeTax").val(data.incomeTax);  //进项税
         $("#transportPriceCost").val(data.transportPriceCost);  //运费成本
         $("#thisPayPrice").val(data.thisPayPrice);  //本次付费
         $("#proxyName").val(data.proxyName);  //代理方名称
         $("#proxy").val(data.proxy);  //代理方
         $("#actualPaymentPrice").val(data.actualPaymentPrice);  //实付金额	
         $("#highwayInputTax").val(data.highwayInputTax);
         $("#superHighwayInputTax").val(data.superHighwayInputTax);
         Prompt();   //弹出确认保存框的方法
        }
    })
 
     //查询客户运费
	$.ajax({
    	url:basePath+"/settlementInfo/findCustomerCost",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:comData,
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	var jsonAll = data;
        	var jsonStr = data.custermCost;
          //alert(data);       
        	if(jsonStr == "-1"){
        		$("#customerPrice").val("");
        	}else{
        		$("#customerPrice").val(jsonStr);
        		$("#customerPrice").attr("readonly","readonly");//设为只读
        	}
        	
        }
    })
  }

//保存新增或修改的结算信息
function saveSettlementInfo(){
	var outputTax = $("#outputTax").val();   //销项税 
	var driverUserRole =$("#driverUserRole").val();             //司机用户角色
	var isChartered = $("#isChartered").val();   //是否包车
	var isProxyMode = $("#isProxyMode").val();   //是否代理
	var carCode = $("#carCode").val();   //车牌号码
	//var couponUseInfoId = $("#couponInfoId").val();   //有价券编号
	var waybillId = $("#selectWaybill").val();   //运单号
	var waybillInfoId = $("#waybillInfoId").val();   //运单编号
	//var settlementFormulaDetailId = $("#selectFormula").val();   //结算公式编号
	var forwardingTonnage = $("#forwardingTonnage").val();   //发货吨位
	var roughWeightTonnage = $("#roughWeightTonnage").val();   //毛重吨位
	var arriveTonnage = $("#arriveTonnage").val();   //到货吨位
	var settlementTonnage = $("#settlementTonnage").val();   //结算吨位
	var forwardingId = $("#forwardingId").val();   //发货单号
	var arriveId = $("#arriveId").val();   //到货单号
	var driverWaybillId = $("#driverWaybillId").val();   //司机运单号
	var insurancePrice = $("#insurancePrice").val();   //保险费
	var charteredPrice = $("#charteredPrice").val();   //包车运费
	var customerPrice = $("#customerPrice").val();   //客户运费
	var advancePrice = $("#advancePrice").val();   //预付款
    var actualPaymentPrice = $("#actualPaymentPrice").val();  //实付金额	
	var costPrice = $("#costPrice").val();   //工本费
	var withholdingTax = $("#withholdingTax").val();   //代扣税
	var singleCarInsurance = $("#singleCarInsurance").val();   //单车保险
	var otherPrice = $("#otherPrice").val();   //其他扣款
	var returnSingleUser = $("#returnSingleUser").val();   //回单人
	var forwardingTime = $("#forwardingTime").val();   //发货日期
	var arriveTime = $("#arriveTime").val();   //到货日期
	var remarks = $("#remarks").val();   //备注
	var goodsInfoId = $("#goodsInfoId").val();   //货物
	var scatteredGoods = $("#scatteredGoods").val();   //零散货物
	var forwardingUnit = $("#forwardingUnit").val();   //发货单位
	var consignee = $("#consignee").val();   //到货单位
	var projectInfoId = $("#entrustProject").val();   //组织部门
	var entrust = $("#entrust").val();   //委托方
	//var entrustOrgRoot = $("#entrustOrgRoot").val();   //委托方主机构
	var shipper = $("#shipper").val();   //承运方
	var deductionTonnage = $("#deductionTonnage").val();   //扣款吨位
	var deductionUnitPrice = $("#deductionUnitPrice").val();   //扣损单价
	var currentTransportPrice = $("#currentTransportPrice").val();   //当前运价
	var proxyInvoiceTotal = $("#proxyInvoiceTotal").val();   //代开总额
	var accountingEntity = $("#accountingEntity").val();   //核算主体
	//var withholdingTaxRate = $("#withholdingTaxRate").val();   //企业代扣税税率
	//var incomeTaxRate = $("#incomeTaxRate").val();   //司机运费进项税税率
	var lossTonnage = $("#lossTonnage").val();   //扣损吨位
	var deductionPrice = $("#deductionPrice").val();   //扣损金额
	var shipperPrice = $("#shipperPrice").val();   //承运方运费
	var payablePrice = $("#payablePrice").val();   //应付运费
	var otherTaxPrice = $("#otherTaxPrice").val();   //其它税费
	var transportPriceIncomeTax = $("#transportPriceIncomeTax").val();   //运费进项税
	var incomeTax = $("#incomeTax").val();   //进项税
	var transportPriceCost = $("#transportPriceCost").val();   //运费成本
	var thisPayPrice = $("#thisPayPrice").val();   //本次付款
	//var settlementImg = $("#fileType").val();   //附件
	var rootWaybillInfoId = $("#rootWaybillInfoId").val();  //主运单编号
	var parentWaybillInfoId = $("#parentWaybillInfoId").val();  //父运单编号
	var lineInfoId = $("#lineInfoId").val();  //线路
	var userInfoId = $("#userInfoId").val();  //司机编号
	var id = $("#editId").val();  //修改信息所用结算信息表主键
	var couponId = $("#couponId").val();   //有价券领用编号
	var endPoints = $("#endPoints").val();  //线路终点
	var waybillInfoIdTemp =  $("#waybillInfoIdTemp").val();  //运单表主键
	var cooperateStatus = $("#cooperateStatus").val();       //协同状态
	var isExpense = $("#isExpense").val();   //是否报销
	var expensePrice =$("#expensePrice").val(); //报销金额
	var expenseType = $("#expenseType").val(); //报销类型
	var money = $("#couponMoney").val();   //有价券使用金额
	var couponIncomeTax =$("#couponIncomeTax").val();     //有价券进项税税率
	var highwayToll = $("#highwayToll").val();
	   var superHighwayToll = $("#superHighwayToll").val();
	   var otherToll = $("#otherToll").val();
	   var highwayInputTax = $("#highwayInputTax").val();
	   var superHighwayInputTax = $("#superHighwayInputTax").val();
	if(couponarray.length == 0 || couponarray == null){
		couponarray = 0;
	}
	if(waybillInfoIdTemp == ""){
		waybillInfoIdTemp = null;
	}
	if(endPoints == "" || endPoints == "null" ){
		endPoints = null;
	}
	var proxy =  $("#proxy").val();  //代理方
	
	var saveData = {
			driverUserRole:driverUserRole,
			outputTax:setZero(outputTax),
			highwayToll:setZero(highwayToll),
			superHighwayToll:setZero(superHighwayToll),
			otherToll:setZero(otherToll),
			highwayInputTax:setZero(highwayInputTax),
			superHighwayInputTax:setZero(superHighwayInputTax),
			id:id,
			isChartered:isChartered,
			isProxyMode:isProxyMode,
			couponUseInfoId:couponId,
			waybillInfoId:waybillInfoId,
			waybillId:waybillId,
			carCode:carCode,
			forwardingTonnage:setZero(forwardingTonnage),
			roughWeightTonnage:setZero(roughWeightTonnage),
			arriveTonnage:setZero(arriveTonnage),
			settlementTonnage:setZero(settlementTonnage),
			forwardingId:forwardingId,
			arriveId:arriveId,
			driverWaybillId:driverWaybillId,
			insurancePrice:setZero(insurancePrice),
			charteredPrice:setZero(charteredPrice),
			customerPrice:setZero(customerPrice),
			advancePrice:setZero(advancePrice),
			costPrice:setZero(costPrice),
			withholdingTax:setZero(withholdingTax),
			singleCarInsurance:setZero(singleCarInsurance),
			otherPrice:setZero(otherPrice),
			returnSingleUser:returnSingleUser,
			forwardingTime:new Date(forwardingTime),
			arriveTime:new Date(arriveTime),
			remarks:remarks,
			goodsInfoId:goodsInfoId,
			scatteredGoods:scatteredGoods,
			forwardingUnit:forwardingUnit,
			consignee:consignee,
			projectInfoId:projectInfoId,
			entrust:entrust,
			shipper:shipper,
			deductionTonnage:setZero(deductionTonnage),
			deductionUnitPrice:setZero(deductionUnitPrice),
			currentTransportPrice:setZero(currentTransportPrice),
			proxyInvoiceTotal:setZero(proxyInvoiceTotal),
			accountingEntity:setZero(accountingEntity),
			lossTonnage:setZero(lossTonnage),
			deductionPrice:setZero(deductionPrice),
			shipperPrice:setZero(shipperPrice),
			payablePrice:setZero(payablePrice),
			otherTaxPrice:setZero(otherTaxPrice),
			transportPriceIncomeTax:setZero(transportPriceIncomeTax),
			incomeTax:setZero(incomeTax),
			transportPriceCost:setZero(transportPriceCost),
			thisPayPrice:setZero(thisPayPrice),
			rootWaybillInfoId:rootWaybillInfoId,
			parentWaybillInfoId:parentWaybillInfoId,
			lineInfoId:lineInfoId,
			actualPaymentPrice:actualPaymentPrice,
			userInfoId:userInfoId,
			proxy:proxy,
			endPoints:endPoints,
			waybillInfoIdTemp:waybillInfoIdTemp,
			cooperateStatus:cooperateStatus,
			couponarray:JSON.stringify(couponarray),
			isExpense:setZero(isExpense),
			expensePrice:setZero(expensePrice),
			expenseType:setZero(expenseType),
			couponUseTotalPrice:setZero(money),
			couponIncomeTax:setZero(couponIncomeTax)
	};
	var flag = $("#flag").val();
	if(flag =='1'){//执行新增操作
		  $.ajax({
		    	url:basePath+ "/settlementInfo/addSLossesInfo",//请求的action路径
		        async:false,//是否异步
		        cache:false,//是否使用缓存
		        type:'POST',//请求方式：post
		        data:saveData,
		        dataType:'json',//数据传输格式：json
		        error:function(){
		            //请求失败处理函数
		            xjValidate.showPopup('请求失败！',"提示");
		        },
		        success:function(data){
		        	if(data == true){
		        		//xjValidate.showPopup("添加成功","提示");
		        		//刷新页面
		        		window.location.href = basePath+ "/settlementInfo/goSettlementLosses";
		        	}
		        }
		    });
		
	}else if(flag =='2'){//执行修改操作
		  $.ajax({
		    	url:basePath+ "/settlementInfo/editSettlementInfo",//请求的action路径
		        async:false,//是否异步
		        cache:false,//是否使用缓存
		        type:'POST',//请求方式：post
		        data:saveData,
		        dataType:'json',//数据传输格式：json
		        error:function(){
		            //请求失败处理函数
		            xjValidate.showPopup('请求失败！',"提示");
		        },
		        success:function(data){
		        	if(data == true){
		        		//xjValidate.showPopup("修改成功","提示");
		        		//刷新页面
		        		//window.navigate(location);
		        		//showTraffictcsInfo();
		        		window.location.href = basePath+ "/settlementInfo/goSettlementLosses";
		        	}
		        }
		    });
	}else{
		xjValidate.showPopup("网络异常","提示");
	}
	
}

function judgeValue(){
	var isChartered = $("#isChartered").val();
	  if(isChartered == '0'){ //不是包车模式
		    $("#charteredPricediv").hide();
		    $("#outputTaxDiv").hide(); //销项税
		    $("#outputTax").val(0); //销项税
	    	$("#charteredPrice").val(0); //包车运费
	    	$("#charteredPrice").attr("readonly","readonly");//设为只读
	    	$("#customerPrice").val(0); //客户运费
	    	$("#customerPrice").attr("readonly","readonly");//设为只读
	    	return;
	    }
	  if(isChartered == '1'){ //是包车模式
		    $("#charteredPricediv").show();
		    $("#outputTaxDiv").show(); //销项税
		    $("#outputTax").val(""); //销项税
	    	$("#charteredPrice").val(0); //包车运费
	    	$("#charteredPrice").removeAttr("readonly");
	    	$("#customerPrice").val(0); //客户运费
	    	$("#customerPrice").removeAttr("readonly");
	    	return;
	    }
	  
	  
}
//时间戳转化成固定日期格式
var format = function(time, format){
    var t = new Date(time);
    var tf = function(i){return (i < 10 ? '0' : '') + i};
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
        switch(a){
            case 'yyyy':
                return tf(t.getFullYear());
                break;
            case 'MM':
                return tf(t.getMonth() + 1);
                break;
            case 'mm':
                return tf(t.getMinutes());
                break;
            case 'dd':
                return tf(t.getDate());
                break;
            case 'HH':
                return tf(t.getHours());
                break;
            case 'ss':
                return tf(t.getSeconds());
                break;
        }
    })
    
}
//假如值为空则赋值为0
function setZero(obj){
	if(obj == "" || obj == null){
		obj = "0";
	}
	return obj;
}
function Prompt (){
    $.confirm({
        title: '提示!',
        content: '' +
        '<form action="" class="formName">' +
        '<div class="form-group">' +
        '<font style = "font-family:yahei;font-size:20px">您已计算成功是否保存</font>' +
        '</div>' +
        '</form>',
        buttons: {
            formSubmit: {
                text: '保存',
                btnClass: 'btn-blue',
                action: function () {
                	saveSettlementInfo();
                }
            },
            '取消': function () {
            },
        },
        onContentReady: function () {
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                e.preventDefault();
                jc.$$formSubmit.trigger('click'); 
            });
        }
    });
  }

//查看附件
function viewAttachment(){
	$("#unloadingDiv").empty();
	$("#unloadingDiv").html("");
	$("#loadingDiv").empty();
	$("#loadingDiv").html("");
	$("#onpassageDiv").empty();
	$("#onpassageDiv").html("");
	 var rootWaybillInfoId = $("#rootWaybillInfoId").val();  
	 //查看附件
	$.ajax({
    	url:basePath+"/settlementInfo/findEnclosure",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"rootWaybillInfoId":rootWaybillInfoId},
        dataType:'json',//数据传输格式：json
        success:function(data){
        	var jsonAll = data;
        	var jsonLoading = jsonAll.loadingImgList;
        	var jsonOnpassage = jsonAll.onpassageImgList;
        	var jsonUnloading = jsonAll.unloadingImgList;
        	var imgUrl = "";
        	if(jsonLoading != null && jsonLoading.length >0){
        		$.each(jsonLoading,function(i, val) {
        			if(val == "" || val == null){
        				imgUrl = basePath+"/static/images/common/timg.jpg";
        			}else{
        				imgUrl = fastdfsServer+"/"+val;
        			}
        			$("#loadingDiv").append("<div class='group-img'>" +
        					"<div class='view-img'>" +
        					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
        					"</div>" +
        					"</div>" );
	    		})
        	}else{
        		imgUrl = basePath+"/static/images/common/timg.jpg";
        		$("#loadingDiv").append("<div class='group-img'>" +
    					"<div class='view-img'>" +
    					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
    					"</div>" +
    					"</div>" );
        	}
        	if(jsonOnpassage != null && jsonLoading.length >0){
        		$.each(jsonOnpassage,function(i, val) {
        			if(val == "" || val == null){
        				imgUrl = basePath+"/static/images/common/timg.jpg";
        			}else{
        				imgUrl = fastdfsServer+"/"+val;
        			}
        			$("#onpassageDiv").append("<div class='group-img'>" +
        					"<div class='view-img'>" +
        					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
        					"</div>" +
        					"</div>" );
	    		})
        	}else{
        		imgUrl = basePath+"/static/images/common/timg.jpg";
        		$("#onpassageDiv").append("<div class='group-img'>" +
    					"<div class='view-img'>" +
    					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
    					"</div>" +
    					"</div>" );
        	}
        	
        	if(jsonUnloading != null  && jsonLoading.length >0){
        		$.each(jsonUnloading,function(i, val) {
        			if(val == "" || val == null){
        				imgUrl = basePath+"/static/images/common/timg.jpg";
        			}else{
        				imgUrl = fastdfsServer+"/"+val;
        			}
        			$("#unloadingDiv").append("<div class='group-img'>" +
        					"<div class='view-img'>" +
        					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
        					"</div>" +
        					"</div>" );
	    		})
        	}else{
        		imgUrl = basePath+"/static/images/common/timg.jpg";
        		$("#unloadingDiv").append("<div class='group-img'>" +
    					"<div class='view-img'>" +
    					"<img src='"+imgUrl+"' class='img_box' img-type='loading_img'>" +
    					"</div>" +
    					"</div>" );
        	}
        	$("#lookDocModal").modal('show');
        	}
        });
	
	//图片预览
	$('.view-img').viewer({
		title:false
	});
	
}
