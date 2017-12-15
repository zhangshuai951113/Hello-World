package com.xz.logistics.controller;

import java.text.NumberFormat;
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

import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.CapitalAccountFlowInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.facade.api.OfferInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.logistics.utils.CodeAutoGenerater;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.LocationInfoPo;
import com.xz.model.po.OfferInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillInfoPo;
import com.xz.model.vo.OfferModel;

/**
 * 货源信息管理
 * @author luojuan 2017年6月24日
 *
 */
@Controller
@RequestMapping("/supplyOfGoods")
public class SupplyOfGoodsController extends BaseController{
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private WaybillInfoFacade waybillInfoFacade;
	
	@Resource
	private OfferInfoFacade offerInfoFacade;
	
	@Resource
	private OrgInfoFacade orgInfoFacade;
	
	@Resource
	private UserInfoFacade userInfoFacade;
	
	@Resource
	private LocationInfoFacade locationInfoFacade;
	
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
	

	@Resource
	private LineInfoFacade lineInfoFacade;
	

	@Resource
	private CapitalAccountFlowInfoFacade capitalAccountFlowInfoFacade;
	

	/**
	 * 货源信息初始化页面
	 * 
	 * @author luojuan 2017年6月24日
	 */
	@RequestMapping("/rootSupplyOfGoodsListPage")
	public String rootSupplyOfGoodsListPage(){
		return "template/supplyOfGoods/show_supply_of_goods_list_page";
	}
	
