import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import * as service from '../domain/professionalService.js';
import { validateCreateProfessional, validateUpdateProfessional } from '../validators/professionalValidators.js';
import * as repo from '../data-access/professionalRepository.js';

const router = Router();

// POST /professionals - Registrar nuevo profesional
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = validateCreateProfessional(req.body);
    const professional = await service.registerProfessional(input);
    res.status(201).json({
      success: true,
      data: professional,
    });
  } catch (error) {
    next(error);
  }
});

// GET /professionals - Listar profesionales
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const professionals = await repo.listProfessionals();
    res.status(200).json({
      success: true,
      data: professionals,
      count: professionals.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /professionals/:id - Obtener perfil de profesional
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const professional = await service.getProfessionalProfile(id);
    res.status(200).json({
      success: true,
      data: professional,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /professionals/:id - Actualizar profesional
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const input = validateUpdateProfessional(req.body);
    const professional = await service.updateProfessional(id, input);
    res.status(200).json({
      success: true,
      data: professional,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /professionals/:id - Borrar profesional
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    await service.requestAccountDeletion(id);
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;