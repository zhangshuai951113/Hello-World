package com.xz.logistics.controller;

import java.io.OutputStream;
import java.lang.ref.ReferenceQueue;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.common.utils.poi.POIExcelUtil;
import com.xz.facade.api.AccountCheckInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.SettlementInfoFacade;
import com.xz.facade.api.UserDataAuthFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.facade.api.WaybillInfoFacade;
import com.xz.logistics.utils.CodeAutoGenerater;
import com.xz.model.po.AccountCheckDetailInfo;
import com.xz.model.po.AccountCheckInfo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.LocationInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.SettlementInfo;
import com.xz.model.po.UserDataAuthPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.AccountCheckInfoModel;
import com.xz.rpc.service.AccountCheckDetailInfoService;

import scala.xml.dtd.PublicID;

/**
 * 对账信息信息管理
 * 
 * @author zhangya 2017年7月4日 下午12:55:34
 *
 */
@Controller
@RequestMapping("/accountCheckInfo")
public class AccountCheckController extends BaseController {
	// 日志
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private AccountCheckInfoFacade accountCheckInfoFacade;

	@Resource
	private UserInfoFacade userInfoFacade;

	@Resource
	private SettlementInfoFacade settlementInfoFacade;

	@Resource
	private OrgInfoFacade orgInfoFacade;

	@Resource
	private GoodsInfoFacade goodsInfoFacade;

	@Resource
	private LineInfoFacade lineInfoFacade;

	@Resource
	private AccountCheckDetailInfoService accountCheckDetailInfoService;
	
	@Resource
	private WaybillInfoFacade waybillInfoFacade;
	
	@Resource
	private LocationInfoFacade locationInfoFacade;
	
	@Resource
	private UserDataAuthFacade userDataAuthFacade;
	
	/**
	 * 对账信息编辑页
	 * 
	 * @author zhangya 2017年7月4日 下午12:58:11
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/editAccountCheckInfoPage")
	public String editAccountCheckInfoPage(HttpServletRequest request, HttpSession session, Model model) {
		// 从session中获取用户信息
		UserInfo userInfo = (UserInfo) session.getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		AccountCheckInfo accountCheckInfo = null;
		if (StringUtils.isBlank(request.getParameter("accountCheckInfoId"))) {
			// 生成对账单编号 DZ+日期+四位序列号
			//String accountCheckId = CodeAutoGenerater.generaterAccountCheckId();
			String accountCheckId = accountCheckInfoFacade.getNewAccountCheckIdFa();
			accountCheckInfo = new AccountCheckInfo();
			accountCheckInfo.setAccountCheckId(accountCheckId);
		} else {
			Integer accountCheckInfoId = Integer.valueOf(request.getParameter("accountCheckInfoId"));
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("accountCheckInfoId", accountCheckInfoId);
			params.put("orgRootId", orgRootId);
			accountCheckInfo = accountCheckInfoFacade.getAccountCheckInfoById(params);
		}
		model.addAttribute("accountCheckInfo", accountCheckInfo);
		return "template/accountCheck/edit_account_check_info_page";
	}

	/**
	 * 对账信息查询页
	 * 
	 * @author zhangya 2017年7月4日 下午12:58:59
	 * @param request
	 * @param
	 * @return
	 */
	@RequiresPermissions("settle:reconciliation:view")
	@RequestMapping(value = "/showAccountCheckInfoPage", produces = "application/json; charset=utf-8")
	public String showAccountCheckInfoPage(HttpServletRequest request) {
		return "template/accountCheck/show_account_check_info_page";
	}
	
	/**
	 * @author zhangshuai  2017年9月8日 上午11:37:01
	 * @return
	 * 进入接收对账信息页面
	 */
	@RequestMapping(value="/showReceiveReconciliationInformation",produces="application/json;charset=utf-8")
	public String goReceiveReconciliationInformation(){
		return "template/accountCheck/receive_reconciliation_information";
	}
	
