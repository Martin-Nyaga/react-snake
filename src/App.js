import './App.css'

import React from 'react'

import { CanvasSettings, GamePixel, GameCanvas } from './GameCanvas'
import Controls from './Controls'

const KEY_LEFT = 37
const KEY_UP = 38
const KEY_RIGHT = 39
const KEY_DOWN = 40

export default class App extends React.Component {
  initialSnakeLength = 10

  constructor (props) {
    super(props)

    this.__ = {
      canvasRef: React.createRef()
    }

    this.state = {
      ...this.newGameState(),
      paused: true
    }
  }

  newGameState () {
    return {
      snake:
        new Array(this.initialSnakeLength)
          .fill({})
          .map((_, i) => new GamePixel(this.initialSnakeLength + 5 - i, 5)),
      direction: 'right',
      speed: 1,
      paused: false,
      score: 0,
      gameOver: false
    }
  }

  newGame () {
    this.setState(this.newGameState())
    this.playGame()
  }

  gameLoop () {
    if (!this.state.paused) {
      let { x, y } = this.state.snake[0]

      // check first whether nextDirection was set
      // and update if so
      if (this.state.nextDirection) {
        this.setState(state => {
          return {
            direction: state.nextDirection,
            nextDirection: undefined
          }
        })
      }
      // calculate next position of snake based on
      // the direction
      switch (this.state.direction) {
        case 'right':
          x++
          break
        case 'left':
          x--
          break
        case 'up':
          y--
          break
        case 'down':
          y++
          break
        default:
          break
      }

      // Check if snake has hit a wall or itself
      if (x === -1 ||
          x === this.gameWidth ||
          y === -1 ||
          y === this.gameHeight ||
          this.hasCollided()
        ) {
        this.setState({
          gameOver: true
        })
        this.canvas.drawGameOver()
        this.pauseGame()

        // Check if snake has eaten food and make
        // it longer if so
      } else if (
        this.state.food &&
        x === this.state.food.x &&
        y === this.state.food.y
      ) {
        this.setState(state => {
          return {
            score: state.score + 1
          }
        })

        this.setState(state => {
          return {
            snake: [new GamePixel(x, y), ...state.snake],
            food: this.getNewFoodPosition()
          }
        })
      } else {
        // Move snake as normal by taking tail and
        // placing at next position of head
        let newSnake = [...this.state.snake]
        newSnake.pop()
        newSnake.unshift(new GamePixel(x, y))

        this.setState({
          snake: newSnake
        })
      }

      // Add food to the page if necessary
      if (this.state.food === undefined) {
        this.setState({
          food: this.getNewFoodPosition()
        })
      }
    }

    // Queue next loop, with correct speed
    setTimeout(
      () => this.gameLoop(),
      200 / this.state.speed
    )
  }

  getNewFoodPosition () {
    let food = new GamePixel(
      Math.floor((Math.random() * this.canvas.gameWidth)),
      Math.floor((Math.random() * this.canvas.gameHeight))
    )

    // correct if food clashes with any
    // part of the snake
    while (this.state.snake.some(s => {
      return food.x === s.x && food.y === s.y
    })) {
      food.x = Math.floor((Math.random() * this.canvas.gameWidth))
      food.y = Math.floor((Math.random() * this.canvas.gameHeight))
    }

    return food
  }

  hasCollided () {
    let head, body
    [head, ...body]= this.state.snake
    return body.some(s => {
      return head.x === s.x && head.y === s.y
    })
  }

  componentDidMount () {
    // Init canvas
    this.canvas = new GameCanvas(this.__.canvasRef.current)

    // Bind events
    document.removeEventListener('keydown', this.handleKeyboardInput.bind(this))
    document.addEventListener('keydown', this.handleKeyboardInput.bind(this))

    // Start game loop
    this.gameLoop()
  }

  handleKeyboardInput (e) {
    let key = e.keyCode
    let direction = this.state.direction

    // The user can quickly press up and left before
    // the snake has had a chance to turn up.
    // However the state will change, and this could
    // result in game over, which should not be the
    // case.
    //
    // To avoid this, we set the nextDirection in the
    // state and only update the direction in the
    // gameLoop
    switch (key) {
      case KEY_LEFT:
        if (direction !== 'right')
          this.setState({ nextDirection: 'left' })
        break
      case KEY_RIGHT:
        if (direction !== 'left')
          this.setState({ nextDirection: 'right' })
        break
      case KEY_UP:
        if (direction !== 'down')
          this.setState({ nextDirection: 'up' })
        break
      case KEY_DOWN:
        if (direction !== 'up')
          this.setState({ nextDirection: 'down' })
        break
      default:
        break
    }
  }

  componentDidUpdate () {
    this.canvas = new GameCanvas(this.__.canvasRef.current)

    if (!this.state.paused) {
      this.canvas.clear()
      this.canvas.drawSnake(this.state.snake, this.state.direction)

      if (this.state.food) this.canvas.drawFood(this.state.food)
    }

    if (this.state.gameOver) this.canvas.drawGameOver()
  }

  playGame () {
    this.setState({
      paused: false
    })
  }

  pauseGame () {
    this.setState({
      paused: true
    })
  }

  changeSpeed (num) {
    this.setState(state => {
      let newSpeed = state.speed + parseInt(num, 10)
      return {
        speed: newSpeed > 0 ? newSpeed : 1
      }
    })
  }

  render() {
    return (
      <div
        className="app mx-auto d-flex flex-column justify-content-center"
        style={{ width: CanvasSettings.pixelWidth }}>
        <Controls
          pause={() => this.pauseGame()}
          play={() => this.playGame()}
          newGame={() => this.newGame()}
          changeSpeed={(i) => this.changeSpeed(i)}

          gameOver={this.state.gameOver}
          speed={this.state.speed}
          score={this.state.score}
          paused={this.state.paused}
        />
        <canvas
          className="border w-100"
          ref={this.__.canvasRef}
          width={CanvasSettings.pixelWidth}
          height={CanvasSettings.pixelHeight}
        >
        </canvas>
      </div>
    )
  }
}
