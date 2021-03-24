import {Request, Response} from "express";

export async function health(request: Request, response: Response) {
    response
      .status(200)
      .send('ok')
}
