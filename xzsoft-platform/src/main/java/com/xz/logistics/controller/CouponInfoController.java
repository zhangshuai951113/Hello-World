package com.xz.logistics.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFDataValidation;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.date.DateUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.common.utils.poi.POIExcelUtil;
import com.xz.facade.api.CouponInfoFacade;
import com.xz.facade.api.CouponRebackInfoFacade;
import com.xz.facade.api.CouponSupplierInfoFacade;
import com.xz.facade.api.CouponTypeInfoFacade;
import com.xz.facade.api.CouponUseInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.EnterpriseUserInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.SettlementCouponUseFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.CouponInfoPo;
import com.xz.model.po.CouponRebackInfo;
import com.xz.model.po.CouponSupplierInfoPo;
import com.xz.model.po.CouponTypeInfo;
import com.xz.model.po.CouponUseInfo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.SettlementCouponUse;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.CouponInfoModel;


/**
 * 有价劵Controller
 * 
 * @author luojuan 2017年6月7日
 *
 */
@Controller
@RequestMapping("/couponInfo")
public class CouponInfoController extends BaseController{
	
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private CouponInfoFacade couponInfoFacade;
	
	@Resource
	private UserInfoFacade userInfoFacade;
	
	@Resource
	private OrgInfoFacade orgInfoFacade;
	
	@Resource
	private CouponUseInfoFacade couponUseInfoFacade;
	
	@Resource
	private CouponRebackInfoFacade couponRebackInfoFacade;
	
	@Resource
	private CouponSupplierInfoFacade couponSupplierInfoFacade;
	
	@Resource
	private CouponTypeInfoFacade couponTypeInfoFacade;
	
	@Resource
	private EnterpriseUserInfoFacade enterpriseUserInfoFacade;
	
	@Resource
	private SettlementCouponUseFacade settlementCouponUseFacade;
	
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	
	@Resource
	private DriverInfoFacade driverInfoFacade;
	
	/**
	 * 初始化界面
	 * 
	 * @author luojuan 2017年6月7日
	 */
	@RequestMapping("/rootCouponInfoInitPage")
	public String rootCouponInfoInitPage (HttpServletRequest request, Model model){
		List<CouponTypeInfo> couponTypeInfoList = couponTypeInfoFacade.getCouponTypeInfo();
		model.addAttribute("couponTypeInfoList", couponTypeInfoList);
		return "template/coupon/root_coupon_info_init_page";
	}
	
	/**
	 * 模糊查询有价券
	 * 
	 * @author luojuan 2017年6月7日
	 * 
	 */
	@RequestMapping(value="/getCouponInfoByOrgInfoRootId",produces = "application/json; charset=utf-8")
	@ResponseBody
	List<CouponInfoPo>getCouponInfoByOrgInfoRootId(HttpServletRequest request,HttpServletResponse response){
		//从session中取出主机构ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer orgInfoRootId = userInfo.getOrgRootId();
		
		//从前端获取并校验卡号、有价券类型、供应商、有价券状态、卡片类型、有价券名称、总额、余额
		String cardCode = request.getParameter("cardCode");
		if(cardCode==""){
			cardCode = null;
		}
		
		String couponTypeStr = request.getParameter("couponType");
		Integer couponType;
		if(couponTypeStr!=""&&couponTypeStr!=null){
			couponType = Integer.parseInt(couponTypeStr);
		}else{
			couponType = null;
		}
		
		String supplierCodeStr = request.getParameter("supplierCode");
		
		String supplierCode;
		if(supplierCodeStr!=""&&couponTypeStr!=null){
			supplierCode = supplierCodeStr;
		}else{
			supplierCode = null;
		}
		
		String couponStatusStr = request.getParameter("couponStatus");
		Integer couponStatus;
		if(couponStatusStr!=""&&couponTypeStr!=null){
			couponStatus = Integer.parseInt(couponStatusStr);
		}else{
			couponStatus = null;
		}
		
		String cardTypeStr = request.getParameter("cardType");
		Integer cardType;
		if(cardTypeStr!=""&&couponTypeStr!=null){
			cardType = Integer.parseInt(cardTypeStr);
		}else{
			cardType = null;
		}
		
		String couponName = request.getParameter("couponName");
		if(couponName==""){
			couponName = null;
		}
		
		String amountStartStr = request.getParameter("amountStart");
		Integer amountStart;
		if(amountStartStr!=""&&amountStartStr!=null){
			amountStart = Integer.parseInt(amountStartStr);
		}else{
			amountStart = null;
		}
		
		String amountEndStr = request.getParameter("amountEnd");
		Integer amountEnd;
		if(amountEndStr!=""&&amountEndStr!=null){
			amountEnd = Integer.parseInt(amountEndStr);
		}else{
			amountEnd = null;
		}
		
		String balanceStartStr = request.getParameter("balanceStart");
		Integer balanceStart;
		if(balanceStartStr!=""&&balanceStartStr!=null){
			balanceStart = Integer.parseInt(balanceStartStr);
		}else{
			balanceStart = null;
		}
		
		String balanceEndStr = request.getParameter("balanceEnd");
		Integer balanceEnd;
		if(balanceEndStr!=""&&balanceEndStr!=null){
			balanceEnd = Integer.parseInt(balanceEndStr);
		}else{
			balanceEnd = null;
		}
		
		//所属组织
		String orgInfoName = null;
		if(request.getParameter("orgName") != null && !"".equals(request.getParameter("orgName"))){
			orgInfoName = request.getParameter("orgName");
		}
		//上级组织
		String parentOrgName = null;
		if(request.getParameter("parentOrgName") != null && !"".equals(request.getParameter("parentOrgName"))){
			parentOrgName = request.getParameter("parentOrgName");
		}
		//录入人
		String createUser = null;
		if(request.getParameter("createUser") != null && !"".equals(request.getParameter("createUser"))){
			createUser = request.getParameter("createUser");
		}
		//登记开始日期
		Date rCreateStartTime = null;
		if(request.getParameter("rCreateStartTime") != null){
			rCreateStartTime = DateUtils.formatTime(request.getParameter("rCreateStartTime"));
		}
		//登记结束日期
		Date rCreateEndTime = null;
		if(request.getParameter("rCreateEndTime") != null){
			rCreateEndTime = DateUtils.formatTime(request.getParameter("rCreateEndTime"));
		}
		//当前页数
		String page1=request.getParameter("page");
		Integer page2=Integer.parseInt(page1);
		//每页尺寸
		String rows1 = request.getParameter("rows");
		Integer rows = Integer.parseInt(rows1);
		Integer page = page2*rows;
		
		//封装数据
		Map<String, Object> couponInfoPoMap = new HashMap<String, Object>();
		couponInfoPoMap.put("orgInfoRootId", orgInfoRootId);
		couponInfoPoMap.put("cardCode", cardCode);
		couponInfoPoMap.put("couponType", couponType);
		couponInfoPoMap.put("supplierCode", supplierCode);
		couponInfoPoMap.put("couponStatus", couponStatus);
		couponInfoPoMap.put("cardType", cardType);
		couponInfoPoMap.put("couponName", couponName);
		couponInfoPoMap.put("amountStart", amountStart);
		couponInfoPoMap.put("amountEnd", amountEnd);
		couponInfoPoMap.put("balanceStart", balanceStart);
		couponInfoPoMap.put("balanceEnd", balanceEnd);
		couponInfoPoMap.put("orgInfoName", orgInfoName);
		couponInfoPoMap.put("parentOrgName", parentOrgName);
		couponInfoPoMap.put("createUser", createUser);
		couponInfoPoMap.put("rCreateStartTime", rCreateStartTime);
		couponInfoPoMap.put("rCreateEndTime", rCreateEndTime);
		couponInfoPoMap.put("page", page);
		couponInfoPoMap.put("rows", rows);
		
		List<CouponInfoPo> couponInfoPoList = couponInfoFacade.getCouponInfoByOrgInfoRootId(couponInfoPoMap);
		
		if (CollectionUtils.isNotEmpty(couponInfoPoList)) {
			// 获取有价券ID
			List<Integer> couponInfoIds = CommonUtils.getValueList(couponInfoPoList, "id");
			//有价券结算单号集合
			List<SettlementCouponUse> settlementCouponUseList = null;
			//有价券领用信息集合
			List<CouponUseInfo> couponUseInfoList = null;
			if(CollectionUtils.isNotEmpty(couponInfoIds)){
				//根据有价券ID集合查询有价券结算单号
				settlementCouponUseList = settlementCouponUseFacade.findSettlementCouponUseByCouponInfoIds(couponInfoIds);
				//根据有价券ID集合查询有价券领用信息
				couponUseInfoList = couponUseInfoFacade.getCouponUseInfoByCouponInfoIds(couponInfoIds);
			}
			// 获取所属组织id
			List<Integer> orgInfoIdList = CommonUtils.getValueList(couponInfoPoList, "orgInfoId");
			// 获取机构名称
			List<OrgInfoPo> orgInfoList = orgInfoFacade.findOrgNameByIds(orgInfoIdList);
			// 封装成map key 机构id value 组织机构名称
			Map<Integer, String> orgInfoMap = CommonUtils.listforMap(orgInfoList, "id", "orgName");
			
			// 获取上级所属组织id
			List<Integer> parentOrgInfoIdList = CommonUtils.getValueList(couponInfoPoList, "parentOrgInfoId");
			// 获取上级机构名称
			List<OrgInfoPo> parentOrgInfoList = new ArrayList<OrgInfoPo>();
			if (CollectionUtils.isNotEmpty(parentOrgInfoIdList)) {
				parentOrgInfoList = orgInfoFacade.findOrgNameByIds(parentOrgInfoIdList);
			}
			// 封装成map key 上级机构id value 上级组织机构名称
			Map<Integer, String> parentOrgInfoMap = new HashMap<Integer, String>();
			if (CollectionUtils.isNotEmpty(parentOrgInfoList)) {
				parentOrgInfoMap = CommonUtils.listforMap(parentOrgInfoList, "id", "orgName");
			}
			
			// 封装成map key 有价券信息表主键ID value 领用人
			Map<Integer, String> couponUseInfoMap = new HashMap<Integer, String>();
			if (CollectionUtils.isNotEmpty(couponUseInfoList)) {
				couponUseInfoMap = CommonUtils.listforMap(couponUseInfoList, "couponInfoId", "userName");
			}
			
			//获取有价券类型
			List<Integer> couponTypeInfoIdList = CommonUtils.getValueList(couponInfoPoList, "couponType");
			// 获取有价券类型名称
			List<CouponTypeInfo> couponTypeInfoList = couponTypeInfoFacade.findCouponTypeInfoByIds(couponTypeInfoIdList);
			// 封装成map key 有价券类型id value 有价券类型名称
			Map<Integer, String> couponTypeInfoMap = CommonUtils.listforMap(couponTypeInfoList, "id", "couponType");
			
			//获取供应商名称Id
			List<Integer> couponSupplierInfoIdList = CommonUtils.getValueList(couponInfoPoList, "supplierCode");
			// 获取有价券供应商名称
			List<CouponSupplierInfoPo> couponSupplierInfoList = couponSupplierInfoFacade.findCouponSupplierByIds(couponSupplierInfoIdList);
			// 封装成map key:有价券供应商id value:有价券供应商名称
			Map<Integer, String> couponSupplierInfoMap = CommonUtils.listforMap(couponSupplierInfoList, "id", "supplierName");
			
			//获取创建人Id
			List<Integer> userInfoIdList = CommonUtils.getValueList(couponInfoPoList, "createUser");
			//获取创建人名称
			List<UserInfo> userInfoList = userInfoFacade.findUserNameByIds(userInfoIdList);
			// 封装成map key:用户id value:用户名称
			Map<Integer, String> userInfoMap = CommonUtils.listforMap(userInfoList, "id", "userName");
			
			for(CouponInfoPo couponInfoPo : couponInfoPoList){
				//所属机构
				if(couponInfoPo.getOrgInfoId() != null && MapUtils.isNotEmpty(orgInfoMap) && orgInfoMap.get(couponInfoPo.getOrgInfoId()) != null){
					couponInfoPo.setOrgInfoName(orgInfoMap.get(couponInfoPo.getOrgInfoId()));
				}
				
				//上级机构
				if(couponInfoPo.getParentOrgInfoId() != null&& MapUtils.isNotEmpty(parentOrgInfoMap) && parentOrgInfoMap.get(couponInfoPo.getParentOrgInfoId()) != null){
					couponInfoPo.setParentOrgName(parentOrgInfoMap.get(couponInfoPo.getParentOrgInfoId()));
				}
//				
				//领用人
				if(MapUtils.isNotEmpty(couponUseInfoMap) && couponUseInfoMap.get(couponInfoPo.getId()) != null){
					couponInfoPo.setUseUser(couponUseInfoMap.get(couponInfoPo.getId()));
				}
				
				//有价券类型
				if(couponInfoPo.getCouponType() != null&& MapUtils.isNotEmpty(couponTypeInfoMap) && couponTypeInfoMap.get(couponInfoPo.getCouponType()) != null){
					couponInfoPo.setCouponTypeName(couponTypeInfoMap.get(couponInfoPo.getCouponType()));
				}
				
				//有价券供应商
				if(couponInfoPo.getSupplierCode() != null&& MapUtils.isNotEmpty(couponSupplierInfoMap) && couponSupplierInfoMap.get(couponInfoPo.getSupplierCode()) != null){
					couponInfoPo.setSupplierName(couponSupplierInfoMap.get(couponInfoPo.getSupplierCode()));
				}
				
				//创建人名称
				if(couponInfoPo.getCreateUser() != null&& MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(couponInfoPo.getCreateUser()) != null){
					couponInfoPo.setCreateUserStr(userInfoMap.get(couponInfoPo.getCreateUser()));
				}
				
				//格式化采购时间
				String purchaseTime = new SimpleDateFormat("yyyy-MM-dd").format(couponInfoPo.getPurchaseTime());
				couponInfoPo.setPurchaseTimeStr(purchaseTime);
				
				//格式化创建时间
				String createTime = new SimpleDateFormat("yyyy-MM-dd").format(couponInfoPo.getCreateTime());
				couponInfoPo.setCreateTimeStr(createTime);
				
				//封装有价券使用的结算单号
				if(CollectionUtils.isNotEmpty(settlementCouponUseList)){
					StringBuilder settlementIdStr = new StringBuilder();
					int i = 0;
					for(SettlementCouponUse settlementCouponUse : settlementCouponUseList){
						if(settlementCouponUse.getSettlementId() != null){
							if(settlementCouponUse.getCouponInfoId() != null && couponInfoPo.getId() == settlementCouponUse.getCouponInfoId() && i<settlementCouponUseList.size()-1){
								settlementIdStr.append(settlementCouponUse.getSettlementId()).append(",");
							}else{
								settlementIdStr.append(settlementCouponUse.getSettlementId());
							}
							i++;
						}
					}
					couponInfoPo.setSettlementIdStr(settlementIdStr.toString());
				}
			}
		}
		return couponInfoPoList;
	}
	
