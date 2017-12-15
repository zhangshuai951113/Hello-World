package com.xz.logistics.controller;


import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.dubbo.common.utils.StringUtils;
import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.facade.api.BiddingDetailInfoFacade;
import com.xz.facade.api.BiddingFrozenInfoFacade;
import com.xz.facade.api.BiddingInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.MyOfferDetailedFacade;
import com.xz.facade.api.MyOfferPoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.PartnerInfoFacade;
import com.xz.facade.api.RechargeOrWithdrawalsInfoPoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.facade.api.WaybillFrozenInfoFacade;
import com.xz.model.po.BiddingDetailInfoPo;
import com.xz.model.po.BiddingFrozenInfoPo;
import com.xz.model.po.BiddingInfoPo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.MyOfferDetailedPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.RechargeOrWithdrawalsInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.po.WaybillFrozenInfoPo;

/**
* @author zhangshuai   2017年7月31日 下午6:49:30
* 类说明
* 招标（报价信息）
*/
@Controller
@RequestMapping("/myOffer")
public class BiddingManagementOfferController {

	@Resource
	private PartnerInfoFacade partnerInfoFacade;
	@Resource
	private BiddingInfoFacade biddingInfoFacade;
	@Resource
	private BiddingDetailInfoFacade biddingDetailInfoFacade;
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
	@Resource
	private LineInfoFacade lineInfoFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private MyOfferPoFacade myOfferPoFacade;
	@Resource
	private MyOfferDetailedFacade myOfferDetailedFacade;
	@Resource
	private BiddingFrozenInfoFacade biddingFrozenInfoFacade;
	@Resource
	private RechargeOrWithdrawalsInfoPoFacade rechargeOrWithdrawalsInfoPoFacade;
	@Resource
	private WaybillFrozenInfoFacade waybillFrozenInfoFacade;
	/**
	 * @au1thor zhangshuai  2017年7月31日 下午6:52:56
	 * @param request
	 * @param response
	 * @return
	 * 进入我的报价页面
	 */
	@RequestMapping(value="/goOfferRootPage",produces="application/json;charset=utf-8")
	public String goMyOfferPage(HttpServletRequest request,HttpServletResponse response){
		return "template/biddingManagement/my_offer_root_page/my_offer_root_page";
	}
	
	/**
	 * @author zhangshuai  2017年8月1日 上午10:55:48
	 * @param request
	 * @param response
	 * @return
	 * 进入报价模态框
	 */
	@RequestMapping(value="/go_participating_quotation",produces="application/json;charset=utf-8")
	public String go_participating_quotation(HttpServletRequest request,HttpServletResponse response,Model model){
		String offerOperateTitle="完善报价信息";
		model.addAttribute("offerOperateTitle", offerOperateTitle);
		return "template/biddingManagement/my_offer_root_page/participating_quotation";
	}
	
