package com.xz.logistics.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.xz.facade.api.CouponSupplierInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.CouponSupplierInfoPo;
import com.xz.model.po.CouponSupplierOperateLogPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.CouponSupplierInfoModel;

/**
 * 有价劵供应商Controller
 * @author luojuan 2017年5月31日
 *
 */
@Controller
@RequestMapping("/couponSupplierInfo")
public class CouponSupplierInfoController extends BaseController{
	
	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private CouponSupplierInfoFacade couponSupplierInfoFacade;
	
	@Resource
	private UserInfoFacade userInfoFacade;
	
	//初始化页面
	@RequestMapping("/rootCouponSupplierInfoInitPage")
	public String rootCouponSupplierInfoInitPage(){
		
		return "template/couponSupplier/root_coupon_supplier_info_init_page";
	}
	
	/**
	 * 模糊查询有价券供应商
	 */
	@RequestMapping(value="/getCouponSupplierInfoById",produces = "application/json; charset=utf-8")
	@ResponseBody
	List<CouponSupplierInfoPo> getCouponSupplierInfoById(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取主机构ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer orgInfoRootId = userInfo.getOrgRootId();
		
		String supplierName=request.getParameter("supplierName");
		
		String isAvailable1=request.getParameter("isAvailable");
		
		Integer isAvailable;
		if(isAvailable1!=""){
			 isAvailable = Integer.parseInt(isAvailable1);
		}else{
			 isAvailable = null;
		}
		
		//当前页数
		String page1=request.getParameter("page");
		Integer page2=Integer.parseInt(page1);
		//每页尺寸
		String rows1 = request.getParameter("rows");
		Integer rows = Integer.parseInt(rows1);
		Integer page = page2*rows;
		
		List<CouponSupplierInfoPo> couponSupplierInfoPoList = couponSupplierInfoFacade.getCouponSupplierInfoById(supplierName, isAvailable, orgInfoRootId, page, rows);
		for (CouponSupplierInfoPo couponSupplierInfoPo : couponSupplierInfoPoList) {
			//格式化创建时间
			String createTime = new SimpleDateFormat("yyyy-MM-dd").format(couponSupplierInfoPo.getCreateTime());
			couponSupplierInfoPo.setCreateTimeStr(createTime);
			//前台获取创建人姓名
			UserInfo userInfoStr = (UserInfo)userInfoFacade.getUserInfoById(couponSupplierInfoPo.getCreateUser());
			couponSupplierInfoPo.setCreateUserStr(userInfoStr.getUserName());
			//获取是否启用
			if(couponSupplierInfoPo.getIsAvailable()==1){
				couponSupplierInfoPo.setIsAvailableStatus("已启用");
			}else{
				couponSupplierInfoPo.setIsAvailableStatus("已停用");
			}
		}
		return couponSupplierInfoPoList;
	}
	
