package io.report.modules.rdp.controller;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

/*
 * 报表设计相关
 */
@Controller
@RequestMapping("/rdppage")
public class RdpPageController {
	protected Logger logger = LoggerFactory.getLogger(getClass());
	@Value("${report.rdp.iscellauto}")
	private int iscellauto;

	@RequestMapping("/designShow")
	public String designShow(Map<String, Object> map, HttpServletRequest request) {
		List<Map<String, Object>> hideItems = new ArrayList<Map<String, Object>>();
		Map paraMap = request.getParameterMap();
		Set keSet = paraMap.entrySet();
		for (Iterator itr = keSet.iterator(); itr.hasNext();) {
			Map.Entry me = (Map.Entry) itr.next();
			Object ok = me.getKey();
			Object ov = me.getValue();
			String[] value = new String[1];
			if (ov instanceof String[]) {
				value = (String[]) ov;
			} else {
				value[0] = ov.toString();
			}

			for (int k = 0; k < value.length; k++) {
				// System.out.println(ok+"="+value[k]);
				if (!"reporttype".equals(ok) && !"uuid".equals(ok)) {
					// 将参数附加到form#btnSearch

					Map<String, Object> item = new HashMap<String, Object>();
					item.put("name", ok);
					try {
						item.put("value", URLDecoder.decode(value[k],"utf-8"));
					} catch (UnsupportedEncodingException e) {
						e.printStackTrace();
					}
					hideItems.add(item);
				}
			}
		}

		map.put("hideitems", hideItems);
		return "modules/rdp/designShow";
	}

	@RequestMapping("/main/{uuid}")
	public String showMain(Map<String, Object> map, HttpServletRequest request, @PathVariable("uuid") String uuid) {
		List<Map<String, Object>> hideItems = new ArrayList<Map<String, Object>>();
		Map paraMap = request.getParameterMap();
		Set keSet = paraMap.entrySet();
		for (Iterator itr = keSet.iterator(); itr.hasNext();) {
			Map.Entry me = (Map.Entry) itr.next();
			Object ok = me.getKey();
			Object ov = me.getValue();
			String[] value = new String[1];
			if (ov instanceof String[]) {
				value = (String[]) ov;
			} else {
				value[0] = ov.toString();
			}

			for (int k = 0; k < value.length; k++) {
				// System.out.println(ok+"="+value[k]);
				if (!"reporttype".equals(ok) && !"uuid".equals(ok)) {
					// 将参数附加到form#btnSearch

					Map<String, Object> item = new HashMap<String, Object>();
					item.put("name", ok);
					try {
						item.put("value", URLDecoder.decode(value[k],"utf-8"));
					} catch (UnsupportedEncodingException e) {
						e.printStackTrace();
					}
					hideItems.add(item);
				}
			}
		}

		map.put("hideitems", hideItems);
		map.put("uuid", uuid);
		return "modules/rdp/main";
	}

	@RequestMapping("/show")
	public String show(Map<String, Object> map, HttpServletRequest request) {
		List<Map<String, Object>> hideItems = new ArrayList<Map<String, Object>>();
		Map paraMap = request.getParameterMap();
		Set keSet = paraMap.entrySet();
		for (Iterator itr = keSet.iterator(); itr.hasNext();) {
			Map.Entry me = (Map.Entry) itr.next();
			Object ok = me.getKey();
			Object ov = me.getValue();
			String[] value = new String[1];
			if (ov instanceof String[]) {
				value = (String[]) ov;
			} else {
				value[0] = ov.toString();
			}

			for (int k = 0; k < value.length; k++) {
				// System.out.println(ok+"="+value[k]);
				if (!"reporttype".equals(ok) && !"uuid".equals(ok)) {
					// 将参数附加到form#btnSearch

					Map<String, Object> item = new HashMap<String, Object>();
					item.put("name", ok);
					item.put("value", value[k]);
					hideItems.add(item);
				}
			}
		}

		String cellauto = String.valueOf(iscellauto);// 单独格自动宽度
		String iscellauto_parm = request.getParameter("iscellauto");
		if (iscellauto_parm != null && ("0".equals(iscellauto_parm) || "1".equals(iscellauto_parm))) {
			cellauto = iscellauto_parm;
		}
		map.put("cellauto", cellauto);
		map.put("hideitems", hideItems);
		map.put("uuid", "");
		return "modules/rdp/show";
	}

