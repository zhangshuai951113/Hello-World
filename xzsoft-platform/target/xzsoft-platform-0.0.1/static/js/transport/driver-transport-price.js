var bigPage = null;
  var linePage = null;
  var linePage2 = null;
  var contractPage1 = null;
  var contractPage2 = null;
  var orgPage = null;
  var goodsPage = null;   //初始化货路page
  var fromLine = "searchLine";
  (function($) {
	  //初始客户列表page页面
	    orgPage = $("#orgPage").operationList({
	     "current":1,    //当前目标
	     "maxSize":4,  //前后最大列表
	     "itemPage":10,  //每页显示多少条
	     "totalItems":0,  //总条数
	     "chagePage":function(current){
	       //调用ajax请求拿最新数据
	       console.log(current); 
	     }
	   });
	   //设置客户总页面
	   orgPage.setTotalItems(20);
	   $("#orgNum").text(20);
	  
    //初始化外协司机运价列表page页面
    bigPage = $("#bigPage").operationList({
      "current":1,    //当前目标
      "maxSize":4,  //前后最大列表
      "itemPage":10,  //每页显示多少条
      "totalItems":0,  //总条数
      "chagePage":function(current){
        //调用ajax请求拿最新数据
    	  showDriverTarfficInfo(current);
      }
    });
    
    /**
     * 外协司机运价页面跳转
     */
    function bigPageSlect(e) {
      var value = $(e).prev().find('input').val();
      bigPage.setCurrentPage(value);
    }
    
    //初始线路列表page页面
    linePage = $("#linePage").operationList({
    "current":1,    //当前目标
    "maxSize":4,  //前后最大列表
    "itemPage":10,  //每页显示多少条
    "totalItems":0,  //总条数
    "chagePage":function(current){
      //调用ajax请求拿最新数据
    	lineSelect(current); 
    }
  });
    
    /**
     *线路page页跳转
     */
    function linePageSlect(e) {
      var value = $(e).prev().find('input').val();
      linePage.setCurrentPage(value);
    }
    
    //初始线路列表page页面
    linePage2 = $("#linePage2").operationList({
    "current":1,    //当前目标
    "maxSize":4,  //前后最大列表
    "itemPage":10,  //每页显示多少条
    "totalItems":0,  //总条数
    "chagePage":function(current){
      //调用ajax请求拿最新数据
    	lineSelect1(current); 
    }
  });
    
    /**
     *线路page页跳转
     */
    function linePageSlect2(e) {
      var value = $(e).prev().find('input').val();
      linePage2.setCurrentPage(value);
    }
      //物流合同分页
	   contractPage1 = $("#contractPage1").operationList({
		      "current":1,    //当前目标
		      "maxSize":4,  //前后最大列表
		      "itemPage":10,  //每页显示多少条
		      "totalItems":0,  //总条数
		      "chagePage":function(current){
		        //调用ajax请求拿最新数据
		    	  contractSelectByLogictics(current);
		      }
		    });
	   function contractPageSlect1(e) {
	       var value = $(e).prev().find('input').val();
	       contractPage1.setCurrentPage(value);
	     }
	   
	   //初始货物列表page页面
	    goodsPage = $("#goodsPage").operationList({
	    "current":1,    //当前目标
	    "maxSize":4,  //前后最大列表
	    "itemPage":10,  //每页显示多少条
	    "totalItems":0,  //总条数
	    "chagePage":function(current){
	      //调用ajax请求拿最新数据
	    	goodsSelect(current); 
	    }
	    });
	    
	    /**
	     *货物page页跳转
	     */
	     function goodsPageSlect(e) {
	       var value = $(e).prev().find('input').val();
	       goodsPage.setCurrentPage(value);
	     }
	    
    //全选/全不选
    $("body").on("click",".all-auth-check",function(){
      if($(".all-auth-check").is(":checked")){
        //全选时
        $(".sub-auth-check").each(function(){
          $(this).prop("checked",true);
        });
      }else{
        //全不选时
        $(".sub-auth-check").each(function(){
          $(this).prop("checked",false);
        });
      }
    });

    //时间调用插件
    setTimeout(function() {
      $(".date-time").datetimepicker({
        format: "YYYY-MM-DD",
        autoclose: true,
        todayBtn: true,
        todayHighlight: true,
        showMeridian: true,
        pickTime:false
      }); 
    },500)

    //时间调用插件（精确到秒）
    setTimeout(function() {
      $(".date-time-ss").datetimepicker({
          format: "YYYY-MM-DD 00:00:00",
          autoclose: true,
          todayBtn: true,
          todayHighlight: true,
          showMeridian: true,
          useSeconds:true
        }); 
    },500)

    //数据较多，增加滑动
    $.mCustomScrollbar.defaults.scrollButtons.enable = true; 
    $.mCustomScrollbar.defaults.axis = "yx"; 
    $(".iscroll").css("min-height","55px");
    $(".iscroll").mCustomScrollbar({
      theme: "minimal-dark"
    });

       //允许表格拖着
    $("#tableDrag").colResizable({
      liveDrag:true, 
      gripInnerHtml:"<div class='grip'></div>", 
      draggingClass:"dragging"
    });
  })(jQuery)

 
  
  function resetEmpty() {
    //清除线路
    $("#selectLine").empty();
  }
 
 /**
   * 新增选择弹出框  （企业货主和物流公司选择不通框弹出）
   */
  

  /**
   * 添加线路弹出框
   */
