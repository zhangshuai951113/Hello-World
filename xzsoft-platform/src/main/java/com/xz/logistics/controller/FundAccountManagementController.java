package com.xz.logistics.controller;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.poi.POIExcelUtil;
import com.xz.facade.api.BiddingFrozenInfoFacade;
import com.xz.facade.api.CapitalAccountFlowInfoFacade;
import com.xz.facade.api.CouponSupplierInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.RechargeOrWithdrawalsInfoPoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.facade.api.WaybillFrozenInfoFacade;
import com.xz.logistics.controller.BaseController;
import com.xz.logistics.utils.CodeAutoGenerater;
import com.xz.model.po.BiddingFrozenInfoPo;
import com.xz.model.po.CapitalAccountFlowInfoPo;
import com.xz.model.po.CouponSupplierInfoPo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.LocationInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.RechargeOrWithdrawalsInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillFrozenInfoPo;

/** 
* @author zhangshuai 
* @version 创建时间：2017年9月25日 下午12:47:48 
* 类说明   资金账户管理controller
*/
@Controller
@RequestMapping("/fundAccountManagement")
public class FundAccountManagementController extends BaseController{

	@Resource
	private RechargeOrWithdrawalsInfoPoFacade rechargeOrWithdrawalsInfoPoFacade;
	@Resource
	private BiddingFrozenInfoFacade biddingFrozenInfoFacade;
	@Resource
	private WaybillFrozenInfoFacade waybillFrozenInfoFacade;
	@Resource
	private CapitalAccountFlowInfoFacade capitalAccountFlowInfoFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private CouponSupplierInfoFacade couponSupplierInfoFacade;
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
	@Resource
	private LineInfoFacade lineInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private LocationInfoFacade locationInfoFacade;

	/** 
	* @方法名: goRootFundAccountManagement 
	* @作者: zhangshuai
	* @时间: 2017年9月25日 下午12:50:36
	* @返回值类型: String 
	* @throws 
	* 进入资金账户管理主页面
	*/
	@RequestMapping("/goRootFundAccountManagementPage")
	public String goRootFundAccountManagementPage(HttpServletRequest request,HttpServletResponse response,Model model){
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		String userName=userInfo.getUserName();
		String userRoleStr="";
		if(userInfo.getUserRole()==1){
			userRoleStr="企业货主";
		}else if(userInfo.getUserRole()==2){
			userRoleStr="物流公司";
		}else if(userInfo.getUserRole()==3){
			userRoleStr="个体货主";
		}else if(userInfo.getUserRole()==4){
			userRoleStr="司机";
		}
		
		BigDecimal accountAmount=BigDecimal.ZERO;//账户充值总余额
		BigDecimal withdrawalsMoney=BigDecimal.ZERO;//账户提现总额
		BigDecimal kyAccountAmount=BigDecimal.ZERO;//账户金额
		BigDecimal coverFreezingAmount=BigDecimal.ZERO;//账户被冻结金额
		BigDecimal freezingAmount=BigDecimal.ZERO;//账户冻结金额
		BigDecimal availableAmount=BigDecimal.ZERO;//账户可用余额
		
		//根据登录用户查询充值/提现表，取出账户充值总余额字段
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("id", userInfo.getId());
		params.put("paymentType", 1);
		List<RechargeOrWithdrawalsInfoPo> rechargeOrWithdrawalsInfos=rechargeOrWithdrawalsInfoPoFacade.findAccountAmountByUserInfoId(params);
		if(CollectionUtils.isNotEmpty(rechargeOrWithdrawalsInfos)){
			for (RechargeOrWithdrawalsInfoPo rechargeOrWithdrawalsInfoPo : rechargeOrWithdrawalsInfos) {
				accountAmount=accountAmount.add(rechargeOrWithdrawalsInfoPo.getThisAmount());
			}
		}
		
		//根据登录用户查询充值/提现表，取出账户提现总余额字段
		Map<String, Object> map=new HashMap<String,Object>();
		map.put("id", userInfo.getId());
		map.put("paymentType", 2);
		List<RechargeOrWithdrawalsInfoPo> rechargeOrWithdrawalsInfoList=rechargeOrWithdrawalsInfoPoFacade.findAccountAmountByUserInfoId(map);
		if(CollectionUtils.isNotEmpty(rechargeOrWithdrawalsInfoList)){
			for (RechargeOrWithdrawalsInfoPo rechargeOrWithdrawalsInfo : rechargeOrWithdrawalsInfoList) {
				withdrawalsMoney=withdrawalsMoney.add(rechargeOrWithdrawalsInfo.getThisAmount());
			}
		}
		
		/**            被别人冻结                        */
		//查询运单和招标被冻结金额信息
		//物流公司 (查询招标信息)
		if(userInfo.getUserRole()==2){
			
			//根据主机构id，组织机构id查询招标报价方的中标金额(被冻结  未解冻)
			Map<String, Object> paramsMap=new HashMap<String,Object>();
			paramsMap.put("offerOrgRootId", userInfo.getOrgRootId());//报价方主机构
			paramsMap.put("offerOrgInfoId", userInfo.getOrgInfoId());//报价方组织机构
			paramsMap.put("frozenType", 2);//被冻结状态
			paramsMap.put("isFrozen", 2);//未解冻
			
			List<BiddingFrozenInfoPo> biddingFrozenInfoPos=biddingFrozenInfoFacade.getFindCautionMoneyByOfferRootAndInfo(paramsMap);
			if(CollectionUtils.isNotEmpty(biddingFrozenInfoPos)){
				for (BiddingFrozenInfoPo biddingFrozenInfoPo : biddingFrozenInfoPos) {
					coverFreezingAmount=coverFreezingAmount.add(biddingFrozenInfoPo.getCautionMoney());
				}
			}
			
			//根据主机构id，组织机构id查询运单报价方的中标金额(被冻结  未解冻)
			Map<String, Object> paramsS=new HashMap<String,Object>();
			paramsS.put("userRole", userInfo.getUserRole());//登录角色
			paramsS.put("orgRootId", userInfo.getOrgRootId());//主机构
			paramsS.put("orgInfoId", userInfo.getOrgInfoId());//组织机构
			paramsS.put("frozenType", 2);//被冻结状态
			paramsS.put("isFrozen", 2);//未解冻
			
			List<WaybillFrozenInfoPo> waybillFrozenInfoPos=waybillFrozenInfoFacade.findCautionMoneyByUserRoleAndRootAndInfo(paramsS);
			if(CollectionUtils.isNotEmpty(waybillFrozenInfoPos)){
				for (WaybillFrozenInfoPo waybillFrozenInfoPo : waybillFrozenInfoPos) {
					coverFreezingAmount=coverFreezingAmount.add(waybillFrozenInfoPo.getCautionMoney());
				}
			}
		}else 
			//物流公司or司机(查询运单)
			if(userInfo.getUserRole()==4){
			
				//根据主机构id，组织机构id查询招标报价方的中标金额(被冻结  未解冻)
				Map<String, Object> paramsMap=new HashMap<String,Object>();
				paramsMap.put("userRole", userInfo.getUserRole());//登录角色
				paramsMap.put("orgRootId", userInfo.getId());//主机构
				paramsMap.put("orgInfoId", userInfo.getId());//组织机构
				paramsMap.put("frozenType", 2);//被冻结状态
				paramsMap.put("isFrozen", 2);//未解冻
				
				List<WaybillFrozenInfoPo> waybillFrozenInfoPos=waybillFrozenInfoFacade.findCautionMoneyByUserRoleAndRootAndInfo(paramsMap);
				if(CollectionUtils.isNotEmpty(waybillFrozenInfoPos)){
					for (WaybillFrozenInfoPo waybillFrozenInfoPo : waybillFrozenInfoPos) {
						coverFreezingAmount=coverFreezingAmount.add(waybillFrozenInfoPo.getCautionMoney());
					}
				}
		}
		
		/**          我冻结别人的             */
		//物流公司 or 企业货主(查询招标信息)
		if(userInfo.getUserRole()==2 || userInfo.getUserRole()==1 ){
			
			//根据主机构id，组织机构id查询招标报价方的中标金额(被冻结  未解冻)
			Map<String, Object> paramsMap=new HashMap<String,Object>();
			paramsMap.put("biddingOrgRootId", userInfo.getOrgRootId());//招标方主机构
			/*paramsMap.put("biddingOrgInfoId", userInfo.getOrgInfoId());//招标方组织机构
*/			paramsMap.put("frozenType", 1);//冻结状态
			paramsMap.put("isFrozen", 2);//未解冻
			
			List<BiddingFrozenInfoPo> biddingFrozenInfoPos=biddingFrozenInfoFacade.getFindCautionMoneyByOfferRootAndInfo(paramsMap);
			if(CollectionUtils.isNotEmpty(biddingFrozenInfoPos)){
				for (BiddingFrozenInfoPo biddingFrozenInfoPo : biddingFrozenInfoPos) {
					freezingAmount=freezingAmount.add(biddingFrozenInfoPo.getCautionMoney());
				}
			}
		}
		
		//物流公司  or 企业货主  or 个体货主 (查询运单信息)
		if(userInfo.getUserRole()==2 || userInfo.getUserRole()==1 || userInfo.getUserRole()==3){
			Integer orgRootId=null;
			Integer orgInfoId=null;
			if(userInfo.getUserRole()==1 || userInfo.getUserRole()==2){
				orgRootId=userInfo.getOrgRootId();
				orgInfoId=userInfo.getOrgInfoId();
			}else if(userInfo.getUserRole()==3){
				orgRootId=userInfo.getId();
				orgInfoId=userInfo.getId();
			}
			//根据主机构id，组织机构id查询招标报价方的中标金额(被冻结  未解冻)
			Map<String, Object> paramsMap=new HashMap<String,Object>();
			paramsMap.put("userRole", userInfo.getUserRole());//登录角色
			paramsMap.put("orgRootId", orgRootId);//报价方主机构
			paramsMap.put("orgInfoId", orgInfoId);//报价方组织机构
			paramsMap.put("entrust", orgInfoId);//委托方
			paramsMap.put("frozenType", 1);//冻结状态
			paramsMap.put("isFrozen", 2);//未解冻
			
			List<WaybillFrozenInfoPo> waybillFrozenInfoPos=waybillFrozenInfoFacade.findCautionMoneyByUserRoleAndRootAndInfo(paramsMap);
			if(CollectionUtils.isNotEmpty(waybillFrozenInfoPos)){
				for (WaybillFrozenInfoPo waybillFrozenInfoPo : waybillFrozenInfoPos) {
					freezingAmount=freezingAmount.add(waybillFrozenInfoPo.getCautionMoney());
				}
			}
		}
		
		//账户金额(充值总额-提现总额+运单收款+运单付款)
		kyAccountAmount=accountAmount.subtract(withdrawalsMoney);
		//可用金额(账户金额-被冻结金额)
		availableAmount=kyAccountAmount.subtract(coverFreezingAmount);
		//availableAmount=accountAmount.subtract(withdrawalsMoney).subtract(coverFreezingAmount);
		
		RechargeOrWithdrawalsInfoPo rechargeOrWithdrawalsInfoPo=new RechargeOrWithdrawalsInfoPo();
		
		rechargeOrWithdrawalsInfoPo.setAccountAmount(kyAccountAmount);//账户金额
		rechargeOrWithdrawalsInfoPo.setCoverFreezingAmount(coverFreezingAmount);//被冻结金额
		rechargeOrWithdrawalsInfoPo.setFreezingAmount(freezingAmount);//冻结金额
		rechargeOrWithdrawalsInfoPo.setAvailableAmount(availableAmount);//可用金额
		rechargeOrWithdrawalsInfoPo.setUserName(userName);//用户名
		rechargeOrWithdrawalsInfoPo.setUserRoleStr(userRoleStr);//用户信息
		
		model.addAttribute("rechargeOrWithdrawalsInfoPo", rechargeOrWithdrawalsInfoPo);
		
		return "template/fundAccountManagement/root_fund_account_management_page";
	}
	
