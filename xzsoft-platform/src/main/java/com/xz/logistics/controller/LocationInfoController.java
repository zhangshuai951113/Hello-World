package com.xz.logistics.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import com.xz.facade.api.LocationInfoFacade;
import com.xz.model.po.LocationInfoPo;

/**
 * 地点管理
 * @author luojuan 2017年5月19日
 *
 */

@Controller
@RequestMapping("/locationInfo")
public class LocationInfoController extends BaseController{
	
	@Resource
	private LocationInfoFacade locationInfoFacade;
	
	@RequestMapping(value="/showLocationInfoPage",produces = "application/json; charset=utf-8")
	public String showLocationInfoPage(){
		return "/template/location/show_location_info_page";
	}
	
	/**
	 * 模糊查询国家、省（州）、省简称、市、市简称、县（区）的国家地点信息
	 * @author luojuan 2017年5月19日
	 * @param province 省(州)
	 * @param city 市
	 * @param county 县(区)
	 * @return
	 */
	@RequestMapping(value="/findLocationInfo",produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<LocationInfoPo> findLocationInfo (HttpServletRequest request,HttpServletResponse response){
		String province=request.getParameter("province");
		String city=request.getParameter("city");
		String county=request.getParameter("county");
		//当前页数
		String page1=request.getParameter("page");
		Integer page2=Integer.parseInt(page1);
		//每页尺寸
		String rows1 = request.getParameter("rows");
		Integer rows = Integer.parseInt(rows1);
		Integer page = page2*rows;
		
		List<LocationInfoPo> locationInfoList = locationInfoFacade.findLocationInfo(province, city, county, page, rows);
		
		return locationInfoList;
	}
	
	@RequestMapping(value="/getCount",produces = "application/json; charset=utf-8")
	@ResponseBody
	public Integer getCount(HttpServletRequest request,HttpServletResponse response){
		String province=request.getParameter("province");
		String city=request.getParameter("city");
		String county=request.getParameter("county");
		
		//当前页数
		String page1=request.getParameter("page");
		Integer page2=Integer.parseInt(page1);
		//每页尺寸
		String rows1 = request.getParameter("rows");
		Integer rows = Integer.parseInt(rows1);
		Integer page = page2*rows;
		
		//查询数据总数量
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("province", province);
		params.put("city", city);
		params.put("county", county);
		params.put("page", page);
		params.put("rows", rows);
		
		Integer count=locationInfoFacade.countLocationInfoForPage(params);
		return count;
	}
	
	/**
	 * 根据页面输入的省查询旗下的市
	 */
	@RequestMapping(value="/findLocationCityByProvince",produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<LocationInfoPo> findLocationCityByProvince (HttpServletRequest request,HttpServletResponse response){
		String provinceId=request.getParameter("startPoints");
		
		//查询数据总数量
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("provinceId", provinceId);
				
		List<LocationInfoPo> locationInfoList = locationInfoFacade.findLocationCityByProvince(params);
		return locationInfoList;
	}
	
	/**
	 * 根据市名查询旗下的区
	 */
	@RequestMapping(value="/findLocationCountyByCity",produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<LocationInfoPo> findLocationCountyByCity (HttpServletRequest request,HttpServletResponse response){
		String cityId=request.getParameter("startPoints");
		
		
		//查询数据总数量
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("cityId", cityId);
				
		List<LocationInfoPo> locationInfoList = locationInfoFacade.findLocationCountyByCity(params);
		return locationInfoList;
	}
	
	/**
	 * 查询各省
	 */
	@RequestMapping(value="/findLocationProvince",produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<LocationInfoPo> findLocationProvince (HttpServletRequest request,HttpServletResponse response){
		List<LocationInfoPo> locationInfoList = locationInfoFacade.findLocationProvince();
		return locationInfoList;
	}
}
