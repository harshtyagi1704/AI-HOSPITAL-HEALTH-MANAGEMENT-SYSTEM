// const authorize = (...roles) => {
//     return (req, res, next) => {

//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Access Denied"
//             });
//         }

//         next();
//     };
// };

// module.exports = authorize;


const authorize = (...roles) => {
    return (req, res, next) => {
        console.log("USER ROLE:", req.user.role, "ALLOWED:", roles);
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }
        next();
    };
};

module.exports = authorize;