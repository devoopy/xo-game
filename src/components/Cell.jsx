import x from '../xo-x.svg';
import o from '../xo-o.svg';

export default function Cell({ value, click }) {
  const signClassName = value.line ? 'cell red' : 'cell';
  const sign =
    value.taker === 'owner' ? (
      <object data={x}>x</object>
    ) : value.taker === 'player' ? (
      <object data={o}>o</object>
    ) : null;

  function cellClick() {
    click(value);
  }

  return (
    <div className={signClassName} onClick={cellClick}>
      {sign}
    </div>
  );
}
