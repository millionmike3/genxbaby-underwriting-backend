"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = createProperty;
const property_service_1 = require("../services/property.service");
async function createProperty(req, res) {
    try {
        const property = await property_service_1.propertyService.create(req.body);
        res.status(201).json(property);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}
