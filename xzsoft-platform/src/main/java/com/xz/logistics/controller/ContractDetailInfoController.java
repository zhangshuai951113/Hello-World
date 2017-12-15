package com.xz.logistics.controller;

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
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.date.DateUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.BiddingDetailInfoFacade;
import com.xz.facade.api.BiddingInfoFacade;
import com.xz.facade.api.ContractDetailInfoFacade;
import com.xz.facade.api.ContractInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.MyOfferDetailedFacade;
import com.xz.facade.api.MyOfferPoFacade;
import com.xz.model.po.ContractDetailInfo;
import com.xz.model.po.ContractInfo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.ContractInfoModel;

/**
 * 合同明细控制器
 * 
 * @author zhangya 2017年6月16日 上午11:11:30
 * 
 */
@Controller
@RequestMapping("/contractDetailInfo")
public class ContractDetailInfoController extends BaseController {

	private final Logger log = LoggerFactory.getLogger(getClass());

	@Resource
	private ContractDetailInfoFacade contractDetailInfoFacade;
	@Resource
	private ContractInfoFacade contractInfoFacade;
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
	@Resource
	private LineInfoFacade lineInfoFacade;
	@Resource
	private BiddingDetailInfoFacade biddingDetailInfoFacade;
	@Resource
	private BiddingInfoFacade biddingInfoFacade;
	@Resource 
	private MyOfferDetailedFacade myOfferDetailedFacade;
	@Resource
	private MyOfferPoFacade myOfferPoFacade;
	