/*  function lineSelect(str) {
    fromLine = str;
    $("#lineSelectModal").modal('show');
    
  }*/

  

  /**
   *线路选择
   */
  /*function submitSelectLine() {
    var selectlist = findAllCheck(".line-check");
    if(selectlist.length==0 || selectlist.length>1) {
      showTip("请选择一条数据");
      return;
    }
    if(fromLine == 'searchLine') {
      $("#selectLine").text(selectlist[0].name);
      $("#selectLine").next("input").val(selectlist[0].id);
    } else {
      $("#modalLine").text(selectlist[0].name);
      $("#modalLine").next("input").val(selectlist[0].id);
      $("#distance").text(selectlist[0].km);
    }
    $("#lineSelectModal").modal('hide');
  }*/


    /**
   * 添加合同弹出框
   */
  function contractSelect() {
    $("#contractSelectModal").modal('show');
     //初始合同列表page页面
      contractPage = $("#contractPage").operationList({
      "current":1,    //当前目标
      "maxSize":4,  //前后最大列表
      "itemPage":10,  //每页显示多少条
      "totalItems":0,  //总条数
      "chagePage":function(current){
        //调用ajax请求拿最新数据
        console.log(current); 
      }
    });
    //设置合同总页面
    contractPage.setTotalItems(20);
    $("#lineNum").text(20);
  }

  /**
   *合同page页跳转
   */
  function contractPageSlect(e) {
    var value = $(e).prev().find('input').val();
    contractPage.setCurrentPage(value);
  }

  /**
   *合同选择
   */
  function submitSelectContract() {
    var selectlist = findAllCheck(".contract-check");
    if(selectlist.length==0 || selectlist.length>1) {
     // showTip("请选择一条数据");
      return;
    }
    console.log(selectlist[0].id)
    $(".ht-textarea-text").text("合同明细")
    $("#contractSelectModal").modal('hide');
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
  function audit(id) {
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
              //showTip("审核意见不能为空！", "提示");
                xjValidate.showPopup('审核意见不能为空！',"提示");
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
              //showTip("审核意见不能为空！", "提示");
                xjValidate.showPopup('审核意见不能为空！',"提示");
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

  /**
   * 验证数字，保留4位小数
   * @param value  传入的this
   */
  function clearNoNum(obj){
    obj.value = obj.value.toString(); 
    obj.value = obj.value.replace(/[^\d.]/g,""); 
    obj.value = obj.value.replace(/\.{2,}/g,".");   
    obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
    var decimalRe = /^(\-)*(\d+)\.(\d{4}).*$/;
    obj.value = obj.value.replace(decimalRe,'$1$2.$3'); 
    if(obj.value.indexOf(".")< 0 && obj.value !=""){
        obj.value= parseFloat(obj.value); 
    } 
  }