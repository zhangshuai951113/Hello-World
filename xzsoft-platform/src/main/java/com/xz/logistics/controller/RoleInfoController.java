package com.xz.logistics.controller;

import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.facade.api.RoleInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.RoleInfo;
import com.xz.model.po.UserInfo;

/**
 * 角色信息controller
 * @author qiutianhui 2017年7月3日
 *
 */
@Controller
@RequestMapping("/role")
public class RoleInfoController extends BaseController{
	
	@Resource
	private RoleInfoFacade roleInfoFacade;
	
	@Resource
	private UserInfoFacade userInfoFacade;
	
	
	/**
	 * 权限分配页面
	 * @author qiutianhui 2017年7月3日
	 * @param model
	 * @return
	 */
	@RequiresPermissions("basicInfo:resource:role:view")
	@RequestMapping(value = "/showList", method = RequestMethod.GET)
	public String showList(){
		return "template/role/rights_assignment_page";
	}
	
	/**
	 * 根据角色Id查询角色信息
	 * @author qiutianhui 2017年7月3日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/findRoles")
	@ResponseBody
	public List<RoleInfo> findRoles(HttpServletRequest request){
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		RoleInfo roleInfo = new RoleInfo();
		roleInfo.setParentId(userInfo.getRoleId());
		roleInfo.setOrgRootId(userInfo.getOrgRootId());
		return roleInfoFacade.findMyRoles(roleInfo);
	}
	
	/**
	 * 根据用户名查询角色信息
	 * @author qiutianhui 2017年7月3日
	 * @param username 用户名
	 * @return
	 */
	@RequestMapping(value = "/findOne", method = RequestMethod.POST)
	@ResponseBody
	public RoleInfo findOne(String username){
		List<Integer> roleIdList =  userInfoFacade.findRoleIdsByUsername(username);
		if(roleIdList != null && roleIdList.size() >0){
			return roleInfoFacade.findOne(roleIdList.get(0));
		}else{
			return null;
		}
	}
	
	/**
	 * 根据角色Id查询资源Id
	 * @author qiutianhui 2017年7月3日
	 * @param roleId 角色Id
	 * @return
	 */
	@RequestMapping(value = "/findResourceIds", method = RequestMethod.POST)
	@ResponseBody
	public List<Integer> findResourceIds(Integer roleId){
		return roleInfoFacade.findResourceIds(roleId);
	}
	
	/**
	 * 添加角色信息
	 * @author qiutianhui 2017年7月3日
	 * @param request
	 * @param role 角色Object
	 * @return
	 */
	@RequiresPermissions("basicInfo:resource:role:create")
	@RequestMapping(value = "/addRole", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addRole(HttpServletRequest request,RoleInfo role){
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		role.setOrgRootId(orgRootId);
		JSONObject jo = null;
		jo = roleInfoFacade.createRole(userInfo.getRoleId(),role);
		return jo;
	}
	
	/**
	 * 编辑角色信息
	 * @author qiutianhui 2017年7月3日
	 * @param role 角色Object
	 * @return
	 */
	@RequiresPermissions("basicInfo:resource:role:update")
	@RequestMapping(value = "/editRole", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject editRole(RoleInfo role){
		JSONObject jo = null;
		jo = roleInfoFacade.updateRole(role);
		return jo;
	}
	
	/**
	 * 根据角色Id判断是否存在用户-角色关联关系
	 * @author qiutianhui 2017年7月3日
	 * @param roleId 角色Id
	 * @return
	 */
	@RequestMapping(value = "/hasUserRole", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject hasUserRole(Integer roleId){
		JSONObject jo = null;
		jo = roleInfoFacade.isExistUserRole(roleId);
		return jo;
	}
	
	/**
	 * 根据角色Id删除角色信息
	 * @author qiutianhui 2017年7月3日
	 * @param roleId 角色Id
	 * @return
	 */
	@RequiresPermissions("basicInfo:resource:role:delete")
	@RequestMapping(value = "/removeRole", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject removeRole(Integer roleId){
		JSONObject jo = null;
		jo = roleInfoFacade.deleteRole(roleId);
		return jo;
	}
	
	/**
	 * 添加角色-资源关联关系
	 * @author qiutianhui 2017年7月3日
	 * @param roleId 角色Id
	 * @param resourceIds 资源Id数组
	 * @return
	 */
	@RequiresPermissions("basicInfo:resource:role:auth")
	@RequestMapping(value = "/saveRoleResource", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject saveRoleResource(Integer roleId,Integer[] resourceIds){
		JSONObject jo = null;
		jo = roleInfoFacade.addRoleResource(roleId,resourceIds);
		return jo;
	}
}
