package com.xz.logistics.controller;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.dubbo.common.utils.CollectionUtils;
import com.alibaba.fastjson.JSONObject;
import com.xz.facade.api.OrgDetailInfoFacade;
import com.xz.facade.api.OrgInfoFacade;
import com.xz.facade.api.SettlementFormulaDetailFacade;
import com.xz.facade.api.SettlementFormulaFacade;
import com.xz.model.po.OrgDetailInfoPo;
import com.xz.model.po.OrgInfoPo;
import com.xz.model.po.SettlementFormulaDetailPo;
import com.xz.model.po.SettlementFormulaPo;
import com.xz.model.po.UserInfo;


/**
* @author zhangshuai   2017年6月26日 下午4:32:49
* 类说明(结算controller)
*/
@Controller
@RequestMapping("/settlementFormula")
public class SettlementFormulaController {

	private final Logger log=LoggerFactory.getLogger(getClass());
	@Resource
	private SettlementFormulaFacade settlementFormulaFacade;
	@Resource
	private SettlementFormulaDetailFacade settlementFormulaDetailFacade;
	@Resource
	private OrgInfoFacade orgInfoFacade;
	@Resource
	private OrgDetailInfoFacade orgDetailInfoFacade;
	
	/**
	 * @author zhangshuai  2017年6月26日 下午4:55:00
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入结算公式页面
	 */
	@RequestMapping(value="/goSettlementFormulaPage",produces="application/json;charset=utf-8")
	public String goSettlementFormulaPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String settlementFormula="结算公式管理";
		model.addAttribute("settlementFormula", settlementFormula);
		return "template/settlementFormula/settlement_formula_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月26日 下午7:17:00
	 * @param request
	 * @param response
	 * @return
	 * 结算公式全查
	 */
	@RequestMapping(value="/findSettlementFormulaAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<SettlementFormulaPo> findSettlementFormulaAll(HttpServletRequest request,HttpServletResponse response){
		//从session中获取信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		params.put("orgRootId", uOrgRootId);
		
		//结算信息全查
		List<SettlementFormulaPo> SettlementFormulaPoList=settlementFormulaFacade.findSettlementFormulaAll(params);
		
		for (SettlementFormulaPo settlementFormulaPo : SettlementFormulaPoList) {
			if(settlementFormulaPo.getCreateTime()!=null){
				String createStr=new SimpleDateFormat("yyyy-MM-dd").format(settlementFormulaPo.getCreateTime());
				settlementFormulaPo.setCreateTimeStr(createStr);
			}
		}
		
		return SettlementFormulaPoList;
	}
	
	/**
	 * @author zhangshuai  2017年6月26日 下午7:38:36
	 * @param request
	 * @param response
	 * @return
	 * 获取结算公式最大记录数
	 */
	@RequestMapping(value="/getSettlementFormulaMaxCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getSettlementFormulaMaxCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		params.put("orgRootId", uOrgRootId);
				
		//获取最大记录数
		Integer count=settlementFormulaFacade.getSettlementFormulaMaxCount(params);
		return count;
	}
	
	/**
	 * @author zhangshuai  2017年6月26日 下午5:19:20
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 添加结算公式模态框
	 */
	@RequestMapping(value="/addSettlementFormula",produces="application/json;charset=utf-8")
	public String addSettlementFormula(HttpServletRequest request,HttpServletResponse response,Model model){
		String addSettlementFormula="添加结算信息";
		model.addAttribute("addSettlementFormula", addSettlementFormula);
		return "template/settlementFormula/add_settlement_formula";
	}
	
