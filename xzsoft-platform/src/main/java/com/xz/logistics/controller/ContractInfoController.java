package com.xz.logistics.controller;

import java.math.BigDecimal;
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
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.BiddingDetailInfoFacade;
import com.xz.facade.api.BiddingInfoFacade;
import com.xz.facade.api.ContractInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.IndividualOwnerFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.MyOfferDetailedFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.PartnerInfoFacade;
import com.xz.facade.api.ProjectInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.BiddingDetailInfoPo;
import com.xz.model.po.BiddingInfoPo;
import com.xz.model.po.ContractInfo;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.IndividualOwnerPo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.MyOfferDetailedPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.ProjectInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.ContractInfoModel;

/**
 * 合同控制器
 * 
 * @author zhangya 2017年6月16日 上午11:11:30
 */
@Controller
@RequestMapping("/contractInfo")
public class ContractInfoController extends BaseController {

	private final Logger log = LoggerFactory.getLogger(getClass());

	@Resource
	private ContractInfoFacade contractInfoFacade;
	@Resource
	private ProjectInfoFacade projectInfoFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private PartnerInfoFacade partnerInfoFacade;
	@Resource
	private MyOfferDetailedFacade myOfferDetailedFacade;
	@Resource
	private BiddingInfoFacade biddingInfoFacade;
	@Resource
	private IndividualOwnerFacade individualOwnerFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;
	@Resource
	private BiddingDetailInfoFacade biddingDetailInfoFacade;
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
	@Resource
	private LineInfoFacade lineInfoFacade;
	/**
	 * 合同信息查询页面
	 * 
	 * @author zhangya 2017年6月16日 上午11:15:44
	 * @param request
	 * @return
	 */
	@RequiresPermissions("contract:logistics:view")
	@RequestMapping(value = "/showContractInfoPage", produces = "application/json; charset=utf-8")
	public String showContractInfoPage(HttpServletRequest request) {

		return "template/contract/show_logistics_contract_info_page";
	}

