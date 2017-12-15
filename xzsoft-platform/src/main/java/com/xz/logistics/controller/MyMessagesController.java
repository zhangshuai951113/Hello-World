package com.xz.logistics.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.xz.facade.api.MyMessagesFacade;
import com.xz.model.po.MyMessages;
import com.xz.model.po.UserInfo;

/**
 * @title MyMessagesController
 * @Description 我的消息控制层
 * @author zhangbo
 * @date 2017/08/01 11:50
 * */
@Controller
@RequestMapping("/messages")
public class MyMessagesController extends BaseController {
	
	@Resource
	private MyMessagesFacade myMessagesFacade;
	
	
	/**
	 * @title showSumCount
	 * @description 查询待处理消息数
	 * @author zhangbo
	 * @date 2017/08/07 12:48
	 * */
	@RequestMapping("showCount")
	@ResponseBody
	public int showSumCount(HttpServletRequest request){
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		MyMessages myMessages = new MyMessages();
        Integer userInfoId = userInfo.getId();
        Integer orgRootId = userInfo.getOrgRootId();
        Integer userRole = userInfo.getUserRole();
        if(userRole == 1 || userRole == 2){//企业货主或物流公司
        	myMessages.setReceivePerson(orgRootId);
        }
        if(userRole == 3 || userRole == 4){//个体货主或司机
        	myMessages.setReceivePerson(userInfoId);
        }
        int totalCount = myMessagesFacade.selectAllMessageTotal(myMessages);
        return totalCount;
	}
	/**
	 * @Title goMyMessages
	 * @description 跳转到我的消息页面
	 * @author zhangbo
	 * @date 2017/08/02 18:15
	 * */
	// -- /messages/goMyMessages
	@RequestMapping("/goMyMessages")
	public String goMyMessages(){
		return "template/myMessage/myNews";
	}
	@RequestMapping("/selecMesagesInfo")
	@ResponseBody
	public Map<String,Object> selectMessagesInfo(String curPage,String pageSizeStr,HttpServletRequest request){
		UserInfo userInfo = (UserInfo) request.getSession().getAttribute("userInfo");
		MyMessages myMessages = new MyMessages();
        Integer userInfoId = userInfo.getId();
        Integer orgRootId = userInfo.getOrgRootId();
        Integer userRole = userInfo.getUserRole();
        if(userRole == 1 || userRole == 2){//企业货主或物流公司
        	myMessages.setReceivePerson(orgRootId);
        }
        if(userRole == 3 || userRole == 4){//个体货主或司机
        	myMessages.setReceivePerson(userInfoId);
        }
		int curPostion = 0;
		int pageSize = 0;
		pageSize = Integer.valueOf(pageSizeStr);
		if (curPage != null && curPage != "") {
			curPostion = Integer.valueOf(curPage);
			curPostion = (curPostion - 1) * pageSize;
		}
		myMessages.setCurPostion(curPostion);
		myMessages.setPageSize(pageSize);
		List<MyMessages> tList = new ArrayList<MyMessages>();
		 Map<String,Object> mmap = new HashMap<String,Object>();
		tList = myMessagesFacade.selectAllMessage(myMessages);
		int totalCount = myMessagesFacade.selectAllMessageTotal(myMessages);
		mmap.put("tList", tList);
		mmap.put("totalCount", totalCount);
		return mmap;
	}

}
