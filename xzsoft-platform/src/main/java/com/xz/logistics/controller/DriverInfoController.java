package com.xz.logistics.controller;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.dubbo.common.utils.CollectionUtils;
import com.alibaba.fastjson.JSONObject;
import com.xz.common.constances.SysFinal;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.CarInfoFacade;
import com.xz.facade.api.DistributeWaybillFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.CarInfoPo;
import com.xz.model.po.DistributeWaybillPo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.DriverModel;


@Controller
@RequestMapping("/driverInfo")
public class DriverInfoController extends BaseController {
 
	private final Logger log = LoggerFactory.getLogger(getClass());
	@Resource
	private DriverInfoFacade driverInfoFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private DistributeWaybillFacade distributeWaybillFacade;
	@Resource
	private CarInfoFacade carInfoFacade;
	/**
	 * 完善个人信息(个人司机)初始化界面
	 * 
	 * @author luojuan 2017年5月17日
	 * 
	 */
	@RequestMapping("/rootindivdualDriverInitPage")
	public String rootindivdualDriverInitPage(HttpServletRequest request, Model model) {
		// 从session中获取userInfoId(个人司机)和用户权限userRole
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		
		if (userRole == 4) {
			// 根据userInfoId从用户表和司机表中查询数据
			DriverInfo driverInfo = driverInfoFacade.getDriverInfoByUserId(rootOrgInfoId);
			
			model.addAttribute("driverInfo", driverInfo);
		}
		
		return "template/driver/root_driver_info_init_page";
		
	}

	/**
	 * 完善个人信息(个人司机)修改操作
	 * 
	 * @author luojuan 2017年5月19日
	 * @param request
	 * @param driverModel
	 * @return
	 */
	@RequestMapping(value = "/updateRootIndivdualDriver",method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject updateRootIndivdualDriver(HttpServletRequest request, DriverModel driverModel) {
		JSONObject jo = null;
		// 从session中获取userInfoId(个人司机)
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();

		try {
			
			jo = driverInfoFacade.updateIndivdualDriver(driverModel, rootOrgInfoId, userRole);
			
		} catch (Exception e) {
			log.error("个人司机信息添加异常", e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "个人司机信息添加服务繁忙，请稍后重试");
			
		}
		
		return jo;
		
	}
	
	/**
	 * @author zhangshuai  2017年5月31日 上午11:25:30
	 * @param request
	 * @param response
	 * @return
	 * 进入自有司机页面
	 */
	@RequestMapping(value="/ownDriver",produces = "application/json; charset=utf-8")
	public String  ownDriver(HttpServletRequest request,HttpServletResponse response,Model model){
		//从session中获取到登录用户的user_role
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();
		if(userRole!=1 && userRole!=2 && userRole!=5){
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "您不是物流公司或企业货主，不能进行操作！");
			model.addAttribute("content", jo);
			return "template/driver/driver_box_page";
		}
		return "template/driver/own_driver";
	}
	
	/**
	 * @author zhangshuai  2017年5月31日 下午1:05:45
	 * @param request
	 * @param response
	 * 查询(企业/货主)自有司机信息
	 */
	@RequestMapping(value="/findOwnDriver",produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<DriverInfo> findOwnDriver(HttpServletRequest request,HttpServletResponse response){
		
		//从当前登录用户信息取出用户所属组织机构
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=userInfo.getOrgRootId();
		//接收分页参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		String driverName=request.getParameter("driverName");
		String mobilePhone=request.getParameter("mobilePhone");
		String driverStatus1=request.getParameter("driverStatus");
		
		Integer driverType=1;
 			
		//拼接分页模糊全查
		List<DriverInfo> driverInfo=driverInfoFacade.findDriverAll(driverStatus1,orgRootId,currentPage,rows,driverName,mobilePhone,driverType);
		
		//封装车牌号码
		List<Integer> carInfoIds=CommonUtils.getValueList(driverInfo, "carInfo");
		Map<Integer, String> carCodeMap= null;
		if(CollectionUtils.isNotEmpty(carInfoIds)){
			List<CarInfoPo> carInfos=carInfoFacade.findCarCodeNameByIds(carInfoIds);
			if(CollectionUtils.isNotEmpty(carInfos)){
				carCodeMap=CommonUtils.listforMap(carInfos, "id", "carCode");
			}
		}
		
		for(DriverInfo driver:driverInfo){
			
			//封装车牌号码
			if(MapUtils.isNotEmpty(carCodeMap)&&carCodeMap.get(driver.getCarInfo())!=null){
				driver.setCarCode(carCodeMap.get(driver.getCarInfo()));
			}
			
			
			//根据司机ID查询司机信息
			Integer orgInfoIds=null;
			if(driver.getUserInfoId()!=null){
				List<Integer> userIds=new ArrayList<Integer>();
				userIds.add(driver.getUserInfoId());
				List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userIds);
				if(CollectionUtils.isNotEmpty(userInfos)){
					for (UserInfo userInfo2 : userInfos) {
						orgInfoIds=userInfo2.getOrgInfoId();
					}
				}
				
				//根据所属组织ID查询组织名称
				List<Integer> orgIds=new ArrayList<Integer>();
				orgIds.add(orgInfoIds);
				List<OrgInfoPo> orgs=orgInfoFacade.findOrgNameByIds(orgIds);
				if(CollectionUtils.isNotEmpty(orgs)){
					for (OrgInfoPo orgInfoPo : orgs) {
						driver.setOrgName(orgInfoPo.getOrgName());
					}
				}
			}
			
		}
		
		return driverInfo;
			
	}
	
