package com.xz.logistics.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import com.xz.common.utils.properties.PropertiesUtils;
import com.xz.logistics.constances.SysConstances;


public class LogisticsListener implements ServletContextListener {

	/**
     * 初始化时
     */
	@Override
	public void contextInitialized(ServletContextEvent sce) {
		// 缓存conn.properties
		SysConstances.CONN_MAP = PropertiesUtils.getInstance().cacheProperties("conn.properties");
		// 缓存url_pass.properties
		SysConstances.URL_PASS_MAP = PropertiesUtils.getInstance().cacheProperties("url_pass.properties");
	}

	/**
     * 销毁时
     */
	@Override
	public void contextDestroyed(ServletContextEvent sce) {
		
	}

}
