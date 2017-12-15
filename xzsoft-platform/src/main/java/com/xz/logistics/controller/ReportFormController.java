package com.xz.logistics.controller;

import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.poi.POIExcelUtil;
import com.xz.facade.api.ReportFormFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.model.po.UserInfo;
/**
 * 报表信息
 * @author lmjiang
 * @date 2017年8月10日
 */
import com.xz.model.po.WaybillInfoPo;
@Controller
@RequestMapping("/reportForm")
public class ReportFormController extends BaseController{
	
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private WaybillInfoFacade waybillInfoFacade;
	@Resource
	private ReportFormFacade reportFormFacade;
	
	/**
	 * 运单统计报表初始页
	 * @author jiangweiwei
	 * @data 2017年8月10日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showWaybillInfoStatisticsReportForm")
	public String showWaybillInfoStatisticsReportForm(HttpServletRequest request, Model model) {
		return "template/reportForm/show_waybill_report_form";
	}
	
	/**
	 * 根据登录用户主机构ID和条件组查询运单信息或平台级全查(图形化展示)
	 * @author jiangweiwei
	 * @data 2017年8月10日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping("/listWaybillInfoStatisticsReportForm")
	@ResponseBody
	public Map<String,Object> listWaybillInfoStatisticsReportForm(HttpServletRequest request, Model model) {
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = null;
		if(userInfo != null){
			orgRootId = userInfo.getOrgRootId();
		}

		// 获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		/*
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		// 行数
		Integer rows = null;
		if(orgRootId != null){
			rows = 10;
		}else{
			rows = 200;
		}
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		*/
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
		// 封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		//queryMap.put("start", (page - 1) * rows);
		//queryMap.put("rows", rows);
		queryMap.put("OrgRootId", orgRootId);
		queryMap.put("startDate", startDate);
		queryMap.put("endDate", endDate);
		
