import prisma from "../../../shared/db/prisma.js"; 
import type { CreateProfessionalInput, UpdateProfessionalInput } from "../validators/professionalValidators.js";

// Crear nuevo profesional

export async function createProfessional(data: CreateProfessionalInput) {
    return prisma.professional.create({
        data: {
            name: data.name,
            email: data.email,
        },
    });
}

// Buscar profesional por ID
export async function findProfessionalById(id: string){
    return prisma.professional.findUnique({
        where: { id },
        include: {
            services: {
                where: { deletedAt: null },
            },
            appointments: {
                where: { deletedAt: null },
                include: {
                    events: {
                        orderBy: {occurred_at: 'asc'}
                    }
                }
            }
        }
    })
}


// Buscar profesional por email

export async function findProfessionalByEmail(email: string){
    return prisma.professional.findUnique({
        where: {email},
    })
}

// Listar profesionales activos

export async function listProfessionals(){
    return prisma.professional.findMany({
        where: { deletedAt: null },
        include: {
            services: {
                where: { deletedAt:null}
            }
        },
        orderBy: { createdAt: 'desc' },
    })
}

// Actualizar profesional

export async function updateProfessional(id: string, data: UpdateProfessionalInput){
    return prisma.professional.update({
        where: { id },
        data: {
            ...(data.name && {name : data.name}),
            ...(data.email && { email : data.email}),
            updatedAt: new Date()
        },
        include: {
            services: {
                where: { deletedAt: null}
            }
        }
    })
}


// Soft Delete de profesional

export async function softDeleteProfessional(id: string){
    return prisma.professional.update({
        where: {id},
        data: { deletedAt: new Date() },
    })
}

// Obtener profesionales + horarios disponibles

export async function getProfessionalWithAvailability(id: string){
    return prisma.professional.findUnique({
        where: { id },
        include: {
            services: {
                where: {deletedAt: null}
            },
            appointments: {
                where: {
                    deletedAt: null,
                    scheduled_start_at: {
                        gte: new Date()
                    }
                },
                orderBy: { scheduled_start_at: 'asc'}
            }
        }
    })
}