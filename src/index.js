import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const GO_TO_START = "Go to game start";

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>{props.value}</button>
    )
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        let rows = [];
        let i = 0;
        for (let m = 0; m < 3; m++) {
            let columns = [];
            for (let n = 0; n < 3; n++) {
                columns.push(this.renderSquare(i));
                i++;
            }
            rows.push(<div key={m} className="board-row">{columns}</div>);
        }
        return rows
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                coordinates: Array(2).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
        };
    }

    static returnCoordinates(pos) {
        let i = 0;
        for (let m = 0; m < 3; m++) {
            for (let n = 0; n < 3; n++) {
                if (i === pos) {
                    return [m + 1, n + 1]
                } else {
                    i = i + 1
                }
            }
        }
        return null
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([{
                squares: squares,
                coordinates: Game.returnCoordinates(i),
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo = step => {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    };

    toggleButtonClass = (event) => {
        let buttonList = document.getElementById("moves").getElementsByTagName("button");
        let buttonArray = Array.prototype.slice.call(buttonList);
        for (let i = 0; i < buttonArray.length; i++) {
            buttonArray[i].classList.remove("bold-button")
        }
        event.target.classList.add("bold-button");
    };

    static toggleSortButton() {
        const currentList = document.getElementById("moves").getElementsByTagName("li");
        const reversedList = Array.prototype.slice.call(currentList).reverse();
        // -1 to leave out the first button that resets the game
        for (let i = 0; i < reversedList.length - 1; i++) {
            document.getElementById("moves").appendChild(reversedList[i]);
        }
    }

    static highlightWinningSquares(lines) {
        const squareArray = Game.returnSquaresArray();
        Game.removeWinningSquaresClass(squareArray);
        for (let i = 0; i < lines.length; i++) {
            squareArray[lines[i]].classList.add("winning-squares")
        }
    }

    static cleanUp() {
        Game.removeWinningSquaresClass(Game.returnSquaresArray());
    }

    static returnSquaresArray() {
        const buttonList = document.getElementsByClassName("square");
        return Array.prototype.slice.call(buttonList);
    }

    static removeWinningSquaresClass(array) {
        for (let i = 0; i < array.length; i++) {
            array[i].classList.remove("winning-squares");
        }
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ?
                "Go to move #" + move + " (Row :" + history[move].coordinates[0] + ", Column :" + history[move].coordinates[1] + ")" :
                GO_TO_START;
            return (
                <li key={move}>
                    <button onClick={(event) => {
                        this.jumpTo(move);
                        this.toggleButtonClass(event);
                        Game.cleanUp();
                    }}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        // debugger

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol id="moves">{moves}</ol>
                </div>
                <div className="sorting-section">
                    <button onClick={() => {
                        Game.toggleSortButton()
                    }}>ReArrange List
                    </button>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            Game.highlightWinningSquares(lines[i]);
            return squares[a];
        }
    }
    return null;
}