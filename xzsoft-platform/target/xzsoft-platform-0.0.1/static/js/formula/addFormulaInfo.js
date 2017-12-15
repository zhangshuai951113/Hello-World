var linePage = null;
var goodsPage = null;
var accountingPage = null;
var customerPage = null;
var count = true;
var huanhang = '<p class="huanhang"><p/>';
var num = 80;
var id_span1='';
var id_span2='';
var id_span_num='';
var isnum = '';
var count_3 = 0;
var html_sj ; 
$(function(){
	//时间调用插件
    setTimeout(function() {
       $(".date-time").datetimepicker({
          format: "YYYY-MM-DD HH:mm:ss",
          autoclose: true,
          todayBtn: true,
          todayHighlight: true,
          showMeridian: true,
          pickerPosition: "bottom-left",
          startView: 2,//月视图
          minView: 2//日期时间选择器所能够提供的最精确的时间选择视图
        }); 
    },500);
	    
    html_sj = $(".header-samll-box-down").html().trim();
    $(":radio[name='equationMark']").click(function(){
    	   if($(this).val()==1){
    		   $("#customer_div").hide();
    		  // $("#addCustomerName").val('');
    		   $(".header-samll-box-down").empty();
    		   $(".header-samll-box-down").append(html_sj); 
    		   id_span1 = '';
				id_span2 = '';
    	   }
    	   if($(this).val()==2){
    		   id_span1 = '';
				id_span2 = '';
    		   $("#customer_div").show();
    		   //$("#addCustomerName").val('');
    		   $(".header-samll-box-down").empty();
    		   var htmlt = "<span name='tab' id='result14' class='span_b'>运费=</span>"+
		   		   	"<span name='tab' id='radius15' style='cursor:pointer' class='span_b' onclick='check_span(this);'>吨位</span>" +
					"<span name='tab' id='radius' class='span_b'>*</span>" +
					"<span name='tab' id='radius16' style='cursor:pointer' class='span_b' onclick='check_span(this);'>运价</span>" +
					"<br><p class='huanhang'></p><p></p>" +
    			   "<span name='tab' id='result17' class='span_b'>应付运费=</span>"+
	    		   	"<span name='tab' id='radius18' style='cursor:pointer' class='span_b' onclick='check_span(this);'>运费</span>" +
					"<span name='tab' id='radius' class='span_b'>-</span>" +
					"<span name='tab' id='radius19' style='cursor:pointer' class='span_b' onclick='check_span(this);'>扣损金额</span>" +
					"<span name='tab' id='radius' class='span_b'>-</span>" +
					"<span name='tab' id='radius20' style='cursor:pointer' class='span_b' onclick='check_span(this);'>其他扣款</span>" +
					"<span name='tab' id='radius' class='span_b'>-</span>" +
					"<span name='tab' id='radius21' style='cursor:pointer' class='span_b' onclick='check_span(this);'>燃料费</span>" +
					"<br><p class='huanhang'></p><p></p>" +
					"<span name='tab' id='result22' class='span_b'>实付金额=</span>" +
					"<span name='tab' id='radius23' style='cursor:pointer' class='span_b' onclick='check_span(this);'>应付运费</span>" +
					"<span name='tab' id='radius' class='span_b'>-</span>" +
					"<span name='tab' id='radius24' style='cursor:pointer' class='span_b' onclick='check_span(this);'>工本费</span>" +
					"<br><p class='huanhang'></p><p></p>" +
					"<span name='tab' id='result25' class='span_b'>本次付款=</span>" +
					"<span name='tab' id='radius26' style='cursor:pointer' class='span_b' onclick='check_span(this);'>实付金额</span>" +
					"<span name='tab' id='radius' class='span_b'>-</span>" +
					"<span name='tab' id='radius27' style='cursor:pointer' class='span_b' onclick='check_span(this);'>预付款</span>" +
					"<br><p class='huanhang'></p><p></p>" +
    		   		"<span name='tab' id='result28' class='span_b'>公路进项税=</span>" +
    		   		"<span name='tab' id='radius29' style='cursor:pointer' class='span_b' onclick='check_span(this);'>公路通行费</span>" +
    		   		"<span name='tab' id='radius' class='span_b'>/</span><span name='tab' id='radius' class='span_b'>(</span>" +
    		   		"<span name='tab' id='radius_isnum30' class='span_b' style='cursor:pointer' onclick='check_span(this);'>1</span>" +
    		   		"<span name='tab' id='radius' class='span_b'>+</span>" +
    		   		"<span name='tab' id='radius_isnum31' class='span_b' style='cursor:pointer' onclick='check_span(this);'>0.05</span>" +
    		   		"<span name='tab' id='radius' class='span_b'>)</span><span name='tab' id='radius' class='span_b'>*</span>" +
    		   		"<span name='tab' id='radius_isnum32' class='span_b' style='cursor:pointer' onclick='check_span(this);'>0.05</span>" +
    		   		"<br><p class='huanhang'></p><p></p>" +
    		   		"<span name='tab' id='result33' class='span_b'>高速公路进项税=</span>" +
    		   		"<span name='tab' id='radius34' style='cursor:pointer' class='span_b' onclick='check_span(this);'>高速公路通行费</span>" +
    		   		"<span name='tab' id='radius' class='span_b'>/</span><span name='tab' id='radius' class='span_b'>(</span>" +
    		   		"<span name='tab' id='radius_isnum35' class='span_b' style='cursor:pointer' onclick='check_span(this);'>1</span>" +
    		   		"<span name='tab' id='radius' class='span_b'>+</span>" +
    		   		"<span name='tab' id='radius_isnum36' class='span_b' style='cursor:pointer' onclick='check_span(this);'>0.03</span>" +
    		   		"<span name='tab' id='radius' class='span_b'>)</span><span name='tab' id='radius' class='span_b'>*</span>" +
    		   		"<span name='tab' id='radius_isnum37' class='span_b' style='cursor:pointer' onclick='check_span(this);'>0.03</span>" +
    		   		"<br><p class='huanhang'></p><p></p>" +
    		   		"<span name='tab' id='result38' class='span_b'>运费成本=</span><span name='tab' id='radius' class='span_b'>(</span>" +
    		   		"<span name='tab' id='radius39' style='cursor:pointer' class='span_b' onclick='check_span(this);'>应付运费</span>" +
    		   		"<span name='tab' id='radius' class='span_b'>+</span>" +
    		   		"<span name='tab' id='radius40' style='cursor:pointer' class='span_b' onclick='check_span(this);'>燃料费</span>" +
    		   		"<span name='tab' id='radius' class='span_b'>)</span>"+
    		   		"<span name='tab' id='radius' class='span_b'>/</span>" +
    		   		"<span name='tab' id='radius_isnum41' class='span_b' style='cursor:pointer' onclick='check_span(this);'>1.11</span>" +
    		   		"<br><p class='huanhang'></p><p></p>" +
    		   		"<span name='tab' id='result42' class='span_b'>运费进项税=</span>" +
    		   		"<span name='tab' id='radius43' style='cursor:pointer' class='span_b' onclick='check_span(this);'>运费成本</span>" +
    		   		"<span name='tab' id='radius' class='span_b'>*</span>" +
    		   		"<span name='tab' id='radius_isnum44' class='span_b' style='cursor:pointer' onclick='check_span(this);'>0.11</span><br>" +
    		   		"<p class='huanhang'></p><p></p>" +
    		   		"<span name='tab' id='result45' class='span_b'>进项税=</span>" +
    		   		"<span name='tab' id='radius46' style='cursor:pointer' class='span_b' onclick='check_span(this);'>运费进项税</span>";
    		   $(".header-samll-box-down").append(htmlt); 
    	   }
    	  });
    });
    
    //根据核算主体名称模糊查询
    $("#searchAccountingByName").click(function(){
    	accountingSelect(1);
    });
    
    //初始核算主体列表page页面
    accountingPage = $("#accountingPage").operationList({
    "current":1,    //当前目标
    "maxSize":4,  //前后最大列表
    "itemPage":10,  //每页显示多少条
    "totalItems":0,  //总条数
    "chagePage":function(current){
      //调用ajax请求拿最新数据
    	accountingSelect(current); 
    }
  });
    //初始承运方列表page页面
    customerPage = $("#customerPage").operationList({
    "current":1,    //当前目标
    "maxSize":4,  //前后最大列表
    "itemPage":10,  //每页显示多少条
    "totalItems":0,  //总条数
    "chagePage":function(current){
      //调用ajax请求拿最新数据
    	customerSelect(current); 
    }
  });
    
    
	    
		$(".comTbody td:nth-child(2)").click(function(){
			if(id_span_num.length>0){
				$("#"+id_span_num).css("background","#F0F0F0");
				count_3 = 0;
				id_span_num = '';
			}
			var text = $(this).text();
			
			if(id_span1.length>0&&id_span2.length>0){
				$("#"+id_span1).css("background","#F0F0F0");
				$("#"+id_span2).css("background","#F0F0F0");
				id_span1 = '';
				id_span2 = '';
				xjValidate.showPopup('修改计算项只能选择一个！',"提示");
				return;
			}
			if(id_span1.length>0){
				$("#"+id_span1).css("background","#F0F0F0");
				$("#"+id_span1).text(""+text);
				id_span1 = '';
			}else{
				var html = $(".header-samll-box-down").html();
				 if(html.trim().length==0||html.substr(html.length-4,html.length)=='</p>'){
					 count = true;
				 }else{
					 count = false;
				 }
				if(count){
					var htmlt = "<span name='tab' id='result"+num+"' class='span_b'>"+text+" = </span>";
				}else{
					var htmlt = "<span name='tab' id='radius"+num+"' style='cursor:pointer' class='span_b' onclick='check_span(this);'>"+text+"</span>";
				}
				$(".header-samll-box-down").append(htmlt); 
				count = false;
				num++;
			}
		})
		$(".comTbody-two td:nth-child(2)").click(function(){
			var texts = $(this).text();
			if(id_span_num.length>0){
				$("#"+id_span_num).css("background","#F0F0F0");
				count_3 = 0;
				id_span_num = '';
			}
			if(id_span1.length>0&&id_span2.length>0){
				$("#"+id_span1).css("background","#F0F0F0");
				$("#"+id_span2).css("background","#F0F0F0");
				id_span1 = '';
				id_span2 = '';
				xjValidate.showPopup('修改计算项只能选择一个！',"提示");
				return;
			}
			if(id_span1.length>0){
				$("#"+id_span1).css("background","#F0F0F0");
				$("#"+id_span1).text(""+texts);
				id_span1 = '';
			}else{
				var htmlt = "<span name='tab' id='radius"+num+"' style='cursor:pointer' class='span_b' onclick='check_span(this);'>"+texts+"</span>";
				$(".header-samll-box-down").append(htmlt); 
				num++;
			}
		})
		$(".box-three td").click(function(){
			/**
			 * js 
			 * 	  保留整数 parseInt()
			 * 	  向上取整 Math.ceil()
			 * 	  向下取整 Math.floor()
			 * 	  四舍五入(取整) Math.round();	
			 */
			var texter = $(this).text();
			var html = $(".header-samll-box-down").html();
			var text = $(".header-samll-box-down span:last").text();
			var span1_num = id_span1.replace("radius", '');
			var span2_num = id_span2.replace("radius", '');
			if(text!=null&&text!=''){
				if(texter == '四舍五入(取整)'){
					if(id_span_num.length>0){
						$("#"+id_span_num).css("background","#F0F0F0");
						count_3 = 0;
						id_span_num = '';
					}
					
					if(span1_num.length==0){
						xjValidate.showPopup('请选择要设置函数的表达式！',"提示");
						return;
					}
					if(span1_num.length>0&&span2_num.length==0){
						$("#"+id_span1).text("Math.round("+$("#"+id_span1).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						//$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
						return;
					}
					if(span1_num<span2_num){
						$("#"+id_span1).text("Math.round("+$("#"+id_span1).text());
						$("#"+id_span2).text($("#"+id_span2).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
					}else{
						$("#"+id_span2).text("Math.round("+$("#"+id_span2).text());
						$("#"+id_span1).text($("#"+id_span1).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
					}
					
					id_span1 = '';
					id_span2 = '';
					return;
				}
				
				if(texter == '保留2位小数'){
					if(id_span_num.length>0){
						$("#"+id_span_num).css("background","#F0F0F0");
						count_3 = 0;
						id_span_num = '';
					}
					
					if(span1_num.length==0){
						xjValidate.showPopup('请选择要设置函数的表达式！',"提示");
						return;
					}
					if(span1_num.length>0&&span2_num.length==0){
						$("#"+id_span1).text("Math.round("+$("#"+id_span1).text()+"* 100)/100");
						$("#"+id_span1).css("background","#F0F0F0");
						//$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
						return;
					}
					if(span1_num<span2_num){
						$("#"+id_span1).text("Math.round("+$("#"+id_span1).text());
						$("#"+id_span2).text($("#"+id_span2).text()+"* 100)/100");
						$("#"+id_span1).css("background","#F0F0F0");
						$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
					}else{
						$("#"+id_span2).text("Math.round("+$("#"+id_span2).text());
						$("#"+id_span1).text($("#"+id_span1).text()+"* 100)/100");
						$("#"+id_span1).css("background","#F0F0F0");
						$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
					}
					
					id_span1 = '';
					id_span2 = '';
					return;
				}
				
				/*if(texter == '保留整数'){
					if(id_span_num.length>0){
						$("#"+id_span_num).css("background","#F0F0F0");
						count_3 = 0;
						id_span_num = '';
					}
					if(span1_num.length==0){
						xjValidate.showPopup('请选择要设置函数的表达式！',"提示");
						return;
					}
					if(span1_num.length>0&&span2_num.length==0){
						$("#"+id_span1).text("parseInt("+$("#"+id_span1).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						//$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
						return;
					}
					if(span1_num<span2_num){
						$("#"+id_span1).text("parseInt("+$("#"+id_span1).text());
						$("#"+id_span2).text($("#"+id_span2).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
						
					}else{
						$("#"+id_span2).text("parseInt("+$("#"+id_span2).text());
						$("#"+id_span1).text($("#"+id_span1).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
					}
					
					
					id_span1 = '';
					id_span2 = '';
					return;
				}*/
				if(texter == '向上取整'){
					if(id_span_num.length>0){
						$("#"+id_span_num).css("background","#F0F0F0");
						count_3 = 0;
						id_span_num = '';
					}
					if(span1_num.length==0){
						xjValidate.showPopup('请选择要设置函数的表达式！',"提示");
						return;
					}
					if(span1_num.length>0&&span2_num.length==0){
						$("#"+id_span1).text("Math.ceil("+$("#"+id_span1).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						//$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
						return;
					}
					if(span1_num<span2_num){
						$("#"+id_span1).text("Math.ceil("+$("#"+id_span1).text());
						$("#"+id_span2).text($("#"+id_span2).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
					}else{
						$("#"+id_span2).text("Math.ceil("+$("#"+id_span2).text());
						$("#"+id_span1).text($("#"+id_span1).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
					}
					
					id_span1 = '';
					id_span2 = '';
					return;
				}
				if(texter == '向下取整'){
					if(id_span_num.length>0){
						$("#"+id_span_num).css("background","#F0F0F0");
						count_3 = 0;
						id_span_num = '';
					}
					if(span1_num.length==0){
						xjValidate.showPopup('请选择要设置函数的表达式！',"提示");
						return;
					}
					if(span1_num.length>0&&span2_num.length==0){
						$("#"+id_span1).text("Math.floor("+$("#"+id_span1).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						//$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
						return;
					}
					if(span1_num<span2_num){
						$("#"+id_span1).text("Math.floor("+$("#"+id_span1).text());
						$("#"+id_span2).text($("#"+id_span2).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
					}else{
						$("#"+id_span2).text("Math.floor("+$("#"+id_span2).text());
						$("#"+id_span1).text($("#"+id_span1).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
					}
					
					
					id_span1 = '';
					id_span2 = '';
					return;
				}
				
				if(texter == '绝对值'){
					if(id_span_num.length>0){
						$("#"+id_span_num).css("background","#F0F0F0");
						count_3 = 0;
						id_span_num = '';
					}
					if(span1_num.length==0){
						xjValidate.showPopup('请选择要设置函数的表达式！',"提示");
						return;
					}
					if(span1_num.length>0&&span2_num.length==0){
						$("#"+id_span1).text("Math.abs("+$("#"+id_span1).text()+")");
						$("#"+id_span1).css("background","#F0F0F0");
						//$("#"+id_span2).css("background","#F0F0F0");
						id_span1 = '';
						id_span2 = '';
						return;
					}
					if(span1_num<span2_num){
						$("#"+id_span1).text("Math.abs("+$("#"+id_span1).text());
						$("#"+id_span2).text($("#"+id_span2).text()+")");
					}else{
						$("#"+id_span2).text("Math.abs("+$("#"+id_span2).text());
						$("#"+id_span1).text($("#"+id_span1).text()+")");
					}
					
					$("#"+id_span1).css("background","#F0F0F0");
					$("#"+id_span2).css("background","#F0F0F0");
					id_span1 = '';
					id_span2 = '';
					return;
				}
				
				if(!isNaN(texter)||texter=='.'){//如果是数字
					if(id_span_num.length>0){
						if(!isNaN(texter)&&count_3==0){
							$("#"+id_span_num).text(texter);
							count_3++;
							return;
						}
						if(!isNaN(texter)&&count_3>0){
							$("#"+id_span_num).text($("#"+id_span_num).text()+texter);
							return;
						}
						if(texter=='.'&&count_3>0){
							$("#"+id_span_num).text($("#"+id_span_num).text()+texter);
							return;
						}
					}else{
						id_span_num = '';
						if(!isNaN(texter)&&count_3==0){
							num++;
							htmlt_3 = "<span name='tab' id='radius_isnum"+num+"' class='span_b' style='cursor:pointer' onclick='check_span(this);'>"+texter+"</span>";
							$(".header-samll-box-down").append(htmlt_3); 
							count_3++;
							return;
						}
						if(!isNaN(texter)&&count_3>0){
							$("#radius_isnum"+num).text($("#radius_isnum"+num).text()+texter);
							return;
						}
						if(texter=='.'&&count_3>0){
							$("#radius_isnum"+num).text($("#radius_isnum"+num).text()+texter);
							return;
						}
					}
				}else{
					if(id_span_num.length>0){
						$("#"+id_span_num).css("background","#F0F0F0");
						count_3 = 0;
						id_span_num = '';
					}
					htmlt_3 = '<span name="tab" id="radius" class="span_b">'+texter+'</span>';
					$(".header-samll-box-down").append(htmlt_3); 
					count_3 = 0;
					id_span_num = '';
				}
			}
		})
		$('#operation').click(function(){
			if(id_span_num.length>0){
				$("#"+id_span_num).css("background","#F0F0F0");
				count_3 = 0;
				id_span_num = '';
			}
			//获取最后一个元素
			var html  = $(".header-samll-box-down").html().trim();
			if(html.substr(html.length-4,html.length)=='</p>'){
				$(".header-samll-box-down p:last").remove();
				$(".header-samll-box-down p:last").remove();
				$(".header-samll-box-down br:last").remove();
			}else{
				$(".header-samll-box-down span:last").remove();
			}
			 var html = $(".header-samll-box-down").html();
			 if(html.trim().length==0||html.substr(html.length-4,html.length)=='</p>'){
				 count = true;
			 }else{
				 count = false;
			 }
			 count_3 = 0;
			 id_span_num = '';
		});
		$("#operation-huan").click(function(){
			if(id_span_num.length>0){
				$("#"+id_span_num).css("background","#F0F0F0");
				count_3 = 0;
				id_span_num = '';
			}
			var htmls = "<br>"+huanhang;
			var tesst  = $(".header-samll-box-down").children('span').length; //获取span数量
			var html  = $(".header-samll-box-down").html();
			var result_str = html.replace(/(<\/?span.*?>)/g, '');
			 result_str = result_str.replace(/(<\/?br.*?>)/g, '');
			 result_str = result_str.replace(/(<\/?p.*?>)/g, '');
			 result_str = result_str.substr(result_str.length-2,result_str.length);
			 var html_tab = html.substr(html.length-4,html.length);
			if(tesst == "0"||html_tab=='</p>'){
				console.log("元素："+tesst);
				return;
			}else if(result_str.trim() == "="){
				xjValidate.showPopup('表达式不完整无法换行！',"提示");
			}else{
				$(".header-samll-box-down").append(htmls);
				count = true;
			}	
		});

/**
 *核算主体page页跳转
 */
function accountingPageSlect(e) {
  var value = $(e).prev().find('input').val();
  accountingPage.setCurrentPage(value);
}



/**
 * 核算主体信息
 * @param number
 */
function accountingSelect(number) {
	$("#showAccountingTbody").empty();
	$("#showAccountingTbody").html("");
	$("#accountingSelectModal").modal('show');
  var accountingName =$("#mhaccountingname").val();
  var page = number-1;
  $.ajax({
	  url:basePath+"/settlementFormula/findAllocationAccountingEntityAll",
      async:false,//是否异步
      cache:false,//是否使用缓存
      type:'POST',//请求方式：post
      dataType:'json',//数据传输格式：json
      data:{page : page,rows:10,accountingName:accountingName},
      error:function(){
          //请求失败处理函数
          xjValidate.showPopup('请求失败！',"提示");
      },
      success:function(data){
    	  var jsonAll=data;
    	  var jsonList = jsonAll;
    		$.each(jsonList,function(i, val) {
    			//判断显示条件
				var orgStatus="初始化";
				if(val.orgStatus==1){
					orgStatus="待审核";
				}else if(val.orgStatus==2){
					orgStatus="审核不通过";
				}else if(val.orgStatus==3){
					orgStatus="审核通过";
				}else if(val.orgStatus==4){
					orgStatus="已注销";
				}
				
				var isAvailable="停用";
				if(val.isAvailable==1){
					isAvailable="启用";
				}
				$("#showAccountingTbody").append("<tr class='table-body '><td>" +
    					"<label class='i-checks'><input data-id=\""+val.id+"\" data-name='核算主体' name = 'accountingCheck' id = 'accountingCheck' class='sub_allocation_accounting_entity_check' type='radio'>" +
    					"</label></td>" +
    					"<td style='display:none'>"+val.id+"</td>" +
    					"<td>"+val.id+"</td>" +
    					"<td>"+val.orgName+"</td>" +
    					"<td>"+orgStatus+"</td>" +
    					"<td>"+isAvailable+"</td>" +
    					"</tr>");
    		})
       }
  });
//查询最大记录数
	$.ajax({
		 url:basePath+"/settlementFormula/getAllocationAccountingEntityAllCount",
		 type:"post",
		 data:{page : page,rows:10,accountingName:accountingName},
		 dataType:"json",
		 async:false,
		 success:function(resp){
			 accountingPage.setTotalItems(resp);
			 $("#accountingNum").text(resp);
		 }
	});
}


/**
 * 承运人信息
 * @param number
 */
function customerSelect(number) {
	$("#showCustomerTbody").empty();
	$("#showCustomerTbody").html("");
	$("#customerSelectModal").modal('show');
	
	
  var customerName =$("#mhcustomername").val();
  var page = number-1;
  var data= "page="+page+"&rows=10&sign=2";
  $.ajax({
	  url:basePath+"/customer/findCoustomerInfoAll",
      async:false,//是否异步
      cache:false,//是否使用缓存
      type:'POST',//请求方式：post
      dataType:'json',//数据传输格式：json
      data:data,
      error:function(){
          //请求失败处理函数
          xjValidate.showPopup('请求失败！',"提示");
      },
      success:function(data){
    	  var jsonAll=data;
    	  var jsonList = jsonAll;
    		$.each(jsonList,function(i, val) {
    			//判断显示条件
    			var isCombine="否";
				if(isCombine==1){
					isCombine="是";
				}
				var coustomerRole="企业货主";
				if(val.userRole==2){
					coustomerRole="物流公司";
				}
				$("#showCustomerTbody").append("<tr class='table-body '><td>" +
    					"<label class='i-checks'><input data-id=\""+val.id+"\" data-name='承运商' name = 'customerCheck' id = 'customerCheck' class='customer_entity_check' type='radio'>" +
    					"</label></td>" +
    					"<td style='display:none'>"+val.id+"</td>" +
    					"<td style='display:none'>"+val.orgInfoId+"</td>" +
    					"<td>"+val.orgName+"</td>" +
    					"<td>"+val.contactName+"</td>" +
    					"<td>"+val.mobilePhone+"</td>" +
    					"<td>"+val.telephone+"</td>" +
    					"<td>"+coustomerRole+"</td>" +
    					"<td>"+val.createUserStr+"</td>" +
    					"<td>"+val.createTimeStr+"</td>" +
    					"</tr>");
    		})
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
			 $("#customerNum").text(resp);
			 customerPage.setTotalItems(resp);
		 }
	});
}

//保存公式
function saveFormuaInfo(type){
	var accountingId = $("#addaccountingId").val();
	var accountingName = $("#addAccountingName").val();
	var startDate = $("#startDate").val().trim();
	var endDate = $("#endDate").val().trim();
	var customerId =  $("#addcustomerId").val();
	if(accountingId.length==0){
		 xjValidate.showPopup('请设置核算主体！',"提示");
	    return;
	}
	if(startDate.length==0){
		 xjValidate.showPopup('请设置启用日期！',"提示");
	    return;
	}
	if(endDate.length==0){
		 xjValidate.showPopup('请设置结束日期！',"提示");
	    return;
	}
	if(startDate>endDate){
		 xjValidate.showPopup('启用日期不能大于结束日期！',"提示");
		 return;
	}
	var html = $(".header-samll-box-down").html().trim();
	var equationText = html.replace(/(?=[^>]*(?=<))\s+/g,"");
		html = html.replace(/\s/g,"");
	var str = html.replace(/(<\/?a.*?>)|(<\/?span.*?>)/g,"");
	var equation = str.replace(/(<\/?br.*?>)/g,"$");
	equation = equation.replace(/(<\/?p.*?>)/g,"");
	if(type=='add'){
		var equationMark = $("input[name='equationMark']:checked").val().trim();
		$.ajax({
		  	url:basePath+ "/formulaSettingController/saveFormuaInfo",//请求的action路径
		      async:false,//是否异步
		      cache:false,//是否使用缓存
		      type:'POST',//请求方式：post
		      dataType:'json',//数据传输格式：json
		      data:{equation:equation,
		    	  	accountingName:accountingName,
		    	  	accountingId:accountingId,
		    	  	startDate:startDate,
		    	  	endDate:endDate,
		    	  	equationMark:equationMark,
		    	  	equationText:equationText,
		    	  	customerId:customerId
		    	  	},
		      error:function(){
		          //请求失败处理函数
		    	  xjValidate.showPopup('请求失败！',"提示");
		      },
		      success:function(data){
		    	 //xjValidate.showPopup('保存成功',"提示");
		    	  resetfunc();
		    	 window.location.href = basePath+"/formulaSettingController/formulaListPage";
		      }
		  });
	}
	if(type=='update'){
		var formulaInfoId =  $("#formulaInfoId").val();
		var equationMark = $("#update_equationMark").val()
		$.ajax({
		  	url:basePath+ "/formulaSettingController/updateFormuaInfo",//请求的action路径
		      async:false,//是否异步
		      cache:false,//是否使用缓存
		      type:'POST',//请求方式：post
		      dataType:'json',//数据传输格式：json
		      data:{
		    	  	formulaInfoId:formulaInfoId,
		    	  	equation:equation,
		    	  	accountingName:accountingName,
		    	  	accountingId:accountingId,
		    	  	startDate:startDate,
		    	  	endDate:endDate,
		    	  	equationMark:equationMark,
		    	  	equationText:equationText,
		    	  	customerId:customerId
		    	  	},
		      error:function(){
		          //请求失败处理函数
		    	  xjValidate.showPopup('请求失败！',"提示");
		      },
		      success:function(data){
		    	 //xjValidate.showPopup('保存成功',"提示");
		    	  resetfunc();
		    	 window.location.href = basePath+"/formulaSettingController/formulaListPage";
		      }
		  });
	}
}

//保存核算主体
function saveAccountingbutton(){
	var selectlist = findAllCheck(".sub_allocation_accounting_entity_check");
    if(selectlist.length==0 || selectlist.length>1) {
        xjValidate.showPopup('请选择一条数据！',"提示");
       return;
    }
var ftr = $("#accountingCheck:checked").parents("tr");
var id = ftr.children().eq(1).html();
var accountingName = ftr.children().eq(3).html();
$("#addAccountingName").val(accountingName);
$("#addaccountingId").val(id);
$("#accountingSelectModal").modal('hide');
}

//保存承运人
function saveCustomerbutton(){
	var selectlist = findAllCheck(".customer_entity_check");
    if(selectlist.length==0 || selectlist.length>1) {
        xjValidate.showPopup('请选择一条数据！',"提示");
       return;
    }
var ftr = $("#customerCheck:checked").parents("tr");
var id = ftr.children().eq(2).html();
var customerName = ftr.children().eq(3).html();
$("#addCustomerName").val(customerName);
$("#addcustomerId").val(id);
$("#customerSelectModal").modal('hide');
}

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
function backListPage(){
	window.location.href = basePath+"/formulaSettingController/formulaListPage";
}

//重置
function resetfunc(){
	$(".header-samll-box-down").empty();
	 
	// 清空文本框
	  $(".box-right").find('input[type="text"]').each(function(){
	    $(this).val("");
	  });
	  $(".box-right").find('input[type="hidden"]').each(function(){
		$(this).val("");
	});
	  num = 20;
	  id_span1='';
	  id_span2='';
	  id_span_num='';
	  isnum = '';
	  count_3 = 0;
	  count = true;
}


function check_span(obj){
	var span_id = $(obj).prop("id").trim();
	
	if(span_id.indexOf('radius_isnum')!=-1){
		if(id_span_num == ''){
			$(obj).css("background","#66FF66");
			id_span_num = span_id;
			count_3 = 0;
		}else{
			if(id_span_num == span_id){
				$(obj).css("background","#F0F0F0");
				count_3 = 0;
				id_span_num = '';
			}else{
				$("#"+id_span_num).css("background","#F0F0F0");
				count_3 = 0;
				$(obj).css("background","#66FF66");
				id_span_num = span_id;
			}
		}
	}else{
		if(id_span1.length==0){
			id_span1 = span_id;
			$(obj).css("background","#66FF66");
		}else{
			if(id_span1==span_id){
				$(obj).css("background","#F0F0F0");
				id_span1 = '';
			}else{
				if(id_span2.length==0&&id_span1!=span_id){
					id_span2 = span_id;
					$(obj).css("background","#66FF66");
				}else{
					if(id_span2==span_id){
						$(obj).css("background","#F0F0F0");
						id_span2 = '';
					}
				}
			}
		}
	}
}
