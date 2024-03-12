import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createRole = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const role = await prisma.role.create({
      data: { name }
    });
    res.status(201).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create role' });
  }
};

const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) }
    });
    res.status(200).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch role' });
  }
};

const updateRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    res.status(200).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

const deleteRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete role' });
  }
};

export { createRole, getAllRoles, getRoleById, updateRoleById, deleteRoleById };