	/**
	 * @author zhangshuai  2017年6月1日 下午12:39:54
	 * @param request
	 * @param response
	 * @return
	 * 获取每次查询记录数
	 */
	@RequestMapping(value="/getCount",produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getCount(HttpServletRequest request,HttpServletResponse response){
		//从当前登录用户信息取出用户所属组织机构
		UserInfo userinfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=userinfo.getOrgRootId();
		//接收参数
		String driverName=request.getParameter("driverName");
		String mobilePhone=request.getParameter("mobilePhone");
		String driverStatus=request.getParameter("driverStatus");
		
		Integer driverType=1;
		Integer count=driverInfoFacade.getCountAll(orgRootId,driverName,mobilePhone,driverStatus,driverType);
		return count;
					
	}
	
	/**
	 * @author zhangshuai  2017年6月1日 下午5:59:21
	 * @param request
	 * @param response
	 * @return
	 * 查询修改司机主机构ID是否与当前用户主机构ID一致
	 */
	@RequestMapping(value="/findDriverRootOrgInfoIdAndUserOrgRootId",produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject findDriverRootOrgInfoIdAndUserOrgRootId(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取当前登录用户的主机构ID
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//获得当前点击司机的ID查询出相对应的主机构ID
		Integer id=Integer.parseInt(request.getParameter("id"));
		Integer sign=Integer.parseInt(request.getParameter("sign"));
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("id", id);
		params.put("sign", sign);
		Integer rootOrgInfoId=driverInfoFacade.findDriverRootOrgInfoId(params);
		OrgInfoPo orgInfoPo = orgInfoFacade.findOrgInfoByIdId(rootOrgInfoId);
		Integer orgRootId=orgInfoPo.getRootOrgInfoId();
		
		
		if(orgRootId.equals(uOrgRootId)){
			jo.put("success", true);
			jo.put("msg", "点击成功");
			return jo;
		}else{
			jo.put("success", false);
			jo.put("msg", "非法操作");
			return jo;
		}
	}
	
	/**
	 * @author zhangshuai  2017年6月1日 下午6:49:45
	 * @param request
	 * @param response
	 * @return
	 * 进入修改自有司机模态框
	 */
	@RequestMapping(value="/updateDriverPage",produces="application/json;charset=utf-8")
	public String updateDriverPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String msg="修改司机信息";
		model.addAttribute("msg",msg);
		return "template/driver/update_own_driver";
		
	}
	
	@RequestMapping(value="/updateTDriverPage",produces="application/json;charset=utf-8")
	public String updateTDriverPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String msg="修改司机信息";
		model.addAttribute("msg",msg);
		return "template/driver/update_temporary_driver";
		
	}
	
