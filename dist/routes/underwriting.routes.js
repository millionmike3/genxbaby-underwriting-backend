"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const underwriting_controller_1 = require("../controllers/underwriting.controller");
const router = (0, express_1.Router)();
router.post('/case', underwriting_controller_1.createUnderwritingCase);
router.post('/run/:id', underwriting_controller_1.runUnderwriting);
exports.default = router;
