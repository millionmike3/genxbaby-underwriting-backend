"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
const prisma_1 = require("../db/prisma");
async function logAudit({ actor, action, target, metadata }) {
    await prisma_1.prisma.auditLog.create({
        data: {
            actor,
            action,
            target,
            metadata
        }
    });
}
