import {handleAddNumber, handleFileUpload} from "../Components/Functions.js";
import DataInput from "../Components/DataInput.jsx";
import React, {useRef} from "react";

const Contacts = () => {
    const fileRef = useRef();
    return (
        <>
            <h1 className="text-2xl font-bold p-4 ">Add Contacts</h1>
            <DataInput
                fileRef={fileRef}
                handleFileUpload={(e) => handleFileUpload(e, dispatch)}
                handleAddNumber={(e) => handleAddNumber(e, dispatch, numbers)}
            />
        </>
    )
}

export default Contacts;