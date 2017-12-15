package com.xz.logistics.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.EvaluationDriverFacade;
import com.xz.facade.api.EvaluationEnterpriceFacade;
import com.xz.facade.api.EvaluationTemplateFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.EvaluationDriver;
import com.xz.model.po.EvaluationDriverDetail;
import com.xz.model.po.EvaluationEnterprice;
import com.xz.model.po.EvaluationEnterpriceDetail;
import com.xz.model.po.EvaluationTemplate;
import com.xz.model.po.EvaluationTemplateDetail;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserInfo;


/**
 * @title CreditEvaluationController
 * @description 信用评价控制器
 * @author zhangbo
 * @date 2017/10/17
 * */
@Controller
@RequestMapping("/evaluate")
public class CreditEvaluationController extends BaseController{
	
	private final Logger log = LoggerFactory.getLogger(getClass());

	@Resource
	private EvaluationTemplateFacade evaluationTemplateFacade;

	@Resource
	private EvaluationDriverFacade evaluationDriverFacade;
	
	@Resource
	private EvaluationEnterpriceFacade evaluationEnterpriceFacade;
	
	@Resource
	private OrgInfoFacade orgInfoFacade;
	
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	
	@Resource
	private DriverInfoFacade driverInfoFacade;
	
	
	/**
	 * @title goEvaluationDriverPendingEvaluation
	 * @description 跳转到司机待评价页面
	 * @return url
	 * @author zhangbo
	 * @date 2017/10/17
	 * */
	@RequestMapping("/driverPending")
	public String goEvaluationDriverPendingEvaluation(){
		return "template/creditEvaluation/evaluationDriver_pending_evaluation";
	}
	
	/**
	 * @title goEvaluationDriverPendingEvaluation
	 * @description 跳转到司机已评价页面
	 * @return url
	 * @author zhangbo
	 * @date 2017/10/17
	 * */
	@RequestMapping("/driverAlready")
	public String goEvaluationDriverAlreadyEvaluation(){
		return "template/creditEvaluation/evaluationDriver_already_evaluation";
	}
	
