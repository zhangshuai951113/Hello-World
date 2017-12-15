 var newsPage = null;

(function($) {
	 //初始消息列表page页面
	    newsPage = $("#orgPage").operationList({
	    "current":1,    //当前目标
	    "maxSize":4,  //前后最大列表
	    "itemPage":10,  //每页显示多少条
	    "totalItems":0,  //总条数
	    "chagePage":function(current){
	      //调用ajax请求拿最新数据
	    	selectdaiban(current); 
	    }
	  });
	    
	    /**
	     *消息page页跳转
	     */
	 function orgPageSlect(e) {
	      var value = $(e).prev().find('input').val();
	      newsPage.setCurrentPage(value);
	    }
  })(jQuery)
  

//查询我的未处理的消息
function selectdaiban(pageNo){
	$("#newsTbody").empty();
	$("#newsTbody").html("");
  var pageSizeStr = '6';
	
  //alert(lineName);
  $.ajax({
  	url:basePath+ "/messages/selecMesagesInfo",//请求的action路径
      async:false,//是否异步
      cache:false,//是否使用缓存
      type:'POST',//请求方式：post
      dataType:'json',//数据传输格式：json
      data:{
    	    curPage : pageNo,
    	    pageSizeStr : pageSizeStr
    	    },
      error:function(){
          //请求失败处理函数
          xjValidate.showPopup("请求失败","提示");
      },
      success:function(data){
    	  var jsonAll = data;
    	  var jsonList = jsonAll.tList;
      	  var totalCount = jsonAll.totalCount;
      	$("#orgNum").text("搜索结果共"+totalCount);
      	newsPage.setTotalItems(totalCount);
    		$.each(jsonList,function(i, val) {
    			$("#newsTbody").append("<tr class='table-body '><td>" +
    					"<div class='view-operation view-send-contract operation-m'>"+
							"<div class='view-icon'></div>"+
							"<div class='text' onclick = 'lookNews(this)'>去处理</div>"+
							"</div></td>" +
    					"<td style='display:none'>"+val.id+"</td>" +
    					"<td>"+val.ownedModuleName+"</td>" +
    					"<td>"+val.messageTitle+"</td>" +
    					"<td>"+val.sendPersonName+"</td>" +
    					"<td>"+format(new Date(val.sendTime).toString(),'yyyy-MM-dd HH:mm:ss')+"</td>" +
    					"<td style='display:none'>"+val.ownedModuleUrl+"</td>" +
    					"</tr>");
    		})
      }
  });
}

//处理待办
function lookNews(obj){
	var ftr = $(obj).parents("tr");
	var url = ftr.children().eq(6).html();
	//alert(url);
window.location.href = basePath+url;
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
