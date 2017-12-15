package com.xz.logistics.controller;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.EnterpriseUserInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.PasswordHelperFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.enums.EducationEnum;
import com.xz.model.enums.NationalityEnum;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.EnterpriseUserInfo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillInfoPo;
import com.xz.model.vo.EnumsModel;
import com.xz.model.vo.UserModel;

/**
 * 用户管理controller
 *
 */
@Controller
@RequestMapping("/user")
public class UserInfoController extends BaseController{

	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private EnterpriseUserInfoFacade enterpriseUserInfoFacade;
	@Resource
	private PasswordHelperFacade passwordHelperFacade;
	
	/**
	 * 跳转注册页面
	 * @return
	 */
	@RequestMapping("/register")
	public String register(){
		return "register";
	}
	/**
	 * 注册用户
	 * @param request
	 * @param response
	 * @return 
	 */
	@RequestMapping(value="/addUserInfo",produces = "application/json; charset=utf-8",method=RequestMethod.POST)
	@ResponseBody
	public JSONObject addUser(HttpServletRequest request,HttpServletResponse response){
		
    	JSONObject jo=new JSONObject();
		boolean success = false;
		String msg = "";
		
    	String userName=request.getParameter("userName");
		String password=request.getParameter("password");
		String confirmPassword=request.getParameter("confirmPassword");
		String mobilePhone=request.getParameter("mobilePhone");
		String userRole1=request.getParameter("userRole");
		String code=request.getParameter("code");
		
		if(userRole1==null){
	    	  jo.put("success", false);
			  jo.put("msg", "用户类型不能为空!");
			  return jo;
	    }
		
		Integer userRole=Integer.parseInt(userRole1);
		 //验证密码是否为空
	       if(password==null || StringUtils.isBlank(password)){
	    	   jo.put("success", false);
				jo.put("msg", "密码不能为空!");
				return jo;
	       } 
	       
		 //验证密码合法性
	    Pattern p1=Pattern.compile("^[0-9A-Za-z]{6,10}$");
	    Matcher matcher1=p1.matcher(password);
	    if(!matcher1.matches()){
	    	jo.put("success", false);
			jo.put("msg", "密码只能由数字和字母组成,并且长度在6~10位之间!");
			return jo;
	    }
	    
		//校验两次密码输入是否一致
	    if(!confirmPassword.equals(password)){
	    	jo.put("success", false);
	    	jo.put("msg", "两次密码输入不一致,请确认后在重新输入!");
	    	return jo;
		}
	    
	    // 手机验证码
	    if(code==null || StringUtils.isBlank(code)){
        	jo.put("success", false);
        	jo.put("msg", "验证码不能为空!");
        	return jo;
        }
	    String realCode = userInfoFacade.findCodeByPhone(mobilePhone);
	    if(!realCode.equals(code)){
	    	jo.put("success", false);
        	jo.put("msg", "验证码错误!");
        	return jo;
	    }
	    
		//验证成功，正常注册
		try {
			
			UserInfo userInfo=new UserInfo(); 
			userInfo.setUserName(userName);
			userInfo.setPassword(password);
			userInfo.setMobilePhone(mobilePhone);
			userInfo.setUserRole(userRole);
			UserInfo u = passwordHelperFacade.encryptPassword(userInfo);
			userInfo.setSalt(u.getSalt());
			userInfo.setPassword(u.getPassword());
			if(userRole==1 || userRole==2){
				userInfo.setCooperateState(1);
				
			}else{
				userInfo.setCooperateState(2);
				
			}
			
			userInfo.setIsSuper(0);
			userInfo.setUserState(0);
			userInfo.setIsAvailable(1);
			
			jo=userInfoFacade.addUserRole(userInfo);
			
			return jo;
		} catch (Exception e) {
			log.error("注册用户异常",e);
			
			jo.put("success", false);
			jo.put("msg", "注册用户信息异常，请稍后再试！");
			
		}
		
		jo.put("success", success);
		jo.put("msg", msg);
		return jo;
		
	}
	