		//根据登录用户主机构ID、条件组和分页查询运单信息或平台级全查
		List<WaybillInfoPo> waybillInfoList = waybillInfoFacade.findWaybillInfoStatisticsReportFormForPage(queryMap);
		//未接运单
		List<WaybillInfoPo> missedWaybillInfoList = new ArrayList<WaybillInfoPo>();
		//已在途运单
		List<WaybillInfoPo> onPassageWaybillInfoList = new ArrayList<WaybillInfoPo>();
		//已到运单
		List<WaybillInfoPo> arriveWaybillInfoList = new ArrayList<WaybillInfoPo>();
		//已发布运单
		List<WaybillInfoPo> releaseWaybillInfoList = new ArrayList<WaybillInfoPo>();
		//已派发运单
		List<WaybillInfoPo> distributeWaybillInfoList = new ArrayList<WaybillInfoPo>();
		//已接单运单
		List<WaybillInfoPo> receivedWaybillInfoList = new ArrayList<WaybillInfoPo>();
		//已拒绝运单
		List<WaybillInfoPo> rejectWaybillInfoList = new ArrayList<WaybillInfoPo>();
		//已装货运单
		List<WaybillInfoPo> loadingWaybillInfoList = new ArrayList<WaybillInfoPo>();
		//已卸货运单
		List<WaybillInfoPo> unloadingWaybillInfoList = new ArrayList<WaybillInfoPo>();
		//其它运单
		List<WaybillInfoPo> otherWaybillInfoList = new ArrayList<WaybillInfoPo>();
		Map<String,Object> map = new HashMap<String,Object>();
		boolean flag = false;
		if(CollectionUtils.isNotEmpty(waybillInfoList)){
			for(WaybillInfoPo waybillInfoPo : waybillInfoList){
				if(waybillInfoPo.getWaybillStatus() != null){
					//未接运单，运单状态为：新建、已派发、已撤回、已拒绝、已发布和已回收报价
					if(waybillInfoPo.getWaybillStatus() == 1 || waybillInfoPo.getWaybillStatus() == 2 || waybillInfoPo.getWaybillStatus() == 3
							|| waybillInfoPo.getWaybillStatus() == 4 || waybillInfoPo.getWaybillStatus() == 10 ||waybillInfoPo.getWaybillStatus() == 11){
						missedWaybillInfoList.add(waybillInfoPo);
						//运单状态为：已发布
						if(waybillInfoPo.getWaybillStatus() == 10){
							releaseWaybillInfoList.add(waybillInfoPo);
						}
						//运单状态为：已派发
						if(waybillInfoPo.getWaybillStatus() == 2){
							distributeWaybillInfoList.add(waybillInfoPo);
						}
						//运单状态为：已拒绝
						if(waybillInfoPo.getWaybillStatus() == 4){
							rejectWaybillInfoList.add(waybillInfoPo);
						}
						//（其它）运单状态为：新建、已撤回、已回收报价
						if(waybillInfoPo.getWaybillStatus() == 1 || waybillInfoPo.getWaybillStatus() == 3 ||waybillInfoPo.getWaybillStatus() == 11){
							otherWaybillInfoList.add(waybillInfoPo);
						}
						
					}else if(waybillInfoPo.getWaybillStatus() == 5 || waybillInfoPo.getWaybillStatus() == 6 || waybillInfoPo.getWaybillStatus() == 7){
						//已在途运单，运单状态为：已接单、已装货和在途
						onPassageWaybillInfoList.add(waybillInfoPo);
						//运单状态为：已接单
						if(waybillInfoPo.getWaybillStatus() == 5){
							receivedWaybillInfoList.add(waybillInfoPo);
						}
						//运单状态为：已装货
						if(waybillInfoPo.getWaybillStatus() == 6){
							loadingWaybillInfoList.add(waybillInfoPo);
						}
					}else{
						//已到运单，运单状态为：已卸货和已挂账
						arriveWaybillInfoList.add(waybillInfoPo);
						//运单状态为：已卸货
						if(waybillInfoPo.getWaybillStatus() == 8){
							unloadingWaybillInfoList.add(waybillInfoPo);
						}
						//（其它）运单状态为：已挂账
						if(waybillInfoPo.getWaybillStatus() == 9){
							otherWaybillInfoList.add(waybillInfoPo);
						}
					}
					flag = true;
				}
			}
		}
		map.put("success", flag);
		//未接运单
		map.put("missedWaybillInfoList", missedWaybillInfoList);
		//已在途运单
		map.put("onPassageWaybillInfoList", onPassageWaybillInfoList);
		//已到运单
		map.put("arriveWaybillInfoList", arriveWaybillInfoList);
		//已发布运单
		map.put("releaseWaybillInfoList", releaseWaybillInfoList);
		//已派发运单
		map.put("distributeWaybillInfoList", distributeWaybillInfoList);
		//已拒绝运单
		map.put("rejectWaybillInfoList", rejectWaybillInfoList);
		//已接单运单
		map.put("receivedWaybillInfoList", receivedWaybillInfoList);
		//已装货运单
		map.put("loadingWaybillInfoList", loadingWaybillInfoList);
		//已卸货运单
		map.put("unloadingWaybillInfoList", unloadingWaybillInfoList);
		//（其它）运单
		map.put("otherWaybillInfoList", otherWaybillInfoList);
		// 总数信息封装
		return map;
	}
	
	/**
	 * 根据登录用户主机构ID和条件组查询运单信息或平台级全查(图形化展示)
	 * @author jiangweiwei
	 * @data 2017年8月10日
	 * @param request
	 * @param response
	 * @return
	 */
