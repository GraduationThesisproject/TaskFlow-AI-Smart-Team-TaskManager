import { Routes, Route } from "react-router-dom";
import  SignIn  from "../layouts/Landing/SignIn";
import SignUp from "../layouts/Landing/SignUP";

export const LandingPage = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<div>Landing Page</div>} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </div>
    );
};