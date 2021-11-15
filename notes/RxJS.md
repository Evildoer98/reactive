1. 视图更新过程
网页视图     正确的响应      相关事件
View     = reactionFn     (Event)


WebView   ---------->    Computer    <---------->    RemoteServer
          User Event       Timer      Remote API

        --------------- reactionFn ------------------

View = reactive(UserEvent | Timer | Remote API)

1. 定义源数据流
  User Event 
  Interval
  Remote API

2. 创建刷新数据流
  转换/创建中间数据流

3. 获取视图数据流


1. 描述源数据流 eventStream
  User Event: fromEvent
  Timer: interval, timer
  Remote API: fromFetch，webSocket

2. 组合/转换数据流 middleStream/viewStream
  COMBINING: merge,combineLatest,zip
  MAPPING: map
  FILTERING: filter
  REDUCING: reduce, max, count, scan
  TAKING: take, takeWhile
  SKIPPING: skip, skipWhile, takeLast, last
  TIME: delay, debounceTime, throttleTime

3. 消费数据流更新数据 updateView
  subscribe
  async pipe


# RxJS
1. 异步事件定义：描述事件本身，而非描述计算过程、或中间状态
2. 事件组合与转换：提供了复用事件（持续变化数据）的方法
3. 可以精确追踪数据变化的来源
                      找到                             做出
      所有事件     -------------->       相关事件   -------------->    响应
         |
         |
按时间顺序发生的事件 = 数据流
         |
         |  
    定义源数据流                        组合/转换源数据流               消费数据流


* 事件乱序
  事件事件：Event Time   Processing time

* HTTP请求数据   ->  转化为数据源  -> 多个订阅者 -> 多个数据流

1. 响应式编程常用在异步数据流
2. 通过订阅某个数据流，可以对数据进行一系列流式处理 （过滤、计算、转换、合流等）
3. 高并发、分布式、依赖解耦

## 概念
### Observable(可观察对象): 表示一个可调用的未来值或事件的集合
  1. 能被多个 observer 订阅，每个订阅关系相互独立、互不影响
  2. eg:
    ```js
      const Rx = require('rxjs/Rx')

      const myObservable = Rx.Observable.create(observer => {
        observer.next('foo');
        setTimeout(() => observer.next('bar'), 1000);
      });
    ```

### Observer(观察者): 监听由 Observable 提供的值
  1. 回调函数集合，知道如何去监听 Observable 提供的值
  2. Observer 在信号流中是一个观察者（哨兵）的角色，它负责观察任务执行的状态并向流中发送信号
  3. eg:
    ```js
      const observer = {
        next: function(value) {
          console.log(value);
        },
        error: function(error) {
          console.log(error)
        },
        complete: function() {
          console.log('complete')
        }
      }
    ```
  4. eg: 直接使用subscribe方法让一个observer订阅一个Observable，
    ```js
      const myObservable = Rx.Observable.create((observer) => {
        observer.next('111')
        setTimeout(() => {
            observer.next('777')
        }, 3000)
      })

      myObservable.subscribe((text) => console.log(text));
    ```
  5. subscribe的函数定义实现订阅的
    ```ts
      subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
    ```

### Subscription(订阅者)与Subject: 表示 Observable 的执行，用于取消 Observable 的执行
#### Subscription
1. Subscription 表示 Observable 的执行，可以被清理，
2. 这个对象常用方法 unsubscribe，无参数，清理由 Subscription 占用的资源。同时还有 add 方法可以取消多个订阅
3. eg:
    ```js
      const myObservable = Rx.Observable.create(observer => {
        observer.next('foo');
        setTimeout(() => observer.next('bar'), 1000);
      });
      const subscription = myObservable.subscribe(x => console.log(x));
      // 稍后：
      // 这会取消正在进行中的 Observable 执行
      // Observable 执行是通过使用观察者调用 subscribe 方法启动的
      subscription.unsubscribe();
    ```

