import { analyzeBehavior } from "../../services/behavior/behavior.service";
import { sanitizeProperty } from "../../services/property/property.service";
import { sanitizeStock } from "../../services/stock/stock.service";
import { runUnderwritingAndAnchor } from "../../services/underwriting/engine";

export const finalizeUnderwritingHandler = async (req, res) => {
  const { application, propertyInput, stockInput } = req.body;

  const behavior = await analyzeBehavior({
    applicationId: application.id,
    borrowerId: application.borrowerId,
    ipAddress: application.ipAddress,
    deviceId: application.deviceId,
    submittedAt: new Date(application.submittedAt),
    priorApplicationsCount: application.priorApplicationsCount,
    rejectedApplicationsCount: application.rejectedApplicationsCount,
    documentCount: application.documentCount,
    avgDocumentUploadDelayMinutes: application.avgDocDelayMinutes
  });

  const property = await sanitizeProperty(propertyInput);
  const stock = await sanitizeStock(stockInput);

  const result = await runUnderwritingAndAnchor({
    application,
    behavior,
    property,
    stock
  });

  res.json(result);
};
