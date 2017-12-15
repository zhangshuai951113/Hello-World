 //初始化page
  var settlementPage = null;
  var goodsPage = null;
  var orgPage = null;
  var accounPage = null;
  var sign = "";
  (function ($) {
	  
	  //初始组织部门列表page页面
	    orgPage = $("#orgPage").operationList({
	      "current": 1,    //当前目标
	      "maxSize": 4,  //前后最大列表
	      "itemPage": 10,  //每页显示多少条
	      "totalItems": 0,  //总条数
	      "chagePage": function (current) {
	        //调用ajax请求拿最新数据
	    	  orgSelect(current);
	      }
	    });
	  
	    /**
	     *组织部门page页跳转
	     */
	    function orgPageSlect(e) {
	      var value = $(e).prev().find('input').val();
	      orgPage.setCurrentPage(value);
	    }
	    
	    
	    //初始核算主体列表page页面
	    accounPage = $("#accounPage").operationList({
	      "current": 1,    //当前目标
	      "maxSize": 4,  //前后最大列表
	      "itemPage": 10,  //每页显示多少条
	      "totalItems": 0,  //总条数
	      "chagePage": function (current) {
	        //调用ajax请求拿最新数据
	    	  orgSelectAccoun(current);
	      }
	    });
	  
	    /**
	     *核算主体部门page页跳转
	     */
	    function accounPageSlect(e) {
	      var value = $(e).prev().find('input').val();
	      accounPage.setCurrentPage(value);
	    }
	  
    //初始化结算列表page页面
    settlementPage = $("#settlementPage").operationList({
      "current": 1,    //当前目标
      "maxSize": 4,  //前后最大列表
      "itemPage": 10,  //每页显示多少条
      "totalItems": 0,  //总条数
      "chagePage": function (current) {
        //调用ajax请求拿最新数据
    	  showSettlementInfo(current);
      }
    });
    
    /**
     *结算page页跳转
     * 
     * @author liumin
     * @param {this} e 
     */
    function settlementPageSlect(e) {
      var value = $(e).prev().find('input').val();
      settlementPage.setCurrentPage(value);
    }

    //设置结算页面总条数
   /* settlementPage.setTotalItems(20);
    $("#settlementNum").text(20);*/

    //全选/全不选
    $("body").on("click", ".all-settlement-check", function () {
      if ($(".all-settlement-check").is(":checked")) {
        //全选时
        $(".sub-auth-check").each(function () {
          $(this).prop("checked", true);
        });
      } else {
        //全不选时
        $(".sub-auth-check").each(function () {
          $(this).prop("checked", false);
        });
      }
    });
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

      //线路插件
    $("#startAddress").lineSelect();
    $("#endAddress").lineSelect();

    //允许结算表格拖着
    $("#tableDrag").colResizable({
      liveDrag: true,
      gripInnerHtml: "<div class='grip'></div>",
      draggingClass: "dragging"
    });

    //结算数据较多，增加滑动
    $(".iscroll").css("min-height", "55px");
    $(".iscroll").mCustomScrollbar({
      theme: "minimal-dark"
    });
  })(jQuery);


  /**
   * 重置搜索栏
   * 
   * @author liumin
   */
  function resetEmpty() {
    //清除重置线路
    $(".select-address").empty();
    $(".select-address").siblings("input").val("");
    //清除其他搜索
    $(".search-select-list").empty();
    $(".search-select-list").siblings("input").val("");
  }

  /**
  * 添加货物弹出框
  */
  function goodsSelect() {
    $("#goodsSelectModal").modal('show');
    //初始货物列表page页面
    goodsPage = $("#goodsPage").operationList({
    "current":1,    //当前目标
    "maxSize":4,  //前后最大列表
    "itemPage":10,  //每页显示多少条
    "totalItems":0,  //总条数
    "chagePage":function(current){
      //调用ajax请求拿最新数据
      console.log(current); 
    }
    });
    //设置货物总页面
    goodsPage.setTotalItems(20);
    $("#goodsNum").text(20);
  }

  /**
  *货物page页跳转
  */
  function goodsPageSlect(e) {
    var value = $(e).prev().find('input').val();
    goodsPage.setCurrentPage(value);
  }

  /**
   *货物选择
   */
  function submitSelectGoods() {
    var selectlist = findAllCheck(".goods-check");
    if(selectlist.length==0 || selectlist.length>1) {
      xjValidate.showPopup("请选择一条数据","提示");
      return;
    }
    $("#selectGoods").text(selectlist[0].name);
    $("#selectGoods").next("input").val(selectlist[0].id);
    $("#goodsSelectModal").modal('hide');
  }

   /**
   * 添加组织部门弹出框
   */
  function orgSelect(pageNo) {
	  $("#projectTable").empty();
		$("#projectTable").html("");
	  var pageSizeStr = '10';
	  var projectName = $("#projectName").val();
	  var selectData = {
				curPage : pageNo,
				pageSizeStr : pageSizeStr,
				projectName : projectName
	  }
	  $.ajax({
	    	url:basePath+"/settlementInfo/findProjectInfo",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:selectData,
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup("请求失败！","提示");
	        },
	        success:function(data){
	        	var jsonAll = data;
	        	var jsonList = jsonAll.cList;
	        	var sInfoTotalCount = jsonAll.totalCount;
	        	$("#orgNum").text("搜索结果共"+sInfoTotalCount);
	        	orgPage.setTotalItems(sInfoTotalCount);
	        	$.each(jsonList,function(i, val) {
	    			$("#projectTable").append("<tr class='table-body'><td><label class='i-checks'>" +
	    					"<input data-id='1' data-name='00000001' class='coupon-check' name = 'projectRadioName' id = 'projectRadio' type='radio'></label></td>" +
	    					"<td style='display:none'>"+val.id+"</td>" +
	    					"<td >"+toChar(val.projectId)+"</td>" +
	    					"<td>"+toChar(val.projectName)+"</td>" +
	    					"<td>"+toChar(val.orgInfoId)+"</td>" +
	    					"<td>"+toChar(val.orgInfoName)+"</td>" +
	    					"</tr>");
	    		})
	    		$("#orgSelectModal").modal('show');
	        }
	    })
  }
  
  $("#searchProject").click(function(){
	  orgSelect(1);
  });
  
  
  /**
   *组织部门选择
   */
  function submitSelectOrg() {
    var selectlist = findAllCheck(".coupon-check");
    if (selectlist.length == 0 || selectlist.length > 1) {
      xjValidate.showPopup("请选择一条数据","提示");
      return;
    }
    var ftr = $("#projectRadio:checked").parents("tr");
    var projectName = ftr.children().eq(3).html();    //项目名称
    var id = ftr.children().eq(1).html();    //项目名称
    $("#projectId").val(id); 
    $("#selectOrg").html(projectName); 
    $("#orgSelectModal").modal('hide');
  }
  
  /**
   * 添加核算主体弹出框
   */
  function orgSelectAccoun(pageNo) {
	  $("#accouningTable").empty();
		$("#accouningTable").html("");
	  var pageSizeStr = '10';
	  var orgName = $("#orgName").val();
	  var selectData = {
				curPage:pageNo,
				pageSizeStr:pageSizeStr,
				orgName:orgName
	  }
	  $.ajax({
	    	url:basePath+"/settlementInfo/findAccouningEntity",//请求的action路径
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
	        	$("#accounNum").text("搜索结果共"+sInfoTotalCount);
	        	accounPage.setTotalItems(sInfoTotalCount);
	        	$.each(jsonList,function(i, val) {
	    			$("#accouningTable").append("<tr class='table-body'><td><label class='i-checks'>" +
	    					"<input data-id='1' data-name='00000001' class='acc-check' name = 'accRadioName' id = 'accRadio' type='radio'></label></td>" +
	    					"<td style='display:none'>"+val.orgInfoId+"</td>" +
	    					"<td >"+toChar(val.orgName)+"</td>" +
	    					"<td>"+toChar(val.orgVersion)+"</td>" +
	    					"<td>"+toChar(val.contactName)+"</td>" +
	    					"<td>"+toChar(val.contactAddress)+"</td>" +
	    					"<td>"+toChar(val.mobilePhone)+"</td>" +
	    					"</tr>");
	    		})
	    		$("#accSelectModal").modal('show');
	        }
	    })
  }
  
  $("#searchAccounting").click(function(){
	  orgSelectAccoun(1);
  });

 

  /**
   *核算主体选择
   */
  function submitSelectAcc() {
	  var selectlist = findAllCheck(".acc-check");
	    if (selectlist.length == 0 || selectlist.length > 1) {
	      xjValidate.showPopup("请选择一条数据","提示");
	      return;
	    }
	    var ftr = $("#accRadio:checked").parents("tr");
	    var orgName = ftr.children().eq(2).html();    //项目名称
	    var orgInfoId = ftr.children().eq(1).html();    //项目名称
	    $("#accId").val(orgInfoId); 
	    $("#selectAcc").html(orgName); 
	    $("#accSelectModal").modal('hide');
  }
  
  /**
   * 查找选择
   */
  function findAllCheck(element){
    var checkList = new Array();
    $(element).each(function(){
      if($(this).is(":checked")){
        var params = {
          "id":$(this).attr("data-id"),
          "name":$(this).attr("data-name"),
          "km":$(this).attr("data-km")
        }
        checkList.push(params);
      }
    });
    return checkList;
  }


  /**
   * 审核按钮弹出框
   */
  function audit() {
    $.confirm({
      title : '请您填写审核意见:',
      content : ''
          + '<form action="" class="formName">'
          + '<div class="form-group">'
          + '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px;  resize: none;" />'
          + '</div>' + '</form>',
      buttons : {
        agreed : {
          text : '通过',
          btnClass : 'btn-blue',
          action : function() {
            var auditOpinion = this.$content.find('#auditOpinion').val();
            if (!auditOpinion) {
              xjValidate.showPopup("审核意见不能为空！", "提示");
              return false;
            }
          }
        },
        rejected : {
          text : '不通过',
          btnClass : 'btn-red',
          action : function() {
            var auditOpinion = this.$content.find('#auditOpinion').val();
            if (!auditOpinion) {
              xjValidate.showPopup("审核意见不能为空！", "提示");
              return false;
            }
          }
        },
        '取消' : function() {
          // close
        }
      }
    });
  }

  //查询结算挂账信息
  function showSettlementInfo(pageNo){
		$("#allSettlementInfo").empty();
		$("#allSettlementInfo").html("");
		var pageSizeStr = '10';
		var goodsName = $("#mhgoodsName").val();
		var entrustName = $("#mhentrustName").val();
		var scatteredGoods = $("#mhscatteredGoods").val();
		var carCode = $("#mhcarCode").val();
		var arriveId = $("#mharriveId").val();
		var forwardingId = $("#mhforwardingId").val();
		var forwardingTime = $("#mhforwardingTime").val();
		var forwardingTime1 = $("#mhforwardingTime1").val();
		var arriveTime = $("#mharriveTime").val();
		var arriveTime1 = $("#mharriveTime1").val();
		var settlementStatus = $("#mhsettlementStatus").val();
		var accountingEntity = $("#accId").val(); 
		var projectInfoId =$("#projectId").val(); 
		var makeTime = $("#mhmakeTime").val();
		var makeTime1 = $("#mhmakeTime1").val();
		var remarks = $("#mhremarks").val();
		var isAccount = $("#mhisAccount").val();  //是否对账
		var isInvoice = $("#mhisInvoice").val();  //是否开票
		
		var selectData = {
				curPage : pageNo,
				pageSizeStr : pageSizeStr,
				isAccount:isAccount,
				isInvoice:isInvoice,
				goodsName:goodsName,
				entrustName:entrustName,
				scatteredGoods:scatteredGoods,
				accountingEntity:accountingEntity,
				projectInfoId:projectInfoId,
				carCode:carCode,
				arriveId:arriveId,
				forwardingId:forwardingId,
				forwardingTimeStr:forwardingTime,
				forwardingTime1Str:forwardingTime1,
				arriveTimeStr:arriveTime,
				arriveTime1Str:arriveTime1,
				settlementStatus:settlementStatus,
				makeTimeStr:makeTime,
				makeTime1Str:makeTime1,
				remarks:remarks
		};
	    $.ajax({
	    	url:basePath+"/settlementInfo/findSLossesInfo",//请求的action路径
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
	        	var jsonList = jsonAll.tpList;
	        	var sInfoTotalCount = jsonAll.sInfoTotalCount;
	        	$("#settlementNum").text("搜索结果共"+sInfoTotalCount);
	        	settlementPage.setTotalItems(sInfoTotalCount);
	        	$.each(jsonList,function(i, val) {
	        		if(val.settlementStatus =='1'){
	        			val.settlementStatus = '起草';
	        		}
	        		if(val.settlementStatus =='2'){
	        			val.settlementStatus = '待审核';
	        		}
	        		if(val.settlementStatus =='3'){
	        			val.settlementStatus = '审核通过';
	        		}
	        		if(val.settlementStatus =='4'){
	        			val.settlementStatus = '审核驳回';
	        		}
	        		if(val.isAccount =='1'){
	        			val.isAccount = '已对账';
	        		}
	        		if(val.isAccount =='0'){
	        			val.isAccount = '未对账';
	        		}
	        		if(val.isInvoice =='1'){
	        			val.isInvoice = '已开票';
	        		}
	        		if(val.isInvoice =='0'){
	        			val.isInvoice = '未开票';
	        		}
	        		if(val.isChartered =='1'){
	        			val.isChartered = '是';
	        		}
	        		if(val.isChartered =='0'){
	        			val.isChartered = '否';
	        		}
	        		if(val.isWriteOff =='1'){
	        			val.isWriteOff = '是';
	        		}
	        		if(val.isWriteOff =='0'){
	        			val.isWriteOff = '否';
	        		}
	        		if(val.isRevise =='1'){
	        			val.isRevise = '是';
	        		}
	        		if(val.isRevise =='0'){
	        			val.isRevise = '否';
	        		}
	    			$("#allSettlementInfo").append("<tr class='table-body'><td><label class='i-checks'>" +
	    					"<input class='sub-auth-check' type='checkbox' id = 'SettlementCheck'></label></td>" +
	    					"<td style='display:none'>"+val.id+"</td>" +
	    					"<td>"+toChar(val.settlementStatus)+"</td>" +
	    					"<td>"+toChar(val.carCode)+"</td>" +
	    					"<td>"+toChar(val.settlementId)+"</td>" +
	    					"<td>"+toChar(val.waybillId)+"</td>" +
	    					"<td>"+toChar(val.isAccount)+"</td>" +
	    					"<td>"+toChar(val.isInvoice)+"</td>" +
	    					"<td>"+toChar(val.isWriteOff)+"</td>" +
	    					"<td>"+toChar(val.isRevise)+"</td>" +
	    					"<td>"+toChar(val.printNumber)+"</td>" +
	    					"<td>"+toChar(val.goodsName)+"</td>" +
	    					"<td>"+toChar(val.scatteredGoods)+"</td>" +
	    					"<td>"+toChar(val.entrustName)+"</td>" +
	    					"<td>"+format(new Date(val.forwardingTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"<td>"+format(new Date(val.arriveTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"<td>"+toChar(val.forwardingUnit)+"</td>" +
	    					"<td>"+toChar(val.consignee)+"</td>" +
	    					"<td>"+toChar(val.forwardingTonnage)+"</td>" +
	    					"<td>"+toChar(val.roughWeightTonnage)+"</td>" +
	    					"<td>"+toChar(val.arriveTonnage)+"</td>" +
	    					"<td>"+toChar(val.lineName)+"</td>" +
	    					"<td>"+toChar(val.shipperName)+"</td>" +
	    					"<td>"+toChar(val.projectName)+"</td>" +
	    					"<td>"+toChar(val.isChartered)+"</td>" +
	    					"<td>"+toChar(val.customerPrice)+"</td>" +
	    					"<td>"+toChar(val.settlementTonnage)+"</td>" +
	    					"<td>"+toChar(val.lossTonnage)+"</td>" +
	    					"<td>"+toChar(val.deductionTonnage)+"</td>" +
	    					"<td>"+toChar(val.currentTransportPrice)+"</td>" +
	    					"<td>"+toChar(val.shipperPrice)+"</td>" +
	    					"<td>"+toChar(val.payablePrice)+"</td>" +
	    					"<td>"+toChar(val.proxyName)+"</td>" +
	    					"<td>"+toChar(val.transportPriceCost)+"</td>" +
	    					"<td>"+toChar(val.transportPriceIncomeTax)+"</td>" +
	    					"<td>"+toChar(val.incomeTax)+"</td>" +
	    					"<td>"+toChar(val.thisPayPrice)+"</td>" +
	    					"<td>"+toChar(val.costPrice)+"</td>" +
	    					"<td>"+toChar(val.withholdingTax)+"</td>" +
	    					"<td>"+toChar(val.advancePrice)+"</td>" +
	    					"<td>"+toChar(val.singleCarInsurance)+"</td>" +
	    					"<td>"+toChar(val.deductionUnitPrice)+"</td>" +
	    					"<td>"+toChar(val.otherPrice)+"</td>" +
	    					"<td>"+toChar(val.userName)+"</td>" +
	    					"<td>"+format(new Date(val.makeTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
	    					"<td>"+toChar(val.accountingEntityName)+"</td>" +
	    					"<td style='display:none'>"+val.parentSettlementInfoId+"</td>" +
	    					"<td style='display:none'>"+val.waybillInfoId+"</td>" +
	    					"<td style='display:none'>"+val.isProxyMode+"</td>" +
	    					"<td style='display:none'>"+val.couponUseInfoId+"</td>" +
	    					"<td style='display:none'>"+val.settlementFormulaDetailId+"</td>" +
	    					"<td style='display:none'>"+val.forwardingId+"</td>" +
	    					"<td style='display:none'>"+val.arriveId+"</td>" +
	    					"<td style='display:none'>"+val.lineInfoId+"</td>" +
	    					"<td style='display:none'>"+val.endPoints+"</td>" +
	    					"</tr>");
	    		})
	        }
	    })
	}

  $("#searchSettlementInfo").click(function(){
	  showSettlementInfo(1);
  });
  
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
  //把null值转化为空字符串
  function toChar(data) {
		if (data == null) {
			data = "";
		}
		return data;
	}
  //跳转到新增页面
  $("#goAddSettlement").click(function(){
	  sign = "1";  //新增标识
	  window.location.href =basePath+"/settlementInfo/goSettlementLossesAdd?sign="+sign;
  })
  
  //跳转到修改页面
  $("#goEditSettlement").click(function(){
	  var selectlist = findAllCheck(".sub-auth-check");
	    if (selectlist.length == 0 || selectlist.length > 1) {
	      xjValidate.showPopup("请选择一条数据","提示");
	      return;
	    }
	    var ftr = $("#SettlementCheck:checked").parents("tr");
		   var id = ftr.children().eq(1).html();
		    var settlementStatus = ftr.children().eq(2).html();
		    if(settlementStatus == '起草' || settlementStatus == '审核驳回'){
	  sign = "2";  //修改标识
	  window.location.href =basePath+"/settlementInfo/goSettlementLossesEdit?sign="+sign+"&id="+id;
		    }else{
		    	  xjValidate.showPopup("该数据已审核或已提交审核","提示");
			      return;
		    }
		    })
  
  //删除
$("#delSettlementInfo").click(function(){
	var ids ="";
	var wIds = "";
	var settlementStatus="";
	var settlementArray="";
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0) {
      xjValidate.showPopup("请选择要删除的数据","提示");
      return;
    }
	    $("#SettlementCheck:checked").each(function() {
	    	var id = $(this).parents("tr").children().eq(1).html();
	    	var waybillInfoId = $(this).parents("tr").children().eq(47).html();
	    	ids += id+",";
	    	wIds +=waybillInfoId+","
	    	settlementStatus = $(this).parents("tr").children().eq(2).html();
	    	settlementArray += settlementStatus+",";
	    })
	   // alert(ids);
	    if(settlementArray.indexOf("待审核") > -1  || settlementArray.indexOf("审核通过") > -1){
    		xjValidate.showPopup("已提交审核或审核通过,无法删除!","提示");
	    	return;
     }else
	  //执行删除操作
    	 $.confirm({
 			title : "提示",
 			content : "您确认要删除选中的数据？",
 			buttons : {
 				'确认' : function() {
 					 //提交审核操作
 					 $.ajax({
 			  	    	url:basePath+ "/settlementInfo/delSettlementInfo",//请求的action路径
 			  	        async:false,//是否异步
 			  	        cache:false,//是否使用缓存
 			  	        type:'POST',//请求方式：post
 			  	        data:{"ids":ids,"wIds":wIds},
 			  	        dataType:'json',//数据传输格式：json
 			  	        error:function(){
 			  	            //请求失败处理函数
 			  	            xjValidate.showPopup('请求失败！',"提示");
 			  	        },
 			  	        success:function(data){
 			  	        	if(data == true){
 			  	        		window.location.href = basePath+ "/settlementInfo/goSettlementLosses";
 			  	        	}
 			  	        }
 			  	    });
 				},
 				'取消' : function() {
 				}
 			}
 		});
});

//提交审核
  $("#tijiaoButton").click(function(){
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0 || selectlist.length > 1) {
      xjValidate.showPopup("请选择一条数据","提示");
      return;
    }
	
    var ftr = $("#SettlementCheck:checked").parents("tr");
	   var id = ftr.children().eq(1).html();
	    var settlementStatus = ftr.children().eq(2).html();
	    if(settlementStatus == '起草' || settlementStatus == '审核驳回'){
	    	  //提交审核操作
	    	$.confirm({
    			title : "提示",
    			content : "您确认要提交审核选中的数据？",
    			buttons : {
    				'确认' : function() {
    					 //提交审核操作
    					 $.ajax({
    			    	    	url:basePath+ "/settlementInfo/submitSettlementInfo",//请求的action路径
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
    			    	        	if(data == true){
    			    	        		window.location.href = basePath+ "/settlementInfo/goSettlementLosses";
    			    	        	}
    			    	        }
    			    	    });
    				},
    				'取消' : function() {
    				}
    			}
    		});
	    }else{
	    	xjValidate.showPopup("该记录已提交审核或审核通过!","提示");
	    	return;
	    }

});

//审核
$("#audit").click(function(){
	
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0 || selectlist.length > 1) {
      xjValidate.showPopup("请选择一条数据","提示");
      return;
    }
	    
	
    var ftr = $("#SettlementCheck:checked").parents("tr");
	   var id = ftr.children().eq(1).html();
	    var settlementStatus = ftr.children().eq(2).html();
	    if(settlementStatus == '待审核'){
	    	var buttonType = "";
	    	var auditOpinion="";
	    	$.confirm({
				title : '请您填写审核意见:',
				content : ''
						+ '<form action="" class="formName">'
						+ '<div class="form-group">'
						+ '<textarea type="text" placeholder="审核意见" id ="auditOpinion" class="name form-control" required style="height:150px;  resize: none;" />'
						+ '</div>' + '</form>',
				buttons : {
					agreed : {
						text : '通过',
						btnClass : 'btn-blue',
						action : function() {
							buttonType = "1";
							auditOpinion = this.$content.find('#auditOpinion').val();
							if (!auditOpinion) {
								xjValidate.showPopup("审核意见不能为空！", "提示");
								return false;
							}
							
							  //提交审核操作
					    	  $.ajax({
					    	    	url:basePath+ "/settlementInfo/auditSettlementInfo",//请求的action路径
					    	        async:false,//是否异步
					    	        cache:false,//是否使用缓存
					    	        type:'POST',//请求方式：post
					    	        data:{"id":id,"buttonType":buttonType,"auditOpinion":auditOpinion},
					    	        dataType:'json',//数据传输格式：json
					    	        error:function(){
					    	            //请求失败处理函数
					    	            xjValidate.showPopup('请求失败！',"提示");
					    	        },
					    	        success:function(data){
					    	        	if(data == true){
					    	        		window.location.href = basePath+ "/settlementInfo/goSettlementLosses";
					    	        	}
					    	        }
					    	    });
						}
					},
					rejected : {
						text : '不通过',
						btnClass : 'btn-red',
						action : function() {
							buttonType = "0";
							auditOpinion = this.$content.find('#auditOpinion').val();
							if (!auditOpinion) {
								xjValidate.showPopup("审核意见不能为空！", "提示");
								return false;
							}
							  //提交审核操作
					    	  $.ajax({
					    	    	url:basePath+ "/settlementInfo/auditSettlementInfo",//请求的action路径
					    	        async:false,//是否异步
					    	        cache:false,//是否使用缓存
					    	        type:'POST',//请求方式：post
					    	        data:{"id":id,"buttonType":buttonType,"auditOpinion":auditOpinion},
					    	        dataType:'json',//数据传输格式：json
					    	        error:function(){
					    	            //请求失败处理函数
					    	            xjValidate.showPopup('请求失败！',"提示");
					    	        },
					    	        success:function(data){
					    	        	if(data == true){
					    	        		xjValidate.showPopup("该记录审核被驳回","提示");
					    	        		window.location.href = basePath+ "/settlementInfo/goSettlementLosses";
					    	        	}
					    	        }
					    	    });
						}
					},
					'取消' : function() {
						// close
					}
				}
			});
	    	
	    	
	    }else{
	    	xjValidate.showPopup("该记录已审核或未提交审核!","提示");
	    	return;
	    }
}) 

//挂账红冲
$("#lossesRed").click(function(){
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0 || selectlist.length > 1) {
      xjValidate.showPopup("请选择一条数据","提示");
      return;
    }
    
    var ftr = $("#SettlementCheck:checked").parents("tr");
	var id = ftr.children().eq(1).html();
	var settlementStatus = ftr.children().eq(2).html();
	var isWriteOff = ftr.children().eq(8).html();
    if(settlementStatus == '审核通过'){
    	if(isWriteOff == '否'){
    		$.confirm({
    			title : "提示",
    			content : "您确认要红冲选中的数据？",
    			buttons : {
    				'确认' : function() {
    					 //提交审核操作
    					 $.ajax({
    					    	url:basePath+ "/settlementInfo/RedSettlementInfo",//请求的action路径
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
    					        	if(data == true){
    					        		window.location.href = basePath+ "/settlementInfo/goSettlementLosses";
    					        	}
    					        }
    					    });
    				},
    				'取消' : function() {
    				}
    			}
    		});
    	}else{
    		xjValidate.showPopup("该信息已挂账红冲","提示");
    	}
    }else{
    	xjValidate.showPopup("该信息未审核","提示");
    }
});

