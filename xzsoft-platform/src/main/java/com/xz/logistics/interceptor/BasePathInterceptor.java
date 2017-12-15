package com.xz.logistics.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.xz.logistics.constances.SysConstances;


/**
 * 路径拦截器
 * @author chengzhihuan 2017年4月14日
 *
 */
@Component
public class BasePathInterceptor extends HandlerInterceptorAdapter {

    /** 
     * 处理相对路径变绝对路径
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		String scheme = request.getScheme();
		String serverName = request.getServerName();
		int port = request.getServerPort();
		String path = request.getContextPath();
		String basePath = scheme + "://" + serverName + ":" + port + path;
		//绝对路径
		request.setAttribute("basePath", basePath);
		//文件服务器路径前缀
		request.setAttribute("fastdfsServer", SysConstances.CONN_MAP.get("FASTDFS_SERVER"));
		return true;
    }
}