	@RequestMapping(value="/getCount",produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getCount(HttpServletRequest request,HttpServletResponse response){
		//从session中获取主机构ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer orgInfoRootId = userInfo.getOrgRootId();
		
		String supplierName=request.getParameter("supplierName");
		
		String isAvailable1=request.getParameter("isAvailable");
		
		if(isAvailable1!=""){
			//Integer isAvailable = Integer.parseInt(isAvailable1);
		}
		
		Integer isAvailable = 1;
		
		Integer count = couponSupplierInfoFacade.countCouponSupplierInfoForPage(supplierName, isAvailable, orgInfoRootId);
		
		return count;
	}
	
	/**
	 * 新增/编辑有价券供应商初始页
	 * 
	 * @author luojuan 2017年6月1日
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping("/initCouponSupplierPage")
	public String initCouponSupplierPage(HttpServletRequest request, Model model) {
		// 取出操作类型(1:新增 2:编辑)
		String operateType1 = request.getParameter("operateType");
		Integer operateType = Integer.parseInt(operateType1);
		
		String operateTitle = "";

		if(operateType==1){
			operateTitle = "新增";
		}else{
			operateTitle = "编辑";
			Integer id = Integer.parseInt(request.getParameter("id"));
			CouponSupplierInfoPo couponSupplierInfoPo = couponSupplierInfoFacade.findCouponSupplierById(id);
			model.addAttribute("couponSupplierInfoPo", couponSupplierInfoPo);
		}
		model.addAttribute("operateTitle", operateTitle);
		
		return "template/couponSupplier/init_coupon_supplier_page";
	}
	
	/**
	 * 新增/编辑有价券供应商
	 * @author luojuan 2017年6月2日
	 * @param request
	 * @param couponSupplierInfoModel
	 * @return
	 */
	@RequestMapping(value = "/addOrUpdateCouponSupplier", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject addOrUpdateCouponSupplier(HttpServletRequest request,CouponSupplierInfoModel couponSupplierInfoModel){
		
		JSONObject jo = null;
		//从session中获取主机构ID
		UserInfo userInfo = (UserInfo)request.getSession().getAttribute("userInfo");
		Integer userInfoId = userInfo.getId();
		Integer orgInfoRootId = userInfo.getOrgRootId();

		try {
			jo = couponSupplierInfoFacade.addCouponSupplier(couponSupplierInfoModel, orgInfoRootId,userInfoId);
			
		} catch (Exception e) {
			log.error("有价券供应商信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "有价券供应商信息异常，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * 删除有价券供应商
	 * @author luojuan 2017年6月5日
	 * @param request
	 * @param couponSupplierInfoModel
	 * @return
	 */
	@RequestMapping(value = "/deleteCouponSupplier", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteCouponSupplier(HttpServletRequest request,HttpServletResponse response){
		
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		
		//获取有价券ID
		List<Integer> couponSupplierInfoIdList = new ArrayList<Integer>();
		if(StringUtils.isNotBlank(request.getParameter("couponSupplierInfoIds"))){
			String couponSupplierInfoIds = request.getParameter("couponSupplierInfoIds").trim();
			String[] couponSupplierInfoArray = couponSupplierInfoIds.split(",");
			if(couponSupplierInfoArray.length>0){
				for(String couponSupplierInfoIdStr : couponSupplierInfoArray){
					if(StringUtils.isNotBlank(couponSupplierInfoIdStr)){
						couponSupplierInfoIdList.add(Integer.valueOf(couponSupplierInfoIdStr.trim()));
					}
				}
			}
		}
		try {
			jo = couponSupplierInfoFacade.deleteCouponSupplierByIdAndOrgInfoRootId(rootOrgInfoId, couponSupplierInfoIdList, userInfoId);
		} catch (Exception e) {
			log.error("删除有价券供应商信息异常",e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "删除有价券供应商信息异常，请稍后重试");
		}
		return jo;
	}
	
	/**
	 * 启用/停用有价券供应商
	 * 
	 * @author luojuan 2017年6月6日
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/operateSubCouponSupplierInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateSubCouponSupplierInfo(HttpServletRequest request) {
		JSONObject jo = null;
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();
		
		//获取有价券供应商ID
		Integer couponSupplierInfoId = Integer.parseInt(request.getParameter("couponSupplierId"));
		
		// 操作类型 1:启用 0:停用 
		Integer operateType = null;
		if (StringUtils.isNotBlank(request.getParameter("operateType"))) {
			operateType = Integer.valueOf(request.getParameter("operateType"));
		}
		
		//原因
		String remarks = request.getParameter("remarks");
		
		//封装数据
		CouponSupplierOperateLogPo couponSupplierOperateLogPo = new CouponSupplierOperateLogPo();
		couponSupplierOperateLogPo.setCouponSupplierInfoId(couponSupplierInfoId);
		couponSupplierOperateLogPo.setOperateType(operateType);
		couponSupplierOperateLogPo.setRemarks(remarks);
		couponSupplierOperateLogPo.setOperateUser(userInfoId);
		couponSupplierOperateLogPo.setOperateTime(Calendar.getInstance().getTime());
		
		try {
			jo = couponSupplierInfoFacade.operateCouponSupplierStatus(couponSupplierOperateLogPo, rootOrgInfoId);
		} catch (Exception e) {
			log.error("启用/停用有价券供应商异常", e);
			
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "操作有价券供应商服务异常，请稍后重试");
		}
	
		return jo;
	}
	
}