	/** 
	* @方法名: findCapitalAccountFlowInfo 
	* @作者: zhangshuai
	* @时间: 2017年9月28日 下午1:36:11
	* @返回值类型: List<CapitalAccountFlowInfoPo> 
	* @throws 
	*   资金账户流水信息全查
	*/
	@RequestMapping(value="/findCapitalAccountFlowInfo")
	@ResponseBody
	public List<CapitalAccountFlowInfoPo> findCapitalAccountFlowInfo(HttpServletRequest request,HttpServletResponse response){
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		Integer uOrgRootId=null;
		Integer uOrgInfoId=null;
		Integer uUserRole=userInfo.getUserRole();
		//物流公司/企业货主
		if(userInfo.getUserRole()==1 || userInfo.getUserRole()==2){
			uOrgRootId=userInfo.getOrgRootId();
			uOrgInfoId=userInfo.getOrgInfoId();
		}else 
			//个体货主/司机
			if(userInfo.getUserRole()==3 || userInfo.getUserRole()==4){
				uOrgRootId=userInfo.getId();
				uOrgInfoId=userInfo.getId();
		}
		
		//接受页面参数
		String balanceOfPaymentsType=request.getParameter("balanceOfPaymentsType");
		String transactionStartDate=request.getParameter("transactionStartDate");
		String transactionEndDate=request.getParameter("transactionEndDate");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("userRole", uUserRole);//角色信息
		params.put("orgRootId", uOrgRootId);//角色信息
		params.put("orgInfoId", uOrgInfoId);//角色信息
		params.put("balanceOfPaymentsType", balanceOfPaymentsType);
		params.put("transactionStartDate", transactionStartDate);
		params.put("transactionEndDate", transactionEndDate);
		params.put("rows", rows);
		params.put("start", start);
		
		List<CapitalAccountFlowInfoPo> capitalAccountFlowInfoPos=capitalAccountFlowInfoFacade.findCapitalAccountFlowInfo(params);
		
		/*//封装付款单位信息
		List<Integer> orgIds=CommonUtils.getValueList(capitalAccountFlowInfoPos, "paymentCompany");
		//key：id  value：机构名称
		Map<Integer, String> orgMap=null;
		if(CollectionUtils.isNotEmpty(orgIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				orgMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}*/
		
		//封装有价券供应商
		List<Integer> couIds=CommonUtils.getValueList(capitalAccountFlowInfoPos, "couponSupplierInfoId");
		//key：id   value：供应商名称
		Map<Integer, String> couMap=null;
		if(CollectionUtils.isNotEmpty(couIds)){
			List<CouponSupplierInfoPo> couponSupplierInfoPos = couponSupplierInfoFacade.findCouponSupplierByIds(couIds);
			if(CollectionUtils.isNotEmpty(couponSupplierInfoPos)){
				couMap=CommonUtils.listforMap(couponSupplierInfoPos, "id", "supplierName");
			}
		}
		
		if(CollectionUtils.isNotEmpty(capitalAccountFlowInfoPos)){
			
			for (CapitalAccountFlowInfoPo capitalAccountFlowInfoPo : capitalAccountFlowInfoPos) {
				
				/*//封装付款单位
				if(MapUtils.isNotEmpty(orgMap)&&orgMap.get(capitalAccountFlowInfoPo.getPaymentCompany())!=null){
					
				}*/
				
				if(capitalAccountFlowInfoPo.getPaymentCompanyRole()==1 || capitalAccountFlowInfoPo.getPaymentCompanyRole()==2){
					
					List<Integer> orgInfoIds=new ArrayList<Integer>();
					orgInfoIds.add(capitalAccountFlowInfoPo.getPaymentCompany());
					List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
					if(CollectionUtils.isNotEmpty(orgInfoPos)){
						for (OrgInfoPo orgInfoPo : orgInfoPos) {
							capitalAccountFlowInfoPo.setPaymentCompanyName(orgInfoPo.getOrgName());
						}
					}
					
				}else if(capitalAccountFlowInfoPo.getPaymentCompanyRole()==3){
					
					IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerByUserInfoId(capitalAccountFlowInfoPo.getPaymentCompany());
					if(individualOwnerPo!=null){
						capitalAccountFlowInfoPo.setPaymentCompanyName(individualOwnerPo.getRealName());
					}
					
				}else if(capitalAccountFlowInfoPo.getPaymentCompanyRole()==4){
					
					List<Integer> userInfoIds=new ArrayList<Integer>();
					userInfoIds.add(capitalAccountFlowInfoPo.getPaymentCompany());
					List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
					if(CollectionUtils.isNotEmpty(driverInfos)){
						for (DriverInfo driverInfo : driverInfos) {
							capitalAccountFlowInfoPo.setPaymentCompanyName(driverInfo.getDriverName());
						}
					}
				}
				
				//封装有价券供应商
				if(MapUtils.isNotEmpty(couMap)&&couMap.get(capitalAccountFlowInfoPo.getCouponSupplierInfoId())!=null){
					capitalAccountFlowInfoPo.setCouponSupplierName(couMap.get(capitalAccountFlowInfoPo.getCouponSupplierInfoId()));
				}
				
				//封装交易日期
				if(capitalAccountFlowInfoPo.getTransactionDate()!=null){
					capitalAccountFlowInfoPo.setTransactionDateStr(new SimpleDateFormat("yyyy-MM-dd").format(capitalAccountFlowInfoPo.getTransactionDate()));
				}
				
			}
			
		}
		
		return capitalAccountFlowInfoPos;
		
	}
	
