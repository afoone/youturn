import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';

const serviceRouter = Router();

// Rutas para los servicios
serviceRouter.get('/', serviceController.getAllServices); // Obtener todos los servicios
serviceRouter.get('/:uuid', serviceController.getServiceById); // Obtener servicio por UUID
serviceRouter.post('', serviceController.createService); // Crear un nuevo servicio
serviceRouter.put('/:uuid', serviceController.updateService); // Actualizar servicio
serviceRouter.delete('/:uuid', serviceController.deleteService); // Eliminar servicio

export default serviceRouter;
