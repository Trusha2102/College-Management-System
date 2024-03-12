import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createModule = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const module = await prisma.module.create({
      data: { name }
    });
    res.status(201).json(module);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create module' });
  }
};

const getAllModules = async (req: Request, res: Response) => {
  try {
    const modules = await prisma.module.findMany();
    res.status(200).json(modules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch modules' });
  }
};

const getModuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const module = await prisma.module.findUnique({
      where: { id: parseInt(id) }
    });
    res.status(200).json(module);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch module' });
  }
};

const updateModuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const module = await prisma.module.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    res.status(200).json(module);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update module' });
  }
};

const deleteModuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.module.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete module' });
  }
};

export { createModule, getAllModules, getModuleById, updateModuleById, deleteModuleById };
