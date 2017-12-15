//初始化page
  var bigPage = null;
  var linePage = null;
  var contractPage1 = null;
  var contractPage2 = null;

 (function($) {
	  //初始代理方列表page页面
	   orgPage = $("#orgPage").operationList({
	    "current":1,    //当前目标
	    "maxSize":4,  //前后最大列表
	    "itemPage":10,  //每页显示多少条
	    "totalItems":0,  //总条数
	    "chagePage":function(current){
	      //调用ajax请求拿最新数据
	    	orgSelect(current); 
	    }
	  });
	  //设置代理方总页面
	  orgPage.setTotalItems(20);
	  $("#orgNum").text(20);
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


  /**
   *代理方page页跳转
   */
  function orgPageSlect(e) {
    var value = $(e).prev().find('input').val();
    orgPage.setCurrentPage(value);
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
          "name":$(this).attr("data-name")
        }
        checkList.push(params);
      }
    });
    return checkList;
  }