	@RequestMapping(value="/getCount",produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中取出主机构ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer orgInfoRootId = userInfo.getOrgRootId();
		
		//从前端获取并校验卡号、有价券类型、供应商、有价券状态、卡片类型、有价券名称、总额、余额
		String cardCode = request.getParameter("cardCode");
		if(cardCode==""){
			cardCode = null;
		}
		
		String couponTypeStr = request.getParameter("couponType");
		Integer couponType;
		if(couponTypeStr!=""){
			couponType = Integer.parseInt(couponTypeStr);
		}else{
			couponType = null;
		}
		
		String supplierCodeStr = request.getParameter("supplierCode");
		
		String supplierCode;
		if(supplierCodeStr!=""&&couponTypeStr!=null){
			//前台获取的供应商名称，在这里转化为供应商ID
			supplierCode = supplierCodeStr;
		}else{
			supplierCode = null;
		}
		
		String couponStatusStr = request.getParameter("couponStatus");
		Integer couponStatus;
		if(couponStatusStr!=""){
			couponStatus = Integer.parseInt(couponStatusStr);
		}else{
			couponStatus = null;
		}
		
		String cardTypeStr = request.getParameter("cardType");
		Integer cardType;
		if(cardTypeStr!=""){
			cardType = Integer.parseInt(cardTypeStr);
		}else{
			cardType = null;
		}
		
		String couponName = request.getParameter("couponName");
		if(couponName==""){
			couponName = null;
		}
		
		String amountStartStr = request.getParameter("amountStart");
		Integer amountStart;
		if(amountStartStr!=""&&amountStartStr!=null){
			amountStart = Integer.parseInt(amountStartStr);
		}else{
			amountStart = null;
		}
		
		String amountEndStr = request.getParameter("amountEnd");
		Integer amountEnd;
		if(amountEndStr!=""&&amountEndStr!=null){
			amountEnd = Integer.parseInt(amountEndStr);
		}else{
			amountEnd = null;
		}
		
		String balanceStartStr = request.getParameter("balanceStart");
		Integer balanceStart;
		if(balanceStartStr!=""&&balanceStartStr!=null){
			balanceStart = Integer.parseInt(balanceStartStr);
		}else{
			balanceStart = null;
		}
		
		String balanceEndStr = request.getParameter("balanceEnd");
		Integer balanceEnd;
		if(balanceEndStr!=""&&balanceEndStr!=null){
			balanceEnd = Integer.parseInt(balanceEndStr);
		}else{
			balanceEnd = null;
		}
		
		//所属组织
		String orgInfoName = null;
			if(request.getParameter("orgName") != null){
			orgInfoName = request.getParameter("orgName");
		}
		//上级组织
		String parentOrgName = null;
		if(request.getParameter("parentOrgName") != null){
			parentOrgName = request.getParameter("parentOrgName");
		}
		//录入人
		String createUser = null;
		if(request.getParameter("createUser") != null){
			createUser = request.getParameter("createUser");
		}
		//登记开始日期
		Date rCreateStartTime = null;
		if(request.getParameter("rCreateStartTime") != null){
			rCreateStartTime = DateUtils.formatDate(request.getParameter("rCreateStartTime"));
		}
		//登记结束日期
		Date rCreateEndTime = null;
		if(request.getParameter("rCreateEndTime") != null){
			rCreateEndTime = DateUtils.formatDate(request.getParameter("rCreateEndTime"));
		}
		
		//封装数据
		Map<String, Object> couponInfoPoMap = new HashMap<String, Object>();
		couponInfoPoMap.put("orgInfoRootId", orgInfoRootId);
		couponInfoPoMap.put("cardCode", cardCode);
		couponInfoPoMap.put("couponType", couponType);
		couponInfoPoMap.put("supplierCode", supplierCode);
		couponInfoPoMap.put("couponStatus", couponStatus);
		couponInfoPoMap.put("cardType", cardType);
		couponInfoPoMap.put("couponName", couponName);
		couponInfoPoMap.put("amountStart", amountStart);
		couponInfoPoMap.put("amountEnd", amountEnd);
		couponInfoPoMap.put("balanceStart", balanceStart);
		couponInfoPoMap.put("balanceEnd", balanceEnd);
		couponInfoPoMap.put("orgInfoName", orgInfoName);
		couponInfoPoMap.put("parentOrgName", parentOrgName);
		couponInfoPoMap.put("createUser", createUser);
		couponInfoPoMap.put("rCreateStartTime", rCreateStartTime);
		couponInfoPoMap.put("rCreateEndTime", rCreateEndTime);
		Integer count = couponInfoFacade.countCouponInfoForPage(couponInfoPoMap);
		
		return count;
	}
	
