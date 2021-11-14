import { ajax } from 'rxjs/ajax'
import { map, retry, catchError } from 'rx/js/operators'

const apiData = ajax('api/data').pipe(
  // 可以在 catchError 之前使用 retry 操作符。它会订阅到原始的来源可观察对象。此处为重新发起 HTTP 
  retry(3),  // 失败前会重试最多 3 次
  map((res) => {
    if (!res.response) {
      throw new Error('Expected!')
    }
    return res.response
  }),
  catchError((err) => of([]))
)

apiData.subscribe({
  next(x) {
    console.log("Data: ", x)
  },
  error(err) {
    console.log('It,s error')
  }
})