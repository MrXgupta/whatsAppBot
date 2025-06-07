const fs = require('fs');
const csv = require('csv-parser');
const Contacts = require('../models/Contact');
const {Parser} = require('json2csv');

// This function will validate the number
const validateNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return /^91[6-9][0-9]{9}$/.test(cleaned);
};

const BATCH_SIZE = 5000;
// This function will validate and save all the numbers in the db , it will validate in Background
const AddContactGroup = async (req, res) => {
    try {
        const {userId, groupName, filePath} = req.body;

        if (!userId || !groupName || !filePath) {
            return res.status(400).json({error: 'User ID, group name, and file path are required.'});
        }

        const existing = await Contacts.findOne({userId, groupName});
        if (existing) {
            return res.status(400).json({error: 'Group name already exists for this user.'});
        }

        // Step 1: Save empty group doc as placeholder for first batch (batch #0)
        const group = await Contacts.create({
            userId,
            groupName,
            numbers: [],
            validNumbers: [],
            invalidNumbers: [],
            contactData: [],
            validationStatus: 'processing',
            addedAt: new Date(),
            duplicatesRemoved: 0,
            batchNumber: 0, // batch 0 for original group doc
        });

        res.status(201).json({
            success: true,
            message: 'Group creation started. CSV will be processed in background.',
            groupId: group._id,
        });

        setImmediate(() => processCSVFile(filePath, userId, groupName));

    } catch (error) {
        console.error('Error saving contact group:', error);
        res.status(500).json({error: 'Failed to save contact group.'});
    }
};

const processCSVFile = (filePath, userId, baseGroupName) => {
    const rawNumbers = [];
    const rawContactData = [];
    let headers = [];
    let headerMap = {};
    let firstColumnName = '';

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headerList) => {
            headers = headerList.map(h => {
                const sanitized = h.replace(/\./g, '_').trim();
                headerMap[sanitized] = h;
                return sanitized;
            });
            firstColumnName = headers[0];
            console.log(`📊 CSV Headers: ${headers.join(', ')}`);
        })
        .on('data', (row) => {
            const rawNumber = row[headerMap[firstColumnName]]?.toString().trim();
            if (!rawNumber || rawNumber.toLowerCase() === headerMap[firstColumnName].toLowerCase()) return;

            // Convert number, removing trailing zeros after decimal if any
            const cleanedNum = Number(rawNumber).toString().replace(/\.0+$/, '');

            if (cleanedNum.length >= 10) {
                rawNumbers.push(cleanedNum);

                const additionalInfo = {};
                headers.forEach(sanitizedKey => {
                    const originalKey = headerMap[sanitizedKey];
                    additionalInfo[sanitizedKey] = row[originalKey]?.toString().trim() || '';
                });

                rawContactData.push({
                    number: cleanedNum,
                    additionalInfo,
                });
            }
        })
        .on('end', async () => {
            try {
                // Deduplicate and validate full dataset before batching
                // We'll prepare an array of objects: { number, valid, isDuplicate, contactData }
                const seen = new Set();
                const fullValidationResults = [];
                let totalDuplicates = 0;

                for (let i = 0; i < rawNumbers.length; i++) {
                    const num = rawNumbers[i].replace(/\D/g, '');
                    const isDuplicate = seen.has(num);
                    if (!isDuplicate) seen.add(num);

                    const isValid = !isDuplicate && validateNumber(num);
                    if (isDuplicate) totalDuplicates++;

                    fullValidationResults.push({
                        number: num,
                        valid: isValid,
                        isDuplicate,
                        contactData: rawContactData[i],
                    });
                }

                // Now split fullValidationResults into batches of BATCH_SIZE
                let batchCount = 0;
                for (let i = 0; i < fullValidationResults.length; i += BATCH_SIZE) {
                    const batchSlice = fullValidationResults.slice(i, i + BATCH_SIZE);

                    // Separate valid, invalid, duplicates within this batch
                    const batchValidNumbers = batchSlice.filter(x => x.valid).map(x => x.number);
                    const batchInvalidNumbers = batchSlice.filter(x => !x.valid && !x.isDuplicate).map(x => x.number);
                    const batchDuplicatesRemoved = batchSlice.filter(x => x.isDuplicate).length;

                    const batchContactData = batchSlice
                        .filter(x => !x.isDuplicate) // only keep first occurrence of duplicates in contactData
                        .map(x => x.contactData);

                    const batchGroupName = batchCount === 0 ? baseGroupName : `${baseGroupName} ${batchCount}`;

                    if (batchCount === 0) {
                        // Update existing batch 0 document (created earlier)
                        await Contacts.findOneAndUpdate(
                            {userId, groupName: baseGroupName},
                            {
                                numbers: batchValidNumbers.concat(batchInvalidNumbers), // all numbers in batch
                                validNumbers: batchValidNumbers,
                                invalidNumbers: batchInvalidNumbers,
                                contactData: batchContactData,
                                validationStatus: 'validated',
                                duplicatesRemoved: batchDuplicatesRemoved,
                                batchNumber: 0,
                            },
                            {new: true}
                        );
                        console.log(`Updated batch 0 group: ${baseGroupName}`);
                    } else {
                        // Create new batch document for batch > 0
                        await Contacts.create({
                            userId,
                            groupName: batchGroupName,
                            numbers: batchValidNumbers.concat(batchInvalidNumbers),
                            validNumbers: batchValidNumbers,
                            invalidNumbers: batchInvalidNumbers,
                            contactData: batchContactData,
                            validationStatus: 'validated',
                            duplicatesRemoved: batchDuplicatesRemoved,
                            addedAt: new Date(),
                            batchNumber: batchCount,
                        });
                        console.log(`Created batch ${batchCount} group: ${batchGroupName}`);
                    }

                    batchCount++;
                }

                // Delete file after processing
                fs.unlink(filePath, (err) => {
                    if (err) console.error('❌ Error deleting uploaded file:', err);
                    else console.log('🗑️ CSV file deleted after processing.');
                });

                console.log(`✅ Finished processing base group "${baseGroupName}" with ${batchCount} batch(es).`);

            } catch (error) {
                console.error('❌ Error processing CSV:', error);
            }
        })
        .on('error', (err) => {
            console.error('❌ CSV Read Error:', err);
        });
};

