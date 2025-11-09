
class ApiError extends Error { // custom error class extending built-in Error
    constructor(
        message = "something went wrong",
        statusCode,
        errors=[],
        stack =""
    ){// constructor with default parameters
        // Status code indicates the type of error
        //  (e.g., 404, 500)
        super(message);
        this.statusCode=statusCode;// set status code
        this.data=null,//
        this.message=message;
        this.success=false;
        this.errors=errors;
        
        // set stack trace- if provided, use it; otherwise, capture current stack trace
        // TRACE- the sequence of function calls leading to the error
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
}

export {ApiError}