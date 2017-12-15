package com.xz.logistics.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.PartnerInfoFacade;
import com.xz.facade.api.PlanInfoFacade;
import com.xz.facade.api.TransportDayPlanFacade;
import com.xz.facade.api.TransportPriceFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.model.po.ContractInfo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.PartnerInfoPo;
import com.xz.model.po.PlanInfoPo;
import com.xz.model.po.TransportDayPlanPo;
import com.xz.model.po.TransportPrice;
import com.xz.model.po.UserDataAuthPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillInfoPo;
import com.xz.model.vo.WaybillInfoModel;
/**
 * 
 * @ClassName: WaybillController  
 * @Description: 运单管理
 * @author A18ccms a18ccms_gmail_com  
 * @date 2017年7月1日 下午12:00:43  
 *
 */
@Controller
@RequestMapping("/waybillInfo")
public class WaybillController extends BaseController{

	// 日志
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private WaybillInfoFacade waybillInfoFacade;
	
	@Resource
	private TransportDayPlanFacade transportDayPlanFacade;
	
	@Resource
	private PlanInfoFacade planInfoFacade;
	
	@Resource
	private TransportPriceFacade transportPriceFacade;
	
	@Resource
	private DriverInfoFacade driverInfoFacade;
	
	@Resource
	private PartnerInfoFacade partnerInfoFacade;
	
