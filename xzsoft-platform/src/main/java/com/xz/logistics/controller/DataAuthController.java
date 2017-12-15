package com.xz.logistics.controller;

import java.io.Console;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import com.alibaba.fastjson.JSONObject;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.ContractDetailInfoFacade;
import com.xz.facade.api.ContractInfoFacade;
import com.xz.facade.api.DataAuthFacade;
import com.xz.facade.api.EnterpriseUserInfoFacade;
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.LineInfoFacade;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.facade.api.MaterialCategoryFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.UserDataAuthFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.ContractDetailInfo;
import com.xz.model.po.DataAuthPo;
import com.xz.model.po.EnterpriseUserInfo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.MaterialCategoryPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.UserDataAuthPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.DataAuthModel;

/**
 * 
 * @ClassName: DataAuthorigyManagerController  
 * @Description: TODO(这里用一句话描述这个类的作用)  
 * @author A18ccms a18ccms_gmail_com  
 * @date 2017年6月25日 下午5:27:15  
 *
 */

@Controller
@RequestMapping("/dataAuth")
public class DataAuthController extends BaseController {

	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private DataAuthFacade dataAuthFacade;
	@Resource
	private UserDataAuthFacade userDataAuthFacade;
	// 客户(组织机构)
	@Resource
	private OrgInfoFacade orgInfoFacade;
	// 货物
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
	//物资类别
	@Resource
	private MaterialCategoryFacade materialCategoryFacade;
	// 线路
	@Resource
	private LineInfoFacade lineInfoFacade;
	//地点
	@Resource
	private LocationInfoFacade locationInfoFacade;
	//合同
	@Resource
	private ContractInfoFacade contractInfoFacade;
	//合同明细
	@Resource
	private ContractDetailInfoFacade contractDetailInfoFacade;
	// 用户
	@Resource
	private UserInfoFacade userInfoFacade;
	
