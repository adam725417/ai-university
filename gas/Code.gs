/** AI University game backend for Google Sheets
 *  v2: 學期 → 課程 → 班級 → 學生
 *  相容舊版 Responses：setup() 會「追加」缺少欄位，不會刪除既有資料。
 */
const RESPONSE_SHEET='Responses';
const REQUIRED_HEADERS=[
  'recordId','formVersion','name','startedAt','submittedAt','receivedAt','xp','completedLevelsJson','answersJson','userAgent','updatedAt',
  'termId','termLabel','courseId','courseLabel','classId','classLabel'
];

function setup(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let s=ss.getSheetByName(RESPONSE_SHEET);
  if(!s)s=ss.insertSheet(RESPONSE_SHEET);
  ensureHeaders_(s);
  s.setFrozenRows(1);
  s.getRange(1,1,1,s.getLastColumn()).setFontWeight('bold').setBackground('#EAF7FF');
  s.autoResizeColumns(1,s.getLastColumn());
}

function doGet(){return json_({ok:true,service:'ai-university-game-api',schema:'academic-v2',time:new Date().toISOString()})}
function doPost(e){
  try{
    const b=JSON.parse(e?.postData?.contents||'{}');
    if(b.action==='submit')return json_(submit_(b));
    if(b.action==='list')return json_(list_(b));
    return json_({ok:false,error:'Unknown action'});
  }catch(err){return json_({ok:false,error:String(err.message||err)})}
}

function submit_(b){
  const name=clean_(b.name);if(!name)throw new Error('缺少姓名');
  if(!b.answers||typeof b.answers!=='object')throw new Error('缺少 answers');
  const ctx={
    termId:clean_(b.termId),termLabel:clean_(b.termLabel),
    courseId:clean_(b.courseId),courseLabel:clean_(b.courseLabel),
    classId:clean_(b.classId),classLabel:clean_(b.classLabel)
  };
  if(!ctx.termId||!ctx.courseId||!ctx.classId)throw new Error('缺少學期／課程／班級資訊，請使用老師提供的專屬連結');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const ss=SpreadsheetApp.getActiveSpreadsheet();let s=ss.getSheetByName(RESPONSE_SHEET);
    if(!s)s=ss.insertSheet(RESPONSE_SHEET);
    const headers=ensureHeaders_(s),map=headerMap_(headers),data=s.getDataRange().getValues(),version=clean_(b.formVersion)||'default';
    let row=-1;
    for(let i=1;i<data.length;i++){
      const r=data[i];
      if(String(r[map.formVersion]||'')===version &&
         String(r[map.termId]||'')===ctx.termId &&
         String(r[map.courseId]||'')===ctx.courseId &&
         String(r[map.classId]||'')===ctx.classId &&
         String(r[map.name]||'').trim().toLowerCase()===name.toLowerCase()){
        row=i+1;break;
      }
    }
    const id=row>0?String(data[row-1][map.recordId]||Utilities.getUuid()):Utilities.getUuid(),now=new Date();
    const obj={
      recordId:id,formVersion:version,name:name,startedAt:clean_(b.startedAt),submittedAt:clean_(b.submittedAt),receivedAt:now,
      xp:Number(b.xp||0),completedLevelsJson:JSON.stringify(b.completedLevels||[]),answersJson:JSON.stringify(b.answers||{}),
      userAgent:clean_(b.userAgent),updatedAt:now,
      termId:ctx.termId,termLabel:ctx.termLabel,courseId:ctx.courseId,courseLabel:ctx.courseLabel,classId:ctx.classId,classLabel:ctx.classLabel
    };
    const values=headers.map(h=>Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:'');
    if(row>0)s.getRange(row,1,1,values.length).setValues([values]);else s.appendRow(values);
    return{ok:true,recordId:id,updated:row>0,academicContext:ctx};
  }finally{lock.releaseLock()}
}

function list_(b){
  assertTeacher_(b.password);
  const ss=SpreadsheetApp.getActiveSpreadsheet();let s=ss.getSheetByName(RESPONSE_SHEET);
  if(!s)return{ok:true,responses:[]};
  const headers=ensureHeaders_(s),map=headerMap_(headers),rows=s.getDataRange().getValues(),version=clean_(b.formVersion),termId=clean_(b.termId),courseId=clean_(b.courseId),classId=clean_(b.classId);
  const responses=rows.slice(1).map(r=>({
    recordId:String(r[map.recordId]||''),formVersion:String(r[map.formVersion]||''),name:String(r[map.name]||''),
    startedAt:iso_(r[map.startedAt]),submittedAt:iso_(r[map.submittedAt]),receivedAt:iso_(r[map.receivedAt]),xp:Number(r[map.xp]||0),
    completedLevels:parse_(r[map.completedLevelsJson],[]),answers:parse_(r[map.answersJson],{}),updatedAt:iso_(r[map.updatedAt]),
    termId:String(r[map.termId]||''),termLabel:String(r[map.termLabel]||''),courseId:String(r[map.courseId]||''),courseLabel:String(r[map.courseLabel]||''),classId:String(r[map.classId]||''),classLabel:String(r[map.classLabel]||'')
  })).filter(r=>(!version||r.formVersion===version)&&(!termId||r.termId===termId)&&(!courseId||r.courseId===courseId)&&(!classId||r.classId===classId));
  return{ok:true,responses:responses};
}

function ensureHeaders_(s){
  if(s.getLastRow()===0||s.getLastColumn()===0){s.getRange(1,1,1,REQUIRED_HEADERS.length).setValues([REQUIRED_HEADERS]);return REQUIRED_HEADERS.slice()}
  let headers=s.getRange(1,1,1,s.getLastColumn()).getValues()[0].map(v=>String(v||'').trim());
  const missing=REQUIRED_HEADERS.filter(h=>!headers.includes(h));
  if(missing.length){s.getRange(1,headers.length+1,1,missing.length).setValues([missing]);headers=headers.concat(missing)}
  return headers;
}
function headerMap_(headers){const m={};headers.forEach((h,i)=>m[h]=i);return m}
function assertTeacher_(p){const expected=PropertiesService.getScriptProperties().getProperty('TEACHER_PASSWORD');if(!expected)throw new Error('尚未設定 TEACHER_PASSWORD');if(String(p||'')!==expected)throw new Error('教師密碼錯誤')}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function clean_(v){return v==null?'':String(v).trim()}
function parse_(s,f){try{return JSON.parse(String(s||''))}catch(e){return f}}
function iso_(v){try{return v instanceof Date?v.toISOString():String(v||'')}catch(e){return String(v||'')}}
