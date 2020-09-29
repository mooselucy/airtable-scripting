// pick tables from your base here
let main_table= base.getTable('Main'); //Motor numbers are here
let fing_tasks_table = base.getTable('static_tasks'); // this is constant
let rot_tasks_table = base.getTable('rotator_tasks');
let flex_tasks_table = base.getTable('flexor_tasks');
let checklist_table = base.getTable('Checklist'); //we want to group them in here

let check_table = await checklist_table.selectRecordsAsync();
let finger_task = await fing_tasks_table.selectRecordsAsync();
let rotator_task = await rot_tasks_table.selectRecordsAsync();
let flexor_task = await flex_tasks_table.selectRecordsAsync();

//CASES THAT COULD BREAK THIS:
//If a motor is already in here
//Type it wrong?, nah its fine

//UI
output.markdown('# New Motor Assembly');
let motor_number = await input.textAsync('Serial Number for this motor: (FORMAT EXAMPLE: 19MTR001)');

for (let check of check_table.records){
    if (motor_number == check.getCellValue("Serial Number")){
        output.text("Are you sure you put in the right motor number? There is already a record for this! Try again.");
        let motor_number = await input.textAsync('Serial Number for this motor: (FORMAT EXAMPLE: 19MTR001)');
        break;
    }
}
for (let check of check_table.records){
    if (motor_number == check.getCellValue("Serial Number")){
        output.text("Are you ONE HUNDRED PERCENT SURE you put in the right motor number? There is already a record for this! Re-run the goddamn script >_> #easteregg");
        // @ts-ignore
        return;
    }
}


//What finger?
let type_of_finger = await input.buttonsAsync(
    'What kind of finger is it?',
    [
        {label: 'Regular Finger', value: 'fing'},
        {label: 'Thumb Rotator', value: 'rot'},
        {label: 'Thumb Flexor', value: 'flex'}
    ],
);
//Put the correct tasklist for the specific finger
if (type_of_finger == 'fing'){
    for (let record of finger_task.records) {
        let tasks = record.getCellValue("Tasks"); //Tasks from the static table
        let stage = record.getCellValue("Stage");
        let order = record.getCellValue("Order");
        await checklist_table.createRecordsAsync([
            {
                fields: {
                    "To-Do": tasks,
                    "Serial Number": motor_number,
                    "Stage":stage,
                    "Order":order,
                    "Type": 'Finger'
                }
            }
        ])
    }
} else if (type_of_finger == 'rot') {
        for (let record of rotator_task.records) {
        let tasks = record.getCellValue("Tasks"); //Tasks from the static table
        let stage = record.getCellValue("Stage");
        let order = record.getCellValue("Order");
        await checklist_table.createRecordsAsync([
            {
                fields: {
                    "To-Do": tasks,
                    "Serial Number": motor_number,
                    "Stage":stage,
                    "Order":order,
                    "Type": 'Rotator'
                }
            }
        ])
    }
} else {
        for (let record of flexor_task.records) {
        let tasks = record.getCellValue("Tasks"); //Tasks from the static table
        let stage = record.getCellValue("Stage");
        let order = record.getCellValue("Order");
        await checklist_table.createRecordsAsync([
            {
                fields: {
                    "To-Do": tasks,
                    "Serial Number": motor_number,
                    "Stage":stage,
                    "Order":order,
                    "Type": 'Flexor'
                }
            }
        ])
    }
}


// create the project - change the field name to one in your base

output.text('Done!');