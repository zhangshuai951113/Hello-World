package com.xz.logistics.controller;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.AccountCheckInfoFacade;
import com.xz.facade.api.InvoiceDetailInfoFacade;
import com.xz.facade.api.InvoiceImageInfoPoFacade;
import com.xz.facade.api.InvoiceInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.PartnerInfoFacade;
import com.xz.facade.api.ProjectInfoFacade;
import com.xz.facade.api.SettlementInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.logistics.utils.CodeAutoGenerater;
import com.xz.model.po.AccountCheckInfo;
import com.xz.model.po.InvoiceDetailInfoPo;
import com.xz.model.po.InvoiceImageInfoPo;
import com.xz.model.po.InvoiceInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.PartnerInfoPo;
import com.xz.model.po.ProjectInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.InvoiceImageModel;
import com.xz.model.vo.InvoiceInfoModel;

/**
 * 发票登记controller
 * 
 * @author luojuan 2017年7月8日
 *
 */
@Controller
@RequestMapping("/invoiceInfo")
public class InvoiceInfoController extends BaseController{
	
	private final Logger log = LoggerFactory.getLogger(getClass());

	@Resource
	private InvoiceInfoFacade invoiceInfoFacade;
	
	@Resource
	private ProjectInfoFacade projectInfoFacade;
	
	@Resource
	private PartnerInfoFacade partnerInfoFacade;
	
	@Resource
	private OrgInfoFacade orgInfoFacade;
	
	@Resource
	private UserInfoFacade userInfoFacade;
	
	@Resource
	private SettlementInfoFacade settlementInfoFacade;
	
	@Resource
	private AccountCheckInfoFacade accountCheckInfoFacade;
	
	@Resource
	private InvoiceDetailInfoFacade invoiceDetailInfoFacade;
	
	@Resource
	private InvoiceImageInfoPoFacade invoiceImageInfoPoFacade;
	
	/**
	 * 发票管理初始化页面
	 * 
	 * @author luojuan 2017年7月8日
	 */
	@RequestMapping(value = "/rootInvoiceInfolistPage")
	public String rootInvoiceInfolistPage(HttpServletRequest request, Model model){
		return "template/invoice/show_invoice_info_list_page";
	}
	
