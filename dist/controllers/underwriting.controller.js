"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnderwritingCase = createUnderwritingCase;
exports.runUnderwriting = runUnderwriting;
const engine_1 = require("../services/underwriting/engine");
async function createUnderwritingCase(req, res) {
    try {
        const caseRecord = await engine_1.underwritingService.createCase(req.body);
        res.status(201).json(caseRecord);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
async function runUnderwriting(req, res) {
    try {
        const id = Number(req.params.id);
        const result = await engine_1.underwritingService.run(id);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
