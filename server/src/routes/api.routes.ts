import { Router } from 'express'
import { enterpriseRouter } from './enterprise.routes'
import serviceRouter from './service.routes'
import queueRouter from './queue.routes'
import operatorRouter from './operator.routes'
import screenRouter from './screen.routes'

const router = Router()

router.use('/enterprises', enterpriseRouter)
router.use('/services', serviceRouter)
router.use('/queue', queueRouter)
router.use('/operators', operatorRouter)
router.use('/screens', screenRouter)

export default router
