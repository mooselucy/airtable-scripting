// pick tables from your base here
let main_table= base.getTable('Main'); //Motor numbers are here
//static_task stuff
let fing_tasks_table = base.getTable('static_tasks');
let rot_tasks_table = base.getTable('rotator_tasks');
let flex_tasks_table = base.getTable('flexor_tasks');
let checklist_table = base.getTable('Checklist') //we want to group them in here

//s_tasks
let finger_task = await fing_tasks_table.selectRecordsAsync();
let rotator_task = await rot_tasks_table.selectRecordsAsync();
let flexor_task = await flex_tasks_table.selectRecordsAsync();

let m_columns = await main_table.selectRecordsAsync();
let c_tasks = await checklist_table.selectRecordsAsync();

let history_table = base.getTable("History");
let history_tasks = await history_table.selectRecordsAsync();
//UI
output.markdown('# Using an old motor? Archive the previous records!');
output.text("This also updates the tasks in the static tasks list to the corresponding motor, but it shouldn't be used that way.")
let motor_number = await input.textAsync('Serial Number for this motor: (FORMAT EXAMPLE: 19MTR001)');
for (let check of c_tasks.records){
    if (motor_number != check.getCellValue("Serial Number")){
        output.text("Are you sure you put in the right motor number? I can't find this motor! Try again.");
        let motor_number = await input.textAsync('Serial Number for this motor: (FORMAT EXAMPLE: 19MTR001)');
        break;
    }
}
for (let check of c_tasks.records){
    if (motor_number != check.getCellValue("Serial Number")){
        output.text("Are you ONE HUNDRED PERCENT SURE you put in the right motor number? Try again >_>");
        // @ts-ignore
        return;
    }
}
let shouldContinue = await input.buttonsAsync(
    'Which process are you re-doing?',
    [
        {label: 'Need to solder wires to encoder board and calibrate (the whole process)', value: 'reset_2'},
        {label: 'Only encoder case came loose', value: 'reset_7'},
        {label: 'None! The encode case is fine and calibrated', value: 'noreset'}
    ],
);
//check what kind of motor it is... rotator, flexor or whatever
let fing_type = null;
for (let record of c_tasks.records){
    let c_serial = record.getCellValue("Serial Number");
    let c_type = record.getCellValue("Type");
    if (motor_number == c_serial){
        fing_type = c_type;
        break
    }
}
//setting variable to te specific table
let fing_table = null
if (fing_type = 'Finger') {
    fing_table = finger_task;
} else if (fing_type = 'Rotator'){
    fing_table = rotator_task;
} else if (fing_type = 'Flexor'){
    fing_table = flexor_task;
}
//counts # of records there are that includes the original motor number
let count = 0
for (let record of history_tasks.records){
    let h_serial = record.getCellValue("Serial Number");
    if (h_serial.includes(motor_number)){
        count++;
    }
}
let static_len = fing_table.records.length;
let motor_number_hist = motor_number;
if (count >= static_len){
    let ee = String(Math.floor(count/static_len));
    motor_number_hist = motor_number.concat('_', ee);
}
output.text("The motor in history table is called" + motor_number_hist);
    //Moving current stuff to history