//调差弹出框
$("#adjustment").click(function(){
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0 || selectlist.length > 1) {
      xjValidate.showPopup("请选择一条数据","提示");
      return;
    }
    
    var ftr = $("#SettlementCheck:checked").parents("tr");
	var id = ftr.children().eq(1).html();
	var currentTransportPrice = ftr.children().eq(29).html();
	var settlementTonnage = ftr.children().eq(25).html();
	var shipperPrice = ftr.children().eq(29).html();
	$("#settlementInfoId").val(id);
	$("#currentTransportPrice").val(currentTransportPrice);
	$("#settlementTonnage").val(settlementTonnage);
	$("#shipperPrice").val(shipperPrice);
	var settlementStatus = ftr.children().eq(2).html();
	var isWriteOff = ftr.children().eq(8).html();
	   if(settlementStatus == '审核通过'){
	    	if(isWriteOff == '否'){
	    		var url = basePath
				+ "/settlementInfo/selectSettlementForReviceInfo #differenceModal";
		$("#differenceDiv").load(url, {
			"id":id
		}, function() {
		})
	    	}else{
	    		xjValidate.showPopup("该信息已挂账红冲","提示");
	    	}
	    }else{
	    	xjValidate.showPopup("该信息未审核","提示");
	    }
});
/*function choiceInput(){
	var reviseType = $("#reviseType").val();
	if(reviseType == '1'){//调差类型为调整运价
		$("#reviseTransportPrice").removeAttr("readonly");
		$("#reviseArriveTonnage").attr("readonly","readonly");
		$("#otherProjectRevise").attr("readonly","readonly");
		$("#reviseTransportPrice").val("");
		$("#reviseArriveTonnage").val(0);
		$("#otherProjectRevise").val(0);
		return;
	}
	if(reviseType == '2'){//调差类型为调整到货吨位
		$("#reviseArriveTonnage").removeAttr("readonly");
		$("#reviseTransportPrice").attr("readonly","readonly");
		$("#otherProjectRevise").attr("readonly","readonly");
		$("#reviseArriveTonnage").val("");	
		$("#reviseTransportPrice").val(0);
		$("#otherProjectRevise").val(0);
		return;
	}
	if(reviseType == '3'){//调差类型为其他调整
		$("#otherProjectRevise").removeAttr("readonly");
		$("#reviseTransportPrice").attr("readonly","readonly");
		$("#reviseArriveTonnage").attr("readonly","readonly");
		$("#otherProjectRevise").val("");
		$("#reviseTransportPrice").val(0);
		$("#reviseArriveTonnage").val(0);
		return;
	}
}*/
//保存调差信息
/*$("#saveSettleRevise").click(function(){
	var settlementInfoId = $("#settlementInfoId").val();
	var currentTransportPrice = $("#currentTransportPrice").val();
	var settlementTonnage = $("#settlementTonnage").val();
	var shipperPrice = $("#shipperPrice").val();
	var reviseType = $("#reviseType").val();
	var reviseTransportPrice = $("#reviseTransportPrice").val();
	var reviseArriveTonnage = $("#reviseArriveTonnage").val();
	var otherProjectRevise = $("#otherProjectRevise").val();
	var remarks = $("#remarks").val();
	if(reviseType ==""){
		xjValidate.showPopup("请选择调差类型","提示");
		return;
	}
	if(reviseType == '1'){//调差类型为调整运价
		if(reviseTransportPrice == ""){
			xjValidate.showPopup("请输入调整运价金额","提示");
			return;
		}
		
	}
	if(reviseType == '2'){//调差类型为调整到货吨位
		if(reviseArriveTonnage == ""){
			xjValidate.showPopup("请输入调整吨位","提示");
			return;
		}
	}
	if(reviseType == '3'){//调差类型为其他调整
		if(otherProjectRevise == ""){
			xjValidate.showPopup("请输入其他项目调整","提示");
			return;
		}
	}
	var check = xjValidate.checkForm();
	if(check == false){
		xjValidate.showPopup("数据错误","存在不合法数据请检查")
		return;
	}
	var addData = {
			settlementInfoId:settlementInfoId,
			currentTransportPrice:currentTransportPrice,
			settlementTonnage:settlementTonnage,
			shipperPrice:shipperPrice,
			reviseType:reviseType,
			reviseTransportPrice:reviseTransportPrice,
			reviseArriveTonnage:reviseArriveTonnage,
			otherProjectRevise:otherProjectRevise,
			remarks:remarks
	};
	$.ajax({
    	url:basePath+ "/settlementInfo/reviseSettlementInfo",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:addData,
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	if(data == true){
        		//刷新页面
        		window.location.href = basePath+ "/settlementInfo/goSettlementLosses";
        	}
        }
    });
	
});*/

