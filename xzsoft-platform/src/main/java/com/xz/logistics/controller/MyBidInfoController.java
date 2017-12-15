package com.xz.logistics.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.dubbo.common.utils.CollectionUtils;
import com.alibaba.fastjson.JSONObject;
import com.xz.facade.api.BiddingDetailInfoFacade;
import com.xz.facade.api.BiddingInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.MyOfferDetailedFacade;
import com.xz.facade.api.MyOfferPoFacade;
import com.xz.facade.api.OrgDetailInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.BiddingDetailInfoPo;
import com.xz.model.po.BiddingInfoPo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.MyOfferDetailedPo;
import com.xz.model.po.MyOfferPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserInfo;

/**
* @author zhangshuai   2017年8月8日 下午12:15:02
* 类说明    我的中标controller
*/
@RequestMapping("myBidInfo")
@Controller
public class MyBidInfoController {

	@Resource
	private MyOfferDetailedFacade myOfferDetailedFacade;
	@Resource
	private MyOfferPoFacade myOfferPoFacade;
	@Resource
	private BiddingDetailInfoFacade biddingDetailInfoFacade;
	@Resource
	private BiddingInfoFacade biddingInfoFacade;
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
	@Resource
	private LineInfoFacade lineInfoFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private OrgDetailInfoFacade orgDetailInfoFacade;
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;
	/**
	 * @author zhangshuai  2017年8月16日 上午11:22:52
	 * @param request
	 * @param response
	 * @return
	 * 我的中标信息全查
	 */
	@RequestMapping(value="/findMyBidInfoMationAll",produces="application/json;charset-utf-8")
	@ResponseBody
	public List<MyOfferDetailedPo> findMyBidInfoMationAll(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();//用户角色
		Integer userRootId=null;
		Integer userInfoId=null;
		//物流公司/企业货主
		if(userRole==1 || userRole==2){
			userRootId=userInfo.getOrgRootId();
			userInfoId=userInfo.getOrgInfoId();
		}else 
			//个体货主/司机
			if(userRole==3 || userRole==4){
			userRootId=userInfo.getId();
			userInfoId=userInfo.getId();
		}
		
		//接收页面模糊查询条件信息
		String biddingCode=request.getParameter("biddingCode");//招标编号
		String biddingName=request.getParameter("biddingName");//招标名称
		String createUserName=request.getParameter("createUserName");//制单人
		String biddingOrg=request.getParameter("biddingOrg");//招标单位
		String goodsName=request.getParameter("goodsName");//货物名称
		String lineName=request.getParameter("lineName");//线路名称
		String makeStartTime=request.getParameter("makeStartTime");//制单时间开始
		String makeEndTime=request.getParameter("makeEndTime");//制单时间结束
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		
		//根据登录用户主机构ID，组织机构ID，登录用户角色查询我的报价明细信息表，中标状态为已中标
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("offerRole", userRole);//报价方角色
		params.put("offerOrgInfoId", userInfoId);//报价方组织机构ID
		params.put("offerOrgRootId", userRootId);//报价方主机构ID
		params.put("isBid", 1);//中标状态
		params.put("biddingCode", biddingCode);//招标编号(模糊条件)
		params.put("biddingName", biddingName);//招标名称(模糊条件)
		params.put("createUserName", createUserName);//制单人(迷糊条件)
		params.put("biddingOrg", biddingOrg);//招标单位(模糊条件)
		params.put("goodsName", goodsName);//货物名称(模糊条件)
		params.put("lineName", lineName);//线路名称(模糊条件)
		params.put("makeStartTime", makeStartTime);//制单时间开始(模糊条件)
		params.put("makeEndTime", makeEndTime);//制单时间结束(模糊条件)
		params.put("start", start);
		params.put("rows", rows);
		List<MyOfferDetailedPo> myOfferDetail=myOfferDetailedFacade.findMyBidMationByLoginUser(params);
		
		if(CollectionUtils.isNotEmpty(myOfferDetail)){
			for (MyOfferDetailedPo myOfferDetailedPo : myOfferDetail) {
				
				//封装中标单位
				if(myOfferDetailedPo.getIsBid()==1){
					
					//判断中标单位角色
					//物流公司/企业货主
					if(myOfferDetailedPo.getOfferRole()==1 || myOfferDetailedPo.getOfferRole()==2){
						List<Integer> orgInfoIds=new ArrayList<Integer>();
						orgInfoIds.add(myOfferDetailedPo.getOfferOrgRootId());
						List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
						if(CollectionUtils.isNotEmpty(orgInfoPos)){
							for (OrgInfoPo orgInfoPo : orgInfoPos) {
								myOfferDetailedPo.setBidderStr(orgInfoPo.getOrgName());
							}
						}
					}else 
						//个体货主
						if(myOfferDetailedPo.getOfferRole()==3){
							IndividualOwnerPo individualOwnerPo = individualOwnerFacade.findIndividualOwnerById(myOfferDetailedPo.getOfferOrgInfoId());
							if(individualOwnerPo!=null){
								myOfferDetailedPo.setBidderStr(individualOwnerPo.getRealName());	
							}
					}else 
						//司机
						if(myOfferDetailedPo.getOfferRole()==4){
							List<Integer> userInfoIds=new ArrayList<Integer>();
							userInfoIds.add(myOfferDetailedPo.getOfferOrgInfoId());
						    List<DriverInfo> driverInfos = driverInfoFacade.findDriverByUserInfoIds(userInfoIds);
						    if(CollectionUtils.isNotEmpty(driverInfos)){
						    	for (DriverInfo driverInfo : driverInfos) {
						    		myOfferDetailedPo.setBidderStr(driverInfo.getDriverName());
								}
						    }
					}
					
				}
				
				//根据招标明细ID查询招标明细信息
				List<Integer> biddingDetailIds=new ArrayList<Integer>();
				biddingDetailIds.add(myOfferDetailedPo.getBiddingDetailedInfoId());
				List<BiddingDetailInfoPo> biddingDetailInfoPos = biddingDetailInfoFacade.findBiddingDetailInfoByIds(biddingDetailIds);
				if(CollectionUtils.isNotEmpty(biddingDetailInfoPos)){
					for (BiddingDetailInfoPo biddingDetailInfoPo : biddingDetailInfoPos) {
						//封装货物信息
						List<Integer> goodsIds=new ArrayList<Integer>();
						goodsIds.add(biddingDetailInfoPo.getGoodsInfoId());
						List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
						if(CollectionUtils.isNotEmpty(goodsInfos)){
							for (GoodsInfo goodsInfo : goodsInfos) {
								myOfferDetailedPo.setGoodsName(goodsInfo.getGoodsName());
							}
						}
						//封装线路信息
						List<Integer> lineInfoIds=new ArrayList<Integer>();
						lineInfoIds.add(biddingDetailInfoPo.getLineInfoId());
						List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
						if(CollectionUtils.isNotEmpty(lineInfoPos)){
							for (LineInfoPo lineInfoPo : lineInfoPos) {
								myOfferDetailedPo.setLineName(lineInfoPo.getLineName());
							}
						}
						//封装发货单位
						if(biddingDetailInfoPo.getForwardingUnit()!=null){
							myOfferDetailedPo.setForwardingUnit(biddingDetailInfoPo.getForwardingUnit());
						}
						//封装到货单位
						if(biddingDetailInfoPo.getConsignee()!=null){
							myOfferDetailedPo.setConsignee(biddingDetailInfoPo.getConsignee());
						}
						//封装运距
						if(biddingDetailInfoPo.getDistance()!=null){
							myOfferDetailedPo.setDistance(biddingDetailInfoPo.getDistance());
						}
						//封装总量
						if(biddingDetailInfoPo.getQuantity()!=null){
							myOfferDetailedPo.setQuantity(biddingDetailInfoPo.getQuantity());
						}
					}
				}
				//根据招标明细ID查询招标主信息
				BiddingInfoPo biddingInfoPo = biddingInfoFacade.findbiddingInfoMationBybiddingDetailId(myOfferDetailedPo.getBiddingDetailedInfoId());
				if(biddingInfoPo!=null){
					
					//封装招标编号
					if(biddingInfoPo.getBiddingCode()!=null){
						myOfferDetailedPo.setBiddingCode(biddingInfoPo.getBiddingCode());
					}
					//封装招标名称
					if(biddingInfoPo.getBiddingName()!=null){
						myOfferDetailedPo.setBiddingName(biddingInfoPo.getBiddingName());
					}
					//封装招标单位
					if(biddingInfoPo.getBiddingOrg()!=null){
						List<Integer> orgInfoIds=new ArrayList<Integer>();
						orgInfoIds.add(biddingInfoPo.getBiddingOrg());
						List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
						if(CollectionUtils.isNotEmpty(orgInfoPos)){
							for (OrgInfoPo orgInfoPo : orgInfoPos) {
								myOfferDetailedPo.setBiddingOrgStr(orgInfoPo.getOrgName());
							}
						}
					}
					//封装报价截止日期
					if(biddingInfoPo.getQuotationDeadline()!=null){
						myOfferDetailedPo.setQuotationDeadlineStr(new SimpleDateFormat("yyyy-MM-dd").format(biddingInfoPo.getQuotationDeadline()));
					}
					//封装付款方式
					if(biddingInfoPo.getPaymentMethod()!=null){
						myOfferDetailedPo.setPaymentMethod(biddingInfoPo.getPaymentMethod());
					}
					//封装制单日期
					if(biddingInfoPo.getCreateTime()!=null){
						myOfferDetailedPo.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(biddingInfoPo.getCreateTime()));
					}
					//封装制单人
					if(biddingInfoPo.getCreateUser()!=null){
						List<Integer> userInfoIds=new ArrayList<Integer>();
						userInfoIds.add(biddingInfoPo.getCreateUser());
						List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
						if(CollectionUtils.isNotEmpty(userInfos)){
							for (UserInfo userInfo2 : userInfos) {
								myOfferDetailedPo.setCreateUserStr(userInfo2.getUserName());
							}
						}
					}
				}
			}
		}
		return myOfferDetail;
	}
	
	/**
	 * @author zhangshuai  2017年8月16日 下午6:04:21
	 * @param request
	 * @param response
	 * @return
	 * 查询我的中标总数
	 */
	@RequestMapping(value="/getMyBidInfoMationAllCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getMyBidInfoMationAllCount(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();//用户角色
		Integer userRootId=null;
		Integer userInfoId=null;
		//物流公司/企业货主
		if(userRole==1 || userRole==2){
			userRootId=userInfo.getOrgRootId();
			userInfoId=userInfo.getOrgInfoId();
		}else 
			//个体货主/司机
			if(userRole==3 || userRole==4){
			userRootId=userInfo.getId();
			userInfoId=userInfo.getId();
		}
		
		//接收页面模糊查询条件信息
		String biddingCode=request.getParameter("biddingCode");//招标编号
		String biddingName=request.getParameter("biddingName");//招标名称
		String createUserName=request.getParameter("createUserName");//制单人
		String biddingOrg=request.getParameter("biddingOrg");//招标单位
		String goodsName=request.getParameter("goodsName");//货物名称
		String lineName=request.getParameter("lineName");//线路名称
		String makeStartTime=request.getParameter("makeStartTime");//制单时间开始
		String makeEndTime=request.getParameter("makeEndTime");//制单时间结束
		
		//根据登录用户主机构ID，组织机构ID，登录用户角色查询我的报价明细信息表，中标状态为已中标
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("offerRole", userRole);//报价方角色
		params.put("offerOrgInfoId", userInfoId);//报价方组织机构ID
		params.put("offerOrgRootId", userRootId);//报价方主机构ID
		params.put("isBid", 1);//中标状态
		params.put("biddingCode", biddingCode);//招标编号(模糊条件)
		params.put("biddingName", biddingName);//招标名称(模糊条件)
		params.put("createUserName", createUserName);//制单人(迷糊条件)
		params.put("biddingOrg", biddingOrg);//招标单位(模糊条件)
		params.put("goodsName", goodsName);//货物名称(模糊条件)
		params.put("lineName", lineName);//线路名称(模糊条件)
		params.put("makeStartTime", makeStartTime);//制单时间开始(模糊条件)
		params.put("makeEndTime", makeEndTime);//制单时间结束(模糊条件)
		Integer count=myOfferDetailedFacade.getMyBidInfoMationAllCount(params);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年8月16日 下午7:59:39
	 * @param request
	 * @param response
	 * @return
	 * 修改是否确认中标状态前查询该状态
	 */
	@RequestMapping(value="/findMyBidStatus",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer findMyBidStatus(HttpServletRequest request,HttpServletResponse response){
		
		//接收页面操作ID
		Integer id=Integer.parseInt(request.getParameter("myBidIds"));
		//根据ID查询我的报价明细信息
		MyOfferDetailedPo myOfferDetailedPo=myOfferDetailedFacade.findMyOfferDetailMationById(id);
		return myOfferDetailedPo.getIsBidStatus();
	}
	
	/**
	 * @author zhangshuai  2017年8月16日 下午8:08:28
	 * @param request
	 * @param response
	 * @return
	 * 根据ID修改是否确认中标状态
	 */
	@RequestMapping(value="/updateMyBidStatus",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject updateMyBidStatus(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userId=userInfo.getId();
		//接收页面操作ID和修改状态
		Integer id=Integer.parseInt(request.getParameter("myBidIds"));
		Integer status=Integer.parseInt(request.getParameter("status"));
		//根据ID修改我的报价明细是否确认中标状态
		jo=myOfferDetailedFacade.updateMyOfferDetailIsBidStatusById(id,status,userId);
		return jo;
	}
	
}
