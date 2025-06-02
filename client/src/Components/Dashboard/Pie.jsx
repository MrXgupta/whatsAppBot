import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {useEffect, useState} from 'react';

const Pie = ({progress}) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 100);
        return () => clearTimeout(timeout);
    }, [progress]);
    return (
        <>
            <div className="bg-white shadow rounded p-4 mt-4 flex flex-col items-center">
                <h2 className="text-sm text-gray-600 mb-2">📬 Current Sending Progress</h2>
                <div className="w-28 h-28">
                    <CircularProgressbar
                        value={animatedProgress}
                        text={`${animatedProgress}%`}
                        styles={buildStyles({
                            pathColor: '#4f46e5', // indigo
                            textColor: '#111827',
                            trailColor: '#e5e7eb',
                            textSize: '16px',
                            pathTransitionDuration: 0.6,
                        })}
                    />
                </div>
            </div>
        </>
    )
}

export default Pie;