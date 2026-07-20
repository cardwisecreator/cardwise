const palettes: Record<string, string> = {
  "American Express": "linear-gradient(135deg,#0d5e9f,#65c7ea)",
  "Citibank": "linear-gradient(135deg,#143b75,#d9304f)",
  DBS: "linear-gradient(135deg,#9f161c,#ee6d56)",
  HSBC: "linear-gradient(135deg,#b1142d,#4f0612)",
  UOB: "linear-gradient(135deg,#142f70,#d13f47)",
  OCBC: "linear-gradient(135deg,#ed5d1d,#8b1931)",
  Maybank: "linear-gradient(135deg,#f4c71d,#8c6110)",
  "Standard Chartered": "linear-gradient(135deg,#087f7b,#1064ae)",
  CIMB: "linear-gradient(135deg,#9c111d,#30101c)",
  "Trust Bank": "linear-gradient(135deg,#4a287c,#fa8587)",
  POSB: "linear-gradient(135deg,#d11a32,#a0061e)",
  "Bank of China": "linear-gradient(135deg,#aa151b,#d99545)",
  "DCS Card Centre": "linear-gradient(135deg,#182936,#5a8da1)",
};

export function CardVisual({ bank, name, imageUrl }: { bank: string; name: string; imageUrl?: string | null }) {
  const initials = bank.split(" ").map(word => word[0]).join("").slice(0, 3).toUpperCase();
  if (imageUrl) return <div className="cardVisual cardVisualImage" aria-label={`${name} official card image`}><img src={imageUrl} alt={`${name} from ${bank}`}/></div>;
  return <div className="cardVisual" style={{ background: palettes[bank] ?? "linear-gradient(135deg,#10201d,#4a685e)" }} aria-label={`${name} card visual`}>
    <span className="cardVisualBank">{initials}</span><span className="cardVisualChip"/><span className="cardVisualName">{name.replace(`${bank} ` , "").slice(0, 24)}</span><span className="cardVisualNetwork">SINGAPORE</span>
  </div>;
}
