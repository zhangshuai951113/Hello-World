package com.xz.logistics.controller;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.xz.common.utils.poi.POIExcelUtil;
import com.xz.facade.api.ContractDetailInfoFacade;
import com.xz.model.po.ContractDetailInfo;
import com.xz.model.po.GoodsInfo;
import com.xz.model.po.LineInfoPo;
import com.xz.model.po.LossDeduction;
import com.xz.model.po.LossDeductionAuditLog;
import com.xz.model.po.OrgDetailInfoPo;
import com.xz.model.po.SettlementInfo;
import com.xz.model.po.TransportPrice;
import com.xz.model.po.TransportPriceAuditLog;
import com.xz.model.po.UserInfo;
import com.xz.model.vo.TransportAndLineVo;
import com.xz.rpc.service.OrgDetailInfoService;
import com.xz.rpc.service.TariffManageService;

/**
 * @ClassName TariffManageController
 * @Description 运输策略管理-运价管理控制层
 * @author zhangbo
 * @date 2017/06/26 16:51
 * 
 */

@Controller
@RequestMapping("/tariff")
public class TariffManageController extends BaseController {

	@Resource
	private TariffManageService tariffManageService;

	@Resource
	private OrgDetailInfoService orgDetailInfoService;
	
	@Resource
	private ContractDetailInfoFacade contractDetailInfoFacade;

