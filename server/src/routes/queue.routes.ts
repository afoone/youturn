import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';

const queueRouter = Router();

// Rutas para la cola
queueRouter.post('/:serviceId/enqueue', queueController.enqueueCustomer);

export default queueRouter;
