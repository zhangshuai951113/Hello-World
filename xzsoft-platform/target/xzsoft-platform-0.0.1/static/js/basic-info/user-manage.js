$(function(){
  $(".tab-box .tab-text").bind("click",function() {
    var target  = $(this).data("target");
    $(".tab-box .tab-text").removeClass("active");
    $(this).addClass("active");
    console.log(target);
    $(".tab-content").hide();
    $(target).show();
  })

  $(".date-time").datetimepicker({
    format: "YYYY-MM-DD",
    autoclose: true,
    todayBtn: true,
    todayHighlight: true,
    showMeridian: true,
    pickerPosition: "bottom-left",
    startView: 2,//月视图
    minView: 2//日期时间选择器所能够提供的最精确的时间选择视图
  }); 
  
  $("input[name='all-check']").on("change", function () {
      selectCheck();
  });
});


var selectId = ''; //初始化选择id

/**
 * 保存用户数据关闭弹出框
 */
function saveUser() {
  $("#addUserModal").modal('hide');
}

/**
 * 全选调用
 */
function selectCheck() {
  var isSelect = $("input[name='all-check']:checkbox:checked");
  if(isSelect.length>0){
     $("input[name='check-box']").each(function(){
       $(this).prop("checked",true); 
     }); 
  } else {
    $("input[name='check-box']").each(function(){
      $(this).prop("checked",false); 
     });
  }
}

/**
 * 密码重置调用
 */
function showPasswordReset(index) {
if(!index) {
  var checkList = $("input[name='check-box']:checkbox:checked");
  //判断是否选择一条
  if(checkList.length==0 || checkList.length>1) {
    $.alert("请选择一条数据");
    return;
  }
  selectId = checkList[0].value;
} else {
  selectId = index;
}
 
  $("#passwordReset").modal('show');
}

/**
 * 保存密码关闭弹出框
 */
function savePassword() {
  $("#passwordReset").modal('hide');
}

/**
 * 修改用户信息
 */
function modifyUser() {

}

var pagination = $(".pagination-list").operationList({
  "current":1,    //当前目标
  "maxSize":4,  //前后最大列表
  "itemPage":10,  //每页显示多少条
  "totalItems":190,  //总条数
  "chagePage":function(current){
    //调用ajax请求拿最新数据
      console.log(current); 
  }
});

function jumpPage(e) {
  var value = $(e).prev().find('input').val();
  pagination.setCurrentPage(value);
}