output.text("Putting stuff in history.....")
for (let record of c_tasks.records){
    let c_serial = record.getCellValue("Serial Number");
    if (c_serial == motor_number){
        let c_task = record.getCellValue("To-Do");
        let c_assignee = record.getCellValueAsString("Assignee");
        let c_QC = record.getCellValueAsString("QC Approver");
        let c_date = record.getCellValue("Time Done");
        let c_stage = record.getCellValue("Stage");
        let c_order = record.getCellValue("Order");
        let c_type = record.getCellValue("Type");
        await history_table.createRecordsAsync([
            {
                fields: {
                    "Tasks": c_task,
                    "Assignee": c_assignee,
                    "QC Approver": c_QC,
                    "Serial Number": motor_number_hist,
                    "Date Done": c_date,
                    "Stage":c_stage,
                    "Order":c_order,
                    "Type": c_type
                }
            }
        ])
        //deleting everything thats not calibration and wormgear
        if (c_stage != "1. Calibration" && c_stage != "2. Worm Gear Assembly"){
            checklist_table.deleteRecordAsync(record.id);
        }
        //if resets
        if (shouldContinue == "reset_2"){
            if (c_stage == "1. Calibration" && parseInt(c_order) > 2){  //if the static_tasks list changes, check this
                await checklist_table.updateRecordAsync(record.id, {
                    "Assignee": null,
                    "QC Approver": null
                })
            }
        } else if (shouldContinue == "reset_7"){
            let x = 0;
            if (fing_type == 'Flexor'){
                x = 7;
            } else{
                x = 6
            }
            if (c_stage == "1. Calibration" && parseInt(c_order) > x){ //if the static_tasks list changes, check this
                await checklist_table.updateRecordAsync(record.id, {
                    "Assignee": null,
                    "QC Approver": null,
                    "Time Done": null
                })
            }
        }
    }
}
//putting in the updated tasks!
output.text("Updating the current motor status.......");
for (let record of fing_table.records){
    let tasks = record.getCellValue("Tasks"); //Tasks from the static table
    let stage = record.getCellValue("Stage");
    let order = record.getCellValue("Order");
    let typ = record.getCellValue("Type");
    if (stage != "1. Calibration" && stage != "2. Worm Gear Assembly"){
        await checklist_table.createRecordsAsync([
            {
                fields: {
                    "To-Do": tasks,
                    "Serial Number": motor_number,
                    "Stage":stage,
                    "Order":order,
                    "Type":typ
                }
            }
        ])
    }
}
// if (shouldContinue == 'reset_2'){
//     for (let record of c_tasks.records){
//         let recordID = record.id
//         let stage = record.getCellValue("Stage");
//         let order = record.getCellValue("Order");
//         let motor = record.getCellValue("Serial Number");
//         if (stage == "1. Calibration" && parseInt(order) > 2 && motor == motor_number){  //if the static_tasks list changes, check this
//             await checklist_table.updateRecordAsync(recordID, {
//                 "Assignee": null,
//                 "QC Approver": null
//             })
//         }
//     }
//     for (let record of fing_table.records) { //<<<<<<<<<<<<<<<<
//         let tasks = record.getCellValue("Tasks"); //Tasks from the static table
//         let stage = record.getCellValue("Stage");
//         let order = record.getCellValue("Order");
//         let typ = record.getCellValue("Type");
//         if (!(stage == "1. Calibration" || stage == "2. Worm Gear Assembly")){
//             await checklist_table.createRecordsAsync([
//                 {
//                     fields: {
//                         "To-Do": tasks,
//                         "Serial Number": motor_number,
//                         "Stage":stage,
//                         "Order":order,
//                         "Type":typ
//                     }
//                 }
//             ])
//         }
//     }
// }
// if (shouldContinue == 'reset_7'){
//     for (let record of c_tasks.records){
//         if (record.getCellValueAsString("Assignee") == null && record.getCellValue("Stage") == "3. Drive Train Assembly"){
//             break
//         }
//         let recordID = record.id
//         let stage = record.getCellValue("Stage");
//         let order = record.getCellValue("Order");
//         let motor = record.getCellValue("Serial Number")
//         let x = 0;
//         if (fing_type == 'Flexor'){
//             x = 7;
//         } else{
//             x = 6
//         }
//         if (stage == "1. Calibration" && parseInt(order) > x && motor == motor_number){ //if the static_tasks list changes, check this
//             await checklist_table.updateRecordAsync(recordID, {
//                 "Assignee": null,
//                 "QC Approver": null
//             })
//         }
//     }
//     for (let record of fing_table.records) { //<<<<<<<<<<<<<<<<
//         let tasks = record.getCellValue("Tasks"); //Tasks from the static table
//         let stage = record.getCellValue("Stage");
//         let order = record.getCellValue("Order");
//         let typ = record.getCellValue("Type");
//         if (!(stage == "1. Calibration" || stage == "2. Worm Gear Assembly")){
//             await checklist_table.createRecordsAsync([
//                 {
//                     fields: {
//                         "To-Do": tasks,
//                         "Serial Number": motor_number,
//                         "Stage":stage,
//                         "Order":order,
//                         "Type":typ
//                     }
//                 }
//             ])
//         }
//     }
// }
output.text('Finished Updating!');
