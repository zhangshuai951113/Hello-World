package com.xz.logistics.controller;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

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
import com.xz.common.constances.SysFinal;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.PartnerInfoFacade;
import com.xz.facade.api.PartnerInfoTempFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.PartnerInfoPo;
import com.xz.model.po.PartnerInfoTempPo;
import com.xz.model.po.PartnerOperateLogPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.PartnerApplyModel;

/**
 * 合作伙伴(企业货主、物流公司、个人司机、个体货主均有该菜单)
 * @author chengzhihuan 2017年5月31日
 *
 */
@Controller
@RequestMapping("/partner")
public class PartnerController extends BaseController {

	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private PartnerInfoTempFacade partnerInfoTempFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private PartnerInfoFacade partnerInfoFacade;
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;
	
	/**
	 * 合作伙伴申请查询初始页
	 * 
	 * @author chengzhihuan 2017年5月31日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showApplyPartnerInfoPage")
	public String showApplyPartnerInfoPage(HttpServletRequest request, Model model) {
		return "template/partner/show_apply_partner_info_page";
	}
	
	/**
	 * 合作伙伴申请查询
	 * @author chengzhihuan 2017年5月31日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/listApplyPartnerInfo")
	public String listApplyPartnerInfo(HttpServletRequest request, Model model) {
		DataPager<PartnerInfoTempPo> partnerInfoTempPager = new DataPager<PartnerInfoTempPo>();

		// 从session中取出当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 数据归属编码
		Integer teamCode = null;
		if(userInfo.getUserRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
			//企业货主与物流公司
			teamCode = userInfo.getOrgRootId();
		}else if(userInfo.getUserRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_DRIVER){
			//个体货主与司机
			teamCode = userInfo.getId();
		}

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		partnerInfoTempPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		partnerInfoTempPager.setSize(rows);
		
		//合作伙伴申请数据类型 1:发起 2:受理，默认为2
		Integer operateType = null;
		if(params.get("operateType")!=null){
			operateType = Integer.valueOf(params.get("operateType").toString());
		}
		
		model.addAttribute("teamCode", teamCode);

		//伙伴状态
		Integer relationStatus = null;
		if(params.get("relationStatus")!=null){
			relationStatus = Integer.valueOf(params.get("relationStatus").toString());
		}
		
		//确认开始时间
		Date confirmTimeStart = null;
		//确认结束时间
		Date confirmTimeEnd = null;
		//确认开始时间与结束时间只能同时存在
		if(params.get("confirmTimeStartStr")!=null && params.get("confirmTimeEndStr")!=null){
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			try {
				confirmTimeStart = sdf.parse(params.get("confirmTimeStartStr").toString());
				//确认时间+1天
				Date dateTime = sdf.parse(params.get("confirmTimeEndStr").toString());
				Calendar calendar = Calendar.getInstance();
				calendar.setTime(dateTime);
				calendar.add(Calendar.DAY_OF_YEAR, 1);
				confirmTimeEnd = calendar.getTime();
			} catch (ParseException e) {
				log.error("解析时间异常",e);
				//解析时间异常时同时置空
				confirmTimeStart = null;
				confirmTimeEnd = null;
			}
		}
		String partnerRole=request.getParameter("partnerRole");
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
//		if(operateType==2){
			//受理方
			queryMap.put("teamCode", teamCode);
			queryMap.put("operateType", operateType);
			queryMap.put("partnerRole", partnerRole);
//		}else{
//			//发起方
//			queryMap.put("originTeamCode", teamCode);
//		}
		queryMap.put("relationStatus", relationStatus);
		queryMap.put("confirmTimeStart", confirmTimeStart);
		queryMap.put("confirmTimeEnd", confirmTimeEnd);
		
		//3、查询伙伴信息
		Integer totalNum = 0;
		List<PartnerInfoTempPo> applyPartnerInfoList = new ArrayList<PartnerInfoTempPo>();
//		if(operateType==2){
			//查询数据受理方伙伴申请总数
			totalNum = partnerInfoTempFacade.countApplyPartnerInfoForPagePartner(queryMap);
			//查询数据受理方伙伴申请信息
			applyPartnerInfoList = partnerInfoTempFacade.findApplyPartnerInfoForPagePartner(queryMap);
//		}else{
//			//查询数据发起方伙伴申请总数
//			totalNum = partnerInfoTempFacade.countApplyPartnerInfoForPageOrigin(queryMap);
//			//查询数据发起方伙伴申请信息
//			applyPartnerInfoList = partnerInfoTempFacade.findApplyPartnerInfoForPageOrigin(queryMap);
//		}
		
		//4、封装发起人、受理人信息
		if(CollectionUtils.isNotEmpty(applyPartnerInfoList)){
			this.packageApplyPartnerInfo(applyPartnerInfoList);
		}
		
		// 5、总数、分页信息封装
		partnerInfoTempPager.setTotal(totalNum);
		partnerInfoTempPager.setRows(applyPartnerInfoList);
		model.addAttribute("partnerInfoTempPager", partnerInfoTempPager);
		
		return "template/partner/apply_partner_info_data";
	}
	
	/**
	 * 封装合作伙伴申请信息
	 * @author chengzhihuan 2017年6月1日
	 * @param applyPartnerInfoList
	 */
	private void packageApplyPartnerInfo(List<PartnerInfoTempPo> applyPartnerInfoList){
		//机构ID
		List<Integer> orgInfoIds = new ArrayList<Integer>();
		//个体货主用户ID
		List<Integer> individualOwnersUserInfoIds = new ArrayList<Integer>();
		//司机用户ID
		List<Integer> driverUserInfoIds = new ArrayList<Integer>();
		
		for(PartnerInfoTempPo ptInfo : applyPartnerInfoList){
			if(ptInfo.getOriginRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || ptInfo.getOriginRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
				//发起方机构编码
				if(!orgInfoIds.contains(ptInfo.getOriginCode())){
					orgInfoIds.add(ptInfo.getOriginCode());
				}
			}else if(ptInfo.getOriginRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS){
				//发起方个体货主编码
				if(!individualOwnersUserInfoIds.contains(ptInfo.getOriginCode())){
					individualOwnersUserInfoIds.add(ptInfo.getOriginCode());
				}
			}else if(ptInfo.getOriginRole()==SysFinal.USER_ROLE_DRIVER){
				//发起方司机编码
				if(!driverUserInfoIds.contains(ptInfo.getOriginCode())){
					driverUserInfoIds.add(ptInfo.getOriginCode());
				}
			}
			
			if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || ptInfo.getPartnerRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
				//受理方机构编码
				if(!orgInfoIds.contains(ptInfo.getPartnerCode())){
					orgInfoIds.add(ptInfo.getPartnerCode());
				}
			}else if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS){
				//受理方个体货主编码
				if(!individualOwnersUserInfoIds.contains(ptInfo.getPartnerCode())){
					individualOwnersUserInfoIds.add(ptInfo.getPartnerCode());
				}
			}else if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_DRIVER){
				//受理方司机编码
				if(!driverUserInfoIds.contains(ptInfo.getPartnerCode())){
					driverUserInfoIds.add(ptInfo.getPartnerCode());
				}
			}
		}
		
		// key:组织ID value:组织名称
		Map<Integer, String> orgInfoMap = null;
		if(CollectionUtils.isNotEmpty(orgInfoIds)){
			//组织信息
			List<OrgInfoPo> orgInfos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			if (CollectionUtils.isNotEmpty(orgInfos)) {
				orgInfoMap = CommonUtils.listforMap(orgInfos, "id", "orgName");
			}
		}
		
		// key:用户ID value:司机名称
		Map<Integer, String> driverMap = null;
		if(CollectionUtils.isNotEmpty(driverUserInfoIds)){
			//司机信息
			List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(driverUserInfoIds);
			if (CollectionUtils.isNotEmpty(driverInfos)) {
				driverMap = CommonUtils.listforMap(driverInfos, "userInfoId", "driverName");
			}
		}
		
		// key:用户ID value:个体货主名称
		Map<Integer, String> individualOwnersMap = null;
		if(CollectionUtils.isNotEmpty(individualOwnersUserInfoIds)){
			//个体货主信息
			List<IndividualOwnerPo> individualOwnerList = individualOwnerFacade.findIndividualOwnerByUserInfoIds(individualOwnersUserInfoIds);
			if (CollectionUtils.isNotEmpty(individualOwnerList)) {
				individualOwnersMap = CommonUtils.listforMap(individualOwnerList, "userInfoId", "realName");
			}
		}
		
		//封装组织与用户信息
		for(PartnerInfoTempPo ptInfo : applyPartnerInfoList){
			if(ptInfo.getOriginRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || ptInfo.getOriginRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
				//发起方机构编码
				if(MapUtils.isNotEmpty(orgInfoMap) && orgInfoMap.get(ptInfo.getOriginCode())!=null){
					ptInfo.setOriginName(orgInfoMap.get(ptInfo.getOriginCode()));
				}
			}else if(ptInfo.getOriginRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS){
				//发起方用户编码
				if(MapUtils.isNotEmpty(individualOwnersMap) && individualOwnersMap.get(ptInfo.getOriginCode())!=null){
					ptInfo.setOriginName(individualOwnersMap.get(ptInfo.getOriginCode()));
				}
			}else if(ptInfo.getOriginRole()==SysFinal.USER_ROLE_DRIVER){
				if(MapUtils.isNotEmpty(driverMap) && driverMap.get(ptInfo.getOriginCode())!=null){
					ptInfo.setOriginName(driverMap.get(ptInfo.getOriginCode()));
				}
			}
			
			if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || ptInfo.getPartnerRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
				//受理方机构编码
				if(MapUtils.isNotEmpty(orgInfoMap) && orgInfoMap.get(ptInfo.getPartnerCode())!=null){
					ptInfo.setPartnerName(orgInfoMap.get(ptInfo.getPartnerCode()));
				}
			}else if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS){
				//受理方用户编码
				if(MapUtils.isNotEmpty(individualOwnersMap) && individualOwnersMap.get(ptInfo.getPartnerCode())!=null){
					ptInfo.setPartnerName(individualOwnersMap.get(ptInfo.getPartnerCode()));
				}
			}else if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_DRIVER){
				if(MapUtils.isNotEmpty(driverMap) && driverMap.get(ptInfo.getPartnerCode())!=null){
					ptInfo.setPartnerName(driverMap.get(ptInfo.getPartnerCode()));
				}
			}
		}
	}
	
	
	/**
	 * 合作伙伴申请发起初始页
	 * @author chengzhihuan 2017年6月1日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/addApplyPartnerInfoInitPage")
	public String addApplyPartnerInfoInitPage(HttpServletRequest request, Model model) {
		// 从session中取出当前用户信息
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		Integer isCompany = null;
		if(userInfo.getUserRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
			isCompany = 1;
			
			//企业货主与物流公司
			Map<String,Object> queryMap = new HashMap<String,Object>();
			queryMap.put("parentOrgInfoId", userInfo.getOrgRootId());
			queryMap.put("orgType", 1);
			List<OrgInfoPo> orgInfoList = orgInfoFacade.findRootAndSubOrgInfo(queryMap);
			
			model.addAttribute("orgInfoList", orgInfoList);
		}else if(userInfo.getUserRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_DRIVER){
			isCompany = 0;
			
			//个体货主与司机
			model.addAttribute("currentOriginCode", userInfo.getId());
		}
		
		//是否为企业
		model.addAttribute("isCompany", isCompany);	
		
		return "template/partner/add_apply_partner_info_init_page";
	}
	
	
	/**
	 * 合作伙伴申请发起
	 * 
	 * @author chengzhihuan 2017年5月31日
	 * @param request
	 * @param partnerApplyModel
	 * @return
	 */
	@RequestMapping(value = "/addApplyPartnerInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addApplyPartnerInfo(HttpServletRequest request, PartnerApplyModel partnerApplyModel) {
		// 1、从session中取出当前用户的用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		
		// 数据归属编码
		Integer teamCode = null;
		if(userInfo.getUserRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
			//企业货主与物流公司
			teamCode = userInfo.getOrgRootId();
		}else if(userInfo.getUserRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_DRIVER){
			//个体货主与司机
			teamCode = userInfo.getId();
		}
		
		//发起方角色
		Integer originRole = userInfo.getUserRole();
		
		JSONObject jo = null;

		try {
			//2、申请合作伙伴
			jo = partnerInfoTempFacade.addApplyPartnerInfo(partnerApplyModel, teamCode, originRole, userInfoId);
		} catch (Exception e) {
			log.error("合作伙伴申请异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "合作伙伴申请服务繁忙，请稍后重试");
		}
		
		
		
		return jo;
	}
	
	/**
	 * 搜索合作伙伴
	 * 
	 * @author chengzhihuan 2017年6月1日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/searchPartnerInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject searchPartnerInfo(HttpServletRequest request) {
		
		// 从session中取出当前用户的用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
				
		JSONObject jo = new JSONObject();
		
		//合作伙伴角色
		Integer partnerRole = null;
		if(request.getParameter("partnerRole")!=null){
			partnerRole = Integer.valueOf(request.getParameter("partnerRole"));
		}
		
		//合作伙伴名称
		String partnerName = request.getParameter("partnerName");
		
		//1、校验参数
		if(partnerRole==null){
			jo.put("success", false);
			jo.put("msg", "合作伙伴角色不能为空");
			return jo;
		}
		
		if(StringUtils.isBlank(partnerName)){
			jo.put("success", false);
			jo.put("msg", "合作伙伴名称不能为空");
			return jo;
		}
		
		partnerName = partnerName.trim();
		
		//最多查询10个
		Map<String,Object> queryMap = new HashMap<String,Object>();
		queryMap.put("start", 0);
		queryMap.put("rows", 10);
		
		List<PartnerInfoTempPo> partnerInfoTempList = new ArrayList<PartnerInfoTempPo>();
		
		//2、分角色查询伙伴信息
		if(partnerRole==SysFinal.USER_ROLE_BUSINESS_OWNERS){
			//企业货主
			queryMap.put("orgName", partnerName);
			queryMap.put("userRole", 1);
			if(userInfo.getUserRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS){
				queryMap.put("rootOrgInfoId", userInfo.getOrgRootId());
			}
			List<OrgInfoPo> orgInfoList = orgInfoFacade.findRootAndSubOrgInfoByOrgName(queryMap);
			
			//循环遍历封装数据
			if(CollectionUtils.isNotEmpty(orgInfoList)){
				for(OrgInfoPo org : orgInfoList){
					PartnerInfoTempPo partnerTemp = new PartnerInfoTempPo();
					partnerTemp.setPartnerCode(org.getId());
					partnerTemp.setPartnerName(org.getOrgName());
					partnerInfoTempList.add(partnerTemp);
				}
			}
		}else if(partnerRole==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
			//物流公司
			queryMap.put("orgName", partnerName);
			queryMap.put("userRole", 2);
			if(userInfo.getUserRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
				queryMap.put("rootOrgInfoId", userInfo.getOrgRootId());
			}
			List<OrgInfoPo> orgInfoList = orgInfoFacade.findRootAndSubOrgInfoByOrgName(queryMap);
			
			//循环遍历封装数据
			if(CollectionUtils.isNotEmpty(orgInfoList)){
				for(OrgInfoPo org : orgInfoList){
					PartnerInfoTempPo partnerTemp = new PartnerInfoTempPo();
					partnerTemp.setPartnerCode(org.getId());
					partnerTemp.setPartnerName(org.getOrgName());
					partnerInfoTempList.add(partnerTemp);
				}
			}
		}else if(partnerRole==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS){
			//个体货主
			queryMap.put("realName", partnerName);
			if(userInfo.getUserRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS){
				queryMap.put("userInfoId", userInfo.getId());
			}
			List<IndividualOwnerPo> ownerList = individualOwnerFacade.findIndividualOwnerByName(queryMap);
			
			//循环遍历封装数据
			if(CollectionUtils.isNotEmpty(ownerList)){
				for(IndividualOwnerPo owner : ownerList){
					PartnerInfoTempPo partnerTemp = new PartnerInfoTempPo();
					partnerTemp.setPartnerCode(owner.getUserInfoId());
					partnerTemp.setPartnerName(owner.getRealName());
					partnerInfoTempList.add(partnerTemp);
				}
			}
		}else if(partnerRole==SysFinal.USER_ROLE_DRIVER){
			//司机
			queryMap.put("driverName", partnerName);
			if(userInfo.getUserRole()==SysFinal.USER_ROLE_DRIVER){
				queryMap.put("userInfoId", userInfo.getId());
			}
			List<DriverInfo> dirverInfoList = driverInfoFacade.findDriverByName(queryMap);
			
			//循环遍历封装数据
			if(CollectionUtils.isNotEmpty(dirverInfoList)){
				for(DriverInfo driver : dirverInfoList){
					PartnerInfoTempPo partnerTemp = new PartnerInfoTempPo();
					partnerTemp.setPartnerCode(driver.getUserInfoId());
					partnerTemp.setPartnerName(driver.getDriverName());
					partnerInfoTempList.add(partnerTemp);
				}
			}
		}
		
		jo.put("success", true);
		jo.put("partnerList", partnerInfoTempList);
		return jo;
	}
	
	/**
	 * 再次申请/拒绝/同意合作伙伴申请
	 * 
	 * @author chengzhihuan 2017年5月31日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/confirmApplyPartnerInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject confirmApplyPartnerInfo(HttpServletRequest request){
		// 1、从session中取出当前用户的用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		
		// 数据归属编码
		Integer teamCode = null;
		if(userInfo.getUserRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
			//企业货主与物流公司
			teamCode = userInfo.getOrgRootId();
		}else if(userInfo.getUserRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_DRIVER){
			//个体货主与司机
			teamCode = userInfo.getId();
		}
		
		//合作伙伴申请主键ID集合
		List<Integer> partnerInfoTempIds = new ArrayList<Integer>();
		if(request.getParameter("partnerInfoTempIds")!=null){
			String[] partnerInfoTempIdArray = request.getParameter("partnerInfoTempIds").trim().split(",");
			if(partnerInfoTempIdArray.length>0){
				for(String partnerInfoTempIdStr : partnerInfoTempIdArray){
					if(StringUtils.isNotBlank(partnerInfoTempIdStr)){
						partnerInfoTempIds.add(Integer.valueOf(partnerInfoTempIdStr.trim()));
					}
				}
			}
		}
		
		//操作类型 1:再次申请 2:已拒绝 3:已确认
		Integer relationStatus = null;
		if(request.getParameter("relationStatus")!=null){
			relationStatus = Integer.valueOf(request.getParameter("relationStatus"));
		}
		
		JSONObject jo = null;

		try {
			//2、操作合作伙伴申请
			jo = partnerInfoTempFacade.confirmApplyPartnerInfo(partnerInfoTempIds, relationStatus, teamCode, userInfoId);
		} catch (Exception e) {
			log.error("合作伙伴申请操作异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "合作伙伴申请操作服务繁忙，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * 合作伙伴查询初始页
	 * 
	 * @author chengzhihuan 2017年5月31日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showPartnerInfoPage")
	public String showPartnerInfoPage(HttpServletRequest request, Model model) {
		return "template/partner/show_partner_info_page";
	}
	
	/**
	 * 合作伙伴查询
	 * @author chengzhihuan 2017年5月31日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/listPartnerInfo")
	public String listPartnerInfo(HttpServletRequest request, Model model) {
		DataPager<PartnerInfoPo> partnerInfoPager = new DataPager<PartnerInfoPo>();

		// 从session中取出当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 数据归属编码
		Integer teamCode = null;
		if(userInfo.getUserRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
			//企业货主与物流公司
			teamCode = userInfo.getOrgRootId();
		}else if(userInfo.getUserRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_DRIVER){
			//个体货主与司机
			teamCode = userInfo.getId();
		}

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		partnerInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		partnerInfoPager.setSize(rows);
		
		//是否启用
		Integer isAvailable = null;
		if(params.get("isAvailable")!=null){
			isAvailable = Integer.valueOf(params.get("isAvailable").toString());
		}
		
		//确认开始时间
		Date confirmTimeStart = null;
		//确认结束时间
		Date confirmTimeEnd = null;
		//确认开始时间与结束时间只能同时存在
		if(params.get("confirmTimeStartStr")!=null && params.get("confirmTimeEndStr")!=null){
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			try {
				confirmTimeStart = sdf.parse(params.get("confirmTimeStartStr").toString());
				//确认时间+1天
				Date dateTime = sdf.parse(params.get("confirmTimeEndStr").toString());
				Calendar calendar = Calendar.getInstance();
				calendar.setTime(dateTime);
				calendar.add(Calendar.DAY_OF_YEAR, 1);
				confirmTimeEnd = calendar.getTime();
			} catch (ParseException e) {
				log.error("解析时间异常",e);
				//解析时间异常时同时置空
				confirmTimeStart = null;
				confirmTimeEnd = null;
			}
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		//发起方
		queryMap.put("originTeamCode", teamCode);
		queryMap.put("isAvailable", isAvailable);
		queryMap.put("confirmTimeStart", confirmTimeStart);
		queryMap.put("confirmTimeEnd", confirmTimeEnd);
		
		//3、查询伙伴信息
		Integer totalNum = partnerInfoFacade.countPartnerInfoForPage(queryMap);
		List<PartnerInfoPo> partnerInfoList = partnerInfoFacade.findPartnerInfoForPage(queryMap);
		
		//4、封装受理人信息
		if(CollectionUtils.isNotEmpty(partnerInfoList)){
			this.packagePartnerInfo(partnerInfoList);
		}
		
		// 5、总数、分页信息封装
		partnerInfoPager.setTotal(totalNum);
		partnerInfoPager.setRows(partnerInfoList);
		model.addAttribute("partnerInfoPager", partnerInfoPager);
		
		return "template/partner/partner_info_data";
	}
	
	/**
	 * 封装合作伙伴信息
	 * @author chengzhihuan 2017年6月1日
	 * @param partnerInfoList
	 */
	private void packagePartnerInfo(List<PartnerInfoPo> partnerInfoList){
		//机构ID
		List<Integer> orgInfoIds = new ArrayList<Integer>();
		//个体货主用户ID
		List<Integer> individualOwnersUserInfoIds = new ArrayList<Integer>();
		//司机用户ID
		List<Integer> driverUserInfoIds = new ArrayList<Integer>();
		
		for(PartnerInfoPo ptInfo : partnerInfoList){
			if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || ptInfo.getPartnerRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
				//受理方机构编码
				if(!orgInfoIds.contains(ptInfo.getPartnerCode())){
					orgInfoIds.add(ptInfo.getPartnerCode());
				}
			}else if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS){
				//受理方个体货主编码
				if(!individualOwnersUserInfoIds.contains(ptInfo.getPartnerCode())){
					individualOwnersUserInfoIds.add(ptInfo.getPartnerCode());
				}
			}else if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_DRIVER){
				//受理方司机编码
				if(!driverUserInfoIds.contains(ptInfo.getPartnerCode())){
					driverUserInfoIds.add(ptInfo.getPartnerCode());
				}
			}
		}
		
		// key:组织ID value:组织名称
		Map<Integer, String> orgInfoMap = null;
		if(CollectionUtils.isNotEmpty(orgInfoIds)){
			//组织信息
			List<OrgInfoPo> orgInfos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			if (CollectionUtils.isNotEmpty(orgInfos)) {
				orgInfoMap = CommonUtils.listforMap(orgInfos, "id", "orgName");
			}
		}
		
		// key:用户ID value:司机名称
		Map<Integer, String> driverMap = null;
		if(CollectionUtils.isNotEmpty(driverUserInfoIds)){
			//司机信息
			List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(driverUserInfoIds);
			if (CollectionUtils.isNotEmpty(driverInfos)) {
				driverMap = CommonUtils.listforMap(driverInfos, "userInfoId", "driverName");
			}
		}
		
		// key:用户ID value:个体货主名称
		Map<Integer, String> individualOwnersMap = null;
		if(CollectionUtils.isNotEmpty(individualOwnersUserInfoIds)){
			//个体货主信息
			List<IndividualOwnerPo> individualOwnerList = individualOwnerFacade.findIndividualOwnerByUserInfoIds(individualOwnersUserInfoIds);
			if (CollectionUtils.isNotEmpty(individualOwnerList)) {
				individualOwnersMap = CommonUtils.listforMap(individualOwnerList, "userInfoId", "realName");
			}
		}
		
		//封装合作伙伴名称
		for(PartnerInfoPo ptInfo : partnerInfoList){
			if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || ptInfo.getPartnerRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
				//受理方机构编码
				if(MapUtils.isNotEmpty(orgInfoMap) && orgInfoMap.get(ptInfo.getPartnerCode())!=null){
					ptInfo.setPartnerName(orgInfoMap.get(ptInfo.getPartnerCode()));
				}
			}else if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS){
				//受理方用户编码
				if(MapUtils.isNotEmpty(individualOwnersMap) && individualOwnersMap.get(ptInfo.getPartnerCode())!=null){
					ptInfo.setPartnerName(individualOwnersMap.get(ptInfo.getPartnerCode()));
				}
			}else if(ptInfo.getPartnerRole()==SysFinal.USER_ROLE_DRIVER){
				if(MapUtils.isNotEmpty(driverMap) && driverMap.get(ptInfo.getPartnerCode())!=null){
					ptInfo.setPartnerName(driverMap.get(ptInfo.getPartnerCode()));
				}
			}
		}
		
	
	}
	
	/**
	 * 合作伙伴启用/停用
	 * 
	 * @author chengzhihuan 2017年5月31日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/modifyPartnerInfoAvailable", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject modifyPartnerInfoAvailable(HttpServletRequest request){
		// 1、从session中取出当前用户的用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		
		// 数据归属编码
		Integer teamCode = null;
		if(userInfo.getUserRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
			//企业货主与物流公司
			teamCode = userInfo.getOrgRootId();
		}else if(userInfo.getUserRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_DRIVER){
			//个体货主与司机
			teamCode = userInfo.getId();
		}
		
		//合作伙伴主键ID集合
		List<Integer> partnerInfoIds = new ArrayList<Integer>();
		if(request.getParameter("partnerInfoIds")!=null){
			String[] partnerInfoIdArray = request.getParameter("partnerInfoIds").trim().split(",");
			if(partnerInfoIdArray.length>0){
				for(String partnerInfoIdStr : partnerInfoIdArray){
					if(StringUtils.isNotBlank(partnerInfoIdStr)){
						partnerInfoIds.add(Integer.valueOf(partnerInfoIdStr.trim()));
					}
				}
			}
		}
		
		//操作类型 1:启用 0:停用
		Integer isAvailable = null;
		if(request.getParameter("isAvailable")!=null){
			isAvailable = Integer.valueOf(request.getParameter("isAvailable"));
		}
		
		//备注信息
		String remarks = request.getParameter("remarks");
		
		JSONObject jo = null;

		try {
			PartnerOperateLogPo pLog = new PartnerOperateLogPo();
			pLog.setUserInfoId(userInfoId);
			pLog.setRemarks(remarks);
			//2、启用/停用合作伙伴
			jo = partnerInfoFacade.modifyPartnerInfoAvailable(partnerInfoIds , pLog, isAvailable, teamCode);
		} catch (Exception e) {
			log.error("合作伙伴启用/停用异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "合作伙伴启用/停用服务繁忙，请稍后重试");
		}
		
		return jo;
	}
}