	/**
	 * 企业用户(企业普通用户+企业司机)查询初始页
	 * 
	 * @author chengzhihuan 2017年5月24日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequiresPermissions("basicInfo:user:view")
	@RequestMapping("/showUserInfoListPage")
	public String showOrgInfoListPage(HttpServletRequest request, Model model) {
		return "template/user/show_user_info_list_page";
	} 
	
	/**
	 * 企业用户(企业普通用户+企业司机)查询
	 * 
	 * @author chengzhihuan 2017年5月24日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/userInfoList")
	public String userInfoList(HttpServletRequest request, Model model) {
		DataPager<UserInfo> userInfoPager = new DataPager<UserInfo>();
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId  = userInfo.getOrgRootId();
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		userInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		
		// 启用状态 (0:停用 1:启用)
		Integer isAvailable = null;
		if (params.get("isAvailable") != null) {
			isAvailable = Integer.valueOf(params.get("isAvailable").toString());
		}
		
		//注销状态 (0：未注销 1：已注销)
		Integer userState = null;
		if (params.get("userState") != null) {
			userState = Integer.valueOf(params.get("userState").toString());
		}
		
		//用户名
		String userName = null;
		if (params.get("userName") != null) {
			userName = params.get("userName").toString();
		}
		
		//手机号
		String mobilePhone = null;
		if (params.get("mobilePhone") != null) {
			mobilePhone = params.get("mobilePhone").toString();
		}
		
		//企业用户类型 (2：企业司机 3：企业普通用户)
		Integer enterpriseUserType = null;
		if (params.get("enterpriseUserType") != null) {
			enterpriseUserType = Integer.valueOf(params.get("enterpriseUserType").toString());
		}
		
		//真实姓名
		String realName = null;
		if (params.get("realName") != null) {
			realName = params.get("realName").toString();
		}
		
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("isAvailable", isAvailable);
		queryMap.put("userState", userState);
		queryMap.put("userName", userName);
		queryMap.put("mobilePhone", mobilePhone);
		queryMap.put("enterpriseUserType", enterpriseUserType);
		queryMap.put("realName", realName); //真实姓名
		
		// 3、分页查询企业用户(企业普通用户+企业司机)信息
		List<UserInfo> userInfoList = userInfoFacade.findUserInfoForPage(queryMap);
		
		if(CollectionUtils.isNotEmpty(userInfoList)){
			// 4、封装所属组织
			List<Integer> orgInfoIds = CommonUtils.getValueList(userInfoList, "orgInfoId");
			List<OrgInfoPo> orgInfos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			// key:组织ID value:组织名称
			Map<Integer, String> orgInfoMap = null;
			if (CollectionUtils.isNotEmpty(orgInfos)) {
				orgInfoMap = CommonUtils.listforMap(orgInfos, "id", "orgName");
			}
			
			// 4、封装上级组织
			List<Integer> parentOrgInfoIds = CommonUtils.getValueList(userInfoList, "parentOrgInfoId");
			List<OrgInfoPo> parentOrgInfos = new ArrayList<OrgInfoPo>();
			if(CollectionUtils.isNotEmpty(parentOrgInfoIds)){
				parentOrgInfos = orgInfoFacade.findOrgNameByIds(parentOrgInfoIds);
			}
			// key:上级组织ID value:上级组织名称
			Map<Integer, String> parentOrgInfoMap = null;
			if (CollectionUtils.isNotEmpty(parentOrgInfos)) {
				parentOrgInfoMap = CommonUtils.listforMap(parentOrgInfos, "id", "orgName");
			}
			
			// 5、封装用户真实姓名
			List<EnterpriseUserInfo> enterpriseUserInfos = new ArrayList<EnterpriseUserInfo>();
			List<Integer> userInfoIds = CommonUtils.getValueList(userInfoList, "id");
			if(CollectionUtils.isNotEmpty(userInfoIds)){
				enterpriseUserInfos = enterpriseUserInfoFacade.getEnterpriseUserInfoByUserInfoIds(userInfoIds);
			}
			// key:用户ID value:用户真实姓名
			Map<Integer, String> enterpriseUserInfoMap = null;
			if (CollectionUtils.isNotEmpty(enterpriseUserInfos)) {
				enterpriseUserInfoMap = CommonUtils.listforMap(enterpriseUserInfos, "userInfoId", "realName");
			}
			for(UserInfo ui : userInfoList){
				if(MapUtils.isNotEmpty(orgInfoMap)){
					if(orgInfoMap.get(ui.getOrgInfoId())!=null){
						ui.setOrgName(orgInfoMap.get(ui.getOrgInfoId()));
					}
				}
				
				if(MapUtils.isNotEmpty(parentOrgInfoMap)){
					if(parentOrgInfoMap.get(ui.getParentOrgInfoId())!=null){
						ui.setParentOrgName(parentOrgInfoMap.get(ui.getParentOrgInfoId()));
					}
				}
				
				if(MapUtils.isNotEmpty(enterpriseUserInfoMap)){
					if(enterpriseUserInfoMap.get(ui.getId())!=null){
						ui.setRealName(enterpriseUserInfoMap.get(ui.getId()));
					}
				}
			}
		}
		
		userInfoPager.setRows(userInfoList);
		model.addAttribute("userInfoPager", userInfoPager);
		
		return "template/user/user_info_data";
	}
	
	/**
	 * 查询企业用户条目数
	 * @author qiutianhui 2017年8月4日
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/countUserInfoForPage",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer countUserInfoForPage(HttpServletRequest request){
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId  = userInfo.getOrgRootId();
		//接收页面参数
		String userName=request.getParameter("userName");
		String mobilePhone=request.getParameter("mobilePhone");
		String isAvailable=request.getParameter("isAvailable");
		String userState=request.getParameter("userState");
		String enterpriseUserType=request.getParameter("enterpriseUserType");
    	//封装参数
  		Map<String, Object> params=new HashMap<String,Object>();
  		params.put("userName", userName);
  		params.put("mobilePhone", mobilePhone);
  		params.put("isAvailable", isAvailable);
  	    params.put("userState", userState);
  	    params.put("enterpriseUserType", enterpriseUserType);
  	    params.put("orgRootId", orgRootId);
  	    Integer count=userInfoFacade.countUserInfoForPage(params);
  		return count;
	}
	
	/**
	 * 是否为企业司机用户
	 * 
	 * @author chengzhihuan 2017年5月26日
	 * @param request
	 * @param userModel
	 * @return
	 */
	@RequestMapping(value = "/isDriverUser", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject isDriverUser(HttpServletRequest request, UserModel userModel){
		JSONObject jo = new JSONObject();
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();

		// 用户ID
		Integer userInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("userInfoId"))) {
			userInfoId = Integer.valueOf(request.getParameter("userInfoId"));
		}

