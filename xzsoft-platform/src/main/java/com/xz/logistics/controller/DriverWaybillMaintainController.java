package com.xz.logistics.controller;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.facade.api.DriverWaybillMaintainPoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.model.po.DriverWaybillMaintainPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillInfoPo;
import com.xz.model.vo.DriverWaybillMaintainPoModel;

/**
 * 运单装卸货信息管理（司机）
 * 
 * @author zhangya 2017年7月1日 下午5:04:30
 *
 */
@Controller
@RequestMapping("/driverWaybillMaintainInfo")
public class DriverWaybillMaintainController extends BaseController {

	@Resource
	private WaybillInfoFacade waybillInfoFacade;

	@Resource
	private OrgInfoFacade orgInfoFacade;

	@Resource
	private DriverWaybillMaintainPoFacade driverWaybillMaintainPoFacade;

	/**
	 * 司机运单装卸货信息维护页
	 * 
	 * @author zhangya 2017年7月1日 下午5:04:48
	 * @return
	 */
	@RequestMapping("/editDriverWaybillMaintainInfoPage")
	public String editDriverWaybillMaintainInfoPage(HttpServletRequest request, Model model) {
		// 被操作的司机运单ID

		Integer waybillInfoId = Integer.valueOf(request.getParameter("driverWaybillInfoId"));

		String operateType = request.getParameter("operateType");
		// 获取session信息
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		// 查询参数
		Map<String, Integer> params = new HashMap<String, Integer>();
		params.put("userInfoId", userInfoId);
		params.put("waybillInfoId", waybillInfoId);
		WaybillInfoPo waybillInfoPo = waybillInfoFacade.getDriverWaybillById(params);
		DriverWaybillMaintainPo driverWaybillMaintainPo = null;
		String modelAndView = "template/driverwaybill/maintain_driver_waybill_loading_info_page";
		if (operateType.equals("3")) {
			// 维护装货信息
			driverWaybillMaintainPo = new DriverWaybillMaintainPo();
			driverWaybillMaintainPo.setEntrust(waybillInfoPo.getEntrust());
			driverWaybillMaintainPo.setEntrustName(waybillInfoPo.getEntrustName());
			driverWaybillMaintainPo.setForwardingUnit(waybillInfoPo.getForwardingUnit());
			driverWaybillMaintainPo.setConsignee(waybillInfoPo.getConsignee());
			driverWaybillMaintainPo.setWaybillInfoId(waybillInfoPo.getId());
		} else if (operateType.equals("4")) {
			// 维护卸货信息
			driverWaybillMaintainPo = driverWaybillMaintainPoFacade.getDriverWaybillMaintainInfoById(waybillInfoId);
			if (driverWaybillMaintainPo != null) {
				driverWaybillMaintainPo.setEntrustName(waybillInfoPo.getEntrustName());
			}
			modelAndView = "template/driverwaybill/maintain_driver_waybill_unloading_info_page";
		} else if (operateType.equals("5")) {
			// 维护卸货信息
			driverWaybillMaintainPo = driverWaybillMaintainPoFacade.getDriverWaybillMaintainInfoById(waybillInfoId);
			if (driverWaybillMaintainPo != null) {
				driverWaybillMaintainPo.setEntrustName(waybillInfoPo.getEntrustName());
			}
			modelAndView = "template/driverwaybill/view_driver_waybill_info_page";
		} else if (operateType.equals("6")) {
			// 上传在途磅单照片
			driverWaybillMaintainPo = driverWaybillMaintainPoFacade.getDriverWaybillMaintainInfoById(waybillInfoId);
			if (driverWaybillMaintainPo != null) {
				driverWaybillMaintainPo.setEntrustName(waybillInfoPo.getEntrustName());
			}
			modelAndView = "template/driverwaybill/upload_onpassage_img_info_page";
		}
		model.addAttribute("driverWaybillMaintainPo", driverWaybillMaintainPo);
		return modelAndView;
	}

	/**
	 * 维护司机运单装货信息
	 * 
	 * @author zhangya 2017年7月1日 下午1:28:37
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/maintainDriverWaybillLoadingOrUnloadingInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject maintainDriverWaybillLoadingInfo(HttpServletRequest request,
			DriverWaybillMaintainPoModel driverWaybillMaintainPoModel) {
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();

		try {
			return driverWaybillMaintainPoFacade.addOrUpdateDriverWaybillMaintainInfo(userInfoId,
					driverWaybillMaintainPoModel);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "司机运单维护服务异常!");
			return jo;
		}
	}

	/**
	 * 上传在途磅单
	 * 
	 * @author zhangya 2017年8月21日 下午6:59:34
	 * @param request
	 * @param driverWaybillMaintainPoModel
	 * @return
	 */
	@RequestMapping(value = "/uploadOnpassageImgInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject uploadOnpassageImgInfo(HttpServletRequest request,
			DriverWaybillMaintainPoModel driverWaybillMaintainPoModel) {
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();

		try {
			return driverWaybillMaintainPoFacade.uploadOnpassageImgInfo(userInfoId, driverWaybillMaintainPoModel);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "司机运单维护服务异常!");
			return jo;
		}
	}

}
