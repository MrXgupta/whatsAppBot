import {
    CircularProgressbarWithChildren,
    buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const SuccessRatePie = ({ totalSent, totalFailed }) => {
    const total = totalSent + totalFailed;
    const successRate = total === 0 ? 0 : (totalSent / total) * 100;

    return (
        <div className="">
            <CircularProgressbarWithChildren
                value={successRate}
                strokeWidth={14}
                styles={buildStyles({
                    pathColor: "#10B981",
                    trailColor: "#F87171",
                })}
            >
                <div className="text-center">
                    <div className="text-xl font-semibold text-gray-800">
                        {successRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                </div>
            </CircularProgressbarWithChildren>
        </div>
    );
};

export default SuccessRatePie;
