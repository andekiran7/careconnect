// seed.js – default data loaded into localStorage on first visit

export const SEED_USERS = [
  // Admins
  { id:'u1', name:'Suresh Menon',     email:'admin@demo.com', password:'demo1234', role:'ADMIN',   phone:'+91 98765 99999', city:'Hyderabad', active:true, createdAt:'2025-01-01' },
  // Doctors
  { id:'u2', name:'Dr. Ande',   email:'ande@demo.com', password:'demo1234', role:'DOCTOR',  phone:'+91 98765 00001', city:'Hyderabad',   active:true, createdAt:'2025-01-05' },
  { id:'u3', name:'Dr. Rahul Mehta',  email:'rahul@demo.com', password:'demo1234', role:'DOCTOR',  phone:'+91 98765 00002', city:'Bangalore', active:true, createdAt:'2025-01-10' },
  { id:'u4', name:'Dr. Ananya Das',   email:'ananya@demo.com',password:'demo1234', role:'DOCTOR',  phone:'+91 98765 00003', city:'Delhi',     active:true, createdAt:'2025-01-12' },
  { id:'u5', name:'Dr. Suresh Kumar', email:'sureshdr@demo.com',password:'demo1234',role:'DOCTOR', phone:'+91 98765 00004', city:'Hyderabad', active:true, createdAt:'2025-01-15' },
  { id:'u6', name:'Dr. Kavita Singh', email:'kavita@demo.com',password:'demo1234', role:'DOCTOR',  phone:'+91 98765 00005', city:'Pune',      active:true, createdAt:'2025-01-18' },
  { id:'u7', name:'Dr. Farhan Sheikh',email:'farhan@demo.com',password:'demo1234', role:'DOCTOR',  phone:'+91 98765 00006', city:'Bangalore', active:true, createdAt:'2025-02-01' },
  { id:'u8', name:'Dr. Meera Pillai', email:'meera@demo.com', password:'demo1234', role:'DOCTOR',  phone:'+91 98765 00007', city:'Mumbai',    active:true, createdAt:'2025-02-10' },
  // Patients
  { id:'u9',  name:'Kiran',    email:'kiran@demo.com', password:'demo1234', role:'PATIENT', phone:'+91 98765 43210', city:'Hyderabad',    active:true, createdAt:'2025-03-01' },
  { id:'u10', name:'Riya Patel',      email:'riya@demo.com',  password:'demo1234', role:'PATIENT', phone:'+91 98765 43211', city:'Ahmedabad', active:true, createdAt:'2025-03-05' },
  { id:'u11', name:'David Moses',     email:'david@demo.com', password:'demo1234', role:'PATIENT', phone:'+91 98765 43212', city:'Kochi',     active:true, createdAt:'2025-03-10' },
];

export const SEED_PROFILES = [
  { doctorId:'u2', specialization:'Cardiology',  qualification:'MBBS, MD (Cardio)',   experience:10, fee:800,  hospital:'Apollo Hospital',           city:'Chennai',   approvalStatus:'APPROVED', rating:4.8, totalReviews:124, about:'Senior Cardiologist with 10 years of experience in interventional cardiology and heart failure management. Visiting consultant at Apollo and Fortis.' },
  { doctorId:'u3', specialization:'Neurology',   qualification:'MBBS, DM Neurology',  experience:8,  fee:900,  hospital:'Fortis Hospital',            city:'Bangalore', approvalStatus:'APPROVED', rating:4.6, totalReviews:87,  about:'Neurologist with expertise in epilepsy, stroke management, and movement disorders. Published researcher with 15+ papers.' },
  { doctorId:'u4', specialization:'Dermatology', qualification:'MBBS, DVD',           experience:6,  fee:600,  hospital:'AIIMS',                      city:'Delhi',     approvalStatus:'APPROVED', rating:4.9, totalReviews:210, about:'Dermatologist known for treating chronic skin conditions, acne, psoriasis, and cosmetic dermatology procedures.' },
  { doctorId:'u5', specialization:'Orthopaedics',qualification:'MBBS, MS Orthopaedics',experience:12,fee:700,  hospital:'Yashoda Hospitals',          city:'Hyderabad', approvalStatus:'APPROVED', rating:4.7, totalReviews:98,  about:'Orthopaedic surgeon specialising in joint replacement, sports injuries, and spinal disorders. Over 2000 surgeries performed.' },
  { doctorId:'u6', specialization:'Paediatrics', qualification:'MBBS, DCH, DNB',      experience:9,  fee:500,  hospital:"Rainbow Children's Hospital", city:'Pune',      approvalStatus:'APPROVED', rating:4.9, totalReviews:302, about:'Paediatrician with a warm, child-friendly approach. Specialises in newborn care, vaccinations, and growth disorders.' },
  { doctorId:'u7', specialization:'Psychiatry',  qualification:'MBBS, MD Psychiatry', experience:7,  fee:1000, hospital:'NIMHANS',                    city:'Bangalore', approvalStatus:'PENDING',  rating:4.5, totalReviews:42,  about:'Psychiatrist focusing on anxiety disorders, depression, OCD, and ADHD in both adults and adolescents.' },
  { doctorId:'u8', specialization:'Gynaecology', qualification:'MBBS, MS Gynaecology',experience:14, fee:850,  hospital:'Lilavati Hospital',          city:'Mumbai',    approvalStatus:'APPROVED', rating:4.7, totalReviews:185, about:'Gynaecologist with expertise in high-risk pregnancy, infertility, and advanced laparoscopic surgeries.' },
];

