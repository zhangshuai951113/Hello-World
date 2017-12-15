package com.xz.logistics.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.date.DateUtils;
import com.xz.facade.api.AddressDetailFacade;
import com.xz.facade.api.DriverWaybillMaintainPoFacade;
import com.xz.model.po.AddressDetail;
import com.xz.model.po.DriverWaybillMaintainPo;
/**
 * 运单实时轨迹
 * @author jiangweiwei
 * @date 2017年8月19日
 */
@Controller
@RequestMapping("/waybillReadTimeTrajectory")
public class WaybillReadTimeTrajectoryController{

	// 日志
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private AddressDetailFacade addressDetailFacade;
	@Resource
	private DriverWaybillMaintainPoFacade driverWaybillMaintainPoFacade;
	
	/**
	 * 运单司机轨迹初始化
	 * @author jiangweiwei
	 * @date 2017年8月19日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initWaybillReadTimeTrajectory")
	public String initWaybillReadTimeTrajectory(HttpServletRequest request, Model model) {
		//运单信息表主键ID
		Integer waybillInfoId = null;
		if(request.getParameter("waybillInfoId") != null){
			waybillInfoId = Integer.valueOf(request.getParameter("waybillInfoId"));
		}
		//司机编号（司机信息表用户主键ID）
		Integer userInfoId = null;
		if(request.getParameter("userInfoId") != null){
			userInfoId = Integer.valueOf(request.getParameter("userInfoId"));
		}
		model.addAttribute("waybillInfoId", waybillInfoId);
		model.addAttribute("userInfoId", userInfoId);
		//封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("waybillInfoId", waybillInfoId);
		queryMap.put("userInfoId", userInfoId);
//		List<AddressDetail> addressDetailList = addressDetailFacade.findAddressDetailByMap(queryMap);
//		model.addAttribute("firstLng", addressDetailList.get(0).getLocationLongitude());
//		model.addAttribute("firstLat", addressDetailList.get(0).getLocationLatitude());
		return "template/realTime/realtimeMap";
	}

	@RequestMapping(value = "/showWaybillHistoryTrajectory", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject showWaybillHistoryTrajectory(HttpServletRequest request, Model model) throws Exception {
		JSONObject json = new JSONObject();
		// 获取参数  
		// 运单信息表主键ID
		Integer waybillInfoId = null;
		if (request.getParameter("waybillInfoId") != null) {
			waybillInfoId = Integer.valueOf(request.getParameter("waybillInfoId"));
		}
		// 司机编号（司机信息表用户主键ID）
		Integer userInfoId = null;
		if (request.getParameter("userInfoId") != null) {
			userInfoId = Integer.valueOf(request.getParameter("userInfoId"));
		}
		DriverWaybillMaintainPo driverWaybillMaintainPo = driverWaybillMaintainPoFacade.getDriverWaybillMaintainInfoById(waybillInfoId);
		//根据登录运单信息表主键ID和司机编号（司机信息表用户主键ID）查询此运单司机的历史行车轨迹信息
		List<AddressDetail> historyTrajectoryList = new ArrayList<AddressDetail>();
		if(driverWaybillMaintainPo != null){
			//封装参数
			Map<String, Object> queryMap = new HashMap<String, Object>();
			queryMap.put("waybillInfoId", waybillInfoId);
			queryMap.put("userInfoId", userInfoId);
			queryMap.put("loadingDate", driverWaybillMaintainPo.getLoadingDate());
			queryMap.put("unloadingDate", driverWaybillMaintainPo.getUnloadingDate());
			historyTrajectoryList = addressDetailFacade.findAddressDetailByMap(queryMap);
		}
		json.put("historyTrajectoryList", historyTrajectoryList);
		return json;
	}
	
	@RequestMapping(value = "/showWaybillReadTimeTrajectory", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject showWaybillReadTimeTrajectory(HttpServletRequest request, Model model) throws Exception {
		JSONObject json = new JSONObject();
		// 获取参数  
		// 运单信息表主键ID
		Integer waybillInfoId = null;
		if (request.getParameter("waybillInfoId") != null) {
			waybillInfoId = Integer.valueOf(request.getParameter("waybillInfoId"));
		}
		// 司机编号（司机信息表用户主键ID）
		Integer userInfoId = null;
		if (request.getParameter("userInfoId") != null) {
			userInfoId = Integer.valueOf(request.getParameter("userInfoId"));
		}
		// 经度
//		String locationLongitude = null;
//		if (request.getParameter("locationLongitude") != null) {
//			locationLongitude = request.getParameter("locationLongitude");
//		}
		// 纬度
//		String locationLatitude = null;
//		if (request.getParameter("locationLatitude") != null) {
//			locationLatitude = request.getParameter("locationLatitude");
//		}
		// 创建时间
//		Date createTime = null;
//		if (StringUtils.isNotBlank(request.getParameter("createTime"))) {
//			createTime = DateUtils.formatDate(request.getParameter("createTime"));
//		}
		//封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("waybillInfoId", waybillInfoId);
		queryMap.put("userInfoId", userInfoId);
//		queryMap.put("locationLongitude", locationLongitude);
//		queryMap.put("locationLatitude",locationLatitude);
//		queryMap.put("createTime", createTime);
		//根据登录运单信息表主键ID和司机编号（司机信息表用户主键ID）查询此运单司机的当前行车轨迹信息
		List<AddressDetail> currentTrajectoryList = addressDetailFacade.findAddressDetailByMap(queryMap);
		if(CollectionUtils.isNotEmpty(currentTrajectoryList) && currentTrajectoryList.size() > 0){
			if(currentTrajectoryList.get(currentTrajectoryList.size()-1).getWaybillStatus() != null){
				if(currentTrajectoryList.get(currentTrajectoryList.size()-1).getWaybillStatus() == 2){
					json.put("success", 3);
				}else{
					json.put("success", 1);
				}
			}else{
				json.put("success", 1);
			}
			json.put("currentTrajectoryList", currentTrajectoryList);
		}else{
			json.put("success", 2);
		}
		return json;
	}
 }
