package com.xz.logistics.controller;

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
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.OrgCancelApplyFacade;
import com.xz.facade.api.OrgDetailInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.OrgCancelApplyPo;
import com.xz.model.po.OrgDetailInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.OrgOperateLogPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.OrgModel;

/**
 * 组织机构
 * 
 * @author chengzhihuan 2017年5月15日
 *
 */

@Controller
@RequestMapping("/orgInfo")
public class OrgInfoController extends BaseController {

	private final Logger log = LoggerFactory.getLogger(getClass());

	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private OrgCancelApplyFacade orgCancelApplyFacade;
	@Resource
	private OrgDetailInfoFacade orgDetailInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;

	/**
	 * 完善主机构信息初始化页面
	 * 
	 * @author chengzhihuan 2017年5月15日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/rootOrgInfoInitPage")
	public String rootOrgInfoInitPage(HttpServletRequest request, Model model) {
		// 1、从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		// 2、根据主机构ID查询主机构详细信息
		OrgDetailInfoPo orgDetailInfo = orgDetailInfoFacade.getCurrentOrgDetailInfoByOrgInfoId(rootOrgInfoId);

		model.addAttribute("orgDetailInfo", orgDetailInfo);

		return "template/org/root_org_info_init_page";
	}

	/**
	 * 完善主机构信息
	 * 
	 * @author chengzhihuan 2017年5月15日
	 * @param request
	 * @param orgModel
	 * @return
	 */
	@RequestMapping(value = "/updateRootOrgInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject updateRootOrgInfo(HttpServletRequest request, OrgModel orgModel) {
		// 1、从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		JSONObject jo = null;

		try {

			// 2、根据主机构ID更新主机构信息
			jo = orgInfoFacade.updateRootOrgInfo(orgModel, rootOrgInfoId, userInfoId);

		} catch (Exception e) {
			log.error("保存主机构信息异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "保存主机构服务繁忙，请稍后重试");
		}

		return jo;
	}

	/**
	 * 申请注销主机构
	 * 
	 * @author chengzhihuan 2017年5月16日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/applyCancelRootOrgInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject applyCancelRootOrgInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();

		// 注销原因
		String cancelReason = request.getParameter("cancelReason");
		// 附件(公司盖章)
		String attachment = request.getParameter("attachment");
		// 从session中取出当前用户的主机构ID、机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer userInfoId = userInfo.getId();

		// 1、校验参数完整性
		if (StringUtils.isBlank(cancelReason)) {
			jo.put("success", false);
			jo.put("msg", "注销原因必须填写");
			return jo;
		}

		if (StringUtils.isBlank(attachment)) {
			jo.put("success", false);
			jo.put("msg", "注销必须上传公司盖章附件");
			return jo;
		}

		// 2、保存申请注销主机构信息
		OrgCancelApplyPo cancelPo = new OrgCancelApplyPo();
		cancelPo.setOrgInfoId(rootOrgInfoId);
		cancelPo.setApplyUser(userInfoId);
		cancelPo.setApplyTime(Calendar.getInstance().getTime());
		cancelPo.setApplyOrgInfoId(orgInfoId);
		cancelPo.setCancelReason(cancelReason.trim());
		cancelPo.setAttachment(attachment.trim());
		try {
			orgCancelApplyFacade.addOrgCancelApply(cancelPo);

			jo.put("success", true);
			jo.put("msg", "申请主机构注销成功");
		} catch (Exception e) {
			log.error("申请主机构注销异常", e);

			jo.put("success", false);
			jo.put("msg", "申请主机构注销服务繁忙，请稍后重试");
		}

		return jo;
	}

	/**
	 * 子机构与部门信息查询初始页
	 * 
	 * @author chengzhihuan 2017年5月16日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showOrgInfoListPage")
	public String showOrgInfoListPage(HttpServletRequest request, Model model) {
		return "template/org/show_org_info_list_page";
	}

	/**
	 * 子机构与部门信息查询
	 * 
	 * @author chengzhihuan 2017年5月16日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/listOrgInfo")
	public String listOrgInfo(HttpServletRequest request, Model model) {
		DataPager<OrgInfoPo> orgInfoPager = new DataPager<OrgInfoPo>();

		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		orgInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		orgInfoPager.setSize(rows);

		// 组织名称
		String orgName = null;
		if (params.get("orgName") != null) {
			orgName = params.get("orgName").toString();
		}
		// 统一社会信用代码
		String creditCode = null;
		if (params.get("creditCode") != null) {
			creditCode = params.get("creditCode").toString();
		}
		// 启用状态
		Integer isAvailable = null;
		if (params.get("isAvailable") != null) {
			isAvailable = Integer.valueOf(params.get("isAvailable").toString());
		}
		// 组织类型
		Integer orgType = null;
		if (params.get("orgType") != null) {
			orgType = Integer.valueOf(params.get("orgType").toString());
		}
		// 审核状态
		Integer orgStatus = null;
		if (params.get("orgStatus") != null) {
			orgStatus = Integer.valueOf(params.get("orgStatus").toString());
		}

		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("rootOrgInfoId", rootOrgInfoId);
		queryMap.put("orgName", orgName);
		queryMap.put("creditCode", creditCode);
		queryMap.put("isAvailable", isAvailable);
		queryMap.put("orgType", orgType);
		queryMap.put("orgStatus", orgStatus);

		// 3、查询组织信息总数
		Integer totalNum = orgInfoFacade.countOrgInfoForPage(queryMap);

		// 4、分页查询组织信息
		List<OrgInfoPo> orgInfoList = orgInfoFacade.findOrgInfoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(orgInfoList)) {
			// 5、封装所属机构
			List<Integer> parentOrgInfoIds = CommonUtils.getValueList(orgInfoList, "parentOrgInfoId");
			List<OrgInfoPo> parentOrgInfos = orgInfoFacade.findOrgNameByIds(parentOrgInfoIds);
			// key:组织ID value:组织名称
			Map<Integer, String> parentOrgInfoMap = null;
			if (CollectionUtils.isNotEmpty(parentOrgInfos)) {
				parentOrgInfoMap = CommonUtils.listforMap(parentOrgInfos, "id", "orgName");
			}

			// 6、查询创建人
			List<Integer> userInfoIds = CommonUtils.getValueList(orgInfoList, "createUser");
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
			// key:用户ID value:用户名
			Map<Integer, String> userInfoMap = null;
			if (CollectionUtils.isNotEmpty(userInfos)) {
				userInfoMap = CommonUtils.listforMap(userInfos, "id", "userName");
			}

			for (OrgInfoPo org : orgInfoList) {
				// 封装所属机构
				if (MapUtils.isNotEmpty(parentOrgInfoMap) && parentOrgInfoMap.get(org.getParentOrgInfoId()) != null) {
					org.setParentOrgName(parentOrgInfoMap.get(org.getParentOrgInfoId()));
				}

				// 封装创建人
				if (MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(org.getCreateUser()) != null) {
					org.setCreateUserName(userInfoMap.get(org.getCreateUser()));
				}
			}

		}

		// 7、总数、分页信息封装
		orgInfoPager.setTotal(totalNum);
		orgInfoPager.setRows(orgInfoList);
		model.addAttribute("orgInfoPager", orgInfoPager);

		return "template/org/org_info_data";
	}

	/**
	 * 是否是子机构
	 * 
	 * @author chengzhihuan 2017年5月22日
	 * @param request
	 * @param orgModel
	 * @return
	 */
	@RequestMapping(value = "/isSubOrg", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject isSubOrg(HttpServletRequest request, OrgModel orgModel) {
		JSONObject jo = new JSONObject();

		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		// 子机构ID
		Integer orgInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("orgInfoId"))) {
			orgInfoId = Integer.valueOf(request.getParameter("orgInfoId"));
		}

		// 校验参数是否为空
		if (orgInfoId == null) {
			jo.put("success", false);
			jo.put("msg", "组织ID不能为空");
			return jo;
		}

		// 校验是否在操作主机构
		if (orgInfoId.equals(rootOrgInfoId)) {
			jo.put("success", false);
			jo.put("msg", "非法操作");
			return jo;
		}

		// 根据机构ID、主机构ID查询机构是否为子机构
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("rootOrgInfoId", rootOrgInfoId);
		params.put("orgInfoId", orgInfoId);
		boolean isSubOrg = orgInfoFacade.isSubOrg(params);

		jo.put("success", true);
		// 设置是否为子机构属性
		if (isSubOrg) {
			jo.put("isSubOrg", true);
		} else {
			jo.put("isSubOrg", false);
		}

		return jo;
	}

