package com.xz.logistics.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.util.JSONStringer;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.frame.common.view.eid.initEdit;
import com.tsh.base.util.Util;
import com.wondersgroup.cuteinfo.client.exchangeserver.exchangetransport.impl.USendResponse;
import com.xz.common.util.calculate.CalculateUtil;
import com.xz.common.utils.collection.CommonUtils;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.CuteInfoFacade;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.UserDataAuthFacade;
import com.xz.logistics.utils.HttpUtil;
import com.xz.logistics.utils.StringUtil;
import com.xz.logistics.utils.TsContext;
import com.xz.logistics.utils.XmlParse;
import com.xz.model.po.DriverInfo;
import com.xz.model.po.SettlementInfo;
import com.xz.model.po.UserDataAuthPo;
import com.xz.model.po.UserInfo;

/**
 * 无车承运人管理
 * 
 * @author yuewei 2017年10月8日下午4:58:40
 * 
 */
@Controller
@RequestMapping("/cuteinfo")
public class CuteinfoController extends BaseController {

	@Resource
	private CuteInfoFacade cuteInfoFacade;
	
	@Resource
	private UserDataAuthFacade userDataAuthFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;
	
	/**
	 * 
	 * @author yuewei 2017年10月8日 下午5:03:35
	 */
	@RequestMapping(value = "/goCuteinfoPage", produces = "application/json;charset=utf-8")
	public String goCuteinfoPage(HttpServletRequest request,
			HttpServletResponse response, Model model) {
		String cuteinfo = "无车承运人路单上报";

		return "template/cuteinfo/show_cuteinfo_list_page";
	}

