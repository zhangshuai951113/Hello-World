package com.xz.logistics.controller;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.mail.internet.MimeUtility;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.autocover.AutoCoverUtils;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.date.DateUtils;
import com.xz.common.utils.fastdfs.FastdfsClientUtil;
import com.xz.common.utils.md5.MD5Utils;
import com.xz.common.utils.pager.DataPager;
import com.xz.common.utils.poi.POIExcelUtil;
import com.xz.common.utils.redis.RedisUtil;
import com.xz.facade.api.CarInfoFacade;
import com.xz.facade.api.ContractInfoFacade;
import com.xz.facade.api.CouponInfoFacade;
import com.xz.facade.api.CouponTypeInfoFacade;
import com.xz.facade.api.CouponUseInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.DriverWaybillImgDetailInfoFacade;
import com.xz.facade.api.DriverWaybillMaintainPoFacade;
import com.xz.facade.api.EnterpriseUserInfoFacade;
import com.xz.facade.api.FormulaDetailInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.facade.api.LossDeductionFacade;
import com.xz.facade.api.OrgDetailInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.PartnerInfoFacade;
import com.xz.facade.api.ProjectInfoFacade;
import com.xz.facade.api.SettlementCouponUseFacade;
import com.xz.facade.api.SettlementFormulaDetailFacade;
import com.xz.facade.api.SettlementFormulaFacade;
import com.xz.facade.api.SettlementInfoFacade;
import com.xz.facade.api.SettlementReviseFacade;
import com.xz.facade.api.TransportPriceFacade;
import com.xz.facade.api.UserDataAuthFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.model.po.CarInfoPo;
import com.xz.model.po.ContractInfo;
import com.xz.model.po.CouponTypeInfo;
import com.xz.model.po.CouponUseInfo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.DriverWaybillImgDetailInfo;
import com.xz.model.po.DriverWaybillMaintainPo;
import com.xz.model.po.EnterpriseUserInfo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.LocationInfoPo;
import com.xz.model.po.LossDeduction;
import com.xz.model.po.OrgDetailInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.ProjectInfoPo;
import com.xz.model.po.SettlementAuditLog;
import com.xz.model.po.SettlementCouponUse;
import com.xz.model.po.SettlementFormulaDetailPo;
import com.xz.model.po.SettlementFormulaPo;
import com.xz.model.po.SettlementInfo;
import com.xz.model.po.SettlementRevisePo;
import com.xz.model.po.TransportPrice;
import com.xz.model.po.UserDataAuthPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillInfoPo;
import com.xz.model.vo.SettlementModel;
/**
 * @ClassName SettlementLossesController
 * @Description 结算信息业务控制层
 * @author zhangbo
 * @date 2017/07/05 17:21
 */
@Controller
@RequestMapping("/settlementInfo")
public class SettlementLossesController extends BaseController {
	
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private SettlementInfoFacade settlementInfoFacade;

	@Resource
	private CouponUseInfoFacade couponUseInfoFacade;

	@Resource
	private WaybillInfoFacade waybillInfoFacade;

	@Resource
	private SettlementFormulaFacade settlementFormulaFacade;

	@Resource
	private SettlementReviseFacade settlementReviseFacade;

	@Resource
	private UserDataAuthFacade userDataAuthFacade;

	@Resource
	private GoodsInfoFacade goodsInfoFacade;

	@Resource
	private DriverInfoFacade driverInfoFacade;

	@Resource
	private PartnerInfoFacade partnerInfoFacade;

	@Resource
	private CarInfoFacade carInfoFacade;

	@Resource
	private ProjectInfoFacade projectInfoFacade;

	@Resource
	private SettlementFormulaDetailFacade settlementFormulaDetailFacade;

	@Resource
	private OrgInfoFacade orgInfoFacade;

	@Resource
	private CouponInfoFacade couponInfoFacade;

	@Resource
	private ContractInfoFacade contractInfoFacade;

	@Resource
	private TransportPriceFacade transportPriceFacade;

	@Resource
	private LossDeductionFacade lossDeductionFacade;

	@Resource
	private LineInfoFacade lineInfoFacade;

	@Resource
	private OrgDetailInfoFacade orgDetailInfoFacade;
	
	@Resource
	private LocationInfoFacade locationInfoFacade;
	
	@Resource
	private EnterpriseUserInfoFacade enterpriseUserInfoFacade;
	
	@Resource
	private UserInfoFacade userInfoFacade;
	
	@Resource
	private SettlementCouponUseFacade settlementCouponUseFacade;
	
	@Resource
	private CouponTypeInfoFacade couponTypeInfoFacade;
	
	@Resource
	private DriverWaybillMaintainPoFacade driverWaybillMaintainPoFacade;
	
	@Resource
	private DriverWaybillImgDetailInfoFacade driverWaybillImgDetailInfoFacade;
	
	@Resource
	private FormulaDetailInfoFacade formulaDetailInfoFacade;
	
