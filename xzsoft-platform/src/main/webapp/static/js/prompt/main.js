function alertTost(msg) {
	$.alert({
		title : '提示',
		content : msg
	});
}

function confirmation() {
	$.confirm({
		title : '请选择',
		content : '请选择审批状态',
		buttons : {
			'同意' : function() {
				$.alert('同意');
			},
			'取消' : function() {
				$.alert('取消');
			},
			somethingElse : {
				text : '驳回',
				btnClass : 'btn-blue',
				keys : [ 'enter', 'shift' ],
				action : function() {
					$.alert('驳回');
				}
			}
		}
	});
}

function Prompt (){
	  $.confirm({
	    title: '提示!',
	    content: '' +
	    '<form action="" class="formName">' +
	    '<div class="form-group">' +
	    '<label>请输入您的名字</label>' +
	    '<input type="text" placeholder="请输入您的名字" class="name form-control" required />' +
	    '</div>' +
	    '</form>',
	    buttons: {
	        formSubmit: {
	            text: '确认',
	            btnClass: 'btn-blue',
	            action: function () {
	                var name = this.$content.find('.name').val();
	                if(!name){
	                    $.alert('提供一个有效名称');
	                    return false;
	                }
	                $.alert('您的名字' + name);
	            }
	        },
	        '关闭': function () {
	            //close
	        },
	    },
	    onContentReady: function () {
	        // bind to events
	        var jc = this;
	        this.$content.find('form').on('submit', function (e) {
	            // if the user submits the form by pressing enter in the field.
	            e.preventDefault();
	            jc.$$formSubmit.trigger('click'); // reference the button and click it
	        });
	    }
	});
	}