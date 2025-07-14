export default function () {
  return {
    id: this.id,
    winner: this.winner.toResponseObject(),
    prize: this.prize.toResponseObject(),
  }
}