	/** 
	* @方法名: getCapitalAccountFlowInfoCount 
	* @作者: zhangshuai
	* @时间: 2017年9月28日 下午5:54:04
	* @返回值类型: Integer 
	* @throws 
	* 资金账户流水信息全查数量
	*/
	@RequestMapping(value="/getCapitalAccountFlowInfoCount")
	@ResponseBody
	public Integer getCapitalAccountFlowInfoCount(HttpServletRequest request,HttpServletResponse response){
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		Integer uOrgRootId=null;
		Integer uOrgInfoId=null;
		Integer uUserRole=userInfo.getUserRole();
		//物流公司/企业货主
		if(userInfo.getUserRole()==1 || userInfo.getUserRole()==2){
			uOrgRootId=userInfo.getOrgRootId();
			uOrgInfoId=userInfo.getOrgInfoId();
		}else 
			//个体货主/司机
			if(userInfo.getUserRole()==3 || userInfo.getUserRole()==4){
				uOrgRootId=userInfo.getId();
				uOrgInfoId=userInfo.getId();
		}
		
		//接受页面参数
		String balanceOfPaymentsType=request.getParameter("balanceOfPaymentsType");
		String transactionStartDate=request.getParameter("transactionStartDate");
		String transactionEndDate=request.getParameter("transactionEndDate");
		
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("userRole", uUserRole);//角色信息
		params.put("orgRootId", uOrgRootId);//角色信息
		params.put("orgInfoId", uOrgInfoId);//角色信息
		params.put("balanceOfPaymentsType", balanceOfPaymentsType);
		params.put("transactionStartDate", transactionStartDate);
		params.put("transactionEndDate", transactionEndDate);
		
		Integer count=capitalAccountFlowInfoFacade.getCapitalAccountFlowInfoCount(params);
		
		return count;
	}
	
	/** 
	* @方法名: goRechargePage 
	* @作者: zhangshuai
	* @时间: 2017年9月26日 下午5:55:37
	* @返回值类型: String 
	* @throws 
	*   点击充值按钮，进入充值页面
	*/
	@RequestMapping(value="/goRechargePage")
	public String goRechargePage(HttpServletRequest request,HttpServletResponse response,Model model){
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		//接受充值账户信息
		String CZZHName=request.getParameter("CZZHName");
		String CZZHPrice=request.getParameter("CZZHPrice");
		String CZKYPrice=request.getParameter("CZKYPrice");
		
		//获取充值redis单号
		String CZRedis="";
		try {
			CZRedis = CodeAutoGenerater.generaterCodeByFlag("CZDH");
		} catch (Exception e) {
			
			String codeNum=rechargeOrWithdrawalsInfoPoFacade.findMaxRechargeOddNumber();
			String date = new SimpleDateFormat("yyyyMMdd").format(new Date());
			String codeKey = "CZDH" + date;
			Integer currentNum = Integer.valueOf(codeNum.substring("CZDH".length()+8)) + 1;
			NumberFormat formatter = NumberFormat.getNumberInstance();
			formatter.setMinimumIntegerDigits(4);
			formatter.setGroupingUsed(false);
			String currentNumStr = formatter.format(currentNum);
			CZRedis = codeKey + currentNumStr;
		}
		
		
		
		model.addAttribute("CZZHName", CZZHName);
		model.addAttribute("CZZHPrice", CZZHPrice);
		model.addAttribute("CZKYPrice", CZKYPrice);
		model.addAttribute("CZRedis", CZRedis);
		model.addAttribute("mobilePhone", userInfo.getMobilePhone());
		
		return "template/fundAccountManagement/root_recharge_page";
	}
	
	/** 
	* @方法名: goWithdrawalsPage 
	* @作者: zhangshuai
	* @时间: 2017年9月27日 下午4:38:27
	* @返回值类型: String 
	* @throws 
	* 点击提现按钮，进入提现页面
	*/
	@RequestMapping(value="/goWithdrawalsPage")
	public String goWithdrawalsPage(HttpServletRequest request,HttpServletResponse response,Model model){

		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		//接受充值账户信息
		String CZZHName=request.getParameter("TXZHName");
		String CZZHPrice=request.getParameter("TXZHPrice");
		String CZKYPrice=request.getParameter("TXKYPrice");
		
		//获取充值redis单号
		String CZRedis="";
		try {
			CZRedis = CodeAutoGenerater.generaterCodeByFlag("TXDH");
		} catch (Exception e) {
			String codeNum=rechargeOrWithdrawalsInfoPoFacade.findMaxWithdrawalsOddNumber();
			String date = new SimpleDateFormat("yyyyMMdd").format(new Date());
			String codeKey = "CZDH" + date;
			Integer currentNum = Integer.valueOf(codeNum.substring("CZDH".length()+8)) + 1;
			NumberFormat formatter = NumberFormat.getNumberInstance();
			formatter.setMinimumIntegerDigits(4);
			formatter.setGroupingUsed(false);
			String currentNumStr = formatter.format(currentNum);
			CZRedis = codeKey + currentNumStr;
		}
		
		model.addAttribute("CZZHName", CZZHName);
		model.addAttribute("CZZHPrice", CZZHPrice);
		model.addAttribute("CZKYPrice", CZKYPrice);
		model.addAttribute("CZRedis", CZRedis);
		model.addAttribute("mobilePhone", userInfo.getMobilePhone());
		return "template/fundAccountManagement/root_withdrawals_page";
	}
	
	/** 
	* @方法名: goWaybillCoverFrozenInfoPage 
	* @作者: zhangshuai
	* @时间: 2017年9月27日 下午4:40:20
	* @返回值类型: String 
	* @throws  
	*  运单冻结金额和招标冻结金额切换
	*/
	@RequestMapping(value="/goWaybillCoverFrozenInfoPage")
	public String goWaybillCoverFrozenInfoPage(){
		return "template/fundAccountManagement/root_waybill_cover_frozen_info_page";
	}
	
	/** 
	* @方法名: goWaybillCoverFrozenInfoPage 
	* @作者: zhangshuai
	* @时间: 2017年9月27日 下午4:40:20
	* @返回值类型: String 
	* @throws  
	*  运单冻结金额和招标冻结金额切换
	*/
	@RequestMapping(value="/goBiddingCoverFrozenInfoPage")
	public String goBiddingCoverFrozenInfoPage(){
		return "template/fundAccountManagement/root_bidding_cover_frozen_info_page";
	}
	
	/** 
	* @方法名: goWaybillCoverFrozenInfoPage 
	* @作者: zhangshuai
	* @时间: 2017年9月27日 下午4:40:20
	* @返回值类型: String 
	* @throws  
	*  运单冻结金额和招标冻结金额切换
	*/
	@RequestMapping(value="/goWaybillFrozenInfoPage")
	public String goWaybillFrozenInfoPage(){
		return "template/fundAccountManagement/root_waybill_frozen_info_page";
	}
	
