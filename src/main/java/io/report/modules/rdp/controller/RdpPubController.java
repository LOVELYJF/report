package io.report.modules.rdp.controller;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;

import io.report.common.exception.CodeException;
import io.report.common.utils.Base64Util;
import io.report.common.utils.R;
import io.report.common.utils.ServerUtil;
import io.report.modules.rdp.entity.JsonToXMLUtil;
import io.report.modules.rdp.entity.json.JsonReportEntity;
import io.report.modules.rdp.entity.xml.ReportEntity;
import io.report.modules.rdp.service.ReportService;
import io.report.modules.rdp.util.Cache;
import io.report.modules.rdp.util.DesignXmlUtil;
import io.report.modules.rdp.util.FillReportUtil;
import io.report.modules.rdp.util.JRUtilNew;
import io.report.modules.rdp.util.PoiUtil;

/*
 * 报表展现相关--不拦截
 */
@RestController
@RequestMapping("/rdppub")
public class RdpPubController {
	protected Logger logger = LoggerFactory.getLogger(getClass());
	@Value("${report.rdp.data-path}")
	private String realPath;
	@Value("${report.rdp.maxexport}")
	private int maxexport;
	@Value("${report.relative-path}")
	private Boolean relativePath;

	@Autowired
	HttpServletRequest rq;
	@Autowired
	HttpServletResponse rp;
	CodeException codeException = new CodeException();

