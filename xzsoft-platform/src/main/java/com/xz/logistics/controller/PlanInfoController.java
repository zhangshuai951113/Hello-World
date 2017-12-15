package com.xz.logistics.controller;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.facade.api.ContractDetailInfoFacade;
import com.xz.facade.api.ContractInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.MaterialCategoryFacade;
import com.xz.facade.api.OrgDetailInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.PlanAuditLogFacade;
import com.xz.facade.api.PlanDistributeLogFacade;
import com.xz.facade.api.PlanInfoFacade;
import com.xz.facade.api.PlanRetractLogFacade;
import com.xz.facade.api.PlanSubmitAuditLogFacade;
import com.xz.facade.api.ProjectInfoFacade;
import com.xz.facade.api.TransportDayPlanFacade;
import com.xz.facade.api.UserDataAuthFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.model.po.ContractDetailInfo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.MaterialCategoryPo;
import com.xz.model.po.OrgDetailInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.PlanAuditLogPo;
import com.xz.model.po.PlanInfoPo;
import com.xz.model.po.ProjectInfoPo;
import com.xz.model.po.TransportDayPlanPo;
import com.xz.model.po.UserDataAuthPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillInfoPo;
import com.xz.model.vo.PlanInfoModel;


/**
* @author zhangshuai   2017年6月17日 下午12:34:01
* 类说明(计划表controller)
*/
@Controller
@RequestMapping("/planInfo")
public class PlanInfoController {

	private final Logger log = LoggerFactory.getLogger(getClass());
	@Resource
	private LineInfoFacade lineInfoFacade;
	@Resource
	private ContractInfoFacade contractInfoFacade;
	@Resource
	private ContractDetailInfoFacade contractDetailInfoFacade;
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
    @Resource
    private ProjectInfoFacade projectInfoFacade;
    @Resource
    private OrgDetailInfoFacade orgDetailInfoFacade;
    @Resource
    private PlanInfoFacade planInfoFacade;
    @Resource
    private UserDataAuthFacade userDataAuthFacade;
    @Resource
    private OrgInfoFacade orgInfoFacade;
    @Resource
    private PlanDistributeLogFacade planDistributeLogFacade;
    @Resource
    private PlanRetractLogFacade planRetractLogFacade;
    @Resource
    private PlanAuditLogFacade planAuditLogFacade;
    @Resource
    private PlanSubmitAuditLogFacade planSubmitAuditLogFacade;
    @Resource
    private IndividualOwnerFacade  individualOwnerFacade;
    @Resource
    private UserInfoFacade userInfoFacade;
    @Resource
    private MaterialCategoryFacade materialCategoryFacade;
    @Resource
    private WaybillInfoFacade waybillInfoFacade;
    @Resource
    private TransportDayPlanFacade transportDayPlanFacade;
    @Resource
    private DriverInfoFacade driverInfoFacade;
    
    /**========================== 大宗货物物流计划 =======================*/
	/**
	 * @author zhangshuai  2017年6月17日 下午12:39:19
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入大宗货物计划页面
	 */
	@RequestMapping(value="/goPlanInfoPage",produces="application/json;charset=utf-8")
	public String goPlanInfoPage(HttpServletRequest request,HttpServletResponse response,Model model){
		
		String planInfoMation="大宗货物计划管理";
		model.addAttribute("planInfoMation", planInfoMation);
		//查询所有线路
		List<LineInfoPo> lineName=lineInfoFacade.findLineInfoNameAll();
		
		model.addAttribute("lineName", lineName);
		return "template/planInfo/LogisticsPlan/plan_info_page";
	}
	
	
	/**
	 * @author zhangshuai  2017年6月17日 下午5:23:56
	 * @param request
	 * @param response
	 * @return
	 * 计划信息全查
	 */
	@RequestMapping(value="/findPlanInfoAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<PlanInfoPo> findPlanInfoAll(HttpServletRequest request,HttpServletResponse response,PlanInfoModel planInfoModel){
		
		//从session中获取到登录用户的主机构ID和用户ID
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer userRole=userInfo.getUserRole();
		
		//接收参数
		String startDate=request.getParameter("startDate");
		String endDate=request.getParameter("endDate");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		String planName=request.getParameter("planName");
		String goodsInfoId=request.getParameter("goodsInfoId");
		String lineInfoId=request.getParameter("lineInfoId");
		String cooperateStatus=request.getParameter("cooperateStatus");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String planStatus=request.getParameter("planStatus");
		
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("uId", uId);
		params.put("uOrgRootId", uOrgRootId);
		
		
		//根据登录用户的主机构和ID查询用户权限表
		List<UserDataAuthPo> userDataAuthPo=userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params);
		List<String> conditionGroupList=new ArrayList<String>();
		for (UserDataAuthPo userDataAuthPo2 : userDataAuthPo) {
			if(userDataAuthPo2!=null){
				String conditionGroup=userDataAuthPo2.getConditionGroup();
				conditionGroupList.add(conditionGroup);
			}
		}
		
		//将登录用户条件组信息存入session
		request.getSession().setAttribute("conditionGroupList", conditionGroupList);
		if(CollectionUtils.isEmpty(conditionGroupList)){
			conditionGroupList.add("0");
		}
		//封装参数
		Map<String, Object> params1=new HashMap<String,Object>();
		params1.put("uOrgRootId", uOrgRootId);
		params1.put("conditionGroupList", conditionGroupList);
		params1.put("startDate", startDate);
		params1.put("endDate", endDate);
		params1.put("currentPage", currentPage);
		params1.put("planName", planName);
		params1.put("rows", rows);
		params1.put("goodsInfoId", goodsInfoId);
		params1.put("lineInfoId", lineInfoId);
		params1.put("cooperateStatus", cooperateStatus);
		params1.put("entrust", entrust);
		params1.put("shipper", shipper);
		params1.put("forwardingUnit", forwardingUnit);
		params1.put("consignee", consignee);
		params1.put("planStatus", planStatus);
		params1.put("plantype", 1);
		//根据登录用户主机构ID和用户权限条件组查询计划表
		List<PlanInfoPo> planInfoPoList=planInfoFacade.findPlanInfoByUOrgRootIdAndConditionGroup(params1);
		
		//封装创建人
		List<Integer> userIds=CommonUtils.getValueList(planInfoPoList, "createUser");
		//key:用户ID   value=用户名
		Map<Integer, String> userNameMap=null;
		if(CollectionUtils.isNotEmpty(userIds)){
			List<UserInfo> userNames = userInfoFacade.findUserNameByIds(userIds);
			if(CollectionUtils.isNotEmpty(userNames)){
				userNameMap=CommonUtils.listforMap(userNames, "id", "userName");
			}
		}
		