#### Subject(主体)
1. 代理对象，既是一个 Observable 又是一个 Observer
2. 同时接受 Observable 发射出的数据，也可以向订阅了它的 observer 发射数据
3. Subject 会对内部的 observers 清单进行多播
* Subjects 是将任意 Observable 执行共享给多个观察者的唯一方式
##### 单播
1. 每个普通的 observables 实例都只能被一个观察者订阅，当他被其他订阅者订阅的时候会产生一个新的实例
2. 普通 observables 被不同的观察者订阅的时候，会有多个实例。
3. 不管观察者从何时开始订阅，每个实例都是从头开始把值从头开始把值发给对应的观察者
* eg: 
  ```js
    const Rx = require('rxjs/Rx')

    const source = Rx.Observable.interval(1000).take(3);

    source.subscribe((value) => console.log('A ' + value))

    setTimeout(() => {
        source.subscribe((value) => console.log('B ' + value))
    }, 1000)

    // A 0
    // A 1
    // B 0
    // A 2
    // B 1
    // B 2
  ```

##### 多播
1. 不论什么时候订阅只会收到实时的数据的功能
* eg:
  ```js
    const source = Rx.Observable.interval(1000).take(3);

    const subject = {
      observers: [],
      subscribe(target) {
        this.observers.push(target);
      },
      next: function(value) {
        this.observers.forEach((next) => next(value))
      }
    }

    source.subscribe(subject);

    subject.subscribe((value) => console.log('A ' + value))

    setTimeout(() => {
      subject.subscribe((value) => console.log('B ' + value))
    }, 1000)

    // A 0
    // A 1
    // B 1
    // A 2
    // B 2
  ```
  * 中间商subject来订阅source，这样便做到了统一管理，以及保证数据的实时性，因为本质上对于source来说只有一个订阅者。
  * 可以直接换成 RxJS 中 Subject
  ```js
    const source = Rx.Observable.interval(1000).take(3);

    const subject = new Rx.Subject();

    source.subscribe(subject);

    subject.subscribe((value) => console.log('A ' + value))

    setTimeout(() => {
      subject.subscribe((value) => console.log('B ' + value))
    }, 1000)
  ```

##### BehaviorSubject
1. 在有新的订阅时会额外发出最近一次发出的值的 Subject
2. eg: 普通 Subject
  ```js
    const subject = new Rx.Subject();

    subject.subscribe((value) => console.log('A：' + value))

    subject.next(1);
    // A：1
    subject.next(2);
    // A：2

    setTimeout(() => {
      subject.subscribe((value) => console.log('B：' + value)); // 1s后订阅，无法收到值
    }, 1000)
  ```
3. eg: BehaviorSubject
  ```js
    const subject = new Rx.BehaviorSubject(0); // 需要传入初始值

    subject.subscribe((value: number) => console.log('A：' + value))
    // A：0
    subject.next(1);
    // A：1
    subject.next(2);
    // A：2

    setTimeout(() => {
      subject.subscribe((value: number) => console.log('B：' + value))
      // B：2
    }, 1000)
  ```
* 在实例化BehaviorSubject的时候需要传入一个初始值

##### ReplaySubject
1. 会保存所有值，然后回放给新的订阅者，同时提供了入参用于控制重放值的数量（默认重发所有）
2. eg: 
  ```js
    const subject = new Rx.ReplaySubject(2);

    subject.next(0);
    subject.next(1);
    subject.next(2);

    subject.subscribe((value: number) => console.log('A：' + value))
    // A：1
    // A：2

    subject.next(3);
    // A：3
    subject.next(4);
    // A：4

    setTimeout(() => {
      subject.subscribe((value: number) => console.log('B：' + value))
      // B：3
      // B：4
    }, 1000)

    // 整体打印顺序：
    // A：1
    // A：2
    // A：3
    // A：4
    // B：3
    // B：4
  ```