	/**
	 * 新增/编辑部门初始页
	 * 
	 * @author chengzhihuan 2017年5月16日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initDepartmentPage")
	public String initDepartmentPage(HttpServletRequest request, Model model) {
		// 取出操作类型(1:新增 2:编辑)
		String operateType = request.getParameter("operateType");

		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		String operateTitle = "";

		if ("2".equals(operateType)) {
			// 部门ID
			Integer orgInfoId = null;
			if (StringUtils.isNotBlank(request.getParameter("orgInfoId"))) {
				orgInfoId = Integer.valueOf(request.getParameter("orgInfoId"));
			}

			// 根据组织ID、主机构ID查询组织信息
			Map<String, Object> queryMap = new HashMap<String, Object>();
			queryMap.put("rootOrgInfoId", rootOrgInfoId);
			queryMap.put("orgInfoId", orgInfoId);
			OrgInfoPo orgInfo = orgInfoFacade.getOrgInfoByOrgIdAndRootOrgId(queryMap);

			if (orgInfo != null && orgInfo.getOrgDetailInfo() != null) {
				orgInfo.getOrgDetailInfo().setOrgInfoId(orgInfo.getId());
				orgInfo.getOrgDetailInfo().setParentOrgInfoId(orgInfo.getParentOrgInfoId());
				model.addAttribute("orgDetailInfo", orgInfo.getOrgDetailInfo());
			}

			operateTitle = "编辑部门";
		} else {
			operateTitle = "新增部门";
		}

		model.addAttribute("operateTitle", operateTitle);

		// 查询该主机构下的所有1级与2级机构信息，按照主键ID正序
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("parentOrgInfoId", rootOrgInfoId);
		params.put("orgType", 1);
		List<OrgInfoPo> parentOrgInfoList = orgInfoFacade.findRootAndSubOrgInfo(params);
		model.addAttribute("parentOrgInfoList", parentOrgInfoList);

		return "template/org/init_department_page";
	}

	/**
	 * 新增/修改部门
	 * 
	 * @author chengzhihuan 2017年5月16日
	 * @param request
	 * @param orgModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateDepartment", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateDepartment(HttpServletRequest request, OrgModel orgModel) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		try {
			jo = orgInfoFacade.addOrUpdateDepartment(orgModel, rootOrgInfoId, userInfoId);
		} catch (Exception e) {
			log.error("维护部门信息异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "维护部门信息服务异常，请稍后重试");
		}

		return jo;
	}

	/**
	 * 新增/编辑子机构初始页
	 * 
	 * @author chengzhihuan 2017年5月17日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initSubOrgInfoPage")
	public String updateSubOrgInfoPage(HttpServletRequest request, Model model) {
		// 取出操作类型(1:新增 2:编辑)
		String operateType = request.getParameter("operateType");

		if ("2".equals(operateType)) {
			// 从session中取出当前用户的主机构ID、用户ID
			UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
			Integer rootOrgInfoId = userInfo.getOrgRootId();

			// 子机构ID
			Integer orgInfoId = null;
			if (StringUtils.isNotBlank(request.getParameter("orgInfoId"))) {
				orgInfoId = Integer.valueOf(request.getParameter("orgInfoId"));
			}

			// 根据组织ID、主机构ID查询组织信息
			Map<String, Object> queryMap = new HashMap<String, Object>();
			queryMap.put("rootOrgInfoId", rootOrgInfoId);
			queryMap.put("orgInfoId", orgInfoId);
			OrgInfoPo orgInfo = orgInfoFacade.getOrgInfoByOrgIdAndRootOrgId(queryMap);

			if (orgInfo != null && orgInfo.getOrgDetailInfo() != null) {
				orgInfo.getOrgDetailInfo().setOrgInfoId(orgInfo.getId());
				model.addAttribute("orgDetailInfo", orgInfo.getOrgDetailInfo());
			}
		}

		return "template/org/init_sub_org_info_page";
	}

	/**
	 * 新增/修改子机构
	 * 
	 * @author chengzhihuan 2017年5月17日
	 * @param request
	 * @param orgModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateSubOrgInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateSubOrgInfo(HttpServletRequest request, OrgModel orgModel) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		try {
			jo = orgInfoFacade.addOrUpdateSubOrgInfo(orgModel, rootOrgInfoId, userInfoId);
		} catch (Exception e) {
			log.error("维护子机构信息异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "维护子机构信息服务异常，请稍后重试");
		}

		return jo;
	}

	/**
	 * 启用/停用/注销子机构
	 * 
	 * @author chengzhihuan 2017年5月17日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/operateSubOrgInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateSubOrgInfo(HttpServletRequest request) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer operateOrgInfoId = userInfo.getOrgInfoId();
		Integer userInfoId = userInfo.getId();

		// 子机构ID
		Integer orgInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("orgInfoId"))) {
			orgInfoId = Integer.valueOf(request.getParameter("orgInfoId"));
		}
		// 操作类型 1:启用 2:停用 3:注销
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}
		// 原因
		String operateReason = request.getParameter("operateReason");

		// 根据子机构ID进行启用或停用操作
		OrgOperateLogPo orgLogPo = new OrgOperateLogPo();
		orgLogPo.setOrgInfoId(orgInfoId);
		orgLogPo.setOperateUser(userInfoId);
		orgLogPo.setOperateTime(Calendar.getInstance().getTime());
		orgLogPo.setOperateOrgInfoId(operateOrgInfoId);
		orgLogPo.setOperateReason(operateReason);
		orgLogPo.setOperateType(operateType);

		try {
			jo = orgInfoFacade.operateOrgInfoStatus(orgLogPo, rootOrgInfoId);
		} catch (Exception e) {
			log.error("启用/停用/注销子机构异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "操作子机构服务异常，请稍后重试");
		}

		return jo;
	}

	/**
	 * 删除部门/子机构
	 * 
	 * @author chengzhihuan 2017年5月17日
	 * @param request
	 * @param orgModel
	 * @return
	 */
	@RequestMapping(value = "/deleteOrgInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteOrgInfo(HttpServletRequest request, OrgModel orgModel) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		// 组织ID
		Integer orgInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("orgInfoId"))) {
			orgInfoId = Integer.valueOf(request.getParameter("orgInfoId"));
		}

		try {
			// 删除组织信息
			jo = orgInfoFacade.deleteOrgInfoById(orgInfoId, rootOrgInfoId, userInfoId);
		} catch (Exception e) {
			log.error("删除组织信息异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "删除组织信息服务异常，请稍后重试");
		}
		return jo;
	}

	/**
	 * 组机构信息审核列表
	 * 
	 * @author zhangya 2017年5月18日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = { "/listRootOrgInfo" }, produces = { "application/json; charset=utf-8" })
	@ResponseBody
	public JSONObject listRootOrgInfoForAudit(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();

		// Integer userRole = (Integer)
		// request.getSession().getAttribute("userRole");
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 校验当前用户是否平台管理员
		if (userInfo.getUserRole() != 5) {
			jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "“非法操作”");
			return jo;
		}

		Map<String, Object> params = paramsToMap(request);

		Integer page = Integer.valueOf(1);
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}

		Integer rows = Integer.valueOf(10);
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}

		String orgName = null;
		if (params.get("orgName") != null) {
			orgName = params.get("orgName").toString();
		}

		Integer orgStatus = null;
		if (params.get("orgStatus") != null) {
			orgStatus = Integer.valueOf(params.get("orgStatus").toString());
		}

		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", Integer.valueOf((page.intValue() - 1) * rows.intValue()));
		queryMap.put("rows", rows);
		queryMap.put("orgName", orgName);
		queryMap.put("orgStatus", orgStatus);

		Integer totalNum = this.orgInfoFacade.countRootOrgInfoForPage(queryMap);

		List<OrgInfoPo> rootOrgInfoList = this.orgInfoFacade.findRootOrgInfoForPage(queryMap);

		jo.put("totalNum", totalNum);
		jo.put("orgInfoList", rootOrgInfoList);
		return jo;
	}

	/**
	 * 主机构审核初始页
	 * 
	 * @author zhangya 2017年5月23日 上午11:51:16
	 * @param request
	 * @return
	 */
	@RequestMapping("/orgInfoForAuditPage")
	public String OrgInfoForAuditPage(HttpServletRequest request, Model model) {

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 校验当前用户是否平台管理员
		if (userInfo.getUserRole() != 5) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "您不是平台管理员，不能进行注册审核操作！");
			model.addAttribute("content", jo);
			return "template/org/prompt_box_page";
		}
		return "template/org/org_info_for_audit_page";
	}

	/**
	 * 主机构注销申请审核列表
	 * 
	 * @author zhangya 2017年5月22日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/orgInfoForAuditData")
	public String ListOrgInfoForAudit(HttpServletRequest request, Model model) {
		DataPager<OrgInfoPo> orgInfoPoPager = new DataPager<OrgInfoPo>();
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		orgInfoPoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		orgInfoPoPager.setSize(rows);

		// 组织名称
		String orgName = null;
		if (params.get("orgName") != null) {
			orgName = params.get("orgName").toString();
		}

		// 组织名称
		String orgStatus = null;
		if (params.get("orgStatus") != null) {
			orgStatus = params.get("orgStatus").toString();
		}

		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgName", orgName);
		queryMap.put("orgStatus", orgStatus);

		// 3、查询组织信息总数
		Integer totalNum = orgInfoFacade.countRootOrgInfoForPage(queryMap);

		// 4、分页查询组织信息
		List<OrgInfoPo> orgInfoPos = orgInfoFacade.findRootOrgInfoForPage(queryMap);

		// 7、总数、分页信息封装
		orgInfoPoPager.setTotal(totalNum);
		orgInfoPoPager.setRows(orgInfoPos);
		model.addAttribute("orgInfoPoPager", orgInfoPoPager);
		return "template/org/org_info_for_audit_data";
	}

	/**
	 * 审核操作权限校验
	 * 
	 * @author zhangya 2017年5月18日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = { "/checkBeforeAudit" }, produces = { "application/json; charset=utf-8" })
	@ResponseBody
	public JSONObject checkBeforeAuditRootOrgInfo(HttpServletRequest request) {
		JSONObject jo = new JSONObject();

		// Integer userRole = (Integer)
		// request.getSession().getAttribute("userRole");
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 校验当前用户是否平台管理员
		if (userInfo.getUserRole() != 5) {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "非法操作");
		} else {
			jo.put("success", Boolean.valueOf(true));
			jo.put("msg", "");
		}
		return jo;
	}

	/**
	 * 主机构信息审核
	 * 
	 * @author zhangya 2017年5月18日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = { "/auditRootOrgInfo" }, produces = { "application/json; charset=utf-8" })
	@ResponseBody
	public JSONObject auditRootOrgInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = null;
		// 校验当前用户是否平台管理员
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (userInfo.getUserRole() != 5) {
			jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "“非法操作”");
			return jo;
		}
		// 审核意见非空校验
		if (StringUtils.isBlank(request.getParameter("auditOpinion"))) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "审核意见必须填写");
			return jo;
		}
		Map<String, Object> params = new HashMap<String, Object>();
		String auditOpinion = (String) request.getParameter("auditOpinion");
		Integer orgStatus = Integer.parseInt(request.getParameter("orgStatus"));
		System.out.println(request.getParameter("orgInfoId"));
		Integer orgInfoId = Integer.parseInt(request.getParameter("orgInfoId"));
		params.put("auditOpinion", auditOpinion);
		params.put("orgStatus", orgStatus);
		params.put("orgInfoId", orgInfoId);
		params.put("auditUser", userInfo.getId());
		params.put("auditTime", Calendar.getInstance().getTime());
		try {
			jo = orgInfoFacade.auditRootOrgInfo(params);
		} catch (Exception e) {
			this.log.error("保存主机构信息异常", e);
			jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "保存主机构服务繁忙，请稍后重试");
		}
		return jo;
	}

	/**
	 * 主机构注销申请审核查询初始页
	 * 
	 * @author zhangya 2017年5月22日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/showOrgCancelApplyPoListPage")
	public String showOrgCancelApplyPoListPage(HttpServletRequest request, Model model) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 校验当前用户是否平台管理员
		if (userInfo.getUserRole() != 5) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "您不是平台管理员，不能进行注销审核操作！");
			model.addAttribute("content", jo);
			return "template/org/prompt_box_page";
		}
		return "template/org/org_cancel_apply_po_for_audit_page";
	}

	/**
	 * 主机构注销申请审核列表
	 * 
	 * @author 张亚 2017年5月22日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/listOrgCancelApplyInfo")
	public String listOrgCancelApplyInfo(HttpServletRequest request, Model model) {
		DataPager<OrgCancelApplyPo> orgCancelApplyPoPager = new DataPager<OrgCancelApplyPo>();
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		orgCancelApplyPoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		orgCancelApplyPoPager.setSize(rows);

		// 组织名称
		String orgName = null;
		if (params.get("orgName") != null) {
			orgName = params.get("orgName").toString();
		}

		Map<String, String> paramsMap = new HashMap<String, String>();
		paramsMap.put("orgName", orgName);
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);

		// 3、查询组织信息总数（初始值）
		Integer totalNum = orgCancelApplyFacade.countOrgCancelApplyPoForPage(params);
		// 4、分页查询组织信息
		List<OrgCancelApplyPo> orgCancelApplyPolist = orgCancelApplyFacade.findOrgCancelApplyPoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(orgCancelApplyPolist)) {

			// 6、查询申请机构 (申请机构)
			List<Integer> applyOrgInfoIds = CommonUtils.getValueList(orgCancelApplyPolist, "orgInfoId");
			// key:申请机构ID value:申请机构名称
			Map<Integer, String> applyOrgInfoMap = null;
			if (CollectionUtils.isNotEmpty(applyOrgInfoIds)) {
				List<OrgInfoPo> applyOrgInfoList = orgInfoFacade.findOrgNameByIds(applyOrgInfoIds);
				if (CollectionUtils.isNotEmpty(applyOrgInfoList)) {
					applyOrgInfoMap = CommonUtils.listforMap(applyOrgInfoList, "id", "orgName");
				}
			}

			// 7、查询申请人
			List<Integer> applyUserIds = CommonUtils.getValueList(orgCancelApplyPolist, "applyUser");
			// key:用户ID value:用户名
			Map<Integer, String> applyUserInfoMap = null;
			if (CollectionUtils.isNotEmpty(applyUserIds)) {
				List<UserInfo> applyUserInfos = userInfoFacade.findUserNameByIds(applyUserIds);
				if (CollectionUtils.isNotEmpty(applyUserInfos)) {
					applyUserInfoMap = CommonUtils.listforMap(applyUserInfos, "id", "userName");
				}
			}
			// 8、查询审核人人
			List<Integer> auditPersonIds = CommonUtils.getValueList(orgCancelApplyPolist, "auditPerson");
			// key:用户ID value:用户名
			Map<Integer, String> auditPersonMap = null;
			if (CollectionUtils.isNotEmpty(auditPersonIds)) {
				List<UserInfo> auditPersons = userInfoFacade.findUserNameByIds(auditPersonIds);
				if (CollectionUtils.isNotEmpty(auditPersons)) {
					auditPersonMap = CommonUtils.listforMap(auditPersons, "id", "userName");
				}
			}

			for (OrgCancelApplyPo orgCancelApplyPo : orgCancelApplyPolist) {
				// 封装申请机构名称
				if (MapUtils.isNotEmpty(applyOrgInfoMap)
						&& applyOrgInfoMap.get(orgCancelApplyPo.getApplyOrgInfoId()) != null) {
					orgCancelApplyPo.setApplyOrgInfoName(applyOrgInfoMap.get(orgCancelApplyPo.getApplyOrgInfoId()));
				}
				// 封装申请人
				if (MapUtils.isNotEmpty(applyUserInfoMap)
						&& applyUserInfoMap.get(orgCancelApplyPo.getApplyUser()) != null) {
					orgCancelApplyPo.setApplyUserName(applyUserInfoMap.get(orgCancelApplyPo.getApplyUser()));
				}
				// 封装审核人
				if (MapUtils.isNotEmpty(auditPersonMap)
						&& auditPersonMap.get(orgCancelApplyPo.getAuditPerson()) != null) {
					orgCancelApplyPo.setAuditPersonName(auditPersonMap.get(orgCancelApplyPo.getAuditPerson()));
				}
			}

			// 7、总数、分页信息封装
			orgCancelApplyPoPager.setTotal(totalNum);
			orgCancelApplyPoPager.setRows(orgCancelApplyPolist);
			model.addAttribute("orgCancelApplyPoPager", orgCancelApplyPoPager);
		}
		return "template/org/org_cancel_apply_po_for_audit_data";
	}

	/**
	 * 审核主机构注销申请
	 * 
	 * @author zhangya
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = { "/auditApplyCancelRootOrgInfo" }, produces = { "application/json; charset=utf-8" })
	@ResponseBody
	public JSONObject auditApplyCancelRootOrgInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();
		// 校验当前用户是否平台管理员
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (userInfo.getUserRole() != 5) {
			jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "您不是平台管理员，操作失败！");
			return jo;
		}
		Map<String, Object> params = this.paramsToMap(request);
		// 审核意见
		String auditOpinion = (String) params.get("auditOpinion");
		// 校验审核内容
		if (StringUtils.isBlank(auditOpinion)) {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "审核意见必须填写");
			return jo;
		}
		Integer auditResult = Integer.valueOf((String) params.get("auditResult"));
		Integer orgCancelApplyPoId = null;
		if (params.get("orgCancelApplyPoId") != null) {
			orgCancelApplyPoId = Integer.valueOf((String) params.get("orgCancelApplyPoId"));
		} else {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "请选择要审核的数据！");
			return jo;
		}
		params.put("orgCancelApplyPoId", orgCancelApplyPoId);
		params.put("auditResult", auditResult);
		params.put("updateUser", userInfo.getId());
		params.put("auditPerson", userInfo.getId());
		params.put("updateTime", Calendar.getInstance().getTime());
		params.put("auditTime", Calendar.getInstance().getTime());
		try {
			orgCancelApplyFacade.auditOrgCancelApplyById(params);
			jo.put("success", Boolean.valueOf(true));
			jo.put("msg", "主机构注销申请审核成功");
		} catch (Exception e) {
			this.log.error("主机构注销申请审核异常", e);
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "申请主机构注销服务繁忙，请稍后重试");
		}
		return jo;
	}

	/**
	 * 批量审核主机构注销申请
	 * 
	 * @author zhangya
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = { "/batchAuditApplyCancelRootOrgInfo" }, produces = { "application/json; charset=utf-8" })
	@ResponseBody
	public JSONObject batchAuditApplyCancelRootOrgInfo(HttpServletRequest request, HttpServletResponse response) {
		JSONObject jo = new JSONObject();
		// 校验当前用户是否平台管理员
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (userInfo.getUserRole() != 5) {
			jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "您不是平台管理员，操作失败！");
			return jo;
		}
		Integer userInfoId = userInfo.getId();
		// 审核意见
		String auditOpinion = request.getParameter("auditOpinion");
		// 审核结果（状态）
		Integer auditResult = Integer.parseInt(request.getParameter("auditResult"));
		// 注销申请信息ID集合
		List<Integer> orgCancelApplyPoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("orgCancelApplyPoIds"))) {
			String orgCancelApplyPoIds = request.getParameter("orgCancelApplyPoIds").trim();
			String[] orgCancelApplyPoArray = orgCancelApplyPoIds.split(",");
			if (orgCancelApplyPoArray.length > 0) {
				for (String orgCancelApplyIdStr : orgCancelApplyPoArray) {
					if (StringUtils.isNotBlank(orgCancelApplyIdStr)) {
						orgCancelApplyPoIdList.add(Integer.valueOf(orgCancelApplyIdStr.trim()));
					}
				}
			}
		} else {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "要审核的注销申请信息不能为空！");
			return jo;
		}
		// 注销申请的组织ID集合
		List<Integer> orgInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("orgInfoIds"))) {
			String orgInfoIds = request.getParameter("orgInfoIds").trim();
			String[] orgInfoArray = orgInfoIds.split(",");
			if (orgInfoArray.length > 0) {
				for (String orgInfoIdStr : orgInfoArray) {
					if (StringUtils.isNotBlank(orgInfoIdStr)) {
						orgInfoIdList.add(Integer.valueOf(orgInfoIdStr.trim()));
					}
				}
			}
		} else {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "要审核的注销申请的组织必须已存在！");
			return jo;
		}
		// 校验审核内容
		if (StringUtils.isBlank(auditOpinion)) {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "审核意见必须填写！");
			return jo;
		}
		try {
			orgCancelApplyFacade.batchAuditOrgCancelApplyByIds(userInfoId, orgCancelApplyPoIdList, orgInfoIdList,
					auditOpinion, auditResult);
			jo.put("success", Boolean.valueOf(true));
			jo.put("msg", "主机构注销申请审核成功");
		} catch (Exception e) {
			this.log.error("主机构注销申请审核异常", e);
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "申请主机构注销服务繁忙，请稍后重试");
		}
		return jo;
	}

	/**
	 * 主机构信息查看审核页面
	 * 
	 * @author zhangya 2017年5月24日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/rootOrgInfoViewAndAuditPage")
	public String rootOrgInfoViewAndAuditPage(HttpServletRequest request, Model model) {
		// 1、获取查看的主机构ID
		Integer orgInfoId = Integer.valueOf(request.getParameter("orgInfoId"));
		// 2、根据主机构ID查询主机构详细信息
		OrgInfoPo orgInfo = orgInfoFacade.getOrgInfoByOrgInfoId(orgInfoId);
		model.addAttribute("orgInfo", orgInfo);
		return "template/org/root_org_info_view_and audit_page";
	}

	/**
	 * 主机构信息批量审核
	 * 
	 * @author zhangya 2017年5月26日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = { "/batchAuditRootOrgInfo" }, produces = { "application/json; charset=utf-8" })
	@ResponseBody
	public JSONObject batchAuditRootOrgInfo(HttpServletRequest request) {
		JSONObject jo = new JSONObject();
		// 校验当前用户是否平台管理员
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		if (userInfo.getUserRole() != 5) {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "“非法操作”");
		}
		// 获取当前操作用户id
		Integer userInfoId = userInfo.getId();
		// 获取审核意见
		String auditOpinion = request.getParameter("auditOpinion");
		Integer orgStatus = Integer.parseInt(request.getParameter("orgStatus"));
		if (StringUtils.isBlank(auditOpinion)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "审核意见必须填写");
			return jo;
		}

		// 注销申请的组织ID集合
		List<Integer> orgInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("orgInfoIds"))) {
			String orgInfoIds = request.getParameter("orgInfoIds").trim();
			String[] orgInfoArray = orgInfoIds.split(",");
			if (orgInfoArray.length > 0) {
				for (String orgInfoIdStr : orgInfoArray) {
					if (StringUtils.isNotBlank(orgInfoIdStr)) {
						orgInfoIdList.add(Integer.valueOf(orgInfoIdStr.trim()));
					}
				}
			}
		} else {
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "要审核的注销申请的组织必须已存在！");
			return jo;
		}

		try {
			orgInfoFacade.batchAuditOrgInfoByIds(userInfoId, orgInfoIdList, auditOpinion, orgStatus);
			jo.put("success", true);
			jo.put("msg", "已审核");
		} catch (Exception e) {
			this.log.error("保存主机构信息异常", e);
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "保存主机构服务繁忙，请稍后重试");
		}
		return jo;
	}
}