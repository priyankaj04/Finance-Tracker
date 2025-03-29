const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

router.post('/createnew', async (req, res) => {
    // * request = { name, value, type, date, total }
    // * response = { status, message }
    try {

        const { name, value, type, date, total, spendingtype, paymenttype } = req.body;

        const insertBody = {
            name, value, type, date, total, spendingtype, paymenttype
        }

        const { data, error } = await supabase
            .from('tracker')
            .insert([insertBody])
            .select()

        if (error) {
            console.log("failedtoinsert", error);
            return res.status(500).json({ status: 0, message: error});
        }
        return res.status(200).json({ status: 1, message: "Successfully Inserted." });
    } catch (error) {
        console.log("tasks_creation_error", error)
        return res.status(500).json({ status: 0, message: "Failed to create task." });
    }
})


router.get('/all', async (req, res) => {
    // * response = { status, data }
    try {
        const { data: tracker, getError } = await supabase.from('tracker').select()

        if (getError) {
            console.log("failedtoget", getError);
            return res.status(500).json({ status: 0, message: getError });
        }

        return res.status(200).json({ status: 1, data: tracker });
    } catch (error) {
        console.log("tasks_creation_error", error)
        return res.status(500).json({ status: 0, message: "Failed to create task." });
    }
})


router.patch('/:id', async (req, res) => {
    // * request = { name, value, type, date, total }
    // * response = { status, message }
    try {

        const { data, error } = await supabase.from('tracker').update(req.body).eq('id', req.params.id).select();

        if (error) {
            console.log("failedtopatch", error);
            return res.status(500).json({ status: 0, message: error });
        }

        return res.status(200).json({ status: 1, data: data });
    } catch (error) {
        console.log("tasks_creation_error", error)
        return res.status(500).json({ status: 0, message: "Failed to create task." });
    }
})

router.delete('/:id', async (req, res) => {
    // * response = { status, message }
    try {

        const { data, error } = await supabase.from('tracker').delete().eq('id', req.params.id).select();

        if (error) {
            console.log("failedtopatch", error);
            return res.status(500).json({ status: 0, message: error });
        }

        return res.status(200).json({ status: 1, data: data });
    } catch (error) {
        console.log("tasks_creation_error", error)
        return res.status(500).json({ status: 0, message: "Failed to create task." });
    }
})


module.exports ={ router }