	/**
	 * 合同明细查询页面
	 * 
	 * @author zhangya 2017年6月16日 上午11:15:44
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/showContractDetailInfoPage", produces = "application/json; charset=utf-8")
	public String showContractDetailInfoPage(HttpServletRequest request, Model model) {

		if (StringUtils.isBlank(request.getParameter("contractInfoId"))) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "合同信息不存在，无法进行明细操作！");
			model.addAttribute("content", jo);
			return "template/contract/prompt_box_page";
		}
		Integer contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		model.addAttribute("contractInfoId", contractInfoId);
		return "template/contract/show_logistics_contract_detail_info_page";
	}

	/**
	 * 合同明细列表数据加载
	 * 
	 * @author zhangya 2017年6月16日 上午11:15:44
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/listContractDetailInfo", produces = "application/json; charset=utf-8")
	public String listContractDetailInfo(HttpServletRequest request, Model model) {
		DataPager<ContractDetailInfo> contractDetailInfoPager = new DataPager<ContractDetailInfo>();
		Map<String, Object> params = this.paramsToMap(request);

		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		contractDetailInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		contractDetailInfoPager.setSize(rows);

		// 合同主ID
		Integer contractInfoId = null;
		if (params.get("contractInfoId") != null) {
			contractInfoId = Integer.valueOf(params.get("contractInfoId").toString());
		}
		// 合同类型
		Integer contractClassify = 1;
		if (params.get("contractClassify") != null) {
			contractClassify = Integer.valueOf(params.get("contractClassify").toString());
		}
		// 货物名称
		String goodsName = null;
		if (params.get("goodsName") != null) {
			goodsName = params.get("goodsName").toString();
		}
		// 线路id
		String lineInfoId = null;
		if (params.get("lineInfoId") != null) {
			lineInfoId = params.get("lineInfoId").toString();
		}
		// 发货单位
		String forwardingUnit = null;
		if (params.get("forwardingUnit") != null) {
			forwardingUnit = params.get("forwardingUnit").toString();
		}
		// 到货单位
		String consignee = null;
		if (params.get("consignee") != null) {
			consignee = params.get("consignee").toString();
		}
		//起始日期开始
		Date lContractStartTime = null;
		if (params.get("lContractStartTime") != null) {
			lContractStartTime = DateUtils.formatTime(params.get("lContractStartTime").toString());
		}
		//起始日期截止
		Date lContractEndTime = null;
		if (params.get("lContractEndTime") != null) {
			lContractEndTime = DateUtils.formatTime(params.get("lContractEndTime").toString());
		}
		//结束日期开始
		Date lContractEndTimeStart = null;
		if (params.get("lContractEndTimeStart") != null) {
			lContractEndTimeStart = DateUtils.formatTime(params.get("lContractEndTimeStart").toString());
		}
		//结束日期结束
		Date lContractEndTimeEnd = null;
		if (params.get("lContractEndTimeEnd") != null) {
			lContractEndTimeEnd = DateUtils.formatTime(params.get("lContractEndTimeEnd").toString());
		}
		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgRootId = userInfo.getOrgRootId();

		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("createUser", userInfoId);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("contractInfoId", contractInfoId);
		queryMap.put("goodsName", goodsName);
		// queryMap.put("contractClassify", 1);
		queryMap.put("lineInfoId", lineInfoId);
		queryMap.put("forwardingUnit", forwardingUnit);
		queryMap.put("consignee", consignee);
		queryMap.put("lContractStartTime", lContractStartTime);
		queryMap.put("lContractEndTime", lContractEndTime);
		queryMap.put("lContractEndTimeStart", lContractEndTimeStart);
		queryMap.put("lContractEndTimeEnd", lContractEndTimeEnd);
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		Integer totalNum = contractDetailInfoFacade.countContractDetailInfoForPage(queryMap);
		List<ContractDetailInfo> contractDetailInfoList = contractDetailInfoFacade
				.findContractDetailInfoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(contractDetailInfoList)) {
			// 查询线路信息
			List<Integer> lineInfoIds = CommonUtils.getValueList(contractDetailInfoList, "lineInfoId");
			// key:线路ID value:线路名称
			Map<Integer, String> lineInfoMap = null;
			if (CollectionUtils.isNotEmpty(lineInfoIds)) {
				List<LineInfoPo> lineInfos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
				if (CollectionUtils.isNotEmpty(lineInfos)) {
					lineInfoMap = CommonUtils.listforMap(lineInfos, "id", "lineName");
				}
			}

			// // 查询货物信息
			// List<Integer> goodsInfoIds =
			// CommonUtils.getValueList(contractDetailInfoList, "goodsInfoId");
			// List<GoodsInfo> goodsInfos =
			// goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
			// // key:线路ID value:线路名称
			// Map<Integer, String> goodsInfoMap = null;
			// if (CollectionUtils.isNotEmpty(goodsInfos)) {
			// goodsInfoMap = CommonUtils.listforMap(goodsInfos, "id",
			// "goodsName");
			// }

			for (ContractDetailInfo contractDetaiInfo : contractDetailInfoList) {
				// 封装线路
				if (MapUtils.isNotEmpty(lineInfoMap) && lineInfoMap.get(contractDetaiInfo.getLineInfoId()) != null) {
					contractDetaiInfo.setLineName(lineInfoMap.get(contractDetaiInfo.getLineInfoId()));
				}
				// // 封装货物
				// if (MapUtils.isNotEmpty(goodsInfoMap) &&
				// goodsInfoMap.get(contractDetaiInfo.getGoodsInfoId()) != null)
				// {
				// contractDetaiInfo.setGoodsName(goodsInfoMap.get(contractDetaiInfo.getGoodsInfoId()));
				// }
				
				if(contractDetaiInfo.getEffectiveDate()!=null){
					contractDetaiInfo.setEffectiveDateStr(new SimpleDateFormat("yyyy-MM-dd").format(contractDetaiInfo.getEffectiveDate()));
				}
				
				if(contractDetaiInfo.getEndDate()!=null){
					contractDetaiInfo.setEndDateStr(new SimpleDateFormat("yyyy-MM-dd").format(contractDetaiInfo.getEndDate()));
				}
				
			}
		}

		contractDetailInfoPager.setRows(contractDetailInfoList);
		contractDetailInfoPager.setTotal(totalNum);
		model.addAttribute("contractDetailInfoPager", contractDetailInfoPager);
		if (contractClassify == 2)
			return "template/contract/sub_contract_detail_info_data";
		return "template/contract/logistics_contract_detail_info_data";
	}

	/**
	 * 合同新增编辑页
	 * 
	 * @author zhangya 2017年6月18日 下午12:43:50
	 * @param request
	 * @return
	 */
	@RequestMapping("/addOrEditContractDetailInfoPage")
	public String addOrEditContractDetailInfoPage(HttpServletRequest request, Model model) {
		// 获取session信息
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		String operateTitle = "合同明细新增";
		// 校验合同主表ID
		if (StringUtils.isBlank(request.getParameter("contractInfoId"))) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "合同主信息不存在，无法进行明细操作！");
			model.addAttribute("content", jo);
			return "template/contract/prompt_box_page";
		}
		// 获取后台主表信息
		Integer contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		// 封装基础参数
		Map<String, Integer> params = new HashMap<String, Integer>();
		params.put("orgRootId", userInfo.getOrgRootId());
		// params.put("createUser", userInfo.getId());
		// params.put("contractClassify", 1);
		params.put("contractInfoId", contractInfoId);
		ContractInfo contractInfo = contractInfoFacade.getContractInfoById(params);
		if (contractInfo == null) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "合同主信息不存在，无法进行明细操作！");
			model.addAttribute("content", jo);
			return "template/contract/prompt_box_page";
		}

		// 合同主信息校验
		if (contractInfo.getContractStatus() != 1 && contractInfo.getContractStatus() != 3
				&& contractInfo.getContractStatus() != 6 && contractInfo.getContractStatus() != 7) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "合同已提交操作，无法新增明细信息！");
			model.addAttribute("content", jo);
			return "template/org/prompt_box_page";
		}

		ContractDetailInfo contractDetailInfo = null;
		if (StringUtils.isNotBlank(request.getParameter("contractDetailInfoId"))) {
			operateTitle = "合同明细修改";
			Integer contractDetailInfoId = Integer.valueOf(request.getParameter("contractDetailInfoId").toString());
			params.put("contractDetailInfoId", contractDetailInfoId);
			contractDetailInfo = contractDetailInfoFacade.getContractDetailInfoById(params);
			if (contractDetailInfo == null) {
				operateTitle = "合同明细新增";
				contractDetailInfo = new ContractDetailInfo();
				contractDetailInfo.setEffectiveDate(contractInfo.getEffectiveDate());
				contractDetailInfo.setEndDate(contractInfo.getEndDate());
				contractDetailInfo.setContractInfoId(contractInfoId);
			}
		} else {
			// 新增合同明细
			contractDetailInfo = new ContractDetailInfo();
			contractDetailInfo.setEffectiveDate(contractInfo.getEffectiveDate());
			contractDetailInfo.setEndDate(contractInfo.getEndDate());
			contractDetailInfo.setContractInfoId(contractInfoId);
		}
		model.addAttribute("contractDetailInfo", contractDetailInfo);
		model.addAttribute("operateTitle", operateTitle);
		return "template/contract/contract_detail_info_edit_page";
	}

	/**
	 * 合同信息新增修改
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/addOrUpdateContractDetailInfo")
	@ResponseBody
	public JSONObject addOrUpdateContractDetailInfo(HttpServletRequest request,
			ContractInfoModel contractDetailInfoModel) {
		JSONObject jo = new JSONObject();

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userInfoId = userInfo.getId();
		
		try {
			
			jo = contractDetailInfoFacade.addOrUpdateContractDetailInfo(contractDetailInfoModel, rootOrgInfoId,
					orgInfoId, userInfoId);
		} catch (Exception e) {
			log.error("合同信息保存异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "合同信息保存服务异常，请稍后重试");
		}
		return jo;
	}

	/**
	 * 合同信息删除
	 * 
	 * @author zhangya 2017年6月24日 下午12:00:47
	 * @param request
	 * @param contractDetailInfoModel
	 * @return
	 */
	@RequestMapping("/deleteContractDetailInfo")
	@ResponseBody
	public JSONObject deleteContractDetailInfo(HttpServletRequest request) {
		JSONObject jo = null;

		// 要删除的合同ID
		List<Integer> contractDetailInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("contractDetailInfoIds"))) {
			String contractDetailInfoIds = request.getParameter("contractDetailInfoIds").trim();
			String[] contractDetailArray = contractDetailInfoIds.split(",");
			if (contractDetailArray.length > 0) {
				for (String contractDetailInfoIdStr : contractDetailArray) {
					if (StringUtils.isNotBlank(contractDetailInfoIdStr)) {
						contractDetailInfoIdList.add(Integer.valueOf(contractDetailInfoIdStr.trim()));
					}
				}
			}
		}

		if (CollectionUtils.isEmpty(contractDetailInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "要删除的合同明细不存在！");
			return jo;
		}
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer createUser = userInfo.getId();

		try {
			jo = contractDetailInfoFacade.deleteContractDetailInfo(orgRootId, createUser, contractDetailInfoIdList);
		} catch (Exception e) {
			log.error("合同明细删除异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "删除合同明细异常，请稍后重试");
		}
		return jo;
	}

	/**
	 * 合同明细查询页面(仅用于展示)
	 * 
	 * @author zhangya
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/showContractDetailInfoPageForView", produces = "application/json; charset=utf-8")
	public String showContractDetailInfoPageForView(HttpServletRequest request, Model model) {

		if (StringUtils.isBlank(request.getParameter("contractInfoId"))) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "合同信息不存在，无法进行明细操作！");
			model.addAttribute("content", jo);
			return "template/org/prompt_box_page";
		}
		Integer contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		model.addAttribute("contractInfoId", contractInfoId);
		return "template/contract/show_contract_detail_info_page";
	}

	/**
	 * 合同明细列表数据加载(仅用于展示)
	 * 
	 * @author zhangya 2017年6月16日 上午11:15:44
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/listContractDetailInfoForView", produces = "application/json; charset=utf-8")
	public String listContractDetailInfoForView(HttpServletRequest request, Model model) {
		DataPager<ContractDetailInfo> contractDetailInfoPager = new DataPager<ContractDetailInfo>();
		Map<String, Object> params = this.paramsToMap(request);

		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		contractDetailInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		contractDetailInfoPager.setSize(rows);

		// 合同主ID
		Integer contractInfoId = null;
		if (params.get("contractInfoId") != null) {
			contractInfoId = Integer.valueOf(params.get("contractInfoId").toString());
		}
		// 货物名称
		String goodsName = null;
		if (params.get("goodsName") != null) {
			goodsName = params.get("goodsName").toString();
		}
		// 线路id
		String lineInfoId = null;
		if (params.get("lineInfoId") != null) {
			lineInfoId = params.get("lineInfoId").toString();
		}
		// 发货单位
		String forwardingUnit = null;
		if (params.get("forwardingUnit") != null) {
			forwardingUnit = params.get("forwardingUnit").toString();
		}
		// 到货单位
		String consignee = null;
		if (params.get("consignee") != null) {
			consignee = params.get("consignee").toString();
		}
		//起始日期开始
		Date lContractStartTime = null;
		if (params.get("lContractStartTime") != null) {
			lContractStartTime = DateUtils.formatTime(params.get("lContractStartTime").toString());
		}
		//起始日期截止
		Date lContractEndTime = null;
		if (params.get("lContractEndTime") != null) {
			lContractEndTime = DateUtils.formatTime(params.get("lContractEndTime").toString());
		}
		//结束日期开始
		Date lContractEndTimeStart = null;
		if (params.get("lContractEndTimeStart") != null) {
			lContractEndTimeStart = DateUtils.formatTime(params.get("lContractEndTimeStart").toString());
		}
		//结束日期结束
		Date lContractEndTimeEnd = null;
		if (params.get("lContractEndTimeEnd") != null) {
			lContractEndTimeEnd = DateUtils.formatTime(params.get("lContractEndTimeEnd").toString());
		}
		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgRootId = userInfo.getOrgRootId();

		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("createUser", userInfoId);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("contractInfoId", contractInfoId);
		queryMap.put("goodsName", goodsName);
		queryMap.put("lineInfoId", lineInfoId);
		queryMap.put("forwardingUnit", forwardingUnit);
		queryMap.put("consignee", consignee);
		queryMap.put("lContractStartTime", lContractStartTime);
		queryMap.put("lContractEndTime", lContractEndTime);
		queryMap.put("lContractEndTimeStart", lContractEndTimeStart);
		queryMap.put("lContractEndTimeEnd", lContractEndTimeEnd);
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		Integer totalNum = contractDetailInfoFacade.countContractDetailInfoForPage(queryMap);
		List<ContractDetailInfo> contractDetailInfoList = contractDetailInfoFacade
				.findContractDetailInfoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(contractDetailInfoList)) {
			// 查询线路信息
			List<Integer> lineInfoIds = CommonUtils.getValueList(contractDetailInfoList, "lineInfoId");
			// key:线路ID value:线路名称
			Map<Integer, String> lineInfoMap = null;
			if(CollectionUtils.isNotEmpty(lineInfoIds)){
				List<LineInfoPo> lineInfos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
				if (CollectionUtils.isNotEmpty(lineInfos)) {
					lineInfoMap = CommonUtils.listforMap(lineInfos, "id", "lineName");
				}
			}

			// 查询合同明细执行情况
			List<Integer> contractDetailids = CommonUtils.getValueList(contractDetailInfoList, "id");
			Map<String, Object> paramsMap = new HashMap<String, Object>();
			paramsMap.put("list", contractDetailids);
			paramsMap.put("orgRootId", orgRootId);
			// key:ID value:合同对象
			Map<Integer, ContractDetailInfo> performanceInfoMap = null;
			List<ContractDetailInfo> contractDetailPerformanceInfos = contractDetailInfoFacade
					.findContractPerformanceByDetailIds(paramsMap);
			if (CollectionUtils.isNotEmpty(contractDetailPerformanceInfos)) {
				performanceInfoMap = CommonUtils.listforMap(contractDetailPerformanceInfos, "id", null);
			}

			// 查询货物信息
			List<Integer> goodsInfoIds = CommonUtils.getValueList(contractDetailInfoList, "goodsInfoId");
			List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
			// key:线路ID value:线路名称
			Map<Integer, String> goodsInfoMap = null;
			if (CollectionUtils.isNotEmpty(goodsInfos)) {
				goodsInfoMap = CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}

			for (ContractDetailInfo contractDetaiInfo : contractDetailInfoList) {
				// 封装线路
				if (MapUtils.isNotEmpty(lineInfoMap) && lineInfoMap.get(contractDetaiInfo.getLineInfoId()) != null) {
					contractDetaiInfo.setLineName(lineInfoMap.get(contractDetaiInfo.getLineInfoId()));
				}

				// 封装货物
				if (MapUtils.isNotEmpty(goodsInfoMap) && goodsInfoMap.get(contractDetaiInfo.getGoodsInfoId()) != null) {
					contractDetaiInfo.setGoodsName(goodsInfoMap.get(contractDetaiInfo.getGoodsInfoId()));
				}

				// 执行情况
				if (MapUtils.isNotEmpty(performanceInfoMap)
						&& performanceInfoMap.get(contractDetaiInfo.getId()) != null) {
					contractDetaiInfo
							.setExecutedAmount(performanceInfoMap.get(contractDetaiInfo.getId()).getExecutedAmount());
					contractDetaiInfo.setUnexecutedAmount(
							performanceInfoMap.get(contractDetaiInfo.getId()).getUnexecutedAmount());
					contractDetaiInfo
							.setAccountAmount(performanceInfoMap.get(contractDetaiInfo.getId()).getAccountAmount());
					contractDetaiInfo
							.setUnaccountAmount(performanceInfoMap.get(contractDetaiInfo.getId()).getUnaccountAmount());
					contractDetaiInfo
							.setInvoiceAmount(performanceInfoMap.get(contractDetaiInfo.getId()).getInvoiceAmount());
					contractDetaiInfo
							.setUninvoiceAmount(performanceInfoMap.get(contractDetaiInfo.getId()).getUninvoiceAmount());
				}
				
				if(contractDetaiInfo.getEffectiveDate()!=null){
					contractDetaiInfo.setEffectiveDateStr(new SimpleDateFormat("yyyy-MM-dd").format(contractDetaiInfo.getEffectiveDate()));
				}
				
				if(contractDetaiInfo.getEndDate()!=null){
					contractDetaiInfo.setEndDateStr(new SimpleDateFormat("yyyy-MM-dd").format(contractDetaiInfo.getEndDate()));
				}
			}
		}

		contractDetailInfoPager.setRows(contractDetailInfoList);
		contractDetailInfoPager.setTotal(totalNum);
		model.addAttribute("contractDetailInfoPager", contractDetailInfoPager);
		return "template/contract/contract_detail_info_data";
	}

	/**
	 * 合同明细详细信息查看页
	 * 
	 * @author zhangya 2017年6月18日 下午12:43:50
	 * @param request
	 * @return
	 */
	@RequestMapping("/viewContractDetailInfoPage")
	public String viewContractDetailInfoPage(HttpServletRequest request, Model model) {
		// 获取session信息
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 封装基础参数
		Map<String, Integer> params = new HashMap<String, Integer>();
		params.put("orgRootId", userInfo.getOrgRootId());

		ContractDetailInfo contractDetailInfo = null;
		String operateTitle = "合同明细详情查看";
		if (StringUtils.isNotBlank(request.getParameter("contractDetailInfoId"))) {
			Integer contractDetailInfoId = Integer.valueOf(request.getParameter("contractDetailInfoId").toString());
			params.put("contractDetailInfoId", contractDetailInfoId);
			contractDetailInfo = contractDetailInfoFacade.getContractDetailInfoById(params);
		}
		model.addAttribute("contractDetailInfo", contractDetailInfo);
		model.addAttribute("operateTitle", operateTitle);
		return "template/contract/view_contract_detail_info_page";
	}

	/**
	 * 待转包合同信息查询
	 * 
	 * @author zhangya 2017年7月24日 下午12:52:03
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/getContractDetailInfoData")
	@ResponseBody
	public List<ContractDetailInfo> getContractDetailInfoData(HttpServletRequest request, Model model) {
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
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
		// 合同主ID
		Integer contractInfoId = null;
		if (params.get("contractInfoId") != null) {
			contractInfoId = Integer.valueOf(params.get("contractInfoId").toString());
		}

		// 查询到被转包的合同编号
		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		ContractInfo contractInfo = null;
		// 封装查询参数
		try {
			Map<String, Integer> paramMap = new HashMap<String, Integer>();
			paramMap.put("contractInfoId", contractInfoId);
			paramMap.put("orgRootId", orgRootId);
			contractInfo = contractInfoFacade.getContractInfoById(paramMap);
		} catch (Exception e) {
			return null;
		}
		// 被转包的合同编号 用于查询待转包的合同明细
		String contractCode = null;
		if (contractInfo != null) {
			contractCode = contractInfo.getSubContractCode();
		} else {
			return null;
		}

		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("contractCode", contractCode);
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		List<ContractDetailInfo> contractDetailInfoList = contractDetailInfoFacade
				.findContractDetailInfoByContractCode(queryMap);
		;
		if (CollectionUtils.isNotEmpty(contractDetailInfoList)) {
			// 查询线路信息
			List<Integer> lineInfoIds = CommonUtils.getValueList(contractDetailInfoList, "lineInfoId");
			List<LineInfoPo> lineInfos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
			// key:线路ID value:线路名称
			Map<Integer, String> lineInfoMap = null;
			if (CollectionUtils.isNotEmpty(lineInfos)) {
				lineInfoMap = CommonUtils.listforMap(lineInfos, "id", "lineName");
			}

			// 查询货物信息
			List<Integer> goodsInfoIds = CommonUtils.getValueList(contractDetailInfoList, "goodsInfoId");
			List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
			// key:线路ID value:线路名称
			Map<Integer, String> goodsInfoMap = null;
			if (CollectionUtils.isNotEmpty(goodsInfos)) {
				goodsInfoMap = CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}

			for (ContractDetailInfo contractDetaiInfo : contractDetailInfoList) {
				// 封装线路
				if (MapUtils.isNotEmpty(lineInfoMap) && lineInfoMap.get(contractDetaiInfo.getLineInfoId()) != null) {
					contractDetaiInfo.setLineName(lineInfoMap.get(contractDetaiInfo.getLineInfoId()));
				}

				// 封装货物
				if (MapUtils.isNotEmpty(goodsInfoMap) && goodsInfoMap.get(contractDetaiInfo.getGoodsInfoId()) != null) {
					contractDetaiInfo.setGoodsName(goodsInfoMap.get(contractDetaiInfo.getGoodsInfoId()));
				}
			}
		}

		return contractDetailInfoList;
	}

	/**
	 * 带转包合同明细数量查询
	 * 
	 * @author zhangya 2017年7月24日 下午12:51:53
	 * @param request
	 * @return
	 */
	@RequestMapping("/getContractDetailInfoCount")
	@ResponseBody
	public Integer getContractDetailInfoCount(HttpServletRequest request) {
		Map<String, Object> params = this.paramsToMap(request);
		// 合同主ID
		Integer contractInfoId = null;
		if (params.get("contractInfoId") != null) {
			contractInfoId = Integer.valueOf(params.get("contractInfoId").toString());
		}
		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		ContractInfo contractInfo = null;
		// 封装查询参数
		try {
			Map<String, Integer> paramMap = new HashMap<String, Integer>();
			paramMap.put("contractInfoId", contractInfoId);
			paramMap.put("orgRootId", orgRootId);
			contractInfo = contractInfoFacade.getContractInfoById(paramMap);
		} catch (Exception e) {
			return null;
		}
		// 被转包的合同编号 用于查询待转包的合同明细
		String contractCode = null;
		if (contractInfo != null) {
			contractCode = contractInfo.getContractCode();
		} else {
			return null;
		}

		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("contractCode", contractCode);
		return contractDetailInfoFacade.countContractDetailInfoByContractCode(queryMap);
	}

	/**
	 * 合同明细查询页面
	 * 
	 * @author zhangya 2017年6月16日 上午11:15:44
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/showSubContractDetailInfoPage", produces = "application/json; charset=utf-8")
	public String showSubContractDetailInfoPage(HttpServletRequest request, Model model) {

		if (StringUtils.isBlank(request.getParameter("contractInfoId"))) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "合同信息不存在，无法进行明细操作！");
			model.addAttribute("content", jo);
			return "template/org/prompt_box_page";
		}
		Integer contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		model.addAttribute("contractInfoId", contractInfoId);
		return "template/contract/show_sub_contract_detail_info_page";
	}

	/**
	 * 保存转包合同明细
	 * 
	 * @author zhangya 2017年7月24日 下午6:08:07
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/addSubContractDetailInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addSubContractDetailInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();

		// 被转包的合同明细ID
		List<Integer> contractDetailInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("contractDetailInfoIds"))) {
			String contractDetailInfoIds = request.getParameter("contractDetailInfoIds").trim();
			String[] idArray = contractDetailInfoIds.split(",");
			if (idArray.length > 0) {
				for (String id : idArray) {
					if (StringUtils.isNotBlank(id)) {
						contractDetailInfoIdList.add(Integer.valueOf(id.trim()));
					}
				}
			}
		}

		// 所选合同明细ID不能为空
		if (CollectionUtils.isEmpty(contractDetailInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选合同明细不能为空！");
			return jo;
		}
		// 主合同ID不能为空
		if (StringUtils.isBlank(request.getParameter("contractInfoId"))) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "主合同信息不存在！");
			return jo;
		}
		Integer contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		try {
			jo = contractDetailInfoFacade.addSubContractDetailInfo(contractDetailInfoIdList, contractInfoId, orgRootId,
					orgInfoId, userInfoId);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "添加明细异常!");
		}
		return jo;
	}

	
	/** 
	* @方法名: addBiddingDetailToContractDetailInfo 
	* @作者: zhangshuai
	* @时间: 2017年9月18日 上午10:56:15
	* @返回值类型: JSONObject 
	* @throws 
	* 新增合同明细时，选择新增招标明细信息
	*/
	@RequestMapping(value="/addBiddingDetailToContractDetailInfo",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addBiddingDetailToContractDetailInfo(HttpServletRequest request,HttpServletResponse response){
		
		JSONObject jo=new JSONObject();
		
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userInfoId = userInfo.getId();
		
		//接受参数
		Integer contractId=null;
		if(request.getParameter("contractId")!=null){
			contractId=Integer.parseInt(request.getParameter("contractId"));
		}
		Integer myBidId=null;
		if(request.getParameter("myBidId")!=null){
			myBidId=Integer.parseInt(request.getParameter("myBidId"));
		}
		
		jo=contractDetailInfoFacade.addBiddingDetailToContractDetailInfo(contractId,myBidId,rootOrgInfoId,orgInfoId,userInfoId);
		
		return jo;
		
	}
	
}
