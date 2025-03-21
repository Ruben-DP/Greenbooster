// Budget.tsx
interface BudgetProps {
  totalAmount: number;
}

export default function Budget({ totalAmount }: BudgetProps) {
  return (
    <section className="budget tile">
      <h4 className="">Budget</h4>
      <span className="budget__sum">
        Aanschafkosten: €{Math.max(0, totalAmount).toLocaleString('nl-NL', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </span>
      <span className="budget__notice">Eenmalig, inclusief BTW, per appartement</span>
    </section>
  );
}