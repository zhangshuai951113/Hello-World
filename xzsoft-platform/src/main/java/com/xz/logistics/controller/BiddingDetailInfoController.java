package com.xz.logistics.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.BiddingDetailInfoFacade;
import com.xz.facade.api.BiddingInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.MyOfferDetailedFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.BiddingDetailInfoPo;
import com.xz.model.po.BiddingInfoPo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.MyOfferDetailedPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.BiddingInfoModel;

/**
 * 招标明细controller
 * 
 * @author zhangya 2017年8月2日 上午11:37:14
 */
@Controller
@RequestMapping("/biddingDetailInfo")
public class BiddingDetailInfoController extends BaseController {

	@Resource
	private BiddingDetailInfoFacade biddingDetailInfoFacade;
	@Resource
	private BiddingInfoFacade biddingInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private LineInfoFacade lineInfoFacade;
	@Resource
	private MyOfferDetailedFacade myOfferDetailedFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;

	/**
	 * 招标明细信息管理页面
	 * 
	 * @author zhangya 2017年8月7日 下午5:42:50
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showBiddingDetailInfoPage", produces = "application/json; charset=utf-8")
	public String showBiddingDetailInfoPage(HttpServletRequest request, Model model) {
		if (StringUtils.isBlank(request.getParameter("biddingInfoId"))) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "招标信息不存在，无法进行明细操作！");
			model.addAttribute("content", jo);
			return "template/org/prompt_box_page";
		}
		Integer biddingInfoId = Integer.valueOf(request.getParameter("biddingInfoId"));
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 查询参数
		Map<String, Integer> params = new HashMap<String, Integer>();
		params.put("biddingInfoId", biddingInfoId);
		params.put("orgRootId", userInfo.getOrgRootId());
		BiddingInfoPo biddingInfoPo = biddingInfoFacade.getBiddingInfoById(params);
		String isShow = "block";
		String isHidden = "none";
		if (biddingInfoPo.getBiddingStatus() != 1 && biddingInfoPo.getBiddingStatus() != 3) {
			isShow = "none";
			isHidden = "block";
		}
		model.addAttribute("isShow", isShow);
		model.addAttribute("isHidden", isHidden);
		model.addAttribute("biddingInfoId", biddingInfoId);
		return "template/bidding/show_bidding_detail_info_page";
	}

	/**
	 * 招标明细信息列表
	 * 
	 * @author zhangya 2017年8月7日 下午5:43:47
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/listBiddingDetailInfoPage", produces = "application/json; charset=utf-8")
	public String listBiddingDetailInfoPage(HttpServletRequest request, Model model) {

		DataPager<BiddingDetailInfoPo> biddingDetailInfoPager = new DataPager<BiddingDetailInfoPo>();
		Map<String, Object> params = this.paramsToMap(request);

		// 封住查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		biddingDetailInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		biddingDetailInfoPager.setSize(rows);
		// 分页参数
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);

		// 招标id
		Integer biddingInfoId = null;
		if (params.get("biddingInfoId") != null) {
			biddingInfoId = Integer.valueOf(params.get("biddingInfoId").toString());
			queryMap.put("biddingInfoId", biddingInfoId);
		}
		// 货物名称
		String goodsName = null;
		if (params.get("goodsName") != null) {
			goodsName = params.get("goodsName").toString();
			queryMap.put("goodsName", goodsName);
		}
		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		queryMap.put("orgRootId", orgRootId);

		Integer totalNum = biddingDetailInfoFacade.countBiddingDetailInfoForPage(queryMap);
		List<BiddingDetailInfoPo> biddingDetailInfoList = biddingDetailInfoFacade
				.findBiddingDetailInfoForPage(queryMap);

		// 查询创建人
		List<Integer> userInfoIds = CommonUtils.getValueList(biddingDetailInfoList, "createUser");
		List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
		// key:用户ID value:用户名
		Map<Integer, String> userInfoMap = null;
		if (CollectionUtils.isNotEmpty(userInfos)) {
			userInfoMap = CommonUtils.listforMap(userInfos, "id", "userName");
		}

		// 查询线路名称
		List<Integer> lineInfoIds = CommonUtils.getValueList(biddingDetailInfoList, "lineInfoId");
		// key:线路ID value:线路名称
		Map<Integer, String> lineInfoMap = null;
		if (CollectionUtils.isNotEmpty(lineInfoIds)) {
			List<LineInfoPo> lineInfos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
			if (CollectionUtils.isNotEmpty(lineInfos)) {
				lineInfoMap = CommonUtils.listforMap(lineInfos, "id", "lineName");
			}
		}
		//封装状态
		Integer biddingStatus = null;
		if (biddingInfoId != null) {
			// 查询参数
			Map<String, Integer> paramsMap = new HashMap<String, Integer>();
			paramsMap.put("biddingInfoId", biddingInfoId);
			paramsMap.put("orgRootId", userInfo.getOrgRootId());
			BiddingInfoPo biddingInfoPo = biddingInfoFacade.getBiddingInfoById(paramsMap);
			biddingStatus = biddingInfoPo.getBiddingStatus();
		}
		
		for (BiddingDetailInfoPo biddingDetailInfoPo : biddingDetailInfoList) {
			// 封装创建人
			if (MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(biddingDetailInfoPo.getCreateUser()) != null) {
				biddingDetailInfoPo.setCreateUserName(userInfoMap.get(biddingDetailInfoPo.getCreateUser()));
			}
			// 封装线路名称
			if (MapUtils.isNotEmpty(lineInfoMap) && lineInfoMap.get(biddingDetailInfoPo.getLineInfoId()) != null) {
				biddingDetailInfoPo.setLineName(lineInfoMap.get(biddingDetailInfoPo.getLineInfoId()));
			}
			biddingDetailInfoPo.setBiddingStatus(biddingStatus);
		}

		biddingDetailInfoPager.setTotal(totalNum);
		biddingDetailInfoPager.setRows(biddingDetailInfoList);
		model.addAttribute("biddingDetailInfoPager", biddingDetailInfoPager);
		return "template/bidding/bidding_detail_info_data";
	}

	/**
	 * 招标明细信息编辑页
	 * 
	 * @author zhangya 2017年8月7日 下午5:58:55
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/editBiddingDetailInfoPage", produces = "application/json;charset=utf-8")
	public String editBiddingDetailInfoPage(HttpServletRequest request, HttpServletResponse response, Model model) {

		if (StringUtils.isBlank(request.getParameter("biddingInfoId"))) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "招标信息不存在，无法进行明细操作！");
			model.addAttribute("content", jo);
			return "template/org/prompt_box_page";
		}
		Integer biddingInfoId = Integer.valueOf(request.getParameter("biddingInfoId"));

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 获取主机构下的组织
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		String operateTitle = "招标明细新增";
		BiddingDetailInfoPo biddingDetailInfoPo = null;
		if (StringUtils.isBlank(request.getParameter("biddingDetailInfoId"))) {
			biddingDetailInfoPo = new BiddingDetailInfoPo();
			biddingDetailInfoPo.setBiddingInfoId(biddingInfoId);
		} else {
			operateTitle = "招标信息修改";
			Integer biddingDetailInfoId = Integer.valueOf(request.getParameter("biddingDetailInfoId"));
			Map<String, Integer> params = new HashMap<String, Integer>();
			params.put("orgRootId", rootOrgInfoId);
			params.put("biddingDetailInfoId", biddingDetailInfoId);
			biddingDetailInfoPo = biddingDetailInfoFacade.getBiddingDetailInfoById(params);
			if(biddingDetailInfoPo.getStartDate()!=null){
				biddingDetailInfoPo.setStartDateStr(new SimpleDateFormat("yyyy-MM-dd").format(biddingDetailInfoPo.getStartDate()));
			}
			if(biddingDetailInfoPo.getEndDate()!=null){
				biddingDetailInfoPo.setEndDateStr(new SimpleDateFormat("yyyy-MM-dd").format(biddingDetailInfoPo.getEndDate()));
			}
		}
		model.addAttribute("operateTitle", operateTitle);
		model.addAttribute("biddingDetailInfoPo", biddingDetailInfoPo);
		return "template/bidding/edit_bidding_detail_info_page";
	}

	/**
	 * 新增、修改招标明细信息
	 * 
	 * @author zhangya 2017年8月8日 下午1:06:17
	 * @param request
	 * @param response
	 * @param biddingInfoModel
	 * @return
	 */
	@RequestMapping(value = "/saveBiddingDetailInfo", produces = "application/json;charset=utf-8")
	@ResponseBody
	public JSONObject saveBiddingDetailInfo(HttpServletRequest request, HttpServletResponse response,
			BiddingInfoModel biddingInfoModel) {
		JSONObject jo = new JSONObject();
		// 校验参数
		if (biddingInfoModel == null) {
			jo.put("success", false);
			jo.put("msg", "保存的招标明细信息无效！");
			return jo;
		}
		BiddingDetailInfoPo biddingDetailInfoPo = biddingInfoModel.getBiddingDetailInfoPo();
		if (biddingDetailInfoPo == null) {
			jo.put("success", false);
			jo.put("msg", "保存的招标明细信息无效！");
			return jo;
		}

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 获取主机构下的组织
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		try {
			jo = biddingDetailInfoFacade.addOrUpdateBiddingDetailInfo(biddingDetailInfoPo, userInfoId, orgRootId);
		} catch (Exception e) {
			e.printStackTrace();
			jo.put("success", false);
			jo.put("msg", "保存的招标明细异常！");
		}
		return jo;
	}

