package com.xz.logistics.utils;

import java.util.Properties;
import com.tswl.cuteinfo.util.PropertiesUtils;
import com.wondersgroup.cuteinfo.client.exchangeserver.usersecurty.UserToken;
import com.wondersgroup.cuteinfo.client.util.UserTokenUtils;

public class TsContext {
	
	//用户口令
	private UserToken userToken;
	
	//数据交换url
	private String targetUrl;
	
	//属性文件
	private Properties properties;
	
	public TsContext(String config)throws Exception{
		
		//File file=new File(config);
		if(config==null ||!config.endsWith(".properties")){
			config="client_demo.properties";
		}
		 properties = PropertiesUtils.PROPERTIES.getProperties(config);
			System.setProperty("javax.net.ssl.keyStorePassword", "changeit");
			String truststoreFile = System.getenv("JAVA_HOME") + "/jre/lib/security/" + "cuteinfo_client.trustStore";
			System.setProperty("javax.net.ssl.trustStore",truststoreFile);			
	}
	/**
	 * 获取用户令牌
	 * @param configFile 属性配置文件
	 * @return
	 */

   public UserToken getUerToken()throws Exception{
	   


		String userName=properties.getProperty("userName");
		String password=properties.getProperty("password");
		String resourceId=properties.getProperty("resourceId");
		String authURL=properties.getProperty("authURL");
        userToken = UserTokenUtils.getTicket(userName, password, resourceId,authURL);
		System.out.println("tokenid:"+userToken.getTokenID());
		if(userToken==null){
			throw new Exception("获取用户令牌失败！！");
		}
		return userToken;
   }
   
   /**
    * 获取配置文件的属性值
    * @param key
    * @return
    * @throws Exception
    */
   public String getProperty(String key) throws Exception{
	   String val=properties.getProperty(key);
	   if(val==null || "".equals(val.trim())){
		   throw new Exception("属性"+key+"配置不存在!!");
	   }
	   return val;
   }
    
}