##### AsyncSubject
1. 只有当 Observable 执行完成时（执行 complete()），它才会将执行的最后一个值发送给观察者。
2. 如果异常而终止，AsyncSubject 将不回释放任何数据，但是会向 Observer 传递一个异常通知
3. eg:
  ```js
    const subject = new Rx.AsyncSubject();
    subject.next(1);
    subject.subscribe(res => {
      console.log('A:' + res);
    });
    subject.next(2);
    subject.subscribe(res => {
      console.log('B:' + res);
    });
    subject.next(3);
    subject.subscribe(res => {
      console.log('C:' + res);
    });
    subject.complete();
    subject.next(4);

    // 整体打印结果：
    // A:3
    // B:3
    // C:3
  ```

## 热观察与冷观察
### 冷观察 Cold Observables
1. Cold Observable，可以理解为点播电影，打开时从头播放
2. Cold Observable 只有被 observers 订阅的时候，才会开始产生值
3. 是单播的，有多少订阅就会生成多少个订阅实例
4. 每个订阅都是从第一个产生的值开始接收值，所以每一个订阅接收到的值都是一样的
5. 正如单播描述的能力，不管观察者们什么时候开始订阅，源对象都会从初始值开始把所有的数都发给该观察者。
* eg: 冷观察
  ```js
    let liveStreaming$ = Rx.Observable.interval(1000).take(5)

    liveStreaming$.subscribe(
      data => console.log('subscriber from first second')
      err => console.log(err)
      () => console.log('completed')
    )

    setTimeout(() => {
      liveStreaming$.subscribe(
        data => console.log('subscriber from 2nd second')
        err => console.log(err)
        () => consloe.log('completed')
      )
    }, 2000)
    // 两个订阅者收到的是0,1,2,3,4
  ```

### 热观察 Hot Observables
1. Hot Observable，可以理解为现场直播，只能看到即时内容
2. 不管有没有被订阅都会产生值
3. 是多播的，多个订阅共享一个实例
4. 是从订阅开始接收到值，每个订阅者接收到的值是不同的，取决于它们从什么时候开始订阅
* eg: 热观察
  ```js
    let publisher$ = Rx.Observable.interval(1000).take(5).publish

    publisher$.subscribe(
      data => console.log('subscriber from first second')
      err => console.log(err)
      () => console.log('completed')
    )

    setTimeout(() => {
      publisher$.subscribe(
        data => console.log('subscriber from 2nd second')
        err => console.log(err)
        () => consloe.log('completed')
      )
    }, 2000)
    // 第一个订阅者收到 0,1,2  第二个订阅者收到 3,4
  ```
5. eg: 用Rx的操作符of创建了一个Observable，并且后面跟上了一个publish函数，在创建完之后调用connect函数进行开始数据发送
  ```js
    const source = Rx.Observable.of(1, 2).publish();
    source.connect();
    source.subscribe((value) => console.log('A：' + value));
    setTimeout(() => {
      source.subscribe((value) => console.log('B：' + value));
    }, 1000);
    // 如果把connect方法放到最后，那么最终的结果就是A接收到了，B还是接不到，因为A在开启发数据之前就订阅了，而B还要等一秒
  ```
  * 执行结果就是没有任何数据打印出来
  * 由于开启数据发送的时候还没有订阅，并且这是一个Hot Observables，它是不会理会你是否有没有订阅它，开启之后就会直接发送数据，所以A和B都没有接收到数据。
6. eg: 
  ```js
    const source = Rx.Observable.interval(1000).take(3).publish();
    source.subscribe((value: number) => console.log('A：' + value));
    setTimeout(() => {
      source.subscribe((value: number) => console.log('B：' + value));
    }, 3000);
    source.connect();

    // A：0
    // A：1
    // A：2
    // B：2
    // 利用interval配合take操作符每秒发射一个递增的数，最多三个，然后这个时候的打印结果就更清晰了，A正常接收到了三个数，B三秒之后才订阅，所以只接收到了最后一个数2，
  ```
