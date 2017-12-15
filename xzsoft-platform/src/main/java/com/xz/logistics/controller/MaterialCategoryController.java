package com.xz.logistics.controller;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.collections.CollectionUtils;
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
import com.xz.facade.api.GoodsInfoFacade;
import com.xz.facade.api.MaterialCategoryFacade;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.MaterialCategoryPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.MaterialCategoryModel;

/**
 * 物资类别controller
 * 
 * @author luojuan 2017年7月5日
 *
 */
@Controller
@RequestMapping("/materialCategory")
public class MaterialCategoryController  extends BaseController{
	
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private MaterialCategoryFacade materialCategoryFacade;
	
	@Resource
	private GoodsInfoFacade goodsInfoFacade;
	
	/**
	 * 物资类别初始化页面
	 * 
	 * @author luojuan 2017年7月5日
	 */
	@RequestMapping(value = "/rootMaterialCategorylistPage")
	public String rootMaterialCategorylistPage(HttpServletRequest request, Model model){

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 校验当前用户是否平台管理员
		if (userInfo.getUserRole() != 5) {
			JSONObject jo = new JSONObject();
			jo.put("success", Boolean.valueOf(false));
			jo.put("msg", "您不是平台管理员，不能进行物资类别操作！");
			model.addAttribute("content", jo);
			return "template/org/prompt_box_page";
		}
		return "template/materialCategory/show_material_category_list_page";
	}
	
