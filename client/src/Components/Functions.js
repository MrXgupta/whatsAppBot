import Swal from 'sweetalert2';
import axios from "axios";

export const handleFileUpload = (e, setPreview, setFilePath) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const lines = event.target.result.split(/\r\n|\n/).filter(Boolean);
        const headers = lines[0].split(',');

        const preview = lines.slice(1, 101).map(line => {
            const cols = line.split(',');
            return {
                number: cols[0]?.trim(),
                status: ''
            };
        });
        setPreview(preview);

        const formData = new FormData();
        formData.append('contactsFile', file);

        fetch(`${import.meta.env.VITE_BASE_URL}/upload-csv`, {
            method: 'POST',
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                console.log('Uploaded to backend:', data);
                if (data.filePath) {
                    setFilePath(data.filePath);
                }
            })
            .catch(err => {
                console.error('Upload failed:', err);
            });
    };
    reader.readAsText(file);
};


// export const handleAddNumber = (e, dispatch, numbers) => {
//     e.preventDefault();
//     const number = e.target.number.value.trim();
//     if (!number) return Swal.fire({icon: 'error', title: 'Error', text: 'Number is required'});
//     if (!/^[0-9]{12}$/.test(number)) return Swal.fire({
//         icon: 'error',
//         title: 'Invalid Number',
//         text: 'Enter 12-digit number incl. country code'
//     });
//     if (numbers.find(n => n.number === number)) return Swal.fire({
//         icon: 'warning',
//         title: 'Duplicate',
//         text: 'Number already exists'
//     });
//     dispatch(addNumber({number, status: ''}));
//     e.target.reset();
// };

export const handleSend = async ({
                                     campaignName,
                                     selectedContactGroup,
                                     message,
                                     minDelay,
                                     maxDelay,
                                     mediaFile,
                                     setSending,
                                     user,
                                 }) => {

    console.log(user)
    if (!campaignName.trim() || !selectedContactGroup || !message.trim()) {
        return Swal.fire({icon: 'error', title: 'Missing Fields', text: 'Please fill all campaign details.'});
    }

    const formData = new FormData();

    formData.append('campaignName', campaignName);
    formData.append('groupId', selectedContactGroup);
    formData.append('message', message);
    formData.append('minDelay', minDelay);
    formData.append('maxDelay', maxDelay);
    formData.append('userId', user._id);

    if (mediaFile) {
        formData.append('media', mediaFile);
        console.log('📤 Appended media file:', mediaFile);
    }

    setSending(true);

    try {
        const {data} = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/send`,
            formData,
            {headers: {'Content-Type': 'multipart/form-data'}}
        );

        const {total} = data;
        const avgDelay = (parseInt(minDelay) + parseInt(maxDelay)) / 2;
        const estimatedSeconds = Math.ceil(total * avgDelay);
        const minutes = Math.floor(estimatedSeconds / 60);
        const seconds = estimatedSeconds % 60;

        Swal.fire({
            icon: 'success',
            title: 'Campaign Started',
            html: `
                Campaign messages are being sent in background.<br/>
                <b>Estimated completion time:</b> ${minutes}m ${seconds}s for ${total} messages.
            `,
        });
    } catch (err) {
        console.error(err);
        Swal.fire({icon: 'error', title: 'Error', text: 'Failed to send campaign messages.'});
    } finally {
        setSending(false);
    }
};

