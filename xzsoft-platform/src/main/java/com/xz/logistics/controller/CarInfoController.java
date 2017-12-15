package com.xz.logistics.controller;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
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
import com.xz.common.constances.SysFinal;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.download.DownloadUtil;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.CarInfoFacade;
import com.xz.facade.api.CarTypeFacade;
import com.xz.facade.api.CouponInfoFacade;
import com.xz.facade.api.CouponSupplierInfoFacade;
import com.xz.facade.api.CouponTypeInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.logistics.constances.SysConstances;
import com.xz.logistics.restful.TsClient;
import com.xz.model.po.CarInfoPo;
import com.xz.model.po.CarTypePo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.CarInfoModel;

/**
 * 完善车辆信息（个人司机）
 * 
 * @author luojuan 2017年5月16日
 * 
 */
@Controller
@RequestMapping("/carInfo")
public class CarInfoController extends BaseController {

	private final Logger log = LoggerFactory.getLogger(getClass());

	@Resource
	private CarInfoFacade carInfoFacade;
	@Resource
	private CarTypeFacade carTypeFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;
	@Resource
	private CouponInfoFacade couponInfoFacade;
	@Resource
	private CouponSupplierInfoFacade couponSupplierInfoFacade;
	@Resource
	private CouponTypeInfoFacade couponTypeInfoFacade;
	/**
	 * 完善车辆信息初始化界面（个人司机）
	 * 
	 * @author luojuan 2017年5月16日
	 * 
	 */
	@RequestMapping("/rootCarInfoInitPage")
	public String rootCarInfoInitPage(HttpServletRequest request, Model model) {

		// 从session中获取userId(个人司机)和用户权限userRole
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();

		if (userRole == 4) {
			// userRole=4为个人司机
			// 根据userId从车辆信息表中查询数据
			Map<String, Object> carInfoPo = carInfoFacade.getCarInfoByUserId(rootOrgInfoId);
			List<CarTypePo> carTypeList = carInfoFacade.selectAllCarType();
			model.addAttribute("carTypeList", carTypeList);
			model.addAttribute("carInfoPo", carInfoPo);
		}
		return "template/car/root_car_info_init_page";

	}

