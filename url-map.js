/**
 * 请求url与mock数据映射关系
 *
 * @format
 */

//代理转发配置信息 - 不使用mock数据时，转发到的目标服务地址
const proxy = {
  // url: 'http://100.90.164.31:8088',
  // url: 'https://sts.didichuxing.com/signalpro/api',
  // cookie: 'ticket=1f4bef32e8677293593523ca8a0379ef000789000;username=18910777846',
  // cookie: 'ticket=0fd19ae0c91a861cd679ffde1a2767f6000789000;username=18910943570',
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
  proxy,
  map,
  useMock,
};
