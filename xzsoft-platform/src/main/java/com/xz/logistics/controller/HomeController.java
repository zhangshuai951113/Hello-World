package com.xz.logistics.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.xz.common.utils.redis.RedisUtil;
import com.xz.facade.api.CarSourceInfoFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.model.po.CarSourceInfoPo;
import com.xz.model.po.WaybillInfoPo;

/**
* @author zhangshuai
* @version 创建时间：2017年5月21日 下午11:24:49
* 类说明
*/
@Controller
public class HomeController extends BaseController{
	private final Logger log=LoggerFactory.getLogger(getClass());
	@Resource
	private CarSourceInfoFacade carSourceInfoFacade;
	
	@Resource
	private WaybillInfoFacade waybillInfoFacade;
	
	@Resource
	private LineInfoFacade lineInfoFacade;
	
	/**
	 * @author zhangshuai
	 * 创建时间  2017年5月21日 下午11:26:02
	 * @return
	 * 进入home页面
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/home")
	public String home(Model model){
		Map<String,Object> carMap = (Map<String, Object>) RedisUtil.get("carSource1010");
		Map<String,Object> waybillMap = (Map<String, Object>) RedisUtil.get("waybill1010");
		List<CarSourceInfoPo> carList = new ArrayList<CarSourceInfoPo>();
		List<WaybillInfoPo> waybillList = new ArrayList<WaybillInfoPo>();
		if(carMap != null){
			carList = (List<CarSourceInfoPo>)carMap.get("car");
	    	model.addAttribute("carList", carList);
		}else{
			carSourceInfoFacade.insertReleaseCarSource();
			carMap = (Map<String, Object>) RedisUtil.get("carSource1010");
			if(carMap != null && carMap.size()>0){
				carList = (List<CarSourceInfoPo>)carMap.get("car");
			}
	    	model.addAttribute("carList", carList);
		}
		if(waybillMap != null){
			waybillList = (List<WaybillInfoPo>)waybillMap.get("waybill");
			model.addAttribute("waybillList", waybillList);
		}else{
			waybillInfoFacade.insertReleaseWaybill();
			waybillMap = (Map<String, Object>) RedisUtil.get("waybill1010");
			if(waybillMap != null && waybillMap.size() > 0){
				waybillList = (List<WaybillInfoPo>)waybillMap.get("waybill");
			}
			model.addAttribute("waybillList", waybillList);
		}
		return "home";
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/refreshHome")
	@ResponseBody
	public Map<String,Object> refreshHome(){
		List<CarSourceInfoPo> carList = new ArrayList<CarSourceInfoPo>();
		List<WaybillInfoPo> waybillList = new ArrayList<WaybillInfoPo>();
		Map<String,Object> releaseMap = new HashMap<String,Object>();
		Map<String,Object> carMap = (Map<String, Object>) RedisUtil.get("carSource1010");
		Map<String,Object> waybillMap = (Map<String, Object>) RedisUtil.get("waybill1010");
		if(carMap != null && carMap.size()>0){
			carList = (List<CarSourceInfoPo>)carMap.get("car");
		}else{
			carSourceInfoFacade.insertReleaseCarSource();
			carMap = (Map<String, Object>) RedisUtil.get("carSource1010");
			if(carMap != null && carMap.size()>0){
				carList = (List<CarSourceInfoPo>)carMap.get("car");
			}
		}
		if(waybillMap != null && waybillMap.size()>0){
			waybillList = (List<WaybillInfoPo>)waybillMap.get("waybill");
		}else{
			waybillInfoFacade.insertReleaseWaybill();
			waybillMap = (Map<String, Object>) RedisUtil.get("waybill1010");
			if(waybillMap != null && waybillMap.size() > 0){
				waybillList = (List<WaybillInfoPo>)waybillMap.get("waybill");
			}
		}
		releaseMap.put("carList", carList);
		releaseMap.put("waybillList", waybillList);
		return releaseMap;
	}
	
	/**
	 *@author zhangya
	 *2017年5月23日 下午4:08:10
	 * @return
	 */
	@RequestMapping("/logout")
	public String logout(HttpServletRequest request) {
		request.getSession().setAttribute("userInfo", null);
		return "home";
	}
	
	/**
	 * @author zhangshuai  2017年8月24日 上午11:11:12
	 * @param request
	 * @param response
	 * @return
	 * 首页车源条数查询（已发布）
	 */
	@RequestMapping(value="/findCarSourceCount")
	@ResponseBody
	public JSONObject findCarSourceCount(HttpServletRequest request,HttpServletResponse response){
		
		JSONObject jo=new JSONObject();
		
		try {
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("carSourceStatus", 1);//已发布
			Integer count = carSourceInfoFacade.getCarSourceCount(params);
			jo.put("success", true);
			jo.put("msg", count);
		} catch (Exception e) {
			log.error("首页查询车源条数异常!",e);
			jo.put("success", false);
			jo.put("msg", "首页查询车源条数异常!");
		}
		
		return jo;
		
	}
	
	/**
	 * @author zhangshuai  2017年8月24日 上午11:47:17
	 * @param request
	 * @param response
	 * @return
	 * 首页查询货源数量
	 */
	@RequestMapping(value="/findWaybillCount")
	@ResponseBody
	public JSONObject findWaybillCount(HttpServletRequest request,HttpServletResponse response){
		
		JSONObject jo=new JSONObject();
		
		try {
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("releaseMode", 1);
			Integer count=waybillInfoFacade.findWaybillCount(params);
			jo.put("success", true);
			jo.put("msg", count);
		} catch (Exception e) {
			log.error("首页查询货源条数异常!",e);
			jo.put("success", false);
			jo.put("msg", "首页查询货源条数异常!");
		}
		
		return jo;
		
	}
	
	/**
	 * @author zhangshuai  2017年8月24日 上午11:59:50
	 * @param response
	 * @param request
	 * @return
	 * 首页查询线路数量
	 */
	@RequestMapping(value="/findLineCount")
	@ResponseBody
	public JSONObject findLineCount(HttpServletResponse response,HttpServletRequest request){
		
		JSONObject jo=new JSONObject();
		try {
			Map<String, Object> params=new HashMap<String,Object>();
			Integer count = lineInfoFacade.countLineInfoForPage(params);
			jo.put("success", true);
			jo.put("msg", count);
		} catch (Exception e) {
			log.error("首页查询线路条数异常!",e);
			jo.put("success", false);
			jo.put("msg", "首页查询线路条数异常!");
		}
		
		return jo;
		
	}
	
}
