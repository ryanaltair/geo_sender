/* eslint-env node */
import ioBuilder from 'socket.io'
import http from 'http'
import fs from 'fs'

const data = fs.readFileSync('upload/pressure.json')
const geoRaw = JSON.parse(data)
const geoNow = JSON.parse(data)
const port = 5001
console.log(geoNow)
function changePressure (factor) {
  const positionsNow = geoNow.data.attributes.pressure.array
  const positionsRaw = geoRaw.data.attributes.pressure.array
  const max = positionsRaw.length
  for (let i = 0; i < max; i += 1) {
    positionsNow[i] = positionsRaw[i] + factor
  }
}
function changeGeo (xFactor, yFactor) {
  const positionsNow = geoNow.data.attributes.position.array
  const positionsRaw = geoRaw.data.attributes.position.array
  const max = positionsRaw.length
  for (let i = 0; i < max; i += 3) {
    positionsNow[i + 0] = positionsRaw[i + 0] + xFactor
    positionsNow[i + 1] = positionsRaw[i + 1] + yFactor
  }
}
function runServer () {
  const server = http.createServer()

  const io = ioBuilder(server)
  server.listen(port, () => {
    console.log(`Running at ${'http'}://localhost:${port}`)
  })

  const autoSendStreamIn1 = true
  if (autoSendStreamIn1) {
    let time = 0
    setInterval(() => {
      //   time++
      //   console.log('stream send')
      changePressure(1000 * Math.sin(time * 0.1))
      changeGeo(1 * Math.sin(time * 0.1), 1 * Math.cos(time * 0.1))
      io.emit('stream.in', { in1: { a: 3 + Math.sin(time * 0.1) } })
      io.emit('stream.in', { in2: { geo: geoNow } })
      time++
    }, 50)
  }

  io.on('connection', socket => {
    console.log('connection add')
    socket.on('stream.out', data => {
      console.log('get', data)
    })
  })
}
runServer()
