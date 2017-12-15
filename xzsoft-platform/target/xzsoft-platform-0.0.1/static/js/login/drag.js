/* 
 * drag 1.0
 * create by tony@jentian.com
 * date 2015-08-18
 * 拖动滑块
 */
(function($){
    $.fn.drag = function(options){
        var x, drag = this, isMove = false, defaults = {
        };
        var options = $.extend(defaults, options);
        //添加背景，文字，滑块
        var html = '<div class="drag_bg"></div>'+
                    '<div class="drag_text" onselectstart="return false;" unselectable="on">拖动滑块验证</div>'+
                    '<div class="handler handler_bg"></div>';
        this.append(html);
        
        var handler = drag.find('.handler');
        var drag_bg = drag.find('.drag_bg');
        var text = drag.find('.drag_text');
        var maxWidth = drag.width() - handler.width();  //能滑动的最大间距
        
        //鼠标按下时候的x轴的位置
        handler.mousedown(function(e){
            isMove = true;
            x = e.pageX - parseInt(handler.css('left'), 10);
        });
        
        //鼠标指针在上下文移动时，移动距离大于0小于最大间距，滑块x轴位置等于鼠标移动距离
        $(document).mousemove(function(e){
            var _x = e.pageX - x;
            if(isMove){
                if(_x > 0 && _x <= maxWidth){
                    handler.css({'left': _x});
                    drag_bg.css({'width': _x});
                }else if(_x > maxWidth){  //鼠标指针移动距离达到最大时清空事件
                    dragOk();
                }
            }
        }).mouseup(function(e){
            isMove = false;
            var _x = e.pageX - x;
            if(_x < maxWidth){ //鼠标松开时，如果没有达到最大距离位置，滑块就返回初始位置
                handler.css({'left': 0});
                drag_bg.css({'width': 0});
            }
        });
        
        //清空事件
        function dragOk(){
            handler.removeClass('handler_bg').addClass('handler_ok_bg');
            text.text('验证通过');
            drag.css({'color': '#fff'});
            handler.unbind('mousedown');
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');

			//提交
			var username = $("#username").val();
                		var password = $("#password").val();
                		
                		/*if(username==undefined || $.trim(username)=="") {
                			$.alert("用户名不能为空");
                			return false;
                		}
                		
                		if(password==undefined || $.trim(password)=="") {
                			$.alert("密码不能为空");
                			return false;
                		}*/
                		
                		var data ={'username':username,'password':password};
                		var form = $('#login_id');
                		form.ajaxSubmit(function(){
                			$.ajax({
                				type:"get",
                				url : "checkLogin",
                				data:data,
                				dataType:"json",
                				async : true,
                				success : function(responseText) {
                					var json = eval(responseText); 
                					if(json.success){
                						$(".drag_text").text("验证通过");
                						window.location.href="/xzsoft-platform/index";
                					}else{
//                						
                						var truthBeTold = window.confirm(json.msg); 
                						if (truthBeTold) { 
//                						window.alert("欢迎访问我们的 Web 页！"); 
                							location.reload();
                						} else{
                							location.reload(); 
                						}
//                						$.alert(json.msg);
                						
                			            
//                						$("#handler_bg").removeClass("handler_ok_bg");
//                						
//                							var e = e||window.event;
//                							that.slider.classList.remove('unselect');
//                							that.bg.classList.add('ani');
//                	                        handler.classList.add('ani');
//                	                        that.bg.style.width = 0;
//                	                        handler.style.left = 0;
//                	                        setTimeout(function(){
//                	                         that.bg.classList.remove('ani');
//                	                         handler.classList.remove('ani');
//                	                        },300);
//                	                        
//                	                        dog.on(handler,'mousedown',drag.down);
                	                        
                					}
                				}
                			});
                		}); 

        }
    };
})(jQuery);


