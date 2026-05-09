import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOODB_CONNECTIONSTRING);
    console.log("lien ket co so du lieu thanhcong");
    
  } catch (error) {
    console.error("Loi ket not CSDL");
   process.exit(1) ;//1:exit with erre,,, 0 : exit with success
  }
};
