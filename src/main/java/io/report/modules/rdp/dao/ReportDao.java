package io.report.modules.rdp.dao;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import org.apache.commons.collections.map.CaseInsensitiveMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.report.common.db.bean.DataSourceBean;
import io.report.common.db.util.DBUtil;
import io.report.modules.rdp.util.SqlParserUtil;
import io.report.modules.rdp.util.Tools;

public class ReportDao {
	protected Logger logger = LoggerFactory.getLogger(getClass());

	/**
	 * 获取数据
	 * 
	 */
	@SuppressWarnings({ "unchecked" })
	public void queryExecuterNew(DataSourceBean dataSourceBean, String sql, List<JSONObject> l, Map<String, BigDecimal> sum, List<Map<String, Object>> list, String key, String expt, int currentPage,
			int pageSize, String dbtype, Map<String, String> dsFilter, String datasetType, Map<String, Object> procParamMap, Object... params) throws SQLException {
		Map<String, Object> objMap = new CaseInsensitiveMap();
		Map<String, Object> objm = new CaseInsensitiveMap();

		for (JSONObject obj : l) {
			objm = new CaseInsensitiveMap();
			objm = JSONObject.parseObject(obj.toJSONString(), Map.class);
			if (objm.get("datadic") != null && objm.get("datadic").toString().length() > 5) {
				if (objm.get("datadic").toString().startsWith("{") && objm.get("datadic").toString().endsWith("}")) {
					try {
						objm.put("datadic", JSONObject.parseObject(objm.get("datadic").toString(), Map.class));
					} catch (Exception e) {
						objm.put("datadic", "");
						e.printStackTrace();
					}
				} else if (objm.get("datadic").toString().toLowerCase().startsWith("select ")) {
					String dicsql = objm.get("datadic").toString();
					List<Map<String, Object>> diclist = DBUtil.getDbInfoUtil(dataSourceBean).getResultToList(dicsql, false, new HashMap<String, Object>());
					if (diclist.size() > 0) {
						Map<String, Object> ndic = new HashMap<String, Object>();
						for (Map<String, Object> rs : diclist) {
							if (rs.get("opt_code") != null && rs.get("opt_name") != null) {
								ndic.put(rs.get("opt_code").toString(), rs.get("opt_name"));
							}
						}
						objm.put("datadic", ndic);
					}
				}
			} else {
				objm.put("datadic", "");
			}
			objMap.put(objm.get("datafield").toString(), objm);
		}
		if (!sql.equals("")) {
			sql = sql.trim().replaceAll("&quot;", "\"").replaceAll("&gt;", ">").replaceAll("&lt;", "<").replaceAll("&amp;", "&");
			if (sql.endsWith(";")) {
				sql = sql.substring(0, sql.length() - 1);
			}
		}
		if (pageSize > 0 && currentPage > 0 && !"2".equals(datasetType) && !"3".equals(datasetType)) {
			if (dsFilter.size() == 0) {
				sql = SqlParserUtil.getPageSql(dbtype, sql, currentPage, pageSize);
			}
		}
		try {
			List<Map<String, Object>> dlist = null;
			if ("2".equals(datasetType) || "3".equals(datasetType)) {
				dlist = DBUtil.getDbInfoUtil(dataSourceBean).getResultToList(sql, true, procParamMap);
			} else {
				sql = DBUtil.printRealSql(sql, params);
				dlist = DBUtil.getDbInfoUtil(dataSourceBean).getResultToList(sql, false, new HashMap<String, Object>());
			}
			int n = 0;
			Map<String, Object> map = null;
			for (Map<String, Object> rs : dlist) {
				n++;
				map = new CaseInsensitiveMap();
				if (list.size() > (n - 1)) {
					map = list.get(n - 1);
				}
				// 数据处理
				Iterator<Entry<String, Object>> it = rs.entrySet().iterator();
				while (it.hasNext()) {
					Entry<String, Object> itEntry = it.next();
					String itKey = itEntry.getKey();
					if (objMap.get(itKey) != null) {
						Map<String, Object> ms = (Map<String, Object>) objMap.get(itKey);
						String nkey = key + "." + ms.get("datafield") + expt;
						Object data = rs.get(itKey);
						if (ms.get("datadic") != null && ms.get("datadic").toString().length() > 0) {
							data = ((Map<String, Object>) ms.get("datadic")).get(data);
						}
						if (sum != null && sum.size() > 0) {
							// 处理求和
							try {
								Object oo = null;
								// 兼容旧方法
								String snkey = nkey.split("\\.")[1];
								if (sum.get(snkey) != null) {
									oo = sum.get(snkey);
								}
								if (oo != null) {
									BigDecimal bd = new BigDecimal(oo.toString());
									bd = bd.add(new BigDecimal("".equals(data) ? "0" : data.toString().replace(",", "")));
									sum.put(snkey, bd);
								}
								// 兼容旧方法结束
								if (sum.get(nkey) != null) {
									oo = sum.get(nkey);
								}
								if (oo != null) {
									BigDecimal bd = new BigDecimal(oo.toString());
									bd = bd.add(new BigDecimal("".equals(data) ? "0" : data.toString().replace(",", "")));
									sum.put(nkey, bd);
								}
							} catch (Exception e) {
								e.printStackTrace();
							}
						}
						map.put(nkey, data);
					}
				}
				// 数据处理结束
				if (list.size() <= (n - 1)) {
					list.add(map);
				}
			}
			// jexl.clearCache();
			dlist = null;
		} catch (Exception e) {
			e.printStackTrace();
			// System.out.println(e.getMessage());
		} finally {
		}
	}

