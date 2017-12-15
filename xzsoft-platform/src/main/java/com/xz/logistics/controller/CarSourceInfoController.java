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
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.CarInfoFacade;
import com.xz.facade.api.CarSourceInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.model.po.CarInfoPo;
import com.xz.model.po.CarSourceInfoPo;
import com.xz.model.po.CarTypePo;
import com.xz.model.po.LocationInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.CarSourceModel;

/**
 * 车源信息管理Contorller
 * 
 * @author luojaun 2017年6月19日
 *
 */
@Controller
@RequestMapping("/carSource")
public class CarSourceInfoController extends BaseController{
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private CarSourceInfoFacade carSourceInfoFacade;
	
	@Resource
	private CarInfoFacade carInfoFacade;
	
	@Resource
	private OrgInfoFacade orgInfoFacade;
	
	@Resource
	private LocationInfoFacade locationInfoFacade;
	
	@Resource
	private DriverInfoFacade driverInfoFacade;
	
	/**
	 * 车源信息管理初始化页面
	 * 
	 * @author luojaun 2017年6月19日
	 */
	@RequestMapping(value = "/rootCarSourceInfolistPage")
	public String rootCarSourceInfolistPage(HttpServletRequest request, Model model){
		List<CarTypePo> carTypeList = carInfoFacade.selectAllCarType();
		model.addAttribute("carTypeList", carTypeList);
		return "template/carSource/show_car_source_info_list_page";
	}
	
	/**
	 * 车源信息查询(分页)
	 * 
	 * @author luojaun 2017年6月20日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showCarSourceInfolistPage")
	public String showCarSourceInfolistPage(HttpServletRequest request, Model model){
		DataPager<CarSourceInfoPo> carSourceInfoPager = new DataPager<CarSourceInfoPo>();
		
		// 从session中取出当前用户的用户ID、用户权限和主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		carSourceInfoPager.setPage(page);
		
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		carSourceInfoPager.setSize(rows);
		
		//车牌号码
		String carCode = null;
		if (params.get("carCode") != null) {
			carCode = params.get("carCode").toString();
		}
		
		//发布方
		String releasePerson = null;
		if (params.get("releasePerson") != null) {
			releasePerson = params.get("releasePerson").toString();
		}
		
		//车辆类型
		String carType = null;
		if (params.get("carType") != null) {
			carType = params.get("carType").toString();
		}
		
		//车源状态（1：已发布 2：已撤回）
		Integer carSourceStatus = null;
		if (params.get("carSourceStatus") != null) {
			carSourceStatus = Integer.valueOf(params.get("carSourceStatus").toString());
		}else{
			carSourceStatus=1;
		}
		
		//发布日期Start
		
		String releaseTimeStartStr = null;
		Date releaseTimeStart = null;
		if(params.get("releaseTimeStart") != null){
			releaseTimeStartStr = params.get("releaseTimeStart").toString();
			
			try {
				releaseTimeStart = new SimpleDateFormat("yyyy-MM-dd").parse(releaseTimeStartStr);
				
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		
		//发布日期End
		String releaseTimeEndStr = null;
		Date releaseTimeEnd = null;
		if(params.get("releaseTimeEnd") != null){
			releaseTimeEndStr = params.get("releaseTimeEnd").toString();
			try {
				releaseTimeEnd = new SimpleDateFormat("yyyy-MM-dd").parse(releaseTimeEndStr);
				
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		
		//截止日期
		Date endTime =Calendar.getInstance().getTime();
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("carCode", carCode);
		queryMap.put("endTime", endTime);
		queryMap.put("carSourceStatus", carSourceStatus);
		queryMap.put("createUser", userInfoId);
		queryMap.put("releasePerson", releasePerson);
		queryMap.put("rootOrgInfoId", rootOrgInfoId);
		queryMap.put("carType", carType);
		queryMap.put("releaseTimeStart", releaseTimeStart);
		queryMap.put("releaseTimeEnd", releaseTimeEnd);
		
		//3、查询车源信息管理总数
		Integer totalNum = carSourceInfoFacade.countCarSourceInfoForPage(queryMap);
		
		//4、分页查询车源信息管理
		List<CarSourceInfoPo> carSourceInfoList = carSourceInfoFacade.findCarSourceInfoForPage(queryMap);
		
		for(CarSourceInfoPo carSourceInfoPo:carSourceInfoList){
			//前台获取车牌号
			/*Integer carCode1 = Integer.parseInt(carSourceInfoPo.getCarCode());
			CarInfoPo carInfoPo = carInfoFacade.getCarInfoById(carCode1);
			carSourceInfoPo.setCarCodeName(carInfoPo.getCarCode());*/
			
			//前台获取地点
			Integer carLocationId = Integer.parseInt(carSourceInfoPo.getCarLocation());
			List<LocationInfoPo> carLocationList = locationInfoFacade.findLocationById(carLocationId);
			String carLocationName = null;
			for(LocationInfoPo locationInfoPo : carLocationList){
				carLocationName = locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty();
			}
			carSourceInfoPo.setCarLocationName(carLocationName);
			
