import { Request, Response } from "express";
import { IUser, User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/ApiResponse";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendVerificationEmail from "../utils/sendVerificationEmail";

const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  console.log({ username, email, password });

  if (!username || !email || !password) {
    return res.status(400).json(new ApiResponse(400, [], "Invalid parameter"));
  }

  const userExist: IUser | null = await User.findOne({ email });
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = bcrypt.hashSync(token, 9);

  if (userExist) {
    if (userExist.isEmailVerified) {
      return res
        .status(400)
        .json(new ApiResponse(400, [], "User with email already exists"));
    } else {
      userExist.password = password;
      userExist.username = username;
      userExist.emailVerifyToken = hashedToken;
      userExist.emailVerifyTokenExpiry = new Date(Date.now() + 3600000);

      await userExist.save();
    }
  } else {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    const newUser = new User({
      username,
      password,
      email,
      emailVerifyToken: hashedToken,
      emailVerifyTokenExpiry: expiryDate,
    });

    await newUser.save();
  }

  // send verification email
  const { data, error } = await sendVerificationEmail({
    username,
    email,
    token,
  });

  console.log({ data });

  if (error) {
    return res
      .status(400)
      .json(new ApiResponse(400, [], "Unable to send email, do signup again"));
  }

  if (data) {
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          [],
          "User registered successfully, Please verify your email"
        )
      );
  } else {
    return res
      .status(400)
      .json(new ApiResponse(400, [], "Unable to send email, do signup again"));
  }
});

export { register };