	@RequiresPermissions("waybill:generate:view")
	@RequestMapping("/showWaybillCreatePage")
	public String showWaybillCreatePage(HttpServletRequest request){
		return "template/waybillInfo/waybill-create";
	}

	
	/**
	 * @Title: splitPlan  
	 * @Description: 计划拆分
	 * @param request
	 * @throws Exception 
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/splitPlan")
	@ResponseBody
	public JSONObject splitPlan(HttpServletRequest request) throws Exception {
		JSONObject json = null;
		
		//Thread.sleep(5000);
		
		// 1、从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 2、获取参数  
		// 计划信息id
		Integer planId = null;
		if (request.getParameter("planId") != null) {
			planId = Integer.valueOf(request.getParameter("planId"));
		}
		
		// 运输天数
		Integer transportDays = null;
		if (request.getParameter("transportDays") != null) {
			transportDays = Integer.valueOf(request.getParameter("transportDays"));
		}
		
		try {
			// h拆分计划
			json = transportDayPlanFacade.spitPlan(userInfo,planId,transportDays);
		} catch (Exception e) {
			log.error("splitPlan信息异常", e);
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "服务异常，请稍后重试");
		}
		
		return json;
	}
	
	
	/**
	 * 
	 * @Title: selectTransportDayPlans  
	 * @Description: 根据计划信息查询拆分出来的日计划信息
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/selectTransportDayPlansByPlanId")
	@ResponseBody
	public JSONObject selectTransportDayPlansByPlanId(HttpServletRequest request){

		// 1、获取并处理参数
		// 页数
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.parseInt(request.getParameter("page"));
		}

		// 行数
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.valueOf(request.getParameter("rows"));
		}

		// 计划id
		Integer planInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("planInfoId"))) {
			planInfoId = Integer.valueOf(request.getParameter("planInfoId"));
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("planInfoId", planInfoId);
		
		// 3、查询组织信息总数
		Integer totalNum = transportDayPlanFacade.selectCountByPlanId(planInfoId);
		// 4、分页查询组织信息
		List<TransportDayPlanPo> transportDayPlanList = transportDayPlanFacade.searchInfoListByPlanId(queryMap);
  
		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("total", totalNum);
		json.put("list", transportDayPlanList);
		return json;
	}
	

	/**
	 * 
	 * @Title: updateTransportAmountDifference  
	 * @Description: 修改运量差额
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/updateTransportAmountDifference")
	@ResponseBody
	public JSONObject updateTransportAmountDifference(HttpServletRequest request){
		JSONObject json = null;
		
		// 1、接受参数
		// 运输日计划表transport_day_plan  id
		Integer id = null;
		if (request.getParameter("id") != null) {
			id = Integer.parseInt(request.getParameter("id"));
		}
		// 运量差额
		BigDecimal transportAmountDifference = null;
		if (request.getParameter("transportAmountDifference") != null) {
			try {
				transportAmountDifference = new BigDecimal(request.getParameter("transportAmountDifference"));
			} catch (Exception e) {
				json = new JSONObject();
				json.put("success", false);
				json.put("msg", "请输入合法的运量差额");
				return json;
			}
		}
		
		// 2、修改运量差额
		json = transportDayPlanFacade.updateTransportAmountDifference(id, transportAmountDifference);
		
		return json;
	}
	
	/**
	 * 
	 * @Title: saveWaybillInfo  
	 * @Description: 保存运单信息
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/saveWaybillInfo")
	@ResponseBody
	public JSONObject saveWaybillInfo(HttpServletRequest request){
		JSONObject json = null;
		
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		// 1、获取参数
		// 运输日计划表主键ID（transport_day_plan_id）
		Integer transportDayPlanId = null;
		if (request.getParameter("transportDayPlanId") != null) {
			transportDayPlanId = Integer.parseInt(request.getParameter("transportDayPlanId").toString()); 
		}
		// 生成方式 （1：按运输车次，2：按单车最低运量）
		Integer createType = null;
		if (request.getParameter("createType") != null) {
			createType = Integer.parseInt(request.getParameter("createType").toString()); 
		}
		// 运输车次
		String transportNum = null;
		if (request.getParameter("transportNum") != null) {
			transportNum = request.getParameter("transportNum").toString(); 
			if ("".equals(transportNum)) {
				transportNum = "0";
			}
		}
		// 单车最低运量
		String minTransportAmount = null;
		if (request.getParameter("minTransportAmount") != null) {
			minTransportAmount = request.getParameter("minTransportAmount").toString(); 
			if ("".equals(minTransportAmount)) {
				minTransportAmount = "0";
			}
		}
		
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("transportDayPlanId", transportDayPlanId);
		params.put("createType", createType);
		params.put("transportNum", transportNum);
		params.put("minTransportAmount", minTransportAmount);
		try {
			json = waybillInfoFacade.createWaybillInfo(userInfo, params);
		} catch (Exception e) {
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "运单运单生成失败");
			e.printStackTrace();
		}
		return json;
	}
	
	/**
	 * 
	 * @Title: selectWaybillInfosByParams  
	 * @Description: 根据参数，查询运单信息
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/selectWaybillInfosByTransportDayPlanId")
	@ResponseBody
	public JSONObject selectWaybillInfosByTransportDayPlanId(HttpServletRequest request){
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 主机构id
		Integer orgRootId = userInfo.getOrgRootId();
		
		Integer userInfoId = userInfo.getId();
		StringBuffer buffer = new StringBuffer();
		List<UserDataAuthPo> userDataAuthList = waybillInfoFacade.getUserDataAuthPoList(orgRootId, userInfoId);
		for (int i = 0; i < userDataAuthList.size(); i++) {
			if (i == 0) {
				buffer.append("'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			} else {
				buffer.append(",'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			}
		}
		// 条件组 （根据登录用户主机构ID和登录用户ID查询用户数据权限表中的条件组字段）
		String conditionGroup = buffer.toString();
		if (StringUtils.isBlank(conditionGroup)) {
			conditionGroup = null;
		}
		
		// 获取并处理参数
		
		// 页数
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.valueOf(request.getParameter("page"));
		}

		// 行数
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.valueOf(request.getParameter("rows"));
		}
		
		// 日计划id
		Integer transportDayPlanId = null;
		if (StringUtils.isNotBlank(request.getParameter("transportDayPlanId"))) {
			transportDayPlanId = Integer.valueOf(request.getParameter("transportDayPlanId"));
		}
		
		
		
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("conditionGroup", conditionGroup);
		queryMap.put("transportDayPlanId", transportDayPlanId);
		
		// 3、查询组织信息总数
		Integer totalNum = waybillInfoFacade.selectSimpleCountByParams(queryMap);

		// 4、分页查询组织信息
		List<WaybillInfoPo> waybillInfoList = waybillInfoFacade.selectSimpleInfosByParams(queryMap);
		
		// 5、总数、分页信息封装

		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("total", totalNum);
		json.put("list", waybillInfoList);
		return json;
	}
	
	/**
	 * 
	 * @Title: deleteWaybillInfo  
	 * @Description: 删除运单信息
	 * @param request
	 * @return 
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/deleteWaybillInfo")
	@ResponseBody
	public JSONObject deleteWaybillInfo(HttpServletRequest request){
		JSONObject json = null;
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 获取参数
		String ids = null;
		if (StringUtils.isNotBlank(request.getParameter("ids"))) {
			ids = request.getParameter("ids");
		}
		
		// 删除运单
		try {
			json = waybillInfoFacade.deleteByIds(userInfo,ids);
		} catch (Exception e) {
			log.error("运单派发异常", e);
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "运单删除失败");
		}
		
		return json;
	}
	
	
	/**
	 * 
	 * @Title: selectPlanInfosByParams  
	 * @Description: 根据参数查询计划信息
	 * @param request
	 * @return String
	 * @throws
	 */
	@RequestMapping("/selectPlanInfosByParams")
	@ResponseBody
	public JSONObject selectPlanInfosByParams(HttpServletRequest request){
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 主机构id orgRootId
		Integer orgRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userRole = userInfo.getUserRole();
		Integer userInfoId = userInfo.getId();
		Integer orgType = userInfo.getOrgType();
		StringBuffer buffer = new StringBuffer();
		List<UserDataAuthPo> userDataAuthList = waybillInfoFacade.getUserDataAuthPoList(orgRootId, userInfoId);
		for (int i = 0; i < userDataAuthList.size(); i++) {
			if (i == 0) {
				buffer.append("'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			} else {
				buffer.append(",'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			}
		}
		// 条件组 （根据登录用户主机构ID和登录用户ID查询用户数据权限表中的条件组字段）
		String conditionGroup = buffer.toString();
		if (StringUtils.isBlank(conditionGroup)) {
			conditionGroup = null;
		}

		// 1、获取并处理参数
		
		// 页数
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.valueOf(request.getParameter("page"));
		}

		// 行数
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.valueOf(request.getParameter("rows"));
		}
		
		// 计划名称
		String planInfoName = null;
		if (StringUtils.isNotBlank(request.getParameter("planInfoName"))) {
			planInfoName = request.getParameter("planInfoName");
		}
		// 货物
		String goodsInfoName = null;
		if (StringUtils.isNotBlank(request.getParameter("goodsInfoName"))) {
			goodsInfoName = request.getParameter("goodsInfoName");
		}
		// 委托方
		String entrustName = null;
		if (StringUtils.isNotBlank(request.getParameter("entrustName"))) {
			entrustName = request.getParameter("entrustName");
		}
		// 承运方
		String shipperName = null;
		if (StringUtils.isNotBlank(request.getParameter("shipperName"))) {
			shipperName = request.getParameter("shipperName");
		}
		// 发货单位
		String forwardingUnit = null;
		if (StringUtils.isNotBlank(request.getParameter("forwardingUnit"))) {
			forwardingUnit = request.getParameter("forwardingUnit");
		}
		// 到货单位
		String consignee = null;
		if (StringUtils.isNotBlank(request.getParameter("consignee"))) {
			consignee = request.getParameter("consignee");
		}
		// 线路
		Integer lineInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("lineInfoId"))) {
			lineInfoId = Integer.parseInt(request.getParameter("lineInfoId"));
		}
		// 起始日期1
		String startDate1 = null;
		if (StringUtils.isNotBlank(request.getParameter("startDate1"))) {
			startDate1 = request.getParameter("startDate1");
		}
		// 起始日期2
		String startDate2 = null;
		if (StringUtils.isNotBlank(request.getParameter("startDate2"))) {
			startDate2 = request.getParameter("startDate2");
		}
		// 结束日期1
		String endDate1 = null;
		if (StringUtils.isNotBlank(request.getParameter("endDate1"))) {
			endDate1 = request.getParameter("endDate1");
		}
		// 结束日期2
		String endDate2 = null;
		if (StringUtils.isNotBlank(request.getParameter("endDate2"))) {
			endDate2 = request.getParameter("endDate2");
		}
		// 计划类型
		Integer planType = null;
		if (StringUtils.isNotBlank(request.getParameter("planType"))) {
			planType = Integer.parseInt(request.getParameter("planType"));
		}
		// 协同状态
		Integer cooperateStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("cooperateStatus"))) {
			cooperateStatus = Integer.parseInt(request.getParameter("cooperateStatus"));
		}

		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("planInfoName", planInfoName);
		queryMap.put("goodsInfoName", goodsInfoName);
		queryMap.put("entrustName", entrustName);
		queryMap.put("shipperName", shipperName);
		queryMap.put("forwardingUnit", forwardingUnit);
		queryMap.put("consignee", consignee);
		queryMap.put("lineInfoId", lineInfoId);
		queryMap.put("startDate1", startDate1);
		queryMap.put("startDate2", startDate2);
		queryMap.put("endDate1", endDate1);
		queryMap.put("endDate2", endDate2);
		queryMap.put("planType", planType);
		queryMap.put("cooperateStatus", cooperateStatus);
		queryMap.put("userRole", userRole);
		queryMap.put("conditionGroup", conditionGroup);
		
		// 3、查询组织信息总数
		Integer totalNum = planInfoFacade.selectCountByParams(queryMap);

		// 4、分页查询组织信息
		List<PlanInfoPo> planInfoList = planInfoFacade.selectPlanInfosByParams(queryMap);
		
		// 5、总数、分页信息封装
		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("total", totalNum);
		json.put("list", planInfoList);
		return json;
	}
	
	/**
	 * 
	 * @Title: validateIsSplitPlan  
	 * @Description: 验证计划是否已拆分（点击计划拆分按钮时）  
	 * @param request
	 * @throws Exception 
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/validateIsSplitPlan")
	@ResponseBody
	public JSONObject validateIsSplitPlan(HttpServletRequest request){
		JSONObject json = null;
		
		// 1、获取参数  
		// 计划信息id
		Integer planId = null;
		if (request.getParameter("planId") != null) {
			planId = Integer.valueOf(request.getParameter("planId"));
		}
		try {
			json = planInfoFacade.validateIsSplitPlan(planId);
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("msg","请求失败");
		}		
		
		
		return json; 
	}
	
	@RequiresPermissions("waybill:self:view")
	@RequestMapping("/showZYYDPF")
	public String showZYYDPF(){
		return "template/waybillInfo/proprietary-waybill";
	}
	
	/**
	 * 
	 * @Title: selectWaybillInfos  
	 * @Description: 查询运单信息
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/getProprietaryWaybillInfoList")
	@ResponseBody
	public JSONObject getProprietaryWaybillInfoList(HttpServletRequest request){
		DataPager<WaybillInfoPo> waybillInfoPager = new DataPager<WaybillInfoPo>();

		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 主机构id
		// 条件组 
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		StringBuffer buffer = new StringBuffer();
		List<UserDataAuthPo> userDataAuthList = waybillInfoFacade.getUserDataAuthPoList(orgRootId, userInfoId);
		for (int i = 0; i < userDataAuthList.size(); i++) {
			if (i == 0) {
				buffer.append("'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			} else {
				buffer.append(",'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			}
		}
		String conditionGroup = buffer.toString();
		if (StringUtils.isBlank(conditionGroup)) {
			conditionGroup = null;
		}

		// 1、获取并处理参数
		// 页数
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.valueOf(request.getParameter("page"));
		}
		waybillInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.valueOf(request.getParameter("rows"));
		}
		waybillInfoPager.setSize(rows);
		

		// 货物
		String goodsInfoName = null;
		if (StringUtils.isNotBlank(request.getParameter("goodsInfoName"))) {
			goodsInfoName = request.getParameter("goodsInfoName");
		}
		//委托方
		String entrustName = null;
		if (StringUtils.isNotBlank(request.getParameter("entrustName"))) {
			entrustName = request.getParameter("entrustName");
		}
		// 发货单位
		String forwardingUnit = null;
		if (StringUtils.isNotBlank(request.getParameter("forwardingUnit"))) {
			forwardingUnit = request.getParameter("forwardingUnit");
		}
		// 到货单位
		String consignee = null;
		if (StringUtils.isNotBlank(request.getParameter("consignee"))) {
			consignee = request.getParameter("consignee");
		}
		// 日期区间查询条件：计划拉运日期。
		String planTransportDate1 = null;
		if (StringUtils.isNotBlank(request.getParameter("planTransportDate1"))) {
			planTransportDate1 = request.getParameter("planTransportDate1");
		}
		String planTransportDate2 = null;
		if (StringUtils.isNotBlank(request.getParameter("planTransportDate2"))) {
			planTransportDate2 = request.getParameter("planTransportDate2");
		}
		// 地点区间查询条件：线路
		String lineInfoName = null;
		if (StringUtils.isNotBlank(request.getParameter("lineInfoName"))) {
			lineInfoName = request.getParameter("lineInfoName");
		}
		// 下拉查询条件：运单状态、协同状态。
		String waybillStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("waybillStatus"))) {
			waybillStatus = request.getParameter("waybillStatus");
		}
		Integer cooperateStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("cooperateStatus"))) {
			cooperateStatus = Integer.parseInt(request.getParameter("cooperateStatus"));
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("conditionGroup", conditionGroup);
		queryMap.put("goodsInfoName", goodsInfoName);
		queryMap.put("entrustName", entrustName);
		queryMap.put("forwardingUnit", forwardingUnit);
		queryMap.put("consignee", consignee);
		queryMap.put("planTransportDate1", planTransportDate1);
		queryMap.put("planTransportDate2", planTransportDate2);
		queryMap.put("lineInfoName", lineInfoName);
		queryMap.put("waybillStatus", waybillStatus);
		queryMap.put("cooperateStatus", cooperateStatus);

		
		// 3、查询组织信息总数
		Integer totalNum = waybillInfoFacade.selectWaybillInfoCountByParams(queryMap);

		// 4、分页查询组织信息
		List<WaybillInfoPo> waybillInfoList = waybillInfoFacade.selectWaybillInfosByParams(queryMap);
		
		// 7、总数、分页信息封装
		waybillInfoPager.setTotal(totalNum);
		waybillInfoPager.setRows(waybillInfoList);
		
		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("waybillInfoPager", waybillInfoPager);
		return json;
	}
	
	
	/**
	 * 查询运单状态
	 * @param request
	 * @return
	 */
	@RequestMapping("/waybillIsNew")
	@ResponseBody
	public JSONObject waybillIsNew(HttpServletRequest request){
		JSONObject json = new JSONObject();
		
		// 获取参数
		Integer id = null;
		if (request.getParameter("id") != null) {
			id = Integer.parseInt(request.getParameter("id"));
		}
		try {
			WaybillInfoPo info = waybillInfoFacade.getById(id);
			json.put("success", true);
			json.put("waybillStatus", info.getWaybillStatus());
		} catch (Exception e) {
			json.put("success", true);
			json.put("msg", "运单信息异常");
		}
		return json;
	}
	/**
	 * 
	 * @Title: selectInternalDriver  
	 * @Description: 查询内部司机
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/selectInternalDriver")
	@ResponseBody
	public JSONObject selectInternalDriver(HttpServletRequest request){
		DataPager<DriverInfo> dirverInfoPager = new DataPager<DriverInfo>();
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		
		// 1、获取并处理参数
		
		// 页数
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.valueOf(request.getParameter("page"));
		}
		dirverInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.valueOf(request.getParameter("rows"));
		}
		dirverInfoPager.setSize(rows);
		
		// 司机姓名
		String driverName = null;
		if (StringUtils.isNotBlank(request.getParameter("driverName"))) {
			driverName = request.getParameter("driverName");
		}
		// 手机号码
		String mobilePhone = null;
		if (StringUtils.isNotBlank(request.getParameter("mobilePhone"))) {
			mobilePhone = request.getParameter("mobilePhone");
		}
		// 车牌号
		String carCode = null;
		if (StringUtils.isNotBlank(request.getParameter("carCode"))) {
			carCode = request.getParameter("carCode");
		}
		// 司机类型
		Integer driverType = 1;
		if (StringUtils.isNotBlank(request.getParameter("driverType"))) {
			driverType = Integer.parseInt(request.getParameter("driverType"));
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("rootOrgInfoId", rootOrgInfoId);
		queryMap.put("driverName", driverName);
		queryMap.put("mobilePhone", mobilePhone);
		queryMap.put("carCode", carCode);
		queryMap.put("driverType", driverType);
		
		// 3、查询复合条件的内部司机总数
		Integer totalNum = driverInfoFacade.searchInternalDriverCount(queryMap);
		
		// 4、查询符合条件的内部司机信息
		List<DriverInfo> driverInfoList = driverInfoFacade.searchInternalDriverList(queryMap);
		
		// 7、总数、分页信息封装
		dirverInfoPager.setTotal(totalNum);
		dirverInfoPager.setRows(driverInfoList);
		
		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("dirverInfoPager", dirverInfoPager);
		return json;
	}
	
	
	
	/**
	 * 
	 * @Title: selectOutsideDriver  
	 * @Description: 查询外协司机
	 * @param request
	 * @param model
	 * @return String
	 * @throws
	 */
	@RequestMapping("/selectOutsideDriver")
	@ResponseBody
	public JSONObject selectOutsideDriver(HttpServletRequest request){
		DataPager<PartnerInfoPo> partnerInfoPager = new DataPager<PartnerInfoPo>();
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		
		// 1、获取并处理参数
		
		// 页数
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.parseInt(request.getParameter("page"));
		}
		partnerInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.parseInt(request.getParameter("rows"));
		}
		partnerInfoPager.setSize(rows);
		
		// 司机姓名
		String driverName = null;
		if (StringUtils.isNotBlank(request.getParameter("driverName"))) {
			driverName = request.getParameter("driverName");
		}
		// 手机号码
		String mobilePhone = null;
		if (StringUtils.isNotBlank(request.getParameter("mobilePhone"))) {
			mobilePhone = request.getParameter("mobilePhone");
		}
		// 车牌号
		String carCode = null;
		if (StringUtils.isNotBlank(request.getParameter("carCode"))) {
			carCode = request.getParameter("carCode");
		}
		
		// 2、封装参数
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("start", (page - 1) * rows);
		params.put("rows", rows);
		params.put("rootOrgInfoId", rootOrgInfoId);
		params.put("driverName", driverName);
		params.put("mobilePhone", mobilePhone);
		params.put("carCode", carCode);
		
		// 3、查询复合条件的内部司机总数
		Integer totalNum = partnerInfoFacade.searchPartnerInfoCount(params);
		
		// 4、查询符合条件的内部司机信息
		List<PartnerInfoPo> partnerInfoList = partnerInfoFacade.searchPartnerInfoList(params);
		// 7、总数、分页信息封装
		partnerInfoPager.setTotal(totalNum);
		partnerInfoPager.setRows(partnerInfoList);
		
		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("dirverInfoPager", partnerInfoPager);
		
		return json;
	}
	
	/**
	 * 
	 * @Title: proprietaryWaybillDistribute  
	 * @Description: 自营运单派发 
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/proprietaryDistributeDriver")
	@ResponseBody
	public JSONObject proprietaryDistributeDriver(HttpServletRequest request){
		JSONObject json = null;
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		
		// 父运单编号（父运单主键）
		Integer waybillInfoId = null;
		if (params.get("waybillInfoId") != null) {
			waybillInfoId = Integer.valueOf(params.get("waybillInfoId").toString());
		}
		// 司机编号（司机主键）
		Integer driverInfoId = null;
		if (params.get("driverInfoId") != null) {
			driverInfoId = Integer.valueOf(params.get("driverInfoId").toString());
		}
		// 司机用户角色（1：内部司机 2：外协司机 3：临时司机）
		Integer driverUserRole = null;
		if (params.get("driverUserRole") != null) {
			driverUserRole = Integer.valueOf(params.get("driverUserRole").toString());
		}
		
		// 2、运单派发
		try {
			json = waybillInfoFacade.proprietaryDistributeDriver(userInfo, waybillInfoId, driverInfoId, driverUserRole);
		} catch (Exception e) {
			log.error("运单派发异常", e);

			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "运单派发异常，请稍后重试");
		}
		return json;
	}
	
	/**
	 * 
	 * @Title: proprietaryRetract  
	 * @Description: 自营运单撤回
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/proprietaryRetract")
	@ResponseBody
	public JSONObject proprietaryRetract(HttpServletRequest request){
		JSONObject json = null;
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		
		// 运单id
		Integer id = null;
		if (params.get("id") != null) {
			id = Integer.valueOf(params.get("id").toString());
		}
		try {
			json = waybillInfoFacade.proprietaryRetract(userInfo, id);
		} catch (Exception e) {
			e.printStackTrace();
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "运单派发异常，请稍后重试");
		}
		
		return json;
	}
	
	
	
	/**
	 * 物流运单派发模块
	 * 
	 */ 
	@RequiresPermissions("waybill:logistics:view")
	@RequestMapping("/showWLYDPF1")
	public String showWLYDPF1(){
		return "template/waybillInfo/logistics-waybill-distribute";
	}
	
	@RequestMapping("/showWLYDPF2")
	public String showWLYDPF2(){
		return "template/waybillInfo/logistics-waybill-receive";
	}
	
	/**
	 * 
	 * @Title: getWaybillInfoList  
	 * @Description: 物流运单派发-获取运单信息
	 * @param request
	 * @param model
	 * @return String
	 * @throws  
	 */
	@RequestMapping("/getLogisticsWaybillInfoList")
	@ResponseBody
	public JSONObject getLogisticsWaybillInfoList(HttpServletRequest request){
		DataPager<WaybillInfoPo> waybillInfoPager = new DataPager<WaybillInfoPo>();

		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 企业货主查询条件：根据“主机构ID”和“条件组（condition_group）”字段查询。
		// 物流公司查询条件：根据“主机构ID”匹配承运方主机构（乙方）和“条件组（condition_group）”字段查询。
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userRole = userInfo.getUserRole();
		Integer userInfoId = userInfo.getId();
		StringBuffer buffer = new StringBuffer();
		List<UserDataAuthPo> userDataAuthList = waybillInfoFacade.getUserDataAuthPoList(orgRootId, userInfoId);
		for (int i = 0; i < userDataAuthList.size(); i++) {
			if (i == 0) {
				buffer.append("'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			} else {
				buffer.append(",'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			}
		}
		String conditionGroup = buffer.toString();
		if (StringUtils.isBlank(conditionGroup)) {
			conditionGroup = null;
		}
		// 1、获取并处理参数
		// 页数
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.valueOf(request.getParameter("page"));
		}
		waybillInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.valueOf(request.getParameter("rows"));
		}
		waybillInfoPager.setSize(rows);
		
		// 货物
		String goodsInfoName = null;
		if (StringUtils.isNotBlank(request.getParameter("goodsInfoName"))) {
			goodsInfoName = request.getParameter("goodsInfoName");
		}
		// 委托方
		String entrustName = null;
		if (StringUtils.isNotBlank(request.getParameter("entrustName"))) {
			entrustName = request.getParameter("entrustName");
		}
		// 发货单位
		String forwardingUnit = null;
		if (StringUtils.isNotBlank(request.getParameter("forwardingUnit"))) {
			forwardingUnit = request.getParameter("forwardingUnit");
		}
		// 到货单位
		String consignee = null;
		if (StringUtils.isNotBlank(request.getParameter("consignee"))) {
			consignee = request.getParameter("consignee");
		}
		// 计划拉运日期
		String planTransportDate1 = null;
		if (StringUtils.isNotBlank(request.getParameter("planTransportDate1"))) {
			planTransportDate1 = request.getParameter("planTransportDate1");
		}
		String planTransportDate2 = null;
		if (StringUtils.isNotBlank(request.getParameter("planTransportDate2"))) {
			planTransportDate2 = request.getParameter("planTransportDate2");
		}
		// 线路
		Integer lineInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("lineInfoId"))) {
			lineInfoId = Integer.parseInt(request.getParameter("lineInfoId"));
		}
		// 运单状态
		Integer waybillStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("waybillStatus"))) {
			waybillStatus = Integer.parseInt(request.getParameter("waybillStatus"));
		}
		// 协同状态
		Integer cooperateStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("cooperateStatus"))) {
			cooperateStatus = Integer.parseInt(request.getParameter("cooperateStatus"));
		}

		// 2、封装参数
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("start", (page - 1) * rows);
		params.put("rows", rows);
		params.put("orgRootId", orgRootId);
		params.put("userRole", userRole);
		params.put("conditionGroup", conditionGroup);
		params.put("goodsInfoName", goodsInfoName);
		params.put("entrustName", entrustName);
		params.put("forwardingUnit", forwardingUnit);
		params.put("consignee", consignee);
		params.put("planTransportDate1", planTransportDate1);
		params.put("planTransportDate2", planTransportDate2);
		params.put("lineInfoId", lineInfoId);
		params.put("waybillStatus", waybillStatus);
		params.put("cooperateStatus", cooperateStatus);
		
		// 3、查询组织信息总数
		Integer totalNum = waybillInfoFacade.getLogisticsWaybillCountByParams(params);

		// 4、分页查询组织信息
		List<WaybillInfoPo> waybillInfoList = waybillInfoFacade.getLogisticsWaybillByParams(params);
				
		// 5、总数、分页信息封装
		waybillInfoPager.setTotal(totalNum);
		waybillInfoPager.setRows(waybillInfoList);
		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("waybillInfoPager", waybillInfoPager);
		return json;
	}
	
	/**
	 * 物流运单派发 - 企业货主派发
	 * @param request
	 * @return
	 */
	@RequestMapping("/businessOwnerDistribute")
	@ResponseBody
	public JSONObject businessOwnerDistribute(HttpServletRequest request){
		JSONObject json = null;
		try {
			// 从session中取出当前用户的主机构ID
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			
			// 主机构id
			Integer orgRootId = userInfo.getOrgRootId();
			
			// 用户id
			Integer userInfoId = userInfo.getId();
			
			// 运单id
			Integer id = null;
			if (StringUtils.isNotBlank(request.getParameter("id"))) {
				id = Integer.parseInt(request.getParameter("id"));
			}
			
			// 企业货主派发
			json = waybillInfoFacade.businessOwnerDistribute(orgRootId,userInfoId,id);
		} catch (Exception e) {
			e.printStackTrace();
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "企业货主派发失败");
		}
		
		return json;
	}
	/**
	 * 
	 * @Title: logisticsDistributeDriver  
	 * @Description: 物流公司选择一运单条数据，点击“派发司机”按钮,选择司机，点击保存
	 * @param request 
	 * @return void
	 * @throws 
	 */
	@RequestMapping("/logisticsDistributeDriver")
	@ResponseBody
	public JSONObject logisticsDistributeDriver(HttpServletRequest request){
		JSONObject json = null;
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		
		// 父运单编号（父运单主键）
		Integer waybillInfoId = null;
		if (params.get("waybillInfoId") != null) {
			waybillInfoId = Integer.valueOf(params.get("waybillInfoId").toString());
		}
		// 司机编号（司机主键）
		Integer driverInfoId = null;
		if (params.get("driverInfoId") != null) {
			driverInfoId = Integer.valueOf(params.get("driverInfoId").toString());
		}
		// 司机用户角色（1：内部司机 2：外协司机 3：临时司机）
		Integer driverUserRole = null;
		if (params.get("driverUserRole") != null) {
			driverUserRole = Integer.valueOf(params.get("driverUserRole").toString());
		}
		
		// 2、派发司机
		try {
			json = waybillInfoFacade.logisticsDistributeDriver(userInfo, waybillInfoId, driverInfoId, driverUserRole);
		} catch (Exception e) {
			log.error("运单派发异常", e);

			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "运单派发异常，请稍后重试");
		}
		return json;
	}
	
	/**
	 * 
	 * @Title: logisticsDistributedlogisticsCompany  
	 * @Description: 公司选择一运单条数据，点击“派发物流公司”按钮,弹出派发物流公司页面,保存
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/logisticsDistributedlogisticsCompany")
	@ResponseBody
	public JSONObject logisticsDistributedlogisticsCompany(HttpServletRequest request){
		
		/**
		 * 派发物流公司支持批量派发
		 */
		JSONObject json = new JSONObject();
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 1、获取并处理参数
		// 父运单编号（父运单主键）
