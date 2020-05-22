module.exports = {
  port: 9222,
  proxy: {
    // url
    // cookie
  },
  useMock: true,
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
  map: {
    '/mock-server': 'mock-server',
  },
  delay: 200,
}
