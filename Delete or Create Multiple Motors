// @ts-nocheck
// pick tables from your base here
let main_table= base.getTable('Main'); //Motor numbers are here
//static_task stuff
let fing_tasks_table = base.getTable('static_tasks');
let rot_tasks_table = base.getTable('rotator_tasks');
let flex_tasks_table = base.getTable('flexor_tasks');
let checklist_table = base.getTable('Checklist'); //we want to group them in here
let production_table = base.getTable('Production Motors');

//s_tasks
let finger_task = await fing_tasks_table.selectRecordsAsync();
let rotator_task = await rot_tasks_table.selectRecordsAsync();
let flexor_task = await flex_tasks_table.selectRecordsAsync();

let m_columns = await main_table.selectRecordsAsync();
let c_tasks = await checklist_table.selectRecordsAsync();
let p_tasks = await production_table.selectRecordsAsync();

//UI
output.markdown('# Delete or Create Multiple');
output.text('Make sure you have update the Main table before deleting and after creating new motors!');
let motor_string = await input.textAsync("Multiple motors? Separate them in commas");
let motor_arr = motor_string.split(",");
let currmotorlist = []
for (let record of m_columns.records){
    currmotorlist.push(record.getCellValue("Serial Number"));
}
let givenList = []
let canCreate = []
let canDelete = []
for (let item of motor_arr){
    item = item.replace(/ /g, ''); //removes blank spaces anyhere
    if (!(currmotorlist.includes(item))){
        canCreate.push(item);
    } else{
        canDelete.push(item);
    }
    givenList.push(item);
}
let whatdo = await input.buttonsAsync(
    'Delete or Create Motor?',
    [
        {label: 'Delete These Motors', value: 'delete'},
        {label: 'Create new Motors', value: 'create'},
    ],
);
output.table(canCreate);
output.table(canDelete);
if (whatdo == 'delete'){
    let notInTable = [];
    for (let i = 0; i < givenList.length; i++){
        if (!(canDelete.includes(givenList[i]))){
            notInTable.push(givenList[i]);
        }
    }
    if (notInTable.length > 1){
        output.text("These weren't able to be deleted");
        output.table(notInTable);
    }
    for (let i = 0; i < canDelete.length; i++){
        motor = canDelete[i];
        for (let record of c_tasks.records){
            let serial = record.getCellValue('Serial Number');
            if (serial == motor){
                let recordid = record.id;
                await checklist_table.deleteRecordAsync(recordid);
            }
        }
        for (let record of p_tasks.records){
            let serial = record.getCellValue('Serial Number');
            if (serial == motor){
                let recordid = record.id;
                await production_table.deleteRecordAsync(recordid);
            }
        }
    }
}
if (whatdo == 'create'){
    let alreadyIn = [];
    for (let i = 0; i < givenList.length; i++){
        if (!(canCreate.includes(givenList[i]))){
            alreadyIn.push(givenList[i]);
        }
    }
    if (alreadyIn.length > 1){
        output.text("These are already created or there was an error");
        output.table(alreadyIn);
    }
    let createDict = {};
    let val = 0;
    for (let i = 0; i < canCreate.length; i++){
        let type_of_finger = await input.buttonsAsync(
        'What kind of finger is it? Motor: ' + canCreate[i],
            [
                {label: 'Regular Finger', value: 'fing'},
                {label: 'Thumb Rotator', value: 'rot'},
                {label: 'Thumb Flexor', value: 'flex'}
            ],
        );
        if (type_of_finger == 'fing'){
            val = 1;
        } else if (type_of_finger == 'rot'){
            val = 2;
        } else {
            val = 3;
        }
        createDict[canCreate[i]] = val;
    }
    output.table(createDict);
    for (let key in createDict){
        let value = createDict[key];
        _table = checklist_table;
        if (key.includes('20MTR')){
            let stre = key.replace("20MTR",""); 
            if (parseInt(stre) > 30){
                _table = production_table;
            }
        }
        if (value == 1){
            for (let record of finger_task.records) {
                let tasks = record.getCellValue("Tasks"); //Tasks from the static table
                let stage = record.getCellValue("Stage");
                let order = record.getCellValue("Order");
                await _table.createRecordsAsync([
                    {
                        fields: {
                            "To-Do": tasks,
                            "Serial Number": key,
                            "Stage":stage,
                            "Order":order,
                            "Type": 'Finger'
                        }
                    }
                ])
            }
        } else if (value == 2) {
                for (let record of rotator_task.records) {
                let tasks = record.getCellValue("Tasks"); //Tasks from the static table
                let stage = record.getCellValue("Stage");
                let order = record.getCellValue("Order");
                await _table.createRecordsAsync([
                    {
                        fields: {
                            "To-Do": tasks,
                            "Serial Number": key,
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
                await _table.createRecordsAsync([
                    {
                        fields: {
                            "To-Do": tasks,
                            "Serial Number": key,
                            "Stage":stage,
                            "Order":order,
                            "Type": 'Flexor'
                        }
                    }
                ])
            }
        }
    }
}
output.text("Done " + whatdo + "ing");