//导出
$("#exportSettlement").click(function(){
	var ids = "";
	var type = 1;
	DownLoadReportIMG('');
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0) {
      xjValidate.showPopup("请选择要导出的数据","提示");
      return;
    }
	$("#SettlementCheck:checked").each(function() {
		   var id = $(this).parents("tr").children().eq(1).html();
		   ids += id+",";
		    });
	var url = basePath+ "/settlementInfo/exportSettlementLosses?ids="+ids+"&type="+type;
	window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes"); 
	/*$.ajax({
    	url:basePath+ "/settlementInfo/exportSettlementLosses",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"ids":ids,"url":url,"name":name},
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	if(data == true){
        		xjValidate.showPopup("导出成功","提示");
        	}
        }
    });*/
});

//金蝶EAS导出
$("#EASexportSettlement").click(function(){
	var ids = "";
	var type = 1;
	var flag = true;
	DownLoadReportIMG('');
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0) {
      xjValidate.showPopup("请选择要导出的数据","提示");
      return;
    }
	$("#SettlementCheck:checked").each(function() {
		var state = $(this).parents("tr").children().eq(2).html();
			if(state!='审核通过'){
				xjValidate.showPopup("请选择审核通过的数据","提示");
				flag  = false;
			     return;
			}
			var id = $(this).parents("tr").children().eq(1).html();
			ids += id+",";
		});
	if(flag){
		var url = basePath+ "/settlementInfo/EASexportSettlementLosses?ids="+ids+"&type="+type;
		window.open(url,"toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes"); 
	}
	/*$.ajax({
    	url:basePath+ "/settlementInfo/exportSettlementLosses",//请求的action路径
        async:false,//是否异步
        cache:false,//是否使用缓存
        type:'POST',//请求方式：post
        data:{"ids":ids,"url":url,"name":name},
        dataType:'json',//数据传输格式：json
        error:function(){
            //请求失败处理函数
            xjValidate.showPopup('请求失败！',"提示");
        },
        success:function(data){
        	if(data == true){
        		xjValidate.showPopup("导出成功","提示");
        	}
        }
    });*/
});

