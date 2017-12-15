Date.prototype.Format = function (fmt) { //author: meizz   
    var o = {  
        "M+": this.getMonth() + 1, //月份   
        "d+": this.getDate(), //日   
        "H+": this.getHours(), //小时   
        "m+": this.getMinutes(), //分   
        "s+": this.getSeconds(), //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds() //毫秒   
    };  
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));  
    for (var k in o)  
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));  
    return fmt;  
} 

// 按钮置灰
function setBtnDisabledTrue(btnId){
	$("#"+btnId+"").attr("disabled", true);
	$("#"+btnId+"").attr("class", "operation-button operation-grey");
}
// 清除按钮置灰
function setBtnDisabledFalse(btnId){
	$("#"+btnId+"").attr("disabled", false);
	$("#"+btnId+"").attr("class", "operation-button operation-blue");
}


/**
 * 验证参数是否为空
 * @param str
 * @returns {Boolean}
 */
function commonIsEmpty(str){
	if (str == null || str == undefined || str == '') { 
		return true;
	} else {
		return false;
	}
}

/**
 * 清除数据
 * @param str
 */
function resetDivInput(str){
	var inputList = $("#"+str+"").find("input");
	inputList.each(function(index,ele){
		ele.value = '';
	});
}

/**
 * 验证非0的正整数
 * @param number
 * @returns {Boolean}
 */
function checkF0zzs(number){
	var reg = new RegExp("^[0-9]*[1-9][0-9]*$");
	if(reg.test(number)){
       return true;
    }
	return false;
}
/**
 * 验证是否是  非负浮点数（正浮点数 + 0）
 */
function checkFffds(number){
	var reg = new RegExp("^\\d+(\\.\\d+)?$");
	if(reg.test(number)){
       return true;
    }
	return false;
}

/**
 * 比较两个日期的大小
 * date1
 * date2
 * 日期1大于日期2返回1，等于返回0，小于返回-1
 */
function compareDate(date1,date2){
    var oDate1 = new Date(date1);
    var oDate2 = new Date(date2);
    if(oDate1.getTime() > oDate2.getTime()){
        return 1;
    } 
    if(oDate1.getTime() == oDate2.getTime()){
        return 0;
    }
    if(oDate1.getTime() < oDate2.getTime()){
        return -1;
    }
    return 0;
}