			//前台获取发布方(物流公司和司机)
			if(userRole == 2){
				List<OrgInfoPo> orgInfoList = orgInfoFacade.getOrgInfoByRootOrgInfoIdAndOrgInfoId(carSourceInfoPo.getRootReleasePerson(), carSourceInfoPo.getReleasePerson());
				String orgName = "";
				for(OrgInfoPo orgInfoPo : orgInfoList){
					orgName = orgInfoPo.getOrgName();
				}
				carSourceInfoPo.setReleasePersonName(orgName);
			}else if(userRole == 4){
				 String driverName = driverInfoFacade.getDriverNameByUserInfoId(carSourceInfoPo.getReleasePerson());
				 carSourceInfoPo.setReleasePersonName(driverName);
			}
		}
		
		//5、总数、分页信息封装
		carSourceInfoPager.setTotal(totalNum);
		carSourceInfoPager.setRows(carSourceInfoList);
		model.addAttribute("userRole",userRole);
		model.addAttribute("carSourceInfoPager",carSourceInfoPager);
				
		return "template/carSource/car_source_info_data";
	}
	
	/**
	 * 新增/编辑车源信息初始页
	 * 
	 * @author luojuan 2017年6月20日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initCarSourcePage")
	public String initCarSourcePage(HttpServletRequest request, Model model){
		// 取出操作类型(1:新增 2:编辑)
		String operateType1 = request.getParameter("operateType");
		Integer operateType = Integer.parseInt(operateType1);
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoRootId = userInfo.getOrgRootId();
		Integer userRole = userInfo.getUserRole();
		Integer userInfoId = userInfo.getId();
		
		String operateTitle = "";

		if(operateType==1){
			operateTitle = "新增车源信息";
			if(userRole == 4){
				 String driverName = driverInfoFacade.getDriverNameByUserInfoId(userInfoId);
				 model.addAttribute("rootReleasePersonId", userInfoId);
				 model.addAttribute("rootReleasePersonName", driverName);
			}
		}else{
			operateTitle = "编辑车源信息";
			//修改需查询数据库
			Integer carSourceInfoId = Integer.parseInt(request.getParameter("carSourceInfoId"));
			//如果车源状态是已发布则不允许修改
			CarSourceInfoPo carSourceInfoPo = carSourceInfoFacade.getCarSourceById(carSourceInfoId);
			if(carSourceInfoPo.getCarSourceStatus()==1){
				JSONObject jo = new JSONObject();
				jo.put("success", false);
				jo.put("msg", "车源已发布，不可修改！");
				model.addAttribute("content", carSourceInfoPo.getCarSourceStatus());
				return "template/receivables/prompt_box_page1";
			}
			//前台获取地点
			Integer carLocationId = Integer.parseInt(carSourceInfoPo.getCarLocation());
			List<LocationInfoPo> carLocationList = locationInfoFacade.findLocationById(carLocationId);
			String carLocationName = null;
			for(LocationInfoPo locationInfoPo : carLocationList){
				carLocationName = locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty();
			}
			carSourceInfoPo.setCarLocationName(carLocationName);
			
			model.addAttribute("carSourceInfoPo", carSourceInfoPo);
		}
		model.addAttribute("operateTitle", operateTitle);
		model.addAttribute("userRole", userRole);
		
		//发布方主机构ID和发布方ID为当前登录用户的主机构ID和所属机构ID
		model.addAttribute("rootReleasePerson", orgInfoRootId);
		List<OrgInfoPo> orgList = orgInfoFacade.getOrgInfosByRootOrgInfoId(orgInfoRootId);
		for(OrgInfoPo orgInfoPo:orgList){
			model.addAttribute("rootReleasePersonName", orgInfoPo.getOrgName());
		}
		
		if(userRole == 2){
			// 查询该主机构下的所有1级与2级机构信息，按照主键ID正序
			List<OrgInfoPo> parentOrgInfoList = orgInfoFacade.findRootAndTwoLevelOrgInfo(orgInfoRootId);
			model.addAttribute("parentOrgInfoList", parentOrgInfoList);
		}else if(userRole == 4){
			 String driverName = driverInfoFacade.getDriverNameByUserInfoId(userInfoId);
			 model.addAttribute("driverName",driverName);
			 model.addAttribute("rootReleasePersonName",driverName);
			 model.addAttribute("rootReleasePersonId",userInfoId);
		}else{
			System.out.println("权限不符");
		}
		return "template/carSource/init_car_source_page";
	}
	
	/**
	 * 新增/编辑车源信息
	 * 
	 * @author luojuan 2017年6月20日
	 * @param request
	 * @param carSourceModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateCarSourceInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateCarSourceInfo(HttpServletRequest request,CarSourceModel carSourceModel){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID、用户ID、用户角色
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		
		try {
			jo = carSourceInfoFacade.addOrUpdateCarSourceInfo(carSourceModel, userInfoId, userRole, orgInfoRootId);
		} catch (Exception e) {
			log.error("车源信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "车源信息新增失败");
		}
		return jo;
	}
	
	
	/**
	 * 撤回车源信息
	 * 
	 * @author luojuan 2017年6月21日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/operateCarSource", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateCarSource(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo = null;
		
		// 从session中取出当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		
		// 被操作的车源信息ID
		List<Integer> carSourceInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("carSourceInfoIds"))) {
			String carSourceInfoIds = request.getParameter("carSourceInfoIds").trim();
			String[] carSourceArray = carSourceInfoIds.split(",");
			if(carSourceArray.length>0){
				for(String carSourceIdStr : carSourceArray){
					if(StringUtils.isNotBlank(carSourceIdStr)){
						carSourceInfoIdList.add(Integer.valueOf(carSourceIdStr.trim()));
					}
				}
			}
		}
		
		//所选车源信息不能为空
		if(CollectionUtils.isEmpty(carSourceInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选车源信息不能为空");
			return jo;
		}
		
		// 操作类型 0:启用 1:停用 
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}
		
		try {
			jo = carSourceInfoFacade.updateCarSourceStatus(carSourceInfoIdList, userInfoId, userRole, operateType);
		} catch (Exception e) {
			log.error("撤回车源信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "撤回车源信息服务异常，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * 删除车源信息
	 * 
	 * @author luojaun 2017年6月22日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/deleteCarSourceInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteCarSourceInfo(HttpServletRequest request){
		JSONObject jo = null;
		
		// 从session中取出当前用户的用户ID、用户角色
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		
		// 被操作的车源信息ID
		List<Integer> carSourceInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("carSourceInfoIds"))) {
			String carSourceInfoIds = request.getParameter("carSourceInfoIds").trim();
			String[] carSourceArray = carSourceInfoIds.split(",");
			if(carSourceArray.length>0){
				for(String carSourceIdStr : carSourceArray){
					if(StringUtils.isNotBlank(carSourceIdStr)){
						carSourceInfoIdList.add(Integer.valueOf(carSourceIdStr.trim()));
					}
				}
			}
		}
		
		//所选车源信息不能为空
		if(CollectionUtils.isEmpty(carSourceInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选车源信息不能为空");
			return jo;
		}
		
		try {
			jo = carSourceInfoFacade.deleteCarSourceInfo(carSourceInfoIdList, userInfoId, userRole);
		} catch (Exception e) {
			log.error("车源信息删除异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "车源信息删除失败");
		}
		
		return jo;
	}
	
	/**
	 *车牌号码查询初始化页面
	 */
	@RequestMapping(value = "/searchCarInfoListPage")
	public String searchCarInfoListPage(HttpServletRequest request, Model model){
		return "template/carSource/car_info_page";
	}
	
	/**
	 * 车辆信息查询
	 * 
	 * @author luojuan 2017年6月23日
	 */
	@RequestMapping("/getCarData")
	@ResponseBody
	public List<CarInfoPo> getCarData(HttpServletRequest request, Model model) {
		List<CarInfoPo> carList = null;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		//车牌号码
		String carCode = null;
		if(params.get("carCode") != null){
			carCode = params.get("carCode").toString();
		}
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
		queryMap.put("carCode", carCode);
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		
		//物流公司/司机查询车辆信息
		if(userRole==2){
			//物流公司
			queryMap.put("carPart", 1);
			queryMap.put("rootOrgInfoId", rootOrgInfoId);
		}else if(userRole==4){
			//司机
			queryMap.put("carPart", 3);
			queryMap.put("rootOrgInfoId", userInfo.getId());
		}
		try {
			carList = carInfoFacade.findCarInfoByCarCode(queryMap);
		} catch (Exception e) {
			log.error("车源信息处车辆信息查询异常",e);
		}
		
		return carList;
	}
	

	/**
	 * 车辆信息数量查询
	 * 
	 * @author luojuan 2017年6月23日
	 * @return
	 */
	@RequestMapping("/getCarCount")
	@ResponseBody
	public Integer getCarCount(HttpServletRequest request, Model model) {
		Integer count = null;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		//车牌号码
		String carCode = null;
		if(params.get("carCode") != null){
			carCode = params.get("carCode").toString();
		}
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		
		//物流公司/司机查询车辆信息
		if(userRole==2){
			//物流公司
			queryMap.put("carPart", 1);
			queryMap.put("rootOrgInfoId", rootOrgInfoId);
		}else if(userRole==4){
			//司机
			queryMap.put("carPart", 3);
			queryMap.put("rootOrgInfoId", userInfo.getId());
		}
		try {
			queryMap.put("orgInfoId", orgInfoId);
			queryMap.put("carCode", carCode);
			count = carInfoFacade.countCarSourceSubByCarInfoIdForPage(queryMap);
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return count;
	}
}
