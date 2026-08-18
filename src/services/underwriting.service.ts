export const runUnderwriting = async (inputs) => {
  const { behavior, property, stock, borrower } = inputs;

  const riskScore =
    behavior.behaviorScore * 0.3 +
    property.collateralScore * 0.4 +
    stock.macroRiskScore * 0.3;

  return {
    decision: riskScore > 70 ? "APPROVE" : "REJECT",
    riskScore,
    reasonCodes: []
  };
};