7. 引用计数: 用到了publish结合refCount实现一个“自动挡”的效果(监听到有订阅者订阅了才开始发送数据，一旦所有订阅者都取消了，那么就停止发送数据)
  ```js
    // refCount
    const source = Rx.Observable.interval(1000).take(3).publish().refCount();
    setTimeout(() => {
      source.subscribe(data => { console.log("A：" + data) });
      setTimeout(() => {
        source.subscribe(data => { console.log("B：" + data) });
      }, 1000);
    }, 2000);

    // A：0
    // A：1
    // B：1
    // A：2
    // B：2

    /**
     * 只有当A订阅的时候才开始发送数据（A拿到的数据是从0开始的），并且当B订阅时，也是只能获取到当前发送的数据，而不能获取到之前的数据。
     * 这种“自动挡”当所有订阅者都取消订阅的时候它就会停止再发送数据了
     */
  ```
* 操作符解析
  1. 创建 Hot Observables 时用到 publish 和 connect 函数的结合，调用 publish 操作符之后返回的是一个 ConnectableObservable，然后该对象上提供了 connect 方法控制发送数据的时间
    1. publish: 这个操作符把真诚的 Observable （Cold Observables）转换成 ConnectableObservable
    2. ConnectableObservable：ConnectableObservable 是多播的共享 Observable，可以同时被多个 observers 共享订阅，它是 Hot Observables。ConnectableObservable 是订阅者和真正的源头的中间人，ConnectableObservable 从源头 Observables 接收到值然后再把值转发给订阅者
    3. connect(): ConnectableObservable 并不会主动发送值，它有个 connect方法，通过调用 connect 方法，可以启动共享 ConnectableObservable 发送值。当我们调用 ConnectableObservable.prototype.connect 方法，不管有没有被订阅，都会发送值。订阅者共享同一个实例，订阅者接收到的值取决于它们何时开始订阅。
## Schedulers(调度器)
* 用来控制并发并且是中央集权的调度员，允许在发生计算时进行协调。eg: setTimeout 或 request AnimationFrame 等等
  1. 调度器是一种数据结构。知道如何根据优先级或其他标准来存储任务和将任务进行排序
  2. 调度器是执行上下文。表示在何时何地执行任务
  3. 调度器有一个(虚拟的)时钟。调度器功能通过它的 getter 方法 now() 提供了“时间”概念。在具体调度器上安排的任务将严格遵循该始终所表示的时间
  * 有同步也有异步，却没有显示的控制他们的执行。内部的调度就是靠的Schedulers来控制数据发送的时机，许多操作符会预设不同的Scheduler，所以我们不需要进行特殊处理他们就能良好的进行同步或异步运行
    ```js
      const source = Rx.Observable.create(function (observer: any) {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.complete();
      });

      console.log('订阅前');
      source.observeOn(Rx.Scheduler.async) // 设为 async
      .subscribe({
          next: (value) => { console.log(value); },
          error: (err) => { console.log('Error: ' + err); },
          complete: () => { console.log('complete'); }
      });
      console.log('订阅后');

      // 订阅前
      // 订阅后
      // 1
      // 2
      // 3
      // complete
    ```
### queue
1. 将每个下一个任务放在任务队列中，而不是立即执行
* queue 延迟使用调度程序时，其行为与 async 调度程序相同
2. 当没有延迟使用时，它将同步安排给定的任务--在安排好的任务后立即执行。但是，当递归调用时(即在已调度的任务的任务内部)，将使用队列调度程序调度另一个任务，而不是立即执行，将该任务放入队列并等待当前任务完成
* eg:
  ```js
    import { queueScheduler } from 'rxjs';
    queueScheduler.schedule(() => {
      queueScheduler.schedule(() => console.log('second'));

      console.log('first');
    });
    // first
    // second
  ```
### asap
* 内部基于 Promise 实现( Node 端采用 process.nextTick)，会使用可用的最快的异步传输机制。如果不支持 Primise 或 process.nextTick 或 Web Worker 的 MessageChannel 也可能会调用 setTimeout 方式进行调度

### async
* 与 asap 方式很像，只不过内部采用 setInterval 进行调度，大多用于基于时间的操作符

### animationFrame
* 内部基于 requestAnimationFrame 来实现调度，所以执行的时机将 window.requestAnimationFrame 保持一致，适用于需要频繁渲染或操作动画的场景


