package com.xz.logistics.controller;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.dubbo.common.utils.CollectionUtils;
import com.alibaba.dubbo.common.utils.StringUtils;
import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.facade.api.AccountCheckInfoFacade;
import com.xz.facade.api.CouponInfoFacade;
import com.xz.facade.api.CouponTypeInfoFacade;
import com.xz.facade.api.CouponUseInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.facade.api.OrgDetailInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.PaymentAccountDetailInfoPoFacade;
import com.xz.facade.api.PaymentDetailInfoPoFacade;
import com.xz.facade.api.PaymentInfoFacade;
import com.xz.facade.api.PrePaymentInfoFacade;
import com.xz.facade.api.ProjectInfoFacade;
import com.xz.facade.api.ProxyInfoPoFacade;
import com.xz.facade.api.SettlementInfoFacade;
import com.xz.facade.api.UserDataAuthFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.model.po.AccountCheckInfo;
import com.xz.model.po.CouponInfoPo;
import com.xz.model.po.CouponTypeInfo;
import com.xz.model.po.CouponUseInfo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.LocationInfoPo;
import com.xz.model.po.OrgDetailInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.PaymentAccountDetailInfoPo;
import com.xz.model.po.PaymentDetailInfoPo;
import com.xz.model.po.PaymentInfoPo;
import com.xz.model.po.PrePaymentInfoPo;
import com.xz.model.po.ProjectInfoPo;
import com.xz.model.po.ProxyInfoPo;
import com.xz.model.po.SettlementInfo;
import com.xz.model.po.UserDataAuthPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillInfoPo;
import com.xz.model.vo.PaymentInfoModel;
import com.xz.model.vo.PrePaymentInfoModel;
import com.xz.rpc.service.AccountCheckDetailInfoService;
import com.xz.rpc.service.SettlementLossesService;



/**
* @author zhangshuai   2017年7月6日 下午1:08:53
* 类说明(付款controller)
*/
@Controller
@RequestMapping("/paymentInfo")
public class PaymentInfoController {

	private final Logger log=LoggerFactory.getLogger(getClass());
	@Resource
	private UserDataAuthFacade userDataAuthFacade;
	@Resource
	private WaybillInfoFacade waybillInfoFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private OrgDetailInfoFacade orgDetailInfoFacade;
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;
	@Resource
	private ProjectInfoFacade projectInfoFacade;
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	@Resource
	private ProxyInfoPoFacade proxyInfoPoFacade;
	@Resource
	private PrePaymentInfoFacade prePaymentInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private SettlementInfoFacade settlementInfoFacade;
	@Resource
	private LineInfoFacade lineInfoFacade;
	@Resource
	private CouponUseInfoFacade couponUseInfoFacade;
	@Resource
	private CouponInfoFacade couponInfoFacade;
	@Resource
	private CouponTypeInfoFacade couponTypeInfoFacade;
	@Resource
	private PaymentInfoFacade paymentInfoFacade;
	@Resource
	private LocationInfoFacade locationInfoFacade;
	@Resource
	private SettlementLossesService settlementLossesService;
	@Resource
	private AccountCheckInfoFacade accountCheckInfoFacade;
	@Resource
	private AccountCheckDetailInfoService accountCheckDetailInfoService;
	@Resource
	private PaymentDetailInfoPoFacade paymentDetailInfoPoFacade;
	@Resource
	private PaymentAccountDetailInfoPoFacade paymentAccountDetailInfoPoFacade;
	/**
	 * @author zhangshuai  2017年7月6日 下午1:49:42
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入预付款信息页面
	 */
	@RequestMapping(value="/goPrePaymentInfoMationPage",produces="application/json;charset=utf-8")
	public String goPaymentInfoMationPage(){
		return "template/paymentManagement/root_pre_payment_info_page";
	}
	
	/**
	 * @author zhangshuai  2017年7月6日 下午1:49:42
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入付款信息页面
	 */
	@RequestMapping(value="/goPaymentInfoMationPage",produces="application/json;charset=utf-8")
	public String goPaymentInfoMationPage(HttpServletRequest request,HttpServletResponse response,Model model){
		return "template/paymentManagement/root_payment_info_page";
	}
	
	/**
	 * @author zhangshuai  2017年7月9日 下午10:16:46
	 * @param request
	 * @param response
	 * @return
	 * 进入预付款信息页面进行全查方法
	 */
	@RequestMapping(value="/findPrePaymentMationAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<PrePaymentInfoPo> findPrePaymentMationAll(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户主机构ID
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=null;
		Integer userRole=userInfo.getUserRole();
		//企业货主   物流公司
		if(userRole==1 || userRole==2){
			uOrgRootId=userInfo.getOrgRootId();
		}else 
			//个体货主  司机
			if(userRole==3 || userRole==4){
			uOrgRootId=userInfo.getId();
		}
		//接收页面模糊条件
		String prePaymentId=request.getParameter("prePaymentId");
		String customerName=request.getParameter("customerName");
		String carCode=request.getParameter("carCode");
		String projectInfoName=request.getParameter("projectInfoName");
		String prePaymentPrice=request.getParameter("prePaymentPrice");
		String paymentType=request.getParameter("paymentType");
		String prePaymentStatus=request.getParameter("prePaymentStatus");
		String makeStartTime=request.getParameter("makeStartTime");
		String makeEndime=request.getParameter("makeEndime");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		//根据登录用户主机构ID查询预付款信息
		Map<String, Object> prePaymentParams=new HashMap<String,Object>();
		prePaymentParams.put("orgRootId", uOrgRootId);
		prePaymentParams.put("prePaymentId", prePaymentId);
		prePaymentParams.put("customerName", customerName);
		prePaymentParams.put("carCode", carCode);
		prePaymentParams.put("projectInfoName", projectInfoName);
		prePaymentParams.put("prePaymentPrice", prePaymentPrice);
		prePaymentParams.put("paymentType", paymentType);
		prePaymentParams.put("prePaymentStatus", prePaymentStatus);
		prePaymentParams.put("makeStartTime", makeStartTime);
		prePaymentParams.put("makeEndime", makeEndime);
		prePaymentParams.put("start", start);
		prePaymentParams.put("rows", rows);
		prePaymentParams.put("userRole", userRole);
		
		List<PrePaymentInfoPo> prePaymentInfoPoList=prePaymentInfoFacade.findPrePaymentMationAll(prePaymentParams);
		/*//key：用户id value：司机名称  
		Map<Integer, String> driverMap=null;
		//根据支付人查询司机
		List<Integer> userInfoIds=CommonUtils.getValueList(prePaymentInfoPoList, "paymentPerson");
		if(CollectionUtils.isNotEmpty(userInfoIds)){
			List<DriverInfo> driverInfos=driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
			if(CollectionUtils.isNotEmpty(driverInfos)){
				driverMap=CommonUtils.listforMap(driverInfos, "userInfoId", "driverName");
			}
		}*/
		
		
		//根据代理人查询代理人名称
		List<Integer> proxyInfoIds=CommonUtils.getValueList(prePaymentInfoPoList, "proxyPerson");
		//key:id  value:代理人名称
		Map<Integer, String> proxyInfoMap=null;
		if(CollectionUtils.isNotEmpty(proxyInfoIds)){
			Map<String, Object> queryMap=new HashMap<String,Object>();
			queryMap.put("list", proxyInfoIds);
			List<ProxyInfoPo> proxyInfoPos=proxyInfoPoFacade.findProxyInfoPoByIds(queryMap);
			if(CollectionUtils.isNotEmpty(proxyInfoPos)){
				proxyInfoMap=CommonUtils.listforMap(proxyInfoPos, "id", "proxyName");
			}
		}
		
		
		//根据客户编号查询组织机构明细表信息
		List<Integer> orgInfoIds=CommonUtils.getValueList(prePaymentInfoPoList, "customerId");
		//key： id  value：组织名称
		Map<Integer, String> orgInfoMap=null;
		if(CollectionUtils.isNotEmpty(orgInfoIds)){
			List<OrgInfoPo> orgInfos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			if(CollectionUtils.isNotEmpty(orgInfos)){
				orgInfoMap=CommonUtils.listforMap(orgInfos, "id", "orgName");
			}
		}
		
		//根据组织部门查询项目项目表所属组织
		List<Integer> projectIds=CommonUtils.getValueList(prePaymentInfoPoList, "projectInfoId");
		//key:项目ID  value:所属组织
		Map<Integer, String> projectInfoMap=null;
		if(CollectionUtils.isNotEmpty(projectIds)){
			List<ProjectInfoPo> projectInfoPos=projectInfoFacade.findProjectInfoPoByIds(projectIds);
			if(CollectionUtils.isNotEmpty(projectInfoPos)){
				projectInfoMap=CommonUtils.listforMap(projectInfoPos, "id", "projectName");
			}
		}
		
		//根据货物查询货物名称
		List<Integer> goodsInfoIds=CommonUtils.getValueList(prePaymentInfoPoList, "goodsInfoId");
		//key:货物ID  value：货物名称
		Map<Integer, String> goodsInfoMap=null;
		if(CollectionUtils.isNotEmpty(goodsInfoIds)){
			List<GoodsInfo> goodsInfos=goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				goodsInfoMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}
		}
		
		//根据制单人查询名称
		List<Integer> userIds=CommonUtils.getValueList(prePaymentInfoPoList, "makeUser");
		//key：用户ID   value：用户名称
		Map<Integer, String> userInfoMap=null;
		if(CollectionUtils.isNotEmpty(userIds)){
			List<UserInfo> userInfos=userInfoFacade.findUserNameByIds(userIds);
			if(CollectionUtils.isNotEmpty(userInfos)){
				userInfoMap=CommonUtils.listforMap(userInfos, "id", "userName");
			}
		}
		
		/*//根据支付单位查询司机名称
		List<Integer> paymentCompanyIds=CommonUtils.getValueList(prePaymentInfoPoList, "paymentCompany");
		//key：司机id value：司机名称  
		Map<Integer, String> paymentCompanyMap=null;
		if(CollectionUtils.isNotEmpty(paymentCompanyIds)){
			List<DriverInfo> paymentCompanys=driverInfoFacade.findDriverByUserInfoIds(paymentCompanyIds);
			if(CollectionUtils.isNotEmpty(paymentCompanys)){
				paymentCompanyMap=CommonUtils.listforMap(paymentCompanys, "userInfoId", "driverName");
			}
		}*/
		
