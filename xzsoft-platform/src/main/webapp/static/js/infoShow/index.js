/**
 * @author zhangxuanbin
 * @time 20170727
 * @desc 首页交互
 **/
var index = function(){
	$(document).ready(function(){
		index.init();	
	});
	return {

		init: function(){
			var _this = this;

			_this.initMove();
			_this.initSlider({
				target: '.banner',
                effect: 'fadeIn',
                time: 4000
			});
		},

		initMove: function(){
			var platformHeight = $('#platform').offset().top,
				winTop = $(window).height();
			$(window).scroll(function(){
				var docTop = $(document).scrollTop();
				if(docTop + winTop > platformHeight){
					$('.platform-content').addClass('move');
				}
			});
		},

		//banner轮播
        initSlider: function(params){
            var _this = this,
                obj = params && params.target;//外层容器
        	$(obj).find('.slider ul li').each(function(index,item){
                var _src = $(item).attr('data-img');
                $(item).css({
                    'background': 'url('+_src+') center center no-repeat'
                });
                if(index==0){
                    $(item).addClass('current');
                }
            });
            $(obj).find('.slider ol').remove();
            //生成轮播点
            var len = $(obj).find('.slider ul li').length;
            var olStr = '<ol>';
            for(var i=0; i<len; i++){
                if(i==0){
                    olStr += '<li class="current"></li>';
                }else{
                    olStr += '<li></li>';
                }
            }
            olStr += '</ol>';
            $(obj).find('.slider').append(olStr);

            //初始化滚动
            _this.initScroll(params);            
        },
        //轮播动画
        initScroll: function(params){
            var _this = this,
                obj = params && params.target,
                effect = params && params.effect,
                time = params && params.time,
                len = $(obj).find('.slider ul li').length,
                _ulLi = $(obj).find('.slider ul li'),
                _olLi = $(obj).find('.slider ol li'),
                liWidth = $(obj).find('.slider').width(),
                liLen = $(obj).find('.slider ul li').length;

            _this.manageInterval({
                target: obj,
                effect: effect,
                time: time,
                len: len,
                _ulLi: _ulLi,
                _olLi: _olLi,
                liWidth: liWidth,
                liLen: liLen
            });
            //绑定
            _olLi.on('click', function(e){
                var _index = $(this).index(),
                    _len = _ulLi.length;
                $(this).addClass('current').siblings().removeClass('current');
                if(effect=='fadeIn'){
                    _ulLi.eq(_index).addClass('current').siblings().removeClass('current');
                }
            });
        },
        manageInterval: function(params){
            var _this = this,
                obj = params && params.target,
                effect = params && params.effect,
                time = params && params.time,
                len = params && params.len,
                _ulLi = params && params._ulLi,
                _olLi = params && params._olLi,
                liWidth = params && params.liWidth,
                liLen = params && params.liLen;

            var dataTimer = $(obj).find('.slider ul').attr('data-timer');
            clearInterval(dataTimer);

            $(obj).find('.slider ul li').show();
            if(effect=='fadeIn'){
                $(obj).find('.slider ul').attr({
                    'class': '',
                    'style': ''
                }).addClass('fade');
                obj.timer = setInterval(function(){
                    var _index = $(obj).find('.slider ul li.current').index();
                    if(_index==len-1){
                        _ulLi.eq(0).addClass('current').siblings().removeClass('current');
                        _olLi.eq(0).addClass('current').siblings().removeClass('current');
                    }else{
                        _ulLi.eq(_index+1).addClass('current').siblings().removeClass('current');
                        _olLi.eq(_index+1).addClass('current').siblings().removeClass('current');
                    }
                },time);
            }

            var objTimer = obj && obj.timer;
            $(obj).find('.slider ul').attr('data-timer',objTimer);
        }
	}
}();