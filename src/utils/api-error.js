class ApiError extends Error{
    constructor(
        statusCode,
        message ,
        error = [],
        stack = "",
        success,a
    ){
        super(message);
        this.statusCode = statusCode
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}