		//封装委托方
		List<Integer> entrustIds=CommonUtils.getValueList(planInfoPoList, "entrust");
		Map<Integer, String> entrustMap=null;
		if(CollectionUtils.isNotEmpty(entrustIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(entrustIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				entrustMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		
		//封装承运方
		List<Integer> orgIds=CommonUtils.getValueList(planInfoPoList, "shipper");
		Map<Integer, String> shipperMap=null;
		if(CollectionUtils.isNotEmpty(orgIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				shipperMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		
		//封装货物
		List<Integer> goodsIds=CommonUtils.getValueList(planInfoPoList, "goodsInfoId");
		Map<Integer, String> goodsMap=null;
		if(CollectionUtils.isNotEmpty(goodsIds)){
			List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}
		}
		
		//封装线路
		List<Integer> lineIds=CommonUtils.getValueList(planInfoPoList, "lineInfoId");
		Map<Integer, String> lineMap=null;
		if(CollectionUtils.isNotEmpty(lineIds)){
			List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineIds);
			if(CollectionUtils.isNotEmpty(lineInfoPos)){
				lineMap=CommonUtils.listforMap(lineInfoPos, "id", "lineName");
			}
		}
		
		for (PlanInfoPo planInfoPo : planInfoPoList) {
			
		
			planInfoPo.setSplitSum(planInfoPo.getSplitSum());
			planInfoPo.setRemainingSum(planInfoPo.getPlanSum().subtract(planInfoPo.getSplitSum()));
			//封装承运方
			if(MapUtils.isNotEmpty(shipperMap)&&shipperMap.get(planInfoPo.getShipper())!=null){
				planInfoPo.setShipperName(shipperMap.get(planInfoPo.getShipper()));
			}
			//封装委托方
			if(MapUtils.isNotEmpty(entrustMap)&&entrustMap.get(planInfoPo.getEntrust())!=null){
				planInfoPo.setEntrustName(entrustMap.get(planInfoPo.getEntrust()));
			}
			
			//封装货物
			if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(planInfoPo.getGoodsInfoId())!=null){
				planInfoPo.setGoodsName(goodsMap.get(planInfoPo.getGoodsInfoId()));
			}
			
			//封装线路
			if(MapUtils.isNotEmpty(lineMap)&&lineMap.get(planInfoPo.getLineInfoId())!=null){
				planInfoPo.setLineName(lineMap.get(planInfoPo.getLineInfoId()));
			}
			
			//封装创建人
			if(MapUtils.isNotEmpty(userNameMap)&&userNameMap.get(planInfoPo.getCreateUser())!=null){
				planInfoPo.setUserName(userNameMap.get(planInfoPo.getCreateUser()));
			}
			planInfoPo.setUserRole(userRole);
		} 
		return planInfoPoList;
	}
	
	/**
	 * @author zhangshuai  2017年6月21日 下午1:28:36
	 * @return
	 * 查询计划最大记录数
	 */
	@RequestMapping(value="/getPlanInfoCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getPlanInfoCount(HttpServletRequest request,HttpServletResponse response){
		//从session中获取到登录用户的主机构ID和用户ID
				UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
				Integer uId=userInfo.getId();
				Integer uOrgRootId=userInfo.getOrgRootId();
				Integer count=null;
				
				//接收参数
				String startDate=request.getParameter("startDate");
				String endDate=request.getParameter("endDate");
				Integer page=Integer.parseInt(request.getParameter("page"));
				Integer rows=Integer.parseInt(request.getParameter("rows"));
				Integer currentPage=page*rows;
				String planName=request.getParameter("planName");
				String goodsInfoId=request.getParameter("goodsInfoId");
				String lineInfoId=request.getParameter("lineInfoId");
				String cooperateStatus=request.getParameter("cooperateStatus");
				String entrust=request.getParameter("entrust");
				String shipper=request.getParameter("shipper");
				String forwardingUnit=request.getParameter("forwardingUnit");
				String consignee=request.getParameter("consignee");
				String planStatus=request.getParameter("planStatus");
				
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("uId", uId);
				params.put("uOrgRootId", uOrgRootId);
				
				//根据登录用户的主机构和ID查询用户权限表
				List<UserDataAuthPo> userDataAuthPo=userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params);
				List<String> conditionGroupList=new ArrayList<String>();
				for (UserDataAuthPo userDataAuthPo2 : userDataAuthPo) {
					if(userDataAuthPo2!=null){
						String conditionGroup=userDataAuthPo2.getConditionGroup();
						conditionGroupList.add(conditionGroup);
				}
				
				}
				
				//封装参数
				Map<String, Object> params1=new HashMap<String,Object>();
				params1.put("uOrgRootId", uOrgRootId);
				params1.put("conditionGroupList", conditionGroupList);
				params1.put("startDate", startDate);
				params1.put("endDate", endDate);
				params1.put("currentPage", currentPage);
				params1.put("planName", planName);
				params1.put("rows", rows);
				params1.put("goodsInfoId", goodsInfoId);
				params1.put("lineInfoId", lineInfoId);
				params1.put("cooperateStatus", cooperateStatus);
				params1.put("entrust", entrust);
				params1.put("shipper", shipper);
				params1.put("forwardingUnit", forwardingUnit);
				params1.put("consignee", consignee);
				params1.put("planStatus", planStatus);
				params1.put("plantype", 1);
				count=planInfoFacade.getPlanInfoCount(params1);
				
				return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月17日 下午5:24:55
	 * @return
	 * 进入添加计划信息模态框
	 */
	@RequestMapping(value="/addPlanInfoModel",produces="application/json;charset=utf-8")
	public String addPlanInfoModel(HttpServletResponse response ,HttpServletRequest request,Model model){
		
		String addPlanInfo="新增计划信息";
		model.addAttribute("addPlanInfo", addPlanInfo);
		return "template/planInfo/LogisticsPlan/add_plan_info_page";
	}
	
	
	/**
	 * @author zhangshuai  2017年6月17日 下午6:08:14
	 * @param request
	 * @param response
	 * @return
	 * 进入查询合同信息页面
	 */
	@RequestMapping(value="/goContractInfoPage",produces="application/json;charset=utf-8")
	public String goContractInfoPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String cMation="选择合同信息";
		model.addAttribute("cMation", cMation);
		return "template/planInfo/LogisticsPlan/find_contract_info_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月17日 下午6:55:56
	 * @param request
	 * @param response
	 * @return
	 * 根据登录用户角色查询相关合同信息
	 */

	@RequestMapping(value="/getContractInfo",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<ContractDetailInfo> findUserRole(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();
		Integer userOrgRootId=userInfo.getOrgRootId();
		Integer userId=userInfo.getId();
		//接收前台页面参数
		
		String contractCode=request.getParameter("contractCode");
		String contractName=request.getParameter("contractName");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String startDate=request.getParameter("startDate");
		String endDate=request.getParameter("endDate");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String goodsName=request.getParameter("goodsName");
		String cooperateStatus=request.getParameter("cooperateStatus");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("contractCode", contractCode);
		params.put("contractName", contractName);
		params.put("entrust", entrust);
		params.put("shipper", shipper);
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		params.put("forwardingUnit", forwardingUnit);
		params.put("consignee", consignee);
		params.put("goodsName", goodsName);
		params.put("cooperateStatus", cooperateStatus);
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		
		//当前时间往前推20天
		Date dat=new Date(new Date().getTime()-(20*24*60*60*1000));
		GregorianCalendar gc = new GregorianCalendar();
		gc.setTime(dat);
		java.text.SimpleDateFormat format = new java.text.SimpleDateFormat("yyyy-MM-dd");
		String conEndDate=format.format(gc.getTime());
		params.put("conEndDate", conEndDate);
		List<ContractDetailInfo> ContractDetailInfos=new ArrayList<ContractDetailInfo>();

		//判断登录用户角色是否为物流公司/企业货主
		if(userRole==1){
			
			params.put("entrustOrgRoot", userOrgRootId);
			//根据主机构ID和登录用户查询条件组
			Map<String, Object> params1=new HashMap<String,Object>();
			params1.put("uId", userId);
			params1.put("uOrgRootId", userOrgRootId);
			
			//根据登录用户的主机构和ID查询用户权限表
			List<UserDataAuthPo> userDataAuthPo=userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params1);
			List<String> conditionGroupList=new ArrayList<String>();
			for (UserDataAuthPo userDataAuthPo2 : userDataAuthPo) {
				if(userDataAuthPo2!=null){
					String conditionGroup=userDataAuthPo2.getConditionGroup();
					conditionGroupList.add(conditionGroup);
				}
			}
			
			//查询合同明细表信息
			List<ContractDetailInfo> ContractDetailInfoList=contractDetailInfoFacade.getContractInfoByUserOrgRootId(params);
			
			//封装货物名称,货物状态
			List<Integer> goodsIds=CommonUtils.getValueList(ContractDetailInfoList, "goodsInfoId");
			//key：货物ID  value:货物名称
			Map<Integer, String> goodsMap=null;
			//key：货物ID  value:货物状态
			Map<Integer, Integer> goodsStatusMap=null;
			if(CollectionUtils.isNotEmpty(goodsIds)){
				List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
				if(CollectionUtils.isNotEmpty(goodsInfos)){
					goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
					goodsStatusMap=CommonUtils.listforMap(goodsInfos, "id", "goodsStatus");
				}
			}
			
			//封装线路信息
			List<Integer> lineInfoIds=CommonUtils.getValueList(ContractDetailInfoList, "lineInfoId");
			//key：线路ID  value:线路名称
			Map<Integer, String> lineInfoMap=null;
			//key：线路ID  value:运距
			Map<Integer, String> distanceMap=null;
			if(CollectionUtils.isNotEmpty(lineInfoIds)){
				List<LineInfoPo> lineInfoPos=lineInfoFacade.findLineInfoByIds(lineInfoIds);
				if(CollectionUtils.isNotEmpty(lineInfoPos)){
					lineInfoMap=CommonUtils.listforMap(lineInfoPos, "id", "lineName");
					distanceMap=CommonUtils.listforMap(lineInfoPos, "id", "distance");
				}
			}
			
			//封装委托方项目信息
			List<Integer> entrustProjectIds=CommonUtils.getValueList(ContractDetailInfoList, "entrustProject");
			//key：项目ID  value：项目名称
			Map<Integer, String> entrustProjectMap=null;
			if(CollectionUtils.isNotEmpty(entrustProjectIds)){
				List<ProjectInfoPo> entrustProjectInfoPos = projectInfoFacade.findProjectInfoPoByIds(entrustProjectIds);
				if(CollectionUtils.isNotEmpty(entrustProjectInfoPos)){
					entrustProjectMap=CommonUtils.listforMap(entrustProjectInfoPos, "id", "projectName");
				}
			}
			
			//封装承运方项目信息
			List<Integer> shipperProjectIds=CommonUtils.getValueList(ContractDetailInfoList, "shipperProject");
			//key：项目ID  value：项目名称
			Map<Integer, String> shipperProjectMap=null;
			if(CollectionUtils.isNotEmpty(shipperProjectIds)){
				List<ProjectInfoPo> shipperProjectInfoPos = projectInfoFacade.findProjectInfoPoByIds(shipperProjectIds);
				if(CollectionUtils.isNotEmpty(shipperProjectInfoPos)){
					shipperProjectMap=CommonUtils.listforMap(shipperProjectInfoPos, "id", "projectName");
				}
			}
			
			//封装委托方机构名称
			List<Integer> entrustIds=CommonUtils.getValueList(ContractDetailInfoList, "entrust");
			//key：机构ID  value：机构名称
			Map<Integer, String> entrustMap=null;
			if(CollectionUtils.isNotEmpty(entrustIds)){
				List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(entrustIds);
				if(CollectionUtils.isNotEmpty(orgInfoPos)){
					entrustMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
				}
			}
			
			//封装承运方机构名称
			List<Integer> shipperIds=CommonUtils.getValueList(ContractDetailInfoList, "shipper");
			//key：机构ID  value：机构名称
			Map<Integer, String> shipperMap=null;
			if(CollectionUtils.isNotEmpty(shipperIds)){
				List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(shipperIds);
				if(CollectionUtils.isNotEmpty(orgInfoPos)){
					shipperMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
				}
			}
			
			
			for (ContractDetailInfo contractDetailInfo : ContractDetailInfoList) {
				//封装货物名称
				if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(contractDetailInfo.getGoodsInfoId())!=null){
					contractDetailInfo.setGoodsName(goodsMap.get(contractDetailInfo.getGoodsInfoId()));
				}
				
				//封装货物状态
				if(MapUtils.isNotEmpty(goodsStatusMap)&&goodsStatusMap.get(contractDetailInfo.getGoodsInfoId())!=null){
					contractDetailInfo.setGoodsStatus(goodsStatusMap.get(contractDetailInfo.getGoodsInfoId()));
				}
				
				//封装线路名称
				if(MapUtils.isNotEmpty(lineInfoMap)&&lineInfoMap.get(contractDetailInfo.getLineInfoId())!=null){
					contractDetailInfo.setLineName(lineInfoMap.get(contractDetailInfo.getLineInfoId()));
				}
				
				//封装运距
				if(MapUtils.isNotEmpty(distanceMap)&&distanceMap.get(contractDetailInfo.getLineInfoId())!=null){
					contractDetailInfo.setDistance(distanceMap.get(contractDetailInfo.getLineInfoId()));
				}
				
				//根据合同信息表主键ID查询合同状态
				Integer cooperateStatus1=contractInfoFacade.findCooperateStatusByContractInfoId(contractDetailInfo.getContractInfoId());
				contractDetailInfo.setCooperateStatus(cooperateStatus1);
				
				//封装委托方项目名称
				if(MapUtils.isNotEmpty(entrustProjectMap)&&entrustProjectMap.get(contractDetailInfo.getEntrustProject())!=null){
					contractDetailInfo.setEntrustProjectName(entrustProjectMap.get(contractDetailInfo.getEntrustProject()));
				}
				
				//封装承运方项目名称
				if(MapUtils.isNotEmpty(shipperProjectMap)&&shipperProjectMap.get(contractDetailInfo.getShipperProject())!=null){
					contractDetailInfo.setShipperProjectName(shipperProjectMap.get(contractDetailInfo.getShipperProject()));
				}
				
				//封装委托方机构名称
				if(MapUtils.isNotEmpty(entrustMap)&&entrustMap.get(contractDetailInfo.getEntrust())!=null){
					contractDetailInfo.setEntrustName(entrustMap.get(contractDetailInfo.getEntrust()));
				}
				
				//封装承运方机构名称
				if(MapUtils.isNotEmpty(shipperMap)&&shipperMap.get(contractDetailInfo.getShipper())!=null){
					contractDetailInfo.setShipperName(shipperMap.get(contractDetailInfo.getShipper()));
				}
				
				//将货物，线路封装成字符串
				String goodsAndLine=contractDetailInfo.getGoodsInfoId()+","+contractDetailInfo.getLineInfoId();
				if(conditionGroupList.contains(goodsAndLine)){
					ContractDetailInfos.add(contractDetailInfo);
				}
				
				//封装生效时间
				if(contractDetailInfo.getEffectiveDate()!=null){
					contractDetailInfo.setEffectiveDateStr(new SimpleDateFormat("yyyy-MM-dd").format(contractDetailInfo.getEffectiveDate()));
				}
				//封装截止时间
				if(contractDetailInfo.getEndDate()!=null){
					contractDetailInfo.setEndDateStr(new SimpleDateFormat("yyyy-MM-dd").format(contractDetailInfo.getEndDate()));
				}
			}
			return ContractDetailInfos;
			
		}else if(userRole==2){
			
			params.put("cooperateStatusA", 2);
			params.put("shipperOrgRoot", userOrgRootId);
			
			//根据主机构ID和登录用户查询条件组
			Map<String, Object> params1=new HashMap<String,Object>();
			params1.put("uId", userId);
			params1.put("uOrgRootId", userOrgRootId);
			
			//根据登录用户的主机构和ID查询用户权限表
			List<UserDataAuthPo> userDataAuthPo=userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params1);
			List<String> conditionGroupList=new ArrayList<String>();
			for (UserDataAuthPo userDataAuthPo2 : userDataAuthPo) {
				if(userDataAuthPo2!=null){
					String conditionGroup=userDataAuthPo2.getConditionGroup();
					conditionGroupList.add(conditionGroup);
				}
			}
			//查询合同明细表信息
			List<ContractDetailInfo> ContractDetailInfoList=contractDetailInfoFacade.getContractInfoByUserOrgRootId(params);
			
			//封装货物名称,货物状态
			List<Integer> goodsIds=CommonUtils.getValueList(ContractDetailInfoList, "goodsInfoId");
			//key：货物ID  value:货物名称
			Map<Integer, String> goodsMap=null;
			//key：货物ID  value:货物状态
			Map<Integer, Integer> goodsStatusMap=null;
			if(CollectionUtils.isNotEmpty(goodsIds)){
				List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
				if(CollectionUtils.isNotEmpty(goodsInfos)){
					goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
					goodsStatusMap=CommonUtils.listforMap(goodsInfos, "id", "goodsStatus");
				}
			}
			
			//封装线路信息
			List<Integer> lineInfoIds=CommonUtils.getValueList(ContractDetailInfoList, "lineInfoId");
			//key：线路ID  value:线路名称
			Map<Integer, String> lineInfoMap=null;
			//key：线路ID  value:运距
			Map<Integer, String> distanceMap=null;
			if(CollectionUtils.isNotEmpty(lineInfoIds)){
				List<LineInfoPo> lineInfoPos=lineInfoFacade.findLineInfoByIds(lineInfoIds);
				if(CollectionUtils.isNotEmpty(lineInfoPos)){
					lineInfoMap=CommonUtils.listforMap(lineInfoPos, "id", "lineName");
					distanceMap=CommonUtils.listforMap(lineInfoPos, "id", "distance");
				}
			}
			
			//封装委托方项目信息
			List<Integer> entrustProjectIds=CommonUtils.getValueList(ContractDetailInfoList, "entrustProject");
			//key：项目ID  value：项目名称
			Map<Integer, String> entrustProjectMap=null;
			if(CollectionUtils.isNotEmpty(entrustProjectIds)){
				List<ProjectInfoPo> entrustProjectInfoPos = projectInfoFacade.findProjectInfoPoByIds(entrustProjectIds);
				if(CollectionUtils.isNotEmpty(entrustProjectInfoPos)){
					entrustProjectMap=CommonUtils.listforMap(entrustProjectInfoPos, "id", "projectName");
				}
			}
			
			//封装承运方项目信息
			List<Integer> shipperProjectIds=CommonUtils.getValueList(ContractDetailInfoList, "shipperProject");
			//key：项目ID  value：项目名称
			Map<Integer, String> shipperProjectMap=null;
			if(CollectionUtils.isNotEmpty(shipperProjectIds)){
				List<ProjectInfoPo> shipperProjectInfoPos = projectInfoFacade.findProjectInfoPoByIds(shipperProjectIds);
				if(CollectionUtils.isNotEmpty(shipperProjectInfoPos)){
					shipperProjectMap=CommonUtils.listforMap(shipperProjectInfoPos, "id", "projectName");
				}
			}
			//封装委托方机构名称
			List<Integer> entrustIds=CommonUtils.getValueList(ContractDetailInfoList, "entrust");
			//key：机构ID  value：机构名称
			Map<Integer, String> entrustMap=null;
			if(CollectionUtils.isNotEmpty(entrustIds)){
				List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(entrustIds);
				if(CollectionUtils.isNotEmpty(orgInfoPos)){
					entrustMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
				}
			}
			
			//封装承运方机构名称
			List<Integer> shipperIds=CommonUtils.getValueList(ContractDetailInfoList, "shipper");
			//key：机构ID  value：机构名称
			Map<Integer, String> shipperMap=null;
			if(CollectionUtils.isNotEmpty(shipperIds)){
				List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(shipperIds);
				if(CollectionUtils.isNotEmpty(orgInfoPos)){
					shipperMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
				}
			}
			
			
			for (ContractDetailInfo contractDetailInfo : ContractDetailInfoList) {

				//封装货物名称
				if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(contractDetailInfo.getGoodsInfoId())!=null){
					contractDetailInfo.setGoodsName(goodsMap.get(contractDetailInfo.getGoodsInfoId()));
				}
				
				//封装货物状态
				if(MapUtils.isNotEmpty(goodsStatusMap)&&goodsStatusMap.get(contractDetailInfo.getGoodsInfoId())!=null){
					contractDetailInfo.setGoodsStatus(goodsStatusMap.get(contractDetailInfo.getGoodsInfoId()));
				}
				
				//封装线路名称
				if(MapUtils.isNotEmpty(lineInfoMap)&&lineInfoMap.get(contractDetailInfo.getLineInfoId())!=null){
					contractDetailInfo.setLineName(lineInfoMap.get(contractDetailInfo.getLineInfoId()));
				}
				
				//封装运距
				if(MapUtils.isNotEmpty(distanceMap)&&distanceMap.get(contractDetailInfo.getLineInfoId())!=null){
					contractDetailInfo.setDistance(distanceMap.get(contractDetailInfo.getLineInfoId()));
				}
				
				//根据合同信息表主键ID查询合同状态
				Integer cooperateStatus1=contractInfoFacade.findCooperateStatusByContractInfoId(contractDetailInfo.getContractInfoId());
				contractDetailInfo.setCooperateStatus(cooperateStatus1);
				
				//封装委托方项目名称
				if(MapUtils.isNotEmpty(entrustProjectMap)&&entrustProjectMap.get(contractDetailInfo.getEntrustProject())!=null){
					contractDetailInfo.setEntrustProjectName(entrustProjectMap.get(contractDetailInfo.getEntrustProject()));
				}
				
				//封装承运方项目名称
				if(MapUtils.isNotEmpty(shipperProjectMap)&&shipperProjectMap.get(contractDetailInfo.getShipperProject())!=null){
					contractDetailInfo.setShipperProjectName(shipperProjectMap.get(contractDetailInfo.getShipperProject()));
				}
				
				//封装委托方机构名称
				if(MapUtils.isNotEmpty(entrustMap)&&entrustMap.get(contractDetailInfo.getEntrust())!=null){
					contractDetailInfo.setEntrustName(entrustMap.get(contractDetailInfo.getEntrust()));
				}
				
				//封装承运方机构名称
				if(MapUtils.isNotEmpty(shipperMap)&&shipperMap.get(contractDetailInfo.getShipper())!=null){
					contractDetailInfo.setShipperName(shipperMap.get(contractDetailInfo.getShipper()));
				}
				
				//将委托方，货物，线路封装成字符串
				String entrustAndGoodsAndLine=contractDetailInfo.getEntrust()+","+contractDetailInfo.getGoodsInfoId()+","+contractDetailInfo.getLineInfoId();
				if(conditionGroupList.contains(entrustAndGoodsAndLine)){
					ContractDetailInfos.add(contractDetailInfo);
				}
				//封装生效时间
				if(contractDetailInfo.getEffectiveDate()!=null){
					contractDetailInfo.setEffectiveDateStr(new SimpleDateFormat("yyyy-MM-dd").format(contractDetailInfo.getEffectiveDate()));
				}
				//封装截止时间
				if(contractDetailInfo.getEndDate()!=null){
					contractDetailInfo.setEndDateStr(new SimpleDateFormat("yyyy-MM-dd").format(contractDetailInfo.getEndDate()));
				}
			}
			return ContractDetailInfos;
		}
		return null;
	}
	
	/**
	 * @author zhangshuai  2017年6月19日 上午11:17:33
	 * @param request
	 * @param response
	 * @return
	 * 查询合同信息最大记录数
	 */
	@RequestMapping(value="/getPlanInfoMaxCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getPlanInfoMaxCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();
		Integer userOrgRootId=userInfo.getOrgRootId();
		Integer userId=userInfo.getId();
		//接收前台页面参数
		
		String contractCode=request.getParameter("contractCode");
		String contractName=request.getParameter("contractName");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String startDate=request.getParameter("startDate");
		String endDate=request.getParameter("endDate");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String goodsName=request.getParameter("goodsName");
		String cooperateStatus=request.getParameter("cooperateStatus");
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("contractCode", contractCode);
		params.put("contractName", contractName);
		params.put("entrust", entrust);
		params.put("shipper", shipper);
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		params.put("forwardingUnit", forwardingUnit);
		params.put("consignee", consignee);
		params.put("goodsName", goodsName);
		params.put("cooperateStatus", cooperateStatus);
		
		//当前时间往前推20天
		Date dat=new Date(new Date().getTime()-(20*24*60*60*1000));
		GregorianCalendar gc = new GregorianCalendar();
		gc.setTime(dat);
		java.text.SimpleDateFormat format = new java.text.SimpleDateFormat("yyyy-MM-dd");
		String conEndDate=format.format(gc.getTime());
		params.put("conEndDate", conEndDate);
		List<ContractDetailInfo> ContractDetailInfos=new ArrayList<ContractDetailInfo>();

		//判断登录用户角色是否为物流公司/企业货主
		if(userRole==1){
			
			params.put("entrustOrgRoot", userOrgRootId);
			//根据主机构ID和登录用户查询条件组
			Map<String, Object> params1=new HashMap<String,Object>();
			params1.put("uId", userId);
			params1.put("uOrgRootId", userOrgRootId);
			
			//根据登录用户的主机构和ID查询用户权限表
			List<UserDataAuthPo> userDataAuthPo=userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params1);
			List<String> conditionGroupList=new ArrayList<String>();
			for (UserDataAuthPo userDataAuthPo2 : userDataAuthPo) {
				if(userDataAuthPo2!=null){
					String conditionGroup=userDataAuthPo2.getConditionGroup();
					conditionGroupList.add(conditionGroup);
				}
			}
			
			//查询合同明细表信息
			List<ContractDetailInfo> ContractDetailInfoList=contractDetailInfoFacade.getContractInfoByUserOrgRootId(params);
			
			for (ContractDetailInfo contractDetailInfo : ContractDetailInfoList) {
				
				//将货物，线路封装成字符串
				String goodsAndLine=contractDetailInfo.getGoodsInfoId()+","+contractDetailInfo.getLineInfoId();
				if(conditionGroupList.contains(goodsAndLine)){
					ContractDetailInfos.add(contractDetailInfo);
				}
			}
			return ContractDetailInfos.size();
			
		}else if(userRole==2){
			
			params.put("cooperateStatusA", 2);
			params.put("shipperOrgRoot", userOrgRootId);
			
			//根据主机构ID和登录用户查询条件组
			Map<String, Object> params1=new HashMap<String,Object>();
			params1.put("uId", userId);
			params1.put("uOrgRootId", userOrgRootId);
			
			//根据登录用户的主机构和ID查询用户权限表
			List<UserDataAuthPo> userDataAuthPo=userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params1);
			List<String> conditionGroupList=new ArrayList<String>();
			for (UserDataAuthPo userDataAuthPo2 : userDataAuthPo) {
				if(userDataAuthPo2!=null){
					String conditionGroup=userDataAuthPo2.getConditionGroup();
					conditionGroupList.add(conditionGroup);
				}
			}
			//查询合同明细表信息
			List<ContractDetailInfo> ContractDetailInfoList=contractDetailInfoFacade.getContractInfoByUserOrgRootId(params);
			
			for (ContractDetailInfo contractDetailInfo : ContractDetailInfoList) {

				//将委托方，货物，线路封装成字符串
				String entrustAndGoodsAndLine=contractDetailInfo.getEntrust()+","+contractDetailInfo.getGoodsInfoId()+","+contractDetailInfo.getLineInfoId();
				if(conditionGroupList.contains(entrustAndGoodsAndLine)){
					ContractDetailInfos.add(contractDetailInfo);
				}
			}
			return ContractDetailInfos.size();
		}
		return null;
	}
	
	/**
	 * @author zhangshuai  2017年6月19日 下午1:27:28
	 * @param request
	 * @param response
	 * @return
	 * 根据合同ID查询合同名称
	 */
	@RequestMapping(value="/findContractNameById",produces="application/json;charset=utf-8")
	@ResponseBody
	public ContractDetailInfo findContractNameById(HttpServletRequest request,HttpServletResponse response){
        		
		//接收页面合同ID
		Integer cId=Integer.parseInt(request.getParameter("userIds"));
		ContractDetailInfo contractDetailInfoPo = contractDetailInfoFacade.findContractDetailInfoAllById(cId);
		return contractDetailInfoPo;
	}
	
	/**
	 * @author zhangshuai  2017年6月19日 下午4:56:25
	 * @param request
	 * @param response
	 * @param planInfoModel(前台参数)
	 * @return
	 * 添加/修改计划信息
	 */
	@RequestMapping(value="/addOrUpdatePlanInfoMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addPlanInfoMation(HttpServletRequest request,HttpServletResponse response,PlanInfoModel planInfoModel){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户的主机构ID和用户ID,用户角色
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer uUserRole=userInfo.getUserRole();
		
		jo=planInfoFacade.addOrUpdatePlanInfoMation(uId,uOrgRootId,planInfoModel,uUserRole);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月21日 下午6:46:19
	 * @param request
	 * @param response
	 * @return
	 * 删除计划信息
	 */
	@RequestMapping(value="/delPlanInfoMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject delPlanInfoMation(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户的信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer orgRootId=userInfo.getOrgRootId();
		
		/*
		 * 批量删除
		 * //被操作的计划ID
		List<Integer> planInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("planInfoIds"))) {
			String planInfoIds = request.getParameter("planInfoIds").trim();
			String[] planInfoArray = planInfoIds.split(",");
			if(planInfoArray.length>0){
				for(String planInfoIdStr : planInfoArray){
					if(StringUtils.isNotBlank(planInfoIdStr)){
						planInfoIdList.add(Integer.valueOf(planInfoIdStr.trim()));
					}
				}
			}
		}*/
		
		//计划ID
		Integer planInfoIds = Integer.valueOf(request.getParameter("planInfoIds").trim());
		
		
		//删除计划信息
		jo=planInfoFacade.delPlanInfoMation(planInfoIds,orgRootId);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月21日 下午7:49:27
	 * @param request
	 * @param response
	 * @return
	 * 修改时查询计划状态
	 */
	@RequestMapping(value="/findPlanInfoStatus",produces="application/json;charset=utf-8")
	@ResponseBody
	public PlanInfoPo findPlanInfoStatus(HttpServletRequest request,HttpServletResponse response){
		
		Integer planInfoIds=Integer.valueOf(request.getParameter("planInfoIds"));
		
		//根据ID查询计划信息
		PlanInfoPo planInfoPo=planInfoFacade.findPlanInfoMationById(planInfoIds);
		
		return planInfoPo;
		
	}
	
	/**
	 * @author zhangshuai  2017年6月22日 下午1:15:00
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入修改模态框
	 */
	@RequestMapping(value="/updatePlanInfoModel",produces="application/json;charset=utf-8")
	public String updatePlanInfoModel(HttpServletRequest request ,HttpServletResponse response ,Model model){
		String updatePlanInfo="修改计划信息";
		model.addAttribute("updatePlanInfo", updatePlanInfo);
		return "template/planInfo/LogisticsPlan/update_plan_info_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月21日 下午8:06:39
	 * @param request
	 * @param response
	 * @return
	 * 根据计划ID回显计划信息
	 */
	@RequestMapping(value="/echoPlanInfoMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public PlanInfoPo echoPlanInfoMation(HttpServletRequest request,HttpServletResponse response){
		
		//获取计划ID
		Integer planInfoIds=Integer.valueOf(request.getParameter("planInfoIds"));
		
		//根据计划ID查询计划信息
		PlanInfoPo planInfoPo=planInfoFacade.findPlanInfoMationById(planInfoIds);
		
		//根据合同明细表ID查询合同名称
		String coontractName=contractDetailInfoFacade.findCNameById(planInfoPo.getContractDetailInfoId());
		
		//根据货物ID查询货物信息
		GoodsInfo goodsInfo = goodsInfoFacade.getGoodsInfoById(planInfoPo.getGoodsInfoId());
		String goodsName=goodsInfo.getGoodsName();
		
		//根据线路ID查询线路信息
		LineInfoPo lineInfo = lineInfoFacade.getLineInfoById(planInfoPo.getLineInfoId());
		String lineName=lineInfo.getLineName();
		
		//查询委托方(根据组织机构信息表组织机构ID和当前版本号查询组织机构明细信息表)
		OrgInfoPo orgInfoPo=orgInfoFacade.getOrgInfoById(planInfoPo.getEntrust());
		//根据主机构ID和版本号查询组织机构明细表信息,获取机构名称
		Map<String, Object> params2=new HashMap<String,Object>();
		params2.put("orgInfoId", orgInfoPo.getId());
		OrgDetailInfoPo orgDetailInfoPo=orgDetailInfoFacade.findOdiNameByOrgInfoId(params2);
		if(orgDetailInfoPo!=null){
			planInfoPo.setEntrustName(orgDetailInfoPo.getOrgName());
		}
		
		SimpleDateFormat sdf=new SimpleDateFormat("yyyy-MM-dd");
		String startDate=sdf.format(planInfoPo.getStartDate());
		String endDate=sdf.format(planInfoPo.getEndDate());
		planInfoPo.setSDate(startDate);
		planInfoPo.setEDate(endDate);
		planInfoPo.setContractName(coontractName);
		planInfoPo.setGoodsName(goodsName);
		planInfoPo.setLineName(lineName);
		
		return planInfoPo;
	}
	
	
	/**
	 * @author zhangshuai  2017年6月22日 下午6:34:29
	 * @return
	 * 提交审核
	 */
	@RequestMapping(value="/submitAduitPlanById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject submitAduitPlanById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户的ID
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer orgRootId=userInfo.getOrgRootId();
		
		//接收操作计划ID
		Integer planInfoIds=Integer.valueOf(request.getParameter("planInfoIds"));
		
		//提交审核
		jo=planInfoFacade.submitAduitPlanById(planInfoIds,uId,orgRootId);
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月22日 下午8:17:30
	 * @param request
	 * @param response
	 * @return
	 * 审核计划(通过/不通过)
	 */
	@RequestMapping(value="/aduitPlanInfoById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject aduitPlanInfoById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取当前登录人员信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer orgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		String auditOption=request.getParameter("auditOption");
		Integer planInfoIds=Integer.valueOf(request.getParameter("planInfoIds"));
		Integer sign=Integer.parseInt(request.getParameter("sign"));
		Integer signs=Integer.parseInt(request.getParameter("signs"));
		Integer planType=Integer.parseInt(request.getParameter("planType"));
		//修改审核状态
		jo=planInfoFacade.updatePlanStatusByPlanId(uId,auditOption,planInfoIds,sign,orgRootId,signs,planType);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月23日 上午10:55:16
	 * @param request
	 * @param response
	 * @return
	 * 撤回已派发状态的计划
	 */
	@RequestMapping(value="/withdrawPlanInfoMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject withdrawPlanInfoMationById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取当前登录人员信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer orgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer planInfoIds=Integer.valueOf(request.getParameter("planInfoIds"));
		
		//撤回已派发状态计划
		jo=planInfoFacade.withdrawPlanInfoMationById(uId,planInfoIds,orgRootId);
		
		return jo;
	}

	/**
	 * @author zhangshuai  2017年6月23日 下午12:12:29
	 * @param request
	 * @param response
	 * @return
	 * 派发已撤回的计划
	 */
	@RequestMapping(value="/distributePlanInfoById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject distributePlanInfoById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer orgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer planInfoIds=Integer.valueOf(request.getParameter("planInfoIds"));
		
		//派发已撤回计划
		jo=planInfoFacade.distributePlanInfoById(uId,orgRootId,planInfoIds);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年7月18日 上午11:52:57
	 * @param request
	 * @return
	 * 计划日志信息全查
	 */
	@SuppressWarnings("rawtypes")
	@RequestMapping(value="/findPlanInfoLogAllMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List findPlanInfoLogAllMation(HttpServletRequest request){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer planInfoId=Integer.parseInt(request.getParameter("id"));
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		
		//封装参数，查询计划日志信息
		Map<String, Object> queryMap=new HashMap<String, Object>();
		queryMap.put("orgRootId", uOrgRootId);
		queryMap.put("planInfoId", planInfoId);
		queryMap.put("start", start);
		queryMap.put("rows", rows);
		
		List<Map<String, Object>> planInfoLog=planInfoFacade.findPlanInfoAllLogMation(queryMap);
		
		if(CollectionUtils.isNotEmpty(planInfoLog)){
			
			List<Integer> userIds=CommonUtils.getValueList(planInfoLog, "person");
			Map<Integer, String> userMap=null;
			if(CollectionUtils.isNotEmpty(userIds)){
				List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userIds);
				if(CollectionUtils.isNotEmpty(userInfos)){
					userMap=CommonUtils.listforMap(userInfos, "id", "userName");
				}
			}
			for (Map<String, Object> map : planInfoLog) {
				map.put("person", userMap.get(map.get("person")));
			}
		}
		
		return planInfoLog;
	}
	
	/**
	 * @author zhangshuai  2017年7月18日 下午12:05:29
	 * @param request
	 * @param response
	 * @return
	 * 查询计划日志总数
	 */
	@RequestMapping(value="/getPlanInfoLogAllMationCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getPlanInfoLogAllMationCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer planInfoId=Integer.parseInt(request.getParameter("id"));
		
		//封装参数，查询计划日志信息
		Map<String, Object> queryMap=new HashMap<String, Object>();
		queryMap.put("orgRootId", uOrgRootId);
		queryMap.put("planInfoId", planInfoId);
		return planInfoFacade.getPlanInfoLogAllMationCount(queryMap);
	}
	
	/**
	 * @author zhangshuai  2017年8月14日 下午10:40:13
	 * @return
	 * 物流计划运单信息查看
	 */
	@RequestMapping(value="/findAllWayibbyMationPage",produces="application/json;charset=utf-8")
	public String findAllWayibbyMationPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String waybillMation="计划运单信息查看";
		model.addAttribute("waybillMation", waybillMation);
		return "template/planInfo/LogisticsPlan/find_planInfo_waybill_mation";
	}
	
	/**
	 * @author zhangshuai  2017年8月14日 下午10:54:24
	 * @param request
	 * @param response
	 * @return
	 * 物流计划拆分运单信息全查
	 */
	@RequestMapping(value="/findPlanWaybillMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<WaybillInfoPo> findPlanWaybillMation(HttpServletRequest request,HttpServletResponse response){
		//接收前台操作计划ID
		Integer planInfoId=Integer.parseInt(request.getParameter("planInfoId"));
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		String wayId=request.getParameter("wayId");
		String wayStatus=request.getParameter("wayStatus");
		String planTransportDateStart=request.getParameter("planTransportDateStart");
		String planTransportDateEnd=request.getParameter("planTransportDateEnd");
		//根据计划ID查询拆分后的计划信息
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("start", start);
		params.put("rows", rows);
		params.put("planInfoId", planInfoId);
		params.put("wayId", wayId);
		params.put("wayStatus", wayStatus);
		params.put("planTransportDateStart", planTransportDateStart);
		params.put("planTransportDateEnd", planTransportDateEnd);
		List<WaybillInfoPo> waybillInfoPos=waybillInfoFacade.findWaybillByPlanInfoId(params);
		
		//根据选择的计划ID查询计划审核日志信息
		PlanAuditLogPo planAuditLogPo=planAuditLogFacade.findPlanLogMationByPlanInfoId(planInfoId);
		Date planDate=null;
		if(planAuditLogPo!=null){
			planDate=planAuditLogPo.getAuditTime();
		}
		
		//封装委托方
		List<Integer> entrustIds=CommonUtils.getValueList(waybillInfoPos, "entrust");
		Map<Integer, String> entrustMap=null;
		if(CollectionUtils.isNotEmpty(entrustIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(entrustIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				entrustMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		
		//封装承运方
		List<Integer> shipperIds=CommonUtils.getValueList(waybillInfoPos, "shipper");
		Map<Integer, String> shipperMap=null;
		if(CollectionUtils.isNotEmpty(shipperIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(shipperIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				shipperMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		
		//封装货物
		List<Integer> goodsIds=CommonUtils.getValueList(waybillInfoPos, "goodsInfoId");
		Map<Integer, String> goodsMap=null;
		if(CollectionUtils.isNotEmpty(goodsIds)){
			List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}
		}
		
		//封装线路
		List<Integer> lineIds=CommonUtils.getValueList(waybillInfoPos, "lineInfoId");
		Map<Integer, String> lineMap=null;
		if(CollectionUtils.isNotEmpty(lineIds)){
			List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineIds);
			if(CollectionUtils.isNotEmpty(lineInfoPos)){
				lineMap=CommonUtils.listforMap(lineInfoPos, "id", "lineName");
			}
		}
		
		if(CollectionUtils.isNotEmpty(waybillInfoPos)){
			for (WaybillInfoPo waybillInfoPo : waybillInfoPos) {
				//封装司机名称
				if(waybillInfoPo.getUserInfoId()!=null){
					//临时司机
					if(waybillInfoPo.getDriverUserRole()==3){
						DriverInfo driverInfo = driverInfoFacade.findInternalDriverById(waybillInfoPo.getUserInfoId());
						if(driverInfo!=null){
							waybillInfoPo.setDriverName(driverInfo.getDriverName());
						}
					}else{
						List<Integer> userInfoIds=new ArrayList<Integer>();
						userInfoIds.add(waybillInfoPo.getUserInfoId());
						List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
						if(CollectionUtils.isNotEmpty(driverInfos)){
							for (DriverInfo driverInfo : driverInfos) {
								waybillInfoPo.setDriverName(driverInfo.getDriverName());
							}
						}
					}
				}
				
				//封装委托方
				if(MapUtils.isNotEmpty(entrustMap)&&entrustMap.get(waybillInfoPo.getEntrust())!=null){
					waybillInfoPo.setEntrustName(entrustMap.get(waybillInfoPo.getEntrust()));
				}
				
				//封装承运方
				if(MapUtils.isNotEmpty(shipperMap)&&shipperMap.get(waybillInfoPo.getShipper())!=null){
					waybillInfoPo.setShipperName(shipperMap.get(waybillInfoPo.getShipper()));
				}
				
				//封装货物
				if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(waybillInfoPo.getGoodsInfoId())!=null){
					waybillInfoPo.setGoodsName(goodsMap.get(waybillInfoPo.getGoodsInfoId()));
				}
				
				//封装线路
				if(MapUtils.isNotEmpty(lineMap)&&lineMap.get(waybillInfoPo.getLineInfoId())!=null){
					waybillInfoPo.setLineName(lineMap.get(waybillInfoPo.getLineInfoId()));
				}
				
				if(waybillInfoPo.getDistributeTime()!=null){
					waybillInfoPo.setDistributeTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(waybillInfoPo.getDistributeTime()));
				}
				
				if(waybillInfoPo.getDriverReceiveTime()!=null){
					waybillInfoPo.setDriverReceiveTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(waybillInfoPo.getDriverReceiveTime()));
				}
				
				//封装计划生成日期
				if(planDate!=null){
					waybillInfoPo.setPlanPaiFaDateStr(new SimpleDateFormat("yyyy-MM-dd").format(planDate));	
				}
				if(waybillInfoPo!=null){
					//封装计划拉运日期
					waybillInfoPo.setPlanTransportDateEndStr(new SimpleDateFormat("yyyy-MM-dd").format(waybillInfoPo.getPlanTransportDate()));
				}
			}
		}
		return waybillInfoPos;
	}
	
	/**
	 * @author zhangshuai  2017年8月14日 下午11:31:03
	 * @param request
	 * @param response
	 * @return
	 * 查询计划拆分后的数量
	 */
	@RequestMapping(value="/getPlanWaybillMationCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getPlanWaybillMationCount(HttpServletRequest request,HttpServletResponse response){
		//接收前台操作计划ID
		Integer planInfoId=Integer.parseInt(request.getParameter("planInfoId"));
		String wayId=request.getParameter("wayId");
		String wayStatus=request.getParameter("wayStatus");
		String planTransportDateStart=request.getParameter("planTransportDateStart");
		String planTransportDateEnd=request.getParameter("planTransportDateEnd");
		//根据计划ID查询拆分后的计划信息
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("planInfoId", planInfoId);
		params.put("wayId", wayId);
		params.put("wayStatus", wayStatus);
		params.put("planTransportDateStart", planTransportDateStart);
		params.put("planTransportDateEnd", planTransportDateEnd);
		Integer count=waybillInfoFacade.getPlanWaybillMationCount(params);
		return count;
	}
	
	/**========================== 大宗货物自营计划 =======================*/
	
	/**
	 * @author zhangshuai  2017年6月24日 上午11:57:16
	 * @param request
	 * @param response
	 * @param model
	 * @return、
	 * 进入自营计划页面
	 */
	@RequestMapping(value="/goProprietaryPlanPage",produces="application/json;charset=utf-8")
	public String goProprietaryPlanPage(HttpServletRequest request,HttpServletResponse response,Model model){
		
		String ProprietaryPlanPage="自营计划";
		model.addAttribute("ProprietaryPlanPage", ProprietaryPlanPage);
		//查询所有线路
		List<LineInfoPo> lineName=lineInfoFacade.findLineInfoNameAll();
		
		model.addAttribute("lineName", lineName);
		return "template/planInfo/ProprietaryPlan/plan_info_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月26日 上午10:03:21
	 * @param request
	 * @param response
	 * @return
	 * 自营计划全查
	 */
	@RequestMapping(value="/findProprietaryPlanAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<PlanInfoPo> findProprietaryPlanAll(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取到登录用户的主机构ID和用户ID
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer userRole=userInfo.getUserRole();
		
		//接收参数
		String startDate=request.getParameter("startDate");
		String endDate=request.getParameter("endDate");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		String planName=request.getParameter("planName");
		String goodsInfoId=request.getParameter("goodsInfoId");
		String lineInfoId=request.getParameter("lineInfoId");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String planStatus=request.getParameter("planStatus");
		
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("uId", uId);
		params.put("uOrgRootId", uOrgRootId);
		
		
		//根据登录用户的主机构和ID查询用户权限表
		List<UserDataAuthPo> userDataAuthPo=userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params);
		List<String> conditionGroupList=new ArrayList<String>();
		for (UserDataAuthPo userDataAuthPo2 : userDataAuthPo) {
			if(userDataAuthPo2!=null){
				String conditionGroup=userDataAuthPo2.getConditionGroup();
				conditionGroupList.add(conditionGroup);
			}
		}
		
		//将登录用户条件组信息存入session
		request.getSession().setAttribute("conditionGroupList", conditionGroupList);
		//封装参数
		Map<String, Object> params1=new HashMap<String,Object>();
		params1.put("uOrgRootId", uOrgRootId);
		params1.put("conditionGroupList", conditionGroupList);
		params1.put("startDate", startDate);
		params1.put("endDate", endDate);
		params1.put("currentPage", currentPage);
		params1.put("planName", planName);
		params1.put("rows", rows);
		params1.put("goodsInfoId", goodsInfoId);
		params1.put("lineInfoId", lineInfoId);
		params1.put("entrust", entrust);
		params1.put("shipper", shipper);
		params1.put("forwardingUnit", forwardingUnit);
		params1.put("consignee", consignee);
		params1.put("planStatus", planStatus);
		params1.put("plantype", 2);
		//根据登录用户主机构ID和用户权限条件组查询计划表
		List<PlanInfoPo> planInfoPoList=planInfoFacade.findPlanInfoByUOrgRootIdAndConditionGroup(params1);
		  
		List<Integer> orgIds=CommonUtils.getValueList(planInfoPoList, "entrust");
		//key:组织ID  value：机构名称
		Map<Integer, String> orgMap=null;
		if(CollectionUtils.isNotEmpty(orgIds)){
			List<OrgInfoPo> orgInfos=orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfos)){
				orgMap=CommonUtils.listforMap(orgInfos, "id", "orgName");
			}
		}
		
		//封装货物
		List<Integer> goodsIds=CommonUtils.getValueList(planInfoPoList, "goodsInfoId");
		//key:货物ID  value：货物名称
		Map<Integer, String> goodsMap=null;
		if(CollectionUtils.isNotEmpty(goodsIds)){
			List<GoodsInfo> goodsInfos=goodsInfoFacade.findGoodsInfoByIds(goodsIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}
		}
		
		//封装线路
		List<Integer> lineIds=CommonUtils.getValueList(planInfoPoList, "lineInfoId");
		//key:线路ID  value：线路名称
		Map<Integer, String> lineMap=null;
		if(CollectionUtils.isNotEmpty(lineIds)){
			List<LineInfoPo> lineInfos=lineInfoFacade.findLineInfoByIds(lineIds);
			if(CollectionUtils.isNotEmpty(lineInfos)){
				lineMap=CommonUtils.listforMap(lineInfos, "id", "lineName");
			}
		}
		
		//封装创建人
		List<Integer> userIds=CommonUtils.getValueList(planInfoPoList, "createUser");
		//key:用户ID  value：用户名称
		Map<Integer, String> userMap=null;
		if(CollectionUtils.isNotEmpty(userIds)){
			List<UserInfo> users=userInfoFacade.findUserNameByIds(userIds);
			if(CollectionUtils.isNotEmpty(users)){
				userMap=CommonUtils.listforMap(users, "id", "userName");
			}
		}
		
		for (PlanInfoPo planInfoPo : planInfoPoList) {
			//封装委托方机构名称
			if(MapUtils.isNotEmpty(orgMap)&&orgMap.get(planInfoPo.getEntrust())!=null){
				planInfoPo.setEntrustName(orgMap.get(planInfoPo.getEntrust()));
			}
			
			//封装货物名称
			if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(planInfoPo.getGoodsInfoId())!=null){
				planInfoPo.setGoodsName(goodsMap.get(planInfoPo.getGoodsInfoId()));
			}
			
			//封装线路名称
			if(MapUtils.isNotEmpty(lineMap)&&lineMap.get(planInfoPo.getLineInfoId())!=null){
				planInfoPo.setLineName(lineMap.get(planInfoPo.getLineInfoId()));
			}
			
			//封装创建人名称
			if(MapUtils.isNotEmpty(userMap)&&userMap.get(planInfoPo.getCreateUser())!=null){
				planInfoPo.setUserName(userMap.get(planInfoPo.getCreateUser()));
			}
			
			planInfoPo.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(planInfoPo.getCreateTime()));
			planInfoPo.setSDate(new SimpleDateFormat("yyyy-MM-dd").format(planInfoPo.getStartDate()));
			planInfoPo.setEDate(new SimpleDateFormat("yyyy-MM-dd").format(planInfoPo.getEndDate()));
			planInfoPo.setUserRole(userRole);
		} 
		return planInfoPoList;
	}
	
	/**
	 * @author zhangshuai  2017年6月26日 下午1:28:11
	 * @param request
	 * @param response
	 * @return
	 * 查询自营计划记录数
	 */
	@RequestMapping(value="/getPPlanInfoCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getPPlanInfoCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取到登录用户的主机构ID和用户ID
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer count=null;
		
		//接收参数
		String startDate=request.getParameter("startDate");
		String endDate=request.getParameter("endDate");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		String planName=request.getParameter("planName");
		String goodsInfoId=request.getParameter("goodsInfoId");
		String lineInfoId=request.getParameter("lineInfoId");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String planStatus=request.getParameter("planStatus");
		
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("uId", uId);
		params.put("uOrgRootId", uOrgRootId);
		
		//根据登录用户的主机构和ID查询用户权限表
		List<UserDataAuthPo> userDataAuthPo=userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params);
		List<String> conditionGroupList=new ArrayList<String>();
		for (UserDataAuthPo userDataAuthPo2 : userDataAuthPo) {
			if(userDataAuthPo2!=null){
				String conditionGroup=userDataAuthPo2.getConditionGroup();
				conditionGroupList.add(conditionGroup);
		}
		
		}
		//封装参数
		Map<String, Object> params1=new HashMap<String,Object>();
		params1.put("uOrgRootId", uOrgRootId);
		params1.put("conditionGroupList", conditionGroupList);
		params1.put("startDate", startDate);
		params1.put("endDate", endDate);
		params1.put("currentPage", currentPage);
		params1.put("planName", planName);
		params1.put("rows", rows);
		params1.put("goodsInfoId", goodsInfoId);
		params1.put("lineInfoId", lineInfoId);
		params1.put("entrust", entrust);
		params1.put("shipper", shipper);
		params1.put("forwardingUnit", forwardingUnit);
		params1.put("consignee", consignee);
		params1.put("planStatus", planStatus);
		params1.put("plantype", 2);
		count=planInfoFacade.getPlanInfoCount(params1);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午12:16:06
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入添加自营计划模态框
	 */
	@RequestMapping(value="/addProprietaryPlanPage",produces="application/json;charset=utf-8")
	public String addProprietaryPlanPage(HttpServletRequest request,HttpServletResponse response,Model model){
		
		String addProprietaryPlanPage="添加计划信息";
		model.addAttribute("addProprietaryPlanPage", addProprietaryPlanPage);
		return "template/planInfo/ProprietaryPlan/add_plan_info_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午12:34:41
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入选择委托方模态框
	 */
	@RequestMapping(value="/goEntrustInfoPage",produces="application/json;charset=utf-8")
	public String goEntrustInfoPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String goEntrustInfoPage="选择委托方信息";
		model.addAttribute("goEntrustInfoPage", goEntrustInfoPage);
		return "template/planInfo/ProprietaryPlan/find_entrust_info_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午12:56:36
	 * @return
	 * 委托方信息全查
	 */
	@RequestMapping(value="/findEntrustMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<OrgInfoPo> findEntrustMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取到登录用户的主机构ID
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//获取参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("rootOrgInfoId", uOrgRootId);//主机构ID
		params.put("isAvailable", 1);//启用
		params.put("orgStatus", 3);
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		
		//根据登录用户主机构ID查询组织机构信息(组织机构ID,审核通过,启用)
		List<OrgInfoPo> orginfoPoList=orgInfoFacade.findEntrustMationByRootOrgInfoId(params);
		return orginfoPoList;
	}
	
		
	/**
	 * @author zhangshuai  2017年6月24日 下午4:41:48
	 * @param request
	 * @param response
	 * @return
	 * 查询委托方总记录数
	 */
	@RequestMapping(value="/getEntrustCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getEntrustCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取到登录用户的主机构ID
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//获取参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("rootOrgInfoId", uOrgRootId);//主机构ID
		params.put("isAvailable", 1);//启用
		params.put("orgStatus", 3);
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		List<OrgInfoPo> orginfoPoList=orgInfoFacade.findEntrustMationByRootOrgInfoId(params);
		//查询委托方总记录数
		Integer count=orginfoPoList.size();
		return count;
				
	}
	
	
	/**
	 * @author zhangshuai  2017年6月24日 下午2:22:17
	 * @param request
	 * @param response
	 * @return
	 * 根据选择的委托方ID查询委托方名称
	 */
	@RequestMapping(value="/findEnstusNameById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findEnstusNameById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//接收页面参数
		Integer Eids=Integer.valueOf(request.getParameter("Eids"));
		
		//根据选择的委托方ID查询委托方信息
		try {
			OrgInfoPo orgInfoPo = orgInfoFacade.findOrgInfoByIdId(Eids);
			//封装参数
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("orgInfoId", orgInfoPo.getId());
			params.put("orgVersion", orgInfoPo.getCurrentVersion());
			OrgDetailInfoPo OrgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params);
			String EName=OrgDetailInfoPo.getOrgName();
			jo.put("success", true);
			jo.put("msg", EName);
		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", "查询失败!");
		}
		
		return jo;
	}

	/**
	 * @author zhangshuai  2017年6月24日 下午2:48:55
	 * @return
	 * 进入选择货物模态框
	 */
	@RequestMapping(value="/goGoodsInfoPage",produces="application/json;charset=utf-8")
	public String goGoodsInfoPage(HttpServletResponse request,HttpServletRequest response,Model model){
		String goodsInfoMation="选择货物信息";
		model.addAttribute("goodsInfoMation", goodsInfoMation);
		return "template/planInfo/ProprietaryPlan/find_goods_info_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午2:59:35
	 * @param request
	 * @param response
	 * @return
	 * 货物信息全查
	 */
	@RequestMapping(value="/findGoodsMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<GoodsInfo> findGoodsMation(HttpServletRequest request,HttpServletResponse response){
		
		//获取参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		params.put("auditStatus", 3);
		params.put("goodsStatus", 0);
		List<GoodsInfo> goodsInfoList = goodsInfoFacade.selectGoodsInfoAll(params);
		
		//封装物资类别
		List<Integer> mateTypeIds=CommonUtils.getValueList(goodsInfoList, "materialType");
		//key：物资ID  value:物资名称
		Map<Integer, String> mateTypeMap=null;
		if(CollectionUtils.isNotEmpty(mateTypeIds)){
			List<MaterialCategoryPo> materialCategoryPos=materialCategoryFacade.findMaterialCategoryByIds(mateTypeIds);
			if(CollectionUtils.isNotEmpty(materialCategoryPos)){
				mateTypeMap=CommonUtils.listforMap(materialCategoryPos, "id", "materialType");
			}
		}
		
		//封装所属组织
		List<Integer> orgIds=CommonUtils.getValueList(goodsInfoList, "orgInfoId");
		//key：组织ID   value：组织名称
		Map<Integer, String> orgMap=null;
		if(CollectionUtils.isNotEmpty(orgIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				orgMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		for (GoodsInfo goodsInfo : goodsInfoList) {
			//封装物资类别名称
			if(MapUtils.isNotEmpty(mateTypeMap)&&mateTypeMap.get(goodsInfo.getMaterialType())!=null){
				goodsInfo.setMaterialTypeName(mateTypeMap.get(goodsInfo.getMaterialType()));
			}
			//封装所属组织名称
			if(MapUtils.isNotEmpty(orgMap)&&orgMap.get(goodsInfo.getOrgInfoId())!=null){
				goodsInfo.setOrgInfoName(orgMap.get(goodsInfo.getOrgInfoId()));
			}
		}
		return goodsInfoList;
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午4:11:16
	 * @return
	 * 查询货物总记录数
	 */
	@RequestMapping(value="/getGoodsCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getGoodsCount(HttpServletRequest request,HttpServletResponse response){
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("auditStatus", 3);
		params.put("goodsStatus", 0);
		Integer count=goodsInfoFacade.getCountGoods(params);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午4:23:15
	 * @return
	 * 根据选择的货物ID查询对应的货物名称
	 */
	@RequestMapping(value="/findGoodsNameById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findGoodsNameById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		//接收参数
		Integer Gids=Integer.valueOf(request.getParameter("Gids"));
		
		//根据选择的货物ID查询对应的货物名称
		try {
			GoodsInfo goodsInfo = goodsInfoFacade.getGoodsInfoById(Gids);
			String goodsName=goodsInfo.getGoodsName();
			jo.put("success", true);
			jo.put("msg", goodsName);
		} catch (Exception e) {
			jo.put("success", true);
			jo.put("msg", "查询失败!");
		}
		return jo;
	}

	/**
	 * @author zhangshuai  2017年6月24日 下午4:58:45
	 * @return
	 * 进入选择线路模态框
	 */
	@RequestMapping(value="/goLineInfoPage",produces="application/json;charset=utf-8")
	public String goLineInfoPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String golineInfoPage="选择线路信息";
		model.addAttribute("golineInfoPage", golineInfoPage);
		return "template/planInfo/ProprietaryPlan/find_line_info_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午5:09:35
	 * @param request
	 * @param response
	 * @return
	 * 全查线路信息
	 */
	@RequestMapping(value="/findLineInfoAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<LineInfoPo> findLineInfoAll(HttpServletRequest request,HttpServletResponse response){
		
		//获取参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("start", currentPage);
		params.put("rows", rows);
		params.put("lineStatus", 0);
		
		//全查线路信息(线路状态：启用)
		List<LineInfoPo> lineInfoPo = lineInfoFacade.findLineInfoForPage(params);
		return lineInfoPo;
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午5:15:11
	 * @param request
	 * @param response
	 * @return
	 * 查询线路总记录数
	 */
	@RequestMapping(value="/getLineCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getLineCount(HttpServletRequest request,HttpServletResponse response){
		
		//获取参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("start", currentPage);
		params.put("rows", rows);
		params.put("lineStatus", 0);
		
		//查询线路总记录数
		Integer count=lineInfoFacade.countLineInfoForPage(params);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午5:36:32
	 * @param request
	 * @param response
	 * @return
	 * 根据选择线路ID查询线路名称
	 */
	@RequestMapping(value="/findLineNameById",produces="application/json;charset=utf-8")
	@ResponseBody
	public LineInfoPo findLineNameById(HttpServletRequest request,HttpServletResponse response){
		//接收参数
		Integer Lids=Integer.valueOf(request.getParameter("Lids"));
		
		//根据选择的线路ID查询对应的线路名称
		LineInfoPo lineInfo = lineInfoFacade.getLineInfoById(Lids);
		return lineInfo;
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午6:01:11
	 * @param request
	 * @param response
	 * @return
	 * 新增/修改自营计划信息
	 */
	@RequestMapping(value="/addOrUpdateProprietaryPlanMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateProprietaryPlanMation(HttpServletRequest request,HttpServletResponse response,PlanInfoModel planInfoModel){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录人员信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//根据线路ID查询运距信息
		LineInfoPo lineInfo = lineInfoFacade.getLineInfoById(planInfoModel.getPlanInfoPo().getLineInfoId());
		String distance=lineInfo.getDistance();
		
		//添加/修改自营计划信息
		jo=planInfoFacade.addOrUpdateProprietaryPlanInfoMation(uId, uOrgRootId, planInfoModel,distance);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月26日 上午11:02:37
	 * @return
	 * 进入修改自营计划模态框
	 */
	@RequestMapping(value="/updatePPlanInfoModel",produces="application/json;charset=utf-8")
	public String updatePPlanInfoModel(HttpServletRequest request,HttpServletResponse response,Model model){
		String updatePPlanInfoModel="修改自营计划";
		model.addAttribute("updatePPlanInfoModel", updatePPlanInfoModel);
		return "template/planInfo/ProprietaryPlan/update_plan_info_page";
	}
	
	
	
	/**
	 * @author zhangshuai  2017年7月18日 下午12:36:53
	 * @param request
	 * @param response
	 * @return
	 * 根据自营计划ID查询全部日志信息
	 */
	@SuppressWarnings("rawtypes")
	@RequestMapping(value="/findProprietaryPlanInfoLogAllMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List findProprietaryPlanInfoLogAllMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		//接收页面参数
		Integer id=Integer.parseInt(request.getParameter("id"));
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		
		//根据所操作ID查询自营计划日志信息
		Map<String, Object> queryMap=new HashMap<String,Object>();
		queryMap.put("planInfoId", id);
		queryMap.put("orgRootId", uOrgRootId);
		queryMap.put("start", start);
		queryMap.put("rows", rows);
		List<Map<String, Object>> proprietaryPlanLogList=planInfoFacade.findProprietaryPlanInfoLogAllMation(queryMap);
		
		if(CollectionUtils.isNotEmpty(proprietaryPlanLogList)){
		//查询操作人姓名
		List<Integer> userIds=CommonUtils.getValueList(proprietaryPlanLogList, "person");
		Map<Integer, String> userMap=null;
		if(CollectionUtils.isNotEmpty(userIds)){
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userIds);
			if(CollectionUtils.isNotEmpty(userInfos)){
				userMap=CommonUtils.listforMap(userInfos, "id", "userName");
			}
		}
		for (Map<String, Object> map : proprietaryPlanLogList) {
			map.put("person", userMap.get(map.get("person")));
		}
	}
		return proprietaryPlanLogList;
	}
	
	/**
	 * @author zhangshuai  2017年7月18日 下午12:54:10
	 * @param request
	 * @param response
	 * @return
	 * 根据ID查询自营计划日志信息总数
	 */
	@RequestMapping(value="/getProprietaryPlanInfoLogAllMationCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getProprietaryPlanInfoLogAllMationCount(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer planInfoId=Integer.parseInt(request.getParameter("id"));
		
		//封装参数，查询计划日志信息
		Map<String, Object> queryMap=new HashMap<String, Object>();
		queryMap.put("orgRootId", uOrgRootId);
		queryMap.put("planInfoId", planInfoId);
		return planInfoFacade.getProprietaryPlanInfoLogAllMationCount(queryMap);
	}
	
	/**
	 * 
	 * @Title: showPlanListReportPage  
	 * @Description: 显示计划报表页面
	 * @param 
	 * @return String    返回类型  
	 * @throws
	 */
	@RequestMapping("/showPlanListReportPage")
	public String showPlanListReportPage(){
		return "template/reportForm/plan_info/plan_info_report";
	}
	/**
	 * @Title: getDataForReport  
	 * @Description: 获取计划报表所需要的数据 
	 * @author zhenghaiyang
	 * @param request
	 * @param response
	 * @return JSONObject    返回类型  
	 * @throws
	 */
	@RequestMapping(value="/getDataForReport",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject getDataForReport(HttpServletRequest request,HttpServletResponse response){
		JSONObject json = new JSONObject();
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		// 主机构id
		Integer orgRootId = userInfo.getOrgRootId();
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
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("orgRootId", orgRootId);
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		params.put("userDataAuth", userDataAuth);
		try {
			JSONObject jo = planInfoFacade.getDataForReportByParams(params);
			json.put("success", true);
			json.put("data",jo);
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "查询数据信息异常");
		}
		return json;
	}
	
	/**===================计划拆分运单页面===================*/
	@RequestMapping(value="/goPlanSplitWaybillTracking",produces="application/json;charset=utf-8")
	public String goPlanSplitWaybillTracking(HttpServletRequest request,HttpServletResponse response,Model model){
		String planSplitWaybillTracking="计划运单跟踪";
		model.addAttribute("planSplitWaybillTracking", planSplitWaybillTracking);
		return "template/planInfo/PlanSplitWaybillTracking/plan_split_waybill_tracking_root_page";
	}
	
	/**
	 * @author zhangshuai  2017年8月18日 下午4:47:37
	 * @param request
	 * @param response
	 * @return
	 * 根据登录用户条件组和登录用户主机构ID查询计划信息
	 */
	@RequestMapping(value="/findPlanSplitWaybillMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<PlanInfoPo> findPlanSplitWaybillMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userOrgRootId=userInfo.getOrgRootId();//主机构ID
		Integer userId=userInfo.getId();//用户ID
		Map<String, Object> dataAuthParams=new HashMap<String,Object>();
		dataAuthParams.put("uId", userId);
		dataAuthParams.put("uOrgRootId", userOrgRootId);
		List<UserDataAuthPo> userDataAuthPos = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(dataAuthParams);
		List<String> dataAuthList=new ArrayList<String>();
		if(CollectionUtils.isNotEmpty(userDataAuthPos)){
			for(UserDataAuthPo userData:userDataAuthPos){
				dataAuthList.add(userData.getConditionGroup());
			}
		}
		
		//接收页面分页参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		
		//接收页面模糊条件
		String planName=request.getParameter("planName");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String planStatus=request.getParameter("planStatus");
		String cooperateStatus=request.getParameter("cooperateStatus");
		String planCreateTimeStart=request.getParameter("planCreateTimeStart");
		String planCreateTimeEnd=request.getParameter("planCreateTimeEnd");
		//根据登录用户主机构ID和条件组查询计划信息
		Map<String, Object> planInfoMap=new HashMap<String,Object>();
		planInfoMap.put("orgRootId", userOrgRootId);
		planInfoMap.put("userDataAuthPos", dataAuthList);
		planInfoMap.put("start", start);
		planInfoMap.put("rows", rows);
		planInfoMap.put("planName", planName);
		planInfoMap.put("entrust", entrust);
		planInfoMap.put("shipper", shipper);
		planInfoMap.put("planStatus", planStatus);
		planInfoMap.put("cooperateStatus", cooperateStatus);
		planInfoMap.put("planCreateTimeStart", planCreateTimeStart);
		planInfoMap.put("planCreateTimeEnd", planCreateTimeEnd);
		List<PlanInfoPo> planInfoPos=planInfoFacade.findPlanInfoAllMation(planInfoMap);
		
		//封装委托方
		List<Integer> orgInfoIds=CommonUtils.getValueList(planInfoPos, "entrust");
		Map<Integer, String> entrustMap=null;
		if(CollectionUtils.isNotEmpty(orgInfoIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				entrustMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		
		//封装承运方
		List<Integer> orgIds=CommonUtils.getValueList(planInfoPos, "shipper");
		Map<Integer, String> shipperMap=null;
		if(CollectionUtils.isNotEmpty(orgIds)){
			List<OrgInfoPo> orgPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgPos)){
				shipperMap=CommonUtils.listforMap(orgPos, "id", "orgName");
			}
		}
		
		//封装货物
		List<Integer> goodsIds=CommonUtils.getValueList(planInfoPos, "goodsInfoId");
		Map<Integer, String> goodsMap=null;
		if(CollectionUtils.isNotEmpty(goodsIds)){
			List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}
		}
		
		//封装线路
		List<Integer> lineIds=CommonUtils.getValueList(planInfoPos, "lineInfoId");
		Map<Integer, String> lineMap=null;
		if(CollectionUtils.isNotEmpty(lineIds)){
			List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineIds);
			if(CollectionUtils.isNotEmpty(lineInfoPos)){
				lineMap=CommonUtils.listforMap(lineInfoPos, "id", "lineName");
			}
		}
		
		//封装创建人
		List<Integer> userIds=CommonUtils.getValueList(planInfoPos, "createUser");
		Map<Integer, String> userMap=null;
		if(CollectionUtils.isNotEmpty(userIds)){
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userIds);
			if(CollectionUtils.isNotEmpty(userInfos)){
				userMap=CommonUtils.listforMap(userInfos, "id", "userName");
			}
		}
		
		/*//封装计划拆分日期
		List<Integer> planIds=CommonUtils.getValueList(planInfoPos, "id");
		Map<Integer, Date> planDateMap=null;
		if(CollectionUtils.isNotEmpty(planIds)){
			List<TransportDayPlanPo> transportDayPlanPos=transportDayPlanFacade.findAllLogMationByPlanInfoId(planIds);
			if(CollectionUtils.isNotEmpty(transportDayPlanPos)){
				planDateMap=CommonUtils.listforMap(transportDayPlanPos, "planInfoId", "createTime");
			}
		}*/
		
		if(CollectionUtils.isNotEmpty(planInfoPos)){
			for (PlanInfoPo planInfoPo : planInfoPos) {
				
				/*//封装计划拆分日期
				if(MapUtils.isNotEmpty(planDateMap)&&planDateMap.get(planInfoPo.getId())!=null){
					planInfoPo.setPlanChaiFenDate(new SimpleDateFormat("yyyy-MM-dd").format(planDateMap.get(planInfoPo.getId())));
				}*/
				
				PlanAuditLogPo planAuditLogPo = planAuditLogFacade.findPlanLogMationByPlanInfoId(planInfoPo.getId());
				if(planAuditLogPo!=null){
					planInfoPo.setPlanChaiFenDate(new SimpleDateFormat("yyyy-MM-dd").format(planAuditLogPo.getAuditTime()));
				}
				
				//封装委托方
				if(MapUtils.isNotEmpty(entrustMap)&&entrustMap.get(planInfoPo.getEntrust())!=null){
					planInfoPo.setEntrustName(entrustMap.get(planInfoPo.getEntrust()));
				}
				//封装承运方
				if(MapUtils.isNotEmpty(shipperMap)&&shipperMap.get(planInfoPo.getShipper())!=null){
					planInfoPo.setShipperName(shipperMap.get(planInfoPo.getShipper()));
				}
				//封装货物
				if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(planInfoPo.getGoodsInfoId())!=null){
					planInfoPo.setGoodsName(goodsMap.get(planInfoPo.getGoodsInfoId()));
				}
				//封装线路
				if(MapUtils.isNotEmpty(lineMap)&&lineMap.get(planInfoPo.getLineInfoId())!=null){
					planInfoPo.setLineName(lineMap.get(planInfoPo.getLineInfoId()));
				}
				//封装创建人
				if(MapUtils.isNotEmpty(userMap)&&userMap.get(planInfoPo.getCreateUser())!=null){
					planInfoPo.setUserName(userMap.get(planInfoPo.getCreateUser()));
				}
				if(planInfoPo.getCreateTime()!=null){
					planInfoPo.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(planInfoPo.getCreateTime()));
				}
				if(planInfoPo.getStartDate()!=null){
					planInfoPo.setStartDateStr(new SimpleDateFormat("yyyy-MM-dd").format(planInfoPo.getStartDate()));
				}
				if(planInfoPo.getEndDate()!=null){
					planInfoPo.setEndDateStr(new SimpleDateFormat("yyyy-MM-dd").format(planInfoPo.getEndDate()));
				}
			}
		}
		return planInfoPos;
	}
	
	/**
	 * @author zhangshuai  2017年8月18日 下午6:41:51
	 * @param request
	 * @param response
	 * @return
	 * 根据登录用户条件组和登录用户主机构ID查询计划信息数量
	 */
	@RequestMapping(value="/getPlanSplitWaybillMationCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getPlanSplitWaybillMationCount(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userOrgRootId=userInfo.getOrgRootId();//主机构ID
		Integer userId=userInfo.getId();//用户ID
		//接收页面模糊条件
		String planName=request.getParameter("planName");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String planStatus=request.getParameter("planStatus");
		String cooperateStatus=request.getParameter("cooperateStatus");
		String planCreateTimeStart=request.getParameter("planCreateTimeStart");
		String planCreateTimeEnd=request.getParameter("planCreateTimeEnd");
		Map<String, Object> dataAuthParams=new HashMap<String,Object>();
		dataAuthParams.put("uId", userId);
		dataAuthParams.put("uOrgRootId", userOrgRootId);
		List<UserDataAuthPo> userDataAuthPos = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(dataAuthParams);
		List<String> dataAuthList=new ArrayList<String>();
		if(CollectionUtils.isNotEmpty(userDataAuthPos)){
			for(UserDataAuthPo userData:userDataAuthPos){
				dataAuthList.add(userData.getConditionGroup());
			}
		}
		
		//根据登录用户主机构ID和条件组查询计划信息
		Map<String, Object> planInfoMap=new HashMap<String,Object>();
		planInfoMap.put("orgRootId", userOrgRootId);
		planInfoMap.put("userDataAuthPos", dataAuthList);
		planInfoMap.put("planName", planName);
		planInfoMap.put("entrust", entrust);
		planInfoMap.put("shipper", shipper);
		planInfoMap.put("planStatus", planStatus);
		planInfoMap.put("cooperateStatus", cooperateStatus);
		planInfoMap.put("planCreateTimeStart", planCreateTimeStart);
		planInfoMap.put("planCreateTimeEnd", planCreateTimeEnd);
		Integer count=planInfoFacade.getPlanSplitWaybillMationCount(planInfoMap);
		return count;
	}
	
}