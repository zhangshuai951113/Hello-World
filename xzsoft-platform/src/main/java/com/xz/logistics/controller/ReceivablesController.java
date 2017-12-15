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

import com.alibaba.dubbo.common.json.JSON;
import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.ContractInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.PartnerInfoFacade;
import com.xz.facade.api.ProjectInfoFacade;
import com.xz.facade.api.ReceivablesInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.ContractInfo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.PartnerInfoPo;
import com.xz.model.po.ProjectInfoPo;
import com.xz.model.po.ReceivablesInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.ReceivablesModel;

/**
 * 收款管理controller
 * 
 * @author luojuan 2017年7月3日
 *
 */
@Controller
@RequestMapping("/receivablesInfo")
public class ReceivablesController extends BaseController{
	
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private ReceivablesInfoFacade receivablesInfoFacade;
	
	@Resource
	private ProjectInfoFacade projectInfoFacade;
	
	@Resource
	private PartnerInfoFacade partnerInfoFacade;
	
	@Resource
	private OrgInfoFacade orgInfoFacade;
	
	@Resource
	private UserInfoFacade userInfoFacade;
	
	@Resource
	private ContractInfoFacade contractInfoFacade;
	
	/**
	 * 收款管理初始化页面
	 * 
	 * @author luojuan 2017年7月3日
	 */
	@RequestMapping("/rootReceivablesInfolistPage")
	public String rootReceivablesInfolistPage(HttpServletRequest request, Model model){
		return "template/receivables/show_receivables_info_list_page";
	}
	
