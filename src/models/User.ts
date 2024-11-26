import mongoose, { Schema, Document } from "mongoose";

// Define the TypeScript interface for the User properties
export interface UserProps {
  email: string;
  account: {
    username: string;
    avatar?: string;

    address: string; // Ensure address is defined here
    phoneNumber: string; // Define phoneNumber here
    country?: string; // Optional property
  };
  newsletter?: boolean;
  token: string;
  hash: string;
  salt: string;
  _id: string;
}

// Define the Mongoose schema for the User
const UserSchema = new Schema<UserProps>({
  email: { type: String, required: true },
  account: {
    username: { type: String, required: true },
    avatar: { type: String },

    address: { type: String, required: true }, // Include address here
    phoneNumber: { type: String, required: true }, // Include phoneNumber here
    country: { type: String, required: true },
  },
  newsletter: { type: Boolean, default: false },
  token: { type: String, required: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
});

// Export the Mongoose model with the User interface
const User = mongoose.model<UserProps & Document>("User", UserSchema);

export default User;