	/**
	 * 跳转到领用情况页面
	 * 
	 * @author luojuan 2017年6月8日
	 */
	@RequestMapping("/couponUseInfoList")
	public String couponUseInfoList (HttpServletRequest request,Model model){
		Integer couponInfoId = Integer.parseInt(request.getParameter("couponInfoId")) ;
		model.addAttribute("couponInfoId",couponInfoId);
		return "template/coupon/coupon_use_info_list";
	}
	/**
	 * 获取领用信息
	 * 
	 * @author luojuan 2017年6月8日
	 */
	@RequestMapping(value="/getCouponUseInfoByCouponInfoId",produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<CouponUseInfo> getCouponUseInfoByCouponInfoId(HttpServletRequest request,HttpServletResponse response){
		//校验有价券编号
		String couponInfoIdStr = request.getParameter("couponInfoId");
		Integer couponInfoId = Integer.parseInt(couponInfoIdStr);
		
		//当前页数
		String page1=request.getParameter("page");
		Integer page2=Integer.parseInt(page1);
		//每页尺寸
		String rows1 = request.getParameter("rows");
		Integer rows = Integer.parseInt(rows1);
		Integer page = page2*rows;
		
		//封装数据
		Map<String, Object> couponUseInfoPoMap = new HashMap<String, Object>();
		couponUseInfoPoMap.put("couponInfoId", couponInfoId);
		couponUseInfoPoMap.put("page", page);
		couponUseInfoPoMap.put("rows", rows);
		
		List<CouponUseInfo> couponUseInfoPoList = couponUseInfoFacade.getCouponUseInfoByCouponInfoId(couponUseInfoPoMap);
			if (CollectionUtils.isNotEmpty(couponUseInfoPoList)) {
					
				// 获取所属组织id
				List<Integer> orgInfoIdList = CommonUtils.getValueList(couponUseInfoPoList, "orgInfoId");
				// 获取机构名称
				List<OrgInfoPo> orgInfoList = orgInfoFacade.findOrgNameByIds(orgInfoIdList);
				// 封装成map key 机构id value 组织机构名称
				Map<Integer, String> orgInfoMap = CommonUtils.listforMap(orgInfoList, "id", "orgName");
				
				//获取创建人Id
				List<Integer> userInfoIdList = CommonUtils.getValueList(couponUseInfoPoList, "createUser");
				//获取创建人名称
				List<UserInfo> userInfoList = userInfoFacade.findUserNameByIds(userInfoIdList);
				// 封装成map key:用户id value:用户名称
				Map<Integer, String> userInfoMap = CommonUtils.listforMap(userInfoList, "id", "userName");
					
				for(CouponUseInfo couponUseInfo : couponUseInfoPoList){
					//所属机构
					if(couponUseInfo.getOrgInfoId() != null&& orgInfoMap.get(couponUseInfo.getOrgInfoId()) != null){
						couponUseInfo.setOrgName(orgInfoMap.get(couponUseInfo.getOrgInfoId()));
					}

					//创建人名称
					if(couponUseInfo.getCreateUser() != null&& userInfoMap.get(couponUseInfo.getCreateUser()) != null){
						couponUseInfo.setCreateUserStr(userInfoMap.get(couponUseInfo.getCreateUser()));
					}
					
					//前台获取领用人姓名
					couponUseInfo.setUserName(userInfoMap.get(couponUseInfo.getCreateUser()));
					//格式化领用时间
					String userTime = new SimpleDateFormat("yyyy-MM-dd").format(couponUseInfo.getUseTime());
					couponUseInfo.setUseTimeStr(userTime);
					
					//格式化创建时间
					String createTime = new SimpleDateFormat("yyyy-MM-dd").format(couponUseInfo.getCreateTime());
					couponUseInfo.setCreateTimeStr(createTime);
					
					//前台获取创建人姓名
					UserInfo userInfoStr = (UserInfo)userInfoFacade.getUserInfoById(couponUseInfo.getCreateUser());
					couponUseInfo.setCreateUserStr(userInfoStr.getUserName());
					//前台获取领用人姓名
					couponUseInfo.setUserName(userInfoStr.getUserName());
				}
		}
		
		return couponUseInfoPoList;
	}
	
	@RequestMapping(value="/getCouponUseInfoCount",produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getCouponUseInfoCount(HttpServletRequest request,HttpServletResponse response){
		
		//校验有价券编号
		String couponInfoIdStr = request.getParameter("couponInfoId");
		Integer couponInfoId = Integer.parseInt(couponInfoIdStr);
		
		//封装数据
		Map<String, Object> couponUseInfoPoMap = new HashMap<String, Object>();
		couponUseInfoPoMap.put("couponInfoId", couponInfoId);
		
		Integer countNum = couponUseInfoFacade.countCouponUseInfoByCouponInfoId(couponUseInfoPoMap);
		
		return countNum;
	}
	
	/**
	 * 跳转到退还情况页面
	 * 
	 * @author luojuan 2017年6月9日
	 */
	@RequestMapping("/couponRebackInfoList")
	public String couponRebackInfoList (HttpServletRequest request,Model model){
		if(request.getParameter("couponId")!=""){
			Integer couponInfoId = Integer.parseInt(request.getParameter("couponId"));
			model.addAttribute("couponInfoId",couponInfoId);
		}
		return "template/coupon/coupon_reback_info_list";
	}
	
	/**
	 * 获取退还信息
	 * 
	 * @author luojuan 2017年6月9日
	 */
	@RequestMapping(value="/getCouponRebackInfoByCouponInfoId",produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<CouponRebackInfo> getCouponRebackInfoByCouponInfoId(HttpServletRequest request,HttpServletResponse response){
		
		//校验有价券编号
		String couponInfoIdStr = request.getParameter("couponInfoId");
		Integer couponInfoId = Integer.parseInt(couponInfoIdStr);
		
		//当前页数
		String page1=request.getParameter("page");
		Integer page2=Integer.parseInt(page1);
		//每页尺寸
		String rows1 = request.getParameter("rows");
		Integer rows = Integer.parseInt(rows1);
		Integer page = page2*rows;
		
		//封装数据
		Map<String, Object> couponRebackInfoPoMap = new HashMap<String, Object>();
		couponRebackInfoPoMap.put("couponInfoId", couponInfoId);
		couponRebackInfoPoMap.put("page", page);
		couponRebackInfoPoMap.put("rows", rows);
		
		List<CouponRebackInfo> couponRebackInfoPoList = couponRebackInfoFacade.getCouponRebackInfoByCouponInfoId(couponRebackInfoPoMap);
		
		if (CollectionUtils.isNotEmpty(couponRebackInfoPoList)) {
			
			// 获取所属组织id
			List<Integer> orgInfoIdList = CommonUtils.getValueList(couponRebackInfoPoList, "orgInfoId");
			// 获取机构名称
			List<OrgInfoPo> orgInfoList = orgInfoFacade.findOrgNameByIds(orgInfoIdList);
			// 封装成map key 机构id value 组织机构名称
			Map<Integer, String> orgInfoMap = CommonUtils.listforMap(orgInfoList, "id", "orgName");
			
			//获取创建人Id
			List<Integer> userInfoIdList = CommonUtils.getValueList(couponRebackInfoPoList, "createUser");
			//获取创建人名称
			List<UserInfo> userInfoList = userInfoFacade.findUserNameByIds(userInfoIdList);
			// 封装成map key:用户id value:用户名称
			Map<Integer, String> userInfoMap = CommonUtils.listforMap(userInfoList, "id", "userName");

			for(CouponRebackInfo couponRebackInfo : couponRebackInfoPoList){
				//所属机构
				if(couponRebackInfo.getOrgInfoId() != null&& orgInfoMap.get(couponRebackInfo.getOrgInfoId()) != null){
					couponRebackInfo.setOrgName(orgInfoMap.get(couponRebackInfo.getOrgInfoId()));
				}
				
				//创建人名称
				if(couponRebackInfo.getCreateUser() != null&& userInfoMap.get(couponRebackInfo.getCreateUser()) != null){
					couponRebackInfo.setCreateUserStr(userInfoMap.get(couponRebackInfo.getCreateUser()));
				}
				
				//前台获取领用人姓名
				couponRebackInfo.setUserName(userInfoMap.get(couponRebackInfo.getCreateUser()));
				
				//格式化领用时间
				String userTime = new SimpleDateFormat("yyyy-MM-dd").format(couponRebackInfo.getUseTime());
				couponRebackInfo.setUseTimeStr(userTime);
				
				//格式化创建时间
				String createTime = new SimpleDateFormat("yyyy-MM-dd").format(couponRebackInfo.getCreateTime());
				couponRebackInfo.setCreateTimeStr(createTime);
			}
		}
		
		return couponRebackInfoPoList;
	}
	
	@RequestMapping(value="/getCouponRebackInfoCount",produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getCouponRebackInfoCount(HttpServletRequest request,HttpServletResponse response){
		
		//校验有价券编号
		String couponInfoIdStr = request.getParameter("couponInfoId");
		Integer couponInfoId = Integer.parseInt(couponInfoIdStr);
		
		//封装数据
		Map<String, Object> couponRebackInfoPoMap = new HashMap<String, Object>();
		couponRebackInfoPoMap.put("couponInfoId", couponInfoId);
		
		Integer countNum = couponRebackInfoFacade.countCouponRebackInfoByCouponInfoId(couponRebackInfoPoMap);
		
		return countNum;
	}
	
	/**
	 * 下载导入模板
	 * @author luojuan 2017年6月9日
	 * @param request
	 * @param response
	 */
	@RequestMapping(value = "/downTemplate", method = RequestMethod.POST)
    public void downTemplate(HttpServletRequest request, HttpServletResponse response){
		//获取session中的主机构ID
		UserInfo userInfo =  (UserInfo)request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		 
		// 1、创建sheet
		HSSFWorkbook workbook = new HSSFWorkbook();
		HSSFSheet sheet = workbook.createSheet("有价劵模版");
		HSSFCellStyle cssStyle = POIExcelUtil.setHSSFCss(workbook);
		// 设置宽度
		sheet.setColumnWidth(0, 40 * 256);
		sheet.setColumnWidth(1, 40 * 256);
		sheet.setColumnWidth(2, 12 * 256);
		sheet.setColumnWidth(3, 12 * 256);
		sheet.setColumnWidth(4, 12 * 256);
		sheet.setColumnWidth(5, 12 * 256);
		sheet.setColumnWidth(6, 12 * 256);
		sheet.setColumnWidth(7, 14 * 256);
		sheet.setColumnWidth(8, 24 * 256);
		sheet.setColumnWidth(9, 24 * 256);
		sheet.setColumnWidth(10, 24 * 256);

		HSSFRow titleRowProduct = sheet.createRow(0);
		titleRowProduct.setHeightInPoints(28);
		List<String> TITLE_LIST = new ArrayList<String>();
		TITLE_LIST.add("卡号");
		TITLE_LIST.add("所属组织");
		TITLE_LIST.add("供应商");
		TITLE_LIST.add("有价劵类型");
		TITLE_LIST.add("卡片类型");
		TITLE_LIST.add("有价券名称");
		TITLE_LIST.add("计量单位");
		TITLE_LIST.add("总额");
		TITLE_LIST.add("采购人");
		TITLE_LIST.add("采购时间");
		TITLE_LIST.add("备注");
		
		int cellIndex = 0;
		for (cellIndex = 0; cellIndex < TITLE_LIST.size(); cellIndex++) {
		    HSSFCell cell = titleRowProduct.createCell(cellIndex);
		    cell.setCellStyle(cssStyle);
		    cell.setCellValue(new HSSFRichTextString(TITLE_LIST.get(cellIndex)));
		}
		
		//2、配置所属组织
		HSSFSheet sheetOrg = workbook.createSheet("所属组织");
		int orgSize = 0;
		//待查询
		List<OrgInfoPo> orgInfoList = orgInfoFacade.findRootAndTwoLevelOrgInfo(rootOrgInfoId);
		
		if(CollectionUtils.isNotEmpty(orgInfoList)){
			orgSize = orgInfoList.size();
			int j = 0;
		    for (OrgInfoPo orgInfo : orgInfoList) {
		    	HSSFRow titleRowOrg = sheetOrg.createRow(j);
		    	titleRowOrg.createCell(0).setCellValue(new HSSFRichTextString(orgInfo.getOrgName()));
		    	j++;
		    }
		}else{
			orgSize = 1;
		}
		
		POIExcelUtil.createName(workbook, "orgs", "所属组织!$A$1:$A$" + orgSize);
		HSSFDataValidation org_validation_list = POIExcelUtil.setDataValidationList((short) 1, (short) 1001, (short) 1, (short) 1, "orgs");
		org_validation_list.createPromptBox("提示", "所属机构不可为空");
		sheet.addValidationData(org_validation_list);
	
		
		//3、配置供应商
		HSSFSheet sheetCouponSupplier = workbook.createSheet("供应商");
		int couponSupplierSize = 0;
		
		List<CouponSupplierInfoPo> couponSupplierInfoList = couponSupplierInfoFacade.getCouponSupplierInfoByOrgInfoRootId(rootOrgInfoId);
		
		if(CollectionUtils.isNotEmpty(couponSupplierInfoList)){
			couponSupplierSize = couponSupplierInfoList.size();
			int j = 0;
		    for (CouponSupplierInfoPo couponSupplierInfoPo : couponSupplierInfoList) {
		    	HSSFRow titleRowCouponSupplier = sheetCouponSupplier.createRow(j);
		    	titleRowCouponSupplier.createCell(0).setCellValue(new HSSFRichTextString(couponSupplierInfoPo.getSupplierName()));
		    	j++;
		    }
		}else{
			couponSupplierSize = 1;
		}
		
		POIExcelUtil.createName(workbook, "couponSupplier", "供应商!$A$1:$A$" + couponSupplierSize);
		HSSFDataValidation couponSupplier_validation_list = POIExcelUtil.setDataValidationList((short) 1, (short) 1001, (short) 2, (short) 2, "couponSupplier");
		couponSupplier_validation_list.createPromptBox("提示", "供应商不可为空");
		sheet.addValidationData(couponSupplier_validation_list);
		
		//4、配置有价劵类型
		HSSFSheet sheetCouponType = workbook.createSheet("有价券类型");
		int couponTypeSize = 0;
		
		List<CouponTypeInfo> couponTypeInfoList = couponTypeInfoFacade.getCouponTypeInfo();
		
		if(CollectionUtils.isNotEmpty(couponTypeInfoList)){
			couponTypeSize = couponTypeInfoList.size();
			int j = 0;
		    for (CouponTypeInfo couponTypeInfo : couponTypeInfoList) {
		    	HSSFRow titleRowCouponType = sheetCouponType.createRow(j);
		    	titleRowCouponType.createCell(0).setCellValue(new HSSFRichTextString(couponTypeInfo.getCouponType()));
		    	j++;
		    }
		}else{
			couponTypeSize = 1;
		}
		
		POIExcelUtil.createName(workbook, "couponType", "有价券类型!$A$1:$A$" + couponTypeSize);
		HSSFDataValidation couponType_validation_list = POIExcelUtil.setDataValidationList((short) 1, (short) 1001, (short) 3, (short) 3, "couponType");
		couponType_validation_list.createPromptBox("提示", "有价券类型不可为空");
		sheet.addValidationData(couponType_validation_list);
		
		//5、配置卡片类型
		HSSFSheet sheetCardType = workbook.createSheet("卡片类型");
		int cardTypeSize = 0;
		
		List<String> cardTypeList = new ArrayList<String>();
		cardTypeList.add("定额卡");
		
		if(CollectionUtils.isNotEmpty(cardTypeList)){
			cardTypeSize = cardTypeList.size();
			int j = 0;
		    for (j=0;j<cardTypeList.size();j++) {
		    	HSSFRow titleRowtCardType = sheetCardType.createRow(j);
		    	titleRowtCardType.createCell(0).setCellValue(new HSSFRichTextString(cardTypeList.get(j)));
		    }
		}else{
			cardTypeSize = 1;
		}
		
		POIExcelUtil.createName(workbook, "cardType", "卡片类型!$A$1:$A$" + cardTypeSize);
		HSSFDataValidation cardType_validation_list = POIExcelUtil.setDataValidationList((short) 1, (short) 1001, (short) 4, (short)4 , "cardType");
		cardType_validation_list.createPromptBox("提示", "卡片类型不可为空");
		sheet.addValidationData(cardType_validation_list);
		
		//有价券名称
		
		//6、配置计量单位
		HSSFSheet sheetUnits = workbook.createSheet("计量单位");
		int unitsSize = 0;
		
		List<String> unitsList = new ArrayList<String>();
		unitsList.add("张");
		unitsList.add("台");
		unitsList.add("个");
		unitsList.add("匹");
		unitsList.add("片");
		unitsList.add("吨");
		unitsList.add("公斤");
		
		if(CollectionUtils.isNotEmpty(unitsList)){
			unitsSize = unitsList.size();
			int j = 0;
		    for (j=0;j<unitsList.size();j++) {
		    	HSSFRow titleRowtUnits = sheetUnits.createRow(j);
		    	titleRowtUnits.createCell(0).setCellValue(new HSSFRichTextString(unitsList.get(j)));
		    }
		}else{
			unitsSize = 1;
		}
		POIExcelUtil.createName(workbook, "units", "计量单位!$A$1:$A$" + unitsSize);
		HSSFDataValidation units_validation_list = POIExcelUtil.setDataValidationList((short) 1, (short) 1001, (short) 6, (short) 6, "units");
		units_validation_list.createPromptBox("提示", "计量单位不可为空");
		sheet.addValidationData(units_validation_list);

		// 设置卡号提示语
		POIExcelUtil.setHSSFPrompt(sheet, "必填", "卡号不可重复", (short) 1, (short) 1001, (short) 0, (short) 0, "BB1");
		POIExcelUtil.setHSSFPrompt(sheet, "必填", "有价券名称不可重复", (short) 1, (short) 1001, (short) 5, (short) 5, "BB5");
		POIExcelUtil.setHSSFPrompt(sheet, "必填", "总额需为数字", (short) 1, (short) 1001, (short) 7, (short) 7, "BB7");
		POIExcelUtil.setHSSFPrompt(sheet, "必填", "采购人不能为空", (short) 1, (short) 1001, (short) 8, (short) 8, "BB8");
		POIExcelUtil.setHSSFPrompt(sheet, "必填", "采购时间格式为 2017-07-02", (short) 1, (short) 1001, (short) 9, (short) 9, "BB9");
		POIExcelUtil.setHSSFPrompt(sheet, "必填", "备注不可为空", (short) 1, (short) 1001, (short) 10, (short) 10, "BB10");
		
		String zhStr= "有价券导入模板";
		String fileName = null;
		// 5、转换格式导出
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		try {
			workbook.write(out);
			byte[] bytes = out.toByteArray();
			response.setContentType("application/x-msdownload");
			response.setContentLength(bytes.length);
			fileName = new String(zhStr.getBytes("GB2312"), "ISO_8859_1");
			response.setHeader("Content-Disposition", "attachment;filename="+fileName+".xls");
			response.getOutputStream().write(bytes);
			response.getOutputStream().flush();
		} catch (IOException e) {
			log.error("下载导入模板IO异常",e);
		} catch (Exception e) {
			log.error("下载导入模板异常",e);
		}
	}
	
	/**
	 * Excel导入
	 * 
	 * @author luojuan 2017年6月29日
	 * @throws Exception 
	 */
	@RequestMapping(value = "/loadTemplate",produces = "application/json; charset=utf-8")
	@ResponseBody
    public  JSONObject loadTemplate(MultipartFile myfile,HttpServletRequest request, HttpServletResponse response) throws Exception{
		JSONObject jo = new JSONObject();
		
		//获取session中的主机构ID
		 UserInfo userInfo =  (UserInfo)request.getSession().getAttribute("userInfo");
		 Integer orgInfoId = userInfo.getOrgInfoId();
		 Integer rootOrgInfoId = userInfo.getOrgRootId();
		 Integer userInfoId = userInfo.getId();
		 
		 //获取后缀名
		 String fileName = myfile.getOriginalFilename();
		 
		// 校验文件是否满足需求
	    if (myfile.isEmpty()) {
	    	throw new Exception("请选择文件后上传");
	    } else {
			if (myfile.getSize() > 1048576) {
			    throw new Exception("文件长度过大，请上传1M以内文件");
			}
	    }
		 
		 //获取Excel文件地址并导入
		 String[] keyStr = {"carCode","orgs","couponSupplier","couponType","cardType","couponName","units","amount","purchase","purchaseTimeStr","remarks"};
		 List<Map<String, Object>> couponList = POIExcelUtil.read(myfile,fileName, keyStr, 2);
		 
		 
		 //导入记录不能超过一千条，超过则提示
		 if(couponList.size()>1000){
			jo.put("success", false);
			jo.put("msg", "上传文件记录不能超过1000条");
		 }
		 
		 if (CollectionUtils.isNotEmpty(couponList)) {
			 //获取所属机构名称
			 List<String> orgNames = CommonUtils.getValueList(couponList, "orgs");
			 //获取所属机构ID
			 List<OrgInfoPo> orgInfoList = orgInfoFacade.findOrgInfoByOrgNames(orgNames);
			 //转为map存放
			 Map<String, OrgInfoPo> orgMap = CommonUtils.listforMap(orgInfoList, "orgName",null);
			 
			 //获取有价券供应商name
			 List<String> couponSuppliers = CommonUtils.getValueList(couponList, "couponSupplier");
			//获取有价券供应商
			 List<CouponSupplierInfoPo> couponSupplierInfoList = couponSupplierInfoFacade.findCouponSupplierBySupplierNames(couponSuppliers);
			 //转为map存放
			 Map<String, CouponSupplierInfoPo> couponSupplierMap = CommonUtils.listforMap(couponSupplierInfoList, "supplierName",null);
			 
			//获取所属机构名称
			 List<String> couponTypes = CommonUtils.getValueList(couponList, "couponType");
			//校验有价券类型
			 List<CouponTypeInfo> couponTypeInfoList = couponTypeInfoFacade.findCouponTypeInfoByCouponTypeNames(couponTypes);
			 //转为map存放
			 Map<String, CouponTypeInfo> couponTypeMap = CommonUtils.listforMap(couponTypeInfoList, "couponType",null);

			 //封装数据
			 CouponInfoPo couponInfoData = new CouponInfoPo();
			 for(Map<?,?> couponInfo : couponList){
				 //获取卡号
				 couponInfoData.setCardCode(couponInfo.get("carCode").toString());
				 
				 //获取卡片类型
				 couponInfoData.setCardType(1);
				 
				 //获取有价券名称
				 couponInfoData.setCouponName(couponInfo.get("couponName").toString()); 
				 
				//校验计量单位
				 couponInfoData.setUnits(couponInfo.get("units").toString());
				 
				 //获取总额
				 BigDecimal amount = new BigDecimal(couponInfo.get("amount").toString());
				 couponInfoData.setAmount(amount.setScale(2, RoundingMode.HALF_EVEN)); 
				 
				//获取备注
				 couponInfoData.setRemarks(couponInfo.get("remarks").toString());
				 
				 //获取采购人
				 couponInfoData.setPurchase(couponInfo.get("purchase").toString());
				 
				 //获取采购时间
				 Date purchaseTimeStr = (Date)couponInfo.get("purchaseTimeStr");
				 couponInfoData.setPurchaseTime(purchaseTimeStr);
				
				//校验组织名称
				 if(orgMap.get(couponInfo.get("orgs"))!= null){
					 couponInfoData.setOrgInfoId(orgMap.get(couponInfo.get("orgs")).getId());
				 }
				 
				//校验供应商名称
				 if(couponSupplierMap.get(couponInfo.get("couponSupplier"))!= null){
					 couponInfoData.setSupplierCode(couponSupplierMap.get(couponInfo.get("couponSupplier")).getId());
				 }
				 
				//校验有价券类型
				 if( couponTypeMap.get(couponInfo.get("couponType"))!= null){
					 couponInfoData.setCouponType(couponTypeMap.get(couponInfo.get("couponType")).getId());
				 }
				 
				 try {
					jo = couponInfoFacade.loadExceladdCouponInfo(couponInfoData,orgInfoId , rootOrgInfoId, userInfoId);
				} catch (Exception e) {
					jo = new JSONObject();
					log.error("Excel导入异常",e);
					
					jo.put("success", false);
					jo.put("msg", "Excel导入有价券信息添加失败");
				}
			 }
		 }
		return jo;
	}

	/**
	 * 新增/编辑有价券初始页
	 * 
	 * @author luojuan 2017年6月12日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initCouponPage")
	public String initCouponPage(HttpServletRequest request, Model model) {
		// 取出操作类型(1:新增 2:编辑)
		String operateType1 = request.getParameter("operateType");
		Integer operateType = Integer.parseInt(operateType1);
		String userName="";
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		if(userInfo.getUserRole()==1 || userInfo.getUserRole()==2){
			List<Integer> orgInfoIds=new ArrayList<Integer>();
			orgInfoIds.add(userInfo.getOrgInfoId());
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					userName=orgInfoPo.getOrgName();
				}
			}
			
		}else if(userInfo.getUserRole()==3){
			IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerById(userInfo.getId());
			
			if(individualOwnerPo!=null){
				userName=individualOwnerPo.getRealName();
			}
			
		}else if(userInfo.getUserRole()==4){
			List<Integer> userInfoIds=new ArrayList<Integer>();
			userInfoIds.add(userInfo.getId());
			List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
			
			if(CollectionUtils.isNotEmpty(driverInfos)){
				for (DriverInfo driverInfo : driverInfos) {
					userName=driverInfo.getDriverName();
				}
			}
			
		}
		String operateTitle = "";

		if(operateType==1){
			operateTitle = "新增";
		}else{
			operateTitle = "编辑";
			Integer id = Integer.parseInt(request.getParameter("id"));
			CouponInfoPo couponInfoPo = couponInfoFacade.findCouponById(id);
			if(couponInfoPo != null){
				OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(couponInfoPo.getOrgInfoId());
				OrgInfoPo parentOrgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(couponInfoPo.getParentOrgInfoId());
				if(orgInfoPo != null){
					couponInfoPo.setOrgInfoName(orgInfoPo.getOrgDetailInfo().getOrgName());
				}
				if(parentOrgInfoPo != null){
					couponInfoPo.setParentOrgName(parentOrgInfoPo.getOrgDetailInfo().getOrgName());
				}
			}
			model.addAttribute("couponInfoPo",couponInfoPo);
		}
		model.addAttribute("operateTitle", operateTitle);
		
		// 查询该主机构下的所有1级与2级机构信息，按照主键ID正序
//		List<OrgInfoPo> parentOrgInfoList = orgInfoFacade.findRootAndTwoLevelOrgInfo(rootOrgInfoId);
//		model.addAttribute("parentOrgInfoList", parentOrgInfoList);
		
		//获取有价券供应商
		List<CouponSupplierInfoPo> couponSupplierInfoList = couponSupplierInfoFacade.getCouponSupplierInfoByOrgInfoRootId(rootOrgInfoId);
		model.addAttribute("couponSupplierInfoList", couponSupplierInfoList);
		
		//获取有价券类型
		List<CouponTypeInfo> couponTypeInfoList = couponTypeInfoFacade.getCouponTypeInfo();
		model.addAttribute("couponTypeInfoList", couponTypeInfoList);
		
		//获取计量单位
		List<String> unitsList = new ArrayList<String>();
		unitsList.add("张");
		unitsList.add("台");
		unitsList.add("个");
		unitsList.add("匹");
		unitsList.add("片");
		unitsList.add("吨");
		unitsList.add("公斤");
		model.addAttribute("unitsList", unitsList);
		model.addAttribute("userName", userName);
		return "template/coupon/init_coupon_page";
	}
	/**
	 * 新增/编辑有价券
	 * 
	 * @author luojuan 2017年6月12日
	 * @param request
	 * @param couponInfoModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateCoupon", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateCoupon(HttpServletRequest request,CouponInfoModel couponInfoModel){
		JSONObject jo = null;
		//从session中获取主机构ID和所属机构ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgInfoRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		
		try {
			jo = couponInfoFacade.addCouponInfo(couponInfoModel, orgInfoId, orgInfoRootId, userInfoId);
		} catch (Exception e) {
			log.error("有价券信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "有价券信息异常，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * 根据有价券ID更新审核信息
	 * 
	 * @author luojuan 2017年6月14日
	 */
	@RequestMapping(value = "/auditCoupon", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject auditCoupon(HttpServletRequest request){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		
		//获取有价券ID
		List<Integer> couponInfoIdList = new ArrayList<Integer>();
		if(StringUtils.isNotBlank(request.getParameter("couponIds"))){
			String couponInfoIds = request.getParameter("couponIds").trim();
			String[] couponInfoArray = couponInfoIds.split(",");
			if(couponInfoArray.length>0){
				for(String couponIdStr : couponInfoArray){
					if(StringUtils.isNotBlank(couponIdStr)){
						couponInfoIdList.add(Integer.valueOf(couponIdStr.trim()));
					}
				}
			}
		}
		
		//审核状态   2、审核不通过   3、审核通过
		Integer couponStatus = null;
		if (StringUtils.isNotBlank(request.getParameter("couponStatus"))) {
			couponStatus = Integer.valueOf(request.getParameter("couponStatus"));
		}
		//审核信息
		try {
			jo = couponInfoFacade.auditCouponById(couponInfoIdList,couponStatus,userInfoId,orgInfoRootId);
			
		} catch (Exception e) {
			log.error("有价券审核信息有误",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "有价券审核信息异常，请稍后重试");
		}
		System.out.println();
		return jo;
	}
	
	/**
	 * 删除有价券信息
	 * 
	 * @author luojuan 2017年6月15日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/deleteCouponInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteCouponInfo(HttpServletRequest request){
		
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		
		//获取有价券ID
		List<Integer> couponInfoIdList = new ArrayList<Integer>();
		if(StringUtils.isNotBlank(request.getParameter("couponIds"))){
			String couponInfoIds = request.getParameter("couponIds").trim();
			String[] couponInfoArray = couponInfoIds.split(",");
			if(couponInfoArray.length>0){
				for(String couponIdStr : couponInfoArray){
					if(StringUtils.isNotBlank(couponIdStr)){
						couponInfoIdList.add(Integer.valueOf(couponIdStr.trim()));
					}
				}
			}
		}
		try {
			jo = couponInfoFacade.deleteCouponInfoById(couponInfoIdList,rootOrgInfoId, userInfoId);
			
		} catch (Exception e) {
			log.error("有价券信息删除异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "删除有价券信息异常，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * 领用/退还有价券领用信息初始页
	 * 
	 * @author luojuan 2017年6月12日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initCouponUsePage")
	public String initCouponUsePage(HttpServletRequest request, Model model) {
		// 取出操作类型(1:领用 2:退还)
		String operateType1 = request.getParameter("operateType");
		Integer operateType = Integer.parseInt(operateType1);
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		
		String operateTitle = "";

		if(operateType==1){
			operateTitle = "领用";
			Integer id = Integer.parseInt(request.getParameter("id"));
			CouponInfoPo couponInfoPo = couponInfoFacade.findCouponById(id);
			model.addAttribute("couponInfoPo",couponInfoPo);
		}else{
			operateTitle = "退还";
			Integer id = Integer.parseInt(request.getParameter("id"));
			CouponInfoPo couponInfoPo = couponInfoFacade.findCouponById(id);
			model.addAttribute("couponInfoPo",couponInfoPo);
		}
		model.addAttribute("operateTitle", operateTitle);
		model.addAttribute("operateType", operateType);
		
		// 查询该主机构下的所有1级与2级机构信息，按照主键ID正序
		List<OrgInfoPo> parentOrgInfoList = orgInfoFacade.findRootAndTwoLevelOrgInfo(rootOrgInfoId);
		model.addAttribute("parentOrgInfoList", parentOrgInfoList);
		
		//获取有价券供应商
		List<CouponSupplierInfoPo> couponSupplierInfoList = couponSupplierInfoFacade.getCouponSupplierInfoByOrgInfoRootId(rootOrgInfoId);
		model.addAttribute("couponSupplierInfoList", couponSupplierInfoList);
		
		//获取有价券类型
		List<CouponTypeInfo> couponTypeInfoList = couponTypeInfoFacade.getCouponTypeInfo();
		model.addAttribute("couponTypeInfoList", couponTypeInfoList);
				
		return "template/coupon/init_coupon_use_info_page";

		
	}
	
	/**
	 * 领用/编辑有价券领用信息
	 * 
	 * @author luojuan 2017年6月15日
	 * @param request
	 * @param couponInfoModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateCouponUse", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateCouponUse(HttpServletRequest request,CouponInfoModel couponInfoModel){
		JSONObject jo = null;
		//从session中获取主机构ID、所属机构ID和用户ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgInfoRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		
		//获取操作类型
		 Integer operateType = Integer.parseInt(request.getParameter("operateType")) ;
		try {
			//向后台保存领用信息
			jo = couponInfoFacade.updateCouponInfoAndAddCouponUseInfo(couponInfoModel,orgInfoRootId, orgInfoId, userInfoId,operateType);
		} catch (Exception e) {
			log.error("有价券领用信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "有价券领用信息异常，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * 批量领用初始化界面
	 * @author jiangweiwei 2017年10月14日
	 */
	@RequestMapping("/batchCouponUseInfoPage")
	public String batchCouponUseInfoPage (HttpServletRequest request, Model model){
		//从session中获取主机构ID、所属机构ID和用户ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer enterpriseUserType = userInfo.getEnterpriseUserType();
		//根据登录用户组织机构ID查询组织机构名称
		OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(orgInfoId);
		String orgInfoName = "";
		if(orgInfoPo != null){
			orgInfoName = orgInfoPo.getOrgDetailInfo().getOrgName();
		}
		//根据登录用户ID查询企业用户名称
//		EnterpriseUserInfo enterpriseUserInfo = enterpriseUserInfoFacade.getEnterpriseUserInfoByUserInfoId(userInfoId);
//		String useUser = "";
//		if(enterpriseUserInfo != null){
//			if(enterpriseUserType == 1){
//				useUser = orgInfoName;
//			}else{
//				useUser = enterpriseUserInfo.getRealName();
//			}
//		}
//		model.addAttribute("useUser", useUser);
		model.addAttribute("orgInfoName", orgInfoName);
		model.addAttribute("orgInfoId", orgInfoId);
		return "template/coupon/batch_coupon_use_info_page";
	}
	
	/**
	 * 根据有价券卡号和主机构ID查询有价券信息
	 * @author jiangweiwei 2017年10月14日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/searchCouponCard", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject searchCouponCard(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		//从session中获取主机构ID、所属机构ID和用户ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer orgInfoRootId = userInfo.getOrgRootId();
		//开始卡号
		String cardCodeStart = null;
		if(request.getParameter("cardCodeStart") != null){
			cardCodeStart = request.getParameter("cardCodeStart");
		}
		//结束卡号
		String cardCodeEnd = null;
		if(request.getParameter("cardCodeEnd") != null){
			cardCodeEnd = request.getParameter("cardCodeEnd");
		}
		//封装查询条件
		Map<String,Object> params = new HashMap<String,Object>();
		params.put("orgInfoRootId", orgInfoRootId);
		params.put("cardCodeStart", cardCodeStart);
		params.put("cardCodeEnd", cardCodeEnd);
		CouponInfoPo couponInfoPo = new CouponInfoPo();
		Integer cardNum = 0;
		if(!"".equals(cardCodeStart) && !"".equals(cardCodeEnd)){
			//根据有价券卡号和主机构ID查询有价券信息
			couponInfoPo = couponInfoFacade.getCouponInfoByMap(params);
			//根据有价券卡号和主机构ID查询有价券卡数
			cardNum = couponInfoFacade.countCouponInfoByMap(params);
		}
		BigDecimal useMoney = new BigDecimal(0);
		if(couponInfoPo != null){
			useMoney = couponInfoPo.getAmount();
		}
		jo.put("useMoney", useMoney);
		jo.put("cardNum", cardNum);
		return jo;
	}
	
	/**
	 * 领用/编辑有价券领用信息（批量）
	 * @author jiangweiwei 2017年10月14日
	 * @param request
	 * @param couponInfoModel
	 * @return
	 */
	@RequestMapping(value = "/batchCouponUseInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject batchCouponUseInfo(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		//从session中获取主机构ID、所属机构ID和用户ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgInfoRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		//开始卡号
		String cardCodeStart = null;
		if(request.getParameter("cardCodeStart") != null){
			cardCodeStart = request.getParameter("cardCodeStart");
		}
		//结束卡号
		String cardCodeEnd = null;
		if(request.getParameter("cardCodeEnd") != null){
			cardCodeEnd = request.getParameter("cardCodeEnd");
		}
		//封装参数
		Map<String,Object> params = new HashMap<String,Object>();
		params.put("orgInfoRootId", orgInfoRootId);
		params.put("cardCodeStart", cardCodeStart);
		params.put("cardCodeEnd", cardCodeEnd);
		List<CouponInfoPo> couponList = couponInfoFacade.findCouponInfoByMap(params);
		if(CollectionUtils.isNotEmpty(couponList)){
			Integer couponNum = 0;
			for(CouponInfoPo couponInfoPo:couponList){
				if(couponInfoPo.getAmount() != null && couponInfoPo.getAmount().compareTo(BigDecimal.ZERO) == 0){
					couponNum++;
				}
			}
			jo.put("msg", "本次总共领用"+couponList.size()+"张有价券卡，其中"+couponNum+"张已领用或面值为0，请确认是否继续领用！");
			jo.put("success", true);
		}else{
			jo.put("msg", "有价券卡不存在或未审核通过，请确认！");
			jo.put("success", false);
		}
		return jo;
	}
	
	/**
	 * 领用/编辑有价券领用信息（批量）
	 * @author jiangweiwei 2017年10月14日
	 * @param request
	 * @param couponInfoModel
	 * @return
	 */
	@RequestMapping(value = "/batchAddCouponUseInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject batchAddCouponUseInfo(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		//从session中获取主机构ID、所属机构ID和用户ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer orgInfoRootId = userInfo.getOrgRootId();
		//开始卡号
		String cardCodeStart = null;
		if(request.getParameter("cardCodeStart") != null){
			cardCodeStart = request.getParameter("cardCodeStart");
		}
		//结束卡号
		String cardCodeEnd = null;
		if(request.getParameter("cardCodeEnd") != null){
			cardCodeEnd = request.getParameter("cardCodeEnd");
		}
		//组织机构ID
		Integer couponOrgInfoId = null;
		if(request.getParameter("orgInfoId") != null){
			couponOrgInfoId = Integer.valueOf(request.getParameter("orgInfoId"));
		}
		//上级组织机构ID
		Integer orgParentId = null;
		if(request.getParameter("orgParentId") != null){
			orgParentId = Integer.valueOf(request.getParameter("orgParentId"));
		}
		//领用人
		String useUser = null;
		if(request.getParameter("useUser") != null){
			useUser = request.getParameter("useUser");
		}
		//领用时间
		Date useTime = null;
		if(request.getParameter("useTime") != null){
			useTime = DateUtils.formatDate(request.getParameter("useTime"));
		}
		//封装参数
		Map<String,Object> params = new HashMap<String,Object>();
		params.put("orgInfoRootId", orgInfoRootId);
		params.put("cardCodeStart", cardCodeStart);
		params.put("cardCodeEnd", cardCodeEnd);
		List<CouponInfoPo> couponList = couponInfoFacade.findCouponInfoByMap(params);
		if(CollectionUtils.isNotEmpty(couponList)){
			List<CouponInfoPo> couponInfoList = new ArrayList<CouponInfoPo>();
			List<CouponUseInfo> couponUseInfoList = new ArrayList<CouponUseInfo>();
			BigDecimal value = new BigDecimal(0);
			for(CouponInfoPo couponInfoPo:couponList){
				CouponUseInfo couponUseInfo = new CouponUseInfo();
				if(couponInfoPo.getAmount() != null && couponInfoPo.getAmount().compareTo(BigDecimal.ZERO) != 0){
					if(orgInfoRootId.equals(couponInfoPo.getOrgInfoRootId())){
						couponUseInfo.setCouponInfoId(couponInfoPo.getId());
						couponUseInfo.setCardCode(couponInfoPo.getCardCode());
						couponUseInfo.setOrgInfoId(orgInfoId);
						couponUseInfo.setCouponOrgInfoId(couponOrgInfoId);
						couponUseInfo.setParentOrgInfoId(orgParentId);
						couponUseInfo.setMoney(couponInfoPo.getAmount());
						couponUseInfo.setBalance(couponInfoPo.getAmount());
						couponUseInfo.setUserName(useUser);
						couponUseInfo.setUseTime(useTime);
						couponUseInfo.setCreateUser(userInfoId);
						couponUseInfo.setCreateTime(Calendar.getInstance().getTime());
						couponInfoPo.setAmount(value);
						couponInfoPo.setUpdateUser(userInfoId);
						couponInfoPo.setUpdateTime(Calendar.getInstance().getTime());
						// couponInfoPo 添加 领用金额、余额、领用时间、领用人
						couponInfoPo.setReceiveMoney(couponInfoPo.getAmount());
						couponInfoPo.setCouponBalance(couponInfoPo.getAmount());
						couponInfoPo.setReceiveTime(useTime);
						couponInfoPo.setReceiveUser(useUser);
					}
					couponInfoList.add(couponInfoPo);
					couponUseInfoList.add(couponUseInfo);
				}
			}
			if(CollectionUtils.isNotEmpty(couponUseInfoList) && CollectionUtils.isNotEmpty(couponInfoList)){
				try{
					couponUseInfoFacade.batchAddCouponUseInfo(couponUseInfoList);
					couponInfoFacade.updateCouponInfoByList(couponInfoList);
					jo.put("success", true);
					jo.put("msg", "有价券领用成功！");
				}catch(Exception e){
					log.error("领用有价券信息异常", e);
					jo = new JSONObject();
					jo.put("success", false);
					jo.put("msg", "有价券领用服务异常，请稍后重试");
				}
			}else{
				jo = new JSONObject();
				jo.put("success", false);
				jo.put("msg", "本次领用有价券金额为0，不可重复领用，请重新填写需要领用的有价券卡号");
			}
		}
		return jo;
	}
	
	/**
	 * 有价券查询结算单初始页面
	 * @author jiangweiwei 2017年10月23日
	 */
	@RequestMapping("/initCouponSettlementInfoPage")
	public String initCouponSettlementInfoPage (HttpServletRequest request, Model model){
		// 获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 有价券编号
		Integer couponInfoId = null;
		if (params.get("couponInfoId") != null) {
			couponInfoId = Integer.valueOf(params.get("couponInfoId").toString());
		}
		model.addAttribute("couponInfoId", couponInfoId);
		return "template/coupon/coupon_show_settlement_info_page";
	}
	
	/**
	 * 有价券查询结算单信息
	 * @author jiangweiwei
	 * @date 2017年10月23日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/listCouponSettlementInfo")
	public String listCouponSettlementInfo(HttpServletRequest request, Model model) {
		DataPager<SettlementCouponUse> settlementCouponUsePager = new DataPager<SettlementCouponUse>();
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer totalNum = 0;
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		settlementCouponUsePager.setPage(page);
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		settlementCouponUsePager.setSize(rows);
		// 有价券编号
		Integer couponInfoId = null;
		if (params.get("couponInfoId") != null) {
			couponInfoId = Integer.valueOf(params.get("couponInfoId").toString());
		}
		// 结算单号
		String settlementId = null;
		if (params.get("settlementId") != null) {
			settlementId = params.get("settlementId").toString();
		}
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("couponInfoId", couponInfoId);
		queryMap.put("settlementId", settlementId);
		//根据登录用户主机构ID、有价券编号、结算单号和分页查询结算有价券使用表信息
		List<SettlementCouponUse> settlementCouponUseList = settlementCouponUseFacade.findSettlementCouponUsePage(queryMap);
		//根据登录用户主机构ID、有价券编号和结算单号查询结算有价券使用表信息条目数
		totalNum = settlementCouponUseFacade.countSettlementCouponUsePage(queryMap);
		// 6、总数、分页信息封装
		settlementCouponUsePager.setTotal(totalNum);
		settlementCouponUsePager.setRows(settlementCouponUseList);
		model.addAttribute("settlementCouponUsePager", settlementCouponUsePager);
		return "template/coupon/coupon_settlement_info_data";
	}
	
	/** 
	* @方法名: calculationNumber 
	* @作者: zhangshuai
	* @时间: 2017年11月4日 下午5:44:30
	* @返回值类型: Integer 
	* @throws 
	* 计算数量
	*/
	@RequestMapping(value="/calculationNumber")
	@ResponseBody
	public long	calculationNumber(HttpServletRequest request,HttpServletResponse response){
		
		//接受参数
		long codeStart=0;//起始卡号
		if(StringUtils.isNotBlank(request.getParameter("cardCodeStart"))){
			codeStart=Long.parseLong(request.getParameter("cardCodeStart"));
		}
		long codeEnd=0;//结束卡号
		if(StringUtils.isNotBlank(request.getParameter("cardCodeEnd"))){
			codeEnd=Long.parseLong(request.getParameter("cardCodeEnd"));
		}
		
		return (codeEnd-codeStart);
		
	}
	
	/** 
	* @方法名: findCouponMationByIds 
	* @作者: zhangshuai
	* @时间: 2017年11月6日 下午7:15:30
	* @返回值类型: JSONObject 
	* @throws 
	* 有价券退还前查询选择的有价券信息
	*/
	@RequestMapping(value="/findCouponMationByIds")
	@ResponseBody
	public JSONObject findCouponMationByIds(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		List<Integer> couponIds=new ArrayList<Integer>();
		if(StringUtils.isNotBlank(request.getParameter("ids"))){
			String[] couponArray=request.getParameter("ids").split(",");
			if(couponArray.length>0){
				for (String id : couponArray) {
					couponIds.add(Integer.parseInt(id));
				}
			}
		}
		
		Set<BigDecimal> amountSet=new HashSet<BigDecimal>();
		Set<Integer> orgRootSet=new HashSet<Integer>();
		Set<Integer> orgInfoSet=new HashSet<Integer>();
		Set<String> purchaseSet=new HashSet<String>();
		Set<Integer> sumSet=new HashSet<Integer>();
		/*List<CouponInfoPo> couponInfoPos=couponInfoFacade.findCouponMationByIds(couponIds);*/
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("couponIds", couponIds);
		List<CouponUseInfo> couponUserInfoPos=couponUseInfoFacade.findCouponUseInfoByCouponInfoIds(params);
		
		if(couponUserInfoPos.size()<1){
			jo.put("success", false);
			jo.put("msg", "您选择的有价券无领用信息!");
			jo.put("type", "1");
			return jo;
		}
		
		//判断是批量还是单条退还
		if(couponIds.size()>1){
			
			//批量退还判断选择的数据是否为同一面值、同一主机构、同一组织机构、同一领用人
			
			if(CollectionUtils.isNotEmpty(couponUserInfoPos)){
				for (CouponUseInfo couponUserInfoPo : couponUserInfoPos) {
					amountSet.add(couponUserInfoPo.getAmount());
					orgRootSet.add(couponUserInfoPo.getParentOrgInfoId());
					orgInfoSet.add(couponUserInfoPo.getOrgInfoId());
					purchaseSet.add(couponUserInfoPo.getUserName());
					
					if(couponUserInfoPo.getMoney().compareTo(couponUserInfoPo.getBalance())==0){
						sumSet.add(0);
					}else if(couponUserInfoPo.getMoney().compareTo(couponUserInfoPo.getBalance())==1
							){
						sumSet.add(1);
					}
					
				}
			}
			
			//判断是否为同一面值
			if(amountSet.size()>1){
				jo.put("success", false);
				jo.put("msg", "请选择同一面值的有价券");
				jo.put("type", "1");
				return jo;
			}
			
			//判断是否为同一组织机构
			if(orgInfoSet.size()>1){
				jo.put("success", false);
				jo.put("msg", "请选择同一组织机构的有价券");
				jo.put("type", "1");
				return jo;
			}
			
			//判断是否为同一主机构
			if(orgRootSet.size()>1){
				jo.put("success", false);
				jo.put("msg", "请选择同一上级组织的有价券");
				jo.put("type", "1");
				return jo;
			}
			
			//判断是否为同一主机构
			if(purchaseSet.size()>1){
				jo.put("success", false);
				jo.put("msg", "请选择同一领用人的有价券");
				jo.put("type", "1");
				return jo;
			}
			
			//判断所选择的有价券是否已经被使用过
			if(sumSet.size()>1){
				jo.put("success", false);
				jo.put("msg", "您选择的有价券有已经被使用过的，是否继续退还!");
				jo.put("type", "2");
				return jo;
			}
			
			//判断选择的是否全部都已经被使用
			if(sumSet.contains(1)){
				jo.put("success", false);
				jo.put("msg", "您选择的有价券有已经被使用过无法退还!");
				jo.put("type", "1");
				return jo;
			}
			
		}else{
			
			//判断有价券是否被使用
			if(CollectionUtils.isNotEmpty(couponUserInfoPos)){
				for (CouponUseInfo couponUserInfoPo : couponUserInfoPos) {
					if(couponUserInfoPo.getMoney().compareTo(couponUserInfoPo.getBalance())==1
							|| couponUserInfoPo.getMoney().compareTo(couponUserInfoPo.getBalance())==-1
							){
							jo.put("success", false);
							jo.put("msg", "该有价券已被使用，无法退还!");
							jo.put("type", "1");
							return jo;
					}
				}
			}else{
				jo.put("success", false);
				jo.put("msg", "该有价券无领用记录!");
				jo.put("type", "1");
				return jo;
			}
			
		}
		jo.put("success", true);
		return jo;
	}
	
	/** 
	* @方法名: returnCouponPage 
	* @作者: zhangshuai
	* @时间: 2017年11月6日 下午8:07:55
	* @返回值类型: String 
	* @throws 
	* 有价券退还页面
	*/
	@RequestMapping(value="/returnCouponPage")
	public String returnCouponPage(HttpServletRequest request,HttpServletResponse response,Model model){
		
		//从session中获取信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		String userName="";
		//判断根据角色
		if(userInfo.getUserRole()==2 || userInfo.getUserRole()==1){
			
			List<Integer> orgIds=new ArrayList<Integer>();
			orgIds.add(userInfo.getOrgInfoId());
			
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					userName=orgInfoPo.getOrgName();
				}
			}
			
		}else if(userInfo.getUserRole()==3){
			
			IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerByUserInfoId(userInfo.getId());
			
			if(individualOwnerPo!=null){
				userName=individualOwnerPo.getRealName();
			}
			
		}else if(userInfo.getUserRole()==4){
			List<Integer> userInfoIds=new ArrayList<Integer>();
			userInfoIds.add(userInfo.getId());
			List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
			
			if(CollectionUtils.isNotEmpty(driverInfos)){
				for (DriverInfo driverInfo : driverInfos) {
					userName=driverInfo.getDriverName();
				}
			}
			
		}
		
		List<Integer> couponIds=new ArrayList<Integer>();
		if(StringUtils.isNotBlank(request.getParameter("ids"))){
			String[] couponArray=request.getParameter("ids").split(",");
			if(couponArray.length>1){
				for (String id : couponArray) {
					couponIds.add(Integer.parseInt(id));
				}
			}
		}
		List<Integer> couIds=new ArrayList<Integer>();
		//根据选择的有价券id批量查询有价券领用信息，取出领用金额=余额的有价券id
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("couponIds", couponIds);
		params.put("type", 1);
		List<CouponUseInfo> couponUserInfoPos=couponUseInfoFacade.findCouponUseInfoByCouponInfoIds(params);
		
		if(CollectionUtils.isNotEmpty(couponUserInfoPos)){
			for (CouponUseInfo couponUseInfo : couponUserInfoPos) {
				couIds.add(couponUseInfo.getCouponInfoId());
			}
		}
		
		BigDecimal amountSum=BigDecimal.ZERO;//面值总和
		Integer cardNum=0;//数量总和
		BigDecimal totalMoney=BigDecimal.ZERO;//合计金额
		Set<Integer> orgInfoSet=new HashSet<Integer>();
		
		Set<Integer> parentOrgInfoSet=new HashSet<Integer>();
		
		//根据取出的有价券id批量查询有价券信息
		Map<String, Object> parmas=new HashMap<String,Object>();
		parmas.put("couIds", couIds);
		List<CouponInfoPo> couponInfoPos= couponInfoFacade.findCouponInfoByCouponIds(parmas);
		
		/*List<Integer> orgInfoIds=CommonUtils.getValueList(couponInfoPos, "orgInfoId");
		Map<Integer, String> orgInfoMap=null;
		if(CollectionUtils.isNotEmpty(orgInfoIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				orgInfoMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		
		List<Integer> parentOrgInfoIds=CommonUtils.getValueList(couponInfoPos, "parentOrgInfoId");
		Map<Integer, String> parentOrgInfoMap=null;
		if(CollectionUtils.isNotEmpty(parentOrgInfoIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(parentOrgInfoIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				parentOrgInfoMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}*/
		String ids="";
		if(CollectionUtils.isNotEmpty(couponInfoPos)){
			for (CouponInfoPo couponInfoPo : couponInfoPos) {
				amountSum=amountSum.add(couponInfoPo.getAmount());
				cardNum=cardNum+couponInfoPo.getCardNum();
				
				orgInfoSet.add(couponInfoPo.getOrgInfoId());
				parentOrgInfoSet.add(couponInfoPo.getParentOrgInfoId());
				ids+=couponInfoPo.getId()+",";
				/*if(MapUtils.isNotEmpty(orgInfoMap)&&orgInfoMap.get(couponInfoPo.getOrgInfoId())!=null){
					couponInfoPo.setOrgInfoName(orgInfoMap.get(couponInfoPo.getOrgInfoId()));
				}
				
				if(MapUtils.isNotEmpty(parentOrgInfoMap)&&parentOrgInfoMap.get(couponInfoPo.getParentOrgInfoId())!=null){
					couponInfoPo.setParentOrgName(parentOrgInfoMap.get(couponInfoPo.getParentOrgInfoId()));
				}*/
				
			}
		}
		CouponInfoPo couponInfoPo=new CouponInfoPo();
		for (Integer orgInfo : orgInfoSet) {
			List<Integer> orgInfoIds=new ArrayList<Integer>();
			orgInfoIds.add(orgInfo);
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					couponInfoPo.setOrgInfoName(orgInfoPo.getOrgName());
					couponInfoPo.setOrgInfoId(orgInfoPo.getId());
				}
			}
			
		} 
		
		for (Integer parentOrgInfo : parentOrgInfoSet) {
			List<Integer> orgInfoIds=new ArrayList<Integer>();
			orgInfoIds.add(parentOrgInfo);
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					couponInfoPo.setParentOrgName(orgInfoPo.getOrgName());
					couponInfoPo.setParentOrgInfoId(orgInfoPo.getId());
				}
			}
		}
		
