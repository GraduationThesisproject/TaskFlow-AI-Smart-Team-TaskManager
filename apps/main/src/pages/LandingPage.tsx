import { Routes, Route } from "react-router-dom";
import  SignIn  from "../layouts/Landing/SignIn";
import SignUp from "../layouts/Landing/SignUP";
import  LandingNavbar  from "../components/common/navbar/landingnav/navbar";

export const LandingPage = () => {
    return (
        <div>
            <LandingNavbar />
            <Routes>
                <Route path="/" element={<div>Landing Page</div>} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </div>
    );
};