	/**
	 * 发票管理查询
	 * 
	 * @author luojuan 2017年7月8日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showInvoiceInfolistPage")
	public String showInvoiceInfolistPage(HttpServletRequest request, Model model){
		DataPager<InvoiceInfoPo> InvoiceInfoPager = new DataPager<InvoiceInfoPo>();
		
		// 从session中取出当前用户的用户权限
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		InvoiceInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		InvoiceInfoPager.setSize(rows);
		
		//发票号码
		String invoiceId = null;
		if (params.get("invoiceId") != null) {
			invoiceId = params.get("invoiceId").toString();
		}
		
		//发票代码
		String invoiceCode = null;
		if (params.get("invoiceCode") != null) {
			invoiceCode = params.get("invoiceCode").toString();
		}
		
		//对账单号
		Integer accountCheckId = null;
		if (params.get("accountCheckId") != null) {
			accountCheckId = Integer.valueOf(params.get("accountCheckId").toString());
		}
		
		//客户名称
		String customerId = null;
		if (params.get("customerId") != null) {
			customerId = params.get("customerId").toString();
		}
		
		//开票日期Strat
		String billingDateStratStr = null;
		Date billingDateStrat = null;
		if(params.get("billingDateStrat") != null){
			billingDateStratStr = params.get("billingDateStrat").toString();
			try {
				billingDateStrat = new SimpleDateFormat("yyyy-MM-dd").parse(billingDateStratStr);
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		
		//开票日期End
		String billingDateEndStr = null;
		Date billingDateEnd = null;
		if(params.get("billingDateEnd") != null){
			billingDateEndStr = params.get("billingDateEnd").toString();
			try {
				billingDateEnd = new SimpleDateFormat("yyyy-MM-dd").parse(billingDateEndStr);
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		
		//组织部门
		String projectInfoId = null;
		if (params.get("projectInfoId") != null) {
			projectInfoId = params.get("projectInfoId").toString();
		}
		
		//发票分类
		Integer invoiceClassify = null;
		if (params.get("invoiceClassify") != null) {
			invoiceClassify = Integer.valueOf(params.get("invoiceClassify").toString());
		}
		
		//单据状态
		Integer invoiceStatus = null;
		if (params.get("invoiceStatus") != null) {
			invoiceStatus = Integer.valueOf(params.get("invoiceStatus").toString());
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("invoiceId", invoiceId);
		queryMap.put("invoiceCode", invoiceCode);
		queryMap.put("accountCheckId", accountCheckId);
		queryMap.put("customerId", customerId);
		queryMap.put("billingDateStrat", billingDateStrat);
		queryMap.put("billingDateEnd", billingDateEnd);
		queryMap.put("projectInfoId", projectInfoId);
		queryMap.put("invoiceClassify", invoiceClassify);
		queryMap.put("invoiceStatus", invoiceStatus);
		
		//3、查询发票管理总数
		Integer totalNum = invoiceInfoFacade.countInvoiceInfoForPage(queryMap);
		
		//4、分页查询发票管理
		 List<InvoiceInfoPo> invoiceInfoList = invoiceInfoFacade.findInvoiceInfoForPage(queryMap);
		 
		 for (InvoiceInfoPo invoiceInfoPo : invoiceInfoList) {
			//前台获取制单人姓名
				UserInfo userInfoStr = (UserInfo)userInfoFacade.getUserInfoById(invoiceInfoPo.getMakeUser());
				invoiceInfoPo.setMakeUserName(userInfoStr.getUserName());
				
				//前台获取主机构ID
				OrgInfoPo orgInfo = orgInfoFacade.getOrgInfoByOrgInfoId(invoiceInfoPo.getOrgRootId());
				String orgInfoName = "";
				orgInfoName = orgInfo.getOrgDetailInfo().getOrgName();
				invoiceInfoPo.setOrgName(orgInfoName);
				
				//客户编号
				OrgInfoPo customer = orgInfoFacade.getOrgInfoByOrgInfoId(invoiceInfoPo.getCustomerId());
				String customerName = "";
				customerName = customer.getOrgDetailInfo().getOrgName();
				invoiceInfoPo.setCustomerName(customerName);
				
				//组织部门
				ProjectInfoPo project =  projectInfoFacade.getProjectInfoPoById(invoiceInfoPo.getProjectInfoId());
				String projectName = project.getProjectName();
				invoiceInfoPo.setProjectName(projectName);
		}
		
		//5、总数、分页信息封装
		 InvoiceInfoPager.setTotal(totalNum);
		 InvoiceInfoPager.setRows(invoiceInfoList);
		 model.addAttribute("userRole",userRole);
		 model.addAttribute("InvoiceInfoPager",InvoiceInfoPager);
		 model.addAttribute("InvoiceInfoPager",InvoiceInfoPager);
		
		return "template/invoice/invoice_info_data";
	}
	
	/**
	 * 新增/编辑发票管理初始页
	 * 
	 * @author luojuan 2017年7月10日
	 * @param request
	 * @param model
	 * @return 
	 */
	@RequestMapping("/initInvoicePage")
	public String initInvoicePage(HttpServletRequest request, Model model){
		// 从session中取出当前用户的用户权限
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		// 取出操作类型(1:新增 2:编辑)
		String operateType1 = request.getParameter("operateType");
		Integer operateType = Integer.parseInt(operateType1);
		
		String operateTitle = "";

		if(operateType==1){
			operateTitle = "新增发票信息";
			InvoiceInfoPo invoiceInfoPo = null;
			if (StringUtils.isBlank(request.getParameter("invoice_id"))) {
				//生成发票号码FP+日期+四位序列号
				//String invoiceId = CodeAutoGenerater.generaterInvoiceInfoId();
				String invoiceId = invoiceInfoFacade.getNewInvoiceIdFa();
				invoiceInfoPo = new InvoiceInfoPo();
				invoiceInfoPo.setInvoiceId(invoiceId);
			}
			model.addAttribute("invoiceInfoPo", invoiceInfoPo);
		}else{
			operateTitle = "编辑发票信息";
			Integer invoiceInfoId = Integer.parseInt(request.getParameter("invoiceInfoId"));
			InvoiceInfoPo invoiceInfoPo = invoiceInfoFacade.findInvoiceInfoById(invoiceInfoId);
			//查询未开金额
			Map<String, Object> queryMap = new HashMap<String,Object>();
			Map<String, Object> invoiceDetailMap = new HashMap<String, Object>();
			invoiceDetailMap.put("invoiceInfoId", invoiceInfoId);
			invoiceDetailMap.put("orgRootId", orgRootId);
			invoiceDetailMap.put("start", 0);
			invoiceDetailMap.put("rows", 10);
			List<InvoiceDetailInfoPo> invoiceDetailInfoList = invoiceDetailInfoFacade.findInvoiceDetailInfoByInvoiceInfoId(invoiceDetailMap);
			//多条对账单Id也能取出
			String accIds="";
			for (InvoiceDetailInfoPo invoiceDetailInfoPo : invoiceDetailInfoList) {
				
			queryMap.put("accountCheckInfoId",invoiceDetailInfoPo.getAccountCheckId());
			queryMap.put("orgRootId", orgRootId);
			AccountCheckInfo accountCheckInfo = accountCheckInfoFacade.getAccountCheckInfoById(queryMap);
			//invoiceInfoPo.setAccountCheckIds(invoiceDetailInfoPo.getAccountCheckId().toString());
		 	model.addAttribute("noAmount", accountCheckInfo.getNoAmount());
			model.addAttribute("confirmPrice", accountCheckInfo.getConfirmPrice());
			accIds+=invoiceDetailInfoPo.getAccountCheckId().toString()+",";
			}
			
			String AccountCheckIds=accIds.substring(0, accIds.length()-1);
			invoiceInfoPo.setAccountCheckIds(AccountCheckIds);
			
			//组织部门以及客户编号显示名称
			ProjectInfoPo projectInfo = projectInfoFacade.getProjectInfoPoById(invoiceInfoPo.getProjectInfoId());
			model.addAttribute("projectInfoName", projectInfo.getProjectName());
			
			List<OrgInfoPo> orgList = orgInfoFacade.getOrgInfosByRootOrgInfoId(invoiceInfoPo.getCustomerId());
			for(OrgInfoPo orgInfoPo:orgList){
				model.addAttribute("customerName", orgInfoPo.getOrgName());
			}
			model.addAttribute("invoiceInfoPo", invoiceInfoPo);
		}
		model.addAttribute("operateTitle", operateTitle);
		
		return "template/invoice/init_invoice_page";
	}
	
