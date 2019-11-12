package io.report.modules.rdp.controller;

import cn.hutool.http.HttpUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import io.report.common.db.bean.DataSourceBean;
import io.report.common.db.bean.TableBean;
import io.report.common.db.bean.TableColumnBean;
import io.report.common.db.util.DBUtil;
import io.report.common.utils.Base64Util;
import io.report.common.utils.R;
import io.report.common.utils.ServerUtil;
import io.report.common.utils.code.CodeUtil;
import io.report.modules.rdp.bean.ReportFileBean;
import io.report.modules.rdp.entity.JsonToXMLUtil;
import io.report.modules.rdp.entity.json.JsonReportEntity;
import io.report.modules.rdp.entity.xml.ParmEntity;
import io.report.modules.rdp.entity.xml.ReportEntity;
import io.report.modules.rdp.service.DesignService;
import io.report.modules.rdp.skin.SkinUtil;
import io.report.modules.rdp.util.Cache;
import io.report.modules.rdp.util.DataSourceUtil;
import io.report.modules.rdp.util.DesignXmlUtil;
import io.report.modules.rdp.util.ImportExcelUtil;
import io.report.modules.ser.service.DataSourceService;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/*
 * 报表设计相关
 */
@RestController
@RequestMapping("/rdp")
public class RdpController {
	protected Logger logger = LoggerFactory.getLogger(getClass());
	@Value("${report.rdp.data-path}")
	private String realPath;
	@Value("${report.relative-path}")
	private Boolean relativePath;
	@Autowired
	HttpServletRequest rq;
//	@Autowired
//	HttpServletResponse rp;

	@Autowired
	private DesignService designService;

	@Autowired
	private DataSourceService dataSourceService;

	/**
	 * 导入excel
	 * 
	 * @param filedata // 要导入文件
	 */

	@RequestMapping("/importExcelAction")
	public R ImportExcel(@RequestParam("filedata") MultipartFile filedata) {
		try {
			String filedataFileName = filedata.getOriginalFilename();
			String filedataContentType = filedata.getContentType();
			JsonReportEntity json = ImportExcelUtil.importExcel(filedata, filedataFileName, filedataContentType);
			return R.ok().put("data", json);
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("导入出错");
		}
	}

