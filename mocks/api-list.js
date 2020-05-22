const data = require('./jinan-model.json');
module.exports = data;

// module.exports = {
// 	errno: 0,
// 	errmsg: '',
// 	'data|10-20': [
// 		{
// 			path: '/api/@word(5)',
// 			'method|1': ['POST', 'GET'],
// 			title: '基础查询接口: @word(5)',
// 			description: '基础查询接口详细描述:@cparagraph(1)',
// 			request: {
// 				header: {
// 					'Content-Type': 'application/json',
// 					authCode: 'a8de7poi412mez==',
// 				},
// 				'query|2-8': [
// 					{
// 						key: '@word(5)',
// 						value: '@word(5, 10)',
// 						'required|8-1': true,
// 						other_values: ['test-user1', 'test-user2'],
// 						description: '姓名@word(3)',
// 					},
// 				],
// 				body: [
// 					{
// 						key: 'username',
// 						value: 'test-user',
// 						'type|1': ['String', 'Boolean', 'Number', 'JSON'],
// 						'required|8-1': true,
// 						other_values: ['test-user1', 'test-user2'],
// 						description: '姓名@word(3)',
// 					},
// 					{
// 						key: 'LJJF',
// 						value: {
// 							start: 12,
// 							end: 99,
// 						},
// 						type: 'json',
// 						required: true,
// 						description: '累计积分',
// 					},
// 				],
// 			},
// 			response: [
// 				{
// 					key: 'status',
// 					value: 0,
// 					type: 'int',
// 					description: '状态码 0 无问题， 1有问题',
// 				},
// 				{
// 					key: 'errormsg',
// 					value: 'success',
// 					type: 'string',
// 					description: '相关错误信息',
// 				},
// 				{
// 					key: 'time',
// 					value: 'success',
// 					type: 'int',
// 					description: '处理时间',
// 				},
// 				{
// 					key: 'data',
// 					value: {
// 						users: [
// 							{
// 								name: 'test-user',
// 							},
// 						],
// 					},
// 					type: 'json',
// 					description: '返回数据结果',
// 				},
// 			],
// 		},
// 	],
// };
