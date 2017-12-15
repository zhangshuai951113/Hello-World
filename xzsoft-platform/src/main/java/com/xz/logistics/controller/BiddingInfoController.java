package com.xz.logistics.controller;

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
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.BiddingInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.ProjectInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.logistics.utils.CodeAutoGenerater;
import com.xz.model.po.BiddingInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.ProjectInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.BiddingInfoModel;

/**
 * 招标信息管理
 * @author zhangya 2017年7月31日 下午6:37:48
 */
@Controller
@RequestMapping("/biddingInfo")
public class BiddingInfoController extends BaseController {

	@Resource
	private BiddingInfoFacade biddingInfoFacade;

	@Resource
	private OrgInfoFacade orgInfoFacade;

	@Resource
	private UserInfoFacade userInfoFacade;

	@Resource
	private ProjectInfoFacade projectInfoFacade;

	/**
	 * 招标信息管理页面
	 * 
	 * @author zhangya 2017年7月31日 下午6:47:37
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showBiddingInfoPage", produces = "application/json;charset=utf-8")
	public String showBiddingInfoPage(HttpServletRequest request, Model model) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 获取主机构下的组织
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		List<OrgInfoPo> orgInfoList = null;
		if (rootOrgInfoId != null) {
			orgInfoList = orgInfoFacade.getOrgInfosByRootOrgInfoId(rootOrgInfoId);
		}
		model.addAttribute("orgInfoList", orgInfoList);
		return "template/bidding/show_bidding_info_page";
	}

	/**
	 * 招标信息列表
	 * 
	 * @author zhangya 2017年7月31日 下午6:42:51
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/listBiddingInfoPage", produces = "application/json;charset=utf-8")
	public String listBiddingInfoPage(HttpServletRequest request, Model model) {

		DataPager<BiddingInfoPo> biddingInfoPager = new DataPager<BiddingInfoPo>();
		Map<String, Object> params = this.paramsToMap(request);

		// 封住查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		biddingInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		biddingInfoPager.setSize(rows);
		// 分页参数
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);

		// 招标名称
		String biddingName = null;
		if (params.get("biddingName") != null) {
			biddingName = params.get("biddingName").toString();
			queryMap.put("biddingName", biddingName);
		}
		// 招标编号
		String biddingCode = null;
		if (params.get("biddingCode") != null) {
			biddingCode = params.get("biddingCode").toString();
			queryMap.put("biddingCode", biddingCode);
		}
		// 发布时间(起始)
		String createTimeStart = null;
		if (params.get("createTimeStart") != null) {
			createTimeStart = params.get("createTimeStart").toString();
			queryMap.put("createTimeStart", createTimeStart);
		}
		// 发布时间(截至)
		String createTimeEnd = null;
		if (params.get("createTimeEnd") != null) {
			createTimeEnd = params.get("createTimeEnd").toString();
			queryMap.put("createTimeEnd", createTimeEnd);
		}
		
		String orgInfoId=request.getParameter("orgInfoId");
		queryMap.put("orgInfoId", orgInfoId);
		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		queryMap.put("orgRootId", orgRootId);

		Integer totalNum = biddingInfoFacade.countBiddingInfoForPage(queryMap);
		List<BiddingInfoPo> biddingInfoList = biddingInfoFacade.findBiddingInfoForPage(queryMap);

		if(CollectionUtils.isNotEmpty(biddingInfoList)){
			// 查询创建人
			List<Integer> userInfoIds = CommonUtils.getValueList(biddingInfoList, "createUser");
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
			// key:用户ID value:用户名
			Map<Integer, String> userInfoMap = null;
			if (CollectionUtils.isNotEmpty(userInfos)) {
				userInfoMap = CommonUtils.listforMap(userInfos, "id", "userName");
			}

			// 查询所属项目
			List<ProjectInfoPo> projectInfos = null;
			// key:项目ID value:项目名称
			Map<Integer, String> projectInfoMap = null;
			List<Integer> projectInfoIds = CommonUtils.getValueList(biddingInfoList, "biddingProject");
			if (CollectionUtils.isNotEmpty(projectInfoIds)) {
				projectInfos = projectInfoFacade.findProjectInfoPoByIds(projectInfoIds);

				if (CollectionUtils.isNotEmpty(projectInfos)) {
					projectInfoMap = CommonUtils.listforMap(projectInfos, "id", "projectName");
				}
			}

			// 查询招标单位（组织信息）
			List<Integer> orgInfoIds = CommonUtils.getValueList(biddingInfoList, "biddingOrg");
			List<OrgInfoPo> orgInfos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			// key:组织ID value:组织名称
			Map<Integer, String> orgInfoMap = null;
			if (CollectionUtils.isNotEmpty(orgInfos)) {
				orgInfoMap = CommonUtils.listforMap(orgInfos, "id", "orgName");
			}

			for (BiddingInfoPo biddingInfoPo : biddingInfoList) {
				// 封装创建人
				if (MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(biddingInfoPo.getCreateUser()) != null) {
					biddingInfoPo.setCreateUserName(userInfoMap.get(biddingInfoPo.getCreateUser()));
				}

				// 封装项目名称
				if (MapUtils.isNotEmpty(projectInfoMap) && projectInfoMap.get(biddingInfoPo.getBiddingProject()) != null) {
					biddingInfoPo.setBiddingProjectName(projectInfoMap.get(biddingInfoPo.getBiddingProject()));
				}

				// 封装招标单位
				if (MapUtils.isNotEmpty(orgInfoMap) && orgInfoMap.get(biddingInfoPo.getBiddingOrg()) != null) {
					biddingInfoPo.setBiddingOrgName(orgInfoMap.get(biddingInfoPo.getBiddingOrg()));
				}
			}
		}

		biddingInfoPager.setTotal(totalNum);
		biddingInfoPager.setRows(biddingInfoList);
		model.addAttribute("biddingInfoPager", biddingInfoPager);
		return "template/bidding/bidding_info_data";

	}

	/**
	 * 招标信息编辑页
	 * 
	 * @author zhangya 2017年7月31日 下午7:21:58
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/editBiddingInfoPage", produces = "application/json;charset=utf-8")
	public String editBiddingInfoPage(HttpServletRequest request, HttpServletResponse response, Model model) {

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 获取主机构下的组织
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		String operateTitle = "招标信息新增";
		BiddingInfoPo biddingInfoPo = null;
		if (StringUtils.isBlank(request.getParameter("biddingInfoId"))) {
			String biddingCode = CodeAutoGenerater.generaterCodeByFlag("ZB");
			biddingInfoPo = new BiddingInfoPo();
			biddingInfoPo.setBiddingCode(biddingCode);
		} else {
			operateTitle = "招标信息修改";
			Integer biddingInfoId = Integer.valueOf(request.getParameter("biddingInfoId"));
			Map<String, Integer> params = new HashMap<String, Integer>();
			params.put("orgRootId", rootOrgInfoId);
			params.put("biddingInfoId", biddingInfoId);
			biddingInfoPo = biddingInfoFacade.getBiddingInfoById(params);
		}

		List<OrgInfoPo> orgInfoList = null;
		if (rootOrgInfoId != null) {
			orgInfoList = orgInfoFacade.getOrgInfosByRootOrgInfoId(rootOrgInfoId);
		}
		model.addAttribute("orgInfoList", orgInfoList);
		model.addAttribute("operateTitle", operateTitle);
		model.addAttribute("biddingInfoPo", biddingInfoPo);
		return "template/bidding/edit_bidding_info_page";
	}

	/**
	 * 新增、修改招标信息
	 * 
	 * @author zhangya 2017年7月31日 下午7:21:58
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/saveBiddingInfo", produces = "application/json;charset=utf-8")
	@ResponseBody
	public JSONObject savaBiddingInfo(HttpServletRequest request, HttpServletResponse response,
			BiddingInfoModel biddingInfoModel) {
		JSONObject jo = new JSONObject();
		// 校验参数
		if (biddingInfoModel == null) {
			jo.put("success", false);
			jo.put("msg", "保存的招标信息无效！");
			return jo;
		}
		BiddingInfoPo biddingInfo = biddingInfoModel.getBiddingInfoPo();
		if (biddingInfo == null) {
			jo.put("success", false);
			jo.put("msg", "保存的招标信息无效！");
			return jo;
		}

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 获取主机构下的组织
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		// 根据ID判断执行行新增或修改
		if (biddingInfo.getId() == null) {
			jo = biddingInfoFacade.addBiddingInfo(biddingInfo, rootOrgInfoId, userInfoId);
			// 如果编号已存在返回一个新的编号
			if (jo.getInteger("flag") == 1) {
				String biddingCode="";
				try {
					biddingCode=CodeAutoGenerater.generaterCodeByFlag("ZB");
				} catch (Exception e) {
					
					//查询招标最大编号
					String biddingCodeNum=biddingInfoFacade.findMaxBiddingCode();
					String date = new SimpleDateFormat("yyyyMMdd").format(new Date());
					String codeKey = "ZB" + date;
					Integer currentNum = Integer.valueOf(biddingCodeNum.substring("ZB".length()+8)) + 1;
					NumberFormat formatter = NumberFormat.getNumberInstance();
					formatter.setMinimumIntegerDigits(4);
					formatter.setGroupingUsed(false);
					String currentNumStr = formatter.format(currentNum);
					biddingCode = codeKey + currentNumStr;
				}
				jo.put("biddingCode", biddingCode);
			}
		} else {
			jo = biddingInfoFacade.updateBiddingInfo(biddingInfo, rootOrgInfoId, userInfoId);
		}
		return jo;
	}

	/**
	 * 1:提交审核,2:审核前校验,3:删除 4回收报价 5提交中标单位审核 6中标单位审核
	 * 
	 * @author zhangya
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/operateBiddingInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateBiddingInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		// 被操作的招标ID
		List<Integer> biddingInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("biddingInfoIds"))) {
			String biddingInfoIds = request.getParameter("biddingInfoIds").trim();
			String[] biddingArray = biddingInfoIds.split(",");
			if (biddingArray.length > 0) {
				for (String biddingIdStr : biddingArray) {
					if (StringUtils.isNotBlank(biddingIdStr)) {
						biddingInfoIdList.add(Integer.valueOf(biddingIdStr.trim()));
					}
				}
			}
		}

		// 所选招标信息不能为空
		if (CollectionUtils.isEmpty(biddingInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选招标信息不能为空");
			return jo;
		}

		// 操作类型 1:提交审核 2:审核校验 3:删除 4回收报价 5提交中标单位审核 6中标单位审核
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}

		try {
			jo = biddingInfoFacade.operateBiddingInfo(userInfoId, rootOrgInfoId, biddingInfoIdList, operateType);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "招标管理操作异常，请稍后重试");
		}
		return jo;
	}

	/**
	 * 审核招标信息
	 * 
	 * @author zhangya 2017年8月7日 上午10:41:01
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/auditBiddingInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject auditBiddingInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		// 被操作的招标ID
		List<Integer> biddingInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("biddingInfoIds"))) {
			String biddingInfoIds = request.getParameter("biddingInfoIds").trim();
			String[] biddingArray = biddingInfoIds.split(",");
			if (biddingArray.length > 0) {
				for (String biddingIdStr : biddingArray) {
					if (StringUtils.isNotBlank(biddingIdStr)) {
						biddingInfoIdList.add(Integer.valueOf(biddingIdStr.trim()));
					}
				}
			}
		}

		// 所选招标信息不能为空
		if (CollectionUtils.isEmpty(biddingInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选招标信息不能为空");
			return jo;
		}

		// 所选招标信息不能为空
		if (StringUtils.isEmpty(request.getParameter("result"))) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "非法操作");
			return jo;
		}

		// 审核操作类型
		if (StringUtils.isEmpty(request.getParameter("operateType"))) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "无效操作");
			return jo;
		}
		Integer operateType = Integer.valueOf(request.getParameter("operateType"));
		Integer result = Integer.valueOf(request.getParameter("result"));
		String opinion = request.getParameter("opinion");
		try {
			jo = biddingInfoFacade.auditBiddingInfo(userInfoId, rootOrgInfoId, biddingInfoIdList, result, opinion,
					operateType);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "审核服务异常，请稍后重试");
		}
		return jo;
	}

	/**
	 * 回收报价
	 * 
	 * @author zhangya 2017年8月7日 上午10:41:01
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/collectQuotation", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject collectQuotation(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		// 被操作的招标ID
		List<Integer> biddingInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("biddingInfoIds"))) {
			String biddingInfoIds = request.getParameter("biddingInfoIds").trim();
			String[] biddingArray = biddingInfoIds.split(",");
			if (biddingArray.length > 0) {
				for (String biddingIdStr : biddingArray) {
					if (StringUtils.isNotBlank(biddingIdStr)) {
						biddingInfoIdList.add(Integer.valueOf(biddingIdStr.trim()));
					}
				}
			}
		}

		// 所选招标信息不能为空
		if (CollectionUtils.isEmpty(biddingInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选招标信息不能为空");
			return jo;
		}

		try {
			jo = biddingInfoFacade.collectQuotation(userInfoId, rootOrgInfoId, biddingInfoIdList);
		} catch (Exception e) {
			e.printStackTrace();
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "回收报价异常，请稍后重试");
		}
		return jo;
	}

	/**
	 * 二次挂网
	 * 
	 * @author zhangya 2017年8月15日 下午1:17:48
	 * @param request
	 * @param response
	 * @param biddingInfoModel
	 * @return
	 */
	@RequestMapping(value = "/saveBiddingInfoForRelease", produces = "application/json;charset=utf-8")
	@ResponseBody
	public JSONObject saveBiddingInfoForRelease(HttpServletRequest request, HttpServletResponse response,
			BiddingInfoModel biddingInfoModel) {
		JSONObject jo = new JSONObject();
		// 校验参数
		if (biddingInfoModel == null) {
			jo.put("success", false);
			jo.put("msg", "保存的招标信息无效！");
			return jo;
		}
		BiddingInfoPo biddingInfo = biddingInfoModel.getBiddingInfoPo();
		if (biddingInfo == null) {
			jo.put("success", false);
			jo.put("msg", "保存的招标信息无效！");
			return jo;
		}

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 获取主机构下的组织
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		if (biddingInfo.getId() == null) {
			jo.put("success", false);
			jo.put("msg", "保存的招标信息无效！");
			return jo;
		} else {
			jo = biddingInfoFacade.secondHangingNetwork(biddingInfo, rootOrgInfoId, userInfoId);
		}
		return jo;
	}

