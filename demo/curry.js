/**
 * eg： f(a, b, c) -> f(a)f(b)f(c)
 */

var add = function (x) {
  return function (y) {
    return x + y
  }
}

const increment = add(1)

increment(10) // 11

/**
 * 单元函数
 */

/**
 * 部分函数应用，柯里化
 */

/**
 * 柯里化
 * f(a, b, c) -> f(a)(b)(c)
 */

/**
 * 部分函数调用  固定一定的参数，返回一个更小元的函数
 * f(a, b, c) -> f(a)(b,c) / f(a,b)(c)
 */


/**
 * 柯里化强调的是生成单元函数
 * 部分函数应用的强调的固定任意元参数
 */

/**
 * 部分函数应用的好处可以固定参数，降低函数通用性，提高函数的适合用性
 */

// 假设一个通用的 api
const request = (type, url, options) => ...
// GET 请求
request('GET','http://...')
// POST 请求
request('POST', 'http://...')

// 但是通过部分调用后，可以抽出特定 type 的 request
const get = request('GET')
get('http://', {...})