	/**
	 * 对账信息列表
	 * 
	 * @author zhangya 2017年7月4日 下午12:58:59
	 * @param request
	 * @param
	 * @return
	 */
	@RequestMapping(value = "/listAccountCheckInfo", produces = "application/json; charset=utf-8")
	public String listAccountCheckInfo(HttpServletRequest request, Model model) {
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		DataPager<AccountCheckInfo> accountCheckInfoPager = new DataPager<AccountCheckInfo>();
		
		String confirmPrice=request.getParameter("confirmPrice");
		String confirmForwardingTonnage=request.getParameter("confirmForwardingTonnage");
		String confirmArriveTonnage=request.getParameter("confirmArriveTonnage");
		String confirmLossTonnage=request.getParameter("confirmLossTonnage");
		String confirmOutCar=request.getParameter("confirmOutCar");
		String lossDifference=request.getParameter("lossDifference");
		String otherDifference=request.getParameter("otherDifference");
		String differenceIncome=request.getParameter("differenceIncome");
		String confirmUser=request.getParameter("confirmUser");
		String confiirmTimeStart=request.getParameter("confiirmTimeStart");
		String confiirmTimeEnd=request.getParameter("confiirmTimeEnd");
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 2、同时封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		accountCheckInfoPager.setPage(page);
		
		queryMap.put("confirmPrice", confirmPrice);
		queryMap.put("confirmForwardingTonnage", confirmForwardingTonnage);
		queryMap.put("confirmArriveTonnage", confirmArriveTonnage);
		queryMap.put("confirmLossTonnage", confirmLossTonnage);
		queryMap.put("confirmOutCar", confirmOutCar);
		queryMap.put("lossDifference", lossDifference);
		queryMap.put("otherDifference", otherDifference);
		queryMap.put("differenceIncome", differenceIncome);
		queryMap.put("confirmUser", confirmUser);
		queryMap.put("confiirmTimeStart", confiirmTimeStart);
		queryMap.put("confiirmTimeEnd", confiirmTimeEnd);
		
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		accountCheckInfoPager.setSize(rows);

		// 对账单编号
		if (params.get("accountCheckId") != null) {
			Integer accountCheckId = Integer.valueOf(params.get("accountCheckId").toString());
			queryMap.put("accountCheckId", accountCheckId);
		}
		// 制单时间（起始）
		if (params.get("makeTimeStart") != null) {
			String makeTimeStart = params.get("makeTimeStart").toString();
			queryMap.put("makeTimeStart", makeTimeStart);
		}
		// 制单时间（截止）
		if (params.get("makeTimeEnd") != null) {
			String makeTimeEnd = params.get("makeTimeEnd").toString();
			queryMap.put("makeTimeEnd", makeTimeEnd);
		}
		// 对账单状态
		if (params.get("accountCheckStatus") != null) {
			Integer accountCheckStatus = Integer.valueOf(params.get("accountCheckStatus").toString());
			queryMap.put("accountCheckStatus", accountCheckStatus);
		}

		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", rootOrgInfoId);
		// 3、查询对账单信息总数
		Integer totalNum = accountCheckInfoFacade.countAccountCheckInfoForPage(queryMap);

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
			}

		}

		// 7、总数、分页信息封装
		accountCheckInfoPager.setTotal(totalNum);
		accountCheckInfoPager.setRows(accountCheckInfoList);
		model.addAttribute("accountCheckInfoPager", accountCheckInfoPager);

		return "template/accountCheck/list_account_check_info_data";
	}

	/**
	 * 保存对账信息（新增、修改）
	 * 
	 * @author zhangya 2017年7月7日 下午6:27:48
	 * @return
	 */
	@RequestMapping(value="/saveAccountInfo",method=RequestMethod.POST)
	@ResponseBody
	public JSONObject saveAccountInfo(HttpServletRequest request, AccountCheckInfoModel accountCheckInfoModel) {

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		
		JSONObject jo = null;
		if (accountCheckInfoModel == null) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "对账信息不存在！");
			return jo;
		}
		try {
			jo = accountCheckInfoFacade.saveAccountCheckInfo(userInfoId, orgRootId, accountCheckInfoModel);
			// 如果编号重复重新生成
			if (jo.getInteger("flag") == 1) {
				//String accountCheckId = CodeAutoGenerater.generaterAccountCheckId();
				String accountCheckId = accountCheckInfoFacade.getNewAccountCheckIdFa();
				jo.put("accountCheckId", accountCheckId);
			}
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "保存对账信息异常！");
		}
		return jo;
	}

	/**
	 * 结算单信息列表分页（状态为审批通过 用于对账）
	 * 
	 * @author zhangya 2017年7月4日 下午12:58:59
	 * @param request
	 * @param
	 * @return
	 */
	@RequestMapping(value = "/listSettlementInfo", produces = "application/json; charset=utf-8")
	public String listSettlementInfo(HttpServletRequest request, Model model) {
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		DataPager<SettlementInfo> settlementInfoPager = new DataPager<SettlementInfo>();
		String settlementId = request.getParameter("settlementId");
		String waybillId=request.getParameter("waybillId");
		String shipperName=request.getParameter("shipperName");
		
		String carCode=request.getParameter("carCode");
		String goodsName=request.getParameter("goodsName");
		String forwardingUnit=request.getParameter("forwardingUnit");
		String consignee=request.getParameter("consignee");
		String entrustName=request.getParameter("entrustName");
		String createTimeStart = request.getParameter("createTimeStart");
		String createTimeEnd = request.getParameter("createTimeEnd");
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 2、同时封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
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

		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", rootOrgInfoId);
		queryMap.put("settlementId", settlementId);
		queryMap.put("waybillId", waybillId);
		queryMap.put("shipperName", shipperName);
		queryMap.put("carCode", carCode);
		queryMap.put("goodsName", goodsName);
		queryMap.put("forwardingUnit", forwardingUnit);
		queryMap.put("consignee", consignee);
		queryMap.put("entrustName", entrustName);
		queryMap.put("createTimeStart", createTimeStart);
		queryMap.put("createTimeEnd", createTimeEnd);
		queryMap.put("isAccount", 0);
		queryMap.put("isInvoice", 0);
		
		// 3、查询结算单信息总数
		Integer totalNum = settlementInfoFacade.countSettlementInfoForPage(queryMap);

		// 4、分页查询结算单信息
		List<SettlementInfo> settlementInfoList = settlementInfoFacade.findSettlementInfoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(settlementInfoList)) {
			// 5、查询委托方
			List<Integer> entrustIds = CommonUtils.getValueList(settlementInfoList, "entrust");
			// key:组织ID value:组织名称 名称存放的map
			Map<Integer, String> entrustMap = null;
			if (CollectionUtils.isNotEmpty(entrustIds)) {
				List<OrgInfoPo> entrusts = orgInfoFacade.findOrgNameByIds(entrustIds);
				if (CollectionUtils.isNotEmpty(entrusts)) {
					entrustMap = CommonUtils.listforMap(entrusts, "id", "orgName");
				}
			}
			// 6、查询承运方
			List<Integer> shipperIds = CommonUtils.getValueList(settlementInfoList, "shipper");
			// key:组织ID value:组织名称 名称存放的map
			Map<Integer, String> shipperMap = null;
			if (CollectionUtils.isNotEmpty(shipperIds)) {
				List<OrgInfoPo> shippers = orgInfoFacade.findOrgNameByIds(shipperIds);
				if (CollectionUtils.isNotEmpty(shippers)) {
					shipperMap = CommonUtils.listforMap(shippers, "id", "orgName");
				}
			}
			// 7、查询货物
			List<Integer> goodsInfoIds = CommonUtils.getValueList(settlementInfoList, "goodsInfoId");
			// key:组织ID value:组织名称 名称存放的map
			Map<Integer, String> goodstMap = null;
			if (CollectionUtils.isNotEmpty(goodsInfoIds)) {
				List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
				if (CollectionUtils.isNotEmpty(goodsInfos)) {
					goodstMap = CommonUtils.listforMap(goodsInfos, "id", "goodsName");
				}
			}
			// 8、查询线路
			List<Integer> lineInfoIds = CommonUtils.getValueList(settlementInfoList, "lineInfoId");
			// key:组织ID value:组织名称 名称存放的map
			Map<Integer, String> lineMap = null;
			if (CollectionUtils.isNotEmpty(lineInfoIds)) {
				List<LineInfoPo> lineInfos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
				if (CollectionUtils.isNotEmpty(lineInfos)) {
					lineMap = CommonUtils.listforMap(lineInfos, "id", "lineName");
				}
			}
			for (SettlementInfo settlementInfo : settlementInfoList) {
				// 封装委托方
				if (MapUtils.isNotEmpty(entrustMap) && entrustMap.get(settlementInfo.getEntrust()) != null) {
					settlementInfo.setEntrustName(entrustMap.get(settlementInfo.getEntrust()));
				}
				// 封装承运方
				if (MapUtils.isNotEmpty(shipperMap) && shipperMap.get(settlementInfo.getShipper()) != null) {
					settlementInfo.setShipperName(shipperMap.get(settlementInfo.getShipper()));
				}
				// 线路名称
				if (MapUtils.isNotEmpty(lineMap) && lineMap.get(settlementInfo.getLineInfoId()) != null) {
					settlementInfo.setLineName(lineMap.get(settlementInfo.getLineInfoId()));
				}
				// 货物名称
				if (MapUtils.isNotEmpty(goodstMap) && goodstMap.get(settlementInfo.getGoodsInfoId()) != null) {
					settlementInfo.setGoodsName(goodstMap.get(settlementInfo.getGoodsInfoId()));
				}
			}

		}

		// 7、总数、分页信息封装
		settlementInfoPager.setTotal(totalNum);
		settlementInfoPager.setRows(settlementInfoList);
		model.addAttribute("settlementInfoPager", settlementInfoPager);

		return "template/accountCheck/list_settlement_info_data";
	}

	/**
	 * 操作对账单信息(修改校验、提交审核、审核校验、删除)
	 * 
	 * @author zhangya 2017年7月11日 上午10:32:22
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/operateAccountCheckInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateDriverWaybillInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgRootId = userInfo.getOrgRootId();

		// 被操作的对账单ID
		List<Integer> accountCheckInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("accountCheckInfoIds"))) {
			String accountCheckInfoIds = request.getParameter("accountCheckInfoIds").trim();
			String[] accountCheckArray = accountCheckInfoIds.split(",");
			if (accountCheckArray.length > 0) {
				for (String accountCheckIdStr : accountCheckArray) {
					if (StringUtils.isNotBlank(accountCheckIdStr)) {
						accountCheckInfoIdList.add(Integer.valueOf(accountCheckIdStr.trim()));
					}
				}
			}
		}

		// 所选对账单不能为空
		if (CollectionUtils.isEmpty(accountCheckInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选对账单不能为空！");
			return jo;
		}

		// 校验操作类型
		if (StringUtils.isBlank(request.getParameter("operateType"))) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "当前操作无效!");
			return jo;
		}
		Integer operateType = Integer.valueOf(request.getParameter("operateType"));
		try {
			return accountCheckInfoFacade.operateAccountCheckInfo(userInfoId, orgRootId, accountCheckInfoIdList,
					operateType);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "当前操作异常!");
			return jo;
		}
	}

	/**
	 * 查询对账单明细数据
	 * 
	 * @author zhangya 2017年7月11日 下午4:54:32
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/getAccountCheckDetailData", produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<AccountCheckDetailInfo> getAccountCheckDetailData(HttpServletRequest request) {
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 2、同时封装参数
		Map<String, Integer> queryMap = new HashMap<String, Integer>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}

		// 对账单主ID
		Integer accountCheckInfoId = null;
		if (params.get("accountCheckInfoId") != null) {
			accountCheckInfoId = Integer.valueOf(params.get("accountCheckInfoId").toString());
		}

		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", rootOrgInfoId);
		queryMap.put("accountCheckInfoId", accountCheckInfoId);
		// 3、分页查询结算单信息
		//TODO
		List<AccountCheckDetailInfo> accountCheckDetailInfoList = accountCheckInfoFacade
				.getAccountCheckDetailData(queryMap);

		if (CollectionUtils.isNotEmpty(accountCheckDetailInfoList)) {
			// 5、查询委托方
			List<Integer> entrustIds = CommonUtils.getValueList(accountCheckDetailInfoList, "entrust");
			// key:组织ID value:组织名称 名称存放的map
			Map<Integer, String> entrustMap = null;
			if (CollectionUtils.isNotEmpty(entrustIds)) {
				List<OrgInfoPo> entrusts = orgInfoFacade.findOrgNameByIds(entrustIds);
				if (CollectionUtils.isNotEmpty(entrusts)) {
					entrustMap = CommonUtils.listforMap(entrusts, "id", "orgName");
				}
			}

			// 6、查询承运方
			List<Integer> shipperIds = CommonUtils.getValueList(accountCheckDetailInfoList, "shipper");
			// key:组织ID value:组织名称 名称存放的map
			Map<Integer, String> shipperMap = null;
			if (CollectionUtils.isNotEmpty(shipperIds)) {
				List<OrgInfoPo> shippers = orgInfoFacade.findOrgNameByIds(shipperIds);
				if (CollectionUtils.isNotEmpty(shippers)) {
					shipperMap = CommonUtils.listforMap(shippers, "id", "orgName");
				}
			}
			// 7、查询货物
			List<Integer> goodsInfoIds = CommonUtils.getValueList(accountCheckDetailInfoList, "goodsInfoId");
			// key:组织ID value:组织名称 名称存放的map
			Map<Integer, String> goodstMap = null;
			if (CollectionUtils.isNotEmpty(goodsInfoIds)) {
				List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);

				if (CollectionUtils.isNotEmpty(goodsInfos)) {
					goodstMap = CommonUtils.listforMap(goodsInfos, "id", "goodsName");
				}
			}

			// 8、查询线路
			List<Integer> lineInfoIds = CommonUtils.getValueList(accountCheckDetailInfoList, "lineInfoId");
			// key:组织ID value:组织名称 名称存放的map
			Map<Integer, String> lineMap = null;
			if (CollectionUtils.isNotEmpty(lineInfoIds)) {
				List<LineInfoPo> lineInfos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
				if (CollectionUtils.isNotEmpty(lineInfos)) {
					lineMap = CommonUtils.listforMap(lineInfos, "id", "lineName");
				}
			}
			for (AccountCheckDetailInfo accountCheckDetailInfo : accountCheckDetailInfoList) {
				// 封装委托方
				if (MapUtils.isNotEmpty(entrustMap) && entrustMap.get(accountCheckDetailInfo.getEntrust()) != null) {
					accountCheckDetailInfo.setEntrustName(entrustMap.get(accountCheckDetailInfo.getEntrust()));
				}
				// 封装承运方
				if (MapUtils.isNotEmpty(shipperMap) && shipperMap.get(accountCheckDetailInfo.getShipper()) != null) {
					accountCheckDetailInfo.setShipperName(shipperMap.get(accountCheckDetailInfo.getShipper()));
				}
				// 线路名称
				if (MapUtils.isNotEmpty(lineMap) && lineMap.get(accountCheckDetailInfo.getLineInfoId()) != null) {
					accountCheckDetailInfo.setLineName(lineMap.get(accountCheckDetailInfo.getLineInfoId()));
				}
				// 货物名称
				if (MapUtils.isNotEmpty(goodstMap) && goodstMap.get(accountCheckDetailInfo.getGoodsInfoId()) != null) {
					accountCheckDetailInfo.setGoodsName(goodstMap.get(accountCheckDetailInfo.getGoodsInfoId()));
				}
			}

		}
		return accountCheckDetailInfoList;
	}

	/**
	 * 查询对账单明细数据数量
	 * 
	 * @author zhangya 2017年7月11日 下午4:54:32
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/getAccountCheckDetailCount", produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getAccountCheckDetailCount(HttpServletRequest request) {
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		if (StringUtils.isBlank(request.getParameter("accountCheckInfoId"))) {
			return 0;
		}
		Integer accountCheckInfoId = Integer.valueOf(request.getParameter("accountCheckInfoId"));
		// 封装查询参数
		Map<String, Integer> queryMap = new HashMap<String, Integer>();
		// 主机构ID
		queryMap.put("orgRootId", rootOrgInfoId);
		// 主单ID
		queryMap.put("accountCheckInfoId", accountCheckInfoId);
		// 查询结算单信息总数
		return accountCheckInfoFacade.getAccountCheckDetailCount(queryMap);
	};

	/**
	 * 对账单信息审核
	 * 
	 * @author zhangya 2017年7月11日 下午7:02:43
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/auditAccountCheckInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject auditAccountCheckInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgRootId = userInfo.getOrgRootId();

		// 被操作的对账单ID
		List<Integer> accountCheckInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("accountCheckInfoIds"))) {
			String accountCheckInfoIds = request.getParameter("accountCheckInfoIds").trim();
			String[] accountCheckArray = accountCheckInfoIds.split(",");
			if (accountCheckArray.length > 0) {
				for (String accountCheckIdStr : accountCheckArray) {
					if (StringUtils.isNotBlank(accountCheckIdStr)) {
						accountCheckInfoIdList.add(Integer.valueOf(accountCheckIdStr.trim()));
					}
				}
			}
		}

		// 所选对账单不能为空
		if (CollectionUtils.isEmpty(accountCheckInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选对账单不能为空！");
			return jo;
		}

		// 校验审核结果
		if (StringUtils.isBlank(request.getParameter("result"))) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "当前操作无效!");
			return jo;
		}
		Integer result = Integer.valueOf(request.getParameter("result"));
		// 审核意见
		String opinion = request.getParameter("opinion");
		try {
			return accountCheckInfoFacade.auditAccountCheckInfo(userInfoId, orgRootId, accountCheckInfoIdList, result,
					opinion);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "当前操作异常!");
			return jo;
		}
	}
	/**
	 * 对账单明细Excel导入
	 * 
	 * @author zhangya 2017年7月12日 上午11:42:58
	 * @param myfile
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/importAccountCheckDetail", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject importAccountCheckDetail(MultipartFile myfile, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		JSONObject jo = new JSONObject();

		if (StringUtils.isBlank(request.getParameter("accountCheckInfoId"))) {
			jo.put("success", false);
			jo.put("msg", "所选对账单不存在！");
			return jo;
		}
		Integer accountCheckInfoId = Integer.valueOf(request.getParameter("accountCheckInfoId"));
		// 获取session中的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		// 获取后缀名
		String fileName = myfile.getOriginalFilename();

		// 校验文件是否满足需求
		if (myfile.isEmpty()) {
			throw new Exception("请选择文件后上传");
		} else {
			if (myfile.getSize() > 1048576) {
				throw new Exception("文件长度过大，请上传1M以内文件");
			}
		}

		// 获取Excel文件地址并导入
		String[] keyStr = { "id", "entrust", "shipper", "waybill_id", "car_code", "goods_info_id", "scattered_goods",
				"line_info_id", "forwarding_unit", "consignee", "customer_price", "payable_price",
				"proxy_invoice_total" };
		List<Map<String, Object>> datailList = POIExcelUtil.read(myfile, fileName, keyStr, 2);

		// 导入记录不能超过一千条，超过则提示
		if (datailList.size() > 1000) {
			jo.put("success", false);
			jo.put("msg", "上传文件记录不能超过1000条");
			return jo;
		}

		if (CollectionUtils.isNotEmpty(datailList)) {

			try {
				List<Integer> settlementInfoIdList = CommonUtils.getValueList(datailList, "id");
				return accountCheckInfoFacade.importAccountCheckDetailInfo(userInfoId, orgRootId, settlementInfoIdList,
						accountCheckInfoId);
			} catch (Exception e) {
				e.printStackTrace();
				jo.put("success", false);
				jo.put("msg", "对账单明细导入异常！");
				return jo;
			}
		} else {
			jo.put("success", false);
			jo.put("msg", "请导入有效的对账单明细！");
			return jo;
		}
	}

	/**
	 * 
	 * @author zhangya 2017年7月12日 下午5:33:53
	 * @return
	 */
	@RequestMapping(value = "/deleteAccountCheckDetailInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteAccountCheckDetailInfo(HttpServletRequest request) {

		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();

		// 被操作的对账单ID
		List<Integer> accountCheckDetailInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("accountCheckDetailInfoIds"))) {
			String accountCheckDetailInfoIds = request.getParameter("accountCheckDetailInfoIds").trim();
			String[] accountCheckDetailArray = accountCheckDetailInfoIds.split(",");
			if (accountCheckDetailArray.length > 0) {
				for (String accountCheckDetailIdStr : accountCheckDetailArray) {
					if (StringUtils.isNotBlank(accountCheckDetailIdStr)) {
						accountCheckDetailInfoIdList.add(Integer.valueOf(accountCheckDetailIdStr.trim()));
					}
				}
			}
		}

		// 所选对账单明细不能为空
		if (CollectionUtils.isEmpty(accountCheckDetailInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选对账单明细不能为空！");
			return jo;
		}

		try {
			return accountCheckInfoFacade.deleteAccountCheckDetailInfo(orgRootId, accountCheckDetailInfoIdList);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "当前操作异常!");
			return jo;
		}

	}
	
	/**
	 * @Title: showAccountCheckReportPage  
	 * @Description: 显示对账报表
	 * @author zhenghaiyang
	 * @return String    返回类型  
	 * @throws
	 */
	@RequestMapping("/showAccountCheckReportPage")
	public String showAccountCheckReportPage(){
		return "template/reportForm/account_check/account_check_report";
	}
	/**
	 * 
	 * @Title: getAccountCheckInfoListByParams  
	 * @Description: 获取对账信息
	 * @author zhenghaiyang
	 * @param request
	 * @throws Exception    
	 * @return JSONObject  
	 * @throws
	 */
	@RequestMapping("/getAccountCheckDataForReport")
	@ResponseBody
	public JSONObject getAccountCheckDataForReport(HttpServletRequest request) throws Exception{
		JSONObject jo = new JSONObject();
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 年份
		String year = null;
		if (StringUtils.isNotBlank(request.getParameter("year"))) {
			year = request.getParameter("year");
		} else {
			year = String.valueOf(Calendar.getInstance().get(Calendar.YEAR));
		}
		
		// 封装参数
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("orgRootId", orgRootId);
		params.put("year",year);
		
		try {
			JSONObject dataJson = accountCheckInfoFacade.getDataForReport(params);
			jo.put("success", true);
			jo.put("data", dataJson);
		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", "查询对账信息异常");
			e.printStackTrace();
		}
		return jo;
	}
	
	
	/** 
	* @方法名: findShipperName 
	* @作者: zhangshuai
	* @时间: 2017年9月8日 下午5:27:53
	* @返回值类型: JSONObject 
	* @throws 
	*/
	@RequestMapping(value="/findShipperName",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findShipperName(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		// 被操作的结算单ID
		List<Integer> accountCheckDetailInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("selectedIds"))) {
			String accountCheckDetailInfoIds = request.getParameter("selectedIds").trim();
			String[] accountCheckDetailArray = accountCheckDetailInfoIds.split(",");
			if (accountCheckDetailArray.length > 0) {
				for (String accountCheckDetailIdStr : accountCheckDetailArray) {
					if (StringUtils.isNotBlank(accountCheckDetailIdStr)) {
						accountCheckDetailInfoIdList.add(Integer.valueOf(accountCheckDetailIdStr.trim()));
					}
				}
			}
		}
		
		if(CollectionUtils.isNotEmpty(accountCheckDetailInfoIdList)){
			//循环判断选择的结算单的承运方是否一样
			List<SettlementInfo> settlementInfos = settlementInfoFacade.findSettlementInfoByIds(accountCheckDetailInfoIdList);
			if(CollectionUtils.isNotEmpty(settlementInfos)){
				Set<Integer> aIntegers=new HashSet<Integer>();
				for (SettlementInfo sett : settlementInfos) {
					aIntegers.add(sett.getShipper());
				}
				if(aIntegers.size()==1){
					jo.put("success", true);
				}else if(aIntegers.size()>1){
					jo.put("success", false);
					jo.put("msg", "请选择相同承运方的结算单数据!");
				}
			}
		}
		return jo;
	}
	
	/** 
	* @方法名: findAccountMationList 
	* @作者: zhangshuai
	* @时间: 2017年9月11日 下午3:55:28
	* @返回值类型: List<AccountCheckInfo> 
	* @throws 
	* 接受对账单时匹配承运方
	*/
	@RequestMapping(value="/findAccountMationList")
	@ResponseBody
	public List<AccountCheckInfo> findAccountMationList(HttpServletRequest request,HttpServletResponse response){
		
		List<AccountCheckInfo> accountCheckInfos=new ArrayList<AccountCheckInfo>();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		Integer orgInfoId=userInfo.getOrgInfoId();//组织机构ID
		
		//获取模糊条件
		String accountCheckId=request.getParameter("accountCheckId");
		String accountCheckStatus=request.getParameter("accountCheckStatus");
		String makeTimeStart=request.getParameter("makeTimeStart");
		String makeTimeEnd=request.getParameter("makeTimeEnd");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		String confirmPrice=request.getParameter("confirmPrice");
		String confirmForwardingTonnage=request.getParameter("confirmForwardingTonnage");
		String confirmArriveTonnage=request.getParameter("confirmArriveTonnage");
		String confirmLossTonnage=request.getParameter("confirmLossTonnage");
		String confirmOutCar=request.getParameter("confirmOutCar");
		String lossDifference=request.getParameter("lossDifference");
		String otherDifference=request.getParameter("otherDifference");
		String differenceIncome=request.getParameter("differenceIncome");
		String confirmUser=request.getParameter("confirmUser");
		String confiirmTimeStart=request.getParameter("confiirmTimeStart");
		String confiirmTimeEnd=request.getParameter("confiirmTimeEnd");
		//根据登录用户组织机构ID匹配承运方数据、查询结算信息
		List<SettlementInfo> settlementInfos=settlementInfoFacade.findSettMationByShipper(orgInfoId);
		
		if(CollectionUtils.isNotEmpty(settlementInfos)){
			List<Integer> settIds=new ArrayList<Integer>();
			for (SettlementInfo sett : settlementInfos) {
				settIds.add(sett.getId());
			}
			
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("list", settIds);
			
			//根据结算ID查询对账明细信息获取到对账主信息ID
			List<AccountCheckDetailInfo> accountCheckDetailInfos=accountCheckDetailInfoService.findAccountCheckDetailInfoBySettIds(params);
			if(CollectionUtils.isNotEmpty(accountCheckDetailInfos)){
				List<Integer> accIds=new ArrayList<Integer>();
				for (AccountCheckDetailInfo accdes : accountCheckDetailInfos) {
					accIds.add(accdes.getAccountCheckId());
				}
				Map<String, Object> queryMap=new HashMap<String,Object>();
				queryMap.put("list", accIds);
				queryMap.put("accountCheckId", accountCheckId);
				queryMap.put("accountCheckStatus1", accountCheckStatus);
				queryMap.put("makeTimeStart", makeTimeStart);
				queryMap.put("makeTimeEnd", makeTimeEnd);
				queryMap.put("start", start);
				queryMap.put("rows", rows);
				queryMap.put("confirmPrice", confirmPrice);
				queryMap.put("confirmForwardingTonnage", confirmForwardingTonnage);
				queryMap.put("confirmArriveTonnage", confirmArriveTonnage);
				queryMap.put("confirmLossTonnage", confirmLossTonnage);
				queryMap.put("confirmOutCar", confirmOutCar);
				queryMap.put("lossDifference", lossDifference);
				queryMap.put("otherDifference", otherDifference);
				queryMap.put("differenceIncome", differenceIncome);
				queryMap.put("confirmUser", confirmUser);
				queryMap.put("confiirmTimeStart", confiirmTimeStart);
				queryMap.put("confiirmTimeEnd", confiirmTimeEnd);
				//根据对账ID批量查询对账信息
				accountCheckInfos = accountCheckInfoFacade.findAccountCheckInfoForPage(queryMap);
				if(CollectionUtils.isNotEmpty(accountCheckInfos)){
					
					//封装制单人
					List<Integer> userIds=CommonUtils.getValueList(accountCheckInfos, "makeUser");
					//key:用户id  value:用户名
					Map<Integer, String> userMap=new HashMap<Integer, String>();
					if(CollectionUtils.isNotEmpty(userIds)){
						List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userIds);
						if(CollectionUtils.isNotEmpty(userInfos)){
							userMap=CommonUtils.listforMap(userInfos, "id", "userName");
						}
					}
					for (AccountCheckInfo acc : accountCheckInfos) {
						//封装制单人
						if(MapUtils.isNotEmpty(userMap)&&userMap.get(acc.getMakeUser())!=null){
							acc.setMakeUserName(userMap.get(acc.getMakeUser()));
						}
						//封装制单时间
						if(acc.getMakeTime()!=null){
							acc.setMakeTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(acc.getMakeTime()));
						}
					}
				}
			}
			
		}
		return accountCheckInfos;
		
	}
	
	/** 
	* @方法名: getAccountMationListCount 
	* @作者: zhangshuai
	* @时间: 2017年9月11日 下午6:10:21
	* @返回值类型: Integer 
	* @throws 
	* 接受对账单时匹配承运方查询数量
	*/
	@RequestMapping(value="/getAccountMationListCount")
	@ResponseBody
	public Integer getAccountMationListCount(HttpServletRequest request,HttpServletResponse response){

		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		Integer orgInfoId=userInfo.getOrgInfoId();//组织机构ID
		//获取模糊条件
		String accountCheckId=request.getParameter("accountCheckId");
		String accountCheckStatus=request.getParameter("accountCheckStatus");
		String makeTimeStart=request.getParameter("makeTimeStart");
		String makeTimeEnd=request.getParameter("makeTimeEnd");
		String confirmPrice=request.getParameter("confirmPrice");
		String confirmForwardingTonnage=request.getParameter("confirmForwardingTonnage");
		String confirmArriveTonnage=request.getParameter("confirmArriveTonnage");
		String confirmLossTonnage=request.getParameter("confirmLossTonnage");
		String confirmOutCar=request.getParameter("confirmOutCar");
		String lossDifference=request.getParameter("lossDifference");
		String otherDifference=request.getParameter("otherDifference");
		String differenceIncome=request.getParameter("differenceIncome");
		String confirmUser=request.getParameter("confirmUser");
		String confiirmTimeStart=request.getParameter("confiirmTimeStart");
		String confiirmTimeEnd=request.getParameter("confiirmTimeEnd");
		//根据登录用户组织机构ID匹配承运方数据、查询结算信息
		List<SettlementInfo> settlementInfos=settlementInfoFacade.findSettMationByShipper(orgInfoId);
		Integer count=null;
		if(CollectionUtils.isNotEmpty(settlementInfos)){
			List<Integer> settIds=new ArrayList<Integer>();
			for (SettlementInfo sett : settlementInfos) {
				settIds.add(sett.getId());
			}
			
			Map<String, Object> params=new HashMap<String,Object>();
			params.put("list", settIds);
			//根据结算ID查询对账明细信息获取到对账主信息ID
			List<AccountCheckDetailInfo> accountCheckDetailInfos=accountCheckDetailInfoService.findAccountCheckDetailInfoBySettIds(params);
			
			if(CollectionUtils.isNotEmpty(accountCheckDetailInfos)){
				List<Integer> accIds=new ArrayList<Integer>();
				for (AccountCheckDetailInfo accdes : accountCheckDetailInfos) {
					accIds.add(accdes.getAccountCheckId());
				}
				Map<String, Object> queryMap=new HashMap<String,Object>();
				queryMap.put("list", accIds);
				queryMap.put("accountCheckId", accountCheckId);
				queryMap.put("accountCheckStatus1", accountCheckStatus);
				queryMap.put("makeTimeStart", makeTimeStart);
				queryMap.put("makeTimeEnd", makeTimeEnd);
				queryMap.put("confirmPrice", confirmPrice);
				queryMap.put("confirmForwardingTonnage", confirmForwardingTonnage);
				queryMap.put("confirmArriveTonnage", confirmArriveTonnage);
				queryMap.put("confirmLossTonnage", confirmLossTonnage);
				queryMap.put("confirmOutCar", confirmOutCar);
				queryMap.put("lossDifference", lossDifference);
				queryMap.put("otherDifference", otherDifference);
				queryMap.put("differenceIncome", differenceIncome);
				queryMap.put("confirmUser", confirmUser);
				queryMap.put("confiirmTimeStart", confiirmTimeStart);
				queryMap.put("confiirmTimeEnd", confiirmTimeEnd);
				//根据对账ID批量查询对账信息
				count = accountCheckInfoFacade.countAccountCheckInfoForPage(queryMap);
				
			}
			
		}
		return count;
	}
	
	/** 
	* @方法名: getAccountMationListCount 
	* @作者: zhangshuai
	* @时间: 2017年9月11日 下午7:07:39
	* @返回值类型: JSONObject 
	* @throws 
	* 确认对账单信息
	*/
	@RequestMapping(value="/updateAccountMationStatus")
	@ResponseBody
	public JSONObject updateAccountMationStatus(HttpServletRequest request,HttpServletResponse response){
		
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		Integer uId=userInfo.getId();
		
		//接受操作对账ID
		List<Integer> accountCheckDetailInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("accIds"))) {
			String accountCheckDetailInfoIds = request.getParameter("accIds").trim();
			String[] accountCheckDetailArray = accountCheckDetailInfoIds.split(",");
			if (accountCheckDetailArray.length > 0) {
				for (String accountCheckDetailIdStr : accountCheckDetailArray) {
					if (StringUtils.isNotBlank(accountCheckDetailIdStr)) {
						accountCheckDetailInfoIdList.add(Integer.valueOf(accountCheckDetailIdStr.trim()));
					}
				}
			}
		}
		
		if(CollectionUtils.isNotEmpty(accountCheckDetailInfoIdList)){
			
			Map<String, Object> queryMap=new HashMap<String,Object>();
			queryMap.put("list", accountCheckDetailInfoIdList);
			//先根据对账ID批量查询对账信息
			List<AccountCheckInfo> accountCheckInfos = accountCheckInfoFacade.findAccountCheckInfoForPage(queryMap);
			if(CollectionUtils.isNotEmpty(accountCheckInfos)){
				
				for (AccountCheckInfo acc : accountCheckInfos) {
					
					//判断对账单状态
					if(acc.getAccountCheckStatus()==5){
						Map<String, Object> params=new HashMap<String,Object>();
						params.put("accountCheckDetailInfoIdList", accountCheckDetailInfoIdList);
						params.put("updateUser", uId);
						params.put("updateTime", Calendar.getInstance().getTime());
						params.put("accountCheckStatus", 6);
						jo=accountCheckInfoFacade.updateAccountCheckStatusByIds(params);
					}else if(acc.getAccountCheckStatus()==6){
						jo.put("success", false);
						jo.put("msg", "该对账信息已被确认!");
					}
					
				}
				
			}
			
		}
		
		return jo;
		
	}
	
	/** 
	* @方法名: findSettAndWayMationByAccId 
	* @作者: zhangshuai
	* @时间: 2017年9月12日 上午11:51:17
	* @返回值类型: List<WaybillInfoPo> 
	* @throws 
	* 根据对账单ID查询运单信息
	*/
	@RequestMapping(value="/findSettAndWayMationByAccId")
	@ResponseBody
	public List<AccountCheckDetailInfo> findSettAndWayMationByAccId(HttpServletRequest request,HttpServletResponse response){
		
		//接受操作的对账ID
		Integer accId=Integer.parseInt(request.getParameter("accId"));
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Map<String, Integer> queryMap=new HashMap<String,Integer>();
		
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("accountCheckInfoId", accId);
		
		/*List<WaybillInfoPo> waybillInfoPos=waybillInfoFacade.findSettAndWayMationByAccId(accId);*/
		List<AccountCheckDetailInfo> accountCheckDetailInfoList = accountCheckInfoFacade
				.getAccountCheckDetailData(queryMap);
		if(CollectionUtils.isNotEmpty(accountCheckDetailInfoList)){
			
			//封装委托方
			List<Integer> orgIds=CommonUtils.getValueList(accountCheckDetailInfoList, "entrust");
			//key ：ID  value ： 名称
			Map<Integer, String> entrustMap=null;
			if(CollectionUtils.isNotEmpty(orgIds)){
				List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
				if(CollectionUtils.isNotEmpty(orgInfoPos)){
					entrustMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
				}
			}
			//封装承运方
			List<Integer> shipperIds=CommonUtils.getValueList(accountCheckDetailInfoList, "shipper");
			//key ：ID  value ： 名称
			Map<Integer, String> shipperMap=null;
			if(CollectionUtils.isNotEmpty(shipperIds)){
				List<OrgInfoPo> shippers = orgInfoFacade.findOrgNameByIds(shipperIds);
				if(CollectionUtils.isNotEmpty(shippers)){
					shipperMap=CommonUtils.listforMap(shippers, "id", "orgName");
				}
			}
			//封装货物
			List<Integer> goodsIds=CommonUtils.getValueList(accountCheckDetailInfoList, "goodsInfoId");
			//key ：ID  value ： 名称
			Map<Integer, String> goodsMap=null;
			if(CollectionUtils.isNotEmpty(goodsIds)){
				List<GoodsInfo> goodss = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
				if(CollectionUtils.isNotEmpty(goodss)){
					goodsMap=CommonUtils.listforMap(goodss, "id", "goodsName");
				}
			}
			for (AccountCheckDetailInfo way : accountCheckDetailInfoList) {
				
				//封装委托方
				if(MapUtils.isNotEmpty(entrustMap)&&entrustMap.get(way.getEntrust())!=null){
					way.setEntrustName(entrustMap.get(way.getEntrust()));
				}
				
				//封装承运方
				if(MapUtils.isNotEmpty(shipperMap)&&shipperMap.get(way.getShipper())!=null){
					way.setShipperName(shipperMap.get(way.getShipper()));
				}
				
				//封装货物
				if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(way.getGoodsInfoId())!=null){
					way.setGoodsName(goodsMap.get(way.getGoodsInfoId()));
				}
				
				//封装线路
				//判断是否为零散货物
				if(way.getScatteredGoods()!=null && !"".equals(way.getScatteredGoods())){
					//线路查询地点表
					//根据起点查询
					List<LocationInfoPo> locationInfoPos = locationInfoFacade.findLocationById(way.getLineInfoId());
					if(CollectionUtils.isNotEmpty(locationInfoPos)){
						for (LocationInfoPo locationInfoPo : locationInfoPos) {
							way.setLineStartStr(locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty());
						}
					}
					//根据线路终点查询地点表
					List<LocationInfoPo> locationInfos = locationInfoFacade.findLocationById(way.getEndPoints());
					if(CollectionUtils.isNotEmpty(locationInfos)){
						for (LocationInfoPo locationInfoPo : locationInfos) {
							way.setLineEndStr(locationInfoPo.getProvince()+"/"+locationInfoPo.getCity()+"/"+locationInfoPo.getCounty());
						}
					}
				}else{
					//线路查询线路表
					List<Integer> lineIds=new ArrayList<Integer>();
					lineIds.add(way.getLineInfoId());
					List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineIds);
					if(CollectionUtils.isNotEmpty(lineInfoPos)){
						for (LineInfoPo lineInfoPo : lineInfoPos) {
							way.setLineStartStr(lineInfoPo.getStartPoints());
							way.setLineEndStr(lineInfoPo.getEndPoints());
						}
					}
				}
				
			}
		}
		
		return accountCheckDetailInfoList;
	}
	
	/** 
	* @方法名: getSettAndWayMationByAccIdCount 
	* @作者: zhangshuai
	* @时间: 2017年9月12日 下午5:00:46
	* @返回值类型: Integer 
	* @throws 
	* 查询数量
	*/
	@RequestMapping(value="/getSettAndWayMationByAccIdCount")
	@ResponseBody
	public Integer getSettAndWayMationByAccIdCount(HttpServletRequest request,HttpServletResponse response){
		
		//接受操作的对账ID
				Integer accId=Integer.parseInt(request.getParameter("accId"));
				Map<String, Integer> queryMap=new HashMap<String,Integer>();
				
				queryMap.put("accountCheckInfoId", accId);
				
				/*List<WaybillInfoPo> waybillInfoPos=waybillInfoFacade.findSettAndWayMationByAccId(accId);*/
				List<AccountCheckDetailInfo> accountCheckDetailInfoList = accountCheckInfoFacade
						.getAccountCheckDetailData(queryMap);
				
				Integer count=accountCheckDetailInfoList.size();
				
				return count;
		
	}
	
	
	
	/**
	 * @Title: exportAccount  
	 * @Description: 导出对账单
	 * @author zhenghaiayng 2017年10月13日 
	 * @param request
	 * @param response
	 * @return JSONObject
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/exportAccount")
	@ResponseBody
	public void exportAccount(HttpServletRequest request, HttpServletResponse response){
		
		try {
			// 获取参数:对账单id ： 1,2,3
			String ids = request.getParameter("ids");
			Map<String, Object> map = accountCheckInfoFacade.exportAccount(ids);
			
			List<String> keyList = (List<String>) map.get("keyList");
			List<String> titleList = (List<String>) map.get("titleList");
			List<Map<String, Object>> list = (List<Map<String, Object>>) map.get("list");
			
			Workbook workbook = new HSSFWorkbook();
			String finalFileName = "对账信息";
			finalFileName = URLEncoder.encode(finalFileName, "UTF-8");

			workbook = POIExcelUtil.exportExcel(titleList, keyList, list, finalFileName);
			
			response.setContentType("application/vnd.ms-excel;charset=UTF-8");
			response.setCharacterEncoding("utf-8"); 
			response.addHeader("Content-Disposition", "attachment;filename="+new String( finalFileName.getBytes("gbk"), "UTF-8" )+".xls"); 	
			
			OutputStream os = response.getOutputStream();
			workbook.write(os);
			os.flush();
			
		} catch (Exception e) {
			e.printStackTrace();
		}

	}
	/**
	 * @Title: importSettlements  
	 * @Description: TODO(这里用一句话描述这个方法的作用)
	 * @author zhenghaiayng 2017年10月13日 
	 * @param myfile
	 * @param request
	 * @param response
	 * @return JSONObject
	 * @throws Exception
	 */
	@RequestMapping(value = "/importSettlements")
	@ResponseBody
	public JSONObject importSettlements(MultipartFile myfile, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		JSONObject jo = null;

		// 获取后缀名
		String fileName = myfile.getOriginalFilename();

		// 校验文件是否满足需求
		if (myfile.isEmpty()) {
			throw new Exception("请选择文件后上传");
		} else {
//			if (myfile.getSize() > 1048576) {
//				throw new Exception("文件长度过大，请上传1M以内文件");
//			}
		}
		// 对账单id
		Integer accountId = null;
		if (request.getParameter("id") != null
				&& StringUtils.isNotBlank(request.getParameter("id").toString())) {
			accountId = Integer.valueOf(request.getParameter("id").toString());
		}
		// 获取已经存在的ids
		String selectIds = request.getParameter("selectedIds");
		
		// 获取Excel文件地址并导入 ,, 只取id就行了
		String[] keyStr = {"id"};
		List<Map<String, Object>> dataList = POIExcelUtil.read(myfile, fileName, keyStr, 2);

		if (CollectionUtils.isNotEmpty(dataList)) {
			try {
				List<Integer> settlementIdList = new ArrayList<Integer>();
				for (Map<String, Object> map : dataList) {
					if (map.get("id") != null) {
						Integer id = Integer.valueOf(map.get("id").toString());
						settlementIdList.add(id);
					}
				}
				jo = accountCheckInfoFacade.importSettlements(settlementIdList,selectIds,accountId);
			} catch (Exception e) {
				e.printStackTrace();
				jo.put("success", false);
				jo.put("msg", "对账单明细导入异常！");
				return jo;
			}
		} else {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "请导入有效的结算单信息！");
		}
		return jo;
	}
	
	/**
	 * @Title: showPrintAcountPage  
	 * @Description: 显示对账单打印页面
	 * @author zhenghaiayng 2017年10月13日 
	 * @param request
	 * @param response
	 * @return String
	 */
	@RequestMapping("/showPrintAccountPage")
	public String showPrintAccountPage(HttpServletRequest request,Model model){
		
		try {
			// 获取session中的主机构ID
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			
			Integer id = null;
			if (StringUtils.isNotBlank(request.getParameter("print-id"))) {
				id = Integer.valueOf(request.getParameter("print-id"));
			}
			// 查询对账单信息
			Map<String, Object> map = accountCheckInfoFacade.getPrintAccountData(userInfo, id);
			model.addAttribute("accountInfo",map);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "template/accountCheck/print-account-check";
	}
	
	@RequestMapping("/showWaybillAccountPage")
	public String showWaybillAccountPage(HttpServletRequest request,Model model){
		// 从session中获取用户信息
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		AccountCheckInfo accountCheckInfo = null;
		if (StringUtils.isBlank(request.getParameter("accountCheckInfoId"))) {
			// 生成对账单编号 DZ+日期+四位序列号
			String accountCheckId = CodeAutoGenerater.generaterAccountCheckId();
			accountCheckInfo = new AccountCheckInfo();
			accountCheckInfo.setAccountCheckId(accountCheckId);
		} else {
			Integer accountCheckInfoId = Integer.valueOf(request.getParameter("accountCheckInfoId"));
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("accountCheckInfoId", accountCheckInfoId);
			params.put("orgRootId", orgRootId);
			accountCheckInfo = accountCheckInfoFacade.getAccountCheckInfoById(params);
		}
		model.addAttribute("accountCheckInfo", accountCheckInfo);
		return "template/accountCheck/waybillAccountPage";
	}
	
	/**
	 * @Title: getWaybillListForAccount  
	 * @Description: 获取运单数据
	 * @author zhenghaiayng 
	 * @date  2017年10月21日 
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/getWaybillListForAccount")
	@ResponseBody
	public JSONObject getWaybillListForAccount(HttpServletRequest request){
		JSONObject json = new JSONObject();
		try {
			// 从session中获取用户信息
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			if (userInfo == null) {
				json.put("success", false);
				json.put("msg", "请重新登陆");
				return json;
			}
			Integer userInfoId = userInfo.getId();
			Integer orgRootId = userInfo.getOrgRootId();
			Integer orgInfoId = userInfo.getOrgInfoId();

			// 查询用户数据权限
			List<UserDataAuthPo> userDataAuthPos =  userDataAuthFacade.getUserDataAuth(orgRootId, userInfoId);
			// 用户数据权限
			List<String> authList = new ArrayList<String>();
			for (UserDataAuthPo userDataAuth : userDataAuthPos) {
				String conditionGroup = userDataAuth.getConditionGroup();
				authList.add(conditionGroup);
			}
			
			// 获取参数
			// page
			Integer page = 1;
			if (StringUtils.isNotBlank(request.getParameter("page"))) {
				page = Integer.valueOf(request.getParameter("page"));
			}
			// rows
			Integer rows = 10;
			if (StringUtils.isNotBlank(request.getParameter("rows"))) {
				rows = Integer.valueOf(request.getParameter("rows"));
			}
			// 运单号
			String waybillId = null;
			if (StringUtils.isNotBlank(request.getParameter("waybillId"))) {
				waybillId = request.getParameter("waybillId");
			}
			;
			// 委托方 
			String entrustName = null;
			if (StringUtils.isNotBlank(request.getParameter("entrustName"))) {
				entrustName = request.getParameter("entrustName");
			}
			// 货物
			String goodsName = null;
			if (StringUtils.isNotBlank(request.getParameter("goodsName"))) {
				goodsName = request.getParameter("goodsName");
			}
			// 线路起点
			String startPoint = null;
			if (StringUtils.isNotBlank(request.getParameter("startPoint"))) {
				startPoint = request.getParameter("startPoint");
			}
			// 线路终点
			String endPoint = null;
			if (StringUtils.isNotBlank(request.getParameter("endPoint"))) {
				endPoint = request.getParameter("endPoint");
			}
			// 发货单位
			String forwardingUnit = null;
			if (StringUtils.isNotBlank(request.getParameter("forwardingUnit"))) {
				forwardingUnit = request.getParameter("forwardingUnit");
			}
			// 到货单位
			String consignee = null;
			if (StringUtils.isNotBlank(request.getParameter("consignee"))) {
				consignee = request.getParameter("consignee");
			}
			
			Map<String,Object> params = new HashMap<String,Object>();
			params.put("orgRootId", orgRootId);
			params.put("userDataAuths",authList);
			params.put("waybillId", waybillId);
			params.put("entrustName", entrustName);
			params.put("goodsName", goodsName);
			params.put("startPoint", startPoint);
			params.put("endPoint", endPoint);
			params.put("forwardingUnit", forwardingUnit);
			params.put("consignee", consignee);
			params.put("start",(page-1)*rows);
			params.put("rows",rows);

			// 运单数据
			List<Map<String, Object>> list = accountCheckInfoFacade.getWaybillListForAccount(params);
			// 运单数量
			Integer count = accountCheckInfoFacade.getWaybillCountForAccount(params);
			
			json.put("success", true);
			json.put("list", list);
			json.put("count", count);
			
		} catch (Exception e) {
			e.printStackTrace();
			json.put("success", false);
			json.put("msg", "请求出现异常");
		}
		return json;
	}
	
	/**
	 * @Title: saveWaybillAccount  
	 * @Description: 保存运单型的对账单
	 * @author zhenghaiayng 
	 * @date  2017年10月23日 
	 * @param request
	 * @param accountCheckInfoModel
	 * @return JSONObject
	 */
	@RequestMapping("/saveWaybillAccount")
	@ResponseBody
	public JSONObject saveWaybillAccount(HttpServletRequest request, AccountCheckInfoModel accountCheckInfoModel){
		JSONObject json = null;
		try {
			// 从session中取出当前用户的主机构ID、用户ID
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			Integer orgRootId = userInfo.getOrgRootId();
			Integer userInfoId = userInfo.getId();

			// 查询用户数据权限
			List<UserDataAuthPo> userDataAuthPos =  userDataAuthFacade.getUserDataAuth(orgRootId, userInfoId);
			// 用户数据权限
			List<String> authList = new ArrayList<String>();
			for (UserDataAuthPo userDataAuth : userDataAuthPos) {
				String conditionGroup = userDataAuth.getConditionGroup();
				authList.add(conditionGroup);
			}
						
			if (accountCheckInfoModel == null) {
				json = new JSONObject();
				json.put("success", false);
				json.put("msg", "对账信息不存在！");
				return json;
			}
			
			json = accountCheckInfoFacade.saveWaybillAccount(userInfo, accountCheckInfoModel,authList);
			// 如果编号重复重新生成
			if (json.getInteger("flag") == 1) {
				//String accountCheckId = CodeAutoGenerater.generaterAccountCheckId();
				String accountCheckId = accountCheckInfoFacade.getNewAccountCheckIdFa();
				json.put("accountCheckId", accountCheckId);
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			json = new JSONObject();
			json.put("success", false);
			json.put("msg", "服务请求异常");
		}
		return json;
	}
	
	/**
	 * 对账信息编辑页
	 * 
	 * @author zhenghaiyang 2017年7月4日 下午12:58:11
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/editAccountCheckInfoPageForWaybillAccount")
	public String editAccountCheckInfoPageForWaybillAccount(HttpServletRequest request, HttpSession session, Model model) {
		// 从session中获取用户信息
		UserInfo userInfo = (UserInfo) session.getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		AccountCheckInfo accountCheckInfo = null;
		if (StringUtils.isBlank(request.getParameter("accountCheckInfoId"))) {
			// 生成对账单编号 DZ+日期+四位序列号
			String accountCheckId = CodeAutoGenerater.generaterAccountCheckId();
			accountCheckInfo = new AccountCheckInfo();
			accountCheckInfo.setAccountCheckId(accountCheckId);
		} else {
			Integer accountCheckInfoId = Integer.valueOf(request.getParameter("accountCheckInfoId"));
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("accountCheckInfoId", accountCheckInfoId);
			params.put("orgRootId", orgRootId);
			accountCheckInfo = accountCheckInfoFacade.getAccountCheckInfoById(params);
		}
		model.addAttribute("accountCheckInfo", accountCheckInfo);
		return "template/accountCheck/waybillAccountPage";
	}
	
	/**
	 * @Title: importWaybills  
	 * @Description: 导入运单
	 * @author zhenghaiayng 2017年10月13日 
	 * @param myfile
	 * @param request
	 * @param response
	 * @return JSONObject
	 * @throws Exception
	 */
	@RequestMapping(value = "/importWaybills")
	@ResponseBody
	public JSONObject importWaybills(MultipartFile myfile, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		JSONObject jo = new JSONObject();
		try {
			// 获取后缀名
			String fileName = myfile.getOriginalFilename();

			// 校验文件是否满足需求
			if (myfile.isEmpty()) {
				throw new Exception("请选择文件后上传");
			} else {
//				if (myfile.getSize() > 1048576) {
//					throw new Exception("文件长度过大，请上传1M以内文件");
//				}
			}
			// 对账单id
			Integer accountCheckInfoId = null;
			if (StringUtils.isNotBlank(request.getParameter("accuontCheckInfoId"))) {
				accountCheckInfoId = Integer.valueOf(request.getParameter("accuontCheckInfoId"));
			}
			
			// 获取Excel文件地址并导入 ,, 只取id就行了
			String[] keyStr = {"id"};
			List<Map<String, Object>> dataList = POIExcelUtil.read(myfile, fileName, keyStr, 2);
			// 导入的内容是否为空
			if (CollectionUtils.isEmpty(dataList)) {
				jo.put("success", false);
				jo.put("msg", "请导入有效的运单信息！");
			}
			
			// 运单id,查询对账单已经存在的运单Id，若没有则返回 new ArrayList<Integer>()
			List<Integer> waybillInfoIdList = accountCheckInfoFacade.getWaybillInfoIdListOfWaybillAccount(accountCheckInfoId);

			
			// 获取当前选中的运单id
			if (StringUtils.isNotBlank(request.getParameter("selectedIds"))) {
				String a = request.getParameter("selectedIds");
				String[] as = a.split(",");
				for (int i = 0; i < as.length; i++) {
					Integer id = Integer.valueOf(as[i]);
					if (!waybillInfoIdList.contains(id)) {
						waybillInfoIdList.add(id);
					}
				}
			}
						
			
			for (Map<String, Object> map : dataList) {
				if (map != null) {
					if (map.get("id") != null) {
						Integer id = Integer.valueOf(map.get("id").toString());
						if (!waybillInfoIdList.contains(id)) {
							waybillInfoIdList.add(id);
						}
					}
				}
				
			}

			// 验证运单的委托方和货物是否都一样
			List<Map<String, Object>> aList = accountCheckInfoFacade.getWaybillEntrustGoods(waybillInfoIdList);
			if (aList != null && aList.size() > 1) {
				jo.put("success", false);
				jo.put("msg", "所选运单的委托方和货物必须一样");
				return jo;
			}
			
			AccountCheckInfo accountCheckInfo = accountCheckInfoFacade.calculateRelatedDataForWaybillAccount(accountCheckInfoId, waybillInfoIdList);
			
			StringBuffer buffer = new StringBuffer();
			for (Integer waybillInfoId : waybillInfoIdList) {
				if (waybillInfoId != null) {
					buffer.append(waybillInfoId).append(",");
				} 
			}
			String waybillInfoIdString = buffer.toString();
			waybillInfoIdString = waybillInfoIdString.substring(0,waybillInfoIdString.length()-1);
			
			jo.put("success", true);
			jo.put("waybillInfoIdString", waybillInfoIdString);
			jo.put("accountCheckInfo", accountCheckInfo);
		} catch (Exception e) {
			e.printStackTrace();
			log.error(e.getMessage());
			jo.put("success", false);
			jo.put("msg", "服务出现异常");
		}
		return jo;
	}
	
	/**
	 * @Title: getDetailWaybill  
	 * @Description: 获取明细运单数据
	 * @author zhenghaiyang 
	 * @date  2017年11月4日 
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/getDetailWaybill")
	@ResponseBody
	public JSONObject getDetailWaybill(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		try {
			// 获取参数
			// 对账单主键
			Integer accountCheckInfoId = null;
			if (StringUtils.isNotBlank(request.getParameter("accountCheckInfoId"))) {
				accountCheckInfoId = Integer.valueOf(request.getParameter("accountCheckInfoId"));
			}
			// page
			Integer page = 1;
			if (StringUtils.isNotBlank(request.getParameter("page"))) {
				page = Integer.valueOf(request.getParameter("page"));
			}
			// rows
			Integer rows = 10;
			if (StringUtils.isNotBlank(request.getParameter("rows"))) {
				rows = Integer.valueOf(request.getParameter("rows"));
			}
			
			// 封装参数
			Map<String, Object> queryMap = new HashMap<String, Object>();
			queryMap.put("accountCheckInfoId", accountCheckInfoId);
			queryMap.put("start", (page-1)*rows);
			queryMap.put("rows", rows);
			
			// 查询信息
			jo = accountCheckInfoFacade.getDetaiWaybill(queryMap);
			
		} catch (Exception e) {
			log.error(e.getMessage());
			jo.put("success", false);
			jo.put("msg", "服务请求失败");
		}
		return jo;
	}
	
	/**
	 * @Title: deleteAccountDetailWaybill  
	 * @Description: 删除对账明细（运单）
	 * @author zhenghaiyang 
	 * @date  2017年11月6日 
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/deleteAccountDetailWaybill")
	@ResponseBody
	public JSONObject deleteAccountDetailWaybill(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		try {
			// 获取用户登陆信息
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			if (userInfo == null) {
				jo.put("success", false);
				jo.put("msg", "请重新登陆");
				return jo;
			}
			// 接受参数
			List<Integer> accountDetailIdList = new ArrayList<Integer>();
			String accountDetailIds = null;
			if (StringUtils.isNotBlank(request.getParameter("accountDetailIds"))) {
				accountDetailIds = request.getParameter("accountDetailIds");
			} else {
				jo.put("success", false);
				jo.put("msg", "请选择数据");
				return jo;
			}
			String[] accountDetailIdArray = accountDetailIds.split(",");
			for (String string : accountDetailIdArray) {
				if (string != null) {
					accountDetailIdList.add(Integer.valueOf(string));
				}
			}
			
			// 删除明细
			jo = accountCheckInfoFacade.deleteAccountDetailWaybill(userInfo, accountDetailIdList);
			
		} catch (Exception e) {
			e.printStackTrace();
			log.error(e.getMessage());
			jo.put("success", false);
			jo.put("msg", "服务请求失败");
		}
		return jo;
	}
	
	/**
	 * @Title: exportWaybill  
	 * @Description: 导出运单
	 * @author zhenghaiayng 2017年10月13日 
	 * @param request
	 * @param response
	 * @return JSONObject
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping("/exportWaybill")
	@ResponseBody
	public void exportWaybill(HttpServletRequest request, HttpServletResponse response){
		
		try {
			// 获取参数:对账单id ： 1,2,3
			List<Integer> waybillInfoIdList = new ArrayList<Integer>();
 			String waybillInfoIds = request.getParameter("waybillInfoIds");
			if (waybillInfoIds != null) {
				String[] as = waybillInfoIds.split(",");
				for (int i = 0; i < as.length; i++) {
					waybillInfoIdList.add(Integer.valueOf(as[i]));
				}
			}
			
			Map<String, Object> map = accountCheckInfoFacade.getExportWaybillData(waybillInfoIdList);
			
			List<String> keyList = (List<String>) map.get("keyList");
			List<String> titleList = (List<String>) map.get("titleList");
			List<Map<String, Object>> list = (List<Map<String, Object>>) map.get("list");
			
			Workbook workbook = new HSSFWorkbook();
			String finalFileName = "运单信息";
			finalFileName = URLEncoder.encode(finalFileName, "UTF-8");

			workbook = POIExcelUtil.exportExcel(titleList, keyList, list, finalFileName);
			
			response.setContentType("application/vnd.ms-excel;charset=UTF-8");
			response.setCharacterEncoding("utf-8"); 
			response.addHeader("Content-Disposition", "attachment;filename="+new String( finalFileName.getBytes("gbk"), "UTF-8" )+".xls"); 	
			
			OutputStream os = response.getOutputStream();
			workbook.write(os);
			os.flush();
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	
	/**
	 * @Title: importWaybillForWaybillAccount  
	 * @Description: 导入运单数据（运单对账）
	 * @author zhenghaiayng 2017年10月13日 
	 * @param myfile
	 * @param request
	 * @param response
	 * @return JSONObject
	 * @throws Exception
	 */
	@RequestMapping(value = "/importWaybillForWaybillAccount")
	@ResponseBody
	public JSONObject importWaybillForWaybillAccount(MultipartFile myfile, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		JSONObject jo = new JSONObject();

		// 获取后缀名
		String fileName = myfile.getOriginalFilename();

		// 校验文件是否满足需求
		if (myfile.isEmpty()) {
			throw new Exception("请选择文件后上传");
		} else {
//			if (myfile.getSize() > 1048576) {
//				throw new Exception("文件长度过大，请上传1M以内文件");
//			}
		}

		// 获取已经存在的ids
		List<Integer> idList = new ArrayList<Integer>();
		String selectIds = request.getParameter("selectedIds");
		if (selectIds != null) {
			String[] ids = selectIds.split(",");
			for (int i = 0; i < ids.length; i++) {
				idList.add(Integer.valueOf(ids[i]));
			}
		}
		// 获取Excel文件地址并导入 ,, 只取id就行了
		String[] keyStr = {"id"};
		List<Map<String, Object>> dataList = POIExcelUtil.read(myfile, fileName, keyStr, 2);

		if (CollectionUtils.isNotEmpty(dataList)) {
			try {
				
				List<Integer> waybillInfoIdList = new ArrayList<Integer>();
				for (Map<String, Object> map : dataList) {
					if (map != null && map.get("id") != null) {
						Integer id = Integer.valueOf(map.get("id").toString());
						waybillInfoIdList.add(id);
					}
				}
				for (Integer id : idList) {
					if (id != null) {
						waybillInfoIdList.add(id);
					}
				}
				
			} catch (Exception e) {
				e.printStackTrace();
				jo.put("success", false);
				jo.put("msg", "对账单明细导入异常！");
				return jo;
			}
		} else {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "请导入有效的结算单信息！");
		}
		return jo;
	}
	
	/**
	 * @Title: calculateRelatedDataForWaybillAccount  
	 * @Description: 根据选中的运单计算数据
	 * @author zhenghaiyang 
	 * @date  2017年11月8日 
	 * @param request
	 * @return JSONObject
	 */
	@RequestMapping("/calculateRelatedDataForWaybillAccount")
	@ResponseBody
	public JSONObject calculateRelatedDataForWaybillAccount(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		try {
			// 获取 参数
			// 对账单id
			Integer accountCheckInfoId = null;
			if (StringUtils.isNotBlank(request.getParameter("accountCheckInfoId"))) {
				accountCheckInfoId = Integer.valueOf(request.getParameter("accountCheckInfoId"));
			}
			// 运单集合
			List<Integer> waybillInfoIdList = new ArrayList<Integer>();
			if (StringUtils.isNotBlank(request.getParameter("waybillInfoIds"))) {
				String a = request.getParameter("waybillInfoIds");
				String[] as = a.split(",");
				for (int i = 0; i < as.length; i++) {
					waybillInfoIdList.add(Integer.valueOf(as[i]));
				}
			} else {
				jo.put("success", false);
				jo.put("msg", "请选择数据");
				return jo;
			}
			
			// 验证运单的委托方和货物是否都一样
			List<Map<String, Object>> aList = accountCheckInfoFacade.getWaybillEntrustGoods(waybillInfoIdList);
			if (aList != null && aList.size() > 1) {
				jo.put("success", false);
				jo.put("msg", "所选运单的委托方和货物必须一样");
				return jo;
			}
			
			// 计算
			AccountCheckInfo accountCheckInfo = accountCheckInfoFacade.calculateRelatedDataForWaybillAccount(accountCheckInfoId, waybillInfoIdList);
			jo.put("success", true);
			jo.put("accountCheckInfo", accountCheckInfo);
		} catch (Exception e) {
			log.error(e.getMessage());
			jo.put("success", false);
			jo.put("msg", "服务请求异常");
		}
		return jo;
	}
	
	/**
	 * @Title: getAccountCheckInfoByPKey  
	 * @Description: 根据主键获取对账单信息
	 * @author zhenghaiyang 
	 * @date  2017年11月9日 
	 * @return JSONObject
	 */
	@RequestMapping("/getAccountCheckInfoByPKey")
	@ResponseBody
	public JSONObject getAccountCheckInfoByPKey(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		try {
			// 获取用户信息
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			if (userInfo == null) {
				jo.put("success", false);
				jo.put("msg", "用户信息失效，请重新登陆");
				return jo;
			}
			// 获取参数
			Integer accountCheckInfoId = null;
			if (StringUtils.isNotBlank(request.getParameter("accountCheckInfoId"))) {
				accountCheckInfoId = Integer.valueOf(request.getParameter("accountCheckInfoId"));
			}
			
			// 查询对账单信息
			Map<String, Object> accountCheckInfo = accountCheckInfoFacade.getPrintAccountData(userInfo, accountCheckInfoId);
			
			jo.put("success", true);
			jo.put("accountCheckInfo", accountCheckInfo);
			
			
		} catch (Exception e) {
			log.error(e.getMessage());
			e.printStackTrace();
			jo.put("success", false);
			jo.put("msg", "服务请求失败");
		}
		return jo;
	}
}