//假如值为空则赋值为0
function setZero(obj){
	if(obj == "" || obj == null){
		obj = "0";
	}
	return obj;
}

function DownLoadReportIMG(imgPathURL) {
    if (!document.getElementById("IframeReportImg"))
        $('<iframe  id="IframeReportImg" name="IframeReportImg" onload="DoSaveAsIMG();" width="0" height="0" src="about:blank"></iframe>').appendTo("body");
    if (document.all.IframeReportImg.src != imgPathURL) {

        document.all.IframeReportImg.src = imgPathURL;
    }
    else {
        DoSaveAsIMG(); 
    }
}
function DoSaveAsIMG() {
    if (document.all.IframeReportImg.src != "about:blank")
    	document.getElementById("IframeReportImg").document.execCommand("DoSaveAsIMG");       
}

$("#daying").click(function(){//打印
	//alert("aaa");
	var selectlist = findAllCheck(".sub-auth-check");
    if (selectlist.length == 0 || selectlist.length > 1) {
      xjValidate.showPopup("请选择一条数据","提示");
      return;
    }
    
    var ftr = $("#SettlementCheck:checked").parents("tr");
	var id = ftr.children().eq(1).html();
	var settlementStatus = ftr.children().eq(2).html();
		   window.location.href = basePath+"/settlementInfo/printSettlementInfo?id="+id;
})

