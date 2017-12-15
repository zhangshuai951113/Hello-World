package com.xz.logistics.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.LocationInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillInfoPo;

/**
 * 运单管理（司机）
 * @author zhangya 2017年6月29日 上午11:49:28
 */
@Controller
@RequestMapping("/driverWaybillInfo")
public class WaybillForDriverController extends BaseController {

	@Resource
	private WaybillInfoFacade waybillInfoFacade;

	@Resource
	private UserInfoFacade userInfoFacade;

	@Resource
	private LineInfoFacade lineInfoFacade;

	@Resource
	private LocationInfoFacade locationInfoFacade;

	/**
	 * 司机运单管理页
	 * 
	 * @author zhangya 2017年6月29日 下午1:46:43
	 * @return
	 */
	@RequiresPermissions("waybillDriver:view")
	@RequestMapping("/showDriverWaybillInfoPage")
	public String showDriverWaybillInfoPage() {
		return "template/driverwaybill/show_driver_waybill_info_page";
	}

	/**
	 * 司机运单信息查询(分页)
	 * 
	 * @author zhangya 2017年6月29日 下午1:47:33
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/listDriverWaybillInfo")
	public String listDriverWaybillInfo(HttpServletRequest request, Model model) {

		DataPager<WaybillInfoPo> driverWaybillInfoPager = new DataPager<WaybillInfoPo>();

		// 从session中取出当前用户的用户ID、用户权限和主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 2、封装查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("userInfoId", userInfoId);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		driverWaybillInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		driverWaybillInfoPager.setSize(rows);

		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);

		// 货物名称
		String goodsName = null;
		if (params.get("goodsName") != null) {
			goodsName = params.get("goodsName").toString();
			queryMap.put("goodsName", goodsName);
		}

		// 委托方名称
		String entrustName = null;
		if (params.get("entrustName") != null) {
			entrustName = params.get("entrustName").toString();
			queryMap.put("entrustName", entrustName);
		}

		// 发货单位
		String forwardingUnit = null;
		if (params.get("forwardingUnit") != null) {
			forwardingUnit = params.get("forwardingUnit").toString();
			queryMap.put("forwardingUnit", forwardingUnit);
		}

		// 到货单位
		String consignee = null;
		if (params.get("consignee") != null) {
			consignee = params.get("consignee").toString();
			queryMap.put("consignee", consignee);
		}

		// 计划拉运日期Start
		String planTransportDateStart = null;
		if (params.get("planTransportDateStart") != null) {
			planTransportDateStart = params.get("planTransportDateStart").toString();
			queryMap.put("planTransportDateStart", planTransportDateStart);
		}

		// 计划拉运日期End
		String planTransportDateEnd = null;
		if (params.get("planTransportDateEnd") != null) {
			planTransportDateEnd = params.get("planTransportDateEnd").toString();
			queryMap.put("planTransportDateEnd", planTransportDateEnd);
		}

		// 运单状态
		Integer waybillStatus = null;
		if (params.get("waybillStatus") != null) {
			waybillStatus = Integer.valueOf(params.get("waybillStatus").toString());
			queryMap.put("waybillStatus", waybillStatus);
		}

		// 线路Start
		String lineNameStart = null;
		if (params.get("lineNameStart") != null) {
			lineNameStart = params.get("lineNameStart").toString();
			queryMap.put("lineNameStart", lineNameStart);
		}

		// 线路End
		String lineNameEnd = null;
		if (params.get("lineNameEnd") != null) {
			lineNameEnd = params.get("lineNameEnd").toString();
			queryMap.put("lineNameEnd", lineNameEnd);
		}

		// 3、查询司机运单总数
		Integer totalNum = waybillInfoFacade.countDriverWaybillInfoForPage(queryMap);

		// 4、分页查询司机运单
		List<WaybillInfoPo> WaybillInfoList = waybillInfoFacade.findDriverWaybillInfoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(WaybillInfoList)) {

			// 获取司机ID集合
			List<Integer> userInfoIdList = CommonUtils.getValueList(WaybillInfoList, "userInfoId");
			// 获取司机名称
			List<UserInfo> userInfoList = userInfoFacade.findUserNameByIds(userInfoIdList);
			// 转为map存放
			Map<Integer, String> userMap = CommonUtils.listforMap(userInfoList, "id", "userName");

			// 获取线路ID集合
			List<Integer> lineInfoIds = CommonUtils.getValueList(WaybillInfoList, "lineInfoId");
			// 获取线路信息
			List<LineInfoPo> lineInfoList = lineInfoFacade.findLineInfoByIds(lineInfoIds);
			// 转为map存放
			Map<Integer, String> lineInfoMap = CommonUtils.listforMap(lineInfoList, "id", "lineName");

			// 获取地点信息 （零散货物取地点）
			List<LocationInfoPo> locationInfoList = locationInfoFacade.findLocationNameByIds(lineInfoIds);
			// 转为map存放
			Map<Integer, String> locationInfoMap = CommonUtils.listforMap(locationInfoList, "id", "locationName");

			for (WaybillInfoPo waybillInfoPo : WaybillInfoList) {

				// 封装司机名称
				if (MapUtils.isNotEmpty(userMap) && userMap.get(waybillInfoPo.getUserInfoId()) != null) {
					waybillInfoPo.setDriverName(userMap.get(waybillInfoPo.getUserInfoId()));
				}
				// 封装线路名称(或地点名称)
				if (waybillInfoPo.getWaybillClassify() == 1) {
					if (MapUtils.isNotEmpty(lineInfoMap) && lineInfoMap.get(waybillInfoPo.getLineInfoId()) != null) {
						waybillInfoPo.setLineInfoName(lineInfoMap.get(waybillInfoPo.getLineInfoId()));
					}
				} else {
					// 零散货物取地点
					if (MapUtils.isNotEmpty(locationInfoMap) && locationInfoMap.get(waybillInfoPo.getLineInfoId()) != null) {
						waybillInfoPo.setLineInfoName(locationInfoMap.get(waybillInfoPo.getLineInfoId()));
					}
				}
			}
		}

		// 5、总数、分页信息封装
		driverWaybillInfoPager.setTotal(totalNum);
		driverWaybillInfoPager.setRows(WaybillInfoList);

		model.addAttribute("driverWaybillInfoPager", driverWaybillInfoPager);

		return "template/driverwaybill/driver_waybill_info_data";
	}

	/**
	 * 操作司机运单 操作类型 1:确认接单 2:确认拒单 3:维护装货信息 4:维护卸货信息 5:司机查看运单 6:上传在途磅单
	 * @author zhangya 2017年7月1日 下午1:28:37
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/operateDriverWaybillInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateDriverWaybillInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();

		// 被操作的司机运单ID
		List<Integer> waybillInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("driverWaybillInfoIds"))) {
			String waybillInfoIds = request.getParameter("driverWaybillInfoIds").trim();
			String[] waybillArray = waybillInfoIds.split(",");
			if (waybillArray.length > 0) {
				for (String waybillIdStr : waybillArray) {
					if (StringUtils.isNotBlank(waybillIdStr)) {
						waybillInfoIdList.add(Integer.valueOf(waybillIdStr.trim()));
					}
				}
			}
		}

		// 所选运单不能为空
		if (CollectionUtils.isEmpty(waybillInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选运单不能为空");
			return jo;
		}

		// 校验操作类型
		if (StringUtils.isBlank(request.getParameter("operateType"))) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "当前操作无效!");
			return jo;
		}
		Integer operateType = Integer.valueOf(request.getParameter("operateType"));
		try {
			return waybillInfoFacade.operateWaybillInfo(userInfoId, waybillInfoIdList, operateType);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "当前操作异常!");
			return jo;
		}
	}

}