	/** 
	* @方法名: goWaybillCoverFrozenInfoPage 
	* @作者: zhangshuai
	* @时间: 2017年9月27日 下午4:40:20
	* @返回值类型: String 
	* @throws  
	*  运单冻结金额和招标冻结金额切换
	*/
	@RequestMapping(value="/goBiddingFrozenInfoPage")
	public String goBiddingFrozenInfoPage(){
		return "template/fundAccountManagement/root_bidding_frozen_info_page";
	}
	
	/** 
	* @方法名: rechargeOrWithdrawals 
	* @作者: zhangshuai
	* @时间: 2017年9月28日 上午10:48:32
	* @返回值类型: JSONObject 
	* @throws 
	*   账户充值/提现
	*/
	@RequestMapping(value="/rechargeOrWithdrawals")
	@ResponseBody
	public JSONObject rechargeOrWithdrawals(HttpServletRequest request,HttpServletResponse response){
		
		JSONObject jo=new JSONObject();
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		Integer uOrgRootId=null;
		Integer uOrgInfoId=null;
		Integer uUserRole=userInfo.getUserRole();
		//物流公司/企业货主
		if(userInfo.getUserRole()==1 || userInfo.getUserRole()==2){
			uOrgRootId=userInfo.getOrgRootId();
			uOrgInfoId=userInfo.getOrgInfoId();
		}else 
			//个体货主/司机
			if(userInfo.getUserRole()==3 || userInfo.getUserRole()==4){
				uOrgRootId=userInfo.getId();
				uOrgInfoId=userInfo.getId();
		}
		//接受页面参数
		
		String CZZHName=request.getParameter("CZZHName");//账户名称
		String CZZHPrice=request.getParameter("CZZHPrice");//账户金额
		String CZKYPrice=request.getParameter("CZKYPrice");//账户可用金额
		String CZRedis=request.getParameter("CZRedis");//充值单号
		String thisPrice=request.getParameter("thisPrice");//本次交易金额
		String paymentMethod=request.getParameter("paymentMethod");//支付方式
		String mobilePhone=request.getParameter("mobilePhone");//手机号
		String code=request.getParameter("code");//验证码
		String sign=request.getParameter("sign");//充值/提现
		//获取redis单号
		String LSRedis;
		try {
			LSRedis = CodeAutoGenerater.generaterCodeByFlag("LSDH");
		} catch (Exception e1) {
			String codeNum=capitalAccountFlowInfoFacade.findMaxLSDH();
			
			Integer currentNum = Integer.valueOf(codeNum.substring("LSDH".length()+8)) + 1;
			String date = new SimpleDateFormat("yyyyMMdd").format(new Date());
			String codeKey = "LSDH" + date;
			NumberFormat formatter = NumberFormat.getNumberInstance();
			formatter.setMinimumIntegerDigits(4);
			formatter.setGroupingUsed(false);
			String currentNumStr = formatter.format(currentNum);
			LSRedis = codeKey + currentNumStr;
			
		}
		try {
			jo=rechargeOrWithdrawalsInfoPoFacade.rechargeOrWithdrawals(CZZHName,CZZHPrice,CZKYPrice,CZRedis,thisPrice,paymentMethod,mobilePhone,code,sign,
					userInfo.getId(),uOrgRootId,uOrgInfoId,uUserRole,LSRedis);
		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", "系统异常，请稍后再试!");
		}
		return jo;
	}
	
