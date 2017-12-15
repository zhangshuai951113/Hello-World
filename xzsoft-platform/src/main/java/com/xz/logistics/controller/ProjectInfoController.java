package com.xz.logistics.controller;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.ProjectInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.ProjectInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.ProjectInfoModel;

/**
 * 项目Controller
 * 
 * @author zhangya 2017年6月14日 上午10:58:17
 *
 */
@Controller
@RequestMapping("/projectInfo")
public class ProjectInfoController extends BaseController {

	@Resource
	private ProjectInfoFacade projectInfoFacade;

	@Resource
	private OrgInfoFacade orgInfoFacade;

	@Resource
	private UserInfoFacade userInfoFacade;

	/**
	 * 项目信息初始化页
	 * 
	 * @author zhangya 2017年6月14日 上午11:02:57
	 * @return
	 */
	@RequiresPermissions("basicInfo:project:view")
	@RequestMapping("/showProjectInfoPage")
	public String showProjectInfoPage(HttpServletRequest request, Model model) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		List<OrgInfoPo> orgInfoList = null;
		if (rootOrgInfoId != null) {
			orgInfoList = orgInfoFacade.getOrgInfosByRootOrgInfoId(rootOrgInfoId);
		}
		model.addAttribute("orgInfoList", orgInfoList);
		return "template/project/show_project_info_page";
	}

	/**
	 * 项目信息初始化页
	 * 
	 * @author zhangya 2017年6月14日 上午11:02:57
	 * @return
	 */
	@RequestMapping("/listProjectInfo")
	public String listProjectInfoPage(HttpServletRequest request, Model model) {
		DataPager<ProjectInfoPo> projectInfoPager = new DataPager<ProjectInfoPo>();

		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf((String) params.get("page"));
		}
		projectInfoPager.setPage(page);
		// 条数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf((String) params.get("rows"));
		}
		projectInfoPager.setSize(rows);
		// 项目名称
		String projectName = null;
		if (params.get("projectName") != null) {
			projectName = (String) params.get("projectName");
		}
		// 项目编号
		String projectId = null;
		if (params.get("projectId") != null) {
			projectId = (String) params.get("projectId");
		}
		// 所属组织
		Integer orgInfoId = null;
		if (params.get("orgInfoId") != null) {
			orgInfoId = Integer.valueOf(params.get("orgInfoId").toString());
		}
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("projectName", projectName);
		queryMap.put("projectId", projectId);
		queryMap.put("orgInfoId", orgInfoId);
		queryMap.put("orgRootId", userInfo.getOrgRootId());
		List<ProjectInfoPo> projectInfoPoList = projectInfoFacade.findProjectInfoPoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(projectInfoPoList)) {

			// 查询创建人
			List<Integer> userInfoIds = CommonUtils.getValueList(projectInfoPoList, "createUser");
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
			// key:用户ID value:用户名
			Map<Integer, String> userInfoMap = null;
			if (CollectionUtils.isNotEmpty(userInfos)) {
				userInfoMap = CommonUtils.listforMap(userInfos, "id", "userName");
			}
			
			//上级组织
			List<Integer> parentOrgInfoIds = CommonUtils.getValueList(projectInfoPoList, "parentOrgInfoId");
			List<OrgInfoPo> parentOrgInfos = new ArrayList<OrgInfoPo>();
			if(CollectionUtils.isNotEmpty(parentOrgInfoIds)){
				parentOrgInfos = orgInfoFacade.findOrgNameByIds(parentOrgInfoIds);
			}
			// key:上级组织ID value:上级组织名称
			Map<Integer, String> parentOrgInfoMap = null;
			if (CollectionUtils.isNotEmpty(parentOrgInfos)) {
				parentOrgInfoMap = CommonUtils.listforMap(parentOrgInfos, "id", "orgName");
			}

			for (ProjectInfoPo projectInfoPo : projectInfoPoList) {
				// 封装创建人
				if (MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(projectInfoPo.getCreateUser()) != null) {
					projectInfoPo.setCreateUserName(userInfoMap.get(projectInfoPo.getCreateUser()));
				}
				
				//封装上级组织
				if (projectInfoPo.getParentOrgInfoId() != null && projectInfoPo.getParentOrgInfoId() == 0) {
					projectInfoPo.setParentOrgName(projectInfoPo.getOrgInfoName());
				} else {
					if(MapUtils.isNotEmpty(parentOrgInfoMap) && parentOrgInfoMap.get(projectInfoPo.getParentOrgInfoId())!=null){
						projectInfoPo.setParentOrgName(parentOrgInfoMap.get(projectInfoPo.getParentOrgInfoId()));
					}
					
				}
				
			}

		}

		Integer total = projectInfoFacade.countProjectInfoPoForPage(queryMap);
		projectInfoPager.setTotal(total);
		projectInfoPager.setRows(projectInfoPoList);
		model.addAttribute("projectInfoPager", projectInfoPager);
		return "template/project/project_info_data";
	}

	/**
	 * 项目信息新增、编辑初始化页
	 * 
	 * @author zhangya 2017年6月14日 上午11:02:57
	 * @return
	 */
	@RequestMapping("/addOrEditProjectInfoPage")
	public String addOrEditProjectInfoPage(HttpServletRequest request, Model model) {
		ProjectInfoPo projectInfoPo = null;
		String operateTitle = "项目信息新增";
		if (request.getParameter("projectInfoId") != null) {
			Integer projectInfoId = Integer.valueOf(request.getParameter("projectInfoId"));
			
			projectInfoPo = projectInfoFacade.getProjectInfoPoById(projectInfoId);
			if (projectInfoPo.getParentOrgInfoId() != null && projectInfoPo.getParentOrgInfoId() == 0) {
				projectInfoPo.setParentOrgName(projectInfoPo.getOrgInfoName());
			} else {
				OrgInfoPo parentOrgInfo = orgInfoFacade.getOrgInfoByOrgInfoId(projectInfoPo.getParentOrgInfoId());
				if(parentOrgInfo != null){
					projectInfoPo.setParentOrgName(parentOrgInfo.getOrgDetailInfo().getOrgName());
				}
			}
			
			model.addAttribute("projectInfoPo", projectInfoPo);
			operateTitle = "项目信息修改";
			// 校验是否已和合同关联 关联则能不能修改项目编号  （页面的只读样式不加 了 后台保存时 再校验）
		}
		// 获取当前用户
//		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 获取主机构下的组织
//		Integer rootOrgInfoId = userInfo.getOrgRootId();
//		List<OrgInfoPo> orgInfoList = null;
//		if (rootOrgInfoId != null) {
//			orgInfoList = orgInfoFacade.getOrgInfosByRootOrgInfoId(rootOrgInfoId);
//		}
//		model.addAttribute("orgInfoList", orgInfoList);
		model.addAttribute("operateTitle", operateTitle);
		return "template/project/edit_project_info_page";
	}

	/**
	 * 项目信息新增、修改
	 * 
	 * @author zhangya 2017年6月14日 上午11:02:57
	 * @return
	 */
	@RequestMapping("/addOrUpdateProjectInfo")
	@ResponseBody
	public JSONObject addOrUpdateProjectInfo(HttpServletRequest request, ProjectInfoModel projectInfoModel) {
		JSONObject jo = new JSONObject();
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		// 参数校验
		if (projectInfoModel == null) {
			jo.put("success", false);
			jo.put("msg", "保存的项目信息无效！");
			return jo;
		}
		ProjectInfoPo projectInfoPo = projectInfoModel.getProjectInfoPo();

		if (projectInfoPo == null) {
			jo.put("success", false);
			jo.put("msg", "保存的项目信息无效！");
			return jo;
		}
		// 校验项目编号
		if (StringUtils.isBlank(projectInfoPo.getProjectId())) {
			jo.put("success", false);
			jo.put("msg", "项目编号不能为空！");
			return jo;
		}

		// 封装校验编号是否唯一参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("projectId", projectInfoPo.getProjectId());
		// 新增校验
		if (projectInfoPo.getId() == null) {
			if (projectInfoFacade.isProjectIdExisted(queryMap)) {
				jo.put("success", false);
				jo.put("msg", "项目已存在，请重新填写项目信息！");
				return jo;
			}
		} else {
			// 修改校验
			Map<String, Object> checkMap = new HashMap<String, Object>();
			Integer projectInfoId = projectInfoPo.getId();
			checkMap.put("projectInfoId", projectInfoId);
			checkMap.put("orgRootId", orgRootId);
			// 校验在是否操作其它主机构的项目
			ProjectInfoPo oldProjectInfoPo = projectInfoFacade.getProjectInfoPoByIdAndOrgRootId(checkMap);
			if (oldProjectInfoPo == null) {
				jo.put("success", false);
				jo.put("msg", "项目不存在！");
				return jo;
			}
			if (!oldProjectInfoPo.getProjectId().equals(projectInfoPo.getProjectId())) {

				// 校验是否已和合同关联 关联则能不能修改项目编号
				if (oldProjectInfoPo.getContractCount() > 0) {
					jo.put("success", false);
					jo.put("msg", "项目已关联合同，不能修改项目编号！");
					return jo;
				}
				if (projectInfoFacade.isProjectIdExisted(queryMap)) {
					jo.put("success", false);
					jo.put("msg", "项目已存在，请重新填写项目信息！");
					return jo;
				}
			}
		}
		// 校验所属组织
		if (projectInfoPo.getOrgInfoId() == null) {
			jo.put("success", false);
			jo.put("msg", "所属组织不能为空！");
			return jo;
		}
		// 校验项目名称
		if (StringUtils.isBlank(projectInfoPo.getProjectName())) {
			jo.put("success", false);
			jo.put("msg", "项目名称不能为空！");
			return jo;
		}

		Integer orgInfoId = projectInfoPo.getOrgInfoId();
		OrgInfoPo orgInfoPo = orgInfoFacade.getOrgInfoByOrgInfoId(orgInfoId);
		projectInfoPo.setOrgInfoName(orgInfoPo.getOrgDetailInfo().getOrgName());
		try {
			// 新增
			if (projectInfoPo.getId() == null) {
				projectInfoPo.setOrgRootId(userInfo.getOrgRootId());
				projectInfoPo.setCreateUser(userInfo.getId());
				projectInfoPo.setCreateTime(Calendar.getInstance().getTime());
				projectInfoFacade.addProjectInfoPo(projectInfoPo);
			} else {
				projectInfoPo.setUpdateUser(userInfo.getId());
				projectInfoPo.setUpdateTime(Calendar.getInstance().getTime());
				projectInfoFacade.updateProjectInfoPo(projectInfoPo);
			}

		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", "保存项目信息异常！");
			return jo;
		}
		jo.put("success", true);
		jo.put("msg", "保存成功！");
		return jo;
	}

	/**
	 * 删除项目信息
	 * 
	 * @author zhangya 2017年6月14日 下午6:42:09
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/deleteProjectInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteProjectInfo(HttpServletRequest request) {
		JSONObject jo = new JSONObject();

		// 要删除的项目ID
		List<Integer> projectInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("projectInfoIds"))) {
			String projectInfoIds = request.getParameter("projectInfoIds").trim();
			String[] projectArray = projectInfoIds.split(",");
			if (projectArray.length > 0) {
				for (String projectIdStr : projectArray) {
					if (StringUtils.isNotBlank(projectIdStr)) {
						projectInfoIdList.add(Integer.valueOf(projectIdStr.trim()));
					}
				}
			}
		}

		// 所选项目不能为空
		if (CollectionUtils.isEmpty(projectInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选项目不能为空");
			return jo;
		}

		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 获取主机构下的组织
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		try {
			jo = projectInfoFacade.deleteProjectInfoPo(projectInfoIdList, rootOrgInfoId);
		} catch (Exception e) {
			e.printStackTrace();
			jo.put("success", false);
			jo.put("msg", "删除项目异常！");
			return jo;
		}
		return jo;
	}

	/**
	 * 项目信息查询
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/getProjectData")
	@ResponseBody
	public List<ProjectInfoPo> getProjectData(HttpServletRequest request, Model model) {

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
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
		// 项目名称
		String projectName = null;
		if (params.get("projectName") != null) {
			projectName = (String) params.get("projectName");
		}
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("projectName", projectName);
		queryMap.put("orgRootId", userInfo.getOrgRootId());
		return projectInfoFacade.findProjectInfoPoForPage(queryMap);
	}

	/**
	 * 项目数量查询
	 * 
	 * @author zhangya 2017年6月16日 下午4:11:29
	 * @return
	 */
	@RequestMapping("/getProjectCount")
	@ResponseBody
	public Integer getProjectCount(HttpServletRequest request, Model model) {

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Map<String, Object> queryMap = new HashMap<String, Object>();
		// 项目名称
		String projectName = null;
		if (request.getParameter("projectName=") != null) {
			projectName = request.getParameter("projectName");
		}
		queryMap.put("orgRootId", userInfo.getOrgRootId());
		queryMap.put("projectName", projectName);
		return projectInfoFacade.countProjectInfoPoForPage(queryMap);
	}
	
	/**
	 * 查询组织信息初始页
	 * @author jiangweiwei 2017年10月9日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/getOrgInfoData")
	@ResponseBody
	public JSONObject getOrgInfoData(HttpServletRequest request, Model model) {
		
		JSONObject json = new JSONObject();
		
		// 从session中取出当前用户的组织机构ID和企业用户类型
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgInfoId = userInfo.getOrgInfoId();
		Integer enterpriseUserType = userInfo.getEnterpriseUserType();
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
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
		
		//组织机构ID
		Integer orgInfoIdParam = null;
//		if(params.get("orgInfoId") != null){
//			orgInfoIdParam = Integer.valueOf(params.get("orgInfoId").toString());
//		}
		//组织名称
		String orgInfoName = null;
		if(params.get("orgInfoName") != null){
			orgInfoName = params.get("orgInfoName").toString();
		}
		//封装条件
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgInfoId", orgInfoId);
		queryMap.put("orgInfoIdParam", orgInfoIdParam);
		queryMap.put("orgInfoName", orgInfoName);
		// 查询该主机构下的所有1级与2级机构信息，按照主键ID正序
		Integer total = null;
		List<OrgInfoPo> orgInfoList = new ArrayList<OrgInfoPo>();
		if(enterpriseUserType == 1){
			orgInfoList = orgInfoFacade.getOrgInfosByOrgInfoId(queryMap);
			total = orgInfoFacade.countOrgInfosByOrgInfoId(queryMap);
		}else{
			orgInfoList = orgInfoFacade.findTwoLevelOrgInfo(queryMap);
			total = orgInfoFacade.countTwoLevelOrgInfo(queryMap);
		}
		List<OrgInfoPo> orgInfoPos = new ArrayList<OrgInfoPo>();
		if(CollectionUtils.isNotEmpty(orgInfoList)){
			List<Integer> parentOrgInfoIds = CommonUtils.getValueList(orgInfoList, "parentOrgInfoId");
			orgInfoPos = orgInfoFacade.findOrgNameByIds(parentOrgInfoIds);
			//key:组织id value:组织名称
			Map<Integer, String> orgInfoPoMap = null;
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				//根据登录用户组织机构ID获取所属组织名称
				orgInfoPoMap = CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
			//封装所属组织名称
			for (OrgInfoPo orgInfoPo : orgInfoList) {
				//根据登录用户组织机构ID获取所属组织名称
				if (MapUtils.isNotEmpty(orgInfoPoMap) && orgInfoPoMap.get(orgInfoPo.getParentOrgInfoId()) != null) {
					orgInfoPo.setParentOrgName(orgInfoPoMap.get(orgInfoPo.getParentOrgInfoId()));
				}else{
					orgInfoPo.setParentOrgName(orgInfoPo.getOrgName());
				}
			}
		}
		
		json.put("success", true);
		json.put("list", orgInfoList);
		json.put("total", total);
		
		return json;
	}
	
}
