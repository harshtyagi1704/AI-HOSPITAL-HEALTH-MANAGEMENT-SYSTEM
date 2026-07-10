import { useEffect, useState } from "react";
import api from "../services/api";

const empty={name:"",email:"",phone:"",password:"",role:"patient",department:""};

export default function UserModal({open,onClose,editingUser,refreshUsers}){
 const [form,setForm]=useState(empty);
 const [saving,setSaving]=useState(false);
 useEffect(()=>{
   if(editingUser){
     setForm({...empty,...editingUser,password:""});
   }else setForm(empty);
 },[editingUser,open]);
 if(!open) return null;
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 const submit=async(e)=>{
   e.preventDefault();
   setSaving(true);
   try{
     if(editingUser){
       await api.put(`/users/${editingUser._id}`,form);
     }else{
       await api.post("/users",form);
     }
     await refreshUsers();
     onClose();
   }catch(err){
     alert(err.response?.data?.message||"Operation failed");
   }finally{setSaving(false)}
 };
 return (
 <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
  <form onSubmit={submit} style={{background:"#fff",padding:24,borderRadius:12,width:500,maxWidth:"95%"}}>
   <h2>{editingUser?"Edit User":"Add User"}</h2>
   {["name","email","phone"].map(f=><input key={f} name={f} value={form[f]} onChange={change} placeholder={f} style={{width:"100%",padding:10,margin:"8px 0"}}/>)}
   {!editingUser&&<input type="password" name="password" value={form.password} onChange={change} placeholder="Password" style={{width:"100%",padding:10,margin:"8px 0"}}/>}
   <select name="role" value={form.role} onChange={change} style={{width:"100%",padding:10,margin:"8px 0"}}>
    <option value="patient">Patient</option><option value="doctor">Doctor</option><option value="reception">Reception</option><option value="admin">Admin</option>
   </select>
   <input name="department" value={form.department||""} onChange={change} placeholder="Department" style={{width:"100%",padding:10,margin:"8px 0"}}/>
   <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:15}}>
    <button type="button" onClick={onClose}>Cancel</button>
    <button type="submit">{saving?"Saving...":editingUser?"Update":"Create"}</button>
   </div>
  </form>
 </div>);
}