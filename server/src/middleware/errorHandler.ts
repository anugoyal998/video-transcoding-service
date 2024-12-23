import type { ErrorRequestHandler } from 'express'
import { ZodError } from "zod";
import CustomErrorHandler from '../services/CustomErrorHandler';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let statusCode = 500;
    let data = {
        message: 'Internal Server Error'
    }

    if(err instanceof ZodError){
        statusCode = 422;
        data = {
            message: err.message
        }
    }

    if(err instanceof CustomErrorHandler){
        statusCode = err.status;
        data = {
            message: err.message
        }
    }

    res.status(statusCode).json(data);
}

export default errorHandler