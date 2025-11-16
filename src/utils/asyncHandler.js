const asyncHandler=(requestHandler)=>{
    return (req,res,next)=> {
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=>next(err))
    }
}
export{asyncHandler}

// A higher-order function that wraps an async function 
// to handle errors and pass them to the next middleware

// const asyncHandler=()=>{}
// const asyncHandler=(func)=>()=>{}
// const asyncHandler=(func)=>async()=>{}


// const asyncHandler=(fn)=>async(req,res,next)=>{}// function body
// {
//     try {
//         await fn(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500 ).json({ // respond with error details
//             success:false, // indicate failure
//             message:error.message || "Internal Server Error"
//         });
//     }
// }