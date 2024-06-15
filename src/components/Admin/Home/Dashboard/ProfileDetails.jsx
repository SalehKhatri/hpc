import { useEffect, useState } from "react";
import { CiGrid41, CiCircleList } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { getChildByParentId, getPatients } from "../../../../services/api";

const ProfileDetails = () => {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handlePatientClick = async (patient) => {
    try {
      const childDataResponse = await getChildByParentId(patient._id);
      navigate(`/admin/patients/${patient._id}`, {
        state: { patient, childData: childDataResponse },
      });
    } catch (error) {
      console.error("Error fetching child data:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header Section */}
      <header className="bg-[#92a8c6] text-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold">Pediatrician Dashboard</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row mt-6 gap-6">
        {/* Left Section */}
        <div className="w-full md:w-4/5">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <h3 className="font-semibold text-gray-700">Patients per Month</h3>
              <p className="text-[#92a8c6] text-xl">150</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <h3 className="font-semibold text-gray-700">New Patients</h3>
              <p className="text-[#92a8c6] text-xl">30</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <h3 className="font-semibold text-gray-700">Satisfied Patients</h3>
              <p className="text-[#92a8c6] text-xl">120</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <h3 className="font-semibold text-gray-700">Recovered Patients</h3>
              <p className="text-[#92a8c6] text-xl">100</p>
            </div>
          </div>

          {/* Table Section */}
          <div className="py-6 px-4 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center font-semibold text-lg">
              <h2 className="text-gray-800">Current Patients</h2>
            </div>
            <div className="pt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#92a8c6] text-white">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">State</th>
                  </tr>
                </thead>
                <tbody>
                  {patients?.map((patient,key) => (
                    <tr
                      key={key}
                      onClick={() => handlePatientClick(patient)}
                      className="cursor-pointer hover:bg-[#92a8c6] hover:text-white transition-colors duration-200"
                    >
                      <td className="px-4 py-3 border-b border-gray-200">
                        {patient.userName}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        {patient.phoneNumber}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        {patient.gender}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        {patient.state}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/5 bg-[#D9D9D9] p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <h2 className="font-semibold text-lg text-gray-700">Appointments</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-[#92a8c6] text-white p-3 rounded-lg shadow-lg">
              <div>
                <h3 className="text-sm font-semibold">Mr. Srinivas</h3>
                <p className="text-xs">Consultation, 01 Jun, 10:00 AM</p>
              </div>
              <img
                src="https://t4.ftcdn.net/jpg/02/90/27/39/360_F_290273933_ukYZjDv8nqgpOBcBUo5CQyFcxAzYlZRW.jpg"
                alt="dp"
                className="h-10 w-10 rounded-full"
              />
            </div>
            {/* Add more consultation entries as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