	/**
	 * @author zhangshuai  2017年6月2日 下午12:26:35
	 * @param request
	 * @param response
	 * @return
	 * 根据ID回显自有司机信息
	 */
	@RequestMapping(value="/findOwnDriverById",produces="application/json; charset=utf-8")
	@ResponseBody
	public DriverInfo findOwnDriverById(HttpServletRequest request,HttpServletResponse response){
	
		//获取修改自有司机ID
		Integer id=Integer.parseInt(request.getParameter("id"));
		Integer sign=Integer.parseInt(request.getParameter("sign"));
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("id", id);
		params.put("sign", sign);
		//查询信息
		DriverInfo driverInfo=driverInfoFacade.findOwnDriverInfoMationById(params);
		
		//查询车牌号
		if(driverInfo.getCarInfo()!=null){
			List<Integer> carInfoIds=new ArrayList<Integer>();
			carInfoIds.add(driverInfo.getCarInfo());
			List<CarInfoPo> carInfo = carInfoFacade.findCarCodeNameByIds(carInfoIds);
			if(CollectionUtils.isNotEmpty(carInfo)){
				for (CarInfoPo carInfoPo : carInfo) {
					driverInfo.setCarCode(carInfoPo.getCarCode());
				}
			}
			
		}
		
		//查询所属组织
		if(driverInfo.getUserInfoId()!=null){
			Integer orgInfoId=null;
			//根据用户ID查询用户表所属组织机构ID
			List<Integer> useInfoIds=new ArrayList<Integer>();
			useInfoIds.add(driverInfo.getUserInfoId());
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(useInfoIds);
			if(CollectionUtils.isNotEmpty(userInfos)){
				for (UserInfo userInfo : userInfos) {
					orgInfoId=userInfo.getOrgInfoId();
				}
			}
			
			//根据用户所属机构ID查询机构名称
			List<Integer> orgInfoIds=new ArrayList<Integer>();
			orgInfoIds.add(orgInfoId);
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					driverInfo.setOrgName(orgInfoPo.getOrgName());
				}
			}
			
		}
		
		return driverInfo;
		
	}
	
	/**
	 * @author zhangshuai  2017年6月5日 下午5:52:57
	 * @param response
	 * @param request
	 * @return
	 * 修改自有/临时司机信息
	 */
	@RequestMapping(value="/updateOwnDriverInformation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject updateOwnDriverInformation(HttpServletRequest request,HttpServletResponse response,DriverModel driverModel){
		JSONObject jo=new JSONObject();
      
		// 从session中取出当前用户    获取当前修改人的ID
        UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer id=userInfo.getId();
		
        //修改自有司机数据
        try {
			jo=driverInfoFacade.updateOwnDriverInfoMation(driverModel,id);
		} catch (Exception e) {
			
			log.error("修改自有司机信息异常!",e);
			jo.put("success", false);
			jo.put("msg", "修改自有司机信息异常!");
			return jo;
			
		}
        
		return jo;
		
	}
	
	/**
	 * 合作伙伴司机查询初始页
	 * @author chengzhihuan 2017年6月2日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showOutDriverInfoPage")
	public String showOutCarInfoPage(HttpServletRequest request, Model model) {
		return "template/driver/show_out_driver_info_page";
	}
	
	/**
	 * 合作伙伴司机信息查询
	 * @author chengzhihuan 2017年5月31日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/listOutDriverInfo")
	public String listOutDriverInfo(HttpServletRequest request, Model model){
		DataPager<DriverInfo> driverInfoPager = new DataPager<DriverInfo>();
		
		// 从session中取出当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 数据归属编码
		Integer teamCode = null;
		if(userInfo.getUserRole()==SysFinal.USER_ROLE_BUSINESS_OWNERS || userInfo.getUserRole()==SysFinal.USER_ROLE_LOGISTICS_COMPANY){
			//企业货主与物流公司
			teamCode = userInfo.getOrgRootId();
		}else if(userInfo.getUserRole()==SysFinal.USER_ROLE_INDIVIDUAL_OWNERS){
			//个体货主
			teamCode = userInfo.getId();
		}
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		driverInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		driverInfoPager.setSize(rows);
		
		//司机
		String driverName = null;
		if (params.get("driverName") != null) {
			driverName = params.get("driverName").toString();
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
		queryMap.put("originTeamCode", teamCode);
		queryMap.put("driverName", driverName);
		queryMap.put("mobilePhone", mobilePhone);
		
		//3、查询合作伙伴司机总数
		Integer totalNum = driverInfoFacade.countOutDriverInfoForPage(queryMap);
		
		//4、分页查询合作伙伴司机信息
		List<DriverInfo> driverInfoList =driverInfoFacade.findOutDriverInfoForPage(queryMap);
		
		// 5、总数、分页信息封装
		driverInfoPager.setTotal(totalNum);
		driverInfoPager.setRows(driverInfoList);
		model.addAttribute("driverInfoPager", driverInfoPager);
				
		return "template/driver/out_driver_info_data";
	}
	
	/**
	 * @author zhangshuai  2017年6月6日 下午3:23:26
	 * @param request
	 * @param response
	 * @return
	 * 获取当前司机是否启用停用
	 */
	@RequestMapping(value="/findOwnDriverIsAvailable",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer findOwnDriverIsAvailable(HttpServletRequest request,HttpServletResponse response){
		
		Integer id=Integer.parseInt(request.getParameter("id"));
		Integer isAvailable=driverInfoFacade.findIsAvailable(id);
		
		return isAvailable;
		
	}
	
	/**
	 * @author zhangshuai  2017年6月5日 下午1:05:08
	 * @param request
	 * @param response
	 * @return
	 * 修改司机是否启用停用状态
	 */
	@RequestMapping(value="/updateOwnDriverIsAvailable",produces="application/json;charset=utf-8")
    @ResponseBody
	public JSONObject updateOwnDriverIsAvailable(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		Integer available = null;
		Integer id=Integer.parseInt(request.getParameter("id"));
		
		//根据ID获取当前记录的状态
		Integer isAvailable=driverInfoFacade.findIsAvailable(id);
		
		//修改司机状态是否启用
		if(isAvailable==1){
			available=0;
		}else if(isAvailable==0){
			available=1;
		}
		
		//修改司机是否启用状态
		jo=driverInfoFacade.updateOwnDriverIsAvailable(available,id);
		
		return jo;
		
	}
	
	/**
	 * @author zhangshuai  2017年6月5日 下午3:43:50
	 * @param request
	 * @param resp
	 * @return
	 * 进入企业临时司机页面
	 */
	@RequestMapping("/goTemporaryDriver")
	public String goTemporaryDriver(HttpServletRequest request,HttpServletResponse response){
		return "template/driver/temporary_driver";
	}
	
	/**
	 * @author zhangshuai  2017年6月6日 下午7:41:57
	 * @return
	 * 进入添加企业临时司机页面
	 */
	@RequestMapping(value="/addTDriverModel",produces="application/json;charset=utf-8")
	public String addTDriverModel(HttpServletRequest request,HttpServletResponse response,Model model){
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		String operateTitle = "新增企业临时司机";
		
		model.addAttribute("operateTitle",operateTitle);
		
		// 查询该主机构下的所有1级与2级机构信息，按照主键ID正序
		List<OrgInfoPo> orgInfoList = orgInfoFacade.findRootAndTwoLevelOrgInfo(orgRootId);
		model.addAttribute("orgInfoList", orgInfoList);
		
		return "/template/driver/temporary_driver_model";
	}
	
	/**
	 * @author zhangshuai  2017年6月7日 下午3:51:47
	 * @param request
	 * @param response
	 * @param driverModel(前台参数)
	 * @return
	 * 添加企业临时司机信息
	 */
	@RequestMapping(value="/addTDriverInfo",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addTDriverInfo(HttpServletRequest request,HttpServletResponse response,DriverModel driverModel){
		JSONObject jo=new JSONObject();
		//从session总获取当前登录用户的ID，主机构ID，用户角色
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer userInfoId=userInfo.getId();
		Integer orgRootId=userInfo.getOrgRootId();
		Integer userRole=userInfo.getUserRole();
		
		driverModel.getDriverInfo().setOrgInfoId(orgRootId);
		
		
		//添加企业临时司机信息
		try {
			jo=driverInfoFacade.addTDriverInfo(userInfoId,orgRootId,userRole,driverModel);
			return jo;
		} catch (Exception e) {
			
			log.error("添加企业临时司机异常!",e);
			jo.put("success", false);
			jo.put("msg", "添加企业临时司机异常!");
			return jo;
			
		}
	}
	
	/**
	 * @author zhangshuai  2017年6月5日 下午4:35:45
	 * @param request
	 * @param response
	 * @return
	 * 企业临时司机全查
	 */
	@RequestMapping(value="/findAllTDriver",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<DriverInfo> findAllTDriver(HttpServletRequest request,HttpServletResponse response){
		
        //从当前登录用户信息取出用户所属组织机构
		UserInfo userinfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=userinfo.getOrgRootId();
		//接收分页参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		String driverName=request.getParameter("driverName");
		String mobilePhone=request.getParameter("mobilePhone");
		String driverStatus=request.getParameter("driverStatus");
		
		//根据登录用户主机构ID查询所有的子机构id
		List<Integer> orgInfoId=new ArrayList<Integer>();
		List<OrgInfoPo> orgInfos=orgInfoFacade.findOrgInfoIdByOrgRootId(orgRootId);
		for (OrgInfoPo orgInfo : orgInfos) {
			orgInfoId.add(orgInfo.getId());
		}
		Integer driverType=2;
		
		List<DriverInfo> driverInfo=driverInfoFacade.findTDriverAll(driverStatus,orgInfoId,currentPage,rows,driverName,mobilePhone,driverType);
		
		//封装车牌号码
		List<Integer> carInfoIds=CommonUtils.getValueList(driverInfo, "carInfo");
		Map<Integer, String> carCodeMap= null;
		if(CollectionUtils.isNotEmpty(carInfoIds)){
			List<CarInfoPo> carInfos=carInfoFacade.findCarCodeNameByIds(carInfoIds);
			if(CollectionUtils.isNotEmpty(carInfos)){
				carCodeMap=CommonUtils.listforMap(carInfos, "id", "carCode");
			}
		}
		
		//封装所属组织
		List<Integer> orgIds=CommonUtils.getValueList(driverInfo, "rootOrgInfoId");
		Map<Integer, String> orgMap=null;
		if(CollectionUtils.isNotEmpty(orgIds)){
			List<OrgInfoPo> orgs=orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgs)){
				orgMap=CommonUtils.listforMap(orgs, "id", "orgName");
			}
		}
		
		for(DriverInfo driver:driverInfo){
			
			//封装车牌号码
			if(MapUtils.isNotEmpty(carCodeMap)&&carCodeMap.get(driver.getCarInfo())!=null){
				driver.setCarCode(carCodeMap.get(driver.getCarInfo()));
			}
			
			//封装所属组织
			if(MapUtils.isNotEmpty(orgMap)&&orgMap.get(driver.getRootOrgInfoId())!=null){
				driver.setOrgName(orgMap.get(driver.getRootOrgInfoId()));
			}
			
		}
		
		return driverInfo;
	}
	
	/**
	 * @author zhangshuai  2017年6月1日 下午12:39:54
	 * @param request
	 * @param response
	 * @return
	 * 查询临时司机总数
	 */
	@RequestMapping(value="/getTCount",produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getTCount(HttpServletRequest request,HttpServletResponse response){
		 //从当前登录用户信息取出用户所属组织机构
		UserInfo userinfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=userinfo.getOrgRootId();
		//接收参数
		String driverName=request.getParameter("driverName");
		String mobilePhone=request.getParameter("mobilePhone");
		String driverStatus=request.getParameter("driverStatus");
		//根据登录用户主机构ID查询所有的子机构id
		List<Integer> orgInfoId=new ArrayList<Integer>();
		List<OrgInfoPo> orgInfos=orgInfoFacade.findOrgInfoIdByOrgRootId(orgRootId);
		for (OrgInfoPo orgInfo : orgInfos) {
			orgInfoId.add(orgInfo.getId());
		}
		Integer driverType=2;
		
		Integer count=driverInfoFacade.getTDriverCountAll(driverStatus,orgInfoId,driverName,mobilePhone,driverType);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月2日 下午12:26:35
	 * @param request
	 * @param response
	 * @return
	 * 根据ID回显企业临时司机信息
	 */
	@RequestMapping(value="/findTDriverById",produces="application/json; charset=utf-8")
	@ResponseBody
	public DriverInfo findTDriverById(HttpServletRequest request,HttpServletResponse response){
	
		//获取修改自有司机ID
		Integer id=Integer.parseInt(request.getParameter("id"));
		
		//查询信息
		DriverInfo driverInfo=driverInfoFacade.findTDriverInfoMationById(id);
		
		//封装车牌号
		if(driverInfo.getCarInfo()!=null){
			List<Integer> carInfoIds=new ArrayList<Integer>();
			carInfoIds.add(driverInfo.getCarInfo());
			List<CarInfoPo> carInfoPos = carInfoFacade.findCarCodeNameByIds(carInfoIds);
			if(CollectionUtils.isNotEmpty(carInfoPos)){
				for (CarInfoPo carInfoPo : carInfoPos) {
					driverInfo.setCarCode(carInfoPo.getCarCode());
				}
			}
		}
		
		//封装所属机构
		if(driverInfo.getRootOrgInfoId()!=null){
			List<Integer> orgIds=new ArrayList<Integer>();
			orgIds.add(driverInfo.getRootOrgInfoId());
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					driverInfo.setOrgName(orgInfoPo.getOrgName());
				}
			}
		}
		
		return driverInfo;
		
	}
	
	/**
	 * @author zhangshuai  2017年6月9日 下午4:50:45
	 * @param request
	 * @param response
	 * @return
	 * 删除企业临时司机
	 */
	@RequestMapping(value="deleteTDriverInfiMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject deleteTDriverInfiMation(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//接受前台点击ID
		Integer id=Integer.parseInt(request.getParameter("id"));
		
		//判断当前点击临时司机是否与运单表关联
		DistributeWaybillPo distributeWaybill=distributeWaybillFacade.findDistributeWaybillByDriverId(id);
		if(distributeWaybill!=null){
			jo.put("success", false);
			jo.put("msg", "该临时司机目前与运单有关联,无法删除!");
			return jo;
		}
		
		//删除企业临时司机信息
		jo=driverInfoFacade.deleteTDriverInfiMation(id);
		return jo;
		
	}
}