	/**
	 * 无车承运人路单上报信息列表
	 * 
	 * @author yuewei 2017年10月09日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/listCuteInfo")
	public String listCuteInfo(HttpServletRequest request, Model model) {

		DataPager<SettlementInfo> settlementInfoPager = new DataPager<SettlementInfo>();
		
		// 从session中取出当前用户的主机构ID
				UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
				Integer orgRootId = userInfo.getOrgRootId();
				Integer userId = userInfo.getId();
				
				
		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		settlementInfoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		settlementInfoPager.setSize(rows);

		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		
		queryMap = StringUtil.requestParameter(request);
		queryMap.put("uOrgRootId", orgRootId);
		queryMap.put("uId", userId);
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);

		// 根据登录用户主机构ID和登录用户ID查询用户数据权限表，获得登录用户数据权限
		List<UserDataAuthPo> userDataAuthList = userDataAuthFacade
				.findUserDataAuthByUidAndUorgRootId(queryMap);
		List<String> userDataAuthListStrs = new ArrayList<String>();
		// 登录用户必须存在数据权限
		if (userDataAuthList != null && userDataAuthList.size() > 0) {
			for (UserDataAuthPo userDataAuthPo : userDataAuthList) {
				userDataAuthListStrs.add(userDataAuthPo.getConditionGroup());
			}
			queryMap.put("userDataAuthListStrs", userDataAuthListStrs);

			// 3、查询组织信息总数
			Integer totalNum = cuteInfoFacade
					.countCuteinfoSettlementInfoForPage(queryMap);

			// 4、分页查询结算信息
			List<SettlementInfo> settlementInfoList = cuteInfoFacade
					.findCuteinfoSettlementInfoForPage(queryMap);
			
			// 5、总数、分页信息封装
			settlementInfoPager.setTotal(totalNum);
			settlementInfoPager.setRows(settlementInfoList);
		}

		model.addAttribute("cuteinfoSettlementInfoPager", settlementInfoPager);
		return "template/cuteinfo/cuteinfo_info_data";
	}

	
	
	/**
	 * 无车承运人上报数据
	 * 
	 * @author yuewei 2017年10月10日 下午7:14:15
	 * @throws Exception
	 */
	@RequestMapping(value = "/upRoadSheet", produces = "application/json;charset=utf-8")
	@ResponseBody
	public String upRoadSheet(HttpServletRequest request,
			HttpServletResponse response, Model model) throws Exception {
		JSONStringer stringer = null;
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute(
				"userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		String result = "{\"msg\":\"服务器未知错误!!\"}";
		Map<String, Object> params = StringUtil.requestParameter(request);
		List<String> failList = this.reportRoadSheetInfo(params, userId); // 路单上报

		if (failList == null || failList.size() == 0) {
			result = "{\"result\":1,\"msg\":\"全部上报成功。\"}";
		} else {

			StringBuffer sb = new StringBuffer("");
			for (String s : failList) {
				sb.append(s + "\n");
			}
			stringer = new JSONStringer();
			stringer.object().key("result").value(0).key("msg")
					.value(sb.toString()).endObject();
			result = stringer.toString();
		}
		System.out.println("result: " + result);
		return result;
	}

	/**
	 * 路单上报方法
	 */
	public List reportRoadSheetInfo(Map<String, Object> params, Integer userId)
			throws Exception {

		USendResponse response = null;
		String reportStatus = "2"; //上报状态  2表示上报失败
		List<String> failList = new ArrayList<String>();
		String SettlementNotes = (String) params.get("settlementIds"); // 获取选中的运单
		String flowNo = CalculateUtil.createSeriesNumber(20); // 生成20位流水批次号。
		TsContext context = new TsContext("cuteinfo.properties");
		// 符合条件的运单详情List
		Map<String,Object> mp = null;

		List<String> srclist = StringUtil.string2List(SettlementNotes, ",");
		for (String s : srclist) {
			try {
				params.put("settlementInfoId", s);
				params.put("reportStatus", "0"); 
				Map<String, Object> rs = cuteInfoFacade
						.getRoadSheetInfo(params); // 查找结算单相关信息
				if (rs == null) {
					throw new Exception("没有找到本运单相关信息！！当前运单可能已经上报。");
				}

				// 生成XML报文头标识号
				String duid = StringUtil.duid();
				rs.put("duid", duid);
				String reqXml = XmlParse.genMiniERoadSheet(rs); // 生成电子路单
				System.out.println("ludan map: " + rs.toString());
				System.out.println("");
				response = HttpUtil.send(context, reqXml);// 发送报文

				if (response.isSendResult()) {
					reportStatus = "1"; //上报状态 1表示上报成功
					Map<String, Object> logMap = new HashMap<String, Object>();
					logMap.put("waybillNo", rs.get("waybill_id")); // 运单编号
					logMap.put("duid", duid);
					logMap.put("uploadStatus", "1");
					logMap.put("flowNo", flowNo);
					logMap.put("updateDateTime", Util.nowString());
					logMap.put("settlementNo", rs.get("id"));
					logMap.put(
							"arriveUnits",
							((StringUtil.toDouble( String.valueOf(rs
									.get("arrive_tonnage")))) < (StringUtil
									.toDouble(rs.get("check_load").toString()))) ? String.valueOf( rs
									.get("arrive_tonnage")) : (String) rs
									.get("check_load"));

					logMap.put("createId", userId);
					System.out.println("logMap: " + logMap.toString());
					// 保存上报信息至日志
					cuteInfoFacade.logUploadRoadSheet(logMap);
					// 修改路单上报状态
				} else {
					System.out.println(response.getGenericFault().getCode());
					System.out.println(response.getGenericFault().getMessage());
				}
				System.out.println("response: "
						+ response.getSendResponseResultsList());
				mp = new HashMap<String, Object>();
				mp.put("reportStatus", reportStatus);  //上报状态
				mp.put("settlementNo", rs.get("id"));  //结算单编号
				// 修改路单上报状态
				cuteInfoFacade.updateReportStatus(mp);
			} catch (Exception e) {
				e.printStackTrace();
				s = s + e.getMessage();
				failList.add(s);
			}

		}

		return failList;
	}

}