	/***
	 * 从实体中获取数据
	 * 
	 */
	@SuppressWarnings("unchecked")
	public void queryFromObjectNew(String sql, List<JSONObject> l, Map<String, BigDecimal> sum, List<Map<String, Object>> list, String key, JSONArray jsonArray, Map<String, Object> mmdtl) {
		if (!sql.equals("")) {
			sql = sql.replaceAll("&quot;", "\"").replaceAll("&gt;", ">").replaceAll("&lt;", "<").replaceAll("&amp;", "&");
		}
		try {

			if (!"".equals(sql)) {
				String className = sql;
				if (sql.indexOf("|") != -1)
					className = sql.split("\\|")[0];
				Class object = Class.forName(className);
				List<Object> datalist = new ArrayList<Object>();
				if (mmdtl.size() == 0) {
					datalist = (List<Object>) jsonArray.toJavaList(object);

					for (Object str : datalist) {
						Map<String, Object> map = new CaseInsensitiveMap();
						for (JSONObject obj : l) {
							Object data;
							String propertyName = obj.getString("datafield");
							if (!"".equals(propertyName)) {
								Method method = (Method) str.getClass().getMethod("get" + getMethodName(propertyName));

								data = (Object) method.invoke(str);
								if (sum != null && sum.size() > 0) {
									// 处理求和
									try {
										Object oo = null;
										// 兼容旧方法
										if (sum.get(propertyName) != null) {
											oo = sum.get(propertyName);
										}
										if (oo != null) {
											BigDecimal bd = new BigDecimal(oo.toString());
											bd = bd.add(new BigDecimal("".equals(data) ? "0" : data.toString()));
											sum.put(propertyName, bd);
										}
										// 兼容旧方法结束
										if (sum.get(key + "." + propertyName) != null) {
											oo = sum.get(key + "." + propertyName);
										}
										if (oo != null) {
											BigDecimal bd = new BigDecimal(oo.toString());
											bd = bd.add(new BigDecimal(data.toString()));
											sum.put(key + "." + propertyName, bd);
										}
									} catch (Exception e) {
									}
								}
								if (obj.getString("datatype").indexOf("java.util.List") != -1) {// 动态列表头
									if (data != null) {
										List<Object> olist = (List<Object>) data;
										for (int i = 0; i < olist.size(); i++) {
											map.put(key + "." + propertyName, olist.get(i));
											list.add(map);
											map = new CaseInsensitiveMap();
										}
									}
								} else {
									map.put(key + "." + propertyName, data);
								}
							}
						}

						list.add(map);
					}
				} else {
					for (Object jro : jsonArray) {
						JSONObject jo = (JSONObject) jro;
						Map<String, Object> map = new CaseInsensitiveMap();
						for (String propertyName : jo.keySet()) {
							Object data = jo.get(propertyName);
							if (sum != null && sum.size() > 0) {
								Object oo = null;
								// 兼容旧方法
								if (sum.get(propertyName) != null) {
									oo = sum.get(propertyName);
								}
								if (oo != null) {
									BigDecimal bd = new BigDecimal(oo.toString());
									bd = bd.add(new BigDecimal("".equals(data) ? "0" : data.toString()));
									sum.put(propertyName, bd);
								}
								// 兼容旧方法结束
								if (sum.get(key + "." + propertyName) != null) {
									oo = sum.get(key + "." + propertyName);
								}
								if (oo != null) {
									BigDecimal bd = new BigDecimal(oo.toString());
									bd = bd.add(new BigDecimal(data.toString()));
									sum.put(key + "." + propertyName, bd);
								}
							}
							map.put(key + "." + propertyName, data);
						}
						list.add(map);
					}
				}

			}
		} catch (Exception e) {
			e.printStackTrace();
			// System.out.println(e.getMessage());
		}
	}