	/**
	 * @title goEvaluationEnterprisePendingEvaluation
	 * @description 跳转到企业待评价页面
	 * @return url
	 * @author zhangbo
	 * @date 2017/10/17
	 * */
	@RequestMapping("/enterprisePending")
	public String goEvaluationEnterprisePendingEvaluation(HttpServletRequest request,HttpServletResponse response,Model model){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		String userName="";//用户名
		//判断登录方角色
		//企业货主、、、、物流公司
		if(userInfo.getUserRole() ==1 || userInfo.getUserRole() ==2){
			List<Integer> orgInfoIds=new ArrayList<Integer>();
			orgInfoIds.add(userInfo.getOrgInfoId());
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					userName=orgInfoPo.getOrgName();
				}
			}
			
		}else 
			//个体货主
			if(userInfo.getUserRole()==3){
			
				IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerById(userInfo.getId());
				
				if(individualOwnerPo!=null){
					userName=individualOwnerPo.getRealName();
				}
				
		}else 
			//司机
			if(userInfo.getUserRole()==4){
				List<Integer> userInfoIds=new ArrayList<Integer>();
				userInfoIds.add(userInfo.getId());
				List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
				
				if(CollectionUtils.isNotEmpty(driverInfos)){
					for (DriverInfo driverInfo : driverInfos) {
						userName=driverInfo.getDriverName();
					}
				}
		}
		
		float average=0f;
		Integer count=0;
		//1、当我作为委托方时，获取承运方对我的评价
		
		EvaluationEnterprice evaluationEnterpriceEntrust=evaluationEnterpriceFacade.findEvaluationByMyIsEntrust(userInfo.getOrgInfoId());
		
		//2、当我作为承运方时，获取委托方对我的评价
		
		EvaluationEnterprice evaluationEnterpriceShipper=evaluationEnterpriceFacade.findEvaluationByMyIsShipper(userInfo.getOrgInfoId());
		
		//综合得分
		if(evaluationEnterpriceEntrust.getAverage()!=0 && evaluationEnterpriceShipper.getAverage()!=0){
			average=(evaluationEnterpriceEntrust.getAverage()+evaluationEnterpriceShipper.getAverage())/2;
		}else if(evaluationEnterpriceEntrust.getAverage()==0){
			average=evaluationEnterpriceShipper.getAverage();
		}else if(evaluationEnterpriceShipper.getAverage()==0){
			average=evaluationEnterpriceEntrust.getAverage();
		}
		//评价次数
		if(evaluationEnterpriceEntrust.getCount()!=null ||  evaluationEnterpriceShipper.getCount()!=null){
			count=evaluationEnterpriceEntrust.getCount()+evaluationEnterpriceShipper.getCount();
		}
		
		model.addAttribute("userName", userName);
		model.addAttribute("average", average);
		model.addAttribute("count", count);
		return "template/creditEvaluation/evaluationEnterprise_pending_evaluation";
	}
	
	
	/**
	 * @title goEvaluationEnterpriseAlreadyEvaluation
	 * @description 跳转到企业已评价页面
	 * @return url
	 * @author zhangbo
	 * @date 2017/10/17
	 * */
	@RequestMapping("/enterpriseAlready")
	public String goEvaluationEnterpriseAlreadyEvaluation(HttpServletRequest request,HttpServletResponse response,Model model){
		
		//从session中获取登录用户信息
				UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
				String userName="";//用户名
				//判断登录方角色
				//企业货主、、、、物流公司
				if(userInfo.getUserRole() ==1 || userInfo.getUserRole() ==2){
					List<Integer> orgInfoIds=new ArrayList<Integer>();
					orgInfoIds.add(userInfo.getOrgInfoId());
					List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
					
					if(CollectionUtils.isNotEmpty(orgInfoPos)){
						for (OrgInfoPo orgInfoPo : orgInfoPos) {
							userName=orgInfoPo.getOrgName();
						}
					}
					
				}else 
					//个体货主
					if(userInfo.getUserRole()==3){
					
						IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerById(userInfo.getId());
						
						if(individualOwnerPo!=null){
							userName=individualOwnerPo.getRealName();
						}
						
				}else 
					//司机
					if(userInfo.getUserRole()==4){
						List<Integer> userInfoIds=new ArrayList<Integer>();
						userInfoIds.add(userInfo.getId());
						List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
						
						if(CollectionUtils.isNotEmpty(driverInfos)){
							for (DriverInfo driverInfo : driverInfos) {
								userName=driverInfo.getDriverName();
							}
						}
				}
				
				float average=0f;
				Integer count=0;
				//1、当我作为委托方时，获取承运方对我的评价
				
				EvaluationEnterprice evaluationEnterpriceEntrust=evaluationEnterpriceFacade.findEvaluationByMyIsEntrust(userInfo.getOrgInfoId());
				
				//2、当我作为承运方时，获取委托方对我的评价
				
				EvaluationEnterprice evaluationEnterpriceShipper=evaluationEnterpriceFacade.findEvaluationByMyIsShipper(userInfo.getOrgInfoId());
				
				//综合得分
				if(evaluationEnterpriceEntrust.getAverage()!=0 && evaluationEnterpriceShipper.getAverage()!=0){
					average=(evaluationEnterpriceEntrust.getAverage()+evaluationEnterpriceShipper.getAverage())/2;
				}else if(evaluationEnterpriceEntrust.getAverage()==0){
					average=evaluationEnterpriceShipper.getAverage();
				}else if(evaluationEnterpriceShipper.getAverage()==0){
					average=evaluationEnterpriceEntrust.getAverage();
				}
				//评价次数
				if(evaluationEnterpriceEntrust.getCount()!=null ||  evaluationEnterpriceShipper.getCount()!=null){
					count=evaluationEnterpriceEntrust.getCount()+evaluationEnterpriceShipper.getCount();
				}
				
				model.addAttribute("userName", userName);
				model.addAttribute("average", average);
				model.addAttribute("count", count);
		
		return "template/creditEvaluation/evaluationEnterprise_already_evaluation";
	}
	
	/**
	 * @title goEvaluationEnterpriseAlreadyEvaluation
	 * @description 跳转评价模板设置页面
	 * @return url
	 * @author zhangbo
	 * @date 2017/10/24
	 * */
	@RequiresPermissions("evaluate:template:view")
	@RequestMapping("/evaluationTemplate")
	public String goEvaluationTemplate(){
		return "template/creditEvaluation/evaluation_template";
	}
	
	
	/**
	 * @title selectEvaluationForDriver
	 * @description 查询评价司机信息未评价或已评价
	 * @author zhangbo
	 * @date 2017/11/04
	 * @param EvaluationDriver evaluationDriver
	 * @return Map<String,Object>
	 * */
	@RequestMapping("/EvaluationForDriver")
	@ResponseBody
	public Map<String,Object> selectEvaluationForDriver(EvaluationDriver evaluationDriver,HttpServletRequest request){
		// 从session中获取用户信息
				UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
				Integer userRole = userInfo.getUserRole();
				Integer enterpriseUserType = userInfo.getEnterpriseUserType();
				Integer userId = userInfo.getId();
				Integer orgInfoId = userInfo.getOrgRootId();
				EvaluationDriver evaluationDriverView = new EvaluationDriver();
				Map<String,Object> evaluaMap = new HashMap<String,Object>();
				if(userRole == 4 || enterpriseUserType == 2){//当前登录用户为外协司机或内部企业司机
					evaluationDriver.setEnterpriseEvaluationStatus(0); //取消企业评价状态
					evaluationDriver.setEntrust(userId);
					//计算司机的综合得分和被评价总次数
					evaluationDriverView =evaluationDriverFacade.calculateAndStatisticsEvaluateForDriver(userId);
					evaluationDriverView.setEvaluationRoles(1); //当前评价人为司机
					
				}else{
					evaluationDriver.setEntrust(orgInfoId);
					evaluationDriver.setDriverEvaluationStatus(0);  //取消司机评价状态
					//计算企业的综合得分和被评价总次数
					evaluationDriverView =evaluationDriverFacade.calculateAndStatisticsEvaluateForDriver(orgInfoId);
					evaluationDriverView.setEvaluationRoles(2); //当前评价人为企业
				}
				evaluaMap = evaluationDriverFacade.selectEvaluationForDriver(evaluationDriver);
				evaluaMap.put("evaluationDriverView", evaluationDriverView);
				return evaluaMap;
		
	}
	

	/**
	 * @title selectEvaluationForDriver
	 * @description 查询评价司机信息未评价或已评价
	 * @author zhangbo
	 * @date 2017/11/04
	 * @param EvaluationDriver evaluationDriver
	 * @return Map<String,Object>
	 * */
	public Map<String,Object> selectEvaluationForENterprice(EvaluationDriver evaluationDriver){
		return null;
		
	}
	
	/**
	 * @title goAddEvaluateTemplete
	 * @description 跳转到新增评价模板字段
	 * @author zhangbo
	 * @date 2017/11/06
	 * @return url
	 * */
	@RequestMapping("/goAddEvaluateTemplete")
	public String goAddEvaluateTemplete(String flag,Model model){
		model.addAttribute("flag", flag);
		return "template/creditEvaluation/add_evaluation_template";
	} 	

	@RequestMapping("/insertEvaluationTemplate")
	@ResponseBody
	public Integer insertEvaluationTemplate(EvaluationTemplate evaluationTemplate,HttpServletRequest request){
		Integer id = 0;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
        Integer userId = userInfo.getId();
        evaluationTemplate.setCreatPerson(userId);
        evaluationTemplate.setCreatTime(new java.sql.Date(new Date().getTime()));
        evaluationTemplateFacade.insertEvaluationTemplate(evaluationTemplate);
        id = evaluationTemplate.getId();
		//System.out.println(id);
        return id;
	}
	
	
	/**
	 * @title selectEvaluationInfo
	 * @description 查询评价模板信息
	 * @author zhangbo
	 * @date 2017/11/06
	 * @return List<EvaluationTemplate>
	 * */
	@RequestMapping("/selectEvaluationTemplate")
	@ResponseBody
	public Map<String,Object> selectEvaluationInfo(EvaluationTemplate evaluationTemplate){
		return evaluationTemplateFacade.selectEvaluationInfo(evaluationTemplate);
	}
	
	@RequestMapping("/insertEvaluationTemplateDetail")
	@ResponseBody
	public boolean insertEvaluationTemplateDetail(String detail){
		List<EvaluationTemplateDetail> evaluateTemplateDetailList = new ArrayList<EvaluationTemplateDetail>();
		EvaluationTemplateDetail EvaluationTemplateDrtail = new EvaluationTemplateDetail();
		evaluateTemplateDetailList = CommonUtils.jsonStringForList(detail,EvaluationTemplateDrtail);
		/*for (EvaluationTemplateDetail evaluationTemplateDetail : evaluateTemplateDetailList) {
			System.out.println(evaluationTemplateDetail);
		}*/
		evaluationTemplateFacade.insertEvaluationTemplateDetail(evaluateTemplateDetailList);
		return true;
	}
	
	/**
	 * @title selectEvaluateDetailInfo
	 * @description 根据评价模板Id查询所有结算明细
	 * @author zhangbo
	 * @date 2017/11/07
	 * @param Integer evaluationTemplateId
	 * @return List<EvaluationTemplateDetail>
	 * */
	@RequestMapping("/selectEvaluateDetailInfo")
	@ResponseBody
	public List<EvaluationTemplateDetail> selectEvaluateDetailInfo(Integer evaluationTemplateId){
		return evaluationTemplateFacade.selectEvaluateDetailInfo(evaluationTemplateId);
	}
	
	/** 
	* @方法名: evaluationEnterpriseList 
	* @作者: zhangshuai
	* @时间: 2017年11月8日 下午4:52:50
	* @返回值类型: List<EvaluationEnterprice> 
	* @throws 
	* 根据当前登录人匹配委托方或承运方查询企业评价数据信息
	*/
	@RequestMapping(value="/evaluationEnterpriseList")
	@ResponseBody
	public List<EvaluationEnterprice> evaluationEnterpriseList(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		Integer orgInfoId=userInfo.getOrgInfoId();
		//接收数据
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		String timeStart=request.getParameter("timeStart");
		String timeEnd=request.getParameter("timeEnd");
		String billNo=request.getParameter("billNo");
		String billType=request.getParameter("billType");
		Integer type=Integer.parseInt(request.getParameter("type"));
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("orgInfoId", orgInfoId);
		params.put("start", start);
		params.put("rows", rows);
		params.put("timeStart", timeStart);
		params.put("timeEnd", timeEnd);
		params.put("billNo", billNo);
		params.put("billType", billType);
		params.put("type", type);
		//查询企业评价主表信息(匹配委托方/承运方)
		List<EvaluationEnterprice> evaluationEnterprices=evaluationEnterpriceFacade.findEvaluationEnterpriseByOrgInfoId(params);
		for (EvaluationEnterprice evaluationEnterprice : evaluationEnterprices) {
			if(evaluationEnterprice.getCreatTime()!=null){
				evaluationEnterprice.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(evaluationEnterprice.getCreatTime()));
			}
		}
		return evaluationEnterprices;
	}
	
	/** 
	* @方法名: getEvaluationEnterpriseListCount 
	* @作者: zhangshuai
	* @时间: 2017年11月8日 下午5:33:36
	* @返回值类型: Integer 
	* @throws 
	* 根据当前登录人匹配委托方或承运方查询企业评价数据信息数量
	*/
	@RequestMapping(value="/getEvaluationEnterpriseListCount")
	@ResponseBody
	public Integer getEvaluationEnterpriseListCount(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		Integer orgInfoId=userInfo.getOrgInfoId();
		//页面模糊参数
		String timeStart=request.getParameter("timeStart");
		String timeEnd=request.getParameter("timeEnd");
		String billNo=request.getParameter("billNo");
		String billType=request.getParameter("billType");
		Integer type=Integer.parseInt(request.getParameter("type"));
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("orgInfoId", orgInfoId);
		params.put("timeStart", timeStart);
		params.put("timeEnd", timeEnd);
		params.put("billNo", billNo);
		params.put("billType", billType);
		params.put("type", type);
		//查询企业评价主表信息(匹配委托方/承运方)
		List<EvaluationEnterprice> evaluationEnterprices=evaluationEnterpriceFacade.findEvaluationEnterpriseByOrgInfoId(params);
		for (EvaluationEnterprice evaluationEnterprice : evaluationEnterprices) {
			if(evaluationEnterprice.getCreatTime()!=null){
				evaluationEnterprice.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(evaluationEnterprice.getCreatTime()));
			}
		}
		return evaluationEnterprices.size();
	}
	
	/** 
	* @方法名: showEvaluationModelPage 
	* @作者: zhangshuai
	* @时间: 2017年11月9日 上午11:28:17
	* @返回值类型: String 
	* @throws 
	* 企业之间评价匹配模板
	*/
	@RequestMapping(value="/showEvaluationModelPage")
	public String showEvaluationModelPage(HttpServletRequest request,HttpServletResponse response){
		return "template/creditEvaluation/evaluation_enterprice_model";
	}
	
	/** 
	* @方法名: showEvaluationMation 
	* @作者: zhangshuai
	* @时间: 2017年11月11日 下午4:19:55
	* @返回值类型: Map<String,Object> 
	* @throws 
	* 模板数据
	*/
	@RequestMapping(value="/showEvaluationMation")
	@ResponseBody
	public Map<String, Object> showEvaluationMation(HttpServletRequest request,HttpServletResponse response){
		
		Map<String, Object> mapList=new HashMap<String,Object>();
		
		//从session中获取当前登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoId=userInfo.getOrgInfoId();
		
		//接受页面参数
		Integer id=Integer.parseInt(request.getParameter("id"));
		Integer type=Integer.parseInt(request.getParameter("type"));
		
		if(type==1){
			//根据id查询企业级评价信息
			EvaluationEnterprice evaluationEnterprice=evaluationEnterpriceFacade.findEvaluationEnterpriceById(id);
			
			//匹配委托方
			if(evaluationEnterprice.getEntrust().equals(orgInfoId)){
				//匹配评价模板主表信息
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("evaluationTemplateType", 3);//委托方对承运方
				//判断单据状态
				if(evaluationEnterprice.getBillStatus()==1){
					params.put("evaluationStage", 2);
				}else if(evaluationEnterprice.getBillStatus()==2){
					params.put("evaluationStage", 3);
				}else if(evaluationEnterprice.getBillStatus()==3){
					params.put("evaluationStage", 4);
				}
				params.put("status", 1);
				
				EvaluationTemplate evaluationTemplate=evaluationTemplateFacade.findEvaluationTemplate(params);
				
				if(evaluationTemplate.getEvaluationTemplateType()==1){
					evaluationTemplate.setEvaluationTemplateTypeStr("上游对司机");
				}else if(evaluationTemplate.getEvaluationTemplateType()==2){
					evaluationTemplate.setEvaluationTemplateTypeStr("司机对上游");
				}else if(evaluationTemplate.getEvaluationTemplateType()==3){
					evaluationTemplate.setEvaluationTemplateTypeStr("委托方对承运方");
				}else if(evaluationTemplate.getEvaluationTemplateType()==4){
					evaluationTemplate.setEvaluationTemplateTypeStr("承运方对委托方");
				}
				
				if(evaluationTemplate.getEvaluationStage()==1){
					evaluationTemplate.setEvaluationStageStr("运单已付款");
				}else if(evaluationTemplate.getEvaluationStage()==2){
					evaluationTemplate.setEvaluationStageStr("计划已下达");
				}else if(evaluationTemplate.getEvaluationStage()==3){
					evaluationTemplate.setEvaluationStageStr("对账已完成");
				}else if(evaluationTemplate.getEvaluationStage()==4){
					evaluationTemplate.setEvaluationStageStr("结算已付款");
				}
				
				evaluationTemplate.setCreatTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(evaluationTemplate.getCreatTime()));
				
				//根据查询出的评价模板id查询评价模板明细信息
				Map<String, Object> paramsMap=new HashMap<String,Object>();
				paramsMap.put("evaluationTemplateId", evaluationTemplate.getId());
				
				List<EvaluationTemplateDetail> evaluationTemplateDetails=evaluationTemplateFacade.findEvaluationTemplateDetailByEvaluationTemplateId(paramsMap);
				
				mapList.put("evaluationTemplateDetails", evaluationTemplateDetails);
				mapList.put("evaluationTemplate", evaluationTemplate);
				return mapList;
				
				
			}else
			//匹配承运方
			if(evaluationEnterprice.getShipper().equals(orgInfoId)){
				
				//匹配评价模板主表信息
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("evaluationTemplateType", 4);//承运方对委托方
				//判断单据状态
				if(evaluationEnterprice.getBillStatus()==1){
					params.put("evaluationStage", 2);
				}else if(evaluationEnterprice.getBillStatus()==2){
					params.put("evaluationStage", 3);
				}else if(evaluationEnterprice.getBillStatus()==3){
					params.put("evaluationStage", 4);
				}
				params.put("status", 1);
				
				EvaluationTemplate evaluationTemplate=evaluationTemplateFacade.findEvaluationTemplate(params);
				
				if(evaluationTemplate.getEvaluationTemplateType()==1){
					evaluationTemplate.setEvaluationTemplateTypeStr("上游对司机");
				}else if(evaluationTemplate.getEvaluationTemplateType()==2){
					evaluationTemplate.setEvaluationTemplateTypeStr("司机对上游");
				}else if(evaluationTemplate.getEvaluationTemplateType()==3){
					evaluationTemplate.setEvaluationTemplateTypeStr("委托方对承运方");
				}else if(evaluationTemplate.getEvaluationTemplateType()==4){
					evaluationTemplate.setEvaluationTemplateTypeStr("承运方对委托方");
				}
				
				if(evaluationTemplate.getEvaluationStage()==1){
					evaluationTemplate.setEvaluationStageStr("运单已付款");
				}else if(evaluationTemplate.getEvaluationStage()==2){
					evaluationTemplate.setEvaluationStageStr("计划已下达");
				}else if(evaluationTemplate.getEvaluationStage()==3){
					evaluationTemplate.setEvaluationStageStr("对账已完成");
				}else if(evaluationTemplate.getEvaluationStage()==4){
					evaluationTemplate.setEvaluationStageStr("结算已付款");
				}
				
				evaluationTemplate.setCreatTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(evaluationTemplate.getCreatTime()));
				
				//根据查询出的评价模板id查询评价模板明细信息
				Map<String, Object> paramsMap=new HashMap<String,Object>();
				paramsMap.put("evaluationTemplateId", evaluationTemplate.getId());
				
				List<EvaluationTemplateDetail> evaluationTemplateDetails=evaluationTemplateFacade.findEvaluationTemplateDetailByEvaluationTemplateId(paramsMap);
				mapList.put("evaluationTemplateDetails", evaluationTemplateDetails);
				mapList.put("evaluationTemplate", evaluationTemplate);
				return mapList;
				
			}
		}else if(type==2){
			//根据企业间评价id查询企业评价明细信息
			EvaluationEnterprice evaluationEnterprice = evaluationEnterpriceFacade.findEvaluationEnterpriceById(id);
			//匹配委托方
			if(evaluationEnterprice.getEntrust().equals(orgInfoId)){
				//匹配评价模板主表信息
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("evaluationTemplateType", 3);//委托方对承运方
				//判断单据状态
				if(evaluationEnterprice.getBillStatus()==1){
					params.put("evaluationStage", 2);
				}else if(evaluationEnterprice.getBillStatus()==2){
					params.put("evaluationStage", 3);
				}else if(evaluationEnterprice.getBillStatus()==3){
					params.put("evaluationStage", 4);
				}
				params.put("status", 1);
				
				EvaluationTemplate evaluationTemplate=evaluationTemplateFacade.findEvaluationTemplate(params);
				
				if(evaluationTemplate.getEvaluationTemplateType()==1){
					evaluationTemplate.setEvaluationTemplateTypeStr("上游对司机");
				}else if(evaluationTemplate.getEvaluationTemplateType()==2){
					evaluationTemplate.setEvaluationTemplateTypeStr("司机对上游");
				}else if(evaluationTemplate.getEvaluationTemplateType()==3){
					evaluationTemplate.setEvaluationTemplateTypeStr("委托方对承运方");
				}else if(evaluationTemplate.getEvaluationTemplateType()==4){
					evaluationTemplate.setEvaluationTemplateTypeStr("承运方对委托方");
				}
				
				if(evaluationTemplate.getEvaluationStage()==1){
					evaluationTemplate.setEvaluationStageStr("运单已付款");
				}else if(evaluationTemplate.getEvaluationStage()==2){
					evaluationTemplate.setEvaluationStageStr("计划已下达");
				}else if(evaluationTemplate.getEvaluationStage()==3){
					evaluationTemplate.setEvaluationStageStr("对账已完成");
				}else if(evaluationTemplate.getEvaluationStage()==4){
					evaluationTemplate.setEvaluationStageStr("结算已付款");
				}
				
				evaluationTemplate.setCreatTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(evaluationTemplate.getCreatTime()));
				
				Map<String, Object> paramsMap=new HashMap<String,Object>();
				paramsMap.put("evaluationEnterpriceId", id);
				
				//匹配委托方
				if(evaluationEnterprice.getEntrust().equals(orgInfoId)){
					paramsMap.put("appraiser", evaluationEnterprice.getEntrust());
					paramsMap.put("passiveAppraiser", evaluationEnterprice.getShipper());
				}else 
					//匹配承运方
					if(evaluationEnterprice.getShipper().equals(orgInfoId)){
						paramsMap.put("appraiser", evaluationEnterprice.getShipper());
						paramsMap.put("passiveAppraiser", evaluationEnterprice.getEntrust());
				}
				//查询企业评价明细信息
				List<EvaluationEnterpriceDetail> evaluationEnterpriceDetailList=evaluationEnterpriceFacade.findEvaluationEnterpriceDetailById(paramsMap);
				evaluationEnterprice.setType(1);
				mapList.put("evaluationEnterpriceDetailList", evaluationEnterpriceDetailList);
				mapList.put("evaluationTemplate", evaluationTemplate);
				mapList.put("evaluationEnterprice", evaluationEnterprice);
				return mapList;
				
				
			}else
			//匹配承运方
			if(evaluationEnterprice.getShipper().equals(orgInfoId)){
				
				//匹配评价模板主表信息
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("evaluationTemplateType", 4);//承运方对委托方
				//判断单据状态
				if(evaluationEnterprice.getBillStatus()==1){
					params.put("evaluationStage", 2);
				}else if(evaluationEnterprice.getBillStatus()==2){
					params.put("evaluationStage", 3);
				}else if(evaluationEnterprice.getBillStatus()==3){
					params.put("evaluationStage", 4);
				}
				params.put("status", 1);
				
				EvaluationTemplate evaluationTemplate=evaluationTemplateFacade.findEvaluationTemplate(params);
				
				if(evaluationTemplate.getEvaluationTemplateType()==1){
					evaluationTemplate.setEvaluationTemplateTypeStr("上游对司机");
				}else if(evaluationTemplate.getEvaluationTemplateType()==2){
					evaluationTemplate.setEvaluationTemplateTypeStr("司机对上游");
				}else if(evaluationTemplate.getEvaluationTemplateType()==3){
					evaluationTemplate.setEvaluationTemplateTypeStr("委托方对承运方");
				}else if(evaluationTemplate.getEvaluationTemplateType()==4){
					evaluationTemplate.setEvaluationTemplateTypeStr("承运方对委托方");
				}
				
				if(evaluationTemplate.getEvaluationStage()==1){
					evaluationTemplate.setEvaluationStageStr("运单已付款");
				}else if(evaluationTemplate.getEvaluationStage()==2){
					evaluationTemplate.setEvaluationStageStr("计划已下达");
				}else if(evaluationTemplate.getEvaluationStage()==3){
					evaluationTemplate.setEvaluationStageStr("对账已完成");
				}else if(evaluationTemplate.getEvaluationStage()==4){
					evaluationTemplate.setEvaluationStageStr("结算已付款");
				}
				
				evaluationTemplate.setCreatTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(evaluationTemplate.getCreatTime()));
				
				Map<String, Object> paramsMap=new HashMap<String,Object>();
				paramsMap.put("evaluationEnterpriceId", id);
				
				//匹配委托方
				if(evaluationEnterprice.getEntrust().equals(orgInfoId)){
					paramsMap.put("appraiser", evaluationEnterprice.getEntrust());
					paramsMap.put("passiveAppraiser", evaluationEnterprice.getShipper());
				}else 
					//匹配承运方
					if(evaluationEnterprice.getShipper().equals(orgInfoId)){
						paramsMap.put("appraiser", evaluationEnterprice.getShipper());
						paramsMap.put("passiveAppraiser", evaluationEnterprice.getEntrust());
				}
				//查询企业评价明细信息
				List<EvaluationEnterpriceDetail> evaluationEnterpriceDetailList=evaluationEnterpriceFacade.findEvaluationEnterpriceDetailById(paramsMap);
				evaluationEnterprice.setType(2);
				mapList.put("evaluationEnterpriceDetailList", evaluationEnterpriceDetailList);
				mapList.put("evaluationTemplate", evaluationTemplate);
				mapList.put("evaluationEnterprice", evaluationEnterprice);
				return mapList;
				
			}
			
			
			
			
			
			
			
		}
		
		
		return null;
		
	}
	
	/** 
	* @方法名: getEvaluationMationCount 
	* @作者: zhangshuai
	* @时间: 2017年11月9日 下午12:54:16
	* @返回值类型: Integer 
	* @throws 
	* 企业之间评价匹配模板数量
	*/
	@RequestMapping(value="/getEvaluationMationCount")
	@ResponseBody
	public Integer getEvaluationMationCount(HttpServletRequest request,HttpServletResponse response){
		//从session中获取当前登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoId=userInfo.getOrgInfoId();
		
		//接受页面参数
		Integer id=Integer.parseInt(request.getParameter("id"));
		
		//根据id查询企业级评价信息
		EvaluationEnterprice evaluationEnterprice=evaluationEnterpriceFacade.findEvaluationEnterpriceById(id);
		
		//匹配委托方
		if(evaluationEnterprice.getEntrust().equals(orgInfoId)){
			//匹配评价模板主表信息
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("evaluationTemplateType", 3);//委托方对承运方
			//判断单据状态
			if(evaluationEnterprice.getBillStatus()==1){
				params.put("evaluationStage", 2);
			}else if(evaluationEnterprice.getBillStatus()==2){
				params.put("evaluationStage", 3);
			}else if(evaluationEnterprice.getBillStatus()==3){
				params.put("evaluationStage", 4);
			}
			params.put("status", 1);
			
			EvaluationTemplate evaluationTemplate=evaluationTemplateFacade.findEvaluationTemplate(params);
			
			//根据查询出的评价模板id查询评价模板明细信息
			Map<String, Object> paramsMap=new HashMap<String,Object>();
			paramsMap.put("evaluationTemplateId", evaluationTemplate.getId());
			
			List<EvaluationTemplateDetail> evaluationTemplateDetails=evaluationTemplateFacade.findEvaluationTemplateDetailByEvaluationTemplateId(paramsMap);
			
			return evaluationTemplateDetails.size();
			
			
		}else
		//匹配承运方
		if(evaluationEnterprice.getShipper().equals(orgInfoId)){
			
			//匹配评价模板主表信息
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("evaluationTemplateType", 4);//承运方对委托方
			//判断单据状态
			if(evaluationEnterprice.getBillStatus()==1){
				params.put("evaluationStage", 2);
			}else if(evaluationEnterprice.getBillStatus()==2){
				params.put("evaluationStage", 3);
			}else if(evaluationEnterprice.getBillStatus()==3){
				params.put("evaluationStage", 4);
			}
			params.put("status", 1);
			
			EvaluationTemplate evaluationTemplate=evaluationTemplateFacade.findEvaluationTemplate(params);
			
			//根据查询出的评价模板id查询评价模板明细信息
			Map<String, Object> paramsMap=new HashMap<String,Object>();
			paramsMap.put("evaluationTemplateId", evaluationTemplate.getId());
			
			List<EvaluationTemplateDetail> evaluationTemplateDetails=evaluationTemplateFacade.findEvaluationTemplateDetailByEvaluationTemplateId(paramsMap);
			
			return evaluationTemplateDetails.size();
			
		}
		return null;
	}
	
	/**
	 * @title deleteEvaluateTemplateDetailByETId
	 * @description 根据评价模板Id删除评价模板明细 -
	 * @author zhangbo
	 * @date 2017/11/09
	 * @param Integer evaluationTemplateId
	 * */
	@RequestMapping("/deleteEvaluateTemplateDetailByETId")
	@ResponseBody
	public void deleteEvaluateTemplateDetailByETId(Integer evaluationTemplateId){
		evaluationTemplateFacade.deleteEvaluateTemplateDetailByETId(evaluationTemplateId);
	}
	
	/**
	 * @title deleteEvaluateTemplateDetailByETId
	 * @description 根据主键删除评价模板明细 -
	 * @author zhangbo
	 * @date 2017/11/09
	 * @param Integer id
	 * */
	@RequestMapping("/deleteEvaluateTemplateDetailByPK")
	@ResponseBody
	public void deleteEvaluateTemplateDetailByPK(Integer id){
		evaluationTemplateFacade.deleteEvaluateTemplateDetailByPK(id);
	}
	
	/**
	 * @title deleteEvaluateTemplate
	 * @description 删除评价模板
	 * @author zhangbo
	 * @date 2017/11/09
	 * */
	@RequestMapping("/deleteEvaluateTemplate")
	@ResponseBody
	public void deleteEvaluateTemplate(Integer id){
		evaluationTemplateFacade.deleteEvaluateTemplate(id);
	}
	
	/**
	 * @title editEvaluationTemplateById
	 * @description 修改评价模板状态
	 * @author zhangbo
	 * @date 2017/11/09
	 * @param EvaluationTemplate evaluationTemplate
	 * */
	@RequestMapping("/editEvaluationTemplateById")
	@ResponseBody
	public void editEvaluationTemplateById(EvaluationTemplate evaluationTemplate){
		evaluationTemplateFacade.editEvaluationTemplateById(evaluationTemplate);
	}

	/**
	 * @title editEvaluationTemplateById
	 * @description 查询评价阶段和表单类型相同却状态为启用的记录数
	 * @author zhangbo
	 * @date 2017/11/09
	 * @param EvaluationTemplate evaluationTemplate
	 * */
	@RequestMapping("/selectSameDataCount")
	@ResponseBody
	public Integer selectSameDataCount(Integer id){
		return evaluationTemplateFacade.selectSameDataCount(id);
	}
	
	/**
	 * @title selectEvaluationTemplateForDriverEvaluation
	 * @description 评价司机选择评价模板
	 * @author zhangbo
	 * @date 2017/11/10
	 * @return List<EvaluationTemplateDetail>
	 * @param Integer evaluationTemplateType
	 * */
	@RequestMapping("/selectEvaluationTemplateForDriverEvaluation")
	@ResponseBody
	public Map<String,Object> selectEvaluationTemplateForDriverEvaluation(Integer evaluationTemplateType){
		Map<String,Object> aMap = new HashMap<String,Object>();
		List<EvaluationTemplateDetail> aList = new ArrayList<EvaluationTemplateDetail>();
		EvaluationTemplate evaluationTemplate = new EvaluationTemplate();
		//查询评价模板明细信息
		aList = evaluationTemplateFacade.selectEvaluationTemplateForDriverEvaluation(evaluationTemplateType);
		if(aList != null && aList.size() >0){
		Integer id = aList.get(0).getEvaluationTemplateId();
		//查询评价模板信息
		evaluationTemplate = evaluationTemplateFacade.selectEvaluateTemplateByPrimaryKey(id);
		aMap.put("aList", aList);
		aMap.put("evaluationTemplate", evaluationTemplate);
		}
		return aMap;
	}
	
	@RequestMapping("/addEvaluationDriverScore")
	@ResponseBody
	public boolean addEvaluationDriverScore(String detail,String model,String role){
		List<EvaluationDriverDetail> evaluationDriverDetailList = new ArrayList<EvaluationDriverDetail>();
		EvaluationDriverDetail evaluationDriverDetail = new EvaluationDriverDetail();
		if(detail != null && !"".equals(detail)){
			evaluationDriverDetailList = CommonUtils.jsonStringForList(detail,evaluationDriverDetail);
		}
		EvaluationDriver evaluationDriver = new EvaluationDriver();
		if(model != "" && model != null){
			net.sf.json.JSONObject jsonObject = net.sf.json.JSONObject.fromObject(model);
			if(null != jsonObject){
				String id = jsonObject.getString("id");
				evaluationDriver.setId(Integer.valueOf(id));  //主键
			if("1".equals(role)){//当前评价人是司机
				String driverForEntrustStr = (String)jsonObject.get("driverForEntrust");
				float driverForEntrust = Float.valueOf(driverForEntrustStr);
				String driverForEntrustOverallMerit = jsonObject.getString("driverForEntrustOverallMerit");
				evaluationDriver.setDriverForEntrust(driverForEntrust); //司机对企业的评分
				evaluationDriver.setDriverForEntrustOverallMerit(driverForEntrustOverallMerit); //司机对企业的综合评分
				evaluationDriver.setDriverEvaluationTime(new java.sql.Date(new Date().getTime())); //司机评价时间
				evaluationDriver.setDriverEvaluationStatus(2); //已评价
			}
			if("2".equals(role)){//当前评价人是企业
				String entrustForDriverStr = (String) jsonObject.get("entrustForDriver");
				float entrustForDriver = Float.valueOf(entrustForDriverStr);
				String entrustForDriverOverallMerit = jsonObject.getString("entrustForDriverOverallMerit");
				evaluationDriver.setEntrustForDriver(entrustForDriver); //企业对司机的评分
				evaluationDriver.setEntrustForDriverOverallMerit(entrustForDriverOverallMerit); //企业对司机的综合评分
				evaluationDriver.setEntrustEvaluationTime(new java.sql.Date(new Date().getTime())); //企业评价时间
				evaluationDriver.setEnterpriseEvaluationStatus(2);//已评价
			}
			}
			//更新评价模板信息
			evaluationDriverFacade.updateEvaluationDriverScore(evaluationDriver);
			//批量新增评价模板明细信息
			if(null != evaluationDriverDetailList && evaluationDriverDetailList.size() >0){
				evaluationDriverFacade.insertEvaluationDriverDetail(evaluationDriverDetailList);
			}
			}
		return true;
	}
	
	@RequestMapping("/findEvaluateDriverByUIdAndEId")
	@ResponseBody
	public Map<String,Object> findEvaluateDriverByUIdAndEId(Integer evaluationDriverId,Integer appraiser){
		Map<String,Object> amap = new HashMap<String,Object>();
		EvaluationDriver evaluationDriver = new EvaluationDriver();
		List<EvaluationDriverDetail> aList = new ArrayList<EvaluationDriverDetail>();
		//查询评分司机明细信息
		aList =evaluationDriverFacade.findEvaluateDriverByUIdAndEId(evaluationDriverId, appraiser);
	   //查询评分司机综合得分
		evaluationDriver = evaluationDriverFacade.selectEvaluationByPrimaryKey(evaluationDriverId);
		amap.put("aList", aList);
		amap.put("evaluationDriver", evaluationDriver);
		return amap;
	}
	
	/** 
	* @方法名: insertEvaluationEnterpriceMation 
	* @作者: zhangshuai
	* @时间: 2017年11月10日 下午1:29:08
	* @返回值类型: JSONObject 
	* @throws 
	* 企业与企业之间点击评价按钮
	*/
	@RequestMapping(value="/insertEvaluationEnterpriceMation")
	@ResponseBody
	public JSONObject insertEvaluationEnterpriceMation(HttpServletRequest request,HttpServletResponse response,String arr,String arr1){
		
		List<EvaluationEnterpriceDetail> evaluationEnterpriceDetailList=new ArrayList<EvaluationEnterpriceDetail>();
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoId=userInfo.getOrgInfoId();
		
		JSONObject jo=new JSONObject();
		List<EvaluationTemplateDetail> evaluateTemplateDetailList = new ArrayList<EvaluationTemplateDetail>();
		EvaluationTemplateDetail EvaluationTemplateDrtail = new EvaluationTemplateDetail();
		evaluateTemplateDetailList = CommonUtils.jsonStringForList(arr,EvaluationTemplateDrtail);
		
		List<EvaluationEnterprice> evaluationEnterpriceList = new ArrayList<EvaluationEnterprice>();
		EvaluationEnterprice EvaluationEnterprice = new EvaluationEnterprice();
		evaluationEnterpriceList = CommonUtils.jsonStringForList(arr1,EvaluationEnterprice);
		
		//根据企业评价id查询企业评价信息
		EvaluationEnterprice evaluationEnterprice = evaluationEnterpriceFacade.findEvaluationEnterpriceById(evaluationEnterpriceList.get(0).getId());
		
		//判断我是委托方还是承运方
		//匹配到委托方
		if(evaluationEnterprice.getEntrust().equals(orgInfoId)){
			
			//插入到企业评价主表
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("id", evaluationEnterpriceList.get(0).getId());
			params.put("entrustForShipper", Float.parseFloat(evaluationEnterpriceList.get(0).getScoreSum().toString()));
			params.put("entrustForShipperComprehensiveScore", evaluationEnterpriceList.get(0).getComprehensiveScore());
			params.put("entrustEvaluationTime", Calendar.getInstance().getTime());
			params.put("entrustEvaluationStatus", 2);
			//根据id修改参数
			evaluationEnterpriceFacade.updateEvaluationEnterpriceById(params);
			
		}else 
			//匹配到承运方
			if(evaluationEnterprice.getShipper().equals(orgInfoId)){
			
				//插入到企业评价主表
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("id", evaluationEnterpriceList.get(0).getId());
				params.put("shipperForEntrust", Float.parseFloat(evaluationEnterpriceList.get(0).getScoreSum().toString()));
				params.put("shipperForEntrustComprehensiveScore", evaluationEnterpriceList.get(0).getComprehensiveScore());
				params.put("shipperEvaluationTime", Calendar.getInstance().getTime());
				params.put("shipperEvaluationStatus", 2);
				//根据id修改参数
				try {
					evaluationEnterpriceFacade.updateEvaluationEnterpriceById(params);
				} catch (Exception e) {
					log.error("修改企业评价表主信息异常!",e);
					jo.put("success", false);
					jo.put("msg", "系统异常!");
					return jo;
				}
				
		}
		
		//插入到企业评价明细表
		for (EvaluationTemplateDetail evaluationTemplateDetail : evaluateTemplateDetailList) {
			
			EvaluationEnterpriceDetail evaluationEnterpriceDetail=new EvaluationEnterpriceDetail();
			evaluationEnterpriceDetail.setEvaluationEnterpriceId(evaluationEnterpriceList.get(0).getId());//企业评价id
			evaluationEnterpriceDetail.setEvaluationTemplateDetailId(evaluationTemplateDetail.getId());//评价模板明细id
			evaluationEnterpriceDetail.setAssessmentItemsScore(evaluationTemplateDetail.getScoreNum());//考核项评分
			evaluationEnterpriceDetail.setAssessmentItems(evaluationTemplateDetail.getAssessmentItems());//考核项目
			evaluationEnterpriceDetail.setWeight(evaluationTemplateDetail.getWeight());//权重
			evaluationEnterpriceDetail.setTargetRequirement(evaluationTemplateDetail.getTargetRequirement());//目标值要求
			evaluationEnterpriceDetail.setRatingScale(evaluationTemplateDetail.getRatingScale());//评分等级
			
			//判断我是委托方还是承运方
			//匹配到委托方
			if(evaluationEnterprice.getEntrust().equals(orgInfoId)){
				
				evaluationEnterpriceDetail.setAppraiser(evaluationEnterprice.getEntrust());
				evaluationEnterpriceDetail.setPassiveAppraiser(evaluationEnterprice.getShipper());
				
			}else 
				//匹配到承运方
				if(evaluationEnterprice.getShipper().equals(orgInfoId)){
				
				evaluationEnterpriceDetail.setAppraiser(evaluationEnterprice.getShipper());
				evaluationEnterpriceDetail.setPassiveAppraiser(evaluationEnterprice.getEntrust());
					
			}
			
			evaluationEnterpriceDetailList.add(evaluationEnterpriceDetail);
			
		}
		
		//批量新增到企业评价明细表
		try {
			evaluationEnterpriceFacade.addEvaluationEnterpriceMation(evaluationEnterpriceDetailList);
			jo.put("success", true);
			jo.put("msg", "操作成功!");
		} catch (Exception e) {
			log.error("批量新增到企业评价明细表异常!",e);
			jo.put("success", false);
			jo.put("msg", "系统异常!");
			return jo;
		}
		
		return jo;
		
	}
}