	/**
	 * 显示报表
	 * 
	 */
	@RequestMapping("/show")
	public R show() {
		Map<String, Object> dMap = new HashMap<String, Object>();
		String uuid = rq.getParameter("uuid");
		String reportJson = rq.getParameter("reportJson");
		int pageSize = rq.getParameter("pageSize") != null ? Integer.parseInt(rq.getParameter("pageSize")) : 0;// 页尺寸
		int currentPage = rq.getParameter("currentPage") != null ? Integer.parseInt(rq.getParameter("currentPage")) : 1;// 当前页
		int pageType = rq.getParameter("pageType") != null ? Integer.parseInt(rq.getParameter("pageType")) : 0;// 页方向 0-纵向 1-横向
		JRUtilNew jn = new JRUtilNew();
		ReportEntity entity = new ReportEntity();
		Boolean isReportJson = false;
		try {
			if (reportJson == null || "".equals(reportJson)) {
				if (uuid != null && uuid.length() > 0 && Cache.xmlMap.get(uuid) != null) {
					entity = (ReportEntity) Cache.xmlMap.get(uuid);
				} else {
					File file = new File(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
					if (file.exists()) {
						entity = DesignXmlUtil.openXMLNew(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
					} else {
						entity = new ReportEntity();
					}
				}
				if (entity.getUuid() != null) {
					isReportJson = false;
				} else {
					return R.error("报表不存在！");
				}
			} else {
				try {
					reportJson = Base64Util.decode(reportJson, "Unicode");
				} catch (UnsupportedEncodingException e) {
					e.printStackTrace();
				}
				JsonReportEntity json = JSON.parseObject(reportJson, JsonReportEntity.class);
				entity = JsonToXMLUtil.JsonToXml(json);
				isReportJson = true;
			}
			if (pageSize == 0) {
				pageSize = entity.getBodyPagesize();
			}
			Map<String, Object> rmap = jn.reportMap(false,relativePath, realPath,rq, entity, uuid, currentPage, pageSize);
			if (isReportJson) {
				dMap = jn.pubPreDes(relativePath, rq, ServerUtil.getDataPath(relativePath, realPath), entity, currentPage, pageType, pageSize, uuid, false, rmap);
			} else {
				if (pageSize == 0) {
					dMap = jn.pubPreDes(relativePath, rq, ServerUtil.getDataPath(relativePath, realPath), entity, currentPage, entity.getBodyPageorder(), entity.getBodyPagesize(), uuid, false, rmap);
				} else {
					dMap = jn.pubPreDes(relativePath, rq, ServerUtil.getDataPath(relativePath, realPath), entity, currentPage, pageType, pageSize, uuid, false, rmap);
				}
			}
			return R.ok().put("list", dMap);
		} catch (Exception e) {
			return R.error(codeException.getCodeExcepion(e, "获取参数出错！"));
		}
	}

	/**
	 * 报表导出状态
	 * 
	 * @return
	 */
	@RequestMapping("/exportFlag")
	public R exportFlag() {
		int maxexport = 10;
		String uuid = rq.getParameter("uuid");
		String stat = rq.getParameter("stat");
		int curexport = 0;
		String cep = Cache.exportMap.get("curexport");
		String expuuid = Cache.exportMap.get(uuid);
		if (stat != null && stat.equals("1")) {
			// 失败减导出标志
			if (cep != null && cep.equals("1")) {
				Cache.exportMap.put("curexport", "0");
				Cache.exportMap.remove(uuid);
			} else {
				try {
					int xcep = maxexport - 1;
					if (xcep < 0)
						xcep = 0;
					Cache.exportMap.put("curexport", String.valueOf(xcep));
					Cache.exportMap.remove(uuid);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		} else {
			if (cep == null || cep.equals("0")) {
				Cache.exportMap.put("curexport", "1");
				curexport = 1;
			} else {
				try {
					if (maxexport > Integer.parseInt(cep) && expuuid == null) {
						Cache.exportMap.put("curexport", String.valueOf(Integer.parseInt(cep) + 1));
					}
					if (maxexport >= curexport) {
						curexport = Integer.parseInt(cep) + 1;
					}
				} catch (Exception e) {
				}
			}
		}
		if (maxexport >= curexport) {
			// if(expuuid==null){
			// exportMap.put(uuid, "1");
			// backFlag = 1;
			// }else{
			// backFlag=0;
			// }
			// 启用上方注释则单报表不同同时导出
			return R.ok();
		} else {
			return R.error();
		}
	}

	/**
	 * 导出非主子报表
	 * 
	 * @return
	 */
	@RequestMapping("/exportExcel")
	public void exportExcel() {
		long startTime = System.currentTimeMillis();
		ReportEntity entity = new ReportEntity();
		String uuid = rq.getParameter("uuid");
		if (uuid != null && uuid.length() == 32) {
			if (Cache.xmlMap.get(uuid) != null) {
				entity = (ReportEntity) Cache.xmlMap.get(uuid);
			} else {
				File file = new File(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
				if (file.exists()) {
					entity = DesignXmlUtil.openXMLNew(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
				} else {
					entity = new ReportEntity();
				}
			}
		} else {
			String reportJson = rq.getParameter("reportJson");
			try {
				reportJson = Base64Util.decode(reportJson, "Unicode");
			} catch (Exception e) {
				e.printStackTrace();
			}
			JsonReportEntity json = JSON.parseObject(reportJson, JsonReportEntity.class);
			entity = JsonToXMLUtil.JsonToXml(json);
		}
		JSONArray jsonArray = new JSONArray();
		String jsonlist = rq.getParameter("jsonlist");
		if (!"".equals(jsonlist))
			jsonArray = JSON.parseArray(jsonlist);
		try {
			String fileName = entity.getReportDescription() != null ? entity.getReportDescription() : "temp";
			Map<String, Object> rpmap = new JRUtilNew().rpMap(rq,entity, uuid, jsonArray);
			new JRUtilNew().exportExcel(entity, uuid, jsonArray, fileName, rq, rp, false, rpmap);
		} catch (Exception e) {
			e.printStackTrace();
			rp.setHeader("Set-Cookie", "fileDownload=false; path=/");
			rp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		}
		// 减导出标志
		String cep = Cache.exportMap.get("curexport");
		if (cep != null && cep.equals("1")) {
			Cache.exportMap.put("curexport", "0");
			Cache.exportMap.remove(uuid);
		} else {
			try {
				int xcep = Integer.parseInt(cep) - 1;
				if (xcep < 0)
					xcep = 0;
				Cache.exportMap.put("curexport", String.valueOf(xcep));
				Cache.exportMap.remove(uuid);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		Long endTime = System.currentTimeMillis();
		logger.info("导出总用时：" + (endTime - startTime));
	}

	/**
	 * 导出主子报表
	 * 
	 * @return
	 */
	@RequestMapping("/exportSubExcel")
	public void exportSubExcel() {
		String uuid = rq.getParameter("uuid");
		long startTime = System.currentTimeMillis();
		ReportEntity entity = new ReportEntity();
		if (uuid != null && uuid.length() == 32) {
			if (Cache.xmlMap.get(uuid) != null) {
				entity = (ReportEntity) Cache.xmlMap.get(uuid);
			} else {
				File file = new File(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
				if (file.exists()) {
					entity = DesignXmlUtil.openXMLNew(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
				} else {
					entity = new ReportEntity();
				}
			}
		} else {
			String reportJson = rq.getParameter("reportJson");
			JsonReportEntity json = JSON.parseObject(reportJson, JsonReportEntity.class);
			entity = JsonToXMLUtil.JsonToXml(json);
		}
		Map<String, Object> dMap = null;
		try {
			JRUtilNew jn = new JRUtilNew();
			Map<String, Object> rmap = jn.reportMap(false,relativePath, realPath,rq, entity, uuid, 1, -1);
			dMap = jn.pubPreDes(relativePath, rq, ServerUtil.getDataPath(relativePath, realPath), entity, 1, 1, -1, uuid, false, rmap);
		} catch (Exception e) {
			e.printStackTrace();
		}
		try {
			if (dMap != null && dMap.get("body") != null) {
				String fileName = entity.getReportDescription();
				PoiUtil.exportExcel(dMap.get("body").toString(), fileName, rq, rp);
				dMap = null;
			} else {
				rp.setHeader("Set-Cookie", "fileDownload=false; path=/");
				rp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
			}
		} catch (Exception e) {
			e.printStackTrace();
			rp.setHeader("Set-Cookie", "fileDownload=false; path=/");
			rp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		}
		// 减导出标志
		String cep = Cache.exportMap.get("curexport");
		if (cep != null && cep.equals("1")) {
			Cache.exportMap.put("curexport", "0");
			Cache.exportMap.remove(uuid);
		} else {
			try {
				int xcep = Integer.parseInt(cep) - 1;
				if (xcep < 0)
					xcep = 0;
				Cache.exportMap.put("curexport", String.valueOf(xcep));
				Cache.exportMap.remove(uuid);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		Long endTime = System.currentTimeMillis();
		logger.info("导出总用时：" + (endTime - startTime));
	}

	/**
	 * 显示报表参数
	 * 
	 * @return
	 */
	@RequestMapping("/showparam")
	public R showparam() {
		String uuid = rq.getParameter("uuid");
		String reportJson = rq.getParameter("reportJson");
		try {
			Map<String, Object> map = DesignXmlUtil.compileReportParms(ServerUtil.getDataPath(relativePath, realPath), uuid, reportJson, rq);
			return R.ok().put("data", map);
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("获取参数出错！");
		}
	}

	/**
	 * 填报保存 --注意：填报不支持多数据源
	 * 
	 * @return
	 */
	@RequestMapping("/savereport")
	public R savereport() {
		ReportService reportService=new ReportService();
		String uuid = rq.getParameter("uuid");
		try {
			if (uuid.length() != 32) {
				return R.error("提示：预览时不支持填报保存功能！");
			} else {
				ReportEntity entity = (ReportEntity) Cache.xmlMap.get(uuid);
				if (entity == null) {
					File file = new File(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
					if (file.exists()) {
						entity = DesignXmlUtil.openXMLNew(ServerUtil.getDataPath(relativePath, realPath) + uuid + ".xml");
					}
				}
				if (entity != null) {
					Map<String, Object> returnMap = FillReportUtil.getFillSql(rq, entity);
					Map<String, Object> sqlMap=new HashMap<String, Object>();
					if (returnMap.get("code").toString().equals("0")) {
						for (String k : returnMap.keySet()) {
							if (k.startsWith("sql_")) {
								sqlMap.put(k, returnMap.get(k));
							}
						}
						if(sqlMap.size()>0) {
							Map<String, String> resMap = reportService.executeSqlMapByTran(sqlMap);
							if (resMap != null && resMap.size() > 0 && resMap.get("code") != null) {
								if (resMap.get("code").equals("0")) {
									return R.error(resMap.get("msg"));
								}
							} else {
								return R.error("提示：保存失败，验证出错！");
							}
						}else {
							return R.error("提示：没有找到要保存的SQL！");
						}
					} else {
						return R.error(returnMap.get("msg").toString());
					}
				} else {
					return R.error("提示：出错了，未找到报表模板！");
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("获取参数出错！");
		}
		return R.ok();
	}


}
