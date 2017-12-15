package com.xz.logistics.controller;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;
import net.sf.json.util.JSONStringer;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.xz.common.utils.fastdfs.FastdfsClientUtil;
import com.xz.common.utils.pager.DataPager;
import com.xz.facade.api.DriverInfoFacade;
import com.xz.facade.api.PaymentAgentFacade;
import com.xz.facade.api.SettlementInfoFacade;
import com.xz.facade.api.UserDataAuthFacade;
import com.xz.logistics.constances.SysConstances;
import com.xz.logistics.utils.HttpClientUtil;
import com.xz.logistics.utils.JsonUtil;
import com.xz.logistics.utils.StringUtil;
import com.xz.model.po.AgentSettlementInfo;
import com.xz.model.po.DriverWaybillImgDetailInfo;
import com.xz.model.po.LgData;
import com.xz.model.po.SettlementInfo;
import com.xz.model.po.UserDataAuthPo;
import com.xz.model.po.UserInfo;

/**
 * 代理支付管理
 * 
 * @author yuewei 2017年10月8日下午4:58:40
 * 
 */
@Controller
@RequestMapping("/agent")
public class PaymentAgentController extends BaseController {

	@Resource
	private PaymentAgentFacade paymentAgentFacade;
	
	@Resource
	private SettlementInfoFacade settlementInfoFacade;
	
	@Resource
	private UserDataAuthFacade userDataAuthFacade;
	@Resource
	private DriverInfoFacade driverInfoFacade;
	
	/**
	 * 代理支付页面
	 * @author yuewei 2017年10月30日 下午5:22:20
	 */
	@RequestMapping(value = "/goExport", produces = "application/json;charset=utf-8")
	public String goCuteinfoPage(HttpServletRequest request,
			HttpServletResponse response, Model model) {
		String cuteinfo = "导入代理系统";

		return "template/agentsys/show_agent_settlement_list_page";
	}

	/**
	 * 代理方结算单信息列表
	 * 
	 * @author yuewei 2017年10月30日
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/listAgentSettlementInfo")
	public String listAgentSettlementInfo(HttpServletRequest request, Model model) {

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
			Integer totalNum = paymentAgentFacade
					.countAgentSettlementInfoForPage(queryMap);

			// 4、分页查询结算信息
			List<SettlementInfo> settlementInfoList = paymentAgentFacade
					.findAgentSettlementInfoForPage(queryMap);
			
			// 5、总数、分页信息封装
			settlementInfoPager.setTotal(totalNum);
			settlementInfoPager.setRows(settlementInfoList);
		}

		model.addAttribute("cuteinfoSettlementInfoPager", settlementInfoPager);
		return "template/agentsys/agent_settlement_info_data";
	}

	
	
	/**
	 * 上报结算单至金网运通
	 * 
	 * @author yuewei 2017年10月10日 下午7:14:15
	 * @throws Exception
	 */
	@RequestMapping(value = "/upAgentSettlementInfo", produces = "application/json;charset=utf-8")
	@ResponseBody
	public String upAgentSettlementInfo(HttpServletRequest request,
			HttpServletResponse response, Model model) throws Exception {
		JSONStringer stringer = null;
		// 从session中取出当前用户的主机构ID
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute(
				"userInfo");
		
		Integer orgRootId = userInfo.getOrgRootId();
		Integer userId = userInfo.getId();
		String result = "{\"msg\":\"服务器未知错误!!\"}";
		
		Map<String, Object> params = StringUtil.requestParameter(request); //封装参数
							//上报数据至金网运通
		String resultStr = this.uloadAgentSettlementInfo(params,userId);
		result = resultStr;
		return result;
	}

