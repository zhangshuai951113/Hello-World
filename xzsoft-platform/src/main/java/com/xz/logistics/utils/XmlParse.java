package com.xz.logistics.utils;

import java.util.Map;

import com.tsh.base.util.StringUtil;
import com.tsh.base.util.Util;
import com.tswl.cuteinfo.enty.*;
import com.tswl.cuteinfo.util.DateUtil;
import com.tswl.cuteinfo.util.XMLUtil;

/**
 * 生成XML文件
 */ 
public class XmlParse {
	/**
	 * 生成电子路单
	 * @param mp 路单数据
	 * @return  标准格式路单
	 * @throws Exception 数据格式错误异常
	 */
	public static String genMiniERoadSheet(Map<String,Object> mp)throws Exception{
        Root root = new Root();
        Body body =new Body();
        Header header = new Header();
        ConsigneeInfo consigneeInfo = new ConsigneeInfo();
        ConsignorInfo consignorInfo = new ConsignorInfo();
        Driver driver =new Driver();
        GoodsInfo goodsInfo = new GoodsInfo();
        PriceInfo priceInfo = new PriceInfo();
        VehicleInfo vehicleInfo = new VehicleInfo();
        StringBuffer err=new StringBuffer("");
        TsContext context = new TsContext("cuteinfo.properties");
       //报文唯一标识号
       String duid=(String)mp.get("duid");
       if(duid==null){
           duid=Util.duid();
           mp.put("duid", duid);
       }
       
        
        header.setMessageReferenceNumber(duid);  //报文唯一标识号
        header.setDocumentName("无车承运人电子路单");   //电子路单名称（ 固定）
        header.setDocumentVersionNumber("2015WCCYR"); //电子路单版本 （固定）
        header.setSenderCode("12951");         // 天顺物流交换码（固定）
        header.setRecipientCode("wcjc0001");      // 交通部物流交换码（固定）
        //header.setRecipientCode("14057");      //标准服务器测试
        header.setMessageSendingDateTime(StringUtil.nowDatetimeFull()); //yyyymmddhhmiss格式
        header.setMessageFunctionCode("9");// 报文功能代码 1.取消 9.最初的(有关交易的最初传输报文) 5.变更 6.确认(默认最初的)
        root.setHeader(header);
        
        
        body.setOriginalDocumentNumber((String)mp.get("waybill_id"));
        String settlementNo=String.valueOf(mp.get("settlement_id"));
       
        
        if(Util.isNull(settlementNo)){
        	settlementNo="";
        	err.append("  结算单编号为必填字段!!\n 结算单编号："+settlementNo+"\n");
        }
        body.setShippingNoteNumber(settlementNo);
        body.setCarrier("新疆天顺供应链股份有限公司");
 //       body.setUnifiedSocialCreditIdentifier("11991000010647510A");
        body.setPermitNumber("650110004241"); //天顺道路运输经营许可证号
        
        String sendDate=(String)mp.get("forwardingTime");
        if(sendDate!=null && sendDate.trim().length()==10){
        	sendDate+=" 00:00:00";
        }
        if(!StringUtil.isValidDate(sendDate)){
        	sendDate="";
        	err.append("  发货时间或者运单生成时间不是一个有效的日期格式，正确的格式为yyyy-mm-dd hh:mi:ss!!\n 发货时间："+sendDate+"\n");
        }
        body.setConsignmentDateTime(StringUtil.dateFormatYms(sendDate)); //运单生成时间
        body.setBusinessTypeCode("1003999"); 
        body.setDespatchActualDateTime(StringUtil.dateFormatYms(sendDate)); //发货时间
        
        String arriveDate=(String)mp.get("arriveTime");
        if(arriveDate!=null && arriveDate.trim().length()==10){
        	arriveDate+=" 23:59:59";
        }
        if(!StringUtil.isValidDate(arriveDate)){
        	arriveDate="";
        	err.append("  到货时间不是一个有效的日期格式，正确的格式为yyyy-mm-dd hh:mi:ss!!\n 到货时间："+arriveDate+"\n");
        }
        body.setGoodsReceiptDateTime(StringUtil.dateFormatYms(arriveDate)); //到货时间
        
          consignorInfo.setConsignor((String)mp.get("forwarding_unit")); //发货单位
 //       consignorInfo.setPersonalIdentityDocument("330102198402124417");
 //       consignorInfo.setPlaceOfLoading("浙江省杭州市江干区");
        consignorInfo.setCountrySubdivisionCode("650100"); //发货方行政区划编号
        if(Util.isNull(consignorInfo.getConsignor())||"--".equals(consignorInfo.getCountrySubdivisionCode())){
        	err.append("发货方信息不完整。需要发货方名称、发货方行政区号！！\n"+
           " 发货方："+consignorInfo.getConsignor()+" 发货地点行政区划编码："+consignorInfo.getCountrySubdivisionCode()+"\n");
        }
        body.setConsignorInfo(consignorInfo);
        
        consigneeInfo.setConsignee((String)mp.get("consignee")); //收货单位
 //       consigneeInfo.setGoodsReceiptPlace("浙江省台州市椒江区");
        consigneeInfo.setCountrySubdivisionCode("650521"); //收货方行政区划编号
        if(Util.isNull(consigneeInfo.getConsignee())||"--".equals(consigneeInfo.getCountrySubdivisionCode())){
        	err.append("收货方信息不完整。需要收货方名称、收货方行政区号！！\n"+
           " 收货方："+consigneeInfo.getConsignee()+" 收货地点行政区划编码："+consigneeInfo.getCountrySubdivisionCode()+"\n");
         }
        body.setConsigneeInfo(consigneeInfo);
        
        double amt=StringUtil.toDouble(String.valueOf(mp.get("shipper_price"))); //应付运费
        if(amt<0.01){
        	err.append("运费金额有误!!金额为："+amt);
        }
        priceInfo.setTotalMonetaryAmount(Util.numberFormat(String.valueOf(mp.get("shipper_price")),2));
        priceInfo.setRemark("人民币");
        body.setPriceInfo(priceInfo);
        vehicleInfo.setLicensePlateTypeCode("0"+String.valueOf(mp.get("car_code_type")));//号牌类型   合理的取值范围为：01,02,03,04
        
        String plate=(String)mp.get("car_code"); //车牌号码
        if(Util.isNull(plate)){
        	plate="新A25476";
        }
        vehicleInfo.setVehicleNumber(plate);
        vehicleInfo.setVehicleClassificationCode((String)mp.get("car_type_id")); //车辆类型
        double tonnage=0;
        if(null!=mp.get("check_load")){
        	tonnage=StringUtil.toDouble(String.valueOf(mp.get("check_load"))+""); //车辆载重
        }
        else{
        	tonnage = 0;
        }
        if(tonnage<0.01){
        	err.append("请查看车辆载重值是否正确！！");
        }
        vehicleInfo.setVehicleTonnage(Util.numberFormat(tonnage,2)); //单位吨
        vehicleInfo.setRoadTransportCertificateNumber((String)mp.get("operation_cert_code"));//道路运输证
        if(Util.isNull(vehicleInfo.getVehicleNumber())||Util.isNull(vehicleInfo.getLicensePlateTypeCode())
        		||Util.isNull(vehicleInfo.getVehicleClassificationCode())
        		||Util.isNull(vehicleInfo.getRoadTransportCertificateNumber())){
        	err.append("车辆信息不完整。需要车牌号码、牌照类型、车辆类型、载重、道路运输证号！！\n车牌号码："+
     			 vehicleInfo.getVehicleNumber()+
     			 "  牌照类型："+vehicleInfo.getLicensePlateTypeCode()+
     			 "  车辆类型："+vehicleInfo.getVehicleClassificationCode()+
     			 "  道路运输证号："+vehicleInfo.getRoadTransportCertificateNumber()+"\n"	);
        }
        
        //司机信息
        String driverName=(String)mp.get("driverName");//司机姓名
        String qc=(String)mp.get("driving_license");//驾驶证号
        String phone=(String)mp.get("mobile_phone"); //联系号码

        
        driver.setNameOfPerson(driverName);
        driver.setQualificationCertificateNumber(qc);
        driver.setTelephoneNumber(phone);
       if(Util.isNull(driver.getNameOfPerson())||Util.isNull(driver.getQualificationCertificateNumber())){
    	   err.append("司机信息不完整。需要姓名、驾驶证号、联系电话！！\n"
    			+" 司机姓名："+driver.getNameOfPerson()+" 驾驶证号："+driver.getQualificationCertificateNumber()+
    			" 联系电话："+driver.getTelephoneNumber()+"\n");
    			  
       }
        vehicleInfo.setDriver(driver);
        
        goodsInfo.setDescriptionOfGoods((String)mp.get("goods_name"));  //货物名称
        
        goodsInfo.setCargoTypeClassificationCode((String)mp.get("material_type")); //货物分类
        
        double arriveUnits=StringUtil.toDouble(String.valueOf(mp.get("arrive_tonnage"))); //实际到货量
        
        if(tonnage<arriveUnits){
        	if(arriveUnits<=(tonnage*StringUtil.toDouble(context.getProperty("sendPercentage")))){//超吨报送
        		goodsInfo.setGoodsItemGrossWeight(Util.numberFormat(tonnage*1000, 2));
        	}else
        	err.append("车辆载重小于货物重量.请查看车辆载重和货物毛重的值是否正确！！载重："+tonnage+" 到货量："+arriveUnits);
        }else
        goodsInfo.setGoodsItemGrossWeight(Util.numberFormat(arriveUnits*1000, 2)); //货物毛重 单位kg
 //       goodsInfo.setCube("11.3333");
 //       goodsInfo.setTotalNumberOfPackages("12");
        vehicleInfo.setGoodsInfo(goodsInfo);
        
        body.setVehicleInfo(vehicleInfo);
        
  //      body.setFreeText("文本");
        root.setBody(body);
        String errors=err.toString();
        if(!Util.isNull(errors)){
        	throw new Exception("由于以下错误，无法上传：\n"+errors);
        }
        String xml=XMLUtil.objectToXML(Root.class,root);
        System.out.println("---将对象转换成的xml ---\n"+xml);
     //   XMLUtil.convertToXml(root, "d:\\"+Util.duid()+".xml");
        return  xml;
        
	}
	
	
    public static void main(String[] args) {
        Root root = new Root();
        Body body =new Body();
        Header header = new Header();
        ConsigneeInfo consigneeInfo = new ConsigneeInfo();
        ConsignorInfo consignorInfo = new ConsignorInfo();
        Driver driver =new Driver();
        GoodsInfo goodsInfo = new GoodsInfo();
        PriceInfo priceInfo = new PriceInfo();
        VehicleInfo vehicleInfo = new VehicleInfo();
        header.setMessageReferenceNumber("I9DeoogUJg8ZBfA");
        header.setDocumentName("无车承运人电子路单");
        header.setDocumentVersionNumber("2015WCCYR");
        header.setSenderCode("9285");
        header.setRecipientCode("9396");
        header.setMessageSendingDateTime("20161228144536");
        header.setMessageFunctionCode("9");
        root.setHeader(header);
        body.setOriginalDocumentNumber("31314534223");
        body.setShippingNoteNumber("532135");
        body.setCarrier("浙江未名物流有限公司");
        body.setUnifiedSocialCreditIdentifier("11991000010647510A");
        body.setPermitNumber("310112002939");
        body.setConsignmentDateTime("20161229145036");
        body.setBusinessTypeCode("1002996");
        body.setDespatchActualDateTime("20161229165036");
        body.setGoodsReceiptDateTime("20161231165036");
        consignorInfo.setConsignor("浙江新华书店");
        consignorInfo.setPersonalIdentityDocument("330102198402124417");
        consignorInfo.setPlaceOfLoading("浙江省杭州市江干区");
        consignorInfo.setCountrySubdivisionCode("330104");
        body.setConsignorInfo(consignorInfo);
        consigneeInfo.setConsignee("台州新华书店");
        consigneeInfo.setGoodsReceiptPlace("浙江省台州市椒江区");
        consigneeInfo.setCountrySubdivisionCode("331002");
        body.setConsigneeInfo(consigneeInfo);
        priceInfo.setTotalMonetaryAmount("430.012");
        priceInfo.setRemark("人民币");
        body.setPriceInfo(priceInfo);
        vehicleInfo.setLicensePlateTypeCode("01");
        vehicleInfo.setVehicleNumber("浙A32153");
        vehicleInfo.setVehicleClassificationCode("H01");
        vehicleInfo.setVehicleTonnage("20.00");
        vehicleInfo.setRoadTransportCertificateNumber("330111003790");
        vehicleInfo.setTrailerVehiclePlateNumber("浙RR527挂");
        vehicleInfo.setOwner("温州市侯海货运有限公司");
        vehicleInfo.setPermitNumber("330301000307");
        driver.setNameOfPerson("张三");
        driver.setQualificationCertificateNumber("431224198708273098");
        driver.setTelephoneNumber("15167338765");
        vehicleInfo.setDriver(driver);
        goodsInfo.setDescriptionOfGoods("教科书");
        goodsInfo.setCargoTypeClassificationCode("999");
        goodsInfo.setGoodsItemGrossWeight("151.333");
        goodsInfo.setCube("11.3333");
        goodsInfo.setTotalNumberOfPackages("12");
        vehicleInfo.setGoodsInfo(goodsInfo);
        body.setVehicleInfo(vehicleInfo);
        body.setFreeText("文本");
        root.setBody(body);
        String path = "D:/test/yy.xml";
        System.out.println("---将对象转换成File类型的xml Start---");
        XMLUtil.convertToXml(root, path);
        System.out.println(XMLUtil.objectToXML(Root.class,root));


    }
}