	/**
	 * 对车辆信息进行操作（个人司机）
	 */
	@RequestMapping(value = "/addRootCarInfo", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addCarInfo(HttpServletRequest request, CarInfoModel carInfoModel) {

		JSONObject jo = new JSONObject();

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();

		// 根据唯一性判断，如果存在车牌号码就是修改，不然就是新增
		boolean count = carInfoFacade.isExistSameCarCode(rootOrgInfoId);

		if (count) {
			// 新增操作
			try {

				// 增加操作
				jo = carInfoFacade.addCarInfoPo(carInfoModel, rootOrgInfoId, userRole);
				return jo;

			} catch (Exception e) {

				log.error("车辆信息添加异常", e);
				jo.put("success", false);
				jo.put("msg", "车辆信息添加服务繁忙，请稍后重试");
				return jo;

			}

		} else {
			// 修改操作
			try {

				jo = carInfoFacade.updateCarInfoPo(carInfoModel, rootOrgInfoId, userRole);

			} catch (Exception e) {

				log.error("车辆信息修改异常", e);
				jo.put("success", false);
				jo.put("msg", "车辆信息修改服务繁忙，请稍后重试");

			}

			return jo;
		}
	}

	/**
	 * @author zhangshuai 创建时间 2017年5月18日 下午11:34:39
	 * @return 用户进入车辆类型页面
	 */
	@RequestMapping(value = "/accessCarType", produces = "application/json; charset=utf-8")
	public String accessCarType() {

		return "/template/carType/carTypePage";

	}

	/**
	 * @author zhangshuai 创建时间 2017年5月18日 下午11:49:25 进入车辆类型页面后，进行全查方法
	 * @param carTypeId车辆编号(模糊条件)
	 * @param carTypeName车辆类型(模糊条件)
	 */
	@RequestMapping(value = "/findAllCarType", produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<CarTypePo> findAllCarType(HttpServletRequest request, HttpServletResponse response) {

		String carTypeId = request.getParameter("carTypeId");
		String carTypeName = request.getParameter("carTypeName");

		// 当前页数
		String page1 = request.getParameter("page");
		Integer page = Integer.parseInt(page1);
		// 每页尺寸
		String rows1 = request.getParameter("rows");
		Integer rows = Integer.parseInt(rows1);
		Integer currentPage = page * rows;

		List<CarTypePo> carTypeList = carInfoFacade.findAllCarType(carTypeId, carTypeName, currentPage, rows);

		return carTypeList;

	}

	/**
	 * @author zhangshuai 2017年6月1日 上午10:38:54
	 * @param request
	 * @param response
	 * @return 查询总条数
	 */
	@RequestMapping(value = "/getCount", produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getCount(HttpServletRequest request, HttpServletResponse response) {

		String carTypeId = request.getParameter("carTypeId");
		String carTypeName = request.getParameter("carTypeName");

		// 当前页数
		String page1 = request.getParameter("page");
		Integer page = Integer.parseInt(page1);
		// 每页尺寸
		String rows1 = request.getParameter("rows");
		Integer rows = Integer.parseInt(rows1);
		Integer skips = page * rows;

		// 查询数据总数量
		Integer count = carInfoFacade.getcount(carTypeId, carTypeName, skips, rows);

		return count;

	}

	/**
	 * @author zhangshuai 2017年5月31日 上午10:03:06
	 * @param request
	 * @param response
	 * @return 判断当前登录用户是不是平台超级管理员
	 */
	@RequestMapping(value = "findIsSuper", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject findIsSuper(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();

		// 从session中获取登录用户是否是平台管理员
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();

		if (userRole == 6) {

			jo.put("success", true);
			jo.put("msg", "是平台管理员");
			return jo;

		} else {

			jo.put("success", false);
			jo.put("msg", "您不是平台管理员,无权操作此功能!");
			return jo;

		}
	}

	/**
	 * @author zhangshuai 创建时间 2017年5月18日 下午11:29:32
	 * @param request
	 * @param response
	 * @param isSuper超级管理员
	 *            从登录的session中获取登录信息，判断是否为平台管理员 添加车辆类型信息
	 */
	@SuppressWarnings("unused")
	@RequestMapping(value = "/findCarTypeByUserInfoId", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject findCarTypeByUserInfoID(HttpServletRequest request, HttpServletResponse response) {

		JSONObject jo = new JSONObject();
		boolean success = false;
		String msg = "";

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");

		// 从session中获取登录的用户判断是不是平台管理员
		Integer userRole = userInfo.getUserRole();
		// 从session中获取当前登录人员id
		Integer id = userInfo.getId();

		// 用户是超级管理员(拥有新增修改权限)
		String carTypeId = request.getParameter("carTypeId");
		String carTypeName = request.getParameter("carTypeName");
		String remark = request.getParameter("remark");
		Date data = new Date();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String time = sdf.format(data);
		CarTypePo carType = new CarTypePo();
		carType.setCreateUser(id);
		carType.setCarTypeId(carTypeId);
		carType.setCarTypeName(carTypeName);
		carType.setRemark(remark);
		carType.setCreateTime(data);

		// 查询车辆类型信息是否存在
		CarTypePo carTypePo = carInfoFacade.findCarTypeIsExistByCarTypeId(carTypeId);
		// 判断车辆类型信息是否存在
		if (carTypePo != null) {
			jo.put("success", false);
			jo.put("msg", "车辆类型信息已存在，请重新填写车辆类型信息！");
			return jo;
		}

		// 车辆信息不存在
		else {
			if (userRole == 6) {
				jo = carInfoFacade.addCarType(carType);
				return jo;
			}
		}

		jo.put("success", success);
		jo.put("msg", msg);
		return jo;

	}

	/**
	 * @author zhangshuai 创建时间 2017年5月19日 下午3:07:21
	 * @param request
	 * @param response
	 * @return 管理员点击修改按钮查询并回显车辆类型
	 */
	@RequestMapping(value = "/findCarTypeInformation", produces = "application/json; charset=utf-8")
	@ResponseBody
	public CarTypePo updateCarTypeInformation(HttpServletRequest request, HttpServletResponse response) {

		String id1 = request.getParameter("id");
		Integer id = Integer.parseInt(id1);

		// 查询车辆类型回显数据
		CarTypePo carTypePo = carInfoFacade.findCarTypeIsExistById(id);

		return carTypePo;

	}

	/**
	 * @author zhangshuai 创建时间 2017年5月19日 下午4:29:13 接收页面参数修改车辆类型
	 */
	@SuppressWarnings("unused")
	@RequestMapping(value = "/updateCarType", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject updateCarType(HttpServletRequest request, HttpServletResponse response) {

		JSONObject jo = new JSONObject();
		boolean success = false;
		String msg = "";

		Integer id =Integer.parseInt(request.getParameter("id"));
		String carTypeId = request.getParameter("updateCarTypeId");
		String carTypeName = request.getParameter("updateCarTypeName");
		String remark = request.getParameter("remark");

		// 根据car_type_id查询
//		 Integer carTypePoId = carInfoFacade.getCarTypeIsExistByCarTypeId(carTypeId);
//		
//		 if(carTypeId!=null){
//			 if(carTypePoId!=id){
//				    jo.put("success", false);
//					jo.put("msg", "车辆类型信息已存在，请重新填写车辆类型信息！");
//					return jo;
//			 }
//		 }else{
//			 CarTypePo carTypePo = carInfoFacade.findCarTypeIsExistByCarTypeId(carTypeId);
//			// 判断车辆类型信息是否存在
//				if (carTypePo != null) {
//					jo.put("success", false);
//					jo.put("msg", "车辆类型信息已存在，请重新填写车辆类型信息！");
//					return jo;
//				}
//		 }
		 if(id!=null){
			 Integer carTypePoId = carInfoFacade.getCarTypeIsExistByCarTypeId(carTypeId);
			 if(carTypePoId!=null && !carTypePoId.equals(id)){
				   jo.put("success", false);
			    	jo.put("msg", "车辆编号已经存在,请重新输入!");
			    	return jo;
			 }
		 }else{
			 CarTypePo carTypePo = carInfoFacade.findCarTypeIsExistByCarTypeId(carTypeId);
			 if(carTypePo!=null){
				 jo.put("success", false);
		    	 jo.put("msg", "车辆编号已经存在,请重新输入!");
		    	 return jo;
			 }
		 }
		 
		

		Pattern p = Pattern.compile("^[A-Za-z0-9]+$");
		Matcher m = p.matcher(carTypeId);
		if (!m.matches()) {
			jo.put("success", false);
			jo.put("msg", "车辆类型编号只能由数字和字母组成!");
			return jo;
		}

		try {
			CarTypePo carType = new CarTypePo();
			carType.setCarTypeId(carTypeId);
			carType.setCarTypeName(carTypeName);
			carType.setRemark(remark);
			carType.setId(id);

			// 修改车辆信息
			jo = carInfoFacade.updateCarTypeInformation(carType);

			jo.put("success", true);
			jo.put("msg", "修改成功");
			return jo;

		} catch (Exception e) {

			e.printStackTrace();
			log.error("修改异常", e);

		}

		jo.put("success", success);
		jo.put("msg", msg);
		return jo;

	}

	/**
	 * @author zhangshuai 创建时间 2017年5月19日 下午5:15:01
	 * @param request
	 * @param response
	 * @return 删除车辆类型信息(查询车辆类型表car_type和车辆信息表car_info)
	 */
	@SuppressWarnings("unused")
	@RequestMapping(value = "/delCarTypeInformation", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject delCarTypeInformation(HttpServletRequest request, HttpServletResponse response) {

		JSONObject jo = new JSONObject();
		boolean success = false;
		String msg = "";

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");

		String id1 = request.getParameter("id");
		Integer id = Integer.parseInt(id1);

		// 查询car_info和car_type是否有关联
		List<CarInfoPo> carInfo = carInfoFacade.findCarTypeAndCarInfoByCarTypeId(id);

		for (CarInfoPo carInfoPo : carInfo) {
			if (carInfo != null) {
				jo.put("success", false);
				jo.put("msg", "车辆类型信息已有车辆关联，无法删除！");
				return jo;
			}
		}

		// 没有关联，直接删除
		carInfoFacade.delCarTypeAndCarInfoByCarTypeId(id);

		jo.put("success", true);
		jo.put("msg", "删除成功");
		return jo;

	}

	/**
	 * @author zhangshuai 创建时间 2017年5月27日 下午4:33:35
	 * @return 进入添加车辆模态框
	 */
	@RequestMapping(value = "/initCarTypePage", produces = "application/json; charset=utf-8")
	public String initCarTypePage() {

		return "template/carType/carTypeModel";

	}

	/**
	 * @author zhangshuai 创建时间 2017年5月27日 下午4:33:52
	 * @return 进入修改车辆模态框
	 */
	@RequestMapping(value = "/updateCarTypePage", produces = "application/json; charset=utf-8")
	public String updateCarTypePage() {

		return "template/carType/updateCarTypeModel";

	}

	/**
	 * @author zhangshuai 创建时间 2017年5月27日 下午4:34:10
	 * @param request
	 * @param response
	 * @return 根据ID查询车辆类型信息是否存在
	 */
	@RequestMapping(value = "/findCar", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject findCar(HttpServletRequest request, HttpServletResponse response) {

		JSONObject jo = new JSONObject();
		boolean success = false;
		String msg = "";

		String id1 = request.getParameter("id");
		Integer id = Integer.parseInt(id1);
		// 查询车辆类型信息是否存在
		List<CarInfoPo> carInfo = carInfoFacade.findCarTypeAndCarInfoByCarTypeId(id);
		for (CarInfoPo carInfoPo : carInfo) {
			if (carInfoPo != null) {
				jo.put("success", true);
				jo.put("msg", "有数据");
				return jo;
			} else {
				jo.put("success", false);
				jo.put("msg", "无数据");
				return jo;
			}
		}

		jo.put("success", success);
		jo.put("msg", msg);
		return jo;

	}

	/**
	 * 合作伙伴车辆查询初始页
	 * 
	 * @author chengzhihuan 2017年6月2日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showOutCarInfoPage")
	public String showOutCarInfoPage(HttpServletRequest request, Model model) {
		List<CarTypePo> carTypeInfoList = carTypeFacade.findAllCarTypeInfo();
		model.addAttribute("carTypeInfoList", carTypeInfoList);
		return "template/car/show_out_car_info_page";
	}

	/**
	 * 合作伙伴车辆信息查询
	 * 
	 * @author chengzhihuan 2017年5月31日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/listOutCarInfo")
	public String listOutCarInfo(HttpServletRequest request, Model model) {
		DataPager<CarInfoPo> carInfoPager = new DataPager<CarInfoPo>();

		// 从session中取出当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 数据归属编码
		Integer teamCode = null;
		if (userInfo.getUserRole() == SysFinal.USER_ROLE_BUSINESS_OWNERS
				|| userInfo.getUserRole() == SysFinal.USER_ROLE_LOGISTICS_COMPANY) {
			// 企业货主与物流公司
			teamCode = userInfo.getOrgRootId();
		} else if (userInfo.getUserRole() == SysFinal.USER_ROLE_INDIVIDUAL_OWNERS) {
			// 个体货主
			teamCode = userInfo.getId();
		}

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		carInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		carInfoPager.setSize(rows);

		// 车牌号码
		String carCode = null;
		if (params.get("carCode") != null) {
			carCode = params.get("carCode").toString();
		}

		// 车辆类型
		Integer carType = null;
		if (params.get("carType") != null) {
			carType = Integer.valueOf(params.get("carType").toString());
		}

		// 司机
		String driverName = null;
		if (params.get("driverName") != null) {
			driverName = params.get("driverName").toString();
		}

		// 车辆营运状态
		Integer operationStatus = null;
		if (params.get("operationStatus") != null) {
			operationStatus = Integer.valueOf(params.get("operationStatus").toString());
		}

		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("originTeamCode", teamCode);
		queryMap.put("carCode", carCode);
		queryMap.put("carType", carType);
		queryMap.put("driverName", driverName);
		queryMap.put("operationStatus", operationStatus);

		// 3、查询外协车辆总数
		Integer totalNum = carInfoFacade.countOutCarInfoForPage(queryMap);

		// 4、分页查询外协车辆信息
		List<CarInfoPo> carInfoList = carInfoFacade.findOutCarInfoForPage(queryMap);

		// 封装车辆类型名称
		if (CollectionUtils.isNotEmpty(carInfoList)) {
			// 车辆类型ID
			List<Integer> carTypeIds = CommonUtils.getValueList(carInfoList, "carType");
			List<CarTypePo> carTypeList = carTypeFacade.findCarTypeByIds(carTypeIds);
			// key:车辆类型主键 value:车辆类型名称
			Map<Integer, String> carTypeMap = CommonUtils.listforMap(carTypeList, "id", "carTypeName");
			if (MapUtils.isNotEmpty(carTypeMap)) {
				for (CarInfoPo ci : carInfoList) {
					// 封装车辆类型名称
					ci.setCarTypeName(carTypeMap.get(ci.getCarType()));
				}
			}
		}

		// 5、总数、分页信息封装
		carInfoPager.setTotal(totalNum);
		carInfoPager.setRows(carInfoList);
		model.addAttribute("carInfoPager", carInfoPager);

		return "template/car/out_car_info_data";
	}

	/**
	 * 自有车辆查询（分页）
	 * 
	 * @author zhangya 2017年5月31日 下午1:28:54
	 * 
	 */
	@RequiresPermissions("car:ownCar:view")
	@RequestMapping(value = "/initOwnCarInfoPage", produces = "application/json; charset=utf-8")
	public String initOwnCarInfoPage(HttpServletRequest request, Model model) {
		List<CarTypePo> carTypeList = carInfoFacade.selectAllCarType();
		model.addAttribute("carTypeList", carTypeList);
		return "template/car/own_car_info_init_page";
	}

	/**
	 * 自有车辆查询（分页）
	 * 
	 * @author zhangya 2017年5月31日 下午1:28:54
	 * 
	 */
	@RequestMapping(value = "/listOwnCarInfoData", produces = "application/json; charset=utf-8")
	public String ownCarInfoData(HttpServletRequest request, Model model) {

		DataPager<CarInfoPo> carInfoPoPager = new DataPager<CarInfoPo>();

		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		carInfoPoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		carInfoPoPager.setSize(rows);

		// 司机姓名
		String driverName = null;
		if (params.get("driverName") != null) {
			driverName = params.get("driverName").toString();
		}
		// 机动车所有人
		String carPartPerson = null;
		if (params.get("carPartPerson") != null) {
			carPartPerson = params.get("carPartPerson").toString();
		}
		// 车牌号码
		String carCode = null;
		if (params.get("carCode") != null) {
			carCode = params.get("carCode").toString();
		}
		// 车辆类型
		Integer carType = null;
		if (params.get("carType") != null) {
			carType = Integer.valueOf(params.get("carType").toString());

		}
		// 车辆审核状态
		Integer carStatus = null;
		if (params.get("carStatus") != null) {
			carStatus = Integer.valueOf(params.get("carStatus").toString());
		}
		// 车辆营运状态
		Integer operationStatus = null;
		if (params.get("operationStatus") != null) {
			operationStatus = Integer.valueOf(params.get("operationStatus").toString());
		}
		// 车辆调配状态
		Integer allocateStatus = null;
		if (params.get("allocateStatus") != null) {
			allocateStatus = Integer.valueOf(params.get("allocateStatus").toString());
		}
		// 营运证到期日期
		String operationEndTimeStart = null;
		if (params.get("operationEndTimeStart") != null) {
			operationEndTimeStart = params.get("operationEndTimeStart").toString();
		}
		String operationEndTimeEnd = null;
		if (params.get("operationEndTimeEnd") != null) {
			operationEndTimeEnd = params.get("operationEndTimeEnd").toString();
		}
		// 商业险到期日期
		String businessInsuranceEndTimeStart = null;
		if (params.get("businessInsuranceEndTimeStart") != null) {
			businessInsuranceEndTimeStart = params.get("businessInsuranceEndTimeStart").toString();
		}
		String businessInsuranceEndTimeEnd = null;
		if (params.get("businessInsuranceEndTimeEnd") != null) {
			businessInsuranceEndTimeEnd = params.get("businessInsuranceEndTimeEnd").toString();
		}
		// 交强险到期日期
		String trafficInsuranceEndTimeStart = null;
		if (params.get("trafficInsuranceEndTimeStart") != null) {
			trafficInsuranceEndTimeStart = params.get("trafficInsuranceEndTimeStart").toString();
		}
		String trafficInsuranceEndTimeEnd = null;
		if (params.get("trafficInsuranceEndTimeEnd") != null) {
			trafficInsuranceEndTimeEnd = params.get("trafficInsuranceEndTimeEnd").toString();
		}

		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("driverName", driverName);
		queryMap.put("carPartPerson", carPartPerson);
		queryMap.put("carCode", carCode);
		queryMap.put("carType", carType);
		queryMap.put("carStatus", carStatus);
		queryMap.put("operationStatus", operationStatus);
		queryMap.put("allocateStatus", allocateStatus);
		queryMap.put("operationEndTimeStart", operationEndTimeStart);
		queryMap.put("operationEndTimeEnd", operationEndTimeEnd);
		queryMap.put("businessInsuranceEndTimeStart", businessInsuranceEndTimeStart);
		queryMap.put("businessInsuranceEndTimeEnd", businessInsuranceEndTimeEnd);
		queryMap.put("trafficInsuranceEndTimeStart", trafficInsuranceEndTimeStart);
		queryMap.put("trafficInsuranceEndTimeEnd", trafficInsuranceEndTimeEnd);
		// 车辆归属 1：企业内部车 2：企业临时车
		queryMap.put("carPart", 1);
		queryMap.put("rootOrgInfoId", rootOrgInfoId);

		// 3、查询组织信息总数
		Integer totalNum = carInfoFacade.countCarInfoForPage(queryMap);
		//
		// // 4、分页查询组织信息
		List<CarInfoPo> carInfoList = carInfoFacade.findCarInfoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(carInfoList)) {
			// 5、封装车辆类型
			List<Integer> carTypeIds = CommonUtils.getValueList(carInfoList, "carType");
			List<CarTypePo> carTypePoList = null;
			if (CollectionUtils.isNotEmpty(carTypeIds)) {
				carTypePoList = carTypeFacade.findCarTypeByIds(carTypeIds);
			}
			// key:车辆类型ID value:车辆类型名称
			Map<Integer, String> carTypePoMap = null;
			if (CollectionUtils.isNotEmpty(carTypePoList)) {
				carTypePoMap = CommonUtils.listforMap(carTypePoList, "id", "carTypeName");
			}

			// 6、封装使用机构名称
			List<Integer> orgInfoIds = CommonUtils.getValueList(carInfoList, "orgInfoId");
			List<OrgInfoPo> orgInfoPoList = null;
			if (CollectionUtils.isNotEmpty(orgInfoIds)) {
				orgInfoPoList = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			}
			// key:组织机构ID value:组织机构名称
			Map<Integer, String> orgInfoPoMap = null;
			if (CollectionUtils.isNotEmpty(orgInfoPoList)) {
				orgInfoPoMap = CommonUtils.listforMap(orgInfoPoList, "id", "orgName");
			}
			
			//封装车属单位
			List<Integer> carUnits=CommonUtils.getValueList(carInfoList, "carUnit");
			//key：id  value：机构名称
			Map<Integer, String> carUnitNameMap=null;
			if(CollectionUtils.isNotEmpty(carUnits)){
				List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(carUnits);
				if(CollectionUtils.isNotEmpty(orgInfoPos)){
					carUnitNameMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
				}
			}

			//封装司机名称
			List<Integer> carIds=CommonUtils.getValueList(carInfoList, "id");
			//key ：车辆id  value:司机姓名
			Map<Integer, String> driverMap=null;
			//key ：车辆id  value:司机手机号
			Map<Integer, String> mobilePhoneMap=null;
			if(CollectionUtils.isNotEmpty(carIds)){
				List<DriverInfo> driverInfos= driverInfoFacade.findDriverNameByCarInfo(carIds);
				if(CollectionUtils.isNotEmpty(driverInfos)){
					driverMap=CommonUtils.listforMap(driverInfos, "carInfo", "driverName");
					mobilePhoneMap=CommonUtils.listforMap(driverInfos, "carInfo", "mobilePhone");
				}
			}
			
			for (CarInfoPo carInfoPo : carInfoList) {
				// 封装车辆类型
				if (MapUtils.isNotEmpty(carTypePoMap) && carTypePoMap.get(carInfoPo.getCarType()) != null) {
					carInfoPo.setCarTypeName(carTypePoMap.get(carInfoPo.getCarType()));
				}
				//封装车属单位
				if(MapUtils.isNotEmpty(carUnitNameMap)&&carUnitNameMap.get(carInfoPo.getCarUnit())!=null){
					carInfoPo.setCarUnitName(carUnitNameMap.get(carInfoPo.getCarUnit()));
				}
				// 封装司机姓名
				if (MapUtils.isNotEmpty(driverMap) && driverMap.get(carInfoPo.getId()) != null) {
					carInfoPo.setDriverName(driverMap.get(carInfoPo.getId()));
				}
				// 封装司机手机号
				if (MapUtils.isNotEmpty(mobilePhoneMap) && mobilePhoneMap.get(carInfoPo.getId()) != null) {
					carInfoPo.setMobilePhone(mobilePhoneMap.get(carInfoPo.getId()));
				}
				// 封装使用机构名称
				if (MapUtils.isNotEmpty(orgInfoPoMap) && orgInfoPoMap.get(carInfoPo.getOrgInfoId()) != null) {
					carInfoPo.setOrgName(orgInfoPoMap.get(carInfoPo.getOrgInfoId()));
				}
			}
		}
		// 7、总数、分页信息封装
		carInfoPoPager.setTotal(totalNum);
		carInfoPoPager.setRows(carInfoList);
		model.addAttribute("carInfoPoPager", carInfoPoPager);
		return "template/car/own_car_info_data";
	}

	/**
	 * 自有车辆新增编辑页
	 * 
	 * @author zhangya 2017年5月31日 下午1:28:54
	 * 
	 */
	@RequestMapping(value = "/addOrEditCarInfoPage", produces = "application/json; charset=utf-8")
	public String addOrEditCarInfoPage(HttpServletRequest request, Model model) {

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = null;
		if (userInfo != null) {
			// 获取当前操作用户所属主机构id
			rootOrgInfoId = userInfo.getOrgRootId();
		} else {
			return null;
		}

		Map<String, Object> params = this.paramsToMap(request);
		String operaTitle = "";
		CarInfoPo carInfoPo = null;
		if (params.get("carInfoId") != null) {
			Integer carInfoId = Integer.valueOf((String) params.get("carInfoId"));
			carInfoPo = carInfoFacade.getCarInfoById(carInfoId);
			model.addAttribute("carInfoPo", carInfoPo);
			operaTitle = "车辆信息修改";
		} else {
			operaTitle = "车辆信息新增";
		}
		List<OrgInfoPo> orgInfoList = orgInfoFacade.getOrgInfosByRootOrgInfoId(rootOrgInfoId);
		List<OrgInfoPo> orgInfoLists = orgInfoFacade.getOrgInfosByRootOrgInfoIdNoBM(rootOrgInfoId);
		List<CarTypePo> carTypeList = carInfoFacade.selectAllCarType();
		model.addAttribute("operaTitle", operaTitle);
		model.addAttribute("orgInfoList", orgInfoList);
		model.addAttribute("orgInfoLists", orgInfoLists);
		model.addAttribute("carTypeList", carTypeList);
		return "template/car/own_car_info_add_and_edit_page";
	}

	/**
	 * 新增、修改自有车辆信息
	 * 
	 * @author zhangya 2017年6月5日
	 * 
	 */
	@RequestMapping(value = "/addOrUpdateCarInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateCarInfo(HttpServletRequest request, CarInfoModel carInfoModel) {
		JSONObject jo = new JSONObject();
		// 从session中获取用户userId、用户所属主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		try {
			jo = carInfoFacade.addOrUpdateCarInfoPo(carInfoModel, userInfoId, rootOrgInfoId);
		} catch (Exception e) {
			e.printStackTrace();
			jo.put("success", false);
			jo.put("msg", "车辆信息保存异常！");
		}
		return jo;
	}

	/**
	 * 根据车辆ID删除车辆信息
	 * 
	 * @author zhangya 2017年6月1日
	 * 
	 */
	@RequestMapping(value = "deleteCarInfoById", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteCarInfoById(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		Map<String, Object> params = this.paramsToMap(request);
		Integer carInfoId = null;
		if (null != params.get("carInfoId")) {
			carInfoId = Integer.valueOf((String) params.get("carInfoId"));
		} else {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}
		// 车辆归属参数
		Integer carPart = null;
		if (null != params.get("carPart")) {
			carPart = Integer.valueOf((String) params.get("carPart"));
		} else {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆归属信息错误！");
			return jo;
		}
		// 封装参数
		Map<String, Integer> paramsMap = new HashMap<String, Integer>();
		paramsMap.put("carInfoId", carInfoId);
		paramsMap.put("carPart", carPart);
		Integer rootOrgInfoId = null;
		// 根据车辆归属查询车辆信息
		CarInfoPo carInfoPo = carInfoFacade.getCarInfoByIdAndCarPart(paramsMap);
		if (carInfoPo != null) {
			rootOrgInfoId = carInfoPo.getRootOrgInfoId();
		} else {
			jo.put("success", false);
			jo.put("msg", "车辆信息不存在！");
			log.error("车辆信息不存在！");
			return jo;
		}
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (null == userInfo.getOrgRootId()) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}
		
		if (!userInfo.getOrgRootId().equals(rootOrgInfoId)) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆所属主机构与当前用户所属主机构不一致");
			return jo;
		}
		
		if (carInfoPo.getWaybillCount()>0) {
			jo.put("success", false);
			jo.put("msg", "车辆已与运单关联，无法删除！");
			return jo;
		}

		try {
			// 封装删除参数
			Map<String, Object> deleteMap = new HashMap<String, Object>();
			deleteMap.put("carInfoId", carInfoId);
			deleteMap.put("carPart", carPart);
			deleteMap.put("rootOrgInfoId", userInfo.getOrgRootId());
			carInfoFacade.deleteCarInfoById(deleteMap);
			jo.put("success", true);
			jo.put("msg", "删除成功！");
		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", "服务器异常，请稍后重试！");
			e.printStackTrace();
		}
		return jo;
	}

	/**
	 * 校验自有车辆操作权限（审核、调配、变更车辆状态）
	 * 
	 * @author zhangya 2017年6月1日
	 * 
	 */
	@RequestMapping(value = "/checkBeforeOperateCarInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject checkBeforeOperateCarInfo(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		Map<String, Object> params = this.paramsToMap(request);
		Integer carInfoId = null;
		if (null != params.get("carInfoId")) {
			carInfoId = Integer.valueOf((String) params.get("carInfoId"));
		} else {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}
		// 车辆归属参数
		Integer carPart = null;
		if (null != params.get("carPart")) {
			carPart = Integer.valueOf((String) params.get("carPart"));
		} else {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆归属信息错误！");
			return jo;
		}
		// 封装参数
		Map<String, Integer> paramsMap = new HashMap<String, Integer>();
		paramsMap.put("carInfoId", carInfoId);
		paramsMap.put("carPart", carPart);
		Integer rootOrgInfoId = null;
		// 根据车辆归属查询车辆信息
		CarInfoPo carInfoPo = null;
		try {
			carInfoPo = carInfoFacade.getCarInfoByIdAndCarPart(paramsMap);
		} catch (Exception e) {
			e.printStackTrace();
			jo.put("success", false);
			jo.put("msg", "系统忙，请稍后重试！");
			return jo;
		}

		if (carInfoPo != null) {
			rootOrgInfoId = carInfoPo.getRootOrgInfoId();
		} else {
			jo.put("success", false);
			jo.put("msg", "车辆信息不存在！");
			log.error("车辆信息不存在！");
			return jo;
		}
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (null == userInfo.getOrgRootId()) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}

		if (!userInfo.getOrgRootId().equals(rootOrgInfoId)) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆所属主机构与当前用户所属主机构不一致");
			return jo;
		}
		jo.put("success", true);
		jo.put("msg", "校验通过！");
		return jo;
	}

	/**
	 * 批量校验自有车辆操作权限（审核、调配、变更车辆状态）
	 * 
	 * @author zhangya 2017年6月5日
	 */
	@RequestMapping(value = "/batchCheckBeforeOperateCarInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject batchCheckBeforeOperateCarInfo(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		Map<String, Object> params = this.paramsToMap(request);

		// 封装要删除的车辆ID集合
		List<Integer> carInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("carInfoIds"))) {
			String carInfoIds = request.getParameter("carInfoIds").trim();
			String[] carInfoArray = carInfoIds.split(",");
			if (carInfoArray.length > 0) {
				for (String carInfoIdStr : carInfoArray) {
					if (StringUtils.isNotBlank(carInfoIdStr)) {
						carInfoIdList.add(Integer.valueOf(carInfoIdStr.trim()));
					}
				}
			}
		} else {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "请选择要操作的车辆信息！");
			return jo;
		}

		// 车辆归属参数
		Integer carPart = null;
		if (null != params.get("carPart")) {
			carPart = Integer.valueOf((String) params.get("carPart"));
		} else {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆归属信息错误！");
			return jo;
		}
		// 封装参数
		Map<String, Object> paramsMap = new HashMap<String, Object>();
		paramsMap.put("list", carInfoIdList);
		paramsMap.put("carPart", carPart);
		// 根据车辆归属查询车辆信息
		Integer rootOrgInfoId = null;
		try {
			rootOrgInfoId = carInfoFacade.getRootOrgIdByCarIds(paramsMap);
		} catch (Exception e) {
			log.error("批量操作车辆校验异常");
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			e.printStackTrace();
			return jo;
		}

		if (rootOrgInfoId == null) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (null == userInfo.getOrgRootId()) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}

