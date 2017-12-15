package com.xz.logistics.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.dubbo.common.utils.CollectionUtils;
import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.facade.api.ContractInfoFacade;
import com.xz.facade.api.OrgDetailInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.ContractInfo;
import com.xz.model.po.OrgDetailInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.OrgModel;

/**
* @author zhangshuai   2017年6月14日 下午3:58:10
* 客户管理
*/
@Controller
@RequestMapping("/customer")
public class CustomerContorller {

	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private OrgDetailInfoFacade orgDetailInfoFacade;
	@Resource
	private ContractInfoFacade contractInfoFacade;
	@Resource
	private UserInfoFacade userInfoFacade;
	
	/**
	 * @author zhangshuai  2017年7月26日 下午5:05:29
	 * @param request
	 * @param response
	 * @return
	 * 查询登录用户角色
	 */
	@RequestMapping(value="/findLoginUserRole",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer findLoginUserRole(HttpServletRequest request,HttpServletResponse response){
		//从session中获得登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();
		return userRole;
	}
	
	/**
	 * @author zhangshuai  2017年6月14日 下午5:16:56
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入客户管理页面
	 */
	@RequestMapping(value="/goCustomerPage",produces="application/json;charset=utf-8")
	public String goCustomerPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String customer="客户管理";
		model.addAttribute("customer",customer);
		
		return "template/customer/customerPage";
	}
	
	/**
	 * @author zhangshuai  2017年6月14日 下午5:19:05
	 * @param request
	 * @param response
	 * @return
	 * 进入添加客户模态框
	 */
	@RequestMapping(value="/addCoustomerMation",produces="application/json;charset=utf-8")
	public String addCoustomerMation(HttpServletRequest request,HttpServletResponse response,Model model){
		String coustomerManager="新增客户信息";
		model.addAttribute("coustomerManager", coustomerManager);
		return "template/customer/addCoustomerMationModel";
		
	}
	
