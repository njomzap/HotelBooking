const db = require('../db'); 

exports.createExtraRequest = async (req, res) => {
    try{
        const{ booking_id, request_text } = req.body;

        if(!booking_id || !request_text ){
            return res.status(400).json({message: "Missing required fields"});
        }

        const [result] = await db.query(
            "insert into extra_requests (booking_id, request_text) values (?, ?)",
            [booking_id, request_text]
        );

        res.status(201).json({
            message: "Extra request added successfully", 
            id: result.insertId,
        });
    } catch(error){
        console.error("Create extra request error: " , error);
        res.status(500).json({message: "Server error"});
    }
};

exports.getRequestsByBooking = async(req, res) => {
    try{
        const{bookingId} = req.params;

        const[rows] = await db.query(
            "select * from extra_requests where booking_id=?",
            [bookingId]
        );

        res.json(rows);
    } catch(error){
        console.error("Get extra requests error: ", error);
        res.status(500).json({messsage: "Server error"});
    }
};

exports.updateExtraRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { request_text } = req.body;

    const [result] = await db.query(
      "UPDATE extra_requests SET request_text = ? WHERE id = ?",
      [request_text, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Extra request updated" });
  } catch (error) {
    console.error("Update extra request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteExtraRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM extra_requests WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Extra request deleted" });
  } catch (error) {
    console.error("Delete extra request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};