	/**
	 * 物资类别查询
	 * 
	 * @author luojuan 2017年7月6日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/showMaterialCategorylistPage")
	public String showMaterialCategorylistPage(HttpServletRequest request, Model model){
		DataPager<MaterialCategoryPo> MaterialCategoryPager = new DataPager<MaterialCategoryPo>();
		
		// 从session中取出当前用户的用户权限
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();
		
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		MaterialCategoryPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		MaterialCategoryPager.setSize(rows);
		
		//物资类别
		String materialType = null;
		if (params.get("materialType") != null) {
			materialType = params.get("materialType").toString();
		}
		
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("materialType", materialType);
		
		//3、查询物资类别总数
		Integer totalNum = materialCategoryFacade.countMaterialCategoryForPage(queryMap);
		
		//4、分页查询物资类别
		List<MaterialCategoryPo> materialCategoryList = materialCategoryFacade.findMaterialCategoryForPage(queryMap);
		
		//5、总数、分页信息封装
		MaterialCategoryPager.setTotal(totalNum);
		MaterialCategoryPager.setRows(materialCategoryList);
		model.addAttribute("userRole",userRole);
		model.addAttribute("MaterialCategoryPager",MaterialCategoryPager);
		
		return "template/materialCategory/material_category_data";
	}
	
	/**
	 * 新增/编辑物资类别初始页
	 * 
	 * @author luojuan 2017年7月6日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initMaterialCategoryPage")
	public String initMaterialCategoryPage(HttpServletRequest request, Model model){
		
		// 取出操作类型(1:新增物资类别 2:新增物资类别(第二级) 3:编辑)
		String operateType1 = request.getParameter("operateType");
		Integer operateType = Integer.parseInt(operateType1);
		
		String operateTitle = "";

		if(operateType==1){
			operateTitle = "新增物资类别";
		}else if(operateType==2){
			operateTitle = "新增选中物资类别下的物资类别";
			Integer materialCategoryId = Integer.parseInt(request.getParameter("materialCategoryId"));
			MaterialCategoryPo materialCategoryPo = materialCategoryFacade.findMaterialCategoryById(materialCategoryId);
			materialCategoryPo.setMaterialType("");
			model.addAttribute("materialCategoryPo", materialCategoryPo);
		}else{
			operateTitle = "编辑物资类别";
			Integer materialCategoryId = Integer.parseInt(request.getParameter("materialCategoryId"));
			MaterialCategoryPo materialCategoryPo = materialCategoryFacade.findMaterialCategoryById(materialCategoryId);
			model.addAttribute("materialCategoryPo", materialCategoryPo);
		}
		model.addAttribute("operateTitle", operateTitle);
		model.addAttribute("operateType", operateType);
		
		return "template/materialCategory/init_material_category_page";
	}
	
	/**
	 * 新增/编辑物资类别
	 * 
	 * @author luojuan 2017年7月6日
	 * @param request
	 * @param materialCategoryModel
	 * @return
	 * 
	 */
	@RequestMapping(value = "/addOrUpdateMaterialCategory", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateMaterialCategory(HttpServletRequest request,MaterialCategoryModel materialCategoryModel){
		JSONObject jo = null;
		// 从session中取出当前用户的用户Id、用户角色
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		
		try {
			jo = materialCategoryFacade.addMaterialCategory(materialCategoryModel, userInfoId, userRole);
		} catch (Exception e) {
			log.error("物资类别异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "物资类别新增失败");
		}
		
		return jo;
	}
	
	/**
	 * 删除物资类别信息
	 * 
	 * @author luojuan 2017年7月7日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/deleteMaterialCategory", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteMaterialCategory(HttpServletRequest request){
		JSONObject jo = null;
		
		// 从session中取出当前用户的用户ID、用户角色
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		
		// 被操作的物资类别ID
		List<Integer> materialCategoryIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("materialCategoryIds"))) {
			String materialCategoryIds = request.getParameter("materialCategoryIds").trim();
			String[] materialCategoryArray = materialCategoryIds.split(",");
			if(materialCategoryArray.length>0){
				for(String materialCategoryIdStr : materialCategoryArray){
					if(StringUtils.isNotBlank(materialCategoryIdStr)){
						materialCategoryIdList.add(Integer.valueOf(materialCategoryIdStr.trim()));
					}
				}
			}
		}
		
		//所选物资类别信息不能为空
		if(CollectionUtils.isEmpty(materialCategoryIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选物资类别信息不能为空");
			return jo;
		}
		try {
			jo = materialCategoryFacade.deleteMaterialCategory(materialCategoryIdList, userInfoId, userRole);
		} catch (Exception e) {
			log.error("线路信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "线路信息删除失败");
		}
		
		return jo;
	}
	
	/**
	 *货物信息查询初始化页面
	 *
	 * @author luojuan 2017年7月7日
	 */
	@RequestMapping(value = "/searchGoodsInfoListPage")
	public String searchGoodsInfoListPage(HttpServletRequest request, Model model){
		return "template/materialCategory/goods_page";
	}
	
	/**
	 * 货物信息查询
	 * 
	 * @author luojuan 2017年7月7日
	 * @return
	 */
	@RequestMapping("/getGoodsData")
	@ResponseBody
	public List<GoodsInfo> getGoodsData(HttpServletRequest request, Model model) {
		List<GoodsInfo> goodsList = null;
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
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
		
		//封装数据
		queryMap.put("currentPage", (page - 1) * rows);
		queryMap.put("rows", rows);
		
		goodsList = goodsInfoFacade.findGoodsInfoForPage(queryMap);
		
		return goodsList;
	}
	
	/**
	 * 货物信息总数查询
	 * 
	 * @author luojuan 2017年7月7日
	 * @return
	 */
	@RequestMapping("/getGoodsCount")
	@ResponseBody
	public Integer getGoodsCount(HttpServletRequest request, Model model) {
		Integer count = 0;
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 查询参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
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
		
		//封装数据
		queryMap.put("currentPage", (page - 1) * rows);
		queryMap.put("rows", rows);
		
		count = goodsInfoFacade.countGoodsInfoForPage(queryMap);
		
		return count;
	}
	
	/**
	 * 维护货物类别
	 * 
	 * @author luojuan 2017年7月7日
	 */
	@RequestMapping(value = "/updateMaintenanceOfGoods", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject updateMaintenanceOfGoods(HttpServletRequest request){
		JSONObject jo = new JSONObject();
		//获取session中的用户id
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		
		// 前台传入的参数
		Map<String, Object> params = this.paramsToMap(request);
		// 修改参数
		Map<String, Object> updateMap = new HashMap<String, Object>();
		
		// 被操作的货物信息ID
		List<Integer> goodsInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("goodsInfoIds"))) {
			String goodsInfoIds = request.getParameter("goodsInfoIds").trim();
			String[] goodsInfoArray = goodsInfoIds.split(",");
			if(goodsInfoArray.length>0){
				for(String goodsInfoIdStr : goodsInfoArray){
					if(StringUtils.isNotBlank(goodsInfoIdStr)){
						goodsInfoIdList.add(Integer.valueOf(goodsInfoIdStr.trim()));
					}
				}
			}
		}
		
		//货物信息不能为空
		if(CollectionUtils.isEmpty(goodsInfoIdList)){
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选货物信息不能为空");
			return jo;
		}
		
		//校验所选货物信息Id的正确性
		List<GoodsInfo> goodsInfoList = goodsInfoFacade.findGoodsInfoByIds(goodsInfoIdList);
		if (CollectionUtils.isNotEmpty(goodsInfoIdList)) {
			// key:goodsInfoId value:货物信息对象
			Map<Integer, GoodsInfo> goodsInfoMap = CommonUtils.listforMap(goodsInfoList, "id", null);

			for(Integer goodsInfoId : goodsInfoIdList){
				// 货物信息不存在时直接跳过
				GoodsInfo goodsInfo = goodsInfoMap.get(goodsInfoId);
				if (goodsInfo == null) {
					continue;
				}
				
				//物资类别id
				Integer materialCategoryId = 0;
				if (params.get("materialCategoryIds") != null) {
					materialCategoryId = Integer.valueOf((String) params.get("materialCategoryIds"));
				}
				
				//封装数据
				updateMap.put("materialCategoryId", materialCategoryId);
				updateMap.put("updateUser", userInfoId);
				updateMap.put("updateTime", Calendar.getInstance().getTime());
				updateMap.put("goodsInfoId", goodsInfoId);
				
				try {
					goodsInfoFacade.updateMaterialTypeById(updateMap);
					jo.put("success", true);
					jo.put("msg", "维护货物类别成功");
				} catch (Exception e) {
					log.error("维护货物类别异常",e);
					
					jo.put("success", false);
					jo.put("msg", "维护货物类别失败");
				}
			}
		}
		
		return jo;
	}

}
