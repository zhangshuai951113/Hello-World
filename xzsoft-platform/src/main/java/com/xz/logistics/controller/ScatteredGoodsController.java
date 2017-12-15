package com.xz.logistics.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
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
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.dubbo.common.utils.CollectionUtils;
import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.facade.api.CarInfoFacade;
import com.xz.facade.api.CarSourceInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.facade.api.OfferInfoFacade;
import com.xz.facade.api.OrgDetailInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.PartnerInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.logistics.utils.CodeAutoGenerater;
import com.xz.model.enums.GoodsUnitsEnum;
import com.xz.model.po.CarSourceInfoPo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.LocationInfoPo;
import com.xz.model.po.OfferInfoPo;
import com.xz.model.po.OrgDetailInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.PartnerInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillInfoPo;
import com.xz.model.vo.EnumsModel;
import com.xz.model.vo.WaybillInfoModel;


/**
* @author zhangshuai   2017年6月28日 上午11:01:05
* 类说明(零散货物controller)
*/
@Controller
@RequestMapping("scatteredGoods")
public class ScatteredGoodsController {

	private final Logger log=LoggerFactory.getLogger(getClass());
	@Resource
	private LineInfoFacade lineInfoFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private OrgDetailInfoFacade orgDetailInfoFacade;
	@Resource
	private CarSourceInfoFacade carSourceInfoFacade;
	@Resource
	private PartnerInfoFacade partnerInfoFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;
	@Resource
	private WaybillInfoFacade waybillInfoFacade;
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	@Resource
	private LocationInfoFacade locationInfoFacade;
	@Resource
	private OfferInfoFacade offerInfoFacade;
	@Resource
	private CarInfoFacade carInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;
	
	/**==================零散货物信息======================*/
	/**
	 * @author zhangshuai  2017年6月28日 下午4:19:40
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入零散货物页面
	 */
	@RequestMapping(value="/goScatteredGoodsPage",produces="application/json;charset=utf-8")
	public String goScatteredGoodsPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String scatteredGoodsPage="零散货物管理";
		model.addAttribute("scatteredGoodsPage", scatteredGoodsPage);
		//查询所有线路
		List<LineInfoPo> lineName=lineInfoFacade.findLineInfoNameAll();
		
