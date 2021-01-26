output.markdown('Delete this record!');
let checklist_table = base.getTable('Checklist');
let c_table = await checklist_table.selectRecordsAsync();
let motor_number = await input.textAsync('Serial Number for this motor: (FORMAT EXAMPLE: 19MTR001)');

for (let record of c_table.records){
    let serial = record.getCellValue('Serial Number');
    if (serial == motor_number){
        let recordid = record.id;
        await checklist_table.deleteRecordAsync(recordid);
    }
}