	/**
	 * @author zhangshuai  2017年8月1日 上午10:58:36
	 * @param request
	 * @param response
	 * @return
	 * 进行报价前，根据招标ID查询招标报价截止日期
	 */
	@RequestMapping(value="/findIsExceedOfferEndDate",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findIsExceedOfferEndDate(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//获取到操作的招标信息ID
		Integer biddingInfoId=Integer.parseInt(request.getParameter(""));
		//将操作招标信息ID封装进Map中
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("id", biddingInfoId);
		List<BiddingInfoPo> biddingInfoPos = biddingInfoFacade.findBiddingInfoByOrgRootId(params);
		BiddingInfoPo biddingPo=null;
		if(CollectionUtils.isNotEmpty(biddingInfoPos)){
			for (BiddingInfoPo biddingInfoPo : biddingInfoPos) {
				biddingPo=biddingInfoPo;
			}
		}
		if(biddingPo!=null){
			//取出招标信息截止报价日期,判断当前日期是否大于招标截止日期
			if(Calendar.getInstance().getTime().getTime()>biddingPo.getQuotationDeadline().getTime()){
				jo.put("success", false);
			}else{
				jo.put("success", true);
			}
		}
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年8月2日 下午12:15:35
	 * @param request
	 * @param response
	 * @return
	 * 只要是物流公司都能看到别人发布的招标信息(自己的不能看到)
	 */
	@RequestMapping(value="/findMyOfferMationByPartner",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<BiddingInfoPo> findMyOfferMationByPartner(HttpServletRequest request,HttpServletResponse response){
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();//用户角色
		Integer userOrgInfoId=null;//用户机构ID
		Integer userOrgRootId=userInfo.getOrgRootId();//用户主机构ID
		//判断登录角色信息
		//企业货主/物流公司
		if(userRole==1 || userRole==2){
			userOrgInfoId=userInfo.getOrgInfoId();
		}else 
			//个体货主/司机
			if(userRole==3 || userRole==4){
			userOrgInfoId=userInfo.getId();
		}
		
		//接收页面模糊参数
		String biddingCode=request.getParameter("biddingCode");
		String biddingName=request.getParameter("biddingName");
		String createUserName=request.getParameter("createUserName");
		String biddingOrg=request.getParameter("biddingOrg");
		String makeStartTime=request.getParameter("makeStartTime");
		String makeEndTime=request.getParameter("makeEndTime");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		
		Map<String, Object> partnerParams=new HashMap<String,Object>();
		partnerParams.put("biddingCode", biddingCode);
		partnerParams.put("biddingName", biddingName);
		partnerParams.put("createUserName", createUserName);
		partnerParams.put("orgRootId", userOrgRootId);
		partnerParams.put("biddingOrg", biddingOrg);
		partnerParams.put("makeStartTime", makeStartTime);
		partnerParams.put("makeEndTime", makeEndTime);
		partnerParams.put("start", start);
		partnerParams.put("rows", rows);
		
		List<BiddingInfoPo> biddingInfoPos=biddingInfoFacade.findBiddingInfoByOrgRootId(partnerParams);
		if(CollectionUtils.isNotEmpty(biddingInfoPos)){
			
			//封装招标单位
			List<Integer> biddingOrgs=CommonUtils.getValueList(biddingInfoPos, "biddingOrg");
			//key:机构ID  //value:机构名称
			Map<Integer, String> biddingOrgNameMap=null;
			if(CollectionUtils.isNotEmpty(biddingOrgs)){
				List<OrgInfoPo> orgInfos=orgInfoFacade.findOrgNameByIds(biddingOrgs);
				if(CollectionUtils.isNotEmpty(orgInfos)){
					biddingOrgNameMap=CommonUtils.listforMap(orgInfos, "id", "orgName");
				}
			}
			
			//封装制单人
			List<Integer> userIds=CommonUtils.getValueList(biddingInfoPos, "createUser");
			//key:用户ID   value:用户名字
			Map<Integer, String> userInfoMap=null;
			if(CollectionUtils.isNotEmpty(userIds)){
				List<UserInfo> userInfos=userInfoFacade.findUserNameByIds(userIds);
				if(CollectionUtils.isNotEmpty(userInfos)){
					userInfoMap=CommonUtils.listforMap(userInfos, "id", "userName");
				}
			}
			
			for(BiddingInfoPo biddingInfo:biddingInfoPos){
				
				//封装招标单位
				if(MapUtils.isNotEmpty(biddingOrgNameMap)&&biddingOrgNameMap.get(biddingInfo.getBiddingOrg())!=null){
					biddingInfo.setOrgName(biddingOrgNameMap.get(biddingInfo.getBiddingOrg()));
				}
				//封装制单人
				if(MapUtils.isNotEmpty(userInfoMap)&&userInfoMap.get(biddingInfo.getCreateUser())!=null){
					biddingInfo.setCreateUserStr(userInfoMap.get(biddingInfo.getCreateUser()));
				}
				//封装报价截止日期
				if(biddingInfo.getQuotationDeadline()!=null){
					biddingInfo.setQuotationDeadlineStr(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(biddingInfo.getQuotationDeadline()));
				}
				//制单日期
				if(biddingInfo.getCreateTime()!=null){
					biddingInfo.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(biddingInfo.getCreateTime()));
				}
			}
		}
		return biddingInfoPos;
	}
	
	/**
	 * @author zhangshuai  2017年8月4日 下午12:10:26
	 * @param request
	 * @param response
	 * @return
	 * 查询合作伙伴发出的招标信息数量
	 */
	@RequestMapping(value="/getMyOfferMationCountByPartner",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getMyOfferMationCountByPartner(HttpServletRequest request,HttpServletResponse response){
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();//用户角色
		Integer userOrgInfoId=null;//用户机构ID
		Integer userOrgRootId=userInfo.getOrgRootId();//用户主机构ID
		//判断登录角色信息
		//企业货主/物流公司
		if(userRole==1 || userRole==2){
			userOrgInfoId=userInfo.getOrgInfoId();
		}else 
			//个体货主/司机
			if(userRole==3 || userRole==4){
			userOrgInfoId=userInfo.getId();
		}
		
		//接收页面模糊参数
		String biddingCode=request.getParameter("biddingCode");
		String biddingName=request.getParameter("biddingName");
		String createUserName=request.getParameter("createUserName");
		String biddingOrg=request.getParameter("biddingOrg");
		String makeStartTime=request.getParameter("makeStartTime");
		String makeEndTime=request.getParameter("makeEndTime");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		
		Map<String, Object> partnerParams=new HashMap<String,Object>();
		partnerParams.put("biddingCode", biddingCode);
		partnerParams.put("biddingName", biddingName);
		partnerParams.put("createUserName", createUserName);
		partnerParams.put("orgRootId", userOrgRootId);
		partnerParams.put("biddingOrg", biddingOrg);
		partnerParams.put("makeStartTime", makeStartTime);
		partnerParams.put("makeEndTime", makeEndTime);
		partnerParams.put("start", start);
		partnerParams.put("rows", rows);
		
		Integer count=biddingInfoFacade.getMyOfferMationCountByPartner(partnerParams);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年8月3日 下午8:18:22
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入招标明细页面
	 */
	@RequestMapping(value="/goBiddingDetailMationPageByBiddingInfoId",produces="application/json;charset=utf-8")
	public String goBiddingDetailMationPageByBiddingInfoId(HttpServletRequest request,HttpServletResponse response,Model model){
		String biddingDetailPage="招标明细";
		//接收前台操作的招标ID
		Integer biddingInfoId=null;
		if(request.getParameter("biddingInfoId")!=null){
			biddingInfoId=Integer.parseInt(request.getParameter("biddingInfoId"));
		}
		model.addAttribute("biddingInfoId", biddingInfoId);
		model.addAttribute("biddingDetailPage", biddingDetailPage);
		return "template/biddingManagement/my_offer_root_page/bidding_detail_mation_page";
	}
	
	/**
	 * @author zhangshuai  2017年8月3日 下午8:56:18
	 * @param request
	 * @param response
	 * @return
	 * 根据招标ID查询所有的招标明细信息
	 */
	@RequestMapping(value="/findBiddingDetailMationByBiddingInfoId",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<BiddingDetailInfoPo> findBiddingDetailMationByBiddingInfoId(HttpServletRequest request,HttpServletResponse response){
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=null;
		Integer orgInfoId=null;
		if(userInfo.getUserRole()==1 || userInfo.getUserRole()==2){
			orgRootId=userInfo.getOrgRootId();
			orgInfoId=userInfo.getOrgInfoId();
		}else if(userInfo.getUserRole()==3 || userInfo.getUserRole()==4){
			orgRootId=userInfo.getId();
			orgInfoId=userInfo.getId();
		}
		//接收招标ID
		Integer biddingInfoId=Integer.parseInt(request.getParameter("biddingInfoId"));
		
		//接收模糊查询条件
		String goodsName=request.getParameter("goodsName");
		String lineName=request.getParameter("lineName");
		Integer	page=Integer.parseInt(request.getParameter("page"));
		Integer	rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		
		//根据招标ID查询招标明细信息
		List<Integer> biddingInfoIds=new ArrayList<Integer>();
		biddingInfoIds.add(biddingInfoId);
		Map<String, Object> biddingDetailMap=new HashMap<String,Object>();
		biddingDetailMap.put("biddingIds", biddingInfoIds);
		biddingDetailMap.put("goodsName", goodsName);
		biddingDetailMap.put("lineName", lineName);
		biddingDetailMap.put("start", start);
		biddingDetailMap.put("rows", rows);
		biddingDetailMap.put("isWin", 0);
		List<BiddingDetailInfoPo> biddingDetailInfoPos = biddingDetailInfoFacade.findBiddingDetailInfoByBiddingIds(biddingDetailMap);
		if(CollectionUtils.isNotEmpty(biddingDetailInfoPos)){
			
			//封装货物名称
			List<Integer> goodsInfoIds=CommonUtils.getValueList(biddingDetailInfoPos, "goodsInfoId");
			//key:货物ID  value:货物名称
			Map<Integer, String> goodsMap=null;
			if(CollectionUtils.isNotEmpty(goodsInfoIds)){
				List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
				if(CollectionUtils.isNotEmpty(goodsInfos)){
					goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
				}
			}
			
			//封装线路
			List<Integer> lineInfoIds=CommonUtils.getValueList(biddingDetailInfoPos, "lineInfoId");
			//key:线路ID  value：线路名称
			Map<Integer, String> lineMap=null;
			if(CollectionUtils.isNotEmpty(lineInfoIds)){
				List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
				if(CollectionUtils.isNotEmpty(lineInfoPos)){
					lineMap=CommonUtils.listforMap(lineInfoPos, "id", "lineName");
				}
			}
			
			for(BiddingDetailInfoPo biddingDetail:biddingDetailInfoPos){
				
				//封装货物
				if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(biddingDetail.getGoodsInfoId())!=null){
					biddingDetail.setGoodsName(goodsMap.get(biddingDetail.getGoodsInfoId()));
				}
				//封装线路
				if(MapUtils.isNotEmpty(lineMap)&&lineMap.get(biddingDetail.getLineInfoId())!=null){
					biddingDetail.setLineName(lineMap.get(biddingDetail.getLineInfoId()));
				}
				//封装开始日期
				if(biddingDetail.getStartDate()!=null){
					biddingDetail.setStartDateStr(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(biddingDetail.getStartDate()));
				}
				//封装结束日期
				if(biddingDetail.getEndDate()!=null){
					biddingDetail.setEndDateStr(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(biddingDetail.getEndDate()));
				}
				
				//根据每个招标明细查询我的报价明细信息
				Map<String, Object> myOfferDetailMap=new HashMap<String,Object>();
				myOfferDetailMap.put("biddingDetailId", biddingDetail.getId());
				myOfferDetailMap.put("orgRootId", orgRootId);
				myOfferDetailMap.put("orgInfoId", orgInfoId);
				MyOfferDetailedPo myOfferDetailedPo = myOfferDetailedFacade.findMyOfferDetailMationByBiddingDetailId(myOfferDetailMap);
				
				if(myOfferDetailedPo!=null){
					
					biddingDetail.setTransportPrice(myOfferDetailedPo.getTransportPrice());
					biddingDetail.setLossRatio(myOfferDetailedPo.getReasonableLossRatio());
					biddingDetail.setLossMoney(myOfferDetailedPo.getLossDeductionPrice());
					biddingDetail.setOfferPrice(myOfferDetailedPo.getTotalQuotedPrice());
					
				}
				
			}
			
		}
		return biddingDetailInfoPos;
	}
	
	/**
	 * @author zhangshuai  2017年8月4日 上午11:09:57
	 * @param request
	 * @param response
	 * @return
	 * 根据招标ID查询招标明细总数
	 */
	@RequestMapping(value="/getBiddingDetailMationCountByBiddingInfoId",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer	getBiddingDetailMationCountByBiddingInfoId(HttpServletRequest request,HttpServletResponse response){
		
		//接收招标ID
		Integer biddingInfoId=Integer.parseInt(request.getParameter("biddingInfoId"));
		
		//接收模糊查询条件
		String goodsName=request.getParameter("goodsName");
		String lineName=request.getParameter("lineName");
		
		//根据招标ID查询招标明细信息
		List<Integer> biddingInfoIds=new ArrayList<Integer>();
		biddingInfoIds.add(biddingInfoId);
		Map<String, Object> biddingDetailMap=new HashMap<String,Object>();
		biddingDetailMap.put("biddingIds", biddingInfoIds);
		biddingDetailMap.put("goodsName", goodsName);
		biddingDetailMap.put("lineName", lineName);
		Integer	count = biddingDetailInfoFacade.getBiddingDetailMationCountByBiddingInfoId(biddingDetailMap);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年8月4日 下午4:08:25
	 * @param request
	 * @param response
	 * @return
	 * 判断当前时间是否已经超过主招标信息报价截止日期
	 */
	@RequestMapping(value="/findBiddingInfoMationByBiddingDetailId",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findBiddingInfoMationByBiddingDetailId(HttpServletRequest request,HttpServletResponse response,Model model){
		
		JSONObject jo=new JSONObject();
		
		//接收操作的招标明细信息ID
		Integer biddingDetailId=Integer.parseInt(request.getParameter("biddingDetailId"));
		//根据招标明细ID查询招标明细信息
		Map<String, Object> biddingDetailMap=new HashMap<String,Object>();
		biddingDetailMap.put("biddingDetailId", biddingDetailId);
		List<BiddingDetailInfoPo> biddingDetailInfoPos = biddingDetailInfoFacade.findBiddingDetailInfoByBiddingIds(biddingDetailMap);
		BiddingDetailInfoPo biddingDetailPo=new BiddingDetailInfoPo();
		if(CollectionUtils.isNotEmpty(biddingDetailInfoPos)){
			for (BiddingDetailInfoPo biddingDetailInfoPo : biddingDetailInfoPos) {
				biddingDetailPo=biddingDetailInfoPo;
			}
		}
		BigDecimal pertenSum=null;
		if(biddingDetailPo!=null){
			pertenSum=biddingDetailPo.getQuantity();
		}
		model.addAttribute("biddingDetailId", biddingDetailId);
		if(pertenSum.compareTo(new BigDecimal(0))==-1 || pertenSum.compareTo(new BigDecimal(0))==0){
			pertenSum=new BigDecimal(0);
		}
		//根据招标明细ID查询招标主信息
		BiddingInfoPo biddingInfoPo=biddingInfoFacade.findbiddingInfoMationBybiddingDetailId(biddingDetailId);
		
		//判断主招标信息是否是已发布或回收报价
		if(biddingInfoPo.getBiddingStatus()!=4 && biddingInfoPo.getBiddingStatus()!=6){
			jo.put("success", false);
			jo.put("msg", "主招标信息未发布或未回收报价!");
			return jo;
		}
		
		//判断当前时间是否大于报价截止日期
		if(Calendar.getInstance().getTime().getTime()>biddingInfoPo.getQuotationDeadline().getTime()){
			jo.put("success", false);
			jo.put("msg", "当前招标信息已截止报价!");
			return jo;
		}else{
			jo.put("success", true);
			jo.put("msg", pertenSum);
		}
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年8月4日 下午6:17:26
	 * @param request
	 * @param response
	 * @return
	 * 添加/修改报价信息
	 */
	@RequestMapping(value="/addOrUpdateMyOfferInfo",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateMyOfferInfo(HttpServletRequest request,HttpServletResponse response){
		
		JSONObject jo=new JSONObject();
		
		//从session中取出登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer userId=userInfo.getId();//用户ID
		Integer userRole=userInfo.getUserRole();//用户角色
		Integer userOrgRootId=null;//主机构ID
		Integer userOrgInfoId=null;//组织机构ID
		//企业货主/物流公司
		if(userRole==1 || userRole==2){
			userOrgRootId=userInfo.getOrgRootId();
			userOrgInfoId=userInfo.getOrgInfoId();
		}else 
			//个体货主/司机
			if(userRole==3 || userRole==4){
			userOrgRootId=userInfo.getId();
			userOrgInfoId=userInfo.getId();
		}
		
		//接收页面添加参数
		BigDecimal transportPrice=new BigDecimal(request.getParameter("transportPrice"));//运价
		BigDecimal reasonableLossRatio=new BigDecimal(request.getParameter("reasonableLossRatio"));//损耗比例
		BigDecimal lossDeductionPrice=new BigDecimal(request.getParameter("lossDeductionPrice"));//损耗金额
		String quotationDescription=request.getParameter("quotationDescription");//报价说明
		BigDecimal biddingDetailSum=new BigDecimal(request.getParameter("biddingDetailSum"));//总量
		Integer sign=Integer.parseInt(request.getParameter("sign"));//新增/修改状态
		Integer biddingDetailId=Integer.parseInt(request.getParameter("biddingDetailId"));//招标明细ID
		Integer myOfferDetailId=null;
		if(request.getParameter("myOfferDetailId")!=null&&request.getParameter("myOfferDetailId")!=""){
			myOfferDetailId=Integer.parseInt(request.getParameter("myOfferDetailId"));//修改时报价信息ID
		}

		MyOfferDetailedPo myOfferDetailedPo=new MyOfferDetailedPo();
		myOfferDetailedPo.setTransportPrice(transportPrice);
		myOfferDetailedPo.setReasonableLossRatio(reasonableLossRatio);
		myOfferDetailedPo.setLossDeductionPrice(lossDeductionPrice);
		myOfferDetailedPo.setQuotationDescription(quotationDescription);
		myOfferDetailedPo.setBiddingDetailSum(biddingDetailSum);
		myOfferDetailedPo.setSign(sign);
		myOfferDetailedPo.setBiddingDetailedInfoId(biddingDetailId);
		
		jo=myOfferPoFacade.addOrUpdateMyOfferInfo(myOfferDetailedPo,userId,userRole,userOrgRootId,userOrgInfoId,myOfferDetailId);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年8月7日 上午10:57:01
	 * @param request
	 * @param response
	 * @return
	 * 进入修改我的报价模态框
	 */
	@RequestMapping(value="/go_update_participating_quotation",produces="application/json;charset=utf-8")
	public String go_update_participating_quotation(HttpServletRequest request,HttpServletResponse response,Model model){
		String updateMyOffer="修改我的报价信息";
		model.addAttribute("updateMyOffer", updateMyOffer);
		return "template/biddingManagement/my_offer_root_page/update_participating_quotation";
	}
	
	/**
	 * @author zhangshuai  2017年8月7日 下午12:27:18
	 * @param response
	 * @param request
	 * @return
	 * 根据招标明细信息ID，登录方主机构，登录方所属组织查询报价明细信息
	 */
	@RequestMapping(value="/findOfferdetailMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public MyOfferDetailedPo findOfferdetailMationById(HttpServletResponse response,HttpServletRequest request){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();//用户角色
		Integer userRootId=null;
		Integer userInfoId=null;
		//企业货主/物流公司
		if(userRole==1 || userRole==2){
			userRootId=userInfo.getOrgRootId();
			userInfoId=userInfo.getOrgInfoId();
		}else 
			//个体货主/司机
			if(userRole==3 || userRole==4){
			userRootId=userInfo.getId();
			userInfoId=userInfo.getId();
		}
		
		//接收页面操作的招标明细ID
		Integer biddingDetailId=Integer.parseInt(request.getParameter("biddingDetailId"));//招标明细ID
		//根据登录用户主机构ID、登录用户所属组织、招标明细ID、查询报价明细信息表
		Map<String, Object> myOfferDetailMap=new HashMap<String,Object>();
		myOfferDetailMap.put("biddingDetailId", biddingDetailId);
		myOfferDetailMap.put("userRootId", userRootId);
		myOfferDetailMap.put("userInfoId", userInfoId);
		MyOfferDetailedPo myOfferDetailedPo=myOfferDetailedFacade.findMyOfferDetailMationByBiddingDetailId(myOfferDetailMap);
		return myOfferDetailedPo;
	}
	
	/**
	 * @author zhangshuai  2017年8月7日 下午6:28:27
	 * @param request
	 * @param response
	 * @return
	 * 根据招标明细ID查询当前登录用户是否已经参与过报价信息
	 */
	@RequestMapping(value="/findMyOfferDetailMationCountByBiddingDetailId",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer findMyOfferDetailMationCountByBiddingDetailId(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();//用户角色
		Integer userRootId=null;
		Integer userInfoId=null;
		//企业货主/物流公司
		if(userRole==1 || userRole==2){
			userRootId=userInfo.getOrgRootId();
			userInfoId=userInfo.getOrgInfoId();
		}else 
			//个体货主/司机
			if(userRole==3 || userRole==4){
			userRootId=userInfo.getId();
			userInfoId=userInfo.getId();
		}
		
		//接收页面操作的招标明细ID
		Integer biddingDetailId=Integer.parseInt(request.getParameter("biddingDetailId"));//招标明细ID
		//根据登录用户主机构ID、登录用户所属组织、招标明细ID、查询报价明细信息表
		Map<String, Object> myOfferDetailMap=new HashMap<String,Object>();
		myOfferDetailMap.put("biddingDetailId", biddingDetailId);
		myOfferDetailMap.put("userRootId", userRootId);
		myOfferDetailMap.put("userInfoId", userInfoId);
		Integer count=myOfferDetailedFacade.findMyOfferDetailMationCountByBiddingDetailId(myOfferDetailMap);
		return count;
	}
	
	/**==============================我的中标=======================*/
	@RequestMapping(value="/go_my_bid_root_page",produces="application/json;charset=utf-8")
	public String go_my_bid_root_page(HttpServletRequest request,HttpServletResponse response){
		return "template/biddingManagement/my_bid_root_page/my_bid_root_page";
	}
	
	
	/** 
	* @方法名: findAvailableBalanceOfMyAccount 
	* @作者: zhangshuai
	* @时间: 2017年9月29日 上午11:05:13
	* @返回值类型: JSONObject 
	* @throws 
	*   参与报价前检查账户余额是否大于或等于招标保证金金额
	*/
	@RequestMapping(value="/findAvailableBalanceOfMyAccount")
	@ResponseBody
	public JSONObject findAvailableBalanceOfMyAccount(HttpServletRequest request,HttpServletResponse response){
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		
		
		JSONObject jo=new JSONObject();
		
		//获取操作id
		String biddingDetailId=request.getParameter("biddingDetailId");
		if(StringUtils.isBlank(biddingDetailId)|| "".equals(biddingDetailId)){
			jo.put("success", false);
			jo.put("msg", "系统异常，请稍候再试!");
			return jo;
		}
		
		//先获取到招标主信息的保证金金额
		BiddingInfoPo biddingInfoPo = biddingInfoFacade.findbiddingInfoMationBybiddingDetailId(Integer.valueOf(biddingDetailId));
		if(biddingInfoPo!=null){
			
			 if(biddingInfoPo.getCautionMoney()!=null){
				 
				//判断登录用户账户信息
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
				}else 
					//物流公司or司机(查询运单)
					if(userInfo.getUserRole()==2 || userInfo.getUserRole()==4){
					
						//根据主机构id，组织机构id查询招标报价方的中标金额(被冻结  未解冻)
						Map<String, Object> paramsMap=new HashMap<String,Object>();
						paramsMap.put("userRole", userInfo.getUserRole());//登录角色
						paramsMap.put("orgRootId", userInfo.getOrgRootId());//主机构
						paramsMap.put("orgInfoId", userInfo.getOrgInfoId());//组织机构
						paramsMap.put("shipper", userInfo.getOrgInfoId());//承运方
						paramsMap.put("frozenType", 2);//被冻结状态
						paramsMap.put("isFrozen", 2);//未解冻
						
						List<WaybillFrozenInfoPo> waybillFrozenInfoPos=waybillFrozenInfoFacade.findCautionMoneyByUserRoleAndRootAndInfo(paramsMap);
						if(CollectionUtils.isNotEmpty(waybillFrozenInfoPos)){
							for (WaybillFrozenInfoPo waybillFrozenInfoPo : waybillFrozenInfoPos) {
								coverFreezingAmount=coverFreezingAmount.add(waybillFrozenInfoPo.getCautionMoney());
							}
						}
				}
				
				//账户金额(充值总额-提现总额+运单收款-运单付款)
				kyAccountAmount=accountAmount.subtract(withdrawalsMoney);
				//可用金额(账户金额-被冻结金额)
				availableAmount=kyAccountAmount.subtract(coverFreezingAmount);
				
				//判断账户金额是否大于等于招标保证金
				if(availableAmount.compareTo(biddingInfoPo.getCautionMoney())==1 ||
						availableAmount.compareTo(biddingInfoPo.getCautionMoney())==0
						){
					jo.put("success", true);
					jo.put("msg", "系统异常，请稍候再试!");
					return jo;
				}else if(availableAmount.compareTo(biddingInfoPo.getCautionMoney())==-1){
					jo.put("success", false);
					jo.put("msg", "请确保账户可用金额大于招标保证金金额{"+biddingInfoPo.getCautionMoney()+"}哦!");
					return jo;
				}else{
					jo.put("success", false);
					jo.put("msg", "系统异常，请稍候再试!");
					return jo;
				}
				
			 }else{
				 jo.put("success", false);
				 jo.put("msg", "系统异常，请稍候再试!");
				 return jo;
			 }
			
		}else{
			jo.put("success", false);
			jo.put("msg", "系统异常，请稍候再试!");
			return jo;
		}
		
	}
	
}
