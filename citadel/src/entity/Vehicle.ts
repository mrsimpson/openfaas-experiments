import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'

export enum VehicleType {
    bike = "bike",
    roller = "roller"
}

@Entity()
export class Vehicle {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column('geometry', {
        name: 'geo',
        nullable: true,
        spatialFeatureType: 'Point',
    })
    location: object;
}