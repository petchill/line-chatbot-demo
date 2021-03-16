import express from 'express'
import {db} from '../firebase'

export const router = express.Router()

const getData = async () => {
  const ref = db.ref('rooms')
  // ref.once("value", function(snapshot) {
  //   console.log(snapshot.val());
  // });
  const snapshots = await ref.once('value')
  return snapshots
}
router.get('/', async (req, res) => {
  const snapshots = await getData()
  console.log('value => ', await snapshots.val());
  res.json({
    data: snapshots
  })
})
  