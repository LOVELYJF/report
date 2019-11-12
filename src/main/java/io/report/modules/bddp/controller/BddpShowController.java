package io.report.modules.bddp.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import com.pro.encryption.entrance.report.loader.RDPCoreContext;

import cn.hutool.http.HttpRequest;
import io.report.common.utils.R;
import io.report.common.utils.ServerUtil;
import io.report.modules.bddp.entity.BddpConstant;

@RestController
@RequestMapping("/bddpshow")
public class BddpShowController {

	protected Logger logger = LoggerFactory.getLogger(getClass());
	@Value("${report.bddp.path}")
	private String bddppath;
	@Value("${report.relative-path}")
	private Boolean relativePath;
	@Value("${report.bddp.timeout}")
	private Integer timeout;
	@Autowired
	HttpServletRequest rq;
	@Autowired
	HttpServletResponse rp;

	@RequestMapping("/show/{i}")
	public void show(@PathVariable("i") String i) throws Exception {
		logger.info("正在打开大屏幕报表：" + i);
		List<Map<String, String>> list = BddpController.getFoldersList(new File(ServerUtil.getDataPath(relativePath, bddppath, BddpConstant.BDDPFILE_PATH)));
		for (Map<String,String> map:list) {
			String name = map.get("name");
			if (name.equals(i)){
				RDPCoreContext.html(rp, ServerUtil.getDataPath(relativePath, bddppath, BddpConstant.BDDPFILE_PATH), i);
			}else{
				logger.info("未查询到" + i + "报表");
			}
		}
	}

	@RequestMapping("/bgi/{i}")
	public void bgi(@PathVariable("i") String i) throws Exception {
		RDPCoreContext.png(rq, rp, ServerUtil.getDataPath(relativePath, bddppath, BddpConstant.BDDPFILE_PATH), i);
	}

	@RequestMapping("/test")
	public void test() throws Exception {
		Resource resource = new ClassPathResource("statics/bddp/expand");
		File baseFile = new File(resource.getURL().getPath() + File.separator + "css");
		List<String> list = new ArrayList<String>();
		if (baseFile.isFile() || !baseFile.exists()) {
			System.out.println("空文件夹");
		}
		File[] files = baseFile.listFiles();
		for (File file : files) {
			if (file.isFile()) {
				System.out.println(file.getName());
				System.out.println(file.getPath());
				//list.add(file.getAbsolutePath());
			}
		}
	}

	/**
	 * 取所有的字段
	 * 
	 * @param url
	 *            服务地
	 * @return
	 */
	@RequestMapping(value = "/getJSONDataByUrl", method = { RequestMethod.GET, RequestMethod.POST })
	public R getJSONDataByUrl(@RequestParam("url") String url) {
		String result = "";
		try {
			url = url.replace("&amp;", "&");
			result = HttpRequest.get(url).header("Accept", "application/json, */*").contentType("application/json").timeout(timeout).execute().body();
			logger.debug("请求:" + url + "返回的结果");
			logger.debug(result);
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
}
