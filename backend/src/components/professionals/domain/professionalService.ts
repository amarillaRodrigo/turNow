import { ApiError } from '../../../shared/errors/ApiError.js';
import * as repo from '../data-access/professionalRepository.js'
import type { CreateProfessionalInput, UpdateProfessionalInput } from '../validators/professionalValidators.js';

export async function registerProfessional(data: CreateProfessionalInput){
    const existing = await repo.findProfessionalByEmail(data.email);
    if (existing && !existing.deletedAt){
        throw new ApiError(409, 'Professional with this email already exists');
    }

    
    const professional = await repo.createProfessional(data);

    return {
        id: professional.id,
        name: professional.name,
        email: professional.email,
        createdAt: professional.createdAt,
    }
}


export async function getProfessionalProfile(id:string){
    const professional = await repo.findProfessionalById(id)

    if(!professional) {
        throw new ApiError(404, 'Professional not found')
    }

    if (professional.deletedAt){
        throw new ApiError(410, 'Professional has been deleted')
    }

    return professional;
}

export async function updateProfessional (id: string, data: UpdateProfessionalInput){
    const professional = await repo.findProfessionalById(id);

    if(!professional) {
        throw new ApiError(404, 'Professional not found')
    }

    if (professional.deletedAt){
        throw new ApiError(410, 'Cannot update a deleted professional')
    }

    if (data.email && data.email !== professional.email){
        const existing = await repo.findProfessionalByEmail(data.email);
        if (existing && !existing.deletedAt){
            throw new ApiError(409, 'Email already in use by another professional')
        }
    }

    const updated = await repo.updateProfessional(id, data)

    return{
        id: updated.id,
        name: updated.name,
        email: updated.email,
        updatedAt: updated.updatedAt,
        services: updated.services,
    }
}

export async function requestAccountDeletion(id: string){
    const professional = await repo.findProfessionalById(id);

    if (!professional){
        throw new ApiError(404, 'Professional not found')
    }

    if (professional.deletedAt){
        throw new ApiError(410, 'Professional already deleted')
    }

    const futureAppointments = professional.appointments.filter(
        (apt) => new Date(apt.scheduled_start_at) > new Date()
    )

    if (futureAppointments.length > 0){
        throw new ApiError(400, 'Cannot delete account with pending appointments. Cancel them first.')
    }

    await repo.softDeleteProfessional(id)

    return { message: 'Account deleted successfully' }
}


export async function getAvailability(id: string, date: Date){
    const professional = await repo.getProfessionalWithAvailability(id)

    if (!professional){
        throw new ApiError(404, 'Professional not found')
    }

    if (professional.deletedAt){
        throw new ApiError(410, 'Professional has been deleted')
    }

    const dayStart = new Date(date);
    dayStart.setHours(0,0,0,0)

    const dayEnd = new Date(date);
    dayEnd.setHours(23,59,59,999)

    const appointmentsForDay = professional.appointments.filter(
        (apt) => 
            new Date(apt.scheduled_start_at) >= dayStart &&
            new Date(apt.scheduled_start_at) <= dayEnd
    );

    return {
        professional: {
            id: professional.id,
            name: professional.name,
        },
        date,
        appointmentsCount: appointmentsForDay.length,
        appointments: appointmentsForDay
    }
}