	/**
	 * @Title selectSLossesInfo
	 * @Description 查询结算信息管理-结算挂账管理
	 * @param SettlementInfo
	 *            settlementInfo
	 * @return List<settlementInfo>
	 * 
	 */
	// --/settlementInfo/findSLossesInfo
	@RequestMapping("/findSLossesInfo")
	@ResponseBody
	public Map<String, Object> selectSLossesInfo(HttpServletRequest request, SettlementInfo settlementInfo) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		if(userRole == 3){//用户角色为个体货主
			settlementInfo.setOrgRootId(userId);
		}else if(userRole == 1 || userRole == 2){//用户角色为企业货主或者物流公司
			settlementInfo.setOrgRootId(orgRootId);
		}else{
			return null;
		}
		settlementInfo.setUserRole(userRole);
		return settlementInfoFacade.selectSLossesInfo(settlementInfo, orgRootId, userId);
	}

	/**
	 * @title selectCUInfoByOInfoId
	 * @Description 根据组织机构Id管理查询价劵领用信息表、有价券信息表、有价券类型信息表的信息列表
	 * @param Integer
	 *            orgInfoId
	 * @return List<CouponUseInfo>
	 * @author zhangbo
	 * @date 2017/07/06 11:14
	 */
	// ---/settlementInfo/findCUInfoByOInfoId
	@RequestMapping("/findCUInfoByOInfoId")
	@ResponseBody
	public Map<String, Object> selectCUInfoByOInfoId(HttpServletRequest request, CouponUseInfo couponUseInfo) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoId = userInfo.getOrgInfoId();
		couponUseInfo.setOrgInfoId(orgInfoId);
		List<CouponUseInfo> cList = new ArrayList<CouponUseInfo>();
		Map<String, Object> cMap = new HashMap<String, Object>();
		int curPostion = 0;
		int pageSize = 0;
		// couponUseInfo.setPageSizeStr("10");
		// couponUseInfo.setCurPage("1");
		pageSize = Integer.valueOf(couponUseInfo.getPageSizeStr());
		if (couponUseInfo.getCurPage() != null && couponUseInfo.getCurPage() != "") {
			curPostion = Integer.valueOf(couponUseInfo.getCurPage());
			curPostion = (curPostion - 1) * pageSize;
		}
		couponUseInfo.setCurPostion(curPostion);
		couponUseInfo.setPageSize(pageSize);
		couponUseInfo.setParentOrgInfoId(couponUseInfo.getCouponOrgInfoId());
		cList = couponUseInfoFacade.selectCUInfoByOInfoId(couponUseInfo);
		int totalCount = couponUseInfoFacade.selectCUInfoByOInfoIdTotal(couponUseInfo);
		cMap.put("cList", cList);
		cMap.put("totalCount", totalCount);
		return cMap;

	}

	/**
	 * @title selectWaybillInfo
	 * @Description 查询运单信息
	 * @param Integer
	 *            orgInfoId
	 * @return Map<String,Object>
	 * @author zhangbo
	 * @date 2017/07/06 18:14
	 */
	// ---/settlementInfo/findtWaybillInfo
	@RequestMapping("/findtWaybillInfo")
	@ResponseBody
	public Map<String, Object> selectWaybillInfo(HttpServletRequest request, WaybillInfoPo WaybillInfo) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		WaybillInfo.setUserRole(userRole);
		return waybillInfoFacade.selectWaybillInfoForLosses(WaybillInfo, orgRootId, userId);

	}

	/**
	 * @title selectSettlementforBill
	 * @Description 查询结算公式明细信息
	 * @param Integer
	 *            entrustOrgId, Integer entrust
	 * @return Map<String,Object>
	 * @author zhangbo
	 * @date 2017/07/07 10:14   
	 *           2017/08/14改
	 */
	// ---/settlementInfo/findSettlementforBill
	@RequestMapping("/findSettlementforBill")
	@ResponseBody
	public SettlementFormulaPo selectSettlementforBill(String entrustOrgId, String entrust) {
		//Map<String,Object> settlementFormulaMap = new HashMap<String,Object>();
//		if(StringUtils.isNotBlank(waybillInfoId)){
//			//根据运单编号查询运单信息
//			WaybillInfoPo waybillInfoPo = waybillInfoFacade.getWaybillInfoById(Integer.valueOf(waybillInfoId));
//			if(waybillInfoPo != null){
//				if(waybillInfoPo.getCooperateStatus() != null && waybillInfoPo.getCooperateStatus() == 3){
//					entrust = String.valueOf(waybillInfoPo.getShipper());
//				}
//			}
//		}
		//settlementFormulaMap = settlementFormulaFacade.selectSettlementforBill(entrustOrgId, entrust);
		return settlementFormulaFacade.selectSettlementforBill(entrustOrgId, entrust);
	}

	/**
	 * @title selectCustomerCost
	 * @Description 查询客户运费和收发货时间
	 * @param WaybillInfoPo
	 *            waybillInfo
	 * @return String-客户运费
	 * @author zhangbo
	 * @date 2017/07/07 11:32
	 */
	// ---/settlementInfo/findCustomerCost
	@RequestMapping("/findCustomerCost")
	@ResponseBody
	public Map<String, Object> selectCustomerCost(HttpServletRequest request, WaybillInfoPo waybillInfo) {
		Map<String, Object> selectMap = new HashMap<String, Object>();
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userRole = userInfo.getUserRole();
		waybillInfo.setOrgInfoId(orgInfoId);
		waybillInfo.setOrgRootId(orgRootId);
		String custermCost = settlementInfoFacade.selectCustomerCost(waybillInfo, userRole);
		selectMap.put("custermCost", custermCost);
		return selectMap;

	}

	/**
	 * @title
	 * @Description 点击运单确定按钮处理相关逻辑
	 * @return SettlementInfo
	 * @param WaybillInfoPo
	 *            waybillInfo
	 */
	// ---/settlementInfo/saveWaybillInfo
	@RequestMapping("/saveWaybillInfo")
	@ResponseBody
	public SettlementInfo handleWaybill(HttpServletRequest request, WaybillInfoPo waybillInfo) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		waybillInfo.setOrgInfoId(orgInfoId);
		waybillInfo.setOrgRootId(orgRootId);
		waybillInfo.setCreateUser(userId);
		return settlementInfoFacade.computeSettlementInfo(waybillInfo);
	}
	

	/**
	 * @Title insertSLossesInfo
	 * @Description 新增结算单挂账信息
	 * @param SettlementInfo
	 *            settlementInfo
	 * @return boolean
	 * @author zhangbo
	 */
	// ---/settlementInfo/addSLossesInfo
	@RequestMapping("/addSLossesInfo")
	@ResponseBody
	public boolean insertSettlementInfo(HttpServletRequest request, SettlementInfo settlementInfo) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		boolean flag = false;
		if (null == userInfo) {
			flag = false;
		} else {
			Integer orgRootId = userInfo.getOrgRootId();
			Integer userId = userInfo.getId();
			Integer userRole = userInfo.getUserRole();
			Integer orgInfoId = userInfo.getOrgInfoId();
			if(userRole == 3){//用户角色为个体货主
				settlementInfo.setOrgRootId(userId);
			}else if(userRole == 1 || userRole == 2){//用户角色为企业货主或者物流公司
				settlementInfo.setOrgRootId(orgRootId);
			}else{
				flag = false;
			}
			//根据当前年和组织机构ID生成redis key值
			String key = AutoCoverUtils.getYearAndAutoCoverOrg(orgInfoId);
			//根据key值从redis中取出结算单号
			String settlementId = (String)RedisUtil.get(key);
			//如结算单号不为空，则当前结算单号加1
			if(settlementId != null ){
				settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId,settlementId);
			}else{
				//否则根据当前年和组织机构ID加六位序列号初始化一个结算单号如（2017000001000001）
				Map<String,Object> queryMap = new HashMap<String,Object>();
				queryMap.put("orgInfoId", orgInfoId);
				queryMap.put("currentYear", String.valueOf(Calendar.YEAR));
				settlementId = settlementInfoFacade.getSettlementIdByOrgInfoIdAndYear(queryMap);
				if(settlementId != null && !"".equals(settlementId)){
					settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId,settlementId);
				}else{
					settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId);
					
				}
			}
			settlementInfo.setSettlementId(settlementId);
			settlementInfo.setMakeUser(userId);
			settlementInfo.setOrgInfoId(orgInfoId);
			// 结算类型
			settlementInfo.setSettlementType(1);
			if(settlementInfo.getIsExpense() == 0){//非报销模式
			//查询有价券余额是否够本次结算使用
			List<SettlementCouponUse> settlementCouponUseList = new ArrayList<SettlementCouponUse>();
			List<CouponUseInfo> CouponUseInfoList = new ArrayList<CouponUseInfo>();
			Map<String,Object> map = new HashMap<String,Object>();
			if(!"0".equals(settlementInfo.getCouponarray())){
				SettlementCouponUse settlementCouponUse = new SettlementCouponUse();
				settlementCouponUse.setOrgInfoId(orgInfoId);
				net.sf.json.JSONArray json=net.sf.json.JSONArray.fromObject(settlementInfo.getCouponarray());
				net.sf.json.JSONObject jsonOne;
				net.sf.json.JSONObject jsonTwo;
				for(int i=0;i<json.size();i++){
					SettlementCouponUse settlementCouponUser = new SettlementCouponUse();
			          jsonOne = json.getJSONObject(i); 
			          settlementCouponUser.setCouponUseInfoId(Integer.valueOf((String)jsonOne.get("couponUseInfoId")));
			          BigDecimal balance=new BigDecimal((String)jsonOne.get("balance"));
			          settlementCouponUser.setBalance(balance);
			          settlementCouponUseList.add(settlementCouponUser);
			 }
				map.put("settlementCouponUseList", settlementCouponUseList);
				map.put("settlementCouponUse", settlementCouponUse);
				CouponUseInfoList =couponUseInfoFacade.getCouponInfoIdByCouponUserInfoIds(map);
				Map<Integer,BigDecimal> computeMap = CommonUtils.listforMap(CouponUseInfoList, "id", "balance");
				/*  for (Map.Entry<String, String> entry : computeMap.entrySet()) {
					   System.out.println("key= " + entry.getKey() + " and value= " + entry.getValue());
					  }*/
				
				for (int j=0;j<json.size();j++) {
					jsonTwo = json.getJSONObject(j); 
					//有价券领用主键
					Integer id = Integer.valueOf((String)jsonTwo.get("couponUseInfoId"));
			        BigDecimal usePrice = new BigDecimal((String)jsonTwo.get("usePrice"));
					if(null != computeMap){
						BigDecimal balance = computeMap.get(id);
						if(null !=balance){
							if(usePrice.compareTo(balance) > 0){//假如使用金额超出所剩余额
								flag = false;
								return flag;
						}
						}
						
					}
				}
				map.put("settlementCouponUses", settlementCouponUseList);
				//修改有价券领用表余额信息
				if(null != map && !map.isEmpty()){
					couponUseInfoFacade.updateCouponUseInfoByCouponUserInfoIds(map);
				}
			}
			}
			//新增结算信息
			settlementInfoFacade.insertSettlementInfo(settlementInfo, userRole,orgInfoId,key);
			//System.out.println(settlementInfo.getId());
			//新增结算-有价券关系表
			List<SettlementCouponUse> scuList = new ArrayList<SettlementCouponUse>();
			if(!"0".equals(settlementInfo.getCouponarray())){
				net.sf.json.JSONArray json=net.sf.json.JSONArray.fromObject(settlementInfo.getCouponarray());
				net.sf.json.JSONObject jsonOne;
				for(int i=0;i<json.size();i++){
					SettlementCouponUse settlementCouponUser = new SettlementCouponUse();
			          jsonOne = json.getJSONObject(i); 
			          settlementCouponUser.setOrgInfoId(orgInfoId);
			          settlementCouponUser.setOrgRootId(orgRootId);
			          settlementCouponUser.setSettlementInfoId(settlementInfo.getId());
			          settlementCouponUser.setCreateUser(userId);
			          settlementCouponUser.setCreateTime(new java.sql.Date(new Date().getTime()));
			          settlementCouponUser.setCouponInfoId(Integer.valueOf((String)jsonOne.get("couponInfoId")));
			          settlementCouponUser.setCouponTypeInfoId(Integer.valueOf((String)jsonOne.get("couponTypeInfoId")));
			          settlementCouponUser.setCouponUseInfoId(Integer.valueOf((String)jsonOne.get("couponUseInfoId")));
			          BigDecimal usePrice=new BigDecimal((String)jsonOne.get("usePrice"));
			          settlementCouponUser.setUsePrice(usePrice);
			          BigDecimal balance=new BigDecimal((String)jsonOne.get("balance"));
			          settlementCouponUser.setBalance(balance);
			          settlementCouponUser.setSettlementId(settlementId);
			          scuList.add(settlementCouponUser);
			 }
				settlementCouponUseFacade.insertSettlementCouponUse(scuList);
			}
			flag = true;
		}
		return flag;
	}

	/**
	 * @Title updateSettlementInfo
	 * @Description 修改结算信息
	 * @param SettlementInfo
	 *            settlementInfo
	 * @author zhangbo
	 */
	@RequestMapping("/editSettlementInfo")
	@ResponseBody
	public boolean updateSettlementInfo(HttpServletRequest request, SettlementInfo settlementInfo) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		boolean flag = false;
		if (null == userInfo) {
			flag = false;
		} else {
			Integer userId = userInfo.getId();
			Integer userRole = userInfo.getUserRole();
			Integer orgRootId = userInfo.getOrgRootId();
			Integer orgInfoId = userInfo.getOrgInfoId();
			settlementInfo.setUpdateTime(new java.sql.Date(new Date().getTime()));
			settlementInfo.setUpdateUser(userId);
			settlementInfo.setSettlementType(1);
			settlementInfo.setOrgInfoId(orgInfoId);
			//根据当前年和组织机构ID生成redis key值
			String key = AutoCoverUtils.getYearAndAutoCoverOrg(orgInfoId);
			//根据key值从redis中取出结算单号
//			String settlementId = (String)RedisUtil.get(key);
//			//如结算单号不为空，则当前结算单号加1
//			if(settlementId != null ){
//				settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId,settlementId);
//			}else{
//				//否则根据当前年和组织机构ID加六位序列号初始化一个结算单号如（2017000001000001）
//				settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId);
//			}
			//结算有价券使用信息
			List<SettlementCouponUse> settlementCouponUseList = new ArrayList<SettlementCouponUse>();
			Map<String,Object> params = new HashMap<String, Object>();
			SettlementCouponUse settlementCouponUse = new SettlementCouponUse();
			//获取结算有价券使用信息
			if(settlementInfo.getCouponarray() != null && !"0".equals(settlementInfo.getCouponarray()) && !"".equals(settlementInfo.getCouponarray())){
				settlementCouponUseList = CommonUtils.jsonStringForList(settlementInfo.getCouponarray(),settlementCouponUse);
				settlementCouponUse.setSettlementInfoId(settlementInfo.getId());
				settlementCouponUse.setOrgRootId(orgRootId);
				settlementCouponUse.setOrgInfoId(orgInfoId);
				settlementCouponUse.setCreateUser(userId);
				settlementCouponUse.setCreateTime(Calendar.getInstance().getTime());
				settlementCouponUse.setSettlementInfoId(settlementInfo.getId());
				params.put("settlementCouponUseList", settlementCouponUseList);
				params.put("settlementCouponUse", settlementCouponUse);
				//结算有价券领用信息MAP，key:有价券领用信息表主键ID value:使用金额
				Map<Integer,BigDecimal> settlementCouponUseMap = new HashMap<Integer,BigDecimal>();
				if(CollectionUtils.isNotEmpty(settlementCouponUseList)){
					settlementCouponUseMap = CommonUtils.listforMap(settlementCouponUseList, "couponUseInfoId", "usePrice");
				}
				//根据领用信息表主键ID和所属机构ID查询余额，比较使用金额是否大于余额
				List<CouponUseInfo> couponUseInfoList = couponUseInfoFacade.getCouponInfoIdByCouponUserInfoIds(params);
				if(CollectionUtils.isNotEmpty(couponUseInfoList)){
					for(CouponUseInfo couponUseInfo : couponUseInfoList){
						if(MapUtils.isNotEmpty(settlementCouponUseMap) && settlementCouponUseMap.get(couponUseInfo.getId()) != null){
							if(settlementCouponUseMap.get(couponUseInfo.getId()).compareTo(couponUseInfo.getBalance()) == 1){
								return false;
							}
						}
					}
				}
				for(SettlementCouponUse sCouponUse : settlementCouponUseList){
					sCouponUse.setOrgRootId(orgRootId);
					sCouponUse.setOrgInfoId(orgInfoId);
					sCouponUse.setCreateUser(userId);
					sCouponUse.setCreateTime(Calendar.getInstance().getTime());
					sCouponUse.setSettlementInfoId(settlementInfo.getId());
					sCouponUse.setSettlementId(settlementInfo.getSettlementId());
				}
			//根据组织机构ID和结算信息表主键ID查询结算有价券使用表信息  516
			List<SettlementCouponUse> sCouponUseList = settlementCouponUseFacade.getSettlementCouponUseBySettlementInfoId(params);
			//结算有价券领用信息MAP，key:结算信息表主键ID value:结算有价券信息实体
			Map<Integer,Object> settlementCouponUseMapTwo = new HashMap<Integer,Object>();
			if(CollectionUtils.isNotEmpty(settlementCouponUseList)){
				settlementCouponUseMapTwo = CommonUtils.listforMap(settlementCouponUseList, "couponUseInfoId", null);
			}
			if(CollectionUtils.isNotEmpty(sCouponUseList) || CollectionUtils.isNotEmpty(settlementCouponUseList)){
				for(SettlementCouponUse sCouponUse : sCouponUseList){
					//查看选择的有价券信息是否存在于结算有价券信息表
					if(MapUtils.isNotEmpty(settlementCouponUseMapTwo) && settlementCouponUseMapTwo.get(sCouponUse.getCouponUseInfoId()) != null){
						continue;
					}else{
						//不存在，使用金额+余额
						sCouponUse.setBalance(sCouponUse.getUsePrice().add(sCouponUse.getBalance()));
						settlementCouponUseList.add(sCouponUse);
					}
				}
					params.put("settlementCouponUses", settlementCouponUseList);
					params.put("settlementCouponUseList", settlementCouponUseList);
					params.put("settlementCouponUses", settlementCouponUseList);
				//根据领用信息表主键ID和所属机构ID修改有价券领用信息表余额
				//map.put("settlementCouponUses", settlementCouponUseList);
				couponUseInfoFacade.updateCouponUseInfoByCouponUserInfoIds(params);
				//根据结算信息表主键ID删除结算结算有价券使用表信息
				List<Integer> settlementInfoIds = new ArrayList<Integer>();
				settlementInfoIds.add(settlementInfo.getId());
				settlementCouponUseFacade.deleteSettlementCouponUse(settlementInfoIds);
				//新增结算有价券使用表信息
				settlementCouponUseFacade.insertSettlementCouponUse(settlementCouponUseList);
			}
			}	
			settlementInfoFacade.updateSettlementInfo(settlementInfo, userRole);
			flag = true;
		}
		return flag;
	}

	/**
	 * @Title deleteSettlementInfo
	 * @Description 删除结算信息
	 * @param String
	 *            ids
	 * @author zhangbo
	 */
	// ---/settlementInfo/delSettlementInfo
	@RequestMapping("/delSettlementInfo")
	@ResponseBody
	public boolean deleteSettlementInfo(String ids,String wIds,HttpServletRequest request) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		settlementInfoFacade.deleteSettlementInfo(ids,wIds,orgInfoId);
		//获取结算类型
		Integer settlementType = null;
		if(request.getParameter("settlementType") != null){
			settlementType = Integer.valueOf(request.getParameter("settlementType"));
		}
		//返单时如下操作
		if(settlementType != null && settlementType == 2 && request.getParameter("waybillInfoJson") != null && !"".equals(request.getParameter("waybillInfoJson"))){
			WaybillInfoPo waybillInfoPo = new WaybillInfoPo();
			//json字符串转换成对象LIST
			List<WaybillInfoPo> waybillInfoList =  CommonUtils.jsonStringForList(request.getParameter("waybillInfoJson"),waybillInfoPo);
			if(CollectionUtils.isNotEmpty(waybillInfoList)){
				//根据主运单编号查询运单历史状态的运单
				List<WaybillInfoPo> waybillInfoPoList = waybillInfoFacade.getWaybillInfoByRootWaybillInfoIds(waybillInfoList);
				//根据主运单编号修改运单状态，且不等于运单编号的运单（批量）
				if(CollectionUtils.isNotEmpty(waybillInfoPoList)){
					waybillInfoFacade.updateWaybillInfoByRootWaybillInfoId(waybillInfoPoList);
				}
				Map<String,Object> params = new HashMap<String,Object>();
				List<Integer> driverWaybillMaintainList = new ArrayList<Integer>();
				for(WaybillInfoPo waybillInfo : waybillInfoList){
					driverWaybillMaintainList.add(waybillInfo.getRootWaybillInfoId());
				}
				params.put("orgRootId", orgRootId);
				params.put("driverWaybillMaintainList", driverWaybillMaintainList);
				if(CollectionUtils.isNotEmpty(driverWaybillMaintainList) && MapUtils.isNotEmpty(params)){
					//根据委托方主机构和主运单编号删除司机运单维护表（批量）
					driverWaybillMaintainPoFacade.deleteDriverWaybillMaintain(params);
					driverWaybillImgDetailInfoFacade.deleteDriverWaybillImgDetailInfo(driverWaybillMaintainList);
				}
			}
		}
		return true;
	}

	/**
	 * @Title submitSettlementInfo
	 * @Description 提交审核结算信息
	 * @param String
	 *            id
	 * @author zhangbo
	 */
	@RequestMapping("/submitSettlementInfo")
	@ResponseBody
	public boolean submitSettlementInfo(String id) {
		settlementInfoFacade.submitSettlementInfo(id);
		return true;
	}

	/**
	 * @Title auditSettlementInfo
	 * @Description 审核结算信息
	 * @param String
	 *            id,String buttonType,String auditOpinion
	 * @author zhangbo
	 */
	@RequestMapping("/auditSettlementInfo")
	@ResponseBody
	public boolean auditSettlementInfo(HttpServletRequest request, String id, String buttonType, String auditOpinion) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		boolean flag = false;
		if (null == userInfo) {
			flag = false;
		} else {
			Integer orgRootId = userInfo.getOrgRootId();
			Integer userId = userInfo.getId();
			SettlementAuditLog settlementAuditLog = new SettlementAuditLog();
			settlementAuditLog.setOrgRootId(orgRootId);
			settlementAuditLog.setAuditPerson(userId);
			settlementAuditLog.setAuditOpinion(auditOpinion);
			settlementAuditLog.setAuditResult(Integer.valueOf(buttonType));
			settlementAuditLog.setSettlementInfoId(Integer.valueOf(id));
			settlementInfoFacade.auditSIAuditLog(settlementAuditLog);
			flag = true;
		}
		return flag;
	}

	/**
	 * @Title redirectSettlementLosses
	 * @Description 跳转到结算挂账管理页面
	 * @author zhangbo
	 * @return url路径
	 */
	// ---/settlementInfo/goSettlementLosses
	@RequiresPermissions("settle:debts:view")
	@RequestMapping("/goSettlementLosses")
	public String redirectSettlementLosses() {
		return "template/settlementInfo/settlement_losses";
	}

	/**
	 * @Title redirectSettlementLossesAdd
	 * @Description 跳转到新增结算挂账管理页面
	 * @author zhangbo
	 * @return url路径
	 */
	// ---/settlementInfo/goSettlementLossesAdd
	@RequestMapping("/goSettlementLossesAdd")
	public String redirectSettlementLossesAdd(HttpServletRequest request, String sign, Model model) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
        Integer enterpriseUserType = userInfo.getEnterpriseUserType();
        Integer orgInfoId = userInfo.getOrgInfoId();
        Integer userInfoId = userInfo.getId();
    	String returnSingleUser = "";
    	if(enterpriseUserType != null){
			//企业用户类型为企管人员根据组织机构ID查询组织机构信息
			if(enterpriseUserType == 1){
				OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(orgInfoId);
				returnSingleUser = orgInfoPo.getOrgDetailInfo().getOrgName();
			}else{
				//企业用户类型为企业普通用户根据用户ID查询用户信息
				EnterpriseUserInfo enterpriseUserInfo = enterpriseUserInfoFacade.getEnterpriseUserInfoByUserInfoId(userInfoId);
				returnSingleUser = enterpriseUserInfo.getRealName();
			}
		}
		model.addAttribute("sign", sign);
		model.addAttribute("returnSingleUser",returnSingleUser);
		return "template/settlementInfo/settlement_losses_add";
	}

	/**
	 * @Title redirectSettlementLossesEdit
	 * @Description 跳转到修改结算挂账管理页面
	 * @author zhangbo
	 * @return url路径
	 */
	// ---/settlementInfo/goSettlementLossesEdit
	@RequestMapping("/goSettlementLossesEdit")
	public String redirectSettlementLossesEdit(HttpServletRequest request, String sign, String id, Model model) {
		SettlementInfo settlementInfo = new SettlementInfo();
		WaybillInfoPo waybillInfo = new WaybillInfoPo();
		//SettlementFormulaPo settlementFormula = new SettlementFormulaPo();
		//CouponUseInfo couponUseInfo = new CouponUseInfo();
		settlementInfo = settlementInfoFacade.selectSettlementById(Integer.valueOf(id));
		waybillInfo= waybillInfoFacade.getWaybillInfoById(settlementInfo.getWaybillInfoId());
		//settlementFormula = settlementFormulaFacade.selectSettlementforBill(String.valueOf(waybillInfo.getEntrustOrgRoot()),String.valueOf(waybillInfo.getEntrust()));
		if(null != waybillInfo){
			if(waybillInfo.getEndPoints() != null){//零散货物运单
				List<LocationInfoPo> locationList = new ArrayList<LocationInfoPo>();
				//根据地点表主键查询线路起点和终点
				//查询起点信息
				String startPointName = "";
				String endPointName = "";
				locationList = locationInfoFacade.findLocationById(waybillInfo.getLineInfoId());
				LocationInfoPo locationInfo = new LocationInfoPo();
				if(null != locationList && locationList.size() >0){
					locationInfo = locationList.get(0);
					startPointName = 
							locationInfo.getProvince()+"-->"+locationInfo.getCity()+"-->"
									+ locationInfo.getCounty();
				}
				//查询终点信息
				locationList =locationInfoFacade.findLocationById(waybillInfo.getEndPoints());
				if(null != locationList && locationList.size() >0){
					locationInfo = locationList.get(0);
					endPointName = 
							locationInfo.getProvince()+"-->"+locationInfo.getCity()+"-->"
									+ locationInfo.getCounty();
				}
				settlementInfo.setLineName(startPointName+"到"+endPointName);
			}
		}
		
		/*if(null != settlementFormula){
			if(null == settlementFormula.getOverallTaxRate()){
				settlementFormula.setOverallTaxRate(BigDecimal.ZERO);
			}
			if(null == settlementFormula.getWithholdingTaxRate()){
				settlementFormula.setWithholdingTaxRate(BigDecimal.ZERO);
			}
			if(null == settlementFormula.getIncomeTaxRate()){
				settlementFormula.setIncomeTaxRate(BigDecimal.ZERO);
			}
			if(null == settlementFormula.getIndividualIncomeTax()){
				settlementFormula.setIndividualIncomeTax(BigDecimal.ZERO);
			}
		waybillInfo.setOverallTaxRate(settlementFormula.getOverallTaxRate());
		waybillInfo.setWithholdingTaxRate(settlementFormula.getWithholdingTaxRate());
		waybillInfo.setIncomeTaxRate(settlementFormula.getIncomeTaxRate());
		waybillInfo.setIndividualIncomeTax(settlementFormula.getIndividualIncomeTax());
		}*/
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
        Integer enterpriseUserType = userInfo.getEnterpriseUserType();
        Integer orgInfoId = userInfo.getOrgInfoId();
        Integer userInfoId = userInfo.getId();
    	String returnSingleUser = "";
    	if(enterpriseUserType != null){
			//企业用户类型为企管人员根据组织机构ID查询组织机构信息
			if(enterpriseUserType == 1){
				OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(orgInfoId);
				returnSingleUser = orgInfoPo.getOrgDetailInfo().getOrgName();
			}else{
				//企业用户类型为企业普通用户根据用户ID查询用户信息
				EnterpriseUserInfo enterpriseUserInfo = enterpriseUserInfoFacade.getEnterpriseUserInfoByUserInfoId(userInfoId);
				returnSingleUser = enterpriseUserInfo.getRealName();
			}
		}
		model.addAttribute("sign", sign);
		model.addAttribute("returnSingleUser",returnSingleUser);
		BigDecimal taxRate = new BigDecimal(0);
		if(null != settlementInfo){
			if(settlementInfo.getIsExpense() == 0){//不是报销模式
				//根据结算单信息查询
				taxRate = couponTypeInfoFacade.selectTaxRateBySettlementId(Integer.valueOf(id));
			}else{
				if(settlementInfo.getExpenseType() == 1){//1:燃油 
					taxRate = couponTypeInfoFacade.selectTaxRateByCouponType("油卡");
				}
				if(settlementInfo.getExpenseType() == 2){//2:燃气
					taxRate = couponTypeInfoFacade.selectTaxRateByCouponType("燃气卡");
				}
			}
			waybillInfo.setTaxRate(taxRate);
			/*if(null != settlementInfo.getCouponUseInfoId()){
				couponUseInfo =couponUseInfoFacade.selectCUInfoByCUId(settlementInfo.getCouponUseInfoId());
			}
			if(null != couponUseInfo){
				waybillInfo.setMoney(couponUseInfo.getMoney());
				waybillInfo.setTaxRate(couponUseInfo.getTaxRate());
			}*/
	     	Map<String,Object> params = new HashMap<String,Object>();
	     	params.put("orgInfoId", orgInfoId);
	     	params.put("settlementInfoId", id);
			String cardCode = settlementCouponUseFacade.getCouponUseInfoCardCodeByList(params);
			settlementInfo.setCardCode(cardCode);
			model.addAttribute("settlementInfo", settlementInfo);
		}
		if(null != waybillInfo){
			model.addAttribute("waybillInfo", waybillInfo);
		}
		return "template/settlementInfo/settlement_losses_add";
	}

	/**
	 * @Title redirectSettlementLossesEdit
	 * @Description 结算信息挂账红冲功能
	 * @author zhangbo
	 * @return boolean
	 */
	// ---/settlementInfo/RedSettlementInfo
	@RequestMapping("/RedSettlementInfo")
	@ResponseBody
	public boolean writeOffSettlementLosses(HttpServletRequest request, String id) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		//结算单类型
		Integer settlementType = null;
		if(request.getParameter("settlementType") != null){
			settlementType = Integer.valueOf(request.getParameter("settlementType"));
		}
		//主运单编号
		Integer rootWaybillInfoId = null;
		if(request.getParameter("rootWaybillInfoId") != null){
			rootWaybillInfoId = Integer.valueOf(request.getParameter("rootWaybillInfoId"));
		}
		boolean flag = false;
		if (null == userInfo) {
			flag = false;
		} else {
			Integer userInfoId = userInfo.getId();
			Integer orgRootId = userInfo.getOrgRootId();
			Integer orgInfoId = userInfo.getOrgInfoId();
			SettlementInfo settlementInfo = new SettlementInfo();
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("userInfoId", userInfoId);
			params.put("orgRootId", orgRootId);
			params.put("orgInfoId", orgInfoId);
			params.put("id", id);
			if (!"".equals(id) && null != id) {
				settlementInfo = settlementInfoFacade.selectSettlementById(Integer.valueOf(id));
			}
			//根据当前年和组织机构ID生成redis key值
			String key = AutoCoverUtils.getYearAndAutoCoverOrg(orgInfoId);
			//根据key值从redis中取出结算单号
			String settlementId = (String)RedisUtil.get(key);
			//如结算单号不为空，则当前结算单号加1
			if(settlementId != null ){
				settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId,settlementId);
			}else{
				//否则根据当前年和组织机构ID加六位序列号初始化一个结算单号如（2017000001000001）
				Map<String,Object> queryMap = new HashMap<String,Object>();
				queryMap.put("orgInfoId", orgInfoId);
				queryMap.put("currentYear", String.valueOf(Calendar.YEAR));
				settlementId = settlementInfoFacade.getSettlementIdByOrgInfoIdAndYear(queryMap);
				if(settlementId != null && !"".equals(settlementId)){
					settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId,settlementId);
				}else{
					settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId);
					
				}
			}
			settlementInfo.setSettlementId(settlementId);
			settlementInfoFacade.writeOff(settlementInfo, params,key);
			if(settlementType != null && settlementType == 2 && rootWaybillInfoId != null){
				//根据主运单编号删除司机运单维护表
				Map<String,Object> paramMap = new HashMap<String,Object>();
				List<Integer> driverWaybillMaintainList = new ArrayList<Integer>();
				driverWaybillMaintainList.add(rootWaybillInfoId);
				paramMap.put("orgRootId", orgRootId);
				paramMap.put("driverWaybillMaintainList", driverWaybillMaintainList);
				driverWaybillMaintainPoFacade.deleteDriverWaybillMaintain(paramMap);
				//根据主运单编号删除司机运单图片明细表
				driverWaybillImgDetailInfoFacade.deleteDriverWaybillImgDetailInfo(driverWaybillMaintainList);
			}
			flag = true;
		}
		return flag;
	}

	/**
	 * @title revise
	 * @description 结算信息应付调差功能
	 * @return boolean
	 * @param SettlementRevisePo
	 *            settlementRevisePo
	 */
	@RequestMapping("/reviseSettlementInfo")
	@ResponseBody
	public boolean revise(HttpServletRequest request, SettlementRevisePo settlementRevisePo) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		boolean flag = false;
		if (null == userInfo) {
			flag = false;
		} else {
			Integer userInfoId = userInfo.getId();
			Integer orgRootId = userInfo.getOrgRootId();
			settlementRevisePo.setOrgRootId(orgRootId);
			settlementReviseFacade.addSettlementRevise(settlementRevisePo, userInfoId);
			flag = true;
		}
		return flag;
	}

	/**
	 * @Title exportSettlementLosses
	 * @Description 结算挂账信息导出功能
	 * @author zhangbo
	 * @return boolean
	 * @param String
	 *            ids,String url,String name
	 */
	@RequestMapping("/exportSettlementLosses")
	@ResponseBody
	public void exportSettlementLosses(String ids,String type, HttpServletRequest request, HttpServletResponse response) {
		String finalFileName = "";
		if("1".equals(type)){
			finalFileName = "结算挂账信息";
		}else{
			finalFileName = "返单结算信息";
		}
		response.setContentType("application/vnd.ms-excel;charset=UTF-8");
		try {
			finalFileName = URLEncoder.encode(finalFileName, "UTF-8");
			response.setCharacterEncoding("utf-8"); 
			response.addHeader("Content-Disposition", "attachment;filename="+new String( finalFileName.getBytes("gbk"), "UTF-8" )+".xls"); 		
			} catch (UnsupportedEncodingException e) {
		}
		List<SettlementInfo> exportList = new ArrayList<SettlementInfo>();
		List<Integer> idsList = new ArrayList<Integer>();
		if (ids != "") {
			for (String id : ids.split(",")) {
				idsList.add(Integer.valueOf(id));
			}
			// 根据主键查询要导出的数据
			exportList = settlementInfoFacade.selectSettlementByExport(idsList);
			Map<String, Object> tmap = new HashMap<String, Object>();
			List<String> keyList = new ArrayList<String>();
			List<String> titleList = new ArrayList<String>();
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			Workbook workbook = new HSSFWorkbook();

			// 调用导出方法
			tmap = settlementInfoFacade.exportSettlementInfo(exportList);
			// 取出要到处的参数
			keyList = (List<String>) tmap.get("keyList");
			titleList = (List<String>) tmap.get("titleList");
			list = (List<Map<String, Object>>) tmap.get("list");
			try {
				workbook = POIExcelUtil.exportExcel(titleList, keyList, list, finalFileName);
				OutputStream os = response.getOutputStream();
				workbook.write(os);
				os.flush();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

	}
	
	/**
	 * @Title EASexportSettlementLosses
	 * @Description 结算挂账信息EAS导出Excel功能
	 * @author 邱永城
	 * @return boolean
	 * @param String
	 *            ids,String url,String name
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/EASexportSettlementLosses")
	@ResponseBody
	public void EASexportSettlementLosses(String ids,String type, HttpServletRequest request, HttpServletResponse response) {
		String finalFileName = "";
		String agent = request.getHeader("USER-AGENT");   
		//获取当前几月几号
		String d=new SimpleDateFormat("MMdd").format(Calendar.getInstance().getTime());
		if("1".equals(type)){
			finalFileName = "EAS结算挂账信息"+d;
		}else{
			finalFileName = "EAS返单结算信息"+d;
		}
		response.setContentType("application/vnd.ms-excel;charset=UTF-8");
		try {
			if ((agent != null) && (-1 != agent.indexOf("Firefox"))) {
				finalFileName = MimeUtility.encodeText(finalFileName, "UTF-8", "B"); 
			}else{
				finalFileName = URLEncoder.encode(finalFileName, "UTF-8");
			}
			response.setCharacterEncoding("utf-8"); 
			response.addHeader("Content-Disposition", "attachment;filename="+new String(finalFileName.getBytes("gbk"), "UTF-8" )+".xls"); 		
			} catch (UnsupportedEncodingException e) {
		}
		List<Map<String,Object>> exportList = new ArrayList<Map<String,Object>>();
		List<Integer> idsList = new ArrayList<Integer>();
		if (ids != "") {
			for (String id : ids.split(",")) {
				idsList.add(Integer.valueOf(id));
			}
			// 根据主键查询要导出的数据
			exportList = settlementInfoFacade.selectSettlementByEASExport(idsList);
			Map<String, Object> tmap = new HashMap<String, Object>();
			List<String> keyList = new ArrayList<String>();
			List<String> titleList = new ArrayList<String>();
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			Workbook workbook = new HSSFWorkbook();

			// 调用导出方法
			tmap = settlementInfoFacade.EASexportSettlementInfo(exportList);
			// 取出要到处的参数
			keyList = (List<String>) tmap.get("keyList");
			titleList = (List<String>) tmap.get("titleList");
			list = (List<Map<String, Object>>) tmap.get("list");
			
			try {
				workbook = POIExcelUtil.EASexportExcel(titleList, keyList, list, finalFileName);
				OutputStream os = response.getOutputStream();
				workbook.write(os);
				os.flush();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

	}
	
	/**
	 * 返单结算信息查询初始页
	 * 
	 * @author jiangweiwei
	 * @data 2017年5月16日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequiresPermissions("settle:reOrder:view")
	@RequestMapping("/showReOrderSettlementInfoListPage")
	public String showReOrderSettlementInfoListPage(HttpServletRequest request, Model model) {
		return "template/settlementInfo/show_re_order_settlement_info_page";
	}

	/**
	 * 根据委托方名称（模糊）、零散货物（模糊）、主机构ID、条件组、车牌号码、发货单号、
	 * 到货单号、线路、货物、组织部门、核算主体、结算单状态、发货时间、到货时间和分页查询结算单信息(返单结算)
	 * 
	 * @author jiangweiwei
	 * @data 2017年5月16日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/listSettlementInfo")
	public String listSettlementInfo(HttpServletRequest request, Model model) {
		DataPager<SettlementInfo> settlementInfoPager = new DataPager<SettlementInfo>();

		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		settlementInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		settlementInfoPager.setSize(rows);

		// 委托方名称
		String entrustName = null;
		if (params.get("entrustName") != null) {
			entrustName = params.get("entrustName").toString();
		}
		// 零散货物
		String scatteredGoods = null;
		if (params.get("scatteredGoods") != null) {
			scatteredGoods = params.get("scatteredGoods").toString();
		}
		// 车牌号码
		String carCode = null;
		if (params.get("carCode") != null) {
			carCode = params.get("carCode").toString();
		}
		// 发货单号
		String forwardingId = null;
		if (params.get("forwardingId") != null) {
			forwardingId = params.get("forwardingId").toString();
		}
		// 到货单号
		String arriveId = null;
		if (params.get("arriveId") != null) {
			arriveId = params.get("arriveId").toString();
		}
		// 线路
		Integer lineInfoId = null;
		if (params.get("lineInfoId") != null) {
			lineInfoId = Integer.valueOf(params.get("lineInfoId").toString());
		}
		// 货物
		Integer goodsInfoId = null;
		if (params.get("goodsInfoId") != null) {
			goodsInfoId = Integer.valueOf(params.get("goodsInfoId").toString());
		}
		// 货物名称
		String goodsName = null;
		if (params.get("goodsName") != null) {
			goodsName = params.get("goodsName").toString();
		}
		// 组织部门
		Integer projectInfoId = null;
		if (params.get("projectInfoId") != null) {
			projectInfoId = Integer.valueOf(params.get("projectInfoId").toString());
		}
		// 核算主体
		Integer accountingEntity = null;
		if (params.get("accountingEntity") != null) {
			accountingEntity = Integer.valueOf(params.get("accountingEntity").toString());
		}
		// 结算单状态
		Integer settlementStatus = null;
		if (params.get("settlementStatus") != null) {
			settlementStatus = Integer.valueOf(params.get("settlementStatus").toString());
		}
		// 是否对账
		Integer isAccount = null;
		if (params.get("isAccount") != null) {
			isAccount = Integer.valueOf(params.get("isAccount").toString());
		}
		// 是否开票
		Integer isInvoice = null;
		if (params.get("isInvoice") != null) {
			isInvoice = Integer.valueOf(params.get("isInvoice").toString());
		}
		// 发货时间开始
		Date forwardingTimeStart = null;
		if (params.get("forwardingTimeStart") != null) {
			forwardingTimeStart = DateUtils.formatTime(params.get("forwardingTimeStart").toString());
		}
		// 发货时间结束
		Date forwardingTimeEnd = null;
		if (params.get("forwardingTimeEnd") != null) {
			forwardingTimeEnd = DateUtils.formatTime(params.get("forwardingTimeEnd").toString());
		}
		// 到货时间开始
		Date arriveTimeStart = null;
		if (params.get("arriveTimeStart") != null) {
			arriveTimeStart = DateUtils.formatTime(params.get("arriveTimeStart").toString());
		}
		// 到货时间结束
		Date arriveTimeEnd = null;
		if (params.get("arriveTimeEnd") != null) {
			arriveTimeEnd = DateUtils.formatTime(params.get("arriveTimeEnd").toString());
		}
		// 回单开始日期
		Date rMakeStartTime = null;
		if (params.get("rMakeStartTime") != null) {
			rMakeStartTime = DateUtils.formatTime(params.get("rMakeStartTime").toString());
		}
		// 回单结束日期
		Date rMakeEndTime = null;
		if (params.get("rMakeEndTime") != null) {
			rMakeEndTime = DateUtils.formatTime(params.get("rMakeEndTime").toString());
		}
		//制单人
		String makeUser = null;
		if (params.get("makeUser") != null) {
			makeUser = params.get("makeUser").toString();
		}
		//备注
		String remarks = null;
		if (params.get("remarks") != null) {
			remarks = params.get("remarks").toString();
		}
		//运单号
		String rootWaybillId = null;
		if (params.get("rootWaybillId") != null) {
			rootWaybillId = params.get("rootWaybillId").toString();
		}
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("uOrgRootId", orgRootId);
		queryMap.put("uId", userId);
		queryMap.put("entrustName", entrustName);
		queryMap.put("scatteredGoods", scatteredGoods);
		queryMap.put("carCode", carCode);
		queryMap.put("forwardingId", forwardingId);
		queryMap.put("arriveId", arriveId);
		queryMap.put("lineInfoId", lineInfoId);
		queryMap.put("goodsInfoId", goodsInfoId);
		queryMap.put("projectInfoId", projectInfoId);
		queryMap.put("accountingEntity", accountingEntity);
		queryMap.put("settlementStatus", settlementStatus);
		queryMap.put("forwardingTimeStart", forwardingTimeStart);
		queryMap.put("forwardingTimeEnd", forwardingTimeEnd);
		queryMap.put("arriveTimeStart", arriveTimeStart);
		queryMap.put("arriveTimeEnd", arriveTimeEnd);
		queryMap.put("goodsName", goodsName);
		queryMap.put("rMakeStartTime", rMakeStartTime);
		queryMap.put("rMakeEndTime", rMakeEndTime);
		queryMap.put("makeUser", makeUser);
		queryMap.put("remarks", remarks);
		queryMap.put("isAccount", isAccount);
		queryMap.put("isInvoice", isInvoice);
		queryMap.put("rootWaybillId", rootWaybillId);

		// 根据登录用户主机构ID和登录用户ID查询用户数据权限表，获得登录用户数据权限
		List<UserDataAuthPo> userDataAuthList = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(queryMap);
		List<String> userDataAuthListStrs = new ArrayList<String>();
		// 登录用户必须存在数据权限
		if (userDataAuthList != null && userDataAuthList.size() > 0) {
			for (UserDataAuthPo userDataAuthPo : userDataAuthList) {
				userDataAuthListStrs.add(userDataAuthPo.getConditionGroup());
			}
			queryMap.put("userDataAuthListStrs", userDataAuthListStrs);
			// 3、查询结算信息总数
			Integer totalNum = settlementInfoFacade.countReOrderSettlementInfoForPage(queryMap);

			// 4、分页查询结算信息
			List<SettlementInfo> settlementInfoList = settlementInfoFacade.findReOrderSettlementInfoForPage(queryMap);
			//线路表主键ID集合
			List<Integer> lineInfoIdList = new ArrayList<Integer>();
			//地点表主键ID集合（起点）
			List<Integer> locationStartInfoIdList = new ArrayList<Integer>();
			//地点表主键ID集合（终点）
			List<Integer> locationEndInfoIdList = new ArrayList<Integer>();
			//企业临时司机主键ID集合
			List<Integer> driverInfoIds = new ArrayList<Integer>();
			//其它司机用户ID集合
			List<Integer> userInfoIds = new ArrayList<Integer>();
			if(CollectionUtils.isNotEmpty(settlementInfoList)){
				for(SettlementInfo settlementInfo:settlementInfoList){
					//判断是否零散货物
					if(StringUtils.isEmpty(settlementInfo.getScatteredGoods())){
						lineInfoIdList.add(settlementInfo.getLineInfoId());
					}else{
						locationStartInfoIdList.add(settlementInfo.getLineInfoId());
						locationEndInfoIdList.add(settlementInfo.getEndPoints());
					}
					if(settlementInfo.getDriverUserRole() != null){
						//如为企业临时司机
						if(settlementInfo.getDriverUserRole() == 2){
							driverInfoIds.add(settlementInfo.getUserInfoId());
						}else{
							userInfoIds.add(settlementInfo.getUserInfoId());
						}
					}
				}
				
				//线路表信息
				List<LineInfoPo> lineInfoList = new ArrayList<LineInfoPo>();
				//地点表信息（起点）
				List<LocationInfoPo> locationStartInfoList = new ArrayList<LocationInfoPo>();
				//地点表信息（终点）
				List<LocationInfoPo> locationEndInfoList = new ArrayList<LocationInfoPo>();
				//临时司机信息
				List<DriverInfo> driverInfoList = new ArrayList<DriverInfo>();
				//其它司机信息
				List<DriverInfo> userInfoList = new ArrayList<DriverInfo>();
				//根据线路表主键ID查询线路表起点、终点
				if(CollectionUtils.isNotEmpty(lineInfoIdList)){
					lineInfoList = lineInfoFacade.findLineInfoByIds(lineInfoIdList);
				}
				//根据地点表主键ID查询地点表省、市、区（起点）
				if(CollectionUtils.isNotEmpty(locationStartInfoIdList)){
					locationStartInfoList = locationInfoFacade.findLocationNameByIds(locationStartInfoIdList);
				}
				//根据地点表主键ID查询地点表省、市、区（终点）
				if(CollectionUtils.isNotEmpty(locationEndInfoIdList)){
					locationEndInfoList = locationInfoFacade.findLocationNameByIds(locationEndInfoIdList);
				}
				//根据司机表主键ID查询司机名称
				if(CollectionUtils.isNotEmpty(driverInfoIds)){
					driverInfoList = driverInfoFacade.getDriverInfoByDriverInfoIds(driverInfoIds);
				}
				//根据用户ID查询司机名称
				if(CollectionUtils.isNotEmpty(userInfoIds)){
					userInfoList = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
				}
				// key:线路ID value:线路信息
				Map<Integer, Object> lineInfoMap = null;
				// key:地点ID value:地点名称（起点）
				Map<Integer, String> locationStartInfoMap = null;
				// key:地点ID value:地点名称（终点）
				Map<Integer, String> locationEndInfoMap = null;
				// key:司机表主键ID value:司机名称
				Map<Integer, String> driverInfoMap = null;
				// key:用户ID value:司机名称
				Map<Integer, String> userInfoMap = null;
				//线路LIST转换为MAP
				if (CollectionUtils.isNotEmpty(lineInfoList)) {
					lineInfoMap = CommonUtils.listforMap(lineInfoList, "id", null);
				}
				//地点LIST转换为MAP（起点）
				if (CollectionUtils.isNotEmpty(locationStartInfoList)) {
					locationStartInfoMap = CommonUtils.listforMap(locationStartInfoList, "id", "locationName");
				}
				//地点LIST转换为MAP（终点）
				if (CollectionUtils.isNotEmpty(locationEndInfoList)) {
					locationEndInfoMap = CommonUtils.listforMap(locationEndInfoList, "id", "locationName");
				}
				//临时司机LIST转换为MAP
				if (CollectionUtils.isNotEmpty(driverInfoList)) {
					driverInfoMap = CommonUtils.listforMap(driverInfoList, "id", "driverName");
				}
				//其它司机LIST转换为MAP
				if (CollectionUtils.isNotEmpty(userInfoList)) {
					userInfoMap = CommonUtils.listforMap(userInfoList, "userInfoId", "driverName");
				}
				for (SettlementInfo settlementInfo : settlementInfoList) {
					//如为零散货物信息封装地点表信息
					if(StringUtils.isNotBlank(settlementInfo.getScatteredGoods())){
						// 封装地点信息（起点）
						String startPoints = "";
						if (MapUtils.isNotEmpty(locationStartInfoMap) && locationStartInfoMap.get(settlementInfo.getLineInfoId()) != null) {
							startPoints = locationStartInfoMap.get(settlementInfo.getLineInfoId());
						}
						// 封装地点信息（终点）
						String endPoints = "";
						if (MapUtils.isNotEmpty(locationEndInfoMap) && locationEndInfoMap.get(settlementInfo.getEndPoints()) != null) {
							endPoints = locationEndInfoMap.get(settlementInfo.getEndPoints());
						}
						settlementInfo.setLineName(startPoints+"-->"+endPoints);
					}else{
						// 封装线路信息
						if (MapUtils.isNotEmpty(lineInfoMap) && lineInfoMap.get(settlementInfo.getLineInfoId()) != null) {
							LineInfoPo lineInfoPo = (LineInfoPo) lineInfoMap.get(settlementInfo.getLineInfoId());
							if(lineInfoPo != null){
								settlementInfo.setLineName(lineInfoPo.getStartPoints()+"-->"+lineInfoPo.getEndPoints());
							}
						}
					}
					//封装临时司机名称
					if(MapUtils.isNotEmpty(driverInfoMap) && driverInfoMap.get(settlementInfo.getUserInfoId()) != null){
						settlementInfo.setDriverName(driverInfoMap.get(settlementInfo.getUserInfoId()));
					}
					//封装其它司机名称
					if(MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(settlementInfo.getUserInfoId()) != null){
						settlementInfo.setDriverName(userInfoMap.get(settlementInfo.getUserInfoId()));
					}
				}
			}
		// 5、总数、分页信息封装
		settlementInfoPager.setTotal(totalNum);
		settlementInfoPager.setRows(settlementInfoList);
		}
		model.addAttribute("settlementInfoPager", settlementInfoPager);
		return "template/settlementInfo/re_order_settlement_info_data";
	}

	/**
	 * 新增/编辑返单结算信息初始页
	 * 
	 * @author jiangweiwei
	 * @date 2017年7月12日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initReOrderSettlementInfoPage")
	public String initReOrderSettlementInfoPage(HttpServletRequest request, Model model) {
		// 取出操作类型(1:新增 2:编辑)
		String operateType = request.getParameter("operateType");
		// 取出选择要编辑的结算信息主键ID
		Integer settlementInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("settlementInfoId"))) {
			settlementInfoId = Integer.valueOf(request.getParameter("settlementInfoId"));
		}
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		//用户主机构ID
		Integer orgRootId = null;
		//用户组织机构ID
		Integer orgInfoId = null;
		//用户ID
		Integer userInfoId = null;
		//企业用户类型
		Integer enterpriseUserType = null;
		//回单人
		String returnSingleUser = "";
		if (userInfo != null) {
			orgRootId = userInfo.getOrgRootId();
			orgInfoId = userInfo.getOrgInfoId();
			userInfoId = userInfo.getId();
			enterpriseUserType = userInfo.getEnterpriseUserType();
		}
		String operateTitle = "";
		if ("1".equals(operateType)) {
			operateTitle = "新增结算信息";
			if(enterpriseUserType != null){
				//企业用户类型为企管人员根据组织机构ID查询组织机构信息
				if(enterpriseUserType == 1){
					OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(orgInfoId);
					if(orgInfoPo != null){
						returnSingleUser = orgInfoPo.getOrgDetailInfo().getOrgName();
					}
				}else{
					//企业用户类型为企业普通用户根据用户ID查询用户信息
					EnterpriseUserInfo enterpriseUserInfo = enterpriseUserInfoFacade.getEnterpriseUserInfoByUserInfoId(userInfoId);
					if(enterpriseUserInfo != null){
						returnSingleUser = enterpriseUserInfo.getRealName();
					}
				}
			}
		} else {
			// 封装主机构ID和结算信息表主键ID参数
			Map<String, Object> queryMap = new HashMap<String, Object>();
			queryMap.put("orgRootId", orgRootId);
			queryMap.put("orgInfoId", orgInfoId);
			queryMap.put("settlementInfoId", settlementInfoId);
			// 根据主机构ID和结算信息表主键ID查询结算信息
			SettlementInfo settlementInfo = settlementInfoFacade
					.findReOrderSettlementInfoByOrgRootIdAndSettlementInfoId(queryMap);
			if (settlementInfo != null) {
				// 根据有结算信息表主键ID查询结算有价券使用信息
				String cardCode = settlementCouponUseFacade.getCouponUseInfoCardCodeByList(queryMap);
				settlementInfo.setCardCode(cardCode);
				/*if (settlementInfo.getCouponUseInfoId() != null) {
					CouponInfoPo couponInfoPo = couponInfoFacade
							.getCouponInfoByCouponInfoId(settlementInfo.getCouponUseInfoId());
					// 封装有价券信息
					if (couponInfoPo != null && StringUtils.isNotBlank(couponInfoPo.getCouponName())) {
						settlementInfo.setCouponName(couponInfoPo.getCouponName());
					}
				}*/
				BigDecimal couponIncomeTax = new BigDecimal(0);
				if(settlementInfo.getIsExpense() != null && settlementInfo.getIsExpense() == 0){
					couponIncomeTax = couponTypeInfoFacade.selectTaxRateBySettlementId(settlementInfoId);
					settlementInfo.setCouponIncomeTax(couponIncomeTax);
					settlementInfo.setTaxRate(couponIncomeTax);
				}
				//根据货物信息表主键ID查询货物信息
				if(settlementInfo.getGoodsInfoId() != null){
					GoodsInfo goodsInfo = goodsInfoFacade.getGoodsInfoById(settlementInfo.getGoodsInfoId());
					//封装货物信息
					if(goodsInfo != null && StringUtils.isNotBlank(goodsInfo.getGoodsName())){
						settlementInfo.setGoodsName(goodsInfo.getGoodsName());
					}
				}
				//根据线路ID查询线路信息
				if(settlementInfo.getLineInfoId() != null){
					//判断是否零散货物，如不为零散货物查询线路信息表
					if(StringUtils.isEmpty(settlementInfo.getScatteredGoods())){
						LineInfoPo lineInfoPo = lineInfoFacade.getLineInfoById(settlementInfo.getLineInfoId());
						//封装线路信息
						if(lineInfoPo != null && StringUtils.isNotBlank(lineInfoPo.getStartPoints()) && 
								StringUtils.isNotBlank(lineInfoPo.getEndPoints())){
							settlementInfo.setLineName(lineInfoPo.getStartPoints()+"-->"+lineInfoPo.getEndPoints());
						}
					}else{
						//如为零散货物查询地点表（起点）
						List<LocationInfoPo> locationInfoList = locationInfoFacade.findLocationById(settlementInfo.getLineInfoId());
						//如为零散货物查询地点表（终点）
						List<LocationInfoPo> locationEndInfoList = locationInfoFacade.findLocationById(settlementInfo.getEndPoints());
						//封装地点信息（起点）
						String startLineName = "";
						if(CollectionUtils.isNotEmpty(locationInfoList) && StringUtils.isNotBlank(locationInfoList.get(0).getProvince())
								&& StringUtils.isNotBlank(locationInfoList.get(0).getCity()) && StringUtils.isNotBlank(locationInfoList.get(0).getCounty())){
							startLineName = locationInfoList.get(0).getProvince()+"/"+locationInfoList.get(0).getCity()+"/"+locationInfoList.get(0).getCounty();
						}
						//封装地点信息（终点）
						String endLineName = "";
						if(CollectionUtils.isNotEmpty(locationEndInfoList) && StringUtils.isNotBlank(locationEndInfoList.get(0).getProvince())
								&& StringUtils.isNotBlank(locationEndInfoList.get(0).getCity()) && StringUtils.isNotBlank(locationEndInfoList.get(0).getCounty())){
							endLineName = locationEndInfoList.get(0).getProvince()+"/"+locationEndInfoList.get(0).getCity()+"/"+locationEndInfoList.get(0).getCounty();
						}
						settlementInfo.setLineName(startLineName+"-->"+endLineName);
					}
				}
				//根据承运方查询组织信息
				if(settlementInfo.getShipper() != null){
					OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(settlementInfo.getShipper());
					//封装承运方信息
					if(orgInfoPo != null && StringUtils.isNotBlank(orgInfoPo.getOrgDetailInfo().getOrgName())){
						settlementInfo.setShipperName(orgInfoPo.getOrgDetailInfo().getOrgName());
					}
				}
				//根据项目信息表主键ID查询项目信息
				if(settlementInfo.getProjectInfoId() != null){
					ProjectInfoPo projectInfoPo = projectInfoFacade.getProjectInfoPoById(settlementInfo.getProjectInfoId());
					//封装项目信息
					if(projectInfoPo != null && StringUtils.isNotBlank(projectInfoPo.getProjectName())){
						settlementInfo.setProjectName(projectInfoPo.getProjectName());
					}
				}
				//根据代理方查询组织信息
				if(settlementInfo.getProxy() != null){
					OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(settlementInfo.getProxy());
					//封装代理方信息
					if(orgInfoPo != null && StringUtils.isNotBlank(orgInfoPo.getOrgDetailInfo().getOrgName())){
						settlementInfo.setProxyName(orgInfoPo.getOrgDetailInfo().getOrgName());
					}
				}
				//根据制单人查询企业用户信息
				if(settlementInfo.getMakeUser() != null){
					EnterpriseUserInfo enterpriseUserInfo = enterpriseUserInfoFacade.getEnterpriseUserInfoByUserInfoId(settlementInfo.getMakeUser());
					//封装制单人信息
					if(enterpriseUserInfo != null && StringUtils.isNotBlank(enterpriseUserInfo.getRealName())){
						settlementInfo.setUserName(enterpriseUserInfo.getRealName());
					}
				}
				//根据核算主体查询组织信息
				if(settlementInfo.getAccountingEntity() != null){
					OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(settlementInfo.getAccountingEntity());
					//封装核算主体信息
					if(orgInfoPo != null && StringUtils.isNotBlank(orgInfoPo.getOrgName())){
						settlementInfo.setAccountingEntityName(orgInfoPo.getOrgName());
					}
				}
				//临时司机根据司机表主键ID查询司机名称
				if(settlementInfo.getDriverUserRole() != null && settlementInfo.getDriverUserRole() == 2 && settlementInfo.getUserInfoId() != null){
					DriverInfo driverInfo = driverInfoFacade.findTDriverInfoMationById(settlementInfo.getUserInfoId());
					settlementInfo.setDriverName(driverInfo.getDriverName());
				}
				//根据车牌号码查询车辆表信息
				if(settlementInfo.getCarCode() != null && !"".equals(settlementInfo.getCarCode())){
					CarInfoPo carInfoPo = carInfoFacade.findCarInfoByCarCode(settlementInfo.getCarCode());
					//封装车辆归属
					if(carInfoPo != null && carInfoPo.getCarPart() != null){
						settlementInfo.setCarPart(carInfoPo.getCarPart());
					}
				}
			}
			model.addAttribute("settlementInfo", settlementInfo);
			operateTitle = "编辑结算信息";
		}
		model.addAttribute("operateTitle", operateTitle);
		model.addAttribute("operateType", operateType);
		model.addAttribute("returnSingleUser", returnSingleUser);
		return "template/settlementInfo/add_re_order_settlement_info";
	}

	/**
	 * 新增/编辑返单结算信息
	 * 
	 * @author jiangweiwei
	 * @date 2017年7月21日
	 * @param request
	 * @param orgModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateReOrderSettlementInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateReOrderSettlementInfo(HttpServletRequest request, SettlementModel settlementModel) {
		JSONObject jo = new JSONObject();
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		SettlementInfo settlementInfo = settlementModel.getSettlementInfo();
		//结算有价券使用信息
		List<SettlementCouponUse> settlementCouponUseList = new ArrayList<SettlementCouponUse>();
		//结算有价券使用信息(需要修改的有价券信息集合)
		List<SettlementCouponUse> settlementCouponUses = new ArrayList<SettlementCouponUse>();
		Map<String,Object> params = new HashMap<String, Object>();
		SettlementCouponUse settlementCouponUse = new SettlementCouponUse();
		if (settlementInfo != null) {
			settlementInfo.setDriverUserRole(settlementInfo.getDriverType());
			settlementInfo.setOrgInfoId(orgInfoId);
			// 格式化发货时间
			settlementInfo.setForwardingTime(DateUtils.formatDate(settlementInfo.getForwardingTimeStr()));
			// 格式化到货时间
			settlementInfo.setArriveTime(DateUtils.formatDate(settlementInfo.getArriveTimeStr()));
			//获取结算有价券使用信息
			if(settlementInfo.getCouponarray() != null && !"".equals(settlementInfo.getCouponarray())){
				settlementCouponUseList = CommonUtils.jsonStringForList(settlementInfo.getCouponarray(),settlementCouponUse);
				settlementCouponUse.setSettlementInfoId(settlementInfo.getId());
				settlementCouponUse.setOrgRootId(orgRootId);
				settlementCouponUse.setOrgInfoId(orgInfoId);
				settlementCouponUse.setCreateUser(userInfoId);
				settlementCouponUse.setCreateTime(Calendar.getInstance().getTime());
				settlementCouponUse.setSettlementInfoId(settlementInfo.getId());
				params.put("settlementCouponUseList", settlementCouponUseList);
				params.put("settlementCouponUse", settlementCouponUse);
				//结算有价券领用信息MAP，key:有价券领用信息表主键ID value:使用金额
				Map<Integer,BigDecimal> settlementCouponUseMap = new HashMap<Integer,BigDecimal>();
				if(CollectionUtils.isNotEmpty(settlementCouponUseList)){
					settlementCouponUseMap = CommonUtils.listforMap(settlementCouponUseList, "couponUseInfoId", "usePrice");
				}
				//根据领用信息表主键ID和所属机构ID查询余额，比较使用金额是否大于余额
				List<CouponUseInfo> couponUseInfoList = couponUseInfoFacade.getCouponInfoIdByCouponUserInfoIds(params);
				if(CollectionUtils.isNotEmpty(couponUseInfoList)){
					for(CouponUseInfo couponUseInfo : couponUseInfoList){
						if(MapUtils.isNotEmpty(settlementCouponUseMap) && settlementCouponUseMap.get(couponUseInfo.getId()) != null){
							if(settlementCouponUseMap.get(couponUseInfo.getId()).compareTo(couponUseInfo.getBalance()) == 1){
								jo.put("msg", "有价券使用金额超出余额，请重新选择！");
								jo.put("success", false);
								return jo;
							}
						}
					}
				}
			}
			// 新增结算信息
			if (settlementInfo.getId() == null) {
				//根据当前年和组织机构ID生成redis key值
				String key = AutoCoverUtils.getYearAndAutoCoverOrg(orgInfoId);
				//根据key值从redis中取出结算单号
				String settlementId = (String)RedisUtil.get(key);
				//如结算单号不为空，则当前结算单号加1
				if(settlementId != null ){
					settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId,settlementId);
				}else{
					//否则根据当前年和组织机构ID加六位序列号初始化一个结算单号如（2017000001000001）
					Map<String,Object> queryMap = new HashMap<String,Object>();
					queryMap.put("orgInfoId", orgInfoId);
					queryMap.put("currentYear", String.valueOf(Calendar.YEAR));
					settlementId = settlementInfoFacade.getSettlementIdByOrgInfoIdAndYear(queryMap);
					if(settlementId != null && !"".equals(settlementId)){
						settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId,settlementId);
					}else{
						settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId);
						
					}
				}
				settlementInfo.setSettlementId(settlementId);
				settlementInfo.setOrgRootId(orgRootId);
				settlementInfo.setMakeUser(userInfoId);
				settlementInfo.setSettlementType(2);
				//根据运单编号查询运单状态，判断运单是否已挂账或已派单
				WaybillInfoPo waybill = waybillInfoFacade.getWaybillInfoById(settlementInfo.getWaybillInfoId());
				if(waybill == null || (waybill.getWaybillStatus() !=1 && waybill.getWaybillStatus() !=3 && waybill.getWaybillStatus() != 4)){
					jo.put("msg", "运单已挂账或已派单，请正常挂账！");
					jo.put("success", false);
					return jo;
				}
				try {
					//根据领用信息表主键ID和所属机构ID修改有价券领用信息表余额
					if(CollectionUtils.isNotEmpty(settlementCouponUseList)){
						params.put("settlementCouponUses", settlementCouponUseList);
						couponUseInfoFacade.updateCouponUseInfoByCouponUserInfoIds(params);
						//新增结算信息
						settlementInfoFacade.insertSettlementInfo(settlementInfo, userRole,orgInfoId,key);
						for(SettlementCouponUse sCouponUse : settlementCouponUseList){
							sCouponUse.setOrgRootId(orgRootId);
							sCouponUse.setOrgInfoId(orgInfoId);
							sCouponUse.setCreateUser(userInfoId);
							sCouponUse.setCreateTime(Calendar.getInstance().getTime());
							sCouponUse.setSettlementInfoId(settlementInfo.getId());
							sCouponUse.setSettlementId(settlementId);
						}
						//新增结算有价券使用表
						settlementCouponUseFacade.insertSettlementCouponUse(settlementCouponUseList);
					}else{
						//新增结算信息
						settlementInfoFacade.insertSettlementInfo(settlementInfo, userRole,orgInfoId,key);
					}
					jo.put("success", true);
					jo.put("msg", "结算信息新增成功！");
				} catch (Exception e) {
					log.error("维护结算信息异常", e);
					jo = new JSONObject();
					jo.put("success", false);
					jo.put("msg", "维护结算信息服务异常，请稍后重试");
				}
			}else{
				Map<String,Object> queryMap = new HashMap<String,Object>();
				queryMap.put("orgRootId", orgRootId);
				queryMap.put("settlementInfoId", settlementInfo.getId());
				SettlementInfo sInfo = settlementInfoFacade.findReOrderSettlementInfoByOrgRootIdAndSettlementInfoId(queryMap);
				if(sInfo == null && sInfo.getSettlementStatus() != 4){
					jo.put("msg", "结算单正在审核中或已审核通过！");
					jo.put("success", false);
					return jo;
				}
				//根据组织机构ID和结算信息表主键ID查询结算有价券使用表信息
				List<SettlementCouponUse> sCouponUseList = new ArrayList<SettlementCouponUse>();
				if(MapUtils.isNotEmpty(params)){
					if(CollectionUtils.isNotEmpty(settlementCouponUseList)){
						for(SettlementCouponUse sCouponUse : settlementCouponUseList){
							sCouponUse.setSettlementInfoId(settlementInfo.getId());
						}
						params.put("settlementCouponUseList", settlementCouponUseList);
					}
					sCouponUseList = settlementCouponUseFacade.getSettlementCouponUseBySettlementInfoId(params);
				}
				//结算有价券领用信息MAP，key:结算信息表主键ID value:结算有价券信息实体
				Map<Integer,Object> settlementCouponUseMap = new HashMap<Integer,Object>();
				if(CollectionUtils.isNotEmpty(settlementCouponUseList)){
					for(SettlementCouponUse sCouponUse : settlementCouponUseList){
						settlementCouponUses.add(sCouponUse);
					}
					settlementCouponUseMap = CommonUtils.listforMap(settlementCouponUses, "couponUseInfoId", null);
				}
				if(CollectionUtils.isNotEmpty(sCouponUseList)){
					for(int i = 0;i<sCouponUseList.size();i++){
						//查看选择的有价券信息是否存在于结算有价券信息表
						if(MapUtils.isNotEmpty(settlementCouponUseMap) && settlementCouponUseMap.get(sCouponUseList.get(i).getCouponUseInfoId()) != null){
							SettlementCouponUse sCouponUse = (SettlementCouponUse) settlementCouponUseMap.get(sCouponUseList.get(i).getCouponUseInfoId());
							for(int j = 0;j<settlementCouponUses.size();j++){
								if(sCouponUse.getCouponUseInfoId() == settlementCouponUses.get(j).getCouponUseInfoId()){
									BigDecimal balance = sCouponUseList.get(i).getBalance().add(sCouponUseList.get(i).getUsePrice()).subtract(sCouponUse.getUsePrice());
									settlementCouponUses.get(j).setBalance(balance);
									settlementCouponUseList.get(j).setBalance(balance);
								}
							}
						}else{
							//不存在，使用金额+余额
							sCouponUseList.get(i).setBalance(sCouponUseList.get(i).getUsePrice().add(sCouponUseList.get(i).getBalance()));
							settlementCouponUses.add(sCouponUseList.get(i));
						}
					}
					//根据结算信息表主键ID删除结算结算有价券使用表信息
					List<Integer> settlementInfoIds = new ArrayList<Integer>();
					settlementInfoIds.add(settlementInfo.getId());
					settlementCouponUseFacade.deleteSettlementCouponUse(settlementInfoIds);
				}
				//根据领用信息表主键ID和所属机构ID修改有价券领用信息表余额
				if(CollectionUtils.isNotEmpty(settlementCouponUses)){
					params.put("settlementCouponUses", settlementCouponUses);
					if(MapUtils.isNotEmpty(params)){
						couponUseInfoFacade.updateCouponUseInfoByCouponUserInfoIds(params);
					}
				}
				if(CollectionUtils.isNotEmpty(settlementCouponUseList)){
					for(SettlementCouponUse sCouponUse : settlementCouponUseList){
						sCouponUse.setOrgRootId(orgRootId);
						sCouponUse.setOrgInfoId(orgInfoId);
						sCouponUse.setCreateUser(userInfoId);
						sCouponUse.setCreateTime(Calendar.getInstance().getTime());
						sCouponUse.setSettlementInfoId(settlementInfo.getId());
						sCouponUse.setSettlementId(settlementInfo.getSettlementId());
					}
					//新增结算有价券使用表信息
					settlementCouponUseFacade.insertSettlementCouponUse(settlementCouponUseList);
				}
				//更新结算信息
				try{
					settlementInfo.setUpdateTime(new java.sql.Date(new Date().getTime()));
					settlementInfo.setUpdateUser(userInfoId);
					settlementInfo.setSettlementType(2);
					settlementInfoFacade.updateSettlementInfo(settlementInfo,userRole);
					jo.put("success", true);
					jo.put("msg", "结算信息编辑成功！");
				} catch (Exception e) {
					log.error("维护结算信息异常", e);
					jo = new JSONObject();
					jo.put("success", false);
					jo.put("msg", "维护结算信息服务异常，请稍后重试");
				}
			}
			DriverWaybillMaintainPo driverWaybillMaintainPo = new DriverWaybillMaintainPo();
			driverWaybillMaintainPo.setWaybillInfoId(settlementInfo.getWaybillInfoId());
			driverWaybillMaintainPo.setRootWaybillInfoId(settlementInfo.getRootWaybillInfoId());
			driverWaybillMaintainPo.setParentWaybillInfoId(settlementInfo.getParentWaybillInfoId());
			driverWaybillMaintainPo.setEntrustOrgRoot(orgRootId);
			driverWaybillMaintainPo.setForwardingUnit(settlementInfo.getForwardingUnit());
			driverWaybillMaintainPo.setConsignee(settlementInfo.getConsignee());
			driverWaybillMaintainPo.setLoadingAmount(settlementInfo.getForwardingTonnage());
			driverWaybillMaintainPo.setLoadingDate(DateUtils.formatDate(settlementInfo.getForwardingTimeStr()));
			driverWaybillMaintainPo.setUnloadingAmount(settlementInfo.getArriveTonnage());
			driverWaybillMaintainPo.setUnloadingDate(DateUtils.formatDate(settlementInfo.getArriveTimeStr()));
			driverWaybillMaintainPo.setCreateUser(userInfoId);
			driverWaybillMaintainPo.setCreateTime(Calendar.getInstance().getTime());
			driverWaybillMaintainPo.setEntrust(settlementInfo.getEntrust());
			Map<String,Object> driverWaybillMaintainMap = new HashMap<String,Object>();
			List<Integer> driverWaybillMaintainList = new ArrayList<Integer>();
			driverWaybillMaintainList.add(settlementInfo.getRootWaybillInfoId());
			driverWaybillMaintainMap.put("orgRootId", orgRootId);
			driverWaybillMaintainMap.put("driverWaybillMaintainList", driverWaybillMaintainList);
			if(CollectionUtils.isNotEmpty(driverWaybillMaintainList) && MapUtils.isNotEmpty(driverWaybillMaintainMap)){
				//根据委托方主机构和主运单编号删除司机运单维护表（批量）
				driverWaybillMaintainPoFacade.deleteDriverWaybillMaintain(driverWaybillMaintainMap);
			}
			driverWaybillMaintainPoFacade.addDriverWaybillMaintainInfo(driverWaybillMaintainPo);
			//返单结算时获取司机磅单图片
			DriverWaybillImgDetailInfo driverWaybillImgDetail = new DriverWaybillImgDetailInfo();
			List<DriverWaybillImgDetailInfo> driverWaybillImgDetailList = new ArrayList<DriverWaybillImgDetailInfo>();
			if(settlementInfo.getReOrderSettlementPhoto() != null && !"".equals(settlementInfo.getReOrderSettlementPhoto())){
				driverWaybillImgDetailList = CommonUtils.jsonStringForList(settlementInfo.getReOrderSettlementPhoto(),driverWaybillImgDetail);
			}
			if(CollectionUtils.isNotEmpty(driverWaybillImgDetailList)){
				List<Integer> rootWaybillInfoIds = new ArrayList<Integer>();
				for(DriverWaybillImgDetailInfo driverWaybillImgDetailInfo : driverWaybillImgDetailList){
					driverWaybillImgDetailInfo.setDriverWaybillMaintainId(driverWaybillMaintainPo.getId());
					driverWaybillImgDetailInfo.setWaybillInfoId(settlementInfo.getWaybillInfoId());
					driverWaybillImgDetailInfo.setRootWaybillInfoId(settlementInfo.getRootWaybillInfoId());
					driverWaybillImgDetailInfo.setParentWaybillInfoId(settlementInfo.getParentWaybillInfoId());
					driverWaybillImgDetailInfo.setCreateUser(userInfoId);
					driverWaybillImgDetailInfo.setCreateTime(Calendar.getInstance().getTime());
				}
				rootWaybillInfoIds.add(settlementInfo.getRootWaybillInfoId());
				//根据主运单编号删除司机运单图片明细表
				driverWaybillImgDetailInfoFacade.deleteDriverWaybillImgDetailInfo(rootWaybillInfoIds);
				//新增司机运单图片明细表信息
				driverWaybillImgDetailInfoFacade.addReOrderDriverWaybillImgDetailInfo(driverWaybillImgDetailList);
			}
			//根据主运单编号修改运单状态，且不等于运单编号的运单（批量）
			WaybillInfoPo waybillInfoPo = new WaybillInfoPo();
			waybillInfoPo.setId(settlementInfo.getWaybillInfoId());
			waybillInfoPo.setRootWaybillInfoId(settlementInfo.getRootWaybillInfoId());
			List<WaybillInfoPo> waybillInfoList = new ArrayList<WaybillInfoPo>();
			List<WaybillInfoPo> waybillInfoPoList = new ArrayList<WaybillInfoPo>();
			waybillInfoList.add(waybillInfoPo);
			//根据主运单编号查询运单历史状态的运单
			if(CollectionUtils.isNotEmpty(waybillInfoList)){
				waybillInfoPoList = waybillInfoFacade.getWaybillInfoByRootWaybillInfoIds(waybillInfoList);
			}
			if(CollectionUtils.isNotEmpty(waybillInfoPoList)){
				for(WaybillInfoPo waybillInfo : waybillInfoPoList){
					waybillInfo.setOldWaybillStatus(waybillInfo.getWaybillStatus());
					waybillInfo.setWaybillStatus(8);
				}
				waybillInfoFacade.updateWaybillInfoById(waybillInfoPoList);
			}
		}
		return jo;
	}

	/**
	 * 应付调差返单结算信息初始页
	 * @author jiangweiwei
	 * @date 2017年7月22日
	 * @param request
	 * @param model
	 * @return
	 */