	/**
	 * 合同信息列表数据加载
	 * 
	 * @author zhangya 2017年6月16日 上午11:15:44
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/listContractInfo", produces = "application/json; charset=utf-8")
	public String listContractInfo(HttpServletRequest request, Model model) {
		DataPager<ContractInfo> contractInfoPager = new DataPager<ContractInfo>();
		Map<String, Object> params = this.paramsToMap(request);

		// 封住查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		contractInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		contractInfoPager.setSize(rows);
		// 分页参数
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);

		// 合同名称
		String contractName = null;
		if (params.get("contractName") != null) {
			contractName = params.get("contractName").toString();
		}
		// 物流合同编号
		String contractCode = null;
		if (params.get("contractCode") != null) {
			contractCode = params.get("contractCode").toString();
			queryMap.put("contractCode", contractCode);
		}
		// 转包合同编号
		String subContractCode = null;
		if (params.get("subContractCode") != null) {
			subContractCode = params.get("subContractCode").toString();
			queryMap.put("subContractCode", subContractCode);
		}
		// 委托方
		String entrustName = null;
		if (params.get("entrustName") != null) {
			entrustName = params.get("entrustName").toString();
			queryMap.put("entrustName", entrustName);
		}
		// 承运方
		String shipperName = null;
		if (params.get("shipperName") != null) {
			shipperName = params.get("shipperName").toString();
			queryMap.put("shipperName", shipperName);
		}
		// 合同状态
		Integer contractStatus = null;
		if (params.get("contractStatus") != null) {
			contractStatus = Integer.valueOf(params.get("contractStatus").toString());
			queryMap.put("contractStatus", contractStatus);
		}
		// 合同协同状态
		Integer cooperateStatus = null;
		if (params.get("cooperateStatus") != null) {
			cooperateStatus = Integer.valueOf(params.get("cooperateStatus").toString());
			queryMap.put("cooperateStatus", cooperateStatus);
		}
		// 合同分类
		Integer contractClassify = 1;
		if (params.get("contractClassify") != null) {
			contractClassify = Integer.valueOf(params.get("contractClassify").toString());
			queryMap.put("contractClassify", contractClassify);
		}
		// 合同创建时间(起始)
		String createTimeStart = null;
		if (params.get("createTimeStart") != null) {
			createTimeStart = params.get("createTimeStart").toString();
			queryMap.put("createTimeStart", createTimeStart);
		}
		// 合同创建时间(截至)
		String createTimeEnd = null;
		if (params.get("createTimeEnd") != null) {
			createTimeEnd = params.get("createTimeEnd").toString();
			queryMap.put("createTimeEnd", createTimeEnd);
		}
		// 线路ID
		Integer lineInfoId = null;
		if (params.get("lineInfoId") != null) {
			lineInfoId = Integer.valueOf(params.get("lineInfoId").toString());
			queryMap.put("lineInfoId", lineInfoId);
		}
		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		 Integer parentOrgInfoId = userInfo.getParentOrgInfoId();
		Integer orgRootId = userInfo.getOrgRootId();
		// queryMap.put("createUser", userInfoId);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("contractName", contractName);
		// 如果不是企业管理员则数据组织隔离
		if (userInfo.getOrgLevel() != 1) {
			Integer orgInfoId = userInfo.getOrgInfoId();
			List<Integer> orgInfoIdList = orgInfoFacade.findOrgInfoIdsByParentId(orgInfoId);
			if(userInfo.getOrgType() == 2){
				orgInfoIdList.add(parentOrgInfoId);
			}
			if (CollectionUtils.isNotEmpty(orgInfoIdList)) {
				queryMap.put("orgInfoIdList", orgInfoIdList);
			}
		}

		// 判断是接收还是确认
		String type = "0";
		if (params.get("type") != null) {
			type = params.get("type").toString();
		}

		String view = null;
		Integer totalNum = null;
		List<ContractInfo> contractInfoList = null;

		if (type.equals("0")) {
			totalNum = contractInfoFacade.countContractInfoForPage(queryMap);
			contractInfoList = contractInfoFacade.findContractInfoForPage(queryMap);

			if (CollectionUtils.isNotEmpty(contractInfoList)) {

				// 查询合同执行信息
				List<Integer> contractInfoIds = CommonUtils.getValueList(contractInfoList, "id");
				// key:合同ID value:执行信息
				Map<Integer, ContractInfo> performanceMap = null;
				if (CollectionUtils.isNotEmpty(contractInfoIds)) {
					Map<String, Object> paramsMap = new HashMap<String, Object>();
					paramsMap.put("list", contractInfoIds);
					paramsMap.put("orgRootId", orgRootId);
					List<ContractInfo> performanceInfos = contractInfoFacade.findContractPerformanceInfo(paramsMap);
					if (CollectionUtils.isNotEmpty(performanceInfos)) {
						performanceMap = CommonUtils.listforMap(performanceInfos, "id", null);
					}
				}
				BigDecimal ZERO = new BigDecimal(0);
				BigDecimal contractAmount =null;
				BigDecimal planAmount=null;
//				BigDecimal executedAmount=null;
				BigDecimal completeAmount=null;
				BigDecimal uncompleteAmount=null;
				for (ContractInfo contractInfo : contractInfoList) {
					
					// 修改执行状态
					if (MapUtils.isNotEmpty(performanceMap) && performanceMap.get(contractInfo.getId()) != null) {
//						//合同总量
						contractAmount = performanceMap.get(contractInfo.getId()).getContractAmount();
//						//计划量
						planAmount = performanceMap.get(contractInfo.getId()).getPlanCount();
						//已开票(已完成量)
						completeAmount = performanceMap.get(contractInfo.getId()).getCompleteCount();
//						//未完成量 = 总量 - 已完成
						uncompleteAmount =  contractAmount.subtract(completeAmount);
//						//已执行量
//						executedAmount = performanceMap.get(contractInfo.getId()).getExecutedAmount();
//						contractInfo.setContractAmount(contractAmount);
//						contractInfo.setExecutedAmount(executedAmount);
//						contractInfo.setUnexecutedAmount(contractAmount.subtract(executedAmount));
						if(contractInfo.getContractStatus() == 8){
							if (planAmount.compareTo(ZERO)==1) {
								contractInfo.setContractStatus(10);//生成计划拉运量大于0 则 状态执行中
							}
							if (!(uncompleteAmount.compareTo(ZERO)==1)) {
								contractInfo.setContractStatus(11);// 合同执行完成
							}
						}
					}
				}
			}

			if (contractClassify == 1) {
				view = "template/contract/logistics_contract_info_data";
			} else if (contractClassify == 2) {
				view = "template/contract/sub_contract_info_data";
			}
		} else if (type.equals("1")) {
			// 查询接收的合同 1.当为企业货主时 按委托方主机构查询 2.当为物流公司时 按承运方主机构查询
			totalNum = contractInfoFacade.countReceiveContractInfoForPage(queryMap);
			contractInfoList = contractInfoFacade.findReceiveContractInfoForPage(queryMap);
			// 封装项目信息及项目所属组织机构信息
			if (CollectionUtils.isNotEmpty(contractInfoList)) {

				// 查询委托方项目
				List<Integer> entrustProjectInfoIds = CommonUtils.getValueList(contractInfoList, "entrustProject");
				// key:项目ID value:项目名称
				Map<Integer, String> entrustProjectNameMap = null;
				// key:项目ID value:项目所属组织名称
				Map<Integer, String> entrustProjectOrgNameMap = null;
				if (CollectionUtils.isNotEmpty(entrustProjectInfoIds)) {
					List<ProjectInfoPo> entrustProjectInfos = projectInfoFacade
							.findProjectInfoPoByIds(entrustProjectInfoIds);
					if (CollectionUtils.isNotEmpty(entrustProjectInfos)) {
						entrustProjectNameMap = CommonUtils.listforMap(entrustProjectInfos, "id", "projectName");
					}
					if (CollectionUtils.isNotEmpty(entrustProjectInfos)) {
						entrustProjectOrgNameMap = CommonUtils.listforMap(entrustProjectInfos, "id", "orgInfoName");
					}
				}

				// 查询承运方项目
				// key:项目ID value:项目名称
				Map<Integer, String> shipperProjectNameMap = null;
				// key:项目ID value:项目所属组织名称
				Map<Integer, String> shipperProjectOrgNameMap = null;
				List<Integer> shipperProjectInfoIds = CommonUtils.getValueList(contractInfoList, "shipperProject");
				if (CollectionUtils.isNotEmpty(shipperProjectInfoIds)) {

					List<ProjectInfoPo> shipperProjectInfos = projectInfoFacade
							.findProjectInfoPoByIds(shipperProjectInfoIds);

					if (CollectionUtils.isNotEmpty(shipperProjectInfos)) {
						shipperProjectNameMap = CommonUtils.listforMap(shipperProjectInfos, "id", "projectName");
					}

					if (CollectionUtils.isNotEmpty(shipperProjectInfos)) {
						shipperProjectOrgNameMap = CommonUtils.listforMap(shipperProjectInfos, "id", "orgInfoName");
					}
				}

				for (ContractInfo contractInfo : contractInfoList) {

					// 封装委托方项目信息
					if (MapUtils.isNotEmpty(entrustProjectNameMap)
							&& entrustProjectNameMap.get(contractInfo.getEntrustProject()) != null) {
						contractInfo.setEntrustProjectName(entrustProjectNameMap.get(contractInfo.getEntrustProject()));
						contractInfo.setEntrustProjectOrgName(
								entrustProjectOrgNameMap.get(contractInfo.getEntrustProject()));
					}

					// 封装承运方项目信息
					if (MapUtils.isNotEmpty(shipperProjectNameMap)
							&& shipperProjectNameMap.get(contractInfo.getShipperProject()) != null) {
						contractInfo.setShipperProjectName(shipperProjectNameMap.get(contractInfo.getShipperProject()));
						contractInfo.setShipperProjectOrgName(
								shipperProjectOrgNameMap.get(contractInfo.getShipperProject()));
					}
				}
			}

			if (contractClassify == 1) {
				view = "template/contract/received_logistics_contract_info_data";
			} else if (contractClassify == 2) {
				view = "template/contract/received_sub_contract_info_data";
			}
		}

		contractInfoPager.setTotal(totalNum);
		contractInfoPager.setRows(contractInfoList);
		model.addAttribute("contractInfoPager", contractInfoPager);
		return view;
	}

	/**
	 * 合同新增编辑页
	 * 
	 * @author zhangya 2017年6月18日 下午12:43:50
	 * @param request
	 * @return
	 */
	@RequestMapping("/addOrEditContractInfoPage")
	public String addOrEditContractInfoPage(HttpServletRequest request, Model model) {
		// 从session中获取用户信息
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");

		String operateTitle = "合同信息新增";
		if (StringUtils.isNotBlank(request.getParameter("contractInfoId"))) {
			operateTitle = "合同信息修改";
			Integer contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
			Map<String, Integer> params = new HashMap<String, Integer>();
			// 物流合同
			// params.put("contractClassify", 1);
			// params.put("createUser", userInfo.getId());
			params.put("orgRootId", userInfo.getOrgRootId());
			params.put("contractInfoId", contractInfoId);
			ContractInfo contractInfo = contractInfoFacade.getContractInfoById(params);
			model.addAttribute("contractInfo", contractInfo);
		}
		model.addAttribute("operateTitle", operateTitle);

		String entrustProjectHidden = "none";
		String shipperProjectHidden = "none";
		if (userInfo.getUserRole() == 1) {
			// 企业货主
			entrustProjectHidden = "block";
		} else if (userInfo.getUserRole() == 2) {
			// 物流公司
			shipperProjectHidden = "block";
		}
		model.addAttribute("shipperProjectHidden", shipperProjectHidden);
		model.addAttribute("entrustProjectHidden", entrustProjectHidden);
		if (StringUtils.isNotBlank(request.getParameter("contractClassify"))
				&& request.getParameter("contractClassify").equals("2")) {
			return "template/contract/sub_contract_info_edit_page";
		}
		return "template/contract/contract_info_edit_page";
	}

