import {Request, Response} from "express";
import {getManager} from "typeorm";
import {Vehicle} from "../entity/Vehicle";
import {VehicleHull} from "../entity/VehicleHull";

export async function vehicleGetAllHandler(request: Request, response: Response) {
    const vehicleRepository = getManager().getRepository(Vehicle);
    const vehicles = await vehicleRepository.find();
    response.send(vehicles);
}

export async function vehicleGetByIdHandler(request: Request, response: Response) {
    const vehicleRepository = getManager().getRepository(Vehicle);
    const vehicle = await vehicleRepository.findOne(request.params.id);
    if (!vehicle) {
        response.status(404);
        response.end();
        return;
    }
    response.send(vehicle);
}

export async function vehicleDeleteByIdHandler(request: Request, response: Response) {
    const vehicleRepository = getManager().getRepository(Vehicle);
    const vehicle = await vehicleRepository.findOne(request.params.id);
    if (!vehicle) {
        response.status(404);
        response.end();
        return;
    }
    const deleteResult = vehicleRepository.delete(request.params.id)
    console.log(deleteResult)
    response.send(vehicle);
}

export async function vehicleCreateHandler(request: Request, response: Response) {
    const vehicleRepository = getManager().getRepository(Vehicle);
    const newVehicle = vehicleRepository.create(request.body);
    await vehicleRepository.save(newVehicle);
    response.send(newVehicle);
}

export async function vehicleHullHandler(request: Request, response: Response) {
    const vehicleHullRepository = getManager().getRepository(VehicleHull);
    const hull = await vehicleHullRepository.findOne();
    response.send(hull);
}