## Operators(操作符): 采用函数式编程风格的纯函数(pure function)，使用 map、filter、concat、flatMap 等操作处理集合
* eg:
  ```js
    var button = document.querySelector('button')
    Rx.Observable.fromEvent(button, 'click')
      .throttleTime(1000)
      .map(event => event.clientX)
      .scan((count, clientX) => count + clienX, 0)
      .subscribe(count => console.log(count))
  ```
### 概念
1. 采用函数式编程风格的纯函数(pure function)，使用像 map、filter、concat、flatMap 等这样的操作符来处理集合
2. 纯函数定义，使得调用任意的操作符时都不回改变已存在的 Observable 实例，而是会在原有的基础上返回一个新的 Observable
* RxJS 的根基时 Observable，操作符是允许复杂异步的一步代码以声明式的方式进行基础代码单元
#### 实现简易 Operator
* eg: filter
  ```js
    function filter(source, callback) {
      return Rx.Observable.create(((observer) => {
        source.subscribe (
          (v) => callback && observer.next(v)
          (err) => observer.error(err)
          (complete) => observer.complete(complete)
        )
      }))
    }

    const source = Rx.Observable.interval(1000).take(3)
    filter(source, (value) => value < 2).subscribe((value) => console.log(value))
    // 0
    // 1
  ```
* eg: 可以直接挂载到 prototype
  ```js
    Rx.Observable.prototype.filter = function (callback) {
      return Rx.Observable.create(((observer) => {
          this.subscribe(
              (v) => callback(v) && observer.next(v),
              (err) => observer.error(err),
              (complete) => observer.complete(complete)
          );
      }))
    }
    Rx.Observable.interval(1000).take(3).filter((value) => value < 2).subscribe((value) => console.log(value));

    // 0
    // 1
  ```

#### 实例操作符-静态操作符
1. 实例操作符: 通常是能被实例化的对象直接调用的操作符。eg: filter、map、concat，还能维持链式调用
2. 静态操作符: Observable 是一个 class 类，可以直接把操作符挂载到静态属性上
  1. 好处: 在于无需实例化即可调用
  2. 缺点: 无法再使用 this 的方式进行目标对象调用，而是需要把目标对象传入
  * eg: 将 filter 挂载到静态属性上
    ```js
      Rx.Observable.filter = (source, callback) => {
        return Rx.Observable.create(((observer) => {
            source.subscribe(
                (v) => callback(v) && observer.next(v),
                (err) => observer.error(err),
                (complete) => observer.complete(complete)
            );
        }))
      }
    ```

### 创建型 Operators
#### create
```ts
  public static create(onSubscription: function(observer: Observer): TeardownLogic): Observable
```
* create 将 onSubscription 函数转化为一个实际的 Observable。每当有人订阅该 Observable 的时候，onSubscription 函数会接收 Observer 实例作为唯一参数执行，onSubscription 应该调用观察者对象的 next、error 和 complete 方法
  ```js
    const source = Rx.Observable.create(((observer: any) => {
      observer.next(1);
      observer.next(2);
      setTimeout(() => {
          observer.next(3);
      }, 1000)
    }))

    // 方式一
    source.subscribe(
        {
            next(val) {
                console.log('A：' + val);
            }
        }
    );
    // 方式二
    source.subscribe((val) => console.log('B：' + val));

    // A：1
    // A：2
    // B：1
    // B：2
    //---- 1s后:
    // A：3
    // B：3
  ```

#### empty
```ts
  public static empty(scheduler: Scheduler): Observable
```
* 创建一个什么数据都不发出，直接发出完成通知的操作符
* eg: 配合 mergeMap 等

#### from
```ts
  public static from(ish: ObservableInput<T>, scheduler: Scheduler): Observable<T>
```
* 从一个数组、类数组对象、Promise、迭代器对象或者类 Observable 对象创建一个 Observable
* eg: 
  ```js
    const source = Rx.Observable.from([10, 20, 30]);
    source.subscribe(v => console.log(v));

    // 10
    // 20
    // 30
  ```

