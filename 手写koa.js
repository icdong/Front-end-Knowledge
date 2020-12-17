3. 如何自己实现一个koa呢？
我们知道koa是利用 洋葱模型原理 通过封装http实现的，下面我们也来实现一个koa吧！



const http = require('http')

class Koa {
  constructor() {
    this.middlewares = []  //存储 koa.use(fn) 传入的中间件函数 fn
  }
  //当执行 koa.listen(3000) 方法时创建一个 http 服务
  listen(...args) {
    const server = http.createServer(async (req, res) => {
      const ctx = this.createContext(req, res)  //1. 得到 ctx 封装好的请求相应参数
      const fn = this.compose(this.middlewares) //2. 通过高阶函数原理将 ctx 传入中间件中
      await fn(ctx)                             //3. 执行所有的中间件方法
      res.end(ctx.body)                         //4. 最终给浏览器返回数据
    })
    server.listen(...args)
  }
  use(middleware) {
    this.middlewares.push(middleware)
  }
  createContext(req, res) {
    //选择性暴露 get set 方法 目的不让用户随意修改属性
    const ctx = Object.create({
      get url() {
        return this.request.url
      },
      get body() {
          return this.response.body
      },
      set body(val){
          this.response.body = val
      },
      get method() {
          return this.request.method
      }
    })

    ctx.request = Object.create({
      get url(){
        return this.req.url
      },
      get method(){
        return this.req.method.toLowerCase()
      }
    })

    ctx.response = Object.create({
      get body(){
        return this._body
      },
      set body(val){
        this._body = val
      }
    })

    ctx.req = ctx.request.req = req
    ctx.res = ctx.response.res = res
    return ctx
  }
  //洋葱模型核心原理
  compose(middlewares) {
    return function (ctx) {
      return dispatch(0)
      function dispatch(i) {
        let fn = middlewares[i]
        if (!fn) {
          return Promise.resolve()
        }
        // dispatch 方法返回 Promise 的原因是确保洋葱模型存在异步情况下可以使用 await语法 让洋葱模型依然按照顺序执行
        return Promise.resolve(
          fn(ctx, function next() {
            //函数循环递归时：上一个函数要等到下一个函数执行完成才算执行完成 这就是洋葱模型的核心原理
            return dispatch(i + 1)
          })
        )
      }
    }
  }
}

//下面我们使用自己实现的 Koa
const app = new Koa() // 创建koa服务, koa内部是封装http实现的

app.use(async (ctx, next) => {
    console.log(1)
    await next()
    console.log(4)
});
app.use(async (ctx, next) => {
    console.log(2)
    await delay() //测试异步后代码是否可以按照顺序执行
    await next()
    console.log(3)
});

function delay() {
  return new Promise(reslove => {
    setTimeout(() => {
      console.log('我是中途的异步代码')
      reslove()
    }, 2000)
  })
}

app.listen(3000, ()=>{
  console.log('监听端⼝3000') //服务器开启成功的回调函数
})