// Function to fetch the contacts groups per user
const getContacts = async (req, res) => {
    try {
        const {userId} = req.body;
        if (!userId) return res.status(400).json({error: 'User ID is required'});

        const groups = await Contacts.find({userId})
            .select('groupName validNumbers invalidNumbers duplicatesRemoved validationStatus addedAt')
            .lean();

        const simplifiedGroups = groups.map(group => ({
            _id: group._id,
            groupName: group.groupName,
            validCount: group.validNumbers?.length || 0,
            invalidCount: group.invalidNumbers?.length || 0,
            duplicatesRemoved: group.duplicatesRemoved || 0,
            status: group.validationStatus,
            addedAt: group.addedAt
        }));

        res.status(200).json({success: true, groups: simplifiedGroups});
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({error: 'Failed to fetch contacts.'});
    }
};


// Function to get the contacts from the contact Group
const getContactsById = async (req, res) => {
    const {id} = req.params;
    const {type = 'all', page = 1, limit = 10} = req.query;

    try {
        const group = await Contacts.findOne({_id: id});
        if (!group) {
            return res.status(404).json({error: 'Group not found for this user'});
        }

        let contactData = group.contactData;

        // Filter based on type
        if (type === 'valid') {
            contactData = group.contactData.filter(entry =>
                group.validNumbers.includes(entry.number)
            );
        } else if (type === 'invalid') {
            contactData = group.contactData.filter(entry =>
                group.invalidNumbers.includes(entry.number)
            );
        }

        const total = contactData.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const paginated = contactData.slice(start, start + parseInt(limit));

        // Convert Map to plain object for response
        const contactRows = paginated.map(entry => {
            const obj = {};
            for (const [key, value] of entry.additionalInfo.entries()) {
                obj[key] = value;
            }
            return obj;
        });

        res.status(200).json({
            groupInfo: {
                groupName: group.groupName,
                addedAt: group.addedAt,
                validationStatus: group.validationStatus,
                totalContacts: group.numbers.length,
                totalValid: group.validNumbers.length,
                totalInvalid: group.invalidNumbers.length,
                duplicatesRemoved: group.duplicatesRemoved
            },
            contactData: contactRows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error('❌ Error fetching group by ID:', err);
        res.status(500).json({error: 'Failed to get the details'});
    }
};

// Function to delete the whole contact group 
const deleteGroupContact = async (req, res) => {
    try {
        const {id, userId} = req.params;

        const deleted = await Contacts.findOneAndDelete({_id: id, userId});

        if (!deleted) {
            return res.status(404).json({success: false, message: "Group contact not found or unauthorized"});
        }

        res.status(200).json({success: true, message: "Group contact deleted successfully"});
    } catch (err) {
        console.error("Error deleting group contact:", err);
        res.status(500).json({success: false, message: "Internal server error"});
    }
};

const exportValidatedContacts = async (req, res) => {
    const {id} = req.params;

    try {
        const group = await Contacts.findById(id);
        if (!group) return res.status(404).json({error: "Group not found"});

        const validContactData = group.contactData.filter(entry =>
            group.validNumbers.includes(entry.number)
        );

        // Convert Map to plain object
        const plainData = validContactData.map(entry => {
            const obj = {};
            for (const [key, value] of entry.additionalInfo.entries()) {
                obj[key] = value;
            }
            return obj;
        });

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(plainData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`${group.groupName}_valid_contacts.csv`);
        return res.send(csv);
    } catch (err) {
        console.error("Export error:", err);
        res.status(500).json({error: "Failed to export validated contacts"});
    }
};

const getContactGroupsSummary = async (req, res) => {
    try {
        const {userId} = req.body;

        if (!userId) {
            return res.status(400).json({error: 'User ID is required.'});
        }

        const groups = await Contacts.find({userId})
            .select('groupName validNumbers')
            .lean();

        const groupSummaries = groups.map(group => ({
            _id: group._id,
            groupName: group.groupName,
            validCount: group.validNumbers?.length || 0
        }));

        res.status(200).json({success: true, groups: groupSummaries});

    } catch (error) {
        console.error('Error fetching contact groups summary:', error);
        res.status(500).json({error: 'Failed to fetch contact group summaries.'});
    }
};


module.exports = {
    AddContactGroup,
    getContacts,
    getContactsById,
    deleteGroupContact,
    exportValidatedContacts,
    getContactGroupsSummary
};