import google from "../../assets/google.png";
import twitter from "../../assets/twitter.png";
import facebook from "../../assets/facebook.png";
import backgroundSvg from "../../assets/bg.svg";
import HPClogo from "../../assets/HPClogo.png";
import { useContext, useState, useEffect } from "react";
import { DataContext } from "../../context/DataProvider";
import { useNavigate } from "react-router-dom";
import { authenticateLogin } from "../../services/api";

const loginInitialValues = {
    userName: "",
    password: "",
};

const SignIn = () => {
    const [data, setData] = useState(loginInitialValues);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { setAccount } = useContext(DataContext);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    useEffect(() => {
        if (isSubmitted) {
            const authenticateUser = async () => {
                const response = await authenticateLogin(data);
                if (response && response.status === 200) {
                    console.log('Login successful', response.data);
                    const token = response.data.token;
                    localStorage.setItem('token', token);
                    setAccount(data.userName);
                    localStorage.setItem('account', JSON.stringify(data.userName));
                    console.log(response.data.userId);
                    localStorage.setItem('id', response.data.userId);
                    navigate('/user');
                } else {
                    console.log('Login failed', response ? response.data : 'No response from server');
                }
                setIsSubmitted(false);
            };
            authenticateUser();
        }
    }, [isSubmitted, data, setAccount, navigate]);

    return (
        <div className="relative min-h-screen bg-gray-100">
            {/* Left Section */}
            <div className="w-full md:w-1/2 h-full float-left flex flex-col bg-white p-8">
                <h1 className="font-bold text-3xl md:text-4xl mb-4 mt-4 md:mt-0 text-center md:text-left">Login To Your Account</h1>
                <p className="font-semibold text-lg text-center md:text-left">Login to your account to continue saving lives</p>
                <form onSubmit={handleSubmit} className='mt-8'>
                    <label className="block mb-2 font-semibold" htmlFor="userName">Email</label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        placeholder="Enter Email"
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 placeholder-gray-500 text-lg rounded-md bg-blue-100 focus:outline-none focus:border-blue-500"
                    />
                    <label className="block mt-4 mb-2 font-semibold" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter Password"
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 placeholder-gray-500 text-lg rounded-md bg-blue-100 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center mt-4">
                        <input type="checkbox" id="rememberMe" className="mr-2"/>
                        <label htmlFor="rememberMe" className="text-sm font-semibold">Remember me</label>
                        <a href="#" className="ml-auto text-sm text-blue-500 hover:underline">Forgot password?</a>
                    </div>
                    <div className="mt-6 flex justify-center md:justify-start">
                        <button type="submit" className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-200">Log in</button>
                    </div>
                </form>
                <p className="text-center mt-6 text-sm font-semibold">Or Login Using</p>
                <div className="flex justify-center md:justify-start mt-4">
                    <a href="#" className="mr-4">
                        <img src={google} alt="Google" className="w-12 h-12 rounded-full"/>
                    </a>
                    <a href="https://www.facebook.com" className="mr-4">
                        <img src={facebook} alt="Facebook" className="w-12 h-12 rounded-full"/>
                    </a>
                    <a href="https://www.twitter.com" className="mr-4">
                        <img src={twitter} alt="Twitter" className="w-12 h-12 rounded-full"/>
                    </a>
                </div>
            </div>
            {/* Right Section */}
            <div className="hidden md:block md:w-1/2 h-full bg-blue-600 relative">
                <img src={backgroundSvg} alt="Background" className="absolute inset-0 w-full h-full object-cover"/>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                    <img src={HPClogo} alt="Logo" className="w-32 h-32 mx-auto"/>
                    <h1 className="text-3xl font-bold mt-4">Don't have an account yet?</h1>
                    <h3 className="text-lg mt-2">Let's get you all set up so that you can access all the features that Health Pulse Connect offers.</h3>
                    <button className="mt-4 px-4 py-2 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-100 transition duration-200" onClick={() => navigate('/')}>SIGN UP</button>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
