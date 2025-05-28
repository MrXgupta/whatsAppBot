import {
    setNumbers, addNumber, setLogs,
} from '../slices/appSlice';
import Swal from 'sweetalert2';
import axios from "axios";

export const handleReconnect = async (setLoadingQr) => {
    try {
        setLoadingQr(true);
        const res = await axios.post('http://localhost:3000/restart-client');
        Swal.fire({ icon: 'success', title: 'Client Restarted', text: res.data.message });
    } catch (err) {
        setLoadingQr(false);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to restart client' });
    }
};

export const handleFileUpload = (e, dispatch) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const lines = event.target.result.split(/\r\n|\n/);
        const parsed = lines.filter(Boolean).map(num => ({ number: num.trim(), status: '' }));
        dispatch(setNumbers(parsed));
    };
    reader.readAsText(file);
};

export const handleAddNumber = (e, dispatch, numbers) => {
    e.preventDefault();
    const number = e.target.number.value.trim();
    if (!number) return Swal.fire({ icon: 'error', title: 'Error', text: 'Number is required' });
    if (!/^[0-9]{12}$/.test(number)) return Swal.fire({ icon: 'error', title: 'Invalid Number', text: 'Enter 12-digit number incl. country code' });
    if (numbers.find(n => n.number === number)) return Swal.fire({ icon: 'warning', title: 'Duplicate', text: 'Number already exists' });

    dispatch(addNumber({ number, status: '' }));
    e.target.reset();
};

export const handleSend = async (dispatch, numbers, message, setSending, minDelay, maxDelay,) => {
    if (!message.trim()) return Swal.fire({ icon: 'error', title: 'Error', text: 'Message cannot be empty' });
    if (!numbers.length) return Swal.fire({ icon: 'error', title: 'Error', text: 'Add numbers first' });

    dispatch(setLogs({ success: [], failed: [] }));
    dispatch(setNumbers(numbers.map(n => ({ ...n, status: '' }))));
    setSending(true);

    try {
        await axios.post('http://localhost:3000/send', {
            numbers: numbers.map(n => n.number),
            message,
            minDelay,
            maxDelay,
        });
    } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to send messages' });
    } finally {
        setSending(false);
    }
};