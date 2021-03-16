import express from "express"
import { from, of, Subject } from "rxjs"
import { tap, take, mergeMap, retryWhen, map } from "rxjs/operators"
import R from "ramda"
import bodyParser from "body-parser"
import axios from "axios"
import { router as liffRouter } from './liffRouter'
const app = express()
const channelToken = "pkiErMEWSLofSNCkAEjIJUOL10SpPbRbA426Cf3ESvFM1vbcVmbl5Db87V5KS/l3/YBDXdBd5AHVOKvBgDncKRmIek+dYNzQ8W6gGgOusUcIFH73rKdvVjrr6bD8tyd4YPtRRUYuhyH6d16Bi1W/wAdB04t89/1O/w1cDnyilFU="
const lineReplyUrl = "https://api.line.me/v2/bot/message/reply"

const port = process.env.POST || 4002;
console.log(process.env.LINE_CHANNEL_TOKEN)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const flexMessage = {
  type: 'flex',
  altText: 'This is a flex message'
  
}
const sendLine$ = async (data) => {
  const payload = R.prop('output', data)
  console.log('payload => ', JSON.stringify(payload, null, 2))
  const option = {
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${process.env.LINE_CHANNEL_TOKEN}`
    }
  }
  try{
    const res = await axios.post(lineReplyUrl, payload, option)
  } catch (error) {
    console.error(error.response)
  }
}

// const sendMessage = R.compose(
//   // R.prop('output'),
//   map((payload) => {
//     console.log('payload => ', payload)
//     console.log('channel token => ', channelToken)
//   })
// )

const addInput = R.applySpec({
  input: R.identity()
})

const formatInput = (data) => {
  const destination = data.destination || undefined
  const result = from(R.prop('events', data)).pipe(
    tap(x => console.log("data 2 => ", x)),
    map(R.assoc('destination', destination)),
    map(addInput),
  )
  return result
}

const outputTranformation = () => (x) => {
  console.log('imput 0 => ', input)
  return {
    result: input
  }
}

const genOutputPayload = (x) => R.compose(
  R.assoc('output', {
    replyToken: x.input.replyToken,
    messages: [
      {
        type: 'text',
        text: x.input.message.text
      }
    ]
  }),
)(x)

const getType = (x) => x

const initiateOutput = R.compose(
  (x) => genOutputPayload(x),
  R.assoc('output', { type: '', message: [] })
)

const genPayload = R.pipe(
  formatInput,
  map(initiateOutput),
  tap(x => console.log('format => ', x)),
)



const line$ = new Subject()
line$.pipe(
  tap(x => console.log('tap => ', x)),
  mergeMap(genPayload),
  mergeMap(sendLine$)
).subscribe()

app.post('/webhook/line', (req, res) => {
  console.log("reqBody => ", JSON.stringify(req.body, null, 2))
  line$.next(req.body)
  res.send({})
})

app.use('/liff', liffRouter)

app.listen(port, () => console.log('app listening on port => ', port));

export default app;
