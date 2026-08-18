// src/services/investorDeliveryService.ts
import { TimelineEventService } from "./timelineEventService";

export async function createDeliveryPackage(applicationId, borrowerId, loan) {
  const pkg = await buildDeliveryPackage(loan); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "DELIVERY_PACKAGE_CREATED",
    { url: pkg.url, investor: pkg.investor }
  );

  return pkg;
}

export async function markLoanSold(applicationId, borrowerId, sale) {
  const result = await recordSale(sale); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "LOAN_SOLD",
    result
  );

  return result;
}
