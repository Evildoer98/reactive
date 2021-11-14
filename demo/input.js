const observable = Rx.Observable.fromEvent(input, "input") // 监听 input 元素的 input 事件
    .map((e) => e.target.value)  // 一旦发生，把事件对象 e 映射成 input 元素的值
    .filter((value) => value.length >= 1) // 接着过滤掉长度小于 1 的
    .distinctUntilChanged() // 如果该值和过去最新的值相等，则忽略
    .subscribe(
      // subscribe 拿到数据
      (x) => console.log(x),
      (err) => console.log(err) 
    )

// 订阅
observable.subscribe((x) => console.log(x))