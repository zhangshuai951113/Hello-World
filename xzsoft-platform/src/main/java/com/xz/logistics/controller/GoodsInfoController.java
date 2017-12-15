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

import com.alibaba.dubbo.common.logger.Logger;
import com.alibaba.dubbo.common.logger.LoggerFactory;
import com.alibaba.dubbo.common.utils.CollectionUtils;
import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.enums.GoodsUnitsEnum;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.MaterialCategoryPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.EnumsModel;
import com.xz.model.vo.GoodsInfoModel;
import com.xz.rpc.service.MaterialCategoryService;


/**
* @author zhangshuai   2017年6月12日 上午10:51:01
* 类说明     货物信息
*/
@Controller
@RequestMapping("/GoodsInfo")
public class GoodsInfoController {

	private final Logger log=LoggerFactory.getLogger(getClass());
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
	@Resource
	private MaterialCategoryService materialCategoryService;
	@Resource
	private UserInfoFacade userInfoFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	/**
	 * @author zhangshuai  2017年6月12日 上午11:18:13
	 * @param response
	 * @param request
	 * @param model
	 * @return
	 * 进入货物管理页面
	 */
	@RequestMapping(value="/GoGoodsInfo",produces="application/json;charset=utf-8")
	public String GoGoodsInfo(HttpServletResponse response,HttpServletRequest request,Model model){
		
		//从session中获取当前登录人员的信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		if(userInfo!=null && userInfo.getUserRole()!=null){
				String GoodsInfo="货物管理";
				model.addAttribute("GoodsInfo",GoodsInfo);
				return "template/GoodsInfo/GoodsInfoPage";
		}
		
