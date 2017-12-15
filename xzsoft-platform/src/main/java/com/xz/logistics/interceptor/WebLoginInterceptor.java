package com.xz.logistics.interceptor;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.xz.logistics.constances.SysConstances;
import com.xz.model.po.UserInfo;

import net.sf.json.JSONObject;

/**
 * 登录拦截器
 * @author chengzhihuan 2017年4月14日
 *
 */
@Component
public class WebLoginInterceptor extends HandlerInterceptorAdapter {

    /**
     * 拦截器处理 
     * @author chengzhihuan
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		// 直接验证通过URL
		String url = request.getServletPath();
		if (isPassUrl(url)) {
		    return true;
		}
		
		// 取出用户session
		UserInfo userInfo  = (UserInfo) request.getSession().getAttribute("userInfo");
		if(userInfo !=null){
			request.setAttribute("_scope_userName", userInfo.getUserName());
			return true;
		}
		
		String requestObj = request.getHeader("x-requested-with");
		if (requestObj != null && (requestObj.equalsIgnoreCase("XMLHttpRequest") || requestObj.equalsIgnoreCase("XMLHttpRequest2"))) {
		    this.ajaxRequestErrorResp(response, request);
		} else {
			response.sendRedirect(request.getContextPath() + "/userInfo/login?returnUrl=" + URLEncoder.encode(this.getReturnUrl(request), "GBK"));
		}
	
		return false;

    }

    private String getReturnUrl(HttpServletRequest request) {
		String currentUrl = request.getScheme() + "://" + request.getHeader("host") + request.getContextPath() + request.getServletPath() + (null != request.getQueryString() ? "?" + request.getQueryString() : "");
		return currentUrl;
    }

    /**
     * 是否URL直接通过
     * @author chengzhihuan 2017年4月14日
     * @param url
     * @return
     */
    private boolean isPassUrl(String url) {
		if (url != null && url.startsWith("/")) {
		    url = url.substring(1);
		}
		if (url == null || "".equals(url)) {
		    return false;
		}
		boolean isMtch = false;
		for (Map.Entry<String, String> entry : SysConstances.URL_PASS_MAP.entrySet()) {
		    String furl = entry.getKey();
		    String pass = entry.getValue();
		    if (furl != null && furl.startsWith("/")) {
		    	furl = furl.substring(1);
		    }
		    if (furl.equals(url) && pass.equals("pass")) {
		    	return true;
		    } else if (furl.equals(url) && pass.equals("auth")) {
		    	return false;
		    }
		    if (furl.contains("/**") && pass.equals("pass")) {
				furl = furl.replace("/**", "");
				if (url.startsWith(furl)) {
				    isMtch = true;
				}
		    }
		}
		return isMtch;
    }

    /**
     * 发送错误信息
     * @author chengzhihuan 2017年4月14日
     * @param response
     * @param request
     * @throws IOException
     */
    private void ajaxRequestErrorResp(HttpServletResponse response, HttpServletRequest request) throws IOException {
		response.setContentType("application/json; charset=UTF-8");
		JSONObject jo = new JSONObject();
		jo.put("success", false);
		jo.put("msg", "没有登录");
		PrintWriter pw = response.getWriter();
		pw.write(jo.toString());
		pw.flush();

    }
}
