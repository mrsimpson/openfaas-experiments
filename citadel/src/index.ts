import "reflect-metadata";
import express from "express";

import {Request, Response} from "express";
import {createConnection} from "typeorm";
import {AppRoutes} from "./routes";
import ORMConfig from "./ormconfig";

// create connection with database
// note that it's not active database connection
// TypeORM creates connection pools and uses them for your requests
createConnection(ORMConfig).then(async connection => {

    // create express app
    const app = express();
    app.use(express.json());

    // register all application routes
    AppRoutes.forEach(route => {
        app[route.method](route.path, (request: Request, response: Response, next: Function) => {
            route.action(request, response)
                .then(() => next)
                .catch(err => next(err));
        });
    });

    // run app
    app.listen(8080);

    console.log("Express application is up and running on port 3000");

}).catch(error => console.log("TypeORM connection error: ", error));