		if (!userInfo.getOrgRootId().equals(rootOrgInfoId)) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆所属主机构与当前用户所属主机构不一致");
			return jo;
		}
		jo.put("success", true);
		jo.put("msg", "校验通过！");
		return jo;
	}

	/**
	 * 根据车辆ID批量删除车辆信息
	 * @author zhangya 2017年6月5日
	 */
	@RequestMapping(value = "/batchDeleteCarInfoByIds", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject batchDeleteCarInfoByIds(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		Map<String, Object> params = this.paramsToMap(request);

		// 封装要删除的车辆ID集合
		List<Integer> carInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("carInfoIds"))) {
			String carInfoIds = request.getParameter("carInfoIds").trim();
			String[] carInfoArray = carInfoIds.split(",");
			if (carInfoArray.length > 0) {
				for (String carInfoIdStr : carInfoArray) {
					if (StringUtils.isNotBlank(carInfoIdStr)) {
						carInfoIdList.add(Integer.valueOf(carInfoIdStr.trim()));
					}
				}
			}
		} else {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "请选择要删除的车辆信息！");
			return jo;
		}

		// 车辆归属参数
		Integer carPart = null;
		if (null != params.get("carPart")) {
			carPart = Integer.valueOf((String) params.get("carPart"));
		} else {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆归属信息错误！");
			return jo;
		} 
		// 封装参数
		Map<String, Object> paramsMap = new HashMap<String, Object>();
		paramsMap.put("list", carInfoIdList);
		paramsMap.put("carPart", carPart);
		
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 根据车辆归属查询车辆信息
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer carRootOrgInfoId = null;
		try {
			carRootOrgInfoId = carInfoFacade.getRootOrgIdByCarIds(paramsMap);
		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("所属主机构错误");
			e.printStackTrace();
			return jo;
		}
		if (rootOrgInfoId == null) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}
		if (!rootOrgInfoId.equals(carRootOrgInfoId)) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆所属主机构与当前用户所属主机构不一致");
			return jo;
		}
		try {
			jo = carInfoFacade.batchDeleteCarInfoByIds(rootOrgInfoId, carInfoIdList, carPart);
		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", "服务器异常，请稍后重试！");
			e.printStackTrace();
		}
		return jo;
	}

	/**
	 * 自有车辆信息审核
	 * 
	 * @author zhangya 2017年6月5日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = { "/auditCarInfo" }, produces = { "application/json; charset=utf-8" })
	@ResponseBody
	public JSONObject auditCarInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();
		Map<String, Object> params = this.paramsToMap(request);

		// 车辆id非空校验
		if (StringUtils.isBlank((String) params.get("carInfoId"))) {
			jo.put("success", false);
			jo.put("msg", "请选择要审核的车辆信息！");
			return jo;
		}

		Integer carInfoId = Integer.valueOf((String) params.get("carInfoId"));
		// 标识企业自有车辆
		Integer carPart = 1;
		// 用于主机构id校验的参数集
		Map<String, Integer> paramsMap = new HashMap<String, Integer>();
		paramsMap.put("carInfoId", carInfoId);
		paramsMap.put("carPart", carPart);
		Integer rootOrgInfoId = null;
		// 根据车辆归属查询车辆信息
		CarInfoPo carInfoPo = carInfoFacade.getCarInfoByIdAndCarPart(paramsMap);
		if (carInfoPo != null) {
			rootOrgInfoId = carInfoPo.getRootOrgInfoId();
		} else {
			jo.put("success", false);
			jo.put("msg", "车辆信息不存在！");
			log.error("车辆信息不存在！");
			return jo;
		}

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (null == userInfo.getOrgRootId()) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}
		// 判断用户主机构ID与车辆主机构是否一致
		if (!userInfo.getOrgRootId().equals(rootOrgInfoId)) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆所属主机构与当前用户所属主机构不一致");
			return jo;
		}
		// 车辆备注信息非空校验
		String remarks = null;
		if (StringUtils.isBlank((String) params.get("remarks"))) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "必须填写");
			return jo;
		} else {
			remarks = (String) params.get("remarks");
		}
		Integer carStatus = Integer.valueOf((String) params.get("carStatus"));
		// 车辆状态
		params.put("remarks", remarks);
		params.put("carStatus", carStatus);
		params.put("carInfoId", carInfoId);
		params.put("updateUser", userInfo.getId());
		params.put("updateTime", Calendar.getInstance().getTime());
		try {
			carInfoFacade.auditCarInfo(params);
			jo.put("success", true);
			jo.put("msg", "审核完成！");
		} catch (Exception e) {
			this.log.error("车辆信息审核异常", e);
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "车辆信息审核服务繁忙，请稍后重试");
		}
		return jo;
	}

	/**
	 * 自有车辆信息批量审核
	 * 
	 * @author zhangya 2017年6月5日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = { "/batchAuditCarInfo" }, produces = { "application/json; charset=utf-8" })
	@ResponseBody
	public JSONObject batchAuditCarInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();
		Map<String, Object> params = this.paramsToMap(request);

		// 封装要删除的车辆ID集合
		List<Integer> carInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("carInfoIds"))) {
			String carInfoIds = request.getParameter("carInfoIds").trim();
			String[] carInfoArray = carInfoIds.split(",");
			if (carInfoArray.length > 0) {
				for (String carInfoIdStr : carInfoArray) {
					if (StringUtils.isNotBlank(carInfoIdStr)) {
						carInfoIdList.add(Integer.valueOf(carInfoIdStr.trim()));
					}
				}
			}
		} else {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "请选择要删除的车辆信息！");
			return jo;
		}

		// 车辆归属参数
		Integer carPart = null;
		if (null != params.get("carPart")) {
			carPart = Integer.valueOf((String) params.get("carPart"));
		} else {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆归属信息错误！");
			return jo;
		}
		// 封装参数
		Map<String, Object> paramsMap = new HashMap<String, Object>();
		paramsMap.put("list", carInfoIdList);
		paramsMap.put("carPart", carPart);
		// 根据车辆归属查询车辆信息
		Integer rootOrgInfoId = null;
		try {
			rootOrgInfoId = carInfoFacade.getRootOrgIdByCarIds(paramsMap);
		} catch (Exception e) {
			log.error("批量删除车辆校验异常");
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			e.printStackTrace();
			return jo;
		}

		if (rootOrgInfoId == null) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (null == userInfo.getOrgRootId()) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}

		if (!userInfo.getOrgRootId().equals(rootOrgInfoId)) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆所属主机构与当前用户所属主机构不一致");
			return jo;
		}
		// 车辆备注信息非空校验
		String remarks = null;
		if (StringUtils.isBlank((String) params.get("remarks"))) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "必须填写");
			return jo;
		} else {
			remarks = (String) params.get("remarks");
		}
		Integer carStatus = Integer.valueOf((String) params.get("carStatus"));
		// 车辆状态
		params.put("remarks", remarks);
		params.put("carStatus", carStatus);
		params.put("list", carInfoIdList);
		params.put("updateUser", userInfo.getId());
		params.put("updateTime", Calendar.getInstance().getTime());
		try {
			carInfoFacade.batchAuditCarInfo(params);
			jo.put("success", true);
			jo.put("msg", "审核完成！");
		} catch (Exception e) {
			this.log.error("车辆信息审核异常", e);
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "车辆信息审核服务繁忙，请稍后重试");
		}
		return jo;
	}

	/**
	 * 自有车辆营运状态变更
	 * 
	 * @author zhangya 2017年6月6日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = { "/changeOperationStatus" }, produces = { "application/json; charset=utf-8" })
	@ResponseBody
	public JSONObject changeOperationStatus(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();
		Map<String, Object> params = this.paramsToMap(request);

		// 车辆id非空校验
		if (StringUtils.isBlank((String) params.get("carInfoId"))) {
			jo.put("success", false);
			jo.put("msg", "请选择要变更的车辆信息！");
			return jo;
		}
		// 车辆归属类型
		if (StringUtils.isBlank((String) params.get("carPart"))) {
			jo.put("success", false);
			jo.put("msg", "请选择确认车辆归属类型！");
			return jo;
		}

		Integer carInfoId = Integer.valueOf((String) params.get("carInfoId"));
		// 标识企业自有车辆
		Integer carPart = Integer.valueOf((String) params.get("carPart"));
		// 用于主机构id校验的参数集
		Map<String, Integer> paramsMap = new HashMap<String, Integer>();
		paramsMap.put("carInfoId", carInfoId);
		paramsMap.put("carPart", carPart);
		Integer rootOrgInfoId = null;
		// 根据车辆归属查询车辆信息
		CarInfoPo carInfoPo = carInfoFacade.getCarInfoByIdAndCarPart(paramsMap);
		if (carInfoPo != null) {
			rootOrgInfoId = carInfoPo.getRootOrgInfoId();
		} else {
			jo.put("success", false);
			jo.put("msg", "车辆信息错误！");
			log.error("车辆信息错误！");
			return jo;
		}

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (null == userInfo.getOrgRootId()) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}
		// 判断用户主机构ID与车辆主机构是否一致
		if (!userInfo.getOrgRootId().equals(rootOrgInfoId)) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆所属主机构与当前用户所属主机构不一致");
			return jo;
		}
		// 车辆状态
		Integer carStatus = carInfoPo.getCarStatus();
		if (carStatus != null) {
			// 状态不为审核通过
			if (carStatus != 2) {
				jo.put("success", false);
				jo.put("msg", "非法操作！");
				return jo;
			}
		} else {
			jo.put("success", false);
			jo.put("msg", "操作的车辆信息无效！");
			return jo;
		}
		// 车辆营运状态
		Integer currentOperationStatus = carInfoPo.getOperationStatus();
		if (currentOperationStatus != null) {
			// 营运状态为满载在途
			if (currentOperationStatus == 2) {
				jo.put("success", false);
				jo.put("msg", "非法操作！");
				return jo;
			}
		} else {
			jo.put("success", false);
			jo.put("msg", "操作的车辆信息无效！");
			return jo;
		}
		// 车辆要变更的营运状态
		if (params.get("operationStatus") == null) {
			jo.put("success", false);
			jo.put("msg", "车辆营运状态变更操作异常！");
			return jo;
		}

		Integer operationStatus = Integer.valueOf((String) params.get("operationStatus"));
		carInfoPo.setOperationStatus(operationStatus);
		carInfoPo.setUpdateUser(userInfo.getId());
		carInfoPo.setUpdateTime(Calendar.getInstance().getTime());
		try {
			carInfoFacade.updateOperationStatus(carInfoPo);
			jo.put("success", true);
			jo.put("msg", "状态已变更！");
		} catch (Exception e) {
			this.log.error("车辆营运状态变更异常", e);
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "车辆营运状态变更服务繁忙，请稍后重试");
		}
		return jo;
	}

	/**
	 * 自有车辆调配
	 * 
	 * @author zhangya 2017年6月6日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = { "/carAllocatePage" }, produces = { "application/json; charset=utf-8" })
	public String carAllocatePage(HttpServletRequest request, Model model) {
		// 获取车辆ID
		Integer carInfoId = Integer.valueOf(request.getParameter("carInfoId"));
		CarInfoPo carInfoPo = carInfoFacade.getCarInfoById(carInfoId);
		// 获取原司机信息
		DriverInfo originDriverInfo = driverInfoFacade.getDriverInfoByCarInfoId(carInfoId);
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("rootOrgInfoId", rootOrgInfoId);
		params.put("driverType", 1);
		// 获取可调配的司机集合
		List<DriverInfo> driverInfoList = driverInfoFacade.findDriverInfosByRootOrgInfoId(params);
		model.addAttribute("carInfoPo", carInfoPo);
		model.addAttribute("originDriverInfo", originDriverInfo);
		model.addAttribute("driverInfoList", driverInfoList);
		return "template/car/car_allocate_page";
	}

	/**
	 * 自有车辆调配
	 * 
	 * @author zhangya 2017年6月6日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = { "/checkBeforeAllocate" }, produces = { "application/json; charset=utf-8" })
	@ResponseBody
	public JSONObject checkBeforeAllocate(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();
		Map<String, Object> params = this.paramsToMap(request);

		// 车辆id非空校验
		if (StringUtils.isBlank((String) params.get("carInfoId"))) {
			jo.put("success", false);
			jo.put("msg", "请选择要调配的车辆信息！");
			return jo;
		}

		Integer carInfoId = Integer.valueOf((String) params.get("carInfoId"));
		// 标识企业自有车辆
		Integer carPart = 1;
		// 用于主机构id校验的参数集
		Map<String, Integer> paramsMap = new HashMap<String, Integer>();
		paramsMap.put("carInfoId", carInfoId);
		paramsMap.put("carPart", carPart);
		Integer rootOrgInfoId = null;
		// 根据车辆归属查询车辆信息
		CarInfoPo carInfoPo = carInfoFacade.getCarInfoByIdAndCarPart(paramsMap);
		if (carInfoPo != null) {
			rootOrgInfoId = carInfoPo.getRootOrgInfoId();
		} else {
			jo.put("success", false);
			jo.put("msg", "车辆信息不存在！");
			log.error("车辆信息不存在！");
			return jo;
		}

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (null == userInfo.getOrgRootId()) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("无所属主机构");
			return jo;
		}
		// 判断用户主机构ID与车辆主机构是否一致
		if (!userInfo.getOrgRootId().equals(rootOrgInfoId)) {
			jo.put("success", false);
			jo.put("msg", "非法操作！");
			log.error("车辆所属主机构与当前用户所属主机构不一致");
			return jo;
		}
		// 车辆状态
		Integer carStatus = carInfoPo.getCarStatus();
		if (carStatus != null) {
			// 状态不为审核通过
			if (carStatus != 2) {
				jo.put("success", false);
				jo.put("msg", "非法操作！");
				return jo;
			}
		} else {
			jo.put("success", false);
			jo.put("msg", "操作的车辆信息无效！");
			return jo;
		}
		jo.put("success", true);
		jo.put("msg", "校验通过！");
		return jo;
	}

	/**
	 * 车辆调配操作提交
	 * @author zhangya 2017年5月31日 下午1:28:54
	 */
	@RequestMapping(value = "/carAllocate", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject carAllocate(HttpServletRequest request) {
		// 获取当前用户信息
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = null;
		Integer rootOrgInfoId = null;
		JSONObject jo = null;
		if (userInfo != null) {
			// 获取当前操作用户所属主机构id
			rootOrgInfoId = userInfo.getOrgRootId();
			userInfoId = userInfo.getId();
		} else {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "用户未登录！");
			return jo;
		}
		Map<String, Object> params = this.paramsToMap(request);
		try {
			jo = carInfoFacade.carAllocate(params, userInfoId, rootOrgInfoId);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "车辆调配操作异常！");
		}
		return jo;
	}

	/**
	 * 临时车辆查询（分页）
	 * 
	 * @author zhangya 2017年5月31日 下午1:28:54
	 * 
	 */
	@RequiresPermissions("car:tempCar:view")
	@RequestMapping(value = "/initTempCarInfoPage", produces = "application/json; charset=utf-8")
	public String initTempCarInfoPage(HttpServletRequest request, Model model) {
		List<CarTypePo> carTypeList = carInfoFacade.selectAllCarType();
		model.addAttribute("carTypeList", carTypeList);
		return "template/car/temp_car_info_init_page";
	}

	/**
	 * 自有车辆查询（分页）
	 * 
	 * @author zhangya 2017年5月31日 下午1:28:54
	 * 
	 */
	@RequestMapping(value = "/listTempCarInfoData", produces = "application/json; charset=utf-8")
	public String listTempCarInfoData(HttpServletRequest request, Model model) {

		DataPager<CarInfoPo> carInfoPoPager = new DataPager<CarInfoPo>();

		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		carInfoPoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		carInfoPoPager.setSize(rows);

		// 司机姓名
		String driverName = null;
		if (params.get("driverName") != null) {
			driverName = params.get("driverName").toString();
		}
		// 机动车所有人
		String carPartPerson = null;
		if (params.get("carPartPerson") != null) {
			carPartPerson = params.get("carPartPerson").toString();
		}
		// 车牌号码
		String carCode = null;
		if (params.get("carCode") != null) {
			carCode = params.get("carCode").toString();
		}
		// 车辆类型
		Integer carType = null;
		if (params.get("carType") != null) {
			carType = Integer.valueOf(params.get("carType").toString());

		}
		// 车辆审核状态
		Integer carStatus = null;
		if (params.get("carStatus") != null) {
			carStatus = Integer.valueOf(params.get("carStatus").toString());
		}
		// 车辆营运状态
		Integer operationStatus = null;
		if (params.get("operationStatus") != null) {
			operationStatus = Integer.valueOf(params.get("operationStatus").toString());
		}
		// 车辆调配状态
		Integer allocateStatus = null;
		if (params.get("allocateStatus") != null) {
			allocateStatus = Integer.valueOf(params.get("allocateStatus").toString());
		}
		// 营运证到期日期
		String operationEndTimeStart = null;
		if (params.get("operationEndTimeStart") != null) {
			operationEndTimeStart = params.get("operationEndTimeStart").toString();
		}
		String operationEndTimeEnd = null;
		if (params.get("operationEndTimeEnd") != null) {
			operationEndTimeEnd = params.get("operationEndTimeEnd").toString();
		}
		// 商业险到期日期
		String businessInsuranceEndTimeStart = null;
		if (params.get("businessInsuranceEndTimeStart") != null) {
			businessInsuranceEndTimeStart = params.get("businessInsuranceEndTimeStart").toString();
		}
		String businessInsuranceEndTimeEnd = null;
		if (params.get("businessInsuranceEndTimeEnd") != null) {
			businessInsuranceEndTimeEnd = params.get("businessInsuranceEndTimeEnd").toString();
		}
		// 交强险到期日期
		String trafficInsuranceEndTimeStart = null;
		if (params.get("trafficInsuranceEndTimeStart") != null) {
			trafficInsuranceEndTimeStart = params.get("trafficInsuranceEndTimeStart").toString();
		}
		String trafficInsuranceEndTimeEnd = null;
		if (params.get("trafficInsuranceEndTimeEnd") != null) {
			trafficInsuranceEndTimeEnd = params.get("trafficInsuranceEndTimeEnd").toString();
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("driverName", driverName);
		queryMap.put("carPartPerson", carPartPerson);
		queryMap.put("carCode", carCode);
		queryMap.put("carType", carType);
		queryMap.put("carStatus", carStatus);
		queryMap.put("operationStatus", operationStatus);
		queryMap.put("allocateStatus", allocateStatus);
		queryMap.put("operationEndTimeStart", operationEndTimeStart);
		queryMap.put("operationEndTimeEnd", operationEndTimeEnd);
		queryMap.put("businessInsuranceEndTimeStart", businessInsuranceEndTimeStart);
		queryMap.put("businessInsuranceEndTimeEnd", businessInsuranceEndTimeEnd);
		queryMap.put("trafficInsuranceEndTimeStart", trafficInsuranceEndTimeStart);
		queryMap.put("trafficInsuranceEndTimeEnd", trafficInsuranceEndTimeEnd);
		// 车辆归属 1：企业内部车 2：企业临时车
		queryMap.put("carPart", 2);
		queryMap.put("rootOrgInfoId", rootOrgInfoId);

		// 3、查询组织信息总数
		Integer totalNum = carInfoFacade.countCarInfoForPage(queryMap);
		//
		// // 4、分页查询组织信息
		List<CarInfoPo> carInfoList = carInfoFacade.findCarInfoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(carInfoList)) {
			// 5、封装车辆类型
			List<Integer> carTypeIds = CommonUtils.getValueList(carInfoList, "carType");
			List<CarTypePo> carTypePoList = null;
			if (CollectionUtils.isNotEmpty(carTypeIds)) {
				carTypePoList = carTypeFacade.findCarTypeByIds(carTypeIds);
			}
			// key:车辆类型ID value:车辆类型名称
			Map<Integer, String> carTypePoMap = null;
			if (CollectionUtils.isNotEmpty(carTypePoList)) {
				carTypePoMap = CommonUtils.listforMap(carTypePoList, "id", "carTypeName");
			}

			// 6、封装使用机构名称
			List<Integer> orgInfoIds = CommonUtils.getValueList(carInfoList, "orgInfoId");
			List<OrgInfoPo> orgInfoPoList = null;
			if (CollectionUtils.isNotEmpty(orgInfoIds)) {
				orgInfoPoList = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			}
			// key:组织机构ID value:组织机构名称
			Map<Integer, String> orgInfoPoMap = null;
			if (CollectionUtils.isNotEmpty(orgInfoPoList)) {
				orgInfoPoMap = CommonUtils.listforMap(orgInfoPoList, "id", "orgName");
			}

			//封装司机名称
			List<Integer> carIds=CommonUtils.getValueList(carInfoList, "id");
			//key ：车辆id  value:司机姓名
			Map<Integer, String> driverMap=null;
			//key ：车辆id  value:司机手机号
			Map<Integer, String> mobilePhoneMap=null;
			if(CollectionUtils.isNotEmpty(carIds)){
				List<DriverInfo> driverInfos= driverInfoFacade.findDriverNameByCarInfo(carIds);
				if(CollectionUtils.isNotEmpty(driverInfos)){
					driverMap=CommonUtils.listforMap(driverInfos, "carInfo", "driverName");
					mobilePhoneMap=CommonUtils.listforMap(driverInfos, "carInfo", "mobilePhone");
				}
			}
			
			for (CarInfoPo carInfoPo : carInfoList) {
				// 封装车辆类型
				if (MapUtils.isNotEmpty(carTypePoMap) && carTypePoMap.get(carInfoPo.getCarType()) != null) {
					carInfoPo.setCarTypeName(carTypePoMap.get(carInfoPo.getCarType()));
				}
				// 封装使用机构名称
				if (MapUtils.isNotEmpty(orgInfoPoMap) && orgInfoPoMap.get(carInfoPo.getOrgInfoId()) != null) {
					carInfoPo.setOrgName(orgInfoPoMap.get(carInfoPo.getOrgInfoId()));
				}
				// 封装司机姓名
				if (MapUtils.isNotEmpty(driverMap) && driverMap.get(carInfoPo.getId()) != null) {
					carInfoPo.setDriverName(driverMap.get(carInfoPo.getId()));
				}
				// 封装司机手机号
				if (MapUtils.isNotEmpty(mobilePhoneMap) && mobilePhoneMap.get(carInfoPo.getId()) != null) {
					carInfoPo.setMobilePhone(mobilePhoneMap.get(carInfoPo.getId()));
				}
			}
		}
		// 7、总数、分页信息封装
		carInfoPoPager.setTotal(totalNum);
		carInfoPoPager.setRows(carInfoList);
		model.addAttribute("carInfoPoPager", carInfoPoPager);
		return "template/car/temp_car_info_data";
	}

	/**
	 * 临时车辆新增编辑页
	 * 
	 * @author zhangya 2017年5月31日 下午1:28:54
	 * 
	 */
	@RequestMapping(value = "/addOrEditTempCarInfoPage", produces = "application/json; charset=utf-8")
	public String addOrEditTempCarInfoPage(HttpServletRequest request, Model model) {

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = null;
		if (userInfo != null) {
			// 获取当前操作用户所属主机构id
			rootOrgInfoId = userInfo.getOrgRootId();
		} else {
			return null;
		}

		Map<String, Object> params = this.paramsToMap(request);
		String operaTitle = "";
		CarInfoPo carInfoPo = null;
		if (params.get("carInfoId") != null) {
			Integer carInfoId = Integer.valueOf((String) params.get("carInfoId"));
			carInfoPo = carInfoFacade.getCarInfoById(carInfoId);
			model.addAttribute("carInfoPo", carInfoPo);
			operaTitle = "临时车辆信息修改";
			//判断是否有关联的运单，如果有修改页面的车牌号码不能修改  2017.08.24
			if(carInfoPo.getWaybillCount()>0){
				model.addAttribute("isCarCodeReadonly", 1);
			}
		} else {
			operaTitle = "临时车辆信息新增";
		}
		Map<String, Object> paramMap = new HashMap<String, Object>();
//		paramMap.put("rootOrgInfoId", rootOrgInfoId);
//		paramMap.put("driverType", 2);
//		List<DriverInfo> tempDriverInfoList = driverInfoFacade.findDriverInfosByRootOrgInfoId(paramMap);
		List<CarTypePo> carTypeList = carInfoFacade.selectAllCarType();
		model.addAttribute("operaTitle", operaTitle);
		model.addAttribute("carTypeList", carTypeList);
//		model.addAttribute("tempDriverInfoList", tempDriverInfoList);
		return "template/car/temp_car_info_add_and_edit_page";
	}

	/**
	 * 新增、修改临时车辆信息
	 * 
	 * @author zhangya 2017年6月5日
	 */
	@RequestMapping(value = "/addOrUpdateTempCarInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateTempCarInfo(HttpServletRequest request, CarInfoModel carInfoModel) {
		JSONObject jo = new JSONObject();
		// 从session中获取用户userId、用户所属主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		try {
			jo = carInfoFacade.addOrUpdateTempCarInfoPo(carInfoModel, userInfoId, rootOrgInfoId);
		} catch (Exception e) {
			e.printStackTrace();
			jo.put("success", false);
			jo.put("msg", "车辆信息保存异常！");
		}
		return jo;
	}
	
	/**
	 * 
	 * @Title: getCarInfoById  
	 * @Description: TODO(这里用一句话描述这个方法的作用)
	 * @author zhenghaiayng 2017年10月11日 
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/getCarInfoById", produces = "application/json; charset=utf-8")
	@ResponseBody
	public CarInfoPo getCarInfoById(HttpServletRequest request){
		
		Integer carInfoId = null;
		if (request.getParameter("carInfoId") != null) {
			carInfoId = Integer.valueOf(request.getParameter("carInfoId").toString());
		}
		
		CarInfoPo carInfo = carInfoFacade.getCarInfoById(carInfoId);
		return carInfo;
	}
	

	/**
	 * @Title: downCarImg  
	 * @Description: 下载车载影像
	 * @author zhenghaiayng 2017年10月11日 
	 * @param request
	 * @param response
	 * @throws UnsupportedEncodingException 
	 */
	@RequestMapping(value = "/downCarImg", method = RequestMethod.POST)
	public void downCarImg(HttpServletRequest request, HttpServletResponse response) throws Exception {
		/*
		Integer carInfoId = null;
		if (request.getParameter("carInfoId") != null) {
			carInfoId = Integer.valueOf(request.getParameter("carInfoId").toString());
		} else {
			
		}
		carInfoId = 103971;
		CarInfoPo carInfo = carInfoFacade.getCarInfoById(carInfoId);

		// 车牌号
		String carCode = carInfo.getCarCode();
		
		// 营运证附件
		String operation_cert_img = carInfo.getOperationCertImg();
		String filePath1 = SysConstances.CONN_MAP.get("FASTDFS_SERVER") +"/"+ operation_cert_img;
		
		// // 司机行驶证附件(正本)
		String driver_license_img = carInfo.getDriverLicenseImg();
		String filePath2 = SysConstances.CONN_MAP.get("FASTDFS_SERVER") +"/"+ driver_license_img;
		
		// // 司机行驶证附件(副本)
		String driver_license_img_copy = carInfo.getDriverLicenseImgCopy();
		String filePath3 = SysConstances.CONN_MAP.get("FASTDFS_SERVER") +"/"+ driver_license_img;
		try {
        	// 111111111111111
        	URL url = new URL(filePath1);
            //打开链接  
            HttpURLConnection conn = (HttpURLConnection)url.openConnection();
            //设置请求方式为"GET"  
            conn.setRequestMethod("GET");
            //超时响应时间为5秒  
            conn.setConnectTimeout(5 * 1000);
            //通过输入流获取图片数据  
            InputStream inStream = conn.getInputStream();
            //得到图片的二进制数据，以二进制封装得到数据，具有通用性  
            byte[] data = DownloadUtil.readInputStream(inStream);
            
            // 名称编码
            String iso_filename = DownloadUtil.parseGBK(carCode);
            response.setContentType("application/octet-stream");
    		response.setContentLength(data.length);
    		response.setHeader("Content-Disposition","attachment;filename="+iso_filename+".png");
    		response.getOutputStream().write(data);
    		response.getOutputStream().flush();
    		
    		// 222222222222222222
    		url = new URL(filePath1);
            //打开链接  
            conn = (HttpURLConnection)url.openConnection();
            //设置请求方式为"GET"  
            conn.setRequestMethod("GET");
            //超时响应时间为5秒  
            conn.setConnectTimeout(5 * 1000);
            //通过输入流获取图片数据  
            inStream = conn.getInputStream();
            //得到图片的二进制数据，以二进制封装得到数据，具有通用性  
            data = DownloadUtil.readInputStream(inStream);
            
            // 名称编码
            iso_filename = DownloadUtil.parseGBK(carCode);
//            response.setContentType("application/octet-stream");
//    		response.setContentLength(data.length);
//    		response.setHeader("Content-Disposition","attachment;filename="+iso_filename+".png");
    		response.getOutputStream().write(data);
    		response.getOutputStream().flush();
    		
    		// 333333333333
    		url = new URL(filePath1);
            //打开链接  
            conn = (HttpURLConnection)url.openConnection();
            //设置请求方式为"GET"  
            conn.setRequestMethod("GET");
            //超时响应时间为5秒  
            conn.setConnectTimeout(5 * 1000);
            //通过输入流获取图片数据  
            inStream = conn.getInputStream();
            //得到图片的二进制数据，以二进制封装得到数据，具有通用性  
            data = DownloadUtil.readInputStream(inStream);
            
            // 名称编码
            iso_filename = DownloadUtil.parseGBK(carCode);
//            response.setContentType("application/octet-stream");
//    		response.setContentLength(data.length);
//    		response.setHeader("Content-Disposition","attachment;filename="+iso_filename+".png");
    		response.getOutputStream().write(data);
    		response.getOutputStream().flush();
    		

        } catch (Exception e) {
            e.printStackTrace();
        }
		*/
 

		String path = SysConstances.CONN_MAP.get("FASTDFS_SERVER") +"/"+ request.getParameter("path");
		String filename = request.getParameter("filename");
		System.out.println(path);
		System.out.println(filename);
        // 目标远程服务器文件地址
        //String path = GlobalConfig.getImgServer() + "/" + fileDir;
        try {
        	
        	URL url = new URL(path);
            //打开链接  
            HttpURLConnection conn = (HttpURLConnection)url.openConnection();
            //设置请求方式为"GET"  
            conn.setRequestMethod("GET");
            //超时响应时间为5秒  
            conn.setConnectTimeout(5 * 1000);
            //通过输入流获取图片数据  
            InputStream inStream = conn.getInputStream();
            //得到图片的二进制数据，以二进制封装得到数据，具有通用性  
            byte[] data = DownloadUtil.readInputStream(inStream);
            
            
            String iso_filename = DownloadUtil.parseGBK(filename);
            //response.setContentType("application/x-jpg");
            response.setContentType("application/octet-stream");
    		response.setContentLength(data.length);
    		response.setHeader("Content-Disposition","attachment;filename="+iso_filename+".jpg");
    		response.getOutputStream().write(data);
    		response.getOutputStream().flush();

        } catch (Exception e) {
            e.printStackTrace();
        }

		
		
		
	}
	
	/**
	 * 查询临时司机信息初始页
	 * @author jiangweiwei
	 * @date 2017年10月13日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showTempDriverInfoPage")
	public String showTempDriverInfoPage(HttpServletRequest request, Model model) {
		DataPager<DriverInfo> driverInfoPager = new DataPager<DriverInfo>();
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		// 获取并处理参数
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
		// 司机名称
		String driverName = null;
		if (params.get("driverName") != null) {
			driverName = params.get("driverName").toString();
		}
		// 封装参数
//		Map<String, Object> queryMap = new HashMap<String, Object>();
//		queryMap.put("start", (page - 1) * rows);
//		queryMap.put("rows", rows);
//		queryMap.put("orgRootId", orgRootId);
//		queryMap.put("driverName", driverName);
		//司机状态(0:未分配 1:已分配)
		String driverStatus = "0";
		//司机手机号
		String mobilePhone = "";
		//司机类型
		Integer driverType = 2;
		// 查询有司机信息总数
		Integer	totalNum = driverInfoFacade.getCountAll(orgRootId,driverName,mobilePhone,driverStatus,driverType);
		// 分页查询企业临时司机信息
		List<DriverInfo> driverInfoList = driverInfoFacade.findDriverAll(driverStatus,orgRootId,(page - 1) * rows,rows,driverName,mobilePhone,driverType);
		// 总数、分页信息封装
		driverInfoPager.setTotal(totalNum);
		driverInfoPager.setRows(driverInfoList);
		model.addAttribute("driverInfoPager", driverInfoPager);
		return "template/car/show_temp_driver_info_page";
	}
	
	
	
	/**
	 * 根据车牌号验证车辆入网信息及车辆信息（营运证等）
	 * @author yuewei 2017年10月16日
	 */
	@RequestMapping(value = "/checkVehicleInformation", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject checkVehicleInformation(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		TsClient ts = new TsClient();
		Map<String, Object> params = this.paramsToMap(request);
		String carCode = params.get("carCode").toString(); // 车牌号
		if (carCode != null) {
			try {
				jo = ts.checkVehicleInfo(carCode); // 车辆信息校验
			} catch (IOException e) {
				jo.put("success", false);
				jo.put("msg", "车辆信息校验异常");
			} // 车辆校验返回结果

		}

		else {
			jo.put("success", false);
			jo.put("msg", "请 填写车牌号");
		}
		return jo;
	}

}
