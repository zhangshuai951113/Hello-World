var common = function(){
	return {
		/**
		 * 去除空格
		 * str 匹配字符串；isGlobal 是否去除所有空格
		 */
		trim: function(str, isGlobal) {
		    isGlobal = isGlobal || 'l';
		    if (!str) {
		        return;
		    }
		    var result = str.replace(/(^\s+)|(\s+$)/g, '');
		    if (isGlobal.toLowerCase() == 'g') {
		        result = result.replace(/\s/g, '');
		    }
		    return result;
		},
		/**
		 * 数组去重
		 * array为数组
		 */
		uniqueArray: function(array){
			var arr = [],obj = {};

			for(var i=0; i<array.length; i++){
				if(!obj[array[i]]){
					arr.push(array[i]);
					obj[array[i]] = true;
				}
			}
			return arr;
		}
	};
}();

/**
 * @method validate校验
 * @author zhang xuanbin
 * @time   2017-07-22
 * @desc   该工具类基于jQuery进行封装，
 */
var xjValidate = function(){
	$(document).ready(function(){
		xjValidate.init();
	});

	function getWinHeight(){
		var maxHeight = Math.max($(document).height(),$(window).height());

		return maxHeight;
	}

	function getPopupTmpl(content, title){
		var tmpl = '<div class="popup-wrapper"><div class="common-popup">' + 
        			'<p class="popup-title">'+title+'</p>' +
        			'<div class="popup-content">' +
        			'<p>'+content+'</p></div>' +
        			'<div class="popup-btns">' +
        			'<span class="ok">确定</span> ' +
        			'<span class="cancel">取消</span></div></div>' +
        			'<div class="mask-popup"></div></div>';

        return tmpl;
	}

	return {
		/**
		 * @method 初始化控件入口方法
		 */
		init: function(){
			var _this = this;

			_this.initEvent();
			_this.initValidate();
		},

		/**
		 * 初始化绑定事件
		 **/
		initEvent: function(){
			$(document).delegate('.popup-btns span.ok', 'click', function(e){
				e.stopPropagation();
				$(this).closest('.popup-wrapper').remove();
				$('body').css('overflow', 'auto');
			});
		},


		/**
		 * 表单校验
		 **/
		initValidate: function(){
			var _this = this;
	        $(document).delegate('.form-item input', 'keyup blur', function(e){
	        	var classList = $(this).attr('class'),
	        		_val = common.trim($(this).val(),'l'),
	        		_parent = $(this).parent();

	        	
	        	_this.checkValidate(classList,_val,_parent);
	        });
	        $(document).delegate('.form-item textarea', 'keyup blur', function(e){
	        	var classList = $(this).attr('class'),
	        		_val = common.trim($(this).val(),'l'),
	        		_parent = $(this).parent();

	        	
	        	_this.checkValidate(classList,_val,_parent);
	        });
	        
		},

		/**
		 * 点击按钮进行表单校验
		 **/
		checkForm: function(target){
			var _this = this,
				target = target || '.form-item',
				flagArr = [];
			$(target).each(function(index, item){
        		var _input = null,
        			_val = '',
        			classList = null;

        		if($(this).find('input').length>0){
        			_input = $(this).find('input');
        		}else if($(this).find('textarea').length>0){
        			_input = $(this).find('textarea');
        		}

        		if(_input){
					_val = common.trim(_input.val(),'l');
	        		classList = _input.attr('class');

	        		var flag = _this.checkValidate(classList,_val,this);

	        		flagArr.push(flag);
        		}
        	});

        	if(~flagArr.join('').indexOf('false')){
        		return false;
        	}
        	return true;
		},

		//表单校验逻辑
		checkValidate: function(classList,_val,obj){
			_val = _val || '';
			if(classList){
				$(obj).find('.form-validate__tip').remove();
				var str = '<p class="form-validate__tip"></p>';
				$(obj).append(str);

				//必填
				if(~classList.indexOf('xz-required')){
	    			if(!_val) {
	    				$(obj).find('.form-validate__tip').text('*必填').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		//中文
	    		if(~classList.indexOf('xz-zh')){
	    			if(_val && !/^[\u2E80-\u9FFF]+$/.test(_val)){
	    				$(obj).find('.form-validate__tip').text('*请输入中文').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		//英文
	    		if(~classList.indexOf('xz-en')){
	    			if(_val && !/^[a-zA-Z]*$/.test(_val)){
	    				$(obj).find('.form-validate__tip').text('*请输入英文').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		//手机号
	    		if(~classList.indexOf('xz-mobile')){
	    			if(_val && !/^1[0-9]{10}$/.test(_val)){
	    				$(obj).find('.form-validate__tip').text('*请输入正确的手机号').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		//电话号码
	    		if(~classList.indexOf('xz-tel')){
	    			if(_val && !/^0\d{2,3}-?\d{7,8}$/.test(_val)){
	    				$(obj).find('.form-validate__tip').text('*请输入正确的电话号码').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		//数字 _ 字母
	    		if(~classList.indexOf('xz-letter_number')){
	    			if(_val && !/^[0-9a-zA-Z\_]+$/.test(_val)){
	    				$(obj).find('.form-validate__tip').text('*只能输入数字字母和下划线').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}
	    		
	    		//数字 _ 字母 - /
	    		if(~classList.indexOf('ts-letter_number')){
	    			if(_val && !/^[0-9a-zA-Z\_\/\-]+$/.test(_val)){
	    				$(obj).find('.form-validate__tip').text('*只能输入数字字母横杠斜杠和下划线').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		//必须为数字字符
	    		if(~classList.indexOf('xz-number')){
	    			if(_val && !/^[0-9]*$/.test(_val)){
	    				$(obj).find('.form-validate__tip').text('*必须为数字字符').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		//验证是数字
	    		if(~classList.indexOf('xz-digital')){
	    			if(_val && !/^0$|^-?[1-9][0-9]*$|^-?[1-9][0-9]*\.[0-9]+$|^-?0\.{1}[0-9]+$/.test(_val)){
	    				$(obj).find('.form-validate__tip').text('*必须为数字').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		//验证邮箱
	    		if(~classList.indexOf('xz-email')){
	    			if(_val && !/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+\.([a-zA-Z0-9_-]+)/.test(_val)){
	    				$(obj).find('.form-validate__tip').text('*邮箱输入错误').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		//验证身份证
	    		if(~classList.indexOf('xz-ID')){
	    			if(_val && !/^([1-9][0-9]{5})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/.test(_val)){
	    				$(obj).find('.form-validate__tip').text('*身份证号输入错误').show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		//最大最小值
	    		if(~classList.indexOf('xz-max_') && ~classList.indexOf('min_')){
	    			var classArr = classList.split(' '),
	    				maxClass,
	    				max,
	    				minClass,
	    				min;
	    			for(var i=0; i<classArr.length;  i++){
	    				if(~classArr[i].indexOf('xz-max_')){
	    					maxClass = classArr[i];
	    				}
	    				if(~classArr[i].indexOf('xz-min_')){
	    					minClass = classArr[i];
	    				}
	    			}

	    			max = maxClass.split('_')[1];
	    			min = minClass.split('_')[1];

	    			if((_val && _val.length > Number(max)) || (_val && _val.length < Number(min))){
	    				$(obj).find('.form-validate__tip').text('*长度不小于'+ min + '并且长度不大于'+max).show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}else if(~classList.indexOf('xz-max_')){
	    			var classArr = classList.split(' '),
	    				maxClass,
	    				max;
	    			for(var i=0; i<classArr.length;  i++){
	    				if(~classArr[i].indexOf('xz-max_')){
	    					maxClass = classArr[i];
	    					break;
	    				}
	    			}

	    			max = maxClass.split('_')[1];

	    			if(_val && _val.length > Number(max)){
	    				$(obj).find('.form-validate__tip').text('*并且长度不大于'+max).show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}else if(~classList.indexOf('xz-min_')){
	    			var classArr = classList.split(' '),
	    				minClass,
	    				min;
	    			for(var i=0; i<classArr.length; i++){
	    				if(~classArr[i].indexOf('xz-min_')){
	    					minClass = classArr[i];
	    					break;
	    				}
	    			}

	    			min = minClass.split('_')[1];

	    			if(_val && _val.length < Number(min)){
	    				$(obj).find('.form-validate__tip').text('*长度不小于'+min).show();
	    				return false;
	    			}else{
	    				$(obj).find('.form-validate__tip').text('').hide();
	    			}
	    		}

	    		

	    		return true;
			}
		},

		/**
		 * 弹框消息提示
		 * 
		 **/
		showPopup: function(content, title, isCover, cancel){
			var title = title || '提示',
				isCover = isCover || false,
				cancel = cancel || false;

			var tmpl = getPopupTmpl(content, title);

			$('body').append(tmpl);
			$('.common-popup').show();

			//是否增加遮罩
			if(isCover){
				var len = $('.popup-wrapper').length;
				$('body').css('overflow', 'hidden');
				$('.popup-wrapper').eq(len-1).find('.mask-popup').height(getWinHeight()).show();
			}

			//是否显示取消按钮
			if(cancel){
				$('.popup-btns span').eq(1).css('display', 'inline-block');
			}
		},

		/**
		 * 消息提示
		 **/
		showTip: function(content,showPosition,target){
			var target = target || '.form-info__tips',
				showPosition = showPosition || 'body'
				box = null,
				timer = null;

			if($(target).length==0){
				$(showPosition).append('<div class="form-info__tips"><span></span></div>');
			}
			box = $(target);

			if(box.css('display') == 'none') {
				box.find('span').text(content);
				box.show();
				timer = setTimeout(function(){
					box.hide();
					box.find('span').text('');
					clearTimeout(timer);
				}, 1500);
			}
		}

	};
}();