		// 校验参数是否为空
		if (userInfoId == null) {
			jo.put("success", false);
			jo.put("msg", "用户ID不能为空");
			return jo;
		}
		
		//根据用户ID、主机构ID查询用户信息
		Map<String,Object> queryMap = new HashMap<String,Object>();
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("userInfoId", userInfoId);
		UserInfo userDriver = userInfoFacade.getUserInfoByIdAndRootId(queryMap);
		
		if(userDriver==null){
			jo.put("success", false);
			jo.put("msg", "用户不存在");
			return jo;
		}
		
		if(userDriver.getEnterpriseUserType()==1){
			jo.put("success", false);
			jo.put("msg", "非法操作");
			return jo;
		}else if(userDriver.getEnterpriseUserType()==2){
			jo.put("isDriverUser", true);
		}
		
		jo.put("success", true);
		return jo;
	}
	
	/**
	 * 新增/编辑企业普通员工初始页
	 * 
	 * @author chengzhihuan 2017年5月26日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initEnterpriseUserPage")
	public String initEnterpriseUserPage(HttpServletRequest request, Model model){
		// 取出操作类型(1:新增 2:编辑)
		String operateType = request.getParameter("operateType");
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();

		String operateTitle = "";

		if ("2".equals(operateType)) {
			// 用户ID
			Integer userInfoId = null;
			if (StringUtils.isNotBlank(request.getParameter("userInfoId"))) {
				userInfoId = Integer.valueOf(request.getParameter("userInfoId"));
			}

			// 根据用户ID、主机构ID查询企业普通员工信息
			EnterpriseUserInfo queryPo = new EnterpriseUserInfo();
			queryPo.setUserInfoId(userInfoId);
			queryPo.setOrgRootId(orgRootId);
			EnterpriseUserInfo userEnterprise = enterpriseUserInfoFacade.getEnterpriseUserByPo(queryPo);
			if(userEnterprise != null){
				OrgInfoPo orgInfoPo = new OrgInfoPo();
				OrgInfoPo parentOrgInfo = new OrgInfoPo();
				if(userEnterprise.getOrgInfoId() != null){
					orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(userEnterprise.getOrgInfoId());
				}
				if(userEnterprise.getParentOrgInfoId() != null){
					parentOrgInfo = orgInfoFacade.getOrgInfoByOrgInfoId(userEnterprise.getParentOrgInfoId());
					if(parentOrgInfo != null){
						orgInfoPo.getOrgDetailInfo().setParentOrgName(parentOrgInfo.getOrgDetailInfo().getOrgName());
					}
				}
				
				model.addAttribute("orgInfoPo", orgInfoPo.getOrgDetailInfo());
			}
			model.addAttribute("userEnterprise", userEnterprise);
			
			operateTitle = "编辑普通用户";
		} else {
			operateTitle = "新增普通用户";
		}

		model.addAttribute("operateType", operateType);
		model.addAttribute("operateTitle", operateTitle);

		// 查询该主机构下的所有1级与2级机构信息，按照主键ID正序
//		List<OrgInfoPo> orgInfoList = orgInfoFacade.findRootAndTwoLevelOrgInfo(orgRootId);
//		model.addAttribute("orgInfoList", orgInfoList);
		//TODO
		//学历
		List<EnumsModel> educationList = new ArrayList<EnumsModel>();
		if(EducationEnum.values() != null){
			for (EducationEnum enumInfo : EducationEnum.values()) {
				EnumsModel eModel = new EnumsModel();
				eModel.setCode(enumInfo.getCode());
				eModel.setDesc(enumInfo.getDesc());
				educationList.add(eModel);
			}
		}
		model.addAttribute("educationList", educationList);
		
		//民族
		List<EnumsModel> nationalityList = new ArrayList<EnumsModel>();
		if(NationalityEnum.values() != null){
			for (NationalityEnum enumInfo : NationalityEnum.values()) {
				EnumsModel eModel = new EnumsModel();
				eModel.setCode(enumInfo.getCode());
				eModel.setDesc(enumInfo.getDesc());
				nationalityList.add(eModel);
			}
		}
		model.addAttribute("nationalityList", nationalityList);
		
		return "template/user/init_enterprise_user_page";
	}
	
	/**
	 * 新增/修改企业普通员工
	 * 
	 * @author chengzhihuan 2017年5月26日
	 * @param request
	 * @param userModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateEnterpriseUser", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateEnterpriseUser(HttpServletRequest request, UserModel userModel) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID、用户角色
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();

		try {
			jo = userInfoFacade.addOrUpdateEnterpriseUser(orgRootId, userInfoId, userRole, userModel);
		} catch (Exception e) {
			log.error("维护企业普通员工信息异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "维护企业普通员工信息服务异常，请稍后重试");
		}

		return jo;
	}
	
	/**
	 * 新增/编辑内部司机初始页
	 * 
	 * @author chengzhihuan 2017年5月25日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initDriverPage")
	public String initDriverPage(HttpServletRequest request, Model model){
		// 取出操作类型(1:新增 2:编辑)
		String operateType = request.getParameter("operateType");
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();

		String operateTitle = "";

		if ("2".equals(operateType)) {
			// 用户ID
			Integer userInfoId = null;
			if (StringUtils.isNotBlank(request.getParameter("userInfoId"))) {
				userInfoId = Integer.valueOf(request.getParameter("userInfoId"));
			}

			// 根据用户ID、主机构ID查询用户信息
			Map<String,Object> params = new HashMap<String,Object>();
			params.put("userInfoId", userInfoId);
			params.put("orgRootId", orgRootId);
			UserInfo userDriver = userInfoFacade.getUserInfoByIdAndRootId(params);
			if(userDriver != null){
				OrgInfoPo orgInfoPo = new OrgInfoPo();
				OrgInfoPo parentOrgInfo = new OrgInfoPo();
				if(userDriver.getOrgInfoId() != null){
					orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(userDriver.getOrgInfoId());
				}
				if(userDriver.getParentOrgInfoId() != null){
					parentOrgInfo = orgInfoFacade.getOrgInfoByOrgInfoId(userDriver.getParentOrgInfoId());
					if(parentOrgInfo != null){
						orgInfoPo.getOrgDetailInfo().setParentOrgName(parentOrgInfo.getOrgDetailInfo().getOrgName());
					}
				}
				
				model.addAttribute("orgInfoPo", orgInfoPo.getOrgDetailInfo());
			}
			model.addAttribute("userDriver", userDriver);
			
			operateTitle = "编辑司机";
		} else {
			operateTitle = "新增司机";
		}

		model.addAttribute("operateType", operateType);
		model.addAttribute("operateTitle", operateTitle);

		// 查询该主机构下的所有1级与2级机构信息，按照主键ID正序
//		List<OrgInfoPo> orgInfoList = orgInfoFacade.findRootAndTwoLevelOrgInfo(orgRootId);
//		model.addAttribute("orgInfoList", orgInfoList);
		
		return "template/user/init_driver_page";
	}
	
	/**
	 * 新增/修改企业内部司机
	 * 
	 * @author chengzhihuan 2017年5月16日
	 * @param request
	 * @param userModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateDriver", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateDriver(HttpServletRequest request, UserModel userModel) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID、用户角色
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();

		try {
			jo = userInfoFacade.addOrUpdateDriverInfo(orgRootId, userInfoId, userRole, userModel);
		} catch (Exception e) {
			log.error("维护企业司机信息异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "维护企业司机信息服务异常，请稍后重试");
		}

		return jo;
	}
	
	/**
	 * 启用/停用/注销用户
	 * @author chengzhihuan 2017年5月24日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value="/operateUser",produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateUser(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer operateUserId = userInfo.getId();
		
		// 被操作的用户ID
		List<Integer> userInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("userInfoIds"))) {
			String userInfoIds = request.getParameter("userInfoIds").trim();
			String[] userArray = userInfoIds.split(",");
			if(userArray.length>0){
				for(String userIdStr : userArray){
					if(StringUtils.isNotBlank(userIdStr)){
						userInfoIdList.add(Integer.valueOf(userIdStr.trim()));
					}
				}
			}
		}
		
		//所选用户不能为空
		if(CollectionUtils.isEmpty(userInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选用户不能为空");
			return jo;
		}
				
		// 操作类型 1:启用 2:停用 3:注销
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}
		
		try {
			//根据用户ID启用/停用/注销用户
			jo = userInfoFacade.operateUserStatus(rootOrgInfoId, operateUserId, userInfoIdList, operateType);
		} catch (Exception e) {
			log.error("启用/停用/注销用户异常", e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "操作用户服务异常，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * 重置用户密码
	 * @author chengzhihuan 2017年5月24日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value="/resetPassword",produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject resetPassword(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer operateUserId = userInfo.getId();
		
		// 被操作的用户ID
		List<Integer> userInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("userInfoIds"))) {
			String userInfoIds = request.getParameter("userInfoIds").trim();
			String[] userArray = userInfoIds.split(",");
			if(userArray.length>0){
				for(String userIdStr : userArray){
					if(StringUtils.isNotBlank(userIdStr)){
						userInfoIdList.add(Integer.valueOf(userIdStr.trim()));
					}
				}
			}
		}
		
		// 新密码
		String password = request.getParameter("password");
		// 确认密码
		String rePassword = request.getParameter("rePassword");
		
		//所选用户不能为空
		if(CollectionUtils.isEmpty(userInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选用户不能为空");
			return jo;
		}
		
		//新密码不能为空
		if(StringUtils.isBlank(password)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "新密码不能为空");
			return jo;
		}
		
		//确认密码不能为空
		if(StringUtils.isBlank(rePassword)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "确认密码不能为空");
			return jo;
		}
		
		//新密码与确认密码要一致
		if(!password.trim().equals(rePassword.trim())){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "新密码与确认密码不相同");
			return jo;
		}
		
		//重置用户密码
		try {
			jo = userInfoFacade.resetPassword(rootOrgInfoId, operateUserId, userInfoIdList, password.trim());
		} catch (Exception e) {
			log.error("重置密码异常", e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "重置密码服务异常，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * 角色分配页面
	 * @author qiutianhui 2017年7月3日
	 * @param model
	 * @return
	 */
	@RequiresPermissions("basicInfo:resource:user:view")
	@RequestMapping(value = "/showList", method = RequestMethod.GET)
	public String showList(){
		return "template/user/role_assignment_page";
	}
	
	/**
	 * 查询可分配角色的用户
	 * @author qiutianhui 2017年7月3日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/findUsers")
	@ResponseBody
	public List<UserInfo> findUsers(HttpServletRequest request){
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		List<UserInfo> userInfoList = userInfoFacade.findMyUser(userInfo);
		// 5、封装用户真实姓名
		List<EnterpriseUserInfo> enterpriseUserInfos = new ArrayList<EnterpriseUserInfo>();
		List<Integer> userInfoIds = CommonUtils.getValueList(userInfoList, "id");
		if(CollectionUtils.isNotEmpty(userInfoIds)){
			enterpriseUserInfos = enterpriseUserInfoFacade.getEnterpriseUserInfoByUserInfoIds(userInfoIds);
		}
		// key:用户ID value:用户真实姓名
		Map<Integer, String> enterpriseUserInfoMap = null;
		if (CollectionUtils.isNotEmpty(enterpriseUserInfos)) {
			enterpriseUserInfoMap = CommonUtils.listforMap(enterpriseUserInfos, "userInfoId", "realName");
		}
		for(UserInfo ui : userInfoList){						
			if(MapUtils.isNotEmpty(enterpriseUserInfoMap)){
				if(enterpriseUserInfoMap.get(ui.getId())!=null){
					ui.setRealName(enterpriseUserInfoMap.get(ui.getId()));
				}
			}
		}
		return userInfoList;
	}
	
	/**
	 * 添加用户-角色关联关系
	 * @author qiutianhui 2017年7月3日
	 * @param userId 用户Id
	 * @param roleId 角色Id
	 * @return
	 */
	@RequiresPermissions("basicInfo:resource:user:update")
	@RequestMapping(value = "/saveUserRole", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject saveUserRole(Integer userId,Integer roleId,Integer roleType){
		JSONObject jo = null;
		jo = userInfoFacade.addUserRole(userId, roleId, roleType);
		return jo;
	}
	
	
	/**
	 * 平台管理员信息
	 * @author qiutianhui 2017年8月3日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/puserList")
	public String puserList(HttpServletRequest request, Model model) {
		DataPager<UserInfo> userInfoPager = new DataPager<UserInfo>();
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		userInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		
		// 启用状态 (0:停用 1:启用)
		Integer isAvailable = null;
		if (params.get("isAvailable") != null) {
			isAvailable = Integer.valueOf(params.get("isAvailable").toString());
		}
		
		//注销状态 (0：未注销 1：已注销)
		Integer userState = null;
		if (params.get("userState") != null) {
			userState = Integer.valueOf(params.get("userState").toString());
		}
		
		//用户名
		String userName = null;
		if (params.get("userName") != null) {
			userName = params.get("userName").toString();
		}
		
		//手机号
		String mobilePhone = null;
		if (params.get("mobilePhone") != null) {
			mobilePhone = params.get("mobilePhone").toString();
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("isAvailable", isAvailable);
		queryMap.put("userState", userState);
		queryMap.put("userName", userName);
		queryMap.put("mobilePhone", mobilePhone);
		
		// 3、查询平台管理员总数
		//Integer totalNum = userInfoFacade.countPuserForPage(queryMap);
		
		// 3、分页查询平台管理员信息
		List<UserInfo> userInfoList = userInfoFacade.findPuserForPage(queryMap);
		
		// 4、总数、分页信息封装
		//userInfoPager.setTotal(totalNum);
		userInfoPager.setRows(userInfoList);
		model.addAttribute("userInfoPager", userInfoPager);
		
		return "template/platformUser/puser_info_data";
	}
	
	/**
	 * 查询平台管理员条目数
	 * @author qiutianhui 2017年8月3日
	 * @param request
	 * @return
	 */
	@RequestMapping(value="/getCountPusers",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getCountPusers(HttpServletRequest request){
		//接收页面参数
		String userName=request.getParameter("userName");
		String mobilePhone=request.getParameter("mobilePhone");
		String isAvailable=request.getParameter("isAvailable");
		String userState=request.getParameter("userState");
    	//封装参数
  		Map<String, Object> params=new HashMap<String,Object>();
  		params.put("userName", userName);
  		params.put("mobilePhone", mobilePhone);
  		params.put("isAvailable", isAvailable);
  	    params.put("userState", userState);
  	    Integer count=userInfoFacade.countPuserForPage(params);
  		return count;
	}
	
	/**
	 * 平台管理员信息
	 * @author qiutianhui 2017年8月3日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showPuserListPage")
	public String showPuserListPage(HttpServletRequest request, Model model) {
		return "template/platformUser/show_puser_info_list_page";
	}
	
	/**
	 * 新增/编辑平台用户
	 * @author qiutianhui 2017年8月3日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initPuserPage")
	public String initPuserPage(HttpServletRequest request, Model model){
		// 取出操作类型(1:新增 2:编辑)
		String operateType = request.getParameter("operateType");
		String operateTitle = "";
		if ("2".equals(operateType)) {
			// 用户ID
			Integer userInfoId = null;
			if (StringUtils.isNotBlank(request.getParameter("userInfoId"))) {
				userInfoId = Integer.valueOf(request.getParameter("userInfoId"));
			}
			// 根据用户ID查询用户信息
			Map<String,Object> params = new HashMap<String,Object>();
			params.put("userInfoId", userInfoId);
			UserInfo puser = userInfoFacade.getPuserById(params);
			model.addAttribute("puser", puser);
			
			operateTitle = "编辑司机";
		} else {
			operateTitle = "新增司机";
		}
		model.addAttribute("operateType", operateType);
		model.addAttribute("operateTitle", operateTitle);
		return "template/platformUser/init_puser_page";
	}
	
	/**
	 * 新增/编辑平台管理员信息
	 * @author qiutianhui 2017年8月3日
	 * @param request
	 * @param userModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdatePuser", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdatePuser(HttpServletRequest request, UserModel userModel) {
		JSONObject jo = null;
		// 从session中取出当前用户的用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = 5;

		try {
			jo = userInfoFacade.addOrUpdatePuser(userInfoId, userRole, userModel);
		} catch (Exception e) {
			log.error("维护用户信息异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "维护用户信息服务异常，请稍后重试");
		}

		return jo;
	}
	
	/**
	 * 修改平台管理员密码
	 * @author qiutianhui 2017年8月3日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value="/resetPuserPassword",produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject resetPuserPassword(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo = null;
		
		// 从session中取出当前用户的用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer operateUserId = userInfo.getId();
		
		// 被操作的用户ID
		List<Integer> userInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("userInfoIds"))) {
			String userInfoIds = request.getParameter("userInfoIds").trim();
			String[] userArray = userInfoIds.split(",");
			if(userArray.length>0){
				for(String userIdStr : userArray){
					if(StringUtils.isNotBlank(userIdStr)){
						userInfoIdList.add(Integer.valueOf(userIdStr.trim()));
					}
				}
			}
		}
		
		// 新密码
		String password = request.getParameter("password");
		// 确认密码
		String rePassword = request.getParameter("rePassword");
		
		//所选用户不能为空
		if(CollectionUtils.isEmpty(userInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选用户不能为空");
			return jo;
		}
		
		//新密码不能为空
		if(StringUtils.isBlank(password)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "新密码不能为空");
			return jo;
		}
		
		//确认密码不能为空
		if(StringUtils.isBlank(rePassword)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "确认密码不能为空");
			return jo;
		}
		
		//新密码与确认密码要一致
		if(!password.trim().equals(rePassword.trim())){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "新密码与确认密码不相同");
			return jo;
		}
		
		//重置用户密码
		try {
			jo = userInfoFacade.resetPuserPassword(operateUserId, userInfoIdList, password.trim());
		} catch (Exception e) {
			log.error("重置密码异常", e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "重置密码服务异常，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * 启用/停用/注销平台管理员
	 * @author qiutianhui 2017年8月3日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value="/operatePuser",produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operatePuser(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer operateUserId = userInfo.getId();
		
		// 被操作的用户ID
		List<Integer> userInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("userInfoIds"))) {
			String userInfoIds = request.getParameter("userInfoIds").trim();
			String[] userArray = userInfoIds.split(",");
			if(userArray.length>0){
				for(String userIdStr : userArray){
					if(StringUtils.isNotBlank(userIdStr)){
						userInfoIdList.add(Integer.valueOf(userIdStr.trim()));
					}
				}
			}
		}
		
		//所选用户不能为空
		if(CollectionUtils.isEmpty(userInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选用户不能为空");
			return jo;
		}
				
		// 操作类型 1:启用 2:停用 3:注销
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}
		
		try {
			//根据用户ID启用/停用/注销用户
			jo = userInfoFacade.operatePuserStatus(operateUserId, userInfoIdList, operateType);
		} catch (Exception e) {
			log.error("启用/停用/注销用户异常", e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "操作用户服务异常，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年8月21日 下午3:55:35
	 * @param response
	 * @param request
	 * @return
	 * 获取手机号验证码
	 */
	@RequestMapping(value="/mobilePhoneCode",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findMobilePhoneCode(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		//接收手机号
		String mobilPhone=request.getParameter("mobilePhone");
		try {
			jo=userInfoFacade.aliMessage(mobilPhone);
		} catch (Exception e) {
			log.error("获取手机号验证码异常!",e);
			jo.put("success", false);
			jo.put("msg", "获取验证码异常");
		}
		return jo;
	}
	
	/**
	 * 查询组织信息初始页
	 * @author jiangweiwei 2017年10月9日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showOrgInfoPage")
	public String showOrgInfoPage(HttpServletRequest request, Model model) {
		DataPager<OrgInfoPo> orgInfoPager = new DataPager<OrgInfoPo>();
		// 从session中取出当前用户的组织机构ID和企业用户类型
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer enterpriseUserType = userInfo.getEnterpriseUserType();
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		orgInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		orgInfoPager.setSize(rows);
		//组织机构ID
		Integer orgInfoIdParam = null;
//		if(params.get("orgInfoId") != null){
//			orgInfoIdParam = Integer.valueOf(params.get("orgInfoId").toString());
//		}
		//组织名称
		String orgInfoName = null;
		if(params.get("orgInfoName") != null){
			orgInfoName = params.get("orgInfoName").toString();
		}
		//封装条件
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgInfoId", orgInfoId);
		queryMap.put("orgInfoIdParam", orgInfoIdParam);
		queryMap.put("orgInfoName", orgInfoName);
		// 查询该主机构下的所有1级与2级机构信息，按照主键ID正序
		Integer total = null;
		List<OrgInfoPo> orgInfoList = new ArrayList<OrgInfoPo>();
		if(enterpriseUserType == 1){
			orgInfoList = orgInfoFacade.getOrgInfosByOrgInfoId(queryMap);
			total = orgInfoFacade.countOrgInfosByOrgInfoId(queryMap);
		}else{
			orgInfoList = orgInfoFacade.findTwoLevelOrgInfo(queryMap);
			total = orgInfoFacade.countTwoLevelOrgInfo(queryMap);
		}
		List<OrgInfoPo> orgInfoPos = new ArrayList<OrgInfoPo>();
		if(CollectionUtils.isNotEmpty(orgInfoList)){
			List<Integer> parentOrgInfoIds = CommonUtils.getValueList(orgInfoList, "parentOrgInfoId");
			orgInfoPos = orgInfoFacade.findOrgNameByIds(parentOrgInfoIds);
			//key:组织id value:组织名称
			Map<Integer, String> orgInfoPoMap = null;
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				//根据登录用户组织机构ID获取所属组织名称
				orgInfoPoMap = CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
			//封装所属组织名称
			for (OrgInfoPo orgInfoPo : orgInfoList) {
				//根据登录用户组织机构ID获取所属组织名称
				if (MapUtils.isNotEmpty(orgInfoPoMap) && orgInfoPoMap.get(orgInfoPo.getParentOrgInfoId()) != null) {
					orgInfoPo.setParentOrgName(orgInfoPoMap.get(orgInfoPo.getParentOrgInfoId()));
				}else{
					orgInfoPo.setParentOrgName(orgInfoPo.getOrgName());
				}
			}
		}
		orgInfoPager.setTotal(total);
		orgInfoPager.setRows(orgInfoList);
		model.addAttribute("orgInfoPager", orgInfoPager);
		return "template/user/show_org_info_page";
	}
	
	/**
	 * 查询组织信息初始页下拉框初始化
	 * @author jiangweiwei 2017年10月9日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showOrgInfoSelect", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject showOrgInfoSelect(HttpServletRequest request, Model model) {
		JSONObject jo = new JSONObject();
		// 从session中取出当前用户的组织机构ID和企业用户类型
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer enterpriseUserType = userInfo.getEnterpriseUserType();
		//下拉框所属机构信息
		List<OrgInfoPo> orgInfoPoList = new ArrayList<OrgInfoPo>();
		//下拉框封装查询条件
		Map<String, Object> querySelectMap = new HashMap<String, Object>();
		querySelectMap.put("parentOrgInfoId", orgInfoId);
		querySelectMap.put("orgType", 1);
		if(enterpriseUserType == 1){
			orgInfoPoList = orgInfoFacade.getOrgInfosByOrgInfoIdAndOrgType(querySelectMap);
		}else{
			orgInfoPoList = orgInfoFacade.findRootAndSubOrgInfo(querySelectMap);
		}
		jo.put("orgInfoPoList", orgInfoPoList);
		return jo;
	}
	
}