	@Resource
	private EnterpriseUserInfoFacade enterpriseUserInfoFacade;
	
	
	/**
	 * 
	 * @Title: listDataAuth  
	 * @Description: 数据权限查询
	 * @param @param request
	 * @param @param model    设定文件  
	 * @return void    返回类型  
	 * @throws
	 */
	@RequestMapping("/listDataAuth")
	public String listDataAuth(HttpServletRequest request, Model model){
		DataPager<DataAuthPo> dataAuthPager = new DataPager<DataAuthPo>();
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		dataAuthPager.setPage(page);
		
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		dataAuthPager.setSize(rows);
		
		// 客户
		String customerName = null;
		if (params.get("customerName") != null) {
			customerName = params.get("customerName").toString();
		}
		
		// 货物
		String goodsName = null;
		if (params.get("goodsName") != null) {
			goodsName = params.get("goodsName").toString();
		}
		
		// 线路
		String lineName = null;
		if (params.get("lineName") != null) {
			lineName = params.get("lineName").toString();
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("customerName", customerName);
		queryMap.put("goodsName", goodsName);
		queryMap.put("lineName", lineName);
		
		// 3、查询数据权限总数
		Integer totalNum = dataAuthFacade.countDataAuthForPage(queryMap);
		
		// 4、分页查询组织信息
		List<DataAuthPo> dataAuthList = dataAuthFacade.findDataAuthForPage(queryMap);
		
		// 5、总数、分页信息封装
		dataAuthPager.setTotal(totalNum);
		dataAuthPager.setRows(dataAuthList);
		model.addAttribute("dataAuthPager", dataAuthPager);
		return "template/userDataAuth/data-auth-data";
	}
	
	/**
	 * @author zhangshuai  2017年7月20日 下午12:43:41
	 * @param request
	 * @param response
	 * @return
	 * 查询登录用户的角色信息
	 */
	@RequestMapping(value="/judgeUserRole",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer judgeUserRole(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer userRole=userInfo.getUserRole();
		return userRole;
	}
	
	/**
	 * 
	 * @Title: showDataAuth  
	 * @Description: 显示数据权限管理界面
	 * @param request
	 * @param  model
	 * @param 设定文件  
	 * @return String    返回类型  
	 * @throws
	 */
	@RequestMapping("/showDataAuthPage")
	public String showDataAuthPage(HttpServletRequest request, Model model) {
		return "template/userDataAuth/user-data-auth";
	}
	
	/**
	 * 
	 * @Title: initDataAuthPage  
	 * @Description: 新增或修改数据权限页
	 * @param  request
	 * @param  model
	 * @param  设定文件  
	 * @return String    返回类型  
	 * @throws
	 */
	@RequestMapping("/initDataAuthPage")
	public String initDataAuthPage(HttpServletRequest request,Model model){
		// 取出操作类型(1:新增 2:编辑)
		String operateType = request.getParameter("operateType");

		if ("2".equals(operateType)) {
			
			// 数据权限id
			Integer id = null;
			if (StringUtils.isNotBlank(request.getParameter("id"))) {
				id = Integer.valueOf(request.getParameter("id"));
			}
			
			// 根据数据权限id查询数据信息
			DataAuthPo dataAuthPo = dataAuthFacade.getDataAuthPoById(id);
			
			if (dataAuthPo != null) {
				model.addAttribute("dataAuthPo", dataAuthPo);
			}
		}
		return "template/userDataAuth/user-data-auth";
	}
	
	
	/**
	 * @author zhangshuai  2017年7月19日 上午11:53:29
	 * @param request
	 * @param response
	 * @return
	 * 新增时选择货物进行货物查询
	 */
	@RequestMapping(value="/findGoodsInfoMationAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<GoodsInfo> findGoodsInfoMationAll(HttpServletRequest request,HttpServletResponse response){
		
		//接收前台参数
		Integer page=Integer.parseInt(request.getParameter("page"));//当前页
		Integer rows=Integer.parseInt(request.getParameter("rows"));//每页尺寸
		String goodsName=request.getParameter("goodsInfoName");//模糊条件(货物名称)
		Integer currentPage=(page-1)*rows;//起始页
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("auditStatus", 3);
		params.put("goodsStatus", 0);
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		params.put("goodsName", goodsName);
			
		//分页查询货物信息(审核通过，启用)
		List<GoodsInfo> goodsInfos = goodsInfoFacade.selectGoodsInfoAll(params);
		//封装物资类别
		List<Integer> mateIds=CommonUtils.getValueList(goodsInfos, "materialType");
		//key:物资ID  value：物资名称
		Map<Integer, String> mateMap=null;
		if(CollectionUtils.isNotEmpty(mateIds)){
			List<MaterialCategoryPo> materialCategoryPos = materialCategoryFacade.findMaterialCategoryByIds(mateIds);
			if(CollectionUtils.isNotEmpty(materialCategoryPos)){
				mateMap=CommonUtils.listforMap(materialCategoryPos, "id", "materialType");
			}
		}
		
		for (GoodsInfo goodsInfo : goodsInfos) {
			//封装物资类别名称
			if(MapUtils.isNotEmpty(mateMap)&&mateMap.get(goodsInfo.getMaterialType())!=null){
				goodsInfo.setMaterialTypeName(mateMap.get(goodsInfo.getMaterialType()));
			}
		}
		return goodsInfos;
	}
	
	/**
	 * @author zhangshuai  2017年7月19日 下午1:09:05
	 * @param request
	 * @param response
	 * @return
	 * 进入选择货物框查询货物数量
	 */
	@RequestMapping(value="/getGoodsInfoMationAllCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getGoodsInfoMationAllCount(HttpServletRequest request,HttpServletResponse response){
		
		//接收前台参数
		String goodsName=request.getParameter("goodsInfoName");//模糊条件(货物名称)
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("auditStatus", 3);
		params.put("goodsStatus", 0);
		params.put("goodsName", goodsName);
		return goodsInfoFacade.getCountGoods(params);
	}
	
	/**
	 * @author zhangshuai  2017年7月19日 下午1:42:54
	 * @param request
	 * @param response
	 * @return
	 * 根据选择的货物ID查询货物信息
	 */
	@RequestMapping(value="/findGoodsMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public GoodsInfo findGoodsMationById(HttpServletRequest request,HttpServletResponse response){
		
		//接收前台页面操作的货物ID
		Integer goodsId=Integer.parseInt(request.getParameter("goodsIds"));
		
		//根据操作ID查询货物信息
		List<Integer> goodsInfoIds=new ArrayList<Integer>();
		goodsInfoIds.add(goodsId);
		List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
		GoodsInfo goodsInfo=null;
		if(CollectionUtils.isNotEmpty(goodsInfos)){
			for (GoodsInfo goods : goodsInfos) {
				goodsInfo=goods;
			}
		}
		return goodsInfo;
		
	}
	
	/**
	 * @author zhangshuai  2017年7月28日 下午1:14:08
	 * @param request
	 * @param response
	 * @return
	 * 线路信息全查
	 */
	@RequestMapping(value="/findLineInfoMationAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<LineInfoPo> findLineInfoMationAll(HttpServletRequest request,HttpServletResponse response){
		
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));//当前页
		Integer rows=Integer.parseInt(request.getParameter("rows"));//分页尺寸
		Integer start=(page-1)*rows;//开始页
		String lineName=request.getParameter("lineName");//模糊条件(线路名称)
		
		//查询线路信息(启用)
		
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("start", start);
		params.put("rows", rows);
		params.put("lineName", lineName);
		params.put("lineStatus", 0);
		
		List<LineInfoPo> lineInfoList=lineInfoFacade.findLineInfoForPage(params);
		
		return lineInfoList;
	}
	
