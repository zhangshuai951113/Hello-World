package com.xz.logistics.controller;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 基础controller
 * @author chengzhihuan 2017年5月15日
 *
 */
@SuppressWarnings("rawtypes")
public class BaseController {
    private final Logger log = LoggerFactory.getLogger(getClass());

    /**
     * 入参转Map
     * @author chengzhihuan 2016年9月16日
     * @param request
     * @return
     */
    protected Map<String, Object> paramsToMap(HttpServletRequest request) {
		Map<String, Object> param = new HashMap<String, Object>();
		Enumeration e = request.getParameterNames();
		while (e.hasMoreElements()) {
		    String name = (String) e.nextElement();
		    if (null != request.getParameter(name) && !"".equals(request.getParameter(name).trim())) {
				try {
				    param.put(StringUtils.trim(name), java.net.URLDecoder.decode(request.getParameter(name).toString(), "UTF-8").trim());
				} catch (Exception er) {
				    log.error(er.getMessage(), er);
				}
		    }
		}
		return param;
    }

}