	/**
	 * @author zhangshuai  2017年6月26日 下午6:29:48
	 * @return
	 * 添加结算公式信息
	 */
	@RequestMapping(value="/saveSettlementFormula",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject addSettlementFormulaMation(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		BigDecimal withholdingTaxRate=new BigDecimal(request.getParameter("withholdingTaxRate"));
		BigDecimal incomeTaxRate=new BigDecimal(request.getParameter("incomeTaxRate"));
		BigDecimal individualIncomeTax=null;
		if(request.getParameter("individualIncomeTax")!=null && !"".equals(request.getParameter("individualIncomeTax"))){
			individualIncomeTax=new BigDecimal(request.getParameter("individualIncomeTax"));
		}
		BigDecimal overallTaxRate=null;
		if(request.getParameter("overallTaxRate")!=null && !"".equals(request.getParameter("overallTaxRate"))){
			overallTaxRate=new BigDecimal(request.getParameter("overallTaxRate"));
		}
		
		//double overallTaxRate=Double.parseDouble(request.getParameter("overallTaxRate"));
		/*if(sum!=overallTaxRate){
			jo.put("success", false);
			jo.put("msg", "计算综合税率异常!");
		}*/
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("withholdingTaxRate", withholdingTaxRate);//企业代扣税税率（%）
		params.put("incomeTaxRate", incomeTaxRate);//司机运费进项税税率（%）
		params.put("individualIncomeTax", individualIncomeTax);//个人所得税
		params.put("overallTaxRate", overallTaxRate);//综合税率
		params.put("orgRootId", uOrgRootId);//主机构ID
		params.put("createUser", uId);//创建人
		params.put("createTime", Calendar.getInstance().getTime());//创建时间
		
		//添加结算公式
		jo=settlementFormulaFacade.addSettlementFormulaFacadeMation(params);
	
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月26日 下午8:35:49
	 * @param request
	 * @param response
	 * @return
	 * 根据ID查询结算明细表信息是否存在
	 */
	@RequestMapping(value="/findMationIsExits",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject findMationIsExits(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer orgRootId=userInfo.getOrgRootId();
		
		//接收操作数据ID
		Integer sIds=Integer.valueOf(request.getParameter("sIds"));
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("orgRootId", orgRootId);//主机构ID
		params.put("settlementFormulaId", sIds);//结算公式ID
		
		//根据用户主机构ID和结算公式ID查询结算公式明细表判断结算公式是否存在
		jo=settlementFormulaDetailFacade.findMationIsExits(params);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月26日 下午5:19:20
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 修改结算公式模态框
	 */
	@RequestMapping(value="/updateSettlementFormula",produces="application/json;charset=utf-8")
	public String updateSettlementFormula(HttpServletRequest request,HttpServletResponse response,Model model){
		String updateSettlementFormula="修改结算信息";
		model.addAttribute("updateSettlementFormula", updateSettlementFormula);
		return "template/settlementFormula/update_settlement_formula";
	}
	
	/**
	 * @author zhangshuai  2017年6月27日 上午11:02:05
	 * @param request
	 * @param response
	 * @return
	 * 根据结算ID回显结算数据
	 */
	@RequestMapping(value="/findSettlementFormulaData",produces="application/json;charset=utf-8")
	@ResponseBody
	public SettlementFormulaPo findSettlementFormulaData(HttpServletRequest request,HttpServletResponse response){
		
		//接收接收ID
		Integer sIds=Integer.valueOf(request.getParameter("sIds"));
		
		//根据结算ID查询结算信息数据
		SettlementFormulaPo settlementFormulaPo = settlementFormulaFacade.findSettlementFormulaData(sIds);
		return settlementFormulaPo;
		
	}
	
	/**
	 * @author zhangshuai  2017年6月27日 上午11:59:27
	 * @param request
	 * @param response
	 * @return
	 * 修改结算公式
	 */
	@RequestMapping(value="/updateSettlementFormulaData",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject updateSettlementFormulaData(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uId=userInfo.getId();
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		BigDecimal withholdingTaxRate=new BigDecimal(request.getParameter("withholdingTaxRate"));
		BigDecimal incomeTaxRate=new BigDecimal(request.getParameter("incomeTaxRate"));
		BigDecimal individualIncomeTax=null;
		if(request.getParameter("individualIncomeTax")!=null){
			individualIncomeTax=new BigDecimal(request.getParameter("individualIncomeTax"));
		}
		BigDecimal overallTaxRate=null;
		if(request.getParameter("overallTaxRate")!=null){
			overallTaxRate=new BigDecimal(request.getParameter("overallTaxRate"));
		}
		
		//double overallTaxRate=Double.parseDouble(request.getParameter("overallTaxRate"));
		/*if(sum!=overallTaxRate){
			jo.put("success", false);
			jo.put("msg", "计算综合税率异常!");
		}*/
		
		Integer sIds=Integer.valueOf(request.getParameter("sIds"));
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("withholdingTaxRate", withholdingTaxRate);//企业代扣税税率（%）
		params.put("incomeTaxRate", incomeTaxRate);//司机运费进项税税率（%）
		params.put("overallTaxRate", overallTaxRate);//综合税率
		params.put("individualIncomeTax", individualIncomeTax);//个人所得税
		params.put("orgRootId", uOrgRootId);//主机构ID
		params.put("updateUser", uId);//修改人
		params.put("updateTime", Calendar.getInstance().getTime());//修改时间
		params.put("sIds", sIds);//结算ID
		
		jo=settlementFormulaFacade.updateSettlementFormulaFacadeMation(params);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月27日 下午12:12:40
	 * @param request
	 * @param response
	 * @return
	 * 删除结算公式
	 */
	@RequestMapping(value="/delSettlementFormulaData",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject delSettlementFormulaData(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取信息
		UserInfo userInfo=(UserInfo) request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer sIds=Integer.valueOf(request.getParameter("sIds"));
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("sIds", sIds);
		params.put("orgRootId", uOrgRootId);
		
		//删除结算公式
		jo=settlementFormulaFacade.delSettlementFormulaData(params);
		
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月27日 下午12:50:15
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * 进入分配核算主体模态框
	 */
	@RequestMapping(value="/goAllocationAccountingEntityPage",produces="application/json;charset=utf-8")
	public String goAllocationAccountingEntityPage(HttpServletRequest request,HttpServletResponse response,Model model){
		String AllocationAccountingEntity="分配核算主体";
		model.addAttribute("AllocationAccountingEntity", AllocationAccountingEntity);
		return "template/settlementFormula/allocation_accounting_entity_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月27日 下午1:10:43
	 * @param request
	 * @param response
	 * @return
	 * 全查核算主体信息
	 */
	@RequestMapping(value="/findAllocationAccountingEntityAll",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<OrgInfoPo> findAllocationAccountingEntityAll(HttpServletRequest request,HttpServletResponse response){
		
		//从session总获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		String accountingName = request.getParameter("accountingName");
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("rootOrgInfoId", uOrgRootId);
		params.put("isAvailable", 1);
		params.put("orgStatus", 3);
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		params.put("orgType", 1);
		params.put("orgName", accountingName);
		
		//根据登录用户主机构ID查询组织机构信息表(当前版本号，组织机构状态为“审核通过”，组织机构类型为“机构”，是否启用为“启用”)
		List<OrgInfoPo> orgInfoList = orgInfoFacade.findEntrustMationByRootOrgInfoId(params);
		
		for (OrgInfoPo orgInfoPo : orgInfoList) {
			Integer orgInfoId=orgInfoPo.getId();
			Integer orgVersion=orgInfoPo.getCurrentVersion();
			
			Map<String, Object> params1=new HashMap<String,Object>();
			params1.put("orgInfoId", orgInfoId);
			params1.put("orgVersion", orgVersion);
			
			//根据查询出的组织机构ID和当前版本号字段查询组织机构明细信息表
			OrgDetailInfoPo orgDetailInfoPo = orgDetailInfoFacade.findOdiNameByOrgInfoId(params1);
			if(orgDetailInfoPo!=null){
				orgInfoPo.setOrgName(orgDetailInfoPo.getOrgName());
			}
			
			//根据机构ID匹配结算公式明细表查询是否存在数据
			SettlementFormulaDetailPo settlementFormulaDetailPo=settlementFormulaDetailFacade.findIsDistribution(orgInfoId);
			if(settlementFormulaDetailPo!=null){
				orgInfoPo.setSettStatus(1);
			}else if(settlementFormulaDetailPo==null){
				orgInfoPo.setSettStatus(0);
			}
		}
		return orgInfoList;
	}
	
	/**
	 * @author zhangshuai  2017年6月27日 下午1:27:11
	 * @param request
	 * @param response
	 * @return
	 * 查询核算主体总记录数
	 */
	@RequestMapping(value="/getAllocationAccountingEntityAllCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getAllocationAccountingEntityAllCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session总获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收页面参数
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		String accountingName = request.getParameter("accountingName");
		Integer currentPage=page*rows;
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("rootOrgInfoId", uOrgRootId);
		params.put("isAvailable", 1);
		params.put("orgStatus", 3);
		params.put("orgType", 1);
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		params.put("orgName", accountingName);
		Integer count=orgInfoFacade.getEntrustCount(params);
		return count;
	}


	/**
	 * @author zhangshuai  2017年6月27日 下午4:34:17
	 * @return
	 * 添加结算主体
	 */
	@RequestMapping(value="/checkAllocationAccountingEntityMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public JSONObject checkAllocationAccountingEntityMation(HttpServletRequest request,HttpServletResponse response){
		JSONObject jo=new JSONObject();
		
		//从session中获取登录用户相关信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		Integer uId=userInfo.getId();
		
		//接收页面参数
		Integer sIds=Integer.valueOf(request.getParameter("sIds"));
		Integer AIds=Integer.valueOf(request.getParameter("AIds"));
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("orgRootId", uOrgRootId);//登录用户主机构ID
		params.put("accountingEntity", AIds);//核算主体
		
		//根据登录用户主机构ID和选择的结算主体查询结算明细表是否存在数据
		List<SettlementFormulaDetailPo> settlementFormulaDetailPo=settlementFormulaDetailFacade.findSettlementFormulaDetailIsExist(params);
		if(settlementFormulaDetailPo.size()>=1){
			
			//先删除，后新增
			//根据登录用户主机构ID和选择的核算主体删除结算明细信息
			try {
				settlementFormulaDetailFacade.deleteSettlementFormulaDetailMation(params);
			} catch (Exception e) {
				log.error("删除结算明细信息异常!",e);
			}
			
			//存在就是修改(根据登录用户主机构ID和选择的核算主体修改结算明细表)
			params.put("settlementFormulaId", sIds);//结算公式的编号
			params.put("createUser", uId);//创建人
			params.put("createTime", Calendar.getInstance().getTime());//创建时间
			
			//修改结算明细数据
			jo=settlementFormulaDetailFacade.addSettlementFormulaDetailMation(params);
			
		}else if(settlementFormulaDetailPo.size()<1){
			//不存在就是新增
			params.put("settlementFormulaId", sIds);//结算公式的编号
			params.put("createUser", uId);//创建人
			params.put("createTime", Calendar.getInstance().getTime());//创建时间
			
			//新增结算明细数据
			jo=settlementFormulaDetailFacade.addSettlementFormulaDetailMation(params);
		}
		return jo;
	}
	
	/**
	 * @author zhangshuai  2017年6月27日 下午6:47:41
	 * @param request
	 * @param response
	 * @return
	 * 进入查看结算明细
	 */
	@RequestMapping(value="/seeSettlementFormulaMationModel",produces="application/json;charset=utf-8")
	public String seeSettlementFormulaMationModel(HttpServletRequest request,HttpServletResponse response,Model model){
		String seeSettlementFormulaMationModel="查看结算明细";
		model.addAttribute("seeSettlementFormulaMationModel", seeSettlementFormulaMationModel);
		return "template/settlementFormula/view_settlement_details_page";
	}
	
	/**
	 * @author zhangshuai  2017年6月27日 下午7:04:50
	 * @param request
	 * @param response
	 * @return
	 * 根据ID查询结算明细
	 */
	@RequestMapping(value="/findSettlementFormulaMation",produces="application/json;charset=utf-8")
	@ResponseBody
	public List<SettlementFormulaDetailPo> findSettlementFormulaMation(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收操作结算ID
		Integer sIds=Integer.valueOf(request.getParameter("sIds"));
		Integer page=Integer.parseInt(request.getParameter("page"));
		Integer rows=Integer.parseInt(request.getParameter("rows"));
		Integer currentPage=page*rows;
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("orgRootId", uOrgRootId);
		params.put("settlementFormulaId", sIds);
		params.put("currentPage", currentPage);
		params.put("rows", rows);
		
		//根据登录用户主机构ID和结算ID查询结算明细信息
		List<SettlementFormulaDetailPo> settlementFormulaDetailPoList=settlementFormulaDetailFacade.findSettlementFormulaMation(params);
		
		for (SettlementFormulaDetailPo settlementFormulaDetailPo : settlementFormulaDetailPoList) {

			//根据结算主体id查询名称
			List<Integer> orgIds=new ArrayList<Integer>();
			orgIds.add(settlementFormulaDetailPo.getAccountingEntity());
			List<OrgInfoPo> orgInfoPos = orgInfoFacade.findOrgNameByIds(orgIds);
			if(CollectionUtils.isNotEmpty(orgInfoPos)){
				for (OrgInfoPo orgInfoPo : orgInfoPos) {
					settlementFormulaDetailPo.setAccountingEntityStr(orgInfoPo.getOrgName());
				}
			}
			
			settlementFormulaDetailPo.setCreateTimeStr(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format((settlementFormulaDetailPo.getCreateTime())));
			
		}
		return settlementFormulaDetailPoList;
	}
	
	/**
	 * @author zhangshuai  2017年6月27日 下午8:23:34
	 * @param request
	 * @param response
	 * @return
	 * 查询结算明细表总条数
	 */
	@RequestMapping(value="/getSettlementFormulaDetailMaxCount",produces="application/json;charset=utf-8")
	@ResponseBody
	public Integer getSettlementFormulaDetailMaxCount(HttpServletRequest request,HttpServletResponse response){
		
		//从session中获取登录用户信息
		UserInfo userInfo=(UserInfo)request.getSession().getAttribute("userInfo");
		Integer uOrgRootId=userInfo.getOrgRootId();
		
		//接收操作结算ID
		Integer sIds=Integer.valueOf(request.getParameter("sIds"));
		
		//封装参数
		Map<String, Object> params=new HashMap<String,Object>();
		params.put("orgRootId", uOrgRootId);
		params.put("settlementFormulaId", sIds);

		
		Integer count=settlementFormulaDetailFacade.getSettlementFormulaDetailMaxCount(params);
	    return count;
	}
}
