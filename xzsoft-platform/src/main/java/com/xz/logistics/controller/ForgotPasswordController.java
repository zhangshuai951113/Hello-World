package com.xz.logistics.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.facade.api.PasswordHelperFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.UserInfo;
import com.xz.rpc.service.PasswordHelper;

/**
* @author zhangshuai   2017年8月22日 上午10:59:52
* 类说明  (忘记密码Controller)
*/
@RequestMapping("/forgotPassword")
@Controller
public class ForgotPasswordController {

	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private PasswordHelper passwordHelper;
	@Resource
	private PasswordHelperFacade passwordHelperFacade;
	//进入忘记密码页面
	@RequestMapping(value="/goForgotPasswordPage",produces="application/json;charset=utf-8")
	public String goForgotPassword(HttpServletRequest request,HttpServletResponse response){
		return "forgotPassword";
	}
	
	/**
	 * @author zhangshuai  2017年8月22日 上午11:38:35
	 * @param request
	 * @param response
	 * @return
	 * 输入手机号、验证码进行身份验证
	 */
	@RequestMapping(value="/verifyIdentity",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject verifyIdentity(HttpServletRequest request,HttpServletResponse response,Model model){
		
		JSONObject jo=new JSONObject();
	
		//接收手机号、验证码
		String mobilePhone=request.getParameter("mobilePhone");
		String code=request.getParameter("code");
		//判断是否为空
		if(mobilePhone==null || mobilePhone==""){
			jo.put("success", false);
			jo.put("msg", "请输入手机号!");
			return jo;
		}
		
		if(code==null || code ==""){
			jo.put("success", false);
			jo.put("msg", "请输入验证码!");
			return jo;
		}
		//验证手机验证码是否输入错误
		String realCode = userInfoFacade.findCodeByPhone(mobilePhone);
		if(!realCode.equals(code)){
			 jo.put("success", false);
			 jo.put("msg", "请输入正确的验证码!");
			 return jo;
		}
		
		//验证通过
		//1、根据手机号查询是否存在用户
		List<UserInfo> userInfos=userInfoFacade.findUserByMobilePhone(mobilePhone);
		if(userInfos.size()>1){
			jo.put("success", false);
			jo.put("msg", "该手机号下存在多条用户信息!");
			return jo;
		}else if(userInfos.size()<1){
			jo.put("success", false);
			jo.put("msg", "该手机号下未存在用户信息!");
			return jo;
		}else if(userInfos.size()==1){
			jo.put("success", true);
			jo.put("msg", "身份验证成功!");
			return jo;
		}
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年8月22日 下午12:05:15
	 * @param request
	 * @param response
	 * @return
	 * 获取手机号验证码
	 */
	@RequestMapping(value="/getMobilePhoneCode",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject getMobilePhoneCode(HttpServletRequest request,HttpServletResponse response){
		
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
	 * @author zhangshuai  2017年8月22日 下午1:18:39
	 * @param request
	 * @param response
	 * @return
	 * 身份验证通过后进入修改密码
	 */
	@RequestMapping(value="/updatePasswordPage",produces="application/json;charset=utf-8")
	public String updatePasswordPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String myMobilePhone=request.getParameter("mobilPhone");
		String myCode=request.getParameter("code");
		model.addAttribute("myCode", myCode);
		model.addAttribute("myMobilePhone", myMobilePhone);
		return "template/forgotPassword/updatePasswordModel";
	}
	
	/**
	 * @author zhangshuai  2017年8月22日 下午3:51:49
	 * @param request
	 * @param response
	 * @return
	 * 根据手机号修改密码
	 */
	@RequestMapping(value="/updateMyPassword",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject updateMyPassword(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		//接收手机号、密码
		String mobilePhone=request.getParameter("updateMobilePhone");
		String password=request.getParameter("password");
		String myCode=request.getParameter("updateCode");
		
		//根据手机号查询验证码
		String code = userInfoFacade.findCodeByPhone(mobilePhone);
		if(code == null){
			jo.put("success", false);
			jo.put("msg", "验证码获取失败!");
			return jo;
		}
		//判断验证码是否与数据库一致
		if(myCode==null){
			jo.put("success", false);
			jo.put("msg", "手机验证码不能为空!");
			return jo;
		}else if(!code.equals(myCode)){
			jo.put("success", false);
			jo.put("msg", "手机验证码输入错误!");
			return jo;
		}
		
		//根据手机号获取用户名，用于加密
		List<UserInfo> userInfos=userInfoFacade.findUserByMobilePhone(mobilePhone);
		String userName=null;
		if(CollectionUtils.isNotEmpty(userInfos)){
			for (UserInfo userInfo1 : userInfos) {
				userName=userInfo1.getUserName();
			}
		}
		
		UserInfo userInfo=new UserInfo();
		Map<String, Object> updatePassword = new HashMap<String, Object>();
		try {
			userInfo.setPassword(password);
			userInfo.setUserName(userName);
			UserInfo u = passwordHelperFacade.encryptPassword(userInfo);
			updatePassword.put("password", u.getPassword());
			updatePassword.put("salt", u.getSalt());
		} catch (Exception e1) {
			log.error("修改密码是MD5加密异常!",e1);
			jo.put("success", false);
			jo.put("msg", "密码加密服务异常，请稍后重试");
			return jo;
		}
		updatePassword.put("mobilePhone", mobilePhone);
		try {
			jo=userInfoFacade.updateMyPasswordByMobilePhone(updatePassword);
		} catch (Exception e) {
			log.error("修改密码异常!",e);
		}
		return jo;
	}
	
}