	// -- /tariff/findTransInfo
	/**
	 * @Title selectTransInfo
	 * @Description 查询运输策略管理-运价管理-大宗运输管理信息
	 * @param TransportPrice
	 *            transportPrice
	 * @return List<TransportPrice>
	 * 
	 */
	@RequestMapping("/findTransInfo")
	@ResponseBody
	public Map<String, Object> selectTransInfo(HttpServletRequest request, TransportPrice transportPrice) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		return tariffManageService.selectTransInfo(transportPrice, orgRootId, userId);
	}

	/**
	 * @Title selectLineInfo
	 * @Description 查询线路信息
	 * @param TransportPrice
	 *            transportPrice
	 * @return List<TransportPrice>
	 * 
	 */
	@RequestMapping("/selectLineInfo")
	@ResponseBody
	public Map<String, Object> selectLineInfo(HttpServletRequest request, String lineName, String curPage,
			String pageSizeStr) {
		return tariffManageService.selectLineInfoByOid(lineName, curPage, pageSizeStr);
	}

	/**
	 * @Title showBigTrafficmanage
	 * @Description 跳转到大宗运价管理页面
	 * @return url字符串
	 * 
	 */

	// -- /tariff/goBigTrafficManage
	@RequiresPermissions("traffic:price:buik:view")
	@RequestMapping("/goBigTrafficManage")
	public String showBigTrafficmanage() {
		return "template/transport/big_transport_price";
	}

	/**
	 * @Title selectContractforLogistics
	 * @Description 查询物流公司的合同信息
	 * @return List<ContractDetailInfo>
	 * @param Integer
	 *            orgId
	 */
	// --/tariff/findContractforLogistics
	@RequestMapping("/findContractforLogistics")
	@ResponseBody
	public Map<String, Object> selectContractforLogistics(HttpServletRequest request,
			ContractDetailInfo contractDetailInfo) {
		// 获取当前用户
		Map<String, Object> DetailInfo = new HashMap<String, Object>();
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		contractDetailInfo.setOrgRootId(orgRootId);
		contractDetailInfo.setCreateUser(userId);
		Integer userRole = userInfo.getUserRole();
		// 当前用户是企业货主
		if (userRole == 1) {
			DetailInfo = tariffManageService.selectContractforShipper(contractDetailInfo);
		}
		// 当前用户是物流公司
		if (userRole == 2) {
			DetailInfo = tariffManageService.selectContractforLogistics(contractDetailInfo);
		}
		return DetailInfo;
	}

	/**
	 * @Title insertContractforLogistics
	 * @Description 新增物流运价
	 * @param TransportPrice
	 *            transportPrice
	 */
	// --/tariff/addContractforLogistics
	@RequestMapping("/addContractforLogistics")
	@ResponseBody
	public String insertContractforLogistics(HttpServletRequest request, TransportPrice transportPrice) {
		String flag = "";
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		//Integer orgCooperateState = userInfo.getOrgCooperateState();
		Integer userRole = userInfo.getUserRole();
		/*if(userRole == 1){//企业货主
			transportPrice.setCooperateStatus(1);
		}*/
		//transportPrice.setCooperateStatus(orgCooperateState);
		transportPrice.setOrgRootId(orgRootId);
		transportPrice.setCreateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(transportPrice.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(transportPrice.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			transportPrice.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			transportPrice.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		//根据该条数据的委托方，承运方，发货单位，到货单位，货物，线路匹配启用日期是否合法
		transportPrice.setTransportPriceClassify(1);
        transportPrice.setTransportPriceType(1);
        TransportPrice transportPriceView = new TransportPrice();
        transportPriceView = tariffManageService.selectStartDateForBig(transportPrice);
        if(null !=transportPriceView){
        	if(transportPriceView.getStartDate().getTime() > transportPrice.getStartDate().getTime()){
        		 SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        		   String dateString = formatter.format(transportPriceView.getStartDate());
        	    flag =  dateString;
        	}else{
        		tariffManageService.insertContractforLogistics(transportPrice, userRole);
        		flag = "success";
        	}
        }else{
        	tariffManageService.insertContractforLogistics(transportPrice, userRole);
    		flag = "success";
        }
		
		return flag;
	}

	/**
	 * @Title insertContractforSubcontract
	 * @Description 新增转包运价
	 * @param TransportPrice
	 *            transportPrice
	 */
	// --/tariff/addContractforSubcontract
	@RequestMapping("/addContractforSubcontract")
	@ResponseBody
	public String insertContractforSubcontract(HttpServletRequest request, TransportPrice transportPrice) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		//Integer orgCooperateState = userInfo.getOrgCooperateState();
		Integer userRole = userInfo.getUserRole();
		/*if(userRole == 1){//企业货主
			transportPrice.setCooperateStatus(1);
		}*/
		Integer orgInfoId = userInfo.getOrgInfoId();
		//transportPrice.setCooperateStatus(orgCooperateState);
		transportPrice.setOrgRootId(orgRootId);
		transportPrice.setCreateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(transportPrice.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(transportPrice.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			transportPrice.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			transportPrice.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		//根据该条数据的委托方，承运方，发货单位，到货单位，货物，线路匹配启用日期是否合法
				transportPrice.setTransportPriceClassify(1);
		        transportPrice.setTransportPriceType(2);
		        TransportPrice transportPriceView = new TransportPrice();
		        transportPriceView = tariffManageService.selectStartDateForBig(transportPrice);
		        if(null !=transportPriceView){
		        	if(transportPriceView.getStartDate().getTime() > transportPrice.getStartDate().getTime()){
		        		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		        		   String dateString = formatter.format(transportPriceView.getStartDate());
		        		return dateString;
		        	}
		        }
		tariffManageService.insertContractforSubcontract(transportPrice, userRole,orgInfoId);
		return "success";
	}

	/**
	 * @Title updateTariffic
	 * @Description 修改运价
	 * @param TransportPrice
	 *            transportPrice
	 */
	// --/tariff/editTariffic
	@RequestMapping("/editTariffic")
	@ResponseBody
	public boolean updateTariffic(HttpServletRequest request, TransportPrice transportPrice) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		if(userRole == 1){//企业货主
			transportPrice.setCooperateStatus(1);
		}
		transportPrice.setUpdateTime(new java.sql.Date(new Date().getTime()));
		transportPrice.setUpdateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(transportPrice.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(transportPrice.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			transportPrice.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			transportPrice.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		tariffManageService.updateTariffic(transportPrice, userRole);
		return true;
	}
	
	
	/**
	 * @Title updateZBTariffic
	 * @Description 修改转包运价
	 * @param TransportPrice
	 *            transportPrice
	 */
	// --/tariff/editTariffic
	@RequestMapping("/editZBTariffic")
	@ResponseBody
	public boolean updateZBTariffic(HttpServletRequest request, TransportPrice transportPrice) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userId = userInfo.getId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		transportPrice.setUpdateTime(new java.sql.Date(new Date().getTime()));
		transportPrice.setUpdateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(transportPrice.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(transportPrice.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			transportPrice.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			transportPrice.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		tariffManageService.updateZBTariffic(transportPrice, orgInfoId);
		return true;
	}

	/**
	 * @Title deleteTariffic
	 * @Description 删除大宗运价
	 * @param String
	 *            ids
	 */
	// --/tariff/delTariffic
	@RequestMapping("/delTariffic")
	@ResponseBody
	public boolean deleteTariffic(String ids) {
		tariffManageService.deleteTariffic(ids);
		return true;
	}

	/**
	 * @Title tjTariffic
	 * @Description 提交审核大宗运价
	 * @param String
	 *            ids
	 */
	@RequestMapping("/tjTariffic")
	@ResponseBody
	public boolean tjTariffic(String id) {
		tariffManageService.tjTariffic(id);
		return true;
	}

	/**
	 * @Title auditTariffic
	 * @Description 审核大宗运价
	 * @param String
	 *            ids
	 */
	@RequestMapping("/auditTariffic")
	@ResponseBody
	public boolean auditTariffic(HttpServletRequest request, String id, String buttonType, String auditOpinion) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		TransportPriceAuditLog transportPriceAuditLog = new TransportPriceAuditLog();
		transportPriceAuditLog.setOrgRootId(orgRootId);
		transportPriceAuditLog.setAuditPerson(userId);
		transportPriceAuditLog.setAuditOpinion(auditOpinion);
		transportPriceAuditLog.setAuditResult(Integer.valueOf(buttonType));
		transportPriceAuditLog.setTransportPriceId(Integer.valueOf(id));
		tariffManageService.auditTariffic(transportPriceAuditLog);
		return true;
	}

	/**
	 * @Title selectContractforSubcontract
	 * @Description 查询物流公司的合同信息
	 * @return List<ContractDetailInfo>
	 * @param Integer
	 *            orgId
	 */
	// --/tariff/findContractforSubcontract
	@RequestMapping("/findContractforSubcontract")
	@ResponseBody
	public Map<String, Object> selectContractforSubcontract(HttpServletRequest request,
			ContractDetailInfo contractDetailInfo) {
		// 获取当前用户
		Map<String, Object> DetailInfo = new HashMap<String, Object>();
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		contractDetailInfo.setOrgRootId(orgRootId);
		contractDetailInfo.setCreateUser(userId);
		//Integer userRole = userInfo.getUserRole();
		// 当前用户是企业货主
		//if (userRole == 1) {
		//	DetailInfo = tariffManageService.selectContractforShipperzb(contractDetailInfo);
		//}
		// 当前用户是物流公司
		//if (userRole == 2) {
			DetailInfo = tariffManageService.selectContractforLogisticszb(contractDetailInfo);
		//}
		return DetailInfo;
	}

	/**
	 * ---------------------------------------外协司机用价管理--------------------------
	 * -
	 **/

	/**
	 * @Title showDriverTrafficmanage
	 * @Description 外协司机用价管理页面
	 * @return url字符串
	 * 
	 */

	// --/tariff/goDriverTrafficManage
	@RequiresPermissions("traffic:price:outCar:view")
	@RequestMapping("/goDriverTrafficManage")
	public String showDriverTrafficmanage() {
		return "template/transport/driver-transport-price";
	}

	/**
	 * @Title selectDriverTransInfo
	 * @Description 查询运输策略管理-运价管理-外协司机运输管理信息
	 * @param TransportPrice
	 *            transportPrice
	 * @return List<TransportPrice>
	 * 
	 */
	@RequestMapping("/findDriverTransInfo")
	@ResponseBody
	public Map<String, Object> selectDriverTransInfo(HttpServletRequest request, TransportPrice transportPrice) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		return tariffManageService.selectDriverTransInfo(transportPrice, orgRootId, userId);
	}

	/**
	 * @Title choickUserRose
	 * @Description 根据用户角色不同进行不同的操作
	 * @param TransportPrice
	 *            transportPrice
	 * @return List<TransportPrice>
	 * 
	 */
	@RequestMapping("/choickUserRose")
	@ResponseBody
	public String choickUserRose(HttpServletRequest request) {
		String flag = "";
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userRole = userInfo.getUserRole();
		// 当前用户是企业货主
		if (userRole == 1) {
			flag = "1";
		}
		// 当前用户是物流公司
		if (userRole == 2) {
			flag = "2";
		}
		return flag;
	}

	/**
	 * @Title insertTarifficforDriver
	 * @Description 新增外协司机运价
	 * @param TransportPrice
	 *            transportPrice
	 */
	// --/tariff/addTarifficforDriver
	@RequestMapping("/addTarifficforDriver")
	@ResponseBody
	public String insertTarifficforDriver(HttpServletRequest request, TransportPrice transportPrice) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		//Integer orgCooperateState = userInfo.getOrgCooperateState();
		Integer userRole = userInfo.getUserRole();
		if(userRole == 1){//企业货主
			transportPrice.setCooperateStatus(1);
		}
		//transportPrice.setCooperateStatus(orgCooperateState);
		transportPrice.setOrgRootId(orgRootId);
		transportPrice.setCreateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(transportPrice.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(transportPrice.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			transportPrice.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			transportPrice.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		//根据该条数据的委托方，承运方，发货单位，到货单位，货物，线路匹配启用日期是否合法
				transportPrice.setTransportPriceClassify(2);
		        TransportPrice transportPriceView = new TransportPrice();
		        transportPriceView = tariffManageService.selectStartDateForDriver(transportPrice);
		        if(null !=transportPriceView){
		        	if(transportPriceView.getStartDate().getTime() > transportPrice.getStartDate().getTime()){
		        		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		        		 String dateString = formatter.format(transportPriceView.getStartDate());
			        		return dateString;
		        	}
		        }
		tariffManageService.insertTarifficforDriver(transportPrice, userRole);
		return "success";
	}

	/**
	 * ---------------------------------------代理用价管理---------------------------
	 **/

	/**
	 * @Title showProxyTrafficmanage
	 * @Description 代理运价管理页面
	 * @return url字符串
	 * 
	 */
	@RequiresPermissions("traffic:price:proxy:view")
	@RequestMapping("/goProxyTrafficManage")
	public String showProxyTrafficmanage() {
		return "template/transport/proxy-transport-price";
	}

	/**
	 * @Title selectProxyTransInfo
	 * @Description 查询运输策略管理-运价管理-代理运价管理信息
	 * @param TransportPrice
	 *            transportPrice
	 * @return List<TransportPrice>
	 * 
	 */
	@RequestMapping("/findProxyTransInfo")
	@ResponseBody
	public Map<String, Object> selectProxyTransInfo(HttpServletRequest request, TransportPrice transportPrice) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		return tariffManageService.selectProxyTransInfo(transportPrice, orgRootId, userId);
	}

	/**
	 * @Title insertTarifficforProxy
	 * @Description 新增代理运价
	 * @param TransportPrice
	 *            transportPrice
	 */
	// --/tariff/addTarifficforProxy
	@RequestMapping("/addTarifficforProxy")
	@ResponseBody
	public String insertTarifficforProxy(HttpServletRequest request, TransportPrice transportPrice) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		transportPrice.setOrgRootId(orgRootId);
		transportPrice.setCreateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(transportPrice.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(transportPrice.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			transportPrice.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			transportPrice.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		//根据该条数据的委托方，承运方，发货单位，到货单位，货物，线路匹配启用日期是否合法
				transportPrice.setTransportPriceClassify(3);
		        TransportPrice transportPriceView = new TransportPrice();
		        transportPriceView = tariffManageService.selectStartDateForProxy(transportPrice);
		        if(null !=transportPriceView){
		        	if(transportPriceView.getStartDate().getTime() > transportPrice.getStartDate().getTime()){
		        		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		        		 String dateString = formatter.format(transportPriceView.getStartDate());
			        		return dateString;
		        	}
		        }
		tariffManageService.insertTarifficforProxy(transportPrice, userRole);
		return "success";
	}

	/**
	 * ---------------------------------------损耗扣款管理---------------------------
	 **/
	/**
	 * @Title showBigLossManage
	 * @Description 大宗损耗扣款管理页面
	 * @return url字符串
	 * 
	 */
	@RequestMapping("/goBigLossManage")
	@RequiresPermissions("traffic:lossCharge:bulk:view")
	public String showBigLossManage() {
		return "template/transport/big-loss-deduction";
	}

	/**
	 * @Title showDriverLossManage
	 * @Description 外协司机损耗扣款管理页面
	 * @return url字符串
	 * 
	 */
	@RequestMapping("/goDriverLossManage")
	@RequiresPermissions("traffic:lossCharge:outCar:view")
	public String showDriverLossManage() {
		return "template/transport/driver-loss-deduction";
	}

	/**
	 * @Title selectBigLossInfo
	 * @Description 查询运输策略管理-损耗扣款管理-大宗损耗扣款管理
	 * @param TransportPrice
	 *            transportPrice
	 * @return List<TransportPrice>
	 * 
	 */
	@RequestMapping("/findBigLossInfo")
	@ResponseBody
	public Map<String, Object> selectBigLossInfo(HttpServletRequest request, LossDeduction lossDeduction) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		return tariffManageService.selectBigLossInfo(lossDeduction, orgRootId, userId);
	}

	/**
	 * @Title insertLossForwl
	 * @Description 新增大宗损耗扣款-物流损耗扣款
	 * @param LossDeduction
	 *            lossDeduction
	 */
	@RequestMapping("/addLossForwl")
	@ResponseBody
	public String insertLossForwl(HttpServletRequest request, LossDeduction lossDeduction) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		//Integer orgCooperateState = userInfo.getOrgCooperateState();
		Integer userRole = userInfo.getUserRole();
		/*if(userRole == 1){//企业货主
			lossDeduction.setCooperateStatus(1);
		}*/
		//lossDeduction.setCooperateStatus(orgCooperateState);
		lossDeduction.setOrgRootId(orgRootId);
		lossDeduction.setCreateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(lossDeduction.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(lossDeduction.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			lossDeduction.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			lossDeduction.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		//根据该条数据的委托方，承运方，发货单位，到货单位，货物，线路匹配启用日期是否合法
		lossDeduction.setLossDeductionClassify(1);
		lossDeduction.setLossDeductionType(1);
		LossDeduction lossDeductionView = new LossDeduction();
		lossDeductionView = tariffManageService.selectStartDateForBigLoss(lossDeduction);
        if(null !=lossDeductionView){
        	if(lossDeductionView.getStartDate().getTime() > lossDeduction.getStartDate().getTime()){
        		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        		   String dateString = formatter.format(lossDeductionView.getStartDate());
        		return dateString;
        	}
        }		
		tariffManageService.insertLossForwl(lossDeduction, userRole);
		return "success";
	}

	/**
	 * @Title insertLossForzb
	 * @Description 新增大宗损耗扣款-转包损耗扣款
	 * @param LossDeduction
	 *            lossDeduction
	 */
	@RequestMapping("/addLossForzb")
	@ResponseBody
	public String insertLossForzb(HttpServletRequest request, LossDeduction lossDeduction) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		if(userRole == 1){//企业货主
			lossDeduction.setCooperateStatus(1);
		}
		//Integer orgCooperateState = userInfo.getOrgCooperateState();
		Integer orgInfoId = userInfo.getOrgInfoId();
		//lossDeduction.setCooperateStatus(orgCooperateState);
		lossDeduction.setOrgRootId(orgRootId);
		lossDeduction.setCreateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(lossDeduction.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(lossDeduction.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			lossDeduction.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			lossDeduction.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		
		//根据该条数据的委托方，承运方，发货单位，到货单位，货物，线路匹配启用日期是否合法
				lossDeduction.setLossDeductionClassify(1);
				lossDeduction.setLossDeductionType(2);
				LossDeduction lossDeductionView = new LossDeduction();
				lossDeductionView = tariffManageService.selectStartDateForBigLoss(lossDeduction);
		        if(null !=lossDeductionView){
		        	if(lossDeductionView.getStartDate().getTime() > lossDeduction.getStartDate().getTime()){
		        		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		        		   String dateString = formatter.format(lossDeductionView.getStartDate());
		        		return dateString;
		        	}
		        }	
		tariffManageService.insertLossForzb(lossDeduction, orgInfoId);
		return "success";
	}

	/**
	 * @Title updateLossDeduction
	 * @Description 修改损耗扣款
	 * @param LossDeduction
	 *            lossDeduction
	 */
	@RequestMapping("/editLossDeduction")
	@ResponseBody
	public boolean updateLossDeduction(HttpServletRequest request, LossDeduction lossDeduction) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userId = userInfo.getId();
		Integer userRole = userInfo.getUserRole();
		if(userRole == 1){//企业货主
			lossDeduction.setCooperateStatus(1);
		}
		lossDeduction.setUpdateTime(new java.sql.Date(new Date().getTime()));
		lossDeduction.setUpdateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(lossDeduction.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(lossDeduction.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			lossDeduction.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			lossDeduction.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		tariffManageService.updateLossDeduction(lossDeduction, userRole);
		return true;
	}
	
	/**
	 * @Title updateZBLossDeduction
	 * @Description 修改转包损耗扣款
	 * @param LossDeduction
	 *            lossDeduction
	 */
	@RequestMapping("/editZBLossDeduction")
	@ResponseBody
	public boolean updateZBLossDeduction(HttpServletRequest request, LossDeduction lossDeduction) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer userId = userInfo.getId();
		Integer orgInfoId = userInfo.getOrgInfoId();
		lossDeduction.setUpdateTime(new java.sql.Date(new Date().getTime()));
		lossDeduction.setUpdateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(lossDeduction.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(lossDeduction.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			lossDeduction.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			lossDeduction.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		tariffManageService.updateZBLossDeduction(lossDeduction, orgInfoId);
		return true;
	}

	/**
	 * @Title deleteTariffic
	 * @Description 删除大宗损耗付款
	 * @param String
	 *            ids
	 */
	@RequestMapping("/delLossDedectionInfo")
	@ResponseBody
	public boolean deleteLossDedectionInfo(String ids) {
		tariffManageService.deleteLossDedectionInfo(ids);
		return true;
	}

	/**
	 * @Title tjLossDeduction
	 * @Description 提交审核损耗扣款
	 * @param String
	 *            id
	 */
	@RequestMapping("/tjLossDeduction")
	@ResponseBody
	public boolean tjLossDeduction(String id) {
		tariffManageService.tjLossDeduction(id);
		return true;
	}

	/**
	 * @Title auditLossDeduction
	 * @Description 审核损耗扣款
	 * @param String
	 *            id,String buttonType,String auditOpinion
	 */
	@RequestMapping("/auditLossDeduction")
	@ResponseBody
	public boolean auditLossDeduction(HttpServletRequest request, String id, String buttonType, String auditOpinion) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		LossDeductionAuditLog lossDeductionAuditLog = new LossDeductionAuditLog();
		lossDeductionAuditLog.setOrgRootId(orgRootId);
		lossDeductionAuditLog.setAuditPerson(userId);
		lossDeductionAuditLog.setAuditOpinion(auditOpinion);
		lossDeductionAuditLog.setAuditResult(Integer.valueOf(buttonType));
		lossDeductionAuditLog.setLossDeductionId(Integer.valueOf(id));
		tariffManageService.auditLossDeduction(lossDeductionAuditLog);
		return true;
	}

	/**
	 * @Title selectDriverLossInfo
	 * @Description 查询运输策略管理-损耗扣款管理-外协司机损耗扣款管理
	 * @param LossDeduction
	 *            lossDeduction
	 * @return List<LossDeduction>
	 * 
	 */
	@RequestMapping("/findDriverLossInfo")
	@ResponseBody
	public Map<String, Object> selectDriverLossInfo(HttpServletRequest request, LossDeduction lossDeduction) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		return tariffManageService.selectDriverLossInfo(lossDeduction, orgRootId, userId);
	}

	/**
	 * @Title insertLossForDriverWl
	 * @Description 新增外协司机损耗扣款-用户为物流公司
	 * @param LossDeduction
	 *            lossDeduction
	 */
	@RequestMapping("/addLossForDriverWl")
	@ResponseBody
	public String insertLossForDriverWl(HttpServletRequest request, LossDeduction lossDeduction) {
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		//Integer orgCooperateState = userInfo.getOrgCooperateState();
		Integer userRole = userInfo.getUserRole();
		if(userRole == 1){//企业货主
			lossDeduction.setCooperateStatus(1);
		}
		//lossDeduction.setCooperateStatus(orgCooperateState);
		lossDeduction.setOrgRootId(orgRootId);
		lossDeduction.setCreateUser(userId);
		ContractDetailInfo contractDetailInfo = new ContractDetailInfo();
		if(lossDeduction.getContractDetailInfoId() != null){
			//根据合同明细Id查询合同明细表的委托方主机构和承运方主机构
			contractDetailInfo =contractDetailInfoFacade.findContractDetailInfoAllById(lossDeduction.getContractDetailInfoId());
		}
		if(null != contractDetailInfo){
			lossDeduction.setEntrustRootId(contractDetailInfo.getEntrustOrgRoot());
			lossDeduction.setShipperRootId(contractDetailInfo.getShipperOrgRoot());
		}
		//根据该条数据的委托方，承运方，发货单位，到货单位，货物，线路匹配启用日期是否合法
		lossDeduction.setLossDeductionClassify(2);
		LossDeduction lossDeductionView = new LossDeduction();
		lossDeductionView = tariffManageService.selectStartForDriverLoss(lossDeduction);
        if(null !=lossDeductionView){
        	if(lossDeductionView.getStartDate().getTime() > lossDeduction.getStartDate().getTime()){
        		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        		   String dateString = formatter.format(lossDeductionView.getStartDate());
        		return dateString;
        	}
        }	
		tariffManageService.insertLossForDriverWl(lossDeduction, userRole);
		return "success";
	}

	/**
	 * @title selectCustomerName
	 * @description 根据主机构Id查询符合条件的客户名称
	 * @param Integer
	 *            orgRootId
	 * @return List<OrgDetailInfoPo>
	 * @author zhangbo
	 */
	@RequestMapping("/findCustomerName")
	@ResponseBody
	public Map<String, Object> selectCustomerName(HttpServletRequest request, String curPage, String pageSizeStr,
			String sign) {
		List<OrgDetailInfoPo> tList = new ArrayList<OrgDetailInfoPo>();
		int totalCount = 0;
		Map<String, Object> lmap = new HashMap<String, Object>();
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		OrgDetailInfoPo orgDetailInfoPo = new OrgDetailInfoPo();
		int curPostion = 0;
		int pageSize = 0;
		pageSize = Integer.valueOf(pageSizeStr);
		if (curPage != null && curPage != "") {
			curPostion = Integer.valueOf(curPage);
			curPostion = (curPostion - 1) * pageSize;
		}
		orgDetailInfoPo.setCurPostion(curPostion);
		orgDetailInfoPo.setPageSize(pageSize);
		orgDetailInfoPo.setOrgRootId(orgRootId);
		orgDetailInfoPo.setCooperateState(1);
		if ("2".equals(sign)) {//新增代理运价是使用
			orgDetailInfoPo.setCooperateState(2);
			orgDetailInfoPo.setUserRole(2); //只查用户角色为物流公司的
		}
		tList = orgDetailInfoService.selectOrgName(orgDetailInfoPo);
		totalCount = orgDetailInfoService.selectOrgNameTotal(orgDetailInfoPo);
		lmap.put("tList", tList);
		lmap.put("totalCount", totalCount);
		return lmap;
	}

	/**
	 * @Title selectgoodsInfo
	 * @Description 查询货物信息
	 * @param GoodsInfo
	 *            goodsInfo
	 * @return Map<String,Object>
	 * 
	 */
	// --/tariff/findgoodsInfo
	@RequestMapping("/findgoodsInfo")
	@ResponseBody
	public Map<String, Object> selectgoodsInfo(HttpServletRequest request, GoodsInfo goodsInfo) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		goodsInfo.setOrgRootId(orgRootId);
		return tariffManageService.selectGoodsListForTraiff(goodsInfo);
	}

	/**
	 * @title selectLogisticsTariff
	 * @description 查询满足条件的大宗运价(外协司机运价和代理运价使用)
	 * @param TransportPrice transportPrice
	 * @return Map<String, Object>
	 * @author zhangbo
	 * @date 2017/08/09 21:00
	 * */
	// --/tariff/findLogisticsTariff
	@RequestMapping("findLogisticsTariff")
	@ResponseBody
	public Map<String, Object> selectLogisticsTariff(HttpServletRequest request, TransportPrice transportPrice) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		return tariffManageService.selectLogisticsTariff(transportPrice, orgRootId, userId);

	}
	
	/**
	 * @title selectLogisticsloss
	 * @description 查询满足条件的大宗损耗(外协司机损耗使用)
	 * @param LossDeduction lossDeduction
	 * @return Map<String, Object>
	 * @author zhangbo
	 * @date 2017/08/09 21:00
	 * */
	// --/tariff/findLogisticsloss
	@RequestMapping("findLogisticsloss")
	@ResponseBody
	public Map<String, Object> selectLogisticsloss(HttpServletRequest request, LossDeduction lossDeduction) {
		// 获取当前用户
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		return tariffManageService.selectLogisticsloss(lossDeduction, orgRootId, userId);
	}
	
	
	@RequestMapping("/exportTariffic")
	@ResponseBody
	public void exportTarifficInfo(String ids,String type,HttpServletRequest request, HttpServletResponse response) {
		String finalFileName = "运价信息";
		response.setContentType("application/vnd.ms-excel;charset=UTF-8");
		try {
			finalFileName = URLEncoder.encode(finalFileName, "UTF-8");
			response.setCharacterEncoding("utf-8"); 
			response.addHeader("Content-Disposition", "attachment;filename="+new String( finalFileName.getBytes("gbk"), "UTF-8" )+".xls"); 		
			} catch (UnsupportedEncodingException e) {
		}
		List<TransportPrice> exportList = new ArrayList<TransportPrice>();
		List<Integer> idsList = new ArrayList<Integer>();
		if (ids != "") {
			for (String id : ids.split(",")) {
				idsList.add(Integer.valueOf(id));
			}
			// 根据主键查询要导出的数据
			exportList = tariffManageService.selectTrafficForExport(idsList);
			Map<String, Object> tmap = new HashMap<String, Object>();
			List<String> keyList = new ArrayList<String>();
			List<String> titleList = new ArrayList<String>();
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			Workbook workbook = new HSSFWorkbook();

			// 调用导出方法
			tmap = tariffManageService.exportTraffice(exportList,type);
			// 取出要到处的参数
			keyList = (List<String>) tmap.get("keyList");
			titleList = (List<String>) tmap.get("titleList");
			list = (List<Map<String, Object>>) tmap.get("list");
			try {
				workbook = POIExcelUtil.exportExcel(titleList, keyList, list, finalFileName);
				OutputStream os = response.getOutputStream();
				workbook.write(os);
				os.flush();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	
	@RequestMapping("/exportLossDeduction")
	@ResponseBody
	public void exportLossDeductionInfo(String ids,String type,HttpServletRequest request, HttpServletResponse response) {
		String finalFileName = "损耗信息";
		response.setContentType("application/vnd.ms-excel;charset=UTF-8");
		try {
			finalFileName = URLEncoder.encode(finalFileName, "UTF-8");
			response.setCharacterEncoding("utf-8"); 
			response.addHeader("Content-Disposition", "attachment;filename="+new String( finalFileName.getBytes("gbk"), "UTF-8" )+".xls"); 		
		} catch (UnsupportedEncodingException e) {
		}
		List<LossDeduction> exportList = new ArrayList<LossDeduction>();
		List<Integer> idsList = new ArrayList<Integer>();
		if (ids != "") {
			for (String id : ids.split(",")) {
				idsList.add(Integer.valueOf(id));
			}
			// 根据主键查询要导出的数据
			exportList = tariffManageService.selectLossDeductionForExport(idsList);
			Map<String, Object> tmap = new HashMap<String, Object>();
			List<String> keyList = new ArrayList<String>();
			List<String> titleList = new ArrayList<String>();
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			Workbook workbook = new HSSFWorkbook();
			
			// 调用导出方法
			tmap = tariffManageService.exportLossDeduction(exportList, type);
			// 取出要到处的参数
			keyList = (List<String>) tmap.get("keyList");
			titleList = (List<String>) tmap.get("titleList");
			list = (List<Map<String, Object>>) tmap.get("list");
			try {
				workbook = POIExcelUtil.exportExcel(titleList, keyList, list, finalFileName);
				OutputStream os = response.getOutputStream();
				workbook.write(os);
				os.flush();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
}
