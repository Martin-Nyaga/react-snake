import { equals } from 'ramda'
import GameOverImage from './game-over.png'

export const CanvasSettings = {
  pixelWidth: 600,
  pixelHeight: 400,
  gamePixelSize: 10
}

export class GamePixel {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  get realX () { return this.x * CanvasSettings.gamePixelSize }
  get realY () { return this.y * CanvasSettings.gamePixelSize }

  get realCenter() {
    const center = (n) => n + CanvasSettings.gamePixelSize / 2
    return {
      x: center(this.realX),
      y: center(this.realY)
    }
  }
}

export class GameCanvas {
  constructor (canvas) {
    this.ctx = canvas.getContext('2d')
  }

  get pixelWidth () { return CanvasSettings.pixelWidth }
  get pixelHeight () { return CanvasSettings.pixelHeight }
  get gamePixelSize () { return CanvasSettings.gamePixelSize }
  get gameWidth () { return this.pixelWidth / this.gamePixelSize }
  get gameHeight () { return this.pixelHeight / this.gamePixelSize }

  clear () {
    this.ctx.clearRect(0, 0, this.pixelWidth, this.pixelHeight)
  }

  drawSnake (snake, direction) {
    this.ctx.fillStyle = 'black'

    snake.forEach((s, i) => {
      let head = snake[i - 1]
      let tail = snake[i + 1]

      if (head === undefined) {
        // Draw head piece
        let angle = this._getHeadCircleAngle(direction)
        this._drawCircle(
          s.realCenter.x,
          s.realCenter.y,
          this.gamePixelSize / 2,
          ...angle
        )
        let rectangle = this._getHeadRectangle(s, direction)
        this.ctx.fillRect(...rectangle)
      } else if (tail === undefined) {
        // Draw tail piece
        this.ctx.fillRect(
          s.realX,
          s.realY,
          this.gamePixelSize,
          this.gamePixelSize
        )
      } else {
        let orientation = this._getOrientation(head, s, tail)
        switch (orientation) {
          case 'top-right':
						this.ctx.beginPath()
						this.ctx.moveTo(s.realX, s.realY + this.gamePixelSize)
						this.ctx.lineTo(s.realX, s.realY)
						this.ctx.arc(
              s.realX,
              s.realY + this.gamePixelSize,
              this.gamePixelSize,
              1.5 * Math.PI,
              0 * Math.PI
            )
						this.ctx.lineTo(s.realX, s.realY + this.gamePixelSize)
						this.ctx.fill()
            break
          case 'bottom-right':
						this.ctx.beginPath()
						this.ctx.moveTo(s.realX, s.realY)
						this.ctx.lineTo(s.realX + this.gamePixelSize, s.realY)
						this.ctx.arc(
              s.realX,
              s.realY,
              this.gamePixelSize,
              0 * Math.PI,
              0.5 * Math.PI
            )
						this.ctx.lineTo(s.realX, s.realY)
						this.ctx.fill()
            break
          case 'top-left':
						this.ctx.beginPath()
						this.ctx.moveTo(s.realX + this.gamePixelSize, s.realY + this.gamePixelSize)
						this.ctx.lineTo(s.realX, s.realY + this.gamePixelSize)
						this.ctx.arc(
              s.realX + this.gamePixelSize,
              s.realY + this.gamePixelSize,
              this.gamePixelSize,
              1 * Math.PI,
              1.5 * Math.PI
            )
						this.ctx.lineTo(s.realX + this.gamePixelSize, s.realY + this.gamePixelSize)
						this.ctx.fill()
            break
          case 'bottom-left':
						this.ctx.beginPath()
						this.ctx.moveTo(s.realX + this.gamePixelSize, s.realY)
						this.ctx.lineTo(s.realX + this.gamePixelSize, s.realY + this.gamePixelSize)
						this.ctx.arc(
              s.realX + this.gamePixelSize,
              s.realY,
              this.gamePixelSize,
              0.5 * Math.PI,
              1 * Math.PI
            )
						this.ctx.lineTo(s.realX + this.gamePixelSize, s.realY)
						this.ctx.fill()
            break
          case 'horizontal':
            this.ctx.fillRect(
              s.realX,
              s.realY,
              this.gamePixelSize,
              this.gamePixelSize
            )
            break
          case 'vertical':
            this.ctx.fillRect(
              s.realX,
              s.realY,
              this.gamePixelSize,
              this.gamePixelSize
            )
            break
          default:
            this.ctx.fillRect(
              s.realX,
              s.realY,
              this.gamePixelSize,
              this.gamePixelSize
            )
        }
      }

    })
  }

