import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true,
        unique: true
    },

    password:{
        type: String,
        required: true
    }
    ,
    avatar: {
        type: String,
        default: null
    }
})

// Register using capitalized name "User" to match refs in other schemas
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;