		model.addAttribute("lineName", lineName);
		return "template/scatteredGoods/distributeScatteredGoods/distribute_scattered_goods_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月30日 下午11:20:26
	 * @param request
	 * @param response
	 * @return
	 * 零散货物全查
	 */
	@RequestMapping(value="/findDistributeScatteredGoodsAllMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<WaybillInfoPo> findDistributeScatteredGoodsAllMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer uId=userInfo.getId();
		Integer uUserRole=userInfo.getUserRole();
		//接收页面参数
		String scatteredGoods=request.getParameter("scatteredGoods");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String waybillStatus=request.getParameter("waybillStatus");
		String startAddress=request.getParameter("startAddress");
		String endAddress=request.getParameter("endAddress");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		String planTransportDateStart=request.getParameter("planTransportDateStart");
		String	planTransportDateEnd=request.getParameter("planTransportDateEnd");
		Integer addOrUpdate=Integer.parseInt(request.getParameter("addOrUpdate"));
		//零散货物信息全查
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		//发布方式集合
		List<Integer> releaseModeList=new ArrayList<Integer>();
		List<Integer> waybillInStatusList=new ArrayList<Integer>();
		if(addOrUpdate==1){
			releaseModeList.add(2);
			releaseModeList.add(3);
			releaseModeList.add(4);
		}else 
			//平台中标页面信息全查
			if(addOrUpdate==2){
				releaseModeList.add(1);
				waybillInStatusList.add(10);
				waybillInStatusList.add(11);
				waybillInStatusList.add(2);
				waybillInStatusList.add(3);
				waybillInStatusList.add(4);
				waybillInStatusList.add(5);
				params.put("waybillInStatusList", waybillInStatusList);
		}
		
		params.put("releaseModeList", releaseModeList);
		params.put("scatteredGoods", scatteredGoods);//零散货物
		params.put("entrust", entrust);//委托方
		params.put("shipper", shipper);//承运方
		params.put("forwardingUnit", forwardingUnit);//发货单位
		params.put("consignee", consignee);//到货单位
		params.put("waybillStatus", waybillStatus);//运单状态
		params.put("startAddress", startAddress);//线路起点
		params.put("endAddress", endAddress);//线路终点
		params.put("start", start);//起始页
		params.put("rows", rows);//分页尺寸
		params.put("planTransportDateStart", planTransportDateStart);//计划拉运日期(开始)
		params.put("planTransportDateEnd", planTransportDateEnd);//计划拉运日期(结束)
		if(uUserRole==3){
			params.put("orgRootId", uId);//登录用户主机构ID
		}else{
			params.put("orgRootId", uOrgRootId);//登录用户主机构ID
		}
		//params.put("createUser", uId);//创建人为登录用户
		//params.put("waybillClassify", 2);//零散货物运单
		//查询零散货物信息(登录用户主机构ID，创建人为登录用户，零散货物运单，匹配车源，派发合作伙伴，派发内部司机     
		//模糊条件(零散货物,委托方,承运方,发货单位,到货单位,运单状态,起始页,分页尺寸,计划拉运日期(开始),计划拉运日期(结束)))
		List<WaybillInfoPo> waybillInfoPoList=waybillInfoFacade.findDistributeScatteredGoodsAllMation(params);
		
		//查询线路起点(零散货物)
		List<Integer> startPointsIds=CommonUtils.getValueList(waybillInfoPoList, "lineInfoId");
		Map<Integer, String>  startPointsMap = null;
		if(CollectionUtils.isNotEmpty(startPointsIds)){
			List<LocationInfoPo> LineInfos=locationInfoFacade.findLocationNameByIds(startPointsIds);
			for (LocationInfoPo locationInfoPo : LineInfos) {
				locationInfoPo.setLineName(locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty());
			}
			if (CollectionUtils.isNotEmpty(LineInfos)) {
				 startPointsMap = CommonUtils.listforMap(LineInfos, "id", "lineName");
			}
		}
		
		//查询线路终点
		List<Integer> endPointsIds=CommonUtils.getValueList(waybillInfoPoList, "endPoints");
		Map<Integer, String>  endPointsMap = null;
		if(CollectionUtils.isNotEmpty(endPointsIds)){
			List<LocationInfoPo> LineInfos=locationInfoFacade.findLocationNameByIds(endPointsIds);
			for (LocationInfoPo locationInfoPo : LineInfos) {
				locationInfoPo.setLineName(locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty());
			}
			if (CollectionUtils.isNotEmpty(LineInfos)) {
				endPointsMap = CommonUtils.listforMap(LineInfos, "id", "lineName");
			}
		}
		
		// 查询线路（物流运单的线路id是line_info_id和零散货物起点共用一个字段）
		List<Integer> lineInfoIds=CommonUtils.getValueList(waybillInfoPoList, "lineInfoId");
		Map<Integer, LineInfoPo> lineInfoMap= new HashMap<Integer, LineInfoPo>();
		if(CollectionUtils.isNotEmpty(lineInfoIds)){
			List<LineInfoPo> lineInfoList = lineInfoFacade.findLineInfoByIds(lineInfoIds);
			if (lineInfoList != null && lineInfoList.size() > 0) {
				for (LineInfoPo lineInfoPo : lineInfoList) {
					lineInfoMap.put(lineInfoPo.getId(), lineInfoPo);
				}
			}
		}

		// 运单分类
		Integer waybillClassfy = null;
		// 线路对象
		LineInfoPo lineInfo = null;
		for (WaybillInfoPo waybillInfoPo : waybillInfoPoList) {
			waybillClassfy = waybillInfoPo.getWaybillClassify();
			//判断委托方角色
			//个体货主
			if(waybillInfoPo.getEntrustUserRole()==3){
				//根据委托方查询个体货主表真实名称
				IndividualOwnerPo individualOwnerPo=individualOwnerFacade.findIndividualOwnerById(waybillInfoPo.getEntrust());
				if(individualOwnerPo!=null){
					waybillInfoPo.setEntrustName(individualOwnerPo.getRealName());
				}
			}else 
				//企业货主/物流公司
				if(waybillInfoPo.getEntrustUserRole()==1 || waybillInfoPo.getEntrustUserRole()==2){
				
					List<Integer> EntrustList=new ArrayList<Integer>();
					EntrustList.add(waybillInfoPo.getEntrust());
					List<OrgInfoPo> org = orgInfoFacade.findOrgNameByIds(EntrustList);
					if(CollectionUtils.isNotEmpty(org)){
						for (OrgInfoPo orgInfoPo : org) {
							waybillInfoPo.setEntrustName(orgInfoPo.getOrgName());
						}
					}
			}
			
			if(waybillInfoPo.getShipper()!=null){
				//查询承运方所属机构
				List<Integer> shipperList=new ArrayList<Integer>();
				shipperList.add(waybillInfoPo.getShipper());
				List<OrgInfoPo> org = orgInfoFacade.findOrgNameByIds(shipperList);
				if(CollectionUtils.isNotEmpty(org)){
					for (OrgInfoPo orgInfoPo : org) {
						waybillInfoPo.setShipperName(orgInfoPo.getOrgName());
					}
				}
			}
			
			
			//判断司机编号是否为空
			if(waybillInfoPo.getUserInfoId()!=null){
				List<Integer> userInfoIdList=new ArrayList<Integer>();
				userInfoIdList.add(waybillInfoPo.getUserInfoId());
				List<DriverInfo> DriverInfoList = driverInfoFacade.findDriverByUserInfoIds(userInfoIdList);
				for (DriverInfo driverInfo : DriverInfoList) {
					waybillInfoPo.setDriverName(driverInfo.getDriverName());
				}
				
			}
			// 如果运单分类是大宗货物运单，则线路表的起点和终点 ，来自于线路表
			if (waybillClassfy == 1) {
				if (lineInfoMap != null && lineInfoMap.size() > 0) {
					lineInfo = lineInfoMap.get(waybillInfoPo.getLineInfoId());
					if (lineInfo != null ) {
						//封装线路起点
						if (lineInfo.getStartPoints() != null) {
							waybillInfoPo.setLineInfoName(lineInfo.getStartPoints());
						}
						//封装线路终点
						if (lineInfo.getEndPoints() != null) {
							waybillInfoPo.setEndPointsStr(lineInfo.getEndPoints());
						}
					}
				}
			}
			
			// 如果运单分类是零散货物运单，则线路的起点和终点 ，来自于地点表
			if (waybillClassfy == 2) {
				//封装线路起点
				if (MapUtils.isNotEmpty(startPointsMap) && startPointsMap.get(waybillInfoPo.getLineInfoId()) != null) {
					waybillInfoPo.setLineInfoName(startPointsMap.get(waybillInfoPo.getLineInfoId()));
				}
				
				//封装线路终点
				if (MapUtils.isNotEmpty(endPointsMap) && endPointsMap.get(waybillInfoPo.getEndPoints()) != null) {
					waybillInfoPo.setEndPointsStr(endPointsMap.get(waybillInfoPo.getEndPoints()));
				}
			}
			
			
			//发布时间
			waybillInfoPo.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(waybillInfoPo.getCreateTime()));
			
			//计划拉运日期
			waybillInfoPo.setPlanTransportDateStartStr(new SimpleDateFormat("yyyy-MM-dd").format(waybillInfoPo.getPlanTransportDate()));
			if(waybillInfoPo.getReleaseMode()==1){
				//报价截止日期
				if(waybillInfoPo.getOfferEndDate()!=null){
					waybillInfoPo.setOfferEndDateStr(new SimpleDateFormat("yyyy-MM-dd").format(waybillInfoPo.getOfferEndDate()));
				}
				
				//报价家数
				Integer count = offerInfoFacade.getOfferInfoByWaybillInfoId(waybillInfoPo.getId());
				waybillInfoPo.setNumberOfQuotations(count);
			}
		}		
		return waybillInfoPoList;
	}
	
	/**
	 * @author zhangshuai  2017年7月2日 下午8:33:36
	 * @param request
	 * @param response
	 * @return
	 * 查询零散货物总数
	 */
	@RequestMapping(value="/getDistributeScatteredGoodsAllCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getDistributeScatteredGoodsAllCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer uId=userInfo.getId();
		Integer uUserRole=userInfo.getUserRole();
		//接收页面参数
		String scatteredGoods=request.getParameter("scatteredGoods");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String waybillStatus=request.getParameter("waybillStatus");
		String startAddress=request.getParameter("startAddress");
		String endAddress=request.getParameter("endAddress");
		String planTransportDateStart=request.getParameter("planTransportDateStart");
		String	planTransportDateEnd=request.getParameter("planTransportDateEnd");
		Integer addOrUpdate=Integer.parseInt(request.getParameter("addOrUpdate"));
		Map<String, Object> params=new HashMap<String,Object>();
		//发布方式集合
		List<Integer> releaseModeList=new ArrayList<Integer>();
		List<Integer> waybillInStatusList=new ArrayList<Integer>();
		if(addOrUpdate==1){
			releaseModeList.add(2);
			releaseModeList.add(3);
			releaseModeList.add(4);
		}else 
			//平台中标页面信息全查
			if(addOrUpdate==2){
				releaseModeList.add(1);
				waybillInStatusList.add(10);
				waybillInStatusList.add(11);
				waybillInStatusList.add(2);
				waybillInStatusList.add(3);
				waybillInStatusList.add(4);
				waybillInStatusList.add(5);
				params.put("waybillInStatusList", waybillInStatusList);
		}
		
		params.put("releaseModeList", releaseModeList);
		params.put("scatteredGoods", scatteredGoods);//零散货物
		params.put("entrust", entrust);//委托方
		params.put("shipper", shipper);//承运方
		params.put("forwardingUnit", forwardingUnit);//发货单位
		params.put("consignee", consignee);//到货单位
		params.put("waybillStatus", waybillStatus);//运单状态
		params.put("startAddress", startAddress);//线路起点
		params.put("endAddress", endAddress);//线路终点
		params.put("planTransportDateStart", planTransportDateStart);//计划拉运日期(开始)
		params.put("planTransportDateEnd", planTransportDateEnd);//计划拉运日期(结束)
		if(uUserRole==3){
			params.put("orgRootId", uId);//登录用户主机构ID
		}else{
			params.put("orgRootId", uOrgRootId);//登录用户主机构ID
		}			
				
		
		Integer count=waybillInfoFacade.getDistributeScatteredGoodsAllCount(params);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年7月21日 下午4:40:31
	 * @param request
	 * @param response
	 * @return
	 * 进入添加模态框前进行登录用户角色信息判断
	 */
	@RequestMapping(value="/judgeLoginUserRole",produces="application/json;charset=utf-8")
	@ResponseBody
	public UserInfo judgeLoginUserRole(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		return userInfo;
	}
	
	/**
	 * @author zhangshuai  2017年6月28日 上午11:43:25
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入新增零散货物模态框
	 */
	@RequestMapping(value="/addScatteredGoodsModel",produces="application/json;charset=utf-8")
	public String addScatteredGoodsModel(HttpServletRequest request,HttpServletResponse response,Model model){
		String addScatteredGoods="新增零散货物";
		model.addAttribute("addScatteredGoods", addScatteredGoods);
		
		//封装零散货物计量单位
		List<EnumsModel> goodsUnitsList=new ArrayList<EnumsModel>();
		if(GoodsUnitsEnum.values()!=null){
			for(GoodsUnitsEnum eInfo:GoodsUnitsEnum.values()){
				EnumsModel eModel=new EnumsModel();
				eModel.setCode(eInfo.getCode());
				eModel.setDesc(eInfo.getDesc());
				goodsUnitsList.add(eModel);
			}
		}
		model.addAttribute("goodsUnitsList", goodsUnitsList);
		return "template/scatteredGoods/distributeScatteredGoods/add_distribute_scattered_goods_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月28日 下午1:55:42
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入查询委托方页面
	 */
	@RequestMapping(value="/goFindEntrustPage",produces="application/json;charset=utf-8")
	public String goFindEntrustPage(HttpServletRequest request,HttpServletResponse response,Model model){
		
		String findEntrust="选择委托方信息";
		model.addAttribute("findEntrust", findEntrust);
		return "template/scatteredGoods/distributeScatteredGoods/find_entrust_info_page";
		
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午12:56:36
	 * @return
	 * 委托方信息全查
	 */
	@RequestMapping(value="/findEntrustMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<OrgInfoPo> findEntrustMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取到登录用户的主机构ID
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//获取参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("rootOrgInfoId", uOrgRootId);//主机构ID
	  //params.put("isAvailable", 1);//启用
		params.put("orgStatus", 3);//审核通过
		params.put("orgType", 1);//机构
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		
		//根据登录用户主机构ID查询组织机构信息(组织机构ID,审核通过,启用)
		List<OrgInfoPo> orginfoPoList=orgInfoFacade.findEntrustMationByRootOrgInfoId(params);
		
		return orginfoPoList;
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午4:41:48
	 * @param request
	 * @param response
	 * @return
	 * 查询委托方总记录数
	 */
	@RequestMapping(value="/getEntrustCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getEntrustCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取到登录用户的主机构ID
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("rootOrgInfoId", uOrgRootId);//主机构ID
		params.put("orgStatus", 3);//审核通过
		params.put("orgType", 1);//机构
		
		//查询委托方总记录数
		Integer count=orgInfoFacade.getEntrustCount(params);
		return count;
				
	}
	
	/**
	 * @author zhangshuai  2017年6月24日 下午2:22:17
	 * @param request
	 * @param response
	 * @return
	 * 根据选择的委托方ID查询委托方名称
	 */
	@RequestMapping(value="/findEnstusNameById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findEnstusNameById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//接收页面参数
		Integer Eids=Integer.valueOf(request.getParameter("Eids"));
		
		String EName=null;
		//根据选择的委托方ID查询委托方信息
		try {
			List<Integer> orgInfoIds=new ArrayList<Integer>();
			orgInfoIds.add(Eids);
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					EName=orgInfoPo.getOrgName();
				}
			}
			jo.put("success", true);
			jo.put("msg", EName);
		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", "查询失败!");
		}
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月28日 下午5:23:32
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入查询车源信息页面
	 */
	@RequestMapping(value="/goCarSourcePage",produces="application/json;charset=utf-8")
	public String goCarSourcePage(HttpServletRequest request,HttpServletResponse response,Model model){
		
		String carSource="选择车源信息";
		model.addAttribute("carSource", carSource);
		return "template/scatteredGoods/distributeScatteredGoods/find_car_source_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月28日 下午6:45:32
	 * @param request
	 * @param response
	 * @return
	 * 当发布方式为匹配车源时全查车源信息
	 */
	@RequestMapping(value="/findCarSourceMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<CarSourceInfoPo> findCarSourceMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer userId=userInfo.getId();//登录用户ID
		Integer userRole=userInfo.getUserRole();//登录用户角色
		Integer userRootId=null;
		//企业货主/物流公司
		if(userRole==1 || userRole==2){
			userRootId=userInfo.getOrgRootId();
		}else 
			//个体货主
			if(userRole==3){
			userRootId=userId;
		}
		
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		params.put("carSourceStatus", 1);//已发布
		params.put("currentTime", Calendar.getInstance().getTime());//当前时间
		params.put("rootReleasePerson", userRootId);//发布方主机构
		
		List<CarSourceInfoPo> carSourceInfoPoList=carSourceInfoFacade.findCarSourceMation(params);
		
		for (CarSourceInfoPo carSourceInfoPo : carSourceInfoPoList) {

			if(carSourceInfoPo!=null){
				
				
				//判断发布方角色信息
				//物流公司
				if(carSourceInfoPo.getReleasePersonRole()==1){
					//查询发布方主机构信息
					OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoById(carSourceInfoPo.getRootReleasePerson());
					//根据主机构ID和修改版本号查询主机构明细名称
					Map<String, Object> params1=new HashMap<String,Object>();
					params1.put("orgInfoId", orgInfoPo.getId());//组织机构ID
					params1.put("orgVersion", orgInfoPo.getCurrentVersion());
					OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params1);
					carSourceInfoPo.setRootReleasePersonStr(orgDetailInfoPo.getOrgName());
					//查询发布方信息
					OrgInfoPo orgInfoPo1 = orgInfoFacade.getOrgInfoById(carSourceInfoPo.getReleasePerson());
					//根据主机构ID和修改版本号查询主机构明细名称
					Map<String, Object> params2=new HashMap<String,Object>();
					params2.put("orgInfoId", orgInfoPo1.getId());
					params2.put("orgVersion", orgInfoPo1.getCurrentVersion());
					OrgDetailInfoPo orgDetailInfoPo1 = orgDetailInfoFacade.findOdiNameByOrgInfoId(params2);
					carSourceInfoPo.setReleasePersonName(orgDetailInfoPo1.getOrgName());
				}else 
					//司机
					if(carSourceInfoPo.getReleasePersonRole()==2){
					
					//发布方主机构
					List<Integer> userInfoIds=new ArrayList<Integer>();
					userInfoIds.add(carSourceInfoPo.getRootReleasePerson());
					List<DriverInfo> drInfo = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
					if(CollectionUtils.isNotEmpty(drInfo)){
						for (DriverInfo driverInfo : drInfo) {
							carSourceInfoPo.setRootReleasePersonStr(driverInfo.getDriverName());
						}
					}
					
					//发布方
					List<Integer> userInfoId=new ArrayList<Integer>();
					userInfoId.add(carSourceInfoPo.getReleasePerson());
					List<DriverInfo> driverInfo = driverInfoFacade.findDriverByUserInfoIds(userInfoId);
					if(CollectionUtils.isNotEmpty(driverInfo)){
						for (DriverInfo driverInfo1 : driverInfo) {
							carSourceInfoPo.setReleasePersonName(driverInfo1.getDriverName());
						}
					}
					
				}
			}
		}
		return carSourceInfoPoList;
	}
	
	/**
	 * @author zhangshuai  2017年6月28日 下午8:01:36
	 * @return
	 * 查询车源最大记录数
	 */
	@RequestMapping(value="/getCarSourceCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getCarSourceCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer userId=userInfo.getId();//登录用户ID
		Integer userRole=userInfo.getUserRole();//登录用户角色
		Integer userRootId=null;
		//企业货主/物流公司
		if(userRole==1 || userRole==2){
			userRootId=userInfo.getOrgRootId();
		}else 
			//个体货主
			if(userRole==3){
			userRootId=userId;
		}
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("carSourceStatus", 1);//已发布
		params.put("currentTime", Calendar.getInstance().getTime());//当前时间
		params.put("rootReleasePerson", userRootId);//发布方主机构
		
		Integer count=carSourceInfoFacade.getCarSourceCount(params);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月28日 下午8:14:03
	 * @param request
	 * @param response
	 * @return
	 * 根据车源ID查询车源信息
	 */
	@RequestMapping(value="/findReleasePersonNameById",produces="application/json;charset=utf-8")
	@ResponseBody
	public CarSourceInfoPo findReleasePersonNameById(HttpServletRequest request,HttpServletResponse response){
		//接收页面车源ID
		Integer Cids=Integer.valueOf(request.getParameter("Cids"));
		
		//根据车源ID查询车源信息，获取发布方名称
		CarSourceInfoPo carSource=carSourceInfoFacade.getCarSourceByCSId(Cids);
		
		/*//车牌号
		if(carSource.getCarCode()!=null){
			//根据车牌号ID查询车牌号
			List<Integer> carInfoIds=new ArrayList<Integer>();
			carInfoIds.add(Integer.parseInt(carSource.getCarCode()));
			List<CarInfoPo> carInfoPos = carInfoFacade.findCarCodeNameByIds(carInfoIds);
			if(CollectionUtils.isNotEmpty(carInfoPos)){
				for (CarInfoPo carInfoPo : carInfoPos) {
					carSource.setCarCodeName(carInfoPo.getCarCode());
				}
				
			}
		}*/
		
		carSource.setCarCodeName(carSource.getCarCodeName());
		
			//判断发布方角色
			if(carSource.getReleasePersonRole()==1){
				//根据发布方查询机构表获取版本号
				OrgInfoPo orgInfo = orgInfoFacade.findOrgInfoByIdId(carSource.getReleasePerson());
				
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("orgInfoId", carSource.getReleasePerson());
				params.put("orgVersion", orgInfo.getCurrentVersion());
				OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params);
				carSource.setReleasePersonName(orgDetailInfoPo.getOrgName());
			}else if(carSource.getReleasePersonRole()==2){
				//根据发布方查询司机名称
				List<Integer> userInfoIds=new ArrayList<Integer>();
				userInfoIds.add(carSource.getReleasePerson());
				List<DriverInfo> driverInfo = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
				if(CollectionUtils.isNotEmpty(driverInfo)){
					for (DriverInfo driverInfo2 : driverInfo) {
						carSource.setReleasePersonName(driverInfo2.getDriverName());
					}
				}
				
			}
		return carSource;
	}
	
	/**
	 * @author zhangshuai  2017年6月29日 上午10:15:04
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 当发布方式为合作伙伴时进入选择合作伙伴模态框
	 */
	@RequestMapping(value="/goPartnerInfoTempPage",produces="application/json;charset=utf-8")
	public String goPartnerInfoTempPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String partnerInfoTempPage="选择合作伙伴";
		model.addAttribute("partnerInfoTempPage", partnerInfoTempPage);
		return "template/scatteredGoods/distributeScatteredGoods/find_partner_info_temp_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月29日 上午10:55:01
	 * @param request
	 * @param response
	 * @return
	 * 查询合作伙伴信息
	 */
	@RequestMapping(value="/findPartnerInfoTempMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<PartnerInfoPo> findPartnerInfoTempMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=null;
		Integer uUserRole=userInfo.getUserRole();
		//个体货主/司机
		if(uUserRole==3 || uUserRole==4){
			uOrgRootId=uId;
		}else 
			//企业货主/物流公司
			if(uUserRole==1 || uUserRole==2){
				uOrgRootId=userInfo.getOrgRootId();
		}
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//判断登录用户角色
		//物流公司/企业货主
		if(uUserRole==2 || uUserRole==1){
			
			//封装参数
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("originTeamCode", uOrgRootId);//发起方数据归属编号
			params.put("currentPage", currentPage);
			params.put("rows", rows);
			
			//如果物流公司则用登录用户主机构ID匹配发起方数据归属编号,合作伙伴角色为“物流公司”和“司机”，启用状态为“已启用”状态的数据
			List<PartnerInfoPo> PartnerInfoPoList=partnerInfoFacade.findPartnerInfoTempMation(params);
			for (PartnerInfoPo partnerInfoPo : PartnerInfoPoList) {
				if(partnerInfoPo.getPartnerRole()==2){
					//根据合作伙伴编号查询名称
					Map<String, Object> params1=new HashMap<String,Object>();
					params1.put("orgInfoId", partnerInfoPo.getPartnerCode());
					List<Integer> orgInfoIds=new ArrayList<Integer>();
					orgInfoIds.add(partnerInfoPo.getPartnerCode());
					List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
					if(CollectionUtils.isNotEmpty(orgInfoPos)){
						for (OrgInfoPo orgInfoPo : orgInfoPos) {
							partnerInfoPo.setPartnerName(orgInfoPo.getOrgName());
						}
					}
				}else if(partnerInfoPo.getPartnerRole()==4){
					//根据受理方查询名称
					List<Integer> idList=new ArrayList<Integer>();
					idList.add(partnerInfoPo.getPartnerTeamCode());
					//根据司机ID查询司机表信息
					List<DriverInfo> driverInfo = driverInfoFacade.findDriverByUserInfoIds(idList);
					for (DriverInfo driverInfo2 : driverInfo) {
						partnerInfoPo.setPartnerName(driverInfo2.getDriverName());
					}
				}
			}
			return PartnerInfoPoList;
		}else 
			//个体货主
			if(uUserRole==3){
				//封装参数
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("originTeamCode", uId);//发起方数据归属编号
				params.put("currentPage", currentPage);
				params.put("rows", rows);
				
				//(如是个体货主则用登录用户ID匹配发起方数据归属编号，合作伙伴角色为“物流公司”和“司机”，启用状态为“已启用”状态的数据)
				List<PartnerInfoPo> PartnerInfoPoList=partnerInfoFacade.findPartnerInfoTempMation(params);
				for (PartnerInfoPo partnerInfoPo : PartnerInfoPoList) {
					if(partnerInfoPo.getPartnerRole()==2){
						//根据受理方查询名称
						Map<String, Object> params1=new HashMap<String,Object>();
						params1.put("orgInfoId", partnerInfoPo.getPartnerTeamCode());
						List<Integer> orgInfoIds=new ArrayList<Integer>();
						orgInfoIds.add(partnerInfoPo.getPartnerTeamCode());
						List<OrgInfoPo> orgDetailInfoPo = orgInfoFacade.findOrgNameByIds(orgInfoIds);
						if(CollectionUtils.isNotEmpty(orgDetailInfoPo)){
							for (OrgInfoPo orgInfoPo : orgDetailInfoPo) {
								partnerInfoPo.setPartnerName(orgInfoPo.getOrgName());
							}
						}
						
					}else if(partnerInfoPo.getPartnerRole()==4){
						List<Integer> userInfoIds=new ArrayList<Integer>();
						userInfoIds.add(partnerInfoPo.getPartnerCode());
						List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
						if(CollectionUtils.isNotEmpty(driverInfos)){
							for (DriverInfo driverInfo : driverInfos) {
								partnerInfoPo.setPartnerName(driverInfo.getDriverName());
							}
						}
					}
					
				}
				return PartnerInfoPoList;
		}
		return null;
	}
	
	/**
	 * @author zhangshuai  2017年6月29日 上午11:53:25
	 * @param request
	 * @param response
	 * @return
	 * 查询合作伙伴最大记录数
	 */
	@RequestMapping(value="/getPartnerInfoTempCount",produces="application/json;cgarset=utf-8")
	@ResponseBody
	public Integer getPartnerInfoTempCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer uUserRole=userInfo.getUserRole();
		
		Integer count=null;
		
		//判断登录用户角色
		//物流公司/企业货主
		if(uUserRole==2 || uUserRole==1){
			
			//封装参数
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("originTeamCode", uOrgRootId);//发起方数据归属编号
			
			//如果物流公司则用登录用户主机构ID匹配发起方数据归属编号,合作伙伴角色为“物流公司”和“司机”，启用状态为“已启用”状态的数据
			count=partnerInfoFacade.getPartnerInfoTempCount(params);
			
		}else 
			//个体货主
			if(uUserRole==3){
				//封装参数
				Map<String, Object> params=new HashMap<String,Object>();
				params.put("originTeamCode", uId);//发起方数据归属编号
				
				//(如是个体货主则用登录用户ID匹配发起方数据归属编号，合作伙伴角色为“物流公司”和“司机”，启用状态为“已启用”状态的数据)
				count=partnerInfoFacade.getPartnerInfoTempCount(params);
		}
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月29日 下午12:31:09
	 * @param request
	 * @param response
	 * @return
	 * 根据操作合作伙伴ID查询合作伙伴名称
	 */
	@RequestMapping(value="/findPartnerInfoTempById",produces="application/json;charset=utf-8")
	@ResponseBody
	public PartnerInfoPo findPartnerInfoTempById(HttpServletRequest request,HttpServletResponse response){
		
		//获取前台操作合作伙伴ID
		Integer PIds=Integer.valueOf(request.getParameter("Pids"));
		
		//根据合作伙伴ID查询合作伙伴信息
		//封装参数
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("id", PIds);
			PartnerInfoPo partnerInfoPo=partnerInfoFacade.findPartnerInfoTempById(params);
			if(partnerInfoPo!=null){
				if(partnerInfoPo.getPartnerRole()==2){
					/*//封装参数
					Map<String, Object> params1=new HashMap<String,Object>();
					params1.put("orgInfoId", partnerInfoPo.getPartnerCode());
					//根据受理方查询名称
					OrgDetailInfoPo OrgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params1);
					if(OrgDetailInfoPo!=null){
						partnerInfoPo.setPartnerName(OrgDetailInfoPo.getOrgName());
					}*/
					List<Integer> orgInfoIds=new ArrayList<Integer>();
					orgInfoIds.add(partnerInfoPo.getPartnerCode());
					List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
					if(CollectionUtils.isNotEmpty(orgInfoPos)){
						for (OrgInfoPo orgInfoPo : orgInfoPos) {
							partnerInfoPo.setPartnerName(orgInfoPo.getOrgName());
						}
					}
					
				}else if(partnerInfoPo.getPartnerRole()==4){
					List<Integer> userInfoId=new ArrayList<Integer>();
					userInfoId.add(partnerInfoPo.getPartnerCode());
					//根据司机ID查询司机表信息
					List<DriverInfo> driverInfo = driverInfoFacade.findDriverByUserInfoIds(userInfoId);
					for (DriverInfo driverInfo2 : driverInfo) {
						partnerInfoPo.setPartnerName(driverInfo2.getDriverName());
					}
				}
				
			}

		return partnerInfoPo;
	}
	
	/**
	 * @author zhangshuai  2017年6月29日 下午4:08:51
	 * @param request
	 * @param response
	 * @param modell
	 * @return
	 * 当发布方式为内部司机时进入选择内部司机模态框
	 */
	@RequestMapping(value="/goInternalDriverPage",produces="application/json;charset=utf-8")
	public String goInternalDriverPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String internalDriver="选择内部司机";
		model.addAttribute("internalDriver", internalDriver);
		return "template/scatteredGoods/distributeScatteredGoods/find_internal_driver_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月29日 下午4:20:51
	 * @param request
	 * @param response
	 * @return
	 * 内部司机全查
	 */
	@RequestMapping(value="/findInternalDriverMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<DriverInfo> findInternalDriverMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//根据登录用户主机构ID查询司机表(未分配,启用)
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("orgRootId", uOrgRootId);//主机构ID
		params.put("isAvailable",1);//启用
		params.put("driverStatus", 0);//未分配
		params.put("driverType", 1);//企业内部司机
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		
		List<DriverInfo> driverInfoList=driverInfoFacade.findInternalDriverMation(params);
		return driverInfoList;
	}
	
	/**
	 * @author zhangshuai  2017年6月29日 下午4:41:09
	 * @param request
	 * @param response
	 * @return
	 * 查询内部司机数量
	 */
	@RequestMapping(value="/getInternalDriverCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getInternalDriverCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//根据登录用户主机构ID查询司机表(企业内部司机,未分配,启用)
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("orgRootId", uOrgRootId);//主机构ID
		params.put("isAvailable", 1);//启用
		params.put("driverStatus", 0);//未分配
		params.put("driverType", 1);//企业内部司机
		
		Integer count=driverInfoFacade.getInternalDriverCount(params);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月29日 下午4:48:11
	 * @param request
	 * @param response
	 * @return
	 * 根据司机ID查询司机信息
	 */
	@RequestMapping(value="/findInternalDriverNameById",produces="application/json;charset=utf-8")
	@ResponseBody
	public DriverInfo findInternalDriverNameById(HttpServletRequest request,HttpServletResponse response){
		
		//接收操作司机ID
		Integer Dids=Integer.valueOf(request.getParameter("Dids"));
		
		//根据司机ID查询司机信息
		DriverInfo driverInfo=driverInfoFacade.findInternalDriverById(Dids);
		
		return driverInfo;
	}
	
	/**
	 * @author zhangshuai  2017年6月29日 下午7:03:36
	 * @param request
	 * @param response
	 * @param waybillInfoModel
	 * @return
	 * 添加/修改零散货物
	 */
	@RequestMapping(value="/addOrUpdateDistributeScatteredGoods",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateDistributeScatteredGoods(HttpServletRequest request,HttpServletResponse response,WaybillInfoModel waybillInfoModel){
		
		JSONObject jo=new JSONObject();

		//从session中获取到登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uUserRole=userInfo.getUserRole();
		Integer uOrgRootId=null;
		if(uUserRole==3 || uUserRole==4){
			uOrgRootId=userInfo.getId();
		}else if(uUserRole==1 || uUserRole==2){
			uOrgRootId=userInfo.getOrgRootId();
		}
		
		try {
			//新增/修改零散货物
			jo=waybillInfoFacade.addOrUpdateDistributeScatteredGoods(waybillInfoModel,uId,uOrgRootId,uUserRole);
		} catch (Exception e) {
			log.error("新增/修改零散货物异常!",e);
		}
		
		return jo;
		
	}
	
	/**
	 * @author zhangshuai  2017年7月2日 下午10:12:39
	 * @param request
	 * @param response
	 * @return
	 * 根据零散货物ID查询零散货物运单信息
	 */
	@RequestMapping(value="/findDistributeScatteredGoodsWaybillStatus",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer findDistributeScatteredGoodsWaybillStatus(HttpServletRequest request,HttpServletResponse response){
		
		//接收操作零散货物ID
		Integer dGIds=Integer.valueOf(request.getParameter("dGIds"));
		
		//根据零散货物ID查询零散货物运单信息
		WaybillInfoPo waybillInfoPo=waybillInfoFacade.findDistributeScatteredGoodsWaybillStatus(dGIds);
		
		
		
		return waybillInfoPo.getWaybillStatus();
	}
	
	/**
	 * @author zhangshuai  2017年7月2日 下午10:36:50
	 * @param request
	 * @param response
	 * @return
	 * 根据零散货物ID删除零散货物信息
	 */
	@RequestMapping(value="/deleteDistributeScatteredGoodsById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject deleteDistributeScatteredGoodsById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uorgRootId=userInfo.getOrgRootId();
		Integer uUserRole=userInfo.getUserRole();
		
		//接收操作零散货物ID
		Integer dGIds=Integer.valueOf(request.getParameter("dGIds"));
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("id", dGIds);
		params.put("createUser", uId);
		if(uUserRole==3){
			params.put("orgRootId", uId);
		}else{
			params.put("orgRootId", uorgRootId);
		}
		
		
		try {
			//根据零散货物ID删除零散货物
			jo=waybillInfoFacade.deleteDistributeScatteredGoodsById(params,dGIds);
			
		} catch (Exception e) {
			log.error("删除零散货物信息异常!",e);
		}
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年8月19日 下午5:12:03
	 * @param request
	 * @param response
	 * @return
	 * 查询子运单状态
	 */
	@RequestMapping(value="/findSunWaybillMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer findSunWaybillMation(HttpServletRequest request,HttpServletResponse response){
		
		//接收页面操作零散货物ID
		Integer dGIds=Integer.valueOf(request.getParameter("dGIds"));
		
		//根据选择的ID去匹配子运单的父运单编号字段运单状态
		WaybillInfoPo waybillInfoPo=waybillInfoFacade.findSunWaybillMation(dGIds);
		Integer count=null;
		if(waybillInfoPo!=null){
			count=waybillInfoPo.getWaybillStatus();
		}else if(waybillInfoPo==null){
			count=0;
		}
		return count;
		
	}
	
	/**
	 * @author zhangshuai  2017年7月3日 上午12:05:32
	 * @param request
	 * @param response
	 * @return
	 * 根据运单编号匹配主运单编号，判断是否有多条数据
	 */
	@RequestMapping(value="/findDistributeScatteredGoodsMany",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findDistributeScatteredGoodsMany(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//接收页面操作零散货物ID
		Integer dGIds=Integer.valueOf(request.getParameter("dGIds"));
		
		//根据零散货物匹配主运单编号是否存在多条
		Integer count=waybillInfoFacade.findDistributeScatteredGoodsIsMany(dGIds);
		
		if(count>1){
			jo.put("success", true);
			jo.put("msg", "存在多条");
		}else if(count<=1){
			jo.put("success", false);
			jo.put("msg", "不存在多条");
		}
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年7月2日 下午11:18:27
	 * @param request
	 * @param response
	 * @return
	 * 根据零散货物ID撤回零散货物信息
	 */
	@RequestMapping(value="/withdrawDistributeScatteredGoods",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject withdrawDistributeScatteredGoods(HttpServletRequest request,HttpServletResponse response){
		
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uorgRootId=userInfo.getOrgRootId();
		Integer uUserRole=userInfo.getUserRole();
		//接收页面操作零散货物ID
		Integer dGIds=Integer.valueOf(request.getParameter("dGIds"));
		
		//根据主机构ID，登录用户ID，零散货物id修改运单状态为已撤回
		jo=waybillInfoFacade.withdrawDistributeScatteredGoods(uId,uorgRootId,dGIds,uUserRole);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年7月3日 上午10:34:12
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入修改零散货物模态框
	 */
	@RequestMapping(value="/updateDistributeScatteredGoodsPage",produces="application/json;charset=utf-8")
	public String updateDistributeScatteredGoodsPage(HttpServletRequest request,HttpServletResponse response,Model model){
		
		String updateDistributeScatteredGoods="修改零散货物";
		model.addAttribute("updateDistributeScatteredGoods", updateDistributeScatteredGoods);
		
		//封装计量单位
		List<EnumsModel> goodsUnitsList=new ArrayList<EnumsModel>();
		if(GoodsUnitsEnum.values()!=null){
			for(GoodsUnitsEnum eInfo:GoodsUnitsEnum.values()){
				EnumsModel eModel=new EnumsModel();
				eModel.setCode(eInfo.getCode());
				eModel.setDesc(eInfo.getDesc());
				goodsUnitsList.add(eModel);
			}
		}
		model.addAttribute("goodsUnitsList", goodsUnitsList);
		return "template/scatteredGoods/distributeScatteredGoods/update_distribute_scattered_goods_page";
	}
	//TODO
	/**
	 * @author zhangshuai  2017年7月3日 上午11:02:28
	 * @param request
	 * @param response
	 * @return
	 * 根据零散货物ID查询零散货物信息
	 */
	@RequestMapping(value="/findDistributeScatteredGoodsWayById",produces="application/json;charset=utf-8")
	@ResponseBody
	public WaybillInfoPo findDistributeScatteredGoodsWayById(HttpServletRequest request,HttpServletResponse response){
		
		//接收操作零散货物ID
		Integer dGIds=Integer.valueOf(request.getParameter("dGIds"));
		
		//根据零散货物ID查询零散货物运单信息
		WaybillInfoPo waybillInfoPo=waybillInfoFacade.findDistributeScatteredGoodsWaybillStatus(dGIds);
		
		//根据计量单位名称查询计量单位编码
		if(waybillInfoPo.getUnits()!=null && !"".equals(waybillInfoPo.getUnits())){
			waybillInfoPo.setUnitsCode(GoodsUnitsEnum.valueOfDesc(waybillInfoPo.getUnits()));
		}
		
		//判断委托方用户角色
		//个体货主
		if(waybillInfoPo.getEntrustUserRole()==3){
			
			//根据委托方查询个体货主真实名称
			IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerByUserInfoId(waybillInfoPo.getEntrust());
			if(individualOwnerPo!=null){
				waybillInfoPo.setEntrustName(individualOwnerPo.getRealName());
			}
			
		}else{
			//根据委托方查询组织机构表
			OrgInfoPo orgInfoPo = orgInfoFacade.findOrgInfoByIdId(waybillInfoPo.getEntrust());
			
			//根据机构ID和当前版本号查询组织机构明细表
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("orgInfoId", orgInfoPo.getId());
			params.put("orgVersion", orgInfoPo.getCurrentVersion());
			
			OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params);
			waybillInfoPo.setEntrustName(orgDetailInfoPo.getOrgName());
		}
		
		
		//查询承运方
		//判断零散货物发布方式
		//匹配车源、合作伙伴
		if(waybillInfoPo.getReleaseMode()==2 || waybillInfoPo.getReleaseMode()==3){
			//根据承运方查询名称(物流公司)
			if(waybillInfoPo.getShipper()!=null){
				
				//根据承运方查询组织机构表
				OrgInfoPo orgInfoPoByShipper = orgInfoFacade.findOrgInfoByIdId(waybillInfoPo.getShipper());
				
				//根据机构ID和当前版本号查询组织机构明细表
				Map<String, Object> shipperParams=new HashMap<String,Object>();
				shipperParams.put("orgInfoId", orgInfoPoByShipper.getId());
				shipperParams.put("orgVersion", orgInfoPoByShipper.getCurrentVersion());
				
				OrgDetailInfoPo shipperOrgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(shipperParams);
				
				waybillInfoPo.setShipperName(shipperOrgDetailInfoPo.getOrgName());
				
			}else 
				//查询司机名称
				if(waybillInfoPo.getShipper()==null){
				if(waybillInfoPo.getUserInfoId()!=null){
					//查询司机名称
					List<Integer> userIds=new ArrayList<Integer>();
					userIds.add(waybillInfoPo.getUserInfoId());
					List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userIds);
					if(CollectionUtils.isNotEmpty(driverInfos)){
						for (DriverInfo driverInfo : driverInfos) {
							waybillInfoPo.setDriverName(driverInfo.getDriverName());
						}
					}
					
					//根据司机编号查询车源信息ID
					/*Map<String, Object> params=new HashMap<String,Object>();
					params.put("releasePerson", waybillInfoPo.getUserInfoId());
					List<CarSourceInfoPo> carSourceInfoPos = carSourceInfoFacade.findCarSourceMation(params);
					if(CollectionUtils.isNotEmpty(carSourceInfoPos)){
						for (CarSourceInfoPo carSourceInfoPo : carSourceInfoPos) {
							waybillInfoPo.setShipper(carSourceInfoPo.getId());
						}
					}*/
					
				}
			}
		}else if(waybillInfoPo.getReleaseMode()==4){
			if(waybillInfoPo.getUserInfoId()!=null){
				//查询司机名称
				List<Integer> userIds=new ArrayList<Integer>();
				userIds.add(waybillInfoPo.getUserInfoId());
				List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userIds);
				if(CollectionUtils.isNotEmpty(driverInfos)){
					for (DriverInfo driverInfo : driverInfos) {
						waybillInfoPo.setDriverName(driverInfo.getDriverName());
						//waybillInfoPo.setShipper(driverInfo.getId());
					}
				}
			}
		}
		
		//查询线路起点
		List<Integer> lineInfoIds=new ArrayList<Integer>();
		lineInfoIds.add(waybillInfoPo.getLineInfoId());
		List<LocationInfoPo> LocationInfoPoList = locationInfoFacade.findLocationNameByIds(lineInfoIds);
		if(CollectionUtils.isNotEmpty(LocationInfoPoList)){
			for (LocationInfoPo locationInfoPo : LocationInfoPoList) {
				String lineName=locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty();
				waybillInfoPo.setLineInfoName(lineName);
			}
		}
		
		//查询线路终点
		List<Integer> endPointsIds=new ArrayList<Integer>();
		endPointsIds.add(waybillInfoPo.getEndPoints());
		List<LocationInfoPo> LocationList = locationInfoFacade.findLocationNameByIds(endPointsIds);
		if(CollectionUtils.isNotEmpty(LocationList)){
			for (LocationInfoPo locationInfoPo : LocationList) {
				String endPointsName=locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty();
				waybillInfoPo.setEndPointsStr(endPointsName);
			}
		}
		
		//计划截止日期
		waybillInfoPo.setPlanTransportDateStartStr(new SimpleDateFormat("yyyy-MM-dd").format(waybillInfoPo.getPlanTransportDate()));
		return waybillInfoPo;
	}
	
	/**==================平台中标管理======================*/
	
	@RequestMapping(value="/goPlatformBiddingPage",produces="application/json;charset=utf-8")
	public String goPlatformBiddingPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String platformBidding="平台中标管理";
		model.addAttribute("platformBidding", platformBidding);
		return "template/scatteredGoods/platformBidding/platform_bidding_management_page";
	}
	
	/**
	 * @author zhangshuai  2017年7月3日 下午7:55:33
	 * @param request
	 * @param response
	 * @return
	 * 发布平台零散货物回收报价
	 */
	@RequestMapping(value="/recoveryQuotationByIds",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject recoveryQuotationByIds(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer userRole=userInfo.getUserRole();
		Integer uorgRootId=null;
		if(userRole==1 || userRole==2){
			uorgRootId=userInfo.getOrgRootId();
		}else if(userRole==3 || userRole==4){
			uorgRootId=uId;
		}
		
		
		//接收页面操作id
		Integer dGIds=Integer.valueOf(request.getParameter("dGIds"));
		
		jo=waybillInfoFacade.recoveryQuotationByIds(uId,uorgRootId,dGIds);
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年7月3日 下午11:09:53
	 * @param request
	 * @param response
	 * @return
	 * 已回收报价运单重新挂网
	 */
	@RequestMapping(value="/hangUpTheNetAgainById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject hangUpTheNetAgainById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer userRole=userInfo.getUserRole();
		Integer uorgRootId=null;
		if(userRole==1 || userRole==2){
			uorgRootId=userInfo.getOrgRootId();
		}else if(userRole==4 || userRole==3){
			uorgRootId=uId;
		}
		
		
		//接收页面操作id
		Integer dGIds=Integer.valueOf(request.getParameter("dGIds"));
		
		jo=waybillInfoFacade.hangUpTheNetAgainById(uId,uorgRootId,dGIds);
		
		return jo;
		
	}
	
	/**
	 * @author zhangshuai  2017年7月4日 上午10:33:23
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入选择报价方模态框
	 */
	@RequestMapping(value="/goPlatformBiddingModel",produces="application/json;chasret=utf-8")
	public String goPlatformBiddingModel(HttpServletRequest request,HttpServletResponse response,Model model){
		
		String checkPlatformBidding="选择报价方信息";
		model.addAttribute("checkPlatformBidding", checkPlatformBidding);
		return "template/scatteredGoods/platformBidding/platform_bidding_model";
		
	}
	
	/**
	 * @author zhangshuai  2017年7月4日 上午10:36:09
	 * @param request
	 * @param response
	 * @return
	 * 根据选择的运单ID查询报价方信息
	 */
	@RequestMapping(value="/findPlatformBiddingMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<OfferInfoPo> findPlatformBiddingMation(HttpServletRequest request,HttpServletResponse response){
		
		//接收页面操作id
		Integer dGIds=Integer.valueOf(request.getParameter("dGIds"));
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		Map<String, Object> PBParams=new HashMap<String,Object>();
		PBParams.put("dGIds", dGIds);
		PBParams.put("start", start);
		PBParams.put("rows", rows);
		
		//根据ID查询报价方信息
		List<OfferInfoPo> offerInfoList=offerInfoFacade.findPlatformBiddingMation(PBParams);
		if(CollectionUtils.isNotEmpty(offerInfoList)){
			for (OfferInfoPo offerInfoPo : offerInfoList) {
				//判断报价方角色
				//物流公司
				if(offerInfoPo.getOfferUserRole()==1){
					//主机构名称
					List<Integer> orgInfoIds=new ArrayList<Integer>();
					orgInfoIds.add(offerInfoPo.getOrgRootId());
					List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
					if(CollectionUtils.isNotEmpty(orgInfoPos)){
						for (OrgInfoPo orgInfoPo : orgInfoPos) {
							offerInfoPo.setOrgName(orgInfoPo.getOrgName());
						}
					}
					//报价方
					List<Integer> orgInfoId=new ArrayList<Integer>();
					orgInfoId.add(offerInfoPo.getOfferParty());
					List<OrgInfoPo> orgInfos = orgInfoFacade.findOrgNameByIds(orgInfoId);
					if(CollectionUtils.isNotEmpty(orgInfos)){
						for (OrgInfoPo orgInfoPo1 : orgInfos) {
							offerInfoPo.setOfferPartyName(orgInfoPo1.getOrgName());
						}
					}
					
				}else 
					//司机
					if(offerInfoPo.getOfferUserRole()==2){
						//主机构名称
						List<Integer> userInfoIds=new ArrayList<Integer>();
						userInfoIds.add(offerInfoPo.getOrgRootId());
						List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
						if(CollectionUtils.isNotEmpty(driverInfos)){
							for (DriverInfo driverInfo : driverInfos) {
								offerInfoPo.setOrgName(driverInfo.getDriverName());
							}
						}
						
						//报价方
						//主机构名称
						List<Integer> userInfoId=new ArrayList<Integer>();
						userInfoId.add(offerInfoPo.getOrgRootId());
						List<DriverInfo> drivers = driverInfoFacade.findDriverByUserInfoIds(userInfoId);
						if(CollectionUtils.isNotEmpty(drivers)){
							for (DriverInfo driverInfo1 : drivers) {
								offerInfoPo.setOfferPartyName(driverInfo1.getDriverName());
							}
						}
				}
				if(offerInfoPo.getOfferTime()!=null){
					offerInfoPo.setOfferTimeStr(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(offerInfoPo.getOfferTime()));
				}
			}
		}
		
		return offerInfoList;
	}
	
	/**
	 * @author zhangshuai  2017年7月4日 下午5:53:41
	 * @param request
	 * @return
	 * 查询报价方数量
	 */
	@RequestMapping(value="/getPlatformBiddingCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getPlatformBiddingCount(HttpServletRequest request,HttpServletResponse response){
		
		//接收页面操作id
		Integer dGIds=Integer.valueOf(request.getParameter("dGIds"));
		
		Integer count=offerInfoFacade.getPlatformBiddingCount(dGIds);
		return count;
		
	}
	
	/**
	 * @author zhangshuai  2017年7月4日 下午12:40:09
	 * @param request
	 * @param response
	 * @return
	 * 修改报价信息是否中标状态
	 */
	@RequestMapping(value="/updaeOfferInfoIsBidStatus",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject updaeOfferInfoIsBidStatus(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=null;
		Integer uOrgInfoId=null;
		Integer uId=userInfo.getId();
		Integer userRole=userInfo.getUserRole();
		if(userRole==1 || userRole==2){
			uOrgRootId=userInfo.getOrgRootId();
			uOrgInfoId=userInfo.getOrgInfoId();
		}else if(userRole==3 || userRole==4){
			uOrgRootId=uId;
			uOrgInfoId=uId;
		}
		//接收操作运单编号
		Integer wId=Integer.valueOf(request.getParameter("dGIds"));
		//接收选择的报价信息编号
		Integer oId=Integer.valueOf(request.getParameter("PBIds"));
		//获取流水单号
		String LSRedis=CodeAutoGenerater.generaterCodeByFlag("LSDH");
		//修改中标后的信息和状态
		jo=waybillInfoFacade.updatePlatformMationAndStatus(uOrgRootId,wId,oId,uId,userInfo,LSRedis,uOrgInfoId);
		return jo;
	}
	
	
	
	/**============零散货物跟踪=============*/
	/**
	 * @author zhangshuai  2017年7月4日 下午6:52:45
	 * @param reuqest
	 * @param response
	 * @param model
	 * @return
	 * 进入零散货物跟踪页面
	 */
	@RequestMapping(value="/goScatteredCargoTrackingPage",produces="application/json;charset=utf-8")
	public String goScatteredCargoTrackingPage(HttpServletRequest reuqest,HttpServletResponse response,Model model){
		String scatteredCargoTracking="零散货物跟踪";
		model.addAttribute("scatteredCargoTracking", scatteredCargoTracking);
		return "template/scatteredGoods/scatteredCargoTracking/scattered_cargo_tracking_root_page";
	}
	
	/**
	 * @author zhangshuai  2017年7月4日 下午7:57:38
	 * @param request
	 * @param response
	 * @return
	 * 全查方法
	 */
	@RequestMapping(value="/findScatteredCargoTrackingAllMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<WaybillInfoPo> findScatteredCargoTrackingAllMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer uUserRole=userInfo.getUserRole();
		
		
		//接收模糊查询条件
		String scatteredGoods=request.getParameter("scatteredGoods");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String waybillStatus=request.getParameter("waybillStatus");
		String startAddress=request.getParameter("startAddress");
		String endAddress=request.getParameter("endAddress");
		String cooperateStatus=request.getParameter("cooperateStatus");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		String planTransportDateStart=request.getParameter("planTransportDateStart");
		String	planTransportDateEnd=request.getParameter("planTransportDateEnd");
		
		
		List<Integer> waybillStatusList=new ArrayList<Integer>();
		waybillStatusList.add(2);
		waybillStatusList.add(3);
		waybillStatusList.add(4);
		waybillStatusList.add(5);
		waybillStatusList.add(6);
		waybillStatusList.add(7);
		waybillStatusList.add(8);
		waybillStatusList.add(9);
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("createUser", uId);
		params.put("orgRootId", uOrgRootId);
		params.put("waybillClassify", 2);
		params.put("waybillStatusList", waybillStatusList);
		params.put("scatteredGoods", scatteredGoods);
		params.put("entrust", entrust);
		params.put("shipper", shipper);
		params.put("forwardingUnit", forwardingUnit);
		params.put("consignee", consignee);
		params.put("waybillStatus", waybillStatus);
		params.put("startAddress", startAddress);//线路起点
		params.put("endAddress", endAddress);//线路终点
		params.put("cooperateStatus", cooperateStatus);
		params.put("start", start);
		params.put("rows", rows);
		params.put("userRole", uUserRole);
		params.put("planTransportDateStart", planTransportDateStart);
		params.put("planTransportDateEnd", planTransportDateEnd);
		
		//查询运单表
		List<WaybillInfoPo> waybillInfoPosList=waybillInfoFacade.findScatteredCargoTrackingAllMation(params);
		//查询线路
		List<Integer> lineInfoIds=CommonUtils.getValueList(waybillInfoPosList, "lineInfoId");
		//key：地点ID   value：省/市/县
		Map<Integer, String>  LineInfoMap = null;
		if(CollectionUtils.isNotEmpty(lineInfoIds)){
			List<LocationInfoPo> LineInfos=locationInfoFacade.findLocationNameByIds(lineInfoIds);
			for (LocationInfoPo locationInfoPo : LineInfos) {
				locationInfoPo.setLineName(locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty());
			}
			if (CollectionUtils.isNotEmpty(LineInfos)) {
				 LineInfoMap = CommonUtils.listforMap(LineInfos, "id", "lineName");
			}
		}
		
		//查询线路终点
		List<Integer> endPointsIds=CommonUtils.getValueList(waybillInfoPosList, "endPoints");
		//key：地点ID   value：省/市/县
		Map<Integer, String>  endPointsMap = null;
		if(CollectionUtils.isNotEmpty(endPointsIds)){
			List<LocationInfoPo> endPointss=locationInfoFacade.findLocationNameByIds(endPointsIds);
			for (LocationInfoPo locationInfoPo : endPointss) {
				locationInfoPo.setLineName(locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty());
			}
			if (CollectionUtils.isNotEmpty(endPointss)) {
				endPointsMap = CommonUtils.listforMap(endPointss, "id", "lineName");
			}
		}
		
		for (WaybillInfoPo waybillInfoPo : waybillInfoPosList) {
			
			//查询司机名称
			if(waybillInfoPo.getUserInfoId()!=null){
				String driverName=driverInfoFacade.getDriverNameByUserInfoId(waybillInfoPo.getUserInfoId());
				if(driverName!=null && driverName!=""){
					waybillInfoPo.setDriverName(driverName);
				}
			}
			//封装线路
			if (MapUtils.isNotEmpty(LineInfoMap) && LineInfoMap.get(waybillInfoPo.getLineInfoId()) != null) {
				waybillInfoPo.setLineInfoName(LineInfoMap.get(waybillInfoPo.getLineInfoId()));
			}
			
			//封装终点
			if (MapUtils.isNotEmpty(endPointsMap) && endPointsMap.get(waybillInfoPo.getEndPoints()) != null) {
				waybillInfoPo.setEndPointsStr(endPointsMap.get(waybillInfoPo.getEndPoints()));
			}
			
			if(waybillInfoPo.getEntrustUserRole()==1 || waybillInfoPo.getEntrustUserRole()==2){
				//查询委托方
				OrgInfoPo orgInfo = orgInfoFacade.findOrgInfoByIdId(waybillInfoPo.getEntrust());
				//根据组织机构ID和版本号查询组织明细信息
				Map<String, Object> Orgparams=new HashMap<String,Object>();
				Orgparams.put("orgInfoId", orgInfo.getId());
				Orgparams.put("orgVersion", orgInfo.getCurrentVersion());
				OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(Orgparams);
				if(orgDetailInfoPo!=null){
					waybillInfoPo.setEntrustName(orgDetailInfoPo.getOrgName());
				}
			}else if(waybillInfoPo.getEntrustUserRole()==3){
				
				//查询个体货主信息
				IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerById(waybillInfoPo.getEntrust());
				if(individualOwnerPo!=null){
					waybillInfoPo.setEntrustName(individualOwnerPo.getRealName());
				}
			}
			
			if(waybillInfoPo.getShipper()!=null){
				//查询承运方
				OrgInfoPo orgInfoPo = orgInfoFacade.findOrgInfoByIdId(waybillInfoPo.getShipper());
				if(orgInfoPo!=null){
					//根据组织机构ID和当前版本号查询明细
					Map<String, Object> ODParams=new HashMap<String,Object>();
					ODParams.put("orgInfoId", orgInfoPo.getId());
					ODParams.put("orgVersion", orgInfoPo.getCurrentVersion());
					OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(ODParams);
					if(orgDetailInfoPo!=null){
						waybillInfoPo.setShipperName(orgDetailInfoPo.getOrgName());
					}
				}
			}

			//计划拉运日期
			if(waybillInfoPo.getPlanTransportDate()!=null){
				waybillInfoPo.setPlanTransportDateEndStr(new SimpleDateFormat("yyyy-MM-dd").format(waybillInfoPo.getPlanTransportDate()));
			}
		}
		return waybillInfoPosList;
	}
	
	/**
	 * @author zhangshuai  2017年7月5日 下午1:15:59
	 * @param response
	 * @param request
	 * @return
	 * 计划跟踪查询总数
	 */
	@RequestMapping(value="/getScatteredCargoTrackingCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getScatteredCargoTrackingCount(HttpServletResponse response,HttpServletRequest request){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer uUserRole=userInfo.getUserRole();
		//接收模糊查询条件
		String scatteredGoods=request.getParameter("scatteredGoods");
		String entrust=request.getParameter("entrust");
		String shipper=request.getParameter("shipper");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String waybillStatus=request.getParameter("waybillStatus");
		String startAddress=request.getParameter("startAddress");
		String endAddress=request.getParameter("endAddress");
		String cooperateStatus=request.getParameter("cooperateStatus");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		String planTransportDateStart=request.getParameter("planTransportDateStart");
		String	planTransportDateEnd=request.getParameter("planTransportDateEnd");
		
		
		List<Integer> waybillStatusList=new ArrayList<Integer>();
		waybillStatusList.add(2);
		waybillStatusList.add(3);
		waybillStatusList.add(4);
		waybillStatusList.add(5);
		waybillStatusList.add(6);
		waybillStatusList.add(7);
		waybillStatusList.add(8);
		waybillStatusList.add(9);
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("createUser", uId);
		params.put("orgRootId", uOrgRootId);
		params.put("waybillClassify", 2);
		params.put("waybillStatusList", waybillStatusList);
		params.put("scatteredGoods", scatteredGoods);
		params.put("entrust", entrust);
		params.put("shipper", shipper);
		params.put("forwardingUnit", forwardingUnit);
		params.put("consignee", consignee);
		params.put("waybillStatus", waybillStatus);
		params.put("startAddress", startAddress);//线路起点
		params.put("endAddress", endAddress);//线路终点
		params.put("cooperateStatus", cooperateStatus);
		params.put("start", start);
		params.put("rows", rows);
		params.put("userRole", uUserRole);
		params.put("planTransportDateStart", planTransportDateStart);
		params.put("planTransportDateEnd", planTransportDateEnd);
		
		Integer count=waybillInfoFacade.getScatteredCargoTrackingCount(params);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年7月5日 下午5:17:49
	 * @param request
	 * @param response
	 * @return
	 * 零散货物明细信息
	 */
	@RequestMapping(value="/gofindScatteredCargoTrackingPage",produces="application/json;charset=utf-8")
	public String gofindScatteredCargoTrackingPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String findScatteredCargoTrackingPage="零散货物明细信息";
		model.addAttribute("findScatteredCargoTrackingPage", findScatteredCargoTrackingPage);
		return "template/scatteredGoods/scatteredCargoTracking/find_scattered_cargo_tracking_page";
	}
	
	
	/**
	 * @author zhangshuai  2017年7月5日 下午6:25:17
	 * @param request
	 * @param response
	 * @return
	 * 零散货物明细信息
	 */
	@RequestMapping(value="/getFindScatteredCargoTrackingAllMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<WaybillInfoPo> getFindScatteredCargoTrackingAllMation(HttpServletRequest request,HttpServletResponse response){
	
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uUserRole=userInfo.getUserRole();
		Integer uOrgRootId=null;
		if(uUserRole==3){
			 uOrgRootId=userInfo.getId();
		}else{
			 uOrgRootId=userInfo.getOrgInfoId();
		}
		
		
		//接收操作运单编号
		Integer STIds=Integer.valueOf(request.getParameter("STIds"));
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("createUser", uId);
		params.put("orgRootId", uOrgRootId);
		params.put("rootWaybillInfoId", STIds);
		params.put("start", start);
		params.put("rows", rows);
		
		List<WaybillInfoPo>  waybillInfoPoList=waybillInfoFacade.findScatteredCargoTrackingData(params);
		
		//线路全查
		List<Integer> lineInfoIds=CommonUtils.getValueList(waybillInfoPoList, "lineInfoId");
		//key：地点ID   value：省/市/县
		Map<Integer, String>  LineInfoMap = null;
		if(CollectionUtils.isNotEmpty(lineInfoIds)){
			List<LocationInfoPo> LineInfos=locationInfoFacade.findLocationNameByIds(lineInfoIds);
			for (LocationInfoPo locationInfoPo : LineInfos) {
				locationInfoPo.setLineName(locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty());
			}
			if (CollectionUtils.isNotEmpty(LineInfos)) {
				 LineInfoMap = CommonUtils.listforMap(LineInfos, "id", "lineName");
			}
		}
		
		for (WaybillInfoPo waybillInfoPo : waybillInfoPoList) {
			
			//查询司机名称
			if(waybillInfoPo.getUserInfoId()!=null){
				String driverName=driverInfoFacade.getDriverNameByUserInfoId(waybillInfoPo.getUserInfoId());
				if(driverName!=null && driverName!=""){
					waybillInfoPo.setDriverName(driverName);
				}
			}
			//封装线路
			if (MapUtils.isNotEmpty(LineInfoMap) && LineInfoMap.get(waybillInfoPo.getLineInfoId()) != null) {
				waybillInfoPo.setLineInfoName(LineInfoMap.get(waybillInfoPo.getLineInfoId()));
			}
			
			if(waybillInfoPo.getEntrustUserRole()==1 || waybillInfoPo.getEntrustUserRole()==2){
				//查询委托方
				OrgInfoPo orgInfo = orgInfoFacade.findOrgInfoByIdId(waybillInfoPo.getEntrust());
				//根据组织机构ID和版本号查询组织明细信息
				Map<String, Object> Orgparams=new HashMap<String,Object>();
				Orgparams.put("orgInfoId", orgInfo.getId());
				Orgparams.put("orgVersion", orgInfo.getCurrentVersion());
				OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(Orgparams);
				if(orgDetailInfoPo!=null){
					waybillInfoPo.setEntrustName(orgDetailInfoPo.getOrgName());
				}
			}else if(waybillInfoPo.getEntrustUserRole()==3){
				
				//查询个体货主信息
				IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerById(waybillInfoPo.getEntrust());
				if(individualOwnerPo!=null){
					waybillInfoPo.setEntrustName(individualOwnerPo.getRealName());
				}
			}
			
			if(waybillInfoPo.getShipper()!=null){
				//查询承运方
				OrgInfoPo orgInfoPo = orgInfoFacade.findOrgInfoByIdId(waybillInfoPo.getShipper());
				if(orgInfoPo!=null){
					//根据组织机构ID和当前版本号查询明细
					Map<String, Object> ODParams=new HashMap<String,Object>();
					ODParams.put("orgInfoId", orgInfoPo.getId());
					ODParams.put("orgVersion", orgInfoPo.getCurrentVersion());
					OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(ODParams);
					if(orgDetailInfoPo!=null){
						waybillInfoPo.setShipperName(orgDetailInfoPo.getOrgName());
					}
				}
			}
		}
		return waybillInfoPoList;
	}
	
	/**
	 * @author zhangshuai  2017年7月5日 下午6:44:34
	 * @param request
	 * @param response
	 * @return
	 * 零散货物跟踪明细总数
	 */
	@RequestMapping(value="/getFindScatteredCargoTrackingAllCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getFindScatteredCargoTrackingAllCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uUserRole=userInfo.getUserRole();
		Integer uOrgRootId=null;
		if(uUserRole==3){
			 uOrgRootId=userInfo.getId();
		}else{
			 uOrgRootId=userInfo.getOrgInfoId();
		}
		
		//接收操作运单编号
		Integer STIds=Integer.valueOf(request.getParameter("STIds"));
		
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("createUser", uId);
		params.put("orgRootId", uOrgRootId);
		params.put("rootWaybillInfoId", STIds);
		
		Integer count=waybillInfoFacade.getFindScatteredCargoTrackingAllCount(params);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年8月28日 下午7:01:03
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 查看报价方位置信息
	 */
	@RequestMapping(value="/findOfferPosition",produces="application/json;charset-utf-8")
	public String findOfferPosition(HttpServletRequest request,HttpServletResponse response,Model model){
		String offerId=request.getParameter("offerId");
		
		//根据报价方ID查询报价方信息
		OfferInfoPo offerInfoPo=offerInfoFacade.findOfferMationById(offerId);
		if(offerInfoPo!=null){
			if(offerInfoPo.getLocationLongitude()!=null){
				model.addAttribute("locationLongitude", offerInfoPo.getLocationLongitude());
			}
			if(offerInfoPo.getLocationLatitude()!=null){
				model.addAttribute("locationLatitude", offerInfoPo.getLocationLatitude());
			}
		}
		return "template/scatteredGoods/platformBidding/find_offer_position";
	}
	
}