	/**
	 * 货源信息查询(分页)
	 * 
	 * @author luojaun 2017年6月24日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showSupplyOfGoodslistPage")
	public String showSupplyOfGoodslistPage(HttpServletRequest request, Model model){
		
		DataPager<WaybillInfoPo> waybillSourceInfoPager = new DataPager<WaybillInfoPo>();
		
		// 从session中取出当前用户的用户ID、用户权限和主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		waybillSourceInfoPager.setPage(page);
		
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		waybillSourceInfoPager.setSize(rows);
		
		//货物
		String goodsName = null;
		if (params.get("goodsName") != null) {
			goodsName = params.get("goodsName").toString();
		}
		
		//委托方
		String entrust = null;
		if (params.get("entrust") != null) {
			entrust = params.get("entrust").toString();
		}
		
		//发货单位
		String forwardingUnit = null;
		if (params.get("forwardingUnit") != null) {
			forwardingUnit = params.get("forwardingUnit").toString();
		}
		
		//到货单位
		String consignee = null;
		if (params.get("consignee") != null) {
			consignee = params.get("consignee").toString();
		}
		
		//计划拉运日期Start
		String planTransportDateStartStr = null;
		Date planTransportDateStart = null;
		if(params.get("planTransportDateStart") != null){
			planTransportDateStartStr = params.get("planTransportDateStart").toString();
			
			try {
				planTransportDateStart = new SimpleDateFormat("yyyy-MM-dd").parse(planTransportDateStartStr);
				
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		
		//计划拉运日期End
		String planTransportDateEndStr = null;
		Date planTransportDateEnd = null;
		if(params.get("planTransportDateEnd") != null){
			planTransportDateEndStr = params.get("planTransportDateEnd").toString();
			
			try {
				planTransportDateEnd = new SimpleDateFormat("yyyy-MM-dd").parse(planTransportDateEndStr);
				
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		
		//线路Start
		String lineStartPoint = null;
		if (params.get("lineStartPoint") != null) {
			lineStartPoint = params.get("lineStartPoint").toString();
		}
		
		//线路End
		String lineEndPoint = null;
		if (params.get("lineEndPoint") != null) {
			lineEndPoint = params.get("lineEndPoint").toString();
		}
		
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		//如果是物流公司则用主机构ID和运单主键ID查询，司机则用登录用户ID和运单主键ID查询
		if(userRole == 2){
			queryMap.put("orgRootId",orgRootId);
		}else if(userRole == 4){
			queryMap.put("orgRootId",userInfoId);
		}else{
			System.out.println("权限不符");
		}
		
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("goodsName", goodsName);
		queryMap.put("entrust", entrust);
		queryMap.put("forwardingUnit", forwardingUnit);
		queryMap.put("consignee", consignee);
		queryMap.put("planTransportDateStart", planTransportDateStart);
		queryMap.put("planTransportDateEnd", planTransportDateEnd);
		queryMap.put("lineStartPoint", lineStartPoint);
		queryMap.put("lineEndPoint", lineEndPoint);
		queryMap.put("waybillClassify", 2);//零散货物运单
		queryMap.put("releaseMode", 1);//发布平台
		queryMap.put("waybillStatus", 10);//运单状态(已发布)
		queryMap.put("currentTime",new SimpleDateFormat("yyyy-MM-dd").format(Calendar.getInstance().getTime()));//当前时间
		//3、查询货源信息管理总数
		Integer totalNum = waybillInfoFacade.countWaybillInfoForPage(queryMap);
		
		//4、分页查询货源信息管理
		List<WaybillInfoPo> waybillInfoList = waybillInfoFacade.findWaybillInfoForPage(queryMap);
		
		if(CollectionUtils.isNotEmpty(waybillInfoList)){
			// 个体货主
			List<Integer> ownUserInfoIdList = new ArrayList<Integer>();
			// 委托方
			List<Integer> orgInfoIdList = new ArrayList<Integer>();
			// 货物
			List<Integer> goodsInfoIdList = new ArrayList<Integer>();
			// 线路
			List<Integer> lineInfoIdList = new ArrayList<Integer>();
			// 起点、终点
			List<Integer> locationInfoIdList = new ArrayList<Integer>();
			
			for (WaybillInfoPo waybillInfoPo : waybillInfoList) {
				if (waybillInfoPo != null) {
					if (waybillInfoPo.getEntrustUserRole() == 3) {
						// 个体货主
						if (waybillInfoPo.getEntrust() != null) {
							if (!ownUserInfoIdList.contains(waybillInfoPo.getEntrust())) {
								ownUserInfoIdList.add(waybillInfoPo.getEntrust());
							}
						}
					} else {
						// 委托方
						if (waybillInfoPo.getEntrust() != null) {
							if (!orgInfoIdList.contains(waybillInfoPo.getEntrust())) {
								orgInfoIdList.add(waybillInfoPo.getEntrust());
							}
						}
					}
					
					// 货物
					if (waybillInfoPo.getGoodsInfoId() != null) {
						if (!goodsInfoIdList.contains(waybillInfoPo.getGoodsInfoId())) {
							goodsInfoIdList.add(waybillInfoPo.getGoodsInfoId());
						}
					}
					if (waybillInfoPo.getWaybillClassify() == 1) {
						// 线路
						if (waybillInfoPo.getLineInfoId() != null) {
							if (!lineInfoIdList.contains(waybillInfoPo.getLineInfoId())) {
								lineInfoIdList.add(waybillInfoPo.getLineInfoId());
							}
						}
					} else {
						// 起点、终点
						if (waybillInfoPo.getLineInfoId() != null) {
							if (!locationInfoIdList.contains(waybillInfoPo.getLineInfoId())) {
								locationInfoIdList.add(waybillInfoPo.getLineInfoId());
							}
						}
						if (waybillInfoPo.getEndPoints() != null) {
							if (!locationInfoIdList.contains(waybillInfoPo.getEndPoints())) {
								locationInfoIdList.add(waybillInfoPo.getEndPoints());
							}
						}
					}
				}
			}

			// 个体货主
			Map<Integer, Object> ownerInfoMap = null;
			if (CollectionUtils.isNotEmpty(ownUserInfoIdList)) {
				List<IndividualOwnerPo> ownerInfoList = individualOwnerFacade.findIndividualOwnerByUserInfoIds(ownUserInfoIdList);
				ownerInfoMap = CommonUtils.listforMap(ownerInfoList, "userInfoId", "realName");
			}
			
			// 获取机构名称
			Map<Integer, String> orgInfoMap = null;
			if (CollectionUtils.isNotEmpty(orgInfoIdList)) {
				List<OrgInfoPo> orgInfoList = orgInfoFacade.findOrgNameByIds(orgInfoIdList);
				orgInfoMap = CommonUtils.listforMap(orgInfoList, "id", "orgName");
			}

			//获取货物名称
			Map<Integer,String> goodsInfoMap = null;
			if(CollectionUtils.isNotEmpty(goodsInfoIdList)){
				List<GoodsInfo> goodsInfoList = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIdList);
				goodsInfoMap = CommonUtils.listforMap(goodsInfoList, "id", "goodsName");
			}
			
			// 线路
			Map<Integer, Object> lineInfoMap = null;
			if (CollectionUtils.isNotEmpty(lineInfoIdList)) {
				List<LineInfoPo> lineInfoList = lineInfoFacade.findLineInfoByIds(lineInfoIdList);
				lineInfoMap = CommonUtils.listforMap(lineInfoList, "id", null);
			}
			
			// 地点
			Map<Integer, Object> locationInfoMap = null;
			if (CollectionUtils.isNotEmpty(locationInfoIdList)) {
				List<LocationInfoPo> locationInfoList = locationInfoFacade.findLocationNameByIds(locationInfoIdList);
				locationInfoMap = CommonUtils.listforMap(locationInfoList, "id", "locationName");
			}
			
			
			for(WaybillInfoPo waybillInfoPo:waybillInfoList){
				if (waybillInfoPo != null) {
					if (waybillInfoPo.getEntrustUserRole() == 3) {
						// 个体货主
						if (waybillInfoPo.getEntrust() != null && ownerInfoMap != null) {
							Object value = ownerInfoMap.get(waybillInfoPo.getEntrust());
							if (value != null) {
								waybillInfoPo.setEntrustName(value.toString());
							}
						}
					} else {
						// 委托方
						if (waybillInfoPo.getEntrust() != null && orgInfoMap != null) {
							Integer a = waybillInfoPo.getEntrust();
							Object value = orgInfoMap.get(waybillInfoPo.getEntrust());
							if (value != null) {
								waybillInfoPo.setEntrustName(value.toString());
							}
						}
					}
					
					// 货物
					if (waybillInfoPo.getGoodsInfoId() != null && goodsInfoMap != null) {
						Object value = goodsInfoMap.get(waybillInfoPo.getGoodsInfoId());
						if (value != null) {
							waybillInfoPo.setGoodsName(value.toString());
						}
					}
					if (waybillInfoPo.getWaybillClassify() == 1) {
						// 线路
						if (waybillInfoPo.getLineInfoId() != null && lineInfoMap != null) {
							LineInfoPo lineInfo = (LineInfoPo) lineInfoMap.get(waybillInfoPo.getLineInfoId());
							if (lineInfo != null) {
								waybillInfoPo.setLineName(lineInfo.getLineName());
								waybillInfoPo.setLineNameStr(lineInfo.getStartPoints());
								waybillInfoPo.setLineNameEnd(lineInfo.getEndPoints());
							}
						}
					} else {
						// 起点、终点
						if (waybillInfoPo.getLineInfoId() != null && locationInfoMap != null) {
							Object value = locationInfoMap.get(waybillInfoPo.getLineInfoId());
							if (value != null) {
								waybillInfoPo.setLineNameStr(value.toString());
							}
						}
						if (waybillInfoPo.getEndPoints() != null && locationInfoMap != null) {
							Object value = locationInfoMap.get(waybillInfoPo.getEndPoints());
							if (value != null) {
								waybillInfoPo.setLineNameEnd(value.toString());
							}
						}
					}
				}
			}
		}
		
		//5、总数、分页信息封装
		waybillSourceInfoPager.setTotal(totalNum);
		waybillSourceInfoPager.setRows(waybillInfoList);
		
		model.addAttribute("userRole",userRole);
		model.addAttribute("waybillSourceInfoPager",waybillSourceInfoPager);
		
		return "template/supplyOfGoods/supply_of_goods_data";
	}
	
	/**
	 * 新增/编辑货源报价初始化页面
	 * 
	 * @author luojaun 2017年6月26日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initWaybillSourcePage")
	public String initWaybillSourcePage(HttpServletRequest request, Model model){
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();
		Integer userInfoId = userInfo.getId();
		Integer orgRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		
		String operateTitle = "";
		
		Integer waybillSourceInfoId = Integer.parseInt(request.getParameter("waybillSourceInfoId"));
		model.addAttribute("waybillSourceInfoId", waybillSourceInfoId);
		
		WaybillInfoPo waybillInfoPo = waybillInfoFacade.findDistributeScatteredGoodsWaybillStatus(waybillSourceInfoId);
		
		//根据运单主键ID在报价表里查询数据，如果没有则是新增，如果有，则是修改
		Map<String, Integer> params = new HashMap<String, Integer>();
		params.put("waybillInfoId", waybillSourceInfoId);
		if(userRole ==2){
			params.put("orgRootId", orgRootId);
		}else if(userRole == 4){
			params.put("orgRootId", userInfoId);
		}
		
		boolean isExistSameOfferInfoByWaybillInfoId = offerInfoFacade.isExistSameOfferInfoByWaybillInfoId(params);
		if(isExistSameOfferInfoByWaybillInfoId){
			operateTitle = "编辑报价信息";
			Map<String,Object> queryMap = new HashMap<String,Object>();
			if(userRole ==2){
				queryMap.put("orgInfoId", orgInfoId);
			}else if(userRole == 4){
				queryMap.put("orgInfoId", userInfoId);
			}
			queryMap.put("waybillSourceInfoId", waybillSourceInfoId);
			OfferInfoPo offerInfoPo = offerInfoFacade.findOfferInfoByWaybillInfoId(queryMap);
			model.addAttribute("offerInfoPo", offerInfoPo);
			String offerPartyName = "";
			Integer offerParty = null;
			if(userRole==2){//物流公司
				//修改时查询出报价方名称
				OrgInfoPo orgInfo = new OrgInfoPo();
				if(offerInfoPo != null){
					orgInfo = orgInfoFacade.getOrgInfoByOrgInfoId(offerInfoPo.getOfferParty());
					offerPartyName = orgInfo.getOrgDetailInfo().getOrgName();
					offerParty = orgInfo.getId();
				}
				
			}else if(userRole==4){//司机
				UserInfo user = userInfoFacade.getUserInfoById(userInfoId);
				 model.addAttribute("driverName",user.getUserName());
				 model.addAttribute("userInfoId",userInfoId);
			}
			model.addAttribute("offerParty", offerParty);
			model.addAttribute("offerPartyName", offerPartyName);
			
		}else{
			operateTitle = "新增报价信息";
			if(userRole == 4){
				UserInfo user = userInfoFacade.getUserInfoById(userInfoId);
				 model.addAttribute("driverName",user.getUserName());
				 model.addAttribute("userInfoId",userInfoId);
			}
		}
		
		model.addAttribute("operateTitle", operateTitle);
		model.addAttribute("userRole", userRole);
		//一个主机构不能报自己机构的运单
		if(waybillInfoPo.getOrgRootId().equals(orgRootId)){
			JSONObject jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "本机构运单不可参与报价！");
			model.addAttribute("content", 1);
			return "template/receivables/prompt_box_page1";
		}
		return "template/supplyOfGoods/init_supply_of_goods_page";
	}
	
	/**
	 * 新增/编辑货源报价
	 * 
	 * @author luojaun 2017年6月26日
	 * @param request
	 * @param offerModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateOfferInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateOfferInfo(HttpServletRequest request,OfferModel offerModel){
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID、用户ID、用户角色
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		//获取流水单号
		String LSRedis="";
		try {
			LSRedis=CodeAutoGenerater.generaterCodeByFlag("LSDH");
		} catch (Exception e1) {
			
			String codeNum=capitalAccountFlowInfoFacade.findMaxLSDH();
			String date = new SimpleDateFormat("yyyyMMdd").format(new Date());
			String codeKey = "LSDH" + date;
			Integer currentNum = Integer.valueOf(codeNum.substring("LSDH".length()+8)) + 1;
			NumberFormat formatter = NumberFormat.getNumberInstance();
			formatter.setMinimumIntegerDigits(4);
			formatter.setGroupingUsed(false);
			String currentNumStr = formatter.format(currentNum);
			LSRedis = codeKey + currentNumStr;
		}
		try {
			jo = waybillInfoFacade.addOrUpdateOffer(offerModel, userInfoId, userRole, orgRootId,orgInfoId,userInfo,LSRedis);
		} catch (Exception e) {
			log.error("货源报价信息异常",e);
			
			jo = new JSONObject();
			
			jo.put("success", false);
			jo.put("msg", "报价信息添加失败");
		}
		
		return jo;
	}
	
	/**
	 *报价方查询初始化页面
	 *
	 * @author luojuan 2017年6月27日
	 */
	@RequestMapping(value = "/searchOfferPartyListPage")
	public String searchOfferPartyListPage(HttpServletRequest request, Model model){
		return "template/supplyOfGoods/offer_party_page";
	}
	
