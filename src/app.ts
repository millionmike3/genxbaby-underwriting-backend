import express from 'express'
import cors from 'cors'
import borrowerRoutes from './routes/borrower.routes'
import propertyRoutes from './routes/property.routes'
import mortgageRoutes from './routes/mortgage.routes'
import underwritingRoutes from './routes/underwriting.routes'
import blockchainRoutes from "./routes/blockchain.routes";
import adminRoutes from "./routes/admin.routes";
import blockchainRoutes from "./routes/blockchain.routes";

const app = express()

app.use(cors())
app.use(express.json())

app.use("/admin", adminRoutes);
app.use('/borrower', borrowerRoutes)
app.use('/property', propertyRoutes)
app.use('/mortgage', mortgageRoutes)
app.use('/underwriting', underwritingRoutes)
app.use("/blockchain", blockchainRoutes)
export default app
