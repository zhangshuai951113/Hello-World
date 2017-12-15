package com.xz.logistics.controller;

import java.io.IOException;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.IndividualOwnerModel;

/**
* @author zhangshuai
* @version 创建时间：2017年5月18日 下午1:31:13
* 类说明(完善个体货主信息)
*/
@Controller
@RequestMapping("/individualOwner")
public class IndividualOwnerController extends BaseController{

	private final Logger log = LoggerFactory.getLogger(getClass());
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	
	
	/**
	 * @author zhangshuai
	 *创建时间  2017年5月22日 下午1:15:58
	 * @return
	 * 进入完善个体货主表页面
	 */
	@RequestMapping("/individualOwnerPage")
	public String IndividualOwner(){
		return "/template/individualOwner/individualOwnerPage";
	}
	/**
	 * @author zhangshuai
	 *创建时间  2017年5月18日 下午5:12:01
	 * @param request
	 * @param response
	 * @param userInfoId
	 * @return
	 * 根据登录信息查询个体货主表(individual_owner)和用户表(user_info)基本信息,用来展示
	 */
	@RequestMapping(value="/findIndividualOwnerByUserInfoId",produces = "application/json; charset=utf-8")
	@ResponseBody
	public IndividualOwnerPo findIndividualOwnerByUserInfoId(HttpServletRequest request,HttpServletResponse response,Model model){
		//从session中获取到登录用户的用户编号(方式待定)
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId=userInfo.getId();
		IndividualOwnerPo individualOwner=individualOwnerFacade.findIndividualOwnerByUserInfoId(userInfoId);
		//request.getSession().setAttribute("individualOwner", individualOwner);
		return individualOwner;
	}
	
	/**
	 * 根据前台页面参数修改个体货主表
	 * @author zhangshuai
	 *创建时间  2017年5月18日 下午5:51:23
	 * @param request
	 * @param response
	 * @param realName(真实姓名)
	 * @param sex(性别)
	 * @param address(地址)
	 * @param openingBank(开户行)
	 * @param accountName(开户名)
	 * @param bankAccount(银行账号)
	 * @param idCardImage(身份证正面)
	 * @param idCardImageCopy(身份证反面)
	 * @param idCard(身份证号)
	 * @throws IOException
	 */
	@RequestMapping(value="/updateIndividualOwnerByUserInfoId",produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject updateIndividualOwner(HttpServletRequest request,HttpServletResponse response,IndividualOwnerModel individualOwnerModel) throws IOException{
		JSONObject jo=new JSONObject();
		
		    try {
		    	
				jo=individualOwnerFacade.updateIndividualOwnerByUserInfoId(individualOwnerModel);
			
		    } catch (Exception e) {
		    	
				 log.error("保存个人信息异常", e);
				 jo.put("success", false);
				 jo.put("msg", "服务繁忙，请稍后重试");
			}
		    
		    return jo;
		    
	}
}