	/**
	 * 招标信息二次挂网编辑页
	 * 
	 * @author zhangya 2017年8月15日 下午1:25:14
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/editBiddingInfoPageForRelease", produces = "application/json;charset=utf-8")
	public String editBiddingInfoPageForRelease(HttpServletRequest request, HttpServletResponse response, Model model) {

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 获取主机构下的组织
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		String operateTitle = "招标信息二次挂网";
		BiddingInfoPo biddingInfoPo = null;
		Integer biddingInfoId = Integer.valueOf(request.getParameter("biddingInfoId"));
		Map<String, Integer> params = new HashMap<String, Integer>();
		params.put("orgRootId", rootOrgInfoId);
		params.put("biddingInfoId", biddingInfoId);
		biddingInfoPo = biddingInfoFacade.getBiddingInfoById(params);

		List<OrgInfoPo> orgInfoList = null;
		if (rootOrgInfoId != null) {
			orgInfoList = orgInfoFacade.getOrgInfosByRootOrgInfoId(rootOrgInfoId);
		}
		model.addAttribute("orgInfoList", orgInfoList);
		model.addAttribute("operateTitle", operateTitle);
		if (biddingInfoPo != null) {
			model.addAttribute("biddingInfoPo", biddingInfoPo);
		}
		return "template/bidding/edit_bidding_info_for_release_page";
	}
	
	/**
	 * 招标结果查询页面
	 *@author zhangya 2017年8月17日 下午1:21:32
	 *@param request
	 *@param model
	 *@return
	 */
	@RequestMapping(value = "/showBiddingResultInfoPage", produces = "application/json;charset=utf-8")
	public String showBiddingResultInfoPage(HttpServletRequest request, Model model) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 获取主机构下的组织
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		List<OrgInfoPo> orgInfoList = null;
		if (rootOrgInfoId != null) {
			orgInfoList = orgInfoFacade.getOrgInfosByRootOrgInfoId(rootOrgInfoId);
		}
		model.addAttribute("orgInfoList", orgInfoList);
		return "template/bidding/show_bidding_result_info_page";
	}

	/**
	 * 招标结果信息列表
	 * @author zhangya 2017年7月31日 下午6:42:51
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/listBiddingResultInfoPage", produces = "application/json;charset=utf-8")
	public String listBiddingResultInfoPage(HttpServletRequest request, Model model) {

		DataPager<BiddingInfoPo> biddingInfoPager = new DataPager<BiddingInfoPo>();
		Map<String, Object> params = this.paramsToMap(request);

		// 封住查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		biddingInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		biddingInfoPager.setSize(rows);
		// 分页参数
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);

		// 招标名称
		String biddingName = null;
		if (params.get("biddingName") != null) {
			biddingName = params.get("biddingName").toString();
			queryMap.put("biddingName", biddingName);
		}
		// 招标编号
		String biddingCode = null;
		if (params.get("biddingCode") != null) {
			biddingCode = params.get("biddingCode").toString();
			queryMap.put("biddingCode", biddingCode);
		}
		// 发布时间(起始)
		String createTimeStart = null;
		if (params.get("createTimeStart") != null) {
			createTimeStart = params.get("createTimeStart").toString();
			queryMap.put("createTimeStart", createTimeStart);
		}
		// 发布时间(截至)
		String createTimeEnd = null;
		if (params.get("createTimeEnd") != null) {
			createTimeEnd = params.get("createTimeEnd").toString();
			queryMap.put("createTimeEnd", createTimeEnd);
		}
		// 获取session用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		queryMap.put("orgRootId", orgRootId);

		Integer totalNum = biddingInfoFacade.countBiddingResultInfoForPage(queryMap);
		List<BiddingInfoPo> biddingInfoList = biddingInfoFacade.findBiddingResultInfoForPage(queryMap);

		if(CollectionUtils.isNotEmpty(biddingInfoList)){
			// 查询创建人
			List<Integer> userInfoIds = CommonUtils.getValueList(biddingInfoList, "createUser");
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
			// key:用户ID value:用户名
			Map<Integer, String> userInfoMap = null;
			if (CollectionUtils.isNotEmpty(userInfos)) {
				userInfoMap = CommonUtils.listforMap(userInfos, "id", "userName");
			}

			// 查询所属项目
			List<ProjectInfoPo> projectInfos = null;
			// key:项目ID value:项目名称
			Map<Integer, String> projectInfoMap = null;
			List<Integer> projectInfoIds = CommonUtils.getValueList(biddingInfoList, "biddingProject");
			if (CollectionUtils.isNotEmpty(projectInfoIds)) {
				projectInfos = projectInfoFacade.findProjectInfoPoByIds(projectInfoIds);

				if (CollectionUtils.isNotEmpty(projectInfos)) {
					projectInfoMap = CommonUtils.listforMap(projectInfos, "id", "projectName");
				}
			}

			// 查询招标单位（组织信息）
			List<Integer> orgInfoIds = CommonUtils.getValueList(biddingInfoList, "biddingOrg");
			List<OrgInfoPo> orgInfos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			// key:组织ID value:组织名称
			Map<Integer, String> orgInfoMap = null;
			if (CollectionUtils.isNotEmpty(orgInfos)) {
				orgInfoMap = CommonUtils.listforMap(orgInfos, "id", "orgName");
			}

			for (BiddingInfoPo biddingInfoPo : biddingInfoList) {
				// 封装创建人
				if (MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(biddingInfoPo.getCreateUser()) != null) {
					biddingInfoPo.setCreateUserName(userInfoMap.get(biddingInfoPo.getCreateUser()));
				}

				// 封装项目名称
				if (MapUtils.isNotEmpty(projectInfoMap) && projectInfoMap.get(biddingInfoPo.getBiddingProject()) != null) {
					biddingInfoPo.setBiddingProjectName(projectInfoMap.get(biddingInfoPo.getBiddingProject()));
				}

				// 封装招标单位
				if (MapUtils.isNotEmpty(orgInfoMap) && orgInfoMap.get(biddingInfoPo.getBiddingOrg()) != null) {
					biddingInfoPo.setBiddingOrgName(orgInfoMap.get(biddingInfoPo.getBiddingOrg()));
				}
			}
		}

		biddingInfoPager.setTotal(totalNum);
		biddingInfoPager.setRows(biddingInfoList);
		model.addAttribute("biddingInfoPager", biddingInfoPager);
		return "template/bidding/bidding_result_info_data";

	}


}
