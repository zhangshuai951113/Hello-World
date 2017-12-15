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
import com.xz.facade.api.ResourceInfoFacade;
import com.xz.model.po.ResourceInfo;
import com.xz.model.po.UserInfo;

/**
 * 资源信息controller
 * @author qiutianhui 2017年7月2日
 *
 */
@Controller
@RequestMapping("/resource")
public class ResourceInfoController extends BaseController{

	@Resource
	private ResourceInfoFacade resourceInfoFacade;
	
	
	/**
	 * 资源管理页面
	 * @author qiutianhui 2017年7月4日
	 * @param model
	 * @return
	 */
	@RequiresPermissions("platform:resource:view")
	@RequestMapping(value = "/showList", method = RequestMethod.GET)
	public String showList(){
		return "template/resource/resource_management_page";
	}
	
	/**
	 * 初始化查询菜单
	 * @author qiutianhui 2017年7月2日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/findMenus")
	@ResponseBody
	public List<ResourceInfo> findMenus(HttpServletRequest request){
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		return resourceInfoFacade.findMenus(userInfo.getRoleId());
	}
	
	/**
	 * 根据角色Id查询资源信息
	 * @author qiutianhui 2017年7月3日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/findResource")
	@ResponseBody
	public List<ResourceInfo> findResource(HttpServletRequest request){
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		return resourceInfoFacade.findResource(userInfo.getRoleId());
	}
	
	/**
	 * 根据登录用户名添加资源信息
	 * @author qiutianhui 2017年7月4日
	 * @param request
	 * @param resource 资源Object
	 * @return
	 */
	@RequiresPermissions("platform:resource:create")
	@RequestMapping(value = "/addResource", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addResource(HttpServletRequest request,ResourceInfo resource){
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		JSONObject jo = null;
		jo = resourceInfoFacade.createResource(userInfo.getUserName(),resource);
		return jo;
	}
	
	/**
	 * 根据父节点Id找到父节点名称
	 * @author qiutianhui 2017年7月4日
	 * @param parentId 父节点Id
	 * @return
	 */
	@RequestMapping(value = "/findParentName", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject findParentName(Integer parentId){
		JSONObject jo = null;
		jo = resourceInfoFacade.findParentName(parentId);
		return jo;
	}
	
	/**
	 * 编辑资源信息
	 * @author qiutianhui 2017年7月4日
	 * @param resource 资源Object
	 * @return
	 */
	@RequiresPermissions("platform:resource:update")
	@RequestMapping(value = "/editeResource", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject editeResource(ResourceInfo resource){
		JSONObject jo = null;
		jo = resourceInfoFacade.updateResource(resource);
		return jo;
	}
	
	/**
	 * 根据资源Id判断是否存在角色-资源关联关系
	 * @author qiutianhui 2017年7月4日
	 * @param resourceId 资源Id
	 * @return
	 */
	@RequestMapping(value = "/hasRoleResource", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject hasRoleResource(Integer resourceId){
		JSONObject jo = null;
		jo = resourceInfoFacade.isExistRoleResource(resourceId);
		return jo;
	}
	
	/**
	 * 根据资源Id删除资源信息
	 * @author qiutianhui 2017年7月4日
	 * @param resourceId 资源Id
	 * @return
	 */
	@RequiresPermissions("platform:resource:delete")
	@RequestMapping(value = "/removeResource", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject removeResource(Integer resourceId){
		JSONObject jo = null;
		jo = resourceInfoFacade.deleteResource(resourceId);
		return jo;
	}
	
	/**
	 * 根据资源Id查询资源子集
	 * @author qiutianhui 2017年7月25日
	 * @param resourceId 资源Id
	 * @return
	 */
	@RequestMapping(value = "/findResourceById", method = RequestMethod.POST)
	@ResponseBody
	public List<ResourceInfo> findResourceById(Integer resourceId){
		List<ResourceInfo> roleIdList =  resourceInfoFacade.findResourceById(resourceId);
		return roleIdList;
	}
	
	/**
	 * 根据资源Id找到查看权限Id
	 * @author qiutianhui 2017年8月3日
	 * @param resourceId 资源Id
	 * @return
	 */
	@RequestMapping(value = "/findViewIds", method = RequestMethod.POST)
	@ResponseBody
	public List<Integer> findViewIds(Integer resourceId){
		return resourceInfoFacade.findViewIds(resourceId);
	}
}