//	@RequestMapping(value = "/listWaybillInfoStatisticsReportForm")
//	public String listWaybillInfoStatisticsReportForm2(HttpServletRequest request, Model model) {
//		DataPager<WaybillInfoPo> waybillInfoPager = new DataPager<WaybillInfoPo>();
//		// 从session中取出当前用户的主机构ID
//		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
//		Integer orgRootId = null;
//		if(userInfo != null){
//			orgRootId = userInfo.getOrgRootId();
//		}
//		
//		// 1、获取并处理参数
//		Map<String, Object> params = this.paramsToMap(request);
//		// 页数
//		Integer page = 1;
//		if (params.get("page") != null) {
//			page = Integer.valueOf(params.get("page").toString());
//		}
//		waybillInfoPager.setPage(page);
//		
//		// 行数
//		Integer rows = null;
//		if(orgRootId != null){
//			rows = 10;
//		}else{
//			rows = 200;
//		}
//		if (params.get("rows") != null) {
//			rows = Integer.valueOf(params.get("rows").toString());
//		}
//		waybillInfoPager.setSize(rows);
//		
//		// 2、封装参数
//		Map<String, Object> queryMap = new HashMap<String, Object>();
//		queryMap.put("start", (page - 1) * rows);
//		queryMap.put("rows", rows);
//		queryMap.put("uOrgRootId", orgRootId);
//		//根据登录用户主机构ID、条件组和分页查询运单信息或平台级全查
//		List<WaybillInfoPo> waybillInfoList = waybillInfoFacade.findWaybillInfoStatisticsReportFormForPage(queryMap);
//		//未接运单
//		List<WaybillInfoPo> missedWaybillInfoList = new ArrayList<WaybillInfoPo>();
//		//未接运单总条目数
//		Integer missedWaybillInfoTotalNum = null;
//		//已在途运单
//		List<WaybillInfoPo> onPassageWaybillInfoList = new ArrayList<WaybillInfoPo>();
//		//已在途运单总条目数
//		Integer onPassageWaybillInfoTotalNum = null;
//		//已到运单
//		List<WaybillInfoPo> arriveWaybillInfoList = new ArrayList<WaybillInfoPo>();
//		//已到运单总条目数
//		Integer arriveWaybillInfoTotalNum = null;
//		if(CollectionUtils.isNotEmpty(waybillInfoList)){
//			for(WaybillInfoPo waybillInfoPo : waybillInfoList){
//				if(waybillInfoPo.getWaybillStatus() != null){
//					//未接运单，运单状态为：新建、已派发、已撤回、已拒绝、已发布和已回收报价
//					if(waybillInfoPo.getWaybillStatus() == 1 || waybillInfoPo.getWaybillStatus() == 2 || waybillInfoPo.getWaybillStatus() == 3
//							|| waybillInfoPo.getWaybillStatus() == 4 || waybillInfoPo.getWaybillStatus() == 10 ||waybillInfoPo.getWaybillStatus() == 11){
//						missedWaybillInfoList.add(waybillInfoPo);
//					}else if(waybillInfoPo.getWaybillStatus() == 5 || waybillInfoPo.getWaybillStatus() == 6 || waybillInfoPo.getWaybillStatus() == 7){
//						//已在途运单，运单状态为：已接单、已装货和在途
//						onPassageWaybillInfoList.add(waybillInfoPo);
//					}else{
//						//已到运单，运单状态为：已装货和已挂账
//						arriveWaybillInfoList.add(waybillInfoPo);
//					}
//				}
//			}
//		}
//		missedWaybillInfoTotalNum = missedWaybillInfoList.size();
//		onPassageWaybillInfoTotalNum = onPassageWaybillInfoList.size();
//		arriveWaybillInfoTotalNum = arriveWaybillInfoList.size();
//		// 5、总数、分页信息封装
////		waybillInfoPager.setTotal(totalNum);
////		waybillInfoPager.setRows(settlementInfoList);
////		model.addAttribute("waybillInfoPager", waybillInfoPager);
//		return "template/settlementInfo/re_order_settlement_info_data";
//	}
	/**
	 * @Title: showProcAndOperStatPage  
	 * @Description: 显示生产经验情况日统计表页面
	 * @author zhenghaiayng 2017年9月28日 
	 * @return String
	 */
	@RequestMapping("/showProcAndOperStatPage")
	public String showProcAndOperStatPage(){
		return "template/reportForm/tianshun/procAndOperStat/procAndOperStatPage";
	}
	
	/**
	 * @Title: getDataForProcAndOperStatPage  
	 * @Description: 获取生产经验情况日统计表数据
	 * @author zhenghaiayng 2017年9月28日 
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/getDataForProcAndOperStatPage")
	@ResponseBody
	public JSONObject getDataForProcAndOperStatPage(HttpServletRequest request){
		JSONObject json = new JSONObject();
		try {
			// 从session中获取当前登陆用户信息
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			if (userInfo == null) {
				json.put("success", false);
				json.put("msg", "用户信息为空，请重新登陆");
				return json;
			}
			// 获取参数
			Map<String, Object> params = new HashMap<String,Object>();
			
			json = reportFormFacade.getDataForProcAndOperStatPage(userInfo, params);
			
		} catch (Exception e) {
			e.printStackTrace();
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "请求出现异常");
		}
		
		return json;
	}
	
	@RequestMapping("/showWaybillMonitorPage")
	public String showWaybillMonitorPage(){
		return "template/reportForm/tianshun/waybillMonitor/waybill-monitor-page";
	}
	
	
	/**
	 * @Title: getDataForWaybillMonitorPage  
	 * @Description: 无车承运试点运行监测数据统计报表
	 * @author zhenghaiyang 2017年10月7日 
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/getDataForWaybillMonitorPage")
	@ResponseBody
	public JSONObject getDataForWaybillMonitorPage(HttpServletRequest request){
		JSONObject json = new JSONObject();
		try {
			// 从session中获取当前登陆用户信息
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			if (userInfo == null) {
				json.put("success", false);
				json.put("msg", "用户信息为空，请重新登陆");
				return json;
			}
			// 当前机构
			Integer orgInfoId = userInfo.getOrgInfoId();
			// 获取参数
			// 货物
			String goodsInfoName = request.getParameter("goodsInfoName");
			// 线路
			Integer lineInfoId = null;
			if (StringUtils.isNotBlank(request.getParameter("lineInfoId"))) {
				lineInfoId = Integer.valueOf(request.getParameter("lineInfoId"));
			}
			// 发货日期
			String deliveryDateSStr = request.getParameter("deliveryDateS");
			String deliveryDateEStr = request.getParameter("deliveryDateE");
			// 到货日期
			String arrivalDateSStr = request.getParameter("deliveryDateS");
			String arrivalDateEStr = request.getParameter("deliveryDateE");
			// 委托方
			String entrustName = request.getParameter("entrustName");
			// 承运方
			String shipperName = request.getParameter("shipperName");
			// 发货单位
			String forwardingUnit = request.getParameter("forwardingUnit");
			// 到货单位
			String consignee = request.getParameter("consignee");
			// 当前页
			Integer page = 1;
			if (StringUtils.isNotBlank(request.getParameter("page"))) {
				page = Integer.valueOf(request.getParameter("page"));
			}
			// 显示数据行数
			Integer rows = 10;
			if (StringUtils.isNotBlank(request.getParameter("rows"))) {
				rows = Integer.valueOf(request.getParameter("rows"));
			}
			
			// 封装参数
			Map<String, Object> params = new HashMap<String,Object>();
			params.put("orgInfoId", orgInfoId);
			params.put("goodsInfoName", goodsInfoName);
			params.put("lineInfoId", lineInfoId);
			params.put("deliveryDateSStr", deliveryDateSStr);
			params.put("deliveryDateEStr", deliveryDateEStr);
			params.put("arrivalDateSStr", arrivalDateSStr);
			params.put("arrivalDateEStr", arrivalDateEStr);
			params.put("entrustName", entrustName);
			params.put("shipperName", shipperName);
			params.put("forwardingUnit", forwardingUnit);
			params.put("consignee", consignee);
			params.put("start", (page - 1) * rows);
			params.put("rows", rows);
			
			json = reportFormFacade.getDataForWaybillMonitorPage(params);
			
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("data", "请求出现异常");
		}
		return json;
	}
	
	/**
	 * @Title: showProfigAnalysisPage  
	 * @Description: 显示毛利分析页面
	 * @author zhenghaiyang 
	 * @date  2017年10月26日 
	 * @return String
	 */
	@RequestMapping("/showProfigAnalysisPage")
	public String showProfigAnalysisPage(){
		return "template/reportForm/profitAnalysis/profit-analysis-page";
	}
	
	
	/**
	 * @Title: getProfitAnalysisData  
	 * @Description: 获取毛利分析表的数据
	 * @author zhenghaiayng 2017年10月11日 
	 * @param request
	 * @return
	 */
	@RequestMapping("/getProfitAnalysisData")
	@ResponseBody
	public JSONObject getProfitAnalysisData(HttpServletRequest request){
		JSONObject json = new JSONObject();
		try {
			// 当前页
			Integer page = 1;
			if (StringUtils.isNotBlank(request.getParameter("page"))) {
				page = Integer.valueOf(request.getParameter("page"));
			}
			// 显示数据行数
			Integer rows = 10;
			if (StringUtils.isNotBlank(request.getParameter("rows"))) {
				rows = Integer.valueOf(request.getParameter("rows"));
			}
			// 运单号
			String waybillId = null;
			if (StringUtils.isNotBlank(request.getParameter("waybillId"))) {
				waybillId = request.getParameter("waybillId");
			}
			// 车牌号码
			String carCode = null;
			if (StringUtils.isNotBlank(request.getParameter("carCode"))) {
				carCode = request.getParameter("carCode");
			}
			// 货物名称
			String goodsName = null;
			if (StringUtils.isNotBlank(request.getParameter("goodsName"))) {
				goodsName = request.getParameter("goodsName");
			}
			// 客户名称（委托方）
			String entrustName = null;
			if (StringUtils.isNotBlank(request.getParameter("entrustName"))) {
				entrustName = request.getParameter("entrustName");
			}
			// 承运方
			String shipperName = null;
			if (StringUtils.isNotBlank(request.getParameter("shipperName"))) {
				shipperName = request.getParameter("shipperName");
			}
			// 拉运起点
			String startPoint = null;
			if (StringUtils.isNotBlank(request.getParameter("startPoint"))) {
				startPoint = request.getParameter("startPoint");
			}
			// 拉运终点
			String endPoint = null;
			if (StringUtils.isNotBlank(request.getParameter("endPoint"))) {
				endPoint = request.getParameter("endPoint");
			}
			// 组织部门
			String orgName = null;
			if (StringUtils.isNotBlank(request.getParameter("orgName"))) {
				orgName = request.getParameter("orgName");
			}
			// 发货单号
			String forwardingId = null;
			if (StringUtils.isNotBlank(request.getParameter("forwardingId"))) {
				forwardingId = request.getParameter("forwardingId");
			}
			// 到货单号
			String arrrveId = null;
			if (StringUtils.isNotBlank(request.getParameter("arrrveId"))) {
				arrrveId = request.getParameter("arrrveId");
			}
			// 制单人
			String createUser = null;
			if (StringUtils.isNotBlank(request.getParameter("createUser"))) {
				createUser = request.getParameter("createUser");
			}
			// 车属单位
			String carOrg = null;
			if (StringUtils.isNotBlank(request.getParameter("carOrg"))) {
				carOrg = request.getParameter("carOrg");
			}
			// 核算主体
			String accountingEntity = null;
			if (StringUtils.isNotBlank(request.getParameter("accountingEntity"))) {
				accountingEntity = request.getParameter("accountingEntity");
			}
			
			// 制单日期（1、2）
			String createTime1 = null;
			if (StringUtils.isNotBlank(request.getParameter("createTime1"))) {
				createTime1 = request.getParameter("createTime1");
			}
			String createTime2 = null;
			if (StringUtils.isNotBlank(request.getParameter("createTime2"))) {
				createTime2 = request.getParameter("createTime2");
			}
			// 回单日期（1、2）
			String returnDocTime1 = null;
			if (StringUtils.isNotBlank(request.getParameter("returnDocTime1"))) {
				returnDocTime1 = request.getParameter("returnDocTime1");
			}
			String returnDocTime2 = null;
			if (StringUtils.isNotBlank(request.getParameter("returnDocTime2"))) {
				returnDocTime2 = request.getParameter("returnDocTime2");
			}
			// 发货日期（1、2）
			String fordwardingTime1 = null;
			if (StringUtils.isNotBlank(request.getParameter("fordwardingTime1"))) {
				fordwardingTime1 = request.getParameter("fordwardingTime1");
			}
			String fordwardingTime2 = null;
			if (StringUtils.isNotBlank(request.getParameter("fordwardingTime2"))) {
				fordwardingTime2 = request.getParameter("fordwardingTime2");
			}
			
			// 审核状态
			Integer settlementStatus = null;
			if (StringUtils.isNotBlank(request.getParameter("settlementStatus"))) {
				settlementStatus = Integer.valueOf(request.getParameter("settlementStatus"));
			}
			// 挂账状态
			Integer isWriteOff = null;
			if (StringUtils.isNotBlank(request.getParameter("isWriteOff"))) {
				isWriteOff = Integer.valueOf(request.getParameter("isWriteOff"));
			}
			// 是否对账
			Integer isAccount = null;
			if (StringUtils.isNotBlank(request.getParameter("isAccount"))) {
				isAccount = Integer.valueOf(request.getParameter("isAccount"));
			}
			// 支付方式
			Integer payType = null;
			if (StringUtils.isNotBlank(request.getParameter("payType"))) {
				payType = Integer.valueOf(request.getParameter("payType"));
			}
			// 收入发票
			Integer isInvoice = null;
			if (StringUtils.isNotBlank(request.getParameter("isInvoice"))) {
				isInvoice = Integer.valueOf(request.getParameter("isInvoice"));
			}
			// 是否补差
			Integer isRevise = null;
			if (StringUtils.isNotBlank(request.getParameter("isRevise"))) {
				isRevise = Integer.valueOf(request.getParameter("isRevise"));
			}
			
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("waybillId", waybillId);
			params.put("carCode", carCode);
			params.put("goodsName", goodsName);
			params.put("entrustName", entrustName);
			params.put("shipperName", shipperName);
			params.put("startPoint", startPoint);
			params.put("endPoint", endPoint);
			params.put("orgName", orgName);
			params.put("forwardingId", forwardingId);
			params.put("arrrveId", arrrveId);
			params.put("createUser", createUser);
			params.put("carOrg", carOrg);
			params.put("accountingEntity", accountingEntity);
			
			params.put("createTime1", createTime1);
			params.put("createTime2", createTime2);
			params.put("returnDocTime1", returnDocTime1);
			params.put("returnDocTime2", returnDocTime2);
			params.put("fordwardingTime1", fordwardingTime1);
			params.put("fordwardingTime2", fordwardingTime2);
			
			params.put("settlementStatus", settlementStatus);
			params.put("isWriteOff", isWriteOff);
			params.put("isAccount", isAccount);
			params.put("payType", payType);
			params.put("isInvoice", isInvoice);
			params.put("isRevise", isRevise);
			
			params.put("start", (page - 1) * rows);
			params.put("rows", rows);
			
			// list
			List<Map<String, Object>> list = reportFormFacade.getProfitAnalysisData(params);
			
			// total
			Integer total = reportFormFacade.getProfitAnalysisDataCount(params);
			
			// 统计的map
			Map<String,Object> mapSum =  reportFormFacade.sumProfitAnalysisData(params);
			
			json.put("success", true);
			json.put("list", list);
			json.put("total", total);
			json.put("mapSum", mapSum);
			
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "服务出现异常");
		}
		return json;
	}
	
	/**
	 * @Title: sumProfitAnalysisData  
	 * @Description: 通过结算单id集合获取毛利分析数据
	 * @author zhenghaiayng 
	 * @date 2017年10月17日 
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/getProfitAnalysisDataByIds")
	@ResponseBody
	public JSONObject getProfitAnalysisDataByIds(HttpServletRequest request){
		JSONObject json = new JSONObject();
		
		try {
			// 获取参数
			String ids = request.getParameter("ids");
			if (StringUtils.isBlank(ids)) {
				json.put("success", false);
				json.put("msg", "请选择数据");
				return json;
			}
			String[] idArray = ids.split(",");
			List<Integer> settlementIdList = new ArrayList<Integer>();
			for (String settlementId : idArray) {
				if (StringUtils.isNotBlank(settlementId)) {
					settlementIdList.add(Integer.valueOf(settlementId));
				}
			} 
			
			Map<String, Object> sumMap = reportFormFacade.sumProfitAnalysisDataByIds(settlementIdList);
			json.put("success", true);
			json.put("sumMap", sumMap);
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "服务出现异常");
		}
		return json;
	}
	
	/**
	 * @Title: exportProfitAnalysis  
	 * @Description: 导出毛利分析数据
	 * @author zhenghaiayng 
	 * @date  2017年10月20日 
	 * @param request
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/exportProfitAnalysis")
	@ResponseBody
	public void exportProfitAnalysis(HttpServletRequest request,HttpServletResponse response){
		
		try {
			// 获取参数:对账单id ： 1,2,3,转换成list
			String ids = request.getParameter("ids");
			
			List<Integer> settlementIdList = new ArrayList<Integer>();
			
			if (StringUtils.isNotBlank(ids)) {
				String[] idArray = ids.split(",");
				for (String settlementId : idArray) {
					if (StringUtils.isNotBlank(settlementId)) {
						settlementIdList.add(Integer.valueOf(settlementId));
					}
				}
			}
			// 如果settlementIdList则默认导出全部数据，不为空则导出指定数据
			
			Map<String, Object> map = reportFormFacade.getProfitExportData(settlementIdList);
			
			List<String> keyList = (List<String>) map.get("keyList");
			List<String> titleList = (List<String>) map.get("titleList");
			List<Map<String, Object>> list = (List<Map<String, Object>>) map.get("list");
			
			Workbook workbook = new HSSFWorkbook();
			String finalFileName = "毛利分析";
			finalFileName = URLEncoder.encode(finalFileName, "UTF-8");

			workbook = POIExcelUtil.exportExcel(titleList, keyList, list, finalFileName);
			
			response.setContentType("application/vnd.ms-excel;charset=UTF-8");
			response.setCharacterEncoding("utf-8"); 
			response.addHeader("Content-Disposition", "attachment;filename="+new String( finalFileName.getBytes("gbk"), "UTF-8" )+".xls"); 	
			
			OutputStream os = response.getOutputStream();
			workbook.write(os);
			os.flush();
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * @Title: getProfitAnalysisDataIds  
	 * @Description: 获取所有毛利分析数据的id
	 * @author zhenghaiayng 
	 * @date  2017年10月20日 
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/getProfitAnalysisDataIds")
	@ResponseBody
	public JSONObject getProfitAnalysisDataIds(HttpServletRequest request){
		JSONObject json = new JSONObject();
		try {
			// 当前页
			Integer page = 1;
			if (StringUtils.isNotBlank(request.getParameter("page"))) {
				page = Integer.valueOf(request.getParameter("page"));
			}
			// 显示数据行数
			Integer rows = 10;
			if (StringUtils.isNotBlank(request.getParameter("rows"))) {
				rows = Integer.valueOf(request.getParameter("rows"));
			}
			// 运单号
			String waybillId = null;
			if (StringUtils.isNotBlank(request.getParameter("waybillId"))) {
				waybillId = request.getParameter("waybillId");
			}
			// 车牌号码
			String carCode = null;
			if (StringUtils.isNotBlank(request.getParameter("carCode"))) {
				carCode = request.getParameter("carCode");
			}
			// 货物名称
			String goodsName = null;
			if (StringUtils.isNotBlank(request.getParameter("goodsName"))) {
				goodsName = request.getParameter("goodsName");
			}
			// 客户名称（委托方）
			String entrustName = null;
			if (StringUtils.isNotBlank(request.getParameter("entrustName"))) {
				entrustName = request.getParameter("entrustName");
			}
			// 承运方
			String shipperName = null;
			if (StringUtils.isNotBlank(request.getParameter("shipperName"))) {
				shipperName = request.getParameter("shipperName");
			}
			// 拉运起点
			String startPoint = null;
			if (StringUtils.isNotBlank(request.getParameter("startPoint"))) {
				startPoint = request.getParameter("startPoint");
			}
			// 拉运终点
			String endPoint = null;
			if (StringUtils.isNotBlank(request.getParameter("endPoint"))) {
				endPoint = request.getParameter("endPoint");
			}
			// 组织部门
			String orgName = null;
			if (StringUtils.isNotBlank(request.getParameter("orgName"))) {
				orgName = request.getParameter("orgName");
			}
			// 发货单号
			String forwardingId = null;
			if (StringUtils.isNotBlank(request.getParameter("forwardingId"))) {
				forwardingId = request.getParameter("forwardingId");
			}
			// 到货单号
			String arrrveId = null;
			if (StringUtils.isNotBlank(request.getParameter("arrrveId"))) {
				arrrveId = request.getParameter("arrrveId");
			}
			// 制单人
			String createUser = null;
			if (StringUtils.isNotBlank(request.getParameter("createUser"))) {
				createUser = request.getParameter("createUser");
			}
			// 车属单位
			String carOrg = null;
			if (StringUtils.isNotBlank(request.getParameter("carOrg"))) {
				carOrg = request.getParameter("carOrg");
			}
			// 核算主体
			String accountingEntity = null;
			if (StringUtils.isNotBlank(request.getParameter("accountingEntity"))) {
				accountingEntity = request.getParameter("accountingEntity");
			}
			
			// 制单日期（1、2）
			String createTime1 = null;
			if (StringUtils.isNotBlank(request.getParameter("createTime1"))) {
				createTime1 = request.getParameter("createTime1");
			}
			String createTime2 = null;
			if (StringUtils.isNotBlank(request.getParameter("createTime2"))) {
				createTime2 = request.getParameter("createTime2");
			}
			// 回单日期（1、2）
			String returnDocTime1 = null;
			if (StringUtils.isNotBlank(request.getParameter("returnDocTime1"))) {
				returnDocTime1 = request.getParameter("returnDocTime1");
			}
			String returnDocTime2 = null;
			if (StringUtils.isNotBlank(request.getParameter("returnDocTime2"))) {
				returnDocTime2 = request.getParameter("returnDocTime2");
			}
			// 发货日期（1、2）
			String fordwardingTime1 = null;
			if (StringUtils.isNotBlank(request.getParameter("fordwardingTime1"))) {
				fordwardingTime1 = request.getParameter("fordwardingTime1");
			}
			String fordwardingTime2 = null;
			if (StringUtils.isNotBlank(request.getParameter("fordwardingTime2"))) {
				fordwardingTime2 = request.getParameter("fordwardingTime2");
			}
			
			// 审核状态
			Integer settlementStatus = null;
			if (StringUtils.isNotBlank(request.getParameter("settlementStatus"))) {
				settlementStatus = Integer.valueOf(request.getParameter("settlementStatus"));
			}
			// 挂账状态
			Integer isWriteOff = null;
			if (StringUtils.isNotBlank(request.getParameter("isWriteOff"))) {
				isWriteOff = Integer.valueOf(request.getParameter("isWriteOff"));
			}
			// 是否对账
			Integer isAccount = null;
			if (StringUtils.isNotBlank(request.getParameter("isAccount"))) {
				isAccount = Integer.valueOf(request.getParameter("isAccount"));
			}
			// 支付方式
			Integer payType = null;
			if (StringUtils.isNotBlank(request.getParameter("payType"))) {
				payType = Integer.valueOf(request.getParameter("payType"));
			}
			// 收入发票
			Integer isInvoice = null;
			if (StringUtils.isNotBlank(request.getParameter("isInvoice"))) {
				isInvoice = Integer.valueOf(request.getParameter("isInvoice"));
			}
			// 是否补差
			Integer isRevise = null;
			if (StringUtils.isNotBlank(request.getParameter("isRevise"))) {
				isRevise = Integer.valueOf(request.getParameter("isRevise"));
			}
			
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("waybillId", waybillId);
			params.put("carCode", carCode);
			params.put("goodsName", goodsName);
			params.put("entrustName", entrustName);
			params.put("shipperName", shipperName);
			params.put("startPoint", startPoint);
			params.put("endPoint", endPoint);
			params.put("orgName", orgName);
			params.put("forwardingId", forwardingId);
			params.put("arrrveId", arrrveId);
			params.put("createUser", createUser);
			params.put("carOrg", carOrg);
			params.put("accountingEntity", accountingEntity);
			
			params.put("createTime1", createTime1);
			params.put("createTime2", createTime2);
			params.put("returnDocTime1", returnDocTime1);
			params.put("returnDocTime2", returnDocTime2);
			params.put("fordwardingTime1", fordwardingTime1);
			params.put("fordwardingTime2", fordwardingTime2);
			
			params.put("settlementStatus", settlementStatus);
			params.put("isWriteOff", isWriteOff);
			params.put("isAccount", isAccount);
			params.put("payType", payType);
			params.put("isInvoice", isInvoice);
			params.put("isRevise", isRevise);
			
			params.put("start", (page - 1) * rows);
			params.put("rows", rows);
			
			// id List 
			List<Integer> list = reportFormFacade.getProfitAnalysisDataIds(params);
			
			json.put("success", true);
			json.put("list", list);
			
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "服务出现异常");
		}
		return json;
	}
}
