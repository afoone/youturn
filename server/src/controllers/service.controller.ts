import { Request, Response } from 'express';
import { serviceService } from '../services/service.service';
import { AuthRequest } from '../middleware/auth.middleware';

class ServiceController {
  // Obtener todos los servicios
  async getAllServices(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ticketPointId = req.query.ticketPointId as string | undefined;
      const services = await serviceService.getAllServices(req.user, ticketPointId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving services', error });
    }
  }

  // Obtener un servicio por UUID
  async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const service = await serviceService.getServiceById(uuid);
      if (!service) {
        res.status(404).json({ message: 'Service not found' });
        return;
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving service', error });
    }
  }

  // Crear un nuevo servicio
  async createService(req: AuthRequest, res: Response): Promise<void> {
    try {
      const serviceData = req.body;
      const service = await serviceService.createService(serviceData, req.user);
      res.status(201).json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Error creating service', error });
    }
  }

  // Actualizar un servicio
  async updateService(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const serviceData = req.body;
      const updatedService = await serviceService.updateService(uuid, serviceData, req.user);
      if (!updatedService) {
        res.status(404).json({ message: 'Service not found' });
        return;
      }
      res.json(updatedService);
    } catch (error: any) {
      const statusCode = error.message?.includes('own enterprise') ? 403 : 500;
      res.status(statusCode).json({ message: error.message || 'Error updating service', error });
    }
  }

  // Eliminar un servicio
  async deleteService(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const deleted = await serviceService.deleteService(uuid);
      if (!deleted) {
        res.status(404).json({ message: 'Service not found' });
        return;
      }
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting service', error });
    }
  }
}

export const serviceController = new ServiceController();
