#! /usr/bin/env node

//nodejs服务，用于提供mock文件的访问
const debug = require('debug');
const recursiveReaddirSync = require("fs-readdir-recursive");
const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const _ = require('lodash')
const path = require('path');
const {
  join,
  resolve
} = require('path');
const koaBody = require('koa-body');
const koaSlow = require('koa-slow');

const axios = require('axios');
const superagent = require('superagent');
const qs = require('qs');
const requireDirectory = require('require-directory');


require('./mock-extend');
const chokidar = require('chokidar');
const Mock = require('mockjs');

let port, projectMockDir

const app = new Koa();
const router = new Router();
const TIMEOUT = 10000;

const parseBody = koaBody({
  multipart: false, //改为false,设置为true和文件上传的中间件会有冲突
  strict: false,
  formLimit: '50mb',
  jsonLimit: '10mb',
  textLimit: '10mb',
  formidable: {
    maxFieldsSize: 50 * 1024 * 1024,
  },
});

//解析body
app.use(parseBody);


//debug info
const mock = debug('mock server info'),
  error = debug('mock server error'),
  proxy = debug('proxy server info'),
  redirect = debug('mock server redirect');

mock.enabled = true;
error.enabled = true;
proxy.enabled = true;
redirect.enabled = true;

const log = {
  mock,
  error,
  proxy,
  redirect
};
//mocks目录
const mockDir = path.resolve(__dirname, './mocks');

//map文件
const mapPath = path.resolve(__dirname, './url-map.js');
let urlMap = require('./url-map');

//字符宽度补全
function padding(str, num) {
  const paddingNum = num - str.length;
  return str + new Array(paddingNum + 1).join(' ');
}

//清空node默认模块加载缓存
function clearCache(prefix, target) {
  //若指定的文件名，只清除此文件缓存
  if (target) {
    delete require.cache[target];
    return;
  }

  const regex = new RegExp(`^${prefix}`);
  Object.keys(require.cache)
    .filter(key => regex.test(key))
    .forEach(key => {
      delete require.cache[key];
    });
}

//请求转发
function forwardRequest_bak(url, proxy, request) {
  let body = request.body,
    query = request.query;
  let headers = {
    'Content-Type': request.headers['content-type'] || 'application/x-www-form-urlencoded',
  };
  if (/^multipart/.test(headers['Content-Type'])) body = request.field;

  // console.log('url', `${proxy.url}${request.url}`);
  axios.defaults.withCredentials = true;
  return axios
    .request({
      headers: headers,
      url,
      method: request.method,
      data: qs.stringify(body),
      params: query,
      // timeout: TIMEOUT,
    })
    .then(response => {
      //请求结束
      var result = response.data;
      return result;
    })
    .catch(e => {
      const json = {
        errno: 1,
        errmsg: e.message,
      };
      return json;
    });
}

function forwardRequest(url, proxy, request) {
  // console.log('cookie', request.header.cookie);
  return new Promise((resolve, reject) => {
    const contentType = request.header['content-type'];
    let agent = superagent[request.method.toLowerCase()](url).send(request.body || request.query);
    if (contentType) {
      agent.set('Content-Type', contentType);
    }
    const cookie = proxy.cookie || request.header.cookie;
    cookie && agent.set('COOKIE', cookie);

    agent.end((err, response) => {
      let json;
      if (err || !response.ok) {
        json = {
          errno: 1,
          errmsg: err.message,
        };
      } else {
        json = response.text;
      }
      resolve(json);
    });
  });
}

// string/json -> json
function parseJson(str) {
  let result = str;
  if (typeof str === 'string') {
    try {
      result = JSON.parse(str);
    } catch (e) {
      result = str;
    }
  }
  return result;
}

//文件方式读取mock数据
function readMock(filePath) {
  let json = {
    errno: 1,
    errmsg: 'unknow error.',
  };

  try {
    const file = fs.readFileSync(mockDir);
    json = JSON.parse(file);
  } catch (e) {
    json.errmsg = e.message;
  }
}

