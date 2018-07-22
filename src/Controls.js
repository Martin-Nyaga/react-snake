import React from 'react'

const IconButton = (props) => {
  return (
    <button
      className='btn btn-light mr-2'
      onClick={props.onClick}
    >
      <i className={`fas fa-${props.icon} mr-3`} />
      {props.children}
    </button>
  )
}

export default class Controls extends React.Component {

  reduceSpeed (e) {
    this.props.changeSpeed(-1)
    e.preventDefault()
    return false
  }

  increaseSpeed (e) {
    this.props.changeSpeed(+1)
    e.preventDefault()
    return false
  }

  render () {
    return (
      <div className='pb-3 d-flex justify-content-between'>
        <div>
          {!this.props.gameOver && this.props.paused && (
            <IconButton icon='play' onClick={this.props.play}>
              Play
            </IconButton>
          )}

          {!this.props.gameOver && !this.props.paused && (
            <IconButton icon='pause' onClick={this.props.pause}>
              Pause
            </IconButton>
          )}

          {!this.props.gameOver && (
            <div className='d-inline-block'>
              <div className='input-group'>
                <div className='input-group-prepend'>
                  <button
                    className='btn btn-outline-secondary'
                    onClick={(e) => this.reduceSpeed(e)}>
                    -
                  </button>
                </div>
                <input
                  readOnly
                  className='form-control text-center'
                  value={this.props.speed}
                  style={{ width: '60px' }}/>
                <div className='input-group-append'>
                  <button
                    className='btn btn-outline-secondary'
                    onClick={(e) => this.increaseSpeed(e)}>
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {this.props.gameOver && (
            <IconButton icon='play' onClick={this.props.newGame}>
              New Game
            </IconButton>
          )}
        </div>
        <div>
          <div className='d-inine-block py-2'>
            Score: {this.props.score}
          </div>
        </div>
      </div>
    )
  }
}