	/**
	 * 收款管理查询（分页）
	 * 
	 * @author luojuan 2017年7月3日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showReceivablesInfolistPage")
	public String showReceivablesInfolistPage(HttpServletRequest request, Model model){
		DataPager<ReceivablesInfoPo> receivablesInfoPager = new DataPager<ReceivablesInfoPo>();
		
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
		receivablesInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		receivablesInfoPager.setSize(rows);
		
		//客户名称
		String customerId = null;
		if (params.get("customerId") != null) {
			customerId = params.get("customerId").toString();
		}
		
		//组织部门
		String projectInfoId = null;
		if (params.get("projectInfoId") != null) {
			projectInfoId = params.get("projectInfoId").toString();
		}
		
		//收款金额
		Integer receivablePrice = null;
		if (params.get("receivablePrice") != null) {
			receivablePrice = Integer.valueOf(params.get("receivablePrice").toString());
		}
		
		//到款日期Start
		String arrivalPriceDateStartStr = null;
		Date arrivalPriceDateStart = null;
		if(params.get("arrivalPriceDateStart") != null){
			arrivalPriceDateStartStr = params.get("arrivalPriceDateStart").toString();
			
			try {
				arrivalPriceDateStart = new SimpleDateFormat("yyyy-MM-dd").parse(arrivalPriceDateStartStr);
				
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		
		//到款日期End
		String arrivalPriceDateEndStr = null;
		Date arrivalPriceDateEnd = null;
		if(params.get("arrivalPriceDateEnd") != null){
			arrivalPriceDateEndStr = params.get("arrivalPriceDateEnd").toString();
			
			try {
				arrivalPriceDateEnd = new SimpleDateFormat("yyyy-MM-dd").parse(arrivalPriceDateEndStr);
				
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		
		//收款类型
		Integer receivableType = null;
		if (params.get("receivableType") != null) {
			receivableType = Integer.valueOf(params.get("receivableType").toString());
		}
		
		//收款分类
		Integer receivableClassify = null;
		if (params.get("receivableClassify") != null) {
			receivableClassify = Integer.valueOf(params.get("receivableClassify").toString());
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("customerId", customerId);
		queryMap.put("projectInfoId", projectInfoId);
		queryMap.put("receivablePrice", receivablePrice);
		queryMap.put("arrivalPriceDateStart", arrivalPriceDateStart);
		queryMap.put("arrivalPriceDateEnd", arrivalPriceDateEnd);
		queryMap.put("receivableType", receivableType);
		queryMap.put("receivableClassify", receivableClassify);
		
		//3、查询收费管理总数
		Integer totalNum = receivablesInfoFacade.countReceivablesInfoForPage(queryMap);
		
		//4、分页查询收费管理
		List<ReceivablesInfoPo> ReceivablesInfoList = receivablesInfoFacade.findReceivablesInfoForPage(queryMap);
		
		for(ReceivablesInfoPo receivablesInfoPo : ReceivablesInfoList){
			//前台获取制单人姓名
			UserInfo userInfoStr = (UserInfo)userInfoFacade.getUserInfoById(receivablesInfoPo.getMakeUser());
			receivablesInfoPo.setMakeUserName(userInfoStr.getUserName());
			
			//前台获取主机构ID
			OrgInfoPo orgInfo = orgInfoFacade.getOrgInfoByOrgInfoId(receivablesInfoPo.getOrgRootId());
			String orgInfoName = "";
			orgInfoName = orgInfo.getOrgDetailInfo().getOrgName();
			receivablesInfoPo.setOrgName(orgInfoName);
			
			//客户编号
			if(receivablesInfoPo.getCustomerId() != null){
				OrgInfoPo customer = orgInfoFacade.getOrgInfoByOrgInfoId(receivablesInfoPo.getCustomerId());
				String customerName = "";
				customerName = customer.getOrgDetailInfo().getOrgName();
				receivablesInfoPo.setCustomerName(customerName);
			}
			
			//组织部门
			if(receivablesInfoPo.getProjectInfoId() != null){
				ProjectInfoPo project =  projectInfoFacade.getProjectInfoPoById(receivablesInfoPo.getProjectInfoId());
				String projectName = project.getProjectName();
				receivablesInfoPo.setProjectInfoName(projectName);
			}
		}
		
		//5、总数、分页信息封装
		receivablesInfoPager.setTotal(totalNum);
		receivablesInfoPager.setRows(ReceivablesInfoList);
		model.addAttribute("userRole",userRole);
		model.addAttribute("receivablesInfoPager",receivablesInfoPager);
		
		return "template/receivables/receivables_info_data";
	}
	
	/**
	 * 新增/编辑收费信息初始页
	 * 
	 * @author luojuan 2017年7月4日
	 * @param request
	 * @param model
	 * @return 
	 */
	@RequestMapping("/initReceivablesPage")
	public String initReceivablesPage(HttpServletRequest request, Model model){
		
		// 取出操作类型(1:新增 2:编辑)
		String operateType1 = request.getParameter("operateType");
		Integer operateType = Integer.parseInt(operateType1);
		String operateTitle = "";

		if(operateType==1){
			operateTitle = "新增收费信息";
		}else{
			operateTitle = "编辑收费信息";
			Integer receivablesInfoId = Integer.parseInt(request.getParameter("receivablesInfoId"));
			ReceivablesInfoPo receivablesInfo = receivablesInfoFacade.getReceivablesInfoById(receivablesInfoId);
			
			//判断收款信息是否为起草状态，非起草状态则提示
			if(receivablesInfo.getReceivableStatus() !=1){
				JSONObject jo = new JSONObject();
				jo.put("success", false);
				jo.put("msg", "收款单已确认！");
				model.addAttribute("content", receivablesInfo.getReceivableStatus());
				return "template/receivables/prompt_box_page1";
			}
			
			//组织部门
			if (receivablesInfo.getProjectInfoId() != null) {
				ProjectInfoPo projectInfo = projectInfoFacade.getProjectInfoPoById(receivablesInfo.getProjectInfoId());
				model.addAttribute("projectInfoName", projectInfo.getProjectName());
			}
			// 客户编号显示名称
			if (receivablesInfo.getCustomerId() != null) {
				List<OrgInfoPo> orgList = orgInfoFacade.getOrgInfosByRootOrgInfoId(receivablesInfo.getCustomerId());
				for(OrgInfoPo orgInfoPo:orgList){
					model.addAttribute("customerName", orgInfoPo.getOrgName());
				}
			}
			// 合同
			if (receivablesInfo.getContractInfoId() != null) {
				List<Integer> list = new ArrayList<Integer>();
				list.add(receivablesInfo.getContractInfoId());
				List<ContractInfo> contractInfos = contractInfoFacade.getBaseContractInfoByIds(list);
				for (ContractInfo contractInfo : contractInfos) {
					model.addAttribute("contractInfoName", contractInfo.getContractName());
				}
				
				
			}
			
			
			model.addAttribute("receivablesInfoPo", receivablesInfo);
		}
		model.addAttribute("operateTitle", operateTitle);
		
		return "template/receivables/init_receivables_page";
	}
	