	/**
	 * 从json中直取数
	 * 
	 */
	public void queryFromJson(List<JSONObject> l, Map<String, BigDecimal> sum, List<Map<String, Object>> list, String key, JSONArray jsonArray, Map<String, Object> mmdtl) {
		try {

			if (mmdtl.size() == 0) {
				for (Object str : jsonArray) {
					Map<String, Object> map = new CaseInsensitiveMap();
					JSONObject jstr = JSONObject.parseObject(str.toString());
					for (JSONObject obj : l) {
						Object data = null;
						String propertyName = obj.getString("datafield");
						if (!"".equals(propertyName)) {
							if (propertyName.indexOf("[") != -1 && propertyName.indexOf("]") != -1) {
								data = Tools.getObjectFromJson(propertyName, jstr);
							} else {
								data = jstr.get(propertyName);
							}
							if (sum != null && sum.size() > 0) {
								// 处理求和
								try {
									Object oo = null;
									// 兼容旧方法
									if (sum.get(propertyName) != null) {
										oo = sum.get(propertyName);
									}
									if (oo != null) {
										BigDecimal bd = new BigDecimal(oo.toString());
										bd = bd.add(new BigDecimal("".equals(data) ? "0" : data.toString()));
										sum.put(propertyName, bd);
									}
									// 兼容旧方法结束
									if (sum.get(key + "." + propertyName) != null) {
										oo = sum.get(key + "." + propertyName);
									}
									if (oo != null) {
										BigDecimal bd = new BigDecimal(oo.toString());
										bd = bd.add(new BigDecimal(data.toString()));
										sum.put(key + "." + propertyName, bd);
									}
								} catch (Exception e) {
								}
							}
							if (obj.getString("datatype").indexOf("java.util.List") != -1) {// 动态列表头
								if (data != null) {
									List<Object> olist = (List<Object>) data;
									for (int i = 0; i < olist.size(); i++) {
										map.put(key + "." + propertyName, olist.get(i));
										list.add(map);
										map = new CaseInsensitiveMap();
									}
								}
							} else {
								map.put(key + "." + propertyName, data);
							}
						}
					}

					list.add(map);
				}
			} else {
				for (Object jro : jsonArray) {
					JSONObject jo = (JSONObject) jro;
					Map<String, Object> map = new CaseInsensitiveMap();
					for (String propertyName : jo.keySet()) {
						Object data = jo.get(propertyName);
						if (sum != null && sum.size() > 0) {
							Object oo = null;
							// 兼容旧方法
							if (sum.get(propertyName) != null) {
								oo = sum.get(propertyName);
							}
							if (oo != null) {
								BigDecimal bd = new BigDecimal(oo.toString());
								bd = bd.add(new BigDecimal("".equals(data) ? "0" : data.toString()));
								sum.put(propertyName, bd);
							}
							// 兼容旧方法结束
							if (sum.get(key + "." + propertyName) != null) {
								oo = sum.get(key + "." + propertyName);
							}
							if (oo != null) {
								BigDecimal bd = new BigDecimal(oo.toString());
								bd = bd.add(new BigDecimal(data.toString()));
								sum.put(key + "." + propertyName, bd);
							}
						}
						map.put(key + "." + propertyName, data);
					}
					list.add(map);
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
			// System.out.println(e.getMessage());
		}
	}

	/**
	 * 统计记录数
	 * 
	 * @return
	 */
	public int queryExecuterRecord(DataSourceBean dataSourceBean, String sql, Object... params) {
		int record = 0;
		// if (conn != null) {
		PreparedStatement psr = null;
		ResultSet rsr = null;
		List<HashMap<String, Object>> listUtil = new ArrayList<HashMap<String, Object>>();
		try {
			sql = sql.trim().replaceAll("&quot;", "\"").replaceAll("&gt;", ">").replaceAll("&lt;", "<").replaceAll("&amp;", "&");
			if (sql.endsWith(";")) {
				sql = sql.substring(0, sql.length() - 1);
			}
			String realSql = DBUtil.printRealSql(sql, params); // 打印真实 SQL 的函数
			record = DBUtil.getDbInfoUtil(dataSourceBean).getRecord(realSql);
		} catch (Exception e) {
			e.printStackTrace();
			// System.out.println(e.getMessage());
		}
		return record;
	}

	private static String getMethodName(String fildeName) throws Exception {
		byte[] items = fildeName.getBytes();
		items[0] = (byte) ((char) items[0] - 'a' + 'A');
		return new String(items);
	}
}
