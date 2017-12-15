package com.xz.logistics.controller;



import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.xz.facade.api.AddressDetailFacade;


/**
 * @Title UserDistributeStatisticsController
 * @Description 统计系统登录用户地域分布范围
 * @author zhangbo
 * @date 2017/08/11 16:37
 * */
@Controller
@RequestMapping("/userStatistics")
public class UserDistributeStatisticsController {
	@Resource
	private AddressDetailFacade addressDetailFacade;
	
	// ---userStatistics/gouserStatisticsMap
	@RequestMapping("/gouserStatisticsMap")
	public String gouserStatisticsMap(){
		return "template/reportForm/statistics_user_distribution_range";
	}
	
	/**
	 * @title selectAddressDetailForMonth
	 * @Description 统计当前月份用户的分布范围
	 * @return Map<String,Object>
	 * 
	 * */
	// ---userStatistics/findAddressDetailForMonth
	@RequestMapping("/findAddressDetailForMonth")
	@ResponseBody
	public Map<String,Object> selectAddressDetailForMonth(){
		return addressDetailFacade.selectAddressDetail();
	}


}