		for(PrePaymentInfoPo ppi:prePaymentInfoPoList){
			
			/*//查询运单编号
			if(ppi.getWaybillInfoId()!=null){
				
				//根据运单编号查询运单信息
				WaybillInfoPo waybillInfoPo = waybillInfoFacade.findWaybillById(ppi.getWaybillInfoId());
				if(waybillInfoPo!=null){
					//判断运单信息司机编号是否为空
					if(waybillInfoPo.getUserInfoId()!=null){
						DriverInfo driver=driverInfoFacade.findInternalDriverById(ppi.getPaymentCompany());
						if(driver!=null){
							ppi.setPaymentCompanyName(driver.getDriverName());
						}
						List<Integer> uIds=new ArrayList<Integer>();
						uIds.add(waybillInfoPo.getUserInfoId());
						List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(uIds);
						if(CollectionUtils.isNotEmpty(driverInfos)){
							for (DriverInfo driverInfo : driverInfos) {
								ppi.setPaymentCompanyName(driverInfo.getDriverName());
							}
						}
					}else if(waybillInfoPo.getShipper()!=null){
						List<Integer> oIds=new ArrayList<Integer>();
						oIds.add(waybillInfoPo.getShipper());
						List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(oIds);
						if(CollectionUtils.isNotEmpty(orgInfoPos)){
							for (OrgInfoPo orgInfoPo : orgInfoPos) {
								ppi.setPaymentCompanyName(orgInfoPo.getOrgName());
							}
						}
					}
				}
				
			}*/
			
			//封装支付单位
			if(ppi.getPaymentPerson()!=null){
				DriverInfo driver=driverInfoFacade.findInternalDriverById(ppi.getPaymentCompany());
				if(driver!=null){
					ppi.setPaymentCompanyName(driver.getDriverName());
				}
			}else{
				List<Integer> orgIds=new ArrayList<Integer>();
				orgIds.add(ppi.getPaymentCompany());
				List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
				if(CollectionUtils.isNotEmpty(orgInfoPos)){
					for (OrgInfoPo orgInfoPo : orgInfoPos) {
						ppi.setPaymentCompanyName(orgInfoPo.getOrgName());
					}
				}
			}
			
			/*//封装支付人
			if(MapUtils.isNotEmpty(driverMap)&&driverMap.get(ppi.getPaymentPerson())!=null){
				ppi.setPaymentPersonName(driverMap.get(ppi.getPaymentPerson()));
			}*/
			
			if(ppi.getPaymentPerson()!=null){
				DriverInfo driverInfo = driverInfoFacade.findInternalDriverById(ppi.getPaymentPerson());
				if(driverInfo!=null){
					ppi.setPaymentPersonName(driverInfo.getDriverName());
				}
			}
			
			//封装代理人
			if(MapUtils.isNotEmpty(proxyInfoMap)&&proxyInfoMap.get(ppi.getProxyPerson())!=null){
				ppi.setProxyPersonName(proxyInfoMap.get(ppi.getProxyPerson()));
			}
			//封装客户名称
			if(MapUtils.isNotEmpty(orgInfoMap)&&orgInfoMap.get(ppi.getCustomerId())!=null){
				ppi.setCustomerName(orgInfoMap.get(ppi.getCustomerId()));
			}
			//封装组织部门名称
			if(MapUtils.isNotEmpty(projectInfoMap)&&projectInfoMap.get(ppi.getProjectInfoId())!=null){
				ppi.setProjectInfoName(projectInfoMap.get(ppi.getProjectInfoId()));
			}
			//封装货物名称
			if(MapUtils.isNotEmpty(goodsInfoMap)&&goodsInfoMap.get(ppi.getGoodsInfoId())!=null){
				ppi.setGoodsName(goodsInfoMap.get(ppi.getGoodsInfoId()));
			}
			//封装制单人名称
			if(MapUtils.isNotEmpty(userInfoMap)&&userInfoMap.get(ppi.getMakeUser())!=null){
				ppi.setMakeUserName(userInfoMap.get(ppi.getMakeUser()));
			}
			//封装制单时间
			if(ppi.getMakeTime()!=null){
				ppi.setMakeTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(ppi.getMakeTime()));
			}
			
		}
		
		return prePaymentInfoPoList;
	}
	
	/**
	 * @author zhangshuai  2017年7月10日 上午1:56:17
	 * @param response
	 * @param request
	 * @return
	 * 查询预付款总数
	 */
	@RequestMapping(value="/getPrePaymentMationAllCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getPrePaymentMationAllCount(HttpServletResponse response,HttpServletRequest request){
		//从session中获取登录用户主机构ID
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=null;
		Integer userRole=userInfo.getUserRole();
		//企业货主   物流公司
		if(userRole==1 || userRole==2){
			uOrgRootId=userInfo.getOrgRootId();
		}else 
			//个体货主  司机
			if(userRole==3 || userRole==4){
			uOrgRootId=userInfo.getId();
		}
		
		//接收页面模糊条件
		String prePaymentId=request.getParameter("prePaymentId");
		String customerName=request.getParameter("customerName");
		String carCode=request.getParameter("carCode");
		String projectInfoName=request.getParameter("projectInfoName");
		String prePaymentPrice=request.getParameter("prePaymentPrice");
		String paymentType=request.getParameter("paymentType");
		String prePaymentStatus=request.getParameter("prePaymentStatus");
		String makeStartTime=request.getParameter("makeStartTime");
		String makeEndime=request.getParameter("makeEndime");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		//根据登录用户主机构ID查询预付款信息
		Map<String, Object> prePaymentParams=new HashMap<String,Object>();
		prePaymentParams.put("orgRootId", uOrgRootId);
		prePaymentParams.put("prePaymentId", prePaymentId);
		prePaymentParams.put("customerName", customerName);
		prePaymentParams.put("carCode", carCode);
		prePaymentParams.put("projectInfoName", projectInfoName);
		prePaymentParams.put("prePaymentPrice", prePaymentPrice);
		prePaymentParams.put("paymentType", paymentType);
		prePaymentParams.put("prePaymentStatus", prePaymentStatus);
		prePaymentParams.put("makeStartTime", makeStartTime);
		prePaymentParams.put("makeEndime", makeEndime);
		prePaymentParams.put("start", start);
		prePaymentParams.put("rows", rows);
		prePaymentParams.put("userRole", userRole);
		
		Integer count=prePaymentInfoFacade.getPrePaymentMationAllCount(prePaymentParams);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年7月6日 下午7:07:10
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 付款管理进入新增/修改页面
	 */
	@RequestMapping(value="/addOrSavePaymentInfoMationPage",produces="application/json;charset=utf-8")
	public String addOrSavePaymentInfoMationPage(HttpServletRequest request,HttpServletResponse response,Model model){
		
		Integer sign=null;
		if(request.getParameter("sign")!=null){
			sign=Integer.parseInt(request.getParameter("sign"));
			 if(sign==1){
			    	String addPrePaymentMation="新增预付款信息";
			    	model.addAttribute("addPrePaymentMation", addPrePaymentMation);
			    	return "template/paymentManagement/add_pre_payment_info_page";
			    }else if(sign==2){
			    	String ppid=request.getParameter("ppid");
			    	String updatePrePaymentMation="修改预付款信息";
			    	model.addAttribute("updatePrePaymentMation", updatePrePaymentMation);
			    	String prePaymentId=ppid;
			    	model.addAttribute("prePaymentId", prePaymentId);
			    	
			    	//从session中获取登录用户主机构ID
			    	UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
			    	Integer uOrgRootId=userInfo.getOrgRootId();
			    	Integer pId=Integer.parseInt(ppid);
			    	
			    	//根据主机构ID和操作预付款ID查询预付款信息
			    	Map<String, Object> params=new HashMap<String,Object>();
			    	params.put("orgRootId", uOrgRootId);
			    	params.put("id", pId);
			    	PrePaymentInfoPo prePaymentInfoPo = prePaymentInfoFacade.findPrePaymentStatusById(params);
			    	
			    	//封装支付单位
			    	if(prePaymentInfoPo.getPaymentPerson()!=null){
			    		DriverInfo driver=driverInfoFacade.findInternalDriverById(prePaymentInfoPo.getPaymentCompany());
			    		if(driver!=null){
			    			prePaymentInfoPo.setPaymentCompanyName(driver.getDriverName());
			    		}
			    	}else{
			    		List<Integer> orgInfoIds=new ArrayList<Integer>();
			    		orgInfoIds.add(prePaymentInfoPo.getPaymentCompany());
			    		List<OrgInfoPo> orgInfoPos=orgInfoFacade.findOrgNameByIds(orgInfoIds);
			    		if(CollectionUtils.isNotEmpty(orgInfoPos)){
			    			for (OrgInfoPo orgInfoPo : orgInfoPos) {
				    			prePaymentInfoPo.setPaymentCompanyName(orgInfoPo.getOrgName());
							}
			    		}
			    	}
			    	
			    	if(prePaymentInfoPo!=null){
			    		//封装支付人
			    		if(prePaymentInfoPo.getPaymentPerson()!=null){
			    			DriverInfo driver = driverInfoFacade.findInternalDriverById(prePaymentInfoPo.getPaymentCompany());
			    			if(driver!=null){
			    				prePaymentInfoPo.setPaymentPersonName(driver.getDriverName());
			    			}
			    		}
			    		
			    		
			    		//封装组织部门
			    		if(prePaymentInfoPo.getProjectInfoId()!=null){
			    			List<Integer> projectInfoIds=new ArrayList<Integer>();
			    			projectInfoIds.add(prePaymentInfoPo.getProjectInfoId());
			    			List<ProjectInfoPo> projectInfoPos = projectInfoFacade.findProjectInfoPoByIds(projectInfoIds);
			    			if(CollectionUtils.isNotEmpty(projectInfoPos)){
			    				for (ProjectInfoPo pip : projectInfoPos) {
			    					prePaymentInfoPo.setProjectInfoName(pip.getProjectName());
								}
			    			}
			    		}
			    		
			    		//封装货物
			    		if(prePaymentInfoPo.getGoodsInfoId()!=null){
			    			List<Integer> goodsInfoIds=new ArrayList<Integer>();
			    			goodsInfoIds.add(prePaymentInfoPo.getGoodsInfoId());
			    			List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
			    			if(CollectionUtils.isNotEmpty(goodsInfos)){
			    				for (GoodsInfo gi : goodsInfos) {
			    					prePaymentInfoPo.setGoodsName(gi.getGoodsName());
								}
			    			}
			    		}
			    		
			    		//封装客户编号
			    		if(prePaymentInfoPo.getCustomerId()!=null){
			    			List<Integer> orgInfoIds=new ArrayList<Integer>();
			    			orgInfoIds.add(prePaymentInfoPo.getCustomerId());
			    			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			    			if(CollectionUtils.isNotEmpty(orgInfoPos)){
			    				for (OrgInfoPo oi : orgInfoPos) {
			    					prePaymentInfoPo.setCustomerName(oi.getOrgName());
								}
			    			}
			    		}
			    		
			    		//封装代理人
			    		if(prePaymentInfoPo.getProxyPerson()!=null){
			    			List<Integer> proxyInfoIds=new ArrayList<Integer>();
			    			proxyInfoIds.add(prePaymentInfoPo.getProxyPerson());
			    			Map<String, Object> proxyParams=new HashMap<String,Object>();
			    			proxyParams.put("list", proxyInfoIds);
			    			List<ProxyInfoPo> proxyInfoPos = proxyInfoPoFacade.findProxyInfoPoByIds(proxyParams);
			    			if(CollectionUtils.isNotEmpty(proxyInfoPos)){
			    				for (ProxyInfoPo pi : proxyInfoPos) {
			    					prePaymentInfoPo.setProxyPersonName(pi.getProxyName());
								}
			    			}
			    		}
			    		
			    	}
			    	model.addAttribute("prePaymentInfoPo", prePaymentInfoPo);
			    	return "template/paymentManagement/update_pre_payment_info_page";
			    }else if(sign==3){
			    	String addPaymentPage="新增付款信息";
			    	model.addAttribute("addPaymentPage", addPaymentPage);
			    	return "template/paymentManagement/add_payment_info_page";
			    }else if(sign==4){
			    	String updatePaymentPage="修改付款信息";
			    	model.addAttribute("updatePaymentPage", updatePaymentPage);
			    	
			    	//接收页面操作付款ID
			    	String PMids=request.getParameter("paymentId");
			    	model.addAttribute("PMids", PMids);
			    	
			    	//从session中获取登录用户主机构ID
			    	UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
			    	Integer uOrgRootId=userInfo.getOrgRootId();
			    	Integer id=Integer.parseInt(PMids);
			    	//根据主机构ID和付款ID查询付款信息
			    	Map<String, Object> params=new HashMap<String,Object>();
			    	params.put("id", id);
			    	params.put("orgRootId", uOrgRootId);
			    	
			    	PaymentInfoPo paymentInfoPo = paymentInfoFacade.findPaymentInfoMationById(params);
			    	
			    	//判断选择的是结算付款单还是对账付款单
			    	//先根据选择的付款id查询付款对账明细信息，判断是否有数据
			    	String accIds="";
			    	String settIds="";
			    	List<PaymentAccountDetailInfoPo> paymentAccountDetailInfoPoList=paymentAccountDetailInfoPoFacade.findPaymentAccDetailMationByPaymentId(id);
			    	for (PaymentAccountDetailInfoPo paymentAccountDetailInfoPo : paymentAccountDetailInfoPoList) {
			    		accIds+=paymentAccountDetailInfoPo.getAccountInfoId().toString()+",";
					}
			    	List<PaymentDetailInfoPo> paymentDetailInfoPoList=paymentDetailInfoPoFacade.findPayMentDetailMationByPaymentId(id);
			    	for (PaymentDetailInfoPo paymentDetailInfoPo : paymentDetailInfoPoList) {
	    				settIds+=paymentDetailInfoPo.getSettlementInfoInfoId().toString()+",";
					}
			    	//判断是对账信息还是结算信息
			    	if(paymentDetailInfoPoList.size()>0){
			    		paymentInfoPo.setSettlementId(paymentDetailInfoPoList.get(0).getSettlementId());
			    		paymentInfoPo.setSettlementInfoInfoIds(settIds.substring(0, settIds.length()-1));

			    		//根据结算ID查询结算信息
				    	/*SettlementInfo settlementInfo=settlementLossesService.findSettlementInfoMationById(paymentInfoPo.getSettlementInfoInfoId());*/

				    	//封装支付人
				    	if(paymentInfoPo.getPaymentPerson()!=null){
				    		//根据支付人查询司机表司机姓名
				    		List<Integer> userInfoIds=new ArrayList<Integer>();
				    		userInfoIds.add(paymentInfoPo.getPaymentPerson());
				    		List<DriverInfo> driverByUserInfoIds = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
				    		if(CollectionUtils.isNotEmpty(driverByUserInfoIds)){
				    			for (DriverInfo driverInfo : driverByUserInfoIds) {
									paymentInfoPo.setPaymentPersonName(driverInfo.getDriverName());
								}
				    		}
				    	}
				    	
				    	//封装支付单位
				    	
				    	if(paymentInfoPo.getPaymentCompany()!=null){
				    		List<Integer> orgInfoIds=new ArrayList<Integer>();
				    		orgInfoIds.add(paymentInfoPo.getPaymentCompany());
				    		List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
				    		if(CollectionUtils.isNotEmpty(orgInfoPos)){
				    			for (OrgInfoPo orgInfoPo : orgInfoPos) {
									paymentInfoPo.setPaymentCompanyName(orgInfoPo.getOrgName());
								}
				    		}
				    	}
				    	
				    	 
				    	 //封装代理人
				    	 if(paymentInfoPo.getProxyPerson()!=null){
				    		 List<Integer> list=new ArrayList<Integer>();
				    		list.add(paymentInfoPo.getProxyPerson());
				    		Map<String, Object> queryMap=new HashMap<String,Object>();
				    		queryMap.put("list", list);
				    		List<ProxyInfoPo> proxyInfoPos = proxyInfoPoFacade.findProxyInfoPoByIds(queryMap);
				    		if(CollectionUtils.isNotEmpty(proxyInfoPos)){
				    			for (ProxyInfoPo proxyInfoPo : proxyInfoPos) {
				    				paymentInfoPo.setProxyPersonName(proxyInfoPo.getProxyName());
								}
				    		}
				    	 }
				    	 paymentInfoPo.setSettOrAcc("1");
			    	}else if(paymentAccountDetailInfoPoList.size()>0){
			    		paymentInfoPo.setSettlementId(paymentAccountDetailInfoPoList.get(0).getSettlementId());
			    		 //对账信息
		    			 paymentInfoPo.setSettOrAcc("2");
		    			 //封装支付单位
		    			 List<Integer> orgIds=new ArrayList<Integer>();
		    			 orgIds.add(paymentInfoPo.getPaymentCompany());
		    			 List<OrgInfoPo> orgs = orgInfoFacade.findOrgNameByIds(orgIds);
		    			 if(CollectionUtils.isNotEmpty(orgs)){
		    				 for (OrgInfoPo orgInfoPo : orgs) {
								paymentInfoPo.setPaymentCompanyName(orgInfoPo.getOrgName());
							}
		    			 }
			    			 
			    		paymentInfoPo.setAccountCheckInfoIds(accIds.substring(0, accIds.length()-1));
			    		
			    	}
			    	 model.addAttribute("paymentInfoPo", paymentInfoPo);
			    	 
			    	return "template/paymentManagement/update_payment_info_page";
			    }
		}
	   
		return null;
	}
	
	/**
	 * @author zhangshuai  2017年7月6日 下午8:43:25
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 添加时进入选择运单信息
	 */
	@RequestMapping(value="/goFindWaybillInfoModel",produces="application/json;charset=utf-8")
	public String goFindWaybillInfoModel(HttpServletRequest request,HttpServletResponse response,Model model){
		String findWayBillInfo="选择运单信息";
		model.addAttribute("findWayBillInfo", findWayBillInfo);
		return "template/paymentManagement/find_waybill_info_mation";
	}
	
	/**
	 * @author zhangshuai  2017年7月7日 上午10:32:58
	 * @param request
	 * @param response
	 * @return
	 * 进入选择运单信息时全查运单
	 */
	@RequestMapping(value="/selectWaybillInfoAllMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<WaybillInfoPo> selectWaybillInfoAllMation(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=null;
		Integer userRole=userInfo.getUserRole();
		//企业货主   物流公司
		if(userRole==1 || userRole==2){
			uOrgRootId=userInfo.getOrgRootId();
		}else 
			//个体货主   司机
			if(userRole==3 || userRole==4){
			uOrgRootId=userInfo.getId();
		}
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		
		List<Integer> waybillInfoIds=new ArrayList<Integer>();
		if(userRole==1 || userRole==2){
			//根据登录用户主机构ID和登录用户ID查询用户权限表条件组字段
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("uId", uId);
			params.put("uOrgRootId", uOrgRootId);
			List<UserDataAuthPo> userDataAuthPoList = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params);
			List<String> conditionGroups=CommonUtils.getValueList(userDataAuthPoList, "conditionGroup");
			//将条件组放入session
			request.getSession().setAttribute("userConditionGroupList", conditionGroups);
			Map<String, Object> conditonParams=new HashMap<String,Object>();
			conditonParams.put("shipperOrgRoot",uOrgRootId);
			conditonParams.put("conditionGroups", conditionGroups);
			
			
			if(MapUtils.isNotEmpty(conditonParams)){
				//根据主机构ID和条件组查询运单信息
				List<WaybillInfoPo> waybillInfoPoList=waybillInfoFacade.findWaybillInfoByOrgRootIdAndConditionGroup(conditonParams);
				if(CollectionUtils.isNotEmpty(waybillInfoPoList)){
					for (WaybillInfoPo waybillInfoPo : waybillInfoPoList) {
						waybillInfoIds.add(waybillInfoPo.getId());
					}
				}
				
			}
		}
		
		//根据运单编号和主机构id查询运单信息/主机构ID匹配委托方主机构ID、运单类型为零散货物运单
		Map<String, Object> idAndOrgRootIdParams=new HashMap<String,Object>();
		idAndOrgRootIdParams.put("orgRootId", uOrgRootId);
		idAndOrgRootIdParams.put("waybillInfoIds", waybillInfoIds);
		idAndOrgRootIdParams.put("entrustOrgRoot", uOrgRootId);
		idAndOrgRootIdParams.put("waybillClassify", 2);
		idAndOrgRootIdParams.put("start", start);
		idAndOrgRootIdParams.put("rows", rows);
		idAndOrgRootIdParams.put("userRole", userRole);
		
		List<WaybillInfoPo> waybillInfoList=waybillInfoFacade.findWaybillInfoByOrgRootIdAndConditionGroup(idAndOrgRootIdParams);
		//根据承运方查询名称
		Map<Integer, String> orgInfoMap=null;
		List<Integer> shipperIds=CommonUtils.getValueList(waybillInfoList, "shipper");
		if(CollectionUtils.isNotEmpty(shipperIds)){
			List<OrgInfoPo> orgInfoPos=orgInfoFacade.findOrgNameByIds(shipperIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				orgInfoMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		//根据货物查询名称
		Map<Integer, String> goodsInfoMap=null;
		List<Integer> goodsInfoIds=CommonUtils.getValueList(waybillInfoList, "goodsInfoId");
		if(CollectionUtils.isNotEmpty(goodsInfoIds)){
			List<GoodsInfo> goodsInfos=goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				goodsInfoMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}
		}
		/*//根据司机编号查询司机名称
		Map<Integer, String> driverInfoMap=null;
		List<Integer> driverIds=CommonUtils.getValueList(waybillInfoList, "userInfoId");
		if(CollectionUtils.isNotEmpty(driverIds)){
			List<DriverInfo> driverInfos=driverInfoFacade.findDriverByUserInfoIds(driverIds);
			if(CollectionUtils.isNotEmpty(driverInfos)){
				driverInfoMap=CommonUtils.listforMap(driverInfos, "userInfoId", "driverName");
			}
		}*/
		//根据委托方项目ID查询委托方项目名称
		Map<Integer, String> projectMap=null;
		List<Integer> projectIds=CommonUtils.getValueList(waybillInfoList, "entrustProject");
		if(CollectionUtils.isNotEmpty(projectIds)){
			List<ProjectInfoPo> projectInfos=projectInfoFacade.findProjectInfoPoByIds(projectIds);
			if(CollectionUtils.isNotEmpty(projectInfos)){
				projectMap=CommonUtils.listforMap(projectInfos, "id", "projectName");
			}
		}
		
		
		for(WaybillInfoPo way:waybillInfoList){
			
			//封装司机信息
			if(way.getUserInfoId()!=null){
				//判断司机角色信息
				//内部司机/外协司机
				if(way.getDriverUserRole()==1 || way.getDriverUserRole()==2){
					
					List<Integer> userInfoIds=new ArrayList<Integer>();
					userInfoIds.add(way.getUserInfoId());
					List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
					if(CollectionUtils.isNotEmpty(driverInfos)){
						for (DriverInfo driverInfo : driverInfos) {
							way.setDriverName(driverInfo.getDriverName());
						}
					}
					
				}else 
					//临时司机
					if(way.getDriverUserRole()==3){
					DriverInfo drInfo = driverInfoFacade.findInternalDriverById(way.getUserInfoId());
					if(drInfo!=null){
						way.setDriverName(drInfo.getDriverName());
					}
				}
			}
			
			//封装承运方名称
			if(MapUtils.isNotEmpty(orgInfoMap)&&orgInfoMap.get(way.getShipper())!=null){
				way.setShipperName(orgInfoMap.get(way.getShipper()));
			}
			
			//封装货物名称
			if(MapUtils.isNotEmpty(goodsInfoMap)&&goodsInfoMap.get(way.getGoodsInfoId())!=null){
				way.setGoodsName(goodsInfoMap.get(way.getGoodsInfoId()));
			}
			
			/*//封装司机名称
			if(MapUtils.isNotEmpty(driverInfoMap)&&driverInfoMap.get(way.getUserInfoId())!=null){
				way.setDriverName(driverInfoMap.get(way.getUserInfoId()));
			}*/
			
			//封装委托方项目名称
			if(MapUtils.isNotEmpty(projectMap)&&projectMap.get(way.getEntrustProject())!=null){
				way.setEntrustProjectName(projectMap.get(way.getEntrustProject()));
			}
			
			
		}
		return waybillInfoList;
	}
	
	/**
	 * @author zhangshuai  2017年7月8日 上午12:54:48
	 * @param request
	 * @param response
	 * @return
	 * 查询运单总数
	 */
	@RequestMapping(value="/getSelectWaybillInfoAllMationCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getSelectWaybillInfoAllMationCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=null;
		Integer userRole=userInfo.getUserRole();
		//企业货主   物流公司
		if(userRole==1 || userRole==2){
			uOrgRootId=userInfo.getOrgRootId();
		}else 
			//个体货主   司机
			if(userRole==3 || userRole==4){
				uOrgRootId=userInfo.getId();
		}
		
		List<Integer> waybillInfoIds=new ArrayList<Integer>();
		if(userRole==1 || userRole==2){
			//根据登录用户主机构ID和登录用户ID查询用户权限表条件组字段
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("uId", uId);
			params.put("uOrgRootId", uOrgRootId);
			List<UserDataAuthPo> userDataAuthPoList = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params);
			List<String> conditionGroups=CommonUtils.getValueList(userDataAuthPoList, "conditionGroup");
			//  key:主机构ID   value:条件组
			Map<String, Object> conditonParams=new HashMap<String,Object>();
			conditonParams.put("shipperOrgRoot",uOrgRootId);
			conditonParams.put("conditionGroups", conditionGroups);
			
			if(MapUtils.isNotEmpty(conditonParams)){
				//根据主机构ID和条件组查询运单信息
				List<WaybillInfoPo> waybillInfoPoList=waybillInfoFacade.findWaybillInfoByOrgRootIdAndConditionGroup(conditonParams);
				if(CollectionUtils.isNotEmpty(waybillInfoPoList)){
					for (WaybillInfoPo waybillInfoPo : waybillInfoPoList) {
						waybillInfoIds.add(waybillInfoPo.getId());
					}
				}
			}
		}
		
		//根据运单编号和主机构id查询运单信息/主机构ID匹配委托方主机构ID、运单类型为零散货物运单
		Map<String, Object> idAndOrgRootIdParams=new HashMap<String,Object>();
		idAndOrgRootIdParams.put("orgRootId", uOrgRootId);
		idAndOrgRootIdParams.put("waybillInfoIds", waybillInfoIds);
		idAndOrgRootIdParams.put("entrustOrgRoot", uOrgRootId);
		idAndOrgRootIdParams.put("waybillClassify", 2);
		idAndOrgRootIdParams.put("userRole", userRole);
		
		Integer count=waybillInfoFacade.getSelectWaybillInfoAllMationCount(idAndOrgRootIdParams);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年7月8日 下午12:09:22
	 * @param request
	 * @param response
	 * @return
	 * 根据运单ID查询运单信息
	 */
	@RequestMapping(value="/selectWaybillInfoAllMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public WaybillInfoPo selectWaybillInfoAllMationById(HttpServletRequest request,HttpServletResponse response){
		
		//接收页面运单ID
		Integer FWId=Integer.valueOf(request.getParameter("FWIds"));
		
		//根据运单ID查询运单信息
		WaybillInfoPo waybillInfoPo = waybillInfoFacade.findDistributeScatteredGoodsWaybillStatus(FWId);
		if(waybillInfoPo.getDriverUserRole()!=null && waybillInfoPo.getUserInfoId()!=null){
			//判断司机角色信息
			//内部司机/外协司机
			if(waybillInfoPo.getDriverUserRole()==1 || waybillInfoPo.getDriverUserRole()==2){
				//查询司机名称
				if(waybillInfoPo.getUserInfoId()!=null){
					List<Integer> userInfoIds=new ArrayList<Integer>();
					userInfoIds.add(waybillInfoPo.getUserInfoId());
					//根据司机编号查询司机名称
					List<DriverInfo> driverInfo = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
					if(CollectionUtils.isNotEmpty(driverInfo)){
						for (DriverInfo driverInfo2 : driverInfo) {
							if(CollectionUtils.isNotEmpty(driverInfo)){
								waybillInfoPo.setDriverName(driverInfo2.getDriverName());
							}
						}
					}
				}
			}else 
				//临时司机
				if(waybillInfoPo.getDriverUserRole()==3){
				DriverInfo driverInfo = driverInfoFacade.findInternalDriverById(waybillInfoPo.getUserInfoId());
				if(driverInfo!=null){
					waybillInfoPo.setDriverName(driverInfo.getDriverName());
				}
			}
		}
		
		
		//查询货物名称
		if(waybillInfoPo.getGoodsInfoId()!=null){
			List<Integer> goodsInfoIds=new ArrayList<Integer>();
			goodsInfoIds.add(waybillInfoPo.getGoodsInfoId());
			//根据货物ID查询货物名称
			List<GoodsInfo> goodsInfo = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
			if(CollectionUtils.isNotEmpty(goodsInfo)){
				for (GoodsInfo goodsInfo2 : goodsInfo) {
					if(goodsInfo2!=null){
						waybillInfoPo.setGoodsName(goodsInfo2.getGoodsName());
					}
				}
			}
		}
		
		//查询委托方项目名称
		if(waybillInfoPo.getEntrustProject()!=null){
			//根据委托方项目ID查询项目名称
			List<Integer> projectInfoIdList=new ArrayList<Integer>();
			projectInfoIdList.add(waybillInfoPo.getEntrustProject());
			List<ProjectInfoPo> projectInfoPo = projectInfoFacade.findProjectInfoPoByIds(projectInfoIdList);
			if(CollectionUtils.isNotEmpty(projectInfoPo)){
				for (ProjectInfoPo projectInfoPo2 : projectInfoPo) {
					if(projectInfoPo2!=null){
						waybillInfoPo.setEntrustProjectName(projectInfoPo2.getProjectName());
					}
				}
			}
		}
		//判断父运单编号是否为空
		if(waybillInfoPo.getParentWaybillInfoId()!=null){
			
			//从session中取出条件组信息
			@SuppressWarnings({ "unchecked" })
			List<String> conditionGroups=(List<String>) request.getSession().getAttribute("userConditionGroupList");
			//根据登录用户条件组和父运单编号查询运单信息表
			Map<String, Object> findWayByParentIdAndCGS=new HashMap<String, Object>();
			findWayByParentIdAndCGS.put("conditionGroups", conditionGroups);
			findWayByParentIdAndCGS.put("parentWaybillInfoId", waybillInfoPo.getParentWaybillInfoId());
			List<WaybillInfoPo> waybillInfoPos = waybillInfoFacade.findWaybillInfoByOrgRootIdAndConditionGroup(findWayByParentIdAndCGS);
			if(CollectionUtils.isNotEmpty(waybillInfoPos)){
				for (WaybillInfoPo waybillInfoPo2 : waybillInfoPos) {
					if(waybillInfoPo2.getEntrustUserRole()==null){
						//取出委托方,根据委托方查询组织机信息
						OrgInfoPo orgInfoPo = orgInfoFacade.findOrgInfoByIdId(waybillInfoPo2.getEntrust());
						//根据版本号和ID查询组织机构明细信息
						Map<String, Object> params=new HashMap<String,Object>();
						params.put("orgInfoId", orgInfoPo.getId());
						params.put("orgVersion", orgInfoPo.getCurrentVersion());
						OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params);
						if(orgDetailInfoPo!=null){
							waybillInfoPo.setEntrustName(orgDetailInfoPo.getOrgName());
						}
					}else 
					//判断委托方角色信息
					if(waybillInfoPo2.getEntrustUserRole()==3){
						//根据ID查询个体货主表
						IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerById(waybillInfoPo2.getEntrust());
						waybillInfoPo.setEntrustName(individualOwnerPo.getRealName());
					}else if(waybillInfoPo2.getEntrustUserRole()==1 || waybillInfoPo2.getEntrustUserRole()==2){
						//取出委托方,根据委托方查询组织机信息
						OrgInfoPo orgInfoPo = orgInfoFacade.findOrgInfoByIdId(waybillInfoPo2.getEntrust());
						//根据版本号和ID查询组织机构明细信息
						Map<String, Object> params=new HashMap<String,Object>();
						params.put("orgInfoId", orgInfoPo.getId());
						params.put("orgVersion", orgInfoPo.getCurrentVersion());
						OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params);
						if(orgDetailInfoPo!=null){
							waybillInfoPo.setEntrustName(orgDetailInfoPo.getOrgName());
						}
					}
				}
			}
		}else if(waybillInfoPo.getParentWaybillInfoId()==null){
			//取出委托方,根据委托方查询组织机信息
			OrgInfoPo orgInfoPo = orgInfoFacade.findOrgInfoByIdId(waybillInfoPo.getEntrust());
			//根据版本号和ID查询组织机构明细信息
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("orgInfoId", orgInfoPo.getId());
			params.put("orgVersion", orgInfoPo.getCurrentVersion());
			OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params);
			if(orgDetailInfoPo!=null){
				waybillInfoPo.setEntrustName(orgDetailInfoPo.getOrgName());
			}
			/*//判断委托方用户角色
			if(waybillInfoPo.getEntrustUserRole()==3){
				//根据ID查询个体货主表
				IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerById(waybillInfoPo.getEntrust());
				waybillInfoPo.setEntrustName(individualOwnerPo.getRealName());
			}else if(waybillInfoPo.getEntrustUserRole()==1 || waybillInfoPo.getEntrustUserRole()==2){
				//取出委托方,根据委托方查询组织机信息
				OrgInfoPo orgInfoPo = orgInfoFacade.findOrgInfoByIdId(waybillInfoPo.getEntrust());
				//根据版本号和ID查询组织机构明细信息
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("orgInfoId", orgInfoPo.getId());
				params.put("orgVersion", orgInfoPo.getCurrentVersion());
				OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params);
				if(orgDetailInfoPo!=null){
					waybillInfoPo.setEntrustName(orgDetailInfoPo.getOrgName());
				}
			}*/
		}
		return waybillInfoPo;
	}
	
	/**
	 * @author zhangshuai  2017年7月8日 下午3:40:12
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 当选择的运单数据司机编号不为空时进入选择代理人模态框
	 */
	@RequestMapping(value="/goFindProxyInfoModel",produces="application/json;charset=utf-8")
	public String goFindProxyInfoModel(HttpServletRequest request,HttpServletResponse response,Model model){
		String findProxyInfo="选择代理人信息";
		model.addAttribute("findProxyInfo", findProxyInfo);
		return "template/paymentManagement/find_proxy_info_mation";
	}
	
	/**
	 * @author zhangshuai  2017年7月8日 下午3:46:34
	 * @param request
	 * @param response
	 * @return
	 * 查询代理人信息
	 */
	@RequestMapping(value="/selectProxyInfoAllMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<ProxyInfoPo> selectProxyInfoAllMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//获取页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		String proxyName=request.getParameter("proxyName");
		String idCard=request.getParameter("idCard");
		String bankCount=request.getParameter("bankCount");
		String bankName=request.getParameter("bankName");
		//根据登录用户主机构ID查询代理人信息
		Map<String, Object> queryParams=new HashMap<String,Object>();
		queryParams.put("orgRootId", uOrgRootId);
		queryParams.put("start", start);
		queryParams.put("rows", rows);
		queryParams.put("proxyStatus", 3);
		queryParams.put("isAvailable", 1);
		queryParams.put("proxyName", proxyName);
		queryParams.put("idCard", idCard);
		queryParams.put("bankAccount", bankCount);
		queryParams.put("bankName", bankName);
		List<ProxyInfoPo> proxyInfoPoList = proxyInfoPoFacade.findProxyInfoPoForPage(queryParams);
		
		return proxyInfoPoList;
	}
	
	/**
	 * @author zhangshuai  2017年7月8日 下午3:58:31
	 * @param request
	 * @param response
	 * @return
	 * 查询代理人数量
	 */
	@RequestMapping(value="/getSelectProxyInfoAllMationCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getSelectProxyInfoAllMationCount(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		String proxyName=request.getParameter("proxyName");
		String idCard=request.getParameter("idCard");
		String bankCount=request.getParameter("bankCount");
		String bankName=request.getParameter("bankName");
		//根据登录用户主机构ID查询代理人数量
		Map<String, Object> queryParams=new HashMap<String,Object>();
		queryParams.put("orgRootId", uOrgRootId);
		queryParams.put("proxyStatus", 3);
		queryParams.put("isAvailable", 1);
		queryParams.put("proxyName", proxyName);
		queryParams.put("idCard", idCard);
		queryParams.put("bankCount", bankCount);
		queryParams.put("bankName", bankName);
		Integer count = proxyInfoPoFacade.countProxyInfoPoForPage(queryParams);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年7月8日 下午4:04:49
	 * @param request
	 * @param response
	 * @return
	 * 根据选择的代理方ID查询代理方信息
	 */
	@RequestMapping(value="/selectProxyInfoAllMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<ProxyInfoPo> selectProxyInfoAllMationById(HttpServletRequest request,HttpServletResponse response){
		
		//接收操作代理人ID
		Integer PIIds=Integer.valueOf(request.getParameter("PIIds"));
		//根据代理人ID查询代理信息
		List<Integer> list=new ArrayList<Integer>();
		list.add(PIIds);
		Map<String, Object> queryMap=new HashMap<String,Object>();
		queryMap.put("list", list);
		
		List<ProxyInfoPo> ProxyInfoPoList = proxyInfoPoFacade.findProxyInfoPoByIds(queryMap);
		return ProxyInfoPoList;
	}
	
	/**
	 * @author zhangshuai  2017年7月8日 下午4:44:34
	 * @param response
	 * @param request
	 * @return
	 * 当代理方为空时根据司机编号查询司机信息
	 */
	@RequestMapping(value="/selectDriverInfoMationByUserInfoId",produces="application/json;charset=utf-8")
	@ResponseBody
	public DriverInfo selectDriverInfoMationByUserInfoId(HttpServletResponse response,HttpServletRequest request){
		
		//接收司机编号(user_info_id)
		Integer userInfoId=Integer.parseInt(request.getParameter("userInfoId"));
		//接收运单司机角色信息(预付款时使用)
		Integer driverUserRole=null;
		if(request.getParameter("driverUserRole")!=null){
			driverUserRole=Integer.parseInt(request.getParameter("driverUserRole"));
		}
		DriverInfo driver=null;
		//判断司机角色
		if(driverUserRole!=null){
			//内部司机/外协司机
			if(driverUserRole==1 || driverUserRole==2){
				
				//根据user_info_id查询司机信息
				List<Integer> userInfoIds=new ArrayList<Integer>();
				userInfoIds.add(userInfoId);
				List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);	
				if(CollectionUtils.isNotEmpty(driverInfos)){
					for (DriverInfo driverInfo : driverInfos) {
						driver=driverInfo;
					}
				}
			}else 
				//临时司机
				if(driverUserRole==3){
					driver = driverInfoFacade.findInternalDriverById(userInfoId);
			}
		}else{
			//根据user_info_id查询司机信息
			List<Integer> userInfoIds=new ArrayList<Integer>();
			userInfoIds.add(userInfoId);
			List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);	
			if(CollectionUtils.isNotEmpty(driverInfos)){
				for (DriverInfo driverInfo : driverInfos) {
					driver=driverInfo;
				}
			}
		}
		
		return driver;
	}
	
	/**
	 * @author zhangshuai  2017年7月8日 下午5:44:24
	 * @param request
	 * @param response
	 * @return
	 * 当选择的司机编号为空时，查询组织机构信息
	 */
	@RequestMapping(value="/selectOrgInfoMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public OrgDetailInfoPo selectOrgInfoMationById(HttpServletRequest request,HttpServletResponse response){
		
		//接收页面承运方参数
		Integer shipper=null;
		if(request.getParameter("shipper")!=null && request.getParameter("shipper")!=""){
			shipper=Integer.parseInt(request.getParameter("shipper"));
		}
		//根据ID查询组织机构信息
		OrgInfoPo orgInfoPo = orgInfoFacade.findOrgInfoByIdId(shipper);
		OrgDetailInfoPo orgDetailInfoPo=null;
		if(orgInfoPo!=null){
			//根据ID和版本号查询组织机构明细信息
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("shipper", shipper);
			params.put("orgVersion", orgInfoPo.getCurrentVersion());
			orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params);
		}
		return orgDetailInfoPo;
	}
	
	/**
	 * @author zhangshuai  2017年7月8日 下午7:24:39
	 * @param request
	 * @param response
	 * @return
	 * 添加/修改付款信息
	 */
	@RequestMapping(value="/addOrUpdatePrePaymentInfoMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdatePrePaymentInfoMation(HttpServletRequest request,HttpServletResponse response,PrePaymentInfoModel prePaymentInfoModel){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=null;
		Integer userRole=userInfo.getUserRole();
		//企业货主  物流公司
		if(userRole==1 || userRole==2){
			uOrgRootId=userInfo.getOrgRootId();
		}else 
			//个体货主  司机
			if(userRole==3 || userRole==4){
			uOrgRootId=userInfo.getId();
		}
		jo=prePaymentInfoFacade.addOrUpdatePrePaymentInfoMation(prePaymentInfoModel,uId,uOrgRootId,userRole);
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年7月10日 上午11:59:50
	 * @param request
	 * @param response
	 * @return
	 * 根据预付款ID查询预付款信息
	 */
	@RequestMapping(value="/findPrePaymentStatusById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findPrePaymentStatusById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面操作预付款ID
		Integer PPIds=Integer.valueOf(request.getParameter("PPIds"));
		
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("orgRootId", uOrgRootId);
		params.put("id", PPIds);
		try {
			PrePaymentInfoPo prePaymentInfoPo=prePaymentInfoFacade.findPrePaymentStatusById(params);
			jo.put("success", true);
			jo.put("msg", prePaymentInfoPo.getPrePaymentStatus());
		} catch (Exception e) {
			log.error("查询预付款信息状态异常!",e);
			jo.put("success", false);
			jo.put("msg","预付款已提交审核或已审核！");
		}
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年7月10日 下午12:14:03
	 * @param request
	 * @param response
	 * @return
	 * 当预付款状态为起草/驳回时，根据主机构ID和预付款ID删除预付款信息
	 */
	@RequestMapping(value="/deletePrePaymentMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject deletePrePaymentMationById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面操作预付款ID
		Integer PPIds=Integer.valueOf(request.getParameter("PPIds"));
		
		//根据主机构ID和预付款信息ID删除预付款信息
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("id", PPIds);
		params.put("orgRootId", uOrgRootId);
		
		jo=prePaymentInfoFacade.deletePrePaymentMationById(params);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年7月10日 下午1:04:29
	 * @param response
	 * @param request
	 * @return
	 * 当预付款状态为起草/驳回时，可以根据预付款ID修改预付款状态为待审核
	 */
	@RequestMapping(value="/updatePrePaymentStatusById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject updatePrePaymentStatusById(HttpServletResponse response,HttpServletRequest request){
		JSONObject jo=new JSONObject();
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer uId=userInfo.getId();
		
		//获取操作预付款ID
		Integer PPIds=Integer.valueOf(request.getParameter("PPIds"));
		//状态
		Integer status=Integer.parseInt(request.getParameter("status"));
		//审核意见
		String auditOption=request.getParameter("auditOption");
		//根据主机构ID和预付款ID修改预付款状态
		jo=prePaymentInfoFacade.updatePrePaymentStatusById(PPIds,uOrgRootId,uId,status,auditOption);
		return jo;
	}
	
	/**==================付款====================*/
	
	/**
	 * @author zhangshuai  2017年7月10日 下午11:10:20
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 添加付款信息时进入选择结算信息模态框
	 */
	@RequestMapping(value="/goFindSettlementInfoMationPage",produces="application/json;charset=utf-8")
	public String goFindSettlementInfoMationPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String findSettlementInfo="选择结算信息";
		model.addAttribute("findSettlementInfo", findSettlementInfo);
		return "template/paymentManagement/find_settlement_info_mation";
	}
	
	/**
	 * @author zhangshuai  2017年7月10日 下午11:39:15
	 * @param request
	 * @param response
	 * @return
	 * 根据登录用户主机构ID和条件组或登录用户主机构ID和零散货物字段不为空，结算单状态为“审核通过”，是否挂账红冲为“否”的数据，
	 */
	@RequestMapping(value="/findSettlementInfoMationAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<SettlementInfo> findSettlementInfoMationAll(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer userRole=userInfo.getUserRole();
		Integer uOrgRootId=null;
		//企业货主     物流公司
		if(userRole==1 || userRole==2){
			uOrgRootId=userInfo.getOrgRootId();
		}else 
			//个体货主    司机
			if(userRole==3 || userRole==4){
			uOrgRootId=userInfo.getId();
		}
		
		
		//根据登录用户主机构ID和登录用户ID查询用户权限表条件组字段
		List<String> conditionGroups=null;
		if(userRole==1 || userRole==2){
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("uId", uId);
			params.put("uOrgRootId", uOrgRootId);
			List<UserDataAuthPo> userDataAuthPoList = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params);
			if(CollectionUtils.isNotEmpty(userDataAuthPoList)){
				conditionGroups=CommonUtils.getValueList(userDataAuthPoList, "conditionGroup");
			}
		}
		//接收页面参数
		
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		String waybillId=request.getParameter("waybillId");
		String paymentObject=request.getParameter("paymentObject");
		String carCode=request.getParameter("carCode");
		String goodsName=request.getParameter("goodsName");
		String forwardingTime=request.getParameter("forwardingTime");
		String arriveTime=request.getParameter("arriveTime");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String forwardingTonnage=request.getParameter("forwardingTonnage");
		String arriveTonnage=request.getParameter("arriveTonnage");
		String incomeTax=request.getParameter("incomeTax");
		String transportPriceIncomeTax=request.getParameter("transportPriceIncomeTax");
		String transportPriceCost=request.getParameter("transportPriceCost");
		String couponIncomeTax=request.getParameter("couponIncomeTax");
		String advancePrice=request.getParameter("advancePrice");
		String otherPrice=request.getParameter("otherPrice");
		String lossDeduction=request.getParameter("lossDeduction");
		String makeTimeStart=request.getParameter("makeTimeStart");
		String makeTimeEnd=request.getParameter("makeTimeEnd");
		String settlementId=request.getParameter("settlementId");
		String proxyName=request.getParameter("proxyName");
		String projectInfoName=request.getParameter("projectInfoName");
		
		//根据登录用户主机构ID和条件组或登录用户主机构ID和零散货物字段不为空，结算单状态为“审核通过”，是否挂账红冲为“否”的数据，
		Map<String, Object> settParams=new HashMap<String,Object>();
		settParams.put("orgRootId", uOrgRootId);
		if(CollectionUtils.isNotEmpty(conditionGroups)){
			settParams.put("conditionGroupsList", conditionGroups);
		}
		settParams.put("userRole", userRole);//用户角色
		settParams.put("settlementStatus", 3);
		settParams.put("isWriteOff", 0);
		settParams.put("waybillId", waybillId);
		settParams.put("paymentObject", paymentObject);
		settParams.put("payPrice", BigDecimal.ZERO);
		settParams.put("rows", rows);
		settParams.put("start", start);
		settParams.put("carCode", carCode);
		settParams.put("goodsName", goodsName);
		settParams.put("forwardingTime", forwardingTime);
		settParams.put("arriveTime", arriveTime);
		settParams.put("forwardingUnit", forwardingUnit);
		settParams.put("consignee", consignee);
		settParams.put("forwardingTonnage", forwardingTonnage);
		settParams.put("arriveTonnage", arriveTonnage);
		settParams.put("incomeTax", incomeTax);
		settParams.put("transportPriceIncomeTax", transportPriceIncomeTax);
		settParams.put("transportPriceCost", transportPriceCost);
		settParams.put("couponIncomeTax", couponIncomeTax);
		settParams.put("advancePrice", advancePrice);
		settParams.put("otherPrice", otherPrice);
		settParams.put("lossDeduction", lossDeduction);
		settParams.put("makeTimeStart", makeTimeStart);
		settParams.put("makeTimeEnd", makeTimeEnd);
		settParams.put("settlementId", settlementId);
		settParams.put("proxyName", proxyName);
		settParams.put("projectInfoName", projectInfoName);
		List<SettlementInfo> settlementInfoList=settlementInfoFacade.findSettlementInfoMationAll(settParams);
		
		//根据货物查询货物名称
		List<Integer> goodsInfoIds=CommonUtils.getValueList(settlementInfoList, "goodsInfoId");
		//key:货物ID  value：货物名称
		Map<Integer, String> goodsInfoMap=null;
		if(CollectionUtils.isNotEmpty(goodsInfoIds)){
			List<GoodsInfo> goodsInfos=goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				goodsInfoMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}
		}
		
		//根据承运方查询名称
		List<Integer> shipperIds=CommonUtils.getValueList(settlementInfoList, "shipper");
		Map<Integer, String> orgMap=null;
		if(CollectionUtils.isNotEmpty(shipperIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(shipperIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				orgMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		
		//根据司机编号查询司机名称
		List<Integer> driverIds=CommonUtils.getValueList(settlementInfoList, "userInfoId");
		Map<Integer, String> driverMap=null;
		if(CollectionUtils.isNotEmpty(driverIds)){
			List<DriverInfo> driverInfos=driverInfoFacade.findDriverByUserInfoIds(driverIds);
			if(CollectionUtils.isNotEmpty(driverInfos)){
				driverMap=CommonUtils.listforMap(driverInfos, "userInfoId", "driverName");
			}
		}
		
		//根据代理人查询代理人名称
		List<Integer> proxyIds=CommonUtils.getValueList(settlementInfoList, "proxy");
		Map<Integer, String> proxyMap=null;
		/*if(CollectionUtils.isNotEmpty(proxyIds)){
			Map<String, Object> queryMap=new HashMap<String,Object>();
			queryMap.put("list", proxyIds);
			List<ProxyInfoPo> proxyInfoPos = proxyInfoPoFacade.findProxyInfoPoByIds(queryMap);
			if(CollectionUtils.isNotEmpty(proxyInfoPos)){
				proxyMap=CommonUtils.listforMap(proxyInfoPos, "id", "proxyName");
			}
		}*/
		if(CollectionUtils.isNotEmpty(proxyIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(proxyIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				proxyMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		//封装组织部门
		List<Integer> projectIds=CommonUtils.getValueList(settlementInfoList, "projectInfoId");
		//key:项目ID  value：项目名称
		Map<Integer, String> projectMap=null;
		if(CollectionUtils.isNotEmpty(projectIds)){
			List<ProjectInfoPo> projectInfoPos = projectInfoFacade.findProjectInfoPoByIds(projectIds);
			if(CollectionUtils.isNotEmpty(projectInfoPos)){
				projectMap=CommonUtils.listforMap(projectInfoPos, "id", "projectName");
			}
		}
		
		for (SettlementInfo settlementInfo : settlementInfoList) {
			
			/*//封装有价券名称
			if(settlementInfo.getCouponUseInfoId()!=null){
				//根据有价券领用信息ID查询有价券领用信息
				CouponUseInfo couponUseInfo = couponUseInfoFacade.selectCUInfoByCUId(settlementInfo.getCouponUseInfoId());
				settlementInfo.setCouponName(couponUseInfo.getCouponName());
				CouponInfoPo couPonInfoPo = couponInfoFacade.findCouponById(settlementInfo.getCouponUseInfoId());
				if(couPonInfoPo!=null){
					settlementInfo.setCouponName(couPonInfoPo.getCouponName());
				}
			}*/
			
			//封装组织部门
			if(MapUtils.isNotEmpty(projectMap)&&projectMap.get(settlementInfo.getProjectInfoId())!=null){
				settlementInfo.setProjectName(projectMap.get(settlementInfo.getProjectInfoId()));
			}
			
			//封装货物
			if(MapUtils.isNotEmpty(goodsInfoMap)&&goodsInfoMap.get(settlementInfo.getGoodsInfoId())!=null){
				settlementInfo.setGoodsName(goodsInfoMap.get(settlementInfo.getGoodsInfoId()));
			}
			
			//封装线路
			 if(settlementInfo.getScatteredGoods()!=null && !"".equals(settlementInfo.getScatteredGoods())){
				 //根据线路查询地点表省/市/县
	    		 List<Integer> list=new ArrayList<Integer>();
	    		 list.add(settlementInfo.getLineInfoId());
	    		 List<LocationInfoPo> findLocations = locationInfoFacade.findLocationNameByIds(list);
	    		 if(CollectionUtils.isNotEmpty(findLocations)){
	    			 for (LocationInfoPo locationInfoPo : findLocations) {
	    				 settlementInfo.setLineName(locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty());
					}
	    		 }
	    	 }else if(settlementInfo.getScatteredGoods()==null || "".equals(settlementInfo.getScatteredGoods())){
	    		 //根据线路查询线路表
	    		 List<Integer> lineInfoIds=new ArrayList<Integer>();
	    		 lineInfoIds.add(settlementInfo.getLineInfoId());
	    		 List<LineInfoPo> lineInfos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
	    		 if(CollectionUtils.isNotEmpty(lineInfos)){
	    			 for (LineInfoPo lineInfoPo : lineInfos) {
	    				/* //根据线路起点查询 地点表
	    				 String startLineName=null;
	    				 List<Integer> list=new ArrayList<Integer>();
	    	    		 list.add(Integer.parseInt(lineInfoPo.getStartPoints()));
	    	    		 List<LocationInfoPo> findLocations = locationInfoFacade.findLocationNameByIds(list);
	    	    		 if(CollectionUtils.isNotEmpty(findLocations)){
	    	    			 for (LocationInfoPo locationInfoPo : findLocations) {
	    	    				 startLineName=locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty();
	    					}
	    	    		 }
	    	    		//根据线路终点查询 地点表
	    				 String endLineName=null;
	    				 List<Integer> endLinelist=new ArrayList<Integer>();
	    				 endLinelist.add(Integer.parseInt(lineInfoPo.getEndPoints()));
	    	    		 List<LocationInfoPo> findEndLocations = locationInfoFacade.findLocationNameByIds(endLinelist);
	    	    		 if(CollectionUtils.isNotEmpty(findEndLocations)){
	    	    			 for (LocationInfoPo locationInfoPo : findEndLocations) {
	    	    				 endLineName=locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty();
	    					}
	    	    		 }*/
	    				 settlementInfo.setLineName(lineInfoPo.getLineName());
					}
	    		 }
	    	 }
			
			
			//封装承运方
			if(MapUtils.isNotEmpty(orgMap)&&orgMap.get(settlementInfo.getShipper())!=null){
				settlementInfo.setShipperName(orgMap.get(settlementInfo.getShipper()));
			}
			//封装司机名称
			if(MapUtils.isNotEmpty(driverMap)&&driverMap.get(settlementInfo.getUserInfoId())!=null){
				settlementInfo.setDriverName(driverMap.get(settlementInfo.getUserInfoId()));
			}
			//封装代理人名称
			if(MapUtils.isNotEmpty(proxyMap)&&proxyMap.get(settlementInfo.getProxy())!=null){
				settlementInfo.setProxyName(proxyMap.get(settlementInfo.getProxy()));
			}
			if(settlementInfo.getForwardingTime()!=null){
				settlementInfo.setForwardingTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(settlementInfo.getForwardingTime()));

			}
			if(settlementInfo.getArriveTime()!=null){
				settlementInfo.setArriveTimeStr(new SimpleDateFormat("yyy-MM-dd").format(settlementInfo.getArriveTime()));

			}
		}
		return settlementInfoList;
	}
	
	/**
	 * @author zhangshuai  2017年7月11日 上午11:32:56
	 * @param request
	 * @param response
	 * @return
	 * 根据登录用户主机构ID和条件组或登录用户主机构ID和零散货物字段不为空，结算单状态为“审核通过”，是否挂账红冲为“否”的数据总数
	 */
	@RequestMapping(value="/getSettlementInfoMationAllCount",produces="application/json;chasret=utf-8")
	@ResponseBody
	public Integer getSettlementInfoMationAllCount(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();//用户角色
		Integer uOrgRootId=null;//主机构ID
		Integer uId=userInfo.getId();//用户ID
		//企业货主    物流公司
		if(userRole==1 || userRole==2){
			uOrgRootId=userInfo.getOrgRootId();//主机构ID=主机构ID
		}else 
			//个体货主   司机
			if(userRole==3 || userRole==4){
			uOrgRootId=userInfo.getId();//主机构ID=ID
		}
		
		//接收模糊条件
		String waybillId=request.getParameter("waybillId");
		String paymentObject=request.getParameter("paymentObject");
		String carCode=request.getParameter("carCode");
		String goodsName=request.getParameter("goodsName");
		String forwardingTime=request.getParameter("forwardingTime");
		String arriveTime=request.getParameter("arriveTime");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String forwardingTonnage=request.getParameter("forwardingTonnage");
		String arriveTonnage=request.getParameter("arriveTonnage");
		String incomeTax=request.getParameter("incomeTax");
		String transportPriceIncomeTax=request.getParameter("transportPriceIncomeTax");
		String transportPriceCost=request.getParameter("transportPriceCost");
		String couponIncomeTax=request.getParameter("couponIncomeTax");
		String advancePrice=request.getParameter("advancePrice");
		String otherPrice=request.getParameter("otherPrice");
		String lossDeduction=request.getParameter("lossDeduction");
		String makeTimeStart=request.getParameter("makeTimeStart");
		String makeTimeEnd=request.getParameter("makeTimeEnd");
		String settlementId=request.getParameter("settlementId");
		String proxyName=request.getParameter("proxyName");
		String projectInfoName=request.getParameter("projectInfoName");
		
		//根据登录用户主机构ID和登录用户ID查询用户权限表条件组字段
		List<String> conditionGroups=null;
		if(userRole==1 || userRole==2){
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("uId", uId);
			params.put("uOrgRootId", uOrgRootId);
			List<UserDataAuthPo> userDataAuthPoList = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params);
			if(CollectionUtils.isNotEmpty(userDataAuthPoList)){
				conditionGroups=CommonUtils.getValueList(userDataAuthPoList, "conditionGroup");
			}
		}
		
		//根据登录用户主机构ID和条件组或登录用户主机构ID和零散货物字段不为空，结算单状态为“审核通过”，是否挂账红冲为“否”的数据，
		Map<String, Object> settParams=new HashMap<String,Object>();
		settParams.put("orgRootId", uOrgRootId);
		if(CollectionUtils.isNotEmpty(conditionGroups)){
			settParams.put("conditionGroupsList", conditionGroups);
		}
		settParams.put("userRole", userRole);//用户角色
		settParams.put("settlementStatus", 3);
		settParams.put("paymentObject", paymentObject);
		settParams.put("payPrice", BigDecimal.ZERO);
		settParams.put("isWriteOff", 0);
		settParams.put("waybillId", waybillId);
		settParams.put("carCode", carCode);
		settParams.put("goodsName", goodsName);
		settParams.put("forwardingTime", forwardingTime);
		settParams.put("arriveTime", arriveTime);
		settParams.put("forwardingUnit", forwardingUnit);
		settParams.put("consignee", consignee);
		settParams.put("forwardingTonnage", forwardingTonnage);
		settParams.put("arriveTonnage", arriveTonnage);
		settParams.put("incomeTax", incomeTax);
		settParams.put("transportPriceIncomeTax", transportPriceIncomeTax);
		settParams.put("transportPriceCost", transportPriceCost);
		settParams.put("couponIncomeTax", couponIncomeTax);
		settParams.put("advancePrice", advancePrice);
		settParams.put("otherPrice", otherPrice);
		settParams.put("lossDeduction", lossDeduction);
		settParams.put("makeTimeStart", makeTimeStart);
		settParams.put("makeTimeEnd", makeTimeEnd);
		settParams.put("settlementId", settlementId);
		settParams.put("proxyName", proxyName);
		settParams.put("projectInfoName", projectInfoName);
		Integer count=settlementInfoFacade.getSettlementInfoMationAllCount(settParams);
		return count;
	}
	
	/** 
	* @方法名: findSettlementInfoMationShipperAndDriverAndProxy 
	* @作者: zhangshuai
	* @时间: 2017年10月17日 下午12:18:28
	* @返回值类型: JSONObject 
	* @throws 
	* 选择结算单的时候查询选择的承运方、代理方、司机编号是否一样
	*/
	@RequestMapping(value="/findSettlementInfoMationShipperAndDriverAndProxy")
	@ResponseBody
	public JSONObject findSettlementInfoMationShipperAndDriverAndProxy(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//接收页面参数(操作结算单ID)
		String SSIds=request.getParameter("SIIds");
		List<Integer> settIds=new ArrayList<Integer>();
		if(StringUtils.isNotEmpty(request.getParameter("SIIds"))){
			String setts=request.getParameter("SIIds").trim();
			String[] settIdsArrays=setts.split(",");
			if(settIdsArrays.length>0){
				for (String id : settIdsArrays) {
					settIds.add(Integer.parseInt(id));
				}
			}
		}
		
		//根据选择的结算id批量查询结算单信息
		List<SettlementInfo> settlementInfos = settlementInfoFacade.findSettlementInfoByIds(settIds);
		
		
		
		//判断选择的结算单的数据是否属于同一个数据信息
		//判断代理方
		Set<Integer> proxySet=new HashSet<Integer>();
		
		if(CollectionUtils.isNotEmpty(settlementInfos)){
			for (SettlementInfo settlementInfo2 : settlementInfos) {
				
				//if(settlementInfo2.getProxy()!=null && !"".equals(settlementInfo2.getProxy())){
					proxySet.add(settlementInfo2.getProxy());
				//}
				
			}
		}
		
		if(proxySet.size()>1){
			jo.put("success", false);
			jo.put("msg", "请选择相同代理方的结算数据!");
			return jo;
		}
		
		jo.put("success", true);
		jo.put("msg", "ok");
		
		return jo;
		
	}
	
	/**
	 * @author zhangshuai  2017年7月11日 上午11:58:26
	 * @param request
	 * @param response
	 * @return
	 * 根据选择的结算单ID查询结算单信息
	 */
	@RequestMapping(value="/findSettlementInfoMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public SettlementInfo findSettlementInfoMationById(HttpServletRequest request,HttpServletResponse response){
		
		//接收页面参数(操作结算单ID)
		//Integer SSIds=Integer.valueOf(request.getParameter("SIIds"));
		List<Integer> settIds=new ArrayList<Integer>();
		if(StringUtils.isNotEmpty(request.getParameter("SIIds"))){
			String setts=request.getParameter("SIIds").trim();
			String[] settIdsArrays=setts.split(",");
			if(settIdsArrays.length>0){
				for (String id : settIdsArrays) {
					settIds.add(Integer.parseInt(id));
				}
			}
		}
		
		SettlementInfo settlementInfo=new SettlementInfo();
		
		 
	     BigDecimal forwardingTonnageSum=BigDecimal.ZERO;  //发货吨位总和
	     BigDecimal arriveTonnageSum=BigDecimal.ZERO;  //到货吨位
	     BigDecimal driverInvoiceTax=BigDecimal.ZERO;  //司机发票税金
	     BigDecimal singleCarInsuranceSum=BigDecimal.ZERO; //单车保险总和
	     BigDecimal costPriceSum=BigDecimal.ZERO; //工本费总和
	     BigDecimal otherPriceSum=BigDecimal.ZERO; //其他扣款
	     BigDecimal couponUseTotalPriceSum=BigDecimal.ZERO;  //有价券金额总和
	     BigDecimal couponIncomeTaxSum=BigDecimal.ZERO;  //有价券进项税总和
	     BigDecimal transportPriceCostSum=BigDecimal.ZERO; //运费成本总和
	     BigDecimal transportPriceIncomeTaxSum=BigDecimal.ZERO;  //运费进项税总和
	     BigDecimal incomeTaxSum=BigDecimal.ZERO;  //进项税总和
	     BigDecimal payablePriceSum=BigDecimal.ZERO;  //应付费用总和
	     BigDecimal proxyInvoiceTotalSum=BigDecimal.ZERO;  //代开总额之和
	     BigDecimal thisPayPriceSum=BigDecimal.ZERO;  //本次付款之和
	     
		//根据选择的结算id批量查询结算单信息
		List<SettlementInfo> settlementInfos = settlementInfoFacade.findSettlementInfoByIds(settIds);
		
		//判断选择的结算单的数据是否属于同一个数据信息
		//1、判断司机编号
		Set<Integer> driverIdSet=new HashSet<Integer>();
		//2、判断承运方
		Set<Integer> shipperSet=new HashSet<Integer>();
		//3、判断代理方
		Set<Integer> proxySet=new HashSet<Integer>();
		
		if(CollectionUtils.isNotEmpty(settlementInfos)){
			for (SettlementInfo settlementInfo2 : settlementInfos) {
				
				//发货吨位相加
				forwardingTonnageSum=forwardingTonnageSum.add(settlementInfo2.getForwardingTonnage());
				//到货吨位相加
				arriveTonnageSum=arriveTonnageSum.add(settlementInfo2.getArriveTonnage());
				//代开总额之和
				proxyInvoiceTotalSum=proxyInvoiceTotalSum.add(settlementInfo2.getProxyInvoiceTotal());
				//单车保险之和
				singleCarInsuranceSum=singleCarInsuranceSum.add(settlementInfo2.getSingleCarInsurance());
				//工本费之和
				costPriceSum=costPriceSum.add(settlementInfo2.getCostPrice());
				//其他扣款之和
				otherPriceSum=otherPriceSum.add(settlementInfo2.getOtherPrice());
				//有价券金额之和
				couponUseTotalPriceSum=couponUseTotalPriceSum.add(settlementInfo2.getCouponUseTotalPrice());
				//有价券进项税总和
				couponIncomeTaxSum=couponIncomeTaxSum.add(settlementInfo2.getCouponIncomeTax());
				//运费成本总和
				transportPriceCostSum=transportPriceCostSum.add(settlementInfo2.getTransportPriceCost());
				//运费进项税总和
				transportPriceIncomeTaxSum=transportPriceIncomeTaxSum.add(settlementInfo2.getTransportPriceIncomeTax());
				//进项税总和
				incomeTaxSum=incomeTaxSum.add(settlementInfo2.getIncomeTax());
				//应付费用总和
				payablePriceSum=payablePriceSum.add(settlementInfo2.getPayablePrice());
				//本次付款总和
				thisPayPriceSum=thisPayPriceSum.add(settlementInfo2.getThisPayPrice());
				
				if(settlementInfo2.getUserInfoId()!=null && !"".equals(settlementInfo2.getUserInfoId())){
					driverIdSet.add(settlementInfo2.getUserInfoId());
				}
				
				if(settlementInfo2.getShipper()!=null && !"".equals(settlementInfo2.getShipper())){
					shipperSet.add(settlementInfo2.getShipper());
				}
				
				if(settlementInfo2.getProxy()!=null && !"".equals(settlementInfo2.getProxy())){
					proxySet.add(settlementInfo2.getProxy());
				}
				
			}
		}

		//司机发票税金=代开总额之和-应付运费之和
		driverInvoiceTax=proxyInvoiceTotalSum.subtract(payablePriceSum);
		settlementInfo.setSettlementId(settlementInfos.get(0).getSettlementId());
		settlementInfo.setForwardingTonnageSum(forwardingTonnageSum); //发货吨位总和
		settlementInfo.setArriveTonnageSum(arriveTonnageSum);  //到货吨位之和
		settlementInfo.setProxyInvoiceTotalSum(proxyInvoiceTotalSum);  //代开总额之和
		settlementInfo.setSingleCarInsuranceSum(singleCarInsuranceSum); //单车保险之和
		settlementInfo.setCostPriceSum(costPriceSum); //工本费之和
		settlementInfo.setOtherPriceSum(otherPriceSum); //其他扣款之和
		settlementInfo.setCouponUseTotalPriceSum(couponUseTotalPriceSum); //有价券金额之和
		settlementInfo.setCouponIncomeTaxSum(couponIncomeTaxSum); //有价券进项税之和
		settlementInfo.setTransportPriceCostSum(transportPriceCostSum); //运费成本之和
		settlementInfo.setTransportPriceIncomeTaxSum(transportPriceIncomeTaxSum); //运费进项税之和
		settlementInfo.setIncomeTaxSum(incomeTaxSum); //进项税之和
		settlementInfo.setPayablePriceSum(payablePriceSum); //应付运费总和
		settlementInfo.setThisPayPriceSum(thisPayPriceSum); //本次付款总和
		settlementInfo.setDriverInvoiceTax(driverInvoiceTax); //司机发票税金
		if(driverIdSet.size()>0){
			for (Integer driverId : driverIdSet) {
				settlementInfo.setUserInfoId(driverId);
			}
		}
		if(shipperSet.size()>0){
			for (Integer shipper : shipperSet) {
				settlementInfo.setShipper(shipper);
			}
		}
		if(proxySet.size()>0){
			for (Integer proxy : proxySet) {
				settlementInfo.setProxy(proxy);
			}
		}
		
		//封装司机编号
		if(settlementInfo.getUserInfoId()!=null){
			List<Integer> userInfoIds=new ArrayList<Integer>();
			userInfoIds.add(settlementInfo.getUserInfoId());
			List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
			if(CollectionUtils.isNotEmpty(driverInfos)){
				for (DriverInfo driverInfo : driverInfos) {
					settlementInfo.setDriverName(driverInfo.getDriverName());
				}
			}
		}
		
		//封装承运方名称
		if(settlementInfo.getShipper()!=null){
			List<Integer> orgIds=new ArrayList<Integer>();
			orgIds.add(settlementInfo.getShipper());
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					settlementInfo.setShipperName(orgInfoPo.getOrgName());
				}
			}
		}
		
		//封装代理方名称
		if(settlementInfo.getProxy()!=null){
			List<Integer> proxyIds=new ArrayList<Integer>();
			Map<String, Object> queryMap=new HashMap<String,Object>();
			queryMap.put("list", proxyIds);
			List<ProxyInfoPo> proxyInfoPos = proxyInfoPoFacade.findProxyInfoPoByIds(queryMap);
			if(CollectionUtils.isNotEmpty(proxyInfoPos)){
				for (ProxyInfoPo proxyInfoPo : proxyInfoPos) {
					settlementInfo.setProxyName(proxyInfoPo.getProxyName());
				}
			}
		}
		
		/*//根据结算单ID查询结算单信息
		SettlementInfo settlementInfo=settlementInfoFacade.findSettlementInfoMationById(SSIds);
		//封装司机编号
		if(settlementInfo.getUserInfoId()!=null){
			List<Integer> userInfoIds=new ArrayList<Integer>();
			userInfoIds.add(settlementInfo.getUserInfoId());
			List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
			if(CollectionUtils.isNotEmpty(driverInfos)){
				for (DriverInfo driverInfo : driverInfos) {
					settlementInfo.setDriverName(driverInfo.getDriverName());
				}
			}
		}
		
		//封装代理方名称
		if(settlementInfo.getProxy()!=null){
			List<Integer> proxyIds=new ArrayList<Integer>();
			Map<String, Object> queryMap=new HashMap<String,Object>();
			queryMap.put("list", proxyIds);
			List<ProxyInfoPo> proxyInfoPos = proxyInfoPoFacade.findProxyInfoPoByIds(queryMap);
			if(CollectionUtils.isNotEmpty(proxyInfoPos)){
				for (ProxyInfoPo proxyInfoPo : proxyInfoPos) {
					settlementInfo.setProxyName(proxyInfoPo.getProxyName());
				}
			}
		}
		
		//封装承运方名称
		if(settlementInfo.getShipper()!=null){
			List<Integer> orgIds=new ArrayList<Integer>();
			orgIds.add(settlementInfo.getShipper());
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					settlementInfo.setShipperName(orgInfoPo.getOrgName());
				}
			}
		}

		//封装组织部门名称
		if(settlementInfo.getProjectInfoId()!=null){
			List<Integer> projectInfoIds=new ArrayList<Integer>();
			projectInfoIds.add(settlementInfo.getProjectInfoId());
			List<ProjectInfoPo> projectInfoPos = projectInfoFacade.findProjectInfoPoByIds(projectInfoIds);
			if(CollectionUtils.isNotEmpty(projectInfoPos)){
				for (ProjectInfoPo projectInfoPo : projectInfoPos) {
					settlementInfo.setProjectName(projectInfoPo.getProjectName());
				}
			}
		}
		
		//封装货物名称
		if(settlementInfo.getGoodsInfoId()!=null){
			List<Integer> goodsIds=new ArrayList<Integer>();
			goodsIds.add(settlementInfo.getGoodsInfoId());
			List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				for (GoodsInfo goodsInfo : goodsInfos) {
					settlementInfo.setGoodsName(goodsInfo.getGoodsName());
				}
			}
		}
		
		//封装线路
		if(settlementInfo.getLineInfoId()!=null){
			//判断零散货物是否为空
			if(settlementInfo.getScatteredGoods()!=null && StringUtils.isNotEmpty(settlementInfo.getScatteredGoods())){
				//根据线路查询地点表省/市/县
	    		 List<Integer> list=new ArrayList<Integer>();
	    		 list.add(settlementInfo.getLineInfoId());
	    		 List<LocationInfoPo> findLocations = locationInfoFacade.findLocationNameByIds(list);
	    		 if(CollectionUtils.isNotEmpty(findLocations)){
	    			 for (LocationInfoPo locationInfoPo : findLocations) {
	    				 settlementInfo.setLineName(locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty());
					}
	    		 }
			}else if(settlementInfo.getScatteredGoods()==null || StringUtils.isBlank(settlementInfo.getScatteredGoods())){
				List<Integer> lineIds=new ArrayList<Integer>();
				lineIds.add(settlementInfo.getLineInfoId());
				List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineIds);
				if(CollectionUtils.isNotEmpty(lineInfoPos)){
					for (LineInfoPo lineInfoPo : lineInfoPos) {
						settlementInfo.setLineName(lineInfoPo.getLineName());
					}
				}
			}
		}
		
		//封装委托方名称
		if(settlementInfo.getEntrust()!=null){
			List<Integer> entrustIds=new ArrayList<Integer>();
			entrustIds.add(settlementInfo.getEntrust());
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(entrustIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					settlementInfo.setEntrustName(orgInfoPo.getOrgName());
				}
			}
		}
		
		settlementInfo.setForwardingTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(settlementInfo.getForwardingTime()));
		settlementInfo.setArriveTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(settlementInfo.getArriveTime()));*/
		/*return settlementInfo;*/
		return settlementInfo;
	}
	
	/**
	 * @author zhangshuai  2017年7月11日 下午1:39:33
	 * @param request
	 * @param response
	 * @return
	 * 当选择结算单数据结算类型为正常结算且父运单不为空，根据登录用户条件组和父运单编号查询运单信息
	 */
	@RequestMapping(value="/findwaybillInfoMationByConditionGroupAndParentWaybillInfoId",produces="application/json;charset=utf-8")
	@ResponseBody
	public WaybillInfoPo findwaybillInfoMationByConditionGroupAndParentWaybillInfoId(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		//根据登录用户主机构ID和登录用户ID查询用户权限表条件组字段
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("uId", uId);
		params.put("uOrgRootId", uOrgRootId);
		List<UserDataAuthPo> userDataAuthPoList = userDataAuthFacade.findUserDataAuthByUidAndUorgRootId(params);
		List<String> conditionGroups=CommonUtils.getValueList(userDataAuthPoList, "conditionGroup");
		
		//接收页面参数
		Integer parentWaybillInfoId=null;
		if(request.getParameter("parentWaybillInfoId")!=null){
			parentWaybillInfoId=Integer.parseInt(request.getParameter("parentWaybillInfoId"));
		}
		Integer status=null;
		if(request.getParameter("status")!=null){
			status=Integer.parseInt(request.getParameter("status"));
		}
		//根据登录用户条件在和父运单编号查询运单信息
		Map<String, Object> wayParams=new HashMap<String,Object>();
		if(status==1){
			wayParams.put("conditionGroups", conditionGroups);
		}
		wayParams.put("parentWaybillInfoId", parentWaybillInfoId);
		WaybillInfoPo waybillInfoPo=waybillInfoFacade.findwaybillInfoMationByConditionGroupAndParentWaybillInfoId(wayParams);
		if(waybillInfoPo!=null){
			if(waybillInfoPo.getEntrust()!=null){
				List<Integer> orgInfoIds=new ArrayList<Integer>();
				orgInfoIds.add(waybillInfoPo.getEntrust());
				List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
				if(CollectionUtils.isNotEmpty(orgInfoPos)){
					for (OrgInfoPo orgInfoPo : orgInfoPos) {
						waybillInfoPo.setEntrustName(orgInfoPo.getOrgName());
					}
				}
			}
			return waybillInfoPo;
		}
		return null;
	}
	
	/**
	 * @author zhangshuai  2017年7月11日 下午6:03:12
	 * @param response
	 * @param request
	 * @return
	 * 根据有价编号查询有价券信息
	 */
	@RequestMapping(value="/findCouponInfoById",produces="application/json;charset=utf-8")
	@ResponseBody
	public CouponInfoPo findCouponInfoById(HttpServletResponse response,HttpServletRequest request){
		
		//接收结算单有价券编号ID
		Integer id=null;
		if(request.getParameter("id")!=null && request.getParameter("id")!=""){
			id=Integer.parseInt(request.getParameter("id"));
		}
		
		if(id!=null){
			//根据有价券编号查询有价券类型
			//CouponInfoPo couponInfoPo = couponInfoFacade.findCouponById(id);
			CouponInfoPo couponInfoPo = new CouponInfoPo();
			//根据有价券编号查询有价券领用信息
			//根据有价券领用信息id查询有价券领用信息
			CouponUseInfo couponUseInfo = couponUseInfoFacade.selectCUInfoByCUId(id);
			if(couponUseInfo!=null){
				couponInfoPo.setMoney(couponUseInfo.getMoney());
				//根据查询出的有价券领用表的有价券编号ID查询有价券信息表
				CouponInfoPo couponInfoPo1 = couponInfoFacade.findCouponById(couponUseInfo.getCouponInfoId());
				//根据有价券类型查询有价券类型表进项税税率
				CouponTypeInfo couponTypeInfo = couponTypeInfoFacade.getCouponTypeInfoById(couponInfoPo1.getCouponType());
				if(couponTypeInfo!=null){
					couponInfoPo.setTaxRate(couponTypeInfo.getTaxRate());
				}
			}
			return couponInfoPo;
		}
		return null;
	}
	
	/**
	 * @author zhangshuai  2017年7月11日 下午7:58:31
	 * @param request
	 * @param response
	 * @param paymentInfoModel
	 * @return
	 * 添加/修改付款信息
	 */
	@RequestMapping(value="/saveOrUpdatePaymentInfoMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject saveOrUpdatePaymentInfoMation(HttpServletRequest request,HttpServletResponse response,PaymentInfoModel paymentInfoModel){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer userRole=userInfo.getUserRole();
		Integer uOrgRoorId=null;
		if(userRole==1 || userRole==2){
			uOrgRoorId=userInfo.getOrgRootId();
		}else if(userRole==3 || userRole==4){
			uOrgRoorId=userInfo.getId();
		}
		jo=prePaymentInfoFacade.saveOrUpdatePaymentInfoMation(paymentInfoModel,uId,uOrgRoorId,userRole);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年7月12日 下午12:17:31
	 * @param request
	 * @param response
	 * @return
	 * 进入付款页面根据登录用户主机构ID全查付款信息
	 */
	@RequestMapping(value="/findPaymentMationAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<PaymentInfoPo> findPaymentMationAll(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();
		Integer uOrgRootId=null;
		if(userRole==1 || userRole==2){
			uOrgRootId=userInfo.getOrgRootId();
		}else if(userRole==3 || userRole==4){
			uOrgRootId=userInfo.getId();
		}
		//接收页面模糊参数
		String paymentId=request.getParameter("paymentId");
		String paymentPersonName=request.getParameter("paymentPersonName");
		String paymentCompany=request.getParameter("paymentCompany");
		String customerName=request.getParameter("customerName");
		String projectInfoName=request.getParameter("projectInfoName");
		String proxyPersonName=request.getParameter("proxyPersonName");
		String payablePrice=request.getParameter("payablePrice");
		String paymentType=request.getParameter("paymentType");
		String paymentStatus=request.getParameter("paymentStatus");
		String makeStartTime=request.getParameter("makeStartTime");
		String makeEndime=request.getParameter("makeEndime");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		
		List<Integer> customerNameList=new ArrayList<Integer>();
		//客户名称
		if(customerName!=null && customerName!=""){
			//查询组织机构信息
			List<OrgInfoPo> oList=orgInfoFacade.findOrgInfoIdByOrgName(customerName);
			if(CollectionUtils.isNotEmpty(oList)){
				for (OrgInfoPo orgInfoPo : oList) {
					customerNameList.add(orgInfoPo.getId());
				}
			}
		}
		
		//组织部门
		List<Integer> projectInfoList=new ArrayList<Integer>();
		if(projectInfoName!=null && projectInfoName!=""){
			//查询项目信息
			List<ProjectInfoPo> PList=projectInfoFacade.findProjectIdByProjectName(projectInfoName);
			if (CollectionUtils.isNotEmpty(PList)) {
				for (ProjectInfoPo projectInfoPo : PList) {
					projectInfoList.add(projectInfoPo.getId());
				}
			}
		}
		
		//代理人
		List<Integer> proxyPersonList=new ArrayList<Integer>();
		if(proxyPersonName!=null && proxyPersonName!=""){
			//查询代理信息
			List<ProxyInfoPo> prList=proxyInfoPoFacade.findProxyIdByFuzzyCondition(proxyPersonName);
			if(CollectionUtils.isNotEmpty(prList)){
				for (ProxyInfoPo proxyInfoPo : prList) {
					proxyPersonList.add(proxyInfoPo.getId());
				}
			}
		}
		
		//根据登录用户主机构ID查询付款信息
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("orgRootId", uOrgRootId);
		params.put("paymentId", paymentId);
		params.put("paymentPersonName", paymentPersonName);
		params.put("paymentCompany", paymentCompany);
		params.put("customerNameList", customerNameList);
		params.put("projectInfoList", projectInfoList);
		params.put("proxyPersonList", proxyPersonList);
		params.put("payablePrice", payablePrice);
		params.put("paymentType", paymentType);
		params.put("paymentStatus", paymentStatus);
		params.put("makeStartTime", makeStartTime);
		params.put("makeEndime", makeEndime);
		params.put("start", start);
		params.put("rows", rows);
		params.put("userRole", userRole);
		List<PaymentInfoPo> paymentInfoPos=paymentInfoFacade.findPaymentMationAllByOrgRootId(params);
		
		if(CollectionUtils.isNotEmpty(paymentInfoPos)){
		
			//封装支付人名称
			List<Integer> userInfoIds=CommonUtils.getValueList(paymentInfoPos, "paymentPerson");
			//key:用户ID  value:司机名称
			Map<Integer, String> driverMap=null;
			if(CollectionUtils.isNotEmpty(userInfoIds)){
				List<DriverInfo> driverInfos=driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
				if(CollectionUtils.isNotEmpty(driverInfos)){
					driverMap=CommonUtils.listforMap(driverInfos, "userInfoId", "driverName");
				}
			}
			
			//封装代理人
			List<Integer> proxyIds=CommonUtils.getValueList(paymentInfoPos, "proxyPerson");
			//key：id  value：代理人名称
			Map<Integer, String> proxyMap=null;
			if(CollectionUtils.isNotEmpty(proxyIds)){
				Map<String, Object> queryMap=new HashMap<String,Object>();
				queryMap.put("list", proxyIds);
				List<ProxyInfoPo> proxys = proxyInfoPoFacade.findProxyInfoPoByIds(queryMap);
				if(CollectionUtils.isNotEmpty(proxys)){
						proxyMap=CommonUtils.listforMap(proxys, "id", "proxyName");
				}
			}
			
			//封装组织部门
			List<Integer> projectIds=CommonUtils.getValueList(paymentInfoPos, "projectInfoId");
			//key：ID  value：项目名称
			Map<Integer, String> projectInfoMap=null;
			if(CollectionUtils.isNotEmpty(projectIds)){
				List<ProjectInfoPo> projectInfoPos = projectInfoFacade.findProjectInfoPoByIds(projectIds);
				if(CollectionUtils.isNotEmpty(projectInfoPos)){
					projectInfoMap=CommonUtils.listforMap(projectInfoPos, "id", "projectName");
				}
			}
			
			//封装客户编号
			List<Integer> customerId=CommonUtils.getValueList(paymentInfoPos, "customerId");
			//key：id value：组织名称
			Map<Integer, String> orgInfoMap=null;
			if(CollectionUtils.isNotEmpty(customerId)){
				List<OrgInfoPo> orgInfos=orgInfoFacade.findOrgNameByIds(customerId);
				if(CollectionUtils.isNotEmpty(orgInfos)){
					orgInfoMap=CommonUtils.listforMap(orgInfos, "id", "orgName");
				}
			}
			
			//封装货物
			List<Integer> goodsIds=CommonUtils.getValueList(paymentInfoPos, "goodsInfoId");
			//key:id  value：货物名称
			Map<Integer, String> goodsMap=null;
			if(CollectionUtils.isNotEmpty(goodsIds)){
				List<GoodsInfo> goodsInfos=goodsInfoFacade.findGoodsInfoByIds(goodsIds);
				if(CollectionUtils.isNotEmpty(goodsInfos)){
					goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
				}
			}
			
			//封装制单人
			List<Integer> userIds=CommonUtils.getValueList(paymentInfoPos, "makeUser");
			Map<Integer, String> userMap=null;
			if(CollectionUtils.isNotEmpty(userIds)){
				List<UserInfo> userInfods=userInfoFacade.findUserNameByIds(userIds);
				if(CollectionUtils.isNotEmpty(userInfods)){
					userMap=CommonUtils.listforMap(userInfods, "id", "userName");
				}
			}
			for (PaymentInfoPo paymentInfoPo : paymentInfoPos) {
				//封装支付人名称
				if(MapUtils.isNotEmpty(driverMap)&&driverMap.get(paymentInfoPo.getPaymentPerson())!=null){
					paymentInfoPo.setPaymentPersonName(driverMap.get(paymentInfoPo.getPaymentPerson()));
				}
				//封装代理人名称
				if(MapUtils.isNotEmpty(proxyMap)&&proxyMap.get(paymentInfoPo.getProxyPerson())!=null){
					paymentInfoPo.setProxyPersonName(proxyMap.get(paymentInfoPo.getProxyPerson()));
				}
				//封装组织部门名称
				if(MapUtils.isNotEmpty(projectInfoMap)&&projectInfoMap.get(paymentInfoPo.getProjectInfoId())!=null){
					paymentInfoPo.setProjectInfoName(projectInfoMap.get(paymentInfoPo.getProjectInfoId()));
				}
				//封装客户编号名称
				if(MapUtils.isNotEmpty(orgInfoMap)&&orgInfoMap.get(paymentInfoPo.getCustomerId())!=null){
					paymentInfoPo.setCustomerName(orgInfoMap.get(paymentInfoPo.getCustomerId()));
				}
				//封装货物名称
				if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(paymentInfoPo.getGoodsInfoId())!=null){
					paymentInfoPo.setGoodsName(goodsMap.get(paymentInfoPo.getGoodsInfoId()));
				}
				//封装支付单位名称
				//先根据结算ID查询结算信息，判断司机编号是否为空
				SettlementInfo settlementInfo = settlementInfoFacade.findSettlementInfoMationById(paymentInfoPo.getSettlementInfoInfoId());
				if(settlementInfo!=null){
					if(settlementInfo.getUserInfoId()!=null){
						
						//判断付款信息是否代理付款
						//否
						if(paymentInfoPo.getIsProxyPayment()==0){
							//根据司机编号查询司机名称
							List<Integer> driverIds=new ArrayList<Integer>();
							driverIds.add(settlementInfo.getUserInfoId());
							List<DriverInfo> drivers = driverInfoFacade.findDriverByUserInfoIds(driverIds);
							if(CollectionUtils.isNotEmpty(drivers)){
								for (DriverInfo driverInfo : drivers) {
									paymentInfoPo.setPaymentCompanyName(driverInfo.getDriverName());
								}
							}
						}else 
							//是
							if(paymentInfoPo.getIsProxyPayment()==1){
								//根据代理方查询代理方名称
								List<Integer> orgInfoIds=new ArrayList<Integer>();
								orgInfoIds.add(settlementInfo.getProxy());
								/*Map<String, Object> queryMap=new HashMap<String,Object>();
								queryMap.put("list", list);
								List<ProxyInfoPo> proxyInfoPos = proxyInfoPoFacade.findProxyInfoPoByIds(queryMap);
								if(CollectionUtils.isNotEmpty(proxyInfoPos)){
									for (ProxyInfoPo proxyInfoPo : proxyInfoPos) {
										paymentInfoPo.setPaymentCompanyName(proxyInfoPo.getProxyName());
									}
								}*/
								List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
								if(CollectionUtils.isNotEmpty(orgInfoPos)){
									for (OrgInfoPo orgInfoPo : orgInfoPos) {
										paymentInfoPo.setPaymentCompanyName(orgInfoPo.getOrgName());
									}
								}
						}
					}
					//如果承运方不为空时取承运方名称
					if(settlementInfo.getShipper()!=null){
						//根据承运方查询组织机构名称
						List<Integer> orgIds=new ArrayList<Integer>();
						orgIds.add(settlementInfo.getShipper());
						List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
						if(CollectionUtils.isNotEmpty(orgInfoPos)){
							for (OrgInfoPo orgInfoPo : orgInfoPos) {
								paymentInfoPo.setPaymentCompanyName(orgInfoPo.getOrgName());
							}
						}
					}
				}
				
				if(paymentInfoPo.getSettlementInfoInfoId()==null){
					//根据承运方查询组织机构名称
					List<Integer> orgIds=new ArrayList<Integer>();
					orgIds.add(paymentInfoPo.getPaymentCompany());
					List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
					if(CollectionUtils.isNotEmpty(orgInfoPos)){
						for (OrgInfoPo orgInfoPo : orgInfoPos) {
							paymentInfoPo.setPaymentCompanyName(orgInfoPo.getOrgName());
						}
					}
				}
				
				//线路(如零散货物为空则根据线路查询线路信息表：起点、终点字段)
				if(paymentInfoPo.getScatteredGoods()==null || "".equals(paymentInfoPo.getScatteredGoods())){
					List<Integer> lineIds=new ArrayList<Integer>();
					lineIds.add(paymentInfoPo.getLineInfoId());
					List<LineInfoPo> lineInfos = lineInfoFacade.findLineInfoByIds(lineIds);
					if(CollectionUtils.isNotEmpty(lineInfos)){
						for (LineInfoPo lineInfoPo : lineInfos) {
							paymentInfoPo.setLineName(lineInfoPo.getStartPoints()+"/"+lineInfoPo.getEndPoints());
						}
					}
				}else 
					//如零散货物不为空则根据线路查询地点表：省(州)、市、县(区)
					if(paymentInfoPo.getScatteredGoods()!=null && StringUtils.isNotEmpty(paymentInfoPo.getScatteredGoods()) ){
						List<LocationInfoPo> locationInfos = locationInfoFacade.findLocationById(paymentInfoPo.getLineInfoId());
						if(CollectionUtils.isNotEmpty(locationInfos)){
							for (LocationInfoPo locationInfoPo : locationInfos) {
								paymentInfoPo.setLineName(locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty());
							}
						}
						
				}
				//封装制单人名称
				if(MapUtils.isNotEmpty(userMap)&&userMap.get(paymentInfoPo.getMakeUser())!=null){
					paymentInfoPo.setMakeUserName(userMap.get(paymentInfoPo.getMakeUser()));
				}
				
				paymentInfoPo.setMakeTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(paymentInfoPo.getMakeTime()));
				
			}
		}
		
		return paymentInfoPos;
	}
	
	/**
	 * @author zhangshuai  2017年7月12日 下午12:39:09
	 * @param request
	 * @param response
	 * @return
	 * 根据登录用户主机构ID查询付款信息总数
	 */
	@RequestMapping(value="/getPaymentMationAllCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getPaymentMationAllCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
				UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
				Integer uOrgRootId=null;
				Integer userRole=userInfo.getUserRole();
				//企业货主    物流公司
				if(userRole==1 || userRole==2){
					uOrgRootId=userInfo.getOrgRootId();
				}else 
					//个体货主   司机
					if(userRole==3 || userRole==4){
					uOrgRootId=userInfo.getId();
				}
				//接收页面模糊参数
				String paymentId=request.getParameter("paymentId");
				String paymentPersonName=request.getParameter("paymentPersonName");
				String paymentCompany=request.getParameter("paymentCompany");
				String customerName=request.getParameter("customerName");
				String projectInfoName=request.getParameter("projectInfoName");
				String proxyPersonName=request.getParameter("proxyPersonName");
				String payablePrice=request.getParameter("payablePrice");
				String paymentType=request.getParameter("paymentType");
				String paymentStatus=request.getParameter("paymentStatus");
				String makeStartTime=request.getParameter("makeStartTime");
				String makeEndime=request.getParameter("makeEndime");
				
				List<Integer> customerNameList=new ArrayList<Integer>();
				//客户名称
				if(customerName!=null && customerName!=""){
					//查询组织机构信息
					List<OrgInfoPo> oList=orgInfoFacade.findOrgInfoIdByOrgName(customerName);
					if(CollectionUtils.isNotEmpty(oList)){
						for (OrgInfoPo orgInfoPo : oList) {
							customerNameList.add(orgInfoPo.getId());
						}
					}
				}
				
				//组织部门
				List<Integer> projectInfoList=new ArrayList<Integer>();
				if(projectInfoName!=null && projectInfoName!=""){
					//查询项目信息
					List<ProjectInfoPo> PList=projectInfoFacade.findProjectIdByProjectName(projectInfoName);
					if (CollectionUtils.isNotEmpty(PList)) {
						for (ProjectInfoPo projectInfoPo : PList) {
							projectInfoList.add(projectInfoPo.getId());
						}
					}
				}
				
				//代理人
				List<Integer> proxyPersonList=new ArrayList<Integer>();
				if(proxyPersonName!=null && proxyPersonName!=""){
					//查询代理信息
					List<ProxyInfoPo> prList=proxyInfoPoFacade.findProxyIdByFuzzyCondition(proxyPersonName);
					if(CollectionUtils.isNotEmpty(prList)){
						for (ProxyInfoPo proxyInfoPo : prList) {
							proxyPersonList.add(proxyInfoPo.getId());
						}
					}
				}
				
				//根据登录用户主机构ID查询付款信息
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("orgRootId", uOrgRootId);
				params.put("paymentId", paymentId);
				params.put("paymentPersonName", paymentPersonName);
				params.put("paymentCompany", paymentCompany);
				params.put("customerNameList", customerNameList);
				params.put("projectInfoList", projectInfoList);
				params.put("proxyPersonList", proxyPersonList);
				params.put("payablePrice", payablePrice);
				params.put("paymentType", paymentType);
				params.put("paymentStatus", paymentStatus);
				params.put("makeStartTime", makeStartTime);
				params.put("makeEndime", makeEndime);
				params.put("userRole", userRole);
		Integer count=paymentInfoFacade.getPaymentMationAllCount(params);
		
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年7月12日 下午10:03:24
	 * @param request
	 * @param response
	 * @return
	 * 根据付款ID查询付款信息
	 */
	@RequestMapping(value="/findPaymentInfoMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findPaymentInfoMationById(HttpServletRequest request,HttpServletResponse response){
		
		JSONObject jo=new JSONObject();
		
		//接收页面操作付款ID
		Integer id=Integer.valueOf(request.getParameter("PMIds"));
		
		try {
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("id", id);
			PaymentInfoPo paymentInfoPo=paymentInfoFacade.findPaymentInfoMationById(params);
			jo.put("success", true);
			jo.put("msg", paymentInfoPo.getPaymentStatus());
		} catch (Exception e) {
			log.error("根据付款ID查询付款信息异常!",e);
			jo.put("success", false);
			jo.put("msg", "");
		}
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年7月12日 下午10:12:10
	 * @param request
	 * @param response
	 * @return
	 * 根据付款ID删除付款信息
	 */
	@RequestMapping(value="/deletePaymentMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject deletePaymentMationById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		//接收页面操作付款ID
		Integer id=Integer.valueOf(request.getParameter("PMIds"));
		
		//根据付款ID删除付款信息
		jo=paymentInfoFacade.deletePaymentMationById(id);
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年7月12日 下午10:42:14
	 * @param response
	 * @param request
	 * @return
	 * 根据付款ID提交审核/审核付款信息
	 */
	@RequestMapping(value="/submitAuditOrAuditPaymentMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject submitAuditOrAuditPaymentMation(HttpServletResponse response,HttpServletRequest request){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		//接收操作付款ID
		Integer id=Integer.valueOf(request.getParameter("PMIds"));
		//接收审核/提交审核状态
		Integer sign=Integer.valueOf(request.getParameter("sign"));
		String auditOption=null;
		//接收审核意见
		if(request.getParameter("auditOption")!=null){
			auditOption=request.getParameter("auditOption");
		}
		//根据付款ID提交审核/审核付款信息
		jo=paymentInfoFacade.submitAuditOrAuditPaymentMation(id,sign,uId,auditOption,uOrgRootId);
		
		return jo;
	}
	
	/** 
	* @方法名: goFindAccountCheckInfoMationPage 
	* @作者: zhangshuai
	* @时间: 2017年9月13日 下午12:40:29
	* @返回值类型: String 
	* @throws 
	* 当选择的付款对象为物流公司时，选择对账信息
	*/
	@RequestMapping(value="/goFindAccountCheckInfoMationPage",produces="application/json;charset=utf-8")
	public String goFindAccountCheckInfoMationPage(Model model){
		model.addAttribute("findAccountInfo", "对账信息");
		return "template/paymentManagement/find_accountCheck_info_mation";
	}
	
	/** 
	* @方法名: findAccountCheckList 
	* @作者: zhangshuai
	* @时间: 2017年9月13日 下午4:38:46
	* @返回值类型: List<AccountCheckInfo> 
	* @throws 
	* 当付款对像为物流公司时，查询对账信息
	*/
	@RequestMapping(value="/findAccountCheckList")
	@ResponseBody
	public List<AccountCheckInfo> findAccountCheckList(HttpServletRequest request,HttpServletResponse response){
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		// 对账单编号
		String accountCheckId=request.getParameter("accountCheckId");
		// 对账单状态
		String accountCheckStatus=request.getParameter("accountCheckStatus");
		//承运方名称
		String shipperName=request.getParameter("shipperName");
		Map<String, Object> queryMap=new HashMap<String,Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", rootOrgInfoId);
		queryMap.put("accountCheckId", accountCheckId);
		queryMap.put("accountCheckStatus", 6);
		queryMap.put("shipperName", shipperName);
		// 4、分页查询对账单信息
		List<AccountCheckInfo> accountCheckInfoList = accountCheckInfoFacade.findAccountCheckInfoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(accountCheckInfoList)) {
			// 5、查询创建人
			List<Integer> userInfoIds = CommonUtils.getValueList(accountCheckInfoList, "makeUser");
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
			// key:用户ID value:用户名
			Map<Integer, String> userInfoMap = null;
			if (CollectionUtils.isNotEmpty(userInfos)) {
				userInfoMap = CommonUtils.listforMap(userInfos, "id", "userName");
			}

			for (AccountCheckInfo accountCheckInfo : accountCheckInfoList) {
				// 封装创建人
				if (MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(accountCheckInfo.getMakeUser()) != null) {
					accountCheckInfo.setMakeUserName(userInfoMap.get(accountCheckInfo.getMakeUser()));
				}
				if(accountCheckInfo.getMakeTime()!=null){
					accountCheckInfo.setMakeTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(accountCheckInfo.getMakeTime()));
				}
			}

		}
		return accountCheckInfoList;

	}
	
	/** 
	* @方法名: getAccountCheckListCount 
	* @作者: zhangshuai
	* @时间: 2017年9月13日 下午6:15:52
	* @返回值类型: Integer 
	* @throws 
	* 当付款对象为物流公司时，查询对账单数量
	*/
	@RequestMapping(value="/getAccountCheckListCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getAccountCheckListCount(HttpServletRequest request,HttpServletResponse response){
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		// 对账单编号
		String accountCheckId=request.getParameter("accountCheckId");
		// 对账单状态
		String accountCheckStatus=request.getParameter("accountCheckStatus");
		//承运方名称
		String shipperName=request.getParameter("shipperName");
		Map<String, Object> queryMap=new HashMap<String,Object>();
		queryMap.put("orgRootId", rootOrgInfoId);
		queryMap.put("accountCheckId", accountCheckId);
		queryMap.put("accountCheckStatus", 6);
		queryMap.put("shipperName", shipperName);
		
		Integer totalNum = accountCheckInfoFacade.countAccountCheckInfoForPage(queryMap);
		return totalNum;
	}
	
	/** 
	* @方法名: findAccountCheckDetailById 
	* @作者: zhangshuai
	* @时间: 2017年9月13日 下午6:53:25
	* @返回值类型: List<SettlementInfo> 
	* @throws 
	* 根据选择的对账ID查询结算信息
	*/
	@RequestMapping(value="/findAccountCheckDetailById")
	@ResponseBody
	public Map<Object, Object> findAccountCheckDetailById(HttpServletResponse respons,HttpServletRequest request){
		
		AccountCheckInfo accountCheckInfoPo=new AccountCheckInfo();
		
		Map<Object, Object> paramsMap=new HashMap<Object,Object>();
		
		JSONObject jo=new JSONObject();
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		//接受操作的对账单id
		List<Integer> accIds=new ArrayList<Integer>();
		if(StringUtils.isNotEmpty(request.getParameter("accId"))){
			String accId=request.getParameter("accId").trim();
			if(StringUtils.isNotEmpty(accId)){
				String[] accIdsArray=accId.split(",");
				if(accIdsArray.length>0){
					for (String id : accIdsArray) {
						accIds.add(Integer.parseInt(id));
					}
				}
			}
		}
		String accountIds="";
		BigDecimal forwardingTonnageSum=BigDecimal.ZERO;  //发货吨位之和
		BigDecimal confirmArriveTonnageSum=BigDecimal.ZERO;  //到货吨位之和
		BigDecimal confirmPriceSum=BigDecimal.ZERO; //确认账款之和
		Set<Integer> shipperSet=new HashSet<Integer>();
		Map<String, Object> queryMap=new HashMap<String,Object>();
		queryMap.put("orgRootId", userInfo.getOrgRootId());
		queryMap.put("list", accIds);
		List<AccountCheckInfo> accountCheckInfos=accountCheckInfoFacade.findAccountCheckInfoByIds(queryMap);
		
		if(CollectionUtils.isNotEmpty(accountCheckInfos)){
			for (AccountCheckInfo accountCheckInfo : accountCheckInfos) {
				accountIds+=accountCheckInfo.getId().toString()+",";
				if(accountCheckInfo.getConfirmForwardingTonnage()!=null){
					forwardingTonnageSum=forwardingTonnageSum.add(accountCheckInfo.getConfirmForwardingTonnage());
				}
				if(accountCheckInfo.getConfirmArriveTonnage()!=null){
					confirmArriveTonnageSum=confirmArriveTonnageSum.add(accountCheckInfo.getConfirmArriveTonnage());
				}
				if(accountCheckInfo.getConfirmPrice()!=null){
					confirmPriceSum=confirmPriceSum.add(accountCheckInfo.getConfirmPrice());
				}
				if(accountCheckInfo.getShipper()!=null){
					shipperSet.add(accountCheckInfo.getShipper());
				}
			}
		}
		
		if(shipperSet.size()>1){
			jo.put("success", false);
			jo.put("msg", "请选择相同承运方的数据信息!");
			paramsMap.put("jo", jo);
			return paramsMap;
		}
		
		//根据承运方查询承运方的信息
		for (Integer shipper : shipperSet) {
			accountCheckInfoPo.setOrgId(shipper);
			List<Integer> list=new ArrayList<Integer>();
			list.add(shipper);
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(list);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					accountCheckInfoPo.setIdCard(orgInfoPo.getIdCard());
					accountCheckInfoPo.setBankAccount(orgInfoPo.getBankAccount());
					accountCheckInfoPo.setBankName(orgInfoPo.getBankName());
					accountCheckInfoPo.setOrgName(orgInfoPo.getOrgName());
				}
			}
		}
		
		accountCheckInfoPo.setForwardingTonnageSum(forwardingTonnageSum);
		accountCheckInfoPo.setArriveTonnageSum(confirmArriveTonnageSum);
		accountCheckInfoPo.setConfirmPriceSum(confirmPriceSum);
		accountCheckInfoPo.setAccountCheckId(accountCheckInfos.get(0).getAccountCheckId());
		accountCheckInfoPo.setAccIds(accountIds.substring(0, accountIds.length()-1));
		jo.put("success", true);
		jo.put("msg", "");
		paramsMap.put("accountCheckInfoPo", accountCheckInfoPo);
		paramsMap.put("jo", jo);
		return paramsMap;
		/*//接收选择的对账ID
		
		Integer accId=Integer.parseInt(request.getParameter("accId"));
		
		//根据对账ID查询对账信息
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("accountCheckInfoId", accId);
		AccountCheckInfo accountCheckInfo = accountCheckInfoFacade.getAccountCheckInfoById(params);
		
		//根据选择的对账ID查询对账明细信息
		List<Integer> accIds=new ArrayList<Integer>();
		accIds.add(accId);
		Map<String, Object> paramsMap=new HashMap<String,Object>();
		paramsMap.put("accountCheckInfoIdList", accIds);
		
		List<AccountCheckDetailInfo> accountCheckDetailInfos = accountCheckDetailInfoService.findAccountCheckDetailInfoByAccountCheckId(paramsMap);
		
		if(CollectionUtils.isNotEmpty(accountCheckDetailInfos)){
			
			List<Integer> settIds=new ArrayList<Integer>();
			for (AccountCheckDetailInfo accountCheckDetailInfo : accountCheckDetailInfos) {
				settIds.add(accountCheckDetailInfo.getSettlementInfoId());
			}
			
			if(CollectionUtils.isNotEmpty(settIds)){
				//根据查询出的结算单ID批量查询结算信息
				List<SettlementInfo> settlementInfos = settlementInfoFacade.findSettlementInfoByIds(settIds);
				if(CollectionUtils.isNotEmpty(settlementInfos)){
					//将发货吨位相加存起来
					BigDecimal forwardingTonnageS= BigDecimal.ZERO;
					//将到货吨位相加存起来
					BigDecimal arriveTonnageS= BigDecimal.ZERO;
					//查询选择出的结算信息的承运方
					List<Integer> shipperIds=CommonUtils.getValueList(settlementInfos, "shipper");
					//key ：机构ID  value：身份证号
					Map<Integer, String> idCardMap=null;
					//key ：机构ID  value：开户行
					Map<Integer, String> bankNameMap=null;
					//key ：机构ID  value：开户名
					Map<Integer, String> accountNameMap=null;
					//key ：机构ID  value：银行账号
					Map<Integer, String> bankAccountMap=null;
					//key ：机构ID  value：机构名称
					Map<Integer, String> orgNameMap=null;
					if(CollectionUtils.isNotEmpty(shipperIds)){
						//查询证件号、开户行、银行账号
						List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(shipperIds);
						if(CollectionUtils.isNotEmpty(orgInfoPos)){
							idCardMap=CommonUtils.listforMap(orgInfoPos, "id", "idCard");
							bankNameMap=CommonUtils.listforMap(orgInfoPos, "id", "bankName");
							accountNameMap=CommonUtils.listforMap(orgInfoPos, "id", "accountName");
							bankAccountMap=CommonUtils.listforMap(orgInfoPos, "id", "bankAccount");
							orgNameMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
						}
					}
					for (SettlementInfo settlementInfo : settlementInfos) {
						if(settlementInfo.getForwardingTonnage()!=null){
							forwardingTonnageS=forwardingTonnageS.add(settlementInfo.getForwardingTonnage());
						}
						if(settlementInfo.getArriveTonnage()!=null){
							arriveTonnageS=arriveTonnageS.add(settlementInfo.getArriveTonnage());
						}
						
						if(MapUtils.isNotEmpty(idCardMap)&&idCardMap.get(settlementInfo.getShipper())!=null){
							accountCheckInfo.setIdCard(idCardMap.get(settlementInfo.getShipper()));
						}
						if(MapUtils.isNotEmpty(bankNameMap)&&bankNameMap.get(settlementInfo.getShipper())!=null){
							accountCheckInfo.setBankName(bankNameMap.get(settlementInfo.getShipper()));
						}
						if(MapUtils.isNotEmpty(accountNameMap)&&accountNameMap.get(settlementInfo.getShipper())!=null){
							accountCheckInfo.setAccountName(accountNameMap.get(settlementInfo.getShipper()));
						}
						if(MapUtils.isNotEmpty(bankAccountMap)&&bankAccountMap.get(settlementInfo.getShipper())!=null){
							accountCheckInfo.setBankAccount(bankAccountMap.get(settlementInfo.getShipper()));
						}
						if(MapUtils.isNotEmpty(orgNameMap)&&orgNameMap.get(settlementInfo.getShipper())!=null){
							accountCheckInfo.setOrgName(orgNameMap.get(settlementInfo.getShipper()));
						}
						if(settlementInfo.getShipper()!=null){
							accountCheckInfo.setOrgId(settlementInfo.getShipper());
						}
					}
					accountCheckInfo.setForwardingTonnageSum(forwardingTonnageS);//发货吨位之和
					accountCheckInfo.setArriveTonnageSum(arriveTonnageS);//到货吨位之和
				}
			}
			
		}
		return accountCheckInfo;
	}*/
	}
}


