 //初始化page
  var bigPage = null;
  var linePage = null;
  var contractPage1 = null;
  var contractPage2 = null;

 (function($) {
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
	 
	//大宗运价列表page页面
     bigPage = $("#bigPage").operationList({
       "current":1,    //当前目标
       "maxSize":4,  //前后最大列表
       "itemPage":10,  //每页显示多少条
       "totalItems":0,  //总条数
       "chagePage":function(current){
         //调用ajax请求拿最新数据
           //console.log(current); 
       	showTraffictcsInfo(current);
       }
     });
     
     /**
      * 大宗运价页面跳转
      */
     function bigPageSlect(e) {
       var value = $(e).prev().find('input').val();
       bigPage.setCurrentPage(value);
     }
      
     //转包合同分页
     contractPage2 = $("#contractPage2").operationList({
	      "current":1,    //当前目标
	      "maxSize":4,  //前后最大列表
	      "itemPage":10,  //每页显示多少条
	      "totalItems":0,  //总条数
	      "chagePage":function(current){
	        //调用ajax请求拿最新数据
	    	  contractSelectByPackage(current);
	      }
	    });
  function contractPageSlect2(e) {
      var value = $(e).prev().find('input').val();
      contractPage2.setCurrentPage(value);
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
          useSeconds:true
        }); 
    },500)

    //允许表格拖着
    $("#tableDrag").colResizable({
      liveDrag:true, 
      gripInnerHtml:"<div class='grip'></div>", 
      draggingClass:"dragging"
    });
    
    //数据较多，增加滑动
    $.mCustomScrollbar.defaults.scrollButtons.enable = true; 
      $.mCustomScrollbar.defaults.axis = "yx"; 
      $(".iscroll").css("min-height","55px");
      $(".iscroll").mCustomScrollbar({
        theme: "minimal-dark"
      });
  })(jQuery)

  function resetEmpty() {
    //清除线路
    $("#selectLine").empty();
  }

  /*function addFreight1() {
    $("#addFreightModal1").modal('show');
      $("#freight-title").text("新增物流运价");
    //时间调用插件（精确到秒）
      setTimeout(function() {
        $(".date-time-ss").datetimepicker({
            format: "YYYY-MM-DD hh:mm:ss",
            autoclose: true,
            todayBtn: true,
            todayHighlight: true,
            showMeridian: true,
            useSeconds:true
          }); 
      },500)
    }*/
  
 

  

  /**
   *线路page页跳转
   */
  function linePageSlect(e) {
    var value = $(e).prev().find('input').val();
    linePage.setCurrentPage(value);
  }

  /**
   *线路选择
   */
  function submitSelectLine() {
     var selectlist = findAllCheck(".line-check");
     if(selectlist.length==0 || selectlist.length>1) {
       // xjValidate.showTip("请选择一条数据");
    	 xjValidate.showPopup("请选择一条数据","提示")
        return;
     }
    $("#selectLine").text(selectlist[0].name);
    $("#selectLine").next("input").val(selectlist[0].id);
    $("#lineSelectModal").modal('hide');
  }

  /**
   * 添加合同弹出框
   */


  /**
   *合同page页跳转
   */
 /* function contractPageSlect(e) {
    var value = $(e).prev().find('input').val();
    contractPage.setCurrentPage(value);
  }*/

  /**
   *合同选择
   */

  /**
   * 查找选择
   */
  function findAllCheck(element){
    var checkList = new Array();
    $(element).each(function(){
      if($(this).is(":checked")){
        var params = {
          "id":$(this).attr("data-id"),
          "name":$(this).attr("data-name")
        }
        checkList.push(params);
      }
    });
	return checkList;
}