//监听调差类型change事件
$("body").on("change","#txreviseType",function(){
	 if($("#txreviseType").val() == 0){//吨位调差
			$("#txforwardingTonnageDiv").hide();
			$("#txarriveTonnageDiv").hide();
			$("#tcshipperPriceDiv").hide();
			$("#txpayablePriceDiv").hide();
			$("#txactualPaymentPriceDiv").hide();
			$("#txtransportPriceIncomeTaxDiv").hide();
			$("#txincomeTaxDiv").hide();
			$("#txotherTaxPriceDiv").hide();
			$("#txtransportPriceCostDiv").hide();
		}
	
	if($("#txreviseType").val() == 1){//金额调差
		$("#txforwardingTonnageDiv").hide();
		$("#txarriveTonnageDiv").hide();
	    $("#tcshipperPriceDiv").show();
		$("#txpayablePriceDiv").show();
		$("#txactualPaymentPriceDiv").show();
		$("#txtransportPriceIncomeTaxDiv").show();
		$("#txincomeTaxDiv").show();
		$("#txotherTaxPriceDiv").show();
		$("#txtransportPriceCostDiv").show();
	}
    if($("#txreviseType").val() == 2){//金额+吨位调差
		$("#txforwardingTonnageDiv").show();
		$("#txarriveTonnageDiv").show();
		$("#tcshipperPriceDiv").show();
		$("#txpayablePriceDiv").show();
		$("#txactualPaymentPriceDiv").show();
		$("#txtransportPriceIncomeTaxDiv").show();
		$("#txincomeTaxDiv").show();
		$("#txotherTaxPriceDiv").show();
		$("#txtransportPriceCostDiv").show();
	}
    if($("#txreviseType").val() == 3){//吨位调差
		$("#txforwardingTonnageDiv").show();
		$("#txarriveTonnageDiv").show();
		$("#tcshipperPriceDiv").hide();
		$("#txpayablePriceDiv").hide();
		$("#txactualPaymentPriceDiv").hide();
		$("#txtransportPriceIncomeTaxDiv").hide();
		$("#txincomeTaxDiv").hide();
		$("#txotherTaxPriceDiv").hide();
		$("#txtransportPriceCostDiv").hide();
	}
})

