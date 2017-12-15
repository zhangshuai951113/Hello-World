package com.xz.logistics.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;





/**
 * 
 * @author soon
 *
 */
public class JsonUtil {
	
	private static Gson gson;
	static {
		GsonBuilder builder = new GsonBuilder();
		builder.setDateFormat("yyyy-MM-dd HH:mm:ss");
		gson = builder.create();
	}

	public static Gson getGson() {
		return gson;
	}

	/**
	 * 
	 * 
	 * @param jsonString
	 * @param beanCalss
	 *            <T>
	 * @return T
	 */
	public static <T> T json2Bean(String jsonString, Class<T> beanCalss) {
		return gson.fromJson(jsonString, beanCalss);
	}

	/**
	 *
	 * 
	 * @param bean
	 * @return JsonObject
	 */
	public static JsonObject bean2Json(Object bean) {
		return json2Bean(parse(bean), JsonObject.class);
	}

	/**
	 * 
	 * 
	 * @return JsonObject
	 */
	public static JsonArray list2JsonArray(Object list) {
		return json2Bean(parse(list), JsonArray.class);
	}

	/**
	 * 
	 * 
	 * @param jsonString
	 * @return JsonObject
	 */
	public static JsonObject unParse(String jsonString) {
		return json2Bean(jsonString, JsonObject.class);
	}

	/**
	 * 
	 * @param bean
	 * @return
	 */
	public static String parse(Object bean) {
	
		return gson.toJson(bean);
	}

	/**
	 * 
	 * 
	 * @param jsonString
	 * @return
	 */
	public static JsonArray parseArray(String jsonString) {
		return json2Bean(jsonString, JsonArray.class);
	}
	
	public  static String Obj2Json(Object object){
		JSONObject jsonobj = JSONObject.fromObject(object);
		String json = jsonobj.toString();
		return json;
	}
	
	 /**
     * 将Json对象转换成多个Map存到list中
     * 
     * @param jsonObject
     *            json对象
     * @return List对象
     * @throws JSONException
     */
	 public static HashMap<String, Object> parseJSON2Map(String jsonData) {   
		 	JSONObject jsonobj = JSONObject.fromObject(jsonData);  
		 	HashMap<String, Object> map = new HashMap<String, Object>();
		 	for(Object k : jsonobj.keySet()){
				Object v = jsonobj.get(k); 
				//如果内层还是数组的话，继续解析
				if(v instanceof JSONArray){
					List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
					Iterator<JSONObject> it = ((JSONArray)v).iterator();
					while(it.hasNext()){
						JSONObject json2 = it.next();
						list.add(parseJSON2Map(json2.toString()));
					}
					map.put(k.toString(), list);
				} else {
					map.put(k.toString(), v);
				}
			}
	        return map;
	    }
 
	 
	 
	
}
