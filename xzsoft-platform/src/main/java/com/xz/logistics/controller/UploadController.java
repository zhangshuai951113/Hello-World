package com.xz.logistics.controller;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;

import com.xz.common.utils.fastdfs.FastdfsClientUtil;


/**
 * 上传文件
 * @author chengzhihuan 2017年5月16日
 *
 */
@Controller
@RequestMapping("/upload")
public class UploadController extends BaseController {

    /**
     * 上传图片
     * @author chengzhihuan 2017年5月16日
     * @param myfile spring格式文件
     * @param request 
     * @param response
     * @return
     * @throws IOException
     */
    @RequestMapping(value = "/imageUpload")
    public String imageUpload(MultipartFile myfile, HttpServletRequest request, HttpServletResponse response) throws IOException {
		response.setContentType("text/html; charset=UTF-8");
		PrintWriter out = response.getWriter();
		String uploadUrl = "";
		try {
		    // 上传文件返回URL
			uploadUrl = FastdfsClientUtil.getInstance().upload(myfile);
		} catch (Exception e) {
			e.printStackTrace();
		    out.print("{\"isSuccess\":\"false\",\"errorMsg\":\"" + e.getMessage() + "\"}");
		    return null;
		}
	
		out.print("{\"isSuccess\":\"true\",\"uploadUrl\":\"" + uploadUrl + "\"}");
		out.flush();
		return null;
    }
}

