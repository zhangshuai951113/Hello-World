;
(function() { 
  /*var swiper = new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    calculateHeight: true,
    slidesPerView: 1,
    paginationClickable: true,
    autoplay: 3000
  });*/
	
	//刷新页面调用数字滚动方法、查询车源、货源、线路数量
	w();
	setInterval(function(){
		w();
	},60000);
	
  option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1 April', '2 April', '3 April', '4 April', '5 April']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} °C'
      }
    },
    series: [{
      name: '企业车辆',
      type: 'line',
      data: [700, 2500, 3000, 2400, 2300],
      markPoint: {
        data: [{
          type: 'max',
          name: '最大值'
        }]
      }
    }, {
      name: '个人车辆',
      type: 'line',
      data: [400, 1500, 1300, 1000, 1800],

    }]
  };
  /*var myChart = echarts.init(document.getElementById('statistical'));
  myChart.setOption(option);*/
  
  

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
	};
	 
  setInterval(function(){
	  $.ajax({
			type : "GET",
			url : "refreshHome",
			success : function(data) {
				var waybillBody = $("#releaseWaybill");
				var carBody = $("#releaseCar");
				waybillBody.empty();
				carBody.empty();
				$.each(data.waybillList,function(i,e){
					waybillBody.append($('<li><a href="javascript:;"><span>'+e.entrustName+'</span>'+
										'<span>'+e.scatteredGoods+'</span>'+
										'<span>'+e.currentTransportPrice+'</span>'+
										'<span>'+e.lineInfoName+'</span>'+
										'</a></li>'));
				});
				$.each(data.carList,function(i,e){
					carBody.append($('<li><a href="javascript:;"><span>'+e.releaseName+'</span>'+
									'<span>'+format(new Date(e.releaseTime),'yyyy-MM-dd HH:mm:ss')+'</span>'+
									'<span>'+e.releaseContent+'</span>'+
									'</a></li>'));
				});
			},
			failure : function(response) {
				alert(response);
			}
	  });
  },300000);
}())

//数字滚动效果
function w(){

	//首页车源数量 
	  $.ajax({
			url:"findCarSourceCount",
			type:"GET",
			success:function(resp){
				if(resp){
					if(resp.success){
						$("#carSourceCount").html(resp.msg);
				}else{
						console.log(resp.msg);
					}
				}else{
					console.log("系统异常!");
				}
			}
		});
	//首页货源数量
	  $.ajax({
			url:"findWaybillCount",
			type:"GET",
			success:function(resp){
				if(resp){
					if(resp.success){
						$("#waybillCount").text(resp.msg);
					}else{
						console.log(resp.msg);
					}
				}else{
					console.log("系统异常!");
				}
			}
		});
	//首页线路数量
	  $.ajax({
			url:"findLineCount",
			type:"GET",
			success:function(resp){
				if(resp){
					if(resp.success){
						$("#lineCount").text(resp.msg);
					}else{
						console.log(resp.msg);
					}
				}else{
					console.log("系统异常!");
				}
			}
		});
	 /**
	  * 延时调用countUp.js插件，实现数字滚动效果
	  * */
	setTimeout(function(){

		var options = {
				useEasing:true,
				useGrouping:true, 
				separator : ',', //显示逗号分隔符  如:3,111
				prefix : '', //前缀
				suffix : '' //后缀
				};
                    /**
                     * target = 目标元素的 ID
                     * startVal = 开始值
                     * endVal = 结束值
                     * decimals = 小数位数，默认值是0
                     * duration = 动画延迟秒数，默认值是2
                     * */
					var demo = new CountUp("findCarSourceCount", 0, $("#carSourceCount").html(), 0, 2.5, options);
					var demo2 = new CountUp("findWaybillCount", 0,$("#waybillCount").html(), 0, 2.5, options);
					var demo3 = new CountUp("findLineCount", 0, $("#lineCount").html(), 0, 2.5, options);
					//鼠标从开始滚动监听屏幕滚动事件
					$(window).scroll(function(){
						//判断当前屏幕距离浏览器顶部的距离
						if($(window).scrollTop()>=1800){
							demo.start();//调用dome方法
							demo2.start();//调用dome2方法
							demo3.start();//调用demo3方法
						}
					});
					//刷新页面时判断当前位置距离浏览器顶部的距离
					if($(window).scrollTop()>=1800){
						demo.start();//调用dome方法
						demo2.start();//调用dome2方法
						demo3.start();//调用demo3方法
					}
	},500);
}


