import {ViewEntity, ViewColumn} from 'typeorm'

@ViewEntity({
    name: 'vehicle_hull',
    expression: `
                SELECT
                  ST_ConcaveHull(ST_Collect(geo), 0.99) as "border"
                  FROM "vehicle"
                `
})
export class VehicleHull {
    @ViewColumn()
    border: object;
}