	/**
	 * 报价方信息查询
	 * 
	 * @author luojuan 2017年6月27日
	 * @return
	 */
	@RequestMapping("/getOfferPartyData")
	@ResponseBody
	public List<OrgInfoPo> getOfferPartyData(HttpServletRequest request, Model model) {
		List<OrgInfoPo> orgList = null;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
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
		
		//报价方
		String offerPartyName = "";
		if (params.get("offerParty") != null) {
			offerPartyName = params.get("offerParty").toString();
		}
		//根据报价方名称查询机构ID
		queryMap.put("rootOrgInfoId", rootOrgInfoId);
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgName", offerPartyName);
		
		orgList = orgInfoFacade.findOrgInfoByOfferParty(queryMap);
		
		return orgList;
	}
	
	/**
	 * 报价方信息总数查询
	 * 
	 * @author luojuan 2017年6月28日
	 * @return
	 */
	@RequestMapping("/getOfferPartyCount")
	@ResponseBody
	public Integer getOfferPartyCount(HttpServletRequest request, Model model) {
		Integer count = 0;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		
		//报价方
		String offerPartyName = "";
		if (params.get("offerParty") != null) {
			offerPartyName = params.get("offerParty").toString();
		}
		queryMap.put("orgName", offerPartyName);
		//物流公司传值主机构ID，司机传值用户ID
		if(userInfo.getUserRole() == 2){
			queryMap.put("rootOrgInfoId", userInfo.getOrgRootId());
		}else if(userInfo.getUserRole() == 4){
			queryMap.put("rootOrgInfoId", userInfo.getId());
		}
		
		try {
			count = orgInfoFacade.findRootAndTwoLevelOrgInfoCount(queryMap);
			return count;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return count;
	}
	
	/**
	 * 我的报价初始化页面
	 * 
	 * @author luojuan 2017年6月27日
	 */
	@RequestMapping("/rootMyOfferListPage")
	public String rootMyOfferListPage(){
		return "template/supplyOfGoods/show_my_offer_list_page";
	}
	
	/**
	 * 我的报价信息查询(分页)
	 * 
	 * @author luojaun 2017年6月27日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showMyOfferlistPage")
	public String showMyOfferlistPage(HttpServletRequest request, Model model){
		DataPager<WaybillInfoPo> MyOfferPager = new DataPager<WaybillInfoPo>();
		
		// 从session中取出当前用户的用户ID、用户权限和主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		MyOfferPager.setPage(page);
		
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		MyOfferPager.setSize(rows);
		
		//货物
		String goodsInfoId = null;
		if (params.get("goodsInfoId") != null) {
			goodsInfoId = params.get("goodsInfoId").toString();
		}
		
		//委托方
		String entrust = null;
		if (params.get("entrust") != null) {
			entrust = params.get("entrust").toString();
		}
		
		//发货单位
		String forwardingUnit = null;
		if (params.get("forwardingUnit") != null) {
			forwardingUnit = params.get("forwardingUnit").toString();
		}
		
		//到货单位
		String consignee = null;
		if (params.get("consignee") != null) {
			consignee = params.get("consignee").toString();
		}
		
		//计划拉运日期Start
		String planTransportDateStartStr = null;
		Date planTransportDateStart = null;
		if(params.get("planTransportDateStart") != null){
			planTransportDateStartStr = params.get("planTransportDateStart").toString();
			
			try {
				planTransportDateStart = new SimpleDateFormat("yyyy-MM-dd").parse(planTransportDateStartStr);
				
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		
		//计划拉运日期End
		String planTransportDateEndStr = null;
		Date planTransportDateEnd = null;
		if(params.get("planTransportDateEnd") != null){
			planTransportDateEndStr = params.get("planTransportDateEnd").toString();
			
			try {
				planTransportDateEnd = new SimpleDateFormat("yyyy-MM-dd").parse(planTransportDateEndStr);
				
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		
		//线路Start
		String lineNameStart = null;
		if (params.get("lineNameStart") != null) {
			lineNameStart = params.get("lineNameStart").toString();
		}
		
		//线路End
		String lineNameEnd = null;
		if (params.get("lineNameEnd") != null) {
			lineNameEnd = params.get("lineNameEnd").toString();
		}
		
		//运单状态
		String waybillStatus = null;
		if (params.get("waybillStatus") != null) {
			waybillStatus = params.get("waybillStatus").toString();
		}
				
		//是否中标
		String isBid = null;
		if (params.get("isBid") != null) {
			isBid = params.get("isBid").toString();
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		//如果是物流公司则用主机构ID和运单主键ID查询，司机则用登录用户ID和运单主键ID查询
		if(userRole == 2){
			queryMap.put("orgRootId",orgRootId);
		}else if(userRole == 4){
			queryMap.put("orgRootId",userInfoId);
		}
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("goodsInfoId", goodsInfoId);
		queryMap.put("entrust", entrust);
		queryMap.put("forwardingUnit", forwardingUnit);
		queryMap.put("consignee", consignee);
		queryMap.put("planTransportDateStart", planTransportDateStart);
		queryMap.put("planTransportDateEnd", planTransportDateEnd);
		queryMap.put("lineNameStart", lineNameStart);
		queryMap.put("lineNameEnd", lineNameEnd);
		queryMap.put("waybillStatus", waybillStatus);
		queryMap.put("isBid", isBid);
		
		//3、查询我的报价信息管理总数
		Integer totalNum = waybillInfoFacade.countMyOfferForPage(queryMap);
		
		//4、分页查询我的报价信息
		List<WaybillInfoPo> WaybillInfoList = waybillInfoFacade.findMyOfferForPage(queryMap);
		
		if(CollectionUtils.isNotEmpty(WaybillInfoList)){
			// 获取报价方id
			List<Integer> orgInfoIdList = CommonUtils.getValueList(WaybillInfoList, "offerParty");
			// 获取机构名称
			List<OrgInfoPo> orgInfoList = orgInfoFacade.findOrgNameByIds(orgInfoIdList);
			// 封装成map key 机构id value 组织机构名称
			Map<Integer, String> orgInfoMap = CommonUtils.listforMap(orgInfoList, "id", "orgName");
			
			// 获取委托方id
			List<Integer> entrustIdList = CommonUtils.getValueList(WaybillInfoList, "entrust");
			// 获取机构名称
			List<OrgInfoPo> entrustList = orgInfoFacade.findOrgNameByIds(entrustIdList);
			// 封装成map key 机构id value 组织机构名称
			Map<Integer, String> entrustMap = CommonUtils.listforMap(entrustList, "id", "orgName");
			
			//获取货物id
			List<Integer> goodsInfoIdList = CommonUtils.getValueList(WaybillInfoList, "goodsInfoId");
			//获取货物名称
			List<GoodsInfo> goodsInfoList = new ArrayList<GoodsInfo>();
			if(CollectionUtils.isNotEmpty(goodsInfoIdList)){
				goodsInfoList = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIdList);
			}
			//封装成map key 货物id value 货物名称
			Map<Integer,String> goodsInfoMap = new HashMap<Integer,String>();
			if(CollectionUtils.isNotEmpty(goodsInfoList)){
				goodsInfoMap = CommonUtils.listforMap(goodsInfoList, "id", "goodsName");
			}
			
			for(WaybillInfoPo waybillInfoPo:WaybillInfoList){
				//报价方名称
				if(waybillInfoPo.getOfferParty() != null&&orgInfoMap.get(waybillInfoPo.getOfferParty()) != null){
					waybillInfoPo.setOfferPartyName(orgInfoMap.get(waybillInfoPo.getOfferParty()));
				}
				
				//委托方
				/*if(waybillInfoPo.getEntrust() != null&&entrustMap.get(waybillInfoPo.getEntrust()) != null){
					waybillInfoPo.setEntrustName(entrustMap.get(waybillInfoPo.getEntrust()));
				}*/
				if(entrustMap.size() >0 ){
					if(waybillInfoPo.getEntrust() != null&&entrustMap.get(waybillInfoPo.getEntrust()) != null){
						waybillInfoPo.setEntrustName(entrustMap.get(waybillInfoPo.getEntrust()));
					}
				}else{
					Integer entrust1 = waybillInfoPo.getEntrust();
					String entrustName = individualOwnerFacade.getIndividualOwnerNameByUserInfoId(entrust1);
					waybillInfoPo.setEntrustName(entrustName);
				}
				
				//前台获取货物名称
				if(waybillInfoPo.getGoodsInfoId() != null&&goodsInfoMap.get(waybillInfoPo.getGoodsInfoId())!=null){
					waybillInfoPo.setGoodsName(goodsInfoMap.get(waybillInfoPo.getGoodsInfoId()));
				}
				
				//前台获取地点
				Integer lineInfoId = waybillInfoPo.getLineInfoId();
				List<LocationInfoPo> lineInfoList = locationInfoFacade.findLocationById(lineInfoId);
				String lineInfoName = null;
				for(LocationInfoPo locationInfoPo : lineInfoList){
					lineInfoName = locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty();
				}
				waybillInfoPo.setLineInfoName(lineInfoName);
			}
		}
		
		//5、总数、分页信息封装
		MyOfferPager.setTotal(totalNum);
		MyOfferPager.setRows(WaybillInfoList);
		
		model.addAttribute("userRole",userRole);
		model.addAttribute("MyOfferPager",MyOfferPager);
		
		return "template/supplyOfGoods/my_offer_data";
		
	}

}
