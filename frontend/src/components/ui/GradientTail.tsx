/** Renders a heading with its final word picked out in the volt→ember
 *  gradient — works across languages since it doesn't depend on which
 *  word that is, just "the last one". Used sparingly (section headings
 *  and page titles only), per the brand direction: gradient is an
 *  accent, not a default. */
export function GradientTail({ text }: { text: string }) {
  const words = text.trim().split(" ");
  if (words.length < 2) {
    return <span className="bg-volt-ember bg-clip-text text-transparent">{text}</span>;
  }
  const head = words.slice(0, -1).join(" ");
  const tail = words[words.length - 1];
  return (
    <>
      {head}{" "}
      <span className="bg-volt-ember bg-clip-text text-transparent">{tail}</span>
    </>
  );
}
