package com.xz.logistics.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 平台内首页
 * @author chengzhihuan 2017年5月18日
 *
 */
@Controller
public class IndexController extends BaseController {
	
	/**
     * 登录后跳转到平台内首页
     * @author chengzhihuan 2017年5月18日
     * @param request
     * @param model
     * @return
     */
    @RequestMapping("/index")
    public String index(HttpServletRequest request, Model model) {
    	return "index";
    }

}
