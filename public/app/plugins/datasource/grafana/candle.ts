let cycle = -1;
let direction = 1;

export function candle() {
  let series = [];
  let start = 1450128121000;
  let end = 1451765616000;
  let len = end - start;
  let step = len / 10;

  cycle += direction;
  if (cycle > 2) {
    direction = -1;
  }
  if (cycle < -2) {
    direction = 1;
  }

  for (let i = 0; i < 4; i++) {
    let modifier = cycle * (step / 5);
    let points = [
      [i, start + step * 1],
      [i, start + step * 2],
      [3 + i, start + step * 3],
      [10 - i * 1, modifier + start + step * 4],
      [15 - i * 2, modifier + start + step * 5],
      [10 - i * 1, modifier + start + step * 6],
      [3 + i, start + step * 7],
      [i, start + step * 8],
      [i, start + step * 9],
    ];

    cycle *= -1;

    series.push({ target: 'flame' + i, datapoints: points });
  }

  return series;
}
