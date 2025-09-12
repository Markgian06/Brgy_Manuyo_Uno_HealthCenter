import signUpModels from "../DatabaseModel/signUpSchema.js";
import jwt from "jsonwebtoken";


export const getUserData = async (req, res) =>{
    try{
        const {userId} = req.body;

        const user = await signUpModels.findById(userId);

        if(!user){
            return res.json({success: false, message: "User not found"});
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        });
    }
    catch(error){
        res.json({success: false, message: error.message});
    }
}

export const getPatientProfile = async (req, res) => {
    try {
        let userId;
        
        // Try to get userId from different sources
        if (req.params.userId) {
            userId = req.params.userId;
        } else if (req.body.userId) {
            userId = req.body.userId;
        } else if (req.cookies.userId) {
            userId = req.cookies.userId;
        } else if (req.headers.authorization) {
            // If you're using JWT tokens, extract userId from token
            // userId = extractUserIdFromToken(req.headers.authorization);
        }
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID not found. Please ensure you are logged in.' 
            });
        }

        // Find user by MongoDB _id
        const patient = await signUpModels.findById(userId)
        .select('patientID firstName lastName birthDate age gender email contactNum isAccountVerified');

        if (!patient) {
            return res.status(404).json({ 
                success: false, 
                message: 'Patient not found' 
            });
        }

        // Format the response with all requested fields
        const patientData = {
            patientID: patient.patientID,
            firstName: patient.firstName,
            lastName: patient.lastName,
            fullName: `${patient.firstName} ${patient.lastName}`,
            birthDate: patient.birthDate,
            age: patient.age,
            gender: patient.gender,
            email: patient.email,
            contactNum: patient.contactNum,
            isAccountVerified: patient.isAccountVerified

        };

        res.status(200).json({
            success: true,
            data: patientData
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
};

export const checkAuth = async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.json({ loggedIn: false });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await signUpModels.findById(decoded.id).select("-password");
  
      if (!user) return res.json({ loggedIn: false });
  
      res.json({
        loggedIn: true,
        user: {
          _id: user._id,
          email: user.email,
          isAccountVerified: user.isAccountVerified
        }
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.json({ loggedIn: false });
    }
  };