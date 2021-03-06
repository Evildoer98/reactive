# 特性
1. 函数是”第一等公民“
  函数与其他数据类型一样，处于平等地位，可以赋值给其他变量，也可以作为参数，传入另一个函数，或者作为别的函数的返回值
  ```js
    var print = function(i) {
      console.log(i)
    }
    [1, 2, 3].forEach(print)
  ```

2. 只用“表达式”，不用“语句”
  1. 表达式（expression）是一个单纯的运算过程，总是有返回值
  2. 语句（statement）是执行某种操作，没有返回值。
  3. 函数式编程，只使用表达式，不使用语句。每一步都是单纯的运算，而且都有返回值

3. 没有“副作用”
  1. 函数内部和外部互动（最典型的情况，就是修改全局变量的值），产生运算以外的其他结果
  2. 函数式编程强调没有“副作用”，意味着函数要保持独立，所有功能就是返回一个新的值，没有其他行为，尤其是不得改变外部变量的值

4. 不修改状态
  1. 函数式编程只是返回新的值，不修改系统变量
  2. 在其他类型的语言中，变量往往用来保存“状态”（state）。不修改变量，意味着状态不能保存在变量中。
  3. 函数式编程使用参数保存状态
  * eg：
    ```js
      function reverse(string) {
        if (string.length === 0) {
          return string
        } else {
          return reverse(string.substring(1, string.length)) + string.substring(0, 1)
        }
      }
    ```

5. 引用透明
  1. 引用透明（referential transparency），指的是函数的运行不依赖于外部变量或“状态”，只依赖于输入的参数，任何时候只要参数相同，引用函数说的到的返回值总是相同的

# 意义
1. 代码简洁，开发快速
2. 接近自然语言，易于理解
  eg：（1+2）* 3 -4
    subtract(multiply(add(1,2),3),4)
    add(1,2).multiply(3).subtract(4)
    merge([1,2],[3,4]).sort().search("2")
3. 便于代码管理
  函数式编程不依赖、也不回改变外界的状态，只要给定输入参数，返回的结果必定相同。因此，每一个函数都可以被看作独立单元，很利于单元测试（unit testing）和除错（debugging），以及模块化组合
4. 易于“并发编程”
  函数式编程不需要考虑“死锁”（deadlock），因为它不修改变量，所以根本不存在“锁”线程的问题。不必担心一个线程的数据，被另一个线程修改，所以可以将工作分摊到多个线程，部署“并发编程”（concurrency）
  https://www.ruanyifeng.com/blog/2012/04/functional_programming.html
5. 代码的热升级
  函数式编程没有副作用，只要保证接口不变，内部实现是外部无关的。所以，可以在运行状态下直接升级代码，不需要重启，也不需要停机