#### fromEvent
```ts
  public static fromEvent(target: EventTargetLike, eventName: string, options: EventListenerOptions, selector: SelectorMethodSignatrue<T>): Observable<T>
```
* 创建一个 Observable，该 Observable 发出来给定事件对象的指定类型事件。可用于浏览器环境中的 Dom 事件或 Node 环境中的 EventEmitter 事件等
* eg: 监听按钮点击事件
  ```js
    const click = Rx.Observable.fromEvent(document.getElementById('btn'), 'click')
    click.subscribe(x => console.log(x))
  ```

#### fromPromise
```ts
  public static fromPromise(promise: PromiseLike<T>, scheduler: Scheduler): Observable<T>
```
* 将 promise 转换成 Observable，在编写时不用 .then、catch 之类的链式调用
* 如果 Promise resolves 一个值，输入 Observable 发出这个值然后完成；如果 Promise 被 rejectd，输出 Observable 会发出相应的错误
  ```js
    const source = Rx.Observable.fromPromise(fetch('http://xxxx'))
    source.subscribe(x => console.log(x), e => console.error(e))
  ```

#### interval
```ts
  public static interval(period: number, scheduler: Scheduler): Observable
```
* 使用该操作符创建的 Observable 可以在指定时间内发出连续的数字，和 setInterval 这种模式差不多。
* 在需要获取一段连续的数字时，或者需要定时做一些操作时都可以使用该操作符实现需求
  ```js
    const source = Rx.Observable.interval(1000)
    source.subscribe(v => console.log(v))
    // 默认从 0 开始，设定时间为 1s 一次，持续不断的按照指定间隔发送数据。可以结合 take 操作符进行限制发出的数据量
  ```

#### of
```ts
  public static of(values: ...T, scheduler: Scheduler)
```
* 和 from 能力差不多，在使用的时候是传入一个一个参数来调用的，类似 js 中 concat 方法。同样返回一个 Observable，依次将传入的参数合并并将数据以同步的方式发出
  ```js
    const source = Rx.Observable.of(1, 2, 3)
    source.subscribe(v => console.log(v))
    // 1
    // 2
    // 3
  ```

#### repeat
```ts
  public repeat(count: number): Observable
```
* 将数据源重复 n 次，n为传入的数字类型参数
  ```js
    const source = Rx.Observable.of(1, 2, 3).repeat(3)
    source.subscribe(v => console.log(v))
    // 1 2 3 
    // 1 2 3 
    // 1 2 3
    // 若不使用 of 这一次性打印出 // 1 2 3 1 2 3 1 2 3
  ```

#### range
```ts
  public static range(start: number, count: number, scheduler: Scheduler): Observable
```
* 创建一个 Observable，发出指定范围内的数字序列
```js
  const source = Rx.Observable.range(1, 4)
  source.subscribe(v => console.log(v))
  // 1 2 3 4
```

### 转换操作符
#### buffer
```ts
  public buffer(closingNotifier: Observable<any>): Observable
```
* 将过往的值收集到一个数组中，并且仅当另外一个 Observable 发出通知时才发出此数组。这相当于有yi个缓冲区，将数据收集起来，等到一个信号来临，再释放出去
* eg: 当数据量达到特定值再控制进行操作
  ```js
    const btn = document.createElement('button')
    btn.innerText = '点我啊'
    document.body.appendChild(btn)
    const click = Rx.Observable.fromEvent(btn, 'click')
    const interval = Rx.Observable.interval(1000)
    const source = interval.buffer(click)
    source.subscribe(x => console.log(x))
    // 等待四秒后，点击按钮，点击[0, 1, 2, 3]
    // 再等待八秒后，点击按钮 [4, 5, 6, 7, 8, 9, 10, 11]
    // 通过按钮来控制数据的发送。发出的数据就会直接会在缓存区中被清空，然后重新收集新的数据
  ```

