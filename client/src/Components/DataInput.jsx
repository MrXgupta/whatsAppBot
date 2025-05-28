import React from "react";

const DataInput = ({fileRef, handleFileUpload, handleAddNumber}) => {
    return (
        <>
            <div className="mb-4">
                <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="border p-2 w-full rounded" />
            </div>

            <form onSubmit={handleAddNumber} className="flex gap-4 mb-4">
                <input name="number" className="border p-2 flex-1 rounded" placeholder="Enter number with country code" />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
            </form>
        </>
    )
}

export default DataInput;