	@SuppressWarnings("deprecation")
	@RequestMapping("/show/{uuid}")
	public String show(Map<String, Object> map, HttpServletRequest request, @PathVariable("uuid") String uuid) {
		List<Map<String, Object>> hideItems = new ArrayList<Map<String, Object>>();
		Map paraMap = request.getParameterMap();
		Set keSet = paraMap.entrySet();
		for (Iterator itr = keSet.iterator(); itr.hasNext();) {
			Map.Entry me = (Map.Entry) itr.next();
			Object ok = me.getKey();
			Object ov = me.getValue();
			String[] value = new String[1];
			if (ov instanceof String[]) {
				value = (String[]) ov;
			} else {
				value[0] = ov.toString();
			}

			for (int k = 0; k < value.length; k++) {
				// System.out.println(ok+"="+value[k]);
				if (!"reporttype".equals(ok) && !"uuid".equals(ok)) {
					// 将参数附加到form#btnSearch

					Map<String, Object> item = new HashMap<String, Object>();
					item.put("name", ok);
					item.put("value", value[k]);
					hideItems.add(item);
				}
			}
		}
		String cellauto = String.valueOf(iscellauto);// 单独格自动宽度
		String iscellauto_parm = request.getParameter("iscellauto");
		if (iscellauto_parm != null && ("0".equals(iscellauto_parm) || "1".equals(iscellauto_parm))) {
			cellauto = iscellauto_parm;
		}
		map.put("cellauto", cellauto);
		map.put("hideitems", hideItems);
		map.put("uuid", uuid);
		return "modules/rdp/show";
	}
	
	@SuppressWarnings("deprecation")
	@RequestMapping("/custom/{uuid}")
	public String custom(Map<String, Object> map, HttpServletRequest request, @PathVariable("uuid") String uuid) {
		List<Map<String, Object>> hideItems = new ArrayList<Map<String, Object>>();
		Map paraMap = request.getParameterMap();
		Set keSet = paraMap.entrySet();
		for (Iterator itr = keSet.iterator(); itr.hasNext();) {
			Map.Entry me = (Map.Entry) itr.next();
			Object ok = me.getKey();
			Object ov = me.getValue();
			String[] value = new String[1];
			if (ov instanceof String[]) {
				value = (String[]) ov;
			} else {
				value[0] = ov.toString();
			}
			for (int k = 0; k < value.length; k++) {
				if (!"reporttype".equals(ok) && !"uuid".equals(ok)) {
					Map<String, Object> item = new HashMap<String, Object>();
					item.put("name", ok);
					try {
						item.put("value", URLDecoder.decode(value[k],"utf-8"));
					} catch (UnsupportedEncodingException e) {
						e.printStackTrace();
					}
					hideItems.add(item);
				}
			}
		}
		map.put("hideitems", hideItems);
		map.put("uuid", uuid);
		return "modules/rdp/custom";
	}

	@RequestMapping("/view")
	public String view(Map<String, Object> map, HttpServletRequest request) {
		String cellauto = String.valueOf(iscellauto);// 单独格自动宽度
		String iscellauto_parm = request.getParameter("iscellauto");
		if (iscellauto_parm != null && ("0".equals(iscellauto_parm) || "1".equals(iscellauto_parm))) {
			cellauto = iscellauto_parm;
		}
		map.put("cellauto", cellauto);
		return "modules/rdp/view";
	}
}
