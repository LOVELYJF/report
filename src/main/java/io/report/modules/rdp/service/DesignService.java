package io.report.modules.rdp.service;

import java.util.List;

import io.report.common.db.bean.DataSourceBean;
import io.report.common.db.bean.TableColumnBean;
import io.report.modules.rdp.bean.ReportFileBean;

public interface DesignService {


	/**
	 * 根据条件查询报表
	 * 
	 * @param filePath
	 * @param conditions查询条件
	 * @return
	 */
	public List<ReportFileBean> findAllReportFile(String realPath, ReportFileBean conditions);

	/**
	 * 查询所有报表文件
	 * 
	 * @param filePath 报表文件路径
	 * @return
	 */
	public List<ReportFileBean> findAllReportFile(String realPath);

	public void deleteReport(String filePath);

	/**
	 * 取所有状态可用的DataSourceName
	 * 
	 * @return
	 */
	public List<DataSourceBean> selectAllDataSource();
	/**
	 * 取所有状态可用的JSON数据源
	 * 
	 * @return
	 */
	public List<DataSourceBean> selectAllJSONNSource();

	/**
	 * 解析字段
	 * 
	 * @param name
	 * @param dsType
	 * @param sqlStr
	 * @return
	 */
	public List<TableColumnBean> parFieldsForJSON(DataSourceBean dsb, String dsType, String sqlStr);

}
