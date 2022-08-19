import Cell from './Cell';
import line from '../xo-line.svg';

export default function Grid({ grid, takeCell }) {
  let lineClassName = 'line ';

  const n = grid.length;
  if (grid[0][0].line && grid[1][1].line) lineClassName += 'g1';
  if (grid[0][n - 1].line && grid[1][n - 2].line) lineClassName += 'g2';

  for (let i = 0; i < n; i++) {
    if (grid[i][0].line && grid[i][1].line) lineClassName += 'h' + (i + 1);
    if (grid[0][i].line && grid[1][i].line) lineClassName += 'v' + (i + 1);
  }

  function gridToList(grid) {
    return grid.map((row) => {
      const cells = row.map((cell) => <Cell value={cell} click={takeCell} />);
      return <div className="row">{cells}</div>;
    });
  }

  return (
    <div className="grid">
      <object data={line} className={lineClassName}>
        line
      </object>
      {gridToList(grid)}
    </div>
  );
}
