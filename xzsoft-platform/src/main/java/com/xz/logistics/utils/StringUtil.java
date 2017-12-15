package com.xz.logistics.utils;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;

public class StringUtil {
	
	public static boolean isEmpty(String str){
		if(str==null ||str.isEmpty()||"".equals(str))
			return true;
		else
			return false;
		
	}
	
	//生成15位 日期时间+A-Z的一个字符编码	
	public static String duid(){
		Random rand=new Random();
		int i=rand.nextInt(26)+65;
		String tar=StringUtil.dateFormatYms(nowString())+""+(char)i;
		return tar;
	}
	
	// 当前时间的字符串
	public static String nowString() {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date date = new Date();
		String dst = format.format(date);
		return dst;
	}
	
	// 字符串到List
	public static List string2List(String str, String sign) {
		List<String> list = new ArrayList<String>();
		if (str == null) {
			return null;
		}
		int endIndex = str.lastIndexOf(sign);
		if (endIndex == str.length() - 1) {
			str = str.substring(0, endIndex);

		}
		int index = str.indexOf(sign);
		if (index == 0) {
			str = str.substring(1);
		}

		String arr[] = str.split(sign);
		for(int i=0;i<arr.length;i++){
			list.add(arr[i]);
		}
		return list;
	}
	
	  //将yyyy-mm-dd hh:mi:ss格式字符串转变为yyyymmddhhmiss格式
	  public static String dateFormatYms(String src){
	     
		 char []s=src.toCharArray();
		 char[]r=new char[s.length]; 
		 int j=0;
		  for(int i=0;i<s.length;i++){
			 
			  if(s[i]!='-' &&s[i]!=' ' &&s[i]!=':'){
				  r[j]=s[i];
				  j++;
			  }
		  }
		  
		  String result=new String(r,0,j);
	  //    System.out.println(result.length()+" "+r.length);
		  return result;
	  }
	  
	  
	  
		// 从request对象中取得参数、值，以map形式返回
		public static Map requestParameter(HttpServletRequest request) {
			Map<String, Object> map = new HashMap<String, Object>();
			Enumeration paramNames = request.getParameterNames();
			while (paramNames.hasMoreElements()) {
				String paramName = (String) paramNames.nextElement();

				String[] paramValues = request.getParameterValues(paramName);
				
	        try{
				if (paramValues.length == 1) {
					String paramValue = paramValues[0];

					if (paramValue.length() != 0) {
						map.put(paramName, paramValue);
					}
				} else if (paramValues.length > 1) {
					map.put(paramName, paramValues);
				}
	        }catch(Exception e){
	        	System.out.println("输入参数转换编码出现异常。");
	        }
			}
			return map;

		}
		
		   //将字符串转变为double型。非数值转换为0
		   public static double toDouble(String str){
				  
			   if(str==null||"".equals(str.trim())){
				   return new Double(0);
			   }
//			   boolean rt=str.matches("[0-9]+");
//			   if(!rt) return new Double(0);
			   
			   try{
				   double re=Double.parseDouble(str);
//				   if(re<1) re=0;
				   
				   return new Double(re);
			   }catch(Exception e){
				   System.out.println("StringUtil.class toInt.method is exception ");
				   e.printStackTrace();
			   }
			   return new Double(0);
		   }
		   
		   

}
