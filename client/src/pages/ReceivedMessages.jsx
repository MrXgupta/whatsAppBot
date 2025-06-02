import {ScrollText} from "lucide-react";

const ReceivedMessages = () => {
    return (
        <>
        <div className="p-4">
            <div className="flex gap-4 pb-4 border-b-2 border-gray-500">
                <ScrollText/>
            <h1 className="text-2xl font-bold color-red-500">Inbox ~ </h1>
            </div>
        </div>
        </>
    )
}

export default ReceivedMessages;