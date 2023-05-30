import { Chessground } from "chessground";
import { Chess, SQUARES } from "chess.js";
import "./style.css";
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import { Api } from "chessground/api";
import { Color, Key } from "chessground/types";

const app = document.getElementById("app")!;
const board = document.createElement("div");
board.id = "board";
app.appendChild(board);

const input = document.createElement("input");
input.id = "input";
input.type = "text";
input.placeholder = "Enter Move";
input.autofocus = true;
input.onblur = () => input.focus();
input.onchange = () => {
  const move = input.value;
  const chess = new Chess(game.fen());
  try {
    const moveObj = chess.move(move);
    if (moveObj) {
      ground.move(moveObj.from, moveObj.to);
      playOtherSide(ground, game)(moveObj.from, moveObj.to);
      input.value = "";
    }
  } catch (e) {
    console.log(e);
  }
};
app.appendChild(input);

const pgn = document.createElement("div");
pgn.id = "pgn";
app.appendChild(pgn);

const game = new Chess();
const ground = Chessground(board, {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w",
  coordinates: true,
  movable: {
    free: false,
    color: "white",
    dests: toDests(game),
  },
});

ground.set({
  movable: { events: { after: playOtherSide(ground, game) } },
});

function toDests(chess: Chess) {
  const dests = new Map();
  SQUARES.forEach((s) => {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length)
      dests.set(
        s,
        ms.map((m) => m.to)
      );
  });
  return dests;
}

function playOtherSide(cg: Api, chess: Chess) {
  return (orig: Key, dest: Key) => {
    chess.move({ from: orig, to: dest });
    cg.set({
      turnColor: toColor(chess),
      movable: {
        color: toColor(chess),
        dests: toDests(chess),
      },
    });
    pgn.innerHTML = chess.pgn({
      newline: "<br />",
      maxWidth: 5,
    });
  };
}

export function toColor(chess: Chess): Color {
  return chess.turn() === "w" ? "white" : "black";
}