	/**
	 * 合同信息修改校验
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/checkBeforeOperate")
	@ResponseBody
	public JSONObject checkBeforeOperate(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		if (StringUtils.isBlank(request.getParameter("contractInfoId"))) {
			jo.put("success", false);
			jo.put("msg", "要修改的合同信息不存在！");
			return jo;
		}
		Integer contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		// Integer userInfoId = userInfo.getId();
		Map<String, Integer> params = new HashMap<String, Integer>();
		// params.put("createUser", userInfoId);
		// 标识物流合同
		// params.put("contractClassify", 1);
		params.put("orgRootId", rootOrgInfoId);
		params.put("contractInfoId", contractInfoId);
		try {
			ContractInfo contractInfo = contractInfoFacade.getContractInfoById(params);
			if (contractInfo == null) {
				jo.put("success", false);
				jo.put("msg", "要修改的合同信息不存在！");
				return jo;
			}
			// 判断合同状态是否“新建”、“审核驳回”、“已撤回”、“已拒绝”状态
			if (contractInfo.getContractStatus() != 1 && contractInfo.getContractStatus() != 3
					&& contractInfo.getContractStatus() != 6 && contractInfo.getContractStatus() != 7) {
				jo.put("success", false);
				jo.put("msg", "合同已提交审核，无法修改！");
				return jo;
			}
		} catch (Exception e) {
			log.error("查询单条合同信息异常", e);
			jo.put("success", false);
			jo.put("msg", "要修改的合同信息不存在！");
			return jo;
		}
		jo.put("success", true);
		jo.put("msg", "校验通过！");
		return jo;
	}

	/**
	 * 合同信息新增修改
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/addOrUpdateContractInfo")
	@ResponseBody
	public JSONObject addOrUpdateContractInfo(HttpServletRequest request, ContractInfoModel contractInfoModel) {
		JSONObject jo = new JSONObject();

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userInfoId = userInfo.getId();
		try {
			jo = contractInfoFacade.addOrUpdateContractInfo(contractInfoModel, rootOrgInfoId, orgInfoId, userInfoId);
		} catch (Exception e) {
			log.error("合同信息保存异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "合同信息保存服务异常，请稍后重试");
		}
		return jo;
	}

	/**
	 * 删除合同信息
	 * 
	 * @author zhangya 2017年6月21日 下午1:16:50
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/deleteContractInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteContractInfo(HttpServletRequest request) {
		JSONObject jo = new JSONObject();

		// 要删除的合同ID
		List<Integer> contractInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("contractInfoIds"))) {
			String contractInfoIds = request.getParameter("contractInfoIds").trim();
			String[] contractArray = contractInfoIds.split(",");
			if (contractArray.length > 0) {
				for (String contractIdStr : contractArray) {
					if (StringUtils.isNotBlank(contractIdStr)) {
						contractInfoIdList.add(Integer.valueOf(contractIdStr.trim()));
					}
				}
			}
		}

		// 所选合同不能为空
		if (CollectionUtils.isEmpty(contractInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选合同不能为空");
			return jo;
		}

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer createUser = userInfo.getId();
		Integer orgRootId = userInfo.getOrgRootId();
		try {
			jo = contractInfoFacade.deleteContractInfo(contractInfoIdList, orgRootId, createUser);
		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", "删除合同异常！");
			return jo;
		}
		return jo;

	}

	/**
	 * 委托方信息查询
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/getEntrustData")
	@ResponseBody
	public List<OrgInfoPo> getEntrustData(HttpServletRequest request, Model model) {
		List<OrgInfoPo> orgList = null;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 前台传入的查询参数
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
		// 合同协同状态
		Integer cooperateStatus = 1;
		if (params.get("cooperateStatus") != null) {
			cooperateStatus = Integer.valueOf((String) params.get("cooperateStatus"));
		}
		// 委托方名称
		String orgName = null;
		if (StringUtils.isNotBlank(request.getParameter("orgName"))) {
			orgName = request.getParameter("orgName");
		}
		params.put("start", (page - 1) * rows);
		params.put("rows", rows);
		params.put("orgName", orgName);

		Integer rootOrgInfoId = userInfo.getOrgRootId();
		// 如果是企业货主
		if (userInfo.getUserRole() == 1) {
			// 角色为企业货主
			params.put("orgRole", 1);
			params.put("cooperateState", 1);
			params.put("rootOrgInfoId", rootOrgInfoId);
			try {
				orgList = orgInfoFacade.findContractSubjectForPage(params);
			} catch (Exception e) {
				e.printStackTrace();
			}
		} else if (userInfo.getUserRole() == 2) {
			// 如果为物流公司

			// 如果合同的协同状态为协同 查询合作伙伴
			if (cooperateStatus == 1) {
				// 获取合作伙伴 角色为企业货主
				params.put("partnerRole", 1);
				// 主机构为ID匹配 发起方数据归属编号
				params.put("orgRootId", rootOrgInfoId);
				orgList = orgInfoFacade.findPartnerEntrustOrShipper(params);
			} else if (cooperateStatus == 2) {
				// 角色为企业货主
				params.put("orgRole", 1);
				// 不协同 查询组织角色为企业货主的组织机构
				params.put("rootOrgInfoId", null);
				params.put("parentOrgInfoId", rootOrgInfoId);
				params.put("cooperateState", 2);
				try {
					orgList = orgInfoFacade.findContractSubjectForPage(params);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}

		}

		if (CollectionUtils.isNotEmpty(orgList)) {
			// 5、封装所属主机构
			List<Integer> rootOrgInfoIds = CommonUtils.getValueList(orgList, "rootOrgInfoId");
			List<OrgInfoPo> rootOrgInfos = orgInfoFacade.findOrgNameByIds(rootOrgInfoIds);
			// key:组织ID value:组织名称
			Map<Integer, String> rootOrgInfoMap = null;
			if (CollectionUtils.isNotEmpty(rootOrgInfos)) {
				rootOrgInfoMap = CommonUtils.listforMap(rootOrgInfos, "id", "orgName");
			}

			for (OrgInfoPo org : orgList) {
				// 封装所属机构
				if (MapUtils.isNotEmpty(rootOrgInfoMap) && rootOrgInfoMap.get(org.getRootOrgInfoId()) != null) {
					org.setRootOrgName(rootOrgInfoMap.get(org.getRootOrgInfoId()));
				}
			}
		}

		return orgList;
	}

	/**
	 * 委托方数量查询
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/getEntrustCount")
	@ResponseBody
	public Integer getEntrustCount(HttpServletRequest request, Model model) {

		// 合同协同状态
		Integer cooperateStatus = 1;
		if (StringUtils.isNotBlank(request.getParameter("cooperateStatus"))) {
			cooperateStatus = Integer.valueOf(request.getParameter("cooperateStatus"));
		}
		// 委托方名称
		String orgName = null;
		if (StringUtils.isNotBlank(request.getParameter("orgName"))) {
			orgName = request.getParameter("orgName");
		}

		// 委托方数量
		Integer count = 0;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 查询参数
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("orgName", orgName);
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		// 如果是企业货主
		if (userInfo.getUserRole() == 1) {
			// 角色为企业货主
			params.put("orgRole", 1);
			params.put("cooperateState", 1);
			params.put("rootOrgInfoId", rootOrgInfoId);
			try {
				count = orgInfoFacade.countContractSubjectForPage(params);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		// 如果为物流公司

		if (userInfo.getUserRole() == 2) {

			// 所属组织的协同状态 如果为协同 查询合作伙伴
			if (cooperateStatus == 1) {
				// 获取合作伙伴 角色为企业货主
				params.put("partnerRole", 1);
				// 主机构为ID匹配 发起方数据归属编号
				params.put("orgRootId", rootOrgInfoId);
				count = orgInfoFacade.countPartnerEntrustOrShipper(params);
			} else if (cooperateStatus == 2) {
				// 角色为企业货主
				params.put("orgRole", 1);
				// 不协同 查询组织角色为企业货主的组织机构
				params.put("cooperateState", 2);
				params.put("rootOrgInfoId", null);
				params.put("parentOrgInfoId", rootOrgInfoId);
				try {
					// 查询角色为企业货主的组织
					count = orgInfoFacade.countContractSubjectForPage(params);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		return count;
	}

	/**
	 * 承运方信息查询
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/getShipperData")
	@ResponseBody
	public List<OrgInfoPo> getShipperData(HttpServletRequest request, Model model) {

		List<OrgInfoPo> orgList = null;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 前台传入的查询参数
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

		// 合同协同状态
		Integer cooperateStatus = 1;
		if (params.get("cooperateStatus") != null) {
			cooperateStatus = Integer.valueOf((String) params.get("cooperateStatus"));
		}

		// 承运方名称
		String orgName = null;
		if (StringUtils.isNotBlank(request.getParameter("orgName"))) {
			orgName = request.getParameter("orgName");
		}

		params.put("start", (page - 1) * rows);
		params.put("rows", rows);
		params.put("orgName", orgName);
		// 角色必为物流公司
		params.put("orgRole", 2);
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		// 如果是物流公司
		if (userInfo.getUserRole() == 2) {
			// 角色必为物流公司
			params.put("orgRole", 2);
			params.put("cooperateState", 1);
			params.put("rootOrgInfoId", rootOrgInfoId);
			try {
				orgList = orgInfoFacade.findContractSubjectForPage(params);
			} catch (Exception e) {
				e.printStackTrace();
			}
		} else if (userInfo.getUserRole() == 1) {// 如果为企业货主

			// 如果合同的协同状态为协同 查询合作伙伴
			if (cooperateStatus == 1) {
				// 获取合作伙伴 角色为物流公司
				params.put("partnerRole", 2);
				// 主机构为ID匹配 发起方或受理方数据归属编号
				params.put("orgRootId", rootOrgInfoId);
				orgList = orgInfoFacade.findPartnerEntrustOrShipper(params);
			} else if (cooperateStatus == 2) {
				// 角色必为物流公司
				params.put("orgRole", 2);
				// 不协同 查询组织角色为物流公司的组织机构
				params.put("cooperateState", 2);
				params.put("rootOrgInfoId", null);
				params.put("parentOrgInfoId", rootOrgInfoId);
				try {
					orgList = orgInfoFacade.findContractSubjectForPage(params);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}

		if (CollectionUtils.isNotEmpty(orgList)) {
			// 5、封装所属主机构
			List<Integer> rootOrgInfoIds = CommonUtils.getValueList(orgList, "rootOrgInfoId");
			List<OrgInfoPo> rootOrgInfos = orgInfoFacade.findOrgNameByIds(rootOrgInfoIds);
			// key:组织ID value:组织名称
			Map<Integer, String> rootOrgInfoMap = null;
			if (CollectionUtils.isNotEmpty(rootOrgInfos)) {
				rootOrgInfoMap = CommonUtils.listforMap(rootOrgInfos, "id", "orgName");
			}

			for (OrgInfoPo org : orgList) {
				// 封装所属机构
				if (MapUtils.isNotEmpty(rootOrgInfoMap) && rootOrgInfoMap.get(org.getRootOrgInfoId()) != null) {
					org.setRootOrgName(rootOrgInfoMap.get(org.getRootOrgInfoId()));
				}
			}
		}
		return orgList;
	}

	/**
	 * 承运方数量查询
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/getShipperCount")
	@ResponseBody
	public Integer getShipperCount(HttpServletRequest request, Model model) {

		// 合同协同状态
		Integer cooperateStatus = 1;
		if (StringUtils.isNotBlank(request.getParameter("cooperateStatus"))) {
			cooperateStatus = Integer.valueOf(request.getParameter("cooperateStatus"));
		}

		// 承运方名称
		String orgName = null;
		if (StringUtils.isNotBlank(request.getParameter("orgName"))) {
			orgName = request.getParameter("orgName");
		}

		Integer count = 0;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 查询参数
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("orgName", orgName);
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		// 如果是物流
		if (userInfo.getUserRole() == 2) {
			// 角色必为物流公司
			params.put("orgRole", 2);
			params.put("cooperateState", 1);
			params.put("rootOrgInfoId", rootOrgInfoId);
			try {
				count = orgInfoFacade.countContractSubjectForPage(params);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		// 如果为企业货主
		if (userInfo.getUserRole() == 1) {

			// 所属组织的协同状态 如果为协同 查询合作伙伴
			if (cooperateStatus == 1) {
				// 获取合作伙伴 角色为物流公司
				params.put("partnerRole", 2);
				// 主机构为ID匹配 发起方数据归属编号
				params.put("orgRootId", rootOrgInfoId);
				count = orgInfoFacade.countPartnerEntrustOrShipper(params);
			}
			// 不协同 查询组织角色为物流公司的组织机构
			if (cooperateStatus == 2) {
				try {
					// 角色必为物流公司
					params.put("orgRole", 2);
					// 查询角色为物流公司的组织
					params.put("cooperateState", 2);
					params.put("rootOrgInfoId", null);
					params.put("parentOrgInfoId", rootOrgInfoId);
					count = orgInfoFacade.countContractSubjectForPage(params);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		return count;
	}

	/**
	 * 提交审核/撤回/发送确认
	 * 
	 * @author zhangya
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/operateContractInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateContractInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		// 被操作的合同ID
		List<Integer> contractInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("contractInfoIds"))) {
			String contractInfoIds = request.getParameter("contractInfoIds").trim();
			String[] contractArray = contractInfoIds.split(",");
			if (contractArray.length > 0) {
				for (String contractIdStr : contractArray) {
					if (StringUtils.isNotBlank(contractIdStr)) {
						contractInfoIdList.add(Integer.valueOf(contractIdStr.trim()));
					}
				}
			}
		}

		// 所选合同不能为空
		if (CollectionUtils.isEmpty(contractInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选合同不能为空");
			return jo;
		}

		// 操作类型 2:提交审核 5:发送确认 6:撤回
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}

		try {
			jo = contractInfoFacade.operateContractInfo(userInfoId, rootOrgInfoId, contractInfoIdList, operateType);
		} catch (Exception e) {
			log.error("合同操作异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "操作合同服务异常，请稍后重试");
		}
		return jo;
	}

	/**
	 * 合同信息确认前校验
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/checkBeforeConfirm")
	@ResponseBody
	public JSONObject checkBeforeConfirm(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		// 合同ID校验
		Integer contractInfoId = null;
		if (StringUtils.isBlank(request.getParameter("contractInfoId"))) {
			jo.put("success", false);
			jo.put("msg", "要确认的合同信息不存在！");
			return jo;
		}
		contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Map<String, Integer> params = new HashMap<String, Integer>();
		params.put("orgRootId", userInfo.getOrgRootId());
		params.put("contractInfoId", contractInfoId);
		try {
			ContractInfo contractInfo = contractInfoFacade.getReceiveContractInfoById(params);
			if (contractInfo == null) {
				jo.put("success", false);
				jo.put("msg", "要确认的合同信息不存在！");
				return jo;
			}
			// 判断合同状态是否“新建”、“审核驳回”、“已撤回”、“已拒绝”状态
			if (contractInfo.getContractStatus() != 5) {
				jo.put("success", false);
				jo.put("msg", "合同已确认！");
				return jo;
			}
		} catch (Exception e) {
			log.error("查询单条接收合同信息异常", e);
			jo.put("success", false);
			jo.put("msg", "要确认的合同信息不存在！");
			return jo;
		}
		jo.put("success", true);
		jo.put("msg", "校验通过！");
		return jo;
	}

	/**
	 * 合同信息确认
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	// --- /contractInfo/contractInfoConfirm
	@RequestMapping("/contractInfoConfirm")
	@ResponseBody
	public JSONObject contractInfoConfirm(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		// 合同主ID
		Integer contractInfoId = null;
		if (StringUtils.isBlank(request.getParameter("contractInfoId"))) {
			jo.put("success", false);
			jo.put("msg", "要确认的合同信息不存在！");
			return jo;
		}
		contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		// 确认结果
		Integer result = null;
		if (StringUtils.isBlank(request.getParameter("result"))) {
			jo.put("success", false);
			jo.put("msg", "确认结果不能为空！");
			return jo;
		}
		result = Integer.valueOf(request.getParameter("result"));
		// 所属项目
		Integer projectId = null;
		if (StringUtils.isBlank(request.getParameter("projectId"))) {
			jo.put("success", false);
			jo.put("msg", "项目不能为空！");
			return jo;
		}
		projectId = Integer.valueOf(request.getParameter("projectId"));
		// 确认意见
		String confirmOpinion = null;
		if (StringUtils.isBlank(request.getParameter("confirmOpinion"))) {
			jo.put("success", false);
			jo.put("msg", "确认意见不能为空！");
			return jo;
		}
		confirmOpinion = request.getParameter("confirmOpinion");
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		try {
			jo = contractInfoFacade.contractConfirm(userInfo.getId(), userInfo.getOrgRootId(), userInfo.getUserRole(),
					contractInfoId, projectId, confirmOpinion, result);
		} catch (Exception e) {
			log.error("合同确认异常", e);
			jo.put("success", false);
			jo.put("msg", "合同确认异常！");
			return jo;
		}
		return jo;
	}

	/**
	 * 合同审核前校验
	 * 
	 * @author zhangya
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/checkBeforeAudit", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject checkBeforeAudit(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		// Integer createUser = userInfo.getId();

		// 被操作的合同ID
		List<Integer> contractInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("contractInfoIds"))) {
			String contractInfoIds = request.getParameter("contractInfoIds").trim();
			String[] contractArray = contractInfoIds.split(",");
			if (contractArray.length > 0) {
				for (String contractIdStr : contractArray) {
					if (StringUtils.isNotBlank(contractIdStr)) {
						contractInfoIdList.add(Integer.valueOf(contractIdStr.trim()));
					}
				}
			}
		}

		// 所选合同不能为空
		if (CollectionUtils.isEmpty(contractInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选合同不能为空");
			return jo;
		}
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("list", contractInfoIdList);
		// params.put("createUser", createUser);
		params.put("orgRootId", orgRootId);
		// 校验所选合同
		List<ContractInfo> contractInfoList = contractInfoFacade.findContractInfoByIds(params);

		if (CollectionUtils.isNotEmpty(contractInfoList)) {
			Map<Integer, ContractInfo> contractMap = CommonUtils.listforMap(contractInfoList, "id", null);
			ContractInfo contractInfo = null;
			for (Integer contractInfoId : contractInfoIdList) {
				contractInfo = contractMap.get(contractInfoId);
				// 如果为空直接跳过校验
				if (contractInfo == null) {
					continue;
				}
				if (contractInfo.getContractStatus() != 2) {
					jo.put("success", false);
					jo.put("msg", "合同已审核！");
					return jo;
				}
			}
		}

		jo.put("success", true);
		jo.put("msg", "校验通过");
		return jo;
	}

	/**
	 * 审核合同信息
	 * 
	 * @author zhangya
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/auditContractInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject auditContractInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		// 被操作的合同ID
		List<Integer> contractInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("contractInfoIds"))) {
			String contractInfoIds = request.getParameter("contractInfoIds").trim();
			String[] contractArray = contractInfoIds.split(",");
			if (contractArray.length > 0) {
				for (String contractIdStr : contractArray) {
					if (StringUtils.isNotBlank(contractIdStr)) {
						contractInfoIdList.add(Integer.valueOf(contractIdStr.trim()));
					}
				}
			}
		}

		// 所选合同不能为空
		if (CollectionUtils.isEmpty(contractInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选合同不能为空");
			return jo;
		}
		// 审核意见
		String opinion = request.getParameter("opinion");
		if (StringUtils.isBlank(opinion)) {
			jo.put("success", false);
			jo.put("msg", "审核意见不能为空！");
			return jo;
		}
		// 审核结果
		Integer result = null;
		if (StringUtils.isBlank(request.getParameter("result"))) {
			jo.put("success", false);
			jo.put("msg", "审核结果不能为空！");
			return jo;
		}
		result = Integer.valueOf(request.getParameter("result"));
		try {
			jo = contractInfoFacade.contractAudit(userInfoId, rootOrgInfoId, contractInfoIdList, opinion, result);
		} catch (Exception e) {
			log.error("合同审核异常", e);
			jo.put("success", false);
			jo.put("msg", "合同审核服务异常，请稍后重试!");
		}
		return jo;
	}

	/**
	 * 合同统一查询页面（仅用于展示）
	 * 
	 * @author zhangya 2017年6月26日 上午11:10:11
	 * @param request
	 * @return
	 */
	@RequiresPermissions("contract:inquire:view")
	@RequestMapping(value = "/showContractInfoPageForView", produces = "application/json; charset=utf-8")
	public String showContractInfoPageForView(HttpServletRequest request) {
		return "template/contract/show_contract_info_view_page";
	}