// Generate slots for next 10 days from today
function genSlots() {
  const slots = [];
  const today = new Date();
  const allTimes = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];
  const doctors = ['u2','u3','u4','u5','u6','u8'];
  let id = 1;
  doctors.forEach(docId => {
    for (let d = 0; d < 12; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      if (date.getDay() === 0) continue; // skip Sundays
      const dateStr = date.toISOString().split('T')[0];
      // pick 6-8 random times
      const times = [...allTimes].sort(() => Math.random() - .5).slice(0, 7);
      times.sort().forEach(time => {
        slots.push({ id:`sl${id++}`, doctorId:docId, date:dateStr, startTime:time, endTime:addMin(time,30), status:'AVAILABLE' });
      });
    }
  });
  return slots;
}

function addMin(t, m) {
  const [h,min] = t.split(':').map(Number);
  const tot = h*60+min+m;
  return `${String(Math.floor(tot/60)).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`;
}

export const SEED_SLOTS = genSlots();

export const SEED_APPOINTMENTS = [
  { id:'ap1', patientId:'u9',  doctorId:'u2', slotId:null, date:'2026-03-05', startTime:'09:00', endTime:'09:30', status:'COMPLETED', patientNotes:'Experiencing chest tightness after climbing stairs.', doctorNotes:'ECG normal. Advised lifestyle changes and low-sodium diet. Follow-up in 4 weeks.', fee:800, createdAt:'2026-02-28' },
  { id:'ap2', patientId:'u9',  doctorId:'u3', slotId:null, date:'2026-03-08', startTime:'14:00', endTime:'14:30', status:'COMPLETED', patientNotes:'Frequent headaches on left side for 2 weeks.', doctorNotes:'Likely tension headache. Prescribed paracetamol. MRI advised if persists.', fee:900, createdAt:'2026-03-01' },
  { id:'ap3', patientId:'u9',  doctorId:'u4', slotId:null, date:'2026-02-20', startTime:'10:00', endTime:'10:30', status:'CANCELLED', patientNotes:'', doctorNotes:'', fee:600, createdAt:'2026-02-15' },
  { id:'ap4', patientId:'u10', doctorId:'u2', slotId:null, date:'2026-03-05', startTime:'10:00', endTime:'10:30', status:'COMPLETED', patientNotes:'High BP monitoring', doctorNotes:'BP 145/90. Started amlodipine 5mg. Monthly follow-up.', fee:800, createdAt:'2026-02-28' },
  { id:'ap5', patientId:'u11', doctorId:'u5', slotId:null, date:'2026-03-06', startTime:'15:00', endTime:'15:30', status:'COMPLETED', patientNotes:'Knee pain after sports', doctorNotes:'ACL sprain grade 1. Physiotherapy for 6 weeks. Avoid running.', fee:700, createdAt:'2026-03-02' },
];

export const SEED_REVIEWS = [
  { id:'rv1', patientId:'u9',  doctorId:'u2', appointmentId:'ap1', rating:5, comment:'Dr. Ande is excellent! Very thorough and explained everything clearly. Highly recommended.', createdAt:'2026-03-06', patientName:'Kiran' },
  { id:'rv2', patientId:'u9',  doctorId:'u3', appointmentId:'ap2', rating:4, comment:'Good consultation. Dr. Rahul was patient and answered all my questions.', createdAt:'2026-03-09', patientName:'Kiran' },
  { id:'rv3', patientId:'u10', doctorId:'u2', appointmentId:'ap4', rating:5, comment:'Wonderful doctor. Very caring and professional.', createdAt:'2026-03-06', patientName:'Riya Patel' },
  { id:'rv4', patientId:'u11', doctorId:'u5', appointmentId:'ap5', rating:5, comment:'Dr. Suresh is brilliant. Fixed my knee issue with a clear treatment plan.', createdAt:'2026-03-07', patientName:'David Moses' },
];

export const SPECIALIZATIONS = ['All','Cardiology','Neurology','Dermatology','Orthopaedics','Paediatrics','Psychiatry','Gynaecology','General Physician'];
export const CITIES = ['All Cities','Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kochi','Ahmedabad','Kolkata'];
