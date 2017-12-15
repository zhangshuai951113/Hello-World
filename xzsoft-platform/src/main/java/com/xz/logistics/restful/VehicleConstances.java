package com.xz.logistics.restful;

public class VehicleConstances {
	// ========RESTFUL风格http地址开始========//
	// 生产环境--https方式
	public static final String productTestHttps = "https://ssl.logink.org/";
	public static final String vehicleCreditHttps = "http://credit.logink.org/gateway/restfulQry!qry.htm";
	// ========RESTFUL风格http地址结束========//

	// ========申请令牌参数开始========//
	// 申请令牌URL
	public static String urlApplyToken = productTestHttps + "authapi/rest/auth/apply";
	// 申请令牌使用的资源ID
	public static final String srv = "120380A218FC003EE053C0A87F0C003E";
	// 申请令牌的物流交换代码
	public static final String uid = "13941";
	// 申请令牌的物流交换代码对应的密码
	public static final String pwd = "xjts3792607";
	// ========申请令牌参数结束========//

	// ========校验令牌参数开始========//
	// 校验令牌URL
	public static final String urlVerifyToken = productTestHttps
			+ "authapi/rest/auth/verify";
	// 应用令牌--申请令牌后，将此值替换
	public static String appToken = null;
	// 用户令牌--申请令牌后，将此值替换
	public static String userToken = null;
	// 校验令牌使用资源ID与申请令牌时使用资源ID一致
	// ========校验令牌参数结束========//

}