	/**
	 * 招标明细删除
	 *@author zhangya 2017年8月9日 下午4:29:31
	 *@param request
	 *@param response
	 *@return
	 */
	@RequestMapping(value = "/deleteBiddingDetailInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteBiddingDetailInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		// 被操作的招标ID
		List<Integer> biddingDetailInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("biddingDetailInfoIds"))) {
			String biddingDetailInfoIds = request.getParameter("biddingDetailInfoIds").trim();
			String[] biddingDetailArray = biddingDetailInfoIds.split(",");
			if (biddingDetailArray.length > 0) {
				for (String biddingDetailIdStr : biddingDetailArray) {
					if (StringUtils.isNotBlank(biddingDetailIdStr)) {
						biddingDetailInfoIdList.add(Integer.valueOf(biddingDetailIdStr.trim()));
					}
				}
			}
		}

		// 所选招标明细不能为空
		if (CollectionUtils.isEmpty(biddingDetailInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选招标明细不能为空");
			return jo;
		}

		try {
			jo = biddingDetailInfoFacade.deleteBiddingDetailInfo(biddingDetailInfoIdList, userInfoId, orgRootId);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "招标明细删除异常，请稍后重试");
		}
		return jo;
	}
	
	/**
	 * 获取报价信息
	 *@author zhangya 2017年8月10日 下午6:22:03
	 *@param request
	 *@param model
	 *@return
	 */
	@RequestMapping(value = "/getOfferInfoData", produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<MyOfferDetailedPo> getOfferInfoData(HttpServletRequest request, Model model) {
		Map<String, Object> queryMap = this.paramsToMap(request);

		// 页数
		Integer page = 1;
		if (queryMap.get("page") != null) {
			page = Integer.valueOf(queryMap.get("page").toString());
		}

		// 行数
		Integer rows = 10;
		if (queryMap.get("rows") != null) {
			rows = Integer.valueOf(queryMap.get("rows").toString());
		}
		// 分页参数
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		
		// 招标明细ID
		Integer biddingDetailInfoId = null;
		if (queryMap.get("biddingDetailInfoId") != null) {
			biddingDetailInfoId = Integer.valueOf(queryMap.get("biddingDetailInfoId").toString());
		}

		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		queryMap.put("biddingDetailInfoId", biddingDetailInfoId);
		queryMap.put("orgRootId", orgRootId);
		
		// 查询报价信息
		List<MyOfferDetailedPo> myOfferDetailedPoList = myOfferDetailedFacade.findOfferInfoByBiddingDetailInfoId(queryMap);
		if (CollectionUtils.isNotEmpty(myOfferDetailedPoList)) {
			// 获取报甲方组织机构id
			List<Integer> orgInfoIdList = CommonUtils.getValueList(myOfferDetailedPoList, "offerOrgInfoId");
			// 获取机构名称
			Map<Integer, String> orgInfoMap = null;
			if(CollectionUtils.isNotEmpty(orgInfoIdList)){
				List<OrgInfoPo> orgInfoList = orgInfoFacade.findOrgNameByIds(orgInfoIdList);
				// 封装成map key 机构id value 组织机构名称
				orgInfoMap = CommonUtils.listforMap(orgInfoList, "id", "orgName");
			}

			// 获取个体名称
			Map<Integer, String> individualOwnerMap = null;
			if(CollectionUtils.isNotEmpty(orgInfoIdList)){
				List<IndividualOwnerPo> individualOwnerList = individualOwnerFacade.findIndividualOwnerByUserInfoIds(orgInfoIdList);
				// 封装成map key 个体货主用户ID value 个体货主名称
				individualOwnerMap = CommonUtils.listforMap(individualOwnerList, "userInfoId", "realName");
			}
			
			// 获取司机名称
			Map<Integer, String> driverMap = null;
			if(CollectionUtils.isNotEmpty(orgInfoIdList)){
				List<DriverInfo> driverList = driverInfoFacade.findDriverByUserInfoIds(orgInfoIdList);
				// 封装成map key 司机用户ID  value 司机名称
				driverMap = CommonUtils.listforMap(driverList, "userInfoId", "driverName");
			}
			Integer offerOrgInfoId = null;
			for (MyOfferDetailedPo myOfferDetailedPo : myOfferDetailedPoList) {
				// 封装报价组织机构名称
				if (myOfferDetailedPo.getOfferOrgInfoId() != null) {
					offerOrgInfoId = myOfferDetailedPo.getOfferOrgInfoId();
					switch (myOfferDetailedPo.getOfferRole()) {
					case 3:
						if(individualOwnerMap.get(offerOrgInfoId)!=null){
							myOfferDetailedPo.setOfferOrgInfoName(individualOwnerMap.get(offerOrgInfoId));
						}
						break;
					case 4:
						if(driverMap.get(offerOrgInfoId)!=null){
							myOfferDetailedPo.setOfferOrgInfoName(driverMap.get(offerOrgInfoId));
						}
						break;

					default:
						if( orgInfoMap.get(myOfferDetailedPo.getOfferOrgInfoId()) != null){
							myOfferDetailedPo.setOfferOrgInfoName(orgInfoMap.get(myOfferDetailedPo.getOfferOrgInfoId()));
						}
						break;
					}
					
				}

			}

		}
		return myOfferDetailedPoList;
	}

	/**
	 * 获取报价信息数量
	 *@author zhangya 2017年8月10日 下午6:31:41
	 *@param request
	 *@param model
	 *@return
	 */
	@RequestMapping(value = "/getOfferInfoCount", produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getOfferInfoCount(HttpServletRequest request, Model model) {
		Map<String, Object> queryMap =  this.paramsToMap(request);

		// 招标明细ID
		Integer biddingDetailInfoId = null;
		if (queryMap.get("biddingDetailInfoId") != null) {
			biddingDetailInfoId = Integer.valueOf(queryMap.get("biddingDetailInfoId").toString());
		}

		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("biddingDetailInfoId", biddingDetailInfoId);
		return myOfferDetailedFacade.countOfferInfoByBiddingDetailInfoId(queryMap);
	}
	
	/**
	 * 保存中标信息
	 *@author zhangya 2017年8月15日 上午10:26:40
	 *@param request
	 *@return
	 */
	@RequestMapping(value = "/confirmWinBidder", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject confirmWinBidder(HttpServletRequest request) {
		Map<String, Object> queryMap =  this.paramsToMap(request);
		
		// 报价明细ID
		Integer offerId = null;
		if (queryMap.get("offerId") != null) {
			offerId = Integer.valueOf(queryMap.get("offerId").toString());
		}
		
		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("offerId", offerId);
		return  biddingDetailInfoFacade.confirmWinBidder(orgInfoId,orgRootId, offerId,userInfo.getId(),userInfo.getUserRole());
	}
}