	/**
	 * 根据uuid取报表
	 * 
	 * @param uuid
	 * @return
	 */
	@RequestMapping("/selectReport")
	public R SelectReport(@RequestParam("uuid") String uuid) {
		ReportEntity model = DesignXmlUtil.openXMLNew(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
        if (model != null) {
            JsonReportEntity json = JsonToXMLUtil.XmlToJson(model);
            return R.ok().put("json", json);
        } else {
            return R.error("模板解析失败!");
        }
	}

	/**
	 * 保存报表
	 * 
	 * @param uuid
	 * @param report
	 * @return
	 */
	@RequestMapping("/saveReport")
	public R SaveReport(@RequestParam("uuid") String uuid, @RequestParam("report") String report) {
		try {
			report = Base64Util.decode(report, "Unicode");
			JsonReportEntity json = JSON.parseObject(report, JsonReportEntity.class);
			// String sonStr = JSON.toJSONString(json);
			// System.out.println(sonStr);
			ReportEntity re = JsonToXMLUtil.JsonToXml(json);
			String filePath = ServerUtil.getDataPath(relativePath, realPath) + re.getUuid() + ".xml";
			if (DesignXmlUtil.reportToXML(re, filePath)) {
				Cache.xmlMap.remove(re.getUuid());
				return R.ok("保存成功");
			} else {
				return R.error("保存失败！");
			}
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("保存出错！");
		}
	}

	/**
	 * 根据uuid取报表
	 * 
	 * @param uuid
	 * @return
	 */
	@RequestMapping("/deleteReport")
	public R DeleteReport(@RequestParam("uuid") String uuid) {
		try {
			designService.deleteReport(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
			Cache.xmlMap.remove(uuid);
			return R.ok();
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("删除失败！");
		}
	}

	/**
	 * 查询所有的报表
	 * 
	 * @return
	 */
	@RequestMapping("/selectAllReportFile")
	public Object SelectAllReportFile(@RequestParam(name = "kw") String kw, String callback) {
		try {
			List<ReportFileBean> list = designService.findAllReportFile(ServerUtil.getDataPath(relativePath, realPath));
			List<ReportFileBean> showlist = new ArrayList<ReportFileBean>();
			if (kw != null && !"".equals(kw) && !"undefined".equals(kw)) {
				for (ReportFileBean node : list) {
					if (node.getName().indexOf(kw) > -1 || node.getUuid().indexOf(kw) > -1) {
						showlist.add(node);
					}
				}
			} else {
				showlist.addAll(list);
			}

			if(StringUtils.isNotBlank(callback)){
			    return callback+"("+JSONObject.toJSONString(R.ok().put("list", showlist))+")";
            }
			return R.ok().put("list", showlist);
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("读取错误！");
		}
	}

	/**
	 * 查询报表的所有参数
	 * 
	 * @param uuid
	 * @return
	 */
	@RequestMapping("/selectAllParmsByUUID")
	public R SelectAllParmsByUUID(@RequestParam("uuid") String uuid) {
		try {
			List<ParmEntity> list = DesignXmlUtil.getParmsByUUID(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
			Map<String, Object> map = new HashMap<String, Object>();
			for (ParmEntity entity : list) {
				map.put(entity.getName(), "");
			}
			return R.ok().put("list", map);
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("获取参数出错！");
		}
	}

	/**
	 * 取所有可用的数据源
	 * 
	 * @return
	 */
	@RequestMapping("/selectAllDataSourceName")
	public R SelectAllDataSourceName() {
		try {
			List<DataSourceBean> list = designService.selectAllDataSource();
			return R.ok().put("list", list);
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("保存出错！");
		}
	}

	/**
	 * 取所有可用的数据源
	 * 
	 * @return
	 */
	@RequestMapping("/selectAllJSONName")
	public R selectAllJSONName() {
		try {
			List<DataSourceBean> list = designService.selectAllJSONNSource();
			return R.ok().put("list", list);
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("保存出错！");
		}
	}

	/**
	 * 取所有的字段
	 * 
	 * @param dataSourceName 数据源名称
	 * @param dataSetType    数据集类型
	 * @param value          sql语句
	 * @return
	 */
	@RequestMapping("/parFieldsForJSON")
	public R ParFieldsForJSON(@RequestParam("dataSourceName") String dataSourceName, @RequestParam("dataSetType") String dataSetType, @RequestParam("value") String value) {
		try {
			DataSourceBean dsb = new DataSourceBean();
			Map<String, String> dataMap = new HashMap<String, String>();
			if (dataSourceName != null && !dataSourceName.equals("javabean") && !dataSourceName.equals("json")) {
				if (Cache.dataSourceBeanMap.get(dataSourceName) != null) {
					dsb = Cache.dataSourceBeanMap.get(dataSourceName);
				} else {
					dsb = dataSourceService.getDataSourceBeanByDataSourceName(dataSourceName);
				}
				dataMap = DBUtil.connTest(dsb);
			} else {
				dsb.setType(dataSourceName.toLowerCase());
				dataMap.put("flag", "1");
			}
			if (dataMap != null && dataMap.size() > 0) {
				if ("1".equals(dataMap.get("flag"))) {
					String sqlStr = Base64Util.decode(value, "Unicode");
					List<TableColumnBean> list = designService.parFieldsForJSON(dsb, dataSetType, sqlStr);
					if (list != null && list.size() > 0) {
						return R.ok().put("list", list);
					} else {
						return R.error("sql解析出错了");
					}
				} else {
					return R.error(dataMap.get("msg"));
				}
			} else {
				return R.error("数据库连接失败");
			}

		} catch (Exception e) {
			e.printStackTrace();
			return R.error("保存出错！");
		}
	}

	/**
	 * 取所有的字段
	 * 
	 * @param dataSourceName 数据源名称
	 * @param path           服务地址
	 * @param method         请求方式
	 * @return
	 */
	@RequestMapping("/getJSONDataByUrl")
	public R getJSONDataByUrl(@RequestParam("dataSourceName") String dataSourceName, @RequestParam("path") String path, @RequestParam("method") String method) {
		String result = "";
		try {
			DataSourceBean dataSourceBean = dataSourceService.getDataSourceBeanByDataSourceName(dataSourceName);
			String url = dataSourceBean.getDataBaseUrl() + path;
			url = url.replace("&amp;", "&");
			if ("0".equals(method)) {
				result = HttpUtil.get(url);
			} else {
				result = HttpUtil.post(url, "");
			}
			System.out.println("取字段：" + url);
			try {
				return R.ok().put("list", JSONObject.parseObject(result));
			} catch (Exception ex) {
				try {
					return R.ok().put("list", JSONObject.parseArray(result));
				} catch (Exception ex1) {
					return R.error("获取出错！JSON数据格式不正常");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("获取出错！");
		}

	}

	/**
	 * 根据数据源取表的信息
	 * 
	 * @param dataSourceName
	 * @return
	 */
	@RequestMapping("/getTableInfo")
	public R getTableInfo(@RequestParam("dataSourceName") String dataSourceName) {
		try {
			DataSourceBean dataSourceBean = dataSourceService.getDataSourceBeanByDataSourceName(dataSourceName);
			try {
				List<TableBean> listb = new DataSourceUtil().getTableInfo(dataSourceBean);
				return R.ok().put("list", listb);
			} catch (Exception ex1) {
				return R.error("获取出错！JSON数据格式不正常");
			}
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("获取出错！");
		}
	}

	/**
	 * 根据数据源取表字段的信息
	 * 
	 * @param dataSourceName
	 * @param tableName
	 * @return
	 */
	@RequestMapping("/getColumnInfo")
	public R getColumnInfo(@RequestParam("dataSourceName") String dataSourceName, @RequestParam("tableName") String tableName) {
		try {
			DataSourceBean dataSourceBean = dataSourceService.getDataSourceBeanByDataSourceName(dataSourceName);
			try {
				List<TableColumnBean> listb = new DataSourceUtil().getColumnsInfo(dataSourceBean, tableName);
				return R.ok().put("list", listb);
			} catch (Exception ex1) {
				return R.error("获取出错！JSON数据格式不正常");
			}
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("获取出错！");
		}
	}
	
	/**
	 * 获取条形码信息
	 * @param barType
	 * @param barImage
	 * @return
	 */
	@RequestMapping("/getBarCode")
	public R getBarCode(@RequestParam("barType") String barType, 
			@RequestParam("barSize") String barSize, 
			@RequestParam("width") Integer width,
			@RequestParam("height") Integer height,
			@RequestParam("barImage") String barImage,
			@RequestParam("showContentFlag") Boolean showContentFlag) {
		try {
			CodeUtil codeUtil = new CodeUtil();
			String base64Str = codeUtil.showImageCode(barType,width, height,barImage,showContentFlag);
			return R.ok().put("imageStr", base64Str);
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("获取出错！");
		}
	}
	/**
	 * 清空数据字典缓存
	 * 
	 * @return
	 */
	@RequestMapping("/refreshDic")
	public R refreshDic() {
		Cache.dicMap.clear();
		return R.ok();
	}

	/**
	 * 检查自定义皮肤是否存在
	 * 
	 * @param fileName
	 * @return
	 */
	@RequestMapping("/checkSkin")
	public R checkSkin(@RequestParam("fileName") String fileName) {
		if (SkinUtil.exsitCustomFile(fileName)) {
			return R.error("皮肤已经存在了");
		} else {
			return R.ok();
		}
	}

	/**
	 * 取所有的自定义皮肤
	 * 
	 * @return
	 */
	@RequestMapping("/customSkinList")
	public R customSkinList() {
		List<String> lists = SkinUtil.getCustomFiles();
		return R.ok().put("list", lists);
	}

	/**
	 * 取自定义皮肤对象
	 * 
	 * @return
	 */
	@RequestMapping("/getCustomSkin")
	public R getCustomSkin(@RequestParam("fileName") String fileName) {
		net.sf.json.JSONObject json = SkinUtil.getSustomSkinJson(fileName);
		return R.ok().put("json", json);
	}

	/**
	 * 删除自定义皮肤
	 * 
	 * @return
	 */
	@RequestMapping("/removeCustomSkin")
	public R removeCustomSkin(@RequestParam("fileName") String fileName) {
		Boolean flag = SkinUtil.removeSustomSkinJson(fileName);
		if (flag) {
			return R.ok();
		} else {
			return R.error("删除失败！");
		}
	}

	/**
	 * 保存自定义皮肤
	 * 
	 * @return
	 */
	@RequestMapping("/saveCustomSkin")
	public R saveCustomSkin(@RequestParam("fileName") String fileName, @RequestParam("content") String content) {
		SkinUtil.saveSustomSkinJson(fileName, content);
		return R.ok();
	}
}
