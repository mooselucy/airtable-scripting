output.markdown('# Update the main table!');
let main_table = base.getTable('Main');
let checklist_table = base.getTable('Checklist');

let check_items = await checklist_table.selectRecordsAsync();
let main_items = await main_table.selectRecordsAsync();

let fing_status = main_table.getField("Status").options.choices;
let digit_status = main_table.getField("Digit").options.choices;
let people_status = main_table.getField("Assignee(s)").options.choices;

// output.table(fing_status);
// output.table(digit_status);
// output.table(people_status);

//most hecking convoluted script just to check columns >_> stupid airtable
let dict = {}
let motorlist = [];
for (let check of check_items.records){
    let motor = check.getCellValue("Serial Number");
    if (!(motorlist.includes(motor))){
        motorlist.push(motor);
    }
}
let mainlist = []
for (let main of main_items.records){
    mainlist.push(main.getCellValue("Serial Number"));
}
let i = 0;
for (let item of motorlist){
    if (!(mainlist.includes(item))){
        await main_table.createRecordsAsync([
                {
                    fields: {
                        "Serial Number": item
                    }
                }
            ])
    }
}//>_< now that every serial item is in
for (let main of main_items.records){
    dict[main.getCellValue("Serial Number")] = main.id;
}
//this is the options for the single select columns (you have to add the persons name before this works.. I will putpeopls names)
//let fing_status = main_table.getField("temp").options.choices;

let recordid = '';
for (let item of motorlist){
    let respeople = [];
    let digit = {};
    let stage = {};
    let people = [];
    let date = "";
    stage = fing_status[0];
    for (let check of check_items.records){
        if (check.getCellValue("Serial Number") == item){
            digit = check.getCellValue("Type");
            //putting peple in
            if (respeople.indexOf(check.getCellValueAsString("Assignee")) == -1 && (check.getCellValueAsString("Assignee") != '')){
                respeople.push(check.getCellValueAsString("Assignee"));
            }
            //status of the motor
            //this is for rotator and fingers only -- calibration (order number is specific, CHANGE IT IF STATIC LISTS CHNAGE)
            if (check.getCellValue("Stage") == "1. Calibration" && check.getCellValue("Order") == "7" && (check.getCellValueAsString("Assignee") != "") && ((check.getCellValue("Type") == "Finger" || check.getCellValue("Type") == "Rotator"))){
                stage = fing_status[2];
            } 
            // this is for flexors -- calibration
            else if (check.getCellValue("Stage") == "1. Calibration" && check.getCellValue("Order") == "8" && (check.getCellValueAsString("Assignee") != "") && check.getCellValue("Type") == "Flexor"){
                stage = fing_status[2];
            }
            // doesnt matter for flexor -- worm gear part
            else if (check.getCellValue("Stage") == "2. Worm Gear Assembly" && (check.getCellValue("Order") == "7" || check.getCellValue("Order") == "8") && (check.getCellValueAsString("Assignee") != "")){
               stage = fing_status[1];
            }
            // for fingers -- drivetrain part
            else if (check.getCellValue("Stage") == "3. Drive Train Assembly" && check.getCellValue("Order") == "8" && check.getCellValue("Type") == "Finger" && (check.getCellValueAsString("Assignee") != "")){
                stage = fing_status[3];
            }
            //for flexor + rotator -- drivetrain part
            else if (check.getCellValue("Stage") == "3. Drive Train Assembly" && (check.getCellValue("Order") == "8" || check.getCellValue("Order") == "5") && (check.getCellValue("Type") == "Rotator" || check.getCellValue("Type") == "Flexor") && (check.getCellValueAsString("Assignee")!= "")){
                stage = fing_status[3];
            }
            //for fingers only -- in finger
            else if (check.getCellValue("Stage") == "4. Finger Assembly" && check.getCellValue("Order") == "5" && check.getCellValue("Type") == "Finger" && (check.getCellValueAsString("Assignee")!= "")){
                stage = fing_status[4];
            } //for sensorized fingers (fingers only)
            if (check.getCellValue("Type") == "Finger"){
                digit = digit_status[0];
            }
            if (check.getCellValue("Stage") == "5. Sensor Cable Assembly" && check.getCellValue("Order") == "5" && check.getCellValue("Type") == "Finger" && (check.getCellValueAsString("Assignee")!= "")){
                digit = digit_status[1]; 
            }
            if (check.getCellValue("Type") == "Rotator"){
                digit = digit_status[2];
            }
            if (check.getCellValue("Type") == "Flexor"){
                digit = digit_status[3];
            }
            if (check.getCellValue("Time Done") != ""){
                date = check.getCellValue("Time Done");
            }
        }

    }
    for (var e = 0; e < respeople.length; e++){
        for (var d = 0; d < people_status.length; d++){
            if (respeople[e] == people_status[d].name){
                people.push({id:people_status[d].id, name: people_status[d].name});
            }
        }
    }
    // output.table(stage);
    // output.table(digit);
    await main_table.updateRecordAsync(dict[item], {
                "Digit": {id: digit.id, name: digit.name},
                "Status": {id: stage.id, name: stage.name},
                "Assignee(s)": people,
                "Last Modified": date
            })
}
output.markdown("# Done Updating! Check out the Main table");