package com.xz.logistics.utils;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.commons.lang.StringUtils;

import com.xz.common.utils.redis.RedisUtil;

/**
 * 编号生成类
 * 
 * @author zhangya 2017年7月8日 下午7:58:54
 */
public class CodeAutoGenerater {
	
	/**
	 * 生成编号(公用)
	 *@author zhangya 2017年7月8日 下午8:01:27
	 *@return
	 */
	public static String generaterCodeByFlag(String flag) {
		// 生成编号 flag+日期+四位序列号
		String code = null;
		String date = new SimpleDateFormat("yyyyMMdd").format(new Date());
		String codeKey = flag + date;
		String currentCode = (String) RedisUtil.get(codeKey);
		if (StringUtils.isBlank(currentCode)) {
			code = codeKey + "0001";
		} else {
			// 不为空序号加1
			Integer currentNum = Integer.valueOf(currentCode.substring(flag.length()+8)) + 1;
			NumberFormat formatter = NumberFormat.getNumberInstance();
			formatter.setMinimumIntegerDigits(4);
			formatter.setGroupingUsed(false);
			String currentNumStr = formatter.format(currentNum);
			code = codeKey + currentNumStr;
		}
		return code;
	}

	/**
	 * 生成新对账单编号
	 *@author zhangya 2017年7月8日 下午8:01:27
	 *@return
	 */
	public static String generaterAccountCheckId() {
		// 生成对账单编号 DZ+日期+四位序列号
		String accountCheckId = null;
		String date = new SimpleDateFormat("yyyyMMdd").format(new Date());
		String accountCheckIdKey = "DZ" + date;
		String currentAccountCheckId = (String) RedisUtil.get(accountCheckIdKey);
		if (StringUtils.isBlank(currentAccountCheckId)) {
			accountCheckId = accountCheckIdKey + "0001";
		} else {
			// 不为空序号加1
			Integer currentNum = Integer.valueOf(currentAccountCheckId.substring(10)) + 1;
			NumberFormat formatter = NumberFormat.getNumberInstance();
			formatter.setMinimumIntegerDigits(4);
			formatter.setGroupingUsed(false);
			String currentNumStr = formatter.format(currentNum);
			accountCheckId = accountCheckIdKey + currentNumStr;
		}
		return accountCheckId;
	}
	
	/**
	 * 生成新发票号码
	 *@author luojuan 2017年7月11日
	 *@return
	 */
	public static String generaterInvoiceInfoId() {
		// 生成发票号码 FP+日期+四位序列号
		String invoiceInfoId = null;
		String date = new SimpleDateFormat("yyyyMMdd").format(new Date());
		String invoiceInfoIdKey = "FP" + date;
		String currentInvoiceInfoId = (String) RedisUtil.get(invoiceInfoIdKey);
		if (StringUtils.isBlank(currentInvoiceInfoId)) {
			invoiceInfoId = invoiceInfoIdKey + "0001";
			RedisUtil.set(invoiceInfoIdKey, invoiceInfoId);
		} else {
			// 不为空序号加1
			Integer currentNum = Integer.valueOf(currentInvoiceInfoId.substring(10)) + 1;
			NumberFormat formatter = NumberFormat.getNumberInstance();
			formatter.setMinimumIntegerDigits(4);
			formatter.setGroupingUsed(false);
			String currentNumStr = formatter.format(currentNum);
			invoiceInfoId = invoiceInfoIdKey + currentNumStr;
		}
		return invoiceInfoId;
	}

}