	/**
	 * 合同信息列表数据加载(仅用于查看)
	 * 
	 * @author zhangya 2017年6月26日 上午11:13:04
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/listContractInfoForView", produces = "application/json; charset=utf-8")
	public String listContractInfoForView(HttpServletRequest request, Model model) {
		DataPager<ContractInfo> contractInfoPager = new DataPager<ContractInfo>();
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		contractInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		contractInfoPager.setSize(rows);

		// 合同名称
		String contractName = null;
		if (params.get("contractName") != null) {
			contractName = params.get("contractName").toString();
		}
		// 合同编号
		String contractCode = null;
		if (params.get("contractCode") != null) {
			contractCode = params.get("contractCode").toString();
		}
		// 转包合同编号
		String subContractCode = null;
		if (params.get("subContractCode") != null) {
			subContractCode = params.get("subContractCode").toString();
		}
		// 委托方
		String entrustName = null;
		if (params.get("entrustName") != null) {
			entrustName = params.get("entrustName").toString();
		}
		// 承运方
		String shipperName = null;
		if (params.get("shipperName") != null) {
			shipperName = params.get("shipperName").toString();
		}
		// 合同状态
		Integer contractStatus = null;
		if (params.get("contractStatus") != null) {
			contractStatus = Integer.valueOf(params.get("contractStatus").toString());
		}
		// 合同分类
		Integer contractClassify = null;
		if (params.get("contractClassify") != null) {
			contractClassify = Integer.valueOf(params.get("contractClassify").toString());
		}
		// 合同类型
		Integer contractType = null;
		if (params.get("contractType") != null) {
			contractType = Integer.valueOf(params.get("contractType").toString());
		}
		// 合同创建时间(起始)
		String createTimeStart = null;
		if (params.get("createTimeStart") != null) {
			createTimeStart = params.get("createTimeStart").toString();
		}
		// 合同创建时间(截至)
		String createTimeEnd = null;
		if (params.get("createTimeEnd") != null) {
			createTimeEnd = params.get("createTimeEnd").toString();
		}
		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer parentOrgInfoId = userInfo.getParentOrgInfoId();
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 如果不是企业管理员则数据组织隔离
		if (userInfo.getOrgLevel() != 1) {
			Integer orgInfoId = userInfo.getOrgInfoId();
			List<Integer> orgInfoIdList = orgInfoFacade.findOrgInfoIdsByParentId(orgInfoId);
			if(userInfo.getOrgType() == 2){
				orgInfoIdList.add(parentOrgInfoId);
			}
			if (CollectionUtils.isNotEmpty(orgInfoIdList)) {
				queryMap.put("orgInfoIdList", orgInfoIdList);
			}
		}
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("contractName", contractName);
		queryMap.put("contractCode", contractCode);
		queryMap.put("entrustName", entrustName);
		queryMap.put("shipperName", shipperName);
		queryMap.put("contractStatus", contractStatus);
		queryMap.put("contractType", contractType);
		queryMap.put("contractClassify", contractClassify);
		queryMap.put("createTimeStart", createTimeStart);
		queryMap.put("createTimeEnd", createTimeEnd);
		queryMap.put("subContractCode", subContractCode);
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);

		Integer totalNum = contractInfoFacade.countContractInfoForPage(queryMap);
		List<ContractInfo> contractInfoList = contractInfoFacade.findContractInfoForPage(queryMap);
		if (CollectionUtils.isNotEmpty(contractInfoList)) {

			// 查询合同执行信息
			List<Integer> contractInfoIds = CommonUtils.getValueList(contractInfoList, "id");
			// key:合同ID value:执行信息
			Map<Integer, ContractInfo> performanceMap = null;
			if (CollectionUtils.isNotEmpty(contractInfoIds)) {
				Map<String, Object> paramsMap = new HashMap<String, Object>();
				paramsMap.put("list", contractInfoIds);
				paramsMap.put("orgRootId", orgRootId);
				List<ContractInfo> performanceInfos = contractInfoFacade.findContractPerformanceInfo(paramsMap);
				if (CollectionUtils.isNotEmpty(performanceInfos)) {
					performanceMap = CommonUtils.listforMap(performanceInfos, "id", null);
				}
			}
			BigDecimal ZERO = new BigDecimal(0);
			BigDecimal contractAmount =null;
			BigDecimal planAmount=null;
			BigDecimal executedAmount=null;
			BigDecimal completeAmount=null;
			BigDecimal uncompleteAmount=null;
			for (ContractInfo contractInfo : contractInfoList) {
				
				// 修改执行状态
				if (MapUtils.isNotEmpty(performanceMap) && performanceMap.get(contractInfo.getId()) != null) {
					//合同总量
					contractAmount = performanceMap.get(contractInfo.getId()).getContractAmount();
					//计划量
					planAmount = performanceMap.get(contractInfo.getId()).getPlanCount();
					//已开票(已完成量)
					completeAmount = performanceMap.get(contractInfo.getId()).getCompleteCount();
					//未完成量 = 总量 - 已完成
					uncompleteAmount =  contractAmount.subtract(completeAmount);
					//已执行量
					executedAmount = performanceMap.get(contractInfo.getId()).getExecutedAmount();
					contractInfo.setContractAmount(contractAmount);
					contractInfo.setExecutedAmount(executedAmount);
					contractInfo.setUnexecutedAmount(contractAmount.subtract(executedAmount));
					if(contractInfo.getContractStatus() == 8){
						if (planAmount.compareTo(ZERO)==1) {
							contractInfo.setContractStatus(10);//生成计划拉运量大于0 则 状态执行中
						}
						if (!(uncompleteAmount.compareTo(ZERO)==1)) {
							contractInfo.setContractStatus(11);// 合同执行完成
						}
					}
				}
			}
		}
		contractInfoPager.setTotal(totalNum);
		contractInfoPager.setRows(contractInfoList);
		model.addAttribute("contractInfoPager", contractInfoPager);
		return "template/contract/contract_info_data";
	}

	/**
	 * 转包合同查询页面
	 * 
	 * @author zhangya 2017年6月26日 上午11:10:11
	 * @param request
	 * @return
	 */
	@RequiresPermissions("contract:sub:view")
	@RequestMapping(value = "/showSubContractInfoPage", produces = "application/json; charset=utf-8")
	public String showSubContractInfoPage(HttpServletRequest request) {
		return "template/contract/show_sub_contract_info_page";
	}

