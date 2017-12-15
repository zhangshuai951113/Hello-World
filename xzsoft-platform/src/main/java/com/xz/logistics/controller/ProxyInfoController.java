package com.xz.logistics.controller;

import java.io.IOException;
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
import com.xz.facade.api.ProxyInfoPoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.ProxyInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.ProxyInfoModel;

/**
 * 代理信息管理
 * 
 * @author zhangya 2017年7月6日 上午10:31:51
 */
@Controller
@RequestMapping("/proxyInfo")
public class ProxyInfoController extends BaseController {

	@Resource
	private ProxyInfoPoFacade proxyInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;

	/**
	 * 代理信息管理初始页
	 * 
	 * @author zhangya 2017年7月6日 上午10:34:57
	 * @param request
	 * @return
	 */
	@RequestMapping("/showProxyInfoPage")
	public String showProxyInfoPage(HttpServletRequest request) {
		return "template/proxy/show_proxy_info_page";
	}

	/**
	 * 代理信息列表
	 * 
	 * @author zhangya 2017年7月6日 上午10:41:21
	 * @param request
	 * @return
	 */
	@RequestMapping("/listProxyInfoPage")
	public String listProxyInfoPage(HttpServletRequest request, Model model) {
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		DataPager<ProxyInfoPo> proxyInfoPager = new DataPager<ProxyInfoPo>();

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 2、同时封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		proxyInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		proxyInfoPager.setSize(rows);

		// 代理人名称
		if (params.get("proxyName") != null) {
			String proxyName = params.get("proxyName").toString();
			queryMap.put("proxyName", proxyName);
		}
		// 证件号
		if (params.get("idCard") != null) {
			String idCard = params.get("idCard").toString();
			queryMap.put("idCard", idCard);
		}
		// 银行账号
		if (params.get("bankAccount") != null) {
			String bankAccount = params.get("bankAccount").toString();
			queryMap.put("bankAccount", bankAccount);
		}
		// 开户行
		if (params.get("bankName") != null) {
			String bankName = params.get("bankName").toString();
			queryMap.put("bankName", bankName);
		}
		// 证件类型
		if (params.get("cardType") != null) {
			Integer cardType = Integer.valueOf(params.get("cardType").toString());
			queryMap.put("cardType", cardType);
		}
		// 代理状态
		if (params.get("proxyStatus") != null) {
			Integer proxyStatus = Integer.valueOf(params.get("proxyStatus").toString());
			queryMap.put("proxyStatus", proxyStatus);
		}
		// 启用、停用
		if (params.get("isAvailable") != null) {
			Integer isAvailable = Integer.valueOf(params.get("isAvailable").toString());
			queryMap.put("isAvailable", isAvailable);
		}

		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", rootOrgInfoId);
		// 3、查询代理信息总数
		Integer totalNum = proxyInfoFacade.countProxyInfoPoForPage(queryMap);

		// 4、分页查询代理信息
		List<ProxyInfoPo> proxyInfoList = proxyInfoFacade.findProxyInfoPoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(proxyInfoList)) {
			// 5、查询创建人
			List<Integer> userInfoIds = CommonUtils.getValueList(proxyInfoList, "createUser");
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
			// key:用户ID value:用户名
			Map<Integer, String> userInfoMap = null;
			if (CollectionUtils.isNotEmpty(userInfos)) {
				userInfoMap = CommonUtils.listforMap(userInfos, "id", "userName");
			}

			for (ProxyInfoPo proxyInfoPo : proxyInfoList) {
				// 封装创建人
				if (MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(proxyInfoPo.getCreateUser()) != null) {
					proxyInfoPo.setCreateUserName(userInfoMap.get(proxyInfoPo.getCreateUser()));
				}
			}

		}

		// 7、总数、分页信息封装
		proxyInfoPager.setTotal(totalNum);
		proxyInfoPager.setRows(proxyInfoList);
		model.addAttribute("proxyInfoPager", proxyInfoPager);