  drawFood (food) {
    this.ctx.fillStyle = 'red'
    this._drawCircle(
      food.realCenter.x,
      food.realCenter.y,
      this.gamePixelSize / 2 - 2,
      0,
      2*Math.PI
    )
  }

  drawGameOver () {
    let img = new Image()
    img.onload = () => {
      let x = (this.pixelWidth / 2) - (img.width / 2)
      let y = (this.pixelHeight / 2) - (img.height / 2)
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      this.ctx.fillRect(x, y, img.width, img.height)
      this.ctx.drawImage(img, x, y)
    }
    img.src = GameOverImage
  }

  _getDirection (head, tail) {
    if (head.x === tail.x && head.y > tail.y) return 'down'
    if (head.x === tail.x && head.y < tail.y) return 'up'
    if (head.y === tail.y && head.x < tail.x) return 'left'
    if (head.y === tail.y && head.x > tail.x) return 'right'
  }

  _getOrientation (head, curr, tail) {
    let headDirection = this._getDirection(head, curr)
    let tailDirection = this._getDirection(curr, tail)

    let direction = [headDirection, tailDirection]
    if (equals(direction, ['up', 'right']) ||
        equals(direction, ['left', 'down'])) return 'bottom-right'
    if (equals(direction, ['up', 'left']) ||
        equals(direction, ['right', 'down'])) return 'bottom-left'
    if (equals(direction, ['right', 'up']) ||
        equals(direction, ['down', 'left'])) return 'top-left'
    if (equals(direction, ['down', 'right']) ||
        equals(direction, ['left', 'up'])) return 'top-right'
    if (direction[0] === direction[1] &&
        (direction[0] === 'left' ||
         direction[0] === 'right')) return 'horizontal'
    if (direction[0] === direction[1] &&
        (direction[0] === 'up' ||
         direction[0] === 'down')) return 'vertical'
  }

  _drawCircle (x, y, r, startAngle, endAngle, style = { fill: true }) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, r, startAngle, endAngle)
    if (style.fill) this.ctx.fill()
    if (style.stroke) this.ctx.stroke()
  }

  _getHeadCircleAngle (direction) {
    let semiCirlceAngles = {
      'left': [0.5, 1.5],
      'right': [1.5, 0.5],
      'up': [1, 0],
      'down': [0, 1]
    }
    return semiCirlceAngles[direction].map(x => x * Math.PI)
  }

  _getHeadRectangle (head, direction) {
    switch (direction) {
      case 'left':
        return [
          head.realX + this.gamePixelSize / 2,
          head.realY,
          this.gamePixelSize / 2,
          this.gamePixelSize
        ]
        break
      case 'right':
        return [
          head.realX,
          head.realY,
          this.gamePixelSize / 2,
          this.gamePixelSize
        ]
        break
      case 'up':
        return [
          head.realX,
          head.realY + this.gamePixelSize / 2,
          this.gamePixelSize,
          this.gamePixelSize / 2
        ]
        break
      case 'down':
        return [
          head.realX,
          head.realY,
          this.gamePixelSize,
          this.gamePixelSize / 2
        ]
        break
      default:
        return [
          head.realX,
          head.realY,
          this.gamePixelSize,
          this.gamePixelSize
        ]
    }
  }
}
