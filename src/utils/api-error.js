class ApiError extends Error{
    constructor(
        statusCode,
        message ,
        error = [],
        stack = "",
    ){
        super(message);
        this.statusCode = statusCode
        this.message = message
        this.success = false
        this.errors = error

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

class ApiSuccess {
    constructor(
        statuscode,
        message,
        info,
    ) {
        this.statusCode = statuscode,
        this.message = message,
        this.info = info,
        this.success = true
    }
}
export {ApiError, ApiSuccess}