import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const AppointmentDetails = () => {
    const localizer = dayjsLocalizer(dayjs);
    const generateRandomEvents = () => {
        const events = [];
        const today = new Date();
        const currentMonth = today.getMonth();
        const daysInMonth = new Date(today.getFullYear(), currentMonth + 1, 0).getDate(); 
        for (let i = 0; i < 8; i++) {
            const dayOfMonth = Math.floor(Math.random() * daysInMonth) + 2; 
            const start = new Date(today.getFullYear(), currentMonth, dayOfMonth);
            start.setHours(Math.floor(Math.random() * 24)); 
            start.setMinutes(Math.floor(Math.random() * 60)); 
            const end = new Date(start.getTime() + Math.floor(Math.random() * 7200000)); 
            events.push({
                title: `Event ${i + 1}`,
                start,
                end,
            });
        }
        return events;
    };
    return (
        <div className="w-full flex justify-between items-center pt-4 px-4 gap-16">
            <div className="w-full">
                <h2 className="text-lg font-semibold">Appointment</h2>
                <div className='py-16'>
                    <Calendar
                        localizer={localizer}
                        events={generateRandomEvents()}
                        startAccessor="start"
                        endAccessor="end"
                        style={{height: 500}}
                    />
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetails;