	/**
	 * 新增/编辑发票信息
	 * 
	 * @author luojuan 2017年7月10日
	 * @param request
	 * @param invoiceInfoModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateinvoice" ,produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateinvoice(HttpServletRequest request,InvoiceInfoModel invoiceInfoModel){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID、用户ID、用户角色、协同状态
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		Integer cooperateState = userInfo.getCooperateState();
		
		// 多条对账单开一张发票
		/*List<Integer> accountCheckIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("accountCheckIds"))) {
			String accountCheckIds = request.getParameter("accountCheckIds").trim();
			String[] accountCheckArray = accountCheckIds.split(",");
			if(accountCheckArray.length>0){
				for(String accountCheckIdStr : accountCheckArray){
					if(StringUtils.isNotBlank(accountCheckIdStr)){
						accountCheckIdList.add(Integer.valueOf(accountCheckIdStr.trim()));
					}
				}
			}
		}*/
		try {
			jo = invoiceInfoFacade.addOrUpdateInvoiceInfo(invoiceInfoModel, userInfoId, userRole, orgRootId, cooperateState);
		} catch (Exception e) {
			log.error("发票管理信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "发票管理信息新增失败");
		}
		
		return jo;
	}
	
	/**
	 *组织部门查询初始化页面
	 *
	 *@author luojuan 2017年7月10日
	 */
	@RequestMapping(value = "/searchProjectInfoListPage")
	public String searchProjectInfoListPage(HttpServletRequest request, Model model){
		return "template/invoice/project_info_page";
	}
	