	/** 
	* @方法名: exportCapitalAccountFlowInfo 
	* @作者: zhangshuai
	* @时间: 2017年9月28日 下午6:44:29
	* @返回值类型: void 
	* @throws 
	*   资金账户流水导出
	*/
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/exportCapitalAccountFlowInfo")
	@ResponseBody
	public void exportCapitalAccountFlowInfo(String ids,HttpServletRequest request,HttpServletResponse response){
		
		
		
		String finalFileName = "资金账户流水信息";
		response.setContentType("application/vnd.ms-excel;charset=UTF-8");
		try {
			finalFileName = URLEncoder.encode(finalFileName, "UTF-8");
			response.setCharacterEncoding("utf-8"); 
			response.addHeader("Content-Disposition", "attachment;filename="+new String( finalFileName.getBytes("gbk"), "UTF-8" )+".xls"); 		
			} catch (UnsupportedEncodingException e) {
		}
		
		List<CapitalAccountFlowInfoPo> exportList = new ArrayList<CapitalAccountFlowInfoPo>();
		List<Integer> idsList = new ArrayList<Integer>();
		
		if(ids!=null){
			for (String id : ids.split(",")) {
				idsList.add(Integer.valueOf(id));
			}
			
			// 根据主键查询要导出的数据
			exportList=capitalAccountFlowInfoFacade.findAllMationByIds(idsList);
			Map<String, Object> tmap = new HashMap<String, Object>();
			List<String> keyList = new ArrayList<String>();
			List<String> titleList = new ArrayList<String>();
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			Workbook workbook = new HSSFWorkbook();
			
			// 调用导出方法
			tmap = capitalAccountFlowInfoFacade.exportCapInfo(exportList);
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
	* @方法名: biddingCoverFrozenList 
	* @作者: zhangshuai
	* @时间: 2017年9月29日 下午7:31:47
	* @返回值类型: List<BiddingFrozenInfoPo> 
	* @throws 
	*  查询我的投标被冻结信息
	*/
	@RequestMapping(value="/biddingCoverFrozenList")
	@ResponseBody
	public List<BiddingFrozenInfoPo> biddingCoverFrozenList(HttpServletRequest request,HttpServletResponse response){
		
		UserInfo  userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		String biddingOrg=request.getParameter("biddingOrg");
		String frozenStartDate=request.getParameter("frozenStartDate");
		String frozenEndDate=request.getParameter("frozenEndDate");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		Integer sign=Integer.parseInt(request.getParameter("sign"));
		//被冻结信息
		if(sign==2){
			//判断登录用户角色信息
			//企业货主or个体货主or司机不能进行投标报价
			if(userInfo.getUserRole()==1 || userInfo.getUserRole()==3 || userInfo.getUserRole()==4){
				List<BiddingFrozenInfoPo> biddingFrozenInfoPo=new ArrayList<BiddingFrozenInfoPo>();
				return biddingFrozenInfoPo;
			}else 
				//物流公司可以进行查询
				if(userInfo.getUserRole()==2){
					Integer orgRootId=userInfo.getOrgRootId();
					Integer orgInfoId=userInfo.getOrgInfoId();
					//根据登录用户主机构id和组织机构id查询招标资金冻结信息
					Map<String, Object> paramsMap=new HashMap<String,Object>();
					paramsMap.put("offerOrgRootId", orgRootId);
					paramsMap.put("offerOrgInfoId", orgInfoId);
					paramsMap.put("frozenType", 2);
					paramsMap.put("isFrozen", 2);
					paramsMap.put("biddingOrg", biddingOrg);
					paramsMap.put("frozenStartDate", frozenStartDate);
					paramsMap.put("frozenEndDate", frozenEndDate);
					paramsMap.put("start", start);
					paramsMap.put("rows", rows);
					List<BiddingFrozenInfoPo> biddingFrozenInfoPos = biddingFrozenInfoFacade.getFindCautionMoneyByOfferRootAndInfo(paramsMap);
					if(CollectionUtils.isNotEmpty(biddingFrozenInfoPos)){
						//封装招标单位
						List<Integer> orgIds=CommonUtils.getValueList(biddingFrozenInfoPos, "biddingOrgInfoId");
						//key：id  value=名称
						Map<Integer, String> orgMap=null;
						if(CollectionUtils.isNotEmpty(orgIds)){
							List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
							if(CollectionUtils.isNotEmpty(orgInfoPos)){
								orgMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
							}
						}
						
						//封装货物
						List<Integer> goodsIds=CommonUtils.getValueList(biddingFrozenInfoPos, "goodsInfoId");
						//key：id value：名称
						Map<Integer, String> goodsMap=null;
						if(CollectionUtils.isNotEmpty(goodsIds)){
							List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
							if(CollectionUtils.isNotEmpty(goodsInfos)){
								goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
							}
						}
						
						//封装线路
						List<Integer> lineIds=CommonUtils.getValueList(biddingFrozenInfoPos, "lineInfoId");
						//key：id value：名称				
						Map<Integer, String> lineMap=null;
						if(CollectionUtils.isNotEmpty(lineIds)){
							List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineIds);
							if(CollectionUtils.isNotEmpty(lineInfoPos)){
								lineMap=CommonUtils.listforMap(lineInfoPos, "id", "lineName");
							}
						}
						
						//封装创建人
						List<Integer> userIds=CommonUtils.getValueList(biddingFrozenInfoPos, "createUser");
						//key：id value：名称			
						Map<Integer, String> userMap=null;
						if(CollectionUtils.isNotEmpty(userIds)){
							List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userIds);
							if(CollectionUtils.isNotEmpty(userInfos)){
								userMap=CommonUtils.listforMap(userInfos, "id", "userName");
							}
						}
						
						for (BiddingFrozenInfoPo biddingFrozenInfoPo : biddingFrozenInfoPos) {
							
							//封装招标单位
							if(MapUtils.isNotEmpty(orgMap)&&orgMap.get(biddingFrozenInfoPo.getBiddingOrgInfoId())!=null){
								biddingFrozenInfoPo.setBiddingOrgName(orgMap.get(biddingFrozenInfoPo.getBiddingOrgInfoId()));
							}
							
							//封装货物
							if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(biddingFrozenInfoPo.getGoodsInfoId())!=null){
								biddingFrozenInfoPo.setGoodsName(goodsMap.get(biddingFrozenInfoPo.getGoodsInfoId()));
							}
							
							//封装线路
							if(MapUtils.isNotEmpty(lineMap)&&lineMap.get(biddingFrozenInfoPo.getLineInfoId())!=null){
								biddingFrozenInfoPo.setLineName(lineMap.get(biddingFrozenInfoPo.getLineInfoId()));
							}
							
							//封装创建人
							if(MapUtils.isNotEmpty(userMap)&&userMap.get(biddingFrozenInfoPo.getCreateUser())!=null){
								biddingFrozenInfoPo.setUserName(userMap.get(biddingFrozenInfoPo.getCreateUser()));
							}
							
							if(biddingFrozenInfoPo.getFreezingStartDate()!=null){
								biddingFrozenInfoPo.setFreezingStartDateStr(new SimpleDateFormat("yyyy-MM-dd").format(biddingFrozenInfoPo.getFreezingStartDate()));
							}
						}
						return biddingFrozenInfoPos;
					}
					
					
			}
		}else 
			//冻结信息
			if(sign==1){
			
				//个体货主or司机不能发布招标信息
				if(userInfo.getUserRole()==3 || userInfo.getUserRole()==4){
					List<BiddingFrozenInfoPo> biddingFrozenInfoPo=new ArrayList<BiddingFrozenInfoPo>();
					return biddingFrozenInfoPo;
				}else 
					//物流公司or企业货主能发布招标信息
					if(userInfo.getUserRole()==1 || userInfo.getUserRole()==2){
						Integer orgRootId=userInfo.getOrgRootId();
						Integer orgInfoId=userInfo.getOrgInfoId();
						
						//根据登录用户主机构id和组织机构id查询招标资金冻结信息
						Map<String, Object> paramsMap=new HashMap<String,Object>();
						paramsMap.put("biddingOrgRootId", orgRootId);
						paramsMap.put("biddingOrgInfId", orgInfoId);
						paramsMap.put("frozenType", 1);
						paramsMap.put("isFrozen", 2);
						paramsMap.put("biddingOrg", biddingOrg);
						paramsMap.put("frozenStartDate", frozenStartDate);
						paramsMap.put("frozenEndDate", frozenEndDate);
						paramsMap.put("start", start);
						paramsMap.put("rows", rows);
						List<BiddingFrozenInfoPo> biddingFrozenInfoPos = biddingFrozenInfoFacade.getFindCautionMoneyByOfferRootAndInfo(paramsMap);
						if(CollectionUtils.isNotEmpty(biddingFrozenInfoPos)){
							//封装招标单位
							List<Integer> orgIds=CommonUtils.getValueList(biddingFrozenInfoPos, "biddingOrgInfoId");
							//key：id  value=名称
							Map<Integer, String> orgMap=null;
							if(CollectionUtils.isNotEmpty(orgIds)){
								List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
								if(CollectionUtils.isNotEmpty(orgInfoPos)){
									orgMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
								}
							}
							
							//封装货物
							List<Integer> goodsIds=CommonUtils.getValueList(biddingFrozenInfoPos, "goodsInfoId");
							//key：id value：名称
							Map<Integer, String> goodsMap=null;
							if(CollectionUtils.isNotEmpty(goodsIds)){
								List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
								if(CollectionUtils.isNotEmpty(goodsInfos)){
									goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
								}
							}
							
							//封装报价方
							List<Integer> offerIds=CommonUtils.getValueList(biddingFrozenInfoPos, "offerOrgInfoId");
							//key：id value：名称
							Map<Integer, String> offerMap=null;
							if(CollectionUtils.isNotEmpty(offerIds)){
								List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(offerIds);
								if(CollectionUtils.isNotEmpty(orgInfoPos)){
									offerMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
								}
							}
							
							//封装线路
							List<Integer> lineIds=CommonUtils.getValueList(biddingFrozenInfoPos, "lineInfoId");
							//key：id value：名称				
							Map<Integer, String> lineMap=null;
							if(CollectionUtils.isNotEmpty(lineIds)){
								List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineIds);
								if(CollectionUtils.isNotEmpty(lineInfoPos)){
									lineMap=CommonUtils.listforMap(lineInfoPos, "id", "lineName");
								}
							}
							
							//封装创建人
							List<Integer> userIds=CommonUtils.getValueList(biddingFrozenInfoPos, "createUser");
							//key：id value：名称			
							Map<Integer, String> userMap=null;
							if(CollectionUtils.isNotEmpty(userIds)){
								List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userIds);
								if(CollectionUtils.isNotEmpty(userInfos)){
									userMap=CommonUtils.listforMap(userInfos, "id", "userName");
								}
							}
							
							for (BiddingFrozenInfoPo biddingFrozenInfoPo : biddingFrozenInfoPos) {
								
								//封装中标方
								if(MapUtils.isNotEmpty(offerMap)&&offerMap.get(biddingFrozenInfoPo.getOfferOrgInfoId())!=null){
									biddingFrozenInfoPo.setOfferName(offerMap.get(biddingFrozenInfoPo.getOfferOrgInfoId()));
								}
								
								//封装招标单位
								if(MapUtils.isNotEmpty(orgMap)&&orgMap.get(biddingFrozenInfoPo.getBiddingOrgInfoId())!=null){
									biddingFrozenInfoPo.setBiddingOrgName(orgMap.get(biddingFrozenInfoPo.getBiddingOrgInfoId()));
								}
								
								//封装货物
								if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(biddingFrozenInfoPo.getGoodsInfoId())!=null){
									biddingFrozenInfoPo.setGoodsName(goodsMap.get(biddingFrozenInfoPo.getGoodsInfoId()));
								}
								
								//封装线路
								if(MapUtils.isNotEmpty(lineMap)&&lineMap.get(biddingFrozenInfoPo.getLineInfoId())!=null){
									biddingFrozenInfoPo.setLineName(lineMap.get(biddingFrozenInfoPo.getLineInfoId()));
								}
								
								//封装创建人
								if(MapUtils.isNotEmpty(userMap)&&userMap.get(biddingFrozenInfoPo.getCreateUser())!=null){
									biddingFrozenInfoPo.setUserName(userMap.get(biddingFrozenInfoPo.getCreateUser()));
								}
								
								if(biddingFrozenInfoPo.getFreezingStartDate()!=null){
									biddingFrozenInfoPo.setFreezingStartDateStr(new SimpleDateFormat("yyyy-MM-dd").format(biddingFrozenInfoPo.getFreezingStartDate()));
								}
							}
							return biddingFrozenInfoPos;
						}
						
				}
				
		}
		
		return null;
	}
	
	/** 
	* @方法名: getBiddingCoverFrozenListCount 
	* @作者: zhangshuai
	* @时间: 2017年9月30日 上午10:43:16
	* @返回值类型: Integer 
	* @throws 
	* 	我的投标被冻结数量
	*/
	@RequestMapping(value="/getBiddingCoverFrozenListCount")
	@ResponseBody
	public Integer getBiddingCoverFrozenListCount(HttpServletRequest request,HttpServletResponse response){
		
		UserInfo  userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		String biddingOrg=request.getParameter("biddingOrg");
		String frozenStartDate=request.getParameter("frozenStartDate");
		String frozenEndDate=request.getParameter("frozenEndDate");
		Integer sign=Integer.parseInt(request.getParameter("sign"));
		//冻结信息
		if(sign==1){
			//个体货主or司机不能发布招标
			if(userInfo.getUserRole()==3 || userInfo.getUserRole()==4){
				return 0;
			}else 
				//物流公司or企业货主
				if(userInfo.getUserRole()==1 || userInfo.getUserRole()==2){
					Integer orgRootId=userInfo.getOrgRootId();
					Integer orgInfoId=userInfo.getOrgInfoId();
					
					//根据登录用户主机构id和组织机构id查询招标资金冻结信息
					Map<String, Object> paramsMap=new HashMap<String,Object>();
					paramsMap.put("biddingOrgRootId", orgRootId);
					paramsMap.put("biddingOrgInfId", orgInfoId);
					paramsMap.put("frozenType", 1);
					paramsMap.put("isFrozen", 2);
					paramsMap.put("biddingOrg", biddingOrg);
					paramsMap.put("frozenStartDate", frozenStartDate);
					paramsMap.put("frozenEndDate", frozenEndDate);
					Integer count = biddingFrozenInfoFacade.getBiddingCoverFrozenListCount(paramsMap);
					return count;
			}
			
		}else 
			//被冻结信息
			if(sign==2){
				//判断登录用户角色信息
				//企业货主or个体货主or司机不能进行投标报价
				if(userInfo.getUserRole()==1 || userInfo.getUserRole()==3 || userInfo.getUserRole()==4){
					return 0;
				}else 
					//物流公司可以进行查询
					if(userInfo.getUserRole()==2){
						Integer orgRootId=userInfo.getOrgRootId();
						Integer orgInfoId=userInfo.getOrgInfoId();
						
						//根据登录用户主机构id和组织机构id查询招标资金冻结信息
						Map<String, Object> paramsMap=new HashMap<String,Object>();
						paramsMap.put("offerOrgInfoId", orgRootId);
						paramsMap.put("offerOrgRootId", orgInfoId);
						paramsMap.put("frozenType", 2);
						paramsMap.put("isFrozen", 2);
						paramsMap.put("biddingOrg", biddingOrg);
						paramsMap.put("frozenStartDate", frozenStartDate);
						paramsMap.put("frozenEndDate", frozenEndDate);
						Integer count = biddingFrozenInfoFacade.getBiddingCoverFrozenListCount(paramsMap);
						return count;
				}
		}
		
		
		return 0;
	}
	
	/** 
	* @方法名: biddingFreezeInformationExport 
	* @作者: zhangshuai
	* @时间: 2017年10月10日 上午10:48:02
	* @返回值类型: void 
	* @throws 
	*  招标冻结信息导出
	*/
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/biddingFreezeInformationExport")
	public void biddingFreezeInformationExport(String sign,String ids,HttpServletRequest request,HttpServletResponse response){
		String finalFileName="";
		if("1".equals(sign)){
			finalFileName = "投标被冻结信息导出";
		}else if("2".equals(sign)){
			finalFileName = "招标冻结信息导出";
		}
		
		
		response.setContentType("application/vnd.ms-excel;charset=UTF-8");
		
		try {
			finalFileName = URLEncoder.encode(finalFileName, "UTF-8");
			response.setCharacterEncoding("utf-8"); 
			response.addHeader("Content-Disposition", "attachment;filename="+new String( finalFileName.getBytes("gbk"), "UTF-8" )+".xls"); 		
			} catch (UnsupportedEncodingException e) {
		}
		
		List<BiddingFrozenInfoPo> exportList=new ArrayList<BiddingFrozenInfoPo>();
		
		List<Integer> idList=new ArrayList<Integer>();
		if(ids.length()>0){
			for (String id : ids.split(",")) {
				idList.add(Integer.parseInt(id));
			}
			
			//根据操作的id批量查询招标冻结信息
			exportList=biddingFrozenInfoFacade.findBiddingFrozenMationByIds(idList);
			Map<String, Object> tmap=new HashMap<String,Object>();
			List<String> keyList=new ArrayList<String>();
			List<String> titleList=new ArrayList<String>();
			List<Map<String, Object>> list=new ArrayList<Map<String,Object>>();
			Workbook workbook=new HSSFWorkbook();
			
			//调用导出方法
			tmap=biddingFrozenInfoFacade.biddingFreezeInformationExport(exportList);
			//取出要导出的参数
			keyList=(List<String>) tmap.get("keyList");
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
	* @方法名: findWayCoverFrozenList 
	* @作者: zhangshuai
	* @时间: 2017年10月10日 下午5:13:59
	* @返回值类型: List<WaybillFrozenInfoPo> 
	* @throws 
	* 运单冻结信息全查
	*/
	@RequestMapping(value="/findWayCoverFrozenList")
	@ResponseBody
	public List<WaybillFrozenInfoPo> findWayCoverFrozenList(HttpServletRequest request,HttpServletResponse response){
		
		Integer sign=Integer.parseInt(request.getParameter("sign"));
		String wayCode=request.getParameter("wayCode");
		String createStartDate=request.getParameter("createStartDate");
		String createEndDate=request.getParameter("createEndDate");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=null;
		Integer orgInfoId=null;
		if(userInfo.getUserRole()==2 || userInfo.getUserRole()==1){
			orgRootId=userInfo.getOrgRootId();
			orgInfoId=userInfo.getOrgInfoId();
		}else if(userInfo.getUserRole()==3 || userInfo.getUserRole()==4){
			orgRootId=userInfo.getId();
			orgInfoId=userInfo.getId();
		}
		//判断是被冻结还是冻结信息
		//被冻结
		if(sign==1){
			//判断登录用户角色
			//只有物流公司和司机才能进行运单报价
			if(userInfo.getUserRole()==2 || userInfo.getUserRole()==4){
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("frozenType", 2);
				params.put("isFrozen", 2);
				params.put("userRole", userInfo.getUserRole());
				params.put("orgRootId", orgRootId);
				params.put("orgInfoId", orgInfoId);
				params.put("wayCode", wayCode);
				params.put("createStartDate", createStartDate);
				params.put("createEndDate", createEndDate);
				params.put("start", start);
				params.put("rows", rows);
				List<WaybillFrozenInfoPo> waybillFrozenInfoPos=waybillFrozenInfoFacade.findCautionMoneyByUserRoleAndRootAndInfo(params);
				if(CollectionUtils.isNotEmpty(waybillFrozenInfoPos)){
					
					/*//封装委托方
					List<Integer> entrustIds=CommonUtils.getValueList(waybillFrozenInfoPos, "entrust");
					//key：机构id  value：机构名称
					Map<Integer, String> entrustMap=null;
					if(CollectionUtils.isNotEmpty(entrustIds)){
						List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(entrustIds);
						if(CollectionUtils.isNotEmpty(orgInfoPos)){
							entrustMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
						}
					}*/
					//封装承运方
					List<Integer> shipperIds=CommonUtils.getValueList(waybillFrozenInfoPos, "shipper");
					//key：机构id  value：机构名称
					Map<Integer, String> shipperMap=null;
					if(CollectionUtils.isNotEmpty(shipperIds)){
						List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(shipperIds);
						if(CollectionUtils.isNotEmpty(orgInfoPos)){
							shipperMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
						}
					}
					
					//封装司机姓名
					List<Integer> driverIds=CommonUtils.getValueList(waybillFrozenInfoPos, "userInfoId");
				   //key：userinfoid	  value：司机名称
					Map<Integer, String> driverMap=null;
					if(CollectionUtils.isNotEmpty(driverIds)){
						List<DriverInfo> driverInfos=driverInfoFacade.findDriverByUserInfoIds(driverIds);
						if(CollectionUtils.isNotEmpty(driverInfos)){
							driverMap=CommonUtils.listforMap(driverInfos, "userInfoId", "driverName");
						}
					}
					
					//封装货物
					List<Integer> goodsIds=CommonUtils.getValueList(waybillFrozenInfoPos, "goodsInfoId");
					 //key：userinfoid	  value：司机名称
					Map<Integer, String> goodsMap=null;
					if(CollectionUtils.isNotEmpty(goodsIds)){
						List<GoodsInfo> goodsInfos=goodsInfoFacade.findGoodsInfoByIds(goodsIds);
						if(CollectionUtils.isNotEmpty(goodsInfos)){
							goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
						}
					}
					
					//封装创建人
					List<Integer> userIds=CommonUtils.getValueList(waybillFrozenInfoPos, "createUser");
					 //key：userinfoid	  value：司机名称
					Map<Integer, String> userMap=null;
					if(CollectionUtils.isNotEmpty(userIds)){
						List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userIds);
						if(CollectionUtils.isNotEmpty(userInfos)){
							userMap=CommonUtils.listforMap(userInfos, "id", "userName");
						}
					}
					
					for (WaybillFrozenInfoPo way : waybillFrozenInfoPos) {
						/*//封装委托方
						if(MapUtils.isNotEmpty(entrustMap)&&entrustMap.get(way.getEntrust())!=null){
							way.setEntrustName(entrustMap.get(way.getEntrust()));
						}*/
						
						if(way.getEntrustUserRole()==1 || way.getEntrustUserRole()==2){
							List<Integer> orgIds=new ArrayList<Integer>();
							orgIds.add(way.getEntrust());
							List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
							if(CollectionUtils.isNotEmpty(orgInfoPos)){
								for (OrgInfoPo orgInfoPo : orgInfoPos) {
									way.setEntrustName(orgInfoPo.getOrgName());
								}
							}
						}else if(way.getEntrustUserRole()==3){
							IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerById(way.getEntrust());
							if(individualOwnerPo!=null){
								way.setEntrustName(individualOwnerPo.getRealName());
							}
						}
						
						//封装承运方
						if(MapUtils.isNotEmpty(shipperMap)&&shipperMap.get(way.getShipper())!=null){
							way.setShipperName(shipperMap.get(way.getShipper()));
						}
						
						//封装司机姓名
						if(MapUtils.isNotEmpty(driverMap)&&driverMap.get(way.getUserInfoId())!=null){
							way.setDriverName(driverMap.get(way.getUserInfoId()));
						}
						
						//封装货物
						if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(way.getGoodsInfoId())!=null){
							way.setGoodsName(goodsMap.get(way.getGoodsInfoId()));
						}
						
						//封装创建人
						if(MapUtils.isNotEmpty(userMap)&&userMap.get(way.getCreateUser())!=null){
							way.setUserName(userMap.get(way.getCreateUser()));
						}
						
						//封装线路
						//判断是否为零散货物
						if(way.getScatteredGoods()!=null && !"".equals(way.getScatteredGoods())){
							
							//查询地点表
							if(way.getLineInfoId()!=null){
								List<LocationInfoPo> locationInfoPos = locationInfoFacade.findLocationById(way.getLineInfoId());
								if(CollectionUtils.isNotEmpty(locationInfoPos)){
									for (LocationInfoPo locationInfoPo : locationInfoPos) {
										way.setLineStart(locationInfoPo.getProvince()+"-"+locationInfoPo.getCity()+"-"+locationInfoPo.getCounty());
									}
								}
							}
							
							if(way.getEndPoints()!=null){
								List<LocationInfoPo> locationInfoPos = locationInfoFacade.findLocationById(way.getEndPoints());
								if(CollectionUtils.isNotEmpty(locationInfoPos)){
									for (LocationInfoPo locationInfoPo : locationInfoPos) {
										way.setLineEnd(locationInfoPo.getProvince()+"-"+locationInfoPo.getCity()+"-"+locationInfoPo.getCounty());
									}
								}
							}
							
						}else if(way.getGoodsInfoId()!=null){
							
							//查询线路表
							if(way.getLineInfoId()!=null){
								List<Integer> lineInfoIds=new ArrayList<Integer>();
								lineInfoIds.add(way.getLineInfoId());
								List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
								if(CollectionUtils.isNotEmpty(lineInfoPos)){
									for (LineInfoPo lineInfoPo : lineInfoPos) {
										way.setLineStart(lineInfoPo.getStartPoints());
										way.setLineEnd(lineInfoPo.getEndPoints());
									}
								}
							}
							
						}
						//封装冻结日期
						if(way.getFreezingStartDate()!=null){
							way.setFreezingStartDateStr(new SimpleDateFormat("yyyy-MM-dd").format(way.getFreezingStartDate()));
						}
						//封装创建日期
						if(way.getCreateTime()!=null){
							way.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(way.getCreateTime()));
						}
					}
				}
				return waybillFrozenInfoPos;
			} 
		
		}else 
			//冻结
			if(sign==2){
			
				//个体货主or物流公司or企业货主能进行运单的派发
				if(userInfo.getUserRole()==1 || userInfo.getUserRole()==2 || userInfo.getUserRole()==3){
					
					Map<String, Object> params=new HashMap<String,Object>();
					params.put("frozenType", 1);
					params.put("isFrozen", 2);
					params.put("userRole", userInfo.getUserRole());
					params.put("orgRootId", orgRootId);
					params.put("orgInfoId", orgInfoId);
					params.put("wayCode", wayCode);
					params.put("createStartDate", createStartDate);
					params.put("createEndDate", createEndDate);
					params.put("entrust", orgInfoId);
					params.put("start", start);
					params.put("rows", rows);
					List<WaybillFrozenInfoPo> waybillFrozenInfoPos=waybillFrozenInfoFacade.findCautionMoneyByUserRoleAndRootAndInfo(params);
					if(CollectionUtils.isNotEmpty(waybillFrozenInfoPos)){
						
						/*//封装委托方
						List<Integer> entrustIds=CommonUtils.getValueList(waybillFrozenInfoPos, "entrust");
						//key：机构id  value：机构名称
						Map<Integer, String> entrustMap=null;
						if(CollectionUtils.isNotEmpty(entrustIds)){
							List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(entrustIds);
							if(CollectionUtils.isNotEmpty(orgInfoPos)){
								entrustMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
							}
						}*/
						
						//封装承运方
						List<Integer> shipperIds=CommonUtils.getValueList(waybillFrozenInfoPos, "shipper");
						//key：机构id  value：机构名称
						Map<Integer, String> shipperMap=null;
						if(CollectionUtils.isNotEmpty(shipperIds)){
							List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(shipperIds);
							if(CollectionUtils.isNotEmpty(orgInfoPos)){
								shipperMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
							}
						}
						
						//封装司机姓名
						List<Integer> driverIds=CommonUtils.getValueList(waybillFrozenInfoPos, "userInfoId");
					   //key：userinfoid	  value：司机名称
						Map<Integer, String> driverMap=null;
						if(CollectionUtils.isNotEmpty(driverIds)){
							List<DriverInfo> driverInfos=driverInfoFacade.findDriverByUserInfoIds(driverIds);
							if(CollectionUtils.isNotEmpty(driverInfos)){
								driverMap=CommonUtils.listforMap(driverInfos, "userInfoId", "driverName");
							}
						}
						
						//封装货物
						List<Integer> goodsIds=CommonUtils.getValueList(waybillFrozenInfoPos, "goodsInfoId");
						 //key：userinfoid	  value：司机名称
						Map<Integer, String> goodsMap=null;
						if(CollectionUtils.isNotEmpty(goodsIds)){
							List<GoodsInfo> goodsInfos=goodsInfoFacade.findGoodsInfoByIds(goodsIds);
							if(CollectionUtils.isNotEmpty(goodsInfos)){
								goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
							}
						}
						
						//封装创建人
						List<Integer> userIds=CommonUtils.getValueList(waybillFrozenInfoPos, "createUser");
						 //key：userinfoid	  value：司机名称
						Map<Integer, String> userMap=null;
						if(CollectionUtils.isNotEmpty(userIds)){
							List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userIds);
							if(CollectionUtils.isNotEmpty(userInfos)){
								userMap=CommonUtils.listforMap(userInfos, "id", "userName");
							}
						}
						
						for (WaybillFrozenInfoPo way : waybillFrozenInfoPos) {
							/*//封装委托方
							if(MapUtils.isNotEmpty(entrustMap)&&entrustMap.get(way.getEntrust())!=null){
								way.setEntrustName(entrustMap.get(way.getEntrust()));
							}*/
							
							if(way.getEntrustUserRole()==1 || way.getEntrustUserRole()==2){
								List<Integer> orgIds=new ArrayList<Integer>();
								orgIds.add(way.getEntrust());
								List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
								if(CollectionUtils.isNotEmpty(orgInfoPos)){
									for (OrgInfoPo orgInfoPo : orgInfoPos) {
										way.setEntrustName(orgInfoPo.getOrgName());
									}
								}
							}else if(way.getEntrustUserRole()==3){
								IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerById(way.getEntrust());
								if(individualOwnerPo!=null){
									way.setEntrustName(individualOwnerPo.getRealName());
								}
							}
							
							//封装承运方
							if(MapUtils.isNotEmpty(shipperMap)&&shipperMap.get(way.getShipper())!=null){
								way.setShipperName(shipperMap.get(way.getShipper()));
							}
							
							//封装司机姓名
							if(MapUtils.isNotEmpty(driverMap)&&driverMap.get(way.getUserInfoId())!=null){
								way.setDriverName(driverMap.get(way.getUserInfoId()));
							}
							
							//封装货物
							if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(way.getGoodsInfoId())!=null){
								way.setGoodsName(goodsMap.get(way.getGoodsInfoId()));
							}
							
							//封装创建人
							if(MapUtils.isNotEmpty(userMap)&&userMap.get(way.getCreateUser())!=null){
								way.setUserName(userMap.get(way.getCreateUser()));
							}
							
							//封装线路
							//判断是否为零散货物
							if(way.getScatteredGoods()!=null && !"".equals(way.getScatteredGoods())){
								
								//查询地点表
								if(way.getLineInfoId()!=null){
									List<LocationInfoPo> locationInfoPos = locationInfoFacade.findLocationById(way.getLineInfoId());
									if(CollectionUtils.isNotEmpty(locationInfoPos)){
										for (LocationInfoPo locationInfoPo : locationInfoPos) {
											way.setLineStart(locationInfoPo.getProvince()+"-"+locationInfoPo.getCity()+"-"+locationInfoPo.getCounty());
										}
									}
								}
								
								if(way.getEndPoints()!=null){
									List<LocationInfoPo> locationInfoPos = locationInfoFacade.findLocationById(way.getEndPoints());
									if(CollectionUtils.isNotEmpty(locationInfoPos)){
										for (LocationInfoPo locationInfoPo : locationInfoPos) {
											way.setLineEnd(locationInfoPo.getProvince()+"-"+locationInfoPo.getCity()+"-"+locationInfoPo.getCounty());
										}
									}
								}
								
							}else if(way.getGoodsInfoId()!=null){
								
								//查询线路表
								if(way.getLineInfoId()!=null){
									List<Integer> lineInfoIds=new ArrayList<Integer>();
									lineInfoIds.add(way.getLineInfoId());
									List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
									if(CollectionUtils.isNotEmpty(lineInfoPos)){
										for (LineInfoPo lineInfoPo : lineInfoPos) {
											way.setLineStart(lineInfoPo.getStartPoints());
											way.setLineEnd(lineInfoPo.getEndPoints());
										}
									}
								}
								
							}
							//封装冻结日期
							if(way.getFreezingStartDate()!=null){
								way.setFreezingStartDateStr(new SimpleDateFormat("yyyy-MM-dd").format(way.getFreezingStartDate()));
							}
							//封装创建日期
							if(way.getCreateTime()!=null){
								way.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(way.getCreateTime()));
							}
						}
					}
					return waybillFrozenInfoPos;
					
				}
				
		}
		return null;
		
		
		
	}
	
	/** 
	* @方法名: getWayCoverFrozenListCount 
	* @作者: zhangshuai
	* @时间: 2017年10月11日 下午4:40:34
	* @返回值类型: Integer 
	* @throws 
	* 运单被冻结/冻结数量
	*/
	@RequestMapping(value="/getWayCoverFrozenListCount")
	@ResponseBody
	public Integer getWayCoverFrozenListCount(HttpServletRequest request,HttpServletResponse response){
		
		Integer sign=Integer.parseInt(request.getParameter("sign"));
		String wayCode=request.getParameter("wayCode");
		String createStartDate=request.getParameter("createStartDate");
		String createEndDate=request.getParameter("createEndDate");
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=null;
		Integer orgInfoId=null;
		if(userInfo.getUserRole()==2 || userInfo.getUserRole()==1){
			orgRootId=userInfo.getOrgRootId();
			orgInfoId=userInfo.getOrgInfoId();
		}else if(userInfo.getUserRole()==3 || userInfo.getUserRole()==4){
			orgRootId=userInfo.getId();
			orgInfoId=userInfo.getId();
		}
		
		//被冻结数量
		if(sign==1){
			//判断登录用户角色
			//只有物流公司和司机才能进行运单报价
			if(userInfo.getUserRole()==2 || userInfo.getUserRole()==4){
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("frozenType", 2);
				params.put("isFrozen", 2);
				params.put("userRole", userInfo.getUserRole());
				params.put("orgRootId", orgRootId);
				params.put("orgInfoId", orgInfoId);
				params.put("wayCode", wayCode);
				params.put("createStartDate", createStartDate);
				params.put("createEndDate", createEndDate);
				Integer count=waybillFrozenInfoFacade.getWayCoverFrozenListCount(params);
				return count;
	     }
	}else 
		//冻结数量
		if(sign==2){
		
			//个体货主or物流公司or企业货主能进行运单的派发
			if(userInfo.getUserRole()==1 || userInfo.getUserRole()==2 || userInfo.getUserRole()==3){
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("frozenType", 1);
				params.put("isFrozen", 2);
				params.put("userRole", userInfo.getUserRole());
				params.put("orgRootId", orgRootId);
				params.put("orgInfoId", orgInfoId);
				params.put("wayCode", wayCode);
				params.put("createStartDate", createStartDate);
				params.put("createEndDate", createEndDate);
				params.put("entrust", orgInfoId);
				Integer count=waybillFrozenInfoFacade.getWayCoverFrozenListCount(params);
				return count;
			}
			
		}
		return null;
	}
	
	/** 
	* @方法名: wayFreezeInformationExport 
	* @作者: zhangshuai
	* @时间: 2017年10月12日 下午7:31:59
	* @返回值类型: void 
	* @throws 
	* 运单冻结or被冻结信息导出
	*/
	@SuppressWarnings("unchecked")
	@RequestMapping(value="/wayFreezeInformationExport")
	public void wayFreezeInformationExport(HttpServletRequest request,HttpServletResponse response ,String ids,String sign){
		
		String finalFileName="";
		if("1".equals(sign)){
			finalFileName = "运单冻结信息导出";
		}else if("2".equals(sign)){
			finalFileName = "运单被冻结信息导出";
		}
		
		
		response.setContentType("application/vnd.ms-excel;charset=UTF-8");
		
		try {
			finalFileName = URLEncoder.encode(finalFileName, "UTF-8");
			response.setCharacterEncoding("utf-8"); 
			response.addHeader("Content-Disposition", "attachment;filename="+new String( finalFileName.getBytes("gbk"), "UTF-8" )+".xls"); 		
			} catch (UnsupportedEncodingException e) {
		}
		
		List<WaybillFrozenInfoPo> exportList=new ArrayList<WaybillFrozenInfoPo>();
		
		List<Integer> idList=new ArrayList<Integer>();
		if(ids.length()>0){
			for (String id : ids.split(",")) {
				idList.add(Integer.parseInt(id));
			}
			
			//根据操作的id批量查询招标冻结信息
			exportList=waybillFrozenInfoFacade.findWayFrozenMationByIds(idList);
			Map<String, Object> tmap=new HashMap<String,Object>();
			List<String> keyList=new ArrayList<String>();
			List<String> titleList=new ArrayList<String>();
			List<Map<String, Object>> list=new ArrayList<Map<String,Object>>();
			Workbook workbook=new HSSFWorkbook();
			
			//调用导出方法
			tmap=waybillFrozenInfoFacade.wayFreezeInformationExport(exportList);
			//取出要导出的参数
			keyList=(List<String>) tmap.get("keyList");
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
	
}