		return "template/GoodsInfo/GoodsInfo_box_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月12日 上午11:20:45
	 * @param request
	 * @param response
	 * @return
	 * 货物信息全查
	 */
	@RequestMapping(value="/selectGoodsInfoAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<GoodsInfo> selectGoodsInfoAll(HttpServletRequest request,HttpServletResponse response,GoodsInfoModel goodsInfo){
		//从session中获取当前登录人员信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();
		//接收页面参数
		String gId=request.getParameter("id");
		String goodsName=request.getParameter("goodsName");
		String materialType=request.getParameter("materialType");
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=page*rows;
		//货物启用状态
		Integer goodsStatus = null;
		if(StringUtils.isNotBlank(request.getParameter("goodsStatus"))){
			goodsStatus = Integer.valueOf(request.getParameter("goodsStatus"));
		}
		//货物审核状态
		Integer auditStatus = null;
		if(StringUtils.isNotBlank(request.getParameter("auditStatus"))){
			auditStatus = Integer.valueOf(request.getParameter("auditStatus"));
		}
    	//封装参数
  		Map<String, Object> params=new HashMap<String,Object>();
  		params.put("gId", gId);
  		params.put("goodsName", goodsName);
  		params.put("materialType", materialType);
  	    params.put("currentPage", start);
  		params.put("rows", rows);
  		params.put("auditStatus", auditStatus);
  		params.put("goodsStatus", goodsStatus);
	    
		List<GoodsInfo> goodsInfoList=goodsInfoFacade.selectGoodsInfoAll(params);
		//封装物资类别
		List<Integer> materialCategoryId=CommonUtils.getValueList(goodsInfoList, "materialType");
		//key：物资类别ID  value：物资类别名称
		Map<Integer, String> materialCategoryMap=null;
		if(CollectionUtils.isNotEmpty(materialCategoryId)){
			List<MaterialCategoryPo> materialCategoryPos=materialCategoryService.findMaterialCategoryByIds(materialCategoryId);
			if(CollectionUtils.isNotEmpty(materialCategoryPos)){
				materialCategoryMap=CommonUtils.listforMap(materialCategoryPos, "id", "materialType");
			}
		}
		
		//封装创建人
		List<Integer> userInfoIds=CommonUtils.getValueList(goodsInfoList, "createUser");
		//key：用户ID  value：用户名称
		Map<Integer, String> userInfoMap=null;
		if(CollectionUtils.isNotEmpty(userInfoIds)){
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
			if(CollectionUtils.isNotEmpty(userInfos)){
				userInfoMap=CommonUtils.listforMap(userInfos, "id", "userName");
			}
		}
		
		//封装所属组织
		List<Integer> orgIds=CommonUtils.getValueList(goodsInfoList, "orgInfoId");
		//key：组织ID  value：组织名称
		Map<Integer, String> orgMap=null;
		if(CollectionUtils.isNotEmpty(orgIds)){
			List<OrgInfoPo> orgs = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgs)){
				orgMap=CommonUtils.listforMap(orgs, "id", "orgName");
			}
		}
		
		//封装主机构名称
		List<Integer> orgInfoIds=CommonUtils.getValueList(goodsInfoList, "orgRootId");
		//key：物资类别ID  value：物资类别名称
		Map<Integer, String> orgInfoMap=null;
		if(CollectionUtils.isNotEmpty(orgInfoIds)){
			List<OrgInfoPo> orgInfos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
			if(CollectionUtils.isNotEmpty(orgInfos)){
				orgInfoMap=CommonUtils.listforMap(orgInfos, "id", "orgName");
			}
		}
		
		for (GoodsInfo goodsInfo3 : goodsInfoList) {
			goodsInfo3.setUserRole(userRole);
			//封装物资类别名称
			if(MapUtils.isNotEmpty(materialCategoryMap)&&materialCategoryMap.get(goodsInfo3.getMaterialType())!=null){
				goodsInfo3.setMaterialTypeName(materialCategoryMap.get(goodsInfo3.getMaterialType()));
			}
			//封装创建人名称
			if(MapUtils.isNotEmpty(userInfoMap)&&userInfoMap.get(goodsInfo3.getCreateUser())!=null){
				goodsInfo3.setUserName(userInfoMap.get(goodsInfo3.getCreateUser()));
			}
			//封装所属组织名称
			if(MapUtils.isNotEmpty(orgMap)&&orgMap.get(goodsInfo3.getOrgInfoId())!=null){
				goodsInfo3.setOrgInfoName(orgMap.get(goodsInfo3.getOrgInfoId()));
			}
			//封装主机构名称
			if(MapUtils.isNotEmpty(orgInfoMap)&&orgInfoMap.get(goodsInfo3.getOrgRootId())!=null){
				goodsInfo3.setOrgRootName(orgInfoMap.get(goodsInfo3.getOrgRootId()));
			}
			goodsInfo3.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd").format(goodsInfo3.getCreateTime()));
		}
		return goodsInfoList;
	}
	
	
	/**
	 * @author zhangshuai  2017年6月12日 下午6:23:23
	 * @param request
	 * @param response
	 * @return
	 * 查询总数
	 */
	@RequestMapping(value="/getCountGoods",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getCountGoods(HttpServletRequest request,HttpServletResponse response,GoodsInfoModel goodsInfo){
		//接收页面参数
		String gId=request.getParameter("id");
		String goodsName=request.getParameter("goodsName");
		String materialType=request.getParameter("materialType");
		Integer page=null;
		if(request.getParameter("page")!=null){
			page=Integer.parseInt(request.getParameter("page"));
		}else{
			page=0;
		}
		Integer rows=null;
		if(request.getParameter("rows")!=null){
			rows=Integer.parseInt(request.getParameter("rows"));
		}else{
			rows=10;
		}
		
		Integer start=page*rows;
		//货物审核状态
		Integer auditStatus = null;
		if(StringUtils.isNotBlank(request.getParameter("auditStatus"))){
			auditStatus = Integer.valueOf(request.getParameter("auditStatus"));
		}
		//货物启用状态
		Integer goodsStatus = null;
		if(StringUtils.isNotBlank(request.getParameter("goodsStatus"))){
			goodsStatus = Integer.valueOf(request.getParameter("goodsStatus"));
		}
				
    	//封装参数
  		Map<String, Object> params=new HashMap<String,Object>();
  		params.put("gId", gId);
  		params.put("goodsName", goodsName);
  		params.put("materialType", materialType);
  	    params.put("currentPage", start);
  		params.put("rows", rows);
  		params.put("auditStatus", auditStatus);
  		params.put("goodsStatus", goodsStatus);
		
	   Integer count=goodsInfoFacade.getCountGoods(params);
	   return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月13日 上午12:27:19
	 * @param request
	 * @param response
	 * @return
	 * 进入添加货物模态框
	 */
	@RequestMapping(value="/addGoodsInfoModel",produces="application/json;charset=utf-8")
	public String addGoodsInfoModel(HttpServletRequest request,HttpServletResponse response,Model model){
		
		//从session中获取当前登录人员信息
		
		String goodsInfo="新增货物信息";
		model.addAttribute("goodsInfo", goodsInfo);
		
		/*//查询所有货物的计量单位
		List<String> units=goodsInfoFacade.findUnitsAll();
		model.addAttribute("units", units);*/
		
		List<EnumsModel> goodsUnitsList = new ArrayList<EnumsModel>();
		if(GoodsUnitsEnum.values() != null){
			for (GoodsUnitsEnum enumInfo : GoodsUnitsEnum.values()) {
				EnumsModel eModel = new EnumsModel();
				eModel.setCode(enumInfo.getCode());
				eModel.setDesc(enumInfo.getDesc());
				goodsUnitsList.add(eModel);
			}
		}
		
		model.addAttribute("goodsUnitsList", goodsUnitsList);
		return "template/GoodsInfo/addGoodsInfoPageModel";
		
	}
	
	/**
	 * @author zhangshuai  2017年6月13日 下午12:19:59
	 * @param request
	 * @param response
	 * @param goodsInfo
	 * @return
	 * 添加货物信息
	 */
	@RequestMapping(value="/addGoodsInfoMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addGoodsInfoMation(HttpServletRequest request,HttpServletResponse response,GoodsInfoModel goodsInfo){
		JSONObject jo=new JSONObject();
		
		//获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer id=userInfo.getId();
		Integer orgRootId=userInfo.getOrgRootId();
		Integer orgInfoId=userInfo.getOrgInfoId();
		Integer isSuper=userInfo.getIsSuper();
		
		//判断是新增还是修改
		if(goodsInfo.getSign()==1){
			//添加货物信息
			try {
				jo=goodsInfoFacade.addOrUpdateGoodsInfoMation(goodsInfo,id,orgInfoId,orgRootId,isSuper,userInfo.getUserRole());
			} catch (Exception e) {
				log.error("添加货物信息异常!",e);
				jo.put("success", false);
				jo.put("msg", "添加货物信息异常!");
			}
		}else 
			    //修改货物信息
			if(goodsInfo.getSign()==2){
			try {
				
				jo=goodsInfoFacade.addOrUpdateGoodsInfoMation(goodsInfo,id,orgInfoId,orgRootId,isSuper,userInfo.getUserRole());
			
			} catch (Exception e) {
				
				log.error("修改货物信息异常!",e);
				jo.put("success", false);
				jo.put("msg", "修改货物信息异常!");
				
			}
		}
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月19日 下午6:11:25
	 * @param request
	 * @param response
	 * @return
	 * 根据货物ID查询货物审核状态
	 */
	@RequestMapping(value="/findAuditStatusById",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer findAuditStatusById(HttpServletRequest request,HttpServletResponse response){
		
		//接受前台参数
		Integer id=Integer.parseInt(request.getParameter("id"));
		
		//根据ID查询当前货物审核状态
		Integer auditStatus=goodsInfoFacade.findAuditStatusById(id);
		
		return auditStatus;
	}
	
	/**
	 * @author zhangshuai  2017年6月13日 下午4:20:36
	 * @return
	 * 进入修改页面
	 */
	@RequestMapping(value="/updateGoodsInfoModel",produces="application/json;charset=utf-8")
	public String updateGoodsInfoModel(HttpServletRequest request,HttpServletResponse response,Model model){
		        
				
				String updateGoodsInfo="修改货物信息";
				model.addAttribute("updateGoodsInfo", updateGoodsInfo);
				
				//查询所有货物的计量单位
				List<EnumsModel> goodsUnitsList=new ArrayList<EnumsModel>();
				if(GoodsUnitsEnum.values()!=null){
					for (GoodsUnitsEnum eInfo : GoodsUnitsEnum.values()) {
						EnumsModel eModel= new EnumsModel();
						eModel.setCode(eInfo.getCode());
						eModel.setDesc(eInfo.getDesc());
						goodsUnitsList.add(eModel);
					}
				}
				model.addAttribute("goodsUnitsList", goodsUnitsList);
		        return "template/GoodsInfo/updateGoodsInfoPageModel";
	}
	
	/**
	 * @author zhangshuai  2017年6月13日 下午4:03:17
	 * @param request
	 * @param response
	 * @return
	 * 回显货物信息
	 */
	@RequestMapping(value="/getGoodsInfoById",produces="application/json;charset=utf-8")
	@ResponseBody
	public GoodsInfo getGoodsInfoById(HttpServletRequest request,HttpServletResponse response){
		
		//接受页面参数
		Integer id=Integer.parseInt(request.getParameter("id"));
		
		//根据ID查询货物信息
		GoodsInfo goodsInfo=goodsInfoFacade.getGoodsInfoById(id);
		
		//根据计量单位封装编码
		if(goodsInfo.getUnits()!=null && !"".equals(goodsInfo.getUnits())){
			goodsInfo.setUnitsCode(GoodsUnitsEnum.valueOfDesc(goodsInfo.getUnits()));
		}
		
		return goodsInfo;
	}
	
	/**
	 * @author zhangshuai  2017年7月24日 下午1:34:58
	 * @param request
	 * @param response
	 * @return
	 * 查询操作货物ID是否与登录用户主机构ID一致
	 */
	@RequestMapping(value="/findOrgRootIdByGoodsId",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findOrgRootIdByGoodsId(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面操作货物ID
		Integer goodsId=Integer.parseInt(request.getParameter("id"));
		
		if(userInfo.getUserRole()==5 || userInfo.getUserRole()==6){
			jo.put("success", true);
		}else{
			//根据货物ID查询货物信息
			GoodsInfo goodsInfo = goodsInfoFacade.getGoodsInfoById(goodsId);
			//判断操作货物的主机构ID是否与登录用户主机构ID一致
			if(!uOrgRootId.equals(goodsInfo.getOrgRootId())){
				jo.put("success", false);
			}else{
				jo.put("success", true);
			}
		}
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月13日 下午5:40:44
	 * @param request
	 * @param response
	 * @return
	 * 删除货物信息
	 */
	@RequestMapping(value="/deleteGoodsInfoById",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject deleteGoodsInfoById(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//接收页面参数(货物信息ID)
		//Integer id=Integer.parseInt(request.getParameter("id"));
		List<Integer> goodsIds=new ArrayList<Integer>();
		if(StringUtils.isNotBlank(request.getParameter("id"))){
			String goods=request.getParameter("id").trim();
			String[] goodsArrays=goods.split(",");
			if(goodsArrays.length>0){
				for (String id : goodsArrays) {
					goodsIds.add(Integer.parseInt(id));
				}
			}
		}
		
		//删除货物信息
		try {
			jo=goodsInfoFacade.deleteGoodsInfoById(goodsIds);
		} catch (Exception e) {
			
			log.error("删除货物信息异常!",e);
			jo.put("success", false);
			jo.put("msg", "删除货物信息异常!");
			
		}
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月13日 下午6:25:15
	 * @param request
	 * @param response
	 * @return
	 * 修改货物审核状态
	 */
	@RequestMapping(value="/updateAuditStatus",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject updateAuditStatus(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		//从session中获取登录用户ID
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId=userInfo.getId();
		
		//接收页面参数(货物信息ID)
		//Integer goodsInfoid=Integer.parseInt(request.getParameter("id"));
		List<Integer> goodsIds=new ArrayList<Integer>();
		if(StringUtils.isNotBlank(request.getParameter("id"))){
			String goods=request.getParameter("id").trim();
			String[] goodsArrayIds=goods.split(",");
			if(goodsArrayIds.length>0){
				for (String id : goodsArrayIds) {
					goodsIds.add(Integer.parseInt(id));
				}
			}
		}
 		//修改货物信息审核状态
		try {
			jo=goodsInfoFacade.updateAuditStatus(userInfoId,goodsIds);
		} catch (Exception e) {
			
			log.error("修改货物审核状态异常!",e);
			jo.put("success", false);
			jo.put("msg", "修改货物审核状态异常!");
			
		}
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月19日 下午6:23:19
	 * @param request
	 * @param response
	 * @return
	 * 修改货物状态启用
	 */
	@RequestMapping(value="/enableGoodsInfoStatus",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject enableGoodsInfoStatus(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//接收参数(点击货物ID)
		Integer id=Integer.parseInt(request.getParameter("id"));
		
		//根据货物ID查询当前货物状态
		Integer status=goodsInfoFacade.findGoodsInfoStatus(id);
		if(status==0){
			jo.put("success", false);
			jo.put("msg", "货物已启用!");
		}else{
			//修改货物状态
			jo=goodsInfoFacade.updateGoodsInfoStatus(id,status);
		}
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月19日 下午6:23:19
	 * @param request
	 * @param response
	 * @return
	 * 修改货物状态停用
	 */
	@RequestMapping(value="/disableGoodsInfoStatus",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject disableGoodsInfoStatus(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//接收参数(点击货物ID)
		Integer id=Integer.parseInt(request.getParameter("id"));
		
		//根据货物ID查询当前货物状态
		Integer status=goodsInfoFacade.findGoodsInfoStatus(id);
		if(status==1){
			jo.put("success", false);
			jo.put("msg", "货物已停用!");
		}else{
			//修改货物状态
			jo=goodsInfoFacade.updateGoodsInfoStatus(id,status);
		}
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月14日 下午12:04:58
	 * @param request
	 * @param response
	 * @return
	 * 审核货物
	 */
	@RequestMapping(value="/aduitGoodsStatus",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject aduitGoodsStatus(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		//从session中获取登录用户ID
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		
		//接收前台参数
		/*Integer gId=Integer.parseInt(request.getParameter("id"));*/
		List<Integer> goodsInfoIds=new ArrayList<Integer>();
		if(StringUtils.isNotBlank(request.getParameter("id"))){
			String goodsId=request.getParameter("id").trim();
			String[]  goodsIds=goodsId.split(",");
			if (goodsIds.length > 0) {
				for (String goodId : goodsIds) {
					if (StringUtils.isNotBlank(goodId)) {
						goodsInfoIds.add(Integer.valueOf(goodId.trim()));
					}
				}
			}
		}
		String auditOption=request.getParameter("auditOption");
		Integer auditStatus=Integer.parseInt(request.getParameter("auditStatus"));

		//修改审核意见
		jo=goodsInfoFacade.updateGoodsInfoAudit(uId,goodsInfoIds,auditOption,auditStatus);
		
		return jo;
	}
}