	/**
	 * 新增/编辑收费信息
	 * 
	 * @author luojuan 2017年7月4日
	 * @param request
	 * @param receivablesModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateReceivable" ,produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateReceivable(HttpServletRequest request,ReceivablesModel receivablesModel){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID、用户ID、用户角色、协同状态
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		Integer cooperateState = userInfo.getCooperateState();
		
		try {
			jo = receivablesInfoFacade.addOrUpdateReceivableInfo(receivablesModel, userInfoId, userRole, orgRootId, cooperateState);
		} catch (Exception e) {
			log.error("收款管理信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "收款信息新增失败");
		}
		return jo;
	}
	
	/**
	 *组织部门查询初始化页面
	 *
	 *@author luojuan 2017年7月4日
	 */
	@RequestMapping(value = "/searchProjectInfoListPage")
	public String searchProjectInfoListPage(HttpServletRequest request, Model model){
		return "template/receivables/project_info_page";
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
		return "template/receivables/customer_info_page";
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
		
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		
		//协调状态为“协同”查询合作伙伴表，“半协同”查询组织结构表
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
			
		}
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
		
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		
		//协调状态为“协同”查询合作伙伴表，“半协同”查询组织结构表
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
		}
		return count;
	}
	
	/**
	 * 删除收款信息
	 * 
	 * @author luojuan 2017年7月5日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/deleteReceivablesInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteReceivablesInfo(HttpServletRequest request){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 被操作的收款ID
		List<Integer> receivablesInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("receivablesInfoIds"))) {
			String receivablesInfoIds = request.getParameter("receivablesInfoIds").trim();
			String[] receivablesArray = receivablesInfoIds.split(",");
			if(receivablesArray.length>0){
				for(String receivablesIdStr : receivablesArray){
					if(StringUtils.isNotBlank(receivablesIdStr)){
						receivablesInfoIdList.add(Integer.valueOf(receivablesIdStr.trim()));
					}
				}
			}
		}
		
		//所选收款信息不能为空
		if(CollectionUtils.isEmpty(receivablesInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选收款信息不能为空");
			return jo;
		}
		
		try {
			jo = receivablesInfoFacade.deleteReceivablesInfoById(receivablesInfoIdList, orgRootId);
		} catch (Exception e) {
			log.error("收款信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "收款信息删除失败");
		}
		return jo;
	}
	
	
	/**
	 * 确认收款信息
	 * 
	 * @author luojuan 2017年7月5日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/operateReceivables", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateReceivables(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		
		// 被操作的收款ID
		List<Integer> receivablesInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("receivablesInfoIds"))) {
			String receivablesInfoIds = request.getParameter("receivablesInfoIds").trim();
			String[] receivablesArray = receivablesInfoIds.split(",");
			if(receivablesArray.length>0){
				for(String receivablesIdStr : receivablesArray){
					if(StringUtils.isNotBlank(receivablesIdStr)){
						receivablesInfoIdList.add(Integer.valueOf(receivablesIdStr.trim()));
					}
				}
			}
		}
		
		//所选收款信息不能为空
		if(CollectionUtils.isEmpty(receivablesInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选收款信息不能为空");
			return jo;
		}
		
		// 操作类型 2:已确认 
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}
		
		try {
			jo = receivablesInfoFacade.updateReceivableStatusByOrgRootId(userInfoId, userRole, receivablesInfoIdList, operateType);
		} catch (Exception e) {
			log.error("操作收款信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "收款信息操作失败");
		}
		return jo;
	}
	
	/**
	 * @Title: showContractListPage  
	 * @Description: 显示合同列表界面
	 * @author zhenghaiyang 
	 * @date  2017年11月3日 
	 * @return String
	 */
	
	@RequestMapping("/showContractListPage")
	public String showContractListPage(){
		return "template/receivables/contract_info_page";
	}
	
	/**
	 * @Title: getContractInfos  
	 * @Description: 查询合同信息
	 * @author zhenghaiyang 
	 * @date  2017年11月3日 
	 * @return JSONObject
	 */
	@RequestMapping("/getContractInfos")
	@ResponseBody
	public JSONObject getContractInfos(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		try {
			// 当前登陆用户信息
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			if (userInfo == null) {
				jo.put("success", false);
				jo.put("msg", "用户信息为空，请重新登陆");
				return jo;
			}
			Integer orgInfoId = userInfo.getOrgInfoId();
			Integer orgRootId = userInfo.getOrgRootId();
			
			// 获取参数
			// page
			Integer page = 1;
			if (StringUtils.isNotBlank(request.getParameter("page"))) {
				page = Integer.valueOf(request.getParameter("page"));
			}
			// rows
			Integer rows = 10;
			if (StringUtils.isNotBlank(request.getParameter("rows"))) {
				rows = Integer.valueOf(request.getParameter("rows"));
			}
			// 合同名称 contractInfoName
			String contractInfoName = null;
			if (StringUtils.isNotBlank(request.getParameter("contractInfoName"))) {
				contractInfoName = request.getParameter("contractInfoName");
			}
			
			// 查询合同信息（物流合同、主机构可以看子机构、子机构只能看自己的）
			// 封装查询参数
			Map<String, Object> queryMap = new HashMap<String, Object>();
			queryMap.put("orgInfoId", orgInfoId);
			queryMap.put("orgRootId", orgRootId);
			queryMap.put("contractInfoName", contractInfoName);
			queryMap.put("start", (page-1)*rows);
			queryMap.put("rows", rows);
			
			// 查询合同列表信息
			List<ContractInfo> list = contractInfoFacade.getContractInfoListForReceive(queryMap);
			
			// 查询合同数量
			Integer count = contractInfoFacade.getContractInfoCountForReceive(queryMap);
			
			jo.put("success", true);
			jo.put("list", list);
			jo.put("count", count);
			
		} catch (Exception e) {
			log.error(e.getMessage());
			jo.put("success", false);
			jo.put("msg", "服务请求异常");
		}
		
		
		
		return jo;
	}
}
