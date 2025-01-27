interface StepProps {
  step: number;
}

export default function Step({ step }: StepProps) {
  return (
    <>
      <section className="step">
        <div className="step__container">
          <div className="step__no">
            <div className={`step__circle ${step == 1 ? "active" : ""}`}>1</div>
            <h4 className="step__title">Woning gegevens</h4>
          </div>
          <div className="step__no">
            <div className={`step__circle ${step == 2 ? "active" : ""}`}>2</div>
            <h4 className="step__title">Kosten berekening</h4>
          </div>
          <div className="step__no">
            <div className={`step__circle ${step == 3 ? "active" : ""}`}>3</div>
            <h4 className="step__title">Vergelijken</h4>
          </div>
        </div>
      </section>
    </>
  );
}
