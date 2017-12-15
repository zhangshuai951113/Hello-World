package com.xz.logistics.controller;

import java.math.BigDecimal;
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
import com.xz.facade.api.CouponInfoFacade;
import com.xz.facade.api.CouponTypeInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.CouponTypeInfo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.CouponTypeInfoModel;

/**
 * 有价券类型管理控制器
 * 
 * @author zhangya 2017年6月9日 下午4:40:52
 */
@Controller
@RequestMapping("/couponTypeInfo")
public class CouponTypeInfoController extends BaseController {

	@Resource
	private CouponTypeInfoFacade couponTypeInfoFacade;

	@Resource
	private CouponInfoFacade couponInfoFacade;

	@Resource
	private UserInfoFacade userInfoFacade;

	/**
	 * 有价券类型信息查询初始化
	 * 
	 * @author zhangya 2017年6月12日 上午10:51:30
	 * @param request
	 * @return
	 */
	@RequiresPermissions("platform:couponType:view")
	@RequestMapping(value = "/showCouponTypeInfoPage", produces = "application/json; charset=utf-8")
	public String initCouponTypeInfoPage(HttpServletRequest request) {
		return "template/coupon/show_coupon_type_info_list_page";
	}

	/**
	 * 有价券类型信息列表
	 * 
	 * @author zhangya 2017年6月12日 上午10:51:30
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/listCouponTypeInfo", produces = "application/json; charset=utf-8")
	public String listCouponTypeInfo(HttpServletRequest request, Model model) {
		DataPager<CouponTypeInfo> couponTypeInfoPager = new DataPager<CouponTypeInfo>();

		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf((String) params.get("page"));
		}
		couponTypeInfoPager.setPage(page);
		// 条数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf((String) params.get("rows"));
		}
		couponTypeInfoPager.setSize(rows);
		// 有价券类型
		String couponType = null;
		if (params.get("couponType") != null) {
			couponType = (String) params.get("couponType");
		}
		// 进项税税率
		String taxRate = null;
		if (params.get("taxRate") != null) {
			taxRate = (String) params.get("taxRate");
		}
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("page", page);
		queryMap.put("rows", rows);
		queryMap.put("couponType", couponType);
		queryMap.put("taxRate", taxRate);
		List<CouponTypeInfo> couponTypeInfoList = couponTypeInfoFacade.findCouponTypeInfoForPage(queryMap);

		if (CollectionUtils.isNotEmpty(couponTypeInfoList)) {

			// 查询创建人
			List<Integer> userInfoIds = CommonUtils.getValueList(couponTypeInfoList, "createUser");
			List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
			// key:用户ID value:用户名
			Map<Integer, String> userInfoMap = null;
			if (CollectionUtils.isNotEmpty(userInfos)) {
				userInfoMap = CommonUtils.listforMap(userInfos, "id", "userName");
			}

			for (CouponTypeInfo couponTypeInfo : couponTypeInfoList) {
				// 封装创建人
				if (MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(couponTypeInfo.getCreateUser()) != null) {
					couponTypeInfo.setCreateUserName(userInfoMap.get(couponTypeInfo.getCreateUser()));
				}
			}

		}

		Integer total = couponTypeInfoFacade.countCouponTypeInfoForPage(queryMap);
		couponTypeInfoPager.setRows(couponTypeInfoList);
		couponTypeInfoPager.setTotal(total);
		model.addAttribute("couponTypeInfoPager", couponTypeInfoPager);
		return "template/coupon/coupon_type_info_data";
	}

	/**
	 * 新增有价券类型信息
	 * 
	 * @author zhangya 2017年6月12日 上午10:51:30
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/saveCouponTypeInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject saveCouponTypeInfo(HttpServletRequest request, CouponTypeInfoModel couponTypeInfoModel) {
		JSONObject jo = new JSONObject();

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");

		if (couponTypeInfoModel == null) {
			jo.put("success", false);
			jo.put("msg", "新增的有价券类型信息无效！");
			return jo;
		}

		CouponTypeInfo couponTypeInfo = couponTypeInfoModel.getCouponTypeInfo();
		if (couponTypeInfo == null) {
			jo.put("success", false);
			jo.put("msg", "新增的有价券类型信息无效！");
			return jo;
		}

		String couponType = couponTypeInfo.getCouponType();
		if (StringUtils.isBlank(couponType)) {
			jo.put("success", false);
			jo.put("msg", "有价券类型不能为空！");
			return jo;
		}

		if (couponTypeInfo.getTaxRate() == null) {
			jo.put("success", false);
			jo.put("msg", "进项税税率不能为空！");
			return jo;
		}

		if (couponTypeInfo.getId() == null) {

			// 判断有价券类型是否已存在
			couponType = StringUtils.trim(couponType);
			if (couponTypeInfoFacade.isCouponTypeExisted(couponType)) {
				jo.put("success", false);
				jo.put("msg", "有价券类型已存在！");
				return jo;
			}

			try {
				couponTypeInfo.setCreateUser(userInfo.getId());
				couponTypeInfo.setCreateTime(Calendar.getInstance().getTime());
				if (couponTypeInfo.getTaxRate() == null) {
					jo.put("success", false);
					jo.put("msg", "进项税税率不能为空！");
					return jo;
				}
				couponTypeInfoFacade.addCouponTypeInfo(couponTypeInfo);
				jo.put("success", true);
				jo.put("msg", "保存成功！");
				return jo;
			} catch (Exception e) {
				e.printStackTrace();
				jo.put("success", false);
				jo.put("msg", "有价券类型新增异常！");
				return jo;
			}

		} else {
			CouponTypeInfo originCouponTypeInfo = couponTypeInfoFacade.getCouponTypeInfoById(couponTypeInfo.getId());

			if (!originCouponTypeInfo.getCouponType().equals(couponTypeInfo.getCouponType())) {
				if (couponTypeInfoFacade.isCouponTypeExisted(couponType)) {
					jo.put("success", false);
					jo.put("msg", "有价券类型已存在！");
					return jo;
				}
			}
			couponTypeInfo.setUpdateUser(userInfo.getId());
			couponTypeInfo.setUpdateTime(Calendar.getInstance().getTime());
			if (couponTypeInfo.getTaxRate() == null) {
				jo.put("success", false);
				jo.put("msg", "进项税税率不能为空！");
				return jo;
			}
			couponTypeInfoFacade.updateCouponTypeInfo(couponTypeInfo);
			jo.put("success", true);
			jo.put("msg", "保存成功！");
			return jo;
		}

	}

	/**
	 * 新增/修改有价券类型信息初始化页
	 * 
	 * @author zhangya 2017年6月12日 上午10:52:00
	 * @param request
	 * @return
	 */
	@RequestMapping("/addOrEditCouponTypeInfoPage")
	public String addOrEditCouponTypeInfoPage(HttpServletRequest request, Model model) {
		String couponTypeInfoIdStr = request.getParameter("couponTypeInfoId");
		String operateTitle = "有价券类型信息新增";
		if (couponTypeInfoIdStr != null) {
			operateTitle = "有价券类型信息修改";
			Integer couponTypeInfoId = Integer.valueOf(couponTypeInfoIdStr);
			if (couponTypeInfoId != null) {
				CouponTypeInfo couponTypeInfo = couponTypeInfoFacade.getCouponTypeInfoById(couponTypeInfoId);
				model.addAttribute("couponTypeInfo", couponTypeInfo);
			}
		}

		model.addAttribute("operateTitle", operateTitle);
		return "template/coupon/edit_coupon_type_page";
	}

