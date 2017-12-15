package com.xz.logistics.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;

import com.alibaba.dubbo.common.utils.StringUtils;
import net.sf.json.JSONObject;
import com.xz.logistics.constances.SysFinal;
/**
 * @Title GetLatitude
 * @Description 根据客户端Ip获取所在地址及所在地经纬度
 * @author zhangbo
 * @date 2017/08/15
 * */
public class BaiduMapUtils {
	/**
	 * @Title getCurrentUserLocation
	 * @description 调用百度地图普通IP定位技术定位当前登录用户所在地详细信息
	 * @author zhangbo
	 * @return 返回地址省市区县编号，经纬度，状态码等信息
	 * @date 2017/08/23
	 */
	public static JSONObject getCurrentUserLocation() {
		JSONObject jsonObject = null;
		StringBuffer buffer = new StringBuffer();
		try {

			URL url = new URL(SysFinal.MAP_URL);
			// http协议传输
			HttpURLConnection httpUrlConn = (HttpURLConnection) url.openConnection();

			httpUrlConn.setDoOutput(true);
			httpUrlConn.setDoInput(true);
			httpUrlConn.setUseCaches(false);
			// 将返回的输入流转换成字符串
			InputStream inputStream = httpUrlConn.getInputStream();
			InputStreamReader inputStreamReader = new InputStreamReader(inputStream, "utf-8");
			BufferedReader bufferedReader = new BufferedReader(inputStreamReader);

			String str = null;
			while ((str = bufferedReader.readLine()) != null) {
				buffer.append(str);
			}
			bufferedReader.close();
			inputStreamReader.close();
			// 释放资源
			inputStream.close();
			inputStream = null;
			httpUrlConn.disconnect();
			jsonObject = JSONObject.fromObject(buffer.toString());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return jsonObject;
	}
	
	public static void main(String[] args) {
		getCurrentUserLocation();
	}
}