//		Integer waybillInfoId = null;
//		if (request.getParameter("waybillInfoId") != null) {
//			waybillInfoId = Integer.parseInt(request.getParameter("waybillInfoId"));
//		}
		// 运单id集合
		List<Integer> waybillInfoIdList = null;
		if (request.getParameter("waybillInfoIds") != null) {
			String a = request.getParameter("waybillInfoIds");
			String[] b = a.split(",");
			waybillInfoIdList = new ArrayList<Integer>();
			for (int i = 0; i < b.length; i++) {
				waybillInfoIdList.add(Integer.valueOf(b[i]));
			}
		}
		if (waybillInfoIdList == null || waybillInfoIdList.size() == 0) {
			json.put("success", false);
			json.put("msg", "请选择数据");
			return json;
		}
		// 合同编号
		Integer contractInfoId = null;
		if (request.getParameter("contractInfoId") != null) {
			contractInfoId = Integer.parseInt(request.getParameter("contractInfoId"));
		}
		
		// 2、派发物流公司
		try {
			//json = waybillInfoFacade.distributedlogisticsCompany(userInfo, waybillInfoId, contractInfoId);
			json = waybillInfoFacade.logisticCompaniesDistributeLogisticsCompanies(userInfo, waybillInfoIdList, contractInfoId);
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "运单派发异常，请稍后重试");
		}
		return json;
	}
	
	
	/**
	 * 
	 * @Title: getProxylist  
	 * @Description: 获取代理数据
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/getProxylist")
	@ResponseBody
	public JSONObject getProxylist(HttpServletRequest request){
		DataPager<TransportPrice> transportPricePager = new DataPager<TransportPrice>();

		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 企业货主查询条件：根据“主机构ID”和“条件组（condition_group）”字段查询。
		// 物流公司查询条件：根据“主机构ID”匹配承运方主机构（乙方）和“条件组（condition_group）”字段查询。
		Integer orgRootId = userInfo.getOrgRootId();
		//Integer userRole = userInfo.getUserRole();
		Integer userInfoId = userInfo.getId();
		StringBuffer buffer = new StringBuffer();
		List<UserDataAuthPo> userDataAuthList = waybillInfoFacade.getUserDataAuthPoList(orgRootId, userInfoId);
		for (int i = 0; i < userDataAuthList.size(); i++) {
			if (i == 0) {
				buffer.append("'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			} else {
				buffer.append(",'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			}
		}
		String conditionGroup = buffer.toString();
		if (StringUtils.isBlank(conditionGroup)) {
			conditionGroup = null;
		}
		// 1、获取并处理参数
		// 页数
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.valueOf(request.getParameter("page"));
		}
		transportPricePager.setPage(page);

		// 行数
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.valueOf(request.getParameter("rows"));
		}
		transportPricePager.setSize(rows);
		
		//运单id
		Integer waybillInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("waybillInfoId"))) {
			waybillInfoId = Integer.parseInt(request.getParameter("waybillInfoId"));
		}
		// 代理方
		String proxyName = null;
		if (StringUtils.isNotBlank(request.getParameter("proxyName"))) {
			proxyName = request.getParameter("proxyName");
		}
		// 代理运价
		BigDecimal proxyPrice = null;
		if (StringUtils.isNotBlank(request.getParameter("proxyPrice"))) {
			proxyPrice = new BigDecimal(request.getParameter("proxyPrice"));
		}
		// 查询运单信息
		WaybillInfoPo info =  waybillInfoFacade.getById(waybillInfoId);
		/**
		 * 根据
		 * 主机构ID、
		 * 条件组、
		 * 派发的运单委托方、
		 * 货物、
		 * 线路、
		 * 发货单位、
		 * 到货单位，
		 * 以及计划拉运日期
		 * 匹配运价表（transport_price）的
		 * 委托方、
		 * 货物、
		 * 线路、
		 * 发货单位、
		 * 到货单位，
		 * 以及计划拉运日期在启用日期和结束日期之间且运价分类为“代理运价”，
		 * 优先级为最高，运价状态为“审核通过” 的代理方（proxy）、单位运价（元）（unit_price）字段数据
		 */
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("conditionGroup", conditionGroup);
		queryMap.put("entrust", info.getEntrust());
		queryMap.put("goodsInfoId", info.getGoodsInfoId());
		queryMap.put("lineInfoId", info.getLineInfoId());
		queryMap.put("forwardingUnit", info.getForwardingUnit());
		queryMap.put("consignee", info.getConsignee());
		queryMap.put("planTransportDate", info.getPlanTransportDate());
		queryMap.put("transportPriceClassify", 3);
		queryMap.put("transportPriceStatus", 3);
		queryMap.put("proxyName", proxyName);
		queryMap.put("proxyPrice", proxyPrice);
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		
		
		// 3、查询信息总数
		Integer totalNum = transportPriceFacade.getCountByParams(queryMap);

		// 4、分页查询信息
		List<TransportPrice> transportPriceList = transportPriceFacade.getListByParams(queryMap);
				
		// 5、总数、分页信息封装
		transportPricePager.setTotal(totalNum);
		transportPricePager.setRows(transportPriceList);
		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("transportPricePager", transportPricePager);
		
		return json;
	}
	/**
	 * 
	 * @Title: logisticsProxyDistributed  
	 * @Description: 物流公司选择一条运单数据，点击“代理派发”按钮
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/logisticsProxyDistributed")
	@ResponseBody
	public JSONObject logisticsProxyDistributed(HttpServletRequest request){
		JSONObject json = null;
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 主机构id orgRootId
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		StringBuffer buffer = new StringBuffer();
		List<UserDataAuthPo> userDataAuthList = waybillInfoFacade.getUserDataAuthPoList(orgRootId, userInfoId);
		for (int i = 0; i < userDataAuthList.size(); i++) {
			if (i == 0) {
				buffer.append("'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			} else {
				buffer.append(",'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			}
		}
		// 条件组 （根据登录用户主机构ID和登录用户ID查询用户数据权限表中的条件组字段）
		String conditionGroup = buffer.toString();
		if (StringUtils.isBlank(conditionGroup)) {
			conditionGroup = null;
		}
		
		// 1、获取并处理参数
		// 父运单编号（父运单主键）
		Integer waybillInfoId = null;
		if (request.getParameter("waybillInfoId") != null) {
			waybillInfoId = Integer.parseInt(request.getParameter("waybillInfoId"));
		}
		// 运价表编号
		Integer transportPriceId = null;
		if (request.getParameter("transportPriceId") != null) {
			transportPriceId = Integer.parseInt(request.getParameter("transportPriceId"));
		}
		// 司机编号
		Integer driverInfoId = null;
		if (request.getParameter("driverInfoId") != null) {
			driverInfoId = Integer.parseInt(request.getParameter("driverInfoId"));
		}
		// 司机角色
		Integer driverUserRole = null;
		if (request.getParameter("driverUserRole") != null) {
			driverUserRole = Integer.parseInt(request.getParameter("driverUserRole"));
		}
		// 运价 transportPrice
		BigDecimal transportPrice = null;
		if (StringUtils.isNotBlank(request.getParameter("transportPrice"))) {
			try {
				transportPrice = new BigDecimal(request.getParameter("transportPrice"));
				if (transportPrice.compareTo(new BigDecimal("0")) == -1){
					json = new JSONObject();
					json.put("success", false);
					json.put("msg", "运价必须是非负浮点数");
					return json;
				}
			} catch (Exception e) {
				json = new JSONObject();
				json.put("success", false);
				json.put("msg", "运价必须是非负浮点数");
				return json;
			}
			
		}
		
		
		// 2、代理派发
		try {
			json = waybillInfoFacade.logisticsProxyDistributed(userInfo, waybillInfoId, transportPriceId,
					driverInfoId,driverUserRole,transportPrice,conditionGroup);
		} catch (Exception e) {
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "运单派发异常，请稍后重试");
			e.printStackTrace();
		}
		return json;
	}
	
	
	/**
	 * 物流运单派发-撤回
	 * @param request
	 * @return
	 */
	@RequestMapping("/logisticsRetract")
	@ResponseBody
	public JSONObject logisticsRetract(HttpServletRequest request){
		JSONObject json = null;
		try {
			// 从session中取出当前用户的主机构ID
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			
			// 1、获取并处理参数
			// 运单id
			Integer id = null;
			if (StringUtils.isNotBlank(request.getParameter("id"))) {
				id = Integer.parseInt(request.getParameter("id"));
			}
			// 撤回
			json = waybillInfoFacade.logisticsRetract(userInfo, id);
		} catch (Exception e) {
			log.error(e.getMessage());
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "请求出现异常");
		}
		return json;
	}
	
	
	/**
	 * 
	 * @Title: getWaybillInfoList  
	 * @Description: 物流运单派发-获取运单信息
	 * @param request
	 * @param model
	 * @return String
	 * @throws  
	 */
	@RequestMapping("/getLogisticsReceiveWaybillInfoList")
	@ResponseBody
	public JSONObject getLogisticsReceiveWaybillInfoList(HttpServletRequest request){
		DataPager<WaybillInfoPo> waybillInfoPager = new DataPager<WaybillInfoPo>();

		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 企业货主查询条件：根据“主机构ID”和“条件组（condition_group）”字段查询。
		// 物流公司查询条件：根据“主机构ID”匹配承运方主机构（乙方）和“条件组（condition_group）”字段查询。
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userRole = userInfo.getUserRole();
		Integer userInfoId = userInfo.getId();
		StringBuffer buffer = new StringBuffer();
		List<UserDataAuthPo> userDataAuthList = waybillInfoFacade.getUserDataAuthPoList(orgRootId, userInfoId);
		for (int i = 0; i < userDataAuthList.size(); i++) {
			if (i == 0) {
				buffer.append("'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			} else {
				buffer.append(",'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			}
		}
		String conditionGroup = buffer.toString();
		if (StringUtils.isBlank(conditionGroup)) {
			conditionGroup = null;
		}
		// 1、获取并处理参数
		// 页数
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.valueOf(request.getParameter("page"));
		}
		waybillInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.valueOf(request.getParameter("rows"));
		}
		waybillInfoPager.setSize(rows);
		
		// 货物
		String goodsInfoName = null;
		if (StringUtils.isNotBlank(request.getParameter("goodsInfoName"))) {
			goodsInfoName = request.getParameter("goodsInfoName");
		}
		// 委托方
		String entrustName = null;
		if (StringUtils.isNotBlank(request.getParameter("entrustName"))) {
			entrustName = request.getParameter("entrustName");
		}
		// 发货单位
		String forwardingUnit = null;
		if (StringUtils.isNotBlank(request.getParameter("forwardingUnit"))) {
			forwardingUnit = request.getParameter("forwardingUnit");
		}
		// 到货单位
		String consignee = null;
		if (StringUtils.isNotBlank(request.getParameter("consignee"))) {
			consignee = request.getParameter("consignee");
		}
		// 计划拉运日期
		String planTransportDate1 = null;
		if (StringUtils.isNotBlank(request.getParameter("planTransportDate1"))) {
			planTransportDate1 = request.getParameter("planTransportDate1");
		}
		String planTransportDate2 = null;
		if (StringUtils.isNotBlank(request.getParameter("planTransportDate2"))) {
			planTransportDate2 = request.getParameter("planTransportDate2");
		}
		// 线路
		Integer lineInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("lineInfoId"))) {
			lineInfoId = Integer.parseInt(request.getParameter("lineInfoId"));
		}
		// 运单状态
		Integer waybillStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("waybillStatus"))) {
			waybillStatus = Integer.parseInt(request.getParameter("waybillStatus"));
		}
		// 协同状态
		Integer cooperateStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("cooperateStatus"))) {
			cooperateStatus = Integer.parseInt(request.getParameter("cooperateStatus"));
		}

		// 2、封装参数
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("start", (page - 1) * rows);
		params.put("rows", rows);
		params.put("orgRootId", orgRootId);
		params.put("userRole", userRole);
		params.put("conditionGroup", conditionGroup);
		params.put("goodsInfoName", goodsInfoName);
		params.put("entrustName", entrustName);
		params.put("forwardingUnit", forwardingUnit);
		params.put("consignee", consignee);
		params.put("planTransportDate1", planTransportDate1);
		params.put("planTransportDate2", planTransportDate2);
		params.put("lineInfoId", lineInfoId);
		params.put("waybillStatus", waybillStatus);
		params.put("cooperateStatus", cooperateStatus);
		
		// 3、查询组织信息总数
		Integer totalNum = waybillInfoFacade.getLogisticsReceiveWaybillCountByParams(params);

		// 4、分页查询组织信息
		List<WaybillInfoPo> waybillInfoList = waybillInfoFacade.getLogisticsReceiveWaybillByParams(params);
				
		// 5、总数、分页信息封装
		waybillInfoPager.setTotal(totalNum);
		waybillInfoPager.setRows(waybillInfoList);
		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("waybillInfoPager", waybillInfoPager);
		return json;
	}
	// 合同信息表contract_info
	
	
	/**
	 * 
	 * @Title: getContractInfos  
	 * @Description: 获取合同信息
	 * @param request
	 * @return 
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/getContractInfos")
	@ResponseBody
	public JSONObject getContractInfos(HttpServletRequest request){
		


		// 从session中取出当前用户的主机构ID
		//UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		//Integer orgRootId = userInfo.getOrgRootId();
		
		// 1、获取并处理参数
		// 页数
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.valueOf(request.getParameter("page"));
		}


		// 行数
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.valueOf(request.getParameter("rows"));
		}

		
		// 承运方主机构(shipper_org_root)
		String shipperOrgRootName = null;
		if (StringUtils.isNotBlank(request.getParameter("shipperOrgRootName"))) {
			shipperOrgRootName = request.getParameter("shipperOrgRootName");
		}
		// 承运方(shipper)
		String shipperName = null;
		if (StringUtils.isNotBlank(request.getParameter("shipperName"))) {
			shipperName = request.getParameter("shipperName");
		}

		
		// 运单主键集合 waybillInfoIds
		List<Integer> waybillInfoIds = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("waybillInfoIds"))) {
			String a = request.getParameter("waybillInfoIds");
			String[] b = a.split(",");
			for (String string : b) {
				waybillInfoIds.add(Integer.valueOf(string));
			}
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		//queryMap.put("orgRootId", orgRootId);
		queryMap.put("shipperOrgRootName", shipperOrgRootName);
		queryMap.put("shipperName", shipperName);
		//queryMap.put("contractClassify", 2);
		//queryMap.put("contractStatus", 8);
		queryMap.put("waybillInfoIds", waybillInfoIds);
		
		JSONObject json;
		try {
			json = waybillInfoFacade.getContractListByParams(queryMap);
		} catch (Exception e) {
			e.printStackTrace();
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "服务出现异常");
		}

		
		return json;
	}
	
	
	/**
	 * 
	 * @Title: getWaybillById  
	 * @Description: 查询运单信息
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/getWaybillById")
	@ResponseBody
	public JSONObject getWaybillById(HttpServletRequest request){
		// 1、接受参数
		Integer id = null;
		if (request.getParameter("id") != null) {
			id = Integer.parseInt(request.getParameter("id"));
		}
		
		WaybillInfoPo info = waybillInfoFacade.getById(id);
		
		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("data", info);
		return json;
	}
	
	/**
	 * 查看派发后的运单信息
	 * @param request
	 * @return
	 */
	@RequestMapping("/getSonWaybillByParentId")
	@ResponseBody
	public JSONObject getSonWaybillByParentId(HttpServletRequest request){
		JSONObject json = new JSONObject();
		
		// 父运单id
		Integer id = null;
		if (request.getParameter("id") != null) {
			id = Integer.parseInt(request.getParameter("id"));
		}
		
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("parentWaybillInfoId", id);
		
		try {
			WaybillInfoPo info = waybillInfoFacade.getSonWaybillByParentId(params);
			if (info == null) {
				json.put("success", false);
				json.put("msg", "当前运单未派发");
				return json;
			}
			json.put("success", true);
			json.put("data", info);
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "服务异常");
		}
		return json;
	}
	
	
	@RequiresPermissions("waybill:Scattered:view")
	@RequestMapping("/bulkcargowaybill")
	public String bulkcargowaybill(HttpServletRequest request, Model model) {
		return "template/waybillInfo/bulk-cargo-waybill";
	}

	/**
	 * 根据当前用户的主机构ID匹配运单表里的承运方主机构字段查询运单信息
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping("/getBulkCargoWaybillList")
	@ResponseBody
	public JSONObject getBulkCargoWaybillList(HttpServletRequest request, HttpServletResponse response) {
		
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute( "userInfo");
		
		// 获取参数
		// 货物
		String goodsName = null;
		if (StringUtils.isNotBlank(request.getParameter("goodsName"))){
			goodsName = request.getParameter("goodsName");
		}
		// 委托方
		String entrustName = null;
		if (StringUtils.isNotBlank(request.getParameter("entrustName"))){
			entrustName = request.getParameter("entrustName");
		}
		// 承运方
		String shipperName = null;
		if (StringUtils.isNotBlank(request.getParameter("shipperName"))){
			shipperName = request.getParameter("shipperName");
		}
		// 发货单位
		String forwardingUnit = null;
		if (StringUtils.isNotBlank(request.getParameter("forwardingUnit"))){
			forwardingUnit = request.getParameter("forwardingUnit");
		}
		// 到货单位
		String consignee = null;
		if (StringUtils.isNotBlank(request.getParameter("consignee"))){
			consignee = request.getParameter("consignee");
		}
		// 线路
		Integer lineId = null;
		if (StringUtils.isNotBlank(request.getParameter("lineId"))){
			lineId = Integer.parseInt(request.getParameter("lineId"));
		}
		// 拉运日期
		String planTransportDateStart = null;
		if (StringUtils.isNotBlank(request.getParameter("planTransportDateStart"))){
			planTransportDateStart = request.getParameter("planTransportDateStart");
		}
		String planTransportDateEnd = null;
		if (StringUtils.isNotBlank(request.getParameter("planTransportDateEnd"))){
			planTransportDateEnd = request.getParameter("planTransportDateEnd");
		}
		// 运单状态
		Integer waybillStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("waybillStatus"))){
			waybillStatus = Integer.parseInt(request.getParameter("waybillStatus"));
		}
		// 协同状态
		Integer cooperateStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("cooperateStatus"))){
			cooperateStatus = Integer.parseInt(request.getParameter("cooperateStatus"));
		}
		// page
		Integer page = null;
		if (StringUtils.isNotBlank(request.getParameter("page"))){
			page = Integer.parseInt(request.getParameter("page"));
		}
		// rows
		Integer rows = null;
		if (StringUtils.isNotBlank(request.getParameter("rows"))){
			rows = Integer.parseInt(request.getParameter("rows"));
		}
		
		// 整合参数
		Map<String, Object> params = new HashMap<String,Object>();
		params.put("orgRootId", userInfo.getOrgRootId());
		params.put("goodsName", goodsName);
		params.put("entrustName", entrustName);
		params.put("shipperName", shipperName);
		params.put("forwardingUnit", forwardingUnit);
		params.put("consignee", consignee);
		params.put("lineId", lineId);
		params.put("planTransportDateStart", planTransportDateStart);
		params.put("planTransportDateEnd", planTransportDateEnd);
		params.put("waybillStatus", waybillStatus);
		params.put("cooperateStatus", cooperateStatus);
		params.put("start", (page - 1) * rows);
		params.put("rows", rows);
		
		// 查询
		List<WaybillInfoPo> list = waybillInfoFacade.getBulkCargoWaybillByParams(params);
		
		// 查询数量
		Integer total = waybillInfoFacade.getBulkCargoWaybillCountByParams(params);
		
		JSONObject json = new JSONObject();
		json.put("success", true);
		json.put("list", list);
		json.put("total", total);
		return json;
	}

	/**
	 * 根据当前用户的主机构ID匹配运单表里的承运方主机构字段查询运单信息记录数
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/findAllWaybillInfoCount", produces = "application/json;charset=utf-8")
	@ResponseBody
	public int findAllWaybillInfoCount(HttpServletRequest request,
			HttpServletResponse response) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute(
				"userInfo");
		Integer orgRootId = userInfo.getOrgRootId();

		Map<String, Object> params = this.paramsToMap(request);
		params.put("orgRootId", orgRootId);
		params.put("spiks", Integer.parseInt((String) params.get("page"))
				* Integer.parseInt((String) params.get("rows")));
		int count = waybillInfoFacade.findAllWaybillInfoCount(params);
		return count;
	}
	
	
	/**
	 * 查询运单状态
	 * @param request
	 * @return
	 */
	@RequestMapping("/getWaybillStatusForBulkCargo")
	@ResponseBody
	public JSONObject getWaybillStatusForBulkCargo(HttpServletRequest request){
		JSONObject json = null;
		// 接收参数
		Integer id = Integer.parseInt(request.getParameter("id"));
		json = waybillInfoFacade.getWaybillStatusForBulkCargo(id);
		return json;
	}
	/**
	 * 根据用户选择的运单ID，查询运单的详细信息
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/findWaybillById", produces = "application/json; charset=utf-8")
	@ResponseBody
	public WaybillInfoPo findWaybillById(HttpServletRequest request,HttpServletResponse response) {

		// 获取运单ID
		Integer id = Integer.parseInt(request.getParameter("id"));
		WaybillInfoPo waybillInfo = new WaybillInfoPo();
		waybillInfo = waybillInfoFacade.findWaybillById(id);

		return waybillInfo;
	}

	/**
	 * 运单派发，根据用户选中的运单，派发给承运的司机
	 * 
	 * @param request
	 * @param response
	 * @param waybillModel
	 * @return
	 */
	@RequestMapping(value = "/addWaybillInfo", produces = "application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addWaybillInfo(HttpServletRequest request,
			HttpServletResponse response, WaybillInfoModel waybillModel) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute(
				"userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		JSONObject jsonObj = new JSONObject();
		jsonObj = waybillInfoFacade.addWaybillInfo(userInfoId, orgRootId,
				waybillModel);
		return jsonObj;

	}

	/**
	 * 零散货物运单派发，根据用户选中的运单，派发给承运的司机
	 * @param request
	 * @param response
	 * @param waybillModel
	 * @return
	 */
	@RequestMapping("/bulkCargoDistribute")
	@ResponseBody
	public JSONObject bulkCargoDistribute(HttpServletRequest request, HttpServletResponse response) {
		JSONObject json = null;
		
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute( "userInfo");

		// 获取参数
		// 运单id
		Integer waybillId = null;
		if (StringUtils.isNotBlank(request.getParameter("waybillId"))) {
			waybillId = Integer.parseInt(request.getParameter("waybillId"));
		}
		// 司机角色
		Integer driverUserRole = null;
		if (StringUtils.isNotBlank(request.getParameter("driverUserRole"))) {
			driverUserRole = Integer.parseInt(request.getParameter("driverUserRole"));
		}
		// 司机id
		Integer driverInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("driverInfoId"))) {
			driverInfoId = Integer.parseInt(request.getParameter("driverInfoId"));
		}
		// 当前运价
		BigDecimal currentTransportPrice = null;
		if (StringUtils.isNotBlank(request.getParameter("currentTransportPrice"))) {
			currentTransportPrice = new BigDecimal(request.getParameter("currentTransportPrice"));
		}
		try {
			Map<String, Object> params = new HashMap<String,Object>();
			params.put("userInfo", userInfo);
			params.put("waybillId", waybillId);
			params.put("driverUserRole", driverUserRole);
			params.put("driverInfoId", driverInfoId);
			params.put("currentTransportPrice", currentTransportPrice);
			json = waybillInfoFacade.bulkCargoDistributeDriver(userInfo, waybillId, driverUserRole, driverInfoId, currentTransportPrice);
		} catch (Exception e) {
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "运单派发失败!");
			e.printStackTrace();
		}
		return json;

	}

	/**
	 * 运单派发后撤回，将当前运单设置成新建，派发出去的运单设置成撤回。
	 * 
	 * @param response
	 * @param request
	 * @return
	 */
	@RequestMapping("/bulkCargoRevoke")
	@ResponseBody
	public JSONObject bulkCargoRevoke(HttpServletRequest request) {
		JSONObject json = null;
		
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute( "userInfo");
		
		// 获取参数
		// 运单id
		Integer id = Integer.parseInt(request.getParameter("id"));
		
		try {
			json = waybillInfoFacade.bulkCargoRevoke(userInfo,id);
		} catch (Exception e) {
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "运单撤回失败!");
			e.printStackTrace();
		}

		return json;
	}

	/**
	 * 撤回的运单再次派发，可以修改运单的承运司机和运费
	 * 
	 * @param response
	 * @param request
	 * @return
	 */