//关闭调差弹框
	$("body").on("click",".reciveInfo-close",function(){
		$("#differenceDiv").empty();
	});

//保存调差数据新增结算单
$("body").on("click","#saveReciveInfo",function(){
	var id = $("#tcId").val();
	var reviseType = $("#txreviseType").val();
	var shipperPrice = $("#tcshipperPrice").val();
	var forwardingTonnage = $("#txforwardingTonnage").val();
	var arriveTonnage = $("#txarriveTonnage").val();
	var payablePrice = $("#txpayablePrice").val();
	var actualPaymentPrice = $("#txactualPaymentPrice").val();
	var transportPriceIncomeTax = $("#txtransportPriceIncomeTax").val();
	var incomeTax = $("#txincomeTax").val();
	var otherTaxPrice = $("#txotherTaxPrice").val();
	var transportPriceCost = $("#txtransportPriceCost").val();
     if(reviseType == 0 || reviseType == null || reviseType == ""){
    	 xjValidate.showPopup("请选择调差类型","警告");
    	 return;
     }
	var check = xjValidate.checkForm();
	if(check == false){
		xjValidate.showPopup("输入的数据不符合规范","警告")
		return;
	}
	
	var insertData = {
			id:setZero(id),
			reviseType:setZero(reviseType),
			shipperPrice:setZero(shipperPrice),
			forwardingTonnage:setZero(forwardingTonnage),
			arriveTonnage:setZero(arriveTonnage),
			payablePrice:setZero(payablePrice),
			actualPaymentPrice:setZero(actualPaymentPrice),
			transportPriceIncomeTax:setZero(transportPriceIncomeTax),
			incomeTax:setZero(incomeTax),
			otherTaxPrice:setZero(otherTaxPrice),
			transportPriceCost:setZero(transportPriceCost)
	         };

	 $.ajax({
	    	url:basePath+"/settlementInfo/saveSettlementForRecive",//请求的action路径
	        async:false,//是否异步
	        cache:false,//是否使用缓存
	        type:'POST',//请求方式：post
	        data:insertData,
	        dataType:'json',//数据传输格式：json
	        error:function(){
	            //请求失败处理函数
	            xjValidate.showPopup("请求失败！","提示");
	        },
	        success:function(data){
	        	if(data == false){
	        		xjValidate.showPopup("调差失败！","提示");
	        	}else{
	        		$("#differenceDiv").empty();
	        		window.location.href = basePath+ "/settlementInfo/goSettlementLosses";
	        	}
	        	
	        	}
	        });
});