		totalMoney=amountSum.multiply(new BigDecimal(cardNum));
		couponInfoPo.setBackTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(Calendar.getInstance().getTime()));
		couponInfoPo.setIds(ids.substring(0, ids.length()-1));
		couponInfoPo.setTotalMoney(totalMoney);
		couponInfoPo.setCardNum(cardNum);
		couponInfoPo.setAmount(amountSum);
		couponInfoPo.setReceiveUser(userName);
		model.addAttribute("couponInfoPo", couponInfoPo);
		return "template/coupon/back_coupon_model";
	}
	
	
	/** 
	* @方法名: returnCouponMation 
	* @作者: zhangshuai
	* @时间: 2017年11月7日 下午4:57:58
	* @返回值类型: JSONObject 
	* @throws 
	* 有价券退卡
	*/
	@RequestMapping(value="/returnCouponMation")
	@ResponseBody
	public JSONObject returnCouponMation(HttpServletRequest request,HttpServletResponse response){
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		JSONObject jo=new JSONObject();
		
		List<Integer> couponIds=new ArrayList<Integer>();
		if(StringUtils.isNotBlank(request.getParameter("couponIds"))){
			String[] couponArray=request.getParameter("couponIds").split(",");
			if(couponArray.length>0){
				for (String id : couponArray) {
					couponIds.add(Integer.parseInt(id));
				}
			}
		}
		
		Integer orgInfoId=Integer.parseInt(request.getParameter("orgInfoId"));
		Integer parentOrgInfoId=Integer.parseInt(request.getParameter("parentOrgInfoId"));
		String backUser=request.getParameter("backUser");
		String backTime=request.getParameter("backTime");
		
		jo=couponRebackInfoFacade.addCouponRebackInfo(couponIds,orgInfoId,parentOrgInfoId,backUser,backTime,userInfo);
		
		return jo;
		
	}
	
}