//	@RequestMapping("/initReOrderSettlementInfoDifferencePage")
//	public String initReOrderSettlementInfoDifferencePage(HttpServletRequest request, Model model) {
//
//		// 结算信息表主键ID
//		Integer settlementInfoId = null;
//		if (request.getParameter("id") != null) {
//			settlementInfoId = Integer.valueOf(request.getParameter("id"));
//		}
//		model.addAttribute("settlementInfoId", settlementInfoId);
//		return "template/settlementInfo/show_settlement_info_difference_page";
//	}

	/**
	 * 应付调差返单结算信息
	 * 
	 * @author jiangweiwei
	 * @date 2017年7月22日
	 * @param request
	 * @param orgModel
	 * @return
	 */
//	@RequestMapping(value = "/reOrderSettlementInfoDifference", produces = "application/json; charset=utf-8")
//	@ResponseBody
//	public JSONObject reOrderSettlementInfoDifference(HttpServletRequest request, SettlementModel settlementModel) {
//		JSONObject jo = new JSONObject();
//		// 从session中取出当前用户的主机构ID、用户ID
//		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
//		Integer orgRootId = userInfo.getOrgRootId();
//		Integer userInfoId = userInfo.getId();
//		SettlementRevisePo settlementRevisePo = settlementModel.getSettlementRevisePo();
//		if (settlementRevisePo != null) {
//			settlementRevisePo.setOrgRootId(orgRootId);
//			try {
//				settlementReviseFacade.addSettlementRevise(settlementRevisePo, userInfoId);
//				jo.put("success", true);
//				jo.put("msg", "结算信息调差成功！");
//			} catch (Exception e) {
//				jo.put("success", false);
//				jo.put("msg", "结算调差信息异常，请稍后重试！");
//			}
//		}
//		return jo;
//	}

	/**
	 * 返单结算时查询运单信息初始页
	 * 
	 * @author jiangweiwei
	 * @date 2017年7月12日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showSettlementWaybillInfoPage")
	public String initWaybillInfoPage(HttpServletRequest request, Model model) {
//		DataPager<WaybillInfoPo> waybillInfoPager = new DataPager<WaybillInfoPo>();
//		// 从session中取出当前用户的主机构ID
//		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
//		Integer userRole = userInfo.getUserRole();
//		List<WaybillInfoPo> waybillInfoListResult = new ArrayList<WaybillInfoPo>();
//		Integer totalNum = 0;
//		if(userRole == 2){
//			Integer orgRootId = userInfo.getOrgRootId();
//			Integer userId = userInfo.getId();
//			// 1、获取并处理参数
//			Map<String, Object> params = this.paramsToMap(request);
//			// 页数
//			Integer page = 1;
//			if (params.get("page") != null) {
//				page = Integer.valueOf(params.get("page").toString());
//			}
//			waybillInfoPager.setPage(page);
//			// 行数
//			Integer rows = 10;
//			if (params.get("rows") != null) {
//				rows = Integer.valueOf(params.get("rows").toString());
//			}
//			waybillInfoPager.setSize(rows);
//			// 运单号
//			String waybillId = null;
//			if (params.get("waybillInput") != null) {
//				waybillId = params.get("waybillInput").toString();
//			}
//			//货物
//			String goodsName = null;
//			if (params.get("goodsNameQuery") != null) {
//				goodsName = params.get("goodsNameQuery").toString();
//			}
//			//零散货物
//			String scatteredGoods = null;
//			if (params.get("scatteredGoodsQuery") != null) {
//				scatteredGoods = params.get("scatteredGoodsQuery").toString();
//			}
//			//发货单位
//			String forwardingUnit = null;
//			if (params.get("forwardingUnitQuery") != null) {
//				forwardingUnit = params.get("forwardingUnitQuery").toString();
//			}
//			//到货单位
//			String consignee = null;
//			if (params.get("consigneeQuery") != null) {
//				consignee = params.get("consigneeQuery").toString();
//			}
//			//委托方
//			String entrustName = null;
//			if (params.get("entrustNameQuery") != null) {
//				entrustName = params.get("entrustNameQuery").toString();
//			}
//			//承运方
//			String shipperName = null;
//			if (params.get("shipperQuery") != null) {
//				shipperName = params.get("shipperQuery").toString();
//			}
//			//制单开始日期
//			Date makeStartTime = null;
//			if(params.get("makeStartTime") != null){
//				makeStartTime = DateUtils.formatTime(params.get("makeStartTime").toString());
//			}
//			//制单结束日期
//			Date makeEndTime = null;
//			if(params.get("makeEndTime") != null){
//				makeEndTime = DateUtils.formatTime(params.get("makeEndTime").toString());
//			}
//			// 2、封装参数
//			Map<String, Object> queryMap = new HashMap<String, Object>();
//			queryMap.put("start", (page - 1) * rows);
//			queryMap.put("rows", rows);
//			queryMap.put("uOrgRootId", orgRootId);
//			queryMap.put("uId", userId);
//			queryMap.put("waybillId", waybillId);
//			queryMap.put("goodsName", goodsName);
//			queryMap.put("scatteredGoods", scatteredGoods);
//			queryMap.put("forwardingUnit", forwardingUnit);
//			queryMap.put("consignee", consignee);
//			queryMap.put("entrustName", entrustName);
//			queryMap.put("shipperName", shipperName);
//			queryMap.put("makeStartTime", makeStartTime);
//			queryMap.put("makeEndTime", makeEndTime);
//			// 根据登录用户主机构ID和登录用户ID查询用户数据权限表，获得登录用户数据权限
//			List<UserDataAuthPo> userDataAuthList = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(queryMap);
//			List<String> userDataAuthListStrs = new ArrayList<String>();
//			// 登录用户必须存在数据权限
//			if (userDataAuthList != null && userDataAuthList.size() > 0) {
//				for (UserDataAuthPo userDataAuthPo : userDataAuthList) {
//					userDataAuthListStrs.add(userDataAuthPo.getConditionGroup());
//				}
//			}
//			queryMap.put("userDataAuthListStrs", userDataAuthListStrs);
//			// 根据登录用户主机构ID查询零散货物运单信息
//			List<Integer> scatteredGoodsList = waybillInfoFacade.findWaybillInfoIsReOrderSettlementByOrgRootId(orgRootId);
//			queryMap.put("scatteredGoodsList", scatteredGoodsList);
//			if (CollectionUtils.isNotEmpty(userDataAuthListStrs) || CollectionUtils.isNotEmpty(scatteredGoodsList)) {
//				// 3、查询运单信息总数
//				totalNum = waybillInfoFacade.countWaybillInfoIsReOrderSettlementForPage(queryMap);
//				// 4、分页查询运单信息
//				waybillInfoListResult = waybillInfoFacade
//						.findWaybillInfoIsReOrderSettlementForPage(queryMap);
//				// 查询出的运单信息不为空
////				if (CollectionUtils.isNotEmpty(waybillInfoListResult)) {
////					// 运单主键集合
////					List<Integer> waybillInfoIdList = CommonUtils.getValueList(waybillInfoListResult, "id");
////					// 封装查询结算信息条件
////					Map<String, Object> settlementQueryMap = new HashMap<String, Object>();
////					// 主机构ID
////					settlementQueryMap.put("orgRootId", orgRootId);
////					// 是否挂账红冲
////					settlementQueryMap.put("isWriteOff", 0);
////					// 结算类型
////					settlementQueryMap.put("settlementType", 2);
////					// 查询出的运单信息表主键ID集合
////					settlementQueryMap.put("waybillInfoIdList", waybillInfoIdList);
////					// 根据主机构ID、运单信息表主键ID、是否挂账红冲、结算类型查询结算信息
////					List<SettlementInfo> settlementInfoList = settlementInfoFacade.findSettlementByList(settlementQueryMap);
////					if (CollectionUtils.isNotEmpty(settlementInfoList)) {
////						Map<String, Object> waybillInfoMap = CommonUtils.listforMap(settlementInfoList, "waybillInfoId", null);
////						for (int i = 0; i < waybillInfoListResult.size(); i++) {
////							if (MapUtils.isNotEmpty(waybillInfoMap)
////									&& waybillInfoMap.get(waybillInfoListResult.get(i).getId()) == null) {
////								waybillInfoList.add(waybillInfoListResult.get(i));
////							}
////						}
////						totalNum = waybillInfoList.size();
////					}else{
////						waybillInfoList = waybillInfoListResult;
////						totalNum = waybillInfoList.size();
////					}
////				}
//				// 5、根据运单信息中货物ID查询货物信息表货物名称
//				if (CollectionUtils.isNotEmpty(waybillInfoListResult)) {
//					// 货物
//					List<Integer> goodsInfoIds = CommonUtils.getValueList(waybillInfoListResult, "goodsInfoId");
//					List<GoodsInfo> goodsInfoList = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
//					// key:货物ID value:货物名称
//					Map<Integer, String> goodsfoMap = null;
//					if (CollectionUtils.isNotEmpty(goodsInfoList)) {
//						goodsfoMap = CommonUtils.listforMap(goodsInfoList, "id", "goodsName");
//					}
//					//线路线路表主键ID集合
//					List<Integer>lineInfoIdList = new ArrayList<Integer>();
//					//地点表主键ID集合（起点）
//					List<Integer> locationStartInfoIdList = new ArrayList<Integer>();
//					//地点表主键ID集合（终点）
//					List<Integer> locationEndInfoIdList = new ArrayList<Integer>();
//					//非零散货物线路
//					List<LineInfoPo>lineInfoList = new ArrayList<LineInfoPo>();
//					// 零散货物线路（起点）
//					List<LocationInfoPo> locationStartInfoList = new ArrayList<LocationInfoPo>();
//					// 零散货物线路（终点）
//					List<LocationInfoPo> locationEndInfoList = new ArrayList<LocationInfoPo>();
//					for(WaybillInfoPo waybillInfoPo : waybillInfoListResult){
//						//判断如为零散货物
//						if(StringUtils.isNotBlank(waybillInfoPo.getScatteredGoods())){
//							locationStartInfoIdList.add(waybillInfoPo.getLineInfoId());
//							locationEndInfoIdList.add(waybillInfoPo.getEndPoints());
//						}else{
//							lineInfoIdList.add(waybillInfoPo.getLineInfoId());
//						}
//					}
//					//非零散货物线路
//					if(CollectionUtils.isNotEmpty(lineInfoIdList)){
//						lineInfoList = lineInfoFacade.findLineInfoByIds(lineInfoIdList);
//					}
//					//零散货物线路（起点）
//					if(CollectionUtils.isNotEmpty(locationStartInfoIdList)){
//						locationStartInfoList = locationInfoFacade.findLocationNameByIds(locationStartInfoIdList);
//					}
//					//零散货物线路（终点）
//					if(CollectionUtils.isNotEmpty(locationEndInfoIdList)){
//						locationEndInfoList = locationInfoFacade.findLocationNameByIds(locationEndInfoIdList);
//					}
//					// key:线路ID value:线路名称
//					Map<Integer, Object> lineInfoMap = null;
//					// key:地点ID value:地点名称（起点）
//					Map<Integer, String> locationStartInfoMap = null;
//					// key:地点ID value:地点名称（终点）
//					Map<Integer, String> locationEndInfoMap = null;
//					if (CollectionUtils.isNotEmpty(lineInfoList)) {
//						lineInfoMap = CommonUtils.listforMap(lineInfoList, "id", null);
//					}
//					//地点LIST转换为MAP（起点）
//					if (CollectionUtils.isNotEmpty(locationStartInfoList)) {
//						locationStartInfoMap = CommonUtils.listforMap(locationStartInfoList, "id", "locationName");
//					}
//					//地点LIST转换为MAP（终点）
//					if (CollectionUtils.isNotEmpty(locationEndInfoList)) {
//						locationEndInfoMap = CommonUtils.listforMap(locationEndInfoList, "id", "locationName");
//					}
//					// 委托方
//					List<Integer> entrustIds = CommonUtils.getValueList(waybillInfoListResult, "entrust");
//					List<OrgInfoPo> entrustList = orgInfoFacade.findOrgNameByIds(entrustIds);
//					// key:组织ID value:组织名称
//					Map<Integer, String> entrusMap = null;
//					if (CollectionUtils.isNotEmpty(entrustList)) {
//						entrusMap = CommonUtils.listforMap(entrustList, "id", "orgName");
//					}
//					// 承运方
//					List<Integer> shipperIds = CommonUtils.getValueList(waybillInfoListResult, "shipper");
//					List<OrgInfoPo> shipperList = orgInfoFacade.findOrgNameByIds(shipperIds);
//					// key:组织ID value:组织名称
//					Map<Integer, String> shipperMap = null;
//					if (CollectionUtils.isNotEmpty(shipperList)) {
//						shipperMap = CommonUtils.listforMap(shipperList, "id", "orgName");
//					}
//					// 承运方项目
//					List<Integer> shipperProjectIds = CommonUtils.getValueList(waybillInfoListResult, "shipperProject");
//					List<ProjectInfoPo> shipperProjectList = null;
//					if(CollectionUtils.isNotEmpty(shipperProjectIds)){
//						shipperProjectList = projectInfoFacade.findProjectInfoPoByIds(shipperProjectIds);
//					}
//					// key:项目表主键ID value:项目名称
//					Map<Integer, String> shipperProjectMap = null;
//					if (CollectionUtils.isNotEmpty(shipperProjectList)) {
//						shipperProjectMap = CommonUtils.listforMap(shipperProjectList, "id", "projectName");
//					}
//					for (WaybillInfoPo waybillInfoPo : waybillInfoListResult) {
//						// 封装货物名称
//						if (MapUtils.isNotEmpty(goodsfoMap) && goodsfoMap.get(waybillInfoPo.getGoodsInfoId()) != null) {
//							waybillInfoPo.setGoodsName(goodsfoMap.get(waybillInfoPo.getGoodsInfoId()));
//						}
//						if(StringUtils.isNotBlank(waybillInfoPo.getScatteredGoods())){
//							// 封装地点信息（起点）
//							String startPoints = "";
//							if (MapUtils.isNotEmpty(locationStartInfoMap) && locationStartInfoMap.get(waybillInfoPo.getLineInfoId()) != null) {
//								startPoints = locationStartInfoMap.get(waybillInfoPo.getLineInfoId());
//							}
//							// 封装地点信息（终点）
//							String endPoints = "";
//							if (MapUtils.isNotEmpty(locationEndInfoMap) && locationEndInfoMap.get(waybillInfoPo.getEndPoints()) != null) {
//								endPoints = locationEndInfoMap.get(waybillInfoPo.getEndPoints());
//							}
//							waybillInfoPo.setLineInfoName(startPoints+"-->"+endPoints);
//						}else{
//							// 封装线路信息
//							if (MapUtils.isNotEmpty(lineInfoMap) && lineInfoMap.get(waybillInfoPo.getLineInfoId()) != null) {
//								LineInfoPo lineInfoPo = (LineInfoPo) lineInfoMap.get(waybillInfoPo.getLineInfoId());
//								if(lineInfoPo != null){
//									waybillInfoPo.setLineInfoName(lineInfoPo.getStartPoints()+"-->"+lineInfoPo.getEndPoints());
//								}
//							}
//						}
//						// 封装委托方名称
//						if (MapUtils.isNotEmpty(entrusMap) && entrusMap.get(waybillInfoPo.getEntrust()) != null) {
//							waybillInfoPo.setEntrustName(entrusMap.get(waybillInfoPo.getEntrust()));
//						}
//						// 封装承运方名称
//						if (MapUtils.isNotEmpty(shipperMap) && shipperMap.get(waybillInfoPo.getShipper()) != null) {
//							waybillInfoPo.setShipperName(shipperMap.get(waybillInfoPo.getShipper()));
//						}
//						// 封装承运方项目
//						if (MapUtils.isNotEmpty(shipperProjectMap) && shipperProjectMap.get(waybillInfoPo.getShipperProject()) != null) {
//							waybillInfoPo.setProjectName(shipperProjectMap.get(waybillInfoPo.getShipperProject()));
//						}
//					}
//				}
//			}
//		}
//		// 6、总数、分页信息封装
//		waybillInfoPager.setTotal(totalNum);
//		waybillInfoPager.setRows(waybillInfoListResult);
//		model.addAttribute("waybillInfoPager", waybillInfoPager);
		return "template/settlementInfo/show_settlement_waybill_info_page";
	}
	
	/**
	 * 返单结算时查询运单信息
	 * 
	 * @author jiangweiwei
	 * @date 2017年7月12日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/listSettlementWaybillInfo")
	public String listSettlementWaybillInfo(HttpServletRequest request, Model model) {
		DataPager<WaybillInfoPo> waybillInfoPager = new DataPager<WaybillInfoPo>();
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();
		List<WaybillInfoPo> waybillInfoListResult = new ArrayList<WaybillInfoPo>();
		Integer totalNum = 0;
		if(userRole == 2){
			Integer orgRootId = userInfo.getOrgRootId();
			Integer userId = userInfo.getId();
			// 1、获取并处理参数
			Map<String, Object> params = this.paramsToMap(request);
			// 页数
			Integer page = 1;
			if (params.get("page") != null) {
				page = Integer.valueOf(params.get("page").toString());
			}
			waybillInfoPager.setPage(page);
			// 行数
			Integer rows = 10;
			if (params.get("rows") != null) {
				rows = Integer.valueOf(params.get("rows").toString());
			}
			waybillInfoPager.setSize(rows);
			// 运单号
			String waybillId = null;
			if (params.get("waybillInput") != null) {
				waybillId = params.get("waybillInput").toString();
			}
			//货物
			String goodsName = null;
			if (params.get("goodsNameQuery") != null) {
				goodsName = params.get("goodsNameQuery").toString();
			}
			//零散货物
			String scatteredGoods = null;
			if (params.get("scatteredGoodsQuery") != null) {
				scatteredGoods = params.get("scatteredGoodsQuery").toString();
			}
			//发货单位
			String forwardingUnit = null;
			if (params.get("forwardingUnitQuery") != null) {
				forwardingUnit = params.get("forwardingUnitQuery").toString();
			}
			//到货单位
			String consignee = null;
			if (params.get("consigneeQuery") != null) {
				consignee = params.get("consigneeQuery").toString();
			}
			//委托方
			String entrustName = null;
			if (params.get("entrustNameQuery") != null) {
				entrustName = params.get("entrustNameQuery").toString();
			}
			//承运方
			String shipperName = null;
			if (params.get("shipperQuery") != null) {
				shipperName = params.get("shipperQuery").toString();
			}
			//制单开始日期
			Date makeStartTime = null;
			if(params.get("makeStartTime") != null){
				makeStartTime = DateUtils.formatTime(params.get("makeStartTime").toString());
			}
			//制单结束日期
			Date makeEndTime = null;
			if(params.get("makeEndTime") != null){
				makeEndTime = DateUtils.formatTime(params.get("makeEndTime").toString());
			}
			// 2、封装参数
			Map<String, Object> queryMap = new HashMap<String, Object>();
			queryMap.put("start", (page - 1) * rows);
			queryMap.put("rows", rows);
			queryMap.put("uOrgRootId", orgRootId);
			queryMap.put("uId", userId);
			queryMap.put("waybillId", waybillId);
			queryMap.put("goodsName", goodsName);
			queryMap.put("scatteredGoods", scatteredGoods);
			queryMap.put("forwardingUnit", forwardingUnit);
			queryMap.put("consignee", consignee);
			queryMap.put("entrustName", entrustName);
			queryMap.put("shipperName", shipperName);
			queryMap.put("makeStartTime", makeStartTime);
			queryMap.put("makeEndTime", makeEndTime);
			// 根据登录用户主机构ID和登录用户ID查询用户数据权限表，获得登录用户数据权限
			List<UserDataAuthPo> userDataAuthList = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(queryMap);
			List<String> userDataAuthListStrs = new ArrayList<String>();
			// 登录用户必须存在数据权限
			if (userDataAuthList != null && userDataAuthList.size() > 0) {
				for (UserDataAuthPo userDataAuthPo : userDataAuthList) {
					userDataAuthListStrs.add(userDataAuthPo.getConditionGroup());
				}
			}
			queryMap.put("userDataAuthListStrs", userDataAuthListStrs);
			// 根据登录用户主机构ID查询零散货物运单信息
//			List<Integer> scatteredGoodsList = waybillInfoFacade.findWaybillInfoIsReOrderSettlementByOrgRootId(orgRootId);
//			queryMap.put("scatteredGoodsList", scatteredGoodsList);
			if (CollectionUtils.isNotEmpty(userDataAuthListStrs)) {
				// 3、查询运单信息总数
				totalNum = waybillInfoFacade.countWaybillInfoIsReOrderSettlementForPage(queryMap);
				// 4、分页查询运单信息
				waybillInfoListResult = waybillInfoFacade
						.findWaybillInfoIsReOrderSettlementForPage(queryMap);
				// 查询出的运单信息不为空
//				if (CollectionUtils.isNotEmpty(waybillInfoListResult)) {
//					// 运单主键集合
//					List<Integer> waybillInfoIdList = CommonUtils.getValueList(waybillInfoListResult, "id");
//					// 封装查询结算信息条件
//					Map<String, Object> settlementQueryMap = new HashMap<String, Object>();
//					// 主机构ID
//					settlementQueryMap.put("orgRootId", orgRootId);
//					// 是否挂账红冲
//					settlementQueryMap.put("isWriteOff", 0);
//					// 结算类型
//					settlementQueryMap.put("settlementType", 2);
//					// 查询出的运单信息表主键ID集合
//					settlementQueryMap.put("waybillInfoIdList", waybillInfoIdList);
//					// 根据主机构ID、运单信息表主键ID、是否挂账红冲、结算类型查询结算信息
//					List<SettlementInfo> settlementInfoList = settlementInfoFacade.findSettlementByList(settlementQueryMap);
//					if (CollectionUtils.isNotEmpty(settlementInfoList)) {
//						Map<String, Object> waybillInfoMap = CommonUtils.listforMap(settlementInfoList, "waybillInfoId", null);
//						for (int i = 0; i < waybillInfoListResult.size(); i++) {
//							if (MapUtils.isNotEmpty(waybillInfoMap)
//									&& waybillInfoMap.get(waybillInfoListResult.get(i).getId()) == null) {
//								waybillInfoList.add(waybillInfoListResult.get(i));
//							}
//						}
//						totalNum = waybillInfoList.size();
//					}else{
//						waybillInfoList = waybillInfoListResult;
//						totalNum = waybillInfoList.size();
//					}
//				}
				// 5、根据运单信息中货物ID查询货物信息表货物名称
				if (CollectionUtils.isNotEmpty(waybillInfoListResult)) {
					// 货物
					List<Integer> goodsInfoIds = CommonUtils.getValueList(waybillInfoListResult, "goodsInfoId");
					List<GoodsInfo> goodsInfoList = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
					// key:货物ID value:货物名称
					Map<Integer, String> goodsfoMap = null;
					if (CollectionUtils.isNotEmpty(goodsInfoList)) {
						goodsfoMap = CommonUtils.listforMap(goodsInfoList, "id", "goodsName");
					}
					//线路线路表主键ID集合
					List<Integer>lineInfoIdList = new ArrayList<Integer>();
					//地点表主键ID集合（起点）
					List<Integer> locationStartInfoIdList = new ArrayList<Integer>();
					//地点表主键ID集合（终点）
					List<Integer> locationEndInfoIdList = new ArrayList<Integer>();
					//非零散货物线路
					List<LineInfoPo>lineInfoList = new ArrayList<LineInfoPo>();
					// 零散货物线路（起点）
					List<LocationInfoPo> locationStartInfoList = new ArrayList<LocationInfoPo>();
					// 零散货物线路（终点）
					List<LocationInfoPo> locationEndInfoList = new ArrayList<LocationInfoPo>();
					for(WaybillInfoPo waybillInfoPo : waybillInfoListResult){
						//判断如为零散货物
						if(StringUtils.isNotBlank(waybillInfoPo.getScatteredGoods())){
							locationStartInfoIdList.add(waybillInfoPo.getLineInfoId());
							locationEndInfoIdList.add(waybillInfoPo.getEndPoints());
						}else{
							lineInfoIdList.add(waybillInfoPo.getLineInfoId());
						}
					}
					//非零散货物线路
					if(CollectionUtils.isNotEmpty(lineInfoIdList)){
						lineInfoList = lineInfoFacade.findLineInfoByIds(lineInfoIdList);
					}
					//零散货物线路（起点）
					if(CollectionUtils.isNotEmpty(locationStartInfoIdList)){
						locationStartInfoList = locationInfoFacade.findLocationNameByIds(locationStartInfoIdList);
					}
					//零散货物线路（终点）
					if(CollectionUtils.isNotEmpty(locationEndInfoIdList)){
						locationEndInfoList = locationInfoFacade.findLocationNameByIds(locationEndInfoIdList);
					}
					// key:线路ID value:线路名称
					Map<Integer, Object> lineInfoMap = null;
					// key:地点ID value:地点名称（起点）
					Map<Integer, String> locationStartInfoMap = null;
					// key:地点ID value:地点名称（终点）
					Map<Integer, String> locationEndInfoMap = null;
					if (CollectionUtils.isNotEmpty(lineInfoList)) {
						lineInfoMap = CommonUtils.listforMap(lineInfoList, "id", null);
					}
					//地点LIST转换为MAP（起点）
					if (CollectionUtils.isNotEmpty(locationStartInfoList)) {
						locationStartInfoMap = CommonUtils.listforMap(locationStartInfoList, "id", "locationName");
					}
					//地点LIST转换为MAP（终点）
					if (CollectionUtils.isNotEmpty(locationEndInfoList)) {
						locationEndInfoMap = CommonUtils.listforMap(locationEndInfoList, "id", "locationName");
					}
					// 委托方
					List<Integer> entrustIds = CommonUtils.getValueList(waybillInfoListResult, "entrust");
					List<OrgInfoPo> entrustList = orgInfoFacade.findOrgNameByIds(entrustIds);
					// key:组织ID value:组织名称
					Map<Integer, String> entrusMap = null;
					if (CollectionUtils.isNotEmpty(entrustList)) {
						entrusMap = CommonUtils.listforMap(entrustList, "id", "orgName");
					}
					// 承运方
					List<Integer> shipperIds = CommonUtils.getValueList(waybillInfoListResult, "shipper");
					List<OrgInfoPo> shipperList = orgInfoFacade.findOrgNameByIds(shipperIds);
					// key:组织ID value:组织名称
					Map<Integer, String> shipperMap = null;
					if (CollectionUtils.isNotEmpty(shipperList)) {
						shipperMap = CommonUtils.listforMap(shipperList, "id", "orgName");
					}
					// 承运方项目
					List<Integer> shipperProjectIds = CommonUtils.getValueList(waybillInfoListResult, "shipperProject");
					List<ProjectInfoPo> shipperProjectList = null;
					if(CollectionUtils.isNotEmpty(shipperProjectIds)){
						shipperProjectList = projectInfoFacade.findProjectInfoPoByIds(shipperProjectIds);
					}
					// key:项目表主键ID value:项目名称
					Map<Integer, String> shipperProjectMap = null;
					if (CollectionUtils.isNotEmpty(shipperProjectList)) {
						shipperProjectMap = CommonUtils.listforMap(shipperProjectList, "id", "projectName");
					}
					for (WaybillInfoPo waybillInfoPo : waybillInfoListResult) {
						// 封装货物名称
						if (MapUtils.isNotEmpty(goodsfoMap) && goodsfoMap.get(waybillInfoPo.getGoodsInfoId()) != null) {
							waybillInfoPo.setGoodsName(goodsfoMap.get(waybillInfoPo.getGoodsInfoId()));
						}
						if(StringUtils.isNotBlank(waybillInfoPo.getScatteredGoods())){
							// 封装地点信息（起点）
							String startPoints = "";
							if (MapUtils.isNotEmpty(locationStartInfoMap) && locationStartInfoMap.get(waybillInfoPo.getLineInfoId()) != null) {
								startPoints = locationStartInfoMap.get(waybillInfoPo.getLineInfoId());
							}
							// 封装地点信息（终点）
							String endPoints = "";
							if (MapUtils.isNotEmpty(locationEndInfoMap) && locationEndInfoMap.get(waybillInfoPo.getEndPoints()) != null) {
								endPoints = locationEndInfoMap.get(waybillInfoPo.getEndPoints());
							}
							waybillInfoPo.setLineInfoName(startPoints+"-->"+endPoints);
						}else{
							// 封装线路信息
							if (MapUtils.isNotEmpty(lineInfoMap) && lineInfoMap.get(waybillInfoPo.getLineInfoId()) != null) {
								LineInfoPo lineInfoPo = (LineInfoPo) lineInfoMap.get(waybillInfoPo.getLineInfoId());
								if(lineInfoPo != null){
									waybillInfoPo.setLineInfoName(lineInfoPo.getStartPoints()+"-->"+lineInfoPo.getEndPoints());
								}
							}
						}
						// 封装委托方名称
						if (MapUtils.isNotEmpty(entrusMap) && entrusMap.get(waybillInfoPo.getEntrust()) != null) {
							waybillInfoPo.setEntrustName(entrusMap.get(waybillInfoPo.getEntrust()));
						}
						// 封装承运方名称
						if (MapUtils.isNotEmpty(shipperMap) && shipperMap.get(waybillInfoPo.getShipper()) != null) {
							waybillInfoPo.setShipperName(shipperMap.get(waybillInfoPo.getShipper()));
						}
						// 封装承运方项目
						if (MapUtils.isNotEmpty(shipperProjectMap) && shipperProjectMap.get(waybillInfoPo.getShipperProject()) != null) {
							waybillInfoPo.setProjectName(shipperProjectMap.get(waybillInfoPo.getShipperProject()));
						}
					}
				}
			}
		}
		// 6、总数、分页信息封装
		waybillInfoPager.setTotal(totalNum);
		waybillInfoPager.setRows(waybillInfoListResult);
		model.addAttribute("waybillInfoPager", waybillInfoPager);
		return "template/settlementInfo/settlement_waybill_info_data";
	}

	/**
	 * 返单结算时查询有价券信息初始页
	 * 
	 * @author jiangweiwei
	 * @date 2017年7月13日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showSettlementCouponInfoPage")
	public String initCouponInfoPage(HttpServletRequest request, Model model) {
		DataPager<CouponUseInfo> couponInfoPager = new DataPager<CouponUseInfo>();
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoId = userInfo.getOrgInfoId();
		// 获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		couponInfoPager.setPage(page);
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		couponInfoPager.setSize(rows);
		Integer operateType = null;
		if(params.get("operateType") != null){
			operateType = Integer.valueOf(params.get("operateType").toString());
		}
		//有价券卡号
		String cardCode = null;
		if(params.get("cardCode") != null){
			cardCode = params.get("cardCode").toString();
		}
		//有价券类型
		Integer couponType = null;
		if(params.get("couponType") != null){
			couponType = Integer.valueOf(params.get("couponType").toString());
		}
		//运单信息表主键ID
		Integer waybillInfoId = null;
		if(params.get("waybillInfoId") != null){
			waybillInfoId = Integer.valueOf(params.get("waybillInfoId").toString());
		}		
		//委托方
		Integer entrust = null;
		if(params.get("entrust") != null){
			entrust = Integer.valueOf(params.get("entrust").toString());
		}
		//有价券信息总数
		Integer totalNum = 0;
		// 有价券信息
		List<CouponUseInfo> couponInfoList = new ArrayList<CouponUseInfo>();
		//有价券类型
		List<CouponTypeInfo> couponTypeInfoList = new ArrayList<CouponTypeInfo>();
		if(waybillInfoId != null && entrust != null){
			// 封装参数
			CouponUseInfo couponUseInfo = new CouponUseInfo();
			couponUseInfo.setCurPostion((page - 1) * rows);
			couponUseInfo.setPageSize(rows);
//			couponUseInfo.setOrgInfoId(orgInfoId);
			couponUseInfo.setParentOrgInfoId(entrust);
			couponUseInfo.setCouponOrgInfoId(entrust);
			couponUseInfo.setCardCode(cardCode);
			couponUseInfo.setCouponTypeInfoId(couponType);
			//查询有价券类型
			couponTypeInfoList = couponTypeInfoFacade.getCouponTypeInfo();
			// 查询有价券信息总数
			totalNum = couponUseInfoFacade.selectCUInfoByOInfoIdTotal(couponUseInfo);
			// 分页查询有价券信息
			couponInfoList = couponUseInfoFacade.selectCUInfoByOInfoId(couponUseInfo);
			//如是新增则有价券使用金额默认为0
			if(operateType == 1){
				BigDecimal usePrice = new BigDecimal(0);
				if(CollectionUtils.isNotEmpty(couponInfoList)){
					for(CouponUseInfo couponUse : couponInfoList){
						couponUse.setUserPrice(usePrice);
					}
				}
			}
		}
		// 总数、分页信息封装
		couponInfoPager.setTotal(totalNum);
		couponInfoPager.setRows(couponInfoList);
		model.addAttribute("couponInfoPager", couponInfoPager);
		model.addAttribute("couponTypeInfoList", couponTypeInfoList);
		return "template/settlementInfo/show_settlement_coupon_info_page";
	}

	/**
	 * 返单结算时查询司机信息初始页
	 * 
	 * @author jiangweiwei
	 * @date 2017年7月13日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showSettlementDriverInfoPage")
	public String initDriverInfoPage(HttpServletRequest request, Model model) {
		DataPager<CarInfoPo> carInfoPager = new DataPager<CarInfoPo>();
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
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
		// 司机类型
//		Integer driverType = null;
//		if (params.get("driverType") != null) {
//			driverType = Integer.valueOf(params.get("driverType").toString());
//		} else {
//			driverType = 2;
//		}
		// 车牌号
		String carCode = null;
		if (params.get("carCode") != null) {
			carCode = params.get("carCode").toString();
		}
		// 代理模式
		Integer proxyModeType = null;
		if (params.get("proxyModeType") != null) {
			proxyModeType = Integer.valueOf(params.get("proxyModeType").toString());
		}
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
//		queryMap.put("driverType", driverType);
		queryMap.put("carCode", carCode);
		//根据登录用户主机构ID和分页查询企业临时车、企业内部车信息
		List<CarInfoPo> carInfoList = carInfoFacade.findCarInfoByPage(queryMap);
		//根据登录用户主机构ID查询企业临时车、企业内部车条目数
		Integer totalNum = carInfoFacade.countCarInfoByPage(queryMap);
		// 司机信息
		List<DriverInfo> driverInfoList = new ArrayList<DriverInfo>();
		if(CollectionUtils.isNotEmpty(carInfoList)){
			List<Integer> carInfoIds = CommonUtils.getValueList(carInfoList, "id");
			//根据车辆表主键ID批量查询司机信息
			if(CollectionUtils.isNotEmpty(carInfoIds)){
				driverInfoList = driverInfoFacade.findDriverNameByCarInfo(carInfoIds);
			}
			// key:车辆信息表主键ID value:司机信息对象
			Map<Integer, Object> driverInfoMap = null;
			if(CollectionUtils.isNotEmpty(driverInfoList)){
				driverInfoMap = CommonUtils.listforMap(driverInfoList, "carInfo", null);
			}
			for(CarInfoPo carInfoPo : carInfoList){
				// 封装司机信息
				if (MapUtils.isNotEmpty(driverInfoMap) && driverInfoMap.get(carInfoPo.getId()) != null) {
					DriverInfo driverInfo = (DriverInfo) driverInfoMap.get(carInfoPo.getId());
					carInfoPo.setDriverName(driverInfo.getDriverName());
					carInfoPo.setDriverInfoId(driverInfo.getId());
					carInfoPo.setUserInfoId(driverInfo.getUserInfoId());
					carInfoPo.setDriverType(driverInfo.getDriverType());
				}
			}
		}
		
		// 5、总数、分页信息封装
		carInfoPager.setTotal(totalNum);
		carInfoPager.setRows(carInfoList);
		model.addAttribute("carInfoPager", carInfoPager);
		model.addAttribute("proxyModeType", proxyModeType);
		return "template/settlementInfo/show_settlement_driver_info_page";
	}

	/**
	 * 返单结算时查询组织部门（项目）信息初始页
	 * 
	 * @author jiangweiwei
	 * @date 2017年7月13日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showSettlementProjectInfoPage")
	public String initProjectInfoPage(HttpServletRequest request, Model model) {
		DataPager<ProjectInfoPo> projectInfoPager = new DataPager<ProjectInfoPo>();
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		projectInfoPager.setPage(page);
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		projectInfoPager.setSize(rows);
		// 项目名称
		String projectName = null;
		if (params.get("projectName") != null) {
			projectName = params.get("projectName").toString();
		}

		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("projectName", projectName);
		// 3、查询有组织部门（项目）信息总数
		Integer totalNum = projectInfoFacade.countProjectInfoPoForPage(queryMap);
		// 4、分页查询组织部门（项目）信息
		List<ProjectInfoPo> projectInfoList = projectInfoFacade.findProjectInfoPoForPage(queryMap);
		// 5、总数、分页信息封装
		projectInfoPager.setTotal(totalNum);
		projectInfoPager.setRows(projectInfoList);
		model.addAttribute("projectInfoPager", projectInfoPager);
		return "template/settlementInfo/show_settlement_project_info_page";
	}

	
	/**
	 * 返单结算查询 信息 审核
	 * 
	 * @author qiuyongcheng
	 * @date 2017年11月04日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showSettlementInfo")
	public String showSettlementInfo(HttpServletRequest request, Model model) {
		DataPager<ProjectInfoPo> projectInfoPager = new DataPager<ProjectInfoPo>();
		// 1、获取并处理参数
		Map<String, Object> params_id = this.paramsToMap(request);
		// 结算单号
		String id = null;
		if (params_id.get("id") != null) {
			id = params_id.get("id").toString();
		}
		//根据结算单Id查询结算单信息
		Map<String,Object> settlementMap = new HashMap<String,Object>();
		SettlementInfo settlementInfo = new SettlementInfo();
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userId = userInfo.getId();
		settlementInfo = settlementInfoFacade.selectSettlementForPrint(Integer.parseInt(id));
		
		settlementInfo.setPrintListHeader(settlementInfo.getEntrustName());//打印单表头
		
		SettlementInfo settlementInfoProxy = new SettlementInfo();
		settlementInfoProxy.setEntrustName(settlementInfo.getEntrustName());
		if(userRole == 2){//物流公司
			String conditionStr = settlementInfo.getConditionGroup();
			if(null != conditionStr && !"".equals(conditionStr)){
				
			
			String[]  strs=conditionStr.split(",");
			Integer entrust = Integer.valueOf(strs[0]); //获取物流公司的上级委托方
			String entrustName = orgDetailInfoFacade.selectOrgNameByORgInfoId(entrust);
			settlementInfo.setEntrustName(entrustName);
			}
		}
		UserInfo userInfoPo = new UserInfo();
		if(null != settlementInfo){
			//根据制单人名称，查询企业用户类型
			userInfoPo = userInfoFacade.getUserInfoById(userId);
			if(null != userInfoPo){
				if(userInfoPo.getEnterpriseUserType() != null){
					//企业用户类型为企管人员根据组织机构ID查询组织机构信息
					if(userInfoPo.getEnterpriseUserType() == 1){
						OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(orgInfoId);
						if(orgInfoPo != null && orgInfoPo.getOrgDetailInfo() != null){
							settlementInfo.setMakeUserName(orgInfoPo.getOrgDetailInfo().getOrgName());
						}
					}else{
						//企业用户类型为企业普通用户根据用户ID查询用户信息
						EnterpriseUserInfo enterpriseUserInfo = enterpriseUserInfoFacade.getEnterpriseUserInfoByUserInfoId(userId);
						if(enterpriseUserInfo != null){
							settlementInfo.setMakeUserName(enterpriseUserInfo.getRealName());
						}
					}
				}
			}
			int flag = settlementInfo.getThisPayPrice().compareTo(BigDecimal.ZERO);
			if( flag== 0 || flag == -1){
				settlementInfo.setCapitalAmount("");
			}else{
				BigDecimal capitalAmountDecimal = settlementInfo.getThisPayPrice().add(settlementInfo.getCouponUseTotalPrice());
				double capitalAmountDouble = capitalAmountDecimal.doubleValue();
				String capitalAmount = MD5Utils.hangeToBig(capitalAmountDouble);
				settlementInfo.setCapitalAmount("人民币"+capitalAmount);
			}
		}
		//查询有价券卡号
		Map<String,Object> params = new HashMap<String,Object>();
     	params.put("orgInfoId", orgInfoId);
     	params.put("settlementInfoId", id);
		String cardCode = settlementCouponUseFacade.getCouponUseInfoCardCodeByList(params);
		settlementInfo.setCardCode(cardCode);
		//根据代理还是非代理封装结算对象  zhangbo 2017/10/10加
		if(settlementInfo.getIsProxyMode() == 0){//非代理模式
			//根据车牌号码查询车属单位名称
			if(!"".equals(settlementInfo.getCarCode()) && settlementInfo.getCarCode() != null){
				String carUtil = orgDetailInfoFacade.selectOrgNameByCarCode(settlementInfo.getCarCode());
				if(!"".equals(carUtil) && carUtil != null){
					settlementInfo.setShipperName(carUtil);  //外协单位为车属单位
				}
			}
			model.addAttribute("settlementInfo", settlementInfo);
			model.addAttribute("settlementInfoProxy", settlementInfoProxy);
			return "template/settlementInfo/show_settlement_info_sheet";
		}else{//代理模式
			
			//代理方给司机
			settlementInfoProxy.setShipperPrice(settlementInfo.getShipperPrice());  //代理方给司机的运费
			settlementInfo.setShipperPrice(settlementInfo.getProxyInvoiceTotal());  //委托方给代理方的运费
			settlementInfoProxy.setPayablePrice(settlementInfo.getPayablePrice());
			settlementInfoProxy.setActualPaymentPrice(settlementInfo.getActualPaymentPrice());
			settlementInfoProxy.setThisPayPrice(settlementInfo.getThisPayPrice());
			settlementInfoProxy.setOtherTaxPrice(BigDecimal.ZERO); //其他税费为0
			settlementInfoProxy.setTransportPriceCost(BigDecimal.ZERO);  //运费成本为0
			settlementInfoProxy.setIncomeTax(BigDecimal.ZERO); //进项税为0
			
			//企业给代理方
			settlementInfo.setShipperName(settlementInfo.getProxyName()); //外协单位为代理方名称
			settlementInfo.setPayablePrice(settlementInfo.getProxyInvoiceTotal());  //应付运费为代开总额
			settlementInfo.setActualPaymentPrice(settlementInfo.getProxyInvoiceTotal()); //实付金额为代开总额
			settlementInfo.setThisPayPrice(settlementInfo.getProxyInvoiceTotal());  //本次付款为代开总额
			model.addAttribute("settlementInfo", settlementInfo);
			model.addAttribute("settlementInfoProxy", settlementInfoProxy);
			return "template/settlementInfo/show_settlement_info_proxy";
		}
	}
	
	/**
	 * 	审核驳回意见
	 *  @author 邱永城
	 *	@date 2017年11月9日
	 *  @param request
	 *  @param model
	 *  @return  
	 *
	 */
	@RequestMapping(value = "/viewAuditLog", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject viewAuditLog(HttpServletRequest request, Model model) {
		JSONObject jo = new JSONObject();
		Integer settlementId = null;
		if(request.getParameter("settlementId") != null){
			settlementId = Integer.valueOf(request.getParameter("settlementId"));
		}
		SettlementAuditLog viewAuditLog = settlementInfoFacade.viewAuditLog(settlementId);
		jo.put("viewAuditLog",viewAuditLog);
		return jo;
	}
	
	/**
	 * 返单结算时查询结算公式信息
	 * @author jiangweiwei
	 * @date 2017年7月13日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showSettlementFormulaPage", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject showSettlementFormulaPage(HttpServletRequest request, Model model) {
		JSONObject jo = new JSONObject();
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userRole = userInfo.getUserRole();
		//封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("orgRootId", orgRootId);
		Integer waybillInfoId = null;
		if(request.getParameter("waybillInfoId") != null){
			waybillInfoId = Integer.valueOf(request.getParameter("waybillInfoId"));
		}
		//根据运单编号查询运单信息
		WaybillInfoPo waybillInfoPo = waybillInfoFacade.getWaybillInfoById(waybillInfoId);
		Integer orgInfoId = null;
		if(waybillInfoPo != null){
			if(userRole != null){
				if(userRole == 1){
					if(waybillInfoPo.getEntrust() != null){
						orgInfoId = waybillInfoPo.getEntrust();
					}
				}else{
					if(waybillInfoPo.getShipper() != null){
						orgInfoId = waybillInfoPo.getShipper();
					}
				}
			}
		}
			
		if(waybillInfoPo != null && orgInfoId != null){
			//封装组织机构ID
			queryMap.put("orgInfoId", orgInfoId);
			//查询结算公式明细信息
			SettlementFormulaDetailPo settlementFormulaDetailPo = settlementFormulaDetailFacade
					.findSettlementFormulaDetailByOrgRootIdAndOrgInfoID(queryMap);
			//根据核算主体查询组织机构名称
			OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(settlementFormulaDetailPo.getAccountingEntity());
			//封装核算主体名称
			if(orgInfoPo != null){
				settlementFormulaDetailPo.setAccountingEntityStr(orgInfoPo.getOrgDetailInfo().getOrgName());
			}
			//信息封装
			jo.put("settlementFormulaDetailPo", settlementFormulaDetailPo);
		}
		return jo;
	}

	/**
	 * 返单结算时查询物流公司信息初始页
	 * 
	 * @author jiangweiwei
	 * @date 2017年7月15日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showContractInfoPage")
	public String initContractInfoPage(HttpServletRequest request, Model model) {
		DataPager<ContractInfo> contractInfoPager = new DataPager<ContractInfo>();
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		contractInfoPager.setPage(page);
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		contractInfoPager.setSize(rows);
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		// 查询有合同信息总数
		Integer totalNum = contractInfoFacade.countContractInfoReOrderSettlementForPage(queryMap);
		// 分页查询合同信息
		List<ContractInfo> contractInfoList = contractInfoFacade.findContractInfoReOrderSettlementForPage(queryMap);
		if (CollectionUtils.isNotEmpty(contractInfoList)) {
			// 根据合同信息中承运方查询组织名称
			List<Integer> orgInfoIds = CommonUtils.getValueList(contractInfoList, "shipper");
			List<OrgInfoPo> orgInfoList = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			// key:组织ID value:组织名称
			Map<Integer, String> orgInfoMap = null;
			if (CollectionUtils.isNotEmpty(orgInfoList)) {
				orgInfoMap = CommonUtils.listforMap(orgInfoList, "id", "orgName");
			}
			for (ContractInfo contractInfo : contractInfoList) {
				// 封装组织名称
				if (MapUtils.isNotEmpty(orgInfoMap) && orgInfoMap.get(contractInfo.getShipper()) != null) {
					contractInfo.setShipperName(orgInfoMap.get(contractInfo.getShipper()));
				}
			}
		}
		// 5、总数、分页信息封装
		contractInfoPager.setTotal(totalNum);
		contractInfoPager.setRows(contractInfoList);
		model.addAttribute("contractInfoPager", contractInfoPager);
		return "template/settlementInfo/show_settlement_contract_info_page";
	}

	/**
	 * 根据登录用户主机构ID、委托方、货物、线路、发货单位、到货单位和计划拉运日期查询代理方
	 * 
	 * @author jiangweiwei
	 * @data 2017年7月15日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/searchProxy", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject searchProxy(HttpServletRequest request) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 从session中取出当前用户的主机构ID
		Integer orgRootId = userInfo.getOrgRootId();
		JSONObject jo = new JSONObject();
		// 获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 是代理模式且存在运单
		if (Integer.valueOf(params.get("proxyModeType").toString()) == 1
				&& params.get("waybillInfoId") != null && params.get("forwardingTime") != null) {
			// 运单信息表主键ID
			Integer waybillInfoId = Integer.valueOf(params.get("waybillInfoId").toString());
			WaybillInfoPo waybillInfoPo = waybillInfoFacade.getWaybillInfoById(waybillInfoId);
			//发货时间
			Date forwardingTime = DateUtils.formatDate(params.get("forwardingTime").toString());
			if (waybillInfoPo != null && waybillInfoPo.getWaybillClassify() != null) {
				if (waybillInfoPo.getWaybillClassify() != 2) {
					// 封装参数
					waybillInfoPo.setOrgRootId(orgRootId);
					waybillInfoPo.setForwardingTime(forwardingTime);
					TransportPrice transportPrice = transportPriceFacade.getProxyTransportPrice(waybillInfoPo);
					if (transportPrice != null) {
						OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(transportPrice.getProxy());
						if (orgInfoPo != null) {
							transportPrice.setProxyName(orgInfoPo.getOrgDetailInfo().getOrgName());
						}
					}
					jo.put("success", true);
					jo.put("transportPrice", transportPrice);
				}
			}
		} else {
			jo.put("success", false);
		}
		return jo;
	}

	/**
	 * 根据登录用户主机构ID、条件组、委托方、货物、线路、发货单位、到货单位和计划拉运日期查询当前运价和损耗扣款
	 * 
	 * @author jiangweiwei
	 * @data 2017年7月16日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/searchTransportPriceAndLossDeduction", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject searchTransportPriceAndLossDeduction(HttpServletRequest request) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 从session中取出当前用户的主机构ID
		Integer orgRootId = userInfo.getOrgRootId();
		// 从session中取出当前用户ID
		Integer userInfoId = userInfo.getId();
		// 运单信息表主键ID
		Integer waybillInfoId = null;
		if (request.getParameter("waybillInfoId") != null) {
			waybillInfoId = Integer.valueOf(request.getParameter("waybillInfoId"));
		}
		//发货时间
		Date forwardingTime = null;
		if(request.getParameter("forwardingTime") != null){
			forwardingTime = DateUtils.formatDate(request.getParameter("forwardingTime"));
		}
		//承运方
		Integer shipper = null;
		if(request.getParameter("shipper") != null && !"".equals(request.getParameter("shipper"))){
			shipper = Integer.valueOf(request.getParameter("shipper"));
		}
		// 是存在运价
		boolean isSuccess = false;
		// 封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("uOrgRootId", orgRootId);
		queryMap.put("uId", userInfoId);
		// 根据登录主机构ID和登录用户ID查询用户数据权限
		List<UserDataAuthPo> userDataAuthList = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(queryMap);
		// 封装用户数据权限
		List<String> uStrList = new ArrayList<String>();
		JSONObject jo = new JSONObject();
		SettlementInfo settlementInfo = new SettlementInfo();
		BigDecimal price = new BigDecimal(0);
		// 用户数据权限不为空
		if (CollectionUtils.isNotEmpty(userDataAuthList)) {
			for (UserDataAuthPo userDataAuthPo : userDataAuthList) {
				uStrList.add(userDataAuthPo.getConditionGroup());
			}
		} else {
			return jo;
		}
		// 存在运单且存在司机且司机类型不为空
		if (request.getParameter("waybillInfoId") != null) {
			// 根据运单主键ID查询运单信息
			WaybillInfoPo waybillInfoPo = waybillInfoFacade.getWaybillInfoById(waybillInfoId);
			if (waybillInfoPo != null) {
				waybillInfoPo.setOrgRootId(orgRootId);
				waybillInfoPo.setForwardingTime(forwardingTime);
				// 存在运单分类且运单分类不为零散货物运单
				if (waybillInfoPo.getWaybillClassify() != null && waybillInfoPo.getWaybillClassify() != 2) {
					// 司机编号和司机类型不为空
					if (StringUtils.isNotBlank(request.getParameter("userInfoId")) && StringUtils.isNotBlank(request.getParameter("driverType"))) {
						// 司机类型为内部司机或临时司机
						Integer carUnit = null;
						if(settlementInfo != null){
							carUnit = carInfoFacade.selectCarUnitByCarCode(settlementInfo.getCarCode());
						}
						if ("1".equals(request.getParameter("driverType")) && settlementInfo != null && settlementInfo.getEntrust() == carUnit) {
							settlementInfo.setCurrentTransportPrice(price);
							settlementInfo.setDeductionTonnage(price);
							settlementInfo.setDeductionUnitPrice(price);
							isSuccess = true;
						}
						// 司机类型为外协司机
						if ("2".equals(request.getParameter("driverType")) || "3".equals(request.getParameter("driverType")) || ("1".equals(request.getParameter("driverType")) && settlementInfo != null && settlementInfo.getEntrust() == carUnit)) {
							// 根据登录用户主机构ID、条件组、委托方、货物、线路、发货单位、到货单位和发货时间查询当前运价
							TransportPrice transportPrice = transportPriceFacade
									.getOutDriverTransportPrice(waybillInfoPo, uStrList);
							// 根据登录用户主机构ID、委托方、货物、线路、发货单位、到货单位和计划拉运日期查询外协司机损耗扣款
							LossDeduction lossDeduction = lossDeductionFacade
									.getOutDriverLossDeductionFacade(waybillInfoPo);
							if (transportPrice != null) {
								settlementInfo.setCurrentTransportPrice(transportPrice.getUnitPrice());
								settlementInfo.setComputeMode(transportPrice.getComputeMode());
							}
							if (lossDeduction != null) {
								// 定损方式为比例则取合理损耗比例（%），否则取合理损耗吨位（吨）
								if (lossDeduction.getDeductionMode() == 1) {
									settlementInfo.setDeductionTonnage(lossDeduction.getReasonableLossRatio());
								} else {
									settlementInfo.setDeductionTonnage(lossDeduction.getReasonableLossTonnage());
								}
								settlementInfo.setDeductionUnitPrice(lossDeduction.getLossDeductionPrice());
								settlementInfo.setLossDeductionId(lossDeduction.getId());
								settlementInfo.setDeductionMode(lossDeduction.getDeductionMode());
								settlementInfo.setIsInvert(lossDeduction.getIsInvert());
							}
							isSuccess = true;
						}
					}
					// 如承运方字段不为空
					if (StringUtils.isNotBlank(request.getParameter("shipper"))) {
						// 根据登录用户主机构ID、条件组、委托方、承运方、所选运单货物、线路、发货单位、到货单位和计划拉运日期查询当前运价
						waybillInfoPo.setEntrust(waybillInfoPo.getShipper());
						waybillInfoPo.setShipper(shipper);
						TransportPrice transportPrice = transportPriceFacade
								.getLogisticsCompanySubTransportPrice(waybillInfoPo, uStrList);
						// 根据登录用户主机构ID、委托方、承运方、所选运单货物、线路、发货单位、到货单位和计划拉运日期查询转包损耗扣款
						LossDeduction lossDeduction = lossDeductionFacade
								.getLogisticsCompanySubLossDeductionFacade(waybillInfoPo);
						if (transportPrice != null) {
							settlementInfo.setCurrentTransportPrice(transportPrice.getUnitPrice());
							settlementInfo.setComputeMode(transportPrice.getComputeMode());
						}
						if (lossDeduction != null) {
							// 定损方式为比例则取合理损耗比例（%），否则取合理损耗吨位（吨）
							if (lossDeduction.getDeductionMode() == 1) {
								settlementInfo.setDeductionTonnage(lossDeduction.getReasonableLossRatio());
							} else {
								settlementInfo.setDeductionTonnage(lossDeduction.getReasonableLossTonnage());
							}
							settlementInfo.setDeductionUnitPrice(lossDeduction.getLossDeductionPrice());
							settlementInfo.setLossDeductionId(lossDeduction.getId());
							settlementInfo.setDeductionMode(lossDeduction.getDeductionMode());
							settlementInfo.setIsInvert(lossDeduction.getIsInvert());
						}
						isSuccess = true;
					}
				}
			}
		}
		if (isSuccess) {
			jo.put("success", isSuccess);
			jo.put("settlementInfo", settlementInfo);
		} else {
			jo.put("success", false);
		}
		return jo;
	}

	/**
	 * 根据运单信息、有价券信息、结算公式信息、运价、损耗扣款计算结算相关费用
	 * 
	 * @author jiangweiwei
	 * @data 2017年7月17日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/reOrderSettlementCompute", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject reOrderSettlementCompute(HttpServletRequest request, SettlementModel settlementModel) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 从session中取出当前用户的主机构ID
		Integer orgRootId = userInfo.getOrgRootId();
		// 从session中取出当前用户ID
		Integer userInfoId = userInfo.getId();
		// 封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("uOrgRootId", orgRootId);
		queryMap.put("uId", userInfoId);
		JSONObject jo = new JSONObject();
		SettlementInfo settlementInfo = settlementModel.getSettlementInfo();
		WaybillInfoPo waybillInfoPo = new WaybillInfoPo();
		WaybillInfoPo waybillInfoPoCondition = new WaybillInfoPo();
		SettlementInfo settlementInfoCondition = new SettlementInfo();
//		CouponInfoPo couponInfoPo = new CouponInfoPo();
		DriverInfo driverInfo = new DriverInfo();
		SettlementFormulaDetailPo settlementFormulaDetailPo = new SettlementFormulaDetailPo();
		TransportPrice transportPrice = new TransportPrice();
		if (settlementInfo != null) {
			settlementInfo.setDriverType(settlementInfo.getCarPart());
			//发货时间
			if(settlementInfo.getForwardingTimeStr() != null){
				waybillInfoPoCondition.setForwardingTime(DateUtils.formatDate(settlementInfo.getForwardingTimeStr()));
				settlementInfo.setForwardingTime(DateUtils.formatDate(settlementInfo.getForwardingTimeStr()));
			}
			// 根据运单信息表主键ID查询运单信息表数据
			if (settlementInfo.getWaybillInfoId() != null) {
				waybillInfoPo = waybillInfoFacade.getWaybillInfoById(settlementInfo.getWaybillInfoId());
			}
			// 报销模式根据有价券类型查询有价券进项税税率
			BigDecimal taxRate = new BigDecimal(0);
			if(settlementInfo.getIsExpense() == 1){
				String couponType = "";
				if(settlementInfo.getExpenseType() == 1){
					couponType = "燃油";
				}else{
					couponType = "燃气卡";
				}
				taxRate = couponTypeInfoFacade.selectTaxRateByCouponType(couponType);
				settlementInfo.setTaxRate(taxRate);
			}
			/*if (settlementInfo.getCouponUseInfoId() != null) {
				couponInfoPo = couponInfoFacade.getCouponInfoByCouponInfoId(settlementInfo.getCouponUseInfoId());
			}*/
			// 根据结算公式明细表主键ID查询结算公式信息
//			if (settlementInfo.getSettlementFormulaDetailId() != null) {
//				settlementFormulaDetailPo = settlementFormulaDetailFacade
//						.findSettlementFormulaDetailById(settlementInfo.getSettlementFormulaDetailId());
//			}
			// 根据司机表用户ID查询司机信息
			if (settlementInfo.getUserInfoId() != null) {
				driverInfo = driverInfoFacade.findDriverInfoByUserInfoId(settlementInfo.getUserInfoId());
			}
			// 根据登录用户主机构ID、委托方、货物、线路、发货单位、到货单位和发货时间查询代理方
			if (settlementInfo.getProxy() != null) {
				waybillInfoPoCondition.setOrgRootId(orgRootId);
				if (waybillInfoPo.getEntrust() != null) {
					waybillInfoPoCondition.setEntrust(waybillInfoPo.getEntrust());
				}
				if (settlementInfo.getGoodsInfoId() != null) {
					waybillInfoPoCondition.setGoodsInfoId(settlementInfo.getGoodsInfoId());
				}
				if (settlementInfo.getLineInfoId() != null) {
					waybillInfoPoCondition.setLineInfoId(settlementInfo.getLineInfoId());
				}
				if (settlementInfo.getForwardingUnit() != null) {
					waybillInfoPoCondition.setForwardingUnit(settlementInfo.getForwardingUnit());
				}
				if (settlementInfo.getConsignee() != null) {
					waybillInfoPoCondition.setConsignee(settlementInfo.getConsignee());
				}
				transportPrice = transportPriceFacade.getProxyTransportPrice(waybillInfoPoCondition);
			}
			if (waybillInfoPo != null) {
				settlementInfo.setSuperEntrust(waybillInfoPo.getEntrust());
				settlementInfo.setWaybillClassify(waybillInfoPo.getWaybillClassify());
				settlementInfo.setWaybillType(waybillInfoPo.getWaybillType());
				settlementInfo.setPlanTransportDate(waybillInfoPo.getPlanTransportDate());
				// 如运单分类为零散货物运单（计算客户运费时需要）
				if (waybillInfoPo.getWaybillClassify() == 2) {
					settlementInfo.setReleaseMode(waybillInfoPo.getReleaseMode());
					settlementInfo.setWinningBidderPrice(waybillInfoPo.getWinningBidderPrice());
					settlementInfo.setCustomerCurrentTransportPrice(waybillInfoPo.getCurrentTransportPrice());
				} else {
					// 如运单分类不为零散货物运单
					// 根据登录主机构ID和登录用户ID查询用户数据权限
					List<UserDataAuthPo> userDataAuthList = userDataAuthFacade
							.findUserDataAuthByUidAndUorgRootId(queryMap);
					// 封装用户数据权限
					List<String> uStrList = new ArrayList<String>();
					// 用户数据权限不为空
					if (CollectionUtils.isNotEmpty(userDataAuthList)) {
						for (UserDataAuthPo userDataAuthPo : userDataAuthList) {
							uStrList.add(userDataAuthPo.getConditionGroup());
						}
						settlementInfoCondition.setOrgRootId(orgRootId);
						settlementInfoCondition.setuStrList(uStrList);
						settlementInfoCondition.setEntrust(waybillInfoPo.getEntrust());
						settlementInfoCondition.setShipper(settlementInfo.getEntrust());
						settlementInfoCondition.setGoodsInfoId(settlementInfo.getGoodsInfoId());
						settlementInfoCondition.setLineInfoId(settlementInfo.getLineInfoId());
						settlementInfoCondition.setForwardingUnit(settlementInfo.getForwardingUnit());
						settlementInfoCondition.setConsignee(settlementInfo.getConsignee());
						settlementInfoCondition.setPlanTransportDate(settlementInfo.getPlanTransportDate());
						settlementInfoCondition.setWaybillClassify(waybillInfoPo.getWaybillClassify());
						settlementInfoCondition.setWaybillType(waybillInfoPo.getWaybillType());
						TransportPrice transportPricePo = transportPriceFacade
								.getTransportPrice(settlementInfoCondition);
						if (transportPricePo != null && transportPricePo.getUnitPrice() != null) {
							settlementInfo.setCustomerCurrentTransportPrice(transportPricePo.getUnitPrice());
						}
					}
				}
			}
//			if (couponInfoPo != null) {
//				settlementInfo.setMoney(couponInfoPo.getMoney());
//				settlementInfo.setTaxRate(couponInfoPo.getTaxRate());
//			}
			if (settlementFormulaDetailPo != null) {
				settlementInfo.setWithholdingTaxRate(settlementFormulaDetailPo.getWithholdingTaxRate());
				settlementInfo.setIncomeTaxRate(settlementFormulaDetailPo.getIncomeTaxRate());
				settlementInfo.setOverallTaxRate(settlementFormulaDetailPo.getOverallTaxRate());
				settlementInfo.setIndividualIncomeTax(settlementFormulaDetailPo.getIndividualIncomeTax());
			}
			if (driverInfo != null) {
				settlementInfo.setDriverType(driverInfo.getDriverType());
			}
			if (transportPrice != null) {
				settlementInfo.setProxyTransportPriceMode(transportPrice.getProxyTransportPriceMode());
				settlementInfo.setProxyCostRatio(transportPrice.getProxyCostRatio());
				settlementInfo.setProxyPrice(transportPrice.getUnitPrice());
				settlementInfo.setProxyFormula(transportPrice.getProxyFormula());
				settlementInfo.setProxyTotalType(transportPrice.getProxyTotalType());
			}
			try {
				
				if(settlementInfo.getIsProxyMode() == 1){
					if(transportPrice==null||settlementInfo.getProxyTotalType()==null){
						jo.put("success", false);
						jo.put("msg", "没有找到匹配的代理运价策略!");
						return jo;
					}
				}
				settlementInfo = settlementInfoFacade.computeReOrderSettlement(settlementInfo);
				jo.put("settlementInfo", settlementInfo);
				jo.put("success", true);
			} catch (Exception e) {
				log.error("计算结算信息异常", e);
				jo.put("success", false);
				jo.put("msg", "计算结算信息异常，请重新计算");
			}
		}
		return jo;
	}

	/**
	 * @title selectProjectInfo
	 * @Description 模糊查询组织部门信息(模糊查询结算信息时使用)
	 * @param ProjectInfoPo
	 *            ProjectInfoPo
	 * @return Map<String,Object>
	 * @author zhangbo
	 */
	@RequestMapping("/findProjectInfo")
	@ResponseBody
	public Map<String, Object> selectProjectInfo(HttpServletRequest request, ProjectInfoPo projectInfoPo) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		projectInfoPo.setOrgRootId(orgRootId);
		List<ProjectInfoPo> cList = new ArrayList<ProjectInfoPo>();
		Map<String, Object> cMap = new HashMap<String, Object>();
		int curPostion = 0;
		int pageSize = 0;
		pageSize = Integer.valueOf(projectInfoPo.getPageSizeStr());
		if (projectInfoPo.getCurPage() != null && projectInfoPo.getCurPage() != "") {
			curPostion = Integer.valueOf(projectInfoPo.getCurPage());
			curPostion = (curPostion - 1) * pageSize;
		}
		projectInfoPo.setCurPostion(curPostion);
		projectInfoPo.setPageSize(pageSize);
		cList = projectInfoFacade.selectProByrootId(projectInfoPo);
		int totalCount = projectInfoFacade.selectProByrootIdTotal(projectInfoPo);
		cMap.put("cList", cList);
		cMap.put("totalCount", totalCount);
		return cMap;

	}

	/**
	 * @title selectAccouningEntity
	 * @Description 模糊查询核算主体信息(模糊查询结算信息时使用)
	 * @param OrgDetailInfoPo
	 *            OrgDetailInfoPo
	 * @return Map<String,Object>
	 * @author zhangbo
	 */
	@RequestMapping("/findAccouningEntity")
	@ResponseBody
	public Map<String, Object> selectAccouningEntity(HttpServletRequest request, OrgDetailInfoPo orgDetailInfoPo) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		orgDetailInfoPo.setOrgRootId(orgRootId);
		List<OrgDetailInfoPo> cList = new ArrayList<OrgDetailInfoPo>();
		Map<String, Object> cMap = new HashMap<String, Object>();
		int curPostion = 0;
		int pageSize = 0;
		pageSize = Integer.valueOf(orgDetailInfoPo.getPageSizeStr());
		if (orgDetailInfoPo.getCurPage() != null && orgDetailInfoPo.getCurPage() != "") {
			curPostion = Integer.valueOf(orgDetailInfoPo.getCurPage());
			curPostion = (curPostion - 1) * pageSize;
		}
		orgDetailInfoPo.setCurPostion(curPostion);
		orgDetailInfoPo.setPageSize(pageSize);
		cList = orgDetailInfoFacade.selectOrgName(orgDetailInfoPo);
		int totalCount = orgDetailInfoFacade.selectOrgNameTotal(orgDetailInfoPo);
		cMap.put("cList", cList);
		cMap.put("totalCount", totalCount);
		return cMap;
	}
	
	/**
	 * @Title selectISBill
	 * @Description 查询该运单是否已挂账
	 * @author zhangbo
	 * @date 2017/08/02 12:54
	 * 
	 * */
	@RequestMapping("/findISBill")
	@ResponseBody
	public int selectISBill(Integer id,HttpServletRequest request){
		int flag = -1;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		SettlementInfo settlementInfo = new SettlementInfo();
		settlementInfo.setOrgRootId(orgRootId);
		settlementInfo.setWaybillInfoId(id);
		settlementInfo.setSettlementType(1);
		settlementInfo.setIsWriteOff(0);
		Integer count = settlementInfoFacade.selectIsBill(settlementInfo);
		if (count > 0) {
			flag = 0;
		}else{
			flag = 1;
		}
		return flag;
	}
	
	/**
	 * 返单结算时查询组织部门（项目）信息初始页
	 * 
	 * @author jiangweiwei
	 * @date 2017年7月13日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showDriverImg")
	public String showDriverImg(HttpServletRequest request, Model model) {
		DataPager<ProjectInfoPo> projectInfoPager = new DataPager<ProjectInfoPo>();
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		projectInfoPager.setPage(page);
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		projectInfoPager.setSize(rows);
		// 项目名称
		String projectName = null;
		if (params.get("projectName") != null) {
			projectName = params.get("projectName").toString();
		}

		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("projectName", projectName);
		// 3、查询有组织部门（项目）信息总数
		Integer totalNum = projectInfoFacade.countProjectInfoPoForPage(queryMap);
		// 4、分页查询组织部门（项目）信息
		List<ProjectInfoPo> projectInfoList = projectInfoFacade.findProjectInfoPoForPage(queryMap);
		// 5、总数、分页信息封装
		projectInfoPager.setTotal(totalNum);
		projectInfoPager.setRows(projectInfoList);
		model.addAttribute("projectInfoPager", projectInfoPager);
		return "template/settlementInfo/show_settlement_project_info_page";
	}
	
	/**
	 * @Title selectEnclosure
	 * @Description 根据运单编号查看附件
	 * @param Integer id 运单编号
	 * @return 
	 * */
	@RequestMapping("/findEnclosure")
	@ResponseBody
	public  Map<String,Object> selectEnclosure(Integer rootWaybillInfoId){
		//waybillInfoId = 1691;
		Map<String,Object> amap = new HashMap<String,Object>();
		List<String> loadingImgList = new ArrayList<String>();
		List<String> onpassageImgList = new ArrayList<String>();
		List<String> unloadingImgList = new ArrayList<String>();
		List<DriverWaybillImgDetailInfo> driverList = settlementInfoFacade.selectEnclosureByWaybillInfoId(rootWaybillInfoId);
		 for (DriverWaybillImgDetailInfo driverWaybillImgDetailInfo : driverList) {
			 loadingImgList.add(driverWaybillImgDetailInfo.getLoadingImg());
			 onpassageImgList.add(driverWaybillImgDetailInfo.getOnpassageImg());
			 unloadingImgList.add(driverWaybillImgDetailInfo.getUnloadingImg());
		}
		 amap.put("loadingImgList", loadingImgList);
		 amap.put("onpassageImgList", onpassageImgList);
		 amap.put("unloadingImgList", unloadingImgList);
		return amap;
	}
	
	
	/**
	 * @title batchPrintSettlementInfo
	 * @description 批量直接打印结算单信息
	 * @author zhangbo
	 * @date 2017/10/27 19:30
	 * @param 
	 * */
	@RequestMapping("/batchPrintSettlementInfo")
	@ResponseBody
	public List<HashMap> batchPrintSettlementInfo(HttpServletRequest request,String ids){
		String[] idArray = ids.split(",");
		Map<String,Object> settlementListMap = new HashMap<String,Object>();
		List<HashMap> returnsettlementList = new ArrayList<HashMap>();
		for (int i = 0; i < idArray.length; i++) {
			Integer id = Integer.valueOf(idArray[i]);
			settlementListMap = printSettlementInfo(request,id);
			returnsettlementList.add((HashMap) settlementListMap);
		}
		return returnsettlementList;
		
	}
	/**
	 * @title printSettlementInfo
	 * @description 打印结算单信息
	 * @author zhangbo
	 * @date 2017/08/27 19:30
	 * @param 
	 * */
	@RequestMapping("/printSettlementInfo")
	@ResponseBody
	public Map<String,Object> printSettlementInfo(HttpServletRequest request,Integer id){
		//根据结算单Id查询结算单信息
		Map<String,Object> settlementMap = new HashMap<String,Object>();
		SettlementInfo settlementInfo = new SettlementInfo();
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userId = userInfo.getId();
		/*List<LocationInfoPo> locationList = new ArrayList<LocationInfoPo>();
		LocationInfoPo locationInfo = new LocationInfoPo();
		if(endPoints == null || endPoints == 0){//非零散货物
			settlementInfo = settlementInfoFacade.selectSettlementForPrint(id);
		}else{//零散货物
			//根据地点表主键查询线路起点和终点
			//查询起点信息
			String startPointName = "";
			String endPointName = "";
			locationList = locationInfoFacade.findLocationById(startPoints);
			if(null != locationList && locationList.size() >0){
				locationInfo = locationList.get(0);
				startPointName = 
						locationInfo.getProvince()+"-->"+locationInfo.getCity()+"-->"
								+ locationInfo.getCounty();
			}
			//查询终点信息
			locationList =locationInfoFacade.findLocationById(endPoints);
			if(null != locationList && locationList.size() >0){
				locationInfo = locationList.get(0);
				endPointName = 
						locationInfo.getProvince()+"-->"+locationInfo.getCity()+"-->"
								+ locationInfo.getCounty();
			}
			settlementInfo = settlementInfoFacade.selectSettlementForPrintForScatteredGoods(id);
			settlementInfo.setStartPointsName(startPointName);
			settlementInfo.setEndPointsName(endPointName);
		}*/
		settlementInfo = settlementInfoFacade.selectSettlementForPrint(id);
		if(settlementInfo.getIsExpense() ==1){//假如是报销模式
			settlementInfo.setCouponUseTotalPrice(settlementInfo.getExpensePrice());
		}
		settlementInfo.setPrintListHeader(settlementInfo.getEntrustName());//打印单表头
		SettlementInfo settlementInfoProxy = new SettlementInfo();
		settlementInfoProxy.setEntrustName(settlementInfo.getEntrustName());
		if(userRole == 2){//物流公司
			String conditionStr = settlementInfo.getConditionGroup();
			if(null != conditionStr && !"".equals(conditionStr)){
				
			
			String[]  strs=conditionStr.split(",");
			Integer entrust = Integer.valueOf(strs[0]); //获取物流公司的上级委托方
			String entrustName = orgDetailInfoFacade.selectOrgNameByORgInfoId(entrust);
			settlementInfo.setEntrustName(entrustName);
			}
		}
		UserInfo userInfoPo = new UserInfo();
		if(null != settlementInfo){
			//根据制单人名称，查询企业用户类型
			userInfoPo = userInfoFacade.getUserInfoById(userId);
			if(null != userInfoPo){
				if(userInfoPo.getEnterpriseUserType() != null){
					//企业用户类型为企管人员根据组织机构ID查询组织机构信息
					if(userInfoPo.getEnterpriseUserType() == 1){
						OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(orgInfoId);
						if(orgInfoPo != null && orgInfoPo.getOrgDetailInfo() != null){
							settlementInfo.setMakeUserName(orgInfoPo.getOrgDetailInfo().getOrgName());
						}
					}else{
						//企业用户类型为企业普通用户根据用户ID查询用户信息
						EnterpriseUserInfo enterpriseUserInfo = enterpriseUserInfoFacade.getEnterpriseUserInfoByUserInfoId(userId);
						if(enterpriseUserInfo != null){
							settlementInfo.setMakeUserName(enterpriseUserInfo.getRealName());
						}
					}
				}
			}
			int flag = settlementInfo.getThisPayPrice().compareTo(BigDecimal.ZERO);
			if( flag== 0 || flag == -1){
				settlementInfo.setCapitalAmount("");
			}else{
				BigDecimal capitalAmountDecimal = settlementInfo.getThisPayPrice().add(settlementInfo.getCouponUseTotalPrice());
				double capitalAmountDouble = capitalAmountDecimal.doubleValue();
				String capitalAmount = MD5Utils.hangeToBig(capitalAmountDouble);
				settlementInfo.setCapitalAmount("人民币"+capitalAmount);
			}
		}
		//查询有价券卡号
		Map<String,Object> params = new HashMap<String,Object>();
     	params.put("orgInfoId", orgInfoId);
     	params.put("settlementInfoId", id);
		String cardCode = settlementCouponUseFacade.getCouponUseInfoCardCodeByList(params);
		settlementInfo.setCardCode(cardCode);
		//根据代理还是非代理封装结算对象  zhangbo 2017/10/10加
		if(settlementInfo.getIsProxyMode() == 0){//非代理模式
			//根据车牌号码查询车属单位名称
			if(!"".equals(settlementInfo.getCarCode()) && settlementInfo.getCarCode() != null){
				String carUtil = orgDetailInfoFacade.selectOrgNameByCarCode(settlementInfo.getCarCode());
				if(!"".equals(carUtil) && carUtil != null){
					settlementInfo.setShipperName(carUtil);  //外协单位为车属单位
				}
			}
			settlementMap.put("settlementInfo", settlementInfo);
			settlementMap.put("settlementInfoProxy", settlementInfoProxy);
		}else{//代理模式
			
			//代理方给司机
			settlementInfoProxy.setShipperPrice(settlementInfo.getShipperPrice());  //代理方给司机的运费
			settlementInfo.setShipperPrice(settlementInfo.getProxyInvoiceTotal());  //委托方给代理方的运费
			settlementInfoProxy.setPayablePrice(settlementInfo.getPayablePrice());
			settlementInfoProxy.setActualPaymentPrice(settlementInfo.getActualPaymentPrice());
			settlementInfoProxy.setThisPayPrice(settlementInfo.getThisPayPrice());
			settlementInfoProxy.setOtherTaxPrice(BigDecimal.ZERO); //其他税费为0
			settlementInfoProxy.setTransportPriceCost(BigDecimal.ZERO);  //运费成本为0
			settlementInfoProxy.setIncomeTax(BigDecimal.ZERO); //进项税为0
			
			//企业给代理方
			settlementInfo.setShipperName(settlementInfo.getProxyName()); //外协单位为代理方名称
			settlementInfo.setPayablePrice(settlementInfo.getProxyInvoiceTotal());  //应付运费为代开总额
			settlementInfo.setActualPaymentPrice(settlementInfo.getProxyInvoiceTotal()); //实付金额为代开总额
			settlementInfo.setThisPayPrice(settlementInfo.getProxyInvoiceTotal());  //本次付款为代开总额
			settlementMap.put("settlementInfo", settlementInfo);
			settlementMap.put("settlementInfoProxy", settlementInfoProxy);
		}
		return settlementMap;
		
	}
	@RequestMapping("/selectLocationInfo")
	@ResponseBody
	public Map<String,String> selectLocationInfo(Integer startPoints,Integer endPoints){
		List<LocationInfoPo> locationList = new ArrayList<LocationInfoPo>();
		Map<String,String> aMap = new HashMap<String,String>();
		//根据地点表主键查询线路起点和终点
		//查询起点信息
		String startPointName = "";
		String endPointName = "";
		locationList = locationInfoFacade.findLocationById(startPoints);
		LocationInfoPo locationInfo = new LocationInfoPo();
		if(null != locationList && locationList.size() >0){
			locationInfo = locationList.get(0);
			startPointName = 
					locationInfo.getProvince()+"-->"+locationInfo.getCity()+"-->"
							+ locationInfo.getCounty();
		}
		//查询终点信息
		locationList =locationInfoFacade.findLocationById(endPoints);
		if(null != locationList && locationList.size() >0){
			locationInfo = locationList.get(0);
			endPointName = 
					locationInfo.getProvince()+"-->"+locationInfo.getCity()+"-->"
							+ locationInfo.getCounty();
		}
		aMap.put("startPointName", startPointName);
		aMap.put("endPointName", endPointName);
		return aMap;
	}
	
	@RequestMapping("/findTaxRateByCouponType")
	@ResponseBody
	public BigDecimal findTaxRateByCouponType(Integer type){
		BigDecimal taxRate = new BigDecimal(0);
		if(null != type){//报销类型不为空
			if(type == 1){//1:燃油 
				taxRate = couponTypeInfoFacade.selectTaxRateByCouponType("油卡");
			}
			if(type == 2){//2:燃气
				taxRate = couponTypeInfoFacade.selectTaxRateByCouponType("燃气卡");
			}
		}
		return taxRate;
	} 
	
	
	/**
	 * @title uploadPhotoBySettlement
	 * @description 影像上传
	 * @author yuewei
	 * @date 2017/09/15  12：00
	 * @param 
	 * */
	@RequestMapping(value = "/uploadPhotoBySettlement", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject uploadPhotoBySettlement(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		List<String> imageList = new ArrayList<String>();
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		String strBase64 = request.getParameter("strBase64");
		String imagePatch = null;

		if (null != strBase64) {

			try {
				imagePatch = FastdfsClientUtil.getInstance().uploadImgByBase64(
						strBase64);
			} catch (Exception e) {
				e.printStackTrace();
			}
			if (StringUtils.isNotEmpty(imagePatch)) {
				//imageList.add(imagePatch);
				System.out.println(imagePatch);
				jo.put("success", true);
				jo.put("msg", "图片保存成功！");
				jo.put("imagePatch", imagePatch);
				
				return jo;
			}
			
		} 
		
		jo.put("success", false);
		jo.put("msg", "图片服务异常，请稍后重试");

		return jo;
	}
	
	@RequestMapping("/selectSettlementForReviceInfo")
	public String selectSettlementForReviceInfo(Integer id,Model model){
		SettlementInfo settlementInfo = new SettlementInfo();
		if(null != id){
			settlementInfo = settlementInfoFacade.selectSettlementById(id);
		}
		model.addAttribute("settlementInfo", settlementInfo);
		return "template/settlementInfo/show_settlement_revise";
		
	}
	@RequestMapping("/saveSettlementForRecive")
	@ResponseBody
	public boolean saveSettlementForRecive(SettlementInfo settlementInfo,HttpServletRequest request){
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
        Integer userInfoId = userInfo.getId();
        Integer orgInfoId = userInfo.getOrgInfoId();
        settlementInfo.setUpdateUser(userInfoId);
        //根据当前年和组织机构ID生成redis key值
		String key = AutoCoverUtils.getYearAndAutoCoverOrg(orgInfoId);
		//根据key值从redis中取出结算单号
		String settlementId = (String)RedisUtil.get(key);
		//如结算单号不为空，则当前结算单号加1
		if(settlementId != null ){
			settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId,settlementId);
		}else{
			//否则根据当前年和组织机构ID加六位序列号初始化一个结算单号如（2017000001000001）
			Map<String,Object> queryMap = new HashMap<String,Object>();
			queryMap.put("orgInfoId", orgInfoId);
			queryMap.put("currentYear", String.valueOf(Calendar.YEAR));
			settlementId = settlementInfoFacade.getSettlementIdByOrgInfoIdAndYear(queryMap);
			if(settlementId != null && !"".equals(settlementId)){
				settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId,settlementId);
			}else{
				settlementId = AutoCoverUtils.getYearAndAutoCoverOrgAndSerialNumber(orgInfoId);
				
			}
		}
		settlementInfo.setSettlementId(settlementId);
		return settlementInfoFacade.saveSettlementForRecive(settlementInfo,key);
		
		
	}
	
	@RequestMapping("/settlementphoto")
	public String settlementphoto(HttpServletRequest request,Model model){
		return "template/settlementInfo/settlementphoto_info_page";
	}
	
	/**
	 * 根据登录用户主机构ID和结算单主键ID查询结算信息
	 * @author jiangweiwei
	 * @date 2017年10月24日
	 */
	@RequestMapping(value = "/searchSettlementInfoPrintNum", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject searchSettlementInfoPrintNum(HttpServletRequest request) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 从session中取出当前用户的主机构ID
		Integer orgRootId = userInfo.getOrgRootId();
		JSONObject jo = new JSONObject();
		// 获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		//结算单主键ID
		Integer id = null;
		if(params.get("id") != null){
			id = Integer.valueOf(params.get("id").toString());
		}
		//封装参数
		Map<String,Object> queryMap = new HashMap<String,Object>();
		queryMap.put("id", id);
		queryMap.put("orgRootId", orgRootId);
		SettlementInfo settlementInfo = settlementInfoFacade.findReOrderSettlementInfoByOrgRootIdAndSettlementInfoId(params);
		if(settlementInfo != null && settlementInfo.getPrintNum() != null){
			if(settlementInfo.getPrintNum() > 1){
				jo.put("msg", "结算单只可打印一次！");
				jo.put("success", false);
			}else{
				jo.put("success",true);
			}
		}else{
			jo.put("success",true);
		}
		return jo;
	}
	/**
	 * @title updatePrintCount
	 * @description 修改打印次数
	 * @author zhangbo
	 * @date 2017/10/28
	 * @param String ids 结算单Id
	 * */
	@RequestMapping(value = "/updatePrintCount", produces = "application/json; charset=utf-8")
	@ResponseBody
	public boolean updatePrintCount(String ids){
		settlementInfoFacade.updatePrintCount(ids);
		return true;
	}
	
	@RequestMapping("/addSettlementPhotoInfoPage")
	public String addSettlementPhotoInfoPage(HttpServletRequest request,Model model) {
		
		return "template/settlementInfo/show_settlement_photos_page";
	}
	
	/**
	 * 新增司机运单维护信息和司机运单图片明细信息
	 * @author jiangweiwei
	 * @date 2017年11月3日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/addDriverWaybillMaintainAndDriverWaybillImgDetail", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addDriverWaybillMaintainAndDriverWaybillImgDetail(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		//结算信息表主键ID
		Integer settlementInfoId = null;
		if(request.getParameter("settlementInfoId") != null){
			settlementInfoId = Integer.valueOf(request.getParameter("settlementInfoId").toString());
		}
		//磅单信息
		String settlementPhoto = null;
		if(request.getParameter("reOrderSPhoto") != null){
			settlementPhoto = request.getParameter("reOrderSPhoto").toString();
		}
		if(settlementInfoId != null){
			//封装参数
			Map<String,Object> queryMap = new HashMap<String,Object>();
			queryMap.put("orgRootId", orgRootId);
			queryMap.put("settlementInfoId", settlementInfoId);
			SettlementInfo settlementInfo = settlementInfoFacade.findReOrderSettlementInfoByOrgRootIdAndSettlementInfoId(queryMap);
			DriverWaybillMaintainPo driverWaybillMaintainPo = new DriverWaybillMaintainPo();
			driverWaybillMaintainPo.setWaybillInfoId(settlementInfo.getWaybillInfoId());
			driverWaybillMaintainPo.setRootWaybillInfoId(settlementInfo.getRootWaybillInfoId());
			driverWaybillMaintainPo.setParentWaybillInfoId(settlementInfo.getParentWaybillInfoId());
			driverWaybillMaintainPo.setEntrustOrgRoot(orgRootId);
			driverWaybillMaintainPo.setForwardingUnit(settlementInfo.getForwardingUnit());
			driverWaybillMaintainPo.setConsignee(settlementInfo.getConsignee());
			driverWaybillMaintainPo.setLoadingAmount(settlementInfo.getForwardingTonnage());
			driverWaybillMaintainPo.setLoadingDate(settlementInfo.getForwardingTime());
			driverWaybillMaintainPo.setUnloadingAmount(settlementInfo.getArriveTonnage());
			driverWaybillMaintainPo.setUnloadingDate(settlementInfo.getArriveTime());
			driverWaybillMaintainPo.setCreateUser(userInfoId);
			driverWaybillMaintainPo.setCreateTime(Calendar.getInstance().getTime());
			driverWaybillMaintainPo.setEntrust(settlementInfo.getEntrust());
			Map<String,Object> driverWaybillMaintainMap = new HashMap<String,Object>();
			List<Integer> driverWaybillMaintainList = new ArrayList<Integer>();
			driverWaybillMaintainList.add(settlementInfo.getRootWaybillInfoId());
			driverWaybillMaintainMap.put("orgRootId", orgRootId);
			driverWaybillMaintainMap.put("driverWaybillMaintainList", driverWaybillMaintainList);
			if(CollectionUtils.isNotEmpty(driverWaybillMaintainList) && MapUtils.isNotEmpty(driverWaybillMaintainMap)){
				//根据委托方主机构和主运单编号删除司机运单维护表（批量）
				driverWaybillMaintainPoFacade.deleteDriverWaybillMaintain(driverWaybillMaintainMap);
			}
			try{
				driverWaybillMaintainPoFacade.addDriverWaybillMaintainInfo(driverWaybillMaintainPo);
				jo.put("success", true);
			}catch(Exception e){
				jo.put("success", true);
				jo.put("msg", "司机装货信息维护失败，请稍后重试！");
				return jo;
			} 
			//返单结算时获取司机磅单图片
			DriverWaybillImgDetailInfo driverWaybillImgDetail = new DriverWaybillImgDetailInfo();
			List<DriverWaybillImgDetailInfo> driverWaybillImgDetailList = new ArrayList<DriverWaybillImgDetailInfo>();
			if(settlementPhoto != null && !"".equals(settlementPhoto)){
				driverWaybillImgDetailList = CommonUtils.jsonStringForList(settlementPhoto,driverWaybillImgDetail);
			}
			if(CollectionUtils.isNotEmpty(driverWaybillImgDetailList)){
				List<Integer> rootWaybillInfoIds = new ArrayList<Integer>();
				for(DriverWaybillImgDetailInfo driverWaybillImgDetailInfo : driverWaybillImgDetailList){
					driverWaybillImgDetailInfo.setDriverWaybillMaintainId(driverWaybillMaintainPo.getId());
					driverWaybillImgDetailInfo.setWaybillInfoId(settlementInfo.getWaybillInfoId());
					driverWaybillImgDetailInfo.setRootWaybillInfoId(settlementInfo.getRootWaybillInfoId());
					driverWaybillImgDetailInfo.setParentWaybillInfoId(settlementInfo.getParentWaybillInfoId());
					driverWaybillImgDetailInfo.setCreateUser(userInfoId);
					driverWaybillImgDetailInfo.setCreateTime(Calendar.getInstance().getTime());
				}
				rootWaybillInfoIds.add(settlementInfo.getRootWaybillInfoId());
				//根据主运单编号删除司机运单图片明细表
				driverWaybillImgDetailInfoFacade.deleteDriverWaybillImgDetailInfo(rootWaybillInfoIds);
				try{
					//新增司机运单图片明细表信息
					driverWaybillImgDetailInfoFacade.addReOrderDriverWaybillImgDetailInfo(driverWaybillImgDetailList);
					jo.put("success", true);
				}catch(Exception e){
					jo.put("success", false);
					jo.put("msg", "维护磅单照片信息失败，请稍后重试！");
					return jo;
				}
			}
			//根据主运单编号修改运单状态，且不等于运单编号的运单（批量）
			WaybillInfoPo waybillInfoPo = new WaybillInfoPo();
			waybillInfoPo.setId(settlementInfo.getWaybillInfoId());
			waybillInfoPo.setRootWaybillInfoId(settlementInfo.getRootWaybillInfoId());
			List<WaybillInfoPo> waybillInfoList = new ArrayList<WaybillInfoPo>();
			List<WaybillInfoPo> waybillInfoPoList = new ArrayList<WaybillInfoPo>();
			waybillInfoList.add(waybillInfoPo);
			//根据主运单编号查询运单历史状态的运单
			if(CollectionUtils.isNotEmpty(waybillInfoList)){
				waybillInfoPoList = waybillInfoFacade.getWaybillInfoByRootWaybillInfoIds(waybillInfoList);
			}
			if(CollectionUtils.isNotEmpty(waybillInfoPoList)){
				for(WaybillInfoPo waybillInfo : waybillInfoPoList){
					waybillInfo.setOldWaybillStatus(waybillInfo.getWaybillStatus());
					waybillInfo.setWaybillStatus(8);
				}
				waybillInfoFacade.updateWaybillInfoById(waybillInfoPoList);
			}
		}
		return jo;
	}
	
}
