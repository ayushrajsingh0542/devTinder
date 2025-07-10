

  const auth=(req,res,next)=>{
    const token="xyz1";
    if(token==="xyz")
    {
        next();
    }
    else
    {
        const err=new Error("unauthorised")
        err.status=404;
        next(err);
    }
}

module.exports={
    auth,
};