	/**
	 * 上报数据至金网运通
	 * @author Administrator 2017年11月1日 下午5:16:56
	 */
	/**
	 * @author Administrator 2017年11月4日 上午11:07:13
	 */
	public String uloadAgentSettlementInfo(Map<String, Object> params, Integer userId)
			throws Exception {

		String sret = null;
		String sJson =null;
		String sendJson=null;
		AgentSettlementInfo aSettlementinfo  =  new AgentSettlementInfo();
		System.setProperty("TAX_HR_SAP_KEY", "wer32sdfwe()92.WERWs-=dfwe##$3sd");//KeyA(测试环境)
		System.setProperty("TAX_HR_SAP_ENT_KEY", "edwer56%23^dEKLY./ered*7324++--e");//KeyB(测试环境)
		System.setProperty("TAX_SFAI_ADD_KEY", "JH76fh*21179Ft2");//KeyC(测试环境)
		
//		System.setProperty("TAX_HR_SAP_KEY", "wee()92.Ws-=dfwe##$3sddds3#2*($3%4/?");//KeyA(线上环境)
//		System.setProperty("TAX_HR_SAP_ENT_KEY", "edwer56%23^dEKLY./ered*7324++--e");//KeyB(线上环境)
//		System.setProperty("TAX_SFAI_ADD_KEY", "abcJH76fh*21179Ft2d");//KeyC(线上环境)
		
		
		String  datetime = String.valueOf(System.currentTimeMillis());
		String sign=null;
		String urlsign=null;
		String shipper = null;
		String mobileno = null;//注册手机号
		String url = "http://220.248.226.76:20113/HR_SAP/entService?datetime="+datetime;
		//String url = "http://syf.log56.com:10000/HR_SAP/entService?datetime="+datetime;
		String result_code = null;
		String result_info = null;
		String settlementNo=null;
		byte[] imgbyte=null;
		String retJson =null;
		String imgPath = null;
		String stat = null;
		String lgspf=null;
		HashMap<String,Object> map =null;
		LgData lgData = new LgData();
		String loginName = null;
		String loginPassword = null;
		//String lg_pwd = DigestUtils.md5Hex("1" +System.getProperty("TAX_SFAI_ADD_KEY")    );
		String lg_pwd = DigestUtils.md5Hex((params.get("loginPassword") +System.getProperty("TAX_SFAI_ADD_KEY")).getBytes("utf-8"));
		String rootWaybillInfoId = null;
		String sId = null;
		
		
		/*String sql="select top 1 派车单编号,司机电话,司机姓名,车牌号码,承运人,"
		+ "(select luge_province from dbo.t_site where local_site = a.起点) as start_province,"
		+ "(select luge_city from dbo.t_site where local_site = a.起点) as start_city,"
		+ "(select luge_county from dbo.t_site where local_site = a.起点) as start_county,"
		+ "(select luge_province from dbo.t_site where local_site = a.终点) as end_province,"
		+ "(select luge_city from dbo.t_site where local_site = a.终点) as end_city,"
		+ "(select luge_county from dbo.t_site where local_site = a.终点) as end_county,"
		+ "货物名称,客户名称,case when 发货吨位>到货吨位 then 到货吨位 else 发货吨位 end as 货物数量,司机运价,"
		+ "(isnull(应付运费,0)+isnull(燃料费,0)) as 运费,损耗扣款,convert(varchar,发货日期,120) as 发货日期,"
		+ "起点,终点,组织部门 from dbo.T_结算单 a  WHERE 派车单id ='"+String.valueOf(id)+"'";*/
		
		Map<String, Object> rs = paymentAgentFacade.getAgentSettlementInfo(params);// 获取代理支付结算单信息
		
		
		if(null!=rs){
			sId = String.valueOf(rs.get("id"));//id
			shipper = String.valueOf(rs.get("shipper"));//承运方
			mobileno = String.valueOf(rs.get("mobile_phone"));//司机手机号
			settlementNo = String.valueOf(rs.get("settlement_id"));//司机手机号
			loginName = String.valueOf(params.get("loginUser"));
			loginPassword = String.valueOf(params.get("loginPassword"));//.toUpperCase();
			lgspf=String.valueOf(rs.get("accountingEntityName"));//路歌受票方（核算主体）
			rootWaybillInfoId = String.valueOf(rs.get("root_waybill_info_id"));
			
			
			aSettlementinfo.setLogin_name(String.valueOf(params.get("loginUser")));
			aSettlementinfo.setPwd(lg_pwd.toUpperCase());
			aSettlementinfo.setWaybill_no(String.valueOf(rs.get("settlement_id"))); //结算单编号
			aSettlementinfo.setAuthorize_flag("1");//定位标记,1--不定位
			aSettlementinfo.setOrder_create_type("19");//运单来源,19-天顺物流
			//aSettlementinfo.setMobile_no(String.valueOf(rs.get("mobile_phone"))); //司机手机号
			aSettlementinfo.setMobile_no("18525309032"); //司机手机号
			aSettlementinfo.setDriver_name(String.valueOf(rs.get("driver_name"))); //司机姓名
			aSettlementinfo.setCart_badge_no(String.valueOf(rs.get("car_code")));//车牌号
			
			/**地点处理**/
			String startPoint = String.valueOf(rs.get("start_points")); //起点
			String endPoint = String.valueOf(rs.get("end_points"));//终点
			String []startLocation = startPoint.split("/");
			String startProvince = startLocation[0]; //发货单位省
			
			String simpleStartProvince = paymentAgentFacade.getProvinceSimple(startProvince);//将“省”字段翻译为接口规范的标准
					
			String startCity = startLocation[1];//发货单位市
			
			if("自治区直辖县级行政区划" .equals(startCity) ){
				startCity = startLocation[2];
			}
			startCity="阿克苏";
			String startCounty = startLocation[2];//发货单位县
			
			String []endLocation = endPoint.split("/");
			String endProvince = endLocation[0];//到货单位省
			String simpleEndProvince = paymentAgentFacade.getProvinceSimple(endProvince);//将“省”字段翻译为接口规范的标准
			
			String endCity = endLocation[1]; //到货单位市
			if("自治区直辖县级行政区划".equals(endCity)){
				endCity = endLocation[2];
			}
			String endCounty = endLocation[2];//到货单位县
			
			
			
			
/*			waybill.setStart_province_name(rs.getString("start_province"));
			waybill.setStart_city_name(rs.getString("start_city"));
			waybill.setStart_county_name(rs.getString("start_county"));
			
			waybill.setEnd_province_name(rs.getString("end_province"));
			waybill.setEnd_city_name(rs.getString("end_city"));
			waybill.setEnd_county_name(rs.getString("end_county"));*/
			
			aSettlementinfo.setStart_province_name(simpleEndProvince);
			aSettlementinfo.setStart_city_name(startCity);
			aSettlementinfo.setStart_county_name(startCounty);
			aSettlementinfo.setEnd_province_name(simpleEndProvince);
			aSettlementinfo.setEnd_city_name(endCity);
			aSettlementinfo.setEnd_county_name(endCounty);
			aSettlementinfo.setGoods_name(String.valueOf(rs.get("goods_name")));//货物名称
			aSettlementinfo.setGoods_amount_type("0");//0-吨  1-方  2-件
			aSettlementinfo.setGoods_amount(String.valueOf(rs.get("goods_tonnage"))); //货物数量
			
			DecimalFormat df = new DecimalFormat("0.00");//格式化
			Double dPay  =Double.parseDouble(String.valueOf(rs.get("payable_price")));
			String StrPay = df.format(dPay);
			aSettlementinfo.setUnit_price(StrPay);//司机运价
			
			
			Double dFreight  =Double.parseDouble(String.valueOf(rs.get("freight")));
			String strFreight = df.format(dFreight);
			System.out.println("strFreight:"+strFreight);
			aSettlementinfo.setAll_freight(strFreight);//运费
			
			aSettlementinfo.setPrepayments("0.0");
			aSettlementinfo.setBack_fee("0.0");
			aSettlementinfo.setLoss_fee("0.0");
			aSettlementinfo.setFreightIncr("0.0");
			//waybill.setDrawee("新疆天顺供应链股份有限公司");
			//waybill.setNote("测试");
			aSettlementinfo.setStart_time(String.valueOf(rs.get("forwarding_time")));//发货日期
			aSettlementinfo.setSendOrgName(String.valueOf(rs.get("forwarding_unit")));//起点（发货单位）
			aSettlementinfo.setRecvOrgName(String.valueOf(rs.get("consignee")));//终点(到货单位)
			//aSettlementinfo.setDrawee(lgspf);//获取受票方（核算主体）
			
			
			//根据合同明细获取受票方
			
			aSettlementinfo.setDrawee("12121");//获取受票方（核算主体）
		}
		
		//校验数据
		//检查是否已经上传路歌，方法：查看承运人字段是否为空
		if (rs.get("shipper")!=null){
			return "{\"result\":\"error\",\"msg\":\"此结算单已经上传安徽金网运通系统，不能重复上传！\"}";
		}
		
		//检查手机号码
		if (mobileno==null){
			return "{result:'error',msg:'结算单未录入司机手机信息,数据上传失败！'}";
		}else if (mobileno.length()<2){
			return "{result:'error',msg:'结算单未录入司机手机信息,数据上传失败！'}";
		}
		
		
		int piccount=0;
		//检查、获取图片
		if (settlementNo!=null){
			List<String> unloadingImgList = new ArrayList<String>();				
		//获取图片信息
			
			List<DriverWaybillImgDetailInfo> driverList = settlementInfoFacade.selectEnclosureByWaybillInfoId(Integer.valueOf(rootWaybillInfoId));
			 for (DriverWaybillImgDetailInfo driverWaybillImgDetailInfo : driverList) {
				 unloadingImgList.add(driverWaybillImgDetailInfo.getUnloadingImg());
			}
			 
					
			//String fastdfsServer = SysConstances.CONN_MAP.get("FASTDFS_SERVER");
			//System.out.println(fastdfsServer);
			
			
			if (unloadingImgList.size() ==0){  //磅单图片不存在时
				return "{\"result\":\"error\",\"msg\":\"结算单未拍摄磅单,数据上传失败！\"}";
			}
			
			imgPath = unloadingImgList.get(0); //图片路径
			String groupName = imgPath.substring(0, imgPath.indexOf("/"));
			String fImgPath = imgPath.substring(imgPath.indexOf("/")+1);
			
			imgbyte=FastdfsClientUtil.getInstance().readimg(groupName,fImgPath); //将图片转换成二进制数据
			aSettlementinfo.setThpicType("jpg");  //设置图片格式
			aSettlementinfo.setThpic(imgbyte);   //封装图片内容
		}else{ 
			return "{\"result\":\"error\",\"msg\":\"结算单编号缺失,数据上传失败！\"}";
		}
		
		System.out.println("export....");
		
			
		//检查手机号是否注册
				lgData.setModule("wbs");
				lgData.setMethod("Tsmc");
				
				JSONObject mobilejson = new JSONObject();
				mobilejson.put("loginName", loginName);
				mobilejson.put("pwd", lg_pwd.toUpperCase());
				mobilejson.put("mobileNo", "18525309032");  //司机手机号
				//System.out.println(mobilejson.toString());
				sJson = mobilejson.toString();		
				
				lgData.setData(sJson);
				
				sign = DigestUtils.md5Hex((sJson+System.getProperty("TAX_HR_SAP_KEY")).getBytes("utf-8")    );
				lgData.setSign(sign);
				
				sendJson= JsonUtil.Obj2Json(lgData);
				System.out.println(sendJson);
				
				urlsign = DigestUtils.md5Hex((System.getProperty("TAX_HR_SAP_ENT_KEY")+datetime).getBytes("utf-8")    );
				sendJson = URLEncoder.encode(sendJson, "utf-8");
				sendJson = URLEncoder.encode(sendJson, "utf-8");
				
				//手机号验证
				HttpClientUtil.init();
				retJson = HttpClientUtil.postForJson(url+"&sign="+urlsign,sendJson);
				retJson = URLDecoder.decode(retJson, "utf-8");
				retJson = URLDecoder.decode(retJson, "utf-8");
				System.out.println(retJson);
				HttpClientUtil.close();
				map = JsonUtil.parseJSON2Map(retJson);
				
				//检查结果
				result_code = (String)map.get("reCode");
				result_info = (String)map.get("reInfo");
				stat = null;
				if ("0".equals(result_code)){
					stat = (String)map.get("stat");
					if ("1".equals(stat)){
						return "{\"result\":\"error\",\"msg\":\""+result_info+",数据上传失败！\"}";
					}
				}else{
					return "{\"result\":\"error\",\"msg\":\""+result_info+",数据上传失败！\"}";
				}
	
				
			//验证通过发送数据
				stat="0";
				//手机验证通过，发送运单
				if ("0".equals(stat)){
					//检查手机号是否注册
					lgData.setModule("wbs");
					lgData.setMethod("Tsxz");
					
					sJson = JsonUtil.Obj2Json(aSettlementinfo);
					System.out.println(sJson);
					lgData.setData(sJson);
					sign = DigestUtils.md5Hex((sJson+System.getProperty("TAX_HR_SAP_KEY")).getBytes("utf-8")    );
					lgData.setSign(sign);
					
					sendJson = JsonUtil.Obj2Json(lgData);
					System.out.println("send to LG  <--- "+aSettlementinfo.getWaybill_no());
					urlsign = DigestUtils.md5Hex((System.getProperty("TAX_HR_SAP_ENT_KEY")+datetime).getBytes("utf-8")    );
					
					sendJson = URLEncoder.encode(sendJson, "utf-8");
					sendJson = URLEncoder.encode(sendJson, "utf-8");
					HttpClientUtil.init();
					retJson = HttpClientUtil.postForJson(url+"&sign="+urlsign,sendJson);
					retJson = URLDecoder.decode(retJson, "utf-8");
					retJson = URLDecoder.decode(retJson, "utf-8");
					System.out.println(retJson);
					
					HttpClientUtil.close();
					map = JsonUtil.parseJSON2Map(retJson);
					//检查结果
					result_code = (String)map.get("reCode");
					result_info = (String)map.get("reInfo");
					
					if ("0".equals(result_code)){
						shipper = (String)map.get("xid"); //承运人
						System.out.println("承运人:"+shipper);
						
						
						Map<String, Object> queryMap = new HashMap<String, Object>();
						
						queryMap.put("shipper", shipper);
						queryMap.put("sId", sId);
						//更新该结算单承运人字段
						Integer n = paymentAgentFacade.updateShipper(queryMap);
						
						
						sret="{\"result\":\"succ\",\"msg\":\"数据上传成功！安徽金网运通系统对应运单ID："+shipper+"\"}";
					}else{
						sret= "{\"result\":\"error\",\"msg\":\""+result_info+",数据上传失败！\"}";
					}
				}
				
				
		return sret;
	}

}