	/**
	 * @author zhangshuai  2017年6月14日 下午7:17:48
	 * @param request
	 * @param response
	 * @param orgModel
	 * @return
	 * 添加客户信息
	 */
	@RequestMapping(value="/addCoustomerInfo",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addCoustomerInfo(HttpServletRequest request,HttpServletResponse response,OrgModel orgModel){
		JSONObject jo=new JSONObject();
		
		//从session中获取当前登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=userInfo.getOrgRootId();
		Integer id=userInfo.getId();
		Integer userRole=userInfo.getUserRole();
		
		//根据登录用户查询机构等级
		Integer orgLevel=orgInfoFacade.findOrgLevel(orgRootId,id);
		
		//添加组织机构表
		jo=orgInfoFacade.addOrgInfoMation(orgModel, orgRootId, id,userRole,orgLevel);
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月15日 下午12:25:32
	 * @param request
	 * @param response
	 * 客户信息全查
	 */
	@RequestMapping(value="/findCoustomerInfoAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<OrgDetailInfoPo> findCoustomerInfoAll(HttpServletRequest request,HttpServletResponse response,OrgModel orgModel){
		
		//从session中获取登录用户主机构ID
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=userInfo.getOrgRootId();
		String orgName=null;
		String mobilePhone=null;
		String contactName=null;
		if(orgModel.getOrgDetailInfoPo()!=null){
			 orgName=orgModel.getOrgDetailInfoPo().getOrgName();
			 mobilePhone=orgModel.getOrgDetailInfoPo().getMobilePhone();
			 contactName=orgModel.getOrgDetailInfoPo().getContactName();
		}
		
		Integer page=orgModel.getPage();
		Integer rows=orgModel.getRows();
		Integer currentPage=page*rows;
		Integer sign=orgModel.getSign();
		
		Map<String, Object> params=new HashMap<String, Object>();
		params.put("orgName", orgName);
		params.put("mobilePhone", mobilePhone);
		params.put("contactName", contactName);
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		params.put("orgRootId", orgRootId);
		if(sign==1){
			params.put("userRole", 1);
		}else if(sign==2){
			params.put("userRole", 2);
		}
		
		List<OrgDetailInfoPo> OrgDetailInfoPoList=orgDetailInfoFacade.findCustomerAll(params);

		List<Integer> createUserIds=CommonUtils.getValueList(OrgDetailInfoPoList, "createUser");
		List<UserInfo> userInfos=userInfoFacade.findUserNameByIds(createUserIds);
		//key：用户ID  value：用户名称
		Map<Integer, String> userInfoMap=null;
		if(CollectionUtils.isNotEmpty(userInfos)){
			userInfoMap=CommonUtils.listforMap(userInfos, "id", "userName");
		}
		for (OrgDetailInfoPo orgDetailInfoPo : OrgDetailInfoPoList) {
			//创建时间
			if(orgDetailInfoPo.getCreateTime()!=null){
				orgDetailInfoPo.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(orgDetailInfoPo.getCreateTime()));
			}
			
			//封装创建人
			if(MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(orgDetailInfoPo.getCreateUser())!=null){
				orgDetailInfoPo.setCreateUserStr(userInfoMap.get(orgDetailInfoPo.getCreateUser()));
			}
		}
		return OrgDetailInfoPoList;
	}
	
	/**
	 * @author zhangshuai  2017年6月15日 下午5:23:56
	 * @param request
	 * @param response
	 * @return
	 * 查询总条数
	 */
	@RequestMapping(value="/getCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getCount(HttpServletRequest request,HttpServletResponse response,OrgModel orgModel){
		//从session中获取登录用户主机构ID
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=userInfo.getOrgRootId();
		
		String orgName=null;
		String mobilePhone=null;
		String contactName=null;
		if(orgModel.getOrgDetailInfoPo()!=null){
			 orgName=orgModel.getOrgDetailInfoPo().getOrgName();
			 mobilePhone=orgModel.getOrgDetailInfoPo().getMobilePhone();
			 contactName=orgModel.getOrgDetailInfoPo().getContactName();
		}
		Integer sign=orgModel.getSign();
		
		Map<String, Object> params=new HashMap<String, Object>();
		params.put("orgName", orgName);
		params.put("mobilePhone", mobilePhone);
		params.put("contactName", contactName);
		params.put("orgRootId", orgRootId);
		if(sign==1){
			params.put("userRole", 1);
		}else if(sign==2){
			params.put("userRole", 2);
		}
		Integer count=orgDetailInfoFacade.getCount(params);
		
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月16日 上午10:23:50
	 * @param request
	 * @param response
	 * @return
	 * 根据组织机构ID删除客户信息
	 */
	@SuppressWarnings("unused")
	@RequestMapping(value="/deleteCustomerMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject deleteCustomerMation(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		boolean success=false;
		String msg="";
		// 被操作的客户ID
		List<Integer> customerIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("userIds"))) {
			String customerIds = request.getParameter("userIds").trim();
			String[] customerArray = customerIds.split(",");
			if(customerArray.length>0){
				for(String userIdStr : customerArray){
					if(StringUtils.isNotBlank(userIdStr)){
						customerIdList.add(Integer.valueOf(userIdStr.trim()));
					}
				}
			}
		}
		
		List<String> orgNames=new ArrayList<String>();
		
		//根据客户ID获取到组织机构ID
		List<Integer> orgRootId=orgDetailInfoFacade.findOrgRootIdByCId(customerIdList);
		
		//根据客户组织机构ID查询合同表是否有关联
		List<ContractInfo> ContractInfoList=contractInfoFacade.findContractInfoByOrgRootId(orgRootId);

			for (ContractInfo contractInfo : ContractInfoList) {

				if(contractInfo!=null){
					Integer cIorgRootId=contractInfo.getOrgRootId();
					
					OrgDetailInfoPo OrgDetailInfoPo= orgDetailInfoFacade.findOrgRootIdByCIorgRootId(cIorgRootId);
					
					orgNames.add(OrgDetailInfoPo.getOrgName());
						jo.put("success", false);
						jo.put("msg", orgNames+"与业务有关联,不能删除!");
						return jo;
				}else if(contractInfo==null){
					//没有关联，直接删除
					//先删除组织机构信息
					orgInfoFacade.deleteContractInfoById(orgRootId);
					//再删除组织机构明细信息
					orgDetailInfoFacade.deleteContractInfoById(customerIdList);
					jo.put("success", true);
					jo.put("msg", "删除成功!");
					return jo;
				}
			}
			return jo;
	}
	
	
	/**
	 * @author zhangshuai  2017年6月16日 下午5:19:59
	 * @param request
	 * @param response
	 * @return
	 * 查询修改客户是否与合同有关联
	 */
	@RequestMapping(value="/findContractInfoByCustomerOrgRootId",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findContractInfoByCustomerOrgRootId(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户主机构ID
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId=userInfo.getOrgRootId();
		
		Integer odiId=Integer.parseInt(request.getParameter("userIds"));
		
		//判断登录用户主机构ID是否与操作客户主机构ID一致
		Integer rootOrgInfoId=orgInfoFacade.findRootOrgInfoId(odiId);
        if(!rootOrgInfoId.equals(orgRootId)){
        	jo.put("success", false);
			jo.put("msg", "非法操作!");
			return jo;
        }
        
		//根据组织ID查询客户是否与合同信息关联
		ContractInfo contractInfo=contractInfoFacade.findContractInfoByCustomerOrgRootId(odiId);
		if(contractInfo!=null){
			jo.put("success", false);
			jo.put("msg", "与合同有业务关系，无法修改!");
		}else{
			jo.put("success", true);
			jo.put("msg", "无关联,可以修改!");
		}
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月16日 下午7:16:22
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 修改模态框
	 */
	@RequestMapping(value="/updateCoustomerPage",produces="application/json;charset=utf-8")
	public String updateCoustomerPage(HttpServletRequest request,HttpServletResponse response ,Model model){
		
		String update="修改客户信息";
		model.addAttribute("update", update);
		return "template/customer/updateCoustomerMationModel";
	}
	
	/**
	 * @author zhangshuai  2017年6月16日 下午7:17:57
	 * @param request
	 * @param response
	 * @return
	 * 查询操作客户的信息
	 */
	@RequestMapping(value="/findCostOmerMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public OrgDetailInfoPo findCostOmerMationById(HttpServletRequest request,HttpServletResponse response){
		
		Integer odiId=Integer.parseInt(request.getParameter("userIds"));
		
		OrgDetailInfoPo orgDetailInfo=orgDetailInfoFacade.findCostOmerMationById(odiId);
		return orgDetailInfo;
	}
	
	/**
	 * @author zhangshuai  2017年6月17日 上午12:31:27
	 * @param request
	 * @param response
	 * @param orgModel
	 * @return
	 * 获取前台参数修改客户信息
	 */
	@RequestMapping(value="/updateCMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject updateCMation(HttpServletRequest request,HttpServletResponse response,OrgModel orgModel){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		
		//修改客户数据
		jo=orgDetailInfoFacade.updateCMationById(orgModel,uId);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年8月21日 上午11:23:18
	 * @param request
	 * @param response
	 * @return
	 * 进入承运人管理主页面
	 */
	@RequestMapping(value="/goCarrierManagementPage")
	public String goCarrierManagementPage(HttpServletRequest request,HttpServletResponse response){
		return "template/customer/carrierManagement/carrierManagementRootPage";
	}
	
	/**
	 * @author zhangshuai  2017年8月21日 上午11:48:54
	 * @param rquest
	 * @param response
	 * @return
	 * 添加承运人信息
	 */
	@RequestMapping(value="/addCurrierMation",produces="application/json;charset=utf-8")
	public String addCurrierMation(HttpServletRequest rquest,HttpServletResponse response){
		return "template/customer/carrierManagement/addcarrierMationModel";
	}
	
	/**
	 * @author zhangshuai  2017年8月21日 下午12:42:27
	 * @param request
	 * @param response
	 * @return
	 * 修改承运人信息页面
	 */
	@RequestMapping(value="/updateCarrierPage",produces="application/json;charset=utf-8")
	public String updateCarrierPage(HttpServletRequest request,HttpServletResponse response){
		return "template/customer/carrierManagement/updateCarrierMationModel";
	}
	
}
