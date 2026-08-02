import Course from "../models/courseModel.js";
import razorpay from 'razorpay'
import crypto from "crypto";
import User from "../models/userModel.js";
import { sendCourseEnrollmentMail } from "../configs/Mail.js";
import dotenv from "dotenv"
dotenv.config()

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
})

export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const options = {
      amount: course.price * 100, // in paisa
      currency: 'INR',
      receipt: courseId.toString(),
    };

    const order = await razorpayInstance.orders.create(options);

    return res.status(200).json(order);

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Order creation failed" });
  }
};



export const verifyPayment = async (req, res) => {
  try {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    const userId = req.userId; // from isAuth - never trust a client-supplied userId for enrollment

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return res.status(400).json({ message: "Missing payment verification details" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;
    const orderInfo = isSignatureValid ? await razorpayInstance.orders.fetch(razorpay_order_id) : null;

    if(isSignatureValid && orderInfo.status === 'paid') {
      // Update user and course enrollment
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.enrolledCourses.includes(courseId)) {
        user.enrolledCourses.push(courseId);
        await user.save();
        }

      const course = await Course.findById(courseId).populate("lectures");
        
      if (!course.enrolledStudents.includes(userId)) {
        course.enrolledStudents.push(userId);
        await course.save();
      }

      // Send confirmation email to the user
      try {
        await sendCourseEnrollmentMail(
          user.email,
          user.name,
          course.title,
          courseId
        );
        console.log('Course enrollment confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send enrollment email:', emailError);
        // Don't fail the entire request if email fails
      }

      return res.status(200).json({ message: "Payment verified and enrollment successful" });
    
    } else {
      return res.status(400).json({ message: "Payment verification failed (invalid signature)" });
    }
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error during payment verification" });
  }
};