#### concatMap
```ts
  public concatMap(project: function(value: T, ?index:number): ObservableInput, resultSelector: function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any):Observable
```
* 将源值投射为一个合并到输出 Observable 的 Observable,以串行的方式等待前一个完成再合并下一个 Observable
* 功能类似工厂流水线
* 注意:
  1. 源值发送一个数据，然后传入的内部 Observable 就会开始工作或者是发送数据，订阅者就能收到数据了，内部的 Observable 相当于总是要等源对象发送一个数据才会进行新一轮的工作，并且要等本轮工作完成了才能继续下一轮
  2. 如果本轮工作还未完成又接收到源对象发送的数据，那么就会用一个队列保存，然后等本轮完成立即检查队列里是否还有，如果有则立马开启下一轮
  3. 如果内部 Observable 的工作时间大于源对象发送的数据的间隔时间，那么就会导致缓存队列越来越大，最后造成性能问题
* eg:
  ```js
    const source = Rx.Observable.interval(3000)
    const result = source.concatMap(val => Rx.Observable.interval(1000).take(2))
    result.subscribe(x => console(x))
    // 第三秒 source 发送第一个数据，传入内部 Observable，经过两秒发送两个递增的数，订阅函数打印这两个数，继续等待一秒，第六秒重复上述
  ```

#### map
```ts
  public map(project: function(value: T, index: number): R, thisArg: any): Observable<R>
```
```js
  const source = Rx.Observable.interval(1000).take(3);
  const result = source.map(x => x * 2);
  result.subscribe(x => console.log(x));
  // 0 2 4
```

#### mapTo
```ts
  public mapTo(value: any): Observable
```
* 忽略数据源发送的数据，只发送指定的值(传参)
```js
  const source = Rx.Observable.interval(1000).take(3)
  const result = source.mapTo(111)
  result.subscribe(x => console.log(x))
  // 666 666 666
```

#### mergeMap
```ts
  public mergeMap(project: function(value: T, ?index: number): ObservableInput, resultSelector: function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any, concurrent: number): Observable
```
* mergeMap返回值是要求是一个Observable，可以返回任意转换或具备其他能力的Observable
```js
  const source = Rx.Observable.interval(1000).take(3)
  const result = source.mergeMap(x => x % 2 === 0 ? Rx.Observable.of(x) : Rx.Observable.empty())
  // 0 2
```

#### pluck
```ts
  public pluck(properties: ...string): Observable
```
* 用于选择出每个数据对象上的指定属性值
* eg: 若数据源发送的数据是一个对象，对象上有一个 name 属性，并订阅者指向知道这个 name 属性，那么使用该操作符来提取该属性值给用户
  ```js
    const source = Rx.Observable.of({name: '张三'}, {name: '李四'})
    const result = source.pluck('name')
    result.subscribe(x => console.log(x))
    // 张三
    // 李四
  ```

#### scan
```ts
  public scan(accumulator: function(acc: R, value: T, index: number): R, seed: T | R): Observable<R>
```
* 累加器操作符，用来做状态管理
* eg: 将数据源发送过来的数据累加之后再返回给订阅者
  ```js
    const source = Rx.Observable.interval(1000).take(4)
    const result = source.scan((acc, cur) => acc + cur, 0)
    result.subscribe(x => console.log(x))
    // 0 1 3 6
  ```

#### switchMap
```ts
  public switchMap(project: function(value: T, ?index: number): ObservableInput, resultSelector: function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any): Observable
```
* eg: 同学一点完之后，第二秒同学二点击了一下按钮，则打印结果：0、1、0、1、2，这里从第二个0开始就是同学二发送的数据了。
```js
  const btn = document.createElement('button');
  btn.innerText = '我要发言！'
  document.body.appendChild(btn);
  const source = Rx.Observable.fromEvent(btn, 'click');
  const result = source.switchMap(x => Rx.Observable.interval(1000).take(3));
  result.subscribe(x => console.log(x));
```


## 两种合流方式
1. merge 合流
  eg: 群聊天、聊天室、公众号订阅
2. conbine 合流
  eg: excle 中两个格子相加