	/**
	 * 合同主信息详情查看页
	 * 
	 * @author zhangya 2017年6月18日 下午12:43:50
	 * @param request
	 * @return
	 */
	@RequestMapping("/viewContractInfoPage")
	public String viewContractInfoPage(HttpServletRequest request, Model model) {
		// 合同ID
		Integer contractInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("contractInfoId"))) {
			contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		}
		// flag 标识发起或接收的合同
		Integer flag = 0;
		if (StringUtils.isNotBlank(request.getParameter("flag"))) {
			flag = Integer.valueOf(request.getParameter("flag"));
		}
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Map<String, Integer> params = new HashMap<String, Integer>();
		params.put("contractInfoId", contractInfoId);
		params.put("orgRootId", userInfo.getOrgRootId());
		ContractInfo contractInfo = null;
		if (flag == 1) {
			// 接收的合同
			contractInfo = contractInfoFacade.getReceiveContractInfoById(params);
		} else {
			// 发起的合同
			contractInfo = contractInfoFacade.getContractInfoById(params);
		}
		model.addAttribute("contractInfo", contractInfo);
		if (contractInfo.getContractClassify() != null && contractInfo.getContractClassify().equals(2)) {
			return "template/contract/view_sub_contract_info_page";
		}
		return "template/contract/view_contract_info_page";
	}

	/**
	 * 获取日志信息
	 * 
	 * @author zhangya 2017年6月27日 上午11:49:17
	 * @param request
	 * @return
	 */
	@RequestMapping("/getContractLogData")
	@ResponseBody
	@SuppressWarnings("rawtypes")
	public List getContractLogData(HttpServletRequest request) {
		Map<String, Object> params = this.paramsToMap(request);
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (StringUtils.isBlank(params.get("contractInfoId").toString())) {
			return null;
		}
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

		Integer contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		Map<String, Integer> queryMap = new HashMap<String, Integer>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("contractInfoId", contractInfoId);
		queryMap.put("orgRootId", userInfo.getOrgRootId());
		List<Map<String, Object>> logList = contractInfoFacade.findContractLogForPage(queryMap);
		if (CollectionUtils.isNotEmpty(logList)) {
			//
			List<Integer> userIds = CommonUtils.getValueList(logList, "person");

			List<UserInfo> userInfolist = userInfoFacade.findUserNameByIds(userIds);

			if (CollectionUtils.isNotEmpty(userInfolist)) {
				// 转为操作人名称
				Map<Integer, String> userMap = CommonUtils.listforMap(userInfolist, "id", "userName");
				for (Map<String, Object> log : logList) {
					log.put("person", userMap.get(log.get("person")));
				}
			}
		}

		return logList;
	}

	/**
	 * 获取日志信息数量
	 * 
	 * @author zhangya 2017年6月27日 上午11:49:17
	 * @param request
	 * @return
	 */
	@RequestMapping("/getContractLogCount")
	@ResponseBody
	public Integer getContractLogCount(HttpServletRequest request) {

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (StringUtils.isBlank(request.getParameter("contractInfoId"))) {
			return null;
		}
		Integer contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		Map<String, Integer> params = new HashMap<String, Integer>();
		params.put("contractInfoId", contractInfoId);
		params.put("orgRootId", userInfo.getOrgRootId());
		return contractInfoFacade.countContractLogForPage(params);
	}

	/**
	 * 获取合同信息
	 * 
	 * @author zhangya 2017年6月27日 下午8:24:35
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/getContractInfoData", produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<ContractInfo> getContractInfoData(HttpServletRequest request, Model model) {
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
		// 合同名称
		String contractName = null;
		if (queryMap.get("contractName") != null) {
			contractName = queryMap.get("contractName").toString();
		}

		// 查询已确认的合同
		queryMap.put("contractStatus", 8);

		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("contractName", contractName);

		// 如果不是企业管理员则数据组织隔离
		if (userInfo.getOrgLevel() != 1) {
			Integer orgInfoId = userInfo.getOrgInfoId();
			List<Integer> orgInfoIdList = orgInfoFacade.findOrgInfoIdsByParentId(orgInfoId);
			if (CollectionUtils.isNotEmpty(orgInfoIdList)) {
				queryMap.put("orgInfoIdList", orgInfoIdList);
			}
		}

		// 查询承运方为当前用户主机构的合同
		List<ContractInfo> contractInfoList = contractInfoFacade.findSubcontractedContractInfoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(contractInfoList)) {
			// 获取承运方主机id
			List<Integer> orgInfoIdList = CommonUtils.getValueList(contractInfoList, "shipperOrgRoot");
			// 封装成map key 机构id value 组织机构名称
			Map<Integer, String> orgInfoMap = null;
			if (CollectionUtils.isNotEmpty(orgInfoIdList)) {
				// 获取机构名称
				List<OrgInfoPo> orgInfoList = orgInfoFacade.findOrgNameByIds(orgInfoIdList);
				orgInfoMap = CommonUtils.listforMap(orgInfoList, "id", "orgName");
			}

			// 获取承运方项目id
			List<Integer> projectInfoIdList = CommonUtils.getValueList(contractInfoList, "shipperProject");
			// 封装成map key 项目id value项目名称
			Map<Integer, String> projectInfoMap = null;
			if (CollectionUtils.isNotEmpty(projectInfoIdList)) {
				// 获取项目信息
				List<ProjectInfoPo> projectInfoList = projectInfoFacade.findProjectInfoPoByIds(projectInfoIdList);
				projectInfoMap = CommonUtils.listforMap(projectInfoList, "id", "projectName");
			}

			for (ContractInfo contractInfo : contractInfoList) {
				// 封装承运方主机构名称
				if (contractInfo.getShipperOrgRoot() != null
						&& orgInfoMap.get(contractInfo.getShipperOrgRoot()) != null) {
					contractInfo.setShipperOrgRootName(orgInfoMap.get(contractInfo.getShipperOrgRoot()));
				}
				// 封装项目名称
				if (contractInfo.getShipperProject() != null
						&& orgInfoMap.get(contractInfo.getShipperOrgRoot()) != null) {
					contractInfo.setShipperProjectName(projectInfoMap.get(contractInfo.getShipperProject()));
				}

			}

		}
		return contractInfoList;
	}

	/**
	 * 获取合同信息数量
	 * 
	 * @author zhangya 2017年6月27日 下午8:24:35
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/getContractInfoCount", produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getContractInfoCount(HttpServletRequest request, Model model) {
		Map<String, Object> queryMap = this.paramsToMap(request);

		// 查询已确认的合同
		queryMap.put("contractStatus", 8);
		// 合同名称
		String contractName = null;
		if (queryMap.get("contractName") != null) {
			contractName = queryMap.get("contractName").toString();
		}

		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("contractName", contractName);
		return contractInfoFacade.countSubcontractedContractInfoForPage(queryMap);
	}

	/**
	 * 转包合同信息新增修改
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/addOrUpdateSubContractInfo")
	@ResponseBody
	public JSONObject addOrUpdateSubContractInfo(HttpServletRequest request, ContractInfoModel contractInfoModel) {
		JSONObject jo = new JSONObject();

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userInfoId = userInfo.getId();
		try {
			jo = contractInfoFacade.addOrUpdateSubContractInfo(contractInfoModel, rootOrgInfoId, orgInfoId, userInfoId);
		} catch (Exception e) {
			log.error("合同信息保存异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "合同信息保存服务异常，请稍后重试");
		}
		return jo;
	}

	/**
	 * 承运方信息查询
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/getShipperDataForSubContract")
	@ResponseBody
	public List<OrgInfoPo> getShipperDataForSubContract(HttpServletRequest request, Model model) {

		List<OrgInfoPo> orgList = null;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 前台传入的查询参数
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

		// 合同协同状态
		Integer cooperateStatus = 1;
		if (params.get("cooperateStatus") != null) {
			cooperateStatus = Integer.valueOf((String) params.get("cooperateStatus"));
		}

		// 承运方名称
		String orgName = null;
		if (StringUtils.isNotBlank(request.getParameter("orgName"))) {
			orgName = request.getParameter("orgName");
		}

		params.put("start", (page - 1) * rows);
		params.put("rows", rows);
		params.put("orgName", orgName);
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		// 如果合同的协同状态为协同 查询合作伙伴
		if (cooperateStatus == 1) {
			// 获取合作伙伴 角色为物流公司
			params.put("partnerRole", 2);
			// 主机构为ID匹配 发起方或受理方数据归属编号
			params.put("orgRootId", rootOrgInfoId);
			orgList = orgInfoFacade.findPartnerEntrustOrShipper(params);
		} else if (cooperateStatus == 2) {
			// 不协同 查询组织角色为物流公司的组织机构
			params.put("cooperateState", 2);
			params.put("parentOrgInfoId", rootOrgInfoId);
			// 角色必为物流公司
			params.put("orgRole", 2);
			try {
				orgList = orgInfoFacade.findContractSubjectForPage(params);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		if (CollectionUtils.isNotEmpty(orgList)) {
			// 5、封装所属主机构
			List<Integer> rootOrgInfoIds = CommonUtils.getValueList(orgList, "rootOrgInfoId");
			List<OrgInfoPo> rootOrgInfos = orgInfoFacade.findOrgNameByIds(rootOrgInfoIds);
			// key:组织ID value:组织名称
			Map<Integer, String> rootOrgInfoMap = null;
			if (CollectionUtils.isNotEmpty(rootOrgInfos)) {
				rootOrgInfoMap = CommonUtils.listforMap(rootOrgInfos, "id", "orgName");
			}

			for (OrgInfoPo org : orgList) {
				// 封装所属机构
				if (MapUtils.isNotEmpty(rootOrgInfoMap) && rootOrgInfoMap.get(org.getRootOrgInfoId()) != null) {
					org.setRootOrgName(rootOrgInfoMap.get(org.getRootOrgInfoId()));
				}
			}
		}
		return orgList;
	}

	/**
	 * 承运方数量查询
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/getShipperCountForSubContract")
	@ResponseBody
	public Integer getShipperCountForSubContract(HttpServletRequest request, Model model) {

		// 合同协同状态
		Integer cooperateStatus = 1;
		if (StringUtils.isNotBlank(request.getParameter("cooperateStatus"))) {
			cooperateStatus = Integer.valueOf(request.getParameter("cooperateStatus"));
		}

		// 承运方名称
		String orgName = null;
		if (StringUtils.isNotBlank(request.getParameter("orgName"))) {
			orgName = request.getParameter("orgName");
		}

		Integer count = null;
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 查询参数
		Map<String, Object> params = new HashMap<String, Object>();
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		params.put("orgName", orgName);

		// 如果合同的协同状态为协同 查询合作伙伴
		if (cooperateStatus == 1) {
			// 获取合作伙伴 角色为物流公司
			params.put("partnerRole", 2);
			// 主机构为ID匹配 发起方或受理方数据归属编号
			params.put("orgRootId", rootOrgInfoId);
			count = orgInfoFacade.countPartnerEntrustOrShipper(params);
		}
		// 不协同 查询组织角色为物流公司的组织机构
		if (cooperateStatus == 2) {
			try {
				// 查询角色为物流公司的组织
				params.put("orgRole", 2);
				params.put("cooperateState", 2);
				params.put("parentOrgInfoId", rootOrgInfoId);
				count = orgInfoFacade.countContractSubjectForPage(params);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return count;
	}

	/**
	 * 
	 * @author zhangya 2017年8月19日 下午1:23:59
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/viewContractInfoWithDetail")
	public String viewContractInfoWithDetail(HttpServletRequest request, Model model) {
		// 合同ID
		Integer contractInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("contractInfoId"))) {
			contractInfoId = Integer.valueOf(request.getParameter("contractInfoId"));
		}
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Map<String, Integer> params = new HashMap<String, Integer>();
		params.put("contractInfoId", contractInfoId);
		params.put("orgRootId", userInfo.getOrgRootId());
		ContractInfo contractInfo = null;
		contractInfo = contractInfoFacade.getContractInfoById(params);
		model.addAttribute("contractInfo", contractInfo);
		if (contractInfo.getContractClassify() != null && contractInfo.getContractClassify().equals(2)) {
		}
		return "template/contract/contract1";
	}
	
	
	/** 
	* @方法名: showBiddingDtailMationPage 
	* @作者: zhangshuai
	* @时间: 2017年9月15日 下午5:15:12
	* @返回值类型: String 
	* @throws 
	* 合同新增招标明细时，进入选择招标信息
	*/
	@RequestMapping(value="/showBiddingDtailMationPage")
	public String showBiddingDtailMationPage(HttpServletRequest request,HttpServletResponse response){
		return "template/contract/contract_add_bidding_detail_mation";
	}
	
	/** 
	* @方法名: findMyBidInfoMationAll 
	* @作者: zhangshuai
	* @时间: 2017年9月15日 下午6:35:16
	* @返回值类型: List<MyOfferDetailedPo> 
	* @throws 
	* 合同明细新增时全查我的中标信息
	*/
	@RequestMapping(value="/contractAddBiddingDetailMationList",produces="application/json;charset-utf-8")
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
		String status=request.getParameter("status");//确认中标
		//根据登录用户主机构ID，组织机构ID，登录用户角色查询我的报价明细信息表，中标状态为已中标
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("offerRole", userRole);//报价方角色
		params.put("status", status);//报价方角色
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
	* @方法名: findMyBidInfoMationAll 
	* @作者: zhangshuai
	* @时间: 2017年9月15日 下午6:35:16
	* @返回值类型: List<MyOfferDetailedPo> 
	* @throws 
	* 合同明细新增时全查我的中标信息
	*/
	@RequestMapping(value="/getContractAddBiddingDetailMationListCount",produces="application/json;charset-utf-8")
	@ResponseBody
	public Integer getContractAddBiddingDetailMationListCount(HttpServletRequest request,HttpServletResponse response){
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
		String status=request.getParameter("status");//确认中标
		//根据登录用户主机构ID，组织机构ID，登录用户角色查询我的报价明细信息表，中标状态为已中标
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("offerRole", userRole);//报价方角色
		params.put("status", status);//报价方角色
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
		Integer count=myOfferDetailedFacade.getMyBidInfoMationAllCount(params);
		
		return count;
	}
	
	/** 
	* @方法名: terminationContract 
	* @作者: zhangshuai
	* @时间: 2017年10月24日 下午6:20:26
	* @返回值类型: JSONObject 
	* @throws 
	* 终止合同
	*/
	@RequestMapping("/terminationContract")
	@ResponseBody
	public JSONObject terminationContract(HttpServletRequest request,HttpServletResponse response){
		
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		
		JSONObject jo=new JSONObject();
		
		//接收操作合同主id
		List<Integer> conIds=new ArrayList<Integer>();
		if(StringUtils.isNotBlank(request.getParameter("contractInfoIds"))){
			String[] conIdArray=request.getParameter("contractInfoIds").split(",");
			if(conIdArray.length>0){
				for (String conId : conIdArray) {
					conIds.add(Integer.parseInt(conId));
				}
			}
		}
		
		//根据合同id修改合同主状态
		jo=contractInfoFacade.updateContractStatusByConIds(conIds,userInfo.getId());
		
		return jo;
		
	}
	
}