		return "template/proxy/list_proxy_info_page";

	}

	/**
	 * 代理信息操作（1：启用:2：停用、3：提交审核、4：删除）
	 * 
	 * @author zhangya 2017年7月6日 上午10:41:53
	 * @return
	 */
	@RequestMapping(value = "/operateProxyInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject proxyInfoOperate(HttpServletRequest request) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		// 被操作的代理人ID
		List<Integer> proxyInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("proxyInfoIds"))) {
			String proxyInfoIds = request.getParameter("proxyInfoIds").trim();
			String[] proxyArray = proxyInfoIds.split(",");
			if (proxyArray.length > 0) {
				for (String proxyIdStr : proxyArray) {
					if (StringUtils.isNotBlank(proxyIdStr)) {
						proxyInfoIdList.add(Integer.valueOf(proxyIdStr.trim()));
					}
				}
			}
		}

		// 所选代理人不能为空
		if (CollectionUtils.isEmpty(proxyInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选代理人不能为空");
			return jo;
		}

		// 操作类型 2:提交审核 0:停用 1:启用
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}

		try {
			jo = proxyInfoFacade.operateProxyInfo(userInfoId, rootOrgInfoId, proxyInfoIdList, operateType);
		} catch (Exception e) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "代理人管理操作服务异常，请稍后重试");
		}
		return jo;
	}

	/**
	 * 代理信息编辑初始页
	 * 
	 * @author zhangya 2017年7月6日 上午10:34:57
	 * @param request
	 * @return
	 * @throws IOException
	 */
	@RequestMapping(value = "/editProxyInfoPage", produces = "application/json; charset=utf-8")
	public String editProxyInfoPage(HttpServletRequest request, Model model) {

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();

		String operateTitle = "";
		if (StringUtils.isBlank(request.getParameter("proxyInfoId"))) {
			operateTitle = "代理信息新增";
		} else {
			operateTitle = "代理信息修改";
			Integer proxyInfoId = Integer.valueOf(request.getParameter("proxyInfoId"));
			Map<String, Integer> params = new HashMap<String, Integer>();
			params.put("orgRootId", orgRootId);
			params.put("proxyInfoId", proxyInfoId);
			ProxyInfoPo proxyInfoPo = proxyInfoFacade.getProxyInfoPoById(params);
			model.addAttribute("proxyInfoPo", proxyInfoPo);
		}
		model.addAttribute("operateTitle", operateTitle);
		return "template/proxy/edit_proxy_info_page";
	}

	/**
	 * 保存代理信息
	 * 
	 * @author zhangya 2017年7月6日 上午10:34:57
	 * @param request
	 * @return
	 * @throws IOException
	 */
	@RequestMapping(value = "/addOrUpdateProxyInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateProxyInfo(HttpServletRequest request, ProxyInfoModel proxyInfoModel) {
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgRootId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		JSONObject jo = new JSONObject();
		
		if (proxyInfoModel == null) {
			jo.put("success", true);
			jo.put("msg", "保存的代理信息无效！");
			return jo;
		}
		try {
			return proxyInfoFacade.saveProxyInfo(orgRootId, orgInfoId, userInfoId, proxyInfoModel);
		} catch (Exception e) {
			e.printStackTrace();
			jo.put("success", true);
			jo.put("msg", "保存代理信息异常！");
			return jo;
		}
	}

	/**
	 * 代理信息审核、修改前校验
	 * 
	 * @author zhangya
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/checkBeforeOperate", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject checkBeforeAudit(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();

		// 被操作的代理人ID
		List<Integer> proxyInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("proxyInfoIds"))) {
			String proxyInfoIds = request.getParameter("proxyInfoIds").trim();
			String[] proxyArray = proxyInfoIds.split(",");
			if (proxyArray.length > 0) {
				for (String proxyIdStr : proxyArray) {
					if (StringUtils.isNotBlank(proxyIdStr)) {
						proxyInfoIdList.add(Integer.valueOf(proxyIdStr.trim()));
					}
				}
			}
		}

		// 所选代理人不能为空
		if (CollectionUtils.isEmpty(proxyInfoIdList)) {
			jo.put("success", false);
			jo.put("msg", "所选代理人不能为空");
			return jo;
		}

		// 操作类型 4:审核 5:修改
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		} else {
			jo.put("success", false);
			jo.put("msg", "操作无效！");
			return jo;
		}
		if (operateType != 4 && operateType != 5) {
			jo.put("success", false);
			jo.put("msg", "操作无效！");
			return jo;
		}
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("list", proxyInfoIdList);
		params.put("orgRootId", orgRootId);
		// 校验所选代理信息
		List<ProxyInfoPo> proxyInfoList = proxyInfoFacade.findProxyInfoPoByIds(params);

		if (CollectionUtils.isNotEmpty(proxyInfoList)) {
			Map<Integer, ProxyInfoPo> proxyMap = CommonUtils.listforMap(proxyInfoList, "id", null);
			ProxyInfoPo proxyInfoPo = null;
			for (Integer proxyInfoId : proxyInfoIdList) {
				proxyInfoPo = proxyMap.get(proxyInfoId);
				// 如果为空直接跳过校验
				if (proxyInfoPo == null) {
					continue;
				}
				if (operateType == 5) {
					if (proxyInfoPo.getProxyStatus() != 1 && proxyInfoPo.getProxyStatus() != 4) {
						jo.put("success", false);
						jo.put("msg", "代理信息已提交审核或已审核通过！");
						return jo;
					}
				} else {
					if (proxyInfoPo.getProxyStatus() != 2) {
						jo.put("success", false);
						jo.put("msg", "代理信息已提交审核或已审核通过！");
						return jo;
					}
				}
			}
		}
		jo.put("success", true);
		jo.put("msg", "校验通过");
		return jo;
	}

	/**
	 * 审核代理信息
	 * 
	 * @author zhangya
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/auditProxyInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject auditProxyInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userInfoId = userInfo.getId();

		// 被操作的代理人ID
		List<Integer> proxyInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("proxyInfoIds"))) {
			String proxyInfoIds = request.getParameter("proxyInfoIds").trim();
			String[] proxyArray = proxyInfoIds.split(",");
			if (proxyArray.length > 0) {
				for (String proxyIdStr : proxyArray) {
					if (StringUtils.isNotBlank(proxyIdStr)) {
						proxyInfoIdList.add(Integer.valueOf(proxyIdStr.trim()));
					}
				}
			}
		}

		// 所选代理人不能为空
		if (CollectionUtils.isEmpty(proxyInfoIdList)) {
			jo.put("success", false);
			jo.put("msg", "所选代理人不能为空");
			return jo;
		}

		// 审核意见
		String opinion = request.getParameter("opinion");
		// if (StringUtils.isBlank(opinion)) {
		// jo.put("success", false);
		// jo.put("msg", "审核意见不能为空！");
		// return jo;
		// }
		// 审核结果
		Integer result = null;
		if (StringUtils.isBlank(request.getParameter("result"))) {
			jo.put("success", false);
			jo.put("msg", "审核结果不能为空！");
			return jo;
		}
		result = Integer.valueOf(request.getParameter("result"));
		try {
			jo = proxyInfoFacade.auditProxyInfo(userInfoId, rootOrgInfoId, orgInfoId, proxyInfoIdList, opinion, result);
		} catch (Exception e) {
			e.printStackTrace();
			jo.put("success", false);
			jo.put("msg", "代理信息审核服务异常，请稍后重试!");
		}
		return jo;
	}

}