//添加不同请求方式的的路由映射关系
const methods = ['get', 'post', 'put', 'delete'];
methods.forEach(method => {
  router[method]('*', async (ctx, next) => {
    let json = {
      errno: 1,
      errmsg: 'unknow error.'
    };
    let log_type = 'mock';
    let serverUrl;
    try {
      //清除node模块缓存
      // clearCache(path.resolve(__dirname));
      const {
        map,
        proxy,
        useMock
      } = urlMap;

      const originMocks = requireDirectory(module, mockDir);

      console.log(originMocks)

      let projectMocks = {}

      if (projectMockDir) {
        projectMocks = requireDirectory(module, projectMockDir);
      }

      const mocks = {
        ...originMocks,
        ...projectMocks
      }

      const requestPath = ctx.request.path;
      serverUrl = proxy && proxy.url || '';
      const urlPath = Object.keys(map).find(item => {
        return item.replace(/^\s+|\s$/g, '').toLowerCase() === requestPath.toLowerCase();
      });

      if (useMock && urlPath) {
        //mock映射数据存在，使用mock数据
        let distMock = map[urlPath];
        //mock数据路径配置，支持Function方式，接收请求参数为入参
        if (typeof distMock === 'function') {
          const params = Object.assign({}, ctx.request.body, ctx.request.query);
          distMock = distMock(params, ctx.request);
        }

        if (!distMock) {
          json.errmsg = `${urlPath} - invalid map config.`;
        } else {
          if (typeof distMock === 'function') {
            //解析器
            const resolve = key => mocks[key];
            json = distMock(resolve);
          } else {
            //有效url开头，转发到指定url地址
            if (/^(\s)*http(s)*:\/\/\w+/.test(distMock)) {
              log_type = 'redirect';
              json = await forwardRequest(distMock, proxy, ctx.request);
            } else {
              mocks && mocks[distMock] && (json = Mock.mock(mocks[distMock]));
            }
          }
        }
      } else {
        //mock数据不存在，若配置了服务proxy，则使用代理转发请求
        if (proxy && proxy.url) {
          log_type = 'proxy';
          json = await forwardRequest(`${proxy.url}${ctx.request.url}`, proxy, ctx.request);
        } else {
          json = {
            errno: 1,
            errmsg: `${requestPath} - Can not found the key from the url map.`,
          };
        }
      }
    } catch (e) {
      log.error(e);
      json = {
        errno: 1,
        errmsg: e.message,
      };
    }
    json = parseJson(json);

    ctx.body = json;
    //添加代理标识
    ctx.set('MOCK-SERVER', log_type);
    ctx.set('Connection', 'keep-alive');
    const paddingMethod = padding(`[${method}]`, 6);
    const type = json.errno !== 0 ? 'error' : log_type;
    const url = type === 'error' ? `${serverUrl}${ctx.request.url}` : ctx.request.href;
    log[type](`${paddingMethod} - ${url}`);
  });
});




//全局错误处理
process.env.NODE_ENV === 'production' &&
  app.on('error', err => {
    console.error(err);
  });


module.exports = function startServer(options) {
  const {
    root,
    watch,
    port,
    delay
  } = options;
  console.log("root: ", root);
  // Load (require) require-s passed in as options
  options.require.forEach(require);
  const paths = recursiveReaddirSync(root, path => Boolean(path)).map(handlerPath => join(resolve(root), handlerPath))

  projectMockDir = join(resolve(root), 'mocks')

  const projectUrlMapPath = paths.find(item => item.endsWith('url-map.js'))
  const projectMockExtendPath = paths.find(item => item.endsWith('mock-extend.js'))

  const projectUrlMap = require(projectUrlMapPath)
  require(projectMockExtendPath);
  urlMap = _.merge(urlMap, projectUrlMap);

  if (watch) {
    //监听文件变化，重新加载文件
    const watcher = chokidar.watch([mockDir, mapPath, ...paths]);

    watcher.on('change', target => {
      console.info('file changed', target);
      //清除node模块缓存
      clearCache(path.resolve(__dirname), target);
      const newUrlMap = require('./url-map.js');
      const projectUrlMap = require(projectUrlMapPath)
      urlMap = _.merge(newUrlMap, projectUrlMap);
    });
  }

  app.use(koaSlow({
    delay: urlMap.delay || delay || 0
  }));

  //使用路由配置
  app.use(router.routes());

  //应用启动与监听
  app.listen(projectUrlMap.port || port, () => log.mock(`Mock Server listen at: ${projectUrlMap.port || port}.`));
}
