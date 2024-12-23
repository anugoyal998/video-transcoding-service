class CustomErrorHandler extends Error {
    status: number;
    message: string;
    constructor(status: number, msg: string) {
        super();
        this.status = status;
        this.message = msg;
    }

    static alreadyExist(msg: string) {
        return new CustomErrorHandler(409, msg);
    }

    static wrongCredentials(message = 'Username or password is wrong!') {
        return new CustomErrorHandler(401, message);
    }

    static unAuthorized(message = 'unAuthorized') {
        return new CustomErrorHandler(401, message);
    }

    static notFound(message = '404 Not Found') {
        return new CustomErrorHandler(404, message);
    }

    static serverError(message = 'Internal server error') {
        return new CustomErrorHandler(500, message);
    }
}

export default CustomErrorHandler