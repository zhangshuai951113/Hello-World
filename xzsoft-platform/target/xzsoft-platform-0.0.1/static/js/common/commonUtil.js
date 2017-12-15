var commonUtil = function(){
	
	return {
		/**
		 * 弹出提示框
		 * @param myTitle 标题(为空时默认为“提示”)
		 * @param myContent 提示内容
		 */
		showPopup:function(myTitle,myContent){
			//标题为空时默认为“提示”
			if(myTitle==undefined || myTitle==""){
				myTitle = "提示";
			}
			
			$.alert({
		        title: myTitle,
		        content: myContent
		    });
		}
	
	}
}();