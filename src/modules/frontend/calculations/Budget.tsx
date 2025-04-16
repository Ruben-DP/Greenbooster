interface BudgetProps {
  totalAmount: number;
}

export default function Budget({ totalAmount }: BudgetProps) {
  // Calculate final price with profit and BTW in two steps
  const calculateFinalPrice = (basePrice: number) => {
    // Step 1: Add profit margin (25%)
    const priceWithProfit = basePrice * 1.25;

    // Step 2: Add BTW/VAT (21%)
    const finalPrice = priceWithProfit * 1.21;

    return finalPrice;
  };

  // Calculate the final total amount
  const finalTotalAmount = calculateFinalPrice(totalAmount);

  return (
    <section className="budget tile">
      <h4 className="tile-title">Kosten</h4>
      <span className="budget__sum">
        €
        {Math.max(0, finalTotalAmount).toLocaleString("nl-NL", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <span className="budget__notice">Eenmalig, inclusief BTW </span>
    </section>
  );
}
