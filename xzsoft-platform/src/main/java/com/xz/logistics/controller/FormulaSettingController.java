package com.xz.logistics.controller;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
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
import com.xz.facade.api.FormulaDetailInfoFacade;
import com.xz.facade.api.FormulaInfoFacade;
import com.xz.facade.api.UserInfoFacade;
import com.xz.model.po.SettlementDict;
import com.xz.model.po.SettlementEquationDetailInfoPo;
import com.xz.model.po.SettlementEquationPo;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.OrgModel;


/**
 * @author yuewei 2017年9月19日 下午12:15:49 公式设置
 */
@Controller
@RequestMapping("/formulaSettingController")
public class FormulaSettingController extends BaseController{

	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Resource
	private FormulaInfoFacade formulaInfoFacade;
	
	@Resource
	private FormulaDetailInfoFacade formulaDetailInfoFacade;
	
	@Resource
	private UserInfoFacade userInfoFacade;
	
	@RequestMapping(value = "/formulaListPage", produces = "application/json; charset=utf-8")
	public String formulaListPage(HttpServletRequest request,
			HttpServletResponse response, Model model) {
		return "template/formula/show_formula_list_page";
	}
	
	
	/**
	 * 公式信息查询
	 * 
	 * @author yuewei 2017年9月19日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/listFormulaInfo")
	public String listFormulaInfo(HttpServletRequest request, Model model) {
		DataPager<SettlementEquationPo> SettlementEquationPoPager = new DataPager<SettlementEquationPo>();

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);

		// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}
		SettlementEquationPoPager.setPage(page);

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
		SettlementEquationPoPager.setSize(rows);
		
		/**查询条件**/
		
				// 公式名称
				String formulaName = null;
				if (params.get("formulaName") != null) {
					formulaName = params.get("formulaName").toString();
				}
				// 启用状态
				Integer isAvailable = null;
				if (params.get("isAvailable") != null) {
					isAvailable = Integer.valueOf(params.get("isAvailable").toString());
				}
				// 公式类型
				Integer equationMark = null;
				if (params.get("equationMark") != null) {
					equationMark = Integer.valueOf(params.get("equationMark").toString());
				}
				
				UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		// 2、封装参数
		Map<String, Object> queryMap = new HashMap<String, Object>();
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);
		queryMap.put("formulaName", formulaName);
		queryMap.put("isAvailable", isAvailable);
		queryMap.put("equationMark", equationMark);
		queryMap.put("rootOrgInfoId", userInfo.getOrgRootId());
		
		// 3、查询公式信息总数
		Integer totalNum = formulaInfoFacade.countFormulaInfoForPage(queryMap);
		
		// 4、分页查询组织信息
		List<SettlementEquationPo> formulaInfoList = formulaInfoFacade.findFormulaInfoForPage(queryMap);
		
		
		//5、查询创建人
		List<Integer> userInfoIds = CommonUtils.getValueList(formulaInfoList, "createUser");
		List<UserInfo> userInfos = userInfoFacade.findUserNameByIds(userInfoIds);
		
		
		// key:用户ID value:用户名
					Map<Integer, String> userInfoMap = null;
					if (CollectionUtils.isNotEmpty(userInfos)) {
						userInfoMap = CommonUtils.listforMap(userInfos, "id", "userName");
					}
					
					for (SettlementEquationPo po : formulaInfoList) {
						
						// 封装创建人
						if (MapUtils.isNotEmpty(userInfoMap) && userInfoMap.get(po.getCreateUser()) != null) {
							po.setCreateUserName(userInfoMap.get(po.getCreateUser()));
						}
					}			
		//6、总数、分页信息封装
		SettlementEquationPoPager.setTotal(totalNum);
		SettlementEquationPoPager.setRows(formulaInfoList);
				model.addAttribute("SettlementEquationPoPager", SettlementEquationPoPager);
		return "template/formula/formula_info_data";
	}
	/**
	 * 跳转添加结算公式页面
	 *  @author 邱永城
	 *	@date 2017年9月20日
	 *  @param request
	 *  @param response
	 *  @param model
	 *  @return  
	 *
	 */
	@RequestMapping(value = "/addFormulaInfo",produces="application/json;charset=utf-8")
	public String addFormulaInfo(HttpServletRequest request,
			HttpServletResponse response, Model model) {
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		//查询结算项目
		List<SettlementDict>  settlementDictsList_type1 = formulaInfoFacade.findSettlementDictListBytype(1); //结果项
		List<SettlementDict>  settlementDictsList_type0 = formulaInfoFacade.findSettlementDictListBytype(0); //计算项
		//查询公式及触摸板
		List<Map<String, String>> settlementBasics = formulaInfoFacade.findSettlementBasic(userInfo);
		model.addAttribute("settlementBasics", settlementBasics);
		model.addAttribute("settlementDictsList_type1", settlementDictsList_type1);//结果项
		model.addAttribute("settlementDictsList_type0", settlementDictsList_type0);//计算项
		
		return "template/formula/add_formula_info";
	}
	
	/**
	 * 跳转更新结算公式页面
	 *  @author 邱永城
	 *	@date 2017年9月20日
	 *  @param request
	 *  @param response
	 *  @param model
	 *  @return  
	 *
	 */
	@RequestMapping(value = "/updateFormulaInfo",produces="application/json;charset=utf-8")
	public String updateFormulaInfo(HttpServletRequest request,
			HttpServletResponse response, Model model) {
		//查询结算项目
		List<SettlementDict>  settlementDictsList_type1 = formulaInfoFacade.findSettlementDictListBytype(1); //结果项
		List<SettlementDict>  settlementDictsList_type0 = formulaInfoFacade.findSettlementDictListBytype(0); //计算项
		String formulaInfoId = request.getParameter("formulaInfoId").trim();
		SettlementEquationPo settlementEquationPo = formulaInfoFacade.findFormulaInfoById(Integer.parseInt(formulaInfoId));
		
		model.addAttribute("settlementEquationPo", settlementEquationPo);
		model.addAttribute("settlementDictsList_type1", settlementDictsList_type1);//结果项
		model.addAttribute("settlementDictsList_type0", settlementDictsList_type0);//计算项
		return "template/formula/update_formula_info";
	}
	/**
	 * 新增结算公式
	 *  @author 邱永城
	 *	@date 2017年9月20日
	 *  @param request
	 *  @param response
	 *  @param model  
	 * @throws ParseException 
	 *
	 */
	@RequestMapping(value = "/saveFormuaInfo",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject saveFormuaInfo(HttpServletRequest request,
			HttpServletResponse response, Model model) throws ParseException {
		JSONObject jo = new JSONObject();
		String msg = "";
		boolean isSuccess = false;
		
		List<SettlementDict>  settlementDictsList = formulaInfoFacade.findSettlementDictList();
		
		String equation = request.getParameter("equation").trim();
		String accountingId = request.getParameter("accountingId").trim();
		String accountingName = request.getParameter("accountingName").trim();
		String startDate = request.getParameter("startDate").trim();
		String endDate = request.getParameter("endDate").trim();
		String equationMark = request.getParameter("equationMark").trim();
		String equationText = request.getParameter("equationText").trim();
		String customerId = request.getParameter("customerId").trim();
		
		//将表达式中文替换成对应code
		String equation_str = equation;
		for(int j =0;j<settlementDictsList.size();j++){
			equation = equation.replaceAll(settlementDictsList.get(j).getSettlementItem(),settlementDictsList.get(j).getSettlementCode());
		}
		equation = equation.replaceAll("\\%", "/100");
		String [] equationArr_code = equation.split("\\$"); //对应code表达式
		String [] equationArr_str = equation_str.split("\\$"); //对应字符描述表达式
		
		SettlementEquationPo settlementEquationPo = new SettlementEquationPo();
		UserInfo userInfo =  (UserInfo) request.getSession().getAttribute("userInfo");
		settlementEquationPo.setSettlementTitle(accountingName+"(结算公式)");
		settlementEquationPo.setOrgInfoId(userInfo.getOrgInfoId());
		settlementEquationPo.setRootOrgInfoId(userInfo.getOrgRootId());
		settlementEquationPo.setCreateUser(userInfo.getCreateUser());
		settlementEquationPo.setAccountingId(Integer.parseInt(accountingId));
		settlementEquationPo.setEquationMark(Integer.parseInt(equationMark));
		settlementEquationPo.setEquationText(equationText);
		if(equationMark.equals("2")){
			if(customerId == null||customerId.equals("")){
				settlementEquationPo.setCustomerId(null);
			}else{
				settlementEquationPo.setCustomerId(Integer.parseInt(customerId));
			}
		}else{
			settlementEquationPo.setCustomerId(null);
		}
		
		 SimpleDateFormat sdf =  new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		 if(endDate!=null&&endDate.length()>0){
			 Date end_date = sdf.parse(endDate);
			 settlementEquationPo.setEndDate(end_date);
		 }
		 if(startDate!=null&&startDate.length()>0){
			 Date start_date = sdf.parse(startDate);
			 settlementEquationPo.setStartDate(start_date);
		 }
		try {
		int a = formulaInfoFacade.insertSettlementEquation(settlementEquationPo);
		if(a>0){
			//写入基础模板表
			formulaInfoFacade.insertSettlementBasics(settlementEquationPo);
			for (int i = 0; i < equationArr_code.length; i++) {
				SettlementEquationDetailInfoPo equationDetailInfoPo = new SettlementEquationDetailInfoPo();
				String [] equation_result =  equationArr_code[i].split("=");
				equationDetailInfoPo.setSettlementResult(equation_result[0].trim());//计算项目
				equationDetailInfoPo.setSettlementEquation(equation_result[1].trim());//计算公式
				equationDetailInfoPo.setRoundFlag("0");//默认   0-保存小数4位,1-四舍五入,2-向上取整,3-想下取整
				equationDetailInfoPo.setSettlementEquationId(settlementEquationPo.getId());
				equationDetailInfoPo.setRemark(equationArr_str[i]);//描述
				formulaInfoFacade.insertSettlementEquationDetail(equationDetailInfoPo);
			}
		}
		
		isSuccess = true;
		msg = "保存成功";
		jo.put("success", isSuccess);
		jo.put("msg", msg);
		
		}catch (Exception e) {
			log.error("保存公式信息异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "保存公式信息服务异常，请稍后重试");
		}
		
		return jo;
	}
	
	
	/**
	 * 更新结算公式
	 *  @author 邱永城
	 *	@date 2017年9月20日
	 *  @param request
	 *  @param response
	 *  @param model  
	 * @throws ParseException 
	 *
	 */
	@RequestMapping(value = "/updateFormuaInfo",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject updateFormuaInfo(HttpServletRequest request,
			HttpServletResponse response, Model model) throws ParseException {
		JSONObject jo = new JSONObject();
		String msg = "";
		boolean isSuccess = false;
		
		List<SettlementDict>  settlementDictsList = formulaInfoFacade.findSettlementDictList();
		
		String formulaInfoId = request.getParameter("formulaInfoId").trim();
		String equation = request.getParameter("equation").trim();
		String accountingId = request.getParameter("accountingId").trim();
		
		String accountingName = request.getParameter("accountingName").trim();
		String startDate = request.getParameter("startDate").trim();
		String endDate = request.getParameter("endDate").trim();
		String equationMark = request.getParameter("equationMark").trim();
		String equationText = request.getParameter("equationText").trim();
		String customerId = request.getParameter("customerId").trim();
		
		//将表达式中文替换成对应code
		String equation_str = equation;
		for(int j =0;j<settlementDictsList.size();j++){
			equation = equation.replaceAll(settlementDictsList.get(j).getSettlementItem(),settlementDictsList.get(j).getSettlementCode());
		}
		equation = equation.replaceAll("\\%", "/100");
		String [] equationArr_code = equation.split("\\$"); //对应code表达式
		String [] equationArr_str = equation_str.split("\\$"); //对应字符描述表达式
		
		SettlementEquationPo settlementEquationPo = new SettlementEquationPo();
		UserInfo userInfo =  (UserInfo) request.getSession().getAttribute("userInfo");
		settlementEquationPo.setId(Integer.parseInt(formulaInfoId));
		settlementEquationPo.setSettlementTitle(accountingName+"(结算公式)");
		settlementEquationPo.setOrgInfoId(userInfo.getOrgInfoId());
		settlementEquationPo.setRootOrgInfoId(userInfo.getOrgRootId());
		settlementEquationPo.setCreateUser(userInfo.getCreateUser());
		settlementEquationPo.setAccountingId(Integer.parseInt(accountingId));
		settlementEquationPo.setEquationMark(Integer.parseInt(equationMark));
		settlementEquationPo.setEquationText(equationText);
		if(equationMark.equals("2")){
			if(customerId == null||customerId.equals("")){
				settlementEquationPo.setCustomerId(null);
			}else{
				settlementEquationPo.setCustomerId(Integer.parseInt(customerId));
			}
		}else{
			settlementEquationPo.setCustomerId(null);
		}
		
		 SimpleDateFormat sdf =  new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		 if(endDate!=null&&endDate.length()>0){
			 Date end_date = sdf.parse(endDate);
			 settlementEquationPo.setEndDate(end_date);
		 }
		 if(startDate!=null&&startDate.length()>0){
			 Date start_date = sdf.parse(startDate);
			 settlementEquationPo.setStartDate(start_date);
		 }
		try {
		int a = formulaInfoFacade.updateSettlementEquation(settlementEquationPo);
		if(a>0){
			JSONObject jsonObject = formulaInfoFacade.deleteFormulaDetailInfoById(settlementEquationPo.getId());
			if(jsonObject.containsKey("success")){
				for (int i = 0; i < equationArr_code.length; i++) {
					SettlementEquationDetailInfoPo equationDetailInfoPo = new SettlementEquationDetailInfoPo();
					String [] equation_result =  equationArr_code[i].split("=");
					equationDetailInfoPo.setSettlementResult(equation_result[0].trim());//计算项目
					equationDetailInfoPo.setSettlementEquation(equation_result[1].trim());//计算公式
					equationDetailInfoPo.setRoundFlag("0");//默认   0-保存小数4位,1-四舍五入,2-向上取整,3-想下取整
					equationDetailInfoPo.setSettlementEquationId(settlementEquationPo.getId());
					equationDetailInfoPo.setRemark(equationArr_str[i]);//描述
					formulaInfoFacade.insertSettlementEquationDetail(equationDetailInfoPo);
				}
			}
		}
		isSuccess = true;
		msg = "修改成功";
		jo.put("success", isSuccess);
		jo.put("msg", msg);
		
		}catch (Exception e) {
			log.error("修改公式信息异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "修改公式信息服务异常，请稍后重试");
		}
		
		return jo;
	}
	
	
	/**
	 * 更新结算公式
	 *  @author 邱永城
	 *	@date 2017年9月20日
	 *  @param request
	 *  @param response
	 *  @param model  
	 * @throws ParseException 
	 *
	 */
	@RequestMapping(value = "/operateFormulaInfo",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject operateFormulaInfo(HttpServletRequest request,
			HttpServletResponse response, Model model) throws ParseException {
		JSONObject jo = new JSONObject();
		String msg = "";
		boolean isSuccess = false;
		
		String formulaInfoId = request.getParameter("formulaInfoId").trim();
		String operateReason = request.getParameter("operateReason").trim();
		String isAvailable = request.getParameter("isAvailable").trim();
		
		SettlementEquationPo settlementEquationPo = new SettlementEquationPo();
		settlementEquationPo.setId(Integer.parseInt(formulaInfoId));
		settlementEquationPo.setIsAvailable(Integer.parseInt(isAvailable));
		settlementEquationPo.setOperateReason(operateReason);
		try {
		int a = formulaInfoFacade.updateSettlementEquation(settlementEquationPo);
		if(a>0){
			isSuccess = true;
			msg = "修改成功";
			jo.put("success", isSuccess);
			jo.put("msg", msg);
		}
		
		
		}catch (Exception e) {
			log.error("信息异常", e);
			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "信息服务异常，请稍后重试");
		}
		
		return jo;
	}
	
	/**
	 * 删除公式
	 * 
	 * @author yuewei 2017年9月20日
	 * @param request
	 * @param orgModel
	 * @return
	 */
	@RequestMapping(value = "/deleteFormulaInfo", produces = "application/json; charset=utf-8")
	@ResponseBody
	public JSONObject deleteFormulaInfo(HttpServletRequest request, OrgModel orgModel) {
		JSONObject jo = null;

		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();
		Integer userInfoId = userInfo.getId();

		// 公式ID
		Integer formulaInfoId = null;
		if (StringUtils.isNotBlank(request.getParameter("formulaInfoId"))) {
			formulaInfoId = Integer.valueOf(request.getParameter("formulaInfoId"));
		}

		try {
			// 删除公式信息
			jo = formulaInfoFacade.deleteFormulaInfoById(formulaInfoId);
		} catch (Exception e) {
			log.error("删除公式信息异常", e);

			jo = new JSONObject();
			jo.put("success", false);
			jo.put("msg", "删除公式信息服务异常，请稍后重试");
		}
		return jo;
	}
	
	
	/**
	 * 查询公式明细数据
	 * 
	 * @author yuewei 2017年9月21日 
	 * @param request
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/getFormulaCheckDetailData", produces = "application/json; charset=utf-8")
	@ResponseBody
	public List<SettlementEquationDetailInfoPo> getFormulaCheckDetailData(HttpServletRequest request) {
		// 从session中取出当前用户的主机构ID、用户ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer rootOrgInfoId = userInfo.getOrgRootId();

		// 1、获取并处理参数
		Map<String, Object> params = this.paramsToMap(request);
		// 2、同时封装参数
		Map<String, Integer> queryMap = new HashMap<String, Integer>();
		/*// 页数
		Integer page = 1;
		if (params.get("page") != null) {
			page = Integer.valueOf(params.get("page").toString());
		}

		// 行数
		Integer rows = 10;
		if (params.get("rows") != null) {
			rows = Integer.valueOf(params.get("rows").toString());
		}
*/
		// 对账单主ID
		Integer formulaCheckId = null;
		if (params.get("formulaCheckId") != null) {
			formulaCheckId = Integer.valueOf(params.get("formulaCheckId").toString());
		}
/*
		queryMap.put("start", (page - 1) * rows);
		queryMap.put("rows", rows);*/
//		queryMap.put("orgRootId", rootOrgInfoId);
		queryMap.put("formulaCheckId", formulaCheckId);

		List<SettlementEquationDetailInfoPo> formulaDetailInfoList = formulaDetailInfoFacade.getFormulaCheckDetailData(queryMap);
		return formulaDetailInfoList;
	}
}
