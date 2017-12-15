/*----------------发布零散货物--------------------- */
//初始化page
var cargoPage = null;
var orgPage = null;
var carSourcePage = null;
var partnerPage = null;
var driverPage = null;
var releaseType = 1;
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
  $("#startAddAddress").lineSelect();
  $("#endAddAddress").lineSelect();
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
 * 派发零散货物弹出框
 * 
 * @author liumin
 */
function addBulkCargo() {
  $("#addBulkCargoModal").modal('show');
}

/**
 * 承运方选择
 * 
 * @author liumin
 */
function carrierSelect() {
  if(releaseType==2) {
    //查找车源信息
    carSourceSelect();
  } else if(releaseType==3) {
    partnerSelect();
    //查找合作伙伴
  } else if(releaseType==4) {
    //查找内部司机
    driverSelect();
  }
}

/**
 * @param {*} type 发布类型
 */
function releaseSelect(type) {
  releaseType = type;
  //如果是发布平台，则隐藏承运方
  if (releaseType == "1") {
    $("#carrier").find('input').val("");
    $("#carrier").hide();
  } else {
    $("#carrier").show();
  }
}

/**
 * 委托方选择
 * 
 * @author liumin
 */
function orgSelect() {
  $("#orgSelectModal").modal('show');
  //初始委托方列表page页面
  orgPage = $("#orgPage").operationList({
    "current": 1,    //当前目标
    "maxSize": 4,  //前后最大列表
    "itemPage": 10,  //每页显示多少条
    "totalItems": 0,  //总条数
    "chagePage": function (current) {
      //调用ajax请求拿最新数据
      console.log(current);
    }
  });
  //设置委托方总页面
  orgPage.setTotalItems(20);
  $("#orgNum").text(20);
}


/**
 * 委托方跳转页面
 * @param {*this} e
 * @author liumin 
 */ 
function orgPageSlect(e) {
  var value = $(e).prev().find('input').val();
  orgPage.setCurrentPage(value);
}

/**
 * 选择委托方
 * 
 * @author liumin
 * @returns 
 */
function submitSelectOrg() {
  var selectlist = findAllCheck(".org-check");
  if (selectlist.length == 0 || selectlist.length > 1) {
    $.alert("请选择一条数据");
    return;
  }
  $("#selectOrg").text(selectlist[0].name);
  $("#selectOrg").next("input").val(selectlist[0].id);
  $("#orgSelectModal").modal('hide');
}

/**
 * 查找车源信息
 * 
 * @author liumin
 */
function carSourceSelect() {
  $("#carSourceModal").modal('show');
  //初始查找车源信息列表page页面
  carSourcePage = $("#carSourcePage").operationList({
    "current": 1,    //当前目标
    "maxSize": 4,  //前后最大列表
    "itemPage": 10,  //每页显示多少条
    "totalItems": 0,  //总条数
    "chagePage": function (current) {
      //调用ajax请求拿最新数据
      console.log(current);
    }
  });
  //设置查找车源信息总页面
  carSourcePage.setTotalItems(20);
  $("#carSourceNum").text(20);
}

/**
*查找车源信息page页跳转
*/
function carSourcePageSlect(e) {
  var value = $(e).prev().find('input').val();
  carSourcePage.setCurrentPage(value);
}

/**
*查找车源信息选择
*/
function submitSelectCarSource() {
  var selectlist = findAllCheck(".carSource-check");
  if (selectlist.length == 0 || selectlist.length > 1) {
    $.alert("请选择一条数据");
    return;
  }
  $("#selectCarrier").text(selectlist[0].name);
  $("#selectCarrier").next("input").val(selectlist[0].id);
  $("#carSourceModal").modal('hide');
}

/**
* 查找合作伙伴弹出框
*/
function partnerSelect() {
  $("#partnerModal").modal('show');
  //初始合作伙伴列表page页面
  partnerPage = $("#partnerPage").operationList({
    "current": 1,    //当前目标
    "maxSize": 4,  //前后最大列表
    "itemPage": 10,  //每页显示多少条
    "totalItems": 0,  //总条数
    "chagePage": function (current) {
      //调用ajax请求拿最新数据
      console.log(current);
    }
  });
  //设置合作伙伴总页面
  partnerPage.setTotalItems(20);
  $("#partnerNum").text(20);
}

/**
*合作伙伴page页跳转
*/
function partnerPageSlect(e) {
  var value = $(e).prev().find('input').val();
  partnerPage.setCurrentPage(value);
}

/**
*查合作伙伴选择
*/
function submitSelectPartner() {
  var selectlist = findAllCheck(".partner-check");
  if (selectlist.length == 0 || selectlist.length > 1) {
    $.alert("请选择一条数据");
    return;
  }
  $("#selectCarrier").text(selectlist[0].name);
  $("#selectCarrier").next("input").val(selectlist[0].id);
  $("#partnerModal").modal('hide');
}

/**
* 查找内部司机弹出框
*/
function driverSelect() {
  $("#driverModal").modal('show');
  //初始内部司机列表page页面
  driverPage = $("#driverPage").operationList({
    "current": 1,    //当前目标
    "maxSize": 4,  //前后最大列表
    "itemPage": 10,  //每页显示多少条
    "totalItems": 0,  //总条数
    "chagePage": function (current) {
      //调用ajax请求拿最新数据
      console.log(current);
    }
  });
  //设置内部司机总页面
  driverPage.setTotalItems(20);
  $("#driverNum").text(20);
}

/**
*内部司机page页跳转
*/
function driverPageSlect(e) {
  var value = $(e).prev().find('input').val();
  driverPage.setCurrentPage(value);
}

/**
*内部司机选择
*/
function submitSelectDriver() {
  var selectlist = findAllCheck(".driver-check");
  if (selectlist.length == 0 || selectlist.length > 1) {
    $.alert("请选择一条数据");
    return;
  }
  $("#selectCarrier").text(selectlist[0].name);
  $("#selectCarrier").next("input").val(selectlist[0].id);
  $("#driverModal").modal('hide');
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