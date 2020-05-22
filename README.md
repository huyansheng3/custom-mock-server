## custom-mock-server

一个比较方便的自定义 mock 服务，内置 mockjs/cookie/proxy/delay 等功能

## install

`dnpm i custom-mock-server --save-dev`

in package.json scripts, `"start": "cmock & vue-cli-service serve",` or `npx cmock` in command line.

```
 "scripts": {
    "start": "cmock & vue-cli-service serve",
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint",
  },
```

## document

You can add mock-server directory in the root project.

```
mock-server
├── mock-extend.js
├── mocks
│   └── mock-data.js
└── url-map.js
```

### add custom config by url-map.js

```
/**
 * 请求url与mock数据映射关系
 *
 * @format
 */

//代理转发配置信息 - 不使用mock数据时，转发到的目标服务地址
const proxy = {
  // url: '',
  // cookie: '',
};

//使用mock数据开关配置
const useMock = true;

// mock数据映射关系
// key 为请求地址，以绝对路径 '/' 开头，不区分大小写
// value类型支持两种方式：
//  - 字符类型
//		- 1. 以 http、https开头的字符串，请求转发到目标url
//   	- 2. 普通字符串，自动mock为 './mocks' 目录下文件名(区分大小写)
//  - Function类型，第一个入参为http请求参数，第二个为request对象
//      - 1. 当Function返回值为字符时，自动mock为 './mocks' 目录下文件名(区分大小写)
//      - 2. 当Function返回值为匿名Function时，参数resolve为一个可解析 './mocks' 目录下文件名的解析器，接收文件名为入参
//          resolve返回值为对应的mock数据，可自由对数据进行二次处理，返回最终数据
const map = {
  //接口列表
  '/': 'custom-mock-server-home',
  '/service/api-list': 'api-list',
};

module.exports = {
  // 代理服务器的url和cookie
  proxy,
  // 映射关系
  map,
  // 是否应该使用mock数据
  useMock,
  // 端口号
  port: 9222,
  // 接口延迟时间
  delay: 2000
};
```

### add custom mock helper by mock-extend.js

```
/** @format */

const Mock = require('mockjs');
const { Random } = Mock;

Random.extend({
	direction: function(date) {
		const directions = ['北直', '南直', '北左', '东左', '东直', '南左', '西左', '西直'];
		return this.pick(directions);
	},
});

module.exports = Mock;
```

### write mocks file

use the mockjs DSL, [detail info](https://github.com/nuysoft/Mock/wiki/Getting-Started)

mock-data.js

```
module.exports = {
	code: 0,
	'data|20': [
		{
			alarmid: '@id',
			alarmtime: '@datetime',
			alarmperson: '@cname',
			alarmpersontel: /\d{11}/,
			'eventtype|1': ['交通事故', '撞车', '追尾'],
			'eventthintype|1': ['事件细类1', '事件细类2', '事件细类3'],
			alarmdesc: '@cparagraph',
			alarmaddress: '@county(true)',
			'disposeregionname|1': ['历下大队', '城西大队'],
			'detachregionname|1': ['历下一中队', '历下二中队', '历下三中队'],
		},
	],
}
```
