package com.xz.logistics.restful;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;

import com.alibaba.druid.support.json.JSONUtils;
import com.alibaba.fastjson.JSONObject;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.tsh.base.util.Util;
import com.xz.common.utils.date.DateUtils;
import com.xz.logistics.utils.JsonUtil;

public class TsClient {

	
	String param1 = "?userid=" + VehicleConstances.uid + "&password=" + VehicleConstances.pwd + "&resource="
			+ VehicleConstances.srv;
	
	
			
			
	public JSONObject checkVehicleInfo(String carCode) throws IOException {
		JSONObject jo = new JSONObject();
		
		String retinfoStr = "";
		String urlToken = VehicleConstances.urlApplyToken + param1;// 令牌申请
		try {
			getTokenHttp(urlToken); // 生成token
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		/** 车辆信息校验 **/
		String res = this.CheckPersonVehicleEnterpriseInformation(carCode); // 车辆入网验证

		if ("1".equals(res)) {// 如果入网，车辆诚信信息查询
			retinfoStr = this.QueryVehicleCredit(carCode);  //接口返回的车辆信息 json字符串
			jo = jo.parseObject(retinfoStr);
			if(null!=jo ){  
				String PeriodEndDate  = jo.getString("PeriodEndDate");//营运证到期日期
				String nowTime = DateUtils.nowYmdDate();
				
				int i = DateUtils.compareDate( //日期比较
						DateUtils.formatTime(PeriodEndDate),
						DateUtils.formatTime(nowTime));	
				
				if(i<=0){ //如果营运证过期
					jo.put("success", false);
					jo.put("msg", "该车辆营运证过期");
					return jo;
				}
					//营运证信息封装
					jo.put("success", true);
			}
			else{
				jo.put("success", false);
				jo.put("msg", "没有查询到该车辆信息");
				return jo;
			}
			
		} else if ("0".equals(res)) {
			jo.put("success", false);
			jo.put("msg", "该车辆没有入网");
		} else {
			jo.put("success", false);
			jo.put("msg", "车辆异常");
		}

		return jo;
	}

	/**
	 * @param url
	 *            申请或校验令牌时，输入的完整URL
	 * @throws IOException
	 */
	public static void getTokenHttp(String url) throws IOException {
		if (url.contains("apply")) {
			System.out.println("=============申请令牌 url=" + url);
		} else {
			System.out.println("=============校验令牌 url=" + url);
		}
		OkHttpClient client = new OkHttpClient();
		Request request = new Request.Builder().url(url).build();
		Response response = client.newCall(request).execute();
		if (response.isSuccessful()) {
			ResponseBody body = response.body();
			String string = body.string();
			JsonObject json = JsonUtil.unParse(string);
			if (url.contains("apply")) {
				VehicleConstances.appToken = isNotNull(json.get("token")) ? json.get("token")
						.getAsString() : null;
						VehicleConstances.userToken = isNotNull(json.get("token")) ? json.get("token")
						.getAsString() : null;
			}
			print(json);
		} else {
			System.err.println("请求失败");
			throw new IOException("Unexpected code " + response);
		}
	}

	// 校验参数是否非空
	private static boolean isNotNull(JsonElement ele) {
		return ele != null && !ele.isJsonNull();
	}

	/**
	 * 结果输出 输出参数说明： resultCode : 返回结果代码 token : 申请的令牌或校验时使用的令牌 userid : 物流交换代码
	 * resource : 资源id tokenValied : 令牌是否有效，true有效，false无效
	 */
	private static void print(JsonObject json) {
		System.out.println("resultCode="
				+ (isNotNull(json.get("resultCode")) ? json.get("resultCode")
						.getAsInt() : null));
		System.out.println("token="
				+ (isNotNull(json.get("token")) ? json.get("token")
						.getAsString() : null));
		System.out.println("userid="
				+ (isNotNull(json.get("userid")) ? json.get("userid")
						.getAsString() : null));
		System.out.println("resource="
				+ (isNotNull(json.get("resource")) ? json.get("resource")
						.getAsString() : null));
		System.out.println("tokenValied="
				+ (isNotNull(json.get("tokenValied")) ? json.get("tokenValied")
						.getAsBoolean() : null));
	}

	/**
	 * 车辆入网信息校验
	 * 
	 * @return
	 * @throws IOException
	 */
	public String CheckPersonVehicleEnterpriseInformation(String carcode)
			throws IOException {
		// 车辆校验
		Map userMap = new HashMap<>();
		userMap.put("token", VehicleConstances.userToken);
		userMap.put("userid", VehicleConstances.uid);
		Map vehicleInfo = new HashMap<>();
		vehicleInfo.put("VehicleNumber", carcode);// 车牌号
		vehicleInfo.put("SearchTypeCode", "21");// 查询方式 21，入网校验
		String rec = JsonUtil.parse(userMap);
		System.out.println("rec:" + rec);
		String bizContent = JsonUtil.parse(vehicleInfo);
		System.out.println("bizContent:" + bizContent);
		String param1 = "?method=CheckPersonVehicleEnterpriseInformation&result_format=1&sec="
				+ rec + "&charset=utf-8&biz_version=&biz_content=" + bizContent;
		String url = VehicleConstances.vehicleCreditHttps + param1;
		JsonObject json = this.RestByOkHttp(url);
				 //是否入网 返回0 表示未入网,1入网
		String bizStr = json.get("biz_result").getAsString();
		JsonObject bodyObject = JsonUtil.unParse(bizStr);
		JsonObject RoadObject = bodyObject.getAsJsonObject("vehicleInformationResult"); // 道路运输认证信息对象
		String resultCode = RoadObject.get("resultCode").getAsString();
		return resultCode;

	}

	private JsonObject RestByOkHttp(String url) throws IOException {
		System.out.println("url:" + url);
		JsonObject json = null;
		OkHttpClient client = new OkHttpClient();
		Request request = new Request.Builder().url(url).build();
		Response response = client.newCall(request).execute();

		if (response.isSuccessful()) {
			ResponseBody body = response.body();
			String string = body.string();
			json = JsonUtil.unParse(string);
		} else {
			System.err.println("请求失败");
			throw new IOException("Unexpected code " + response);
		}
		return json;
	}

	/**
	 * 车辆诚信信息查询
	 * 
	 * @param vehicleNo
	 * @return
	 * @throws IOException
	 */
	public String QueryVehicleCredit(String carCode) throws IOException {

		String retinfo = "{\"result\":\"error\",\"msg\":\"该车辆异常\"}";
		Map userMap = new HashMap<>();
		userMap.put("token", VehicleConstances.userToken);
		userMap.put("userid", VehicleConstances.uid);
		String rec = JsonUtil.parse(userMap);
		Map vehicleInfo = new HashMap<>();
		vehicleInfo.put("VehicleNumber", carCode);// 车牌号
		vehicleInfo.put("RoadTransportCertificateNumber", "");
		vehicleInfo.put("LicensePlateTypeCode", "黄色");
		vehicleInfo.put("SearchTypeCode", "02");
		String bizContent = JsonUtil.parse(vehicleInfo);
		String param1 = "?method=QueryVehicleCredit&result_format=1&sec=" + rec
				+ "&charset=utf-8&biz_version=&biz_content=" + bizContent;
		String url = VehicleConstances.vehicleCreditHttps + param1;
		JsonObject respJson = this.RestByOkHttp(url);
		String bizStr = respJson.get("biz_result").getAsString();
		JsonObject bodyObject = JsonUtil.unParse(bizStr);
		JsonObject RoadObject = bodyObject.getAsJsonObject("Body") // 道路运输认证信息对象
				.getAsJsonObject("RoadTransportCertificateInformation");
		String jsonStr = RoadObject.toString();
		
	
		//如果营运证期限结束日期小于当天提示该营运证过期
		return jsonStr;

	}

}
