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

export const handleSend = async ({
                                     campaignName,
                                     selectedContactGroup,
                                     message,
                                     minDelay,
                                     maxDelay,
                                     mediaFile,
                                     setSending

                                 }) => {
    if (!campaignName.trim() || !selectedContactGroup || !message.trim()) {
        return Swal.fire({ icon: 'error', title: 'Missing Fields', text: 'Please fill all campaign details.' });
    }

    setSending(true);

    try {
        const formData = new FormData();
        formData.append('campaignName', campaignName);
        formData.append('groupId', selectedContactGroup);
        formData.append('message', message);
        formData.append('minDelay', minDelay);
        formData.append('maxDelay', maxDelay);

        if (mediaFile) {
            formData.append('media', mediaFile);
            console.log('📤 Appended media file:', mediaFile);
        }

        await axios.post('http://localhost:3000/send', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        Swal.fire({ icon: 'success', title: 'Message Sent', text: 'Campaign messages sent successfully.' });
    } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to send campaign messages.' });
    } finally {
        setSending(false);
    }
};
