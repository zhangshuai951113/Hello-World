package com.xz.logistics.controller;

import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.xz.facade.api.CodeManagerFacade;
import com.xz.facade.api.CodeSubjectFacade;
import com.xz.model.po.CarTypePo;
import com.xz.model.po.CodeManager;
import com.xz.model.po.CodeSubject;

@Controller
@RequestMapping("/codeManager")
public class CodeManagerController {
	@Resource
	private CodeManagerFacade codeManagerFacade;
	
	@Resource
	private CodeSubjectFacade codeSubjectFacade;
	
	@RequestMapping(value = "/main")
	public String main(HttpServletRequest request, Model model){
		return "template/codeManager/codeManager";
	}
	
	@RequestMapping(value = "/subjectList")
	@ResponseBody
	public List<CodeSubject> subjectList(HttpServletRequest request, Model model,CodeSubject codeSubject){
		   List<CodeSubject> list=codeSubjectFacade.selectByPrimaryKey(codeSubject);
		return list;
	}
	
	@RequestMapping(value = "/searchManagerCount")
	@ResponseBody
	public int searchManagerCount(HttpServletRequest request, Model model,CodeManager codeManager){
		   int i=codeManagerFacade.searchManagerCount(codeManager);
		return i;
	}

	@RequestMapping(value = "/searchManagerList")
	@ResponseBody
	public List<CodeManager> searchManagerList(HttpServletRequest request, Model model,CodeManager codeManager){
			codeManager.setStart((codeManager.getPage() - 1) * codeManager.getRows());
			codeManager.setRows(codeManager.getRows());
		   List<CodeManager> list=codeManagerFacade.selectByPrimaryKey(codeManager);
		return list;
	}
	
	@RequestMapping(value = "/addManager")
	@ResponseBody
	public int addManager(HttpServletRequest request, Model model,CodeManager codeManager){
		   codeManagerFacade.insert(codeManager);
		return 1;
	}
	
	@RequestMapping(value = "/deleteManager")
	@ResponseBody
	public int deleteManager(HttpServletRequest request, Model model,String str){
		String[] arr=str.split(",");
		for(int i=0;i<arr.length;i++){
			 codeManagerFacade.deleteByPrimaryKey(Integer.parseInt(arr[i])).intValue();
		}
		  
		return 0;
	}
	
	@RequestMapping(value = "/updateManager")
	@ResponseBody
	public int updateManager(HttpServletRequest request, Model model,CodeManager  codeManager){
		int i= codeManagerFacade.updateByPrimaryKeySelective(codeManager).intValue();
		return i;
	}
	
	@RequestMapping(value = "/saveManager")
	@ResponseBody
	public int saveManager(HttpServletRequest request, Model model,CodeManager  codeManager){
		int i= codeManagerFacade.insert(codeManager).intValue();
		return i;
	}
	
}
