package com.xz.logistics.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.LineModel;

/**
 * 线路管理controller
 * 
 * @author luojuan 2017年6月16日
 *
 */
@Controller
@RequestMapping("/line")
public class LineInfoController extends BaseController{
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private LineInfoFacade lineInfoFacade;
	
	@Resource
	private UserInfoFacade userInfoFacade;
	
	@Resource
	private LocationInfoFacade locationInfoFacade;
	
	/**
	 * 初始化页面
	 */
	@RequiresPermissions("basicInfo:line:view")
	@RequestMapping(value = "/rootLineInfolistPage")
	public String rootLineInfolistPage(HttpServletRequest request, Model model){
		return "template/line/show_line_info_list_page";
	}
	
	
	/**
	 * 线路管理查询
	 * 
	 * @author luojuan 2017年6月16日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showLineInfolistPage")
	public String showLineInfolistPage(HttpServletRequest request, Model model){
		DataPager<LineInfoPo> lineInfoPager = new DataPager<LineInfoPo>();
		
		// 从session中取出当前用户的用户权限
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		lineInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		lineInfoPager.setSize(rows);
		
		// 线路状态 (0:启用 1:停用)
		Integer lineStatus = null;
		if (params.get("lineStatus") != null) {
			lineStatus = Integer.valueOf(params.get("lineStatus").toString());
		}else{
			lineStatus=0;
		}
		
		//线路名称
		String lineName = null;
		if (params.get("lineName") != null) {
			lineName = params.get("lineName").toString();
		}
		
		//起点
		String startPoints = null;
		if (params.get("startPoints") != null) {
			startPoints = params.get("startPoints").toString();
		}
		
		//终点
		String endPoints = null;
		if (params.get("endPoints") != null) {
			endPoints = params.get("endPoints").toString();
		}
	
		//运距（公里）Start
		String distanceStart = null;
		if (params.get("distanceStart") != null) {
			distanceStart = params.get("distanceStart").toString();
		}
		
		//运距（公里）End
		String distanceEnd = null;
		if (params.get("distanceEnd") != null) {
			distanceEnd = params.get("distanceEnd").toString();
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("lineStatus", lineStatus);
		queryMap.put("lineName", lineName);
		queryMap.put("startPoints", startPoints);
		queryMap.put("endPoints", endPoints);
		queryMap.put("distanceStart", distanceStart);
		queryMap.put("distanceEnd", distanceEnd);
		
		//3、查询线路管理总数
		Integer totalNum = lineInfoFacade.countLineInfoForPage(queryMap);
		
		//4、分页查询线路管理
		List<LineInfoPo> lineInfoList = lineInfoFacade.findLineInfoForPage(queryMap);
		for (LineInfoPo lineInfoPo : lineInfoList) {
			//查询创建人
			UserInfo createUser = (UserInfo)userInfoFacade.getUserInfoById(lineInfoPo.getCreateUser());
			if(createUser != null){
				lineInfoPo.setCreateUserName(createUser.getUserName());
			}
		}
		
		//5、总数、分页信息封装
		lineInfoPager.setTotal(totalNum);
		lineInfoPager.setRows(lineInfoList);
		model.addAttribute("userRole",userRole);
		model.addAttribute("lineInfoPager",lineInfoPager);
		
		return "template/line/line_info_data";
	}
	
	/**
	 * 新增/编辑线路信息初始页
	 * 
	 * @author luojuan 2017年6月17日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initLinePage")
	public String initLinePage(HttpServletRequest request, Model model){
		// 取出操作类型(1:新增 2:编辑)
		String operateType1 = request.getParameter("operateType");
		Integer operateType = Integer.parseInt(operateType1);
		
		String operateTitle = "";

		if(operateType==1){
			operateTitle = "新增线路";
		}else{
			operateTitle = "编辑线路";
			Integer lineInfoId = Integer.parseInt(request.getParameter("lineInfoId"));
			LineInfoPo lineInfoPo = lineInfoFacade.getLineInfoById(lineInfoId);
			
			model.addAttribute("lineInfoPo", lineInfoPo);
		}
		model.addAttribute("operateTitle", operateTitle);
		
		return "template/line/init_line_page";
	}
	
	/**
	 * 新增/编辑线路信息
	 * 
	 * @author luojuan 2017年6月17日
	 * @param request
	 * @param lineModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateLine", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateLine(HttpServletRequest request,LineModel lineModel){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID、用户ID、用户角色
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();

		try {
			jo = lineInfoFacade.addOrUpdateLine(lineModel, userInfoId, userRole);
		} catch (Exception e) {
			log.error("线路信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "线路信息新增失败");
		}
		
		return jo;
	}
	
	/**
	 * 删除线路信息
	 * 
	 * @author luojuan 2017年6月18日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/deleteLineInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteLineInfo(HttpServletRequest request){
		JSONObject jo = null;
		
		// 从session中取出当前用户的用户ID、用户角色
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		
		// 被操作的线路ID
		List<Integer> lineInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("lineInfoIds"))) {
			String lineInfoIds = request.getParameter("lineInfoIds").trim();
			String[] lineArray = lineInfoIds.split(",");
			if(lineArray.length>0){
				for(String lineIdStr : lineArray){
					if(StringUtils.isNotBlank(lineIdStr)){
						lineInfoIdList.add(Integer.valueOf(lineIdStr.trim()));
					}
				}
			}
		}
		
		//所选线路不能为空
		if(CollectionUtils.isEmpty(lineInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选线路不能为空");
			return jo;
		}
		try {
			jo = lineInfoFacade.deleteLineInfo(lineInfoIdList, userInfoId, userRole);
		} catch (Exception e) {
			log.error("线路信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "线路信息删除失败");
		}
		
		return jo;
	}
	
	/**
	 * 启用/停用线路
	 * 
	 * @author luojuan 2017年6月18日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/operateLine", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateLine(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo = null;
		
		// 从session中取出当前用户的用户ID、用户角色
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		
		// 被操作的线路ID
		List<Integer> lineInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("lineInfoIds"))) {
			String lineInfoIds = request.getParameter("lineInfoIds").trim();
			String[] lineArray = lineInfoIds.split(",");
			if(lineArray.length>0){
				for(String lineIdStr : lineArray){
					if(StringUtils.isNotBlank(lineIdStr)){
						lineInfoIdList.add(Integer.valueOf(lineIdStr.trim()));
					}
				}
			}
		}
		
		//所选线路不能为空
		if(CollectionUtils.isEmpty(lineInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选线路不能为空");
			return jo;
		}
		
		// 操作类型 0:启用 1:停用 
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}
		
		try {
			//根据线路ID启用/停用线路
			jo = lineInfoFacade.updateLineStatus(userInfoId, userRole, lineInfoIdList, operateType);
		} catch (Exception e) {
			log.error("启用/停用线路异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "操作线路服务异常，请稍后重试");
		}
		
		return jo;
	}

	/**
	 * 线路信息查询
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/getLineData")
	@ResponseBody
	public List<LineInfoPo> getLineData(HttpServletRequest request, Model model) {
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
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
		//起点
		String startPoints = null;
		if (params.get("startPoints") != null) {
			startPoints = params.get("startPoints").toString();
		}
		
		//终点
		String endPoints = null;
		if (params.get("endPoints") != null) {
			endPoints = params.get("endPoints").toString();
		}
		params.put("startPoints", startPoints);
		params.put("endPoints", endPoints);
		params.put("start", (page - 1) * rows);
		params.put("rows", rows);
		params.put("lineStatus", 0);
		return lineInfoFacade.findLineInfoForPage(params);
	}

	/**
	 * 线路数量查询
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/getLineCount")
	@ResponseBody
	public Integer getLineCount(HttpServletRequest request) {
		Map<String, Object> params = this.paramsToMap(request);
		//起点
		String startPoints = null;
		if (params.get("startPoints") != null) {
			startPoints = params.get("startPoints").toString();
		}
		
		//终点
		String endPoints = null;
		if (params.get("endPoints") != null) {
			endPoints = params.get("endPoints").toString();
		}
		params.put("lineStatus", 0);
		params.put("startPoints", startPoints);
		params.put("endPoints", endPoints);
		return lineInfoFacade.countLineInfoForPage(params);
	}
}
