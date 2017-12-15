/*----------------平台中标-------------------- */
//初始化page
var cargoPage = null;
var orgPage = null;
(function ($) {
  //初始化零散货物列表page页面
  cargoPage = $("#cargoPage").operationList({
    "current": 1,    //当前目标
    "maxSize": 4,  //前后最大列表
    "itemPage": 10,  //每页显示多少条
    "totalItems": 0,  //总条数
    "chagePage": function (current) {
      //调用ajax请求拿最新数据
      console.log(current);
    }
  });

  //设置零散货物页面总条数
  cargoPage.setTotalItems(20);
  $("#cargoNum").text(20);

  //全选/全不选
  $("body").on("click", ".all-cargo-check", function () {
    if ($(".all-cargo-check").is(":checked")) {
      //全选时
      $(".sub-cargo-check").each(function () {
        $(this).prop("checked", true);
      });
    } else {
      //全不选时
      $(".sub-cargo-check").each(function () {
        $(this).prop("checked", false);
      });
    }
  });

  //时间调用插件
  setTimeout(function () {
    $(".date-time").datetimepicker({
      format: "YYYY-MM-DD",
      autoclose: true,
      todayBtn: true,
      todayHighlight: true,
      showMeridian: true,
      pickTime: false
    });
  }, 500)

  //时间调用插件（精确到时分秒）
  setTimeout(function () {
    $(".date-time-ss").datetimepicker({
      format: "YYYY-MM-DD HH:mm:ss",
      autoclose: true,
      todayBtn: true,
      todayHighlight: true,
      showMeridian: true,
      useSeconds: true
    });
  }, 500)

  //允许零散货物表格拖着
  $("#tableDrag").colResizable({
    liveDrag: true,
    gripInnerHtml: "<div class='grip'></div>",
    draggingClass: "dragging"
  });

  //运单零散货物数据较多，增加滑动
  $(".iscroll").css("min-height", "55px");
  $(".iscroll").mCustomScrollbar({
    theme: "minimal-dark"
  });

  //线路插件
  $("#startAddress").lineSelect();
  $("#endAddress").lineSelect();

})(jQuery);

/**
 * 零散货物page页跳转
 * 
 * @author liumin
 * @param {this} e 
 */
function cargoPageSlect(e) {
  var value = $(e).prev().find('input').val();
  cargoPage.setCurrentPage(value);
}

/**
 * 重置搜索栏
 * 
 * @author liumin
 */
function resetEmpty() {
  //清除重置线路
  $(".select-address").empty();
}

/**
 * 报价选择
 * 
 * @author liumin
 */
function price() {
  $("#priceModal").modal('show');
   //初始报价列表page页面
  pricePage = $("#pricePage").operationList({
    "current": 1,    //当前目标
    "maxSize": 4,  //前后最大列表
    "itemPage": 10,  //每页显示多少条
    "totalItems": 0,  //总条数
    "chagePage": function (current) {
      //调用ajax请求拿最新数据
      console.log(current);
    }
  });
  //设置报价总页面
  pricePage.setTotalItems(20);
  $("#priceNum").text(20);
}
 
/**
*报价page页跳转
*/
function pricePageSlect(e) {
  var value = $(e).prev().find('input').val();
  pricePage.setCurrentPage(value);
}

/**
*报价选择
*/
function submitSelectPrice() {
  var selectlist = findAllCheck(".price-check");
  if (selectlist.length == 0 || selectlist.length > 1) {
    $.alert("请选择一条数据");
    return;
  }
  console.log(selectlist[0].id);
  $("#priceModal").modal('hide');
}
/**
 * 查找选择
 */
function findAllCheck(element) {
  var checkList = new Array();
  $(element).each(function () {
    if ($(this).is(":checked")) {
      var params = {
        "id": $(this).attr("data-id"),
        "name": $(this).attr("data-name")
      }
      checkList.push(params);
    }
  });
  return checkList;
}