	/**
	 * 项目信息查询
	 * 
	 * @author luojuan 2017年7月4日
	 */
	@RequestMapping("/getProjectData")
	@ResponseBody
	public List<ProjectInfoPo> getProjectData(HttpServletRequest request, Model model) {
		List<ProjectInfoPo> projectList = null;
		
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf((String) params.get("page"));
		}
		// 条数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf((String) params.get("rows"));
		}
		
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		
		try {
			projectList = projectInfoFacade.findProjectInfoPoForPage(queryMap);
		} catch (Exception e) {
			log.error("项目信息查询异常",e);
		}
		
		return projectList;
	}
	
	/**
	 * 项目信息总数查询
	 * 
	 * @author luojuan 2017年7月4日
	 */
	@RequestMapping("/getProjectCount")
	@ResponseBody
	public Integer getProjectCount(HttpServletRequest request, Model model) {
		Integer count = null;
		
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf((String) params.get("page"));
		}
		// 条数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf((String) params.get("rows"));
		}
		
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		
		try {
			count = projectInfoFacade.countProjectInfoPoForPage(queryMap);
		} catch (Exception e) {
			log.error("项目信息查询异常",e);
		}
		return count;
	}
	
	/**
	 *客户编号查询初始化页面
	 *
	 *@author luojuan 2017年7月4日
	 */
	@RequestMapping(value = "/searchCustomerListPage")
	public String searchCustomerListPage(HttpServletRequest request, Model model){
		return "template/invoice/customer_info_page";
	}
	
	/**
	 * 客户编号查询
	 * 
	 * @author luojuan 2017年7月4日
	 */
	@RequestMapping("/getCustomerData")
	@ResponseBody
	public List<OrgInfoPo> getCustomerData(HttpServletRequest request, Model model) {
		List<OrgInfoPo> customerList = null;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer cooperateState = userInfo.getCooperateState(); 
		Integer orgRootId = userInfo.getOrgRootId();
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf((String) params.get("page"));
		}
		// 条数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf((String) params.get("rows"));
		}
		Integer type=Integer.parseInt(request.getParameter("type"));
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		
		if(type==1){
			
			//查询合作伙伴
			queryMap.put("originTeamCode", orgRootId);
			queryMap.put("isAvailable", 1);
			try {
				List<PartnerInfoPo> partnerList = partnerInfoFacade.findPartnerInfoForPage(queryMap);
				if (CollectionUtils.isNotEmpty(partnerList)) {
					// 获取合作伙伴编号
					List<Integer> partnerCodeList = CommonUtils.getValueList(partnerList, "partnerCode");
					if (CollectionUtils.isNotEmpty(partnerCodeList)) {
						customerList = orgInfoFacade.findOrgNameByIds(partnerCodeList);
					}
				}
			} catch (Exception e) {
				log.error("合作伙伴查询异常",e);
			}
		}else if(type==2){
			queryMap.put("rootOrgInfoId", orgRootId);
			queryMap.put("cooperateState1", 2);
			queryMap.put("userRole", 1);
			queryMap.put("currentPage", (page - 1) * rows);
			//查询客户(企业货主   半协同)
			customerList=orgInfoFacade.findEntrustMationByRootOrgInfoId(queryMap);
		}
		
		/*//协调状态为“协同”查询合作伙伴表，“半协同”查询组织结构表
		if(cooperateState==2){
			queryMap.put("originTeamCode", orgRootId);
			queryMap.put("isAvailable", 1);
			try {
				List<PartnerInfoPo> partnerList = partnerInfoFacade.findPartnerInfoForPage(queryMap);
				if (CollectionUtils.isNotEmpty(partnerList)) {
					// 获取合作伙伴编号
					List<Integer> partnerCodeList = CommonUtils.getValueList(partnerList, "partnerCode");
					if (CollectionUtils.isNotEmpty(partnerCodeList)) {
						customerList = orgInfoFacade.findOrgNameByIds(partnerCodeList);
					}
				}
			} catch (Exception e) {
				log.error("合作伙伴查询异常",e);
			}
			
		}else if(cooperateState==3){
			queryMap.put("rootOrgInfoId", orgRootId);
			queryMap.put("cooperateState", 3);
			try {
				customerList = orgInfoFacade.findOrgInfoByOfferParty(queryMap);
			} catch (Exception e) {
				log.error("组织机构查询异常",e);
			}
			
		}*/
		return customerList;
	}
	
	/**
	 * 客户编号总数查询
	 * 
	 * @author luojuan 2017年7月4日
	 */
	@RequestMapping("/getCustomerCount")
	@ResponseBody
	public Integer getCustomerCount(HttpServletRequest request, Model model) {
		Integer count = null;
		
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer cooperateState = userInfo.getCooperateState(); 
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf((String) params.get("page"));
		}
		// 条数  
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf((String) params.get("rows"));
		}
		Integer type=Integer.parseInt(request.getParameter("type"));

		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		
		if(type==1){
			
			//查询合作伙伴
			queryMap.put("originTeamCode", orgRootId);
			queryMap.put("isAvailable", 1);
			try {
				List<PartnerInfoPo> partnerList = partnerInfoFacade.findPartnerInfoForPage(queryMap);
				if (CollectionUtils.isNotEmpty(partnerList)) {
					// 获取合作伙伴编号
					List<Integer> partnerCodeList = CommonUtils.getValueList(partnerList, "partnerCode");
					if (CollectionUtils.isNotEmpty(partnerCodeList)) {
						 List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(partnerCodeList);
						 count=orgInfoPos.size();
					}
				}
			} catch (Exception e) {
				log.error("合作伙伴查询异常",e);
			}
		}else if(type==2){
			queryMap.put("rootOrgInfoId", orgRootId);
			queryMap.put("cooperateState1", 2);
			queryMap.put("userRole", 1);
			queryMap.put("currentPage", (page - 1) * rows);
			//查询客户(企业货主   半协同)
			count=orgInfoFacade.getEntrustCount(queryMap);
		}
		
		/*//协调状态为“协同”查询合作伙伴表，“半协同”查询组织结构表
		if(cooperateState==2){
			queryMap.put("originTeamCode", orgRootId);
			queryMap.put("isAvailable", 1);
			try {
				count = partnerInfoFacade.countPartnerInfoForPage(queryMap);
				}
			catch (Exception e) {
				log.error("合作伙伴总数查询异常",e);
			}
		}else if(cooperateState==3){
			queryMap.put("rootOrgInfoId", orgRootId);
			queryMap.put("cooperateState", 3);
			try {
				count = orgInfoFacade.findRootAndTwoLevelOrgInfoCount(queryMap);
			} catch (Exception e) {
				log.error("组织机构总数查询异常",e);
			}
		}*/
		return count;
	}
	
	/**
	 * 删除发票信息
	 * 
	 * @author luojuan 2017年7月10日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/deleteInvoiceInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteInvoiceInfo(HttpServletRequest request){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 被操作的发票主单ID
		List<Integer> invoiceInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("invoiceInfoIds"))) {
			String invoiceInfoIds = request.getParameter("invoiceInfoIds").trim();
			String[] invoiceArray = invoiceInfoIds.split(",");
			if(invoiceArray.length>0){
				for(String invoiceIdStr : invoiceArray){
					if(StringUtils.isNotBlank(invoiceIdStr)){
						invoiceInfoIdList.add(Integer.valueOf(invoiceIdStr.trim()));
					}
				}
			}
		}
		
		//所选发票信息不能为空
		if(CollectionUtils.isEmpty(invoiceInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选发票信息不能为空");
			return jo;
		}
		try {
			jo = invoiceInfoFacade.deleteInvoiceInfo(invoiceInfoIdList, orgRootId,userInfoId);
		} catch (Exception e) {
			log.error("发票信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "发票信息删除失败");
		}
		return jo;
	}
	
	/**
	 * 提交审核/审核发票信息
	 * 
	 * @author luojuan 2017年7月10日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/operateInvoice", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateInvoice(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 被操作的发票主单ID
		List<Integer> invoiceInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("invoiceInfoIds"))) {
			String invoiceInfoIds = request.getParameter("invoiceInfoIds").trim();
			String[] invoiceArray = invoiceInfoIds.split(",");
			if(invoiceArray.length>0){
				for(String invoiceIdStr : invoiceArray){
					if(StringUtils.isNotBlank(invoiceIdStr)){
						invoiceInfoIdList.add(Integer.valueOf(invoiceIdStr.trim()));
					}
				}
			}
		}
		
		//所选发票信息不能为空
		if(CollectionUtils.isEmpty(invoiceInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选发票信息不能为空");
			return jo;
		}
		// 操作类型 2:待审核 3:审核通过
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}
		//获取审核结果
		Integer auditResult = null;
		if (StringUtils.isNotBlank(request.getParameter("auditResult"))) {
			auditResult = Integer.valueOf(request.getParameter("auditResult"));
		}
		
		//获取审核意见
		String auditOpinion = request.getParameter("auditOpinion");
		
		try {
			jo = invoiceInfoFacade.updateInvoiceInfoByIdsAndOrgRootId(invoiceInfoIdList, orgRootId, operateType, userInfoId,auditResult,auditOpinion);
		} catch (Exception e) {
			log.error("发票信息操作异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "发票信息操作失败");
		}
		
		return jo;
	}
	
	/**
	 *对账单编号查询初始化页面
	 *
	 *@author luojuan 2017年7月11日
	 */
	@RequestMapping(value = "/searchAccountCheckListPage")
	public String searchAccountCheckListPage(HttpServletRequest request, Model model){
		return "template/invoice/account_check_info_page";
	}
	
	/**
	 * 对账单编号查询
	 * 
	 * @author luojuan 2017年7月11日
	 */
	@RequestMapping("/getAccountData")
	@ResponseBody
	public List<AccountCheckInfo> getAccountData(HttpServletRequest request, Model model) {
		List<AccountCheckInfo> accountCheckInfoList = null;
		
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Integer> queryMap = new HashMap<String, Integer>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf((String) params.get("page"));
		}
		// 条数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf((String) params.get("rows"));
		}
		
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		
		try {
			accountCheckInfoList = accountCheckInfoFacade.findAccountCheckInfoIdForPage(queryMap);
			
			for (AccountCheckInfo accountCheckInfo : accountCheckInfoList) {
				//查询对账单是否开过票，若开过部分或者全部开过，已开金额和未开金额则有变动
				UserInfo userInfoStr = (UserInfo)userInfoFacade.getUserInfoById(accountCheckInfo.getMakeUser());
				accountCheckInfo.setMakeUserName(userInfoStr.getUserName());
			}
			
			/*if (CollectionUtils.isNotEmpty(accountCheckInfoList)) {
				// 5、查询结算单
				List<Integer> settlementInfoIds = CommonUtils.getValueList(accountCheckInfoList, "settlementInfoId");
				settlementInfoList = settlementInfoFacade.findSettlementInfoByIds(settlementInfoIds);
				//转为map存放
				Map<Integer,SettlementInfo> settlementMap = CommonUtils.listforMap(settlementInfoList, "id", null);
					for(AccountCheckInfo accountCheckInfo:accountCheckInfoList){
						accountCheckInfo.setWaybillId(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getWaybillId());
						accountCheckInfo.setForwardingTonnage(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getForwardingTonnage());
						accountCheckInfo.setArriveTonnage(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getArriveTonnage());
						accountCheckInfo.setDeductionPrice(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getDeductionPrice());
						accountCheckInfo.setShipperPrice(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getShipperPrice());
						accountCheckInfo.setCustomerPrice(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getCustomerPrice());
						accountCheckInfo.setCarCode(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getCarCode());
						
						String forwardingTime = new SimpleDateFormat("yyyy-MM-dd").format(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getForwardingTime());
						accountCheckInfo.setForwardingTimeStr(forwardingTime);
						accountCheckInfo.setForwardingTime(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getForwardingTime());
						
						String arriveTimeStr = new SimpleDateFormat("yyyy-MM-dd").format(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getArriveTime());
						accountCheckInfo.setArriveTimeStr(arriveTimeStr);
						accountCheckInfo.setArriveTime(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getArriveTime());
						
						accountCheckInfo.setLoadingImg(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getLoadingImg());
						accountCheckInfo.setUnloadingImg(settlementMap.get(accountCheckInfo.getSettlementInfoId()).getUnloadingImg());
					}
			}*/
		} catch (Exception e) {
			log.error("对账单信息查询异常",e);
		}
		return accountCheckInfoList;
	}
	
	/**
	 * 对账单编号总数查询
	 * 
	 * @author luojuan 2017年7月13日
	 */
	@RequestMapping("/getAccountCount")
	@ResponseBody
	public Integer getAccountCount(HttpServletRequest request, Model model) {
		Integer count = null;
		
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Integer> queryMap = new HashMap<String, Integer>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf((String) params.get("page"));
		}
		// 条数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf((String) params.get("rows"));
		}
		
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		
		try {
			count = accountCheckInfoFacade.countAccountCheckInfoIdForPage(queryMap);
		} catch (Exception e) {
			log.error("对账单信息总数查询异常",e);
		}
		return count;
	}
	
	/**
	 *发票明细查询初始化页面
	 *
	 *@author luojuan 2017年7月13日
	 */
	@RequestMapping(value = "/searchInvoiceDetailListPage")
	public String searchInvoiceDetailListPage(HttpServletRequest request, Model model){
		return "template/invoice/invoice_detail_info_page";
	}
	
	/**
	 * 查询发票明细信息
	 * 
	 * @author luojuan 2017年7月13日
	 */
	@RequestMapping("/findInvoiceDetailInfo")
	@ResponseBody
	public List<InvoiceDetailInfoPo> findInvoiceDetailInfo(HttpServletRequest request, Model model) {
		List<InvoiceDetailInfoPo> invoiceDetailList = null;
		
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf((String) params.get("page"));
		}
		// 条数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf((String) params.get("rows"));
		}
		
		//发票主单Id
		Integer invoiceInfoId = Integer.valueOf(params.get("invoiceInfoId").toString());
		
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("invoiceInfoId", invoiceInfoId);
		queryMap.put("orgRootId", orgRootId);
		
		try {
			invoiceDetailList = invoiceDetailInfoFacade.findInvoiceDetailInfoByInvoiceInfoId(queryMap);
			for (InvoiceDetailInfoPo invoiceDetailInfoPo : invoiceDetailList) {/*
				String forwardingTime = new SimpleDateFormat("yyyy-MM-dd").format(invoiceDetailInfoPo.getForwardingTime());
				invoiceDetailInfoPo.setForwardingTimeStr(forwardingTime);
				
				String arriveTime = new SimpleDateFormat("yyyy-MM-dd").format(invoiceDetailInfoPo.getArriveTime());
				invoiceDetailInfoPo.setArriveTimeStr(arriveTime);
			*/}
		} catch (Exception e) {
			log.error("查询发票明细异常",e);
		}
		return invoiceDetailList;
	}
	
	/**
	 * 查询发票明细信息总数
	 * 
	 * @author luojuan 2017年7月14日
	 */
	@RequestMapping("/getInvoiceDetailInfoCount")
	@ResponseBody
	public Integer getInvoiceDetailInfoCount(HttpServletRequest request, Model model) {
		Integer count = null;
		
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf((String) params.get("page"));
		}
		// 条数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf((String) params.get("rows"));
		}
		
		//发票主单Id
		Integer invoiceInfoId = Integer.valueOf(params.get("invoiceInfoId").toString());
		
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("invoiceInfoId", invoiceInfoId);
		queryMap.put("orgRootId", orgRootId);
		
		try {
			count = invoiceDetailInfoFacade.countInvoiceDetailInfoByInvoiceInfoId(queryMap);
		} catch (Exception e) {
			log.error("查询发票明细总数异常",e);
		}
		
		return count;
	}
	
	/**
	 * 删除发票明细信息
	 * 
	 * @author luojuan 2017年7月14日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/deleteInvoiceDetailInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteInvoiceDetailInfo(HttpServletRequest request){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 被操作的发票明细ID
		List<Integer> invoiceDetailIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("invoiceDetailIds"))) {
			String invoiceDetailIds = request.getParameter("invoiceDetailIds").trim();
			String[] invoiceDetailArray = invoiceDetailIds.split(",");
			if(invoiceDetailArray.length>0){
				for(String invoiceDetailIdStr : invoiceDetailArray){
					if(StringUtils.isNotBlank(invoiceDetailIdStr)){
						invoiceDetailIdList.add(Integer.valueOf(invoiceDetailIdStr.trim()));
					}
				}
			}
		}
		
		//所选发票信息不能为空
		if(CollectionUtils.isEmpty(invoiceDetailIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选发票明细信息不能为空");
			return jo;
		}
		
		try {
			jo = invoiceInfoFacade.deleteInvoiceDetailInfo(invoiceDetailIdList, orgRootId);
		} catch (Exception e) {
			log.error("删除发票明细异常",e);
		}
		return jo;
	}
	
	/** 
	* @方法名: addInvoiceImagePage 
	* @作者: zhangshuai
	* @时间: 2017年10月26日 下午1:15:42
	* @返回值类型: String 
	* @throws 
	* 发票附件
	*/
	@RequestMapping(value="/addInvoiceImagePage")
	public String addInvoiceImagePage(HttpServletRequest request,HttpServletResponse response,Model model,Integer id){
		
		//根据前台传进的发票id查询发票附件表
		List<InvoiceImageInfoPo> invoiceImageInfoPos=invoiceImageInfoPoFacade.findInvoiceImageByInvoiceId(id);
		List<String> imageList=new ArrayList<String>();
		for (InvoiceImageInfoPo invoiceImageInfoPo : invoiceImageInfoPos) {
			imageList.add(invoiceImageInfoPo.getInvoiceImage());
		}
		
		InvoiceImageModel imageModel=new InvoiceImageModel();
		for(int i=0;i<imageList.size();i++){
			
			switch (i) {
			case 0:
				imageModel.setFirstInvoiceImage(imageList.get(0));
				break;
			case 1:
				imageModel.setSecondInvoiceImage(imageList.get(1));
				break;
			case 2:
				imageModel.setThirdInvoiceImage(imageList.get(2));	
				break;
			case 3:
				imageModel.setFourthInvoiceImage(imageList.get(3));
				break;
			case 4:
				imageModel.setFifthInvoiceImage(imageList.get(4));
				break;
			case 5:
				imageModel.setSixthInvoiceImage(imageList.get(5));
				break;
			case 6:
				imageModel.setSeventhInvoiceImage(imageList.get(6));
				break;
			case 7:
				imageModel.setEighthInvoiceImage(imageList.get(7));
				break;
			case 8:
				imageModel.setNinthInvoiceImage(imageList.get(8));	
				break;
			case 9:
				imageModel.setTenthInvoiceImage(imageList.get(9));
				break;
			case 10:
				imageModel.setEleventhInvoiceImage(imageList.get(10));
				break;
			case 11:
				imageModel.setTwelfthInvoiceImage(imageList.get(11));	
				break;
			case 12:
				imageModel.setThirteenthInvoiceImage(imageList.get(12));
				break;
			case 13:
				imageModel.setFourteenthInvoiceImage(imageList.get(13));
				break;
			case 14:
				imageModel.setFifteenthInvoiceImage(imageList.get(14));	
				break;
			case 15:
				imageModel.setSixteenthInvoiceImage(imageList.get(15));
				break;
			case 16:
				imageModel.setSeventeenthInvoiceImage(imageList.get(16));
				break;
			case 17:
				imageModel.setEighteenthInvoiceImage(imageList.get(17));	
				break;
			case 18:
				imageModel.setNineteenthInvoiceImage(imageList.get(18));
				break;
			case 19:
				imageModel.setTwentiethInvoiceImage(imageList.get(19));	
				break;
			case 20:
				imageModel.setTwentyFirstInvoiceImage(imageList.get(20));
				break;
			case 21:
				imageModel.setTwentySecondInvoiceImage(imageList.get(21));	
				break;
			case 22:
				imageModel.setTwentyThirdInvoiceImage(imageList.get(22));
				break;
			case 23:
				imageModel.setTwentyFourthInvoiceImage(imageList.get(23));
				break;
			case 24:
				imageModel.setTwentyFifthInvoiceImage(imageList.get(24));	
				break;
			case 25:
				imageModel.setTwentySixthInvoiceImage(imageList.get(25));
				break;
			case 26:
				imageModel.setTwentySeventhInvoiceImage(imageList.get(26));
				break;
			case 27:
				imageModel.setTwentyEighthInvoiceImage(imageList.get(27));	
				break;
			case 28:
				imageModel.setTwentyNinthInvoiceImage(imageList.get(28));
				break;
			case 29:
				imageModel.setThirtiethInvoiceImage(imageList.get(29));	
				break;	
			}
		}
		String image="新增发票附件";
		model.addAttribute("invoiceImage", image);
		model.addAttribute("imageModel", imageModel);
		return "template/invoice/add_invoice_image_page";
	}
	
	//新增发票附件
	@RequestMapping(value="/addInvoiceImage")
	@ResponseBody
	public JSONObject addInvoiceImage(HttpServletRequest request,HttpServletResponse response,InvoiceImageModel invoiceImageModel){
		JSONObject jo=new JSONObject();
		
		List<InvoiceImageModel> invoiceImageList=new ArrayList<InvoiceImageModel>();
		
		//判断前台传进的地址时候为空
		//1
		if(StringUtils.isNotBlank(invoiceImageModel.getFirstInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getFirstInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//2
		if(StringUtils.isNotBlank(invoiceImageModel.getSecondInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getSecondInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//3
		if(StringUtils.isNotBlank(invoiceImageModel.getThirdInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getThirdInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//4
		if(StringUtils.isNotBlank(invoiceImageModel.getFourthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getFourthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//5
		if(StringUtils.isNotBlank(invoiceImageModel.getFifthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getFifthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//6
		if(StringUtils.isNotBlank(invoiceImageModel.getSixthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getSixthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//7
		if(StringUtils.isNotBlank(invoiceImageModel.getSeventhInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getSeventhInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		
		//8
		if(StringUtils.isNotBlank(invoiceImageModel.getEighthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getEighthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		
		
		//9
		if(StringUtils.isNotBlank(invoiceImageModel.getNinthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getNinthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
				
		//10
		if(StringUtils.isNotBlank(invoiceImageModel.getTenthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTenthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		
		//11
		if(StringUtils.isNotBlank(invoiceImageModel.getEleventhInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getEleventhInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//12
		if(StringUtils.isNotBlank(invoiceImageModel.getTwelfthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwelfthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//13
		if(StringUtils.isNotBlank(invoiceImageModel.getThirteenthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getThirteenthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//14
		if(StringUtils.isNotBlank(invoiceImageModel.getFourteenthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getFourteenthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//15
		if(StringUtils.isNotBlank(invoiceImageModel.getFifteenthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getFifteenthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//16
		if(StringUtils.isNotBlank(invoiceImageModel.getSixteenthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getSixteenthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//17
		if(StringUtils.isNotBlank(invoiceImageModel.getSeventhInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getSeventhInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		
		//18
		if(StringUtils.isNotBlank(invoiceImageModel.getSeventeenthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getSeventeenthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		
		
		//19
		if(StringUtils.isNotBlank(invoiceImageModel.getNineteenthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getNineteenthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
				
		//20
		if(StringUtils.isNotBlank(invoiceImageModel.getTwentiethInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwentiethInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		
		//21
		if(StringUtils.isNotBlank(invoiceImageModel.getTwentyFirstInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwentyFirstInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//22
		if(StringUtils.isNotBlank(invoiceImageModel.getTwentySecondInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwentySecondInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//23
		if(StringUtils.isNotBlank(invoiceImageModel.getTwentyThirdInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwentyThirdInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//24
		if(StringUtils.isNotBlank(invoiceImageModel.getTwentyFourthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwentyFourthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//25
		if(StringUtils.isNotBlank(invoiceImageModel.getTwentyFifthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwentyFifthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//26
		if(StringUtils.isNotBlank(invoiceImageModel.getTwentySixthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwentySixthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		//27
		if(StringUtils.isNotBlank(invoiceImageModel.getTwentySeventhInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwentySeventhInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		
		//28
		if(StringUtils.isNotBlank(invoiceImageModel.getTwentyEighthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwentyEighthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		
		
		//29
		if(StringUtils.isNotBlank(invoiceImageModel.getTwentyNinthInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getTwentyNinthInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
				
		//30
		if(StringUtils.isNotBlank(invoiceImageModel.getThirtiethInvoiceImage())){
			InvoiceImageModel invoiceImageModel2=new InvoiceImageModel();
			invoiceImageModel2.setInvoiceInfoId(invoiceImageModel.getInvoiceInfoId());
			invoiceImageModel2.setImageUrl(invoiceImageModel.getThirtiethInvoiceImage());
			invoiceImageList.add(invoiceImageModel2);
		}
		
		//判断是否存在数据
		List<InvoiceImageInfoPo> invoiceImageInfoPos=invoiceImageInfoPoFacade.findInvoiceImageByInvoiceId(invoiceImageModel.getInvoiceInfoId());
		if(invoiceImageInfoPos.size()>0){
			//新增前先删除
			try {
				invoiceImageInfoPoFacade.deleteInvoiceImageById(invoiceImageModel.getInvoiceInfoId());
			} catch (Exception e1) {
				log.error("根据发票主id删除发票附件",e1);
			}
		}
		
		//批量新增数据
		try {
			invoiceImageInfoPoFacade.addInvoiceImage(invoiceImageList);
			jo.put("success", true);
			jo.put("msg", "保存成功!");
		} catch (Exception e) {
			log.error("新增发票附件信息异常",e);
			jo.put("success", false);
			jo.put("msg", "保存失败!");
		}
		
		return jo;
	}
	
}