	/**
	 * @author zhangshuai  2017年7月19日 下午4:31:30
	 * @param request
	 * @param response
	 * @return
	 * 查询线路数据数量
	 */
	@RequestMapping(value="/getLineInfoMationAllCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getLineInfoMationAllCount(HttpServletRequest request,HttpServletResponse response){
		//接收页面参数
		String lineName=request.getParameter("lineName");//模糊条件(线路名称)
		
		//查询线路信息(启用)
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("lineName", lineName);
		params.put("lineStatus", 0);
		Integer count=lineInfoFacade.countLineInfoForPage(params);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年7月19日 下午5:45:33
	 * @param request
	 * @param response
	 * @return
	 * 根据选择的线路ID查询线路信息
	 */
	@RequestMapping(value="/findLineInfoById",produces="application/json;charset=utf-8")
	@ResponseBody
	public LineInfoPo findLineInfoById(HttpServletRequest request,HttpServletResponse response){
		
		//接收前台操作线路ID
		Integer lineIds=Integer.parseInt(request.getParameter("lineIds"));
		List<Integer> lineInfoIds=new ArrayList<Integer>();
		lineInfoIds.add(lineIds);
		List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
		LineInfoPo lineInfo=null;
		if(CollectionUtils.isNotEmpty(lineInfoPos)){
			for (LineInfoPo lineInfoPo : lineInfoPos) {
				lineInfo=lineInfoPo;
			}
		}
		return lineInfo;
	}
	
	/**
	 * @author zhangshuai  2017年7月19日 下午6:33:35
	 * @param request
	 * @param response
	 * @return
	 * 登录用户主机构匹配承运方主机构查询合同明细信息
	 */
	@RequestMapping(value="/findContractMationAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<ContractDetailInfo> findContractMationAll(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户主机构信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));//当前页
		Integer rows=Integer.parseInt(request.getParameter("rows"));//分页尺寸
		Integer start=(page-1)*rows;//开始页
		String contractName=request.getParameter("contractName");//合同名称
		
		//货物
		String goodsName = null;
		if(request.getParameter("goodsName") != null){
			goodsName = request.getParameter("goodsName");
		}
		//线路
		String lineName = null;
		if(request.getParameter("lineName") != null){
			lineName = request.getParameter("lineName");
		}
		//发货单位
		String forwardingUnit = null;
		if(request.getParameter("forwardingUnit") != null){
			forwardingUnit = request.getParameter("forwardingUnit");
		}
		//到货单位
		String consignee = null;
		if(request.getParameter("consignee") != null){
			consignee = request.getParameter("consignee");
		}
		
		//先匹配合同主信息的承运方主机构查询出合同id
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("shipperOrgRoot", uOrgRootId);
		params.put("contractName", contractName);
		List<ContractDetailInfo> contractDetailInfos = contractDetailInfoFacade.findContractInfoForPage(params);
		
		List<Integer> conIds=new ArrayList<Integer>();
		for (ContractDetailInfo contractDetailInfo : contractDetailInfos) {
			conIds.add(contractDetailInfo.getContractInfoId());
		}
		
		//登录用户主机构ID匹配承运方主机构查询合同明细信息
		Map<String, Object> queryMap=new HashMap<String,Object>();
		//queryMap.put("shipperOrgRoot", uOrgRootId);
		queryMap.put("list", conIds);
		queryMap.put("start",start);
		queryMap.put("rows", rows);
		queryMap.put("goodsName", goodsName);
		queryMap.put("lineName", lineName);
		queryMap.put("forwardingUnit", forwardingUnit);
		queryMap.put("consignee", consignee);
		List<ContractDetailInfo> contractInfos=contractDetailInfoFacade.findContractDetailInfo(queryMap);
		//封装委托方名称
		List<Integer> entrustIds=CommonUtils.getValueList(contractInfos, "entrust");
		//key：组织ID  value：组织名称
		Map<Integer, String> entrustMap=null;
		if(CollectionUtils.isNotEmpty(entrustIds)){
			List<OrgInfoPo> entrusts=orgInfoFacade.findOrgNameByIds(entrustIds);
			if(CollectionUtils.isNotEmpty(entrusts)){
				entrustMap=CommonUtils.listforMap(entrusts, "id", "orgName");
			}
		}
		
		//封装承运发名称
		List<Integer> shipperIds=CommonUtils.getValueList(contractInfos, "shipper");
		//key：组织ID  value：组织名称
		Map<Integer, String> shipperMap=null;
		if(CollectionUtils.isNotEmpty(shipperIds)){
			List<OrgInfoPo> shippers=orgInfoFacade.findOrgNameByIds(shipperIds);
			if(CollectionUtils.isNotEmpty(shippers)){
				shipperMap=CommonUtils.listforMap(shippers, "id", "orgName");
			}
		}
		
		//封装货物
		List<Integer> goodsIds=CommonUtils.getValueList(contractInfos, "goodsInfoId");
		//key:货物ID   value：货物名称
		Map<Integer,String> goodsMap=null;
		if(CollectionUtils.isNotEmpty(goodsIds)){
			List<GoodsInfo> goodsInfos=goodsInfoFacade.findGoodsInfoByIds(goodsIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				goodsMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}
		}
		
		//封装线路
		List<Integer> lineIds=CommonUtils.getValueList(contractInfos, "lineInfoId");
		//key:线路ID  value:线路名称
		Map<Integer, String> lineMap=null;
		if(CollectionUtils.isNotEmpty(lineIds)){
			List<LineInfoPo> lineInfos=lineInfoFacade.findLineInfoByIds(lineIds);
			if(CollectionUtils.isNotEmpty(lineInfos)){
				lineMap=CommonUtils.listforMap(lineInfos, "id", "lineName");
			}
		}
		for(ContractDetailInfo con:contractInfos){
			
			//封装委托方名称
			if(MapUtils.isNotEmpty(entrustMap)&&entrustMap.get(con.getEntrust())!=null){
				con.setEntrustName(entrustMap.get(con.getEntrust()));
			}
			//封装承运方名称
			if(MapUtils.isNotEmpty(shipperMap)&&shipperMap.get(con.getShipper())!=null){
				con.setShipperName(shipperMap.get(con.getShipper()));
			}
			//封装货物名称
			if(MapUtils.isNotEmpty(goodsMap)&&goodsMap.get(con.getGoodsInfoId())!=null){
				con.setGoodsName(goodsMap.get(con.getGoodsInfoId()));
			}
			//封装线路名称
			if(MapUtils.isNotEmpty(lineMap)&&lineMap.get(con.getLineInfoId())!=null){
				con.setLineName(lineMap.get(con.getLineInfoId()));
			}
		}
		return contractInfos;
		
	}
	
	/**
	 * @author zhangshuai  2017年7月19日 下午6:56:00
	 * @param request
	 * @param response
	 * @return
	 * 查询合同数量
	 */
	@RequestMapping(value="/getContractMationAllCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getContractMationAllCount(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户主机构信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		String contractName=request.getParameter("contractName");//合同名称
		
		//货物
		String goodsName = null;
		if(request.getParameter("goodsName") != null){
			goodsName = request.getParameter("goodsName");
		}
		//线路
		String lineName = null;
		if(request.getParameter("lineName") != null){
			lineName = request.getParameter("lineName");
		}
		//发货单位
		String forwardingUnit = null;
		if(request.getParameter("forwardingUnit") != null){
			forwardingUnit = request.getParameter("forwardingUnit");
		}
		//到货单位
		String consignee = null;
		if(request.getParameter("consignee") != null){
			consignee = request.getParameter("consignee");
		}
		
		//先匹配合同主信息的承运方主机构查询出合同id
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("shipperOrgRoot", uOrgRootId);
		params.put("contractName", contractName);
		List<ContractDetailInfo> contractDetailInfos = contractDetailInfoFacade.findContractInfoForPage(params);
		
		List<Integer> conIds=new ArrayList<Integer>();
		for (ContractDetailInfo contractDetailInfo : contractDetailInfos) {
			conIds.add(contractDetailInfo.getContractInfoId());
		}
		
		//登录用户主机构ID匹配承运方主机构查询合同明细信息
		Map<String, Object> queryMap=new HashMap<String,Object>();
		//queryMap.put("shipperOrgRoot", uOrgRootId);
		queryMap.put("list", conIds);
		queryMap.put("goodsName", goodsName);
		queryMap.put("lineName", lineName);
		queryMap.put("forwardingUnit", forwardingUnit);
		queryMap.put("consignee", consignee);
		Integer count=contractDetailInfoFacade.findContractDetailInfo(queryMap).size();
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年7月19日 下午8:05:40
	 * @param request
	 * @param response
	 * @return
	 * 根据选择的合同ID查询合同信息
	 */
	@RequestMapping(value="/findContractMationById",produces="application/json;charset=utf-8")
	@ResponseBody
	public ContractDetailInfo findContractMationById(HttpServletRequest request,HttpServletResponse response){
		
		//接收页面操作的合同明细ID
		Integer contrantId=Integer.valueOf(request.getParameter("contractId"));
		//根据ID查询合同明细信息
		 ContractDetailInfo contractInfo = contractDetailInfoFacade.findContractDetailInfoAllById(contrantId);
		
		//封装货物
		List<Integer> goodsInfoIds=new ArrayList<Integer>();
		goodsInfoIds.add(contractInfo.getGoodsInfoId());
		if(CollectionUtils.isNotEmpty(goodsInfoIds)){
			List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				for (GoodsInfo goodsInfo : goodsInfos) {
					contractInfo.setGoodsName(goodsInfo.getGoodsName());
					contractInfo.setGoodsInfoId(goodsInfo.getId());
				}
			}
		}
		
		
		//封装线路
		List<Integer> lineInfoIds=new ArrayList<Integer>();
		lineInfoIds.add(contractInfo.getLineInfoId());
		if(CollectionUtils.isNotEmpty(lineInfoIds)){
			List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
			if(CollectionUtils.isNotEmpty(lineInfoPos)){
				for (LineInfoPo lineInfo : lineInfoPos) {
					contractInfo.setLineInfoId(lineInfo.getId());
					contractInfo.setLineName(lineInfo.getLineName());
				}
			}
		}
		
		
		//封装委托方
		List<Integer> orgId=new ArrayList<Integer>();
		orgId.add(contractInfo.getEntrust());
		if(CollectionUtils.isNotEmpty(orgId)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgId);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					contractInfo.setEntrustName(orgInfoPo.getOrgName());
				}
			}
		}
		
		return contractInfo;
	}
	
	/**
	 * 
	 * @Title: getDataAuthById  
	 * @Description: 根据id获取数据权限数据
	 * @param @param request
	 * @param @return    设定文件  
	 * @return JSONObject    返回类型  
	 * @throws
	 */
	@RequestMapping("/getDataAuthById")
	@ResponseBody
	public JSONObject getDataAuthById(HttpServletRequest request){
		JSONObject jo = null;
		// 数据权限id
		Integer id = null;
		if (StringUtils.isNotBlank(request.getParameter("id"))) {
			id = Integer.valueOf(request.getParameter("id"));
		}
		// 根据数据权限id查询数据信息
		DataAuthPo dataAuthPo = dataAuthFacade.getDataAuthPoById(id);
		
		jo = new JSONObject();
		jo.put("dataAuthPo", dataAuthPo);
		return jo;
	}
	/**
	 * 
	 * @Title: addOrUpdateDataAuth  
	 * @Description: 新增或修改数据权限
	 * @param @param request
	 * @param @param dataAuthModel
	 * @param @return    设定文件  
	 * @return JSONObject    返回类型  
	 * @throws
	 */
	@RequestMapping(value = "/addOrUpdateDataAuth", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateDataAuth(HttpServletRequest request) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// id
		Integer id = null;
		if (!StringUtils.isBlank(request.getParameter("id"))) {
			id = Integer.valueOf(request.getParameter("id"));
		}
		// 权限名称
		String authName = null;
		if (!StringUtils.isBlank(request.getParameter("authName"))) {
			authName = request.getParameter("authName");
		}
		// 货物id
		Integer goods = null;
		if (!StringUtils.isBlank(request.getParameter("goods"))) {
			goods = Integer.valueOf(request.getParameter("goods"));
		}
		// 线路id
		Integer line = null;
		if (!StringUtils.isBlank(request.getParameter("line"))) {
			line = Integer.valueOf(request.getParameter("line"));
		}
		// 客户id
		Integer customer = null;
		if (!StringUtils.isBlank(request.getParameter("customer"))) {
			customer = Integer.valueOf(request.getParameter("customer"));
		}
		// 协同状态
		Integer cooperateStatus = null;
		if (!StringUtils.isBlank(request.getParameter("cooperateStatus"))) {
			cooperateStatus = Integer.valueOf(request.getParameter("cooperateStatus"));
		}
		try {
			DataAuthPo dataAuthPo = new DataAuthPo();
			dataAuthPo.setId(id);
			dataAuthPo.setAuthName(authName);;
			dataAuthPo.setGoods(goods);
			dataAuthPo.setLine(line);
			dataAuthPo.setCustomer(customer);
			dataAuthPo.setCooperateState(cooperateStatus);
			DataAuthModel dataAuthModel = new DataAuthModel();
			dataAuthModel.setDataAuthPo(dataAuthPo);
			jo = dataAuthFacade.addOrUpdateDataAuth(dataAuthModel, userInfo);
		} catch (Exception e) {
			log.error("数据权限异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "系统异常，请稍后重试");
		}

		return jo;
	}
	
	/**
	 * 
	 * @Title: deleteDataAuth  
	 * @Description: 删除数据权限  
	 * @param @param request
	 * @param @param dataAuthModel
	 * @param @return    设定文件  
	 * @return JSONObject    返回类型  
	 * @throws
	 */
	@RequestMapping(value = "/deleteDataAuth", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteDataAuth(HttpServletRequest request, DataAuthModel dataAuthModel) {
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		
		// 数据权限ID
		String ids = null;
		if (StringUtils.isNotBlank(request.getParameter("ids"))) {
			ids = request.getParameter("ids");
		}
		System.out.println(ids);
		try {
			// 删除组织信息  id 和  ids只有一个存在
			jo = dataAuthFacade.deleteDataAuth(orgRootId,ids);
			
			
		} catch (Exception e) {
			log.error("删除权限信息异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "删除权限信息服务异常，请稍后重试");
		}
		return jo;
	}
	
	
	/**
	 * 
	 * @Title: showDataAuth  
	 * @Description: 显示数据权限管理界面
	 * @param request
	 * @param  model
	 * @param 设定文件  
	 * @return String    返回类型  
	 * @throws
	 */
	@RequestMapping("/showDataAuthDetailPage")
	public String showDataAuthDetailPage(HttpServletRequest request, Model model) {
		return "template/userDataAuth/user-auth-detail";
	}
	
	/**
	 * 
	 * @Title: listDataAuth  
	 * @Description: 数据权限查询
	 * @param @param request
	 * @param @param model    设定文件  
	 * @return void    返回类型  
	 * @throws
	 */
	@RequestMapping("/listUserDataAuth")
	public String listUserDataAuth(HttpServletRequest request, Model model){
		DataPager<UserDataAuthPo> userDataAuthPager = new DataPager<UserDataAuthPo>();
		
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
				
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		userDataAuthPager.setPage(page);
		
		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		userDataAuthPager.setSize(rows);
		 
		// 用户
		String userName = null;
		if (params.get("authUser") != null) {
			userName = params.get("authUser").toString();
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("userName", userName);
		
		// 3、查询数据权限总数
		Integer totalNum = userDataAuthFacade.countUserDataAuthForPage(queryMap);
		
		// 4、分页查询组织信息
		List<UserDataAuthPo> userDataAuthList = userDataAuthFacade.findUserDataAuthForPage(queryMap);
		
		//根据查询出的权限信息查询权限数据的客户、货物、线路
		List<Integer> dataAuth=new ArrayList<Integer>();
		if(CollectionUtils.isNotEmpty(userDataAuthList)){
			for (UserDataAuthPo userDataAuthPo : userDataAuthList) {
				dataAuth.add(userDataAuthPo.getDataAuthId());
			}
		}else{
			// 9、总数、分页信息封装
			userDataAuthPager.setTotal(totalNum);
			userDataAuthPager.setRows(userDataAuthList);
			model.addAttribute("userDataAuthPager", userDataAuthPager);
			return "template/userDataAuth/user_data_auth_data";
		}
		
		List<DataAuthPo> dataAuthPos = dataAuthFacade.findDataAuthNameByIds(dataAuth);
		
		//封装权限名称
		List<Integer> dataAuthIds=CommonUtils.getValueList(userDataAuthList, "dataAuthId");
		Map<Integer, String> dataAuthMap=null;
		if(CollectionUtils.isNotEmpty(dataAuthIds)){
			List<DataAuthPo> dataAuths=dataAuthFacade.findDataAuthNameByIds(dataAuthIds);
			if(CollectionUtils.isNotEmpty(dataAuths)){
				dataAuthMap=CommonUtils.listforMap(dataAuths, "id", "authName");
			}
		}
		
		//封装货物名称
		List<Integer> goodsIds=CommonUtils.getValueList(dataAuthPos, "goods");
		Map<Integer, String> goodsNameMap=null;
		if(CollectionUtils.isNotEmpty(goodsIds)){
			List<GoodsInfo> goodsInfos = goodsInfoFacade.findGoodsInfoByIds(goodsIds);
			if(CollectionUtils.isNotEmpty(goodsInfos)){
				goodsNameMap=CommonUtils.listforMap(goodsInfos, "id", "goodsName");
			}
		}
		
		//封装线路名称
		List<Integer> lineIds=CommonUtils.getValueList(dataAuthPos, "line");
		Map<Integer, String> lineNameMap=null;
		if(CollectionUtils.isNotEmpty(lineIds)){
			List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineIds);
			if(CollectionUtils.isNotEmpty(lineInfoPos)){
				lineNameMap=CommonUtils.listforMap(lineInfoPos, "id", "lineName");
			}
		}
		
		//封装客户名称
		List<Integer> orgIds=CommonUtils.getValueList(dataAuthPos, "customer");
		Map<Integer, String> orgNameMap=null;
		if(CollectionUtils.isNotEmpty(orgIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				orgNameMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		
		for (UserDataAuthPo userDataAuthPo : userDataAuthList) {
			//封装权限名称
			if(MapUtils.isNotEmpty(dataAuthMap)&&dataAuthMap.get(userDataAuthPo.getDataAuthId())!=null){
				userDataAuthPo.setAuthName(dataAuthMap.get(userDataAuthPo.getDataAuthId()));
			}
			if(userDataAuthPo.getRole()!=null){
				//企业货主
				if(userDataAuthPo.getRole()==1){
					
					//取出条件组
					String conditionGroups=userDataAuthPo.getConditionGroup();
					if(conditionGroups!=null&&StringUtils.isNotBlank(conditionGroups)){
						//分割条件组
						String[] conditionGroupList=conditionGroups.split(",");
						Integer goodsId=Integer.parseInt(conditionGroupList[0]);//货物ID
						Integer lineId=Integer.parseInt(conditionGroupList[1]);//线路ID
						//根据货物ID查询货物名称
						/*List<Integer> goodsInfoIds=new ArrayList<Integer>();
						goodsInfoIds.add(goodsId);
						List<GoodsInfo> goodss = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
						GoodsInfo goodsInfo=null;
						if(CollectionUtils.isNotEmpty(goodss)){
							for (GoodsInfo goodsInfos : goodss) {
								goodsInfo=goodsInfos;
							}
						}
						//根据线路ID查询线路
						List<Integer> lineInfoIds=new ArrayList<Integer>();
						lineInfoIds.add(lineId);
						List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
						LineInfoPo lineInfo=null;
						if(CollectionUtils.isNotEmpty(lineInfoPos)){
							for (LineInfoPo lineInfoPo : lineInfoPos) {
								lineInfo=lineInfoPo;
							}
						}*/
						
						userDataAuthPo.setConditionGroup(goodsNameMap.get(goodsId)+","+lineNameMap.get(lineId));
					}
					
				}else 
					//物流公司
					if(userDataAuthPo.getRole()==2){
						//取出条件组
						String conditionGroups=userDataAuthPo.getConditionGroup();
						if(conditionGroups!=null&&StringUtils.isNotBlank(conditionGroups)){
							//分割条件组
							String[] conditionGroupList=conditionGroups.split(",");
							Integer orgId=Integer.parseInt(conditionGroupList[0]);//客户ID
							Integer goodsId=Integer.parseInt(conditionGroupList[1]);//货物ID
							Integer lineId=Integer.parseInt(conditionGroupList[2]);//线路ID
							//根据客户ID查询组织名称
							/*List<Integer> orgInfoIds=new ArrayList<Integer>();
							orgInfoIds.add(orgId);
							OrgInfoPo orgInfoPo=null;
							if(CollectionUtils.isNotEmpty(orgInfoIds)){
								List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgInfoIds);
								if(CollectionUtils.isNotEmpty(orgInfoPos)){
									for (OrgInfoPo orgInfo : orgInfoPos) {
										orgInfoPo=orgInfo;
									}
								}
							}*/
							//根据货物ID查询货物名称
							/*List<Integer> goodsInfoIds=new ArrayList<Integer>();
							goodsInfoIds.add(goodsId);
							List<GoodsInfo> goodss = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIds);
							GoodsInfo goodsInfo=null;
							if(CollectionUtils.isNotEmpty(goodss)){
								for (GoodsInfo goodsInfos : goodss) {
									goodsInfo=goodsInfos;
								}
							}*/
							//根据线路ID查询线路
							/*List<Integer> lineInfoIds=new ArrayList<Integer>();
							lineInfoIds.add(lineId);
							List<LineInfoPo> lineInfoPos = lineInfoFacade.findLineInfoByIds(lineInfoIds);
							LineInfoPo lineInfo=null;
							if(CollectionUtils.isNotEmpty(lineInfoPos)){
								for (LineInfoPo lineInfoPo : lineInfoPos) {
									lineInfo=lineInfoPo;
								}
							}*/
								userDataAuthPo.setConditionGroup(orgNameMap.get(orgId)+","+goodsNameMap.get(goodsId)+","+lineNameMap.get(lineId));
						}
				}
			}
			
		}
		
		// 9、总数、分页信息封装
		userDataAuthPager.setTotal(totalNum);
		userDataAuthPager.setRows(userDataAuthList);
		model.addAttribute("userDataAuthPager", userDataAuthPager);
		return "template/userDataAuth/user_data_auth_data";
	}
	
	/** 
	* @方法名: listUserDataAuthCount 
	* @作者: zhangshuai
	* @时间: 2017年10月16日 下午4:43:25
	* @返回值类型: Integer 
	* @throws 
	*/
	@RequestMapping(value="/listUserDataAuthCount")
	@ResponseBody
	public Integer listUserDataAuthCount(HttpServletRequest request, Model model){
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		// 用户
		String userName=request.getParameter("authUser");
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("orgRootId", orgRootId);
		queryMap.put("userName", userName);
		
		// 3、查询数据权限总数
		Integer totalNum = userDataAuthFacade.countUserDataAuthForPage(queryMap);
		
		return totalNum;
		
	}
	
	/**
	 * @author zhangshuai  2017年7月19日 下午11:43:47
	 * @param request
	 * @param response
	 * @return
	 * 进入用户授权页面时查询相关的用户信息
	 */
	@RequestMapping(value="/findUserMationAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<EnterpriseUserInfo> findUserMationAll(HttpServletRequest request,HttpServletResponse response){
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer start=(page-1)*rows;
		String realName=request.getParameter("realName");
		//根据主机构ID查询相关的用户
		Map<String, Object> queryMap=new HashMap<String,Object>();
		queryMap.put("start", start);
		queryMap.put("rows", rows);
		queryMap.put("orgRootId", uOrgRootId);
		queryMap.put("realName", realName);
		//根据登录用户主机构查询企业用户表
		List<EnterpriseUserInfo> enterpriseUserInfos=enterpriseUserInfoFacade.getEnterpriseUserInfoByOrgRootId(queryMap);
		
		//封装组织机构信息
		List<Integer> orgIds=CommonUtils.getValueList(enterpriseUserInfos, "orgInfoId");
		//key：组织ID  value：组织名称
		Map<Integer, String> orgMap=null;
		if(CollectionUtils.isNotEmpty(orgIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				orgMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		
		if(CollectionUtils.isNotEmpty(enterpriseUserInfos)){
			for (EnterpriseUserInfo enterpriseUserInfo : enterpriseUserInfos) {
				//封装机构名称
				if(MapUtils.isNotEmpty(orgMap)&&orgMap.get(enterpriseUserInfo.getOrgInfoId())!=null){
					enterpriseUserInfo.setOrgName(orgMap.get(enterpriseUserInfo.getOrgInfoId()));
				}
			}
		}
		
		/*List<UserInfo> userInfoList=userInfoFacade.findUserInfoMationByOrgRootId(params);
		
		//封装组织机构信息
		List<Integer> orgIds=CommonUtils.getValueList(userInfoList, "orgInfoId");
		//key：组织ID  value：组织名称
		Map<Integer, String> orgMap=null;
		if(CollectionUtils.isNotEmpty(orgIds)){
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				orgMap=CommonUtils.listforMap(orgInfoPos, "id", "orgName");
			}
		}
		// 5、封装用户真实姓名
		List<EnterpriseUserInfo> enterpriseUserInfos = new ArrayList<EnterpriseUserInfo>();
		List<Integer> userInfoIds = CommonUtils.getValueList(userInfoList, "id");
		if(CollectionUtils.isNotEmpty(userInfoIds)){
			enterpriseUserInfos = enterpriseUserInfoFacade.getEnterpriseUserInfoByUserInfoIds(userInfoIds);
		}
		// key:用户ID value:用户真实姓名
		Map<Integer, String> enterpriseUserInfoMap = null;
		if (CollectionUtils.isNotEmpty(enterpriseUserInfos)) {
			enterpriseUserInfoMap = CommonUtils.listforMap(enterpriseUserInfos, "userInfoId", "realName");
		}
		for (UserInfo userInfo2 : userInfoList) {
			//封装机构名称
			if(MapUtils.isNotEmpty(orgMap)&&orgMap.get(userInfo2.getOrgInfoId())!=null){
				userInfo2.setOrgName(orgMap.get(userInfo2.getOrgInfoId()));
			}
			
			if(MapUtils.isNotEmpty(enterpriseUserInfoMap)){
				if(enterpriseUserInfoMap.get(userInfo2.getId())!=null){
					userInfo2.setRealName(enterpriseUserInfoMap.get(userInfo2.getId()));
				}else{
					userInfo2.setRealName("");
				}
			}
		}*/
		return enterpriseUserInfos;
		
	}
	
	/**
	 * @author zhangshuai  2017年7月20日 上午12:03:55
	 * @param request
	 * @param response
	 * @return
	 * 查询相关用户总数
	 */
	@RequestMapping(value="/getUserMationAllCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getUserMationAllCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		String realName=request.getParameter("realName");
		//根据主机构ID查询相关的用户
		Map<String, Object> queryMap=new HashMap<String,Object>();
		queryMap.put("orgRootId", uOrgRootId);
		queryMap.put("realName", realName);
		//根据登录用户主机构查询企业用户表
		Integer count =enterpriseUserInfoFacade.getEnterpriseUserInfoCountByOrgRootId(queryMap);
		return count;
	}
	
	/**
	 * 
	 * @Title: authDataAuth  
	 * @Description: 授权  
	 * @param request
	 * @param dataAuthModel
	 * @param @return    设定文件  
	 * @return JSONObject    返回类型  
	 * @throws
	 */
	@RequestMapping(value = "/authDataAuth", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject authDataAuth(HttpServletRequest request) {
		JSONObject jo = null;
		
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		
		// 数据权限ID 
		Integer dataAuthId = null;
		if (request.getParameter("dataAuthId") != null) {
			dataAuthId = Integer.valueOf(request.getParameter("dataAuthId"));
		}
		
		String userInfoIds = null;
		if (StringUtils.isNotBlank(request.getParameter("userInfoIds"))) {
			userInfoIds = request.getParameter("userInfoIds");
		}
		//userInfoIds = "239,240";  // 测试数据
		try {
			// 新增授权信息
			jo = userDataAuthFacade.addUserDataAuth(userInfo,userInfoIds, dataAuthId);
		} catch (Exception e) {
			log.error("授权信息异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "授权信息异常，请稍后重试");
		}
		return jo;
	}
	
	/**
	 * 
	 * @Title: cancelAuthDataAuth  
	 * @Description: 取消授权
	 * @param @param request
	 * @param @param dataAuthModel
	 * @param @return    设定文件  
	 * @return JSONObject    返回类型  
	 * @throws
	 */
	@RequestMapping(value = "/cancelAuthDataAuth", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject cancelAuthDataAuth(HttpServletRequest request){
		JSONObject jo = null;
		

		// 用户数据权限ids (批量取消授权)
		String ids = null;
		if (request.getParameter("ids") != null) {
			ids = request.getParameter("ids");
		}
		
		// id  和  ids  只有一个有值存在
		try {

			jo = userDataAuthFacade.deleteUserDataAuth(ids);
			
		} catch (Exception e) {
			log.error("取消授权异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "系统异常，请稍后重试");
		}
		return jo;
	}
}
