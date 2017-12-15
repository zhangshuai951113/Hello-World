package com.xz.logistics.controller;


import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.shiro.authc.ExcessiveAttemptsException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.xz.facade.api.AddressDetailFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.EnterpriseUserInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.MyMessagesFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.EnterpriseUserInfo;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserInfo;

import net.sf.json.JSONObject;

@Controller
@RequestMapping("/userInfo")
public class LoginController extends BaseController {

	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private EnterpriseUserInfoFacade enterpriseUserInfoFacade;
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private AddressDetailFacade addressDetailFacade;
	
	private static String ERROR = null;

	@RequestMapping("/login")
	public String login(HttpServletRequest req) {
		String exceptionClassName = (String)req.getAttribute("shiroLoginFailure");
		if(UnknownAccountException.class.getName().equals(exceptionClassName)){
			ERROR = "用户名/密码错误";
		}else if(IncorrectCredentialsException.class.getName().equals(exceptionClassName)){
			ERROR = "用户名/密码错误";
		}else if(ExcessiveAttemptsException.class.getName().equals(exceptionClassName)){
			ERROR = "密码错误超过五次，请一分钟之后再试";
		}else if(exceptionClassName != null){
			ERROR = "其他错误：" + exceptionClassName;
		}
		return "login";
	}
	
	@RequestMapping("/infoShow")
	public String info_html(HttpServletRequest req) {
		return "/template/infoShow/infoShow";
	}
	@RequestMapping("/to_info")
	public String to_info(HttpServletRequest req) {
		return "/template/infoShow/index";
	}
	@RequestMapping("/gonglu")
	public String gonglu(HttpServletRequest req) {
		
		return "/template/infoShow/gonglu/gonglu";
	}
	@RequestMapping("/ditu1")
	public String ditu1(HttpServletRequest req,Model model,@RequestParam("wap") String wap) {
		if(wap==null||wap==""){
			wap = "30";
			model.addAttribute("wap",wap);
		}else{
			model.addAttribute("wap",wap);
		}
		return "/template/infoShow/map1/ditu1";
	}
	@RequestMapping("/ditu2")
	public String ditu2(HttpServletRequest req,Model model,@RequestParam("wap") String wap) {
		if(wap==null||wap==""){
			wap = "30";
			model.addAttribute("wap",wap);
		}else{
			model.addAttribute("wap",wap);
		}
		return "/template/infoShow/map2/ditu2";
	}
	@RequestMapping("/ditu3")
	public String ditu3(HttpServletRequest req) {
		return "/template/infoShow/map3/ditu3";
	}


	@RequestMapping(value = "/checkLogin", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject checkUser(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		
		String userName = request.getParameter("username");
		String password = request.getParameter("password");
		UserInfo userInfo = null;
		if (userName == null || userName == "") {
			jo.put("success", false);
			jo.put("msg", "用户名不能为空!");
			return jo;
		}
		if (password == null || password == "") {
			jo.put("success", false);
			jo.put("msg", "密码不能为空!");
			return jo;
		}
		
		if(ERROR != null){
			jo.put("success", false);
			jo.put("msg", ERROR);
			ERROR = null;
			return jo;
		}
		
		/*try {
			password = MD5Utils.sign(password);
		} catch (Exception e) {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "密码输入有误!");
			e.printStackTrace();
			return jo;
		}*/
		// 获取登录参数
		userInfo = userInfoFacade.findUserByUsername(userName);

		if (userInfo == null) {
			jo.put("success", false);
			jo.put("msg", "用户或密码错误!");
			return jo;
		}
		// 用户状态校验
		if (userInfo.getUserState().equals(1)) {
			jo.put("success", false);
			jo.put("msg", "用户已注销!");
			return jo;
		}

		if (userInfo.getIsAvailable() == 0) {
			jo.put("success", false);
			jo.put("msg", "账号已停用!");
			return jo;
		}

		// 根据组织机构信息校验 1、校验是否有所属主机构
		if (userInfo.getOrgRootId() != null) {
			OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoById(userInfo.getOrgRootId());
			if (orgInfoPo != null) {
				if (orgInfoPo.getOrgStatus().equals(4) || orgInfoPo.getIsAvailable().equals(0)) {
					jo.put("success", false);
					jo.put("msg", "所属组织机构已注销或未启用，登录失败!");
					return jo;
				}
				userInfo.setRootOrgIsAvailable(orgInfoPo.getIsAvailable());
				userInfo.setRootOrgStatus(orgInfoPo.getOrgStatus());
				userInfo.setOrgType(orgInfoPo.getOrgType());
			}

			// 2、校验是否有所属组织机构
			if (userInfo.getOrgInfoId() != null) {
				orgInfoPo = orgInfoFacade.getOrgInfoById(userInfo.getOrgInfoId());
				if (orgInfoPo != null) {
					if (orgInfoPo.getOrgStatus().equals(4) || orgInfoPo.getIsAvailable().equals(0)) {
						jo.put("success", false);
						jo.put("msg", "所属组织机构已注销或未启用，登录失败!");
						return jo;
					}
					userInfo.setOrgIsAvailable(orgInfoPo.getIsAvailable());
					userInfo.setOrgStatus(orgInfoPo.getOrgStatus());
					userInfo.setOrgCooperateState(orgInfoPo.getCooperateState());
					userInfo.setOrgLevel(orgInfoPo.getOrgLevel());
					userInfo.setOrgType(orgInfoPo.getOrgType());
					// 3、组织机构向上递归校验
					while (orgInfoPo.getId() != userInfo.getOrgRootId()) {
						if (orgInfoPo.getParentOrgInfoId() != 0 && orgInfoPo.getParentOrgInfoId() != null) {
							orgInfoPo = orgInfoFacade.getOrgInfoById(orgInfoPo.getParentOrgInfoId());
							if (orgInfoPo != null) {
								if (orgInfoPo.getOrgStatus().equals(4) || orgInfoPo.getIsAvailable().equals(0)) {
									jo.put("success", false);
									jo.put("msg", "所属组织机构已注销或未启用，登录失败!");
									return jo;
								}
							} else {
								break;
							}
						} else {
							break;
						}
					}
				}
			}
		}

		// 判断角色 1、2 企业货主、物流公司 封装企业用户id
		if (userInfo.getUserRole() == 1 || userInfo.getUserRole() == 2) {
			EnterpriseUserInfo enterpriseUserInfo = enterpriseUserInfoFacade
					.getEnterpriseUserInfoByUserInfoId(userInfo.getId());
			if (null != enterpriseUserInfo)
				userInfo.setEnterpriseUserId(enterpriseUserInfo.getId());
		}
		// 3个体货主
		if (userInfo.getUserRole() == 3) {
			IndividualOwnerPo individualOwnerPo = individualOwnerFacade
					.findIndividualOwnerByUserInfoId(userInfo.getId());
			if (null != individualOwnerPo)
				userInfo.setIndividualOwnerId(individualOwnerPo.getId());
		}
		// 4司机
		if (userInfo.getUserRole() == 4) {
			DriverInfo driverInfo = driverInfoFacade.getDriverInfoByUserId(userInfo.getId());
			if (null != driverInfo)
				userInfo.setDriverId(driverInfo.getId());
		}
		request.getSession().setAttribute("userInfo", userInfo);
		request.getSession().setAttribute("_scope_userName", userInfo.getUserName());
		jo.put("success", true);
		jo.put("msg", "登录成功!");
		
		// zhangbo加  保存当前登录用户的地理位置信息
		addressDetailFacade.insertAddressDetail(userInfo.getId());
		return jo;
	}
}