//	@RequestMapping(value = "/updateWaybillInfo", produces = "application/json;charset=utf-8")
//	@ResponseBody
//	public JSONObject updateWaybillInfo(HttpServletResponse response,
//			HttpServletRequest request, WaybillInfoModel waybillModel) {
//		JSONObject jsonObj = new JSONObject();
//		jsonObj = waybillInfoFacade.recallWaybillInfo(waybillModel
//				.getWaybillInfoPo());
//		return jsonObj;
//	}
	
	/**
	 * 查询线路信息列表
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/selectAllLineInfo", produces = "application/json;charset=utf-8")
	@ResponseBody
	public List<Map<String, Object>> selectAllLineInfo(HttpServletRequest request,
			HttpServletResponse response) {

		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Map<String, Object> params = this.paramsToMap(request);
		params.put("spiks", Integer.parseInt((String) params.get("page"))
				* Integer.parseInt((String) params.get("rows")));
		list = waybillInfoFacade.selectAllLineInfo(params);
		return list;
	}
	
	/**
	 * 查询线路信息列表记录数
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/selectAllLineInfoCount", produces = "application/json;charset=utf-8")
	@ResponseBody
	public int selectAllLineInfoCount(HttpServletRequest request,
			HttpServletResponse response) {
		
		Map<String, Object> params = this.paramsToMap(request);

		params.put("spiks", Integer.parseInt((String) params.get("page"))
				* Integer.parseInt((String) params.get("rows")));
		int count = waybillInfoFacade.selectAllLineInfoCount(params);
		return count;
	}
	
	/**
	 * 查询司机信息列表
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/selectAllDriverInfo", produces = "application/json;charset=utf-8")
	@ResponseBody
	public List<Map<String, Object>> selectAllDriverInfo(HttpServletRequest request,
			HttpServletResponse response) {

		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Map<String, Object> params = this.paramsToMap(request);
		params.put("spiks", Integer.parseInt((String) params.get("page"))
				* Integer.parseInt((String) params.get("rows")));
		list = waybillInfoFacade.selectAllDriverInfo(params);
		return list;
	}
	
	/**
	 * 查询司机信息列表记录数
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/selectAllDriverInfoCount", produces = "application/json;charset=utf-8")
	@ResponseBody
	public int selectAllDriverInfoCount(HttpServletRequest request,
			HttpServletResponse response) {
		
		Map<String, Object> params = this.paramsToMap(request);

		params.put("spiks", Integer.parseInt((String) params.get("page"))
				* Integer.parseInt((String) params.get("rows")));
		int count = waybillInfoFacade.selectAllDriverInfoCount(params);
		return count;
	}
	
	
	/**
	 * 获取线路信息列表集合
	 * @param request
	 * @return
	 */
	@RequestMapping("/getLineList")
	@ResponseBody
	public JSONObject getLineList(HttpServletRequest request){
		JSONObject json = new JSONObject();
		  
		// 获取处理参数
		// page
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))) {
			page = Integer.parseInt(request.getParameter("page"));
		}
		// rows
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))) {
			rows = Integer.parseInt(request.getParameter("rows"));
		}
		// 线路名称
		String lineInfoName = null;
		if (StringUtils.isNotBlank(request.getParameter("lineInfoName"))) {
			lineInfoName = request.getParameter("lineInfoName");
		}
		// 起点
		String startPoints = null;
		if (StringUtils.isNotBlank(request.getParameter("startPoints"))) {
			startPoints = request.getParameter("startPoints");
		}
		// 终点
		String endPoints = null;
		if (StringUtils.isNotBlank(request.getParameter("endPoints"))) {
			endPoints = request.getParameter("endPoints");
		}
		 
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("lineInfoName", lineInfoName);
		queryMap.put("startPoints", startPoints);
		queryMap.put("endPoints", endPoints);
		
		try {
			Integer lineListCount = waybillInfoFacade.getLineListCount(queryMap);
			List<LineInfoPo> lineList = waybillInfoFacade.getLineList(queryMap);
			json.put("success", true);
			json.put("msg", "获取线路信息成功");
			json.put("total", lineListCount);
			json.put("list", lineList);
		} catch (Exception e) {
			
			json.put("success", false);
			json.put("msg", "获取线路信息异常");
		}
		
		return json;
	}
	
	
	/**
	 * @Title: calculateDaysForSplitPlan  
	 * @Description: 运单生成-计划拆分-计算默认最大天数  
	 * @author zhenghaiyang
	 * @param request
	 * @return JSONObject    返回类型  
	 * @throws
	 */
	@RequestMapping("/calculateDaysForSplitPlan")
	@ResponseBody
	public JSONObject calculateDaysForSplitPlan(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		
		// 计划信息id
		Integer planInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("planInfoId"))) {
			planInfoId = Integer.valueOf(request.getParameter("planInfoId"));
		}
		
		Map<String, Object> params = new HashMap<String,Object>();
		params.put("id",planInfoId);
		try {
			Integer days = waybillInfoFacade.calculateDaysForSplitPlan(planInfoId);
			jo.put("success", true);
			jo.put("data", days);
		} catch (Exception e) {
			e.printStackTrace();
			jo.put("success", false);
			jo.put("msg", "日期计算失败");
		}
		return jo;
		
	}
	
	/**
	 * @Title: showWaybillQueryPage  
	 * @Description: 显示运单查询界面
	 * @author zhennghaiyang
	 * @param request
	 * @return String    返回类型  
	 * @throws
	 */
	@RequestMapping("/showWaybillQueryPage")
	public String showWaybillQueryPage(){
		return "template/waybillInfo/waybill-query";
	}
	
	/**
	 * @Title: getWaybillQueryData  
	 * @Description: 运单查询-获取数据  
	 * @param request
	 * @return JSONObject    返回类型  
	 * @throws
	 */
	@RequestMapping("/getWaybillQueryData")
	@ResponseBody
	public JSONObject getWaybillQueryData(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		
		// 从session中获取用户信息
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// page
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))){
			page = Integer.parseInt(request.getParameter("page"));
		}
		// rows
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))){
			rows = Integer.parseInt(request.getParameter("rows"));
		}
		// 用户id
		Integer userInfoId = userInfo.getId();
		// 用户角色
		Integer userRole = userInfo.getUserRole();
		// 主机构
		Integer orgRootId = userInfo.getOrgRootId();	

		//数据权限
		String userDataAuth = null;
		StringBuffer buffer = new StringBuffer();
		List<UserDataAuthPo> userDataAuthList = waybillInfoFacade.getUserDataAuthPoList(orgRootId, userInfoId);
		for (int i = 0; i < userDataAuthList.size(); i++) {
			if (i == 0) {
				buffer.append("'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			} else {
				buffer.append(",'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			}
		}
		userDataAuth = buffer.toString();
		if (StringUtils.isBlank(userDataAuth)) {
			userDataAuth = null;
		}
		
		// 运单编号
		String waybillId = null;
		if (StringUtils.isNotBlank(request.getParameter("waybillId"))) {
			waybillId = request.getParameter("waybillId");
		}
		// 货物
		String goodsInfoName = null;
		if (StringUtils.isNotBlank(request.getParameter("goodsInfoName"))) {
			goodsInfoName = request.getParameter("goodsInfoName");
		}
		// 委托方
		String entrustName = null;
		if (StringUtils.isNotBlank(request.getParameter("entrustName"))) {
			entrustName = request.getParameter("entrustName");
		}
		// 司机名称
		String driverName = null;
		if (StringUtils.isNotBlank(request.getParameter("driverName"))) {
			driverName = request.getParameter("driverName");
		}
		// 发货单位
		String forwardingUnit = null;
		if (StringUtils.isNotBlank(request.getParameter("forwardingUnit"))) {
			forwardingUnit = request.getParameter("forwardingUnit");
		}
		// 到货单位
		String consignee = null;
		if (StringUtils.isNotBlank(request.getParameter("consignee"))) {
			consignee = request.getParameter("consignee");
		}
		// 计划拉运日期
		String planTransportDate1 = null;
		if (StringUtils.isNotBlank(request.getParameter("planTransportDate1"))) {
			planTransportDate1 = request.getParameter("planTransportDate1");
		}
		String planTransportDate2 = null;
		if (StringUtils.isNotBlank(request.getParameter("planTransportDate2"))) {
			planTransportDate2 = request.getParameter("planTransportDate2");
		}
		// 线路
		Integer lineInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("lineInfoId"))) {
			lineInfoId = Integer.parseInt(request.getParameter("lineInfoId"));
		}
		// 运单状态
		Integer waybillStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("waybillStatus"))) {
			waybillStatus = Integer.parseInt(request.getParameter("waybillStatus"));
		}
		// 协同状态
		Integer cooperateStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("cooperateStatus"))) {
			cooperateStatus = Integer.parseInt(request.getParameter("cooperateStatus"));
		}
		// 角色
		Integer role = null;
		if (StringUtils.isNotBlank(request.getParameter("role"))) {
			role = Integer.parseInt(request.getParameter("role"));
		}
		
		// 根据角色  根据委托方 和 承运方 查询数据
		
		// 封装参数
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("start",(page - 1) * rows);
		params.put("rows", rows);
		params.put("userRole", userRole);
		params.put("orgRootId", orgRootId);
		params.put("userDataAuth", userDataAuth);
		params.put("waybillId", waybillId);
		params.put("goodsName", goodsInfoName);
		params.put("entrustName", entrustName);
		params.put("driverName", driverName);
		params.put("forwardingUnit", forwardingUnit);
		params.put("consignee", consignee);
		params.put("planTransportDateStart", planTransportDate1);
		params.put("planTransportDateEnd", planTransportDate2);
		params.put("lineInfoId", lineInfoId);
		params.put("waybillStatus", waybillStatus);
		params.put("cooperateStatus", cooperateStatus);
		params.put("role", role);

		// 如果是物流公司 ， 查询父运单编号
		/*
		if (userRole == 1 || userRole == 2) {
			String waybillInfoIds = null; // 父运单编号
			List<Integer> idList = waybillInfoFacade.getWaybillInfoIdByParams(params);
			if (idList != null && idList.size() > 0) {
				StringBuffer buffer1 = new StringBuffer();
				for (int i = 0; i < idList.size(); i++) {
					if (i == 0) {
						buffer1.append(idList.get(i));
					} else {
						buffer1.append(",").append(idList.get(i));
					}
				}
				waybillInfoIds = buffer1.toString();
				if (StringUtils.isBlank(waybillInfoIds)) {
					waybillInfoIds = null;
				}
				params.put("waybillInfoIds", waybillInfoIds);
			}
		}
		*/
		//  数量
		Integer count = waybillInfoFacade.getDataCountForWaybillQuery(params);
			
		// 数据
		List<WaybillInfoPo> waybillList = waybillInfoFacade.getDataListForWaybillQuery(params);
		
		jo.put("success", true);
		jo.put("count", count);
		jo.put("list", waybillList);

		return jo;
	}
	
	
	/**
	 * @Title: getWaybillQueryData  
	 * @Description: 运单查询-获取数据  
	 * @param request
	 * @return JSONObject    返回类型  
	 * @throws
	 */
	@RequestMapping("/getWaybillQueryData_scroll")
	@ResponseBody
	public JSONObject getWaybillQueryData_scroll(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		Integer page = 1;
		if (StringUtils.isNotBlank(request.getParameter("page"))){
			page = Integer.parseInt(request.getParameter("page"));
		}
		// rows
		Integer rows = 10;
		if (StringUtils.isNotBlank(request.getParameter("rows"))){
			rows = Integer.parseInt(request.getParameter("rows"));
		}
		// 从session中获取用户信息
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 用户id
		Integer userInfoId = userInfo.getId();
		// 用户角色
		Integer userRole = userInfo.getUserRole();
		// 主机构
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 封装参数
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("start",(1 - page) * rows);
		params.put("rows", rows);
		params.put("userInfoId", userInfoId);
		params.put("userRole", userRole);
		params.put("orgRootId", orgRootId);
		
		//  数量
		Integer count = waybillInfoFacade.getDataCountForWaybillQuery_scroll(params);
			
		// 数据
		List<WaybillInfoPo> waybillList = waybillInfoFacade.getDataListForWaybillQuery_scroll(params);
		
		jo.put("success", true);
		jo.put("count", count);
		jo.put("list", waybillList);

		return jo;
	}
	
	/**
	 * @Title: showFormForPrint  
	 * @Description: 测试
	 * @param request
	 * @return String    返回类型  
	 * @throws
	 */
	@RequestMapping("/showWaybillDetailPageForPrint")
	public String showWaybillDetailPageForPrint(HttpServletRequest request,Model model){
		
		Integer id = null;
		if (StringUtils.isNotBlank(request.getParameter("id"))) {
			id = Integer.valueOf(request.getParameter("id"));
		}
		Integer.valueOf(request.getParameter("id"));
		WaybillInfoPo info = waybillInfoFacade.getWaybillInfoById(id);
		model.addAttribute("waybillInfo", info);
		
		return "template/waybillInfo/waybillDetailPageForPrint";
	}
	
	
	
	/**
	 * @Title: showWaybillReport  
	 * @Description: 显示运单统计报表
	 * @return String
	 * @throws
	 */
	@RequestMapping("/showWaybillReport")
	public String showWaybillReport(){
		return "template/reportForm/waybill/show_waybill_report_form";
	}
	/**
	 * @Title: getDataForWaybillReport  
	 * @Description: 获取报表数据
	 * @author zhenghaiyang
	 * @param request
	 * @return JSONObject    返回类型  
	 * @throws
	 */
	@RequestMapping("/getDataForWaybillReport")
	@ResponseBody
	public JSONObject getDataForWaybillReport(HttpServletRequest request){
		JSONObject json = null;
		
		// 从session中获取用户信息
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");

		
		// 主机构
		Integer orgRootId = userInfo.getOrgRootId();
		// 用户id
		Integer userInfoId = userInfo.getId();

		// 用户数据权限
		String userDataAuth = null;

		StringBuffer buffer = new StringBuffer();
		List<UserDataAuthPo> userDataAuthList = waybillInfoFacade.getUserDataAuthPoList(orgRootId, userInfoId);
		for (int i = 0; i < userDataAuthList.size(); i++) {
			if (i == 0) {
				buffer.append("'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			} else {
				buffer.append(",'").append(userDataAuthList.get(i).getConditionGroup()).append("'");
			}
		}
		userDataAuth = buffer.toString();
		if (StringUtils.isBlank(userDataAuth)) {
			userDataAuth = null;
		}
		
		// 时间1
		String startDate = null;
		if (StringUtils.isNotBlank(request.getParameter("startDate"))) {
			startDate = request.getParameter("startDate");
		}
		// 时间2
		String endDate = null;
		if (StringUtils.isNotBlank(request.getParameter("endDate"))) {
			endDate = request.getParameter("endDate");
		}
		// 年份
		String year = null;
		if (StringUtils.isNotBlank(request.getParameter("year"))) {
			year = request.getParameter("year");
		}
		
		// 封装参数
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("orgRootId", orgRootId);
		params.put("userDataAuth", userDataAuth);
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		params.put("year", year);
		
		try {
			json = waybillInfoFacade.getDataForWaybillReport(params);
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "报表数据查询出现异常");
		}
		
		return json;
	}
	
	/**
	 * @Title: showStartEndMapReport  
	 * @Description: 
	 * @return String 
	 * @throws
	 */
	@RequestMapping("/showStartEndMapReport")
	public String showStartEndMapReport(){
		return "template/reportForm/waybill/start_end_map";
	}
	
	@RequestMapping("/getDataForStartEndMap")
	@ResponseBody
	public JSONObject getDataForStartEndMap(HttpServletRequest request){
		
		JSONObject json = null;
		
		Map<String, Object> params = new HashMap<String, Object>();
		try {
			json = waybillInfoFacade.getDataForStartEndMap(params);
		} catch (Exception e) {
			log.error(e.getMessage());
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "报表数据查询出现异常");
		}
		
		return json;
	}
	
	/**
	 * @Title: getPlanInfoById  
	 * @Description: 根据id获取计划信息
	 * @author zhenghaiyang
	 * @param request
	 * @return JSONObject 
	 * @throws
	 */
	@RequestMapping("/getPlanInfoById")
	@ResponseBody
	public JSONObject getPlanInfoById(HttpServletRequest request){
		JSONObject json = new JSONObject();
		Integer id = null;
		if (StringUtils.isNotBlank(request.getParameter("id"))) {
			id = Integer.valueOf(request.getParameter("id"));
		}
		try {
			// 查询计划信息
			PlanInfoPo info = planInfoFacade.getPlanInfoById(id);
			json.put("success", true);
			json.put("data", info);
		} catch (Exception e) {
			json.put("success", false);
			json.put("msg", "请求出现异常");
		}
		return json;
	}
	
	/**
	 * @Title: getPlanInfoById  
	 * @Description: 生成日计划
	 * @author zhenghaiyang
	 * @param request
	 * @return JSONObject 
	 * @throws
	 */
	@RequestMapping("/saveTransportDayPlan")
	@ResponseBody
	public JSONObject saveTransportDayPlan(HttpServletRequest request){
		JSONObject json = null;
		try {
			// 1、从session中获取用户信息
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			if (userInfo == null) {
				json = new JSONObject();
				json.put("success", false);
				json.put("msg", "请重新登陆用户");
				return json;
			}
			
			// 2、获取并处理参数
			// 日计划id
			String id = null;
			if (request.getParameter("id") != null) {
				id = request.getParameter("id");
			}
			// 计划id
			String planInfoId = null;
			if (request.getParameter("planInfoId") != null) {
				planInfoId = request.getParameter("planInfoId");
			}
			// 日计划-开始日期
			String tranStartDate = null;
			if (request.getParameter("tranStartDate") != null) {
				tranStartDate = request.getParameter("tranStartDate");
			}
			// 日计划-结束日期
			String tranEndDate = null;
			if (request.getParameter("tranEndDate") != null) {
				tranEndDate = request.getParameter("tranEndDate");
			}
			// 日计划日期
			String planDate = null;
			if (request.getParameter("planDate") != null) {
				planDate = request.getParameter("planDate");
			}
			// 日计划运量
			String transportAmount = null;
			if (request.getParameter("transportAmount") != null) {
				transportAmount = request.getParameter("transportAmount");
			}
			// 操作类型
			String opType = null;
			if (request.getParameter("opType") != null) {
				opType = request.getParameter("opType");
			}
			// 3、封装参数
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("id", id);
			params.put("planInfoId", planInfoId);
			params.put("tranStartDate", tranStartDate);
			params.put("tranEndDate", tranEndDate);
			params.put("planDate", planDate);
			params.put("transportAmount", transportAmount);
			params.put("opType", opType);
			
			// 保存数据
			json = transportDayPlanFacade.saveTransportDayPlan(userInfo,params);
		} catch (Exception e) {
			//log.error(e.getMessage());
			e.printStackTrace();
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "请求出现异常");
		}
		return json;
	}
	
	/**
	 * @Title: getTransportDayPlanById  
	 * @Description: 根据id获得日计划想
	 * @author zhenghaiyang 2017年9月8日 下午3:55:24
	 * @param request
	 * @return JSONObject
	 * @throws
	 */
	@RequestMapping("/getTransportDayPlanById")
	@ResponseBody
	public JSONObject getTransportDayPlanById(HttpServletRequest request){
		JSONObject json = new JSONObject();
		try {
			// 获取参数
			Integer id = null;
			if (StringUtils.isNotBlank(request.getParameter("id"))) {
				id = Integer.valueOf(request.getParameter("id"));
			}
			// 查询日计划信息
			TransportDayPlanPo info = transportDayPlanFacade.selectTransportDayPlanById(id);
			json.put("success", true);
			json.put("data", info);
		} catch (Exception e) {
			//log.error(e.getMessage());
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "服务请求出现异常");
		}
		
		return json;
	}
	
	/**
	 * @Title: deleteTransportDayPlan  
	 * @Description: 删除日计划信息
	 * @author zhenghaiyang 2017年9月8日 下午6:16:58
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/deleteTransportDayPlan")
	@ResponseBody
	public JSONObject deleteTransportDayPlan(HttpServletRequest request){
		JSONObject json = null;
		try {
			// 从session中获取当前登陆用户信息
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			
			// 获取并处理参数
			String ids = null;
			if (request.getParameter("ids") != null) {
				ids = request.getParameter("ids");
			}
			// 删除日计划
			json = transportDayPlanFacade.deleteTransportDayPlan(userInfo, ids);
			
		} catch (Exception e) {
			json = new JSONObject();
			//log.error(e.getMessage());
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "服务请求出现异常");
		}
		return json;
	}
	
	/**
	 * @Title: updateWaybillInfo  
	 * @Description: 修改运单想休息
	 * @author zhenghaiyang 2017年9月11日 下午6:15:12
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/updateWaybillInfo")
	@ResponseBody
	public JSONObject updateWaybillInfo(HttpServletRequest request){
		JSONObject json = null;
		try {
			// 从session中获取当前登陆用户信息
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			
			// 接受并处理参数
			// 运单主键
			String id = null;
			if (request.getParameter("id") != null) {
				id = request.getParameter("id");
			}
			// 计划拉运量
			String planTransportAmountStr = null;
			if (request.getParameter("planTransportAmount") != null) {
				planTransportAmountStr = request.getParameter("planTransportAmount");
			}
			
			// 封装参数
			Map<String, String> params = new HashMap<String,String>();
			params.put("id", id);
			params.put("planTransportAmountStr", planTransportAmountStr);
			
			// 修改信息
			json = waybillInfoFacade.updateWaybillPlanTransportAmount(userInfo, params);
			
		} catch (Exception e) {
			//log.error(e.getMessage());
			e.printStackTrace();
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "服务请求出现异常");
		}
		return json;
	}
	
	/**
	 * @Title: distributePlatform  
	 * @Description: 派发平台
	 * @author zhenghaiyang 2017年9月12日 下午4:46:28
	 * @param request
	 * @return
	 * @return JSONObject
	 */
	@RequestMapping("/distributePlatform")
	@ResponseBody
	public JSONObject distributePlatform(HttpServletRequest request){
		JSONObject json = null;
		try {
			// 从session中获取当前登陆用户信息
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			
			// 接受参数
			// 运单id
			String waybillInfoId = null;
			if (request.getParameter("waybillInfoId") != null) {
				waybillInfoId = request.getParameter("waybillInfoId");
			}
			// 运单报价截止日期
			String offerEndDate = null;
			if (request.getParameter("offerEndDate") != null) {
				offerEndDate = request.getParameter("offerEndDate");
			}
			
			// 封装参数
			Map<String, String> params = new HashMap<String,String>();
			params.put("waybillInfoId", waybillInfoId);
			params.put("offerEndDate", offerEndDate);
			
			// 派发平台
			json = waybillInfoFacade.distributePlatform(userInfo, params);
		} catch (Exception e) {
			log.error(e.getMessage());
			e.printStackTrace();
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "请求出现异常");
		}
		return json;
	}
	
	/**
	 * @Title: getWaybillLog  
	 * @Description: 获取运单派发日志
	 * @author zhenghaiayng 2017年9月29日 
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/getWaybillLog")
	@ResponseBody
	public JSONObject getWaybillLog(HttpServletRequest request){
		JSONObject json = null;
		try {
			// 运单id
			Integer waybillInfoId = null;
			if (request.getParameter("waybillInfoId") != null) {
				waybillInfoId = Integer.valueOf(request.getParameter("waybillInfoId"));
			}
			json = waybillInfoFacade.getWaybillLog(waybillInfoId);
		} catch (Exception e) {
			e.printStackTrace();
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "查询出现异常");
		}
		return json;
	}
	
	/**
	 * @Title: verifWhetherTheWaybillCanBeDelivered  
	 * @Description: 验证运单是否可以派发(新建1、已撤回3、已拒绝4的运单可以派发)
	 * @author zhenghaiyang 
	 * @date  2017年10月27日 
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/verifWhetherTheWaybillCanBeDelivered")
	@ResponseBody
	public JSONObject verifWhetherTheWaybillCanBeDelivered(HttpServletRequest request){
		JSONObject json = new JSONObject();
		try {
			// 获取参数
			List<Integer> waybillInfoIds = new ArrayList<Integer>();
			if (StringUtils.isNotBlank(request.getParameter("waybillInfoIds"))) {
				String a = request.getParameter("waybillInfoIds");
				String[] b = a.split(",");
				for (String string : b) {
					waybillInfoIds.add(Integer.valueOf(string));
				}
			}
			
			if (waybillInfoIds.size() == 0) {
				json.put("success", false);
				json.put("msg", "请选择数据");
				return json;
			}
			// 获取运单信息
			List<WaybillInfoPo> list = waybillInfoFacade.getWaybillStatus(waybillInfoIds);
			for (WaybillInfoPo waybillInfoPo : list) {
				Integer waybillStatus = waybillInfoPo.getWaybillStatus();
				if (waybillStatus == 1 || waybillStatus == 3 || waybillStatus == 4) {
					continue;
				} else {
					json.put("success", false);
					json.put("msg", "仅新建、已撤回、已拒绝的运单可以派发");
					return json;
				}
			}
			
			json.put("success", true);
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "请求出现异常");
			return json;
		}
		return json;
	}
 }