	/**
	 * 删除有价券类型信息
	 * 
	 * @author zhangya 2017年6月13日 上午11:47:25
	 * @return
	 */
	@RequestMapping(value = "/deleteCouponTypeInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteCouponTypeInfo(HttpServletRequest request) {
		JSONObject jo = new JSONObject();

		// 被操作的有价券类型ID
		List<Integer> couponTypeInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("couponTypeInfoIds"))) {
			String couponTypeInfoIds = request.getParameter("couponTypeInfoIds").trim();
			String[] couponTypeArray = couponTypeInfoIds.split(",");
			if (couponTypeArray.length > 0) {
				for (String couponTypeIdStr : couponTypeArray) {
					if (StringUtils.isNotBlank(couponTypeIdStr)) {
						couponTypeInfoIdList.add(Integer.valueOf(couponTypeIdStr.trim()));
					}
				}
			}
		}

		// 所选有价券类型不能为空
		if (CollectionUtils.isEmpty(couponTypeInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选有价券类型不能为空");
			return jo;
		}

		for (Integer couponTypeInfoId : couponTypeInfoIdList) {

			try {
				if (couponInfoFacade.isCouponTypeUsed(couponTypeInfoId)) {
					jo.put("success", false);
					jo.put("msg", "有价券类型已使用！");
					return jo;
				}
				couponTypeInfoFacade.deleteCouponTypeInfo(couponTypeInfoId);
			} catch (Exception e) {
				jo.put("success", false);
				jo.put("msg", "删除有价券类型异常！");
				return jo;
			}
		}
		jo.put("success", true);
		jo.put("msg", "删除成功！");
		return jo;

	}

	/**
	 * 启用、停用有价券类型消息
	 * 
	 * @author zhangya 2017年6月12日 上午10:52:23
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/operateCouponTypeInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject operateCouponTypeInfo(HttpServletRequest request) {
		JSONObject jo = new JSONObject();

		// 被操作的有价券类型ID
		List<Integer> couponTypeInfoIdList = new ArrayList<Integer>();
		if (StringUtils.isNotBlank(request.getParameter("couponTypeInfoIds"))) {
			String couponTypeInfoIds = request.getParameter("couponTypeInfoIds").trim();
			String[] couponTypeArray = couponTypeInfoIds.split(",");
			if (couponTypeArray.length > 0) {
				for (String couponTypeIdStr : couponTypeArray) {
					if (StringUtils.isNotBlank(couponTypeIdStr)) {
						couponTypeInfoIdList.add(Integer.valueOf(couponTypeIdStr.trim()));
					}
				}
			}
		}

		// 所选有价券类型不能为空
		if (CollectionUtils.isEmpty(couponTypeInfoIdList)) {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "所选有价券类型不能为空");
			return jo;
		}

		if (StringUtils.isBlank(request.getParameter("couponStatus"))) {
			jo.put("success", false);
			jo.put("msg", "有价券类型操作无效！");
			return jo;
		}
		// 操作类型
		Integer couponStatus = Integer.valueOf(request.getParameter("couponStatus"));
		String operateType = "";
		if (couponStatus == 0) {
			operateType = "停用";
		} else if (couponStatus == 1) {
			operateType = "启用";
		} else {
			jo.put("success", false);
			jo.put("msg", "有价券类型操作无效！");
			return jo;
		}

		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		try {
			jo = couponTypeInfoFacade.updateCouponTypeStatus(userInfo.getId(), couponStatus, couponTypeInfoIdList);
		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", operateType + "有价券类型异常！");
			return jo;
		}
		return jo;

	}

	/**
	 * 有价券类型修改条件校验
	 * 
	 * @author zhangya 2017年7月27日 下午6:45:52
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/isCouponTypeInfoUsed", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject isCouponTypeInfoUsed(HttpServletRequest request) {
		JSONObject jo = new JSONObject();

		// 被操作的有价券类型ID
		Integer couponTypeInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("couponTypeInfoId"))) {
			couponTypeInfoId = Integer.valueOf(request.getParameter("couponTypeInfoId").trim());
		} else {
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "有价券类型不存在");
			return jo;
		}

		try {
			CouponTypeInfo couponTypeInfo = couponTypeInfoFacade.getCouponTypeInfoById(couponTypeInfoId);
			if (couponTypeInfo == null) {
				jo.put("success", false);
				jo.put("msg", "有价券类型不存在");
				return jo;
			}
			// 校验有价券是否被使用
			if (couponInfoFacade.isCouponTypeUsed(couponTypeInfoId)) {
				jo.put("success", false);
				jo.put("msg", "有价券类型已使用");
				return jo;
			}
		} catch (Exception e) {
			jo.put("success", false);
			jo.put("msg", "修改有价券类型异常！");
			return jo;
		}
		jo.put("success", true);
		jo.put("msg", "修改校验通过");
		return jo;
	}

}
